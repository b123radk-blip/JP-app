// Model scenes, near and far, ways and crossings (Step 3a model pass).
//   q-near    近: a person walks toward you out of the distance, growing bigger, and stops right up close, leaning in
//             and waving; outcome close: a person walks up to a house; a gap marker between them shrinks to nothing
//             (近い)
//   q-far     遠: a person waves goodbye and walks away down a long road, smaller and smaller, toward far mountains;
//             outcome scope: a person looks through a telescope at a tiny ship far out on the sea (遠い)
//   q-turn    向: a person with his back to you turns round, waves and points over there; outcome across: across a
//             river a friend waves from the other bank and the person waves back (向こう)
//   q-ways    方: a person at a signpost with two arms looks one way, then the other, scratches her head, then
//             picks one and walks off that way
//   q-tunnel  通: a person walks into a tunnel through a hill and comes out of the far side
//   q-bridge  渡: a person walks up over an arched bridge across a river and down the other side; outcome zebra: a
//             child waits at a red light, it turns green and she crosses the zebra crossing, hand up (渡る)
//   q-stairs  降: a person walks down a staircase step by step and back up
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, turnTo } from './q-common.js';

const W = new THREE.Vector3();
const TAU = Math.PI * 2;
// a road (or path) from near the viewer back into the distance, tilted up so it shows; origin at its near end
const road = (u, len, w, color = 0x50545c, dashes = true) => solidProp([[G.box(w, 0.01 * u, len, 0, 0, -len / 2), color], ...(dashes ? Array.from({ length: 6 }, (_, i) => [G.box(0.03 * u, 0.012 * u, len / 14, 0, 0.001 * u, -len * (i + 0.4) / 6.5), 0xf4f0e0]) : [])], 0.35);
const mountains = (u) => solidProp([[G.cone(0.5 * u, 0.6 * u, 0, 0.3 * u, 0), 0x5a7a9a], [G.cone(0.38 * u, 0.45 * u, 0.55 * u, 0.22 * u, 0.1 * u), 0x6a8aaa], [G.cone(0.16 * u, 0.15 * u, 0, 0.53 * u, 0.02 * u), 0xf4f8ff]], 0.35);

// ---- 近 / 近い ----
function near(ctx, spec, stage) {
  if (spec.outcome === 'close') return close(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, zf = -3.2 * u, zn = 0.35 * u;
  const p = person(spec.who, u), path = road(u, 3.6 * u, 0.4 * u, 0xc8a878, false), hi = label(u, 'やあ!', '#3aa050', 0.14);
  path.position.set(x0, floor - 0.005 * u, zn + 0.2 * u);
  group.add(path, p.group, hi);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0.1, 3.0, 'linear'], lean: [3.2, 0.4], back: [5.6, 0.7] });
      const walking = !pre && T.come > 0 && T.come < 1;
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      // from far back (small) to right in front of you; at the end she fades back into the distance
      const z = pre ? zn : lerp(zf, zn, T.come) + (zf - zn) * T.back;
      p.group.position.set(x0, floor, z); p.group.rotation.y = 0;
      p.group.visible = pre || T.back < 0.98;
      const lean = T.lean * (1 - T.back); p.turn('Abdomen', 0.25 * lean); p.wave('R', lean, v);
      pop(hi, lean, x0 + 0.25 * u, floor + 1.15 * u, zn + 0.1 * u);
    },
  };
}
function close(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u, xs = hx + 1.3 * u, xe = hx + 0.35 * u;
  const p = person(spec.who, u, 0.75), say = label(u, 'ちかい!', '#3aa050', 0.13);
  const house = solidProp([[G.box(0.4 * u, 0.36 * u, 0.3 * u, 0, 0.18 * u, 0), 0xf4e4c8], [G.cone(0.32 * u, 0.24 * u, 0, 0.48 * u, 0), 0xd04030], [G.box(0.1 * u, 0.18 * u, 0.01 * u, 0.06 * u, 0.09 * u, 0.15 * u), 0x8a5a30]], 0.35);
  house.rotation.y = 0.785; house.position.set(hx, floor, -0.05 * u);
  const gap = solidProp([[G.box(1, 0.02 * u, 0.02 * u, 0.5, 0, 0), 0xffe040], [G.box(0.02 * u, 0.1 * u, 0.02 * u, 0, 0, 0), 0xffe040]], 1.0);
  const end = solidProp([[G.box(0.02 * u, 0.1 * u, 0.02 * u, 0, 0, 0), 0xffe040]], 1.0);
  group.add(house, p.group, gap, end, say);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.3, 2.4, 'linear'], back: [5.0, 0.9, 'linear'] }), f = pre ? 1 : T.walk * (1 - T.back);
      const walking = !pre && ((T.walk > 0 && T.walk < 1) || (T.back > 0 && T.back < 1));
      const x = lerp(xs, xe, f);
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t); p.group.position.set(x, floor, 0.15 * u); p.group.rotation.y = T.back > 0 ? RIGHT : LEFT + 0.2;
      // the yellow gap marker from the house to her shrinks as she comes
      const x1 = hx + 0.25 * u, x2 = x - 0.1 * u, y = floor + 0.08 * u;
      gap.position.set(x1, y, 0.15 * u); gap.scale.x = Math.max(0.001, x2 - x1); end.position.set(x2, y, 0.15 * u); gap.visible = end.visible = x2 - x1 > 0.04 * u;
      pop(say, !pre && f > 0.98 && v < 5.0 ? 1 : 0, xe, floor + 0.95 * u, 0.15 * u);
    },
  };
}

