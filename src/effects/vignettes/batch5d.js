// Batch 5 kanji, part 4.
//   title-stamp  題: a red title band slams onto a notebook cover, a line underlines it, then text lines fill in below
//   inn-sleep    宿: a traveller with a suitcase walks into a little inn under its noren curtain; the window lights, then
//                goes dark and Zzz floats up from the roof
//   grab-apple   取: a hand reaches in, grabs the apple off a table and pulls it away, leaving the table empty
//   gem-test     真: a magnifying glass passes over two gems: the real one sparkles (tick), the fake one cracks in two (cross)
//   photo-snap   写: a person poses with a peace sign; the camera flashes and a photo slides out and develops
//   ocean-ship   洋: waves roll across a wide sea; a ship sails along the horizon, puffing smoke
import * as THREE from 'three';
import { clawMachine, dogHomework, photoWall } from './variants5c.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, handTo, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function titleStamp(ctx, spec, stage) {
  if (spec.outcome === 'dog') return dogHomework(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), nx = B.maxX + 0.4 * u, ny = B.cy, W = 0.46 * u, H = 0.6 * u;
  const book = solidProp([[G.box(W, H, 0.04 * u, 0, 0, 0), 0x3a7ad0], ...Array.from({ length: 6 }, (_, i) => [G.torus(0.025 * u, 0.006 * u, Math.PI * 2, -W / 2, H * 0.4 - i * 0.16 * u * 0.9, 0, 0), 0xc8ccd4])], 0.4);
  book.position.set(nx, ny, 0);
  const band = solidProp([[G.box(W * 0.84, 0.13 * u, 0.012 * u, 0, 0, 0), 0xe04848], ...[[-0.13, 0.07], [-0.03, 0.05], [0.06, 0.08], [0.15, 0.05]].map(([x, w]) => [G.box(w * u, 0.06 * u, 0.004 * u, x * u, 0, 0.008 * u), 0xffffff])], 0.5);
  const line = solidProp([[G.box(1, 0.012 * u, 0.006 * u, 0.5, 0, 0), 0xffe040]], 0.7), body = many([[G.box(W * 0.7, 0.014 * u, 0.006 * u, 0, 0, 0), 0xd8e4f4]], 5, 0.5);
  group.add(book, band, line, body);
  const loop = 4.8, by = ny + H * 0.3;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { slam: [0.3, 0.35, 'in'], line: [0.9, 0.5], text: [1.5, 1.4], out: [4.2, 0.5] }), k = pre ? 1 : 1 - T.out;
      band.visible = (pre || T.slam > 0) && k > 0.01; band.position.set(nx, by + 0.6 * u * (1 - (pre ? 1 : T.slam)), 0.03 * u); band.scale.set(pop(k), pop(k * (1 + 0.3 * bump(v, 0.65, 0.2))), 1);
      const l = pre ? 1 : T.line * k; line.visible = l > 0.01; line.position.set(nx - W * 0.42, by - 0.09 * u, 0.025 * u); line.scale.x = pop(W * 0.84 * l);
      for (let i = 0; i < 5; i++) { const f = pre ? 1 : between(T.text, i / 5, (i + 1) / 5) * k; body.set(i, nx - W * 0.35 * (1 - f), by - 0.17 * u - i * 0.06 * u, 0.025 * u, f > 0.01 ? 1 : 0); }
      body.commit();
    },
  };
}

