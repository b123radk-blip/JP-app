// Step 1 scenes, part E: talking, hiding, big things, going outside.
//   chat-table   話: two people sit at a little table and talk: speech bubbles pop up from one, then the other, heads
//                nodding, hands moving. outcome phone: one person talks and talks with big hand gestures, bubbles of
//                squiggles floating up one after another (話す)
//   peek-behind  後: a kid hides behind the kanji; they peek out round its side, duck back, then peek over the top and
//                giggle. outcome sneak: a person stands looking ahead while a cat creeps up behind them; they spin round,
//                "!" (後ろ)
//   grow-big     大: the kanji swells up huge; a tiny mouse at its foot looks up and up, "!"; it shrinks back. outcome
//                elephant: a huge elephant beside a tiny mouse raises its trunk and trumpets (大きい); whale: a huge whale
//                surfaces beside a little boat and spouts (大きな)
//   adult-kid    大人: a tall grown-up with a briefcase stands next to a small kid, who stretches up on tiptoe and still
//                only reaches their waist; the grown-up pats their head
//   house-out    外: a little house; its door swings open, a dog bounds out into the yard and the door shuts behind it; the
//                dog sniffs a flower and wags in the open air
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs } from './helpers.js';
import { grow } from './step1-kit.js';
import { sit } from './step1-d.js';
import { dogParts } from './step1-a.js';

// a speech bubble (white oval with a tail) carrying a few dots or squiggles; origin at its middle
const bubble = (u, w = 0.36, mark = 0x606878) => solidProp([[G.sphere(0.5 * u, 0, 0, 0, w, 0.36, 0.1), 0xffffff], [G.cone(0.04 * u, 0.1 * u, -0.08 * u, -0.17 * u, 0, 2.6), 0xffffff], ...[-1, 0, 1].map((i) => [G.sphere(0.025 * u, i * 0.07 * u, 0, 0.04 * u), mark])], 0.9);
const squiggle = (u, color) => solidProp([[G.sphere(0.5 * u, 0, 0, 0, 0.36, 0.22, 0.06), 0xffffff], [G.tube(Array.from({ length: 9 }, (_, i) => [(-0.11 + i * 0.0275) * u, 0.03 * u * Math.sin(i * 1.6)]), 0.012 * u).translate(0, 0, 0.035 * u), color]], 0.9);

// ---- 話 talk ----
function chatTable(ctx, spec, stage) {
  if (spec.outcome === 'phone') return talkTalk(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.7 * u;
  const table = solidProp([[G.cyl(0.22 * u, 0.22 * u, 0.03 * u, 0, 0.36 * u, 0), 0xc89a60], [G.cyl(0.03 * u, 0.03 * u, 0.36 * u, 0, 0.18 * u, 0), 0x8a5a30], [G.cyl(0.05 * u, 0.04 * u, 0.06 * u, 0.05 * u, 0.41 * u, 0), 0xf4efe6]], 0.35);
  const A1 = createPerson({ u: 0.85 * u, shirt: 0x4aa0e0 }), A2 = createPerson({ u: 0.85 * u, shirt: 0xe06a8a, hair: 0x6a3a1a }), b1 = bubble(u), b2 = bubble(u, 0.36, 0xe04860);
  table.position.set(tx, floor, -0.05 * u);
  group.add(table, A1.group, A2.group, b1, b2);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const talk1 = pre ? 0 : bump(v, 0.3, 1.8) + bump(v, 3.9, 1.4), talk2 = pre ? 0 : bump(v, 2.0, 1.8);
      [[A1, -1, talk1, talk2], [A2, 1, talk2, talk1]].forEach(([p, s, me, them]) => {
        p.reset().face(s < 0 ? 'right' : 'left'); sit(p, 1);
        p.group.position.set(tx + s * 0.36 * u, floor + 0.36 * u - 0.32 * u, 0.0);
        p.bone('head').rotation.x = -0.15 * me * Math.abs(Math.sin(v * 8)) + 0.15 * them * Math.abs(Math.sin(v * 3));
        p.bone(`armR`).rotation.x = 1.0 + 0.5 * me * Math.sin(v * 7); p.bone('foreR').rotation.x = 0.6; p.bone('armL').rotation.x = 0.6;
        p.update();
      });
      [[b1, -1, talk1], [b2, 1, talk2]].forEach(([b, s, k]) => { b.visible = k > 0.05; b.scale.setScalar(grow(Math.min(1, k * 2))); b.position.set(tx + s * 0.42 * u + s * 0.05 * u, floor + 0.98 * u + 0.02 * u * Math.sin(v * 4), 0.08 * u); b.rotation.y = s > 0 ? Math.PI : 0; });
    },
  };
}
function talkTalk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u, shirt: 0x40b080 }), bs = [0x3a7ae0, 0xe04860, 0x40a040].map((c) => squiggle(u, c));
  group.add(p.group, ...bs);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.reset().face(0.5); p.group.position.set(px, floor, 0.02 * u);
      const g = pre ? 0 : 1;
      p.raise('L', g * (0.6 + 0.5 * Math.sin(v * 5))); p.raise('R', g * (0.6 + 0.5 * Math.sin(v * 5 + 2))); p.bone('foreL').rotation.z = 0.8 * Math.sin(v * 6) * g; p.bone('foreR').rotation.z = -0.8 * Math.sin(v * 6 + 1) * g;
      p.bone('head').rotation.x = -0.08 * Math.abs(Math.sin(v * 9)) * g; p.update();
      bs.forEach((b, i) => { const f = pre ? 0 : ((v / 2.4 + i / 3) % 1); b.visible = f > 0.02; b.position.set(px + 0.38 * u + 0.08 * u * Math.sin(f * 4 + i), floor + 0.7 * u + 0.45 * u * f, 0.06 * u - 0.05 * u * i); b.scale.setScalar(grow(between(f, 0, 0.15) * (1 - between(f, 0.8, 1)))); });
    },
  };
}

