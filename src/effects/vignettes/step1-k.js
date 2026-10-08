// Step 1 scenes, part K: new, hearing, meeting, saying, ten thousand, knowing, spirit, gaps, school, company, names, tall.
//   new-toy        新: a box opens and a shiny new toy robot pops up, sparkling, a NEW tag on it. outcome shoes: a worn
//                  old shoe is swapped for a shiny new one that sparkles (新しい)
//   newspaper      新聞: a rolled newspaper flies in, unrolls, and its headline flashes NEWS
//   ear-gate       聞: a person at a gate cups a hand to their ear; sound rings come through the gate to them. outcome
//                  shell: a kid holds a big seashell to their ear and little waves wash past (聞く)
//   meet-bow       会: two people walk in from either side, meet in the middle and bow to each other. outcome run: two
//                  friends run to each other and hug, hearts (会う)
//   say-hello      言: a person waves and says こんにちは in a big speech bubble. outcome parrot: a parrot on a perch
//                  squawks the same word back twice (言う)
//   odometer       万: a counter rolls up faster and faster, 9997, 9998, 9999 ... 10000! and fireworks burst
//   wise-owl       知: a wise owl in a graduation cap blinks, nods and a "!" pops over it. outcome map: the owl taps a map
//                  with its wing and a pin pops up: it knows the way (知る)
//   battery-up     気: a droopy person; a battery over their head fills up bar by bar and they jump up full of energy
//   bookends       間: two bookends with a gap between them; a book slides down into the gap and fits, a click
//   school-bell    校: a little school with a clock tower; its bell swings and rings. outcome kids: kids run in through
//                  the school gate as the bell rings (学校)
//   office-tower   社: an office tower; its windows light up floor by floor, a sign on the roof. outcome commute: people
//                  with briefcases walk into the tower one after another (会社)
//   name-card      名: a hand slides a name card into the name plate on a door; it glows. outcome write: a pencil writes
//                  a name on a notebook's label (名前)
//   giraffe-tall   高: a giraffe stretches its neck up higher and higher to reach a leaf. outcome price: a price tag's
//                  number shoots up and up, ¥¥¥, and eyes pop (高い)
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

