// Batch 3 word scenes, part 1.
//   my-room       部屋: a cutaway room fills up, bed, desk and lamp, rug, poster; a kid walks in and jumps for joy
//   sweep-all     全部: toys scattered on the floor hop into a toy box one by one, the very last too; the lid shuts, a tick
//   dictionary    字引: a thick book opens, its pages flip fast, a magnifying glass stops on one line and it lights up
//   hand-over     渡す: one person hands a parcel across to another, who takes it and bows thanks
//   beach-day     夏休み: a beach umbrella on the sand, a kid in a swim ring bobbing on the waves, a ball splashes down
//   house-heart   家庭: the front of a little house swings open: a parent and a kid at the table inside; a heart rises
//   dinner-table  夕飯 / 晩御飯: dishes pop onto a table, a kid puts their hands together and eats with chopsticks;
//                 time sunset: an orange sky and a sinking sun in the window; night: moon and stars, a lamp, a parent too
//   rice-cooker   御飯: a rice cooker's lid pops open in a puff of steam; a paddle scoops rice into a bowl, heaped up
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, heart, PUFF } from '../pieces/kit-things.js';
import { emblemProp, bowl, chopsticks } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), WOOD = 0xc89a60;

function myRoom(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, W = 0.95 * u, D = 0.5 * u, H = 0.75 * u, room = new THREE.Group();
  const shell = solidProp([[G.box(W, 0.03 * u, D, 0, 0.015 * u, 0), WOOD], [G.box(W, H, 0.02 * u, 0, H / 2, -D / 2), 0xf0e0d0], [G.box(0.02 * u, H, D, -W / 2, H / 2, 0), 0xe8d4c4], [G.box(0.26 * u, 0.2 * u, 0.01 * u, 0.22 * u, 0.5 * u, -D / 2 + 0.012 * u), 0x8ad0ff], [G.box(0.28 * u, 0.015 * u, 0.012 * u, 0.22 * u, 0.5 * u, -D / 2 + 0.018 * u), 0xffffff], [G.box(0.015 * u, 0.22 * u, 0.012 * u, 0.22 * u, 0.5 * u, -D / 2 + 0.018 * u), 0xffffff]], 0.3);
  const items = [
    [solidProp([[G.box(0.38 * u, 0.1 * u, 0.26 * u, 0, 0.08 * u, 0), 0x6a8ad8], [G.box(0.1 * u, 0.05 * u, 0.2 * u, -0.13 * u, 0.155 * u, 0), 0xffffff], [G.box(0.03 * u, 0.22 * u, 0.26 * u, -0.2 * u, 0.11 * u, 0), WOOD]], 0.35), [-0.24, 0, -0.08]],
    [solidProp([[G.box(0.24 * u, 0.02 * u, 0.14 * u, 0, 0.22 * u, 0), WOOD], [G.box(0.02 * u, 0.21 * u, 0.12 * u, -0.1 * u, 0.105 * u, 0), WOOD], [G.box(0.02 * u, 0.21 * u, 0.12 * u, 0.1 * u, 0.105 * u, 0), WOOD], [G.cyl(0.008 * u, 0.008 * u, 0.12 * u, 0.06 * u, 0.29 * u, 0), 0x60646c], [G.cone(0.05 * u, 0.06 * u, 0.06 * u, 0.36 * u, 0), 0xffd040]], 0.4), [0.3, 0, -0.14]],
    [solidProp([[G.cyl(0.17 * u, 0.17 * u, 0.008 * u, 0, 0, 0, 0, 0, 0, 32).scale(1, 1, 0.6), 0xff8ab0]], 0.4), [0.05, 0.035, 0.08]],
    [solidProp([[G.box(0.15 * u, 0.19 * u, 0.006 * u, 0, 0, 0), 0x40b0a0], [G.sphere(0.04 * u, 0, 0.02 * u, 0.006 * u, 1, 1, 0.2), 0xffe040], [G.box(0.1 * u, 0.02 * u, 0.006 * u, 0, -0.05 * u, 0.006 * u), 0xffffff]], 0.45), [-0.18, 0.5, -0.235]],
  ];
  room.add(shell, ...items.map(([o, [x, y, z]]) => { o.position.set(x * u, y * u, z * u); return o; }));
  room.position.set(B.maxX + 0.62 * u, floor, -0.1 * u);
  const kid = createPerson({ u: 0.55 * u, shirt: 0xf0a030 });
  group.add(room, kid.group);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.7, 5.1);
      items.forEach(([o], i) => { const f = pre ? 1 : timeline(v, { f: [0.15 + 0.35 * i, 0.4, 'back'] }).f * (1 - out); o.visible = f > 0.01; o.scale.setScalar(pop(f)); });
      const T = timeline(v, { walk: [1.7, 1.0] }), joy = bump(v, 3.0, 1.2), hop = bump(v, 3.1, 0.35) + bump(v, 3.5, 0.35);
      kid.reset().face(joy > 0 ? 0 : 'left').walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); kid.raise('L', 2.6 * joy); kid.raise('R', 2.6 * joy);
      kid.group.position.set(room.position.x + 0.75 * u - 0.7 * u * T.walk, floor + 0.035 * u + 0.08 * u * hop, 0.1 * u); kid.group.visible = !pre && T.walk > 0 && out < 1; kid.update();
    },
  };
}

