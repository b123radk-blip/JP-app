// 鍵 (w1260490) / plans/qwen/queue/024-kagi-key-flash.md — a man unlocks the door and it swings open.
// The door stands to the kanji's right, turned -45° so its face looks back at him. He holds a gold key up in front of
// him, reaches it 0.1u out from the lock, puts the blade in the keyhole, turns it a quarter, the lock clicks, a beat
// later the door swings inward on its hinges (away from the learner) carrying the key with it, then he withdraws the key,
// lowers his hand, looks at the open door and nods, and the door shuts again for the loop to restart.
import * as THREE from 'three';
import { actor } from './model-kit.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { pop } from './q-common.js';
import { acts, timeline, bump } from './timeline.js';

const UP = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
const OPEN = 75 * Math.PI / 180;   // how far the door swings inward, past the jamb away from the learner
const TURN = Math.PI / 2;          // the key's quarter turn in the lock
const BLADE = 0.12;                // the key: from its blade's tip to the middle of its bow ring, in glyph heights
const RING = 0.045, TUBE = 0.012;  // the bow: a ring of that radius, the tube that forms it
const HINGE = new THREE.Vector3(-0.24, 0, 0), LOCK = new THREE.Vector3(0.0944, 0.44, 0.016);
const LP = new THREE.Vector3(), LOCKAT = new THREE.Vector3(), BOWIN = new THREE.Vector3(), BOWOUT = new THREE.Vector3(),
  PLACE = new THREE.Vector3(), REST = new THREE.Vector3(), LOW = new THREE.Vector3(), TIP = new THREE.Vector3(),
  AWAY = new THREE.Vector3(), GP = new THREE.Vector3(), NY = new THREE.Vector3(), N = new THREE.Vector3(),
  NG = new THREE.Vector3(), RY = new THREE.Quaternion(), QP = new THREE.Quaternion(), QI = new THREE.Quaternion(),
  QK = new THREE.Quaternion(), M4 = new THREE.Matrix4();

