// Model-free scene for なる (to become), flag-fix round 4.
//   caterpillar-butterfly: a green caterpillar on a leaf crawls along a branch, round its tip and under it, spins silk and
//                  turns into a green chrysalis; the chrysalis shakes, a butterfly crawls out, hangs, pumps its wings open and
//                  flutters away up into the sky (なった!). The branch sits on a little tree with a grassy foot.
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { label, pop, lerp } from './q-common.js';
import { flatDisc } from './words4-kit.js';

const HUSK = new THREE.Color(0.78, 0.72, 0.52), WHITE = new THREE.Color(1, 1, 1);

// one wing of a butterfly (right side, x >= 0), about 0.7 wide: dark border, orange forewing, blue hindwing, white dots
function wingGeos() {
  const fore = new THREE.Shape(); fore.moveTo(0.03, 0.02); fore.bezierCurveTo(0.12, 0.55, 0.5, 0.78, 0.66, 0.62); fore.bezierCurveTo(0.74, 0.46, 0.62, 0.12, 0.03, -0.02);
  const hind = new THREE.Shape(); hind.moveTo(0.03, -0.01); hind.bezierCurveTo(0.5, 0.06, 0.66, -0.18, 0.5, -0.42); hind.bezierCurveTo(0.36, -0.62, 0.08, -0.5, 0.03, -0.1);
  const g = (s, z = 0, k = 1, cx = 0, cy = 0) => new THREE.ShapeGeometry(s).translate(-cx, -cy, 0).scale(k, k, 1).translate(cx, cy, z);
  return { fore: g(fore), foreIn: g(fore, 0.003, 0.84, 0.3, 0.22), hind: g(hind, 0.001), hindIn: g(hind, 0.004, 0.8, 0.3, -0.2) };
}
function butterfly() {
  const w = wingGeos(), dot = (x, y, r, z, c) => [flatDisc(r, r, x, y, z), c];
  const wing = solidProp([[w.fore, 0x2a1a30], [w.foreIn, 0xff8a1e], [w.hind, 0x2a1a30], [w.hindIn, 0x3a8cf0], dot(0.5, 0.55, 0.035, 0.006, 0xffffff), dot(0.58, 0.4, 0.028, 0.006, 0xffffff), dot(0.42, 0.66, 0.025, 0.006, 0xffffff), dot(0.34, -0.3, 0.05, 0.007, 0xffe040), dot(0.22, -0.4, 0.03, 0.007, 0xff6a9a), dot(0.2, 0.3, 0.06, 0.006, 0xffd060)], 0.6);
  const body = solidProp([[G.capsule(0.045, 0.4, 0, -0.1, 0), 0x3a2a24], [G.sphere(0.065, 0, 0.22, 0), 0x3a2a24], [G.sphere(0.014, -0.03, 0.26, 0.05), 0xffffff], [G.sphere(0.014, 0.03, 0.26, 0.05), 0xffffff],
    [G.torus(0.09, 0.008, Math.PI * 0.45, -0.045, 0.27, 0, 1.2), 0x3a2a24], [G.torus(0.09, 0.008, Math.PI * 0.45, 0.045, 0.27, 0, 0.45), 0x3a2a24]], 0.5);
  const g = new THREE.Group(), wr = new THREE.Group(), wl = new THREE.Group(), mr = wing, ml = wing.clone();
  ml.material = wing.material; ml.scale.x = -1; wr.add(mr); wl.add(ml); g.add(body, wr, wl);
  return { group: g, open(a) { wr.rotation.y = -a; wl.rotation.y = a; }, wing, ml };
}

