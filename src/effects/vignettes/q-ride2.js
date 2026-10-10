// Model scenes, trains, stopping and places (Step 3a model pass, batch 5).
//   q-train-arrive 着く: a train glides into the station and stops at the platform; its doors slide open, a woman steps
//                  out onto the platform, turns and waves: ついた!; she walks off, the doors shut and the train pulls out
//   q-subway-cut   地下鉄: the street is cut open like a cake: a man walks along the road on top while a train rattles
//                  through the tunnel underneath (ガタンゴトン); he stops, looks down at his feet, and walks on
//   q-stop-sign    止: a man runs up to a 止まれ sign and skids to a stop, arms windmilling, dust flying (!), stands, nods
//                  and walks back; outcome car: a car drives up the street, brakes hard at the stop line (キキーッ), waits,
//                  then turns into the side street and drives away (止まる)
//   q-pin-drop     所: a giant map pin drops out of the sky onto a little map and sticks in; rings pulse out from it; a
//                  woman runs over to the spot, jumps and waves: ここ!
// (q-ride3.js holds the doors, rides and rest scenes of the same batch; its SCENES are merged in here.)
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp, pin } from '../pieces/kit-props.js';
import { createModel } from '../models.js';
import { between, puffs } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person } from './q-common.js';
import { SCENES as MORE } from './q-ride3.js';

const W = new THREE.Vector3();
// a box that hides what is behind it without drawing (the train beyond the tunnel's ends); 1 draw call
export function maskBoxes(list) {
  const m = solidProp(list.map((g) => [g, 0]), 0);
  m.material = new THREE.MeshBasicMaterial({ colorWrite: false }); m.renderOrder = -1;
  return m;
}

// ---- 着く ----
function trainArrive(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, h = 1.1 * u, k = h / 2.22, len = 2.7 * k;
  const cx = B.maxX + 0.3 * u + len / 2, tz = -0.15 * u - 0.68 * k, dx = cx - 0.18 * u, far = 3.4 * u, lo = floor - 0.17 * u;
  const train = createModel('tramCar', { height: h }), wheels = ['wheels-front', 'wheels-back'].map(train.node);
  const p = person(spec.who, u, 0.8), hi = label(u, 'ついた!', '#e0782a', 0.15);
  const x0 = B.maxX + 0.1 * u, x1 = B.maxX + 3.4 * u;
  const platform = solidProp([[G.box(x1 - x0, 0.17 * u, 0.75 * u, (x0 + x1) / 2, -0.085 * u, 0.22 * u), 0xc8c4bc], [G.box(x1 - x0, 0.005 * u, 0.05 * u, (x0 + x1) / 2, 0.001 * u, -0.06 * u), 0xffd040],
    [G.box(x1 - x0, 0.03 * u, 0.6 * u, (x0 + x1) / 2, -0.185 * u, tz), 0x6a5a4a], ...[-0.22, 0.22].map((z) => [G.box(x1 - x0, 0.025 * u, 0.025 * u, (x0 + x1) / 2, -0.16 * u, tz + z * u), 0xa8b0bc])], 0.3);
  platform.position.set(0, floor, 0);
  const dh = 0.62 * u, gap = solidProp([[G.box(0.24 * u, dh, 0.01 * u, 0, dh / 2, 0), 0x1a2028]], 0.2), leaves = many([[G.box(0.12 * u, dh, 0.014 * u, 0, dh / 2, 0), 0xd8dce4], [G.box(0.07 * u, 0.22 * u, 0.016 * u, 0, dh * 0.65, 0), 0x9ad0f0]], 2, 0.4);
  gap.position.set(dx, floor, tz + 0.66 * k);
  group.add(platform, train.group, gap, leaves, p.group, hi);
  const loop = 10.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 2.6, 'out'], open: [2.8, 0.4], out: [3.2, 0.9, 'linear'], face: [4.1, 0.4], off: [6.4, 1.8, 'linear'], shut: [7.6, 0.4], go: [8.0, 2.0, 'in'] });
      const x = pre ? cx : cx + far * (1 - T.come) + far * T.go;
      train.group.position.set(x, lo, tz); train.group.rotation.y = LEFT;
      wheels.forEach((w) => w && (w.rotation.x = (x - cx) / (0.25 * k)));
      const o = pre ? 0 : T.open * (1 - T.shut);
      gap.visible = o > 0.02; gap.scale.x = Math.max(0.01, o);
      for (let i = 0; i < 2; i++) leaves.set(i, dx + (i ? 1 : -1) * (0.06 * u + 0.12 * u * o), floor, tz + 0.66 * k + 0.01 * u, x === cx || pre ? 1 : 0);
      leaves.commit();
      // she steps out of the door onto the platform, turns to you and waves; then walks off along the platform
      const inside = !pre && v < 3.2;
      p.group.visible = !inside && !(v > 8.2);
      const wk = (T.out > 0 && T.out < 1) || (T.off > 0 && T.off < 1);
      p.pose(wk ? 'Walk' : 'Idle', wk ? v : t);
      p.group.position.set(lerp(dx, x1 - 0.1 * u, T.off), floor, pre ? 0.2 * u : lerp(tz, 0.2 * u, T.out));
      p.group.rotation.y = T.off > 0 ? RIGHT : lerp(0, -0.2, T.face);
      const wave = pre ? 0 : between(v, 4.3, 4.6) * (1 - between(v, 6.0, 6.3));
      p.wave('R', wave, v);
      pop(hi, wave, dx + 0.45 * u, floor + 0.85 * u, 0.3 * u);
    },
  };
}