// ---- 後 behind ----
function peekBehind(ctx, spec, stage) {
  if (spec.outcome === 'sneak') return sneakUp(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const kid = createPerson({ u: 0.95 * u, shirt: 0xffa030, hair: 0x2a1a10 }), giggle = many([[G.sphere(0.025 * u), 0xffe060]], 4, 1.2);
  group.add(kid.group, giggle);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { side: [0.4, 0.4, 'out'], hide1: [1.6, 0.3, 'in'], top: [2.4, 0.5, 'out'], hide2: [3.9, 0.4, 'in'] });
      const side = T.side - T.hide1, up = T.top - T.hide2;
      kid.reset().face('toward');
      kid.group.position.set(B.maxX - 0.3 * u + 0.45 * u * side, floor - 0.05 * u + 0.28 * u * up, -0.18 * u);
      kid.group.rotation.z = -0.35 * side; kid.bone('head').rotation.z = -0.2 * side;
      kid.raise('L', 1.0 * up); kid.raise('R', 1.0 * up); kid.bone('foreL').rotation.z = 1.4 * up; kid.bone('foreR').rotation.z = -1.4 * up;
      kid.update();
      for (let i = 0; i < 4; i++) { const f = pre ? 0 : between(v, 2.8 + 0.15 * i, 3.6 + 0.15 * i); giggle.set(i, B.cx + (i - 1.5) * 0.15 * u, B.maxY + 0.35 * u + 0.25 * u * f, 0.0, f > 0 && f < 1 ? 1.2 * Math.sin(Math.PI * f) : 0); }
      giggle.commit();
    },
  };
}
function sneakUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.85 * u;
  const p = createPerson({ u, shirt: 0x5a6ad0 }), cat = solidProp([[G.sphere(0.1 * u, 0, 0.1 * u, 0, 1.5, 0.8, 0.8), 0x404048], [G.sphere(0.075 * u, 0.15 * u, 0.17 * u, 0), 0x404048], [G.cone(0.03 * u, 0.06 * u, 0.12 * u, 0.25 * u, 0.04 * u), 0x404048], [G.cone(0.03 * u, 0.06 * u, 0.18 * u, 0.25 * u, -0.03 * u), 0x404048], [G.sphere(0.015 * u, 0.21 * u, 0.18 * u, 0.04 * u), 0xffe040], [G.sphere(0.015 * u, 0.21 * u, 0.18 * u, -0.04 * u), 0xffe040], [G.cyl(0.015 * u, 0.01 * u, 0.25 * u, -0.17 * u, 0.2 * u, 0, 0, 0, 0.5), 0x404048]], 0.45);
  const bang = textPlane('!', { h: 0.3 * u, color: '#ffe040', weight: 900 });
  group.add(p.group, cat, bang);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { creep: [0.2, 2.2, 'linear'], turn: [2.6, 0.25, 'back'], jump: [2.6, 0.4], back: [4.6, 0.4], away: [4.9, 0.9, 'in'] });
      p.reset().face(T.turn > 0.5 && T.back < 0.5 ? 'left' : 'right'); p.group.position.set(px, floor + 0.12 * u * bump(v, 2.6, 0.4), 0.02 * u);
      if (T.turn > 0.5 && T.back < 0.5) { p.raise('L', 2.2); p.raise('R', 2.2); }
      p.update();
      const cx = px - 0.9 * u + 0.6 * u * T.creep - 1.0 * u * T.away; cat.position.set(cx, floor, 0.0); cat.visible = !pre;
      cat.scale.set(1, 1 - 0.15 * (T.creep > 0 && T.creep < 1 ? 1 : 0), 1); cat.rotation.y = T.away > 0 ? Math.PI : 0;
      const k = pre ? 0 : T.jump * (1 - T.back); bang.visible = k > 0.01; bang.scale.setScalar(grow(k)); bang.position.set(px, floor + 1.15 * u, 0.05 * u);
    },
  };
}

