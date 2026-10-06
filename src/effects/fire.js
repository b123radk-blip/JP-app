// 火: a flame front runs along each stroke as it is drawn; strokes behind it glow white-hot, then settle to breathing embers;
// flames, embers and sparks rise from the stroke surfaces. The glyph is charcoal whose glow follows a per-vertex heat value.
import * as THREE from 'three';
import { normalizeStrokes, strokeSchedule, buildTube, drawProgress, RADIAL, WIDTH_UNITS } from '../kanji/tube.js';
import { createParticles, FLAME, EMBER, SPARK } from './fire-particles.js';
import { disposeObject } from '../core/dispose.js';

const FLAME_PER_RING = 1.0, EMBER_PER_RING = 0.07, FRONT_FLAMES = 90, FRONT_SPARKS = 60, DEPTH_RATIO = 1.6, MAX_PARTICLES = 1800;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const invSmooth = (y) => 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(y)) / 3);

function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Charcoal body: emission is a black-body-ish ramp of the heat value. Caps take a uniform heat instead of a vertex attribute.
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

export function create({ kanji, glyphHeight }) {
  const group = new THREE.Group();
  const K = glyphHeight / 0.30;                                  // speeds and sizes were tuned for a 0.30 m glyph
  const { S, strokes: data } = normalizeStrokes(kanji, glyphHeight);
  const sched = strokeSchedule(data, { start: 0.5 });
  const radius = (WIDTH_UNITS * S) / 2, rz = radius * DEPTH_RATIO;

  const bloomMat = new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0xff6a1a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const bloom = new THREE.Mesh(new THREE.PlaneGeometry(1.5 * K, 1.5 * K), bloomMat); bloom.position.z = -0.35 * K;
  const bodyMat = glyphMaterial(false, K), capGeo = new THREE.SphereGeometry(radius, 20, 14);
  const strokes = data.map((s, si) => {
    const geo = buildTube(s.pts, radius, rz), heat = new Float32Array(s.pts.length * RADIAL);
    geo.setAttribute('aHeat', new THREE.BufferAttribute(heat, 1).setUsage(THREE.DynamicDrawUsage));
    const segs = s.pts.length - 1, { start, dur } = sched.items[si];
    const tube = new THREE.Mesh(geo, bodyMat);
    const startCap = new THREE.Mesh(capGeo, glyphMaterial(true, K)), tip = new THREE.Mesh(capGeo, glyphMaterial(true, K));
    for (const m of [startCap, tip]) { m.scale.set(1, 1, DEPTH_RATIO); m.position.copy(s.pts[0]); }
    group.add(tube, startCap, tip);
    return { si, pts: s.pts, segs, heat, start, dur, tIgn: s.pts.map((_, i) => start + invSmooth(i / segs) * dur), tube, startCap, tip };
  });
  const rings = [];
  for (const s of strokes) s.pts.forEach((_, i) => rings.push({ s, i, t: s.tIgn[i] }));
  rings.sort((a, b) => a.t - b.t);
  const particles = createParticles(MAX_PARTICLES, K);
  group.add(bloom, particles.mesh);

  let acc;
  const reset = () => { particles.reset(1234); acc = { flame: 0, ember: 0, front: 0, spark: 0 }; applyGlyph(0); };
  const rnd = particles.rand;
  function surfacePoint(s, i, spread) {
    const p = s.pts[i], a = rnd() * Math.PI * 2;
    return [p.x + Math.cos(a) * radius * spread * (0.4 + rnd()), p.y + Math.sin(a) * radius * 0.6 * rnd(), p.z + (rnd() - 0.5) * 2 * rz];
  }
  function applyGlyph(t) {
    bodyMat.uniforms.uTime.value = t;
    for (const s of strokes) {
      for (let i = 0; i <= s.segs; i++) { const h = ringHeat(t - s.tIgn[i], i, s.si, t); s.heat.fill(h, i * RADIAL, (i + 1) * RADIAL); }
      s.tube.geometry.attributes.aHeat.needsUpdate = true;
      const p = smooth((t - s.start) / s.dur);
      s.tube.visible = p > 0; s.startCap.visible = s.tip.visible = p > 0;
      s.tip.position.copy(drawProgress(s.tube.geometry, s.pts, p, s.tip.position));
      s.startCap.material.uniforms.uCapHeat.value = ringHeat(t - s.tIgn[0], 0, s.si, t);
      s.tip.material.uniforms.uCapHeat.value = p < 1 ? 1.0 : ringHeat(t - s.tIgn[s.segs], s.segs, s.si, t);
    }
  }
  function step(t, dt) {
    let lo = 0, hi = rings.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (rings[m].t <= t) lo = m + 1; else hi = m; }
    const burned = lo;
    acc.flame += burned * FLAME_PER_RING * dt; acc.ember += burned * EMBER_PER_RING * dt;
    for (; acc.flame >= 1; acc.flame--) { const r = rings[Math.floor(rnd() * burned)], [x, y, z] = surfacePoint(r.s, r.i, 1);
      particles.spawn(FLAME, x, y, z, (rnd() - 0.5) * 0.04, 0.12 + rnd() * 0.16, (rnd() - 0.5) * 0.03, 0.9 + rnd() * 0.8, 0.04 + rnd() * 0.035); }
    for (; acc.ember >= 1; acc.ember--) { const r = rings[Math.floor(rnd() * burned)], [x, y, z] = surfacePoint(r.s, r.i, 1.5);
      particles.spawn(EMBER, x, y, z, (rnd() - 0.5) * 0.10, 0.06 + rnd() * 0.08, (rnd() - 0.5) * 0.06, 2.5 + rnd() * 2.0, 0.006 + rnd() * 0.004); }
    acc.front += dt * FRONT_FLAMES; acc.spark += dt * FRONT_SPARKS;
    for (const s of strokes) {                                   // bigger flames and sparks at the tip of whichever stroke is being lit
      const p = (t - s.start) / s.dur;
      if (p <= 0 || p >= 1.05) continue;
      const tip = s.tip.position;
      for (let n = acc.front; n >= 1; n--) particles.spawn(FLAME, tip.x + (rnd() - 0.5) * radius, tip.y, tip.z + (rnd() - 0.5) * rz, (rnd() - 0.5) * 0.06, 0.14 + rnd() * 0.18, (rnd() - 0.5) * 0.05, 0.6 + rnd() * 0.5, 0.045 + rnd() * 0.03);
      for (let n = acc.spark; n >= 1; n--) { const a = rnd() * Math.PI * 2, sp = 0.15 + rnd() * 0.35;
        particles.spawn(SPARK, tip.x, tip.y, tip.z, Math.cos(a) * sp, 0.1 + rnd() * sp, (rnd() - 0.5) * sp, 0.35 + rnd() * 0.45, 0.006); }
    }
    if (acc.front >= 1) acc.front -= Math.floor(acc.front);
    if (acc.spark >= 1) acc.spark -= Math.floor(acc.spark);
    particles.update(t, dt);
    applyGlyph(t);
    const burn = Math.min(1, burned / rings.length);              // the fire lights the room, with a fast flicker
    bloomMat.opacity = (0.06 + 0.42 * burn) * (0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1) + 0.08 * Math.sin(t * 31));
    bloom.scale.setScalar(0.8 + 0.45 * burn);
  }
  reset();
  return { group, strokesEnd: sched.end, step, reset, setPassthrough() {}, dispose: () => disposeObject(group) };
}
