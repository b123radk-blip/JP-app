// Step 1 word variants of step1-h.js (same scene types, another outcome): doorway, walkOut, hatRabbit, houseIn, autoDoors, piggyCoin, phoneRing, powerHouse, storkBaby
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

export const doorway = (u, color = 0x8a5a30) => { const g = new THREE.Group(), frame = solidProp([[G.box(0.42 * u, 0.06 * u, 0.1 * u, 0, 0.73 * u, 0), 0xe8e0d0], [G.box(0.06 * u, 0.76 * u, 0.1 * u, -0.19 * u, 0.38 * u, 0), 0xe8e0d0], [G.box(0.06 * u, 0.76 * u, 0.1 * u, 0.19 * u, 0.38 * u, 0), 0xe8e0d0], [G.box(0.32 * u, 0.7 * u, 0.02 * u, 0, 0.35 * u, -0.04 * u), 0xfff0c0]], 0.6), hinge = new THREE.Group(), leaf = solidProp([[G.box(0.32 * u, 0.7 * u, 0.03 * u, 0.16 * u, 0.35 * u, 0), color], [G.sphere(0.02 * u, 0.28 * u, 0.35 * u, 0.02 * u), 0xffd040]], 0.4); hinge.position.set(-0.16 * u, 0, 0.02 * u); hinge.add(leaf); g.add(frame, hinge); return Object.assign(g, { hinge, drawCalls: 2 }); };

export function walkOut(ctx, spec, stage, exit) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.45 * u;
  const door = doorway(u, exit ? 0x9aa0a8 : 0x8a5a30), p = createPerson({ u: 0.85 * u, shirt: exit ? 0x40b060 : 0xe0603a });
  const sign = exit ? textPlane('出口 →', { h: 0.17 * u, color: '#ffffff', bg: '#20a050', pad: 0.25 }) : null;
  door.position.set(dx, floor, -0.15 * u);
  group.add(door, p.group); if (sign) { sign.position.set(dx, floor + 0.9 * u, -0.1 * u); group.add(sign); }
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.4, 'out'], out: [0.6, exit ? 1.2 : 1.6, exit ? 'linear' : 'out'], shut: [2.6, 0.4, 'in'], gone: [4.6, 0.6] });
      door.hinge.rotation.y = -1.7 * (T.open - T.shut);
      const f = T.out, x = dx + (exit ? 0.9 * u * f : 0.4 * u * f), z = -0.15 * u + (exit ? 0.3 : 0.45) * u * f;
      p.reset().face(exit ? 0.9 : 0.2); p.group.visible = !pre && f > 0.02 && T.gone < 0.98; p.group.position.set(x, floor, z); p.group.scale.setScalar(grow(1 - T.gone));
      const walking = f > 0 && f < 1; if (walking) p.walk(v * (exit ? 14 : 9), 1);
      if (!exit && f >= 1) { p.raise('R', 2.4); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 9); }
      p.update();
      if (sign) sign.material.opacity = 0.75 + 0.25 * Math.sin(t * 4);
    },
  };
}

