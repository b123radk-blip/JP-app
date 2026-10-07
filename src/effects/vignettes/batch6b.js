// Batch 6 kanji, part 2.
//   wheelbarrow   運: a person pushes a wheelbarrow of boxes along; a four-leaf clover drifts down into it with a sparkle
//   stand-vase    台: a hand sets a little wooden stand down, then places a vase of flowers on top of it
//   coin-keep     有: a hand opens to show a gold coin, closes over it, opens again: still there, it's mine (a sparkle)
//   butler-door   仕: a butler in a bow tie bows and holds the door open; a guest walks in
//   devil-vase    悪: a little red devil with horns and a tail sneaks up, knocks a vase off its stand and snickers as it smashes
//   trunk-thick   太: a thin sapling's trunk swells thicker and thicker into a fat old tree; its rings show on a cut stump
import * as THREE from 'three';
import { kitchen, redCarpet } from './variants6a.js';
import { hardhat, pencilCrayon, thumbsDown } from './variants6b.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, handTo } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), WOOD = 0xc89a60;

function wheelbarrow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const barrow = solidProp([[G.box(0.3 * u, 0.12 * u, 0.22 * u, 0, 0.16 * u, 0), 0x3a7ad0], [G.cyl(0.06 * u, 0.06 * u, 0.04 * u, 0.16 * u, 0.06 * u, 0, Math.PI / 2), 0x2a2a30], ...[-0.08, 0.08].map((z) => [G.box(0.36 * u, 0.02 * u, 0.02 * u, -0.26 * u, 0.2 * u, z * u, -0.25), 0x8a5a30]), [G.box(0.1 * u, 0.09 * u, 0.09 * u, -0.05 * u, 0.26 * u, 0.04 * u), 0xc89a60], [G.box(0.09 * u, 0.08 * u, 0.09 * u, 0.06 * u, 0.26 * u, -0.03 * u), 0xe0b070], [G.box(0.08 * u, 0.07 * u, 0.08 * u, 0.0, 0.33 * u, 0.0), 0xa87a40]], 0.4);
  const clover = solidProp([0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + 0.785; return [G.sphere(0.035 * u, Math.cos(a) * 0.035 * u, Math.sin(a) * 0.035 * u, 0, 1, 1, 0.3), 0x40c040]; }).concat([[G.cyl(0.005 * u, 0.005 * u, 0.06 * u, 0, -0.05 * u, 0), 0x2a8a2a]]), 0.6);
  const p = createPerson({ u: 0.75 * u, shirt: 0xe04848 }), shine = stars(u, { r: 0.12, s: 0.06, n: 4, color: 0xfff0a0 });
  group.add(barrow, clover, p.group, shine);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.5 : between(v, 0.1, 4.8), x = B.maxX + 0.45 * u + 0.6 * u * f, k = pop(Math.min(1, Math.min(f, 1 - f) * 10));
      barrow.position.set(x + 0.3 * u, floor, 0.1 * u); barrow.scale.setScalar(k); barrow.rotation.z = 0.02 * Math.sin(v * 9);
      p.reset().face('right').walk(v * 8, pre ? 0 : 1).lean(0.3); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.0; p.group.position.set(x - 0.05 * u, floor, 0.1 * u); p.group.scale.setScalar(k); p.update();
      const c = pre ? 1 : between(v, 1.0, 2.6), [cx, cy] = arc([x + 0.6 * u, floor + 1.1 * u], [x + 0.3 * u, floor + 0.4 * u], 0.05 * u, c);
      clover.position.set(cx + 0.06 * u * Math.sin(v * 3) * (1 - c), cy, 0.1 * u); clover.rotation.z = v * 2 * (1 - c); clover.scale.setScalar(k); clover.visible = pre || v > 1.0;
      const s = pre ? 0 : bump(v, 2.5, 1.6); shine.visible = s > 0; shine.scale.setScalar(pop(s)); shine.position.set(x + 0.3 * u, floor + 0.45 * u, 0.1 * u); shine.rotation.y = t * 3;
    },
  };
}

