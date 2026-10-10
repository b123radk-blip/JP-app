// Model scenes, homes and rooms (Step 3a model pass, batch 5b). The houses are shells you can walk into: a front wall with
// a real doorway and window, a back wall that lights up (people inside show through the window).
//   q-move-in     住: a man carries a moving box from the stack by the path into a house; the light comes on, smoke rises
//                 from the chimney and he waves from the window, a heart over the roof; outcome crab: a hermit crab moves
//                 into a shell (kept from the kit scene, 住む)
//   q-home-greet  帰: at dusk a man with a briefcase walks up to a lit house: ただいま!; the door opens and his little girl
//                 runs out and hugs him: おかえり!; they go in together; outcome bird: a mother bird flies home to her
//                 chicks (kept from the kit scene, 帰る)
//   q-house-build 家: the walls rise, the roof drops on, the chimney smokes; a man walks home, in at the door, the window lights
//   q-inn-sleep   宿: a traveller with a suitcase walks into an inn (やど sign, lantern, noren curtain); he yawns at the lit
//                 window, the light goes out, Zzz float up under the moon
//   q-my-room     部屋: an empty room fills up (teddy, bed, desk, lamp, poster); a girl walks in, looks round and jumps for joy
//   q-toilet-dash お手洗い: a man hops from foot to foot by the WC door, dashes in, ジャー, strolls out relieved and washes his
//                 hands at the sink
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, HEART, DROP } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { between, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, hearts, person, briefcase, speech, say } from './q-common.js';
import { crabShell } from './variants5a.js';
import { armsUp } from './q-home.js';
import { birdHome } from './variants5b.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
const tri = () => { const s = new THREE.Shape(); s.moveTo(-1, 0); s.lineTo(1, 0); s.lineTo(0, 1); s.lineTo(-1, 0); return s; };
const sc = (m, k) => { m.visible = k > 0.01; m.scale.setScalar(Math.max(0.001, grow(k))); };
// a house you can walk into (origin: the middle of its floor): body (walls with a doorway and a window, floor), roof (with a
// chimney; roofH 0 = none), a back panel that lights (light(f)) and a door hinged at the doorway's left edge (door: null =
// none). Draw calls: body 1 + roof 1 + light 1 + door 1.
function shell(u, { w = 0.9, h = 0.8, d = 0.5, dw = 0.24, dh = 0.66, dx = -0.2, ww = 0.26, wh = 0.24, wx = 0.2, wy = 0.52, wall = 0xf3e2c4, roof = 0xc8443a, door = 0x8a5a30, roofH = 0.32, chimney = true } = {}) {
  const k = (x) => x * u, T = 0.03, z = d / 2, parts = [];
  const strip = (x0, x1, y0, y1) => { if (x1 > x0 + 1e-4 && y1 > y0 + 1e-4) parts.push([G.box(k(x1 - x0), k(y1 - y0), k(T), k((x0 + x1) / 2), k((y0 + y1) / 2), k(z)), wall]); };
  const L = -w / 2, R = w / 2, d0 = dx - dw / 2, d1 = dx + dw / 2, w0 = ww ? wx - ww / 2 : R, w1 = ww ? wx + ww / 2 : R;
  strip(L, d0, 0, h); strip(d0, d1, dh, h); strip(d1, w0, 0, h); strip(w0, w1, 0, wy - wh / 2); strip(w0, w1, wy + wh / 2, h); strip(w1, R, 0, h);
  parts.push([G.box(k(T), k(h), k(d), k(L), k(h / 2), 0), wall], [G.box(k(T), k(h), k(d), k(R), k(h / 2), 0), wall], [G.box(k(w), k(h), k(T), 0, k(h / 2), k(-z)), wall], [G.box(k(w), k(0.02), k(d), 0, k(0.01), 0), 0x9a7a5a]);
  if (ww) parts.push([G.box(k(ww + 0.05), k(0.03), k(0.06), k(wx), k(wy - wh / 2), k(z + 0.01)), 0xffffff], [G.box(k(0.02), k(wh), k(0.02), k(wx), k(wy), k(z)), 0xffffff]);
  const body = solidProp(parts, 0.35), g = new THREE.Group();
  const top = roofH ? solidProp([[G.extrude(tri(), 1).scale(k(w / 2 + 0.08), k(roofH), k(d + 0.12)).translate(0, k(h), 0), roof], ...(chimney ? [[G.box(k(0.08), k(0.22), k(0.08), k(w * 0.28), k(h + roofH * 0.62), -k(0.05)), 0x8a5a40]] : [])], 0.35)
    : solidProp([[G.box(k(w + 0.06), k(0.05), k(d + 0.06), 0, k(h + 0.025), 0), roof]], 0.35);
  const glow = solidProp([[G.box(k(w - 0.08), k(h - 0.04), k(0.01), 0, k(h / 2), k(-z + 0.03)), 0xffffff]], 0.8);
  g.add(body, top, glow);
  let pivot = null;
  if (door != null) {
    pivot = new THREE.Group(); pivot.add(solidProp([[G.box(k(dw), k(dh), k(0.025), k(dw / 2), k(dh / 2), 0), door], [G.sphere(k(0.016), k(dw * 0.82), k(dh * 0.48), k(0.018)), 0xf0c040]], 0.35));
    pivot.position.set(k(d0), 0, k(z + 0.016)); g.add(pivot);
  }
  const dark = new THREE.Color(0x262c3a), lit = new THREE.Color(0xffd880);
  return { group: g, body, roof: top, glow, door: pivot, light: (f) => glow.material.color.copy(dark).lerp(lit, f), doorX: k(dx), front: k(z), win: [k(wx), k(wy)], h: k(h) };
}
// walk a person from a to b ([x, z]) over f (0..1), facing the way it goes
const along = (p, a, b, f, y) => { p.group.position.set(lerp(a[0], b[0], f), y, lerp(a[1], b[1], f)); p.group.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); };
const sideHold = (p, prop, group) => { p.carry(prop, 'R', group, [0, -0.03, 0]); prop.rotation.y = p.group.rotation.y + RIGHT; };

