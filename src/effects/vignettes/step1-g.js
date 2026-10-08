// Step 1 scenes, part G: more numbers, coming, ahead, the week, white.
//   octopus-eight  八: an octopus pops up beside the kanji and lifts its arms one at a time, counted 1-8, then waves all
//                  eight. outcome count: eight takoyaki drop onto a tray (八つ); day: the 8th, a little octopus (八日)
//   dice-six       六: a big die tumbles in, bounces and lands showing six; the pips light up one by one, counted.
//                  outcome count: six eggs drop into an egg box (六つ); day: the 6th, a die (六日)
//   ttt-nine       九: a noughts-and-crosses grid fills with nine marks, X and O in turn, counted 1-9. outcome count: nine
//                  marbles roll into a tray (九つ); day: the 9th, a cross (九日)
//   come-here      来: a hand beckons, come here; far off a puppy hears, bounds closer and closer and jumps up to it,
//                  wagging. outcome bird: a bird flies in from far away and lands on a held-out finger (来る)
//   boat-race      先: three paper boats race on the water; the red one pulls ahead and its little flag pops up: first
//   weekday-wheel  曜: a wheel of the seven day symbols (moon, fire, water, tree, gold, soil, sun) spins and slows until
//                  the pointer stops on one, which glows
//   week-hop       週: a strip of seven days; a little sun hops from day to day, each lighting as it lands, and after
//                  Sunday hops back round to Monday: a week
//   snow-white     白: snow falls; it settles on the kanji's top and on a little tree and the ground, until everything is
//                  white; then it melts away. outcome rabbit: a white rabbit hops through the snow leaving prints (白い)
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, puffs } from './helpers.js';
import { grow, countTag, countScene, dayScene, seeded, DAYS } from './step1-kit.js';
import { dogParts } from './step1-a.js';
import { birdThing } from './step1-c.js';
import { crown } from './step1-b.js';

const grid = (B, u, n, cols, y, gap = 0.22, x0 = 0.3) => Array.from({ length: n }, (_, i) => [B.maxX + (x0 + (i % cols) * gap) * u, y + Math.floor(i / cols) * gap * u]);
const tray = (u, w, d, color = 0x8a5a30) => solidProp([[G.box(w * u, 0.03 * u, d * u, 0, 0, 0), color]], 0.35);

