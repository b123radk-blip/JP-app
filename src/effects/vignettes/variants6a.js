// Batch 6 word variants, part 1 (same scene type as their kanji, another `outcome`):
//   travel-road:suitcase  旅行: a suitcase rolls along by itself; travel stickers (a plane, a mountain, a palm) pop onto it
//   pool-swim:fish        泳ぐ: under the waves a fish swims along with a wiggle, bubbles rising
//   bird-sing:pets        鳴く: a cat says ニャー and a dog answers ワン, rings of sound around each
//   stove-warm:spring     暖かい: the spring sun comes out; patches of snow melt away and flowers pop up
//   onsen-soak:tepid      温い: a hand dips a finger in the bath; a weak wisp of steam, and a so-so face (flat mouth)
//   two-buckets:parents   両親: a mum and a dad each hold one of their kid's hands and swing the kid up between them
//   stand-vase:kitchen    台所: a kitchen counter: a pot boils with its lid rattling, the tap drips, a knife chops a carrot
//   coin-keep:star        有名: a person waves on a red carpet while camera flashes pop all around and a star shines above
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, handTo, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

export function suitcaseRoll(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const bag = solidProp([[G.box(0.36 * u, 0.26 * u, 0.12 * u, 0, 0.16 * u, 0), 0x3a6ad8], [G.box(0.04 * u, 0.2 * u, 0.02 * u, -0.1 * u, 0.39 * u, 0), 0x2a2a30], [G.box(0.12 * u, 0.02 * u, 0.02 * u, -0.1 * u, 0.49 * u, 0), 0x2a2a30], ...[-0.12, 0.12].map((x) => [G.cyl(0.025 * u, 0.025 * u, 0.14 * u, x * u, 0.025 * u, 0, Math.PI / 2), 0x1a1a24])], 0.4);
  const stickers = many([[G.cyl(0.045 * u, 0.045 * u, 0.006 * u, 0, 0, 0, Math.PI / 2), 0xffffff]], 4, 0.7), PAL = [0xffe040, 0x60e080, 0xff6a9a, 0xff9a40]; for (let i = 0; i < 4; i++) stickers.setColorAt(i, new THREE.Color(PAL[i]));
  group.add(bag, stickers);
  const loop = 5.0, SP = [[-0.1, 0.22], [0.05, 0.12], [0.11, 0.24], [-0.04, 0.09]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.5 : between(v, 0, loop), x = B.maxX + 0.25 * u + 0.8 * u * f, k = pop(Math.min(1, Math.min(f, 1 - f) * 10));
      bag.position.set(x, floor + 0.01 * u * Math.abs(Math.sin(v * 12)), 0.1 * u); bag.scale.setScalar(k); bag.rotation.z = 0.04 * Math.sin(v * 6);
      for (let i = 0; i < 4; i++) { const s = pre ? 1 : timeline(v, { s: [0.6 + 0.8 * i, 0.3, 'back'] }).s; stickers.set(i, x + SP[i][0] * u, floor + SP[i][1] * u + 0.04 * u, 0.163 * u, s * k, 0, 0, 0); }
      stickers.commit();
    },
  };
}

