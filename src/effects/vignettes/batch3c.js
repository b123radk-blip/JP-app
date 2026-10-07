// Batch 3 kanji, part 3.
//   stretch-wide   広: two hands grab the kanji's edges and pull it out wide, an arrow pointing the way; it springs back
//   back-to-back   背: two kids stand back to back by a height chart; a ruler comes down on their heads, the short one
//                  sneaks onto tiptoe
//   empty-box      無: a box opens, tips forward to show the inside, turns upside down and shakes: nothing falls out
//                  but a speck of dust; a kid shrugs
//   gears-click    理: a hand slots the missing middle gear in; all three gears turn together and a lightbulb pops on
//   ball-steps     段: a ball bounces down a staircase one step at a time; each step lights up as the ball lands on it
//   map-unroll     図: a map unrolls; a dotted path draws itself from a little house to a red X
//   hall-rise      館: a big columned hall rises from the ground; visitors walk up its steps and go in
//   tool-use       使: a hand takes a wrench off a pegboard, turns a bolt with it, and hangs it back on its outline
//   barbell-flex   強: a person lifts a barbell overhead with ease, sets it down and flexes both arms in a burst of stars
import * as THREE from 'three';
import { acts, timeline, bump, wobble, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, handTo } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function stretchWide(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), g = stage.glyph;
  const L = createHand({ u: 0.5 * u, side: 1, sleeve: 0x4a8ae0 }), R = createHand({ u: 0.5 * u, side: -1, sleeve: 0x4a8ae0 }), arrow = emblemProp('arrow', 0.45 * u, { dir: 'right', color: 0xffe040 });
  group.add(L.group, R.group, arrow);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, base = g.userData.base;
      const T = timeline(v, { grab: [0, 0.5, 'out'], pull: [0.6, 1.3], let: [2.9, 0.15], gone: [3.3, 0.6, 'in'] });
      const sx = pre ? 1 : 1 + 0.65 * T.pull * (1 - T.let) + 0.12 * wobble(v, 3.05, 0.9, 2.5);
      g.scale.set(sx, 1 - 0.06 * (sx - 1), 1); g.position.set(base.x + (1 - sx) * (B.minX - base.x), base.y, base.z);
      const right = B.minX + sx * (B.maxX - B.minX), away = 0.45 * u * (1 - T.grab) + 0.5 * u * T.gone, hold = T.grab * (1 - T.let);
      L.group.visible = R.group.visible = !pre && T.gone < 1;
      L.group.rotation.set(0, 0, -Math.PI / 2); L.pose('open', 'grip', hold); handTo(L, B.minX - 0.03 * u - away, B.cy, 0.05 * u);
      R.group.rotation.set(0, 0, Math.PI / 2); R.pose('open', 'grip', hold); handTo(R, right + 0.03 * u + away, B.cy, 0.05 * u);
      const ar = pre ? 0 : bump(v, 0.7, 2.2); arrow.visible = ar > 0; arrow.scale.setScalar(pop(0.45 * u * ar)); arrow.position.set(right + 0.4 * u, B.cy + 0.3 * u, 0.05 * u); arrow.idle(t);
    },
  };
}

