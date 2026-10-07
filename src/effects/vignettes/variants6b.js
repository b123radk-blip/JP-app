// Batch 6 word variants, part 2:
//   butler-door:hardhat    仕事: a worker in a yellow hard hat carries a plank past a traffic cone and hammers it down
//   hand-question:phone    答える: a phone rings and shakes; a person picks it up, holds it to their ear and answers (bubble)
//   devil-vase:thumbsdown  悪い: a big hand gives a thumbs down while a grumpy face frowns and a grey cloud drizzles
//   trunk-thick:crayon     太い: a thin pencil and a fat crayon draw side by side: a thin line, then a big thick one
//   words-fly:slam         辞書: a thick dictionary opens, pages fan, then it slams shut in a puff of dust
//   boomerang-throw:book   返す: a kid walks up to a library return box and slides a borrowed book back in; a ding
//   memory-bubble:cards    覚える: flashcards flip one after another; the last one flies into the kid's head and a bulb lights
//   office-work:class      授業: a classroom from behind the pupils' desks; the teacher writes on the board, then the bell rings
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, puffs } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

export function hardhat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, pu = 0.8 * u;
  const p = createPerson({ u: pu, shirt: 0xf08030, pants: 0x3a4a7a }), helmet = solidProp([[new THREE.SphereGeometry(0.14 * pu, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xffd020], [G.cyl(0.17 * pu, 0.17 * pu, 0.01 * pu, 0, 0, 0.02 * pu), 0xffd020]], 0.5);
  p.rig.attach('head', helmet, 0.62);
  const plank = solidProp([[G.box(0.5 * u, 0.04 * u, 0.1 * u, 0, 0, 0), 0xc89a60]], 0.35), cone = solidProp([[G.cone(0.06 * u, 0.18 * u, 0, 0.09 * u, 0), 0xff6a20], [G.cyl(0.05 * u, 0.055 * u, 0.025 * u, 0, 0.08 * u, 0), 0xffffff], [G.box(0.14 * u, 0.015 * u, 0.14 * u, 0, 0.0075 * u, 0), 0xff6a20]], 0.45);
  const hammer = solidProp([[G.box(0.02 * u, 0.16 * u, 0.02 * u, 0, -0.06 * u, 0), 0x8a5a30], [G.box(0.08 * u, 0.035 * u, 0.035 * u, 0, 0.02 * u, 0), 0x60646c]], 0.45);
  p.rig.attach('handR', hammer, 0.6);
  cone.position.set(B.maxX + 0.2 * u, floor, 0.2 * u);
  group.add(p.group, plank, cone);
  const loop = 5.2, hl = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.4], put: [1.5, 0.4], out: [4.6, 0.4] }), hit = v > 2.0 && v < 4.2 ? Math.max(0, Math.sin((v - 2.0) * 7)) : 0;
      p.reset().face(T.walk < 1 ? 'right' : 0).walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); p.bone('armL').rotation.x = 1.2 * (1 - T.put); if (T.put > 0) { p.lean(0.5 * T.put); p.bone('armR').rotation.x = 1.2 + 1.0 * hit; }
      p.group.position.set(lerp(px - 0.1 * u, px + 0.3 * u, T.walk), floor, 0.1 * u); p.group.scale.setScalar(pop(pre ? 1 : 1 - T.out)); p.update(); bonePoint(p, 'handL', 0.7, hl);
      plank.position.copy(T.put > 0 ? new THREE.Vector3(px + 0.3 * u, lerp(hl.y, floor + 0.02 * u, T.put), 0.3 * u) : hl.clone().add(new THREE.Vector3(0, 0.03 * u, 0.04 * u))); plank.scale.setScalar(pop(pre ? 1 : 1 - T.out));
    },
  };
}

