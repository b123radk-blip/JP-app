import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';

// ---------- tunables ----------
const GLYPH_HEIGHT = 0.30;     // metres, glyph bounding-box height
const STROKE_WIDTH_UNITS = 5;  // KanjiVG units (the source glyph uses 3, this is bolder for VR)
const DIST = 1.2;              // metres in front of the viewer
const DESKTOP_POS = new THREE.Vector3(0, 1.4, -DIST);

const DAWN = 2.0;              // seconds: sky shifts, sun rises
const STROKE_START = 2.0;
const STROKE_DUR = 0.75;
const IDLE_START = STROKE_START + 4 * STROKE_DUR; // 5.0 s

const SUN_R = 0.2, SUN_Z = -0.3, SUN_Y_HIDDEN = -0.42, SUN_Y_UP = 0.0;
const HILL_Z = -0.18;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, DESKTOP_POS.y, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(DESKTOP_POS);
controls.enableDamping = true;
controls.update();

// sky dome (VR / desktop only)
const skyUniforms = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } };
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(40, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vDir; uniform vec3 top; uniform vec3 horizon; void main(){ float h = smoothstep(-0.05, 0.75, vDir.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0); }',
  }));
sky.renderOrder = -10; sky.frustumCulled = false;
scene.add(sky);

// everything the viewer looks at lives in this group (placed in front of the viewer in XR)
const group = new THREE.Group();
group.position.copy(DESKTOP_POS);
scene.add(group);

// hill silhouette the sun rises behind (VR / desktop only)
const hillShape = new THREE.Shape();
hillShape.moveTo(-3, -2.5);
for (let i = 0; i <= 60; i++) { const x = -3 + (6 * i) / 60; hillShape.lineTo(x, -0.10 - 0.08 * x * x); }
hillShape.lineTo(3, -2.5);
const hillMat = new THREE.MeshBasicMaterial({ color: 0x05060f });
const hill = new THREE.Mesh(new THREE.ShapeGeometry(hillShape), hillMat);
hill.position.z = HILL_Z;
group.add(hill);

