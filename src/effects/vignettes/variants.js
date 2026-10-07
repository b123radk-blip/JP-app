// Other outcomes of a kanji's scene, for its words: the same type with an option, so the word reads as the kanji's
// story told another way (the similarity check scores such a pair EFFECTS.similarity.sceneVariant, not 1).
//   chop-split  food carrot   切る: a carrot on a board is chopped into rounds, one after another, slices tipping over
//   coat-on     outcome wear  着る: the coat drops on and the person does up its buttons one by one, then admires it
//   coat-on     outcome jacket 上着: a jacket hangs on a stand; the person lifts it off, swings it round onto their shoulders
//   tea-pour    outcome serve お茶: after the pour, the cup slides forward to you on its saucer, steam curling up
//   big-brother outcome piggyback お兄さん: the big kid gives the small one a piggyback, walking along, both waving
//   come-near   outcome face  近い: a person beside the kanji leans in towards you until their face is right up close
//   noon-sun    outcome eat   昼ご飯: under the noon sun the person sits and eats a rice ball, bite by bite
//   stack-plates outcome dry  お皿: a hand wipes a wet plate round and round with a cloth until it gleams, sets it on the pile
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, burst } from '../pieces/kit-things.js';
import { emblemProp, cleaver, teacup, disc } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps, arc, handTo, bonePoint } from './helpers.js';

export function chopCarrot(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.6 * u, N = 5, seg = 0.13 * u;
  const board = solidProp([[G.box(0.9 * u, 0.06 * u, 0.35 * u, 0, 0.03 * u, 0), 0xd8a868]]); board.position.set(bx, floor, 0); board.rotation.x = 0.3;
  const slices = many([[G.cyl(0.055 * u, 0.06 * u, seg * 0.95, 0, 0, 0, 0, 0, Math.PI / 2), 0xff8a20], [G.cyl(0.03 * u, 0.03 * u, seg * 0.96, 0, 0, 0, 0, 0, Math.PI / 2), 0xffb050]], N, 0.45);
  const top = solidProp([[G.cone(0.05 * u, 0.2 * u, 0, 0, 0, -Math.PI / 2 - 0.2), 0x40a040], [G.cone(0.04 * u, 0.18 * u, 0, 0.03 * u, 0, -Math.PI / 2 + 0.3), 0x50b050]]);
  const knife = cleaver(1.4 * u);
  group.add(board, slices, top, knife);
  const loop = 4.6, CH = [0.4, 1.0, 1.6, 2.2], y0 = floor + 0.12 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const cuts = pre ? 0 : CH.filter((c) => v >= c + 0.25).length, back = between(v, 3.9, 4.4);
      for (let i = 0; i < N; i++) {
        const cut = i >= N - cuts, k = cut ? between(v, CH[N - 1 - i] + 0.25, CH[N - 1 - i] + 0.6) : 0;
        slices.set(i, bx - 0.25 * u + i * seg + 0.06 * u * k * (i - 1), y0 + 0.02 * u * k, 0.02 * u, 1 - back, 0, 1.4 * k);       // cut slices tip over: you see the rounds
      }
      slices.commit();
      top.position.set(bx - 0.25 * u - 0.12 * u, y0, 0.02 * u); top.visible = back < 1;
      // the cleaver chops at the next cut, moving left along the carrot
      const ci = pre ? 0 : Math.min(3, Math.max(0, Math.floor((v - 0.1) / 0.6))), chop = pre ? 0 : bump(v, CH[ci] - 0.05, 0.6);
      knife.position.set(bx - 0.25 * u + (N - 1 - ci) * seg + seg * 0.5, y0 - 0.05 * u + 0.45 * u * (1 - chop), 0.05 * u); knife.visible = !pre && v < 3.0;
    },
  };
}