// ---- 地下鉄 ----
function subway(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u, x1 = B.maxX + 2.0 * u, top = 0.58 * u, th = 0.46 * u, zt = -0.26 * u;
  const earth = 0x8a5a34, dk = 0x6a4428, ins = 0x30343c;
  const block = solidProp([
    [G.box(x1 - x0, top - th, 0.6 * u, (x0 + x1) / 2, (th + top) / 2, -0.3 * u), earth], [G.box(x1 - x0, 0.12 * u, 0.6 * u, (x0 + x1) / 2, -0.06 * u, -0.3 * u), earth],
    [G.box(0.12 * u, th, 0.6 * u, x0 + 0.06 * u, th / 2, -0.3 * u), earth], [G.box(0.12 * u, th, 0.6 * u, x1 - 0.06 * u, th / 2, -0.3 * u), earth],
    [G.box(x1 - x0, th, 0.02 * u, (x0 + x1) / 2, th / 2, -0.59 * u), ins], [G.box(x1 - x0 - 0.24 * u, 0.02 * u, 0.5 * u, (x0 + x1) / 2, 0.01 * u, -0.3 * u), 0x50545c],
    [G.box(x1 - x0, 0.03 * u, 0.62 * u, (x0 + x1) / 2, top + 0.015 * u, -0.3 * u), 0x60646c], [G.box(x1 - x0, 0.035 * u, 0.04 * u, (x0 + x1) / 2, top + 0.02 * u, 0.0), 0x4a9a3a],
    ...[0, 1, 2, 3, 4].map((i) => [G.box(0.16 * u, 0.034 * u, 0.025 * u, x0 + (i + 0.5) * (x1 - x0) / 5, top + 0.018 * u, -0.3 * u), 0xf4f0e0]),
    ...[0, 1, 2, 3, 4, 5].map((i) => [G.sphere(0.022 * u, x0 + 0.2 * u + i * (x1 - x0 - 0.4 * u) / 5, th - 0.03 * u, -0.55 * u), 0xffe9a0]),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => [G.sphere(0.03 * u, x0 + (i + 0.5) * (x1 - x0) / 7, top * (0.15 + 0.5 * ((i * 0.37) % 1)), 0.005 * u, 1.3, 1, 0.3), dk])], 0.35);
  block.position.set(0, floor, 0);
  const h = 0.43 * u, k = h / 2.22, len = 2.7 * k * 1.25, cars = [0, 1].map(() => createModel('tramCar', { height: h }));
  cars.forEach((c) => { c.group.scale.z = 1.25; });
  const mask = maskBoxes([G.box(3 * len, th, 0.02 * u, x1 + 1.5 * len, th / 2, -0.05 * u), G.box(3 * len, th, 0.02 * u, x0 - 1.5 * len, th / 2, -0.05 * u)]);
  mask.position.set(0, floor, 0);
  const p = person(spec.who, u, 0.8), sound = label(u, 'ガタンゴトン', '#3a4a6a', 0.11);
  group.add(block, ...cars.map((c) => c.group), mask, p.group, sound);
  const loop = 8.0, span = x1 - x0 + 2.2 * len;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // the train runs right to left under the street, then left to right
      const back = v >= 4.0, f = pre ? 0.5 : between(back ? v - 4.0 : v, 0.3, 3.3), dir = back ? 1 : -1;
      const head = back ? x0 - len + span * f : x1 + len - span * f;
      cars.forEach((c, i) => { c.group.position.set(head - dir * (i + 0.5) * len * 1.02, floor + 0.005 * u, zt); c.group.rotation.y = back ? RIGHT : LEFT; c.group.visible = !pre || i === 0; });
      const under = f > 0.25 && f < 0.75;
      pop(sound, !pre && under ? 1 : 0, (x0 + x1) / 2, floor + (th + top) / 2 + 0.005 * u * Math.sin(v * 30), 0.02 * u);
      // he walks along the street over it, stops when it rumbles under him and looks down, then walks on
      const T = timeline(v, { a: [0.0, 1.6, 'linear'], b: [2.6, 1.4, 'linear'], c: [4.0, 1.6, 'linear'], d: [6.6, 1.4, 'linear'] });
      const xa = x0 + 0.25 * u, xm = (x0 + x1) / 2, xb = x1 - 0.25 * u;
      const px = pre ? xm : v < 4.0 ? lerp(lerp(xa, xm, T.a), xb, T.b) : lerp(lerp(xb, xm, T.c), xa, T.d);
      const walking = !pre && ((T.a > 0 && T.a < 1) || (T.b > 0 && T.b < 1) || (T.c > 0 && T.c < 1) || (T.d > 0 && T.d < 1));
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(px, floor + top + 0.03 * u, -0.25 * u); p.group.rotation.y = v < 4.0 ? RIGHT - 0.4 : LEFT + 0.4;
      const look = pre ? 0 : bump(v, 1.6, 1.0) + bump(v, 5.6, 1.0);
      p.group.rotation.y = lerp(p.group.rotation.y, 0, look); p.turn('Head', 0.6 * look); p.turn('Abdomen', 0.2 * look);
      p.handTo('R', p.local(-0.3, 0.5, 0.15, W), look, { out: 0.8, down: 0.6 }); p.handTo('L', p.local(0.3, 0.5, 0.15, W), look, { out: 0.8, down: 0.6 });
    },
  };
}

