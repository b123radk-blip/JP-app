// Other outcomes of Batch 2 kanji scenes, for their words (same scene type, another option; see variants.js).
//   egg-hatch    outcome step     初めて: the chick climbs out and takes its first wobbly steps, plops down, gets up
//   rope-pull    outcome drawer   引く: a person pulls a drawer out of a chest of drawers; inside, a sock
//   stop-sign    outcome car      止まる: a car rolls up to the stop sign and stops, bobbing
//   sing-mic     outcome shower   歌う: a person sings in the shower, water and notes pouring down and out
//   clouds-part  outcome rainbow  晴れる: the rain stops, the clouds drift off and a rainbow arcs over
//   refuse-spoon outcome stink    嫌い: a hand dangles a stinky sock (green wiggles); the kid holds their nose and turns away
//   roller-blue  outcome balloon  青い: a blue balloon blows up big and floats away up on its string
//   line-up      outcome height   並ぶ: kids of different heights shuffle until they stand in a row, smallest to tallest
//   shop-open    outcome veg      八百屋: the shutter rolls up on crates of vegetables: carrots, cabbages, tomatoes
//   shop-open    outcome closed   閉まる: the shutter rolls DOWN by itself and a CLOSED sign swings on it
//   sister-help  outcome hair     お姉さん: a big girl braids a little one's hair and ties a ribbon in it
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo, bonePoint, wisps } from './helpers.js';

const chickGeo = (u, S) => [[G.sphere(0.075 * S * u, 0, 0, 0), 0xffe040], [G.cone(0.02 * S * u, 0.04 * S * u, 0, -0.01 * S * u, 0.08 * S * u, -Math.PI / 2), 0xff8a20], [G.sphere(0.014 * S * u, -0.03 * S * u, 0.02 * S * u, 0.065 * S * u, 1, 1, 0.5), 0x101010], [G.sphere(0.014 * S * u, 0.03 * S * u, 0.02 * S * u, 0.065 * S * u, 1, 1, 0.5), 0x101010], [G.cyl(0.006 * S * u, 0.006 * S * u, 0.05 * S * u, -0.025 * S * u, -0.09 * S * u, 0), 0xff8a20], [G.cyl(0.006 * S * u, 0.006 * S * u, 0.05 * S * u, 0.025 * S * u, -0.09 * S * u, 0), 0xff8a20]];

export function chickStep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, S = 1.6, ex = B.maxX + 0.35 * u;
  const shell = solidProp([[new THREE.SphereGeometry(0.1 * S * u, 24, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55).scale(1, 1.3, 1), 0xfaf6ee]], 0.4), chick = solidProp(chickGeo(u, S), 0.5);
  shell.position.set(ex, floor + 0.12 * S * u, 0);
  group.add(shell, chick);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.2, 0.5, 'out'], walk: [0.8, 2.6, 'linear'], back: [4.3, 0.6] });
      const plop = bump(v, 1.8, 0.6), x = ex + 0.8 * u * T.walk * (1 - T.back), wob = Math.sin(v * 12) * 0.25 * (T.walk > 0 && T.walk < 1 ? 1 : 0);
      chick.position.set(T.out < 1 ? ex : x, floor + 0.12 * S * u + 0.12 * u * Math.sin(Math.PI * T.out) - 0.06 * u * T.out + 0.03 * u * Math.abs(Math.sin(v * 12)) * (1 - plop), 0.05 * u);
      chick.rotation.set(0, 0.6, wob + 1.2 * plop); chick.visible = !pre;
    },
  };
}

