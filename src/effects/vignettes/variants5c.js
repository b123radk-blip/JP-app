// Batch 5 word variants, part 3:
//   mud-splash:dishes     汚い: a pile of dirty dishes with green stink lines and buzzing flies; a person holds their nose
//   hand-question:mic     質問: a reporter holds out a microphone under a "?"; the other person scratches their head, thinking
//   hand-question:quiz    問題: a quiz board shows a big "?"; a contestant slams the buzzer and the lights flash round it
//   title-stamp:dog       宿題: a kid's homework sheet lies on the floor; a dog runs in, grabs it and runs off wagging; the kid gasps
//   grab-apple:claw       取る: in a claw machine the claw moves over a toy, drops, grabs it and lifts it to the chute
//   photo-snap:wall       写真: flash, flash, flash: three photos pin themselves to a cork board one by one
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

export function dirtyDishes(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.35 * u, MUD = 0x7a5530;
  const pile = solidProp([...[0, 1, 2, 3].map((i) => [G.cyl(0.14 * u, 0.12 * u, 0.025 * u, 0.02 * u * Math.sin(i * 2), 0.015 * u + 0.03 * u * i, 0, 0, 0, 0.1 * Math.sin(i * 3), 20), 0xf4f4f8]), [G.sphere(0.04 * u, 0.05 * u, 0.13 * u, 0.02 * u, 1.4, 0.4, 1), MUD], [G.sphere(0.03 * u, -0.06 * u, 0.13 * u, 0.0, 1.2, 0.5, 1), 0x6a8a3a], [G.cyl(0.04 * u, 0.035 * u, 0.12 * u, 0.12 * u, 0.06 * u, 0.05 * u, 0, 0, 0.4), 0xffffff], [G.sphere(0.03 * u, 0.13 * u, 0.12 * u, 0.05 * u, 1, 0.6, 1), MUD]], 0.4);
  pile.position.set(dx, floor, 0.05 * u);
  const stink = many([[G.tube([[0, 0], [0.02 * u, 0.05 * u], [-0.02 * u, 0.1 * u], [0.02 * u, 0.15 * u]], 0.008 * u), 0x80c040]], 3, 0.8), flies = many([[G.sphere(0.012 * u), 0x1a1a24], [G.sphere(0.01 * u, 0, 0.012 * u, 0, 1.6, 0.4, 0.8), 0xd8e8ff]], 4, 0.5);
  const p = createPerson({ u: 0.8 * u, shirt: 0x40a0e0 });
  group.add(pile, stink, flies, p.group);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, yuck = pre ? 0 : between(v, 0.8, 1.1) * (1 - between(v, 4.0, 4.4));
      for (let i = 0; i < 3; i++) { const f = ((t * 0.5 + i / 3) % 1); stink.set(i, dx + (i - 1) * 0.08 * u, floor + 0.2 * u + 0.2 * u * f, 0.05 * u, Math.sin(Math.PI * f) * 1.2); } stink.commit();
      for (let i = 0; i < 4; i++) { const a = t * (3 + i) + i * 1.7; flies.set(i, dx + Math.cos(a) * 0.15 * u, floor + 0.32 * u + Math.sin(a * 1.4) * 0.08 * u, 0.05 * u + Math.sin(a) * 0.1 * u, 1, 0, a); } flies.commit();
      p.reset().face(lerp(-0.8, 1.4, yuck)); p.bone('armR').rotation.x = 2.2 * yuck; p.bone('foreR').rotation.x = 1.6 * yuck; p.lean(-0.25 * yuck); p.group.position.set(dx + 0.5 * u, floor, 0.12 * u); p.update();
    },
  };
}

