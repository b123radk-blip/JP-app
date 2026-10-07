// Batch 6 kanji, part 3.
//   words-fly       辞: an open book; letter tiles (こ と ば) fly out of it in arcs and line up into a word above it, glowing
//   boomerang-throw 返: a person throws a boomerang; it swings out in a wide loop, spinning, and comes back to their hand
//   memory-bubble   覚: a person reads a book; pictures (a star, an apple, a heart) float up out of it into a thought bubble
//                   above their head and stay there
//   office-work     業: a grown-up types at a laptop on a desk; finished papers stack higher and higher; the wall clock spins
//   hand-question:answer (答): the teacher asks under a "?"; a kid's hand shoots up and their bubble shows a big tick; a gold
//                   star for the right answer
import * as THREE from 'three';
import { bookReturn, bookSlam, classBell, flashcards } from './variants6b.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), WOOD = 0xc89a60;

function wordsFly(ctx, spec, stage) {
  if (spec.outcome === 'slam') return bookSlam(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.45 * u, by = floor + 0.15 * u;
  const book = solidProp([[G.box(0.24 * u, 0.02 * u, 0.3 * u, -0.12 * u, 0.04 * u, 0, 0.25), 0xfaf6ea], [G.box(0.24 * u, 0.02 * u, 0.3 * u, 0.12 * u, 0.04 * u, 0, -0.25), 0xfaf6ea], [G.box(0.5 * u, 0.02 * u, 0.32 * u, 0, 0.0, 0), 0x8a2a2a]], 0.45);
  book.position.set(bx, by, 0); book.rotation.x = 0.5;
  const tiles = ['こ', 'と', 'ば'].map((ch, i) => textPlane(ch, { h: 0.16 * u, w: 0.16 * u, color: ['#e04848', '#3a7ad0', '#40a040'][i], bg: '#fff8e0', size: 0.85 }));
  const glow = burst(u, { s: 0.6, n: 10, color: 0xfff0a0 });
  group.add(book, glow, ...tiles);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, back = between(v, 4.0, 4.6);
      tiles.forEach((p, i) => { const f = pre ? 1 : between(v, 0.3 + 0.45 * i, 0.9 + 0.45 * i) * (1 - back), [x, y] = arc([bx, by + 0.05 * u], [bx + (i - 1) * 0.2 * u, by + 0.6 * u], 0.25 * u, f); p.visible = f > 0.01; p.position.set(x, y, 0.08 * u); p.rotation.z = (1 - f) * 3; p.scale.setScalar(pop(f)); });
      const g = pre ? 0 : bump(v, 1.9, 2.0); glow.visible = g > 0; glow.scale.setScalar(pop(g)); glow.position.set(bx, by + 0.6 * u, 0.0); glow.rotation.z = t * 0.6;
    },
  };
}

function boomerangThrow(ctx, spec, stage) {
  if (spec.outcome === 'book') return bookReturn(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.3 * u;
  const p = createPerson({ u: 0.8 * u, shirt: 0x40a080 }), boom = emblemProp('boomerang', 0.22 * u, { color: 0xe07a30 }), trail = many([[G.sphere(0.012 * u), 0xffffff]], 10, 0.8);
  group.add(p.group, boom, trail);
  const loop = 4.4, hand = new THREE.Vector3(), path = (s, hx, hy) => { const a = s * Math.PI * 2; return [hx + 0.45 * u * (1 - Math.cos(a)) * 1.0, hy + 0.35 * u * Math.sin(a) + 0.15 * u * (1 - Math.cos(a))]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { wind: [0.2, 0.4], throw: [0.6, 0.2, 'in'], fly: [0.8, 2.4, 'smooth'], catch: [3.2, 0.3] });
      p.reset().face(0.5); p.bone('armR').rotation.x = 1.3 - 2.2 * T.wind + 2.6 * T.throw - 0.6 * T.fly * (1 - T.catch) + 1.2 * bump(v, 3.0, 0.6); p.group.position.set(px, floor, 0.1 * u); p.update(); bonePoint(p, 'handR', 0.8, hand);
      const flying = T.fly > 0 && T.fly < 1, [x, y] = flying ? path(T.fly, hand.x, hand.y) : [hand.x, hand.y];
      boom.position.set(x, y + 0.02 * u, hand.z + 0.05 * u + 0.2 * u * Math.sin(Math.PI * T.fly)); boom.rotation.z = flying ? -v * 15 : 0; boom.idle(0);
      for (let i = 0; i < 10; i++) { const s = T.fly - 0.025 * (i + 1), [tx, ty] = path(Math.max(0, s), hand.x, hand.y); trail.set(i, tx, ty, hand.z + 0.05 * u, flying && s > 0 ? 1 - i / 10 : 0); } trail.commit();
    },
  };
}

