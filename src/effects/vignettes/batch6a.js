// Batch 6 kanji, part 1.
//   travel-road   旅: a traveller with a backpack and a suitcase walks on the spot while the scenery slides past behind:
//                 mountains, then the sea with a boat, then a town
//   pool-swim     泳: a swimmer in a cap does the front crawl across a pool, arms windmilling, splashes flying
//   bird-sing     鳴: a bird on a branch opens its beak and sings (notes rise); a second bird answers back
//   stove-warm    暖: a frosty, shivering person holds their hands out to a glowing stove; the frost melts and they relax
//   onsen-soak    温: in a rocky outdoor hot spring a person with a towel on their head sinks in up to the shoulders; steam,
//                 snowflakes, a happy sigh
//   two-buckets   両: a person lifts two buckets of water at once, one in each hand, and balances them evenly
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function travelRoad(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, W = 1.0 * u;
  const ground = solidProp([[G.box(W + 0.2 * u, 0.02 * u, 0.3 * u, 0, 0.01 * u, 0), 0xc8b088]], 0.3); ground.position.set(px, floor, 0.05 * u);
  const scenes = [solidProp([[G.cone(0.22 * u, 0.4 * u, -0.1 * u, 0.2 * u, 0), 0x5a6a9a], [G.cone(0.08 * u, 0.12 * u, -0.1 * u, 0.36 * u, 0.01 * u), 0xffffff], [G.cone(0.16 * u, 0.3 * u, 0.15 * u, 0.15 * u, -0.05 * u), 0x7a8ab8]], 0.4),
    solidProp([[G.box(0.6 * u, 0.12 * u, 0.02 * u, 0, 0.06 * u, 0), 0x2a8ad8], [G.box(0.16 * u, 0.05 * u, 0.03 * u, 0.05 * u, 0.14 * u, 0.01 * u), 0xffffff], [G.box(0.01 * u, 0.12 * u, 0.01 * u, 0.05 * u, 0.22 * u, 0.01 * u), 0x8a5a30], [G.cone(0.05 * u, 0.1 * u, 0.08 * u, 0.22 * u, 0.012 * u, -Math.PI / 2), 0xffffff]], 0.4),
    solidProp([[G.box(0.12 * u, 0.36 * u, 0.04 * u, -0.15 * u, 0.18 * u, 0), 0x8a96b0], [G.box(0.14 * u, 0.24 * u, 0.04 * u, 0.0, 0.12 * u, 0), 0xc8a080], [G.box(0.1 * u, 0.44 * u, 0.04 * u, 0.15 * u, 0.22 * u, 0), 0x6a7a98]], 0.4)];
  const p = createPerson({ u: 0.7 * u, shirt: 0x40a080 }), pack = solidProp([[G.box(0.14 * u, 0.18 * u, 0.08 * u, 0, 0, 0), 0xe07a30]], 0.4), bag = emblemProp('suitcase', 0.2 * u, { color: 0x3a6ad8 });
  p.rig.attach('body', pack, 0.6).position.z = -0.1 * u;
  group.add(ground, ...scenes, p.group, bag);
  const loop = 6.0, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0.5 : (v / loop) * 3;
      scenes.forEach((sc, i) => { const f = s - i, x = px + W * 0.6 - W * 1.2 * between(f, -0.2, 1.2); sc.position.set(x, floor + 0.02 * u, -0.3 * u); sc.visible = f > -0.2 && f < 1.2; sc.scale.setScalar(pop(Math.min(1, Math.min(f + 0.2, 1.2 - f) * 4))); });
      p.reset().face('right').walk(v * 8, pre ? 0 : 1); p.group.position.set(px - 0.1 * u, floor + 0.02 * u, 0.1 * u); p.update(); bonePoint(p, 'handL', 0.8, hand);
      bag.position.set(hand.x, hand.y - 0.08 * u, hand.z + 0.06 * u); bag.idle(0);
    },
  };
}

