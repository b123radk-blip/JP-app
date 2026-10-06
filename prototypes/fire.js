// 火 (fire) as a small "card": the kanji burns itself into existence stroke by stroke (with its reading and meaning),
// then an example sentence appears with the SAME fire effect re-used on the 火 inside it (no stroke order there).
// The fire is a reusable component (createFireGlyph); this file builds two of them with different settings.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';

// ---------- tunables ----------
const GLYPH_HEIGHT = 0.30;      // metres, the big glyph's bounding-box height
const STROKE_WIDTH_UNITS = 6.5; // KanjiVG units
const DEPTH_RATIO = 1.6;
const DIST = 1.2;               // metres in front of the viewer in XR
const DESKTOP_POS = new THREE.Vector3(0, 1.4, -DIST);
const CARD_Y = 0.10;            // lifts the whole card so its middle sits near eye height

// big glyph timing / look
const IGNITE_START = 0.5;       // seconds of darkness before the first stroke is lit
const STROKE_GAP = 0.06;
const STROKE_SPEED = 0.6;       // multiplies every stroke's burn time (1 = the first version)
const FLAME_PER_RING = 1.0;     // flames per second per burning stroke sample
const EMBER_PER_RING = 0.07;
const FRONT_FLAMES = 90, FRONT_SPARKS = 60; // per second at each moving flame front

// card content and timeline (seconds since the page started / was re-ignited)
const READING = 'ひ';           // furigana on the big 火
const MEANING = 'fire';
const SENTENCE_EN = 'Fire is hot.';
const SENTENCE_JP = ['火', 'は', '熱', 'い', '。']; // 火は熱い。  slot 0 is the live fire glyph, the rest is text
const FURIGANA = { 0: 'ひ', 2: 'あつ' };           // slot -> reading shown above it
const MEANING_DELAY = 0.9;      // after the last stroke
const STAGE2_DELAY = 1.9;       // sentence appears this long after the last stroke
const SAY_SENTENCE_DELAY = 0.7; // sentence audio starts this long after the sentence appears
const SENTENCE_AUDIO_LEN = 1.1; // seconds (audio/fire-is-hot.mp3 is 1.08 s)

const params = new URLSearchParams(location.search);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const invSmooth = (y) => 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(y)) / 3);
const FONTS = '"Noto Sans CJK JP","Noto Sans JP","Hiragino Sans","Yu Gothic",Meiryo,sans-serif';

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

const group = new THREE.Group();   // placed in front of the viewer in XR
group.position.copy(DESKTOP_POS);
scene.add(group);
const card = new THREE.Group();
card.position.y = CARD_Y;
group.add(card);

