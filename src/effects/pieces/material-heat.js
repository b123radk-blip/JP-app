// "heat" material: charcoal whose emission is a black-body-ish ramp of a per-vertex heat value. A ring of the tube flares
// white-hot when the reveal front reaches it, then settles to breathing embers. Draw calls: 2 per instance (body, caps).
import * as THREE from 'three';
import { buildMergedTubes, pointAt, RADIAL, WIDTH_UNITS } from '../../kanji/tube.js';
import { clamp01 } from './util.js';
import { progressUniform, capInstances, CLIP_VERT_DECL, CLIP_VERT_MAIN, CLIP_FRAG_DECL, CLIP_FRAG_MAIN, INSTANCE_VERT } from './glyph-shader.js';

const DEPTH_RATIO = 1.6;

// cap = the instanced round caps (heat per instance), otherwise the merged stroke body (heat per vertex, clipped per stroke)
function glyphMaterial(cap, K, uProg) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBase: { value: new THREE.Color(0x1b1512) }, uProg },
    vertexShader: `${cap ? 'attribute float aCapHeat;' : `attribute float aHeat; ${CLIP_VERT_DECL}`} varying vec3 vN; varying vec3 vV; varying float vHeat; varying vec3 vP;
      void main(){ ${INSTANCE_VERT} ${cap ? 'vHeat = aCapHeat;' : `vHeat = aHeat; ${CLIP_VERT_MAIN}`}
        vec4 mv = modelViewMatrix * p0; vN = normalize(normalMatrix * n0); vV = normalize(-mv.xyz); vP = p0.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime; uniform vec3 uBase; varying vec3 vN; varying vec3 vV; varying float vHeat; varying vec3 vP; ${cap ? '' : CLIP_FRAG_DECL}
      vec3 ramp(float h){ vec3 c = mix(vec3(0.0), vec3(0.55, 0.035, 0.0), smoothstep(0.0, 0.35, h)); c = mix(c, vec3(1.0, 0.36, 0.03), smoothstep(0.35, 0.7, h)); return mix(c, vec3(1.0, 0.86, 0.5), smoothstep(0.7, 1.0, h)); }
      void main(){
        ${cap ? '' : CLIP_FRAG_MAIN}
        vec3 n = normalize(vN), v = normalize(vV);
        float diff = 0.3 + 0.7 * max(dot(n, normalize(vec3(-0.3, 0.7, 0.7))), 0.0);
        float flick = 0.94 + 0.06 * sin(uTime * 9.0 + vP.x * 12.0 / ${K.toFixed(4)} + vP.y * 9.0 / ${K.toFixed(4)});
        float h = clamp(vHeat * flick, 0.0, 1.0), fres = pow(1.0 - abs(dot(n, v)), 2.0);
        gl_FragColor = vec4(uBase * diff * (1.0 - h) + ramp(h) * (1.1 + 0.7 * fres), 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

function ringHeat(age, i, si, t) {
  if (age < 0) return 0;
  const ember = 0.40 + 0.08 * Math.sin(t * 1.9 + i * 0.06 + si * 1.9) + 0.03 * Math.sin(t * 6.1 + i * 0.11 + si);
  return clamp01(ember * (1 - Math.exp(-age / 0.9)) + Math.exp(-age / 0.9));
}

export function create(ctx, spec, strokeIdx) {
  const K = ctx.K, radius = (WIDTH_UNITS * ctx.S) / 2, rz = radius * DEPTH_RATIO, uProg = progressUniform();
  const pts = strokeIdx.map((si) => ctx.strokes[si].pts);
  const geo = buildMergedTubes(pts, radius, rz), heat = new Float32Array(geo.attributes.position.count);
  geo.setAttribute('aHeat', new THREE.BufferAttribute(heat, 1).setUsage(THREE.DynamicDrawUsage));
  const bodyMat = glyphMaterial(false, K, uProg), capMat = glyphMaterial(true, K, uProg);
  const body = new THREE.Mesh(geo, bodyMat);
  const capGeo = new THREE.SphereGeometry(radius, 20, 14), caps = capInstances(capGeo, capMat, pts.length);
  const capHeat = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(2, 2 * pts.length)), 1).setUsage(THREE.DynamicDrawUsage);
  capGeo.setAttribute('aCapHeat', capHeat);
  const offsets = []; let o = 0; for (const p of pts) { offsets.push(o); o += p.length * RADIAL; }
  const group = new THREE.Group(); group.add(body, caps.mesh);
  const scale = new THREE.Vector3(1, 1, DEPTH_RATIO), tip = new THREE.Vector3();

  function step(t) {
    bodyMat.uniforms.uTime.value = capMat.uniforms.uTime.value = t;
    strokeIdx.forEach((si, j) => {
      const reach = ctx.rv.ringTimes[si], p = ctx.rv.progress[si], segs = pts[j].length - 1, on = p > 0;
      for (let i = 0; i <= segs; i++) heat.fill(ringHeat(t - reach[i], i, si, t), offsets[j] + i * RADIAL, offsets[j] + (i + 1) * RADIAL);
      uProg.value[j] = on ? p : -1;
      caps.set(j, 0, pts[j][0], scale, on); caps.set(j, 1, pointAt(pts[j], p, tip), scale, on);
      capHeat.array[2 * j] = ringHeat(t - reach[0], 0, si, t);
      capHeat.array[2 * j + 1] = p < 1 ? 1.0 : ringHeat(t - reach[segs], segs, si, t);
    });
    geo.attributes.aHeat.needsUpdate = true; capHeat.needsUpdate = true; caps.commit();
  }
  return { group, step, rz };
}
