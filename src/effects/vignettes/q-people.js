// Model scenes, people (Step 3a model pass): grown-ups and children, pairs, friends, "me".
//   q-grownup  大人: a tall grown-up with a briefcase beside a small child; she stretches up on tiptoe and her hands only
//              reach his chest; he looks down and pats her head
//   q-plough   男: a man leans into a plough and pushes it along the field, a furrow opening behind; he stops, wipes his
//              brow and cheers; outcome boy: a boy runs round holding a toy plane up high (男の子)
//   q-swing    女の子: a girl swings high on a swing beside the kanji, legs out, hair flying
//   q-pair     二人: two people walk in from either side, a badge 1 and 2 over each, take hands and swing them, hearts
//   q-friends  友: two children run up to each other, high-five (a burst), and walk off together hand in hand
//   q-me       私: a child jumps up and down waving a hand high, then points at her own nose: わたし!
//   q-spot     自分: three people stand in a row under a "?"; one steps forward, hand on her chest, and a spotlight lands on her
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, HEART, burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, UP, DOWN, lerp, label, pop, hearts, person, KID, TEEN, handInHand, briefcase, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();

// ---- 大人 ----
function grownup(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.85 * u;
  const big = person(spec.who, u, 1.0), kid = person(spec.kid, u, 0.48), bag = briefcase(u), head = new THREE.Vector3();
  group.add(big.group, kid.group, bag);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      big.pose('Idle', t); kid.pose('Idle', t + 1);
      big.group.position.set(x0, floor, 0); big.group.rotation.y = -0.5;
      // she stands on tiptoe, reaching up as high as she can, beside him
      const reach = pre ? 0 : between(v, 0.4, 0.9) * (1 - between(v, 2.6, 3.0)), tip = reach * (0.7 + 0.3 * Math.abs(Math.sin(v * 5)));
      kid.group.position.set(x0 - 0.38 * u, floor + 0.025 * u * tip, 0.12 * u); kid.group.rotation.y = 0.45;
      kid.turn('Head', -0.45 * reach);
      kid.handTo('R', kid.local(-0.06, 1.15, 0.1, W), tip, { out: 0.4, down: 0.2 }); kid.handTo('L', kid.local(0.06, 1.15, 0.1, W), tip, { out: 0.4, down: 0.2 });
      big.hold(bag, 'L', group, 0.004 * u); bag.rotation.y = big.group.rotation.y;
      // he looks down at her and pats her head
      const pat = between(v, 3.0, 3.4) * (1 - between(v, 5.4, 5.8));
      big.turn('Head', 0.3 * Math.max(reach, pat), 0.4 * Math.max(reach, pat));
      kid.at('over', head, 0, -0.1 - 0.04 * Math.abs(Math.sin(v * 6)), -0.02);
      big.grip('R', head, DOWN, 0, pat, { out: 0.4, down: 0.5 });
      kid.nod(pat, v);
    },
  };
}

