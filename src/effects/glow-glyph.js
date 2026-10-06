// A solid, deep, glowing 3D kanji (used by the sun and default effects): shaded body + soft halo shell + round caps.
import * as THREE from 'three';
import { buildTube, drawProgress, WIDTH_UNITS } from '../kanji/tube.js';

export const PALETTES = {
  cyan: { body: 0xdaf7ff, emissive: 0x58d8ff, glow: 0x3fd0ff },
  gold: { body: 0xffe9b8, emissive: 0xffc060, glow: 0xffb347 },
};
const DEPTH_RATIO = 2.0, GLOW_SHELL = 2.6;

export function createGlowGlyph(strokesData, S, palette = PALETTES.cyan) {
  const radius = (WIDTH_UNITS * S) / 2, rz = radius * DEPTH_RATIO;
  const bodyMat = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.38, metalness: 0.1, emissive: palette.emissive, emissiveIntensity: 0 });
  // The halo is a fatter additive shell drawn back-faces only: it fades to nothing at its own edge and the body hides its middle.
  const glowUniforms = { color: { value: new THREE.Color(palette.glow) }, strength: { value: 0 } };
  const shellMat = new THREE.ShaderMaterial({
    uniforms: glowUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; uniform vec3 color; uniform float strength; void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(color * f * strength, 1.0); }',
  });
  const capGeo = new THREE.SphereGeometry(radius, 20, 14);
  const group = new THREE.Group();
  const strokes = strokesData.map((s) => {
    const tube = new THREE.Mesh(buildTube(s.pts, radius, rz), bodyMat);
    const shell = new THREE.Mesh(buildTube(s.pts, radius * GLOW_SHELL, rz * GLOW_SHELL), shellMat);
    const startCap = new THREE.Mesh(capGeo, bodyMat), tip = new THREE.Mesh(capGeo, bodyMat);
    const startGlow = new THREE.Mesh(capGeo, shellMat), tipGlow = new THREE.Mesh(capGeo, shellMat);
    for (const m of [startCap, tip]) m.scale.set(1, 1, DEPTH_RATIO);
    for (const m of [startGlow, tipGlow]) m.scale.set(GLOW_SHELL, GLOW_SHELL, GLOW_SHELL * DEPTH_RATIO);
    for (const m of [startCap, tip, startGlow, tipGlow]) m.position.copy(s.pts[0]);
    shell.renderOrder = startGlow.renderOrder = tipGlow.renderOrder = 5;
    group.add(tube, shell, startCap, tip, startGlow, tipGlow);
    return { pts: s.pts, tube, shell, startCap, tip, startGlow, tipGlow };
  });
  const tmp = new THREE.Vector3();
  return {
    group,
    setStrokeProgress(i, p) {
      const s = strokes[i];
      s.startCap.visible = s.tip.visible = s.startGlow.visible = s.tipGlow.visible = p > 0;
      drawProgress(s.shell.geometry, s.pts, p);
      s.tube.visible = s.shell.visible = p > 0;
      s.tip.position.copy(drawProgress(s.tube.geometry, s.pts, p, tmp)); s.tipGlow.position.copy(tmp);
    },
    setLook({ emissive, glow }) { bodyMat.emissiveIntensity = emissive; glowUniforms.strength.value = glow; },
  };
}
