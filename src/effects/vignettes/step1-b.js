// Step 1 scenes, part B: nature and the sky.
//   sun-rise      日: night with stars; the sun climbs out from behind a hill, pushes the dark away and spins out its rays,
//                 then sinks and night comes back. outcome week: with the weekday strip lighting 日 (日曜日)
//   fire-catch    火: a match strikes on a box, sparks, drops onto a pile of logs; small flames catch, grow and roar, sparks
//                 fly; then it dies down to glowing embers. outcome week: 火曜日
//   tap-fill      水: a tap above a glass basin turns on; water pours down, the basin fills with rings spreading and drops
//                 jumping; the tap shuts and the water drains away. outcome week: 水曜日
//   mountain-rise 山: a rumble shakes the kanji; a big mountain rises out of the ground behind it, dust puffing, snow falls
//                 and caps its peak white; then it sinks back
//   tree-sprout   木: the kanji is the trunk: branches sprout, a crown of leaves bursts out on top, an apple grows, falls and
//                 bounces; the crown shrinks back to buds. outcome week: 木曜日
//   rain-drops    雨: a grey cloud gathers over the kanji; its four dots fall out of it as rain with more drops behind them,
//                 splash in rings at the ground, and draw back into the kanji
//   sun-moon-glow 明: night; the 日 half lights up gold like the sun and the 月 half silver like the moon, beams sweep out
//                 and the dark lifts until everything is bright; then night falls again
//   grove-grow    林: both 木 grow crowns, then little trees pop up one after another beside them into a small wood, and a
//                 squirrel scampers along in front
import * as THREE from 'three';
import { acts, timeline, bump, tremble } from './timeline.js';
import { many, PUFF, DROP } from '../pieces/kit-things.js';
import { veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs, strokeSides } from './helpers.js';
import { seeded, grow, withWeek } from './step1-kit.js';

const starField = (u, n, seed) => { const r = seeded(seed), m = many([[G.sphere(0.013 * u), 0xfff6c0]], n, 1.5); m.spots = Array.from({ length: n }, () => [r(), r(), r()]); return m; };
const twinkle = (m, x0, y0, w, h, on, t) => { m.spots.forEach(([a, b, c], i) => m.set(i, x0 + a * w, y0 + b * h, -0.5 * h, on * (0.5 + 0.6 * Math.abs(Math.sin(t * (1.3 + 2 * c) + i))))); m.commit(); };
// rays round a centre: many thin wedges, one draw call
const rays = (u, n, len, color) => { const m = many([[G.box(0.035 * u, len * u, 0.01 * u, 0, len * u / 2, 0), color]], n, 1.3); m.n = n; return m; };
const spin = (m, x, y, z, k, a) => { for (let i = 0; i < m.n; i++) m.set(i, x, y, z, k, a + (i / m.n) * Math.PI * 2); m.commit(); };

// ---- 日 sunrise ----
function sunRise(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(sunRise, 6, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.45 * u;
  const sun = solidProp([[G.sphere(0.3 * u), 0xffb030], [G.sphere(0.035 * u, -0.1 * u, 0.06 * u, 0.28 * u), 0x5a2a10], [G.sphere(0.035 * u, 0.1 * u, 0.06 * u, 0.28 * u), 0x5a2a10], [G.torus(0.1 * u, 0.018 * u, Math.PI, 0, -0.05 * u, 0.29 * u, Math.PI), 0x5a2a10]], 1.2);
  const hill = solidProp([[G.sphere(1.0 * u, 0, 0, 0, 1.6, 0.32, 0.3), 0x24502c]], 0.25), night = veil(7 * u, 5 * u, 0x040818), shine = rays(u, 12, 0.32, 0xffd040), stars = starField(u, 16, 3);
  hill.position.set(sx, floor - 0.08 * u, -0.25 * u); night.position.set(B.cx + 0.4 * u, floor + 1.2 * u, -0.7 * u);
  group.add(night, stars, shine, sun, hill);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { rise: [0, 2.2, 'out'], rays: [1.8, 0.6, 'back'], set: [4.9, 1.3, 'in'] }), h = pre ? 0 : T.rise - T.set;
      sun.position.set(sx + 0.1 * u, floor - 0.25 * u + 1.05 * u * h, -0.32 * u); sun.rotation.z = 0.1 * Math.sin(v * 2);
      night.material.opacity = 0.8 * (1 - h);
      twinkle(stars, B.minX - 0.3 * u, floor + 0.5 * u, 2.4 * u, 0.8 * u, 1 - h, t);
      const r = pre ? 0 : T.rays * (1 - T.set); shine.visible = r > 0.01; spin(shine, sun.position.x, sun.position.y, -0.34 * u, grow(r) * (1 + 0.1 * Math.sin(v * 5)), v * 0.6);
      stage.glyph.scale.setScalar(1 + 0.04 * (pre ? 0 : bump(v, 1.9, 0.6)));
    },
  };
}

