// Model scenes, school and self (Step 3a model pass).
//   q-mirror   自: a girl stands at a tall mirror; her reflection (the same person, mirrored, flat in the glass) waves when
//              she waves and points at its nose when she points at hers (the Japanese "me"), a sparkle
//   q-teacher  先生: a teacher at a blackboard taps the board with a pointer; two pupils bow and say おはようございます; she
//              bows back
//   q-abacus   学: a child at a desk flicks the beads of an abacus, counting, then shoots a hand up and a bulb lights over
//              him; outcome backpack: a pupil with a red school bag on her back and a yellow hat walks to school, waving
//              (学生); caps: three graduates throw their caps in the air with confetti, diplomas in hand (大学)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, burst } from '../pieces/kit-things.js';
import { blackboard, stick, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, UP, lerp, label, pop, person, KID, TEEN, turnTo, axisOf, onHead } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), Q = new THREE.Quaternion();
const bones = (a) => { const out = []; a.group.traverse((o) => { if (o.isBone) out.push(o); }); return out; };

// ---- 自 ----
function mirror(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u, yaw = RIGHT + 0.35;     // she faces the mirror, half away from you; you see her face in it
  const me = person(spec.who, u, 0.78), refl = person(spec.who, u, 0.78), mb = bones(me), rb = bones(refl);
  const frame = solidProp([[G.box(0.6 * u, 0.04 * u, 0.04 * u, 0, 1.0 * u, 0), 0xc8a050], [G.box(0.6 * u, 0.04 * u, 0.04 * u, 0, 0.06 * u, 0), 0xc8a050], [G.box(0.04 * u, 0.98 * u, 0.04 * u, -0.3 * u, 0.53 * u, 0), 0xc8a050], [G.box(0.04 * u, 0.98 * u, 0.04 * u, 0.3 * u, 0.53 * u, 0), 0xc8a050], [G.box(0.56 * u, 0.94 * u, 0.01 * u, 0, 0.53 * u, -0.07 * u), 0x203040], [G.box(0.5 * u, 0.03 * u, 0.24 * u, 0, 0.015 * u, -0.06 * u), 0x8a6a30]], 0.4);
  const pane = solidProp([[G.box(0.56 * u, 0.94 * u, 0.006 * u, 0, 0.53 * u, 0), 0xcfe6ff]], 0.6);
  pane.material.transparent = true; pane.material.opacity = 0.28; pane.material.depthWrite = false;
  const stand = new THREE.Group(), glass = new THREE.Group(), shine = burst(u, { s: 0.16, color: 0xfff6c0 });
  stand.add(frame, pane, glass); glass.add(refl.group); glass.scale.set(0.82, 0.82, -0.08); glass.position.y = 0.06 * u;          // the reflection, flattened just behind the glass
  group.add(me.group, stand, shine);
  const loop = 6.6, inv = new THREE.Matrix4(), L = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      me.pose('Idle', t);
      me.group.position.set(x0, floor, 0.1 * u); me.group.rotation.y = yaw;
      stand.position.copy(group.worldToLocal(me.local(0, 0, 0.62, W))).setY(floor); stand.rotation.y = yaw + Math.PI + 0.6;      // turned a little more toward you than a real mirror would be
      // wave, then the finger (fist) to her own nose; a nod
      const wave = pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 2.0, 2.3)), point = pre ? 0 : between(v, 2.6, 2.9) * (1 - between(v, 5.0, 5.3));
      me.wave('R', wave, v);
      me.handTo('R', me.at('mouth', W, -0.01, 0.05, 0.09), point, { out: 0.7, down: 0.9 });
      me.twist('R', axisOf(me, 1, 0, 0, W2), point);
      me.turn('Head', 0, 0, 0.12 * Math.sin(v * 1.4) * (1 - point));
      if (point > 0.6) me.nod(0.5, v);
      // the reflection: the same place in the mirror's frame, the same bones
      stand.updateWorldMatrix(true, true); inv.copy(stand.matrixWorld).invert();
      me.group.getWorldPosition(L).applyMatrix4(inv);
      refl.group.position.set(0, 0, L.z); refl.group.rotation.y = Math.PI;      // centred in the glass, facing out of it
      for (let i = 0; i < mb.length && i < rb.length; i++) { rb[i].position.copy(mb[i].position); rb[i].quaternion.copy(mb[i].quaternion); rb[i].scale.copy(mb[i].scale); }
      const k = pre ? 0 : bump(v, 3.0, 1.4);
      shine.visible = k > 0.01; shine.scale.setScalar(grow(Math.min(1, k * 1.5))); shine.position.copy(group.worldToLocal(stand.localToWorld(W.set(0.2 * u, 0.9 * u, 0.05 * u)))); shine.rotation.z = v * 2;
    },
  };
}

