// Model scenes, errands and finding out (Step 3a model pass, batch 4).
//   q-map-read      地図: a man holds a map up with both hands, turns it upside down (?), turns it back, points the way
//                   (こっち!) and walks off with it
//   q-lost-key      無くす: a woman walks along; a gold key drops out of her pocket; she stops, pats her pockets (?) and
//                   looks back at it lying on the ground, glinting
//   q-empty-box     無: a child lifts a box off a stool, tips it to show us the inside, turns it upside down and shakes:
//                   nothing falls out but a puff of dust; he puts it back and shrugs, palms up: からっぽ
//   q-errand-run    用: a mum hands her child a note (おねがい!); he runs off, comes back with a carton of milk (ただいま!)
//                   and hands it to her: hearts
//   q-apple-sell    売: a stallholder behind a crate of apples (¥100) holds one up; a shopper walks up and pays a coin, he
//                   hands her the apple and she walks off with it; outcome sold: he shows off a TV for sale; a red SOLD
//                   stamp slams onto it and he cheers (売る)
//   (覚える, q-memory-bubble:cards) a man holds up flashcards one by one; each flies into his head; a bulb: おぼえた!
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, HEART, burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G, heartShape } from '../pieces/shape-kit.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, hearts, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
export const wscale = (g) => g.getWorldScale(W3).y;
const shrug = (p, k) => {
  p.handTo('R', p.local(-0.32, 0.55, 0.18, W), k, { out: 0.9, down: 0.9 }); p.handTo('L', p.local(0.32, 0.55, 0.18, W), k, { out: 0.9, down: 0.9 });
  p.twist('R', W2.set(0, 1, 0), k); p.twist('L', W2.set(0, 1, 0), k); p.turn('Head', 0, 0, 0.2 * k);
};
// a thing passed from hand to hand: f 0..1 (holder a until 0.5, then b); mid: where the hands meet (world)
export function pass(a, sa, b, sb, prop, group, f, restA, restB, mid, r) {
  const k = 1 - Math.abs(2 * f - 1), e = k * k * (3 - 2 * k);
  a.handTo(sa, restA.clone().lerp(mid, e), 1, { out: 0.6, down: 0.8 });
  b.handTo(sb, restB.clone().lerp(mid, e), 1, { out: 0.6, down: 0.8 });
  (f < 0.5 ? a : b).hold(prop, f < 0.5 ? sa : sb, group, r);
}