// ---- 火 fire catching ----
const FLAME = (u) => [[G.cone(0.07 * u, 0.24 * u, 0, 0.12 * u, 0), 0xff7a1a], [G.cone(0.04 * u, 0.15 * u, 0, 0.075 * u, 0.02 * u), 0xffe040]];
function fireCatch(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(fireCatch, 1, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.5 * u;
  const logs = solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.5 * u, 0, 0.05 * u, 0.06 * u, 0, 0.3, Math.PI / 2 - 0.25), 0x7a4a24], [G.cyl(0.05 * u, 0.05 * u, 0.5 * u, 0, 0.05 * u, -0.06 * u, 0, -0.3, Math.PI / 2 + 0.25), 0x8a5428], [G.cyl(0.045 * u, 0.045 * u, 0.42 * u, 0, 0.12 * u, 0, 0, 0, Math.PI / 2), 0x6a3e1e]], 0.3);
  const box = solidProp([[G.box(0.22 * u, 0.13 * u, 0.06 * u, 0, 0, 0), 0xd83030], [G.box(0.2 * u, 0.025 * u, 0.062 * u, 0, -0.03 * u, 0), 0x4a2a1a]], 0.4);
  const match = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.3 * u, 0, 0.15 * u, 0), 0xf0d8a0], [G.sphere(0.025 * u, 0, 0.31 * u, 0, 1, 1.3, 1), 0xd02020]], 0.5);
  const tip = solidProp([[G.cone(0.03 * u, 0.09 * u, 0, 0.045 * u, 0), 0xffb030]], 1.3);
  const flames = many(FLAME(u), 7, 1.3), sparks = many([[G.sphere(0.012 * u), 0xffd060]], 10, 1.6), glow = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 0.6, 1), 0xff4010]], 4, 1.4);
  logs.position.set(fx, floor, 0); box.position.set(fx + 0.55 * u, floor + 0.55 * u, 0.05 * u);
  group.add(logs, box, match, tip, flames, sparks, glow);
  const loop = 6.8, F = [[0, 0, 1.2], [-0.1, 0.03, 0.85], [0.1, 0.02, 0.9], [-0.05, 0.05, 0.7], [0.06, 0.05, 0.75], [-0.16, 0, 0.55], [0.15, 0, 0.6]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { strike: [0.1, 0.4, 'in'], drop: [0.7, 0.5, 'in'], catch: [1.2, 1.4, 'out'], die: [5.0, 1.4] });
      // the match: struck along the box's side, then tossed onto the logs
      const lit = !pre && v > 0.45;
      if (T.drop <= 0) { match.position.set(fx + 0.66 * u - 0.22 * u * T.strike, floor + 0.5 * u, 0.09 * u); match.rotation.z = 0.9; }
      else { const f = T.drop; match.position.set(fx + 0.44 * u - 0.4 * u * f, floor + 0.5 * u - 0.38 * u * f + 0.15 * u * Math.sin(Math.PI * f), 0.09 * u); match.rotation.z = 0.9 + 1.2 * f; }
      match.visible = !pre && T.catch < 0.6;
      tip.visible = lit && match.visible; tip.position.copy(match.position).add(new THREE.Vector3(-Math.sin(match.rotation.z) * 0.31 * u, Math.cos(match.rotation.z) * 0.31 * u, 0)); tip.scale.setScalar(0.8 + 0.3 * Math.sin(t * 20));
      const size = pre ? 0 : T.catch * (1 - 0.8 * T.die);
      F.forEach(([x, z, s], i) => { const fl = 1 + 0.18 * Math.sin(t * (9 + i) + i * 2) + 0.1 * Math.sin(t * 17 + i); flames.set(i, fx + x * u, floor + 0.13 * u, z * u + 0.02 * u, size * s * fl * (i < 3 ? 1.4 : between(T.catch, 0.3, 1) * 1.2), 0.1 * Math.sin(t * 7 + i)); });
      flames.commit();
      for (let i = 0; i < 10; i++) { const f = ((t * 0.7 + i * 0.137) % 1); sparks.set(i, fx + 0.2 * u * Math.sin(i * 2.4 + f * 3), floor + 0.3 * u + 0.8 * u * f, 0.03 * u, size > 0.5 ? (1 - f) * 1.3 : 0); }
      sparks.commit();
      for (let i = 0; i < 4; i++) glow.set(i, fx + (i - 1.5) * 0.08 * u, floor + 0.06 * u, 0.09 * u, pre ? 0 : (T.catch > 0.2 ? 1 : 0) * (0.8 + 0.3 * Math.sin(t * 5 + i)));
      glow.commit();
    },
  };
}

