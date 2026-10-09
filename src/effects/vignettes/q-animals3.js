// Model scenes, animals part 2 (Step 3a model pass).
//   q-cow variants (models-b.js q-cow dispatches here): milk: a cow grazes behind a person who drinks a glass of milk,
//              ごくごく, ぷはー (牛乳); steak: a cow stands beside a table where a steak sizzles on a plate, ジュー (牛肉)
//   q-hug      好: a child kneels and hugs a puppy, which hops and wags; hearts; outcome love: the hug, and a big heart
//              swells over them and bursts into little ones (大好き); icecream: a child licks an ice cream, eyes shut,
//              hearts (好き)
//   q-swim     泳: a swimmer does the front crawl across a pool, arms turning over, splashes; turns and swims back;
//              outcome fish: a fish swims along under the water, bubbles rising (泳ぐ)
//   q-peek     後: a child hides behind the kanji, peeks out round its side, ducks back, then pops up over its top,
//              くすくす; outcome sneak: a fox creeps up behind a person; she turns round (!) and it runs off (後ろ)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many, HEART, DROP, heart } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { drink } from './q-gestures.js';
import { RIGHT, LEFT, UP, lerp, label, pop, hearts, person, KID, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();

// ---- 牛乳 / 牛肉 (variants of q-cow) ----
function milk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, sub = drink(ctx, { ...spec, who: spec.who ?? 'gal2' }, stage), c = createModel('cow', { height: 0.8 * u });
  sub.group.add(c.group);
  return {
    group: sub.group,
    step(t) {
      sub.step(t); c.pose('Eating', t);
      c.group.position.set(B.maxX + 1.3 * u, B.minY, -0.45 * u); c.group.rotation.y = LEFT + 0.7;
    },
  };
}
function steak(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const c = createModel('cow', { height: 0.8 * u }), sizzle = label(u, 'ジュー', '#c0503a', 0.13), steam = many([[G.sphere(0.04 * u), 0xffffff]], 6, 0.5);
  const table = solidProp([[G.box(0.5 * u, 0.025 * u, 0.32 * u, 0, 0.3 * u, 0), 0xc89060], [G.box(0.04 * u, 0.3 * u, 0.04 * u, 0, 0.15 * u, 0), 0x8a5a30], [G.cyl(0.15 * u, 0.15 * u, 0.01 * u, 0, 0.32 * u, 0, 0, 0, 0, 24), 0xf4f4f8],
    [G.sphere(0.1 * u, 0, 0.335 * u, 0, 1.2, 0.22, 0.85), 0x8a3a20], [G.sphere(0.04 * u, -0.06 * u, 0.345 * u, 0.02 * u, 1, 0.3, 1), 0xe8d0b0], [G.box(0.012 * u, 0.006 * u, 0.2 * u, 0.2 * u, 0.32 * u, 0), 0xb8c0cc], [G.box(0.012 * u, 0.006 * u, 0.2 * u, -0.2 * u, 0.32 * u, 0), 0xb8c0cc]], 0.45);
  table.position.set(tx, floor, 0.15 * u); table.rotation.x = 0.25;
  group.add(c.group, table, sizzle, steam);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      c.pose(v > 2.5 && v < 4.5 ? 'Idle_Headlow' : 'Idle', t);
      c.group.position.set(tx + 0.75 * u, floor, -0.3 * u); c.group.rotation.y = LEFT + 0.6;
      wisps(steam, 0, 6, tx, floor + 0.4 * u, pre ? 0 : v, u, { period: 1.6, rise: 0.4, size: 0.8, on: pre ? A.setup : 1 }); steam.commit();
      pop(sizzle, pre ? 0 : 0.85 + 0.15 * Math.abs(Math.sin(v * 9)), tx, floor + 0.72 * u, 0.25 * u);
    },
  };
}
export const COW = { milk, steak };

