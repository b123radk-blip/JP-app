// 鍵 / カギ (q-key-door): at night a man stands at his shut front door. He pinches his gold key by its bow (palm against
// its flat side, never round it), puts the blade into the lock on the door's latch edge, turns it a quarter turn - click -
// and the door swings open inward onto a warm lit room. He draws the key out and lowers his hand, looks at the open door
// and nods; the door shuts and he lifts the key again, so the loop ends where it started.
// Loop 8 s: 0-1.0 Idle, the key held up in front of him (it glints once at 0.5); 1.0-1.7 he brings it to the lock, the
// last 0.1u straight along the door's back direction, the tip in by 1.85; 1.85-2.3 a quarter turn about the blade, the
// click at the lock at 2.3; 2.3-3.3 the door swings open 75° about its hinge, the key drawn back 0.1u along the blade at
// 2.4 and his hand lowered by 3.0; 3.3-5.4 he nods at the open door; 5.4-6.4 the door swings shut; 6.4-8.0 the key back up.
// The door, its knob and its lock ride on a pivot at the hinge (its right edge) and swing inward, away from the learner;
// the frame and the light panel stand behind the opening, so the light only shows when the door opens. The key's pivot is
// its blade's tip, so putting the tip puts the key in the lock.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { pop, ADULT } from './q-common.js';

const YAW = -Math.PI / 4;                           // the door turned 45° toward the learner and the kanji
const OPEN = 75 * Math.PI / 180;                    // how far it swings, inward, away from the learner
const UP = new THREE.Vector3(0, 1, 0), LZ = new THREE.Vector3(0, 0, 1), FWD = new THREE.Vector3(0, 0, 1);
const q1 = new THREE.Quaternion(), qa = new THREE.Quaternion();
const GOLD = 0xe0b030;                              // the key and the knob

