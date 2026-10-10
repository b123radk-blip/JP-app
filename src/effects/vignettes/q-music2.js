// Model scenes, home and change (Step 3a model pass, batch 4).
//   q-dinner-table 夕飯: a mum and her boy sit at a low table under a window where the sun is setting; dishes pop onto
//                  the table; the boy puts his hands together: いただきます, and eats from his bowl; time night (晩御飯):
//                  the window shows the moon and stars, a lamp glows over the table and there are dumplings
//   q-soot-puff    黒: a chimney coughs a big black cloud over a man; he comes out black all over, only his eyes blinking
//                  (まっくろ!); he shakes it off and is clean again
//   q-frog-prince  変: a frog hops in; POOF, it is a prince in a kimono with a crown, who waves: へんしん!; POOF, a frog
//                  again; the kanji wobbles at each change
//   q-back-to-back 背: two children stand back to back at a height chart; a bar comes down on the taller one's head and
//                  the shorter one goes up on tiptoe: せいくらべ
//   q-room-expand  広い: a girl stands squeezed in a narrow room; the walls slide far apart; she spreads her arms and
//                  twirls: ひろい!
//   q-year-hop     再来年: three calendar blocks (いま, +1, +2); a boy hops two blocks ahead and cheers on the last: やった!
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many, PUFF, burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { textPlane } from '../pieces/kit-props.js';
import { between, arc, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, speech, say } from './q-common.js';
import { wear } from './q-music.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
const WOOD = 0xb07a48;

