// "sky" backdrop: a gradient dome with extras from its preset (config SKIES): stars, a moon, lightning flashes, light shafts.
// Fades in over the first second. In AR (passthrough) the dome, stars and shafts hide; the moon and the lighting stay.
import * as THREE from 'three';
import { SKIES } from '../../config.js';
import { createLights } from './lights.js';
import { skyDome } from './backdrop-sunrise.js';
import { smooth, mulberry32, radialTexture, beamTexture } from './util.js';

const FLASH = new THREE.Color(0x9aa8c8), DARK = new THREE.Color(0x000000);

export function create(ctx, spec) {
  const P = SKIES[spec.preset] || SKIES.night, group = new THREE.Group(), hide = [];
  const top = new THREE.Color(P.top), horizon = new THREE.Color(P.horizon);
  const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } };
  const dome = skyDome(skyU, P.band); group.add(dome); hide.push(dome);
  const lights = createLights(group, { rim: P.rim, fill: P.fill, fillK: P.fillK });
  const rnd = mulberry32(7);

  let starMat = null;
  if (P.stars) {
    const pos = new Float32Array(P.stars * 3);
    for (let i = 0; i < P.stars; i++) {
      const a = rnd() * Math.PI * 2, y = 0.08 + rnd() * 0.9, r = Math.sqrt(1 - y * y);
      pos.set([Math.cos(a) * r * 20, y * 20, Math.sin(a) * r * 20], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0, depthWrite: false });
    const stars = new THREE.Points(g, starMat); stars.renderOrder = -9; stars.frustumCulled = false; group.add(stars); hide.push(stars);
  }
  let moonMat = null, moonGlowMat = null;
  if (P.moon) {
    const moon = new THREE.Group(); moon.position.set(0.55, 0.34, -1.0);
    moonMat = new THREE.MeshBasicMaterial({ color: 0xf2f0e6, transparent: true, opacity: 0 });
    moonGlowMat = new THREE.MeshBasicMaterial({ map: radialTexture(0.3, 0.3), color: 0x9fb8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), moonGlowMat); glow.position.z = -0.01;
    moon.add(new THREE.Mesh(new THREE.CircleGeometry(0.07, 48), moonMat), glow); group.add(moon);
  }
  const shafts = [];
  if (P.shafts) {
    const map = beamTexture(), mat = new THREE.MeshBasicMaterial({ map, color: P.rim, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    for (let i = 0; i < P.shafts; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16 + rnd() * 0.12, 1.6), mat.clone());
      m.position.set(-0.6 + (1.2 * (i + 0.5)) / P.shafts + (rnd() - 0.5) * 0.15, 0.2, -0.7 - rnd() * 0.3);
      m.rotation.z = Math.PI + 0.35 + (rnd() - 0.5) * 0.1;        // turned over so the bright end is at the top, slanting
      m.userData.phase = rnd() * 6; group.add(m); shafts.push(m); hide.push(m);
    }
  }
  const L = P.lightning;
  const flashAt = (t) => { if (!L || t < L.first) return 0; const k = Math.floor((t - L.first) / L.every), dt = t - L.first - k * L.every; return Math.exp(-dt / 0.07) + 0.6 * Math.exp(-Math.max(0, dt - 0.16) / 0.06) * (dt > 0.16 ? 1 : 0); };

  function step(t) {
    const on = smooth(t / 1.2), flash = Math.min(1, flashAt(t));
    ctx.light = on;
    skyU.top.value.copy(DARK).lerp(top, on).lerp(FLASH, flash * 0.5); skyU.horizon.value.copy(DARK).lerp(horizon, on).lerp(FLASH, flash * 0.7);
    lights.set(5 * on, 2.5 * on + 6 * flash, P.fillK * on + 1.5 * flash);
    if (starMat) starMat.opacity = 0.85 * on;
    if (moonMat) { moonMat.opacity = on; moonGlowMat.opacity = 0.5 * on; }
    for (const m of shafts) m.material.opacity = 0.08 * on * (0.75 + 0.25 * Math.sin(t * 0.6 + m.userData.phase));
  }
  return { group, step, setPassthrough(b) { hide.forEach((o) => { o.visible = !b; }); } };
}
