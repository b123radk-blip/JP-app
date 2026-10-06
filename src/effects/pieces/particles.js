// A pool of particles drawn as ONE instanced mesh of camera-facing quads. Each particle has a kind (pieces/particle-kinds.js)
// that moves it and sets its colour, size and shape every frame. Speeds and sizes are scaled by K (glyph height / 0.30 m).
// Spawning goes round a ring buffer, so a full pool overwrites its oldest particle.
import * as THREE from 'three';

// Shapes (aShape.w): 0 soft dot, 1 disc, 2 ring (bubble), 3 streak (rain), 4 leaf, 5 puff (mist), 6 heart, 7 music note
const FRAG = `varying vec2 vUv; varying vec4 vColor; varying float vShape;
  void main(){
    vec2 u = vUv; float d = length(u), a;
    if (vShape < 0.5) { if (d > 1.0) discard; a = pow(1.0 - d, 2.0); }
    else if (vShape < 1.5) { a = smoothstep(1.0, 0.6, d); }
    else if (vShape < 2.5) { a = smoothstep(0.6, 0.85, d) * smoothstep(1.0, 0.88, d) + 0.5 * smoothstep(0.35, 0.0, length(u - vec2(-0.35, 0.35))); }
    else if (vShape < 3.5) { a = smoothstep(1.0, 0.0, abs(u.x)) * (1.0 - abs(u.y)); }
    else if (vShape < 4.5) { float w = 0.55 * (1.0 - u.y * u.y); a = smoothstep(w, w - 0.12, abs(u.x)) * (0.75 + 0.25 * smoothstep(0.0, 0.12, abs(u.x))); }
    else if (vShape < 5.5) { a = exp(-3.0 * d * d) * smoothstep(1.0, 0.7, d); }
    else if (vShape < 6.5) { vec2 q = vec2(u.x, u.y * 1.15 + 0.3 - sqrt(abs(u.x)) * 0.6); a = smoothstep(0.72, 0.6, length(q)); }
    else { a = max(smoothstep(0.36, 0.28, length((u - vec2(-0.3, -0.55)) * vec2(1.0, 1.4))), step(abs(u.x - 0.02), 0.07) * step(-0.55, u.y) * step(u.y, 0.75));
           a = max(a, step(0.0, u.x) * step(u.x, 0.45) * step(0.5, u.y + u.x * 0.3) * step(u.y + u.x * 0.3, 0.75)); }
    if (a <= 0.0) discard;
    gl_FragColor = vec4(vColor.rgb, vColor.a * a);
  }`;
const VERT = `attribute vec3 aOffset; attribute vec4 aShape; attribute vec4 aColor; varying vec2 vUv; varying vec4 vColor; varying float vShape;
  void main(){
    vUv = position.xy * 2.0; vColor = aColor; vShape = aShape.w;
    vec2 q = position.xy * aShape.xy; float c = cos(aShape.z), s = sin(aShape.z);
    vec4 mv = modelViewMatrix * vec4(aOffset, 1.0); mv.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y);
    gl_Position = projectionMatrix * mv;
  }`;

// blend: 'add' | 'norm'. Kinds are added by the pieces that use the pool (addKind returns the id to spawn with).
export function createPool(max, K, blend) {
  const kinds = [];
  const geo = new THREE.InstancedBufferGeometry(), quad = new THREE.PlaneGeometry(1, 1);
  geo.index = quad.index; geo.setAttribute('position', quad.getAttribute('position'));
  const attr = (n) => new THREE.InstancedBufferAttribute(new Float32Array(max * n), n).setUsage(THREE.DynamicDrawUsage);
  const aOffset = attr(3), aShape = attr(4), aColor = attr(4);
  geo.setAttribute('aOffset', aOffset); geo.setAttribute('aShape', aShape); geo.setAttribute('aColor', aColor); geo.instanceCount = max;
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: blend === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 10;
  // per-particle state. aux: free slot for a kind (e.g. which stroke a flow droplet runs along)
  const P = { pos: aOffset.array, vel: new Float32Array(max * 3), age: new Float32Array(max), life: new Float32Array(max), size0: new Float32Array(max), kind: new Uint8Array(max), seed: new Float32Array(max), aux: new Float32Array(max), next: 0, K, alive: 0 };
  const out = { r: 0, g: 0, b: 0, a: 0, w: 0, h: 0, rot: 0 };

  function reset() {
    P.next = 0; P.age.fill(0); P.life.fill(0); aShape.array.fill(0); aColor.array.fill(0);
    aShape.needsUpdate = aColor.needsUpdate = true;
  }
  function spawn(kind, x, y, z, vx, vy, vz, life, size, seed) {
    const i = P.next, pos = P.pos; P.next = (P.next + 1) % max;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    P.vel[i * 3] = vx * K; P.vel[i * 3 + 1] = vy * K; P.vel[i * 3 + 2] = vz * K;
    P.age[i] = 0; P.life[i] = life; P.size0[i] = size * K; P.kind[i] = kind; P.seed[i] = seed; P.aux[i] = 0;
    return i;
  }
  function update(t, dt) {
    const sh = aShape.array, col = aColor.array;
    let alive = 0;
    for (let i = 0; i < max; i++) {
      if (P.life[i] <= 0) continue;
      P.age[i] += dt;
      const a = P.age[i] / P.life[i];
      if (a >= 1) { P.life[i] = 0; sh[i * 4] = sh[i * 4 + 1] = 0; col[i * 4 + 3] = 0; continue; }
      const kind = kinds[P.kind[i]];
      kind.move(P, i, a, t, dt);
      kind.look(P, i, a, t, out);
      sh[i * 4] = out.w; sh[i * 4 + 1] = out.h; sh[i * 4 + 2] = out.rot; sh[i * 4 + 3] = kind.shape;
      col[i * 4] = out.r; col[i * 4 + 1] = out.g; col[i * 4 + 2] = out.b; col[i * 4 + 3] = out.a;
      alive++;
    }
    P.alive = alive;
    aOffset.needsUpdate = aShape.needsUpdate = aColor.needsUpdate = true;
  }
  return { mesh, max, reset, spawn, update, addKind: (k) => kinds.push(k) - 1, setAux: (i, v) => { P.aux[i] = v; }, get alive() { return P.alive; } };
}

// Generic motion most kinds share: buoyancy / gravity (rise), side-to-side wobble, drag, then integrate.
// w = [ampX, freqX, seedMulX, phaseX, ampZ, freqZ, seedMulZ, phaseZ]
export function physics({ rise = 0, w = null, drag = 0.6, dragY = true }) {
  return (P, i, a, t, dt) => {
    const K = P.K, v = P.vel, sd = P.seed[i], j = i * 3;
    v[j + 1] += rise * K * dt;
    if (w) { v[j] += Math.sin(t * w[1] + sd * w[2] + w[3]) * w[0] * K * dt; if (w[4]) v[j + 2] += Math.sin(t * w[5] + sd * w[6] + w[7]) * w[4] * K * dt; }
    const d = 1 - drag * dt;
    v[j] *= d; if (dragY) v[j + 1] *= d; v[j + 2] *= d;
    P.pos[j] += v[j] * dt; P.pos[j + 1] += v[j + 1] * dt; P.pos[j + 2] += v[j + 2] * dt;
  };
}