// ---- 八 an octopus ----
const OCTO = (u) => [[G.sphere(0.2 * u, 0, 0.32 * u, 0, 1, 1.1, 1), 0xe0507a], [G.sphere(0.05 * u, -0.07 * u, 0.3 * u, 0.17 * u), 0xffffff], [G.sphere(0.05 * u, 0.07 * u, 0.3 * u, 0.17 * u), 0xffffff], [G.sphere(0.025 * u, -0.07 * u, 0.3 * u, 0.21 * u), 0x101018], [G.sphere(0.025 * u, 0.07 * u, 0.3 * u, 0.21 * u), 0x101018], [G.cyl(0.03 * u, 0.025 * u, 0.05 * u, 0, 0.2 * u, 0.18 * u, Math.PI / 2), 0xb03050]];
export const octoThing = (s) => { const u = s / 0.45; return solidProp([...OCTO(u), ...[0, 1, 2, 3, 4, 5].map((i) => [G.cyl(0.03 * u, 0.015 * u, 0.2 * u, (i - 2.5) * 0.06 * u, 0.1 * u, 0.05 * u, 0, 0, (i - 2.5) * 0.25), 0xe0507a])], 0.5); };
function octopusEight(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') { const s = countScene(ctx, stage, 8, many([[G.sphere(0.08 * u), 0xd89a50], [G.box(0.08 * u, 0.012 * u, 0.06 * u, 0, 0.075 * u, 0.02 * u), 0x5a3020]], 8, 0.5), grid(B, u, 8, 4, floor + 0.12 * u, 0.2), { tagUp: 0.5 }); const t = tray(u, 0.85, 0.3); t.position.set(B.maxX + 0.6 * u, floor + 0.03 * u, 0); s.group.add(t); return s; }
  if (spec.outcome === 'day') return dayScene(ctx, stage, 8, octoThing);
  const group = new THREE.Group(), ox = B.maxX + 0.55 * u, body = solidProp(OCTO(1.3 * u), 0.5), arms = many([[G.sphere(0.045 * u), 0xe0507a]], 48, 0.5), tag = countTag(u, { s: 0.24 });
  group.add(body, arms, tag);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [0, 0.6, 'back'], down: [6.3, 0.6, 'in'] }), h = pre ? 0 : T.up - T.down, y0 = floor - 0.5 * u * (1 - h);
      body.position.set(ox, y0, 0); body.scale.setScalar(grow(h)); body.rotation.z = 0.05 * Math.sin(v * 2);
      let last = 0;
      for (let a = 0; a < 8; a++) {
        const lift = pre ? 0 : between(v, 0.8 + 0.5 * a, 1.1 + 0.5 * a) * (1 - between(v, 5.2, 5.6)), all = pre ? 0 : between(v, 4.8, 5.1) * (1 - T.down);
        if (lift > 0.5) last = a + 1;
        const base = (a - 3.5) * 0.36, side = Math.sign(a - 3.5);
        for (let s = 0; s < 6; s++) {
          const f = s / 5, wave = Math.sin(t * 4 + a + s * 0.8) * 0.15 * (1 + 2 * all), ang = -Math.PI / 2 + base * (1 + f * 0.6) + side * lift * 1.6 * f + wave * f;
          const r = (0.12 + 0.07 * s) * 1.3 * u;
          arms.set(a * 6 + s, ox + Math.cos(ang) * r * 0.9, y0 + 0.2 * u + Math.sin(ang) * r * 0.75 + 0.1 * u * lift * f, 0.06 * u - 0.02 * u * Math.abs(a - 3.5), grow(h) * (1.15 - 0.6 * f) * 1.3);
        }
      }
      arms.commit();
      tag.show(Math.max(1, last), last ? h : 0); tag.position.set(ox + 0.45 * u, floor + 0.95 * u, 0.06 * u);
    },
  };
}

