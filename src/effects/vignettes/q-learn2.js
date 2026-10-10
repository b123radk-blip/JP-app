// Model scenes, study and practice (Step 3a model pass, batch 4).
//   q-memory-bubble  覚: a man on a stool reads a book; pictures (a star, an apple, a heart) float up out of it into a
//                    thought bubble over his head and stay there; he looks up at them and nods (cards: q-learn.js)
//   q-letter-blocks  字: letter blocks drop into a row; a child points at each in turn and it hops; letters: what the
//                    blocks show (漢字: 山川木)
//   q-study-desk     勉強: a child at a desk with a lamp writes line after line; a test pops up: 100 in a red circle and
//                    he throws his arms up
//   q-office-work    業: an office worker types at a laptop (カタカタ); finished papers stack up beside her while the wall
//                    clock spins; outcome class: a teacher writes on the blackboard in front of two pupils at their
//                    desks; the bell rings (キーンコーン) and the pupils put their hands up (授業)
//   q-juggle-crash   大変: a man juggles plates, more and more of them, wobbling, until they all crash down (ガシャーン!)
//                    and he clutches his head
//   q-mask-off       本当: a man in a disguise (glasses, big nose, moustache) glances about (?); he pulls it off, it
//                    flies away, and he smiles: a green check
//   q-practice-kick  練習: a child kicks a ball at a wall again and again; it bounces back each time and a chalk tally
//                    mark goes up on the wall
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, burst, ball } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G, heartShape } from '../pieces/shape-kit.js';
import { textPlane, emblemProp, blackboard } from '../pieces/kit-props.js';
import { between, arc } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, turnTo } from './q-common.js';
import { wscale, flashcards } from './q-learn.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
const stoolProp = (u, h) => solidProp([[G.cyl(0.1 * u, 0.1 * u, 0.025 * u, 0, h, 0), 0x8a5a30], [G.cyl(0.012 * u, 0.012 * u, h, -0.06 * u, h / 2, 0), 0x6a4020], [G.cyl(0.012 * u, 0.012 * u, h, 0.06 * u, h / 2, 0), 0x6a4020]], 0.35);
const appleProp = (u, r = 0.05) => solidProp([[G.sphere(r * u), 0xe02830], [G.sphere(0.4 * r * u, 0.4 * r * u, 1.1 * r * u, 0, 1.4, 0.4, 0.7), 0x40a040]], 0.6);
const heartProp = (u, s = 0.1) => solidProp([[G.extrude(heartShape(), 0.25).scale(s * u, s * u, s * u), 0xff4a7a]], 0.7);
const armsUp = (p, k) => { p.handTo('R', p.local(-0.24, 1.05, 0.06, W), k, { out: 0.5, down: 0.3 }); p.handTo('L', p.local(0.24, 1.05, 0.06, W), k, { out: 0.5, down: 0.3 }); };