// ---- 大 big ----
const MOUSE = (u) => [[G.sphere(0.06 * u, 0, 0.05 * u, 0, 1.4, 0.9, 0.9), 0xb0b0b8], [G.sphere(0.04 * u, 0.08 * u, 0.07 * u, 0), 0xb0b0b8], [G.sphere(0.025 * u, 0.07 * u, 0.12 * u, -0.02 * u), 0xffb0c0], [G.sphere(0.025 * u, 0.07 * u, 0.12 * u, 0.02 * u), 0xffb0c0], [G.sphere(0.008 * u, 0.12 * u, 0.08 * u, 0.0), 0xff6080], [G.cyl(0.006 * u, 0.004 * u, 0.15 * u, -0.12 * u, 0.06 * u, 0, 0, 0, 1.2), 0xd08890]];
function growBig(ctx, spec, stage) {
  if (spec.outcome === 'elephant') return elephant(ctx, spec, stage);
  if (spec.outcome === 'whale') return whale(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const mouse = solidProp(MOUSE(1.4 * u), 0.5), bang = textPlane('!', { h: 0.22 * u, color: '#ffe040', weight: 900 }), dust = many(PUFF(u), 6, 0.3);
  group.add(mouse, bang, dust);
  const loop = 5.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { grow: [0.4, 1.3, 'back'], shrink: [4.4, 0.9] }), k = pre ? 0 : T.grow - T.shrink;
      poseGlyph(stage, -0.1 * u * k, 0, 0, B.cx, B.minY, 1 + 0.75 * k);
      const mx = B.maxX + 0.35 * u + 0.25 * u * k;
      mouse.position.set(mx, floor, 0.12 * u); mouse.rotation.set(0, Math.PI, -0.9 * k + 0.05 * Math.sin(v * 8)); mouse.visible = !pre;
      const b = pre ? 0 : between(v, 1.2, 1.4) * (1 - between(v, 4.0, 4.3)); bang.visible = b > 0.01; bang.scale.setScalar(grow(b)); bang.position.set(mx + 0.05 * u, floor + 0.38 * u, 0.12 * u);
      puffs(dust, 0, 6, B.cx, floor, pre ? 0 : (v - 0.6) / 0.9, u, 0.6); dust.commit();
    },
  };
}
function elephant(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ex = B.maxX + 0.55 * u;
  const body = solidProp([[G.sphere(0.36 * u, 0, 0.5 * u, 0, 1.3, 1, 0.9), 0x9aa0ac], [G.sphere(0.24 * u, 0.42 * u, 0.68 * u, 0), 0x9aa0ac], [G.sphere(0.2 * u, 0.36 * u, 0.72 * u, 0.2 * u, 0.4, 1.1, 1), 0xb0b6c2], [G.sphere(0.03 * u, 0.56 * u, 0.76 * u, 0.13 * u), 0x101018], ...[[-0.25, 0.12], [-0.25, -0.12], [0.22, 0.12], [0.22, -0.12]].map(([x, z]) => [G.cyl(0.08 * u, 0.08 * u, 0.3 * u, x * u, 0.15 * u, z * u), 0x8a909c]), [G.cone(0.025 * u, 0.12 * u, 0.6 * u, 0.58 * u, 0.12 * u, -1.9), 0xfff8e8]], 0.4);
  const trunk = many([[G.sphere(0.055 * u), 0x9aa0ac]], 7, 0.4), mouse = solidProp(MOUSE(1.4 * u), 0.5), toot = many([[G.torus(0.08 * u, 0.01 * u), 0xffe080]], 3, 1.0);
  const holder = new THREE.Group(); holder.position.set(ex + 0.35 * u, floor, -0.1 * u); holder.rotation.y = Math.PI; holder.add(body, trunk);
  group.add(holder, mouse, toot);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, up = pre ? 0 : bump(v, 1.0, 2.4);
      for (let i = 0; i < 7; i++) { const f = i / 6, a = -1.2 + (2.4 * up) * f - 0.2 * Math.sin(v * 2) * (1 - up); trunk.set(i, (0.62 + 0.1 * f + 0.05 * Math.sin(a) * f * 3) * u, (0.62 - 0.4 * f * (1 - up) + 0.35 * f * up) * u, 0.0, 1 - 0.4 * f); }
      trunk.commit();
      for (let i = 0; i < 3; i++) { const f = up > 0.6 ? ((v * 1.5 + i / 3) % 1) : 0; toot.set(i, ex - 0.45 * u - 0.25 * u * f, floor + 1.05 * u + 0.15 * u * f, 0.05 * u, f > 0 ? 1 + 2 * f : 0, 0, -0.6); }
      toot.commit();
      mouse.position.set(B.maxX + 0.12 * u, floor, 0.2 * u); mouse.rotation.set(0, Math.PI, -0.5 * up); mouse.visible = !pre;
    },
  };
}
function whale(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.6 * u, sea = floor + 0.12 * u;
  const water = solidProp([[G.box(1.6 * u, 0.25 * u, 0.4 * u, 0, -0.125 * u, 0), 0x2a6ad0], ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.09 * u, (-0.6 + 0.3 * i) * u, 0, 0, 1.6, 0.5, 2), 0x3a7ae0])], 0.4), body = solidProp([[G.sphere(0.5 * u, 0, 0, 0, 1.5, 0.6, 0.6), 0x3a5a9a], [G.sphere(0.45 * u, 0, -0.06 * u, 0.02 * u, 1.4, 0.45, 0.55), 0xd8e0ec], [G.sphere(0.035 * u, 0.42 * u, 0.12 * u, 0.24 * u), 0x101018], [G.cone(0.15 * u, 0.3 * u, -0.8 * u, 0.1 * u, 0, Math.PI / 2 + 0.5), 0x3a5a9a]], 0.4);
  const boat = solidProp([[G.box(0.2 * u, 0.06 * u, 0.1 * u, 0, 0.03 * u, 0), 0xe04848], [G.box(0.012 * u, 0.15 * u, 0.012 * u, 0, 0.13 * u, 0), 0x8a5a30], [G.poly([[0, 0.08 * u], [0, 0.2 * u], [0.07 * u, 0.08 * u], [0, 0.08 * u]], 0.004 * u), 0xffffff]], 0.45);
  const spout = many([[G.sphere(0.04 * u), 0xd8f0ff]], 10, 1.0);
  water.position.set(wx, sea, -0.05 * u);
  group.add(body, water, boat, spout);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [0.3, 1.2, 'out'], down: [4.4, 1.2, 'in'] }), h = pre ? 0 : T.up - T.down;
      body.position.set(wx + 0.1 * u, sea - 0.3 * u + 0.55 * u * h, -0.1 * u); body.rotation.z = 0.05 * Math.sin(v * 1.5);
      boat.position.set(B.maxX + 0.2 * u, sea + 0.01 * u + 0.05 * u * wobble(v, 1.2, 1.5, 2) + 0.01 * u * Math.sin(t * 2), 0.15 * u); boat.rotation.z = 0.2 * wobble(v, 1.2, 1.5, 2);
      for (let i = 0; i < 10; i++) { const f = ((v * 1.2 + i / 10) % 1), on = h > 0.8 && v < 4.2 ? 1 : 0; spout.set(i, wx + 0.25 * u + (i % 2 ? 1 : -1) * 0.15 * u * f, sea + 0.25 * u + 0.55 * u * Math.sin(Math.PI * Math.min(1, f * 1.3)), -0.05 * u, on * (1 - f) * 1.2); }
      spout.commit();
    },
  };
}