export function phoneAnswer(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.35 * u, TH = 0.36 * u;
  const table = solidProp([[G.box(0.3 * u, 0.03 * u, 0.24 * u, 0, TH, 0), 0xc89a60], [G.cyl(0.03 * u, 0.04 * u, TH, 0, TH / 2, 0), 0x8a5a30]], 0.35); table.position.set(tx, floor, 0);
  const phone = solidProp([[G.box(0.06 * u, 0.11 * u, 0.012 * u, 0, 0, 0), 0x2a2a30], [G.box(0.05 * u, 0.09 * u, 0.014 * u, 0, 0, 0.001 * u), 0x60e0a0]], 0.6);
  const rings = many([[G.torus(0.06 * u, 0.006 * u), 0xffffff]], 3, 0.9), p = createPerson({ u: 0.85 * u, shirt: 0x9a60d0 }), bubble = solidProp([[G.sphere(0.14 * u, 0, 0, 0, 1.3, 1, 0.35), 0xffffff], [G.cone(0.04 * u, 0.1 * u, -0.06 * u, -0.14 * u, 0, 0.5), 0xffffff], ...[-0.06, 0, 0.06].map((x) => [G.sphere(0.018 * u, x * u, 0, 0.05 * u), 0x3a7ad0])], 0.6);
  group.add(table, phone, rings, p.group, bubble);
  const loop = 5.0, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { pick: [1.4, 0.4], talk: [1.9, 0.3, 'back'], down: [4.2, 0.4] }), ringing = !pre && v < 1.4, held = T.pick - T.down;
      p.reset().face(-0.6); p.bone('armR').rotation.x = 1.2 * T.pick * (1 - T.down) + 1.2 * held; p.bone('foreR').rotation.x = 1.6 * held; p.group.position.set(tx + 0.4 * u, floor, 0.1 * u); p.update(); bonePoint(p, 'handR', 0.7, hand);
      const rest = new THREE.Vector3(tx, floor + TH + 0.03 * u, 0.02 * u); phone.position.copy(held > 0.05 ? rest.clone().lerp(hand, Math.min(1, held * 1.3)) : rest); phone.rotation.x = held > 0.05 ? 0 : -Math.PI / 2; phone.rotation.z = ringing ? 0.15 * Math.sin(v * 40) : 0;
      for (let i = 0; i < 3; i++) { const g = ((v * 2 + i / 3) % 1); rings.set(i, rest.x, rest.y + 0.05 * u, rest.z, ringing ? 0.5 + 1.5 * g : 0, 0, Math.PI / 2); } rings.commit();
      const b = pre ? 0 : T.talk * (1 - T.down); bubble.visible = b > 0.01; bubble.scale.setScalar(pop(b)); bubble.position.set(tx + 0.55 * u, floor + 1.05 * u, 0.1 * u);
    },
  };
}

export function thumbsDown(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.35 * u, cy = B.cy;
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x8a96a8 }); hand.pose('thumbs');
  const face = emblemProp('frown', 0.32 * u, { color: 0x8a9ab0 }), cloud = solidProp([[G.sphere(0.1 * u, 0, 0, 0, 1.4, 0.8, 0.8), 0x7a8090], [G.sphere(0.07 * u, -0.1 * u, -0.02 * u, 0), 0x6a7080], [G.sphere(0.07 * u, 0.1 * u, -0.02 * u, 0), 0x6a7080]], 0.4), rain = many([[G.sphere(0.008 * u, 0, 0, 0, 0.6, 2.4, 0.6), 0x8ad0ff]], 6, 0.7);
  group.add(hand.group, face, cloud, rain);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, d = pre ? 1 : timeline(v, { d: [0.3, 0.4, 'back'], u: [3.8, 0.4] }), down = d.d - d.u;
      hand.group.rotation.set(0, 0, Math.PI * down + 0.15 * Math.sin(v * 6) * down); hand.group.position.set(cx, cy + 0.1 * u * (1 - down), 0.08 * u); hand.update();
      face.position.set(cx + 0.42 * u, cy - 0.05 * u, 0.05 * u); face.scale.setScalar(0.32 * u * (0.6 + 0.4 * down)); face.idle(t);
      cloud.position.set(cx + 0.42 * u, cy + 0.38 * u, 0.0); cloud.visible = down > 0.3;
      for (let i = 0; i < 6; i++) { const g = ((t * 1.4 + i / 6) % 1); rain.set(i, cx + 0.34 * u + 0.03 * u * i, cy + 0.3 * u - 0.35 * u * g, 0.0, down > 0.3 ? 1 : 0); } rain.commit();
    },
  };
}