// ---- 夕飯 / 晩御飯 ----
function dinner(ctx, spec, stage) {
  const night = spec.time === 'night', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.75 * u, TH = 0.27 * u, SK = 0.15 * u, SM = 0.11 * u;
  const mum = person(spec.who, u), kid = person(spec.kid, u, KID + 0.12), bubble = speech(u, 'いただきます', { h: 0.13 });
  const table = solidProp([[G.box(0.6 * u, 0.035 * u, 0.36 * u, 0, TH, 0), WOOD], [G.box(0.62 * u, 0.008 * u, 0.38 * u, 0, TH + 0.02 * u, 0), 0xf0f4f8], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [G.box(0.035 * u, TH, 0.035 * u, a * 0.26 * u, TH / 2, b * 0.14 * u), 0x8a5a30])], 0.35);
  table.position.set(tx, floor, 0.08 * u);
  // a stool each (the boy's is a tall one)
  const seat = (x, h, c) => [[G.cyl(0.08 * u, 0.08 * u, 0.025 * u, x, h - 0.0125 * u, 0), c], [G.cyl(0.015 * u, 0.02 * u, h, x, h / 2, 0), 0x6a4020]];
  const cushions = solidProp([...seat(-0.42 * u, SK, 0x9a3a5a), ...seat(0.42 * u, SM, 0x3a5a9a)], 0.35);
  cushions.position.set(tx, floor, 0.0);
  // the window on the back wall: a sky of the time of day, a sinking sun or the moon and stars
  const SKY = night ? 0x18204a : 0xff8a40, wy = floor + 0.85 * u;
  const win = solidProp([[G.box(0.5 * u, 0.36 * u, 0.01 * u, 0, 0, 0), SKY], ...(night ? [] : [[G.box(0.5 * u, 0.12 * u, 0.012 * u, 0, -0.12 * u, 0), 0xffb060]]), [G.box(0.54 * u, 0.03 * u, 0.03 * u, 0, 0.19 * u, 0.01 * u), WOOD], [G.box(0.54 * u, 0.03 * u, 0.03 * u, 0, -0.19 * u, 0.01 * u), WOOD], [G.box(0.03 * u, 0.4 * u, 0.03 * u, -0.26 * u, 0, 0.01 * u), WOOD], [G.box(0.03 * u, 0.4 * u, 0.03 * u, 0.26 * u, 0, 0.01 * u), WOOD], [G.box(0.015 * u, 0.36 * u, 0.02 * u, 0, 0, 0.01 * u), WOOD]], night ? 0.7 : 0.8);
  win.position.set(tx, wy, -0.45 * u);
  const sky = night ? solidProp([[G.torus(0.055 * u, 0.022 * u, Math.PI * 1.2, 0, 0, 0, 1.2), 0xfff0b0], ...[[-0.15, 0.1], [0.09, 0.12], [0.16, -0.03], [-0.06, -0.09], [0.04, 0.02]].map(([x, y]) => [G.sphere(0.011 * u, x * u, y * u, 0), 0xffffff])], 1.0) : solidProp([[new THREE.CircleGeometry(0.075 * u, 24), 0xffe060]], 1.0);
  const lamp = night ? solidProp([[G.cyl(0.005 * u, 0.005 * u, 0.4 * u, 0, 0.2 * u, 0), 0x3a3a44], [G.cone(0.13 * u, 0.09 * u, 0, -0.02 * u, 0), 0xf0a040], [G.sphere(0.04 * u, 0, -0.07 * u, 0), 0xfff0b0]], 0.9) : null;
  if (lamp) lamp.position.set(tx, floor + 1.02 * u, 0.05 * u);
  // dishes: a rice bowl each, and grilled fish (sunset) or dumplings (night) on a plate in the middle
  const bowls = [createModel('rice', { width: 0.15 * u }), createModel('rice', { width: 0.15 * u })], dish = createModel(night ? 'gyoza' : 'fishWhole', { width: night ? 0.12 * u : 0.24 * u });
  const plate = solidProp([[G.cyl(0.13 * u, 0.1 * u, 0.015 * u, 0, 0, 0, 0, 0, 0, 24), 0xf4f4f8]], 0.5);
  const sticks = solidProp([[G.cyl(0.005 * u, 0.008 * u, 0.17 * u, -0.007 * u, 0, 0.085 * u, Math.PI / 2), 0x8a3a20], [G.cyl(0.005 * u, 0.008 * u, 0.17 * u, 0.007 * u, 0, 0.085 * u, Math.PI / 2), 0x8a3a20]], 0.4);
  const steam = many(PUFF(u, 0xffffff), 5, 0.5);
  group.add(table, cushions, win, sky, mum.group, kid.group, ...bowls.map((b) => b.group), dish.group, plate, sticks, steam, bubble, ...(lamp ? [lamp] : []));
  const loop = 7.4, top = floor + TH + 0.024 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      if (night) sky.position.set(tx - 0.08 * u, wy + 0.03 * u, -0.44 * u); else sky.position.set(tx + 0.1 * u, wy + 0.08 * u - 0.12 * u * (pre ? 0 : v / loop), -0.44 * u);
      kid.pose('SitDown', 1.0, false); kid.group.position.set(tx - 0.42 * u, floor + SK - 0.12 * kid.h, 0.0); kid.group.rotation.y = 0.6;
      mum.pose('SitDown', 1.0, false); mum.group.position.set(tx + 0.42 * u, floor + SM - 0.12 * mum.h, 0.0); mum.group.rotation.y = -0.6;
      // the dishes pop onto the table one after another (and go at the end of the loop)
      const d = (i) => (pre ? 0 : between(v, 0.2 + 0.25 * i, 0.5 + 0.25 * i) * (1 - between(v, 6.8, 7.2)));
      const P = [[tx - 0.19 * u, 0.04 * u], [tx + 0.19 * u, 0.04 * u], [tx, 0.14 * u]];
      bowls.forEach((b, i) => { b.group.visible = d(i) > 0.01; b.group.scale.setScalar(grow(d(i))); b.group.position.set(P[i][0], top, P[i][1]); });
      plate.visible = dish.group.visible = d(2) > 0.01; plate.scale.setScalar(grow(d(2))); plate.position.set(P[2][0], top + 0.008 * u, P[2][1]);
      dish.group.scale.setScalar(grow(d(2))); dish.group.position.set(P[2][0], top + 0.016 * u, P[2][1]); dish.group.rotation.y = 0.3;
      wisps(steam, 0, 5, tx, top + 0.1 * u, t, u, { period: 1.8, rise: 0.3, size: 0.4, on: d(2) }); steam.commit();
      // hands together: いただきます
      const pray = pre ? 0 : between(v, 1.2, 1.5) * (1 - between(v, 2.6, 2.9));
      const palms = kid.at('mouth', W, 0, -0.16, 0.16);
      kid.handTo('R', palms.clone().add(kid.local(-0.012, 0, 0, W2).sub(kid.local(0, 0, 0, W3))), pray, { out: 0.4, down: 0.9 }); kid.handTo('L', palms.add(kid.local(0.012, 0, 0, W2).sub(kid.local(0, 0, 0, W3))), pray, { out: 0.4, down: 0.9 });
      kid.turn('Head', 0.15 * pray);
      say(bubble, pray > 0.5 ? 1 : 0, tx - 0.3 * u, floor + 0.85 * u, 0.2 * u);
      // he eats: the bowl comes up in his left hand, the chopsticks go bowl -> mouth, three bites
      const eat = pre ? 0 : between(v, 2.9, 3.2) * (1 - between(v, 6.2, 6.6)), bowl = bowls[0].group;
      const rest = new THREE.Vector3(P[0][0], top, P[0][1]), held = group.worldToLocal(kid.at('mouth', W, 0.02, -0.22, 0.16)).clone();
      bowl.position.copy(rest.lerp(held, eat));
      group.localToWorld(W.copy(bowl.position)); kid.grip('L', W.add(W2.set(0, -0.01 * u * group.getWorldScale(W3).y, 0)), W3.set(0, 1, 0), 0.02 * u * group.getWorldScale(W2).y, eat, { out: 0.8, down: 0.5 });
      let up = 0; for (const b of [3.4, 4.3, 5.2]) up = Math.max(up, bump(v, b, 0.8));
      const bowlTop = group.localToWorld(W.copy(bowl.position).add(W2.set(0, 0.05 * u, 0))).clone(), mouth = kid.at('mouth', W2, 0, -0.01, 0.04), tip = bowlTop.lerp(mouth, up * 0.9);
      const len = 0.15 * u * group.getWorldScale(W3).y, dir = kid.local(-0.6, lerp(-0.3, 0.2, up), lerp(0.2, -0.4, up), W3).sub(kid.local(0, 0, 0, W2)).normalize();
      kid.handTo('R', tip.clone().addScaledVector(dir, -len), eat, { out: 0.7, down: 0.8 });
      if (up > 0.2) kid.turn('Head', 0.1 * up);
      kid.hold(sticks, 'R', group, 0.008 * u); sticks.lookAt(tip); sticks.visible = eat > 0.05;
      // mum smiles and nods along
      mum.nod(pre ? 0 : bump(v, 1.6, 1.4), v); mum.turn('Head', 0.1, 0, 0);
      mum.nod(pre ? 0 : bump(v, 4.4, 1.2), v);
    },
  };
}

