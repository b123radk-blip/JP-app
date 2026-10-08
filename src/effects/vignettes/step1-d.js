// Step 1 scenes, part D: people and things for the first batch.
//   rest-tree     休: a tired walker wipes their brow, sits down with their back against a tree, nods off, Zzz; then gets up
//                 and walks on. outcome holiday: a person swings in a hammock under the sun (休み); bed: an alarm rings by a
//                 bed, a hand pushes it away and the sleeper snuggles back down, Zzz (休む)
//   anchor-drop   下: a boat on the water; its anchor drops down on a chain to the sea bed below, a puff of sand, bubbles;
//                 then it is wound back up
//                 outcome please: a kid holds out both hands, palms up; a sweet drops into them and they bow (下さい)
//   what-box      何: a box with a "?" on it shakes and hops; the lid pops and a big "?" springs out on a spring, wobbling
//   kanji-walker  人: the glyph walks on its two strokes as legs: a head pops on top, it steps along, turns to you and
//                 waves. outcome alone: one person sits alone on a bench under a lamp, swinging their feet (一人)
//   high-five     手: two big hands swing in and meet in a high five with a burst; they wave and swing out
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs, strokeSides, bonePoint } from './helpers.js';
import { grow } from './step1-kit.js';
import { crown } from './step1-b.js';

const zzz = (u) => { const m = many([[G.poly([[-0.04 * u, 0.04 * u], [0.04 * u, 0.04 * u], [-0.04 * u, -0.04 * u], [0.04 * u, -0.04 * u]], 0.012 * u), 0xc8d8ff]], 3, 1.0); return m; };
const floatZ = (m, x, y, v, on, u) => { for (let i = 0; i < 3; i++) { const f = ((v * 0.5 + i / 3) % 1); m.set(i, x + 0.12 * u * f + 0.03 * u * Math.sin(f * 6), y + 0.4 * u * f, 0.05 * u, on * Math.sin(Math.PI * f) * (0.7 + 0.5 * f)); } m.commit(); };
// sit a person down: hips bend, knees bend (legs out in front)
const sit = (p, k) => { for (const s of ['L', 'R']) { p.bone(`leg${s}`).rotation.x = 1.5 * k; p.bone(`shin${s}`).rotation.x = -1.3 * k; } };
const eyesShut = (p, on, skin = 0xffd2b0, eyes = 0x1a1a24) => { p.rig.setColor('eyeL', on ? skin : eyes); p.rig.setColor('eyeR', on ? skin : eyes); };