export function pencilCrayon(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), x0 = B.maxX + 0.15 * u, y1 = B.cy + 0.15 * u, y2 = B.cy - 0.15 * u, N = 18;
  const tool = (r, c, tip) => solidProp([[G.cyl(r, r, 0.3 * u, 0, 0.19 * u, 0, 0, 0, 0, 12), c], [G.cone(r, 0.05 * u, 0, 0.02 * u, 0, Math.PI), tip]], 0.45);
  const pencil = tool(0.012 * u, 0xffd040, 0x2a2a30), crayon = tool(0.045 * u, 0x3a7ad0, 0x3a7ad0);
  const thin = many([[G.sphere(0.013 * u, 0, 0, 0, 1, 1, 0.3), 0x2a2a30]], N, 0.3), fat = many([[G.sphere(0.035 * u, 0, 0, 0, 1, 1, 0.3), 0x3a7ad0]], N, 0.6);
  group.add(pencil, crayon, thin, fat);
  const loop = 4.6, L = 0.75 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, a = pre ? 1 : between(v, 0.3, 1.5), b = pre ? 1 : between(v, 1.8, 3.0), out = between(v, 4.0, 4.4);
      for (let i = 0; i < N; i++) { const s = i / (N - 1); thin.set(i, x0 + L * s, y1, 0, s <= a ? 1 - out : 0); fat.set(i, x0 + L * s, y2, 0, s <= b ? 1 - out : 0); }
      thin.commit(); fat.commit();
      pencil.position.set(x0 + L * a, y1, 0.03 * u); pencil.rotation.z = -0.5; crayon.position.set(x0 + L * b, y2, 0.05 * u); crayon.rotation.z = -0.5;
    },
  };
}

export function bookSlam(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.4 * u, W = 0.24 * u;
  const base = solidProp([[G.box(W, 0.1 * u, 0.32 * u, W / 2, 0.05 * u, 0), 0xfaf6ea], [G.box(W, 0.012 * u, 0.33 * u, W / 2, 0.0, 0), 0x6a2a2a], [G.box(0.03 * u, 0.12 * u, 0.33 * u, 0, 0.05 * u, 0), 0x6a2a2a]], 0.45);
  const lid = new THREE.Group(), lidM = solidProp([[G.box(W, 0.06 * u, 0.32 * u, -W / 2, 0.03 * u, 0), 0xfaf6ea], [G.box(W, 0.012 * u, 0.33 * u, -W / 2, 0.065 * u, 0), 0x6a2a2a], [G.box(W * 0.5, 0.004 * u, 0.06 * u, -W / 2, 0.072 * u, 0), 0xffd040]], 0.45); lid.add(lidM);
  const book = new THREE.Group(); book.add(base, lid); lid.position.set(0, 0.1 * u, 0); book.position.set(bx, floor, 0); book.rotation.x = 0.35;
  const dust = many(PUFF(u), 6, 0.4);
  group.add(book, dust);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.2, 0.6, 'out'], slam: [2.2, 0.18, 'in'] }), o = pre ? 0 : T.open - T.slam;
      lid.rotation.z = -Math.PI * o + 0.08 * Math.sin(v * 18) * (v > 0.9 && v < 2.1 ? 1 : 0);
      book.position.y = floor + 0.02 * u * bump(v, 2.38, 0.2);
      puffs(dust, 0, 6, bx + W / 2, floor, between(v, 2.38, 3.0), u, 0.4); dust.commit();
    },
  };
}