// sun: disc + additive glow + rays
function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
function rayTexture() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 256;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 256, 0, 0); v.addColorStop(0, 'rgba(255,255,255,.9)'); v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v; g.fillRect(0, 0, 32, 256);
  g.globalCompositeOperation = 'destination-in';
  const h = g.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = h; g.fillRect(0, 0, 32, 256);
  return new THREE.CanvasTexture(c);
}
const sun = new THREE.Group();
sun.position.set(0, SUN_Y_HIDDEN, SUN_Z);
group.add(sun);
const discMat = new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true });
const disc = new THREE.Mesh(new THREE.CircleGeometry(SUN_R, 64), discMat);
sun.add(disc);
const glowMat = new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0xff9a4a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), glowMat);
glow.position.z = -0.01;
sun.add(glow);
const rays = new THREE.Group(); rays.position.z = -0.005; sun.add(rays);
const rayMat = new THREE.MeshBasicMaterial({ map: rayTexture(), color: 0xffb070, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
const rayGeo = new THREE.PlaneGeometry(0.07, 0.8).translate(0, SUN_R + 0.4 - 0.02, 0);
for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(rayGeo, rayMat); m.rotation.z = (i / 10) * Math.PI * 2; rays.add(m); }

// light: one point light at the sun (rim light) + a constant soft fill so the glyph stays readable
const sunLight = new THREE.PointLight(0xffa060, 0, 4, 1.5);
sunLight.position.set(0, 0, SUN_Z);
group.add(sunLight);
scene.add(new THREE.HemisphereLight(0xfff4e6, 0xd9b090, 2.4));

// ---------- kanji strokes ----------
const kanji = await (await fetch('./data/kanji-65e5.json')).json();
const bb = kanji.bbox;
const S = GLYPH_HEIGHT / (bb.maxY - bb.minY);
const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
const RADIUS = (STROKE_WIDTH_UNITS * S) / 2;
const RADIAL = 14;

const strokeMat = new THREE.MeshStandardMaterial({ color: 0xfff6e6, roughness: 0.45, metalness: 0, emissive: 0xffe6c8, emissiveIntensity: 0 });
const capGeo = new THREE.SphereGeometry(RADIUS, 20, 14);

// Extrude a circular cross-section along a planar centre-line (the strokes are flat in x/y).
function buildTube(pts) {
  const n = pts.length;
  const pos = new Float32Array(n * RADIAL * 3), nor = new Float32Array(n * RADIAL * 3);
  const t = new THREE.Vector3(), nrm = new THREE.Vector3(), dir = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    t.subVectors(b, a).normalize();
    nrm.set(-t.y, t.x, 0);
    for (let j = 0; j < RADIAL; j++) {
      const ang = (j / RADIAL) * Math.PI * 2;
      dir.copy(nrm).multiplyScalar(Math.cos(ang)); dir.z += Math.sin(ang);
      const k = (i * RADIAL + j) * 3;
      pos[k] = pts[i].x + dir.x * RADIUS; pos[k + 1] = pts[i].y + dir.y * RADIUS; pos[k + 2] = pts[i].z + dir.z * RADIUS;
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
  g.setIndex(idx);
  return g;
}

const strokes = kanji.strokes.map((s) => {
  const pts = s.points.map(([x, y]) => new THREE.Vector3((x - cx) * S, -(y - cy) * S, 0));
  const holder = new THREE.Group();
  const tube = new THREE.Mesh(buildTube(pts), strokeMat);
  const startCap = new THREE.Mesh(capGeo, strokeMat);
  const tip = new THREE.Mesh(capGeo, strokeMat);
  startCap.position.copy(pts[0]); tip.position.copy(pts[0]);
  holder.add(tube, startCap, tip);
  group.add(holder);
  return { pts, tube, startCap, tip, segs: pts.length - 1 };
});

function setStrokeProgress(s, p) {
  s.startCap.visible = s.tip.visible = p > 0;
  const f = p * s.segs, k = Math.min(s.segs, Math.floor(f));
  s.tube.geometry.setDrawRange(0, k * RADIAL * 6);
  s.tube.visible = k > 0;
  const i0 = Math.min(s.segs, k), i1 = Math.min(s.segs, k + 1);
  s.tip.position.lerpVectors(s.pts[i0], s.pts[i1], f - k);
}

// ---------- timeline ----------
const SKY_TOP0 = new THREE.Color(0x070a1f), SKY_TOP1 = new THREE.Color(0x2a3f7a);
const SKY_HOR0 = new THREE.Color(0x1b1240), SKY_HOR1 = new THREE.Color(0xff8a3d);
const HILL0 = new THREE.Color(0x05060f), HILL1 = new THREE.Color(0x1a0f1c);
let passthrough = false;

function applyTime(t) {
  const dawn = smooth(t / DAWN);
  skyUniforms.top.value.lerpColors(SKY_TOP0, SKY_TOP1, dawn);
  skyUniforms.horizon.value.lerpColors(SKY_HOR0, SKY_HOR1, dawn);
  hillMat.color.lerpColors(HILL0, HILL1, dawn);
  sun.position.y = lerp(SUN_Y_HIDDEN, SUN_Y_UP, dawn);
  const fade = passthrough ? dawn : 1;           // no hill in passthrough, so fade the sun in instead
  discMat.opacity = fade;
  glowMat.opacity = fade * (0.35 + 0.2 * dawn);
  sunLight.intensity = 1.4 * dawn;
  strokeMat.emissiveIntensity = 0.55 * dawn;
  strokes.forEach((s, i) => setStrokeProgress(s, smooth((t - (STROKE_START + i * STROKE_DUR)) / STROKE_DUR)));
  const idle = Math.max(0, t - IDLE_START);
  const pulse = 1 + 0.05 * Math.sin(idle * 1.6) * smooth(idle);
  glow.scale.setScalar(pulse * (0.7 + 0.5 * dawn));
  disc.scale.setScalar(1 + 0.012 * Math.sin(idle * 1.6) * smooth(idle));
  rayMat.opacity = 0.22 * smooth((t - 1.0) / 2.0) * fade;
  rays.rotation.z = t * 0.04;
}

// ---------- timing / replay ----------
const params = new URLSearchParams(location.search);
let frozen = params.has('t') ? parseFloat(params.get('t')) : null; // ?t=2.5 freezes the timeline (used for screenshots)
let t0 = performance.now();
function replay() { t0 = performance.now(); if (frozen !== null) frozen = null; }
window.__setTime = (t) => { frozen = t; };
window.__ready = true;

// desktop: click (without dragging) or R / Space replays
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
  passthrough = session.environmentBlendMode && session.environmentBlendMode !== 'opaque';
  sky.visible = hill.visible = !passthrough;
  renderer.setClearAlpha(passthrough ? 0 : 1);
  controls.enabled = false;
  placed = false; placeFrames = 0; group.visible = false;
  state.note = ''; state.hands = 'looking…'; renderStatus();
  session.addEventListener('select', replay);
  session.addEventListener('inputsourceschange', () => updateHands(session));
  updateHands(session);
});
renderer.xr.addEventListener('sessionend', () => {
  passthrough = false; sky.visible = hill.visible = true;
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
  if (p.y < 0.3 && placeFrames < 60) return; // wait for a plausible local-floor eye height
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(o.x, o.y, o.z, o.w));
  dir.y = 0; if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1); dir.normalize();
  group.position.set(p.x + dir.x * DIST, p.y, p.z + dir.z * DIST);
  group.lookAt(p.x, p.y, p.z);
  group.visible = true; placed = true; t0 = performance.now(); frozen = null;
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
  const t = frozen !== null ? frozen : (performance.now() - t0) / 1000;
  applyTime(t);
  if (controls.enabled) controls.update();
  renderer.render(scene, camera);
});
