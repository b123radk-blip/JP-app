// Step 1 scenes, part H: out and in, electricity, feet, roads, growing things, the station.
//   turtle-out      出: a turtle shell sits still; out pops its head, then its legs, it takes a few steps and pulls back
//                   in. outcome door: a door opens and a person walks out, waving (出る); hat: a hand taps a top hat with a
//                   wand and a rabbit rises out of it (出す); exit: a green 出口 sign glows over a door and a person runs out
//                   under it (出口)
//   tent-in         入: a little tent; a dog trots up and goes in, the flap drops behind it and the tent wiggles; then the
//                   dog pokes its head out again. outcome house: a person walks into a house, the door shuts, the window
//                   lights (入る); doors: glass doors under an 入口 sign slide open, a person walks in, they close (入り口);
//                   coin: a coin drops into a piggy bank's slot, clink, the pig jiggles (入れる)
//   lightning-bulb  電: two dark clouds; a lightning bolt zaps between them and down into a light bulb on a stand, which
//                   lights up. outcome phone: an old phone rings and hops, sparks running along its cord (電話); bulb: sparks
//                   run along the wires of a power pole into a little house, whose windows light up (電気)
//   electric-train  電車: a train runs along under an overhead wire and back, its pantograph sparking as it goes
//   feet-walk       足: two bare feet walk across beside the kanji, leaving footprints; they stop and wiggle their toes
//   hen-lead        前: a hen walks in front, three chicks behind her in a line; a glowing ring marks the one in front
//   road-unroll     道: a winding road unrolls from your feet over the hills to a far-off house, trees popping up along it
//   sprout-life     生: a seed in a mound of soil cracks, a sprout pushes up, unfolds two leaves and stretches up alive,
//                   wiggling. outcome stork: a stork flies in with a bundle and sets it in a basket; a baby peeks out (生まれる)
//   station-train   駅: a little station with a name board and a clock; a train pulls in along the platform, stops, its
//                   doors light up, then it pulls out
//   flower-bloom    花: a bud on a stem swells and opens its petals one by one into a big flower; a bee buzzes round it
//                   and lands
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { dogParts } from './step1-a.js';
import { crown } from './step1-b.js';
import { doorway, walkOut, hatRabbit, houseIn, autoDoors, piggyCoin, phoneRing, powerHouse, storkBaby } from './step1-hv.js';