function poolSwim(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u, W = 1.1 * u, pu = 0.6 * u;
  const pool = solidProp([[G.box(W, 0.14 * u, 0.5 * u, 0, 0.07 * u, 0), 0xe8f0f4], [G.box(W - 0.06 * u, 0.02 * u, 0.44 * u, 0, 0.13 * u, 0), 0x40a8e8], ...Array.from({ length: 9 }, (_, i) => [G.sphere(0.012 * u, (i / 8 - 0.5) * (W - 0.1 * u), 0.145 * u, -0.1 * u), i % 2 ? 0xff4040 : 0xffffff])], 0.45);
  pool.position.set(cx, 0, 0);
  const p = createPerson({ u: pu, shirt: 0x203a80, skin: 0xffd2b0 }), cap = solidProp([[new THREE.SphereGeometry(0.14 * pu, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xffe040]], 0.5);
  p.rig.attach('head', cap, 0.5);
  const pivot = new THREE.Group(); pivot.add(p.group); p.group.position.y = -0.39 * pu;
  const splash = many([[G.sphere(0.02 * u), 0xe0f4ff]], 10, 0.8);
  const tilt = new THREE.Group(); tilt.add(pool, pivot, splash); tilt.position.set(0, floor, 0); tilt.rotation.x = 0.45; group.add(tilt);
  const loop = 4.8, water = 0.14 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.4 : between(v, 0.2, 4.4), x = cx - W / 2 + 0.15 * u + (W - 0.3 * u) * f, ph = v * 6;
      p.reset().face(0); p.bone('armL').rotation.x = ph; p.bone('armR').rotation.x = ph + Math.PI;
      p.bone('legL').rotation.x = 0.3 * Math.sin(ph * 2); p.bone('legR').rotation.x = -0.3 * Math.sin(ph * 2); p.update();
      pivot.position.set(x, water + 0.03 * u, 0.02 * u); pivot.rotation.order = 'YXZ'; pivot.rotation.set(Math.PI / 2, Math.PI / 2, 0); pivot.scale.setScalar(pop(Math.min(1, Math.min(f, 1 - f) * 10)));
      for (let i = 0; i < 10; i++) { const g = ((v * 2 + i / 10) % 1); splash.set(i, x + 0.1 * u * Math.cos(i * 2.2) - 0.2 * u * (i % 2), water + 0.15 * u * Math.sin(Math.PI * g), 0.1 * u * Math.sin(i * 1.3), pre ? 0 : 1 - g); }
      splash.commit();
    },
  };
}

function birdSing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.3 * u, by = floor + 0.6 * u;
  const branch = solidProp([[G.cyl(0.02 * u, 0.025 * u, 1.0 * u, 0.4 * u, 0, -0.05 * u, 0, 0, Math.PI / 2), 0x8a5a30], [G.sphere(0.06 * u, 0.85 * u, 0.04 * u, -0.05 * u, 1.6, 0.6, 0.8), 0x4a9a3a], [G.sphere(0.05 * u, 0.1 * u, 0.04 * u, -0.05 * u, 1.6, 0.6, 0.8), 0x4a9a3a]], 0.35);
  branch.position.set(bx, by, 0);
  const bird = (c, s) => { const g = new THREE.Group(), body = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1.2, 1, 1), c], [G.sphere(0.05 * u, s * 0.07 * u, 0.06 * u, 0), c], [G.sphere(0.01 * u, s * 0.095 * u, 0.075 * u, 0.035 * u), 0x1a1a24], [G.cone(0.03 * u, 0.08 * u, -s * 0.08 * u, 0.0, 0, s * Math.PI / 2 - s * 0.4), c], [G.cone(0.016 * u, 0.04 * u, s * 0.13 * u, 0.065 * u, 0, -s * Math.PI / 2), 0xff9a20]], 0.5), jaw = new THREE.Group(), jm = solidProp([[G.cone(0.012 * u, 0.035 * u, s * 0.018 * u, 0, 0, -s * Math.PI / 2), 0xe07a10]], 0.5);
    jaw.add(jm); jaw.position.set(s * 0.11 * u, 0.055 * u, 0); g.add(body, jaw); return { g, jaw }; };
  const A1 = bird(0xe04848, 1), A2 = bird(0x40a0e0, -1); A1.g.position.set(bx + 0.1 * u, by + 0.09 * u, 0); A2.g.position.set(bx + 0.8 * u, by + 0.09 * u, 0);
  const notes = many([[G.sphere(0.025 * u, 0, 0, 0, 1.3, 1, 0.6), 0xffffff], [G.box(0.006 * u, 0.07 * u, 0.006 * u, 0.028 * u, 0.035 * u, 0), 0xffffff]], 8, 0.9);
  for (let i = 0; i < 8; i++) notes.setColorAt(i, new THREE.Color(i < 4 ? 0xffb0b0 : 0xb0d8ff));
  group.add(branch, A1.g, A2.g, notes);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const S = acts(ctx, t, loop), pre = S.u < 0, v = pre ? -1 : S.v, s1 = !pre && v > 0.3 && v < 1.9, s2 = !pre && v > 2.3 && v < 3.9;
      A1.jaw.rotation.z = s1 ? -0.5 * Math.abs(Math.sin(v * 14)) : 0; A2.jaw.rotation.z = s2 ? 0.5 * Math.abs(Math.sin(v * 14)) : 0;
      A1.g.rotation.z = s1 ? 0.15 : 0; A2.g.rotation.z = s2 ? -0.15 : 0; A1.g.position.y = by + 0.09 * u + (s1 ? 0.01 * u * Math.sin(v * 20) : 0); A2.g.position.y = by + 0.09 * u + (s2 ? 0.01 * u * Math.sin(v * 20) : 0);
      for (let i = 0; i < 8; i++) { const mine = i < 4, from = mine ? 0.3 : 2.3, g = between(v, from + 0.3 * (i % 4), from + 1.2 + 0.3 * (i % 4)), sx = mine ? bx + 0.22 * u : bx + 0.68 * u, dir = mine ? 1 : -1;
        notes.set(i, sx + dir * 0.15 * u * g, by + 0.18 * u + 0.35 * u * g, 0.02 * u, g > 0 && g < 1 ? Math.sin(Math.PI * g) : 0, 0.3 * Math.sin(g * 9)); }
      notes.commit();
    },
  };
}