// ---- 黒 ----
function soot(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, cx = px + 0.5 * u;
  const p = person(spec.who, u), black = label(u, 'まっくろ!', '#202024', 0.14), SOOT = new THREE.Color(0x1a1a1e), WHITE = new THREE.Color(0xffffff);
  const chimney = solidProp([[G.box(0.24 * u, 1.2 * u, 0.24 * u, 0, 0.6 * u, 0), 0xa04a3a], [G.box(0.3 * u, 0.07 * u, 0.3 * u, 0, 1.2 * u, 0), 0x7a3a2a], ...[0.2, 0.45, 0.7, 0.95].map((y) => [G.box(0.245 * u, 0.012 * u, 0.245 * u, 0, y * u, 0), 0xd8c8b8])], 0.3);
  chimney.position.set(cx, floor, -0.3 * u);
  const smoke = many(PUFF(2.6 * u, 0x1a1a20), 10, 0.05), dust = many(PUFF(0.8 * u, 0x2a2a30), 8, 0.05);
  const own = p.materials.map((m) => [m, m.color.clone(), m.emissive.clone(), m.name]);
  group.add(chimney, smoke, dust, p.group, black);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { cough: [0.3, 0.9, 'out'], dark: [0.8, 0.4], shake: [3.4, 1.2], clean: [4.2, 0.5] });
      // a big black cloud bursts out of the chimney and down over him
      for (let i = 0; i < 10; i++) {
        const f = pre ? 0 : between(v, 0.3 + i * 0.04, 1.6 + i * 0.05), a = i * 0.9;
        smoke.set(i, lerp(cx, px, Math.min(1, f * 1.8)) + 0.16 * u * Math.cos(a) * Math.min(1, f * 2), floor + 1.25 * u - 0.85 * u * Math.min(1, f * 1.4) + 0.15 * u * Math.sin(a) * f, 0.12 * u + 0.08 * u * Math.sin(a), f > 0 && f < 1 ? Math.sin(Math.PI * f) * (0.9 + 0.5 * f) : 0);
      }
      smoke.commit();
      // black all over, only his eyes white and blinking; he shakes it off and the soot falls away
      const k = T.dark * (1 - T.clean), blink = (v % 1.3) < 0.13 && k > 0.5;
      for (const [m, c, e, n] of own) {
        const to = n === 'Face' ? (blink ? SOOT : WHITE) : SOOT;
        m.color.copy(c).lerp(to, k); m.emissive.copy(e).lerp(to, k);
      }
      p.pose('Idle', t); p.group.position.set(px, floor, 0.1 * u); p.group.rotation.y = -0.15;
      const sh = T.shake > 0 && T.shake < 1 ? Math.sin(v * 20) * Math.sin(Math.PI * T.shake) : 0;
      p.group.rotation.y += 0.35 * sh; p.turn('Torso', 0, 0, 0.12 * sh); p.shake(Math.abs(sh), v);
      const look = pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 3.3, 3.5));
      p.handTo('R', p.local(-0.35, 0.5, 0.18, W), look, { out: 0.8, down: 0.6 }); p.handTo('L', p.local(0.35, 0.5, 0.18, W), look, { out: 0.8, down: 0.6 }); p.turn('Head', 0.4 * look);
      for (let i = 0; i < 8; i++) { const f = between(v, 3.5 + i * 0.08, 4.4 + i * 0.08), a = i * 0.8; dust.set(i, px + 0.3 * u * Math.cos(a) * (0.4 + f), floor + (0.3 + 0.08 * (i % 4)) * u * (1 - f) + 0.05 * u, 0.1 * u + 0.2 * u * Math.sin(a), f > 0 && f < 1 ? 1.2 * (1 - f) : 0); }
      dust.commit();
      pop(black, pre ? 0 : between(v, 1.9, 2.1) * (1 - between(v, 3.4, 3.6)), px, floor + 1.08 * u, 0.15 * u);
    },
  };
}