// ---- 出 out ----
function turtleOut(ctx, spec, stage) {
  if (spec.outcome === 'door') return walkOut(ctx, spec, stage, false);
  if (spec.outcome === 'exit') return walkOut(ctx, spec, stage, true);
  if (spec.outcome === 'hat') return hatRabbit(ctx, spec, stage);
  const B = stage.box, u = 1.4 * stage.u, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const shell = solidProp([[G.sphere(0.26 * u, 0, 0, 0, 1.2, 0.8, 1), 0x3a8a3a], ...Array.from({ length: 6 }, (_, i) => [G.sphere(0.07 * u, Math.cos(i * 1.05) * 0.16 * u, 0.12 * u, 0.13 * u + Math.sin(i * 1.05) * 0.06 * u, 1, 0.5, 0.6), 0x5aaa4a]), [G.cyl(0.3 * u, 0.3 * u, 0.04 * u, 0, -0.02 * u, 0), 0xc8b060]], 0.4);
  const head = solidProp([[G.sphere(0.09 * u, 0, 0, 0, 1.2, 1, 1), 0x8ac060], [G.sphere(0.02 * u, 0.06 * u, 0.04 * u, 0.06 * u), 0x101010], [G.sphere(0.02 * u, 0.06 * u, 0.04 * u, -0.06 * u), 0x101010]], 0.5), legs = many([[G.sphere(0.06 * u, 0, 0, 0, 1, 0.7, 1), 0x8ac060]], 4, 0.5);
  group.add(shell, head, legs);
  const loop = 6.4, LEG = [[0.2, 0.18], [0.2, -0.18], [-0.2, 0.18], [-0.2, -0.18]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { head: [0.6, 0.4, 'back'], legs: [1.2, 0.4, 'back'], walk: [1.8, 2.0, 'linear'], hide: [4.4, 0.4, 'in'], back: [5.0, 1.0] });
      const x = tx + 0.4 * u * T.walk - 0.4 * u * T.back, walking = T.walk > 0 && T.walk < 1, lift = 0.06 * u * (T.legs - T.hide);
      shell.position.set(x, floor + 0.08 * u + lift + (walking ? 0.01 * u * Math.abs(Math.sin(v * 8)) : 0), 0); shell.rotation.z = walking ? 0.04 * Math.sin(v * 8) : 0.03 * wobble(v, 0.3, 0.5, 6);
      const h = T.head - T.hide; head.visible = h > 0.02; head.position.set(x + (0.18 + 0.16 * h) * u, floor + 0.12 * u + lift + 0.02 * u * Math.sin(v * 3), 0); head.scale.setScalar(grow(h));
      const l = T.legs - T.hide;
      LEG.forEach(([lx, lz], i) => legs.set(i, x + lx * u * (0.8 + 0.3 * l) + (walking ? 0.03 * u * Math.sin(v * 8 + (i % 2 ? Math.PI : 0)) : 0), floor + 0.04 * u, lz * u, grow(l)));
      legs.commit();
    },
  };
}
// ---- 入 in ----
function tentIn(ctx, spec, stage) {
  if (spec.outcome === 'house') return houseIn(ctx, spec, stage);
  if (spec.outcome === 'doors') return autoDoors(ctx, spec, stage);
  if (spec.outcome === 'coin') return piggyCoin(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.5 * u;
  const tri = new THREE.Shape(); tri.moveTo(-0.3, 0); tri.lineTo(0.3, 0); tri.lineTo(0, 0.5); tri.closePath();
  const tent = solidProp([[G.extrude(tri, 0.5).scale(u, u, u), 0xe0703a], [new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-0.13, 0); s.lineTo(0.13, 0); s.lineTo(0, 0.26); s.closePath(); return s; })()).scale(u, u, u).translate(0, 0, 0.29 * u), 0x2a1a10]], 0.4);
  const flap = new THREE.Group(), flapM = solidProp([[new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.14, 0); s.lineTo(0, 0.28); s.closePath(); return s; })()).scale(u, u, u), 0xf0a050]], 0.45);
  flapM.material.side = THREE.DoubleSide; flap.add(flapM); flap.position.set(tx - 0.14 * u, floor, 0.3 * u);
  const dog = new THREE.Group(), { body, legs, tail } = dogParts(0.7 * u), tp = new THREE.Group(); tp.position.set(-0.15 * u, 0.27 * u, 0); tp.add(tail); dog.add(body, legs, tp);
  tent.position.set(tx, floor, 0);
  group.add(tent, dog, flap);
  const loop = 6.4, LEG = [[0.12, 0.15], [0.12, -0.15], [-0.12, 0.15], [-0.12, -0.15]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { trot: [0, 1.4, 'linear'], into: [1.4, 0.6, 'in'], flap: [2.0, 0.3], peek: [4.4, 0.5, 'back'], unpeek: [5.6, 0.5] });
      const inside = T.into > 0.95 && T.peek < 0.05;
      const x = tx + 1.0 * u - 0.75 * u * T.trot, z = 0.4 * u - 0.45 * u * T.into, running = T.trot < 1 || T.into < 1;
      dog.visible = !pre && !inside; dog.position.set(T.peek > 0 ? tx : x - 0.1 * u * T.into, floor, T.peek > 0 ? 0.08 * u + 0.18 * u * (T.peek - T.unpeek) : z);
      dog.rotation.y = T.peek > 0 ? Math.PI / 2 : T.into > 0 ? -Math.PI / 2 * T.into - Math.PI * (1 - T.into) : Math.PI;
      LEG.forEach(([lx, lz], i) => legs.set(i, lx * 0.7 * u, 0.22 * 0.7 * u, lz * 0.7 * u, 1, running && T.peek === 0 ? 0.7 * Math.sin(v * 14 + (i % 2 ? Math.PI : 0)) : 0));
      legs.commit(); tp.rotation.z = 0.4 + 0.6 * Math.sin(t * 16);
      flap.rotation.y = -1.4 * (1 - T.flap) * (pre ? 1 : 1) + (T.peek - T.unpeek) * -1.2;
      tent.rotation.z = 0.04 * wobble(v, 2.3, 1.4, 4); tent.position.x = tx + 0.01 * u * wobble(v, 2.3, 1.4, 4);
    },
  };
}
// ---- 電 lightning ----
const ZIG = (u, pts, r = 0.02) => [G.poly(pts.map(([x, y]) => [x * u, y * u]), r * u), 0xfff060];
function lightningBulb(ctx, spec, stage) {
  if (spec.outcome === 'phone') return phoneRing(ctx, spec, stage);
  if (spec.outcome === 'bulb') return powerHouse(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.55 * u, cy = B.maxY + 0.1 * u;
  const clouds = many([[G.sphere(0.17 * u), 0x5a6070], [G.sphere(0.13 * u, 0.16 * u, -0.03 * u, 0), 0x5a6070], [G.sphere(0.13 * u, -0.16 * u, -0.03 * u, 0), 0x5a6070]], 2, 0.3);
  const across = solidProp([ZIG(u, [[-0.32, 0], [-0.15, 0.06], [-0.05, -0.04], [0.1, 0.05], [0.3, 0]], 0.03)], 1.6), down = solidProp([ZIG(u, [[0, 0], [0.06, -0.15], [-0.04, -0.28], [0.03, -0.42], [0, -0.55]], 0.035)], 1.6);
  const bulb = solidProp([[G.sphere(0.12 * u, 0, 0.2 * u, 0), 0xfff8d0], [G.cyl(0.06 * u, 0.06 * u, 0.08 * u, 0, 0.06 * u, 0), 0xa8acb4], [G.cyl(0.12 * u, 0.14 * u, 0.04 * u, 0, 0.0, 0), 0x404048]], 0.3);
  const glow = solidProp([[G.sphere(0.2 * u), 0xfff080]], 1.2); glow.material.transparent = true;
  bulb.position.set(bx, floor, 0); glow.position.set(bx, floor + 0.2 * u, -0.02 * u); across.position.set(bx, cy, 0); down.position.set(bx + 0.27 * u, cy - 0.02 * u, 0.01 * u);
  clouds.set(0, bx - 0.35 * u, cy, -0.02 * u, 1); clouds.set(1, bx + 0.3 * u, cy + 0.02 * u, -0.02 * u, 1); clouds.commit();
  group.add(clouds, across, down, bulb, glow);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const z1 = pre ? 0 : bump(v, 0.3, 0.4) + bump(v, 0.9, 0.4) + bump(v, 2.6, 0.5), z2 = pre ? 0 : bump(v, 1.4, 0.5) + bump(v, 2.9, 0.6);
      across.visible = z1 > 0.25; down.visible = z2 > 0.25; down.scale.set(1, grow(Math.max(between(v, 1.4, 1.6), between(v, 2.9, 3.1))), 1);
      const lit = pre ? 0 : between(v, 1.6, 1.8) * (1 - between(v, 4.3, 4.8)); glow.visible = lit > 0.01; glow.material.opacity = 0.5 * lit * (0.9 + 0.1 * Math.sin(t * 9)); glow.scale.setScalar(1 + 0.3 * lit);
      bulb.material.userData.glow.value = 0.3 + 1.5 * lit;
      clouds.position.x = 0.01 * u * Math.sin(t * 3) * (z1 + z2);
    },
  };
}
function electricTrain(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u, x1 = B.maxX + 1.25 * u;
  const car = (c) => [[G.box(0.55 * u, 0.24 * u, 0.2 * u, 0, 0.16 * u, 0), c], [G.box(0.55 * u, 0.05 * u, 0.205 * u, 0, 0.1 * u, 0), 0x2a8a4a], ...[-0.17, -0.05, 0.07, 0.19].map((x) => [G.box(0.08 * u, 0.08 * u, 0.21 * u, x * u, 0.2 * u, 0), 0x9ad8ff]), ...[-0.18, 0.18].map((x) => [G.cyl(0.04 * u, 0.04 * u, 0.22 * u, x * u, 0.04 * u, 0, Math.PI / 2), 0x202428])];
  const train = solidProp(car(0xf0f0f0), 0.45);
  const panto = solidProp([[G.poly([[-0.06 * u, 0], [0, 0.12 * u], [0.06 * u, 0]], 0.008 * u), 0x404048], [G.box(0.1 * u, 0.01 * u, 0.02 * u, 0, 0.12 * u, 0), 0x404048]], 0.4);
  const wire = solidProp([[G.box(2.4 * u, 0.008 * u, 0.008 * u, 0, 0, 0), 0x303030], ...[-0.6, 0.6].map((x) => [G.cyl(0.015 * u, 0.015 * u, 0.62 * u, x * u, -0.31 * u, -0.1 * u), 0x6a6a72])], 0.3);
  const rails = solidProp([[G.box(2.4 * u, 0.02 * u, 0.04 * u, 0, 0, 0), 0x8a8a92], [G.box(2.4 * u, 0.025 * u, 0.12 * u, 0, -0.02 * u, 0), 0x5a4030]], 0.3), sparks = many([[G.sphere(0.018 * u), 0x9ae8ff]], 5, 2.0);
  const yWire = floor + 0.52 * u; wire.position.set((x0 + x1) / 2, yWire, -0.02 * u); rails.position.set((x0 + x1) / 2, floor, 0); wire.scale.x = rails.scale.x = 0.6;
  group.add(rails, wire, train, panto, sparks);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0, 2.1) - between(v, 2.6, 4.7), x = x0 + (x1 - x0) * (f * f * (3 - 2 * f));
      train.visible = !pre; train.position.set(x, floor + 0.02 * u + 0.005 * u * Math.sin(t * 20), 0); panto.position.set(x, floor + 0.3 * u, 0); panto.visible = !pre;
      for (let i = 0; i < 5; i++) { const k = ((t * 4 + i * 0.37) % 1); sparks.set(i, x + 0.04 * u * Math.cos(i * 2.1 + k * 6), yWire + 0.04 * u * Math.sin(i * 1.7 + k * 5), 0.01 * u, !pre && f > 0.02 && f < 0.98 && k < 0.5 ? 1.3 : 0); }
      sparks.commit();
    },
  };
}