// ---- 止 / 止まる ----
function stopSign(ctx, spec, stage) {
  if (spec.outcome === 'car') return stopCar(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.4 * u, lx = sx + 0.3 * u, far = B.maxX + 3.0 * u;
  const sign = emblemProp('stop', 0.75 * u), p = person(spec.who, u), dust = many(PUFF(u), 6, 0.4), bang = label(u, '!', '#e03030', 0.22);
  const line = solidProp([[G.box(0.06 * u, 0.008 * u, 0.6 * u, 0, 0.004 * u, 0), 0xf4f4f4]], 0.6);
  sign.position.set(sx, floor + 0.5 * u, -0.1 * u); line.position.set(lx, floor, 0.1 * u);
  group.add(sign, line, p.group, dust, bang);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      sign.idle(0);
      // he runs in from the right, skids to a stop at the line (arms windmilling, dust), stands, nods, walks back
      const T = timeline(v, { run: [0, 1.2, 'linear'], skid: [1.2, 0.5, 'out'], nod: [2.6, 0.8], back: [4.6, 2.0, 'linear'] });
      const x = pre ? lx + 0.12 * u : lerp(lerp(far, lx + 0.45 * u, T.run), lx + 0.12 * u, T.skid) + (far - lx) * T.back;
      const running = !pre && T.run < 1, walking = T.back > 0 && T.back < 1;
      p.pose(running ? 'Run' : walking ? 'Walk' : 'Idle', running || walking ? v : t);
      p.group.position.set(x, floor, 0.12 * u); p.group.rotation.y = walking ? RIGHT : running ? LEFT : LEFT + lerp(0, 0.9, between(v, 2.0, 2.4));
      const sk = pre ? 0 : T.skid * (1 - between(v, 1.8, 2.2)), wind = pre ? 0 : bump(v, 1.15, 1.0);
      p.turn('Abdomen', -0.35 * sk); p.turn('Hips', 0, 0, 0);
      p.handTo('R', p.local(-0.35 - 0.12 * Math.cos(v * 14), 0.75 + 0.15 * Math.sin(v * 14), 0.05, W), wind, { out: 0.9, down: 0.3 });
      p.handTo('L', p.local(0.35 + 0.12 * Math.cos(v * 14 + 2), 0.75 + 0.15 * Math.sin(v * 14 + 2), 0.05, W), wind, { out: 0.9, down: 0.3 });
      p.nod(pre ? 0 : bump(v, 2.6, 0.9), v);
      puffs(dust, 0, 6, x + 0.1 * u, floor, pre ? 0 : between(v, 1.2, 2.0), u, 0.3); dust.commit();
      pop(bang, pre ? 0 : bump(v, 1.3, 1.2) > 0.2 ? 1 : 0, x, floor + 1.05 * u, 0.15 * u);
    },
  };
}
function stopCar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.4 * u, R = 0.5 * u, xs = B.maxX + 1.4 * u, far = 3.0 * u;
  const car = createModel('sedan', { height: 0.48 * u }), ck = 0.48 * u / 1.3, cl = 2.55 * ck, wheels = ['wheel-front-left', 'wheel-front-right', 'wheel-back-left', 'wheel-back-right'].map(car.node);
  const sign = emblemProp('stop', 0.75 * u), skid = label(u, 'キキーッ!', '#e03030', 0.13), smoke = many(PUFF(u, 0xe8e8e8), 5, 0.5);
  const xl = xs - cl / 2 - 0.05 * u, road = solidProp([[G.box(far + 1.2 * u, 0.01 * u, 0.6 * u, sx + (far + 1.2 * u) / 2 - 0.3 * u, 0, 0), 0x50545c], [G.box(0.6 * u, 0.01 * u, 5 * u, xs - cl / 2 - R, 0, -2.8 * u), 0x50545c],
    [G.box(0.05 * u, 0.012 * u, 0.55 * u, xl, 0.001 * u, 0), 0xf4f4f4], ...[0, 1, 2, 3].map((i) => [G.box(0.18 * u, 0.012 * u, 0.03 * u, xs + 0.2 * u + i * 0.5 * u, 0.001 * u, 0), 0xf4f0e0])], 0.3);
  road.position.set(0, floor, 0); sign.position.set(xl - 0.12 * u, floor + 0.5 * u, 0.42 * u);
  group.add(road, car.group, sign, skid, smoke);
  const loop = 7.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      sign.idle(0);
      // it drives in from the right and brakes hard at the line; waits; turns right into the side street, away
      const T = timeline(v, { come: [0, 1.8, 'out'], turn: [3.6, 1.0, 'in'], away: [4.6, 1.6, 'linear'] });
      const al = T.turn * Math.PI / 2, ins = pre ? 0 : T.come;
      const x = T.turn > 0 ? xs - R * Math.sin(al) : lerp(xs + far, xs, ins), z = T.turn > 0 ? -R + R * Math.cos(al) - 4 * u * T.away : 0;
      car.group.position.set(x - (T.turn > 0 ? 0 : 0), floor, z); car.group.rotation.set(0, LEFT - al, 0);
      const dip = pre ? 0 : bump(v, 1.4, 0.7);
      car.group.rotation.z = 0.07 * dip;
      car.group.visible = T.away < 0.98;
      const roll = (pre ? 0 : (far * ins + R * al + 4 * u * T.away)) / (0.3 * ck);
      wheels.forEach((w) => w && (w.rotation.x = roll));
      const s = pre ? 0 : between(v, 1.0, 2.2);
      for (let i = 0; i < 5; i++) smoke.set(i, xs + cl * 0.35 + 0.1 * u * i * s, floor + 0.05 * u + 0.08 * u * s * (i % 2), 0.1 * u + 0.05 * u * (i - 2), s > 0 && s < 1 ? 1.3 * Math.sin(Math.PI * s) : 0);
      smoke.commit();
      pop(skid, pre ? 0 : bump(v, 1.1, 1.4) > 0.2 ? 1 : 0, xs + 0.1 * u, floor + 0.85 * u, 0.2 * u);
    },
  };
}

