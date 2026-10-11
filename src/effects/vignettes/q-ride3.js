// Model scenes, doors, rides and days off (Step 3a model pass, batch 5; merged into q-ride2.js's SCENES).
//   q-knock-door    誰: a girl knocks on a house door (コンコン); it opens a crack and a shadowy figure with glowing eyes
//                   peeks out under a big "?"; she jumps back; the figure slips back in and the door shuts; outcome
//                   window: at night a shadowy figure walks past a lit window, stops, turns and peers out at you (?), then
//                   walks on (誰か)
//   q-merry-go-round 楽しい: two children ride a merry-go-round; the horses bob up and down as it turns, they wave and
//                   cheer (わーい!), notes float up
//   q-beach-day     夏休み: a girl in a pink swim ring bobs on the waves under the summer sun; she bats a beach ball up, it
//                   splashes down and drifts back to her; a beach umbrella on the sand
//   q-rest-day      休み: a man swings in a hammock between two palm trees in the sun, hands behind his head, humming
//                   (のんびり〜); outcome bed (q-sick.js): a girl in bed with a thermometer (38°) sits up, phones in sick (やすみます…),
//                   lies back down and sleeps, Zzz (休む)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { actor } from './model-kit.js';
import { between } from './helpers.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID } from './q-common.js';
import { NOTE } from './q-music.js';
import { seatAt } from './q-ride.js';
import { sickDay } from './q-sick.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), TAU = Math.PI * 2;
// a shadowy figure: dark all over, glowing yellow eyes
const shadow = (name, h) => actor(name, h, { tint: { Skin: 0x16161e, Face: 0xfff070, Shirt: 0x101016, Pants: 0x101016, Belt: 0x101016, Hair: 0x101016 } });
const gable = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0); return G.extrude(s, 0.1); };