// ---- 変 ----
function frog(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.5 * u;
  const f = solidProp([[G.sphere(0.12 * u, 0, 0.08 * u, 0, 1.3, 0.8, 1), 0x48b048], [G.sphere(0.05 * u, -0.07 * u, 0.17 * u, 0.04 * u), 0x58c058], [G.sphere(0.05 * u, 0.07 * u, 0.17 * u, 0.04 * u), 0x58c058], [G.sphere(0.022 * u, -0.07 * u, 0.18 * u, 0.085 * u), 0x101010], [G.sphere(0.022 * u, 0.07 * u, 0.18 * u, 0.085 * u), 0x101010], [G.box(0.12 * u, 0.012 * u, 0.01 * u, 0, 0.07 * u, 0.13 * u), 0xc04040],
    [G.sphere(0.05 * u, -0.13 * u, 0.03 * u, 0.0, 1, 0.6, 1.6), 0x3a9a3a], [G.sphere(0.05 * u, 0.13 * u, 0.03 * u, 0.0, 1, 0.6, 1.6), 0x3a9a3a]], 0.45);
  const p = person(spec.who, u), crown = solidProp([[G.cyl(0.075 * u, 0.07 * u, 0.06 * u, 0, 0.03 * u, 0, 0, 0, 0, 10), 0xffd030], ...[0, 1, 2, 3, 4].map((i) => [G.cone(0.022 * u, 0.06 * u, Math.cos(i * 1.256) * 0.065 * u, 0.085 * u, Math.sin(i * 1.256) * 0.065 * u), 0xffd030]), [G.sphere(0.018 * u, 0, 0.03 * u, 0.072 * u), 0xe02a4a]], 0.7);
  const poof = many(PUFF(2.4 * u, 0xf4f0ff), 16, 0.7), henshin = label(u, 'へんしん!', '#8a3ad0', 0.15);
  group.add(f, p.group, crown, poof, henshin);
  const loop = 6.4, P1 = 1.2, P2 = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, isPrince = !pre && v >= P1 + 0.15 && v < P2 + 0.15;
      // the frog hops in from the right; POOF: a prince; POOF: a frog again
      const hop = pre ? 0 : between(v, 0.1, 0.8), back = pre ? 0 : between(v, P2 + 0.6, P2 + 1.4);
      const hx = lerp(fx + 0.55 * u, fx, hop), hy = floor + 0.2 * u * Math.abs(Math.sin(Math.PI * 2 * hop)) + 0.15 * u * Math.sin(Math.PI * back);
      f.visible = !isPrince; f.position.set(v > P2 ? fx : hx, v > P2 ? hy : hy, 0.15 * u); f.scale.setScalar(1 + 0.08 * Math.sin(v * 5)); f.rotation.y = -0.3;
      p.group.visible = crown.visible = isPrince;
      p.pose('Idle', t); p.group.position.set(fx, floor, 0.1 * u); p.group.rotation.y = -0.2;
      const w = isPrince ? between(v, P1 + 0.5, P1 + 0.8) * (1 - between(v, P2 - 0.6, P2 - 0.3)) : 0;
      p.wave('R', w, v); p.bow(0.4 * bump(v, 3.0, 1.0));
      wear(p, crown, group, 0.17 * p.h);
      const s = isPrince ? grow(between(v, P1 + 0.15, P1 + 0.45) * (1 - between(v, P2 - 0.05, P2 + 0.15))) : 1;
      p.group.scale.setScalar(s); crown.scale.setScalar(s);
      for (const [i0, at] of [[0, P1], [8, P2]]) for (let i = 0; i < 8; i++) { const g = (v - at) / 0.8, a = i * 0.785 + 0.4, r = 0.06 + 0.16 * Math.min(1, g * 2); poof.set(i0 + i, fx + Math.cos(a) * r * u, floor + 0.3 * u + Math.sin(a) * r * 1.3 * u, 0.2 * u + 0.05 * u * Math.sin(a * 3), !pre && g > 0 && g < 1 ? 1.5 * Math.sin(Math.PI * Math.min(1, g * 1.3)) : 0); }
      poof.commit();
      pop(henshin, pre ? 0 : between(v, P1 + 0.1, P1 + 0.3) * (1 - between(v, P1 + 2.2, P1 + 2.5)), fx + 0.05 * u, floor + 1.15 * u, 0.2 * u);
      // the kanji wobbles at each change
      for (let si = 0; si < ctx.strokes.length; si++) { const j = !pre ? (bump(v, P1, 0.6) + bump(v, P2, 0.6)) * 0.015 * u : 0; stage.offset(si, j * Math.sin(v * 30 + si), j * Math.cos(v * 27 + si * 2), 0); }
    },
  };
}

