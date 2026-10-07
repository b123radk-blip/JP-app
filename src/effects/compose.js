// Builds a card's animation from a normalized recipe (catalog.js): one piece per slot, plus per-component styling ("parts").
// A word card passes `word.glyphs` ([{ data, recipe }]): its glyphs are laid out side by side, each kanji in its own card's
// materials (plan.js), and the word recipe adds the scene, backdrop, particles, motion and emblem.
// Scene graph: group (effect space, centred on the kanji)
//   ├ backdrop (sky, lights ...), world-space scene props (mountains, river ...), emblem, world-space particle pools
//   └ glyphPivot (whole-kanji motion) └ glyphSpace └ one pivot group per part (part motion) └ that part's material meshes
//                                                └ glyph-space particle pools (flames ride along with the kanji)
// Every frame: reveal -> stroke motion -> vignette -> backdrop -> materials -> scene props -> particle layers -> tip particles ->
// pools -> motions -> emblem. The vignette (a scene acting out the meaning, vignettes/) may move the whole glyph and single strokes.
// Deterministic: all randomness is one seeded generator, reset by reset(), so seek(t) always gives the same picture.
import * as THREE from 'three';
import { EFFECTS, LAYOUT } from '../config.js';
import { PIECES, PARTICLE_KINDS, REVEAL_TIPS } from './catalog.js';
import { normalizeStrokes, layoutWord, strokeSchedule, WIDTH_UNITS } from '../kanji/tube.js';
import { planKanji, planWord } from './plan.js';
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
import * as strokeMotion from './pieces/motion-strokes.js';
import * as emblems from './pieces/emblems.js';
import * as land from './pieces/props-land.js';
import * as objects from './pieces/props-objects.js';
import * as places from './pieces/props-places.js';
import * as vignettes from './vignettes/index.js';

const MATERIALS = { glow: glow.create, heat: heat.create };
const BACKDROPS = { plain, halo, sunrise: sunrise.create, sky: sky.create };
const DEPTH = { glow: 2.0, heat: 1.6 };
const PROPS = { ...land, ...objects, ...places };

function pivotGroup(content, pts, kind) {
  const box = new THREE.Box3().setFromPoints(pts), c = box.getCenter(new THREE.Vector3());
  const pivot = new THREE.Vector3(c.x, kind === 'base' ? box.min.y : kind === 'top' ? box.max.y : c.y, 0);
  const outer = new THREE.Group(), inner = new THREE.Group();
  outer.position.copy(pivot); inner.position.copy(pivot).negate();
  inner.add(content); outer.add(inner);
  return { outer, inner };
}
const pivotOf = (spec) => (spec ? motion.PIVOT[spec.type]?.(spec) ?? 'center' : 'center');

