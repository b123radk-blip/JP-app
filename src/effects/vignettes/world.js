// The world around (Batch 2 kanji).
//   egg-hatch     初: an egg in a nest wobbles, its top pops off and a chick peeks out and blinks at the world for the
//                 very first time, a sparkle
//   clouds-part   晴: grey clouds cover the sun and rain falls; they slide apart, the sun beams out and a person throws
//                 their arms up
//   think-click   意: a person thinks; in the thought bubble a "?" spins round and turns into "!", and up goes a finger
//   roller-blue   青: a roller paints a white wall blue, stripe by stripe, and a bluebird lands on top
//   shop-open     屋: a little shop: its shutter rolls up, the shopkeeper behind the counter waves, the awning flutters
//   playground    場: an empty lot; a slide and a swing pop up out of the ground and kids run in to play on them
//   build-toy     作: a toy car is put together: the body drops on, the wheels pop on, a hammer taps, and it drives off
//   soot-puff     黒: a chimney coughs a big black cloud over a person, who comes out black all over, only their eyes
//                 blinking; they shake it off
//   stairs-down   降: a person walks down a staircase step by step; at the bottom rain starts to fall
//   learn-fly     習: a baby bird on a branch flaps, tumbles off, flaps again; the third time it flies
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, burst, hammer } from '../pieces/kit-things.js';
import { emblemProp, wheel } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, handTo, bonePoint } from './helpers.js';
import { chickStep, drawerPull, stopCar, showerSing, rainbowClear, stinkSock, blueBalloon, heightLine, shopVariant, hairBraid } from './variants2.js';

const cloudGeo = (u, s, c = 0x9aa0ac) => [[G.sphere(0.2 * s * u, 0, 0, 0, 1.4, 0.8, 0.8), c], [G.sphere(0.15 * s * u, -0.2 * s * u, -0.04 * s * u), c], [G.sphere(0.16 * s * u, 0.2 * s * u, -0.03 * s * u), c], [G.sphere(0.13 * s * u, 0.05 * s * u, 0.1 * s * u), c]];

function eggHatch(ctx, spec, stage) {
  if (spec.outcome === 'step') return chickStep(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ex = B.maxX + 0.45 * u, S = 1.6;
  const nest = solidProp([[G.torus(0.13 * S * u, 0.05 * S * u).rotateX(Math.PI / 2 - 0.3), 0x9a7040]], 0.3);
  const bottom = solidProp([[new THREE.SphereGeometry(0.1 * S * u, 24, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55).scale(1, 1.3, 1), 0xfaf6ee]], 0.4);
  const top = solidProp([[new THREE.SphereGeometry(0.1 * S * u, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45).scale(1, 1.3, 1), 0xfaf6ee]], 0.4);
  const chick = solidProp([[G.sphere(0.075 * S * u, 0, 0, 0), 0xffe040], [G.cone(0.02 * S * u, 0.04 * S * u, 0, -0.01 * S * u, 0.08 * S * u, -Math.PI / 2), 0xff8a20], [G.sphere(0.014 * S * u, -0.03 * S * u, 0.02 * S * u, 0.065 * S * u, 1, 1, 0.5), 0x101010], [G.sphere(0.014 * S * u, 0.03 * S * u, 0.02 * S * u, 0.065 * S * u, 1, 1, 0.5), 0x101010]], 0.5);
  const spark = burst(u, { s: 0.35, color: 0xffffff }), base = [ex, floor + 0.12 * S * u];
  nest.position.set(ex, floor + 0.04 * S * u, 0); bottom.position.set(...base, 0.02 * u);
  group.add(nest, bottom, top, chick, spark);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pop: [1.2, 0.5, 'out'], peek: [1.4, 0.5, 'back'], close: [4.3, 0.5] });
      const rock = pre ? 0 : 0.2 * (wobble(v, 0.2, 0.5, 4) + wobble(v, 0.8, 0.5, 4));
      bottom.rotation.z = rock;
      const off = T.pop * (1 - T.close), [tx, ty] = arc([base[0], base[1] + 0.005 * u], [base[0] + 0.35 * u, base[1] - 0.05 * u], 0.3 * u, off);
      top.position.set(tx, ty, 0.02 * u); top.rotation.z = rock + 2.4 * off;
      const peek = pre ? 0 : T.peek * (1 - T.close); chick.visible = peek > 0.02; chick.position.set(base[0], base[1] + 0.06 * S * u * peek, 0.03 * u);
      chick.rotation.y = 0.6 * Math.sin(v * 2) * peek; chick.scale.set(1, v % 1.3 < 0.12 && peek > 0.9 ? 0.85 : 1, 1);
      const sp = pre ? 0 : bump(v, 1.6, 0.7); spark.visible = sp > 0; spark.scale.setScalar(Math.max(1e-3, sp)); spark.position.set(base[0] + 0.15 * u, base[1] + 0.3 * u, 0.1 * u); spark.rotation.z = v * 3;
    },
  };
}

