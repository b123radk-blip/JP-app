// Independent hand-matrix check for Task A
import * as THREE from '../../../node_modules/three/build/three.module.js';
const D = Math.PI / 180;
const P = new THREE.Group(); P.position.set(1.0, 0.1, -0.2); P.rotation.set(20 * D, 30 * D, 0);
const C = new THREE.Group(); C.position.set(0.2, 0, 0.1); C.rotation.set(0, 0, 90 * D); C.scale.setScalar(0.5);
const G = new THREE.Object3D(); G.position.set(0, 0.3, 0);
P.add(C); C.add(G);
P.updateMatrixWorld(true);
const gw = new THREE.Vector3(); G.getWorldPosition(gw);
const yw = new THREE.Vector3(0, 1, 0).applyQuaternion(G.quaternion);
const localP = P.worldToLocal(new THREE.Vector3(1.2, 0.5, 0.0));
const f3 = v => v.map(x => x.toFixed(4)).join(', ');
console.log('A1 world pos :', f3(gw.toArray()));
console.log('A2 world +y  :', f3(yw.toArray()));
console.log('A3 in P local:', f3(localP.toArray()));

// Manual: three 0.186 XYZ euler -> rows [te0,te4,te8] etc.
const x = 20 * D, y = 30 * D, z = 0;
const a = Math.cos(x), b = Math.sin(x), c = Math.cos(y), d = Math.sin(y), e = Math.cos(z), f = Math.sin(z);
const R_P = [[c * e, -c * f, d], [a * f + b * e * d, a * e - b * f * d, -b * c], [b * f - a * e * d, b * e + a * f * d, a * c]];
const R_C = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
const mul = (M, v) => M.map(r => r.reduce((s, mi, i) => s + mi * v[i], 0));
console.log('manual A2    :', f3(mul(R_P, mul(R_C, [0, 1, 0]))));
console.log('manual A1    :', f3([0.05, 0, 0.1].map((_, i) => R_P[i][0] * 0.05 + R_P[i][2] * 0.1 + [1.0, 0.1, -0.2][i])));
// A3 manual: P worldToLocal -> v_local = R_P^T (v - p_P)
const v = [1.2 - 1.0, 0.5 - 0.1, 0.0 - (-0.2)];
const trans = v.map((_, i) => v.reduce((s, vi, j) => s + R_P[j][i] * vi, 0));
console.log('manual A3    :', f3(trans));
console.log('R_P det-ish check rows orthonormal:',
  R_P.map(r => r.map(q => q.toFixed(3)).join(' ')).join('\n'));
