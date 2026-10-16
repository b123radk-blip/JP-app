// 考 (plan 016, card 8003): an old man sits on a red cushion before a shogi board tilted toward the learner, his hand
// on his chin, thinking hard. Loop 7.5 s: 0-0.6 he sits looking at the board, hands on his thighs; 0.6-1.2 his right
// hand goes to his chin and his head tilts; 1.2-3.6 he thinks (the hand stays, the head rocks slowly) as a thought
// bubble with a big "?" pops in (dots at 1.3 and 1.6, the cloud at 1.9); 3.6-4.0 the "?" pops out and a lightbulb pops
// in with a burst, 3.7-4.2 his finger goes up; 4.3-4.6 he leans in; 4.7-5.2 he moves one piece across the board, his
// palm on it from above; 5.25-5.5 he sits up, hand back to his thigh; 5.5-6.2 he nods, pleased; 6.0-6.5 the cloud,
// dots and bulb shrink away; 6.6-6.9 the piece shrinks on its new square, 6.9-7.3 it pops back on its first square.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { burst } from '../pieces/kit-things.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { lerp, label, pop, ADULT } from './q-common.js';

const TILT = (35 * Math.PI) / 180;                                  // the board's top leans to the learner
const UPN = new THREE.Vector3(0, Math.cos(TILT), Math.sin(TILT));   // the board's top normal, world
const DOWN = new THREE.Vector3(0, -Math.cos(TILT), -Math.sin(TILT));
// points in the actor's own frame, in heights (his height is ADULT * u): the chin, above the head, both thighs
const CHIN = [-0.022, 0.556, -0.133], FINGER = [0.022, 1.078, -0.256], THIGH_R = [-0.089, 0.189, -0.1], THIGH_L = [0.089, 0.189, -0.1];

