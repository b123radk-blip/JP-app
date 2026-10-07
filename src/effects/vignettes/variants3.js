// Batch 3 word variants (same scene type as their kanji, another `outcome`):
//   bridge-walk:zebra    渡る: a kid waits at a zebra crossing, the walk light turns green and they cross, hand up
//   paper-fold:letter    手紙: a written sheet slides into an envelope, the flap closes, a heart seal, it flies off
//   home-time:clock      夕方: clock hands sweep round to five o'clock, the chime plays (notes) and the sun sinks
//   yellow-things:crayon 黄色: a yellow crayon scribbles a star outline full of yellow
//   yellow-things:hat    黄色い: a kid in a yellow hat, yellow raincoat and boots walks in the rain under a yellow umbrella
//   clouds-gather:grey   曇り: grey clouds roll in one after another until the sky is grey; a kid with an umbrella looks up
//   knock-door:window    誰か: a dark figure walks past a lit window, stops to peek out, walks on: someone is there
//   ball-steps:climb     階段: a kid climbs a staircase step by step and cheers at the top
//   tool-use:scissors    使う: scissors snip along a dotted line and the paper falls apart in two
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, heart } from '../pieces/kit-things.js';
import { emblemProp, veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { lerp } from './timeline.js';

const pop = (f) => Math.max(1e-3, f);

export function zebraCross(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rx = B.maxX + 0.75 * u, RW = 0.9 * u;
  const stripes = Array.from({ length: 5 }, (_, i) => [G.box(0.09 * u, 0.012 * u, 0.42 * u, (i - 2) * 0.17 * u, 0.012 * u, 0), 0xf4f4f4]);
  const road = solidProp([[G.box(RW, 0.02 * u, 0.6 * u, 0, 0, 0), 0x3a3c44], [G.box(0.2 * u, 0.04 * u, 0.6 * u, -RW / 2 - 0.1 * u, 0.01 * u, 0), 0xa8a8b0], [G.box(0.2 * u, 0.04 * u, 0.6 * u, RW / 2 + 0.1 * u, 0.01 * u, 0), 0xa8a8b0], ...stripes], 0.3);
  road.position.set(rx, floor, 0);
  const lx = rx + RW / 2 + 0.12 * u, pole = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.72 * u, 0, 0.36 * u, 0), 0x60646c], [G.box(0.13 * u, 0.25 * u, 0.06 * u, 0, 0.8 * u, 0), 0x202428]], 0.3);
  pole.position.set(lx, floor, -0.22 * u);
  const lamp = (c, y) => { const m = solidProp([[G.sphere(0.022 * u, 0, 0.035 * u, 0), c], [G.box(0.03 * u, 0.05 * u, 0.01 * u, 0, -0.005 * u, 0), c]], 1.0); m.position.set(lx, floor + y, -0.185 * u); return m; };
  const red = lamp(0xff3030, 0.85 * u), green = lamp(0x30e060, 0.73 * u), kid = createPerson({ u: 0.62 * u, shirt: 0xf0a030 });
  group.add(road, pole, red, green, kid.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 0.3, 'out'], walk: [1.5, 2.0], out: [3.6, 0.3] }), go = !pre && v >= 1.2 && v < 4.0;
      red.visible = !go; green.visible = go;
      kid.reset().face('right'); if (go) kid.raise('R', 2.9); kid.walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0);
      kid.group.position.set(rx - RW / 2 - 0.08 * u + (RW + 0.12 * u) * T.walk, floor + 0.03 * u, 0.12 * u); kid.group.scale.setScalar(pop(pre ? 1 : T.in * (1 - T.out))); kid.update();
    },
  };
}