// ---- 背 ----
function backs(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.6 * u;
  const tall = person(spec.who, u, KID + 0.27), short = person(spec.other, u, KID + 0.12), say1 = label(u, 'せいくらべ', '#3a7ac0', 0.13);
  const ticks = Array.from({ length: 11 }, (_, i) => [G.box((i % 5 ? 0.07 : 0.15) * u, 0.01 * u, 0.01 * u, -0.3 * u + (i % 5 ? 0.035 : 0.075) * u, (0.1 + 0.1 * i) * u, 0.012 * u), 0xffffff]);
  const chart = solidProp([[G.box(0.7 * u, 1.2 * u, 0.02 * u, 0, 0.6 * u, 0), 0x5a9ad8], [G.box(0.7 * u, 0.25 * u, 0.021 * u, 0, 0.125 * u, 0), 0x3a7a3a], [G.box(0.7 * u, 0.06 * u, 0.025 * u, 0, 1.17 * u, 0), 0xffb040], ...ticks], 0.35);
  chart.position.set(bx, floor, -0.2 * u);
  const bar = solidProp([[G.box(0.45 * u, 0.03 * u, 0.12 * u, 0, 0, 0), 0x8a5a30], [G.box(0.48 * u, 0.008 * u, 0.1 * u, 0, 0.018 * u, 0), 0xf0d080]], 0.35);
  group.add(chart, tall.group, short.group, bar, say1);
  const loop = 6.4, hT = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { bar: [0.4, 0.7, 'out'], tip: [1.4, 0.4, 'back'], untip: [3.8, 0.3], barUp: [4.0, 0.5, 'in'], face: [4.4, 0.5], unface: [5.8, 0.5] });
      tall.pose('Idle', t); short.pose('Idle', t + 1.3);
      // back to back in the middle of the chart, each turned a little toward us; then they turn to us and grin
      const f = T.face * (1 - T.unface), tip = T.tip * (1 - T.untip);
      tall.group.position.set(bx - 0.15 * u, floor, 0.0); tall.group.rotation.y = lerp(LEFT + 0.35, -0.3, f);
      short.group.position.set(bx + 0.15 * u, floor + 0.06 * u * tip, 0.1 * u); short.group.rotation.y = lerp(RIGHT - 0.35, 0.3, f);
      short.turn('FootL', 0.6 * tip); short.turn('FootR', 0.6 * tip);
      short.turn('Head', -0.2 * tip); short.handTo('R', short.local(-0.25, 0.3, -0.05, W), tip * 0.7); short.handTo('L', short.local(0.25, 0.3, -0.05, W), tip * 0.7);
      tall.at('over', hT, 0, 0, 0); group.worldToLocal(hT);
      const b = pre ? 0 : T.bar * (1 - T.barUp), barY = hT.y - 0.06 * u;
      bar.visible = b > 0.01; bar.position.set(bx, barY + 0.5 * u * (1 - b), 0.05 * u);
      bar.rotation.z = 0.05 * Math.sin(v * 7) * tip;
      tall.wave('L', bump(v, 4.5, 1.6) * 0.6, v); short.wave('R', bump(v, 4.6, 1.6) * 0.6, v);
      pop(say1, pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 3.8, 4.1)), bx + 0.45 * u, barY + 0.05 * u, 0.15 * u);
    },
  };
}

