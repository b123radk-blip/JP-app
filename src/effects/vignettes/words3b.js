// Batch 3 word scenes, part 2.
//   fog-glass      曇る: a kid breathes on a window, the glass fogs over; they draw a smiley in it, then it clears
//   room-expand    広い: a cramped room's walls slide far apart; the kid inside spreads their arms and twirls
//   suit-up        背広: a person in a dark suit, white collar and red tie, briefcase in hand, straightens the tie and walks off
//   lost-key       無くす: a key drops out of a walking person's pocket; they stop, pat their pockets, "?", look back: it glints
//   snail-climb    段々: a snail slowly climbs a little staircase, one step at a time, leaving a trail
//   map-read       地図: a person holds a map up, turns it upside down, "?", turns it back, points the way and walks off
//   library-shelf  図書館: tall bookshelves full of books; one slides out and floats to a kid at a reading table, then back
//   study-desk     勉強: a kid at a desk with a lamp writes line after line; a test comes back "100" with a red flower circle
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane, veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), WOOD = 0xc89a60;

function fogGlass(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.35 * u, gy = B.cy + 0.05 * u, W = 0.42 * u, H = 0.55 * u;
  const pane = solidProp([[G.box(W, H, 0.01 * u, 0, 0, 0), 0x8ad0ff], [G.box(W + 0.06 * u, 0.04 * u, 0.04 * u, 0, H / 2 + 0.02 * u, 0), WOOD], [G.box(W + 0.06 * u, 0.04 * u, 0.04 * u, 0, -H / 2 - 0.02 * u, 0), WOOD], [G.box(0.04 * u, H, 0.04 * u, -W / 2 - 0.01 * u, 0, 0), WOOD], [G.box(0.04 * u, H, 0.04 * u, W / 2 + 0.01 * u, 0, 0), WOOD]], 0.5);
  const fog = veil(W, H, 0xf4f6fa), smile = solidProp([[G.torus(0.09 * u, 0.012 * u, Math.PI, 0, -0.02 * u, 0, Math.PI), 0x4a8ac0], [G.sphere(0.02 * u, -0.05 * u, 0.06 * u, 0), 0x4a8ac0], [G.sphere(0.02 * u, 0.05 * u, 0.06 * u, 0), 0x4a8ac0], [G.torus(0.16 * u, 0.012 * u), 0x4a8ac0]], 0.6);
  pane.position.set(gx, gy, 0); fog.position.set(gx, gy, 0.012 * u); smile.position.set(gx, gy, 0.016 * u);
  const breath = many(PUFF(u, 0xffffff), 4, 0.6), kid = createPerson({ u: 0.75 * u, shirt: 0xe04848 });
  group.add(pane, fog, smile, breath, kid.group);
  const loop = 5.6, mouth = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fog: [0.7, 1.0], draw: [2.0, 1.0], clear: [4.4, 0.9] }), f = pre ? 0 : T.fog * (1 - T.clear), hop = bump(v, 3.3, 0.35);
      fog.material.opacity = 0.85 * f; fog.visible = f > 0.01; smile.visible = f > 0.05 && T.draw > 0; smile.scale.setScalar(pop(T.draw));
      kid.reset().face('left'); kid.group.position.set(gx + W / 2 + 0.22 * u, floor + 0.06 * u * hop, 0.12 * u);
      if (T.draw > 0 && T.draw < 1) { kid.bone('armR').rotation.x = 1.6 + 0.25 * Math.sin(v * 12); kid.bone('foreR').rotation.x = 0.2; }
      kid.update(); bonePoint(kid, 'head', 0.4, mouth);
      for (let i = 0; i < 4; i++) { const p = between(v, 0.5 + 0.25 * i, 1.3 + 0.25 * i); breath.set(i, lerp(mouth.x - 0.08 * u, gx + 0.1 * u, p), mouth.y + 0.02 * u * Math.sin(p * 6), 0.1 * u, p > 0 && p < 1 ? 0.8 * Math.sin(Math.PI * p) : 0); }
      breath.commit();
    },
  };
}

