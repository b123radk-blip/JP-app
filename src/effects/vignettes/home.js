// Home and kitchen scenes.
//   box-tumble   物: a box beside the kanji pops its flaps; things tumble out one after another (a ball, a cup, an apple, a
//                shoe) and land in a heap, the last one bonking the kanji; then they hop back in and the flaps shut
//   house-build  家: a wall rises behind the kanji and a roof drops onto it, chimney smoking; a person walks home to the
//                door, goes in, the door shuts and the window lights up warm
//   scrub-wash   洗: mud splats onto the kanji; a hand scrubs it with a sponge, foam builds; a bucket tips water over it
//                and it comes out sparkling
//   tea-pour     茶: tea leaves drop into a teapot, it rattles (brewing), tips and pours a green stream into a cup that
//                fills; steam curls up
//   rice-bowl    飯: rice plops into a bowl in heaps, steam rises; chopsticks dip in, lift a clump away, again, until
//                the bowl is empty
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, ball, burst } from '../pieces/kit-things.js';
import { emblemProp, cardBox, teapot, teacup, disc, bowl, chopsticks, sponge, bucket, apple } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { poseGlyph, wisps, arc, handTo, between } from './helpers.js';
import { teaServe } from './variants.js';

function boxTumble(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const box = cardBox(u, { w: 0.7, h: 0.5 }), bx = B.maxX + 0.62 * u; box.position.set(bx, floor, 0);
  const items = [ball(u, { r: 0.11, stripe: 0xffffff }), teacup(1.6 * u), apple(u, { r: 0.13 }), emblemProp('shoe', 0.34 * u)];
  items[2].body.material.color.setHex(0xe83030);
  const lands = [[bx - 0.5 * u, 0.11], [bx - 0.75 * u, 0], [bx - 0.3 * u, 0.13], [B.maxX + 0.1 * u, 0.1]];   // x, height of its middle
  group.add(box, ...items);
  const loop = 4.6, LAUNCH = [0.35, 0.75, 1.15, 1.6];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      box.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.2, 0.4, 'back'] }).a));
      const T = timeline(v, { open: [0, 0.35, 'back'], home: [3.2, 0.9], shut: [4.15, 0.3] });
      const open = pre ? 0 : T.open * (1 - T.shut);
      box.flaps[0].rotation.z = 2.2 * open; box.flaps[1].rotation.z = -2.2 * open;
      const top = [bx, floor + 0.55 * u];
      items.forEach((it, i) => {
        const f = pre ? 0 : between(v, LAUNCH[i], LAUNCH[i] + 0.55) * (1 - T.home), out = f > 0;
        const [x, y] = arc(top, [lands[i][0], floor + lands[i][1] * u], 0.7 * u, f);
        it.visible = out; it.position.set(x, y + 0.03 * u * bump(v, LAUNCH[i] + 0.55, 0.25), 0.05 * u * (i % 2));
        it.rotation.z = f * (i % 2 ? 6 : -5);
      });
      items[3].idle(0);
      const bonk = pre ? 0 : wobble(v, LAUNCH[3] + 0.55, 0.8, 4);                    // the shoe bonks the kanji
      poseGlyph(stage, 0, 0, 0.06 * bonk, B.minX, B.minY);
    },
  };
}