// ---- 新 new ----
function newToy(ctx, spec, stage) {
  if (spec.outcome === 'shoes') return newShoes(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u;
  const box = solidProp([[G.box(0.4 * u, 0.26 * u, 0.3 * u, 0, 0.13 * u, 0), 0x3a7ae0], [G.box(0.06 * u, 0.265 * u, 0.305 * u, 0, 0.13 * u, 0), 0xffd040]], 0.45), flaps = many([[G.box(0.2 * u, 0.012 * u, 0.3 * u, 0.1 * u, 0, 0), 0x5a9af0]], 2, 0.45);
  const robot = solidProp([[G.box(0.16 * u, 0.18 * u, 0.12 * u, 0, 0.09 * u, 0), 0xd8dde6], [G.box(0.13 * u, 0.11 * u, 0.11 * u, 0, 0.25 * u, 0), 0xd8dde6], [G.sphere(0.02 * u, -0.035 * u, 0.26 * u, 0.056 * u), 0x40c0ff], [G.sphere(0.02 * u, 0.035 * u, 0.26 * u, 0.056 * u), 0x40c0ff], [G.cyl(0.006 * u, 0.006 * u, 0.06 * u, 0, 0.33 * u, 0), 0x808890], [G.sphere(0.015 * u, 0, 0.37 * u, 0), 0xff4040], [G.box(0.05 * u, 0.04 * u, 0.01 * u, 0, 0.1 * u, 0.061 * u), 0xffd040]], 0.6);
  const tag = textPlane('NEW', { h: 0.12 * u, color: '#ffffff', bg: '#e03030', pad: 0.3 }), spk = many(SPARK(u), 8, 1.8);
  box.position.set(bx, floor, 0);
  group.add(box, flaps, robot, tag, spk);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.3, 0.4, 'out'], pop: [0.6, 0.5, 'back'], down: [4.6, 0.5, 'in'], shut: [5.0, 0.4] }), o = T.open - T.shut, p = T.pop - T.down;
      flaps.set(0, bx - 0.2 * u, floor + 0.26 * u, 0, 1, 2.2 * o); flaps.set(1, bx + 0.2 * u, floor + 0.26 * u, 0, 1, Math.PI - 2.2 * o); flaps.commit();
      robot.visible = p > 0.02; robot.position.set(bx, floor + 0.05 * u + 0.25 * u * p, 0.02 * u); robot.rotation.y = 0.5 * Math.sin(v * 2) * p;
      const k = pre ? 0 : between(v, 1.1, 1.4) * (1 - T.down); tag.visible = k > 0.01; tag.scale.setScalar(grow(k)); tag.position.set(bx + 0.25 * u, floor + 0.62 * u, 0.06 * u); tag.rotation.z = -0.2;
      sparkle(spk, 8, bx, floor + 0.45 * u, 0.25, pre ? 0 : ((v - 1.0) / 1.2) % 1 * (v > 1.0 && v < 4.4 ? 1 : 0), u);
    },
  };
}
function newShoes(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.45 * u;
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
function newspaper(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.55 * u, py = B.cy;
  const roll = solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.4 * u, 0, 0, 0), 0xf0ece0], [G.cyl(0.052 * u, 0.052 * u, 0.04 * u, 0, 0, 0), 0xc03030]], 0.5);
  const sheet = solidProp([[G.box(0.5 * u, 0.62 * u, 0.008 * u, 0, 0, 0), 0xf4f0e4], ...[0, 1, 2, 3, 4].map((i) => [G.box(0.2 * u, 0.012 * u, 0.01 * u, -0.12 * u, (-0.05 - 0.05 * i) * u, 0.002 * u), 0x8a8a8a]), [G.box(0.18 * u, 0.2 * u, 0.01 * u, 0.12 * u, -0.12 * u, 0.002 * u), 0x9ab0c8]], 0.5);
  const head = textPlane('NEWS', { h: 0.13 * u, color: '#202020', weight: 900 }), title = textPlane('しんぶん', { h: 0.07 * u, color: '#c03030', weight: 900 });
  group.add(roll, sheet, head, title);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fly: [0, 0.8, 'out'], open: [0.9, 0.5, 'back'], close: [4.5, 0.5] }), o = T.open - T.close;
      roll.visible = !pre && o < 0.5; roll.position.set(px + 1.0 * u * (1 - T.fly), py + 0.4 * u * (1 - T.fly), 0.04 * u); roll.rotation.z = Math.PI / 2 + v * 6 * (1 - T.fly);
      sheet.visible = o > 0.02; sheet.scale.set(grow(o), 1, 1); sheet.position.set(px, py, 0.02 * u); sheet.rotation.y = 0.15 * Math.sin(t * 1.5);
      const flash = 0.85 + 0.15 * Math.sin(t * 8); head.visible = o > 0.6; head.position.set(px, py + 0.2 * u, 0.03 * u); head.scale.setScalar(flash); title.visible = o > 0.6; title.position.set(px, py + 0.08 * u, 0.03 * u);
    },
  };
}

// ---- 聞 hear ----
function earGate(ctx, spec, stage) {
  if (spec.outcome === 'shell') return seashell(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.75 * u;
  const gate = solidProp([[G.box(0.06 * u, 0.85 * u, 0.06 * u, -0.25 * u, 0.42 * u, 0), 0x8a3020], [G.box(0.06 * u, 0.85 * u, 0.06 * u, 0.25 * u, 0.42 * u, 0), 0x8a3020], [G.box(0.65 * u, 0.06 * u, 0.08 * u, 0, 0.82 * u, 0), 0x8a3020], [G.box(0.2 * u, 0.6 * u, 0.02 * u, -0.12 * u, 0.32 * u, -0.02 * u), 0xa86040], [G.box(0.2 * u, 0.6 * u, 0.02 * u, 0.12 * u, 0.32 * u, -0.02 * u), 0xa86040]], 0.4);
  const p = createPerson({ u: 0.9 * u, shirt: 0x5a8ad0 }), rings = many([[G.torus(0.1 * u, 0.01 * u, Math.PI * 0.6, 0, 0, 0, -0.3 * Math.PI), 0xffe060]], 4, 1.2), notes = emblemProp('note', 0.18 * u);
  gate.position.set(gx, floor, -0.15 * u);
  group.add(gate, p.group, rings, notes);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, cup = pre ? 0 : between(v, 0.3, 0.7) * (1 - between(v, 4.6, 5.0));
      p.reset().face(1.3); p.group.position.set(gx - 0.5 * u, floor, 0.05 * u); p.bone('head').rotation.z = -0.15 * cup; p.bone('head').rotation.y = 0.5 * cup;
      p.raise('R', 2.2 * cup); p.bone('foreR').rotation.z = -1.6 * cup; p.update();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.8 + i / 4) % 1); rings.set(i, gx - 0.05 * u - 0.35 * u * f, floor + 0.65 * u, -0.05 * u, cup > 0.5 ? 0.8 + 0.8 * (1 - f) : 0, Math.PI); }
      rings.commit();
      notes.visible = cup > 0.5; notes.position.set(gx, floor + 0.95 * u, -0.1 * u); notes.idle(t);
    },
  };
}
function seashell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.9 * u, shirt: 0x40b0e0 }), shell = solidProp([[G.cone(0.1 * u, 0.22 * u, 0, 0, 0, Math.PI / 2), 0xffc8b0], ...[0, 1, 2].map((i) => [G.torus((0.09 - 0.025 * i) * u, 0.012 * u, Math.PI * 2, (0.07 - 0.05 * i) * u, 0, 0).rotateY(Math.PI / 2), 0xf0a890])], 0.5);
  const waves = many([[G.torus(0.08 * u, 0.015 * u, Math.PI, 0, 0, 0), 0x5ab0ff]], 3, 0.9);
  group.add(kid.group, shell, waves);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, hold = pre ? 0 : between(v, 0.2, 0.7) * (1 - between(v, 4.3, 4.8));
      kid.reset().face('toward'); kid.group.position.set(kx, floor, 0.02 * u); kid.raise('R', 2.2 * hold); kid.bone('foreR').rotation.z = -1.9 * hold; kid.bone('head').rotation.z = 0.25 * hold; kid.update();
      bonePoint(kid, 'head', 0.5, tmp); shell.position.set(tmp.x - 0.15 * u, tmp.y, tmp.z + 0.02 * u); shell.visible = !pre; shell.rotation.z = 0.2;
      kid.rig.setColor('eyeL', hold > 0.6 ? 0xffd2b0 : 0x1a1a24); kid.rig.setColor('eyeR', hold > 0.6 ? 0xffd2b0 : 0x1a1a24);
      for (let i = 0; i < 3; i++) { const f = ((v * 0.5 + i / 3) % 1); waves.set(i, kx + 0.5 * u - 0.15 * u * f, floor + 0.85 * u + 0.08 * u * Math.sin(f * 6), 0.0, hold > 0.6 ? Math.sin(Math.PI * f) * 1.2 : 0); }
      waves.commit();
    },
  };
}

