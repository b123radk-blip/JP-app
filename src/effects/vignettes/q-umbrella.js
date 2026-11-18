// 傘 (plan 025, card w1301940): rain pours on a girl, she opens her red umbrella over her head and stays dry.
// Loop 8 s: 0-0.5 Idle, the closed umbrella hanging from her right hand at her side, no rain; 0.5-0.8 the rain fades in;
// 0.5-1.7 she hunches and puts a hand over her forehead while it falls on her; 1.0-1.8 she lifts the umbrella up (away
// from the kanji, so it never covers it) and her left hand comes down; 1.8-2.4 the canopy opens; 2.4-6.4 the rain
// bounces off it - every drop over the canopy stops at its surface and pops into a splash - while she sways happily;
// 6.4-6.9 the rain fades out; 6.9-7.4 the canopy closes; 7.4-8.0 she lowers it back to her side, so the loop ends where
// it started.
//   Her right hand holds the handle the whole loop (grip is live even before she lifts it, so the palm always faces up
//   the shaft) and hold hangs the umbrella from that palm, so the two cannot drift apart. The umbrella's pivot is the
//   point she holds; the shaft goes up past her fist to the canopy, which leans 10° over her head and 29° toward the
//   viewer: the shaft passes in front of her head, and the canopy's rim hangs just above her crown, covering it. Her
//   fist owns the band -0.017u..-0.084u along the shaft round the pivot (its palm presses on the band's near face):
//   the crook hangs off the band's far side and the wooden grip starts on the shaft's side, so no part of the umbrella
//   is ever inside the hand it holds.
import * as THREE from 'three';
import { acts, timeline, lerp } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { many, DROP } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { ADULT } from './q-common.js';

const N = 90;                                // raindrops in one draw call
const K = 1.7;                                // the drops are drawn a little bigger than DROP's own size, so they read
const FALL = 0.5;                             // a drop falls 1.5u in 0.5 s (a fall time that divides the loop)
const SPEED = 1.5 / FALL;                     // u per second
// the umbrella in its own frame: the pivot is the point her palm holds, the shaft runs up +y to the canopy. Her fist
// owns the band -0.017u..-0.084u along the shaft, so the handle is built outside it: the grip at +0.02..+0.13, the
// crook's ring centred at -0.145, just clear of the fist's skin.
const GRIP = 0.017, HOOK = -0.145, SHAFT = 0.20, TOP = 0.35, CAN = 0.33, CR = 0.30, CH = 0.09;
// where she holds it up: heights above her feet, a little to her right, a little toward the viewer (all reachable)
const HOLD = [-0.033, 0.69, 0.05];
const rnd = (i, k) => ((i * 7919 + k * 104729) % 997) / 997;   // a fixed number per drop (pure, no Math.random)

function umbrella(u) {
  const g = new THREE.Group(); g.name = 'umbrella';
  const handle = solidProp([[G.torus(0.035 * u, 0.012 * u, Math.PI, 0, HOOK * u, 0, Math.PI), 0x4a2a18],  // the crook past her fist
    [G.cyl(GRIP * u, GRIP * u, 0.11 * u, 0, 0.075 * u, 0), 0x5a3620]], 0.3);   // the wooden grip, from the fist up to the shaft
  const shaft = solidProp([[G.cyl(GRIP * 0.7 * u, GRIP * 0.7 * u, SHAFT * u, 0, 0.23 * u, 0), 0x30363e],
    [G.cyl(GRIP * 1.25 * u, GRIP * 1.25 * u, 0.045 * u, 0, 0.15 * u, 0), 0x24292f],
    [G.cone(GRIP * 0.8 * u, 0.07 * u, 0, TOP * u, 0), 0x9aa4b4]], 0.25);   // the ferrule: its tip near the floor when it hangs
  const canopy = solidProp([[G.cone(CR * u, CH * u, 0, 0, 0), 0xd03040], [G.cyl(CR * 0.09 * u, CR * 0.06 * u, 0.05 * u, 0, CH * 0.6 * u, 0), 0xa02433]], 0.55);
  handle.name = 'handle'; shaft.name = 'shaft'; canopy.name = 'canopy';
  g.add(handle, shaft, canopy);
  return { g, canopy };
}