// ---- 足 feet ----
const FOOT = (u) => [[G.sphere(0.1 * u, 0, 0, 0, 0.75, 0.35, 1.4), 0xffd2b0], ...[[-0.05, 0.13, 0.035], [-0.015, 0.145, 0.03], [0.02, 0.14, 0.027], [0.05, 0.125, 0.024], [0.075, 0.1, 0.022]].map(([x, z, r]) => [G.sphere(r * u, x * u, 0.01 * u, z * u), 0xffd2b0])];
function feetWalk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 1.3 * u, x1 = B.maxX + 0.35 * u;
  const feet = many(FOOT(2.4 * u), 2, 0.45), prints = many([[G.sphere(0.1 * u, 0, 0, 0, 0.75, 0.05, 1.4), 0x8a6a50]], 8, 0.2);
  group.add(prints, feet);
  const loop = 6.0, steps = 6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.1, 3.4), fade = pre ? 1 : between(v, 5.2, 5.8);
      for (let s = 0; s < 2; s++) {
        // each foot steps on its own beat: lift, move forward, put down
        const ph = f * steps / 2 + s * 0.5, k = Math.floor(ph), g = ph - k, x = x0 + (x1 - x0) * Math.min(1, (k + Math.min(1, g * 1.4)) / (steps / 2 + 0.5));
        const lift = f < 1 && f > 0 ? Math.sin(Math.PI * Math.min(1, g * 1.4)) * 0.12 * u : 0, wig = f >= 1 ? 0.15 * Math.sin(t * 12 + s) : 0;
        feet.set(s, x, floor + 0.05 * u + 1.6 * lift, (s ? -0.14 : 0.14) * u + 0.1 * u, grow(1 - fade), wig, -Math.PI / 2, 0.9 - 0.4 * lift / (0.12 * u + 1e-6));
      }
      feet.commit();
      for (let i = 0; i < 8; i++) { const at = (i + 1) / 9, x = x0 + (x1 - x0) * at; prints.set(i, x, floor + 0.003 * u, ((i % 2) ? -0.14 : 0.14) * u + 0.1 * u, f > at ? 1 - fade : 0, 0, -Math.PI / 2, 0.9); }
      prints.commit();
    },
  };
}