function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// ---------- the reusable fire glyph ----------
const kanji = await (await fetch('../data/kanji-706b.json')).json();
const RADIAL = 14;
const mulberry32 = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// opts: glyphHeight (m), maxParticles, density (scales how much fire), parallel (all strokes ignite at once: no stroke order), seed
function createFireGlyph({ glyphHeight, maxParticles, density = 1, parallel = false, seed = 1 }) {
  const bb = kanji.bbox;
  const S = glyphHeight / (bb.maxY - bb.minY);
  const K = glyphHeight / GLYPH_HEIGHT;             // everything physical (speeds, sizes) scales with the glyph
  const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
  const RADIUS = (STROKE_WIDTH_UNITS * S) / 2, RZ = RADIUS * DEPTH_RATIO;
  const root = new THREE.Group();

  // warm light bloom behind the glyph: the fire lighting the room (additive, flickers with the fire)
  const bloomMat = new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0xff6a1a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const bloom = new THREE.Mesh(new THREE.PlaneGeometry(1.5 * K, 1.5 * K), bloomMat);
  bloom.position.z = -0.35 * K;
  root.add(bloom);

  // charcoal body whose emission follows a per-vertex heat value (black-body-ish ramp)
  const glyphMaterial = (cap) => new THREE.ShaderMaterial({
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
        float flick = 0.94 + 0.06 * sin(uTime * 9.0 + vP.x * 12.0 / ${(K).toFixed(4)} + vP.y * 9.0 / ${(K).toFixed(4)});
        float h = clamp(vHeat * flick, 0.0, 1.0);
        float fres = pow(1.0 - abs(dot(n, v)), 2.0);
        vec3 col = uBase * diff * (1.0 - h) + ramp(h) * (1.1 + 0.7 * fres);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
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

  // stroke timing: sequential (longer strokes take longer) or, for `parallel`, every stroke at once
  let cursor = IGNITE_START;
  const capGeo = new THREE.SphereGeometry(RADIUS, 20, 14);
  const strokes = kanji.strokes.map((s, si) => {
    const pts = s.points.map(([x, y]) => new THREE.Vector3((x - cx) * S, -(y - cy) * S, 0));
    const dur = parallel ? 0.4 : (0.35 + s.length * 0.012) * STROKE_SPEED;
    const start = parallel ? 0 : cursor;
    cursor += dur + STROKE_GAP;
    const heat = new Float32Array(pts.length * RADIAL);
    const segs = pts.length - 1;
    const tIgn = pts.map((_, i) => start + invSmooth(i / segs) * dur); // when the flame front reaches each sample
    const tube = new THREE.Mesh(buildTube(pts, heat), bodyMat);
    const startCap = new THREE.Mesh(capGeo, glyphMaterial(true)), tip = new THREE.Mesh(capGeo, glyphMaterial(true));
    for (const m of [startCap, tip]) { m.scale.set(1, 1, DEPTH_RATIO); m.position.copy(pts[0]); }
    root.add(tube, startCap, tip);
    return { si, pts, dur, start, segs, heat, tIgn, tube, startCap, tip };
  });
  const strokesEnd = Math.max(...strokes.map((s) => s.start + s.dur)); // the last stroke has finished
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

  // particles: flames, embers, sparks (instanced camera-facing quads, additive)
  const pGeo = new THREE.InstancedBufferGeometry();
  pGeo.index = new THREE.PlaneGeometry(1, 1).index;
  pGeo.setAttribute('position', new THREE.PlaneGeometry(1, 1).getAttribute('position'));
  const aOffset = new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const aData = new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 4), 4).setUsage(THREE.DynamicDrawUsage); // age01, size, kind, seed
  pGeo.setAttribute('aOffset', aOffset); pGeo.setAttribute('aData', aData);
  pGeo.instanceCount = maxParticles;
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
          alpha = a * (1.0 - age) * 0.46;
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
  root.add(particles);

  const P = {
    vel: new Float32Array(maxParticles * 3), age: new Float32Array(maxParticles), life: new Float32Array(maxParticles),
    size0: new Float32Array(maxParticles), kind: new Float32Array(maxParticles), seed: new Float32Array(maxParticles),
    pos: aOffset.array, data: aData.array, next: 0,
  };
  let rnd, acc;
  function reset() {
    rnd = mulberry32(seed);
    acc = { flame: 0, ember: 0, front: 0, spark: 0 };
    P.next = 0; P.age.fill(0); P.life.fill(0);
    for (let i = 0; i < maxParticles; i++) P.data[i * 4 + 1] = 0;
  }
  reset();

  function spawn(kind, x, y, z, vx, vy, vz, life, size) {
    const i = P.next; P.next = (P.next + 1) % maxParticles;
    P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z;
    P.vel[i * 3] = vx * K; P.vel[i * 3 + 1] = vy * K; P.vel[i * 3 + 2] = vz * K;
    P.age[i] = 0; P.life[i] = life; P.size0[i] = size * K; P.kind[i] = kind; P.seed[i] = rnd();
  }
  function surfacePoint(s, i, spread) {
    const p = s.pts[i], a = rnd() * Math.PI * 2;
    return [p.x + Math.cos(a) * RADIUS * spread * (0.4 + rnd()), p.y + Math.sin(a) * RADIUS * 0.6 * rnd(), p.z + (rnd() - 0.5) * 2 * RZ];
  }

  function step(t, dt) {
    let lo = 0, hi = allRings.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (allRings[m].t <= t) lo = m + 1; else hi = m; }
    const burned = lo;
    acc.flame += burned * FLAME_PER_RING * density * dt;
    acc.ember += burned * EMBER_PER_RING * density * dt;
    for (; acc.flame >= 1; acc.flame--) {
      const r = allRings[Math.floor(rnd() * burned)]; const [x, y, z] = surfacePoint(r.s, r.i, 1);
      spawn(0, x, y, z, (rnd() - 0.5) * 0.04, 0.12 + rnd() * 0.16, (rnd() - 0.5) * 0.03, 0.9 + rnd() * 0.8, 0.04 + rnd() * 0.035);
    }
    for (; acc.ember >= 1; acc.ember--) {
      const r = allRings[Math.floor(rnd() * burned)]; const [x, y, z] = surfacePoint(r.s, r.i, 1.5);
      spawn(1, x, y, z, (rnd() - 0.5) * 0.10, 0.06 + rnd() * 0.08, (rnd() - 0.5) * 0.06, 2.5 + rnd() * 2.0, 0.006 + rnd() * 0.004);
    }
    // moving flame fronts: bigger flames and a spray of sparks at the tip of whichever stroke is being lit
    acc.front += dt * FRONT_FLAMES * density; acc.spark += dt * FRONT_SPARKS * density;
    for (const s of strokes) {
      const p = (t - s.start) / s.dur;
      if (p <= 0 || p >= 1.05) continue;
      const tip = s.tip.position;
      for (let n = acc.front; n >= 1; n--) spawn(0, tip.x + (rnd() - 0.5) * RADIUS, tip.y, tip.z + (rnd() - 0.5) * RZ, (rnd() - 0.5) * 0.06, 0.14 + rnd() * 0.18, (rnd() - 0.5) * 0.05, 0.6 + rnd() * 0.5, 0.045 + rnd() * 0.03);
      for (let n = acc.spark; n >= 1; n--) {
        const a = rnd() * Math.PI * 2, sp = 0.15 + rnd() * 0.35;
        spawn(2, tip.x, tip.y, tip.z, Math.cos(a) * sp, 0.1 + rnd() * sp, (rnd() - 0.5) * sp, 0.35 + rnd() * 0.45, 0.006);
      }
    }
    if (acc.front >= 1) acc.front -= Math.floor(acc.front);
    if (acc.spark >= 1) acc.spark -= Math.floor(acc.spark);

    for (let i = 0; i < maxParticles; i++) {
      if (P.life[i] <= 0) continue;
      P.age[i] += dt;
      const a = P.age[i] / P.life[i];
      if (a >= 1) { P.life[i] = 0; P.data[i * 4 + 1] = 0; continue; }
      const k = P.kind[i], sd = P.seed[i];
      if (k < 0.5) {            // flame: buoyant, swaying, shrinking as it cools
        P.vel[i * 3 + 1] += 0.32 * K * dt;
        P.vel[i * 3] += Math.sin(t * 4 + sd * 20) * 0.12 * K * dt;
      } else if (k < 1.5) {     // ember: drifts and wanders
        P.vel[i * 3] += Math.sin(t * 2.5 + sd * 30) * 0.08 * K * dt;
        P.vel[i * 3 + 2] += Math.cos(t * 2.1 + sd * 17) * 0.06 * K * dt;
      } else {                  // spark: gravity pulls it back
        P.vel[i * 3 + 1] -= 0.5 * K * dt;
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
    bloomMat.opacity = (0.06 + 0.42 * burn) * flicker * (density < 1 ? 0.7 : 1);
    bloom.scale.setScalar(0.8 + 0.45 * burn);
    pMat.uniforms.uTime.value = t;
  }
  return { group: root, strokesEnd, step, reset };
}

// ---------- text planes (canvas textures drawn on top of the fire) ----------
function textPlane(widthM, heightM, pxW, pxH, draw) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.textBaseline = 'middle';
  draw(g);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(widthM, heightM), mat);
  mesh.renderOrder = 20;
  return { mesh, mat };
}
function glowText(g, txt, x, y, font, fill = '#fff4de', glow = 'rgba(255,150,60,0.8)') {
  g.font = font;
  g.lineJoin = 'round'; g.lineWidth = 9; g.strokeStyle = 'rgba(8,6,4,0.9)'; g.strokeText(txt, x, y);   // dark outline: legible over fire and over a bright room
  g.shadowColor = glow; g.shadowBlur = 22; g.fillStyle = fill; g.fillText(txt, x, y);
  g.shadowBlur = 0;
}

