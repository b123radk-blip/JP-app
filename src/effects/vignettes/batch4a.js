// Batch 4 kanji, part 1.
//   car-cross      交: a crossroads beside the kanji; one car drives across, another comes up the other road: they cross
//   tower-gap      差: two block towers; the right one grows taller, its extra blocks light up and a red bar measures the gap
//   jump-rope      度: a kid skips rope and a counter counts the times: 1, 2, 3, 4
//   factory-press  機: a ball rides a conveyor into a machine with turning gears; the press slams and a cube comes out
//   brick-build    建: bricks fly in and stack into a wall; a crane lowers the roof on top
//   bell-ring      音: a bell swings and rings, sound rings ripple out; a person turns and cups an ear
//   errand-run     用: a parent hands a kid a note; the kid runs off and comes back with a carton of milk; a heart
import * as THREE from 'three';
import { scramble, towerRise } from './variants4a.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, heart, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, liveText, puffs } from './helpers.js';
import { gearShape } from './batch3c.js';

const pop = (f) => Math.max(1e-3, f), ROAD = 0x3a3c44;

function carCross(ctx, spec, stage) {
  if (spec.outcome === 'scramble') return scramble(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.65 * u;
  const dash = (x, z, w, d) => [G.box(w, 0.004 * u, d, x, 0.024 * u, z), 0xf4f4f4];
  const roads = solidProp([[G.box(1.4 * u, 0.02 * u, 0.3 * u, 0, 0.01 * u, 0), ROAD], [G.box(0.3 * u, 0.021 * u, 1.0 * u, 0, 0.011 * u, 0), ROAD], ...[-0.55, -0.35, 0.35, 0.55].map((x) => dash(x * u, 0, 0.1 * u, 0.02 * u)), ...[-0.4, -0.25, 0.25, 0.4].map((z) => dash(0, z * u, 0.02 * u, 0.08 * u))], 0.3);
  const A = emblemProp('car', 0.42 * u, { color: 0xe04848 }), Bc = emblemProp('car', 0.42 * u, { color: 0x40a0e0 }), tilt = new THREE.Group();
  tilt.add(roads, A, Bc); tilt.position.set(cx, floor + 0.15 * u, 0); tilt.rotation.x = 0.55; group.add(tilt);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const S = acts(ctx, t, loop), pre = S.u < 0, v = pre ? -1 : S.v, a = pre ? 0.3 : between(v, 0.1, 2.3), b = pre ? 0.1 : between(v, 1.0, 3.4);
      A.position.set(-0.75 * u + 1.5 * u * a, 0.1 * u, 0); A.scale.setScalar(0.42 * u * pop(Math.min(1, Math.min(a, 1 - a) * 8))); A.idle(t);
      Bc.position.set(0, 0.1 * u, -0.55 * u + 1.0 * u * b); Bc.rotation.y = -Math.PI / 2; Bc.scale.setScalar(0.42 * u * pop(Math.min(1, Math.min(b, 1 - b) * 8))); Bc.idle(t);
    },
  };
}

function towerGap(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x1 = B.maxX + 0.3 * u, x2 = x1 + 0.3 * u, S = 0.15 * u, N = 9;
  const blocks = many([[G.box(S, S, S, 0, 0, 0), 0xffffff]], N, 0.45), PAL = [0x40a0e0, 0x60c060, 0xf0a030];
  for (let i = 0; i < N; i++) blocks.setColorAt(i, new THREE.Color(PAL[i % 3]));
  const bar = solidProp([[G.box(0.03 * u, 1, 0.02 * u, 0, 0.5, 0), 0xe02020]], 0.8), caps = many([[G.box(0.12 * u, 0.02 * u, 0.02 * u, 0, 0, 0), 0xe02020]], 2, 0.8);
  group.add(blocks, bar, caps);
  const loop = 5.0, lit = new THREE.Color(0xffe040);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.4, 4.8), m = pre ? 0 : timeline(v, { m: [2.2, 0.4, 'back'] }).m * (1 - out);
      for (let i = 0; i < 3; i++) blocks.set(i, x1, floor + S * (i + 0.5), 0, 1);
      for (let i = 0; i < 6; i++) {
        const f = i < 3 ? 1 : pre ? 0 : between(v, 0.3 + 0.5 * (i - 3), 0.7 + 0.5 * (i - 3)), k = i < 3 ? 1 : f * (1 - out);
        blocks.set(3 + i, x2, floor + S * (i + 0.5) + 0.5 * u * (1 - f) * (1 - f), 0, k);
        blocks.setColorAt(3 + i, i >= 3 && m > 0.5 ? lit : new THREE.Color(PAL[(3 + i) % 3]));
      }
      blocks.commit(); blocks.instanceColor.needsUpdate = true;
      const lo = floor + 3 * S, hi = floor + 6 * S, mx = x2 + 0.16 * u;
      bar.visible = m > 0.01; bar.position.set(mx, lo, 0.02 * u); bar.scale.set(1, pop((hi - lo) * m), 1);
      caps.set(0, mx - 0.04 * u, lo, 0.02 * u, m > 0.01 ? 1 : 0); caps.set(1, mx - 0.04 * u, lo + (hi - lo) * m, 0.02 * u, m > 0.01 ? 1 : 0); caps.commit();
    },
  };
}

