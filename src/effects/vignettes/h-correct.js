// Haiku plan h12 (card 正 "correct"), round 2: a girl beside a shape-sorter box pushes the blue square block into the round
// hole: it bumps on the top and won't go in, a red cross pops up; she lifts it over the square hole, it drops in, a green
// tick and stars pop up and she cheers. Loop 7 s: 0-0.5 she holds the cube up; 0.5-1.2 she brings it down on the round
// hole and pushes (a small shake); 1.2-2 red cross, she tilts her head; 2-2.8 she lifts it over the square hole; 2.8-3.4 it
// drops in (hidden from 3.4); 3.4-4.6 green tick, stars, both arms up; 4.6-6.4 they fade; 6.4-7 a new cube grows in her hand.
// The box is low and tilted (its top faces the learner, the back edge higher); a red ring marks the round hole, a blue frame
// the square one. Nothing stands between the girl and the learner.
//   q-shape-sorter   正: a square block goes in the square hole, never in the round one
import * as THREE from 'three';
import { acts } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { stars } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { KID, person } from './q-common.js';

const W = new THREE.Vector3(), X = new THREE.Vector3(1, 0, 0), TH = 20 * Math.PI / 180;
const BLUE = 0x2a6ae0, DARK = 0x1a1a22, RED = 0xd83030;
// a sign's meshes carry its goal name and fly (they hang over the box on purpose)
const named = (o, name) => o.traverse((m) => { if (m.isMesh) { m.name = name; m.userData.flies = true; } });