function memoryBubble(ctx, spec, stage) {
  if (spec.outcome === 'cards') return flashcards(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u, pu = 0.8 * u;
  const p = createPerson({ u: pu, shirt: 0x9a60d0 }), book = solidProp([[G.box(0.22 * u, 0.16 * u, 0.03 * u, 0, 0, 0), 0x3a7ad0], [G.box(0.21 * u, 0.15 * u, 0.032 * u, 0, 0, 0.001 * u), 0xffffff]], 0.45);
  const cloud = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1.4, 1, 0.4), 0xffffff], [G.sphere(0.09 * u, -0.14 * u, -0.03 * u, 0, 1, 1, 0.4), 0xffffff], [G.sphere(0.09 * u, 0.14 * u, -0.02 * u, 0, 1, 1, 0.4), 0xffffff], [G.sphere(0.03 * u, -0.08 * u, -0.17 * u, 0), 0xffffff], [G.sphere(0.02 * u, -0.1 * u, -0.23 * u, 0), 0xffffff]], 0.6);
  const star = (() => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.1 : 5; i ? sh.lineTo(r * Math.cos(a), r * Math.sin(a)) : sh.moveTo(r * Math.cos(a), r * Math.sin(a)); } return solidProp([[G.extrude(sh, 0.3).scale(0.012 * u, 0.012 * u, 0.012 * u), 0xffc020]], 0.7); })();
  const apple = solidProp([[G.sphere(0.05 * u), 0xe02830], [G.sphere(0.02 * u, 0.02 * u, 0.055 * u, 0, 1.4, 0.4, 0.7), 0x40a040]], 0.6), hrt = solidProp([[G.sphere(0.035 * u, -0.025 * u, 0.01 * u, 0), 0xff4a7a], [G.sphere(0.035 * u, 0.025 * u, 0.01 * u, 0), 0xff4a7a], [G.cone(0.05 * u, 0.06 * u, 0, -0.03 * u, 0, Math.PI), 0xff4a7a]], 0.6);
  const pics = [star, apple, hrt];
  group.add(p.group, book, cloud, ...pics);
  const loop = 5.4, hl = new THREE.Vector3(), hr = new THREE.Vector3(), head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.6, 5.0);
      p.reset().face(0.2); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.1; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 0.6; p.bone('head').rotation.x = 0.25 * (1 - between(v, 3.4, 3.8)); p.group.position.set(px, floor, 0.1 * u); p.update();
      bonePoint(p, 'handL', 0.6, hl); bonePoint(p, 'handR', 0.6, hr); bonePoint(p, 'head', 0.8, head);
      book.position.set((hl.x + hr.x) / 2, (hl.y + hr.y) / 2 + 0.05 * u, Math.max(hl.z, hr.z) + 0.03 * u); book.rotation.x = -0.5;
      const cx = head.x + 0.25 * u, cy = head.y + 0.35 * u, cv = pre ? 1 : timeline(v, { c: [0.2, 0.4, 'back'] }).c * (1 - out); cloud.visible = cv > 0.01; cloud.scale.setScalar(pop(cv)); cloud.position.set(cx, cy, 0.05 * u);
      pics.forEach((o, i) => { const f = pre ? 1 : between(v, 0.8 + 0.8 * i, 1.6 + 0.8 * i) * (1 - out), [x, y] = arc([book.position.x, book.position.y], [cx + (i - 1) * 0.12 * u, cy + 0.01 * u], 0.15 * u, f); o.visible = f > 0.01; o.position.set(x, y, 0.1 * u); o.scale.setScalar(pop(0.4 + 0.6 * f)); o.rotation.y = f < 1 ? v * 4 : 0.3 * Math.sin(t * 2 + i); });
    },
  };
}