export function drawerPull(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u;
  const chest = solidProp([[G.box(0.6 * u, 0.7 * u, 0.4 * u, 0, 0.35 * u, -0.2 * u), 0xb07040], [G.box(0.5 * u, 0.18 * u, 0.02 * u, 0, 0.5 * u, 0.0), 0x9a5a30], [G.sphere(0.03 * u, 0, 0.5 * u, 0.02 * u), 0xf0d060]], 0.3);
  const drawer = solidProp([[G.box(0.52 * u, 0.18 * u, 0.4 * u, 0, 0, -0.2 * u), 0xc88050], [G.box(0.2 * u, 0.05 * u, 0.02 * u, 0, 0.1 * u, -0.25 * u), 0xffffff], [G.sphere(0.03 * u, 0, 0, 0.02 * u), 0xf0d060]], 0.3);
  chest.position.set(cx, floor, 0); const p = createPerson({ u: 0.85 * u, shirt: 0x6a9a3a });
  group.add(chest, drawer, p.group);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tug: [0.3, 0.8, 'out'], push: [3.4, 0.8] }), out = pre ? 0 : T.tug - T.push;
      drawer.position.set(cx, floor + 0.2 * u, 0.3 * u * out);
      p.group.position.set(cx + 0.55 * u, floor, 0.3 * u * out + 0.15 * u); p.face(-1.2).reset(); p.lean(-0.25 * bump(v, 0.3, 0.8));
      p.bone('armR').rotation.x = 1.3; p.bone('foreR').rotation.x = 0.3; p.update();
    },
  };
}

export function stopCar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u;
  const sign = emblemProp('stop', 0.8 * u), car = emblemProp('car', 0.5 * u, { color: 0x40a0e0 });
  sign.position.set(sx, floor + 0.55 * u, -0.1 * u);
  group.add(sign, car);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      sign.idle(0);
      const T = timeline(v, { come: [0, 1.4, 'out'], go: [3.4, 1.0, 'in'] }), x = sx + 0.55 * u + 1.4 * u * (1 - T.come) - 1.8 * u * T.go;
      car.position.set(x, floor + 0.15 * u + 0.012 * u * wobble(v, 1.4, 0.5, 5), 0.15 * u); car.rotation.z = 0.06 * wobble(v, 1.4, 0.6, 3); car.visible = !pre; car.idle(T.come < 1 || T.go > 0 ? v : 0);
    },
  };
}

export function showerSing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const head = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.4 * u, 0.15 * u, 0.2 * u, 0), 0xc0c8d0], [G.cyl(0.08 * u, 0.04 * u, 0.06 * u, 0, 0, 0), 0xc0c8d0], [G.box(0.2 * u, 0.02 * u, 0.02 * u, 0.07 * u, 0.4 * u, 0), 0xc0c8d0]], 0.35);
  head.position.set(px, floor + 1.2 * u, 0.0);
  const water = many([[G.sphere(0.014 * u, 0, 0, 0, 0.7, 2.4, 0.7), 0x8ad0ff]], 16, 0.8), notes = many([[G.sphere(0.035 * u, 0, 0, 0, 1.3, 1, 0.7), 0xffe060], [G.box(0.01 * u, 0.12 * u, 0.01 * u, 0.04 * u, 0.06 * u, 0), 0xffe060]], 5, 0.9);
  const tub = solidProp([[G.box(0.6 * u, 0.2 * u, 0.35 * u, 0, 0.1 * u, 0), 0xf4f4f8]], 0.3), p = createPerson({ u: 0.85 * u, shirt: 0xffd2b0 });
  tub.position.set(px, floor, 0);
  group.add(head, water, p.group, tub, notes);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      for (let i = 0; i < 16; i++) { const f = ((t * 1.5 + i / 16) % 1); water.set(i, px + (i % 4 - 1.5) * 0.04 * u, floor + 1.15 * u - 0.9 * u * f, (Math.floor(i / 4) - 1.5) * 0.04 * u, 1); }
      water.commit();
      p.group.position.set(px, floor + 0.05 * u, -0.02 * u); p.face(0).reset(); p.group.rotation.z = 0.08 * Math.sin(v * 3);
      p.raise('R', 2.2 + 0.3 * Math.sin(v * 4)); p.bone('head').rotation.x = -0.2; p.update();
      for (let i = 0; i < 5; i++) { const f = ((v * 0.5 + i / 5) % 1); notes.set(i, px + 0.2 * u + 0.6 * u * f, floor + 0.9 * u + 0.4 * u * f, 0.1 * u, pre ? 0 : Math.sin(Math.PI * f)); }
      notes.commit();
    },
  };
}

