// Step 1 word variants of step1-k.js (same scene types, another outcome): newShoes, seashell, parrot, nameWrite, priceUp
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, HEART } from '../pieces/kit-things.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, liveText } from './helpers.js';
import { grow } from './step1-kit.js';
import { crown } from './step1-b.js';

const tmp = new THREE.Vector3();
const sparkle = (m, n, x, y, r, f, u) => { for (let i = 0; i < n; i++) { const a = i * (Math.PI * 2 / n) + f * 2; m.set(i, x + Math.cos(a) * r * u * (0.5 + f), y + Math.sin(a) * r * u * (0.5 + f), 0.08 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) * 1.3 : 0); } m.commit(); };
const SPARK = (u) => [[G.sphere(0.022 * u), 0xffffff]];

export function newShoes(ctx, spec, stage) {
  const u = 1.7 * stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.25 * u;
  const shoe = (c, lace) => [[G.sphere(0.1 * u, 0, 0.05 * u, 0, 1.6, 0.6, 0.8), c], [G.box(0.12 * u, 0.1 * u, 0.13 * u, -0.07 * u, 0.09 * u, 0), c], [G.box(0.26 * u, 0.02 * u, 0.15 * u, 0, 0.0, 0), 0xffffff], ...[0, 1].map((i) => [G.box(0.01 * u, 0.06 * u, 0.1 * u, (-0.02 + 0.04 * i) * u, 0.1 * u, 0, 0.5), lace])];
  const old = solidProp(shoe(0x7a6a58, 0x5a4a38), 0.25), fresh = solidProp(shoe(0xe03a3a, 0xffffff), 0.6), spk = many(SPARK(u), 8, 1.8), flies = many([[G.sphere(0.012 * u), 0x202020]], 2, 0.2);
  group.add(old, fresh, spk, flies);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, swap = pre ? 0 : between(v, 1.2, 2.0) * (1 - between(v, 4.6, 5.3));
      old.position.set(sx - 0.6 * u * swap, floor + 0.2 * u * Math.sin(Math.PI * swap), 0.05 * u); old.rotation.z = -1.5 * swap; old.visible = swap < 0.95; old.scale.setScalar(grow(1 - swap));
      fresh.position.set(sx + 0.6 * u * (1 - swap), floor + 0.2 * u * Math.sin(Math.PI * swap), 0.05 * u); fresh.visible = swap > 0.05; fresh.scale.setScalar(grow(swap));
      sparkle(spk, 8, sx, floor + 0.15 * u, 0.22, pre ? 0 : ((v - 2.0) / 1.0) % 1 * (v > 2.0 && v < 4.5 ? 1 : 0), u);
      for (let i = 0; i < 2; i++) flies.set(i, sx + 0.12 * u * Math.cos(t * 5 + i * 3), floor + 0.3 * u + 0.06 * u * Math.sin(t * 7 + i), 0.05 * u, swap < 0.3 && !pre ? 1 : 0);
      flies.commit();
    },
  };
}

export function seashell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.9 * u, shirt: 0x40b0e0 }), shell = solidProp([[G.cone(0.13 * u, 0.28 * u, 0, 0, 0, Math.PI / 2), 0xffb090], ...[0, 1, 2].map((i) => [G.torus((0.12 - 0.035 * i) * u, 0.016 * u, Math.PI * 2, (0.09 - 0.06 * i) * u, 0, 0).rotateY(Math.PI / 2), 0xe08060])], 0.6);
  const waves = many([[G.torus(0.08 * u, 0.015 * u, Math.PI, 0, 0, 0), 0x5ab0ff]], 3, 0.9);
  group.add(kid.group, shell, waves);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, hold = pre ? 0 : between(v, 0.2, 0.7) * (1 - between(v, 4.3, 4.8));
      kid.reset().face('toward'); kid.group.position.set(kx, floor, 0.02 * u); kid.raise('R', 2.2 * hold); kid.bone('foreR').rotation.z = -1.9 * hold; kid.bone('head').rotation.z = 0.25 * hold; kid.update();
      bonePoint(kid, 'handR', 0.6, tmp); shell.position.set(tmp.x - 0.06 * u, tmp.y, tmp.z + 0.08 * u); shell.visible = !pre; shell.rotation.z = 0.2;
      kid.rig.setColor('eyeL', hold > 0.6 ? 0xffd2b0 : 0x1a1a24); kid.rig.setColor('eyeR', hold > 0.6 ? 0xffd2b0 : 0x1a1a24);
      for (let i = 0; i < 3; i++) { const f = ((v * 0.5 + i / 3) % 1); waves.set(i, kx + 0.5 * u - 0.15 * u * f, floor + 0.85 * u + 0.08 * u * Math.sin(f * 6), 0.0, hold > 0.6 ? Math.sin(Math.PI * f) * 1.2 : 0); }
      waves.commit();
    },
  };
}