// ---- 覚 / 覚える ----
function memoryBubble(ctx, spec, stage) {
  if (spec.outcome === 'cards') return flashcards(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u), stool = stoolProp(u, 0.1 * u), book = solidProp([[G.box(0.15 * u, 0.2 * u, 0.012 * u, -0.076 * u, 0, 0), 0xfaf6ea], [G.box(0.15 * u, 0.2 * u, 0.012 * u, 0.076 * u, 0, 0), 0xfaf6ea], [G.box(0.32 * u, 0.215 * u, 0.008 * u, 0, 0, -0.01 * u), 0x3a6ad0]], 0.5);
  const cloud = solidProp([[G.sphere(0.15 * u, 0, 0, 0, 1.6, 1, 0.3), 0xffffff], [G.sphere(0.1 * u, -0.17 * u, -0.03 * u, 0, 1, 1, 0.3), 0xffffff], [G.sphere(0.1 * u, 0.18 * u, -0.02 * u, 0, 1, 1, 0.3), 0xffffff], [G.sphere(0.03 * u, -0.2 * u, -0.2 * u, 0), 0xffffff], [G.sphere(0.02 * u, -0.25 * u, -0.27 * u, 0), 0xffffff]], 0.7);
  const pics = [burst(u, { s: 0.13, n: 5, color: 0xffc020 }), appleProp(u), heartProp(u)];
  stool.position.set(x0, floor, 0);
  group.add(p.group, stool, book, cloud, ...pics);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { look: [3.4, 0.5], unlook: [5.2, 0.5], out: [5.8, 0.5] });
      p.pose('SitDown', 1.0, false); p.group.position.set(x0, floor, 0); p.group.rotation.y = -0.25;
      const look = T.look * (1 - T.unlook);
      p.turn('Head', 0.45 * (1 - look) - 0.25 * look, -0.35 * look); p.turn('Torso', 0.1);
      p.local(0, 0.36, 0.3, W); book.position.copy(group.worldToLocal(W)); book.rotation.set(-1.15, p.group.rotation.y, 0, 'YXZ'); book.updateWorldMatrix(true, false);
      p.handTo('R', book.localToWorld(W.set(-0.17 * u, -0.04 * u, -0.02 * u)), 1, { out: 0.8, down: 0.8 });
      p.handTo('L', book.localToWorld(W.set(0.17 * u, -0.04 * u, -0.02 * u)), 1, { out: 0.8, down: 0.8 });
      if (look > 0.3) p.nod(bump(v, 4.0, 1.0), v);
      // the thought bubble over his head; the pictures float up into it one by one and stay
      p.at('over', W, 0, 0, 0); group.worldToLocal(W);
      const cx = W.x + 0.22 * u, cy = W.y + 0.22 * u, cv = pre ? 0 : between(v, 0.1, 0.5) * (1 - T.out);
      pop(cloud, cv, cx, cy, W.z - 0.02 * u);
      pics.forEach((o, i) => {
        const f = pre ? 0 : between(v, 0.6 + 0.9 * i, 1.6 + 0.9 * i), [x, y] = arc([book.position.x, book.position.y], [cx + (i - 1) * 0.15 * u, cy], 0.2 * u, f);
        o.visible = f > 0.01 && T.out < 0.98; o.position.set(x, y, W.z + 0.06 * u); o.scale.setScalar(grow((0.5 + 0.5 * f) * (1 - T.out))); o.rotation.set(0, f < 1 ? v * 5 : 0.3 * Math.sin(v * 2 + i), 0);
      });
    },
  };
}
// ---- 字 / 漢字 ----
function letterBlocks(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.28 * u, LET = [...(spec.letters ?? 'あいう')], S = 0.24 * u, COL = ['#e04848', '#3a8ae0', '#40a040', '#e0a020'];
  const boxes = many([[G.box(S, S, S, 0, 0, 0), 0xf0d8a8]], LET.length, 0.4);
  const faces = LET.map((ch, i) => textPlane(ch, { h: S * 0.85, w: S * 0.85, color: COL[i % 4], size: 0.85, weight: 900 }));
  const kid = person(spec.who, u, KID + 0.15), at = (i) => x0 + i * (S + 0.05 * u), kx = at(LET.length - 1) + 0.38 * u;
  group.add(boxes, ...faces, kid.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, away = between(v, 5.0, 5.4);
      const k = pre ? -1 : Math.floor((v - 1.6) / 0.9), f = pre ? 0 : ((v - 1.6) / 0.9) % 1, on = k >= 0 && k < LET.length;
      LET.forEach((_, i) => {
        const d = pre ? 1 : between(v, 0.1 + i * 0.35, 0.5 + i * 0.35), hop = on && k === i ? bump(f, 0.2, 0.5) : 0;
        const y = floor + S / 2 + (1 - d * d) * 0.9 * u + 0.12 * u * hop, sc = (d > 0 ? 1 : 0) * (1 - away);
        boxes.set(i, at(i), y, 0.02 * u, sc, 0, -0.15); faces[i].position.set(at(i) + S / 2 * Math.sin(-0.15), y, 0.02 * u + S / 2 * Math.cos(0.15) + 0.002 * u); faces[i].rotation.y = -0.15;
        faces[i].visible = sc > 0.01; faces[i].scale.setScalar(grow(sc * (1 + 0.15 * hop)));
      });
      boxes.commit();
      // she points at the blocks one after another (her left hand, nearest you)
      kid.pose('Idle', t); kid.group.position.set(kx, floor, 0.22 * u);
      const tgt = on ? k : Math.max(0, Math.min(LET.length - 1, k));
      kid.group.rotation.y = LEFT + 0.75;
      const pk = pre ? 0 : between(v, 1.4, 1.7) * (1 - between(v, 1.6 + 0.9 * LET.length, 1.9 + 0.9 * LET.length));
      kid.point('L', group.localToWorld(W.set(at(tgt), floor + S * 0.8, 0.1 * u)), pk);
      kid.turn('Head', 0.25 * pk, -0.2 * pk);
    },
  };
}

