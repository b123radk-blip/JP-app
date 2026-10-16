// Runs Opus's plans for Qwen on this PC, hands-off. Every minute: pull the Qwen branch; hand each plan in
// plans/qwen/queue/ that has no report yet in plans/qwen/done/ to pi (Qwen) together with the standing rules
// (plans/qwen/README.md); keep pi's output in plans/qwen/logs/; push what Qwen committed. Guide: docs/QWEN.md.
// After Qwen's round the watcher checks the work itself (npm test, and the plan's goals with inspect.mjs --quick): FAIL
// lines go back to Qwen for another round. When every goal passes, Opus (Claude Code on this PC, your subscription)
// reviews once and answers approve, fix (a list Qwen gets for the next round) or needs_opus (a design problem for the
// cloud). Each plan's rounds and the outcome go to plans/qwen/loop/<plan>.md.
// Usage (model running, from the repo): node scripts/qwen-watch.mjs [--once] [--every 60] [--minutes 30] [--fix-minutes 15]
//   [--rounds 4] [--reviews 2] [--plan-minutes 120] [--no-review] [--review-api]
//   --once: one pass, then exit; --every: seconds between pulls; --minutes: Qwen's first round; --fix-minutes: each later
//   round; --rounds: Qwen rounds in all; --reviews: Opus calls in all (a retry for a bad answer counts); --plan-minutes:
//   the whole plan; --no-review: no Opus; --review-api: allow Opus to run on ANTHROPIC_API_KEY (billed) when it is set.
//   PI_ARGS: pi's model flags (default "--provider ninfer-quasar --model qwen3.8-27b-quasar --thinking xhigh"); PI_CMD: the pi command (default pi); CLAUDE_CMD (default
//   claude); REVIEW_MODEL (default opus); REVIEW_EFFORT (default high).
// A plan names its card on a line "Card: <id>" (or "(card <id>)" in its title) and may add inspect flags on a line
// "Inspect: --loop 9". Without a card or goals file the watcher can't check goals and goes straight to the review.
import { execSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const BRANCH = process.env.QWEN_BRANCH || 'claude/project-thread-qtx77d', Q = 'plans/qwen/queue', D = 'plans/qwen/done', L = 'plans/qwen/logs', LOOP = 'plans/qwen/loop';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; }, has = (k) => process.argv.includes(k);
const once = has('--once'), every = Number(arg('--every', '60')) * 1000, first = Number(arg('--minutes', '30')) * 60000, later = Number(arg('--fix-minutes', '15')) * 60000;
const ROUNDS = Number(arg('--rounds', '4')), REVIEWS = Number(arg('--reviews', '2')), PLAN = Number(arg('--plan-minutes', '120')) * 60000;
// brad's pi line (Qwen 3.8 27B quasar build served by ninfer); PI_ARGS replaces it
const PI_ARGS = process.env.PI_ARGS ?? '--provider ninfer-quasar --model qwen3.8-27b-quasar --thinking xhigh';
const WIN = process.platform === 'win32', CLAUDE = process.env.CLAUDE_CMD || findClaude(), MODEL = process.env.REVIEW_MODEL || 'opus', EFFORT = process.env.REVIEW_EFFORT || 'high';
const git = (c) => execSync(`git ${c}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);
const tail = (s, n) => s.split(/\r?\n/).slice(-n).join('\n'), mins = (ms) => (ms / 60000).toFixed(1), bare = (n) => n.replace(/\.md$/, '');

// Claude Code: CLAUDE_CMD, else `claude` when the shell finds it, else where its installers put it on Windows (the native
// installer's %USERPROFILE%\.local\bin\claude.exe, npm's %APPDATA%\npm\claude.cmd), which a window opened by
// double-clicking may not have on its PATH.
function findClaude() {
  if (!WIN) return 'claude';
  try { const w = execSync('where claude', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split(/\r?\n/).map((x) => x.trim()).filter(Boolean); const exe = w.find((x) => /\.exe$/i.test(x)); if (exe || w.length) return exe ?? 'claude'; } catch {}
  const home = process.env.USERPROFILE ?? '', app = process.env.APPDATA ?? '', local = process.env.LOCALAPPDATA ?? '';
  for (const c of [`${home}\\.local\\bin\\claude.exe`, `${local}\\Programs\\claude\\claude.exe`, `${app}\\npm\\claude.cmd`]) if (c.length > 12 && existsSync(c)) return c;
  return 'claude';
}
// One child process at a time; a timeout or Ctrl+C ends it and everything it started (on Windows, the tree under the
// cmd.exe that runs pi or claude: only our own child, never the model server). No argument may hold a space (Windows runs
// these through the shell), so prompts go through a file or stdin.
let child = null;
function run(cmd, args, { ms = 15 * 60000, input = null } = {}) {
  return new Promise((ok) => {
    const t0 = Date.now(), out = [];
    let timedOut = false, p;
    try { p = spawn(cmd, args, { shell: WIN && !/\.exe$/i.test(cmd), detached: !WIN, stdio: [input == null ? 'ignore' : 'pipe', 'pipe', 'pipe'] }); } catch (e) { ok({ code: null, out: e.message, error: e.message, ms: 0 }); return; }
    child = p;
    p.stdout.on('data', (d) => out.push(d)); p.stderr.on('data', (d) => out.push(d));
    if (input != null) { p.stdin.on('error', () => {}); p.stdin.end(input); }
    const timer = setTimeout(() => { timedOut = true; kill(p); }, ms);
    p.on('error', (e) => out.push(Buffer.from(`\n${e.message}\n`)));
    p.on('close', (code, signal) => { clearTimeout(timer); child = null; ok({ code, signal, timedOut, out: Buffer.concat(out).toString('utf8'), ms: Date.now() - t0 }); });
  });
}
function kill(p) {
  if (!p?.pid || p.exitCode != null) return;
  try { if (WIN) execSync(`taskkill /pid ${p.pid} /T /F`, { stdio: 'ignore' }); else process.kill(-p.pid, 'SIGTERM'); } catch { try { p.kill(); } catch {} }
}
process.on('SIGINT', () => { if (child) { log('Ctrl+C: stopping the running agent'); kill(child); } process.exit(130); });

// pi gets the prompt as an @file; the session (every turn and tool run, timed) goes to .cache/pi-sessions/<plan>[-rN]/
function runPi(name, round, prompt, ms) {
  mkdirSync('.cache', { recursive: true });
  writeFileSync('.cache/qwen-prompt.md', prompt);
  const sd = `.cache/pi-sessions/${bare(name)}${round > 1 ? `-r${round}` : ''}`;
  // the JP-app tools (check_goals, measure, try_value: scripts/pi/jp-tools.ts) ride along with every run
  const extra = PI_ARGS.split(' ').filter(Boolean), tools = existsSync('scripts/pi/jp-tools.ts') && !extra.some((a) => a.includes('jp-tools')) ? ['--extension', 'scripts/pi/jp-tools.ts'] : [];
  const args = [...extra, ...tools, '--session-dir', sd, '-p', '@.cache/qwen-prompt.md', 'Go.'];
  return run(process.env.PI_CMD || 'pi', args, { ms }).then((r) => ({ ...r, sd }));
}
const firstPrompt = (name) => `Read plans/qwen/README.md (your standing rules), plans/qwen/CHEATSHEET.md (how to build a scene and use your tools check_goals, measure and try_value) and then the plan plans/qwen/queue/${name}, and do exactly what the plan says. Finish with your report in plans/qwen/done/${name}, committed, as the rules say. Do not push.\n`;
const fixPrompt = (name, round, why) => `Read plans/qwen/README.md (your standing rules), plans/qwen/CHEATSHEET.md (your tools: measure the things a FAIL names before changing a number) and the plan plans/qwen/queue/${name}. You already worked on this plan (your commits and your report plans/qwen/done/${name}, if it is there). This is round ${round}. The watcher checked your work, and this is what is still wrong:\n\n${why}\n\nFix exactly these, in the files the plan lets you change, in the plan's style. Run the checks again as the rules say (with the goals file when the plan has one). Commit the code as "Qwen: ${bare(name)} round ${round}". Then add a section "## Round ${round}" at the end of your report (create the report as the rules say if it is missing): what you changed, and the real Goals lines of your last inspect run. Commit the report. Do not push, and never edit the goals file or the plan.\n`;

// the watcher's own checks, after Qwen stops: npm test, then the goals (numbers only)
async function check(name, plan) {
  const goals = `plans/qwen/goals/${bare(name)}.json`, card = plan.match(/^Card:\s*(\S+)/m)?.[1] ?? plan.match(/\(card (\w+)\)/)?.[1];
  const extra = (plan.match(/^Inspect:\s*(.+)$/m)?.[1] ?? '').split(/\s+/).filter(Boolean);
  const t = await run('npm', ['test'], { ms: 10 * 60000 }), testOk = t.code === 0 && !/FAILED/.test(t.out);
  const res = { testOk, test: tail(t.out, 15), goalsFile: existsSync(goals) ? goals : null, card };
  if (!res.goalsFile || !card) return { ...res, goalsOk: null, ok: testOk };
  const g = await run(process.execPath, ['scripts/inspect.mjs', card, '--goals', goals, '--quick', ...extra, '--out', `.cache/qwen-check/${bare(name)}`], { ms: 10 * 60000 });
  const head = g.out.match(/## Goals: (\d+) of (\d+) PASS/), lines = g.out.split(/\r?\n/).filter((l) => /^\s+(PASS|FAIL) /.test(l));
  const goalsOk = !!head && head[1] === head[2] && g.code === 0;
  return { ...res, goalsOk, ok: testOk && goalsOk, goalsLine: head ? head[0] : `inspect gave no Goals result (exit ${g.code}${g.timedOut ? ', timed out' : ''})`, goalLines: lines, inspectTail: head ? '' : tail(g.out, 20) };
}
const checkText = (c) => [c.testOk ? 'npm test: passed' : `npm test FAILED:\n\`\`\`\n${c.test}\n\`\`\``,
  c.goalsOk == null ? '' : `${c.goalsLine}\n${c.goalLines.join('\n')}${c.inspectTail ? `\n\`\`\`\n${c.inspectTail}\n\`\`\`` : ''}`].filter(Boolean).join('\n\n');

// files neither agent may change: the plan, its goals, and the measuring code
const PROTECTED = (name) => [`${Q}/${name}`, `plans/qwen/goals/${bare(name)}.json`, 'scripts/inspect.mjs', 'scripts/lib/goals.mjs', 'scripts/lib/inspect-page.mjs', 'scripts/qwen-watch.mjs', 'scripts/qtool.mjs', 'scripts/pi/jp-tools.ts'];
function guard(name, base) {
  const changed = PROTECTED(name).filter((f) => { try { return git(`diff --name-only ${base} -- "${f}"`) !== ''; } catch { return false; } });
  if (!changed.length) return '';
  for (const f of changed) { try { git(`checkout ${base} -- "${f}"`); } catch { git(`rm -q -f --ignore-unmatch "${f}"`); } }
  git(`commit -q -m "qwen-watch: put back ${changed.join(', ')} (no agent may change them)"`);
  return `put back ${changed.join(', ')}: no agent may change them`;
}
function commitLeftovers(msg) { git('add -A'); if (git('status --porcelain')) git(`commit -q -m "${msg}"`); }

// Opus reviews: Claude Code headless, read-only tools plus the render and inspect scripts; one JSON verdict
const SETTINGS = '.cache/qwen-review-settings.json';
function reviewPrompt(name, base, c, round) {
  return `You are Opus, reviewing a kanji card scene that Qwen (a local model) built on brad's PC from your plan. You review; you do not change any file in the repo. Scratch files only under .cache/review/.

The plan: plans/qwen/queue/${name}. Qwen's standing rules: plans/qwen/README.md. Qwen's report: plans/qwen/done/${name}. Qwen's changes: \`git diff ${base}..HEAD\` (round ${round}). The app is kanji flash cards for a VR headset; each card's scene must show the meaning so clearly that a child understands it without being told.

The watcher's own checks on this version (it ran them itself; don't trust Qwen's report over them):
${checkText(c)}

Do this:
1. Read the plan and the diff (the whole changed scene code, not only the diff lines).
2. Render the card from six angles: \`node scripts/orbit.mjs ${c.card ?? '<card id from the plan>'} --out .cache/review/${bare(name)}.jpg\` (add the plan's orbit flags if it gives any) and Read the picture.
3. Inspect it: \`node scripts/inspect.mjs ${c.card ?? '<card id>'}${c.goalsFile ? ` --goals ${c.goalsFile}` : ''} --out .cache/review/${bare(name)}\`, read its report and Read faults.jpg and overview.jpg.
Run each command on its own: only these commands are allowed, so a chain (&&, |, mkdir first) is refused. .cache/review/ already exists.
4. Judge: does it do what the plan says, does it read to a child from the learner's seat, and is there any fault the plan doesn't want (floating, sunk, things through people, hidden key thing)?

Only ask for fixes that matter for the card (no style preferences, no new ideas beyond the plan). Each fix must be concrete enough for Qwen: the file and function, what is wrong as you measured or saw it, and the change (numbers when you can). If the problem is the plan's design itself (the scene can't read well even when built exactly), answer needs_opus instead of asking Qwen to redesign.

Answer with ONLY one JSON object, no other text:
{"decision": "approve" | "fix" | "needs_opus", "summary": "<one or two sentences>", "fixes": [{"id": "F1", "where": "<file and function>", "problem": "<what is wrong, measured or seen>", "change": "<what to do>"}]}
"fixes" is empty for approve and has at least one item for fix.
`;
}
function verdict(env) {
  let j; try { j = JSON.parse(env); } catch { return { error: `claude's output is not one JSON result: ${tail(env, 5)}` }; }
  const meta = { session: j.session_id, cost: j.total_cost_usd, turns: j.num_turns, denials: (j.permission_denials ?? []).map((d) => d.tool_name ?? JSON.stringify(d)) };
  if (j.type !== 'result' || j.subtype !== 'success' || j.is_error) return { ...meta, error: `claude ended with ${j.subtype ?? j.type} (${j.terminal_reason ?? ''}${j.api_error_status ? `, API ${j.api_error_status}` : ''}): ${String(j.result ?? '').slice(0, 300)}` };
  const txt = String(j.result ?? '').trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  let v; try { v = JSON.parse(txt); } catch { return { ...meta, bad: true, error: 'the verdict is not one JSON object' }; }
  const fixes = Array.isArray(v.fixes) ? v.fixes : null, str = (x, n) => typeof x === 'string' && x.trim() && x.length <= n;
  const why = !['approve', 'fix', 'needs_opus'].includes(v.decision) ? 'decision must be approve, fix or needs_opus'
    : !str(v.summary, 2000) ? 'summary missing or too long' : !fixes ? 'fixes must be a list'
    : v.decision === 'approve' && fixes.length ? 'approve with fixes listed' : v.decision === 'fix' && !fixes.length ? 'fix with no fixes'
    : fixes.length > 12 ? 'more than 12 fixes' : fixes.find((f) => !str(f?.where, 400) || !str(f?.problem, 1500) || !str(f?.change, 1500)) ? 'each fix needs where, problem and change' : '';
  return why ? { ...meta, bad: true, error: `invalid verdict: ${why}` } : { ...meta, ...v };
}
async function review(name, base, c, round, retry) {
  mkdirSync('.cache/review', { recursive: true });
  writeFileSync(SETTINGS, JSON.stringify({ permissions: {
    allow: ['Read', 'Glob', 'Grep', 'Bash(node scripts/orbit.mjs:*)', 'Bash(node scripts/inspect.mjs:*)', 'Bash(git diff:*)', 'Bash(git log:*)', 'Bash(git show:*)', 'Bash(npm test)'],
    deny: ['Edit', 'Write', 'NotebookEdit', 'WebFetch', 'WebSearch'] } }, null, 1));
  const args = retry ? ['-p', '--resume', retry, '--model', MODEL, '--output-format', 'json', '--permission-mode', 'dontAsk', '--settings', SETTINGS]
    : ['-p', '--model', MODEL, '--effort', EFFORT, '--output-format', 'json', '--permission-mode', 'dontAsk', '--settings', SETTINGS];
  const input = retry ? 'Your last answer was not valid. Answer again with ONLY the JSON object described before, nothing else.\n' : reviewPrompt(name, base, c, round);
  const head = git('rev-parse HEAD'), r = await run(CLAUDE, args, { ms: 20 * 60000, input });
  writeFileSync(`${L}/${bare(name)}.review-${round}${retry ? '-retry' : ''}.json`, r.out);
  const v = r.timedOut ? { error: 'Opus took longer than 20 min' } : verdict(r.out.trim());
  // a review that changed the repo doesn't count: put it back
  if (git('rev-parse HEAD') !== head || git('status --porcelain --untracked-files=no')) {
    git(`reset -q --hard ${head}`);
    return { ...v, error: 'the reviewer changed files in the repo (put back); this review does not count' };
  }
  return v;
}
let reviewOff = has('--no-review') ? 'turned off (--no-review)' : null;

async function doPlan(name) {
  const t0 = Date.now(), base = git('rev-parse HEAD'), plan = readFileSync(`${Q}/${name}`, 'utf8'), rec = [`# Loop: ${name}`, '', `Started ${new Date().toISOString()} at ${base.slice(0, 7)}.`, ''];
  let why = null, reviews = 0, outcome = null, lastCheck = null;
  const say = (s) => { rec.push(s); log(s.split('\n')[0]); };
  for (let round = 1; !outcome; round++) {
    if (round > ROUNDS) { outcome = `NOT DONE: ${ROUNDS} Qwen rounds used`; break; }
    if (Date.now() - t0 > PLAN) { outcome = `NOT DONE: the plan's ${mins(PLAN)} min are used`; break; }
    say(`## Round ${round}: Qwen ${round === 1 ? 'builds' : 'fixes'}`);
    const r = await runPi(name, round, round === 1 ? firstPrompt(name) : fixPrompt(name, round, why), Math.min(round === 1 ? first : later, PLAN - (Date.now() - t0)));
    mkdirSync(L, { recursive: true }); mkdirSync(D, { recursive: true }); mkdirSync(LOOP, { recursive: true });
    const sfx = round > 1 ? `-r${round}` : '', status = r.timedOut ? 'timed out' : r.code ?? r.signal ?? r.error;
    writeFileSync(`${L}/${bare(name)}${sfx}.log`, `pi exit ${status} after ${mins(r.ms)} min\n\n${r.out.trim()}\n`);
    const ss = existsSync(r.sd) ? readdirSync(r.sd).filter((f) => f.endsWith('.jsonl')).sort() : [];
    if (ss.length) { const tm = await run(process.execPath, ['scripts/qwen-times.mjs', `${r.sd}/${ss.at(-1)}`], { ms: 60000 }); if (tm.code === 0) writeFileSync(`${L}/${bare(name)}${sfx}.times.md`, tm.out); }
    rec.push(`pi: ${status} after ${mins(r.ms)} min.`);
    // no report: say so, so Opus sees it and the plan isn't retried forever
    if (!existsSync(`${D}/${name}`)) writeFileSync(`${D}/${name}`, `# NOT DONE (written by qwen-watch)\n\npi ended (${status}) after ${mins(r.ms)} min without a report. Last lines of its output:\n\n\`\`\`\n${tail(r.out, 40)}\n\`\`\`\n`);
    await run(process.execPath, ['scripts/qtool.mjs', 'restore'], { ms: 60000 });   // a try_value cut off mid-way: put its file back
    commitLeftovers(`Qwen: ${name}: round ${round} pi log and anything left uncommitted`);
    const g = guard(name, base); if (g) say(`Watcher: ${g}.`);
    lastCheck = await check(name, plan);
    say(`Watcher's checks: ${lastCheck.testOk ? 'npm test passed' : 'npm test FAILED'}; ${lastCheck.goalsOk == null ? 'no goals to check' : lastCheck.goalsLine}`);
    if (lastCheck.goalLines?.length) rec.push('```', ...lastCheck.goalLines, '```');
    if (lastCheck.inspectTail) rec.push('```', lastCheck.inspectTail, '```');
    if (!lastCheck.ok) { why = checkText(lastCheck) + (g ? `\n\nAlso: the watcher ${g}.` : ''); push(name, rec); continue; }
    if (reviewOff) { outcome = `CHECKS PASS, NOT REVIEWED (review ${reviewOff})`; break; }
    let v = null;
    for (let tries = 0; tries < 2 && reviews < REVIEWS; tries++) {
      reviews++; say(`Opus reviews (call ${reviews} of ${REVIEWS})`);
      v = await review(name, base, lastCheck, round, tries ? v?.session : null);
      rec.push(`Opus: ${v.error ?? v.decision}${v.cost != null ? ` (list-price estimate $${v.cost.toFixed(2)}: on a subscription it is not billed per call)` : ''}${v.denials?.length ? `; denied: ${v.denials.join(', ')}` : ''}`);
      if (!v.bad || !v.session) break;
    }
    if (!v) { outcome = `NOT DONE: checks pass but the ${REVIEWS} Opus calls are used`; break; }
    if (v.error) { outcome = `NOT DONE: the review failed: ${v.error}`; break; }
    rec.push('', `> ${v.summary}`, ...(v.fixes ?? []).map((f, i) => `- ${f.id ?? `F${i + 1}`} (${f.where}): ${f.problem} -> ${f.change}`), '');
    if (v.decision === 'approve') outcome = 'APPROVED by Opus';
    else if (v.decision === 'needs_opus') outcome = 'NEEDS OPUS: the plan itself needs work (see the summary)';
    else { why = `Opus reviewed round ${round} and asks for these fixes:\n\n${v.fixes.map((f, i) => `${f.id ?? `F${i + 1}`}. In ${f.where}: ${f.problem}\n   Change: ${f.change}`).join('\n')}`; push(name, rec); }
  }
  say(`## Outcome: ${outcome} (${mins(Date.now() - t0)} min, ${reviews} Opus call${reviews === 1 ? '' : 's'})`);
  push(name, rec);
  return outcome;
}
function push(name, rec) {
  writeFileSync(`${LOOP}/${bare(name)}.md`, `${rec.join('\n')}\n`);
  commitLeftovers(`Qwen loop: ${name}`);
  try { git(`push -q origin ${BRANCH}`); } catch (e) { log(`push failed: ${e.stderr?.toString().trim() || e.message}`); }
}

async function pass() {
  if (git('status --porcelain --untracked-files=no')) { log('the repo has uncommitted changes: skipping (commit or undo them first)'); return; }
  if (git('rev-parse --abbrev-ref HEAD') !== BRANCH) { git(`fetch origin ${BRANCH}`); git(`checkout ${BRANCH}`); }
  git(`pull --ff-only origin ${BRANCH}`);
  const todo = existsSync(Q) ? readdirSync(Q).filter((f) => f.endsWith('.md') && !existsSync(`${D}/${f}`)).sort() : [];
  for (const name of todo) { log(`Qwen starts ${name}`); log(`${name}: ${await doPlan(name)}`); }
}

// Opus runs on your Claude Code login unless ANTHROPIC_API_KEY is set, which would bill the API instead
if (!reviewOff && process.env.ANTHROPIC_API_KEY && !has('--review-api')) reviewOff = 'off: ANTHROPIC_API_KEY is set, so Claude Code would bill the API instead of your subscription (unset it, or pass --review-api to accept)';
if (!reviewOff) { const v = await run(CLAUDE, ['--version'], { ms: 60000 }); if (v.code !== 0) reviewOff = `off: "${CLAUDE} --version" failed (${tail(v.out, 2).trim()}): Claude Code is not installed where this window can find it (in PowerShell, \`claude --version\` should print a version; or set CLAUDE_CMD to its full path)`; else log(`Opus reviews with ${CLAUDE} ${v.out.trim()} (model ${MODEL}, ${process.env.ANTHROPIC_API_KEY ? 'API key: billed' : 'your Claude login'})`); }
if (reviewOff) log(`Opus review ${reviewOff}`);
log(`watching ${BRANCH} for plans in ${Q} with pi ${PI_ARGS} (Ctrl+C stops)`);
for (;;) {
  try { await pass(); } catch (e) { log(`error: ${e.stderr?.toString().trim() || e.message}`); }
  if (once) break;
  await new Promise((ok) => setTimeout(ok, every));
}