export function fishSwim(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u;
  const sea = solidProp([[G.box(1.2 * u, 0.6 * u, 0.02 * u, 0, 0.3 * u, -0.2 * u), 0x1a6ac0], [G.box(1.2 * u, 0.05 * u, 0.04 * u, 0, 0.61 * u, -0.18 * u), 0x8ad0ff], [G.box(1.2 * u, 0.06 * u, 0.1 * u, 0, 0.03 * u, -0.15 * u), 0xe0c890], [G.cone(0.03 * u, 0.15 * u, -0.35 * u, 0.13 * u, -0.17 * u), 0x40a060], [G.cone(0.03 * u, 0.2 * u, -0.3 * u, 0.15 * u, -0.17 * u), 0x50b070]], 0.4);
  sea.position.set(sx, floor, 0);
  const fish = new THREE.Group(), body = solidProp([[G.sphere(0.09 * u, 0, 0, 0, 1.5, 0.9, 0.6), 0xff8a30], [G.sphere(0.014 * u, 0.09 * u, 0.025 * u, 0.04 * u), 0x1a1a24], [G.box(0.02 * u, 0.1 * u, 0.06 * u, 0.0, 0, 0), 0xffffff]], 0.5), tail = solidProp([[G.cone(0.06 * u, 0.09 * u, -0.04 * u, 0, 0, Math.PI / 2), 0xff6a20]], 0.5);
  const tailP = new THREE.Group(); tailP.add(tail); tailP.position.x = -0.12 * u; fish.add(body, tailP);
  const bubbles = many([[G.sphere(0.015 * u), 0xd8f4ff]], 6, 0.8);
  group.add(sea, fish, bubbles);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.5 : v / loop, x = sx - 0.5 * u + 1.0 * u * f, y = floor + 0.32 * u + 0.06 * u * Math.sin(v * 3);
      fish.position.set(x, y, 0.0); fish.rotation.z = 0.15 * Math.cos(v * 3); fish.scale.setScalar(pop(Math.min(1, Math.min(f, 1 - f) * 10))); tailP.rotation.y = 0.5 * Math.sin(t * 10);
      for (let i = 0; i < 6; i++) { const g = ((t * 0.6 + i / 6) % 1); bubbles.set(i, x + 0.1 * u + 0.03 * u * Math.sin(g * 9 + i), y + 0.25 * u * g, 0.01 * u, pre ? 0 : 1 - g); } bubbles.commit();
    },
  };
}

export function pets(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.3 * u, dx = cx + 0.6 * u;
  const cat = solidProp([[G.sphere(0.09 * u, 0, 0.1 * u, 0, 1.3, 1, 0.9), 0x9aa0aa], [G.sphere(0.07 * u, 0.09 * u, 0.2 * u, 0), 0x9aa0aa], [G.cone(0.025 * u, 0.05 * u, 0.06 * u, 0.28 * u, 0, 0.3), 0x9aa0aa], [G.cone(0.025 * u, 0.05 * u, 0.12 * u, 0.28 * u, 0, -0.3), 0x9aa0aa], [G.sphere(0.012 * u, 0.12 * u, 0.21 * u, 0.06 * u), 0x40c040], [G.sphere(0.012 * u, 0.07 * u, 0.21 * u, 0.06 * u), 0x40c040], [G.tube([[-0.1 * u, 0.1 * u], [-0.16 * u, 0.15 * u], [-0.15 * u, 0.25 * u]], 0.012 * u), 0x9aa0aa]], 0.45);
  const dog = solidProp([[G.sphere(0.1 * u, 0, 0.12 * u, 0, 1.5, 0.9, 0.9), 0xc89060], [G.sphere(0.075 * u, -0.13 * u, 0.22 * u, 0), 0xc89060], [G.sphere(0.035 * u, -0.19 * u, 0.2 * u, 0, 1.3, 0.8, 0.8), 0xe0b080], [G.sphere(0.014 * u, -0.22 * u, 0.22 * u, 0), 0x1a1a24], [G.sphere(0.03 * u, -0.1 * u, 0.28 * u, 0.06 * u, 0.6, 1.4, 0.4), 0x6a4020], [G.sphere(0.03 * u, -0.1 * u, 0.28 * u, -0.06 * u, 0.6, 1.4, 0.4), 0x6a4020], ...[[-0.08, 0.05], [0.08, 0.05], [-0.08, -0.05], [0.08, -0.05]].map(([x, z]) => [G.cyl(0.02 * u, 0.02 * u, 0.08 * u, x * u, 0.04 * u, z * u), 0xc89060])], 0.45);
  cat.position.set(cx, floor, 0.05 * u); dog.position.set(dx, floor, 0.05 * u);
  const nya = textPlane('ニャー', { h: 0.13 * u, color: '#ffffff', bg: null }), wan = textPlane('ワン!', { h: 0.15 * u, color: '#ffe060', bg: null }), rings = many([[G.torus(0.06 * u, 0.006 * u), 0xffffff]], 4, 0.9);
  group.add(cat, dog, nya, wan, rings);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, c = pre ? 0 : bump(v, 0.3, 1.4), d = pre ? 0 : bump(v, 2.0, 1.4);
      cat.rotation.z = 0.15 * c; dog.position.y = floor + 0.04 * u * Math.abs(Math.sin(v * 14)) * d; dog.rotation.z = -0.1 * d;
      nya.visible = c > 0; nya.scale.setScalar(pop(Math.min(1, c * 2))); nya.position.set(cx + 0.05 * u, floor + 0.45 * u, 0.1 * u);
      wan.visible = d > 0; wan.scale.setScalar(pop(Math.min(1, d * 2))); wan.position.set(dx - 0.1 * u, floor + 0.5 * u, 0.1 * u);
      for (let i = 0; i < 4; i++) { const mine = i < 2, g = ((v * 1.5 + (i % 2) / 2) % 1), on = mine ? c : d; rings.set(i, mine ? cx + 0.15 * u : dx - 0.25 * u, floor + 0.22 * u, 0.06 * u, on > 0.2 ? 0.4 + 1.4 * g : 0, 0, Math.PI / 2); }
      rings.commit();
    },
  };
}