function sweepAll(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.75 * u, W = 0.4 * u, H = 0.22 * u, N = 8;
  const box = solidProp([[G.box(W, 0.02 * u, 0.3 * u, 0, 0.01 * u, 0), 0x8a5a30], [G.box(W, H, 0.02 * u, 0, H / 2, 0.15 * u), 0xe04848], [G.box(W, H, 0.02 * u, 0, H / 2, -0.15 * u), 0xc03838], [G.box(0.02 * u, H, 0.3 * u, W / 2, H / 2, 0), 0xc03838], [G.box(0.02 * u, H, 0.3 * u, -W / 2, H / 2, 0), 0xc03838], [G.box(0.18 * u, 0.06 * u, 0.004 * u, 0, H * 0.55, 0.162 * u), 0xffe060]], 0.35);
  box.position.set(bx, floor, 0);
  const lid = new THREE.Group(), lidM = solidProp([[G.box(W + 0.02 * u, 0.025 * u, 0.32 * u, 0, 0, 0.16 * u), 0xe04848]], 0.35); lid.add(lidM); lid.position.set(bx, floor + H, -0.16 * u);
  const toys = many([[G.sphere(0.055 * u), 0xffffff], [G.torus(0.055 * u, 0.008 * u), 0xffffff]], N, 0.5), PAL = [0xe04848, 0x40a0e0, 0x60c060, 0xf0c030, 0xf08030, 0x9a60d0, 0xff8ab0, 0x40c8c8];
  PAL.forEach((c, i) => toys.setColorAt(i, new THREE.Color(c)));
  const tick = emblemProp('check', 0.3 * u);
  group.add(box, lid, toys, tick);
  const loop = 5.4, SPOT = Array.from({ length: N }, (_, i) => [bx - 1.0 * u + (i % 4) * 0.2 * u + (i > 3 ? 0.1 * u : 0), i > 3 ? 0.22 * u : 0.05 * u]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, back = between(v, 4.6, 5.0);
      const T = timeline(v, { shut: [3.2, 0.3, 'in'], open: [4.5, 0.3] });
      for (let i = 0; i < N; i++) {
        const at = i < N - 1 ? 0.3 + 0.3 * i : 2.6, f = pre ? 0 : between(v, at, at + 0.4), [sx, sz] = SPOT[i];
        const [x, y] = f < 1 ? arc([sx, floor + 0.055 * u], [bx, floor + 0.1 * u], 0.4 * u, f) : [bx + (i % 3 - 1) * 0.1 * u, floor + 0.1 * u];
        const z = f < 1 ? lerp(sz, (i % 2 - 0.5) * 0.12 * u, f) : (i % 2 - 0.5) * 0.12 * u, nerv = i === N - 1 ? 0.03 * u * Math.sin(v * 30) * bump(v, 1.9, 0.7) : 0;
        if (f >= 1 && back > 0) toys.set(i, sx, floor + 0.055 * u, sz, back); else toys.set(i, x + nerv, y, z, 1, v * 3 * f);
      }
      toys.commit();
      lid.rotation.x = -1.9 * (1 - (pre ? 0 : T.shut - T.open));
      box.position.y = floor + 0.04 * u * bump(v, 3.5, 0.3);
      const k = pre ? 0 : bump(v, 3.5, 1.1); tick.visible = k > 0; tick.scale.setScalar(pop(0.3 * u * Math.min(1, k * 1.6))); tick.position.set(bx, floor + H + 0.32 * u, 0.1 * u);
    },
  };
}

