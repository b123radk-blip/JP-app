// Model scenes, part B (the Quaternius trial): natural low-poly animals and chibi people with their own clips (Idle, Walk,
// Run, SitDown, StandUp, Victory, Defeat, Walk_Carry, PickUp; animals: Idle, Walk, Gallop, Eating, Jump_ToIdle).
//   q-dog-fetch   犬: a Shiba waits; a ball bounces past, it gallops after it, brings it back in its mouth, hops for joy
//   q-cow         牛: a cow walks up, grazes, lifts its head and moos モー
//   q-rest-tree   休: a walker reaches a tree, sits on a log against it, nods off (Zzz), stands up and walks on
//   q-walker      歩: a person walks along beside the kanji leaving footprints, turns, and walks back
//   q-kimono      女: a woman in a kimono walks up, turns to you, cheers and twirls under falling petals
//   q-doctor      医者: a patient sits slumped (sad cloud); a doctor walks up carrying a red-cross kit, sets it down; the
//                 patient jumps up cheering
//   q-run         走る: a runner laps a little track beside the kanji, dust kicking up
//   q-sit         座る: a person walks up to a chair, turns, sits down, rests, stands up and walks off
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many, ball, PUFF, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, puffs } from './helpers.js';
import { grow } from './step1-kit.js';

const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2;
const lerp = (a, b, f) => a + (b - a) * f;
// the pack's people have near-black skin with white eye shapes; on the app's dark skies they read as silhouettes
const SKIN = { Skin: 0xf0c49c, Face: 0x2a1c18 };
const person = (name, h) => createModel(name, { height: h, tint: SKIN });
const label = (u, text, bg) => textPlane(text, { h: 0.16 * u, color: '#ffffff', bg, pad: 0.25 });
const pop = (m, k, x, y, z) => { m.visible = k > 0.01; m.scale.setScalar(grow(k)); m.position.set(x, y, z); };

// ---- 犬 ----
function dogFetch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, home = B.maxX + 0.5 * u, far = B.maxX + 1.35 * u, h = 0.75 * u;
  const dog = createModel('shiba', { height: h }), toy = ball(u, { r: 0.06, color: 0x40c0ff, stripe: 0xffffff }), dust = many(PUFF(u), 6, 0.3), hearts = many(HEART(u, 0.1), 3, 1);
  group.add(dog.group, toy, dust, hearts);
  const loop = 6.6, OUT = RIGHT - 0.7, BACK = LEFT + 0.7;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { throw: [0.3, 1.2, 'linear'], run: [0.9, 1.0, 'in'], back: [2.5, 1.1], drop: [3.7, 0.2] });
      const x = home + (far - home) * (T.run - T.back), running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      const yaw = pre ? -0.4 : -0.4 + (OUT + 0.4) * between(v, 0.75, 0.95) + (BACK - OUT) * between(v, 2.2, 2.45) - (BACK + 0.4) * between(v, 3.6, 3.8);
      if (running) dog.pose('Gallop', v); else if (!pre && v > 3.9 && v < 6.1) dog.pose('Jump_ToIdle', (v - 3.9) % 1.1); else if (!pre && T.run >= 1 && T.back <= 0) dog.pose('Eating', v - 1.9); else dog.pose('Idle', t);
      dog.group.position.set(x, floor, 0.05 * u); dog.group.rotation.y = yaw;
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      toy.visible = !pre && T.throw > 0;
      if (T.run < 1) { const f = T.throw; toy.position.set(B.minX + (far + 0.3 * u - B.minX) * f, floor + 0.06 * u + Math.abs(Math.sin(f * Math.PI * 2.2)) * 0.9 * u * (1 - f), 0.1 * u); }
      else if (T.drop < 1) toy.position.set(x + fx * 0.5 * h, floor + 0.62 * h, 0.05 * u + fz * 0.5 * h);
      else toy.position.set(home - 0.15 * u, floor + 0.06 * u + 0.1 * u * bump(v, 3.7, 0.3), 0.05 * u + 0.45 * h);
      puffs(dust, 0, 6, far + 0.2 * u, floor, pre ? 0 : (v - 1.9) / 0.6, u, 0.4); dust.commit();
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 4.1 + i * 0.35, 5.3 + i * 0.35); hearts.set(i, home - 0.15 * u + 0.15 * u * i, floor + 0.85 * u + 0.4 * u * f, 0.05 * u, f > 0 && f < 1 ? 1.4 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

// ---- 牛 ----
function cow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.8 * u;
  const c = createModel('cow', { height: 0.85 * u }), moo = label(u, 'モー', '#6a4a2a');
  const tufts = [0, 1, 2].map(() => createModel('grass', { height: 0.12 * u, tint: { grass: 0x58b848 } }));
  tufts.forEach((g, i) => g.group.position.set(cx - 0.45 * u + 0.12 * u * i, floor, 0.25 * u + 0.05 * u * (i % 2)));
  group.add(c.group, moo, ...tufts.map((g) => g.group));
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 2.0, 'out'], turn: [1.9, 0.4], leave: [5.4, 1.6, 'in'] });
      const walking = !pre && ((T.come > 0 && T.come < 1) || (T.leave > 0 && T.leave < 1));
      if (walking) c.pose('Walk', v); else if (!pre && v > 2.3 && v < 4.0) c.pose('Eating', v - 2.3); else c.pose('Idle', t);
      c.group.position.set(cx + (pre ? 0 : (1 - T.come) * 1.0 * u + T.leave * 1.1 * u), floor, -0.05 * u);
      c.group.rotation.y = pre ? -0.5 : T.leave > 0 ? lerp(-0.5, RIGHT - 0.5, between(v, 5.3, 5.6)) : lerp(LEFT + 0.5, -0.5, T.turn);
      pop(moo, pre ? 0 : between(v, 4.1, 4.4) * (1 - between(v, 5.2, 5.4)), cx - 0.25 * u, floor + 0.95 * u + 0.03 * u * Math.sin(v * 12), 0.2 * u);
    },
  };
}

