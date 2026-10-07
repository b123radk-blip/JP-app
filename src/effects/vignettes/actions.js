// People doing things (Batch 2 kanji).
//   rope-pull     引: a person with a rope tied to the kanji leans back and hauls it towards them in three heaves (the
//                 mirror of 押's push)
//   stop-sign     止: a person runs up to a stop sign (止まれ) and skids to a dead stop, arms windmilling, dust flying
//   refuse-spoon  嫌: a hand offers a kid a spoonful of greens; the kid turns away, arms crossed, shaking their head;
//                 it tries the other side; no!
//   taste-spoon   味: a person dips a spoon into a steaming pot, tastes, and lights up: mm! a sparkle, a nod, a belly rub
//   shiver-frost  冷: frost creeps over the kanji and an icicle grows under it, dripping; a person beside it hugs
//                 themselves and shivers, breath puffing
//   sister-help   姉: a big girl kneels and ties a little one's shoelace (a bow pops), then takes their hand and leads
//                 them along
//   little-follow 弟: a big kid walks on; a little one hurries after, bouncing, falls behind; the big one waits and holds
//                 out a hand, and they go on together
//   line-up       並: five kids run in from both sides and line up shoulder to shoulder on a line, then all bow together
//   sing-mic      歌: a person sings into a microphone, swaying, notes pouring out, and ends with an arm flung up
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, burst } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs, handTo, bonePoint, beam, wisps } from './helpers.js';

const NOTE = (u) => [[G.sphere(0.035 * u, 0, 0, 0, 1.3, 1, 0.7), 0xffe060], [G.box(0.01 * u, 0.12 * u, 0.01 * u, 0.04 * u, 0.06 * u, 0), 0xffe060]];

function ropePull(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const p = createPerson({ u, shirt: 0x6a9a3a }), rope = solidProp([[G.cyl(0.012 * u, 0.012 * u, 1, 0, 0.5, 0), 0xd8b070]], 0.3), dust = many(PUFF(u), 6);
  group.add(p.group, rope, dust);
  const loop = 5.0, tie = new THREE.Vector3(), hands = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { grab: [0, 0.4], h1: [0.5, 0.4, 'out'], h2: [1.2, 0.4, 'out'], h3: [1.9, 0.4, 'out'], back: [3.4, 1.2] });
      const dx = pre ? 0 : 0.4 * u * ((T.h1 + T.h2 + T.h3) / 3 - T.back);
      poseGlyph(stage, dx, 0);
      const heave = Math.max(bump(v, 0.5, 0.5), bump(v, 1.2, 0.5), bump(v, 1.9, 0.5)), x = B.maxX + dx + 0.95 * u + 0.15 * u * ((T.h1 + T.h2 + T.h3) / 3 - T.back);
      p.group.position.set(x, floor, 0.04 * u); p.face('left').reset().walk(v * 6, heave * 0.5);
      const lean = pre ? 0 : -0.35 * T.grab - 0.2 * heave; p.lean(lean);
      for (const s of ['L', 'R']) { p.bone(`arm${s}`).rotation.x = Math.PI / 2 + lean + 0.1; p.bone(`fore${s}`).rotation.x = 0.2 + 0.4 * heave; }
      p.update();
      bonePoint(p, 'handL', 0.5, hands); tie.set(B.maxX + dx, B.cy - 0.1 * u, 0.04 * u);
      rope.visible = !pre && T.grab > 0.5; beam(rope, tie, hands);
      puffs(dust, 0, 6, B.minX + dx, floor, pre ? 0 : Math.max(...[0.5, 1.2, 1.9].map((h) => ((v - h) / 0.7 > 0 && (v - h) / 0.7 < 1 ? (v - h) / 0.7 : 0))), u, 0.3); dust.commit();
    },
  };
}

