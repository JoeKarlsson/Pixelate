import { averageBlocks, blockGrid, fitWithin, pixelatedFileName, saveSize } from './pixelate-math.js?v=3';

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
// The original picture's size, so Save PNG can write it at full resolution.
let originalWidth = 0;
let originalHeight = 0;

function render() {
  if (!sourcePixels) return;
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
  originalWidth = image.width;
  originalHeight = image.height;
  fileName = name;
  canvas.setAttribute('aria-label', `${name}, pixelated`);
  downloadButton.disabled = false;
  render();
}

// After a file that can't be used: drop the old picture so Save can't write it by mistake.
function clearImage(message) {
  sourcePixels = null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.setAttribute('aria-label', 'No picture loaded');
  downloadButton.disabled = true;
  status.textContent = message;
}

async function loadFile(file) {
  if (!file.type.startsWith('image/')) {
    clearImage(`${file.name} isn't an image. Pick a JPEG, PNG, WebP or GIF.`);
    return;
  }
  try {
    // Decodes the file as an image only; nothing in it is ever run or uploaded.
    const image = await createImageBitmap(file);
    useImage(image, file.name);
    image.close();
    status.textContent = `Pixelating ${file.name}`;
  } catch (error) {
    clearImage(`Couldn't open ${file.name} as an image (${error.message}).`);
  }
}

fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (file) loadFile(file);
});

blockSizeInput.addEventListener('input', render);

// Saves at the original photo's size: the block grid is stretched up without smoothing,
// so the blocks look the same as on screen, just with more pixels each.
downloadButton.addEventListener('click', () => {
  if (!sourcePixels) return;
  const { width, height, capped } = saveSize(originalWidth, originalHeight);
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const outputContext = output.getContext('2d');
  outputContext.imageSmoothingEnabled = false;
  outputContext.drawImage(grid, 0, 0, grid.width, grid.height, 0, 0, width, height);
  output.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Saving failed: the browser could not encode the image.';
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = pixelatedFileName(fileName);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    status.textContent = capped
      ? `Saved at ${width}×${height}, the largest size this page saves (your photo is ${originalWidth}×${originalHeight}).`
      : `Saved ${link.download} at ${width}×${height}.`;
    window.plausible?.('Download');
  }, 'image/png');
});

const demo = new Image();
demo.addEventListener('load', () => useImage(demo, 'lil-bub.jpg'));
demo.addEventListener('error', () => {
  status.textContent = 'The example picture failed to load. Choose your own photo above.';
});
demo.src = 'img/lil-bub.jpg';

// Copy link, for the share row in the footer.
const copyLinkButton = document.getElementById('copy-link');
const shareStatus = document.getElementById('share-status');
copyLinkButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('https://pixelate.joekarlsson.com/');
    shareStatus.textContent = 'Link copied.';
    window.plausible?.('Share', { props: { network: 'copy' } });
  } catch (error) {
    shareStatus.textContent = `Couldn't copy the link (${error.message}). It's https://pixelate.joekarlsson.com/`;
  }
});
