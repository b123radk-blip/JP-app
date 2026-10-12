// One card's scene from six sides (front, right, top, back-left, front-right, low front), to catch what the learner's
// front view hides: props floating or sunk, ropes and hands that miss what they hold, a body beside its seat instead of on it.
// Usage: node scripts/orbit.mjs <card id> [--out .cache/orbit.jpg] [--at x,y,z]
//   [--dist 0.6] [--times 0.5,1.5]
// --at: the point to look at, in metres from the middle of the card (default: the middle of the scene's people and
// animals, else 0.6,0.1,0); --dist: how far the camera is from it; --times: seconds after the last stroke (a row per view).
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { launch, serve, watchPage } from './lib/browser.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const id = process.argv[2], OUT = arg('--out', '.cache/orbit.jpg');
const dist = Number(arg('--dist', '0.6')), times = arg('--times', '0.5,1.5').split(',').map(Number), at = arg('--at')?.split(',').map(Number);
const VIEWS = [['front', 0, 0.05], ['right side', 90, 0.1], ['top', 0, 1.45], ['back-left', 215, 0.25], ['front-right', 40, 0.3], ['low front', 0, -0.25]];
const { base: BASE, server } = await serve(), browser = await launch();
const page = await browser.newPage({ viewport: { width: 700, height: 560 } }), errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const why = watchPage(page);
await page.goto(`${BASE}?preview=1&cards=${id}&card=${id}&t=0`);
await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 90000 })
  .catch((e) => { console.log(why(`card ${id} never got ready at ${BASE}: ${e.message}`)); process.exit(1); });
await page.addStyleTag({ content: '#ui, #footer { display: none !important; }' });
const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
// default target: the middle of the skinned (model) meshes once the scene is playing
const target = at ?? await page.evaluate((t) => {
  window.__app.seek(t); const { kit } = window.__app.app, sum = [0, 0, 0]; let n = 0; kit.scene.updateMatrixWorld(true);
  kit.scene.traverse((o) => { if (o.isSkinnedMesh) { const v = o.parent.getWorldPosition(o.position.clone()); sum[0] += v.x; sum[1] += v.y; sum[2] += v.z; n++; } });
  return n ? [sum[0] / n, sum[1] / n - 1.42, sum[2] / n + 1.2] : [0.6, 0.1, 0];
}, end + times[0]);
const tiles = [];
for (const [name, az, el] of VIEWS) for (const dt of times) {
  await page.evaluate(([x, y, z, d, az, el, t]) => {
    const { kit } = window.__app.app, a = az * Math.PI / 180, T = { x, y: 1.42 + y, z: -1.2 + z };
    kit.camera.position.set(T.x + d * Math.sin(a) * Math.cos(el), T.y + d * Math.sin(el), T.z + d * Math.cos(a) * Math.cos(el));
    kit.controls.target.set(T.x, T.y, T.z); kit.controls.update(); window.__app.seek(t);
  }, [...target, dist, az, el, end + dt]);
  await page.waitForTimeout(150);
  tiles.push({ n: `${name} t+${dt}`, s: (await page.screenshot({ type: 'jpeg', quality: 75 })).toString('base64') });
}
const sheet = await browser.newPage({ viewport: { width: 1500, height: 400 } });
await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${Math.max(2, times.length * 2)},1fr);gap:2px">${tiles.map((x) => `<div style="position:relative"><img src="data:image/jpeg;base64,${x.s}" style="width:100%;display:block"><span style="position:absolute;left:4px;top:2px;color:#fff;background:#000a;font:14px monospace">${id} ${x.n}</span></div>`).join('')}</body>`);
mkdirSync(dirname(OUT), { recursive: true });
await sheet.screenshot({ path: OUT, type: 'jpeg', quality: 80, fullPage: true });
console.log(`${OUT} (looking at ${target.map((v) => v.toFixed(2)).join(',')})`);
if (errors.length) console.log(`PAGE ERRORS:\n${[...new Set(errors)].join('\n')}`);
await browser.close(); server?.close();