// ---- 休 ----
function restTree(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.85 * u, sitX = tx - 0.05 * u;
  const tree = createModel('oak', { height: 1.5 * u, tint: { leafsGreen: 0x58b848 } }), man = person('guy', 0.85 * u), head = man.node('Head');
  const zs = ['Z', 'z', 'Z'].map((ch) => textPlane(ch, { h: 0.24 * u, color: '#e8f0ff', weight: 900 }));
  const log = solidProp([[G.cyl(0.11 * u, 0.11 * u, 0.3 * u, 0, 0.11 * u, 0, 0, 0, Math.PI / 2), 0x8a5a30], [G.cyl(0.085 * u, 0.085 * u, 0.302 * u, 0, 0.11 * u, 0, 0, 0, Math.PI / 2), 0xd8b080]], 0.35);
  tree.group.position.set(tx + 0.12 * u, floor, -0.25 * u); log.position.set(sitX, floor - 0.08 * u, -0.07 * u);
  group.add(tree.group, log, man.group, ...zs);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walkIn: [0, 1.8, 'out'], up: [5.4, 1.3, 'linear'], out: [6.4, 1.5, 'in'] });
      const walking = !pre && ((T.walkIn > 0 && T.walkIn < 1) || (T.out > 0 && T.out < 1));
      if (walking) man.pose('Walk', v); else if (!pre && v >= 1.8 && v < 5.4) man.pose('SitDown', v - 1.9, false); else if (!pre && v >= 5.4 && v < 6.4) man.pose('StandUp', v - 5.4, false); else man.pose('Idle', t);
      man.group.position.set(sitX + (1 - T.walkIn) * 1.2 * u + T.out * 1.3 * u, floor, 0.05 * u);
      man.group.rotation.y = pre ? 0 : T.walkIn < 1 ? LEFT + 0.5 : T.out > 0 || v > 6.3 ? (RIGHT - 0.5) * between(v, 6.2, 6.4) : 0;
      const doze = pre ? 0 : between(v, 2.9, 3.3) * (1 - between(v, 5.1, 5.4));
      if (head) head.rotation.x += 0.35 * doze;
      zs.forEach((z, i) => { const f = (v * 0.45 + i / 3) % 1, k = doze * Math.sin(Math.PI * f) * (0.6 + 0.6 * f); pop(z, k, sitX + 0.15 * u + 0.25 * u * f, floor + 0.55 * u + 0.5 * u * f, 0.2 * u); });
    },
  };
}

// ---- 歩 ----
function walker(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, a = B.maxX + 0.5 * u, b = B.maxX + 1.6 * u, z = 0.12 * u, N = 14, step = (b - a) / 7;
  const who = person('gal', 0.85 * u), prints = many([[G.sphere(0.06 * u, 0, 0, 0, 1.5, 0.15, 0.9), 0xf4e8d0]], N, 0.5);
  group.add(who.group, prints);
  const loop = 6.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.2, 2.4, 'linear'], face: [2.7, 0.3], back: [4.0, 2.4, 'linear'] });
      const walking = !pre && ((T.out > 0 && T.out < 1) || (T.back > 0 && T.back < 1));
      if (walking) who.pose('Walk', v); else if (!pre && v > 3.0 && v < 3.9) who.pose('Victory', v - 3.0); else who.pose('Idle', t);
      who.group.position.set(pre ? a : lerp(a, b, T.out - T.back), floor, z);
      who.group.rotation.y = pre ? 0 : T.out < 1 ? (RIGHT - 0.5) * between(v, 0, 0.2) : T.back <= 0 ? (RIGHT - 0.5) * (1 - T.face) : (LEFT + 0.5) * between(v, 3.9, 4.1);
      for (let i = 0; i < N; i++) {
        const back = i >= 7, j = i % 7, px = back ? b - (j + 0.5) * step : a + (j + 0.5) * step, at = back ? 4.0 + 2.4 * (j + 0.5) / 7 : 0.2 + 2.4 * (j + 0.5) / 7;
        const age = pre ? -1 : v - at, on = age > 0 ? Math.max(0, 1 - age / 2.5) : 0;
        prints.set(i, px, floor + 0.003 * u, z + (j % 2 ? 0.05 : -0.05) * u + (back ? 0.12 * u : -0.02 * u), on, 0, back ? Math.PI : 0, 1.0);
      }
      prints.commit();
    },
  };
}