// ---- 誰 / 誰か ----
function knock(ctx, spec, stage) {
  if (spec.outcome === 'window') return peekWindow(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.7 * u, dl = hx - 0.38 * u, dw = 0.34 * u, dh = 0.7 * u, hw = 1.0 * u, wh = 0.9 * u;
  const wall = 0xe8d8b8, xl = hx - hw / 2, xr = hx + hw / 2;
  const house = solidProp([[G.box(dl - xl, wh, 0.08 * u, (xl + dl) / 2, wh / 2, -0.04 * u), wall], [G.box(xr - dl - dw, wh, 0.08 * u, (dl + dw + xr) / 2, wh / 2, -0.04 * u), wall],
    [G.box(dw, wh - dh, 0.08 * u, dl + dw / 2, (dh + wh) / 2, -0.04 * u), wall], [gable(hw + 0.2 * u, 0.3 * u).translate(hx, wh, -0.04 * u), 0xb04030],
    [G.box(dw + 0.3 * u, dh + 0.1 * u, 0.02 * u, dl + dw / 2, dh / 2, -0.42 * u), 0x3a3058], [G.box(0.02 * u, dh, 0.4 * u, dl - 0.01 * u, dh / 2, -0.24 * u), 0x2a2440], [G.box(0.02 * u, dh, 0.4 * u, dl + dw + 0.01 * u, dh / 2, -0.24 * u), 0x2a2440],
    [G.box(0.22 * u, 0.2 * u, 0.02 * u, hx + 0.27 * u, 0.5 * u, 0.005 * u), 0x9ad0f0], [G.box(0.24 * u, 0.025 * u, 0.03 * u, hx + 0.27 * u, 0.39 * u, 0.01 * u), 0x8a5a30], [G.box(dw + 0.08 * u, 0.04 * u, 0.2 * u, dl + dw / 2, 0.02 * u, 0.1 * u), 0xa8a098]], 0.35);
  house.position.set(0, floor, 0);
  const door = solidProp([[G.box(dw, dh, 0.03 * u, dw / 2, dh / 2, 0), 0x7a4a28], [G.box(dw * 0.7, dh * 0.35, 0.035 * u, dw / 2, dh * 0.7, 0), 0x8a5a34], [G.sphere(0.025 * u, dw - 0.05 * u, dh * 0.48, 0.03 * u), 0xffd040]], 0.35);
  door.position.set(dl, floor, -0.02 * u);
  const fig = shadow(spec.other, 0.74 * u), p = person(spec.who, u, 0.75), knockL = label(u, 'コンコン', '#7a4a28', 0.12), q = emblemProp('question', 0.36 * u);
  group.add(house, door, fig.group, p.group, knockL, q);
  const loop = 7.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [2.3, 0.6, 'out'], peek: [2.6, 0.6], hide: [5.0, 0.5], shut: [5.4, 0.5, 'in'] });
      const o = pre ? 0 : T.open * (1 - T.shut), pk = pre ? 0 : T.peek * (1 - T.hide);
      door.rotation.y = 0.75 * o;
      // she knocks three times; the door opens a crack; a dark figure leans out into the gap and stares (?)
      p.pose('Idle', t); p.group.position.set(dl + dw + 0.3 * u, floor, 0.22 * u);
      const startle = pre ? 0 : between(v, 3.0, 3.3) * (1 - between(v, 5.6, 6.2));
      p.group.position.x += 0.12 * u * startle; p.group.rotation.y = LEFT + 0.55 + 0.25 * startle;
      const kn = pre ? 0 : between(v, 0.2, 0.5) * (1 - between(v, 1.9, 2.2)), tap = Math.abs(Math.sin(Math.max(0, v - 0.5) * 7.5));
      p.handTo('R', group.localToWorld(W.set(dl + dw - 0.1 * u + 0.05 * u * tap * (v < 1.95 ? 1 : 0), floor + 0.5 * u, 0.0)), kn, { out: 0.6, down: 0.7 });
      p.turn('Abdomen', -0.15 * startle); p.turn('Head', -0.1 * startle);
      p.handTo('R', p.at('mouth', W, -0.07, 0.02, 0.04), startle, { out: 0.6, down: 0.9 }); p.handTo('L', p.at('mouth', W, 0.07, 0.02, 0.04), startle, { out: 0.6, down: 0.9 });
      pop(knockL, kn > 0.5 && v < 1.9 ? 1 : 0, dl + dw + 0.15 * u, floor + 0.95 * u, 0.25 * u);
      fig.pose('Idle', t * 0.6); fig.group.position.set(dl + dw - 0.12 * u, floor, lerp(-0.32 * u, 0.0, pk)); fig.group.rotation.y = 0.3 * pk;
      fig.turn('Abdomen', 0.1 * pk, 0, -0.35 * pk); fig.turn('Head', 0, 0.2 * pk, -0.25 * pk);
      fig.group.visible = pre ? false : v > 2.2 && v < 5.9;
      q.idle(v); pop(q, pre ? 0 : between(v, 3.0, 3.3) * (1 - between(v, 4.9, 5.2)), dl + dw / 2 - 0.05 * u, floor + dh + 0.14 * u, 0.25 * u);
      q.scale.multiplyScalar(0.36 * u);
    },
  };
}
function peekWindow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.85 * u, hw = 1.3 * u, wh = 0.9 * u, ww = 0.44 * u, y0 = 0.4 * u, y1 = 0.76 * u;
  const wall = 0x5a4a6a, xl = hx - hw / 2, xr = hx + hw / 2, wl = hx - ww / 2, wr = hx + ww / 2;
  const house = solidProp([[G.box(wl - xl, wh, 0.06 * u, (xl + wl) / 2, wh / 2, -0.03 * u), wall], [G.box(xr - wr, wh, 0.06 * u, (wr + xr) / 2, wh / 2, -0.03 * u), wall],
    [G.box(ww, y0, 0.06 * u, hx, y0 / 2, -0.03 * u), wall], [G.box(ww, wh - y1, 0.06 * u, hx, (y1 + wh) / 2, -0.03 * u), wall], [gable(hw + 0.2 * u, 0.26 * u).translate(hx, wh, -0.03 * u), 0x3a2a3a],
    ...[[hx, y0, ww + 0.06 * u, 0.04 * u], [hx, y1, ww + 0.06 * u, 0.04 * u], [wl, (y0 + y1) / 2, 0.04 * u, y1 - y0], [wr, (y0 + y1) / 2, 0.04 * u, y1 - y0]].map(([x, y, w, h]) => [G.box(w, h, 0.03 * u, x, y, 0.01 * u), 0xc89a60]),
    [G.box(0.1 * u, y1 - y0, 0.01 * u, wl + 0.06 * u, (y0 + y1) / 2, -0.07 * u), 0xe07a8a], [G.box(0.1 * u, y1 - y0, 0.01 * u, wr - 0.06 * u, (y0 + y1) / 2, -0.07 * u), 0xe07a8a]], 0.3);
  const lit = solidProp([[G.box(ww + 0.5 * u, y1 - y0 + 0.4 * u, 0.02 * u, 0, 0, 0), 0xffd890]], 1.3);
  house.position.set(0, floor, 0); lit.position.set(hx, floor + (y0 + y1) / 2, -0.4 * u);
  const fig = shadow(spec.other, 0.8 * u), q = emblemProp('question', 0.36 * u);
  group.add(house, lit, fig.group, q);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // he walks past behind the window, stops, turns and peers out at you; then turns back and walks on
      const T = timeline(v, { a: [0.2, 1.6, 'linear'], turn: [1.9, 0.4], lean: [2.2, 0.4], unlean: [4.4, 0.4], back: [4.7, 0.4], b: [5.0, 1.6, 'linear'] });
      const x = pre ? hx : lerp(lerp(xl + 0.1 * u, hx, T.a), xr - 0.1 * u, T.b), walking = !pre && ((T.a > 0 && T.a < 1) || (T.b > 0 && T.b < 1));
      fig.pose(walking ? 'Walk' : 'Idle', walking ? v : t * 0.6);
      const ln = pre ? 0.5 : T.lean * (1 - T.unlean);
      fig.group.position.set(x, floor, lerp(-0.22 * u, -0.12 * u, ln)); fig.group.rotation.y = pre ? 0 : lerp(RIGHT, 0, T.turn * (1 - T.back));
      fig.turn('Abdomen', 0.15 * ln); fig.turn('Head', -0.05 * ln, 0.25 * Math.sin(v * 1.5) * ln);
      fig.handTo('R', group.localToWorld(W.set(wl + 0.03 * u, floor + y0 + 0.05 * u, -0.05 * u)), ln, { out: 0.5, down: 0.8 });
      fig.handTo('L', group.localToWorld(W.set(wr - 0.03 * u, floor + y0 + 0.05 * u, -0.05 * u)), ln, { out: 0.5, down: 0.8 });
      q.idle(v); pop(q, pre ? 0 : between(v, 2.5, 2.8) * (1 - between(v, 4.3, 4.6)), xr + 0.2 * u, floor + 0.72 * u, 0.1 * u); q.scale.multiplyScalar(0.36 * u);
    },
  };
}