function stoveWarm(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u;
  const stove = solidProp([[G.box(0.3 * u, 0.36 * u, 0.26 * u, 0, 0.2 * u, 0), 0x3a3a44], [G.box(0.18 * u, 0.12 * u, 0.01 * u, 0, 0.18 * u, 0.131 * u), 0xff8a20], [G.cyl(0.04 * u, 0.04 * u, 0.5 * u, 0.06 * u, 0.62 * u, -0.05 * u), 0x3a3a44], ...[-0.1, 0.1].map((x) => [G.box(0.03 * u, 0.04 * u, 0.2 * u, x * u, 0.0, 0), 0x2a2a30])], 0.5);
  stove.position.set(sx, floor, 0);
  const fire = many([[G.cone(0.03 * u, 0.08 * u, 0, 0.04 * u, 0), 0xffc040]], 4, 1.0), glow = solidProp([[G.sphere(0.25 * u, 0, 0, 0, 1, 1, 0.3), 0xff7020]], 0.9); glow.material.transparent = true; glow.material.opacity = 0.25; glow.position.set(sx, floor + 0.2 * u, 0.0);
  const p = createPerson({ u: 0.8 * u, shirt: 0x6ab8f0 }), frost = many([[G.sphere(0.015 * u), 0xffffff]], 10, 0.9);
  group.add(glow, stove, fire, p.group, frost);
  const loop = 5.2, cold = new THREE.Color(0xa8d8ff), warm = new THREE.Color(0xffd2b0), c = new THREE.Color();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 0 : between(v, 0.8, 2.8) * (1 - between(v, 4.6, 5.1)), shiver = (1 - w) * 0.03 * Math.sin(t * 30);
      for (let i = 0; i < 4; i++) fire.set(i, sx + (i - 1.5) * 0.04 * u, floor + 0.13 * u, 0.135 * u, 0.7 + 0.3 * Math.sin(t * 12 + i * 2)); fire.commit();
      glow.scale.setScalar(1 + 0.1 * Math.sin(t * 6));
      p.rig.setColor('head', c.copy(cold).lerp(warm, w).getHex()); p.rig.setColor('handL', c.getHex()); p.rig.setColor('handR', c.getHex());
      p.reset().face(-1.0); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.4 * between(v, 0.3, 0.8); p.group.rotation.z = shiver; p.bone('head').rotation.x = 0.2 * w;
      p.group.position.set(sx + 0.42 * u, floor, 0.12 * u); p.update();
      for (let i = 0; i < 10; i++) frost.set(i, sx + 0.42 * u + 0.12 * u * Math.cos(i * 2.4), floor + (0.3 + 0.07 * i) * u, 0.12 * u + 0.08 * u * Math.sin(i * 1.9), 1 - w);
      frost.commit();
    },
  };
}

