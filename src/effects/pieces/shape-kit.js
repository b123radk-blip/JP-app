// A tiny kit for building emblem and prop shapes from three.js primitives, and merging the static ones into one geometry
// (one draw call). Units: emblems are built about 1 unit tall around the origin and scaled by the emblem size.
import * as THREE from 'three';

const place = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { g.rotateX(rx); g.rotateY(ry); g.rotateZ(rz); g.translate(x, y, z); return g; };
export const G = {
  box: (w, h, d, x, y, z, rz = 0) => place(new THREE.BoxGeometry(w, h, d), x, y, z, 0, 0, rz),
  sphere: (r, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => place(new THREE.SphereGeometry(r, 18, 12).scale(sx, sy, sz), x, y, z),
  cyl: (r1, r2, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 18) => place(new THREE.CylinderGeometry(r1, r2, h, seg), x, y, z, rx, ry, rz),
  capsule: (r, len, x = 0, y = 0, z = 0, rz = 0) => place(new THREE.CapsuleGeometry(r, len, 4, 10), x, y, z, 0, 0, rz),
  torus: (R, r, arc = Math.PI * 2, x = 0, y = 0, z = 0, rz = 0) => place(new THREE.TorusGeometry(R, r, 10, 40, arc), x, y, z, 0, 0, rz),
  cone: (r, h, x = 0, y = 0, z = 0, rz = 0) => place(new THREE.ConeGeometry(r, h, 18), x, y, z, 0, 0, rz),
  // smooth tube through 2D points; poly = straight segments
  tube: (pts, r, closed = false) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), closed, 'catmullrom', 0.2), 48, r, 8, closed),
  poly: (pts, r) => { const path = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i - 1], 0), new THREE.Vector3(...pts[i], 0))); return new THREE.TubeGeometry(path, 20 * (pts.length - 1), r, 8, false); },
  // a flat 2D shape given depth, centred on z = 0
  extrude: (shape, depth = 0.12) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 16 }).translate(0, 0, -depth / 2),
};

// Merge geometries (position + normal) into one indexed geometry.
export function merge(geos) {
  const parts = geos.map((g) => (g.index ? g : (() => { const n = g.attributes.position.count; g.setIndex([...Array(n).keys()]); return g; })()));
  const nV = parts.reduce((s, g) => s + g.attributes.position.count, 0), nI = parts.reduce((s, g) => s + g.index.count, 0);
  const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), idx = new Uint32Array(nI);
  let v = 0, i = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, v * 3); nor.set(g.attributes.normal.array, v * 3);
    const src = g.index.array; for (let k = 0; k < src.length; k++) idx[i + k] = src[k] + v;
    v += g.attributes.position.count; i += src.length; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

export const solid = (color, emissive = 0.45, extra = {}) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, roughness: 0.4, metalness: 0.1, ...extra });
export const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
export const heartShape = () => { const s = new THREE.Shape(); s.moveTo(0, -0.42); s.bezierCurveTo(-0.55, -0.05, -0.5, 0.42, 0, 0.18); s.bezierCurveTo(0.5, 0.42, 0.55, -0.05, 0, -0.42); return s; };