export function coatVariant(ctx, spec, stage, base) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, COAT = spec.color ?? 0x2a6ad0, jacket = spec.outcome === 'jacket';
  const p = createPerson({ u, shirt: 0xd8d8e0 });
  const coat = solidProp([[G.box(0.25 * u, 0.3 * u, 0.2 * u, 0, 0, 0), COAT], [G.cyl(0.05 * u, 0.05 * u, 0.3 * u, -0.17 * u, -0.02 * u, 0, 0, 0, 0.3), COAT], [G.cyl(0.05 * u, 0.05 * u, 0.3 * u, 0.17 * u, -0.02 * u, 0, 0, 0, -0.3), COAT]]);
  const buttons = many([[G.sphere(0.018 * u), 0xffd040]], 3, 0.8), rack = jacket ? solidProp([[G.cyl(0.02 * u, 0.02 * u, 1.0 * u, 0, 0.5 * u, 0), 0x6a4a2a], [G.cyl(0.1 * u, 0.12 * u, 0.04 * u, 0, 0.02 * u, 0), 0x6a4a2a], [G.cyl(0.012 * u, 0.012 * u, 0.12 * u, 0.05 * u, 0.95 * u, 0, 0, 0, -0.8), 0x6a4a2a]]) : null;
  if (rack) { rack.position.set(px + 0.55 * u, floor, -0.05 * u); group.add(rack); }
  group.add(p.group, coat, buttons);
  const loop = 5.0, chest = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { take: [0.2, 0.5], swing: [0.7, 0.8], btn: [1.6, 1.2, 'linear'], admire: [3.0, 0.8], off: [4.4, 0.5] });
      p.group.position.set(px, floor, 0.02 * u); p.face(jacket ? (v < 1.5 && !pre ? -1.3 + 2.6 * Math.min(1, T.take) : 0) : 0).reset();
      const btnPose = T.btn > 0 && T.btn < 1 ? 1 : 0; p.bone('armL').rotation.x = p.bone('armR').rotation.x = 0.9 * btnPose; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.5 * btnPose;
      if (T.admire > 0 && T.off < 1) { p.raise('L', 0.8 * bump(v, 3.0, 1.0)); p.group.rotation.y += 0.5 * Math.sin(v * 4) * bump(v, 3.0, 1.2); }
      p.update();
      bonePoint(p, 'body', 0.6, chest);
      const on = pre ? 0 : jacket ? T.swing : between(v, 0.2, 0.7), dressed = on >= 1 && T.off < 1;
      const from = jacket ? [px + 0.6 * u, floor + 0.85 * u] : [chest.x, chest.y + 1.0 * u], [cx, cy] = arc(from, [chest.x, chest.y], jacket ? 0.4 * u : 0, on);
      coat.visible = !pre && !dressed || (pre && jacket); coat.position.set(pre ? from[0] : cx, pre ? from[1] : cy, chest.z); coat.rotation.z = jacket ? -Math.PI * 2 * on : 0;
      const shirt = 0xd8d8e0, skin = 0xffd2b0;
      p.rig.setColor('body', dressed ? COAT : shirt); for (const b of ['armL', 'armR']) p.rig.setColor(b, dressed ? COAT : shirt); for (const b of ['foreL', 'foreR']) p.rig.setColor(b, dressed ? COAT : skin);
      for (let i = 0; i < 3; i++) buttons.set(i, chest.x, chest.y + (0.06 - i * 0.07) * u, chest.z + 0.11 * u, dressed && (jacket || T.btn > i / 3 + 0.05) ? 1 : 0);
      buttons.commit();
    },
  };
}