// ---- 大人 adult ----
const bp = new THREE.Vector3();
function adultKid(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.45 * u;
  const big = createPerson({ u: 1.35 * u, shirt: 0x303848, pants: 0x202430 }), kid = createPerson({ u: 0.6 * u, shirt: 0xffa030 });
  const tie = solidProp([[G.box(0.03 * u, 0.15 * u, 0.01 * u, 0, 0, 0), 0xd03030]], 0.5), brief = emblemProp('briefcase', 0.28 * u);
  big.rig.attach('body', tie, 0.75); tie.position.set(0, -0.02 * u, 0.13 * u);
  group.add(big.group, kid.group, brief);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tip: [0.4, 0.5, 'out'], down: [2.0, 0.4], pat: [2.4, 1.4], end: [4.4, 0.4] });
      const tip = T.tip - T.down;
      big.reset().face(0.4); big.group.position.set(ax, floor, 0);
      const pat = T.pat * (1 - T.end); big.raise('L', 0.9 * pat); big.bone('foreL').rotation.z = 0.8 * pat + 0.2 * Math.sin(v * 12) * pat; big.update();
      big.rig.pointOn('handR', 0.5, bp); brief.position.set(ax + bp.x, floor + bp.y - 0.15 * u, bp.z + 0.05 * u); brief.idle(0);
      kid.reset().face(-0.6); kid.group.position.set(ax + 0.4 * u, floor + 0.06 * u * tip, 0.05 * u);
      kid.raise('L', 2.6 * tip); kid.raise('R', 0.3); kid.bone('head').rotation.x = -0.3 * tip; kid.update();
    },
  };
}

