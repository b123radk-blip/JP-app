// Scenes with objects acting on (or with) the kanji.
//   chop-split     切: a cleaver chops straight down through the middle of the kanji; a flash along the cut and the two
//                  halves slide apart, then ease back together and the cleaver comes up for the next chop
//   todo-list      事: a pencil ticks the boxes of a to-do list one by one; done, the list spins round and starts again
//   pin-drop       所: a big map pin drops out of the sky and stabs into the ground beside the kanji (dust, a ring
//                  pulses out: "here"); a person runs over and stands on the spot, waving
//   dart-bullseye  当: darts fly from where you stand into the bullseye of a target, one, two, three; it wobbles, a ding
//   apple-ripen    赤: a green apple on a branch ripens yellow then red in the sun, swells, sparkles and drops; a new
//                  one grows
//   eraser-rub     消: a hand rubs the strokes out one by one with an eraser, crumbs falling; then they come back
//   wheels-roll    動: wheels pop out under the kanji, it revs (puffs of exhaust) and drives off to the right, then back
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, burst } from '../pieces/kit-things.js';
import { emblemProp, cleaver, clipboard, tick, pin, target, dart, apple, eraser, wheel } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { pointAt } from '../../kanji/tube.js';
import { poseGlyph, puffs, arc, handTo, between, mixColor } from './helpers.js';
import { chopCarrot } from './variants.js';

const centroidX = (s) => s.pts.reduce((a, p) => a + p.x, 0) / s.pts.length;

function chopSplit(ctx, spec, stage) {
  if (spec.food) return chopCarrot(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), xm = B.cx;
  const knife = cleaver(1.6 * u), flash = solidProp([[G.box(0.02 * u, B.h * 1.1, 0.01 * u, 0, 0, 0), 0xffffff]], 2);
  const side = ctx.strokes.map((s) => (centroidX(s) < xm ? -1 : 1));
  group.add(knife, flash);
  const loop = 4.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { chop: [0.2, 0.35, 'in'], apart: [0.55, 0.45, 'back'], lift: [1.0, 0.6, 'out'], close: [2.8, 0.6], drop: [3.6, 0.5] });
      const y = pre ? B.maxY + 0.3 * u : B.maxY + 0.3 * u - (B.h + 0.25 * u) * T.chop + (B.h + 0.6 * u) * T.lift - 0.35 * u * T.drop;   // waits above, chops, lifts, settles back
      knife.position.set(xm, y, 0.06 * u); knife.visible = !pre || A.setup > 0.6;
      const gap = pre ? 0 : 0.14 * u * (T.apart - T.close);
      side.forEach((d, si) => stage.offset(si, d * gap, -0.02 * u * Math.abs(gap) / (0.14 * u) * (d < 0 ? 1 : 0.5), 0));
      const fl = pre ? 0 : bump(v, 0.5, 0.35); flash.visible = fl > 0; flash.position.set(xm, B.cy, 0.08 * u); flash.scale.set(1 + 2 * fl, fl, 1);
    },
  };
}

function todoList(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.45 * u, cy = B.cy - 0.05 * u, S = 1.5;
  const board = clipboard(S * u), ticks = many([[G.poly([[-0.03, 0], [-0.005, -0.025], [0.035, 0.03]].map(([x, y]) => [x * S * u, y * S * u]), 0.009 * S * u), 0x20a040]], 3, 0.7), pen = emblemProp('pen', 0.35 * u);
  group.add(board, ticks, pen);
  const box = (i) => [cx - 0.09 * S * u, cy + (0.1 - i * 0.11) * S * u], loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { spin: [3.2, 0.8] });
      board.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a)); board.position.set(cx, cy, 0); board.rotation.y = Math.PI * 2 * T.spin;
      for (let i = 0; i < 3; i++) { const [x, y] = box(i), on = pre ? 0 : between(v, 0.5 + i * 0.8, 0.75 + i * 0.8) * (T.spin < 0.5 ? 1 : 0); ticks.set(i, x, y, 0.03 * u, on * 1.3, 0, Math.PI * 2 * T.spin); }
      ticks.commit();
      // the pencil hops from box to box and draws each tick
      const i = pre ? 0 : Math.min(2, Math.max(0, Math.floor((v - 0.3) / 0.8))), [x, y] = box(i), wig = pre ? 0 : bump(v, 0.5 + i * 0.8, 0.25);
      pen.visible = !pre && v < 3.1; pen.position.set(x + 0.08 * u + 0.03 * u * wig, y + 0.12 * u - 0.03 * u * wig, 0.08 * u); pen.rotation.z = 0.3;
    },
  };
}

