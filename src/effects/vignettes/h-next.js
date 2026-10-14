// Haiku plan h13 (card 次 "next"): a girl hops across a pond from stone to stone; before each hop a yellow arrow and a
// bubble (つぎ!) show the next stone, which glows. Scene type: q-stepping-stones. Loop 8 s: hops at 1.0, 2.5 and 4.0
// (0.5 s each); she waves on stone 4 at 4.5-6.5; fades out 6.5-7 and fades in on stone 1 at 7-8.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { KID, RIGHT, pop, person, speech } from './q-common.js';

const H = [1.0, 2.5, 4.0], TOP = 0.05;                                     // hop starts (s); stone top (u)
const S = [[0.6, 0.25], [0.85, 0.08], [1.08, -0.08], [1.3, -0.22]];       // stone centres (x, z) in u

export function stepping(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  const pond = solidProp([[G.cyl(0.45 * u, 0.45 * u, 0.01 * u, 0, 0, 0, 0, 0, 0, 40), 0x3a8ad0]], 0.35);
  pond.name = 'pond'; pond.position.copy(P(0.95, 0.005, 0)); pond.scale.set(1, 1, 0.78);
  const stones = S.map(([x, z], i) => {
    const g = new THREE.Group(), body = solidProp([[G.cyl(0.08 * u, 0.08 * u, 0.04 * u, 0, 0, 0, 0, 0, 0, 24), 0x8a9098]], 0.3);
    const lit = solidProp([[G.cyl(0.082 * u, 0.082 * u, 0.008 * u, 0, 0.024 * u, 0, 0, 0, 0, 24), 0xffd040]], 0.9);
    g.name = `stone${i + 1}`; body.name = g.name; lit.name = `glow${i + 1}`; g.position.copy(P(x, 0.03, z)); lit.visible = false; g.add(body, lit);
    return { g, lit };
  });
  const arrow = emblemProp('arrow', 0.3 * u, { dir: 'down', color: 0xffd040 }); arrow.traverse((o) => { if (o.isMesh) o.name = 'pointer'; });
  const bubble = speech(u, 'つぎ!', { h: 0.14 });
  const girl = person('gal2', u, KID), holder = new THREE.Group();
  holder.add(girl.group); holder.rotation.y = RIGHT - 0.25;              // faces along the path, a little to the learner
  group.add(pond, ...stones.map((s) => s.g), arrow, bubble, holder);
  const loop = 8.0, hp = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      // which hop is in progress (k) and how far (f); after the last hop she stands on stone 4 until 6.5
      const n = H.filter((h) => v >= h).length, k = v >= 7 ? -1 : n - 1, f = k >= 0 ? between(v, H[k], H[k] + 0.5) : 0;
      const hopping = k >= 0 && f > 0 && f < 1, arc = hopping ? 0.12 * 4 * f * (1 - f) : 0;
      let x = S[0][0], z = S[0][1];
      if (k >= 0) { const a = S[k], b = S[k + 1]; x = a[0] + (b[0] - a[0]) * f; z = a[1] + (b[1] - a[1]) * f; }
      holder.position.copy(P(x, TOP + arc, z));
      girl.pose(hopping ? 'Jump' : 'Idle', hopping ? f : t);
      girl.wave('R', between(v, 4.5, 4.8) * (1 - between(v, 6.2, 6.5)), v);
      // fade out on stone 4 (6.5-7), fade in on stone 1 (7-8)
      const vis = v >= 7 ? between(v, 7, 8) : 1 - between(v, 6.5, 7);
      holder.scale.setScalar(Math.max(0.02, vis));                   // never 0: a 2% speck still counts as in the scene
      // the next stone: arrow over it, its glow and the bubble, from 0.6 s before a hop until 0.5 s after it starts
      const ai = H.findIndex((h) => v >= h - 0.6 && v < h + 0.5), on = ai >= 0;
      stones.forEach((s, i) => { s.lit.visible = on && i === ai + 1; });
      arrow.visible = on;
      if (on) { arrow.position.copy(P(S[ai + 1][0], TOP + 0.25, S[ai + 1][1])); arrow.idle(v); }
      hp.copy(holder.position);
      pop(bubble, on ? 1 : 0, hp.x + 0.12 * u, hp.y + 0.72 * u, hp.z + 0.02 * u);
    },
  };
}

export const SCENES = { 'q-stepping-stones': stepping };
