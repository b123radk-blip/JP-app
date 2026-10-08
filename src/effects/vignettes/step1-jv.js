// Step 1 word variants of step1-j.js (same scene types, another outcome): bigHeart, iceCream, birdsWire, walletSpill, nestingDolls, tinySeed
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, HEART } from '../pieces/kit-things.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint } from './helpers.js';
import { grow, countTag, countScene, dayScene, withWeek, seeded } from './step1-kit.js';
import { dogParts } from './step1-a.js';
import { sit } from './step1-d.js';
import { birdThing } from './step1-c.js';

const tmp = new THREE.Vector3();
const heartsUp = (m, n, x, y, v, on, u, spread = 0.3) => { for (let i = 0; i < n; i++) { const f = ((v * 0.5 + i / n) % 1); m.set(i, x + spread * u * (i / (n - 1 || 1) - 0.5) + 0.05 * u * Math.sin(f * 6 + i), y + 0.45 * u * f, 0.1 * u, on * Math.sin(Math.PI * f)); } m.commit(); };
const COIN = (u, s = 1) => [[G.cyl(0.09 * u * s, 0.09 * u * s, 0.03 * u * s, 0, 0, 0), 0xffc030], [G.cyl(0.065 * u * s, 0.065 * u * s, 0.032 * u * s, 0, 0, 0), 0xffdc60]];

export function bigHeart(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.6 * u, hy = B.cy;
  const heart = many(HEART(u, 0.55), 1, 0.8), small = many(HEART(u, 0.12), 8, 0.9), boom = burst(u, { s: 0.7, n: 12, color: 0xffe0f0 });
  group.add(boom, heart, small);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, g = pre ? 0 : between(v, 0, 2.4) * (1 - between(v, 4.6, 5.2)), beat = 1 + 0.12 * Math.max(0, Math.sin(v * 9)) * (g > 0.9 ? 1 : 0.3);
      heart.set(0, hx, hy, 0.02 * u, grow(0.3 + 1.2 * g) * beat); heart.commit();
      const b = pre ? 0 : between(v, 2.4, 3.4); boom.visible = b > 0 && b < 1; boom.scale.setScalar(grow(b * 1.3)); boom.position.set(hx, hy, -0.05 * u); boom.material.opacity = 1;
      for (let i = 0; i < 8; i++) { const a = i * 0.785, f = b; small.set(i, hx + Math.cos(a) * 0.6 * u * f, hy + Math.sin(a) * 0.5 * u * f, 0.05 * u, f > 0 && f < 1 ? 1 - f : 0, a); }
      small.commit();
    },
  };
}

export function iceCream(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.9 * u, shirt: 0x40c0a0 }), cone = solidProp([[G.cone(0.06 * u, 0.18 * u, 0, -0.09 * u, 0, Math.PI), 0xe0a858], [G.sphere(0.07 * u, 0, 0.03 * u, 0), 0xffb0d0], [G.sphere(0.04 * u, 0.02 * u, 0.1 * u, 0), 0xfff4e0]], 0.55);
  const eyes = many(HEART(u, 0.07, 0xff3a6a), 2, 1.2), hearts = many(HEART(u, 0.1), 3, 0.8);
  group.add(kid.group, cone, eyes, hearts);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, lick = pre ? 0 : Math.max(bump(v, 0.5, 0.6), bump(v, 1.3, 0.6)), love = pre ? 0 : between(v, 1.9, 2.2) * (1 - between(v, 4.4, 4.8));
      kid.reset().face('toward'); kid.group.position.set(kx, floor + 0.04 * u * Math.abs(Math.sin(v * 6)) * love, 0.02 * u);
      kid.bone('armR').rotation.x = 1.2 + 0.4 * lick; kid.bone('foreR').rotation.x = 1.4 + 0.3 * lick; kid.bone('head').rotation.x = 0.15 * lick; kid.update();
      bonePoint(kid, 'handR', 0.6, tmp); cone.position.set(tmp.x, tmp.y + 0.1 * u, tmp.z + 0.02 * u); cone.visible = !pre;
      kid.rig.setColor('eyeL', love > 0.5 ? 0xffd2b0 : 0x1a1a24); kid.rig.setColor('eyeR', love > 0.5 ? 0xffd2b0 : 0x1a1a24);
      bonePoint(kid, 'head', 0.5, tmp); for (let i = 0; i < 2; i++) eyes.set(i, tmp.x + (i ? 0.04 : -0.04) * u * 0.9, tmp.y, tmp.z + 0.12 * u, love > 0.5 ? 1 + 0.15 * Math.sin(t * 8) : 0);
      eyes.commit(); heartsUp(hearts, 3, kx, floor + 1.0 * u, v, love, u, 0.25);
    },
  };
}

