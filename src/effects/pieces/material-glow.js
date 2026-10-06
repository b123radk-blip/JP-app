// "glow" material family (cyan, gold, wood, stone ... presets in config MATERIALS): a solid, deep 3D kanji with a soft halo
// shell and round caps. Brightness follows the backdrop's light level; after the last stroke the halo breathes gently.
import * as THREE from 'three';
import { MATERIALS } from '../../config.js';
import { buildTube, drawProgress, WIDTH_UNITS } from '../../kanji/tube.js';
import { smooth } from './util.js';

const DEPTH_RATIO = 2.0, GLOW_SHELL = 2.6;
export const depthRatio = DEPTH_RATIO;

// spec: { preset, body?, emissive?, glow?, emissiveK?, glowK?, breath? }; strokeIdx: which of ctx.strokes this instance draws.
export function create(ctx, spec, strokeIdx) {
  const look = { ...MATERIALS.cyan, ...(MATERIALS[spec.preset] || {}) };
  for (const k of Object.keys(look)) if (spec[k] !== null && spec[k] !== undefined) look[k] = spec[k];
  const radius = (WIDTH_UNITS * ctx.S) / 2, rz = radius * DEPTH_RATIO;
  const bodyMat = new THREE.MeshStandardMaterial({ color: look.body, roughness: look.rough, metalness: look.metal, emissive: look.emissive, emissiveIntensity: 0 });
  // The halo is a fatter additive shell drawn back-faces only: it fades to nothing at its own edge and the body hides its middle.
  const glowU = { color: { value: new THREE.Color(look.glow) }, strength: { value: 0 } };
  const shellMat = new THREE.ShaderMaterial({
    uniforms: glowU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; uniform vec3 color; uniform float strength; void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(color * f * strength, 1.0); }',
  });
  const capGeo = new THREE.SphereGeometry(radius, 20, 14);
  const group = new THREE.Group();
  const strokes = strokeIdx.map((si) => {
    const { pts } = ctx.strokes[si];
    const tube = new THREE.Mesh(buildTube(pts, radius, rz), bodyMat);
    const shell = new THREE.Mesh(buildTube(pts, radius * GLOW_SHELL, rz * GLOW_SHELL), shellMat);
    const startCap = new THREE.Mesh(capGeo, bodyMat), tip = new THREE.Mesh(capGeo, bodyMat);
    const startGlow = new THREE.Mesh(capGeo, shellMat), tipGlow = new THREE.Mesh(capGeo, shellMat);
    for (const m of [startCap, tip]) m.scale.set(1, 1, DEPTH_RATIO);
    for (const m of [startGlow, tipGlow]) m.scale.set(GLOW_SHELL, GLOW_SHELL, GLOW_SHELL * DEPTH_RATIO);
    for (const m of [startCap, tip, startGlow, tipGlow]) m.position.copy(pts[0]);
    shell.renderOrder = startGlow.renderOrder = tipGlow.renderOrder = 5;
    group.add(tube, shell, startCap, tip, startGlow, tipGlow);
    return { si, pts, tube, shell, startCap, tip, startGlow, tipGlow };
  });
  const tmp = new THREE.Vector3();
  function step() {
    for (const s of strokes) {
      const p = ctx.rv.progress[s.si];
      s.startCap.visible = s.tip.visible = s.startGlow.visible = s.tipGlow.visible = s.tube.visible = s.shell.visible = p > 0;
      drawProgress(s.shell.geometry, s.pts, p);
      s.tip.position.copy(drawProgress(s.tube.geometry, s.pts, p, tmp)); s.tipGlow.position.copy(tmp);
    }
    const pulse = Math.sin(ctx.idle * 1.6) * smooth(ctx.idle);
    bodyMat.emissiveIntensity = look.emissiveK * ctx.light;
    glowU.strength.value = look.glowK * ctx.light * (1 + look.breath * pulse);
  }
  return { group, step, rz };
}
