// Batch 4 kanji, part 2.
//   bag-carry     持: a hand comes down, grips a shopping bag by its handle, lifts it and swings it, then sets it down
//   dot-point     点: a pen taps four dots in a row; a pointer taps one and it bursts into a glowing star
//   turn-around   向: a person with their back to you turns round to face you, waves, then turns and points "over there"
//   stand-up      立: the kanji lies on its side and springs upright; behind it a person sitting on a stool stands up
//   tape-measure  計: a tape measure pulls out across the top of the kanji while a counter counts the centimetres
//   rewind-ball   再: a ball rolls off a table and bounces; it all rewinds, and plays again
import * as THREE from 'three';
import { acts, timeline, bump, wobble, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo, liveText, puffs, poseGlyph } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function bagCarry(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.45 * u, BH = 0.26 * u;
  const bag = new THREE.Group(), bagM = solidProp([[G.box(0.3 * u, BH, 0.14 * u, 0, -0.12 * u - BH / 2, 0), 0xe07a30], [G.torus(0.08 * u, 0.012 * u, Math.PI, 0, -0.12 * u, 0), 0x6a3a1a], [G.sphere(0.06 * u, -0.05 * u, -0.12 * u, 0), 0xe03a3a], [G.cyl(0.02 * u, 0.025 * u, 0.12 * u, 0.06 * u, -0.08 * u, 0, 0, 0, -0.3), 0x60c060], [G.box(0.12 * u, 0.06 * u, 0.004 * u, 0, -0.12 * u - BH * 0.5, 0.072 * u), 0xffffff]], 0.4);
  bag.add(bagM);
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x40a0e0 });
  group.add(bag, hand.group);
  const loop = 5.2, rest = floor + 0.12 * u + BH;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { down: [0.1, 0.5, 'out'], grip: [0.65, 0.2], lift: [0.9, 0.6, 'back'], set: [3.8, 0.5], let: [4.35, 0.2], up: [4.6, 0.5, 'in'] });
      const lift = T.lift - T.set, swing = v > 1.5 && v < 3.8 ? 0.4 * Math.sin((v - 1.5) * 4) * Math.min(1, (3.8 - v) * 2) : 0, y = rest + 0.35 * u * lift;
      bag.position.set(bx + 0.04 * u * swing, y, 0.05 * u); bag.rotation.z = swing;
      hand.group.visible = !pre && T.up < 1; hand.group.rotation.set(0, 0, Math.PI + swing * 0.5); hand.pose('open', 'grip', T.grip - T.let);
      handTo(hand, bx, y + 0.02 * u + 0.4 * u * (1 - T.down) + 0.5 * u * T.up, 0.06 * u); hand.update();
    },
  };
}

function dotPoint(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), y0 = B.cy - 0.1 * u, x0 = B.maxX + 0.2 * u, GAP = 0.17 * u;
  const dots = many([[G.sphere(0.04 * u, 0, 0, 0, 1, 1, 0.5), 0xff7a30]], 4, 0.8), star = burst(u, { s: 0.3, n: 5, color: 0xffe040 });
  const pen = solidProp([[G.cyl(0.018 * u, 0.018 * u, 0.3 * u, 0, 0.19 * u, 0), 0x3a7ad0], [G.cone(0.018 * u, 0.04 * u, 0, 0.02 * u, 0, Math.PI), 0x2a2a30]], 0.4);
  const stick = solidProp([[G.cyl(0.01 * u, 0.014 * u, 0.6 * u, 0, 0.3 * u, 0), 0x8a5a30], [G.sphere(0.018 * u), 0xe04848]], 0.4);
  group.add(dots, star, pen, stick);
  const loop = 4.8, PICK = 2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.2, 4.6);
      for (let i = 0; i < 4; i++) { const f = pre ? 0 : timeline(v, { f: [0.3 + 0.35 * i, 0.15, 'back'] }).f * (1 - out), big = i === PICK ? 1 + 0.6 * bump(v, 2.2, 1.6) : 1; dots.set(i, x0 + i * GAP, y0, 0, f * big); }
      dots.commit();
      const tap = (v - 0.3) / 0.35, k = Math.min(3, Math.max(0, Math.floor(tap))), lift = 0.12 * u * Math.abs(Math.sin(Math.PI * (tap - k)));
      pen.visible = !pre && v > 0.1 && v < 1.75; pen.position.set(x0 + k * GAP, y0 + 0.03 * u + (v < 0.3 ? 0.15 * u : lift), 0.05 * u); pen.rotation.z = -0.3;
      const T = timeline(v, { in: [1.6, 0.4, 'out'], tap: [2.05, 0.15, 'in'], out: [3.4, 0.5, 'in'] }), sx = x0 + PICK * GAP;
      stick.visible = !pre && T.in > 0 && T.out < 1; stick.position.set(sx + 0.45 * u * (1 - T.in) + 0.45 * u * T.out, y0 + 0.04 * u + 0.08 * u * (1 - T.tap) + 0.3 * u * T.out, 0.06 * u); stick.rotation.z = -0.7;
      const s = pre ? 0 : bump(v, 2.2, 1.6); star.visible = s > 0; star.scale.setScalar(pop(s)); star.position.set(sx, y0, -0.02 * u); star.rotation.z = t * 1.5;
    },
  };
}

