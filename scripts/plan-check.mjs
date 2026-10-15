// A plan checked before any builder starts: its layout (rough shapes and the real models, vignettes/blockout.js) measured
// against its goals, so numbers that can't work (a gap narrower than the man, a door lower than the girl, a hand that
// can't reach the jug, a cake top seen from below) show up while they are still cheap to change. For Opus, per plan.
// Usage: node scripts/plan-check.mjs <card id> <layout.json> [--goals g.json] [--loop 7] [--times 1,3,5] [--out dir]
//   layout.json: the card's effect with a blockout scene ({ ..., "vignette": { "type": "blockout", "things": [...] } }),
//   or just the scene ({ "type": "blockout", ... }), which then replaces the card's own scene. See vignettes/blockout.js.
// Prints: 1. the models' real sizes (facing you and sideways), body heights, arm reach and how high each clip lifts them;
// 2. the goals, PASS / FAIL over the whole loop, with goals about things the blockout doesn't have (labels, stars, a
// gesture) set apart as BUILD (they can only be checked once built); 3. the measured faults; 4. a picture from the
// learner's seat at --times (<out>/seat.jpg). A plan is ready when every goal it can check passes.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { launch, serve, watchPage } from './lib/browser.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const [id, file] = process.argv.slice(2);
if (!id || !file || file.startsWith('--')) { console.log('usage: node scripts/plan-check.mjs <card id> <layout.json> [--goals g.json] [--loop 7] [--times 1,3,5] [--out dir]'); process.exit(1); }
const OUT = arg('--out', `.cache/plan-check/${id}`), goalsFile = arg('--goals'), times = arg('--times', '1,3,5');
mkdirSync(OUT, { recursive: true });
const raw = JSON.parse(readFileSync(file, 'utf8')), card = JSON.parse(readFileSync(`content/cards/${id}.json`, 'utf8'));
const effect = raw.type === 'blockout' ? { ...(typeof card.effect === 'object' ? card.effect : {}), emblem: null, motion: 'none', vignette: raw } : raw;
if (effect.vignette?.type !== 'blockout') { console.log(`${file}: its scene is not a blockout (vignette.type "blockout")`); process.exit(1); }
const LOOP = arg('--loop', String(effect.vignette.loop ?? 7)), things = effect.vignette.things ?? [];
const recipeFile = `${OUT}/layout-effect.json`;
writeFileSync(recipeFile, JSON.stringify(effect));
const out = [`# Plan check of card ${id} (${card.kanji ?? ''} ${card.meaning ?? ''}) with ${file}`, ''];

// 1. the models' real sizes, in u
const { base: BASE, server } = await serve(), browser = await launch();
const page = await browser.newPage({ viewport: { width: 900, height: 720 } }), why = watchPage(page);
await page.goto(`${BASE}?preview=1&cards=${id}&card=${id}&t=0&recipe=${encodeURIComponent(JSON.stringify(effect))}`);
await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 90000 })
  .catch((e) => { console.log(why(`card ${id} never got ready at ${BASE}: ${e.message}`)); process.exit(1); });
