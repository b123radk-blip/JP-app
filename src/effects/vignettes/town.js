// Out in town (word cards).
//   ticket-gate    切符: a ticket slides out of a machine's slot, a hand takes it, the gate's flaps swing open
//   stamp-letter   切手: a stamp flies onto the corner of an envelope with a thump, then a postmark stamps over it
//   train-arrive   着く: a train glides in along the platform, slows, stops; a person steps off and waves
//   car-park       自動車: a car drives in by itself, backs into a parking space, beep beep
//   traffic-red    赤い: a traffic light changes green, yellow, RED; a car rolling up stops at the line
//   neighbourhood  近く: a house; little houses pop up all round it and a dotted ring draws around them (round here)
//   postcard-post  葉書: a postcard with a mountain on it flips over, lines write on its back, it flies into a postbox
//   button-press   押す: a finger presses a big red button down; it lights up and dings
//   keypad         番号: a finger taps a number on a keypad, each key lighting up; the number appears on the screen
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, handTo, liveText } from './helpers.js';

// a fingertip to steer a pointing hand by (handTo(hand, x, y, z, tip))
function fingertip(hand, u) { const o = new THREE.Object3D(); hand.bone('f0b').add(o); o.position.y = 0.13 * u; return o; }

function ticketGate(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.35 * u;
  const machine = solidProp([[G.box(0.36 * u, 0.85 * u, 0.3 * u, 0, 0.42 * u, 0), 0x3a7ad0], [G.box(0.24 * u, 0.16 * u, 0.02 * u, 0, 0.66 * u, 0.15 * u), 0x9ae0ff], [G.box(0.16 * u, 0.02 * u, 0.03 * u, 0, 0.42 * u, 0.15 * u), 0x101820]]);
  machine.position.set(mx, floor, -0.05 * u);
  const ticket = solidProp([[G.box(0.14 * u, 0.09 * u, 0.006 * u, 0, 0, 0), 0xf8e8a0], [G.box(0.14 * u, 0.02 * u, 0.007 * u, 0, -0.025 * u, 0), 0x3a7ad0]], 0.5);
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x8a5ad0 }); hand.pose('pinch'); hand.group.rotation.z = 1.2;
  const gx = mx + 0.6 * u, flap = (s) => { const p = new THREE.Group(), m = solidProp([[G.box(0.18 * u, 0.12 * u, 0.02 * u, s * 0.09 * u, 0, 0), 0xe04848]]); p.position.set(gx - s * 0.2 * u, floor + 0.4 * u, 0.05 * u); p.add(m); return p; };
  const flaps = [flap(1), flap(-1)], posts = solidProp([[G.box(0.08 * u, 0.5 * u, 0.25 * u, -0.24 * u, 0.25 * u, 0), 0xb8c0cc], [G.box(0.08 * u, 0.5 * u, 0.25 * u, 0.24 * u, 0.25 * u, 0), 0xb8c0cc]]);
  posts.position.set(gx, floor, 0.05 * u);
  group.add(machine, ticket, hand.group, ...flaps, posts);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.2, 0.5, 'out'], grab: [0.8, 0.4], take: [1.3, 0.6], open: [2.0, 0.4, 'back'], close: [3.6, 0.5] });
      const tx = mx, ty = floor + 0.42 * u - 0.07 * u * T.out, held = T.take;
      ticket.visible = !pre && T.close < 0.5; ticket.position.set(tx + 0.4 * u * held, ty + 0.15 * u * held, -0.05 * u + 0.17 * u);
      hand.group.visible = !pre && v > 0.6 && v < 3.4; hand.update();
      handTo(hand, tx + 0.4 * u * held + (1 - T.grab) * 0.3 * u, ty + 0.15 * u * held, 0.15 * u);
      const op = pre ? 0 : T.open - T.close; flaps[0].rotation.y = -1.4 * op; flaps[1].rotation.y = 1.4 * op;
    },
  };
}