export function parrot(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const perch = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.5 * u, 0, 0.25 * u, 0), 0x6a4a2a], [G.cyl(0.015 * u, 0.015 * u, 0.3 * u, 0, 0.5 * u, 0, 0, 0, Math.PI / 2), 0x6a4a2a], [G.cyl(0.12 * u, 0.14 * u, 0.04 * u, 0, 0.02 * u, 0), 0x6a4a2a]], 0.4);
  const bird = solidProp([[G.sphere(0.1 * u, 0, 0.14 * u, 0, 0.9, 1.3, 0.9), 0x30b040], [G.sphere(0.08 * u, 0.02 * u, 0.3 * u, 0), 0xe03030], [G.cone(0.03 * u, 0.06 * u, 0.09 * u, 0.28 * u, 0, -Math.PI / 2 - 0.5), 0xffd040], [G.sphere(0.015 * u, 0.06 * u, 0.33 * u, 0.05 * u), 0x101010], [G.cone(0.04 * u, 0.2 * u, -0.03 * u, -0.02 * u, 0, 0.2), 0x3a6ad0]], 0.5);
  const b1 = textPlane('こんにちは!', { h: 0.13 * u, color: '#202838', bg: '#fff8c0', pad: 0.3 });
  perch.position.set(px, floor, -0.05 * u); bird.position.set(px - 0.05 * u, floor + 0.51 * u, 0);
  group.add(perch, bird, b1);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, sq = pre ? 0 : Math.max(bump(v, 0.6, 1.4), bump(v, 2.4, 1.4));
      bird.rotation.z = 0.25 * Math.sin(v * 14) * sq; bird.position.y = floor + 0.51 * u + 0.03 * u * Math.abs(Math.sin(v * 7)) * sq;
      b1.visible = sq > 0.15; b1.scale.setScalar(grow(Math.min(1, sq * 2))); b1.position.set(px + 0.3 * u, floor + 0.95 * u, 0.06 * u); b1.rotation.z = 0.05 * Math.sin(v * 9);
    },
  };
}

export function nameWrite(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, nx = B.maxX + 0.5 * u, ny = B.cy;
  const book = solidProp([[G.box(0.5 * u, 0.62 * u, 0.04 * u, 0, 0, 0), 0x3a7ae0], [G.box(0.36 * u, 0.12 * u, 0.042 * u, 0, 0.12 * u, 0), 0xffffff]], 0.45), name = textPlane('たなか ゆき', { h: 0.08 * u, color: '#202838', weight: 700 }), pencil = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.3 * u, 0, 0.15 * u, 0), 0xffc030], [G.cone(0.015 * u, 0.04 * u, 0, -0.02 * u, 0, Math.PI), 0x303030]], 0.5);
  name.geometry.translate(name.geometry.parameters.width / 2, 0, 0); const nw = name.geometry.parameters.width;
  book.position.set(nx, ny, 0); name.position.set(nx - nw / 2, ny + 0.12 * u, 0.025 * u);
  group.add(book, name, pencil);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 0.001 : Math.max(0.001, between(v, 0.4, 2.6) * (1 - between(v, 4.4, 4.8)));
      name.scale.x = w; name.material.map.repeat.x = w; name.visible = w > 0.01;
      pencil.visible = !pre && v < 3.0; pencil.position.set(nx - nw / 2 + nw * w, ny + 0.12 * u + 0.02 * u * Math.sin(v * 16), 0.06 * u); pencil.rotation.z = -0.5;
    },
  };
}

export function priceUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const tag = solidProp([[G.box(0.46 * u, 0.24 * u, 0.02 * u, 0, 0, 0), 0xffe060], [G.cyl(0.02 * u, 0.02 * u, 0.025 * u, -0.19 * u, 0, 0, Math.PI / 2), 0xffffff]], 0.6), price = liveText(u, { h: 0.16, w: 0.4, color: '#d02020', bg: '#ffe060' });
  const p = createPerson({ u: 0.7 * u, shirt: 0x40a0c0 }), eyes = many([[G.sphere(0.03 * u), 0xffffff], [G.sphere(0.015 * u, 0, 0, 0.025 * u), 0x101010]], 2, 0.5), arrow = solidProp([[G.box(0.04 * u, 0.2 * u, 0.02 * u, 0, -0.05 * u, 0), 0xe02020], [G.cone(0.07 * u, 0.1 * u, 0, 0.1 * u, 0), 0xe02020]], 1.2);
  group.add(tag, price, p.group, eyes, arrow);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.4, 2.4) * (1 - between(v, 4.8, 5.3)), y = floor + 0.3 * u + 0.6 * u * f;
      tag.position.set(px + 0.15 * u, y, 0.02 * u); price.position.set(px + 0.17 * u, y, 0.035 * u); price.set('¥' + String(Math.round(100 + 99900 * f * f)));
      arrow.visible = f > 0.05 && f < 0.98; arrow.position.set(px + 0.5 * u, y, 0.03 * u);
      p.reset().face(0.3); p.group.position.set(px - 0.2 * u, floor, 0.1 * u); p.bone('head').rotation.x = -0.3 * f; p.lean(-0.1 * f); p.update();
      bonePoint(p, 'head', 0.5, tmp); const pop = between(v, 2.2, 2.4) * (1 - between(v, 4.6, 5.0)); for (let i = 0; i < 2; i++) eyes.set(i, tmp.x + (i ? 0.035 : -0.035) * u, tmp.y + 0.01 * u, tmp.z + 0.1 * u + 0.08 * u * pop, pop > 0.05 ? 1 + 0.5 * pop : 0);
      eyes.commit();
    },
  };
}
