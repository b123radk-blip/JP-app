// Model scenes with the Everything Library's elephant and rabbit (static models: no rig), moved through vertex bends
// (bend(): a few lines of GLSL on the model's own copy of its material, driven by uniforms), so legs stride, a trunk
// curls up and ears twitch. Each copy is posed by step(t) alone (pure of t).
//   grow-big:elephant   大きい: a huge elephant strides up onto the grass beside a tiny mouse, curls its trunk up high and
//                       trumpets パオーン in rings; the mouse looks up and up and jumps, "!"
//   snow-white:rabbit   白い: a snow-white rabbit hops over a snowfield leaving prints, sits up and twitches its ears, then
//                       hops away; the snow falls on and covers the prints. Its white fur shows only against the blue shade
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow, seeded } from './step1-kit.js';

const lerp = (a, b, f) => a + (b - a) * f;
const pop = (m, k, x, y, z) => { m.visible = k > 0.01; m.scale.setScalar(grow(k)); m.position.set(x, y, z); };

// A vertex bend on a model's own materials: `glsl` edits `transformed` (the model's geometry space: these models are
// about 2 long in z, nose at +z, feet at the lowest y) and may read `vColorIn` (the vertex colour). Returns the uniforms.
function bend(model, names, glsl) {
  const uni = Object.fromEntries(names.map((n) => [n, { value: 0 }]));
  model.group.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material, before = m.onBeforeCompile, key = m.customProgramCacheKey?.() ?? '';
    m.onBeforeCompile = (sh, r) => {
      before?.call(m, sh, r);
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nuniform float ${names.join(', ')};`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n{ vec3 vColorIn = vec3(1.0);\n#ifdef USE_COLOR\nvColorIn = color.rgb;\n#endif\n${glsl}\n}`);
    };
    m.customProgramCacheKey = () => `${key}-bend-${names.join('')}`;
    m.needsUpdate = true;
  });
  return uni;
}
const meshOf = (model) => { let m = null; model.group.traverse((o) => { if (o.isMesh && !m) m = o; }); return m; };

// ---- 大きい: the elephant ----
// geometry space of everything/animals/elephant.glb: x ±0.47, y -0.70 (feet) .. 0.70, z -1 (tail) .. 1 (tusk tips); the
// trunk hangs from about (y 0.25, z 0.62) down to y -0.63; tusks are the light vertices in front, ears flare to |x| 0.47
const ELEPHANT_GLSL = `
  vec3 p = transformed;
  float leg = clamp((-0.2 - p.y) / 0.5, 0.0, 1.0);
  if (p.z < 0.5) {                                     // legs: diagonal pairs stride, the lifted foot rises
    float pair = (p.x > 0.0) == (p.z > -0.2) ? 0.0 : 3.14159;
    transformed.z += sin(uWalk + pair) * 0.16 * uStride * leg;
    transformed.y += max(0.0, cos(uWalk + pair)) * 0.07 * uStride * leg;
  }
  float tusk = step(0.25, vColorIn.r);
  if (p.z > 0.5 && p.y < 0.3 && tusk < 0.5) {         // the trunk curls forward and up about its root
    float d = clamp((0.3 - p.y) / 0.9, 0.0, 1.0), a = uTrunk * (0.7 * d + 1.1 * d * d) + uSwing * d;
    vec2 r = vec2(p.y - 0.3, p.z - 0.6);
    transformed.y = 0.3 + r.x * cos(a) + r.y * sin(a);
    transformed.z = 0.6 - r.x * sin(a) + r.y * cos(a);
  }
  float ear = clamp((abs(p.x) - 0.22) / 0.25, 0.0, 1.0) * step(-0.05, p.z) * step(p.z, 0.32) * step(-0.25, p.y);
  transformed.z += ear * uEar * 0.12;                 // the ears flap forward
  transformed.x -= sign(p.x) * ear * uEar * 0.05;
`;
// where the trunk tip is (geometry space) for a curl amount, as the shader bends it
const tip = (k, swing, out) => { const a = k * 1.8 + swing, ry = -0.93, rz = 0.1; return out.set(0, 0.3 + ry * Math.cos(a) + rz * Math.sin(a), 0.6 - ry * Math.sin(a) + rz * Math.cos(a)); };

