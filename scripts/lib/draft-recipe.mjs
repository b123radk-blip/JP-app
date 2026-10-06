// Drafts a recipe for a new card. Kanji: from its row in docs/EFFECTS-PLAN.md, with pieces that do not exist yet replaced
// by the closest existing one (and reported as "wanted"). Words: from word-rules.mjs; the kanji keep their own looks.
// Then: dark materials get a light sky, and draft-cards.mjs varies the draft until no other card looks alike.
import { PIECES, PARTICLE_KINDS, parseSpec } from '../../src/effects/catalog.js';
import { MATERIALS, SKIES } from '../../src/config.js';
import { wordRule } from './word-rules.mjs';

const FALLBACK = {
  reveal: { grow: 'draw:sparks', stamp: 'draw:dust', brush: 'draw', split: 'draw', assemble: 'draw:sparks', carve: 'draw:dust', pour: 'draw:drops' },
  particles: { footprints: 'dust', kana: 'notes', arcs: 'sparks' },
  motion: { open: 'none', split: 'pulse', stack: 'count:3' },
  emblem: { 'arrow:toward': 'arrow:down', 'arrow:away': 'arrow:up', sundial: 'clock', chopsticks: 'dots:2', dice: 'dots:6' },
  // backdrop names in the plan that are scene props now (or a sky that stands in for them)
  place: { road: ['road', 'sky:day'], room: ['room', 'sky:indoor'], field: ['field', 'sky:day'], gate: ['gate', 'sky:dusk'], kitchen: ['room', 'sky:indoor'], school: ['room', 'sky:indoor'],
    station: ['road', 'sky:dusk'], market: ['room', 'sky:indoor'], map: [null, 'plain'], calendar: [null, 'sky:indoor'], seasons: [null, 'sky:golden'], ground: [null, 'sky:day'] },
};
const DARK_MATERIALS = new Set(['ink', 'metal']);
// dark materials (ink, metal) need a light sky behind them, also in a word that has a kanji drawn in one, and no dark
// scene prop right behind the strokes (a road): then the draft takes the light counterpart
export const isDark = (effect) => DARK_MATERIALS.has(parseSpec('material', effect?.material)?.preset ?? effect?.material);
export const DARK_SCENES = new Set(['road']);
const LIGHTER = { ink: 'chalk', metal: 'silver' };
const onDarkScene = (r) => (r.scene ?? []).some((p) => DARK_SCENES.has(parseSpec('scene', p)?.type));
export const LIGHT_SKIES = ['sky:noon', 'sky:day', 'sky:snow', 'sky:morning', 'sky:dawn'];
export const ALL_SKIES = ['sky:night', 'sky:dusk', 'sky:twilight', 'sky:golden', 'sky:morning', 'sky:noon', 'sky:dawn', 'sky:day', 'sky:forest', 'sky:deep', 'sky:lake', 'sky:sunset', 'sky:snow', 'sky:indoor', 'sky:storm'];
const ARROW_DIRS = ['up', 'down', 'left', 'right'];

const exists = (slot, v) => {
  const s = parseSpec(slot, v); if (!s) return true;
  const piece = PIECES[slot][s.type]; if (!piece) return false;
  if (slot === 'material' && s.preset && !MATERIALS[s.preset]) return false;
  if (slot === 'backdrop' && s.type === 'sky' && !SKIES[s.preset]) return false;
  if (slot === 'reveal' && s.tip && !PARTICLE_KINDS[s.tip]) return false;
  if (slot === 'emblem' && s.type === 'arrow' && !ARROW_DIRS.includes(s.dir)) return false;
  return true;
};

// planRow.effect: raw cells (strings). components: the kanji's KanjiVG components (parts must exist there).
export function draftKanji(planRow, components = []) {
  const e = planRow.effect, wanted = [], out = {};
  const keep = (slot, v, fb) => { if (v == null || exists(slot, v)) return v; wanted.push(`${slot}:${v}`); return fb; };
  out.material = keep('material', e.material, 'cyan');
  out.reveal = keep('reveal', e.reveal, FALLBACK.reveal[e.reveal] ?? 'draw');
  out.particles = e.particles.map((p) => keep('particles', p, FALLBACK.particles[p] ?? null)).filter(Boolean).slice(0, 2);
  out.scene = e.scene.map((p) => keep('scene', p, null)).filter(Boolean);
  if (exists('backdrop', e.backdrop)) out.backdrop = e.backdrop;
  else if (FALLBACK.place[e.backdrop]) { const [prop, sky] = FALLBACK.place[e.backdrop]; if (prop && PIECES.scene[prop]) out.scene.unshift(prop); else if (!PIECES.scene[e.backdrop]) wanted.push(`backdrop:${e.backdrop}`); out.backdrop = sky; }
  else { wanted.push(`backdrop:${e.backdrop}`); out.backdrop = 'sky:day'; }
  out.scene = out.scene.slice(0, 2);
  out.motion = keep('motion', e.motion, FALLBACK.motion[e.motion] ?? 'none');
  out.emblem = keep('emblem', e.emblem, FALLBACK.emblem[e.emblem] ?? null);
  const parts = Object.fromEntries(Object.entries(e.parts).filter(([el]) => components.some((c) => c.element === el)));
  if (Object.keys(parts).length) out.parts = parts;
  return finish(out, wanted, planRow.name);
}

// item: a word from the curriculum work list
// kanjiEffects: the recipes of the word's kanji cards (their looks are kept, so a dark one needs a light sky)
export function draftWord(item, kanjiEffects = []) {
  const { rule, recipe } = wordRule(item), out = { material: 'ivory', reveal: 'draw', ...structuredClone(recipe) };
  out.particles = (out.particles ?? []).filter((p) => exists('particles', p));
  out.scene = (out.scene ?? []).filter((p) => exists('scene', p));
  if (!out.backdrop) out.backdrop = ALL_SKIES[hash(item.word) % ALL_SKIES.length];
  return { ...finish(out, [], item.word, kanjiEffects.some(isDark)), rule };
}

// dark materials need a light sky; drop empty slots so the card JSON stays short
function finish(r, wanted, key, dark = false) {
  if (isDark(r) && onDarkScene(r)) r.material = LIGHTER[parseSpec('material', r.material)?.preset ?? r.material];
  const sky = parseSpec('backdrop', r.backdrop);
  if ((dark || isDark(r)) && !(sky?.type === 'sky' && LIGHT_SKIES.includes(`sky:${sky.preset}`))) r.backdrop = LIGHT_SKIES[hash(key) % LIGHT_SKIES.length];
  for (const k of ['particles', 'scene']) if (!r[k]?.length) delete r[k];
  if (!r.emblem) delete r.emblem;
  if (r.motion === 'none') delete r.motion;
  return { effect: r, wanted };
}
export const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.codePointAt(0)) >>> 0, 7);
