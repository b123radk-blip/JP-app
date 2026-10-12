// The coat once it is on. It is made FROM the person's own mesh, so it can never be misaligned: the jacket, shirt, tie and belt
// triangles are copied into a second skinned mesh that shares the person's skeleton (it bends, turns and swings its arms exactly
// with her), pushed out along their normals a little and given the coat's colour; the sleeves therefore cover the arms down to the
// wrist. The coat's tails are the upper-leg trousers triangles, pushed out further. Gold buttons sit on the front centre line,
// mounted on the Torso bone at the front surface measured from the mesh itself.
import * as THREE from 'three';
import { G } from '../pieces/shape-kit.js';
import { mergeGeometries } from '../../../vendor/three/addons/utils/BufferGeometryUtils.js';
import { many } from '../pieces/kit-things.js';

const BODY = ['Black', 'Shirt', 'Details', 'Belt'], PUSH = 0.03, TAIL_PUSH = 0.055, TAIL_TOP = -0.02, CUT = -0.42;
const BTN_Y = [0.4, 0.27, 0.14], BTN_R = 0.03, V = new THREE.Vector3(), M = new THREE.Matrix4();

// the person's skinned meshes with their materials: [{ mesh, mats }]
const skinned = (a) => { const out = []; a.group.traverse((o) => { if (o.isSkinnedMesh) out.push(o); }); return out; };

function coatMesh(origs, C) {
  const first = origs[0], sk = first.skeleton, hips = sk.bones.findIndex((b) => b.name === 'Hips'), hinv = sk.boneInverses[hips], bind = first.bindMatrix;
  const geos = origs.map((orig) => {
    const mat = orig.material, g = orig.geometry.clone(), pos = g.attributes.position, nor = g.attributes.normal, idx = g.index.array;
    // smoothed normals: one per distinct position, so that the pushed-out surface stays closed at the hard edges
    const key = (i) => `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`, sum = new Map();
    for (let i = 0; i < pos.count; i++) { const k = key(i), e = sum.get(k) ?? [0, 0, 0]; e[0] += nor.getX(i); e[1] += nor.getY(i); e[2] += nor.getZ(i); sum.set(k, e); }
    const yOf = (i) => V.fromBufferAttribute(pos, i).applyMatrix4(bind).applyMatrix4(hinv).y, ys = Array.from({ length: pos.count }, (_, i) => yOf(i));
    const keep = [];
    for (let i = 0; i < idx.length; i += 3) if (mat.name !== 'Black' || (ys[idx[i]] > CUT && ys[idx[i + 1]] > CUT && ys[idx[i + 2]] > CUT)) keep.push(idx[i], idx[i + 1], idx[i + 2]);
    for (let i = 0; i < pos.count; i++) {
      const e = sum.get(key(i)), l = Math.hypot(e[0], e[1], e[2]) || 1, t = mat.name === 'Black' ? Math.min(1, Math.max(0, (TAIL_TOP - ys[i]) / 0.15)) : 0, d = PUSH + (TAIL_PUSH - PUSH) * t * t * (3 - 2 * t);
      pos.setXYZ(i, pos.getX(i) + e[0] / l * d, pos.getY(i) + e[1] / l * d, pos.getZ(i) + e[2] / l * d);
    }
    g.setIndex(keep); return g;
  });
  const src = origs.find((m) => m.material.name === 'Black') ?? first, mat = src.material.clone(); mat.map = null; mat.name = 'Coat'; mat.color.set(C); mat.emissive.copy(mat.color);
  const mesh = new THREE.SkinnedMesh(mergeGeometries(geos), mat); mesh.name = 'coat'; mesh.frustumCulled = false;
  mesh.bind(sk, bind); mesh.position.copy(first.position); mesh.quaternion.copy(first.quaternion); mesh.scale.copy(first.scale);
  first.parent.add(mesh); mesh.updateMatrix();
  return mesh;
}

// front surface of the body at a Torso-bone height y (bone units), measured from the mesh's own bind pose
function frontZ(origs, y) {
  let best = 0; for (const orig of origs) best = Math.max(best, frontZ1(orig, y)); return best;
}
function frontZ1(orig, y) {
  const g = orig.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, bones = orig.skeleton.bones;
  const ti = bones.findIndex((b) => b.name === 'Torso'), ai = bones.findIndex((b) => b.name === 'Abdomen'); let best = 0;
  for (let vi = 0; vi < pos.count; vi++) {
    let bi = 0, bw = 0; for (let c = 0; c < 4; c++) { const w = sw.getComponent(vi, c); if (w > bw) { bw = w; bi = si.getComponent(vi, c); } }
    if (bi !== ti && bi !== ai) continue;
    V.fromBufferAttribute(pos, vi).applyMatrix4(orig.bindMatrix).applyMatrix4(M.copy(orig.skeleton.boneInverses[ti]));
    if (Math.abs(V.x) < 0.2 && Math.abs(V.y - y) < 0.07) best = Math.max(best, V.z);
  }
  return best;
}

export function coatParts(a, C) {
  const meshes = skinned(a).filter((m) => BODY.includes(m.material.name));
  const coats = meshes.length ? [coatMesh(meshes, C)] : [], btn = many([[G.sphere(BTN_R), 0xffd040]], 3, 0.8);
  const bz = meshes.length ? BTN_Y.map((y) => frontZ(meshes, y) + PUSH + 0.01) : BTN_Y.map(() => 0.2);
  return {
    parts: [btn],
    // call every frame after the pose: the coat when `dressed`, and the first nb buttons
    mount(grp, dressed, nb) {
      for (const c of coats) c.visible = dressed;
      const bone = a.node('Torso'); if (!bone) return;
      const sc = bone.getWorldScale(V).y / grp.getWorldScale(V).y;
      for (let i = 0; i < 3; i++) { V.set(0, BTN_Y[i], bz[i]); bone.localToWorld(V); grp.worldToLocal(V); btn.set(i, V.x, V.y, V.z, dressed && i < nb ? sc : 0); }
      btn.commit();
    },
    // world position of button i (for the hands that do it up)
    at(i, out) { const bone = a.node('Torso'); return bone ? bone.localToWorld(out.set(0, BTN_Y[i], bz[i])) : out.set(0, 0, 0); },
  };
}
