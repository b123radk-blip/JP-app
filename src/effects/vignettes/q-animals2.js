// Model scenes, animals (Step 3a model pass): Quaternius animals with their own clips.
//   q-dogout   外: a little house; the door swings open, a Shiba bounds out into the yard, sniffs a flower, trots back in
//              and the door shuts
//   q-tent     入: a Shiba trots into a little tent, the flap drops, the tent wiggles, its head pokes out; outcome house: a
//              person walks up to a house and in through the door, which shuts (入る); doors: glass doors under an
//              いりぐち sign slide open as a person walks in (入り口); post: a person pushes a letter into a red postbox (入れる)
//   q-whale    大きな: a huge whale swims slowly past a tiny boat, which bobs on its wake
//   q-parade   動物: a cow, a sheep and a dog go past one after another, each stops and calls (モー メー ワン)
//   q-pets     鳴く: a dog barks ワン! and a cow answers モー
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { RIGHT, LEFT, lerp, label, pop, person, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3();
const tri = () => { const s = new THREE.Shape(); s.moveTo(-1, 0); s.lineTo(1, 0); s.lineTo(0, 1); s.lineTo(-1, 0); return s; };
// a little house facing you: walls, a roof, a dark doorway (the door is the scene's own, hinged at x = -dw / 2)
function cottage(u, { w = 0.62, h = 0.48, d = 0.45, dw = 0.18, dh = 0.3, dx = -0.12 } = {}) {
  const k = (x) => x * u, r = tri();
  return solidProp([[G.box(k(w), k(h), k(d), 0, k(h / 2), 0), 0xf3e2c4], [G.extrude(r, 1).scale(k(w / 2 + 0.05), k(0.26), k(d + 0.06)).translate(0, k(h), 0), 0xc8443a],
    [G.box(k(dw), k(dh), k(0.01), k(dx), k(dh / 2), k(d / 2 + 0.002)), 0x2a1c14], [G.box(k(0.14), k(0.12), k(0.01), k(0.16), k(0.28), k(d / 2 + 0.002)), 0xffd070]], 0.35);
}
const door = (u, dw = 0.18, dh = 0.3, color = 0x8a5a30) => solidProp([[G.box(dw * u, dh * u, 0.02 * u, dw * u / 2, dh * u / 2, 0), color], [G.sphere(0.012 * u, dw * u * 0.82, dh * u * 0.5, 0.015 * u), 0xf0c040]], 0.35);

// ---- 外 ----
function dogOut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u;
  const house = cottage(u), d = door(u), dog = createModel('shiba', { height: 0.42 * u });
  const flower = solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.16 * u, 0, 0.08 * u, 0), 0x3a9a3a], ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.03 * u, 0.035 * u * Math.cos(i * 1.26), 0.17 * u + 0.035 * u * Math.sin(i * 1.26), 0), 0xff6a9a]), [G.sphere(0.025 * u, 0, 0.17 * u, 0.01 * u), 0xffd040]], 0.5);
  house.position.set(hx, floor, -0.15 * u); d.position.set(hx - 0.21 * u, floor, -0.15 * u + 0.235 * u);
  flower.position.set(hx + 0.85 * u, floor, 0.25 * u);
  const sniff = label(u, 'クンクン', '#6a8a3a', 0.11);
  group.add(house, d, dog.group, flower, sniff);
  const loop = 7.4, door0 = [hx - 0.12 * u, -0.15 * u + 0.26 * u], yard = [hx + 0.7 * u, 0.25 * u];
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
      dog.group.rotation.y = trotting ? LEFT - 0.2 : running ? RIGHT - 0.4 : turnTo(RIGHT - 0.4, RIGHT - 0.1, between(v, 1.6, 1.9));
      pop(sniff, pre ? 0 : between(v, 2.2, 2.4) * (1 - between(v, 3.9, 4.1)), yard[0] + 0.1 * u, floor + 0.55 * u, 0.3 * u);
    },
  };
}