// ---- 先生 ----
function teacher(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 1.05 * u;
  const tch = person(spec.who, u), kids = [person(spec.kid, u, KID), person(spec.other, u, KID)];
  const board = blackboard(u, { w: 0.7, h: 0.42 }), text = textPlane('あいう', { h: 0.14 * u, color: '#f4f0e8' }), pointer = stick(u, { len: 0.36 });
  board.position.set(bx, floor + 0.82 * u, -0.45 * u); text.position.set(bx, floor + 0.83 * u, -0.43 * u);
  const hello = label(u, 'おはようございます!', '#3a8a5a', 0.11);
  group.add(tch.group, ...kids.map((k) => k.group), board, text, pointer, hello);
  const loop = 7.0, tipAt = new THREE.Vector3(), dir = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { turn: [1.9, 0.4], kb: [2.4, 0.6], ku: [3.6, 0.6], tb: [3.4, 0.6], tu: [4.6, 0.6], back: [5.6, 0.5] });
      tch.pose('Idle', t);
      tch.group.position.set(bx + 0.42 * u, floor, -0.15 * u);
      tch.group.rotation.y = turnTo(turnTo(LEFT - 0.3, LEFT + 0.75, T.turn), LEFT - 0.3, T.back);
      // the pointer taps the board's letters, then points down while she bows
      const tap = (pre ? 0 : 1) * (1 - T.turn + T.back) * Math.abs(Math.sin(v * 5));
      tipAt.set(bx - 0.1 * u + 0.12 * u * Math.sin(v * 1.3), floor + 0.84 * u + 0.03 * u * tap, -0.42 * u); group.localToWorld(tipAt);
      const hand = tch.local(-0.25, 0.55, 0.25, new THREE.Vector3());
      tch.handTo('R', hand.lerp(tipAt, 0.25 * (1 - T.turn + T.back)), 1, { out: 0.8, down: 0.4 });
      tch.hold(pointer, 'R', group, 0.008 * u);
      const pointing = 1 - T.turn + T.back, down = axisOf(tch, -0.3, -1, 0.4, W2);
      pointer.getWorldPosition(W); dir.copy(tipAt).sub(W).normalize().lerp(down, 1 - pointing).normalize();
      pointer.quaternion.copy(group.getWorldQuaternion(Q).invert()).multiply(new THREE.Quaternion().setFromUnitVectors(UP, dir));
      tch.bow(0.7 * T.tb * (1 - T.tu));
      kids.forEach((k, i) => {
        k.pose('Idle', t + i);
        k.group.position.set(B.maxX + (0.3 + 0.32 * i) * u, floor, 0.25 * u - 0.12 * u * i); k.group.rotation.y = RIGHT - 0.35;
        k.bow(0.85 * T.kb * (1 - T.ku));
      });
      pop(hello, pre ? 0 : between(v, 2.4, 2.7) * (1 - between(v, 3.9, 4.2)), B.maxX + 0.45 * u, floor + 0.75 * u, 0.4 * u);
    },
  };
}

