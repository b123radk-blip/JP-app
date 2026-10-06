// Writes the docs/EFFECTS-PLAN.md rows of the kanji designed by hand in scripts/data/kanji-designs.json (between the
// "designs" markers), so the plan table and the designs never disagree. The cards themselves are the truth after review.
// Usage: node scripts/plan-from-designs.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { parseSpec, PIECES } from '../src/effects/catalog.js';

const designs = JSON.parse(readFileSync('scripts/data/kanji-designs.json', 'utf8'));
const cell = (slot, v) => { if (v == null) return null; const s = parseSpec(slot, v), k = PIECES[slot]?.[s.type]?.variant; return k && s[k] != null ? `${s.type}:${s[k]}` : s.type; };   // type:variant, as the table notation
const list = (slot, xs) => (xs ?? []).map((x) => cell(slot, x)).join(', ') || '—';
const groups = {};
for (const [k, d] of Object.entries(designs)) {
  const e = d.effect, mat = typeof e.material === 'string' ? e.material : e.material?.preset ?? 'glow';
  const back = [cell('backdrop', e.backdrop) ?? 'plain', ...(e.scene ?? []).map((s) => cell('scene', s))].join(' + ');
  const parts = Object.entries(e.parts ?? {}).map(([el, p]) => (p?.material ? `${el}=${cell('material', p.material)}` : el)).join(' ') || '—';
  (groups[d.group] ??= []).push(`| ${k} | ${d.group} | ${mat} | ${cell('reveal', e.reveal) ?? 'draw'} | ${list('particles', e.particles)} | ${back} | ${cell('motion', e.motion) ?? 'none'} | ${cell('emblem', e.emblem) ?? '—'} | ${parts} | ${d.mnemonic.replace(/\|/g, '/')} |`);
}
const head = '| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |\n|---|---|---|---|---|---|---|---|---|---|';
const body = Object.entries(groups).map(([g, rows]) => `#### ${g[0].toUpperCase()}${g.slice(1)}\n\n${head}\n${rows.join('\n')}`).join('\n\n');
const path = 'docs/EFFECTS-PLAN.md', doc = readFileSync(path, 'utf8'), A = '<!-- designs:start -->', B = '<!-- designs:end -->';
const block = `${A}\n### N5 part 2 (Step 2): designed by hand (generated from scripts/data/kanji-designs.json)\n\n${body}\n${B}`;
writeFileSync(path, doc.includes(A) ? doc.replace(new RegExp(`${A}[\\s\\S]*${B}`), block) : doc.replace('\n## Too alike', `\n${block}\n\n## Too alike`));
console.log(`${Object.keys(designs).length} design rows written to ${path}`);