export function hatRabbit(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u;
  const hat = solidProp([[G.cyl(0.15 * u, 0.15 * u, 0.32 * u, 0, 0.16 * u, 0), 0x202028], [G.cyl(0.23 * u, 0.23 * u, 0.02 * u, 0, 0.32 * u, 0), 0x202028], [G.cyl(0.155 * u, 0.155 * u, 0.05 * u, 0, 0.27 * u, 0), 0xc02030]], 0.35);
  hat.rotation.x = Math.PI; hat.position.set(hx, floor + 0.33 * u, 0);
  const rabbit = solidProp([[G.sphere(0.1 * u, 0, 0.1 * u, 0), 0xffffff], [G.sphere(0.03 * u, 0.03 * u, 0.25 * u, 0, 0.8, 2.6, 0.6), 0xffffff], [G.sphere(0.03 * u, -0.03 * u, 0.25 * u, 0, 0.8, 2.6, 0.6), 0xffffff], [G.sphere(0.015 * u, 0.04 * u, 0.12 * u, 0.09 * u), 0xe02040], [G.sphere(0.015 * u, -0.04 * u, 0.12 * u, 0.09 * u), 0xe02040], [G.sphere(0.012 * u, 0, 0.08 * u, 0.1 * u), 0xff8aa0]], 0.6);
  const hand = createHand({ u: 0.45 * u, sleeve: 0x202028 }), wand = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.36 * u, 0, 0.18 * u, 0), 0x101010], [G.cyl(0.013 * u, 0.013 * u, 0.06 * u, 0, 0.33 * u, 0), 0xffffff]], 0.5), sparks = many([[G.sphere(0.02 * u), 0xffe060]], 8, 1.4);
  hand.grip.add(wand); wand.rotation.x = Math.PI / 2;
  group.add(hat, rabbit, hand.group, sparks);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tap: [0.3, 1.0], rise: [1.4, 0.6, 'back'], sink: [4.6, 0.6, 'in'] });
      hand.pose('grip'); hand.group.visible = !pre && v < 1.6; hand.group.position.set(hx + 0.5 * u, floor + 0.55 * u + 0.05 * u * Math.abs(Math.sin(v * 9)) * (v < 1.4 ? 1 : 0), 0.05 * u); hand.group.rotation.set(0, 0, 0.9);
      const r = pre ? 0 : T.rise - T.sink; rabbit.visible = r > 0.01; rabbit.position.set(hx, floor + 0.2 * u + 0.25 * u * r, 0.02 * u); rabbit.rotation.z = 0.1 * Math.sin(v * 3) * r;
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : between(v, 1.3 + 0.04 * i, 2.1 + 0.04 * i), a = i * 0.785; sparks.set(i, hx + Math.cos(a) * 0.3 * u * f, floor + 0.4 * u + Math.sin(a) * 0.25 * u * f, 0.06 * u, f > 0 && f < 1 ? 1 - f : 0); }
      sparks.commit();
    },
  };
}

export function houseIn(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.55 * u;
  const house = solidProp([[G.box(0.6 * u, 0.5 * u, 0.4 * u, 0, 0.25 * u, 0), 0xf0e0c0], [G.cone(0.48 * u, 0.32 * u, 0, 0.66 * u, 0), 0x3a6ac0], [G.box(0.2 * u, 0.36 * u, 0.01 * u, -0.1 * u, 0.18 * u, 0.2 * u), 0x2a1a10]], 0.4);
  const win = solidProp([[G.box(0.13 * u, 0.13 * u, 0.01 * u, 0.15 * u, 0.3 * u, 0.205 * u), 0xffe080]], 1.4), hinge = new THREE.Group(), leaf = solidProp([[G.box(0.2 * u, 0.36 * u, 0.02 * u, 0.1 * u, 0.18 * u, 0), 0x8a5a30]], 0.4);
  hinge.add(leaf); hinge.position.set(hx - 0.2 * u, floor, 0.22 * u); house.position.set(hx, floor, 0); win.position.set(hx, floor, 0);
  const p = createPerson({ u: 0.7 * u, shirt: 0x3a7ae0 });
  group.add(house, win, hinge, p.group);
  const loop = 5.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.4, 'linear'], open: [1.1, 0.3], in: [1.4, 0.6], shut: [2.0, 0.3, 'in'], lit: [2.4, 0.2], dark: [5.2, 0.4] });
      hinge.rotation.y = -1.6 * (T.open - T.shut);
      const x = hx + 0.8 * u - 0.9 * u * T.walk, z = 0.3 * u - 0.3 * u * T.in;
      p.reset().face(T.in > 0 ? 'away' : 'left'); p.group.visible = !pre && T.in < 0.95; p.group.position.set(x, floor, z); p.walk(v * 9, T.in < 1 ? 1 : 0); p.update();
      win.material.userData.glow.value = 0.2 + 1.4 * (T.lit - T.dark);
    },
  };
}