function jumpRope(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.8 * u, shirt: 0xe07ab0 }), rope = solidProp([[new THREE.TorusGeometry(0.22 * u, 0.01 * u, 6, 40, Math.PI).scale(1, 2.6, 1), 0xffe040]], 0.7);
  const ropeP = new THREE.Group(); ropeP.add(rope); const count = liveText(u, { h: 0.22, w: 0.3, color: '#ffe060', bg: '#2a3040' });
  group.add(kid.group, ropeP, count);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, on = !pre && v > 0.3 && v < 4.3, th = on ? (v - 0.3) * Math.PI * 2 : 0;
      const hop = on ? 0.13 * u * Math.max(0, -Math.cos(th)) ** 2 : 0;
      kid.reset(); kid.raise('L', 0.45); kid.raise('R', 0.45); kid.bone('foreL').rotation.x = kid.bone('foreR').rotation.x = 0.6;
      kid.group.position.set(px, floor + hop, 0.1 * u); kid.update();
      ropeP.position.set(px, floor + 0.36 * u + hop, 0.12 * u); ropeP.rotation.x = th;
      const n = on ? Math.min(4, Math.floor((v - 0.3) + 0.5)) : pre ? 0 : 4; count.set(String(Math.max(0, n))); count.position.set(px + 0.42 * u, floor + 0.85 * u, 0.05 * u);
      count.scale.setScalar(1 + 0.25 * bump(((v - 0.8) % 1 + 1) % 1, 0, 0.3) * (on ? 1 : 0));
    },
  };
}

function factoryPress(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.65 * u, by = floor + 0.24 * u, GREY = 0x8a8e96;
  const body = solidProp([[G.box(1.1 * u, 0.04 * u, 0.24 * u, 0, by - floor, 0), 0x2a2a30], ...[-0.45, 0.45].map((x) => [G.box(0.04 * u, by - floor, 0.2 * u, x * u, (by - floor) / 2, 0), GREY]), [G.box(0.05 * u, 0.5 * u, 0.26 * u, -0.17 * u, by - floor + 0.25 * u, 0), 0xe0a020], [G.box(0.05 * u, 0.5 * u, 0.26 * u, 0.17 * u, by - floor + 0.25 * u, 0), 0xe0a020], [G.box(0.4 * u, 0.08 * u, 0.28 * u, 0, by - floor + 0.52 * u, 0), 0xe0a020]], 0.35);
  body.position.set(mx, floor, 0);
  const press = solidProp([[G.box(0.04 * u, 0.2 * u, 0.04 * u, 0, 0.1 * u, 0), GREY], [G.box(0.24 * u, 0.06 * u, 0.2 * u, 0, 0, 0), 0x60646c]], 0.4);
  const ball = solidProp([[G.sphere(0.07 * u), 0xe04848]], 0.5), cube = solidProp([[G.box(0.12 * u, 0.12 * u, 0.12 * u, 0, 0, 0), 0x40a0e0]], 0.5);
  const gear = (r, c) => solidProp([[G.extrude(gearShape(10), 1.2).scale(r / 5, r / 5, r / 5), c]], 0.45), g1 = gear(0.1 * u, 0x60c060), g2 = gear(0.07 * u, 0xe04848);
  g1.position.set(mx + 0.06 * u, by + 0.66 * u, 0.15 * u); g2.position.set(mx - 0.1 * u, by + 0.7 * u, 0.15 * u);
  const dust = many(PUFF(u, 0xd8d8d8), 5, 0.5);
  group.add(body, press, ball, cube, g1, g2, dust);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0.1, 1.2], slam: [1.4, 0.15, 'in'], lift: [1.7, 0.4], out: [2.2, 1.0], fade: [3.3, 0.4] });
      const down = T.slam - T.lift, shaped = v > 1.52, x = mx - 0.5 * u + 0.5 * u * T.in + 0.45 * u * T.out, k = pre ? 0 : (1 - T.fade) * Math.min(1, v * 5);
      press.position.set(mx, by + 0.47 * u - 0.32 * u * down, 0);
      ball.visible = !shaped && k > 0.01; ball.position.set(x, by + 0.09 * u, 0); ball.scale.setScalar(pop(k)); ball.rotation.z = -x / (0.07 * u);
      cube.visible = shaped && k > 0.01; cube.position.set(x, by + 0.08 * u, 0); cube.scale.set(pop(k * (1 + 0.3 * bump(v, 1.52, 0.3))), pop(k * (1 - 0.3 * bump(v, 1.52, 0.3))), pop(k));
      g1.rotation.z = t * 2; g2.rotation.z = -t * 2 * 10 / 7 + 0.3;
      puffs(dust, 0, 5, mx, by + 0.02 * u, between(v, 1.55, 2.1), u, 0.3); dust.commit();
    },
  };
}