function roomExpand(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rx = B.maxX + 0.65 * u, W0 = 0.42 * u, W1 = 1.15 * u, H = 0.6 * u;
  const base = solidProp([[G.box(1, 0.03 * u, 0.4 * u, 0, 0.015 * u, 0), WOOD], [G.box(1, H, 0.02 * u, 0, H / 2, -0.2 * u), 0xe8f0e0]], 0.3);
  const wall = () => solidProp([[G.box(0.04 * u, H, 0.4 * u, 0, H / 2, 0), 0xd0dcc8], [G.box(0.01 * u, 0.16 * u, 0.12 * u, 0, H * 0.6, 0), 0x8ad0ff]], 0.35);
  const L = wall(), R = wall(), kid = createPerson({ u: 0.55 * u, shirt: 0x9a60d0 });
  group.add(base, L, R, kid.group);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { grow: [0.4, 1.4, 'out'], shrink: [4.3, 0.7, 'in'] }), g = pre ? 0 : T.grow - T.shrink, W = lerp(W0, W1, g);
      base.scale.x = W; base.position.set(rx, floor, -0.05 * u); L.position.set(rx - W / 2, floor, -0.05 * u); R.position.set(rx + W / 2, floor, -0.05 * u);
      kid.reset(); kid.raise('L', 0.2 + 1.4 * g); kid.raise('R', 0.2 + 1.4 * g); kid.group.position.set(rx, floor + 0.03 * u, 0.05 * u);
      kid.group.rotation.y = v > 1.9 && v < 3.9 ? (v - 1.9) * Math.PI : 0; kid.update();
    },
  };
}

function suitUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, NAVY = 0x23304a;
  const p = createPerson({ u: 0.95 * u, shirt: NAVY, pants: NAVY, shoes: 0x14141c }), k = 0.95 * u;
  const tie = solidProp([[G.box(0.09 * k, 0.1 * k, 0.01 * k, 0, -0.04 * k, 0), 0xffffff], [G.box(0.03 * k, 0.13 * k, 0.012 * k, 0, -0.1 * k, 0.004 * k), 0xd02030], [G.cone(0.022 * k, 0.04 * k, 0, -0.18 * k, 0.004 * k, Math.PI), 0xd02030], [G.box(0.035 * k, 0.025 * k, 0.014 * k, 0, -0.03 * k, 0.005 * k), 0xb01828]], 0.4);
  const pin = p.rig.attach('body', tie, 0.95); pin.position.z = 0.1 * k;
  const bag = emblemProp('briefcase', 0.3 * u); p.rig.attach('handL', bag, 0.9); bag.position.y -= 0.12 * u; bag.scale.setScalar(0.3 * u);
  const sparkle = burst(u, { s: 0.18, n: 6, color: 0xfff0a0 });
  group.add(p.group, sparkle);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0, 1.0], fix: [1.3, 0.3], unfix: [2.3, 0.3], out: [3.4, 1.2] });
      const walking = (T.in > 0 && T.in < 1) || (T.out > 0 && T.out < 1), fix = T.fix - T.unfix;
      p.reset().face(T.in < 1 ? 'left' : T.out > 0 ? 'right' : 'toward').walk(v * 9, walking ? 1 : 0);
      if (fix > 0) { p.bone('armR').rotation.x = 2.3 * fix; p.bone('foreR').rotation.x = 1.6 * fix; p.bone('armR').rotation.z = 0.5 * fix; }
      p.group.position.set(px + 0.6 * u * (1 - T.in) + 0.7 * u * T.out, floor, 0.1 * u); p.group.visible = pre || T.out < 1; p.update();
      const s = pre ? 0 : bump(v, 2.0, 0.6); sparkle.visible = s > 0; sparkle.scale.setScalar(pop(s)); sparkle.position.set(px + 0.08 * u, floor + 0.85 * u, 0.25 * u); sparkle.rotation.z = t * 3;
    },
  };
}