export function bigElephant(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ex = B.maxX + 0.72 * u, far = B.maxX + 2.0 * u, ez = -0.25 * u, tilt = 0.15, mz = 0.12 * u;
  const el = createModel('grayElephant', { height: 1.1 * u, ownMaterials: true }), mouse = createModel('mouse', { height: 0.13 * u });
  const U = bend(el, ['uWalk', 'uStride', 'uTrunk', 'uSwing', 'uEar'], ELEPHANT_GLSL), body = meshOf(el);
  el.group.rotation.order = 'YXZ'; mouse.group.rotation.order = 'YXZ';
  const mHalf = new THREE.Box3().setFromObject(mouse.group).getSize(new THREE.Vector3()).z * 0.4;
  // a patch of savanna grass under them, its top at the kanji's foot
  const ground = solidProp([[G.sphere(0.5 * u, 0, -0.04 * u, 0, 3.2, 0.08, 1.5), 0x6f9a48], [G.sphere(0.5 * u, 0.15 * u, -0.035 * u, -0.05 * u, 2.6, 0.075, 1.1), 0x7fa852]], 0.22);
  ground.position.set(B.maxX + 0.75 * u, floor, ez); ground.rotation.x = tilt;        // tipped a little toward the viewer
  const toot = many([[G.torus(0.09 * u, 0.012 * u), 0xfff0a0]], 3, 1.0), say = textPlane('パオーン', { h: 0.22 * u, color: '#ffffff', bg: '#6a7a90', pad: 0.25 }), bang = textPlane('!', { h: 0.2 * u, color: '#ffe040', weight: 900 });
  group.add(ground, el.group, mouse.group, toot, say, bang);
  const loop = 6.4, P = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // set-up: it strides in from the right while the strokes draw; action: curl up, trumpet, curl down, flap its ears
      const come = pre ? Math.min(1, A.setup * 1.15) : 1, walking = come < 1 ? 1 : 0;
      const T = timeline(v, { up: [0.4, 0.9, 'out'], down: [3.0, 1.0] }), up = pre ? 0 : T.up * (1 - T.down);
      const blow = pre ? 0 : between(v, 1.2, 1.4) * (1 - between(v, 2.7, 3.0));
      U.uWalk.value = A.s * 5.5; U.uStride.value = walking;
      U.uTrunk.value = up; U.uSwing.value = 0.18 * Math.sin(t * 1.3) * (1 - up);
      U.uEar.value = pre ? 0.3 * Math.sin(A.s * 5.5) : 0.6 * bump(v, 1.2, 1.6) * Math.sin(v * 9) + 0.25 * Math.sin(v * 2.2) * (1 - up);
      el.group.position.set(lerp(far, ex, come), floor + walking * 0.012 * u * Math.abs(Math.sin(A.s * 5.5)), ez);
      el.group.rotation.set(-0.08 * up, -1.2, walking * 0.02 * Math.sin(A.s * 5.5));
      // the mouse at its feet looks up the elephant, and jumps at the trumpet
      const look = pre ? 0.15 : 0.15 + 0.4 * T.up * (1 - T.down), hop = pre ? 0 : 0.12 * u * bump(v, 1.3, 0.45);
      mouse.group.position.set(B.maxX + 0.28 * u, floor - (mz - ez) * Math.sin(tilt) + hop + mHalf * Math.sin(look), mz);          // pitched up about its tail end mouse.group.rotation.set(-look, 1.25, 0);
      pop(bang, pre ? 0 : between(v, 1.3, 1.5) * (1 - between(v, 2.8, 3.0)), B.maxX + 0.3 * u, floor + 0.36 * u, 0.15 * u);
      // trumpet rings from the trunk tip
      group.updateMatrixWorld(true); tip(up, U.uSwing.value, P); body.localToWorld(P); group.worldToLocal(P);
      for (let i = 0; i < 3; i++) { const f = blow > 0.5 ? (v * 1.6 + i / 3) % 1 : 0; toot.set(i, P.x - 0.3 * u * f, P.y + 0.12 * u * f, P.z + 0.1 * u, f > 0 ? 0.6 + 1.8 * f : 0, 0, 1.1, 0); }
      toot.commit();
      pop(say, blow, ex - 0.1 * u, floor + 1.35 * u, 0.1 * u);
    },
  };
}

