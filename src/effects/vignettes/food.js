// Food scenes (mostly word cards).
//   food-row      食べ物: three plates slide in one after another, each with a food on it (a rice ball, a fish, an apple);
//                 a fork comes down and stabs one, lifts it away
//   fruit-bowl    果物: a bowl; an apple, a banana and a bunch of grapes drop in one by one and settle
//   drink-straw   飲み物: a glass of juice; a straw drops in, the level goes down with rising bubbles (slurp); it refills
//   toaster       朝ごはん: a toaster in the morning light; two slices pop up high and land, an egg fries in a pan beside it
//   teabag        紅茶: a teabag dunks into a cup of hot water three times and the red-brown colour spreads; steam
//   bowl-spin     茶碗: clay spins on a potter's wheel and rises into a bowl, then gets its blue glaze
//   bento-open    お弁当: a lunchbox; its lid lifts off to show rice, an egg roll and a sausage; chopsticks pick one
//   ashtray       灰皿: a cigarette is stubbed out in a dish, a curl of smoke rises and fades
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { emblemProp, bowl, teacup, disc, chopsticks, apple, stick } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps, arc, mixColor } from './helpers.js';

const plateGeo = (u, r = 0.2) => [[G.cyl(r * u, r * 0.7 * u, 0.03 * u, 0, 0.015 * u, 0, 0, 0, 0, 28), 0xf6f4ee], [G.torus(r * 0.8 * u, 0.008 * u).rotateX(Math.PI / 2).translate(0, 0.03 * u, 0), 0x3a6ad0]];
const riceBall = (u) => [[G.cone(0.1 * u, 0.15 * u, 0, 0.075 * u), 0xfbfbf4], [G.box(0.1 * u, 0.06 * u, 0.02 * u, 0, 0.035 * u, 0.06 * u), 0x1a2a1a]];
const fish = (u) => [[G.sphere(0.12 * u, 0, 0.05 * u, 0, 1, 0.4, 0.45), 0x8aa0c0], [G.cone(0.06 * u, 0.08 * u, 0.14 * u, 0.05 * u, 0, Math.PI / 2), 0x6a80a0], [G.sphere(0.012 * u, -0.08 * u, 0.06 * u, 0.04 * u), 0x101010]];

function foodRow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY + 0.1 * u, S = 1.3;
  const dishes = [riceBall(S * u), fish(S * u), [[G.sphere(0.1 * S * u, 0, 0.1 * S * u), 0xe03030], [G.cyl(0.008 * u, 0.008 * u, 0.06 * u, 0, 0.2 * S * u), 0x5a3a20]]].map((food) => solidProp([...plateGeo(S * u), ...food]));
  const fork = solidProp([[G.box(0.025 * u, 0.4 * u, 0.02 * u, 0, 0.3 * u, 0), 0xc8ccd4], ...[-1, 0, 1].map((i) => [G.box(0.012 * u, 0.12 * u, 0.012 * u, i * 0.025 * u, 0.04 * u, 0), 0xc8ccd4]), [G.box(0.08 * u, 0.02 * u, 0.015 * u, 0, 0.1 * u, 0), 0xc8ccd4]], 0.4);
  group.add(...dishes, fork);
  const x0 = B.maxX + 0.35 * u, gap = 0.55 * u, loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { stab: [1.8, 0.35, 'in'], lift: [2.3, 0.6, 'out'], back: [3.8, 0.6] });
      dishes.forEach((d, i) => { const f = pre ? between(A.setup, 0.3 + 0.2 * i, 0.55 + 0.2 * i) : 1 - between(v, 3.9 + 0.1 * i, 4.4 + 0.1 * i); d.position.set(x0 + i * gap + (1 - f) * 1.5 * u, floor, 0.03 * u); d.rotation.x = 0.4; d.visible = f > 0.01; });
      // the fork stabs the fish (the middle plate) and lifts it up out of the scene
      const fx = x0 + gap, top = floor + 0.08 * S * u, y = pre ? top + 0.9 * u : top + 0.9 * u - 0.85 * u * T.stab + 1.2 * u * T.lift - 1.25 * u * T.back;
      fork.position.set(fx, y, 0.06 * u); fork.visible = !pre;
      dishes[1].visible = dishes[1].visible && !(T.lift > 0 && T.back < 1);
    },
  };
}