export function autoDoors(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.55 * u;
  const wall = solidProp([[G.box(0.9 * u, 0.85 * u, 0.06 * u, 0, 0.42 * u, -0.06 * u), 0xc8ccd4], [G.box(0.5 * u, 0.62 * u, 0.065 * u, 0, 0.31 * u, -0.05 * u), 0xfff0c0]], 0.5);
  const doors = many([[G.box(0.25 * u, 0.62 * u, 0.02 * u, 0, 0.31 * u, 0), 0x9ad8ff]], 2, 0.6), sign = textPlane('入口', { h: 0.15 * u, color: '#ffffff', bg: '#2a6ad0', pad: 0.3 });
  doors.material.transparent = true; doors.material.opacity = 0.7;
  const p = createPerson({ u: 0.75 * u, shirt: 0xe07a30 });
  wall.position.set(dx, floor, 0); sign.position.set(dx, floor + 0.73 * u, 0.0);
  group.add(wall, doors, sign, p.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 2.2, 'linear'], open: [0.8, 0.5], close: [2.6, 0.5] }), o = T.open - T.close;
      doors.set(0, dx - 0.125 * u - 0.22 * u * o, floor, -0.01 * u, 1); doors.set(1, dx + 0.125 * u + 0.22 * u * o, floor, -0.01 * u, 1); doors.commit();
      const f = T.walk; p.reset().face('away'); p.group.visible = !pre && f < 0.98; p.group.position.set(dx, floor, 0.5 * u - 0.6 * u * f); p.group.scale.setScalar(1 - 0.25 * f); p.walk(v * 9, 1); p.update();
    },
  };
}

export function piggyCoin(ctx, spec, stage) {
  const u = 1.35 * stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const pig = solidProp([[G.sphere(0.24 * u, 0, 0.24 * u, 0, 1.3, 1, 1), 0xff9ab0], [G.cyl(0.07 * u, 0.07 * u, 0.06 * u, 0.32 * u, 0.24 * u, 0, 0, 0, Math.PI / 2), 0xff8aa0], [G.sphere(0.015 * u, 0.36 * u, 0.25 * u, 0.025 * u), 0xc04060], [G.sphere(0.015 * u, 0.36 * u, 0.25 * u, -0.025 * u), 0xc04060], [G.sphere(0.022 * u, 0.22 * u, 0.36 * u, 0.12 * u), 0x101010], [G.cone(0.05 * u, 0.08 * u, 0.15 * u, 0.46 * u, 0.1 * u), 0xff8aa0], [G.box(0.12 * u, 0.02 * u, 0.04 * u, 0, 0.475 * u, 0), 0x502030], ...[[-0.15, 0.12], [-0.15, -0.12], [0.15, 0.12], [0.15, -0.12]].map(([x, z]) => [G.cyl(0.04 * u, 0.04 * u, 0.1 * u, x * u, 0.04 * u, z * u), 0xff8aa0])], 0.45);
  const coin = solidProp([[G.cyl(0.07 * u, 0.07 * u, 0.02 * u, 0, 0, 0, Math.PI / 2), 0xffc030], [G.cyl(0.05 * u, 0.05 * u, 0.022 * u, 0, 0, 0, Math.PI / 2), 0xffd860]], 0.8), sparks = many([[G.sphere(0.018 * u), 0xffe060]], 6, 1.4);
  pig.position.set(px, floor, 0); group.add(pig, coin, sparks);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { drop: [0.4, 0.9, 'in'] }), f = T.drop;
      coin.visible = !pre && f < 1; coin.position.set(px, floor + 1.05 * u - 0.6 * u * f, 0); coin.rotation.y = v * 6 * (1 - f) + Math.PI / 2 * f;
      const j = wobble(v, 1.3, 0.8, 6); pig.rotation.z = 0.08 * j; pig.position.y = floor + 0.02 * u * Math.abs(j);
      for (let i = 0; i < 6; i++) { const g = pre ? 0 : between(v, 1.3, 2.1), a = i * 1.05 + 0.5; sparks.set(i, px + Math.cos(a) * 0.25 * u * g, floor + 0.5 * u + Math.sin(a) * 0.2 * u * g, 0.05 * u, g > 0 && g < 1 ? 1 - g : 0); }
      sparks.commit();
    },
  };
}

