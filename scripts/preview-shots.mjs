// Screenshots of every card's animation through the preview page (?preview=1), plus one contact sheet to compare them.
// Usage: npm run serve (other shell), then npm run preview-shots [-- 65e5,706b]   -> docs/screenshots/preview/*.jpg, preview-sheet.jpg
// Two moments per card: halfway through the strokes, and 2.5 s after the last stroke (emblem out, idle motion running).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const BASE = process.env.BASE || 'http://localhost:8080/', OUT = process.env.OUT || 'docs/screenshots';
mkdirSync(`${OUT}/preview`, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 760, height: 620 } });
const errors = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${BASE}?preview=1&t=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__app?.ready === true && window.__app.info().player);
await page.addStyleTag({ content: '#ui, #footer { display: none !important; }' });
await page.evaluate(() => { const { kit } = window.__app.app; kit.camera.position.set(0, 1.42, 0.02); kit.controls.target.set(0, 1.42, -1.2); kit.controls.update(); });   // about headset distance
const ids = process.argv[2] ? process.argv[2].split(',') : await page.evaluate(() => window.__app.app.decks.flatMap((d) => d.cards));
const tiles = [];
for (const id of ids) {
  await page.evaluate((i) => window.__app.app.screen.jump(i), id);
  await page.waitForFunction((i) => window.__app.info().player?.id === i, id);
  const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
  for (const [tag, t] of [['a', end * 0.6], ['b', end + 2.5]]) {
    await page.evaluate((x) => window.__app.seek(x), t); await page.waitForTimeout(120);
    const buf = await page.screenshot({ type: 'jpeg', quality: 80 });
    writeFileSync(`${OUT}/preview/${id}-${tag}.jpg`, buf);
    tiles.push({ id, tag, t: t.toFixed(1), src: `data:image/jpeg;base64,${buf.toString('base64')}` });
  }
  const st = await page.evaluate(() => window.__app.info().player.effect);
  console.log(id, `strokes end ${end.toFixed(2)} s`, JSON.stringify(st));
}
const sheet = await browser.newPage({ viewport: { width: 1600, height: 400 } });
await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(6,1fr);gap:2px">${tiles.map((x) => `<div style="position:relative"><img src="${x.src}" style="width:100%;display:block"><span style="position:absolute;left:4px;top:2px;color:#fff;font:12px monospace">${x.id} t=${x.t}</span></div>`).join('')}</body>`);
await sheet.screenshot({ path: `${OUT}/preview-sheet.jpg`, type: 'jpeg', quality: 75, fullPage: true });
console.log(errors.length ? `CONSOLE ISSUES:\n${errors.join('\n')}` : 'no console errors or warnings');
await browser.close();
process.exit(errors.length ? 1 : 0);
