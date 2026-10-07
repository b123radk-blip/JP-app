// Batch 5 word variants, part 1 (same scene type as their kanji, another `outcome`):
//   flower-gasp:yum      美味しい: a person bites a rice ball twice; cheeks glow, hearts and sparkles, then a happy fist pump
//   face-change:laugh    面白い: a person reading a book shakes with laughter (ハハ), falls over backwards and rolls, kicking
//   apple-sell:sold      売る: a TV on a stand with a price tag; a big red SOLD stamp slams onto it; the seller cheers
//   curtain-close:open   始まる: red curtains part on a little stage, the spotlight comes up, the actor waves hello; confetti
//   move-in:crab         住む: a hermit crab scuttles up to an empty shell, climbs in and peeks out of its new home; a heart
//   sick-bed:germs       病気: green spiky germs bounce around a pale person who sneezes and shivers
//   ambulance:doctor     病院: under a red-cross sign a doctor listens to a kid's chest (heartbeat rings) and puts on a plaster
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, stars, heart, burst, PUFF, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, puffs } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

export function yum(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u, pu = 0.85 * u;
  const p = createPerson({ u: pu, shirt: 0xf0a030 }), ball = solidProp([[G.cone(0.09 * u, 0.13 * u, 0, 0, 0), 0xffffff], [G.box(0.08 * u, 0.05 * u, 0.04 * u, 0, -0.04 * u, 0.012 * u), 0x1a3020]], 0.5);
  const cheeks = many([[G.sphere(0.03 * pu, 0, 0, 0, 1.3, 0.8, 0.4), 0xff7a9a]], 2, 0.8), hearts = many(HEART(u, 0.1), 4, 0.8), shine = stars(u, { r: 0.25, s: 0.07, n: 5, color: 0xfff0a0 });
  group.add(p.group, ball, cheeks, hearts, shine);
  const loop = 5.0, hand = new THREE.Vector3(), head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, bite = Math.max(bump(v, 0.3, 0.5), bump(v, 1.0, 0.5)), joy = pre ? 0 : between(v, 1.5, 1.8) * (1 - between(v, 4.3, 4.7)), pump = joy > 0.5 ? Math.max(0, Math.sin((v - 1.8) * 6)) : 0;
      p.reset().face(0.3); p.bone('armR').rotation.x = 1.4 + 0.6 * bite; p.bone('foreR').rotation.x = 1.0 + 0.6 * bite; p.raise('L', joy * (2.0 + 0.6 * pump)); p.bone('foreL').rotation.z = 1.2 * joy;
      p.group.position.set(px, floor + 0.05 * u * pump, 0.1 * u); p.update(); bonePoint(p, 'handR', 0.7, hand); bonePoint(p, 'head', 0.5, head);
      const left = pre ? 1 : 1 - 0.3 * between(v, 0.5, 0.7) - 0.3 * between(v, 1.2, 1.4); ball.position.set(hand.x, hand.y + 0.06 * u, hand.z + 0.04 * u); ball.scale.set(1, pop(left), 1);
      for (let i = 0; i < 2; i++) cheeks.set(i, head.x + (i ? 0.07 : -0.07) * pu, head.y - 0.03 * pu, head.z + 0.11 * pu, joy); cheeks.commit();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.6 + i / 4) % 1 + 1) % 1; hearts.set(i, head.x + (i - 1.5) * 0.12 * u, head.y + 0.15 * u + 0.3 * u * f, head.z, joy * Math.sin(Math.PI * f)); } hearts.commit();
      shine.visible = joy > 0.01; shine.scale.setScalar(pop(joy)); shine.position.copy(head); shine.rotation.y = t * 2;
    },
  };
}

