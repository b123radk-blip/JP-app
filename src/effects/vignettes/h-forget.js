// Haiku plan h11 (忘 "forget", card 5fd8), scene q-forgot-umbrella. Loop 7 s: 0-0.8 a girl steps out of the front door
// (it stands open, swung into the house); 0.8-2.4 she walks right; 2.4 rain starts and a thought bubble shows her
// umbrella; 2.8-3.2 she slaps her forehead ("あっ!"); 3.2-4.4 she turns and walks back to the umbrella stand; 4.4-4.8
// she takes the umbrella by its handle; 5.2-5.6 she lifts it over her head and it opens while the rain falls harder;
// 6.0-6.6 she shrinks away; 6.6-7 she is back in the doorway and the umbrella is back in its stand.
// Stage units (u): x from the kanji's right edge, y from the ground, z to the learner. The umbrella's origin is its handle.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { many, DROP, flies } from '../pieces/kit-things.js';
import { solidProp, mergeColored } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { ADULT, RIGHT, LEFT, lerp, person, pop, speech, turnTo } from './q-common.js';

const FRAME = 0x5a3a24, PANEL = 0x9a6a3a, STAND = 0x6a7a8a, CANOPY = 0xd83a3a, WOOD = 0x6a4a2a, ROD = 0x2a2a2a, CLOUD = 0xffffff;
// FLIP: the umbrella upside down (tip down, the handle up); turned about x by -pi, so it swings out to the girl's right
// (away from her body) on the way up
const FLIP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI), ID = new THREE.Quaternion();
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3();
// the thought bubble: a white cloud with a small red umbrella in front, two bubbles trailing down to the head
const THOUGHT = (u) => [
  [G.sphere(0.1 * u, -0.13 * u, 0.02 * u, 0), CLOUD], [G.sphere(0.1 * u, 0.13 * u, 0.02 * u, 0), CLOUD], [G.sphere(0.12 * u, 0, 0.06 * u, 0), CLOUD],
  [G.sphere(0.1 * u, -0.05 * u, -0.05 * u, 0), CLOUD], [G.sphere(0.03 * u, -0.2 * u, -0.16 * u, 0), CLOUD], [G.sphere(0.018 * u, -0.25 * u, -0.25 * u, 0), CLOUD],
  [G.cone(0.09 * u, 0.07 * u, 0, 0.06 * u, 0.14 * u), CANOPY], [G.cyl(0.008 * u, 0.008 * u, 0.12 * u, 0, -0.03 * u, 0.14 * u), ROD],
];
// the umbrella: one mesh (its handle at the origin, the rod up to the tip) with two shapes: closed (a red bundle on the rod)
// and open (a canopy on the rod's top), swapped as it opens
const ROD_PARTS = (u) => [[G.cyl(0.012 * u, 0.012 * u, 0.14 * u, 0, 0, 0), WOOD], [G.cyl(0.0045 * u, 0.0045 * u, 0.44 * u, 0, 0.29 * u, 0), ROD], [G.cone(0.006 * u, 0.03 * u, 0, 0.515 * u, 0), ROD]];