// ---- 水 a tap filling a basin ----
function tapFill(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(tapFill, 2, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, top = B.maxY + 0.05 * u;
  const tap = solidProp([[G.cyl(0.04 * u, 0.04 * u, 0.3 * u, 0.15 * u, 0, 0, 0, 0, Math.PI / 2), 0xc8ccd4], [G.cyl(0.04 * u, 0.035 * u, 0.12 * u, 0, -0.05 * u, 0), 0xc8ccd4], [G.cyl(0.05 * u, 0.05 * u, 0.04 * u, 0.3 * u, 0, 0, 0, 0, Math.PI / 2), 0x9aa4b4]], 0.5);
  const handle = solidProp([[G.box(0.16 * u, 0.03 * u, 0.03 * u, 0, 0, 0), 0x3a7ae0], [G.cyl(0.02 * u, 0.02 * u, 0.06 * u, 0, -0.03 * u, 0), 0x9aa4b4]], 0.5);
  const basin = solidProp([[new THREE.LatheGeometry([[0.0, 0], [0.24, 0], [0.3, 0.26], [0.27, 0.26], [0.22, 0.03], [0, 0.03]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 32), 0xd8f0ff]], 0.35);
  basin.material.transparent = true; basin.material.opacity = 0.55;
  const water = solidProp([[G.cyl(1, 1, 1, 0, 0.5, 0, 0, 0, 0, 32), 0x3aa0ff]], 0.7), stream = solidProp([[G.cyl(0.025 * u, 0.03 * u, 1, 0, -0.5, 0), 0x5ab8ff]], 0.9);
  const rings = many([[G.torus(0.08 * u, 0.008 * u).rotateX(Math.PI / 2), 0xe0f4ff]], 3, 1.0), drops = many(DROP(u, 0x7fd0ff), 6, 0.9);
  tap.position.set(bx, top + 0.1 * u, -0.02 * u); handle.position.set(bx + 0.06 * u, top + 0.16 * u, -0.02 * u);
  basin.position.set(bx, floor, 0); basin.rotation.x = 0.45; water.rotation.x = 0.45;
  group.add(tap, handle, basin, water, stream, rings, drops);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { on: [0.1, 0.4], fill: [0.4, 2.8, 'linear'], off: [3.3, 0.3], drain: [4.6, 1.4, 'in'] });
      handle.rotation.y = 1.4 * (T.on - T.off);
      const level = pre ? 0 : 0.21 * u * (T.fill - T.drain), flowing = !pre && T.on > 0.5 && T.off < 0.5;
      const surf = floor + 0.03 * u + level, r = (0.22 + 0.06 * level / (0.21 * u)) * u;
      water.visible = level > 0.003 * u; water.position.set(bx, floor + 0.03 * u * Math.cos(0.45), 0.03 * u * Math.sin(0.45)); water.scale.set(r, Math.max(1e-3, level), r);
      const sy = top + 0.03 * u, len = sy - surf;
      stream.visible = flowing; stream.position.set(bx, sy, 0); stream.scale.set(1 + 0.15 * Math.sin(t * 20), Math.max(0.01 * u, len), 1);
      for (let i = 0; i < 3; i++) { const f = (v * 1.3 + i / 3) % 1; rings.set(i, bx, surf + 0.005 * u, 0.03 * u, flowing ? 0.4 + 1.6 * f : 0, 0, 0, 0.45); }
      rings.commit();
      for (let i = 0; i < 6; i++) { const f = (v * 1.8 + i / 6) % 1, a = i * 1.05; drops.set(i, bx + Math.cos(a) * 0.15 * u * f, surf + 0.18 * u * Math.sin(Math.PI * f), 0.03 * u + Math.sin(a) * 0.1 * u * f, flowing ? 0.9 : 0); }
      drops.commit();
    },
  };
}