function lostKey(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u, GOLD = 0xffc830;
  const key = solidProp([[G.torus(0.04 * u, 0.012 * u), GOLD], [G.box(0.12 * u, 0.02 * u, 0.015 * u, 0.1 * u, 0, 0), GOLD], [G.box(0.02 * u, 0.04 * u, 0.015 * u, 0.13 * u, -0.025 * u, 0), GOLD], [G.box(0.02 * u, 0.03 * u, 0.015 * u, 0.16 * u, -0.02 * u, 0), GOLD]], 0.6);
  const p = createPerson({ u: 0.85 * u, shirt: 0x40a0e0 }), q = emblemProp('question', 0.3 * u, { color: 0xffe040 }), glint = burst(u, { s: 0.16, n: 4, color: 0xffffff });
  group.add(key, p.group, q, glint);
  const loop = 5.4, kx = x0 + 0.3 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 2.0], turn: [3.0, 0.3], out: [4.8, 0.4] }), x = x0 + 0.85 * u * T.walk;
      const pat = v > 2.1 && v < 2.9 ? Math.sin((v - 2.1) * 18) : 0, k = pre ? 1 : 1 - T.out;
      p.reset().face(T.turn > 0 ? Math.PI / 2 - 2.2 * T.turn : 'right').walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0);
      if (v > 2.1 && v < 2.9) { p.bone('armL').rotation.z = 0.3 + 0.15 * pat; p.bone('armR').rotation.z = -0.3 - 0.15 * pat; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 0.6; }
      p.group.position.set(x, floor, 0.1 * u); p.group.scale.setScalar(pop(k)); p.update();
      const f = pre ? 1 : between(v, 0.75, 1.05), y = f < 1 ? lerp(floor + 0.4 * u, floor + 0.02 * u, f * f) : floor + 0.02 * u + 0.03 * u * bump(v, 1.05, 0.2);
      key.visible = pre || v > 0.75; key.position.set(kx, y, 0.2 * u); key.rotation.set(f < 1 ? v * 8 : 1.2, 0, f < 1 ? v * 6 : 0.3); key.scale.setScalar(pop(k));
      const qs = pre ? 0 : timeline(v, { q: [2.5, 0.3, 'back'] }).q * (1 - T.out); q.visible = qs > 0.01; q.scale.setScalar(pop(0.3 * u * qs)); q.position.set(x + 0.05 * u, floor + 1.05 * u, 0.1 * u); q.idle(t);
      const g = pre ? 0 : (v > 3.3 && v < 4.7 ? 0.6 + 0.4 * Math.sin(v * 10) : 0); glint.visible = g > 0; glint.scale.setScalar(pop(g)); glint.position.set(kx + 0.08 * u, floor + 0.08 * u, 0.25 * u); glint.rotation.z = t * 2;
    },
  };
}

function snailClimb(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u, N = 5, SW = 0.17 * u, SH = 0.09 * u;
  const steps = solidProp(Array.from({ length: N }, (_, i) => [G.box(SW, (i + 1) * SH, 0.3 * u, (i + 0.5) * SW, (i + 1) * SH / 2, 0), i % 2 ? 0xb8b0a4 : 0xd0c8bc]), 0.3);
  steps.position.set(x0, floor, -0.05 * u);
  const snail = emblemProp('snail', 0.22 * u), trail = many([[G.sphere(0.012 * u, 0, 0, 0, 1.6, 0.4, 1), 0xc8f0ff]], 24, 0.8);
  group.add(steps, snail, trail);
  const loop = 6.0, path = (s) => { const q = s * N, i = Math.min(N - 1, Math.floor(q)), f = q - i, top = (i + 1) * SH; return f < 0.25 ? [x0 + i * SW + 0.01 * u, floor + i * SH + (top - i * SH) * (f / 0.25)] : [x0 + i * SW + SW * ((f - 0.25) / 0.75), floor + top]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : between(v, 0.2, 5.2), out = between(v, 5.4, 5.9), [x, y] = path(Math.min(0.999, s));
      snail.position.set(x - 0.09 * u, y + 0.08 * u, 0.12 * u); snail.scale.setScalar(pop(0.22 * u * (1 - out))); snail.idle(t * 0.6);
      for (let i = 0; i < 24; i++) { const si = (i + 0.5) / 24, [tx, ty] = path(si); trail.set(i, tx - 0.06 * u, ty + 0.004 * u, 0.12 * u, !pre && si < s - 0.02 && out < 1 ? 1 : 0); }
      trail.commit();
    },
  };
}

