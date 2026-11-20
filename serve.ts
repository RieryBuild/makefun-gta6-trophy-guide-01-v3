// Vice Ledger static server: serves app/ for local try-outs and screenshots.
// Node 22, standard library only. Usage: node serve.ts [port]  (default 8080).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = resolve(join(fileURLToPath(import.meta.url), '..', 'app'));
const PORT = Number(process.argv[2] || 8080);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const joined = normalize(join(APP_ROOT, decoded === '/' ? 'index.html' : decoded));
  if (!joined.startsWith(APP_ROOT + sep) && joined !== APP_ROOT) return null;
  return joined;
}

const server = createServer(async (req, res) => {
  try {
    const filePath = safePath(req.url || '/');
    if (!filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    const bytes = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': CONTENT_TYPES[extname(filePath)] || 'application/octet-stream' });
    res.end(bytes);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('Vice Ledger serving app/ at http://localhost:' + PORT + '/');
});