// ---- 山 a mountain rising ----
function mountainRise(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.35 * u;
  const peak = new THREE.Group(), rock = solidProp([[G.cone(0.75 * u, 1.15 * u, 0, 0.575 * u, 0), 0x5a6a5a], [G.cone(0.5 * u, 0.75 * u, 0.42 * u, 0.375 * u, 0.1 * u), 0x4a5a4c]], 0.3);
  const cap = solidProp([[G.cone(0.25 * u, 0.39 * u, 0, 0, 0.012 * u), 0xffffff]], 0.7); cap.position.y = 0.955 * u;
  peak.add(rock, cap); peak.position.set(mx, floor, -0.35 * u);
  const dust = many(PUFF(u, 0xb8a888), 10, 0.3), snow = many([[G.sphere(0.018 * u), 0xffffff]], 14, 1.2), r = seeded(7), flakes = Array.from({ length: 14 }, () => [r(), r()]);
  group.add(peak, dust, snow);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { rumble: [0, 0.6, 'linear'], rise: [0.5, 1.4, 'out'], snow: [2.0, 1.8], sink: [5.4, 1.0, 'in'] });
      const shake = pre ? 0 : (v < 2.0 ? 1 : 0) * tremble(v, 12) * 0.012 * u;
      poseGlyph(stage, shake, pre ? 0 : 0.03 * u * bump(v, 0.5, 1.4), 0, B.cx, B.minY);
      const h = pre ? 0 : T.rise * (1 - T.sink);
      peak.visible = h > 0.01; peak.scale.set(1, grow(h), 1); peak.position.x = mx + shake;
      cap.scale.setScalar(grow(T.snow));
      cap.visible = T.snow > 0.01;
      puffs(dust, 0, 10, mx, floor, pre ? 0 : (v - 0.5) / 1.4, u, 1.1); dust.commit();
      flakes.forEach(([a, b], i) => { const f = ((v * 0.35 + b) % 1); snow.set(i, mx - 0.5 * u + a * 1.0 * u + 0.04 * u * Math.sin(v * 2 + i), floor + 1.5 * u - 0.6 * u * f, 0.05 * u, !pre && T.snow > 0 && T.sink < 0.5 ? Math.sin(Math.PI * f) * 1.2 : 0); });
      snow.commit();
    },
  };
}

