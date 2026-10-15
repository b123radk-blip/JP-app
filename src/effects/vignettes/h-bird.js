// Haiku plan h10 (card 9ce5, 鳥 "bird"): a bird swoops down from the upper left onto a branch of a small tree, hops a
// little along it, turns its head and sings three notes, then flies up and to the right and fades out. Loop 7 s:
//   0-0.5 nothing; 0.5-2 it swoops in and lands on the branch at 2; 2-4.5 it sits (a hop at 2.4-2.7, the head turns,
//   the notes rise one after another 2.8-4); 4.5-6.2 it takes off and flies up and right, fading 5.8-6.2; 6.2-7 nothing.
//   q-bird-branch  鳥: a bird swoops onto a branch, sings, and flies away
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { flies } from '../pieces/kit-things.js';
import { between } from './helpers.js';

const RIGHT = Math.PI / 2, BIRD = 0.28, FLY = 0.09, LOOP = 7;   // FLY: the flying model's height (its body is about 0.18u long)
// a quadratic curve from a to b with control c, at f 0..1, into out
const bez = (a, c, b, f, out) => out.set(0, 0, 0).addScaledVector(a, (1 - f) * (1 - f)).addScaledVector(c, 2 * (1 - f) * f).addScaledVector(b, f * f);

// a small tree: trunk (ground to 0.6), a bare branch going left at 0.58 (x 0.72 to 1.0), leaves at the top
function tree(u, B, floor) {
  const x = B.maxX + 1.0 * u, z = -0.1 * u;
  const trunk = solidProp([[G.cyl(0.05 * u, 0.065 * u, 0.6 * u, 0, 0.3 * u, 0), 0x7a4a24]], 0.4); trunk.name = 'trunk'; trunk.position.set(x, floor, z);
  const branch = solidProp([[G.cyl(0.025 * u, 0.025 * u, 0.4 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0x7a4a24]], 0.4); branch.name = 'branch'; branch.position.set(B.maxX + 0.8 * u, floor + 0.58 * u, z);
  const leaves = solidProp([[G.sphere(0.12 * u, 0.1 * u, 0.74 * u, 0), 0x3aa040], [G.sphere(0.1 * u, 0.18 * u, 0.7 * u, 0.03 * u), 0x48b048],
    [G.sphere(0.1 * u, 0.08 * u, 0.88 * u, 0.02 * u), 0x48b048], [G.sphere(0.09 * u, 0.17 * u, 0.84 * u, -0.03 * u), 0x3aa040]], 0.4);
  leaves.name = 'leaves'; leaves.position.set(x, floor, z);
  return [trunk, branch, leaves];
}

function birdBranch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  const from = P(0.55, 1.1, 0.2), sit = P(0.68, 0.605, -0.1), hopTo = P(0.75, 0.605, -0.1), ctrl = P(0.72, 1.35, -0.1), out = P(1.35, 1.1, 0.1);
  const perch = createModel('pigeon', { height: BIRD * u }), fly = createModel('pigeonFlying', { height: FLY * u, ownMaterials: true });
  perch.group.name = 'pigeon'; fly.group.name = 'pigeonFlying'; flies(fly.group);   // the bird is in the air on purpose
  // three notes: each a holder (moves and pops) around a music note emblem; the emblem's meshes are named 'note' (in the air)
  const notes = [0, 1, 2].map(() => {
    const h = new THREE.Group(), e = emblemProp('note', 0.09 * u);
    e.traverse((o) => { if (o.isMesh) { o.name = 'note'; o.userData.flies = true; } }); h.add(flies(e)); flies(h); return h;
  });
  group.add(...tree(u, B, floor), perch.group, fly.group, ...notes);
  const p = new THREE.Vector3(), hp = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, LOOP), pre = A.u < 0, v = pre ? 0 : A.v;
      const T = timeline(v, { swoop: [0.5, 1.5], hop: [2.4, 0.3], takeoff: [4.5, 1.7] });
      const fade = between(v, 5.8, 6.2), flyIn = v >= 0.5 && v < 2.0, perched = v >= 2.0 && v < 4.5, takeOff = v >= 4.5 && v < 6.2;
      const bob = 0.01 * u * Math.sin(v * 15), roll = 0.08 * Math.sin(v * 7.5);
      // the flying bird: it swoops down to the branch, or takes off from it (its origin is its feet)
      let fp = null, pitch = 0;
      if (flyIn) { fp = p.lerpVectors(from, sit, T.swoop); pitch = 0.5 * (1 - T.swoop); }
      if (takeOff) { fp = bez(hopTo, ctrl, out, T.takeoff, p); pitch = -0.35 * Math.sin(Math.PI * T.takeoff); }
      fly.group.visible = !!fp;
      if (fp) { fly.group.position.set(fp.x, fp.y + bob, fp.z); fly.group.rotation.set(pitch, takeOff ? RIGHT : 0.3, roll, 'YXZ'); }
      for (const m of fly.materials) { m.transparent = true; m.opacity = 1 - fade; }
      // the perched bird: a hop along the branch, a head turn left and right, a lean up as it sings
      hp.lerpVectors(sit, hopTo, T.hop);
      const sing = between(v, 2.7, 2.9) * (1 - between(v, 3.9, 4.1));
      perch.group.visible = perched; perch.group.position.copy(hp);
      perch.group.rotation.set(0.12 * Math.sin(Math.PI * T.hop) - 0.15 * sing, RIGHT + 0.45 * Math.sin((v - 2) * 2.2) * between(v, 2.0, 2.3) * (1 - between(v, 4.2, 4.4)), 0, 'YXZ');
      // the notes rise from its beak one after another, 2.8 to 4.0
      notes.forEach((h, i) => {
        const f = between(v, 2.8 + 0.3 * i, 3.4 + 0.3 * i), on = perched && f > 0 && f < 1;
        h.visible = on;
        if (on) { h.position.set(hp.x + 0.08 * u + 0.06 * u * f, hp.y + 0.15 * u + 0.45 * u * f, hp.z); h.scale.setScalar(Math.sin(Math.PI * f)); }
      });
    },
  };
}

export const SCENES = { 'q-bird-branch': birdBranch };
