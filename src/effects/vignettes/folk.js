// People and qualities (word cards).
//   family-wave      家族: a dad, a mum and a small kid walk out together and stand in a row, waving, hearts over them
//   animal-parade    動物: a cow plods by, a bird flaps over it, a snail creeps after them
//   me-spotlight     自分: three people; a "?" pops up (who?); one steps forward, hand on their chest, and a spotlight lands
//                    on them
//   mask-off         本当: a person in a funny disguise (big glasses and nose); it pops off and flies away, the real face
//                    smiles and a green check pops up
//   classroom-kids   教室: a blackboard and three desks; three kids file in and sit down at them
//   talk-bubbles     言葉: two people chat; speech bubbles rise between them in different languages (こんにちは, Hello, Bonjour)
//   merry-go-round   楽しい: kids ride round and round on a merry-go-round, bobbing up and down, notes flying
//   race-win         一番: three runners race to a tape; the first breaks it, throws their arms up and a gold "1" pops
//   drag-suitcase    重い: a person drags a huge suitcase that barely moves, leaning hard, sweat flying; they flop onto it
//   spot-difference  違う: two pictures side by side, almost the same; a red ring draws round the one thing that differs
//   confetti-shapes  色々: shapes of every colour and kind pop out one after another and swirl round
//   paint-pour       茶色: a can tips and brown paint pours over a white teddy bear, colouring it brown from the top down
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF, DROP, HEART } from '../pieces/kit-things.js';
import { emblemProp, textPlane, blackboard } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, mixColor } from './helpers.js';

function familyWave(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const fam = [createPerson({ u: 1.05 * u, shirt: 0x3a6ae0 }), createPerson({ u: 0.95 * u, shirt: 0xe05a8a, hair: 0x8a3a1a }), createPerson({ u: 0.6 * u, shirt: 0xf0c030 })];
  const hearts = many(HEART(u, 0.14), 3, 0.8);
  group.add(...fam.map((p) => p.group), hearts);
  const X = [0.3, 0.75, 1.1], loop = 3.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      fam.forEach((p, i) => {
        const f = timeline(A.setup, { w: [0.2 + 0.1 * i, 0.7, 'out'] }).w, x = B.maxX + X[i] * u;
        p.group.position.set(x, floor, -0.4 * u * (1 - f) + 0.05 * u); p.face(f < 1 ? 0.4 : 0).reset().walk(A.s * 9, f < 1 ? 1 : 0);
        if (!pre) { p.raise(i === 1 ? 'L' : 'R', 2.5); p.bone(i === 1 ? 'foreL' : 'foreR').rotation.z = (i === 1 ? 0.5 : -0.5) * Math.sin(v * 8 + i); }
        p.update();
      });
      for (let i = 0; i < 3; i++) hearts.set(i, B.maxX + X[i] * u, floor + 1.25 * u + 0.05 * u * Math.sin(v * 3 + i), 0.05 * u, pre ? 0 : 0.8 + 0.2 * bump(((v + i * 0.4) % 1.2), 0, 0.4));
      hearts.commit();
    },
  };
}

function animalParade(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const cow = emblemProp('cow', 0.75 * u), bird = emblemProp('bird', 0.45 * u), snail = emblemProp('snail', 0.42 * u);
  group.add(cow, bird, snail);
  const loop = 6.0, x0 = B.maxX + 1.3 * u, span = 1.0 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v, f = (k) => ((v / loop + k) % 1);
      const cf = f(0), bf = f(0.15), sf = Math.min(1, f(0.3) * 0.6);
      cow.position.set(x0 - span * cf, floor + 0.28 * u + 0.02 * u * Math.abs(Math.sin(v * 5)), 0.02 * u); cow.idle(v); cow.rotation.z = 0.05 * Math.sin(v * 5);
      bird.position.set(x0 - span * bf, floor + 0.85 * u + 0.08 * u * Math.sin(v * 3), 0.05 * u); bird.idle(v);
      snail.position.set(x0 - 0.2 * u - span * sf, floor + 0.12 * u, 0.12 * u); snail.idle(v);
      [cow, bird, snail].forEach((m) => { m.visible = !pre || A.setup > 0.5; });
    },
  };
}