function cloudsPart(ctx, spec, stage) {
  if (spec.outcome === 'rainbow') return rainbowClear(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u, cy = floor + 1.0 * u;
  const L = solidProp(cloudGeo(u, 1.5), 0.3), R = solidProp(cloudGeo(u, 1.4), 0.3), sun = emblemProp('sun', 0.5 * u), rain = many([[G.sphere(0.014 * u, 0, 0, 0, 0.7, 2.6, 0.7), 0x8ac8ff]], 18, 0.8), p = createPerson({ u: 0.8 * u, shirt: 0xf0a030 });
  group.add(sun, L, R, rain, p.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { part: [0.8, 1.0], close: [4.2, 0.7] }), open = pre ? 0 : T.part - T.close;
      L.position.set(cx - 0.12 * u - 0.6 * u * open, cy, 0.05 * u); R.position.set(cx + 0.12 * u + 0.6 * u * open, cy - 0.04 * u, 0.08 * u);
      L.material.userData.glow.value = R.material.userData.glow.value = 0.2 + 0.5 * open;
      sun.position.set(cx, cy, -0.05 * u); sun.idle(t); sun.scale.setScalar(0.5 * u * (0.8 + 0.4 * open));
      for (let i = 0; i < 18; i++) { const f = ((t * 1.6 + i / 18 * 3) % 1); rain.set(i, cx - 0.4 * u + (i % 9) * 0.1 * u, cy - 0.15 * u - 0.9 * u * f, 0.06 * u, 1 - open > 0.5 ? 1 : 0); }
      rain.commit();
      p.group.position.set(cx + 0.05 * u, floor, 0.15 * u); p.face('toward').reset(); const joy = bump(v, 1.6, 1.4); p.raise('L', 2.6 * joy); p.raise('R', 2.6 * joy); p.lean(open < 0.5 ? 0.2 : 0); p.update();
    },
  };
}

