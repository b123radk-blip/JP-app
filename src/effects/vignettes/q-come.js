// Model scenes for 来 (come), dispatched from step1-g.js ('come-here'):
//   puppy (来)   a person beckons, come here! Far down a path a Shiba hears, gallops all the way up to her and jumps up;
//                she crouches and pats it (hearts), then it bounds off back down the path
//   bird (来る)  a person beckons, then holds her hand out flat; a bird flies in from far away, lands on her palm and
//                looks about, then flies off again
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { birdThing } from './step1-c.js';
import { RIGHT, UP, lerp, person } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
// come here: the hand held out in front at chest height, palm up, the fingers (the fist) curling back toward her
function beckon(p, k, v) {
  if (k <= 0) return;
  const c = 0.5 + 0.5 * Math.sin(v * 9);
  p.handTo('R', p.local(-0.2, 0.47 + 0.13 * c, 0.33 - 0.19 * c, W), k, { out: 0.6, down: 0.9 });
  p.turn('Head', 0.08 * k * c);
}
// a round lawn under the person at (x, z), and a path from point `a` away into the distance to `b` ([x, z], group space)
function ground(u, x, z, a, b) {
  const parts = [[G.cyl(0.42 * u, 0.42 * u, 0.02 * u, 0, -0.01 * u, 0, 0, 0, 0, 28), 0x5aa83a]];
  if (a) {
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) + 0.3 * u;
    parts.push([new THREE.BoxGeometry(0.32 * u, 0.012 * u, len).rotateY(Math.atan2(dx, dz)).translate((a[0] + b[0]) / 2 - x, 0.002 * u, (a[1] + b[1]) / 2 - z), 0xd8c08a]);
  }
  const g = solidProp(parts, 0.3); g.position.set(x, 0, z); return g;
}

// ---- 来 ----
export function comeHere(ctx, spec, stage) {
  if (spec.outcome === 'bird') return birdLand(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, pz = 0.05 * u, yaw = RIGHT - 0.45;
  const p = person(spec.who, u, 0.85), dog = createModel('shiba', { height: 0.38 * u }), hearts = many([[G.sphere(0.03 * u), 0xff6a8a]], 3, 1.0);
  dog.group.updateWorldMatrix(true, true);
  const nose = new THREE.Box3().setFromObject(dog.group).max.z - dog.group.position.z;
  // where the dog stops: in front of her, facing her; where it starts: far off down the path, back and to the right
  const f = [Math.sin(yaw), Math.cos(yaw)], D = [px + f[0] * (0.2 * u + nose), pz + f[1] * (0.2 * u + nose)], S = [D[0] + 1.1 * u, D[1] - 3.2 * u];
  const lawn = ground(u, px, pz, D, S); lawn.position.y = floor;
  group.add(lawn, p.group, dog.group, hearts);
  const loop = 7.4, run = Math.atan2(D[0] - S[0], D[1] - S[1]), face = Math.atan2(px - D[0], pz - D[1]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { run: [0.6, 2.2, 'linear'], jump: [2.8, 0.6], pat: [3.3, 0.5], up: [4.9, 0.5], go: [5.4, 1.8, 'linear'] });
      // she beckons until the dog reaches her, crouches to pat it, stands, and waves it off
      const crouch = T.pat * (1 - T.up);
      p.pose(crouch > 0.02 ? 'PickUp' : 'Idle', crouch > 0.02 ? 0.5 * crouch : t, !(crouch > 0.02));
      p.group.position.set(px, floor, pz); p.group.rotation.y = yaw;
      beckon(p, pre ? A.setup : 1 - T.pat, v);
      // the dog: far off, gallops up the path, jumps up at her, sits for the pat, then bounds away again
      const out = pre ? 0 : T.run * (1 - T.go), going = !pre && T.go > 0 && T.go < 1, coming = !pre && T.run > 0 && T.run < 1;
      dog.pose(coming || going ? 'Gallop' : (!pre && v > 2.8 && v < 3.4) ? 'Jump_ToIdle' : 'Idle', coming || going ? v : (v > 2.8 && v < 3.4) ? v - 2.8 : t);
      dog.group.position.set(lerp(S[0], D[0], out), floor + 0.12 * u * bump(v, 2.8, 0.5), lerp(S[1], D[1], out));
      dog.group.rotation.y = going || T.go >= 1 ? run + Math.PI : out < 1 ? run : face;
      dog.group.visible = !pre && T.go < 0.97;
      // her free hand pats its head
      if (crouch > 0.02) { group.updateWorldMatrix(true, false); group.localToWorld(W.set(D[0] + Math.sin(face) * 0.7 * nose, floor + (0.36 + 0.03 * Math.abs(Math.sin(v * 8))) * u, D[1] + Math.cos(face) * 0.7 * nose)); p.handTo('R', W, crouch); }
      for (let i = 0; i < 3; i++) { const h = pre ? 0 : between(v, 3.2 + i * 0.3, 4.4 + i * 0.3); hearts.set(i, D[0] + (i - 1) * 0.1 * u, floor + 0.5 * u + 0.35 * u * h, D[1], h > 0 && h < 1 ? 1.3 * Math.sin(Math.PI * h) : 0); }
      hearts.commit();
    },
  };
}

