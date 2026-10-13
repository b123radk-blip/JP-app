// A card's scene checked for the faults a picture hides: things floating above or sunk into what they stand on, people
// hidden behind each other from the learner's seat, hands that miss what they should touch. Measures first (numbers, in
// u = the kanji's height), then takes big close-up pictures: the whole scene, every person or animal on its own, and every
// fault it found. Then any one close look you ask for. For Qwen (plans/qwen/README.md) and for Opus's reviews.
// Usage: node scripts/inspect.mjs <card id> [--times 1,2.5] [--scan 0.5] [--strict] [--out .cache/inspect/<id>]
//        node scripts/inspect.mjs <card id> --look T3 [--from right] [--t 1.5] [--zoom 2] [--out ...]
//   --times: seconds after the last stroke (the full report and pictures); --scan: first measure the whole loop every 0.5 s
//   (numbers only) and list each fault with when it shows; a fault missed by --times gets a moment of its own (--scan 0:
//   off); --strict: exit code 1 when a fault is found; --look: a thing's id from the report (T1, T2 ...) or a point x,y,z in u (as
//   in the report); --from: front right left back top low front-right front-left; --zoom: 2 = twice as close.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { launch, serve, watchPage } from './lib/browser.mjs';
import { measure, aim } from './lib/inspect-page.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const id = process.argv[2], look = arg('--look'), OUT = arg('--out', `.cache/inspect/${id}`);
const times = look ? [Number(arg('--t', '1.5'))] : arg('--times', '1,2.5').split(',').map(Number), scan = Number(arg('--scan', '0.5')), LOOP = 7;
const VIEWS = { front: [0, 0.05], right: [90, 0.1], left: [-90, 0.1], back: [180, 0.1], top: [0, 1.45], low: [0, -0.25], 'front-right': [40, 0.3], 'front-left': [-40, 0.3] };
if (!id) { console.log('usage: node scripts/inspect.mjs <card id> [--times 1,2.5] | --look T3 [--from right] [--t 1.5]'); process.exit(1); }

const { base: BASE, server } = await serve(), browser = await launch();
const page = await browser.newPage({ viewport: { width: 900, height: 720 } }), why = watchPage(page);
await page.goto(`${BASE}?preview=1&cards=${id}&card=${id}&t=0`);
await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 90000 })
  .catch((e) => { console.log(why(`card ${id} never got ready at ${BASE}: ${e.message}`)); process.exit(1); });
await page.addStyleTag({ content: '#ui, #footer { display: none !important; } #cap { position: fixed; left: 8px; top: 6px; font: 18px monospace; color: #fff; background: #000b; padding: 2px 6px; z-index: 9 }' });
const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
// the learner's seat: where the app's camera starts
const seat = await page.evaluate(() => { const { kit } = window.__app.app; return { pos: kit.camera.position.toArray(), target: kit.controls.target.toArray() }; });
mkdirSync(OUT, { recursive: true });

// a picture of world point `target` from `from`, close enough that a sphere of radius r fills the frame
async function shot(file, caption, target, r, from, t) {
  const [az, el] = VIEWS[from] ?? VIEWS.front, dist = Math.max(0.12, r * 2.4);
  await page.evaluate(aim, { target, dist, az, el, t });
  await page.evaluate((c) => { let d = document.getElementById('cap'); if (!d) { d = document.createElement('div'); d.id = 'cap'; document.body.append(d); } d.textContent = c; }, caption);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${OUT}/${file}`, type: 'jpeg', quality: 82 });
  return `${OUT}/${file}`;
}

// the same from the learner's seat
async function seatShot(file, caption, t) {
  await page.evaluate(({ pos, target, t }) => { const { kit } = window.__app.app; kit.camera.position.fromArray(pos); kit.controls.target.fromArray(target); kit.controls.update(); window.__app.seek(t); }, { ...seat, t });
  await page.evaluate((c) => { document.getElementById('cap').textContent = c; }, caption);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${OUT}/${file}`, type: 'jpeg', quality: 82 });
  return `${OUT}/${file}`;
}

