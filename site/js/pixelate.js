import { averageBlocks, blockGrid, fitWithin, pixelatedFileName } from './pixelate-math.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const fileInput = document.getElementById('file');
const blockSizeInput = document.getElementById('block-size');
const blockSizeOutput = document.getElementById('block-size-value');
const downloadButton = document.getElementById('download');
const status = document.getElementById('status');

// The source picture, already scaled to the working size, drawn smooth.
const source = document.createElement('canvas');
const sourceContext = source.getContext('2d', { willReadFrequently: true });
let sourcePixels = null;
// The small grid of blocks, one pixel per block, stretched back up without smoothing.
const grid = document.createElement('canvas');
const gridContext = grid.getContext('2d');

let fileName = 'lil-bub.jpg';

function render() {
  const blockSize = Number(blockSizeInput.value);
  blockSizeOutput.value = `${blockSize}px`;
  const { columns, rows } = blockGrid(source.width, source.height, blockSize);
  grid.width = columns;
  grid.height = rows;
  const blocks = averageBlocks(sourcePixels, source.width, source.height, columns, rows);
  gridContext.putImageData(new ImageData(blocks, columns, rows), 0, 0);
  canvas.width = source.width;
  canvas.height = source.height;
  context.imageSmoothingEnabled = false;
  context.drawImage(grid, 0, 0, columns, rows, 0, 0, canvas.width, canvas.height);
}

function useImage(image, name) {
  const { width, height } = fitWithin(image.width, image.height);
  source.width = width;
  source.height = height;
  sourceContext.drawImage(image, 0, 0, width, height);
  sourcePixels = sourceContext.getImageData(0, 0, width, height).data;
  fileName = name;
  canvas.setAttribute('aria-label', `${name}, pixelated`);
  render();
}

async function loadFile(file) {
  if (!file.type.startsWith('image/')) {
    status.textContent = `${file.name} isn't an image. Pick a JPEG, PNG, WebP or GIF.`;
    return;
  }
  try {
    // Decodes the file as an image only; nothing in it is ever run or uploaded.
    const image = await createImageBitmap(file);
    useImage(image, file.name);
    image.close();
    status.textContent = `Pixelating ${file.name}`;
  } catch (error) {
    status.textContent = `Couldn't open ${file.name} as an image (${error.message}).`;
  }
}

fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (file) loadFile(file);
});

blockSizeInput.addEventListener('input', render);

downloadButton.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Saving failed: the browser could not encode the image.';
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = pixelatedFileName(fileName);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    window.plausible?.('Download');
  }, 'image/png');
});

const demo = new Image();
demo.addEventListener('load', () => useImage(demo, 'lil-bub.jpg'));
demo.addEventListener('error', () => {
  status.textContent = 'The example picture failed to load. Choose your own photo above.';
});
demo.src = 'img/lil-bub.jpg';
