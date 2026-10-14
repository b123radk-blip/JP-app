// Haiku plan h4 (card 決 "decide"): a girl cannot choose between two cakes. Scene type q-pick-cake.
//   loop 7 s: 0-1 she looks down at the cakes; 1-3.2 a big "?" floats over her head, her right hand hovers over cake A
//   (1-1.8), then B (1.8-2.6), then A again (2.6-3.2); 3.2-3.6 the "?" becomes a "!"; 3.6-4.4 her hand comes to the
//   near rim of cake B's plate (the side toward her) and touches it, a green tick pops up over B; 4.4-5.8 she pulls B
//   0.08 toward her, a small heart pops over her head; 5.8-7 B slides back to its place and her hand goes back to her side.
//   Round 2: bigger cake slices (0.2u plates, wedges with a cream layer and a fruit on top), signs 0.3u.
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

// a cake slice seen from above: a triangle whose tip points to the learner, extruded from y0 up by h (u); origin on the table
const slice = (u, y0, h, color) => {
  const s = new THREE.Shape([new THREE.Vector2(-0.09 * u, 0.05 * u), new THREE.Vector2(0.09 * u, 0.05 * u), new THREE.Vector2(0, -0.07 * u)]);
  const geo = new THREE.ExtrudeGeometry(s, { depth: h * u, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y0 * u, 0);
  return [geo, color];
};
// a plate (radius 0.1u) with a slice on it: sponge, a cream layer on top, and one fruit (its origin on the table top)
const cake = (u, sponge, layer, fruitColor) => solidProp([
  [G.cyl(0.1 * u, 0.1 * u, 0.008 * u, 0, 0.004 * u, 0), 0xffffff],
  slice(u, 0.008, 0.082, sponge), slice(u, 0.09, 0.014, layer),
  [G.sphere(0.024 * u, 0, 0.12 * u, 0.01 * u), fruitColor],
], 0.5);

function pickCake(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const girl = person('gal2', u, ADULT);
  const table = solidProp([
    [G.box(0.6 * u, 0.02 * u, 0.26 * u, 0, 0.41 * u, 0), 0xc9965c],
    [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, -0.26 * u, 0.205 * u, -0.1 * u), 0x9a6a3c], [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, 0.26 * u, 0.205 * u, -0.1 * u), 0x9a6a3c],
    [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, -0.26 * u, 0.205 * u, 0.1 * u), 0x9a6a3c], [G.cyl(0.012 * u, 0.012 * u, 0.41 * u, 0.26 * u, 0.205 * u, 0.1 * u), 0x9a6a3c],
  ], 0.4);
  const cakeA = cake(u, 0xfff1d6, 0xffffff, 0xe0283a);     // white sponge, cream, strawberry
  const cakeB = cake(u, 0x5a2d16, 0xf3e1c8, 0xb0102a);         // chocolate sponge, pale cream, cherry
  const question = emblemProp('question', 0.3 * u, { color: '#ff9f1c' }), exclaim = emblemProp('exclaim', 0.3 * u, { color: '#ff3b3b' });
  const tick = emblemProp('check', 0.3 * u, { color: '#2ecc40' }), heart = solidProp(HEART(u, 0.08), 0.9);
  tick.traverse((o) => { if (o.isMesh) o.name = 'tick'; });
  table.name = 'table'; cakeA.name = 'cakeA'; cakeB.name = 'cakeB'; question.name = 'question'; exclaim.name = 'exclaim'; tick.name = 'tick';
  table.position.set(B.maxX + 0.8 * u, floor, 0.15 * u); cakeA.position.set(B.maxX + 0.62 * u, floor + 0.42 * u, 0.15 * u); cakeB.position.set(B.maxX + 0.98 * u, floor + 0.42 * u, 0.15 * u);
  girl.group.position.set(B.maxX + 0.8 * u, floor, -0.12 * u);                  // behind the table, facing the learner
  group.add(girl.group, table, cakeA, cakeB, question, exclaim, tick, heart);
  // group-local points (stage units): x from the kanji's right edge, y from the ground line, z to the learner
  const P = (x, y, z, out = new THREE.Vector3()) => out.set(B.maxX + x * u, floor + y * u, z * u);
  const HA = P(0.62, 0.66, 0.15), HB = P(0.98, 0.66, 0.15), HEAD = P(0.8, 1.05, -0.12), SIGN = P(0.98, 1.1, 0.05);
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
      cakeB.position.z = 0.15 * u - PULL * u * pull;
      // the hand's point (group space): A -> B -> A -> B, then up and down to the near rim of B's plate
      const w = between(v, 1.8, 2.0) - between(v, 2.6, 2.8) + between(v, 3.2, 3.4);
      const target = v1.lerpVectors(HA, HB, w), rimZ = 0.02 - (PULL + 0.03) * pull;
      P(0.98, 0.66, rimZ, v2); target.lerp(v2, between(v, 3.6, 3.8));   // back to the plate's near rim, high
      P(0.98, 0.45, rimZ, v2); target.lerp(v2, between(v, 3.8, 4.0));   // then down against it (fist outside the plate)
      girl.handTo('R', group.localToWorld(v3.copy(target)), between(v, 0.9, 1.1) * (1 - between(v, 6.5, 6.9)), { out: 0.6, down: 0.8 });
      // the question mark over her head (in front of her hair), then the exclamation mark (the same place)
      const q = between(v, 0.9, 1.1) * (1 - between(v, 3.1, 3.2));
      popE(question, q, 0.3 * u, SIGN.x, SIGN.y, SIGN.z); question.idle?.(v);
      const ex = between(v, 3.2, 3.3) * (1 - between(v, 3.5, 3.6));
      popE(exclaim, ex, 0.3 * u, SIGN.x, SIGN.y, SIGN.z); exclaim.idle?.(v);
      // the green tick over cake B, and a small heart over her head when she pulls it
      const tk = between(v, 3.6, 3.9) * (1 - between(v, 5.8, 6.2));
      popE(tick, tk, 0.3 * u, B.maxX + 0.98 * u, floor + 0.75 * u, (0.15 - PULL * pull) * u); tick.idle?.(v);
      pop(heart, between(v, 4.4, 4.8) * (1 - between(v, 5.6, 5.9)), B.maxX + 0.85 * u, floor + 1.12 * u, -0.12 * u);
    },
  };
}

export const SCENES = { 'q-pick-cake': pickCake };