function innSleep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ix = B.maxX + 0.65 * u, W = 0.6 * u, H = 0.42 * u;
  const inn = solidProp([[G.box(W, H, 0.4 * u, 0, H / 2, 0), 0xe8d8b8], [G.box(W + 0.16 * u, 0.06 * u, 0.5 * u, 0, H + 0.03 * u, 0), 0x3a3a50], [G.box(W * 0.8, 0.05 * u, 0.42 * u, 0, H + 0.09 * u, 0), 0x3a3a50], [G.box(0.18 * u, 0.28 * u, 0.01 * u, -0.14 * u, 0.14 * u, 0.201 * u), 0x2a1a10], [G.box(0.2 * u, 0.1 * u, 0.02 * u, 0.12 * u, H + 0.16 * u, 0.1 * u), 0x6a3a1a]], 0.35);
  inn.position.set(ix, floor, -0.15 * u);
  const noren = solidProp([0, 1, 2].map((i) => [G.box(0.055 * u, 0.12 * u, 0.006 * u, -0.14 * u + (i - 1) * 0.06 * u, 0.22 * u, 0.212 * u), 0x203a80]), 0.4); noren.position.set(ix, floor, -0.15 * u);
  const win = solidProp([[G.box(0.14 * u, 0.12 * u, 0.01 * u, 0, 0, 0), 0xffffff]], 0.7); win.position.set(ix + 0.14 * u, floor + 0.26 * u, 0.06 * u);
  const p = createPerson({ u: 0.6 * u, shirt: 0x9a60d0 }), bag = emblemProp('suitcase', 0.2 * u, { color: 0xe07a30 }), zzz = emblemProp('zzz', 0.3 * u);
  group.add(inn, noren, win, p.group, bag, zzz);
  const loop = 5.6, dark = new THREE.Color(0x2a3048), lit = new THREE.Color(0xffd870), hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.6], on: [1.8, 0.2], off: [3.0, 0.3], z: [3.2, 0.4, 'back'], zOff: [5.0, 0.4] });
      const door = ix - 0.14 * u, inside = T.walk >= 1;
      p.reset().face(T.walk > 0.85 ? Math.PI : 'right').walk(v * 7, T.walk > 0 && T.walk < 1 ? 0.7 : 0); p.lean(0.15); p.bone('head').rotation.x = 0.3;
      p.group.position.set(lerp(B.maxX + 0.1 * u, door, Math.min(1, T.walk * 1.15)), floor, lerp(0.3 * u, 0.1 * u, T.walk)); p.group.visible = !pre && !inside; p.update(); bonePoint(p, 'handR', 0.8, hand);
      bag.visible = p.group.visible; bag.position.set(hand.x, hand.y - 0.08 * u, hand.z + 0.03 * u); bag.idle(0);
      win.material.color.copy(dark).lerp(lit, pre ? 0 : T.on - T.off);
      const z = pre ? 0 : T.z * (1 - T.zOff); zzz.visible = z > 0.01; zzz.scale.setScalar(pop(0.3 * u * z)); zzz.position.set(ix + 0.15 * u, floor + H + 0.35 * u + 0.1 * u * Math.sin(t), 0.0); zzz.idle(t);
    },
  };
}

function grabApple(ctx, spec, stage) {
  if (spec.outcome === 'claw') return clawMachine(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.4 * u, TH = 0.36 * u;
  const table = solidProp([[G.box(0.46 * u, 0.03 * u, 0.28 * u, 0, TH, 0), 0xc89a60], [G.box(0.03 * u, TH, 0.03 * u, -0.19 * u, TH / 2, 0.1 * u), 0x8a5a30], [G.box(0.03 * u, TH, 0.03 * u, 0.19 * u, TH / 2, 0.1 * u), 0x8a5a30], [G.cyl(0.1 * u, 0.1 * u, 0.01 * u, 0, TH + 0.02 * u, 0, 0, 0, 0, 20), 0xf4f4f8]], 0.35);
  table.position.set(tx, floor, -0.05 * u);
  const apple = solidProp([[G.sphere(0.08 * u), 0xe02830], [G.cyl(0.006 * u, 0.006 * u, 0.04 * u, 0, 0.08 * u, 0), 0x5a3a1a], [G.sphere(0.03 * u, 0.025 * u, 0.085 * u, 0, 1.5, 0.4, 0.8), 0x40a040]], 0.6);
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x40a0e0 });
  group.add(table, apple, hand.group);
  const loop = 5.0, rest = [tx, floor + TH + 0.1 * u, -0.05 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { reach: [0.2, 0.7, 'out'], grip: [0.95, 0.2], pull: [1.25, 0.6, 'in'], ret: [3.6, 0.6, 'out'], let: [4.25, 0.2], away: [4.5, 0.4, 'in'] });
      const off = T.pull - T.ret, held = T.grip - T.let > 0.5, x = rest[0] + 0.9 * u * off, y = rest[1] + 0.2 * u * off;
      apple.position.set(held ? x : rest[0], held ? y : rest[1], rest[2]); apple.visible = !(held && off > 0.95);
      hand.group.visible = !pre && T.reach > 0 && T.away < 1 && !(off > 0.95); hand.group.rotation.set(0, 0, 1.9); hand.pose('open', 'grip', T.grip - T.let);
      handTo(hand, held ? x : rest[0] + 0.6 * u * (1 - T.reach) + 0.6 * u * T.away, (held ? y : rest[1]) + 0.04 * u, rest[2] + 0.04 * u); hand.update();
    },
  };
}

