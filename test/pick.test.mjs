import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { pick, rayFromPose, isShown } from '../src/core/pick.js';

function button(x, name) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial()); m.position.set(x, 1.4, -1.2); m.name = name; return m; }
const scene = new THREE.Scene(), a = button(-0.3, 'a'), b = button(0.3, 'b');
scene.add(a, b); scene.updateMatrixWorld(true);
const poseLookingAt = (target) => {
  const o = new THREE.Vector3(0, 1.4, 0), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), target.clone().sub(o).normalize());
  return { transform: { position: { x: o.x, y: o.y, z: o.z }, orientation: { x: q.x, y: q.y, z: q.z, w: q.w } } };
};

test('a pose pointing at a button hits that button, not its neighbour', () => {
  const { origin, direction } = rayFromPose(poseLookingAt(b.position));
  assert.equal(pick([a, b], origin, direction).object, b);
});
test('pointing between the buttons hits nothing', () => {
  const { origin, direction } = rayFromPose(poseLookingAt(new THREE.Vector3(0, 1.4, -1.2)));
  assert.equal(pick([a, b], origin, direction), null);
});
test('hidden buttons (or buttons inside a hidden group) cannot be hit', () => {
  const g = new THREE.Group(), c = button(0.3, 'c'); g.add(c); scene.add(g); scene.updateMatrixWorld(true);
  g.visible = false;
  assert.equal(isShown(c), false);
  const { origin, direction } = rayFromPose(poseLookingAt(c.position));
  assert.equal(pick([c], origin, direction), null);
});