// ---- 勉強 ----
function studyDesk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.55 * u, top = 0.21 * u, LEG = 0x8a5a30;
  const kid = person(spec.who, u, 0.68), desk = solidProp([[G.box(0.62 * u, 0.025 * u, 0.3 * u, 0, top, 0), 0xc89060], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [G.box(0.03 * u, top, 0.03 * u, a * 0.28 * u, top / 2, b * 0.12 * u), LEG]),
    [G.box(0.14 * u, 0.07 * u, 0.12 * u, 0, 0.035 * u, -0.27 * u), LEG], [G.cyl(0.04 * u, 0.05 * u, 0.02 * u, 0.24 * u, top + 0.02 * u, -0.08 * u), 0x40a0e0], [G.cyl(0.008 * u, 0.008 * u, 0.25 * u, 0.24 * u, top + 0.14 * u, -0.08 * u), 0x40a0e0],
    [G.cone(0.06 * u, 0.07 * u, 0.2 * u, top + 0.27 * u, -0.06 * u, 0.7), 0x40a0e0], [G.sphere(0.025 * u, 0.18 * u, top + 0.24 * u, -0.05 * u), 0xfff0b0],
    ...[0x60c060, 0xe04848, 0xf0c030].map((c, i) => [G.box(0.14 * u, 0.035 * u, 0.1 * u, -0.22 * u, top + 0.03 * u + 0.037 * u * i, -0.04 * u, 0.05 * (i - 1)), c])], 0.35);
  const page = new THREE.Group(), paper = solidProp([[G.box(0.24 * u, 0.17 * u, 0.004 * u, 0, 0, 0), 0xfdfaf0]], 0.5), lines = many([[G.box(0.18 * u, 0.013 * u, 0.006 * u, 0.09 * u, 0, 0), 0x2a3a5a]], 5, 0.4);
  const pencil = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.12 * u, 0, 0, 0), 0xffd040], [G.cone(0.008 * u, 0.02 * u, 0, -0.07 * u, 0, Math.PI), 0x3a3a44]], 0.5);
  const score = textPlane('100', { h: 0.17 * u, color: '#e02020', bg: '#fdfaf0', weight: 900 }), ring = solidProp([[G.torus(0.17 * u, 0.012 * u, Math.PI * 1.85), 0xe02020], [G.torus(0.13 * u, 0.009 * u, Math.PI * 1.6, 0, 0, 0, 1), 0xe02020]], 0.7);
  page.add(paper, lines); group.add(kid.group, desk, page, pencil, score, ring);
  desk.position.set(x0, floor, 0); page.position.set(x0 + 0.02 * u, floor + top + 0.016 * u, 0.04 * u); page.rotation.set(-0.95, 0, 0);
  const loop = 6.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pop: [3.3, 0.4, 'back'], off: [5.4, 0.5] });
      kid.pose('SitDown', 1.0, false); kid.group.position.set(x0, floor - 0.005 * u, -0.27 * u); kid.group.rotation.y = 0;
      // line after line: the pencil runs along each line as it appears
      const n = pre ? 0 : (v - 0.2) / 0.55, cur = Math.floor(n), f = n - cur, writing = !pre && n > 0 && cur < 5;
      for (let i = 0; i < 5; i++) { const g = pre ? 0 : i < cur ? 1 : i === cur ? f : 0; lines.set(i, -0.09 * u, 0.055 * u - 0.028 * u * i, 0.004 * u, T.off < 1 ? g : 0); }
      lines.commit();
      const cheer = T.pop * (1 - T.off);
      page.updateWorldMatrix(true, false);
      const li = Math.min(4, Math.max(0, cur)), tip = page.localToWorld(W2.set(-0.09 * u + 0.18 * u * (writing ? f : 0.5), 0.055 * u - 0.028 * u * li, 0.01 * u));
      kid.write('R', tip.clone().add(W.set(0, 0.03 * u * wscale(group), 0)), writing ? 1 : 0.85 * (1 - cheer), v);
      armsUp(kid, cheer);
      kid.hold(pencil, 'R', group, 0.008 * u * wscale(group)); pencil.rotation.set(0.5, 0, 0.5);
      kid.handTo('L', page.localToWorld(W.set(0.12 * u, -0.05 * u, 0.02 * u)), 1 - cheer);
      pop(score, cheer, x0 + 0.42 * u, floor + 0.78 * u, 0.12 * u); pop(ring, cheer, x0 + 0.42 * u, floor + 0.78 * u, 0.115 * u); ring.rotation.z = v;
    },
  };
}