// ---- 入 / 入る / 入り口 / 入れる ----
function tent(ctx, spec, stage) {
  const o = spec.outcome;
  if (o === 'house' || o === 'doors') return walkIn(ctx, spec, stage);
  if (o === 'post') return post(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.55 * u, r = tri();
  const shell = solidProp([[G.extrude(r, 1).scale(0.3 * u, 0.42 * u, 0.6 * u).translate(0, 0, -0.08 * u), 0x3a8ae0], [G.extrude(r, 1).scale(0.2 * u, 0.3 * u, 0.01 * u).translate(0, 0, 0.225 * u), 0x10203a]], 0.4);
  const flap = new THREE.Group(), flapM = solidProp([[G.extrude(r, 1).scale(0.2 * u, 0.3 * u, 0.012 * u).translate(0, -0.3 * u, 0), 0x5aa8f0]], 0.4);
  flap.add(flapM); shell.add(flap); flap.position.set(0, 0.3 * u, 0.235 * u);
  const dog = createModel('shiba', { height: 0.38 * u });
  shell.position.set(tx, floor, -0.05 * u);
  group.add(shell, dog.group);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.6, 'linear'], drop: [1.7, 0.4, 'out'], peek: [3.2, 0.5, 'out'], hide: [4.8, 0.4], lift: [5.6, 0.4], go: [5.8, 0.8, 'linear'] });
      // the flap is rolled up while the dog goes in, drops behind it, opens a little for the peek
      flap.rotation.x = -1.4 * (1 - T.drop) - 0.6 * T.peek * (1 - T.hide) - 1.4 * T.lift;
      const inZ = -0.05 * u, path = pre ? 0 : T.come;
      const walking = !pre && (T.come > 0 && T.come < 1), wiggle = !pre ? bump(v, 2.2, 0.8) : 0;
      shell.rotation.z = 0.06 * Math.sin(v * 25) * wiggle;
      dog.pose(walking ? 'Walk' : 'Idle', v);
      if (v < 2.0 || pre) { dog.group.position.set(lerp(tx + 0.9 * u, tx, path), floor, lerp(0.45 * u, inZ + 0.05 * u, path)); dog.group.rotation.y = turnTo(LEFT + 0.3, Math.PI - 0.1, between(v, 1.0, 1.4)); }
      else { dog.group.position.set(tx, floor, inZ + 0.12 * u + 0.12 * u * T.peek * (1 - T.hide)); dog.group.rotation.y = 0; }
      dog.group.visible = pre || v < 1.9 || (T.peek > 0.05 && T.hide < 0.95);
      // it walks back out at the end and round to where it started
      if (T.go > 0) { dog.group.visible = true; dog.pose('Walk', v); dog.group.position.set(lerp(tx, tx + 0.9 * u, T.go), floor, lerp(inZ + 0.3 * u, 0.45 * u, T.go)); dog.group.rotation.y = RIGHT - 0.3; }
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
function whale(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 1.0 * u;
  const wh = createModel('whale', { width: 1.5 * u }), sea = solidProp([[G.box(2.6 * u, 0.6 * u, 0.6 * u, 0, -0.15 * u, 0), 0x2a6ab0], [G.box(2.6 * u, 0.02 * u, 0.6 * u, 0, 0.15 * u, 0), 0x5a9ad8]], 0.35);
  const boat = solidProp([[G.box(0.16 * u, 0.04 * u, 0.07 * u, 0, 0.02 * u, 0), 0xc8443a], [G.cyl(0.004 * u, 0.004 * u, 0.12 * u, 0, 0.1 * u, 0), 0x8a5a30], [G.extrude(tri(), 0.01).scale(0.05 * u, 0.09 * u, 1).translate(0.03 * u, 0.06 * u, 0), 0xffffff]], 0.5);
  const spout = solidProp([[G.sphere(0.06 * u, 0, 0, 0, 1, 1.6, 1), 0xbfe8ff]], 0.7);
  sea.position.set(cx, floor, -0.45 * u);                  // the sea seen from the side: the whale's belly is under the water
  group.add(sea, wh.group, boat, spout);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.45 : v / loop;
      wh.pose('Swim', t);
      // the whale glides from right to left behind the boat, its back breaking the surface
      wh.group.position.set(cx + lerp(1.2, -1.0, f) * u, floor - 0.42 * u + 0.04 * u * Math.sin(v * 1.5), -0.5 * u); wh.group.rotation.y = LEFT + 0.1;
      boat.position.set(cx - 0.1 * u, floor + 0.16 * u + 0.025 * u * Math.sin(v * 3) + 0.04 * u * bump(f, 0.4, 0.3), -0.2 * u); boat.rotation.z = 0.12 * Math.sin(v * 2.4) * (0.5 + bump(f, 0.4, 0.3));
      const s = pre ? 0 : bump(f, 0.42, 0.18);
      spout.visible = s > 0.01; spout.scale.setScalar(s * 1.6); spout.position.set(wh.group.position.x - 0.25 * u, floor + 0.25 * u + 0.15 * u * s, -0.5 * u);
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