// ---- 来る ----
function birdLand(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.55 * u, pz = 0.05 * u, yaw = RIGHT - 0.35, bs = 0.62;
  const p = person(spec.who, u, 0.85), lawn = ground(u, px, pz), bird = new THREE.Group(), body = birdThing(0.3 * bs * u);
  // a wing on each side (z), hinged along the bird's back
  const wing = (s) => { const g = solidProp([[G.sphere(0.065 * bs * u, 0.0, 0, s * 0.06 * bs * u, 0.8, 0.22, 1.4), 0x3a72c8]], 0.5); g.position.set(0, 0.13 * bs * u, 0); return g; };
  const wings = [wing(1), wing(-1)];
  bird.add(body, ...wings); lawn.position.y = floor;
  group.add(lawn, p.group, bird);
  const loop = 6.6, far = new THREE.Vector3(px + 1.0 * u, floor + 1.9 * u, -2.6 * u), perch = new THREE.Object3D(), Pw = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { hold: [1.1, 0.5], fly: [0.5, 2.3], lift: [3.0, 0.4], off: [5.0, 1.2, 'in'], drop: [5.6, 0.6] });
      p.pose('Idle', t); p.group.position.set(px, floor, pz); p.group.rotation.y = yaw;
      // she beckons, then holds her hand out flat, palm up, for the bird to land on; she raises it a little to look
      const hold = T.hold * (1 - T.drop), k = pre ? A.setup : 1;
      beckon(p, k * (1 - T.hold), v);
      p.local(-0.2, 0.56 + 0.06 * T.lift * (1 - T.drop), 0.4, Pw);
      if (hold > 0) { p.grip('R', Pw, UP, 0, hold, { out: 0.7, down: 0.9 }); p.turn('Head', 0.2 * hold, -0.35 * hold * T.lift); }
      p.hold(perch, 'R', group, 0); const at = perch.position; at.y += 0.005 * u;
      // the bird: far off and high, it flies in on a gentle wave, lands on the palm, looks about, and flies away again
      const away = pre ? 1 : 1 - T.fly + T.off, flying = away > 0.005;
      const pos = W.lerpVectors(at, far, away); pos.y += 0.15 * u * Math.sin(away * 7) * away;
      bird.position.copy(pos); bird.visible = !pre && T.off < 0.98 && v > 0.5;
      const dir = W2.copy(far).sub(at), turnBack = T.off > 0;
      bird.rotation.set(0, turnBack ? Math.atan2(dir.z, -dir.x) + Math.PI : Math.atan2(dir.z, -dir.x), flying ? 0.15 : 0);
      if (!flying) bird.rotation.y = yaw - Math.PI / 2 + 0.6 * Math.sin(v * 2.2) * between(v, 3.2, 3.5);
      body.rotation.z = flying ? 0 : 0.15 * bump(v, 3.6, 0.3) + 0.15 * bump(v, 4.3, 0.3);
      const flap = flying ? 0.9 * Math.sin(t * 22) : 0.1 * bump(v, 2.8, 0.4);
      wings[0].rotation.x = -flap; wings[1].rotation.x = flap;
    },
  };
}