export function birdsWire(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.1 * u, x1 = B.maxX + 1.3 * u, wy = B.cy + 0.2 * u, N = 10;
  const wire = solidProp([[G.cyl(0.006 * u, 0.006 * u, x1 - x0, (x1 - x0) / 2, 0, 0, 0, 0, Math.PI / 2), 0x303030], [G.cyl(0.02 * u, 0.02 * u, 0.9 * u, 0, -0.45 * u, 0), 0x6a5040], [G.cyl(0.02 * u, 0.02 * u, 0.9 * u, x1 - x0, -0.45 * u, 0), 0x6a5040]], 0.35);
  const birds = many([[birdThing(0.24 * u).geometry, 0xffffff]], N, 0.5); const COL = [0x4a8ae0, 0xe05a8a, 0x40b060, 0xffb030, 0x8a5ad0]; for (let i = 0; i < N; i++) birds.setColorAt(i, new THREE.Color(COL[i % 5]));
  wire.position.set(x0, wy, -0.05 * u);
  group.add(wire, birds);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.2, 5.9);
      for (let i = 0; i < N; i++) { const at = 0.2 + i * 0.3, f = pre ? 0 : between(v, at, at + 0.6), x = x0 + (0.06 + 0.11 * i) * u, y = wy - 0.005 * u; birds.set(i, x + 0.6 * u * (1 - f) + 0.8 * u * off, y + 0.5 * u * (1 - f) + 0.6 * u * off, -0.04 * u, f > 0 ? 1 : 0, 0.1 * Math.sin(t * 3 + i) * (f >= 1 ? 1 : 0), Math.PI); }
      birds.commit();
    },
  };
}

export function walletSpill(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.4 * u;
  const base = solidProp([[G.box(0.4 * u, 0.03 * u, 0.26 * u, 0, 0, 0), 0x6a3a1a]], 0.4), flapP = new THREE.Group(), flap = solidProp([[G.box(0.4 * u, 0.03 * u, 0.26 * u, 0, 0, -0.13 * u), 0x7a4a24], [G.cyl(0.02 * u, 0.02 * u, 0.04 * u, 0, 0.02 * u, -0.24 * u), 0xffd040]], 0.4);
  flapP.add(flap); flapP.position.set(wx, floor + 0.05 * u, -0.13 * u); base.position.set(wx, floor + 0.02 * u, 0); base.rotation.x = 0.0;
  const coins = many(COIN(u, 0.8), 6, 0.8), notes = many([[G.box(0.24 * u, 0.12 * u, 0.005 * u, 0, 0, 0), 0x90d090], [G.cyl(0.03 * u, 0.03 * u, 0.006 * u, 0, 0, 0, Math.PI / 2), 0x509050]], 3, 0.6), yen = textPlane('¥', { h: 0.18 * u, color: '#ffd040', weight: 900 });
  group.add(base, flapP, coins, notes, yen);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, open = pre ? 0 : between(v, 0.2, 0.7) * (1 - between(v, 4.8, 5.3)), spill = pre ? 0 : between(v, 0.8, 2.2) * (1 - between(v, 4.6, 5.0));
      flapP.rotation.x = -2.2 * open;
      for (let i = 0; i < 6; i++) { const a = -0.4 + i * 0.35, f = between(spill, i * 0.08, 0.6 + i * 0.08); coins.set(i, wx + Math.cos(a) * 0.45 * u * f, floor + 0.05 * u + 0.35 * u * Math.sin(Math.PI * f) * 0.8 + 0.015 * u, 0.1 * u + Math.sin(a) * 0.1 * u * f, f > 0 ? 1 : 0, f * 6, 0, Math.PI / 2 * f); }
      coins.commit();
      for (let i = 0; i < 3; i++) { const f = between(spill, 0.1 + i * 0.15, 0.7 + i * 0.15); notes.set(i, wx + (i - 1) * 0.15 * u, floor + 0.08 * u + 0.4 * u * f, 0.02 * u, f > 0 ? 1 : 0, (i - 1) * 0.4 + 0.2 * Math.sin(v * 3 + i), 0, -0.5 * f); }
      notes.commit();
      const k = pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 4.6, 5.0)); yen.visible = k > 0.01; yen.scale.setScalar(grow(k)); yen.position.set(wx, floor + 0.85 * u, 0.05 * u);
    },
  };
}

