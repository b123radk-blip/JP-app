// 鍵 (plan 022, card w1260490): at night a man stands at his locked front door. Loop 8 s: 0-1.0 Idle, the door shut,
// he holds his gold key up in front of him, the blade pointing at the door; it glints once at 0.5; 1.0-1.85 he
// brings the key to the lock, the blade lining up and sliding straight in (the last 0.1u of the move along the
// door's back direction), the tip 0.01u inside the door's face by 1.85; 2.0-2.45 he turns it about 80° about its blade
// (the ring sweeping round in the lock, his hand above the bow, the palm down every frame); at 2.45 a click (a small
// yellow star at the lock); 2.45-3.0 he holds the turned key in the lock; 3.0-3.7 the door swings open 75° about its hinge onto the warm lit
// room, the key drawn out at 3.0 (0.1u back along the blade, un-turned by 3.3) and his hand lowered to about
// (0.70, 0.40, 0.12) by 3.55; 3.3-5.4 he looks at the open door,
// pleased, and nods, the key in his hand; 5.4-6.4 the door swings shut; 6.4-8.0 Idle, the key back up in front of
// him, so the loop ends where it began. He grips the key by its bow (palm against the ring's flat side, never the
// fist round it); the key's pivot is its blade's tip.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { pop } from './q-common.js';
import { ADULT } from './q-common.js';

const UP = new THREE.Vector3(0, 1, 0), W = new THREE.Vector3(), W2 = new THREE.Vector3(), BOW = new THREE.Vector3(), Q = new THREE.Quaternion();