function onsenSoak(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ox = B.maxX + 0.5 * u, pu = 0.65 * u;
  const rocks = solidProp(Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return [G.sphere(0.07 * u, Math.cos(a) * 0.36 * u, 0.06 * u, Math.sin(a) * 0.2 * u, 1.3, 0.8, 1), i % 2 ? 0x7a7a72 : 0x8a8a80]; }), 0.35);
  rocks.position.set(ox, floor, 0);
  const water = solidProp([[G.cyl(0.34 * u, 0.34 * u, 0.02 * u, 0, 0, 0, 0, 0, 0, 28).scale(1, 1, 0.55), 0x7ad0e0]], 0.6); water.position.set(ox, floor + 0.09 * u, 0);
  const p = createPerson({ u: pu, shirt: 0xffd2b0 }), towel = solidProp([[G.box(0.14 * pu * 1.5, 0.05 * pu, 0.1 * pu * 1.5, 0, 0, 0), 0xffffff]], 0.5);
  p.rig.attach('head', towel, 1.0);
  const steam = many(PUFF(u, 0xffffff), 8, 0.5), snow = many([[G.sphere(0.01 * u), 0xffffff]], 10, 0.9), ahh = textPlane('ふぅ〜', { h: 0.12 * u, color: '#ffffff', bg: null });
  group.add(rocks, p.group, water, steam, snow, ahh);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, sink = pre ? 1 : timeline(v, { s: [0.3, 1.0, 'smooth'], up: [4.5, 0.6] }), d = pre ? 1 : sink.s - sink.up;
      p.reset().face(0); p.bone('head').rotation.z = 0.15 * Math.sin(t * 0.8) * d; p.raise('L', 0.6 * d); p.raise('R', 0.6 * d); p.group.position.set(ox, floor + 0.09 * u - 0.32 * pu * d, 0.02 * u); p.update();
      wisps(steam, 0, 8, ox, floor + 0.12 * u, t, u, { period: 2.2, rise: 0.5, sway: 0.15, size: 1.4 }); steam.commit();
      for (let i = 0; i < 10; i++) { const g = ((t * 0.15 + i / 10) % 1); snow.set(i, ox - 0.5 * u + ((i * 0.37) % 1) * u, floor + 1.1 * u - 1.0 * u * g, 0.1 * u * Math.sin(i), 1); } snow.commit();
      const a = pre ? 0 : bump(v, 1.4, 2.4); ahh.visible = a > 0; ahh.scale.setScalar(pop(Math.min(1, a * 2))); ahh.position.set(ox + 0.25 * u, floor + 0.55 * u, 0.1 * u);
    },
  };
}

function twoBuckets(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, pu = 0.85 * u;
  const p = createPerson({ u: pu, shirt: 0xe07a30 }), buckets = many([[G.cyl(0.08 * u, 0.065 * u, 0.13 * u, 0, -0.1 * u, 0, 0, 0, 0, 16), 0x8a96a8], [G.cyl(0.075 * u, 0.075 * u, 0.01 * u, 0, -0.04 * u, 0, 0, 0, 0, 16), 0x40a0f0], [G.torus(0.07 * u, 0.006 * u, Math.PI, 0, -0.04 * u, 0), 0x3a3a44]], 2, 0.45);
  const level = solidProp([[G.box(0.6 * u, 0.012 * u, 0.012 * u, 0, 0, 0), 0x60e080], [G.sphere(0.02 * u, 0, 0.02 * u, 0), 0xffe040]], 0.8);
  group.add(p.group, buckets, level);
  const loop = 4.8, hl = new THREE.Vector3(), hr = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { bend: [0.2, 0.4], lift: [0.7, 0.6, 'out'], set: [3.8, 0.6] }), up = T.lift - T.set, crouch = bump(v, 0.2, 1.0) * 0.6 + 0.4 * (1 - up) * (v > 3.8 ? 1 : 0);
      p.reset().face(0); p.lean(0.5 * crouch); p.raise('L', 0.35 + 0.1 * up); p.raise('R', 0.35 + 0.1 * up); p.group.position.set(px, floor + 0.03 * u * bump(v, 1.6, 0.4), 0.1 * u); p.update();
      bonePoint(p, 'handL', 0.8, hl); bonePoint(p, 'handR', 0.8, hr);
      const rest = floor + 0.17 * u, tilt = 0.06 * Math.sin(v * 3) * (v > 1.4 && v < 3.6 ? 1 : 0);
      buckets.set(0, hl.x + 0.02 * u, Math.max(rest, hl.y) + tilt * u, hl.z, 1); buckets.set(1, hr.x - 0.02 * u, Math.max(rest, hr.y) - tilt * u, hr.z, 1); buckets.commit();
      level.visible = !pre && up > 0.9; level.position.set(px, floor + 1.0 * pu, 0.1 * u); level.rotation.z = tilt * 2;
    },
  };
}

export const SCENES = { 'travel-road': travelRoad, 'pool-swim': poolSwim, 'bird-sing': birdSing, 'stove-warm': stoveWarm, 'onsen-soak': onsenSoak, 'two-buckets': twoBuckets };