function stopSign(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u;
  const sign = emblemProp('stop', 0.8 * u), p = createPerson({ u: 0.9 * u, shirt: 0x3a8ae0 }), dust = many(PUFF(u), 6);
  sign.position.set(sx, floor + 0.55 * u, -0.08 * u);
  group.add(sign, p.group, dust);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      sign.idle(0); sign.scale.setScalar(0.8 * u * Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const T = timeline(v, { run: [0, 1.0, 'linear'], skid: [1.0, 0.45, 'out'], calm: [1.9, 0.5], off: [3.8, 1.0, 'in'] });
      const x = sx + 0.4 * u + 1.4 * u * (1 - T.run) - 0.25 * u * T.skid + 1.6 * u * T.off;
      p.group.position.set(x, floor, 0.12 * u); p.face(T.off > 0 ? 'right' : 'left').reset().walk(v * 14, T.run < 1 || T.off > 0 ? 1 : 0);
      const wind = bump(v, 1.0, 0.9); p.lean(-0.4 * T.skid * (1 - T.calm)); p.raise('L', 2.5 * wind + 0.6 * Math.sin(v * 16) * wind); p.raise('R', 2.5 * wind - 0.6 * Math.sin(v * 16) * wind);
      p.update();
      puffs(dust, 0, 6, x - 0.05 * u, floor, pre ? 0 : (v - 1.0) / 0.8, u, 0.3); dust.commit();
    },
  };
}

function refuseSpoon(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.4 * u;
  const kid = createPerson({ u: 0.85 * u, shirt: 0xe07ab0 }), hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x6a6a7a });
  const spoon = solidProp([[G.cyl(0.008 * u, 0.01 * u, 0.3 * u, 0, -0.15 * u, 0), 0xd8dde6], [G.sphere(0.045 * u, 0, -0.32 * u, 0, 1, 0.4, 1.3), 0xd8dde6], [G.sphere(0.035 * u, 0, -0.3 * u, 0), 0x3a9a3a], [G.sphere(0.025 * u, 0.02 * u, -0.27 * u, 0.01 * u), 0x50b050]], 0.4);
  hand.pose('grip'); spoon.rotation.z = Math.PI / 2; hand.grip.add(spoon); hand.group.rotation.z = 1.4;
  group.add(kid.group, hand.group);
  const loop = 5.0, mouth = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { offer: [0.2, 0.6], turn1: [0.8, 0.3], retry: [1.8, 0.5], turn2: [2.3, 0.3], give: [3.6, 0.6] });
      kid.group.position.set(kx, floor, 0.05 * u); kid.face(0.3).reset();
      const no = pre ? 0 : (T.turn1 - T.retry) * -1 + (T.turn2 - T.give) * 1, shake = !pre && v > 2.6 && v < 3.6 ? 0.25 * Math.sin(v * 14) : 0;
      kid.bone('head').rotation.y = 0.9 * no + shake;
      const cross = pre ? 0 : between(v, 1.0, 1.3) * (1 - T.give); kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 1.3 * cross; kid.raise('L', -0.6 * cross); kid.raise('R', -0.6 * cross); kid.bone('foreL').rotation.x = kid.bone('foreR').rotation.x = 1.2 * cross;
      kid.update();
      bonePoint(kid, 'head', 0.4, mouth);
      const near = pre ? 0 : T.offer * (1 - T.give) - 0.3 * T.turn1 + 0.3 * T.retry, side = v > 1.8 ? -1 : 1;
      hand.group.visible = !pre; hand.update(); handTo(hand, mouth.x + side * (0.2 + 0.45 * (1 - near)) * u, mouth.y - 0.02 * u, mouth.z + 0.12 * u);
      hand.group.rotation.z = side > 0 ? 1.4 : -1.4;
    },
  };
}

