// Batch 4 word variants, part 2:
//   hall-rise:cinema    映画館: a cinema with a big film-reel sign and a marquee of chasing light bulbs; people walk in
//   pot-cook:pan        料理: a chef in a tall white hat tosses an omelette in a frying pan over the flames
//   bus-ride:bike       乗る: a kid walks up to a bicycle, gets on and pedals away
//   fever:touch         熱い: a hand touches a steaming kettle and jerks back; a red flash, the hand flaps to cool
//   brush-enso:pencil   鉛筆: a pencil writes a wavy line, then goes into a sharpener that spins it; shavings curl out
//   brush-enso:pen      万年筆: a fountain pen dips into an ink bottle and signs a looping signature; a gold glint
//   cow-moo:milk        牛乳: a milk carton with cow spots pours into a glass; a kid drinks it and gets a milk moustache
//   cow-moo:steak       牛肉: a steak sizzles on a grill with a little cow sign stuck in it; it flips over, steam rises
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, handTo, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

export function cinema(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.55 * u, W = 0.8 * u, H = 0.55 * u;
  const hall = solidProp([[G.box(W, H, 0.4 * u, 0, H / 2, 0), 0x5a3a6a], [G.box(W * 0.9, 0.14 * u, 0.06 * u, 0, H - 0.1 * u, 0.22 * u), 0x1a1a24], [G.box(0.2 * u, 0.26 * u, 0.01 * u, 0, 0.13 * u, 0.201 * u), 0xffc870], [G.box(W + 0.06 * u, 0.04 * u, 0.44 * u, 0, H + 0.02 * u, 0), 0x3a2a4a]], 0.35);
  hall.position.set(hx, floor, -0.1 * u);
  const reel = solidProp([[G.cyl(0.13 * u, 0.13 * u, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 24), 0xc8ccd4], ...[0, 1, 2, 3, 4].map((i) => [G.cyl(0.03 * u, 0.03 * u, 0.032 * u, Math.cos(i * 1.257) * 0.075 * u, Math.sin(i * 1.257) * 0.075 * u, 0.002 * u, Math.PI / 2), 0x3a3a44])], 0.5);
  reel.position.set(hx, floor + H + 0.17 * u, -0.1 * u);
  const N = 14, bulbs = many([[G.sphere(0.014 * u), 0xffffff]], N, 1.0), on = new THREE.Color(0xffe060), off = new THREE.Color(0x6a5020);
  const P = [createPerson({ u: 0.3 * u, shirt: 0xe04848 }), createPerson({ u: 0.28 * u, shirt: 0x40c8c8 })];
  group.add(hall, reel, bulbs, ...P.map((p) => p.group));
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, chase = Math.floor(t * 8);
      for (let i = 0; i < N; i++) { const top = i < N / 2, j = top ? i : i - N / 2; bulbs.set(i, hx - W * 0.42 + (W * 0.84) * j / (N / 2 - 1), floor + H - 0.1 * u + (top ? 0.08 : -0.08) * u, 0.15 * u, 1); bulbs.setColorAt(i, (i + chase) % 3 === 0 ? on : off); }
      bulbs.commit(); bulbs.instanceColor.needsUpdate = true; reel.rotation.z = -t;
      P.forEach((p, i) => { const f = pre ? 0 : between(v, 0.2 + 0.8 * i, 2.6 + 0.8 * i), z = lerp(0.6 * u, 0.12 * u, f), x = hx + lerp(0.5 * u + 0.1 * u * i, 0, Math.min(1, f * 1.4)); p.reset().face(Math.PI + (f < 0.7 ? -0.9 : 0)).walk(v * 10, 1); p.group.position.set(x, floor, z); p.group.visible = f > 0 && f < 0.97; p.update(); });
    },
  };
}

