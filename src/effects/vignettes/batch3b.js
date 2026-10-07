// Batch 3 kanji, part 2.
//   ice-melt        夏: under a blazing sun an ice-cream cone in a hand melts: the scoop sags, drips run off, a puddle grows
//   garden-water    庭: a watering can passes over a flower bed by a picket fence; a flower pops up under each shower
//   home-time       夕: the sun sinks behind a hill; two kids wave goodbye and set off home while crows fly past
//   gift-bow        御: a person bows deeply, offering a wrapped gift with both hands; the kanji bows back and sparkles
//   yellow-things   黄: a banana, a lemon, a sunflower and a rubber duck pop up one by one: all yellow
//   shoe-step       靴: a pair of shoes hops in and lines up on a mat; a barefoot kid steps in and walks off wearing them
//   clouds-gather   曇: grey clouds drift over the sun and stay; the day dims and a sunflower droops
//   knock-door      誰: knock, knock, knock on a door; it opens a crack and a dark figure with bright eyes peeks out: "?"
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, stars, DROP } from '../pieces/kit-things.js';
import { emblemProp, veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, handTo, poseGlyph } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function iceMelt(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, top = floor + 0.72 * u;
  const cone = solidProp([[G.cone(0.14 * u, 0.46 * u, 0, -0.23 * u, 0, Math.PI), 0xd8a060], [G.torus(0.14 * u, 0.018 * u).rotateX(Math.PI / 2), 0xc08040]], 0.35);
  const scoop = solidProp([[G.sphere(0.18 * u, 0, 0, 0, 1, 0.9, 1), 0xff98c0], [G.sphere(0.035 * u, 0, 0.17 * u, 0), 0xe02030]], 0.45);
  const hand = createHand({ u: 0.6 * u, side: -1, sleeve: 0x40b0a0 }); hand.pose('grip');
  const drips = many(DROP(u * 2, 0xff98c0), 8, 0.5), puddle = solidProp([[G.sphere(0.24 * u, 0, 0, 0, 1, 0.12, 0.6), 0xff98c0]], 0.45), sun = emblemProp('sun', 0.5 * u);
  cone.position.set(cx, top, 0); puddle.position.set(cx, floor + 0.003 * u, 0.12 * u); sun.position.set(cx + 0.35 * u, B.maxY + 0.05 * u, -0.2 * u);
  group.add(cone, scoop, hand.group, drips, puddle, sun);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { on: [0, 0.4, 'back'], melt: [0.4, 3.2], gone: [3.6, 0.5, 'in'], dry: [4.3, 0.6] });
      const m = T.melt, k = pre ? 1 : T.on * (1 - T.gone);
      scoop.position.set(cx + 0.02 * u * m, top + (0.11 - 0.09 * m) * u, 0); scoop.scale.set(pop(k * (1 + 0.25 * m)), pop(k * (1 - 0.45 * m)), pop(k * (1 + 0.25 * m)));
      for (let i = 0; i < 8; i++) {
        const p = (v * 0.7 + i / 8) % 1, side = i % 2 ? 1 : -1, on = !pre && m > 0.05 && v < 4.0;
        drips.set(i, cx + side * (0.13 + 0.04 * m) * u, top - 0.02 * u - p * p * (top - floor - 0.03 * u), 0.06 * u, on ? 1 : 0);
      }
      drips.commit();
      const pd = pre ? 0 : Math.min(1, m * 1.2 + T.gone) * (1 - T.dry); puddle.visible = pd > 0.01; puddle.scale.set(pop(pd), pop(pd), pop(pd));
      hand.group.rotation.set(0, 0, 1.0); handTo(hand, cx, top - 0.26 * u, 0.04 * u); hand.update();
      sun.scale.setScalar(0.5 * u * (1 + 0.08 * Math.sin(t * 4))); sun.idle(t);
    },
  };
}

