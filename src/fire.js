// 火 (fire) in isolation: the fire is part of the glyph. A flame front runs along each stroke as it is drawn,
// the strokes behind it glow white-hot and settle to breathing embers, and flames / embers / sparks rise from the
// stroke surfaces. Standalone: shares only the vendored three.js and the KanjiVG data with the 日 page.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';

// ---------- tunables ----------
const GLYPH_HEIGHT = 0.30;      // metres, glyph bounding-box height
const STROKE_WIDTH_UNITS = 6.5; // KanjiVG units
const DEPTH_RATIO = 1.6;
const DIST = 1.2;               // metres in front of the viewer in XR
const DESKTOP_POS = new THREE.Vector3(0, 1.4, -DIST);
const IGNITE_START = 0.6;       // seconds of darkness before the first stroke is lit
const STROKE_GAP = 0.1;
const FLAME_PER_RING = 1.3;     // flames per second per burning stroke sample
const EMBER_PER_RING = 0.07;
const FRONT_FLAMES = 110, FRONT_SPARKS = 70; // per second at each moving flame front
const MAX_P = 1800;             // particle pool size

const params = new URLSearchParams(location.search);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const invSmooth = (y) => 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(y)) / 3);

// ---------- DOM ----------
const statusEl = document.getElementById('status');
const buttonsEl = document.getElementById('buttons');
const state = { secure: window.isSecureContext, xr: !!navigator.xr, vr: null, ar: null, hands: 'n/a (enter a session)', note: '' };
function renderStatus() {
  const f = (v) => v === null ? '…' : `<span class="${v ? 'ok' : 'bad'}">${v ? 'yes' : 'no'}</span>`;
  statusEl.innerHTML = `HTTPS: ${f(state.secure)} · WebXR: ${f(state.xr)} · VR: ${f(state.vr)} · AR: ${f(state.ar)} · hands: ${state.hands}` +
    (state.note ? `<br><span class="bad">${state.note.replace(/</g, '&lt;')}</span>` : '');
}
renderStatus();

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.prepend(renderer.domElement);

const BG = new THREE.Color(0x05060a);
const scene = new THREE.Scene();
scene.background = BG;
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, DESKTOP_POS.y, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(DESKTOP_POS);
controls.enableDamping = true;
controls.update();

const group = new THREE.Group();
group.position.copy(DESKTOP_POS);
scene.add(group);

// warm light bloom behind the glyph: the fire lighting the room (additive, flickers with the fire)
function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const bloomMat = new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0xff6a1a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
const bloom = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), bloomMat);
bloom.position.z = -0.35;
group.add(bloom);

// ---------- glyph ----------
const kanji = await (await fetch('./data/kanji-706b.json')).json();
const bb = kanji.bbox;
const S = GLYPH_HEIGHT / (bb.maxY - bb.minY);
const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
const RADIUS = (STROKE_WIDTH_UNITS * S) / 2, RZ = RADIUS * DEPTH_RATIO;
const RADIAL = 14;

