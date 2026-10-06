// Shared bits of the glyph materials. Strokes of one material are ONE merged mesh (kanji/tube.js buildMergedTubes); each
// vertex knows its stroke (aStroke) and how far along it is (aT), and the fragment shader hides everything past that
// stroke's progress (uProg[stroke]). So a glyph part costs the same few draw calls whether it has 2 strokes or 20.
// Round caps (stroke start + moving tip) are instanced spheres.
import * as THREE from 'three';

export const MAX_STROKES = 64;          // strokes per material instance (a part of one glyph); the longest kanji have ~30

export const progressUniform = () => ({ value: new Float32Array(MAX_STROKES).fill(-1) });
// per-stroke offset (metres, glyph space): stroke motions and reveals move single strokes (split, assemble, stamp ...)
export const offsetUniform = () => ({ value: Array.from({ length: MAX_STROKES }, () => new THREE.Vector3()) });
// copies ctx.so (3 floats per stroke of the whole glyph) into a material instance's uniform for its strokes
export function syncOffsets(uOff, so, strokeIdx) { strokeIdx.forEach((si, j) => uOff.value[j].set(so[3 * si], so[3 * si + 1], so[3 * si + 2])); }

// Adds the stroke clipping to a built-in material (MeshStandardMaterial ...) through onBeforeCompile.
export function clipStrokes(material, uProg, uOff) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uProg = uProg; shader.uniforms.uOff = uOff;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nattribute float aStroke; attribute float aT; varying float vT; flat varying int vStrokeI; uniform vec3 uOff[${MAX_STROKES}];`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvT = aT; vStrokeI = int(aStroke + 0.5); transformed += uOff[vStrokeI];');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uProg[${MAX_STROKES}]; varying float vT; flat varying int vStrokeI;`)
      .replace('void main() {', 'void main() {\n  if (vT > uProg[vStrokeI] + 1e-4) discard;');
  };
  material.customProgramCacheKey = () => 'clip-strokes';
  return material;
}

// GLSL pieces for hand-written ShaderMaterials (the glow shell, the heat body)
export const CLIP_VERT_DECL = `attribute float aStroke; attribute float aT; varying float vT; flat varying int vStrokeI; uniform vec3 uOff[${MAX_STROKES}];`;
export const CLIP_VERT_MAIN = 'vT = aT; vStrokeI = int(aStroke + 0.5); p0.xyz += uOff[vStrokeI];';
export const CLIP_FRAG_DECL = `uniform float uProg[${MAX_STROKES}]; varying float vT; flat varying int vStrokeI;`;
export const CLIP_FRAG_MAIN = 'if (vT > uProg[vStrokeI] + 1e-4) discard;';
// position / normal through instanceMatrix when the material is drawn by an InstancedMesh
export const INSTANCE_VERT = `vec4 p0 = vec4(position, 1.0); vec3 n0 = normal;
  #ifdef USE_INSTANCING
    mat3 im = mat3(instanceMatrix);
    p0 = instanceMatrix * p0; n0 = im * (n0 / vec3(dot(im[0], im[0]), dot(im[1], im[1]), dot(im[2], im[2])));   // inverse-transpose, as three.js does
  #endif
`;                                                  // the newline matters: code after #endif must start on a new line

// Start caps and tips of n strokes as one InstancedMesh (instance 2i = start of stroke i, 2i + 1 = its tip).
export function capInstances(geometry, material, n) {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, 2 * n));
  mesh.frustumCulled = false;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), zero = new THREE.Vector3(0, 0, 0);
  return {
    mesh,
    set(i, which, pos, scale, visible) {                      // which: 0 start, 1 tip
      s.copy(visible ? scale : zero);
      mesh.setMatrixAt(2 * i + which, m.compose(pos, q, s));
    },
    commit() { mesh.instanceMatrix.needsUpdate = true; },
  };
}
