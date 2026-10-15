// 渡す (watasu, plan 013): a river that crosses toward the learner - the far bank sits up-back, the near bank down-front,
// the whole ground one 26-degree sloping surface (a point at depth z is (0.5-z)*0.488 above the ground line). A woman waits on
// the far bank; the ferryman, standing in the back of a little boat (its bow toward you), poles it across to her; she hops
// in and sits on the front bench, he poles the boat to the near bank (planting the pole in the water once every 1.1 s,
// leaning and pushing, the top tipping forward), she steps out and waves a thank-you, and walks off to the right while he
// poles the empty boat back, so the loop ends where it started. Loop 8.5 s: 0-0.9 she waits on the far bank and the boat
// waits with its back end at the bank; 0.9-1.5 she walks to the bank's edge and hops into the boat; 1.5-1.8 she sits;
// 1.8-5.0 he poles her across (the boat goes from z -0.58 to +0.04); 5.0-5.2 the boat touches the near bank; 5.2-5.9 she
// stands up and steps out onto it; 5.9-6.6 she faces the learner and waves; 6.6-7.8 she turns right and walks off along the
// near bank (shrinking away from 7.4); 6.4-8.5 he poles the empty boat back to the far bank; 8.0-8.5 she pops back in on the
// far bank. People and the pole stay upright; the banks, the river and the boat are turned 26 degrees with the ground.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { actor } from './model-kit.js';
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, beam } from './helpers.js';
import { lerp, turnTo } from './q-common.js';
import { seatAt } from './q-ride.js';
import { grow } from './step1-kit.js';

const PI = Math.PI, TILT = 0.4538, SLOPE = 0.488, KB = 0.3;                // 26 degrees; tan 26 = 0.488; the boat's scale (u per model unit)
const slope = (z) => (0.5 - z) * SLOPE;                                    // the ground line at depth z (in u)
const ss = (x) => x * x * (3 - 2 * x);