function dictionary(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), bx = B.maxX + 0.35 * u, by = B.cy, W = 0.34 * u, H = 0.44 * u, PAGE = 0xfaf6ea;
  const lines = Array.from({ length: 7 }, (_, i) => [G.box(W * 0.75, 0.012 * u, 0.004 * u, W / 2, H * 0.36 - i * 0.055 * u, 0.052 * u), 0x8a90a0]);
  const block = solidProp([[G.box(W, H, 0.1 * u, W / 2, 0, 0), PAGE], [G.box(0.03 * u, H, 0.11 * u, 0, 0, 0), 0x6a2a2a], ...lines], 0.45);
  const hinge = (mesh) => { const p = new THREE.Group(); p.add(mesh); p.position.set(bx, by, 0); return p; };
  const cover = hinge(solidProp([[G.box(W, H, 0.015 * u, W / 2, 0, 0.058 * u), 0x8a2a2a], [G.box(W * 0.6, 0.04 * u, 0.004 * u, W / 2, H * 0.2, 0.067 * u), 0xffd040]], 0.4));
  const page = hinge(solidProp([[G.box(W * 0.98, H * 0.98, 0.004 * u, W / 2, 0, 0.054 * u), PAGE]], 0.45));
  const mark = solidProp([[G.box(W * 0.8, 0.04 * u, 0.004 * u, 0, 0, 0), 0xffe040]], 0.9), lens = solidProp([[G.torus(0.08 * u, 0.012 * u), 0x3a3a44], [G.cyl(0.075 * u, 0.075 * u, 0.004 * u, 0, 0, 0, Math.PI / 2), 0xbfe8ff], [G.box(0.025 * u, 0.16 * u, 0.02 * u, 0.1 * u, -0.1 * u, 0, 0.7), 0x5a3a20]], 0.4);
  block.position.set(bx, by, 0); mark.position.set(bx + W / 2, by + H * 0.36 - 3 * 0.055 * u, 0.057 * u); mark.material.transparent = true; mark.material.opacity = 0.6;
  group.add(block, cover, page, mark, lens);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.5, 'out'], find: [2.2, 0.5, 'out'], close: [4.3, 0.5, 'in'] }), o = pre ? 0 : T.open - T.close;
      cover.rotation.y = -Math.PI * 0.92 * o;
      const fl = v > 0.8 && v < 2.1 ? ((v - 0.8) / 0.26) % 1 : 0; page.visible = fl > 0; page.rotation.y = -Math.PI * 0.92 * fl;
      const m = pre ? 0 : T.find * (1 - T.close); mark.visible = m > 0.01; mark.scale.set(pop(m), 1, 1);
      lens.visible = !pre && T.find > 0 && T.close < 1; lens.position.set(bx + W * 0.5 + 0.5 * u * (1 - T.find) + 0.4 * u * T.close, mark.position.y + 0.3 * u * (1 - T.find), 0.09 * u);
    },
  };
}

