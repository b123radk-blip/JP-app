// Applies hand-reviewed recipes (and mnemonics) to cards, in the house JSON style, and marks them reviewed.
// Usage: node scripts/set-recipes.mjs fixes.json   (then npm test and a look at the contact sheet)
// fixes.json: { "<card id>": { ...effect } } or { "<card id>": { "effect": { ... }, "mnemonic": "..." } }
// A fix may give only some slots with "merge": true ({ "merge": true, "effect": { "backdrop": "sky:dusk" } }); null removes a slot.
import { readFileSync, writeFileSync } from 'node:fs';
import { formatCard } from './lib/format-card.mjs';

const fixes = JSON.parse(readFileSync(process.argv[2], 'utf8'));
for (const [id, fix] of Object.entries(fixes)) {
  const path = `content/cards/${id}.json`, card = JSON.parse(readFileSync(path, 'utf8'));
  const { effect, mnemonic, merge } = fix.effect ? fix : { effect: fix };
  card.effect = merge ? Object.fromEntries(Object.entries({ ...card.effect, ...effect }).filter(([, v]) => v !== null)) : effect;
  if (mnemonic) card.mnemonic = mnemonic;
  card.review = { ...card.review, recipe: 'reviewed' };
  writeFileSync(path, formatCard(card));
}
console.log(`updated ${Object.keys(fixes).length} card(s)`);