export function becomeButterfly(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY, group = new THREE.Group();
  const x0 = B.maxX + 0.1 * u, yb = floor + 1.0 * u, xt = x0 + 0.85 * u, tipX = x0 + 0.1 * u, rc = 0.06 * u, gap = 0.1 * u, N = 8, xp = tipX + 0.4 * u;
  const rad = (x) => lerp(0.035 * u, 0.065 * u, Math.min(1, Math.max(0, (x - tipX) / (xt - tipX))));
  const leafA = x0 + 0.35 * u, leafB = x0 + 0.75 * u, sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const tree = solidProp([
    [G.cyl(0.065 * u, 0.035 * u, xt - tipX, (tipX + xt) / 2, yb, 0, 0, 0, -Math.PI / 2), 0x7a5232], [G.sphere(0.035 * u, tipX, yb, 0), 0x7a5232],
    [G.cyl(0.075 * u, 0.12 * u, yb - floor + 0.05 * u, xt, (yb + 0.05 * u + floor) / 2, 0), 0x6a4528], [G.sphere(0.34 * u, xt + 0.05 * u, floor, 0, 1.2, 0.3, 1), 0x58b040],
    [G.sphere(0.3 * u, xt + 0.12 * u, yb + 0.28 * u, -0.05 * u), 0x3a9a40], [G.sphere(0.22 * u, xt - 0.12 * u, yb + 0.22 * u, -0.08 * u), 0x4ab048], [G.sphere(0.18 * u, xt + 0.3 * u, yb + 0.05 * u, -0.05 * u), 0x3a9a40],
    [G.sphere(0.25 * u, (leafA + leafB) / 2, yb + rad(leafA + 0.3 * u) + 0.012 * u, 0, 1.1, 0.07, 0.5), 0x66c850],
    [G.sphere(1, 0, 0, 0, 0.3 * u, 0.15 * u, 0.02 * u).rotateZ(0.3).translate(x0 + 0.55 * u, yb + 0.17 * u, -0.07 * u), 0x58b848], [G.sphere(1, 0, 0, 0, 0.21 * u, 0.1 * u, 0.02 * u).rotateZ(-0.35).translate(x0 + 0.25 * u, yb + 0.14 * u, -0.07 * u), 0x66c850], [G.box(0.5 * u, 0.006 * u, 0.012 * u, (leafA + leafB) / 2, yb + rad(leafA + 0.3 * u) + 0.03 * u, 0), 0xb4e890],
  ], 0.4);
  // the caterpillar's road: over the branch (leaf), round the tip, back along the underside to the chrysalis spot
  const PX = [], PY = [], push = (x, y) => { PX.push(x); PY.push(y); };
  const topY = (x) => yb + rad(x) + 0.045 * u + 0.03 * u * sm(leafA, leafA + 0.1 * u, x) * (1 - sm(leafB - 0.1 * u, leafB, x));
  for (let x = x0 + 0.7 * u; x > tipX; x -= 0.02 * u) push(x, topY(x));
  const d0 = rad(tipX) + 0.045 * u;
  for (let a = 90; a <= 270; a += 6) push(tipX + d0 * Math.cos(a * Math.PI / 180), yb + d0 * Math.sin(a * Math.PI / 180));
  for (let x = tipX + 0.02 * u; x < xp; x += 0.02 * u) push(x, yb - rad(x) - 0.045 * u);
  const CL = [0]; for (let i = 1; i < PX.length; i++) CL.push(CL[i - 1] + Math.hypot(PX[i] - PX[i - 1], PY[i] - PY[i - 1]));
  const L = CL[CL.length - 1], at = (s) => {
    s = Math.min(L, Math.max(0, s)); let i = 1; while (i < CL.length - 1 && CL[i] < s) i++;
    const k = (s - CL[i - 1]) / Math.max(1e-6, CL[i] - CL[i - 1]);
    return [lerp(PX[i - 1], PX[i], k), lerp(PY[i - 1], PY[i], k), Math.atan2(PY[i] - PY[i - 1], PX[i] - PX[i - 1])];
  };
  const segs = many([[G.sphere(rc), 0x6cc040], [G.sphere(rc * 0.42, 0, rc * 0.82, 0), 0xffe040]], N, 0.5);
  const head = solidProp([[G.sphere(rc * 1.15), 0xff9a30], [G.sphere(rc * 0.25, rc * 0.7, rc * 0.4, rc * 0.7), 0x202020], [G.sphere(rc * 0.25, rc * 0.7, rc * 0.4, -rc * 0.7), 0x202020], [G.cyl(rc * 0.08, rc * 0.08, rc * 0.8, rc * 0.7, rc * 1.2, rc * 0.35, 0, 0, -0.5), 0x202020], [G.cyl(rc * 0.08, rc * 0.08, rc * 0.8, rc * 0.7, rc * 1.2, -rc * 0.35, 0, 0, -0.5), 0x202020]], 0.5);
  // the chrysalis hangs from the branch underside at xp
  const ya = yb - rad(xp), ph = 0.42 * u, pod = solidProp([[G.sphere(0.11 * u, 0, -ph / 2, 0, 1, 1.9, 1), 0x9ad45a], [G.sphere(0.04 * u, 0, -0.02 * u, 0, 1, 0.8, 1), 0x6a9a3a], [G.cyl(0.006 * u, 0.006 * u, 0.05 * u, 0, 0.012 * u, 0), 0xf0f0f0],
    ...[[0.055, 0.17], [-0.055, 0.24], [0.07, 0.31], [-0.04, 0.11]].map(([dx, dy]) => [G.sphere(0.017 * u, dx * u, -dy * u, 0.095 * u), 0xffd34a])], 0.5);
  const silk = many([[G.torus(0.113 * u, 0.006 * u).rotateX(Math.PI / 2), 0xffffff]], 6, 0.9), bf = butterfly(), hi = label(u, 'なった!', '#e0508a', 0.17);
  pod.position.set(xp, ya, 0); silk.position.set(xp, ya, 0);
  group.add(tree, segs, head, pod, silk, bf.group, hi);
  const loop = 15.5, s0 = (N + 1) * gap, S = 0.8 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { crawl: [0.5, 4.5, 'smooth'], spin: [5.4, 1.4], podUp: [6.0, 0.8], emerge: [9.0, 0.9], open: [9.9, 1.0], fly: [11.7, 2.9, 'linear'], husk: [9.0, 0.6] });
      // the caterpillar (pops back in at the end of the loop)
      const hs = lerp(s0, L, T.crawl), alive = pre ? 1 : Math.min(1, 1 - T.spin + between(v, 14.8, 15.4)), convA = pre ? 0 : T.spin * (1 - between(v, 14.8, 15.4));
      const target = [xp, ya - 0.21 * u];
      const place = (i, s) => {
        const [x, y, a] = at(s), hump = (y > yb && !pre && v < 5.4 ? 0.035 * u * Math.max(0, Math.sin(s / (0.3 * u) * Math.PI * 2 + 1)) : 0);
        return [lerp(x, target[0], convA), lerp(y + hump, target[1], convA), a];
      };
      for (let i = 0; i < N; i++) { const [x, y] = place(i, hs - (i + 1) * gap); segs.set(i, x, y, 0, alive * (1 - 0.05 * i)); }
      segs.commit();
      const [hx, hy, ha] = place(-1, hs); head.visible = alive > 0.02; head.position.set(hx, hy, 0); head.rotation.z = ha; head.scale.setScalar(Math.max(1e-3, alive));
      // silk rings wrap round the chrysalis one after another, the pod swells out of them
      for (let i = 0; i < 6; i++) { const y = -0.07 * u - 0.062 * u * i, k = Math.sqrt(Math.max(0.05, 1 - Math.pow((y + ph / 2) / (ph / 2 * 1.0), 2))) * 1.05; silk.set(i, 0, y, 0, pre ? 0 : k * between(v, 5.4 + i * 0.18, 5.7 + i * 0.18) * (1 - between(v, 7.0, 7.3))); }
      silk.commit();
      const sw = pre ? 0 : 0.05 * Math.sin(v * 2.2) * between(v, 6.8, 7.4) * (1 - between(v, 8.6, 8.7)) + 0.12 * wobble(v, 8.7, 0.6, 7);
      pod.visible = !pre && v > 6.0 && v < 14.9; pod.rotation.z = sw; silk.rotation.z = sw;
      pod.scale.setScalar(Math.max(1e-3, T.podUp * (1 - between(v, 14.5, 14.9)))); pod.material.color.copy(WHITE).lerp(HUSK, T.husk);
      // the butterfly: crawls out of the pod's lower end, hangs folded, pumps its wings open, then flutters off
      const hang = [xp, ya - ph - 0.02 * u], f = T.fly, flying = !pre && v >= 11.7;
      let bx = hang[0] + 0.02 * u * T.emerge, by = hang[1] - 0.2 * S * T.emerge - 0.05 * u * T.open, sc = 0.25 + 0.75 * T.emerge, a = 1.4 - 1.2 * T.open + 0.1 * Math.sin(v * 3) * T.open;
      let bz = 0.12 * u, roll = 0;
      if (flying) {
        bx = hang[0] + 0.1 * u + 0.7 * u * f + 0.12 * u * Math.sin(f * 11); by = hang[1] - 0.25 * u + 1.6 * u * f + 0.05 * u * Math.sin(f * 17); sc = 1 - 0.4 * f; bz = 0.2 * u; roll = 0.25 * Math.cos(f * 11);
        a = 0.15 + 0.95 * (0.5 + 0.5 * Math.cos(v * 24));
      } else if (!pre && v >= 10.8) a = 0.2 + 0.8 * (0.5 + 0.5 * Math.cos((v - 10.8) * 6)) * between(v, 10.8, 11.0);
      bf.group.visible = !pre && v >= 9.0 && f < 0.995; bf.group.position.set(bx, by, bz); bf.group.scale.setScalar(Math.max(1e-3, S * sc)); bf.group.rotation.z = roll; bf.open(Math.max(0, a));
      pop(hi, pre ? 0 : between(v, 10.8, 11.1) * (1 - between(v, 13.5, 13.8)), xp + 0.62 * u, yb - 0.38 * u, 0.15 * u);
    },
  };
}
export const SCENES = { 'caterpillar-butterfly': becomeButterfly };