function gardenWater(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.55 * u, W = 0.9 * u;
  const pickets = Array.from({ length: 7 }, (_, i) => [G.box(0.06 * u, 0.32 * u, 0.02 * u, (i / 6 - 0.5) * W, 0.2 * u, -0.2 * u), 0xf4f4f0]);
  const bed = solidProp([[G.box(W, 0.08 * u, 0.36 * u, 0, 0.04 * u, 0), 0x6a4428], [G.box(W, 0.035 * u, 0.02 * u, 0, 0.26 * u, -0.21 * u), 0xf4f4f0], ...pickets], 0.3);
  bed.position.set(bx, floor, 0);
  const can = new THREE.Group(), body = solidProp([[G.cyl(0.11 * u, 0.12 * u, 0.2 * u, 0, 0, 0), 0x3aa060], [G.cyl(0.018 * u, 0.025 * u, 0.3 * u, 0.2 * u, 0.05 * u, 0, 0, 0, -1.0), 0x3aa060], [G.cone(0.045 * u, 0.06 * u, 0.33 * u, 0.14 * u, 0, -1.0), 0x2a8050], [G.torus(0.09 * u, 0.016 * u, Math.PI, -0.02 * u, 0.1 * u, 0), 0x2a8050]], 0.35);
  can.add(body);
  const drops = many([[G.sphere(0.018 * u, 0, 0, 0, 0.8, 1.6, 0.8), 0x7ad0ff]], 12, 0.9);
  const PETALS = [0xff6a9a, 0xffd040, 0xb070ff], flowers = PETALS.map((c) => solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.24 * u, 0, 0.12 * u, 0), 0x3a9a3a], [G.sphere(0.045 * u, 0.04 * u, 0.1 * u, 0, 1, 0.5, 0.6), 0x3a9a3a], ...Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return [G.sphere(0.045 * u, Math.cos(a) * 0.06 * u, 0.26 * u + Math.sin(a) * 0.06 * u, 0, 1, 1, 0.4), c]; }), [G.sphere(0.04 * u, 0, 0.26 * u, 0.01 * u, 1, 1, 0.6), 0xffe070]], 0.45));
  flowers.forEach((f, i) => f.position.set(bx + (i - 1) * 0.28 * u, floor + 0.08 * u, 0.04 * u));
  group.add(bed, can, drops, ...flowers);
  const loop = 5.0, tip = (a, x, y) => [x + 0.36 * u * Math.cos(a) - 0.17 * u * Math.sin(a), y + 0.36 * u * Math.sin(a) + 0.17 * u * Math.cos(a)];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 0.5, 'out'], tilt: [0.5, 0.3], across: [0.8, 2.0], untilt: [2.8, 0.3], out: [3.1, 0.5, 'in'] });
      const a = -0.75 * (T.tilt - T.untilt), x = bx - 0.62 * u + 0.6 * u * T.across + 0.4 * u * T.out, y = floor + 0.62 * u + 0.4 * u * (1 - T.in) + 0.4 * u * T.out;
      can.visible = !pre && T.out < 1; can.position.set(x, y, 0.06 * u); can.rotation.z = a;
      const pour = !pre && a < -0.5, [sx, sy] = tip(a, x, y);
      for (let i = 0; i < 12; i++) { const p = (v * 1.6 + i / 12) % 1; drops.set(i, sx + 0.03 * u * p + 0.02 * u * Math.sin(i * 2.3), sy - p * (sy - floor - 0.1 * u), 0.06 * u + 0.03 * u * Math.cos(i * 1.7), pour ? 1 : 0); }
      drops.commit();
      flowers.forEach((f, i) => { const g = pre ? 0.15 : 0.15 + 0.85 * timeline(v, { g: [1.0 + 0.62 * i, 0.45, 'back'] }).g * (1 - between(v, 4.3, 4.8)); f.scale.setScalar(pop(g)); f.rotation.z = 0.08 * Math.sin(t * 2 + i); });
    },
  };
}

