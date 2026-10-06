// Quick look at a few cards while designing them: each card at three moments (mid-strokes, just after, idle), cropped to
// the animation, in one sheet. Optionally tries a recipe from a JSON file ({ id: effect }) instead of the cards' own.
// Usage: npm run serve (other shell), then node scripts/look.mjs 5148,8a71 [--recipes try.json] [--out .cache/look.jpg] [--one]
// --one: a single moment per card (idle), four per row. A key "5148~b" shows card 5148 with the recipe under that key.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = process.env.BASE || 'http://localhost:8080/', OUT = arg('--out', '.cache/look.jpg');
const one = process.argv.includes('--one'), ids = process.argv[2].split(','), tries = arg('--recipes') ? JSON.parse(readFileSync(arg('--recipes'), 'utf8')) : {};
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 760, height: 620 } }), errors = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
const tiles = [];
for (const key of ids) {
  const id = key.split('~')[0], r = tries[key] ? `&recipe=${encodeURIComponent(JSON.stringify(tries[key]))}` : '';
  await page.goto(`${BASE}?preview=1&cards=${id}&card=${id}&t=0${r}`, { waitUntil: 'load' });
  await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 30000 });
  await page.addStyleTag({ content: '#ui, #footer { display: none !important; }' });
  await page.evaluate(() => { const { kit } = window.__app.app; kit.camera.position.set(0, 1.42, 0.02); kit.controls.target.set(0, 1.42, -1.2); kit.controls.update(); });
  const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
  for (const t of one ? [end + 2.2] : [end * 0.55, end + 0.9, end + 3.2]) {
    await page.evaluate((x) => window.__app.seek(x), t); await page.waitForTimeout(100);
    const buf = await page.screenshot({ type: 'jpeg', quality: 72, clip: { x: 110, y: 85, width: 540, height: 265 } });
    tiles.push({ id: key, t: t.toFixed(1), src: `data:image/jpeg;base64,${buf.toString('base64')}` });
  }
}
const sheet = await browser.newPage({ viewport: { width: 1500, height: 300 } });
await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${one ? 4 : 3},1fr);gap:2px">${tiles.map((x) => `<div style="position:relative"><img src="${x.src}" style="width:100%;display:block"><span style="position:absolute;left:4px;top:2px;color:#fff;background:#0009;font:13px monospace">${x.id} t=${x.t}</span></div>`).join('')}</body>`);
mkdirSync(dirname(OUT), { recursive: true });
await sheet.screenshot({ path: OUT, type: 'jpeg', quality: 75, fullPage: true });
console.log(`${OUT} (${ids.length} cards)`);
if (errors.length) console.log(`CONSOLE ISSUES:\n${[...new Set(errors)].join('\n')}`);
await browser.close();
