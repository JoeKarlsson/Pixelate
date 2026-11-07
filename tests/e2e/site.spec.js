import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const fixture = new URL('../../site/img/lil-bub.jpg', import.meta.url).pathname;

function watchForErrors(page) {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`failed: ${request.url()}`));
  return errors;
}

// Hash of the canvas pixels, to see that the picture changed.
const canvasFingerprint = (page) => page.locator('#canvas').evaluate((canvas) => canvas.toDataURL().length + ':' + canvas.width);

test('home page loads the example picture without errors', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Pixelate');
  await expect.poll(() => page.locator('#canvas').evaluate((c) => c.width)).toBe(1280);
  expect(errors).toEqual([]);
});

test('slider changes the block size', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => page.locator('#canvas').evaluate((c) => c.width)).toBe(1280);
  const before = await canvasFingerprint(page);
  await page.locator('#block-size').fill('80');
  await expect(page.locator('#block-size-value')).toHaveText('80px');
  expect(await canvasFingerprint(page)).not.toBe(before);
});

test('choosing a photo pixelates it and saving downloads a PNG', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file').setInputFiles({ name: 'my cat.jpg', mimeType: 'image/jpeg', buffer: await readFile(fixture) });
  await expect(page.locator('#status')).toHaveText('Pixelating my cat.jpg');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#download').click()]);
  expect(download.suggestedFilename()).toBe('my cat-pixelated.png');
  const bytes = await readFile(await download.path());
  expect(bytes.subarray(1, 4).toString()).toBe('PNG');
});

test('a file that is not an image is refused', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(page.locator('#status')).toContainText("notes.txt isn't an image");
});

test('a broken image file reports an error', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not really a png') });
  await expect(page.locator('#status')).toContainText("Couldn't open broken.png");
});

for (const path of ['/', '/no-such-page']) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('missing pages get the 404 page, marked noindex', async ({ page }) => {
  await page.goto('/no-such-page');
  await expect(page.locator('h1')).toHaveText('Not found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('metadata is complete', async ({ page, request }) => {
  await page.goto('/');
  const head = page.locator('head');
  for (const selector of [
    'link[rel="canonical"]', 'meta[name="description"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]',
    'meta[name="color-scheme"][content="only dark"]', 'meta[name="darkreader-lock"]', 'link[rel="manifest"]',
  ]) {
    await expect(head.locator(selector), selector).toHaveCount(1);
  }
  expect((await head.locator('meta[name="description"]').getAttribute('content')).length).toBeLessThan(160);
  await expect(page.locator('h1')).toHaveCount(1);
  for (const path of ['/img/share.png', '/img/apple-touch-icon.png', '/img/icon-192.png', '/img/icon-512.png', '/img/favicon-32.png', '/favicon.svg', '/robots.txt', '/sitemap.xml', '/.well-known/security.txt']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

for (const width of [320, 390]) {
  test(`no sideways scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect.poll(() => page.locator('#canvas').evaluate((c) => c.width)).toBe(1280);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test('content stays in the centered column at 2560px', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1400 });
  await page.goto('/');
  await expect.poll(() => page.locator('#canvas').evaluate((c) => c.width)).toBe(1280);
  const left = (2560 - 1440) / 2;
  for (const selector of ['h1', '.controls', '#canvas', '.page-footer p']) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box.x, selector).toBeGreaterThanOrEqual(left - 1);
    expect(box.x + box.width, selector).toBeLessThanOrEqual(left + 1440 + 1);
  }
});