function standVase(ctx, spec, stage) {
  if (spec.outcome === 'kitchen') return kitchen(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.4 * u, SH = 0.3 * u;
  const stand = solidProp([[G.box(0.3 * u, 0.04 * u, 0.24 * u, 0, SH, 0), WOOD], ...[[-0.12, 0.09], [0.12, 0.09], [-0.12, -0.09], [0.12, -0.09]].map(([x, z]) => [G.cyl(0.015 * u, 0.012 * u, SH, x * u, SH / 2, z * u), 0x8a5a30])], 0.35);
  const vase = solidProp([[new THREE.LatheGeometry([[0, 0], [0.05, 0], [0.07, 0.06], [0.05, 0.14], [0.035, 0.18], [0.045, 0.2]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 20), 0x3a6ad8], ...[-0.4, 0, 0.4].map((a) => [G.cyl(0.004 * u, 0.004 * u, 0.16 * u, Math.sin(a) * 0.04 * u, 0.26 * u, 0, 0, 0, -a), 0x3a9a3a]), ...[-0.4, 0, 0.4].map((a, i) => [G.sphere(0.03 * u, Math.sin(a) * 0.08 * u, 0.34 * u, 0), [0xff6a9a, 0xffe040, 0xff8a40][i]])], 0.45);
  const hand = createHand({ u: 0.5 * u, side: -1, sleeve: 0x60b060 });
  group.add(stand, vase, hand.group);
  const loop = 5.0, top = floor + SH + 0.02 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { st: [0.2, 0.5, 'bounce'], va: [1.3, 0.7, 'out'], let: [2.1, 0.2], away: [2.3, 0.5, 'in'], out: [4.4, 0.4] }), k = pre ? 1 : 1 - T.out;
      stand.position.set(sx, floor + 0.5 * u * (1 - (pre ? 1 : T.st)), 0); stand.scale.setScalar(pop(k)); stand.visible = pre || v > 0.15;
      const vy = top + 0.5 * u * (1 - (pre ? 1 : T.va)); vase.position.set(sx, vy, 0); vase.scale.setScalar(pop(k)); vase.visible = pre || v > 1.2;
      hand.group.visible = !pre && v > 1.0 && T.away < 1; hand.group.rotation.set(0, 0, Math.PI * 0.9); hand.pose('grip', 'open', T.let); handTo(hand, sx + 0.02 * u + 0.5 * u * T.away, vy + 0.12 * u + 0.4 * u * (1 - between(v, 1.0, 1.3)) + 0.3 * u * T.away, 0.06 * u); hand.update();
    },
  };
}

function coinKeep(ctx, spec, stage) {
  if (spec.outcome === 'star') return redCarpet(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), hx = B.maxX + 0.4 * u, hy = B.cy - 0.05 * u;
  const hand = createHand({ u: 0.6 * u, side: 1, sleeve: 0xe07a30 }), coin = solidProp([[G.cyl(0.07 * u, 0.07 * u, 0.015 * u, 0, 0, 0, Math.PI / 2, 0, 0, 24), 0xffc830], [G.torus(0.06 * u, 0.006 * u), 0xe0a020]], 0.7), shine = burst(u, { s: 0.35, n: 8, color: 0xfff0a0 });
  group.add(hand.group, coin, shine);
  const loop = 4.8, palm = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, close = pre ? 0 : Math.max(timeline(v, { c: [1.0, 0.3] }).c - timeline(v, { o: [2.2, 0.3] }).o, 0) + timeline(v, { c2: [3.4, 0.3] }).c2 * (1 - between(v, 4.4, 4.7));
      hand.group.rotation.set(-0.5, 0, 0); hand.pose('flat', 'grip', Math.min(1, close)); hand.group.position.set(hx, hy - 0.25 * u + 0.03 * u * bump(v, 3.8, 0.4), 0.05 * u); hand.update();
      hand.rig.pointOn('palm', 0.55, palm); hand.group.updateMatrix(); palm.applyMatrix4(hand.group.matrix);
      coin.visible = close < 0.6; coin.position.set(palm.x, palm.y + 0.03 * u + 0.03 * u * bump(v, 0.3, 0.5), palm.z + 0.05 * u); coin.rotation.y = 0.4 * Math.sin(t * 2);
      const s = pre ? 0 : Math.max(bump(v, 0.3, 0.8), bump(v, 2.5, 0.8)); shine.visible = s > 0; shine.scale.setScalar(pop(s)); shine.position.set(palm.x, palm.y + 0.03 * u, palm.z); shine.rotation.z = t;
    },
  };
}