// ---- 地図 ----
function mapSheet(u) {
  const k = (x) => x * u, face = (s) => [
    [G.sphere(k(0.08), k(-0.1), k(0.05), s * k(0.004), 1.4, 1, 0.08), 0x6ac050], [G.sphere(k(0.07), k(0.11), k(-0.06), s * k(0.004), 1.3, 1, 0.08), 0x6ac050],
    [G.box(k(0.03), k(0.32), k(0.002), k(0.02), 0, s * k(0.0055), 0.45), 0x3a8ae0],
    ...[0, 1, 2, 3].map((i) => [G.box(k(0.035), k(0.012), k(0.002), k(-0.15 + 0.055 * i), k(-0.1 + 0.035 * i), s * k(0.006), 0.5), 0xd03030]),
    [G.box(k(0.06), k(0.016), k(0.002), k(0.1), k(0.05), s * k(0.006), 0.8), 0xd03030], [G.box(k(0.06), k(0.016), k(0.002), k(0.1), k(0.05), s * k(0.006), -0.8), 0xd03030],
    // a tree and a house standing upright, so the map is plainly upside down when it turns
    [G.box(k(0.014), k(0.04), k(0.004), k(-0.17), k(0.06), s * k(0.006)), 0x7a4a24], [G.cone(k(0.035), k(0.07), k(-0.17), k(0.11), s * k(0.006)), 0x2a8a3a],
    [G.box(k(0.06), k(0.045), k(0.004), k(0.14), k(-0.12), s * k(0.006)), 0xe0e0e8], [G.cone(k(0.05), k(0.035), k(0.14), k(-0.08), s * k(0.006)), 0xc03a2a],
  ];
  return solidProp([[G.box(k(0.46), k(0.34), k(0.006), 0, 0, 0), 0xf4e2b0], [G.box(k(0.47), k(0.35), k(0.004), 0, 0, 0), 0xb08a50], ...face(1), ...face(-1)], 0.5);
}
function mapRead(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.58 * u;
  const p = person(spec.who, u), map = mapSheet(u), q = label(u, '?', '#6a6a7a', 0.22), go = label(u, 'こっち!', '#e08a20', 0.14);
  group.add(p.group, map, q, go);
  const loop = 7.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { flip: [0.8, 0.8], unflip: [2.9, 0.8], point: [3.9, 0.4], walk: [5.0, 1.4, 'linear'], out: [6.1, 0.4], in: [6.6, 0.5] });
      const walking = T.walk > 0 && T.walk < 1, gone = T.out * (1 - T.in);
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(x0 + 0.5 * u * T.walk * (1 - T.in), floor, 0.05 * u);
      p.group.rotation.y = turnTo(0.2, RIGHT - 0.4, between(v, 4.9, 5.2) * (1 - T.in));
      p.group.scale.setScalar(grow(1 - gone)); p.group.visible = gone < 0.99;
      // reading: the map held up in both hands in front of his chest; it turns upside down and back (a full turn)
      const read = 1 - T.point, s = wscale(group);
      p.local(0, 0.52, 0.3, W); map.position.copy(group.worldToLocal(W));
      map.rotation.set(-0.15, p.group.rotation.y, Math.PI * (T.flip + T.unflip), 'YXZ'); map.updateWorldMatrix(true, false);
      const puzzled = pre ? 0 : bump(v, 1.4, 1.8);
      p.turn('Head', 0.2 * read, 0, 0.3 * puzzled);
      if (read > 0.01) {
        p.handTo('R', map.localToWorld(W.set(-0.25 * u, 0, -0.02 * u)), read, { out: 0.7, down: 0.8 });
        p.handTo('L', map.localToWorld(W.set(0.25 * u, 0, -0.02 * u)), read, { out: 0.7, down: 0.8 });
      }
      // got it: the map goes to his left hand, folded small, and the right arm points the way
      if (T.point > 0) {
        p.handTo('R', p.local(-0.24, 0.42, 0.12, W), T.point, { out: 0.8, down: 0.8 });
        const m = W2.copy(map.position); p.hold(map, 'R', group, 0.01 * u * s); map.position.lerp(m, 1 - T.point);
        map.scale.setScalar(1 - 0.45 * T.point); map.rotation.set(0, p.group.rotation.y - 1.2 * T.point, 0, 'YXZ');
        p.point('L', group.localToWorld(W.set(x0 + 1.4 * u, floor + 0.8 * u, 0.3 * u)), T.point * (1 - between(v, 4.9, 5.1)));
      } else map.scale.setScalar(1);
      map.visible = gone < 0.99;
      pop(q, pre ? 0 : bump(v, 1.3, 2.0) > 0.25 ? 1 : 0, x0, floor + 1.18 * u, 0.1 * u);
      pop(go, pre ? 0 : between(v, 4.0, 4.3) * (1 - between(v, 5.0, 5.3)), x0 + 0.1 * u, floor + 1.15 * u, 0.1 * u);
    },
  };
}

