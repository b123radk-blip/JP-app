// 試 (plan 017, card 8a66): a woman stands on a small wood floor by a hat stand at her left (the learner's right)
// and tries hats on. Loop 8 s: 0-1 Idle, the big brown hat on the top tier, the red cap on the low tier; 1.0-1.3 her
// left hand takes the big hat's brim at its near edge; 1.3-1.8 she flips it: it arcs and lands low on her head,
// covering her eyes; 1.9-3.0 she shakes her head and the hat wobbles with it; 3.1-3.4 her left hand grabs the brim
// and lifts the hat; 3.4-4.0 she tosses it back: it arcs onto the top tier; 4.3-4.6 her left hand takes the cap's
// near edge; 4.6-5.2 she flips the cap up: it lands on top of her head, peak toward the learner; 5.4-6.4 she spins
// once round to show it off, the cap staying on; 6.4-7.2 hearts pop beside her head as she nods, pleased; 7.2-7.5
// the cap shrinks away on her head; 7.5-8.0 it pops back on the low tier, so the loop ends where it began.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { heart } from '../pieces/kit-things.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc } from './helpers.js';
import { grow } from './step1-kit.js';
import { pop, onHead, ADULT } from './q-common.js';

const XN = new THREE.Vector3(1, 0, 0), NX = new THREE.Vector3(-1, 0, 0);   // the palm's way to each hat's near edge
const W = new THREE.Vector3(), WS = new THREE.Vector3();