function mapRead(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0x60b060 });
  const map = solidProp([[G.box(0.44 * u, 0.3 * u, 0.006 * u, 0, 0, 0), 0xf4e6c0], [G.sphere(0.07 * u, -0.1 * u, 0.04 * u, 0.004 * u, 1.5, 1, 0.1), 0x9ac878], [G.box(0.02 * u, 0.3 * u, 0.008 * u, 0.06 * u, 0, 0.003 * u, 0.3), 0x5aa0e0], [G.cone(0.04 * u, 0.06 * u, 0.15 * u, 0.08 * u, 0.006 * u), 0xe02020]], 0.45);
  const q = emblemProp('question', 0.28 * u, { color: 0xffe040 }), arrow = emblemProp('arrow', 0.3 * u, { dir: 'right', color: 0xffd040 });
  group.add(p.group, map, q, arrow);
  const loop = 5.6, hL = new THREE.Vector3(), hR = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { up: [0.1, 0.4], flip: [0.8, 0.6], unflip: [1.9, 0.6], point: [2.7, 0.3, 'back'], walk: [3.7, 1.2], out: [4.9, 0.3] });
      const point = T.point * (1 - T.walk), walking = T.walk > 0 && T.walk < 1;
      p.reset().face(walking ? 'right' : 0).walk(v * 9, walking ? 1 : 0);
      p.bone('armL').rotation.x = 1.3 * T.up; if (point < 0.5) p.bone('armR').rotation.x = 1.3 * T.up; else p.raise('R', 1.5);
      p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 0.5 * T.up * (point < 0.5 ? 1 : 0.5); p.bone('head').rotation.z = 0.3 * bump(v, 1.0, 1.4);
      p.group.position.set(px + 0.8 * u * T.walk, floor, 0.1 * u); p.group.scale.setScalar(pop(pre ? 1 : 1 - T.out)); p.update();
      bonePoint(p, 'handL', 0.5, hL); bonePoint(p, 'handR', 0.5, hR);
      map.visible = !pre && T.up > 0 && !walking && T.walk < 1; map.position.set(point < 0.5 ? (hL.x + hR.x) / 2 : hL.x, (hL.y + hR.y) / 2 + 0.1 * u, Math.max(hL.z, hR.z) + 0.03 * u); map.rotation.z = Math.PI * (T.flip - T.unflip);
      const qs = pre ? 0 : bump(v, 1.0, 1.6); q.visible = qs > 0; q.scale.setScalar(pop(0.28 * u * Math.min(1, qs * 2))); q.position.set(px + 0.1 * u, floor + 1.15 * u, 0.1 * u); q.idle(t);
      const as = pre ? 0 : point; arrow.visible = as > 0.01; arrow.scale.setScalar(pop(0.3 * u * as)); arrow.position.set(px + 0.7 * u, floor + 0.75 * u, 0.1 * u); arrow.idle(t);
    },
  };
}

