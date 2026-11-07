// Serves site/ like GitHub Pages does (index.html for folders, 404.html for misses), for tests.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../site/', import.meta.url).pathname;
const port = Number(process.env.PORT || 47391);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

async function resolveFile(urlPath) {
  const path = normalize(join(root, decodeURIComponent(urlPath)));
  if (!path.startsWith(root)) return null;
  try {
    const info = await stat(path);
    return info.isDirectory() ? join(path, 'index.html') : path;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const urlPath = new URL(request.url, 'http://localhost').pathname;
  const file = await resolveFile(urlPath);
  try {
    if (!file) throw new Error('missing');
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': types['.html'] });
    response.end(await readFile(join(root, '404.html')));
  }
}).listen(port, () => console.log(`Serving site/ at http://localhost:${port}/`));
