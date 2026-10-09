// Convert FBX models (Quaternius's older packs ship FBX only) to .glb in headless Chromium with three's FBXLoader and
// GLTFExporter, printing each model's clips, materials and size. Then slim them with scripts/prep-model.mjs.
// Usage: npm run serve (other shell), then node scripts/fbx-to-glb.mjs <dir with .fbx, inside the repo> <out dir>
import { createRequire } from 'node:module';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const [src, out] = process.argv.slice(2), BASE = process.env.BASE || 'http://localhost:8080/';
if (!src || !out) { console.error('usage: node scripts/fbx-to-glb.mjs <fbx dir in the repo> <out dir>'); process.exit(1); }
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--disable-background-networking', '--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('page error:', e.message));
await page.goto(`${BASE}scripts/fbx-to-glb.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.ready);
for (const f of readdirSync(src).filter((x) => x.toLowerCase().endsWith('.fbx'))) {
  const { info, b64 } = await page.evaluate((u) => window.convert(u), `${BASE}${src.replace(/^\.?\//, '')}/${encodeURIComponent(f)}`);
  const dst = `${out}/${f.replace(/\.fbx$/i, '').replace(/ /g, '_')}.glb`;
  writeFileSync(dst, Buffer.from(b64, 'base64'));
  console.log(dst, JSON.stringify(info));
}
await browser.close();
