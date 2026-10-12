// Shared bits of the 歯 / 絵 / なる / できる scenes (q-words4.js, q-words4b.js): a floating hand that holds a tool along a
// chosen axis, a four-point sparkle, a flat polygon from a height curve.
import * as THREE from 'three';

const X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), M = new THREE.Matrix4();
// turn a kit hand so a handle held in its fist runs along `axis` (a Vector3, any sign) and the forearm points along `fore`
// (away from the fist); the fingers curl towards the viewer when they can
export function handAim(hand, axis, fore) {
  X.copy(axis).normalize(); Y.copy(fore).addScaledVector(X, -fore.dot(X)).normalize();
  Z.crossVectors(X, Y); if (Z.z < 0) { X.negate(); Z.negate(); }
  hand.group.quaternion.setFromRotationMatrix(M.makeBasis(X, Y, Z));
}
// a four-point sparkle star (flat, extruded a little), about 1 across
export function sparkleShape() {
  const s = new THREE.Shape();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, d = i % 2 ? 0.14 : 0.5; i ? s.lineTo(Math.cos(a) * d, Math.sin(a) * d) : s.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
  return s;
}
// a flat shape on the xy plane from a list of [x, y] points (closed)
export const flatShape = (pts, z = 0) => new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))).translate(0, 0, z);
// a flat disc (ellipse) on the xy plane
export const flatDisc = (rx, ry, x, y, z = 0, seg = 28) => new THREE.CircleGeometry(1, seg).scale(rx, ry, 1).translate(x, y, z);
