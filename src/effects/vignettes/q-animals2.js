// Model scenes, animals (Step 3a model pass): Quaternius animals with their own clips.
//   q-dogout   外: a little house on a lawn; the door swings open, a Shiba bounds out into the yard, sniffs a flower, trots back in
//              and the door shuts
//   q-tent     入: a Shiba trots into a little tent, the flap drops, the tent wiggles, its head pokes out; outcome house: a
//              person walks up to a house and in through the door, which shuts (入る); doors: glass doors under an
//              いりぐち sign slide open as a person walks in (入り口); post: a person pushes a letter into a red postbox (入れる)
//   q-whale    大きな: behind a little sailing boat a whale many times its size rises out of the sea, blows a spout and
//              dives, tail last; the boat rocks in its wake
//   q-parade   動物: a cow, a sheep and a dog go past one after another, each stops and calls (モー メー ワン)
//   q-pets     鳴く: a dog barks ワン! and a cow answers モー
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { many } from '../pieces/kit-things.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { RIGHT, LEFT, lerp, label, pop, person, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3();
const tri = () => { const s = new THREE.Shape(); s.moveTo(-1, 0); s.lineTo(1, 0); s.lineTo(0, 1); s.lineTo(-1, 0); return s; };
// a little house facing you: walls, a roof, a dark doorway (the door is the scene's own, hinged at x = -dw / 2)
function cottage(u, { w = 0.62, h = 0.48, d = 0.45, dw = 0.18, dh = 0.3, dx = -0.12, yard = null } = {}) {
  const k = (x) => x * u, r = tri();
  return solidProp([[G.box(k(w), k(h), k(d), 0, k(h / 2), 0), 0xf3e2c4], [G.extrude(r, 1).scale(k(w / 2 + 0.05), k(0.26), k(d + 0.06)).translate(0, k(h), 0), 0xc8443a],
    [G.box(k(dw), k(dh), k(0.01), k(dx), k(dh / 2), k(d / 2 + 0.002)), 0x2a1c14], [G.box(k(0.14), k(0.12), k(0.01), k(0.16), k(0.28), k(d / 2 + 0.002)), 0xffd070], ...(yard ?? [])], 0.35);
}
const door = (u, dw = 0.18, dh = 0.3, color = 0x8a5a30) => solidProp([[G.box(dw * u, dh * u, 0.02 * u, dw * u / 2, dh * u / 2, 0), color], [G.sphere(0.012 * u, dw * u * 0.82, dh * u * 0.5, 0.015 * u), 0xf0c040]], 0.35);