export function laugh(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, pu = 0.8 * u, hip = 0.39 * pu;
  const p = createPerson({ u: pu, shirt: 0x60b060 }), pivot = new THREE.Group(); pivot.add(p.group); p.group.position.y = -hip;
  const book = solidProp([[G.box(0.2 * u, 0.14 * u, 0.03 * u, 0, 0, 0), 0xe04848], [G.box(0.19 * u, 0.13 * u, 0.032 * u, 0, 0, 0.001 * u), 0xffffff]], 0.45);
  const ha = [textPlane('ハハ', { h: 0.14 * u, color: '#ffe060', bg: null }), textPlane('ハハハ', { h: 0.12 * u, color: '#ffe060', bg: null })], tears = many([[G.sphere(0.015 * u), 0x7fd0ff]], 4, 0.8);
  group.add(pivot, book, ...ha, tears);
  const loop = 5.4, hl = new THREE.Vector3(), hr = new THREE.Vector3(), head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { shake: [0.8, 0.4], fall: [1.9, 0.5, 'in'], up: [4.2, 0.6] }), fall = T.fall - T.up, roll = fall > 0.95 ? Math.sin(v * 7) : 0, shake = T.shake * (1 - T.up) * Math.sin(v * 30) * 0.04;
      p.reset().face(0); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.1 * (1 - fall); p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 0.7 * (1 - fall);
      if (fall > 0.5) { p.bone('legL').rotation.x = 1.0 + 0.4 * roll; p.bone('legR').rotation.x = 1.0 - 0.4 * roll; p.raise('L', 1.2); p.raise('R', 1.2); p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.6; }
      pivot.position.set(px + 0.03 * u * roll, floor + hip * (1 - 0.75 * fall), 0.1 * u); pivot.rotation.set(-1.4 * fall, 0, shake + 0.25 * roll); p.update();
      pivot.updateMatrix(); bonePoint(p, 'handL', 0.6, hl).applyMatrix4(pivot.matrix); bonePoint(p, 'handR', 0.6, hr).applyMatrix4(pivot.matrix);
      book.visible = fall < 0.3; book.position.set((hl.x + hr.x) / 2, (hl.y + hr.y) / 2 + 0.04 * u, Math.max(hl.z, hr.z) + 0.03 * u); book.rotation.x = -0.4;
      bonePoint(p, 'head', 0.6, head).applyMatrix4(pivot.matrix);
      ha.forEach((h, i) => { const b = pre ? 0 : bump(v, 1.0 + 0.9 * i, 2.4); h.visible = b > 0; h.scale.setScalar(pop(Math.min(1, b * 2))); h.position.set(px + (i ? 0.35 : -0.05) * u, floor + (0.9 + 0.12 * i) * u + 0.03 * u * Math.sin(v * 12), 0.15 * u); });
      for (let i = 0; i < 4; i++) { const f = ((v * 1.5 + i / 4) % 1); tears.set(i, head.x + (i % 2 ? 0.1 : -0.1) * u * (1 + f), head.y + 0.05 * u * Math.sin(Math.PI * f), head.z + 0.05 * u, T.shake > 0.5 && T.up < 0.5 ? 1 - f : 0); } tears.commit();
    },
  };
}

export function soldStamp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.4 * u;
  const tv = solidProp([[G.box(0.2 * u, 0.3 * u, 0.2 * u, 0, 0.15 * u, 0), 0xc89a60], [G.box(0.36 * u, 0.26 * u, 0.1 * u, 0, 0.45 * u, 0), 0x2a2a30], [G.box(0.31 * u, 0.21 * u, 0.004 * u, 0, 0.45 * u, 0.052 * u), 0x4a9ad8], [G.box(0.12 * u, 0.06 * u, 0.006 * u, 0.12 * u, 0.24 * u, 0.103 * u), 0xffffff], [G.box(0.08 * u, 0.015 * u, 0.008 * u, 0.12 * u, 0.24 * u, 0.106 * u), 0xe04848]], 0.4);
  tv.position.set(tx, floor, 0);
  const stamp = textPlane('SOLD', { h: 0.18 * u, color: '#e02020', bg: '#ffffff' }), seller = createPerson({ u: 0.8 * u, shirt: 0x40a0e0 });
  group.add(tv, stamp, seller.group);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { slam: [0.8, 0.25, 'in'], off: [4.0, 0.4] }), s = pre ? 1 : T.slam * (1 - T.off);
      stamp.visible = s > 0.01; stamp.position.set(tx, floor + 0.45 * u, 0.12 * u + 0.4 * u * (1 - s)); stamp.rotation.z = 0.25; stamp.scale.setScalar(pop((pre ? 1 : 1 + 1.5 * (1 - T.slam)) * (1 - T.off)) * (1 + 0.15 * bump(v, 1.05, 0.25)));
      const cheer = pre ? 0 : bump(v, 1.2, 2.4); seller.reset().face(-0.5); seller.raise('L', 2.8 * cheer); seller.raise('R', 2.8 * cheer); seller.group.position.set(tx + 0.5 * u, floor + 0.05 * u * Math.abs(Math.sin(v * 7)) * cheer, 0.1 * u); seller.update();
    },
  };
}