// ---- 業 / 授業 ----
function officeWork(ctx, spec, stage) {
  if (spec.outcome === 'class') return classBell(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.75 * u, top = 0.27 * u, R = 0.75, LEG = 0x6a6e78;
  const set = new THREE.Group(), desk = solidProp([[G.box(0.66 * u, 0.025 * u, 0.36 * u, 0, top, 0), 0xc89a60], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [G.box(0.025 * u, top, 0.025 * u, a * 0.3 * u, top / 2, b * 0.15 * u), LEG]),
    [G.cyl(0.08 * u, 0.08 * u, 0.11 * u, 0, 0.055 * u, -0.36 * u), 0x3a3a44], [G.box(0.24 * u, 0.012 * u, 0.15 * u, -0.04 * u, top + 0.02 * u, -0.06 * u), 0x9aa0aa], [G.box(0.22 * u, 0.13 * u, 0.008 * u, -0.04 * u, top + 0.09 * u, 0.0, 0), 0x6ab8f0],
    [G.box(0.24 * u, 0.15 * u, 0.012 * u, -0.04 * u, top + 0.095 * u, 0.008 * u), 0x8a909a], [G.sphere(0.02 * u, -0.04 * u, top + 0.1 * u, 0.016 * u, 1, 1, 0.3), 0xffffff], [G.cyl(0.03 * u, 0.026 * u, 0.06 * u, -0.25 * u, top + 0.045 * u, 0.02 * u), 0xe04848]], 0.4);
  const papers = many([[G.box(0.16 * u, 0.008 * u, 0.2 * u, 0, 0, 0), 0xffffff], [G.box(0.1 * u, 0.009 * u, 0.012 * u, 0, 0, -0.04 * u), 0x9aa4b4]], 12, 0.5);
  set.add(desk, papers); set.position.set(x0, floor, 0); set.rotation.y = R;
  const p = person(spec.who, u), tap = label(u, 'カタカタ', '#5a6a8a', 0.12), cx = x0 + 0.3 * u, cy = floor + 0.98 * u;
  const face = solidProp([[G.cyl(0.16 * u, 0.16 * u, 0.02 * u, 0, 0, 0, Math.PI / 2, 0, 0, 24), 0xfaf6ea], [G.torus(0.16 * u, 0.018 * u), 0x3a3a44], ...[0, 1, 2, 3].map((i) => [G.box(0.012 * u, 0.03 * u, 0.006 * u, 0.13 * u * Math.sin(i * Math.PI / 2), 0.13 * u * Math.cos(i * Math.PI / 2), 0.012 * u, i * Math.PI / 2), 0x3a3a44])], 0.5);
  const hand = (l, w) => { const g = new THREE.Group(); g.add(solidProp([[G.box(w, l, 0.008 * u, 0, l / 2, 0), 0x2a2a30]], 0.5)); g.position.set(cx, cy, -0.28 * u); return g; }, hh = hand(0.085 * u, 0.018 * u), mh = hand(0.13 * u, 0.012 * u);
  face.position.set(cx, cy, -0.3 * u);
  group.add(set, p.group, tap, face, hh, mh);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 5.2, 5.8);
      p.pose('SitDown', 1.0, false); set.updateWorldMatrix(true, false);
      p.group.position.copy(group.worldToLocal(set.localToWorld(W.set(0, -0.005 * u, -0.36 * u)))); p.group.rotation.y = R;
      // typing: both hands tap over the keyboard; a finished sheet lands on the pile every 0.4 s
      const typing = pre || v < 5.0, s = typing ? 1 : 0;
      p.turn('Head', 0.25);
      p.handTo('R', set.localToWorld(W.set(-0.09 * u, top + 0.06 * u + 0.025 * u * s * Math.max(0, Math.sin(v * 13)), -0.1 * u)), 1, { out: 0.7, down: 0.9 });
      p.handTo('L', set.localToWorld(W.set(0.01 * u, top + 0.06 * u + 0.025 * u * s * Math.max(0, Math.sin(v * 13 + 2)), -0.1 * u)), 1, { out: 0.7, down: 0.9 });
      const n = pre ? 3 : Math.min(12, 3 + Math.floor(between(v, 0.3, 4.8) * 9.99));
      for (let i = 0; i < 12; i++) papers.set(i, 0.2 * u + 0.006 * u * Math.sin(i * 3), top + 0.02 * u + 0.012 * u * i, 0.02 * u, i < n ? 1 - out : 0, 0, 0.12 * Math.sin(i * 2)); papers.commit();
      mh.rotation.z = pre ? -1 : -v * 5; hh.rotation.z = pre ? -2 : -2 - v * 0.42;
      pop(tap, typing && !pre ? 1 : 0, x0 - 0.05 * u, floor + 0.62 * u, 0.3 * u);
    },
  };
}
function classBell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.85 * u, by = floor + 0.85 * u, bz = -0.55 * u;
  const tch = person(spec.who, u), kids = [person(spec.kid, u, KID + 0.1), person(spec.other, u, KID + 0.1)], board = blackboard(u, { w: 0.78, h: 0.42 }), bell = emblemProp('alarm', 0.28 * u, { color: '#ffd040' });
  const lines = many([[G.box(0.44 * u, 0.016 * u, 0.004 * u, 0.22 * u, 0, 0), 0xf4f0e8]], 3, 0.8), chime = label(u, 'キーンコーン', '#3a8a5a', 0.13), dt = 0.2 * u, KX = [-0.02, 0.42];
  const desks = solidProp(KX.flatMap((x) => [[G.box(0.26 * u, 0.02 * u, 0.16 * u, x * u, dt, 0), 0xc89a60], [G.box(0.02 * u, dt, 0.02 * u, x * u, dt / 2, 0), 0x60646c], [G.box(0.12 * u, 0.07 * u, 0.1 * u, x * u, 0.035 * u, 0.2 * u), 0x8a5a30]]), 0.35);
  board.position.set(bx, by, bz); desks.position.set(bx, floor, 0.1 * u);
  group.add(board, lines, tch.group, desks, ...kids.map((k) => k.group), bell, chime);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { turn: [2.7, 0.4], ring: [3.2, 0.3], unring: [4.8, 0.3], back: [5.6, 0.5] });
      // she writes three lines on the board, then turns to the class; the bell rings and the pupils put their hands up
      const w = pre ? 0 : between(v, 0.2, 2.6), li = Math.min(2, Math.floor(w * 3)), f = w * 3 - li;
      for (let i = 0; i < 3; i++) { const g = i < li ? 1 : i === li ? f : 0; lines.set(i, bx - 0.24 * u, by + 0.11 * u - 0.1 * u * i, bz + 0.015 * u, g * (1 - between(v, 5.6, 6.0))); } lines.commit();
      tch.pose('Idle', t); tch.group.position.set(bx - 0.58 * u, floor, -0.32 * u);
      tch.group.rotation.y = turnTo(Math.PI - 0.7, 0.5, T.turn * (1 - T.back));
      const writing = pre ? 0 : 1 - T.turn + T.back;
      tch.handTo('R', group.localToWorld(W.set(bx - 0.24 * u + 0.44 * u * (w < 1 ? f : 0.5), by + 0.12 * u - 0.1 * u * li + 0.012 * u * Math.sin(v * 11), bz + 0.03 * u)), writing, { out: 0.8, down: 0.5 });
      tch.point('R', group.localToWorld(W.set(bx, by, bz)), T.turn * (1 - T.back) * 0.8);
      const ring = T.ring * (1 - T.unring);
      bell.position.set(bx + 0.55 * u, by + 0.3 * u, bz + 0.05 * u); bell.rotation.z = ring * 0.25 * Math.sin(v * 22); bell.idle(ring > 0.5 ? v : 0);
      pop(chime, ring, bx + 0.2 * u, by + 0.42 * u, bz + 0.1 * u);
      kids.forEach((k, i) => {
        k.pose('SitDown', 1.0, false); k.group.position.set(bx + KX[i] * u, floor - 0.005 * u, 0.3 * u); k.group.rotation.y = Math.PI + 0.2 * (i ? 1 : -1);
        const up = pre ? 0 : between(v, 3.4 + 0.2 * i, 3.7 + 0.2 * i) * (1 - between(v, 5.2, 5.6));
        k.handTo(i ? 'L' : 'R', k.local(i ? 0.18 : -0.18, 1.05, 0.08, W), up, { out: 0.5, down: 0.3 });
      });
    },
  };
}

