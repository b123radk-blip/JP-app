// Model scenes, part A (the Kenney trial): the Step 1 scenes of 犬 三 休 車 電車 魚 歩 大きい redone with glTF models
// (effects/models.js) instead of shapes. Models face +z (the viewer); yaw π/2 turns them to walk right. Each one is posed
// from its own animation clips at time t (idle, walk, run, sit, dance ...), so every frame is still a pure function of t.
//   m-dog-fetch     犬: a dog waits; a ball bounces past, the dog runs after it, brings it back in its mouth, drops it, dances
//   m-three-chicks  三: three chicks walk up and turn to you; each cheers in turn under a badge 1, 2, 3 while its stroke hops
//   m-rest-tree     休: a walker comes up to a tree, sits down against it and dozes, Zzz, then gets up and walks on
//   m-car-beep      車: a car drives up out of the distance, parks beside the kanji, beeps twice with its lights, backs away
//   m-tram          電車: a tram rolls in along its track under the wire, sparks at the pantograph, and rolls back
//   m-fish-leap     魚: a fish leaps out of a pond in an arc, splashes down, and leaps back the other way
//   m-walker        歩: a person walks along beside the kanji leaving footprints, turns, nods and walks back
//   m-elephant      大きい: an elephant grows huge beside a tiny chick, trumpets パオーン; the chick jumps, "!"
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many, ball, PUFF, HEART, DROP } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, puffs } from './helpers.js';
import { grow, seeded } from './step1-kit.js';

const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2;
const lerp = (a, b, f) => a + (b - a) * f;

// ---- 犬 ----
function dogFetch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, home = B.maxX + 0.45 * u, far = B.maxX + 1.3 * u, h = 0.75 * u;
  const dog = createModel('dog', { height: h }), toy = ball(u, { r: 0.07, color: 0x40c0ff, stripe: 0xffffff }), dust = many(PUFF(u), 6, 0.3), hearts = many(HEART(u, 0.1), 3, 1);
  group.add(dog.group, toy, dust, hearts);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { throw: [0.3, 1.2, 'linear'], run: [0.9, 1.0, 'in'], back: [2.5, 1.1], drop: [3.7, 0.2] });
      const x = home + (far - home) * (T.run - T.back), running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      const OUT = RIGHT - 0.75, BACK = LEFT + 0.75, yaw = pre ? 0 : OUT * between(v, 0.75, 0.95) + (BACK - OUT) * between(v, 2.2, 2.45) - BACK * between(v, 3.6, 3.8);
      if (running) dog.pose('run', v); else if (!pre && v > 3.9 && v < 5.9) dog.pose('dance', v - 3.9); else if (!pre && T.run >= 1 && T.back <= 0) dog.pose('eat', v - 1.9); else dog.pose('idle', t);
      dog.group.position.set(x, floor, 0.05 * u); dog.group.rotation.y = yaw;
      // the ball: thrown in high over the kanji, bounces to the far spot; carried back in the mouth; dropped in front
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      toy.visible = !pre && T.throw > 0;
      if (T.run < 1) { const f = T.throw; toy.position.set(B.minX + (far + 0.3 * u - B.minX) * f, floor + 0.07 * u + Math.abs(Math.sin(f * Math.PI * 2.2)) * 0.9 * u * (1 - f), 0.1 * u); }
      else if (T.drop < 1) toy.position.set(x + fx * 0.42 * h, floor + 0.42 * h, 0.05 * u + fz * 0.42 * h);
      else toy.position.set(home, floor + 0.07 * u + 0.1 * u * bump(v, 3.7, 0.3), 0.05 * u + 0.5 * h);
      puffs(dust, 0, 6, far + 0.2 * u, floor, pre ? 0 : (v - 1.9) / 0.6, u, 0.4); dust.commit();
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 4.1 + i * 0.35, 5.3 + i * 0.35); hearts.set(i, home - 0.15 * u + 0.15 * u * i, floor + 0.85 * u + 0.4 * u * f, 0.05 * u, f > 0 && f < 1 ? 1.4 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

// ---- 三 ----
function threeChicks(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, h = 0.5 * u;
  const chicks = [0, 1, 2].map(() => createModel('chick', { height: h })), tags = [1, 2, 3].map((n) => textPlane(String(n), { h: 0.22 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 }));
  group.add(...chicks.map((c) => c.group), ...tags);
  const order = ctx.strokes.map((s, i) => [i, stage.strokeBox(i).cy]).sort((a, b) => b[1] - a[1]).map(([i]) => i);   // top to bottom
  const loop = 6.6, X = (i) => B.maxX + (0.3 + 0.42 * i) * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.6, 'out'], front: [1.5, 0.3], turn: [4.5, 0.3], leave: [4.7, 1.6, 'in'] });
      chicks.forEach((c, i) => {
        const q = 2.0 + 0.7 * i, walking = (T.walk > 0 && T.walk < 1) || (T.leave > 0 && T.leave < 1);
        if (walking) c.pose('walk', v + 0.2 * i); else if (!pre && v >= q && v < q + 1.2) c.pose('gesture-positive', v - q); else c.pose('idle', t + 0.4 * i);
        c.group.visible = !pre; c.group.position.set(X(i) + (1 - T.walk) * 1.6 * u + T.leave * 1.8 * u, floor, 0.05 * u);
        c.group.rotation.y = (LEFT + 0.6) * (1 - T.front) + (RIGHT - 0.6) * T.turn;
        const k = pre ? 0 : between(v, q, q + 0.25) * (1 - T.turn), hop = bump(v, q, 0.35);
        tags[i].visible = k > 0.01; tags[i].scale.setScalar(grow(k)); tags[i].position.set(X(i), floor + h + 0.2 * u, 0.1 * u);
        if (order[i] !== undefined) stage.offset(order[i], 0, 0.07 * u * hop, 0);
      });
    },
  };
}