function handOver(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.3 * u, bx = B.maxX + 1.05 * u;
  const A = createPerson({ u: 0.82 * u, shirt: 0x40a0e0 }), Bp = createPerson({ u: 0.82 * u, shirt: 0xe07ab0 });
  const S = 0.16 * u, parcel = solidProp([[G.box(S * 1.2, S, S, 0, 0, 0), 0xc89a60], [G.box(S * 1.22, 0.02 * u, S * 1.02, 0, 0, 0), 0xe8d8b0], [G.box(0.02 * u, S * 1.02, S * 1.02, 0, 0, 0), 0xe8d8b0]], 0.4), hrt = heart(u, { s: 0.14 });
  group.add(A.group, Bp.group, parcel, hrt);
  const loop = 5.0, a1 = new THREE.Vector3(), a2 = new THREE.Vector3(), b1 = new THREE.Vector3(), b2 = new THREE.Vector3();
  return {
    group,
    step(t) {
      const S0 = acts(ctx, t, loop), pre = S0.u < 0, v = pre ? -1 : S0.v;
      const T = timeline(v, { give: [0.2, 0.6], take: [0.7, 0.5], pass: [1.3, 0.6], drop: [2.0, 0.4], bow: [2.3, 0.4], up: [3.1, 0.4], swap: [4.3, 0.5] });
      A.reset().face(1.3); Bp.reset().face(-1.3);
      const armA = 1.3 * (T.give - T.drop) + 0.6 * (1 - T.give) * (1 - T.pass), armB = 1.3 * T.take * (1 - 0.4 * T.swap);
      A.bone('armL').rotation.x = A.bone('armR').rotation.x = armA; Bp.bone('armL').rotation.x = Bp.bone('armR').rotation.x = armB; Bp.lean(0.6 * (T.bow - T.up));
      A.group.position.set(ax, floor, 0.1 * u); Bp.group.position.set(bx, floor, 0.1 * u); A.update(); Bp.update();
      bonePoint(A, 'handL', 0.5, a1); bonePoint(A, 'handR', 0.5, a2); bonePoint(Bp, 'handL', 0.5, b1); bonePoint(Bp, 'handR', 0.5, b2);
      const f = pre ? 0 : T.pass, sw = T.swap, x = lerp((a1.x + a2.x) / 2, (b1.x + b2.x) / 2, f), y = lerp((a1.y + a2.y) / 2, (b1.y + b2.y) / 2, f) + 0.08 * u * Math.sin(Math.PI * f);
      parcel.position.set(x, y + 0.05 * u, 0.12 * u); parcel.scale.setScalar(pop(sw > 0 ? Math.abs(1 - 2 * sw) : 1)); if (sw > 0.5) parcel.position.set((a1.x + a2.x) / 2, (a1.y + a2.y) / 2 + 0.05 * u, 0.12 * u);
      const h = pre ? 0 : bump(v, 2.4, 1.6); hrt.visible = h > 0; hrt.scale.setScalar(pop(h)); hrt.position.set(bx, floor + 0.95 * u + 0.15 * u * h, 0.1 * u);
    },
  };
}