function turnAround(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0x60b060 }), arrow = emblemProp('arrow', 0.35 * u, { dir: 'right', color: 0xffd040 });
  group.add(p.group, arrow);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { turn: [0.4, 0.5, 'back'], side: [2.4, 0.4], back: [4.3, 0.6] });
      const wave = bump(v, 1.0, 1.2), point = T.side * (1 - T.back);
      const ang = T.back > 0 ? lerp(0.5, Math.PI, T.back) : T.side > 0 ? 0.5 * T.side : Math.PI * (1 - T.turn);
      p.reset().face(ang); p.raise('R', 2.5 * wave); p.raise('L', 1.5 * point); if (wave > 0) p.bone('foreR').rotation.z = -0.4 * Math.sin(v * 12);
      p.group.position.set(px, floor, 0.1 * u); p.update();
      const a = pre ? 0 : point; arrow.visible = a > 0.01; arrow.scale.setScalar(pop(0.35 * u * a)); arrow.position.set(px + 0.6 * u, floor + 0.78 * u, 0.1 * u); arrow.idle(t);
    },
  };
}

function standUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, pu = 0.85 * u;
  const p = createPerson({ u: pu, shirt: 0xe04848 }), stool = solidProp([[G.cyl(0.1 * u, 0.1 * u, 0.03 * u, 0, 0.2 * pu, 0, 0, 0, 0, 20), 0x8a5a30], [G.cyl(0.015 * u, 0.015 * u, 0.2 * pu, -0.06 * u, 0.1 * pu, 0), 0x6a4020], [G.cyl(0.015 * u, 0.015 * u, 0.2 * pu, 0.06 * u, 0.1 * pu, 0), 0x6a4020]], 0.3);
  stool.position.set(px + 0.1 * u, floor, -0.25 * u);
  const dust = many(PUFF(u), 5, 0.4);
  group.add(p.group, stool, dust);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { up: [0.6, 0.45, 'back'], down: [4.0, 0.6, 'in'] }), up = pre ? 1 : T.up - T.down;
      poseGlyph(stage, 0, 0, -Math.PI / 2 * (1 - up), B.maxX, B.minY);
      const sit = 1 - Math.min(1, Math.max(0, up));
      p.reset().face('left'); p.bone('body').position.y = -0.17 * pu * sit; p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.5 * sit; p.bone('shinL').rotation.x = p.bone('shinR').rotation.x = -1.5 * sit;
      p.raise('L', 0.8 * bump(v, 0.9, 0.8)); p.raise('R', 0.8 * bump(v, 0.9, 0.8));
      p.group.position.set(px + 0.05 * u * sit, floor + 0.04 * u * bump(v, 1.0, 0.3), -0.25 * u); p.update();
      puffs(dust, 0, 5, B.maxX - 0.2 * u, floor, between(v, 0.9, 1.5), u, 0.4); dust.commit();
    },
  };
}