function houseBuild(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, W = 1.55 * u, H = 1.08 * u, zw = -0.16 * u;
  const wall = solidProp([[G.box(W, H, 0.04 * u, 0, H / 2, 0), 0xf0e2c8], [G.box(W + 0.04 * u, 0.05 * u, 0.06 * u, 0, 0.025 * u, 0.01 * u), 0x8a6a50]]);
  wall.position.set(B.cx, floor, zw);
  const xd = B.cx + 0.58 * u, door = new THREE.Group(), doorM = solidProp([[G.box(0.24 * u, 0.42 * u, 0.02 * u, 0.12 * u, 0.21 * u, 0), 0x8a4a2a], [G.sphere(0.015 * u, 0.2 * u, 0.2 * u, 0.015 * u), 0xffd040]]);
  door.position.set(xd - 0.12 * u, floor, zw + 0.03 * u); door.add(doorM);
  const win = solidProp([[G.box(0.26 * u, 0.22 * u, 0.02 * u, 0, 0, 0), 0xffffff], [G.box(0.3 * u, 0.025 * u, 0.03 * u, 0, 0, 0.005 * u), 0x8a6a50], [G.box(0.025 * u, 0.26 * u, 0.03 * u, 0, 0, 0.005 * u), 0x8a6a50]], 0.9);
  win.position.set(B.cx - 0.55 * u, floor + 0.62 * u, zw + 0.03 * u);
  const tri = new THREE.Shape(); tri.moveTo(-1, 0); tri.lineTo(1, 0); tri.lineTo(0, 0.55); tri.lineTo(-1, 0);
  const roof = solidProp([[G.extrude(tri, 0.4).scale(0.95 * u, 0.95 * u, 0.6 * u), 0xc83a2a], [G.box(0.14 * u, 0.3 * u, 0.12 * u, 0.5 * u, 0.3 * u, -0.05 * u), 0x8a4a3a]]);
  const smoke = many(PUFF(1.4 * u, 0xe8e8f0), 5, 0.6), p = createPerson({ u: 0.75 * u, shirt: 0x40a0a0 });
  group.add(wall, door, win, roof, smoke, p.group);
  const loop = 4.6, top = floor + H;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const I = timeline(A.setup, { wall: [0.05, 0.45, 'out'], roof: [0.55, 0.4, 'bounce'] });
      wall.scale.set(1, Math.max(1e-3, I.wall), 1); win.visible = door.visible = I.wall > 0.95;
      roof.position.set(B.cx, top + (1 - I.roof) * 1.2 * u, zw); roof.visible = I.roof > 0.01;
      const T = timeline(v, { walk: [0, 1.6, 'linear'], open: [1.5, 0.3], inside: [1.8, 0.5, 'linear'], shut: [2.3, 0.3], light: [2.6, 0.3], dim: [4.1, 0.4] });
      door.rotation.y = -1.3 * (T.open - T.shut);
      const lit = pre ? 0 : T.light - T.dim;
      win.material.color.setRGB(0.55 + 0.45 * lit, 0.6 + 0.35 * lit, 0.75 - 0.35 * lit); win.material.userData.glow.value = 0.2 + 0.9 * lit;
      // the person walks home along the front, turns into the door and goes in (hidden once past the wall)
      const x = pre ? B.maxX + 1.4 * u : xd + (1 - T.walk) * 0.9 * u, z = pre ? 0.1 * u : 0.1 * u - (zw + 0.02 * u - 0.1 * u) * -T.inside;
      p.group.position.set(x, floor, z); p.group.visible = !pre && v < 2.35 && A.setup >= 1;
      p.face(T.walk < 1 ? 'left' : 'away').reset().walk(v * 8, T.walk < 1 || T.inside < 1 ? 1 : 0).update();
      wisps(smoke, 0, 5, B.cx + 0.5 * u, top + 0.35 * u, t, u, { period: 2.2, rise: 0.8, on: I.roof > 0.99 ? 1 : 0 });
      smoke.commit();
    },
  };
}