function libraryShelf(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.62 * u, SW = 0.32 * u, SH = 0.95 * u, ROWS = 3, PER = 6;
  const shelfParts = [-1, 1].flatMap((s) => { const x = sx + s * 0.2 * u; return [[G.box(SW, 0.02 * u, 0.2 * u, x, 0.01 * u, 0), WOOD], [G.box(SW, 0.02 * u, 0.2 * u, x, SH, 0), WOOD], [G.box(0.02 * u, SH, 0.2 * u, x - SW / 2, SH / 2, 0), WOOD], [G.box(0.02 * u, SH, 0.2 * u, x + SW / 2, SH / 2, 0), WOOD], [G.box(SW, SH, 0.01 * u, x, SH / 2, -0.1 * u), 0x8a5a30], ...[1, 2].map((r) => [G.box(SW, 0.02 * u, 0.2 * u, x, (r * SH) / ROWS, 0), WOOD])]; });
  const shelves = solidProp(shelfParts, 0.3); shelves.position.set(0, floor, -0.1 * u);
  const N = 2 * ROWS * PER, books = many([[G.box(0.04 * u, 0.24 * u, 0.15 * u, 0, 0.12 * u, 0), 0xffffff]], N, 0.45), PAL = [0xe04848, 0x40a0e0, 0x60c060, 0xf0c030, 0x9a60d0, 0xf08030];
  for (let i = 0; i < N; i++) books.setColorAt(i, new THREE.Color(PAL[(i * 7) % 6]));
  const slot = (i) => { const s = i < N / 2 ? -1 : 1, j = i % (N / 2), r = Math.floor(j / PER), c = j % PER; return [sx + s * 0.2 * u - SW / 2 + 0.035 * u + c * 0.05 * u, floor + (r * SH) / ROWS + 0.02 * u, -0.1 * u]; };
  const fly = solidProp([[G.box(0.04 * u, 0.24 * u, 0.15 * u, 0, 0, 0), 0xe04848], [G.box(0.035 * u, 0.06 * u, 0.152 * u, 0.003 * u, 0.04 * u, 0), 0xffd040]], 0.5);
  const table = solidProp([[G.box(0.5 * u, 0.025 * u, 0.22 * u, 0, 0.3 * u, 0), WOOD], [G.box(0.03 * u, 0.3 * u, 0.03 * u, -0.22 * u, 0.15 * u, 0.08 * u), 0x8a5a30], [G.box(0.03 * u, 0.3 * u, 0.03 * u, 0.22 * u, 0.15 * u, 0.08 * u), 0x8a5a30]], 0.35);
  const tx = sx + 0.05 * u; table.position.set(tx, floor, 0.32 * u);
  const kid = createPerson({ u: 0.6 * u, shirt: 0x40c8c8 }), PICK = N / 2 + PER + 2;
  group.add(shelves, books, fly, table, kid.group);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { out: [0.3, 0.4], fly: [0.8, 0.8], back: [3.6, 0.8], in: [4.4, 0.4] });
      for (let i = 0; i < N; i++) { const [x, y, z] = slot(i); books.set(i, x, y, z, i === PICK && !pre && T.out > 0 && T.in < 1 ? 0 : 0.85 + 0.15 * ((i * 5) % 3) / 2); }
      books.commit();
      const [bx, by, bz] = slot(PICK), dest = [tx, floor + 0.42 * u], away = T.fly - T.back, [x, y] = arc([bx, by + 0.12 * u], dest, 0.25 * u, away);
      fly.visible = !pre && T.out > 0 && T.in < 1; fly.position.set(x, y, lerp(bz + 0.15 * u * (T.out - T.in), 0.36 * u, away)); fly.rotation.set(0, (Math.PI / 2 - 0.3) * away, 0.4 * Math.sin(Math.PI * away));
      kid.reset(); kid.group.position.set(tx, floor - 0.05 * u, 0.15 * u); const read = away > 0.95 ? 1 : 0; kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 1.0 * read + 0.2; kid.bone('head').rotation.x = 0.35 * read; kid.update();
    },
  };
}