export function springMelt(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.55 * u;
  const ground = solidProp([[G.box(1.0 * u, 0.04 * u, 0.4 * u, 0, -0.02 * u, 0), 0x6aaa4a]], 0.35); ground.position.set(gx, floor, 0);
  const sun = solidProp([[new THREE.CircleGeometry(0.12 * u, 24), 0xffd040], ...Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [G.box(0.03 * u, 0.07 * u, 0.004 * u, Math.cos(a) * 0.17 * u, Math.sin(a) * 0.17 * u, 0, a - Math.PI / 2), 0xffe060]; })], 1.0);
  const snow = many([[G.sphere(0.1 * u, 0, 0, 0, 1.4, 0.35, 1), 0xffffff]], 4, 0.6), N = 5, flowers = many([[G.cyl(0.008 * u, 0.008 * u, 0.12 * u, 0, 0.06 * u, 0), 0x3a9a3a], ...Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2; return [G.sphere(0.022 * u, Math.cos(a) * 0.025 * u, 0.13 * u + Math.sin(a) * 0.025 * u, 0, 1, 1, 0.4), 0xffffff]; }), [G.sphere(0.015 * u, 0, 0.13 * u, 0.008 * u), 0xffe040]], N, 0.5);
  const PAL = [0xff6a9a, 0xffe040, 0xb070ff, 0xff9a40, 0x60c8ff]; for (let i = 0; i < N; i++) flowers.setColorAt(i, new THREE.Color(PAL[i]));
  group.add(ground, sun, snow, flowers);
  const loop = 5.2, SN = [-0.3, -0.05, 0.2, 0.38];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { sun: [0.2, 0.8, 'out'], melt: [1.0, 1.6], bloom: [2.2, 1.2], back: [4.6, 0.5] }), m = pre ? 0 : T.melt * (1 - T.back);
      sun.position.set(gx + 0.25 * u, floor + 0.55 * u + 0.25 * u * (pre ? 1 : T.sun), -0.2 * u); sun.rotation.z = t * 0.5; sun.scale.setScalar(pop(pre ? 1 : T.sun));
      for (let i = 0; i < 4; i++) snow.set(i, gx + SN[i] * u, floor, 0.05 * u * (i % 2 ? 1 : -1), pop(1 - m)); snow.commit();
      for (let i = 0; i < N; i++) { const b = pre ? 0 : between(T.bloom, i / N, (i + 1) / N) * (1 - T.back); flowers.set(i, gx + (-0.38 + 0.19 * i) * u, floor, 0.1 * u, pop(b), 0.1 * Math.sin(t * 2 + i)); } flowers.commit();
    },
  };
}

