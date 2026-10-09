// Model scenes, warmth, baths and evening (Step 3a model pass).
//   q-stove   暖: a grandma shivers in the snow, hugging herself; she holds her hands out to a glowing iron stove, stops
//             shaking and smiles: ほっ; outcome spring: she stands in the spring sun, eyes closed and face up, arms
//             open, petals drifting: ぽかぽか (暖かい)
//   q-onsen   温: a person sits up to his chest in a steaming hot spring among rocks, a towel on his head: ふぅ〜;
//             outcome tepid: a person dips a hand in a tub of water with no steam and pulls a face: ぬるい… (温い)
//   q-bath    お風呂: a child sits in a bathtub full of bubbles, arms on the rim, a rubber duck bobbing, humming ♪
//   q-dusk    夕: two children wave goodbye as the orange sun sinks behind the hills, then walk home opposite ways;
//             crows fly past
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, onHead } from './q-common.js';

const W = new THREE.Vector3();
const hugSelf = (p, k) => { p.handTo('R', p.local(0.11, 0.63, 0.1, W), k, { out: 0.5, down: 0.9 }); p.handTo('L', p.local(-0.11, 0.6, 0.12, W), k, { out: 0.5, down: 0.9 }); };

// ---- 暖 / 暖かい ----
function stove(ctx, spec, stage) {
  if (spec.outcome === 'spring') return spring(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, sx = x0 + 0.55 * u;
  const p = person(spec.who, u), ah = label(u, 'ほっ', '#e07a3a', 0.14), brr = label(u, 'ブルブル', '#3a7ac0', 0.12);
  const iron = solidProp([[G.cyl(0.14 * u, 0.15 * u, 0.36 * u, 0, 0.2 * u, 0), 0x30343c], [G.cyl(0.16 * u, 0.16 * u, 0.03 * u, 0, 0.39 * u, 0), 0x20242c], [G.cyl(0.03 * u, 0.03 * u, 0.6 * u, 0, 0.7 * u, -0.05 * u), 0x30343c], [G.box(0.12 * u, 0.1 * u, 0.02 * u, 0, 0.17 * u, 0.14 * u), 0xff7a20]], 0.5);
  const glow = solidProp([[G.sphere(0.4 * u), 0xff8a30]], 1.2), snow = many([[G.sphere(0.016 * u), 0xffffff]], 16, 1.0);
  glow.material.transparent = true; glow.material.opacity = 0.18; glow.material.depthWrite = false;
  iron.position.set(sx, floor, -0.05 * u); glow.position.set(sx, floor + 0.25 * u, -0.05 * u);
  group.add(iron, glow, p.group, snow, ah, brr);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [1.8, 0.5], warm: [2.4, 0.6], back: [5.6, 0.6] });
      const cold = pre ? 0.5 : 1 - T.warm * (1 - T.back), sh = cold * Math.sin(v * 40);
      p.pose('Idle', t); p.group.position.set(x0 + 0.005 * u * sh, floor, 0.1 * u); p.group.rotation.set(0, RIGHT - 0.5, 0.015 * sh);
      const r = T.reach * (1 - T.back);
      hugSelf(p, cold * (1 - r));
      const toward = iron.localToWorld(new THREE.Vector3(0, 0.45 * u, 0.1 * u));
      p.handTo('R', toward.clone().add(W.set(0, 0.05 * u, -0.1 * u)), r, { out: 0.5, down: 0.8 }); p.handTo('L', toward.add(W.set(0, 0.05 * u, 0.1 * u)), r, { out: 0.5, down: 0.8 });
      p.turn('Head', 0.1 * cold - 0.15 * (1 - cold));
      glow.scale.setScalar(1 + 0.06 * Math.sin(v * 6)); glow.material.opacity = 0.12 + 0.12 * (1 - cold);
      for (let i = 0; i < 16; i++) { const f = (((pre ? 0 : v) * 0.25 + i * 0.37) % 1); snow.set(i, B.minX + ((i * 0.41) % 1) * (sx + 0.4 * u - B.minX), floor + 1.4 * u - 1.4 * u * f, -0.3 * u + 0.4 * u * ((i * 0.53) % 1), 1); }
      snow.commit();
      pop(brr, cold > 0.7 && !pre ? 1 : 0, x0 + 0.1 * u, floor + 1.1 * u, 0.15 * u); pop(ah, cold < 0.3 ? 1 : 0, x0 + 0.1 * u, floor + 1.1 * u, 0.15 * u);
    },
  };
}
function spring(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), say = label(u, 'ぽかぽか', '#e07a3a', 0.13), petals = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 0.5, 0.15), 0xffa8c8]], 12, 0.8);
  const sun = solidProp([[G.sphere(0.13 * u), 0xffc030], ...Array.from({ length: 8 }, (_, i) => [G.box(0.03 * u, 0.09 * u, 0.01 * u, Math.cos(i * Math.PI / 4) * 0.21 * u, Math.sin(i * Math.PI / 4) * 0.21 * u, 0, i * Math.PI / 4 - Math.PI / 2), 0xffd860])], 1.3);
  sun.position.set(x0 + 0.55 * u, floor + 1.3 * u, -0.4 * u);
  group.add(p.group, sun, petals, say);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const k = pre ? A.setup : between(v, 0.3, 1.0) * (1 - between(v, 5.2, 5.8));
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = 0.3;
      p.turn('Head', -0.45 * k, 0.2 * k); p.turn('Torso', -0.1 * k);
      p.handTo('R', p.local(-0.4, 0.7, 0.15, W), k, { out: 0.9, down: 0.5 }); p.handTo('L', p.local(0.4, 0.7, 0.15, W), k, { out: 0.9, down: 0.5 });
      sun.rotation.z = v * 0.4; sun.scale.setScalar(1 + 0.06 * Math.sin(v * 3));
      for (let i = 0; i < 12; i++) { const f = (((pre ? 0 : v) * 0.2 + i / 12) % 1); petals.set(i, x0 + 1.0 * u - 1.8 * u * f + 0.1 * u * Math.sin(i), floor + 1.3 * u - 1.1 * u * f + 0.08 * u * Math.sin(f * 10 + i), -0.1 * u + 0.25 * u * ((i * 0.37) % 1), 1, f * 9, f * 5); }
      petals.commit();
      pop(say, k > 0.9 ? 1 : 0, x0 + 0.35 * u, floor + 1.15 * u, 0.15 * u);
    },
  };
}