function tapeMeasure(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.22 * u, cy = B.maxY + 0.1 * u, L = B.maxX - B.minX + 0.22 * u;
  const tcase = solidProp([[G.box(0.2 * u, 0.2 * u, 0.08 * u, 0, 0, 0), 0xf0c020], [G.cyl(0.07 * u, 0.07 * u, 0.01 * u, 0, 0, 0.042 * u, Math.PI / 2), 0x3a3a44], [G.box(0.06 * u, 0.03 * u, 0.05 * u, -0.1 * u, -0.07 * u, 0), 0x3a3a44]], 0.4);
  tcase.position.set(cx, cy, 0.05 * u);
  const ticks = Array.from({ length: 21 }, (_, i) => [G.box(0.004, i % 5 ? 0.3 : 0.6, 0.002, -i / 20, i % 5 ? 0.35 : 0.2, 0.003), 0x2a2a30]);
  const tape = solidProp([[G.box(1, 1, 0.002, -0.5, 0.5, 0), 0xffe040], ...ticks], 0.5);
  tape.position.set(cx - 0.1 * u, cy - 0.08 * u, 0.06 * u); tape.scale.set(1e-3, 0.06 * u, 1);
  const count = liveText(u, { h: 0.16, w: 0.36, color: '#ffe060', bg: '#2a3040' });
  count.position.set(cx + 0.1 * u, cy + 0.2 * u, 0.05 * u);
  group.add(tcase, tape, count);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { out: [0.3, 1.6, 'smooth'], snap: [3.6, 0.3, 'in'] }), f = pre ? 0 : T.out * (1 - T.snap);
      tape.scale.x = pop(L * f); tape.visible = f > 0.005; tcase.rotation.z = 0.15 * wobble(v, 3.9, 0.6, 3);
      count.set(`${Math.round(30 * f)} cm`);
    },
  };
}

function rewindBall(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.35 * u, TH = 0.42 * u, R = 0.06 * u;
  const table = solidProp([[G.box(0.5 * u, 0.03 * u, 0.3 * u, 0, TH, 0), 0xc89a60], [G.box(0.03 * u, TH, 0.03 * u, -0.2 * u, TH / 2, 0.1 * u), 0x8a5a30], [G.box(0.03 * u, TH, 0.03 * u, 0.2 * u, TH / 2, 0.1 * u), 0x8a5a30]], 0.35);
  table.position.set(tx, floor, -0.05 * u);
  const ball = solidProp([[G.sphere(R), 0xe04848], [G.torus(R, R * 0.15), 0xffffff]], 0.5), rew = emblemProp('repeat', 0.35 * u, { color: 0x40c8f0 });
  group.add(table, ball, rew);
  const loop = 5.0, edge = tx + 0.25 * u, top = floor + TH + 0.015 * u + R;
  const path = (s) => { if (s < 0.45) return [lerp(tx - 0.2 * u, edge, s / 0.45), top]; const f = (s - 0.45) / 0.55, x = edge + 0.45 * u * f, fall = Math.min(1, f / 0.55), y = f < 0.55 ? lerp(top, floor + R, fall * fall) : floor + R + 0.1 * u * Math.sin(Math.PI * (f - 0.55) / 0.45); return [x, y]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const s = pre ? 0 : v < 1.9 ? between(v, 0.2, 1.6) : v < 2.6 ? 1 - between(v, 1.9, 2.5) : v < 4.3 ? between(v, 2.7, 4.1) : 1 - between(v, 4.3, 4.8);
      const [x, y] = path(s); ball.position.set(x, y, 0.05 * u); ball.rotation.z = -(x - tx) / R;
      const r = pre ? 0 : Math.max(bump(v, 1.85, 0.8), bump(v, 4.25, 0.6)); rew.visible = r > 0; rew.scale.setScalar(pop(0.35 * u * r)); rew.position.set(tx, floor + TH + 0.35 * u, 0.05 * u); rew.rotation.z = -t * 6; rew.idle(t);
    },
  };
}

export const SCENES = { 'bag-carry': bagCarry, 'dot-point': dotPoint, 'turn-around': turnAround, 'stand-up': standUp, 'tape-measure': tapeMeasure, 'rewind-ball': rewindBall };