// ---------- the card ----------
const big = createFireGlyph({ glyphHeight: GLYPH_HEIGHT, maxParticles: 1800, density: 1, parallel: false, seed: 1234 });
card.add(big.group);

// furigana over the big 火 (with a faint dark backing: it floats over bright flames)
const FURI_Y = GLYPH_HEIGHT / 2 + 0.115;
const furiBackMat = new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
const furiBack = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), furiBackMat);
furiBack.renderOrder = 19; furiBack.position.set(0, FURI_Y, 0.03);
const furi = textPlane(0.14, 0.14, 256, 256, (g) => { glowText(g, READING, 128, 138, `700 190px ${FONTS}`); glowText(g, READING, 128, 138, `700 190px ${FONTS}`); });
furi.mesh.position.set(0, FURI_Y, 0.04);
card.add(furiBack, furi.mesh);

// meaning of the kanji, under it
const MEANING_Y = -GLYPH_HEIGHT / 2 - 0.075;
const meaning = textPlane(0.4, 0.08, 512, 102, (g) => glowText(g, MEANING, 256, 56, '600 72px system-ui, sans-serif', '#ffe9c9'));
meaning.mesh.position.set(0, MEANING_Y, 0.04);
card.add(meaning.mesh);

// example sentence: slot 0 is a live second fire glyph (same component, no stroke order), the rest is text
const CELL = 0.12, CELL_PX = 128, FURI_PX = 56, ROW_PX = FURI_PX + CELL_PX;
const ROW_Y = -0.40, ROW_W = CELL * SENTENCE_JP.length, ROW_H = (ROW_PX / CELL_PX) * CELL;
const slotX = (i) => (i - (SENTENCE_JP.length - 1) / 2) * CELL;
const row = textPlane(ROW_W, ROW_H, CELL_PX * SENTENCE_JP.length, ROW_PX, (g) => {
  SENTENCE_JP.forEach((ch, i) => {
    const x = (i + 0.5) * CELL_PX;
    if (i > 0) glowText(g, ch, x, FURI_PX + CELL_PX * 0.5, `700 108px ${FONTS}`);
    if (FURIGANA[i]) glowText(g, FURIGANA[i], x, FURI_PX * 0.5 + 2, `600 40px ${FONTS}`, '#ffe9c9');
  });
});
row.mesh.position.set(0, ROW_Y, 0.04);
const mini = createFireGlyph({ glyphHeight: 0.095, maxParticles: 700, density: 0.8, parallel: true, seed: 99 });
mini.group.position.set(slotX(0), ROW_Y + ROW_H / 2 - (FURI_PX + CELL_PX * 0.5) / CELL_PX * CELL, 0.0); // centre of slot 0's character cell
mini.group.visible = false;
card.add(row.mesh, mini.group);