function forgotUmbrella(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  const X = (x) => B.maxX + x * u, F = (y) => floor + y * u, Z = (z) => z * u;
  const girl = person('gal2', u, ADULT);
  // the door: frame, a small step inside the house, the panel swung open into the house (hinge on its left edge)
  const panel = new THREE.BoxGeometry(0.3 * u, 1.0 * u, 0.03 * u).translate(0.15 * u, 0.5 * u, 0).rotateY(1.3).translate(X(0.4), floor, Z(-0.3));
  const door = solidProp([
    [G.box(0.03 * u, 1.04 * u, 0.05 * u, X(0.385), F(0.52), Z(-0.3)), FRAME], [G.box(0.03 * u, 1.04 * u, 0.05 * u, X(0.715), F(0.52), Z(-0.3)), FRAME],
    [G.box(0.36 * u, 0.04 * u, 0.05 * u, X(0.55), F(1.02), Z(-0.3)), FRAME],
    [panel, PANEL],
  ], 0.3);
  door.name = 'door';
  const stand = solidProp([[G.cyl(0.05 * u, 0.045 * u, 0.2 * u, X(0.78), F(0.1), Z(-0.3)), STAND]], 0.3); stand.name = 'stand';
  const umb = solidProp([...ROD_PARTS(u), [G.cyl(0.012 * u, 0.03 * u, 0.2 * u, 0, 0.38 * u, 0), CANOPY]], 0.3);
  const openGeo = mergeColored([...ROD_PARTS(u), [G.cone(0.26 * u, 0.14 * u, 0, 0.52 * u, 0), CANOPY]]);
  const shutGeo = umb.geometry;
  umb.name = 'umbrella';
  const rain = many(DROP(u), 24, 0.5), thought = solidProp(THOUGHT(u), 0.35); thought.name = 'thought';
  const bubble = speech(u, 'あっ!', { h: 0.14 });
  bubble.traverse((o) => flies(o));   // a speech bubble hangs in the air on purpose
  group.add(girl.group, door, stand, umb, rain, thought, bubble);
  const STAND_H = P(0.78, 0.73, -0.3);     // the handle, resting on the stand (the tip touches its top at 0.2)
  const LIFT_H = P(0.82, 0.6, -0.21);      // her right hand, held up at her chest (fixed, so the fade does not drag it down)
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v;
      const rr = 0.012 * u * group.getWorldScale(v1).y, fade = v < 6.6 ? 1 - between(v, 6.0, 6.6) : between(v, 6.6, 7.0), k = Math.max(1e-3, fade);
      // the girl: where she is, which way she faces, walking or standing, shrinking away at the end
      const walking = (v >= 0.8 && v < 2.4) || (v >= 3.2 && v < 4.4);
      girl.pose(walking ? 'Walk' : 'Idle', t);
      let x = 0.55, z = -0.1;
      if (v >= 6.6) { x = 0.55; z = -0.1; }
      else if (v < 0.8) z = lerp(-0.1, 0, between(v, 0, 0.8));
      else if (v < 2.4) { const f = between(v, 0.8, 2.4); x = lerp(0.55, 1.2, f); z = lerp(0, 0.1, f); }
      else if (v < 3.2) { x = 1.2; z = 0.1; }
      else if (v < 4.4) { const f = between(v, 3.2, 4.4); x = lerp(1.2, 0.78, f); z = lerp(0.1, -0.1, f); }
      else { x = 0.78; z = -0.1; }
      const yaw = v >= 6.6 ? 0 : turnTo(turnTo(0, RIGHT, between(v, 0.6, 0.9)), LEFT, between(v, 3.2, 3.5));
      girl.group.position.copy(P(x, 0, z)); girl.group.rotation.y = yaw; girl.group.scale.setScalar(k);
      // the slap: her right hand to her forehead
      const slap = between(v, 2.8, 2.95) * (1 - between(v, 3.15, 3.35));
      girl.handTo('R', girl.at('eyes', v1, 0, 0.03, -0.06), slap, { out: 0.4, down: 0.8 });
      // the umbrella: the palm takes the handle at 4.4-4.8, then carries it up over her head (5.2-5.6)
      const reach = between(v, 4.4, 4.8), lift = between(v, 5.2, 5.6), kG = v < 4.4 || v >= 6.6 ? 0 : reach;
      const C = group.localToWorld(v2.copy(STAND_H)).lerp(group.localToWorld(v3.copy(LIFT_H)), lift);
      if (kG > 0) {
        const tw = v4.copy(C).sub(girl.fist('R', v5));
        if (tw.lengthSq() < 1e-6) tw.set(0, 0, -1);
        girl.grip('R', C, tw.normalize(), rr, kG, { out: 0.9, down: 0.5 });
      }
      if (v >= 4.8 && v < 6.6) girl.hold(umb, 'R', group, rr); else umb.position.copy(STAND_H);
      umb.quaternion.copy(FLIP).slerp(ID, v >= 6.6 ? 0 : between(v, 4.8, 5.2));
      umb.scale.setScalar(v >= 6.6 ? 1 : k);
      const opened = v >= 5.5 && v < 6.6;
      umb.geometry = opened ? openGeo : shutGeo;
      // rain: a few drops from 2.4, more from 5.2, none after 6.9 (9 falls per loop, so the loop closes)
      const nDrop = (8 * between(v, 2.4, 2.5) + 16 * between(v, 5.2, 5.6)) * (1 - between(v, 6.4, 6.9));
      for (let i = 0; i < 24; i++) {
        const fall = ((v * 9 / 7 + i * 0.173) % 1 + 1) % 1;
        rain.set(i, X(0.55 + ((i * 0.37) % 1) * 0.85), F(1.1 - fall * 1.1), Z(-0.4 + ((i * 0.61) % 1) * 0.8), i < nDrop ? 1 : 0);
      }
      rain.commit();
      // the thought bubble (2.4-2.8) and the cry (2.8-3.3)
      pop(thought, between(v, 2.4, 2.5) * (1 - between(v, 2.75, 2.85)), X(0.95), F(1.08), Z(0.1));
      pop(bubble, between(v, 2.8, 2.9) * (1 - between(v, 3.2, 3.3)), X(1.2), F(1.1), Z(0.1));
    },
  };
}

export const SCENES = { 'q-forgot-umbrella': forgotUmbrella };