// ---- 女 ----
function kimono(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.6 * u;
  const w = person('kimono', 0.9 * u), petals = many([[G.sphere(0.025 * u, 0, 0, 0, 1, 0.3, 0.7), 0xffb0c8]], 14, 0.8);
  group.add(w.group, petals);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.8, 'out'], front: [1.7, 0.3], twirl: [3.4, 1.4], leave: [5.0, 1.5, 'in'] });
      const walking = !pre && ((T.come > 0 && T.come < 1) || (T.leave > 0 && T.leave < 1));
      if (walking) w.pose('Walk', v); else if (!pre && v > 2.0 && v < 3.4) w.pose('Victory', v - 2.0); else w.pose('Idle', t);
      w.group.position.set(x0 + (1 - T.come) * 1.1 * u + T.leave * 1.2 * u, floor, 0.05 * u);
      w.group.rotation.y = pre ? 0 : T.leave > 0 ? (RIGHT - 0.5) * between(v, 4.9, 5.1) : (LEFT + 0.5) * (1 - T.front) + Math.PI * 2 * T.twirl;
      for (let i = 0; i < 14; i++) { const f = ((t * 0.18 + i / 14) % 1), sx = x0 + ((i * 0.37) % 1 - 0.5) * 1.2 * u + 0.08 * u * Math.sin(t * 2 + i); petals.set(i, sx, floor + 1.3 * u - 1.3 * u * f, -0.1 * u + ((i * 0.53) % 1) * 0.4 * u, pre ? 0 : Math.sin(Math.PI * f), t * 2 + i); }
      petals.commit();
    },
  };
}