// ---- 住 / 住む ----
function moveIn(ctx, spec, stage) {
  if (spec.outcome === 'crab') return crabShell(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.7 * u, hz = -0.25 * u;
  const H = shell(u, { roof: 0x3a7ad0 }), p = person(spec.who ?? 'guy2', u, 0.62);
  const BOX = [[G.box(0.18 * u, 0.14 * u, 0.15 * u, 0, 0.07 * u, 0), 0xc89a60], [G.box(0.181 * u, 0.025 * u, 0.151 * u, 0, 0.12 * u, 0), 0xe0c890]];
  const stack = many(BOX, 2, 0.4), box = solidProp(BOX, 0.4), smoke = many(PUFF(u, 0xe0e0e8), 6, 0.5), heart = solidProp(HEART(u, 0.16), 0.8);
  H.group.position.set(hx, floor, hz);
  const sx = hx + 0.72 * u, sz = 0.15 * u;
  stack.set(0, sx + 0.12 * u, floor, sz - 0.08 * u, 1); stack.set(1, sx + 0.12 * u, floor + 0.14 * u, sz - 0.08 * u, 1, 0, 0.3); stack.commit();
  group.add(H.group, stack, box, smoke, heart, p.group);
  const loop = 9.0, door = [hx + H.doorX, hz + H.front], win = [hx + H.win[0], hz + H.front - 0.14 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.2, 1.6, 'linear'], open: [1.3, 0.4], enter: [1.8, 0.6, 'linear'], shut: [2.5, 0.4], inner: [2.4, 0.9, 'linear'], light: [3.1, 0.3], wave: [3.6, 0.3], down: [6.4, 0.3], out: [6.9, 0.4], dark: [7.6, 0.4], back: [8.3, 0.6] });
      const carrying = pre || v < 3.0 || v > 8.3;
      H.door.rotation.y = -1.5 * T.open * (1 - T.shut); H.light(T.light * (1 - T.dark));
      const out0 = [sx, sz], step = [door[0], door[1] + 0.22 * u], ins = [door[0], door[1] - 0.2 * u];
      if (pre || v < 0.2 || v > 8.3) { p.pose('Walk_Carry', 0.2); p.group.position.set(sx, floor, sz); p.group.rotation.y = LEFT; }
      else if (v < 1.8) { p.pose('Walk_Carry', v); along(p, out0, step, T.walk, floor); }
      else if (v < 2.4) { p.pose('Walk_Carry', v); along(p, step, ins, T.enter, floor); }
      else if (v < 3.3) { p.pose('Walk_Carry', v); along(p, ins, win, T.inner, floor); }
      else { p.pose('Idle', t); p.group.position.set(win[0], floor, win[1]); p.group.rotation.y = 0; }
      // from his window he waves: this is his home now
      if (v > 3.3 && v < 8.3) p.wave('R', T.wave * (1 - T.down), v);
      p.group.scale.setScalar(Math.max(0.001, grow(v > 8.3 ? T.back : 1 - T.out)));
      box.visible = carrying;
      if (carrying) { p.fistMid('R', W); p.fistMid('L', W2); W.add(W2).multiplyScalar(0.5); group.worldToLocal(W); box.position.set(W.x, W.y - 0.05 * u, W.z); box.rotation.y = p.group.rotation.y; box.position.add(W2.set(Math.sin(p.group.rotation.y), 0, Math.cos(p.group.rotation.y)).multiplyScalar(0.07 * u)); }
      wisps(smoke, 0, 6, hx + 0.25 * u, floor + H.h + 0.35 * u, t, u, { period: 2.0, rise: 0.45, size: 1.0, on: pre ? 0 : T.light * (1 - T.dark) }); smoke.commit();
      pop(heart, pre ? 0 : between(v, 3.8, 4.1) * (1 - between(v, 6.6, 6.9)), hx - 0.05 * u, floor + H.h + 0.48 * u + 0.03 * u * Math.sin(v * 3), hz + 0.3 * u);
    },
  };
}