function homeTime(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.65 * u;
  const sun = solidProp([[new THREE.CircleGeometry(0.26 * u, 32), 0xff7a30]], 1.0), hill = solidProp([[new THREE.SphereGeometry(0.5 * u, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.5, 0.45, 0.4), 0x40305a]], 0.25);
  hill.position.set(hx, floor, -0.1 * u);
  const kidA = createPerson({ u: 0.62 * u, shirt: 0xe04848 }), kidB = createPerson({ u: 0.58 * u, shirt: 0x40a0e0 });
  const CROW = [[G.sphere(0.05 * u, 0, 0, 0, 1.6, 0.8, 0.8), 0x14141c], [G.cone(0.05 * u, 0.12 * u, -0.04 * u, 0.04 * u, 0, 0.6), 0x14141c], [G.cone(0.05 * u, 0.12 * u, 0.02 * u, 0.04 * u, 0, -0.5), 0x14141c], [G.cone(0.015 * u, 0.04 * u, -0.1 * u, 0, 0, Math.PI / 2), 0xd0a020]];
  const crows = many(CROW, 3, 0.2);
  group.add(sun, hill, kidA.group, kidB.group, crows);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : v / loop;
      sun.position.set(hx + 0.1 * u, floor + 0.5 * u - 0.5 * u * s, -0.3 * u);
      const T = timeline(v, { in: [0, 0.3, 'out'], go: [2.0, 2.6], gone: [4.6, 0.3] }), k = pre ? 1 : T.in * (1 - T.gone), wave = bump(v, 0.3, 1.6);
      kidA.reset(); kidB.reset();
      if (T.go === 0) { kidA.face(-0.9); kidB.face(0.9); kidA.raise('R', 2.6 + 0.35 * Math.sin(v * 9) * wave); kidB.raise('L', 2.6 + 0.35 * Math.sin(v * 9 + 1) * wave); }
      else { kidA.face('right').walk(v * 9, 1); kidB.face('away').walk(v * 9 + 1, 1); }
      kidA.group.position.set(hx + 0.18 * u + 0.75 * u * T.go, floor, 0.3 * u); kidB.group.position.set(hx - 0.18 * u, floor, 0.3 * u - 0.75 * u * T.go);
      kidA.group.scale.setScalar(pop(k)); kidB.group.scale.setScalar(pop(k)); kidA.update(); kidB.update();
      for (let i = 0; i < 3; i++) { const f = ((t * 0.18 + i * 0.13) % 1); crows.set(i, hx + 0.9 * u - 1.6 * u * f, floor + 0.7 * u + 0.08 * u * i + 0.03 * u * Math.sin(t * 9 + i), -0.15 * u, 1, 0.15 * Math.sin(t * 12 + i * 2)); }
      crows.commit();
    },
  };
}

function giftBow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0x3a4a7a, pants: 0x2a2a3a });
  const S = 0.17 * u, gift = solidProp([[G.box(S, S * 0.8, S, 0, 0, 0), 0xe03a4a], [G.box(S * 1.02, S * 0.82, 0.03 * u, 0, 0, 0), 0xffd040], [G.box(0.03 * u, S * 0.82, S * 1.02, 0, 0, 0), 0xffd040], [G.torus(0.035 * u, 0.012 * u, Math.PI * 2, -0.03 * u, S * 0.45, 0), 0xffd040], [G.torus(0.035 * u, 0.012 * u, Math.PI * 2, 0.03 * u, S * 0.45, 0), 0xffd040]], 0.5);
  const sparkle = stars(u, { r: 0.42, s: 0.09, n: 5, color: 0xfff0a0 });
  sparkle.position.set(B.cx, B.cy, 0);
  group.add(p.group, gift, sparkle);
  const loop = 5.2, hL = new THREE.Vector3(), hR = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { arms: [0.2, 0.5], bow: [0.9, 0.7], nod: [1.7, 0.5], up: [2.9, 0.6], nodUp: [3.0, 0.5], down: [3.8, 0.5] });
      const arms = T.arms - T.down, bow = T.bow - T.up;
      p.group.position.set(px, floor, 0.1 * u); p.face(-1.3).reset();
      p.lean(0.85 * bow); p.bone('armL').rotation.x = p.bone('armR').rotation.x = (1.2 + 0.3 * bow) * arms; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 0.5 * arms * (1 - bow);
      p.update();
      bonePoint(p, 'handL', 0.5, hL); bonePoint(p, 'handR', 0.5, hR);
      gift.position.set((hL.x + hR.x) / 2, (hL.y + hR.y) / 2 + 0.06 * u, (hL.z + hR.z) / 2); gift.rotation.set(0, -1.3, -0.6 * bow);
      const nod = pre ? 0 : T.nod - T.nodUp; poseGlyph(stage, 0, 0, -0.18 * nod, B.cx, B.minY);
      const sp = pre ? 0 : bump(v, 1.8, 1.6); sparkle.visible = sp > 0; sparkle.scale.setScalar(pop(sp)); sparkle.rotation.y = t;
    },
  };
}

