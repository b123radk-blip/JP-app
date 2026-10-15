// Haiku batch scene (plan h9, 遊 play): two children on a seesaw go up and down, stars pop over whoever is up.
// Scene type: q-seesaw.
//   loop 6 s: three full swings of 2 s. The plank tilts 15 degrees each way about the top of the red stand: at 0.5 the
//   girl (left) is all the way down and the boy (right) all the way up, at 1.5 the other way, and so on. The seated kids
//   ride their end of the plank, both hands on the handle; the top one lets go with the right hand and raises it, and
//   yellow stars pop over the head. わーい! at 1.0 (the girl rising) and 4.0 (the boy rising).
import * as THREE from 'three';
import { acts } from './timeline.js';
import { between } from './helpers.js';
import { KID, person, speech, pop } from './q-common.js';
import { seatAt } from './q-ride.js';
import { stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';

const LOOP = 6, TILT = 15 * Math.PI / 180, RIGHT = Math.PI / 2, LEFT = -Math.PI / 2, HIP = 0.05;
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3();

// how far a moment v is from a time c on the loop, in seconds (the loop wraps)
const gap = (v, c) => { const d = Math.abs(v - c) % LOOP; return Math.min(d, LOOP - d); };
// 1 while the kid whose top times are cs is up (a plateau of 0.3 s, easing out by 0.6 s)
const top = (v, cs) => cs.reduce((s, c) => s + between(gap(v, c), 0.6, 0.3), 0);

function seesaw(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const px = B.maxX + 0.95 * u;                              // the pivot, the top of the stand
  const board = new THREE.Group(), girl = person('gal2', u, KID), boy = person('guy2', u, KID);
  board.position.set(px, floor + 0.2 * u, 0);
  // the plank (local: its middle on the pivot), two handle posts with a bar each, a bit in front of each kid
  const H = [-0.25 * u, 0.25 * u], wood = 0xe8b848, post = 0x2a7ad0;
  const plank = solidProp([
    [G.box(0.9 * u, 0.04 * u, 0.1 * u, 0, 0.02 * u, 0), wood],
    ...H.flatMap((x) => [[G.box(0.02 * u, 0.14 * u, 0.02 * u, x, 0.11 * u, 0), post], [G.box(0.02 * u, 0.02 * u, 0.12 * u, x, 0.18 * u, 0), post]]),
  ], 0.35);
  plank.name = 'plank';
  // the stand: a red triangle, its apex under the plank's middle, on the ground
  const tri = new THREE.Shape([new THREE.Vector2(-0.12 * u, 0), new THREE.Vector2(0.12 * u, 0), new THREE.Vector2(0, 0.2 * u)]);
  const stand = solidProp([[new THREE.ExtrudeGeometry(tri, { depth: 0.1 * u, bevelEnabled: false }).translate(px, floor, -0.05 * u), 0xd03030]], 0.35);
  stand.name = 'pivot';
  board.add(plank, girl.group, boy.group);
  const starsG = stars(u, { r: 0.13, s: 0.1, n: 4 }), starsB = stars(u, { r: 0.13, s: 0.1, n: 4 });
  const bubble = speech(u, 'わーい!', { h: 0.12 });
  group.add(board, stand, starsG, starsB, bubble);
  const loop = LOOP;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      // the plank: left end down at 0.5 (positive angle), right end down at 1.5, ...
      board.rotation.z = pre ? 0 : TILT * Math.cos(Math.PI * (v - 0.5));
      board.updateMatrixWorld(true);
      // the seated kids: hips on the plank at their end (x -0.37 girl, +0.37 boy), facing each other along the plank
      const seat = (kid, x, yaw) => { kid.pose('SitDown', 1.0, false); kid.group.position.set(0, 0, 0); kid.group.rotation.set(0, yaw, 0); kid.group.updateWorldMatrix(true, true); seatAt(kid, board, board.localToWorld(V1.set(x * u, 0.04 * u + HIP * u, 0))); };
      seat(girl, -0.37, RIGHT); seat(boy, 0.37, LEFT);
      // the handle: the girl's hands on its +z and -z ends, the boy's the other way round (right hand to -z)
      const bar = (x, z) => board.localToWorld(V2.set(x * u, 0.18 * u, z * u)).clone();
      const gR = bar(H[0], 0.05), gL = bar(H[0], -0.05), bR = bar(H[1], -0.05), bL = bar(H[1], 0.05);
      // the girl is on top at 1.5, 3.5, 5.5; the boy at 0.5, 2.5, 4.5. The top one lets go with the right hand and raises it
      const gU = top(v, [1.5, 3.5, 5.5]), bU = top(v, [0.5, 2.5, 4.5]);
      girl.handTo('R', V3.lerpVectors(gR, girl.local(-0.32, 0.98, 0.12, V4), gU), 1, { out: 0.3, down: 1 }); girl.handTo('L', gL, 1, { out: 0.3, down: 1 });
      boy.handTo('R', V3.lerpVectors(bR, boy.local(-0.32, 0.98, 0.12, V4), bU), 1, { out: 0.3, down: 1 }); boy.handTo('L', bL, 1, { out: 0.3, down: 1 });
      // stars pop over the one on top, spinning; the bubble over the girl at 1.0-2.0 and the boy at 4.0-5.0
      const over = (kid) => group.worldToLocal(kid.at('over', new THREE.Vector3(), 0, 0.1, 0));
      const ko = over(girl), bo = over(boy);
      pop(starsG, gU, ko.x, ko.y, ko.z); starsG.rotation.y = t * 4;
      pop(starsB, bU, bo.x, bo.y, bo.z); starsB.rotation.y = -t * 4;
      const k1 = between(v, 1.0, 1.2) * (1 - between(v, 1.8, 2.0)), k2 = between(v, 4.0, 4.2) * (1 - between(v, 4.8, 5.0));
      const onGirl = v < 3;
      pop(bubble, k1 + k2, (onGirl ? ko.x : bo.x) - 0.1 * u, (onGirl ? ko.y : bo.y) + 0.2 * u, (onGirl ? ko.z : bo.z));
    },
  };
}

export const SCENES = { 'q-seesaw': seesaw };
