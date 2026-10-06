// Cards -> recipes comparable by src/effects/similarity.js. A word's "material" is its set of kanji (each keeps its own
// look), so two words differ by their kanji first and by their scene second.
import { readFileSync, readdirSync } from 'node:fs';
import { normalizeRecipe } from '../../src/effects/catalog.js';
import { COMPONENT_LOOKS } from '../../src/config.js';

export function cardRecipe(card) {
  const r = normalizeRecipe(card.effect, COMPONENT_LOOKS);
  if (card.type === 'word') { r.material = { type: 'word', preset: (card.kanji ?? []).join('+') || card.word }; r.parts = {}; }
  return r;
}
export const loadCards = (dir = 'content/cards') => Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => [f.slice(0, -5), JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))]));