function meSpotlight(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const crowd = [0x50a0a0, 0xe0a030, 0xa070d0].map((c) => createPerson({ u: 0.85 * u, shirt: c }));
  const q = emblemProp('question', 0.35 * u), beam = solidProp([[G.cone(0.3 * u, 1.3 * u, 0, -0.65 * u, 0, Math.PI), 0xfff4c0]], 1.0);
  beam.material.transparent = true; beam.material.opacity = 0; beam.material.depthWrite = false; beam.material.blending = THREE.AdditiveBlending;
  group.add(...crowd.map((p) => p.group), q, beam);
  const X = [0.35, 0.7, 1.05], loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { q: [0.2, 0.4, 'back'], step: [1.0, 0.5], chest: [1.4, 0.4], light: [1.5, 0.4], back: [3.9, 0.6] });
      q.visible = !pre && T.q > 0 && T.step < 1; q.position.set(B.maxX + 0.7 * u, floor + 1.15 * u, 0.05 * u); q.scale.setScalar(0.35 * u * Math.max(1e-3, T.q)); q.idle(v);
      crowd.forEach((p, i) => {
        const me = i === 1, fwd = me && !pre ? T.step - T.back : 0;
        p.group.position.set(B.maxX + X[i] * u, floor, 0.3 * u * fwd); p.face('toward').reset();
        if (me) { const c = !pre ? T.chest - T.back : 0; p.bone('armR').rotation.x = 1.2 * c; p.bone('foreR').rotation.x = 1.6 * c; p.raise('R', -0.5 * c); }
        else p.bone('head').rotation.y = (i === 0 ? -0.6 : 0.6) * (pre ? 0 : T.step - T.back);     // the others turn to look
        p.update();
      });
      beam.position.set(B.maxX + X[1] * u, floor + 1.35 * u, 0.3 * (pre ? 0 : T.step - T.back) * u); beam.material.opacity = 0.3 * (pre ? 0 : T.light - T.back);
    },
  };
}

function maskOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u, shirt: 0x6a8ad0 }), specs = emblemProp('glasses', 0.3 * u), nose = solidProp([[G.sphere(0.045 * u, 0, 0, 0.02 * u), 0xffa088], [G.box(0.12 * u, 0.025 * u, 0.02 * u, 0, -0.05 * u, 0.03 * u), 0x3a2a20]], 0.4), ok = emblemProp('check', 0.4 * u);
  group.add(p.group, specs, nose, ok);
  const loop = 4.4, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { off: [0.8, 0.8, 'linear'], ok: [1.5, 0.4, 'back'], on: [3.8, 0.5] });
      p.group.position.set(px, floor, 0.05 * u); p.face('toward').reset(); p.bone('head').rotation.z = 0.12 * Math.sin(v * 6) * (v < 0.8 && !pre ? 1 : 0);
      const smile = pre ? 0 : T.ok - T.on; p.raise('L', 0.5 * smile); p.raise('R', 0.5 * smile); p.update();
      p.rig.pointOn('head', 0.52, head).add(p.group.position);
      const f = pre ? 0 : T.off * (1 - T.on), [x, y] = arc([head.x, head.y], [head.x + 1.0 * u, head.y + 0.2 * u], 0.5 * u, f);
      specs.position.set(x, y + 0.01 * u, head.z + 0.14 * u); specs.rotation.z = f * 6; specs.scale.setScalar(0.3 * u * (1 - 0.3 * f)); specs.idle(0);
      nose.position.set(x, y - 0.03 * u, head.z + 0.12 * u); nose.rotation.z = f * 6; nose.visible = specs.visible = f < 0.98 || T.on > 0;
      ok.visible = smile > 0.01; ok.position.set(px + 0.3 * u, floor + 1.1 * u, 0.05 * u); ok.scale.setScalar(0.4 * u * Math.max(1e-3, smile)); ok.idle(0);
    },
  };
}