// ---- 遠 / 遠い ----
function far(ctx, spec, stage) {
  if (spec.outcome === 'scope') return scope(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, zn = 0.25 * u, zf = -4.5 * u;
  const p = person(spec.who, u), path = road(u, 5.2 * u, 0.4 * u), hills = mountains(u), bye = label(u, 'バイバイ!', '#3a7ac0', 0.13);
  path.position.set(x0, floor - 0.005 * u, zn + 0.2 * u); hills.position.set(x0, floor, -5.2 * u); hills.scale.setScalar(2.2);
  group.add(path, hills, p.group, bye);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { wave: [0.2, 0.3], unwave: [1.4, 0.3], turn: [1.6, 0.4], go: [1.9, 4.3, 'linear'] });
      const walking = !pre && T.go > 0 && T.go < 1;
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(x0, floor, pre ? zn : lerp(zn, zf, T.go)); p.group.rotation.y = Math.PI * T.turn;
      p.group.visible = pre || T.go < 0.99;
      p.wave('R', T.wave * (1 - T.unwave), v);
      pop(bye, T.wave * (1 - T.unwave), x0 + 0.3 * u, floor + 1.15 * u, zn);
    },
  };
}
function scope(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u;
  const p = person(spec.who, u), tube = solidProp([[G.cyl(0.04 * u, 0.06 * u, 0.32 * u, 0, 0, 0.16 * u, Math.PI / 2), 0xc8a050], [G.cyl(0.062 * u, 0.062 * u, 0.02 * u, 0, 0, 0.32 * u, Math.PI / 2), 0x8a6a30]], 0.6);
  const sea = solidProp([[G.box(2.6 * u, 0.32 * u, 0.04 * u, 0, 0.16 * u, 0), 0x2a6ac0], [G.box(2.6 * u, 0.04 * u, 1.1 * u, 0, -0.01 * u, 0.55 * u), 0xe8d8a8]], 0.4), ship = solidProp([[G.box(0.4 * u, 0.12 * u, 0.12 * u, 0, 0.06 * u, 0), 0xe04848], [G.box(0.2 * u, 0.12 * u, 0.1 * u, 0.02 * u, 0.18 * u, 0), 0xf4f4f4], [G.cyl(0.03 * u, 0.03 * u, 0.12 * u, 0.06 * u, 0.3 * u, 0), 0x30343c]], 0.5);
  sea.position.set(x0 + 0.6 * u, floor - 0.01 * u, -1.1 * u); ship.position.set(x0 + 1.2 * u, floor + 0.31 * u, -1.15 * u); ship.scale.setScalar(0.45);
  const ah = label(u, 'あ!', '#e0a020', 0.14);
  group.add(sea, ship, p.group, tube, ah);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.15 * u);
      const yaw = Math.atan2(ship.position.x - x0, ship.position.z - 0.15 * u) + 0.15 * Math.sin(pre ? 0 : v * 0.8) * (1 - between(v, 2.6, 3.0));
      p.group.rotation.y = yaw;
      // the telescope at his eye, both hands on it; he sweeps, finds the ship (!) and stays on it
      const k = pre ? A.setup : between(v, 0.2, 0.6) * (1 - between(v, 5.6, 6.0));
      p.at('eyes', W, 0, 0, 0.04); tube.position.copy(group.worldToLocal(W)); tube.rotation.set(0, yaw, 0); tube.visible = k > 0.1;
      p.handTo('R', tube.localToWorld(W.set(0, -0.02 * u, 0.08 * u)), k, { out: 0.6, down: 0.8 }); p.handTo('L', tube.localToWorld(W.set(0, -0.02 * u, 0.24 * u)), k, { out: 0.6, down: 0.8 });
      ship.position.x = x0 + 1.2 * u + 0.15 * u * Math.sin(v * 0.3); ship.rotation.z = 0.05 * Math.sin(v * 2);
      pop(ah, pre ? 0 : bump(v, 2.8, 1.6) * 1.2, x0 - 0.1 * u, floor + 1.12 * u, 0.15 * u);
    },
  };
}