const lines = [], pics = [];
if (look) {
  const m = await page.evaluate(measure, { t: end + times[0] });
  if (m.error) { console.log(m.error); process.exit(1); }
  const it = m.items.find((x) => x.id === look), xyz = look.split(',').map(Number);
  if (!it && xyz.length !== 3) { console.log(`no thing ${look}: the ids are ${m.items.map((x) => `${x.id} ${x.name}`).join(', ')}`); process.exit(1); }
  const target = it ? it.world : [m.origin[0] + xyz[0] * m.u, m.origin[1] + xyz[1] * m.u, m.origin[2] + xyz[2] * m.u];
  const r = (it ? it.radius : 0.4 * m.u) / Number(arg('--zoom', '1')), from = arg('--from', 'front');
  console.log(await shot(`look-${look.replace(/,/g, '_')}-${from}-t${times[0]}.jpg`, `${id} ${look} from ${from} t+${times[0]}`, target, r, from, end + times[0]));
} else {
  rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
  let found = 0;
  if (scan > 0) {
    // the whole loop, numbers only: each fault (ids and numbers aside) with the moments it shows
    const seen = new Map(), at = [];
    for (let dt = 0; dt < LOOP - 1e-9; dt += scan) at.push(Math.round(dt * 100) / 100);
    for (const dt of at) {
      const m = await page.evaluate(measure, { t: end + dt, cam: seat });
      if (m.error) { console.log(m.error); process.exit(1); }
      for (const f of faultsOf(m)) { const key = f.text.replace(/\bT\d+ /g, '').replace(/-?\d+(\.\d+)?/g, '#'); if (!seen.has(key)) seen.set(key, { text: f.text, at: [] }); seen.get(key).at.push(dt); }
    }
    lines.push(`## The whole loop, every ${scan} s from t+0 to t+${at.at(-1)} (numbers only; the T ids differ from moment to moment)`, '');
    if (!seen.size) lines.push('  no measured faults at any moment');
    for (const { text, at: when } of seen.values()) {
      lines.push(`  - ${spans(when, scan)}: ${text.replace(/\bT\d+ /g, '')}`);
      if (!when.some((x) => times.some((y) => Math.abs(x - y) < scan / 2)) && times.length < 6) times.push(when[Math.floor(when.length / 2)]);
    }
    found += seen.size; times.sort((a, b) => a - b);
    lines.push('');
  }
  for (const dt of times) {
    const t = end + dt, m = await page.evaluate(measure, { t, cam: seat });
    if (m.error) { console.log(m.error); process.exit(1); }
    lines.push(`## t+${dt} (u = ${m.u.toFixed(3)} m; positions are [x from the kanji's right edge, y above the ground line, z toward you], in u)`, '', 'Things (id, kind, name or colour, size w x h x d, centre, bottom and top height):');
    for (const x of m.items) lines.push(`  ${x.id} ${x.kind} ${x.name}: size ${x.size.join(' x ')}, centre [${x.centre.join(', ')}], bottom ${x.bottom}, top ${x.top}`);
    lines.push('', 'What each solid thing rests on (it should touch it, unless it is meant to fly):');
    const faults = faultsOf(m);
    for (const s of m.support) lines.push(`  ${s.text}`);
    lines.push('', 'Bodies passing into things (a hand resting ON a thing may show a few points; a head or body inside one is a fault):');
    for (const h of m.through) lines.push(`  ${h.text}`);
    if (!m.through.length) lines.push('  none');
    if (m.hands.length) lines.push('', 'Hands (is each where the plan wants it? "nearest own body part" says where on the body it is):');
    for (const h of m.hands) lines.push(`  ${h.text}`);
    for (const h of m.touching) lines.push(`  ${h.text}`);
    lines.push('', 'Seen from the learner\'s seat (the app\'s own camera): how much of each person or animal, and of the kanji, shows');
    for (const h of m.hidden) lines.push(`  ${h.text}`);
    if (!m.hidden.some((h) => !h.glyph)) lines.push('  (no people or animals)');
    lines.push('', faults.length ? 'POSSIBLE FAULTS (look at the close-ups to decide):' : 'No measured faults. Still look at the pictures: the numbers cannot see everything.');
    faults.forEach((f) => lines.push(`  - ${f.text}`));
    found += faults.length;

    // pictures: the whole scene (front, right), each model alone (front, right), each fault close up (front, right)
    const solid = m.items.filter((x) => x.kind !== 'particles'), lo = [0, 1, 2].map((i) => Math.min(...solid.map((x) => x.world[i] - x.radius))), hi = [0, 1, 2].map((i) => Math.max(...solid.map((x) => x.world[i] + x.radius)));
    const mid = lo.map((v, i) => (v + hi[i]) / 2), R = Math.max(...hi.map((v, i) => v - lo[i])) / 2 * 0.8;
    for (const from of ['front', 'right']) pics.push([await shot(`t${dt}-scene-${from}.jpg`, `${id} whole scene from ${from} t+${dt}`, mid, R, from, t), `the whole scene from ${from}`]);
    pics.push([await seatShot(`t${dt}-learner.jpg`, `${id} learner's seat t+${dt}`, t), 'what the learner sees (the app\'s own camera)']);
    for (const x of m.items.filter((y) => y.kind === 'model')) for (const from of ['front', 'right'])
      pics.push([await shot(`t${dt}-${x.id}-${x.name}-${from}.jpg`, `${id} ${x.id} ${x.name} from ${from} t+${dt}`, x.world, x.radius, from, t), `${x.id} ${x.name} close, from ${from}`]);
    let n = 0;
    for (const f of faults) {
      n++;
      for (const from of f.hidden ? ['front'] : ['front', 'right']) pics.push([await shot(`t${dt}-fault${n}-${from}.jpg`, `${id} fault ${n} from ${from} t+${dt}`, f.hidden ? mid : f.point, f.hidden ? R : 0.3 * m.u, from, t), `fault ${n} close up from ${from}: ${f.text}`]);
    }
    lines.push('');
  }
  lines.push('Pictures (open each one with your read tool):', ...pics.map(([f, what]) => `  ${f}: ${what}`), '',
    `For a closer look at anything: node scripts/inspect.mjs ${id} --look <id or x,y,z> --from <front|right|left|back|top|low|front-right|front-left> --t <seconds> [--zoom 2]`);
  writeFileSync(`${OUT}/report.txt`, `# Inspection of card ${id}\n\n${lines.join('\n')}\n`);
  console.log(`# Inspection of card ${id}\n\n${lines.join('\n')}\n\n(report saved in ${OUT}/report.txt)`);
}
await browser.close(); server?.close();
if (process.argv.includes('--strict') && !look && found) process.exit(1);

// the faults in one measurement: things floating or sunk, bodies through things or each other, people or the kanji hidden
// from the learner (a person under 85% visible or partly outside the picture, the kanji under 80%)
function faultsOf(m) {
  return [...m.support.filter((s) => s.fault).map((s) => ({ text: s.text, point: s.point })),
    ...m.through.map((h) => ({ text: h.text, point: h.point })), ...m.touching.map((h) => ({ text: h.text, point: h.point })),
    ...m.hidden.filter((h) => h.pct != null && (h.glyph ? h.pct < 80 : h.pct < 85 || h.frame < 90)).map((h) => ({ text: h.text, id: h.id, hidden: true }))];
}
// 0.5, 1, 1.5, 3 -> "t+0.5 to t+1.5, t+3"
function spans(at, step) {
  const out = [];
  for (const x of at) { const last = out.at(-1); if (last && x - last[1] <= step + 1e-9) last[1] = x; else out.push([x, x]); }
  return out.map(([a, b]) => (a === b ? `t+${a}` : `t+${a} to t+${b}`)).join(', ');
}