// ---- 会 meet ----
function meetBow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.65 * u, run = spec.outcome === 'run';
  const a = createPerson({ u: 0.9 * u, shirt: run ? 0xff8a40 : 0x3a5a9a }), b = createPerson({ u: 0.9 * u, shirt: run ? 0x40c0a0 : 0x8a3a5a, hair: 0x5a2a14 }), hearts = many(HEART(u, 0.1), 3, 0.8);
  group.add(a.group, b.group, hearts);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, run ? 1.0 : 1.6, run ? 'in' : 'out'], bow: [1.8, 0.5], up: [2.8, 0.5], part: [4.4, 1.0, 'in'] });
      const d = (0.55 * (1 - T.walk) + 0.6 * T.part) * u + (run ? 0.08 : 0.22) * u, moving = (T.walk > 0 && T.walk < 1) || (T.part > 0 && T.part < 1);
      [[a, -1], [b, 1]].forEach(([p, s]) => {
        p.reset().face(T.part > 0 ? (s < 0 ? 'left' : 'right') : (s < 0 ? 'right' : 'left')); if (moving) p.walk(v * (run ? 14 : 9), 1);
        p.group.position.set(mx + s * d, floor, 0.02 * u);
        if (run) { const hug = T.bow - T.part; for (const k of ['L', 'R']) { p.bone(`arm${k}`).rotation.x = 1.4 * hug; p.raise(k, 0.5 * hug); } }
        else p.lean(0.8 * (T.bow - T.up));
        p.update();
      });
      heartsSet(hearts, mx, floor + 1.0 * u, v, run && !pre ? T.bow - T.part : 0, u);
    },
  };
}
const heartsSet = (m, x, y, v, on, u) => { for (let i = 0; i < 3; i++) { const f = ((v * 0.5 + i / 3) % 1); m.set(i, x + (i - 1) * 0.12 * u, y + 0.35 * u * f, 0.1 * u, on * Math.sin(Math.PI * f)); } m.commit(); };