// ---- 木 a tree sprouting ----
export function crown(u, n, colors) {
  const m = many([[G.sphere(0.16 * u), 0xffffff]], n, 0.45); for (let i = 0; i < n; i++) m.setColorAt(i, new THREE.Color(colors[i % colors.length])); return m;
}
const CROWN = [[0, 0.22, 1.25], [-0.2, 0.1, 1.0], [0.2, 0.1, 1.0], [-0.12, 0.34, 0.9], [0.13, 0.33, 0.95], [0, 0.02, 0.85], [-0.3, -0.04, 0.7], [0.3, -0.04, 0.7]];
function treeSprout(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(treeSprout, 3, ctx, spec, stage, { scale: 0.8 });
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, top = B.maxY - 0.05 * u;
  const leaves = crown(u, CROWN.length, [0x3aa040, 0x48b848, 0x2e8a3a]);
  const twigs = many([[G.cyl(0.015 * u, 0.022 * u, 0.25 * u, 0, 0.125 * u, 0), 0x7a4a24]], 3, 0.3);
  const apple = solidProp([[G.sphere(0.07 * u), 0xe02828], [G.cyl(0.006 * u, 0.006 * u, 0.04 * u, 0, 0.08 * u, 0), 0x5a3a1a], [G.sphere(0.025 * u, 0.025 * u, 0.09 * u, 0, 1.4, 0.4, 0.8), 0x40a040]], 0.6);
  const fall = many([[G.sphere(0.03 * u, 0, 0, 0, 1.4, 0.3, 1), 0x58c048]], 5, 0.5);
  group.add(twigs, leaves, apple, fall);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { twig: [0, 0.5, 'out'], grow: [0.4, 1.4], ripe: [2.0, 0.6, 'back'], drop: [3.0, 0.45, 'in'], back: [5.4, 1.0] });
      const k = pre ? 0 : T.grow * (1 - T.back);
      [[-0.6, 0.5], [0.6, 0.5], [0, 0]].forEach(([a, x], i) => twigs.set(i, B.cx + x * 0.1 * u, top - 0.05 * u, 0.0, pre ? 0 : T.twig * (1 - T.back), a));
      twigs.commit();
      CROWN.forEach(([x, y, s], i) => { const ki = between(k, i * 0.07, 0.5 + i * 0.07); leaves.set(i, B.cx + x * u, top + 0.18 * u + y * u + 0.01 * u * Math.sin(t * 2 + i), -0.02 * u - 0.01 * u * i, s * ki * (1 + 0.03 * Math.sin(t * 3 + i))); });
      leaves.commit();
      const ax = B.cx + 0.22 * u, ay = top + 0.15 * u, gy = floor + 0.07 * u;
      apple.visible = !pre && T.ripe > 0.01 && T.back < 0.8;
      const bounce = v > 3.45 ? 0.12 * u * Math.abs(Math.sin((v - 3.45) * 6)) * Math.max(0, 1 - (v - 3.45) * 1.5) : 0;
      apple.position.set(ax + 0.25 * u * between(v, 3.45, 4.2), ay + (gy - ay) * T.drop + bounce, 0.12 * u); apple.scale.setScalar(grow(T.ripe * (1 - T.back)));
      for (let i = 0; i < 5; i++) { const f = pre ? 0 : between(v, 2.6 + i * 0.4, 4.6 + i * 0.4); fall.set(i, B.cx + (i - 2) * 0.18 * u + 0.08 * u * Math.sin(f * 9 + i), top + 0.3 * u - (top + 0.3 * u - floor) * f, 0.1 * u, f > 0 && f < 1 ? 1 : 0, f * 6); }
      fall.commit();
    },
  };
}