export function bookReturn(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.8 * u, BH = 0.55 * u;
  const box = solidProp([[G.box(0.34 * u, BH, 0.3 * u, 0, BH / 2, 0), 0x3a6ad8], [G.box(0.24 * u, 0.04 * u, 0.01 * u, 0, BH - 0.12 * u, 0.151 * u), 0x1a1a24], [G.box(0.26 * u, 0.08 * u, 0.01 * u, 0, BH - 0.25 * u, 0.152 * u), 0xffffff], [G.box(0.06 * u, 0.04 * u, 0.012 * u, -0.05 * u, BH - 0.25 * u, 0.154 * u), 0xe04848]], 0.4);
  box.position.set(bx, floor, -0.05 * u);
  const book = solidProp([[G.box(0.18 * u, 0.03 * u, 0.13 * u, 0, 0, 0), 0x60c060], [G.box(0.17 * u, 0.032 * u, 0.12 * u, 0.005 * u, 0, 0), 0xffffff]], 0.45), kid = createPerson({ u: 0.6 * u, shirt: 0xe07ab0 }), ding = burst(u, { s: 0.2, n: 6, color: 0xffe040 });
  group.add(box, book, kid.group, ding);
  const loop = 5.0, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.4], lift: [1.5, 0.4], slide: [2.0, 0.4, 'in'], bow: [2.6, 0.5], up: [3.3, 0.4], back: [4.4, 0.4] });
      kid.reset().face(T.walk < 1 ? 'right' : 0.4).walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); kid.bone('armR').rotation.x = 0.8 + 1.4 * T.lift * (1 - T.bow); kid.lean(0.5 * (T.bow - T.up));
      kid.group.position.set(lerp(B.maxX + 0.1 * u, bx - 0.32 * u, T.walk), floor, 0.15 * u); kid.group.scale.setScalar(pop(pre ? 1 : 1 - T.back * 0.999)); kid.update(); bonePoint(kid, 'handR', 0.7, hand);
      const slot = new THREE.Vector3(bx, floor + BH - 0.12 * u, 0.16 * u); book.visible = (pre || T.slide < 1) || T.back > 0; book.position.copy(T.slide > 0 ? hand.clone().lerp(slot, T.slide) : hand); book.position.z += 0.04 * u; book.rotation.set(0, 0, T.slide * 0.0); book.scale.setScalar(pop(T.back > 0 ? T.back : 1 - 0.6 * T.slide));
      const d = pre ? 0 : bump(v, 2.4, 0.8); ding.visible = d > 0; ding.scale.setScalar(pop(d)); ding.position.set(bx + 0.15 * u, floor + BH + 0.1 * u, 0.1 * u);
    },
  };
}

export function flashcards(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.3 * u, cy = B.cy, kx = cx + 0.55 * u;
  const card = (c) => { const g = new THREE.Group(), m = solidProp([[G.box(0.2 * u, 0.14 * u, 0.008 * u, 0, 0, 0), 0xffffff], [G.sphere(0.04 * u, 0, 0, 0.006 * u, 1, 1, 0.2), c], [G.box(0.18 * u, 0.12 * u, 0.004 * u, 0, 0, -0.006 * u), 0xffe8a0]], 0.55); g.add(m); return g; };
  const cards = [card(0xe04848), card(0x40a0e0), card(0x60c060)], kid = createPerson({ u: 0.7 * u, shirt: 0x40a080 }), bulb = emblemProp('lightbulb', 0.25 * u);
  group.add(...cards, kid.group, bulb);
  const loop = 5.0, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.4, 4.9);
      kid.reset().face(-0.6); kid.group.position.set(kx, floor, 0.1 * u); kid.update(); bonePoint(kid, 'head', 0.6, head);
      cards.forEach((c, i) => { const flip = pre ? 1 : between(v, 0.3 + 0.6 * i, 0.6 + 0.6 * i), fly = i === 2 ? between(v, 2.3, 2.9) : 0, [x, y] = arc([cx, cy + (1 - i) * 0.04 * u], [head.x, head.y], 0.2 * u, fly);
        c.position.set(x, y, 0.05 * u + 0.01 * u * i); c.rotation.y = Math.PI * (1 - flip); c.scale.setScalar(pop((1 - 0.8 * fly) * (1 - out))); c.visible = fly < 0.98 && (i < 2 ? v < 2.3 + 0.2 * i || pre : true); });
      const b = pre ? 0 : timeline(v, { b: [2.9, 0.3, 'back'] }).b * (1 - out); bulb.visible = b > 0.01; bulb.scale.setScalar(pop(0.25 * u * b)); bulb.position.set(head.x, head.y + 0.25 * u, head.z); bulb.idle(t);
    },
  };
}