export function teaServe(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, S = 1.6, cx = B.maxX + 0.4 * u;
  const cup = teacup(S * u, { color: 0xe8f0e0, band: 0x3a8a5a }), tea = disc(S * u, 0.094, 0x8ab84a), saucer = solidProp([[G.cyl(0.2 * S * u, 0.15 * S * u, 0.02 * S * u, 0, 0, 0, 0, 0, 0, 28), 0xe8f0e0]], 0.4);
  tea.position.set(0, 0.136 * S * u, 0); cup.add(tea); cup.rotation.x = 0.4; saucer.rotation.x = 0.4;
  const steam = many(PUFF(1.3 * u, 0xf4f4f8), 5, 0.6), bowP = createPerson({ u: 0.9 * u, shirt: 0x6a4a8a, pants: 0x6a4a8a });
  group.add(cup, saucer, steam, bowP.group);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { slide: [0.4, 1.2, 'out'], bow: [0.5, 0.6], up: [2.4, 0.6], back: [3.9, 0.6] });
      const f = pre ? 0 : T.slide - T.back, z = 0.05 * u + 0.6 * u * f, y = floor + 0.02 * u + 0.1 * u * f;
      saucer.position.set(cx, y, z); cup.position.set(cx, y + 0.01 * u, z);
      bowP.group.position.set(cx + 0.45 * u, floor, -0.05 * u); bowP.face(-0.4).reset(); bowP.lean(0.5 * (T.bow - T.up)); bowP.update();
      wisps(steam, 0, 5, cx, y + 0.2 * S * u, t, u, { period: 1.8, rise: 0.6 });
      steam.commit();
    },
  };
}

export function piggyback(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = createPerson({ u: 1.05 * u, shirt: 0x3a6ae0 }), small = createPerson({ u: 0.6 * u, shirt: 0xf0c030, hair: 0x6a3a1a });
  group.add(big.group, small.group);
  const loop = 4.8, back = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const walk = pre ? 0 : Math.sin((v / loop) * Math.PI * 2), x = B.maxX + 0.65 * u + 0.25 * u * walk;
      big.group.position.set(x, floor, 0.05 * u); big.face(Math.cos((v / loop) * Math.PI * 2) > 0 ? 'right' : 'left').reset().walk(v * 8, pre ? 0 : 1);
      big.lean(0.35); big.bone('armL').rotation.x = big.bone('armR').rotation.x = -0.6 + 0.35; big.update();
      bonePoint(big, 'body', 0.9, back);
      const dir = big.group.rotation.y > 0 ? -1 : 1;
      small.group.position.set(back.x + dir * 0.12 * u, back.y - 0.32 * 0.6 * u, back.z - 0.02 * u); small.group.rotation.y = big.group.rotation.y;
      small.reset(); small.bone('legL').rotation.x = small.bone('legR').rotation.x = 1.2; small.bone('armL').rotation.x = small.bone('armR').rotation.x = 1.6;
      small.raise('R', 2.5 * Math.abs(Math.sin(v * 3))); small.update();
    },
  };
}

export function nearFace(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const p = createPerson({ u, shirt: 0xd04a6a, hair: 0x6a3a1a });
  group.add(p.group);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { step: [0.2, 1.0], lean: [1.2, 0.8, 'out'], wave: [2.0, 1.2, 'linear'], back: [3.8, 0.7] });
      const f = pre ? 0 : T.step - T.back, l = pre ? 0 : T.lean - T.back;
      p.group.position.set(px, floor, 0.05 * u + 0.45 * u * f); p.face('toward').reset().walk(v * 8, T.step > 0 && T.step < 1 ? 1 : 0);
      p.lean(0.55 * l); p.bone('head').rotation.x = -0.3 * l;
      if (T.wave > 0 && T.wave < 1) { p.raise('R', 2.3); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 10); }
      p.update();
    },
  };
}