export function composeEffect({ kanji, glyphHeight, recipe: r, word = null }) {
  const group = new THREE.Group(), W = EFFECTS.word;
  const H = word ? Math.min(W.glyphBox, (word.maxWidth ?? W.maxWidth) / word.glyphs.length) : glyphHeight;
  const laid = word ? layoutWord(word.glyphs.map((g) => g.data), H) : { ...normalizeStrokes(kanji, glyphHeight, LAYOUT.glyphMaxAspect), components: kanji.components };
  const { S, strokes } = laid;
  strokes.forEach((s, i) => { s.index = i; });
  const radius = (WIDTH_UNITS * S) / 2;
  let gen = mulberry32(1);
  const ctx = { K: H / 0.30, S, glyphHeight: H, strokes, radius, rz: radius * (DEPTH[r.material.type] ?? 2), light: 0, idle: 0, rnd: () => gen(), pools: {},
    halfWidth: Math.max(...strokes.flatMap((s) => s.pts.map((p) => Math.abs(p.x)))) };

  // particle pools, sized from the catalog's per-kind maximum
  const need = {}, want = (kind, count = 1) => { const k = PARTICLE_KINDS[kind]; need[k.pool] = (need[k.pool] || 0) + Math.round(k.max * count); };
  for (const k of REVEAL_TIPS[r.reveal.type] ?? (r.reveal.tip ? [r.reveal.tip] : [])) want(k, r.reveal.rate ?? 1);
  r.particles.forEach((p) => want(p.type, p.count));
  const glyphPivotSpec = pivotOf(r.motion);
  const allPts = strokes.flatMap((s) => s.pts);
  const glyphSpace = new THREE.Group();
  const { outer: revealPivot } = pivotGroup(glyphSpace, allPts, 'base');       // the reveal's own pose (grow, stamp)
  const { outer: glyphPivot } = pivotGroup(revealPivot, allPts, glyphPivotSpec);
  group.add(glyphPivot);
  for (const [name, max] of Object.entries(need)) {
    const [blend, space] = name.split('-');
    ctx.pools[name] = createPool(max, ctx.K, blend);
    (space === 'glyph' ? glyphSpace : group).add(ctx.pools[name].mesh);
  }

  const backdropSpec = PIECES.backdrop[r.backdrop.type];
  const start = r.options.start ?? backdropSpec.lead ?? EFFECTS.defaultStart;
  // a long word reveals faster, so its strokes fit in W.maxReveal seconds
  const base = strokeSchedule(strokes, { start: 0, speed: 1, gap: 0 }).end;
  const revealSpec = word ? { ...r.reveal, speed: Math.min(r.reveal.speed, W.maxReveal / base), gap: Math.min(r.reveal.gap, 0.03) } : r.reveal;
  const rev = reveal.create(ctx, revealSpec, start);
  if (rev.group) glyphSpace.add(rev.group);
  const backdrop = BACKDROPS[r.backdrop.type](ctx, r.backdrop);
  group.add(backdrop.group);

  const mats = [], motions = [], built = [];
  const plan = word ? planWord(r, word.glyphs.map((g) => ({ strokes: g.data.strokes.length, components: g.data.components, recipe: g.recipe, material: g.material }))) : planKanji(r, laid.components, strokes.length);
  for (const part of plan) {
    const spec = part.material;
    const mat = MATERIALS[spec.type](ctx, spec, part.strokes);
    const { outer, inner } = pivotGroup(mat.group, part.strokes.flatMap((i) => strokes[i].pts), pivotOf(part.motion));
    glyphSpace.add(outer); mats.push(mat); built.push({ ...part, inner, outer });
    if (part.motion) motions.push(motion.create(ctx, part.motion, outer, part.index));
  }
  const props = [];
  for (const p of r.scene) {
    if (PIECES.scene[p.type].space !== 'glyph') { const prop = PROPS[p.type](ctx, p); group.add(prop.group); props.push(prop); continue; }
    const anchors = p.on ? built.filter((b) => b.element === p.on) : [{ strokes: strokes.filter((s) => p.glyph == null || s.glyph === p.glyph).map((s) => s.index), inner: glyphSpace, index: 0 }];
    for (const a of anchors) { const prop = PROPS[p.type](ctx, p, a); a.inner.add(prop.group); props.push(prop); }
  }
  const mover = strokeMotion.MOVES[r.motion.type] ? strokeMotion.create(ctx, r.motion) : null;   // moves single strokes (split ...)
  if (!mover) motions.push(motion.create(ctx, r.motion, glyphPivot));
  ctx.widthScale = motion.widthScale(r.motion);
  const layers = r.particles.map((p) => createLayer(ctx, p));
  const emblem = r.emblem ? emblems.create(ctx, r.emblem) : null;
  if (emblem) group.add(emblem.group);
  const scene = r.vignette ? vignettes.create(ctx, r.vignette, { group, glyph: glyphPivot, parts: built.map(({ element, strokes: st, outer }) => ({ element, strokes: st, outer })) }) : null;
  const pools = Object.values(ctx.pools);

  function step(t, dt) {
    rev.step(t); rev.pose(t, revealPivot); ctx.idle = Math.max(0, t - rev.end);
    mover?.step(t);                                          // adds to the reveal's per-stroke offsets (ctx.so) before the materials read them
    scene?.step(t);                                          // the vignette: moves its actors, the kanji, single strokes (ctx.so)
    backdrop.step(t);
    for (const m of mats) m.step(t);
    for (const p of props) p.step(t);
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
  // where each glyph of a word sits (centre x, top y), for labels such as the furigana over a kanji drawn plain
  const glyphBoxes = word ? word.glyphs.map((g, i) => ({ x: (i - (word.glyphs.length - 1) / 2) * H, top: H / 2, size: H })) : [{ x: 0, top: glyphHeight / 2, size: glyphHeight }];
  return { group, strokesEnd: rev.end, glyphBoxes, step, reset, stats, setPassthrough: (b) => backdrop.setPassthrough(b), dispose: () => disposeObject(group) };
}