// ---- 言 say ----
function sayHello(ctx, spec, stage) {
  if (spec.outcome === 'parrot') return parrot(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0xe07a3a }), bubble = textPlane('こんにちは', { h: 0.16 * u, color: '#202838', bg: '#ffffff', pad: 0.3 }), tail = solidProp([[G.cone(0.04 * u, 0.1 * u, 0, 0, 0, 2.6), 0xffffff]], 0.9);
  group.add(p.group, bubble, tail);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, k = pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 4.2, 4.5));
      p.reset().face(0.4); p.group.position.set(px, floor, 0.02 * u); p.raise('R', 2.5 * k); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 9) * k; p.bone('head').rotation.x = -0.1 * Math.abs(Math.sin(v * 10)) * k; p.update();
      bubble.visible = tail.visible = k > 0.01; bubble.scale.setScalar(grow(k)); bubble.position.set(px + 0.45 * u, floor + 1.05 * u + 0.02 * u * Math.sin(v * 4), 0.06 * u); tail.position.set(px + 0.2 * u, floor + 0.93 * u, 0.06 * u); tail.scale.setScalar(grow(k));
    },
  };
}
function parrot(ctx, spec, stage) {
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

// ---- 万 ten thousand ----
function odometer(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u, cy = B.cy;
  const count = liveText(u, { h: 0.24, w: 0.85, color: '#ffffff', bg: '#202838' }), frame = solidProp([[G.box(0.95 * u, 0.32 * u, 0.04 * u, 0, 0, -0.025 * u), 0xc8a040]], 0.6);
  const fw = many([[G.sphere(0.02 * u), 0xffffff]], 24, 1.8), COL = [0xff5a7a, 0xffd040, 0x5ab0ff, 0x60e080]; for (let i = 0; i < 24; i++) fw.setColorAt(i, new THREE.Color(COL[Math.floor(i / 8) % 4]));
  count.position.set(cx, cy, 0.01 * u); frame.position.set(cx, cy, 0);
  group.add(frame, count, fw);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 2.6), n = Math.min(10000, Math.round(10000 * Math.pow(f, 0.35)));
      count.set(String(n)); count.scale.setScalar(1 + 0.25 * bump(v, 2.6, 0.5));
      for (let b = 0; b < 3; b++) { const at = 2.6 + 0.4 * b, g = pre ? 0 : between(v, at, at + 1.0), bx = cx + (b - 1) * 0.35 * u, by = cy + 0.55 * u + 0.1 * u * b; for (let i = 0; i < 8; i++) { const a = i * 0.785; fw.set(b * 8 + i, bx + Math.cos(a) * 0.25 * u * g, by + Math.sin(a) * 0.25 * u * g - 0.1 * u * g * g, -0.05 * u, g > 0 && g < 1 ? 1.5 * (1 - g) : 0); } }
      fw.commit();
    },
  };
}

// ---- 知 know ----
function wiseOwl(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ox = B.maxX + 0.45 * u, map = spec.outcome === 'map';
  const owl = solidProp([[G.sphere(0.17 * u, 0, 0.2 * u, 0, 1, 1.2, 0.9), 0x8a6a4a], [G.sphere(0.12 * u, 0, 0.17 * u, 0.06 * u, 1, 1.1, 0.6), 0xd8c0a0], [G.sphere(0.06 * u, -0.06 * u, 0.3 * u, 0.1 * u), 0xffffff], [G.sphere(0.06 * u, 0.06 * u, 0.3 * u, 0.1 * u), 0xffffff], [G.cone(0.025 * u, 0.05 * u, 0, 0.24 * u, 0.15 * u, Math.PI), 0xffa020], [G.cone(0.04 * u, 0.08 * u, -0.1 * u, 0.42 * u, 0, 0.4), 0x8a6a4a], [G.cone(0.04 * u, 0.08 * u, 0.1 * u, 0.42 * u, 0, -0.4), 0x8a6a4a]], 0.45);
  const pupils = many([[G.sphere(0.03 * u), 0x101010]], 2, 0.2), lids = many([[G.sphere(0.062 * u, 0, 0, 0, 1, 1, 0.5), 0x8a6a4a]], 2, 0.45), cap = solidProp([[G.box(0.24 * u, 0.02 * u, 0.24 * u, 0, 0.04 * u, 0), 0x202028], [G.cyl(0.08 * u, 0.09 * u, 0.05 * u, 0, 0.01 * u, 0), 0x202028], [G.cyl(0.004 * u, 0.004 * u, 0.1 * u, 0.1 * u, -0.01 * u, 0.1 * u), 0xffd040]], 0.45);
  const bang = textPlane('!', { h: 0.25 * u, color: '#ffe040', weight: 900 }), mapM = map ? solidProp([[G.box(0.4 * u, 0.3 * u, 0.01 * u, 0, 0, 0), 0xf0e0b0], [G.poly([[-0.15 * u, -0.1 * u], [-0.05 * u, 0.0], [0.05 * u, -0.05 * u], [0.13 * u, 0.08 * u]], 0.008 * u).translate(0, 0, 0.008 * u), 0xc03030], [G.sphere(0.05 * u, -0.1 * u, 0.06 * u, 0.006 * u, 1, 1, 0.1), 0x60b060]], 0.5) : null, pin = map ? solidProp([[G.cone(0.025 * u, 0.08 * u, 0, 0.04 * u, 0, Math.PI), 0xe03030], [G.sphere(0.04 * u, 0, 0.1 * u, 0), 0xe03030]], 0.6) : null;
  const og = new THREE.Group(); og.add(owl, pupils, lids, cap); og.position.set(ox, floor, 0);
  cap.position.set(0, 0.47 * u, 0); cap.rotation.z = -0.15;
  group.add(og, bang); if (map) { mapM.position.set(ox + 0.42 * u, floor + 0.2 * u, 0.05 * u); mapM.rotation.x = -0.4; group.add(mapM, pin); }
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, blink = pre ? 0 : Math.max(bump(v, 0.6, 0.3), bump(v, 1.0, 0.3)), nod = pre ? 0 : bump(v, 1.6, 0.8);
      for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; pupils.set(i, s * 0.06 * u + 0.01 * u * Math.sin(v), 0.3 * u, 0.15 * u, 1); lids.set(i, s * 0.06 * u, 0.3 * u + 0.03 * u * (1 - blink), 0.11 * u, blink > 0.05 ? 1 : 0, 0, 0, 0); }
      pupils.commit(); lids.commit();
      og.rotation.x = 0.25 * nod; og.rotation.z = map ? -0.2 * bump(v, 2.4, 1.0) : 0;
      const k = pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 4.6, 5.0)); bang.visible = k > 0.01; bang.scale.setScalar(grow(k)); bang.position.set(ox, floor + 0.75 * u, 0.05 * u);
      if (map) { const p = pre ? 0 : between(v, 2.6, 3.0) * (1 - between(v, 4.6, 5.0)); pin.visible = p > 0.01; pin.scale.setScalar(grow(p)); pin.position.set(ox + 0.55 * u, floor + 0.28 * u, 0.1 * u); }
    },
  };
}

