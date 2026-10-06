// Flames, embers and sparks as instanced camera-facing quads (additive). Positions are in the effect group's space.
// `K` scales speeds and sizes with the glyph; the random generator is seeded so a given time always looks the same.
import * as THREE from 'three';

const mulberry32 = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const FLAME = 0, EMBER = 1, SPARK = 2;

export function createParticles(max, K) {
  const geo = new THREE.InstancedBufferGeometry();
  const quad = new THREE.PlaneGeometry(1, 1);
  geo.index = quad.index; geo.setAttribute('position', quad.getAttribute('position'));
  const aOffset = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const aData = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4).setUsage(THREE.DynamicDrawUsage); // age01, size, kind, seed
  geo.setAttribute('aOffset', aOffset); geo.setAttribute('aData', aData); geo.instanceCount = max;
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute vec3 aOffset; attribute vec4 aData; varying vec2 vUv; varying vec4 vData;
      void main(){ vUv = position.xy * 2.0; vData = aData; vec4 mv = modelViewMatrix * vec4(aOffset, 1.0); mv.xy += position.xy * aData.y; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; varying vec4 vData;
      void main(){
        float d = length(vUv); if (d > 1.0) discard;
        float a = pow(1.0 - d, 2.0), age = vData.x, kind = vData.z, seed = vData.w; vec3 col; float alpha;
        if (kind < 0.5) { vec3 c0 = vec3(1.0, 0.92, 0.65), c1 = vec3(1.0, 0.5, 0.1), c2 = vec3(0.75, 0.12, 0.02);
          col = age < 0.35 ? mix(c0, c1, age / 0.35) : mix(c1, c2, (age - 0.35) / 0.65); alpha = a * (1.0 - age) * 0.46; }
        else if (kind < 1.5) { col = vec3(1.0, 0.55, 0.15); alpha = a * (1.0 - age) * (0.65 + 0.35 * sin(uTime * 12.0 + seed * 40.0)); }
        else { col = vec3(1.0, 0.9, 0.6); alpha = a * (1.0 - age) * 1.2; }
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 10;
  const P = { vel: new Float32Array(max * 3), age: new Float32Array(max), life: new Float32Array(max), size0: new Float32Array(max), kind: new Float32Array(max), seed: new Float32Array(max), next: 0 };
  let rnd = mulberry32(1);

  function reset(seed = 1) {
    rnd = mulberry32(seed); P.next = 0; P.age.fill(0); P.life.fill(0);
    for (let i = 0; i < max; i++) aData.array[i * 4 + 1] = 0;
    aData.needsUpdate = true;
  }
  function spawn(kind, x, y, z, vx, vy, vz, life, size) {
    const i = P.next, pos = aOffset.array; P.next = (P.next + 1) % max;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    P.vel[i * 3] = vx * K; P.vel[i * 3 + 1] = vy * K; P.vel[i * 3 + 2] = vz * K;
    P.age[i] = 0; P.life[i] = life; P.size0[i] = size * K; P.kind[i] = kind; P.seed[i] = rnd();
  }
  function update(t, dt) {
    const pos = aOffset.array, data = aData.array;
    for (let i = 0; i < max; i++) {
      if (P.life[i] <= 0) continue;
      P.age[i] += dt;
      const a = P.age[i] / P.life[i];
      if (a >= 1) { P.life[i] = 0; data[i * 4 + 1] = 0; continue; }
      const k = P.kind[i], sd = P.seed[i];
      if (k === FLAME) { P.vel[i * 3 + 1] += 0.32 * K * dt; P.vel[i * 3] += Math.sin(t * 4 + sd * 20) * 0.12 * K * dt; }
      else if (k === EMBER) { P.vel[i * 3] += Math.sin(t * 2.5 + sd * 30) * 0.08 * K * dt; P.vel[i * 3 + 2] += Math.cos(t * 2.1 + sd * 17) * 0.06 * K * dt; }
      else P.vel[i * 3 + 1] -= 0.5 * K * dt;                                     // sparks fall back
      const drag = 1 - 0.6 * dt;
      P.vel[i * 3] *= drag; P.vel[i * 3 + 1] *= k === SPARK ? 1 : drag; P.vel[i * 3 + 2] *= drag;
      pos[i * 3] += P.vel[i * 3] * dt; pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
      const size = k === FLAME ? P.size0[i] * (0.55 + Math.sin(Math.PI * Math.min(1, a * 0.9 + 0.05))) * (1 - 0.35 * a) : P.size0[i];
      data[i * 4] = a; data[i * 4 + 1] = size; data[i * 4 + 2] = k; data[i * 4 + 3] = sd;
    }
    aOffset.needsUpdate = true; aData.needsUpdate = true; mat.uniforms.uTime.value = t;
  }
  return { mesh, reset, spawn, update, rand: () => rnd() };
}