function officeWork(ctx, spec, stage) {
  if (spec.outcome === 'class') return classBell(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.5 * u, TH = 0.34 * u;
  const desk = solidProp([[G.box(0.7 * u, 0.03 * u, 0.3 * u, 0, TH, 0), WOOD], [G.box(0.03 * u, TH, 0.26 * u, -0.32 * u, TH / 2, 0), 0x8a5a30], [G.box(0.03 * u, TH, 0.26 * u, 0.32 * u, TH / 2, 0), 0x8a5a30], [G.box(0.22 * u, 0.012 * u, 0.15 * u, -0.05 * u, TH + 0.022 * u, 0.04 * u), 0x8a8e96], [G.box(0.22 * u, 0.15 * u, 0.01 * u, -0.05 * u, TH + 0.1 * u, -0.04 * u, 0), 0x3a3a44], [G.box(0.2 * u, 0.13 * u, 0.012 * u, -0.05 * u, TH + 0.1 * u, -0.034 * u), 0x6ab8f0], [G.cyl(0.03 * u, 0.025 * u, 0.06 * u, 0.15 * u, TH + 0.045 * u, 0.06 * u), 0xffffff]], 0.4);
  desk.position.set(dx, floor, 0.1 * u);
  const papers = many([[G.box(0.14 * u, 0.008 * u, 0.18 * u, 0, 0, 0), 0xffffff]], 10, 0.5);
  const p = createPerson({ u: 0.9 * u, shirt: 0x5a6a8a });
  const cx = dx + 0.1 * u, cy = floor + 1.05 * u, face = solidProp([[G.cyl(0.11 * u, 0.11 * u, 0.02 * u, 0, 0, 0, Math.PI / 2, 0, 0, 24), 0xfaf6ea], [G.torus(0.11 * u, 0.012 * u), 0x3a3a44]], 0.5); face.position.set(cx, cy, -0.3 * u);
  const hand = (l, w) => { const g = new THREE.Group(), m = solidProp([[G.box(w, l, 0.006 * u, 0, l / 2, 0), 0x2a2a30]], 0.5); g.add(m); g.position.set(cx, cy, -0.285 * u); return g; }, hh = hand(0.06 * u, 0.012 * u), mh = hand(0.09 * u, 0.008 * u);
  group.add(desk, papers, p.group, face, hh, mh);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, n = pre ? 5 : Math.min(10, Math.floor(between(v, 0.3, 4.0) * 10)), out = between(v, 4.4, 4.9);
      for (let i = 0; i < 10; i++) papers.set(i, dx + 0.24 * u + 0.004 * u * Math.sin(i * 3), floor + TH + 0.02 * u + 0.009 * u * i, 0.12 * u, i < n ? 1 - out : 0, 0, 0.1 * Math.sin(i * 2)); papers.commit();
      p.reset().face(0); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.3; p.bone('foreL').rotation.x = 0.4 + 0.15 * Math.sin(v * 30); p.bone('foreR').rotation.x = 0.4 + 0.15 * Math.sin(v * 30 + 1.5); p.bone('head').rotation.x = 0.15;
      p.group.position.set(dx - 0.05 * u, floor - 0.1 * u, -0.15 * u); p.update();
      mh.rotation.z = pre ? -1 : -v * 6; hh.rotation.z = pre ? -2 : -v * 0.5 - 2;
    },
  };
}

export function answerCheck(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.35 * u, tx = kx + 0.6 * u;
  const kid = createPerson({ u: 0.6 * u, shirt: 0xf0a030 }), teacher = createPerson({ u: 0.95 * u, shirt: 0x40a080 });
  const bub = () => solidProp([[G.sphere(0.15 * u, 0, 0, 0, 1.3, 1, 0.35), 0xffffff], [G.cone(0.04 * u, 0.1 * u, -0.06 * u, -0.15 * u, 0, 0.5), 0xffffff]], 0.6);
  const bq = bub(), bk = bub(), q = emblemProp('question', 0.18 * u, { color: 0x3a7ad0 }), tick = emblemProp('check', 0.22 * u), star = burst(u, { s: 0.3, n: 5, color: 0xffd040 });
  group.add(kid.group, teacher.group, bq, bk, q, tick, star);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { q: [0.2, 0.3, 'back'], hand: [1.0, 0.25, 'back'], a: [1.4, 0.3, 'back'], nod: [2.0, 0.6], end: [4.4, 0.4] });
      const qa = pre ? 0 : T.q * (1 - T.a), an = pre ? 1 : T.a * (1 - T.end);
      teacher.reset().face(-0.8); teacher.bone('head').rotation.x = 0.3 * Math.sin(T.nod * Math.PI * 2); teacher.bone('armR').rotation.x = 0.8 * qa; teacher.group.position.set(tx, floor, 0.0); teacher.update();
      kid.reset().face(0.6); kid.raise('R', 2.9 * (pre ? 1 : T.hand * (1 - T.end))); kid.group.position.set(kx, floor + 0.04 * u * bump(v, 1.1, 0.4), 0.15 * u); kid.update();
      bq.visible = q.visible = qa > 0.01; bq.scale.setScalar(pop(qa)); bq.position.set(tx - 0.1 * u, floor + 1.15 * u, 0.0); q.scale.setScalar(pop(0.18 * u * qa)); q.position.set(tx - 0.1 * u, floor + 1.15 * u, 0.05 * u); q.idle(t);
      bk.visible = tick.visible = an > 0.01; bk.scale.setScalar(pop(an)); bk.position.set(kx + 0.05 * u, floor + 0.85 * u, 0.15 * u); tick.scale.setScalar(pop(0.22 * u * an)); tick.position.set(kx + 0.05 * u, floor + 0.85 * u, 0.2 * u);
      const s = pre ? 0 : bump(v, 2.2, 1.6); star.visible = s > 0; star.scale.setScalar(pop(s)); star.position.set(kx + 0.25 * u, floor + 1.05 * u, 0.2 * u); star.rotation.z = t * 2;
    },
  };
}

export const SCENES = { 'words-fly': wordsFly, 'boomerang-throw': boomerangThrow, 'memory-bubble': memoryBubble, 'office-work': officeWork };