export function micInterview(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rx = B.maxX + 0.3 * u;
  const rep = createPerson({ u: 0.85 * u, shirt: 0xe04848 }), guest = createPerson({ u: 0.85 * u, shirt: 0x60b060 });
  const mic = solidProp([[G.cyl(0.015 * u, 0.012 * u, 0.12 * u, 0, -0.04 * u, 0), 0x2a2a30], [G.sphere(0.032 * u, 0, 0.04 * u, 0), 0x60646c], [G.box(0.05 * u, 0.03 * u, 0.04 * u, 0, -0.01 * u, 0), 0x3a6ad8]], 0.45);
  const bubble = solidProp([[G.sphere(0.16 * u, 0, 0, 0, 1.3, 1, 0.35), 0xffffff], [G.cone(0.04 * u, 0.1 * u, -0.08 * u, -0.16 * u, 0, 0.5), 0xffffff]], 0.6), q = emblemProp('question', 0.2 * u, { color: 0x3a7ad0 });
  group.add(rep.group, guest.group, mic, bubble, q);
  const loop = 4.8, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { hold: [0.3, 0.4], q: [0.8, 0.3, 'back'], think: [1.5, 0.3], end: [4.0, 0.4] }), hold = T.hold * (1 - T.end);
      rep.reset().face(1.0); rep.bone('armR').rotation.x = 1.5 * hold; rep.group.position.set(rx, floor, 0.1 * u); rep.update(); bonePoint(rep, 'handR', 0.8, hand);
      mic.position.set(hand.x, hand.y + 0.05 * u, hand.z); mic.rotation.z = -0.6 * hold;
      const th = T.think * (1 - T.end); guest.reset().face(-1.0); guest.bone('armR').rotation.x = 2.4 * th; guest.bone('foreR').rotation.x = 1.6 * th + 0.3 * Math.sin(v * 12) * th; guest.bone('head').rotation.z = 0.25 * th; guest.group.position.set(rx + 0.55 * u, floor, 0.1 * u); guest.update();
      const b = pre ? 0 : T.q * (1 - T.end); bubble.visible = q.visible = b > 0.01; bubble.scale.setScalar(pop(b)); bubble.position.set(rx + 0.05 * u, floor + 1.05 * u, 0.1 * u); q.scale.setScalar(pop(0.2 * u * b)); q.position.set(rx + 0.05 * u, floor + 1.05 * u, 0.15 * u); q.idle(t);
    },
  };
}

export function quizBuzzer(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, by = floor + 0.75 * u;
  const board = solidProp([[G.box(0.5 * u, 0.42 * u, 0.04 * u, 0, 0, 0), 0x1a2a6a], [G.box(0.46 * u, 0.38 * u, 0.042 * u, 0, 0, 0), 0x2a4ab0]], 0.5); board.position.set(bx, by, -0.25 * u);
  const q = emblemProp('question', 0.3 * u, { color: 0xffe040 }), N = 12, lights = many([[G.sphere(0.018 * u), 0xffffff]], N, 1.0);
  const desk = solidProp([[G.box(0.26 * u, 0.32 * u, 0.2 * u, 0, 0.16 * u, 0), 0xe04848], [G.box(0.28 * u, 0.02 * u, 0.22 * u, 0, 0.33 * u, 0), 0xffffff]], 0.4), btn = solidProp([[new THREE.SphereGeometry(0.05 * u, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xff2020]], 0.8);
  const dx = bx + 0.42 * u; desk.position.set(dx, floor, 0.1 * u);
  const p = createPerson({ u: 0.75 * u, shirt: 0xf0a030 });
  group.add(board, q, lights, desk, btn, p.group);
  const loop = 4.6, on = new THREE.Color(0xffe060), off = new THREE.Color(0x5a4a20);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { slam: [0.9, 0.15, 'in'], up: [1.2, 0.3] }), hit = T.slam - T.up, flash = !pre && v > 1.05 && v < 3.6;
      q.position.set(bx, by, -0.2 * u); q.scale.setScalar(0.3 * u * (1 + 0.15 * (flash ? Math.sin(v * 10) : 0))); q.idle(t);
      for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; lights.set(i, bx + Math.cos(a) * 0.29 * u, by + Math.sin(a) * 0.25 * u, -0.22 * u, 1); lights.setColorAt(i, flash && (i + Math.floor(t * 10)) % 3 === 0 ? on : off); }
      lights.commit(); lights.instanceColor.needsUpdate = true;
      btn.position.set(dx, floor + 0.34 * u - 0.02 * u * hit, 0.1 * u);
      p.reset().face(-0.6); p.bone('armR').rotation.x = 1.0 + 1.6 * bump(v, 0.5, 0.5) - 0.2 * hit; p.group.position.set(dx + 0.2 * u, floor, 0.12 * u); p.update();
    },
  };
}

