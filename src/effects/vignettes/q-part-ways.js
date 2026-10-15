// 別 (wakareru, plan 015): two friends walk side by side down a path toward you; where it forks they stop, turn to
// each other and wave goodbye (the kanji splits in two as they part, 口 and 力 left, 刂 right), then each takes a
// different branch, stand far apart and wave once more toward you, and the kanji's halves slide back together.
// Loop 8 s: 0-2.2 they walk down the stem (z -0.9 to -0.45); 2.2-2.5 they stop and face each other; 2.6-3.3 they wave
// with the hand nearer the learner (her left, his right) while the kanji splits 2.6-3.0; 3.3-3.5 they turn down their
// branches; 3.5-5.4 they walk down them, she left, he right; 5.4-5.6 they stop and face the learner; 5.6-6.2 they
// wave once more; 6.6-7.0 they shrink away; 7.2-7.8 the kanji rejoins; 7.4-8.0 they pop back in at the start, so the
// loop ends where it started.
// The ground slopes 20 degrees toward the learner so the fork reads from above: the ground line at depth z is
// (0.5-z)*0.364; the grass and paths lie on it, turned 20 degrees (the branches also yaw 18 degrees about y), the
// people stay upright.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { lerp, turnTo, pop } from './q-common.js';

const PI = Math.PI, TILT = 0.349, SLOPE = 0.364, BR = PI / 10;   // 20 degrees (tan 20 = 0.364); the branches' 18-degree yaw
const ss = (x) => x * x * (3 - 2 * x);

export function partWays(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), k = (x) => B.maxX + x * u, gy = (z) => B.minY + (0.5 - z) * SLOPE * u;
  // the ground: grass, the stem and the two branches, all turned 20 degrees with the slope (the branches yaw first)
  const slab = (w, h, d, x, z, y, yaw, name, color) => {
    const m = solidProp([[G.box(w * u, h * u, d * u, 0, (h / 2) * u, 0), color]], 0.4);
    m.name = name; m.position.set(k(x), B.minY + y * u, z * u); m.rotation.set(TILT, yaw, 0); return m;
  };
  const grass = slab(1.0, 0.03, 1.5, 0.93, -0.25, 0.273, 0, 'grass', 0x6ab04c);
  const stem = slab(0.4, 0.015, 0.7, 0.93, -0.65, 0.449, 0, 'path', 0xd8c8a0);
  const left = slab(0.26, 0.015, 0.98, 0.66, -0.025, 0.221, -BR, 'path left', 0xd8c8a0);
  const right = slab(0.26, 0.015, 0.98, 1.2, -0.025, 0.221, BR, 'path right', 0xd8c8a0);
  const girl = actor('gal2', 0.5 * u), boy = actor('guy2', 0.5 * u);
  group.add(grass, stem, left, right, girl.group, boy.group);
  const loop = 8, W = new THREE.Vector3(), WO = new THREE.Vector3();
  // one friend's beat at the given second of the loop: x0 down the stem, x1 at the branch end, face the turn at the
  // fork (her 90 degrees, his -90), side the hand nearer the learner, hx that hand's wave point (u from the kanji's
  // right edge); the branch yaw is -face/5 (she -18 degrees, he +18)
  const friend = (a, x0, x1, face, side, hx, t, v) => {
    const yaw = -face / 5;
    const p = v >= 7.4 ? { x: x0, z: -0.9, clip: 'Walk', feet: 0.057, turn: 0 }
      : v < 2.2 ? { x: x0, z: lerp(-0.9, -0.45, Math.max(0, v) / 2.2), clip: v < 0 ? 'Idle' : 'Walk', feet: v < 0 ? 0.045 : 0.057, turn: 0 }
      : v < 3.5 ? { x: x0, z: -0.45, clip: 'Idle', feet: 0.045, turn: v < 3.3 ? turnTo(0, face, between(v, 2.2, 2.5)) : turnTo(face, yaw, between(v, 3.3, 3.5)) }
      : v < 5.4 ? { x: lerp(x0, x1, (v - 3.5) / 1.9), z: lerp(-0.45, 0.40, (v - 3.5) / 1.9), clip: 'Walk', feet: 0.057, turn: yaw }
      : { x: x1, z: 0.40, clip: 'Idle', feet: 0.045, turn: v < 5.6 ? turnTo(yaw, 0, between(v, 5.4, 5.6)) : 0 };
    a.pose(p.clip, t);
    const px = k(p.x), py = gy(p.z) + p.feet * u, pz = p.z * u;
    a.group.rotation.y = p.turn;
    // they shrink to a dot (never out of the scene) 6.6-7.0 and pop back in at the start 7.4-8.0
    const sc = v >= 7.4 ? Math.max(0.02, between(v, 7.4, 8.0)) : v >= 6.6 ? Math.max(0.02, 1 - between(v, 6.6, 7.0)) : 1;
    pop(a.group, sc, px, py, pz);
    if (v >= 2.6 && v < 3.3) {   // wave goodbye with the hand nearer the learner, the hand up beside the head
      const wk = ss(between(v, 2.6, 2.7)) * (1 - ss(between(v, 3.2, 3.3)));
      const O = a.group.getWorldPosition(WO).sub(a.group.position);   // the scene's own world offset
      a.handTo(side, W.set(k(hx), B.minY + 0.941 * u, (-0.45 + 0.04 * Math.sin(t * 9)) * u).add(O), wk, { out: 0.9, down: 0.4 });
    } else if (v >= 5.6 && v < 6.2) a.wave(side, Math.sin(PI * between(v, 5.6, 6.2)), t);   // once more, toward the learner
  };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // the kanji splits where they part: 口 and 力 (strokes 0-4) left, 刂 (5-6) right, 2.6-3.0; rejoins 7.2-7.8
      const sp = ss(between(v, 2.6, 3.0)) * (1 - ss(between(v, 7.2, 7.8)));
      for (let si = 0; si < ctx.strokes.length; si++) stage.offset(si, (si < 5 ? -1 : 1) * 0.08 * u * sp, 0, 0);
      friend(girl, 0.80, 0.52, PI / 2, 'L', 0.9, t, v);
      friend(boy, 1.06, 1.34, -PI / 2, 'R', 0.96, t, v);
    },
  };
}

export const SCENES = { 'q-part-ways': partWays };