// ---- 向 / 向こう ----
function turn(ctx, spec, stage) {
  if (spec.outcome === 'across') return across(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), there = solidProp([[G.cone(0.07 * u, 0.16 * u, 0, 0, 0, -Math.PI / 2), 0xffe040], [G.box(0.18 * u, 0.05 * u, 0.02 * u, -0.17 * u, 0, 0), 0xffe040]], 1.0);
  group.add(p.group, there);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { turn: [0.5, 0.6], wave: [1.2, 0.3], point: [2.6, 0.3], away: [4.6, 0.4], back: [5.4, 0.6] });
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u);
      // his back to you; he turns to face you, waves, then turns half away and points far off to the right
      const yaw = turnTo(Math.PI, 0, T.turn) + 0.9 * T.point * (1 - T.away);
      p.group.rotation.y = T.back > 0 ? turnTo(yaw, Math.PI, T.back) : yaw;
      p.wave('R', T.wave * (1 - T.point), v);
      p.point('L', p.local(2, 0.9, 1.5, W), T.point * (1 - T.away));
      const k = T.point * (1 - T.away); there.visible = k > 0.05; there.scale.setScalar(grow(k)); there.position.set(x0 + 0.8 * u + 0.05 * u * Math.sin(v * 6), floor + 0.95 * u, 0.0);
    },
  };
}
function across(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u;
  const p = person(spec.who, u), q = person(spec.other, u, 0.7), river = solidProp([[G.box(2.4 * u, 0.02 * u, 0.6 * u, 0, 0, 0), 0x2a7ad0], [G.box(2.4 * u, 0.03 * u, 0.5 * u, 0, -0.005 * u, -0.55 * u), 0x58a848]], 0.4);
  const hi = label(u, 'おーい!', '#3a7ac0', 0.13);
  river.position.set(x0 + 0.6 * u, floor - 0.01 * u, -0.45 * u); river.rotation.x = 0.2;
  group.add(river, p.group, q.group, hi);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.15 * u); p.group.rotation.y = Math.PI - 0.5;
      q.pose('Idle', t + 1); q.group.position.set(x0 + 0.9 * u, floor + 0.02 * u, -1.0 * u); q.group.rotation.y = -0.4;
      q.wave('R', pre ? 0 : bump(v, 0.4, 2.2), v); p.wave('R', pre ? 0 : bump(v, 2.2, 2.8), v + 1);
      pop(hi, pre ? 0 : bump(v, 0.4, 2.2) > 0.3 ? 1 : 0, x0 + 0.9 * u, floor + 0.85 * u, -1.0 * u);
    },
  };
}

// ---- 方 ----
function ways(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u;
  const p = person(spec.who, u), q = label(u, '?', '#6a6a7a', 0.2);
  const arrow = (dir, y, c) => { const s = new THREE.Shape(); [[0, -0.6], [3.2, -0.6], [4, 0], [3.2, 0.6], [0, 0.6]].forEach(([x, yy], i) => (i ? s.lineTo(x * dir, yy) : s.moveTo(x * dir, yy))); return [G.extrude(s, 0.3).scale(0.12 * u, 0.12 * u, 0.09 * u).translate(0, y, 0), c]; };
  const post = solidProp([[G.cyl(0.025 * u, 0.03 * u, 0.85 * u, 0, 0.425 * u, 0), 0x7a5a3a], arrow(1, 0.78 * u, 0xf0d080), arrow(-1, 0.62 * u, 0x9ad0f0)], 0.4);
  post.position.set(sx, floor, -0.15 * u);
  group.add(post, p.group, q);
  const loop = 7.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { left: [0.3, 0.5], right: [1.4, 0.6], scratch: [2.5, 0.3], go: [3.8, 2.4, 'linear'], back: [6.4, 0.6] });
      const walking = !pre && T.go > 0 && T.go < 1;
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      const x = sx + 0.4 * u + 0.9 * u * T.go * (1 - T.back);
      p.group.position.set(x, floor, 0.12 * u);
      p.group.rotation.y = walking ? RIGHT : turnTo(turnTo(0, -0.9, T.left), 0.9, T.right) * (1 - T.scratch);
      p.group.visible = pre || T.go < 0.97 || T.back > 0.5;
      const sc = T.scratch * (1 - between(v, 3.5, 3.8));
      p.handTo('R', p.at('over', W, -0.06, -0.03 + 0.03 * Math.sin(v * 16), 0), sc, { out: 0.8, down: 0.3 });
      pop(q, sc, x, floor + 1.15 * u, 0.12 * u);
    },
  };
}