// ---- 好 / 大好き / 好き ----
function hug(ctx, spec, stage) {
  if (spec.outcome === 'icecream') return icecream(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, love = spec.outcome === 'love';
  const kid = person(spec.who, u, 0.75), pup = createModel('pug', { height: 0.36 * u }), hs = many(HEART(u, 0.1), 3, 1), big = love ? heart(u, { s: 0.3 }) : null, burst = love ? many(HEART(u, 0.07), 8, 1) : null;
  group.add(kid.group, pup.group, hs, ...(love ? [big, burst] : []));
  const loop = 6.4, P = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { kneel: [0.2, 0.5], hug: [0.8, 0.6], up: [5.4, 0.6] }), k = T.kneel * (1 - T.up), h = T.hug * (1 - between(v, 5.0, 5.4));
      kid.pose(k > 0.02 ? 'PickUp' : 'Idle', k > 0.02 ? 0.55 * k : t, !(k > 0.02));
      kid.group.position.set(x0 + 0.3 * u, floor, 0.05 * u); kid.group.rotation.y = LEFT + 0.7;
      const hop = !pre && v > 1.4 && v < 4.8;
      pup.pose(hop ? 'Jump' : 'Idle', hop ? (v - 1.4) % 1.5 : t);
      pup.group.position.set(x0, floor, 0.2 * u); pup.group.rotation.y = RIGHT - 0.6;
      // her arms round the puppy's neck, palms on its sides, the head leaning in; a little rock side to side
      pup.group.getWorldPosition(P).add(W.set(0, 0.2 * u * group.getWorldScale(W2).y, 0));
      kid.grip('R', P, axisOf(kid, 1, 0, 0.3, W).normalize(), 0.09 * u * group.getWorldScale(W2).y, h, { out: 0.8, down: 0.5 });
      kid.grip('L', P, axisOf(kid, -1, 0, 0.3, W).normalize(), 0.09 * u * group.getWorldScale(W2).y, h, { out: 0.8, down: 0.5 });
      kid.turn('Head', 0.2 * h, 0, 0.15 * h * Math.sin(v * 2.5));
      hearts(hs, 3, x0 + 0.15 * u, floor + 0.65 * u, 0.25 * u, pre ? -1 : v, 1.6, u);
      if (love) {
        const s = pre ? 0 : between(v, 2.0, 3.8), pop2 = between(v, 3.8, 4.8);
        big.visible = s > 0 && pop2 < 0.05; big.scale.setScalar(grow(s) * (1 + 0.1 * Math.sin(v * 10))); big.position.set(x0 + 0.15 * u, floor + 1.0 * u, 0.2 * u);
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; burst.set(i, x0 + 0.15 * u + Math.cos(a) * 0.45 * u * pop2, floor + 1.0 * u + Math.sin(a) * 0.45 * u * pop2, 0.2 * u, pop2 > 0 && pop2 < 1 ? 1.2 * (1 - pop2) : 0); }
        burst.commit();
      }
    },
  };
}
function icecream(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const kid = person(spec.who, u, 0.66), hs = many(HEART(u, 0.1), 3, 1);
  const cone = solidProp([[G.cone(0.05 * u, 0.16 * u, 0, -0.08 * u, 0, Math.PI), 0xd8a050], [G.sphere(0.06 * u, 0, 0.02 * u, 0), 0xffc0d8], [G.sphere(0.05 * u, 0, 0.09 * u, 0), 0xfff4e0], [G.sphere(0.015 * u, 0, 0.145 * u, 0), 0xe03040]], 0.6);
  group.add(kid.group, cone, hs);
  const loop = 5.6, P = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ws = group.getWorldScale(W2).y;
      kid.pose('Idle', t);
      kid.group.position.set(x0, floor, 0.1 * u); kid.group.rotation.y = -0.3;
      // each lick: the cone comes up to the mouth and the head dips to it; a happy sway between licks
      const lick = pre ? 0 : Math.max(bump(v, 0.6, 1.0), bump(v, 2.0, 1.0), bump(v, 3.4, 1.0));
      kid.local(-0.05, 0.42, 0.3, P).lerp(kid.at('mouth', W, 0, -0.04, 0.12), lick);
      kid.grip('R', P.addScaledVector(UP, -0.06 * u * ws), axisOf(kid, 1, 0, 0, W), 0.05 * u * ws, pre ? A.setup : 1, { out: 0.6, down: 0.7 });
      kid.hold(cone, 'R', group, 0.05 * u * ws); cone.position.y += 0.06 * u; cone.rotation.set(-0.2 * lick, kid.group.rotation.y, 0);
      kid.turn('Head', 0.15 * lick, 0, 0.12 * Math.sin(v * 2) * (1 - lick));
      hearts(hs, 3, x0, floor + 0.85 * u, 0.25 * u, pre ? -1 : (v % 2.8), 0.9, u);
    },
  };
}

