// Step 1 scenes, part C: numbers (and their 〜つ / 〜日 words, see step1-kit.js countScene / dayScene).
//   one-candle    一: one cupcake drops onto the stroke; its one candle lights, flickers under a "1" badge and is blown
//                 out with a curl of smoke. outcome count: one apple drops onto a plate (一つ); first: an old month's page
//                 peels off the calendar and flies away, the new month's day 1 lights up with a ring (一日 ついたち);
//                 allday: one sun rises on the left, arcs over the word and sets on the right: one whole day (一日 いちにち)
//   two-birds     二: two birds fly in and land on the two strokes as if on wires (each dips), chirp under badges 1 and 2,
//                 and fly off. outcome count: two eggs (二つ); day: the 2nd, a bird (二日)
//   four-clover   四: a stem grows; four heart leaves unfold one at a time, counted 1-4, and the lucky clover sparkles.
//                 outcome count: four clovers (四つ); day: the 4th, a clover (四日)
//   ten-strike    十: a bowling ball rolls up a lane into ten pins set in a triangle and knocks them all flying: STRIKE,
//                 10. outcome day: the 10th, a pin (十日); day20: the 20th (二十日)
//   rainbow-seven 七: a rainbow builds itself stripe by stripe, seven colours, counted 1-7, clouds puff at its feet.
//                 outcome count: seven rainbow balls (七つ); day: the 7th, a little rainbow (七日)
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { many, burst, HEART } from '../pieces/kit-things.js';
import { textPlane, veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps } from './helpers.js';
import { grow, countTag, countScene, dayScene, monthGrid } from './step1-kit.js';

const RAINBOW = [0xe83030, 0xff8a20, 0xffe030, 0x40c040, 0x30a0f0, 0x3050c0, 0x9040c0];
const row = (B, u, n, y, gap = 0.3) => Array.from({ length: n }, (_, i) => [B.maxX + (0.3 + i * gap) * u, y]);
const grid = (B, u, n, cols, y, gap = 0.26) => Array.from({ length: n }, (_, i) => [B.maxX + (0.3 + (i % cols) * gap) * u, y + Math.floor(i / cols) * gap * u]);
const tinted = (list, n, colors, glow = 0.5) => { const m = many(list, n, glow); for (let i = 0; i < n; i++) m.setColorAt(i, new THREE.Color(colors[i % colors.length])); return m; };