function fruitBowl(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, S = 1.7, bx = B.maxX + 0.5 * u;
  const bw = bowl(S * u, { color: 0xc89a60, inner: 0xe8c890 }), red = apple(1.6 * u, { r: 0.1 });
  red.body.material.color.setHex(0xe02828);
  const banana = solidProp([[G.tube([[-0.14, 0.04], [-0.07, -0.02], [0.03, -0.03], [0.13, 0.03]].map(([x, y]) => [x * S * u, y * S * u]), 0.035 * S * u), 0xf8d830]], 0.45);
  const grapes = solidProp([...[[0, 0], [-0.04, 0.03], [0.04, 0.03], [0, 0.06], [-0.08, 0.06], [0.08, 0.06], [-0.04, 0.09], [0.04, 0.09], [0, 0.12]].map(([x, y]) => [G.sphere(0.03 * S * u, x * S * u, -y * S * u + 0.12 * S * u, 0), 0x7a3ab8]), [G.cyl(0.006 * u, 0.006 * u, 0.06 * u, 0, 0.16 * S * u), 0x5a7a30]], 0.4);
  bw.position.set(bx, floor, 0.03 * u);
  group.add(bw, red, banana, grapes);
  const fruits = [red, banana, grapes], REST = [[-0.07, 0.2], [0.06, 0.2], [0.0, 0.24]], DROP = [0.2, 0.8, 1.4], loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      bw.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const out = between(v, 3.9, 4.4);
      fruits.forEach((f, i) => {
        const k = pre ? 0 : between(v, DROP[i], DROP[i] + 0.45), y = floor + REST[i][1] * S * u + (1 - k * k) * 1.0 * u + 0.03 * u * bump(v, DROP[i] + 0.45, 0.2);
        f.visible = k > 0 && out < 1; f.position.set(bx + REST[i][0] * S * u, y, 0.05 * u - 0.02 * u * i); f.scale.setScalar(1 - out); f.rotation.z = wobble(v, DROP[i] + 0.45, 0.6, 3) * 0.2;
      });
    },
  };
}

function drinkStraw(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.45 * u, S = 1.6;
  const glass = solidProp([[G.cyl(0.11 * S * u, 0.09 * S * u, 0.3 * S * u, 0, 0.15 * S * u, 0, 0, 0, 0, 24), 0xd8f0ff]], 0.2);
  glass.material.transparent = true; glass.material.opacity = 0.35; glass.material.depthWrite = false;
  const juice = solidProp([[G.cyl(0.1 * S * u, 0.085 * S * u, 1, 0, 0.5, 0, 0, 0, 0, 24), spec.color ?? 0xff9a20]], 0.55);
  const straw = solidProp([[G.cyl(0.012 * S * u, 0.012 * S * u, 0.42 * S * u, 0, 0.21 * S * u, 0), 0xff4a8a], [G.cyl(0.012 * S * u, 0.012 * S * u, 0.08 * S * u, 0.03 * S * u, 0.44 * S * u, 0, 0, 0, -1.0), 0xff4a8a]]);
  const bubbles = many([[G.sphere(0.014 * S * u), 0xffffff]], 6, 0.6);
  glass.position.set(gx, floor, 0.03 * u); juice.position.set(gx, floor + 0.01 * u, 0.03 * u);
  group.add(juice, glass, straw, bubbles);
  const loop = 4.8, H = 0.27 * S * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { straw: [0.1, 0.4, 'bounce'], sip: [0.9, 2.2, 'linear'], refill: [3.6, 0.8] });
      const level = pre ? between(A.setup, 0.3, 0.9) : 1 - 0.85 * T.sip + 0.85 * T.refill;
      juice.scale.set(1, Math.max(1e-3, level * H), 1); juice.visible = level > 0.01;
      straw.visible = !pre && v < 3.5; straw.position.set(gx + 0.02 * u, floor + 0.05 * u + (1 - T.straw) * 0.8 * u, 0.04 * u); straw.rotation.z = -0.15;
      for (let i = 0; i < 6; i++) { const f = ((v * 1.5 + i / 6) % 1); bubbles.set(i, gx + 0.04 * u * Math.sin(i * 2), floor + 0.03 * u + level * H * f, 0.04 * u, T.sip > 0 && T.sip < 1 ? 1 : 0); }
      bubbles.commit();
    },
  };
}

