// Batch 5 kanji, part 1.
//   flower-gasp    美: a bud opens into a big pink flower, sparkles circle it; a person gasps, hands on their cheeks
//   podium-win     最: three runners race up to a podium; the winner stands on the top step and lifts a gold trophy
//   face-change    面: a big round face beside the kanji smiles, goes wide-eyed with an O mouth, then winks
//   apple-sell     売: a seller behind a crate of apples holds one up; a buyer pays a coin and gets the apple
//   race-start     始: two runners crouch at the start line; the flag drops and they dash off in a puff of dust
//   curtain-close  終: on a little stage an actor bows; the red curtains slide shut and "おわり" appears on them
//   move-in        住: a person carries a box into a little house; its window lights up and the chimney puffs smoke
import * as THREE from 'three';
import { crabShell, curtainOpen, laugh, soldStamp, yum } from './variants5a.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, stars, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, puffs, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function flowerGasp(ctx, spec, stage) {
  if (spec.outcome === 'yum') return yum(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.3 * u, fy = floor + 0.62 * u, N = 8;
  const stem = solidProp([[G.cyl(0.015 * u, 0.015 * u, fy - floor, 0, (fy - floor) / 2, 0), 0x3a9a3a], [G.sphere(0.06 * u, 0.06 * u, 0.25 * u, 0, 1.4, 0.5, 0.5), 0x3a9a3a], [G.sphere(0.06 * u, -0.06 * u, 0.35 * u, 0, 1.4, 0.5, 0.5), 0x3a9a3a]], 0.4);
  stem.position.set(fx, floor, 0);
  const petals = many([[G.sphere(0.07 * u, 0, 0.09 * u, 0, 0.75, 1.3, 0.35), 0xffffff]], N, 0.6), center = solidProp([[G.sphere(0.06 * u, 0, 0, 0, 1, 1, 0.6), 0xffd030]], 0.6);
  for (let i = 0; i < N; i++) petals.setColorAt(i, new THREE.Color(i % 2 ? 0xff6aa0 : 0xff8ac0));
  const shine = stars(u, { r: 0.3, s: 0.08, n: 5, color: 0xfff0a0 }), p = createPerson({ u: 0.85 * u, shirt: 0x40a0e0 });
  group.add(stem, petals, center, shine, p.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.3, 1.0, 'back'], close: [4.3, 0.6] }), f = pre ? 0.15 : Math.max(0.15, T.open - T.close);
      for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; petals.set(i, fx, fy, 0.02 * u, 0.5 + 0.6 * f, a * f + (1 - f) * (i % 2 ? 0.15 : -0.15)); }
      petals.commit(); center.position.set(fx, fy, 0.04 * u); center.scale.setScalar(pop(f));
      const s = pre ? 0 : bump(v, 1.2, 3.0); shine.visible = s > 0; shine.scale.setScalar(pop(Math.min(1, s * 2))); shine.position.set(fx, fy, 0); shine.rotation.x = Math.PI / 2; shine.rotation.y = t;
      const gasp = pre ? 0 : timeline(v, { g: [1.3, 0.3, 'back'] }).g * (1 - between(v, 3.8, 4.3));
      p.reset().face(-0.7); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 0.9 * gasp; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 2.0 * gasp; p.bone('armL').rotation.z = -0.4 * gasp; p.bone('armR').rotation.z = 0.4 * gasp; p.bone('head').rotation.x = -0.25 * gasp;
      p.group.position.set(fx + 0.5 * u, floor + 0.04 * u * bump(v, 1.4, 0.3), 0.15 * u); p.update();
    },
  };
}