// ---- 外 ----
function dogOut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.7 * u, S = 1.4, hz = 0.0;   // S: house scale (the dog stays 0.42 u, the house is about 3 dogs tall)
  // the house stands at the back of a green lawn (one mesh with it), a stepping-stone path from the door
  const lawn = [[G.box(2.0 * u, 0.02 * u, 1.5 * u, 0.4 * u, -0.01 * u, 0.4 * u), 0x5aa83a], [G.box(2.0 * u, 0.07 * u, 1.5 * u, 0.4 * u, -0.055 * u, 0.4 * u), 0x8a5a34],
    ...[0, 1, 2].map((i) => [G.cyl(0.05 * u, 0.05 * u, 0.01 * u, -0.17 * u, 0.002 * u, (0.45 + 0.15 * i) * u), 0xd8d0c0])];
  const house = cottage(u, { w: 0.62 * S, h: 0.48 * S, d: 0.45 * S, dw: 0.18 * S, dh: 0.3 * S, dx: -0.12 * S, yard: lawn }), d = door(u, 0.18 * S, 0.3 * S), dog = createModel('shiba', { height: 0.42 * u });
  const flower = solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.16 * u, 0, 0.08 * u, 0), 0x3a9a3a], [G.sphere(0.03 * u, 0.02 * u, 0.05 * u, 0, 1.4, 0.4, 0.8), 0x3a9a3a], ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.03 * u, 0.035 * u * Math.cos(i * 1.26), 0.17 * u + 0.035 * u * Math.sin(i * 1.26), 0), 0xff6a9a]), [G.sphere(0.025 * u, 0, 0.17 * u, 0.01 * u), 0xffd040]], 0.5);
  house.position.set(hx, floor, hz * u); d.position.set(hx - 0.21 * S * u, floor, hz * u + 0.235 * S * u);
  // the dog stops in the yard facing right and a little toward you; the flower stands just under its nose
  dog.group.updateWorldMatrix(true, true);
  const nose = new THREE.Box3().setFromObject(dog.group).max.z - dog.group.position.z, sniffYaw = RIGHT - 0.3;
  const sniff = label(u, 'クンクン', '#6a8a3a', 0.11);
  group.add(house, d, dog.group, flower, sniff);
  const loop = 7.4, door0 = [hx - 0.12 * S * u, hz * u + 0.26 * S * u], yard = [hx + 0.75 * u, 0.5 * u];
  flower.position.set(yard[0] + 0.92 * nose * Math.sin(sniffYaw), floor, yard[1] + 0.92 * nose * Math.cos(sniffYaw));
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.5, 'out'], out: [0.6, 1.0, 'linear'], shut1: [1.8, 0.5], open2: [4.4, 0.5, 'out'], back: [4.8, 1.3, 'linear'], shut: [6.3, 0.5] });
      d.rotation.y = -1.6 * (T.open * (1 - T.shut1) + T.open2 * (1 - T.shut));
      const out = T.out * (1 - T.back), inside = pre || v < 0.6 || v > 6.1;
      dog.group.visible = !inside;
      const running = !pre && (T.out > 0 && T.out < 1), trotting = !pre && T.back > 0 && T.back < 1;
      dog.pose(running ? 'Gallop' : trotting ? 'Walk' : (!pre && v > 1.8 && v < 4.4) ? 'Eating' : 'Idle', v);
      dog.group.position.set(lerp(door0[0], yard[0], out), floor, lerp(door0[1], yard[1], out));
      dog.group.rotation.y = trotting ? Math.atan2(door0[0] - yard[0], door0[1] - yard[1]) : running ? Math.atan2(yard[0] - door0[0], yard[1] - door0[1]) : turnTo(Math.atan2(yard[0] - door0[0], yard[1] - door0[1]), sniffYaw, between(v, 1.6, 1.9));
      pop(sniff, pre ? 0 : between(v, 2.2, 2.4) * (1 - between(v, 3.9, 4.1)), yard[0] + 0.3 * u, floor + 0.55 * u, 0.3 * u);
    },
  };
}

