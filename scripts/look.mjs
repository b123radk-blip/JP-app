// Quick look at a few cards while designing them: each card at a few moments, cropped to the animation, in one sheet.
// Optionally tries a recipe from a JSON file ({ id: effect }) instead of the cards' own.
// Usage: npm run serve (other shell), then node scripts/look.mjs 5148,8a71 [--recipes try.json] [--out .cache/look.jpg] [--one]
// A key "5148~b" shows card 5148 with the recipe under "5148~b" in --recipes (a key missing from the file is an error).
// --times -1,0.5,2: seconds relative to the last stroke; a:b:step adds a strip (--times 0:6:0.5); default: mid-strokes,
//   just after, idle (--one: idle only, four per row). --cols n: tiles per row (default: one row per card).
// --cam x,y,d: look at (x, y) metres from the middle of the card from d metres away (default 0,0,1.22: the learner's seat).
// --clip x,y,w,h: the part of the 760x620 page to keep. Default: fitted per card to the kanji and everything its scene
//   shows at the chosen moments (at least 110,85,540,265, the old fixed crop; --no-fit keeps that one).
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const list = (s) => s.split(',').map(Number);
if (!process.argv[2] || process.argv[2].startsWith('--')) {
  console.log('usage: node scripts/look.mjs <id[,id~key...]> [--recipes try.json] [--times -0.4,1,0:6:0.5] [--one] [--cols n] [--cam x,y,d] [--clip x,y,w,h | --no-fit] [--out .cache/look.jpg]');
  process.exit(1);
}
const BASE = process.env.BASE || 'http://localhost:8080/', OUT = arg('--out', '.cache/look.jpg'), W = 760, H = 620, DEFAULT = [110, 85, 540, 265];
const times = arg('--times')?.split(',').flatMap((s) => {
  if (!s.includes(':')) return [Number(s)];
  const [a, b, step] = s.split(':').map(Number), out = [];
  for (let x = a; x <= b + 1e-9; x += step || 1) out.push(Math.round(x * 100) / 100);
  return out;
}) ?? null;
const cam = list(arg('--cam') ?? '0,0,1.22'), fixed = arg('--clip') ? list(arg('--clip')) : process.argv.includes('--no-fit') ? DEFAULT : null;
const one = process.argv.includes('--one'), ids = process.argv[2].split(','), tries = arg('--recipes') ? JSON.parse(readFileSync(arg('--recipes'), 'utf8')) : {};
const missing = ids.filter((k) => k.includes('~') && !tries[k]);
if (missing.length) { console.log(`no recipe for ${missing.join(', ')} in ${arg('--recipes') ?? '(no --recipes file)'}`); process.exit(1); }
const per = times ? times.length : one ? 1 : 3, cols = Number(arg('--cols')) || (one ? 4 : per);

// the crop: the scene's screen box, padded, at least the default crop, widened to its aspect and kept on the page
function fit(boxes) {
  const pad = 14, d = { x0: DEFAULT[0], y0: DEFAULT[1], x1: DEFAULT[0] + DEFAULT[2], y1: DEFAULT[1] + DEFAULT[3] };
  for (const b of boxes) if (Number.isFinite(b?.x0)) { d.x0 = Math.min(d.x0, b.x0 - pad); d.y0 = Math.min(d.y0, b.y0 - pad); d.x1 = Math.max(d.x1, b.x1 + pad); d.y1 = Math.max(d.y1, b.y1 + pad); }
  let w = Math.min(W, d.x1 - d.x0), h = Math.min(H, d.y1 - d.y0);
  const aspect = DEFAULT[2] / DEFAULT[3];
  if (w / h < aspect) w = Math.min(W, h * aspect); else h = Math.min(H, w / aspect);
  const x = Math.max(0, Math.min(W - w, (d.x0 + d.x1) / 2 - w / 2)), y = Math.max(0, Math.min(H - h, (d.y0 + d.y1) / 2 - h / 2));
  return [x, y, w, h].map(Math.round);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
let errors = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
const frame = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const tiles = [], issues = [];
for (const key of ids) {
  const id = key.split('~')[0], r = tries[key] ? `&recipe=${encodeURIComponent(JSON.stringify(tries[key]))}` : '';
  errors = [];
  await page.goto(`${BASE}?preview=1&cards=${id}&card=${id}&t=0${r}`, { waitUntil: 'load' });
  try { await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 30000 }); }
  catch { issues.push(`${key}: did not load\n  ${[...new Set(errors)].join('\n  ')}`); continue; }
  await page.addStyleTag({ content: '#ui, #footer { display: none !important; }' });
  await page.evaluate(([x, y, d]) => { const { kit } = window.__app.app; kit.camera.position.set(x, 1.42 + y, -1.2 + d); kit.controls.target.set(x, 1.42 + y, -1.2); kit.controls.update(); }, cam);
  const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
  const shots = [], boxes = [];
  for (const t of times ? times.map((x) => end + x) : one ? [end + 2.2] : [end * 0.55, end + 0.9, end + 3.2]) {
    await page.evaluate((x) => window.__app.seek(x), t); await frame();
    boxes.push(await page.evaluate(() => window.__app.app.screen.player?.bounds?.()));
    const buf = await page.screenshot({ type: 'jpeg', quality: 80 });
    shots.push({ t, src: `data:image/jpeg;base64,${buf.toString('base64')}` });
  }
  const clip = fixed ?? fit(boxes), off = shots.filter((s, i) => boxes[i] && (boxes[i].x0 < 0 || boxes[i].x1 > W || boxes[i].y0 < 0 || boxes[i].y1 > H));
  if (off.length) issues.push(`${key}: the scene reaches past the edge of the ${W}x${H} preview at end${off.map((s) => `${s.t >= end ? '+' : ''}${(s.t - end).toFixed(1)}`).join(', end')}`);
  for (const s of shots) tiles.push({ key, label: `${key}  end${s.t >= end ? '+' : ''}${(s.t - end).toFixed(1)}`, clip, src: s.src });
  if (errors.length) issues.push(`${key}:\n  ${[...new Set(errors)].join('\n  ')}`);
}
// each tile shows its card's crop of the full-page shot (one crop per card, so its frames line up)
const tile = ({ label, clip: [x, y, w, h], src }) => `<div style="position:relative;overflow:hidden;padding-top:${(h / w) * 100}%"><img src="${src}" style="position:absolute;width:${(W / w) * 100}%;left:${(-x / w) * 100}%;top:${(-y / h) * 100}%"><span style="position:absolute;left:4px;top:2px;color:#fff;background:#0009;font:13px monospace">${label}</span></div>`;
const sheet = await browser.newPage({ viewport: { width: 1500, height: 300 } });
await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px;align-items:start">${tiles.map(tile).join('')}</body>`);
await sheet.waitForFunction(() => [...document.images].every((i) => i.complete));
mkdirSync(dirname(OUT), { recursive: true });
await sheet.screenshot({ path: OUT, type: 'jpeg', quality: 75, fullPage: true });
console.log(`${OUT} (${ids.length} cards, ${tiles.length} frames)`);
if (issues.length) console.log(`CONSOLE ISSUES:\n${issues.join('\n')}`);
await browser.close();