// ---- 雨 rain ----
function rainDrops(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY - 0.04 * u;
  const dots = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => Math.max(b.w, b.h) < 0.22 * B.w).map(([i, b]) => ({ i, b }));
  const cloud = many([[G.sphere(0.2 * u), 0x9aa4b4]], 6, 0.35), rain = many(DROP(1.4 * u, 0x7fc8ff), 12, 1.0), rings = many([[G.torus(0.07 * u, 0.008 * u).rotateX(Math.PI / 2 - 0.5), 0xd8f0ff]], 6, 1.0);
  group.add(cloud, rain, rings);
  const C = [[-0.35, 0.05, 0.9], [-0.12, 0.12, 1.15], [0.12, 0.1, 1.1], [0.35, 0.03, 0.9], [0.0, -0.02, 1.0], [0.55, -0.02, 0.7]];
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { gather: [0, 0.8, 'out'], part: [4.6, 0.9] }), c = pre ? 0 : T.gather * (1 - T.part);
      C.forEach(([x, y, s], i) => cloud.set(i, B.cx + x * u + (1 - c) * (x > 0 ? 0.6 : -0.6) * u, B.maxY + 0.3 * u + y * u, -0.1 * u, s * grow(c) * (1 + 0.04 * Math.sin(t * 2 + i))));
      cloud.commit();
      // the dots fall out one after another, splash, and draw back in
      dots.forEach(({ i, b }, k) => {
        const at = 0.9 + 0.25 * k, f = pre ? 0 : between(v, at, at + 0.55), back = pre ? 1 : between(v, 3.6 + 0.15 * k, 4.2 + 0.15 * k);
        const fy = (floor - b.cy) * f * f;
        if (f > 0 && f < 1) stage.offset(i, 0, fy, 0.03 * u);
        if (f >= 1) ctx.rv.progress[i] = Math.min(ctx.rv.progress[i], back);
        const s = pre ? 0 : between(v, at + 0.55, at + 1.1); rings.set(k % 6, b.cx, floor + 0.01 * u, 0.04 * u, s > 0 && s < 1 ? 0.5 + 2 * s : 0);
      });
      for (let k = dots.length; k < 6; k++) rings.set(k, 0, 0, 0, 0);
      rings.commit();
      for (let i = 0; i < 12; i++) { const f = (v * 1.1 + i * 0.29) % 1, x = B.cx + (-0.55 + (i % 6) * 0.22 + 0.05 * (i >> 1 & 1)) * u; rain.set(i, x, B.maxY + 0.15 * u - (B.maxY + 0.15 * u - floor) * f, -0.05 * u, !pre && c > 0.6 ? 1 : 0, Math.PI); }
      rain.commit();
    },
  };
}

// ---- 明 bright ----
function sunMoonGlow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), { lo, hi } = strokeSides(ctx, 'x', B.minX + 0.42 * B.w);
  const box = (list) => { const bs = list.map((i) => stage.strokeBox(i)); return { x: (Math.min(...bs.map((b) => b.minX)) + Math.max(...bs.map((b) => b.maxX))) / 2, y: (Math.min(...bs.map((b) => b.minY)) + Math.max(...bs.map((b) => b.maxY))) / 2 }; };
  const S = box(lo), M = box(hi);
  const disc = (color) => { const m = solidProp([[G.cyl(0.32 * u, 0.32 * u, 0.001 * u, 0, 0, 0, Math.PI / 2, 0, 0, 40), color]], 1.2); m.material.transparent = true; return m; };
  const sunGlow = disc(0xffc040), moonGlow = disc(0xc8d8ff), night = veil(7 * u, 5 * u, 0x030612), beams = rays(u, 16, 0.75, 0xfff0b0), stars = starField(u, 14, 9);
  sunGlow.position.set(S.x, S.y, -0.06 * u); moonGlow.position.set(M.x, M.y, -0.07 * u); night.position.set(B.cx + 0.3 * u, B.cy, -0.6 * u);
  beams.material.transparent = true;
  group.add(night, stars, beams, sunGlow, moonGlow);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { sun: [0.2, 0.7, 'back'], moon: [0.9, 0.7, 'back'], dawn: [1.6, 1.4], dusk: [5.0, 1.2] });
      const s = pre ? 0 : T.sun * (1 - T.dusk), m = pre ? 0 : T.moon * (1 - T.dusk), day = pre ? 0 : T.dawn * (1 - T.dusk);
      sunGlow.material.opacity = 0.75 * s; sunGlow.scale.setScalar(grow(s) * (1 + 0.06 * Math.sin(t * 4)));
      moonGlow.material.opacity = 0.65 * m; moonGlow.scale.setScalar(grow(m) * (1 + 0.06 * Math.sin(t * 3 + 1)));
      night.material.opacity = 0.85 * (1 - day);
      beams.visible = day > 0.01; beams.material.opacity = 0.6 * day; spin(beams, B.cx, B.cy, -0.2 * u, grow(day) * 1.4, v * 0.3);
      twinkle(stars, B.minX - 0.4 * u, B.minY, B.w + 1.2 * u, 1.2 * u, 1 - day, t);
    },
  };
}