export function letterSend(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.45 * u, cy = B.cy - 0.12 * u, EW = 0.46 * u, EH = 0.3 * u;
  const sheet = solidProp([[G.box(0.34 * u, 0.42 * u, 0.005 * u, 0, 0, 0), 0xfdfaf0], ...Array.from({ length: 5 }, (_, i) => [G.box(0.26 * u, 0.014 * u, 0.006 * u, 0, (0.14 - 0.06 * i) * u, 0.002 * u), 0x6a7aa0])], 0.5);
  const body = solidProp([[G.box(EW, EH, 0.02 * u, 0, 0, 0), 0xf0e0c0], [G.box(0.28 * u, 0.008 * u, 0.004 * u, -0.11 * u, -0.06 * u, 0.012 * u, 0.6), 0xc8b090], [G.box(0.28 * u, 0.008 * u, 0.004 * u, 0.11 * u, -0.06 * u, 0.012 * u, -0.6), 0xc8b090]], 0.4);
  const tri = new THREE.Shape(); tri.moveTo(-EW / 2, 0); tri.lineTo(EW / 2, 0); tri.lineTo(0, -0.18 * u); tri.lineTo(-EW / 2, 0);
  const flap = new THREE.Group(), flapM = solidProp([[new THREE.ShapeGeometry(tri).translate(0, 0, 0.013 * u), 0xe8d0a8]], 0.4); flapM.material.side = THREE.DoubleSide; flap.add(flapM); flap.position.y = EH / 2;
  const seal = heart(u, { s: 0.1, color: 0xe02040 }); seal.position.set(0, EH / 2 - 0.17 * u, 0.03 * u);
  const env = new THREE.Group(); env.add(body, flap, seal); group.add(sheet, env);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 0.3, 'back'], slide: [1.0, 0.7, 'in'], close: [1.9, 0.4], seal: [2.4, 0.3, 'back'], fly: [3.0, 1.3, 'in'] });
      const f = pre ? 0 : T.fly;
      env.visible = f < 1; env.position.set(cx + 0.9 * u * f, cy + 0.7 * u * f + 0.04 * u * Math.sin(v * 9) * f, 0.02 * u); env.rotation.z = 0.3 * f; env.scale.setScalar(pop((pre ? 1 : T.in) * (1 - 0.6 * f)));
      flap.rotation.x = Math.PI * (1 - (pre ? 0 : T.close)); seal.visible = T.seal > 0.01; seal.scale.setScalar(pop(T.seal));
      sheet.visible = !pre && T.slide < 1; sheet.position.set(cx, cy + 0.38 * u - 0.38 * u * T.slide, 0); sheet.scale.setScalar(pop(T.in));
    },
  };
}

export function fiveChime(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.4 * u, cy = B.cy + 0.12 * u, R = 0.26 * u;
  const ticks = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [G.box(0.014 * u, (i % 3 ? 0.03 : 0.06) * u, 0.01 * u, Math.sin(a) * 0.84 * R, Math.cos(a) * 0.84 * R, 0.02 * u, -a), 0x2a3040]; });
  const face = solidProp([[G.cyl(R, R, 0.03 * u, 0, 0, 0, Math.PI / 2), 0xfaf6ea], [G.torus(R, 0.025 * u), 0x8a5a30], ...ticks, [G.sphere(0.02 * u, 0, 0, 0.03 * u), 0x2a3040]], 0.45);
  const hand = (w, l, c) => { const p = new THREE.Group(), m = solidProp([[G.box(w, l, 0.01 * u, 0, l / 2 - 0.02 * u, 0), c]], 0.5); p.add(m); p.position.set(cx, cy, 0.03 * u); return p; };
  const hourH = hand(0.03 * u, 0.15 * u, 0x2a3040), minH = hand(0.018 * u, 0.22 * u, 0xe04848);
  const sun = solidProp([[new THREE.CircleGeometry(0.2 * u, 32), 0xff7a30]], 1.0), hill = solidProp([[new THREE.SphereGeometry(0.4 * u, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.4, 0.4), 0x40305a]], 0.25);
  const notes = many([[G.sphere(0.03 * u, 0, 0, 0, 1.3, 1, 0.6), 0xffe060], [G.box(0.008 * u, 0.09 * u, 0.008 * u, 0.033 * u, 0.045 * u, 0), 0xffe060]], 6, 0.9);
  face.position.set(cx, cy, 0); hill.position.set(cx + 0.45 * u, floor, -0.1 * u);
  group.add(face, hourH, minH, sun, hill, notes);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : timeline(v, { f: [0.2, 2.0, 'smooth'] }).f, h = 3 + 2 * f;
      hourH.rotation.z = -Math.PI * 2 * h / 12; minH.rotation.z = -Math.PI * 2 * (h % 1 || (f > 0.5 ? 0 : 0));
      minH.rotation.z = -Math.PI * 2 * 2 * f;
      sun.position.set(cx + 0.5 * u, floor + 0.35 * u - 0.38 * u * (pre ? 0 : v / loop), -0.3 * u);
      for (let i = 0; i < 6; i++) { const p = pre ? 0 : between(v, 2.2 + 0.25 * i, 3.6 + 0.25 * i); notes.set(i, cx + (i % 2 ? 0.12 : -0.12) * u + 0.06 * u * Math.sin(p * 9 + i), cy + R + 0.05 * u + 0.5 * u * p, 0.05 * u, p > 0 && p < 1 ? 1 - p * 0.5 : 0, 0.3 * Math.sin(p * 7)); }
      notes.commit();
      face.position.x = cx + 0.01 * u * Math.sin(v * 40) * bump(v, 2.2, 0.6);
    },
  };
}