function beachDay(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.7 * u;
  const shore = solidProp([[G.box(0.5 * u, 0.08 * u, 0.6 * u, -0.35 * u, 0.04 * u, 0), 0xf0d898], [G.box(0.8 * u, 0.1 * u, 0.6 * u, 0.3 * u, 0.02 * u, 0), 0x2a8ad8]], 0.4);
  shore.position.set(sx, floor, 0);
  const umb = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.6 * u, 0, 0.3 * u, 0), 0xf4f4f4], [G.cone(0.3 * u, 0.13 * u, 0, 0.62 * u, 0), 0xe04848], [G.cone(0.16 * u, 0.07 * u, 0, 0.66 * u, 0.0), 0xffffff]], 0.4);
  umb.position.set(sx - 0.42 * u, floor + 0.06 * u, -0.1 * u); umb.rotation.z = 0.12;
  const foam = many([[G.sphere(0.035 * u, 0, 0, 0, 1.6, 0.6, 1), 0xffffff]], 8, 0.7), kid = createPerson({ u: 0.55 * u, shirt: 0xffd040 });
  const ring = solidProp([[G.torus(0.13 * u, 0.045 * u).rotateX(Math.PI / 2), 0xff6a9a]], 0.5), ball = solidProp([[G.sphere(0.07 * u), 0xffffff], [G.torus(0.07 * u, 0.012 * u), 0xe04848], [G.torus(0.07 * u, 0.012 * u).rotateY(Math.PI / 2), 0x3a7ad0]], 0.5), sun = emblemProp('sun', 0.4 * u);
  sun.position.set(sx + 0.4 * u, B.maxY + 0.05 * u, -0.3 * u);
  group.add(shore, umb, foam, kid.group, ring, ball, sun);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, bob = 0.02 * u * Math.sin(t * 3), kx = sx + 0.3 * u, wy = floor + 0.07 * u;
      kid.reset().face(-0.3); kid.raise('L', 2.4 + 0.4 * Math.sin(v * 8) * bump(v, 0.3, 1.4)); kid.group.position.set(kx, wy - 0.22 * u + bob, 0.1 * u); kid.group.rotation.z = 0.08 * Math.sin(t * 2.2); kid.update();
      ring.position.set(kx, wy + bob, 0.1 * u); ring.rotation.z = kid.group.rotation.z;
      const f = pre ? 0 : between(v, 1.8, 2.8), [x, y] = arc([sx - 0.45 * u, floor + 0.15 * u], [kx + 0.18 * u, wy], 0.5 * u, f);
      ball.visible = !pre && f > 0 && v < 4.4; ball.position.set(x, f >= 1 ? wy + 0.03 * u + bob : y, 0.15 * u); ball.rotation.z = -v * 4;
      const sp = between(v, 2.8, 3.4);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, s = sp > 0 && sp < 1 ? 1 - sp : 0, w = (t * 0.3 + i / 8) % 1; foam.set(i, sp > 0 && sp < 1 ? kx + 0.18 * u + Math.cos(a) * 0.15 * u * sp : sx - 0.05 * u + 0.75 * u * w, sp > 0 && sp < 1 ? wy + 0.15 * u * Math.sin(Math.PI * sp) * Math.abs(Math.sin(a)) : wy + 0.01 * u, 0.2 * u + 0.04 * u * Math.sin(i), sp > 0 && sp < 1 ? s : 0.8 * Math.sin(Math.PI * w)); }
      foam.commit(); sun.idle(t);
    },
  };
}