export function dogHomework(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.3 * u, sx = B.maxX + 0.6 * u;
  const sheet = solidProp([[G.box(0.2 * u, 0.006 * u, 0.26 * u, 0, 0, 0), 0xffffff], ...[0, 1, 2, 3].map((i) => [G.box(0.14 * u, 0.008 * u, 0.012 * u, 0, 0.002 * u, -0.08 * u + 0.05 * u * i), 0x5a6a8a]), [G.box(0.04 * u, 0.008 * u, 0.04 * u, 0.06 * u, 0.003 * u, -0.1 * u), 0xe04848]], 0.5);
  const dog = new THREE.Group(), dogM = solidProp([[G.sphere(0.1 * u, 0, 0.12 * u, 0, 1.6, 0.9, 0.9), 0xc89060], [G.sphere(0.07 * u, 0.16 * u, 0.2 * u, 0), 0xc89060], [G.sphere(0.035 * u, 0.22 * u, 0.18 * u, 0, 1.3, 0.8, 0.8), 0xe0b080], [G.sphere(0.015 * u, 0.25 * u, 0.2 * u, 0), 0x1a1a24], [G.sphere(0.03 * u, 0.13 * u, 0.26 * u, 0.05 * u, 0.6, 1.4, 0.4), 0x6a4020], [G.sphere(0.03 * u, 0.13 * u, 0.26 * u, -0.05 * u, 0.6, 1.4, 0.4), 0x6a4020], [G.sphere(0.01 * u, 0.19 * u, 0.23 * u, 0.04 * u), 0x1a1a24], ...[[-0.1, 0.05], [0.1, 0.05], [-0.1, -0.05], [0.1, -0.05]].map(([x, z]) => [G.cyl(0.02 * u, 0.02 * u, 0.09 * u, x * u, 0.045 * u, z * u), 0xc89060])], 0.45);
  const tail = solidProp([[G.cyl(0.012 * u, 0.006 * u, 0.1 * u, 0, 0.05 * u, 0), 0xc89060]], 0.45); dog.add(dogM, tail); tail.position.set(-0.15 * u, 0.15 * u, 0); tail.rotation.z = 0.6;
  const kid = createPerson({ u: 0.65 * u, shirt: 0x9a60d0 });
  group.add(sheet, dog, kid.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0.5, 0.8], grab: [1.35, 0.2], out: [1.7, 1.2, 'in'], back: [4.4, 0.4] }), has = T.grab > 0.5 && T.back === 0;
      const dX = T.out > 0 ? lerp(sx - 0.05 * u, sx + 1.0 * u, T.out) : lerp(sx + 0.9 * u, sx - 0.05 * u, T.in), run = (T.in > 0 && T.in < 1) || (T.out > 0 && T.out < 1);
      dog.position.set(dX, floor + (run ? 0.02 * u * Math.abs(Math.sin(v * 14)) : 0), 0.15 * u); dog.rotation.y = T.out > 0 ? 0 : Math.PI; dog.visible = !pre && v > 0.5 && T.out < 1; tail.rotation.x = 0.6 * Math.sin(t * 18);
      sheet.position.copy(has ? dog.position.clone().add(new THREE.Vector3((T.out > 0 ? 1 : -1) * 0.24 * u, 0.18 * u, 0)) : new THREE.Vector3(sx, floor + 0.004 * u, 0.15 * u)); sheet.rotation.set(has ? -1.2 : 0, 0, has ? 0.3 * Math.sin(v * 12) : 0); sheet.visible = !(has && T.out >= 1) || T.back > 0;
      if (T.back > 0) { sheet.position.set(sx, floor + 0.004 * u, 0.15 * u); sheet.rotation.set(0, 0, 0); sheet.scale.setScalar(pop(T.back)); } else sheet.scale.setScalar(1);
      const gasp = pre ? 0 : between(v, 1.5, 1.8) * (1 - between(v, 4.0, 4.4));
      kid.reset().face(0.4); kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 0.9 * gasp; kid.bone('foreL').rotation.x = kid.bone('foreR').rotation.x = 2.0 * gasp; kid.group.position.set(px, floor + 0.05 * u * bump(v, 1.6, 0.3), 0.0); kid.update();
    },
  };
}

