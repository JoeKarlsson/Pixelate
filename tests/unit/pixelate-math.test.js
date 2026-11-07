import { test } from 'node:test';
import assert from 'node:assert/strict';
import { averageBlocks, blockGrid, fitWithin, pixelatedFileName, saveSize } from '../../site/js/pixelate-math.js';

test('fitWithin leaves small images alone', () => {
  assert.deepEqual(fitWithin(1280, 853, 2000), { width: 1280, height: 853 });
});

test('fitWithin scales the longest side down to the limit', () => {
  assert.deepEqual(fitWithin(4000, 3000, 2000), { width: 2000, height: 1500 });
  assert.deepEqual(fitWithin(3000, 6000, 2000), { width: 1000, height: 2000 });
});

test('fitWithin keeps a sliver at least one pixel wide', () => {
  assert.deepEqual(fitWithin(10000, 1, 2000), { width: 2000, height: 1 });
});

test('fitWithin rejects empty images', () => {
  assert.throws(() => fitWithin(0, 100), RangeError);
});

test('blockGrid counts blocks across and down', () => {
  assert.deepEqual(blockGrid(1280, 853, 24), { columns: 53, rows: 36 });
});

test('blockGrid at block size 1 keeps every pixel', () => {
  assert.deepEqual(blockGrid(1280, 853, 1), { columns: 1280, rows: 853 });
});

test('blockGrid never drops below one block', () => {
  assert.deepEqual(blockGrid(40, 30, 120), { columns: 1, rows: 1 });
});

test('blockGrid rejects block sizes under one', () => {
  assert.throws(() => blockGrid(100, 100, 0), RangeError);
  assert.throws(() => blockGrid(100, 100, Number.NaN), RangeError);
});

test('pixelatedFileName swaps the extension for -pixelated.png', () => {
  assert.equal(pixelatedFileName('holiday photo.JPG'), 'holiday photo-pixelated.png');
  assert.equal(pixelatedFileName('archive.tar.gz'), 'archive.tar-pixelated.png');
  assert.equal(pixelatedFileName('noext'), 'noext-pixelated.png');
  assert.equal(pixelatedFileName(''), 'image-pixelated.png');
});

test('averageBlocks averages each block on its own', () => {
  // 2x2 image: red, blue / red, blue -> 2 columns, 1 row
  const pixels = new Uint8ClampedArray([255,0,0,255, 0,0,255,255, 255,0,0,255, 0,0,255,255]);
  assert.deepEqual([...averageBlocks(pixels, 2, 2, 2, 1)], [255,0,0,255, 0,0,255,255]);
  assert.deepEqual([...averageBlocks(pixels, 2, 2, 1, 1)], [128,0,128,255]);
});

test('averageBlocks keeps uneven edge blocks the same color as the image', () => {
  const white = new Uint8ClampedArray(5 * 3 * 4).fill(255);
  assert.ok(averageBlocks(white, 5, 3, 2, 2).every((value) => value === 255));
});

test('averageBlocks rejects a buffer of the wrong size', () => {
  assert.throws(() => averageBlocks(new Uint8ClampedArray(4), 2, 2, 1, 1), RangeError);
});

test('saveSize keeps a 3000px photo at full size', () => {
  assert.deepEqual(saveSize(3000, 2000), { width: 3000, height: 2000, capped: false });
});

test('saveSize caps the longest side', () => {
  assert.deepEqual(saveSize(16000, 2000, 8000, Infinity), { width: 8000, height: 1000, capped: true });
});

test('saveSize caps the area for iOS canvases', () => {
  const { width, height, capped } = saveSize(8000, 6000);
  assert.ok(capped);
  assert.ok(width * height <= 16_777_216, `${width}x${height}`);
  assert.ok(Math.abs(width / height - 8000 / 6000) < 0.01);
});