function podiumWin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.55 * u, BW = 0.24 * u, H = [0.18, 0.3, 0.1];
  const podium = solidProp([[G.box(BW, H[0] * u, 0.24 * u, -BW, H[0] * u / 2, 0), 0xc8ccd4], [G.box(BW, H[1] * u, 0.24 * u, 0, H[1] * u / 2, 0), 0xf0c030], [G.box(BW, H[2] * u, 0.24 * u, BW, H[2] * u / 2, 0), 0xc87a40]], 0.4);
  podium.position.set(px, floor, 0);
  const R = [createPerson({ u: 0.55 * u, shirt: 0xe04848 }), createPerson({ u: 0.55 * u, shirt: 0x40a0e0 }), createPerson({ u: 0.55 * u, shirt: 0x60c060 })], cup = emblemProp('trophy', 0.25 * u, { color: 0xffd040 });
  group.add(podium, ...R.map((r) => r.group), cup);
  const loop = 5.4, spots = [[px, H[1]], [px - BW, H[0]], [px + BW, H[2]]], hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.8, 5.3);
      R.forEach((r, i) => {
        const run = pre ? 1 : between(v, 0.1 + 0.2 * i, 1.0 + 0.2 * i), hop = pre ? 1 : between(v, 1.2 + 0.2 * i, 1.6 + 0.2 * i), [sx, sh] = spots[i];
        const x = hop > 0 ? arc([sx + 0.25 * u, 0], [sx, sh * u], 0.2 * u, hop)[0] : lerp(px + 1.0 * u + 0.2 * u * i, sx + 0.25 * u, run), y = hop > 0 ? arc([sx + 0.25 * u, 0], [sx, sh * u], 0.2 * u, hop)[1] : 0;
        const win = i === 0 && hop >= 1 ? timeline(v, { w: [2.0, 0.4, 'back'] }).w : 0;
        r.reset().face(hop >= 1 ? 0 : 'left').walk(v * 11, run > 0 && run < 1 ? 1 : 0); r.raise('R', 2.8 * win); r.raise('L', i > 0 && hop >= 1 ? 0.6 * bump(v, 2.2, 1.0) : 0);
        r.group.position.set(x, floor + y + (win > 0 ? 0.03 * u * Math.abs(Math.sin(v * 6)) : 0), 0.04 * u); r.group.scale.setScalar(pop(1 - out)); r.update();
        if (i === 0) bonePoint(r, 'handR', 0.8, hand);
      });
      const c = pre ? 1 : timeline(v, { c: [2.0, 0.4, 'back'] }).c * (1 - out); cup.visible = c > 0.01; cup.scale.setScalar(pop(0.25 * u * c)); cup.position.set(hand.x, hand.y + 0.1 * u, hand.z + 0.02 * u); cup.idle(t);
    },
  };
}

function faceChange(ctx, spec, stage) {
  if (spec.outcome === 'laugh') return laugh(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.42 * u, cy = B.cy, R = 0.3 * u;
  const face = solidProp([[G.sphere(R, 0, 0, 0, 1, 1, 0.35), 0xffd84a]], 0.5); face.position.set(cx, cy, 0);
  const eyes = many([[G.sphere(0.035 * u, 0, 0, 0, 1, 1.4, 0.5), 0x1a1a24]], 2, 0.2), cheeks = many([[G.sphere(0.04 * u, 0, 0, 0, 1.3, 0.8, 0.3), 0xff8aa0]], 2, 0.5);
  const smile = solidProp([[G.torus(0.13 * u, 0.018 * u, Math.PI, 0, 0, 0, Math.PI), 0x8a2a1a]], 0.4), ooh = solidProp([[G.torus(0.05 * u, 0.018 * u), 0x8a2a1a], [G.cyl(0.045 * u, 0.045 * u, 0.01 * u, 0, 0, -0.005 * u, Math.PI / 2), 0x5a1a10]], 0.4);
  const twinkle = stars(u, { r: 0.0, s: 0.09, n: 1, color: 0xffffff });
  group.add(face, eyes, cheeks, smile, ooh, twinkle);
  const loop = 5.4, Z = 0.11 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, wow = pre ? 0 : bump(v, 1.4, 1.5), wink = pre ? 0 : bump(v, 3.1, 1.4), jump = 0.05 * u * bump(v, 1.4, 0.4);
      face.position.y = cy + jump; face.rotation.z = 0.15 * wink;
      const eyeK = 1 + 0.6 * wow, blink = !pre && (v % 2.3) < 0.08 ? 0.15 : 1;
      eyes.set(0, cx - 0.1 * u, cy + 0.07 * u + jump, Z, eyeK * blink); eyes.set(1, cx + 0.1 * u, cy + 0.07 * u + jump, Z, wink > 0.4 ? 0.0 : eyeK * blink); eyes.commit();
      cheeks.set(0, cx - 0.17 * u, cy - 0.04 * u + jump, Z - 0.01 * u, 1 + wink * 0.4); cheeks.set(1, cx + 0.17 * u, cy - 0.04 * u + jump, Z - 0.01 * u, 1 + wink * 0.4); cheeks.commit();
      smile.visible = wow < 0.3; smile.position.set(cx, cy - 0.02 * u + jump, Z); smile.scale.set(1 + 0.3 * wink, 1 + 0.3 * wink, 1);
      ooh.visible = wow >= 0.3; ooh.position.set(cx, cy - 0.1 * u + jump, Z); ooh.scale.setScalar(pop(0.6 + 0.6 * wow));
      twinkle.visible = wink > 0.4; twinkle.position.set(cx + 0.22 * u, cy + 0.18 * u, Z); twinkle.rotation.z = t * 3; twinkle.rotation.x = Math.PI / 2;
    },
  };
}