// ---- 大変 ----
function juggle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.55 * u, N = 5, crashAt = 3.2;
  const p = person(spec.who, u), plates = many([[G.cyl(0.085 * u, 0.06 * u, 0.018 * u, 0, 0, 0, Math.PI / 2), 0xf6f4ee], [G.torus(0.068 * u, 0.008 * u, Math.PI * 2, 0, 0, 0.011 * u), 0x3a6ad0]], N, 0.5);
  const shards = many([[G.cone(0.022 * u, 0.05 * u, 0, 0), 0xf6f4ee]], 10, 0.5), bang = label(u, 'ガシャーン!', '#c03a3a', 0.14);
  group.add(p.group, plates, shards, bang);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, tt = pre ? t : v;
      const n = pre ? 3 : Math.min(N, 3 + Math.floor(v / 1.0)), wob = pre ? 0 : between(v, 1.0, crashAt), back = between(v, 6.0, 6.5);
      const juggling = pre || v < crashAt, hold = pre ? 0 : between(v, crashAt + 0.3, crashAt + 0.6) * (1 - between(v, 5.6, 6.0));
      p.pose('Idle', t); p.group.position.set(x0 + 0.05 * u * wob * Math.sin(v * 3.5), floor, 0.05 * u); p.group.rotation.y = -0.1;
      p.turn('Abdomen', 0, 0, 0.18 * wob * Math.sin(v * 3.5));
      // the plates go round a loop in front of him (up on his left, over, down on his right); his hands toss them
      const at = (i, ph, out) => { const a = (ph + i / Math.max(3, n)) * Math.PI * 2; return group.worldToLocal(p.local(0.24 * Math.cos(a), 0.95 + 0.3 * Math.sin(a), 0.32, out)); };
      for (let i = 0; i < N; i++) {
        if (back > 0 && i < 3) { const q = at(i, 0, W); plates.set(i, q.x, q.y, q.z, grow(back)); continue; }
        if (i >= n || (!juggling && v > crashAt + 1.2)) { plates.set(i, 0, 0, 0, 0); continue; }
        const q = at(i, juggling ? tt * 0.75 : crashAt * 0.75, W), fall = juggling ? 0 : between(v, crashAt + i * 0.08, crashAt + 0.5 + i * 0.08);
        plates.set(i, q.x + 0.08 * u * fall * (i - 2), q.y - (q.y - floor) * fall * fall, q.z, fall >= 1 ? 0 : 1, (juggling ? tt * 4 : 0) + fall * 5);
      }
      plates.commit();
      const j = Math.sin(tt * 0.75 * Math.PI * 2 * 1.5);
      p.handTo('R', p.local(-0.22, 0.62 + 0.08 * j, 0.3, W), juggling ? 1 : 0, { out: 0.7, down: 0.8 });
      p.handTo('L', p.local(0.22, 0.62 - 0.08 * j, 0.3, W), juggling ? 1 : 0, { out: 0.7, down: 0.8 });
      // crash: the pieces scatter; he clutches his head
      const c = pre ? -1 : between(v, crashAt + 0.45, crashAt + 1.3);
      for (let i = 0; i < 10; i++) { const a = (i / 9) * Math.PI; shards.set(i, x0 + Math.cos(a) * 0.45 * u * c, floor + 0.03 * u + 0.25 * u * Math.sin(Math.PI * c) * Math.sin(a), 0.2 * u + 0.1 * u * Math.sin(i * 2.3) * c, c > 0 && c < 1 ? 1 : 0, i * 1.7); }
      shards.commit();
      if (hold > 0) { p.handTo('R', p.at('over', W, -0.12, -0.12, 0.02), hold, { out: 0.9, down: 0.3 }); p.handTo('L', p.at('over', W, 0.12, -0.12, 0.02), hold, { out: 0.9, down: 0.3 }); p.shake(0.5 * hold, v); }
      pop(bang, pre ? 0 : between(v, crashAt + 0.4, crashAt + 0.6) * (1 - between(v, 5.0, 5.3)), x0 + 0.1 * u, floor + 1.2 * u, 0.2 * u);
    },
  };
}