// ---- 入 / 入る / 入り口 / 入れる ----
function tent(ctx, spec, stage) {
  const o = spec.outcome;
  if (o === 'house' || o === 'doors') return walkIn(ctx, spec, stage);
  if (o === 'post') return post(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.55 * u, r = tri();
  // the Kenney canvas tent (open A-frame, entrance toward you); a canvas flap hangs from its ridge over the entrance, and a
  // back panel closes the rear so the dog is hidden once the flap is down
  const TH = 0.62 * u, HW = 0.354 * u, canvas = 0xe39a3c, shell = new THREE.Group(), tentM = createModel('tentCanvas', { height: TH });
  const back = solidProp([[G.extrude(r, 1).scale(HW * 0.96, TH * 0.94, 0.01 * u).translate(0, 0, 0), canvas]], 0.4), flap = new THREE.Group();
  const flapM = solidProp([[G.extrude(r, 1).scale(HW * 0.95, TH * 0.95, 0.012 * u).translate(0, -TH * 0.95, 0), canvas]], 0.4);
  flap.add(flapM); flap.position.set(0, TH * 0.95, HW + 0.004 * u); back.position.set(0, 0, -HW + 0.004 * u);
  shell.add(tentM.group, back, flap);
  const dog = createModel('shiba', { height: 0.38 * u }), tz = -0.05 * u, zIn = tz, zPeek = tz + 0.18 * u, z0 = tz + 0.62 * u, x0 = tx + 0.9 * u;
  shell.position.set(tx, floor, tz);
  group.add(shell, dog.group);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { x: [0, 0.9, 'linear'], turn: [0.9, 0.3], in: [1.2, 0.7, 'linear'], drop: [2.1, 0.4, 'out'], peek: [3.6, 0.7, 'out'], out: [5.0, 0.7, 'linear'], round: [5.7, 0.8] });
      // the flap hangs over the entrance: rolled up while the dog goes in, down behind it, rolled up for the peek
      const hang = T.drop * (1 - T.peek);
      flap.visible = hang > 0.04; flap.scale.set(Math.max(0.04, hang), Math.max(0.04, hang), 1);
      const wiggle = pre ? 0 : bump(v, 2.7, 0.8);
      shell.rotation.z = 0.06 * Math.sin(v * 25) * wiggle;
      let x, z, yaw, clip = 'Walk';
      if (pre || v < 1.2) { x = lerp(x0, tx, pre ? 0 : T.x); z = z0; yaw = turnTo(LEFT, Math.PI, pre ? 0 : T.turn); clip = !pre && T.x >= 1 && T.turn <= 0 ? 'Idle' : 'Walk'; }
      else if (v < 2.9) { x = tx; z = lerp(z0, zIn, T.in); yaw = Math.PI; clip = T.in < 1 ? 'Walk' : 'Idle'; }
      else if (v < 5.0) { x = tx; yaw = 0; clip = 'Idle'; z = lerp(zIn, zPeek, T.peek); }
      else { x = tx; z = lerp(zPeek, z0, T.out); yaw = 0; clip = T.out < 1 ? 'Walk' : 'Idle'; if (T.round > 0) { x = lerp(tx, x0, T.round); yaw = turnTo(0, RIGHT, between(v, 5.7, 5.9)); clip = 'Walk'; } }
      dog.pose(clip, v); dog.group.position.set(x, floor, z); dog.group.rotation.y = yaw;
    },
  };
}
function walkIn(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.55 * u, doors = spec.outcome === 'doors';
  const p = person(spec.who, u, 0.55);
  const house = doors ? solidProp([[G.box(0.9 * u, 0.62 * u, 0.3 * u, 0, 0.31 * u, -0.15 * u), 0xd8dde6], [G.box(0.42 * u, 0.44 * u, 0.01 * u, 0, 0.22 * u, 0.006 * u), 0x203040], [G.box(0.5 * u, 0.12 * u, 0.02 * u, 0, 0.53 * u, 0.01 * u), 0x2a6a3a]], 0.4) : cottage(u, { w: 0.7, h: 0.66, dw: 0.24, dh: 0.52, dx: -0.1 });
  const d = doors ? null : door(u, 0.24, 0.52), sign = doors ? label(u, 'いりぐち', '#2a6a3a', 0.09) : null;
  const panes = doors ? [0, 1].map(() => solidProp([[G.box(0.2 * u, 0.42 * u, 0.012 * u, 0, 0.21 * u, 0), 0xbfe0ff], [G.box(0.2 * u, 0.02 * u, 0.014 * u, 0, 0.42 * u, 0), 0x8a94a4]], 0.5)) : [];
  for (const m of panes) { m.material.transparent = true; m.material.opacity = 0.55; }
  house.position.set(hx, floor, -0.2 * u);
  if (d) d.position.set(hx - 0.22 * u, floor, -0.2 * u + 0.235 * u);
  group.add(house, p.group, ...(d ? [d] : []), ...(sign ? [sign] : []), ...panes);
  const loop = 6.4, doorX = hx + (doors ? 0 : -0.1 * u), doorZ = -0.2 * u + (doors ? 0.02 : 0.24) * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 2.0, 'linear'], open: [1.3, 0.5, 'out'], enter: [2.0, 1.2, 'linear'], shut: [3.4, 0.5] });
      const walk = !pre && v < 3.2;
      p.pose(walk ? 'Walk' : 'Idle', v);
      const x = lerp(doorX + 0.85 * u, doorX, pre ? 0 : T.come), z = lerp(0.35 * u, doorZ + 0.15 * u, pre ? 0 : T.come) - 0.35 * u * T.enter;
      p.group.position.set(x, floor, z); p.group.rotation.y = T.come < 1 ? LEFT + 0.55 : Math.PI;
      p.group.visible = pre || T.enter < 0.85;
      const o = T.open * (1 - T.shut);
      if (d) d.rotation.y = -1.5 * o;
      else {
        panes[0].position.set(hx - 0.1 * u - 0.19 * u * o, floor, -0.2 * u + 0.02 * u); panes[1].position.set(hx + 0.1 * u + 0.19 * u * o, floor, -0.2 * u + 0.022 * u);
        sign.position.set(hx, floor + 0.53 * u, -0.2 * u + 0.03 * u); sign.visible = true;
      }
    },
  };
}
function post(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.4 * u;
  const p = person(spec.who, u, 0.85);
  const box = solidProp([[G.cyl(0.13 * u, 0.13 * u, 0.5 * u, 0, 0.25 * u, 0, 0, 0, 0, 24), 0xd8302a], [G.sphere(0.13 * u, 0, 0.5 * u, 0, 1, 0.5, 1), 0xd8302a], [G.box(0.14 * u, 0.025 * u, 0.02 * u, 0, 0.42 * u, 0.125 * u), 0x1a1a1a], [G.box(0.18 * u, 0.06 * u, 0.04 * u, 0, 0.02 * u, 0), 0x2a2a2a]], 0.45);
  const letter = solidProp([[G.box(0.16 * u, 0.1 * u, 0.008 * u, 0, 0, 0), 0xfaf6ea], [G.box(0.03 * u, 0.03 * u, 0.01 * u, 0.05 * u, 0.025 * u, 0.001 * u), 0xe04848]], 0.6);
  box.position.set(bx, floor, 0.05 * u); box.rotation.y = 0.5;
  group.add(box, p.group, letter);
  const loop = 6.0, slot = new THREE.Vector3(), mid = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [0.8, 0.8], push: [1.8, 0.6, 'in'], back: [2.6, 0.6] });
      p.pose('Idle', t);
      p.group.position.set(bx + 0.45 * u, floor, 0.12 * u); p.group.rotation.y = LEFT + 0.6;
      box.localToWorld(slot.set(0, 0.42 * u, 0.13 * u)); group.localToWorld(W.set(0, 0, 0));
      // the letter: in the hand at the chest, to the slot, pushed in until it is gone
      const chest = p.local(-0.1, 0.48, 0.3, new THREE.Vector3()), out = new THREE.Vector3(Math.sin(box.rotation.y), 0, Math.cos(box.rotation.y));
      mid.copy(chest).lerp(slot.clone().addScaledVector(out, 0.1 * u * group.getWorldScale(W).y), T.reach).addScaledVector(out, -0.12 * u * group.getWorldScale(W).y * T.push);
      p.handTo('R', mid.clone().addScaledVector(out, 0.07 * u * group.getWorldScale(W).y), (pre ? A.setup : 1) * (1 - T.back), { out: 0.6, down: 0.7 });
      letter.visible = pre || v < 2.4;
      letter.position.copy(group.worldToLocal(mid.clone())); letter.rotation.set(-Math.PI / 2 * T.reach, box.rotation.y, 0);
      if (!pre && v > 4.6) { letter.visible = true; letter.scale.setScalar(between(v, 4.6, 5.2)); } else letter.scale.setScalar(1);
    },
  };
}

