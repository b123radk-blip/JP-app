// Haiku plan h14 (card 533b, 医 "doctor; medicine"): scene q-doctor-checkup. A doctor in a white coat listens to a poorly
// little boy's chest with a stethoscope, gives him a pill, and the boy jumps for joy. Loop 7 s:
//   0-1.5 the boy holds his tummy (いたい…); the doctor stands, the stethoscope in his right palm at his side;
//   1.5-3.5 the doctor bows and his hand reaches the boy's chest (the palm turned to the boy); the disc is held there;
//   3.6-4.4 a pill pops over the boy's head, goes into his mouth and shrinks away as his hand goes to his mouth;
//   4.6-5.6 the boy jumps (the Jump clip lasts 1 s), a heart and stars over his head, the doctor nods; 5.6-7 both stand.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { ADULT, KID, UP, person, pop, speech, hearts } from './q-common.js';
import { many, HEART, stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { emblemProp } from '../pieces/kit-props.js';
import { G } from '../pieces/shape-kit.js';

const LOOP = 7, Y = new THREE.Vector3(0, 1, 0), DEG = Math.PI / 180;
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), Q = new THREE.Quaternion();

function checkup(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);   // group-local: x from the kanji's right edge, y up from the ground
  const doc = person('doctor', u, ADULT), boy = person('guy2', u, KID);            // the boy turned toward the doctor
  doc.group.position.copy(P(0.92, 0, -0.06)); doc.group.rotation.y = 70 * DEG;
  boy.group.position.copy(P(1.17, 0, -0.03)); boy.group.rotation.y = -70 * DEG;
  // the first-aid box: white with a grey handle on top, a red cross on its front face (toward the learner)
  const kit = solidProp([[G.box(0.24 * u, 0.17 * u, 0.14 * u, 0, 0.085 * u, 0), 0xf4f4f4], [G.torus(0.04 * u, 0.008 * u, Math.PI, 0, 0.17 * u, 0), 0x9aa0a8]], 0.5);
  const cross = solidProp([[G.box(0.12 * u, 0.04 * u, 0.01 * u, 0, 0.085 * u, 0.078 * u), 0xd03028], [G.box(0.04 * u, 0.12 * u, 0.01 * u, 0, 0.085 * u, 0.078 * u), 0xd03028]], 0.5);
  kit.name = 'kit'; cross.name = 'cross'; kit.position.copy(P(0.62, 0, 0.2)); cross.position.copy(kit.position);
  // the stethoscope: a silver disc lying on the palm, and a dark cord up to the doctor's chest
  const scope = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.008 * u), 0xc8d0dc]], 0.6), cord = solidProp([[G.cyl(0.006 * u, 0.006 * u, 1), 0x2e3440]], 0.3);
  scope.name = 'scope';
  const pill = emblemProp('pill', 0.12 * u), bubble = speech(u, 'いたい…', { h: 0.11, flip: true });
  pill.userData.flies = true; bubble.userData.flies = true;   // the pill and the speech bubble hang in the air on purpose
  const hrt = many(HEART(u, 0.1), 3, 0.6), sparkle = stars(u, { r: 0.13, s: 0.08, n: 3 });
  group.add(kit, cross, doc.group, boy.group, scope, cord, pill, bubble, hrt, sparkle);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, LOOP), pre = A.u < 0, v = pre ? 0 : A.v;
      const r = 0.03 * u * group.getWorldScale(V1).y;   // the disc's radius in world units
      // the hand reaches the chest from 1.5 to 1.8 s and goes back from 3.3 to 3.5; the bow goes with it
      const reach = between(v, 1.5, 1.8) * (1 - between(v, 3.3, 3.5)), bow = between(v, 1.5, 1.9) * (1 - between(v, 3.3, 3.5));
      const tummy = between(v, 0, 0.4) * (1 - between(v, 1.2, 1.5)), mouth = between(v, 3.7, 4.0) * (1 - between(v, 4.3, 4.6));
      const jump = !pre && v >= 4.6 && v < 5.6;
      // the boy: both hands on his tummy, then still; the jump is the Jump clip (1 s, not looped)
      if (jump) boy.pose('Jump', v - 4.6, false); else boy.pose('Idle', t);
      boy.handTo('R', boy.local(-0.06, 0.32, 0.12), tummy, { out: 0.3, down: 0.8 });
      boy.handTo('L', boy.local(0.06, 0.32, 0.12), tummy, { out: 0.3, down: 0.8 });
      boy.toMouth('R', mouth);
      // the doctor: stands; bows and reaches to the chest; at his side the disc rests on the palm facing up
      doc.pose('Idle', t);
      doc.bow(0.7 * bow);
      doc.grip('R', doc.local(-0.2, 0.5, 0.1), UP, r, 1 - reach, { out: 0.9, down: 0.5 });
      doc.handTo('R', group.localToWorld(P(1.115, 0.3, -0.01)), reach, { out: 0.4, down: 0.6 });
      if (reach > 0) doc.twist('R', boy.at('chest', V2).sub(doc.fist('R', V3)).normalize(), reach);   // the palm turns to the boy
      const n = doc.hold(scope, 'R', group, r);   // the disc rests against the palm
      scope.quaternion.setFromUnitVectors(Y, n.applyQuaternion(group.getWorldQuaternion(Q).invert()));
      // the cord: from the doctor's chest (raised a little) to the disc
      const neck = group.worldToLocal(doc.at('chest', V2, 0, 0.1, 0)), tip = scope.position.clone(), dir = tip.clone().sub(neck);
      const len = Math.max(1e-3, dir.length());
      cord.position.addVectors(neck, tip).multiplyScalar(0.5); cord.quaternion.setFromUnitVectors(Y, dir.divideScalar(len)); cord.scale.set(1, len, 1);
      // the pill: pops over the boy's head, then goes into his mouth and shrinks away
      const over = group.worldToLocal(boy.at('over', V2, 0, 0.3, 0)), face = group.worldToLocal(boy.at('mouth', V3, 0, 0, 0.05));
      const pk = between(v, 3.6, 3.8) * (1 - between(v, 4.3, 4.4)), f = between(v, 3.9, 4.3);
      pill.visible = pk > 0.01; pill.scale.setScalar(0.12 * u * grow(pk) * (1 - 0.8 * f)); pill.position.lerpVectors(over, face, f); pill.idle(t);
      // the jump: a heart rises and stars circle over his head
      hearts(hrt, 3, over.x, over.y, over.z, v, 4.6, u);
      pop(sparkle, between(v, 4.6, 4.8) * (1 - between(v, 5.4, 5.6)), over.x, over.y, over.z); sparkle.rotation.y = t * 5;
      doc.nod(between(v, 4.6, 4.9) * (1 - between(v, 5.3, 5.6)), v);
      // the boy's speech bubble: いたい… at the start
      const say = P(1.32, 0.8, -0.03);
      pop(bubble, between(v, 0.3, 0.5) * (1 - between(v, 1.3, 1.4)), say.x, say.y, say.z);
    },
  };
}

export const SCENES = { 'q-doctor-checkup': checkup };