// ---- 前 the hen in front ----
const HEN = (u) => [[G.sphere(0.16 * u, 0, 0.18 * u, 0, 1.3, 1, 0.9), 0xfaf6ee], [G.sphere(0.09 * u, 0.15 * u, 0.36 * u, 0), 0xfaf6ee], [G.cone(0.03 * u, 0.07 * u, 0.25 * u, 0.36 * u, 0, -Math.PI / 2), 0xffb030], [G.sphere(0.04 * u, 0.15 * u, 0.47 * u, 0, 1, 0.8, 0.5), 0xe02020], [G.sphere(0.025 * u, 0.22 * u, 0.3 * u, 0, 0.6, 1.2, 0.5), 0xe02020], [G.sphere(0.018 * u, 0.2 * u, 0.39 * u, 0.06 * u), 0x101010], [G.cone(0.07 * u, 0.16 * u, -0.22 * u, 0.26 * u, 0, Math.PI / 2 + 0.7), 0xe8e0d0], [G.cyl(0.012 * u, 0.012 * u, 0.06 * u, 0, 0.03 * u, 0), 0xffb030]];
const CHICK = (u) => [[G.sphere(0.07 * u, 0, 0.08 * u, 0), 0xffe040], [G.sphere(0.05 * u, 0.06 * u, 0.15 * u, 0), 0xffe040], [G.cone(0.015 * u, 0.04 * u, 0.115 * u, 0.15 * u, 0, -Math.PI / 2), 0xff8a20], [G.sphere(0.01 * u, 0.09 * u, 0.17 * u, 0.03 * u), 0x101010]];
function henLead(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const hen = solidProp(HEN(1.2 * u), 0.5), chicks = many(CHICK(1.3 * u), 3, 0.5), ring = solidProp([[G.torus(0.28 * u, 0.015 * u), 0xffe060]], 1.4), front = textPlane('→', { h: 0.18 * u, color: '#ffe060', weight: 900 });
  ring.rotation.x = Math.PI / 2 - 0.4;
  group.add(hen, chicks, ring, front);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0, 4.4), fade = pre ? 1 : between(v, 5.2, 5.8);
      const hx = B.maxX + 0.55 * u + 0.8 * u * f, walking = f > 0 && f < 1;
      hen.position.set(hx, floor + (walking ? 0.015 * u * Math.abs(Math.sin(v * 9)) : 0), 0.05 * u); hen.rotation.z = walking ? 0.08 * Math.sin(v * 9) : 0.1 * Math.sin(v * 4); hen.scale.setScalar(grow(1 - fade));
      for (let i = 0; i < 3; i++) { const x = hx - (0.32 + 0.2 * i) * u; chicks.set(i, x, floor + (walking ? 0.03 * u * Math.abs(Math.sin(v * 12 + i)) : 0), 0.05 * u, grow(1 - fade), walking ? 0.15 * Math.sin(v * 12 + i) : 0); }
      chicks.commit();
      const k = pre ? 0 : between(v, 0.8, 1.2) * (1 - fade); ring.visible = k > 0.01; ring.scale.setScalar(grow(k) * (1 + 0.06 * Math.sin(t * 5))); ring.position.set(hx + 0.02 * u, floor + 0.02 * u, 0.05 * u);
      front.visible = k > 0.01; front.scale.setScalar(grow(k)); front.position.set(hx + 0.38 * u, floor + 0.45 * u + 0.02 * u * Math.sin(t * 5), 0.05 * u);
    },
  };
}