export function curtainOpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u, W = 0.9 * u, H = 0.8 * u;
  const stageBox = solidProp([[G.box(W, 0.12 * u, 0.4 * u, 0, 0.06 * u, 0), 0x8a5a30], [G.box(W, H, 0.02 * u, 0, 0.12 * u + H / 2, -0.2 * u), 0x1a1028], [G.box(W + 0.12 * u, 0.1 * u, 0.06 * u, 0, 0.12 * u + H, 0.17 * u), 0xc02030], [G.box(0.06 * u, H, 0.06 * u, -W / 2 - 0.03 * u, 0.12 * u + H / 2, 0.17 * u), 0xc02030], [G.box(0.06 * u, H, 0.06 * u, W / 2 + 0.03 * u, 0.12 * u + H / 2, 0.17 * u), 0xc02030]], 0.35);
  stageBox.position.set(sx, floor, -0.1 * u);
  const curtain = () => solidProp([[G.box(1, H - 0.02 * u, 0.02 * u, 0.5, 0.12 * u + H / 2, 0), 0xd02838], ...[0.2, 0.45, 0.7].map((x) => [G.box(0.03, H - 0.02 * u, 0.025 * u, x, 0.12 * u + H / 2, 0.002 * u), 0xa01828])], 0.45);
  const cL = curtain(), cR = curtain(); cR.rotation.y = Math.PI;
  const spot = solidProp([[G.cyl(0.18 * u, 0.18 * u, 0.004 * u, 0, 0, 0, 0, 0, 0, 24), 0xfff4c0]], 1.0), actor = createPerson({ u: 0.55 * u, shirt: 0x40c8c8 }), conf = many([[G.box(0.02 * u, 0.012 * u, 0.004 * u, 0, 0, 0), 0xffffff]], 12, 0.8);
  [0xff6a9a, 0xffe040, 0x40c8f0, 0x60e080].forEach((c, i) => { for (let j = i; j < 12; j += 4) conf.setColorAt(j, new THREE.Color(c)); });
  group.add(stageBox, spot, actor.group, cL, cR, conf);
  const loop = 5.0, top = floor + 0.12 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.4, 1.0, 'out'], close: [4.3, 0.6, 'in'] }), o = pre ? 0 : T.open - T.close;
      const half = W / 2, w = lerp(half, 0.1 * u, o); cL.position.set(sx - half, floor, 0.1 * u); cL.scale.x = w; cR.position.set(sx + half, floor, 0.1 * u); cR.scale.x = w;
      const wave = bump(v, 1.4, 1.6), bow = bump(v, 3.0, 0.8); actor.reset().face(0); actor.raise('R', 2.6 * wave + 0.3 * Math.sin(v * 10) * wave); actor.lean(0.7 * bow); actor.group.position.set(sx, top, 0.0); actor.update();
      spot.position.set(sx, top + 0.002 * u, 0.0); spot.scale.setScalar(pop(o));
      for (let i = 0; i < 12; i++) { const f = ((v * 0.5 + i / 12) % 1 + 1) % 1; conf.set(i, sx + (((i * 37) % 11) / 11 - 0.5) * W * 0.8, top + H - (H - 0.1 * u) * f, 0.05 * u, o > 0.9 ? 1 : 0, v * 3 + i, v * 2); } conf.commit();
    },
  };
}