function toaster(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const box = solidProp([[G.box(0.42 * u, 0.3 * u, 0.24 * u, 0, 0.15 * u, 0), 0xd8dde6], [G.box(0.08 * u, 0.02 * u, 0.25 * u, -0.1 * u, 0.3 * u, 0), 0x303030], [G.box(0.08 * u, 0.02 * u, 0.25 * u, 0.1 * u, 0.3 * u, 0), 0x303030], [G.box(0.03 * u, 0.08 * u, 0.04 * u, 0.22 * u, 0.2 * u, 0), 0x303030]], 0.3);
  const slice = () => solidProp([[G.box(0.17 * u, 0.2 * u, 0.04 * u, 0, 0, 0), 0xe0a050], [G.box(0.14 * u, 0.17 * u, 0.042 * u, 0, -0.005 * u, 0), 0xfff0c8]], 0.4);
  const slices = [slice(), slice()], pan = solidProp([[G.cyl(0.17 * u, 0.15 * u, 0.04 * u, 0, 0.02 * u, 0), 0x30343c], [G.cyl(0.02 * u, 0.02 * u, 0.25 * u, 0.28 * u, 0.04 * u, 0, 0, 0, Math.PI / 2), 0x30343c], [G.sphere(0.11 * u, 0, 0.045 * u, 0, 1, 0.15, 1), 0xffffff], [G.sphere(0.045 * u, 0, 0.06 * u, 0, 1, 0.6, 1), 0xffc020]], 0.4);
  box.position.set(tx, floor, 0); pan.position.set(tx + 0.55 * u, floor + 0.02 * u, 0.05 * u);
  const steam = many(PUFF(u, 0xf4f4f8), 4, 0.6);
  group.add(box, ...slices, pan, steam);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pop: [0.6, 0.6, 'out'], fall: [1.2, 0.6, 'bounce'], in: [3.8, 0.5] });
      slices.forEach((s, i) => {
        const up = pre ? 0 : T.pop * (1 - T.fall), down = T.fall, x = tx + (i ? 0.1 : -0.1) * u + (i ? 1 : -1) * 0.12 * u * down;
        s.position.set(x, floor + 0.28 * u + 0.65 * u * up + (down > 0 ? 0.65 * u * (1 - down) - 0.18 * u * down : 0) - 0.12 * u * T.in, 0.0); s.rotation.z = (i ? -1 : 1) * 1.2 * down;
        s.visible = T.in < 1;
      });
      wisps(steam, 0, 4, tx + 0.55 * u, floor + 0.1 * u, t, u, { period: 1.6, rise: 0.4 });
      steam.commit();
    },
  };
}