export function panFlip(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.5 * u, SH = 0.36 * u;
  const stove = solidProp([[G.box(0.6 * u, SH, 0.32 * u, 0, SH / 2, 0), 0xe8e8ee], [G.box(0.5 * u, 0.06 * u, 0.01 * u, 0, SH * 0.6, 0.161 * u), 0x2a2a30], [G.torus(0.1 * u, 0.012 * u).rotateX(Math.PI / 2).translate(0, SH + 0.006 * u, 0), 0x2a2a30]], 0.35);
  stove.position.set(sx, floor, 0);
  const flames = many([[G.cone(0.025 * u, 0.07 * u, 0, 0.035 * u, 0), 0x40a0ff]], 6, 1.0);
  const pan = new THREE.Group(), panM = solidProp([[G.cyl(0.15 * u, 0.13 * u, 0.04 * u, 0, 0.02 * u, 0, 0, 0, 0, 24), 0x2a2a30], [G.box(0.28 * u, 0.025 * u, 0.04 * u, 0.28 * u, 0.04 * u, 0), 0x3a2a1a]], 0.35); pan.add(panM);
  const egg = solidProp([[G.sphere(0.11 * u, 0, 0, 0, 1, 0.22, 0.8), 0xffd84a], [G.sphere(0.035 * u, 0.02 * u, 0.02 * u, 0, 1, 0.5, 1), 0xffa020]], 0.5);
  const chef = createPerson({ u: 0.85 * u, shirt: 0xffffff }), hat = solidProp([[G.cyl(0.1 * u, 0.09 * u, 0.12 * u, 0, 0.06 * u, 0), 0xffffff], [G.sphere(0.12 * u, 0, 0.14 * u, 0, 1, 0.6, 1), 0xffffff]], 0.5);
  chef.rig.attach('head', hat, 0.8);
  group.add(stove, flames, pan, egg, chef.group);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, top = floor + SH + 0.02 * u;
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; flames.set(i, sx + Math.cos(a) * 0.1 * u, floor + SH, Math.sin(a) * 0.1 * u, 0.7 + 0.3 * Math.sin(t * 13 + i * 2)); }
      flames.commit();
      const toss = [1.0, 2.6].map((at) => between(v, at, at + 0.7)).find((f) => f > 0 && f < 1) ?? 0, jerk = Math.max(bump(v, 0.9, 0.25), bump(v, 2.5, 0.25));
      pan.position.set(sx, top + 0.03 * u * jerk, 0.0); pan.rotation.z = 0.2 * jerk;
      egg.position.set(sx, top + 0.05 * u + 0.45 * u * Math.sin(Math.PI * toss), 0); egg.rotation.x = Math.PI * 2 * toss; egg.visible = !pre;
      chef.reset().face(-0.7); chef.bone('armR').rotation.x = 1.3 + 0.3 * jerk; chef.bone('head').rotation.x = -0.4 * Math.sin(Math.PI * toss); chef.group.position.set(sx + 0.42 * u, floor, -0.05 * u); chef.update();
    },
  };
}

export function bikeRide(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u;
  const bike = emblemProp('bike', 0.5 * u, { color: 0x40a0e0 }), kid = createPerson({ u: 0.6 * u, shirt: 0xe04848 });
  group.add(bike, kid.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0.2, 1.0], hop: [1.3, 0.4, 'back'], ride: [2.0, 1.8, 'in'], back: [4.3, 0.5] });
      const x = bx + 0.9 * u * T.ride, k = T.back > 0 ? T.back : T.ride > 0.9 ? 1 - (T.ride - 0.9) * 10 : 1;
      bike.position.set(T.back > 0 ? bx : x, floor + 0.22 * u, 0); bike.scale.setScalar(0.5 * u * pop(k)); bike.idle(T.ride > 0 ? v * 2 : 0);
      const seated = T.hop > 0.5, pedal = T.ride > 0 ? v * 10 : 0;
      kid.reset().face('right');
      if (seated) { kid.bone('body').position.y = 0.0; kid.bone('legL').rotation.x = 1.0 + 0.5 * Math.sin(pedal); kid.bone('legR').rotation.x = 1.0 - 0.5 * Math.sin(pedal); kid.bone('shinL').rotation.x = -1.0 - 0.4 * Math.cos(pedal); kid.bone('shinR').rotation.x = -1.0 + 0.4 * Math.cos(pedal); kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 1.2; kid.lean(0.25); }
      else kid.walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0);
      kid.group.position.set(seated ? x - 0.02 * u : lerp(B.maxX + 0.05 * u, bx - 0.12 * u, T.walk), floor + (seated ? 0.2 * u : 0.08 * u * Math.sin(Math.PI * T.hop)), 0.04 * u);
      kid.group.visible = !pre && T.ride < 0.99; kid.group.scale.setScalar(pop(T.ride > 0.9 ? 1 - (T.ride - 0.9) * 10 : 1)); kid.update();
    },
  };
}

