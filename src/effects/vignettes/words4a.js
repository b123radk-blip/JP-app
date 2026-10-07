// Batch 4 word scenes, part 1.
//   police-box       交番: a little police box with a red lamp; a lost kid comes up, the officer in a cap bends down and
//                    points the way, and the kid walks off waving
//   parasol-up       差す: under a blazing sun a person sweats; they hold a parasol up over their head, it pops open,
//                    shade falls and they cool down
//   stopwatch-exact  丁度: a stopwatch counts 9.00 ... a thumb stops it on exactly 10.00; a tick and a sparkle
//   plane-takeoff    飛行機: a plane speeds down a runway, lifts off and climbs away trailing a white contrail
//   headphones-dance 音楽: a kid with big headphones bobs and dances while colourful notes float out
//   cuckoo-clock     時計: a cuckoo clock's hands sweep round to twelve, the little door opens and the bird pops out twice
//   year-hop         再来年: three calendar blocks (now, +1, +2); a kid hops two blocks ahead and cheers on the last
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF, DROP } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, handTo, liveText } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), NAVY = 0x23304a;

function policeBox(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.4 * u, W = 0.5 * u, H = 0.5 * u;
  const koban = solidProp([[G.box(W, H, 0.34 * u, 0, H / 2, 0), 0xf0ece4], [G.box(W + 0.06 * u, 0.05 * u, 0.4 * u, 0, H + 0.025 * u, 0), 0x3a4050], [G.box(0.18 * u, 0.32 * u, 0.01 * u, 0.1 * u, 0.16 * u, 0.171 * u), 0x203048], [G.box(0.16 * u, 0.07 * u, 0.01 * u, -0.12 * u, 0.36 * u, 0.171 * u), 0x3a4050], [G.sphere(0.022 * u, -0.12 * u, 0.36 * u, 0.178 * u, 1, 1, 0.4), 0xffd040]], 0.35);
  koban.position.set(kx, floor, -0.1 * u);
  const lamp = solidProp([[G.sphere(0.05 * u), 0xff2020]], 1.0); lamp.position.set(kx, floor + H + 0.1 * u, -0.1 * u);
  const cop = createPerson({ u: 0.85 * u, shirt: NAVY, pants: NAVY }), cap = solidProp([[G.cyl(0.12 * 0.85 * u, 0.12 * 0.85 * u, 0.06 * u, 0, 0, 0), NAVY], [G.box(0.12 * u, 0.012 * u, 0.08 * u, 0, -0.025 * u, 0.09 * u), 0x14141c], [G.sphere(0.012 * u, 0, 0, 0.1 * u), 0xffd040]], 0.4);
  cop.rig.attach('head', cap, 0.85);
  const kid = createPerson({ u: 0.5 * u, shirt: 0xf0a030 }), arrow = emblemProp('arrow', 0.3 * u, { dir: 'right', color: 0xffd040 });
  group.add(koban, lamp, cop.group, kid.group, arrow);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0, 1.0], bend: [1.1, 0.4], point: [1.6, 0.3, 'back'], go: [2.8, 1.4], out: [4.2, 0.3] });
      lamp.scale.setScalar(1 + 0.15 * Math.sin(t * 6));
      const pt = T.point * (1 - between(v, 3.6, 4.0));
      cop.reset().face(0.5); cop.lean(0.35 * (T.bend - between(v, 2.6, 3.0))); cop.raise('L', 1.5 * pt); cop.group.position.set(kx + 0.05 * u, floor, 0.2 * u); cop.update();
      const walking = (T.in > 0 && T.in < 1) || (T.go > 0 && T.go < 1);
      kid.reset().face(T.go > 0 ? 'right' : walking ? 'left' : -1.2).walk(v * 10, walking ? 1 : 0); if (T.go > 0.3) kid.raise('L', 2.5 + 0.3 * Math.sin(v * 10));
      kid.group.position.set(kx + 0.75 * u - 0.3 * u * T.in + 0.55 * u * T.go, floor, 0.32 * u); kid.group.scale.setScalar(pop(pre ? 1 : Math.min(1, v * 4) * (1 - T.out))); kid.update();
      const a = pre ? 0 : pt; arrow.visible = a > 0.01; arrow.scale.setScalar(pop(0.3 * u * a)); arrow.position.set(kx + 0.75 * u, floor + 0.8 * u, 0.2 * u); arrow.idle(t);
    },
  };
}

function parasolUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, pu = 0.85 * u;
  const sun = emblemProp('sun', 0.5 * u), p = createPerson({ u: pu, shirt: 0xffffff, pants: 0x3a7ad0 });
  const canopy = solidProp([[G.cone(0.28 * u, 0.12 * u, 0, 0, 0), 0xff8ab0], [G.cone(0.1 * u, 0.05 * u, 0, 0.04 * u, 0), 0xffffff]], 0.5), pole = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.5 * u, 0, 0.25 * u, 0), 0xf4f4f4]], 0.4);
  const brolly = new THREE.Group(); brolly.add(pole, canopy); canopy.position.y = 0.5 * u;
  const sweat = many(DROP(u, 0x7fd0ff), 4, 0.8), shade = solidProp([[G.sphere(0.3 * u, 0, 0, 0, 1, 0.02, 0.6), 0x101828]], 0.1);
  sun.position.set(px + 0.4 * u, B.maxY + 0.15 * u, -0.25 * u); shade.position.set(px, floor + 0.003 * u, 0.1 * u);
  group.add(sun, p.group, brolly, sweat, shade);
  const loop = 5.2, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { lift: [0.9, 0.4], open: [1.35, 0.35, 'back'], close: [4.3, 0.3], drop: [4.6, 0.4] });
      const up = T.lift - T.drop, o = T.open - T.close, cool = o;
      p.reset().face(0.3); p.bone('armR').rotation.x = 2.8 * up; p.bone('foreR').rotation.x = -0.3 * up; p.raise('L', 0.4 * cool * bump(v, 2.2, 1.6)); p.group.position.set(px, floor + 0.05 * u * bump(v, 2.4, 0.35), 0.1 * u); p.update();
      p.rig.pointOn('handR', 0.5, hand); p.group.updateMatrix(); hand.applyMatrix4(p.group.matrix);
      brolly.position.set(hand.x, hand.y - 0.15 * u, hand.z); brolly.rotation.z = 0.1 * (1 - up); canopy.scale.set(pop(0.12 + 0.88 * o), 1 + 0.6 * (1 - o), pop(0.12 + 0.88 * o));
      for (let i = 0; i < 4; i++) { const f = ((t * 1.2 + i / 4) % 1); sweat.set(i, px + (i % 2 ? 0.1 : -0.1) * pu, floor + 0.85 * pu - 0.2 * u * f, 0.15 * u, !pre && cool < 0.5 ? Math.sin(Math.PI * f) : 0); }
      sweat.commit();
      shade.visible = o > 0.05; shade.scale.set(pop(o), 1, pop(o)); sun.scale.setScalar(0.5 * u * (1 + 0.1 * Math.sin(t * 5))); sun.idle(t);
    },
  };
}

function stopwatchExact(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.4 * u, cy = B.cy - 0.02 * u, R = 0.26 * u;
  const body = solidProp([[G.cyl(R, R, 0.08 * u, 0, 0, 0, Math.PI / 2, 0, 0, 32), 0xc8ccd4], [G.cyl(R * 0.88, R * 0.88, 0.01 * u, 0, 0, 0.041 * u, Math.PI / 2, 0, 0, 32), 0xf4f4f8], [G.cyl(0.03 * u, 0.03 * u, 0.06 * u, 0, R + 0.03 * u, 0), 0x8a8e96], [G.torus(0.04 * u, 0.01 * u, Math.PI * 2, 0, R + 0.08 * u, 0), 0x8a8e96]], 0.45);
  body.position.set(cx, cy, 0);
  const button = solidProp([[G.cyl(0.045 * u, 0.045 * u, 0.03 * u, 0, 0, 0), 0xe04848]], 0.5), screen = liveText(u, { h: 0.16, w: 0.36, color: '#7affb0', bg: '#14202a' });
  screen.position.set(cx, cy, 0.05 * u);
  const hand = createHand({ u: 0.45 * u, side: -1, sleeve: 0x3a6ad8 }); hand.pose('thumbs');
  const tick = emblemProp('check', 0.3 * u), shine = burst(u, { s: 0.7, n: 10, color: 0xfff0a0 });
  group.add(shine, body, button, screen, hand.group, tick);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { run: [0.3, 1.5, 'in'], press: [1.65, 0.15, 'in'], up: [1.9, 0.3], ok: [1.9, 0.4, 'back'], out: [4.3, 0.4] });
      const time = pre ? 9 : 9 + T.run; screen.set(time.toFixed(2));
      const pr = T.press - T.up; button.position.set(cx, cy + R + 0.075 * u - 0.025 * u * pr, 0);
      hand.group.visible = !pre && v > 0.8 && v < 2.8; hand.group.rotation.set(0, 0, Math.PI); handTo(hand, cx, cy + R + 0.1 * u - 0.025 * u * pr + 0.25 * u * (1 - between(v, 0.8, 1.6)) + 0.4 * u * between(v, 2.3, 2.8), 0.02 * u, hand.bone('tb')); hand.update();
      const ok = T.ok * (1 - T.out); tick.visible = ok > 0.01; tick.scale.setScalar(pop(0.3 * u * ok)); tick.position.set(cx + 0.33 * u, cy + 0.25 * u, 0.1 * u);
      shine.visible = ok > 0.01; shine.scale.setScalar(pop(ok * (1 + 0.08 * Math.sin(t * 6)))); shine.position.set(cx, cy, -0.06 * u); shine.rotation.z = t * 0.5;
    },
  };
}

