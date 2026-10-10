// Model scenes, races, stages and lines (Step 3a model pass, batch 5b).
//   q-race-win      一番: three runners race toward you; the first breaks the finish tape, throws her arms up (Victory)
//                   and a gold 1 medal pops over her; the others arrive panting
//   q-podium-win    最: three children hop up onto a podium (2 1 3); each gets a trophy, the winner's is by far the
//                   biggest and he lifts it over his head while the others clap
//   q-race-start    始: two runners lean at the start line: よーい… the flag drops: ドン! and they dash off in a puff of dust
//   q-curtain-close 終: an actor in kimono bows on a little stage; the red curtains slide shut and おわり appears on them;
//                   outcome open: the curtains part, the spotlight comes up and an actress waves: はじまり! (始まる)
//   q-line-up       並: five children run in and line up shoulder to shoulder on a chalk line, then bow together;
//                   outcome height: they walk in one by one and queue one behind another, smallest to tallest (並ぶ)
//   q-travel-road   旅: a hiker with a backpack sets off from her little house along a winding path that recedes into
//                   depth, waves bye-bye at a signpost and walks on toward far mountains and the sun until she is gone; outcome suitcase: she pulls a rolling suitcase along, Fuji, a torii and a tower pop up
//                   one after another, she turns and waves at each and its sticker slaps onto the case (旅行)
// The house scenes (宿 住 帰 家 部屋 お手洗い) are in q-home2.js.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { between, arc, puffs } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, turnTo } from './q-common.js';
import { dyer } from './q-wear.js';

const W = new THREE.Vector3();
export const SHIRTS = [0xe04848, 0x3a7ad8, 0x40b060, 0xf0a020, 0xb060d0];
// a person in a shirt of the given colour (each actor has its own materials)
export const dressed = (name, u, k, color, part = 'Shirt') => { const a = person(name, u, k); if (color != null) dyer(a)(part, color); return a; };
export const armsUp = (p, k) => { p.handTo('R', p.local(-0.24, 1.05, 0.06, W), k, { out: 0.5, down: 0.3 }); p.handTo('L', p.local(0.24, 1.05, 0.06, W), k, { out: 0.5, down: 0.3 }); };
const clap = (p, k, v) => { const s = 0.05 + 0.05 * Math.abs(Math.sin(v * 9)); p.handTo('R', p.local(-s, 0.55, 0.22, W), k, { out: 0.6, down: 0.8 }); p.handTo('L', p.local(s, 0.55, 0.22, W), k, { out: 0.6, down: 0.8 }); };
// a gold medal with a number on it (2 draw calls): origin at its middle
function medal(u, n = '1', s = 0.26) {
  const g = new THREE.Group(), disc = solidProp([[G.cyl(s / 2 * u, s / 2 * u, 0.03 * u, 0, 0, 0, Math.PI / 2), 0xffc830], [G.torus(s / 2 * u, 0.012 * u, Math.PI * 2, 0, 0, 0.012 * u), 0xffe680]], 0.7);
  const num = textPlane(n, { h: s * 0.8 * u, color: '#8a5a00', pad: 0.05 }); num.position.z = 0.018 * u; g.add(disc, num);
  return g;
}