// ---- 林 a little wood ----
function groveGrow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, { lo, hi } = strokeSides(ctx, 'x', B.cx);
  const tops = [lo, hi].map((l) => { const bs = l.map((i) => stage.strokeBox(i)); return [(Math.min(...bs.map((b) => b.minX)) + Math.max(...bs.map((b) => b.maxX))) / 2, Math.max(...bs.map((b) => b.maxY))]; });
  const crowns = crown(0.75 * u, 10, [0x3aa040, 0x2e8a3a, 0x58b848]);
  const small = many([[G.cyl(0.025 * u, 0.03 * u, 0.25 * u, 0, 0.125 * u, 0), 0x7a4a24], [G.cone(0.14 * u, 0.32 * u, 0, 0.36 * u, 0), 0x2e8a3a], [G.cone(0.11 * u, 0.24 * u, 0, 0.5 * u, 0), 0x3aa040]], 4, 0.45);
  const squirrel = solidProp([[G.sphere(0.06 * u, 0, 0.06 * u, 0, 1.3, 1, 1), 0xb06a30], [G.sphere(0.045 * u, 0.07 * u, 0.1 * u, 0), 0xb06a30], [G.sphere(0.06 * u, -0.08 * u, 0.13 * u, 0, 0.7, 1.4, 0.7), 0xc88040], [G.sphere(0.012 * u, 0.1 * u, 0.115 * u, 0.035 * u), 0x101010]], 0.45);
  group.add(crowns, small, squirrel);
  const loop = 6.6, SM = [[0.3, 0.9], [0.62, 0.75], [0.92, 1.0], [1.18, 0.7]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { grow: [0, 1.2], wood: [1.2, 1.6, 'linear'], back: [5.6, 0.9] });
      tops.forEach(([x, y], j) => [[0, 0.12, 1.2], [-0.12, 0.04, 0.9], [0.12, 0.05, 0.9], [-0.05, 0.22, 0.85], [0.07, 0.2, 0.8]].forEach(([dx, dy, s], i) => crowns.set(j * 5 + i, x + dx * u, y + dy * u + 0.05 * u, -0.02 * u, s * grow(between(pre ? 0 : T.grow * (1 - T.back), i * 0.1, 0.5 + i * 0.1)))));
      crowns.commit();
      SM.forEach(([x, s], i) => { const k = pre ? 0 : between(T.wood, i * 0.22, i * 0.22 + 0.3) * (1 - T.back); small.set(i, B.maxX + x * u, floor, -0.15 * u - 0.05 * u * (i % 2), s * grow(k) * (k < 1 ? 1 + 0.25 * Math.sin(Math.PI * k) : 1)); });
      small.commit();
      const f = pre ? 0 : between(v, 3.0, 5.2), hop = Math.abs(Math.sin(f * Math.PI * 7));
      squirrel.visible = f > 0 && f < 1; squirrel.position.set(B.maxX + 1.4 * u - 1.4 * u * f, floor + 0.08 * u * hop, 0.12 * u); squirrel.rotation.y = Math.PI;
    },
  };
}

export const SCENES = { 'sun-rise': sunRise, 'fire-catch': fireCatch, 'tap-fill': tapFill, 'mountain-rise': mountainRise, 'tree-sprout': treeSprout, 'rain-drops': rainDrops, 'sun-moon-glow': sunMoonGlow, 'grove-grow': groveGrow };