function classroomKids(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u;
  const board = blackboard(u, { w: 1.1, h: 0.45 }); board.position.set(cx, floor + 0.95 * u, -0.35 * u);
  const desks = solidProp([0, 1, 2].flatMap((i) => [[G.box(0.28 * u, 0.03 * u, 0.2 * u, (i - 1) * 0.4 * u, 0.3 * u, 0), 0xc89a60], [G.box(0.03 * u, 0.3 * u, 0.03 * u, (i - 1) * 0.4 * u - 0.11 * u, 0.15 * u, -0.07 * u), 0x6a4a2a], [G.box(0.03 * u, 0.3 * u, 0.03 * u, (i - 1) * 0.4 * u + 0.11 * u, 0.15 * u, -0.07 * u), 0x6a4a2a]]));
  desks.position.set(cx, floor, 0.0);
  const kids = [0xe05a5a, 0x5aa0e0, 0x60c070].map((c) => createPerson({ u: 0.55 * u, shirt: c }));
  group.add(board, desks, ...kids.map((k) => k.group));
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      kids.forEach((k, i) => {
        const w = pre ? 0 : between(v, 0.2 + i * 0.5, 1.2 + i * 0.5), sit = pre ? 0 : between(v, 1.2 + i * 0.5, 1.5 + i * 0.5), gone = between(v, 4.3, 4.8);
        const x = cx + (i - 1) * 0.4 * u + (1 - w) * (1.6 - i * 0.3) * u;
        k.group.position.set(x, floor - 0.12 * u * sit, 0.22 * u); k.group.visible = w > 0 && gone < 1;
        k.face(w < 1 ? 'left' : 'away').reset().walk(v * 10, w > 0 && w < 1 ? 1 : 0);
        k.bone('legL').rotation.x += 1.4 * sit; k.bone('legR').rotation.x += 1.4 * sit; k.bone('shinL').rotation.x -= 1.4 * sit; k.bone('shinR').rotation.x -= 1.4 * sit;
        k.update();
      });
    },
  };
}

function talkBubbles(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const a = createPerson({ u: 0.9 * u, shirt: 0x40a080 }), b = createPerson({ u: 0.9 * u, shirt: 0xd06a40, hair: 0xd0a040 });
  const WORDS = spec.words ?? ['こんにちは', 'Hello', 'Bonjour'], bubbles = WORDS.map((w) => textPlane(w, { h: 0.2 * u, color: '#222222', bg: '#ffffff', weight: 700 }));
  group.add(a.group, b.group, ...bubbles);
  const ax = B.maxX + 0.3 * u, bx = B.maxX + 1.0 * u, per = 1.2, loop = per * WORDS.length + 0.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      a.group.position.set(ax, floor, 0.05 * u); b.group.position.set(bx, floor, 0.05 * u);
      const speaker = pre ? -1 : Math.floor(v / per) % 2;
      a.face(0.9).reset(); b.face(-0.9).reset();
      if (speaker === 0) a.raise('R', 0.6 + 0.3 * Math.sin(v * 9)); if (speaker === 1) b.raise('L', 0.6 + 0.3 * Math.sin(v * 9));
      a.update(); b.update();
      bubbles.forEach((m, i) => {
        const f = pre ? 0 : between(v, i * per, i * per + per * 1.6), from = i % 2 ? bx : ax;
        m.visible = f > 0 && f < 1; m.position.set(from + (i % 2 ? -1 : 1) * 0.2 * u, floor + 0.8 * u + 0.3 * u * f, 0.1 * u); m.scale.setScalar(Math.min(1, f * 5)); m.material.opacity = 1 - Math.max(0, f - 0.7) / 0.3;
      });
    },
  };
}

