// Model scenes, the body and feelings (Step 3a model pass).
//   q-exercise 体: a person does morning exercises: arms up and stretch, bend down to touch the toes, twist side to
//              side, counting いち、に!
//   q-think    思: a person, hand on her chin, head tilted; a thought bubble rises from her head and shows a house, then a
//              heart
//   q-idea     意: a person scratches his head under a "?"; a light bulb switches on over him and he points a finger up: !
//   q-energy   気: a person stands slumped, head hanging; a battery beside him fills up bar by bar, green, and he jumps up
//              cheering (げんき!)
//   q-heart    心: a person hugs herself while a glowing heart beats in her chest, bigger and bigger: ドキドキ
//   q-shiver   冷: a person hugs himself and shivers by the frosty kanji, snow falling, his breath puffing: ブルブル
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, heart } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { label, pop, person } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
const arms = (p, k, side = 0.1, up = 0.25) => { p.handTo('R', p.at('over', W, -side, up, 0.02), k, { out: 0.4, down: 0.2 }); p.handTo('L', p.at('over', W, side, up, 0.02), k, { out: 0.4, down: 0.2 }); };
// both arms crossed, each hand on the other shoulder (hugging yourself)
const hugSelf = (p, k) => { p.handTo('R', p.local(0.11, 0.63, 0.1, W), k, { out: 0.5, down: 0.9 }); p.handTo('L', p.local(-0.11, 0.6, 0.12, W), k, { out: 0.5, down: 0.9 }); };

// ---- 体 ----
function exercise(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), counts = ['いち', 'に', 'さん', 'し'].map((c) => label(u, c + '!', '#3a8a5a', 0.12));
  const mat = solidProp([[G.box(0.5 * u, 0.012 * u, 0.3 * u, 0, 0.006 * u, 0), 0x3a9ae0]], 0.35);
  mat.position.set(x0, floor, 0.05 * u);
  group.add(mat, p.group, ...counts);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', 0.2); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.2;
      // 1 stretch up, 2 bend down to the toes, 3 twist left, 4 twist right; each with its count
      const s1 = pre ? 0 : bump(v, 0.3, 1.6), s2 = pre ? 0 : bump(v, 2.1, 1.6), s3 = pre ? 0 : bump(v, 3.9, 1.6), s4 = pre ? 0 : bump(v, 5.7, 1.6);
      arms(p, s1);
      p.turn('Abdomen', 0.75 * s2); p.turn('Torso', 0.55 * s2); p.turn('Head', 0.2 * s2);
      p.handTo('R', p.local(-0.08, 0.05, 0.12, W), s2, { out: 0.3, down: 0.4 }); p.handTo('L', p.local(0.08, 0.05, 0.12, W), s2, { out: 0.3, down: 0.4 });
      const tw = s3 - s4;
      p.turn('Abdomen', 0, 0.5 * tw); p.turn('Torso', 0, 0.35 * tw);
      p.handTo('R', p.local(-0.45, 0.72, 0.02, W), Math.abs(tw), { out: 0.9, down: 0.3 }); p.handTo('L', p.local(0.45, 0.72, 0.02, W), Math.abs(tw), { out: 0.9, down: 0.3 });
      [s1, s2, s3, s4].forEach((s, i) => pop(counts[i], s > 0.5 ? 1 : 0, x0 + 0.35 * u, floor + 1.05 * u, 0.15 * u));
    },
  };
}

// a thought bubble: a cloud with two little puffs trailing down to the left; origin at the cloud's middle
const cloud = (u) => solidProp([[G.sphere(0.2 * u, 0, 0, 0, 1.4, 0.95, 0.5), 0xffffff], [G.sphere(0.12 * u, -0.2 * u, 0.06 * u, 0.02 * u, 1, 1, 0.5), 0xffffff], [G.sphere(0.12 * u, 0.22 * u, 0.04 * u, 0.02 * u, 1, 1, 0.5), 0xffffff],
  [G.sphere(0.045 * u, -0.26 * u, -0.24 * u, 0, 1, 1, 0.6), 0xffffff], [G.sphere(0.028 * u, -0.33 * u, -0.34 * u, 0, 1, 1, 0.6), 0xffffff]], 0.9);