// Charcoal body whose emission follows a per-vertex heat value (black-body-ish ramp), flickering slightly.
function glyphMaterial(cap) {
  return new THREE.ShaderMaterial({
    defines: cap ? { CAP: 1 } : {},
    uniforms: { uTime: { value: 0 }, uCapHeat: { value: 0 }, uBase: { value: new THREE.Color(0x1b1512) } },
    vertexShader: `
      ${cap ? '' : 'attribute float aHeat;'}
      uniform float uCapHeat;
      varying vec3 vN; varying vec3 vV; varying float vHeat; varying vec3 vP;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position;
        #ifdef CAP
          vHeat = uCapHeat;
        #else
          vHeat = aHeat;
        #endif
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uBase;
      varying vec3 vN; varying vec3 vV; varying float vHeat; varying vec3 vP;
      vec3 ramp(float h){
        vec3 c = mix(vec3(0.0), vec3(0.55, 0.035, 0.0), smoothstep(0.0, 0.35, h));
        c = mix(c, vec3(1.0, 0.36, 0.03), smoothstep(0.35, 0.7, h));
        return mix(c, vec3(1.0, 0.86, 0.5), smoothstep(0.7, 1.0, h));
      }
      void main(){
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float diff = 0.3 + 0.7 * max(dot(n, normalize(vec3(-0.3, 0.7, 0.7))), 0.0);
        float flick = 0.94 + 0.06 * sin(uTime * 9.0 + vP.x * 12.0 + vP.y * 9.0);
        float h = clamp(vHeat * flick, 0.0, 1.0);
        float fres = pow(1.0 - abs(dot(n, v)), 2.0);
        vec3 col = uBase * diff * (1.0 - h) + ramp(h) * (1.1 + 0.7 * fres);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
const bodyMat = glyphMaterial(false);

function buildTube(pts, heat) {
  const n = pts.length;
  const pos = new Float32Array(n * RADIAL * 3), nor = new Float32Array(n * RADIAL * 3);
  const t = new THREE.Vector3(), nrm = new THREE.Vector3(), dir = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    t.subVectors(b, a).normalize();
    nrm.set(-t.y, t.x, 0);
    for (let j = 0; j < RADIAL; j++) {
      const ang = (j / RADIAL) * Math.PI * 2, c = Math.cos(ang), sn = Math.sin(ang), k = (i * RADIAL + j) * 3;
      pos[k] = pts[i].x + nrm.x * c * RADIUS; pos[k + 1] = pts[i].y + nrm.y * c * RADIUS; pos[k + 2] = pts[i].z + sn * RZ;
      dir.copy(nrm).multiplyScalar(c / RADIUS); dir.z += sn / RZ; dir.normalize();
      nor[k] = dir.x; nor[k + 1] = dir.y; nor[k + 2] = dir.z;
    }
  }
  const idx = [];
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < RADIAL; j++) {
    const a = i * RADIAL + j, b = i * RADIAL + ((j + 1) % RADIAL), c = (i + 1) * RADIAL + j, d = (i + 1) * RADIAL + ((j + 1) % RADIAL);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('aHeat', new THREE.BufferAttribute(heat, 1).setUsage(THREE.DynamicDrawUsage));
  g.setIndex(idx);
  return g;
}

// stroke timing: longer strokes take longer to burn along
let cursor = IGNITE_START;
const capGeo = new THREE.SphereGeometry(RADIUS, 20, 14);
const strokes = kanji.strokes.map((s, si) => {
  const pts = s.points.map(([x, y]) => new THREE.Vector3((x - cx) * S, -(y - cy) * S, 0));
  const dur = 0.35 + s.length * 0.012, start = cursor;
  cursor += dur + STROKE_GAP;
  const heat = new Float32Array(pts.length * RADIAL);
  const segs = pts.length - 1;
  const tIgn = pts.map((_, i) => start + invSmooth(i / segs) * dur); // when the flame front reaches each sample
  const tube = new THREE.Mesh(buildTube(pts, heat), bodyMat);
  const startCap = new THREE.Mesh(capGeo, glyphMaterial(true)), tip = new THREE.Mesh(capGeo, glyphMaterial(true));
  for (const m of [startCap, tip]) { m.scale.set(1, 1, DEPTH_RATIO); m.position.copy(pts[0]); }
  group.add(tube, startCap, tip);
  return { si, pts, dur, start, segs, heat, tIgn, tube, startCap, tip };
});
const BURN_END = cursor;
const allRings = [];
for (const s of strokes) s.pts.forEach((_, i) => allRings.push({ s, i, t: s.tIgn[i] }));
allRings.sort((a, b) => a.t - b.t);

function ringHeat(age, i, si, t) {
  if (age < 0) return 0;
  const ember = 0.40 + 0.08 * Math.sin(t * 1.9 + i * 0.06 + si * 1.9) + 0.03 * Math.sin(t * 6.1 + i * 0.11 + si);
  const hot = Math.exp(-age / 0.9);
  return clamp01(ember * (1 - hot) + hot);
}
function applyGlyph(t) {
  bodyMat.uniforms.uTime.value = t;
  for (const s of strokes) {
    const p = smooth((t - s.start) / s.dur);
    for (let i = 0; i <= s.segs; i++) {
      const h = ringHeat(t - s.tIgn[i], i, s.si, t);
      for (let j = 0; j < RADIAL; j++) s.heat[i * RADIAL + j] = h;
    }
    s.tube.geometry.attributes.aHeat.needsUpdate = true;
    const f = p * s.segs, k = Math.min(s.segs, Math.floor(f));
    s.tube.geometry.setDrawRange(0, k * RADIAL * 6);
    s.tube.visible = k > 0;
    s.startCap.visible = s.tip.visible = p > 0;
    s.startCap.material.uniforms.uCapHeat.value = ringHeat(t - s.tIgn[0], 0, s.si, t);
    const i0 = Math.min(s.segs, k), i1 = Math.min(s.segs, k + 1);
    s.tip.position.lerpVectors(s.pts[i0], s.pts[i1], f - k);
    s.tip.material.uniforms.uCapHeat.value = p < 1 ? 1.0 : ringHeat(t - s.tIgn[s.segs], s.segs, s.si, t);
  }
}

// ---------- particles: flames, embers, sparks (instanced camera-facing quads, additive) ----------
const pGeo = new THREE.InstancedBufferGeometry();
pGeo.index = new THREE.PlaneGeometry(1, 1).index;
pGeo.setAttribute('position', new THREE.PlaneGeometry(1, 1).getAttribute('position'));
const aOffset = new THREE.InstancedBufferAttribute(new Float32Array(MAX_P * 3), 3).setUsage(THREE.DynamicDrawUsage);
const aData = new THREE.InstancedBufferAttribute(new Float32Array(MAX_P * 4), 4).setUsage(THREE.DynamicDrawUsage); // age01, size, kind, seed
pGeo.setAttribute('aOffset', aOffset); pGeo.setAttribute('aData', aData);
pGeo.instanceCount = MAX_P;
const pMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    attribute vec3 aOffset; attribute vec4 aData;
    varying vec2 vUv; varying vec4 vData;
    void main(){
      vUv = position.xy * 2.0; vData = aData;
      vec4 mv = modelViewMatrix * vec4(aOffset, 1.0);
      mv.xy += position.xy * aData.y;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    uniform float uTime; varying vec2 vUv; varying vec4 vData;
    void main(){
      float d = length(vUv); if (d > 1.0) discard;
      float a = pow(1.0 - d, 2.0);
      float age = vData.x, kind = vData.z, seed = vData.w;
      vec3 col; float alpha;
      if (kind < 0.5) {            // flame: white-yellow -> orange -> red
        vec3 c0 = vec3(1.0, 0.92, 0.65), c1 = vec3(1.0, 0.5, 0.1), c2 = vec3(0.75, 0.12, 0.02);
        col = age < 0.35 ? mix(c0, c1, age / 0.35) : mix(c1, c2, (age - 0.35) / 0.65);
        alpha = a * (1.0 - age) * 0.55;
      } else if (kind < 1.5) {     // ember: flickering orange dot
        col = vec3(1.0, 0.55, 0.15);
        alpha = a * (1.0 - age) * (0.65 + 0.35 * sin(uTime * 12.0 + seed * 40.0));
      } else {                     // spark
        col = vec3(1.0, 0.9, 0.6);
        alpha = a * (1.0 - age) * 1.2;
      }
      gl_FragColor = vec4(col, alpha);
    }`,
});
const particles = new THREE.Mesh(pGeo, pMat);
particles.frustumCulled = false;
particles.renderOrder = 10;
group.add(particles);

const P = {
  vel: new Float32Array(MAX_P * 3), age: new Float32Array(MAX_P), life: new Float32Array(MAX_P),
  size0: new Float32Array(MAX_P), kind: new Float32Array(MAX_P), seed: new Float32Array(MAX_P),
  pos: aOffset.array, data: aData.array, next: 0,
};
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
let rnd = mulberry32(1234);
let acc = { flame: 0, ember: 0, front: 0, spark: 0 };

function resetSim() {
  rnd = mulberry32(1234);
  acc = { flame: 0, ember: 0, front: 0, spark: 0 };
  P.next = 0; P.age.fill(0); P.life.fill(0);
  for (let i = 0; i < MAX_P; i++) P.data[i * 4 + 1] = 0;
}
resetSim();

function spawn(kind, x, y, z, vx, vy, vz, life, size, ) {
  const i = P.next; P.next = (P.next + 1) % MAX_P;
  P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z;
  P.vel[i * 3] = vx; P.vel[i * 3 + 1] = vy; P.vel[i * 3 + 2] = vz;
  P.age[i] = 0; P.life[i] = life; P.size0[i] = size; P.kind[i] = kind; P.seed[i] = rnd();
}
function surfacePoint(s, i, spread) {
  const p = s.pts[i], a = rnd() * Math.PI * 2;
  return [p.x + Math.cos(a) * RADIUS * spread * (0.4 + rnd()), p.y + Math.sin(a) * RADIUS * 0.6 * rnd(), p.z + (rnd() - 0.5) * 2 * RZ];
}

function stepSim(t, dt) {
  // sources: every stroke sample the front has already passed
  let lo = 0, hi = allRings.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (allRings[m].t <= t) lo = m + 1; else hi = m; }
  const burned = lo;
  acc.flame += burned * FLAME_PER_RING * dt;
  acc.ember += burned * EMBER_PER_RING * dt;
  for (; acc.flame >= 1; acc.flame--) {
    const r = allRings[Math.floor(rnd() * burned)]; const [x, y, z] = surfacePoint(r.s, r.i, 1);
    spawn(0, x, y, z, (rnd() - 0.5) * 0.04, 0.12 + rnd() * 0.16, (rnd() - 0.5) * 0.03, 0.9 + rnd() * 0.8, 0.045 + rnd() * 0.04);
  }
  for (; acc.ember >= 1; acc.ember--) {
    const r = allRings[Math.floor(rnd() * burned)]; const [x, y, z] = surfacePoint(r.s, r.i, 1.5);
    spawn(1, x, y, z, (rnd() - 0.5) * 0.10, 0.06 + rnd() * 0.08, (rnd() - 0.5) * 0.06, 2.5 + rnd() * 2.0, 0.006 + rnd() * 0.004);
  }
  // moving flame fronts: bigger flames and a spray of sparks right at the tip of whichever stroke is being drawn
  acc.front += dt * FRONT_FLAMES; acc.spark += dt * FRONT_SPARKS;
  for (const s of strokes) {
    const p = (t - s.start) / s.dur;
    if (p <= 0 || p >= 1.05) continue;
    const tip = s.tip.position;
    for (let n = acc.front; n >= 1; n--) spawn(0, tip.x + (rnd() - 0.5) * RADIUS, tip.y, tip.z + (rnd() - 0.5) * RZ, (rnd() - 0.5) * 0.06, 0.14 + rnd() * 0.18, (rnd() - 0.5) * 0.05, 0.6 + rnd() * 0.5, 0.05 + rnd() * 0.035);
    for (let n = acc.spark; n >= 1; n--) {
      const a = rnd() * Math.PI * 2, sp = 0.15 + rnd() * 0.35;
      spawn(2, tip.x, tip.y, tip.z, Math.cos(a) * sp, 0.1 + rnd() * sp, (rnd() - 0.5) * sp, 0.35 + rnd() * 0.45, 0.006);
    }
  }
  if (acc.front >= 1) acc.front -= Math.floor(acc.front);
  if (acc.spark >= 1) acc.spark -= Math.floor(acc.spark);

  for (let i = 0; i < MAX_P; i++) {
    if (P.life[i] <= 0) continue;
    P.age[i] += dt;
    const a = P.age[i] / P.life[i];
    if (a >= 1) { P.life[i] = 0; P.data[i * 4 + 1] = 0; continue; }
    const k = P.kind[i], sd = P.seed[i];
    if (k < 0.5) {            // flame: buoyant, swaying, shrinking as it cools
      P.vel[i * 3 + 1] += 0.32 * dt;
      P.vel[i * 3] += Math.sin(t * 4 + sd * 20) * 0.12 * dt;
    } else if (k < 1.5) {     // ember: drifts and wanders
      P.vel[i * 3] += Math.sin(t * 2.5 + sd * 30) * 0.08 * dt;
      P.vel[i * 3 + 2] += Math.cos(t * 2.1 + sd * 17) * 0.06 * dt;
    } else {                  // spark: gravity pulls it back
      P.vel[i * 3 + 1] -= 0.5 * dt;
    }
    const drag = 1 - 0.6 * dt;
    P.vel[i * 3] *= drag; P.vel[i * 3 + 1] *= k < 1.5 ? drag : 1; P.vel[i * 3 + 2] *= drag;
    P.pos[i * 3] += P.vel[i * 3] * dt; P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
    const size = k < 0.5 ? P.size0[i] * (0.55 + 1.0 * Math.sin(Math.PI * Math.min(1, a * 0.9 + 0.05))) * (1 - 0.35 * a) : P.size0[i];
    const o = i * 4; P.data[o] = a; P.data[o + 1] = size; P.data[o + 2] = k; P.data[o + 3] = sd;
  }
  aOffset.needsUpdate = true; aData.needsUpdate = true;

  applyGlyph(t);
  // the fire lights the room: bloom follows how much of the glyph is burning, with a fast flicker
  const burn = Math.min(1, burned / allRings.length);
  const flicker = 0.85 + 0.15 * Math.sin(t * 13.0) * Math.sin(t * 7.3 + 1.0) + 0.08 * Math.sin(t * 31.0);
  bloomMat.opacity = (0.06 + 0.5 * burn) * flicker;
  bloom.scale.setScalar(0.8 + 0.45 * burn);
  pMat.uniforms.uTime.value = t;
}