const sizes = await page.evaluate(async () => {
  const THREE = await import('three');
  const { kit } = window.__app.app, end = window.__app.info().player.strokesEnd; window.__app.seek(end);
  const holder = kit.scene.getObjectByName('vignette'), list = holder.children.find((c) => c.userData.blockout)?.userData.blockout ?? [];
  const u = holder.userData.inspect.u * holder.getWorldScale(new THREE.Vector3()).y, r = (v) => Math.round(v / u * 100) / 100, V = () => new THREE.Vector3();
  const rows = [];
  for (const { th, a } of list) {
    if (!a) continue;
    const g = a.group, keep = g.rotation.y, body = g.children[0], box = () => { g.updateWorldMatrix(true, true); kit.renderer.render(kit.scene, kit.camera); return new THREE.Box3().setFromObject(body, true); };   // (a render brings the skin's bones up to date)
    const at = (n) => a.node(n)?.getWorldPosition(V());
    g.rotation.y = 0; a.pose('Idle', 0); const front = box();
    const foot = front.min.y, h = (n) => (at(n) ? r(at(n).y - foot) : null);
    const arm = at('UpperArmR') && at('LowerArmR') && at('FistR') ? at('UpperArmR').distanceTo(at('LowerArmR')) + at('LowerArmR').distanceTo(at('FistR')) : null;
    g.rotation.y = Math.PI / 2; a.pose('Idle', 0); const side = box();
    g.rotation.y = 0;
    // each clip it uses: the lowest and highest its soles go (above the feet's rest height), over the clip's first 3 s
    const clips = [...new Set((th.clips ?? [[0, th.clip ?? 'Idle']]).map((c) => c[1]))].map((c) => {
      let lo = Infinity, hi = -Infinity, wide = 0;
      for (let s = 0; s <= 3; s += 0.1) { a.pose(c, s); const b = box(); lo = Math.min(lo, b.min.y - foot); hi = Math.max(hi, b.min.y - foot); wide = Math.max(wide, b.max.z - b.min.z); }
      return `${c}: soles ${r(lo)} to ${r(hi)} above the ground, up to ${r(wide)} deep facing you`;
    });
    g.rotation.y = keep;
    const s = (b) => b.getSize(V()).toArray().map(r).join(' x ');
    rows.push(`  ${th.model} (h ${th.h ?? 'ADULT'}): facing you ${s(front)} (w x h x d); sideways ${s(side)}; hips ${h('Hips')}, chest ${h('Torso')}, shoulders ${h('UpperArmR')}, head bone ${h('Head')}, top ${r(front.max.y - foot)}; arm ${arm ? r(arm) : '?'} (hand reaches up to about ${arm && at('UpperArmR') ? r(at('UpperArmR').y - foot + arm) : '?'})`, ...clips.map((c) => `      ${c}`));
  }
  window.__app.seek(end);
  return rows;
});
await browser.close(); server?.close();
out.push('## The models (sizes in u; a gap or door must be bigger than the size it lets through)', '', ...(sizes.length ? sizes : ['  (no models in the layout)']), '');

// 2. and 3. the goals and faults over the whole loop (inspect.mjs on the layout)
const names = things.flatMap((t) => [t.name, t.model].filter(Boolean).map((n) => n.toLowerCase()));
const ins = spawnSync('node', ['scripts/inspect.mjs', id, '--recipe', recipeFile, '--scan', '0.25', '--loop', LOOP, '--times', times, '--quick', '--out', `${OUT}/inspect`, ...(goalsFile ? ['--goals', goalsFile] : [])], { encoding: 'utf8', maxBuffer: 64 << 20 });
const report = ins.stdout ?? '', lines = report.split('\n');
if (goalsFile) {
  const goals = JSON.parse(readFileSync(goalsFile, 'utf8'));
  const refs = (g) => [g.point, g.near, g.visible, g.big, g.faces, g.rests, g.clear, g.count].filter((x) => typeof x === 'string' && x.toLowerCase() !== 'kanji').map((x) => x.toLowerCase().split(' ')[0]);
  const build = (g) => refs(g).some((n) => !names.some((m) => m === n || m.includes(n) || n.includes(m)));
  const res = lines.filter((l) => /^ {2}(PASS|FAIL) /.test(l));
  let pass = 0, fail = 0, later = 0;
  const rows = goals.map((g, i) => {
    const l = res[i] ?? '';
    if (build(g)) { later++; return `  BUILD ${g.goal}: names something the blockout doesn't have (${refs(g).filter((n) => !names.some((m) => m === n || m.includes(n) || n.includes(m))).join(', ')}); checked once built`; }
    if (l.startsWith('  PASS')) pass++; else fail++;
    return l;
  });
  out.push(`## Goals the layout can check: ${pass} of ${pass + fail} PASS${later ? ` (${later} more only once built)` : ''}`, '', ...rows, '');
}
const loopAt = lines.findIndex((l) => l.startsWith('## The whole loop'));
if (loopAt >= 0) out.push('## Faults measured over the whole loop', '', ...lines.slice(loopAt + 2, lines.findIndex((l, i) => i > loopAt + 1 && l === '')), '');
if (ins.status && !report.includes('## Goals')) out.push('inspect.mjs failed:', report.slice(-2000), ins.stderr?.slice(-2000) ?? '');

// 4. the learner's view
writeFileSync(`${OUT}/look-recipes.json`, JSON.stringify({ [`${id}~plan`]: effect }));
const lk = spawnSync('node', ['scripts/look.mjs', `${id}~plan`, '--recipes', `${OUT}/look-recipes.json`, '--times', times, '--out', `${OUT}/seat.jpg`], { encoding: 'utf8' });
out.push(`The learner's view at t+${times.split(',').join(', t+')}: ${lk.status ? `(look.mjs failed: ${lk.stdout}${lk.stderr})` : `${OUT}/seat.jpg`}`, `Full inspection numbers: ${OUT}/inspect/report.txt`);
writeFileSync(`${OUT}/report.txt`, out.join('\n') + '\n');
console.log(out.join('\n'));
