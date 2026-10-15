// Short, exact answers for a builder (Qwen in pi: scripts/pi/jp-tools.ts; anyone else from the command line), so it
// spends its time on the scene and not on reading long reports or guessing numbers. Lengths in u (the kanji's height),
// [x from the kanji's right edge, y above the ground line, z toward the viewer], t in seconds after the last stroke.
// Usage:
//   node scripts/qtool.mjs goals <card id> <goals.json> [--loop 9]
//       the goals (PASS / FAIL with the measured numbers) and the faults over the whole loop; nothing else
//   node scripts/qtool.mjs measure <card id> [--t 1,3] [--what "gal2 right hand,rowboat"]
//       each thing's size and place, and each person's body points (head, hands, feet ...), at those moments;
//       --what keeps the lines that mention any of the words
//   node scripts/qtool.mjs try <card id> <changes.json> [--goals g.json] [--loop 9]
//       tries edits to one source file without keeping them: changes.json is { "file": "src/...", "changes":
//       [{ "old": "exact text", "new": "replacement" }] }; runs the goals before and after, then puts the file back
//   node scripts/qtool.mjs restore
//       puts back a file a killed try left changed (only if nobody edited it since)
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, relative, sep } from 'node:path';

const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const [cmd, id] = pos, BACKUP = '.cache/qtool-try-backup.json';
const fail = (m) => { console.log(`ERROR: ${m}`); process.exit(2); };

// a try that was killed half-way leaves its backup: put the file back before anything else
function restoreLeftover() {
  if (!existsSync(BACKUP)) return;
  const b = JSON.parse(readFileSync(BACKUP, 'utf8'));
  rmSync(BACKUP);
  // only when the file still holds the tried text: an edit made since then is kept
  if (existsSync(b.file) && readFileSync(b.file, 'utf8') === b.tried) { writeFileSync(b.file, b.text); console.log(`(put ${b.file} back as it was before an earlier try that did not finish)\n`); }
}

// inspect.mjs --quick, cut to the goals and the whole-loop faults
function check(goals, loop) {
  const args = ['scripts/inspect.mjs', id, '--quick', '--times', '0', '--out', `.cache/qtool/${id}`, ...(goals ? ['--goals', goals] : []), ...(loop ? ['--loop', loop] : [])];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 5 * 60000 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`, lines = out.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('## Goals') || l.startsWith('## The whole loop'));
  const stop = lines.findIndex((l, i) => i > start && l.startsWith('## t+'));
  if (start < 0) return { error: `inspect did not measure the scene (exit ${r.status}${r.signal ? `, ${r.signal}` : ''}):\n${lines.filter(Boolean).slice(-15).join('\n')}` };
  const text = lines.slice(start, stop < 0 ? undefined : stop).join('\n').trim();
  const goalsMap = new Map(lines.filter((l) => /^ {2}(PASS|FAIL) /.test(l)).map((l) => { const [, s, rest] = l.match(/^ {2}(PASS|FAIL) (.*)$/); return [rest.split(': ')[0], { s, line: l.trim() }]; }));
  const faults = lines.slice(start, stop < 0 ? undefined : stop).filter((l) => /^ {2}- /.test(l)).map((l) => l.trim());
  return { text, goals: goalsMap, head: text.match(/## Goals: \d+ of \d+ PASS/)?.[0] ?? null, faults };
}

if (cmd === 'restore') { restoreLeftover(); process.exit(0); }   // for qwen-watch.mjs, after pi stops
if (!cmd || !['goals', 'measure', 'try'].includes(cmd) || !id) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  process.exit(cmd ? 2 : 0);
}
if (!existsSync(`content/cards/${id}.json`)) fail(`no card ${id} (content/cards/${id}.json); run from the JP-app folder`);
restoreLeftover();

if (cmd === 'goals') {
  const goals = pos[2];
  if (goals && !existsSync(goals)) fail(`no goals file ${goals}`);
  const c = check(goals, arg('--loop'));
  console.log(c.error ? `ERROR: ${c.error}` : c.text);
  process.exit(c.error ? 2 : c.head && !/(\d+) of \1 PASS/.test(c.head) ? 1 : 0);
}

if (cmd === 'measure') {
  const { launch, serve, watchPage } = await import('./lib/browser.mjs'), { measure } = await import('./lib/inspect-page.mjs');
  const times = arg('--t', '1').split(',').map(Number), words = (arg('--what') ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
  if (times.some((t) => !Number.isFinite(t))) fail('--t takes seconds after the last stroke, like --t 1,3.5');
  const { base, server } = await serve(), browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 720 } }), why = watchPage(page);
    await page.goto(`${base}?preview=1&cards=${id}&card=${id}&t=0`);
    await page.waitForFunction((i) => window.__app?.ready === true && window.__app.info().player?.id === i, id, { timeout: 90000 })
      .catch((e) => fail(why(`card ${id} never got ready: ${e.message}`)));
    const end = await page.evaluate(() => window.__app.info().player.strokesEnd);
    const seat = await page.evaluate(() => { const { kit } = window.__app.app; return { pos: kit.camera.position.toArray(), target: kit.controls.target.toArray() }; });
    const out = [`# Measured: card ${id} (lengths in u; [x from the kanji's right edge, y above the ground, z toward you])`];
    for (const dt of times) {
      const m = await page.evaluate(measure, { t: end + dt, cam: seat, watch: [] });
      if (m.error) fail(m.error);
      const rows = [...m.items.filter((x) => x.kind !== 'particles').map((x) => `  ${x.kind} ${x.name}: size ${x.size.join(' x ')} (w x h x d), centre [${x.centre.join(', ')}], bottom ${x.bottom}, top ${x.top}`),
        ...(m.bodies ?? []).flatMap((b) => Object.entries(b.marks).map(([k, p]) => `  ${b.name} ${k}: [${p.join(', ')}]`))];
      const keep = words.length ? rows.filter((r) => words.some((w) => r.toLowerCase().includes(w))) : rows;
      out.push('', `## t+${dt}`, ...(keep.length ? keep : [`  nothing matches ${words.join(', ')}; names here: ${[...new Set(m.items.map((x) => x.name))].join(', ')}`]));
    }
    console.log(out.join('\n'));
  } finally { await browser.close(); server?.close(); }
  process.exit(0);
}

