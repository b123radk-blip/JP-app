// C.3 done properly: lowest y for (0.95, y, -0.25) that keeps the ray out of the cabinet.
const E = { x: -0.45, y: 0.35, z: 2.6 };
const box = { x0: 0.7, x1: 1.2, y0: 0, y1: 0.5, z0: 0.1, z1: 0.3 };
const inside = (P) => {
  const d = { x: P.x - E.x, y: P.y - E.y, z: P.z - E.z };
  let tLo = 0, tHi = 1;
  for (const ax of ['x', 'y', 'z']) {
    const lo = box[ax + '0'], hi = box[ax + '1'], p = E[ax], dv = d[ax];
    if (Math.abs(dv) < 1e-12) { if (p < lo || p > hi) return null; continue; }
    let a = (lo - p) / dv, b = (hi - p) / dv;
    if (a > b) [a, b] = [b, a];
    tLo = Math.max(tLo, a); tHi = Math.min(tHi, b);
    if (tLo > tHi) return null;
  }
  return [tLo, tHi];
};
const dx = 0.95 - E.x, dz = -0.25 - E.z;
// t at which the ray enters/exits each slab (properly ordered)
const range = (lo, hi, p, dv) => { let a = (lo - p) / dv, b = (hi - p) / dv; return a < b ? [a, b] : [b, a]; };
const rx = range(box.x0, box.x1, E.x, dx);
const rz = range(box.z0, box.z1, E.z, dz);
const tIn = Math.max(rx[0], rz[0]), tOut = Math.min(rx[1], rz[1]);
console.log('x-slab t', rx.map((v) => v.toFixed(6)), ' z-slab t', rz.map((v) => v.toFixed(6)));
console.log('ray in x&z slab for t in [', tIn.toFixed(6), ',', tOut.toFixed(6), ']; entry face:', rx[0] > rz[0] ? 'x=0.7 (near face)' : 'z=0.3');
// y(t) = E.y + (y - E.y)*t is increasing in t for y > E.y -> minimum at tIn
const yMin = E.y + (0.5 - E.y) / tIn;
console.log('lowest visible y =', yMin.toFixed(6), ' -> 3dp:', yMin.toFixed(3));
for (const y of [0.530, 0.532, 0.5326, yMin, yMin + 0.001, 0.534]) {
  const r = inside({ x: 0.95, y, z: -0.25 });
  console.log(`   y=${y.toFixed(4)}: ${r ? 'HIDDEN' : 'visible'}`);
}
// exact value for the record
console.log('exact:', (0.35 + 0.15 * 1.4 / 1.15).toFixed(10));
// D full precision
const C = { x: 0.95, y: 0.15, z: 0 };
const d = { x: E.x - C.x, y: E.y - C.y, z: E.z - C.z };
const L = Math.hypot(d.x, d.y, d.z), u = { x: d.x / L, y: d.y / L, z: d.z / L };
const N = (th) => 90 - Math.acos(Math.min(1, Math.cos(th) * u.y + Math.sin(th) * u.z)) * 180 / Math.PI;
console.log('D1 N(0) =', N(0).toFixed(6));
let lo = 0, hi = 90;
for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; N(m * Math.PI / 180) < 30 ? lo = m : hi = m; }
console.log('D2 theta =', ((lo + hi) / 2).toFixed(6), 'deg');
// A full precision
import('file:///G:/AI/JP-app/node_modules/three/build/three.module.js').then((THREE) => {
  const deg = THREE.MathUtils.degToRad;
  const P = new THREE.Group(); P.position.set(1.0, 0.1, -0.2); P.rotation.set(deg(20), deg(30), 0);
  const Cg = new THREE.Group(); Cg.position.set(0.2, 0, 0.1); Cg.rotation.set(0, 0, deg(90)); Cg.scale.setScalar(0.5); P.add(Cg);
  const G = new THREE.Group(); G.position.set(0, 0.3, 0); Cg.add(G);
  const root = new THREE.Group(); root.add(P); root.updateMatrixWorld(true);
  const wp = G.getWorldPosition(new THREE.Vector3());
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(G.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const lp = P.worldToLocal(new THREE.Vector3(1.2, 0.5, 0.0));
  const f = (v) => v.toFixed(6);
  console.log('A1 G world = (' + f(wp.x) + ', ' + f(wp.y) + ', ' + f(wp.z) + ')');
  console.log('A2 G +y    = (' + f(up.x) + ', ' + f(up.y) + ', ' + f(up.z) + ')');
  console.log('A3 P-local = (' + f(lp.x) + ', ' + f(lp.y) + ', ' + f(lp.z) + ')');
  console.log('A  note: C scale 0.5 also scales G position: offset in C = (0, 0.15, 0), Rz90 -> (-0.15, 0, 0), +C.pos -> (0.05, 0, 0.1) in P');
});