// ---- 白い: the rabbit ----
// geometry space of everything/animals/rabbit.glb: x ±0.38, y -0.66 (feet) .. 0.66 (ear tips), z -1 (tail) .. 1 (nose);
// eyes about (±0.17, 0.06, 0.8), ears rise from y 0.2 above z 0.7
const RABBIT_GLSL = `
  vec3 p = transformed;
  float leg = clamp((-0.25 - p.y) / 0.4, 0.0, 1.0);
  transformed.z += leg * uStretch * (p.z < 0.0 ? -0.35 : 0.3);   // a leap: hind legs push back, front paws reach
  float ear = clamp((p.y - 0.2) / 0.45, 0.0, 1.0) * step(0.55, p.z);
  transformed.z -= ear * (uEar * 0.25 + uStretch * 0.15);         // ears flick back
  transformed.x += sign(p.x) * ear * uEar * 0.06;
`;
// the wild (grey-brown) rabbit made snow-white: fur white with a little of its shading, inner ears pink, eyes red
function whiten(model) {
  model.group.traverse((o) => {
    if (!o.isMesh || !o.geometry.attributes.color) return;
    o.geometry = o.geometry.clone();
    const c = o.geometry.attributes.color, p = o.geometry.attributes.position, out = new Float32Array(c.count * 3);
    for (let i = 0; i < c.count; i++) {
      const r = c.getX(i), g = c.getY(i), b = c.getZ(i), l = 0.3 * r + 0.6 * g + 0.1 * b, y = p.getY(i), z = p.getZ(i);
      let rgb;
      if (z > 0.7 && y > -0.02 && y < 0.14 && l < 0.05) rgb = [0.5, 0.02, 0.04];        // eye
      else if (l > 0.9) rgb = [1, 1, 1];                                                  // eye highlight
      else if (r - b > 0.25 && y > 0.18) rgb = [0.95, 0.45, 0.5];                         // inner ear
      else { const k = 0.86 + 0.14 * Math.min(1, l * 3); rgb = [k, k, Math.min(1, k * 1.02)]; }        // fur
      out.set(rgb, i * 3);
    }
    o.geometry.setAttribute('color', new THREE.BufferAttribute(out, 3));
  });
}