// ---- 大きな ----
// The sea is a block of water with a flat surface tipped toward you, a lighter top skin and white wave crests that bob.
// Everything sits in one tipped rig (origin = the middle of the surface). A little sailing boat rocks on it; a whale many
// times its size lies under the surface (the block is deeper than the whale's whole body), rises in an arc, blows a
// spout, then dives tail last; the boat rocks in its wake.
function whale(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rig = new THREE.Group();
  const wh = createModel('whale', { width: 0.65 * u }), sx = B.maxX + 1.15 * u, sw = 2.2 * u, sd = 1.4 * u, tilt = 0.5;
  const hW = new THREE.Box3().setFromObject(wh.group).getSize(new THREE.Vector3()).y, depth = 1.5 * hW + 0.45 * u;
  const sea = solidProp([[G.box(sw, depth, sd, 0, -depth / 2, 0), 0x1f5fae], [G.box(sw * 1.001, 0.05 * u, sd * 1.001, 0, -0.025 * u, 0), 0x3f94de], [G.box(sw, 0.012 * u, sd, 0, -0.006 * u, 0), 0x6fb8f0]], 0.35);
  const boat = solidProp([[G.box(0.3 * u, 0.07 * u, 0.12 * u, 0, 0.035 * u, 0), 0xc8443a], [G.box(0.24 * u, 0.02 * u, 0.1 * u, 0, 0.08 * u, 0), 0xf3e2c4], [G.cyl(0.007 * u, 0.007 * u, 0.3 * u, 0, 0.23 * u, 0), 0x8a5a30], [G.extrude(tri(), 0.01).scale(0.1 * u, 0.22 * u, 1).translate(0.06 * u, 0.13 * u, 0), 0xffffff]], 0.5);
  const spout = many([[G.sphere(0.07 * u), 0xe8f6ff]], 10, 1.0), wake = many([[G.torus(0.2 * u, 0.012 * u), 0xcfe8ff]], 2, 0.6);
  const NW = 14, crest = many([[G.box(0.2 * u, 0.018 * u, 0.04 * u), 0xf4fbff]], NW, 0.6);   // wave crests
  rig.position.set(sx, floor + 0.2 * u, -0.1 * u); rig.rotation.x = tilt;
  rig.add(sea, wh.group, boat, spout, wake, crest); group.add(rig);
  const loop = 8.0, wz = -0.1 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      wh.pose('Swim', t * 0.7);
      // under the surface while the strokes draw; rises (0.4-2.2), lies along the surface and blows (2.2-4.4), dives (4.4-6.4)
      const T = timeline(v, { rise: [0.4, 1.8, 'out'], dive: [4.4, 2.0, 'in'] }), h = pre ? 0 : T.rise - T.dive;
      const x = 0.15 * u - 0.4 * u * (pre ? 0 : between(v, 0.4, 6.4));
      wh.group.position.set(x, -0.85 * hW + 0.5 * hW * h, wz);
      wh.group.rotation.order = 'YXZ'; wh.group.rotation.set(-0.3 * bump(v, 0.4, 2.0) + 0.2 * bump(v, 4.4, 2.0), LEFT + 0.2, 0);
      wh.group.visible = h > 0.08;
      const roll = bump(v, 1.4, 1.6) + 0.6 * bump(v, 5.0, 1.6);
      boat.position.set(-0.6 * u, -0.01 * u + 0.012 * u * Math.sin(t * 2.2) + 0.05 * u * roll * Math.sin(v * 5), 0.4 * u); boat.rotation.set(0, 0.35, 0.1 * Math.sin(t * 1.7) + 0.25 * roll * Math.sin(v * 5));
      const on = pre ? 0 : between(v, 2.4, 2.6) * (1 - between(v, 3.8, 4.2));
      for (let i = 0; i < 10; i++) { const f = (v * 1.1 + i / 10) % 1; spout.set(i, x - 0.2 * u + (i % 2 ? 1 : -1) * 0.18 * u * f * f, 0.2 * u + 0.7 * u * Math.sin(Math.PI * 0.5 * Math.min(1, f * 1.4)), wz + 0.05 * u, on * (1.4 - f)); }
      spout.commit();
      [[1.2, 0.3], [4.8, -0.2]].forEach(([at, dx], i) => { const f = pre ? 0 : between(v, at, at + 1.6); wake.set(i, dx * u, 0.005 * u, wz, f > 0 && f < 1 ? 0.4 + 1.6 * f : 0, 0, 0, Math.PI / 2); });
      wake.commit();
      for (let i = 0; i < NW; i++) { const px = ((i * 0.37) % 1 - 0.5) * sw * 0.8 + 0.05 * u * Math.sin(t * 0.8 + i), pz = ((i * 0.61) % 1 - 0.5) * sd * 0.8; crest.set(i, px, 0.012 * u + 0.012 * u * Math.sin(t * 1.6 + i * 1.7), pz, 1, 0, 0.3 * Math.sin(i), 0); }
      crest.commit();
    },
  };
}