function tasteSpoon(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u, potX = px + 0.55 * u;
  const p = createPerson({ u, shirt: 0xf0f0f4 }), pot = emblemProp('pot', 0.45 * u), steam = many(PUFF(1.3 * u, 0xf4f4f8), 4, 0.6), yum = burst(u, { s: 0.3, color: 0xffe060 });
  const spoon = solidProp([[G.cyl(0.008 * u, 0.01 * u, 0.28 * u, 0, 0.14 * u, 0), 0xd8dde6], [G.sphere(0.04 * u, 0, 0.3 * u, 0, 1, 0.4, 1.3), 0xd8dde6]], 0.4);
  p.rig.attach('handR', spoon, 0.4); spoon.rotation.x = 1.6;
  pot.position.set(potX, floor + 0.18 * u, 0.05 * u);
  group.add(p.group, pot, steam, yum);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      pot.idle(t);
      const T = timeline(v, { dip: [0.2, 0.5], lift: [0.8, 0.5], taste: [1.3, 0.3], wow: [1.6, 0.5, 'back'], rub: [2.2, 1.2], end: [3.8, 0.6] });
      p.group.position.set(px, floor, 0.05 * u); p.face(0.6).reset();
      const dip = T.dip - T.lift, toMouth = T.lift * (1 - T.end);
      p.bone('armR').rotation.x = 1.0 + 0.4 * dip + 0.5 * toMouth; p.bone('foreR').rotation.x = 0.3 + 1.6 * toMouth;
      p.raise('R', -0.2 * toMouth); p.bone('head').rotation.x = -0.25 * T.wow * (1 - T.end); p.bone('head').rotation.y = 0.2 * Math.sin(v * 8) * bump(v, 1.6, 0.6);
      const rub = bump(v, 2.2, 1.2); p.bone('armL').rotation.x = 0.8 * rub; p.bone('foreL').rotation.x = 1.5 * rub; p.raise('L', -0.3 * rub + 0.15 * Math.sin(v * 9) * rub);
      p.update();
      wisps(steam, 0, 4, potX, floor + 0.35 * u, t, u, { period: 1.8, rise: 0.5 }); steam.commit();
      const w = pre ? 0 : bump(v, 1.5, 0.8); yum.visible = w > 0; yum.scale.setScalar(Math.max(1e-3, w)); yum.position.set(px + 0.12 * u, floor + 1.05 * u, 0.1 * u); yum.rotation.z = v * 3;
    },
  };
}

function shiverFrost(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u, N = 14;
  const spots = Array.from({ length: N }, (_, i) => { const s = ctx.strokes[(i * 5) % ctx.strokes.length]; return s.pts[Math.floor(s.pts.length * ((0.2 + 0.31 * i) % 1))]; });
  const frost = many([[G.box(0.09 * u, 0.012 * u, 0.012 * u, 0, 0, 0), 0xe8f8ff], [G.box(0.012 * u, 0.09 * u, 0.012 * u, 0, 0, 0), 0xe8f8ff], [G.box(0.06 * u, 0.01 * u, 0.012 * u, 0, 0, 0).rotateZ(0.8), 0xe8f8ff]], N, 1.0);
  const icicle = solidProp([[G.cone(0.04 * u, 0.3 * u, 0, -0.15 * u, 0, Math.PI), 0xd8f4ff]], 0.7), drip = many([[G.sphere(0.018 * u, 0, 0, 0, 0.8, 1.3, 0.8), 0x9ae0ff]], 2, 0.8);
  const p = createPerson({ u: 0.9 * u, shirt: 0x8ab0e0 }), breath = many(PUFF(0.9 * u, 0xf0f8ff), 3, 0.7);
  group.add(frost, icicle, drip, p.group, breath);
  const loop = 4.6, mouth = new THREE.Vector3(), ix = B.cx + 0.15 * B.w;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, held = pre ? 0 : Math.min(1, A.u / 2);   // the frost stays once it has formed
      spots.forEach((q, i) => frost.set(i, q.x, q.y, 0.06 * u, between(held, i / N * 0.8, i / N * 0.8 + 0.2), i));
      frost.commit();
      const ice = pre ? 0 : Math.min(1, A.u / 2.5); icicle.visible = ice > 0.02; icicle.position.set(ix, B.minY + 0.02 * u, 0.04 * u); icicle.scale.set(1, Math.max(1e-3, ice), 1);
      for (let i = 0; i < 2; i++) { const f = ((v + i * 1.1) % 2.2) / 0.6; drip.set(i, ix, B.minY - 0.28 * u * ice - 0.3 * u * f * f, 0.04 * u, ice > 0.9 && f < 1 ? 1 : 0); }
      drip.commit();
      p.group.position.set(px + 0.006 * u * tremble(t, 12), floor, 0.06 * u); p.face(-0.4).reset();
      p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.3; p.raise('L', -0.5); p.raise('R', -0.5); p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.5;   // hugging themselves
      p.bone('head').rotation.z = 0.03 * tremble(t, 14); p.update();
      bonePoint(p, 'head', 0.35, mouth);
      for (let i = 0; i < 3; i++) { const f = ((t * 0.7 + i / 3) % 1); breath.set(i, mouth.x - 0.1 * u - 0.25 * u * f, mouth.y + 0.05 * u * f, mouth.z + 0.1 * u, Math.sin(Math.PI * f) * 0.9); }
      breath.commit();
    },
  };
}

