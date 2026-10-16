// 傘 (plan 021, card w1301940): a girl stands in the rain holding a closed umbrella by its J-hook. Loop 8 s: 0-0.5 Idle,
// the umbrella closed and down, no rain yet; 0.5-0.8 the rain fades in; 0.5-1.8 she hunches, left hand over her forehead,
// the rain falling on her; 1.0-1.8 she swings the umbrella up (the grip follows the handle), the left hand comes down;
// 1.8-2.4 the canopy springs open over her head (the shaft passes beside her head, the rim just above it); 2.4-6.4 the
// rain bounces off the canopy in tiny splashes and she sways side to side, holding it up; 6.4-6.9 the rain fades out;
// 6.9-7.4 the canopy closes; 7.4-8.0 she lowers it back down by her side, so the loop ends where it began. Her right
// hand grips the handle every frame (the palm against it, never inside it).
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { many, DROP } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { ADULT } from './q-common.js';

const P = new THREE.Vector3(), YD = new THREE.Vector3(), XW = new THREE.Vector3(), X2 = new THREE.Vector3(), Z2 = new THREE.Vector3(), C = new THREE.Vector3(), GRIP = new THREE.Vector3(-0.035, -0.035, 0), W = new THREE.Vector3(), W2 = new THREE.Vector3(), M = new THREE.Matrix4(), Q1 = new THREE.Quaternion(), Q2 = new THREE.Quaternion();
const FALL = 8 / 13;                                       // one drop fall (8/13 s) so the rain loops cleanly