// ---- 本当 ----
function maskOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), q = label(u, '?', '#6a6a7a', 0.2), ok = emblemProp('check', 0.32 * u);
  const disguise = solidProp([[G.torus(0.045 * u, 0.009 * u, Math.PI * 2, -0.055 * u, 0, 0), 0x1a1a1a], [G.torus(0.045 * u, 0.009 * u, Math.PI * 2, 0.055 * u, 0, 0), 0x1a1a1a], [G.box(0.03 * u, 0.01 * u, 0.01 * u, 0, 0.01 * u, 0), 0x1a1a1a],
    [G.sphere(0.035 * u, 0, -0.045 * u, 0.03 * u, 1, 1.1, 1), 0xffa088], [G.capsule(0.014 * u, 0.045 * u, -0.03 * u, -0.085 * u, 0.02 * u, 1.35), 0x3a2418], [G.capsule(0.014 * u, 0.045 * u, 0.03 * u, -0.085 * u, 0.02 * u, -1.35), 0x3a2418]], 0.5);
  group.add(p.group, disguise, q, ok);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [1.5, 0.4], pull: [1.9, 0.4], fly: [2.3, 0.9, 'linear'], smile: [2.5, 0.4, 'back'], back: [5.2, 0.5] });
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.15;
      // in disguise he glances shiftily left and right; then pulls it off his face and it flies away
      const sly = (pre ? 1 : 1 - T.reach) * Math.sin((pre ? t : v) * 2.4), yaw = 0.35 * sly;
      p.turn('Head', 0, yaw);
      const face = p.at('eyes', new THREE.Vector3(), 0, -0.04, 0.02), off = p.local(0.5, 0.85, 0.4, new THREE.Vector3());
      const grab = T.reach * (1 - T.smile);
      p.handTo('L', face.clone().lerp(off, T.pull).add(W.set(0, -0.03 * u * wscale(group), 0)), grab, { out: 0.8, down: 0.5 });
      const at = group.worldToLocal(face.clone().lerp(off, T.pull)), f = T.fly * (1 - T.back);
      disguise.position.set(at.x + 0.6 * u * f, at.y + 0.5 * u * Math.sin(Math.PI * f * 0.8), at.z); disguise.rotation.set(0, p.group.rotation.y + yaw, -5 * f);
      disguise.scale.setScalar(grow(T.back > 0 ? T.back : 1 - between(T.fly, 0.75, 1))); disguise.visible = T.back > 0 || T.fly < 1;
      const smile = pre ? 0 : T.smile * (1 - between(v, 4.8, 5.2));
      p.handTo('L', p.local(0.3, 0.55, 0.22, W), smile, { out: 0.9, down: 0.8 }); p.handTo('R', p.local(-0.3, 0.55, 0.22, W), smile, { out: 0.9, down: 0.8 });
      p.nod(smile * bump(v, 2.6, 1.4), v);
      pop(q, pre || v < 1.4 || v > 5.7 ? 1 : 0, x0, floor + 1.15 * u, 0.1 * u);
      ok.visible = smile > 0.01; ok.scale.setScalar(grow(0.32 * u * smile)); ok.position.set(x0 + 0.38 * u, floor + 1.0 * u, 0.1 * u); ok.idle(v);
    },
  };
}