if (cmd === 'try') {
  const spec = pos[2] && existsSync(pos[2]) ? JSON.parse(readFileSync(pos[2], 'utf8')) : fail('try needs a changes file: { "file": "src/...", "changes": [{ "old": "...", "new": "..." }] }');
  const goals = arg('--goals'), loop = arg('--loop');
  if (goals && !existsSync(goals)) fail(`no goals file ${goals}`);
  const file = String(spec.file ?? ''), rel = relative(process.cwd(), resolve(file));
  // only scene code and cards: never the goals, the plan or the measuring scripts
  if (!file || rel.startsWith('..') || !(rel.startsWith(`src${sep}`) || rel.startsWith(`content${sep}`)) || !existsSync(rel)) fail(`file must be an existing file under src/ or content/ (got "${file}")`);
  const changes = Array.isArray(spec.changes) ? spec.changes : [];
  if (!changes.length || changes.length > 8) fail('give 1 to 8 changes');
  const original = readFileSync(rel, 'utf8');
  let text = original;
  for (const [i, c] of changes.entries()) {
    if (typeof c?.old !== 'string' || typeof c?.new !== 'string' || !c.old) fail(`change ${i + 1} needs "old" and "new" text`);
    const n = text.split(c.old).length - 1;
    if (n !== 1) fail(`change ${i + 1}: the old text is in ${rel} ${n} times (it must be there exactly once; copy more of the line): ${JSON.stringify(c.old.slice(0, 120))}`);
    text = text.replace(c.old, () => c.new);
  }
  if (rel.endsWith('.js') || rel.endsWith('.mjs')) {
    mkdirSync('.cache', { recursive: true }); writeFileSync('.cache/qtool-syntax.mjs', text);
    const s = spawnSync(process.execPath, ['--check', '.cache/qtool-syntax.mjs'], { encoding: 'utf8' });
    if (s.status !== 0) fail(`the changed file would not parse, so nothing was tried:\n${(s.stderr ?? '').split('\n').filter(Boolean).slice(0, 6).join('\n')}`);
  }
  const before = check(goals, loop);
  if (before.error) fail(`could not measure the scene before the change: ${before.error}`);
  mkdirSync('.cache', { recursive: true });
  writeFileSync(BACKUP, JSON.stringify({ file: rel, text: original, tried: text }));
  const putBack = () => { if (existsSync(BACKUP)) { writeFileSync(rel, original); rmSync(BACKUP); } };
  for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(s, () => { putBack(); process.exit(130); });
  let after;
  try { writeFileSync(rel, text); after = check(goals, loop); } finally { putBack(); }
  const out = [`# Tried ${changes.length} change${changes.length > 1 ? 's' : ''} to ${rel} (now put back: to keep them, make the same edit yourself)`, ''];
  if (after.error) { out.push(`The scene did not run with the change: ${after.error}`); console.log(out.join('\n')); process.exit(1); }
  if (before.head) out.push(`Before: ${before.head.slice(3)}`, `After:  ${after.head.slice(3)}`, '');
  for (const [name, a] of after.goals) {
    const b = before.goals.get(name);
    out.push(`  ${b && b.s !== a.s ? `${b.s} -> ` : ''}${a.line}`);
  }
  const gone = before.faults.filter((f) => !after.faults.includes(f)), added = after.faults.filter((f) => !before.faults.includes(f));
  out.push('', `Faults over the whole loop: ${before.faults.length} before, ${after.faults.length} after.`);
  if (added.length) out.push('New with the change:', ...added.map((f) => `  ${f}`));
  if (gone.length) out.push('Gone with the change:', ...gone.map((f) => `  ${f}`));
  console.log(out.join('\n'));
  process.exit(0);
}