// a pool / tub that hides a sitter below its water line: rim and water, origin on the floor at its middle
const pool = (u, { r = 0.4, h = 0.22, water = 0x5ab0d0, rim = 0x8a8a84, rocks = true } = {}) => solidProp([
  [G.cyl(r * u, r * u, h * u, 0, h / 2 * u, 0, 0, 0, 0, 24), water],
  ...(rocks ? Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return [G.sphere(0.09 * u, Math.cos(a) * r * u, h * u, Math.sin(a) * r * u, 1.2, 0.7, 1), rim]; }) : [[G.torus(r * u, 0.04 * u, Math.PI * 2, 0, h * u, 0).rotateX(Math.PI / 2), rim]])], 0.4);

// ---- 温 / 温い ----
function onsen(ctx, spec, stage) {
  if (spec.outcome === 'tepid') return tepid(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.65 * u;
  const p = person(spec.who, u, 0.85), spring = pool(u, { r: 0.45, h: 0.3 }), steam = many(PUFF(u, 0xf4f4f4), 8, 0.6), sigh = label(u, 'ふぅ〜', '#e07a3a', 0.14);
  const towel = solidProp([[G.box(0.14 * u, 0.03 * u, 0.1 * u, 0, 0, 0), 0xffffff], [G.box(0.03 * u, 0.025 * u, 0.1 * u, -0.06 * u, -0.01 * u, 0), 0xe06a8a]], 0.5);
  spring.position.set(x0, floor, -0.05 * u);
  group.add(spring, p.group, towel, steam, sigh);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // sitting on the pool's floor, the water up to his chest; he sinks a little lower with a sigh
      const sink = pre ? 0 : bump(v, 1.0, 3.0);
      p.pose('SitDown', 1.0, false); p.group.position.set(x0, floor + 0.3 * u - 0.5 * 0.85 * u - 0.05 * u * sink, -0.05 * u); p.group.rotation.y = -0.2;
      p.turn('Head', -0.25 * sink); p.turn('Abdomen', -0.15 * sink);
      onHead(p, towel, group, 'over', 0, -0.05, 0);
      wisps(steam, 0, 8, x0, floor + 0.3 * u, pre ? 0 : v, u, { period: 2.0, rise: 0.55, size: 1.2, on: 1 }); steam.commit();
      pop(sigh, sink > 0.4 ? 1 : 0, x0 + 0.35 * u, floor + 0.85 * u, 0.15 * u);
    },
  };
}
function tepid(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, tx = x0 + 0.5 * u;
  const p = person(spec.who, u), tub = pool(u, { r: 0.28, h: 0.28, water: 0x8ac8e0, rim: 0xd8c8a8, rocks: false }), meh = label(u, 'ぬるい…', '#6a8aa0', 0.13), ripples = many([[G.torus(0.05 * u, 0.006 * u, Math.PI * 2, 0, 0, 0), 0xe8f6ff]], 3, 0.8);
  tub.position.set(tx, floor, 0.0);
  group.add(tub, p.group, ripples, meh);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { dip: [0.4, 0.7], out: [2.0, 0.4], face: [2.3, 0.3], end: [5.2, 0.5] });
      p.pose('PickUp', 0.4 * T.dip * (1 - T.out), false); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = RIGHT - 0.4;
      const water = tub.localToWorld(new THREE.Vector3(-0.08 * u, 0.27 * u, 0.05 * u));
      p.handTo('R', water, T.dip * (1 - T.out), { out: 0.6, down: 0.6 });
      for (let i = 0; i < 3; i++) { const f = ((pre ? 0 : v) * 0.8 + i / 3) % 1; ripples.set(i, tx - 0.08 * u, floor + 0.285 * u, 0.05 * u, (v > 1.0 && v < 2.3) ? 0.5 + 1.5 * f : 0, 0, 0, Math.PI / 2); }
      ripples.commit();
      // a sour face: head tipped, a shrug
      const f = T.face * (1 - T.end);
      p.turn('Head', 0.1 * f, 0.3 * f, 0.25 * f);
      p.handTo('L', p.local(0.3, 0.55, 0.18, W), f, { out: 0.9, down: 0.9 }); p.handTo('R', p.local(-0.3, 0.55, 0.18, W), f, { out: 0.9, down: 0.9 });
      pop(meh, f, x0 - 0.05 * u, floor + 1.1 * u, 0.15 * u);
    },
  };
}

