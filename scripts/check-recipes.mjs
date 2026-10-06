// Flags cards whose animations would look nearly the same (distinctness is the point of the app).
// Usage: node scripts/check-recipes.mjs                 every enabled deck (part of `npm test`: fails at EFFECTS.similarity.fail)
//        node scripts/check-recipes.mjs --plan [--write]   the recipe table in docs/EFFECTS-PLAN.md: similar pairs, missing pieces
//                                                          (--write refreshes the generated sections of that file)
// Cards without an "effect" all share the default recipe; they are counted as "no recipe yet", not compared.
import { readFileSync, writeFileSync } from 'node:fs';
import { EFFECTS, COMPONENT_LOOKS, MATERIALS, SKIES } from '../src/config.js';
import { normalizeRecipe, describeRecipe, PIECES, PARTICLE_KINDS, SLOTS } from '../src/effects/catalog.js';
import { recipeSimilarity } from '../src/effects/similarity.js';

const { warn, fail } = EFFECTS.similarity;
const args = process.argv.slice(2);

function pairs(items) {                                    // items: [{ name, recipe }] -> pairs at or above `warn`, most alike first
  const out = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const s = recipeSimilarity(items[i].recipe, items[j].recipe);
    if (s.score >= warn) out.push({ a: items[i], b: items[j], ...s });
  }
  return out.sort((x, y) => y.score - x.score);
}
const shared = (p) => Object.entries(p.slots).filter(([, v]) => v === 1).map(([k]) => k).join(', ');

// ---- the audit plan: a markdown table | kanji | group | material | reveal | particles | backdrop (+ scene props) | motion | emblem | parts | mnemonic |
function readPlan(path) {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const c = line.split('|').slice(1, -1).map((x) => x.trim());
    if (c.length < 10 || [...c[0]].length !== 1 || !/[一-鿿]/.test(c[0])) continue;
    const none = (x) => (!x || x === '—' ? null : x);
    const effect = { material: none(c[2]) ?? 'glow', reveal: none(c[3]) ?? 'draw', particles: (none(c[4]) ?? '').split(',').map((x) => x.trim()).filter(Boolean), backdrop: (none(c[5]) ?? 'plain').split('+')[0].trim(), scene: (none(c[5]) ?? '').split('+').slice(1).map((x) => x.trim()).filter(Boolean), motion: none(c[6]) ?? 'none', emblem: none(c[7]), parts: Object.fromEntries((none(c[8]) ?? '').split(/\s+/).filter(Boolean).map((p) => { const [el, m] = p.split('='); return [el, m ? { material: m } : {}]; })) };
    rows.push({ name: c[0], group: c[1], effect, recipe: normalizeRecipe(effect, COMPONENT_LOOKS) });
  }
  return rows;
}
// pieces (or presets) a plan row names that do not exist yet
function missing(rows) {
  const need = new Map(), note = (key, k) => { if (!need.has(key)) need.set(key, []); need.get(key).push(k); };
  for (const r of rows) {
    const specs = [...SLOTS.filter((s) => !['particles', 'scene'].includes(s)).map((s) => [s, r.recipe[s]]), ...r.recipe.particles.map((p) => ['particles', p]), ...r.recipe.scene.map((p) => ['scene', p]), ...Object.values(r.recipe.parts).flatMap((p) => [['material', p.material], ['motion', p.motion]])];
    for (const [slot, s] of specs) {
      if (!s) continue;
      if (!PIECES[slot][s.type]) note(slot === 'material' ? `material preset (data only): ${s.type}` : PARTICLE_KINDS[s.type]?.tip ? `particles: ${s.type} as a layer (the tip kind exists; needs an emitter)` : `${slot}: ${s.type}`, r.name);
      else if (slot === 'material' && s.preset && !MATERIALS[s.preset]) note(`material preset (data only): ${s.preset}`, r.name);
      else if (slot === 'backdrop' && s.type === 'sky' && !SKIES[s.preset]) note(`sky preset (data only): ${s.preset}`, r.name);
      else if (slot === 'reveal' && s.tip && !PARTICLE_KINDS[s.tip]) note(`tip particles: ${s.tip}`, r.name);
    }
  }
  return [...need.entries()].sort((a, b) => b[1].length - a[1].length);
}

if (args[0] === '--plan') {
  const path = 'docs/EFFECTS-PLAN.md', rows = readPlan(path);
  const sim = pairs(rows), miss = missing(rows);
  const simText = sim.length ? sim.map((p) => `- ${p.score >= fail ? '**' : ''}${p.a.name} ~ ${p.b.name} ${p.score.toFixed(2)}${p.score >= fail ? '**' : ''} (same: ${shared(p)})`).join('\n') : '- none';
  const missText = miss.map(([k, v]) => `- ${k} — ${v.length}: ${[...new Set(v)].join(' ')}`).join('\n');
  console.log(`${rows.length} plan rows\n\nSimilar pairs (>= ${warn}):\n${simText}\n\nMissing pieces:\n${missText}`);
  if (args.includes('--write')) {
    let doc = readFileSync(path, 'utf8');
    const put = (tag, body) => { doc = doc.replace(new RegExp(`(<!-- generated:${tag} -->)[\\s\\S]*?(<!-- /generated:${tag} -->)`), `$1\n${body}\n$2`); };
    put('similar', `${sim.length} pairs at or above ${warn} (bold: at or above ${fail}, which \`npm test\` would reject in a deck):\n\n${simText}`);
    put('missing', `${miss.length} pieces or presets named in the table above that do not exist yet (with the kanji that need them):\n\n${missText}`);
    writeFileSync(path, doc); console.log(`\nupdated ${path}`);
  }
  process.exit(0);
}

// ---- decks ----
const index = JSON.parse(readFileSync('content/decks/index.json', 'utf8'));
let failed = 0;
for (const d of index.decks.filter((x) => x.enabled)) {
  const ids = JSON.parse(readFileSync(`content/decks/${d.file}`, 'utf8')).cards;
  const cards = ids.map((id) => JSON.parse(readFileSync(`content/cards/${id}.json`, 'utf8')));
  const withRecipe = cards.filter((c) => c.effect && typeof c.effect === 'object');
  const items = withRecipe.map((c) => ({ name: `${c.kanji} ${c.id}`, recipe: normalizeRecipe(c.effect, COMPONENT_LOOKS) }));
  const sim = pairs(items);
  console.log(`deck ${d.id}: ${withRecipe.length} recipes, ${cards.length - withRecipe.length} cards with no recipe yet (default animation)`);
  for (const p of sim) {
    const bad = p.score >= fail; failed += bad;
    console.log(`  ${bad ? 'TOO SIMILAR' : 'similar    '} ${p.a.name} ~ ${p.b.name}: ${p.score.toFixed(2)} (same: ${shared(p)})`);
    if (bad) console.log(`      ${describeRecipe(p.a.recipe)}\n      ${describeRecipe(p.b.recipe)}`);
  }
  if (!sim.length) console.log(`  no pair at or above ${warn}`);
}
if (failed) { console.error(`recipe check FAILED: ${failed} pair(s) at or above ${fail}. Change a slot (backdrop, particles, emblem ...) so they look different.`); process.exit(1); }
console.log('recipe check ok');
