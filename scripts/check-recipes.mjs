// Flags cards whose animations would look nearly the same (distinctness is the point of the app).
// Usage: node scripts/check-recipes.mjs                 every enabled deck (part of `npm test`: fails at EFFECTS.similarity.fail)
//        node scripts/check-recipes.mjs --plan [--write]   the recipe table in docs/EFFECTS-PLAN.md: similar pairs, missing pieces
//                                                          (--write refreshes the generated sections of that file)
// Cards without an "effect" all share the default recipe; they are counted as "no recipe yet", not compared.
import { readFileSync, writeFileSync } from 'node:fs';
import { EFFECTS, COMPONENT_LOOKS, MATERIALS, SKIES } from '../src/config.js';
import { normalizeRecipe, describeRecipe, parseSpec, PIECES, PARTICLE_KINDS, SLOTS } from '../src/effects/catalog.js';
import { recipeSimilarity } from '../src/effects/similarity.js';
import { readPlan } from './lib/plan-table.mjs';
import { cardRecipe } from './lib/similar-cards.mjs';
import { lookalikePairs } from './lib/lookalike.mjs';
import { isDark, LIGHT_SKIES, DARK_SCENES } from './lib/draft-recipe.mjs';

const { warn, fail } = EFFECTS.similarity;
const args = process.argv.slice(2), verbose = args.includes('--verbose');

function pairs(items) {                                    // items: [{ name, recipe }] -> pairs at or above `warn`, most alike first
  const out = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const s = recipeSimilarity(items[i].recipe, items[j].recipe);
    if (s.score >= warn) out.push({ a: items[i], b: items[j], ...s });
  }
  return out.sort((x, y) => y.score - x.score);
}
const shared = (p) => Object.entries(p.slots).filter(([, v]) => v === 1).map(([k]) => k).join(', ');

// pieces (or presets) a plan row names that do not exist yet
function missing(rows) {
  const need = new Map(), note = (key, k) => { if (!need.has(key)) need.set(key, []); need.get(key).push(k); };
  for (const r of rows) {
    const specs = [...SLOTS.filter((s) => !['particles', 'scene'].includes(s)).map((s) => [s, r.recipe[s]]), ...r.recipe.particles.map((p) => ['particles', p]), ...r.recipe.scene.map((p) => ['scene', p]), ...Object.values(r.recipe.parts).flatMap((p) => [['material', p.material], ['motion', p.motion]])];
    for (const [slot, s] of specs) {
      if (!s || (slot === 'backdrop' && PIECES.scene[s.type])) continue;     // a place named as backdrop is a scene prop now
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
  const items = withRecipe.map((c) => ({ id: c.id, name: `${c.word ?? c.kanji} ${c.id}`, recipe: cardRecipe(c) }));
  const sim = pairs(items);
  console.log(`deck ${d.id}: ${withRecipe.length} recipes (${withRecipe.filter((c) => c.type === 'word').length} words), ${cards.length - withRecipe.length} cards with no recipe yet (default animation)`);
  for (const p of sim) {
    const bad = p.score >= fail; failed += bad;
    if (bad || verbose) console.log(`  ${bad ? 'TOO SIMILAR' : 'similar    '} ${p.a.name} ~ ${p.b.name}: ${p.score.toFixed(2)} (same: ${shared(p)})`);
    if (bad) console.log(`      ${describeRecipe(p.a.recipe)}\n      ${describeRecipe(p.b.recipe)}`);
  }
  console.log(`  ${sim.length} pair(s) at or above ${warn}${sim.length && !verbose ? ' (list them with --verbose)' : ''}`);
  // kanji that look alike must animate very differently
  const byId = Object.fromEntries(items.map((x) => [x.id, x]));
  for (const [a, b] of lookalikePairs(withRecipe.filter((c) => c.type !== 'word').map((c) => c.id))) {
    const s = recipeSimilarity(byId[a].recipe, byId[b].recipe).score;
    if (s >= EFFECTS.similarity.lookalike) { failed++; console.log(`  LOOK-ALIKE KANJI TOO SIMILAR ${byId[a].name} ~ ${byId[b].name}: ${s.toFixed(2)} (must be < ${EFFECTS.similarity.lookalike})`); }
  }
  // dark materials (ink, metal) need a light sky behind them, also in words (a kanji keeps its card's look there)
  const byCard = Object.fromEntries(cards.map((c) => [c.id, c]));
  for (const c of withRecipe) {
    const sky = parseSpec('backdrop', c.effect.backdrop), light = sky?.type === 'sky' && LIGHT_SKIES.includes(`sky:${sky.preset}`);
    const darkProp = (c.effect.scene ?? []).map((p) => parseSpec('scene', p)?.type).find((t) => DARK_SCENES.has(t));
    if ((!light || darkProp) && [c.effect, ...(c.type === 'word' ? c.kanji.map((k) => byCard[k]?.effect) : [])].some(isDark)) { failed++; console.log(`  DARK ON DARK ${c.word ?? c.kanji} ${c.id}: ink or metal in front of ${darkProp ? `a ${darkProp}` : `"${c.effect.backdrop ?? 'plain'}"`} (use ${LIGHT_SKIES.join(', ')} and no ${[...DARK_SCENES].join(' / ')}, or silver / chalk)`); }
  }
}
if (failed) { console.error(`recipe check FAILED: ${failed} problem(s), listed above. Change a slot (backdrop, particles, emblem, material ...) until they pass.`); process.exit(1); }
console.log('recipe check ok');