function yellowThings(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u, Y = 0xffd820;
  const banana = solidProp([[G.tube([[-0.16 * u, 0.06 * u], [-0.08 * u, -0.03 * u], [0.08 * u, -0.03 * u], [0.16 * u, 0.06 * u]], 0.045 * u), Y], [G.sphere(0.02 * u, -0.17 * u, 0.07 * u, 0), 0x5a3a1a], [G.sphere(0.02 * u, 0.17 * u, 0.07 * u, 0), 0x5a3a1a]], 0.5);
  const lemon = solidProp([[G.sphere(0.12 * u, 0, 0, 0, 1.35, 1, 1), Y], [G.sphere(0.03 * u, 0.16 * u, 0, 0), Y], [G.sphere(0.03 * u, -0.16 * u, 0, 0), Y], [G.sphere(0.03 * u, 0.03 * u, 0.1 * u, 0.04 * u, 1.6, 0.5, 0.5), 0x3a9a3a]], 0.5);
  const sunflower = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.4 * u, 0, -0.2 * u, -0.01 * u), 0x3a9a3a], ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [G.sphere(0.05 * u, Math.cos(a) * 0.11 * u, Math.sin(a) * 0.11 * u, 0, 1.6, 0.6, 0.3), Y]; }), [G.sphere(0.08 * u, 0, 0, 0.02 * u, 1, 1, 0.5), 0x6a3a14]], 0.5);
  const duck = solidProp([[G.sphere(0.12 * u, 0, 0, 0, 1.3, 0.85, 1), Y], [G.sphere(0.08 * u, 0.1 * u, 0.12 * u, 0), Y], [G.cone(0.03 * u, 0.07 * u, 0.2 * u, 0.11 * u, 0, -Math.PI / 2), 0xff8a20], [G.sphere(0.014 * u, 0.13 * u, 0.15 * u, 0.06 * u), 0x1a1a24]], 0.5);
  const items = [[sunflower, 0.15, 0.62], [banana, 0.58, 0.55], [lemon, 0.18, 0.15], [duck, 0.6, 0.13]];
  group.add(...items.map(([o]) => o));
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, away = between(v, 4.4, 4.8);
      items.forEach(([o, dx, dy], i) => {
        const f = pre ? 0 : timeline(v, { f: [0.1 + 0.6 * i, 0.45, 'back'] }).f, hop = bump(v, 3.2 + 0.15 * i, 0.4);
        o.visible = f > 0.01 && away < 1; o.scale.setScalar(pop(f * (1 - away))); o.position.set(x0 + dx * u, floor + dy * u + 0.08 * u * hop, 0.05 * u); o.rotation.z = 0.15 * Math.sin(t * 2 + i) + (1 - f) * 1.5;
      });
    },
  };
}