function pinDrop(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.45 * u;
  const mark = pin(1.8 * u), ring = solidProp([[G.torus(0.2 * u, 0.012 * u).rotateX(Math.PI / 2 - 0.5), 0xff5050]], 1), dust = many(PUFF(u), 6), p = createPerson({ u: 0.85 * u, shirt: 0x40b070 });
  group.add(mark, ring, dust, p.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fall: [0, 0.5, 'in'], run: [1.2, 1.3, 'linear'], up: [4.4, 0.5, 'in'] });
      mark.position.set(xs, floor + (pre ? 2 : 2.2 * (1 - T.fall) + 3 * T.up) * u - 0.04 * u * (T.fall > 0.99 ? 1 : 0), 0); mark.rotation.z = 0.12 * wobble(v, 0.5, 0.8, 3);
      mark.visible = !pre;
      const rf = pre ? 0 : ((v - 0.5) % 1.2) / 1.2; ring.visible = !pre && v > 0.5 && v < 4.3; ring.position.set(xs, floor + 0.01 * u, 0.02 * u); ring.scale.setScalar(0.4 + 1.6 * rf); ring.material.opacity = 1 - rf; ring.material.transparent = true;
      puffs(dust, 0, 6, xs, floor, pre ? 0 : (v - 0.5) / 0.8, u, 0.4); dust.commit();
      // the person runs in from the right and stands on the spot, waving
      const x = xs + 0.22 * u + 1.2 * u * (1 - T.run);
      p.group.visible = !pre && v > 1.1 && v < 4.4; p.group.position.set(x, floor, 0.12 * u);
      p.face(T.run < 1 ? 'left' : 'toward').reset().walk(v * 12, T.run < 1 ? 1 : 0);
      if (T.run >= 1) { p.raise('R', 2.5); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 9); }
      p.update();
    },
  };
}

function dartBullseye(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), tc = [B.maxX + 0.55 * u, B.cy + 0.08 * u], S = 1.4;
  const board = target(S * u), darts = [0, 1, 2].map(() => dart(1.6 * u)), ding = burst(u, { s: 0.5, color: 0xfff0a0 });
  board.position.set(tc[0], tc[1], 0);
  group.add(board, ...darts, ding);
  const HIT = [0.6, 1.5, 2.4], OFF = [[0.01, 0.02], [-0.025, -0.01], [0.02, -0.025]], loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      board.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const pull = between(v, 3.6, 4.0);
      darts.forEach((d, i) => {                                     // from in front of you (z) and a little below, into the middle
        const f = pre ? 0 : between(v, HIT[i] - 0.55, HIT[i]), tx = tc[0] + OFF[i][0] * u, ty = tc[1] + OFF[i][1] * u;
        d.visible = f > 0 && pull < 1;
        d.position.set(tx + 0.3 * u * (1 - f), ty - 0.25 * u * (1 - f) + 0.3 * u * f * (1 - f), 0.05 * u + 2.4 * u * (1 - f) + 0.25 * u * pull);
        d.rotation.set(0, -Math.PI / 2 + 0.5 * (1 - f), 0); d.scale.setScalar(1 - pull);
      });
      const w = pre ? 0 : HIT.reduce((s, h) => s + wobble(v, h, 0.5, 6), 0); board.rotation.z = 0.04 * w;
      const dg = pre ? 0 : Math.max(...HIT.map((h) => bump(v, h, 0.45))); ding.visible = dg > 0; ding.scale.setScalar(Math.max(1e-3, dg)); ding.position.set(tc[0], tc[1], 0.1 * u); ding.rotation.z = v * 3;
    },
  };
}

function appleRipen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), ax = B.maxX + 0.45 * u, ay = B.maxY - 0.05 * u;
  const branch = solidProp([[G.tube([[0.9, 0.35], [0.5, 0.3], [0.2, 0.32], [0, 0.22]].map(([x, y]) => [x * u, y * u]), 0.03 * u), 0x6a4a2a], [G.sphere(0.09 * u, 0.55 * u, 0.4 * u, 0, 1.6, 0.6, 1), 0x3a9a3a], [G.sphere(0.08 * u, 0.25 * u, 0.4 * u, 0, 1.6, 0.6, 1), 0x48a848]]);
  branch.position.set(ax, ay, -0.04 * u);
  const fruit = apple(2 * u, { r: 0.1 }), glint = burst(u, { s: 0.3, color: 0xffffff }), c = new THREE.Color();
  group.add(branch, fruit, glint);
  const loop = 4.8, floor = B.minY;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { ripe: [0.2, 1.8, 'linear'], drop: [2.6, 0.45, 'in'], grow: [3.8, 0.8, 'back'] });
      const r = pre ? 0 : T.ripe;
      if (r < 0.5) mixColor(c, 0x7ac83a, 0xf0d030, r * 2); else mixColor(c, 0xf0d030, 0xe01818, (r - 0.5) * 2);
      fruit.body.material.color.copy(c);
      const fall = pre ? 0 : T.drop, bounce = pre ? 0 : bump(v, 3.05, 0.35) * 0.12 * u;
      const y = v >= 3.8 || pre ? ay + 0.05 * u : ay + 0.05 * u - (ay - floor - 0.15 * u) * fall + bounce;
      fruit.position.set(ax + (fall > 0 && v < 3.8 ? 0.06 * u * fall : 0), y, 0.04 * u);
      fruit.scale.setScalar(Math.max(1e-3, (pre ? timeline(A.setup, { a: [0.4, 0.5, 'back'] }).a : v >= 3.8 ? 0.4 + 0.6 * T.grow : 1) * (1 + 0.15 * r * (v < 2.6 ? 1 : 1))));
      if (v >= 3.8 && v < 4.2 && T.grow < 0.05) fruit.visible = false; else fruit.visible = true;
      const gl = pre ? 0 : bump(v, 2.0, 0.6); glint.visible = gl > 0; glint.scale.setScalar(Math.max(1e-3, gl)); glint.position.set(ax + 0.12 * u, ay + 0.12 * u, 0.12 * u); glint.rotation.z = v * 3;
    },
  };
}

