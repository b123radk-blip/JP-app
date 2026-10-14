// Haiku plan h5 (card 6d77, 海 "sea"): three white-topped waves roll in over a blue sea onto a sandy beach; a girl on the
// sand jumps back laughing when the foam reaches her feet, and a blue fish leaps out of the sea. Scene type: q-sea-shore.
//   loop 7 s: a wave rolls from the back of the sea to the shore in 2.3 s, one every 7/9 s (three waves a loop); 2.5-3.8
//   the foam slides up the sand and back; 2.8-3.4 she jumps back with both arms up, saying わあ!; 4.2-5.2 the fish leaps
//   (a splash where it goes out and where it goes back in). Everything is a pure function of v.
import * as THREE from 'three';
import { acts, bump, timeline } from './timeline.js';
import { createModel } from '../models.js';
import { many, DROP } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { KID, person, pop, speech } from './q-common.js';

const P = 7 / 3, RUN = 2.3;   // one wave's period (three of them spaced a third of it apart); its run from back to shore
const FISH = 0.085, LEAP = 0.13;   // the fish's length is about 0.15u; its middle leaves the water 0.13u up
const v1 = new THREE.Vector3();

function seaShore(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.925 * u;
  const sand = solidProp([[G.box(0.95 * u, 0.02 * u, 0.35 * u, 0, 0.01 * u, 0), 0xe8d29a]], 0.3);
  const sea = solidProp([[G.box(0.95 * u, 0.015 * u, 0.55 * u, 0, 0.0075 * u, 0), 0x1d5cae]], 0.45);
  const foam = solidProp([[G.box(0.9 * u, 0.004 * u, 0.22 * u, 0, 0.002 * u, 0.11 * u), 0xffffff]], 0.8);   // pivot: its back edge (the shore line)
  const waves = [0, 1, 2].map(() => solidProp([[G.box(0.85 * u, 0.05 * u, 0.1 * u, 0, 0.025 * u, 0), 0xf8fcff]], 0.7));   // pivot: its bottom
  sand.name = 'sand'; sea.name = 'sea'; foam.name = 'foam';
  sand.position.set(cx, floor, 0.275 * u); sea.position.set(cx, floor, -0.175 * u); foam.position.set(cx, floor + 0.02 * u, 0.1 * u);
  for (const w of waves) { w.name = 'wave'; w.position.set(cx, floor + 0.015 * u, 0); }
  const girl = person('gal2', u, KID), laugh = speech(u, 'わあ!', { h: 0.13 });
  girl.group.rotation.y = Math.PI - 0.9;   // on the sand, turned to the sea
  const fish = createModel('fishBlue', { height: FISH * u }), piv = new THREE.Group();
  fish.group.position.y = -FISH / 2 * u; piv.add(fish.group);   // pivot: the fish's middle
  const splash = many(DROP(u, 0xf4fbff), 12, 0.8);
  group.add(sand, sea, foam, ...waves, girl.group, laugh, piv, splash);
  const loop = 7;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      // the waves: each rolls back to front, flattening as it reaches the shore (0.05u tall in the middle)
      waves.forEach((w, i) => {
        const tau = (((v - i * P / 3) % P) + P) % P, r = tau < RUN ? tau / RUN : 0;   // between runs a wave waits at the back, flat
        w.position.z = (-0.4 + 0.5 * r) * u; w.scale.y = Math.max(0.05, Math.sin(Math.PI * r));
      });
      // the foam: up the sand to 0.32u at 2.9, back to the shore line at 3.8
      const T = timeline(v, { up: [2.5, 0.4, 'out'], down: [2.9, 0.9] }), e = T.up * (1 - T.down);
      foam.visible = e > 0.01; foam.scale.z = Math.max(1e-3, e);
      // the girl: she stands on the sand, then jumps back (0.08u up, 0.06u toward the learner) with both arms up
      const jump = bump(v, 2.8, 0.6);
      girl.pose('Idle', t);
      girl.group.position.set(B.maxX + 0.95 * u, floor + 0.02 * u + 0.08 * u * jump, 0.3 * u + 0.06 * u * jump);
      girl.handTo('R', girl.local(-0.28, 1.05, 0.06), jump, { out: 0.9, down: 0.4 });
      girl.handTo('L', girl.local(0.28, 1.05, 0.06), jump, { out: 0.9, down: 0.4 });
      const laughK = between(v, 2.85, 2.95) * (1 - between(v, 3.35, 3.45));
      const lp = group.worldToLocal(girl.at('over', v1, 0.3, 0.12, 0));
      pop(laugh, laughK, lp.x, lp.y, lp.z);
      // the fish: out of the sea at x 0.7u, z -0.2u, up to 0.35u and back in, nose up as it leaves, nose down as it falls
      const leap = v >= 4.2 && v < 5.2, f = leap ? v - 4.2 : 0, arc = 4 * f * (1 - f);
      piv.visible = leap; fish.pose('Swim', t);
      piv.scale.setScalar(Math.max(1e-3, Math.min(between(v, 4.2, 4.4), 1 - between(v, 5.0, 5.2))));   // grows out of the splash, sinks back in
      piv.position.set(B.maxX + 0.7 * u, floor + (LEAP * (1 - arc) + 0.35 * arc) * u, -0.2 * u);
      piv.rotation.x = 0.5 * (2 * f - 1);   // nose up as it leaves, nose down as it falls
      // splashes: twelve drops, six where it goes out (4.2) and six where it goes back in (5.2)
      const sx = B.maxX + 0.7 * u, sz = -0.2 * u, sy = floor + 0.015 * u;
      for (let i = 0; i < 12; i++) {
        const k = i < 6 ? bump(v, 3.95, 0.5) : bump(v, 4.95, 0.5), a = ((i % 6) / 6) * 2 * Math.PI, r = (0.03 + 0.05 * (1 - k)) * u;
        splash.set(i, sx + Math.cos(a) * r, sy + 0.05 * u * k, sz + Math.sin(a) * r, k);
      }
      splash.commit();
    },
  };
}

export const SCENES = { 'q-sea-shore': seaShore };
