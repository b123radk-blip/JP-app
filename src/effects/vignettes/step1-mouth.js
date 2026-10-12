// 口 (mouth-open): the glyph ITSELF is the mouth. Its bottom stroke drops like a jaw and the top stroke lifts (the two sides hang from it),
// and the hollow between them fills with a real mouth: a dome-shaped dark red cavity with a throat and a uvula, pink gums with rounded
// individual teeth along the top and bottom strokes, soft red lip rims, and a rounded glossy tongue that lies on the lower jaw, pokes out
// toward you and waggles. It opens a little, shuts, opens wide for a big あー, shuts, and the glyph is a plain 口 again.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp, kitMaterial } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const NT = 6;                                                   // teeth per row
// the cavity: the back half of a unit ellipsoid (open toward you), coloured by depth: raw red at the lips, nearly black in the throat
function cavityGeo() {
  const g = new THREE.SphereGeometry(1, 44, 24, Math.PI, Math.PI), P = g.attributes.position, C = new Float32Array(P.count * 3), c = new THREE.Color(), a = new THREE.Color(0x90152a), b = new THREE.Color(0x3c0810), d = new THREE.Color(0x090104);
  for (let i = 0; i < P.count; i++) {
    const z = -P.getZ(i), r = Math.hypot(P.getX(i), P.getY(i)), deep = Math.min(1, z * 1.1);
    c.copy(a).lerp(b, Math.min(1, deep * 2.2)).lerp(d, Math.max(0, deep - 0.35) * 1.8).multiplyScalar(1 - 0.18 * Math.max(0, P.getY(i)) + 0.1 * (1 - r));
    C.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(C, 3)); return g;
}