function starShape(R = 5, r = 2.1) { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; i ? s.lineTo(q * Math.cos(a), q * Math.sin(a)) : s.moveTo(q * Math.cos(a), q * Math.sin(a)); } return s; }

export function crayonStar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.42 * u, cy = B.cy, k = 0.06 * u, Y = 0xffd820;
  const pts = starShape().getPoints().map((p) => [p.x * k, p.y * k]); pts.push(pts[0]);
  const outline = solidProp([[G.poly(pts, 0.012 * u), 0x2a3040]], 0.4), fill = solidProp([[G.extrude(starShape(), 0.3).scale(k, k, k), Y]], 0.6);
  const crayon = new THREE.Group(), cm = solidProp([[G.cone(0.03 * u, 0.07 * u, 0, 0.035 * u, 0), Y], [G.cyl(0.03 * u, 0.03 * u, 0.3 * u, 0, 0.22 * u, 0), Y], [G.cyl(0.032 * u, 0.032 * u, 0.16 * u, 0, 0.22 * u, 0), 0xf4f0e0]], 0.5);
  cm.rotation.z = Math.PI; cm.position.y = 0; crayon.add(cm);
  outline.position.set(cx, cy, 0.01 * u); fill.position.set(cx, cy, 0);
  group.add(outline, fill, crayon);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { draw: [0.3, 2.0], away: [2.4, 0.4, 'in'], fade: [4.0, 0.5] }), f = pre ? 0 : T.draw * (1 - T.fade);
      fill.scale.set(pop(f), pop(f), 1); fill.visible = f > 0.01; fill.rotation.z = 0.04 * Math.sin(t * 3) * bump(v, 2.4, 1.6);
      const sx = cx + 0.2 * u * Math.sin(v * 16) * (1 - T.away), sy = cy + 0.25 * u - 0.5 * u * T.draw + 0.6 * u * T.away;
      crayon.visible = !pre && T.away < 1 && v > 0.1; crayon.position.set(sx + 0.4 * u * T.away, sy, 0.06 * u); crayon.rotation.z = -2.6;
    },
  };
}

export function yellowHat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, Y = 0xffd820, px = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.8 * u, shirt: Y, pants: 0x3a4a7a, shoes: Y });
  const hat = solidProp([[new THREE.SphereGeometry(0.12 * u * 0.8, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), Y], [G.cyl(0.16 * u * 0.8, 0.16 * u * 0.8, 0.01 * u, 0, 0, 0.02 * u), Y]], 0.5);
  kid.rig.attach('head', hat, 0.62);
  const umb = emblemProp('umbrella', 0.55 * u, { color: Y }), rain = many([[G.sphere(0.012 * u, 0, 0, 0, 0.7, 2.2, 0.7), 0x8ad0ff]], 14, 0.8);
  group.add(kid.group, umb, rain);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 0 : between(v, 0, 3.4), hop = bump(v, 3.5, 0.5);
      kid.reset().face(w > 0 && w < 1 ? -1.2 : 0).walk(v * 8, w > 0 && w < 1 ? 1 : 0); kid.raise('R', 0.5); kid.bone('foreR').rotation.x = 1.4;
      kid.group.position.set(px + 0.35 * u - 0.35 * u * w, floor + 0.1 * u * hop, 0.1 * u); kid.update();
      umb.position.set(kid.group.position.x - 0.02 * u, floor + 0.95 * u + 0.1 * u * hop, 0.15 * u); umb.idle(t);
      for (let i = 0; i < 14; i++) { const p = (t * 1.3 + i * 0.37) % 1; rain.set(i, px - 0.6 * u + (i * 0.11 % 1.2) * u, floor + 1.4 * u - 1.4 * u * p, 0.1 * u - 0.05 * u * (i % 3), 1); }
      rain.commit();
    },
  };
}

