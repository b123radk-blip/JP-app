// The light rig every backdrop brings (the glow materials are lit; heat is self-lit and ignores it): a white key light from
// front-left-above, a coloured rim light from behind, and a soft hemisphere fill. Positions are in the effect group's space.
import * as THREE from 'three';

export function createLights(group, { rim = 0x58d8ff, fill = [0xeaf6ff, 0x405060], fillK = 1.0 } = {}) {
  const key = new THREE.PointLight(0xffffff, 0, 8, 2); key.position.set(-0.7, 0.6, 0.9);
  const rimL = new THREE.PointLight(rim, 0, 6, 1.5); rimL.position.set(0, 0.15, -0.5);
  const hemi = new THREE.HemisphereLight(fill[0], fill[1], fillK);
  group.add(key, rimL, hemi);
  return { key, rim: rimL, hemi, set(keyI, rimI, fillI = fillK) { key.intensity = keyI; rimL.intensity = rimI; hemi.intensity = fillI; } };
}