// ---- 男 / 男の子 ----
function plough(ctx, spec, stage) {
  if (spec.outcome === 'boy') return boyPlane(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 1.35 * u, xe = B.maxX + 0.25 * u;
  const man = person(spec.who, u), cheer = burst(u, { s: 0.22, color: 0xffd040 });
  const field = solidProp([[G.box(1.6 * u, 0.02 * u, 0.8 * u, 0, -0.01 * u, -0.1 * u), 0x7a5230], ...[-0.4, -0.25].flatMap((z) => [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x) => [G.cone(0.025 * u, 0.09 * u, x * u, 0.045 * u, z * u), 0x58b848]))], 0.3);
  field.position.set((xs + xe) / 2 + 0.1 * u, floor, 0.05 * u); field.rotation.x = 0.35;
  const furrow = solidProp([[G.box(1, 0.03 * u, 0.06 * u, 0.5, 0.0, 0), 0x3a2414]], 0.3);
  const tool = solidProp([[G.cyl(0.014 * u, 0.014 * u, 0.5 * u, 0, 0, 0, 0, 0, 1.15), 0x9a6a3a], [G.cyl(0.012 * u, 0.012 * u, 0.24 * u, -0.06 * u, 0.06 * u, 0.1 * u, 1.2, 0, 0), 0x9a6a3a], [G.cyl(0.012 * u, 0.012 * u, 0.24 * u, -0.06 * u, 0.06 * u, -0.1 * u, -1.2, 0, 0), 0x9a6a3a], [G.cone(0.05 * u, 0.12 * u, -0.25 * u, -0.12 * u, 0, 2.6), 0xa8b0bc]], 0.4);
  group.add(field, furrow, man.group, tool, cheer);
  const loop = 7.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { go: [0, 4.6, 'linear'], wipe: [4.8, 0.6], yay: [5.6, 0.4] });
      const walking = !pre && T.go > 0 && T.go < 1, x = lerp(xs, xe + 0.35 * u, pre ? 0 : T.go);
      const yay = !pre && v > 5.6 && v < 7.2;
      man.pose(walking ? 'Walk' : yay ? 'Victory' : 'Idle', walking ? v * 0.7 : yay ? 0.4 + 0.25 * Math.sin((v - 5.6) * 3) : t);
      man.group.position.set(x, floor, 0.05 * u); man.group.rotation.y = LEFT + 0.35;
      // he leans into the plough's handles while walking; the plough's blade cuts the furrow ahead of him
      if (walking || pre) { man.turn('Abdomen', 0.35); man.turn('Torso', 0.15); }
      tool.position.copy(group.worldToLocal(man.local(0, 0.18, 0.42, W))); tool.rotation.y = man.group.rotation.y + Math.PI / 2;
      const hR = man.local(-0.1, 0.38, 0.24, new THREE.Vector3()), hL = man.local(0.1, 0.38, 0.24, new THREE.Vector3());
      if (walking || pre) { man.handTo('R', hR, 1, { out: 0.6, down: 0.8 }); man.handTo('L', hL, 1, { out: 0.6, down: 0.8 }); }
      const wipe = T.wipe * (1 - T.yay);
      man.handTo('R', man.at('eyes', W, -0.05, 0.08, 0.02), wipe, { out: 0.8, down: 0.5 });
      tool.visible = true;
      const tipX = tool.position.x - 0.2 * u; furrow.position.set(tipX, floor + 0.01 * u, 0.12 * u); furrow.scale.x = Math.max(0.001, xs + 0.4 * u - tipX); furrow.rotation.x = 0.35;
      const c = yay ? Math.min(1, (v - 5.6) / 0.3) * (1 - between(v, 6.9, 7.2)) : 0;
      cheer.visible = c > 0.01; cheer.scale.setScalar(grow(c)); cheer.position.set(x, floor + 1.1 * u, 0.1 * u); cheer.rotation.z = v;
    },
  };
}
function boyPlane(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u;
  const boy = person(spec.who, u, KID);
  const plane = solidProp([[G.capsule(0.03 * u, 0.16 * u, 0, 0, 0, Math.PI / 2), 0x3a8ae0], [G.box(0.06 * u, 0.008 * u, 0.3 * u, 0.02 * u, 0, 0), 0xe04848], [G.box(0.04 * u, 0.06 * u, 0.008 * u, -0.1 * u, 0.03 * u, 0), 0xe04848], [G.sphere(0.022 * u, 0.115 * u, 0.005 * u, 0), 0xbfe8ff]], 0.5);
  const zoom = label(u, 'ブーン', '#3a8ae0', 0.12);
  group.add(boy.group, plane, zoom);
  const loop = 6.0, rx = 0.45 * u, rz = 0.25 * u, P = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // round and round a loop beside the kanji, the plane held up high on his palm, banking with the turn
      const a = pre ? -Math.PI / 2 : (v / loop) * Math.PI * 4 - Math.PI / 2;
      boy.pose(pre ? 'Idle' : 'Run', pre ? t : v);
      boy.group.position.set(cx + rx * Math.cos(a), floor, -0.05 * u + rz * Math.sin(a));
      const yaw = pre ? 0 : Math.atan2(-rx * Math.sin(a), rz * Math.cos(a)); boy.group.rotation.y = yaw;
      boy.local(-0.14, 1.0, 0.12, P);
      boy.grip('R', P, UP, 0.035 * u * group.getWorldScale(W).y, 1, { out: 0.5, down: 0.3 });
      plane.position.copy(group.worldToLocal(P.clone())); plane.rotation.set(0, yaw - Math.PI / 2, pre ? 0 : 0.35 * Math.sin(v * 3));
      pop(zoom, pre ? 0 : 0.8 + 0.2 * Math.sin(v * 6), plane.position.x, floor + 1.0 * u, plane.position.z + 0.1 * u);
    },
  };
}