export function hotTouch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.4 * u;
  const stove = solidProp([[G.box(0.5 * u, 0.06 * u, 0.32 * u, 0, 0.03 * u, 0), 0x3a3a44], [G.torus(0.1 * u, 0.012 * u).rotateX(Math.PI / 2).translate(0, 0.062 * u, 0), 0xff5020]], 0.6);
  stove.position.set(kx, floor, 0);
  const kettle = solidProp([[G.sphere(0.16 * u, 0, 0, 0, 1, 0.85, 1), 0xd04030], [G.cyl(0.03 * u, 0.02 * u, 0.18 * u, 0.17 * u, 0.06 * u, 0, 0, 0, -0.9), 0xd04030], [G.torus(0.1 * u, 0.015 * u, Math.PI, 0, 0.1 * u, 0), 0x2a2a30], [G.sphere(0.025 * u, 0, 0.14 * u, 0), 0x2a2a30]], 0.45);
  kettle.position.set(kx, floor + 0.2 * u, 0);
  const steam = many(PUFF(u, 0xffffff), 6, 0.6), hand = createHand({ u: 0.5 * u, side: -1, sleeve: 0x40a0e0 }), ouch = burst(u, { s: 0.35, n: 8, color: 0xff4020 });
  group.add(stove, kettle, steam, hand.group, ouch);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { reach: [0.3, 0.7, 'in'], yank: [1.05, 0.2, 'out'], leave: [3.4, 0.5] });
      const tx = kx + 0.1 * u, ty = floor + 0.32 * u, back = T.yank, shake = v > 1.3 && v < 3.2 ? Math.sin(v * 22) : 0;
      hand.group.visible = !pre && T.leave < 1; hand.group.rotation.set(0, 0, Math.PI * 0.85 + 0.2 * shake); hand.pose('point', 'open', back);
      handTo(hand, tx + 0.35 * u * back + 0.6 * u * (1 - T.reach) + 0.5 * u * T.leave + 0.03 * u * shake, ty + 0.35 * u * back + 0.3 * u * (1 - T.reach), 0.08 * u, hand.bone('f1b')); hand.update();
      const o = pre ? 0 : bump(v, 1.0, 0.7); ouch.visible = o > 0; ouch.scale.setScalar(pop(o)); ouch.position.set(tx, ty, 0.12 * u); ouch.rotation.z = t * 3;
      wisps(steam, 0, 6, kx + 0.3 * u, floor + 0.35 * u, t, u, { period: 1.2, rise: 0.45, size: 0.9 }); steam.commit();
    },
  };
}