function brickBuild(ctx, spec, stage) {
  if (spec.outcome === 'tower') return towerRise(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.45 * u, BW = 0.16 * u, BH = 0.08 * u, ROWS = 4, COLS = 4, N = ROWS * COLS;
  const bricks = many([[G.box(BW * 0.94, BH * 0.9, 0.12 * u, 0, 0, 0), 0xffffff]], N, 0.35);
  for (let i = 0; i < N; i++) bricks.setColorAt(i, new THREE.Color(i % 3 ? 0xc0583a : 0xa8482e));
  const spot = (i) => { const r = Math.floor(i / COLS), c = i % COLS; return [wx + (c - (COLS - 1) / 2) * BW + (r % 2 ? BW / 4 : -BW / 4), floor + BH * (r + 0.5)]; };
  const crane = solidProp([[G.box(0.05 * u, 1.1 * u, 0.05 * u, 0.55 * u, 0.55 * u, 0), 0xf0c020], [G.box(0.8 * u, 0.04 * u, 0.04 * u, 0.25 * u, 1.1 * u, 0), 0xf0c020], [G.box(0.12 * u, 0.1 * u, 0.1 * u, 0.62 * u, 1.05 * u, 0), 0x3a3a44]], 0.4);
  crane.position.set(wx, floor, -0.15 * u);
  const tri = new THREE.Shape(); tri.moveTo(-4.4, 0); tri.lineTo(4.4, 0); tri.lineTo(0, 2.4); tri.lineTo(-4.4, 0); const k = (COLS * BW + 0.08 * u) / 8.8;
  const roof = solidProp([[G.extrude(tri, 1.6).scale(k, k, k), 0xd04030]], 0.4), cable = solidProp([[G.box(0.008 * u, 1, 0.008 * u, 0, -0.5, 0), 0x3a3a44]], 0.3);
  group.add(bricks, crane, roof, cable);
  const loop = 5.2, wallTop = floor + ROWS * BH;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.5, 4.9);
      for (let i = 0; i < N; i++) { const f = pre ? 0 : between(v, 0.1 + 0.11 * i, 0.4 + 0.11 * i), [sx, sy] = spot(i), [x, y] = arc([wx + 0.6 * u, floor + 0.9 * u], [sx, sy], 0.2 * u, f); bricks.set(i, x, y, 0, f > 0 ? 1 - out : 0, (1 - f) * 2); }
      bricks.commit();
      const T = timeline(v, { lower: [2.2, 1.0, 'out'] }), ry = lerp(floor + 1.0 * u, wallTop, T.lower), rk = pre ? 0 : Math.min(1, between(v, 2.0, 2.2) * 1) * (1 - out);
      roof.visible = rk > 0.01; roof.position.set(wx, ry, 0); roof.scale.setScalar(pop(rk));
      const hold = v < 3.3, top = floor + 1.08 * u; cable.visible = !pre && hold && v > 2.0; cable.position.set(wx, top, 0); cable.scale.y = pop(top - ry - 2.4 * k);
    },
  };
}