function appleSell(ctx, spec, stage) {
  if (spec.outcome === 'sold') return soldStamp(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.4 * u, CH = 0.24 * u;
  const crate = solidProp([[G.box(0.42 * u, CH, 0.26 * u, 0, CH / 2, 0), 0xc89a60], ...[0.06, 0.14].map((y) => [G.box(0.43 * u, 0.02 * u, 0.265 * u, 0, y * u, 0), 0x8a5a30])], 0.35);
  crate.position.set(cx, floor, 0.05 * u);
  const N = 6, apples = many([[G.sphere(0.055 * u), 0xe02830], [G.cyl(0.006 * u, 0.006 * u, 0.03 * u, 0, 0.06 * u, 0), 0x5a3a1a]], N, 0.5), held = solidProp([[G.sphere(0.06 * u), 0xe02830], [G.sphere(0.03 * u, 0.02 * u, 0.065 * u, 0, 1.4, 0.4, 0.7), 0x40a040]], 0.6);
  const seller = createPerson({ u: 0.85 * u, shirt: 0xf0a030 }), buyer = createPerson({ u: 0.8 * u, shirt: 0x40a0e0 }), coin = solidProp([[G.cyl(0.035 * u, 0.035 * u, 0.008 * u, 0, 0, 0, Math.PI / 2), 0xffc830]], 0.7), tag = emblemProp('yen', 0.22 * u);
  tag.position.set(cx - 0.2 * u, floor + CH + 0.2 * u, 0.15 * u);
  group.add(crate, apples, held, seller.group, buyer.group, coin, tag);
  const loop = 5.6, hs = new THREE.Vector3(), hb = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0.6, 0.9], pay: [1.6, 0.4], give: [2.1, 0.5], go: [3.0, 1.2], out: [4.3, 0.3], back: [4.9, 0.4] });
      for (let i = 0; i < N; i++) apples.set(i, cx + ((i % 3) - 1) * 0.12 * u, floor + CH + 0.03 * u + (i > 2 ? 0.0 : 0.0), 0.05 * u + (i > 2 ? -0.06 : 0.06) * u, 1);
      apples.commit();
      const wave = pre ? 0 : 1 - T.give, call = Math.sin(v * 8) * 0.25;
      seller.reset().face(0.4); seller.raise('R', (2.4 + call) * wave + 1.0 * bump(v, 2.0, 0.8)); seller.group.position.set(cx + 0.05 * u, floor, -0.22 * u); seller.update(); bonePoint(seller, 'handR', 0.7, hs);
      const walking = (T.in > 0 && T.in < 1) || (T.go > 0 && T.go < 1);
      buyer.reset().face(T.go > 0 ? 'right' : walking ? 'left' : -2.0).walk(v * 9, walking ? 1 : 0); buyer.bone('armL').rotation.x = 1.2 * bump(v, 1.5, 1.2);
      buyer.group.position.set(cx + 0.95 * u - 0.45 * u * T.in + 0.6 * u * T.go, floor, 0.3 * u); buyer.group.scale.setScalar(pop(pre ? 1 : 1 - T.out)); buyer.group.visible = pre || (v > 0.6 && T.out < 1); buyer.update(); bonePoint(buyer, 'handL', 0.7, hb);
      coin.visible = !pre && T.pay > 0 && T.pay < 1; coin.position.copy(hb).lerp(hs, T.pay); coin.rotation.y = v * 8;
      if (T.back > 0) { held.visible = true; held.position.copy(hs); held.scale.setScalar(pop(T.back)); }
      else { held.visible = pre || T.out < 1; held.position.copy(hs).lerp(hb, T.give); held.scale.setScalar(1); }
      held.position.z += 0.05 * u;
      tag.idle(t);
    },
  };
}

