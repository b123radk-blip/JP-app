// Mount a prop on one of an actor's bones (Head, Torso, ...): the prop is built in the BONE'S OWN units and follows the
// bone's position, turn and scale every frame (so a nod, a lift or a sway carries it along exactly). `off` is a point in the
// same units. The Quaternius people share one rig; the bones' frames are +y up, +z the person's front, +x its left.
import * as THREE from 'three';

const P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), GS = new THREE.Vector3(), O = new THREE.Vector3();
// opts.fit false: a prop built in world units (a ball): only its position follows, its size and turn stay
export function onBone(a, boneName, prop, space, off = [0, 0, 0], { fit = true } = {}) {
  const bone = a.node(boneName); if (!bone) return false;
  bone.getWorldPosition(P); bone.getWorldQuaternion(Q); bone.getWorldScale(S); space.getWorldScale(GS);
  if (fit) prop.quaternion.copy(Q);
  prop.position.copy(space.worldToLocal(P.add(O.set(off[0], off[1], off[2]).multiplyScalar(S.y).applyQuaternion(Q))));
  if (fit) prop.scale.setScalar(S.y / GS.y);
  return true;
}