// ---- 気 spirit ----
function batteryUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0x6a5ad0 }), shell = solidProp([[G.box(0.32 * u, 0.15 * u, 0.04 * u, 0, 0, 0), 0x404858], [G.box(0.04 * u, 0.07 * u, 0.04 * u, 0.18 * u, 0, 0), 0x404858], [G.box(0.28 * u, 0.11 * u, 0.042 * u, 0, 0, 0), 0x101418]], 0.4);
  const bars = many([[G.box(0.06 * u, 0.09 * u, 0.045 * u), 0x40e060]], 4, 1.2), spk = many([[G.sphere(0.02 * u), 0xffe060]], 6, 1.6);
  group.add(p.group, shell, bars, spk);
  const loop = 6.0, red = new THREE.Color(0xff4040), green = new THREE.Color(0x40e060);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, fill = pre ? 0.25 : 0.25 + 0.75 * between(v, 0.6, 2.6) - 0.75 * between(v, 5.0, 5.8), jump = pre ? 0 : bump(v, 2.8, 0.6) + bump(v, 3.5, 0.6);
      const droop = Math.max(0, 1 - (fill - 0.25) / 0.6);
      p.reset().face('toward'); p.group.position.set(px, floor + 0.2 * u * jump, 0.02 * u); p.lean(0.4 * droop); p.bone('head').rotation.x = 0.35 * droop;
      const up = between(fill, 0.9, 1); p.raise('L', 0.3 + 2.4 * up); p.raise('R', 0.3 + 2.4 * up); p.update();
      shell.position.set(px, floor + 1.1 * u - 0.1 * u * droop, 0.03 * u);
      for (let i = 0; i < 4; i++) { bars.set(i, px - 0.1 * u + i * 0.067 * u, floor + 1.1 * u - 0.1 * u * droop, 0.031 * u, fill > (i + 0.5) / 4 ? 1 : 0); bars.setColorAt(i, fill < 0.4 ? red : green); }
      bars.commit(); bars.instanceColor.needsUpdate = true;
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : between(v, 2.6, 3.8), a = i * 1.05; spk.set(i, px + Math.cos(a) * 0.4 * u * f, floor + 0.6 * u + Math.sin(a) * 0.4 * u * f, 0.05 * u, f > 0 && f < 1 ? 1 - f : 0); }
      spk.commit();
    },
  };
}