function planeTakeoff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.1 * u;
  const runway = solidProp([[G.box(1.3 * u, 0.02 * u, 0.3 * u, 0.65 * u, 0.01 * u, 0), 0x3a3c44], ...[0.15, 0.4, 0.65, 0.9, 1.15].map((x) => [G.box(0.12 * u, 0.004 * u, 0.025 * u, x * u, 0.022 * u, 0), 0xf4f4f4])], 0.3);
  runway.position.set(x0, floor, 0);
  const plane = solidProp([[G.capsule(0.05 * u, 0.36 * u, 0, 0, 0, Math.PI / 2), 0xf4f6fa], [G.box(0.1 * u, 0.012 * u, 0.5 * u, -0.02 * u, -0.01 * u, 0), 0xc8ccd4], [G.box(0.08 * u, 0.1 * u, 0.012 * u, -0.2 * u, 0.06 * u, 0), 0x3a7ad0], [G.box(0.06 * u, 0.01 * u, 0.18 * u, -0.2 * u, 0.0, 0), 0xc8ccd4], ...[-0.1, -0.04, 0.02, 0.08, 0.14].map((x) => [G.sphere(0.012 * u, x * u, 0.015 * u, 0.045 * u), 0x3a7ad0]), [G.box(0.36 * u, 0.012 * u, 0.004 * u, 0, -0.012 * u, 0.05 * u), 0x3a7ad0]], 0.45);
  const trail = many(PUFF(u, 0xffffff), 12, 0.7);
  group.add(runway, plane, trail);
  const loop = 4.8, pos = (f) => { const taxi = Math.min(1, f / 0.45), fly = Math.max(0, (f - 0.45) / 0.55); return [x0 + 0.15 * u + 0.75 * u * taxi * taxi + 0.6 * u * fly, floor + 0.08 * u + 0.9 * u * fly * fly, 0.3 * fly]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 3.0), out = between(v, 2.6, 3.0), back = between(v, 4.2, 4.7);
      const [x, y, pitch] = pos(f); plane.position.set(x, y, 0.02 * u); plane.rotation.z = pitch; plane.scale.setScalar(pop(f < 1 ? 1 - out * 0.6 : back));
      if (f >= 1) { const [sx, sy] = pos(0); plane.position.set(sx, sy, 0.02 * u); plane.rotation.z = 0; }
      for (let i = 0; i < 12; i++) { const fi = f - 0.03 * (i + 1), [tx, ty] = pos(Math.max(0, fi)); trail.set(i, tx - 0.2 * u, ty, 0, !pre && fi > 0.45 && f < 1 ? (0.4 + 0.05 * i) * (1 - out) : 0); }
      trail.commit();
    },
  };
}

