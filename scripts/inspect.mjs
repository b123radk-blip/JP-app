// A card's scene checked for the faults a picture hides: things floating above or sunk into what they stand on, people
// hidden behind each other from the learner's seat, hands that miss what they should touch. Measures first (numbers, in
// u = the kanji's height), then takes close-up pictures on numbered sheets: faults.jpg (each fault once, at its worst
// moment), overview.jpg (the whole scene and the learner's view at each moment asked for), people.jpg (each person or
// animal a fault names). Then any one close look you ask for. For Qwen (plans/qwen/README.md) and for Opus's reviews.
// Usage: node scripts/inspect.mjs <card id> [--times 1,2.5] [--scan 0.5] [--people] [--strict] [--out .cache/inspect/<id>]
//        node scripts/inspect.mjs <card id> --look T3 [--from right] [--t 1.5] [--zoom 2] [--out ...]
//   --times: seconds after the last stroke (the full numbers and the overview); --scan: first measure the whole loop every
//   0.5 s (numbers only) and list each fault with when it shows; a fault the --times miss gets its worst moment in full
//   (--scan 0: off); --people: close-ups of every person or animal; --strict: exit code 1 when a fault is found;
//   --look: a thing's id from the report (T1, T2 ...) or a point x,y,z in u (as in the report); --from: front right left
//   back top low front-right front-left; --zoom: 2 = twice as close.
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
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
  await page.evaluate((c) => { let d = document.getElementById('cap'); if (!d) { d = document.createElement('div'); d.id = 'cap'; document.body.append(d); } d.textContent = c; }, caption);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${OUT}/${file}`, type: 'jpeg', quality: 82 });
  return `${OUT}/${file}`;
}

const lines = [];
let found = 0;
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
  // every fault (ids and numbers aside), the moments it shows and its worst moment: it is pictured once, there
  const seen = new Map(), asked = times.slice();
  // (`detail`: the worst among the moments the report lists in full, so a close-up's T ids match a section of the report)
  const note = (m, dt, full = false) => {
    for (const f of faultsOf(m)) {
      const key = f.hidden ? `${f.text.split(':')[0].replace(/\bT\d+ /, '')}: hidden` : f.text.replace(/\bT\d+ /g, '').replace(/-?\d+(\.\d+)?/g, '#');
      if (!seen.has(key)) seen.set(key, { at: new Set(), worst: null, detail: null });
      const e = seen.get(key); e.at.add(dt);
      if (!e.worst || f.score > e.worst.f.score) e.worst = { dt, f, m };
      if (full && (!e.detail || f.score > e.detail.f.score)) e.detail = { dt, f, m };
    }
  };
  if (scan > 0) {
    // the whole loop, numbers only
    const at = [];
    for (let dt = 0; dt < LOOP - 1e-9; dt += scan) at.push(Math.round(dt * 100) / 100);
    for (const dt of at) {
      const m = await page.evaluate(measure, { t: end + dt, cam: seat });
      if (m.error) { console.log(m.error); process.exit(1); }
      note(m, dt);
    }
    lines.push(`## The whole loop, every ${scan} s from t+0 to t+${at.at(-1)} (numbers only; the T ids differ from moment to moment)`, '');
    if (!seen.size) lines.push('  no measured faults at any moment');
    for (const { at: when, worst } of seen.values()) {
      const w = [...when].sort((a, b) => a - b);
      lines.push(`  - ${spans(w, scan)} (worst at t+${worst.dt}): ${worst.f.text.replace(/\bT\d+ /g, '')}`);
      // a fault the asked moments miss gets the full numbers at its worst moment (its pictures come from there anyway)
      if (!w.some((x) => times.some((y) => Math.abs(x - y) < scan / 2)) && times.length < 6) times.push(worst.dt);
    }
    times.sort((a, b) => a - b);
    lines.push('');
  }
  const overview = [], faultPics = [], people = [];
  for (const dt of times) {
    const t = end + dt, m = await page.evaluate(measure, { t, cam: seat });
    if (m.error) { console.log(m.error); process.exit(1); }
    note(m, dt, true);
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
    lines.push('', faults.length ? 'POSSIBLE FAULTS (each has close-ups on the faults sheet, at its worst moment):' : 'No measured faults. Still look at the pictures: the numbers cannot see everything.');
    faults.forEach((f) => lines.push(`  - ${f.text}`));
    lines.push('');

    // the overview at the moments asked for: the whole scene from the front and the right, and the learner's view
    if (!asked.includes(dt)) continue;
    const { mid, R } = extent(m);
    for (const from of ['front', 'right']) overview.push([await shot(`t${dt}-scene-${from}.jpg`, `whole scene from ${from} t+${dt}`, mid, R, from, t), `the whole scene from ${from}, t+${dt}`]);
    overview.push([await seatShot(`t${dt}-learner.jpg`, `learner's seat t+${dt}`, t), `what the learner sees, t+${dt}`]);
  }

  // each fault once, at its worst moment (hidden: from the learner's seat; the rest close up from the front and the right),
  // then each person or animal a fault names, close up at that moment (--people: every one at the first moment too)
  let n = 0;
  const closeUp = new Map();
  for (const e of seen.values()) {
    const { dt, f, m } = e.detail ?? e.worst;
    n++;
    const t = end + dt;
    if (f.hidden) faultPics.push([await seatShot(`fault${n}-seat-t${dt}.jpg`, `fault ${n} learner's seat t+${dt}`, t), `fault ${n} (t+${dt}): ${f.text}`]);
    else for (const from of ['front', 'right']) faultPics.push([await shot(`fault${n}-${from}-t${dt}.jpg`, `fault ${n} from ${from} t+${dt}`, f.point, 0.3 * m.u, from, t), `fault ${n} from ${from} (t+${dt}): ${f.text}`]);
    for (const x of m.items.filter((y) => y.kind === 'model' && f.text.includes(`${y.id} model ${y.name}`))) if (!closeUp.has(x.name)) closeUp.set(x.name, { x, dt });
  }
  if (process.argv.includes('--people')) {
    const m = await page.evaluate(measure, { t: end + asked[0] });
    for (const x of m.items.filter((y) => y.kind === 'model')) if (!closeUp.has(x.name)) closeUp.set(x.name, { x, dt: asked[0] });
  }
  for (const { x, dt } of closeUp.values()) for (const from of ['front', 'right'])
    people.push([await shot(`${x.name}-${from}-t${dt}.jpg`, `${x.id} ${x.name} from ${from} t+${dt}`, x.world, x.radius, from, end + dt), `${x.id} ${x.name} close, from ${from} (t+${dt})`]);

  // the pictures on numbered sheets (one image to open instead of many); the single pictures stay in OUT
  lines.push('Pictures: open these sheets with your read tool (tiles are numbered; each tile\'s full-size picture is named after it):');
  for (const [name, pics] of [['overview', overview], ['faults', faultPics], ['people', people]]) {
    for (let k = 0; k < pics.length; k += 12) {
      const file = `${OUT}/${name}${k ? `-${k / 12 + 1}` : ''}.jpg`, part = pics.slice(k, k + 12);
      await sheet(file, part.map(([f], i) => [f, `${k + i + 1}`]));
      lines.push(`  ${file}`, ...part.map(([f, what], i) => `    ${k + i + 1}. ${what} (${f.split('/').at(-1)})`));
    }
  }
  if (!faultPics.length) lines.push('  (no fault close-ups: no measured faults)');
  if (!people.length) lines.push('  (no people close-ups: no fault names a person or animal; --people adds them)');
  lines.push('', `For a closer look at anything: node scripts/inspect.mjs ${id} --look <id or x,y,z> --from <front|right|left|back|top|low|front-right|front-left> --t <seconds> [--zoom 2]`);
  found = seen.size;
  writeFileSync(`${OUT}/report.txt`, `# Inspection of card ${id}\n\n${lines.join('\n')}\n`);
  console.log(`# Inspection of card ${id}\n\n${lines.join('\n')}\n\n(report saved in ${OUT}/report.txt)`);
}
await browser.close(); server?.close();
if (process.argv.includes('--strict') && !look && found) process.exit(1);