// ---- 六 a die ----
const PIPS = { 1: [[0, 0]], 2: [[-1, 1], [1, -1]], 3: [[-1, 1], [0, 0], [1, -1]], 4: [[-1, 1], [1, 1], [-1, -1], [1, -1]], 5: [[-1, 1], [1, 1], [0, 0], [-1, -1], [1, -1]], 6: [[-1, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [1, -1]] };
function dieList(u, s) {
  const h = s / 2, p = s * 0.27, list = [[G.box(s * u, s * u, s * u, 0, 0, 0), 0xfaf6ee]];
  // faces: +z 6, -z 1, +x 3, -x 4, +y 5, -y 2 (opposite faces add up to 7)
  const face = (n, f) => PIPS[n].forEach(([a, b]) => list.push([f(a * p, b * p), n === 1 ? 0xd02020 : 0x202028]));
  const pip = (x, y, z) => G.sphere(s * 0.085 * u, x * u, y * u, z * u, 1, 1, 0.35);
  face(6, (a, b) => pip(a, b, h)); face(1, (a, b) => pip(a, b, -h)); face(5, (a, b) => G.sphere(s * 0.085 * u, a * u, h * u, b * u, 1, 0.35, 1)); face(2, (a, b) => G.sphere(s * 0.085 * u, a * u, -h * u, b * u, 1, 0.35, 1));
  face(3, (a, b) => G.sphere(s * 0.085 * u, h * u, b * u, a * u, 0.35, 1, 1)); face(4, (a, b) => G.sphere(s * 0.085 * u, -h * u, b * u, a * u, 0.35, 1, 1));
  return list;
}
export const dieThing = (s) => solidProp(dieList(s / 0.25, 0.22), 0.5);
function diceSix(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') { const s = countScene(ctx, stage, 6, many([[G.sphere(0.075 * u, 0, 0.06 * u, 0, 0.82, 1.05, 0.82), 0xfff0d8]], 6, 0.6), grid(B, u, 6, 3, floor + 0.04 * u, 0.21, 0.35), { tagUp: 0.42 }); const box = solidProp([[G.box(0.68 * u, 0.06 * u, 0.24 * u, 0, 0.03 * u, 0), 0xb8a888], [G.box(0.68 * u, 0.06 * u, 0.24 * u, 0, 0.24 * u, 0), 0xb8a888]], 0.35); box.position.set(B.maxX + 0.56 * u, floor - 0.04 * u, -0.05 * u); s.group.add(box); return s; }
  if (spec.outcome === 'day') return dayScene(ctx, stage, 6, dieThing);
  const group = new THREE.Group(), S = 0.42, die = solidProp(dieList(u, S), 0.5), dx = B.maxX + 0.5 * u, tag = countTag(u, { s: 0.24 }), glow = many([[G.sphere(0.04 * u, 0, 0, 0, 1, 1, 0.3), 0xffe060]], 6, 1.5), dust = many(PUFF(u), 6, 0.3);
  group.add(die, glow, tag, dust);
  const loop = 6.0, p = S * 0.27 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { roll: [0, 1.4, 'out'], away: [5.2, 0.7, 'in'] }), f = pre ? 0 : T.roll;
      const x = dx + 0.9 * u * (1 - f) + 0.9 * u * T.away, hop = Math.abs(Math.sin(f * Math.PI * 3)) * (1 - f) * 0.5 * u;
      die.visible = !pre && T.away < 1; die.position.set(x, floor + S * u / 2 + hop, 0.02 * u);
      die.rotation.set((1 - f) * 7.0 + 0.3 * wobble(v, 1.4, 0.5, 3), (1 - f) * 5.0, (1 - f) * 4.5 - T.away * 3);
      let lit = 0;
      PIPS[6].forEach(([a, b], i) => { const k = pre ? 0 : between(v, 1.8 + 0.35 * i, 2.0 + 0.35 * i) * (1 - T.away); if (k > 0.5) lit = i + 1; glow.set(i, x + a * p, floor + S * u / 2 + b * p, 0.02 * u + S * u / 2 + 0.01 * u, k * (1 + 0.2 * Math.sin(t * 6))); });
      glow.commit();
      tag.show(Math.max(1, lit), lit ? 1 - T.away : 0); tag.position.set(dx + 0.4 * u, floor + 0.65 * u, 0.06 * u);
      puffs(dust, 0, 6, dx, floor, pre ? 0 : (v - 1.1) / 0.6, u, 0.35); dust.commit();
    },
  };
}

// ---- 九 noughts and crosses ----
const XMARK = (u, s = 1) => [[G.box(0.04 * u * s, 0.2 * u * s, 0.02 * u, 0, 0, 0, 0.785), 0x3a7ae0], [G.box(0.04 * u * s, 0.2 * u * s, 0.02 * u, 0, 0, 0, -0.785), 0x3a7ae0]];
export const crossThing = (s) => { const m = solidProp(XMARK(s / 0.2, 1).map(([g, c]) => [g.translate(0, 0.1 * s / 0.2 * 1, 0), c]), 0.7); return m; };
function tttNine(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') { const s = countScene(ctx, stage, 9, many([[G.sphere(0.065 * u), 0xffffff]], 9, 0.8), grid(B, u, 9, 3, floor + 0.1 * u, 0.17, 0.4), { tagUp: 0.45 }); const things = s.group.children[0]; [0x40c0ff, 0xff6a6a, 0x60e060].forEach((c, i) => { for (let j = i; j < 9; j += 3) things.setColorAt(j, new THREE.Color(c)); }); const t = tray(u, 0.62, 0.3, 0x3a6a4a); t.position.set(B.maxX + 0.57 * u, floor + 0.04 * u, -0.02 * u); s.group.add(t); return s; }
  if (spec.outcome === 'day') return dayScene(ctx, stage, 9, crossThing);
  const group = new THREE.Group(), cx = B.maxX + 0.55 * u, cy = B.cy, c = 0.25 * u;
  const bars = solidProp([[G.box(0.03 * u, 3 * c, 0.02 * u, -c / 2, 0, 0), 0xffffff], [G.box(0.03 * u, 3 * c, 0.02 * u, c / 2, 0, 0), 0xffffff], [G.box(3 * c, 0.03 * u, 0.02 * u, 0, -c / 2, 0), 0xffffff], [G.box(3 * c, 0.03 * u, 0.02 * u, 0, c / 2, 0), 0xffffff]], 0.8);
  const xs = many(XMARK(u), 5, 0.8), os = many([[G.torus(0.075 * u, 0.02 * u), 0xff5a5a]], 4, 0.8), tag = countTag(u, { s: 0.22 });
  bars.position.set(cx, cy, 0);
  group.add(bars, xs, os, tag);
  const ORDER = [4, 0, 8, 2, 6, 3, 5, 1, 7], loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.8, 6.3);
      bars.scale.setScalar(grow(pre ? 0 : between(v, 0, 0.4) * (1 - off)));
      let last = 0, xi = 0, oi = 0;
      ORDER.forEach((cell, i) => {
        const k = pre ? 0 : between(v, 0.5 + 0.5 * i, 0.75 + 0.5 * i) * (1 - off); if (k > 0.5) last = i + 1;
        const x = cx + ((cell % 3) - 1) * c, y = cy - (Math.floor(cell / 3) - 1) * c, s = grow(k) * (k < 1 ? 1 + 0.3 * Math.sin(Math.PI * k) : 1);
        if (i % 2 === 0) xs.set(xi++, x, y, 0.02 * u, s); else os.set(oi++, x, y, 0.02 * u, s);
      });
      xs.commit(); os.commit();
      tag.show(Math.max(1, last), last ? 1 - off : 0); tag.position.set(cx + 2 * c, cy + 1.6 * c, 0.06 * u);
    },
  };
}