// ---- 休 rest ----
function restTree(ctx, spec, stage) {
  if (spec.outcome === 'holiday') return hammock(ctx, spec, stage);
  if (spec.outcome === 'bed') return snooze(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.75 * u;
  const trunk = solidProp([[G.cyl(0.07 * u, 0.1 * u, 0.8 * u, 0, 0.4 * u, 0), 0x7a4a24]], 0.35), leaves = crown(1.1 * u, 5, [0x3aa040, 0x2e8a3a, 0x48b848]);
  [[0, 0.95, 1.2], [-0.2, 0.82, 1], [0.2, 0.84, 1], [-0.1, 1.08, 0.9], [0.12, 1.06, 0.9]].forEach(([x, y, s], i) => leaves.set(i, tx + x * u, floor + y * u, -0.1 * u, s));
  leaves.commit(); trunk.position.set(tx, floor, -0.1 * u);
  const p = createPerson({ u, shirt: 0x4a9ad8 }), z = zzz(u), sweat = many([[G.sphere(0.02 * u), 0x9ad8ff]], 2, 1);
  group.add(trunk, leaves, p.group, z, sweat);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.3, 'out'], wipe: [1.3, 0.6], sit: [1.9, 0.6], sleep: [2.6, 0.3], wake: [5.4, 0.3], up: [5.6, 0.5], leave: [6.1, 0.9, 'in'] });
      const x = pre ? tx + 1.6 * u : tx + 0.05 * u + (1 - T.walk) * 1.3 * u - T.leave * 1.4 * u;
      p.reset().face(T.sit > 0.3 && T.up < 0.5 ? 'toward' : T.leave > 0 ? 'left' : 'left');
      const walking = (T.walk > 0 && T.walk < 1) || T.leave > 0;
      if (walking) p.walk(v * 9, 1);
      const s = T.sit - T.up; sit(p, s);
      p.group.position.set(x, floor - 0.28 * u * s, 0.1 * u * s);
      p.bone('body').rotation.x = -0.15 * s;
      if (T.wipe > 0 && T.wipe < 1) { p.raise('R', 2.2); p.bone('foreR').rotation.z = -1.6 - 0.4 * Math.sin(v * 14); }
      const nod = T.sleep - T.wake; p.bone('head').rotation.x = 0.35 * nod + 0.05 * Math.sin(v * 2) * nod;
      eyesShut(p, nod > 0.5);
      p.update();
      floatZ(z, x + 0.15 * u, floor + 0.65 * u, v, pre ? 0 : nod, u);
      for (let i = 0; i < 2; i++) { const f = pre ? 0 : between(v, 1.4 + 0.25 * i, 1.9 + 0.25 * i); sweat.set(i, x + (0.12 - 0.24 * i) * u, floor + 0.85 * u - 0.15 * u * f, 0.1 * u, f > 0 && f < 1 ? 1 : 0); }
      sweat.commit();
    },
  };
}
function hammock(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.75 * u;
  const posts = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.62 * u, -0.5 * u, 0.31 * u, 0), 0x8a5a30], [G.cyl(0.03 * u, 0.03 * u, 0.62 * u, 0.5 * u, 0.31 * u, 0), 0x8a5a30]], 0.35);
  const sling = new THREE.Group(), net = solidProp([[G.sphere(0.5 * u, 0, 0, 0, 1, 0.22, 0.32), 0xe85a4a], [G.sphere(0.5 * u, 0, 0.005 * u, 0.012 * u, 0.98, 0.2, 0.3), 0xffd040], [G.cyl(0.006 * u, 0.006 * u, 0.12 * u, -0.5 * u, 0.04 * u, 0, 0, 0, -1.2), 0xf0f0f0], [G.cyl(0.006 * u, 0.006 * u, 0.12 * u, 0.5 * u, 0.04 * u, 0, 0, 0, 1.2), 0xf0f0f0]], 0.5);
  const p = createPerson({ u: 0.85 * u, shirt: 0xffb030 }), sun = solidProp([[G.sphere(0.12 * u), 0xffc040]], 1.3), shades = solidProp([[G.box(0.14 * u, 0.04 * u, 0.02 * u, 0, 0, 0), 0x101018]], 0.2);
  sling.add(net); sling.position.set(hx, floor + 0.45 * u, 0); posts.position.set(hx, floor, -0.05 * u);
  p.rig.attach('head', shades, 0.55); shades.position.set(0, 0, 0.12 * u);
  group.add(posts, sling, p.group, sun);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, sw = Math.sin(t * 1.4) * 0.12;
      sling.rotation.z = sw * 0.3; sling.position.x = hx + 0.03 * u * sw;
      p.reset(); p.group.rotation.set(0, 0, -Math.PI / 2 + sw * 0.3);
      p.group.position.set(hx - 0.36 * u + 0.03 * u * sw, floor + 0.51 * u + 0.02 * u * sw, -0.02 * u);
      p.bone('armL').rotation.z = 2.6; p.bone('armR').rotation.z = -2.6; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.6;
      p.bone('legL').rotation.x = 0.1; p.bone('shinR').rotation.x = -0.3; p.update();
      sun.position.set(hx + 0.35 * u, floor + 0.95 * u, -0.2 * u); sun.scale.setScalar(1 + 0.06 * Math.sin(t * 3));
      shades.visible = !pre;
    },
  };
}
function snooze(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.65 * u;
  const bed = solidProp([[G.box(0.9 * u, 0.2 * u, 0.4 * u, 0, 0.18 * u, 0), 0x9a6a3a], [G.box(0.06 * u, 0.5 * u, 0.42 * u, -0.45 * u, 0.25 * u, 0), 0x8a5a30], [G.box(0.22 * u, 0.08 * u, 0.32 * u, -0.32 * u, 0.32 * u, 0), 0xffffff]], 0.35);
  const blanket = solidProp([[G.box(0.62 * u, 0.12 * u, 0.42 * u, 0, 0, 0), 0x4a7ae0]], 0.4), head = solidProp([[G.sphere(0.11 * u), 0xffd2b0], [G.sphere(0.115 * u, 0, 0.03 * u, -0.01 * u, 1, 0.8, 1), 0x3a2416], [G.box(0.05 * u, 0.008 * u, 0.01 * u, 0.04 * u, 0, 0.1 * u), 0x1a1a24], [G.box(0.05 * u, 0.008 * u, 0.01 * u, -0.04 * u, 0, 0.1 * u), 0x1a1a24]], 0.35);
  const clock = emblemProp('alarm', 0.3 * u), hand = createHand({ u: 0.4 * u, sleeve: 0xffd2b0 }), z = zzz(u);
  bed.position.set(bx, floor, -0.05 * u); blanket.position.set(bx + 0.12 * u, floor + 0.33 * u, 0); head.position.set(bx - 0.3 * u, floor + 0.44 * u, 0);
  group.add(bed, blanket, head, clock, hand.group, z);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { ring: [0.3, 1.6, 'linear'], reach: [1.3, 0.5], push: [1.8, 0.4, 'in'], back: [2.3, 0.5], home: [5.3, 0.6] });
      const ringing = !pre && T.ring > 0 && T.push < 1;
      clock.idle(ringing ? t * 3 : 0); clock.position.set(bx - 0.45 * u - 0.2 * u * T.push * (1 - T.home) + (ringing ? 0.01 * u * Math.sin(t * 60) : 0), floor + 0.62 * u - 0.12 * u * T.push * (1 - T.home), 0.05 * u); clock.rotation.z = ringing ? 0.15 * Math.sin(t * 40) : 1.4 * T.push * (1 - T.home);
      const r = T.reach - T.back; hand.group.visible = r > 0.01; hand.pose('open', 'flat', T.push);
      hand.group.position.set(bx - 0.2 * u - 0.15 * u * r - 0.06 * u * T.push, floor + 0.38 * u + 0.12 * u * r, 0.1 * u); hand.group.rotation.set(0, 0, 0.9);
      head.rotation.z = 0.2 * Math.sin(v * 1.5) * (1 - (ringing ? 1 : 0)) + (ringing ? 0.1 * Math.sin(t * 30) : 0);
      blanket.scale.y = 1 + 0.06 * Math.sin(t * 2);
      floatZ(z, bx - 0.25 * u, floor + 0.6 * u, v, pre ? 1 : (v > 2.6 && v < 5.3 ? 1 : 0), u);
    },
  };
}