function headphonesDance(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, pu = 0.85 * u;
  const kid = createPerson({ u: pu, shirt: 0x9a60d0 }), hk = 0.13 * pu;
  const phones = solidProp([[G.torus(hk * 1.05, 0.012 * u, Math.PI, 0, 0, 0), 0x2a2a30], [G.cyl(0.05 * u, 0.05 * u, 0.04 * u, hk * 1.05, -0.01 * u, 0, 0, 0, Math.PI / 2), 0xe04848], [G.cyl(0.05 * u, 0.05 * u, 0.04 * u, -hk * 1.05, -0.01 * u, 0, 0, 0, Math.PI / 2), 0xe04848]], 0.5);
  kid.rig.attach('head', phones, 0.52);
  const notes = many([[G.sphere(0.03 * u, 0, 0, 0, 1.3, 1, 0.6), 0xffffff], [G.box(0.008 * u, 0.09 * u, 0.008 * u, 0.033 * u, 0.045 * u, 0), 0xffffff]], 8, 0.9), PAL = [0xffe040, 0xff6a9a, 0x40c8f0, 0x60e080];
  for (let i = 0; i < 8; i++) notes.setColorAt(i, new THREE.Color(PAL[i % 4]));
  group.add(kid.group, notes);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, b = pre ? 0 : Math.sin(v * Math.PI * 4), on = pre ? 0 : 1;
      kid.reset().face(0.2 * Math.sin(v * Math.PI)); kid.bone('body').rotation.z = 0.12 * b; kid.bone('head').rotation.z = -0.2 * b; kid.raise('L', on * (1.2 + 1.2 * Math.max(0, b))); kid.raise('R', on * (1.2 + 1.2 * Math.max(0, -b)));
      kid.group.position.set(px, floor + 0.04 * u * Math.abs(b), 0.1 * u); kid.update();
      for (let i = 0; i < 8; i++) { const f = ((v * 0.5 + i / 8) % 1 + 1) % 1, s = i % 2 ? 1 : -1; notes.set(i, px + s * (0.15 + 0.3 * f) * u, floor + pu * 0.9 + 0.35 * u * f, 0.05 * u, on * Math.sin(Math.PI * f), 0.4 * Math.sin(f * 8)); }
      notes.commit();
    },
  };
}

function cuckooClock(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.4 * u, cy = B.cy - 0.05 * u, W = 0.42 * u, R = 0.13 * u;
  const tri = new THREE.Shape(); tri.moveTo(-3, 0); tri.lineTo(3, 0); tri.lineTo(0, 2); tri.lineTo(-3, 0); const k = (W + 0.1 * u) / 6;
  const ticks = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [G.box(0.01 * u, (i % 3 ? 0.02 : 0.04) * u, 0.006 * u, Math.sin(a) * 0.85 * R, Math.cos(a) * 0.85 * R - 0.06 * u, 0.09 * u, -a), 0x2a2a30]; });
  const body = solidProp([[G.box(W, 0.48 * u, 0.16 * u, 0, 0, 0), 0x8a5a30], [G.extrude(tri, 1.2).scale(k, k, k).translate(0, 0.24 * u, 0), 0x6a3a1a], [G.cyl(R, R, 0.01 * u, 0, -0.06 * u, 0.082 * u, Math.PI / 2, 0, 0, 28), 0xfaf6ea], ...ticks, [G.box(0.1 * u, 0.09 * u, 0.01 * u, 0, 0.16 * u, 0.078 * u), 0x1a1010], [G.sphere(0.03 * u, -0.08 * u, -0.48 * u, 0, 0.7, 1.4, 0.7), 0xc8a030], [G.sphere(0.03 * u, 0.08 * u, -0.44 * u, 0, 0.7, 1.4, 0.7), 0xc8a030]], 0.35);
  body.position.set(cx, cy, 0);
  const hand = (w, l, c) => { const p = new THREE.Group(), m = solidProp([[G.box(w, l, 0.008 * u, 0, l / 2 - 0.01 * u, 0), c]], 0.5); p.add(m); p.position.set(cx, cy - 0.06 * u, 0.095 * u); return p; };
  const hr = hand(0.022 * u, 0.08 * u, 0x2a2a30), mn = hand(0.014 * u, 0.11 * u, 0x2a2a30);
  const pend = new THREE.Group(), pendM = solidProp([[G.box(0.01 * u, 0.25 * u, 0.01 * u, 0, -0.125 * u, 0), 0xc8a030], [G.cyl(0.04 * u, 0.04 * u, 0.012 * u, 0, -0.26 * u, 0, Math.PI / 2), 0xe0b030]], 0.5); pend.add(pendM); pend.position.set(cx, cy - 0.24 * u, 0.04 * u);
  const door = new THREE.Group(), doorM = solidProp([[G.box(0.05 * u, 0.09 * u, 0.008 * u, 0.025 * u, 0, 0), 0xa86a38]], 0.4); door.add(doorM); door.position.set(cx - 0.05 * u, cy + 0.16 * u, 0.085 * u);
  const bird = solidProp([[G.sphere(0.045 * u, 0, 0, 0, 1, 0.9, 1.3), 0xffd040], [G.cone(0.015 * u, 0.04 * u, 0, 0, 0.065 * u, 0), 0xff8a20], [G.sphere(0.008 * u, 0.02 * u, 0.02 * u, 0.04 * u), 0x1a1a24]], 0.6); const birdP = new THREE.Group(); birdP.add(bird); bird.rotation.x = Math.PI / 2;
  const cuckoo = textPlane('ポッポ', { h: 0.14 * u, color: '#ffffff', bg: null });
  group.add(body, hr, mn, pend, door, birdP, cuckoo);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.9 : timeline(v, { f: [0.2, 1.6, 'smooth'] }).f, T = timeline(v, { open: [1.85, 0.2], shut: [3.5, 0.2] });
      mn.rotation.z = -Math.PI * 2 * (0.75 + 0.25 * f); hr.rotation.z = -Math.PI * 2 * (11 + f) / 12;
      pend.rotation.z = 0.35 * Math.sin(t * Math.PI * 2);
      const o = T.open - T.shut; door.rotation.y = -1.8 * o;
      const out = Math.max(bump(v, 2.0, 0.6), bump(v, 2.7, 0.6)); birdP.visible = o > 0.5; birdP.position.set(cx, cy + 0.16 * u, 0.06 * u + 0.12 * u * out);
      cuckoo.visible = out > 0.05; cuckoo.scale.setScalar(pop(out)); cuckoo.position.set(cx + 0.3 * u, cy + 0.32 * u, 0.1 * u);
    },
  };
}

