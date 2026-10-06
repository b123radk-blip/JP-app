// "glow" material family (cyan, gold, wood, stone ... presets in config MATERIALS): a solid, deep 3D kanji with a soft halo
// shell and round caps. Brightness follows the backdrop's light level; after the last stroke the halo breathes gently.
// Draw calls: 4 per instance (body, halo shell, caps, cap halos), however many strokes it has.
import * as THREE from 'three';
import { MATERIALS } from '../../config.js';
import { buildMergedTubes, pointAt, WIDTH_UNITS } from '../../kanji/tube.js';
import { smooth } from './util.js';
import { progressUniform, clipStrokes, capInstances, CLIP_VERT_DECL, CLIP_VERT_MAIN, CLIP_FRAG_DECL, CLIP_FRAG_MAIN, INSTANCE_VERT } from './glyph-shader.js';

const DEPTH_RATIO = 2.0, GLOW_SHELL = 2.6;
export const depthRatio = DEPTH_RATIO;

// The halo is a fatter additive shell drawn back-faces only: it fades to nothing at its own edge and the body hides its middle.
function shellMaterial(uniforms, clip) {
  return new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: `${clip ? CLIP_VERT_DECL : ''} varying vec3 vN; varying vec3 vV;
      void main(){ ${INSTANCE_VERT} ${clip ? CLIP_VERT_MAIN : ''} vec4 mv = modelViewMatrix * p0; vN = normalize(normalMatrix * n0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `${clip ? CLIP_FRAG_DECL : ''} varying vec3 vN; varying vec3 vV; uniform vec3 color; uniform float strength;
      void main(){ ${clip ? CLIP_FRAG_MAIN : ''} float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(color * f * strength, 1.0); }`,
  });
}

// spec: { preset, body?, emissive?, glow?, emissiveK?, glowK?, breath? }; strokeIdx: which of ctx.strokes this instance draws.
export function create(ctx, spec, strokeIdx) {
  const look = { ...MATERIALS.cyan, ...(MATERIALS[spec.preset] || {}) };
  for (const k of Object.keys(look)) if (spec[k] !== null && spec[k] !== undefined) look[k] = spec[k];
  const radius = (WIDTH_UNITS * ctx.S) / 2, rz = radius * DEPTH_RATIO;
  const params = { color: look.body, roughness: look.rough, metalness: look.metal, emissive: look.emissive, emissiveIntensity: 0 };
  const uProg = progressUniform(), glowU = { color: { value: new THREE.Color(look.glow) }, strength: { value: 0 }, uProg };
  const bodyMat = clipStrokes(new THREE.MeshStandardMaterial(params), uProg), capMat = new THREE.MeshStandardMaterial(params);
  const shellMat = shellMaterial(glowU, true), capShellMat = shellMaterial(glowU, false);
  const pts = strokeIdx.map((si) => ctx.strokes[si].pts);
  const body = new THREE.Mesh(buildMergedTubes(pts, radius, rz), bodyMat);
  const shell = new THREE.Mesh(buildMergedTubes(pts, radius * GLOW_SHELL, rz * GLOW_SHELL), shellMat);
  const capGeo = new THREE.SphereGeometry(radius, 20, 14);
  const caps = capInstances(capGeo, capMat, pts.length), glows = capInstances(capGeo, capShellMat, pts.length);
  shell.renderOrder = glows.mesh.renderOrder = 5;
  const group = new THREE.Group(); group.add(body, shell, caps.mesh, glows.mesh);
  const capScale = new THREE.Vector3(1, 1, DEPTH_RATIO), glowScale = new THREE.Vector3(GLOW_SHELL, GLOW_SHELL, GLOW_SHELL * DEPTH_RATIO), tip = new THREE.Vector3();

  function step() {
    strokeIdx.forEach((si, j) => {
      const p = ctx.rv.progress[si], on = p > 0;
      uProg.value[j] = on ? p : -1;
      pointAt(pts[j], p, tip);
      caps.set(j, 0, pts[j][0], capScale, on); caps.set(j, 1, tip, capScale, on);
      glows.set(j, 0, pts[j][0], glowScale, on); glows.set(j, 1, tip, glowScale, on);
    });
    caps.commit(); glows.commit();
    const pulse = Math.sin(ctx.idle * 1.6) * smooth(ctx.idle);
    bodyMat.emissiveIntensity = capMat.emissiveIntensity = look.emissiveK * ctx.light;
    glowU.strength.value = look.glowK * ctx.light * (1 + look.breath * pulse);
  }
  return { group, step, rz };
}