// ---- 来 come here ----
function comeHere(ctx, spec, stage) {
  if (spec.outcome === 'bird') return birdLand(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.35 * u;
  const hand = createHand({ u: 0.55 * u, sleeve: 0x4a9ad8 }), dog = new THREE.Group(), { body, legs, tail } = dogParts(u), tp = new THREE.Group();
  tp.position.set(-0.22 * u, 0.38 * u, 0); tp.add(tail); dog.add(body, legs, tp);
  const hearts = many([[G.sphere(0.03 * u), 0xff6a8a]], 3, 1.0);
  group.add(hand.group, dog, hearts);
  const loop = 6.2, LEG = [[0.12, 0.15], [0.12, -0.15], [-0.12, 0.15], [-0.12, -0.15]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { run: [0.9, 2.4, 'in'], jump: [3.3, 0.5], leave: [5.4, 0.8] });
      const curl = pre ? 0 : 0.5 + 0.5 * Math.sin(v * 7);
      hand.pose('flat', 'grip', curl * (v < 3.3 ? 1 : 0)); hand.group.position.set(hx, floor + 0.35 * u, 0.12 * u); hand.group.rotation.set(-0.5, 0.4, -0.2);
      // far up the road (small, high) -> right here (full size)
      const d = pre ? 1 : 1 - T.run + T.leave, s = 1 - 0.8 * d, running = d > 0.01 && d < 0.99;
      dog.visible = !pre && T.leave < 0.95; dog.scale.setScalar(grow(s) * 0.85); dog.position.set(hx + 0.4 * u + 0.5 * u * d, floor + 0.7 * u * d + 0.12 * u * bump(v, 3.3, 0.5) + (running ? 0.03 * u * Math.abs(Math.sin(v * 14)) : 0), -0.3 * u * d); dog.rotation.y = T.leave > 0 ? 0.6 : -Math.PI / 2 - 0.9;
      LEG.forEach(([lx, lz], i) => legs.set(i, lx * u, 0.22 * u, lz * u, 1, running ? 0.7 * Math.sin(v * 14 + (i % 2 ? Math.PI : 0)) : 0));
      legs.commit(); tp.rotation.z = 0.4 + 0.6 * Math.sin(t * 16);
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 3.5 + i * 0.25, 4.7 + i * 0.25); hearts.set(i, hx + 0.35 * u + (i - 1) * 0.1 * u, floor + 0.7 * u + 0.35 * u * f, 0.1 * u, f > 0 && f < 1 ? 1.3 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}
function birdLand(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.3 * u;
  const hand = createHand({ u: 0.55 * u, sleeve: 0xe0803a }), bird = birdThing(0.32 * u), wings = many([[G.sphere(0.07 * u, 0.05 * u, 0, 0, 1.4, 0.25, 0.8), 0x3a72c8]], 2, 0.5);
  group.add(hand.group, bird, wings);
  const loop = 6.0, perch = [hx + 0.32 * u, floor + 0.62 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      hand.pose('point'); hand.group.position.set(hx, floor + 0.45 * u, 0.1 * u); hand.group.rotation.set(0, 0, -Math.PI / 2 + 0.15);
      const T = timeline(v, { fly: [0.2, 2.2, 'out'], off: [4.8, 1.0, 'in'] }), d = pre ? 1 : 1 - T.fly + T.off, flying = d > 0.01;
      const x = perch[0] + 0.9 * u * d, y = perch[1] + 0.8 * u * d + 0.1 * u * Math.sin(d * 9) * d, s = 1 - 0.7 * d;
      bird.visible = !pre; bird.position.set(x, y, -0.2 * u * d); bird.scale.setScalar(grow(s)); bird.rotation.y = T.off > 0 ? 0 : Math.PI;
      const flap = flying ? Math.sin(t * 22) * 0.9 : 0.1 + 0.15 * bump(v, 3.0, 0.4);
      for (const k of [0, 1]) wings.set(k, x, y + 0.08 * u * s, (k ? 0.05 : -0.05) * u * s, s, 0, T.off > 0 ? 0 : Math.PI, (k ? 1 : -1) * flap);
      wings.commit();
    },
  };
}