// ---- 道 a road ----
const M4 = new THREE.Matrix4(), V3 = new THREE.Vector3(), S3 = new THREE.Vector3(), Q0 = new THREE.Quaternion();
function roadUnroll(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u;
  // the road's centre line from your feet (near, wide, low) to the far house (small, high), winding
  const N = 40, C = (f) => [x0 + 0.25 * u + 0.3 * u * Math.sin(f * 6) * (1 - f) + 0.45 * u * f, floor - 0.08 * u + 0.9 * u * Math.pow(f, 0.8)], W = (f) => (0.34 - 0.3 * f) * u;
  const slabs = many([[G.box(1, 0.06 * u, 0.01 * u, 0, 0, 0), 0x8a7a68]], N, 0.3), dashes = many([[G.box(0.02 * u, 0.03 * u, 0.012 * u, 0, 0, 0), 0xffffff]], N / 2, 0.6);
  const hills = solidProp([[G.sphere(0.6 * u, 0, 0, 0, 1.4, 0.55, 0.2), 0x4a9a4a], [G.sphere(0.45 * u, 0.6 * u, 0.1 * u, -0.01 * u, 1.3, 0.6, 0.2), 0x3a8a3a]], 0.25);
  const house = solidProp([[G.box(0.14 * u, 0.1 * u, 0.1 * u, 0, 0.05 * u, 0), 0xf0e0c0], [G.cone(0.11 * u, 0.08 * u, 0, 0.14 * u, 0), 0xc04a3a]], 0.5), trees = crown(0.5 * u, 6, [0x2e8a3a, 0x3aa040]);
  hills.position.set(x0 + 0.5 * u, floor + 0.2 * u, -0.45 * u);
  group.add(hills, slabs, dashes, house, trees);
  const loop = 6.0, TR = [0.15, 0.3, 0.45, 0.6, 0.72, 0.85];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, g = pre ? 0 : between(v, 0.1, 2.8) * (1 - between(v, 5.3, 5.9));
      for (let i = 0; i < N; i++) { const f = i / (N - 1), [x, y] = C(f), on = f <= g; slabs.setMatrixAt(i, M4.compose(V3.set(x, y, -0.3 * u), Q0, S3.set(on ? 2 * W(f) : 1e-4, 1, 1))); if (i % 2 === 0) dashes.set(i / 2, x, y + 0.001 * u, -0.29 * u, on ? 1 - 0.7 * f : 0); }
      slabs.commit(); dashes.commit();
      const [hx, hy] = C(1); house.position.set(hx, hy, -0.31 * u); house.scale.setScalar(grow(between(g, 0.9, 1)));
      TR.forEach((f, i) => { const [x, y] = C(f), s = i % 2 ? 1 : -1; trees.set(i, x + s * (W(f) + 0.06 * u), y + 0.1 * u * (1 - f * 0.6), -0.32 * u, grow(between(g, f, f + 0.1)) * (1 - 0.6 * f)); });
      trees.commit();
    },
  };
}