function raceStart(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u;
  const track = solidProp([[G.box(1.4 * u, 0.02 * u, 0.5 * u, 0.55 * u, 0.01 * u, 0), 0xc0583a], [G.box(0.03 * u, 0.022 * u, 0.5 * u, 0.12 * u, 0.012 * u, 0), 0xffffff], [G.box(1.4 * u, 0.022 * u, 0.012 * u, 0.55 * u, 0.012 * u, 0), 0xffffff]], 0.3);
  track.position.set(sx, floor, 0);
  const flag = new THREE.Group(), flagM = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.4 * u, 0, 0.2 * u, 0), 0xc8ccd4], [G.box(0.16 * u, 0.11 * u, 0.006 * u, 0.08 * u, 0.36 * u, 0), 0xe02020]], 0.5); flag.add(flagM); flag.position.set(sx + 0.75 * u, floor + 0.3 * u, -0.25 * u);
  const runners = [createPerson({ u: 0.6 * u, shirt: 0xe04848 }), createPerson({ u: 0.6 * u, shirt: 0x40a0e0 })], dust = many(PUFF(u), 8, 0.4);
  group.add(track, flag, ...runners.map((r) => r.group), dust);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { drop: [1.0, 0.2, 'in'], run: [1.2, 1.4, 'in'], up: [4.0, 0.3], back: [4.3, 0.4] });
      flag.rotation.z = 0.2 - 1.6 * (T.drop - T.up);
      runners.forEach((r, i) => {
        const crouch = 1 - between(v, 1.1, 1.35), x = sx + 0.06 * u + 1.0 * u * T.run, k = T.run >= 1 ? T.back : T.run > 0.9 ? 1 - (T.run - 0.9) * 10 : 1;
        r.reset().face('right'); if (T.run === 0) { r.lean(0.9 * crouch); r.bone('legL').rotation.x += -0.5 * crouch; r.bone('shinL').rotation.x = -1.2 * crouch; r.bone('armL').rotation.x = r.bone('armR').rotation.x = 1.4 * crouch; } else r.walk(v * 16, 1.3).lean(0.3);
        r.group.position.set(T.run > 0 && T.run < 1 ? x : sx + 0.06 * u, floor, (i ? -0.12 : 0.12) * u); r.group.scale.setScalar(pop(pre ? 1 : k)); r.update();
      });
      puffs(dust, 0, 8, sx + 0.06 * u, floor, between(v, 1.2, 1.9), u, 0.4); dust.commit();
    },
  };
}

function curtainClose(ctx, spec, stage) {
  if (spec.outcome === 'open') return curtainOpen(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u, W = 0.9 * u, H = 0.8 * u;
  const stageBox = solidProp([[G.box(W, 0.12 * u, 0.4 * u, 0, 0.06 * u, 0), 0x8a5a30], [G.box(W, H, 0.02 * u, 0, 0.12 * u + H / 2, -0.2 * u), 0x1a1028], [G.box(W + 0.12 * u, 0.1 * u, 0.06 * u, 0, 0.12 * u + H, 0.17 * u), 0xc02030], [G.box(0.06 * u, H, 0.06 * u, -W / 2 - 0.03 * u, 0.12 * u + H / 2, 0.17 * u), 0xc02030], [G.box(0.06 * u, H, 0.06 * u, W / 2 + 0.03 * u, 0.12 * u + H / 2, 0.17 * u), 0xc02030]], 0.35);
  stageBox.position.set(sx, floor, -0.1 * u);
  const curtain = () => solidProp([[G.box(1, H - 0.02 * u, 0.02 * u, 0.5, 0.12 * u + H / 2, 0), 0xd02838], ...[0.2, 0.45, 0.7].map((x) => [G.box(0.03, H - 0.02 * u, 0.025 * u, x, 0.12 * u + H / 2, 0.002 * u), 0xa01828])], 0.45);
  const cL = curtain(), cR = curtain(); cR.rotation.y = Math.PI;
  const spot = solidProp([[G.cyl(0.18 * u, 0.18 * u, 0.004 * u, 0, 0, 0, 0, 0, 0, 24), 0xfff4c0]], 1.0), actor = createPerson({ u: 0.55 * u, shirt: 0x9a60d0 }), end = textPlane('おわり', { h: 0.16 * u, color: '#ffe060', bg: null });
  group.add(stageBox, spot, actor.group, cL, cR, end);
  const loop = 5.4, top = floor + 0.12 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { bow: [0.4, 0.5], up: [1.2, 0.4], close: [1.8, 1.0, 'out'], open: [4.5, 0.7, 'in'] }), c = pre ? 0 : T.close - T.open;
      const half = W / 2, w = lerp(0.12 * u, half, c);
      cL.position.set(sx - half, floor, 0.1 * u); cL.scale.x = w; cR.position.set(sx + half, floor, 0.1 * u); cR.scale.x = w;
      actor.reset().face(0); actor.lean(0.9 * (T.bow - T.up)); actor.raise('L', 1.2 * bump(v, 0.0, 0.5)); actor.raise('R', 1.2 * bump(v, 0.0, 0.5)); actor.group.position.set(sx, top, 0.0); actor.update();
      spot.position.set(sx, top + 0.002 * u, 0.0); spot.scale.setScalar(pop(1 - c));
      const e = pre ? 0 : bump(v, 2.6, 2.0); end.visible = e > 0; end.scale.setScalar(pop(Math.min(1, e * 2))); end.position.set(sx, floor + 0.6 * u, 0.13 * u);
    },
  };
}

