// 土 / 土曜日: a real spade (dished steel blade with thickness and a rounded tip, a socket, a wooden shaft, a D grip) digs
// into a mound; the scooped soil heap rides ON the blade while it lifts and a pink worm wriggles out of that heap.
// The kit shapes live here too: spadeBlade (curved plate), wormMesh (a live tube), soilHeap.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp, kitMaterial } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { withWeek } from './step1-kit.js';

// A dished plate, tip at the origin, top at y = L, face towards +z; `T` thick, rim closed. Rounded tip, wide shoulders.
export function spadeBlade(W, L, T, dish) {
  const nx = 12, ny = 12, P = [], I = [];
  const at = (s, t, side) => { const w = (W / 2) * Math.pow(1 - Math.pow(1 - t, 2.2), 0.6); return [s * w, t * L, dish * s * s * (0.35 + 0.65 * t) + side * T / 2]; };
  const grid = (side) => { const o = P.length; for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) P.push(at(-1 + (2 * i) / nx, j / ny, side)); return (i, j) => o + i * (ny + 1) + j; };
  const quad = (a, b, c, d, flip) => (flip ? I.push(a, d, b, a, c, d) : I.push(a, b, d, a, d, c));
  for (const side of [1, -1]) { const f = grid(side); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) quad(f(i, j), f(i + 1, j), f(i, j + 1), f(i + 1, j + 1), side < 0); }
  for (const s of [-1, 1]) for (let j = 0; j < ny; j++) {                      // the two edges
    const o = P.length; P.push(at(s, j / ny, 1), at(s, (j + 1) / ny, 1), at(s, j / ny, -1), at(s, (j + 1) / ny, -1));
    quad(o, o + 1, o + 2, o + 3, s > 0);
  }
  for (let i = 0; i < nx; i++) {                                              // the tip edge and the top edge
    for (const t of [0, 1]) { const o = P.length; P.push(at(-1 + (2 * i) / nx, t, 1), at(-1 + (2 * (i + 1)) / nx, t, 1), at(-1 + (2 * i) / nx, t, -1), at(-1 + (2 * (i + 1)) / nx, t, -1)); quad(o, o + 1, o + 2, o + 3, t === 1); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P.flat(), 3)); g.setIndex(I); g.computeVertexNormals();
  return g;
}

// the whole spade, tip at the origin, standing up (+y), blade face to +z. 1 draw call.
export function spadeProp(u) {
  const L = 0.26 * u, steel = 0xb4bfcc, dark = 0x8a96a6, wood = 0xb5803f, top = L + 0.46 * u;
  const bar = (x0, y0, x1, y1, r) => { const len = Math.hypot(x1 - x0, y1 - y0); return G.cyl(r, r, len, (x0 + x1) / 2, (y0 + y1) / 2, -0.004 * u, 0, 0, -Math.atan2(x1 - x0, y1 - y0)); };
  return solidProp([
    [spadeBlade(0.2 * u, L, 0.008 * u, 0.03 * u), steel],
    [G.cyl(0.024 * u, 0.034 * u, 0.07 * u, 0, L + 0.03 * u, -0.004 * u), dark],               // the socket the shaft sits in
    [G.cyl(0.027 * u, 0.027 * u, 0.012 * u, 0, L + 0.066 * u, -0.004 * u), dark],
    [G.cyl(0.016 * u, 0.016 * u, top - L - 0.06 * u, 0, (top + L + 0.06 * u) / 2 - 0.03 * u, -0.004 * u), wood],
    [bar(-0.07 * u, top - 0.1 * u, 0.07 * u, top - 0.1 * u, 0.013 * u), wood], [bar(-0.07 * u, top - 0.1 * u, -0.07 * u, top + 0.01 * u, 0.013 * u), wood],
    [bar(0.07 * u, top - 0.1 * u, 0.07 * u, top + 0.01 * u, 0.013 * u), wood], [bar(-0.07 * u, top + 0.01 * u, 0.07 * u, top + 0.01 * u, 0.013 * u), wood],
    [G.sphere(0.014 * u, -0.07 * u, top + 0.01 * u, -0.004 * u), wood], [G.sphere(0.014 * u, 0.07 * u, top + 0.01 * u, -0.004 * u), wood],
    [G.sphere(0.014 * u, -0.07 * u, top - 0.1 * u, -0.004 * u), wood], [G.sphere(0.014 * u, 0.07 * u, top - 0.1 * u, -0.004 * u), wood],
  ], 0.4);
}

// a lump of soil that sits on the blade face (blade space: face +z, centre about y = 0.12 u)
export function soilHeap(u) {
  const c = [0x6a4428, 0x77502e, 0x5e3c22];
  return solidProp([
    [G.sphere(0.09 * u, 0, 0.13 * u, 0.03 * u, 1.05, 1.15, 0.5), c[0]], [G.sphere(0.055 * u, -0.035 * u, 0.15 * u, 0.045 * u, 1, 1, 0.55), c[1]],
    [G.sphere(0.05 * u, 0.04 * u, 0.11 * u, 0.05 * u, 1, 1, 0.55), c[2]], [G.sphere(0.04 * u, 0.0, 0.2 * u, 0.045 * u, 1, 1, 0.5), c[1]],
    [G.sphere(0.025 * u, 0.07 * u, 0.2 * u, 0.04 * u), c[0]], [G.sphere(0.022 * u, -0.07 * u, 0.09 * u, 0.04 * u), c[2]],
  ], 0.3);
}