// ---- 一番 ----
function raceWin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u;
  const lanes = [0.6, 0.25, 0.95].map((x) => x0 + x * u), arrive = [1.9, 2.7, 3.2];
  const R = [['gal2', SHIRTS[0]], ['guy', SHIRTS[1]], ['guy3', SHIRTS[2]]].map(([n, c]) => dressed(n, u, 0.8, c));
  const zS = -2.0 * u, zT = -0.4 * u, zE = -0.15 * u, ty = 0.45 * u, L = 1.2 * u, xa = x0 - 0.02 * u, xb = xa + L;
  const track = solidProp([[G.box(L, 0.01 * u, zE - zS + 0.3 * u, L / 2, 0.005 * u, (zS + zE) / 2), 0xc0583a], ...[0.4, 0.8].map((f) => [G.box(0.012 * u, 0.012 * u, zE - zS + 0.3 * u, L * f, 0.006 * u, (zS + zE) / 2), 0xf4f0e8]),
    [G.cyl(0.015 * u, 0.015 * u, 0.6 * u, 0, 0.3 * u, zT), 0xe8e8f0], [G.cyl(0.015 * u, 0.015 * u, 0.6 * u, L, 0.3 * u, zT), 0xe8e8f0]], 0.35);
  track.position.set(xa, floor, 0);
  const half = (s) => solidProp([[G.box(L / 2, 0.035 * u, 0.006 * u, s * L / 4, 0, 0), 0xfff6f0], [G.box(0.06 * u, 0.036 * u, 0.008 * u, s * L / 2 - s * 0.03 * u, 0, 0), 0xe03040]], 0.6);
  const tL = half(1), tR = half(-1), gold = medal(u), sp = stars(u, { r: 0.2, s: 0.07, n: 4 });
  tL.position.set(xa, floor + ty, zT); tR.position.set(xb, floor + ty, zT);
  group.add(track, tL, tR, ...R.map((r) => r.group), gold, sp);
  const loop = 7.4, zOf = (i, v) => { const f = between(v, 0.2, arrive[i]); return f < 1 ? lerp(zS, zT, f) : zT + (zE - zT) * Math.min(1, (v - arrive[i]) / 0.5) * (1 - 0.5 * Math.min(1, (v - arrive[i]) / 0.5)) * 2; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { brk: [arrive[0], 0.5, 'out'], out: [6.3, 0.4], in: [6.8, 0.5] });
      const show = pre ? 1 : (1 - T.out) + T.in;
      R.forEach((r, i) => {
        const run = !pre && v > 0.2 && v < arrive[i] + 0.3, z = pre || v > 6.5 ? zS : zOf(i, v);
        if (run) r.pose('Run', v * 1.1 + i * 0.3);
        else r.pose('Idle', t + i);
        r.group.position.set(lanes[i], floor, z); r.group.rotation.y = -0.12 * (i - 1);
        r.group.scale.setScalar(grow(Math.max(0.001, Math.min(1, show))));
        // the winner cheers, arms up, bouncing on her toes
        if (i === 0 && !pre && v > arrive[0] + 0.3 && v < 6.5) { const k = between(v, arrive[0] + 0.3, arrive[0] + 0.6) * (1 - between(v, 5.9, 6.3)); armsUp(r, k); r.group.position.y += 0.04 * u * k * Math.abs(Math.sin(v * 5)); r.turn('Head', -0.2 * k); }
        if (i > 0 && !pre && v > arrive[i] + 0.3 && v < 6.5) { const k = between(v, arrive[i] + 0.3, arrive[i] + 0.6); r.bow(0.5 * k); r.handTo('R', r.local(-0.1, 0.3, 0.12, W), k); r.handTo('L', r.local(0.1, 0.3, 0.12, W), k); }
      });
      // the tape: two halves that swing down from their posts once she runs through
      tL.rotation.z = -1.45 * T.brk * (1 - T.in); tR.rotation.z = 1.45 * T.brk * (1 - T.in);
      const m = pre ? 0 : between(v, arrive[0] + 0.5, arrive[0] + 0.8) * (1 - T.out);
      pop(gold, m, lanes[0], floor + 0.98 * u + 0.03 * u * Math.sin(v * 3), zE + 0.05 * u); gold.rotation.y = 0.3 * Math.sin(v * 2);
      pop(sp, m, lanes[0], floor + 0.98 * u, zE); sp.rotation.y = v * 1.5;
    },
  };
}