// ---- 間 a gap ----
function bookends(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u, gap = 0.16 * u;
  const end = (s) => solidProp([[G.box(0.05 * u, 0.4 * u, 0.22 * u, s * (gap / 2 + 0.17 * u + 0.025 * u), 0.2 * u, 0), 0x8a5a30], [G.box(0.12 * u, 0.03 * u, 0.22 * u, s * (gap / 2 + 0.17 * u + 0.07 * u), 0.015 * u, 0), 0x8a5a30]], 0.4);
  const books = solidProp([[G.box(0.05 * u, 0.32 * u, 0.2 * u, -gap / 2 - 0.03 * u, 0.16 * u, 0), 0xe04848], [G.box(0.06 * u, 0.28 * u, 0.2 * u, -gap / 2 - 0.09 * u, 0.14 * u, 0), 0x3a7ae0], [G.box(0.04 * u, 0.3 * u, 0.2 * u, -gap / 2 - 0.145 * u, 0.15 * u, 0), 0x40b060], [G.box(0.05 * u, 0.3 * u, 0.2 * u, gap / 2 + 0.03 * u, 0.15 * u, 0), 0xffb030], [G.box(0.06 * u, 0.33 * u, 0.2 * u, gap / 2 + 0.09 * u, 0.165 * u, 0), 0x8a5ad0], [G.box(0.04 * u, 0.27 * u, 0.2 * u, gap / 2 + 0.145 * u, 0.135 * u, 0), 0xe06a9a]], 0.45);
  const book = solidProp([[G.box(gap * 0.96, 0.3 * u, 0.2 * u, 0, 0.15 * u, 0), 0x30c0c0], [G.box(gap * 0.97, 0.02 * u, 0.205 * u, 0, 0.25 * u, 0), 0xffd040]], 0.5), arrow = solidProp([[G.cone(0.05 * u, 0.1 * u, 0, 0, 0, Math.PI), 0xffe060]], 1.3), click = many([[G.sphere(0.02 * u), 0xffffff]], 6, 1.6);
  const shelf = solidProp([[G.box(0.8 * u, 0.03 * u, 0.26 * u, 0, -0.015 * u, 0), 0xc89a60]], 0.35);
  const g = new THREE.Group(); g.add(shelf, end(-1), end(1), books); g.position.set(cx, floor, 0);
  group.add(g, book, arrow, click);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.8, 1.5), out = pre ? 0 : between(v, 4.2, 4.9);
      book.visible = !pre; book.position.set(cx, floor + 0.7 * u * (1 - f * f) + 0.7 * u * out, 0); book.rotation.z = 0.3 * (1 - f) + 0.05 * wobble(v, 1.5, 0.4, 6);
      const a = pre ? 0 : between(v, 0.2, 0.5) * (1 - between(v, 1.3, 1.5)); arrow.visible = a > 0.01; arrow.scale.setScalar(grow(a)); arrow.position.set(cx, floor + 0.55 * u + 0.05 * u * Math.sin(v * 8), 0.12 * u);
      for (let i = 0; i < 6; i++) { const c = pre ? 0 : between(v, 1.5, 2.1), an = i * 1.05; click.set(i, cx + Math.cos(an) * 0.2 * u * c, floor + 0.3 * u + Math.sin(an) * 0.2 * u * c, 0.12 * u, c > 0 && c < 1 ? 1 - c : 0); }
      click.commit();
    },
  };
}

// ---- 校 school ----
function schoolBell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u, kids = spec.outcome === 'kids';
  const school = solidProp([[G.box(0.8 * u, 0.4 * u, 0.25 * u, 0, 0.2 * u, 0), 0xf0e8d8], [G.box(0.22 * u, 0.25 * u, 0.25 * u, 0, 0.52 * u, 0), 0xf0e8d8], [G.cone(0.18 * u, 0.15 * u, 0, 0.72 * u, 0), 0xc04a3a], [G.cyl(0.07 * u, 0.07 * u, 0.01 * u, 0, 0.52 * u, 0.13 * u, Math.PI / 2), 0xffffff], [G.box(0.01 * u, 0.05 * u, 0.012 * u, 0, 0.54 * u, 0.135 * u), 0x202020], [G.box(0.04 * u, 0.01 * u, 0.012 * u, 0.02 * u, 0.52 * u, 0.135 * u), 0x202020], ...[-0.28, -0.14, 0.14, 0.28].map((x) => [G.box(0.08 * u, 0.1 * u, 0.01 * u, x * u, 0.25 * u, 0.126 * u), 0x9ad8ff]), [G.box(0.12 * u, 0.18 * u, 0.01 * u, 0, 0.09 * u, 0.126 * u), 0x6a4a2a]], 0.4);
  const bellP = new THREE.Group(), bell = solidProp([[G.sphere(0.06 * u, 0, -0.03 * u, 0), 0xe8b030], [G.sphere(0.02 * u, 0, -0.09 * u, 0), 0xa07020]], 0.8); bellP.add(bell); bellP.position.set(sx, floor + 0.86 * u, 0.0);
  const rings = many([[G.torus(0.1 * u, 0.008 * u), 0xffe080]], 2, 1.0), kidsM = kids ? [0xff8a40, 0x40b0e0, 0xe060a0].map((c) => createPerson({ u: 0.5 * u, shirt: c })) : [];
  school.position.set(sx, floor, -0.2 * u);
  group.add(school, bellP, rings, ...kidsM.map((k) => k.group));
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ring = pre ? 0 : between(v, 0.3, 0.5) * (1 - between(v, 2.6, 3.0));
      bellP.rotation.z = 0.6 * Math.sin(v * 12) * ring;
      for (let i = 0; i < 2; i++) { const f = ((v * 1.4 + i / 2) % 1); rings.set(i, sx, floor + 0.83 * u, 0.0, ring > 0.2 ? 1 + 1.5 * f : 0); }
      rings.commit();
      kidsM.forEach((k, i) => { const f = pre ? 0 : between(v, 0.5 + 0.4 * i, 2.8 + 0.4 * i); k.reset().face('away'); k.walk(v * 14, f > 0 && f < 1 ? 1 : 0); k.group.visible = f < 0.98 && !pre; k.group.position.set(sx + 0.7 * u - 0.7 * u * f + 0.1 * u * i, floor, 0.4 * u - 0.5 * u * f); k.group.scale.setScalar(1 - 0.3 * f); k.update(); });
    },
  };
}