// ---- 学 / 学生 / 大学 ----
function abacus(ctx, spec, stage) {
  if (spec.outcome === 'backpack') return pupil(ctx, spec, stage);
  if (spec.outcome === 'caps') return caps(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.6 * u;
  const kid = person(spec.who, u, 0.68), top = 0.2 * u;
  const desk = solidProp([[G.box(0.6 * u, 0.025 * u, 0.3 * u, 0, top, 0), 0xc89060], [G.box(0.03 * u, top, 0.03 * u, -0.27 * u, top / 2, 0.12 * u), 0x8a5a30], [G.box(0.03 * u, top, 0.03 * u, 0.27 * u, top / 2, 0.12 * u), 0x8a5a30], [G.box(0.03 * u, top, 0.03 * u, -0.27 * u, top / 2, -0.12 * u), 0x8a5a30], [G.box(0.03 * u, top, 0.03 * u, 0.27 * u, top / 2, -0.12 * u), 0x8a5a30], [G.box(0.14 * u, 0.07 * u, 0.12 * u, 0, 0.035 * u, -0.27 * u), 0x8a5a30]], 0.35);
  const frame = solidProp([[G.box(0.42 * u, 0.025 * u, 0.025 * u, 0, 0.17 * u, 0), 0x6a3a1a], [G.box(0.42 * u, 0.025 * u, 0.025 * u, 0, 0, 0), 0x6a3a1a], [G.box(0.42 * u, 0.012 * u, 0.02 * u, 0, 0.12 * u, 0), 0x6a3a1a], [G.box(0.025 * u, 0.19 * u, 0.025 * u, -0.21 * u, 0.085 * u, 0), 0x6a3a1a], [G.box(0.025 * u, 0.19 * u, 0.025 * u, 0.21 * u, 0.085 * u, 0), 0x6a3a1a], ...[-0.15, -0.075, 0, 0.075, 0.15].map((x) => [G.cyl(0.004 * u, 0.004 * u, 0.17 * u, x * u, 0.085 * u, 0), 0xd0d0d0])], 0.4);
  const beads = many([[G.sphere(0.026 * u, 0, 0, 0, 1, 0.6, 1), 0xe04848]], 25, 0.5);
  const bulb = solidProp([[G.sphere(0.07 * u, 0, 0.08 * u, 0), 0xfff080], [G.cyl(0.035 * u, 0.035 * u, 0.05 * u, 0, 0, 0), 0x9aa0a8]], 1.0);
  const abac = new THREE.Group(); abac.add(frame, beads);
  group.add(kid.group, desk, abac, bulb);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      kid.pose('SitDown', 1.0, false);
      kid.group.position.set(x0, floor - 0.005 * u, -0.27 * u); kid.group.rotation.y = 0;
      desk.position.set(x0, floor, 0); abac.position.set(x0, floor + top + 0.03 * u, 0.02 * u); abac.rotation.x = -1.05;
      // beads: one rod after another, a bead flicked up; the right hand follows the rod being counted
      const count = pre ? 0 : Math.min(5, Math.floor(v / 0.55)), f = pre ? 0 : (v / 0.55) % 1;
      for (let r = 0; r < 5; r++) for (let b = 0; b < 5; b++) {
        const up = b === 0 ? (r < count || (r === count && f > 0.5 && v < 2.75) ? 1 : 0) : 0;
        beads.set(r * 5 + b, (r - 2) * 0.075 * u, b === 0 ? lerp(0.145, 0.095, 1 - up) * u : (0.01 + 0.024 * (b - 1)) * u, 0.005 * u, 1);
      }
      beads.commit();
      const rod = abac.localToWorld(W.set((Math.min(count, 4) - 2) * 0.075 * u, 0.1 * u, 0.03 * u));
      const counting = pre ? 0.5 : 1 - between(v, 2.8, 3.1) + between(v, 5.6, 6.0);
      kid.turn('Head', 0.4 * counting);
      kid.handTo('R', rod, counting, { out: 0.6, down: 0.8 });
      kid.handTo('L', abac.localToWorld(W2.set(0.24 * u, 0.05 * u, 0.02 * u)), 1, { out: 0.6, down: 0.8 });
      // got it: the hand shoots up and the bulb lights
      const got = pre ? 0 : between(v, 3.0, 3.3) * (1 - between(v, 5.3, 5.6));
      kid.handTo('R', kid.local(-0.12, 1.25, 0.05, W), got, { out: 0.4, down: 0.2 });
      bulb.visible = got > 0.01; bulb.scale.setScalar(grow(got)); bulb.position.set(x0 + 0.05 * u, floor + 0.78 * u, -0.2 * u);
      bulb.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(v * 8) * got;
    },
  };
}
function pupil(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.75 * u;
  const kid = person(spec.who, u, 0.66);
  const bag = solidProp([[G.box(0.2 * u, 0.22 * u, 0.12 * u, 0, 0, 0), 0xd02a2a], [G.box(0.205 * u, 0.1 * u, 0.125 * u, 0, 0.07 * u, 0.003 * u), 0xb01a1a], [G.box(0.03 * u, 0.03 * u, 0.01 * u, 0, 0.02 * u, 0.065 * u), 0xf0c040]], 0.5);
  const hat = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 0.55, 1), 0xffd820], [G.cyl(0.17 * u, 0.17 * u, 0.01 * u, 0, -0.01 * u, 0.02 * u, 0, 0, 0, 24), 0xffd820]], 0.6);
  group.add(kid.group, bag, hat);
  const loop = 7.2, rx = 0.45 * u, rz = 0.22 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const stop = !pre && v > 3.2 && v < 4.6;
      const g = pre ? 0 : (v < 3.2 ? v : v > 4.6 ? v - 1.4 : 3.2) / (loop - 1.4) * Math.PI * 2 + Math.PI / 2;
      kid.pose(pre || stop ? 'Idle' : 'Walk', pre || stop ? t : v);
      kid.group.position.set(cx + rx * Math.cos(g), floor, -0.05 * u + rz * Math.sin(g));
      kid.group.rotation.y = stop ? 0 : pre ? 0 : Math.atan2(-rx * Math.sin(g), rz * Math.cos(g));
      kid.wave('R', stop ? between(v, 3.2, 3.5) * (1 - between(v, 4.3, 4.6)) : 0, v);
      // the bag on her back, the hat on her head
      bag.position.copy(group.worldToLocal(kid.local(0, 0.42, -0.2, W))); bag.rotation.y = kid.group.rotation.y;
      onHead(kid, hat, group, 'over', 0, -0.13, -0.04);
    },
  };
}
function caps(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.8 * u;
  const grads = [spec.who, spec.other, spec.third].map((n) => person(n, u, 0.85));
  const board = () => solidProp([[G.box(0.24 * u, 0.015 * u, 0.24 * u, 0, 0.06 * u, 0), 0x1a1a24], [G.cyl(0.08 * u, 0.09 * u, 0.06 * u, 0, 0.03 * u, 0), 0x1a1a24], [G.cyl(0.006 * u, 0.006 * u, 0.1 * u, 0.1 * u, 0.02 * u, 0.1 * u), 0xffc020]], 0.4);
  const hats = grads.map(board), scroll = () => solidProp([[G.cyl(0.025 * u, 0.025 * u, 0.2 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xfffaf0], [G.cyl(0.027 * u, 0.027 * u, 0.025 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xd03030]], 0.5);
  const scrolls = grads.map(scroll), confetti = many([[0xff5a5a, -1, 0], [0xffd040, 1, 0.5], [0x40c0ff, 0, -1], [0x60e070, 0.5, 1]].map(([c, x, y]) => [G.box(0.022 * u, 0.022 * u, 0.004 * u, x * 0.04 * u, y * 0.04 * u, 0, x), c]), 24, 0.8);
  group.add(...grads.map((g) => g.group), ...hats, ...scrolls, confetti);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const fly = pre ? 0 : between(v, 1.2, 3.4), cheer = !pre && v > 1.0 && v < 3.8;
      grads.forEach((g, i) => {
        g.pose(cheer ? 'Victory' : 'Idle', cheer ? 0.35 + 0.25 * Math.sin((v - 1.0) * 3 + i) : t + i);
        g.group.position.set(x0 + (i - 1) * 0.4 * u, floor, (i === 1 ? 0.12 : 0) * u); g.group.rotation.y = (1 - i) * 0.2;
        // the cap: on the head, thrown up spinning in an arc and back down onto it
        onHead(g, hats[i], group, 'over', 0, -0.12, -0.02);
        const h = Math.sin(Math.PI * fly) * (0.75 + 0.15 * i) * u;
        hats[i].position.y += h; hats[i].rotation.set(0.3 * Math.sin(v * 3 + i) * (fly > 0 && fly < 1 ? 1 : 0), g.group.rotation.y + 6 * fly * (i % 2 ? -1 : 1), 0);
        if (!cheer) { g.hold(scrolls[i], 'L', group, 0.025 * u); scrolls[i].rotation.set(0, g.group.rotation.y, 0); }
        else scrolls[i].position.copy(group.worldToLocal(g.fistMid('L', W)));
      });
      for (let i = 0; i < 24; i++) {
        const f = pre ? -1 : ((v - 1.4) / 2.6 + (i % 5) * 0.04);
        const on = f > 0 && f < 1;
        confetti.set(i, x0 + (((i * 37) % 24) / 24 - 0.5) * 1.3 * u + 0.05 * u * Math.sin(v * 3 + i), floor + 1.6 * u - 1.5 * u * f, 0.15 * u + ((i * 13) % 7) * 0.02 * u, on ? 1 : 0, v * 4 + i, v * 3 + i);
      }
      confetti.commit();
    },
  };
}

export const SCENES = { 'q-mirror': mirror, 'q-teacher': teacher, 'q-abacus': abacus };
