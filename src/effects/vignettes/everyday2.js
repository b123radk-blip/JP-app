// Batch 2 word scenes: everyday things.
//   subway-cut    地下鉄: the street is cut open like a cake: a train runs through a tunnel underneath while a person
//                 walks along on top
//   book-one      初め: a book flips open to its very first page, a big "1" on it, a little start flag pops up
//   weather-board 晴れ: a weather board flips from a grey cloud to a bright sun and a big smile
//   fridge        冷蔵庫: a fridge door swings open, cold mist spills out, a hand takes out a bottle of milk; it shuts
//   touch-ice     冷たい: a fingertip touches a big ice cube and jerks back, shaking, frost puffs
//   word-picture  意味: a word card (りんご) turns over and on the back is the thing itself: an apple
//   arrange-row   並べる: a hand puts cups down one by one in a neat straight row
//   window-shut   閉める: a hand slides a window down shut against the wind, the curtain stops flapping
//   bus-off       降りる: a bus pulls up, the door folds open and a person steps down off it onto the pavement
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane, teacup, apple, wheel } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo, wisps, arc } from './helpers.js';

const fingertip = (hand, u) => { const o = new THREE.Object3D(); hand.bone('f0b').add(o); o.position.y = 0.13 * u; return o; };

function subwayCut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.95 * u;
  const ground = solidProp([[G.box(1.6 * u, 0.06 * u, 0.4 * u, 0, -0.03 * u, 0), 0x6a6a72], [G.box(1.6 * u, 0.5 * u, 0.4 * u, 0, -0.36 * u, -0.01 * u), 0x8a6a4a], [G.box(1.6 * u, 0.26 * u, 0.02 * u, 0, -0.36 * u, 0.2 * u), 0x2a2a30]], 0.25);
  ground.position.set(cx, floor + 0.5 * u, 0);
  const train = emblemProp('train', 0.42 * u, { color: 0x3a8ae0 }), p = createPerson({ u: 0.6 * u, shirt: 0xe07a30 });
  group.add(ground, train, p.group);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v, f = (v / loop) % 1;
      train.position.set(cx + 0.7 * u - 1.4 * u * f, floor + 0.15 * u, 0.24 * u);   // in front of the tunnel's dark face train.idle(v); train.visible = f < 0.95;
      p.group.position.set(cx - 0.6 * u + 1.2 * u * f, floor + 0.5 * u, 0.1 * u); p.face('right').reset().walk(v * 8, 1).update();
    },
  };
}

function bookOne(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), bx = B.maxX + 0.55 * u, by = B.cy;
  const back = solidProp([[G.box(0.36 * u, 0.48 * u, 0.04 * u, 0.18 * u, 0, -0.02 * u), 0xc03030], [G.box(0.34 * u, 0.46 * u, 0.02 * u, 0.17 * u, 0, 0.005 * u), 0xfaf6ee]], 0.35);
  const cover = new THREE.Group(), coverM = solidProp([[G.box(0.36 * u, 0.48 * u, 0.03 * u, 0.18 * u, 0, 0), 0xc03030], [G.box(0.2 * u, 0.05 * u, 0.032 * u, 0.18 * u, 0.1 * u, 0), 0xf0d060]], 0.35);
  cover.add(coverM); cover.position.set(bx, by, 0.025 * u); back.position.set(bx, by, 0);
  const one = textPlane('1', { h: 0.3 * u, color: '#202020' }), flag = emblemProp('flag', 0.3 * u, { kind: 'start' });
  one.position.set(bx + 0.17 * u, by, 0.02 * u);
  group.add(back, cover, one, flag);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.3, 0.7, 'out'], flag: [1.0, 0.4, 'back'], shut: [3.8, 0.5] }), o = pre ? 0 : T.open - T.shut;
      cover.rotation.y = -Math.PI * 0.95 * o; one.visible = o > 0.5;
      const k = pre ? 0 : T.flag * (1 - T.shut); flag.visible = k > 0.01; flag.position.set(bx + 0.45 * u, by + 0.3 * u, 0.05 * u); flag.scale.setScalar(0.3 * u * Math.max(1e-3, k)); flag.idle(v);
    },
  };
}

