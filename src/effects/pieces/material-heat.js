// "heat" material: charcoal whose emission is a black-body-ish ramp of a per-vertex heat value. A ring of the tube flares
// white-hot when the reveal front reaches it, then settles to breathing embers.
import * as THREE from 'three';
import { buildTube, drawProgress, RADIAL, WIDTH_UNITS } from '../../kanji/tube.js';
import { clamp01 } from './util.js';

const DEPTH_RATIO = 1.6;

function glyphMaterial(cap, K) {
  return new THREE.ShaderMaterial({
    defines: cap ? { CAP: 1 } : {},
    uniforms: { uTime: { value: 0 }, uCapHeat: { value: 0 }, uBase: { value: new THREE.Color(0x1b1512) } },
    vertexShader: `${cap ? '' : 'attribute float aHeat;'} uniform float uCapHeat; varying vec3 vN; varying vec3 vV; varying float vHeat; varying vec3 vP;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position;
        #ifdef CAP
          vHeat = uCapHeat;
        #else
          vHeat = aHeat;
        #endif
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime; uniform vec3 uBase; varying vec3 vN; varying vec3 vV; varying float vHeat; varying vec3 vP;
      vec3 ramp(float h){ vec3 c = mix(vec3(0.0), vec3(0.55, 0.035, 0.0), smoothstep(0.0, 0.35, h)); c = mix(c, vec3(1.0, 0.36, 0.03), smoothstep(0.35, 0.7, h)); return mix(c, vec3(1.0, 0.86, 0.5), smoothstep(0.7, 1.0, h)); }
      void main(){
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
  const K = ctx.K, radius = (WIDTH_UNITS * ctx.S) / 2, rz = radius * DEPTH_RATIO;
  const group = new THREE.Group();
  const bodyMat = glyphMaterial(false, K), capGeo = new THREE.SphereGeometry(radius, 20, 14);
  const strokes = strokeIdx.map((si) => {
    const { pts } = ctx.strokes[si];
    const geo = buildTube(pts, radius, rz), heat = new Float32Array(pts.length * RADIAL);
    geo.setAttribute('aHeat', new THREE.BufferAttribute(heat, 1).setUsage(THREE.DynamicDrawUsage));
    const tube = new THREE.Mesh(geo, bodyMat);
    const startCap = new THREE.Mesh(capGeo, glyphMaterial(true, K)), tip = new THREE.Mesh(capGeo, glyphMaterial(true, K));
    for (const m of [startCap, tip]) { m.scale.set(1, 1, DEPTH_RATIO); m.position.copy(pts[0]); }
    group.add(tube, startCap, tip);
    return { si, pts, segs: pts.length - 1, heat, tube, startCap, tip };
  });
  function step(t) {
    bodyMat.uniforms.uTime.value = t;
    for (const s of strokes) {
      const reach = ctx.rv.ringTimes[s.si], p = ctx.rv.progress[s.si];
      for (let i = 0; i <= s.segs; i++) s.heat.fill(ringHeat(t - reach[i], i, s.si, t), i * RADIAL, (i + 1) * RADIAL);
      s.tube.geometry.attributes.aHeat.needsUpdate = true;
      s.tube.visible = s.startCap.visible = s.tip.visible = p > 0;
      s.tip.position.copy(drawProgress(s.tube.geometry, s.pts, p, s.tip.position));
      s.startCap.material.uniforms.uCapHeat.value = ringHeat(t - reach[0], 0, s.si, t);
      s.tip.material.uniforms.uCapHeat.value = p < 1 ? 1.0 : ringHeat(t - reach[s.segs], s.segs, s.si, t);
    }
  }
  return { group, step, rz };
}