function shoeStep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.5 * u, RED = 0xe03a3a, SKIN = 0xffd2b0;
  const mat = solidProp([[G.box(0.6 * u, 0.02 * u, 0.4 * u, 0, 0.01 * u, 0), 0x8a5a30], [G.box(0.54 * u, 0.022 * u, 0.34 * u, 0, 0.012 * u, 0), 0xb07a40]], 0.3);
  mat.position.set(mx, floor, 0.15 * u);
  const SHOE = [[G.box(0.09 * u, 0.025 * u, 0.2 * u, 0, 0.0125 * u, 0), 0xf4f4f4], [G.sphere(0.06 * u, 0, 0.05 * u, 0.04 * u, 0.75, 0.75, 1.5), RED], [G.box(0.08 * u, 0.06 * u, 0.06 * u, 0, 0.06 * u, -0.07 * u), RED], [G.box(0.06 * u, 0.01 * u, 0.05 * u, 0, 0.09 * u, 0.0), 0xffffff]];
  const shoes = many(SHOE.map(([g, c]) => [g.scale(1.7, 1.7, 1.7), c]), 2, 0.4), kid = createPerson({ u: 0.75 * u, shirt: 0x60b060, shoes: SKIN });
  group.add(mat, shoes, kid.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { hop: [0, 1.5], turn: [1.5, 0.4], walk: [1.9, 1.2], on: [3.1, 0.1], off: [3.4, 1.4], gone: [4.8, 0.2] });
      for (let i = 0; i < 2; i++) {
        const side = i ? 1 : -1, ph = v * 8 + i * Math.PI, x = mx + side * 0.1 * u + 0.8 * u * (1 - T.hop), y = floor + 0.02 * u + (T.hop < 1 ? 0.1 * u * Math.abs(Math.sin(ph)) : 0);
        shoes.set(i, x, y, 0.15 * u, pre || T.on > 0 ? 0 : 1, 0, -Math.PI / 2 * (1 - T.turn));
      }
      shoes.commit();
      const worn = T.on > 0;
      kid.rig.setColor('footL', worn ? RED : SKIN); kid.rig.setColor('footR', worn ? RED : SKIN);
      kid.reset();
      if (T.on === 0) { kid.face('toward').walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); kid.group.position.set(mx, floor, 0.15 * u - 0.7 * u * (1 - T.walk)); }
      else { kid.face('right').walk(v * 9, T.off > 0 && T.off < 1 ? 1 : 0); kid.group.position.set(mx + 0.75 * u * T.off, floor, 0.15 * u); }
      kid.group.visible = !pre && T.walk > 0 && T.gone < 1; kid.update();
    },
  };
}

function cloudsGather(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.45 * u, sy = B.maxY - 0.05 * u;
  const sun = emblemProp('sun', 0.55 * u), mats = []; sun.traverse((o) => { if (o.material) mats.push(o.material); });
  const CLOUD = [[G.sphere(0.13 * u, 0, 0, 0), 0xc8ccd4], [G.sphere(0.1 * u, -0.13 * u, -0.03 * u, 0), 0xc8ccd4], [G.sphere(0.1 * u, 0.13 * u, -0.03 * u, 0), 0xb8bcc8], [G.sphere(0.08 * u, 0.06 * u, 0.08 * u, 0.02 * u), 0xd8dce4]];
  const clouds = many(CLOUD, 3, 0.35), dim = veil(4 * u, 3 * u, 0x404858);
  const stem = solidProp([[G.cyl(0.014 * u, 0.014 * u, 0.42 * u, 0, 0.21 * u, 0), 0x3a9a3a], [G.sphere(0.05 * u, 0.04 * u, 0.15 * u, 0, 1, 0.45, 0.6), 0x3a9a3a]], 0.4);
  const head = solidProp([...Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [G.sphere(0.045 * u, Math.cos(a) * 0.09 * u, Math.sin(a) * 0.09 * u, 0, 1.5, 0.6, 0.3), 0xffd820]; }), [G.sphere(0.065 * u, 0, 0, 0.015 * u, 1, 1, 0.5), 0x6a3a14]], 0.5);
  const flower = new THREE.Group(), headPivot = new THREE.Group(); headPivot.position.y = 0.42 * u; headPivot.add(head); flower.add(stem, headPivot);
  sun.position.set(sx, sy, -0.25 * u); flower.position.set(sx + 0.15 * u, floor, 0.1 * u); dim.position.set(B.cx + 0.5 * u, B.cy, -0.6 * u);
  group.add(dim, sun, clouds, flower);
  const loop = 5.6, FROM = [[-0.9, 0.15], [0.9, 0.05], [0.7, -0.2]], TO = [[-0.12, 0.05], [0.14, 0.02], [0.0, -0.1]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { gather: [0.2, 1.8], fade: [4.6, 0.8] }), c = pre ? 0 : T.gather * (1 - T.fade);
      for (let i = 0; i < 3; i++) { const [fx, fy] = FROM[i], [tx, ty] = TO[i]; clouds.set(i, sx + (fx + (tx - fx) * T.gather) * u + 0.02 * u * Math.sin(t + i), sy + (fy + (ty - fy) * T.gather) * u, -0.1 * u + 0.04 * u * i, pop(c * (1 + 0.15 * i))); }
      clouds.commit();
      mats.forEach((m) => { m.emissiveIntensity = 0.45 * (1 - 0.85 * c); });
      sun.idle(t * (1 - c)); dim.material.opacity = 0.45 * c; dim.visible = c > 0.01;
      headPivot.rotation.z = -1.1 * c; stem.rotation.z = -0.15 * c; flower.rotation.z = 0.04 * Math.sin(t * 2) * (1 - c);
    },
  };
}

