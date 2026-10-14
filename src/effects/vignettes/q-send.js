// Model scene for 送 (plan h3, Haiku pilot): a girl kisses a letter and sends it flying over to a boy, who catches it on
// his palm, opens it, and a heart pops up. Scene type: q-send-letter.
//   loop 7 s: 0-1 she holds the letter on her right palm, lifts it to her lips (a kiss, a little heart); 1-1.5 she
//   lifts her arm and lets go; 1.5-3.8 the letter flies in a high arc with flapping wings and a dotted trail; 3.8-4 he
//   raises his right hand, palm up, and it lands; 4-5 it opens and a heart pops up; 5-5.8 both wave; 5.8-7 it fades on
//   his palm and comes back on hers.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many, HEART } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G, heartShape } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { ADULT, RIGHT, LEFT, UP, hearts, pop, person } from './q-common.js';

const Z = new THREE.Vector3(0, 0, 1), N_TRAIL = 12, FRONT = Z;   // the letter's face looks at the learner
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3(), v6 = new THREE.Vector3(), v7 = new THREE.Vector3();

// the envelope: white card, red heart seal, a flap on the top edge (its own pivot), two paper wings (their own pivots)
function letterProp(u) {
  const W = 0.16 * u, H = 0.105 * u, T = 0.012 * u;
  const seal = new THREE.ExtrudeGeometry(heartShape(), { depth: 1, bevelEnabled: false }).scale(0.045 * u, 0.045 * u, 0.004 * u).translate(0, -0.01 * u, T / 2 + 0.002 * u);
  const flapShape = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, -H * 0.5)]);
  const flapGeo = new THREE.ExtrudeGeometry(flapShape, { depth: T, bevelEnabled: false }).translate(0, 0, -T / 2);
  const letter = new THREE.Group(), flap = new THREE.Group(), wingR = new THREE.Group(), wingL = new THREE.Group();
  letter.name = 'letter';
  const body = solidProp([[G.box(W, H, T, 0, 0, 0), 0xfaf6ea], [seal, 0xd82020]], 0.35); body.name = 'letter';
  letter.add(body);
  flap.position.set(0, H / 2, T / 2); flap.add(solidProp([[flapGeo, 0xf1ead8]], 0.35));
  wingR.position.set(W / 2, 0, 0); wingR.add(solidProp([[G.box(0.09 * u, 0.03 * u, 0.004 * u, 0.045 * u, 0, 0), 0xfffdf6]], 0.5));
  wingL.position.set(-W / 2, 0, 0); wingL.add(solidProp([[G.box(0.09 * u, 0.03 * u, 0.004 * u, -0.045 * u, 0, 0), 0xfffdf6]], 0.5));
  letter.add(flap, wingR, wingL);
  return { letter, flap, wingR, wingL };
}

