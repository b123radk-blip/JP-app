// Quick look at a few cards while designing them: each card at three moments (mid-strokes, just after, idle), cropped to
// the animation, in one sheet. Optionally tries a recipe from a JSON file ({ id: effect }) instead of the cards' own.
// Usage: npm run serve (other shell), then node scripts/look.mjs 5148,8a71 [--recipes try.json] [--out .cache/look.jpg] [--one]
// --one: a single moment per card (idle), four per row; --times -1,0.5,2: seconds relative to the last stroke. A key "5148~b" shows card 5148 with the recipe under that key.
// --cam x,y,d: look at (x, y) metres from the middle of the card from d metres away (default 0,0,1.22: the learner's seat).
// --clip x,y,w,h: the part of the 760x620 page to keep (default 110,85,540,265: the animation; 0,0,760,620: everything).
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = process.env.BASE || 'http://localhost:8080/', OUT = arg('--out', '.cache/look.jpg');
const cam = (arg('--cam') ?? '0,0,1.22').split(',').map(Number), clip = (arg('--clip') ?? '110,85,540,265').split(',').map(Number), times = arg('--times') ? arg('--times').split(',').map(Number) : null, one = process.argv.includes('--one'), ids = process.argv[2].split(','), tries = arg('--recipes') ? JSON.parse(readFileSync(arg('--recipes'), 'utf8')) : {};
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
  try { await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 30000 }); }
  catch (e) { console.log(`${key}: did not load\n${[...new Set(errors)].join('\n')}`); continue; }
  await page.addStyleTag({ content: '#ui, #footer { display: none !important; }' });
  await page.evaluate(([x, y, d]) => { const { kit } = window.__app.app; kit.camera.position.set(x, 1.42 + y, -1.2 + d); kit.controls.target.set(x, 1.42 + y, -1.2); kit.controls.update(); }, cam);
  const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
  for (const t of times ? times.map((x) => end + x) : one ? [end + 2.2] : [end * 0.55, end + 0.9, end + 3.2]) {
    await page.evaluate((x) => window.__app.seek(x), t); await page.waitForTimeout(100);
    const buf = await page.screenshot({ type: 'jpeg', quality: 72, clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3] } });
    tiles.push({ id: key, t: t.toFixed(1), src: `data:image/jpeg;base64,${buf.toString('base64')}` });
  }
}
const sheet = await browser.newPage({ viewport: { width: 1500, height: 300 } });
await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${times ? times.length : one ? 4 : 3},1fr);gap:2px">${tiles.map((x) => `<div style="position:relative"><img src="${x.src}" style="width:100%;display:block"><span style="position:absolute;left:4px;top:2px;color:#fff;background:#0009;font:13px monospace">${x.id} t=${x.t}</span></div>`).join('')}</body>`);
mkdirSync(dirname(OUT), { recursive: true });
await sheet.screenshot({ path: OUT, type: 'jpeg', quality: 75, fullPage: true });
console.log(`${OUT} (${ids.length} cards)`);
if (errors.length) console.log(`CONSOLE ISSUES:\n${[...new Set(errors)].join('\n')}`);
await browser.close();