function weatherBoard(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.55 * u, cy = B.cy + 0.05 * u;
  const board = new THREE.Group(), face = solidProp([[G.box(0.55 * u, 0.55 * u, 0.04 * u, 0, 0, 0), 0x2a3a5a], [G.box(0.5 * u, 0.5 * u, 0.042 * u, 0, 0, 0), 0x9ad0ff]], 0.35);
  const cloud = solidProp([[G.sphere(0.12 * u, 0, 0, 0.03 * u, 1.4, 0.8, 0.5), 0x8a909c], [G.sphere(0.09 * u, -0.1 * u, -0.02 * u, 0.03 * u, 1, 1, 0.5), 0x8a909c], [G.sphere(0.1 * u, 0.1 * u, -0.01 * u, 0.03 * u, 1, 1, 0.5), 0x8a909c]], 0.3);
  const sun = solidProp([[G.sphere(0.13 * u, 0, 0, -0.03 * u, 1, 1, 0.4), 0xffc020], ...Array.from({ length: 8 }, (_, i) => [G.box(0.05 * u, 0.02 * u, 0.01 * u, Math.cos(i * 0.785) * 0.19 * u, Math.sin(i * 0.785) * 0.19 * u, -0.03 * u, i * 0.785), 0xffa020]), [G.torus(0.06 * u, 0.008 * u, Math.PI, 0, -0.01 * u, -0.06 * u, Math.PI), 0x6a3a10]], 0.7);
  sun.rotation.y = Math.PI; board.add(face, cloud, sun); board.position.set(cx, cy, 0);
  const pole = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.6 * u, 0, -0.3 * u, -0.03 * u), 0x6a6e78]], 0.3); pole.position.set(cx, cy - 0.27 * u, 0);
  group.add(pole, board);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { flip: [0.6, 0.6, 'back'], back: [3.8, 0.5] });
      board.rotation.y = Math.PI * (pre ? 0 : T.flip - T.back); sun.rotation.z = v * 0.8;
    },
  };
}

function fridge(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.45 * u, W = 0.5 * u, H = 1.0 * u;
  const body = solidProp([[G.box(W, H, 0.4 * u, 0, H / 2, -0.2 * u), 0xf0f4f8], [G.box(W * 0.9, H * 0.9, 0.02 * u, 0, H / 2, -0.005 * u), 0x9ac8e8], [G.box(W * 0.85, 0.02 * u, 0.3 * u, 0, H * 0.45, -0.15 * u), 0xe8f0f8], [G.box(0.12 * u, 0.12 * u, 0.1 * u, -0.1 * u, H * 0.5, -0.12 * u), 0xe04848], [G.box(0.1 * u, 0.15 * u, 0.1 * u, 0.12 * u, H * 0.25, -0.12 * u), 0x60c060]], 0.35);
  const door = new THREE.Group(), doorM = solidProp([[G.box(W, H, 0.05 * u, W / 2, H / 2, 0), 0xe8eef4], [G.box(0.03 * u, 0.25 * u, 0.04 * u, W - 0.06 * u, H * 0.6, 0.04 * u), 0x9aa4b4]], 0.35);
  door.add(doorM); door.position.set(fx - W / 2, floor, 0.025 * u); body.position.set(fx, floor, 0);
  const mist = many(PUFF(1.6 * u, 0xe8f4ff), 6, 0.7), milk = solidProp([[G.box(0.09 * u, 0.18 * u, 0.09 * u, 0, 0.09 * u, 0), 0xffffff], [G.cone(0.065 * u, 0.06 * u, 0, 0.21 * u, 0), 0x3a8ae0]], 0.5);
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x8a6ad0 }); hand.pose('grip'); hand.grip.add(milk); milk.position.set(0, -0.05 * u, 0.02 * u); hand.group.rotation.z = 1.3;
  group.add(body, door, mist, hand.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.3, 0.5, 'out'], reach: [1.0, 0.5], take: [1.6, 0.6], shut: [2.6, 0.4] }), o = pre ? 0 : T.open - T.shut;
      door.rotation.y = -1.8 * o;
      for (let i = 0; i < 6; i++) { const f = ((v * 0.8 + i / 6) % 1); mist.set(i, fx + 0.1 * u + 0.25 * u * f, floor + H * 0.5 - 0.4 * u * f + (i - 3) * 0.05 * u, 0.15 * u, o > 0.3 ? Math.sin(Math.PI * f) : 0); }
      mist.commit();
      const shown = !pre && v > 0.9 && v < 3.4; hand.group.visible = shown; hand.update();
      handTo(hand, fx - 0.05 * u + 0.65 * u * T.take + 0.4 * u * (1 - T.reach), floor + H * 0.55, 0.0 + 0.25 * u * T.take);
    },
  };
}