export function mouthOpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), hw = B.w / 2 - 0.045 * u;
  const flat = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => b.h < 0.3 * B.h).sort((a, b) => a[1].cy - b[1].cy);
  const bottom = flat[0]?.[0] ?? ctx.strokes.length - 1, top = ctx.strokes.map((s, i) => [i, stage.strokeBox(i).maxY]).sort((a, b) => b[1] - a[1])[0][0];
  const jawUp = ctx.strokes.map((_, i) => i).filter((i) => i !== bottom);       // the upper jaw: the top stroke and the sides hanging from it
  const yTop = B.maxY, yBot = stage.strokeBox(bottom).cy;
  // the cavity, with a dark throat and a uvula
  const cav = new THREE.Mesh(cavityGeo(), kitMaterial(0.16, { roughness: 1, metalness: 0 })); cav.frustumCulled = false;
  const uvula = solidProp([[G.capsule(0.014 * u, 0.04 * u, 0, -0.03 * u, 0), 0xd8607a], [G.sphere(0.017 * u, 0, -0.07 * u, 0), 0xe27088]], 0.5);
  // lip rim (red) and gum (pink) for each jaw; the lower one is the upper one's mirror image
  const rim = (s) => solidProp([[G.sphere(1, 0, -s * 0.034 * u, 0.004 * u, hw * 1.02, 0.026 * u, 0.034 * u), 0xcc3a52], [G.sphere(1, 0, -s * 0.066 * u, 0, hw * 0.97, 0.03 * u, 0.04 * u), 0xe88a98], [G.sphere(1, 0, -s * 0.05 * u, 0.012 * u, hw * 0.93, 0.012 * u, 0.025 * u), 0xf2a8b2]], 0.45);
  const lipU = rim(1), lipL = rim(-1);
  // teeth: rounded, separate; slightly different shades and sizes so they read as teeth, not a comb
  const tw = hw * 2 * 0.86 / NT, teeth = many([[G.sphere(1, 0, 0, 0, tw * 0.5, 0.06 * u, 0.03 * u), 0xffffff]], 2 * NT, 0.5);
  for (let i = 0; i < 2 * NT; i++) teeth.setColorAt(i, new THREE.Color().setHSL(0.12, 0.35, 0.93 - 0.03 * ((i * 7) % 3)));
  // the tongue: a flat rounded body with two tip lobes, a centre groove and a glossy highlight
  const TL = hw * 0.78, TWd = hw * 0.5;
  const tongue = solidProp([[G.sphere(1, 0, 0, 0, TWd, 0.06 * u, TL), 0xe05068], [G.sphere(1, 0, -0.004 * u, TL * 0.92, TWd * 0.92, 0.05 * u, TL * 0.34), 0xe85a72],
    [G.sphere(1, 0, 0.056 * u, TL * 0.05, 0.007 * u, 0.006 * u, TL * 0.8), 0xb83450], [G.sphere(1, -TWd * 0.3, 0.052 * u, TL * 0.3, TWd * 0.26, 0.009 * u, TL * 0.28), 0xff9aa8]], 0.38);
  tongue.material.roughness = 0.22;
  const ah = textPlane('あー', { h: 0.3 * u, color: '#ffffff', bg: '#d83a4a', pad: 0.3 });
  group.add(cav, uvula, lipU, lipL, teeth, tongue, ah);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open1: [0.2, 0.4, 'back'], shut1: [2.4, 0.3, 'in'], open2: [3.0, 0.35, 'back'], shut2: [4.8, 0.3, 'in'] });
      const o = pre ? 0 : 0.34 * u * (T.open1 - T.shut1) + 0.55 * u * (T.open2 - T.shut2) + 0.015 * u * Math.sin(v * 5) * (T.open1 - T.shut1);
      const up = 0.75 * o, dn = 0.25 * o;
      stage.offset(bottom, 0, -dn, 0.012 * u); for (const i of jawUp) stage.offset(i, 0, up, 0.012 * u);
      const yT = yTop + up, yB = yBot - dn, gap = yT - yB, cy = (yT + yB) / 2, k = o > 0.012 * u;
      cav.visible = uvula.visible = lipU.visible = lipL.visible = teeth.visible = tongue.visible = k;
      const ry = Math.max(1e-3, gap / 2 - 0.02 * u), rz = (0.1 + 0.9 * (gap / u - 0.4)) * u * 0.28 + 0.1 * u;
      cav.position.set(B.cx, cy, -0.012 * u); cav.scale.set(hw * 0.88, ry - 0.008 * u, rz);
      const zc = -0.09 * u, ceil = cy + ry * Math.sqrt(Math.max(0, 1 - (zc / rz) ** 2));
      uvula.position.set(B.cx, ceil - 0.01 * u, zc); uvula.visible = k && o > 0.3 * u; uvula.scale.setScalar(0.8 + 0.4 * Math.sin(v * 3) * 0 + 0.2 * (o / u));
      lipU.position.set(B.cx, yT, 0.012 * u); lipL.position.set(B.cx, yB, 0.012 * u);
      for (let i = 0; i < NT; i++) {
        const f = (i + 0.5) / NT, x = B.cx + (f - 0.5) * hw * 2 * 0.86, mid = 1 - Math.abs(f - 0.5) * 2, sk = 0.92 + 0.12 * mid, tilt = (f - 0.5) * 0.12;
        teeth.set(i, x, yT - 0.11 * u - 0.012 * u * mid, 0.016 * u, sk, tilt);
        teeth.set(NT + i, x, yB + 0.1 * u + 0.008 * u * mid, 0.016 * u, 0.86 * sk, -tilt);
      }
      teeth.commit();
      const stick = pre ? 0 : between(v, 0.6, 0.95) * (1 - between(v, 2.0, 2.35)), lift = 0.5 * ((pre ? 0 : T.open2 - T.shut2));
      const rest = yB + 0.1 * u + 0.07 * u;
      tongue.position.set(B.cx + 0.02 * u * Math.sin(v * 9) * stick, rest + lift * 0.05 * u - 0.1 * u * stick, -0.06 * u + (hw * 1.15 + 0.02 * u) * stick);
      tongue.rotation.set(0.55 * stick - 0.08 * lift, 0.32 * Math.sin(v * 9) * stick, 0.1 * Math.sin(v * 9 + 1) * stick);
      tongue.scale.set(1, 1, 1 + 0.25 * stick);
      const say = pre ? 0 : between(v, 3.3, 3.6) * (1 - between(v, 4.6, 4.8));
      ah.visible = say > 0.01; ah.scale.setScalar(grow(say)); ah.position.set(B.maxX + 0.45 * u, B.maxY + 0.05 * u + 0.03 * u * Math.sin(v * 8), 0.05 * u);
    },
  };
}
