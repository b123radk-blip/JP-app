// 帽子 (plan 019, card w1519170): a windy day. A boy in a red cap stands in front of his dad. Loop 8 s: 0-1.0 both
// Idle, the cap worn on his head; 1.0-1.6 a gust of three white streaks sweeps left to right behind the two and the
// kanji leans away and back; 1.05-2.2 the cap blows off his head, flies up and right toward the learner, tumbling one
// turn, and drops into the dad's raised left hand (0.70, 0.62) at his left side, landing upright; 2.8-3.0 he lifts it
// a little (0.70, 0.65); 3.0-3.6 he brings it down to the boy's head from behind, his right hand coming to the other
// side of it; 3.6-4.2 both hands set it on (he bows a bit, like settling it); 4.2-4.6 he tugs it snug (a 0.01 dip and
// back); 4.6-5.0 his hands drop to his sides; 5.0-6.4 the boy bounces twice with the cap staying on and the dad nods;
// 6.4-8.0 both Idle, the cap on his head, so the loop ends where it began. The cap is sized from the boy's measured
// head (headR) and is worn with boy.wear every frame it is on his head; while held it rests against the dad's palm
// (grip), never inside it. The dad's arms reach only about 0.21u in front of his shoulders, so the held places sit at
// his left side just clear of his chest, and the set happens from behind the boy's head - the plan's own held places
// ((0.70, 0.56, 0.14) and (0.50, 0.64, 0.09) held by his hands) are 0.25-0.31u from his shoulders, past his reach.
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { KID, ADULT } from './q-common.js';

const XA = new THREE.Vector3(1, 0, 0), W = new THREE.Vector3(), W2 = new THREE.Vector3(), P1 = new THREE.Vector3(), WS = new THREE.Vector3(), L1 = new THREE.Vector3(), L2 = new THREE.Vector3(), L3 = new THREE.Vector3(), Q1 = new THREE.Quaternion();