function keyDoor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u;
  const man = actor('guy3', ADULT * u);
  // the door, turned 45° toward the learner and the kanji (rotation.y -π/4: its front faces left and toward you),
  // standing on the floor with its middle at x 0.95, z -0.1
  const assembly = new THREE.Group();
  assembly.position.set(X(0.95), floor, -0.1 * u);
  assembly.rotation.y = -Math.PI / 4;
  const R = new THREE.Matrix4().makeRotationY(-Math.PI / 4);
  const f = new THREE.Vector3(0, 0, 1).applyMatrix4(R);                        // the door's front direction (world)
  const frameL = solidProp([[G.box(0.06 * u, 0.92 * u, 0.08 * u), 0x4a2e1a]], 0.3);
  frameL.name = 'door frame';
  frameL.position.set(-0.24 * u, 0.46 * u, 0);
  const frameR = solidProp([[G.box(0.06 * u, 0.92 * u, 0.08 * u), 0x4a2e1a]], 0.3);
  frameR.name = 'door frame';
  frameR.position.set(0.24 * u, 0.46 * u, 0);
  const frameTop = solidProp([[G.box(0.54 * u, 0.08 * u, 0.08 * u), 0x4a2e1a]], 0.3);
  frameTop.name = 'door frame';
  frameTop.position.set(0, 0.89 * u, 0);
  const roomLight = solidProp([[G.box(0.42 * u, 0.85 * u, 0.015 * u, 0, 0.425 * u, -0.12 * u), 0xffd27a]], 1.4);   // behind the opening
  roomLight.name = 'room light';
  const hinge = new THREE.Group();                                             // hinged at the door's right edge
  hinge.position.set(0.21 * u, 0, 0);
  const panel = new THREE.Group();                                             // the door's middle
  panel.position.set(-0.21 * u, 0.425 * u, 0);
  hinge.add(panel); assembly.add(hinge, frameL, frameR, frameTop, roomLight);   // the door first: goals find 'door' before the frame's
  const door = solidProp([
    [G.box(0.42 * u, 0.85 * u, 0.04 * u), 0x7a4a2a],
    [G.sphere(0.015 * u, -0.15 * u, 0.075 * u, 0.028 * u), 0xe0b030],           // the knob, 0.06 in from the left edge
  ], 0.3);
  door.name = 'door';
  const lock = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.012 * u, -0.15 * u, 0.015 * u, 0.026 * u, Math.PI / 2, 0, 0), 0x101010]], 0.2);
  lock.name = 'lock';
  panel.add(door, lock);
  // the key (pivot: the blade's tip): a bow (a ring) and a blade 0.12 long with two teeth near the tip, gold
  const key = solidProp([
    [G.box(0.12 * u, 0.02 * u, 0.01 * u, 0.06 * u, 0, 0), 0xe0b030],
    [G.box(0.012 * u, 0.012 * u, 0.01 * u, 0.02 * u, -0.015 * u, 0), 0xe0b030],
    [G.box(0.012 * u, 0.012 * u, 0.01 * u, 0.045 * u, -0.015 * u, 0), 0xe0b030],
    [G.torus(0.045 * u, 0.012 * u, Math.PI * 2, 0.165 * u, 0, 0), 0xe0b030],
  ], 0.5);
  key.name = 'gold key';
  const glint = burst(u, { s: 0.08, n: 5, color: 0xffffff });                   // the glint at 0.5
  const click = burst(u, { s: 0.12, n: 6, color: 0xffe060 });                   // the click at 2.3
  group.add(man.group, assembly, key, glint, click);
  man.group.position.set(X(0.45), floor, -0.02 * u);
  man.group.rotation.y = 0.6;
  // the key's frame: blade along the door's back direction, ring in a vertical plane (its normal n1); the places
  // its bow visits (group space), from the lock's position on the door's face
  // the key's frame: blade along the door's front direction, ring in a vertical plane (its flat side toward the man)
  const n1 = W2.copy(f).cross(UP);                                             // the ring's normal at rest, horizontal
  const qBase = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(f, UP, n1));
  const lockW = new THREE.Vector3(-0.15 * u, 0.44 * u, 0.026 * u).applyMatrix4(R).add(assembly.position);
  const bowLock = lockW.clone().addScaledVector(f, 0.151 * u);                   // the in-lock bow, door shut
  const P0 = new THREE.Vector3(X(0.72), floor + 0.45 * u, 0.12 * u);             // held up in front of him
  const Palign = bowLock.clone().addScaledVector(f, 0.13 * u);                  // lined up with the lock, the blade clear
  const Pout = bowLock.clone().addScaledVector(f, 0.251 * u);                   // drawn back 0.1u along the blade
  const P3 = new THREE.Vector3(X(0.70), floor + 0.40 * u, 0.12 * u);             // lowered
  const loop = 8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { approach: [1.0, 0.6], slide: [1.6, 0.25], turn: [2.0, 0.45], open: [3.0, 0.7],
        pull: [3.0, 0.3], unturn: [3.0, 0.3], lower: [3.15, 0.4], close: [5.4, 1.0], raise: [6.4, 0.6] });
      // the palm pinches the ring's outer band from above: the radius shrinks as the ring tips toward horizontal,
      // so the fist stays clear of the ring's band at every angle and the hand stays on the key
      const ws = group.getWorldScale(W).y, amt = Math.abs(T.turn - T.unturn), r = (0.045 - 0.018 * amt) * u * ws;
      man.pose('Idle', t);
      man.group.position.set(X(0.45), floor, -0.02 * u);
      man.group.rotation.y = 0.6;
      const look = between(v, 3.3, 3.6) * (1 - between(v, 5.1, 5.4));           // he looks at the open door
      man.turn('Head', 0, 1.0 * look, 0);
      man.nod(0.8 * between(v, 4.0, 4.3) * (1 - between(v, 5.0, 5.3)), v);      // pleased
      // the door swings open 75° about its hinge, inward, away from the learner, and back
      hinge.rotation.y = -1.309 * (T.open - T.close);
      // the key: held up -> to the lock, sliding straight in -> turned a quarter turn, held in the lock -> drawn
      // out, un-turned, lowered -> up again (it leaves the lock at 3.0, as the door begins to swing)
      const th = -1.4 * (T.turn - T.unturn);                                   // an 80° turn about the blade (in the lock)
      BOW.copy(P0).lerp(Palign, T.approach).lerp(bowLock, T.slide).lerp(Pout, T.pull).lerp(P3, T.lower).lerp(P0, T.raise);
      key.position.copy(BOW).addScaledVector(f, -0.165 * u);                    // the pivot is the blade's tip
      key.quaternion.copy(Q.setFromAxisAngle(f, th)).multiply(qBase);           // the world turn about the blade first, then the key's frame
      // the palm above the bow (pinching the ring's outer band from above), steady through the turn
      man.grip('L', group.localToWorld(BOW.clone()), W2.set(0, -1, 0), r, 1, { out: 0.6, down: 0.6 });
      pop(glint, pre ? 0 : bump(v, 0.35, 0.5), BOW.x, BOW.y + 0.03 * u, BOW.z);
      pop(click, pre ? 0 : bump(v, 2.45, 0.4), lockW.x - 0.014 * u, lockW.y, lockW.z + 0.014 * u);   // in front of the lock
    },
  };
}

export const SCENES = { 'q-key-door': keyDoor };