function thinkClick(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const p = createPerson({ u, shirt: 0x60a0c0 }), bubble = solidProp([[G.sphere(0.25 * u, 0, 0, 0, 1.3, 0.9, 0.5), 0xffffff], [G.sphere(0.05 * u, -0.25 * u, -0.25 * u, 0), 0xffffff], [G.sphere(0.03 * u, -0.33 * u, -0.36 * u, 0), 0xffffff]], 0.6);
  const q = emblemProp('question', 0.3 * u), ex = emblemProp('exclaim', 0.32 * u), pop = burst(u, { s: 0.5, color: 0xffe060 });
  const bx = px + 0.4 * u, by = floor + 1.25 * u; bubble.position.set(bx, by, 0);
  group.add(p.group, bubble, q, ex, pop);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { spin: [0.8, 0.7, 'in'], idea: [1.5, 0.3, 'back'], end: [4.0, 0.5] });
      bubble.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.5, 0.4, 'back'] }).a * (1 - T.end)));
      const isQ = pre || v < 1.5 || T.end > 0.5;
      q.visible = isQ && T.end < 0.5; q.position.set(bx, by, 0.1 * u); q.rotation.y = Math.PI * 4 * T.spin; q.idle(0);
      ex.visible = !isQ; ex.position.set(bx, by, 0.1 * u); ex.scale.setScalar(0.32 * u * Math.max(1e-3, T.idea)); ex.idle(v);
      const b = pre ? 0 : bump(v, 1.5, 0.5); pop.visible = b > 0; pop.scale.setScalar(Math.max(1e-3, b)); pop.position.set(bx, by, 0.05 * u);
      p.group.position.set(px, floor, 0.05 * u); p.face(0.2).reset();
      const scratch = pre ? 0 : (v < 1.5 ? 1 : 0); p.raise('R', 2.6 * scratch); p.bone('foreR').rotation.z = -1.3 * scratch + 0.2 * Math.sin(v * 12) * scratch;
      const finger = pre ? 0 : T.idea * (1 - T.end); p.raise('L', 2.8 * finger); p.bone('head').rotation.x = -0.2 * finger;
      p.update();
    },
  };
}

function rollerBlue(ctx, spec, stage) {
  if (spec.outcome === 'balloon') return blueBalloon(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.2 * u, W = 1.0 * u, H = 0.9 * u, COLOR = spec.color ?? 0x2a6ae0;
  const wall = solidProp([[G.box(W, H, 0.02 * u, W / 2, H / 2, 0), 0xf4f4f0]], 0.3), paint = solidProp([[G.box(1, H, 0.022 * u, 0.5, H / 2, 0), COLOR]], 0.5);
  const roller = solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.24 * u, 0, 0, 0.04 * u, 0, 0, 0), COLOR], [G.cyl(0.008 * u, 0.008 * u, 0.4 * u, 0.15 * u, -0.25 * u, 0.04 * u, 0, 0, -0.5), 0x8a5a30]], 0.4);
  const bird = emblemProp('bird', 0.35 * u, { color: COLOR });
  wall.position.set(wx, floor, -0.08 * u); paint.position.set(wx, floor, -0.07 * u);
  group.add(wall, paint, roller, bird);
  const loop = 5.4, COLS = 4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { paint: [0.2, 2.8, 'linear'], bird: [3.2, 0.7, 'out'], wipe: [4.8, 0.5] });
      const f = T.paint, col = Math.min(COLS - 1, Math.floor(f * COLS)), inCol = f * COLS - col, done = (col + inCol) / COLS;
      paint.scale.x = Math.max(1e-3, W * done * (1 - T.wipe)); paint.visible = done > 0.01 && T.wipe < 1;
      const up = col % 2 ? 1 - inCol : inCol;
      roller.visible = !pre && f > 0 && f < 1; roller.position.set(wx + W * (col + 0.5) / COLS, floor + 0.12 * u + (H - 0.24 * u) * up, 0.0);
      const [bxp, byp] = arc([wx + W + 0.6 * u, floor + 1.3 * u], [wx + W * 0.6, floor + H + 0.12 * u], 0.2 * u, T.bird);
      bird.visible = !pre && T.bird > 0 && T.wipe < 0.5; bird.position.set(bxp, byp, 0.02 * u); bird.idle(T.bird < 1 ? v : 0);
    },
  };
}

