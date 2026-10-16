import * as THREE from '../../../node_modules/three/build/three.module.js';
const D = Math.PI / 180;
const P = new THREE.Group(); P.position.set(1.0, 0.1, -0.2); P.rotation.set(20 * D, 30 * D, 0);
const C = new THREE.Group(); C.position.set(0.2, 0, 0.1); C.rotation.set(0, 0, 90 * D); C.scale.setScalar(0.5);
const G = new THREE.Object3D(); G.position.set(0, 0.3, 0);
P.add(C); C.add(G);
P.updateMatrixWorld(true);
const cols = (m, tag) => { console.log(tag, 'cols:'); for (let j = 0; j < 3; j++) console.log(`  c${j + 1}:`, m.elements.slice(4 * j, 4 * j + 3).map(v => v.toFixed(4)).join(' ')); };
cols(P.matrix, 'P.matrix'); cols(C.matrix, 'C.matrix'); cols(C.matrixWorld, 'C.matrixWorld'); cols(G.matrixWorld, 'G.matrixWorld');
// verify product
const M = new THREE.Matrix4().multiplyMatrices(P.matrixWorld, C.matrixWorld);
M.multiply(G.matrix);
cols(M, 'P*M_C*M_G');
const yw = new THREE.Vector3(0, 1, 0).applyMatrix4(M).normalize();
console.log('image of +y through full product:', yw.toArray().map(v => v.toFixed(4)));