// ---- 通 ----
function tunnel(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.95 * u;
  const p = person(spec.who, u, 0.7), tun = new THREE.Group();
  const hill = solidProp([[G.sphere(0.62 * u, 0, 0, 0, 1, 0.8, 0.75), 0x5aa048], [G.sphere(0.12 * u, -0.15 * u, 0.48 * u, 0.1 * u), 0x3a8a30], [G.sphere(0.1 * u, 0.2 * u, 0.44 * u, 0.15 * u), 0x3a8a30]], 0.35);
  const mouth = () => solidProp([[G.cyl(0.22 * u, 0.22 * u, 0.08 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0x9a9aa0], [G.cyl(0.17 * u, 0.17 * u, 0.09 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0x08080c]], 0.3);
  const m1 = mouth(), m2 = mouth(), path = solidProp([[G.box(2.2 * u, 0.01 * u, 0.3 * u, 0, 0, 0), 0xc8a878]], 0.35);
  m1.position.set(-0.6 * u, 0.04 * u, 0); m2.position.set(0.6 * u, 0.04 * u, 0); path.position.set(0, -0.003 * u, 0);
  // the tunnel runs from front left to back right, so its way in faces you
  tun.add(path, hill, m1, m2, p.group); tun.position.set(hx, floor, -0.1 * u); tun.rotation.y = 0.6;
  group.add(tun);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const f = pre ? 0 : between(v, 0.2, 5.6), x = lerp(-1.05 * u, 1.05 * u, f);
      p.pose(pre || f >= 1 ? 'Idle' : 'Walk', pre ? t : v); p.group.position.set(x, 0, 0); p.group.rotation.y = RIGHT;
      // inside the hill he is hidden; he comes out of the far end
      p.group.visible = Math.abs(x) > 0.58 * u;
    },
  };
}