function backToBack(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.55 * u;
  const ticks = Array.from({ length: 11 }, (_, i) => [G.box((i % 5 ? 0.07 : 0.15) * u, 0.01 * u, 0.01 * u, -0.17 * u + (i % 5 ? 0.035 : 0.075) * u, (0.1 + 0.1 * i) * u, 0.012 * u), 0x3a4a6a]);
  const chart = solidProp([[G.box(0.5 * u, 1.2 * u, 0.02 * u, 0, 0.6 * u, 0), 0xf4f0e4], [G.box(0.5 * u, 0.25 * u, 0.021 * u, 0, 0.125 * u, 0), 0x9ad0f0], [G.box(0.5 * u, 0.06 * u, 0.025 * u, 0, 1.17 * u, 0), 0xffb040], ...ticks], 0.35);
  chart.position.set(bx, floor, -0.25 * u);
  const kidA = createPerson({ u: 0.95 * u, shirt: 0xe04848 }), kidB = createPerson({ u: 0.82 * u, shirt: 0x40a0e0 }), bar = solidProp([[G.box(0.5 * u, 0.03 * u, 0.14 * u, 0, 0, 0), 0x8a5a30], [G.box(0.48 * u, 0.008 * u, 0.12 * u, 0, 0.018 * u, 0), 0xf0d080]], 0.35);
  group.add(chart, kidA.group, kidB.group, bar);
  const loop = 5.6, hA = new THREE.Vector3(), hB = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 0.4, 'back'], bar: [0.7, 0.6, 'out'], tip: [1.8, 0.35, 'back'], untip: [3.0, 0.3], turn: [3.4, 0.3], barUp: [3.4, 0.4, 'in'], out: [4.8, 0.5, 'in'] });
      const k = pre ? 1 : T.in * (1 - T.out), tip = T.tip - T.untip;
      kidA.reset(); kidB.reset();
      kidA.face(-Math.PI / 2 + (Math.PI / 2 - 0.4) * T.turn); kidB.face(Math.PI / 2 - (Math.PI / 2 - 0.4) * T.turn);
      if (T.turn > 0) { kidA.raise('L', 0.6 * bump(v, 3.7, 0.8)); kidB.raise('R', 0.6 * bump(v, 3.7, 0.8)); }
      kidA.group.position.set(bx - 0.09 * u, floor, 0.1 * u); kidB.group.position.set(bx + 0.09 * u, floor + 0.07 * u * tip, 0.1 * u);
      kidA.group.scale.setScalar(pop(k)); kidB.group.scale.setScalar(pop(k)); kidA.update(); kidB.update();
      bonePoint(kidA, 'hair', 1, hA); bonePoint(kidB, 'hair', 1, hB);
      const top = Math.max(hA.y + 0.1 * kidA.u, hB.y + 0.1 * kidB.u), b = pre ? 0 : T.bar * (1 - T.barUp);
      bar.visible = b > 0.01; bar.position.set(bx, top + 0.6 * u * (1 - b), 0.1 * u); bar.rotation.z = 0.06 * Math.sin(t * 7) * tip;
    },
  };
}

function emptyBox(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.4 * u, W = 0.44 * u, H = 0.34 * u, T2 = 0.015 * u, KRAFT = 0xc89a60;
  const box = new THREE.Group(), walls = solidProp([[G.box(W, T2, W, 0, -H / 2, 0), 0x5a3a20], [G.box(W, H, T2, 0, 0, W / 2), KRAFT], [G.box(W, H, T2, 0, 0, -W / 2), KRAFT], [G.box(T2, H, W, W / 2, 0, 0), 0xb8884e], [G.box(T2, H, W, -W / 2, 0, 0), 0xb8884e], [G.box(W * 0.5, 0.03 * u, 0.003 * u, 0, H * 0.25, W / 2 + T2), 0xa07840]], 0.35);
  const flap = (s) => { const p = new THREE.Group(), m = solidProp([[G.box(W / 2, T2, W, 0, 0, 0), 0xd8aa70]], 0.35); m.position.x = -s * W / 4; p.position.set(s * W / 2, H / 2, 0); p.add(m); return p; };
  const flaps = [flap(-1), flap(1)]; box.add(walls, ...flaps);
  const dust = many(PUFF(u, 0xb8b0a0), 1, 0.4), kid = createPerson({ u: 0.75 * u, shirt: 0x9a60d0 });
  group.add(box, dust, kid.group);
  const loop = 5.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.5], show: [0.9, 0.5], lift: [1.7, 0.6], shrug: [3.5, 0.35, 'back'], unshrug: [4.4, 0.3], down: [4.5, 0.6], close: [5.2, 0.4] });
      const o = pre ? 0 : T.open - T.close, shake = v > 2.3 && v < 3.4 ? Math.sin((v - 2.3) * 30) * (1 - (v - 2.3) / 1.1) : 0;
      flaps[0].rotation.z = 2.6 * o; flaps[1].rotation.z = -2.6 * o;
      const up = T.lift - T.down;
      box.position.set(bx + 0.04 * u * shake, floor + H / 2 + 0.4 * u * up + 0.02 * u * Math.abs(shake), 0.05 * u);
      box.rotation.set(0.9 * (T.show - T.lift), 0, Math.PI * up + 0.12 * shake);
      const d = pre ? 0 : between(v, 2.7, 3.5); dust.set(0, bx, floor + 0.36 * u - 0.33 * u * d, 0.08 * u, d > 0 && d < 1 ? 0.35 * Math.sin(Math.PI * d) : 0); dust.commit();
      const sh = T.shrug - T.unshrug;
      kid.group.position.set(bx + 0.55 * u, floor, 0.15 * u); kid.face(-0.6).reset(); kid.raise('L', 0.7 * sh); kid.raise('R', 0.7 * sh);
      kid.bone('foreL').rotation.z = 1.2 * sh; kid.bone('foreR').rotation.z = -1.2 * sh; kid.bone('head').rotation.z = 0.25 * sh; kid.update();
    },
  };
}