function teabag(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.4 * u, S = 1.7;
  const cup = teacup(S * u), tea = disc(S * u, 0.094, 0xffffff), bag = solidProp([[G.box(0.09 * u, 0.12 * u, 0.02 * u, 0, 0, 0), 0xf0e8d0], [G.cyl(0.003 * u, 0.003 * u, 0.4 * u, 0, 0.26 * u, 0), 0xf8f8f8], [G.box(0.07 * u, 0.05 * u, 0.01 * u, 0, 0.47 * u, 0), 0xd83838]], 0.4);
  const steam = many(PUFF(1.3 * u, 0xf4f4f8), 5, 0.6), c = new THREE.Color();
  cup.position.set(cx, floor, 0.03 * u); cup.rotation.x = 0.45; tea.position.set(0, 0.136 * S * u, 0); cup.add(tea);   // tipped towards you: the tea shows
  group.add(cup, bag, steam);
  const loop = 4.6, DIPS = [0.3, 0.9, 1.5];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const dip = pre ? 0 : Math.max(0, ...DIPS.map((d) => bump(v, d, 0.55))), away = between(v, 2.2, 2.6) - between(v, 4.0, 4.4);
      bag.position.set(cx + 0.02 * u, floor + 0.3 * S * u - 0.17 * S * u * dip + 0.6 * u * Math.max(0, away), 0.03 * u); bag.visible = !pre;
      const brew = pre ? 0 : between(v, 0.4, 2.2) * (1 - between(v, 4.0, 4.5));
      mixColor(c, 0xf4ead8, 0x9a3a14, brew); tea.material.color.copy(c);
      wisps(steam, 0, 5, cx, floor + 0.15 * S * u, t, u, { period: 1.8, rise: 0.6 });
      steam.commit();
    },
  };
}

function bowlSpin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.5 * u, S = 1.3;
  const wheelTop = solidProp([[G.cyl(0.3 * u, 0.3 * u, 0.05 * u, 0, 0.18 * u, 0, 0, 0, 0, 32), 0x6a6e78], [G.cyl(0.12 * u, 0.16 * u, 0.16 * u, 0, 0.08 * u, 0), 0x40444c]], 0.25);
  const clay = solidProp([[G.sphere(0.12 * u, 0, 0, 0, 1, 0.8, 1), 0xb07850]], 0.3), pot = bowl(S * u, { color: 0xb07850, inner: 0xc89070 }), c = new THREE.Color();
  wheelTop.position.set(wx, floor, 0);
  group.add(wheelTop, clay, pot);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { shape: [0.4, 1.4], glaze: [2.0, 0.8], reset: [4.2, 0.5] });
      clay.visible = pre || T.shape < 0.5; clay.position.set(wx, floor + 0.28 * u, 0.0); clay.scale.set(1 + 0.6 * T.shape, 1 - 0.4 * T.shape, 1 + 0.6 * T.shape); clay.rotation.y = t * 6;
      const k = pre ? 0 : between(T.shape, 0.4, 1) * (1 - T.reset);
      pot.visible = k > 0.01; pot.position.set(wx, floor + 0.205 * u, 0); pot.scale.set(Math.max(1e-3, 0.6 + 0.4 * k), Math.max(1e-3, k), Math.max(1e-3, 0.6 + 0.4 * k)); pot.rotation.y = t * 6;
      mixColor(c, 0xffffff, 0x9ab8ff, T.glaze); pot.material.color.copy(c);
    },
  };
}

function bentoOpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, S = 1.5;
  const box = solidProp([[G.box(0.5 * S * u, 0.12 * S * u, 0.32 * S * u, 0, 0.06 * S * u, 0), 0x2a2a30], [G.box(0.46 * S * u, 0.01 * S * u, 0.28 * S * u, 0, 0.115 * S * u, 0), 0xc02020], [G.sphere(0.07 * S * u, -0.13 * S * u, 0.12 * S * u, 0, 1.2, 0.5, 1.2), 0xfbfbf4], [G.sphere(0.012 * S * u, -0.13 * S * u, 0.16 * S * u, 0.02 * S * u), 0xc02040], [G.box(0.12 * S * u, 0.06 * S * u, 0.08 * S * u, 0.06 * S * u, 0.14 * S * u, 0.05 * S * u), 0xffd840], [G.capsule(0.025 * S * u, 0.08 * S * u, 0.16 * S * u, 0.14 * S * u, -0.06 * S * u, Math.PI / 2), 0xd84040], [G.sphere(0.035 * S * u, 0.14 * S * u, 0.14 * S * u, -0.06 * S * u), 0x40a040]], 0.4);
  const lid = solidProp([[G.box(0.52 * S * u, 0.04 * S * u, 0.34 * S * u, 0, 0, 0), 0xc83a3a], [G.box(0.05 * S * u, 0.042 * S * u, 0.35 * S * u, 0, 0, 0), 0xf0d060]]);
  const sticks = chopsticks(S * u);
  box.position.set(bx, floor, 0); box.rotation.x = 0.35;
  group.add(box, lid, sticks);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.3, 0.6, 'out'], pick: [1.6, 0.5], lift: [2.1, 0.6], close: [3.8, 0.6] });
      const open = pre ? 0 : T.open - T.close;
      lid.position.set(bx + 0.45 * S * u * open, floor + 0.15 * S * u + 0.3 * u * Math.sin(Math.PI * Math.min(1, open)) * 0.5, -0.02 * u); lid.rotation.set(0.35, 0, -0.5 * open);
      sticks.visible = !pre && v > 1.4 && v < 3.1; sticks.position.set(bx + 0.08 * S * u, floor + 0.2 * S * u + (1 - T.pick) * 0.4 * u + 0.6 * u * T.lift, 0.05 * u); sticks.rotation.z = 0.35;
    },
  };
}

function ashtray(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.45 * u, S = 1.5;
  const dish = solidProp([[G.cyl(0.2 * S * u, 0.17 * S * u, 0.06 * S * u, 0, 0.03 * S * u, 0, 0, 0, 0, 24), 0x8a96a8], [G.cyl(0.15 * S * u, 0.15 * S * u, 0.01 * S * u, 0, 0.061 * S * u, 0), 0x50545c], [G.sphere(0.05 * S * u, 0.03 * S * u, 0.065 * S * u, 0, 1.4, 0.3, 1), 0x9a9a9a]], 0.3);
  const cig = solidProp([[G.cyl(0.018 * S * u, 0.018 * S * u, 0.2 * S * u, 0, 0.1 * S * u, 0), 0xf8f8f4], [G.cyl(0.0185 * S * u, 0.0185 * S * u, 0.06 * S * u, 0, 0.03 * S * u, 0), 0xd89040], [G.sphere(0.017 * S * u, 0, 0.2 * S * u), 0xff5020]], 0.5);
  const smoke = many(PUFF(1.2 * u, 0xd0d0d8), 5, 0.5);
  dish.position.set(ax, floor, 0); group.add(dish, cig, smoke);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { down: [0.2, 0.5, 'in'], squash: [0.7, 0.3], fade: [2.6, 1.2], again: [3.9, 0.4] });
      cig.position.set(ax - 0.05 * u, floor + 0.07 * S * u + (1 - T.down) * 0.6 * u + 0.6 * u * T.again * 0, 0.02 * u); cig.rotation.z = 0.9 * (1 - T.squash) + 1.5 * T.squash; cig.scale.set(1, 1 - 0.4 * T.squash, 1);
      cig.visible = pre || T.again < 0.5; cig.scale.multiplyScalar(pre ? 1 : 1 - T.again);
      wisps(smoke, 0, 5, ax - 0.02 * u, floor + 0.12 * S * u, t, u, { period: 2.2, rise: 0.8, sway: 0.1, on: pre ? 1 : 1 - T.fade });
      smoke.commit();
    },
  };
}

export const SCENES = { 'food-row': foodRow, 'fruit-bowl': fruitBowl, 'drink-straw': drinkStraw, toaster, teabag, 'bowl-spin': bowlSpin, 'bento-open': bentoOpen, ashtray };