// ---- 女の子 ----
function swing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.7 * u, top = 0.95 * u, L = 0.72 * u;
  const girl = person(spec.who, u, KID), hips = new THREE.Vector3(), seatW = new THREE.Vector3();
  const frame = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.62 * u, 0, top, 0, Math.PI / 2), 0xd04848], ...[[-0.3, -1], [0.3, 1]].flatMap(([z]) => [[G.cyl(0.018 * u, 0.018 * u, top * 1.04, -0.12 * u, top / 2, z * u, 0, 0, -0.12), 0xd04848], [G.cyl(0.018 * u, 0.018 * u, top * 1.04, 0.12 * u, top / 2, z * u, 0, 0, 0.12), 0xd04848]])], 0.4);
  const arm = new THREE.Group(), seat = solidProp([[G.box(0.2 * u, 0.02 * u, 0.12 * u, 0, -L, 0), 0x8a5a30], [G.cyl(0.005 * u, 0.005 * u, L, 0, -L / 2, 0.055 * u), 0xe8e0d0], [G.cyl(0.005 * u, 0.005 * u, L, 0, -L / 2, -0.055 * u), 0xe8e0d0]], 0.4);
  const rig = new THREE.Group(), turn = -0.65; rig.add(frame, arm); rig.position.set(sx, floor, 0); rig.rotation.y = turn;
  arm.add(seat); arm.position.set(0, top, 0);
  const wee = label(u, 'わーい!', '#e05a8a', 0.12);
  group.add(rig, girl.group, wee);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const amp = pre ? 0.05 : 0.15 + 0.45 * Math.min(1, v / 1.5), ang = amp * Math.sin((pre ? t : v) * 4.0);
      arm.rotation.z = ang;
      // she sits on the seat facing along the swing (we see her side), legs out, holding the ropes
      girl.pose('SitDown', 1.0, false);
      girl.group.position.set(0, 0, 0); girl.group.rotation.set(0, LEFT + turn, 0); girl.group.updateWorldMatrix(true, true);
      girl.node('Hips').getWorldPosition(hips).sub(group.localToWorld(W.set(0, 0, 0)));
      arm.updateWorldMatrix(true, false); arm.localToWorld(seatW.set(0, -L + 0.03 * u, 0));
      girl.group.position.copy(group.worldToLocal(seatW.sub(hips)));
      girl.group.updateWorldMatrix(true, true);
      girl.turn('Abdomen', -0.6 * ang);
      for (const [s, z] of [['R', -0.055], ['L', 0.055]]) girl.handTo(s, arm.localToWorld(W.set(0, -L + 0.3 * u, z * u)), 1, { out: 0.3, down: 0.6 });
      pop(wee, pre ? 0 : between(v, 1.5, 1.8) * (1 - between(v, 4.6, 4.9)), sx + 0.1 * u, floor + 1.15 * u, 0.2 * u);
    },
  };
}