export function clawMachine(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.45 * u, W = 0.56 * u, H = 0.95 * u;
  const cab = solidProp([[G.box(W, 0.3 * u, 0.4 * u, 0, 0.15 * u, 0), 0xe04880], [G.box(W, 0.1 * u, 0.4 * u, 0, H - 0.05 * u, 0), 0xe04880], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [G.box(0.03 * u, H - 0.4 * u, 0.03 * u, a * W / 2, 0.3 * u + (H - 0.4 * u) / 2, b * 0.19 * u), 0xffffff]), [G.box(0.12 * u, 0.12 * u, 0.01 * u, 0.18 * u, 0.2 * u, 0.201 * u), 0x1a1a24]], 0.4);
  cab.position.set(mx, floor, 0);
  const glass = solidProp([[G.box(W - 0.02 * u, H - 0.4 * u, 0.005 * u, 0, 0.3 * u + (H - 0.4 * u) / 2, 0.19 * u), 0xc8e8ff]], 0.2); glass.material.transparent = true; glass.material.opacity = 0.2; glass.position.set(mx, floor, 0);
  const N = 8, toys = many([[G.sphere(0.05 * u), 0xffffff]], N, 0.5), PAL = [0xffe040, 0x40c8f0, 0x60e080, 0xff8a40]; for (let i = 0; i < N; i++) toys.setColorAt(i, new THREE.Color(PAL[i % 4]));
  const claw = new THREE.Group(), rod = solidProp([[G.cyl(0.006 * u, 0.006 * u, 1, 0, 0.5, 0), 0xc8ccd4]], 0.4), head = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.04 * u, 0, 0, 0), 0xc8ccd4]], 0.4), prongs = [0, 1, 2].map((i) => { const p = new THREE.Group(), m = solidProp([[G.box(0.008 * u, 0.07 * u, 0.008 * u, 0, -0.035 * u, 0), 0xc8ccd4]], 0.4); p.add(m); p.rotation.y = (i / 3) * Math.PI * 2; return p; });
  claw.add(rod, head, ...prongs); const prize = solidProp([[G.sphere(0.055 * u), 0xff6a9a], [G.sphere(0.02 * u, -0.03 * u, 0.045 * u, 0), 0xff6a9a], [G.sphere(0.02 * u, 0.03 * u, 0.045 * u, 0), 0xff6a9a]], 0.6);
  group.add(cab, glass, toys, claw, prize);
  const loop = 5.6, base = floor + 0.35 * u, topY = floor + H - 0.12 * u, px0 = mx + 0.08 * u, chute = mx + 0.18 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { over: [0.3, 0.8], down: [1.2, 0.6], close: [1.85, 0.2], up: [2.1, 0.6], back: [2.8, 0.8], open: [3.65, 0.2], reset: [4.8, 0.4] });
      for (let i = 0; i < N; i++) toys.set(i, mx - 0.2 * u + (i % 4) * 0.12 * u + (i > 3 ? 0.06 : 0) * u, base + (i > 3 ? 0.08 : 0.0) * u, (i > 3 ? -0.05 : 0.06) * u, 1); toys.commit();
      const cx = lerp(lerp(mx - 0.2 * u, px0, T.over), chute, T.back), cy = topY - (0.55 * u) * (T.down - T.up) - 0.06 * u;
      claw.position.set(cx, cy, 0.0); rod.scale.y = pop(topY + 0.06 * u - cy); prongs.forEach((p) => { p.rotation.z = 0.6 - 0.5 * (T.close - T.open); });
      const held = T.close > 0.5 && T.open < 0.5, drop = T.open > 0 ? between(v, 3.65, 4.0) : 0;
      prize.position.set(held || drop > 0 ? cx : px0, held ? cy - 0.08 * u : drop > 0 ? lerp(cy - 0.08 * u, floor + 0.2 * u, drop) : base + 0.12 * u, 0.0); prize.visible = !(drop >= 1 && T.reset === 0); prize.scale.setScalar(pop(T.reset > 0 ? T.reset : 1)); if (T.reset > 0) prize.position.set(px0, base + 0.12 * u, 0);
    },
  };
}