// ---- 外 outside ----
function houseOut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u;
  const house = solidProp([[G.box(0.5 * u, 0.42 * u, 0.4 * u, 0, 0.21 * u, 0), 0xf0e0c0], [G.cone(0.42 * u, 0.3 * u, 0, 0.57 * u, 0), 0xc04a3a], [G.box(0.18 * u, 0.3 * u, 0.01 * u, 0.06 * u, 0.15 * u, 0.2 * u), 0x2a1a10], [G.box(0.1 * u, 0.1 * u, 0.01 * u, -0.14 * u, 0.28 * u, 0.2 * u), 0xffe080]], 0.4);
  const door = new THREE.Group(), leaf = solidProp([[G.box(0.18 * u, 0.3 * u, 0.02 * u, 0.09 * u, 0.15 * u, 0), 0x8a5a30], [G.sphere(0.015 * u, 0.15 * u, 0.15 * u, 0.015 * u), 0xffd040]], 0.4);
  door.add(leaf); door.position.set(hx - 0.03 * u, floor, 0.21 * u);
  const dog = new THREE.Group(), { body, legs, tail } = dogParts(0.6 * u), tailPivot = new THREE.Group(); tailPivot.position.set(-0.13 * u, 0.23 * u, 0); tailPivot.add(tail); dog.add(body, legs, tailPivot);
  const flower = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.15 * u, 0, 0.075 * u, 0), 0x40a040], [G.sphere(0.03 * u, 0, 0.16 * u, 0), 0xffd040], ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.03 * u, Math.cos(i * 1.257) * 0.04 * u, 0.16 * u + Math.sin(i * 1.257) * 0.04 * u, -0.005 * u), 0xff6a9a])], 0.6);
  const grass = solidProp([[G.box(1.4 * u, 0.03 * u, 0.6 * u, 0, -0.015 * u, 0), 0x58a840]], 0.3);
  house.position.set(hx, floor, -0.05 * u); flower.position.set(hx + 0.85 * u, floor, 0.2 * u); grass.position.set(hx + 0.4 * u, floor, 0.05 * u); grass.rotation.x = 0.35;
  group.add(grass, house, door, dog, flower);
  const loop = 6.4, LEG = [[0.12, 0.15], [0.12, -0.15], [-0.12, 0.15], [-0.12, -0.15]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.3, 0.4, 'out'], run: [0.7, 1.0, 'out'], shut: [1.8, 0.3, 'in'], sniff: [2.2, 1.6], back: [4.6, 1.0, 'in'], open2: [4.4, 0.3], shut2: [5.7, 0.3, 'in'] });
      door.rotation.y = -1.6 * (T.open - T.shut + T.open2 - T.shut2);
      const out = T.run - T.back, x = hx + 0.06 * u + 0.65 * u * out, running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      dog.visible = !pre && (out > 0.05 || (T.open - T.shut + T.open2 - T.shut2) > 0.3); dog.position.set(x, floor + (running ? 0.02 * u * Math.abs(Math.sin(v * 14)) : 0), 0.32 * u * Math.min(1, out * 3));
      dog.rotation.y = T.back > 0 ? Math.PI : 0; dog.rotation.z = T.sniff > 0 && T.sniff < 1 ? -0.15 : 0;
      LEG.forEach(([lx, lz], i) => legs.set(i, lx * 0.6 * u, 0.22 * 0.6 * u, lz * 0.6 * u, 1, running ? 0.7 * Math.sin(v * 14 + (i % 2 ? Math.PI : 0)) : 0));
      legs.commit(); tailPivot.rotation.z = 0.4 + 0.6 * Math.sin(t * 16);
    },
  };
}

export const SCENES = { 'chat-table': chatTable, 'peek-behind': peekBehind, 'grow-big': growBig, 'adult-kid': adultKid, 'house-out': houseOut };