export function rainbowClear(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.65 * u;
  const COLORS = [0xe03838, 0xf08a30, 0xf0d040, 0x50c050, 0x3a8ae0, 0x8a50d0], bow = solidProp(COLORS.map((c, i) => [G.torus((0.62 - i * 0.05) * u, 0.025 * u, Math.PI), c]), 0.6);
  bow.position.set(cx, floor + 0.05 * u, -0.15 * u);
  const cloud = solidProp([[G.sphere(0.2 * u, 0, 0, 0, 1.4, 0.8, 0.8), 0x9aa0ac], [G.sphere(0.15 * u, -0.2 * u, -0.04 * u), 0x9aa0ac], [G.sphere(0.16 * u, 0.2 * u, -0.03 * u), 0x9aa0ac]], 0.3), rain = many([[G.sphere(0.014 * u, 0, 0, 0, 0.7, 2.6, 0.7), 0x8ac8ff]], 14, 0.8);
  group.add(bow, cloud, rain);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { stop: [0.8, 0.3], drift: [1.0, 1.2, 'in'], bow: [1.8, 1.0, 'out'], back: [4.3, 0.6] }), wet = pre ? 1 : 1 - T.stop + T.back;
      cloud.position.set(cx + 1.6 * u * (T.drift - T.back), floor + 1.0 * u, 0.0); cloud.visible = T.drift < 1 || T.back > 0;
      for (let i = 0; i < 14; i++) { const f = ((t * 1.6 + i / 14 * 3) % 1); rain.set(i, cx + (i % 7 - 3) * 0.09 * u, floor + 0.9 * u - 0.9 * u * f, 0.05 * u, wet > 0.5 ? 1 : 0); }
      rain.commit();
      const b = pre ? 0 : T.bow * (1 - T.back); bow.visible = b > 0.01; bow.scale.set(Math.max(1e-3, b), Math.max(1e-3, b), 1);
    },
  };
}

export function stinkSock(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.4 * u;
  const kid = createPerson({ u: 0.85 * u, shirt: 0xe07ab0 }), hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x6a6a7a });
  const sock = solidProp([[G.box(0.08 * u, 0.22 * u, 0.04 * u, 0, -0.13 * u, 0), 0xf0f0e0], [G.box(0.14 * u, 0.07 * u, 0.045 * u, -0.03 * u, -0.26 * u, 0), 0xf0f0e0], [G.box(0.085 * u, 0.04 * u, 0.042 * u, 0, -0.04 * u, 0), 0xe04848]], 0.4);
  const stink = many([[G.tube([[0, 0], [0.02, 0.04], [-0.02, 0.08], [0.02, 0.12]].map(([x, y]) => [x * u, y * u]), 0.008 * u), 0x60c040]], 3, 0.9);
  hand.pose('pinch'); hand.grip.add(sock); hand.group.rotation.z = 1.4;
  group.add(kid.group, hand.group, stink);
  const loop = 4.6, at = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { near: [0.2, 0.7], away: [3.6, 0.6] }), near = pre ? 0 : T.near - T.away;
      kid.group.position.set(kx, floor, 0.05 * u); kid.face(0.3).reset();
      const holdNose = between(v, 0.6, 0.8) * (1 - T.away); kid.bone('armR').rotation.x = 1.6 * holdNose; kid.bone('foreR').rotation.x = 1.6 * holdNose; kid.raise('R', -0.5 * holdNose);
      kid.bone('head').rotation.y = -0.8 * holdNose; kid.lean(-0.2 * holdNose); kid.update();
      hand.group.visible = !pre; hand.update(); handTo(hand, kx + (0.35 + 0.6 * (1 - near)) * u, floor + 0.95 * u, 0.12 * u);
      bonePoint(hand, 'palm', 0.9, at);
      for (let i = 0; i < 3; i++) { const f = ((v + i / 3) % 1); stink.set(i, at.x - 0.05 * u + i * 0.05 * u, at.y - 0.35 * u + 0.15 * u * f, at.z + 0.05 * u, near > 0.5 ? Math.sin(Math.PI * f) : 0, 0.3 * Math.sin(v * 6 + i)); }
      stink.commit();
    },
  };
}