function shopOpen(ctx, spec, stage) {
  if (spec.outcome === 'veg' || spec.outcome === 'closed') return shopVariant(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u, W = 0.9 * u, H = 0.95 * u;
  const STRIPES = 6, front = solidProp([[G.box(W + 0.08 * u, 0.06 * u, 0.3 * u, 0, H, 0), 0x8a5a30], [G.box(0.06 * u, H, 0.3 * u, -W / 2, H / 2, 0), 0x8a5a30], [G.box(0.06 * u, H, 0.3 * u, W / 2, H / 2, 0), 0x8a5a30], [G.box(W, 0.3 * u, 0.25 * u, 0, 0.15 * u, 0.02 * u), 0xc89a60],
    ...Array.from({ length: STRIPES }, (_, i) => [G.box(W / STRIPES, 0.06 * u, 0.25 * u, -W / 2 + (i + 0.5) * W / STRIPES, H + 0.04 * u, 0.2 * u, 0), i % 2 ? 0xffffff : 0xe03838]),
    ...[0xe04848, 0x40b060, 0xf0c030, 0x4a8ae0].map((c, i) => [G.sphere(0.05 * u, -0.27 * u + i * 0.18 * u, 0.36 * u, 0.06 * u), c])], 0.35);
  const shutter = solidProp([[G.box(W, 1, 0.02 * u, 0, -0.5, 0), 0xb8c0cc], ...[0.2, 0.4, 0.6, 0.8].map((y) => [G.box(W, 0.01, 0.022 * u, 0, -y, 0), 0x9aa4b4])], 0.25);
  const keeper = createPerson({ u: 0.75 * u, shirt: 0x40a080 });
  front.position.set(sx, floor, 0); shutter.position.set(sx, floor + H - 0.03 * u, 0.15 * u);
  group.add(keeper.group, front, shutter);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [0.3, 1.0, 'out'], down: [4.3, 0.8, 'in'] }), shut = pre ? 1 : 1 - T.up + T.down;
      shutter.scale.set(1, Math.max(1e-3, (H - 0.06 * u) * shut), 1);
      keeper.group.position.set(sx + 0.05 * u, floor + 0.05 * u, -0.06 * u); keeper.face('toward').reset();
      if (!pre && T.up > 0.8 && T.down < 0.2) { keeper.raise('R', 2.5); keeper.bone('foreR').rotation.z = -0.5 * Math.sin(v * 9); }
      keeper.update();
      front.rotation.z = 0;
    },
  };
}

function playground(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.3 * u;
  const slide = solidProp([[G.box(0.05 * u, 0.6 * u, 0.05 * u, 0, 0.3 * u, -0.1 * u), 0xe04848], [G.box(0.05 * u, 0.6 * u, 0.05 * u, 0, 0.3 * u, 0.1 * u), 0xe04848], [G.box(0.12 * u, 0.04 * u, 0.24 * u, 0, 0.6 * u, 0), 0xe04848], [G.box(0.7 * u, 0.03 * u, 0.2 * u, 0.32 * u, 0.33 * u, 0, -0.75), 0xf0c030]], 0.35);
  const frame = solidProp([[G.box(0.04 * u, 0.85 * u, 0.04 * u, -0.25 * u, 0.42 * u, 0), 0x4a8ae0], [G.box(0.04 * u, 0.85 * u, 0.04 * u, 0.25 * u, 0.42 * u, 0), 0x4a8ae0], [G.box(0.55 * u, 0.04 * u, 0.04 * u, 0, 0.85 * u, 0), 0x4a8ae0]], 0.35);
  const swing = solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.55 * u, -0.08 * u, -0.27 * u, 0), 0xc0c0c8], [G.cyl(0.006 * u, 0.006 * u, 0.55 * u, 0.08 * u, -0.27 * u, 0), 0xc0c0c8], [G.box(0.2 * u, 0.025 * u, 0.1 * u, 0, -0.55 * u, 0), 0x8a5a30]], 0.35);
  const sx = gx, fx = gx + 1.05 * u; slide.position.set(sx, floor, 0); frame.position.set(fx, floor, -0.05 * u);
  const k1 = createPerson({ u: 0.5 * u, shirt: 0xf0a030 }), k2 = createPerson({ u: 0.5 * u, shirt: 0x60c070 });
  group.add(slide, frame, swing, k1.group, k2.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const I = timeline(A.setup, { slide: [0.3, 0.4, 'back'], swing: [0.5, 0.4, 'back'] });
      slide.scale.set(1, Math.max(1e-3, I.slide), 1); frame.scale.set(1, Math.max(1e-3, I.swing), 1);
      const sa = pre ? 0 : 0.6 * Math.sin(v * 2.5) * between(v, 0.5, 1.2);
      swing.position.set(fx, floor + 0.83 * u * I.swing, -0.05 * u); swing.rotation.x = sa; swing.visible = I.swing > 0.95;
      // kid 1 climbs to the top of the slide and slides down, again and again; kid 2 rides the swing
      const c = pre ? 0 : (v % 2.5) / 2.5, onTop = c < 0.35, f = between(c, 0.35, 0.8);
      const k1x = onTop ? sx - 0.02 * u : sx + 0.6 * u * f, k1y = onTop ? floor + 0.62 * u * Math.min(1, c / 0.3) : floor + 0.62 * u - 0.5 * u * f;
      k1.group.position.set(k1x, k1y, 0.0); k1.group.visible = !pre; k1.face(onTop ? 'away' : 'right').reset(); if (!onTop) { k1.bone('legL').rotation.x = k1.bone('legR').rotation.x = 1.4; k1.raise('L', 2.2); k1.raise('R', 2.2); } k1.update();
      k2.group.visible = !pre && v > 0.4; k2.group.position.set(fx + Math.sin(sa) * 0.0, floor + 0.83 * u - 0.55 * u * Math.cos(sa) - 0.3 * u + 0.02 * u, -0.05 * u + 0.55 * u * Math.sin(sa)); k2.face('toward').reset();
      k2.bone('legL').rotation.x = k2.bone('legR').rotation.x = 1.4; k2.raise('L', 2.9); k2.raise('R', 2.9); k2.update();
    },
  };
}

