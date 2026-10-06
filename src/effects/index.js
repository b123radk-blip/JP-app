// Effect registry. An effect is `create({ kanji, glyphHeight }) -> { group, strokesEnd, step(t, dt), reset(), setPassthrough(bool), dispose() }`.
// t is seconds since the card started; `strokesEnd` is when its last stroke finishes (the card's text stages key off it).
import * as sun from './sun.js';
import * as fire from './fire.js';
import * as basic from './default.js';
import { DEFAULT_EFFECT } from './ids.js';

const registry = { sun, fire, [DEFAULT_EFFECT]: basic };
export const createEffect = (id, opts) => (registry[id] || registry[DEFAULT_EFFECT]).create(opts);