// ---- 先 a boat race ----
function boatRace(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.15 * u;
  const hull = new THREE.Shape(); hull.moveTo(-0.13, 0.05); hull.lineTo(0.13, 0.05); hull.lineTo(0.08, -0.04); hull.lineTo(-0.08, -0.04); hull.closePath();
  const sail = new THREE.Shape(); sail.moveTo(-0.06, 0.05); sail.lineTo(0.06, 0.05); sail.lineTo(0.0, 0.15); sail.closePath();
  const boats = many([[G.extrude(hull, 0.1).scale(1.5 * u, 1.5 * u, 1.5 * u), 0xffffff], [G.extrude(sail, 0.02).scale(1.5 * u, 1.5 * u, 1.5 * u), 0xffffff]], 3, 0.6);
  [0xff5a5a, 0x5aa0ff, 0xffd040].forEach((c, i) => boats.setColorAt(i, new THREE.Color(c)));
  const water = solidProp([[G.box(1.5 * u, 0.02 * u, 0.7 * u, 0, 0, 0), 0x2a7ad0], ...[0, 1, 2].map((i) => [G.box(1.5 * u, 0.025 * u, 0.008 * u, 0, 0, (-0.2 + 0.2 * i) * u), 0x6ab0ff])], 0.4);
  const flag = solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.16 * u, 0, 0.08 * u, 0), 0x404040], [G.box(0.09 * u, 0.06 * u, 0.005 * u, 0.045 * u, 0.13 * u, 0), 0xffd040]], 0.8), wake = many([[G.sphere(0.02 * u, 0, 0, 0, 1.6, 0.6, 1), 0xe0f4ff]], 9, 1.0);
  water.position.set(x0 + 0.6 * u, floor, -0.1 * u); water.rotation.x = 0.5;
  group.add(water, boats, flag, wake);
  const loop = 6.0, lanes = [0.0, -0.2, 0.2];   // z of each lane on the tilted water (the red boat in the middle)
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 4.6), fade = pre ? 1 : between(v, 4.9, 5.6);
      lanes.forEach((ly, i) => {
        const speed = i === 0 ? 0.9 * f + 0.3 * f * f : (0.75 - 0.1 * i) * f, x = x0 + speed * 0.95 * u, zz = -0.1 * u + ly * u * Math.cos(0.5), y = floor - ly * u * Math.sin(0.5) + 0.02 * u + 0.01 * u * Math.sin(t * 3 + i);
        boats.set(i, x, y, zz, grow(1 - fade), 0.06 * Math.sin(t * 4 + i));
        for (let k = 0; k < 3; k++) { const w = ((t * 1.5 + k / 3) % 1); wake.set(i * 3 + k, x - 0.22 * u - 0.15 * u * w, y - 0.03 * u, zz + 0.02 * u, f > 0 && f < 1 ? 1 - w : 0); }
        if (i === 0) { const k = pre ? 0 : between(v, 2.4, 2.8) * (1 - fade); flag.visible = k > 0.01; flag.scale.setScalar(grow(k)); flag.position.set(x, y + 0.2 * u, zz + 0.02 * u); flag.scale.multiplyScalar(1.5); }
      });
      boats.commit(); wake.commit();
    },
  };
}