export function keyDoor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const DX = B.maxX + 0.95 * u, DZ = -0.1 * u;      // the shut door's middle
  const HW = 0.21 * u, HT = 0.85 * u, DT = 0.04 * u;             // half its width, its height, its thickness
  const FW = 0.05 * u, FD = 0.06 * u;                            // the frame's posts: across, deep
  const LK = -2 * HW + 0.06 * u, FY = 0.44 * u, KY = 0.42 * u;      // the lock and knob: 0.06 in from the latch edge; the blade in the slit's lower part
  const R = 0.045 * u, TUBE = 0.012 * u, BLADE = 0.12 * u;       // the key: bow ring, its wire, its blade
  const MX = 0.56, MZ = 0.02;                                    // the man's feet, left of the door's face

  // The door's own frame: x measured from the hinge (the latch edge sits at -2*HW), z out through its front face.
  const doorGroup = new THREE.Group();
  doorGroup.position.set(DX, floor, DZ); doorGroup.rotation.y = YAW;
  const pivot = new THREE.Group(); pivot.position.set(HW, 0, 0);   // the hinge, at the door's right edge
  doorGroup.add(pivot);
  const frame = solidProp([
    [G.box(FW, HT, FD, -(HW + FW / 2), HT / 2, FD / 2), 0x4a2e1a],
    [G.box(FW, HT, FD, HW + FW / 2, HT / 2, FD / 2), 0x4a2e1a],
    [G.box(2 * HW + 2 * FW, FW, FD, 0, HT + FW / 2, FD / 2), 0x4a2e1a],   // the lintel over the opening
  ], 0.1);
  frame.name = 'door frame'; doorGroup.add(frame);
  const room = solidProp([[new THREE.PlaneGeometry(2 * HW - 0.02 * u, HT - 0.02 * u), 0xffd27a]], 1.5);
  room.position.set(0, HT / 2, -(DT / 2 + 0.03 * u));   // just behind the opening, no wider than it: the shut door hides it
  room.name = 'room light'; doorGroup.add(room);
  const door = solidProp([
    [G.box(2 * HW, HT, DT, -HW, HT / 2, 0), 0x7a4a2a],
    [G.box(0.16 * u, 0.11 * u, 0.012 * u, -0.3 * u, 0.355 * u, DT / 2 + 0.01 * u), 0x8d5c36],   // the rail under the keyhole
    [G.box(0.14 * u, 0.24 * u, 0.012 * u, -0.3 * u, 0.62 * u, DT / 2 + 0.006 * u), 0x8d5c36],   // the panel above it
    [G.sphere(0.025 * u, LK, 0.5 * u, DT / 2 + 0.025 * u), GOLD],                                          // the knob
  ], 0.12);
  door.name = 'door'; pivot.add(door);
  // The keyhole: a small near-black disc on the door's front face with a slit in it, so it swings with the door.
  const lock = solidProp([
    [G.cyl(0.03 * u, 0.03 * u, 0.012 * u, LK, FY, DT / 2 + 0.006 * u, Math.PI / 2), 0x101010],
    [G.box(0.01 * u, 0.02 * u, 0.008 * u, LK, KY, DT / 2 + 0.014 * u), 0x241f17],
  ], 0.2);
  lock.name = 'lock'; pivot.add(lock);

  const who = actor('guy3', ADULT * u);
  // The key's own frame: its pivot is the blade's tip, its +z runs from the tip to the bow's ring. One solidProp, hung on
  // the man, so it is scaled back out of his group's scale.
  const key = solidProp([
    [G.torus(R, TUBE, Math.PI * 2, 0, 0, BLADE + R), GOLD],
    [G.box(0.02 * u, 0.01 * u, BLADE, 0, 0, BLADE / 2), GOLD],
    [G.box(0.012 * u, 0.02 * u, 0.012 * u, 0, -0.015 * u, 0.018 * u), GOLD],                 // two teeth near the tip
    [G.box(0.012 * u, 0.015 * u, 0.012 * u, 0, -0.012 * u, 0.042 * u), GOLD],
  ], 0.6);
  key.name = 'gold key';
  key.scale.setScalar(1 / who.group.scale.x);
  const glint = burst(u, { s: 0.1, n: 6, color: 0xffffff });
  const click = burst(u, { s: 0.16, n: 8, color: 0xffd23a });
  who.group.position.set(B.maxX + MX * u, floor, MZ * u);
  who.group.rotation.y = 0.6;                 // turned 34° toward the door's side, and a bit to the learner: his face shows
  who.group.add(key);
  group.add(doorGroup, who.group, glint, click);

  const loop = 8;
  const rest = new THREE.Vector3(B.maxX + 0.72 * u, floor + 0.45 * u, 0.12 * u);   // the key up in front of him, blade at the door
  const lower = new THREE.Vector3(B.maxX + 0.70 * u, floor + 0.40 * u, 0.12 * u);  // his hand down, after the door opens
  const A1 = new THREE.Vector3(), A2 = new THREE.Vector3(), A3 = new THREE.Vector3(), A4 = new THREE.Vector3();
  const A5 = new THREE.Vector3(), A6 = new THREE.Vector3(), A7 = new THREE.Vector3(), A8 = new THREE.Vector3();
  const A9 = new THREE.Vector3(), A10 = new THREE.Vector3(), A11 = new THREE.Vector3(), A12 = new THREE.Vector3();
  const A13 = new THREE.Vector3(), A14 = new THREE.Vector3(), A15 = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4();
  // A door-local point (x across the panel from the hinge, y above the ground, z out through its face) at the open angle.
  const at = (px, py, pz, o, out) => {
    const c = Math.cos(o), s = Math.sin(o), cy = Math.cos(YAW), sy = Math.sin(YAW);
    const ax = HW + px * c - pz * s, az = px * s + pz * c;
    return out.set(DX + ax * cy + az * sy, floor + py, DZ - ax * sy + az * cy);
  };
  const front = (o, out) => out.set(Math.sin(YAW - o), 0, Math.cos(YAW - o));     // the face's normal, toward the learner

  return {
    group, loop,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [1, 0.7], slide: [1.6, 0.25], turn: [1.85, 0.45], open: [2.3, 1],
        out: [2.4, 0.5], down: [2.5, 0.5], shut: [5.4, 1], back: [6.4, 1.6] });
      pivot.rotation.y = -(T.open - T.shut) * OPEN;
      doorGroup.updateWorldMatrix(true, true);
      who.pose('Idle', t);                       // after the transforms, so the bones' world matrices are fresh
      const look = T.in * (1 - T.back);
      who.turn('Torso', 0, 0.12 * look, 0);
      who.turn('Head', 0, 0.22 * look, 0);       // he watches his hand go in, and the door as it opens
      who.nod(pre ? 0 : between(v, 3.3, 3.8) * (1 - between(v, 4.9, 5.4)), v - 3.3);   // pleased with the open door

      const open = (T.open - T.shut) * OPEN;
      const face = at(LK, KY, DT / 2, open, A1);                       // the keyhole, on the face, swinging with the door
      const nrm = front(open, A2);
      const bowIn = A3.copy(face).addScaledVector(nrm, BLADE + R - 0.01 * u);   // blade straight in: the tip 0.01u inside
      const bowTouch = A4.copy(bowIn).addScaledVector(nrm, 0.1 * u);            // the blade at the face, not in yet
      const bow = A5.copy(rest).lerp(bowTouch, T.in).lerp(bowIn, T.slide);      // the last 0.1u along the door's back direction
      if (T.out > 0) bow.addScaledVector(nrm, 0.1 * u * T.out).lerp(lower, T.down).lerp(rest, T.back);
      // The key's +z from the tip to the bow: at his chest the blade points at the door, at the lock straight out of it,
      // and it spins a quarter turn about the blade as he turns it.
      const dir = A6.copy(face).sub(rest).setY(0).normalize().negate().lerp(nrm, T.in).normalize();
      const tip = A8.copy(bow).addScaledVector(dir, -(BLADE + R));
      who.group.updateWorldMatrix(true, false);
      const bowW = A9.copy(bow).applyMatrix4(group.matrixWorld);           // world: the bow's middle, the blade's tip
      const tipW = A10.copy(tip).applyMatrix4(group.matrixWorld);
      const dw = A11.copy(dir).transformDirection(group.matrixWorld);
      const inv = m4.copy(who.group.matrixWorld).invert();          // world -> the man's frame
      key.position.copy(tipW).applyMatrix4(inv);
      const upK = A15.copy(UP).addScaledVector(dw, -dw.dot(UP)).normalize();   // the key's own up, so its teeth hang down
      key.quaternion.setFromRotationMatrix(m5.makeBasis(A7.crossVectors(upK, dw), upK, dw))
        .multiply(q1.setFromAxisAngle(FWD, Math.max(0, T.turn - T.out) * Math.PI / 2))
        .premultiply(qa.copy(who.group.getWorldQuaternion(q1).invert()));
      key.updateMatrixWorld(true);
      // His palm on the bow's rim, on the side toward the learner, pressing it flat (held things rest against the palm,
      // never inside the fist): he holds the key, never the door.
      const side = A12.copy(LZ).addScaledVector(dw, -dw.dot(LZ)).normalize();  // across the blade, toward the learner
      who.grip('L', A13.copy(bowW).addScaledVector(side, R), A14.copy(side).negate(), 0.03 * u, 1, { out: 0.5, down: 0.7 });

      pop(glint, pre ? 0 : bump(v, 0.5, 0.4) * 1.2, bow.x, bow.y + 0.07 * u, bow.z);   // the bow glints once
      pop(click, pre ? 0 : bump(v, 2.3, 0.4) * 1.2,                                    // the click, at the lock
        face.x + nrm.x * 0.06 * u, face.y + 0.03 * u, face.z + nrm.z * 0.06 * u);
    },
  };
}

export const SCENES = { 'q-key-door': keyDoor };
