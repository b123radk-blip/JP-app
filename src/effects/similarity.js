// How alike two normalized recipes are (0 = nothing shared, 1 = identical), slot by slot with the weights in config.
// Used by scripts/check-recipes.mjs to flag cards in a deck (and rows of the audit plan) whose animations would look the same.
import { EFFECTS } from '../config.js';
import { PIECES } from './catalog.js';

// The option that tells two pieces of the same type apart (preset, direction, count ...).
const variantOf = (slot, s) => { const k = PIECES[slot]?.[s.type]?.variant; return k ? s[k] : (s.variant ?? s.color ?? null); };
function specSim(slot, a, b) {
  if (!a && !b) return 1;
  if (!a || !b || a.type !== b.type) return 0;
  return variantOf(slot, a) === variantOf(slot, b) ? 1 : 0.4;
}
function layersSim(a, b, slot = 'particles') {
  if (!a.length && !b.length) return 1;
  const best = (x, ys) => Math.max(0, ...ys.map((y) => specSim(slot, x, y)));
  return (a.reduce((s, x) => s + best(x, b), 0) + b.reduce((s, y) => s + best(y, a), 0)) / (a.length + b.length);
}
function partsSim(a, b) {
  const key = (el, p) => `${el}:${p.material?.preset ?? p.material?.type ?? ''}:${p.motion?.type ?? ''}`;
  const A = new Set(Object.entries(a).map(([el, p]) => key(el, p))), B = new Set(Object.entries(b).map(([el, p]) => key(el, p)));
  if (!A.size && !B.size) return 1;
  return [...A].filter((k) => B.has(k)).length / new Set([...A, ...B]).size;
}

// Returns { score, slots: { slot: 0..1 } }.
export function recipeSimilarity(a, b, weights = EFFECTS.similarity.weights) {
  const slots = {
    material: specSim('material', a.material, b.material),
    reveal: a.reveal.type === b.reveal.type ? (a.reveal.tip === b.reveal.tip ? 1 : 0.5) : 0,
    particles: layersSim(a.particles, b.particles),
    scene: layersSim(a.scene ?? [], b.scene ?? [], 'scene'),
    backdrop: specSim('backdrop', a.backdrop, b.backdrop),
    motion: specSim('motion', a.motion, b.motion),
    emblem: specSim('emblem', a.emblem, b.emblem),
    parts: partsSim(a.parts, b.parts),
  };
  let s = 0, w = 0;
  for (const [k, v] of Object.entries(slots)) { s += v * weights[k]; w += weights[k]; }
  return { score: s / w, slots };
}