export function noonEat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u, shirt: 0xf0a030 }), sun = emblemProp('sun', 0.42 * u), ball = solidProp([[G.cone(0.08 * u, 0.12 * u, 0, 0), 0xfbfbf4], [G.box(0.08 * u, 0.05 * u, 0.02 * u, 0, -0.03 * u, 0.05 * u), 0x1a2a1a]], 0.5);
  p.rig.attach('handR', ball, 0.5);
  group.add(p.group, sun);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      sun.position.set(px + 0.2 * u, floor + 1.3 * u, -0.2 * u); sun.idle(t); sun.visible = !pre || A.setup > 0.5;
      p.group.position.set(px, floor - 0.2 * u, 0.05 * u); p.face(-0.4).reset();
      p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.5; p.bone('shinL').rotation.x = p.bone('shinR').rotation.x = -1.5;   // sitting
      const bite = pre ? 0 : Math.max(0, Math.sin(v * Math.PI * 1.1)), left = 1 - (pre ? 0 : Math.min(3, Math.floor(v / 1.4)) / 4);
      p.bone('armR').rotation.x = 1.0 + 0.9 * bite; p.bone('foreR').rotation.x = 1.4 + 0.6 * bite; p.update();
      ball.scale.setScalar(Math.max(1e-3, left));
    },
  };
}

export function plateDry(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), N = 3, R = Math.min(0.42, (B.w / u) * 0.42);
  const plate = solidProp([[G.cyl(R * u, R * 0.7 * u, 0.05 * u, 0, 0, 0, Math.PI / 2, 0, 0, 32), 0xf6f4ee], [G.torus(R * 0.8 * u, 0.01 * u).translate(0, 0, 0.026 * u), 0x3a6ad0]], 0.4);
  const pile = many([[G.cyl(R * u, R * 0.7 * u, 0.05 * u, 0, 0, 0, 0, 0, 0, 32), 0xf6f4ee], [G.torus(R * 0.8 * u, 0.01 * u).rotateX(Math.PI / 2).translate(0, 0.03 * u, 0), 0x3a6ad0]], N, 0.35);
  const hand = createHand({ u: 0.6 * u, side: -1, sleeve: 0x40a080 }), cloth = solidProp([[G.sphere(0.09 * u, 0, 0, 0, 1.2, 0.5, 1), 0xe86a6a]], 0.4), drops = many([[G.sphere(0.015 * u), 0x8ad0ff]], 6, 0.8), shine = burst(u, { s: 0.3, color: 0xffffff });
  hand.pose('grip'); hand.grip.add(cloth); hand.group.rotation.z = 1.0;
  group.add(plate, pile, hand.group, drops, shine);
  const px = B.maxX + 0.5 * u, py = B.cy + 0.1 * u, loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { wipe: [0.3, 1.8, 'linear'], put: [2.4, 0.7], back: [4.0, 0.5] });
      const [x, y] = arc([px, py], [B.cx, B.maxY + 0.02 * u + 0.06 * u * N], 0.3 * u, T.put);
      plate.position.set(x, y, 0.05 * u); plate.rotation.x = T.put * Math.PI / 2 * 0.95; plate.visible = T.put < 1;
      for (let i = 0; i < N; i++) pile.set(i, B.cx, B.maxY + 0.02 * u + i * 0.06 * u, 0.02 * u, i < N - 1 || T.put >= 1 ? 1 - T.back : 0, 0, 0, 0.3);
      pile.commit();
      const a = v * 9, wiping = T.wipe > 0 && T.wipe < 1;
      hand.group.visible = wiping; hand.update(); handTo(hand, px + 0.12 * u * Math.cos(a), py + 0.12 * u * Math.sin(a), 0.08 * u);
      for (let i = 0; i < 6; i++) drops.set(i, px + (i - 2.5) * 0.08 * u, py - 0.1 * u - 0.3 * u * ((v * 1.5 + i / 6) % 1), 0.08 * u, !pre && T.wipe < 0.6 ? 1 : 0);
      drops.commit();
      const s = pre ? 0 : bump(v, 2.1, 0.5); shine.visible = s > 0; shine.scale.setScalar(Math.max(1e-3, s)); shine.position.set(px + 0.1 * u, py + 0.1 * u, 0.1 * u);
    },
  };
}