export function phoneRing(ctx, spec, stage) {
  const u = 1.3 * stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const phone = solidProp([[G.box(0.36 * u, 0.22 * u, 0.24 * u, 0, 0.11 * u, 0), 0xd83030], [G.cyl(0.085 * u, 0.085 * u, 0.02 * u, 0, 0.12 * u, 0.125 * u, Math.PI / 2), 0xf4efe6], ...Array.from({ length: 8 }, (_, i) => [G.cyl(0.012 * u, 0.012 * u, 0.022 * u, Math.cos(i * 0.7 + 0.5) * 0.06 * u, 0.12 * u + Math.sin(i * 0.7 + 0.5) * 0.06 * u, 0.128 * u, Math.PI / 2), 0x303030]), [G.box(0.08 * u, 0.06 * u, 0.1 * u, -0.13 * u, 0.24 * u, 0), 0xb82020], [G.box(0.08 * u, 0.06 * u, 0.1 * u, 0.13 * u, 0.24 * u, 0), 0xb82020]], 0.45);
  const handset = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.36 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xd83030], [G.sphere(0.07 * u, -0.18 * u, -0.03 * u, 0, 1, 0.7, 1), 0xd83030], [G.sphere(0.07 * u, 0.18 * u, -0.03 * u, 0, 1, 0.7, 1), 0xd83030]], 0.45);
  const cord = many([[G.sphere(0.018 * u), 0x404048]], 10, 0.4), sparks = many([[G.sphere(0.02 * u), 0xfff060]], 4, 1.6), rings = many([[G.torus(0.1 * u, 0.01 * u, Math.PI * 0.5, 0, 0, 0, Math.PI * 0.25), 0xffe060]], 4, 1.2);
  group.add(phone, handset, cord, sparks, rings);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ringing = !pre && (v % 1.6) < 1.0;
      const shake = ringing ? Math.sin(t * 50) : 0, hop = ringing ? 0.03 * u * Math.abs(Math.sin(t * 25)) : 0;
      phone.position.set(px, floor + hop, 0); phone.rotation.z = 0.05 * shake;
      handset.position.set(px, floor + 0.32 * u + hop + 0.05 * u * Math.abs(shake) * (ringing ? 1 : 0), 0.0); handset.rotation.z = 0.08 * shake;
      for (let i = 0; i < 10; i++) { const f = i / 9; cord.set(i, px - 0.2 * u - 0.6 * u * f, floor + 0.05 * u + 0.04 * u * Math.sin(f * 14), 0.0, 1); }
      cord.commit();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.9 + i / 4) % 1); sparks.set(i, px - 0.8 * u + 0.6 * u * f, floor + 0.05 * u + 0.04 * u * Math.sin(f * 14), 0.02 * u, pre ? 0 : 1.2); }
      sparks.commit();
      for (let i = 0; i < 4; i++) { const f = ((v * 1.6 + (i % 2) / 2) % 1), s = i < 2 ? 1 : -1; rings.set(i, px + s * (0.25 + 0.1 * f) * u, floor + 0.35 * u, 0.02 * u, ringing ? 1 + f : 0, s > 0 ? 0 : Math.PI); }
      rings.commit();
    },
  };
}

export function powerHouse(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.25 * u, hx = B.maxX + 0.95 * u;
  const pole = solidProp([[G.cyl(0.025 * u, 0.03 * u, 1.0 * u, 0, 0.5 * u, 0), 0x6a5040], [G.box(0.3 * u, 0.03 * u, 0.04 * u, 0, 0.95 * u, 0), 0x6a5040]], 0.35);
  const house = solidProp([[G.box(0.4 * u, 0.32 * u, 0.3 * u, 0, 0.16 * u, 0), 0xf0e0c0], [G.cone(0.32 * u, 0.22 * u, 0, 0.43 * u, 0), 0xc04a3a]], 0.4), wins = solidProp([[G.box(0.1 * u, 0.1 * u, 0.01 * u, -0.09 * u, 0.18 * u, 0.155 * u), 0xffe080], [G.box(0.1 * u, 0.1 * u, 0.01 * u, 0.09 * u, 0.18 * u, 0.155 * u), 0xffe080]], 0.2);
  const wire = many([[G.sphere(0.01 * u), 0x202020]], 16, 0.3), sparks = many([[G.sphere(0.025 * u), 0xfff060]], 3, 1.8);
  pole.position.set(px, floor, -0.05 * u); house.position.set(hx, floor, -0.05 * u); wins.position.set(hx, floor, -0.05 * u);
  const P = (f) => [px + 0.12 * u + (hx - px - 0.12 * u) * f, floor + 0.95 * u - 0.6 * u * f + 0.12 * u * Math.sin(Math.PI * f) * -1];
  for (let i = 0; i < 16; i++) { const [x, y] = P(i / 15); wire.set(i, x, y, -0.05 * u, 1); }
  wire.commit();
  group.add(pole, house, wins, wire, sparks);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 0.3 + 0.3 * i, 1.4 + 0.3 * i), [x, y] = P(f); sparks.set(i, x, y, -0.04 * u, f > 0 && f < 1 ? 1 + 0.3 * Math.sin(t * 30) : 0); }
      sparks.commit();
      const lit = pre ? 0 : between(v, 1.4, 1.6) * (1 - between(v, 4.2, 4.6)); wins.material.userData.glow.value = 0.2 + 1.6 * lit;
    },
  };
}