// ---- 最 ----
function podiumWin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.75 * u, BW = 0.38 * u, H = [0.42, 0.26, 0.15], D = 0.32 * u;
  const xs = [px, px - BW, px + BW], cols = [0xf0c030, 0xc8ccd4, 0xc87a40];
  const pod = solidProp([[G.box(BW, H[0] * u, D, 0, H[0] * u / 2, 0), cols[0]], [G.box(BW, H[1] * u, D, -BW, H[1] * u / 2, 0), cols[1]], [G.box(BW, H[2] * u, D, BW, H[2] * u / 2, 0), cols[2]]], 0.4);
  pod.position.set(px, floor, -0.05 * u);
  const nums = ['1', '2', '3'].map((n, i) => { const m = textPlane(n, { h: 0.2 * u, color: '#ffffff', pad: 0.05 }); m.position.set(xs[i], floor + (H[i] - 0.11) * u, -0.05 * u + D / 2 + 0.003 * u); return m; });
  const P = [['guy2', SHIRTS[0]], ['gal', SHIRTS[1]], ['guy3', SHIRTS[2]]].map(([n, c]) => dressed(n, u, 0.7, c));
  const cups = [0.5, 0.24, 0.17].map((s) => Object.assign(emblemProp('trophy', s * u, { color: 0xffc840 }), { s }));
  group.add(pod, ...nums, ...P.map((p) => p.group), ...cups);
  const loop = 7.6, hop = [1.3, 0.75, 0.25];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      P.forEach((p, i) => {
        // each hops up onto its step (third, second, then the winner), and back down at the end
        const up = pre ? 0 : between(v, hop[i], hop[i] + 0.55) * (1 - between(v, 6.4 + 0.2 * i, 6.95 + 0.2 * i)), down = !pre && v > 6.4;
        const [z, y] = arc([0.42 * u, 0], [-0.05 * u, H[i] * u], 0.25 * u, up);
        const air = up > 0 && up < 1;
        p.pose(air ? 'Jump' : 'Idle', air ? 0.25 + 0.5 * (down ? 1 - up : up) : t + i, false);
        p.group.position.set(xs[i], floor + y, z); p.group.rotation.y = 0;
        // a trophy for each: small, medium and, for the winner, a huge one he lifts over his head
        const c = cups[i], g = pre ? 0 : between(v, 2.2 + 0.4 * (2 - i), 2.5 + 0.4 * (2 - i)) * (1 - between(v, 6.0, 6.3));
        const lift = i === 0 ? (pre ? 0 : between(v, 3.4, 3.8) * (1 - between(v, 5.6, 6.0))) : 0;
        const hy = lerp(0.48, 1.12, lift), hz = lerp(0.24, 0.1, lift), r = c.s * 0.22;
        p.handTo('R', p.local(-r, hy, hz, W), g, { out: 0.7, down: 0.6 }); p.handTo('L', p.local(r, hy, hz, W), g, { out: 0.7, down: 0.6 });
        if (i > 0) clap(p, (pre ? 0 : between(v, 3.6, 3.9) * (1 - between(v, 5.5, 5.8))), v);
        c.visible = g > 0.01; c.scale.setScalar(c.s * u * grow(Math.max(0.001, g)));
        p.local(0, hy + 0.02, hz + 0.03, W); c.position.copy(group.worldToLocal(W)); c.idle(0); c.rotation.z = i === 0 ? 0.08 * Math.sin(v * 6) * lift : 0;
      });
    },
  };
}

// ---- 始 ----
function raceStart(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.42 * u, run = 1.35 * u;
  const track = solidProp([[G.box(run + 0.2 * u, 0.012 * u, 0.62 * u, run / 2, 0.006 * u, 0), 0xc0583a], [G.box(0.04 * u, 0.014 * u, 0.62 * u, 0.12 * u, 0.007 * u, 0), 0xffffff], [G.box(run + 0.2 * u, 0.014 * u, 0.014 * u, run / 2, 0.007 * u, 0), 0xffffff]], 0.3);
  track.position.set(sx, floor, 0);
  const flag = new THREE.Group(), cloth = solidProp([[G.cyl(0.01 * u, 0.01 * u, 0.42 * u, 0, 0.21 * u, 0), 0xd8dce4], [G.box(0.2 * u, 0.14 * u, 0.008 * u, 0.1 * u, 0.35 * u, 0), 0xe02020]], 0.5);
  const post = solidProp([[G.cyl(0.015 * u, 0.02 * u, 0.6 * u, 0, 0.3 * u, 0), 0x8a8e98]], 0.3);
  flag.add(cloth); flag.position.set(sx + 0.75 * u, floor + 0.58 * u, -0.45 * u); post.position.set(sx + 0.75 * u, floor, -0.45 * u);
  const P = [dressed('gal3', u, 0.78, 0xf0a020), dressed('guy2', u, 0.78, SHIRTS[1])], dust = many(PUFF(u), 8, 0.4);
  const ready = label(u, 'よーい…', '#4a6a9a', 0.15), go = label(u, 'ドン!', '#e03030', 0.18);
  group.add(track, post, flag, ...P.map((p) => p.group), dust, ready, go);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lean: [0.2, 0.5], drop: [1.6, 0.18, 'in'], run: [1.7, 1.2, 'linear'], up: [4.4, 0.4], back: [4.8, 0.6] });
      flag.rotation.z = 0.25 - 1.7 * (T.drop - T.up);
      P.forEach((p, i) => {
        const going = T.run > 0 && T.run < 1, k = (1 - T.run) * (pre ? 0.4 : T.lean) + (T.run >= 1 ? 0 : 0);
        p.pose(going ? 'Run' : 'Idle', going ? v * 1.15 + i * 0.4 : 0.6 + i);
        const x = sx + 0.06 * u + run * T.run * (1 + 0.08 * i);
        p.group.position.set((T.run >= 1 ? sx + 0.06 * u : x) + 0.28 * u * i, floor - 0.06 * u * k, (i ? -0.3 : 0.14) * u); p.group.rotation.y = RIGHT - 0.25;
        // set: bent forward, knees bent, one arm forward and one back
        if (!going) {
          p.turn('UpperLegL', -0.5 * k); p.turn('LowerLegL', 0.7 * k); p.turn('UpperLegR', 0.25 * k); p.turn('LowerLegR', 0.5 * k);
          p.turn('Abdomen', 0.55 * k); p.turn('Torso', 0.25 * k); p.turn('Head', -0.45 * k);
          p.handTo('R', p.local(-0.12, 0.42, 0.3, W), k); p.handTo('L', p.local(0.12, 0.5, -0.2, W), k);
        }
        const show = T.run >= 1 ? T.back : 1 - between(T.run, 0.85, 1);
        p.group.scale.setScalar(grow(Math.max(0.001, pre ? 1 : show)));
      });
      puffs(dust, 0, 8, sx + 0.1 * u, floor, pre ? -1 : between(v, 1.75, 2.5), u, 0.35); dust.commit();
      pop(ready, pre ? 0 : between(v, 0.4, 0.6) * (1 - between(v, 1.5, 1.6)), sx + 0.4 * u, floor + 0.95 * u, 0.15 * u);
      pop(go, pre ? 0 : between(v, 1.6, 1.75) * (1 - between(v, 2.9, 3.2)), sx + 0.55 * u, floor + 0.95 * u, 0.15 * u);
    },
  };
}

