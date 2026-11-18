// 鍵 / カギ (q-key-door): a man at a shut door puts a key into the keyhole on its latch edge, turns it (a click), draws the
// key out and the door swings open inwards on its hinge. He lowers his hand, the door shuts, and he lifts the key again.
// Loop 8 s: 0-1.5 he brings the key to the lock; 1.5-1.8 the blade goes in; 1.9-2.4 he turns it; 2.5 a click; 2.75-3.2 he
// pulls the key out; 3.0-3.5 the door swings open; 3.5-4.1 his hand comes down; 5.4-6.4 the door shuts; 6.5-7.2 his hand
// lifts the key again. The lock is a strap of iron down the latch edge that reaches the floor; the door, its knob and its
// keyhole ride on a pivot at the hinge, so the keyhole swings with the door. The key hangs on his left hand.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { pop } from './q-common.js';

const YAW = -0.25;                              // the door turned toward the learner: its face reads, its hinge sits in depth
const OPEN = 65 * Math.PI / 180;                // how far it opens
const UP = new THREE.Vector3(0, 1, 0), FWD = new THREE.Vector3(0, 0, 1);
const q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), qa = new THREE.Quaternion();

export function keyDoor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const DX = B.maxX + 1 * u, DZ = floor + 0.18 * u;         // the shut door's middle, where the learner's seat looks at it
  const HW = 0.2 * u, DEPTH = 0.09 * u, HT = 0.9 * u;       // half the door's width, its thickness, its height
  const LX = -0.35 * u, LY = 0.63 * u, LZ = DEPTH / 2 + 0.02 * u;  // the keyhole: on the latch edge, out through its face
  const R = 0.115 * u, TUBE = 0.014 * u, BLADE = 0.16 * u;  // the key: its bow's ring, the ring's wire, its blade
  const MX = 0.52, MZ = -0.08;                              // the man's feet: left of the door, in front of its face

  // The door and everything on it, on one pivot at the hinge (door-local x runs from the latch edge back to the hinge).
  const doorGroup = new THREE.Group();
  doorGroup.position.set(DX, floor, DZ); doorGroup.rotation.y = YAW;
  const pivot = new THREE.Group(); pivot.position.set(HW, 0, 0);
  doorGroup.add(pivot);
  const door = solidProp([
    [G.box(2 * HW, HT, DEPTH, -HW, HT / 2, 0), 0x8a552f],
    [G.box(0.16 * u, 0.26 * u, 0.015 * u, -0.3 * u, 0.24 * u, DEPTH / 2 + 0.008 * u), 0xa5703c],   // raised panels
    [G.box(0.16 * u, 0.26 * u, 0.015 * u, -0.3 * u, 0.64 * u, DEPTH / 2 + 0.008 * u), 0xa5703c],
    [G.box(0.16 * u, 0.26 * u, 0.015 * u, -0.1 * u, 0.24 * u, DEPTH / 2 + 0.008 * u), 0xa5703c],
    [G.box(0.16 * u, 0.26 * u, 0.015 * u, -0.1 * u, 0.64 * u, DEPTH / 2 + 0.008 * u), 0xa5703c],
    [G.sphere(0.03 * u, LX + 0.07 * u, 0.42 * u, DEPTH / 2 + 0.03 * u), 0xd8c078],                 // the knob below it
  ], 0.12);
  door.name = 'door'; pivot.add(door);
  // A strap of iron down the latch edge, from the floor to over the keyhole: it is the lock, and it stands on the ground.
  const lock = solidProp([
    [G.box(0.05 * u, 0.72 * u, 0.022 * u, LX, 0.36 * u, LZ), 0x2a1f16],
    [G.cyl(0.05 * u, 0.05 * u, 0.022 * u, LX, LY, LZ + 0.016 * u, Math.PI / 2), 0x2a1f16],          // its escutcheon
    [G.box(0.016 * u, 0.036 * u, 0.012 * u, LX, LY, LZ + 0.026 * u), 0xd8c078],                     // the keyhole slit
  ], 0.2);
  lock.name = 'lock'; pivot.add(lock);
  const room = solidProp([[new THREE.PlaneGeometry(0.6 * u, 0.9 * u), 0xffc07a]], 1.2);
  room.position.set(-HW, 0.45 * u, -0.4 * u);    // warm light inside; deep enough that the swinging door never covers it
  room.name = 'room light'; doorGroup.add(room);
  group.add(doorGroup);

  const who = actor('guy3', 0.9 * u);
  // The key's own frame: its bow's ring at the middle, the blade and its teeth running back through -z into the lock. It
  // hangs on the man, so the scene is scaled back to its own size.
  const key = solidProp([
    [G.torus(R, TUBE, Math.PI * 2, 0, 0, 0), 0xf0c24a],
    [G.box(0.02 * u, 0.015 * u, BLADE, 0, 0, -BLADE / 2 - 0.01 * u), 0xf0c24a],
    [G.box(0.014 * u, 0.026 * u, 0.014 * u, 0, -0.018 * u, -BLADE + 0.01 * u), 0xf0c24a],
    [G.box(0.014 * u, 0.02 * u, 0.014 * u, 0, -0.014 * u, -BLADE + 0.055 * u), 0xf0c24a],
  ], 0.6);
  key.name = 'gold key';
  key.scale.setScalar(1 / who.group.scale.x);
  const glint = burst(u, { s: 0.2, n: 6, color: 0xffffff });
  const click = burst(u, { s: 0.18, n: 8, color: 0xffd23a });
  who.group.position.set(B.maxX + MX * u, floor, MZ * u);
  who.group.rotation.y = 1.1;                   // turned toward the door, and a bit toward the learner: his left arm shows
  who.group.add(key);
  group.add(who.group, glint, click);

  const loop = 8;
  const rest = new THREE.Vector3(B.maxX + 0.62 * u, floor + 0.5 * u, 0.02 * u);   // the key at his chest
  const lower = new THREE.Vector3(B.maxX + 0.64 * u, floor + 0.3 * u, 0.04 * u);  // his hand down, after the door opens
  const A1 = new THREE.Vector3(), A2 = new THREE.Vector3(), A3 = new THREE.Vector3(), A4 = new THREE.Vector3();
  const A5 = new THREE.Vector3(), A6 = new THREE.Vector3(), A7 = new THREE.Vector3(), A8 = new THREE.Vector3();
  const A9 = new THREE.Vector3(), A10 = new THREE.Vector3(), A11 = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4();
  // A door-local point (x across the panel from the hinge, y above the ground, z out through its face) at the open angle.
  const at = (lx, ly, lz, o, out) => {
    const c = Math.cos(o), s = Math.sin(o), cy = Math.cos(YAW), sy = Math.sin(YAW);
    const px = HW + lx * c - lz * s, pz = lx * s + lz * c;
    return out.set(DX + px * cy + pz * sy, floor + ly, DZ - px * sy + pz * cy);
  };
  const front = (o, out) => out.set(Math.sin(YAW - o), 0, Math.cos(YAW - o));     // the face's normal, toward the learner

  return {
    group, loop,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { aim: [0.8, 0.7], in: [1.5, 0.3], turn: [1.9, 0.5], open: [3, 0.5],
        out: [2.75, 0.45], down: [3.5, 0.6], flat: [2.75, 0.45], shut: [5.4, 1.0], back: [6.5, 0.7] });
      pivot.rotation.y = -(T.open - T.shut) * OPEN;
      doorGroup.updateWorldMatrix(true, true);
      who.pose('Idle', t);                       // after the transform, so the bones' world matrices are fresh
      who.turn('Torso', 0, between(0, 0.16, T.aim) * (1 - T.back), 0);
      who.nod(between(3.4, 3.9, v) * (1 - between(4.9, 5.4, v)), v - 3.4);   // pleased with the open door: he nods
      who.turn('Head', 0, between(0, 0.45, T.aim) * (1 - T.back), 0);        // and keeps looking at it

      const shut = at(LX, LY, LZ, 0, A1);                       // the keyhole while the door is shut
      const nrm0 = front(0, A2);
      const hold = A3.copy(shut).addScaledVector(nrm0, 0.16 * u);   // where his hand stays after he draws the key out
      const open = (T.open - T.shut) * OPEN;
      const centre = at(LX, LY, LZ, open, A4);                  // the keyhole now (it swings with the door)
      const nrm = front(open, A5);
      const bow = A6.copy(centre).addScaledVector(nrm, 0.15 * u);   // the blade in the keyhole, the bow out on the face
      bow.lerp(rest, 1 - T.in);
      if (T.out > 0) bow.lerp(hold, T.out).lerp(lower, T.down).lerp(rest, T.back);
      // The bow's ring faces the way the blade points: at his chest toward him, at the lock straight out of the keyhole,
      // and it spins a quarter turn about the blade as he turns the key.
      const wc = A7.copy(shut); group.localToWorld(wc);
      const wr = A8.copy(rest); group.localToWorld(wr);
      const dir = A9.copy(wr).sub(wc).setY(0.06).normalize().lerp(nrm, T.aim * (1 - T.out));
      const right = A10.copy(dir).cross(UP).normalize();
      const wb = A11.copy(bow); group.localToWorld(wb);
      who.group.updateWorldMatrix(true, false);
      key.position.copy(wb).applyMatrix4(m4.copy(who.group.matrixWorld).invert());
      key.quaternion.setFromRotationMatrix(m5.makeBasis(right, UP, dir))
        .multiply(q1.setFromAxisAngle(FWD, (T.turn - T.flat) * Math.PI / 2))
        .premultiply(q2.copy(who.group.getWorldQuaternion(qa).invert()));
      key.updateMatrixWorld(true);
      // His palm against the bow's rim on the side he stands on (held things rest against the palm, not in the fist),
      // the palm turned toward the bow: he holds the key, never the door.
      const toBow = A8.copy(wb).sub(who.local(0, 0.62, 0)).setY(0).normalize();
      who.grip('L', wb, toBow, (R + TUBE) * u, 1, { out: 0.5, down: 0.7 });

      const spark = A7.copy(shut).addScaledVector(nrm0, 0.08 * u);  // the keyhole, out toward the learner
      pop(glint, pre ? 0 : bump(v, 0.6, 0.35, 0.12) * 1.2, spark.x, spark.y + 0.2 * u, spark.z + 0.02 * u);
      pop(click, pre ? 0 : bump(v, 2.5, 0.4, 0.12) * 1.2, spark.x, spark.y + 0.18 * u, spark.z + 0.04 * u);
    },
  };
}

export const SCENES = { 'q-key-door': keyDoor };