function buildToy(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u;
  const chassis = solidProp([[G.box(0.5 * u, 0.06 * u, 0.22 * u, 0, 0.1 * u, 0), 0x50545c]], 0.3), body = solidProp([[G.box(0.46 * u, 0.14 * u, 0.22 * u, 0, 0, 0), 0xe03838], [G.box(0.26 * u, 0.12 * u, 0.2 * u, -0.04 * u, 0.12 * u, 0), 0xe03838], [G.box(0.2 * u, 0.08 * u, 0.205 * u, -0.04 * u, 0.12 * u, 0), 0x9ad8ff]], 0.4);
  const wheels = [0, 1, 2, 3].map(() => wheel(u, { r: 0.07 })), hand = createHand({ u: 0.6 * u, side: -1, sleeve: 0x8a6ad0 }), tool = hammer(0.55 * u);
  hand.pose('grip'); tool.rotation.z = -Math.PI / 2; hand.grip.add(tool); hand.group.rotation.z = Math.PI;
  group.add(chassis, body, ...wheels, hand.group);
  const loop = 5.4, WX = [-0.16, 0.16];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { body: [0.2, 0.4, 'bounce'], w: [0.7, 0.8], tap: [1.6, 0.9], drive: [2.8, 1.0, 'in'], back: [3.9, 1.1] });
      const dx = pre ? 0 : 1.2 * u * T.drive - 1.2 * u * T.back * (T.drive >= 1 ? 1 : 0), x = cx + dx;
      chassis.position.set(x, floor, 0.02 * u);
      body.position.set(x, floor + 0.2 * u + (1 - T.body) * 0.6 * u, 0.02 * u); body.visible = pre ? false : T.body > 0;
      wheels.forEach((w, i) => { const k = pre ? 0 : between(v, 0.7 + i * 0.2, 0.85 + i * 0.2); w.visible = k > 0.01; w.scale.setScalar(Math.max(1e-3, k)); w.position.set(x + WX[i % 2] * u, floor + 0.07 * u, i < 2 ? 0.13 * u : -0.09 * u); w.rotation.z = -dx / (0.07 * u); });
      const tapping = T.tap > 0 && T.tap < 1, hit = Math.max(0, Math.sin(v * 12)) * (tapping ? 1 : 0);
      hand.group.visible = tapping; hand.update(); hand.group.rotation.z = Math.PI - 0.3 * (1 - hit);
      handTo(hand, x + 0.52 * 0.55 * u, floor + 0.32 * u + 0.165 * 0.55 * u + 0.08 * u * (1 - hit), 0.05 * u);
    },
  };
}