// ---- 終 / 始まる ----
function curtains(u, sx, floor, group, Wd, Ht) {
  const box = solidProp([[G.box(Wd, 0.12 * u, 0.45 * u, 0, 0.06 * u, 0), 0x8a5a30], [G.box(Wd, Ht, 0.02 * u, 0, 0.12 * u + Ht / 2, -0.22 * u), 0x1a1028],
    [G.box(Wd + 0.14 * u, 0.12 * u, 0.06 * u, 0, 0.12 * u + Ht, 0.19 * u), 0xc02030], [G.box(0.07 * u, Ht, 0.06 * u, -Wd / 2 - 0.035 * u, 0.12 * u + Ht / 2, 0.19 * u), 0xc02030], [G.box(0.07 * u, Ht, 0.06 * u, Wd / 2 + 0.035 * u, 0.12 * u + Ht / 2, 0.19 * u), 0xc02030]], 0.35);
  box.position.set(sx, floor, -0.1 * u);
  const curtain = () => solidProp([[G.box(1, Ht - 0.02 * u, 0.02 * u, 0.5, 0.12 * u + Ht / 2, 0), 0xd02838], ...[0.2, 0.45, 0.7].map((x) => [G.box(0.03, Ht - 0.02 * u, 0.025 * u, x, 0.12 * u + Ht / 2, 0.002 * u), 0xa01828])], 0.45);
  const cL = curtain(), cR = curtain(); cR.rotation.y = Math.PI;
  const spot = solidProp([[G.cyl(0.2 * u, 0.2 * u, 0.004 * u, 0, 0, 0, 0, 0, 0, 24), 0xfff4c0]], 1.0);
  group.add(box, spot, cL, cR);
  // c: 0 open .. 1 shut
  return (c) => { const half = Wd / 2, w = lerp(0.1 * u, half, c); cL.position.set(sx - half, floor, 0.12 * u); cL.scale.x = w; cR.position.set(sx + half, floor, 0.12 * u); cR.scale.x = w; spot.position.set(sx, floor + 0.122 * u, -0.02 * u); spot.scale.setScalar(Math.max(0.001, 1 - c)); };
}
function curtainClose(ctx, spec, stage) {
  const open = spec.outcome === 'open', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u, Wd = 0.95 * u, Ht = 0.9 * u;
  const shut = curtains(u, sx, floor, group, Wd, Ht);
  const p = open ? person(spec.who ?? 'kimono', u, 0.72) : person(spec.who ?? 'kimonoMan', u, 0.72);
  const word = open ? label(u, 'はじまり!', '#e07a20', 0.15) : textPlane('おわり', { h: 0.24 * u, color: '#ffe060' });
  const conf = open ? many([[G.box(0.025 * u, 0.015 * u, 0.004 * u, 0, 0, 0), 0xffffff]], 12, 0.8) : null;
  if (conf) { const cs = [0xff6a9a, 0xffe040, 0x40c8f0, 0x60e080]; for (let i = 0; i < 12; i++) conf.setColorAt(i, new THREE.Color(cs[i % 4])); }
  group.add(p.group, word, ...(conf ? [conf] : []));
  const loop = open ? 6.0 : 6.2, top = floor + 0.12 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.rotation.y = 0;
      if (open) {
        // the curtains part, the spotlight comes up; she steps forward and waves hello
        const T = timeline(v, { open: [0.3, 1.2, 'out'], step: [1.2, 0.6], wave: [1.6, 0.3], down: [4.2, 0.3], close: [5.2, 0.7, 'in'] }), o = pre ? 0 : T.open * (1 - T.close);
        shut(1 - o);
        p.group.position.set(sx, top, lerp(-0.12, 0.05, T.step * (1 - T.close)) * u);
        p.wave('R', T.wave * (1 - T.down), v); p.turn('Head', 0, 0, 0.1 * Math.sin(v * 3) * T.wave * (1 - T.down));
        pop(word, pre ? 0 : between(v, 1.5, 1.8) * (1 - between(v, 4.8, 5.1)), sx, floor + 1.02 * u, 0.25 * u);
        for (let i = 0; i < 12; i++) { const f = ((v * 0.45 + i / 12) % 1 + 1) % 1; conf.set(i, sx + ((((i * 37) % 11) / 11) - 0.5) * Wd * 0.85, top + Ht - (Ht - 0.1 * u) * f, 0.08 * u, o > 0.9 ? 1 : 0, v * 3 + i, v * 2); }
        conf.commit();
      } else {
        // he bows; the curtains slide shut and おわり shows on them; they open again for the next loop
        const T = timeline(v, { bow: [0.3, 0.6], up: [1.5, 0.5], close: [2.0, 1.1, 'out'], open: [5.4, 0.7, 'in'] }), c = pre ? 0 : T.close * (1 - T.open);
        shut(c);
        p.group.position.set(sx, top, 0.0); p.bow(T.bow * (1 - T.up));
        const e = pre ? 0 : between(v, 3.0, 3.3) * (1 - between(v, 5.1, 5.4)); word.visible = e > 0.01; word.scale.setScalar(grow(Math.max(0.001, e))); word.position.set(sx, floor + 0.62 * u, 0.15 * u);
      }
    },
  };
}