export function whiteRabbit(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, near = B.maxX + 0.45 * u, far = B.maxX + 1.75 * u, rz = 0.05 * u, tilt = 0.3;
  const rab = createModel('rabbit', { height: 0.45 * u, ownMaterials: true });
  whiten(rab); rab.group.rotation.order = 'YXZ';
  const U = bend(rab, ['uStretch', 'uEar'], RABBIT_GLSL);
  // a snowfield (its top at the kanji's foot) with drifts, and a snowy fir behind
  const field = solidProp([[G.sphere(0.5 * u, 0, -0.06 * u, 0, 4.2, 0.12, 1.7), 0xeef4ff], [G.sphere(0.3 * u, 0.55 * u, -0.01 * u, -0.45 * u, 1.8, 0.35, 1), 0xe4ecfa], [G.sphere(0.25 * u, -0.7 * u, -0.01 * u, -0.4 * u, 1.6, 0.3, 1), 0xe4ecfa]], 0.55);
  const fir = solidProp([[G.cyl(0.03 * u, 0.04 * u, 0.2 * u, 0, 0.1 * u, 0), 0x6a4a30], ...[[0.2, 0.32, 0.3], [0.42, 0.25, 0.26], [0.6, 0.17, 0.22]].map(([y, r, h]) => [G.cone(r * u, h * u, 0, (y + 0.02) * u, 0), 0x2f6a44]), ...[[0.22, 0.3, 0.12], [0.44, 0.23, 0.11], [0.63, 0.15, 0.1]].map(([y, r, h]) => [G.cone(r * u, h * u, 0, (y + 0.1) * u, 0), 0xffffff])], 0.45);
  field.position.set(B.maxX + 1.0 * u, floor, rz); field.rotation.x = tilt;          // tipped toward the viewer: the prints show
  fir.position.set(B.maxX + 1.65 * u, floor + 0.5 * u * Math.sin(tilt), rz - 0.5 * u);
  const prints = many([[G.sphere(0.028 * u, 0, 0, 0, 1, 0.15, 1.5), 0x9fb0d0]], 12, 0.35), flakes = many([[G.sphere(0.016 * u), 0xffffff]], 18, 1.2), r = seeded(4), spots = Array.from({ length: 18 }, () => [r(), r(), r()]);
  group.add(field, fir, prints, rab.group, flakes);
  // hops in from the right (5 hops), sits up and twitches its ears, turns and hops back out (5 hops)
  const loop = 8.0, hopsIn = 5, land = (i) => far + (near - far) * (i / hopsIn);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const fin = pre ? 0 : between(v, 0.2, 3.0), fout = pre ? 0 : between(v, 5.2, 7.6), sit = pre ? 0 : between(v, 3.1, 3.5) * (1 - between(v, 4.6, 5.0));
      const going = fout > 0, f = going ? fout : fin, ph = (f * hopsIn) % 1, inAir = f > 0 && f < 1;
      const x = going ? lerp(near, far, fout) : lerp(far, near, fin), h = inAir ? Math.sin(Math.PI * ph) : 0;
      const turn = pre ? -Math.PI / 2 : going ? Math.PI / 2 : -Math.PI / 2 + (Math.PI / 2 - 0.3) * between(v, 3.0, 3.4) * (1 - between(v, 4.8, 5.1)) + Math.PI * between(v, 4.9, 5.2);
      rab.group.visible = !pre && v < 7.55;
      rab.group.position.set(x, floor + 0.2 * u * h, rz);
      rab.group.rotation.set(inAir ? 0.35 * Math.cos(Math.PI * ph) * -1 : -0.55 * sit, turn, 0);
      rab.group.scale.set(1, inAir ? 1 + 0.08 * h : 1 + 0.12 * sit, 1);
      U.uStretch.value = inAir ? Math.sin(Math.PI * ph) : 0;
      U.uEar.value = sit > 0.5 ? 0.5 + 0.5 * Math.sin(v * 14) * bump(v, 3.6, 0.8) + 0.5 * Math.sin(v * 14) * bump(v, 4.2, 0.4) : 0;
      // prints where it landed on the way in; the falling snow fills them before it comes back
      for (let i = 0; i < 12; i++) {
        const k = Math.floor(i / 2) + 1, at = Math.min(k, hopsIn) / hopsIn, px = land(Math.min(k, hopsIn)) + (i % 2 ? 0.07 : -0.03) * u;
        const shown = !pre && k <= hopsIn && fin >= at ? 1 - between(v, 6.0, 7.5) : 0;
        const dz = (i % 2 ? 0.05 : -0.05) * u; prints.set(i, px, floor + 0.006 * u - dz * Math.sin(tilt), rz + dz, shown, 0, 0, tilt);
      }
      prints.commit();
      spots.forEach(([a, b, c], i) => { const g = (t * 0.22 + b) % 1; flakes.set(i, B.maxX - 0.1 * u + a * 2.0 * u + 0.04 * u * Math.sin(t * 1.5 + i), floor + 1.3 * u - 1.3 * u * g, (c - 0.6) * 0.6 * u, 1); });
      flakes.commit();
    },
  };
}