// ---- 動物 ----
function parade(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u;
  const cast = [[createModel('cow', { height: 0.62 * u }), 'モー', '#6a4a2a', 'Walk', 'Idle'], [createModel('sheep', { height: 0.42 * u }), 'メー', '#7a7aa0', 'Jump', 'Idle'], [createModel('shiba', { height: 0.4 * u }), 'ワン', '#c0703a', 'Walk', 'Idle']];
  const labels = cast.map(([, txt, bg]) => label(u, txt, bg, 0.13));
  group.add(...cast.map(([m]) => m.group), ...labels);
  const loop = 9.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      cast.forEach(([m, , , walk, idle], i) => {
        // in from the right one after another, a stop at its spot to call, then on off to the left behind the kanji
        const lag = i * 0.8, x1 = x0 + (0.35 + 0.42 * i) * u, inn = pre ? 1 : between(v, lag, lag + 2.0), off = pre ? 0 : between(v, 6.4 + lag * 0.5, 8.6 + lag * 0.3);
        const x = lerp(x0 + 2.0 * u, x1, inn) - off * 1.6 * u, moving = !pre && ((inn > 0 && inn < 1) || (off > 0 && off < 1));
        m.pose(moving ? walk : idle, moving ? v * (walk === 'Jump' ? 0.9 : 1) : t + i, true);
        m.group.position.set(x, floor, (0.05 - 0.15 * i) * u); m.group.rotation.y = moving ? LEFT + 0.35 : LEFT + 1.0;
        m.group.visible = off < 0.98;
        pop(labels[i], pre ? 0 : between(v, 3.0 + i * 0.9, 3.2 + i * 0.9) * (1 - between(v, 4.0 + i * 0.9, 4.2 + i * 0.9)), x1, floor + (0.75 - 0.08 * i) * u, 0.25 * u);
      });
    },
  };
}