// ---- 社 company ----
function officeTower(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.5 * u, commute = spec.outcome === 'commute';
  const tower = solidProp([[G.box(0.4 * u, 1.0 * u, 0.25 * u, 0, 0.5 * u, 0), 0x5a6a8a], [G.box(0.42 * u, 0.04 * u, 0.27 * u, 0, 1.0 * u, 0), 0x3a4a6a], [G.box(0.14 * u, 0.2 * u, 0.01 * u, 0, 0.1 * u, 0.126 * u), 0x9ad8ff]], 0.35);
  const wins = many([[G.box(0.08 * u, 0.08 * u, 0.01 * u), 0xffe080]], 15, 1.2), sign = textPlane('かいしゃ', { h: 0.09 * u, color: '#ffffff', bg: '#d03030', pad: 0.3 }), dark = new THREE.Color(0x203048), lit = new THREE.Color(0xffe080);
  const people = commute ? [0x303848, 0x6a3a3a, 0x3a5a3a].map((c) => createPerson({ u: 0.45 * u, shirt: c, pants: 0x202430 })) : [], bags = commute ? many([[G.box(0.08 * u, 0.06 * u, 0.025 * u), 0x4a2a1a]], 3, 0.4) : null;
  tower.position.set(tx, floor, -0.1 * u); sign.position.set(tx, floor + 1.07 * u, 0.03 * u);
  for (let i = 0; i < 15; i++) wins.set(i, tx + ((i % 3) - 1) * 0.12 * u, floor + (0.3 + Math.floor(i / 3) * 0.14) * u, 0.03 * u, 1);
  wins.commit();
  group.add(tower, wins, sign, ...people.map((p) => p.group)); if (bags) group.add(bags);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 2.6) * (1 - between(v, 5.0, 5.6));
      for (let i = 0; i < 15; i++) wins.setColorAt(i, f * 5 > Math.floor(i / 3) + 0.5 ? lit : dark);
      wins.instanceColor.needsUpdate = true;
      people.forEach((p, i) => { const g = pre ? 0 : between(v, 0.3 + 0.7 * i, 2.8 + 0.7 * i); p.reset().face(g < 0.85 ? -Math.PI / 2 - 0.7 : 'away'); p.walk(v * 10, g > 0 && g < 1 ? 1 : 0); p.group.visible = g > 0 && g < 0.98; p.group.position.set(tx + 0.9 * u - 0.9 * u * g, floor, 0.35 * u - 0.25 * u * g); p.update(); bonePoint(p, 'handR', 0.6, tmp); bags.set(i, tmp.x, tmp.y - 0.03 * u, tmp.z, p.group.visible ? 1 : 0); });
      if (bags) bags.commit();
    },
  };
}