export function blueBalloon(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, COLOR = spec.color ?? 0x2a6ae0;
  const balloon = solidProp([[G.sphere(0.22 * u, 0, 0, 0, 1, 1.15, 1), COLOR], [G.cone(0.03 * u, 0.04 * u, 0, -0.26 * u, 0, Math.PI), COLOR]], 0.5), string = solidProp([[G.cyl(0.003 * u, 0.003 * u, 1, 0, -0.5, 0), 0xf0f0f0]], 0.3);
  group.add(balloon, string);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { blow: [0.2, 1.2, 'out'], fly: [1.8, 2.4, 'in'], new: [4.4, 0.5] });
      const k = pre ? 0.15 : T.fly >= 1 ? 0.15 * T.new : 0.15 + 0.85 * T.blow, y = floor + 0.55 * u + 1.4 * u * (T.fly < 1 ? T.fly : 0);
      balloon.position.set(bx + 0.05 * u * Math.sin(v * 2) * T.fly, y, 0.03 * u); balloon.scale.setScalar(Math.max(1e-3, k)); balloon.visible = T.fly < 1 || T.new > 0;
      string.position.set(bx, y - 0.25 * u * k, 0.03 * u); string.scale.set(1, 0.45 * u, 1); string.visible = balloon.visible;
    },
  };
}

export function heightLine(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, H = [0.75, 0.5, 0.95, 0.6, 0.85], ORDER = [1, 3, 0, 4, 2];
  const COLORS = [0xe04848, 0xf0a030, 0x50b050, 0x4a8ae0, 0xa060d0], kids = H.map((h, i) => createPerson({ u: h * u, shirt: COLORS[i] }));
  group.add(...kids.map((k) => k.group));
  const loop = 4.6, slot = (j) => B.maxX + 0.35 * u + j * 0.28 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const sort = pre ? 0 : between(v, 0.5, 2.0) * (1 - between(v, 3.9, 4.5));
      kids.forEach((k, i) => {
        const from = slot(i), to = slot(ORDER.indexOf(i)), x = from + (to - from) * sort, moving = sort > 0 && sort < 1;
        k.group.position.set(x, floor, 0.1 * u + (moving ? 0.15 * u * Math.sin(Math.PI * sort) * (i % 2 ? 1 : -1) : 0));
        k.face(moving ? (to > from ? 'right' : 'left') : 'toward').reset().walk(v * 12, moving ? 1 : 0); k.update();
      });
    },
  };
}