// ---- 渡 / 渡る ----
function bridge(ctx, spec, stage) {
  if (spec.outcome === 'zebra') return zebra(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.85 * u, L = 1.1 * u, H = 0.3 * u;
  const p = person(spec.who, u, 0.7), arch = (f) => H * Math.sin(Math.PI * f);
  const pts = Array.from({ length: 13 }, (_, i) => [(-0.5 + i / 12) * L, arch(i / 12)]);
  const deck = solidProp([[G.tube(pts.map(([x, y]) => [x, y]), 0.03 * u), 0xd04030], [G.tube(pts.map(([x, y]) => [x, y + 0.12 * u]), 0.012 * u), 0xd04030],
    ...pts.filter((_, i) => i % 2 === 0).map(([x, y]) => [G.cyl(0.01 * u, 0.01 * u, 0.12 * u, x, y + 0.06 * u, 0), 0xd04030])], 0.45);
  const rail2 = deck.clone(); deck.position.set(bx, floor, 0.12 * u); rail2.position.set(bx, floor, -0.12 * u);
  const river = solidProp([[G.box(0.7 * u, 0.02 * u, 1.4 * u, 0, 0, 0), 0x2a7ad0]], 0.4), ripples = many([[G.torus(0.05 * u, 0.006 * u, Math.PI * 2, 0, 0, 0), 0xc8e8ff]], 4, 0.8);
  river.position.set(bx, floor - 0.02 * u, -0.2 * u);
  group.add(river, ripples, deck, rail2, p.group);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const f = pre ? 0 : between(v, 0.3, 5.0), xs = bx - 0.85 * u, xe = bx + 0.85 * u, x = lerp(xs, xe, f);
      const on = (x - bx) / L + 0.5, y = on > 0 && on < 1 ? arch(on) : 0;
      p.pose(pre || f >= 1 ? 'Idle' : 'Walk', pre ? t : v); p.group.position.set(x, floor + y, 0); p.group.rotation.y = f >= 1 ? 0.3 : RIGHT;
      for (let i = 0; i < 4; i++) { const g = (((pre ? 0 : v) * 0.4 + i / 4) % 1); ripples.set(i, bx + 0.15 * u * Math.sin(i * 2.3), floor - 0.005 * u, -0.6 * u + 0.25 * u * i, 0.6 + 1.2 * g, 0, 0, Math.PI / 2); }
      ripples.commit();
    },
  };
}
function zebra(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.2 * u, xe = xs + 1.15 * u, rx = (xs + xe) / 2;
  const kid = person(spec.who, u, KID + 0.1);
  // the road runs away from you; the crossing goes left to right over it
  const road1 = solidProp([[G.box(0.8 * u, 0.01 * u, 1.8 * u, 0, 0, 0), 0x45484f], ...Array.from({ length: 5 }, (_, i) => [G.box(0.11 * u, 0.012 * u, 0.6 * u, (-0.32 + i * 0.16) * u, 0.001 * u, 0.15 * u), 0xf4f4f4])], 0.35);
  const pole = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.75 * u, 0, 0.375 * u, 0), 0x50545c], [G.box(0.12 * u, 0.26 * u, 0.08 * u, 0, 0.82 * u, 0), 0x20242c]], 0.4);
  const red = solidProp([[G.sphere(0.045 * u), 0xff3030]], 1.6), green = solidProp([[G.sphere(0.045 * u), 0x30ff60]], 1.6);
  road1.position.set(rx, floor - 0.005 * u, -0.2 * u); road1.rotation.x = 0.3; pole.position.set(xe + 0.15 * u, floor, -0.25 * u);
  red.position.set(xe + 0.15 * u, floor + 0.88 * u, -0.2 * u); green.position.set(xe + 0.15 * u, floor + 0.76 * u, -0.2 * u);
  group.add(road1, pole, red, green, kid.group);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const go = !pre && v > 1.6 && v < 5.6;
      red.visible = !go; green.visible = go;
      // she waits at the kerb, the light turns green, she raises her hand and walks across, then back
      const f = pre ? 0 : between(v, 2.0, 4.4) * (1 - between(v, 5.8, 6.9));
      const walking = !pre && ((v > 2.0 && v < 4.4) || (v > 5.8 && v < 6.9));
      kid.pose(walking ? 'Walk' : 'Idle', walking ? v : t); kid.group.position.set(lerp(xs, xe, f), floor, -0.1 * u); kid.group.rotation.y = v > 5.6 ? LEFT : RIGHT - (walking ? 0 : 0.4);
      kid.handTo('R', kid.local(-0.24, 1.05, 0.06, W), !pre && v > 1.8 && v < 4.6 ? 1 : 0, { out: 0.4, down: 0.2 });
    },
  };
}

// ---- 降 ----
function stairs(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.25 * u, n = 5, sw = 0.2 * u, sh = 0.12 * u;
  const steps = solidProp(Array.from({ length: n }, (_, i) => [G.box(sw, sh * (n - i), 0.4 * u, i * sw + sw / 2, sh * (n - i) / 2, 0), i % 2 ? 0xd8c8a8 : 0xc8b898]), 0.35);
  steps.position.set(x0, floor, -0.05 * u);
  const p = person(spec.who, u, 0.75);
  group.add(steps, p.group);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // down, one step at a time (a small drop at each edge), then back up again
      const down = pre ? 0 : between(v, 0.3, 3.3), up = pre ? 0 : between(v, 4.0, 6.8), f = down * (1 - up);
      const walking = !pre && ((v > 0.3 && v < 3.3) || (v > 4.0 && v < 6.8));
      const sx = f * (n + 0.6), i = Math.min(n, Math.floor(sx)), frac = sx - Math.floor(sx);
      const y = i >= n ? 0 : sh * (n - i) - sh * Math.max(0, (frac - 0.7) / 0.3);
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t); p.group.position.set(x0 + sx * sw, floor + Math.max(0, y), -0.05 * u);
      p.group.rotation.y = up > 0 && up < 1 ? LEFT : v > 3.3 && v < 4.0 ? 0.3 : RIGHT;
    },
  };
}

export const SCENES = { 'q-near': near, 'q-far': far, 'q-turn': turn, 'q-ways': ways, 'q-tunnel': tunnel, 'q-bridge': bridge, 'q-stairs': stairs };