export function greySky(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, top = B.maxY + 0.12 * u, px = B.maxX + 0.45 * u;
  const CLOUD = [[G.sphere(0.14 * u, 0, 0, 0), 0xa8acb8], [G.sphere(0.11 * u, -0.14 * u, -0.04 * u, 0), 0x9a9eaa], [G.sphere(0.11 * u, 0.14 * u, -0.04 * u, 0), 0x9a9eaa], [G.sphere(0.09 * u, 0.05 * u, 0.08 * u, 0.02 * u), 0xb8bcc6]];
  const clouds = many(CLOUD, 6, 0.3), dim = veil(5 * u, 3 * u, 0x3a4250), kid = createPerson({ u: 0.75 * u, shirt: 0x60b060 });
  const umb = solidProp([[G.cone(0.045 * u, 0.4 * u, 0, -0.2 * u, 0, Math.PI), 0x3a7ad0], [G.torus(0.03 * u, 0.008 * u, Math.PI, 0.03 * u, 0.0, 0), 0x5a3a20]], 0.4);
  kid.rig.attach('handR', umb, 0.5); dim.position.set(B.cx + 0.4 * u, B.cy, -0.6 * u);
  group.add(dim, clouds, kid.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.8, 5.4);
      let c = 0;
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : timeline(v, { f: [0.2 + 0.4 * i, 0.9, 'out'] }).f; c += f / 6; clouds.set(i, B.minX + (i * 0.27 - 0.05) * u + 1.2 * u * (1 - f), top + (i % 2 ? 0.08 : -0.04) * u, -0.1 * u - 0.03 * u * i, pop(f * (1 - out) * (1 + 0.15 * (i % 3)))); }
      clouds.commit(); c *= 1 - out;
      dim.material.opacity = 0.45 * c; dim.visible = c > 0.01;
      kid.reset().face(-0.4); kid.bone('head').rotation.x = -0.45 * c; kid.raise('L', 0.5 * bump(v, 3.2, 1.2)); kid.group.position.set(px, floor, 0.12 * u); kid.update();
    },
  };
}

export function shadowWindow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.5 * u, wy = B.cy + 0.08 * u, OW = 0.44 * u, OH = 0.36 * u, WW = 0.9 * u, WH = 0.85 * u, WALL = 0x5a4a6a;
  const side = (WW - OW) / 2, cap = (WH - OH) / 2;
  const wall = solidProp([[G.box(WW, cap, 0.04 * u, 0, OH / 2 + cap / 2, 0), WALL], [G.box(WW, cap, 0.04 * u, 0, -OH / 2 - cap / 2, 0), WALL], [G.box(side, OH, 0.04 * u, -OW / 2 - side / 2, 0, 0), WALL], [G.box(side, OH, 0.04 * u, OW / 2 + side / 2, 0, 0), WALL], [G.box(OW, 0.02 * u, 0.02 * u, 0, 0, 0.02 * u), 0x3a2a1a], [G.box(0.02 * u, OH, 0.02 * u, 0, 0, 0.02 * u), 0x3a2a1a], [G.box(OW + 0.08 * u, 0.04 * u, 0.08 * u, 0, -OH / 2 - 0.02 * u, 0.03 * u), 0x3a2a1a]], 0.3);
  const back = solidProp([[G.box(OW * 1.8, OH * 1.8, 0.01 * u, 0, 0, 0), 0xffd890]], 0.9);
  wall.position.set(wx, wy, 0); back.position.set(wx, wy, -0.3 * u);
  const S = 0x14141c, who = createPerson({ u: 0.75 * u, shirt: S, pants: S, skin: S, hair: S, shoes: S, eyes: 0xffffff, glow: 0.2 }), q = emblemProp('question', 0.32 * u, { color: 0xffe040 });
  group.add(back, wall, who.group, q);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { a: [0.3, 1.2], look: [1.5, 0.3], unlook: [2.6, 0.3], b: [2.9, 1.2], q: [1.7, 0.4, 'back'], qOff: [4.6, 0.4] });
      const x = wx - 0.65 * u + 0.65 * u * T.a + 0.65 * u * T.b, walking = (T.a > 0 && T.a < 1) || (T.b > 0 && T.b < 1), look = T.look - T.unlook;
      who.reset().face(Math.PI / 2 * (1 - look)).walk(v * 9, walking ? 1 : 0); who.group.position.set(x, wy - 0.62 * u, -0.15 * u);
      who.bone('eyeL').scale.y = who.bone('eyeR').scale.y = (v % 1.1) < 0.08 ? 0.2 : 1; who.group.visible = !pre && T.b < 1; who.update();
      const qs = pre ? 0 : T.q * (1 - T.qOff); q.visible = qs > 0.01; q.scale.setScalar(pop(0.32 * u * qs)); q.position.set(wx + 0.3 * u, wy + WH / 2 + 0.12 * u, 0.05 * u); q.idle(t);
    },
  };
}