// ---- 休 ----
function restTree(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.8 * u;
  const tree = createModel('oak', { height: 1.5 * u, tint: { leafsGreen: 0x58b848 } }), man = createModel('man', { height: 0.8 * u }), head = man.node('head'), zs = ['Z', 'z', 'Z'].map((c) => textPlane(c, { h: 0.24 * u, color: '#e8f0ff', weight: 900 }));
  const tufts = [0, 1].map(() => createModel('grass', { height: 0.14 * u, tint: { grass: 0x58b848 } }));
  tree.group.position.set(tx + 0.12 * u, floor, -0.2 * u); tufts[0].group.position.set(tx - 0.35 * u, floor, 0.05 * u); tufts[1].group.position.set(tx + 0.4 * u, floor, -0.05 * u);
  group.add(tree.group, man.group, ...zs, ...tufts.map((g) => g.group));
  const loop = 7.6, sitX = tx - 0.05 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walkIn: [0, 1.8, 'out'], sit: [2.0, 0.4], up: [5.4, 0.4], out: [5.9, 1.6, 'in'] });
      const walking = (T.walkIn > 0 && T.walkIn < 1) || (T.out > 0 && T.out < 1), seated = T.sit > 0 && T.up < 1;
      if (walking) man.pose('walk', v); else if (seated) man.pose('sit', v - 2.0, false); else man.pose('idle', t);
      man.group.visible = !pre;
      man.group.position.set(sitX + (1 - T.walkIn) * 1.2 * u + T.out * 1.3 * u, floor, 0.05 * u);
      man.group.rotation.y = !pre && T.walkIn < 1 ? LEFT : T.up >= 1 ? RIGHT * between(v, 5.8, 6.0) : 0;
      const doze = pre ? 0 : between(v, 2.6, 3.0) * (1 - between(v, 5.0, 5.3));
      if (head) head.rotation.x += 0.3 * doze;
      zs.forEach((z, i) => { const f = (v * 0.45 + i / 3) % 1, k = doze * Math.sin(Math.PI * f) * (0.6 + 0.6 * f); z.visible = k > 0.02; z.scale.setScalar(grow(k)); z.position.set(sitX + 0.15 * u + 0.25 * u * f, floor + 0.65 * u + 0.5 * u * f, 0.2 * u); });
    },
  };
}