// ---- お風呂 ----
function bath(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.65 * u, s = KID + 0.1;
  const p = person(spec.who, u, s), hum = label(u, '♪', '#3a7ac0', 0.16), foam = many([[G.sphere(0.06 * u), 0xffffff]], 10, 0.9);
  const tub = solidProp([[G.box(0.8 * u, 0.32 * u, 0.4 * u, 0, 0.18 * u, 0), 0xf4f4f8], [G.box(0.72 * u, 0.02 * u, 0.32 * u, 0, 0.32 * u, 0), 0x8ad0f0], [G.cyl(0.03 * u, 0.03 * u, 0.04 * u, -0.3 * u, 0.02 * u, 0.15 * u), 0xd8c070], [G.cyl(0.03 * u, 0.03 * u, 0.04 * u, 0.3 * u, 0.02 * u, 0.15 * u), 0xd8c070]], 0.4);
  const duck = solidProp([[G.sphere(0.05 * u, 0, 0, 0, 1.2, 0.8, 1), 0xffd820], [G.sphere(0.032 * u, 0.04 * u, 0.045 * u, 0), 0xffd820], [G.cone(0.015 * u, 0.03 * u, 0.075 * u, 0.045 * u, 0, -Math.PI / 2), 0xff8a20]], 0.6);
  tub.position.set(x0, floor, -0.05 * u);
  group.add(tub, p.group, duck, foam, hum);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // she sits at the left end, arms out along the rim, swaying her head to the tune
      p.pose('SitDown', 1.0, false); p.group.position.set(x0 - 0.15 * u, floor + 0.32 * u - 0.3 * s * u, -0.05 * u); p.group.rotation.y = RIGHT - 0.6;
      p.turn('Head', -0.1, 0, 0.15 * Math.sin(v * 2.5));
      const k = pre ? A.setup : 1;
      p.handTo('R', tub.localToWorld(W.set(-0.38 * u, 0.36 * u, 0.12 * u)), k, { out: 0.9, down: 0.4 }); p.handTo('L', tub.localToWorld(W.set(0.0, 0.36 * u, -0.17 * u)), k, { out: 0.9, down: 0.4 });
      duck.position.set(x0 + 0.2 * u + 0.05 * u * Math.sin(v * 0.9), floor + 0.36 * u + 0.01 * u * Math.sin(v * 3), 0.0); duck.rotation.set(0, Math.sin(v * 0.7), 0.1 * Math.sin(v * 2.4));
      for (let i = 0; i < 10; i++) foam.set(i, x0 - 0.3 * u + 0.065 * u * i, floor + 0.34 * u + 0.015 * u * Math.sin(v * 2 + i), (i % 2 ? 0.08 : -0.08) * u, 0.7 + 0.3 * Math.sin(i * 1.7 + v));
      foam.commit();
      pop(hum, pre ? 0 : (Math.sin(v * 2) > 0 ? 1 : 0), x0, floor + 0.85 * u + 0.05 * u * Math.sin(v * 2), 0.1 * u);
    },
  };
}