// ---- 二人 ----
function pair(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mid = B.maxX + 0.7 * u, gap = 0.2 * u;
  const a = person(spec.who, u), b = person(spec.other, u, 0.86), one = label(u, '1', '#3a8ac0', 0.17), two = label(u, '2', '#d0603a', 0.17), love = many(HEART(u, 0.09), 3, 1);
  group.add(a.group, b.group, one, two, love);
  const loop = 7.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.6, 'out'], face: [1.6, 0.4], go: [6.0, 1.4, 'in'] });
      const walk = !pre && ((T.come > 0 && T.come < 1) || T.go > 0), off = pre ? 0 : (1 - T.come) + T.go;
      for (const [p, s] of [[a, 1], [b, -1]]) {
        p.pose(walk ? 'Walk' : 'Idle', walk ? v + (s > 0 ? 0 : 0.5) : t + s);
        p.group.position.set(mid + s * (gap + off * 0.7 * u), floor, 0.05 * u);
        p.group.rotation.y = pre ? 0 : T.go > 0 ? (s > 0 ? RIGHT - 0.4 : LEFT + 0.4) : turnTo(s > 0 ? LEFT + 0.4 : RIGHT - 0.4, 0, T.face);
      }
      // hands held and swung between them
      const held = pre ? 0 : between(v, 1.9, 2.3) * (1 - between(v, 5.6, 6.0));
      handInHand(a, 'L', b, 'R', held);
      if (held > 0.9) for (const p of [a, b]) p.turn(p === a ? 'UpperArmL' : 'UpperArmR', 0.4 * Math.sin(v * 4));
      pop(one, pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 5.8, 6.0)), a.group.position.x, floor + 1.05 * u, 0.1 * u);
      pop(two, pre ? 0 : between(v, 1.0, 1.3) * (1 - between(v, 5.8, 6.0)), b.group.position.x, floor + 1.02 * u, 0.1 * u);
      hearts(love, 3, mid, floor + 1.25 * u, 0.2 * u, pre ? -1 : v, 2.8, u);
    },
  };
}

// ---- 友 ----
function friends(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mid = B.maxX + 0.65 * u, gap = 0.17 * u;
  const a = person(spec.who, u, KID), b = person(spec.other, u, KID), bang = burst(u, { s: 0.22, color: 0xffe060 }), P = new THREE.Vector3();
  group.add(a.group, b.group, bang);
  const loop = 6.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.3, 'out'], five: [1.4, 0.35], down: [2.3, 0.4], turn: [2.8, 0.4], go: [3.2, 3.2, 'linear'] });
      const run = !pre && T.come > 0 && T.come < 1, walk = !pre && T.go > 0 && T.go < 1, off = pre ? 0 : 1 - T.come;
      for (const [p, s] of [[a, 1], [b, -1]]) {
        p.pose(run ? 'Run' : walk ? 'Walk' : 'Idle', run || walk ? v + (s > 0 ? 0 : 0.4) : t + s);
        p.group.position.set(mid + s * (gap + off * 0.8 * u) + T.go * 1.0 * u, floor, 0.1 * u + (s > 0 ? 0 : 0.05 * u) * T.turn);
        p.group.rotation.y = T.turn > 0 ? turnTo(s > 0 ? LEFT + 0.5 : RIGHT - 0.5, RIGHT - 0.5, T.turn) : s > 0 ? LEFT + 0.5 : RIGHT - 0.5;
      }
      // high five: both hands up to one point between them, a burst; then hand in hand
      a.local(-0.25, 0.95, 0.15, P).lerp(b.local(0.25, 0.95, 0.15, W), 0.5);
      const hi = T.five * (1 - T.down);
      a.grip('R', P, axisOf(a, -1, 0, 0.6, W).normalize(), 0, hi, { out: 0.6, down: 0.2 }); b.grip('L', P, axisOf(b, 1, 0, 0.6, W).normalize(), 0, hi, { out: 0.6, down: 0.2 });
      const k = pre ? 0 : bump(v, 1.65, 0.6);
      bang.visible = k > 0.01; bang.scale.setScalar(grow(k)); bang.position.copy(group.worldToLocal(P.clone())); bang.position.z += 0.05 * u; bang.rotation.z = v * 2;
      handInHand(a, 'L', b, 'R', between(v, 2.9, 3.3));
    },
  };
}