// ---- 無くす ----
function keyProp(u) {
  const k = (x) => x * u, GOLD = 0xffc830;
  return solidProp([[G.torus(k(0.05), k(0.016)), GOLD], [G.box(k(0.15), k(0.026), k(0.02), k(0.125), 0, 0), GOLD], [G.box(k(0.024), k(0.05), k(0.02), k(0.18), k(-0.032), 0), GOLD], [G.box(k(0.024), k(0.038), k(0.02), k(0.14), k(-0.026), 0), GOLD]], 0.9);
}
function lostKey(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.3 * u, xe = xs + 0.8 * u;
  const p = person(spec.who, u), key = keyProp(u), q = label(u, '?', '#6a6a7a', 0.22), glint = burst(u, { s: 0.22, n: 4, color: 0xffffff });
  group.add(p.group, key, q, glint);
  const loop = 6.6, drop = 0.75, walkX = (v) => lerp(xs, xe, between(v, 0, 1.9));
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { face: [1.9, 0.4], look: [3.7, 0.5], out: [5.6, 0.4], in: [6.1, 0.4] });
      const walking = !pre && v < 1.9, gone = T.out * (1 - T.in);
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(T.in > 0 ? xs : pre ? xs : walkX(v), floor, 0.1 * u);
      p.group.rotation.y = T.in > 0 ? RIGHT - 0.3 : turnTo(turnTo(RIGHT - 0.3, -0.15, T.face), LEFT + 0.5, T.look);
      p.group.scale.setScalar(grow(1 - gone)); p.group.visible = gone < 0.99;
      // she pats her pockets, puzzled
      const pat = pre ? 0 : between(v, 2.1, 2.4) * (1 - between(v, 3.4, 3.7));
      p.handTo('R', p.local(-0.17, 0.44 + 0.04 * Math.sin(v * 9), 0.06, W), pat, { out: 0.8, down: 0.7 });
      p.handTo('L', p.local(0.17, 0.44 + 0.04 * Math.sin(v * 9 + Math.PI), 0.06, W), pat, { out: 0.8, down: 0.7 });
      p.turn('Head', 0.35 * pat, 0, 0.15 * pat);
      // the key: in her pocket until it slips out; it falls, bounces, lies there glinting
      const f = pre ? -1 : between(v, drop, drop + 0.35);
      if (pre || v < drop || T.in > 0) {
        p.local(-0.16, 0.45, 0.02, W); key.position.copy(group.worldToLocal(W)); key.rotation.set(0, p.group.rotation.y, -1.4);
        key.scale.setScalar(grow(T.in > 0 ? T.in : 1));
      } else {
        const x0 = walkX(drop) + 0.02 * u, y0 = floor + 0.4 * u;
        key.position.set(x0 + 0.05 * u * f, f < 1 ? lerp(y0, floor + 0.03 * u, f * f) : floor + 0.03 * u + 0.05 * u * bump(v, drop + 0.35, 0.25), 0.22 * u);
        key.rotation.set(f < 1 ? -0.7 * f : -0.7, 0, f < 1 ? v * 7 : 0.3); key.scale.setScalar(grow(1 - T.out));
      }
      const g = pre ? 0 : between(v, 3.9, 4.1) * (1 - between(v, 5.3, 5.6));
      glint.visible = g > 0.01; glint.scale.setScalar(grow(g * (0.8 + 0.3 * Math.sin(v * 8)))); glint.rotation.z = v * 1.5;
      glint.position.set(key.position.x + 0.07 * u, floor + 0.08 * u, 0.25 * u);
      pop(q, pre ? 0 : between(v, 2.4, 2.7) * (1 - between(v, 5.4, 5.7)), p.group.position.x, floor + 1.18 * u, 0.1 * u);
    },
  };
}

