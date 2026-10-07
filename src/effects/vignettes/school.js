// School, queues and play.
//   teach-board   教: a teacher writes 1+1=2 on a blackboard, tapping each part with a pointer; a small pupil watches,
//                 then shoots a hand up and a lightbulb pops on over them
//   queue-number  番: three people queue at a counter under a number sign; the sign counts 1, 2, 3 and each time the one
//                 at the front steps up, is served and walks off, the others shuffle forward
//   which-way     方: a person by a signpost looks one way, then the other, scratching their head; the sign's arm swings
//                 round and points; off they walk that way, then come back
//   drum-fun      楽: a kid drums on top of the kanji with two sticks; it bounces with every beat, music notes fly up
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many } from '../pieces/kit-things.js';
import { emblemProp, blackboard, textPlane, stick, signpost } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, liveText } from './helpers.js';

function teachBoard(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.6 * u, by = floor + 0.72 * u;
  const board = blackboard(u, { w: 0.85, h: 0.5 }), text = textPlane(spec.text ?? '1+1=2', { h: 0.2 * u, color: '#f4f4ec', weight: 400 });
  board.position.set(bx, by, -0.12 * u);
  text.geometry.translate(text.geometry.parameters.width / 2, 0, 0);            // grow from the left edge
  const tw = text.geometry.parameters.width; text.position.set(bx - tw / 2, by + 0.04 * u, -0.1 * u);
  text.material.map.repeat.x = 0.001;
  const teacher = createPerson({ u, shirt: 0x40806a, hair: 0x2a2a30 }), pointer = stick(u, { len: 0.42 }), pupil = createPerson({ u: 0.6 * u, shirt: 0xe07a30 }), bulb = emblemProp('lightbulb', 0.3 * u);
  teacher.rig.attach('handR', pointer, 0.4); pointer.rotation.x = Math.PI / 2;
  group.add(board, text, teacher.group, pupil.group, bulb);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      board.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.2, 0.4, 'back'] }).a));
      const T = timeline(v, { write: [0.2, 2.0, 'linear'], hand: [2.5, 0.35, 'back'], wipe: [4.4, 0.5] });
      const shown = pre ? 0 : Math.max(0.001, T.write * (1 - T.wipe));
      text.scale.x = shown; text.material.map.repeat.x = shown; text.visible = shown > 0.01;
      // the teacher stands to the right of the board, pointer tapping where the chalk is
      teacher.group.position.set(bx + 0.62 * u, floor, 0.05 * u); teacher.face(-1.1).reset();
      const tap = pre ? 0 : Math.abs(Math.sin(v * Math.PI * 2.5)) * (v < 2.2 ? 1 : 0);
      teacher.bone('armR').rotation.x = 1.5 + 0.25 * tap; teacher.bone('foreR').rotation.x = 0.2;
      teacher.update();
      pupil.group.position.set(bx - 0.35 * u, floor, 0.3 * u); pupil.face('away').reset();
      const up = pre ? 0 : T.hand * (1 - T.wipe); pupil.raise('R', 2.9 * up); pupil.group.position.y += 0.03 * u * bump(v, 2.5, 0.3);
      pupil.update();
      bulb.visible = up > 0.05; bulb.scale.setScalar(Math.max(1e-3, 0.3 * u * up)); bulb.position.set(bx - 0.35 * u, floor + 0.75 * u, 0.3 * u); bulb.idle(v - 2.5);
    },
  };
}

function queueNumber(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.3 * u;
  const desk = solidProp([[G.box(0.4 * u, 0.36 * u, 0.25 * u, 0, 0.18 * u, 0), 0x8a6a4a], [G.box(0.44 * u, 0.03 * u, 0.28 * u, 0, 0.37 * u, 0), 0xc8a070], [G.box(0.36 * u, 0.24 * u, 0.06 * u, 0, 0.82 * u, -0.05 * u), 0x30343c], [G.cyl(0.015 * u, 0.015 * u, 0.3 * u, 0, 0.55 * u, -0.06 * u), 0x60646c]]);
  desk.position.set(cx, floor, -0.05 * u);
  const sign = liveText(u, { w: 0.3, h: 0.2 }); sign.position.set(cx, floor + 0.82 * u, 0.0);
  const COLORS = [0xe05050, 0x50a0e0, 0x60c060], people = COLORS.map((c) => createPerson({ u: 0.7 * u, shirt: c }));
  group.add(desk, sign, ...people.map((p) => p.group));
  const SERVE = [0.5, 1.9, 3.3], loop = 4.2, slotX = (q) => cx + 0.36 * u + q * 0.3 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const served = pre ? 0 : SERVE.filter((s) => v >= s).length;
      sign.set(String(Math.max(1, served)));
      sign.scale.setScalar(1 + 0.15 * (pre ? 0 : Math.max(...SERVE.map((s) => bump(v, s, 0.3)))));
      people.forEach((p, i) => {
        // queue place: i minus the people served before (smoothly); the one served walks off down the front and rejoins at the back
        const shuffle = pre ? 0 : SERVE.reduce((s0, s) => s0 + between(v, s + 0.4, s + 0.9), 0);
        let q = i - shuffle, out = 0;
        const mine = SERVE[i], f = pre ? 0 : between(v, mine, mine + 1.2);
        if (!pre && v >= mine) { out = f; q = -0.6; }
        const x = out > 0 ? slotX(-0.6) + 1.5 * u * out : slotX(Math.max(0, q));
        p.group.position.set(x, floor, out > 0 ? 0.3 * u : 0.05 * u); p.group.visible = !(out >= 1);
        p.face(out > 0 ? 'right' : 'left').reset().walk(v * 10, out > 0 && out < 1 ? 1 : (pre || out) ? 0 : (shuffle % 1 > 0 && shuffle % 1 < 1 ? 0.6 : 0));
        if (!pre) p.lean(0.45 * bump(v, mine, 0.45));                                // a little bow at the counter
        p.update();
      });
    },
  };
}