export function crabShell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.45 * u;
  const shellG = new THREE.Group(), shell = solidProp([[G.cone(0.13 * u, 0.3 * u, 0, 0.0, 0, Math.PI / 2 + 0.3), 0xf0d0a0], [G.torus(0.1 * u, 0.025 * u, Math.PI * 2, -0.02 * u, 0.0, 0.0, 0), 0xe0b080], [G.torus(0.06 * u, 0.02 * u, Math.PI * 2, 0.06 * u, 0.02 * u, 0.0, 0), 0xe0b080]], 0.45);
  shell.rotation.y = 0.4; shellG.add(shell);
  const crab = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1.3, 0.7, 1), 0xe04030], [G.sphere(0.035 * u, -0.1 * u, 0.02 * u, 0.04 * u, 1.2, 0.8, 0.8), 0xe04030], [G.sphere(0.035 * u, -0.1 * u, 0.02 * u, -0.04 * u, 1.2, 0.8, 0.8), 0xe04030], [G.cyl(0.006 * u, 0.006 * u, 0.06 * u, -0.03 * u, 0.06 * u, 0.02 * u), 0xe04030], [G.cyl(0.006 * u, 0.006 * u, 0.06 * u, -0.03 * u, 0.06 * u, -0.02 * u), 0xe04030], [G.sphere(0.015 * u, -0.03 * u, 0.095 * u, 0.02 * u), 0x1a1a24], [G.sphere(0.015 * u, -0.03 * u, 0.095 * u, -0.02 * u), 0x1a1a24]], 0.5);
  const hrt = heart(u, { s: 0.13 });
  group.add(shellG, crab, hrt);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.2], in: [1.4, 0.4, 'in'], move: [2.2, 1.0], out: [4.3, 0.4] });
      const inside = T.in > 0.5, x0 = sx + 0.6 * u, cx = lerp(x0, sx + 0.12 * u, T.walk) - 0.12 * u * T.in;
      shellG.position.set(sx + 0.15 * u * T.move, floor + 0.08 * u + 0.01 * u * Math.abs(Math.sin(v * 10)) * (T.move > 0 && T.move < 1 ? 1 : 0), 0.05 * u);
      crab.position.set(inside ? shellG.position.x - 0.13 * u : cx, floor + 0.05 * u + (T.walk < 1 ? 0.01 * u * Math.abs(Math.sin(v * 14)) : 0), 0.05 * u); crab.rotation.y = 0; crab.scale.setScalar(pop((inside ? 0.7 : 1) * (pre ? 1 : 1 - T.out)));
      const h = pre ? 0 : bump(v, 3.0, 1.4); hrt.visible = h > 0; hrt.scale.setScalar(pop(h)); hrt.position.set(shellG.position.x, floor + 0.4 * u + 0.1 * u * h, 0.05 * u);
    },
  };
}

