// Where Qwen's time goes on a plan: reads pi's saved session (one .jsonl per run) and splits the wall time into the
// model's own turns (reading the prompt and writing: thinking, code, the report) and each kind of tool run (inspect,
// orbit, npm test, reading pictures ...), with the rounds as a timeline. Guide: docs/QWEN.md.
// Usage: node scripts/qwen-times.mjs <session.jsonl>          the breakdown of one run
//        node scripts/qwen-times.mjs --all [--write] [--push]  every pi session of this folder that ran a Qwen plan
//   --write: save each plan's breakdown (its latest run) as plans/qwen/logs/<plan>.times.md
//   --push: also commit those files and push them (the Qwen branch)
//   Sessions are looked for in .cache/pi-sessions/ (where qwen-watch.mjs keeps them) and pi's own folder
//   (~/.pi/agent/sessions, or PI_CODING_AGENT_DIR).
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ms = (s) => (typeof s === 'number' ? s : Date.parse(s));
const mm = (t) => `${(t / 60000).toFixed(1)} min`;
const pct = (a, b) => `${b ? Math.round((100 * a) / b) : 0}%`;

// a tool call's kind, from pi's tool name and (for bash) the command
function kind(name, a = {}) {
  if (name === 'read') return /\.(jpe?g|png|webp)$/i.test(a.path ?? a.file_path ?? '') ? 'read a picture' : 'read a file';
  if (name === 'edit' || name === 'write') return 'edit / write code';
  if (name !== 'bash') return name;
  const c = a.command ?? '';
  return /inspect\.mjs[^|&;]*--look/.test(c) ? 'inspect --look (close-up)' : /inspect\.mjs/.test(c) ? 'inspect (whole run)'
    : /orbit\.mjs/.test(c) ? 'orbit render' : /look\.mjs/.test(c) ? 'look.mjs' : /npm (run )?test/.test(c) ? 'npm test'
    : /check-piece-costs/.test(c) ? 'cost check' : /node --check/.test(c) ? 'node --check' : /^\s*git\b/.test(c) ? 'git'
    : /node -e|node --input-type|\.mjs/.test(c) ? 'own node scripts (measuring)' : 'other shell';
}

function analyse(file) {
  const rows = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const head = rows.find((r) => r.type === 'session'), msgs = rows.filter((r) => r.type === 'message' && r.message);
  const first = msgs.find((r) => r.message.role === 'user');
  const text = (m) => (typeof m.content === 'string' ? m.content : (m.content ?? []).map((c) => c.text ?? '').join(' '));
  const plan = (first && text(first.message).match(/plans\/qwen\/queue\/([\w.-]+\.md)/)?.[1]) ?? null;
  const t0 = ms(head?.timestamp ?? msgs[0]?.timestamp), tEnd = ms(msgs.at(-1)?.timestamp ?? t0);
  const by = {}, add = (k, t) => { by[k] ??= { t: 0, n: 0 }; by[k].t += t; by[k].n++; };
  const calls = {}, steps = [], turns = [];
  let model = 0, out = 0, thinkChars = 0, writeChars = 0, prev = t0, maxCtx = 0;
  for (const r of msgs) {
    const m = r.message, end = ms(r.timestamp);
    if (m.role === 'assistant') {
      const start = Math.max(prev, ms(m.timestamp ?? prev)), t = Math.max(0, end - start), u = m.usage ?? {};
      model += t; out += u.output ?? 0; maxCtx = Math.max(maxCtx, (u.input ?? 0) + (u.cacheRead ?? 0));
      for (const c of m.content ?? []) {
        if (c.type === 'thinking') thinkChars += (c.thinking ?? '').length;
        if (c.type === 'text') writeChars += (c.text ?? '').length;
        if (c.type === 'toolCall') { calls[c.id] = c; if (c.name === 'edit' || c.name === 'write') writeChars += JSON.stringify(c.arguments ?? {}).length; }
      }
      turns.push({ t, at: start - t0, out: u.output ?? 0, ctx: (u.input ?? 0) + (u.cacheRead ?? 0), after: steps.at(-1)?.k ?? 'the prompt' });
    } else if (m.role === 'toolResult') {
      const c = calls[m.toolCallId] ?? { name: m.toolName }, k = kind(c.name ?? m.toolName, c.arguments), t = Math.max(0, end - prev);
      add(k, t); steps.push({ k, t, at: prev - t0, cmd: (c.arguments?.command ?? c.arguments?.path ?? '').slice(0, 90) });
    }
    prev = end;
  }
  const wall = tEnd - t0, tools = Object.values(by).reduce((s, v) => s + v.t, 0);
  return { file, plan, wall, model, tools, by, out, thinkChars, writeChars, turns, steps, maxCtx, nTurns: turns.length };
}

