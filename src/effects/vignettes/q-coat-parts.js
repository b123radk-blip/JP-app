// The coat once it is on, worn OVER her own clothes (her suit trousers stay visible below it). It is built from her own mesh so it
// can never be misaligned: the jacket, shirt, tie and belt triangles are copied into a second skinned mesh on her skeleton and
// pushed out a little along their smoothed normals, so the body and sleeves follow her exactly (the sleeves cover her arms to the
// wrist). Added to that mesh, skinned to single bones: a flared skirt on the Hips bone (one tube from the hips to mid-thigh, not
// following each leg) and, in a darker second mesh, a collar and two lapels on the Torso bone. Gold buttons sit on the front
// centre line, mounted on the Torso bone at the front surface measured from the mesh. The hanging / falling coat is a static copy
// of the worn coat baked in her idle pose, so it is the same shape and colour and lands on her without a pop.
import * as THREE from 'three';
import { mergeGeometries } from '../../../vendor/three/addons/utils/BufferGeometryUtils.js';
import { G } from '../pieces/shape-kit.js';
import { many } from '../pieces/kit-things.js';

const BODY = ['Black', 'Shirt', 'Details', 'Belt'], PUSH = 0.03, CUT = -0.02;
const BTN_Y = [0.4, 0.27, 0.14], BTN_R = 0.03, V = new THREE.Vector3(), M = new THREE.Matrix4(), P = new THREE.Vector3();
const GPU = { type: THREE.FloatType };
const SKIRT = { rt: 0.37, rb: 0.47, y0: -0.4, y1: 0.12, sz: 0.86, z: -0.02 };   // Hips bone units

const skinned = (a) => { const out = []; a.group.traverse((o) => { if (o.isSkinnedMesh) out.push(o); }); return out; };
const boneIdx = (sk, n) => sk.bones.findIndex((b) => b.name === n);