function studyDesk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.55 * u, ty = floor + 0.32 * u;
  const desk = solidProp([[G.box(0.7 * u, 0.03 * u, 0.3 * u, 0, ty - floor, 0), WOOD], [G.box(0.03 * u, ty - floor, 0.26 * u, -0.32 * u, (ty - floor) / 2, 0), 0x8a5a30], [G.box(0.03 * u, ty - floor, 0.26 * u, 0.32 * u, (ty - floor) / 2, 0), 0x8a5a30], [G.cyl(0.05 * u, 0.06 * u, 0.02 * u, 0.26 * u, ty - floor + 0.02 * u, -0.08 * u), 0x40a0e0], [G.cyl(0.008 * u, 0.008 * u, 0.28 * u, 0.26 * u, ty - floor + 0.15 * u, -0.08 * u, 0, 0, 0.3), 0x40a0e0], [G.cone(0.07 * u, 0.08 * u, 0.2 * u, ty - floor + 0.3 * u, -0.08 * u, 0.9), 0x40a0e0], [G.sphere(0.03 * u, 0.18 * u, ty - floor + 0.27 * u, -0.08 * u), 0xfff0b0], ...[0x60c060, 0xe04848, 0xf0c030].map((c, i) => [G.box(0.18 * u, 0.04 * u, 0.13 * u, -0.22 * u, ty - floor + 0.035 * u + 0.042 * u * i, -0.06 * u, 0.05 * (i - 1)), c])], 0.35);
  desk.position.set(dx, floor, 0.12 * u);
  const paper = solidProp([[G.box(0.24 * u, 0.006 * u, 0.17 * u, 0, 0, 0), 0xfdfaf0]], 0.5), lines = many([[G.box(0.18 * u, 0.008 * u, 0.012 * u, 0, 0, 0), 0x5a6a8a]], 5, 0.4);
  paper.position.set(dx + 0.02 * u, ty + 0.02 * u, 0.2 * u); paper.rotation.x = 0.5;
  const kid = createPerson({ u: 0.75 * u, shirt: 0xf0a030 }), pencil = solidProp([[G.cyl(0.01 * u, 0.01 * u, 0.14 * u, 0, 0.07 * u, 0), 0xffd040], [G.cone(0.01 * u, 0.025 * u, 0, -0.012 * u, 0, Math.PI), 0x3a3a44]], 0.4);
  kid.rig.attach('handR', pencil, 0.8);
  const score = textPlane('100', { h: 0.2 * u, color: '#e02020', bg: '#fdfaf0' }), ring = solidProp([[G.torus(0.2 * u, 0.012 * u, Math.PI * 1.8), 0xe02020], [G.torus(0.15 * u, 0.01 * u, Math.PI * 1.6, 0, 0, 0, 1), 0xe02020]], 0.7);
  group.add(desk, paper, lines, kid.group, score, ring);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { pop: [2.9, 0.4, 'back'], off: [4.8, 0.4] }), writing = v > 0.2 && v < 2.6;
      for (let i = 0; i < 5; i++) { const f = pre ? 0 : between(v, 0.3 + 0.45 * i, 0.7 + 0.45 * i) * (1 - T.off); lines.set(i, paper.position.x - 0.09 * u * (1 - f), paper.position.y + 0.012 * u, paper.position.z + (-0.05 + 0.025 * i) * u, f > 0.01 ? 1 : 0, 0, 0, 0.5); }
      lines.commit();
      const cheer = T.pop * (1 - T.off);
      kid.reset(); kid.group.position.set(dx, floor - 0.12 * u, -0.05 * u);
      if (cheer > 0.5) { kid.raise('L', 2.7); kid.raise('R', 2.7); } else { kid.bone('armR').rotation.x = 1.1 + (writing ? 0.1 * Math.sin(v * 25) : 0); kid.bone('foreR').rotation.x = 0.7; kid.bone('head').rotation.x = writing ? 0.35 : 0; }
      kid.update();
      score.visible = ring.visible = cheer > 0.01; score.scale.setScalar(pop(cheer)); ring.scale.setScalar(pop(cheer)); score.position.set(dx + 0.3 * u, ty + 0.62 * u, 0.15 * u); ring.position.copy(score.position); ring.rotation.z = t;
    },
  };
}

export const SCENES = { 'fog-glass': fogGlass, 'room-expand': roomExpand, 'suit-up': suitUp, 'lost-key': lostKey, 'snail-climb': snailClimb, 'map-read': mapRead, 'library-shelf': libraryShelf, 'study-desk': studyDesk };