function gearShape(n, R = 5, r = 4.1, hole = 1.1) {
  const sh = new THREE.Shape(), da = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * da;
    [[r, a], [R, a + da * 0.15], [R, a + da * 0.45], [r, a + da * 0.6]].forEach(([q, b], j) => (i + j ? sh.lineTo(q * Math.cos(b), q * Math.sin(b)) : sh.moveTo(q * Math.cos(b), q * Math.sin(b))));
  }
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); sh.holes.push(h);
  return sh;
}

function gearsClick(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), gy = B.cy - 0.05 * u, r1 = 0.2 * u, r2 = 0.15 * u, d = r1 + r2 - 0.02 * u;
  const gear = (n, r, color) => solidProp([[G.extrude(gearShape(n), 1.2).scale(r / 5, r / 5, r / 5), color], [G.cyl(r * 0.25, r * 0.25, 0.06 * u, 0, 0, 0, Math.PI / 2), 0x5a5a64]], 0.45);
  const gears = [gear(12, r1, 0x4a8ae0), gear(9, r2, 0xe04848), gear(12, r1, 0x40b060)], X = [B.maxX + 0.28 * u, B.maxX + 0.28 * u + d, B.maxX + 0.28 * u + 2 * d];
  const hand = createHand({ u: 0.5 * u, side: -1, sleeve: 0xf0a030 }), bulb = emblemProp('lightbulb', 0.35 * u);
  gears[0].position.set(X[0], gy, 0); gears[2].position.set(X[2], gy, 0);
  group.add(...gears, hand.group, bulb);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { carry: [0.2, 0.9, 'smooth'], leave: [1.2, 0.5, 'in'], bulb: [1.9, 0.4, 'back'], out: [4.6, 0.6, 'in'] });
      const [x, y] = arc([X[1] + 0.35 * u, gy + 0.7 * u], [X[1], gy], 0.1 * u, T.carry), on = pre ? 0 : 1 - T.out;
      gears[1].visible = !pre && T.carry > 0 && T.out < 1; gears[1].position.set(x, y + 0.6 * u * T.out, 0.01 * u); gears[1].scale.setScalar(pop(1 - T.out));
      const run = pre ? 0 : Math.max(0, Math.min(v, 4.6) - 1.3) * 2.2;
      gears[0].rotation.z = run; gears[2].rotation.z = run; gears[1].rotation.z = -run * r1 / r2 + Math.PI / 9;
      hand.group.visible = !pre && T.leave < 1; hand.group.rotation.set(0, 0, Math.PI); hand.pose('grip'); handTo(hand, x, y + r2 + 0.02 * u + 0.6 * u * T.leave, 0.05 * u);
      const bl = T.bulb * on; bulb.visible = bl > 0.01; bulb.scale.setScalar(pop(0.35 * u * bl)); bulb.position.set(X[1], gy + 0.48 * u, 0.05 * u); bulb.idle(t);
    },
  };
}

function ballSteps(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u, N = 4, SW = 0.22 * u, SH = 0.15 * u, R = 0.06 * u;
  const steps = solidProp(Array.from({ length: N }, (_, i) => [G.box(SW, (N - i) * SH, 0.4 * u, (i + 0.5) * SW, (N - i) * SH / 2, 0), i % 2 ? 0xb8b0a4 : 0xd0c8bc]), 0.3);
  steps.position.set(x0, floor, -0.1 * u);
  const glow = many([[G.box(SW * 0.9, 0.012 * u, 0.36 * u, 0, 0, 0), 0xffe060]], N, 1.0), ball = solidProp([[G.sphere(R), 0xe04848], [G.torus(R, R * 0.15), 0xffffff]], 0.5);
  const nums = Array.from({ length: N }, (_, i) => { const p = textPlane(String(N - i), { h: 0.11 * u, color: '#2a3550' }); p.position.set(x0 + (i + 0.5) * SW, floor + (N - i - 0.5) * SH, 0.105 * u); return p; });
  group.add(steps, glow, ball, ...nums);
  const loop = 4.2, top = (i) => (i < N ? (N - i) * SH : 0), cx = (i) => x0 + (i + 0.5) * SW;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, inn = pre ? 1 : timeline(v, { i: [0, 0.3, 'back'] }).i, fade = between(v, 3.1, 3.5);
      let x = cx(0), y = top(0), landed = 0;
      for (let j = 0; j < N; j++) { const f = pre ? 0 : between(v, 0.4 + 0.42 * j, 0.8 + 0.42 * j); if (f > 0) { x = lerp(cx(j), cx(j + 1), f); y = lerp(top(j), top(j + 1), f) + 0.12 * u * Math.sin(Math.PI * f); if (f >= 1) landed = j + 1; } }
      if (landed >= N) x += 0.22 * u * between(v, 2.1, 3.1);
      ball.position.set(x, floor + y + R, 0.05 * u); ball.rotation.z = -x / R * 0.5; ball.scale.setScalar(pop(inn * (1 - fade)));
      for (let i = 0; i < N; i++) { const lit = !pre && (i === 0 || landed >= i) && v < 3.6; glow.set(i, x0 + (i + 0.5) * SW, floor + top(i) + 0.007 * u, -0.1 * u, lit ? 1 : 0); }
      glow.commit();
    },
  };
}