function gemTest(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u, gy = floor + 0.32 * u;
  const cushion = solidProp([[G.box(0.7 * u, 0.12 * u, 0.3 * u, 0, 0.18 * u, 0), 0x8a2a5a], [G.box(0.06 * u, 0.24 * u, 0.06 * u, 0, 0.0, 0), 0x6a4020]], 0.4); cushion.position.set(cx, floor + 0.08 * u, 0);
  const gemGeo = () => new THREE.OctahedronGeometry(0.1 * u).scale(1, 1.3, 1);
  const real = solidProp([[gemGeo(), 0x60e8ff]], 0.7), half = (s) => solidProp([[new THREE.OctahedronGeometry(0.1 * u).scale(1, 1.3, 1).translate(s * 0.005 * u, 0, 0), 0x60e8ff]], 0.5), fL = half(-1), fR = half(1);
  const lens = solidProp([[G.torus(0.11 * u, 0.014 * u), 0x3a3a44], [G.cyl(0.105 * u, 0.105 * u, 0.004 * u, 0, 0, 0, Math.PI / 2), 0xbfe8ff], [G.box(0.03 * u, 0.2 * u, 0.02 * u, 0.13 * u, -0.13 * u, 0, 0.7), 0x5a3a20]], 0.4);
  lens.material.transparent = true; lens.material.opacity = 0.85;
  const shine = burst(u, { s: 0.36, n: 8, color: 0xffffff }), ok = emblemProp('check', 0.22 * u), no = emblemProp('cross', 0.22 * u);
  group.add(cushion, real, fL, fR, lens, shine, ok, no);
  const loop = 5.6, rx = cx - 0.17 * u, fx = cx + 0.17 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { a: [0.2, 0.6], b: [2.0, 0.6], crack: [2.7, 0.4, 'out'], mend: [5.0, 0.4], away: [4.0, 0.5] });
      real.position.set(rx, gy + 0.03 * u * Math.sin(t * 2), 0.0); real.rotation.y = t;
      const c = pre ? 0 : T.crack - T.mend; [fL, fR].forEach((h, i) => { const s = i ? 1 : -1; h.position.set(fx + s * 0.06 * u * c, gy - 0.05 * u * c, 0.0); h.rotation.set(0, i ? 0 : Math.PI, s * 0.6 * c); h.scale.set(1, 1, 1); h.material.color.setHex(c > 0.5 ? 0x8a9aa0 : 0xffffff); });
      fL.scale.x = 0.5; fR.scale.x = 0.5;
      const lx = T.b > 0 ? lerp(rx, fx, T.b) : lerp(cx + 0.6 * u, rx, T.a), lxx = lx + 0.6 * u * T.away; lens.visible = !pre && T.a > 0 && T.away < 1; lens.position.set(lxx, gy + 0.02 * u, 0.12 * u);
      const s = pre ? 0 : bump(v, 0.8, 1.2); shine.visible = s > 0; shine.scale.setScalar(pop(s)); shine.position.set(rx, gy, -0.05 * u); shine.rotation.z = t;
      const o = pre ? 0 : bump(v, 0.9, 3.8); ok.visible = o > 0; ok.scale.setScalar(pop(0.22 * u * Math.min(1, o * 3))); ok.position.set(rx, gy + 0.3 * u, 0.05 * u);
      const n = pre ? 0 : bump(v, 2.8, 2.0); no.visible = n > 0; no.scale.setScalar(pop(0.22 * u * Math.min(1, n * 3))); no.position.set(fx, gy + 0.3 * u, 0.05 * u);
    },
  };
}