// ---- 車 ----
function carBeep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.6 * u, pz = 0.05 * u, farZ = -4.5 * u;
  const car = createModel('sedan', { height: 0.45 * u }), k = 0.45 * u / 1.3, wheels = ['wheel-front-left', 'wheel-front-right', 'wheel-back-left', 'wheel-back-right'].map(car.node);
  const road = solidProp([[G.box(0.75 * u, 0.01 * u, 5.4 * u, 0, 0, 0), 0x4a4d58], ...[0, 1, 2, 3, 4, 5, 6].map((i) => [G.box(0.04 * u, 0.012 * u, 0.35 * u, 0, 0.002 * u, (-2.4 + 0.75 * i) * u), 0xf0f0f0])], 0.15);
  const slope = new THREE.Group(); slope.position.set(px, floor, pz); slope.rotation.x = 0.2; road.position.set(0, -0.01 * u, -2.1 * u - pz);
  const lamps = many([[G.sphere(0.045 * u), 0xffffa0]], 2, 1.6), rings = many([[G.torus(0.07 * u, 0.012 * u, Math.PI * 0.6, 0, 0, 0, -0.3 * Math.PI), 0xffe060]], 4, 1.2);
  car.group.add(lamps); slope.add(road, car.group); group.add(slope, rings);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 2.0, 'out'], go: [4.4, 1.6, 'in'] }), d = pre ? 0 : 1 - T.come + T.go;     // 1 far, 0 parked
      car.group.position.set(0, 0, lerp(0, farZ - pz, d)); car.group.rotation.y = 0.5 * (1 - d);
      const roll = (farZ - lerp(pz, farZ, d)) / (0.3 * k);
      wheels.forEach((w) => w && (w.rotation.x = -roll));
      const beep = pre ? 0 : bump(v, 2.4, 0.3) + bump(v, 3.0, 0.3), lit = d < 0.05 ? 0.6 + 1.4 * beep : 0.3;
      lamps.set(0, 0.17 * u, 0.15 * u, 0.43 * u, lit); lamps.set(1, -0.17 * u, 0.15 * u, 0.43 * u, lit); lamps.commit();
      car.group.position.y += 0.012 * u * beep;
      for (let i = 0; i < 4; i++) { const at = i < 2 ? 2.4 : 3.0, f = pre ? 0 : between(v, at + (i % 2) * 0.1, at + 0.5 + (i % 2) * 0.1); rings.set(i, px + 0.1 * u + 0.15 * u * f * (i % 2 ? 1 : 0.6), floor + 0.55 * u + 0.12 * u * f, 0.3 * u, f > 0 && f < 1 ? 1 + 1.5 * f : 0); }
      rings.commit();
    },
  };
}

// ---- 電車 ----
function tram(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, h = 0.7 * u, k = h / 2.22, x0 = B.maxX + 0.05 * u, N = 6, z = -0.1 * u;
  const car = createModel('tramCar', { height: h }), wheels = ['wheels-front', 'wheels-back'].map(car.node);
  const tracks = Array.from({ length: N }, (_, i) => { const m = createModel('track', { width: 1.0 * k }); m.group.rotation.y = RIGHT; m.group.position.set(x0 + (i + 0.5) * k, floor, z); return m; });
  const top = floor + h + 0.004 * u, x1 = x0 + N * k;
  const wire = solidProp([[G.box(x1 - x0, 0.008 * u, 0.008 * u, (x1 - x0) / 2, top - floor, 0), 0x303038], [G.cyl(0.02 * u, 0.02 * u, top - floor + 0.05 * u, 0, (top - floor) / 2, -0.25 * u), 0x8a8a94], [G.cyl(0.02 * u, 0.02 * u, top - floor + 0.05 * u, x1 - x0, (top - floor) / 2, -0.25 * u), 0x8a8a94],
    [G.box(0.02 * u, 0.02 * u, 0.25 * u, 0, top - floor, -0.125 * u), 0x8a8a94], [G.box(0.02 * u, 0.02 * u, 0.25 * u, x1 - x0, top - floor, -0.125 * u), 0x8a8a94]], 0.3);
  wire.position.set(x0, floor, z);
  const sparks = many([[G.sphere(0.014 * u), 0xc8f0ff]], 8, 2.0);
  group.add(...tracks.map((m) => m.group), wire, car.group, sparks);
  const loop = 6.4, stop = x0 + 1.9 * k, start = x1 + 0.6 * k;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 2.2, 'out'], go: [4.2, 2.0, 'in'] }), x = pre ? start : lerp(start, stop, T.come - T.go);
      car.group.position.set(x, floor + 0.02 * u, z); car.group.rotation.y = LEFT;
      wheels.forEach((w) => w && (w.rotation.x = (start - x) / (0.25 * k)));
      const moving = !pre && ((T.come > 0 && T.come < 1) || (T.go > 0 && T.go < 1)), rnd = seeded(1 + Math.floor(t * 14));
      for (let i = 0; i < 8; i++) { const on = moving || (!pre && bump(v, 2.6, 1.2) > 0.2) ? (rnd() < 0.6 ? 1 : 0) : 0; sparks.set(i, x + 0.25 * k + (rnd() - 0.5) * 0.12 * u, top + (rnd() - 0.3) * 0.08 * u, z + (rnd() - 0.5) * 0.06 * u, on * (0.6 + rnd())); }
      sparks.commit();
    },
  };
}