function sootPuff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u;
  const chimney = solidProp([[G.box(0.22 * u, 0.6 * u, 0.22 * u, 0, 0.3 * u, 0), 0xa04a3a], [G.box(0.27 * u, 0.06 * u, 0.27 * u, 0, 0.6 * u, 0), 0x7a3a2a]], 0.3);
  chimney.position.set(cx, floor, -0.05 * u);
  const smoke = many(PUFF(2.4 * u, 0x1a1a20), 8, 0.05), p = createPerson({ u: 0.85 * u, shirt: 0xf0f0f0, pants: 0x6a8ac0 });
  const eyes = many([[G.sphere(0.02 * u, 0, 0, 0, 1, 1.3, 0.6), 0xffffff]], 2, 1.0);
  group.add(chimney, smoke, p.group, eyes);
  const loop = 5.0, head = new THREE.Vector3(), SOOT = 0x18181c;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { cough: [0.4, 0.5, 'out'], clear: [1.2, 0.8], shake: [3.0, 1.2] });
      const px = cx - 0.45 * u; p.group.position.set(px, floor, 0.12 * u); p.face(0.5).reset();
      const black = !pre && v > 0.75 && T.shake < 0.7;
      for (const b of ['body', 'head', 'armL', 'armR', 'foreL', 'foreR', 'legL', 'legR', 'shinL', 'shinR', 'handL', 'handR', 'hair']) p.rig.setColor(b, black ? SOOT : b === 'body' ? 0xf0f0f0 : b.startsWith('leg') || b.startsWith('shin') ? 0x6a8ac0 : b === 'hair' ? 0x3a2416 : 0xffd2b0);
      if (T.shake > 0 && T.shake < 1) { p.group.rotation.y += 0.4 * Math.sin(v * 22); p.raise('L', 0.8); p.raise('R', 0.8); }
      p.update();
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : between(v, 0.4 + i * 0.03, 1.4 + i * 0.05), a = i * 0.8; smoke.set(i, cx - 0.6 * u * f + 0.15 * u * Math.cos(a) * f, floor + 0.7 * u + 0.25 * u * f + 0.12 * u * Math.sin(a) * f, 0.15 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) * (1.1 - T.clear * 0.5) : 0); }
      smoke.commit();
      bonePoint(p, 'head', 0.55, head);
      const blink = v % 1.4 < 0.12 ? 0.2 : 1;
      eyes.set(0, head.x - 0.01 * u, head.y, head.z + 0.1 * u, black ? blink : 0); eyes.set(1, head.x + 0.06 * u, head.y, head.z + 0.08 * u, black ? blink : 0); eyes.commit();
    },
  };
}

