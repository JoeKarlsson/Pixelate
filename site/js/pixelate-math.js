// Pure size math for Pixelate, kept apart from the DOM so it can be unit tested.

// Largest side the working canvas uses. A 12-megapixel phone photo at full size makes
// every slider move slow, and the pixelated result doesn't need the extra detail.
export const MAX_WORKING_SIDE = 2000;

// Scales width x height down so the longer side is at most maxSide. Never scales up.
export function fitWithin(width, height, maxSide = MAX_WORKING_SIDE) {
  if (!(width > 0) || !(height > 0)) {
    throw new RangeError(`Image size must be positive, got ${width}x${height}`);
  }
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

// Largest picture Save PNG writes. iOS Safari refuses canvases over about 16.7 million
// pixels, and 8000px on a side is past what any phone camera takes.
export const MAX_SAVE_SIDE = 8000;
export const MAX_SAVE_AREA = 16_777_216;

// Size to save a width x height original at: full size, unless that's over the side or
// area limit, in which case scaled down to fit both. `capped` says whether it shrank.
export function saveSize(width, height, maxSide = MAX_SAVE_SIDE, maxArea = MAX_SAVE_AREA) {
  let size = fitWithin(width, height, maxSide);
  if (size.width * size.height > maxArea) {
    const scale = Math.sqrt(maxArea / (size.width * size.height));
    size = { width: Math.max(1, Math.floor(size.width * scale)), height: Math.max(1, Math.floor(size.height * scale)) };
  }
  return { ...size, capped: size.width !== width || size.height !== height };
}

// How many blocks across and down a width x height image becomes when each block is
// blockSize pixels square. At least one block each way, so huge blocks give one flat color.
export function blockGrid(width, height, blockSize) {
  if (!(blockSize >= 1)) {
    throw new RangeError(`Block size must be at least 1, got ${blockSize}`);
  }
  return {
    columns: Math.max(1, Math.round(width / blockSize)),
    rows: Math.max(1, Math.round(height / blockSize)),
  };
}

// "holiday photo.JPG" -> "holiday photo-pixelated.png"
export function pixelatedFileName(originalName) {
  const base = String(originalName || '').replace(/\.[^.]*$/, '').trim();
  return `${base || 'image'}-pixelated.png`;
}

// Averages RGBA pixels into a columns x rows grid of blocks. Each block covers an even
// share of the image (edges included), so no block mixes in pixels from outside it.
// Returns the grid as RGBA bytes, one pixel per block.
export function averageBlocks(pixels, width, height, columns, rows) {
  if (pixels.length !== width * height * 4) {
    throw new RangeError(`Expected ${width * height * 4} bytes for ${width}x${height}, got ${pixels.length}`);
  }
  const out = new Uint8ClampedArray(columns * rows * 4);
  for (let row = 0; row < rows; row++) {
    const top = Math.floor((row * height) / rows);
    const bottom = Math.max(top + 1, Math.floor(((row + 1) * height) / rows));
    for (let column = 0; column < columns; column++) {
      const left = Math.floor((column * width) / columns);
      const right = Math.max(left + 1, Math.floor(((column + 1) * width) / columns));
      let r = 0, g = 0, b = 0, a = 0;
      for (let y = top; y < bottom; y++) {
        let i = (y * width + left) * 4;
        for (let x = left; x < right; x++, i += 4) {
          r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; a += pixels[i + 3];
        }
      }
      const count = (bottom - top) * (right - left);
      const o = (row * columns + column) * 4;
      out[o] = r / count; out[o + 1] = g / count; out[o + 2] = b / count; out[o + 3] = a / count;
    }
  }
  return out;
}
