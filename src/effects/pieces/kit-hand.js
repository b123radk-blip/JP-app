// Props kit: an articulated hand on a forearm (2 draw calls). Built about `u` long from elbow to fingertips, pointing up
// (+y) with the palm towards you (+z); place and turn `hand.group`, swing the forearm with hand.bone('arm').
// Poses (curl of each finger 0..1, thumb): open, grip (a fist round a handle), point, thumbs (thumbs up), pinch, flat.
// hand.pose(a, b?, k?) blends pose a into b by k; hand.grip is where a held handle sits (attach props there).
import * as THREE from 'three';
import { createRig } from './kit-rig.js';

export const POSES = {
  open:   { f: [0.08, 0.05, 0.05, 0.1], spread: 1, thumb: [0.15, 0.1] },
  flat:   { f: [0, 0, 0, 0], spread: 0.2, thumb: [0.4, 0.1] },
  grip:   { f: [1, 1, 1, 1], spread: 0, thumb: [0.9, 0.8] },
  point:  { f: [0, 1, 1, 1], spread: 0.2, thumb: [0.9, 0.7] },
  thumbs: { f: [1, 1, 1, 1], spread: 0, thumb: [-0.25, -0.1] },
  pinch:  { f: [0.55, 0.9, 0.95, 1], spread: 0.1, thumb: [0.75, 0.3] },
};
const FX = [-0.105, -0.035, 0.035, 0.105], FLEN = [[0.15, 0.12], [0.165, 0.13], [0.155, 0.12], [0.125, 0.1]];

// opts: { u, skin, sleeve, side (1: thumb on -x, as a right hand seen palm-on; -1: mirrored), arm (forearm length in u) }
export function createHand({ u = 0.2, skin = 0xffd2b0, sleeve = 0x3a6ad8, side = 1, arm = 0.5, glow = 0.3 } = {}) {
  const k = (x) => x * u, bones = [
    { name: 'arm', len: k(arm), r: k(0.075), r2: k(0.068), color: sleeve },
    { name: 'palm', parent: 'arm', len: k(0.3), r: k(0.062), r2: k(0.07), color: skin, joint: false, blob: { r: k(0.16), s: [1, 1.0, 0.42], y: 0.62 } },
  ];
  FX.forEach((x, i) => {
    bones.push({ name: `f${i}a`, parent: 'palm', at: 0.98, off: [k(x * side), 0, 0], len: k(FLEN[i][0]), r: k(0.034), color: skin });
    bones.push({ name: `f${i}b`, parent: `f${i}a`, len: k(FLEN[i][1]), r: k(0.031), r2: k(0.028), color: skin });
  });
  bones.push({ name: 'ta', parent: 'palm', at: 0.32, off: [k(-0.15 * side), 0, k(0.02)], rest: [0, 0, 0.75 * side], len: k(0.13), r: k(0.042), color: skin });
  bones.push({ name: 'tb', parent: 'ta', len: k(0.11), r: k(0.038), r2: k(0.034), color: skin });
  const rig = createRig(bones, { glow });
  const grip = new THREE.Group(); grip.position.set(0, k(0.37), k(0.1)); rig.bone('palm').add(grip);   // inside the fist
  const cur = { f: [0, 0, 0, 0], spread: 0, thumb: [0, 0] };
  function apply() {
    cur.f.forEach((c, i) => {
      rig.bone(`f${i}a`).rotation.set(1.45 * c, 0, (i - 1.5) * -0.07 * cur.spread * side);
      rig.bone(`f${i}b`).rotation.set(1.7 * c, 0, 0);
    });
    const [a, b] = cur.thumb;                                   // a: across the palm, b: tip curl
    rig.bone('ta').rotation.set(0.9 * a, 0, -0.95 * a * side); rig.bone('tb').rotation.set(1.1 * b, 0, -0.3 * b * side);
    rig.update();
  }
  function pose(a, b = a, t = 0) {
    const A = typeof a === 'string' ? POSES[a] : a, B = typeof b === 'string' ? POSES[b] : b, mix = (x, y) => x + (y - x) * t;
    cur.f = A.f.map((x, i) => mix(x, B.f[i])); cur.spread = mix(A.spread, B.spread); cur.thumb = [mix(A.thumb[0], B.thumb[0]), mix(A.thumb[1], B.thumb[1])];
    apply();
  }
  pose('open');
  return { group: rig.group, rig, grip, pose, bone: rig.bone, update: apply, drawCalls: rig.drawCalls };
}