function houseHeart(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.55 * u, W = 0.72 * u, H = 0.5 * u, D = 0.4 * u;
  const tri = new THREE.Shape(); tri.moveTo(-4.4, 0); tri.lineTo(4.4, 0); tri.lineTo(0, 2.6); tri.lineTo(-4.4, 0); const k = W / 8;
  const house = solidProp([[G.box(W, 0.03 * u, D, 0, 0.015 * u, 0), 0xc89a60], [G.box(W, H, 0.02 * u, 0, H / 2, -D / 2), 0xf6e8d0], [G.box(0.02 * u, H, D, -W / 2, H / 2, 0), 0xf0dcc0], [G.box(0.02 * u, H, D, W / 2, H / 2, 0), 0xf0dcc0], [G.extrude(tri, 4.6).scale(k, k, k).translate(0, H, 0), 0xd04030], [G.cyl(0.1 * u, 0.1 * u, 0.12 * u, 0, 0.06 * u, -0.02 * u, 0, 0, 0, 24), WOOD], [G.cyl(0.035 * u, 0.03 * u, 0.04 * u, 0, 0.14 * u, -0.02 * u), 0x3a7ad0]], 0.35);
  const front = new THREE.Group(), frontM = solidProp([[G.box(W, H, 0.02 * u, W / 2, H / 2, 0), 0xffe8c8], [G.box(0.12 * u, 0.22 * u, 0.006 * u, W * 0.3, 0.11 * u, 0.012 * u), 0x8a5a30], [G.box(0.16 * u, 0.12 * u, 0.006 * u, W * 0.7, 0.3 * u, 0.012 * u), 0x8ad0ff]], 0.35);
  front.add(frontM); front.position.set(hx - W / 2, floor, D / 2 - 0.01 * u); house.position.set(hx, floor, 0);
  const mom = createPerson({ u: 0.45 * u, shirt: 0xe07ab0 }), kid = createPerson({ u: 0.34 * u, shirt: 0x40a0e0 }), hrt = heart(u, { s: 0.18 });
  group.add(house, front, mom.group, kid.group, hrt);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.3, 0.6, 'out'], close: [4.2, 0.5, 'in'] }), o = pre ? 0 : T.open - T.close;
      front.rotation.y = -1.9 * o;
      mom.reset().face(0.5); kid.reset().face(-0.5); mom.raise('R', 1.0 + 0.3 * Math.sin(v * 7) * bump(v, 1.0, 1.4)); kid.raise('L', 2.5 * bump(v, 1.1, 1.4));
      mom.group.position.set(hx - 0.18 * u, floor + 0.03 * u, 0.02 * u); kid.group.position.set(hx + 0.18 * u, floor + 0.03 * u + 0.04 * u * bump(v, 1.4, 0.3), 0.02 * u); mom.update(); kid.update();
      const h = pre ? 0 : bump(v, 1.2, 2.8); hrt.visible = h > 0; hrt.scale.setScalar(pop(Math.min(1, h * 1.5))); hrt.position.set(hx, floor + H + 0.35 * u + 0.25 * u * between(v, 1.2, 4.0), 0.1 * u); hrt.rotation.y = 0.4 * Math.sin(t * 2);
    },
  };
}