export function classBell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.78 * u;
  const board = solidProp([[G.box(0.7 * u, 0.36 * u, 0.02 * u, 0, 0, 0), 0x1f4a32], [G.box(0.74 * u, 0.03 * u, 0.04 * u, 0, -0.19 * u, 0.01 * u), 0x8a5a30]], 0.35); board.position.set(cx, floor + 0.75 * u, -0.6 * u);
  const lines = many([[G.box(0.4 * u, 0.012 * u, 0.004 * u, 0, 0, 0), 0xffffff]], 3, 0.8), teacher = createPerson({ u: 0.8 * u, shirt: 0x40a080 });
  const desks = solidProp([-0.25, 0.25].flatMap((x) => [[G.box(0.24 * u, 0.02 * u, 0.16 * u, x * u, 0.26 * u, 0), 0xc89a60], [G.box(0.02 * u, 0.26 * u, 0.02 * u, x * u, 0.13 * u, 0.06 * u), 0x60646c]]), 0.35); desks.position.set(cx, floor, 0.25 * u);
  const kids = [createPerson({ u: 0.5 * u, shirt: 0xe04848 }), createPerson({ u: 0.5 * u, shirt: 0x3a7ad0 })], bell = emblemProp('alarm', 0.2 * u, { color: 0xffd040 }), rings = many([[G.torus(0.05 * u, 0.006 * u), 0xffe060]], 3, 0.9);
  group.add(board, lines, teacher.group, desks, ...kids.map((k) => k.group), bell, rings);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 1 : between(v, 0.3, 2.6), ring = !pre && v > 2.9 && v < 4.2;
      for (let i = 0; i < 3; i++) { const f = between(w, i / 3, (i + 1) / 3); lines.set(i, cx - 0.2 * u * (1 - f), floor + 0.84 * u - 0.08 * u * i, -0.585 * u, f > 0.01 && v < 4.6 ? 1 : 0); } lines.commit();
      teacher.reset().face(w < 1 ? Math.PI - 0.5 : 0.2); teacher.bone('armR').rotation.x = w < 1 ? 2.2 + 0.1 * Math.sin(v * 15) : 0; teacher.group.position.set(cx + 0.1 * u + 0.25 * u * w, floor, -0.45 * u); teacher.update();
      kids.forEach((k, i) => { k.reset().face(Math.PI); if (ring) k.raise(i ? 'L' : 'R', 2.6); k.group.position.set(cx + (i ? 0.25 : -0.25) * u, floor + (ring ? 0.03 * u * Math.abs(Math.sin(v * 10 + i)) : 0), 0.4 * u); k.update(); });
      bell.position.set(cx + 0.45 * u, floor + 1.05 * u, -0.55 * u); bell.rotation.z = ring ? 0.2 * Math.sin(v * 40) : 0; bell.idle(t);
      for (let i = 0; i < 3; i++) { const g = ((v * 2 + i / 3) % 1); rings.set(i, cx + 0.45 * u, floor + 1.05 * u, -0.5 * u, ring ? 0.5 + 2 * g : 0); } rings.commit();
    },
  };
}