// ---- 無 ----
function emptyBox(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.66 * u, BW = 0.26 * u, BH = 0.2 * u, T2 = 0.012 * u, KRAFT = 0xc89a60;
  const kid = person(spec.who, u, 0.72), box = solidProp([[G.box(BW, T2, BW, 0, -BH / 2, 0), 0x4a2e18], [G.box(BW, BH, T2, 0, 0, BW / 2), KRAFT], [G.box(BW, BH, T2, 0, 0, -BW / 2), KRAFT], [G.box(T2, BH, BW, BW / 2, 0, 0), 0xb8884e], [G.box(T2, BH, BW, -BW / 2, 0, 0), 0xb8884e],
    [G.box(BW, 0.1 * u, T2, 0, BH / 2 + 0.045 * u, BW / 2 + 0.02 * u), 0xd8aa70], [G.box(BW, 0.1 * u, T2, 0, BH / 2 + 0.045 * u, -BW / 2 - 0.02 * u), 0xd8aa70], [G.box(BW * 0.5, 0.025 * u, 0.003 * u, 0, BH * 0.2, BW / 2 + T2), 0x8a6030]], 0.35);
  const SH = 0.16 * u, stool = solidProp([[G.box(0.3 * u, 0.025 * u, 0.24 * u, 0, SH, 0), 0x8a5a30], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [G.box(0.025 * u, SH, 0.025 * u, a * 0.12 * u, SH / 2, b * 0.09 * u), 0x6a4020])], 0.35);
  const dust = many(PUFF(u, 0xb8b0a0), 2, 0.4), empty = label(u, 'からっぽ', '#7a6a9a', 0.14);
  group.add(kid.group, box, stool, dust, empty);
  const loop = 6.6, R = 0.9;
  stool.position.set(x0 + 0.42 * u * Math.sin(R), floor, 0.42 * u * Math.cos(R)); stool.rotation.y = R;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0.2, 0.6], show: [0.9, 0.5], flip: [1.7, 0.6], unflip: [3.4, 0.5], down: [4.0, 0.5], shrug: [4.5, 0.35], unshrug: [5.8, 0.4] });
      kid.pose('Idle', t); kid.group.position.set(x0, floor, 0); kid.group.rotation.y = turnTo(R, -0.2, T.shrug * (1 - T.unshrug));
      // the box: from the stool up to his chest, tipped to show us its (empty) inside, upside down and shaken, back down
      const up = T.lift * (1 - T.down), sh = !pre && v > 2.3 && v < 3.3 ? Math.sin((v - 2.3) * 26) * Math.sin(Math.PI * (v - 2.3)) : 0;
      const rest = W.copy(stool.position).setY(floor + SH + 0.0125 * u + BH / 2), held = group.worldToLocal(kid.local(0, 0.5, 0.44, W2));
      box.position.copy(rest).lerp(held, up); box.position.y += (0.05 * u * (T.flip - T.unflip)) + 0.03 * u * sh; box.position.x += 0.02 * u * sh;
      box.rotation.set(1.0 * T.show * (1 - T.flip) + Math.PI * (T.flip - T.unflip), kid.group.rotation.y, 0, 'YXZ'); box.updateWorldMatrix(true, false);
      const s = wscale(group), side = axisOf(kid, 1, 0, 0, new THREE.Vector3()), hk = pre ? 0 : (T.lift > 0 ? 1 : 0) * (1 - T.shrug);
      if (hk > 0) {
        kid.grip('R', box.localToWorld(W.set(0, 0, 0)), side, (BW / 2) * s, Math.min(1, T.lift * 3) * hk, { out: 0.9, down: 0.5 });
        kid.grip('L', box.localToWorld(W.set(0, 0, 0)), side.clone().negate(), (BW / 2) * s, Math.min(1, T.lift * 3) * hk, { out: 0.9, down: 0.5 });
      }
      kid.turn('Head', 0.35 * bump(v, 0.3, 1.0) - 0.25 * (T.flip - T.unflip));
      // nothing falls out: one small puff of dust
      const d = pre ? -1 : between(v, 2.5, 3.5);
      for (let i = 0; i < 2; i++) dust.set(i, box.position.x + (i - 0.5) * 0.06 * u, box.position.y - 0.12 * u - 0.3 * u * d, box.position.z, d > 0 && d < 1 ? 0.5 * Math.sin(Math.PI * d) : 0);
      dust.commit();
      const k = T.shrug * (1 - T.unshrug);
      if (k > 0) shrug(kid, k);
      pop(empty, k, x0, floor + 0.95 * u, 0.15 * u);
    },
  };
}