function sendLetter(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const girl = person('gal2', u, ADULT), boy = person('guy2', u, ADULT);
  const { letter, flap, wingR, wingL } = letterProp(u);
  const heart = solidProp(HEART(u, 0.1), 0.9), kiss = many(HEART(u, 0.08), 2, 1), trail = many([[G.sphere(0.011 * u, 0, 0, 0), 0xfff4d0]], N_TRAIL, 0.8);
  girl.group.position.set(B.maxX + 0.35 * u, floor, 0.05 * u); girl.group.rotation.y = RIGHT - 0.25;     // faces the boy, a little to the learner
  boy.group.position.set(B.maxX + 1.2 * u, floor, 0.05 * u); boy.group.rotation.y = LEFT + 0.25;
  group.add(girl.group, boy.group, letter, heart, kiss, trail);
  // group-local points (stage units): x from the kanji's right edge, y from the ground line, z to the learner
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  const S = P(0.5, 0.8, 0.1), L = P(0.92, 0.66, -0.02);                        // release point, landing point
  const flight = (f, out = new THREE.Vector3()) => out.lerpVectors(S, L, f).add(v5.set(0, 0.2 * u * 4 * f * (1 - f), 0));
  const qG = new THREE.Quaternion(), qB = new THREE.Quaternion(), qFly = new THREE.Quaternion(), qL = new THREE.Quaternion();
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      const rr = 0.008 * u * group.getWorldScale(v1).y, fl = between(v, 1.5, 3.8);
      girl.pose('Idle', t); boy.pose('Idle', t + 0.4);
      // the girl's right palm (under the letter): chest -> lips -> the release point; back to the chest for the loop's start
      const lift = between(v, 0.3, 0.9) * (1 - between(v, 6.3, 6.4)), rel = between(v, 1.0, 1.5) * (1 - between(v, 6.3, 6.4));
      const chest = girl.local(-0.12, 0.58, 0.28, v2), lips = girl.at('mouth', v3, 0, -0.1, 0.12), Sw = group.localToWorld(v4.copy(S));
      const C = v6.copy(chest).lerp(lips, lift).lerp(Sw, rel);
      const kG = pre ? A.setup : Math.max(1 - between(v, 1.5, 1.8), between(v, 6.4, 6.9));
      girl.grip('R', C, FRONT, rr, kG, { out: 0.9, down: 0.5 });   // palm behind the letter: it faces the learner
      const nG = girl.hold(letter, 'R', group, rr).clone();
      letter.position.y += 0.06 * u; const hg = letter.position.clone();   // the palm holds its lower edge, the arm stays below
      qG.setFromUnitVectors(Z, nG);
      // the boy's right palm, up, at his chest: it lands there at 3.8-4 and holds the letter until 6
      const kB = pre ? 0 : between(v, 3.6, 4.0) * (1 - between(v, 6.0, 6.4));
      const turnB = between(v, 4.0, 4.4) * (1 - between(v, 6.0, 6.4));   // palm up to catch, then turned to the front
      boy.grip('R', boy.local(-0.1, 0.7, 0.3, v2), v3.lerpVectors(UP, FRONT, turnB).normalize(), rr, kB, { out: 0.9, down: 0.5 });
      const nB = boy.hold(letter, 'R', group, rr).clone();
      letter.position.y += 0.06 * u * turnB; const hb = letter.position.clone();   // lifted only once the palm faces the front
      qB.setFromUnitVectors(Z, nB);
      // where the letter is: in her hand, in the air, catching on his palm, in his hand
      const lk = pre ? 1 : (1 - between(v, 5.8, 6.5)) + between(v, 6.5, 7.0);
      if (v < 1.5 || v >= 6.5) letter.position.copy(hg);
      else if (v < 3.8) letter.position.copy(flight(fl, letter.position));
      else if (v < 4.0) letter.position.copy(flight(1, letter.position)).lerp(hb, between(v, 3.8, 4.0));
      else letter.position.copy(hb);
      // its turn: flat on a palm, upright in the air (face to the learner)
      qFly.identity();
      if (v < 1.4 || v >= 6.5) qL.copy(qG);
      else if (v < 1.9) qL.copy(qG).slerp(qFly, between(v, 1.4, 1.9));
      else if (v < 3.7) qL.copy(qFly);
      else if (v < 4.0) qL.copy(qFly).slerp(qB, between(v, 3.7, 4.0));
      else qL.copy(qB);
      letter.quaternion.copy(qL);
      letter.visible = lk > 0.01; letter.scale.setScalar(grow(lk));
      // the wings flap in the air and fold on the palms; the flap lifts when it opens
      const flapA = 0.6 * Math.sin(v * 12) * between(v, 1.5, 1.7) * (1 - between(v, 3.6, 3.8));
      wingR.rotation.z = flapA; wingL.rotation.z = -flapA;
      flap.rotation.x = -2.2 * between(v, 4.2, 4.8) * (1 - between(v, 6.0, 6.3));
      // the trail: dots left behind the letter on its way
      for (let i = 0; i < N_TRAIL; i++) { const fi = (i + 1) / (N_TRAIL + 1), p = flight(fi, v1), show = v >= 1.5 && v < 3.8 && fl >= fi; trail.set(i, p.x, p.y, p.z, show ? 1 : 0); }
      trail.commit();
      // the kiss: a little heart at her lips; the open letter: a big heart over his palm
      const mouth = group.worldToLocal(girl.at('mouth', v7, 0, 0, 0.06));
      hearts(kiss, 2, mouth.x, mouth.y, mouth.z, pre ? 0 : v, 0.9, u);
      pop(heart, pre ? 0 : between(v, 4.6, 5.0) * (1 - between(v, 5.6, 5.9)), hb.x, hb.y + 0.3 * u, hb.z + 0.02 * u);
      // both wave: she with her right hand, he with his left (his right holds the letter)
      const wave = pre ? 0 : between(v, 5.0, 5.2) * (1 - between(v, 5.6, 5.8));
      girl.wave('R', wave, v); boy.wave('L', wave, v + 0.3);
    },
  };
}

export const SCENES = { 'q-send-letter': sendLetter };