export function keyDoor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u, Y = (y) => floor + y * u;      // x from the kanji's right edge, y above the ground
  const who = actor('guy3', 0.9 * u);              // an adult at 0.9 glyph heights
  who.group.position.set(X(0.56), floor, 0.02 * u);
  who.group.rotation.y = 0.6;                      // about 34°: he faces the doorway, the learner sees three-quarters
  const doorway = new THREE.Group();
  doorway.position.set(X(0.95), floor, -0.1 * u);
  doorway.rotation.y = -Math.PI / 4;               // turned -45°, its face looking back at the kanji
  // the jambs stand outside the panel, the lintel over its top; the frame is let into the wall, so it rests on nothing
  const frame = solidProp([
    [G.box(0.07 * u, 0.85 * u, 0.055 * u, -0.275 * u, 0.425 * u, 0), 0x4a3222],
    [G.box(0.07 * u, 0.85 * u, 0.055 * u, 0.275 * u, 0.425 * u, 0), 0x4a3222],
    [G.box(0.6 * u, 0.07 * u, 0.055 * u, 0, 0.89 * u, 0), 0x4a3222],
  ], 0.95);
  frame.name = 'jambs';
  frame.userData.flies = true;                     // hung in the wall: the panel in front of it is not what holds it up
  const room = solidProp([[G.box(0.42 * u, 0.84 * u, 0.01 * u, 0, 0.42 * u, -0.3 * u), 0xffd27a]], 0.95);
  room.name = 'room light';
  // (it lights the doorway only once the door has swung: while the door is shut the room behind it is dark to the learner)
  // the panel hinges on the jamb away from the learner, so a positive turn swings it inward, away from the seat
  const hinge = new THREE.Group(); hinge.position.set(HINGE.x * u, 0, 0);
  const door = solidProp([
    [G.box(0.45 * u, 0.85 * u, 0.026 * u, 0.225 * u, 0.425 * u, 0), 0x7a4a2a],
    [G.sphere(0.016 * u, LOCK.x * u, 0.36 * u, 0.028 * u), 0xe0b030],   // the knob, under the keyhole
  ], 0.3);
  door.name = 'door';
  // the dark keyhole plate rides the door's face: the key's blade goes in just behind it, and it swings with the door
  const lock = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.012 * u, LOCK.x * u, LOCK.y * u, LOCK.z * u, Math.PI / 2), 0x101010]], 0.1);
  lock.name = 'lock';
  lock.userData.flies = true;                      // it rides the door's face and swings with it: it stands on nothing
  hinge.add(door, lock); doorway.add(frame, room, hinge);

  // the key: pivot at the blade's tip, the blade along its +z, the bow ring's flat sides facing its +z and -z
  const key = solidProp([
    [G.box(0.02 * u, 0.01 * u, BLADE * u, 0, 0, BLADE / 2 * u), 0xe0b030],
    [G.box(0.014 * u, 0.008 * u, 0.03 * u, 0, -0.014 * u, 0.095 * u), 0xe0b030],
    [G.box(0.014 * u, 0.008 * u, 0.022 * u, 0, -0.014 * u, 0.058 * u), 0xe0b030],
    [G.torus(RING * u, TUBE * u, Math.PI * 2, 0, 0, BLADE * u), 0xe0b030],
  ], 0.7);
  key.name = 'gold key';
  who.group.add(key);                              // his: it moves with him, so inspect counts it as carried, not floating
  const glint = burst(u, { s: 0.1, n: 4, color: 0xffffff }), click = burst(u, { s: 0.14, n: 6, color: 0xffd54a });
  group.add(who.group, doorway, glint, click);
  const loop = 8, r = (RING + TUBE + 0.012) * u;   // the palm sits just off the bow's tube, never in it
  // where the doorway stands, and where the keyhole sits in the door's own frame (measured from its hinge edge)
  const at = doorway.position.clone(), yaw = -Math.PI / 4;

  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), v = A.u < 0 ? -1 : A.v;
      const B2 = timeline(v, { near: [1.0, 0.5], in: [1.5, 0.35], turn: [1.85, 0.45], open: [2.9, 0.55], out: [3.5, 0.35],
        down: [3.65, 0.35], shut: [5.4, 1.0], back: [6.4, 1.0] });
      who.pose('Idle', t);
      hinge.rotation.y = OPEN * (B2.open * (1 - B2.shut));                 // shut, 75° open, shut again
      room.visible = hinge.rotation.y > 0.1;                               // the warm room shows through only while the door is open
      // the door's front normal this frame (the key's blade lies along it) and the keyhole's place, both worked from the
      // yaw and the hinge angle, so they depend only on t: a sought frame gives the same numbers as a rendered one
      const q = RY.setFromAxisAngle(UP, yaw + hinge.rotation.y);
      const n = N.copy(Z).applyQuaternion(q);
      const lockAt = LOCKAT.copy(LOCK).applyAxisAngle(UP, hinge.rotation.y).add(HINGE).multiplyScalar(u)
        .applyAxisAngle(UP, yaw).add(at);
      const bowIn = BOWIN.copy(lockAt).addScaledVector(n, (BLADE - 0.004) * u);   // the bow with the blade in the keyhole
      const bowOut = BOWOUT.copy(bowIn).addScaledVector(n, 0.1 * u);              // held 0.1u out, in line with the lock
      // the bow's ring centre (world): up in front of him -> 0.1u out -> in the lock (and off with the door) -> out ->
      // lowered -> back up, so the loop ends where it started
      const rest = REST.set(X(0.72), Y(0.45), 0.12 * u);
      const place = PLACE.copy(rest)
        .lerp(bowOut, B2.near).lerp(bowIn, B2.in).lerp(bowOut, B2.out)
        .lerp(LOW.set(X(0.70), Y(0.40), 0.12 * u), B2.down * (1 - B2.back)).lerp(rest, B2.back);
      // the key's own +y (the flat side of its blade) faces up at rest and swings a quarter turn with the key in the lock
      const ny = NY.copy(UP).applyAxisAngle(n, TURN * B2.turn);
      const tip = TIP.copy(place).addScaledVector(n, -BLADE * u);
      M4.lookAt(tip, AWAY.copy(tip).addScaledVector(n, -1), ny);
      QK.setFromRotationMatrix(M4);
      // the key hangs off the man's group (so inspect counts it as something he carries): his group sits in this same
      // space, so the tip's place and the key's turn are written in his frame, not in world space
      const mq = QP.setFromAxisAngle(UP, who.group.rotation.y), qi = QI.copy(mq).invert();
      key.position.copy(GP.copy(tip).sub(who.group.position).applyQuaternion(qi));
      key.quaternion.copy(qi.multiply(QK));
      // he watches the open door and nods; then the grip: the palm against the face of the bow he holds (hand -> bow =
      // -n tilted up a little, so the fist rests on the ring's flat side and clear of its tube). The IK works in world
      // space, so the point and the direction are lifted out of this group first.
      who.turn('Head', 0, 0.5 * between(v, 4.0, 4.4) * (1 - between(v, 5.2, 5.6)));
      who.nod(between(v, 4.3, 4.6) * (1 - between(v, 5.0, 5.3)), v);
      const wp = GP.copy(place); group.localToWorld(wp);
      who.grip('L', wp, NG.copy(n).addScaledVector(ny, 0.8).normalize().negate().transformDirection(group.matrixWorld),
        r, 1, { out: 0.5, down: 0.9 });
      pop(glint, bump(v, 0.4, 0.35), place.x, place.y + 0.06 * u, place.z);
      pop(click, bump(v, 2.3, 0.4), lockAt.x, lockAt.y, lockAt.z);
    },
  };
}

export const SCENES = { 'q-key-door': keyDoor };