function butlerDoor(ctx, spec, stage) {
  if (spec.outcome === 'hardhat') return hardhat(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.55 * u, W = 0.34 * u, H = 0.75 * u;
  const frame = solidProp([[G.box(0.05 * u, H, 0.08 * u, -W / 2 - 0.025 * u, H / 2, 0), 0xe0d0b0], [G.box(0.05 * u, H, 0.08 * u, W / 2 + 0.025 * u, H / 2, 0), 0xe0d0b0], [G.box(W + 0.14 * u, 0.06 * u, 0.1 * u, 0, H + 0.03 * u, 0), 0xe0d0b0], [G.box(W, H, 0.01 * u, 0, H / 2, -0.06 * u), 0xffd890]], 0.4);
  frame.position.set(dx, floor, -0.1 * u);
  const door = new THREE.Group(), dm = solidProp([[G.box(W, H, 0.03 * u, W / 2, H / 2, 0), 0x6a3a1a], [G.sphere(0.018 * u, W * 0.85, H * 0.48, 0.025 * u), 0xffd040]], 0.35); door.add(dm); door.position.set(dx - W / 2, floor, -0.08 * u);
  const butler = createPerson({ u: 0.9 * u, shirt: 0x1a1a24, pants: 0x1a1a24 }), bow = solidProp([[G.box(0.08 * u, 0.09 * u, 0.01 * u, 0, -0.04 * u, 0), 0xffffff], [G.cone(0.02 * u, 0.04 * u, -0.02 * u, -0.01 * u, 0.008 * u, -Math.PI / 2), 0x1a1a24], [G.cone(0.02 * u, 0.04 * u, 0.02 * u, -0.01 * u, 0.008 * u, Math.PI / 2), 0x1a1a24]], 0.4);
  butler.rig.attach('body', bow, 0.95).position.z = 0.09 * u;
  const guest = createPerson({ u: 0.7 * u, shirt: 0xe07ab0 });
  group.add(frame, door, butler.group, guest.group);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.3, 0.5], bow: [0.8, 0.4], walk: [1.2, 1.6], up: [2.8, 0.4], shut: [3.6, 0.5] }), o = T.open - T.shut, bow = T.bow - T.up;
      door.rotation.y = -1.7 * o;
      butler.reset().face(-0.6); butler.lean(0.6 * bow); butler.bone('armL').rotation.x = 1.0 * o; butler.bone('armR').rotation.x = 0.9 * bow; butler.bone('foreR').rotation.x = 1.4 * bow;
      butler.group.position.set(dx + W / 2 + 0.2 * u, floor, 0.12 * u); butler.update();
      const g = T.walk; guest.reset().face(g < 0.6 ? 'left' : Math.PI).walk(v * 9, g > 0 && g < 1 ? 1 : 0); guest.group.position.set(lerp(dx + 0.9 * u, dx, Math.min(1, g * 1.5)), floor, lerp(0.3 * u, -0.05 * u, between(g, 0.6, 1))); guest.group.visible = !pre && g < 0.98; guest.update();
    },
  };
}