// ---- 夕 ----
function dusk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.75 * u;
  const a = person(spec.who, u, KID + 0.05), b = person(spec.other, u, KID + 0.05), bye = label(u, 'バイバイ!', '#e07a3a', 0.12);
  const sun = solidProp([[G.sphere(0.2 * u), 0xff7a30]], 1.3), hills = solidProp([[G.box(3.4 * u, 0.12 * u, 0.04 * u, 0, 0.06 * u, 0), 0x3a2c38], [G.sphere(0.5 * u, -0.7 * u, 0.1 * u, 0, 1.3, 0.5, 0.05), 0x3a2c38], [G.sphere(0.45 * u, 0.5 * u, 0.1 * u, 0, 1.5, 0.45, 0.05), 0x45334a], [G.sphere(0.35 * u, 1.3 * u, 0.08 * u, 0, 1.4, 0.5, 0.05), 0x3a2c38]], 0.2);
  const crows = many([[G.box(0.12 * u, 0.012 * u, 0.03 * u, -0.05 * u, 0, 0, 0.4), 0x101014], [G.box(0.12 * u, 0.012 * u, 0.03 * u, 0.05 * u, 0, 0, -0.4), 0x101014], [G.sphere(0.025 * u), 0x101014]], 3, 0.1);
  hills.position.set(x0, floor, -2.3 * u);
  group.add(sun, hills, crows, a.group, b.group, bye);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { wave: [0.4, 0.4], unwave: [2.4, 0.3], go: [2.7, 3.0, 'linear'], back: [6.2, 0.6] });
      // the sun sinks behind the hills through the scene
      const s = pre ? 0.2 : between(v, 0, 6.0) * (1 - T.back);
      sun.position.set(x0 + 0.15 * u, floor + 0.85 * u - 0.85 * u * s, -2.5 * u);
      const walking = !pre && T.go > 0 && T.go < 1, d = 0.75 * u * T.go * (1 - T.back);
      a.pose(walking ? 'Walk' : 'Idle', walking ? v : t); b.pose(walking ? 'Walk' : 'Idle', walking ? v + 0.4 : t + 1);
      a.group.position.set(x0 - 0.18 * u - d, floor, 0.1 * u); b.group.position.set(x0 + 0.18 * u + d, floor, 0.1 * u);
      a.group.rotation.y = walking ? LEFT : RIGHT - 0.7; b.group.rotation.y = walking ? RIGHT : LEFT + 0.7;
      a.group.visible = b.group.visible = pre || T.go < 0.97 || T.back > 0.3;
      const w = T.wave * (1 - T.unwave); a.wave('R', w, v); b.wave('L', w, v + 0.4);
      pop(bye, w, x0, floor + 0.85 * u, 0.15 * u);
      for (let i = 0; i < 3; i++) { const f = (((pre ? 0 : v) * 0.15 + i * 0.12) % 1); crows.set(i, x0 + 1.2 * u - 2.4 * u * f, floor + 1.1 * u + 0.1 * u * i, -0.6 * u, 1, 0, 0, 0.3 * Math.sin(v * 10 + i)); }
      crows.commit();
    },
  };
}

export const SCENES = { 'q-stove': stove, 'q-onsen': onsen, 'q-bath': bath, 'q-dusk': dusk };