// ---- 曜 the weekday wheel ----
function weekdayWheel(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.55 * u, cy = B.cy + 0.05 * u, R = 0.42 * u, r = 0.27 * R / 0.42;
  const sym = (i) => { const a = Math.PI / 2 - (i / 7) * Math.PI * 2, x = Math.cos(a) * r * 1.0, y = Math.sin(a) * r * 1.0, z = 0.03 * u, k = u;
    return [
      [[G.torus(0.06 * k, 0.022 * k, Math.PI * 1.1, x, y, z, 1.4), 0xfff0b0]],                                      // 月 moon
      [[G.cone(0.05 * k, 0.13 * k, x, y, z), 0xff6a20], [G.cone(0.025 * k, 0.07 * k, x, y - 0.02 * k, z + 0.02 * k), 0xffe040]],   // 火 fire
      [[G.sphere(0.045 * k, x, y - 0.015 * k, z), 0x3aa0ff], [G.cone(0.044 * k, 0.07 * k, x, y + 0.03 * k, z), 0x3aa0ff]],          // 水 water
      [[G.cyl(0.012 * k, 0.012 * k, 0.07 * k, x, y - 0.04 * k, z), 0x7a4a24], [G.sphere(0.05 * k, x, y + 0.02 * k, z), 0x3aa040]],  // 木 tree
      [[G.cyl(0.05 * k, 0.05 * k, 0.02 * k, x, y, z, Math.PI / 2), 0xffc030]],                                        // 金 gold
      [[G.sphere(0.06 * k, x, y - 0.02 * k, z, 1, 0.6, 0.6), 0x8a5a30]],                                              // 土 soil
      [[G.sphere(0.055 * k, x, y, z), 0xffa020]],                                                                    // 日 sun
    ][i]; };
  const wheel = solidProp([[G.cyl(R, R, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 42), 0x2a3048], [G.torus(R, 0.02 * u), 0xc8ccd4], ...Array.from({ length: 7 }, (_, i) => [G.box(0.01 * u, R, 0.01 * u, Math.cos(Math.PI / 2 - (i + 0.5) / 7 * Math.PI * 2) * R / 2, Math.sin(Math.PI / 2 - (i + 0.5) / 7 * Math.PI * 2) * R / 2, 0.02 * u, -(i + 0.5) / 7 * Math.PI * 2), 0x505870]), ...Array.from({ length: 7 }, (_, i) => sym(i)).flat()], 0.6);
  const pointer = solidProp([[G.cone(0.06 * u, 0.12 * u, 0, 0, 0, Math.PI), 0xe83a3a]], 0.8), ring = solidProp([[G.torus(0.09 * u, 0.012 * u), 0xffe060]], 1.4);
  wheel.position.set(cx, cy, 0); pointer.position.set(cx, cy + R + 0.05 * u, 0.04 * u);
  group.add(wheel, pointer, ring);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, n = A.n < 0 ? 0 : A.n % 7;
      // spin 0..3 s easing out to land symbol `stop` under the pointer
      const stop = (n * 3) % 7, f = pre ? 0 : 1 - Math.pow(1 - between(v, 0.2, 3.2), 3), turns = 2 + stop / 7;
      wheel.rotation.z = (pre ? 0 : f * turns * Math.PI * 2) + 0.03 * wobble(v, 3.2, 0.5, 5);
      const k = pre ? 0 : between(v, 3.2, 3.5) * (1 - between(v, 5.0, 5.4)); ring.visible = k > 0.01; ring.scale.setScalar(grow(k) * (1 + 0.1 * Math.sin(t * 6))); ring.position.set(cx, cy + r, 0.05 * u);
      pointer.position.y = cy + R + 0.05 * u + 0.02 * u * bump(v, 3.2, 0.3);
    },
  };
}