// ---- 帰 / 帰る ----
function homeGreet(ctx, spec, stage) {
  if (spec.outcome === 'bird') return birdHome(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.6 * u, hz = -0.3 * u;
  const H = shell(u, { h: 0.88, dh: 0.74, dw: 0.28, dx: -0.18, wy: 0.58, roof: 0xb04a3a }), dad = person(spec.who ?? 'suitMan', u, 0.72), kid = person(spec.kid ?? 'gal', u, 0.42);
  const bag = briefcase(u), spill = solidProp([[G.box(0.3 * u, 0.004 * u, 0.4 * u, 0, 0.002 * u, 0.2 * u), 0xffd880]], 1.0), hs = many(HEART(u, 0.08), 3, 1);
  const hi = speech(u, 'ただいま!', { h: 0.15 }), welcome = speech(u, 'おかえり!', { h: 0.15, flip: true });
  H.group.position.set(hx, floor, hz); H.light(1);
  const door = [hx + H.doorX, hz + H.front], start = [hx + 1.0 * u, 0.35 * u], stop = [door[0] + 0.5 * u, door[1] + 0.32 * u], meet = [door[0] + 0.22 * u, door[1] + 0.32 * u];
  spill.position.set(door[0], floor, door[1]);
  group.add(H.group, spill, dad.group, kid.group, bag, hs, hi, welcome);
  const loop = 9.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.2, 1.7, 'linear'], open: [2.0, 0.4], run: [2.4, 0.6, 'linear'], hug: [3.0, 0.4], unhug: [5.0, 0.4], inK: [5.5, 0.9, 'linear'], inD: [5.8, 1.2, 'linear'], shut: [7.2, 0.4], back: [8.3, 0.6] });
      H.door.rotation.y = -1.5 * T.open * (1 - T.shut); spill.scale.set(1, 1, Math.max(0.001, T.open * (1 - T.shut))); spill.visible = T.open * (1 - T.shut) > 0.01;
      // dad walks up the path at dusk and calls out
      const dIn = v > 5.8 && v < 8.3;
      if (pre || v < 0.2 || v > 8.3) { dad.pose('Idle', t); dad.group.position.set(start[0], floor, start[1]); dad.group.rotation.y = LEFT + 0.3; }
      else if (v < 1.9) { dad.pose('Walk', v); along(dad, start, stop, T.walk, floor); }
      else if (!dIn) { dad.pose('Idle', t); dad.group.position.set(stop[0], floor, stop[1]); dad.group.rotation.y = LEFT + 0.4 * (1 - T.hug); }
      else { dad.pose('Walk', v); const a = v < 6.6 ? stop : [door[0] + 0.1 * u, door[1] + 0.15 * u]; along(dad, a, v < 6.6 ? [door[0] + 0.1 * u, door[1] + 0.15 * u] : [door[0] + 0.1 * u, door[1] - 0.25 * u], v < 6.6 ? between(v, 5.8, 6.6) : between(v, 6.6, 7.1), floor); }
      dad.group.visible = !(v > 7.1 && v < 8.3); dad.group.scale.setScalar(Math.max(0.001, grow(v > 8.3 ? T.back : 1)));
      // the door opens and his little girl runs out to him
      const kOut = !pre && v > 2.4 && v < 6.4;
      kid.group.visible = kOut;
      if (v < 3.0) { kid.pose('Run', v); along(kid, [door[0] + 0.1 * u, door[1] - 0.15 * u], meet, T.run, floor); }
      else if (v < 5.5) { kid.pose('Idle', t); kid.group.position.set(meet[0], floor, meet[1]); kid.group.rotation.y = RIGHT; }
      else { kid.pose('Walk', v); along(kid, meet, [door[0] + 0.1 * u, door[1] - 0.25 * u], T.inK, floor); }
      // the hug: he bends down, her arms round his waist, his hands on her back
      const hug = T.hug * (1 - T.unhug);
      if (hug > 0) {
        dad.bow(0.35 * hug); kid.turn('Head', -0.3 * hug);
        kid.handTo('R', dad.local(0.1, 0.42, 0.06, W), hug, { out: 0.5, down: 0.6 }); kid.handTo('L', dad.local(-0.1, 0.42, 0.06, W), hug, { out: 0.5, down: 0.6 });
        dad.handTo('L', kid.local(-0.08, 0.6, -0.12, W), hug, { out: 0.7, down: 0.6 });
      }
      sideHold(dad, bag, group);
      hearts(hs, 3, meet[0] + 0.15 * u, floor + 0.75 * u, meet[1], pre ? -1 : v, 3.3, u);
      say(hi, pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 3.0, 3.3)), stop[0] + 0.22 * u, floor + 1.0 * u, stop[1]);
      say(welcome, pre ? 0 : between(v, 3.2, 3.5) * (1 - between(v, 5.0, 5.3)), meet[0] - 0.15 * u, floor + 0.72 * u, meet[1] + 0.08 * u);
    },
  };
}

