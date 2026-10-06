// Effect entry point. A card's "effect" is a recipe object (built by compose.js from the pieces in catalog.js), missing
// (DEFAULT_RECIPE), or a bespoke id string for a hand-written effect module. Either way the result is
// `{ group, strokesEnd, step(t, dt), reset(), setPassthrough(bool), dispose(), stats?() }`; t is seconds since the card
// started and `strokesEnd` is when the last stroke finishes (the card's text stages key off it).
import { COMPONENT_LOOKS, EFFECTS } from '../config.js';
import { normalizeRecipe } from './catalog.js';
import { composeEffect } from './compose.js';

const BESPOKE = {};                                    // id -> module with create({ kanji, glyphHeight }); ids also in ids.js

// opts: { kanji: strokeData, glyphHeight } for a kanji card, or { word: { glyphs: [{ data, taught, effect }] }, glyphHeight }
export function createEffect(effect, opts) {
  if (opts.word) {                                    // each taught kanji brings its own card's recipe (its materials and parts)
    const look = (kind) => (EFFECTS.glyphLooks[kind] ? normalizeRecipe({ material: EFFECTS.glyphLooks[kind] }).material : null);
    const glyphs = opts.word.glyphs.map((g) => ({ data: g.data, kind: g.kind, material: look(g.kind), recipe: g.taught && typeof g.effect !== 'string' ? normalizeRecipe(g.effect, COMPONENT_LOOKS) : null }));
    const kanaOnly = glyphs.every((g) => g.kind === 'hiragana' || g.kind === 'katakana');
    opts = { ...opts, word: { glyphs, maxWidth: kanaOnly && glyphs.length > 4 ? EFFECTS.word.kanaMaxWidth : EFFECTS.word.maxWidth } };
  }
  const recipe = normalizeRecipe(effect, COMPONENT_LOOKS);
  if (recipe.bespoke) return BESPOKE[recipe.bespoke] ? BESPOKE[recipe.bespoke].create(opts) : composeEffect({ ...opts, recipe: normalizeRecipe(undefined) });
  if (opts.word && effect === undefined) recipe.material = normalizeRecipe({ material: 'ivory' }).material;   // kana default
  return composeEffect({ ...opts, recipe });
}