// ---- 名 a name ----
function nameCard(ctx, spec, stage) {
  if (spec.outcome === 'write') return nameWrite(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.5 * u;
  const door = solidProp([[G.box(0.45 * u, 0.9 * u, 0.04 * u, 0, 0.45 * u, 0), 0x8a5a30], [G.sphere(0.025 * u, 0.15 * u, 0.42 * u, 0.03 * u), 0xffd040], [G.box(0.3 * u, 0.13 * u, 0.02 * u, 0, 0.7 * u, 0.025 * u), 0xc8a050]], 0.4);
  const card = textPlane('たなか', { h: 0.1 * u, w: 0.26 * u, color: '#202838', bg: '#fffaf0' }), hand = createHand({ u: 0.4 * u, sleeve: 0x3a7ae0 }), glow = solidProp([[G.box(0.34 * u, 0.17 * u, 0.005 * u), 0xffe060]], 1.4);
  glow.material.transparent = true; door.position.set(dx, floor, -0.08 * u);
  group.add(door, glow, card, hand.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.3, 1.3), out = pre ? 0 : between(v, 4.2, 4.8);
      const cx = dx + 0.6 * u * (1 - f) + 0.6 * u * out, cy = floor + 0.62 * u;
      card.position.set(cx, cy, -0.04 * u); card.visible = !pre;
      hand.pose('pinch'); hand.group.visible = !pre && f < 1; hand.group.position.set(cx + 0.18 * u, cy - 0.12 * u, -0.03 * u); hand.group.rotation.set(0, 0, 1.2);
      const g = pre ? 0 : between(v, 1.3, 1.6) * (1 - out); glow.visible = g > 0.01; glow.material.opacity = 0.5 * g * (0.8 + 0.2 * Math.sin(t * 6)); glow.position.set(dx, cy, -0.05 * u);
    },
  };
}
function nameWrite(ctx, spec, stage) {
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

// ---- 高 tall ----
function giraffeTall(ctx, spec, stage) {
  if (spec.outcome === 'price') return priceUp(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.45 * u;
  const body = solidProp([[G.sphere(0.16 * u, 0, 0.4 * u, 0, 1.5, 0.9, 0.8), 0xf0b040], ...[[-0.12, 0.08], [-0.12, -0.08], [0.12, 0.08], [0.12, -0.08]].map(([x, z]) => [G.cyl(0.025 * u, 0.025 * u, 0.36 * u, x * u, 0.18 * u, z * u), 0xf0b040]), ...[[-0.08, 0.45], [0.05, 0.38], [0.1, 0.47]].map(([x, y]) => [G.sphere(0.035 * u, x * u, y * u, 0.12 * u, 1, 1, 0.3), 0x8a4a20])], 0.45);
  const neck = solidProp([[G.cyl(0.04 * u, 0.05 * u, 1, 0, 0.5, 0), 0xf0b040]], 0.45), head = solidProp([[G.sphere(0.07 * u, 0.04 * u, 0, 0, 1.4, 0.9, 0.9), 0xf0b040], [G.sphere(0.015 * u, 0.05 * u, 0.03 * u, 0.06 * u), 0x101010], [G.cyl(0.008 * u, 0.008 * u, 0.06 * u, -0.02 * u, 0.08 * u, 0), 0x8a4a20], [G.cyl(0.008 * u, 0.008 * u, 0.06 * u, 0.02 * u, 0.08 * u, 0), 0x8a4a20]], 0.45);
  const tree = crown(0.7 * u, 3, [0x3aa040]), leaf = solidProp([[G.sphere(0.04 * u, 0, 0, 0, 1.4, 0.3, 1), 0x60d040]], 0.6);
  body.position.set(gx, floor, 0);
  [[0.4, 1.2, 1], [0.3, 1.1, 0.8], [0.52, 1.1, 0.8]].forEach(([x, y, s], i) => tree.set(i, gx + x * u, floor + y * u, -0.1 * u, s)); tree.commit();
  group.add(body, neck, head, tree, leaf);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : between(v, 0.3, 2.3) * (1 - between(v, 4.6, 5.4)), len = (0.35 + 0.55 * s) * u;
      neck.position.set(gx + 0.15 * u, floor + 0.46 * u, 0.0); neck.rotation.z = -0.35 + 0.25 * s; neck.scale.set(1, len, 1);
      const hx = gx + 0.15 * u - Math.sin(neck.rotation.z) * len, hy = floor + 0.46 * u + Math.cos(neck.rotation.z) * len;
      head.position.set(hx, hy, 0.0); head.rotation.z = 0.1 * Math.sin(v * 4) * s;
      const eat = pre ? 0 : between(v, 2.3, 2.8); leaf.visible = eat < 0.95; leaf.position.set(gx + 0.38 * u - 0.1 * u * eat, floor + 1.05 * u - 0.05 * u * eat, 0.0); leaf.scale.setScalar(grow(1 - eat));
    },
  };
}
function priceUp(ctx, spec, stage) {
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

export const SCENES = { 'new-toy': newToy, newspaper, 'ear-gate': earGate, 'meet-bow': meetBow, 'say-hello': sayHello, odometer, 'wise-owl': wiseOwl, 'battery-up': batteryUp, bookends, 'school-bell': schoolBell, 'office-tower': officeTower, 'name-card': nameCard, 'giraffe-tall': giraffeTall };