// ---- 楽しい ----
function merry(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.85 * u, cz = -0.3 * u, r = 0.42 * u, H = 0.95 * u;
  const cols = [0xe04848, 0xf4f0e0];
  const top = solidProp([[G.cyl(0.6 * u, 0.62 * u, 0.08 * u, 0, 0.04 * u, 0), 0x3a6ad0], [G.cyl(0.035 * u, 0.035 * u, H, 0, H / 2, 0), 0xffd040],
    [G.cone(0.68 * u, 0.3 * u, 0, H + 0.15 * u, 0), 0xe04848], [G.sphere(0.06 * u, 0, H + 0.33 * u, 0), 0xffd040],
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => [G.sphere(0.06 * u, 0.66 * u * Math.sin(i * TAU / 12), H - 0.01 * u, 0.66 * u * Math.cos(i * TAU / 12)), cols[i % 2]]),
    ...[0, 1, 2].map((i) => [G.cyl(0.012 * u, 0.012 * u, H, r * Math.sin(i * TAU / 3), H / 2, r * Math.cos(i * TAU / 3)), 0xf0d080]),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => [G.box(0.12 * u, 0.082 * u, 0.04 * u, 0.6 * u * Math.sin(i * TAU / 8), 0.04 * u, 0.6 * u * Math.cos(i * TAU / 8)), 0xffd040])], 0.4);
  top.position.set(cx, floor, cz);
  const horses = many([[G.capsule(0.06 * u, 0.16 * u).rotateX(Math.PI / 2), 0xf8f4ec], [G.capsule(0.03 * u, 0.1 * u, 0, 0.09 * u, 0.12 * u, 0).rotateX(0), 0xf8f4ec], [G.box(0.07 * u, 0.06 * u, 0.12 * u, 0, 0.17 * u, 0.16 * u), 0xf8f4ec],
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => [G.cyl(0.016 * u, 0.012 * u, 0.14 * u, sx * 0.035 * u, -0.1 * u, sz * 0.09 * u), 0xf8f4ec]), [G.box(0.1 * u, 0.02 * u, 0.1 * u, 0, 0.065 * u, -0.02 * u), 0xe04848],
    [G.box(0.02 * u, 0.1 * u, 0.06 * u, 0, 0.17 * u, 0.1 * u), 0xffd040], [G.capsule(0.015 * u, 0.08 * u, 0, -0.01 * u, -0.17 * u, 0.6), 0xffd040]], 3, 0.45);
  const kids = [person(spec.who, u, KID), person(spec.other, u, KID)], notes = many(NOTE(u, 1.2), 3, 0.9), yay = label(u, 'わーい!', '#e04878', 0.14);
  group.add(top, horses, ...kids.map((k) => k.group), notes, yay);
  const loop = 7.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, a = (pre ? 0.4 : v / loop) * TAU;
      top.rotation.y = a;
      for (let i = 0; i < 3; i++) {
        const ph = a + i * TAU / 3, x = cx + r * Math.sin(ph), z = cz + r * Math.cos(ph), y = floor + 0.38 * u + 0.07 * u * Math.sin(ph * 2 + i), yaw = Math.atan2(Math.cos(ph), -Math.sin(ph));
        horses.set(i, x, y, z, 1, 0, yaw);
        if (i === 2) continue;
        // a child on horse i: seated on the saddle, one hand on the pole, the other waving when it comes round the front
        const k = kids[i]; k.pose('SitDown', 1, false); k.group.position.set(x, floor, z); k.group.rotation.y = yaw;
        seatAt(k, group, group.localToWorld(W.set(x - 0.025 * u * Math.sin(yaw), y + 0.09 * u, z - 0.025 * u * Math.cos(yaw))));
        k.turn('UpperLegL', 0, 0, 0.35); k.turn('UpperLegR', 0, 0, -0.35);
        k.handTo('R', group.localToWorld(W.set(x, y + 0.3 * u, z)), 1, { out: 0.4, down: 0.6 });
        const front = Math.max(0, Math.cos(ph)), w = pre ? 0 : Math.min(1, front * 1.6);
        k.wave('L', w, v + i);
        k.turn('Head', 0, 0.6 * Math.sin(ph) * 0.8);
      }
      horses.commit();
      for (let i = 0; i < 3; i++) { const f = ((pre ? 0 : v) * 0.5 + i / 3) % 1; notes.set(i, cx + (i - 1) * 0.4 * u + 0.08 * u * Math.sin(f * 6), floor + H + 0.35 * u + 0.4 * u * f, cz + 0.4 * u, pre ? 0 : Math.sin(Math.PI * f), 0.2 * Math.sin(f * 5)); }
      notes.commit();
      const near = Math.max(Math.cos(a), Math.cos(a + TAU / 3));
      pop(yay, pre ? 0 : near > 0.75 ? 1 : 0, cx + 0.55 * u, floor + 1.0 * u, 0.4 * u);
    },
  };
}