// ---------- timing / replay ----------
let frozen = params.has('t') ? parseFloat(params.get('t')) : null; // ?t=2.5 freezes the timeline (used for screenshots)
let t0 = performance.now(), last = t0;
function simulateTo(t) {
  resetSim();
  const h = 1 / 60;
  for (let tau = 0; tau < t; tau += h) stepSim(tau, h);
  stepSim(t, 0);
}
function replay() { frozen = null; resetSim(); t0 = last = performance.now(); }
window.__setTime = (t) => { frozen = t; simulateTo(t); };
if (frozen !== null) simulateTo(frozen);
window.__ready = true;
window.__dbg = { camera, controls };

let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6 && !renderer.xr.isPresenting) replay();
  down = null;
});
addEventListener('keydown', (e) => { if (e.key === 'r' || e.key === ' ') replay(); });

// ---------- XR ----------
let placed = true, placeFrames = 0;
function updateHands(session) {
  const any = [...session.inputSources].some((s) => s.hand);
  state.hands = any ? '<span class="ok">tracked</span>' : 'not detected yet';
  renderStatus();
}
async function startSession(mode) {
  try {
    const session = await navigator.xr.requestSession(mode, { optionalFeatures: ['local-floor', 'hand-tracking'] });
    renderer.xr.setReferenceSpaceType('local-floor');
    await renderer.xr.setSession(session);
  } catch (e) {
    state.note = `Could not start ${mode}: ${e && e.message ? e.message : e}`;
    renderStatus();
  }
}
renderer.xr.addEventListener('sessionstart', () => {
  const session = renderer.xr.getSession();
  const passthrough = session.environmentBlendMode && session.environmentBlendMode !== 'opaque';
  scene.background = passthrough ? null : BG;   // in AR the real room is the backdrop
  renderer.setClearAlpha(passthrough ? 0 : 1);
  controls.enabled = false;
  placed = false; placeFrames = 0; group.visible = false;
  state.note = ''; state.hands = 'looking…'; renderStatus();
  session.addEventListener('select', replay);
  session.addEventListener('inputsourceschange', () => updateHands(session));
  updateHands(session);
});
renderer.xr.addEventListener('sessionend', () => {
  scene.background = BG;
  group.visible = true; group.position.copy(DESKTOP_POS); group.rotation.set(0, 0, 0);
  controls.enabled = true; placed = true;
  state.hands = 'n/a (enter a session)'; renderStatus();
});

