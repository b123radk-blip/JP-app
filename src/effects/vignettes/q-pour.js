// Pouring (Haiku plan h2, card 注): a girl tips a jug and pours a blue stream into a glass on a little table until it is
// full, then smiles. Loop 6.5 s: 0-1.2 she lifts the jug from her side over the glass; 1.2-2 she tips it; 2-4 the stream
// runs and the water rises; 4-4.6 she tips back; 4.6-5.5 a sparkle and a nod; 5.5-6.5 she lowers the jug, the water drains.
//   q-jug-pour   注: a girl pours a jug of water into a glass until it is full
// The jug's origin is the centre of its handle; the right hand grips the top of the handle (palm down) and the jug tilts
// about the hand: grip + hold, then the jug's own turn.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { pop } from './q-common.js';

const TILT = -1.45;                                       // radians: the jug turns clockwise, its spout goes down
const Z = new THREE.Vector3(0, 0, 1), W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();

function jugPour(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const who = actor('gal2', 0.9 * u);
  const gx = B.maxX + 0.8 * u, gz = 0.1 * u;             // the table's and the glass's centre, in the group
  const girlX = B.maxX + 1.1 * u;                        // close enough to the table for her hand to reach the jug over the glass
  const table = solidProp([[G.cyl(0.175 * u, 0.175 * u, 0.02 * u, 0, 0.44 * u, 0), 0xd9b48a], [G.cyl(0.015 * u, 0.015 * u, 0.42 * u, 0, 0.21 * u, 0), 0xb08a5e], [G.cyl(0.11 * u, 0.11 * u, 0.02 * u, 0, 0.01 * u, 0), 0xb08a5e]], 0.3);
  const glass = solidProp([[G.cyl(0.048 * u, 0.04 * u, 0.22 * u), 0xcfe8ff]], 0.25);   // pivot: its middle
  glass.material.transparent = true; glass.material.opacity = 0.4; glass.material.depthWrite = false;
  const water = solidProp([[G.cyl(0.04 * u, 0.034 * u, 0.2 * u, 0, 0.1 * u, 0), 0x3a9ae0]], 0.6);   // pivot: its bottom
  const jug = solidProp([                                    // pivot: the middle of the handle (the handle is the upper half ring)
    [G.cyl(0.05 * u, 0.058 * u, 0.14 * u, 0, -0.06 * u, 0), 0xffd9a0],
    [G.torus(0.05 * u, 0.011 * u, Math.PI, 0, 0, 0), 0xffd9a0],
    [G.cone(0.016 * u, 0.035 * u, 0.058 * u, 0.012 * u, 0, -0.5), 0xffd9a0],
  ], 0.5);
  const stream = solidProp([[G.cyl(0.007 * u, 0.007 * u, 1, 0, -0.5, 0), 0x6ec6ff]], 0.9);   // pivot: its top, scaled to its length
  const sparkle = burst(u, { s: 0.12, n: 6, color: 0xffe060 });
  table.name = 'table'; glass.name = 'glass'; water.name = 'water'; jug.name = 'jug'; stream.name = 'stream';
  table.position.set(gx, floor, gz); glass.position.set(gx, floor + 0.56 * u, gz); water.position.set(0, -0.098 * u, 0);   // the water sits in the glass (a child of it)
  glass.add(water);
  who.group.position.set(girlX, floor, 0.05 * u); who.group.rotation.y = -Math.PI / 2 + 0.5;   // turned to the table, a bit to the learner
  group.add(who.group, table, glass, jug, stream, sparkle);
  const loop = 6.5;
  const rest = new THREE.Vector3(B.maxX + 0.95 * u, floor + 0.62 * u, 0.12 * u);       // the jug at her side
  const over = new THREE.Vector3(gx - 0.1 * u, floor + 0.74 * u, gz);                 // beside the glass, upright: the body clears its rim
  const shift = new THREE.Vector3(0.072 * u, 0.043 * u, 0);                           // moves in as it tips: the spout lands over the glass
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0, 1.2], tip: [1.2, 0.8], back: [4.0, 0.6], lower: [5.5, 1.0] });
      const f = T.tip - T.back, th = TILT * f, ws = group.getWorldScale(W).y;   // f: 0 upright, 1 poured
      who.pose('Idle', t);
      who.group.position.set(girlX, floor, 0.05 * u); who.group.rotation.y = -Math.PI / 2 + 0.5;
      // the handle's centre (group space): lifted from her side, over the glass, then down to her side again
      const O = W3.copy(rest).lerp(over, T.lift * (1 - T.lower)).addScaledVector(shift, f);
      // the palm is on top of the handle, facing down; it turns with the jug
      const toward = W.set(Math.sin(th), -Math.cos(th), 0).transformDirection(group.matrixWorld);
      who.grip('R', group.localToWorld(O.clone()), toward, 0.061 * u * ws, pre ? A.setup : 1, { out: 0.7, down: 0.5 });
      who.hold(jug, 'R', group, 0.061 * u * ws);
      jug.rotation.z = th;
      // the stream: from the spout to the water's surface (it reaches into the glass)
      const flow = pre ? 0 : between(v, 2.0, 2.2) * (1 - between(v, 3.9, 4.1));
      const level = 0.92 * between(v, 2.0, 4.0) * (1 - between(v, 5.5, 6.5));
      const tip = W2.set(0.066 * u, 0.02 * u, 0).applyAxisAngle(Z, th).add(jug.position);
      const surface = floor + 0.462 * u + 0.2 * u * level;
      stream.position.copy(tip); stream.scale.set(1, Math.max(0.005 * u, tip.y - surface), 1); stream.visible = flow > 0.01;
      // the water rises as it pours, and drains at the end of the loop
      water.scale.set(1, Math.max(1e-3, level), 1); water.visible = level > 0.01;
      // full: a sparkle over the glass, and a happy nod
      const full = bump(v, 4.6, 0.9);
      pop(sparkle, pre ? 0 : full * 1.2, gx + 0.03 * u, floor + 0.82 * u, gz);
      who.nod(pre ? 0 : between(v, 4.6, 4.9) * (1 - between(v, 5.3, 5.5)), v);
    },
  };
}

export const SCENES = { 'q-jug-pour': jugPour };