export function pencilSharpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.45 * u, cy = B.cy, N = 24;
  const pencil = new THREE.Group(), pm = solidProp([[G.cyl(0.025 * u, 0.025 * u, 0.4 * u, 0, 0.26 * u, 0, 0, 0, 0, 6), 0xffd040], [G.cone(0.025 * u, 0.06 * u, 0, 0.03 * u, 0, Math.PI), 0xf0c890], [G.cone(0.01 * u, 0.024 * u, 0, 0.007 * u, 0, Math.PI), 0x2a2a30], [G.cyl(0.026 * u, 0.026 * u, 0.04 * u, 0, 0.47 * u, 0), 0xc8ccd4], [G.cyl(0.025 * u, 0.025 * u, 0.04 * u, 0, 0.51 * u, 0), 0xff8ab0]], 0.4);
  pencil.add(pm); pm.position.y = 0;
  const line = many([[G.sphere(0.012 * u, 0, 0, 0, 1, 1, 0.3), 0x3a3a44]], N, 0.2), sharp = solidProp([[G.box(0.14 * u, 0.12 * u, 0.1 * u, 0, 0, 0), 0x40a0e0], [G.cyl(0.03 * u, 0.03 * u, 0.01 * u, 0, 0.06 * u, 0), 0x1a1a24]], 0.4), shav = many([[G.torus(0.02 * u, 0.006 * u, Math.PI * 1.5), 0xd0a070]], 6, 0.4);
  const sx = cx + 0.25 * u, sy = B.minY + 0.06 * u; sharp.position.set(sx, sy, 0);
  group.add(pencil, line, sharp, shav);
  const loop = 5.2, at = (s) => [cx - 0.3 * u + 0.5 * u * s, cy + 0.08 * u * Math.sin(s * Math.PI * 4)];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { write: [0.2, 1.5], go: [1.9, 0.4], spin: [2.3, 1.2], up: [3.5, 0.4], out: [4.6, 0.4] });
      for (let i = 0; i < N; i++) { const s = i / (N - 1), [x, y] = at(s); line.set(i, x, y, 0, !pre && s <= T.write ? 1 - T.out : 0); }
      line.commit();
      const [wx, wy] = at(T.write), into = T.go - T.up;
      pencil.position.set(lerp(wx, sx, T.go), lerp(wy, sy + 0.06 * u, into) + (T.go > 0 ? 0 : 0.01 * u * Math.sin(v * 30)), 0.03 * u); pencil.rotation.z = lerp(-0.4, 0, T.go); pencil.rotation.y = T.spin > 0 && T.spin < 1 ? v * 20 : 0; pencil.visible = !pre && T.out < 1;
      for (let i = 0; i < 6; i++) { const f = between(v, 2.4 + 0.18 * i, 3.4 + 0.18 * i); shav.set(i, sx + 0.08 * u + 0.15 * u * f, sy - 0.02 * u + 0.12 * u * Math.sin(Math.PI * f), 0.06 * u, f > 0 && f < 1 ? 1 : 0, f * 6); }
      shav.commit();
    },
  };
}

