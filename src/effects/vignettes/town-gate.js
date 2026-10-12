// 切符: a woman walks up to a ticket gate (two cabinets with a reader on top and two flap doors across the aisle), touches
// her card to the reader with the hand nearest it, the reader beeps green, the flaps swing open, she walks through and the
// flaps close behind her. She stands on the station floor the whole time.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { person, label, pop } from './q-common.js';
import { stroll, appear } from './q-town.js';
import { wscale } from './q-learn.js';

const N = new THREE.Vector3(), PAD = new THREE.Vector3(), TOWARD = new THREE.Vector3();

function ticketGate(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.3 * u, fl = 0.02 * u, base = floor + fl;
  const AISLE = 0.19 * u, CW = 0.17 * u, CH = 0.52 * u, CD = 0.42 * u, ZR = -0.1 * u, TILT = 0.6;
  const tile = solidProp([[G.box(1.05 * u, fl, 2.1 * u, 0, 0, 0), 0x9a968f], [G.box(0.1 * u, fl * 1.2, 2.1 * u, 0, 0, 0), 0xf0cc40]], 0.3);
  tile.position.set(gx, floor + fl / 2, -0.05 * u);
  const cab = (s) => [[G.box(CW, CH, CD, s * (AISLE + CW / 2), base + CH / 2, 0), 0xdde1e8], [G.box(CW + 0.02 * u, 0.025 * u, CD + 0.02 * u, s * (AISLE + CW / 2), base + CH + 0.0125 * u, 0), 0x46546a],
    [G.box(0.006 * u, 0.1 * u, CD * 0.8, s * AISLE + 0.002 * u * -s, base + 0.4 * u, 0), 0x3a8ad8]];
  const cabs = solidProp([...cab(-1), ...cab(1)], 0.35); cabs.position.set(gx, 0, 0);
  // the reader on the person's right-hand cabinet (-x), its pad tilted toward the aisle
  const topY = base + CH + 0.025 * u, reader = new THREE.Group();
  reader.add(solidProp([[G.box(0.1 * u, 0.05 * u, 0.13 * u, 0, 0, 0), 0x2a3140], [G.box(0.07 * u, 0.008 * u, 0.09 * u, 0, 0.026 * u, 0), 0x9ad0ff], [G.box(0.03 * u, 0.012 * u, 0.03 * u, 0, 0.032 * u, 0.02 * u), 0xffffff]], 0.6));
  reader.rotation.z = -TILT; reader.position.set(gx - AISLE - 0.05 * u, topY + 0.035 * u, ZR);
  const lamp = (c, z) => { const m = solidProp([[G.box(0.04 * u, 0.012 * u, 0.03 * u, 0, 0, 0), c]], 0.02); m.position.set(gx - AISLE - 0.05 * u, topY + 0.008 * u, ZR + z * u); return m; };
  const red = lamp(0xff2a2a, 0.1), green = lamp(0x20e060, 0.145);
  // flap doors: closed across the aisle, swinging open along the cabinets
  const flap = (s) => { const g = new THREE.Group(), m = solidProp([[G.box(AISLE * 0.98, 0.17 * u, 0.012 * u, -s * AISLE * 0.49, 0, 0), 0x5aa8f0]], 0.5);
    m.material.transparent = true; m.material.opacity = 0.78; g.add(m); g.position.set(gx + s * AISLE, base + 0.4 * u, 0.0); return g; };
  const flaps = [flap(-1), flap(1)];
  const card = solidProp([[G.box(0.1 * u, 0.007 * u, 0.065 * u, 0, 0, 0), 0x2a8a5a], [G.box(0.1 * u, 0.0075 * u, 0.012 * u, 0, 0, -0.016 * u), 0xf0f0f0], [G.box(0.02 * u, 0.0078 * u, 0.016 * u, -0.03 * u, 0, 0.014 * u), 0xffd040]], 0.5);
  const beep = label(u, 'ピッ!', '#25a055', 0.1), p = person('suitWoman', u);
  group.add(tile, cabs, reader, red, green, ...flaps, card, p.group, beep);
  const loop = 6.4, start = [gx, -1.05 * u], stop = [gx - 0.02 * u, -0.24 * u], end = [gx, 0.9 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = wscale(group);
      const T = timeline(v, { walk: [0.1, 1.7, 'linear'], reach: [1.9, 0.4], away: [3.0, 0.4], open: [2.9, 0.4], thru: [3.3, 2.0, 'linear'], shut: [4.5, 0.5], gone: [5.4, 0.4] });
      // walking in, then (once she has passed the gate) walking through it
      const q = v < 3.3 ? [start, stop] : [stop, end], g = pre ? 0 : v < 3.3 ? T.walk : T.thru;
      stroll(p, q[0], q[1], g, base, t);
      appear(p, pre ? A.setup : (1 - T.gone) * (A.n > 0 ? Math.min(1, v / 0.3) : 1));
      // the card: held in her right hand against the reader pad, then hangs at her side
      N.set(Math.sin(TILT), Math.cos(TILT), 0);
      const k = pre ? 0 : T.reach * (1 - T.away), tap = pre ? 0 : bump(v, 2.45, 0.3) + bump(v, 2.85, 0.3);
      PAD.set(gx - AISLE - 0.05 * u, topY + 0.035 * u, ZR).addScaledVector(N, 0.03 * u - 0.006 * u * tap); group.localToWorld(PAD);
      TOWARD.copy(N).negate();
      if (k > 0 && v < 3.4) p.grip('R', PAD, TOWARD, 0.006 * u * s, k, { out: 0.9, down: 0.5 });
      p.hold(card, 'R', group, 0.004 * u * s); card.visible = p.group.visible && !pre;
      card.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -TILT * k).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.group.rotation.y * (1 - k)));
      // the reader beeps green when the card touches; the flaps open for her and shut behind her
      const ok = !pre && v > 2.5 && v < 4.6;
      red.material.userData.glow.value = ok ? 0.02 : 1.6; green.material.userData.glow.value = ok ? 1.8 : 0.02;
      pop(beep, pre ? 0 : between(v, 2.5, 2.65) * (1 - between(v, 3.2, 3.4)), gx - AISLE - 0.05 * u, topY + 0.2 * u, ZR + 0.05 * u);
      const op = pre ? 0 : T.open - T.shut; flaps[0].rotation.y = -1.5 * op; flaps[1].rotation.y = 1.5 * op;
    },
  };
}

export const SCENES = { 'ticket-gate': ticketGate };