function ponder(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, k = (x) => x * u, X = (x) => B.maxX + x * u;
  const who = actor('grandpa', ADULT * u);
  group.add(who.group);
  // a strip of tatami under everything, its top on the ground line
  const tatami = solidProp([[G.box(k(0.95), k(0.02), k(0.6)), 0xc8c070]], 0.1);
  tatami.name = 'tatami'; tatami.position.set(X(0.93), floor - 0.01 * u, 0);
  // a red cushion to sit on, a low stand, and the shogi board tilted on it (top end toward the learner)
  const cushion = solidProp([[G.box(k(0.3), k(0.03), k(0.3), 0, k(0.015), 0), 0xa03040]], 0.15);
  cushion.name = 'cushion'; cushion.position.set(X(0.95), floor, -0.23 * u);
  const stand = solidProp([[G.box(k(0.3), k(0.12), k(0.1), 0, k(0.06), 0), 0x8a5a30]], 0.1);
  stand.name = 'stand'; stand.position.set(X(0.95), floor, 0.08 * u);
  const board = new THREE.Group();
  board.name = 'shogi board';
  board.position.set(X(0.95), floor + 0.12 * u, 0.08 * u);
  board.rotation.x = TILT;
  const grid = [];
  for (let i = 0; i < 5; i++) {                                // a 5 x 5 grid of thin dark lines on the top
    grid.push([G.box(k(0.004), k(0.004), k(0.24), (-0.144 + i * 0.072) * u, k(0.042), 0), 0x6a4a28]);
    grid.push([G.box(k(0.288), k(0.004), k(0.004), 0, k(0.042), (-0.12 + i * 0.06) * u), 0x6a4a28]);
  }
  const boardTop = solidProp([[G.box(k(0.36), k(0.04), k(0.3), 0, k(0.02), 0), 0xe0b060], ...grid], 0.2);
  boardTop.name = 'shogi board';
  const stone = (x, z) => [G.box(k(0.06), k(0.02), k(0.065), x * u, k(0.07), z * u), 0xf8e0b0];
  const stones = solidProp([stone(-0.11, 0), stone(-0.04, 0.08), stone(0.03, 0.02), stone(0.09, 0.1), stone(0.12, 0)], 0.3);
  stones.name = 'stones';
  // the moving piece is a child of the tilted board, so it lies on the top by itself
  const piece = solidProp([[G.box(k(0.06), k(0.02), k(0.065)), 0xf8e0b0]], 0.3);
  piece.name = 'piece';
  board.add(boardTop, stones, piece);
  // the thought pops in: two small dots lead up to a cloud, a big "?" in it, then a lightbulb with a star burst
  const dot1 = solidProp([[G.sphere(k(0.025)), 0xffffff]], 0.3); dot1.name = 'dot1';
  const dot2 = solidProp([[G.sphere(k(0.035)), 0xffffff]], 0.3); dot2.name = 'dot2';
  const bubble = solidProp([
    [G.sphere(k(0.15)), 0xffffff], [G.sphere(k(0.07), -k(0.11), k(0.09), 0), 0xffffff],
    [G.sphere(k(0.08), k(0.12), k(0.1), 0), 0xffffff], [G.sphere(k(0.06), -k(0.02), -k(0.12), 0), 0xffffff],
  ], 0.25);
  bubble.name = 'bubble';
  const q = label(u, '?', '#3060c0', 0.22);
  const bulb = new THREE.Group();
  bulb.name = 'bulb';
  bulb.add(solidProp([[G.sphere(k(0.095), 0, k(0.06), 0), 0xffe040]], 1.0), solidProp([[G.cyl(k(0.045), k(0.04), k(0.06), 0, -k(0.06), 0), 0x909498]], 0.15));
  const sparkle = burst(u, { s: 0.3, n: 8, color: 0xffe060 });
  group.add(tatami, cushion, stand, board, dot1, dot2, bubble, q, bulb, sparkle);
  dot1.userData.flies = dot2.userData.flies = bubble.userData.flies = true;   // the thought: in the air on purpose
  const loop = 7.5;
  const H = new THREE.Vector3(), pc = new THREE.Vector3(), wp = new THREE.Vector3();
  const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { move: [4.7, 0.5] });
      who.pose('SitDown', 1.0, false);                           // the held, seated pose (a time past the clip's end)
      who.group.position.set(X(0.95), floor + 0.03 * u, -0.05 * u);
      // his head: a little tilt to one side, then a slow rock while he thinks, then calm
      const rock = 0.15 * Math.sin((v - 1.2) * 2.1) * between(v, 1.2, 1.5) * (1 - between(v, 3.3, 3.7));
      who.turn('Head', 0, 0, 0.15 * between(v, 0.6, 1.2) * (1 - between(v, 1.2, 1.5)) + rock);
      // he leans in over the board to move the piece, then sits back up
      who.bow(between(v, 4.3, 4.6) * (1 - between(v, 5.25, 5.5)));
      who.nod(between(v, 5.5, 5.7) * (1 - between(v, 6.1, 6.3)), v);
      // the moving piece: slides across the board 4.7-5.2 (a little lift), shrinks 6.6-6.9, pops back 6.9-7.3
      piece.position.set((v < 6.9 ? lerp(-0.06, 0.05, T.move) : -0.06) * u, (0.05 + 0.012 * bump(v, 4.7, 0.5)) * u, -0.10 * u);
      const ps = v < 6.6 ? 1 : v < 6.9 ? 1 - between(v, 6.6, 6.9) : grow(between(v, 6.9, 7.3));
      piece.scale.setScalar(ps); piece.visible = ps > 0.01;
      board.updateWorldMatrix(true, false);
      pc.copy(piece.position); board.localToWorld(pc);
      // his right hand: on his thigh -> the chin -> up with the idea -> onto the piece -> back to the thigh
      if (v < 3.7) {
        const p = mix(THIGH_R, CHIN, between(v, 0.6, 1.2));
        who.handTo('R', who.local(p[0], p[1], p[2]), 1);
      } else if (v < 4.6) {
        const p = mix(CHIN, FINGER, between(v, 3.7, 4.1));
        who.handTo('R', who.local(p[0], p[1], p[2]), 1);
      } else if (v < 5.25) {
        wp.copy(pc).addScaledVector(UPN, 0.01 * u);              // the palm rests on the piece, from above
        who.grip('R', wp, DOWN, 0.01 * u, 1);
      } else {
        who.handTo('R', H.copy(pc).lerp(who.local(THIGH_R[0], THIGH_R[1], THIGH_R[2]), between(v, 5.25, 5.5)), 1);
      }
      who.handTo('L', who.local(THIGH_L[0], THIGH_L[1], THIGH_L[2]), 1);
      // the thought pops in and out: dots, cloud and "?" at 1.3/1.6/1.9, the "?" gives way to the bulb with a burst
      const outK = 1 - between(v, 6.0, 6.5);
      pop(dot1, between(v, 1.3, 1.55) * outK, X(1.05), floor + 0.79 * u, -0.25 * u);
      pop(dot2, between(v, 1.6, 1.85) * outK, X(1.105), floor + 0.84 * u, -0.25 * u);
      pop(bubble, between(v, 1.9, 2.2) * outK, X(1.27), floor + 0.95 * u, -0.25 * u);
      pop(q, between(v, 1.9, 2.2) * (1 - between(v, 3.6, 4.0)) * outK, X(1.27), floor + 0.95 * u, -0.09 * u);
      pop(bulb, between(v, 3.6, 4.0) * outK, X(1.27), floor + 0.95 * u, -0.09 * u);
      pop(sparkle, 0.8 * between(v, 3.6, 3.8) * (1 - between(v, 3.8, 4.1)) * outK, X(1.27), floor + 0.97 * u, -0.14 * u);
    },
  };
}

export const SCENES = { 'q-ponder': ponder };
