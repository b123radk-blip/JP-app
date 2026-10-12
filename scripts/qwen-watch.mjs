// Runs Opus's plans for Qwen on this PC, hands-off. Every minute: pull the Qwen branch; hand each plan in
// plans/qwen/queue/ that has no report yet in plans/qwen/done/ to pi (Qwen) together with the standing rules
// (plans/qwen/README.md); keep pi's output in plans/qwen/logs/; push what Qwen committed. Guide: docs/QWEN.md.
// Usage (model running, from the repo): node scripts/qwen-watch.mjs [--once] [--every 60] [--minutes 60]
//   --once: one pass, then exit; --every: seconds between pulls; --minutes: time limit per plan.
//   PI_ARGS: extra pi flags (e.g. "--model qwen3.8-27b"); PI_CMD: the pi command (default pi).
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';

const BRANCH = process.env.QWEN_BRANCH || 'claude/project-thread-qtx77d', Q = 'plans/qwen/queue', D = 'plans/qwen/done', L = 'plans/qwen/logs';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const once = process.argv.includes('--once'), every = Number(arg('--every', '60')) * 1000, limit = Number(arg('--minutes', '60')) * 60000;
const git = (c) => execSync(`git ${c}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);
const tail = (s, n) => s.split(/\r?\n/).slice(-n).join('\n');

// pi gets the prompt as an @file, so no argument has a space in it (Windows runs pi through the shell)
function runPi(name) {
  mkdirSync('.cache', { recursive: true });
  writeFileSync('.cache/qwen-prompt.md', `Read plans/qwen/README.md (your standing rules) and then the plan plans/qwen/queue/${name}, and do exactly what the plan says. Finish with your report in plans/qwen/done/${name}, committed, as the rules say. Do not push.\n`);
  const args = [...(process.env.PI_ARGS ?? '').split(' ').filter(Boolean), '-p', '@.cache/qwen-prompt.md', 'Go.'];
  return spawnSync(process.env.PI_CMD || 'pi', args, { encoding: 'utf8', shell: process.platform === 'win32', timeout: limit, maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
}

function pass() {
  if (git('status --porcelain --untracked-files=no')) { log('the repo has uncommitted changes: skipping (commit or undo them first)'); return; }
  if (git('rev-parse --abbrev-ref HEAD') !== BRANCH) { git(`fetch origin ${BRANCH}`); git(`checkout ${BRANCH}`); }
  git(`pull --ff-only origin ${BRANCH}`);
  const todo = existsSync(Q) ? readdirSync(Q).filter((f) => f.endsWith('.md') && !existsSync(`${D}/${f}`)).sort() : [];
  for (const name of todo) {
    const t0 = Date.now(); log(`Qwen starts ${name}`);
    const r = runPi(name), out = `${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim(), min = ((Date.now() - t0) / 60000).toFixed(1);
    mkdirSync(L, { recursive: true }); mkdirSync(D, { recursive: true });
    writeFileSync(`${L}/${name.replace(/\.md$/, '.log')}`, `pi exit ${r.status ?? r.signal ?? r.error?.code} after ${min} min\n\n${out}\n`);
    // no report: say so, so Opus sees it and the plan isn't retried forever
    if (!existsSync(`${D}/${name}`)) writeFileSync(`${D}/${name}`, `# NOT DONE (written by qwen-watch)\n\npi ended (${r.status ?? r.signal ?? r.error?.message}) after ${min} min without a report. Last lines of its output:\n\n\`\`\`\n${tail(out, 40)}\n\`\`\`\n`);
    git('add -A');
    if (git('status --porcelain')) git(`commit -q -m "Qwen: ${name}: pi log and anything left uncommitted"`);
    git(`push -q origin ${BRANCH}`);
    log(`${name} done in ${min} min, pushed`);
  }
}

log(`watching ${BRANCH} for plans in ${Q} (Ctrl+C stops)`);
for (;;) {
  try { pass(); } catch (e) { log(`error: ${e.stderr?.toString().trim() || e.message}`); }
  if (once) break;
  await new Promise((ok) => setTimeout(ok, every));
}