export function shopVariant(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u, W = 0.9 * u, H = 0.95 * u, closed = spec.outcome === 'closed';
  const front = solidProp([[G.box(W + 0.08 * u, 0.06 * u, 0.3 * u, 0, H, 0), 0x6a4a2a], [G.box(0.06 * u, H, 0.3 * u, -W / 2, H / 2, 0), 0x6a4a2a], [G.box(0.06 * u, H, 0.3 * u, W / 2, H / 2, 0), 0x6a4a2a]], 0.3);
  const crates = closed ? null : solidProp([[G.box(0.25 * u, 0.15 * u, 0.2 * u, -0.28 * u, 0.08 * u, 0.05 * u), 0xc89a60], [G.box(0.25 * u, 0.15 * u, 0.2 * u, 0, 0.08 * u, 0.05 * u), 0xc89a60], [G.box(0.25 * u, 0.15 * u, 0.2 * u, 0.28 * u, 0.08 * u, 0.05 * u), 0xc89a60],
    ...[0, 1, 2].map((i) => [G.cone(0.025 * u, 0.14 * u, -0.33 * u + i * 0.05 * u, 0.2 * u, 0.06 * u, -0.4), 0xff8a20]), ...[0, 1].map((i) => [G.sphere(0.07 * u, -0.04 * u + i * 0.09 * u, 0.2 * u, 0.06 * u), 0x8ad050]), ...[0, 1, 2].map((i) => [G.sphere(0.045 * u, 0.22 * u + i * 0.06 * u, 0.19 * u, 0.06 * u), 0xe02828])], 0.4);
  const shutter = solidProp([[G.box(W, 1, 0.02 * u, 0, -0.5, 0), 0xb8c0cc], ...[0.2, 0.4, 0.6, 0.8].map((y) => [G.box(W, 0.01, 0.022 * u, 0, -y, 0), 0x9aa4b4])], 0.25);
  const sign = closed ? textPlane('CLOSED', { h: 0.13 * u, color: '#ffffff', bg: '#d03030' }) : null;
  front.position.set(sx, floor, 0); shutter.position.set(sx, floor + H - 0.03 * u, 0.15 * u);
  group.add(front, shutter); if (crates) { crates.position.set(sx, floor, 0); group.add(crates); } if (sign) group.add(sign);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { move: [0.3, 1.2, closed ? 'in' : 'out'], back: [4.2, 0.7] }), m = pre ? 0 : T.move - T.back;
      const down = closed ? m : 1 - m;                                          // how far the shutter is down
      shutter.scale.set(1, Math.max(1e-3, (H - 0.06 * u) * down), 1);
      if (sign) { sign.visible = down > 0.6; sign.position.set(sx, floor + H * 0.45, 0.17 * u); sign.rotation.z = 0.15 * wobble(v, 1.5, 0.9, 2); }
    },
  };
}

export function hairBraid(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = createPerson({ u: 1.0 * u, shirt: 0xe05a8a, hair: 0x6a2a1a }), small = createPerson({ u: 0.6 * u, shirt: 0x5ab0e0, hair: 0x2a1a10 });
  const braid = many([[G.sphere(0.03 * u), 0x2a1a10]], 4, 0.3), ribbon = solidProp([[G.torus(0.03 * u, 0.009 * u).scale(1.4, 1, 1).translate(-0.04 * u, 0, 0), 0xff4a8a], [G.torus(0.03 * u, 0.009 * u).scale(1.4, 1, 1).translate(0.04 * u, 0, 0), 0xff4a8a]], 0.6);
  group.add(big.group, small.group, braid, ribbon);
  const loop = 5.0, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const sx = B.maxX + 0.45 * u; small.group.position.set(sx, floor, 0.12 * u); small.face('toward').reset(); small.update();
      big.group.position.set(sx + 0.05 * u, floor, -0.2 * u); big.face('toward').reset();
      const work = pre ? 0 : (v < 2.6 ? 1 : 0) * between(v, 0, 0.3); big.bone('armL').rotation.x = big.bone('armR').rotation.x = (1.2 + 0.15 * Math.sin(v * 10)) * work; big.update();
      bonePoint(small, 'head', 0.4, head);
      const grow = pre ? 0 : between(v, 0.4, 2.4) * (1 - between(v, 4.3, 4.8));
      for (let i = 0; i < 4; i++) braid.set(i, head.x + 0.08 * u + 0.02 * u * Math.sin(i * 2), head.y - 0.03 * u - i * 0.05 * u, head.z - 0.02 * u, grow > i / 4 ? 1 : 0);
      braid.commit();
      const r = pre ? 0 : between(v, 2.5, 2.8) * (1 - between(v, 4.3, 4.8)); ribbon.visible = r > 0.01; ribbon.position.set(head.x + 0.08 * u, head.y - 0.24 * u, head.z); ribbon.scale.setScalar(Math.max(1e-3, r));
    },
  };
}