export function germs(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, pu = 0.85 * u;
  const p = createPerson({ u: pu, shirt: 0x9ad0f0, skin: 0xd8e8b8 }), N = 7;
  const GERM = [[G.sphere(0.05 * u), 0x60c040], ...Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return [G.cone(0.015 * u, 0.04 * u, Math.cos(a) * 0.055 * u, Math.sin(a) * 0.055 * u, 0, a - Math.PI / 2), 0x60c040]; }), [G.sphere(0.012 * u, -0.015 * u, 0.012 * u, 0.045 * u), 0x1a1a24], [G.sphere(0.012 * u, 0.015 * u, 0.012 * u, 0.045 * u), 0x1a1a24]];
  const bugs = many(GERM, N, 0.6), achoo = many(PUFF(u, 0xe0f0e0), 6, 0.5);
  group.add(p.group, bugs, achoo);
  const loop = 4.8, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, sneeze = pre ? 0 : bump(v, 1.8, 0.5), shiver = 0.03 * Math.sin(t * 28);
      p.reset().face(-0.3); p.lean(-0.3 * sneeze + 0.5 * bump(v, 2.1, 0.4)); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 0.6; p.bone('armL').rotation.z = -0.5; p.bone('armR').rotation.z = 0.5; p.group.rotation.z = shiver; p.group.position.set(px, floor, 0.1 * u); p.update(); bonePoint(p, 'head', 0.5, head);
      for (let i = 0; i < N; i++) { const a = t * (1.2 + 0.2 * i) + i * 1.9, r = (0.3 + 0.08 * (i % 3)) * u; bugs.set(i, px + Math.cos(a) * r, floor + 0.5 * u + Math.sin(a * 1.3) * 0.35 * u + 0.05 * u * Math.abs(Math.sin(t * 6 + i)), 0.15 * u + Math.sin(a) * 0.1 * u, pre ? 0.8 : 1, Math.sin(t * 3 + i)); }
      bugs.commit();
      puffs(achoo, 0, 6, head.x - 0.1 * u, head.y, between(v, 2.0, 2.6), u, 0.35); achoo.commit();
    },
  };
}

export function doctor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.35 * u, kx = dx + 0.42 * u;
  const sign = solidProp([[G.box(0.36 * u, 0.36 * u, 0.02 * u, 0, 0, 0), 0xffffff], [G.box(0.24 * u, 0.07 * u, 0.024 * u, 0, 0, 0), 0xe02020], [G.box(0.07 * u, 0.24 * u, 0.024 * u, 0, 0, 0), 0xe02020]], 0.6);
  sign.position.set(dx + 0.2 * u, floor + 1.05 * u, -0.3 * u);
  const doc = createPerson({ u: 0.95 * u, shirt: 0xffffff, pants: 0x5a6a8a }), kid = createPerson({ u: 0.6 * u, shirt: 0xf0a030 });
  const scope = solidProp([[G.torus(0.08 * u, 0.008 * u, Math.PI, 0, 0, 0, Math.PI), 0x3a3a44], [G.cyl(0.02 * u, 0.02 * u, 0.012 * u, 0, -0.16 * u, 0.01 * u, Math.PI / 2), 0xc8ccd4]], 0.4);
  doc.rig.attach('body', scope, 0.85).position.z = 0.1 * 0.95 * u;
  const beat = many([[G.torus(0.04 * u, 0.006 * u), 0xff6a8a]], 3, 0.9), plaster = solidProp([[G.box(0.06 * u, 0.025 * u, 0.012 * u, 0, 0, 0), 0xffd0b0], [G.box(0.02 * u, 0.026 * u, 0.014 * u, 0, 0, 0), 0xe8b090]], 0.6);
  kid.rig.attach('armL', plaster, 0.5).position.z = 0.04 * u;
  group.add(sign, doc.group, kid.group, beat, plaster);
  const loop = 5.0, chest = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, listen = pre ? 0 : bump(v, 0.3, 2.0), stick = pre ? 0 : between(v, 2.6, 2.9) * (1 - between(v, 4.5, 4.9));
      doc.reset().face(0.9); doc.lean(0.25 * listen); doc.bone('armL').rotation.x = 1.4 * listen + 1.2 * bump(v, 2.4, 0.8); doc.group.position.set(dx, floor, 0.05 * u); doc.update();
      kid.reset().face(-0.8); kid.raise('L', 0.5 * stick); kid.group.position.set(kx, floor, 0.15 * u); kid.update(); bonePoint(kid, 'body', 0.6, chest);
      for (let i = 0; i < 3; i++) { const f = ((v * 1.4 + i / 3) % 1); beat.set(i, chest.x, chest.y, chest.z + 0.06 * u, listen > 0.3 ? 0.5 + 1.5 * f : 0); } beat.commit();
      plaster.visible = stick > 0.5;
    },
  };
}