// ---- 一 one ----
const CUPCAKE = (u) => [[G.cyl(0.13 * u, 0.1 * u, 0.14 * u, 0, 0.07 * u, 0), 0xe85a8a], [G.sphere(0.15 * u, 0, 0.16 * u, 0, 1, 0.7, 1), 0xfff0f4], [G.sphere(0.03 * u, 0, 0.27 * u, 0), 0xe02040], [G.cyl(0.018 * u, 0.018 * u, 0.16 * u, 0.06 * u, 0.33 * u, 0), 0x60a0ff]];
function oneCandle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') { const apple = many([[G.sphere(0.11 * u), 0xe02828], [G.cyl(0.008 * u, 0.008 * u, 0.06 * u, 0, 0.12 * u, 0), 0x5a3a1a], [G.sphere(0.035 * u, 0.035 * u, 0.13 * u, 0, 1.4, 0.4, 0.8), 0x40a040]], 1, 0.6); return countScene(ctx, stage, 1, apple, [[B.maxX + 0.5 * u, floor + 0.15 * u]]); }
  if (spec.outcome === 'first') return firstOfMonth(ctx, spec, stage);
  if (spec.outcome === 'allday') return allDay(ctx, spec, stage);
  const group = new THREE.Group(), y0 = stage.strokeBox(0).maxY, cake = solidProp(CUPCAKE(1.5 * u), 0.5);
  const flame = solidProp([[G.cone(0.035 * u, 0.11 * u, 0, 0.055 * u, 0), 0xffa020], [G.cone(0.018 * u, 0.06 * u, 0, 0.03 * u, 0.01 * u), 0xfff080]], 1.5);
  const smoke = many([[G.sphere(0.03 * u), 0xc8c8d0]], 5, 0.3), tag = countTag(u, { s: 0.26 }), puff = many([[G.sphere(0.04 * u, 0, 0, 0, 1.6, 0.6, 0.6), 0xe0f0ff]], 4, 0.8);
  group.add(cake, flame, smoke, tag, puff);
  const cx = B.cx + 0.05 * u, loop = 6.0, wick = [cx + 0.09 * u, y0 + 0.62 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { drop: [0, 0.5, 'in'], light: [1.0, 0.3, 'back'], tag: [1.4, 0.4, 'back'], blow: [3.6, 0.5], gone: [5.3, 0.5] });
      const land = wobble(v, 0.5, 0.5, 6);
      cake.visible = !pre && T.gone < 1; cake.position.set(cx, y0 + 0.9 * u * (1 - T.drop), 0.02 * u); cake.scale.set(grow(1 + 0.1 * land) * (1 - T.gone), grow(1 - 0.12 * land) * (1 - T.gone), grow(1 - T.gone));
      for (const si of [0]) stage.offset(si, 0, -0.03 * u * Math.max(0, land), 0);
      const f = pre ? 0 : T.light * (1 - T.blow); flame.visible = f > 0.01; flame.position.set(wick[0] + 0.02 * u * T.blow, wick[1], 0.02 * u); flame.scale.set(grow(f), grow(f * (1 + 0.15 * Math.sin(t * 18))), grow(f)); flame.rotation.z = -0.5 * bump(v, 3.5, 0.6) + 0.05 * Math.sin(t * 11);
      tag.show(1, pre ? 0 : T.tag * (1 - T.gone)); tag.position.set(cx + 0.45 * u, y0 + 0.75 * u, 0.06 * u);
      for (let i = 0; i < 4; i++) { const p = pre ? 0 : between(v, 3.2 + i * 0.05, 3.8 + i * 0.05); puff.set(i, wick[0] - 0.6 * u + 0.55 * u * p, wick[1] + 0.02 * u * (i - 1.5), 0.03 * u, p > 0 && p < 1 ? 1 : 0); }
      puff.commit();
      wisps(smoke, 0, 5, wick[0], wick[1] + 0.03 * u, v, u, { period: 1.4, rise: 0.6, on: pre ? 0 : between(v, 3.9, 4.1) * (1 - between(v, 5.0, 5.4)) });
      smoke.commit();
    },
  };
}
function firstOfMonth(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cal = monthGrid(u, 1), cx = B.maxX + 0.46 * u, cy = B.cy - 0.06 * u;
  const hinge = new THREE.Group(), old = solidProp([[G.box(0.84 * u, 0.82 * u, 0.01 * u, 0, -0.41 * u, 0), 0xf0ead8]], 0.5), n31 = textPlane('31', { h: 0.38 * u, color: '#555555', weight: 900 });
  n31.position.set(0, -0.42 * u, 0.007 * u); hinge.add(old, n31); hinge.position.set(cx, cy + 0.46 * u, 0.03 * u);
  const confetti = tinted([[G.box(0.035 * u, 0.035 * u, 0.005 * u), 0xffffff]], 10, RAINBOW, 1);
  cal.position.set(cx, cy, 0); group.add(cal, hinge, confetti);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { peel: [0.4, 0.6, 'in'], fly: [0.9, 0.9, 'in'], lit: [1.6, 0.3], ring: [2.0, 0.4, 'back'], back: [5.0, 0.5] });
      hinge.visible = pre || T.fly < 1 || T.back > 0;
      hinge.rotation.x = -1.2 * T.peel * (1 - T.back); hinge.position.set(cx + 0.9 * u * T.fly * (1 - T.back), cy + 0.46 * u + 0.6 * u * T.fly * (1 - T.back), 0.03 * u + 0.3 * u * T.fly * (1 - T.back)); hinge.rotation.z = -0.8 * T.fly * (1 - T.back);
      cal.show(pre ? 0 : T.lit * (1 - T.back), pre ? 0 : T.ring * (1 - T.back));
      for (let i = 0; i < 10; i++) { const f = pre ? 0 : between(v, 2.1, 3.3), a = i * 0.63; confetti.set(i, cx + Math.cos(a) * 0.5 * u * f, cy + 0.2 * u + Math.sin(a) * 0.4 * u * f - 0.3 * u * f * f, 0.08 * u, f > 0 && f < 1 ? 1 : 0, v * 4 + i); }
      confetti.commit();
    },
  };
}
function allDay(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.minX - 0.1 * u, x1 = B.maxX + 0.9 * u, R = (x1 - x0) / 2, mid = (x0 + x1) / 2;
  const sun = solidProp([[G.sphere(0.17 * u), 0xffb030], [G.sphere(0.03 * u, -0.06 * u, 0.04 * u, 0.16 * u), 0x5a2a10], [G.sphere(0.03 * u, 0.06 * u, 0.04 * u, 0.16 * u), 0x5a2a10]], 1.2);
  const ground = solidProp([[G.box(x1 - x0 + 0.6 * u, 0.12 * u, 0.3 * u, 0, -0.06 * u, 0), 0x3a7a3a]], 0.3), dark = veil(7 * u, 5 * u, 0x081030), tag = countTag(u, { s: 0.26 });
  ground.position.set(mid, floor - 0.04 * u, -0.4 * u); dark.position.set(mid, floor + 1 * u, -0.8 * u);
  const trail = many([[G.sphere(0.02 * u), 0xffe080]], 12, 1.2);
  group.add(dark, ground, sun, trail, tag);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const f = pre ? 0 : between(v, 0.2, 5.0), a = Math.PI * (1 - f);
      const sx = mid + R * Math.cos(a), sy = floor + 0.02 * u + 0.75 * u * Math.sin(a);
      sun.position.set(sx, sy, -0.35 * u); sun.visible = !pre && f < 1;
      dark.material.opacity = 0.7 * (1 - Math.sin(Math.PI * f)) * (pre ? 1 : 1);
      for (let i = 0; i < 12; i++) { const g = i / 11, b = Math.PI * (1 - g); trail.set(i, mid + R * Math.cos(b), floor + 0.02 * u + 0.75 * u * Math.sin(b), -0.36 * u, g < f ? 0.8 : 0); }
      trail.commit();
      tag.show(1, pre ? 0 : between(v, 5.0, 5.3) * (1 - between(v, 6.0, 6.3))); tag.position.set(x1, floor + 0.35 * u, 0.05 * u);
    },
  };
}