// a piece built in a bone's own units, skinned rigidly to that bone, in the mesh's bind-pose space
function boneGeo(geo, first, bone) {
  const sk = first.skeleton, bi = boneIdx(sk, bone), g = geo.index ? geo : geo, n = g.attributes.position.count;
  M.copy(sk.boneInverses[bi]).invert().premultiply(new THREE.Matrix4().copy(first.bindMatrix).invert());
  g.applyMatrix4(M);
  const IdxT = first.geometry.attributes.skinIndex.array.constructor, si = new IdxT(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { si[i * 4] = bi; sw[i * 4] = 1; }
  const sa = new THREE.BufferAttribute(si, 4); sa.gpuType = first.geometry.attributes.skinIndex.gpuType; g.setAttribute('skinIndex', sa); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  return g;
}
// one common attribute layout for merging: float position / normal / weights, 16-bit joint indices
const clean = (g) => {
  const out = new THREE.BufferGeometry(), n = g.attributes.position.count;
  const copy = (name, Arr, size) => { const src = g.attributes[name], arr = new Arr(n * size); for (let i = 0; i < n; i++) for (let c = 0; c < size; c++) arr[i * size + c] = src.getComponent(i, c); return new THREE.BufferAttribute(arr, size); };
  out.setAttribute('position', copy('position', Float32Array, 3)); out.setAttribute('normal', copy('normal', Float32Array, 3));
  out.setAttribute('skinWeight', copy('skinWeight', Float32Array, 4));
  const si = copy('skinIndex', Uint16Array, 4); si.gpuType = GPU.type; out.setAttribute('skinIndex', si);
  out.setIndex(Array.from(g.index.array)); return out;
};

// front surface of the body at a Torso-bone height y (bone units), measured from the mesh's own bind pose
function frontZ(origs, y) {
  let best = 0;
  for (const orig of origs) {
    const g = orig.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, bones = orig.skeleton.bones;
    const ti = boneIdx(orig.skeleton, 'Torso'), ai = boneIdx(orig.skeleton, 'Abdomen');
    for (let vi = 0; vi < pos.count; vi++) {
      let bi = 0, bw = 0; for (let c = 0; c < 4; c++) { const w = sw.getComponent(vi, c); if (w > bw) { bw = w; bi = si.getComponent(vi, c); } }
      if (bi !== ti && bi !== ai) continue;
      V.fromBufferAttribute(pos, vi).applyMatrix4(orig.bindMatrix).applyMatrix4(M.copy(orig.skeleton.boneInverses[ti]));
      if (Math.abs(V.x) < 0.2 && Math.abs(V.y - y) < 0.07) best = Math.max(best, V.z);
    }
  }
  return best;
}

function pushed(orig) {
  const mat = orig.material, g = orig.geometry.clone(), pos = g.attributes.position, nor = g.attributes.normal, idx = g.index.array, sk = orig.skeleton;
  const key = (i) => `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`, sum = new Map();
  for (let i = 0; i < pos.count; i++) { const k = key(i), e = sum.get(k) ?? [0, 0, 0]; e[0] += nor.getX(i); e[1] += nor.getY(i); e[2] += nor.getZ(i); sum.set(k, e); }
  const hi = boneIdx(sk, 'Hips'), ys = Array.from({ length: pos.count }, (_, i) => V.fromBufferAttribute(pos, i).applyMatrix4(orig.bindMatrix).applyMatrix4(sk.boneInverses[hi]).y), keep = [];
  for (let i = 0; i < idx.length; i += 3) if (mat.name !== 'Black' || (ys[idx[i]] > CUT && ys[idx[i + 1]] > CUT && ys[idx[i + 2]] > CUT)) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  for (let i = 0; i < pos.count; i++) { const e = sum.get(key(i)), l = Math.hypot(e[0], e[1], e[2]) || 1; pos.setXYZ(i, pos.getX(i) + e[0] / l * PUSH, pos.getY(i) + e[1] / l * PUSH, pos.getZ(i) + e[2] / l * PUSH); }
  g.setIndex(keep); return clean(g);
}

export function coatParts(a, C, bz0) {
  const origs = skinned(a).filter((m) => BODY.includes(m.material.name)), first = origs[0], gp = (GPU.type = first.geometry.attributes.skinIndex.gpuType), btn = many([[G.sphere(BTN_R), 0xffd040]], 3, 0.8);
  const bz = BTN_Y.map((y) => frontZ(origs, y) + PUSH + 0.01), meshes = [], dark = new THREE.Color(C).multiplyScalar(0.5).getHex();
  const mat = (col) => { const m = first.material.clone(); m.map = null; m.name = 'Coat'; m.color.set(col); m.emissive.copy(m.color); return m; };
  const body = origs.map(pushed);
  body.push(clean(boneGeo(new THREE.CylinderGeometry(SKIRT.rt, SKIRT.rb, SKIRT.y1 - SKIRT.y0, 28).scale(1, 1, SKIRT.sz).translate(0, (SKIRT.y0 + SKIRT.y1) / 2, SKIRT.z), first, 'Hips')));
  // collar (a ring at the neck base) and two lapels slanting down the chest, both on the Torso bone
  const zl = bz[0] + 0.035, trim = [new THREE.TorusGeometry(0.17, 0.075, 8, 24).rotateX(Math.PI / 2).scale(1, 1, 0.85).translate(0, 0.5, -0.02)];
  for (const s of [-1, 1]) trim.push(new THREE.BoxGeometry(0.09, 0.3, 0.04).rotateZ(s * 0.32).translate(s * 0.09, 0.3, zl - 0.005));
  const tgeo = trim.map((g) => clean(boneGeo(g, first, 'Torso')));
  const coat = new THREE.SkinnedMesh(mergeGeometries(body), mat(C)), tr = new THREE.SkinnedMesh(mergeGeometries(tgeo), mat(dark));
  for (const m of [coat, tr]) { m.frustumCulled = false; m.bind(first.skeleton, first.bindMatrix); m.position.copy(first.position); m.quaternion.copy(first.quaternion); m.scale.copy(first.scale); first.parent.add(m); m.updateMatrix(); meshes.push(m); }
  // the hanging coat: both meshes baked in her idle pose into static meshes
  a.pose('Idle', 0); a.group.updateMatrixWorld(true); first.skeleton.update();
  const hang = new THREE.Group();
  for (const m of [coat, tr]) {
    const g = m.geometry.clone(), pos = g.attributes.position; g.deleteAttribute('skinIndex'); g.deleteAttribute('skinWeight');
    for (let i = 0; i < pos.count; i++) { m.getVertexPosition(i, P); pos.setXYZ(i, P.x, P.y, P.z); }
    g.computeVertexNormals(); const s = new THREE.Mesh(g, m.material); s.frustumCulled = false; hang.add(s);
  }
  hang.position.copy(first.position); hang.quaternion.copy(first.quaternion); hang.scale.copy(first.scale); first.parent.add(hang);
  const base = hang.position.clone();
  return {
    parts: [btn],
    // call every frame after the pose: the worn coat when `dressed`, and the first nb buttons
    mount(grp, dressed, nb) {
      for (const m of meshes) m.visible = dressed;
      const bone = a.node('Torso'); if (!bone) return;
      const sc = bone.getWorldScale(V).y / grp.getWorldScale(V).y;
      for (let i = 0; i < 3; i++) { V.set(0, BTN_Y[i], bz[i]); bone.localToWorld(V); grp.worldToLocal(V); btn.set(i, V.x, V.y, V.z, dressed && i < nb ? sc : 0); }
      btn.commit();
    },
    // the coat hanging or falling: `off` is where it is relative to being on her (a vector in the scene group's space), null when not shown
    hung(grp, off) {
      hang.visible = !!off; if (!off) return;
      const par = first.parent, o = par.getWorldPosition(new THREE.Vector3()), w0 = grp.localToWorld(new THREE.Vector3()), w1 = grp.localToWorld(off.clone());
      hang.position.copy(base).add(par.worldToLocal(o.clone().add(w1.sub(w0))).sub(par.worldToLocal(o.clone())));
    },
    // world position of button i (for the hands that do it up)
    at(i, out) { const bone = a.node('Torso'); return bone ? bone.localToWorld(out.set(0, BTN_Y[i], bz[i])) : out.set(0, 0, 0); },
  };
}