function stampLetter(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), lx = B.maxX + 0.5 * u, ly = B.cy;
  const env = emblemProp('letter', 0.75 * u), stamp = solidProp([[G.box(0.13 * u, 0.15 * u, 0.006 * u, 0, 0, 0), 0xffffff], [G.box(0.1 * u, 0.12 * u, 0.007 * u, 0, 0, 0), 0x3aa0e0], [G.sphere(0.03 * u, 0, 0.02 * u, 0.004 * u, 1, 1, 0.2), 0xffd040]], 0.5);
  const rubber = solidProp([[G.cyl(0.08 * u, 0.08 * u, 0.04 * u, 0, 0.02 * u, 0), 0x303030], [G.cyl(0.03 * u, 0.03 * u, 0.14 * u, 0, 0.11 * u, 0), 0x8a5a30], [G.sphere(0.05 * u, 0, 0.2 * u), 0x8a5a30]]);
  const mark = solidProp([[G.torus(0.06 * u, 0.008 * u), 0x404050], ...[0, 1, 2].map((i) => [G.box(0.12 * u, 0.008 * u, 0.004 * u, 0.1 * u, (i - 1) * 0.03 * u, 0), 0x404050])], 0.3);
  env.position.set(lx, ly, 0);
  const sx = lx + 0.17 * u, sy = ly + 0.08 * u;
  group.add(env, stamp, rubber, mark);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      env.idle(0); env.scale.setScalar(0.75 * u * Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const T = timeline(v, { fly: [0.2, 0.5, 'in'], down: [1.2, 0.3, 'in'], up: [1.6, 0.4], gone: [3.8, 0.4] });
      const [x, y] = arc([sx + 0.6 * u, sy + 0.5 * u], [sx, sy], 0.2 * u, T.fly);
      stamp.visible = !pre && T.gone < 1; stamp.position.set(x, y, 0.06 * u + 0.004 * u); stamp.rotation.z = (1 - T.fly) * 2 + 0.05 * wobble(v, 0.7, 0.4, 6);
      rubber.visible = !pre && v > 1.0 && v < 2.2; rubber.position.set(sx - 0.02 * u, sy + 0.04 * u + (1 - T.down + T.up) * 0.35 * u, 0.1 * u); rubber.rotation.x = -Math.PI / 2;
      mark.visible = !pre && v > 1.5 && T.gone < 1; mark.position.set(sx - 0.02 * u, sy, 0.07 * u);
    },
  };
}

function trainArrive(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.65 * u;
  const platform = solidProp([[G.box(1.4 * u, 0.12 * u, 0.3 * u, 0, 0.06 * u, 0.2 * u), 0xb8b0a0], [G.box(1.4 * u, 0.02 * u, 0.06 * u, 0, 0.13 * u, 0.33 * u), 0xf0d040]]);
  platform.position.set(sx, floor, 0);
  const train = emblemProp('train', 0.75 * u), p = createPerson({ u: 0.7 * u, shirt: 0xe06a40 });
  group.add(platform, train, p.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.6, 'out'], step: [1.9, 0.5], wave: [2.4, 1.2, 'linear'], go: [3.8, 1.0, 'in'] });
      train.position.set(sx + 1.8 * u * (1 - T.come) - 2.6 * u * T.go, floor + 0.32 * u, -0.3 * u); train.visible = !pre; train.idle(T.come < 1 ? v : 0);
      const off = pre ? 0 : T.step;
      p.group.visible = !pre && v > 1.8; p.group.position.set(sx - 0.1 * u, floor + 0.12 * u, -0.15 * u + 0.4 * u * off);   // steps off the train towards you p.face('toward').reset();
      if (T.wave > 0 && T.wave < 1) { p.raise('R', 2.5); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 10); }
      p.update();
    },
  };
}

