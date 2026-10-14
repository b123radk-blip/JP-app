// Haiku plan h8 (card 細, slender / narrow): a man walks up to a narrow gap between two brick walls, bumps (too wide!), turns
// sideways, breathes in and squeezes through toward the learner, then wipes his brow ('ふう'). Scene type: q-narrow-gap.
//   loop 7 s: 0-1.2 he walks to the gap's back opening; 1.2-1.5 he bumps, a ! pops; 1.5-2 he turns sideways; 2-4.5 he
//   shuffles through the gap (z -0.3 to 0.33); 4.5-5.2 he is out at the front, turns to the learner and wipes his brow;
//   5.2-6.3 he stands; 6.3-6.7 he fades, and he is back at the start for the loop.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { ADULT, RIGHT, label, pop, speech, turnTo } from './q-common.js';

const BRICK = 0xb0583a, MORTAR = 0xd8c8b0, Z0 = -0.45, Z_STOP = -0.27;
const w1 = new THREE.Vector3(), w2 = new THREE.Vector3();

// a brick wall, 0.25 wide, 1.05 tall, 0.5 deep, standing on the ground at group x cx; mortar lines wrap its faces
function brickWall(u, cx, floor, name) {
  const list = [[G.box(0.25 * u, 1.05 * u, 0.5 * u, 0, 0.525 * u, 0), BRICK]];
  for (const y of [0.2, 0.4, 0.6, 0.8, 1.0]) list.push([G.box(0.258 * u, 0.022 * u, 0.508 * u, 0, y * u, 0), MORTAR]);
  const wall = solidProp(list, 0.3);
  wall.name = name; wall.position.set(cx, floor, 0);
  return wall;
}

function narrowGap(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);   // group-space point: x from the kanji's edge
  const man = actor('guy2', ADULT * u);
  const bang = label(u, '!', '#d8402a', 0.22), bubble = speech(u, 'ふう', { h: 0.13 });
  const wallL = brickWall(u, B.maxX + 0.655 * u, floor, 'wallL'), wallR = brickWall(u, B.maxX + 1.245 * u, floor, 'wallR');
  group.add(man.group, bang, bubble, wallL, wallR);
  const loop = 7.0, GAP_X = 0.95;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // where he is (group space, z toward the learner) and which way he faces (0 = the learner, RIGHT = sideways, +x)
      const sideways = between(v, 1.5, 2.0) * (1 - between(v, 4.5, 5.2));   // 1 while he is turned sideways in the gap
      const sway = 0.01 * Math.sin(v * 5) * (sideways > 0 && v < 4.5 ? 1 : 0);   // a small side-to-side rock as he shuffles
      const z = v < 0 || v >= 6.6 ? Z0 : v < 1.2 ? Z0 + (Z_STOP - Z0) * between(v, 0, 1.2) : v < 2.0 ? Z_STOP : v < 4.5 ? Z_STOP + (0.37 - Z_STOP) * between(v, 2.0, 4.5) : 0.37 + 0.08 * between(v, 4.5, 5.2);
      const yaw = turnTo(turnTo(0, RIGHT, between(v, 1.5, 2.0)), 0, between(v, 4.5, 5.2));
      // sideways, his body hangs about 0.1 behind his origin (the model's middle sits there): shift the origin so the middle is in the gap
      const dx = 0.1 * (between(v, 1.5, 2.0) - between(v, 4.5, 5.2));
      man.group.position.copy(P(GAP_X + dx + sway, 0, z)); man.group.rotation.y = yaw;
      // he shrinks away at the front (6.3-6.6), is small at the back, and grows back (6.7-7) to stand full size at the loop's start
      const shown = pre || v < 6.3 ? 1 : v < 6.6 ? 1 - 0.95 * between(v, 6.3, 6.6) : 0.05 + 0.95 * between(v, 6.7, 7.0);
      man.group.scale.setScalar(shown);
      if (v < 1.2 && !pre) man.pose('Walk', v); else man.pose('Idle', t);    // the walk clip only while walking forward
      // arms in: both hands flat against his chest while he is sideways in the gap (the body is as thin as it gets)
      const armsIn = sideways * (1 - between(v, 4.4, 4.5));
      man.handTo('R', man.local(-0.1, 0.5, -0.04, w2), armsIn, { out: 0.3, down: 0.6 });
      man.handTo('L', man.local(0.1, 0.5, -0.04, w2), armsIn, { out: 0.3, down: 0.6 });
      // the brow wipe: the right hand (its -x side) to the forehead and back, while he stands in front of the learner
      const wipeK = between(v, 4.5, 4.8) * (1 - between(v, 5.3, 5.6)), sw = 0.05 * Math.sin((v - 4.8) * 9);
      man.handTo('R', man.at('eyes', w1, -0.06 + sw, 0.07, 0.03), wipeK, { out: 0.6, down: 0.8 });
      // the ! over his head as he bumps; the ふう bubble as he wipes
      pop(bang, pre ? 0 : between(v, 1.2, 1.5) * (1 - between(v, 1.9, 2.2)), ...group.worldToLocal(man.at('over', w1)).toArray());
      pop(bubble, pre ? 0 : between(v, 4.6, 4.9) * (1 - between(v, 5.4, 5.7)), ...group.worldToLocal(man.local(-0.45, 0.95, 0.1, w2)).toArray());
    },
  };
}

export const SCENES = { 'q-narrow-gap': narrowGap };