function devilVase(ctx, spec, stage) {
  if (spec.outcome === 'thumbsdown') return thumbsDown(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u, SH = 0.36 * u, RED = 0xff3a30;
  const stand = solidProp([[G.box(0.2 * u, 0.03 * u, 0.2 * u, 0, SH, 0), WOOD], [G.cyl(0.03 * u, 0.04 * u, SH, 0, SH / 2, 0), 0x8a5a30]], 0.35); stand.position.set(sx, floor, 0);
  const vase = solidProp([[new THREE.LatheGeometry([[0, 0], [0.04, 0], [0.065, 0.06], [0.045, 0.15], [0.03, 0.18], [0.04, 0.2]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 20), 0x40c8c8]], 0.5);
  const shards = many([[G.box(0.03 * u, 0.03 * u, 0.01 * u, 0, 0, 0), 0x40c8c8]], 8, 0.5);
  const imp = createPerson({ u: 0.55 * u, shirt: RED, pants: RED, skin: 0xff5a4a, hair: 0x2a1010, glow: 0.6 }), horns = solidProp([[G.cone(0.015 * u, 0.05 * u, -0.04 * u, 0.02 * u, 0, 0.3), 0xffffff], [G.cone(0.015 * u, 0.05 * u, 0.04 * u, 0.02 * u, 0, -0.3), 0xffffff]], 0.5), tail = solidProp([[G.tube([[0, 0], [0.05 * u, -0.03 * u], [0.1 * u, 0.02 * u], [0.12 * u, 0.06 * u]], 0.008 * u), RED], [G.cone(0.02 * u, 0.04 * u, 0.13 * u, 0.08 * u, 0, -0.5), RED]], 0.5);
  imp.rig.attach('head', horns, 0.9); const tp = imp.rig.attach('body', tail, 0.1); tp.position.z = -0.05 * u; tp.rotation.y = Math.PI / 2;
  group.add(stand, vase, shards, imp.group);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { sneak: [0.2, 1.0], push: [1.3, 0.2, 'in'], fall: [1.5, 0.45, 'in'], run: [3.2, 1.0, 'in'], fix: [4.8, 0.4] });
      const top = floor + SH + 0.015 * u, broken = T.fall >= 1 && T.fix === 0;
      vase.visible = !broken; vase.position.set(sx + 0.15 * u * T.fall * (1 - T.fix), lerp(top, floor, T.fall * T.fall) * (1 - T.fix) + top * T.fix, 0.0); vase.rotation.z = -1.5 * T.fall * (1 - T.fix); vase.scale.setScalar(pop(T.fix > 0 ? T.fix : 1));
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, f = between(v, 1.95, 2.4); shards.set(i, sx + 0.15 * u + Math.cos(a) * 0.2 * u * f, floor + 0.02 * u + 0.1 * u * Math.sin(Math.PI * f) * Math.abs(Math.sin(a)), 0.05 * u + Math.sin(a) * 0.12 * u * f, broken ? 1 : 0, a + f * 4); }
      shards.commit();
      const snick = v > 2.0 && v < 3.2, ix = T.run > 0 ? lerp(sx - 0.1 * u, sx + 1.0 * u, T.run) : lerp(sx + 0.75 * u, sx - 0.1 * u + 0.15 * u, T.sneak);
      imp.reset().face(T.run > 0 ? 'right' : T.sneak < 1 ? 'left' : 0).walk(v * (T.run > 0 ? 14 : 6), (T.sneak > 0 && T.sneak < 1) || (T.run > 0 && T.run < 1) ? 1 : 0); if (T.sneak < 1) imp.lean(0.4);
      imp.bone('armL').rotation.x = 1.5 * bump(v, 1.25, 0.4); if (snick) { imp.bone('armR').rotation.x = 1.6; imp.bone('foreR').rotation.x = 1.5; imp.group.position.y = floor + 0.02 * u * Math.abs(Math.sin(v * 16)); }
      imp.group.position.set(ix, snick ? imp.group.position.y : floor, 0.15 * u); imp.group.visible = !pre && T.run < 1; imp.update();
    },
  };
}

function trunkThick(ctx, spec, stage) {
  if (spec.outcome === 'crayon') return pencilCrayon(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const trunk = solidProp([[G.cyl(1, 1.15, 0.55 * u, 0, 0.275 * u, 0, 0, 0, 0, 20), 0x8a5a30]], 0.35);
  const crown = solidProp([[G.sphere(0.25 * u, 0, 0, 0, 1.2, 0.9, 1), 0x3a9a3a], [G.sphere(0.18 * u, 0.15 * u, 0.08 * u, 0.05 * u), 0x4aaa4a], [G.sphere(0.16 * u, -0.15 * u, 0.06 * u, 0.04 * u), 0x2a8a2a]], 0.4);
  const rings = solidProp([[G.cyl(0.16 * u, 0.16 * u, 0.04 * u, 0, 0.02 * u, 0, Math.PI / 2, 0, 0, 24), 0xe0b880], ...[0.12, 0.08, 0.04].map((r) => [G.torus(r * u, 0.006 * u, Math.PI * 2, 0, 0.02 * u, 0.021 * u), 0x8a5a30]), [G.cyl(0.165 * u, 0.165 * u, 0.035 * u, 0, 0.02 * u, -0.005 * u, Math.PI / 2, 0, 0, 24), 0x8a5a30]], 0.45);
  rings.position.set(tx + 0.55 * u, floor + 0.15 * u, 0.1 * u);
  group.add(trunk, crown, rings);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, g = pre ? 1 : timeline(v, { g: [0.2, 2.4, 'smooth'], back: [4.4, 0.5] }), f = pre ? 1 : g.g * (1 - g.back), r = lerp(0.02 * u, 0.13 * u, f);
      trunk.position.set(tx, floor, 0); trunk.scale.set(r, 1, r); crown.position.set(tx, floor + 0.62 * u + 0.08 * u * f, 0); crown.scale.setScalar(pop(0.4 + 0.6 * f));
      const rv = pre ? 1 : between(v, 2.4, 2.8) * (1 - g.back); rings.visible = rv > 0.01; rings.scale.setScalar(pop(rv));
    },
  };
}

export const SCENES = { wheelbarrow, 'stand-vase': standVase, 'coin-keep': coinKeep, 'butler-door': butlerDoor, 'devil-vase': devilVase, 'trunk-thick': trunkThick };