function mapUnroll(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), mx = B.maxX + 0.15 * u, my = B.cy + 0.05 * u, W = 0.82 * u, H = 0.6 * u;
  const tree = (x, y) => [G.cone(0.03 * u, 0.07 * u, x, y, 0.012 * u), 0x2a7a3a];
  const paper = solidProp([[G.box(W, H, 0.01 * u, W / 2, 0, 0), 0xf4e6c0], [G.sphere(0.13 * u, W * 0.28, 0.1 * u, 0.006 * u, 1.4, 1, 0.08), 0x9ac878], [G.sphere(0.11 * u, W * 0.74, -0.12 * u, 0.006 * u, 1.3, 1, 0.08), 0x9ac878], [G.tube([[W * 0.5, H / 2], [W * 0.58, 0.05 * u], [W * 0.5, -H / 2]], 0.016 * u).scale(1, 1, 0.3).translate(0, 0, 0.008 * u), 0x5aa0e0], tree(W * 0.22, 0.14 * u), tree(W * 0.32, 0.06 * u), tree(W * 0.78, -0.1 * u), [G.box(0.07 * u, 0.05 * u, 0.01 * u, W * 0.14, -H * 0.3, 0.01 * u), 0xe8e0d0], [G.cone(0.05 * u, 0.04 * u, W * 0.14, -H * 0.3 + 0.045 * u, 0.012 * u), 0xd04030]], 0.4);
  const X = solidProp([[G.box(0.13 * u, 0.03 * u, 0.01 * u, 0, 0, 0, Math.PI / 4), 0xe02020], [G.box(0.13 * u, 0.03 * u, 0.01 * u, 0, 0, 0, -Math.PI / 4), 0xe02020]], 0.7);
  const dots = many([[G.sphere(0.012 * u), 0xa03020]], 12, 0.5), roll = solidProp([[G.cyl(0.04 * u, 0.04 * u, H * 1.04, 0, 0, 0), 0xe8d8b0]], 0.35);
  const map = new THREE.Group(); map.add(paper, dots, X); map.position.set(mx, my, 0.02 * u); X.position.set(W * 0.86, H * 0.26, 0.012 * u);
  group.add(map, roll);
  const loop = 5.0, P = (s) => [W * (0.14 + 0.7 * s), -H * 0.3 + H * 0.56 * s + 0.08 * u * Math.sin(Math.PI * 2 * s)];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { un: [0, 0.8, 'out'], path: [1.0, 1.6], x: [2.7, 0.35, 'back'], re: [4.3, 0.6, 'in'] }), f = pre ? 0 : T.un * (1 - T.re);
      map.visible = f > 0.01; map.scale.x = pop(f); roll.position.set(mx + W * f, my, 0.05 * u); roll.rotation.y = f * 8;
      for (let i = 0; i < 12; i++) { const s = (i + 0.5) / 12, [px, py] = P(s); dots.set(i, px, py, 0.012 * u, T.path * 12 > i && f > 0.99 ? 1 : 0); }
      dots.commit();
      const xs = f > 0.99 ? T.x : 0; X.visible = xs > 0.01; X.scale.setScalar(pop(xs * (1 + 0.15 * Math.sin(t * 5))));
    },
  };
}