function knockDoor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.5 * u, W = 0.42 * u, H = 0.85 * u;
  const frame = solidProp([[G.box(0.05 * u, H + 0.05 * u, 0.08 * u, -W / 2 - 0.025 * u, H / 2, 0), 0x7a4a2a], [G.box(0.05 * u, H + 0.05 * u, 0.08 * u, W / 2 + 0.025 * u, H / 2, 0), 0x7a4a2a], [G.box(W + 0.1 * u, 0.05 * u, 0.08 * u, 0, H + 0.025 * u, 0), 0x7a4a2a], [G.box(W, H, 0.01 * u, 0, H / 2, -0.06 * u), 0xffd890]], 0.3);
  frame.position.set(dx, floor, 0);
  const hinge = new THREE.Group(), panel = solidProp([[G.box(W, H, 0.04 * u, W / 2, H / 2, 0), 0xc08048], [G.box(W * 0.7, H * 0.3, 0.01 * u, W / 2, H * 0.72, 0.022 * u), 0xa86a38], [G.box(W * 0.7, H * 0.3, 0.01 * u, W / 2, H * 0.3, 0.022 * u), 0xa86a38], [G.sphere(0.025 * u, W * 0.85, H * 0.48, 0.035 * u), 0xffd040]], 0.35);
  hinge.add(panel); hinge.position.set(dx - W / 2, floor, 0.01 * u);
  const who = createPerson({ u: 0.8 * u, shirt: 0x14141c, pants: 0x14141c, skin: 0x14141c, hair: 0x14141c, shoes: 0x14141c, eyes: 0xffffff, glow: 0.2 });
  const rings = many([[G.torus(0.08 * u, 0.01 * u), 0xffffff]], 3, 0.9), q = emblemProp('question', 0.35 * u, { color: 0xffe040 });
  group.add(frame, hinge, who.group, rings, q);
  const loop = 5.6, KN = [0.2, 0.55, 0.9];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { q: [1.2, 0.4, 'back'], open: [1.8, 0.5, 'out'], peek: [2.2, 0.4], unpeek: [3.6, 0.3], shut: [3.9, 0.3, 'in'], qOff: [4.8, 0.4] });
      const knock = KN.reduce((s, k) => s + bump(v, k, 0.15), 0);
      hinge.rotation.y = -1.3 * (T.open - T.shut) - 0.02 * knock;
      KN.forEach((k, i) => { const f = pre ? 0 : between(v, k, k + 0.35); rings.set(i, dx + 0.05 * u, floor + 0.5 * u, 0.06 * u, f > 0 && f < 1 ? 0.6 + 1.6 * f : 0); });
      rings.commit();
      const pk = T.peek - T.unpeek; who.reset(); who.group.visible = pk > 0; who.group.position.set(dx + 0.06 * u, floor, -0.03 * u); who.face(-0.2); who.bone('body').rotation.z = 0.2 * pk; who.bone('head').rotation.z = 0.3 * pk;
      who.bone('eyeL').scale.y = who.bone('eyeR').scale.y = (v % 1.3) < 0.1 ? 0.2 : 1; who.update();
      const qs = pre ? 0 : T.q * (1 - T.qOff); q.visible = qs > 0.01; q.scale.setScalar(pop(0.35 * u * qs)); q.position.set(dx + 0.05 * u, floor + H + 0.25 * u + 0.03 * u * Math.sin(t * 3), 0.05 * u); q.idle(t);
    },
  };
}

export const SCENES = { 'ice-melt': iceMelt, 'garden-water': gardenWater, 'home-time': homeTime, 'gift-bow': giftBow, 'yellow-things': yellowThings, 'shoe-step': shoeStep, 'clouds-gather': cloudsGather, 'knock-door': knockDoor };