function dinnerTable(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, night = spec.time === 'night', tx = B.maxX + 0.55 * u, ty = floor + 0.3 * u;
  const SKY = night ? 0x141c40 : 0xff8a40, wx = tx + 0.15 * u, wy = floor + 0.78 * u;
  const room = solidProp([[G.box(0.4 * u, 0.3 * u, 0.01 * u, 0, 0, 0), SKY], [G.box(0.44 * u, 0.025 * u, 0.02 * u, 0, 0.16 * u, 0.01 * u), WOOD], [G.box(0.44 * u, 0.025 * u, 0.02 * u, 0, -0.16 * u, 0.01 * u), WOOD], [G.box(0.025 * u, 0.32 * u, 0.02 * u, -0.21 * u, 0, 0.01 * u), WOOD], [G.box(0.025 * u, 0.32 * u, 0.02 * u, 0.21 * u, 0, 0.01 * u), WOOD]], night ? 0.6 : 0.8);
  room.position.set(wx, wy, -0.35 * u);
  const sky = night ? solidProp([[G.torus(0.05 * u, 0.02 * u, Math.PI * 1.2, 0, 0, 0, 1.2), 0xfff0b0], ...[[-0.12, 0.08], [0.1, 0.1], [0.14, -0.05], [-0.06, -0.08]].map(([x, y]) => [G.sphere(0.01 * u, x * u, y * u, 0), 0xffffff])], 1.0) : solidProp([[new THREE.CircleGeometry(0.07 * u, 24), 0xffe060]], 1.0);
  const table = solidProp([[G.box(0.8 * u, 0.03 * u, 0.36 * u, 0, ty - floor, 0), WOOD], [G.box(0.04 * u, ty - floor, 0.04 * u, -0.34 * u, (ty - floor) / 2, 0.12 * u), 0x8a5a30], [G.box(0.04 * u, ty - floor, 0.04 * u, 0.34 * u, (ty - floor) / 2, 0.12 * u), 0x8a5a30]], 0.35);
  table.position.set(tx, floor, 0.05 * u);
  const dishes = solidProp([[G.sphere(0.07 * u, -0.18 * u, 0.03 * u, 0, 1, 0.8, 1), 0xffffff], [G.cyl(0.08 * u, 0.05 * u, 0.06 * u, -0.18 * u, 0, 0), 0xe8e8f0], [G.cyl(0.07 * u, 0.045 * u, 0.06 * u, 0.02 * u, 0, 0.03 * u), 0xc03030], [G.cyl(0.11 * u, 0.1 * u, 0.012 * u, 0.22 * u, -0.02 * u, 0, 0, 0, 0, 24), 0xf4f4f8], [G.sphere(0.06 * u, 0.22 * u, 0.0, 0, 1.6, 0.5, 0.7), 0x8a96a8]], 0.45);
  const steam = many(PUFF(u, 0xffffff), 6, 0.5), kid = createPerson({ u: 0.85 * u, shirt: 0x40a0e0 }), sticks = chopsticks(0.55 * u);
  kid.rig.attach('handR', sticks, 0.6);
  const extra = night ? { lamp: solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.3 * u, 0, 0.15 * u, 0), 0x3a3a44], [G.cone(0.14 * u, 0.1 * u, 0, -0.03 * u, 0), 0xf0a040], [G.sphere(0.04 * u, 0, -0.08 * u, 0), 0xfff0b0]], 0.9), mom: createPerson({ u: 0.8 * u, shirt: 0xe07ab0 }) } : {};
  group.add(room, sky, table, dishes, steam, kid.group);
  if (night) { extra.lamp.position.set(tx, floor + 0.95 * u, 0.05 * u); group.add(extra.lamp, extra.mom.group); }
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { d: [0.1, 0.4, 'back'], away: [4.8, 0.4] }), d = pre ? 1 : T.d * (1 - T.away);
      dishes.visible = d > 0.01; dishes.scale.setScalar(pop(d)); dishes.position.set(tx, ty + 0.05 * u, 0.1 * u);
      if (night) sky.position.set(wx - 0.06 * u, wy + 0.04 * u, -0.33 * u); else sky.position.set(wx + 0.06 * u, wy + 0.08 * u - 0.2 * u * (pre ? 0 : v / loop), -0.34 * u);
      sky.visible = night || v / loop < 0.95 || pre;
      const pray = bump(v, 0.7, 1.0) > 0 ? 1 : 0, eat = v > 1.9 && v < 4.6 ? Math.max(0, Math.sin((v - 1.9) * 4)) : 0;
      kid.reset().face(0); kid.group.position.set(tx - 0.08 * u, floor - 0.04 * u, -0.12 * u);
      if (pray) { kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 1.0; kid.bone('foreL').rotation.x = kid.bone('foreR').rotation.x = 1.2; kid.bone('armL').rotation.z = -0.3; kid.bone('armR').rotation.z = 0.3; }
      else { kid.bone('armR').rotation.x = 0.9 + 0.6 * eat; kid.bone('foreR').rotation.x = 0.8 + 0.9 * eat; }
      kid.update(); sticks.visible = !pray && !pre;
      if (night) { extra.mom.reset().face(-0.8); extra.mom.raise('R', 0.3 + 0.5 * bump(v, 2.4, 1.0)); extra.mom.group.position.set(tx + 0.42 * u, floor - 0.06 * u, -0.1 * u); extra.mom.update(); }
      wisps(steam, 0, 6, tx - 0.18 * u + (night ? 0.2 * u : 0), ty + 0.12 * u, t, u, { period: 1.8, rise: 0.4, size: 0.8, on: d });
      steam.commit();
    },
  };
}