function carPark(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.6 * u;
  const lines = solidProp([[G.box(0.04 * u, 0.012 * u, 0.5 * u, -0.38 * u, 0.006 * u, 0), 0xffffff], [G.box(0.04 * u, 0.012 * u, 0.5 * u, 0.38 * u, 0.006 * u, 0), 0xffffff], [G.box(0.8 * u, 0.012 * u, 0.04 * u, 0, 0.006 * u, -0.25 * u), 0xffffff], [G.box(1.6 * u, 0.008 * u, 0.6 * u, 0, 0, 0), 0x404048]], 0.25);
  lines.position.set(px, floor, 0); lines.rotation.x = 0.35;
  const car = emblemProp('car', 0.55 * u), beep = many([[G.torus(0.08 * u, 0.01 * u, Math.PI * 0.6, 0, 0, 0, -Math.PI * 0.3), 0xffe060]], 3, 1);
  group.add(lines, car, beep);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 1.2, 'out'], back: [1.4, 0.9], out: [4.0, 0.8, 'in'] });
      const x = px + 1.4 * u * (1 - T.in) + 0.3 * u * (1 - T.back) * (T.in >= 1 ? 1 : 0) - 1.8 * u * T.out;
      car.position.set(x, floor + 0.18 * u, 0.05 * u + 0.1 * u * T.back); car.visible = !pre; car.idle((T.in > 0 && T.in < 1) || (T.back > 0 && T.back < 1) || T.out > 0 ? v : 0);
      for (let i = 0; i < 3; i++) { const f = between(v, 2.5 + 0.15 * i, 3.0 + 0.15 * i) + between(v, 3.1 + 0.15 * i, 3.6 + 0.15 * i); beep.set(i, x + 0.3 * u + 0.08 * u * i, floor + 0.35 * u, 0.1 * u, f % 1 > 0 && f % 1 < 1 ? 1 + i * 0.4 : 0); }
      beep.commit();
    },
  };
}

function trafficRed(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, lx = B.maxX + 0.35 * u;
  const pole = solidProp([[G.cyl(0.025 * u, 0.025 * u, 0.9 * u, 0, 0.45 * u, 0), 0x50545c], [G.box(0.2 * u, 0.5 * u, 0.12 * u, 0, 1.0 * u, 0), 0x2a2e36]], 0.2);
  pole.position.set(lx, floor, -0.05 * u);
  const lamp = (y, c) => { const m = solidProp([[G.sphere(0.065 * u, 0, 0, 0, 1, 1, 0.4), c]], 0); m.position.set(lx, floor + y * u, 0.02 * u); return m; };
  const lamps = [lamp(1.16, 0xff2020), lamp(1.0, 0xffc020), lamp(0.84, 0x20e060)], car = emblemProp('car', 0.5 * u, { color: 0x4a7ad0 });
  group.add(pole, ...lamps, car);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const state = pre || v < 1.0 ? 2 : v < 1.6 ? 1 : v < 4.2 ? 0 : 2;                     // green, yellow, red (held), green
      lamps.forEach((m, i) => { m.material.userData.glow.value = i === state ? 1.6 : 0.03; m.scale.setScalar(i === state && i === 0 ? 1 + 0.15 * bump(v, 1.6, 0.4) : 1); });
      const roll = pre ? 0 : between(v, 0.3, 2.4), x = lx + 0.45 * u + 1.2 * u * (1 - Math.sin(roll * Math.PI / 2)) - (v > 4.2 ? 1.6 * u * between(v, 4.2, 5.0) : 0);
      car.position.set(x, floor + 0.15 * u, 0.12 * u); car.visible = !pre; car.idle(roll < 1 || v > 4.2 ? v : 0);
    },
  };
}