function merryGoRound(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u;
  const ride = solidProp([[G.cyl(0.55 * u, 0.55 * u, 0.08 * u, 0, 0.04 * u, 0, 0, 0, 0, 32), 0xf0d060], [G.cyl(0.04 * u, 0.04 * u, 0.9 * u, 0, 0.5 * u, 0), 0xe0e0e8], [G.cone(0.65 * u, 0.3 * u, 0, 1.05 * u, 0), 0xe04a6a], [G.torus(0.6 * u, 0.02 * u).rotateX(Math.PI / 2).translate(0, 0.9 * u, 0), 0xffffff]], 0.35);
  ride.position.set(cx, floor, -0.1 * u);
  const kids = [0x5aa0e0, 0xf0a030, 0x60c070].map((c) => createPerson({ u: 0.5 * u, shirt: c })), poles = many([[G.cyl(0.012 * u, 0.012 * u, 0.85 * u, 0, 0, 0), 0xf8f0d0]], 3, 0.5);
  const notes = many([[G.sphere(0.035 * u, 0, 0, 0, 1.3, 1, 0.7), 0xffe060], [G.box(0.01 * u, 0.12 * u, 0.01 * u, 0.04 * u, 0.06 * u, 0), 0xffe060]], 4, 0.8);
  group.add(ride, poles, notes, ...kids.map((k) => k.group));
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v, spin = (v / loop) * Math.PI * 2 * 2;
      kids.forEach((k, i) => {
        const a = spin + (i / 3) * Math.PI * 2, bob = 0.06 * u * Math.sin(a * 3), x = cx + Math.sin(a) * 0.42 * u, z = -0.1 * u + Math.cos(a) * 0.42 * u;
        k.group.position.set(x, floor + 0.12 * u + bob, z); k.face(a + Math.PI / 2).reset(); k.bone('legL').rotation.x = k.bone('legR').rotation.x = 1.3; k.raise('L', 1.5 + 0.5 * Math.sin(a * 2)); k.update();
        poles.set(i, x, floor + 0.47 * u, z, 1);
      });
      poles.commit();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.6 + i / 4) % 1); notes.set(i, cx + 0.6 * u * Math.sin(i * 1.7 + f * 3), floor + 1.1 * u + 0.4 * u * f, 0.1 * u, pre ? 0 : Math.sin(Math.PI * f)); }
      notes.commit();
    },
  };
}

function raceWin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.4 * u;
  const runners = [0xe04848, 0x4a8ae0, 0x50c070].map((c) => createPerson({ u: 0.75 * u, shirt: c }));
  const half = (s) => { const g = new THREE.Group(), m = solidProp([[G.box(0.3 * u, 0.025 * u, 0.01 * u, s * 0.15 * u, 0, 0), 0xffffff]]); g.add(m); g.position.set(fx + s * 0.0, floor + 0.45 * u, 0.15 * u); return g; };
  const tape = [half(-1), half(1)], one = textPlane('1', { h: 0.45 * u, color: '#ffd030', bg: null }), posts = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.5 * u, -0.3 * u, 0.25 * u, 0.15 * u), 0xc0c0c8], [G.cyl(0.015 * u, 0.015 * u, 0.5 * u, 0.3 * u, 0.25 * u, 0.15 * u), 0xc0c0c8]]);
  posts.position.set(fx, floor, 0);
  group.add(posts, ...tape, one, ...runners.map((r) => r.group));
  const SPEED = [1.0, 0.85, 0.75], loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      runners.forEach((r, i) => {
        const run = pre ? 0 : Math.min(1, v * 0.62 * SPEED[i]), x = fx + 1.5 * u - 1.6 * u * run, won = i === 0 && run >= 0.95;
        r.group.position.set(x, floor, (0.05 + 0.12 * (i - 1)) * u); r.face(won ? 'toward' : 'left').reset().walk(v * 14, run < 1 ? 1 : 0);
        if (won) { r.raise('L', 2.7); r.raise('R', 2.7); r.group.position.y += 0.05 * u * Math.abs(Math.sin(v * 8)); }
        r.update();
      });
      const broke = pre ? 0 : between(v, 1.55, 1.9);
      tape[0].rotation.z = -1.3 * broke; tape[1].rotation.z = 1.3 * broke; tape.forEach((h) => { h.position.x = fx; });
      const k = pre ? 0 : between(v, 1.9, 2.2) * (1 - between(v, 4.1, 4.5)); one.visible = k > 0; one.position.set(fx - 0.2 * u, floor + 0.95 * u, 0.15 * u); one.scale.setScalar(Math.max(1e-3, k * (1 + 0.1 * Math.sin(v * 6))));
    },
  };
}

