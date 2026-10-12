// 切 / 切る: a chef's knife (Kenney food kit cleaver) held the way a cook at the board holds it: handle toward you, front
// right, the blade pointing away into the scene, so you see its spine and one side at an angle, never the flat face square-on.
//   chop-split            the knife comes down through the middle of the kanji; a flash along the cut, the halves slide apart, back
//   chop-split food carrot  the knife slices rounds off a carrot lying on a cutting board (Kenney carrot's leafy top)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp, kitMaterial, mergeColored } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { createModel } from '../models.js';
import { between } from './helpers.js';

const YAW = -0.96;                                    // the handle points (sin 55 deg, 0, cos 55 deg): toward you, to the right
// The knife: origin at the middle of the blade's cutting edge, edge down, handle toward the viewer (front right).
// The model lies flat (length along x, handle +x, edge on +z); roll it on to its edge, then turn it about the vertical.
export function knifeModel(len, steel = false) {
  const m = createModel('chopKnife', { width: len, ownMaterials: steel }), k = len / 0.6, rot = new THREE.Group(), g = new THREE.Group();
  if (steel) m.materials.forEach((q) => { q.emissiveIntensity = 0.12; q.color.setHex(0x7d8696); q.metalness = 0.45; q.roughness = 0.35; q.transparent = false; q.opacity = 1; });   // opaque mid-grey steel, not a pale glow
  m.group.position.set(0.125 * k, -0.02 * k, -0.11 * k);              // the blade-edge middle (x -0.125, y 0.02, z 0.11 in the model) to the origin
  rot.add(m.group); rot.rotation.order = 'YXZ'; rot.rotation.set(Math.PI / 2, YAW, 0);
  // detail on the plain model: steel bolster, brass end cap, two rivets, a bright edge bevel and a darker spine, in the model's frame
  const part = (w, h, d, x, y, z, c) => [G.box(w * k, h * k, d * k, x * k, y * k, z * k), c];
  const trim = solidProp([part(0.34, 0.014, 0.014, -0.125, 0.02, 0.112, 0xffffff), part(0.34, 0.046, 0.014, -0.125, 0.02, -0.098, 0x3c4452), part(0.022, 0.05, 0.1, 0.05, 0.02, -0.07, 0xc4ccd8), part(0.012, 0.046, 0.07, 0.3, 0.02, -0.07, 0xc8a050),
    ...[0.13, 0.22].map((x) => [G.cyl(0.013 * k, 0.013 * k, 0.052 * k, x * k, 0.02 * k, -0.07 * k, 0, 0, 0, 10), 0xe8e8e8])], 0.4);
  m.group.add(trim);
  g.add(rot); g.userData.k = k;
  return g;
}

function chopSplit(ctx, spec, stage) {
  if (spec.food) return chopCarrot(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), xm = B.cx;
  const knife = knifeModel(1.9 * u, true), flash = solidProp([[G.box(0.02 * u, B.h * 1.1, 0.01 * u, 0, 0, 0), 0xffffff]], 2);
  const side = ctx.strokes.map((s) => (s.pts.reduce((a, p) => a + p.x, 0) / s.pts.length < xm ? -1 : 1));
  group.add(knife, flash);
  const loop = 4.2, top = B.maxY + 0.2 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { chop: [0.2, 0.35, 'in'], apart: [0.55, 0.45, 'back'], lift: [1.0, 0.6, 'out'], close: [2.8, 0.6], drop: [3.6, 0.5] });
      const y = pre ? top : top - (B.h + 0.3 * u) * T.chop + (B.h + 0.7 * u) * T.lift - 0.4 * u * T.drop;   // waits above, chops, lifts, settles back
      knife.position.set(xm, y, 0); knife.visible = !pre || A.setup > 0.6;
      const gap = pre ? 0 : 0.14 * u * (T.apart - T.close);
      side.forEach((d, si) => stage.offset(si, d * gap, -0.02 * u * Math.abs(gap) / (0.14 * u) * (d < 0 ? 1 : 0.5), 0));
      const fl = pre ? 0 : bump(v, 0.5, 0.35); flash.visible = fl > 0; flash.position.set(xm, B.cy, 0.08 * u); flash.scale.set(1 + 2 * fl, fl, 1);
    },
  };
}

