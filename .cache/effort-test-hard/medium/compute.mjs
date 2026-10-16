import * as THREE from '../../../node_modules/three/build/three.module.js';

const D = Math.PI / 180;
const f = (v) => v.toFixed(3);

// ---------- A. Nested groups ----------
const P = new THREE.Group();
P.position.set(1.0, 0.1, -0.2);
P.rotation.set(20 * D, 30 * D, 0); // default order XYZ
const C = new THREE.Group();
C.position.set(0.2, 0, 0.1);
C.rotation.set(0, 0, 90 * D);
C.scale.setScalar(0.5);
const G = new THREE.Object3D();
G.position.set(0, 0.3, 0);
P.add(C); C.add(G);
G.updateWorldMatrix(true, false);
const gw = new THREE.Vector3(); G.getWorldPosition(gw);
const yDir = new THREE.Vector3(0, 1, 0).applyQuaternion(new THREE.Quaternion().setFromRotationMatrix(G.matrixWorld));
const localP = P.worldToLocal(new THREE.Vector3(1.2, 0.5, 0.0));
console.log('A1 G world pos:', [gw.x, gw.y, gw.z].map(f));
console.log('A2 G local +y world dir:', [yDir.x, yDir.y, yDir.z].map(f));
console.log('A3 world (1.2,0.5,0) in P local:', [localP.x, localP.y, localP.z].map(f));
// verify rotation matrix interpretation by hand: R = Rz Ry Rx applied in order? check a basis vector through matrix
const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(20 * D, 30 * D, 0, 'XYZ'));
console.log('A check P matrix row0:', m.elements.slice(0, 3).map(f));

// ---------- B. reach window ----------
const cup = (t) => { const u = Math.min(1, Math.max(0, (t - 1) / 2)); const s = u * u * (3 - 2 * u); return 0.6 + 0.5 * s; };
const d2 = (t) => { const dx = cup(t) - 1.0; return dx * dx + 0.01 + 0.0225; };
// bisection for entry
let lo = 0, hi = 4;
for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; (d2(mid) < 0.09) ? hi = mid : lo = mid; }
console.log('B entry t =', lo.toFixed(4), '-> 2dp', lo.toFixed(2), 'cup x =', cup(lo).toFixed(4));
console.log('B at t=4: d =', Math.sqrt(d2(4)).toFixed(4), '(<= 0.3:', d2(4) <= 0.09, ')');
console.log('B at t=0: d =', Math.sqrt(d2(0)).toFixed(4));

// ---------- C. sight lines ----------
const E = [-0.45, 0.35, 2.6];
const box = { x: [0.7, 1.2], y: [0, 0.5], z: [0.1, 0.3] };
function hits(P_) { // segment E->P vs box: slab test
  const d = P_.map((v, i) => v - E[i]);
  let sIn = 0, sOut = 1;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-12) { if (P_[i] < box[['x','y','z'][i]][0] || P_[i] > box[['x','y','z'][i]][1]) return false; }
    else {
      const inv = 1 / d[i];
      let t1 = (box[['x','y','z'][i]][0] - E[i]) * inv, t2 = (box[['x','y','z'][i]][1] - E[i]) * inv;
      if (t1 > t2) [t1, t2] = [t2, t1];
      sIn = Math.max(sIn, t1); sOut = Math.min(sOut, t2);
      if (sIn > sOut) return false;
    }
  }
  return sIn <= 1 && sOut >= 0;
}
console.log('C1 head hidden:', hits([0.95, 0.62, -0.25]));
console.log('C2 knee hidden:', hits([0.95, 0.20, -0.15]));
// lowest head y: segment must stay above y=0.5 across the x-window entry
const sxIn = (0.7 - E[0]) / (0.95 - E[0]);
const yMin = E[1] + (0.5 - E[1]) / sxIn;
console.log('C3 sx entry =', sxIn.toFixed(6), 'lowest head y =', yMin.toFixed(6), '-> 3dp', yMin.toFixed(3));
// verify: at yMin the line just grazes the top-front-top edge?
console.log('C3 check hidden at yMin:', hits([0.95, yMin, -0.25]), 'at yMin-0.001:', hits([0.95, yMin - 0.001, -0.25]));

// ---------- D. board tilt ----------
const Cc = [0.95, 0.15, 0.0];
const dv = E.map((v, i) => v - Cc[i]);
const dl = Math.hypot(...dv);
const N = (th) => { const n = [0, Math.cos(th * D), Math.sin(th * D)]; const c = n[1] * dv[1] + n[2] * dv[2]; return 90 - Math.acos(c / dl) / D; };
console.log('D1 N(0) =', N(0).toFixed(3));
let a = 0, b = 90;
for (let i = 0; i < 100; i++) { const m = (a + b) / 2; (N(m) >= 30) ? b = m : a = m; }
console.log('D2 smallest theta for N>=30:', b.toFixed(4), '-> 2dp', b.toFixed(2), 'N =', N(b).toFixed(4));
console.log('D check: at', (b - 0.005).toFixed(4), 'N =', N(b - 0.005).toFixed(4));