function dragSuitcase(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const p = createPerson({ u: 0.9 * u, shirt: 0xd08a40 }), bag = emblemProp('suitcase', 0.75 * u), sweat = many(DROP(1.8 * u), 3, 0.8);
  group.add(p.group, bag, sweat);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pull: [0, 2.6, 'linear'], flop: [2.8, 0.5], up: [4.3, 0.6] });
      const inch = 0.25 * u * (T.pull + Math.sin(v * 6) * 0.02) * (1 - T.up), bx = B.maxX + 0.95 * u - inch, px = bx - 0.55 * u;
      bag.position.set(bx, floor + 0.3 * u, 0.0); bag.idle(0); bag.rotation.z = -0.03 * Math.sin(v * 6);
      const sit = pre ? 0 : T.flop * (1 - T.up);
      p.group.position.set(px + 0.5 * u * sit, floor + 0.32 * u * sit, 0.1 * u); p.face(sit > 0.5 ? 'toward' : 'left').reset();
      if (sit < 0.5) { p.lean(-0.5); p.bone('armR').rotation.x = -0.9; p.bone('armL').rotation.x = -0.9; p.walk(v * 4, pre ? 0 : 0.4); p.group.position.x += 0.006 * u * tremble(v); }
      else { p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.5; p.bone('head').rotation.z = 0.3; }
      p.update();
      for (let i = 0; i < 3; i++) { const f = ((v * 1.2 + i / 3) % 1); sweat.set(i, px + (i - 1) * 0.12 * u * f, floor + 0.95 * u + 0.12 * u * Math.sin(Math.PI * f), 0.15 * u, !pre && v < 4 ? 1 - f : 0); }
      sweat.commit();
    },
  };
}

function spotDifference(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cy = B.cy + 0.05 * u;
  const pic = (sun) => solidProp([[G.box(0.5 * u, 0.42 * u, 0.02 * u, 0, 0, -0.01 * u), 0x8a5a30], [G.box(0.44 * u, 0.36 * u, 0.02 * u, 0, 0, 0), 0xbfe4ff], [G.box(0.44 * u, 0.1 * u, 0.022 * u, 0, -0.13 * u, 0), 0x60b050], [G.cone(0.08 * u, 0.18 * u, -0.1 * u, -0.02 * u, 0.012 * u), 0x2a8a3a], [G.box(0.12 * u, 0.1 * u, 0.024 * u, 0.1 * u, -0.07 * u, 0), 0xf0d0a0], [G.cone(0.09 * u, 0.06 * u, 0.1 * u, 0.01 * u, 0.012 * u), 0xc03a2a], [G.sphere(0.04 * u, 0.15 * u, 0.12 * u, 0.012 * u, 1, 1, 0.3), sun]], 0.35);
  const left = pic(0xffc020), right = pic(0x6a6aff);             // the right one's sun is blue: the difference
  const lx = B.maxX + 0.38 * u, rx = lx + 0.6 * u; left.position.set(lx, cy, 0); right.position.set(rx, cy, 0);
  const ring = solidProp([[G.torus(0.08 * u, 0.01 * u), 0xff2020]], 1);
  group.add(left, right, ring);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const k = timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a; left.scale.setScalar(Math.max(1e-3, k)); right.scale.setScalar(Math.max(1e-3, k));
      const r = pre ? 0 : between(v, 1.0, 1.6) * (1 - between(v, 3.8, 4.2));
      ring.visible = r > 0; ring.position.set(rx + 0.15 * u, cy + 0.12 * u, 0.03 * u); ring.scale.setScalar(Math.max(1e-3, 0.3 + 0.7 * r) * (1 + 0.1 * Math.sin(v * 6)));
    },
  };
}