function hatWind(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u;
  const boy = actor('guy2', KID * u), dad = actor('guy', ADULT * u);
  // the cap, sized from the boy's real head: crown radius headR(0.11) + 0.01, a touch deeper than wide, peak in front
  const ku = KID * u, rc = boy.headR(0.11);
  const capR = (rc + 0.01) * ku, capH = 0.07 * ku, domeH = 0.1 * ku;
  const cap = solidProp([
    [G.cyl(capR, capR, capH, 0, capH / 2, 0).scale(1, 1, 1.08), 0xd03040],
    [G.dome(capR, domeH, 0, capH, 0).scale(1, 1, 1.08), 0xd03040],
    [G.box(1.1 * capR, 0.02 * ku, 0.6 * capR, 0, 0.03 * ku, 1.33 * capR), 0xd03040],
  ], 0.3);
  cap.name = 'cap';
  const gust = solidProp([
    [G.box(0.5 * u, 0.015 * u, 0.02 * u, 0, 0.45 * u, 0), 0xffffff],
    [G.box(0.5 * u, 0.015 * u, 0.02 * u, -0.05 * u, 0.65 * u, 0), 0xffffff],
    [G.box(0.5 * u, 0.015 * u, 0.02 * u, 0.05 * u, 0.85 * u, 0), 0xffffff],
  ], 0.9);
  gust.name = 'gust'; gust.userData.flies = true;   // a wind streak: in the air on purpose
  const onCap = new THREE.Object3D();                                   // helper: where wear() puts the cap, each frame
  group.add(boy.group, dad.group, cap, gust, onCap);
  // the flight (group space): worn place -> up right and toward the learner -> down to the dad's left hand;
  // the held place, then a little higher, both at his left side just clear of his chest
  const flyW = [new THREE.Vector3(), new THREE.Vector3(X(0.68), floor + 0.84 * u, 0.3 * u), new THREE.Vector3(X(0.84), floor + 0.72 * u, 0.28 * u), new THREE.Vector3(X(0.7), floor + 0.62 * u, 0)];
  const flyT = [0, 0.2917, 0.625, 1], caught = flyW[3], over = new THREE.Vector3(X(0.7), floor + 0.65 * u, 0);
  const loop = 8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), v = A.u < 0 ? -1 : A.v;
      const ws = group.getWorldScale(WS).y, r = 0.012 * u * ws;
      boy.pose('Idle', t); dad.pose('Idle', t);
      boy.group.position.set(X(0.45), floor + 0.06 * u * (bump(v, 5.0, 0.7) + bump(v, 5.7, 0.7)), 0.15 * u);   // two happy bounces
      dad.group.position.set(X(0.48), floor, -0.07 * u);
      // the cap worn on his head every frame (it rides his bounce and head turn); the 4.2-4.6 tug dips it 0.01 and back
      boy.wear(onCap, group, rc + 0.01, { sink: 0.01 * bump(v, 4.2, 0.4) });
      // the boy follows the cap with his eyes, then throws both hands up in surprise
      const look = between(v, 1.1, 1.35) * (1 - between(v, 1.8, 2.0));
      boy.turn('Head', -0.45 * look);
      const hands = between(v, 1.2, 1.45) * (1 - between(v, 1.7, 1.9));
      boy.handTo('L', boy.local(0.18, 0.85, 0.06), hands, { out: 0.6, down: 0.5 });
      boy.handTo('R', boy.local(-0.18, 0.85, 0.06), hands, { out: 0.6, down: 0.5 });
      // the gust sweeps left to right behind the two; the kanji leans away from it and back
      gust.visible = v >= 1.0 && v < 1.6;
      gust.position.set(X(-0.3) + (X(1.4) - X(-0.3)) * ((v - 1.0) / 0.6), floor, -0.35 * u);
      stage.glyph.rotation.z = -0.08 * bump(v, 1.3, 0.6);
      // the cap: worn (0-1.05, 3.6-8) -> blown off, tumbling (1.05-2.2) -> held, lifted (2.2-3.0)
      // -> down to the boy's head from behind (3.0-3.6)
      cap.userData.flies = v >= 1.05 && v < 2.2;
      if (v < 1.05 || v >= 3.6) { cap.position.copy(onCap.position); cap.quaternion.copy(onCap.quaternion); }
      else if (v < 2.2) {
        const f = (v - 1.05) / 1.15;
        flyW[0].copy(onCap.position);
        if (f < flyT[1]) P1.lerpVectors(flyW[0], flyW[1], f / flyT[1]);
        else if (f < flyT[2]) P1.lerpVectors(flyW[1], flyW[2], (f - flyT[1]) / (flyT[2] - flyT[1]));
        else { const ft = (f - flyT[2]) / (1 - flyT[2]); P1.lerpVectors(flyW[2], flyW[3], ft * ft * ft); }   // a quick drop
        cap.position.copy(P1);
        Q1.setFromAxisAngle(XA, 2 * Math.PI * f);                                   // one turn, landing upright
        cap.quaternion.slerpQuaternions(onCap.quaternion, Q1, Math.min(1, f * 4));
      }
      else if (v < 3.0) { cap.position.copy(P1.copy(caught).lerp(over, between(v, 2.8, 3.0))); cap.quaternion.identity(); }
      else { cap.position.lerpVectors(over, onCap.position, between(v, 3.0, 3.6)); cap.quaternion.identity(); }
      // the dad bows a bit while he sets it, then nods; his gestures come first so the grips solve against the final pose
      dad.bow(0.3 * between(v, 3.2, 3.6) * (1 - between(v, 4.5, 4.8)));
      dad.nod(between(v, 5.0, 5.2) * (1 - between(v, 6.1, 6.4)), t);
      // the hands hold the cap from behind (its back, toward the dad), left hand from the catch, right from 3.45
      const kL = between(v, 1.8, 2.0) * (1 - between(v, 4.6, 4.8));
      const kR = between(v, 3.45, 3.75) * (1 - between(v, 4.6, 4.8));
      const C = L1.copy(cap.position);
      if (kL > 0) {
        // from the catch it holds the cap's back-left; as the cap comes to the boy's head it slides to the cap's left side
        const eL = between(v, 3.4, 3.6);
        const T = L2.set(C.x + (0.05 + 0.025 * eL) * u, C.y + 0.02 * u, C.z + (-0.09 + 0.06 * eL) * u);
        dad.grip('L', group.localToWorld(W.copy(T)), W2.copy(C).sub(T).normalize(), r, kL, { out: 0.3, down: 0.4 });
      }
      if (kR > 0) {
        const T = L3.set(C.x - 0.05 * u, C.y + 0.02 * u, C.z - 0.09 * u);
        dad.grip('R', group.localToWorld(W.copy(T)), W2.copy(C).sub(T).normalize(), r, kR, { out: 0.3, down: 0.4 });
      }
    },
  };
}

export const SCENES = { 'q-hat-wind': hatWind };
