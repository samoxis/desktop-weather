import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Telemetry } from './src/telemetry.mjs';

const publicDir = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

export function createServer({ telemetry, port = 4783 }) {
  const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (!allowedHosts.has(req.headers.host)) { res.writeHead(403).end('Invalid host'); return; }
    if (req.headers.origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(req.headers.origin)) { res.writeHead(403).end('Invalid origin'); return; }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Bad URL'); return; }
    if (pathname === '/api/telemetry') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(telemetry.snapshot()));
      return;
    }
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').includes('..')) { res.writeHead(403).end(); return; }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const target = path.resolve(publicDir, relative);
    if (!target.startsWith(publicDir + path.sep) && target !== path.join(publicDir, 'index.html')) { res.writeHead(403).end(); return; }
    try {
      const data = await readFile(target);
      res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404).end('Not found'); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.DW_PORT || 4783);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('DW_PORT must be 1024..65535');
  const telemetry = new Telemetry({ gpu: !process.argv.includes('--no-gpu'), networkInterface: process.env.DW_INTERFACE || null });
  const server = createServer({ telemetry, port });
  server.on('error', error => { telemetry.close(); console.error(`Cannot start: ${error.code}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Desktop Weather: http://127.0.0.1:${port}\nMove the browser to your sensor screen and press F11. Ctrl+C stops the collector.`));
  const stop = () => { telemetry.close(); server.close(); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