// the faults in one measurement: things floating or sunk, bodies through things or each other, people or the kanji hidden
// from the learner (a person under 85% visible or partly outside the picture, the kanji under 80%); score: how bad
function faultsOf(m) {
  const gap = (t) => Math.abs(Number(/gap (-?[\d.]+)u/.exec(t)?.[1] ?? 0));
  return [...m.support.filter((s) => s.fault).map((s) => ({ text: s.text, point: s.point, score: gap(s.text) })),
    ...m.through.map((h) => ({ text: h.text, point: h.point, score: Number(/(\d+) skin points/.exec(h.text)?.[1] ?? 1) })),
    ...m.touching.map((h) => ({ text: h.text, point: h.point, score: 1 })),
    ...m.hidden.filter((h) => h.pct != null && (h.glyph ? h.pct < 80 : h.pct < 85 || h.frame < 90)).map((h) => ({ text: h.text, id: h.id, hidden: true, score: 100 - Math.min(h.pct, h.frame) }))];
}
// the middle and size of a moment's solid things (to frame the whole scene)
function extent(m) {
  const solid = m.items.filter((x) => x.kind !== 'particles'), lo = [0, 1, 2].map((i) => Math.min(...solid.map((x) => x.world[i] - x.radius))), hi = [0, 1, 2].map((i) => Math.max(...solid.map((x) => x.world[i] + x.radius)));
  return { mid: lo.map((v, i) => (v + hi[i]) / 2), R: Math.max(...hi.map((v, i) => v - lo[i])) / 2 * 0.8 };
}
// up to 12 pictures as one sheet: three across, 450 x 360 each, numbered (stays under 1568 px, so nothing is scaled down)
async function sheet(file, tiles) {
  const p = await browser.newPage({ viewport: { width: 1356, height: 400 } });
  await p.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(3,450px);gap:3px">${tiles.map(([f, label]) => `<div style="position:relative;width:450px;height:360px"><img src="data:image/jpeg;base64,${readFileSync(f).toString('base64')}" style="width:450px;height:360px;display:block"><span style="position:absolute;right:0;top:0;color:#fff;background:#c02020;font:bold 22px sans-serif;padding:1px 8px">${label}</span></div>`).join('')}</body>`);
  await p.waitForFunction(() => [...document.images].every((i) => i.complete));
  await p.screenshot({ path: file, type: 'jpeg', quality: 85, fullPage: true });
  await p.close();
}
// 0.5, 1, 1.5, 3 -> "t+0.5 to t+1.5, t+3"
function spans(at, step) {
  const out = [];
  for (const x of at) { const last = out.at(-1); if (last && x - last[1] <= step + 1e-9) last[1] = x; else out.push([x, x]); }
  return out.map(([a, b]) => (a === b ? `t+${a}` : `t+${a} to t+${b}`)).join(', ');
}
