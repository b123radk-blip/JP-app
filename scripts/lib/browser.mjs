// Headless Chromium for the review scripts (orbit.mjs, check-piece-costs.mjs), in the cloud (global Playwright, browser
// in /opt/pw-browsers) or on a PC (npm's playwright after `npx playwright install chromium`), plus a static server for the
// repo when nothing answers on BASE, so no `npm run serve` is needed.
import { createRequire } from 'node:module';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const GLOBAL = '/opt/node22/lib/node_modules/', CLOUD_CHROME = '/opt/pw-browsers/chromium';
export const BASE = process.env.BASE || 'http://localhost:8080/';

export async function launch() {
  const { chromium } = existsSync(`${GLOBAL}playwright`) ? createRequire(`${GLOBAL}_`)('playwright') : await import('playwright');
  const executablePath = process.env.CHROME || (existsSync(CLOUD_CHROME) ? CLOUD_CHROME : undefined);
  // software WebGL: the same pictures on every machine, with or without a GPU
  return chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.txt': 'text/plain' };
// serve the repo on BASE's port unless a server already answers there; returns the server (null if one was running)
export async function ensureServer(base = BASE) {
  try { await fetch(base); return null; } catch { /* nothing there: serve it ourselves */ }
  const root = resolve('.'), srv = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, base).pathname); if (p.endsWith('/')) p += 'index.html';
    const f = join(root, p);
    if (!f.startsWith(root + sep) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] ?? 'application/octet-stream' }); createReadStream(f).pipe(res);
  });
  await new Promise((ok, fail) => srv.once('error', fail).listen(Number(new URL(base).port || 80), ok));
  srv.unref(); return srv;
}

// what went wrong on a page that never got ready: page errors, console errors, requests that failed or returned >= 400
export function watchPage(page) {
  const seen = [];
  page.on('pageerror', (e) => seen.push(`page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') seen.push(`console: ${m.text()}`); });
  page.on('requestfailed', (r) => seen.push(`failed: ${r.url()} (${r.failure()?.errorText})`));
  page.on('response', (r) => { if (r.status() >= 400) seen.push(`HTTP ${r.status()}: ${r.url()}`); });
  return (why) => `${why}\n${[...new Set(seen)].slice(0, 30).join('\n') || '(no errors seen: the page may just be slow)'}`;
}