// ---- 二 two birds ----
const BIRD = (u, c = 0x4a8ae0) => [[G.sphere(0.09 * u, 0, 0.09 * u, 0, 1.3, 1, 0.9), c], [G.sphere(0.06 * u, 0.09 * u, 0.16 * u, 0), c], [G.cone(0.02 * u, 0.06 * u, 0.17 * u, 0.16 * u, 0, -Math.PI / 2), 0xffa020], [G.sphere(0.014 * u, 0.12 * u, 0.18 * u, 0.045 * u), 0x101010], [G.sphere(0.05 * u, 0.02 * u, 0.06 * u, 0, 1.1, 0.7, 1.0), 0xf0f4ff], [G.cone(0.04 * u, 0.1 * u, -0.13 * u, 0.12 * u, 0, Math.PI / 2 + 0.4), c]];
export const birdThing = (s) => solidProp(BIRD(s / 0.25), 0.5);
function twoBirds(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') { const eggs = many([[G.sphere(0.1 * u, 0, 0.1 * u, 0, 0.82, 1.05, 0.82), 0xfff4e0]], 2, 0.6); return countScene(ctx, stage, 2, eggs, row(B, u, 2, floor, 0.32)); }
  if (spec.outcome === 'day') return dayScene(ctx, stage, 2, birdThing);
  const group = new THREE.Group(), birds = many(BIRD(1.4 * u), 2, 0.5), wings = many([[G.sphere(0.1 * u, 0.07 * u, 0, 0, 1.4, 0.25, 0.8), 0x3a72c8]], 4, 0.5), tags = [1, 2].map(() => countTag(u, { s: 0.22 }));
  birds.setColorAt(0, new THREE.Color(0x4a8ae0)); birds.setColorAt(1, new THREE.Color(0xe05a8a));
  const notes = many([[G.sphere(0.025 * u, 0, 0, 0, 1.2, 1, 0.6), 0xffffff], [G.box(0.008 * u, 0.07 * u, 0.008 * u, 0.022 * u, 0.035 * u, 0), 0xffffff]], 4, 1.0);
  group.add(birds, wings, notes, ...tags);
  // the two strokes, top first: where each bird lands
  const S = ctx.strokes.map((s, i) => ({ i, b: stage.strokeBox(i) })).sort((a, b) => b.b.cy - a.b.cy);
  const spots = [[S[0].b.cx + 0.05 * u, S[0].b.maxY - 0.01 * u], [S[1].b.cx - 0.12 * u, S[1].b.maxY - 0.01 * u]];
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      spots.forEach(([x, y], i) => {
        const T = timeline(v, { in: [0.1 + 0.6 * i, 1.0, 'out'], out: [4.4 + 0.2 * i, 1.1, 'in'] }), air = 1 - T.in + T.out, flying = air > 0.01;
        const bx = x + air * (1.4 + 0.3 * i) * u * (T.out > 0 ? 1 : 1), by = y + air * (0.7 - 0.2 * i) * u + (T.out > 0 ? 0.4 * u * T.out : 0);
        const dip = wobble(v, 1.1 + 0.6 * i, 0.6, 5);
        stage.offset(S[i].i, 0, -0.035 * u * Math.max(0, dip), 0);
        const chirp = bump(v, 2.0 + 0.7 * i, 0.4);
        birds.set(i, bx, by - 0.03 * u * Math.max(0, dip) + 0.03 * u * chirp, 0.05 * u, pre ? 0 : 1, 0.25 * chirp, T.out > 0 ? 0 : Math.PI);
        const flap = flying ? Math.sin(t * 22) * 0.9 : 0.15;
        for (const s of [0, 1]) wings.set(i * 2 + s, bx + (T.out > 0 ? 0.01 : -0.01) * u, by + 0.13 * u, 0.05 * u + (s ? 0.06 : -0.06) * u, pre ? 0 : 1, 0, T.out > 0 ? 0 : Math.PI, (s ? 1 : -1) * flap);
        tags[i].show(i + 1, pre ? 0 : between(v, 1.9 + 0.7 * i, 2.15 + 0.7 * i) * (1 - T.out)); tags[i].position.set(x, y + 0.48 * u, 0.06 * u);
        for (const k of [0, 1]) { const f = pre ? 0 : between(v, 2.0 + 0.7 * i + 0.15 * k, 2.8 + 0.7 * i + 0.15 * k); notes.set(i * 2 + k, x - 0.18 * u - 0.15 * u * f, y + 0.3 * u + 0.2 * u * f, 0.06 * u, f > 0 && f < 1 ? 1.4 : 0, 0.3 * Math.sin(f * 8)); }
      });
      birds.commit(); wings.commit(); notes.commit();
    },
  };
}

