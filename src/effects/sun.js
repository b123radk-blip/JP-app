// 日: a sunrise behind the kanji. Dawn shifts the sky, the sun climbs out from behind a hill, the strokes draw, then it sways gently.
import * as THREE from 'three';
import { normalizeStrokes, strokeSchedule } from '../kanji/tube.js';
import { createGlowGlyph, PALETTES } from './glow-glyph.js';
import { disposeObject } from '../core/dispose.js';

const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const DAWN = 2.0, SWAY = 0.30;
const SUN_R = 0.2, SUN_Z = -0.9, SUN_SCALE = 1.4, SUN_Y_HIDDEN = -0.59, SUN_Y_UP = 0.0, HILL_Z = -0.6, HILL_SCALE = 1.3;
const SKY_TOP0 = new THREE.Color(0x070a1f), SKY_TOP1 = new THREE.Color(0x2a3f7a);
const SKY_HOR0 = new THREE.Color(0x1b1240), SKY_HOR1 = new THREE.Color(0xff8a3d);
const HILL0 = new THREE.Color(0x05060f), HILL1 = new THREE.Color(0x1a0f1c);

function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
function rayTexture() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 256;
  const g = c.getContext('2d'), v = g.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,.9)'); v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v; g.fillRect(0, 0, 32, 256);
  g.globalCompositeOperation = 'destination-in';
  const h = g.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = h; g.fillRect(0, 0, 32, 256);
  return new THREE.CanvasTexture(c);
}

export function create({ kanji, glyphHeight }) {
  const group = new THREE.Group();
  const { S, strokes } = normalizeStrokes(kanji, glyphHeight);
  const sched = strokeSchedule(strokes, { start: 1.6 });
  let passthrough = false;

  const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vDir; uniform vec3 top; uniform vec3 horizon; void main(){ float h = smoothstep(-0.05, 0.75, vDir.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0); }',
  }));
  sky.renderOrder = -10; sky.frustumCulled = false;

  const hillShape = new THREE.Shape(); hillShape.moveTo(-3, -2.5);
  for (let i = 0; i <= 60; i++) { const x = -3 + (6 * i) / 60; hillShape.lineTo(x, -0.10 - 0.08 * x * x); }
  hillShape.lineTo(3, -2.5);
  const hillMat = new THREE.MeshBasicMaterial({ color: HILL0 });
  const hill = new THREE.Mesh(new THREE.ShapeGeometry(hillShape), hillMat);
  hill.position.z = HILL_Z; hill.scale.setScalar(HILL_SCALE);

  const sun = new THREE.Group(); sun.position.set(0, SUN_Y_HIDDEN, SUN_Z); sun.scale.setScalar(SUN_SCALE);
  const discMat = new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(SUN_R, 64), discMat);
  const glowMat = new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0xff9a4a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat); glow.position.z = -0.01;
  const rays = new THREE.Group(); rays.position.z = -0.005;
  const rayMat = new THREE.MeshBasicMaterial({ map: rayTexture(), color: 0xffb070, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const rayGeo = new THREE.PlaneGeometry(0.07, 0.8).translate(0, SUN_R + 0.4 - 0.02, 0);
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(rayGeo, rayMat); m.rotation.z = (i / 10) * Math.PI * 2; rays.add(m); }
  sun.add(disc, glow, rays);

  // lights live in the group so they follow its placement: warm rim from the sun, key from front-left-above, soft fill
  const rim = new THREE.PointLight(0xffa060, 0, 6, 1.5); rim.position.set(0, 0.15, -0.5);
  const key = new THREE.PointLight(0xffffff, 0, 8, 2); key.position.set(-0.7, 0.6, 0.9);
  const fill = new THREE.HemisphereLight(0xfff0dd, 0x6a4a3a, 0.9);

  const glyph = createGlowGlyph(strokes, S, PALETTES.cyan);
  group.add(sky, hill, sun, rim, key, fill, glyph.group);

  function applyTime(t) {
    const dawn = smooth(t / DAWN), fade = passthrough ? dawn : 1;
    skyU.top.value.lerpColors(SKY_TOP0, SKY_TOP1, dawn); skyU.horizon.value.lerpColors(SKY_HOR0, SKY_HOR1, dawn);
    hillMat.color.lerpColors(HILL0, HILL1, dawn);
    sun.position.y = lerp(SUN_Y_HIDDEN, SUN_Y_UP, dawn);
    discMat.opacity = fade; glowMat.opacity = fade * (0.35 + 0.2 * dawn);
    rim.intensity = 3.0 * dawn; key.intensity = 5.0 * smooth((t - 0.6) / 1.4);
    sched.items.forEach((it, i) => glyph.setStrokeProgress(i, smooth((t - it.start) / it.dur)));
    const idle = Math.max(0, t - sched.end), pulse = Math.sin(idle * 1.6) * smooth(idle);
    glow.scale.setScalar((1 + 0.05 * pulse) * (0.7 + 0.5 * dawn)); disc.scale.setScalar(1 + 0.012 * pulse);
    rayMat.opacity = 0.22 * smooth((t - 1.0) / 2.0) * fade; rays.rotation.z = t * 0.04;
    glyph.setLook({ emissive: 0.18 * dawn, glow: 1.5 * dawn * (1 + 0.18 * pulse) });
    glyph.group.rotation.y = SWAY * Math.sin(idle * 0.7) * smooth(idle / 1.5);   // slow sway so the depth reads when you hold still
    glyph.group.position.y = 0.008 * Math.sin(idle * 1.1) * smooth(idle / 1.5);
  }
  applyTime(0);
  return {
    group, strokesEnd: sched.end,
    step: (t) => applyTime(t), reset: () => applyTime(0),
    setPassthrough(b) { passthrough = b; sky.visible = hill.visible = !b; },   // in AR the real room is the backdrop
    dispose: () => disposeObject(group),
  };
}