function bellRing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.35 * u, top = floor + 0.95 * u;
  const frame = solidProp([[G.box(0.04 * u, 0.95 * u, 0.04 * u, -0.22 * u, 0.475 * u, 0), 0x8a5a30], [G.box(0.04 * u, 0.95 * u, 0.04 * u, 0.22 * u, 0.475 * u, 0), 0x8a5a30], [G.box(0.54 * u, 0.05 * u, 0.06 * u, 0, 0.95 * u, 0), 0x6a4020]], 0.3);
  frame.position.set(bx, floor, -0.05 * u);
  const prof = [[0, -0.3], [0.17, -0.3], [0.15, -0.25], [0.12, -0.1], [0.1, 0], [0.06, 0.05], [0, 0.06]].map(([x, y]) => new THREE.Vector2(x * u, y * u));
  const bell = new THREE.Group(), bellM = solidProp([[new THREE.LatheGeometry(prof, 28), 0xf0c030], [G.sphere(0.035 * u, 0, -0.3 * u, 0), 0x8a6a20], [G.torus(0.02 * u, 0.008 * u, Math.PI * 2, 0, 0.07 * u, 0), 0x8a6a20]], 0.5);
  bell.add(bellM); bell.position.set(bx, top - 0.06 * u, -0.05 * u);
  const rings = many([[G.torus(0.1 * u, 0.008 * u), 0xffe8a0]], 4, 0.9), p = createPerson({ u: 0.8 * u, shirt: 0x40a0e0 });
  group.add(frame, bell, rings, p.group);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ring = !pre && v > 0.3 && v < 2.9;
      bell.rotation.z = ring ? 0.55 * Math.sin((v - 0.3) * Math.PI * 2) : 0;
      for (let i = 0; i < 4; i++) { const f = ring || (v >= 2.9 && v < 3.6) ? ((v - 0.3) * 1.5 + i / 4) % 1 : 0; rings.set(i, bx, top - 0.25 * u, 0.0, f > 0 ? 0.6 + 3.2 * f : 0); }
      rings.commit();
      const turn = pre ? 0 : timeline(v, { a: [0.7, 0.4], b: [3.6, 0.4] }), cup = turn.a - turn.b;
      p.reset().face(-0.9 * cup); p.raise('R', 2.4 * cup); p.bone('foreR').rotation.z = -1.6 * cup; p.bone('head').rotation.z = 0.25 * cup;
      p.group.position.set(bx + 0.62 * u, floor, 0.15 * u); p.update();
    },
  };
}

function errandRun(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.35 * u, kx = mx + 0.35 * u;
  const mom = createPerson({ u: 0.95 * u, shirt: 0xe07ab0 }), kid = createPerson({ u: 0.6 * u, shirt: 0xf0a030 });
  const note = solidProp([[G.box(0.12 * u, 0.15 * u, 0.006 * u, 0, 0, 0), 0xffffff], [G.box(0.08 * u, 0.012 * u, 0.008 * u, 0, 0.03 * u, 0), 0x5a6a8a], [G.box(0.08 * u, 0.012 * u, 0.008 * u, 0, -0.01 * u, 0), 0x5a6a8a]], 0.5);
  const milk = solidProp([[G.box(0.1 * u, 0.16 * u, 0.1 * u, 0, 0, 0), 0xffffff], [G.box(0.102 * u, 0.06 * u, 0.102 * u, 0, -0.02 * u, 0), 0x3a7ad0], [G.cone(0.07 * u, 0.05 * u, 0, 0.105 * u, 0), 0xffffff]], 0.5), hrt = heart(u, { s: 0.16 });
  group.add(mom.group, kid.group, note, milk, hrt);
  const loop = 6.0, h = new THREE.Vector3(), m = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { give: [0.2, 0.5], run: [1.0, 1.0], back: [2.8, 1.0], hand: [3.9, 0.4], out: [5.4, 0.4] });
      const away = T.run * (1 - T.back), running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      mom.reset().face(1.0); mom.bone('armR').rotation.x = 1.2 * (bump(v, 0.1, 0.9) + bump(v, 3.8, 0.8)); mom.group.position.set(mx, floor, 0.05 * u); mom.update();
      kid.reset().face(running ? (T.back > 0 ? 'left' : 'right') : -1.0).walk(v * 12, running ? 1 : 0); kid.bone('armL').rotation.x = 1.0 * (T.give > 0.5 && T.run < 0.2 ? 1 : T.back > 0.9 ? 1 : 0);
      kid.group.position.set(kx + 0.75 * u * away, floor + 0.04 * u * (running ? Math.abs(Math.sin(v * 12)) : 0), 0.15 * u); kid.group.scale.setScalar(pop(1 - Math.min(1, Math.max(0, away - 0.75) * 4))); kid.update();
      bonePoint(mom, 'handR', 0.6, m); bonePoint(kid, 'handL', 0.6, h);
      note.visible = !pre && v > 0.15 && T.run < 0.8; note.position.copy(T.give < 1 ? m.clone().lerp(h, T.give) : h); note.position.z += 0.04 * u;
      milk.visible = !pre && T.back > 0.2 && T.out < 1; milk.position.copy(T.hand < 1 ? h.clone().lerp(m, T.hand) : m); milk.position.z += 0.05 * u; milk.scale.setScalar(pop(1 - T.out));
      const hs = pre ? 0 : bump(v, 4.3, 1.4); hrt.visible = hs > 0; hrt.scale.setScalar(pop(hs)); hrt.position.set(mx + 0.18 * u, floor + 1.15 * u, 0.1 * u);
    },
  };
}

export const SCENES = { 'car-cross': carCross, 'tower-gap': towerGap, 'jump-rope': jumpRope, 'factory-press': factoryPress, 'brick-build': brickBuild, 'bell-ring': bellRing, 'errand-run': errandRun };