export function photoWall(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), bx = B.maxX + 0.45 * u, by = B.cy + 0.05 * u;
  const board = solidProp([[G.box(0.7 * u, 0.5 * u, 0.03 * u, 0, 0, 0), 0xc89a60], [G.box(0.74 * u, 0.54 * u, 0.025 * u, 0, 0, -0.005 * u), 0x8a5a30]], 0.35); board.position.set(bx, by, -0.05 * u);
  const pic = (sky, ground, extra) => solidProp([[G.box(0.18 * u, 0.21 * u, 0.006 * u, 0, 0, 0), 0xffffff], [G.box(0.15 * u, 0.12 * u, 0.007 * u, 0, 0.02 * u, 0.001 * u), sky], [G.box(0.15 * u, 0.04 * u, 0.008 * u, 0, -0.02 * u, 0.002 * u), ground], ...extra, [G.sphere(0.012 * u, 0, 0.09 * u, 0.01 * u), 0xe02020]], 0.55);
  const photos = [pic(0x8ad0ff, 0x60b050, [[G.sphere(0.02 * u, 0.04 * u, 0.06 * u, 0.006 * u), 0xffd040]]), pic(0xffb070, 0x2a6ac0, [[G.cone(0.03 * u, 0.04 * u, -0.02 * u, 0.02 * u, 0.006 * u), 0x5a6a9a]]), pic(0xf0e0ff, 0xe8d0b0, [[G.sphere(0.018 * u, -0.03 * u, 0.04 * u, 0.006 * u), 0xffd2b0], [G.sphere(0.015 * u, 0.02 * u, 0.035 * u, 0.006 * u), 0xffd2b0]])];
  const SPOT = [[-0.22, 0.06, 0.12], [0.02, -0.04, -0.08], [0.24, 0.08, 0.1]], flash = burst(u, { s: 0.5, n: 10, color: 0xffffff });
  group.add(board, ...photos, flash);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.2, 4.6);
      photos.forEach((p, i) => { const f = pre ? 1 : timeline(v, { f: [0.3 + 0.8 * i, 0.4, 'back'] }).f * (1 - out), [sx, sy, r] = SPOT[i]; p.visible = f > 0.01; p.position.set(bx + sx * u, by + sy * u + 0.3 * u * (1 - f), 0.0); p.rotation.z = r + (1 - f) * 1.5; p.scale.setScalar(pop(f)); });
      const fl = pre ? 0 : Math.max(...[0, 1, 2].map((i) => bump(v, 0.2 + 0.8 * i, 0.25))); flash.visible = fl > 0; flash.scale.setScalar(pop(fl)); flash.position.set(bx, by, 0.1 * u);
    },
  };
}