export function tepidBath(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const tub = solidProp([[G.cyl(0.3 * u, 0.26 * u, 0.26 * u, 0, 0.13 * u, 0, 0, 0, 0, 28).scale(1, 1, 0.6), 0xf4f4f8], [G.cyl(0.27 * u, 0.27 * u, 0.01 * u, 0, 0.22 * u, 0, 0, 0, 0, 28).scale(1, 1, 0.55), 0x8ad0e8]], 0.4);
  tub.position.set(tx, floor, 0);
  const hand = createHand({ u: 0.45 * u, side: -1, sleeve: 0xe07ab0 }), steam = many(PUFF(u, 0xffffff), 3, 0.4);
  const face = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 1, 0.35), 0xffd84a], [G.sphere(0.018 * u, -0.045 * u, 0.03 * u, 0.045 * u), 0x1a1a24], [G.sphere(0.018 * u, 0.045 * u, 0.03 * u, 0.045 * u), 0x1a1a24], [G.box(0.08 * u, 0.014 * u, 0.01 * u, 0, -0.045 * u, 0.045 * u), 0x8a2a1a]], 0.5);
  group.add(tub, hand.group, steam, face);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { dip: [0.3, 0.6, 'out'], up: [1.6, 0.4], meh: [1.9, 0.3, 'back'], off: [4.2, 0.4] }), d = T.dip - T.up;
      hand.group.visible = !pre && T.off < 1; hand.group.rotation.set(0, 0, Math.PI); hand.pose('point'); handTo(hand, tx + 0.05 * u, floor + 0.2 * u + 0.25 * u * (1 - d) + 0.3 * T.off * u, 0.05 * u, hand.bone('f1b')); hand.update();
      wisps(steam, 0, 3, tx, floor + 0.24 * u, t, u, { period: 2.4, rise: 0.15, size: 0.4 }); steam.commit();
      const m = pre ? 1 : T.meh * (1 - T.off); face.visible = m > 0.01; face.scale.setScalar(pop(m)); face.position.set(tx + 0.42 * u, floor + 0.55 * u, 0.05 * u); face.rotation.z = 0.15 * Math.sin(v * 2);
    },
  };
}

export function parentsSwing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u, ku = 0.5 * u;
  const mum = createPerson({ u: 0.9 * u, shirt: 0xe07ab0 }), dad = createPerson({ u: 0.95 * u, shirt: 0x3a6ad8 }), kid = createPerson({ u: ku, shirt: 0xffe040 });
  group.add(mum.group, dad.group, kid.group);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, swing = pre ? 0 : Math.max(0, Math.sin(v * Math.PI * 2 / 2)), up = swing * 0.3 * u;
      mum.reset().face(0.5); mum.raise('L', 0.6 + 0.6 * swing); mum.group.position.set(cx - 0.3 * u, floor, 0.0); mum.update();
      dad.reset().face(-0.5); dad.raise('R', 0.6 + 0.6 * swing); dad.group.position.set(cx + 0.3 * u, floor, 0.0); dad.update();
      kid.reset().face(0); kid.raise('L', 2.0); kid.raise('R', 2.0); kid.bone('legL').rotation.x = 0.6 * swing; kid.bone('legR').rotation.x = 0.4 * swing; kid.group.position.set(cx, floor + up, 0.05 * u); kid.update();
    },
  };
}