// ---- 並 / 並ぶ ----
function lineUp(ctx, spec, stage) {
  const queue = spec.outcome === 'height', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u;
  const names = ['guy2', 'gal2', 'guy3', 'gal', 'guy'], H = queue ? [0.45, 0.52, 0.59, 0.66, 0.73] : [0.6, 0.56, 0.62, 0.58, 0.6];
  const K = names.map((n, i) => dressed(n, u, H[i], SHIRTS[(i * 2) % 5]));
  const line = solidProp([[G.box(queue ? 1.3 * u : 1.15 * u, 0.008 * u, 0.025 * u, 0, 0.004 * u, 0), 0xf4f4f0]], 0.6);
  line.position.set(queue ? x0 + 0.65 * u : x0 + 0.55 * u, floor, queue ? 0.15 * u : 0.05 * u);
  group.add(line, ...K.map((k) => k.group));
  const loop = queue ? 7.4 : 6.8;
  // where each one ends: a row facing you (spaced shoulder to shoulder), or a queue facing the kanji, smallest first
  const spot = (i) => queue ? [x0 + 0.05 * u + 0.27 * u * i, 0.15 * u] : [x0 + 0.02 * u + 0.27 * u * i, 0.05 * u];
  const from = (i) => queue ? [x0 + 1.9 * u, 0.15 * u] : [x0 + [0.1, 0.4, 1.4, 1.0, 0.7][i] * u, -1.2 * u - 0.15 * u * (i % 2)];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      K.forEach((k, i) => {
        const t0 = queue ? 0.2 + 0.45 * i : 0.2 + 0.12 * ((i * 3) % 5), dur = queue ? 1.6 - 0.15 * i : 1.1, f = pre ? 1 : between(v, t0, t0 + dur);
        const gone = pre ? 0 : between(v, loop - 0.9, loop - 0.4), [ax, az] = from(i), [bx, bz] = spot(i);
        const moving = !pre && f > 0 && f < 1;
        k.pose(moving ? (queue ? 'Walk' : 'Run') : 'Idle', moving ? v * (queue ? 1 : 1.1) + i * 0.3 : t + i * 0.7);
        k.group.position.set(lerp(ax, bx, f), floor, lerp(az, bz, f));
        const yaw = Math.atan2(bx - ax, bz - az);
        k.group.rotation.y = moving ? yaw : queue ? LEFT : 0;
        k.group.scale.setScalar(grow(Math.max(0.001, pre ? 1 : (f > 0 ? 1 : between(v, 0, 0.2)) * (1 - gone))));
        if (!queue) k.bow(pre ? 0 : bump(v, 2.6, 1.4));
        else { const step = pre ? 0 : bump(v, 3.6, 0.7) + bump(v, 4.6, 0.7); k.group.position.x -= 0.05 * u * (between(v, 3.6, 4.3) + between(v, 4.6, 5.3)) * (1 - gone); k.group.position.y += 0.02 * u * step; }
      });
    },
  };
}