// ---- 泳 / 泳ぐ ----
function swim(ctx, spec, stage) {
  if (spec.outcome === 'fish') return fishSwim(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u, wy = floor + 0.12 * u;
  const pool = solidProp([[G.box(1.6 * u, 0.24 * u, 0.6 * u, 0, 0.0, 0), 0x2a7ad0], [G.box(1.7 * u, 0.06 * u, 0.04 * u, 0, 0.1 * u, 0.32 * u), 0xf0f0f0], [G.box(1.7 * u, 0.06 * u, 0.04 * u, 0, 0.1 * u, -0.32 * u), 0xf0f0f0], [G.box(1.5 * u, 0.01 * u, 0.02 * u, 0, 0.125 * u, 0.0), 0xff5050]], 0.4);
  pool.position.set(cx, floor, -0.1 * u);
  const pivot = new THREE.Group(), p = person(spec.who, u, 0.75), cap = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 0.8, 1), 0xff4a6a]], 0.5), splash = many(DROP(u, 0xbfe8ff), 10, 0.8);
  pivot.add(p.group); p.group.rotation.x = Math.PI / 2 - 0.15;
  group.add(pool, pivot, cap, splash);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, back = !pre && v > 4.0;
      const f = pre ? 0 : back ? 1 - between(v, 4.4, 7.6) : between(v, 0.4, 3.6);
      p.pose('Idle', 0);
      pivot.position.set(cx + lerp(0.6, -0.6, f) * u, wy + 0.01 * u * Math.sin(v * 6), -0.1 * u); pivot.rotation.y = back ? RIGHT : LEFT;
      pivot.updateWorldMatrix(true, true);
      // the crawl: each hand reaches past the head, pulls down through the water to the hip, recovers over the back
      for (const [s, ph] of [['R', 0], ['L', Math.PI]]) {
        const a = (pre ? 0 : v * 3.4) + ph;
        p.handTo(s, p.local(s === 'R' ? -0.17 : 0.17, 0.66 + 0.4 * Math.cos(a), 0.3 * Math.sin(a), W), 1, { out: 0.9, down: 0.1 });
      }
      p.turn('Head', 0, 0.35 * Math.sin(v * 3.4));
      for (const s of ['R', 'L']) { const b = p.node(`UpperLeg${s}`); if (b) b.rotation.x += 0.3 * Math.sin(v * 12 + (s === 'R' ? 0 : Math.PI)); }
      p.group.updateWorldMatrix(true, true);
      cap.position.copy(group.worldToLocal(p.at('over', W, 0, -0.18, -0.04))); cap.rotation.copy(pivot.rotation);
      for (let i = 0; i < 10; i++) { const k = ((v * 1.8 + i / 10) % 1), side = i % 2 ? 1 : -1; splash.set(i, pivot.position.x + (back ? -1 : 1) * (0.25 + 0.4 * k) * u, wy + 0.04 * u + 0.2 * u * Math.sin(Math.PI * k), -0.1 * u + side * 0.08 * u, pre ? 0 : 1.2 * (1 - k)); }
      splash.commit();
    },
  };
}
function fishSwim(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u;
  const water = solidProp([[G.box(1.6 * u, 0.8 * u, 0.5 * u, 0, 0.4 * u, 0), 0x2a7ad0]], 0.4), weed = solidProp([-0.6, -0.45, 0.5].map((x) => [G.cone(0.04 * u, 0.3 * u, x * u, 0.15 * u, 0.1 * u), 0x3aa04a]), 0.4);
  water.material.transparent = true; water.material.opacity = 0.35; water.material.depthWrite = false;
  const fish = createModel('fishOrange', { height: 0.22 * u }), bubbles = many([[G.sphere(0.022 * u), 0xdff4ff]], 8, 0.8);
  water.position.set(cx, floor, -0.25 * u); weed.position.set(cx, floor, -0.25 * u);
  group.add(water, weed, fish.group, bubbles);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, a = pre ? 0 : (v / loop) * Math.PI * 2;
      fish.pose('Swim', t);
      const x = cx + 0.6 * u * Math.sin(a), y = floor + 0.4 * u + 0.1 * u * Math.sin(2 * a), z = -0.25 * u + 0.12 * u * Math.cos(a);
      fish.group.position.set(x, y, z); fish.group.rotation.set(0, Math.atan2(0.6 * Math.cos(a), -0.12 * Math.sin(a)), 0);
      for (let i = 0; i < 8; i++) { const k = ((v * 0.5 + i / 8) % 1); bubbles.set(i, x + 0.05 * u * Math.sin(i * 2 + v * 3) - 0.1 * u * Math.cos(a), y + 0.4 * u * k, z, pre ? 0 : 1 - k * 0.3); }
      bubbles.commit();
    },
  };
}