function scrubWash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), N = 9;
  const pts = Array.from({ length: N }, (_, i) => { const s = ctx.strokes[(i * 3) % ctx.strokes.length]; return s.pts[Math.floor(s.pts.length * ((0.3 + 0.37 * i) % 1))]; });
  const mud = many([[G.sphere(0.1 * u, 0, 0, 0, 1, 0.75, 0.3), 0x5a3418]], N, 0.2), foam = many([[G.sphere(0.05 * u), 0xffffff]], 16, 0.7), water = many([[G.sphere(0.035 * u, 0, 0, 0, 0.8, 1.6, 0.8), 0x6ac8ff]], 24, 0.8);
  const hand = createHand({ u: 0.75 * u, sleeve: 0xe07a40, side: -1 }); hand.pose('grip'); const sp = sponge(0.8 * u); sp.rotation.z = 0.2; hand.grip.add(sp);
  hand.group.rotation.z = 0.75;
  const pail = bucket(1.5 * u), shine = burst(u, { s: 0.35, color: 0xffffff });
  group.add(mud, foam, water, hand.group, pail, shine);
  const loop = 5.0, z = 0.07 * u, path = (f) => [B.cx + 0.42 * B.w * Math.sin(f * Math.PI * 5), B.maxY - 0.15 * u - (B.h - 0.3 * u) * f];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { splat: [0, 0.4, 'back'], scrub: [0.7, 1.9, 'linear'], tip: [2.8, 0.4], pour: [3.0, 0.9, 'linear'], away: [3.9, 0.4] });
      const sf = T.scrub, [px, py] = path(sf);
      pts.forEach((q, i) => {                                                     // each splat shrinks once the sponge passes it
        const passed = sf >= 1 || (sf > 0 && py <= q.y && Math.abs(px - q.x) < 0.7 * u) ? between(v, 0.7 + 1.9 * Math.min(1, (B.maxY - q.y) / B.h), 1.1 + 1.9 * Math.min(1, (B.maxY - q.y) / B.h)) : 0;
        mud.set(i, q.x, q.y, z, pre ? 0 : T.splat * (1 - passed) * (0.8 + 0.3 * (i % 3)), i);
      });
      mud.commit();
      for (let i = 0; i < 16; i++) { const f = Math.max(0, sf - i / 16 * 0.9); const [fx, fy] = path(Math.min(sf, i / 16)); foam.set(i, fx + 0.03 * u * Math.sin(i * 3), fy + 0.03 * u * Math.cos(i * 5), z * 1.4, pre || sf <= i / 16 ? 0 : (1 - T.pour) * (0.7 + 0.5 * Math.min(1, f * 4))); }
      foam.commit();
      const show = !pre && v > 0.5 && v < 2.8, enter = pre ? 0 : between(v, 0.5, 0.75) * (1 - between(v, 2.6, 2.85));
      hand.group.visible = show; handTo(hand, px + (1 - enter) * 0.8 * u, py, z * 1.8);
      // the bucket tips over the kanji, water pours down and washes the foam away
      pail.visible = !pre && v > 2.6 && v < 4.4; pail.position.set(B.cx + 0.35 * u, B.maxY + 0.45 * u + (1 - between(v, 2.6, 2.85)) * 0.4 * u + T.away * 0.6 * u, 0.06 * u); pail.rotation.z = 2.0 * T.tip;
      for (let i = 0; i < 24; i++) { const f = ((v - 3.0) * 1.6 + i / 24) % 1; water.set(i, B.cx + 0.1 * u - 0.3 * u + (i % 8) * 0.08 * u, B.maxY + 0.3 * u - 1.3 * u * f, 0.08 * u, v > 3.0 && v < 3.9 ? 1 : 0); }
      water.commit();
      const sh = pre ? 0 : bump(v, 3.9, 0.7); shine.visible = sh > 0; shine.scale.setScalar(Math.max(1e-3, sh)); shine.position.set(B.cx + 0.2 * u, B.cy + 0.2 * u, 0.1 * u); shine.rotation.z = v;
    },
  };
}

function teaPour(ctx, spec, stage) {
  if (spec.outcome === 'serve') return teaServe(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const S = 1.6, pot = teapot(S * u), cup = teacup(S * u), fill = disc(S * u, 0.085, 0x8ab84a), stream = many([[G.sphere(0.03 * u), 0x9ac85a]], 14, 0.7), steam = many(PUFF(1.5 * u, 0xf4f4f8), 5, 0.6), leaves = many([[G.sphere(0.045 * u, 0, 0, 0, 1.6, 0.4, 1), 0x4aa040]], 5, 0.5);
  const cx = B.maxX + 0.36 * u, pp = [B.maxX + 1.0 * u, floor + 0.55 * u];
  cup.position.set(cx, floor, 0.04 * u); cup.rotation.x = 0.4; pot.position.set(...pp, 0);
  cup.add(fill); group.add(pot, cup, stream, steam, leaves);
  const loop = 4.8, spout = () => { const a = pot.rotation.z, x = -0.3 * S * u, y = 0.26 * S * u; return [pp[0] + x * Math.cos(a) - y * Math.sin(a), pp[1] + x * Math.sin(a) + y * Math.cos(a)]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const I = timeline(A.setup, { pot: [0.3, 0.4, 'back'], cup: [0.5, 0.4, 'back'] });
      pot.scale.setScalar(Math.max(1e-3, I.pot)); cup.scale.setScalar(Math.max(1e-3, I.cup));
      const T = timeline(v, { tip: [0.9, 0.45], back: [2.6, 0.45], drink: [3.9, 0.7] });
      pot.rotation.z = 0.95 * (T.tip - T.back) + (v > 0 && v < 0.8 ? 0.05 * Math.sin(v * 40) : 0);   // rattles (brewing), then pours
      for (let i = 0; i < 5; i++) { const f = pre ? 0 : between(v, i * 0.1, i * 0.1 + 0.6); const [x, y] = arc([B.cx + (i - 2) * 0.06 * u, B.maxY], [pp[0], pp[1] + 0.45 * u], 0.4 * u, f); leaves.set(i, x, y, 0.02 * u, f > 0 && f < 1 ? 1 : 0, f * 8); }
      leaves.commit();
      const pouring = !pre && v > 1.2 && v < 2.7, [sx, sy] = spout(), top = [cx, floor + 0.12 * S * u];
      for (let i = 0; i < 14; i++) { const f = ((v * 2.2 + i / 14) % 1); const [x, y] = arc([sx, sy], top, 0.05 * u, f); stream.set(i, x, y, 0.04 * u, pouring ? 1 : 0); }
      stream.commit();
      const level = pre ? 0 : between(v, 1.3, 2.6) * (1 - T.drink);
      // the tea spreads over the top as it fills
      fill.position.set(0, 0.136 * S * u, 0); fill.scale.set(0.15 + 0.95 * level, 1, 0.15 + 0.95 * level); fill.visible = level > 0.02;
      wisps(steam, 0, 5, cx, floor + 0.16 * S * u, t, u, { period: 1.8, rise: 0.7, on: level > 0.3 ? 1 : 0 });
      steam.commit();
    },
  };
}