// ---- 家 ----
function houseBuild(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.65 * u, hz = -0.25 * u;
  const H = shell(u, { w: 1.0, h: 0.82, wx: 0.24 }), p = person(spec.who ?? 'guy', u, 0.64), smoke = many(PUFF(u, 0xe0e0e8), 6, 0.5);
  H.group.position.set(hx, floor, hz);
  group.add(H.group, smoke, p.group);
  const loop = 8.6, door = [hx + H.doorX, hz + H.front], start = [hx + 1.0 * u, 0.3 * u], step = [door[0] + 0.1 * u, door[1] + 0.22 * u], ins = [door[0] + 0.1 * u, door[1] - 0.25 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // the house builds itself: walls rise, the roof drops on (while the strokes draw, and again each loop)
      const T = timeline(v, { walls: [0.0, 0.8, 'out'], roof: [0.8, 0.5, 'bounce'], walk: [1.3, 1.6, 'linear'], open: [2.5, 0.4], enter: [2.9, 0.6, 'linear'], shut: [3.6, 0.4], light: [3.9, 0.3], sink: [7.7, 0.6, 'in'] });
      const wallsK = pre ? between(A.setup, 0, 0.7) : T.walls * (1 - T.sink), roofK = pre ? between(A.setup, 0.7, 1) : T.roof * (1 - T.sink);
      H.body.scale.y = H.door.scale.y = H.glow.scale.y = Math.max(0.001, wallsK); H.roof.position.y = 0.6 * u * (1 - roofK); H.roof.visible = roofK > 0.01;
      H.door.rotation.y = -1.5 * T.open * (1 - T.shut); H.light(T.light * (1 - between(v, 7.4, 7.7)));
      if (pre || v < 1.3) { p.pose('Idle', t); p.group.position.set(start[0], floor, start[1]); p.group.rotation.y = LEFT + 0.4; }
      else if (v < 2.9) { p.pose('Walk', v); along(p, start, step, T.walk, floor); }
      else { p.pose('Walk', v); along(p, step, ins, T.enter, floor); }
      p.group.visible = pre || v < 3.6 || v > 8.0; p.group.scale.setScalar(Math.max(0.001, grow(v > 8.0 ? between(v, 8.0, 8.5) : 1)));
      if (v > 8.0) { p.group.position.set(start[0], floor, start[1]); p.group.rotation.y = LEFT + 0.4; }
      wisps(smoke, 0, 6, hx + 0.28 * u, floor + H.h + 0.36 * u, t, u, { period: 2.0, rise: 0.45, size: 1.0, on: pre ? 0 : T.light * (1 - between(v, 7.4, 7.7)) }); smoke.commit();
    },
  };
}