function hallRise(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.55 * u, W = 0.85 * u;
  const tri = new THREE.Shape(); tri.moveTo(-4.6, 0); tri.lineTo(4.6, 0); tri.lineTo(0, 1.7); tri.lineTo(-4.6, 0); const k = W / 9;
  const cols = Array.from({ length: 5 }, (_, i) => [G.cyl(0.03 * u, 0.034 * u, 0.42 * u, (i / 4 - 0.5) * W * 0.78, 0.33 * u, 0.06 * u), 0xf6f4ee]);
  const hall = solidProp([[G.box(W, 0.04 * u, 0.4 * u, 0, 0.02 * u, 0.02 * u), 0xc8c4bc], [G.box(W * 0.94, 0.04 * u, 0.34 * u, 0, 0.06 * u, 0), 0xd8d4cc], [G.box(W * 0.88, 0.04 * u, 0.28 * u, 0, 0.1 * u, -0.02 * u), 0xe4e0d8], ...cols, [G.box(W * 0.82, 0.42 * u, 0.02 * u, 0, 0.33 * u, -0.1 * u), 0xb8b0a0], [G.box(0.15 * u, 0.25 * u, 0.01 * u, 0, 0.245 * u, -0.085 * u), 0xffc870], [G.box(W * 0.92, 0.05 * u, 0.28 * u, 0, 0.565 * u, -0.02 * u), 0xeeeae2], [G.extrude(tri, 2.6).scale(k, k, k).translate(0, 0.59 * u, -0.02 * u), 0xe4e0d8]], 0.35);
  hall.position.set(hx, floor, -0.05 * u);
  const dust = many(PUFF(u), 6, 0.4), people = [createPerson({ u: 0.3 * u, shirt: 0xe04848 }), createPerson({ u: 0.28 * u, shirt: 0x40a0e0 })];
  group.add(hall, dust, ...people.map((p) => p.group));
  const loop = 4.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rise = timeline(A.setup, { r: [0, 1, 'back'] }).r;
      hall.scale.y = pop(rise);
      for (let i = 0; i < 6; i++) { const a = (i / 5 - 0.5) * W, f = A.setup > 0 && A.setup < 1 ? A.setup : 0; dust.set(i, hx + a * (1 + 0.3 * f), floor + 0.03 * u, 0.15 * u, f ? 1.4 * Math.sin(Math.PI * f) : 0); }
      dust.commit();
      people.forEach((p, i) => {
        const f = pre ? 0 : between(v, 0.2 + 0.7 * i, 2.4 + 0.7 * i), z = lerp(0.55 * u, -0.06 * u, f), x = hx + lerp(0.5 * u + 0.1 * u * i, 0, Math.min(1, f * 1.6));
        p.group.visible = f > 0 && f < 1 && z > -0.04 * u; p.group.position.set(x, floor + 0.12 * u * between(z, 0.24 * u, 0.06 * u), z);
        p.face(Math.PI + (f < 0.62 ? -0.8 : 0)).reset().walk(v * 10, 1).update();
      });
    },
  };
}