// ---- 週 a week ----
function weekHop(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cell = 0.2 * u, x0 = B.maxX + 0.15 * u, y = B.cy - 0.05 * u;
  const tiles = many([[G.box(cell * 0.9, cell * 0.9, 0.03 * u), 0xffffff]], 7, 0.6), label = textPlane(DAYS.join(''), { h: cell, w: 7 * cell, color: '#202838', size: 0.78 / 0.92 * 0.92 });
  const sun = solidProp([[G.sphere(0.08 * u), 0xffb030], ...Array.from({ length: 8 }, (_, i) => [G.box(0.02 * u, 0.05 * u, 0.01 * u, Math.cos(i * 0.785) * 0.12 * u, Math.sin(i * 0.785) * 0.12 * u, 0, i * 0.785 + Math.PI / 2), 0xffc040])], 1.1);
  label.position.set(x0 + 3 * cell, y, 0.02 * u);
  for (let i = 0; i < 7; i++) tiles.set(i, x0 + i * cell, y, 0, 1);
  tiles.commit();
  group.add(tiles, label, sun);
  const off = new THREE.Color(0xd8d2c4), on = new THREE.Color(0xffd060), red = new THREE.Color(0xff8a7a), blue = new THREE.Color(0x8ab4ff), loop = 7 * 0.7 + 0.7;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // one hop per 0.7 s: day 0..6, then a long hop back round to the start
      const k = pre ? -1 : Math.floor(v / 0.7), f = pre ? 0 : (v / 0.7) % 1, from = Math.min(6, Math.max(0, k)), to = k >= 6 ? 0 : k + 1;
      const xa = x0 + from * cell, xb = x0 + to * cell, h = (k >= 6 ? 0.45 : 0.2) * u;
      sun.visible = !pre; sun.position.set(xa + (xb - xa) * f, y + 0.2 * u + h * 4 * f * (1 - f), 0.05 * u); sun.rotation.z = -v;
      for (let i = 0; i < 7; i++) tiles.setColorAt(i, !pre && i <= Math.min(6, k) && k < 7 ? (i === 6 ? red : i === 5 ? blue : on) : off);
      tiles.instanceColor.needsUpdate = true;
    },
  };
}

