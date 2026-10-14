// Haiku plan h5 round 2 (card 6d77, 海 "sea"): a tilted deep-blue sea with three rounded crests rolling in onto a sandy
// beach; a girl on the sand jumps back laughing when the foam reaches her feet, and an orange fish leaps out of the sea.
// Scene type: q-sea-shore.
//   loop 7 s: a crest rolls from the back of the sea to the shore in 2.3 s, one every 7/9 s (three a loop); 2.5-3.8 the foam
//   slides up the sand and back; 2.8-3.4 she jumps back with both arms up, saying わあ!; 4.2-5.2 the fish leaps (a splash
//   where it goes out and where it goes back in). Everything is a pure function of v.
import * as THREE from 'three';
import { acts, bump, timeline } from './timeline.js';
import { createModel } from '../models.js';
import { many, DROP } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { KID, person, pop, speech } from './q-common.js';

const P = 7 / 3, RUN = 2.3;   // one crest's period (three of them spaced a third of it apart); its run from back to shore
const TILT = 25 * Math.PI / 180, TAN = Math.tan(TILT), SEA_L = 0.55 / Math.cos(TILT);   // the sea tilts toward the learner
const FISH = 0.083, LEAP = 0.12, TOP = 0.5;   // the fish's length is about 0.25u; its middle leaves the water 0.12u above the sea, peaks at 0.5u
const v1 = new THREE.Vector3();

// a rounded crest lying along x (about 0.05u tall): a half cylinder in lighter blue, with a white foam cap on top
function crestGeo(u) {
  const R = 0.05 * u, L = 0.85 * u;
  const body = new THREE.CylinderGeometry(R, R, L, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2);
  const foam = new THREE.CylinderGeometry(R * 1.03, R * 1.03, L * 1.01, 16, 1, false, Math.PI / 2 - 0.5, 1.0).rotateZ(Math.PI / 2);
  return [[body, 0x4f9fe0], [foam, 0xffffff]];
}

function seaShore(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.925 * u;
  // the sea's surface height at plan depth z (u): the shore line (z 0.1) is on the ground, the back is raised
  const surfY = (z) => floor + (0.1 - z) * TAN * u;
  const sand = solidProp([[G.box(0.95 * u, 0.02 * u, 0.35 * u, 0, 0.01 * u, 0), 0xe8d29a]], 0.3);
  const sea = solidProp([[G.box(0.95 * u, 0.015 * u, SEA_L * u, 0, 0, 0), 0x1a4a9a]], 0.45);
  const foam = solidProp([[G.box(0.9 * u, 0.004 * u, 0.22 * u, 0, 0.002 * u, 0.11 * u), 0xffffff]], 0.8);   // pivot: its back edge (the shore line)
  const waves = [0, 1, 2].map(() => solidProp(crestGeo(u), 0.6));   // pivot: the bottom of the crest, on the slope
  sand.name = 'sand'; sea.name = 'sea'; foam.name = 'foam';
  sea.rotation.x = TILT; sea.position.set(cx, floor + SEA_L / 2 * Math.sin(TILT) * u,(0.1 - SEA_L / 2 * Math.cos(TILT)) * u);   // front edge on the ground at z 0.1
  sand.position.set(cx, floor, 0.275 * u); foam.position.set(cx, floor + 0.02 * u, 0.1 * u);
  for (const w of waves) { w.name = 'wave'; w.rotation.x = TILT; w.position.x = cx; }
  const girl = person('gal2', u, KID), laugh = speech(u, 'わあ!', { h: 0.13 });
  girl.group.rotation.y = Math.PI - 0.9 - 0.87;   // turned about 50 degrees toward the learner from the sea
  const fish = createModel('fishOrange', { height: FISH * u }), piv = new THREE.Group();
  fish.group.position.y = -FISH / 2 * u; piv.add(fish.group);   // pivot: the fish's middle
  const splash = many(DROP(u, 0xf4fbff), 12, 0.8);
  group.add(sand, sea, foam, ...waves, girl.group, laugh, piv, splash);
  const loop = 7;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      // the crests: each rolls back to front on the slope, flattening as it reaches the shore; between runs it waits at the back
      waves.forEach((w, i) => {
        const tau = (((v - i * P / 3) % P) + P) % P, r = tau < RUN ? tau / RUN : 0, z = -0.4 + 0.5 * r;
        w.position.set(cx, surfY(z) + 0.005 * u, z * u); w.scale.y = Math.max(0.1, Math.sin(Math.PI * r));
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
      // the fish: out of the sea at x 0.75u, z -0.2u, up to 0.5u and back in, nose up as it leaves, nose down as it falls
      const leap = v >= 4.2 && v < 5.2, f = leap ? v - 4.2 : 0, arc = 4 * f * (1 - f), sy0 = surfY(-0.2);
      piv.visible = leap; fish.pose('Swim', t);
      piv.scale.setScalar(Math.max(1e-3, Math.min(between(v, 4.2, 4.4), 1 - between(v, 5.0, 5.2))));   // grows out of the splash, sinks back in
      piv.position.set(B.maxX + 0.75 * u, sy0 + LEAP * u * (1 - arc) + (floor + TOP * u - sy0) * arc, -0.2 * u);
      piv.rotation.x = 0.5 * (2 * f - 1);
      // splashes: twelve drops, six where it goes out (4.2) and six where it goes back in (5.2)
      const sx = B.maxX + 0.75 * u, sz = -0.2 * u;
      for (let i = 0; i < 12; i++) {
        const k = i < 6 ? bump(v, 3.95, 0.5) : bump(v, 4.95, 0.5), a = ((i % 6) / 6) * 2 * Math.PI, r = (0.03 + 0.05 * (1 - k)) * u;
        splash.set(i, sx + Math.cos(a) * r, sy0 + 0.05 * u * k, sz + Math.sin(a) * r, k);
      }
      splash.commit();
    },
  };
}

export const SCENES = { 'q-sea-shore': seaShore };