// ---- 魚 ----
function fishLeap(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.75 * u, h = 0.6 * u;
  const pond = solidProp([[G.cyl(0.75 * u, 0.75 * u, 0.02 * u, 0, 0, 0, 0, 0, 0, 40), 0x3a9ae8], [G.torus(0.75 * u, 0.04 * u).rotateX(Math.PI / 2), 0xb8a888]], 0.5);
  pond.position.set(px, floor, 0); pond.scale.set(1, 1, 0.5); pond.rotation.x = 0.6;
  const fish = createModel('fish', { height: h }), arm = new THREE.Group(); arm.add(fish.group); fish.group.position.y = -h / 2;
  const rings = many([[G.torus(0.1 * u, 0.012 * u).rotateX(Math.PI / 2), 0xffffff]], 4, 0.8), drops = many(DROP(u), 10, 0.8);
  group.add(pond, arm, rings, drops);
  const loop = 6.0, P = [px - 0.5 * u, px + 0.5 * u], J = [[0.4, 1.4], [3.4, 1.4]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      let shown = false;
      J.forEach(([at, dur], j) => {
        const f = pre ? 0 : between(v, at, at + dur); if (!(f > 0 && f < 1)) return;
        shown = true; const [a, b] = j ? [P[1], P[0]] : P, x = lerp(a, b, f), y = floor + 1.1 * u * 4 * f * (1 - f), slope = 1.1 * u * 4 * (1 - 2 * f) / (b - a);
        arm.position.set(x, y, 0.02 * u); fish.group.rotation.y = j ? LEFT + 0.7 : RIGHT - 0.7; arm.rotation.z = Math.atan(slope) * (j ? 1 : 1);
        fish.pose('run', v);
      });
      arm.visible = shown;
      for (let i = 0; i < 4; i++) { const [at, s] = [[0.4, 0], [1.8, 1], [3.4, 1], [4.8, 0]][i], f = pre ? 0 : between(v, at, at + 0.9); rings.set(i, P[s], floor + 0.03 * u, 0.02 * u, f > 0 && f < 1 ? 0.5 + 2.5 * f : 0); }
      rings.commit();
      for (let i = 0; i < 10; i++) { const s = i < 5 ? 1 : 0, at = i < 5 ? 1.8 : 4.8, f = pre ? 0 : between(v, at, at + 0.7), a = (i % 5) / 4 - 0.5; drops.set(i, P[s] + a * 0.3 * u * f, floor + 0.5 * u * 4 * f * (1 - f), 0.05 * u, f > 0 && f < 1 ? 1.2 : 0); }
      drops.commit();
    },
  };
}

// ---- 歩 ----
function walker(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, a = B.maxX + 0.55 * u, b = B.maxX + 1.6 * u, z = 0.12 * u, N = 14, step = (b - a) / 7;
  const hiker = createModel('hiker', { height: 0.8 * u }), prints = many([[G.sphere(0.06 * u, 0, 0, 0, 1.5, 0.15, 0.9), 0xf4e8d0]], N, 0.5);
  group.add(hiker.group, prints);
  const loop = 6.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.2, 2.4, 'linear'], face: [2.7, 0.3], nod: [3.0, 0.9], back: [4.0, 2.4, 'linear'] });
      const x = pre ? a : lerp(a, b, T.out - T.back), walking = !pre && ((T.out > 0 && T.out < 1) || (T.back > 0 && T.back < 1));
      if (walking) hiker.pose('walk', v); else if (!pre && T.nod > 0 && T.nod < 1) hiker.pose('emote-yes', v - 3.0); else hiker.pose('idle', t);
      hiker.group.position.set(x, floor, z);
      hiker.group.rotation.y = pre ? 0 : T.out < 1 ? (RIGHT - 0.5) * between(v, 0, 0.2) : T.back <= 0 ? (RIGHT - 0.5) * (1 - T.face) : (LEFT + 0.5) * between(v, 3.9, 4.1);
      // footprints: one per step on the way out (upper row) and back (lower row); each fades over 2.5 s after it is left
      for (let i = 0; i < N; i++) {
        const back = i >= 7, j = i % 7, px = back ? b - (j + 0.5) * step : a + (j + 0.5) * step, at = back ? 4.0 + 2.4 * (j + 0.5) / 7 : 0.2 + 2.4 * (j + 0.5) / 7;
        const age = pre ? -1 : v - at, on = age > 0 ? Math.max(0, 1 - age / 2.5) : 0;
        prints.set(i, px, floor + 0.003 * u, z + (j % 2 ? 0.05 : -0.05) * u + (back ? 0.12 * u : -0.02 * u), on, 0, back ? Math.PI : 0, 1.0);
      }
      prints.commit();
    },
  };
}