// ---- 四 a four-leaf clover ----
const HEARTLEAF = () => { const h = new THREE.Shape(); h.moveTo(0, -0.42); h.bezierCurveTo(-0.55, -0.05, -0.5, 0.42, 0, 0.18); h.bezierCurveTo(0.5, 0.42, 0.55, -0.05, 0, -0.42); return h; };
const CLOVER = (u) => [[G.cyl(0.012 * u, 0.012 * u, 0.15 * u, 0, 0.075 * u, 0), 0x3a8a30], ...[0, 1, 2, 3].map((i) => [G.extrude(HEARTLEAF(), 0.1).scale(0.12 * u, 0.12 * u, 0.12 * u).translate(0, 0.05 * u, 0).rotateZ(i * Math.PI / 2 + Math.PI).translate(0, 0.2 * u, 0), 0x40b040])];
export const cloverThing = (s) => solidProp(CLOVER(s / 0.3), 0.5);
function fourClover(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') return countScene(ctx, stage, 4, many(CLOVER(0.9 * u), 4, 0.5), row(B, u, 4, floor, 0.28));
  if (spec.outcome === 'day') return dayScene(ctx, stage, 4, cloverThing);
  const group = new THREE.Group(), cx = B.maxX + 0.55 * u, cy = floor + 0.62 * u;
  const stem = solidProp([[G.cyl(0.022 * u, 0.026 * u, 1, 0, 0.5, 0), 0x3a8a30]], 0.4), leaves = many(HEART(u, 0.32, 0x3aaa3a), 4, 0.5), tag = countTag(u, { s: 0.24 }), shine = burst(u, { s: 0.5, n: 8, color: 0xfff080 });
  group.add(stem, leaves, tag, shine);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { stem: [0, 0.6, 'out'], wither: [5.4, 0.8] }), h = pre ? 0 : T.stem * (1 - T.wither);
      stem.visible = h > 0.01; stem.position.set(cx, floor, -0.02 * u); stem.scale.set(1, Math.max(1e-3, (cy - floor) * h), 1);
      let last = 0;
      for (let i = 0; i < 4; i++) {
        const k = pre ? 0 : between(v, 0.7 + 0.55 * i, 1.1 + 0.55 * i) * (1 - T.wither); if (k > 0.5) last = i + 1;
        const a = Math.PI / 4 + i * Math.PI / 2 - Math.PI, open = 1.4 * (1 - k);
        leaves.set(i, cx + Math.cos(a + Math.PI / 2) * 0.13 * u * k, cy + Math.sin(a + Math.PI / 2) * 0.13 * u * k + 0.01 * u * Math.sin(t * 2), 0.0, grow(k) * (1 + 0.04 * Math.sin(t * 3 + i)), a, 0, open);
      }
      leaves.commit();
      tag.show(Math.max(1, last), last ? between(v, 0.95, 1.2) * (1 - T.wither) : 0); tag.position.set(cx + 0.4 * u, cy + 0.3 * u, 0.06 * u);
      const s = pre ? 0 : bump(v, 3.2, 1.4); shine.visible = s > 0.01; shine.scale.setScalar(grow(s)); shine.position.set(cx, cy, -0.05 * u); shine.rotation.z = v;
    },
  };
}