function render(a) {
  const L = [`# Where the time went: ${a.plan ?? a.file}`, '',
    `Wall time ${mm(a.wall)}: the model's own turns ${mm(a.model)} (${pct(a.model, a.wall)}), tools ${mm(a.tools)} (${pct(a.tools, a.wall)}).`,
    `${a.nTurns} model turns, ${a.out} tokens written (${a.model ? (a.out / (a.model / 1000)).toFixed(0) : 0}/s over its turns, prompt reading included); ` +
    `thinking ${a.thinkChars} characters vs ${a.writeChars} of text and code; largest prompt ${a.maxCtx} tokens.`, '',
    '| kind | runs | time | share |', '|---|---|---|---|',
    `| the model's own turns | ${a.nTurns} | ${mm(a.model)} | ${pct(a.model, a.wall)} |`,
    ...Object.entries(a.by).sort((x, y) => y[1].t - x[1].t).map(([k, v]) => `| ${k} | ${v.n} | ${mm(v.t)} | ${pct(v.t, a.wall)} |`), '',
    '## Slowest model turns (what it had just done)', '',
    ...[...a.turns].sort((x, y) => y.t - x.t).slice(0, 8).map((t) => `- ${mm(t.t)} at ${mm(t.at)}, after ${t.after}: ${t.out} tokens written, prompt ${t.ctx}`), '',
    '## Timeline (tool runs over 10 s)', '',
    ...a.steps.filter((s) => s.t > 10000).map((s) => `- ${mm(s.at)}: ${s.k}, ${(s.t / 1000).toFixed(0)} s (${s.cmd.replace(/\|/g, '/')})`)];
  return L.join('\n') + '\n';
}

function sessionFiles() {
  const roots = ['.cache/pi-sessions', join(process.env.PI_CODING_AGENT_DIR ?? join(homedir(), '.pi', 'agent'), 'sessions')];
  const out = [], walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : f.endsWith('.jsonl') && out.push(p); } };
  for (const r of roots) if (existsSync(r)) walk(r);
  return out;
}

{
  const args = process.argv.slice(2);
  if (args[0] && !args[0].startsWith('--')) { process.stdout.write(render(analyse(args[0]))); process.exit(0); }
  if (!args.includes('--all')) { console.log('usage: node scripts/qwen-times.mjs <session.jsonl> | --all [--write] [--push]'); process.exit(1); }
  const latest = {};
  for (const f of sessionFiles()) {
    let a; try { a = analyse(f); } catch { continue; }
    if (a.plan && a.nTurns && (!latest[a.plan] || statSync(f).mtimeMs > statSync(latest[a.plan].file).mtimeMs)) latest[a.plan] = a;
  }
  const plans = Object.keys(latest).sort();
  if (!plans.length) { console.log('no pi sessions of Qwen plans found'); process.exit(1); }
  console.log('plan | wall | model | inspect | orbit | pictures read | own scripts | tests+costs');
  const g = (a, ...ks) => mm(ks.reduce((s, k) => s + (a.by[k]?.t ?? 0), 0));
  for (const p of plans) { const a = latest[p]; console.log(`${p} | ${mm(a.wall)} | ${mm(a.model)} | ${g(a, 'inspect (whole run)', 'inspect --look (close-up)')} | ${g(a, 'orbit render')} | ${g(a, 'read a picture')} | ${g(a, 'own node scripts (measuring)')} | ${g(a, 'npm test', 'cost check')}`); }
  if (args.includes('--write') || args.includes('--push')) {
    mkdirSync('plans/qwen/logs', { recursive: true });
    const files = plans.map((p) => { const f = `plans/qwen/logs/${p.replace(/\.md$/, '')}.times.md`; writeFileSync(f, render(latest[p])); return f; });
    console.log(`written: ${files.length} files in plans/qwen/logs/`);
    if (args.includes('--push')) {
      execSync(`git add ${files.join(' ')}`); execSync('git commit -q -m "Qwen: where the time went (pi sessions)"');
      execSync(`git push -q origin ${execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()}`); console.log('pushed');
    }
  }
}