// ---- 宿 ----
function innSleep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.7 * u, hz = -0.3 * u;
  const H = shell(u, { w: 1.0, h: 0.8, dw: 0.28, dh: 0.66, dx: -0.22, wx: 0.22, wall: 0xf2ead6, roof: 0x4a4e5a, roofH: 0.24, chimney: false, door: null });
  const p = person(spec.who ?? 'guy3', u, 0.62), bag = solidProp([[G.box(0.08 * u, 0.2 * u, 0.26 * u, 0, -0.13 * u, 0), 0x2a6a5a], [G.box(0.02 * u, 0.04 * u, 0.08 * u, 0, -0.02 * u, 0), 0x1a1a24]], 0.4);
  const noren = many([[G.box(0.13 * u, 0.24 * u, 0.012 * u, 0, -0.12 * u, 0), 0x2a3a7a], [G.box(0.13 * u, 0.025 * u, 0.014 * u, 0, -0.2 * u, 0), 0xffffff]], 2, 0.4);
  const sign = label(u, 'やど', '#5a3a20', 0.16), lamp = solidProp([[G.sphere(0.075 * u, 0, 0, 0, 1, 1.35, 1), 0xe03a2a], [G.cyl(0.05 * u, 0.05 * u, 0.025 * u, 0, 0.1 * u, 0), 0x2a2a30], [G.cyl(0.05 * u, 0.05 * u, 0.025 * u, 0, -0.1 * u, 0), 0x2a2a30], [G.cyl(0.004 * u, 0.004 * u, 0.1 * u, 0, 0.16 * u, 0), 0x2a2a30]], 0.9), zzz = emblemProp('zzz', 0.3 * u), moon = emblemProp('crescent', 0.2 * u, { color: '#ffe680' });
  H.group.position.set(hx, floor, hz);
  const door = [hx + H.doorX, hz + H.front], start = [hx + 1.05 * u, 0.3 * u], step = [door[0], door[1] + 0.22 * u], ins = [door[0], door[1] - 0.2 * u], win = [hx + H.win[0], hz + H.front - 0.14 * u];
  sign.position.set(door[0], floor + 0.74 * u, door[1] + 0.02 * u); lamp.position.set(door[0] + 0.24 * u, floor + 0.6 * u, door[1] + 0.07 * u);
  group.add(H.group, noren, sign, lamp, p.group, bag, zzz, moon);
  const loop = 9.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.2, 1.7, 'linear'], nod: [2.0, 0.4], enter: [2.5, 0.8, 'linear'], light: [3.4, 0.3], yawn: [3.9, 0.4], unyawn: [4.8, 0.3], dark: [5.4, 0.3], back: [8.6, 0.6] });
      const lift = pre ? 0 : bump(v, 2.6, 0.8);
      for (let i = 0; i < 2; i++) noren.set(i, door[0] + (i ? 0.07 : -0.07) * u, floor + 0.66 * u, door[1] + 0.02 * u, 1, 0, 0, -1.1 * lift);
      noren.commit();
      H.light(T.light * (1 - T.dark));
      // the traveller walks up, bows at the door, goes in through the noren; he yawns at the lit window; the light goes out
      if (pre || v < 0.2 || v > 8.6) { p.pose('Idle', t); p.group.position.set(start[0], floor, start[1]); p.group.rotation.y = LEFT + 0.3; }
      else if (v < 2.0) { p.pose('Walk', v); along(p, start, step, T.walk, floor); }
      else if (v < 2.5) { p.pose('Idle', t); p.group.position.set(step[0], floor, step[1]); p.group.rotation.y = Math.PI; }
      else if (v < 3.3) { p.pose('Walk', v); along(p, step, ins, T.enter, floor); }
      else { p.pose('Idle', t); p.group.position.set(win[0], floor, win[1]); p.group.rotation.y = 0; }
      if (v > 3.3 && v < 5.6) { p.toMouth('R', T.yawn * (1 - T.unyawn)); p.turn('Head', -0.25 * T.yawn * (1 - T.unyawn)); }
      p.group.visible = pre || v < 3.3 || (v > 3.4 && v < 5.6) || v > 8.6; p.group.scale.setScalar(Math.max(0.001, grow(v > 8.6 ? T.back : 1)));
      bag.visible = p.group.visible && (pre || v < 3.3 || v > 8.6); sideHold(p, bag, group);
      const z = pre ? 0 : between(v, 5.8, 6.1) * (1 - between(v, 8.3, 8.6));
      sc(zzz, z); zzz.scale.multiplyScalar(0.45 * u); zzz.position.set(win[0] + 0.1 * u, floor + 0.85 * u, hz + H.front + 0.15 * u); zzz.idle(v);
      sc(moon, pre ? 0 : between(v, 3.0, 3.6) * (1 - between(v, 8.6, 9.0))); moon.scale.multiplyScalar(0.2 * u); moon.position.set(hx + 0.4 * u, floor + 1.3 * u, hz); moon.idle(0);
    },
  };
}