function touchIce(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ix = B.maxX + 0.45 * u;
  const ice = solidProp([[G.box(0.28 * u, 0.28 * u, 0.28 * u, 0, 0.14 * u, 0), 0xd8f4ff]], 0.6); ice.material.transparent = true; ice.material.opacity = 0.8; ice.position.set(ix, floor, 0); ice.rotation.y = 0.5;
  const hand = createHand({ u: 0.6 * u, side: -1, sleeve: 0xe07a30 }), tip = fingertip(hand, 0.6 * u), frost = many(PUFF(0.8 * u, 0xf0faff), 4, 0.8);
  hand.pose('point'); hand.group.rotation.set(0.2, 0, 0.6);
  group.add(ice, hand.group, frost);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [0.2, 0.7, 'in'], yank: [0.95, 0.25, 'out'], calm: [2.4, 0.8] });
      const d = pre ? 1 : 1 - T.reach + 1.4 * T.yank * (1 - T.calm), shake = !pre && v > 1.0 && v < 2.6 ? 0.02 * u * tremble(v, 9) : 0;
      hand.update(); handTo(hand, ix + 0.16 * u + 0.6 * u * d + shake, floor + 0.2 * u + 0.3 * u * T.yank * (1 - T.calm), 0.12 * u, tip);
      for (let i = 0; i < 4; i++) { const f = between(v, 0.9, 1.6), a = i * 1.6; frost.set(i, ix + 0.16 * u + 0.12 * u * Math.cos(a) * f, floor + 0.2 * u + 0.12 * u * Math.sin(a) * f, 0.15 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) : 0); }
      frost.commit();
    },
  };
}

function wordPicture(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.5 * u, cy = B.cy + 0.05 * u;
  const card = new THREE.Group(), front = textPlane(spec.word ?? 'りんご', { h: 0.42 * u, w: 0.55 * u, color: '#202020', bg: '#fffaf0', size: 0.7 });
  const backFace = solidProp([[G.box(0.55 * u, 0.42 * u, 0.004 * u, 0, 0, -0.004 * u), 0xfffaf0]], 0.4), fruit = apple(1.6 * u, { r: 0.1 });
  fruit.body.material.color.setHex(0xe02828); fruit.position.set(0, -0.02 * u, -0.08 * u); fruit.rotation.y = Math.PI;
  card.add(front, backFace, fruit); card.position.set(cx, cy, 0);
  group.add(card);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { turn: [0.8, 0.7, 'back'], back: [3.8, 0.5] });
      card.rotation.y = Math.PI * (pre ? 0 : T.turn - T.back); card.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      fruit.scale.setScalar(1 + 0.1 * bump(v, 1.5, 0.5));
    },
  };
}

function arrangeRow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, N = 4, x0 = B.maxX + 0.3 * u;
  const cups = Array.from({ length: N }, (_, i) => teacup(1.2 * u, { band: [0xe04848, 0x40a0e0, 0x50b050, 0xf0c030][i] }));
  const hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x6a8ad0 }); hand.pose('grip'); hand.group.rotation.z = Math.PI;
  group.add(...cups, hand.group);
  const loop = 5.0, PUT = [0.2, 1.0, 1.8, 2.6];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, clear = between(v, 4.2, 4.7);
      let active = -1;
      cups.forEach((c, i) => {
        const f = pre ? 0 : between(v, PUT[i], PUT[i] + 0.6), [x, y] = arc([x0 + 1.3 * u, floor + 0.6 * u], [x0 + i * 0.26 * u, floor], 0.15 * u, f);
        if (f > 0 && f < 1) active = i;
        c.position.set(x, y, 0.05 * u); c.visible = f > 0 && clear < 1; c.scale.setScalar(Math.max(1e-3, 1 - clear));
      });
      hand.group.visible = active >= 0; hand.update();
      if (active >= 0) { const c = cups[active]; handTo(hand, c.position.x, c.position.y + 0.18 * u, 0.05 * u); }
    },
  };
}

