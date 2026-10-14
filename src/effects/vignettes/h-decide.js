// Haiku plan h4 (card 決 "decide"): a girl cannot choose between two cakes. Scene type q-pick-cake.
//   loop 7 s: 0-1 she looks down at the cakes; 1-3.2 a big "?" floats over her head, her right hand hovers over cake A
//   (1-1.8), then B (1.8-2.6), then A again (2.6-3.2); 3.2-3.6 the "?" becomes a "!"; 3.6-4.4 her hand comes to the
//   near rim of cake B's plate (the side toward her) and touches it, a green tick pops up over B; 4.4-5.8 she pulls B 0.08 toward her, a
//   small heart pops over her head; 5.8-7 B slides back to its place and her hand goes back to her side.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { HEART } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { ADULT, pop, person } from './q-common.js';

const PULL = 0.08;                                        // how far cake B is pulled toward her (u)
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
// an emblem keeps its own size: pop() would reset its scale to the grow factor alone (k 0..1)
const popE = (m, k, size, x, y, z) => { m.visible = k > 0.01; m.scale.setScalar(size * grow(k)); m.position.set(x, y, z); };

// a slice on a little white plate, its origin on the table top (the sponge's top is 0.07u up)
const plate = (u) => [G.cyl(0.065 * u, 0.065 * u, 0.008 * u, 0, 0.004 * u, 0), 0xffffff];

function pickCake(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const girl = person('gal2', u, ADULT);
  const table = solidProp([
    [G.box(0.6 * u, 0.02 * u, 0.26 * u, 0, 0.41 * u, 0), 0xc9965c],
    [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, -0.26 * u, 0.205 * u, -0.1 * u), 0x9a6a3c], [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, 0.26 * u, 0.205 * u, -0.1 * u), 0x9a6a3c],
    [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, -0.26 * u, 0.205 * u, 0.1 * u), 0x9a6a3c], [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, 0.26 * u, 0.205 * u, 0.1 * u), 0x9a6a3c],
  ], 0.4);
  const cakeA = solidProp([plate(u), [G.box(0.1 * u, 0.05 * u, 0.06 * u, 0, 0.033 * u, 0), 0xfff1d6], [G.box(0.1 * u, 0.008 * u, 0.06 * u, 0, 0.062 * u, 0), 0xffffff], [G.sphere(0.018 * u, 0, 0.075 * u, 0), 0xe0283a]], 0.5);
  const cakeB = solidProp([plate(u), [G.box(0.1 * u, 0.05 * u, 0.06 * u, 0, 0.033 * u, 0), 0x5a2d16], [G.box(0.1 * u, 0.008 * u, 0.06 * u, 0, 0.062 * u, 0), 0x3b1c0c], [G.sphere(0.016 * u, 0, 0.07 * u, 0), 0xb0102a]], 0.5);
  const question = emblemProp('question', 0.18 * u, { color: '#ff9f1c' }), exclaim = emblemProp('exclaim', 0.18 * u, { color: '#ff3b3b' });
  const tick = emblemProp('check', 0.2 * u, { color: '#2ecc40' }), heart = solidProp(HEART(u, 0.08), 0.9);
  tick.traverse((o) => { if (o.isMesh) o.name = 'tick'; });
  table.name = 'table'; cakeA.name = 'cakeA'; cakeB.name = 'cakeB'; question.name = 'question'; exclaim.name = 'exclaim'; tick.name = 'tick';
  table.position.set(B.maxX + 0.8 * u, floor, 0.15 * u); cakeA.position.set(B.maxX + 0.65 * u, floor + 0.42 * u, 0.15 * u); cakeB.position.set(B.maxX + 0.95 * u, floor + 0.42 * u, 0.15 * u);
  girl.group.position.set(B.maxX + 0.8 * u, floor, -0.12 * u);                  // behind the table, facing the learner
  group.add(girl.group, table, cakeA, cakeB, question, exclaim, tick, heart);
  // group-local points (stage units): x from the kanji's right edge, y from the ground line, z to the learner
  const P = (x, y, z, out = new THREE.Vector3()) => out.set(B.maxX + x * u, floor + y * u, z * u);
  const HA = P(0.65, 0.6, 0.15), HB = P(0.95, 0.6, 0.15), HEAD = P(0.8, 1.05, -0.12);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      girl.pose('Idle', t);
      // the eyes go down to the cakes from the start, and up again at the end of the loop
      girl.turn('Head', 0.3 * between(v, 0, 0.8) * (1 - between(v, 6.5, 7)));
      // cake B: pulled toward her from 4.4 to 5.0, held, pushed back from 5.8 to 6.6 (the hand goes with it)
      const pull = between(v, 4.4, 5.0) * (1 - between(v, 5.8, 6.6));
      cakeB.position.z = 0.15 * u - PULL * u * pull; cakeB.position.x = B.maxX + 0.95 * u;
      // the hand's point (group space): A -> B -> A -> B, then down to the near rim of B's plate
      const w = between(v, 1.8, 2.0) - between(v, 2.6, 2.8) + between(v, 3.2, 3.4);
      const target = v1.lerpVectors(HA, HB, w);
      P(0.95, 0.6, 0.055 - (PULL + 0.03) * pull, v2); target.lerp(v2, between(v, 3.6, 3.8));   // back to the plate's near rim, high
      P(0.95, 0.45, 0.055 - (PULL + 0.03) * pull, v2); target.lerp(v2, between(v, 3.8, 4.0));   // then down against it (fist outside the plate)
      girl.handTo('R', group.localToWorld(v3.copy(target)), between(v, 0.9, 1.1) * (1 - between(v, 6.5, 6.9)), { out: 0.6, down: 0.8 });
      // the question mark over her head, then the exclamation mark (the same place)
      const q = between(v, 0.9, 1.1) * (1 - between(v, 3.1, 3.2));
      popE(question, q, 0.18 * u, HEAD.x, HEAD.y, HEAD.z); question.idle?.(v);
      const ex = between(v, 3.2, 3.3) * (1 - between(v, 3.5, 3.6));
      popE(exclaim, ex, 0.18 * u, HEAD.x, HEAD.y, HEAD.z); exclaim.idle?.(v);
      // the green tick over cake B, and a small heart over her head when she pulls it
      const tk = between(v, 3.6, 3.9) * (1 - between(v, 5.8, 6.2));
      popE(tick, tk, 0.2 * u, B.maxX + 0.95 * u, floor + 0.7 * u, (0.15 - PULL * pull) * u); tick.idle?.(v);
      pop(heart, between(v, 4.4, 4.8) * (1 - between(v, 5.6, 5.9)), B.maxX + 0.85 * u, floor + 1.12 * u, -0.12 * u);
    },
  };
}

export const SCENES = { 'q-pick-cake': pickCake };