function confettiShapes(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.65 * u, cy = B.cy + 0.1 * u;
  const SHAPES = [[[G.sphere(0.07 * u), 0xe03838]], [[G.box(0.11 * u, 0.11 * u, 0.11 * u, 0, 0, 0), 0x3a7ae0]], [[G.cone(0.07 * u, 0.14 * u, 0, 0), 0x40c060]], [[G.torus(0.06 * u, 0.025 * u), 0xf0c020]], [[G.cyl(0.05 * u, 0.05 * u, 0.12 * u, 0, 0), 0xb050e0]]];
  const sets = SHAPES.map((s) => many(s, 3, 0.55));
  group.add(...sets);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      sets.forEach((m, si) => {
        for (let i = 0; i < 3; i++) {
          const n = si * 3 + i, pop = pre ? 0 : between(v, n * 0.12, n * 0.12 + 0.3) * (1 - between(v, 4.3, 4.8)), a = n * 2.4 + v * 0.8, r = (0.25 + 0.2 * ((n * 7) % 5) / 5) * u;
          m.set(i, cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r, 0.05 * u * Math.sin(a), pop, a * 2, a);
        }
        m.commit();
      });
    },
  };
}

function paintPour(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, PAINT = spec.color ?? 0x8a5020;
  const bear = solidProp([[G.sphere(0.2 * u, 0, 0.2 * u, 0, 1, 1.1, 0.9), 0xffffff], [G.sphere(0.15 * u, 0, 0.5 * u), 0xffffff], [G.sphere(0.06 * u, -0.12 * u, 0.62 * u), 0xffffff], [G.sphere(0.06 * u, 0.12 * u, 0.62 * u), 0xffffff], [G.sphere(0.06 * u, 0, 0.47 * u, 0.13 * u, 1, 0.8, 0.6), 0xf0e0d0], [G.sphere(0.02 * u, -0.05 * u, 0.54 * u, 0.13 * u), 0x101010], [G.sphere(0.02 * u, 0.05 * u, 0.54 * u, 0.13 * u), 0x101010], [G.sphere(0.07 * u, -0.17 * u, 0.06 * u, 0.06 * u), 0xffffff], [G.sphere(0.07 * u, 0.17 * u, 0.06 * u, 0.06 * u), 0xffffff]], 0.4);
  bear.position.set(bx, floor, 0);
  const can = solidProp([[G.cyl(0.11 * u, 0.11 * u, 0.2 * u, 0, 0, 0), 0xc0c4cc], [G.box(0.18 * u, 0.06 * u, 0.005 * u, 0, 0, 0.11 * u), PAINT]], 0.35), stream = many([[G.sphere(0.035 * u), PAINT]], 10, 0.4);
  group.add(bear, can, stream);
  const c = new THREE.Color(), loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tip: [0.2, 0.4], pour: [0.5, 1.6, 'linear'], back: [2.2, 0.4], clean: [4.1, 0.6] });
      can.position.set(bx + 0.18 * u, floor + 1.05 * u, 0.05 * u); can.rotation.z = 1.9 * (T.tip - T.back); can.visible = !pre && v < 2.8;
      for (let i = 0; i < 10; i++) { const f = ((v * 2 + i / 10) % 1); stream.set(i, bx + 0.05 * u, floor + 0.95 * u - 0.3 * u * f, 0.06 * u, T.pour > 0 && T.pour < 1 ? 1 : 0); }
      stream.commit();
      mixColor(c, 0xffffff, PAINT, (pre ? 0 : T.pour) * (1 - T.clean)); bear.material.color.copy(c);
    },
  };
}

export const SCENES = { 'family-wave': familyWave, 'animal-parade': animalParade, 'me-spotlight': meSpotlight, 'mask-off': maskOff, 'classroom-kids': classroomKids, 'talk-bubbles': talkBubbles, 'merry-go-round': merryGoRound, 'race-win': raceWin, 'drag-suitcase': dragSuitcase, 'spot-difference': spotDifference, 'confetti-shapes': confettiShapes, 'paint-pour': paintPour };
