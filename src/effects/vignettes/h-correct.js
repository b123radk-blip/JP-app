// Haiku plan h12 (card 正 "correct"): a girl with a shape-sorter box pushes the blue square block into the round hole: it
// bumps on the top and won't go in, a red cross pops up; she lifts it over the square hole, it drops in, a green tick and
// stars pop up and she cheers. Loop 7 s: 0-0.5 she holds the cube up; 0.5-1.2 she brings it down on the round hole and
// pushes (a small shake); 1.2-2 red cross, she tilts her head; 2-2.8 she lifts it over the square hole; 2.8-3.4 it drops in
// (hidden from 3.4); 3.4-4.6 green tick, stars, both arms up; 4.6-6.4 they fade; 6.4-7 a new cube grows in her hand.
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

const Z = new THREE.Vector3(0, 0, 1), W = new THREE.Vector3();
// a sign's meshes carry its goal name and fly (they hang over the box on purpose)
const named = (o, name) => o.traverse((m) => { if (m.isMesh) { m.name = name; m.userData.flies = true; } });

function shapeSorter(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const girl = person('gal2', u, KID);
  const sorter = solidProp([
    [G.box(0.4 * u, 0.2 * u, 0.3 * u, 0, 0.1 * u, 0), 0xc08850],
    [G.cyl(0.05 * u, 0.05 * u, 0.004 * u, -0.09 * u, 0.2 * u + 0.002 * u, 0), 0x1a1a22],
    [G.box(0.1 * u, 0.004 * u, 0.1 * u, 0.09 * u, 0.2 * u + 0.002 * u, 0), 0x1a1a22],
  ], 0.3);
  const cube = solidProp([[G.box(0.08 * u, 0.08 * u, 0.08 * u, 0, 0, 0), 0x2a6ae0]], 0.4);   // pivot: its middle
  const cross = emblemProp('cross', 0.25 * u), check = emblemProp('check', 0.3 * u), sparkles = stars(u, { r: 0.13, s: 0.1, n: 5 });
  sorter.name = 'sorter'; cube.name = 'cube'; sparkles.name = 'sparkles';
  named(cross, 'wrong'); named(check, 'right');   // the signs hang in the air on purpose (they pop up over the box)
  girl.group.position.set(B.maxX + 0.95 * u, floor, -0.2 * u);                                 // behind the box, facing the learner
  sorter.position.set(B.maxX + 0.95 * u, floor, 0.05 * u);
  group.add(girl.group, sorter, cube, cross, check, sparkles);
  // group-local points (stage units): x from the kanji's right edge, y from the ground line, z to the learner
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  const UPC = P(0.84, 0.5, 0.05), RND = P(0.86, 0.24, 0.05), LFT = P(0.9, 0.36, 0.05), SQU = P(1.04, 0.36, 0.05), SQ = P(1.04, 0.24, 0.05), IN = P(1.04, 0.1, 0.05);
  const C = new THREE.Vector3(), tmp = new THREE.Vector3(), loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      const ws = group.getWorldScale(W).y, rc = 0.06 * u * ws;   // the cube's half-width plus a gap: the fist's palm clears its corner
      girl.pose('Idle', t);
      // the cube's centre in the group: held up, down on the round hole, lifted, over the square hole (in her hand)
      if (v < 0.5) C.copy(UPC);
      else if (v < 1.0) C.lerpVectors(UPC, RND, between(v, 0.5, 1.0));
      else if (v < 1.5) C.copy(RND);
      else if (v < 2.0) C.lerpVectors(RND, LFT, between(v, 1.5, 2.0));
      else if (v < 2.4) C.lerpVectors(LFT, SQU, between(v, 2.0, 2.4));
      else if (v < 6.4) C.lerpVectors(SQU, SQ, between(v, 2.4, 2.8));
      else C.copy(UPC);                                                                 // a new cube, back in her hand
      C.x += 0.006 * u * Math.sin(v * 60) * (pre ? 0 : between(v, 1.0, 1.1) * (1 - between(v, 1.2, 1.5)));   // the bump shake
      // her right hand holds it until it is released at 2.8-3.0, then again for the new cube at 6.4-6.9
      const kG = pre ? A.setup : Math.max(1 - between(v, 2.8, 3.0), between(v, 6.4, 6.9));
      const palmToward = tmp.copy(Z).transformDirection(group.matrixWorld);
      girl.grip('R', group.localToWorld(C.clone()), palmToward, rc, kG, { out: 0.9, down: 0.5 });
      girl.hold(cube, 'R', group, rc);
      // it drops into the square hole and is inside the box from 3.4 (hidden), then a new cube grows in her hand
      if (!pre && v >= 2.8 && v < 3.4) cube.position.lerpVectors(SQ, IN, between(v, 2.8, 3.4) ** 2);
      cube.visible = pre || v < 3.4 || v >= 6.4;
      cube.scale.setScalar(!pre && v >= 6.4 ? grow(between(v, 6.4, 7.0)) : 1);
      // head tilts at the wrong hole
      girl.turn('Head', 0, 0, 0.25 * between(v, 1.2, 1.5) * (1 - between(v, 1.8, 2.0)));
      // the red cross for the round hole, the green tick and stars for the square one
      const kX = pre ? 0 : between(v, 1.2, 1.4) * (1 - between(v, 1.9, 2.0)), kT = pre ? 0 : between(v, 3.4, 3.6) * (1 - between(v, 4.6, 4.9));
      cross.visible = kX > 0.01; cross.scale.setScalar(0.25 * u * grow(kX)); cross.position.set(B.maxX + 0.95 * u, floor + 0.5 * u, 0.1 * u);
      cross.rotation.z = 0.25 * Math.sin((v - 1.2) * 14) * kX;
      check.visible = kT > 0.01; check.scale.setScalar(0.3 * u * grow(kT)); check.position.set(B.maxX + 0.95 * u, floor + 0.5 * u, 0.1 * u);
      const kS = pre ? 0 : between(v, 3.5, 3.8) * (1 - between(v, 4.6, 5.0));
      sparkles.visible = kS > 0.01; sparkles.scale.setScalar(grow(kS)); sparkles.position.set(B.maxX + 0.95 * u, floor + 0.5 * u, 0.1 * u);
      sparkles.rotation.y = v * 2;
      // she cheers: both arms up, a little bounce
      const cheer = pre ? 0 : between(v, 3.4, 3.8) * (1 - between(v, 4.6, 5.0));
      girl.handTo('R', girl.local(-0.3, 1.1, 0.05), cheer, { out: 0.9, down: 0.4 });
      girl.handTo('L', girl.local(0.3, 1.1, 0.05), cheer, { out: 0.9, down: 0.4 });
    },
  };
}

export const SCENES = { 'q-shape-sorter': shapeSorter };