// ---- 広い ----
function room(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rx = B.maxX + 0.72 * u, W0 = 0.36 * u, W1 = 1.3 * u, H = 0.62 * u;
  const base = solidProp([[G.box(1, 0.03 * u, 0.5 * u, 0, 0.015 * u, 0), WOOD], [G.box(1, H, 0.02 * u, 0, H / 2, -0.25 * u), 0xe8f0e0]], 0.3);
  const wall = () => solidProp([[G.box(0.05 * u, H, 0.5 * u, 0, H / 2, 0), 0xd8c8a8], [G.box(0.012 * u, 0.18 * u, 0.16 * u, 0, H * 0.62, 0.02 * u), 0x8ad0ff], [G.box(0.06 * u, 0.03 * u, 0.52 * u, 0, H, 0), 0x8a5a30]], 0.35);
  const L = wall(), R = wall(), p = person(spec.who, u, KID + 0.12), wide = label(u, 'ひろい!', '#2a9a6a', 0.15);
  group.add(base, L, R, p.group, wide);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.5, 1.4, 'out'], arms: [1.4, 0.5], twirl: [2.0, 1.6], close: [4.8, 0.9, 'in'] });
      const g = pre ? 0 : T.open * (1 - T.close), Wd = lerp(W0, W1, g);
      base.scale.x = Wd; base.position.set(rx, floor, 0); L.position.set(rx - Wd / 2, floor, 0); R.position.set(rx + Wd / 2, floor, 0);
      L.rotation.y = R.rotation.y = 0;
      p.pose('Idle', t); p.group.position.set(rx, floor + 0.03 * u, 0.05 * u);
      // squeezed: arms tucked in; then the walls slide away, she spreads her arms wide and twirls round
      const sq = 1 - g, arms = T.arms * (1 - T.close);
      p.handTo('R', p.local(-0.1, 0.5, 0.18, W), sq * (pre ? A.setup : 1), { out: 0.3, down: 1 }); p.handTo('L', p.local(0.1, 0.5, 0.18, W), sq * (pre ? A.setup : 1), { out: 0.3, down: 1 });
      p.handTo('R', p.local(-0.5, 0.62, 0.05, W), arms, { out: 0.9, down: 0.3 }); p.handTo('L', p.local(0.5, 0.62, 0.05, W), arms, { out: 0.9, down: 0.3 });
      p.group.rotation.y = -0.15 + Math.PI * 2 * T.twirl;
      p.turn('Head', -0.2 * arms);
      pop(wide, pre ? 0 : between(v, 1.7, 2.0) * (1 - between(v, 4.6, 4.9)), rx, floor + H + 0.18 * u, 0.15 * u);
    },
  };
}