function riceCooker(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.38 * u, R = 0.2 * u, H = 0.24 * u;
  const body = solidProp([[G.cyl(R, R * 0.95, H, 0, H / 2, 0, 0, 0, 0, 28), 0xf4f4f8], [G.cyl(R * 1.02, R * 1.02, 0.03 * u, 0, 0.015 * u, 0, 0, 0, 0, 28), 0x8a8e96], [G.box(0.12 * u, 0.06 * u, 0.02 * u, 0, H * 0.5, R * 0.95), 0x3a3a44], [G.sphere(0.015 * u, 0.03 * u, H * 0.5, R * 0.97), 0xff6040], [G.cyl(R * 0.9, R * 0.9, 0.02 * u, 0, H - 0.02 * u, 0, 0, 0, 0, 28), 0xffffff]], 0.4);
  body.position.set(cx, floor, 0);
  const lid = new THREE.Group(), lidM = solidProp([[new THREE.SphereGeometry(R * 1.02, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1).translate(0, 0, R), 0xe8e8f0], [G.cyl(0.03 * u, 0.03 * u, 0.03 * u, 0, R * 0.42, R), 0x8a8e96]], 0.4);
  lid.add(lidM); lid.position.set(cx, floor + H, -R);
  const steam = many(PUFF(u, 0xffffff), 8, 0.6), dish = bowl(0.75 * u, { color: 0xc03030 }), mound = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 0.6, 1), 0xffffff]], 0.6);
  const paddle = solidProp([[G.sphere(0.06 * u, 0, 0, 0, 0.8, 1.1, 0.25), 0xf0e0b0], [G.box(0.03 * u, 0.2 * u, 0.015 * u, 0, 0.15 * u, 0), 0xf0e0b0]], 0.4), lump = solidProp([[G.sphere(0.045 * u), 0xffffff]], 0.6);
  const bx = cx + 0.4 * u; dish.position.set(bx, floor, 0.05 * u); paddle.add(lump); lump.position.set(0, -0.01 * u, 0.02 * u);
  group.add(body, lid, steam, dish, mound, paddle);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.3, 0.35, 'back'], shut: [4.3, 0.3, 'in'] }), o = pre ? 0 : T.open - T.shut;
      lid.rotation.x = -1.6 * o;
      wisps(steam, 0, 8, cx, floor + H + 0.05 * u, t, u, { period: 1.4, rise: 0.55, size: 1.1, on: o });
      steam.commit();
      let heap = 0; const scoops = [0.9, 1.9, 2.9];
      scoops.forEach((s) => { heap += between(v, s + 0.75, s + 0.85); });
      const sc = scoops.map((s) => between(v, s, s + 0.8)).find((f) => f > 0 && f < 1) ?? 0, [px, py] = arc([cx, floor + H + 0.02 * u], [bx, floor + 0.2 * u], 0.3 * u, sc);
      paddle.visible = !pre && v > 0.8 && v < 4.2; paddle.position.set(sc ? px : cx + 0.1 * u, sc ? py : floor + H + 0.05 * u, 0.12 * u); paddle.rotation.z = sc ? -0.5 + sc : 0.4; lump.visible = sc > 0 && sc < 0.95;
      const m = (pre ? 0 : heap / 3) * (1 - between(v, 4.4, 4.8)); mound.visible = m > 0.01; mound.scale.set(pop(0.6 + 0.4 * m), pop(m), pop(0.6 + 0.4 * m)); mound.position.set(bx, floor + 0.1 * u, 0.05 * u);
    },
  };
}

export const SCENES = { 'my-room': myRoom, 'sweep-all': sweepAll, dictionary, 'hand-over': handOver, 'beach-day': beachDay, 'house-heart': houseHeart, 'dinner-table': dinnerTable, 'rice-cooker': riceCooker };