function neighbourhood(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u, N = 6;
  const homeGeo = (s, c) => [[G.box(0.2 * s * u, 0.16 * s * u, 0.16 * s * u, 0, 0.08 * s * u, 0), c], [G.cone(0.17 * s * u, 0.12 * s * u, 0, 0.22 * s * u, 0), 0x8a3a2a]];
  const home = solidProp([...homeGeo(1.6, 0xfff0c8), [G.box(0.05 * u, 0.09 * u, 0.01 * u, 0, 0.045 * u, 0.13 * u), 0x8a4a2a]]), others = many(homeGeo(0.9, 0xd8e0f0), N, 0.35), dots = many([[G.sphere(0.012 * u), 0xffe060]], 24, 1.2);
  home.position.set(cx, floor, 0);
  group.add(home, others, dots);
  const loop = 4.6, R = 0.55;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      home.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const away = between(v, 4.0, 4.5);
      for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2 + 0.3, k = pre ? 0 : between(v, 0.2 + i * 0.15, 0.5 + i * 0.15) * (1 - away); others.set(i, cx + Math.cos(a) * R * u * 1.2, floor, Math.sin(a) * R * u * 0.6, k); }
      others.commit();
      const ring = pre ? 0 : between(v, 1.4, 2.4) * (1 - away);
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; dots.set(i, cx + Math.cos(a) * (R + 0.2) * u * 1.25, floor + 0.03 * u, Math.sin(a) * (R + 0.2) * u * 0.62, i / 24 < ring ? 1 : 0); }
      dots.commit();
      group.rotation.x = 0;
    },
  };
}

function postcardPost(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.35 * u, cy = B.cy + 0.05 * u;
  const card = solidProp([[G.box(0.4 * u, 0.27 * u, 0.008 * u, 0, 0, 0), 0xfaf6ea], [G.cone(0.1 * u, 0.12 * u, -0.06 * u, -0.03 * u, 0.006 * u), 0x4a8a5a], [G.cone(0.08 * u, 0.09 * u, 0.06 * u, -0.045 * u, 0.006 * u), 0x5a9a6a], [G.sphere(0.03 * u, 0.12 * u, 0.07 * u, 0.006 * u, 1, 1, 0.2), 0xffb030]], 0.4);
  const writing = many([[G.box(0.22 * u, 0.012 * u, 0.004 * u, 0, 0, 0), 0x3a4a8a]], 3, 0.3);
  const box = solidProp([[G.cyl(0.15 * u, 0.15 * u, 0.62 * u, 0, 0.31 * u, 0, 0, 0, 0, 24), 0xd82020], [G.sphere(0.15 * u, 0, 0.62 * u, 0, 1, 0.5, 1), 0xd82020], [G.box(0.18 * u, 0.025 * u, 0.02 * u, 0, 0.5 * u, 0.15 * u), 0x202020]], 0.35);
  const bx = cx + 0.6 * u; box.position.set(bx, floor, -0.02 * u);
  group.add(card, writing, box);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { flip: [0.3, 0.5], write: [0.9, 1.0, 'linear'], post: [2.2, 0.6, 'in'], back: [4.0, 0.5, 'back'] });
      const [x, y] = arc([cx, cy], [bx, floor + 0.5 * u], 0.2 * u, T.post);
      const k = T.post < 1 ? 1 - 0.6 * T.post : 0;
      card.visible = pre || T.post < 1 || T.back > 0; card.position.set(T.back > 0 ? cx : x, T.back > 0 ? cy : y, 0.02 * u); card.rotation.set(0, Math.PI * T.flip * (1 - T.back), T.post * -0.6 * (1 - T.back));
      card.scale.setScalar(Math.max(1e-3, T.back > 0 ? T.back : k));
      for (let i = 0; i < 3; i++) { const w = between(T.write, i / 3, (i + 1) / 3); writing.set(i, x - 0.04 * u, y + (0.06 - i * 0.05) * u, -0.006 * u + 0.02 * u, T.flip > 0.5 && T.post < 0.5 && T.back === 0 ? w * k : 0); }
      writing.commit();
    },
  };
}

