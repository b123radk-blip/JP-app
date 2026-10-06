// Backdrops without a sky. Each sets ctx.light (0..1, how lit the scene is; glow materials follow it).
// "plain": nothing behind the kanji (cards without a recipe use it). "halo": a glow behind the kanji that grows as the
// reveal advances, with an optional firelight flicker (the light of 火).
import * as THREE from 'three';
import { createLights } from './lights.js';
import { smooth, radialTexture } from './util.js';

export function plain(ctx, spec) {
  const group = new THREE.Group(), lights = createLights(group, { rim: spec.rim });
  return { group, step(t) { const on = smooth(t / 1.0); ctx.light = on; lights.set(5 * on, 2.5 * on); }, setPassthrough() {} };
}

export function halo(ctx, spec) {
  const group = new THREE.Group(), K = ctx.K, lights = createLights(group, { rim: spec.color });
  const mat = new THREE.MeshBasicMaterial({ map: radialTexture(0.4, 0.35), color: spec.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const bloom = new THREE.Mesh(new THREE.PlaneGeometry(spec.size * K, spec.size * K), mat); bloom.position.z = -0.35 * K;
  group.add(bloom);
  return {
    group,
    step(t) {
      const on = smooth(t / 1.0), burn = ctx.rv.frac;
      ctx.light = on; lights.set(5 * on, 2.5 * on);
      const flick = spec.flicker ? 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1) + 0.08 * Math.sin(t * 31) : 1;
      mat.opacity = (0.06 + 0.42 * burn) * flick;
      bloom.scale.setScalar(0.8 + 0.45 * burn);
    },
    setPassthrough() {},
  };
}