function whichWay(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u;
  const post = signpost(1.1 * u), p = createPerson({ u: 0.9 * u, shirt: 0xd05a8a });
  post.position.set(sx, floor, -0.08 * u);
  group.add(post, p.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      post.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.2, 0.4, 'back'] }).a));
      const T = timeline(v, { look1: [0.2, 0.4], look2: [0.9, 0.5], scratch: [1.5, 0.5], swing: [2.0, 0.6, 'back'], go: [2.7, 1.0, 'in'], back: [4.2, 1.2] });
      post.arm.rotation.y = Math.PI * (1 - (pre ? 0 : T.swing - T.back));            // points left (back) at first, swings to point right
      const out = pre ? 0 : T.go - T.back, x = sx + 0.4 * u + 1.2 * u * out;
      p.group.position.set(x, floor, 0.1 * u);
      p.face(out > 0 && T.back === 0 ? 'right' : out > 0 ? 'left' : 'toward').reset().walk(v * 10, (T.go > 0 && T.go < 1) || (T.back > 0 && T.back < 1) ? 1 : 0);
      p.bone('head').rotation.y = 0.8 * (T.look1 - T.look2 * 2 + T.look2 * (1 - T.scratch)) * (out > 0 ? 0 : 1);
      const scr = bump(v, 1.5, 0.8); p.raise('R', 2.6 * scr); p.bone('foreR').rotation.z = -1.2 * scr;
      p.update();
    },
  };
}

function drumFun(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const kid = createPerson({ u: 0.85 * u, shirt: 0xff7a40 }), sticks = [stick(u, { len: 0.36 }), stick(u, { len: 0.36 })];
  kid.rig.attach('handL', sticks[0], 0.4); kid.rig.attach('handR', sticks[1], 0.4); sticks.forEach((s) => { s.rotation.x = 1.9; });
  const noteShape = [[G.sphere(0.04 * u, 0, 0, 0, 1.3, 1, 0.7), 0xffe060], [G.box(0.012 * u, 0.13 * u, 0.012 * u, 0.045 * u, 0.065 * u, 0), 0xffe060], [G.box(0.05 * u, 0.012 * u, 0.012 * u, 0.065 * u, 0.125 * u, 0), 0xffe060]];
  const notes = many(noteShape, 6, 0.8);
  group.add(kid.group, notes);
  const beat = 0.42, loop = beat * 10;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // left, right, left, right ... each stick comes down on the top of the kanji; the kanji squashes on each hit
      const ph = pre ? 0 : (v / beat) % 2, hitL = Math.max(0, Math.cos(Math.PI * ph)), hitR = Math.max(0, -Math.cos(Math.PI * ph));
      kid.group.position.set(B.maxX + 0.3 * u, floor + (pre ? 0 : 0.02 * u * Math.abs(Math.sin(v * Math.PI / beat))), 0.12 * u); kid.face(-1.2).reset();
      kid.bone('armL').rotation.x = 2.3 - 0.7 * (pre ? 0 : 1 - hitL); kid.bone('armR').rotation.x = 2.3 - 0.7 * (pre ? 0 : 1 - hitR);
      kid.bone('foreL').rotation.x = kid.bone('foreR').rotation.x = 0.3;
      kid.bone('head').rotation.z = 0.12 * Math.sin(v * Math.PI / beat);
      kid.update();
      const squash = pre ? 0 : Math.pow(Math.max(0, Math.cos(Math.PI * ((v / beat) % 1))), 8);
      poseGlyph(stage, 0, 0, 0, B.cx, B.minY, 1);
      stage.glyph.scale.set(1 + 0.04 * squash, 1 - 0.06 * squash, 1);
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : (((v - i * beat) / (beat * 6)) % 1 + 1) % 1; notes.set(i, B.maxX - 0.1 * u + 0.25 * u * Math.sin(i * 2.3) + 0.1 * u * f, B.maxY + 0.05 * u + 0.8 * u * f, 0.05 * u, pre ? 0 : Math.sin(Math.PI * f) * 1.2, 0.3 * Math.sin(f * 8 + i)); }
      notes.commit();
    },
  };
}

export const SCENES = { 'teach-board': teachBoard, 'queue-number': queueNumber, 'which-way': whichWay, 'drum-fun': drumFun };