function shapeSorter(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const girl = person('gal2', u, KID);
  // the box, its own origin at its middle; tilted about x so its top faces the learner (the front edge is lower)
  const lowest = 0.06 * Math.cos(TH) + 0.15 * Math.sin(TH);      // the front bottom edge sits on the ground line
  const ring = G.torus(0.062 * u, 0.01 * u, Math.PI * 2).rotateX(Math.PI / 2).translate(-0.1 * u, 0.066 * u, 0);
  const frame = [[0.134, 0.012, 0.012, 0, 0.066, -0.061], [0.134, 0.012, 0.012, 0, 0.066, 0.061], [0.012, 0.012, 0.134, -0.061, 0.066, 0], [0.012, 0.012, 0.134, 0.061, 0.066, 0]];
  const sorter = solidProp([
    [G.box(0.45 * u, 0.12 * u, 0.3 * u, 0, 0, 0), 0xc08850],
    [G.cyl(0.055 * u, 0.055 * u, 0.004 * u, -0.1 * u, 0.06 * u + 0.002 * u, 0), DARK],
    [G.box(0.11 * u, 0.004 * u, 0.11 * u, 0.1 * u, 0.06 * u + 0.002 * u, 0), DARK],
    [ring, RED],
    ...frame.map(([w, h, d, x, y, z]) => [G.box(w * u, h * u, d * u, x * u + 0.1 * u, y * u, z * u), BLUE]),
  ], 0.3);
  sorter.rotation.x = TH;
  const cube = solidProp([[G.box(0.1 * u, 0.1 * u, 0.1 * u, 0, 0, 0), BLUE]], 0.4);   // pivot: its middle
  const cross = emblemProp('cross', 0.28 * u), check = emblemProp('check', 0.28 * u), sparkles = stars(u, { r: 0.13, s: 0.1, n: 5 });
  sorter.name = 'sorter'; cube.name = 'cube'; sparkles.name = 'sparkles';
  named(cross, 'wrong'); named(check, 'right');
  // the girl beside the box on its right, turned toward the box and a little toward the learner
  girl.group.position.set(B.maxX + 1.22 * u, floor, 0.05 * u);
  girl.group.rotation.y = -Math.PI / 2 + 0.4;
  const BOX = new THREE.Vector3(B.maxX + 0.85 * u, floor + lowest * u, 0.05 * u);
  sorter.position.copy(BOX);
  group.add(girl.group, sorter, cube, cross, check, sparkles);
  // group points (stage units): x from the kanji's right edge, y from the ground line, z to the learner
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  // a point on the box's top (xl along it, lift above it), in the group, for the cube and the holes
  const top = (xl, lift) => { const v = new THREE.Vector3(xl, 0.06 + lift, 0).applyAxisAngle(X, TH).multiplyScalar(u); return v.add(BOX); };
  const UPC = P(0.9, 0.5, 0.05), RND = top(-0.1, 0.05), LFT = top(-0.1, 0.18), SQU = top(0.1, 0.18), SQ = top(0.1, 0.05), IN = top(0.1, -0.06);
  const C = new THREE.Vector3(), fwd = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      const ws = group.getWorldScale(W).y, rc = 0.07 * u * ws;   // the cube's half-width (0.05u) plus a gap: the palm clears its corner
      girl.pose('Idle', t);
      // the cube's centre in the group: held up, down on the round hole, lifted, over the square hole (in her hand)
      if (v < 0.5) C.copy(UPC);
      else if (v < 1.0) C.lerpVectors(UPC, RND, between(v, 0.5, 1.0));
      else if (v < 1.5) C.copy(RND);
      else if (v < 2.0) C.lerpVectors(RND, LFT, between(v, 1.5, 2.0));
      else if (v < 2.4) C.lerpVectors(LFT, SQU, between(v, 2.0, 2.4));
      else if (v < 6.4) C.lerpVectors(SQU, SQ, between(v, 2.4, 2.8));
      else C.copy(UPC);                                                                 // a new cube, back in her hand
      C.add(a.set(0.006 * u * Math.sin(v * 60) * (pre ? 0 : between(v, 1.0, 1.1) * (1 - between(v, 1.2, 1.5))), 0, 0));   // the bump shake
      // her right hand holds it until it is released at 2.8-3.0, then again for the new cube at 6.4-6.9
      const kG = pre ? A.setup : Math.max(1 - between(v, 2.8, 3.0), between(v, 6.4, 6.9));
      // the palm faces the way she faces (the cube is in front of her)
      const palmToward = fwd.copy(girl.local(0, 0, 1, b)).sub(girl.local(0, 0, 0, a)).normalize();
      girl.grip('R', group.localToWorld(C.clone()), palmToward, rc, kG, { out: 0.9, down: 0.5 });
      girl.hold(cube, 'R', group, rc);
      // it drops into the square hole and is inside the box from 3.4 (hidden), then a new cube grows in her hand
      if (!pre && v >= 2.8 && v < 3.4) cube.position.lerpVectors(SQ, IN, between(v, 2.8, 3.4) ** 2);
      cube.visible = pre || v < 3.4 || v >= 6.4;
      cube.scale.setScalar(!pre && v >= 6.4 ? grow(between(v, 6.4, 7.0)) : 1);
      // head tilts at the wrong hole
      girl.turn('Head', 0, 0, 0.25 * between(v, 1.2, 1.5) * (1 - between(v, 1.8, 2.0)));
      // the red cross for the round hole, the green tick and stars for the square one, over the box
      const over = P(0.85, 0.6, 0.05);
      const kX = pre ? 0 : between(v, 1.2, 1.4) * (1 - between(v, 1.9, 2.0)), kT = pre ? 0 : between(v, 3.4, 3.6) * (1 - between(v, 4.6, 4.9));
      cross.visible = kX > 0.01; cross.scale.setScalar(0.28 * u * grow(kX)); cross.position.copy(over);
      cross.rotation.z = 0.25 * Math.sin((v - 1.2) * 14) * kX;
      check.visible = kT > 0.01; check.scale.setScalar(0.28 * u * grow(kT)); check.position.copy(over);
      const kS = pre ? 0 : between(v, 3.5, 3.8) * (1 - between(v, 4.6, 5.0));
      sparkles.visible = kS > 0.01; sparkles.scale.setScalar(grow(kS)); sparkles.position.copy(over);
      sparkles.rotation.y = v * 2;
      // she cheers: both arms up
      const cheer = pre ? 0 : between(v, 3.4, 3.8) * (1 - between(v, 4.6, 5.0));
      girl.handTo('R', girl.local(-0.3, 1.1, 0.05), cheer, { out: 0.9, down: 0.4 });
      girl.handTo('L', girl.local(0.3, 1.1, 0.05), cheer, { out: 0.9, down: 0.4 });
    },
  };
}

export const SCENES = { 'q-shape-sorter': shapeSorter };