export function fountainPen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, cy = B.cy - 0.02 * u, N = 40;
  const pen = new THREE.Group(), pm = solidProp([[G.cyl(0.03 * u, 0.025 * u, 0.36 * u, 0, 0.26 * u, 0), 0x14141c], [G.cyl(0.031 * u, 0.031 * u, 0.02 * u, 0, 0.3 * u, 0), 0xe0b030], [G.cone(0.025 * u, 0.08 * u, 0, 0.04 * u, 0, Math.PI), 0xe0b030]], 0.45); pen.add(pm);
  const bottle = solidProp([[G.box(0.14 * u, 0.12 * u, 0.12 * u, 0, 0.06 * u, 0), 0x203a80], [G.cyl(0.04 * u, 0.04 * u, 0.04 * u, 0, 0.14 * u, 0), 0x1a1a24], [G.box(0.1 * u, 0.05 * u, 0.004 * u, 0, 0.06 * u, 0.061 * u), 0xf4f0e0]], 0.45);
  const bx = cx + 0.4 * u; bottle.position.set(bx, floor, 0.1 * u);
  const ink = many([[G.sphere(0.011 * u, 0, 0, 0, 1, 1, 0.3), 0x2040c0]], N, 0.5), glint = burst(u, { s: 0.16, n: 4, color: 0xffe080 });
  group.add(pen, bottle, ink, glint);
  const loop = 5.2, at = (s) => { const a = s * Math.PI * 7; return [cx - 0.3 * u + 0.5 * u * s + 0.04 * u * Math.cos(a), cy + 0.07 * u * Math.sin(a) + 0.03 * u * Math.sin(s * 9)]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { dip: [0.2, 0.7], to: [1.0, 0.4], sign: [1.5, 1.8, 'smooth'], away: [3.4, 0.4], out: [4.6, 0.4] });
      for (let i = 0; i < N; i++) { const s = i / (N - 1), [x, y] = at(s); ink.set(i, x, y, 0, !pre && s <= T.sign ? 1 - T.out : 0); }
      ink.commit();
      const [sx, sy] = at(T.sign), dipY = floor + 0.17 * u - 0.06 * u * bump(v, 0.2, 0.7);
      let x = bx, y = dipY; if (T.to > 0) { x = lerp(bx, sx, T.to); y = lerp(dipY, sy, T.to); } if (T.sign > 0) { x = sx; y = sy; } if (T.away > 0) { x = sx + 0.3 * u * T.away; y = sy + 0.3 * u * T.away; }
      pen.visible = !pre && T.away < 1; pen.position.set(x, y, 0.02 * u); pen.rotation.z = -0.5;
      const g = pre ? 0 : bump(v, 3.3, 0.8); glint.visible = g > 0; glint.scale.setScalar(pop(g)); const [ex, ey] = at(1); glint.position.set(ex, ey + 0.05 * u, 0.03 * u); glint.rotation.z = t * 3;
    },
  };
}

export function milkGlass(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.35 * u, GH = 0.24 * u;
  const carton = new THREE.Group(), cm = solidProp([[G.box(0.14 * u, 0.24 * u, 0.14 * u, 0, 0.12 * u, 0), 0xffffff], [G.cone(0.1 * u, 0.06 * u, 0, 0.27 * u, 0), 0xffffff], [G.sphere(0.03 * u, -0.03 * u, 0.15 * u, 0.07 * u, 1.2, 1, 0.3), 0x1a1a24], [G.sphere(0.022 * u, 0.04 * u, 0.07 * u, 0.07 * u, 1.2, 1, 0.3), 0x1a1a24], [G.box(0.141 * u, 0.04 * u, 0.141 * u, 0, 0.03 * u, 0), 0x3a7ad0]], 0.5); carton.add(cm);
  const glass = solidProp([[G.cyl(0.075 * u, 0.065 * u, GH, 0, GH / 2, 0, 0, 0, 0, 20), 0xc8e8ff]], 0.3); glass.material.transparent = true; glass.material.opacity = 0.45;
  const milk = solidProp([[G.cyl(0.07 * u, 0.062 * u, 1, 0, 0.5, 0, 0, 0, 0, 20), 0xffffff]], 0.7), stream = solidProp([[G.cyl(0.012 * u, 0.012 * u, 1, 0, -0.5, 0), 0xffffff]], 0.7);
  const kid = createPerson({ u: 0.7 * u, shirt: 0x60b060 }), stache = solidProp([[G.sphere(0.04 * u, 0, 0, 0, 1.6, 0.5, 0.6), 0xffffff]], 0.6);
  kid.rig.attach('head', stache, 0.3).position.z = 0.1 * 0.7 * u;
  const cup = new THREE.Group(); cup.add(glass, milk);
  group.add(carton, cup, stream, kid.group);
  const loop = 5.6, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { tilt: [0.2, 0.4], fill: [0.6, 1.2], untilt: [1.8, 0.3], take: [2.3, 0.5], drink: [2.8, 0.4], gulp: [3.2, 0.8], down: [4.1, 0.4], out: [5.0, 0.5] });
      const tilt = T.tilt - T.untilt; carton.position.set(gx + 0.12 * u, floor + 0.3 * u, 0); carton.rotation.z = 1.9 * tilt; carton.scale.setScalar(pop(1 - T.take));
      const pouring = tilt > 0.9 && T.fill < 1; stream.visible = pouring; stream.position.set(gx + 0.02 * u, floor + 0.36 * u, 0); stream.scale.y = pop(0.36 * u - 0.24 * u * T.fill * 0.5);
      kid.reset().face(-0.5); const dr = T.drink - T.down; kid.bone('armR').rotation.x = 1.2 * T.take * (1 - T.out) + 1.0 * dr; kid.bone('foreR').rotation.x = 0.9 * dr; kid.bone('head').rotation.x = -0.4 * dr;
      kid.group.position.set(gx + 0.42 * u, floor, 0.15 * u); kid.update(); bonePoint(kid, 'handR', 0.6, hand);
      const rest = [gx, floor, 0.05 * u], held = [hand.x, hand.y - 0.1 * u, hand.z]; cup.position.set(...(T.take > 0 ? rest.map((r, i) => lerp(r, held[i], T.take)) : rest)); cup.rotation.z = 1.1 * dr; cup.scale.setScalar(pop(1 - T.out));
      milk.scale.y = pop(GH * 0.9 * T.fill * (1 - 0.85 * T.gulp)); milk.visible = T.fill > 0.02 && !pre;
      stache.visible = !pre && T.gulp > 0.9 && T.out < 1;
    },
  };
}