function stairsDown(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.2 * u, N = 4, SW = 0.25 * u, SH = 0.15 * u;
  const steps = solidProp(Array.from({ length: N }, (_, i) => [G.box(SW * (N - i), SH, 0.35 * u, SW * (N - i) / 2, SH * (i + 0.5), 0), i % 2 ? 0xd8c8a8 : 0xc8b898]), 0.3);
  steps.position.set(sx, floor, -0.05 * u);
  const p = createPerson({ u: 0.8 * u, shirt: 0x5a8ad0 }), cloud = solidProp(cloudGeo(u, 1.2), 0.3), rain = many([[G.sphere(0.014 * u, 0, 0, 0, 0.7, 2.6, 0.7), 0x8ac8ff]], 14, 0.8);
  group.add(steps, p.group, cloud, rain);
  const loop = 5.4, top = SH * N;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { down: [0.2, 2.4, 'linear'], off: [2.6, 0.5], cloud: [2.4, 0.6, 'out'], up: [4.6, 0.8] });
      const f = pre ? 0 : T.down * (1 - T.up), stepI = Math.min(N, Math.floor(f * N + 0.0001)), within = f * N - stepI;
      // walks down: along each tread, then drops to the next one
      const x = sx + SW * 0.4 + SW * (stepI + within) + 0.25 * u * T.off * (1 - T.up), y = floor + top - SH * (stepI + (within > 0.75 ? (within - 0.75) * 4 : 0));
      p.group.position.set(x, Math.max(floor, y), 0.02 * u); p.face('right').reset().walk(v * 9, f > 0 && f < 1 ? 1 : 0); p.update();
      const c = pre ? 0 : T.cloud * (1 - T.up); cloud.visible = c > 0.01; cloud.position.set(sx + SW * N + 0.2 * u, floor + 1.15 * u, 0.0); cloud.scale.setScalar(Math.max(1e-3, c));
      for (let i = 0; i < 14; i++) { const r = ((t * 1.6 + i / 14 * 3) % 1); rain.set(i, sx + SW * N + (i % 7 - 3) * 0.08 * u, floor + 1.0 * u - 1.0 * u * r, 0.05 * u, c > 0.9 ? 1 : 0); }
      rain.commit();
    },
  };
}

function learnFly(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.2 * u, by = floor + 0.75 * u;
  const branch = solidProp([[G.tube([[0, 0], [0.4 * u, 0.03 * u], [0.75 * u, 0.0]], 0.028 * u), 0x6a4a2a], [G.sphere(0.06 * u, 0.7 * u, 0.04 * u, 0, 1.5, 0.6, 1), 0x48a848]], 0.3);
  branch.position.set(bx, by, -0.03 * u);
  const bird = emblemProp('bird', 0.32 * u, { color: 0xf0c040 }), puff = many(PUFF(u, 0xd8c8a8), 4, 0.3);
  group.add(branch, bird, puff);
  const loop = 6.0, perch = [bx + 0.45 * u, by + 0.09 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // try 1 and 2: flap, tumble to the ground, hop back up; try 3: flap and fly away up and round, landing back
      const tries = [[0.2, 1.4], [1.7, 1.4]], k = tries.findIndex(([a, d]) => v >= a && v < a + d);
      let x = perch[0], y = perch[1], flap = 0, rot = 0;
      if (!pre && k >= 0) { const s = (v - tries[k][0]) / tries[k][1]; flap = s < 0.6 ? 1 : 0; const fall = between(s, 0.1, 0.45), back = between(s, 0.65, 1); y = perch[1] - (perch[1] - floor - 0.06 * u) * fall * (1 - back) + 0.1 * u * Math.sin(Math.PI * back); x = perch[0] + 0.15 * u * fall * (1 - back); rot = 1.2 * fall * (1 - back) * (s < 0.65 ? 1 : 0); }
      else if (!pre && v >= 3.2) { const s = between(v, 3.2, 5.8); flap = s > 0 && s < 1 ? 1 : 0; const a = s * Math.PI * 2; x = perch[0] + 0.5 * u * Math.sin(a); y = perch[1] + 0.55 * u * Math.sin(Math.PI * s); }
      bird.position.set(x, y, 0.03 * u); bird.rotation.z = rot; bird.idle(flap ? v : 0);
      for (let i = 0; i < 4; i++) { const f = !pre && k >= 0 ? between((v - tries[k][0]) / tries[k][1], 0.45, 0.7) : 0; puff.set(i, perch[0] + 0.15 * u + (i - 1.5) * 0.08 * u * f, floor + 0.03 * u + 0.05 * u * f, 0.05 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) : 0); }
      puff.commit();
    },
  };
}

export const SCENES = { 'egg-hatch': eggHatch, 'clouds-part': cloudsPart, 'think-click': thinkClick, 'roller-blue': rollerBlue, 'shop-open': shopOpen, playground, 'build-toy': buildToy, 'soot-puff': sootPuff, 'stairs-down': stairsDown, 'learn-fly': learnFly };