function windowShut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.5 * u, wy = floor + 0.55 * u, W = 0.55 * u;
  const frame = solidProp([[G.box(W + 0.06 * u, 0.04 * u, 0.06 * u, 0, 0.42 * u, 0), 0xf0f0f0], [G.box(W + 0.06 * u, 0.04 * u, 0.06 * u, 0, -0.42 * u, 0), 0xf0f0f0], [G.box(0.04 * u, 0.88 * u, 0.06 * u, -W / 2, 0, 0), 0xf0f0f0], [G.box(0.04 * u, 0.88 * u, 0.06 * u, W / 2, 0, 0), 0xf0f0f0], [G.box(W, 0.84 * u, 0.01 * u, 0, 0, -0.04 * u), 0x203048]], 0.35);
  const sash = solidProp([[G.box(W, 0.4 * u, 0.02 * u, 0, 0, 0), 0xbfe4ff], [G.box(W, 0.03 * u, 0.03 * u, 0, 0.2 * u, 0), 0xf0f0f0], [G.box(W, 0.03 * u, 0.03 * u, 0, -0.2 * u, 0), 0xf0f0f0]], 0.4);
  sash.material.transparent = true; sash.material.opacity = 0.75;
  const curtain = solidProp([[G.box(0.2 * u, 0.8 * u, 0.01 * u, 0, -0.4 * u, 0), 0xe06a8a]], 0.4), hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x40a080 }), wind = many([[G.box(0.25 * u, 0.01 * u, 0.006 * u, 0, 0, 0), 0xf0f8ff]], 4, 1);
  frame.position.set(wx, wy, 0); curtain.position.set(wx - W / 2 + 0.12 * u, wy + 0.4 * u, 0.05 * u);
  hand.pose('flat'); hand.group.rotation.z = Math.PI;
  group.add(frame, sash, curtain, hand.group, wind);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { shut: [0.6, 0.8, 'in'], open: [3.8, 0.6] }), s = pre ? 0 : T.shut - T.open;
      sash.position.set(wx, wy + 0.2 * u + 0.4 * u * (1 - s) - 0.4 * u * 0, 0.02 * u); sash.position.y = wy - 0.2 * u + 0.42 * u * (1 - s);
      curtain.rotation.x = -0.5 * (1 - s) * (0.6 + 0.4 * Math.sin(t * 7)); curtain.rotation.z = 0.15 * (1 - s) * Math.sin(t * 5);
      hand.group.visible = !pre && T.shut > 0 && T.shut < 1 || (v > 0.4 && v < 1.6); hand.update(); handTo(hand, wx, sash.position.y + 0.25 * u, 0.06 * u, hand.bone('palm'));
      for (let i = 0; i < 4; i++) { const f = ((t * 1.3 + i / 4) % 1); wind.set(i, wx - 0.5 * u + 0.9 * u * f, wy - 0.2 * u + i * 0.12 * u, 0.1 * u, (1 - s) * Math.sin(Math.PI * f)); }
      wind.commit();
    },
  };
}

function busOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.75 * u;
  const bus = solidProp([[G.box(1.1 * u, 0.55 * u, 0.4 * u, 0, 0.38 * u, -0.15 * u), 0xf0b020], [G.box(1.0 * u, 0.18 * u, 0.405 * u, 0.02 * u, 0.48 * u, -0.15 * u), 0x9ad8ff], [G.box(0.22 * u, 0.4 * u, 0.41 * u, -0.38 * u, 0.3 * u, -0.15 * u), 0x40444c]], 0.35);
  const wheels = many([[G.torus(0.07 * u, 0.03 * u), 0x202428], [G.cyl(0.035 * u, 0.035 * u, 0.03 * u, 0, 0, 0, Math.PI / 2), 0xc8ccd4]], 2, 0.3), p = createPerson({ u: 0.7 * u, shirt: 0x40a0a0 });
  group.add(bus, wheels, p.group);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.2, 'out'], step: [1.5, 0.6], walk: [2.1, 1.2, 'linear'], go: [3.8, 1.2, 'in'] }), dx = 1.5 * u * (1 - T.come) - 2.4 * u * T.go;
      bus.position.x = bx + dx; bus.visible = !pre;
      [-0.35, 0.35].forEach((o, i) => wheels.set(i, bx + dx + o * u, floor + 0.1 * u, 0.06 * u, pre ? 0 : 1, -dx / (0.1 * u))); wheels.commit();
      const door = bx + dx - 0.38 * u, out = T.step;
      p.group.visible = !pre && v > 1.4; p.group.position.set(door - 0.15 * u * T.walk, floor + 0.12 * u * (1 - out), -0.15 * u + 0.35 * u * out); p.face(T.walk > 0 ? 'left' : 'toward').reset().walk(v * 9, (out > 0 && out < 1) || (T.walk > 0 && T.walk < 1) ? 1 : 0); p.update();
    },
  };
}

export const SCENES = { 'subway-cut': subwayCut, 'book-one': bookOne, 'weather-board': weatherBoard, fridge, 'touch-ice': touchIce, 'word-picture': wordPicture, 'arrange-row': arrangeRow, 'window-shut': windowShut, 'bus-off': busOff };