// ---- 後 / 後ろ ----
function peek(ctx, spec, stage) {
  if (spec.outcome === 'sneak') return sneak(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hide = B.maxX - 0.25 * u;
  const kid = person(spec.who, u, KID), giggle = label(u, 'くすくす', '#c06a9a', 0.11);
  group.add(kid.group, giggle);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { peek: [0.4, 0.5, 'out'], duck: [1.8, 0.4], pop: [2.8, 0.5, 'out'], down: [4.6, 0.5, 'in'] });
      const out = T.peek * (1 - T.duck), up = T.pop * (1 - T.down);
      kid.pose(up > 0.05 && up < 0.95 ? 'Jump' : 'Idle', up > 0.05 && up < 0.95 ? 0.4 : t);
      // behind the kanji: leans out past its right edge, then pops up over its top
      kid.group.position.set(hide + 0.22 * u * out - 0.2 * u * up, floor + (B.maxY - floor - 0.42 * u) * up, -0.25 * u); kid.group.rotation.y = 0.3 * out;
      kid.turn('Abdomen', 0, 0, -0.35 * out); kid.turn('Head', 0, 0, -0.25 * out);
      kid.wave('R', up > 0.9 ? 1 : 0, v);
      pop(giggle, (out > 0.9 || up > 0.9) ? 1 : 0, kid.group.position.x + 0.25 * u, kid.group.position.y + 0.65 * u, 0);
    },
  };
}
function sneak(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 1.0 * u;
  const p = person(spec.who, u, 0.85), fox = createModel('fox', { height: 0.4 * u }), bang = label(u, '!', '#e0a020', 0.22);
  group.add(p.group, fox.group, bang);
  const loop = 7.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { creep: [0.2, 3.0, 'linear'], turn: [3.6, 0.35], flee: [4.3, 1.4, 'in'], back: [6.6, 0.6] });
      p.pose('Idle', t);
      p.group.position.set(px, floor, 0.05 * u); p.group.rotation.y = turnTo(RIGHT + 0.25, LEFT + 0.4, T.turn * (1 - T.back));
      p.turn('Torso', -0.15 * T.turn * (1 - T.back));
      // the fox creeps low toward her back, stops, and bolts when she turns
      const fleeing = !pre && T.flee > 0 && T.flee < 1, creeping = !pre && T.creep > 0 && T.creep < 1;
      fox.pose(fleeing ? 'Gallop' : creeping ? 'Walk' : 'Idle', fleeing ? v : creeping ? v * 0.6 : t);
      const fx = lerp(B.maxX + 0.2 * u, px - 0.42 * u, pre ? 0 : T.creep) - (pre ? 0 : T.flee) * 1.0 * u;
      fox.group.position.set(fx, floor, -0.05 * u - 0.35 * u * T.flee); fox.group.rotation.y = fleeing || T.flee >= 1 ? LEFT - 0.3 : RIGHT - 0.2;
      fox.group.visible = T.flee < 0.98;
      if (creeping) fox.group.scale.y = fox.group.scale.x * 0.85; else fox.group.scale.y = fox.group.scale.x;
      pop(bang, pre ? 0 : bump(v, 3.6, 0.9) * 1.2, px, floor + 1.0 * u, 0.1 * u);
    },
  };
}

export const SCENES = { 'q-hug': hug, 'q-swim': swim, 'q-peek': peek };