// ---- 十 ten pins ----
const PIN = (u) => [[G.sphere(0.05 * u, 0, 0.06 * u, 0, 1, 1.3, 1), 0xffffff], [G.cyl(0.025 * u, 0.04 * u, 0.08 * u, 0, 0.15 * u, 0), 0xffffff], [G.sphere(0.035 * u, 0, 0.21 * u, 0), 0xffffff], [G.cyl(0.029 * u, 0.029 * u, 0.025 * u, 0, 0.165 * u, 0), 0xe02020]];
export const pinThing = (s) => solidProp(PIN(s / 0.25), 0.5);
function tenStrike(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'day' || spec.outcome === 'day20') return dayScene(ctx, stage, spec.outcome === 'day20' ? 20 : 10, pinThing);
  const group = new THREE.Group(), lx = B.maxX + 0.6 * u;
  const lane = new THREE.Shape(); lane.moveTo(-0.3, 0); lane.lineTo(0.3, 0); lane.lineTo(0.2, 1.0); lane.lineTo(-0.2, 1.0); lane.closePath();
  const floorM = solidProp([[new THREE.ShapeGeometry(lane).scale(u, u, u), 0xd8a868]], 0.3), pins = many(PIN(1.15 * u), 10, 0.5), bowl = solidProp([[G.sphere(0.09 * u), 0x3040c0], [G.sphere(0.015 * u, 0.03 * u, 0.04 * u, 0.08 * u), 0x101020], [G.sphere(0.015 * u, -0.01 * u, 0.06 * u, 0.08 * u), 0x101020]], 0.6);
  const strike = textPlane('STRIKE!', { h: 0.2 * u, color: '#ffffff', bg: '#e04848', pad: 0.2 }), tag = countTag(u, { s: 0.24 }), boom = burst(u, { s: 0.5, n: 10, color: 0xffe060 });
  floorM.position.set(lx, floor - 0.05 * u, -0.3 * u);
  group.add(floorM, pins, bowl, strike, tag, boom);
  // pins 1 at the front, then rows of 2, 3, 4 further back (higher and smaller on the lane)
  const P = []; [1, 2, 3, 4].forEach((n, r) => { for (let j = 0; j < n; j++) P.push([(j - (n - 1) / 2) * 0.11, 0.42 + r * 0.13, 1 - r * 0.08]); });
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { roll: [0.2, 1.3, 'in'], reset: [5.2, 0.6] }), hit = pre ? 0 : between(v, 1.5, 2.3);
      bowl.visible = !pre && T.roll < 1 || (hit > 0 && hit < 1);
      const f = T.roll; bowl.position.set(lx + 0.05 * u * Math.sin(f * 3), floor - 0.02 * u + 0.5 * u * f + 0.3 * u * hit, -0.3 * u + 0.09 * u); bowl.rotation.x = -f * 12; bowl.scale.setScalar(1 - 0.25 * f - 0.3 * hit);
      P.forEach(([x, y, s], i) => {
        const d = hit * (1 - T.reset), a = (i * 2.39) % (Math.PI * 2);
        pins.set(i, lx + x * u + Math.cos(a) * 0.35 * u * d, floor + y * u + Math.abs(Math.sin(a)) * 0.35 * u * Math.sin(Math.PI * Math.min(1, d * 1.3)) - 0.1 * u * d, -0.3 * u + 0.1 * u, s * (T.reset > 0 && T.reset < 1 ? Math.abs(1 - 2 * T.reset) : 1), (Math.cos(a) > 0 ? -1 : 1) * 1.5 * d, 0, 0.4 * d);
      });
      pins.commit();
      const k = pre ? 0 : between(v, 1.7, 2.0) * (1 - between(v, 4.8, 5.2));
      strike.visible = k > 0.01; strike.scale.setScalar(grow(k)); strike.position.set(lx, floor + 1.05 * u, 0.05 * u);
      tag.show(10, k); tag.position.set(lx + 0.55 * u, floor + 0.75 * u, 0.06 * u);
      const b = pre ? 0 : bump(v, 1.5, 0.6); boom.visible = b > 0.01; boom.scale.setScalar(grow(b)); boom.position.set(lx, floor + 0.65 * u, -0.1 * u);
    },
  };
}