// put the glyph DIST metres in front of where the viewer is looking, at eye height, facing them
function tryPlace(frame) {
  placeFrames++;
  const pose = frame && frame.getViewerPose(renderer.xr.getReferenceSpace());
  if (!pose || placeFrames < 10) return;
  const p = pose.transform.position, o = pose.transform.orientation;
  if (p.y < 0.3 && placeFrames < 60) return;
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(o.x, o.y, o.z, o.w));
  dir.y = 0; if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1); dir.normalize();
  group.position.set(p.x + dir.x * DIST, p.y, p.z + dir.z * DIST);
  group.lookAt(p.x, p.y, p.z);
  group.visible = true; placed = true;
  replay();
}

async function detect() {
  if (!navigator.xr) { state.vr = false; state.ar = false; renderStatus(); return; }
  for (const [mode, key, label] of [['immersive-vr', 'vr', 'Enter VR'], ['immersive-ar', 'ar', 'Enter AR']]) {
    try { state[key] = await navigator.xr.isSessionSupported(mode); } catch (e) { state[key] = false; state.note = `${mode}: ${e.message}`; }
    if (state[key]) {
      const b = document.createElement('button'); b.textContent = label; b.onclick = () => startSession(mode); buttonsEl.appendChild(b);
    }
  }
  renderStatus();
}
detect();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
});

renderer.setAnimationLoop((now, frame) => {
  if (renderer.xr.isPresenting && !placed) tryPlace(frame);
  if (frozen === null) {
    const nowMs = performance.now();
    const dt = Math.min(0.05, (nowMs - last) / 1000); last = nowMs;
    stepSim((nowMs - t0) / 1000, dt);
  }
  if (controls.enabled) controls.update();
  renderer.render(scene, camera);
});