// ---- 下 an anchor ----
function anchorDrop(ctx, spec, stage) {
  if (spec.outcome === 'please') return pleaseHands(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.55 * u, sea = B.maxY + 0.02 * u;
  const water = solidProp([[G.box(1.2 * u, 1, 0.3 * u, 0, -0.5, 0), 0x2a7ad0]], 0.4); water.material.transparent = true; water.material.opacity = 0.55;
  const sand = solidProp([[G.box(1.2 * u, 0.06 * u, 0.32 * u, 0, -0.03 * u, 0), 0xe0c890]], 0.35);
  const boat = solidProp([[G.box(0.5 * u, 0.1 * u, 0.2 * u, 0, 0.05 * u, 0), 0xe04848], [G.box(0.4 * u, 0.05 * u, 0.21 * u, 0, -0.02 * u, 0), 0xf8f8f8], [G.box(0.18 * u, 0.12 * u, 0.15 * u, -0.06 * u, 0.16 * u, 0), 0xf4f0e8], [G.cyl(0.012 * u, 0.012 * u, 0.3 * u, 0.1 * u, 0.25 * u, 0), 0x8a5a30]], 0.45);
  const anchor = solidProp([[G.cyl(0.018 * u, 0.018 * u, 0.24 * u, 0, -0.12 * u, 0), 0x4a5260], [G.torus(0.03 * u, 0.01 * u, Math.PI * 2, 0, -0.01 * u, 0), 0x4a5260], [G.box(0.12 * u, 0.02 * u, 0.02 * u, 0, -0.05 * u, 0), 0x4a5260], [G.torus(0.1 * u, 0.02 * u, Math.PI, 0, -0.16 * u, 0, Math.PI), 0x4a5260], [G.cone(0.03 * u, 0.06 * u, -0.1 * u, -0.15 * u, 0, 0.4), 0x4a5260], [G.cone(0.03 * u, 0.06 * u, 0.1 * u, -0.15 * u, 0, -0.4), 0x4a5260]], 0.5);
  const chain = many([[G.torus(0.02 * u, 0.006 * u), 0x8a929e]], 14, 0.5), dust = many(PUFF(u, 0xe0c890), 6, 0.3), bubbles = many([[G.sphere(0.02 * u), 0xd8f0ff]], 6, 1.0);
  water.position.set(ax, sea, -0.15 * u); water.scale.y = sea - floor; sand.position.set(ax, floor, -0.14 * u);
  group.add(water, sand, boat, anchor, chain, dust, bubbles);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { drop: [0.4, 1.6, 'in'], up: [4.0, 1.6, 'out'] }), d = pre ? 0 : T.drop - T.up;
      const bob = 0.015 * u * Math.sin(t * 2), top = sea + bob, bottom = floor + 0.2 * u, ay = top - 0.02 * u - (top - 0.02 * u - bottom) * d;
      boat.position.set(ax + 0.12 * u, top, 0); boat.rotation.z = 0.04 * Math.sin(t * 1.6);
      anchor.position.set(ax - 0.05 * u, ay, 0.02 * u); anchor.rotation.z = 0.15 * Math.sin(v * 3) * (d > 0 && d < 1 ? 1 : 0);
      for (let i = 0; i < 14; i++) { const y = top - (i + 0.5) * (top - ay) / 14; chain.set(i, ax - 0.05 * u, y, 0.02 * u, ay < top - 0.03 * u ? 1 : 0, 0, (i % 2) * Math.PI / 2); }
      chain.commit();
      puffs(dust, 0, 6, ax - 0.05 * u, floor, pre ? 0 : (v - 2.0) / 0.8, u, 0.4); dust.commit();
      for (let i = 0; i < 6; i++) { const f = ((v * 0.7 + i / 6) % 1); bubbles.set(i, ax - 0.05 * u + 0.06 * u * Math.sin(i * 2 + f * 5), ay + (top - ay) * f, 0.04 * u, d > 0.05 ? 1 - f : 0); }
      bubbles.commit();
    },
  };
}
const hp = new THREE.Vector3();
function pleaseHands(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const kid = createPerson({ u: 0.85 * u, shirt: 0xff7a9a, pants: 0x3a4a8a }), candy = solidProp([[G.sphere(0.06 * u, 0, 0, 0, 1.3, 1, 1), 0xff4a8a], [G.cone(0.04 * u, 0.06 * u, -0.1 * u, 0, 0, Math.PI / 2), 0xffd040], [G.cone(0.04 * u, 0.06 * u, 0.1 * u, 0, 0, -Math.PI / 2), 0xffd040]], 0.7);
  const hearts = many([[G.sphere(0.03 * u), 0xff6a8a]], 3, 1.0);
  group.add(kid.group, candy, hearts);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { hold: [0.2, 0.5], drop: [1.0, 0.7, 'in'], bow: [2.2, 0.5], up: [3.2, 0.5], lower: [4.6, 0.5] });
      const hold = pre ? 0 : T.hold - T.lower * 0 - T.bow * 0;
      kid.reset().face(-0.9); kid.group.position.set(px, floor, 0.05 * u);
      for (const s of ['L', 'R']) { kid.bone(`arm${s}`).rotation.x = 1.0 * hold * (1 - T.lower); kid.bone(`fore${s}`).rotation.x = 0.5 * hold * (1 - T.lower); kid.raise(s, 0.12 * hold); }
      const bow = T.bow - T.up; kid.lean(0.6 * bow); kid.bone('head').rotation.x = 0.2 * bow; kid.update();
      bonePoint(kid, 'handL', 0.5, hp);
      candy.visible = !pre && T.drop > 0 && T.lower < 1; candy.position.set(hp.x, hp.y + 0.06 * u + 0.8 * u * (1 - T.drop), hp.z); candy.rotation.z = v * (1 - T.drop) * 4;
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 1.8 + 0.2 * i, 3.0 + 0.2 * i); hearts.set(i, px + (i - 1) * 0.15 * u, floor + 0.95 * u + 0.3 * u * f, 0.1 * u, f > 0 && f < 1 ? 1.3 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

// ---- 何 a jack-in-the-box "?" ----
function whatBox(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u;
  const box = solidProp([[G.box(0.36 * u, 0.32 * u, 0.32 * u, 0, 0.16 * u, 0), 0x8a4ad0], [G.box(0.37 * u, 0.04 * u, 0.33 * u, 0, 0.3 * u, 0), 0xffd040]], 0.45);
  const mark = textPlane('?', { h: 0.26 * u, color: '#ffd040', weight: 900 }), lid = new THREE.Group(), lidM = solidProp([[G.box(0.38 * u, 0.04 * u, 0.34 * u, 0.19 * u, 0, 0), 0x6a3ab0]], 0.45);
  lid.add(lidM); lid.position.set(bx - 0.19 * u, floor + 0.34 * u, 0);
  const spring = solidProp([[G.tube(Array.from({ length: 30 }, (_, i) => [0.05 * Math.cos(i * 1.3), i / 29]).map(([x, y]) => [x * u, y]), 0.008 * u), 0xc8ccd4]], 0.5);
  const q = emblemProp('question', 0.45 * u, { color: 0xffe040 });
  box.position.set(bx, floor, 0); mark.position.set(bx, floor + 0.15 * u, 0.17 * u);
  group.add(box, mark, lid, spring, q);
  const loop = 5.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pop: [1.6, 0.35, 'back'], lid: [1.6, 0.25, 'out'], push: [4.6, 0.5, 'in'], shut: [5.0, 0.3] });
      const shake = !pre && v < 1.6 ? Math.sin(v * 30) * between(v, 0.2, 0.6) : 0, hop = !pre && v < 1.6 ? 0.06 * u * Math.abs(Math.sin(v * 7)) * between(v, 0.6, 0.8) : 0;
      box.position.set(bx, floor + hop, 0); box.rotation.z = 0.06 * shake; mark.position.set(bx + 0.0, floor + 0.15 * u + hop, 0.17 * u); mark.rotation.z = 0.06 * shake;
      lid.position.y = floor + 0.34 * u + hop; lid.rotation.z = 2.0 * (T.lid - T.shut) + 0.06 * shake;
      const h = pre ? 0 : (0.55 * T.pop * (1 - T.push)) * u + 0.04 * u * wobble(v, 1.95, 1.2, 3);
      spring.visible = h > 0.02 * u; spring.position.set(bx, floor + 0.3 * u, 0.02 * u); spring.scale.set(1, Math.max(1e-3, h), 1); spring.rotation.z = 0.15 * wobble(v, 1.95, 1.5, 2.5);
      q.visible = h > 0.02 * u; q.position.set(bx + Math.sin(spring.rotation.z) * -h, floor + 0.3 * u + h + 0.22 * u, 0.02 * u); q.idle(t); q.rotation.z = spring.rotation.z * 1.5;
    },
  };
}