function sisterHelp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = createPerson({ u: 1.0 * u, shirt: 0xe05a8a, hair: 0x6a2a1a }), small = createPerson({ u: 0.58 * u, shirt: 0x5ab0e0 });
  const bow = solidProp([[G.torus(0.03 * u, 0.008 * u).scale(1.4, 1, 1).translate(-0.04 * u, 0, 0), 0xffffff], [G.torus(0.03 * u, 0.008 * u).scale(1.4, 1, 1).translate(0.04 * u, 0, 0), 0xffffff]], 0.6);
  group.add(big.group, small.group, bow);
  const loop = 5.4, foot = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { kneel: [0.1, 0.4], tie: [0.5, 1.2], up: [1.8, 0.4], walk: [2.3, 1.5, 'linear'], back: [4.2, 1.0] });
      const kneel = pre ? 0 : T.kneel * (1 - T.up), go = pre ? 0 : 0.6 * u * (T.walk - T.back);
      const sx = B.maxX + 0.75 * u + go, bx = sx - 0.36 * u + 0.15 * u * T.up;
      small.group.position.set(sx, floor, 0.12 * u); small.face(T.up > 0 && T.back === 0 ? 'right' : 'toward').reset().walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0);
      if (T.up > 0) small.raise('L', 0.6); small.update();
      big.group.position.set(bx, floor - 0.2 * u * kneel, 0.05 * u); big.face(T.up > 0 && T.back === 0 ? 'right' : 0.9).reset().walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0);
      big.bone('legL').rotation.x += 1.5 * kneel; big.bone('shinL').rotation.x -= 1.5 * kneel; big.bone('shinR').rotation.x -= 1.8 * kneel; big.lean(0.5 * kneel);
      const tying = T.tie > 0 && T.tie < 1 ? 1 : 0; big.bone('armL').rotation.x = big.bone('armR').rotation.x = (1.3 + 0.2 * Math.sin(v * 12) * tying) * kneel;
      if (T.up > 0) big.raise('R', 0.6 * T.up); big.update();
      bonePoint(small, 'footL', 0.6, foot);
      const b = pre ? 0 : between(v, 1.4, 1.6) * (1 - T.back); bow.visible = b > 0.01; bow.position.set(foot.x, foot.y + 0.04 * u, foot.z + 0.05 * u); bow.scale.setScalar(Math.max(1e-3, b));
    },
  };
}

function littleFollow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = createPerson({ u: 1.0 * u, shirt: 0x3a6ae0 }), small = createPerson({ u: 0.55 * u, shirt: 0xf0c030, hair: 0x6a3a1a });
  group.add(big.group, small.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lead: [0, 1.6, 'linear'], wait: [1.6, 0.4], catch: [1.8, 1.0, 'out'], both: [3.0, 1.4, 'linear'], reset: [4.6, 0.8] });
      const bx = B.maxX + 1.3 * u - 0.5 * u * T.lead - 0.4 * u * T.both + 0.9 * u * T.reset, sx = B.maxX + 1.6 * u - 0.15 * u * T.lead - 0.6 * u * T.catch - 0.4 * u * T.both + 0.9 * u * T.reset;
      const turned = T.wait > 0.5 && T.catch < 1;
      big.group.position.set(bx, floor, 0.0); big.face(turned ? 'right' : 'left').reset().walk(v * 7, (T.lead > 0 && T.lead < 1) || (T.both > 0 && T.both < 1) ? 1 : 0);
      if (turned) big.raise('R', 1.2 * T.wait);
      if (T.both > 0 && T.reset === 0) big.raise('R', 0.5);
      big.update();
      const hurry = (T.lead > 0 && T.lead < 1) || (T.catch > 0 && T.catch < 1);
      small.group.position.set(sx, floor + (hurry ? 0.05 * u * Math.abs(Math.sin(v * 10)) : 0), 0.1 * u); small.face('left').reset().walk(v * 16, hurry || (T.both > 0 && T.both < 1) ? 1 : 0);
      small.raise('L', T.catch > 0.6 ? 1.3 : 0.8 * (hurry ? 1 : 0)); small.update();
    },
  };
}

function lineUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, N = 5, COLORS = [0xe04848, 0xf0a030, 0x50b050, 0x4a8ae0, 0xa060d0];
  const kids = COLORS.map((c) => createPerson({ u: 0.6 * u, shirt: c })), line = solidProp([[G.box(1.5 * u, 0.012 * u, 0.04 * u, 0, 0.006 * u, 0), 0xffffff]], 0.6);
  line.position.set(B.maxX + 0.9 * u, floor, 0.12 * u);
  group.add(line, ...kids.map((k) => k.group));
  const loop = 4.8, slot = (i) => B.maxX + 0.35 * u + i * 0.28 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const bow = bump(v, 2.6, 1.0), scatter = between(v, 4.0, 4.8);
      kids.forEach((k, i) => {
        const from = i % 2 ? slot(i) + 1.6 * u : slot(i) - 0.3 * u, arrive = pre ? 0 : between(v, 0.1 * i, 0.9 + 0.1 * i) * (1 - scatter);
        const x = from + (slot(i) - from) * arrive, z = 0.12 * u + (1 - arrive) * (i % 2 ? 0.4 : -0.3) * u;
        k.group.position.set(x, floor, z); k.face(arrive < 1 ? (i % 2 ? 'left' : 'right') : 'toward').reset().walk(v * 12, arrive > 0 && arrive < 1 ? 1 : 0); k.lean(0.6 * bow); k.update();
        k.group.visible = arrive > 0.05 || pre;
      });
    },
  };
}

function singMic(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u, shirt: 0xe04a8a, hair: 0x2a1a30 }), mic = emblemProp('mic', 0.28 * u), notes = many(NOTE(u), 7, 0.9);
  const stageBox = solidProp([[G.box(0.8 * u, 0.1 * u, 0.4 * u, 0, 0.05 * u, 0), 0x8a3a6a]], 0.3); stageBox.position.set(px, floor, 0);
  p.rig.attach('handR', mic, 0.5); mic.rotation.set(-1.2, 0, 0);
  group.add(stageBox, p.group, notes);
  const loop = 4.8, at = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.group.position.set(px, floor + 0.1 * u, 0.05 * u); p.face(-0.2).reset();
      p.bone('armR').rotation.x = 1.5; p.bone('foreR').rotation.x = 1.3; p.group.rotation.z = 0.08 * Math.sin(v * 2.5);
      const fling = bump(v, 3.4, 1.2); p.raise('L', 0.5 + 2.2 * fling); p.bone('head').rotation.x = -0.2 * fling; p.update();
      mic.idle(0); bonePoint(p, 'head', 0.3, at);
      for (let i = 0; i < 7; i++) { const f = ((v * 0.5 + i / 7) % 1); notes.set(i, at.x - 0.15 * u - 0.6 * u * f, at.y + 0.3 * u * f + 0.08 * u * Math.sin(f * 9 + i), at.z + 0.05 * u, pre ? 0 : Math.sin(Math.PI * f) * 1.2, 0.3 * Math.sin(f * 7)); }
      notes.commit();
    },
  };
}

export const SCENES = { 'rope-pull': ropePull, 'stop-sign': stopSign, 'refuse-spoon': refuseSpoon, 'taste-spoon': tasteSpoon, 'shiver-frost': shiverFrost, 'sister-help': sisterHelp, 'little-follow': littleFollow, 'line-up': lineUp, 'sing-mic': singMic };