// ---- 思 ----
function think(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.4 * u;
  const p = person(spec.who, u), bub = cloud(u), house = emblemProp('house', 0.2 * u, { color: '#e07a3a' }), hrt = emblemProp('heart', 0.2 * u, { color: '#ff4a6a' });
  group.add(p.group, bub, house, hrt);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.3;
      // hand on her chin, head tilted, eyes up; the other arm across her waist under the elbow
      const k = pre ? A.setup : between(v, 0.2, 0.7) * (1 - between(v, 6.2, 6.7));
      p.turn('Head', -0.15 * k, 0.15 * k, 0.2 * k);
      p.handTo('R', p.at('mouth', W, -0.01, -0.05, 0.05), k, { out: 0.3, down: 1 });
      p.handTo('L', p.local(-0.05, 0.45, 0.14, W), k, { out: 0.4, down: 1 });
      const b = pre ? 0 : between(v, 0.8, 1.3) * (1 - between(v, 6.0, 6.4)), cx = x0 + 0.42 * u, cy = floor + 1.2 * u;
      bub.visible = b > 0.01; bub.scale.setScalar(grow(b)); bub.position.set(cx, cy, 0.05 * u);
      // what she thinks of: a house, then a heart, each swelling into the bubble
      const h1 = pre ? 0 : between(v, 1.3, 1.6) * (1 - between(v, 3.4, 3.7)), h2 = pre ? 0 : between(v, 3.7, 4.0) * (1 - between(v, 5.8, 6.1));
      house.visible = h1 > 0.01; house.scale.setScalar(0.2 * u * grow(h1)); house.position.set(cx, cy + 0.02 * u, 0.12 * u); house.idle(v);
      hrt.visible = h2 > 0.01; hrt.scale.setScalar(0.2 * u * grow(h2)); hrt.position.set(cx, cy, 0.12 * u); hrt.idle(v);
    },
  };
}

// ---- 意 ----
function idea(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u), q = label(u, '?', '#6a6a7a', 0.2), bang = label(u, '!', '#e0a020', 0.2), bulb = emblemProp('lightbulb', 0.3 * u, { color: '#ffe060' });
  group.add(p.group, q, bang, bulb);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { scratch: [0.2, 0.4], unscratch: [2.4, 0.2], on: [2.6, 0.35, 'back'], point: [2.7, 0.3], off: [5.4, 0.5] });
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.3;
      // he scratches his head, puzzled, under a "?"
      const sc = T.scratch * (1 - T.unscratch);
      p.handTo('R', p.at('over', W, -0.06, -0.03 + 0.03 * Math.sin(v * 16), 0.0), sc, { out: 0.8, down: 0.3 }); p.turn('Head', 0, 0, 0.2 * sc);
      pop(q, sc, x0 + 0.05 * u, floor + 1.15 * u, 0.1 * u);
      // a light bulb switches on over him; his finger goes up: !
      const on = T.on * (1 - T.off);
      bulb.visible = on > 0.01; bulb.scale.setScalar(0.3 * u * grow(on)); bulb.position.set(x0 + 0.05 * u, floor + 1.25 * u, 0.1 * u); bulb.idle(v);
      p.handTo('R', p.local(-0.18, 1.0, 0.18, W), T.point * (1 - T.off), { out: 0.5, down: 0.6 });
      p.turn('Head', -0.15 * on);
      pop(bang, on, x0 + 0.35 * u, floor + 1.1 * u, 0.1 * u);
    },
  };
}

// ---- 気 ----
function energy(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.4 * u, bx = x0 + 0.55 * u, by = floor + 0.55 * u;
  const p = person(spec.who, u), yay = label(u, 'げんき!', '#3aa050', 0.13);
  const shell = solidProp([[G.box(0.2 * u, 0.42 * u, 0.04 * u, 0, 0, -0.02 * u), 0x30343c], [G.box(0.08 * u, 0.04 * u, 0.04 * u, 0, 0.23 * u, -0.02 * u), 0x30343c], [G.box(0.17 * u, 0.39 * u, 0.02 * u, 0, 0, 0), 0x15181e]], 0.4);
  const low = solidProp([[G.box(0.15 * u, 0.08 * u, 0.02 * u, 0, 0, 0), 0xe04040]], 1.0), bars = many([[G.box(0.15 * u, 0.08 * u, 0.02 * u, 0, 0, 0), 0x40e060]], 4, 1.0);
  shell.position.set(bx, by, 0); group.add(p.group, shell, low, bars, yay);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const fill = pre ? 0 : between(v, 1.0, 3.2) * (1 - between(v, 6.0, 6.4)), full = fill >= 1;
      const cheer = !pre && v > 3.3 && v < 5.6;
      // slumped, arms hanging, head down; then a jump and cheer when the battery is full
      p.pose(cheer ? 'Victory' : 'Idle', cheer ? (v - 3.3) * 0.8 : 0.2, !cheer);
      const slump = cheer ? 0 : pre ? 1 : 1 - 0.6 * fill;
      p.turn('Abdomen', 0.35 * slump); p.turn('Torso', 0.2 * slump); p.turn('Head', 0.45 * slump);
      p.group.position.set(x0, floor + (cheer ? 0.12 * u * bump(v, 3.3, 0.5) : 0), 0.05 * u); p.group.rotation.y = 0.15;
      low.position.set(bx, by - 0.145 * u, 0.012 * u); low.visible = !full && Math.sin(v * 8) > -0.3;
      for (let i = 0; i < 4; i++) bars.set(i, bx, by - 0.145 * u + 0.097 * u * i, 0.012 * u, fill * 5 > i + 1 ? 1 : 0);
      bars.commit();
      pop(yay, cheer ? Math.min(1, (v - 3.3) * 4) : 0, x0, floor + 1.15 * u, 0.15 * u);
    },
  };
}