// ---- 旅 / 旅行 ----
const tri = () => { const s = new THREE.Shape(); s.moveTo(-1, 0); s.lineTo(1, 0); s.lineTo(0, 1); s.lineTo(-1, 0); return s; };
// landmarks of the trip (origin at the bottom middle): Fuji, a torii, a tower
const SIGHTS = (u) => [[[G.cone(0.38 * u, 0.5 * u, 0, 0.25 * u, 0), 0x3a5a9a], [G.cone(0.13 * u, 0.17 * u, 0, 0.415 * u, 0.02 * u), 0xffffff]],
  [[G.box(0.04 * u, 0.5 * u, 0.04 * u, -0.17 * u, 0.25 * u, 0), 0xe03a20], [G.box(0.04 * u, 0.5 * u, 0.04 * u, 0.17 * u, 0.25 * u, 0), 0xe03a20], [G.box(0.5 * u, 0.05 * u, 0.06 * u, 0, 0.5 * u, 0), 0x2a2a30], [G.box(0.42 * u, 0.035 * u, 0.05 * u, 0, 0.4 * u, 0), 0xe03a20]],
  [[G.cone(0.13 * u, 0.4 * u, 0, 0.2 * u, 0), 0xe04a30], [G.cone(0.075 * u, 0.3 * u, 0, 0.5 * u, 0), 0xf4f4f4], [G.cone(0.03 * u, 0.2 * u, 0, 0.75 * u, 0), 0xe04a30]]];