function buttonPress(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.45 * u;
  const stand = solidProp([[G.cyl(0.08 * u, 0.12 * u, 0.5 * u, 0, 0.25 * u, 0), 0x50545c], [G.cyl(0.2 * u, 0.2 * u, 0.06 * u, 0, 0.53 * u, 0, 0, 0, 0, 28), 0xf0d040]], 0.3);
  const btn = solidProp([[G.cyl(0.15 * u, 0.15 * u, 0.08 * u, 0, 0, 0, 0, 0, 0, 28), 0xe02020], [G.sphere(0.15 * u, 0, 0.04 * u, 0, 1, 0.3, 1), 0xe02020]], 0.4);
  stand.position.set(bx, floor, 0); stand.rotation.x = 0.35; btn.rotation.x = 0.35;
  const hand = createHand({ u: 0.6 * u, side: -1, sleeve: 0x3a8a5a }), tip = fingertip(hand, 0.6 * u), ding = burst(u, { s: 0.5, color: 0xfff0a0 });
  hand.pose('point'); hand.group.rotation.set(0.3, 0, 0.2);
  group.add(stand, btn, hand.group, ding);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const press = pre ? 0 : between(v, 0.4, 0.75) * (1 - between(v, 1.6, 2.1));
      const top = new THREE.Vector3(0, 0.6 * u - 0.05 * u * press, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.35);
      btn.position.set(bx + top.x, floor + top.y, top.z); btn.material.userData.glow.value = 0.4 + 1.2 * (press > 0.9 ? 1 : 0);
      hand.update(); handTo(hand, bx, floor + top.y + 0.08 * u + 0.3 * u * (1 - press), top.z + 0.03 * u, tip);
      const d = pre ? 0 : bump(v, 0.75, 0.6); ding.visible = d > 0; ding.scale.setScalar(Math.max(1e-3, d)); ding.position.set(bx + 0.25 * u, floor + 0.85 * u, 0.1 * u); ding.rotation.z = v * 3;
    },
  };
}

function keypad(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u, ky = B.cy;
  const c = document.createElement('canvas'); c.width = 192; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#2a2e36'; g.fillRect(0, 0, 192, 256); g.font = '700 40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  '123456789*0#'.split('').forEach((d, i) => { const x = 32 + (i % 3) * 64, y = 32 + Math.floor(i / 3) * 64; g.fillStyle = '#e8ecf4'; g.fillRect(x - 26, y - 26, 52, 52); g.fillStyle = '#202430'; g.fillText(d, x, y + 2); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const W = 0.42 * u, H = 0.56 * u, face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(kx, ky - 0.08 * u, 0.02 * u);
  const glow = solidProp([[G.box(0.11 * u, 0.11 * u, 0.01 * u, 0, 0, 0), 0x60e0ff]], 1.5); glow.material.transparent = true; glow.material.opacity = 0.7;
  const screen = liveText(u, { w: 0.42, h: 0.14, color: '#60ff90', bg: '#0a1a10' }); screen.position.set(kx, ky + 0.3 * u, 0.02 * u);
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0xd06a30 }), tip = fingertip(hand, 0.55 * u);
  hand.pose('point'); hand.group.rotation.set(0.25, 0, 0.35);
  group.add(face, glow, screen, hand.group);
  const keyAt = (d) => { const i = '123456789*0#'.indexOf(d); return [kx - W / 2 + (32 + (i % 3) * 64) / 192 * W, ky - 0.08 * u + H / 2 - (32 + Math.floor(i / 3) * 64) / 256 * H]; };
  const NUM = spec.number ?? '123', loop = 1.0 + NUM.length * 0.6 + 1.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const i = pre ? -1 : Math.floor((v - 0.5) / 0.6), typed = pre ? 0 : Math.max(0, Math.min(NUM.length, Math.floor((v - 0.5 + 0.3) / 0.6)));
      screen.set(NUM.slice(0, typed) || ' ');
      const d = NUM[Math.max(0, Math.min(NUM.length - 1, i))], [x, y] = keyAt(d), press = i >= 0 && i < NUM.length ? bump(v - 0.5 - i * 0.6, 0.1, 0.4) : 0;
      glow.visible = press > 0.5; glow.position.set(x, y, 0.025 * u);
      hand.group.visible = !pre && i < NUM.length + 1; hand.update(); handTo(hand, x, y, 0.03 * u + 0.12 * u * (1 - press), tip);
    },
  };
}

export const SCENES = { 'ticket-gate': ticketGate, 'stamp-letter': stampLetter, 'train-arrive': trainArrive, 'car-park': carPark, 'traffic-red': trafficRed, neighbourhood, 'postcard-post': postcardPost, 'button-press': buttonPress, keypad };