// ---- 七 a rainbow ----
export const rainbowThing = (s) => { const u = s / 0.3; return solidProp(RAINBOW.map((c, i) => [G.torus((0.2 - i * 0.022) * u, 0.012 * u, Math.PI), c]), 0.7); };
function rainbowSeven(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') { const balls = many([[G.sphere(0.075 * u), 0xffffff]], 7, 0.6); RAINBOW.forEach((c, i) => balls.setColorAt(i, new THREE.Color(c))); return countScene(ctx, stage, 7, balls, grid(B, u, 7, 4, floor + 0.1 * u, 0.2)); }
  if (spec.outcome === 'day') return dayScene(ctx, stage, 7, rainbowThing);
  const group = new THREE.Group(), cx = B.maxX + 0.62 * u, R = 0.6 * u;
  const bands = many([[G.torus(1, 0.065, Math.PI), 0xffffff]], 7, 0.75); RAINBOW.forEach((c, i) => bands.setColorAt(i, new THREE.Color(c)));
  const clouds = many([[G.sphere(0.12 * u), 0xffffff], [G.sphere(0.09 * u, 0.12 * u, -0.02 * u, 0), 0xffffff], [G.sphere(0.09 * u, -0.12 * u, -0.02 * u, 0), 0xffffff]], 2, 0.6), tag = countTag(u, { s: 0.24 });
  group.add(bands, clouds, tag);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, fade = pre ? 1 : between(v, 5.6, 6.4);
      let last = 0;
      for (let i = 0; i < 7; i++) { const k = pre ? 0 : between(v, 0.3 + 0.45 * i, 0.6 + 0.45 * i) * (1 - fade); if (k > 0.5) last = i + 1; const r = R * (1 - i * 0.075); bands.set(i, cx, floor, -0.15 * u - 0.002 * u * i, grow(k) * r * (k < 1 ? 1 + 0.1 * Math.sin(Math.PI * k) : 1)); }
      bands.commit();
      const c = pre ? 0 : between(v, 0, 0.4) * (1 - fade);
      clouds.set(0, cx - R * 0.78, floor + 0.04 * u, 0, grow(c)); clouds.set(1, cx + R * 0.78, floor + 0.04 * u, 0, grow(c)); clouds.commit();
      tag.show(Math.max(1, last), last ? 1 - fade : 0); tag.position.set(cx, floor + R + 0.2 * u, 0.06 * u); tag.scale.multiplyScalar(1 + 0.15 * bump(v, 0.3 + 0.45 * (last - 1), 0.3));
    },
  };
}

export const SCENES = { 'one-candle': oneCandle, 'two-birds': twoBirds, 'four-clover': fourClover, 'ten-strike': tenStrike, 'rainbow-seven': rainbowSeven };
