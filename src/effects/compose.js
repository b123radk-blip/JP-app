// Builds a card's animation from a normalized recipe (catalog.js): one piece per slot, plus per-component styling ("parts").
// Scene graph: group (effect space, centred on the kanji)
//   ├ backdrop (sky, lights ...), emblem, world-space particle pools
//   └ glyphPivot (whole-kanji motion) └ glyphSpace └ one pivot group per part (part motion) └ that part's material meshes
//                                                └ glyph-space particle pools (flames ride along with the kanji)
// Every frame: reveal -> backdrop -> materials -> particle layers -> tip particles -> pools -> motions -> emblem.
// Deterministic: all randomness is one seeded generator, reset by reset(), so seek(t) always gives the same picture.
import * as THREE from 'three';
import { EFFECTS } from '../config.js';
import { PIECES, PARTICLE_KINDS } from './catalog.js';
import { normalizeStrokes, WIDTH_UNITS } from '../kanji/tube.js';
import { disposeObject } from '../core/dispose.js';
import { mulberry32 } from './pieces/util.js';
import { createPool } from './pieces/particles.js';
import { createLayer } from './pieces/particle-kinds.js';
import * as reveal from './pieces/reveal.js';
import * as glow from './pieces/material-glow.js';
import * as heat from './pieces/material-heat.js';
import { plain, halo } from './pieces/backdrop-simple.js';
import * as sunrise from './pieces/backdrop-sunrise.js';
import * as sky from './pieces/backdrop-sky.js';
import * as motion from './pieces/motion.js';
import * as emblems from './pieces/emblems.js';

const MATERIALS = { glow: glow.create, heat: heat.create };
const BACKDROPS = { plain, halo, sunrise: sunrise.create, sky: sky.create };
const DEPTH = { glow: 2.0, heat: 1.6 };

// Which strokes each styled part owns. A component listed in recipe.parts claims its strokes (every instance at the shallowest
// depth it occurs, so both 木 of 林); strokes nobody claims form the "rest", drawn with the recipe's own material.
export function assignParts(recipe, components = [], n) {
  const owner = new Array(n).fill(-1), parts = [];
  for (const [el, p] of Object.entries(recipe.parts)) {
    const all = components.filter((c) => c.element === el);
    if (!all.length) continue;
    const depth = Math.min(...all.map((c) => c.depth));
    all.filter((c) => c.depth === depth).forEach((c, index) => {
      const strokes = c.strokes.filter((i) => owner[i] === -1);
      if (!strokes.length) return;
      strokes.forEach((i) => { owner[i] = parts.length; });
      parts.push({ element: el, strokes, material: p.material, motion: p.motion, index });
    });
  }
  const rest = owner.map((o, i) => (o === -1 ? i : -1)).filter((i) => i >= 0);
  if (rest.length) parts.push({ element: null, strokes: rest, material: null, motion: null, index: 0 });
  return parts;
}

function pivotGroup(content, pts, kind) {
  const box = new THREE.Box3().setFromPoints(pts), c = box.getCenter(new THREE.Vector3());
  const pivot = new THREE.Vector3(c.x, kind === 'base' ? box.min.y : c.y, 0);
  const outer = new THREE.Group(), inner = new THREE.Group();
  outer.position.copy(pivot); inner.position.copy(pivot).negate();
  inner.add(content); outer.add(inner);
  return { outer, inner };
}
const pivotOf = (spec) => (spec ? motion.PIVOT[spec.type]?.(spec) ?? 'center' : 'center');

export function composeEffect({ kanji, glyphHeight, recipe: r }) {
  const group = new THREE.Group();
  const { S, strokes } = normalizeStrokes(kanji, glyphHeight);
  strokes.forEach((s, i) => { s.index = i; });
  const radius = (WIDTH_UNITS * S) / 2;
  let gen = mulberry32(1);
  const ctx = { K: glyphHeight / 0.30, S, glyphHeight, strokes, radius, rz: radius * (DEPTH[r.material.type] ?? 2), light: 0, idle: 0, rnd: () => gen(), pools: {} };

  // particle pools, sized from the catalog's per-kind maximum
  const need = {}, want = (kind, count = 1) => { const k = PARTICLE_KINDS[kind]; need[k.pool] = (need[k.pool] || 0) + Math.round(k.max * count); };
  if (r.reveal.type === 'ignite') { want('front'); want('sparks'); } else if (r.reveal.tip) want(r.reveal.tip, r.reveal.rate);
  r.particles.forEach((p) => want(p.type, p.count));
  const glyphPivotSpec = pivotOf(r.motion);
  const allPts = strokes.flatMap((s) => s.pts);
  const glyphSpace = new THREE.Group();
  const { outer: glyphPivot } = pivotGroup(glyphSpace, allPts, glyphPivotSpec);
  group.add(glyphPivot);
  for (const [name, max] of Object.entries(need)) {
    const [blend, space] = name.split('-');
    ctx.pools[name] = createPool(max, ctx.K, blend);
    (space === 'glyph' ? glyphSpace : group).add(ctx.pools[name].mesh);
  }

  const backdropSpec = PIECES.backdrop[r.backdrop.type];
  const start = r.options.start ?? backdropSpec.lead ?? EFFECTS.defaultStart;
  const rev = reveal.create(ctx, r.reveal, start);
  const backdrop = BACKDROPS[r.backdrop.type](ctx, r.backdrop);
  group.add(backdrop.group);

  const mats = [], motions = [];
  for (const part of assignParts(r, kanji.components, strokes.length)) {
    const spec = part.material ?? r.material;
    const mat = MATERIALS[spec.type](ctx, spec, part.strokes);
    const { outer } = pivotGroup(mat.group, part.strokes.flatMap((i) => strokes[i].pts), pivotOf(part.motion));
    glyphSpace.add(outer); mats.push(mat);
    if (part.motion) motions.push(motion.create(ctx, part.motion, outer, part.index));
  }
  motions.push(motion.create(ctx, r.motion, glyphPivot));
  const layers = r.particles.map((p) => createLayer(ctx, p));
  const emblem = r.emblem ? emblems.create(ctx, r.emblem) : null;
  if (emblem) group.add(emblem.group);
  const pools = Object.values(ctx.pools);

  function step(t, dt) {
    rev.step(t); ctx.idle = Math.max(0, t - rev.end);
    backdrop.step(t);
    for (const m of mats) m.step(t);
    for (const l of layers) l.step(t, dt);
    rev.emit(t, dt);
    for (const p of pools) p.update(t, dt);
    for (const m of motions) m.step(t);
    emblem?.step(t);
  }
  function reset() {
    gen = mulberry32(r.options.seed ?? 1234);
    pools.forEach((p) => p.reset()); layers.forEach((l) => l.reset()); rev.reset();
    step(0, 0);
  }
  // what was really built, to compare with the budget (draw calls ~ meshes; lights; particle slots)
  function stats() {
    let drawCalls = 0, pointLights = 0;
    group.traverse((o) => { if (o.isMesh || o.isPoints) drawCalls++; if (o.isPointLight) pointLights++; });
    return { drawCalls, pointLights, particles: pools.reduce((s, p) => s + p.max, 0), alive: pools.reduce((s, p) => s + p.alive, 0) };
  }
  reset();
  return { group, strokesEnd: rev.end, step, reset, stats, setPassthrough: (b) => backdrop.setPassthrough(b), dispose: () => disposeObject(group) };
}
