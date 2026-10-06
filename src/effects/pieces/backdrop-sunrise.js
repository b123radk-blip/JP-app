// "sunrise" backdrop (日): dawn shifts the sky, the sun climbs out from behind a hill, slow rays turn. In AR the room is the
// backdrop: sky and hill hide and the sun fades in with the dawn instead. Asks for the first stroke at 1.6 s (catalog lead).
import * as THREE from 'three';
import { createLights } from './lights.js';
import { smooth, lerp, radialTexture, beamTexture } from './util.js';

const SUN_R = 0.2, SUN_Z = -0.9, SUN_SCALE = 1.4, SUN_Y_HIDDEN = -0.59, SUN_Y_UP = 0.0, HILL_Z = -0.6, HILL_SCALE = 1.3;
const SKY_TOP0 = new THREE.Color(0x070a1f), SKY_TOP1 = new THREE.Color(0x2a3f7a);
const SKY_HOR0 = new THREE.Color(0x1b1240), SKY_HOR1 = new THREE.Color(0xff8a3d);
const HILL0 = new THREE.Color(0x05060f), HILL1 = new THREE.Color(0x1a0f1c);

export function skyDome(uniforms, [lo, hi] = [-0.05, 0.75]) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 top; uniform vec3 horizon; void main(){ float h = smoothstep(${lo.toFixed(3)}, ${hi.toFixed(3)}, vDir.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0); }`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  return sky;
}

export function create(ctx, spec) {
  const group = new THREE.Group();
  let passthrough = false;
  const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } };
  const sky = skyDome(skyU);
  const hillShape = new THREE.Shape(); hillShape.moveTo(-3, -2.5);
  for (let i = 0; i <= 60; i++) { const x = -3 + (6 * i) / 60; hillShape.lineTo(x, -0.10 - 0.08 * x * x); }
  hillShape.lineTo(3, -2.5);
  const hillMat = new THREE.MeshBasicMaterial({ color: HILL0 });
  const hill = new THREE.Mesh(new THREE.ShapeGeometry(hillShape), hillMat);
  hill.position.z = HILL_Z; hill.scale.setScalar(HILL_SCALE);

  const sun = new THREE.Group(); sun.position.set(0, SUN_Y_HIDDEN, SUN_Z); sun.scale.setScalar(SUN_SCALE);
  const discMat = new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(SUN_R, 64), discMat);
  const glowMat = new THREE.MeshBasicMaterial({ map: radialTexture(0.35, 0.45), color: 0xff9a4a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat); glow.position.z = -0.01;
  const rays = new THREE.Group(); rays.position.z = -0.005;
  const rayMat = new THREE.MeshBasicMaterial({ map: beamTexture(), color: 0xffb070, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const rayGeo = new THREE.PlaneGeometry(0.07, 0.8).translate(0, SUN_R + 0.4 - 0.02, 0);
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(rayGeo, rayMat); m.rotation.z = (i / 10) * Math.PI * 2; rays.add(m); }
  sun.add(disc, glow, rays);
  const lights = createLights(group, { rim: 0xffa060, fill: [0xfff0dd, 0x6a4a3a], fillK: 0.9 });
  group.add(sky, hill, sun);

  function step(t) {
    const dawn = smooth(t / spec.dawn), fade = passthrough ? dawn : 1;
    ctx.light = dawn;
    skyU.top.value.lerpColors(SKY_TOP0, SKY_TOP1, dawn); skyU.horizon.value.lerpColors(SKY_HOR0, SKY_HOR1, dawn);
    hillMat.color.lerpColors(HILL0, HILL1, dawn);
    sun.position.y = lerp(SUN_Y_HIDDEN, SUN_Y_UP, dawn);
    discMat.opacity = fade; glowMat.opacity = fade * (0.35 + 0.2 * dawn);
    lights.set(5.0 * smooth((t - 0.6) / 1.4), 3.0 * dawn);
    const pulse = Math.sin(ctx.idle * 1.6) * smooth(ctx.idle);
    glow.scale.setScalar((1 + 0.05 * pulse) * (0.7 + 0.5 * dawn)); disc.scale.setScalar(1 + 0.012 * pulse);
    rayMat.opacity = 0.22 * smooth((t - 1.0) / 2.0) * fade; rays.rotation.z = t * 0.04;
  }
  return { group, step, setPassthrough(b) { passthrough = b; sky.visible = hill.visible = !b; } };
}
