// Effect entry point. A card's "effect" is a recipe object (built by compose.js from the pieces in catalog.js), missing
// (DEFAULT_RECIPE), or a bespoke id string for a hand-written effect module. Either way the result is
// `{ group, strokesEnd, step(t, dt), reset(), setPassthrough(bool), dispose(), stats?() }`; t is seconds since the card
// started and `strokesEnd` is when the last stroke finishes (the card's text stages key off it).
import { COMPONENT_LOOKS } from '../config.js';
import { normalizeRecipe } from './catalog.js';
import { composeEffect } from './compose.js';

const BESPOKE = {};                                    // id -> module with create({ kanji, glyphHeight }); ids also in ids.js

export function createEffect(effect, opts) {
  const recipe = normalizeRecipe(effect, COMPONENT_LOOKS);
  if (recipe.bespoke) return BESPOKE[recipe.bespoke] ? BESPOKE[recipe.bespoke].create(opts) : composeEffect({ ...opts, recipe: normalizeRecipe(undefined) });
  return composeEffect({ ...opts, recipe });
}