export function storkBaby(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.45 * u;
  const stork = solidProp([[G.sphere(0.12 * u, 0, 0, 0, 1.6, 0.8, 0.8), 0xffffff], [G.cyl(0.02 * u, 0.02 * u, 0.18 * u, 0.2 * u, 0.08 * u, 0, 0, 0, -0.6), 0xffffff], [G.sphere(0.05 * u, 0.26 * u, 0.16 * u, 0), 0xffffff], [G.cone(0.015 * u, 0.12 * u, 0.36 * u, 0.15 * u, 0, -Math.PI / 2 - 0.2), 0xff8a20], [G.sphere(0.012 * u, 0.28 * u, 0.18 * u, 0.04 * u), 0x101010], [G.cone(0.05 * u, 0.12 * u, -0.22 * u, 0.0, 0, Math.PI / 2), 0x202020]], 0.5);
  const wings = many([[G.sphere(0.13 * u, 0, 0.06 * u, 0, 0.6, 0.12, 1.4), 0xf4f4f4]], 2, 0.5), bundle = solidProp([[G.sphere(0.09 * u, 0, 0, 0, 1, 1, 1), 0xfff0f8], [G.sphere(0.05 * u, 0, 0.02 * u, 0.06 * u), 0xffd2b0], [G.cyl(0.005 * u, 0.005 * u, 0.15 * u, 0, 0.12 * u, 0), 0xf0f0f0]], 0.5);
  const basket = solidProp([[G.cyl(0.18 * u, 0.13 * u, 0.12 * u, 0, 0.06 * u, 0), 0xc8a060], [G.torus(0.18 * u, 0.015 * u), 0xa88040]], 0.4), hearts = many(HEART(u, 0.1), 3, 0.8);
  basket.position.set(bx, floor, 0); basket.children;
  group.add(basket, stork, wings, bundle, hearts);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fly: [0, 1.8, 'out'], set: [1.9, 0.5], away: [2.6, 1.4, 'in'] });
      const x = bx + 1.0 * u * (1 - T.fly) - 1.0 * u * T.away, y = floor + 0.75 * u + 0.4 * u * (1 - T.fly) + 0.6 * u * T.away - 0.1 * u * T.set * (1 - T.away);
      stork.visible = !pre && T.away < 1; stork.position.set(x, y, 0.03 * u); stork.rotation.y = Math.PI;
      const flap = Math.sin(t * 10) * 0.8; for (const k of [0, 1]) wings.set(k, x, y + 0.05 * u, (k ? 0.07 : -0.07) * u, stork.visible ? 1 : 0, 0, 0, (k ? 1 : -1) * flap);
      wings.commit();
      const held = T.set < 1, by = held ? y - 0.18 * u : floor + 0.12 * u; bundle.visible = !pre; bundle.position.set(held ? x - 0.25 * u : bx, held ? by : by, 0.05 * u);
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 3.0 + 0.3 * i, 4.4 + 0.3 * i); hearts.set(i, bx + (i - 1) * 0.12 * u, floor + 0.3 * u + 0.4 * u * f, 0.08 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}