// ---- 大きい ----
function elephant(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ex = B.maxX + 0.85 * u;
  const big = createModel('elephant', { height: 0.9 * u }), chick = createModel('chick', { height: 0.22 * u });
  const call = textPlane('パオーン', { h: 0.16 * u, color: '#ffffff', bg: '#7a5ad0', pad: 0.25 }), wow = textPlane('!', { h: 0.16 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  const waves = many([[G.torus(0.1 * u, 0.014 * u, Math.PI * 0.6, 0, 0, 0, -0.3 * Math.PI), 0xffe060]], 3, 1.2);
  big.group.position.set(ex, floor, -0.15 * u); chick.group.position.set(B.maxX + 0.12 * u, floor, 0.4 * u);
  group.add(big.group, chick.group, call, wow, waves);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { swell: [0.2, 1.0, 'back'], shout: [1.6, 1.6], shrink: [5.4, 0.8] }), s = pre ? 0.45 : 0.45 + 0.55 * (T.swell - T.shrink);
      big.group.scale.setScalar(s); big.group.rotation.y = -0.45;
      if (!pre && v > 1.4 && v < 3.4) big.pose('gesture-positive', v - 1.4); else big.pose('idle', t);
      const jump = pre ? 0 : 0.12 * u * bump(v, 1.7, 0.4);
      if (!pre && v > 1.6 && v < 3.0) chick.pose('gesture-negative', v - 1.6); else chick.pose('idle', t);
      chick.group.position.y = floor + jump; chick.group.rotation.set(-0.25 * (pre ? 0 : T.swell), 0.5, 0);
      const c = pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 3.2, 3.5));
      call.visible = c > 0.01; call.scale.setScalar(grow(c)); call.position.set(ex - 0.2 * u, floor + 1.0 * u, 0.2 * u);
      const w = pre ? 0 : between(v, 1.7, 1.9) * (1 - between(v, 3.0, 3.2));
      wow.visible = w > 0.01; wow.scale.setScalar(grow(w)); wow.position.set(B.maxX + 0.12 * u, floor + 0.42 * u + jump, 0.32 * u);
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : ((v - 1.6 - i * 0.3) / 0.9), on = f > 0 && f < 1 && v < 3.4; waves.set(i, ex - 0.4 * u - 0.15 * u * f, floor + 0.65 * u + 0.1 * u * f, 0.2 * u, on ? 1 + 1.2 * f : 0, Math.PI); }
      waves.commit();
    },
  };
}

// a line-up of every trial model, idling (to check size, facing and light)
function lineup(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), names = spec.names ?? ['dog', 'chick', 'fish', 'elephant', 'man', 'oak', 'sedan', 'tramCar'];
  const ms = names.map((n, i) => { const m = createModel(n, { height: 0.5 * u }); m.group.position.set(B.minX + (0.45 * i - 0.9) * u, B.maxY + 0.05 * u, 0.2 * u); group.add(m.group); return m; });
  return { group, step(t) { ms.forEach((m) => m.pose(spec.clip ?? 'idle', t)); } };
}

export const SCENES = {
  'm-dog-fetch': dogFetch, 'm-three-chicks': threeChicks, 'm-rest-tree': restTree, 'm-car-beep': carBeep, 'm-tram': tram,
  'm-fish-leap': fishLeap, 'm-walker': walker, 'm-elephant': elephant, 'm-lineup': lineup,
};
