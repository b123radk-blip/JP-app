// Reads the recipe table of docs/EFFECTS-PLAN.md:
// | kanji | group | material | reveal | particles | backdrop (+ scene props) | motion | emblem | parts | mnemonic |
import { readFileSync } from 'node:fs';
import { normalizeRecipe } from '../../src/effects/catalog.js';
import { COMPONENT_LOOKS } from '../../src/config.js';

export function readPlan(path = 'docs/EFFECTS-PLAN.md') {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const c = line.split('|').slice(1, -1).map((x) => x.trim());
    if (c.length < 10 || [...c[0]].length !== 1 || !/[一-鿿]/.test(c[0])) continue;
    const none = (x) => (!x || x === '—' ? null : x);
    const effect = { material: none(c[2]) ?? 'glow', reveal: none(c[3]) ?? 'draw', particles: (none(c[4]) ?? '').split(',').map((x) => x.trim()).filter(Boolean), backdrop: (none(c[5]) ?? 'plain').split('+')[0].trim(), scene: (none(c[5]) ?? '').split('+').slice(1).map((x) => x.trim()).filter(Boolean), motion: none(c[6]) ?? 'none', emblem: none(c[7]), parts: Object.fromEntries((none(c[8]) ?? '').split(/\s+/).filter(Boolean).map((p) => { const [el, m] = p.split('='); return [el, m ? { material: m } : {}]; })) };
    rows.push({ name: c[0], group: c[1], effect, recipe: normalizeRecipe(effect, COMPONENT_LOOKS), mnemonic: c[9].replace(/^\*pilot\*\s*/, '') });
  }
  return rows;
}
