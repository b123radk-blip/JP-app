// Ray picking against 3D UI meshes. Pure maths (no DOM), so it is unit-tested in node.
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
raycaster.far = 10;

// three.js raycasts invisible objects too, so skip anything hidden anywhere up its parent chain.
export function isShown(obj) { for (let o = obj; o; o = o.parent) if (!o.visible) return false; return true; }

// origin, direction: THREE.Vector3 in world space. Returns the nearest shown target hit, or null.
export function pick(targets, origin, direction) {
  raycaster.set(origin, direction.clone().normalize());
  return raycaster.intersectObjects(targets.filter(isShown), false)[0] || null;
}

// An XRPose-like { transform: { position, orientation } } -> a world-space ray.
export function rayFromPose(pose, origin = new THREE.Vector3(), direction = new THREE.Vector3()) {
  const p = pose.transform.position, o = pose.transform.orientation;
  origin.set(p.x, p.y, p.z);
  direction.set(0, 0, -1).applyQuaternion(new THREE.Quaternion(o.x, o.y, o.z, o.w));
  return { origin, direction };
}
