// Haiku plan h15 (card 5f85, 待 "wait"): scene q-wait-friend. A girl waits by a station clock whose hands race round;
// she checks her watch, sighs (まだかな…) and her friend walks in; they wave and a heart pops between their heads.
//   loop 8 s: 0-1 she looks right; 1-2 she raises her left wrist and looks down at her watch; 2-3.6 she sighs, a bubble
//   and a slow sway; 3.6-4 she looks right again; 3.9-4.1 he fades in; 4-5 he walks to her; 5-5.3 he turns toward her;
//   5.1-6.3 both wave, a heart pops; 6.4-7 he fades out; 7-8 she stands, looking right.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { HEART } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { ADULT, pop, person, speech, turnTo } from './q-common.js';

const D = Math.PI / 180, LOOP = 8;
const Z = new THREE.Vector3(0, 0, 1), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3();

function waitFriend(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);   // group-space point: x from the kanji's right edge
  const WRIST = P(0.98, 0.5, 0.15);   // the point her left hand reaches to check the watch
  const girl = person('gal2', u, ADULT), boy = person('guy2', u, ADULT);
  girl.group.position.copy(P(0.92, 0, 0.02)); girl.group.rotation.y = 20 * D;
  boy.group.position.copy(P(1.7, 0, 0.05)); boy.group.rotation.y = -90 * D;
  // the station clock: a grey post on the ground, a round white face (facing the learner) on its top, its middle at 0.86 u
  const post = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.72 * u, 0, 0.36 * u, 0), 0x606870]], 0.3); post.name = 'post';
  post.position.copy(P(0.6, 0, -0.15));
  const marks = [];
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; marks.push([G.box(0.012 * u, 0.03 * u, 0.012 * u, Math.sin(a) * 0.115 * u, Math.cos(a) * 0.115 * u, 0.01 * u, -a), 0x20262e]); }
  const clock = new THREE.Group(); clock.name = 'clock'; clock.position.copy(P(0.6, 0.86, -0.15));
  const face = solidProp([[G.cyl(0.14 * u, 0.14 * u, 0.02 * u, 0, 0, 0, Math.PI / 2, 0, 0), 0xffffff], [G.torus(0.14 * u, 0.012 * u, Math.PI * 2, 0, 0, 0.005 * u), 0x303640], ...marks], 0.5);
  const longHand = solidProp([[G.box(0.012 * u, 0.11 * u, 0.012 * u, 0, 0.055 * u, 0.02 * u), 0x20262e]], 0.3);
  const shortHand = solidProp([[G.box(0.02 * u, 0.075 * u, 0.012 * u, 0, 0.0375 * u, 0.02 * u), 0x20262e]], 0.3);
  clock.add(face, longHand, shortHand);
  // her watch: a dark strap with a small white face, on her left wrist (it follows the hand every frame)
  const watch = solidProp([[G.box(0.05 * u, 0.04 * u, 0.025 * u), 0x1c2028], [G.cyl(0.016 * u, 0.016 * u, 0.01 * u, 0, 0, 0.016 * u, Math.PI / 2, 0, 0), 0xffffff]], 0.4);
  watch.name = 'watch';
  const bubble = speech(u, 'まだかな…', { h: 0.12 }), heart = solidProp(HEART(u, 0.1), 0.9);
  group.add(post, clock, girl.group, boy.group, watch, bubble, heart);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, LOOP), pre = A.u < 0, v = pre ? 0 : A.v;
      // the clock: the long hand turns once a second, the short one once every 12 s (time flying by)
      longHand.rotation.z = -2 * Math.PI * t; shortHand.rotation.z = -2 * Math.PI * t / 12;
      // her: standing; she looks right (her head turns to +x), tips her head to the watch at 1-2 s, sighs and sways at 2-3.6 s
      const up = between(v, 1.0, 1.4) * (1 - between(v, 2.0, 2.4)), down = between(v, 1.0, 1.4) * (1 - between(v, 1.8, 2.2));
      const sigh = between(v, 2.0, 2.3) * (1 - between(v, 3.6, 3.9)), lookR = 1 - sigh;
      girl.pose('Idle', t);
      girl.turn('Head', 0.3 * down, 0.5 * lookR);
      girl.turn('Torso', 0, 0, 0.06 * Math.sin(v * 2.5) * sigh);
      // her left hand (+x side) comes up to the watch point and goes back down; the watch rides on the fist
      girl.handTo('L', group.localToWorld(v2.copy(WRIST)), up, { out: 0.6, down: 0.8 });   // (the group-space point, to the world)
      // the watch sits on the back of the wrist (outside the palm), face outward, so the fist does not hide it
      const wrist = girl.fist('L', v3), elbow = girl.node('LowerArmL').getWorldPosition(v4), back = girl.palm('L', v5).negate();
      const p0 = group.worldToLocal(v2.lerpVectors(elbow, wrist, 0.8).addScaledVector(back, 0.03 * u)), p1 = group.worldToLocal(v2.clone().add(back));
      watch.position.copy(p0); watch.quaternion.setFromUnitVectors(Z, p1.sub(p0).normalize());
      // まだかな… over her head while she sighs
      const bk = between(v, 2.2, 2.5) * (1 - between(v, 3.1, 3.4)), o = group.worldToLocal(girl.at('over', v4, 0.3, 0.05, 0));
      pop(bubble, pre ? 0 : bk, o.x, o.y, o.z);
      // him: faint until 3.9 s, fades in at 3.9-4.1 and out at 6.4-7; he walks to her 4-5 s, then turns toward her
      const fade = between(v, 3.9, 4.1) * (1 - between(v, 6.4, 7.0));
      for (const mt of boy.materials) { mt.opacity = fade; mt.transparent = fade < 1; }
      if (v >= 4 && v < 5) boy.pose('Walk', v - 4); else boy.pose('Idle', t + 0.4);
      boy.group.position.copy(P(1.7 - 0.40 * between(v, 4.0, 5.0), 0, 0.05));   // stops at x 1.30 (plan 1.27: fix 1, see report)
      boy.group.rotation.y = turnTo(-90 * D, -60 * D, between(v, 5.0, 5.3));
      // both wave 5.1-6.3 (her right hand, his left); a heart pops up between their heads
      const wave = between(v, 5.1, 5.3) * (1 - between(v, 6.1, 6.3));
      girl.wave('R', wave, v); boy.wave('L', wave, v + 0.3);
      const hp = group.worldToLocal(girl.at('over', v4).add(boy.at('over', v5)).multiplyScalar(0.5));
      pop(heart, pre ? 0 : between(v, 5.1, 5.4) * (1 - between(v, 6.0, 6.3)), hp.x, hp.y + 0.12 * u, hp.z);
    },
  };
}

export const SCENES = { 'q-wait-friend': waitFriend };
