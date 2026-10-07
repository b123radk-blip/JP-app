// Props kit: things (1 draw call each unless noted), built to a size `u` (usually the glyph height). Each builder returns a
// three.js object whose origin is the natural place to hold or stand it (noted per prop). Colours can be overridden.
import * as THREE from 'three';
import { G, heartShape } from './shape-kit.js';
import { solidProp, mergeColored, kitMaterial } from './kit-rig.js';

const WOOD = 0xa8703c, DARK = 0x4a3020;

// hammer: origin at the grip (near the end of the handle), handle along +y, the head across x at the top (striking face at -x)
export function hammer(u, { handle = WOOD, head = 0x8a94a4 } = {}) {
  const k = (x) => x * u;
  return solidProp([
    [G.cyl(k(0.03), k(0.036), k(0.62), 0, k(0.2)), handle],
    [G.cyl(k(0.04), k(0.04), k(0.06), 0, -k(0.1)), DARK],
    [G.box(k(0.25), k(0.1), k(0.1), -k(0.03), k(0.52)), head],
    [G.cyl(k(0.058), k(0.058), k(0.035), -k(0.165), k(0.52), 0, 0, 0, Math.PI / 2), head],       // the striking face
    [G.box(k(0.1), k(0.06), k(0.06), k(0.135), k(0.535), 0, -0.35), head],                      // the claw
  ]);
}

// nail: origin at the tip, pointing up (+y), `len` long. Two meshes (2 draw calls): the lower shank and the top half with
// the head, on a pivot (nail.top) at the middle so it can bend over.
export function nail(u, { len = 0.36, color = 0xd0d8e4 } = {}) {
  const k = (x) => x * u, h = k(len) / 2, group = new THREE.Group(), top = new THREE.Group();
  const lower = solidProp([[G.cone(k(0.026), k(0.06), 0, k(0.03), 0, Math.PI), color], [G.cyl(k(0.026), k(0.026), h - k(0.05), 0, k(0.06) + (h - k(0.05)) / 2), color]], 0.45);
  const upper = solidProp([[G.cyl(k(0.026), k(0.026), h + k(0.01), 0, h / 2), color], [G.cyl(k(0.075), k(0.075), k(0.03), 0, h + k(0.01)), color]], 0.45);
  top.position.y = h; top.add(upper); group.add(lower, top);
  return Object.assign(group, { top, len: k(len), drawCalls: 2 });
}

// board: a plank seen from the front, origin at the middle of its top face, `w` wide
export function board(u, { w = 0.9, h = 0.3, color = 0xc08850 } = {}) {
  const k = (x) => x * u, list = [[G.box(k(w), k(h), k(0.22), 0, -k(h / 2), 0), color], [G.box(k(w), k(0.02), k(0.222), 0, -k(0.012), 0), 0xd8a068]];
  for (let i = 0; i < 3; i++) list.push([G.box(k(w * (0.5 + 0.15 * i)), k(0.008), k(0.004), k(0.06 * (i - 1)), -k(0.06 + 0.07 * i), k(0.111)), 0x8a5a30]);   // grain
  list.push([G.cyl(k(0.014), k(0.014), k(0.004), k(w * 0.3), -k(h * 0.6), k(0.111), Math.PI / 2), 0x8a5a30]);   // a knot
  return solidProp(list);
}

// plate: origin at the middle of its underside, `r` across the rim
export function plate(u, { r = 0.22, color = 0xf6f4ee, rim = 0x3a6ad0 } = {}) {
  const k = (x) => x * u, pts = [[0, 0], [k(r * 0.55), 0], [k(r * 0.62), k(0.012)], [k(r * 0.95), k(0.035)], [k(r), k(0.045)]].map(([x, y]) => new THREE.Vector2(x, y));
  return solidProp([[new THREE.LatheGeometry(pts, 40), color], [G.torus(k(r * 0.8), k(0.009)).rotateX(Math.PI / 2).translate(0, k(0.03), 0), rim]]);
}

// ball: origin at the centre
export const ball = (u, { r = 0.08, color = 0xe04848, stripe = null } = {}) => solidProp([[G.sphere(r * u), color], ...(stripe ? [[G.torus(r * u * 1.0, r * u * 0.12), stripe]] : [])]);

// heart: origin at the centre, about `s` tall
export const heart = (u, { s = 0.16, color = 0xff4a6a } = {}) => solidProp([[G.extrude(heartShape(), 0.25).scale(s * u * 1.2, s * u * 1.2, s * u * 1.2), color]], 0.6);

// a ring of n small stars (dizzy, hurt), lying flat so turning it round y makes them circle: origin at the ring's centre
export function stars(u, { r = 0.13, s = 0.1, n = 3, color = 0xffe040 } = {}) {
  return solidProp(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [G.extrude(starShape(5), 0.12).scale(s * u, s * u, s * u).rotateY(-a).translate(Math.sin(a) * r * u, 0, Math.cos(a) * r * u), color]; }), 0.9);
}
function starShape(n, R = 0.5, r = 0.22) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= 2 * n; i++) { const a = (i / (2 * n)) * Math.PI * 2 + Math.PI / 2, d = i % 2 ? r : R; i ? shape.lineTo(Math.cos(a) * d, Math.sin(a) * d) : shape.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
  return shape;
}

// star burst (an impact, a sparkle): origin at the centre, `s` across, `n` points
export const burst = (u, { s = 0.2, n = 6, color = 0xffe060 } = {}) => solidProp([[G.extrude(starShape(n, 0.5, 0.22), 0.08).scale(s * u, s * u, s * u), color]], 0.9);

// many copies of one small shape in ONE draw call (dust puffs, sweat drops, hearts, a stack of plates): list is
// [[geometry, colour], ...] built around the origin. many.set(i, x, y, z, scale, rz?, ry?, rx?) places copy i (scale 0 hides it).
export function many(list, n, glow = 0.5) {
  const mesh = new THREE.InstancedMesh(mergeColored(list), kitMaterial(glow), n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  mesh.frustumCulled = false;
  const set = (i, x, y, z, k, rz = 0, ry = 0, rx = 0) => mesh.setMatrixAt(i, m.compose(p.set(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), s.setScalar(Math.max(1e-4, k))));
  for (let i = 0; i < n; i++) set(i, 0, 0, 0, 0);
  return Object.assign(mesh, { set, commit() { mesh.instanceMatrix.needsUpdate = true; } });
}
// shapes for many(): a puff of dust, a sweat drop, a heart
export const PUFF = (u, color = 0xd8c8b0) => [[G.sphere(0.05 * u, 0, 0, 0, 1, 0.8, 0.8), color]];
export const DROP = (u, color = 0x7fd0ff) => [[G.sphere(0.022 * u, 0, 0, 0, 1, 1, 1), color], [G.cone(0.0215 * u, 0.04 * u, 0, 0.022 * u), color]];
export const HEART = (u, s = 0.12, color = 0xff4a6a) => [[G.extrude(heartShape(), 0.25).scale(s * u * 1.2, s * u * 1.2, s * u * 1.2), color]];