// a pink worm as ONE live tube: wormMesh(u).pose(base, ext 0..1, v) wriggles it out of `base` (blade space) along +z
export function wormMesh(u, N = 18, M = 8) {
  const pos = new Float32Array(N * M * 3), col = new Float32Array(N * M * 3), idx = [], pink = new THREE.Color(0xf09aa8), band = new THREE.Color(0xf8c0c4), back = new THREE.Color(0xd8788c);
  for (let j = 0; j < N; j++) for (let k = 0; k < M; k++) { const c = (j / (N - 1)) > 0.34 && (j / (N - 1)) < 0.46 ? band : k > M * 0.6 ? back : pink; col.set([c.r, c.g, c.b], (j * M + k) * 3); }
  for (let j = 0; j < N - 1; j++) for (let k = 0; k < M; k++) { const a = j * M + k, b = j * M + (k + 1) % M, c = a + M, d = b + M; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, kitMaterial(0.35)); m.frustumCulled = false;
  const P = [...Array(N)].map(() => new THREE.Vector3()), T = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3(), R = 0.019 * u, len = 0.24 * u;
  m.pose = (base, ext, v) => {
    m.visible = ext > 0.02;
    for (let j = 0; j < N; j++) {
      const s = (j / (N - 1)) * ext;
      P[j].set(base[0] + 0.03 * u * Math.sin(s * 9 - v * 8) * s, base[1] + 0.07 * u * s * s * Math.cos(v * 3) + 0.02 * u * Math.cos(s * 7 - v * 7) * s, base[2] + len * s);
    }
    for (let j = 0; j < N; j++) {
      T.copy(P[Math.min(N - 1, j + 1)]).sub(P[Math.max(0, j - 1)]).normalize();
      A.set(0, 1, 0).cross(T); if (A.lengthSq() < 1e-4) A.set(1, 0, 0); A.normalize(); B.copy(T).cross(A);
      const f = j / (N - 1), r = R * (j === 0 ? 0.2 : j === N - 1 ? 0.12 : f > 0.85 ? Math.sqrt(1 - ((f - 0.85) / 0.15) ** 2 * 0.9) : 1) * (1 + 0.12 * Math.sin(f * 40));
      for (let k = 0; k < M; k++) { const a = (k / M) * Math.PI * 2, o = (j * M + k) * 3; pos[o] = P[j].x + r * (Math.cos(a) * A.x + Math.sin(a) * B.x); pos[o + 1] = P[j].y + r * (Math.cos(a) * A.y + Math.sin(a) * B.y); pos[o + 2] = P[j].z + r * (Math.cos(a) * A.z + Math.sin(a) * B.z); }
    }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  };
  return m;
}

export function spadeDig(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(spadeDig, 5, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.55 * u, K = 1.5;
  const mound = solidProp([[G.sphere(0.42 * u, 0, 0, 0, 1.15, 0.36, 0.7), 0x7a5230], [G.sphere(0.16 * u, -0.22 * u, 0.06 * u, 0.12 * u, 1, 0.5, 0.6), 0x8a6038], [G.sphere(0.12 * u, 0.26 * u, 0.04 * u, 0.1 * u, 1, 0.5, 0.6), 0x6a4428]], 0.3);
  const spadeP = new THREE.Group(), spade = spadeProp(u * K), heap = soilHeap(u * K), worm = wormMesh(u * K);
  spadeP.add(spade, heap, worm); spadeP.rotation.order = 'YXZ';
  const crumbs = many([[G.sphere(0.03 * u, 0, 0, 0, 1.2, 0.9, 1), 0x6a4428]], 6, 0.3);
  mound.position.set(mx, floor, -0.02 * u);
  group.add(mound, spadeP, crumbs);
  const loop = 5.6, yaw = -0.55;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { stab: [0.2, 0.45, 'in'], scoop: [0.9, 0.6], lift: [1.5, 0.7], tip: [4.3, 0.55], back: [4.9, 0.6] });
      const k = pre ? 0 : between(v, 0.95, 1.5) * (1 - between(v, 4.55, 5.0)), ext = pre ? 0 : between(v, 2.2, 2.8) * (1 - between(v, 4.1, 4.4));
      const tipY = floor + 0.42 * u - 0.39 * u * T.stab + 0.2 * u * T.lift - 0.15 * u * T.tip + 0.34 * u * T.back;
      spadeP.visible = !pre;
      spadeP.position.set(mx - 0.04 * u + 0.1 * u * (T.lift - T.back), tipY, 0.04 * u); spadeP.rotation.set(0.12 - 0.35 * T.scoop - 0.4 * T.lift - 0.45 * T.tip + 1.2 * T.back, yaw, 0);
      heap.visible = k > 0.02; heap.scale.setScalar(Math.max(1e-3, k)); heap.position.set(0, 0.13 * u * K * (1 - Math.max(1e-3, k)), 0);
      worm.pose([0.004 * u * K, 0.13 * u * K, 0.045 * u * K], ext, v);
      mound.scale.set(1, 1 - 0.3 * k, 1);
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : between(v, 0.55 + 0.03 * i, 1.35), a = 0.5 + i * 0.5; crumbs.set(i, mx - 0.04 * u + Math.cos(a) * 0.3 * u * f, floor + 0.1 * u + Math.sin(a) * 0.3 * u * f - 0.4 * u * f * f, 0.06 * u, f > 0 && f < 1 ? 1 : 0, i); }
      crumbs.commit();
    },
  };
}