export function ferry(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, k = (x) => B.maxX + x * u, gy = (z) => floor + slope(z) * u;
  const floorTop = (z) => gy(z) + (0.02 + 0.32 * KB * Math.cos(TILT)) * u;   // the boat's deck line at depth z (the keel is submerged: the deck sits at the waterline)
  // the ground: three slabs turned 26 degrees, their bottoms on the ground line: grass, water, grass
  const slab = (w, h, d, x, z, name, color) => {
    const m = solidProp([[G.box(w * u, h * u, d * u, 0, (h / 2) * u, 0), color]], 0.4);
    m.name = name; m.position.set(k(x), gy(z), z * u); m.rotation.x = TILT; return m;
  };
  const far = slab(0.95, 0.06, 0.3, 0.5, -1.0, 'far bank', 0x6ab04c);
  const river = slab(0.95, 0.03, 1.2, 0.5, -0.25, 'river', 0x2f8fe0);
  const near = slab(0.95, 0.06, 0.3, 0.5, 0.5, 'near bank', 0x6ab04c);
  // the boat: a rowboat with its fixed oars removed, turned like the ground, its bow along +z (toward the learner)
  const boat = createModel('rowboat', { height: 0.792 * KB * u });   // 0.792: the model's box height incl. its oars, so 1 model unit = 0.3u (the hull then is 0.42 x 0.19 x 0.72)
  const old = boat.node('paddles'); if (old) old.parent.remove(old);
  const hull = new THREE.Group(); hull.add(boat.group); hull.name = 'rowboat';
  const pole = solidProp([[G.cyl(0.008 * u, 0.008 * u, 1, 0, 0.5, 0), 0x8a5a30]], 0.3);
  pole.name = 'pole';
  const man = actor('guy3', 0.42 * u), woman = actor('gal2', 0.42 * u);
  group.add(far, river, near, hull, pole, man.group, woman.group);
  const loop = 8.5, W = new THREE.Vector3(), WO = new THREE.Vector3(), Bp = new THREE.Vector3(), Tp = new THREE.Vector3();
  const seatLocal = [-0.14 * u, 0.56 * KB * u, 0.05 * KB * u];   // the top of the front bench, to the left of middle so the ferryman shows round her
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // the boat waits at the far bank, is poled across 1.8-5.0, rests at the near bank, and is poled back 6.4-8.5
      const cross = pre || v < 1.8 ? 0 : v < 5.0 ? ss((v - 1.8) / 3.2) : v < 6.4 ? 1 : 1 - ss((v - 6.4) / 2.1);
      const bz = lerp(-0.58, 0.04, cross), bob = pre ? 0 : 0.006 * u * Math.sin(t * 2.2);   // the real hull is a little shallower than the blockout: its ends sit in the banks
      hull.position.set(k(0.58), gy(bz) - 0.077 * u + bob, bz * u);   // the model's origin is its lowest point (the oars' blades, removed): the keel rests 0.02u above the water
      hull.rotation.x = TILT;
      hull.updateWorldMatrix(true, true);
      // the ferryman stands on the floor at the back, poles the boat: once every 1.1 s the bottom is planted in the
      // water, he leans and pushes (the top tips forward), then he lifts it and swings it round for the next stroke
      const poling = !pre && (v < 5.0 ? v >= 1.8 : v >= 6.4);
      const ph = poling ? ((v - (v < 5.0 ? 1.8 : 6.4)) / 1.1) % 1 : 0;
      const push = poling ? Math.sin(PI * Math.min(1, ph / 0.45)) : 0;
      const rec = poling ? Math.sin(PI * Math.max(0, (ph - 0.45) / 0.55)) : 0;
      const gz = bz - 0.24, pz = bz - 0.22;
      man.pose('Idle', t);
      man.group.position.set(k(0.58), floorTop(gz) + bob, gz * u);
      man.group.rotation.y = 0;
      man.turn('Torso', 0.25 * push);
      Bp.set(k(0.68), gy(pz) + 0.03 * u, pz * u);
      const lean = 0.3 * push;
      Tp.set(Bp.x, Bp.y + (0.75 - 0.03 * rec) * u * Math.cos(lean), Bp.z + 0.75 * u * Math.sin(lean) + 0.06 * rec * u);
      beam(pole, Bp, Tp);
      // grip takes world-space points: the scene sits offset in the world, so add the scene's own world offset
      const O = man.group.getWorldPosition(WO).sub(man.group.position);
      for (const [side, f] of [['R', 0.6], ['L', 0.45]]) {
        const P = Bp.clone().addScaledVector(Tp.clone().sub(Bp).normalize(), 0.75 * u * f);
        const tw = new THREE.Vector3(P.x - man.group.position.x, 0, P.z - man.group.position.z).normalize();
        man.grip(side, P.add(O), tw, (0.012 + (side === 'L' ? 0.007 : 0)) * u, 1);   // the left fist's paddle would dip into the thin pole: rest it a hair further off
      }
      // she waits on the far bank, walks to the bank's edge and hops into the boat, sits on the front bench, rides
      // across, stands up and steps out, waves, walks off to the right - and pops back in on the far bank at the end
      if (pre || v < 0.9) {
        woman.pose('Idle', t);
        woman.group.position.set(k(0.25), gy(-1.0) + 0.06 * u, -1.0 * u);
        woman.group.rotation.y = 0; woman.group.scale.setScalar(1);
      } else if (v < 1.05) {
        const f = (v - 0.9) / 0.15;
        woman.pose('Walk', v);
        woman.group.position.set(lerp(k(0.25), k(0.29), f), lerp(gy(-1.0) + 0.06 * u, gy(-0.88) + 0.06 * u, f), lerp(-1.0, -0.88, f) * u);
        woman.group.rotation.y = 0.3; woman.group.scale.setScalar(1);
      } else if (v < 1.5) {
        const f = (v - 1.05) / 0.45, zf = -0.88 + 0.39 * (1 - (1 - f) * (1 - f));
        woman.pose('Walk', v);
        woman.group.position.set(k(0.29 + 0.15 * Math.max(0, (f - 0.55) / 0.45)), lerp(gy(-0.88) + 0.06 * u, floorTop(zf), f) + 0.36 * u * Math.sin(PI * f), zf * u);
        woman.group.rotation.y = 0.3; woman.group.scale.setScalar(1);
      } else if (v < 5.2) {
        const s = hull.localToWorld(W.set(...seatLocal)); s.y += 0.03 * u;   // her soles land on the floor, not 0.03u above it
        woman.pose('SitDown', Math.min(1, (v - 1.5) / 0.3), false);
        woman.group.position.set(k(0.44), floorTop(s.z / u) + 0.03 * u, s.z);
        woman.group.rotation.y = 0; woman.group.scale.setScalar(1);
        seatAt(woman, group, s, between(v, 1.5, 1.8));
      } else if (v < 5.5) {
        const s = hull.localToWorld(W.set(...seatLocal)); s.y += 0.03 * u;
        woman.pose('StandUp', Math.min(1, (v - 5.2) / 0.3), false);
        woman.group.position.set(k(0.44), floorTop(s.z / u) + 0.03 * u, s.z);
        woman.group.rotation.y = 0; woman.group.scale.setScalar(1);
        seatAt(woman, group, s, 1 - between(v, 5.2, 5.5));
      } else if (v < 5.9) {
        const f = (v - 5.5) / 0.4, s = hull.localToWorld(W.set(...seatLocal)); s.y += 0.03 * u;
        woman.pose('Walk', v);
        const zf = lerp(s.z / u, 0.5, f);
        woman.group.position.set(lerp(k(0.44), k(0.45), f), Math.max(lerp(floorTop(s.z / u) + 0.03 * u, gy(0.5) + 0.06 * u, f), gy(zf) + 0.045 * u), zf * u);
        woman.group.rotation.y = 0; woman.group.scale.setScalar(1);
      } else if (v < 6.6) {
        woman.pose('Idle', t);
        woman.group.position.set(k(0.45), gy(0.5) + 0.06 * u, 0.5 * u);
        woman.group.rotation.y = 0; woman.group.scale.setScalar(1);
        woman.wave('R', Math.sin(PI * between(v, 5.9, 6.6)), v);
      } else if (v < 7.8) {
        const f = (v - 6.6) / 1.2;
        woman.pose('Walk', v);
        woman.group.position.set(lerp(k(0.45), k(0.95), f), gy(0.5) + (0.06 + 0.04 * between(v, 6.6, 6.75)) * u, 0.5 * u);   // the walking soles sink a hair: she lifts 0.04 so they stay on the grass
        woman.group.rotation.y = turnTo(0, PI / 2, between(v, 6.6, 6.9));
        woman.group.scale.setScalar(grow(1 - between(v, 7.4, 7.8)));
      } else if (v < 8.0) {
        woman.pose('Idle', t);
        woman.group.position.set(k(0.95), gy(0.5) + 0.1 * u, 0.5 * u);
        woman.group.scale.setScalar(1e-3);
      } else {
        woman.pose('Idle', t);
        woman.group.position.set(k(0.25), gy(-1.0) + 0.06 * u, -1.0 * u);
        woman.group.rotation.y = 0;
        woman.group.scale.setScalar(grow(between(v, 7.9, 8.5)));
      }
    },
  };
}

export const SCENES = { 'q-ferry': ferry };