function umbrellaScene(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u;
  const who = actor('gal2', ADULT * u);
  // the umbrella: one group, pivot at the bottom of the shaft. Three named parts: the J-hook (half torus, its top at the
  // shaft's bottom), the thin shaft up to 0.62, and the red canopy (a cone pivoted at its tip: open 0.38 x 0.12 with the
  // rim 0.12 below the shaft's top; closed it hugs the shaft, radius 0.12 of open and 2.5 times taller)
  const umbrella = new THREE.Group();
  umbrella.name = 'umbrella';
  const handle = solidProp([[G.torus(0.035 * u, 0.012 * u, Math.PI, 0, -0.035 * u, 0, Math.PI / 2), 0x4a2a18]]);
  const shaft = solidProp([[G.cyl(0.01 * u, 0.01 * u, 0.62 * u, 0, 0.31 * u, 0), 0x303030]]);
  const canopy = solidProp([[G.cone(0.38 * u, 0.12 * u).translate(0, -0.06 * u, 0), 0xd03040]]);
  handle.name = 'handle'; shaft.name = 'shaft'; canopy.name = 'canopy';
  canopy.position.set(0, 0.62 * u, 0);
  umbrella.add(handle, shaft, canopy);
  const rain = many(DROP(u), 60, 0.7);                     // 60 drops, one draw call
  rain.name = 'rain';
  group.add(who.group, umbrella, rain);
  who.group.position.set(X(0.62), floor, 0);
  // the two poses (u from the kanji's right edge): down - closed, hung by her right hand, the tip near the floor by her
  // feet; up - the shaft's bottom at the hand (0.40, 0.58), the shaft leaning in so its middle passes at (0.46, 0.87),
  // clear of her head, and the canopy's middle at about (0.51, 1.12) over it
  const Pd = new THREE.Vector3(X(0.42), floor + 0.435 * u, 0.06 * u), Pu = new THREE.Vector3(X(0.40), floor + 0.58 * u, 0.06 * u);
  const Yd = new THREE.Vector3(-0.5, -0.534, 0.684).normalize(), Yu = new THREE.Vector3(0.10, 0.49, -0.06).normalize();
  const Xd = new THREE.Vector3(1, 0, -0.25), Xu = new THREE.Vector3(1, 0, 0.2);         // the hook's open side (her hand)
  const loop = 8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [1.0, 0.8], open: [1.8, 0.6, 'back'], close: [6.9, 0.5], down: [7.4, 0.6] });
      const e = v < 7.4 ? T.up : 1 - T.down;               // 0 = down by her side, 1 = up over her head
      const openF = v < 6.9 ? T.open : 1 - T.close;        // the canopy's radius / height (1 open, 0.12 / 2.5 closed)
      who.pose('Idle', t);
      // hunch and cover her head with the left hand (0.5-1.8), then a small happy sway while the rain bounces off (2.4-6.4)
      const hunch = between(v, 0.5, 0.7) * (1 - between(v, 1.6, 1.8));
      who.bow(0.18 * hunch);
      who.handTo('L', who.local(0, 0.97, 0.14), hunch, { out: 0.3, down: 1 });
      const sw = v > 2.4 && v < 6.4 ? (v - 2.4) / 4 : 0;
      who.group.rotation.z = 0.03 * Math.sin(Math.PI * sw) * Math.sin(2 * Math.PI * sw * 2);
      // the umbrella: the pose eases down -> up (1.0-1.8) and back (7.4-8.0); the grip and the canopy scale follow it
      P.copy(Pd).lerp(Pu, e);
      YD.lerpVectors(Yd, Yu, e).normalize();
      XW.copy(Xd).lerp(Xu, e);
      X2.copy(XW).addScaledVector(YD, -XW.dot(YD)).normalize(); Z2.crossVectors(X2, YD).normalize();   // the group's basis
      M.makeBasis(X2, YD, Z2); Q2.setFromRotationMatrix(M); umbrella.position.copy(P); umbrella.quaternion.copy(Q2);
      canopy.scale.set(0.12 + 0.88 * openF, 2.5 - 1.5 * openF, 0.12 + 0.88 * openF);
      // the right hand on the handle every frame: the palm against the hook's outside, the hook opening toward her
      umbrella.localToWorld(W.copy(GRIP).multiplyScalar(u));
      W2.set(1, 0, 0).applyQuaternion(umbrella.getWorldQuaternion(Q1)).negate();
      who.grip('R', W, W2, 0.012 * u * group.getWorldScale(new THREE.Vector3()).y, pre ? A.setup : 1, { out: 0.5, down: 0.6 });
      // the rain: 60 drops, each its own x (0.05-1.15), z (-0.2-0.3) and phase; one fall from 1.5 to the floor every 8/13 s
      const rainOn = between(v, 0.5, 0.8) * (1 - between(v, 6.4, 6.9));
      C.copy(P).addScaledVector(YD, 0.56 * u);             // the open canopy's middle
      const topU = (P.y - floor) / u + 0.62 * YD.y + 0.02;  // the canopy's top, a hair above the tip
      for (let i = 0; i < 60; i++) {
        const fx = (i * 0.61803398875) % 1, fz = (i * 0.7548776662) % 1, ph = (i * 0.3543) % 1;
        const dx = X(0.05 + 1.1 * fx), dz = -0.2 * u + 0.5 * fz * u, f = ((v / FALL) + ph) % 1;
        const over = openF > 0.6 && Math.abs(dx - C.x) < 0.36 * u && Math.abs(dz - C.z) < 0.36 * u;
        const fh = (1.5 - topU) / 1.5;                     // the part of the fall left when a drop meets the canopy
        if (over && fh > 0 && f >= fh) {                   // over the open canopy: it stops and splashes
          const g = (f - fh) / (1 - fh);
          rain.set(i, dx, floor + topU * u, dz, rainOn * 1.4 * Math.sin(Math.PI * g));
        } else {                                           // elsewhere: straight to the floor
          const s = rainOn * (f > 0.97 ? 0 : 1);
          rain.set(i, dx, floor + (1.5 - 1.5 * f) * u, dz, s);
        }
      }
      rain.commit();
    },
  };
}

export const SCENES = { 'q-umbrella': umbrellaScene };