// ---- 夏休み ----
function beach(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.15 * u, x1 = B.maxX + 2.4 * u, kx = B.maxX + 1.0 * u, tilt = 0.45;
  // the sea is a sheet tilted toward you (so it shows from the learner's seat); on(x, d): a point d back on its surface
  const on = (x, d, up = 0) => W2.set(x, floor + d * Math.sin(tilt) + up, -d * Math.cos(tilt));
  const seaG = new THREE.Group(); seaG.position.set(0, floor, 0); seaG.rotation.x = tilt;
  const ground = solidProp([[G.box(x1 - x0, 0.03 * u, 1.9 * u, (x0 + x1) / 2, -0.015 * u, -0.95 * u), 0x2a9ae0], [G.box(x1 - x0, 0.04 * u, 0.4 * u, (x0 + x1) / 2, -0.01 * u, 0.2 * u), 0xf0d8a0]], 0.35);
  const umb = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.75 * u, 0, 0.375 * u, 0), 0xf4f0e8], [G.cone(0.38 * u, 0.16 * u, 0, 0.78 * u, 0), 0xe04848], [G.cone(0.2 * u, 0.09 * u, 0, 0.84 * u, 0), 0xf4f0e8], [G.sphere(0.025 * u, 0, 0.88 * u, 0), 0xe04848]], 0.4);
  const waves = many([[G.capsule(0.018 * u, 0.22 * u, 0, 0, 0, Math.PI / 2), 0xf4fbff]], 6, 0.8), sun = emblemProp('sun', 0.4 * u), splash = many([[G.sphere(0.025 * u), 0xd8f0ff]], 8, 0.8);
  const ring = solidProp([[G.torus(0.15 * u, 0.055 * u).rotateX(Math.PI / 2), 0xff6aa8], ...[0, 1, 2, 3].map((i) => [G.torus(0.15 * u, 0.057 * u, 0.4, 0, 0, 0, i * Math.PI / 2).rotateX(Math.PI / 2), 0xf4f0e8])], 0.5);
  const ball = solidProp([[G.sphere(0.09 * u), 0xf4f0e8], [G.sphere(0.091 * u, 0, 0, 0, 0.35, 1, 1), 0xe04848], [G.sphere(0.091 * u, 0, 0, 0, 1, 1, 0.35), 0x2a8ae0]], 0.5);
  const kid = person(spec.who, u, 0.68), dk = 0.55 * u;
  seaG.add(ground, waves);
  umb.position.copy(on(x0 + 0.3 * u, -0.2 * u)); umb.rotation.z = 0.15; sun.position.set(x1 - 0.45 * u, floor + 1.2 * u, -0.8 * u);
  group.add(seaG, umb, sun, splash, ring, ball, kid.group);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : v;
      for (let i = 0; i < 6; i++) { const f = (s / 3.2 + i / 6) % 1; waves.set(i, x0 + 0.3 * u + ((i * 0.53) % 1) * (x1 - x0 - 0.6 * u), 0.005 * u, -1.7 * u + 1.6 * u * f, Math.sin(Math.PI * f)); }
      waves.commit();
      sun.idle(s); sun.rotation.z = s * 0.3;
      // she bobs in her swim ring; bats the ball up with both hands, it splashes down beside her and drifts back
      const bob = 0.025 * u * Math.sin(s * 2.4), c = on(kx, dk, bob).clone(), y = c.y, kz = c.z;
      kid.pose('Idle', t); kid.group.position.set(kx, y - 0.42 * kid.h, kz); kid.group.rotation.set(0.05 * Math.sin(s * 2.4 + 1), -0.25, 0.04 * Math.sin(s * 1.7));
      ring.position.set(kx, y + 0.02 * u, kz); ring.rotation.set(0.05 * Math.sin(s * 2.4 + 1), 0, 0.04 * Math.sin(s * 1.7));
      const T = timeline(v, { fly: [0.95, 1.1, 'linear'], drift: [2.4, 2.2], pick: [4.6, 0.6] });
      const hold = kid.local(0, 0.7, 0.24, new THREE.Vector3()), land = group.localToWorld(W2.set(kx + 0.55 * u, y + 0.06 * u, kz + 0.1 * u)).clone();
      const near = group.localToWorld(on(kx + 0.22 * u, dk - 0.15 * u, 0.06 * u + 0.012 * u * Math.sin(s * 2.4))).clone();
      let bp;
      if (pre || v < 0.95 || v >= 5.2) bp = hold;
      else if (v < 2.05) { const f = T.fly; bp = hold.clone().lerp(land, f); bp.y += 0.75 * u * group.getWorldScale(W2).y * 4 * f * (1 - f); }
      else if (v < 4.6) { bp = land.clone().lerp(near, T.drift); bp.y += 0.012 * u * Math.sin(s * 2.4); }
      else bp = near.clone().lerp(hold, T.pick);
      ball.position.copy(group.worldToLocal(bp.clone())); ball.rotation.z = pre ? 0 : -v * 1.5;
      // her hands hold the ball over the ring, bat it up, then rest on the ring until she picks it up again
      const held = pre ? 1 : Math.max(1 - between(v, 0.95, 1.2), between(v, 4.8, 5.2)), up = pre ? 0 : bump(v, 0.8, 0.45);
      for (const [side, sx] of [['R', -1], ['L', 1]]) {
        const onBall = bp.clone().add(kid.local(sx * 0.13, 0, 0, W).sub(kid.local(0, 0, 0, W2)));
        const onRing = kid.local(sx * 0.3, 0.42, 0.12, new THREE.Vector3()), at = onRing.lerp(onBall, held);
        at.y += 0.25 * u * up * group.getWorldScale(W2).y;
        kid.handTo(side, at, 1, { out: 0.7, down: 0.5 });
      }
      const sp = pre ? -1 : between(v, 2.0, 2.7);
      const L = on(kx + 0.55 * u, dk - 0.1 * u).clone();
      for (let i = 0; i < 8; i++) { const a2 = i * TAU / 8; splash.set(i, L.x + Math.cos(a2) * 0.15 * u * sp, L.y + 0.2 * u * Math.sin(Math.PI * sp) * (0.6 + 0.4 * (i % 2)), L.z + Math.sin(a2) * 0.1 * u * sp, sp > 0 && sp < 1 ? 1 : 0); }
      splash.commit();
    },
  };
}