function moveIn(ctx, spec, stage) {
  if (spec.outcome === 'crab') return crabShell(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.55 * u, W = 0.55 * u, H = 0.42 * u;
  const tri = new THREE.Shape(); tri.moveTo(-3.4, 0); tri.lineTo(3.4, 0); tri.lineTo(0, 2.2); tri.lineTo(-3.4, 0); const k = (W + 0.1 * u) / 6.8;
  const house = solidProp([[G.box(W, H, 0.4 * u, 0, H / 2, 0), 0xf0dcc0], [G.extrude(tri, 4.4).scale(k, k, k).translate(0, H, 0), 0x3a7ad0], [G.box(0.06 * u, 0.18 * u, 0.06 * u, 0.15 * u, H + 0.16 * u, -0.05 * u), 0x8a5a30], [G.box(0.13 * u, 0.24 * u, 0.01 * u, -0.12 * u, 0.12 * u, 0.201 * u), 0x8a5a30]], 0.35);
  house.position.set(hx, floor, -0.1 * u);
  const win = solidProp([[G.box(0.14 * u, 0.12 * u, 0.01 * u, 0, 0, 0), 0xffffff], [G.box(0.15 * u, 0.012 * u, 0.012 * u, 0, 0, 0.004 * u), 0x8a5a30], [G.box(0.012 * u, 0.13 * u, 0.012 * u, 0, 0, 0.004 * u), 0x8a5a30]], 0.6);
  win.position.set(hx + 0.12 * u, floor + 0.27 * u, 0.105 * u);
  const smoke = many(PUFF(u, 0xe0e0e8), 6, 0.5), p = createPerson({ u: 0.6 * u, shirt: 0x60b060 }), box = solidProp([[G.box(0.16 * u, 0.13 * u, 0.12 * u, 0, 0, 0), 0xc89a60], [G.box(0.161 * u, 0.02 * u, 0.121 * u, 0, 0.03 * u, 0), 0xe0c890]], 0.4);
  group.add(house, win, smoke, p.group, box);
  const loop = 5.6, dark = new THREE.Color(0x3a4458), lit = new THREE.Color(0xffd870), hl = new THREE.Vector3(), hr = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0.2, 1.4], light: [1.9, 0.3], dark: [4.8, 0.4] }), on = pre ? 0 : T.light - T.dark;
      const door = hx - 0.12 * u, inside = T.walk >= 1;
      p.reset().face(T.walk > 0.85 ? Math.PI : 'left').walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.3; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 0.5;
      p.group.position.set(lerp(hx + 0.75 * u, door, Math.min(1, T.walk * 1.15)), floor, lerp(0.25 * u, 0.12 * u, T.walk)); p.group.visible = !pre && !inside; p.update();
      bonePoint(p, 'handL', 0.6, hl); bonePoint(p, 'handR', 0.6, hr); box.visible = p.group.visible; box.position.set((hl.x + hr.x) / 2, (hl.y + hr.y) / 2 + 0.05 * u, Math.max(hl.z, hr.z) + 0.05 * u);
      win.material.color.copy(dark).lerp(lit, on);
      wisps(smoke, 0, 6, hx + 0.15 * u, floor + H + 0.27 * u, t, u, { period: 2.0, rise: 0.45, size: 1.0, on: on }); smoke.commit();
    },
  };
}

export const SCENES = { 'flower-gasp': flowerGasp, 'podium-win': podiumWin, 'face-change': faceChange, 'apple-sell': appleSell, 'race-start': raceStart, 'curtain-close': curtainClose, 'move-in': moveIn };