// ---- 再来年 ----
function years(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.28 * u, GAP = 0.42 * u, PW = 0.32 * u, PH = 0.26 * u;
  const pads = solidProp([0, 1, 2].flatMap((i) => [[G.box(PW, PH, 0.22 * u, i * GAP, PH / 2, 0), 0xfaf6ea], [G.box(PW, 0.06 * u, 0.225 * u, i * GAP, PH - 0.03 * u, 0), i === 2 ? 0xe04848 : 0x6a7a9a],
    [G.cyl(0.01 * u, 0.01 * u, 0.05 * u, i * GAP - 0.08 * u, PH + 0.005 * u, 0.0), 0x404048], [G.cyl(0.01 * u, 0.01 * u, 0.05 * u, i * GAP + 0.08 * u, PH + 0.005 * u, 0.0), 0x404048]]), 0.45);
  pads.position.set(x0, floor, 0);
  const marks = ['いま', '+1', '+2'].map((s, i) => { const m = textPlane(s, { h: 0.12 * u, color: i === 2 ? '#e04848' : '#2a3040', weight: 900 }); m.position.set(x0 + i * GAP, floor + PH * 0.42, 0.112 * u); return m; });
  const kid = person(spec.who, u, KID + 0.08), star = burst(u, { s: 0.5, n: 8, color: 0xffe040 }), yay = label(u, 'やった!', '#e07a20', 0.15);
  group.add(pads, ...marks, kid.group, star, yay);
  const loop = 6.0, top = floor + PH;
  kid.pose('Idle', 0); kid.group.updateWorldMatrix(true, true); const hips0 = kid.node('Hips').getWorldPosition(new THREE.Vector3()).y - kid.group.getWorldPosition(W).y;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const h1 = pre ? 0 : between(v, 0.5, 1.5), h2 = pre ? 0 : between(v, 1.6, 2.6), cheer = pre ? 0 : between(v, 2.7, 3.0) * (1 - between(v, 4.6, 4.9)), back = pre ? 0 : between(v, 5.0, 5.8);
      // two hops to the right, one block each; then a cheer, arms up; then he pops back to now
      const hop = h2 > 0 ? arc([x0 + GAP, 0], [x0 + 2 * GAP, 0], 0, h2) : arc([x0, 0], [x0 + GAP, 0], 0, h1);
      const air = (h1 > 0 && h1 < 1) || (h2 > 0 && h2 < 1);
      kid.pose(air ? 'Jump' : 'Idle', air ? 0.999 * (h2 > 0 ? h2 : h1) : t, !air);
      // the clip's own jump is high: take half of its lift off
      kid.group.position.set(back > 0.5 ? x0 : hop[0], top, 0.02 * u); kid.group.updateWorldMatrix(true, true);
      const lift = group.worldToLocal(kid.node('Hips').getWorldPosition(W2)).y - top - hips0 * kid.group.scale.y;
      kid.group.position.y = top - (air ? 0.55 * lift : 0) + 0.05 * u * cheer * Math.abs(Math.sin(v * 7));
      kid.group.rotation.y = air ? RIGHT - 0.4 : -0.2;
      kid.group.scale.setScalar(grow(back > 0 ? Math.abs(1 - 2 * back) : 1));
      kid.handTo('R', kid.local(-0.24, 1.05, 0.06, W), cheer, { out: 0.9, down: 0.4 }); kid.handTo('L', kid.local(0.24, 1.05, 0.06, W), cheer, { out: 0.9, down: 0.4 });
      const s = cheer; star.visible = s > 0.01; star.scale.setScalar(grow(s)); star.position.set(x0 + 2 * GAP, top + 0.55 * u, -0.12 * u); star.rotation.z = t * 0.8;
      pop(yay, s, x0 + 2 * GAP, top + 0.95 * u, 0.15 * u);
    },
  };
}

export const SCENES = { 'q-dinner-table': dinner, 'q-soot-puff': soot, 'q-frog-prince': frog, 'q-back-to-back': backs, 'q-room-expand': room, 'q-year-hop': years };
