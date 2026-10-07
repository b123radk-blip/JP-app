// How alike two normalized recipes are (0 = nothing shared, 1 = identical), slot by slot with the weights in config.
// Used by scripts/check-recipes.mjs to flag cards in a deck (and rows of the audit plan) whose animations would look the same.
import { EFFECTS } from '../config.js';
import { PIECES } from './catalog.js';

// The option that tells two pieces of the same type apart (preset, direction, count ...).
const variantOf = (slot, s) => { const k = PIECES[slot]?.[s.type]?.variant; return k ? s[k] : (s.variant ?? s.color ?? null); };
function specSim(slot, a, b) {
  if (!a && !b) return 1;
  if (!a || !b || a.type !== b.type) return 0;
  if (a.type === 'word') {                                     // word cards: their "material" is their kanji, compared by overlap
    const A = new Set(String(a.preset).split('+')), B = new Set(String(b.preset).split('+'));
    return [...A].filter((k) => B.has(k)).length / new Set([...A, ...B]).size;
  }
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

// Slots that neither recipe uses (no particles, no scene prop, no emblem, no styled parts) say nothing about whether two
// cards look alike, so they are left out of the score; material, reveal, backdrop and motion always count. Identical
// recipes still score 1. (Counting "both empty" as a match made any two sparse cards with the same sky look alike.)
const OPTIONAL = { particles: (r) => r.particles.length > 0, scene: (r) => (r.scene ?? []).length > 0, emblem: (r) => !!r.emblem, parts: (r) => Object.keys(r.parts).length > 0, vignette: (r) => !!r.vignette };

// Scene cards (the "vignette" slot) are compared by their scene alone: the scene is what the learner remembers, so two
// cards acting out the same scene look alike whatever else differs (1), and different scenes do not match on the shared
// sky or material underneath (0). The same scene with another outcome (上手 / 下手: one set-up, two endings, told apart by
// the scene's variant option) scores EFFECTS.similarity.sceneVariant, just under the warning line: a pair made on purpose.
// A scene card and a card without one are compared slot by slot, the scene counting as an unshared slot with the largest weight.
function sceneSim(a, b) {
  if (a.type !== b.type) return 0;
  return variantOf('vignette', a) === variantOf('vignette', b) ? 1 : EFFECTS.similarity.sceneVariant;
}

// Returns { score, slots: { slot: 0..1 } } (slots used by neither recipe are left out).
export function recipeSimilarity(a, b, weights = EFFECTS.similarity.weights) {
  if (a.vignette && b.vignette) { const v = sceneSim(a.vignette, b.vignette); return { score: v, slots: { vignette: v } }; }
  const slots = {
    material: specSim('material', a.material, b.material),
    reveal: a.reveal.type === b.reveal.type ? (a.reveal.tip === b.reveal.tip ? 1 : 0.5) : 0,
    particles: layersSim(a.particles, b.particles),
    scene: layersSim(a.scene ?? [], b.scene ?? [], 'scene'),
    backdrop: specSim('backdrop', a.backdrop, b.backdrop),
    motion: specSim('motion', a.motion, b.motion),
    emblem: specSim('emblem', a.emblem, b.emblem),
    parts: partsSim(a.parts, b.parts),
    vignette: specSim('vignette', a.vignette, b.vignette),        // only one has a scene here: 0, and it weighs the most
  };
  for (const [k, used] of Object.entries(OPTIONAL)) if (!used(a) && !used(b)) delete slots[k];
  let s = 0, w = 0;
  for (const [k, v] of Object.entries(slots)) { s += v * weights[k]; w += weights[k]; }
  return { score: s / w, slots };
}