// carrot rounds along x (cylinders of unit radius and length, scaled per round: the carrot tapers)
function rounds(n) {
  const cut = 0xffc468, geo = mergeColored([[G.cyl(1, 1, 1, 0, 0, 0, 0, 0, Math.PI / 2, 14), 0xff8420], [G.cyl(0.8, 0.8, 0.03, 0.5, 0, 0, 0, 0, Math.PI / 2, 14), cut], [G.cyl(0.8, 0.8, 0.03, -0.5, 0, 0, 0, 0, Math.PI / 2, 14), cut], [G.cyl(0.35, 0.35, 0.034, 0.5, 0, 0, 0, 0, Math.PI / 2, 14), 0xffe0a0], [G.cyl(0.35, 0.35, 0.034, -0.5, 0, 0, 0, 0, Math.PI / 2, 14), 0xffe0a0]]);
  const mesh = new THREE.InstancedMesh(geo, kitMaterial(0.45), n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  mesh.frustumCulled = false;
  mesh.put = (i, x, y, z, len, r, ry = 0, rz = 0, on = 1) => mesh.setMatrixAt(i, m.compose(p.set(x, y, z), q.setFromEuler(e.set(0, ry, rz)), s.set(Math.max(1e-4, len * on), Math.max(1e-4, r * on), Math.max(1e-4, r * on))));
  mesh.commit = () => { mesh.instanceMatrix.needsUpdate = true; };
  return mesh;
}

// the Kenney carrot's green top only: its triangles whose texture lookup is the leaf colour
function carrotTop(height) {
  const c = createModel('carrot', { height }), top = new THREE.Group();
  c.group.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry, uv = g.attributes.uv, ix = g.index ? [...g.index.array] : [...Array(g.attributes.position.count).keys()], keep = [];
    for (let i = 0; i < ix.length; i += 3) if ((uv.getX(ix[i]) + uv.getX(ix[i + 1]) + uv.getX(ix[i + 2])) / 3 < 0.7) keep.push(ix[i], ix[i + 1], ix[i + 2]);
    const ng = g.clone(); ng.setIndex(keep); o.geometry = ng;
  });
  top.add(c.group); return top;
}

export function chopCarrot(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.58 * u, N = 5;
  const bench = new THREE.Group(); bench.position.set(bx, floor, 0); bench.rotation.x = 0.3;            // the board tilts toward you so the top shows
  const boardW = 0.98 * u, board = createModel('cuttingBoard', { width: boardW * 0.58 / 0.82 }), kb = boardW / 0.82, topY = 0.06 * kb;
  board.group.rotation.y = Math.PI / 2;
  // the carrot: body 0.4 of the model long (crown at the left, tip at the right), the model's leaves on the crown
  const kc = 1.5 * u, Lb = 0.4 * kc, xL = -0.5 * Lb - 0.08 * u, rAt = (s) => (0.062 - 0.036 * Math.pow(s, 1.3)) * kc / 1.0;
  const lens = [...Array(N)].map(() => Lb / N), starts = lens.map((_, i) => xL + i * Lb / N);
  const rr = lens.map((_, i) => rAt((i + 0.5) / N)), y0 = topY + rAt(0.1) * 0.98;
  const sl = rounds(N), leaves = carrotTop(0.72 * kc), leafHold = new THREE.Group();
  leaves.position.y = -0.4 * kc; leafHold.add(leaves); leafHold.rotation.z = Math.PI / 2 - 0.55; leafHold.scale.setScalar(0.62);
  leafHold.position.set(xL - 0.01 * u, y0 - 0.01 * u, 0.02 * u);
  const knife = knifeModel(0.85 * u);
  bench.add(board.group, sl, leafHold, knife);
  group.add(bench);
  const loop = 4.6, CH = [0.4, 1.0, 1.6, 2.2], upY = y0 + 0.3 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const cuts = pre ? 0 : CH.filter((c) => v >= c + 0.25).length, back = between(v, 3.9, 4.4);
      for (let i = 0; i < N; i++) {
        const cut = i >= N - cuts, k = cut ? between(v, CH[N - 1 - i] + 0.25, CH[N - 1 - i] + 0.6) : 0;
        const x = starts[i] + lens[i] / 2 + 0.03 * u * k * (i - 1) + 0.02 * u * k;
        sl.put(i, x, y0 - 0.02 * u * k, 0.02 * u + 0.04 * u * k, lens[i] * 0.97, rr[i], 1.35 * k, 0, 1 - back);   // cut rounds turn to show their faces
      }
      sl.commit();
      leafHold.visible = back < 1;
      // the knife comes down at the next cut, working left from the thin end
      const ci = pre ? 0 : Math.min(3, Math.max(0, Math.floor((v - 0.1) / 0.6))), chop = pre ? 0 : bump(v, CH[ci] - 0.05, 0.6);
      knife.position.set(starts[N - 1 - ci] - 0.01 * u + 0.1 * u * bump(v, CH[ci] + 0.25, 0.5), topY + (upY - topY) * (1 - chop) + 0.02 * u, 0.02 * u);
      knife.visible = !pre && v < 3.0;
    },
  };
}

export const SCENES = { 'chop-split': chopSplit };