export function steakGrill(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.45 * u, gy = floor + 0.3 * u;
  const grill = solidProp([[G.box(0.6 * u, 0.28 * u, 0.36 * u, 0, 0.14 * u, 0), 0x2a2a30], ...[-0.12, -0.06, 0, 0.06, 0.12].map((z) => [G.box(0.56 * u, 0.012 * u, 0.012 * u, 0, 0.29 * u, z * u), 0x8a8e96]), [G.box(0.5 * u, 0.02 * u, 0.3 * u, 0, 0.27 * u, 0), 0xff5020]], 0.5);
  grill.position.set(gx, floor, 0);
  const steak = solidProp([[G.sphere(0.17 * u, 0, 0, 0, 1.3, 0.25, 1), 0x8a3a20], [G.torus(0.2 * u, 0.012 * u).rotateX(Math.PI / 2).scale(1.1, 1, 0.75), 0xf0e0c8], ...[-0.08, 0, 0.08].map((x) => [G.box(0.02 * u, 0.012 * u, 0.22 * u, x * u, 0.04 * u, 0, 0.4), 0x2a1008])], 0.4);
  const sign = emblemProp('cow', 0.18 * u), pick = solidProp([[G.cyl(0.005 * u, 0.005 * u, 0.2 * u, 0, 0.1 * u, 0), 0xe8d0a0]], 0.4);
  const steam = many(PUFF(u, 0xffffff), 6, 0.6), spark = many([[G.sphere(0.01 * u), 0xffa020]], 6, 1.0);
  group.add(grill, steak, sign, pick, steam, spark);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, flip = pre ? 0 : between(v, 1.6, 2.1), lift = 0.25 * u * Math.sin(Math.PI * flip);
      steak.position.set(gx, gy + 0.03 * u + lift, 0); steak.rotation.x = Math.PI * flip + 0.02 * Math.sin(t * 20);
      pick.position.set(gx + 0.06 * u, gy + 0.05 * u + lift, 0.05 * u); sign.position.set(gx + 0.06 * u, gy + 0.3 * u + lift, 0.05 * u); sign.idle(t); sign.visible = pick.visible = flip <= 0 || flip >= 1;
      wisps(steam, 0, 6, gx, gy + 0.08 * u, t, u, { period: 1.3, rise: 0.4, size: 0.9 }); steam.commit();
      for (let i = 0; i < 6; i++) { const f = ((t * 2 + i / 6) % 1); spark.set(i, gx + 0.2 * u * Math.cos(i * 2.4), gy + 0.03 * u + 0.12 * u * f, 0.15 * u * Math.sin(i * 1.7), 1 - f); }
      spark.commit();
    },
  };
}