function photoSnap(ctx, spec, stage) {
  if (spec.outcome === 'wall') return photoWall(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.3 * u, cx = B.maxX + 0.95 * u, cy = floor + 0.55 * u;
  const p = createPerson({ u: 0.75 * u, shirt: 0xe07ab0 }), cam = solidProp([[G.box(0.24 * u, 0.16 * u, 0.12 * u, 0, 0, 0), 0x2a2a30], [G.cyl(0.055 * u, 0.055 * u, 0.06 * u, -0.02 * u, 0, 0.08 * u, Math.PI / 2), 0x14141c], [G.cyl(0.04 * u, 0.04 * u, 0.062 * u, -0.02 * u, 0, 0.08 * u, Math.PI / 2), 0x3a6ad8], [G.box(0.05 * u, 0.03 * u, 0.01 * u, 0.07 * u, 0.05 * u, 0.062 * u), 0xffffff], [G.box(0.18 * u, 0.02 * u, 0.1 * u, 0, -0.09 * u, 0), 0xe04848]], 0.4), tripod = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.48 * u, -0.06 * u, 0.24 * u, 0, 0, 0, 0.2), 0x3a3a44], [G.cyl(0.008 * u, 0.008 * u, 0.48 * u, 0.06 * u, 0.24 * u, 0, 0, 0, -0.2), 0x3a3a44]], 0.4);
  tripod.position.set(cx, floor, -0.05 * u); cam.position.set(cx, cy, 0.0);
  const flash = burst(u, { s: 0.5, n: 10, color: 0xffffff }), photo = solidProp([[G.box(0.24 * u, 0.28 * u, 0.006 * u, 0, 0, 0), 0xffffff]], 0.6), pic = solidProp([[G.box(0.2 * u, 0.2 * u, 0.008 * u, 0, 0.02 * u, 0), 0xffffff]], 0.6), mini = solidProp([[G.cyl(0.025 * u, 0.03 * u, 0.07 * u, 0, -0.03 * u, 0.006 * u), 0xe07ab0], [G.sphere(0.025 * u, 0, 0.03 * u, 0.006 * u), 0xffd2b0], [G.box(0.05 * u, 0.012 * u, 0.004 * u, 0.04 * u, 0.04 * u, 0.006 * u, 0.8), 0xffd2b0]], 0.6);
  group.add(p.group, tripod, cam, flash, photo, pic, mini);
  const loop = 5.4, grey = new THREE.Color(0x303038), sky = new THREE.Color(0x8ad0ff);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { pose: [0.2, 0.3, 'back'], out: [1.4, 0.5], dev: [2.0, 1.4], drop: [4.6, 0.5] }), pose = T.pose * (1 - between(v, 3.6, 4.0));
      p.reset().face(0.5); p.raise('R', 2.5 * pose); p.bone('foreR').rotation.z = -0.6 * pose; p.group.position.set(px, floor + 0.03 * u * bump(v, 0.3, 0.3), 0.1 * u); p.update();
      const f = pre ? 0 : bump(v, 1.1, 0.3); flash.visible = f > 0; flash.scale.setScalar(pop(f)); flash.position.set(cx - 0.05 * u, cy + 0.05 * u, 0.1 * u);
      const k = pre ? 0 : T.out * (1 - T.drop), y = cy - 0.12 * u - 0.22 * u * T.out; [photo, pic, mini].forEach((o, i) => { o.visible = k > 0.01; o.position.set(cx, y + (i ? 0.02 * u : 0), 0.12 * u + i * 0.003 * u); o.scale.setScalar(pop(k)); });
      pic.material.color.copy(grey).lerp(sky, T.dev); mini.scale.setScalar(pop(k * T.dev));
    },
  };
}

function oceanShip(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u;
  const sea = solidProp([[G.box(1.4 * u, 0.2 * u, 1.0 * u, 0, 0.1 * u, -0.3 * u), 0x1a6ac0]], 0.4); sea.position.set(sx, floor, 0);
  const waves = many([[G.sphere(0.07 * u, 0, 0, 0, 1.8, 0.35, 0.6), 0xe8f4ff]], 10, 0.6);
  const ship = solidProp([[G.box(0.36 * u, 0.08 * u, 0.12 * u, 0, 0.04 * u, 0), 0xe04848], [G.box(0.4 * u, 0.03 * u, 0.13 * u, 0, 0.095 * u, 0), 0xffffff], [G.box(0.18 * u, 0.08 * u, 0.1 * u, -0.03 * u, 0.15 * u, 0), 0xffffff], ...[-0.08, -0.03, 0.02].map((x) => [G.sphere(0.01 * u, x * u, 0.16 * u, 0.051 * u), 0x203048]), [G.cyl(0.025 * u, 0.03 * u, 0.1 * u, 0.06 * u, 0.22 * u, 0), 0x3a3a44]], 0.45);
  const smoke = many(PUFF(u, 0xd8d8e0), 5, 0.5);
  group.add(sea, waves, ship, smoke);
  const loop = 5.0, wy = floor + 0.2 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.4 : between(v, 0, loop), x = sx - 0.55 * u + 1.1 * u * f, bob = 0.02 * u * Math.sin(t * 3);
      ship.position.set(x, wy + bob, -0.45 * u); ship.rotation.z = 0.06 * Math.sin(t * 2.5); ship.scale.setScalar(pop(Math.min(1, Math.min(f, 1 - f) * 8)));
      for (let i = 0; i < 10; i++) { const g = ((t * 0.25 + i / 10) % 1), row = i % 3; waves.set(i, sx - 0.65 * u + 1.3 * u * g, wy + 0.015 * u * Math.sin(t * 4 + i), 0.15 * u - 0.25 * u * row, Math.sin(Math.PI * g) * (1.2 - 0.2 * row)); }
      waves.commit();
      wisps(smoke, 0, 5, x + 0.06 * u, wy + 0.27 * u, t, u, { period: 1.8, rise: 0.35, sway: -0.08, size: 0.8, on: ship.scale.x }); smoke.commit();
    },
  };
}

export const SCENES = { 'title-stamp': titleStamp, 'inn-sleep': innSleep, 'grab-apple': grabApple, 'gem-test': gemTest, 'photo-snap': photoSnap, 'ocean-ship': oceanShip };