export function kitchen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.55 * u, CH = 0.4 * u;
  const counter = solidProp([[G.box(0.9 * u, CH, 0.3 * u, 0, CH / 2, 0), 0xe8e0d0], [G.box(0.92 * u, 0.03 * u, 0.32 * u, 0, CH, 0), 0x6a6e76], [G.box(0.22 * u, 0.02 * u, 0.2 * u, 0.28 * u, CH + 0.01 * u, 0), 0x2a2a30], [G.box(0.24 * u, 0.04 * u, 0.2 * u, -0.25 * u, CH - 0.01 * u, 0), 0x8ad0ff], [G.cyl(0.01 * u, 0.01 * u, 0.16 * u, -0.25 * u, CH + 0.08 * u, -0.08 * u), 0xc8ccd4], [G.cyl(0.008 * u, 0.008 * u, 0.08 * u, -0.25 * u, CH + 0.16 * u, -0.04 * u, Math.PI / 2), 0xc8ccd4], [G.box(0.16 * u, 0.015 * u, 0.12 * u, 0.0, CH + 0.02 * u, 0.04 * u), 0xc89a60], [G.cone(0.02 * u, 0.12 * u, 0.02 * u, CH + 0.04 * u, 0.04 * u, Math.PI / 2), 0xf07a20]], 0.4);
  counter.position.set(kx, floor, 0);
  const pot = solidProp([[G.cyl(0.08 * u, 0.07 * u, 0.1 * u, 0, 0.05 * u, 0), 0xc03030]], 0.45), lid = solidProp([[G.cyl(0.085 * u, 0.085 * u, 0.012 * u, 0, 0, 0), 0x8a8e96], [G.sphere(0.015 * u, 0, 0.015 * u, 0), 0x3a3a44]], 0.45);
  pot.position.set(kx + 0.28 * u, floor + CH + 0.02 * u, 0);
  const knife = solidProp([[G.box(0.12 * u, 0.04 * u, 0.006 * u, 0, 0, 0), 0xd8dde6], [G.box(0.06 * u, 0.02 * u, 0.012 * u, 0.09 * u, 0, 0), 0x3a2a1a]], 0.45), steam = many(PUFF(u, 0xffffff), 5, 0.5), drip = many([[G.sphere(0.01 * u, 0, 0, 0, 0.8, 1.4, 0.8), 0x8ad0ff]], 2, 0.8);
  group.add(counter, pot, lid, knife, steam, drip);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rattle = pre ? 0 : Math.abs(Math.sin(v * 18)) * 0.02 * u;
      lid.position.set(kx + 0.28 * u, floor + CH + 0.13 * u + rattle, 0); lid.rotation.z = rattle * 2 / u;
      wisps(steam, 0, 5, kx + 0.28 * u, floor + CH + 0.16 * u, t, u, { period: 1.4, rise: 0.35, size: 0.8 }); steam.commit();
      const chop = pre ? 0 : Math.abs(Math.sin(v * 8)); knife.position.set(kx + 0.0 * u + 0.03 * u * Math.floor((v * 8 / Math.PI) % 4), floor + CH + 0.07 * u + 0.06 * u * chop, 0.05 * u); knife.rotation.z = 0.3 * chop;
      for (let i = 0; i < 2; i++) { const g = ((t * 1.2 + i / 2) % 1); drip.set(i, kx - 0.25 * u, floor + CH + 0.14 * u - 0.12 * u * g, -0.0, 1); } drip.commit();
    },
  };
}

export function redCarpet(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u;
  const carpet = solidProp([[G.box(0.4 * u, 0.01 * u, 1.0 * u, 0, 0.005 * u, -0.2 * u), 0xc01828], ...[-1, 1].flatMap((s) => [[G.cyl(0.015 * u, 0.02 * u, 0.25 * u, s * 0.3 * u, 0.125 * u, 0.15 * u), 0xe0b030], [G.cyl(0.006 * u, 0.006 * u, 0.6 * u, s * 0.3 * u, 0.24 * u, -0.15 * u, Math.PI / 2), 0xc01828]])], 0.45);
  carpet.position.set(cx, floor, 0);
  const p = createPerson({ u: 0.85 * u, shirt: 0xf0c030 }), flashes = many([[G.sphere(0.03 * u), 0xffffff]], 6, 1.0), star = burst(u, { s: 0.3, n: 5, color: 0xffd040 });
  group.add(carpet, p.group, flashes, star);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 1 : timeline(v, { w: [0.1, 1.4, 'out'] }).w, wave = bump(v, 1.4, 2.6);
      p.reset().face(0).walk(v * 7, f > 0 && f < 1 ? 1 : 0); p.raise('R', 2.6 * wave + 0.3 * Math.sin(v * 9) * wave); p.group.position.set(cx, floor + 0.01 * u, lerp(-0.6 * u, 0.15 * u, f)); p.update();
      for (let i = 0; i < 6; i++) { const ph = (v * 2.3 + i * 0.37) % 1, on = !pre && ph < 0.12; flashes.set(i, cx + (i % 2 ? 0.45 : -0.45) * u + 0.05 * u * Math.sin(i * 3), floor + (0.3 + 0.15 * (i % 3)) * u, 0.1 * u, on ? 1.4 : 0); } flashes.commit();
      const s = pre ? 1 : 0.8 + 0.2 * Math.sin(t * 3); star.scale.setScalar(s); star.position.set(cx, floor + 1.05 * u, 0.05 * u); star.rotation.z = t * 0.5;
    },
  };
}