// ---- 練習 ----
function practiceKick(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u, wx = px + 0.82 * u, WR = 0.7, r = 0.065 * u;
  const kid = person(spec.who, u, 0.68), b = ball(u, { r: 0.065, color: 0xffffff, stripe: 0x202020 });
  const wallG = new THREE.Group(), wall = solidProp([[G.box(0.08 * u, 0.75 * u, 0.6 * u, 0, 0.375 * u, 0), 0xc07a5a], ...[0.15, 0.3, 0.45, 0.6].map((y) => [G.box(0.085 * u, 0.015 * u, 0.6 * u, 0, y * u, 0), 0xa05a40])], 0.3);
  const tally = many([[G.box(0.006 * u, 0.16 * u, 0.028 * u, 0, 0, 0), 0xffffff]], 4, 0.9);
  wallG.add(wall, tally); wallG.position.set(wx, floor, -0.05 * u); wallG.rotation.y = WR;
  group.add(kid.group, b, wallG);
  const per = 1.4, loop = per * 4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, k = pre ? -1 : Math.floor(v / per), s = pre ? 0 : (v % per) / per;
      kid.pose('Idle', t); kid.group.position.set(px, floor, 0.12 * u); kid.group.rotation.y = RIGHT - 0.45;
      const kick = bump(s, 0.0, 0.3);
      kid.turn('UpperLegR', -0.9 * kick); kid.turn('LowerLegR', 0.3 * kick); kid.turn('Abdomen', -0.1 * kick);
      kid.handTo('L', kid.local(0.3, 0.5, 0.05, W), kick, { out: 0.9, down: 0.6 });
      // the ball: off the foot to the wall and rolling back to the foot
      const foot = group.worldToLocal(kid.local(-0.05, 0, 0.32, W)).clone(); wallG.updateWorldMatrix(true, false);
      const hit = group.worldToLocal(wallG.localToWorld(W2.set(-0.04 * u - r, r + 0.03 * u, 0)));
      const go = between(s, 0.12, 0.45), ret = between(s, 0.5, 0.95), f = s < 0.5 ? go : 1 - ret;
      b.position.set(lerp(foot.x, hit.x, f), floor + r + 0.15 * u * Math.sin(Math.PI * go) * (s < 0.5 ? 1 : 0), lerp(foot.z, hit.z, f)); b.rotation.z = -f * 9;
      // a chalk tally mark on the wall for every kick
      for (let i = 0; i < 4; i++) tally.set(i, -0.045 * u, 0.52 * u, (-0.15 + 0.09 * i) * u, !pre && (i < k || (i === k && s >= 0.45)) && v < loop - 0.3 ? 1 : 0);
      tally.commit();
    },
  };
}

export const SCENES = {
  'q-memory-bubble': memoryBubble, 'q-letter-blocks': letterBlocks, 'q-study-desk': studyDesk, 'q-office-work': officeWork,
  'q-juggle-crash': juggle, 'q-mask-off': maskOff, 'q-practice-kick': practiceKick,
};
