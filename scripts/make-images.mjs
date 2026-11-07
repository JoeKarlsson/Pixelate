// Renders the share card and the PNG icons from the site's own markup. Run: npm run images
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = new URL('../site/', import.meta.url);
const svg = await readFile(new URL('favicon.svg', site), 'utf8');
const photo = (await readFile(new URL('img/lil-bub.jpg', site))).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();

for (const [name, size] of [['favicon-32', 32], ['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: new URL(`img/${name}.png`, site).pathname });
}

// Share card: the example photo pixelated the same way the tool does it, with the name over it.
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`
<body style="margin:0;background:#0b0b0b;width:1200px;height:630px;overflow:hidden">
  <canvas id="c" width="1200" height="630" style="image-rendering:pixelated;display:block"></canvas>
  <h1 style="position:absolute;left:56px;bottom:40px;margin:0;font:900 170px/1 system-ui,sans-serif;color:#ff4fd8;background:#0b0b0b;padding:8px 28px 22px">Pixelate</h1>
  <script>
    const img = new Image();
    img.onload = () => {
      const grid = document.createElement('canvas');
      grid.width = 1200 / 30; grid.height = 630 / 30;
      const scale = Math.max(grid.width / img.width, grid.height / img.height);
      const w = img.width * scale, h = img.height * scale;
      grid.getContext('2d').drawImage(img, (grid.width - w) / 2, (grid.height - h) / 2, w, h);
      const ctx = document.getElementById('c').getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(grid, 0, 0, 1200, 630);
      document.body.dataset.ready = '1';
    };
    img.src = 'data:image/jpeg;base64,${photo}';
  </script>
</body>`);
await page.waitForSelector('body[data-ready]');
await page.screenshot({ path: new URL('img/share.png', site).pathname });
await browser.close();
console.log('Wrote share.png and icons to site/img/');