function umbrellaScene(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u;
  const who = actor('gal2', ADULT * u);
  const { g: umb, canopy } = umbrella(u);
  who.group.add(umb);
  const rain = many(DROP(u), N); rain.name = 'rain'; group.add(rain);
  group.add(who.group);
  const xs = [], zs = [], ph = [];
  for (let i = 0; i < N; i++) { xs.push(X(0.05 + 1.2 * rnd(i, 1))); zs.push(-0.2 + 0.55 * rnd(i, 2)); ph.push(FALL * rnd(i, 3)); }
  const loop = 8, W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      const T = timeline(v, { lift: [1.0, 0.8], open: [1.8, 0.6], close: [6.9, 0.5], lower: [7.4, 0.6] });
      const e = T.lift * (1 - T.lower), open = T.open * (1 - T.close);
      who.pose('Idle', t);
      who.group.position.set(X(0.62), floor, 0);
      who.group.rotation.y = 0;
      who.group.rotation.z = 0.05 * between(v, 2.4, 2.8) * (1 - between(v, 6.4, 6.8)) * Math.sin(v * 1.5);   // a slow happy sway
      const hunch = between(v, 0.5, 0.8) * (1 - between(v, 1.2, 1.7));                                        // under the rain
      who.turn('Abdomen', 0.18 * hunch); who.turn('Head', 0.14 * hunch);
      if (hunch > 0.01) who.handTo('L', who.local(0.07, 1.0, 0.2), hunch, { out: 0.8, down: 0.3 });
      // the point her hand holds: her idle fist -> the point over her head, on the timeline (never on where the
      // umbrella ended up last frame, so the hand and the umbrella cannot drift away from each other)
      const P = who.fist('R', W).lerp(who.local(HOLD[0], HOLD[1], HOLD[2], W2), e);
      umb.rotation.set(0.5 * e - 0.72 * (1 - e), 0, (Math.PI + 0.06) + e * (Math.PI - 0.23));   // hangs down in front of her feet -> swung up over her head
      canopy.scale.set(0.10 + 0.90 * open, 1 + 1.2 * (1 - open), 0.10 + 0.90 * open);
      canopy.position.y = lerp(0.24, CAN, open) * u;                          // closed it hangs along the shaft as a bundle
      who.group.updateWorldMatrix(true, true);
      const toward = W3.set(0, 1, 0).applyEuler(umb.rotation);                 // up the shaft: the palm presses against it
      who.grip('R', P, toward, GRIP * u, 1, { out: 0.75, down: 0.4 });
      who.hold(umb, 'R', who.group, GRIP * u);
      who.group.updateWorldMatrix(true, true);
      // the rain: straight down; over the open canopy a drop stops at its surface and pops into a splash
      const rainK = between(v, 0.5, 0.8) * (1 - between(v, 6.4, 6.7));
      const cp = group.worldToLocal(canopy.getWorldPosition(W)), R = CR * u * canopy.scale.x, h = CH * u * canopy.scale.y;
      const top = floor + 1.5 * u;
      for (let i = 0; i < N; i++) {
        const d = Math.hypot(xs[i] - cp.x, zs[i] - cp.z);
        const hit = open > 0.6 && d < R ? cp.y + h / 2 - (d / R) * h : floor;
        const a = (v + ph[i]) % FALL;
        const y = top - SPEED * a;
        let k = rainK;
        if (y <= hit) {                                       // landed on the canopy (or on the ground): a splash
          const sp = (a - (top - hit) / SPEED) / 0.18;
          k = hit > floor + 0.01 * u ? (sp < 1 ? rainK * (1 + 2 * sp) : 0) : 0;
          rain.set(i, xs[i], hit + 0.02 * u * Math.max(0, sp), zs[i], pre ? 0 : k * K);
        } else rain.set(i, xs[i], y, zs[i], pre ? 0 : k * K);
      }
      rain.commit();
    },
  };
}

export const SCENES = { 'q-umbrella': umbrellaScene };