// ---- 私 ----
function me(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const kid = person(spec.who, u, 0.6), say = label(u, 'わたし!', '#d0603a', 0.14);
  group.add(kid.group, say);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const hop = !pre && v < 2.2, point = pre ? 0 : between(v, 2.5, 2.8) * (1 - between(v, 4.9, 5.3));
      kid.pose(hop ? 'Jump' : 'Idle', hop ? v % 1.0 : t);
      kid.group.position.set(x0, floor, 0.1 * u); kid.group.rotation.y = -0.15;
      // pick me! one hand high, waving; then the finger (the fist) to her own nose, the Japanese "me"
      if (hop) kid.handTo('R', kid.local(-0.12 + 0.05 * Math.sin(v * 10), 1.2, 0.1, W), 1, { out: 0.4, down: 0.2 });
      kid.handTo('R', kid.at('mouth', W, -0.01, 0.05, 0.09), point, { out: 0.7, down: 0.9 });
      kid.twist('R', axisOf(kid, 1, 0, 0, W2), point);
      if (point > 0.5) kid.nod(0.4, v);
      pop(say, point, x0 + 0.05 * u, floor + 0.85 * u, 0.25 * u);
    },
  };
}

// ---- 自分 ----
function spot(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.8 * u;
  const ps = [person(spec.who, u, 0.85), person(spec.other, u, 0.85), person(spec.third, u, 0.85)], ask = label(u, '?', '#7a5ac0', 0.22);
  const light = solidProp([[G.cone(0.32 * u, 1.3 * u, 0, 0.65 * u, 0), 0xfff2b0]], 1.0), pool = solidProp([[G.cyl(0.3 * u, 0.3 * u, 0.005 * u, 0, 0, 0, 0, 0, 0, 32), 0xfff2b0]], 1.0);
  for (const m of [light.material, pool.material]) { m.transparent = true; m.depthWrite = false; m.opacity = 0.3; }
  group.add(...ps.map((p) => p.group), ask, light, pool);
  const loop = 6.4, chest = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { step: [1.6, 0.6], back: [5.4, 0.6] }), f = T.step * (1 - T.back);
      ps.forEach((p, i) => {
        const me = i === 1, walking = me && !pre && ((T.step > 0 && T.step < 1) || (T.back > 0 && T.back < 1));
        p.pose(walking ? 'Walk' : 'Idle', walking ? v : t + i);
        p.group.position.set(x0 + (i - 1) * 0.42 * u, floor, (me ? 0.35 * u * f : 0) - 0.05 * u); p.group.rotation.y = 0;
        if (!me) p.turn('Head', 0, (i === 0 ? -0.5 : 0.5) * f);
      });
      // her hand on her own chest
      const m = ps[1], hand = between(v, 2.1, 2.4) * (1 - between(v, 5.0, 5.3));
      m.local(0.0, 0.5, 0.18, chest);
      m.grip('R', chest, axisOf(m, 0, 0, -1, W), 0, hand, { out: 0.5, down: 0.9 });
      m.nod(hand, v * 0.6);
      pop(ask, pre ? 0 : between(v, 0.4, 0.7) * (1 - between(v, 1.8, 2.0)), x0, floor + 1.15 * u, 0.1 * u);
      const k = pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 5.2, 5.5));
      light.visible = pool.visible = k > 0.01; light.material.opacity = 0.28 * k; pool.material.opacity = 0.45 * k;
      light.position.set(x0, floor, 0.35 * u); light.rotation.z = 0; pool.position.set(x0, floor + 0.004 * u, 0.35 * u);
    },
  };
}

export const SCENES = { 'q-grownup': grownup, 'q-plough': plough, 'q-swing': swing, 'q-pair': pair, 'q-friends': friends, 'q-me': me, 'q-spot': spot };