// ---- 人 the glyph walks ----
function kanjiWalker(ctx, spec, stage) {
  if (spec.outcome === 'alone') return benchAlone(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), { lo, hi } = strokeSides(ctx, 'x', B.cx);
  const top = B.maxY, head = solidProp([[G.sphere(0.12 * u), 0xffd2b0], [G.sphere(0.125 * u, 0, 0.04 * u, -0.015 * u, 1, 0.75, 1), 0x3a2416], [G.sphere(0.02 * u, -0.04 * u, 0.0, 0.11 * u, 1, 1.3, 0.6), 0x1a1a24], [G.sphere(0.02 * u, 0.04 * u, 0.0, 0.11 * u, 1, 1.3, 0.6), 0x1a1a24], [G.torus(0.035 * u, 0.008 * u, Math.PI, 0, -0.045 * u, 0.1 * u, Math.PI), 0xc04040]], 0.4);
  const arm = solidProp([[G.cyl(0.045 * u, 0.045 * u, 0.4 * u, 0, 0.2 * u, 0), 0xf4c8a0], [G.sphere(0.075 * u, 0, 0.42 * u, 0), 0xf4c8a0]], 0.5), dust = many(PUFF(u), 4, 0.3);
  group.add(head, arm, dust);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { head: [0, 0.4, 'back'], out: [0.5, 1.8, 'linear'], wave: [2.4, 0.4, 'back'], back: [4.1, 1.6, 'linear'] });
      const walking = (T.out > 0 && T.out < 1) || (T.back > 0 && T.back < 1), ph = v * 8, dx = 0.9 * u * (T.out - T.back);
      const sL = walking ? Math.max(0, Math.sin(ph)) : 0, sR = walking ? Math.max(0, -Math.sin(ph)) : 0;
      poseGlyph(stage, dx, walking ? 0.02 * u * Math.abs(Math.cos(ph)) : 0, walking ? 0.04 * Math.sin(ph) : 0, B.cx, B.minY);
      for (const si of lo) stage.offset(si, 0.08 * u * sL, 0.1 * u * sL, 0); for (const si of hi) stage.offset(si, 0.08 * u * sR, 0.1 * u * sR, 0);
      const k = pre ? 0 : T.head; head.visible = k > 0.01; head.scale.setScalar(grow(k)); head.position.set(B.cx + dx, top + 0.1 * u + 0.02 * u * Math.abs(Math.cos(ph)) * (walking ? 1 : 0), 0.02 * u);
      const w = T.wave * (1 - between(v, 3.8, 4.1)); arm.visible = w > 0.01; arm.position.set(B.cx + dx + 0.06 * u, top - 0.12 * u, 0.04 * u); arm.rotation.z = -0.3 - 0.5 * w + 0.45 * Math.sin(v * 8) * w; arm.scale.setScalar(grow(w));
      puffs(dust, 0, 4, B.cx + dx, B.minY, walking ? (ph / Math.PI) % 1 : 0, u, 0.25); dust.commit();
    },
  };
}
function benchAlone(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.6 * u;
  const bench = solidProp([[G.box(0.6 * u, 0.04 * u, 0.2 * u, 0, 0.3 * u, 0), 0xa86a3a], [G.box(0.6 * u, 0.12 * u, 0.03 * u, 0, 0.42 * u, -0.1 * u), 0xa86a3a], [G.box(0.04 * u, 0.3 * u, 0.18 * u, -0.26 * u, 0.15 * u, 0), 0x404048], [G.box(0.04 * u, 0.3 * u, 0.18 * u, 0.26 * u, 0.15 * u, 0), 0x404048]], 0.35);
  const lamp = solidProp([[G.cyl(0.02 * u, 0.025 * u, 1.1 * u, 0, 0.55 * u, 0), 0x303038], [G.box(0.14 * u, 0.08 * u, 0.14 * u, 0, 1.12 * u, 0), 0x303038]], 0.3), bulb = solidProp([[G.sphere(0.06 * u), 0xfff0a0]], 1.6);
  const pool = solidProp([[G.cyl(0.42 * u, 0.42 * u, 0.005 * u, 0, 0, 0), 0xfff0a0]], 1.0); pool.material.transparent = true; pool.material.opacity = 0.25;
  const p = createPerson({ u: 0.9 * u, shirt: 0x6a7ab0 }), leaf = solidProp([[G.sphere(0.04 * u, 0, 0, 0, 1.5, 0.3, 1), 0xe08a30]], 0.6), tag = textPlane('1', { h: 0.2 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  bench.position.set(bx, floor, -0.05 * u); lamp.position.set(bx + 0.42 * u, floor, -0.12 * u); bulb.position.set(bx + 0.42 * u, floor + 1.05 * u, -0.12 * u); pool.position.set(bx, floor + 0.003 * u, 0); pool.rotation.x = 0.4;
  group.add(pool, bench, lamp, bulb, p.group, leaf, tag);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.reset().face('toward'); sit(p, 1); p.group.position.set(bx - 0.05 * u, floor + 0.3 * u - 0.27 * u * 0.9 + 0.02 * u, 0.0);
      for (const s of ['L', 'R']) p.bone(`shin${s}`).rotation.x = -1.3 + 0.35 * Math.sin(t * 3 + (s === 'L' ? 0 : Math.PI));
      p.bone('head').rotation.x = 0.25 + 0.05 * Math.sin(t); p.bone('body').rotation.x = 0.12; p.update();
      const f = pre ? 0 : between(v, 1.0, 4.0); leaf.visible = f > 0 && f < 1; leaf.position.set(bx + 1.0 * u - 1.6 * u * f, floor + 0.7 * u - 0.5 * u * f + 0.08 * u * Math.sin(f * 12), 0.15 * u); leaf.rotation.set(f * 8, 0, f * 5);
      const k = pre ? 0 : between(v, 0.4, 0.7) * (1 - between(v, 5.3, 5.6)); tag.visible = k > 0.01; tag.scale.setScalar(grow(k)); tag.position.set(bx - 0.05 * u, floor + 1.0 * u, 0.05 * u);
    },
  };
}

