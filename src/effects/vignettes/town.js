// Out in town (word cards).
//   (ticket-gate moved to town-gate.js)
//   (stamp-letter moved to town-stamp.js)
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
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, handTo, liveText } from './helpers.js';

// a fingertip to steer a pointing hand by (handTo(hand, x, y, z, tip))
function fingertip(hand, u) { const o = new THREE.Object3D(); hand.bone('f0b').add(o); o.position.y = 0.13 * u; return o; }

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
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.55 * u;
  const car = createModel('sedan', { height: 0.4 * u }), k = 0.4 * u / 1.3, wheels = ['wheel-front-left', 'wheel-front-right', 'wheel-back-left', 'wheel-back-right'].map(car.node);
  const SW = 0.6 * u, SZ0 = -0.56 * u, SZ1 = 0.4 * u, ZC = -0.06 * u, lane = ZC + 0.5 * u, d = 0.5 * u, L = Math.PI * d / 2, TOP = 0.007 * u;
  const lot = solidProp([[G.box(1.5 * u, 0.006 * u, 1.7 * u, 0, 0, 0), 0x4a4d56], [G.box(0.035 * u, 0.008 * u, SZ1 - SZ0, -SW / 2, 0.001 * u, (SZ0 + SZ1) / 2), 0xffffff], [G.box(0.035 * u, 0.008 * u, SZ1 - SZ0, SW / 2, 0.001 * u, (SZ0 + SZ1) / 2), 0xffffff],
    [G.box(SW + 0.035 * u, 0.008 * u, 0.035 * u, 0, 0.001 * u, SZ0), 0xffffff], [G.box(0.5 * u, 0.007 * u, 0.025 * u, 0, 0.001 * u, lane + 0.3 * u), 0xf0d040]], 0.25);
  const slope = new THREE.Group(); slope.position.set(px, floor + 0.01 * u, 0); slope.rotation.x = 0.32;
  const lamps = many([[G.sphere(0.1 * k), 0xffffb0]], 2, 1.6), rings = many([[G.torus(0.07 * u, 0.01 * u, Math.PI * 0.6, 0, 0, 0, -Math.PI * 0.3), 0xffe060]], 3, 1);
  car.group.add(lamps); slope.add(lot, car.group); group.add(slope, rings);
  const loop = 6.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0, 1.3, 'out'], rev: [1.5, 1.2], out: [4.1, 1.2], off: [5.3, 0.7, 'in'] }), X0 = 1.3 * u, X1 = -d;
      // drives in along the lane heading left, backs round into the slot (heading turns from left to the viewer), then pulls out the same way
      const s = pre ? 0 : T.rev * (1 - T.out), inX = pre ? X0 : X0 + (X1 - X0) * T.in, theta = -Math.PI / 2 * (1 - s);
      let x, z;
      if (s > 0 || T.out > 0) { x = -d + d * Math.sin(Math.PI * s / 2); z = ZC + d - d * (1 - Math.cos(Math.PI * s / 2)); } else { x = inX; z = lane; }
      if (T.off > 0) x = -d - 1.3 * u * T.off;
      const odo = (X0 - inX) - L * T.rev + L * T.out + 1.3 * u * T.off;                // distance driven forwards (the wheels turn with it)
      car.group.position.set(x, TOP, z); car.group.rotation.y = theta; car.group.visible = !pre && Math.abs(x) < 1.0 * u + 0.1 * u;
      wheels.forEach((w) => w && (w.rotation.x = odo / (0.3 * k)));
      const beep = pre ? 0 : bump(v, 2.9, 0.3) + bump(v, 3.5, 0.3), lit = s > 0.97 ? 0.6 + 1.4 * beep : 0.3;
      lamps.set(0, 0.5 * k, 0.45 * k, 1.27 * k, lit); lamps.set(1, -0.5 * k, 0.45 * k, 1.27 * k, lit); lamps.commit();
      for (let i = 0; i < 3; i++) { const at = i < 2 ? 2.9 : 3.5, f = pre ? 0 : between(v, at + (i % 2) * 0.1, at + 0.5 + (i % 2) * 0.1); rings.set(i, px + 0.0 * u + 0.12 * u * f * (i % 2 ? 1 : 0.6) + 0.1 * u, floor + 0.45 * u + 0.1 * u * f, 0.25 * u, f > 0 && f < 1 ? 1 + 1.5 * f : 0); }
      rings.commit();
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

export const SCENES = { 'train-arrive': trainArrive, 'car-park': carPark, 'traffic-red': trafficRed, neighbourhood, 'postcard-post': postcardPost, 'button-press': buttonPress, keypad };