// ---- 心 ----
function heartBeat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u), hrt = heart(u, { s: 0.14 }), glow = solidProp([[G.sphere(0.16 * u, 0, 0, 0), 0xff7a9a]], 1.4), doki = label(u, 'ドキドキ', '#e0407a', 0.12);
  glow.material.transparent = true; glow.material.opacity = 0.3; glow.material.depthWrite = false;
  group.add(p.group, hrt, glow, doki);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.15;
      const k = pre ? A.setup : between(v, 0.2, 0.6) * (1 - between(v, 5.4, 5.8));
      // the heart sits in front of her chest; she holds her hands over it; it beats faster and bigger
      const rate = 5 + 5 * between(v, 0.5, 3.5), big = 1 + 0.6 * between(v, 0.5, 3.5) * (1 - between(v, 4.5, 5.5));
      const beat = 1 + 0.25 * Math.max(0, Math.sin(v * rate)) ** 4;
      p.local(0.02, 0.6, 0.2, W); hrt.position.copy(group.worldToLocal(W)); hrt.rotation.y = p.group.rotation.y;
      hrt.scale.setScalar(grow(k) * big * beat); glow.position.copy(hrt.position); glow.scale.setScalar(grow(k) * big * beat);
      p.handTo('R', p.local(-0.1, 0.55, 0.22, W2), k, { out: 0.6, down: 0.9 }); p.handTo('L', p.local(0.14, 0.55, 0.22, W2), k, { out: 0.6, down: 0.9 });
      p.turn('Head', 0.25 * k);
      pop(doki, pre ? 0 : between(v, 1.2, 1.5) * (1 - between(v, 4.6, 4.9)), x0 + 0.3 * u, floor + 1.1 * u + 0.01 * u * Math.sin(v * 20), 0.15 * u);
    },
  };
}

// ---- 冷 ----
function shiver(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u), brr = label(u, 'ブルブル', '#3a7ac0', 0.12), breath = many(PUFF(u, 0xe8f2ff), 5, 0.7), snow = many([[G.sphere(0.018 * u), 0xffffff]], 24, 1.0);
  const scarf = solidProp([[G.torus(0.06 * u, 0.025 * u, Math.PI * 2, 0, 0, 0), 0x3a8ae0], [G.box(0.04 * u, 0.12 * u, 0.02 * u, 0.03 * u, -0.07 * u, 0.05 * u), 0x3a8ae0]], 0.4);
  group.add(p.group, brr, breath, snow, scarf);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', 0.3);
      const k = pre ? A.setup : between(v, 0.1, 0.5) * (1 - between(v, 5.0, 5.4)), sh = k * Math.sin(v * 40);
      p.group.position.set(x0 + 0.006 * u * sh, floor, 0.05 * u); p.group.rotation.set(0, -0.3, 0.02 * sh);
      hugSelf(p, k); p.turn('Head', 0.15 * k); p.turn('Abdomen', 0.12 * k);
      p.at('mouth', W, 0, -0.1, -0.05); scarf.position.copy(group.worldToLocal(W)); scarf.rotation.set(Math.PI / 2, p.group.rotation.y, 0, 'YXZ');
      // little clouds of breath, puff after puff
      for (let i = 0; i < 5; i++) { const f = pre ? -1 : ((v * 0.8 + i / 5) % 1); p.at('mouth', W2, 0, 0, 0.05 + 0.25 * f); W2.y += 0.06 * u * f; group.worldToLocal(W2); breath.set(i, W2.x - 0.1 * u * f, W2.y, W2.z, f >= 0 ? 0.6 + 0.8 * f * (1 - f) * 4 * (1 - f) : 0); }
      breath.commit();
      for (let i = 0; i < 24; i++) { const f = (((pre ? 0 : v) * 0.25 + i * 0.37) % 1); snow.set(i, B.minX + ((i * 0.41) % 1) * (x0 + 0.6 * u - B.minX), floor + 1.4 * u - 1.4 * u * f, -0.2 * u + 0.4 * u * ((i * 0.53) % 1), 1); }
      snow.commit();
      pop(brr, pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 4.6, 4.9)), x0 + 0.35 * u, floor + 1.1 * u, 0.15 * u);
    },
  };
}

export const SCENES = { 'q-exercise': exercise, 'q-think': think, 'q-idea': idea, 'q-energy': energy, 'q-heart': heartBeat, 'q-shiver': shiver };