const STICK = [0x3a5a9a, 0xe03a20, 0xf0a020];
function travelRoad(ctx, spec, stage) {
  if (spec.outcome === 'suitcase') return suitcaseTrip(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u, z0 = 0.3 * u, TILT = 0.32, N = 30;
  // the land is tilted toward you (its far end rises) so the path shows as it winds away; upright things stand on it
  const path = (f) => [x0 + 0.3 * u + 0.7 * u * f + 0.28 * u * Math.sin(f * Math.PI * 2.2) * (1 - 0.4 * f), z0 - 3.4 * u * f];
  const on = (x, z, out = new THREE.Vector3()) => out.set(x, floor + (z0 - z) * Math.sin(TILT), z0 + (z - z0) * Math.cos(TILT));
  const land = new THREE.Group(); land.position.set(0, floor, z0); land.rotation.x = TILT;
  const grass = solidProp([[G.box(1.9 * u, 0.01 * u, 4.0 * u, x0 + 0.85 * u, 0, -1.85 * u), 0x6aa84a]], 0.3);
  const tiles = many([[G.box(0.2 * u, 0.012 * u, 0.13 * u, 0, 0.008 * u, 0), 0xe0c890]], N, 0.4);
  for (let i = 0; i < N; i++) { const f = i / (N - 1), [x, z] = path(f), [x2, z2] = path(f + 0.01); tiles.set(i, x, 0.004 * u, z - z0, 1 - 0.3 * f, 0, Math.atan2(x2 - x, z2 - z)); }
  tiles.commit(); land.add(grass, tiles); grass.position.z = -z0;
  const house = solidProp([[G.box(0.4 * u, 0.32 * u, 0.3 * u, 0, 0.16 * u, 0), 0xf3e2c4], [G.extrude(tri(), 1).scale(0.25 * u, 0.2 * u, 0.36 * u).translate(0, 0.32 * u, 0), 0xc8443a], [G.box(0.12 * u, 0.2 * u, 0.01 * u, 0.06 * u, 0.1 * u, 0.152 * u), 0x5a3a24], [G.box(0.1 * u, 0.09 * u, 0.01 * u, -0.1 * u, 0.2 * u, 0.152 * u), 0xffd070]], 0.4);
  const post = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.5 * u, 0, 0.25 * u, 0), 0x8a5a30], [G.box(0.26 * u, 0.07 * u, 0.02 * u, 0.1 * u, 0.44 * u, 0), 0xf0d8a0], [G.cone(0.05 * u, 0.06 * u, 0.25 * u, 0.44 * u, 0, -Math.PI / 2), 0xf0d8a0], [G.box(0.22 * u, 0.06 * u, 0.02 * u, -0.08 * u, 0.33 * u, 0), 0xe8c888], [G.cone(0.045 * u, 0.05 * u, -0.21 * u, 0.33 * u, 0, Math.PI / 2), 0xe8c888]], 0.4);
  const hills = solidProp([[G.cone(0.75 * u, 1.1 * u, 0, 0.55 * u, 0), 0x4a6a9a], [G.cone(0.25 * u, 0.37 * u, 0, 0.92 * u, 0.02 * u), 0xffffff], [G.cone(0.55 * u, 0.7 * u, 0.85 * u, 0.35 * u, 0.1 * u), 0x5a8a6a], [G.cone(0.5 * u, 0.6 * u, -0.75 * u, 0.3 * u, 0.12 * u), 0x5a7a9a], [G.sphere(0.2 * u, 0.55 * u, 1.15 * u, -0.1 * u), 0xffc030]], 0.4);
  const p = person(spec.who ?? 'gal3', u, 0.6), pack = solidProp([[G.box(0.17 * u, 0.2 * u, 0.1 * u, 0, 0, 0), 0xe07a30], [G.box(0.18 * u, 0.05 * u, 0.11 * u, 0, 0.09 * u, 0), 0xc05a20]], 0.4);
  const [hx, hz] = path(0), sgn = path(0.4);
  on(hx - 0.27 * u, hz - 0.12 * u, house.position); house.scale.setScalar(0.85); on(sgn[0] + 0.25 * u, sgn[1], post.position); post.rotation.y = -0.5;
  { const [mx, mz] = path(1); on(mx + 0.1 * u, mz - 0.6 * u, hills.position); }
  group.add(land, house, post, hills, p.group, pack);
  const loop = 8.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // she sets off from home along the winding path, turns at the signpost to wave bye-bye, and walks on toward the
      // far mountains, smaller and smaller, until she is gone; then she is home again
      const T = timeline(v, { a: [0.4, 2.2, 'linear'], wave: [2.7, 0.3], unwave: [3.6, 0.3], b: [3.9, 3.4, 'linear'], gone: [7.1, 0.4], back: [7.7, 0.6] });
      const f = pre ? 0 : 0.4 * T.a + 0.6 * T.b, [x, z] = path(f), [x2, z2] = path(Math.min(1, f + 0.02)), walking = !pre && ((v > 0.4 && v < 2.6) || (v > 3.9 && v < 7.3));
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      on(x, z, p.group.position); p.group.rotation.y = pre || v < 0.4 || v > 7.6 ? 0.3 : turnTo(Math.atan2(x2 - x, z2 - z), 0.2, T.wave * (1 - T.unwave));
      if (v > 7.6) on(...path(0), p.group.position);
      const k = v > 7.6 ? between(v, 7.7, 8.3) : 1 - T.gone;
      p.group.scale.setScalar(Math.max(0.001, grow(k)) * (1 - 0.25 * f));
      if (!pre) p.wave('R', T.wave * (1 - T.unwave), v);
      p.local(0, 0.52, -0.16, W); pack.position.copy(group.worldToLocal(W)); pack.rotation.y = p.group.rotation.y; pack.scale.setScalar(p.group.scale.x);
    },
  };
}
function suitcaseTrip(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u, x1 = x0 + 1.1 * u;
  const p = person(spec.who ?? 'gal', u, 0.7), cs = new THREE.Group(), Lh = 0.5 * u;
  const bag = solidProp([[G.box(0.24 * u, 0.32 * u, 0.12 * u, 0, 0.19 * u, 0), 0xf0e0c0], [G.box(0.015 * u, 0.2 * u, 0.015 * u, 0, 0.42 * u, -0.04 * u), 0x2a2a30], [G.box(0.12 * u, 0.025 * u, 0.025 * u, 0, Lh, -0.04 * u), 0x2a2a30], ...[-0.08, 0.08].map((x) => [G.cyl(0.025 * u, 0.025 * u, 0.03 * u, x * u, 0.025 * u, 0, 0, 0, Math.PI / 2), 0x1a1a24])], 0.4);
  const st = many([[G.cyl(0.045 * u, 0.045 * u, 0.006 * u, 0, 0, 0, Math.PI / 2), 0xffffff]], 3, 0.8);
  STICK.forEach((c, i) => st.setColorAt(i, new THREE.Color(c)));
  cs.add(bag, st);
  const sights = SIGHTS(u).map((l) => solidProp(l, 0.4)), stops = [0.2, 0.55, 0.9].map((f) => lerp(x0, x1, f));
  const flash = label(u, 'パシャ!', '#3a4a6a', 0.12);
  group.add(p.group, cs, flash, ...sights);
  const loop = 8.4, at = [1.0, 3.3, 5.6], SP = [[-0.05, 0.27], [0.05, 0.17], [-0.03, 0.09]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // she walks right pulling a suitcase; at each stop a sight pops up behind (Fuji, a torii, a tower), she turns and waves
      // at it and its sticker slaps onto the case
      let x = x0, walking = false, look = 0;
      if (!pre) for (let i = 0; i < 3; i++) { const a = at[i], s0 = i ? at[i - 1] + 1.3 : 0.1; if (v >= s0) { x = lerp(i ? stops[i - 1] : x0, stops[i], between(v, s0, a)); walking = v < a; } look = Math.max(look, bump(v, a + 0.1, 1.2)); }
      const gone = pre ? 0 : between(v, 7.4, 7.8), back = pre ? 1 : between(v, 7.9, 8.4);
      if (v > 7.0) x = stops[2];
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t); p.group.position.set(v > 7.85 ? x0 : x, floor, 0.12 * u);
      p.group.rotation.y = RIGHT - 0.35 - 1.4 * look; p.group.scale.setScalar(Math.max(0.001, grow(v > 7.85 ? back : 1 - gone)));
      // a holiday snap: she faces you with a V sign by her face: パシャ!
      if (look > 0) { p.handTo('R', p.local(-0.2, 0.86, 0.12, W), look, { out: 0.8, down: 0.5 }); p.turn('Head', 0, 0, 0.15 * look); }
      const fl = pre ? 0 : at.reduce((m, a) => Math.max(m, Math.min(1, 2 * bump(v, a + 0.5, 0.8))), 0);
      pop(flash, fl, x + 0.35 * u, floor + 0.85 * u, 0.3 * u);
      // the case trails behind her left hand, tilted toward her
      const s = p.group.scale.x, yaw = p.group.rotation.y, base = p.local(lerp(0.1, 0.32, look), 0, lerp(-0.42, -0.04, look), new THREE.Vector3());
      group.worldToLocal(base); cs.position.copy(base); cs.rotation.set(0, lerp(yaw - RIGHT, 0, look), -0.5 * (walking ? 1 : 0.6) * (1 - look)); cs.scale.setScalar(s);
      cs.updateWorldMatrix(true, true); p.handTo('L', cs.localToWorld(W.set(0, Lh, -0.04 * u)), 1, { out: 0.4, down: 0.9 });
      for (let i = 0; i < 3; i++) { const k = pre ? 0 : between(v, at[i] + 0.6, at[i] + 0.9) * (1 - gone); st.set(i, SP[i][0] * u, SP[i][1] * u + 0.04 * u, 0.064 * u, Math.max(0.001, grow(k))); }
      st.commit();
      sights.forEach((m, i) => { const k = pre ? 0 : between(v, at[i] - 0.2, at[i] + 0.3) * (1 - between(v, 7.2, 7.6)); m.visible = k > 0.01; m.scale.setScalar(Math.max(0.001, grow(k))); m.position.set(stops[i] + 0.15 * u, floor, -0.85 * u); m.scale.multiplyScalar(1.5); });
    },
  };
}

export const SCENES = { 'q-race-win': raceWin, 'q-podium-win': podiumWin, 'q-race-start': raceStart, 'q-curtain-close': curtainClose, 'q-line-up': lineUp, 'q-travel-road': travelRoad };