function toolUse(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, py = floor + 0.68 * u, J = [0.12 * u, 0.13 * u], L = 0.34 * u, METAL = 0xc8ccd4;
  const board = solidProp([[G.box(0.62 * u, 0.46 * u, 0.02 * u, 0, 0, 0), 0xc8a070], [G.box(0.07 * u, L, 0.004 * u, J[0], J[1] - L / 2 - 0.02 * u, 0.012 * u), 0xffffff], [G.cyl(0.06 * u, 0.06 * u, 0.004 * u, J[0], J[1], 0.012 * u, Math.PI / 2), 0xffffff], [G.box(0.04 * u, 0.26 * u, 0.03 * u, -0.18 * u, -0.02 * u, 0.025 * u), 0x8a5a30], [G.box(0.14 * u, 0.06 * u, 0.04 * u, -0.18 * u, 0.12 * u, 0.025 * u), 0x60646c], [G.cyl(0.02 * u, 0.02 * u, 0.12 * u, -0.04 * u, 0.06 * u, 0.025 * u), 0xe04848], [G.cyl(0.006 * u, 0.006 * u, 0.14 * u, -0.04 * u, -0.07 * u, 0.025 * u), METAL]], 0.35);
  board.position.set(px, py, -0.05 * u);
  const wrench = solidProp([[G.box(L - 0.05 * u, 0.04 * u, 0.02 * u, (L + 0.05 * u) / 2, 0, 0), METAL], [G.torus(0.045 * u, 0.016 * u, Math.PI * 1.45, 0, 0, 0, Math.PI * 0.78), METAL]], 0.45);
  const block = solidProp([[G.box(0.32 * u, 0.22 * u, 0.2 * u, 0, 0.11 * u, 0), 0x9a6a3a]], 0.3), bolt = solidProp([[G.cyl(0.04 * u, 0.04 * u, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 6), 0x8a8e96]], 0.45);
  const bx = px - 0.05 * u, by = floor + 0.12 * u; block.position.set(bx, floor, 0); bolt.position.set(bx, by, 0.11 * u);
  const hand = createHand({ u: 0.5 * u, side: -1, sleeve: 0x3a6ad8 }); hand.pose('grip');
  group.add(board, wrench, block, bolt, hand.group);
  const loop = 5.6, home = [px + J[0], py + J[1], -0.02 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [0, 0.5, 'out'], carry: [0.6, 0.7], turn: [1.4, 1.8], back: [3.4, 0.7], leave: [4.2, 0.5, 'in'] });
      const c = T.carry - T.back, a0 = -Math.PI / 2, a1 = 0.5, swing = 0.5 * (1 - Math.cos(Math.PI * 2 * 3 * T.turn));
      const [jx, jy] = arc([home[0], home[1]], [bx, by], 0.12 * u, c), a = lerp(a0, a1, c) - 0.9 * swing, jz = lerp(home[2], 0.14 * u, c);
      wrench.position.set(jx, jy, jz); wrench.rotation.z = a;
      bolt.rotation.z = c > 0.99 ? a - a1 : 0; bolt.position.z = 0.11 * u - 0.015 * u * T.turn;
      const hx = jx + L * 0.85 * Math.cos(a), hy = jy + L * 0.85 * Math.sin(a), off = 0.6 * u * ((1 - T.reach) + T.leave);
      hand.group.visible = !pre && T.leave < 1; hand.group.rotation.set(0, 0, a + Math.PI / 2); handTo(hand, hx + off, hy - 0.3 * off, jz + 0.03 * u);
    },
  };
}

function barbellFlex(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, PR = 0.11 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0xe04848 });
  const bar = solidProp([[G.cyl(0.012 * u, 0.012 * u, 1.0 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xb0b4bc], ...[-1, 1].flatMap((s) => [[G.cyl(PR, PR, 0.05 * u, s * 0.4 * u, 0, 0, 0, 0, Math.PI / 2), 0x2a2a30], [G.cyl(PR * 0.75, PR * 0.75, 0.04 * u, s * 0.45 * u, 0, 0, 0, 0, Math.PI / 2), 0x3a3a44]])], 0.35);
  const pow = burst(u, { s: 0.9, n: 10, color: 0xffd040 });
  group.add(pow, p.group, bar);
  const loop = 5.4, hL = new THREE.Vector3(), hR = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pick: [0.1, 0.45], press: [0.7, 0.45, 'out'], lower: [1.9, 0.45], drop: [2.4, 0.3, 'in'], flex: [2.8, 0.35, 'back'], relax: [4.6, 0.45] });
      const up = T.press - T.lower, fl = T.flex - T.relax, holding = T.pick > 0 && T.drop < 1;
      p.group.position.set(px, floor, 0.1 * u); p.reset().face('toward');
      const r = 0.25 + 2.65 * up + 1.3 * fl; p.raise('L', r); p.raise('R', r);
      p.bone('foreL').rotation.z = 1.8 * fl; p.bone('foreR').rotation.z = -1.8 * fl;
      p.update(); bonePoint(p, 'handL', 0.5, hL); bonePoint(p, 'handR', 0.5, hR);
      const hy = (hL.y + hR.y) / 2, rest = floor + PR;
      bar.position.set(px, pre || !holding && T.drop >= 1 ? rest : T.drop > 0 ? lerp(hy, rest, T.drop) : lerp(rest, hy, T.pick), 0.24 * u);
      const b = pre ? 0 : fl; pow.visible = b > 0.01; pow.position.set(px, floor + 0.62 * u, -0.1 * u); pow.scale.setScalar(pop(b * (1 + 0.1 * Math.sin(t * 8)))); pow.rotation.z = t * 0.6;
    },
  };
}

export const SCENES = { 'stretch-wide': stretchWide, 'back-to-back': backToBack, 'empty-box': emptyBox, 'gears-click': gearsClick, 'ball-steps': ballSteps, 'map-unroll': mapUnroll, 'hall-rise': hallRise, 'tool-use': toolUse, 'barbell-flex': barbellFlex };