// ---- 所 ----
function pinDrop(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.55 * u, home = B.maxX + 1.9 * u;
  const mark = pin(2.2 * u), p = person(spec.who, u), here = label(u, 'ここ!', '#e03838', 0.16), dust = many(PUFF(u), 6, 0.4);
  const rings = many([[G.torus(0.2 * u, 0.014 * u).rotateX(Math.PI / 2), 0xff5050]], 3, 1.0);
  const map = solidProp([[G.box(0.9 * u, 0.01 * u, 0.6 * u, 0, 0, 0), 0xcfe8b0], [G.box(0.9 * u, 0.012 * u, 0.05 * u, 0, 0.001 * u, 0.1 * u), 0xf4f0e0], [G.box(0.05 * u, 0.012 * u, 0.6 * u, -0.2 * u, 0.001 * u, 0), 0xf4f0e0],
    [G.box(0.18 * u, 0.012 * u, 0.15 * u, 0.25 * u, 0.002 * u, -0.12 * u), 0x8ac0f0], [G.box(0.12 * u, 0.04 * u, 0.1 * u, -0.33 * u, 0.02 * u, -0.15 * u), 0xe0a060], [G.box(0.04 * u, 0.012 * u, 0.6 * u, 0.12 * u, 0.001 * u, 0), 0xf4f0e0]], 0.35);
  map.position.set(xs + 0.1 * u, floor, 0.05 * u); map.rotation.x = 0.3;
  group.add(map, mark, rings, dust, p.group, here);
  const loop = 7.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fall: [0.2, 0.55, 'in'], run: [1.4, 1.1, 'linear'], up: [5.6, 0.6, 'in'], back: [5.8, 1.6, 'linear'] });
      const y = pre ? 0 : 2.2 * u * (1 - T.fall) + 3 * u * T.up;
      mark.position.set(xs, floor + y - 0.03 * u, 0.05 * u); mark.rotation.z = 0.12 * wobble(v, 0.75, 0.8, 3); mark.visible = pre || (v > 0.2 && T.up < 0.95);
      for (let i = 0; i < 3; i++) { const f = pre ? -1 : (v - 0.75 - i * 0.4) % 1.2 / 1.2; rings.set(i, xs, floor + 0.012 * u, 0.05 * u, !pre && v > 0.75 && v < 5.4 && f > 0 ? 0.4 + 1.8 * f : 0); }
      rings.commit();
      puffs(dust, 0, 6, xs, floor, pre ? 0 : between(v, 0.75, 1.5), u, 0.4); dust.commit();
      // she runs over from the right to the spot, jumps and waves; later strolls back
      const x = pre ? xs + 0.28 * u : lerp(lerp(home, xs + 0.28 * u, T.run), home, T.back);
      const running = !pre && T.run > 0 && T.run < 1, walking = T.back > 0 && T.back < 1, at = !pre && T.run >= 1 && T.back === 0;
      const hop = at ? bump(v, 2.7, 0.6) + bump(v, 3.5, 0.6) : 0;
      p.pose(running ? 'Run' : walking ? 'Walk' : 'Idle', running || walking ? v : t);
      p.group.position.set(x, floor + 0.12 * u * hop, 0.2 * u); p.group.rotation.y = running ? LEFT : walking ? RIGHT : at ? lerp(LEFT, -0.3, between(v, 2.5, 2.8)) : -0.3;
      p.wave('L', at ? between(v, 2.6, 2.9) * (1 - between(v, 5.2, 5.5)) : 0, v);
      pop(here, at ? between(v, 2.6, 2.9) * (1 - between(v, 5.2, 5.5)) : 0, x + 0.42 * u, floor + 0.8 * u, 0.25 * u);
    },
  };
}

export const SCENES = { 'q-train-arrive': trainArrive, 'q-subway-cut': subway, 'q-stop-sign': stopSign, 'q-pin-drop': pinDrop, ...MORE };