// ---- 医者 ----
function doctor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, dx = B.maxX + 1.05 * u;
  const patient = person('guy', 0.75 * u), doc = person('doctor', 0.9 * u);
  const kit = solidProp([[G.box(0.22 * u, 0.16 * u, 0.12 * u, 0, 0.08 * u, 0), 0xffffff], [G.box(0.12 * u, 0.035 * u, 0.125 * u, 0, 0.08 * u, 0), 0xe02020], [G.box(0.035 * u, 0.12 * u, 0.125 * u, 0, 0.08 * u, 0), 0xe02020], [G.box(0.08 * u, 0.025 * u, 0.02 * u, 0, 0.17 * u, 0), 0x404040]], 0.6);
  const cloud = solidProp([[G.sphere(0.07 * u, -0.06 * u, 0, 0), 0x8a94a8], [G.sphere(0.09 * u, 0.03 * u, 0.02 * u, 0), 0x8a94a8], [G.sphere(0.06 * u, 0.11 * u, 0, 0), 0x8a94a8]], 0.4);
  const cross = label(u, '+', '#e02020'), hearts = many(HEART(u, 0.1), 3, 1);
  group.add(patient.group, doc.group, kit, cloud, cross, hearts);
  const loop = 7.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0.4, 1.8, 'out'], put: [2.4, 1.0, 'linear'], leave: [5.8, 1.4, 'in'] });
      // patient: slumped (Defeat) until the kit is down, then jumps up cheering
      if (!pre && v > 3.5 && v < 5.6) patient.pose('Victory', v - 3.5); else patient.pose('Defeat', 1.6, false);
      patient.group.position.set(px, floor, 0.12 * u); patient.group.rotation.y = 0.3;
      const walking = !pre && ((T.come > 0 && T.come < 1) || (T.leave > 0 && T.leave < 1));
      if (walking && T.leave <= 0) doc.pose('Walk_Carry', v); else if (walking) doc.pose('Walk', v); else if (!pre && T.put > 0 && T.put < 1) doc.pose('PickUp', 1.25 * (1 - T.put)); else doc.pose('Idle', t);
      doc.group.position.set(dx + (1 - T.come) * 1.0 * u + T.leave * 1.1 * u, floor, 0.0); doc.group.rotation.y = pre ? -0.4 : T.leave > 0 ? (RIGHT - 0.5) * between(v, 5.7, 5.9) : lerp(LEFT + 0.5, -0.5, between(v, 2.1, 2.4));
      const carried = pre || T.put < 0.6, hx = doc.group.position.x - 0.18 * u;
      kit.position.set(carried ? doc.group.position.x - 0.12 * u : px + 0.3 * u, carried ? floor + 0.38 * u : floor, carried ? 0.15 * u : 0.15 * u); kit.visible = !pre && v < 6.9;
      cloud.visible = !pre && v < 3.5; cloud.position.set(px, floor + 0.95 * u + 0.02 * u * Math.sin(v * 3), 0.1 * u);
      pop(cross, pre ? 0 : between(v, 0.4, 0.7) * (1 - between(v, 5.6, 5.8)), hx, floor + 1.15 * u, 0.1 * u);
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 3.6 + i * 0.35, 4.8 + i * 0.35); hearts.set(i, px - 0.1 * u + 0.12 * u * i, floor + 0.85 * u + 0.4 * u * f, 0.15 * u, f > 0 && f < 1 ? 1.4 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

// ---- 走る ----
function run(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.8 * u, cz = -0.25 * u, R = 0.55 * u;
  const who = person('guy', 0.8 * u), track = solidProp([[G.torus(R, 0.07 * u).rotateX(Math.PI / 2), 0xd8704a], [G.torus(R, 0.006 * u).rotateX(Math.PI / 2).translate(0, 0.004 * u, 0), 0xffffff]], 0.35), dust = many(PUFF(u), 8, 0.3);
  track.position.set(cx, floor, cz); track.rotation.x = 0.35;
  group.add(track, who.group, dust);
  const lap = 3.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, lap), pre = A.u < 0, s = pre ? 0 : A.u, a = (s / lap) * Math.PI * 2;
      const lift = (zz) => (zz - cz) * -Math.sin(0.35);                              // the track is tilted toward you
      const x = cx + Math.sin(a) * R, z = cz + Math.cos(a) * R * Math.cos(0.35);
      if (pre) who.pose('Idle', t); else who.pose('Run', s);
      who.group.position.set(x, floor + lift(z), z); who.group.rotation.y = a + RIGHT;
      for (let i = 0; i < 8; i++) { const age = ((s * 4 + i / 8 * 2) % 2) / 2, b = a - age * 1.2, zz = cz + Math.cos(b) * R * Math.cos(0.35); dust.set(i, cx + Math.sin(b) * R, floor + lift(zz) + 0.05 * u + 0.08 * u * age, zz, pre ? 0 : 1.2 * (1 - age) * Math.min(1, age * 5)); }
      dust.commit();
    },
  };
}

// ---- 座る ----
function sit(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.65 * u, seat = 0.22 * u;
  const W = 0x9a6a3a, chair = solidProp([[G.box(0.36 * u, 0.04 * u, 0.34 * u, 0, seat, 0), W], [G.box(0.36 * u, 0.4 * u, 0.04 * u, 0, seat + 0.2 * u, -0.17 * u), W],
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => [G.box(0.04 * u, seat, 0.04 * u, sx * 0.16 * u, seat / 2, sz * 0.15 * u), 0x7a4a24])], 0.4);
  const who = person('gal', 0.85 * u);
  chair.position.set(cx, floor, -0.1 * u);
  group.add(chair, who.group);
  const loop = 7.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.8, 'out'], down: [2.0, 0.6], rise: [5.0, 0.6], leave: [6.0, 1.4, 'in'] });
      const walking = !pre && ((T.come > 0 && T.come < 1) || (T.leave > 0 && T.leave < 1));
      if (walking) who.pose('Walk', v); else if (!pre && v >= 1.9 && v < 5.0) who.pose('SitDown', v - 1.9, false); else if (!pre && v >= 5.0 && v < 6.0) who.pose('StandUp', v - 5.0, false); else who.pose('Idle', t);
      const onSeat = (T.down - T.rise) * spec.seatLift * u;
      who.group.position.set(cx + (1 - T.come) * 1.1 * u + T.leave * 1.2 * u, floor + onSeat, -0.02 * u + 0.08 * u * (1 - (T.down - T.rise)));
      who.group.rotation.y = pre ? 0 : T.leave > 0 ? (RIGHT - 0.5) * between(v, 5.9, 6.1) : lerp(LEFT + 0.5, 0, between(v, 1.6, 1.9));
    },
  };
}

export const SCENES = {
  'q-dog-fetch': dogFetch, 'q-cow': cow, 'q-rest-tree': restTree, 'q-walker': walker, 'q-kimono': kimono, 'q-doctor': doctor,
  'q-run': run, 'q-sit': sit,
};