function eraserRub(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), n = ctx.strokes.length;
  const hand = createHand({ u: 1.0 * u, sleeve: 0x8a5ad0, side: -1 }), rub = eraser(1.5 * u), crumbs = many([[G.sphere(0.018 * u), 0xf8a0b0]], 12, 0.4);
  hand.pose('grip'); hand.group.rotation.z = 0.7; rub.rotation.z = -0.7 + Math.PI; rub.position.set(0, 0, 0.02 * u); hand.grip.add(rub);
  group.add(hand.group, crumbs);
  const per = Math.min(0.4, 3.0 / n), erase0 = 0.3, eraseEnd = erase0 + per * n, back = eraseEnd + 0.8, loop = back + 1.4 + 0.6;
  const tip = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // strokes are rubbed out from the last to the first, each from its end back to its start; then they write back in
      let at = null;
      for (let k = 0; k < n; k++) {
        const si = n - 1 - k, gone = pre ? 0 : between(v, erase0 + k * per, erase0 + (k + 1) * per), redo = pre ? 0 : between(v, back + (si / n) * 1.2, back + ((si + 1) / n) * 1.2);
        const keep = gone > 0 && redo === 0 ? 1 - gone : redo > 0 ? redo : 1;
        ctx.rv.progress[si] = Math.min(ctx.rv.progress[si], keep);
        if (gone > 0 && gone < 1) { pointAt(ctx.strokes[si].pts, 1 - gone, tip); at = [tip.x, tip.y]; }
      }
      const show = !pre && v > erase0 - 0.25 && v < eraseEnd + 0.3;
      hand.group.visible = show;
      if (at) handTo(hand, at[0] + 0.01 * u * Math.sin(v * 50), at[1], 0.07 * u);
      else handTo(hand, (v < erase0 ? B.maxX : B.minX) + 0.3 * u, B.cy, 0.07 * u);
      for (let i = 0; i < 12; i++) { const f = ((v * 1.3 + i / 12) % 1); crumbs.set(i, (at ? at[0] : 0) + (i % 4 - 1.5) * 0.04 * u, (at ? at[1] : 0) - 0.5 * u * f, 0.08 * u, at ? 1 - f : 0); }
      crumbs.commit();
    },
  };
}

function wheelsRoll(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, R = 0.12;
  const wheels = [wheel(u, { r: R }), wheel(u, { r: R })], exhaust = many(PUFF(1.2 * u, 0xb8b8c0), 6, 0.4), lines = many([[G.box(0.3 * u, 0.012 * u, 0.01 * u, 0, 0, 0), 0xffffff]], 4, 1);
  group.add(...wheels, exhaust, lines);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pop: [0, 0.4, 'back'], go: [1.2, 1.3, 'in'], back: [3.0, 1.4, 'smooth'], hide: [4.8, 0.4] });
      const rev = !pre && v > 0.5 && v < 1.3, dx = pre ? 0 : 1.5 * u * T.go - 1.5 * u * T.back;
      poseGlyph(stage, dx, (pre ? 0 : R * u * 1.2 * (T.pop - T.hide)) + (rev ? 0.006 * u * Math.sin(v * 70) : 0), 0);
      const k = pre ? 0 : T.pop - T.hide;
      wheels.forEach((w, i) => { w.visible = k > 0.01; w.scale.setScalar(Math.max(1e-3, k)); w.position.set(B.minX + 0.18 * B.w + i * 0.64 * B.w + dx, floor + R * u * 0.95, 0.06 * u); w.rotation.z = -dx / (R * u); });
      for (let i = 0; i < 6; i++) { const f = ((v * 2 + i / 6) % 1); exhaust.set(i, B.minX + dx - 0.1 * u - 0.4 * u * f, floor + 0.12 * u + 0.1 * u * f, 0, rev || (T.go > 0 && T.go < 1) ? Math.sin(Math.PI * f) : 0); }
      exhaust.commit();
      const moving = T.go > 0.05 && T.go < 1 ? 1 : T.back > 0.05 && T.back < 0.95 ? 1 : 0;
      for (let i = 0; i < 4; i++) lines.set(i, B.minX + dx - 0.25 * u - 0.15 * u * (i % 2), B.minY + (0.3 + 0.2 * i) * u, 0.02 * u, moving);
      lines.commit();
    },
  };
}

export const SCENES = { 'chop-split': chopSplit, 'todo-list': todoList, 'pin-drop': pinDrop, 'dart-bullseye': dartBullseye, 'apple-ripen': appleRipen, 'eraser-rub': eraserRub, 'wheels-roll': wheelsRoll };