// ---- 部屋 ----
function myRoom(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rx = B.maxX + 0.75 * u, rz = -0.15 * u, Wd = 1.2 * u, D = 0.75 * u, Ht = 0.95 * u;
  const room = solidProp([[G.box(Wd, 0.03 * u, D, 0, 0.015 * u, 0), 0xc89a60], [G.box(Wd, Ht, 0.03 * u, 0, Ht / 2, -D / 2), 0xf4d8e0], [G.box(0.03 * u, Ht, D, -Wd / 2, Ht / 2, 0), 0xe8c8d4],
    [G.box(0.26 * u, 0.22 * u, 0.01 * u, 0.15 * u, 0.55 * u, -D / 2 + 0.02 * u), 0x9ad4ff], [G.box(0.28 * u, 0.02 * u, 0.02 * u, 0.15 * u, 0.55 * u, -D / 2 + 0.025 * u), 0xffffff], [G.box(0.02 * u, 0.22 * u, 0.02 * u, 0.15 * u, 0.55 * u, -D / 2 + 0.025 * u), 0xffffff]], 0.35);
  room.position.set(rx, floor, rz);
  const items = [
    solidProp([[G.sphere(0.07 * u, 0, 0.07 * u, 0), 0xa86a3a], [G.sphere(0.055 * u, 0, 0.18 * u, 0.01 * u), 0xa86a3a], ...[-1, 1].map((s) => [G.sphere(0.02 * u, s * 0.04 * u, 0.23 * u, 0), 0xa86a3a]), ...[-1, 1].map((s) => [G.sphere(0.028 * u, s * 0.06 * u, 0.03 * u, 0.04 * u), 0xc88a5a]), [G.sphere(0.018 * u, 0, 0.165 * u, 0.055 * u), 0xe8c8a0]], 0.45),
    solidProp([[G.box(0.5 * u, 0.12 * u, 0.26 * u, 0, 0.1 * u, 0), 0xffffff], [G.box(0.5 * u, 0.06 * u, 0.26 * u, 0, 0.03 * u, 0), 0x8a5a30], [G.box(0.36 * u, 0.04 * u, 0.27 * u, 0.06 * u, 0.17 * u, 0), 0xff8ab0], [G.box(0.1 * u, 0.05 * u, 0.18 * u, -0.18 * u, 0.18 * u, 0), 0xfff4f8], [G.box(0.04 * u, 0.24 * u, 0.26 * u, -0.25 * u, 0.12 * u, 0), 0x8a5a30]], 0.4),
    solidProp([[G.box(0.3 * u, 0.025 * u, 0.18 * u, 0, 0.3 * u, 0), 0xb07a4a], ...[-0.13, 0.13].map((x) => [G.box(0.025 * u, 0.3 * u, 0.16 * u, x * u, 0.15 * u, 0), 0x9a6a3a]), [G.box(0.12 * u, 0.02 * u, 0.12 * u, 0, 0.17 * u, 0.15 * u), 0x4a8ad8], [G.box(0.12 * u, 0.14 * u, 0.02 * u, 0, 0.25 * u, 0.2 * u), 0x4a8ad8], [G.box(0.08 * u, 0.012 * u, 0.06 * u, -0.06 * u, 0.32 * u, 0), 0xffffff]], 0.4),
    solidProp([[G.cyl(0.04 * u, 0.05 * u, 0.02 * u, 0, 0.01 * u, 0), 0x404050], [G.cyl(0.008 * u, 0.008 * u, 0.42 * u, 0, 0.22 * u, 0), 0x404050], [G.cone(0.08 * u, 0.1 * u, 0, 0.45 * u, 0), 0xffe070]], 0.9),
    solidProp([[G.box(0.2 * u, 0.26 * u, 0.01 * u, 0, 0, 0), 0x6a4ac0], [G.sphere(0.05 * u, 0, 0.03 * u, 0.006 * u, 1, 1, 0.2), 0xffe040], [G.box(0.14 * u, 0.02 * u, 0.012 * u, 0, -0.08 * u, 0), 0xffffff]], 0.6),
  ];
  const at = [[rx - 0.05 * u, floor + 0.03 * u, rz + 0.18 * u], [rx - 0.25 * u, floor + 0.03 * u, rz - 0.18 * u], [rx + 0.36 * u, floor + 0.03 * u, rz - 0.22 * u], [rx - 0.48 * u, floor + 0.03 * u, rz - 0.25 * u], [rx - 0.15 * u, floor + 0.6 * u, rz - D / 2 + 0.03 * u]];
  const kid = person(spec.who ?? 'gal2', u, 0.55), hs = many(HEART(u, 0.09), 3, 1), yay = label(u, 'やったー!', '#e0407a', 0.13);
  group.add(room, ...items, kid.group, hs, yay);
  const loop = 8.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // the room fills up one thing at a time; she walks in, looks round and jumps for joy (twice)
      items.forEach((m, i) => { const k = pre ? 0 : between(v, 0.2 + 0.35 * i, 0.5 + 0.35 * i) * (1 - between(v, 7.7, 8.1)); sc(m, k); if (i === 0) m.scale.setScalar(Math.max(0.001, grow(k))); m.position.set(...at[i]); });
      const T = timeline(v, { walk: [2.0, 1.4, 'linear'], turn: [3.4, 0.3], out: [7.2, 0.4] }), x0 = rx + 0.8 * u, x1 = rx + 0.12 * u, z = rz + 0.2 * u;
      const jump = !pre && v > 4.6 && v < 6.6, jt = jump ? (v - 4.6) % 1.0 : 0;
      if (pre || v < 2.0) { kid.pose('Idle', t); kid.group.position.set(x0, floor, z); kid.group.rotation.y = LEFT; }
      else if (v < 3.4) { kid.pose('Walk', v); kid.group.position.set(lerp(x0, x1, T.walk), floor, z); kid.group.rotation.y = LEFT; }
      else { kid.pose('Idle', t); kid.group.position.set(x1, floor + (jump ? 0.1 * u * Math.sin(Math.PI * jt) : 0), z); kid.group.rotation.y = LEFT + T.turn * (Math.PI / 2 - 0.2); }
      if (jump) armsUp(kid, Math.min(1, (v - 4.6) * 4, (6.6 - v) * 4));
      if (!pre && v > 3.6 && v < 4.6) kid.turn('Head', 0, 0.6 * Math.sin((v - 3.6) * Math.PI * 2));
      kid.group.visible = !pre && v > 1.9 && v < 7.6; kid.group.scale.setScalar(Math.max(0.001, grow(Math.min(between(v, 1.9, 2.2), 1 - T.out))));
      hearts(hs, 3, x1, floor + 0.62 * u, z, pre ? -1 : v, 4.7, u);
      pop(yay, pre ? 0 : between(v, 4.6, 4.9) * (1 - between(v, 6.6, 6.9)), x1 + 0.05 * u, floor + 0.8 * u, z + 0.1 * u);
    },
  };
}