function riceBowl(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const S = 1.7, bw = bowl(S * u), mound = solidProp([[G.sphere(0.19 * S * u, 0, 0, 0, 1, 0.55, 1), 0xfbfbf4]], 0.5), plop = solidProp([[G.sphere(0.08 * S * u), 0xfbfbf4]], 0.5);
  const sticks = chopsticks(S * u), clump = solidProp([[G.sphere(0.045 * S * u), 0xfbfbf4]], 0.5), steam = many(PUFF(1.5 * u, 0xf4f4f8), 5, 0.6);
  const bx = B.maxX + 0.5 * u; bw.position.set(bx, floor, 0.03 * u);
  group.add(bw, mound, plop, sticks, clump, steam);
  const loop = 5.0, PLOPS = [0, 0.45, 0.9], BITES = [1.8, 3.0];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      bw.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      // three plops heap the rice up; two bites take it down
      const heaped = pre ? 0 : PLOPS.filter((p) => v >= p + 0.35).length / 3, eaten = pre ? 0 : BITES.reduce((s, b) => s + between(v, b + 0.3, b + 0.5), 0) / 2.5;
      const amount = Math.max(0, heaped - eaten - between(v, 4.3, 4.7) * 0.2);
      mound.visible = amount > 0.02; mound.scale.set(0.5 + 0.5 * amount, Math.max(1e-3, amount), 0.5 + 0.5 * amount); mound.position.set(bx, floor + 0.13 * S * u, 0.03 * u);
      const pi = PLOPS.findIndex((p) => v >= p && v < p + 0.35), pf = pi < 0 ? 0 : (v - PLOPS[pi]) / 0.35;
      plop.visible = !pre && pi >= 0; plop.position.set(bx, floor + 0.2 * S * u + (1 - pf * pf) * 0.8 * u, 0.03 * u); plop.scale.set(1 + 0.3 * pf, 1 - 0.3 * pf, 1);
      // chopsticks dip in, pinch a clump and lift it up out of the scene
      const bi = BITES.findIndex((b) => v >= b && v < b + 1.0), bf = bi < 0 ? 0 : v - BITES[bi];
      const dip = bi < 0 ? 0 : between(bf, 0, 0.3) - between(bf, 0.45, 1.0), y = floor + 0.15 * S * u + (1 - dip) * 0.7 * u;
      sticks.visible = bi >= 0; sticks.position.set(bx + 0.06 * u, y, 0.06 * u); sticks.rotation.z = 0.35;
      clump.visible = bi >= 0 && bf > 0.35; clump.position.set(bx, y - 0.01 * u, 0.06 * u);
      wisps(steam, 0, 5, bx, floor + 0.25 * S * u, t, u, { period: 1.8, rise: 0.5, on: amount > 0.3 ? 1 : 0 });
      steam.commit();
    },
  };
}

export const SCENES = { 'box-tumble': boxTumble, 'house-build': houseBuild, 'scrub-wash': scrubWash, 'tea-pour': teaPour, 'rice-bowl': riceBowl };
