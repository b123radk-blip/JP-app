// 考 (plan 018): an old man sits on a cushion in front of a shogi board, thinking hard.
// Loop 7.5 s: 0-0.6 he sits looking at the board, hands on his thighs; 0.6-1.2 his right hand goes to his chin and his
// head tilts; 1.2-3.6 he thinks, his head rocks, and thought dots (1.3, 1.6) and a bubble with a ? (1.9) pop in;
// 3.6-4.0 the ? pops out and a lightbulb with a burst pops in, and 3.7-4.2 his finger goes up beside his head;
// 4.3-4.6 he leans in and his hand goes to the moving piece; 4.7-5.2 the piece slides to its new square with his hand
// on it; 5.25-5.5 he lets go and sits up, his hand back to his thigh; 5.5-6.2 he nods, pleased; 6.0-6.5 the bubble,
// dots and bulb shrink away; 6.6-6.9 the piece shrinks away on its new square and 6.9-7.3 pops back on its first one.
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { pop, label, DOWN } from './q-common.js';

const TAU = Math.PI * 2;
const W = new THREE.Vector3(), P = new THREE.Vector3(), DW = new THREE.Vector3();

function ponder(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, X = (x) => B.maxX + x * u, Y = (y) => floor + y * u;
  const who = actor('grandpa', 0.9 * u);
  const tatami = solidProp([[G.box(0.95 * u, 0.02 * u, 0.6 * u, 0, -0.01 * u, 0), 0xc8c070]], 0.2);
  const cushion = solidProp([[G.box(0.3 * u, 0.03 * u, 0.3 * u, 0, 0.015 * u, 0), 0xa03040]], 0.4);
  const stand = solidProp([[G.box(0.3 * u, 0.12 * u, 0.1 * u, 0, 0.06 * u, 0), 0x8a5a30]], 0.3);
  tatami.position.set(X(0.93), floor, 0);
  cushion.position.set(X(0.95), floor, -0.23 * u);
  stand.position.set(X(0.95), floor, 0.08 * u);
  tatami.name = 'tatami'; cushion.name = 'cushion'; stand.name = 'stand';
  // shogi board: a group at its bottom-middle, tilted 35° so its top faces the learner
  const boardG = new THREE.Group();
  boardG.position.set(X(0.95), floor + 0.12 * u, 0.08 * u);
  boardG.rotation.x = 0.611;
  const lines = [-0.15, -0.075, 0, 0.075, 0.15].flatMap((p) => [
    [G.box(0.005 * u, 0.004 * u, 0.3 * u, p * u, 0.042 * u, 0), 0x4a3020],
    [G.box(0.36 * u, 0.004 * u, 0.005 * u, 0, 0.042 * u, p * u), 0x4a3020],
  ]);
  const still = [[0.12, 0.05], [-0.12, 0.1], [0.02, 0.12], [-0.1, -0.02], [0.12, -0.02], [-0.02, 0.03]].map(([px, pz]) => [G.box(0.06 * u, 0.02 * u, 0.065 * u, px * u, 0.05 * u, pz * u), 0xf8e0b0]);
  const board = solidProp([[G.box(0.36 * u, 0.04 * u, 0.3 * u, 0, 0.02 * u, 0), 0xe0b060], ...lines, ...still], 0.4);
  board.name = 'shogi board';
  boardG.add(board);
  const piece = solidProp([[G.box(0.06 * u, 0.02 * u, 0.065 * u), 0xf8e0b0]], 0.6);   // a child of the board: it lies on the tilted top
  piece.name = 'piece';
  boardG.add(piece);
  const dot1 = solidProp([[G.sphere(0.025 * u), 0xffffff]], 1.0); dot1.name = 'dot1';
  const dot2 = solidProp([[G.sphere(0.035 * u), 0xffffff]], 1.0); dot2.name = 'dot2';
  const bubble = solidProp([                                                   // a thought cloud: a big sphere r 0.15 with three touching puffs
    [G.sphere(0.15 * u), 0xffffff], [G.sphere(0.09 * u, -0.1 * u, 0.22 * u), 0xffffff],
    [G.sphere(0.08 * u, 0.13 * u, 0.19 * u), 0xffffff], [G.sphere(0.07 * u, 0.19 * u, -0.12 * u), 0xffffff],
  ], 1.0);
  bubble.name = 'bubble';
  const quest = label(u, '?', '#3060c0');
  const bulb = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.04 * u, 0, 0.02 * u, 0), 0x8a8f98], [G.sphere(0.06 * u, 0, 0.07 * u, 0), 0xffe060]], 1.0);
  const spark = burst(u, { s: 0.12, n: 6, color: 0xffe060 });
  group.add(who.group, tatami, cushion, stand, boardG, dot1, dot2, bubble, quest, bulb, spark);
  const loop = 7.5;
  const TH = new THREE.Vector3(), CH = new THREE.Vector3(), ID = new THREE.Vector3(), LTH = new THREE.Vector3(), PC = new THREE.Vector3(), QW = new THREE.Quaternion();
  const toW = (p) => group.localToWorld(p.clone());
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      who.pose('SitDown', 5, false);
      who.group.position.set(X(0.95), floor + 0.03 * u, -0.05 * u);
      who.bow(between(v, 4.3, 4.6) * (1 - between(v, 5.25, 5.5)));   // before the hands: the reach goes out from the leaned-in shoulders
      TH.set(X(0.87), Y(0.2), -0.14 * u); LTH.set(X(1.03), Y(0.2), -0.14 * u);
      CH.set(X(0.93), Y(0.53), -0.17 * u); ID.set(X(0.9), Y(0.66), -0.2 * u);
      // the piece: slides to its new square 4.7-5.2, shrinks away 6.6-6.9, pops back on its first square 6.9-7.3
      const slide = between(v, 4.7, 5.2) * (1 - between(v, 6.6, 6.9));
      const inn = between(v, 6.9, 7.3);
      piece.position.set((-0.06 + 0.11 * slide) * u, 0.05 * u, -0.1 * u);
      piece.scale.setScalar(inn > 0 ? grow(inn) : 1 - between(v, 6.6, 6.9));
      boardG.updateWorldMatrix(true, true);
      PC.copy(group.worldToLocal(boardG.localToWorld(W.copy(piece.position))));   // the piece's middle, in the group's space
      // the right hand between its resting points; the fades overlap so the blended target is continuous
      const fThigh0 = (1 - between(v, 0.6, 1.2)) * (v < 4.3 ? 1 : 0);
      const fChin = between(v, 0.6, 1.2) * (1 - between(v, 3.7, 4.0));
      const fIdea = between(v, 3.7, 4.0) * (1 - between(v, 4.3, 4.55));
      const fPiece = between(v, 4.3, 4.55) * (1 - between(v, 5.25, 5.5));
      const fThigh1 = between(v, 5.25, 5.5);
      who.handTo('L', toW(LTH), 1);
      const S = fThigh0 + fChin + fIdea + fPiece + fThigh1;
      if (S > 0.02) {
        P.set(0, 0, 0).addScaledVector(TH, fThigh0 + fThigh1).addScaledVector(CH, fChin).addScaledVector(ID, fIdea).addScaledVector(PC, fPiece).divideScalar(S);
        who.handTo('R', toW(P), 1, { out: 0.5, down: 0.6 });
        if (fPiece > 0.5) who.grip('R', toW(PC), DW.copy(DOWN).applyQuaternion(group.getWorldQuaternion(QW)), 0.02 * u, 1);
      }
      // head: tilts to the chin, rocks while he thinks, then leans in and nods
      const fTilt = between(v, 0.6, 1.2) * (1 - between(v, 3.7, 4.0));
      const fSway = between(v, 1.2, 1.6) * (1 - between(v, 3.2, 3.6));
      who.turn('Head', 0, 0, 0.15 * fTilt + 0.12 * fSway * Math.sin(TAU * 3 * v / 7.5));
      who.nod(between(v, 5.5, 5.7) * (1 - between(v, 6.2, 6.4)), t);
      // the thought: dots, bubble and ? in; bulb and burst in for the idea; all shrink away 6.0-6.5
      const fOut = between(v, 6.0, 6.5);
      pop(dot1, between(v, 1.3, 1.5) * (1 - fOut), X(1.1), Y(0.825), -0.25 * u);
      pop(dot2, between(v, 1.6, 1.8) * (1 - fOut), X(1.16), Y(0.895), -0.25 * u);
      pop(bubble, between(v, 1.9, 2.4) * (1 - fOut), X(1.27), Y(0.95), -0.25 * u);
      pop(quest, between(v, 1.9, 2.4) * (1 - between(v, 3.6, 3.8)), X(1.27), Y(0.95), -0.07 * u);
      pop(bulb, between(v, 3.8, 4.1) * (1 - fOut), X(1.27), Y(0.95), -0.07 * u);
      pop(spark, pre ? 0 : bump(v, 3.9, 0.7), X(1.27), Y(0.95), -0.25 * u);
    },
  };
}

export const SCENES = { 'q-ponder': ponder };