// ---- 用 ----
function errandRun(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.4 * u, kx = mx + 0.45 * u;
  const mum = person(spec.other, u), kid = person(spec.who, u, KID + 0.05);
  const note = solidProp([[G.box(0.11 * u, 0.14 * u, 0.006 * u, 0, 0, 0), 0xffffff], ...[0.035, 0.005, -0.025].map((y) => [G.box(0.08 * u, 0.01 * u, 0.008 * u, 0, y * u, 0), 0x5a6a8a])], 0.6);
  const milk = solidProp([[G.box(0.1 * u, 0.15 * u, 0.1 * u, 0, 0, 0), 0xffffff], [G.box(0.102 * u, 0.06 * u, 0.102 * u, 0, -0.02 * u, 0), 0x3a7ad0], [G.cone(0.072 * u, 0.05 * u, 0, 0.1 * u, 0), 0xffffff]], 0.5);
  const please = label(u, 'おねがい!', '#e07ab0', 0.13), home = label(u, 'ただいま!', '#3a8ae0', 0.13), hs = many(HEART(u, 0.1), 3, 1);
  group.add(mum.group, kid.group, note, milk, please, home, hs);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { give: [0.4, 1.0, 'linear'], run: [1.8, 1.1, 'linear'], back: [3.6, 1.1, 'linear'], hand: [4.9, 1.0, 'linear'], reset: [7.2, 0.6] });
      const away = T.run * (1 - T.back), running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1), s = wscale(group);
      mum.pose('Idle', t); mum.group.position.set(mx, floor, 0); mum.group.rotation.y = RIGHT - 0.9;
      kid.pose(running ? (T.back > 0 ? 'Run_Carry' : 'Run') : 'Idle', running ? v * 1.1 : t + 1);
      kid.group.position.set(kx + 0.95 * u * away, floor, 0.12 * u);
      kid.group.rotation.y = running ? (T.back > 0 ? LEFT : RIGHT) : turnTo(LEFT + 0.8, RIGHT - 0.2, between(v, 1.5, 1.8) * (1 - T.back));
      const vis = 1 - between(away, 0.75, 1); kid.group.scale.setScalar(grow(vis)); kid.group.visible = vis > 0.01;
      // the note: mum's hand -> the kid's hand; the milk: the kid's hands -> mum's hand
      const mid = mum.local(-0.05, 0.45, 0.42, new THREE.Vector3()).lerp(kid.local(0, 0.6, 0.3, W2), 0.5);
      const mumRest = mum.local(-0.15, 0.4, 0.18, new THREE.Vector3()), kidRest = kid.local(0.12, 0.45, 0.22, new THREE.Vector3());
      note.visible = (pre || T.run < 0.8) || T.reset > 0; note.rotation.set(0, mum.group.rotation.y, 0);
      if (T.reset > 0) { mum.hold(note, 'R', group, 0.005 * u * s); note.scale.setScalar(grow(T.reset)); }
      else if (note.visible) { pass(mum, 'R', kid, 'L', note, group, T.give, mumRest, kidRest, mid, 0.005 * u * s); note.scale.setScalar(1); }
      milk.visible = T.back > 0 && T.reset < 1; milk.rotation.set(0, kid.group.rotation.y, 0);
      if (milk.visible) {
        if (T.hand <= 0) { kid.local(0, 0.45, 0.28, W); milk.position.copy(group.worldToLocal(W)); milk.scale.setScalar(grow(vis)); }
        else { pass(kid, 'L', mum, 'R', milk, group, T.hand, kidRest, mumRest, mid, 0.05 * u * s); milk.scale.setScalar(grow(1 - T.reset)); }
      }
      pop(please, pre ? 0 : between(v, 0.2, 0.5) * (1 - between(v, 1.5, 1.8)), mx, floor + 1.15 * u, 0.1 * u);
      pop(home, pre ? 0 : between(v, 4.5, 4.8) * (1 - between(v, 5.8, 6.1)), kx + 0.1 * u, floor + 0.85 * u, 0.15 * u);
      hearts(hs, 3, mx + 0.2 * u, floor + 1.0 * u, 0.15 * u, pre ? -1 : v, 5.7, u);
    },
  };
}