export function nestingDolls(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.3 * u;
  const doll = (s, c) => [[G.sphere(0.12 * u * s, 0, 0.12 * u * s, 0, 1, 1.15, 1), c], [G.sphere(0.085 * u * s, 0, 0.3 * u * s, 0), c], [G.sphere(0.06 * u * s, 0, 0.3 * u * s, 0.04 * u * s, 1, 1, 0.6), 0xffe0c8], [G.sphere(0.06 * u * s, 0, 0.12 * u * s, 0.07 * u * s, 1, 1, 0.5), 0xfff0e0]];
  const COL = [0xe03838, 0x3a7ae0, 0x40b060, 0xffb030], dolls = COL.map((c, i) => solidProp(doll(1.6 * Math.pow(0.68, i), c), 0.5));
  group.add(...dolls);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, back = pre ? 0 : between(v, 4.6, 5.6);
      let x = dx;
      dolls.forEach((d, i) => { const out = i === 0 ? 1 : (pre ? 0 : between(v, 0.4 + 0.8 * (i - 1), 0.9 + 0.8 * (i - 1))) * (1 - back), s = 1.6 * Math.pow(0.68, i); if (i) x += 0.32 * u * Math.pow(0.68, i - 1) * 1.2 * out; d.position.set(x, floor + 0.04 * u * Math.abs(Math.sin(v * 5 + i)) * out, 0.02 * u * i); d.visible = !pre && (i === 0 || out > 0.02); d.scale.setScalar(i ? grow(0.3 + 0.7 * out) : 1); void s; });
    },
  };
}

export function tinySeed(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u;
  const hand = createHand({ u: 0.7 * u, sleeve: 0x8a6a40 }), seed = solidProp([[G.sphere(0.018 * u, 0, 0, 0, 1.3, 0.9, 0.9), 0x8a5a30]], 0.6), ring = solidProp([[G.torus(0.05 * u, 0.006 * u), 0xffe060]], 1.4);
  group.add(hand.group, seed, ring);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, open = pre ? 0 : between(v, 0.6, 1.2) * (1 - between(v, 4.2, 4.7));
      hand.pose('grip', 'flat', open); hand.group.position.set(hx, floor + 0.05 * u, 0.1 * u); hand.group.rotation.set(-1.2, 0, 0); hand.group.visible = !pre;
      seed.position.set(hx, floor + 0.12 * u, 0.28 * u); seed.visible = open > 0.6;
      const p = pre ? 0 : between(v, 1.3, 2.3); ring.visible = open > 0.6; ring.position.set(hx, floor + 0.13 * u, 0.29 * u); ring.scale.setScalar(1 + 0.5 * Math.sin(t * 4) * 0.3); ring.rotation.x = -1.2; void p;
    },
  };
}