function tryHats(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, k = (x) => x * u, X = (x) => B.maxX + x * u;
  const who = actor('gal', ADULT * u);
  group.add(who.group);
  const slab = solidProp([[G.box(k(0.95), k(0.02), k(0.55)), 0xb08a60]], 0.12);
  slab.name = 'floor'; slab.position.set(X(0.93), floor - 0.01 * u, 0);
  const stand = solidProp([
    [G.cyl(k(0.015), k(0.015), k(0.76), 0, k(0.38), 0), 0x6a4a28],
    [G.cyl(k(0.09), k(0.09), k(0.02), 0, k(0.01), 0), 0x6a4a28],
    [G.cyl(k(0.06), k(0.06), k(0.02), 0, k(0.42), 0), 0x6a4a28],
  ], 0.12);
  stand.name = 'stand'; stand.position.set(X(1.25), floor, -0.06 * u);
  const tierLow = solidProp([[G.cyl(k(0.13), k(0.13), k(0.02)), 0x6a4a28]], 0.12);
  tierLow.name = 'tier low'; tierLow.position.set(X(1.25), floor + 0.44 * u, -0.06 * u);
  const tierTop = solidProp([[G.cyl(k(0.13), k(0.13), k(0.02)), 0x6a4a28]], 0.12);
  tierTop.name = 'tier top'; tierTop.position.set(X(1.25), floor + 0.77 * u, -0.06 * u);
  // a hat's pivot is the middle of its crown's bottom (the big hat's brim hangs from it): the big hat's box centre
  // sits 0.1u above the pivot, the cap's 0.105 up and 0.05 toward the learner (its peak widens the box forward)
  const bigHat = solidProp([
    [G.cyl(k(0.19), k(0.19), k(0.2), 0, k(0.1), 0), 0x7a5030],
    [G.cyl(k(0.24), k(0.24), k(0.012), 0, k(0.006), 0), 0x7a5030],
    [G.cyl(k(0.194), k(0.194), k(0.035), 0, k(0.04), 0), 0x4a3020],
  ], 0.25);
  bigHat.name = 'big hat';
  const cap = solidProp([
    [G.cyl(k(0.16), k(0.16), k(0.13), 0, k(0.065), 0), 0xd03040],
    [G.sphere(k(0.16), 0, k(0.13), 0, 1, 0.5, 1), 0xd03040],
    [G.box(k(0.28), k(0.014), k(0.12), 0, k(0.02), k(0.2)), 0xd03040],
  ], 0.3);
  cap.name = 'cap';
  const h1 = heart(u), h2 = heart(u), h3 = heart(u);
  group.add(slab, stand, tierLow, tierTop, bigHat, cap, h1, h2, h3);
  // where each hat's pivot must sit while it is on her head (its box centre then lands on the head's middle / top),
  // and the offset of the 'over' landmark that gets it there, in heights (set from the first head measurement)
  const PB = { x: 0.8, y: 0.68, z: -0.04 };
  const PC = { x: 0.8, y: 0.825, z: -0.095 };
  const BIG = { x: -0.056, y: -0.356, z: -0.044 }, CAP = { x: -0.056, y: -0.2, z: -0.094 };
  const loop = 8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), v = A.u < 0 ? -1 : A.v;
      const T = timeline(v, { spin: [5.4, 1.0, 'smooth'] });
      who.pose('Idle', t);
      who.group.position.set(X(0.78), floor, 0); who.group.rotation.y = 2 * Math.PI * T.spin;
      who.shake(between(v, 1.9, 2.1) * (1 - between(v, 2.8, 3.05)), v);
      who.nod(bump(v, 6.5, 1.4), v);
      // big hat: top tier (0-1.3, 4.0-8) -> flipped onto her head (1.3-1.8) -> follows her shaking head (1.8-3.1)
      // -> lifted by the brim (3.1-3.4) -> tossed back to the top tier (3.4-4.0)
      const fb = (v >= 1.3 && v < 1.8) || (v >= 3.4 && v < 4.0);
      bigHat.userData.flies = fb;
      if (v < 1.3 || v >= 4.0) {
        bigHat.position.set(X(1.25), floor + 0.78 * u, -0.06 * u); bigHat.rotation.y = 0;
      } else if (v < 1.8) {
        const f = (v - 1.3) / 0.5, p = f < 0.5 ? arc([1.25, 0.78], [1.02, 1.12], 0.12, f * 2) : arc([1.02, 1.12], [PB.x, PB.y], 0.12, (f - 0.5) * 2);
        bigHat.position.set(X(p[0]), floor + p[1] * u, (-0.06 + 0.02 * f) * u);
      } else if (v < 3.1) {
        onHead(who, bigHat, group, 'over', BIG.x, BIG.y, BIG.z);
      } else if (v < 3.4) {
        const y = PB.y + 0.06 * between(v, 3.1, 3.4);
        bigHat.position.set(X(PB.x), floor + y * u, PB.z * u); bigHat.rotation.y = 0;
      } else {
        const f = (v - 3.4) / 0.6, p = f < 0.5 ? arc([PB.x, PB.y + 0.06], [1.05, 1.1], 0.12, f * 2) : arc([1.05, 1.1], [1.25, 0.78], 0.12, (f - 0.5) * 2);
        bigHat.position.set(X(p[0]), floor + p[1] * u, (PB.z - 0.02 * Math.max(0, (f - 0.5) * 2)) * u);
      }
      // cap: low tier (0-4.6, 7.5-8) -> flipped up (4.6-5.2) -> on top of her head through the spin (5.2-7.5)
      cap.userData.flies = v >= 4.6 && v < 5.2;
      if (v < 4.6 || v >= 7.5) {
        cap.position.set(X(1.25), floor + 0.45 * u, -0.06 * u); cap.rotation.y = 0;
      } else if (v < 5.2) {
        const f = (v - 4.6) / 0.6, p = f < 0.5 ? arc([1.25, 0.45], [0.95, 1.1], 0.12, f * 2) : arc([0.95, 1.1], [PC.x, PC.y], 0.12, (f - 0.5) * 2);
        cap.position.set(X(p[0]), floor + p[1] * u, (-0.06 - 0.035 * Math.max(0, (f - 0.5) * 2)) * u);
      } else {
        onHead(who, cap, group, 'over', CAP.x, CAP.y, CAP.z);
      }
      const cs = v < 7.2 ? 1 : v < 7.5 ? 1 - between(v, 7.2, 7.5) : grow(between(v, 7.5, 8.0));
      cap.scale.setScalar(cs); cap.visible = cs > 0.01;
      // her left hand (the learner's right) takes each hat at its near edge, the palm against the brim, never inside;
      // the grip's target and way live in the group's space, turned into the world space the hand IK works in
      const ws = group.getWorldScale(WS).y, way = (d) => d.transformDirection(group.matrixWorld);
      const g1 = between(v, 1.0, 1.1) * (1 - between(v, 1.3, 1.4));
      const g2 = between(v, 3.1, 3.2) * (1 - between(v, 3.4, 3.5));
      const g3 = between(v, 4.3, 4.45) * (1 - between(v, 4.6, 4.8));
      if (g1 > 0) who.grip('L', group.localToWorld(W.set(X(1.06), floor + 0.80 * u, -0.06 * u)), way(XN), 0.012 * u * ws, g1, { out: 0.7, down: 0.5 });
      else if (g2 > 0) who.grip('L', group.localToWorld(W.set(X(1.02), floor + (PB.y + 0.06 * between(v, 3.1, 3.4)) * u, PB.z * u)), way(NX), 0.012 * u * ws, g2, { out: 0.7, down: 0.5 });
      else if (g3 > 0) who.grip('L', group.localToWorld(W.set(X(1.13), floor + 0.47 * u, -0.06 * u)), way(XN), 0.012 * u * ws, g3, { out: 0.7, down: 0.5 });
      // pleased: hearts pop beside her head
      pop(h1, between(v, 6.4, 6.7), X(0.5), floor + 1.0 * u, 0.06 * u);
      pop(h2, between(v, 6.6, 6.9), X(1.1), floor + 1.06 * u, 0.06 * u);
      pop(h3, between(v, 6.8, 7.1), X(0.8), floor + 1.2 * u, 0.08 * u);
    },
  };
}

export const SCENES = { 'q-try-hats': tryHats };