// ---- 生 a sprout ----
function sproutLife(ctx, spec, stage) {
  if (spec.outcome === 'stork') return storkBaby(ctx, spec, stage);
  const u = 1.35 * stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.5 * u;
  const mound = solidProp([[G.sphere(0.3 * u, 0, 0, 0, 1.3, 0.35, 0.8), 0x7a5230]], 0.3), seed = solidProp([[G.sphere(0.05 * u, 0, 0, 0, 1.2, 0.8, 0.8), 0xc89a50]], 0.5);
  const stem = solidProp([[G.cyl(0.018 * u, 0.022 * u, 1, 0, 0.5, 0), 0x50b040]], 0.5), leaves = many([[G.sphere(0.1 * u, 0.09 * u, 0, 0, 1.2, 0.35, 0.6), 0x58c048]], 2, 0.6), face = solidProp([[G.sphere(0.015 * u, -0.03 * u, 0, 0), 0x101010], [G.sphere(0.015 * u, 0.03 * u, 0, 0), 0x101010], [G.torus(0.025 * u, 0.006 * u, Math.PI, 0, -0.025 * u, 0, Math.PI), 0x101010]], 0.4);
  mound.position.set(sx, floor, -0.02 * u);
  group.add(mound, seed, stem, leaves, face);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { crack: [0.2, 0.4], sprout: [0.6, 1.2, 'out'], leaves: [1.6, 0.6, 'back'], grow: [2.4, 1.2, 'out'], back: [5.6, 0.9] });
      const h = pre ? 0 : (0.25 * T.sprout + 0.3 * T.grow) * u * (1 - T.back), sway = 0.12 * Math.sin(t * 3) * T.grow;
      seed.visible = !pre && T.sprout < 0.3; seed.position.set(sx, floor + 0.09 * u, 0.06 * u); seed.rotation.z = 0.4 * Math.sin(v * 30) * (T.crack > 0 && T.crack < 1 ? 1 : 0);
      stem.visible = h > 0.005 * u; stem.position.set(sx, floor + 0.08 * u, 0.04 * u); stem.scale.set(1, Math.max(1e-3, h), 1); stem.rotation.z = sway;
      const tx = sx - Math.sin(sway) * h, ty = floor + 0.08 * u + Math.cos(sway) * h, k = T.leaves * (1 - T.back);
      leaves.set(0, tx, ty - 0.02 * u, 0.04 * u, grow(k), 0.4 + 0.2 * Math.sin(t * 4)); leaves.set(1, tx, ty - 0.02 * u, 0.04 * u, grow(k), Math.PI - 0.4 - 0.2 * Math.sin(t * 4)); leaves.commit();
      face.visible = T.grow > 0.5 && T.back < 0.5; face.position.set(tx, ty - 0.08 * u, 0.065 * u);
    },
  };
}
// ---- 駅 a station ----
function stationTrain(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u;
  const platform = solidProp([[G.box(1.3 * u, 0.08 * u, 0.25 * u, 0, 0.04 * u, 0.18 * u), 0xb8b0a0], [G.box(1.3 * u, 0.012 * u, 0.04 * u, 0, 0.085 * u, 0.06 * u), 0xffd040], ...[-0.5, 0.5].map((x) => [G.cyl(0.02 * u, 0.02 * u, 0.6 * u, x * u, 0.38 * u, 0.25 * u), 0x6a6a72]), [G.box(1.3 * u, 0.04 * u, 0.32 * u, 0, 0.7 * u, 0.2 * u), 0x4a6a8a]], 0.4);
  const board = textPlane('えき', { h: 0.14 * u, color: '#202838', bg: '#ffffff', pad: 0.4 }), clock = solidProp([[G.cyl(0.08 * u, 0.08 * u, 0.02 * u, 0, 0, 0, Math.PI / 2), 0xffffff], [G.torus(0.08 * u, 0.01 * u), 0x303030], [G.box(0.01 * u, 0.06 * u, 0.01 * u, 0, 0.03 * u, 0.012 * u), 0x101010], [G.box(0.04 * u, 0.01 * u, 0.01 * u, 0.02 * u, 0, 0.012 * u), 0x101010]], 0.5);
  const car = [[G.box(0.6 * u, 0.3 * u, 0.2 * u, 0, 0.2 * u, 0), 0x3a9a5a], [G.box(0.6 * u, 0.06 * u, 0.205 * u, 0, 0.1 * u, 0), 0xf0f0f0], ...[-0.18, 0.0, 0.18].map((x) => [G.box(0.1 * u, 0.12 * u, 0.205 * u, x * u, 0.24 * u, 0), 0x9ad8ff])];
  const train = solidProp([...car, ...car.map(([g, c]) => [g.clone().translate(-0.63 * u, 0, 0), c])], 0.45), doors = many([[G.box(0.08 * u, 0.2 * u, 0.01 * u), 0xfff0a0]], 4, 1.5);
  platform.position.set(sx, floor, -0.05 * u); board.position.set(sx + 0.2 * u, floor + 0.58 * u, 0.16 * u); clock.position.set(sx - 0.25 * u, floor + 0.58 * u, 0.16 * u);
  group.add(train, doors, platform, board, clock);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0.1, 1.8, 'out'], open: [2.1, 0.3], close: [3.9, 0.3], out: [4.3, 1.6, 'in'] });
      const x = sx + 0.3 * u + 1.6 * u * (1 - T.in) - 1.8 * u * T.out;
      train.visible = !pre; train.position.set(x, floor + 0.02 * u, -0.18 * u);
      const o = T.open - T.close; [-0.27, 0.27, -0.9, -0.36].forEach((dx, i) => doors.set(i, x + dx * u, floor + 0.2 * u, -0.07 * u, o > 0.02 ? o : 0)); doors.commit();
    },
  };
}

