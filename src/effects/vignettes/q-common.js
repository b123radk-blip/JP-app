// Shared bits of the model scenes (Step 3a model pass, vignettes/q-*.js): labels, pop-ins, hearts, children (adults
// scaled down), walking, hand in hand, a child lifted by the sides, small props built from shapes.
import * as THREE from 'three';
import { actor } from './model-kit.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

export const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2, UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0);
export const lerp = (a, b, f) => a + (b - a) * f;
export const label = (u, text, bg, h = 0.14) => textPlane(text, { h: h * u, color: '#ffffff', bg, pad: 0.25 });
export const pop = (m, k, x, y, z) => { m.visible = k > 0.01; m.scale.setScalar(grow(k)); m.position.set(x, y, z); };
// hearts rising one after another from `at` (seconds); h: many(HEART) with n slots
export function hearts(h, n, x, y, z, v, at, u) {
  for (let i = 0; i < n; i++) { const f = between(v, at + i * 0.3, at + 1.1 + i * 0.3); h.set(i, x + 0.13 * u * (i - (n - 1) / 2), y + 0.35 * u * f, z, f > 0 && f < 1 ? 1.3 * Math.sin(Math.PI * f) : 0); }
  h.commit();
}
// people: a grown-up about 0.9 glyphs tall, a teen 0.75, a child 0.55 (the pack has no children: adults scaled down)
export const KID = 0.55, TEEN = 0.75, ADULT = 0.9;
export const person = (name, u, k = ADULT) => actor(name, k * u);

// a unit vector along the actor's own axis (x: its left, z: its front), world
const w1 = new THREE.Vector3(), w2 = new THREE.Vector3();
export const axisOf = (a, x, y, z, out = new THREE.Vector3()) => a.local(x, y, z, out).sub(a.local(0, 0, 0, w1)).normalize();

// face from yaw a to yaw b over f (0..1), taking the short way round
export const turnTo = (a, b, f) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * f; };

// two people hold hands: a's `sa` hand and b's `sb` hand meet half-way between their shoulders, a little low
export function handInHand(a, sa, b, sb, k = 1) {
  if (k <= 0) return;
  const pa = a.local(sa === 'R' ? -0.2 : 0.2, 0.32, 0.06, new THREE.Vector3()), pb = b.local(sb === 'R' ? -0.2 : 0.2, 0.32, 0.06, w2);
  const mid = pa.add(pb).multiplyScalar(0.5);
  a.handTo(sa, mid, k, { out: 0.3, down: 1 }); b.handTo(sb, mid, k, { out: 0.3, down: 1 });
}

// a child held by both sides of the chest: `by` grips `kid` (actor) whose chest (0.45 of its height up) sits at world
// point `at`; the kid faces the way `by` faces (or faces `by` when `facing`). k: how far the hands reach.
export function liftKid(by, kid, space, at, k = 1, facing = false) {
  const kh = kid.h * space.getWorldScale(w1).y, side = axisOf(by, 1, 0, 0, new THREE.Vector3());
  kid.group.position.copy(space.worldToLocal(at.clone().addScaledVector(UP, -0.45 * kh)));
  kid.group.rotation.y = by.group.rotation.y + (facing ? Math.PI : 0);
  kid.group.updateWorldMatrix(true, true);
  const r = 0.16 * kh;
  by.grip('R', at, side, r, k, { out: 0.9, down: 0.4 });
  by.grip('L', at, side.clone().negate(), r, k, { out: 0.9, down: 0.4 });
}

// small props
export const briefcase = (u) => solidProp([[G.box(0.2 * u, 0.15 * u, 0.06 * u, 0, -0.1 * u, 0), 0x5a3a24], [G.torus(0.035 * u, 0.008 * u, Math.PI, 0, -0.02 * u, 0), 0x2a1a10]], 0.4);
export const babyBundle = (u) => solidProp([
  [G.capsule(0.07 * u, 0.12 * u, -0.02 * u, 0, 0, Math.PI / 2), 0xfff0c8], [G.sphere(0.062 * u, 0.12 * u, 0.02 * u, 0), 0xf6caa0],
  [G.sphere(0.009 * u, 0.15 * u, 0.04 * u, 0.05 * u), 0x2a1c18], [G.sphere(0.009 * u, 0.115 * u, 0.04 * u, 0.055 * u), 0x2a1c18],
  [G.torus(0.068 * u, 0.012 * u, Math.PI * 2, 0.11 * u, 0.045 * u, -0.01 * u), 0xffb0c8],
], 0.5);
export const moustache = (u) => solidProp([[G.capsule(0.012 * u, 0.04 * u, -0.026 * u, 0, 0, 1.3), 0x3a2418], [G.capsule(0.012 * u, 0.04 * u, 0.026 * u, 0, 0, -1.3), 0x3a2418]], 0.3);
// stick a prop to an actor's head landmark each frame, turned with the actor
export function onHead(a, prop, space, name, dx = 0, dy = 0, dz = 0) {
  prop.position.copy(space.worldToLocal(a.at(name, w2, dx, dy, dz)));
  prop.rotation.y = a.group.rotation.y;
}