const english = textPlane(0.6, 0.09, 640, 96, (g) => glowText(g, SENTENCE_EN, 320, 52, '600 58px system-ui, sans-serif', '#ffe9c9'));
english.mesh.position.set(0, ROW_Y - ROW_H / 2 - 0.045, 0.04);
card.add(english.mesh);

// ---------- timeline ----------
const T_STROKES_END = big.strokesEnd;
const T_MEANING = T_STROKES_END + MEANING_DELAY;
const T_STAGE2 = T_STROKES_END + STAGE2_DELAY;
const T_SAY_SENTENCE = T_STAGE2 + SAY_SENTENCE_DELAY;
const T_ENGLISH = T_SAY_SENTENCE + SENTENCE_AUDIO_LEN + 0.4;

function stepAll(t, dt) {
  big.step(t, dt);
  const live = t >= T_STAGE2;
  mini.group.visible = live;
  if (live) mini.step(t - T_STAGE2, dt);        // the sentence's fire runs on its own clock, starting when the sentence appears
  const f = smooth((t - T_STROKES_END) / 0.7);
  furi.mat.opacity = f; furiBackMat.opacity = 0.3 * f;
  furi.mesh.position.y = FURI_Y - 0.02 * (1 - f);
  meaning.mat.opacity = smooth((t - T_MEANING) / 0.6);
  row.mat.opacity = smooth((t - T_STAGE2) / 0.6);
  english.mat.opacity = smooth((t - T_ENGLISH) / 0.6);
}

// ---------- audio (placeholder voice, see scripts/make-audio.py) ----------
function makeClip(url) {
  const a = new Audio(url); a.preload = 'auto';
  a.addEventListener('error', () => { state.note = `Could not load ${url}`; renderStatus(); });
  return a;
}
const sayKanji = makeClip('../audio/hi.mp3'), saySentence = makeClip('../audio/fire-is-hot.mp3');
let soundOn = true, saidKanji = false, saidSentence = false;
function play(a) {
  if (!soundOn) return;
  a.currentTime = 0;
  a.play().catch(() => { state.note = 'Sound is blocked until you tap the page once (browser autoplay rule).'; renderStatus(); });
}
const soundBtn = document.createElement('button');
soundBtn.textContent = 'Sound: on';
soundBtn.onclick = () => { soundOn = !soundOn; soundBtn.textContent = 'Sound: ' + (soundOn ? 'on' : 'off'); state.note = ''; renderStatus(); };
buttonsEl.appendChild(soundBtn);

// ---------- timing / replay ----------
let frozen = params.has('t') ? parseFloat(params.get('t')) : null; // ?t=2.5 freezes the timeline (used for screenshots)
let t0 = performance.now(), last = t0;
function resetAll() { big.reset(); mini.reset(); }
function simulateTo(t) {
  resetAll();
  const h = 1 / 60;
  for (let tau = 0; tau < t; tau += h) stepAll(tau, h);
  stepAll(t, 0);
}
function replay() { frozen = null; saidKanji = saidSentence = false; resetAll(); t0 = last = performance.now(); }
window.__setTime = (t) => { frozen = t; simulateTo(t); };
if (frozen !== null) simulateTo(frozen);
window.__ready = true;
window.__dbg = { camera, controls, sayKanji, saySentence, times: { T_STROKES_END, T_MEANING, T_STAGE2, T_SAY_SENTENCE, T_ENGLISH } };

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

// put the card DIST metres in front of where the viewer is looking, at eye height, facing them
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
    const t = (nowMs - t0) / 1000;
    stepAll(t, dt);
    if (!saidKanji && t >= T_STROKES_END) { saidKanji = true; play(sayKanji); }
    if (!saidSentence && t >= T_SAY_SENTENCE) { saidSentence = true; play(saySentence); }
  }
  if (controls.enabled) controls.update();
  renderer.render(scene, camera);
});
