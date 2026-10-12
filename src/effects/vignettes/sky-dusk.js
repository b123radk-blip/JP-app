// 晩 (evening): a village of little houses with chimneys, doors and windows on a grassy hill with a few trees, with a second
// hill behind. The big sun sinks behind the hills in a red glow, the sky goes dusky blue, the houses' windows light up warm
// yellow one by one, smoke curls from a chimney, a crescent moon rises with a soft halo and stars twinkle on; in the morning
// it all resets.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { emblemProp, veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps, mixColor } from './helpers.js';

const lerp = (a, b, f) => a + (b - a) * f;
function seeded(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }
// a soft round glow (radial gradient, additive): origin at its middle
function glowDisc(size, rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},1)`); grad.addColorStop(0.35, `rgba(${rgb},0.45)`); grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
}
// a gable roof: triangle in front, ridge along z
function roof(w, h, d, o) {
  const s = new THREE.Shape(); s.moveTo(-(w / 2 + o), 0); s.lineTo(w / 2 + o, 0); s.lineTo(0, h); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: d + 2 * o, bevelEnabled: false }).translate(0, 0, -(d / 2 + o));
}
// [x, z, width, height, depth, wall, roof, chimney]
const HS = 1.35, XS = 0.8;
const HOUSES = [[-0.72, 0.1, 0.26, 0.17, 0.17, 0xf0e0c0, 0xb84a3a, true], [-0.22, 0.17, 0.22, 0.15, 0.15, 0xd8e8f0, 0x3a6aa8, false], [0.3, 0.1, 0.3, 0.19, 0.19, 0xf4d0c0, 0x8a3a2a, true], [0.78, 0.17, 0.21, 0.14, 0.15, 0xe8f0d0, 0xa05a2a, false]];
const TREES = [[-1.05, 0.12, 'pine', 0.3], [-0.47, 0.27, 'round', 0.24], [0.04, 0.3, 'round', 0.18], [0.62, 0.26, 'pine', 0.26], [1.02, 0.1, 'round', 0.26], [-1.2, -0.05, 'round', 0.2]];

function sunsetLights(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.95 * u;
  const RX = 1.25 * u, RY = 0.42 * u, RZ = 0.5 * u, CY = floor - 0.2 * u;                                  // the front hill: a flattened ball
  const ground = (x, z) => CY + RY * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2 - (z / RZ) ** 2));
  const list = [[G.sphere(1, 0, CY, 0, RX, RY, RZ), 0x3a7a40], [G.sphere(1, 0.1 * u, floor - 0.32 * u, -0.38 * u, 2.1 * u, 0.55 * u, 0.3 * u), 0x1f4f30]];
  const SPOTS = [];                                                                                      // where each window sits
  HOUSES.forEach(([x, z, w, h, d, wall, rf, chim]) => {
    const e = HS * u, X = x * XS * u, Z = z * u, W = w * e, H = h * e, D = d * e, y0 = ground(X, Z) - 0.012 * u, RH = 0.55 * W;
    list.push([G.box(W, H, D, X, y0 + H / 2, Z), wall], [roof(W, RH, D, 0.018 * e).translate(X, y0 + H, Z), rf]);
    if (chim) list.push([G.box(0.045 * e, 0.1 * e, 0.045 * e, X + 0.27 * W, y0 + H + 0.55 * RH, Z - 0.02 * e), 0x8a5a4a], [G.box(0.055 * e, 0.012 * e, 0.055 * e, X + 0.27 * W, y0 + H + 0.55 * RH + 0.056 * e, Z - 0.02 * e), 0x5a3a30]);
    list.push([G.box(0.05 * e, 0.085 * e, 0.008 * e, X, y0 + 0.0425 * e, Z + D / 2 + 0.002 * e), 0x7a4a2a], [G.sphere(0.006 * e, X + 0.016 * e, y0 + 0.042 * e, Z + D / 2 + 0.008 * e), 0xf0d060]);
    for (const sx of [-1, 1]) {
      const wx = X + sx * 0.3 * W, wy = y0 + 0.62 * H, wz = Z + D / 2;
      list.push([G.box(0.066 * e, 0.066 * e, 0.006 * e, wx, wy, wz + 0.001 * e), 0xfaf6ee], [G.box(0.052 * e, 0.052 * e, 0.007 * e, wx, wy, wz + 0.003 * e), 0x34405c]);
      SPOTS.push([wx, wy, wz + 0.0085 * e]);
    }
  });
  TREES.forEach(([x, z, kind, h]) => {
    const X = x * XS * u, Z = z * u, y0 = ground(X, Z) - 0.01 * u, H = h * 1.15 * u;
    list.push([G.cyl(0.014 * u, 0.02 * u, 0.3 * H, X, y0 + 0.15 * H, Z, 0, 0, 0, 8), 0x6a4a2a]);
    if (kind === 'pine') list.push([G.cone(0.1 * H, 0.55 * H, X, y0 + 0.5 * H, Z), 0x1f5a34], [G.cone(0.075 * H, 0.45 * H, X, y0 + 0.78 * H, Z), 0x2a6a3e]);
    else list.push([G.sphere(0.2 * H, X, y0 + 0.55 * H, Z, 1, 1.1, 1), 0x3a8a44], [G.sphere(0.14 * H, X + 0.1 * H, y0 + 0.48 * H, Z + 0.04 * u, 1, 1, 1), 0x2f7a3c]);
  });
  const hill = solidProp(list, 0.3); hill.position.set(hx, 0, 0);
  const wins = many([[G.box(0.052 * HS * u, 0.052 * HS * u, 0.008 * HS * u), 0xffd060]], SPOTS.length, 1.5);
  const sun = solidProp([[G.sphere(0.17 * u), 0xffffff]], 1.3), sunGlow = glowDisc(1.5 * u, '255,150,60'), moon = emblemProp('crescent', 0.34 * u), moonGlow = glowDisc(0.9 * u, '190,205,255');
  const dusk = veil(22 * u, 13 * u, 0x0a1234), stars = many([[G.sphere(0.011 * u), 0xfff6c0]], 22, 1.6), smoke = many(PUFF(1.3 * u, 0xd2d4dc), 6, 0.6), rnd = seeded(7);
  const spots = Array.from({ length: 22 }, () => [rnd(), rnd(), rnd()]), sky0 = [B.maxX + 0.0 * u, floor + 0.62 * u, 2.6 * u, 0.7 * u];
  dusk.position.set(hx + 0.2 * u, floor + 1.2 * u, -0.62 * u); sun.position.z = -0.5 * u; sunGlow.position.z = -0.52 * u; moonGlow.position.z = -0.3 * u;
  group.add(dusk, sunGlow, moonGlow, sun, hill, wins, moon, stars, smoke);
  const loop = 6.0, ORDER = [3, 0, 5, 2, 7, 1, 4, 6], sunX = hx + 0.4 * u, c = new THREE.Color();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { sink: [0, 2.0, 'in'], dusk: [0.9, 1.5], moon: [2.8, 1.1, 'out'], stars: [3.1, 0.7], morning: [5.2, 0.7], glowOut: [2.4, 1.6] });
      const night = pre ? 0 : T.dusk * (1 - T.morning), sunY = pre ? 1.0 : lerp(1.0, -0.2, T.sink) + 1.2 * T.morning;
      sun.position.set(sunX, floor + sunY * u, -0.5 * u); mixColor(c, 0xffe060, 0xff3a14, between(sunY, 0.9, 0.2)); sun.material.color.copy(c);
      const near = 1 - between(sunY, 0.15, 0.9);
      sunGlow.position.set(sunX, floor + Math.max(sunY, 0.05) * u, -0.52 * u); sunGlow.scale.setScalar(1 + 0.5 * near); sunGlow.material.opacity = pre ? 0.35 : (0.35 + 0.5 * near) * (1 - T.glowOut) * (1 - T.morning * 0.5);
      dusk.material.opacity = 0.7 * night;
      hill.material.color.setHex(0xffffff).lerp(c.setHex(0x6e7cb0), night); hill.material.userData.glow.value = lerp(0.32, 0.1, night);
      SPOTS.forEach(([x, y, z], i) => { const on = pre ? 0 : between(v, 2.0 + ORDER.indexOf(i) * 0.2, 2.2 + ORDER.indexOf(i) * 0.2) * (1 - T.morning); wins.set(i, hx + x, y, z, on > 0.5 ? 1 : 0.0001 + on); });
      wins.commit(); wins.material.userData.glow.value = 1.5 * (0.6 + 0.4 * Math.sin(t * 2.0 + 1));
      const mY = lerp(-0.05, 1.05, T.moon);
      moon.visible = night > 0.05 && T.moon > 0.01; moon.position.set(hx + 0.8 * u, floor + mY * u, -0.25 * u); moon.idle(t);
      moonGlow.position.set(hx + 0.8 * u, floor + mY * u, -0.28 * u); moonGlow.material.opacity = 0.55 * T.moon * (1 - T.morning);
      const sa = (pre ? 0 : T.stars) * (1 - T.morning);
      spots.forEach(([a, b, k], i) => stars.set(i, sky0[0] + a * sky0[2], sky0[1] + b * sky0[3] + 0.4 * u, -0.32 * u, sa * (0.45 + 0.65 * Math.abs(Math.sin(t * (1.5 + 2 * k) + i * 1.7)))));
      stars.commit();
      const [cx, , cz] = [hx + (HOUSES[2][0] * XS + 0.27 * HOUSES[2][2] * HS) * u, 0, (HOUSES[2][1] - 0.02) * u];
      wisps(smoke, 0, 6, cx, ground((HOUSES[2][0] * XS + 0.27 * HOUSES[2][2] * HS) * u, HOUSES[2][1] * u) + (HOUSES[2][3] + 0.55 * 0.55 * HOUSES[2][2] + 0.07) * HS * u, t, u, { period: 3.0, rise: 0.5, sway: 0.12, size: 1 });
      smoke.commit(); void cz;
    },
  };
}
export { sunsetLights };