// ---- 手 a high five ----
function highFive(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.6 * u, my = B.cy + 0.25 * u;
  const L = createHand({ u: 0.75 * u, sleeve: 0x3a7ae0, side: 1 }), R = createHand({ u: 0.75 * u, sleeve: 0xe0603a, side: -1 }), boom = burst(u, { s: 0.45, n: 8, color: 0xffe060 });
  group.add(L.group, R.group, boom);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 0.7, 'out'], slap: [0.9, 0.25, 'in'], part: [1.2, 0.4, 'out'], wave: [1.8, 2.2], out: [4.5, 0.8, 'in'] });
      const meet = T.slap - T.part, open = pre ? 0 : T.in - T.out;
      L.pose('open'); R.pose('open');
      L.group.visible = R.group.visible = open > 0.01;
      const wave = 0.35 * Math.sin(v * 9) * T.wave * (1 - T.out);
      L.group.position.set(mx - 0.42 * u + 0.28 * u * meet - 0.6 * u * (1 - open), my - 0.5 * u - 0.3 * u * (1 - open), 0.05 * u); L.group.rotation.set(0, 0.3, -0.5 + 0.45 * meet + wave);
      R.group.position.set(mx + 0.42 * u - 0.28 * u * meet + 0.6 * u * (1 - open), my - 0.5 * u - 0.3 * u * (1 - open), 0.06 * u); R.group.rotation.set(0, -0.3, 0.5 - 0.45 * meet - wave);
      const b = pre ? 0 : bump(v, 1.1, 0.5); boom.visible = b > 0.01; boom.scale.setScalar(grow(b)); boom.position.set(mx, my + 0.12 * u, 0.0); boom.rotation.z = v * 2;
      stage.glyph.scale.setScalar(1 + 0.05 * b);
    },
  };
}

export const SCENES = { 'rest-tree': restTree, 'anchor-drop': anchorDrop, 'what-box': whatBox, 'kanji-walker': kanjiWalker, 'high-five': highFive };
export { sit, eyesShut, zzz, floatZ };