// ---- 花 a flower ----
function flowerBloom(ctx, spec, stage) {
  const u = 1.4 * stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.35 * u, top = floor + 0.7 * u;
  const stem = solidProp([[G.cyl(0.018 * u, 0.024 * u, 0.7 * u, 0, 0.35 * u, 0), 0x40a040], [G.sphere(0.07 * u, 0.06 * u, 0.25 * u, 0, 1.4, 0.35, 0.6), 0x50b848], [G.sphere(0.07 * u, -0.06 * u, 0.38 * u, 0, 1.4, 0.35, 0.6), 0x50b848]], 0.4);
  const petals = many([[G.sphere(0.1 * u, 0, 0.09 * u, 0, 0.7, 1.1, 0.3), 0xff6aa0]], 6, 0.6), centre = solidProp([[G.sphere(0.07 * u), 0xffd030]], 0.8), bud = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1, 1.4, 1), 0xff6aa0], [G.cone(0.05 * u, 0.06 * u, 0, -0.07 * u, 0, Math.PI), 0x40a040]], 0.5);
  const bee = solidProp([[G.sphere(0.05 * u, 0, 0, 0, 1.4, 1, 1), 0xffd030], [G.box(0.02 * u, 0.1 * u, 0.1 * u, 0, 0, 0), 0x202020], [G.box(0.02 * u, 0.1 * u, 0.1 * u, -0.035 * u, 0, 0), 0x202020], [G.sphere(0.04 * u, 0, 0.05 * u, 0, 1, 0.3, 1.4), 0xe0f4ff]], 0.6);
  stem.position.set(fx, floor, 0); group.add(stem, bud, petals, centre, bee);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { swell: [0, 0.8], close: [5.8, 0.6] });
      bud.visible = !pre && v < 1.2 || T.close > 0.5; bud.position.set(fx, top + 0.04 * u, 0.02 * u); bud.scale.setScalar(grow(pre ? 0.6 : 0.6 + 0.4 * T.swell));
      let open = 0;
      for (let i = 0; i < 6; i++) { const k = pre ? 0 : between(v, 0.9 + 0.2 * i, 1.4 + 0.2 * i) * (1 - T.close); open += k / 6; petals.set(i, fx, top, 0.0, grow(k) * (1 + 0.04 * Math.sin(t * 2 + i)), i * Math.PI / 3, 0, (1 - k) * 1.2); }
      petals.commit();
      centre.visible = open > 0.3; centre.position.set(fx, top, 0.03 * u); centre.scale.setScalar(grow(open));
      const b = pre ? 0 : between(v, 2.3, 4.6), a = b * Math.PI * 3, land = between(v, 4.0, 4.6);
      bee.visible = b > 0 && v < 5.6; bee.position.set(fx + Math.cos(a) * 0.35 * u * (1 - land), top + 0.1 * u + Math.sin(a * 1.3) * 0.15 * u * (1 - land) + 0.02 * u * Math.sin(t * 30) * (1 - land), 0.1 * u); bee.rotation.y = -a;
    },
  };
}

export const SCENES = { 'turtle-out': turtleOut, 'tent-in': tentIn, 'lightning-bulb': lightningBulb, 'electric-train': electricTrain, 'feet-walk': feetWalk, 'hen-lead': henLead, 'road-unroll': roadUnroll, 'sprout-life': sproutLife, 'station-train': stationTrain, 'flower-bloom': flowerBloom };