function yearHop(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.25 * u, GAP = 0.36 * u, PW = 0.26 * u, PH = 0.22 * u;
  const pads = solidProp([0, 1, 2].flatMap((i) => [[G.box(PW, PH, 0.2 * u, i * GAP, PH / 2, 0), 0xfaf6ea], [G.box(PW, 0.05 * u, 0.205 * u, i * GAP, PH - 0.025 * u, 0), i === 2 ? 0xe04848 : 0x8a90a0]]), 0.45);
  pads.position.set(x0, floor, 0);
  const labels = ['いま', '+1', '+2'].map((s, i) => { const p = textPlane(s, { h: 0.1 * u, color: i === 2 ? '#e04848' : '#2a3040', bg: null }); p.position.set(x0 + i * GAP, floor + PH * 0.42, 0.102 * u); return p; });
  const kid = createPerson({ u: 0.5 * u, shirt: 0x40a0e0 }), pop2 = burst(u, { s: 0.45, n: 8, color: 0xffe040 });
  group.add(pads, ...labels, kid.group, pop2);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, h1 = pre ? 0 : between(v, 0.6, 1.1), h2 = pre ? 0 : between(v, 1.4, 1.9), back = between(v, 4.0, 4.6);
      const hop = h2 > 0 ? arc([x0 + GAP, 0], [x0 + 2 * GAP, 0], 0.25 * u, h2) : arc([x0, 0], [x0 + GAP, 0], 0.25 * u, h1), cheer = bump(v, 2.0, 1.6);
      kid.reset().face(cheer > 0 ? 0 : 'right'); kid.raise('L', 2.7 * cheer); kid.raise('R', 2.7 * cheer); kid.bone('legL').rotation.x = 0.4 * bump(h1 + h2, 0.1, 0.8);
      const kx = back > 0 ? (back <= 0.5 ? x0 + 2 * GAP : x0) : hop[0];
      kid.group.position.set(kx, floor + PH + hop[1] + 0.05 * u * bump(v, 2.2, 0.3), 0.0); kid.group.scale.setScalar(pop(back > 0 ? Math.abs(1 - 2 * back) : 1)); kid.update();
      const p = pre ? 0 : bump(v, 1.9, 1.2); pop2.visible = p > 0; pop2.scale.setScalar(pop(p)); pop2.position.set(x0 + 2 * GAP, floor + PH + 0.4 * u, -0.1 * u); pop2.rotation.z = t;
    },
  };
}

export const SCENES = { 'police-box': policeBox, 'parasol-up': parasolUp, 'stopwatch-exact': stopwatchExact, 'plane-takeoff': planeTakeoff, 'headphones-dance': headphonesDance, 'cuckoo-clock': cuckooClock, 'year-hop': yearHop };