// ---- 鳴く ----
function pets(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const dog = createModel('shiba', { height: 0.45 * u }), cow = createModel('cow', { height: 0.7 * u });
  const wan = label(u, 'ワン!', '#c0703a', 0.14), moo = label(u, 'モー', '#6a4a2a', 0.14);
  group.add(dog.group, cow.group, wan, moo);
  const loop = 6.0, dx = B.maxX + 0.4 * u, cx = B.maxX + 1.15 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const bark = !pre && ((v > 0.5 && v < 1.7) || (v > 3.6 && v < 4.8));
      dog.pose(bark ? 'Attack' : 'Idle', bark ? (v - (v > 3.6 ? 3.6 : 0.5)) % 0.6 : t);
      dog.group.position.set(dx, floor, 0.2 * u); dog.group.rotation.y = RIGHT - 0.5;
      const callCow = !pre && v > 2.0 && v < 3.4;
      cow.pose(callCow ? 'Idle_Headlow' : 'Idle', callCow ? 1.6 : t);
      cow.group.position.set(cx, floor, -0.15 * u); cow.group.rotation.y = LEFT + 0.6;
      pop(wan, bark ? 1 : 0, dx, floor + 0.6 * u + 0.03 * u * Math.sin(v * 12), 0.3 * u);
      pop(moo, callCow ? 1 : 0, cx, floor + 0.95 * u, 0.1 * u);
    },
  };
}

export const SCENES = { 'q-dogout': dogOut, 'q-tent': tent, 'q-whale': whale, 'q-parade': parade, 'q-pets': pets };