// ---- 白 snow ----
function snowWhite(ctx, spec, stage) {
  if (spec.outcome === 'rabbit') return rabbitSnow(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.55 * u;
  const flakes = many([[G.sphere(0.02 * u), 0xffffff]], 24, 1.2), r = seeded(21), spots = Array.from({ length: 24 }, () => [r(), r()]);
  const cap = solidProp([[G.sphere(0.5 * u, 0, 0, 0, 1, 0.12, 0.25), 0xffffff]], 0.9), tree = crown(0.9 * u, 3, [0x2e8a3a]), trunk = solidProp([[G.cyl(0.03 * u, 0.04 * u, 0.3 * u, 0, 0.15 * u, 0), 0x7a4a24]], 0.35);
  const ground = solidProp([[G.box(1.6 * u, 0.06 * u, 0.4 * u, 0, -0.03 * u, 0), 0xffffff]], 0.8), snowTree = crown(0.95 * u, 3, [0xffffff]);
  trunk.position.set(tx, floor, -0.05 * u); ground.position.set(B.cx + 0.4 * u, floor - 0.02 * u, -0.1 * u); ground.rotation.x = 0.4;
  [[0, 0.42, 1.1], [-0.12, 0.32, 0.9], [0.12, 0.32, 0.9]].forEach(([x, y, s], i) => { tree.set(i, tx + x * u, floor + y * u, -0.05 * u, s); });
  tree.commit();
  group.add(trunk, tree, snowTree, ground, cap, flakes);
  const loop = 7.0, top = B.maxY;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { snow: [0, 3.0, 'linear'], settle: [0.6, 3.0], melt: [5.6, 1.2] }), s = pre ? 0 : T.settle * (1 - T.melt);
      spots.forEach(([a, b], i) => { const f = ((v * 0.3 + b) % 1); flakes.set(i, B.minX - 0.2 * u + a * (B.w + 1.3 * u) + 0.04 * u * Math.sin(v * 2 + i), top + 0.5 * u - (top + 0.5 * u - floor) * f, 0.06 * u, !pre && T.snow > 0 && v < 5.6 ? 1 : 0); });
      flakes.commit();
      cap.visible = s > 0.01; cap.scale.set(B.w / u * 1.0 + 0.1, grow(s), 1); cap.position.set(B.cx, top + 0.01 * u, 0.0);
      [[0, 0.45, 1.15], [-0.13, 0.35, 0.95], [0.13, 0.35, 0.95]].forEach(([x, y, k], i) => snowTree.set(i, tx + x * u, floor + y * u + 0.02 * u, -0.04 * u, k * grow(s)));
      snowTree.commit();
      ground.scale.set(1, 1, grow(s)); ground.visible = s > 0.01;
    },
  };
}
function rabbitSnow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const rabbit = solidProp([[G.sphere(0.13 * u, 0, 0.13 * u, 0, 1.2, 1, 0.9), 0xffffff], [G.sphere(0.09 * u, 0.13 * u, 0.25 * u, 0), 0xffffff], [G.sphere(0.035 * u, 0.1 * u, 0.42 * u, 0.03 * u, 0.6, 2.2, 0.6), 0xffffff], [G.sphere(0.035 * u, 0.15 * u, 0.42 * u, -0.03 * u, 0.6, 2.2, 0.6), 0xffffff], [G.sphere(0.02 * u, 0.2 * u, 0.27 * u, 0.06 * u), 0xe02040], [G.sphere(0.012 * u, 0.22 * u, 0.24 * u, 0.0), 0xff8aa0], [G.sphere(0.05 * u, -0.15 * u, 0.12 * u, 0), 0xffffff]], 0.6);
  const ground = solidProp([[G.box(1.8 * u, 0.06 * u, 0.5 * u, 0, -0.03 * u, 0), 0xf4f8ff]], 0.6), prints = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 0.2, 1.4), 0xa8b4d0]], 8, 0.4), flakes = many([[G.sphere(0.018 * u), 0xffffff]], 14, 1.2), r = seeded(4), spots = Array.from({ length: 14 }, () => [r(), r()]);
  ground.position.set(B.maxX + 0.6 * u, floor - 0.02 * u, -0.05 * u); ground.rotation.x = 0.45;
  group.add(ground, prints, rabbit, flakes);
  const loop = 6.0, x0 = B.maxX + 1.4 * u, x1 = B.maxX + 0.1 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 4.8), hops = 5;
      const x = x0 + (x1 - x0) * f, ph = (f * hops) % 1;
      rabbit.visible = !pre && f < 1; rabbit.position.set(x, floor + 0.22 * u * Math.sin(Math.PI * ph), 0.12 * u); rabbit.rotation.set(0, Math.PI, 0.25 * Math.cos(Math.PI * ph));
      for (let i = 0; i < 8; i++) { const at = (Math.floor(i / 2) + 1) / hops; prints.set(i, x0 + (x1 - x0) * at + (i % 2 ? 0.05 : -0.05) * u, floor + 0.005 * u, 0.13 * u + (i % 2 ? 0.04 : -0.04) * u, f > at && v < 5.5 ? 1 : 0); }
      prints.commit();
      spots.forEach(([a, b], i) => { const g = ((v * 0.3 + b) % 1); flakes.set(i, B.maxX - 0.1 * u + a * 1.6 * u, floor + 1.1 * u - 1.1 * u * g, 0.08 * u, pre ? 0 : 1); });
      flakes.commit();
    },
  };
}

export const SCENES = { 'octopus-eight': octopusEight, 'dice-six': diceSix, 'ttt-nine': tttNine, 'come-here': comeHere, 'boat-race': boatRace, 'weekday-wheel': weekdayWheel, 'week-hop': weekHop, 'snow-white': snowWhite };