// ---- 売 / 売る ----
function appleSell(ctx, spec, stage) {
  if (spec.outcome === 'sold') return soldTv(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, CH = 0.26 * u;
  const crate = solidProp([[G.box(0.46 * u, CH, 0.26 * u, 0, CH / 2, 0), 0xc89a60], ...[0.07, 0.16].map((y) => [G.box(0.47 * u, 0.02 * u, 0.265 * u, 0, y * u, 0), 0x8a5a30]),
    ...[0, 1, 2, 3, 4, 5].map((i) => [G.sphere(0.055 * u, ((i % 3) - 1) * 0.13 * u, CH + 0.035 * u, (i > 2 ? -0.06 : 0.06) * u), 0xe02830])], 0.4);
  crate.position.set(cx, floor, 0.12 * u);
  const apple = solidProp([[G.sphere(0.06 * u), 0xe02830], [G.cyl(0.006 * u, 0.006 * u, 0.03 * u, 0, 0.062 * u, 0), 0x5a3a1a], [G.sphere(0.025 * u, 0.02 * u, 0.068 * u, 0, 1.4, 0.4, 0.7), 0x40a040]], 0.6);
  const coin = solidProp([[G.cyl(0.04 * u, 0.04 * u, 0.01 * u, 0, 0, 0, Math.PI / 2), 0xffc830]], 0.8), price = label(u, '¥100', '#e0a020', 0.12);
  const seller = person(spec.who, u), buyer = person(spec.other, u);
  group.add(crate, apple, coin, price, seller.group, buyer.group);
  const loop = 7.4, bx = cx + 0.55 * u, bIn = cx + 1.3 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0.2, 1.4, 'linear'], pay: [1.8, 1.0, 'linear'], give: [3.0, 1.0, 'linear'], go: [4.4, 1.4, 'linear'], next: [6.4, 0.5] });
      const s = wscale(group);
      seller.pose('Idle', t); seller.group.position.set(cx, floor, -0.15 * u); seller.group.rotation.y = 0.35;
      const walking = (T.in > 0 && T.in < 1) || (T.go > 0 && T.go < 1);
      buyer.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      buyer.group.position.set(lerp(bIn, bx, T.in) + (bIn - bx) * T.go, floor, 0.3 * u);
      buyer.group.rotation.y = T.go > 0 ? RIGHT - 0.3 : walking ? LEFT : LEFT + 0.5;
      const bv = pre ? 0 : (1 - between(T.go, 0.7, 1)) * between(v, 0.2, 0.5); buyer.group.scale.setScalar(grow(bv)); buyer.group.visible = bv > 0.01;
      // he holds an apple up high (left hand, toward the shopper) until she has paid, then hands it over
      const up = pre ? 1 : 1 - between(v, 2.6, 3.0), sRest = seller.local(0.2, 0.45, 0.25, new THREE.Vector3());
      const high = seller.local(0.26, 1.0, 0.1, new THREE.Vector3()).add(W.set(0, 0.02 * u * s * Math.sin(v * 6) * up, 0));
      const mid = seller.local(0.3, 0.5, 0.35, new THREE.Vector3()).lerp(buyer.local(0, 0.5, 0.3, W2), 0.5), bRest = buyer.local(0.12, 0.5, 0.25, new THREE.Vector3());
      apple.visible = T.go < 1 || T.next > 0; apple.scale.setScalar(grow(T.next > 0 ? T.next : 1 - between(T.go, 0.7, 1)));
      if (T.give > 0 && T.next <= 0) pass(seller, 'L', buyer, 'L', apple, group, T.give, sRest.lerp(high, 0), bRest, mid, 0.06 * u * s);
      else { seller.handTo('L', sRest.lerp(high, up), 1, { out: 0.7, down: 0.6 }); seller.hold(apple, 'L', group, 0.06 * u * s); }
      // the coin: her hand -> his right hand -> into his apron
      const cRest = seller.local(-0.1, 0.42, 0.28, new THREE.Vector3());
      coin.visible = !pre && T.in > 0.5 && T.pay < 1; coin.rotation.set(0, v * 3, 0);
      if (coin.visible) {
        if (T.pay <= 0) { buyer.handTo('L', bRest, 1); buyer.hold(coin, 'L', group, 0.01 * u * s); }
        else if (T.give <= 0) pass(buyer, 'L', seller, 'R', coin, group, T.pay, bRest, cRest, mid.clone().add(W.set(0, -0.05 * u * s, 0)), 0.01 * u * s);
      }
      seller.nod(pre ? 0 : bump(v, 2.6, 0.8), v);
      price.position.set(cx - 0.12 * u, floor + CH + 0.16 * u, 0.3 * u);
    },
  };
}
function soldTv(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const tv = solidProp([[G.box(0.22 * u, 0.3 * u, 0.2 * u, 0, 0.15 * u, 0), 0xc89a60], [G.box(0.42 * u, 0.3 * u, 0.1 * u, 0, 0.47 * u, 0), 0x2a2a30], [G.box(0.37 * u, 0.25 * u, 0.004 * u, 0, 0.47 * u, 0.052 * u), 0x4a9ad8], [G.sphere(0.04 * u, 0.06 * u, 0.5 * u, 0.056 * u, 1, 1, 0.1), 0xffe060], [G.box(0.42 * u, 0.06 * u, 0.004 * u, 0, 0.38 * u, 0.055 * u), 0x60c060]], 0.45);
  tv.position.set(tx, floor, 0);
  const stamp = textPlane('SOLD', { h: 0.18 * u, color: '#ffffff', bg: '#e02020' }), seller = person(spec.who, u);
  group.add(tv, stamp, seller.group);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { show: [0.2, 0.4], slam: [1.2, 0.25, 'in'], off: [4.6, 0.4] });
      const cheer = pre ? 0 : between(v, 1.5, 1.7) * (1 - between(v, 3.9, 4.2));
      seller.pose(cheer > 0.5 ? 'Victory' : 'Idle', cheer > 0.5 ? 0.3 + 0.3 * Math.sin((v - 1.5) * 3) : t);
      seller.group.position.set(tx + 0.5 * u, floor, 0.1 * u); seller.group.rotation.y = -0.45;
      // first he shows the TV off, palm up toward it
      const show = cheer > 0.5 ? 0 : T.show * (1 - between(v, 1.3, 1.5));
      seller.handTo('R', seller.local(-0.3, 0.55, 0.25, W), show, { out: 0.8, down: 0.7 }); seller.twist('R', W2.set(0, 1, 0), show);
      const s = pre ? 0 : T.slam * (1 - T.off);
      stamp.visible = s > 0.01; stamp.position.set(tx, floor + 0.47 * u, 0.1 * u + 0.4 * u * (1 - T.slam)); stamp.rotation.z = 0.25;
      stamp.scale.setScalar(grow(s * (1 + 1.2 * (1 - T.slam)) * (1 + 0.15 * bump(v, 1.45, 0.3))));
    },
  };
}