// ---- 休み / 休む ----
// a hammock's cloth in its own frame: the ends hang at (±len, 0), the middle sags by `sag`; across (z) it curls up into a
// trough `w` wide and narrows to a gathered point at each end
function hammockCloth(len, sag, w, curl) {
  const g = new THREE.PlaneGeometry(1, 1, 24, 8), P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const a = P.getX(i) * 2, b = P.getY(i) * 2, e = 1 - a * a, half = w * Math.pow(e, 0.55);   // a, b in -1..1
    P.setXYZ(i, a * len, -sag * e + curl * e * b * b, b * half);
  }
  g.computeVertexNormals();
  return g;
}
function restDay(ctx, spec, stage) {
  if (spec.outcome === 'bed') return sickDay(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.95 * u, half = 0.55 * u, tz = -0.1 * u;
  const lean = 0.08, trunkR = (y) => 0.05 * u - 0.015 * u * (y / (0.75 * u));     // the trunks taper and lean outward
  const trees = solidProp([...[-1, 1].flatMap((s) => [[G.cyl(0.035 * u, 0.05 * u, 0.75 * u, hx + s * half, 0.37 * u, tz, 0, 0, -s * lean), 0x9a6a3a],
    ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.2 * u, hx + s * half + 0.04 * u * s + 0.17 * u * Math.cos(i * 1.26), 0.76 * u, tz + 0.17 * u * Math.sin(i * 1.26), 1.3, 0.3, 0.6), 0x3aa048])])], 0.35);
  // tied high on each trunk, just under the leaves; the swing turns about the line between the two knots, so they stay put
  const tieY = 0.6 * u, tieX = half + (tieY - 0.37 * u) * Math.sin(lean) - trunkR(tieY) * 0.9;
  const len = 0.46 * u, drop = 0.13 * u, sag = 0.12 * u, low = -drop - sag;
  const rope = (s) => [-0.05, 0, 0.05].map((dz) => [G.tube([[s * tieX, 0], [s * len, -drop + 0.004 * u]], 0.0045 * u).translate(0, 0, dz * u * 0.4), 0xe8dcc0]);
  const ring = (s) => [new THREE.TorusGeometry(trunkR(tieY) + 0.006 * u, 0.008 * u, 6, 18).rotateX(Math.PI / 2).translate(s * (tieX + trunkR(tieY) * 0.9), 0, 0), 0xe8dcc0];
  const net = solidProp([[hammockCloth(len, sag, 0.15 * u, 0.06 * u).translate(0, -drop, 0), 0xe85a4a],
    [hammockCloth(len, sag - 0.002 * u, 0.15 * u * 0.55, 0.06 * u * 0.3).translate(0, -drop + 0.003 * u, 0), 0xf4d890],   // a pale stripe down the middle
    ...rope(-1), ...rope(1), ring(-1), ring(1)], 0.4);
  const swing = new THREE.Group(), bedFrame = new THREE.Group();
  const p = person(spec.who, u, 0.75), sun = emblemProp('sun', 0.42 * u), hum = label(u, 'のんびり〜', '#e0782a', 0.12), notes = many(NOTE(u, 1.0), 2, 0.9);
  swing.position.set(hx, floor + tieY, tz); swing.add(net, bedFrame); bedFrame.add(p.group);
  sun.position.set(hx + 0.75 * u, floor + 1.1 * u, -0.5 * u);
  group.add(trees, swing, sun, hum, notes);
  const loop = 6.0, hip = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : v;
      swing.rotation.x = 0.13 * Math.sin(s * TAU / 3);
      sun.idle(s); sun.rotation.z = s * 0.2;
      // lying on his back along the hammock, head to the left and propped up by the curve, hands behind his head; the
      // hips sit in the lowest point of the cloth
      p.pose('Idle', 0.3);
      bedFrame.rotation.z = -0.1; p.group.rotation.order = 'XYZ'; p.group.rotation.set(-Math.PI / 2, 0, Math.PI / 2); p.group.position.set(0, 0, 0);
      p.turn('Abdomen', 0.22); p.turn('Head', 0.22);
      p.turn('UpperLegR', -0.5); p.turn('LowerLegR', 0.4); p.turn('UpperLegL', -0.35); p.turn('LowerLegL', 0.3);   // knees up, following the cloth
      p.handTo('R', p.at('over', W, -0.12, -0.25, -0.12), 1, { out: 0.9, down: 0.1 }); p.handTo('L', p.at('over', W, 0.12, -0.25, -0.12), 1, { out: 0.9, down: 0.1 });
      seatAt(p, bedFrame, swing.localToWorld(hip.set(0.06 * u, low + 0.08 * u, 0)));
      for (let i = 0; i < 2; i++) { const f = (s * 0.45 + i / 2) % 1; notes.set(i, hx - 0.35 * u + 0.1 * u * Math.sin(f * 6), floor + tieY + 0.05 * u + 0.4 * u * f, 0.1 * u, pre ? 0 : Math.sin(Math.PI * f)); }
      notes.commit();
      pop(hum, pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 5.2, 5.5)), hx, floor + 0.95 * u, 0.25 * u);
    },
  };
}
export const SCENES = { 'q-knock-door': knock, 'q-merry-go-round': merry, 'q-beach-day': beach, 'q-rest-day': restDay };