// ---- お手洗い ----
function toiletDash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.45 * u, bz = -0.25 * u;
  const H = shell(u, { w: 0.5, h: 0.9, d: 0.45, dw: 0.3, dh: 0.74, dx: 0, ww: 0, wall: 0xd8e4f0, roof: 0x8a96a8, door: 0x3a7ad8, roofH: 0 });
  const wc = label(u, 'WC', '#2a5ac0', 0.14), p = person(spec.who ?? 'guy3', u, 0.62), drops = many(DROP(u), 5, 0.8);
  const sx = bx + 1.0 * u, sz = 0.1 * u, sink = solidProp([[G.cyl(0.035 * u, 0.045 * u, 0.32 * u, 0, 0.16 * u, 0), 0xf4f4f8], [G.cyl(0.13 * u, 0.08 * u, 0.08 * u, 0, 0.36 * u, 0), 0xf4f4f8], [G.cyl(0.11 * u, 0.11 * u, 0.01 * u, 0, 0.4 * u, 0), 0x9ad4ff],
    [G.cyl(0.012 * u, 0.012 * u, 0.12 * u, 0, 0.46 * u, -0.1 * u), 0xc8ccd4], [G.box(0.014 * u, 0.014 * u, 0.08 * u, 0, 0.52 * u, -0.06 * u), 0xc8ccd4]], 0.45);
  sink.position.set(sx, floor, sz);
  const hurry = label(u, '!!', '#e03030', 0.15), flush = label(u, 'ジャー', '#3a8ad8', 0.13), phew = label(u, 'ふう〜', '#40a060', 0.13);
  H.group.position.set(bx, floor, bz); wc.position.set(bx, floor + 0.8 * u, bz + H.front + 0.02 * u); H.light(0.6);
  group.add(H.group, wc, sink, drops, p.group, hurry, flush, phew);
  const loop = 10.4, door = [bx, bz + H.front], wait = [bx + 0.5 * u, door[1] + 0.25 * u], step = [bx, door[1] + 0.2 * u], ins = [bx, door[1] - 0.22 * u], wash = [sx, sz - 0.2 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [1.7, 0.3], dash: [1.9, 0.6, 'in'], shut: [2.5, 0.3], open2: [4.4, 0.4], out: [4.6, 0.7, 'linear'], shut2: [5.4, 0.3], toSink: [5.5, 1.0, 'linear'], home: [9.1, 1.1, 'linear'] });
      H.door.rotation.y = -1.5 * (T.open * (1 - T.shut) + T.open2 * (1 - T.shut2));
      // hopping from foot to foot, knees together, hands pressed low in front
      if (pre || v < 1.9) {
        const hop = pre ? 0.5 : 1; p.pose('Idle', 0.4); p.group.position.set(wait[0], floor + 0.035 * u * hop * Math.abs(Math.sin(v * 7)), wait[1]); p.group.rotation.y = LEFT + 0.6;
        p.turn('UpperLegL', -0.12 * hop * Math.sin(v * 7)); p.turn('UpperLegR', 0.12 * hop * Math.sin(v * 7)); p.turn('Abdomen', 0.15 * hop);
        p.handTo('R', p.local(-0.04, 0.34, 0.15, W), hop, { out: 0.5, down: 0.9 }); p.handTo('L', p.local(0.04, 0.34, 0.15, W), hop, { out: 0.5, down: 0.9 });
      } else if (v < 2.5) { p.pose('Run', v * 1.2); along(p, between(v, 1.9, 2.1) < 1 ? wait : step, between(v, 1.9, 2.1) < 1 ? step : ins, between(v, 1.9, 2.1) < 1 ? between(v, 1.9, 2.1) : between(v, 2.1, 2.5), floor); }
      else if (v < 5.3) { p.pose('Walk', v); along(p, ins, step, T.out, floor); }
      else if (v < 6.5) { p.pose('Walk', v); along(p, step, wash, T.toSink, floor); }
      else if (v < 9.1) {
        // he washes his hands under the tap, rubbing them, then shakes them dry
        p.pose('Idle', t); p.group.position.set(wash[0], floor, wash[1]); p.group.rotation.y = 0;
        const k = between(v, 6.5, 6.8) * (1 - between(v, 8.2, 8.4)), r = 0.025 * Math.sin(v * 12);
        p.handTo('R', p.local(-0.04 + r, 0.5, 0.33, W), k, { out: 0.6, down: 0.8 }); p.handTo('L', p.local(0.04 + r, 0.5, 0.33, W), k, { out: 0.6, down: 0.8 }); p.turn('Head', 0.35 * k);
        const sh = bump(v, 8.3, 0.7); p.handTo('R', p.local(-0.22, 0.45 + 0.04 * Math.sin(v * 30), 0.2, W), sh, { out: 0.8, down: 0.6 }); p.handTo('L', p.local(0.22, 0.45 + 0.04 * Math.sin(v * 30 + 1), 0.2, W), sh, { out: 0.8, down: 0.6 });
      } else { p.pose('Walk', v); along(p, wash, wait, T.home, floor); if (v > 10.0) p.group.rotation.y = LEFT + 0.6; }
      p.group.visible = pre || v < 2.45 || v > 4.6;
      for (let i = 0; i < 5; i++) { const f = ((v * 1.6 + i / 5) % 1 + 1) % 1, on = !pre && v > 6.6 && v < 8.2; drops.set(i, sx, floor + 0.5 * u - 0.12 * u * f, sz - 0.02 * u, on ? 0.6 : 0); }
      drops.commit();
      pop(hurry, pre ? 0 : (v < 1.9 ? 1 : 0) * between(v, 0.1, 0.3), wait[0] + 0.05 * u, floor + 0.78 * u + 0.02 * u * Math.sin(v * 9), wait[1]);
      pop(flush, pre ? 0 : between(v, 3.0, 3.2) * (1 - between(v, 4.1, 4.3)), bx + 0.05 * u, floor + 1.05 * u, door[1]);
      pop(phew, pre ? 0 : between(v, 4.9, 5.1) * (1 - between(v, 6.3, 6.5)), step[0] + 0.15 * u, floor + 0.8 * u, step[1] + 0.05 * u);
    },
  };
}

export const SCENES = { 'q-move-in': moveIn, 'q-home-greet': homeGreet, 'q-house-build': houseBuild, 'q-inn-sleep': innSleep, 'q-my-room': myRoom, 'q-toilet-dash': toiletDash };