// ---- 覚える (memory-bubble:cards) ----
export function flashcards(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), bulb = emblemProp('lightbulb', 0.24 * u), got = label(u, 'おぼえた!', '#e0a020', 0.13);
  const card = (pic) => solidProp([[G.box(0.22 * u, 0.16 * u, 0.008 * u, 0, 0, 0), 0xffffff], [G.box(0.2 * u, 0.14 * u, 0.006 * u, 0, 0, -0.002 * u), 0x8ac0f0], ...pic], 0.6);
  const cards = [card([[G.sphere(0.045 * u, 0, -0.005 * u, 0.006 * u, 1, 1, 0.3), 0xe02830], [G.sphere(0.018 * u, 0.018 * u, 0.045 * u, 0.008 * u, 1.4, 0.5, 0.3), 0x40a040]]),
    card([[G.extrude(heartShape(), 0.1).scale(0.09 * u, 0.09 * u, 0.09 * u).translate(0, 0, 0.008 * u), 0xff4a7a]]),
    card([[G.cone(0.05 * u, 0.08 * u, 0, -0.005 * u, 0.006 * u), 0x2a8a3a], [G.box(0.016 * u, 0.03 * u, 0.006 * u, 0, -0.055 * u, 0.006 * u), 0x7a4a24]])];
  group.add(p.group, ...cards, bulb, got);
  const loop = 6.4, T0 = 0.2, D = 1.3;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.2;
      // the stack rests on his left palm; the right hand lifts the top card up beside his face, he studies it, nods,
      // and it flies into his head
      const s = wscale(group), cur = pre ? -1 : Math.floor((v - T0) / D), f = pre ? 0 : (v - T0) / D - cur;
      p.grip('L', p.local(0.08, 0.44, 0.28, W), W2.set(0, 1, 0), 0.01 * u * s, 1, { out: 0.8, down: 0.6 });
      p.hold(cards[2], 'L', group, 0.006 * u * s);
      const base = cards[2].position.clone(), face = p.local(-0.2, 0.78, 0.34, new THREE.Vector3()), head = p.at('over', new THREE.Vector3(), 0, -0.18, 0);
      const reach = cur >= 0 && cur < 3 ? between(f, 0, 0.3) * (1 - between(f, 0.65, 0.8)) : 0;
      p.handTo('R', group.localToWorld(base.clone()).lerp(face, reach), reach > 0 ? 1 : 0, { out: 0.7, down: 0.7 });
      p.turn('Head', 0.12 * reach); p.nod(cur >= 0 && cur < 3 ? bump(f, 0.4, 0.3) : 0, v);
      cards.forEach((c, i) => {
        c.rotation.set(-0.2, p.group.rotation.y, 0.05 * (i - 1), 'YXZ');
        if (i > cur || pre || cur >= 3 && v > loop - 0.6) {           // still in the stack (or back in it at the end)
          c.position.copy(base).add(W.set(0, 0.012 * u * (2 - i), 0)); c.rotation.x = -1.2; c.visible = true; c.scale.setScalar(grow(cur >= 3 ? between(v, loop - 0.6, loop - 0.2) : 1));
        } else if (i === cur && f < 0.8) { c.visible = true; c.scale.setScalar(1); c.position.copy(group.worldToLocal(face.clone().lerp(group.localToWorld(base.clone()), 1 - between(f, 0, 0.3)))); c.rotation.x = lerp(-1.2, -0.1, between(f, 0, 0.3)); }
        else if (i === cur) { const g = between(f, 0.8, 1.0); c.visible = g < 1; c.position.copy(group.worldToLocal(face.clone().lerp(head, g))); c.scale.setScalar(grow(1 - g)); }
        else c.visible = false;
      });
      const b = pre ? 0 : between(v, T0 + 3 * D, T0 + 3 * D + 0.3) * (1 - between(v, loop - 0.8, loop - 0.5));
      bulb.visible = b > 0.01; bulb.scale.setScalar(grow(0.24 * u * b)); p.at('over', W, 0, 0.1, 0); bulb.position.copy(group.worldToLocal(W)); bulb.idle(v);
      pop(got, b, x0 + 0.42 * u, floor + 1.05 * u, 0.1 * u);
    },
  };
}

export const SCENES = { 'q-map-read': mapRead, 'q-lost-key': lostKey, 'q-empty-box': emptyBox, 'q-errand-run': errandRun, 'q-apple-sell': appleSell };