export function stairsClimb(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u, N = 4, SW = 0.22 * u, SH = 0.15 * u;
  const steps = solidProp(Array.from({ length: N }, (_, i) => [G.box(SW, (N - i) * SH, 0.4 * u, (i + 0.5) * SW, (N - i) * SH / 2, 0), i % 2 ? 0xb07a50 : 0xc89060]), 0.3);
  steps.position.set(x0, floor, -0.1 * u);
  const glow = many([[G.box(SW * 0.9, 0.012 * u, 0.36 * u, 0, 0, 0), 0xffe060]], N, 1.0), kid = createPerson({ u: 0.55 * u, shirt: 0xe04848 });
  group.add(steps, glow, kid.group);
  const loop = 4.8, top = (i) => (i >= 0 && i < N ? (N - i) * SH : 0), cx = (i) => x0 + (i + 0.5) * SW;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, inn = pre ? 1 : timeline(v, { i: [0, 0.3, 'back'] }).i, fade = between(v, 4.0, 4.4);
      let x = cx(N), y = 0, on = N;
      for (let k = 0; k < N; k++) { const from = N - k, to = N - k - 1, f = pre ? 0 : between(v, 0.4 + 0.45 * k, 0.8 + 0.45 * k); if (f > 0) { x = lerp(cx(from), cx(to), f); y = lerp(top(from), top(to), f) + 0.08 * u * Math.sin(Math.PI * f); if (f >= 1) on = to; } }
      const cheer = bump(v, 2.4, 1.4);
      kid.reset().face(cheer > 0 ? 0 : 'left').walk(v * 9, v > 0.4 && v < 2.2 ? 1 : 0); if (cheer > 0) { kid.raise('L', 2.8 * cheer); kid.raise('R', 2.8 * cheer); }
      kid.group.position.set(x, floor + y + 0.1 * u * bump(v, 2.6, 0.4), 0.0); kid.group.scale.setScalar(pop(inn * (1 - fade))); kid.update();
      for (let i = 0; i < N; i++) glow.set(i, cx(i), floor + top(i) + 0.007 * u, -0.1 * u, !pre && on <= i && v < 4.2 ? 1 : 0);
      glow.commit();
    },
  };
}

export function scissorCut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.45 * u, cy = B.cy, PW = 0.55 * u, PH = 0.2 * u, METAL = 0xd0d4dc;
  const dashes = Array.from({ length: 7 }, (_, i) => [G.box(0.04 * u, 0.008 * u, 0.004 * u, (i / 6 - 0.5) * PW * 0.9, -PH / 2 + 0.004 * u, 0.004 * u), 0x4a4a5a]);
  const topH = solidProp([[G.box(PW, PH, 0.006 * u, 0, 0, 0), 0x8ad0ff], ...dashes], 0.45), botH = solidProp([[G.box(PW, PH, 0.006 * u, 0, 0, 0), 0x8ad0ff]], 0.45);
  const blade = (s) => { const p = new THREE.Group(), m = solidProp([[G.box(0.26 * u, 0.022 * u, 0.008 * u, 0.13 * u, 0, s * 0.004 * u), METAL], [G.torus(0.045 * u, 0.012 * u, Math.PI * 2, -0.08 * u, -s * 0.03 * u, s * 0.004 * u), 0xe04848]], 0.45); p.add(m); return p; };
  const bA = blade(1), bB = blade(-1);
  group.add(topH, botH, bA, bB);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { cut: [0.4, 2.0], part: [2.5, 0.5, 'out'], away: [2.4, 0.4, 'in'], join: [4.3, 0.5] }), p = pre ? 0 : T.part - T.join;
      topH.position.set(cx, cy + PH / 2 + 0.12 * u * p, 0); topH.rotation.z = 0.12 * p; botH.position.set(cx, cy - PH / 2 - 0.12 * u * p, 0); botH.rotation.z = -0.1 * p;
      const x = cx - PW / 2 - 0.1 * u + (PW + 0.05 * u) * T.cut + 0.4 * u * T.away, open = T.cut > 0 && T.cut < 1 ? 0.3 * (0.5 + 0.5 * Math.cos(v * 14)) : 0.3;
      [bA, bB].forEach((b, i) => { b.visible = !pre && T.away < 1; b.position.set(x, cy + 0.3 * u * T.away, 0.02 * u); b.rotation.z = (i ? -1 : 1) * open; });
    },
  };
}
