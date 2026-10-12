// Model-free scenes for flagged word cards (round 4), part a.
//   tooth-brush 歯: a big friendly molar (crown, two roots, gum) with brown plaque spots and a worried face; a hand brings a
//                  toothbrush with a blob of toothpaste and scrubs back and forth across its top, foam piling up; the foam pops,
//                  the tooth shines white, sparkles, grins and hops (ピカピカ!)
//   easel-picture 絵: a big gilt frame on an easel; a hand with a paintbrush paints the picture inside it stroke by stroke: sky,
//                  sun, cloud, two hills, a tree, flowers. Every painted piece is built inside the frame's inner rectangle.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { createHand } from '../pieces/kit-hand.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo } from './helpers.js';
import { seeded } from './step1-kit.js';
import { label, pop, lerp } from './q-common.js';
import { handAim, sparkleShape } from './words4-kit.js';

const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), CLEAN = new THREE.Color(1, 1, 1), DIRTY = new THREE.Color(1, 0.86, 0.58);

// a molar's crown: a rounded box (superellipsoid), two cusps on top with a dip between, narrower at the neck
function crownGeo(u, rx, ry, rz) {
  const g = new THREE.SphereGeometry(1, 36, 24), p = g.attributes.position, f = (c) => Math.sign(c) * Math.pow(Math.abs(c), 2 / 3);
  for (let i = 0; i < p.count; i++) {
    let x = f(p.getX(i)), y = f(p.getY(i)), z = f(p.getZ(i)); const bot = Math.max(0, -y);
    x *= 1 - 0.2 * bot; z *= 1 - 0.15 * bot;
    p.setXYZ(i, x * rx, y * ry + (y > 0 ? 0.055 * u * Math.sin(Math.PI * Math.min(1, Math.abs(x))) * y : 0), z * rz);
  }
  g.computeVertexNormals();
  return g;
}

// ---- 歯 ----
export function toothBrush(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY, group = new THREE.Group(), tg = new THREE.Group();
  const cx = B.maxX + 0.75 * u, rx = 0.34 * u, ry = 0.26 * u, rz = 0.27 * u, cy = 0.62 * u;
  const topY = (x) => { const a = Math.min(1, Math.abs(x / rx)), y = Math.pow(Math.max(0, 1 - a * a * a), 1 / 3); return cy + y * ry + 0.055 * u * Math.sin(Math.PI * a) * y; };
  const frontZ = (x, y) => rz * Math.pow(Math.max(0.001, 1 - Math.pow(Math.abs(x / rx), 3) - Math.pow(Math.abs((y - cy) / ry), 3)), 1 / 3);
  const root = (sx) => G.cyl(0.1 * u, 0.045 * u, 0.3 * u, sx * 0.15 * u, 0.25 * u, 0, 0, 0, sx * 0.2);
  const tooth = solidProp([[crownGeo(u, rx, ry, rz).translate(0, cy, 0), 0xfdfcf8], [root(-1), 0xf3ecd8], [root(1), 0xf3ecd8], [G.sphere(0.045 * u, 0.15 * u, 0.1 * u, 0), 0xf3ecd8], [G.sphere(0.045 * u, -0.15 * u, 0.1 * u, 0), 0xf3ecd8]], 0.4);
  const gum = solidProp([[G.sphere(0.5 * u, 0, 0, 0, 1.1, 0.3, 0.62), 0xf08aa0], [G.sphere(0.5 * u, 0, 0.01 * u, 0.03 * u, 1.0, 0.3, 0.56), 0xf49ab0]], 0.4);
  const shine = [G.sphere(0.03 * u, -0.17 * u, cy + 0.17 * u, frontZ(-0.17 * u, cy + 0.17 * u) - 0.01 * u, 1.2, 2.2, 0.5), 0xffffff];
  const eyes = (arc) => (arc ? [-1, 1].map((s) => [G.torus(0.032 * u, 0.009 * u, Math.PI, s * 0.1 * u, cy + 0.04 * u, frontZ(s * 0.1 * u, cy + 0.04 * u) - 0.004 * u), 0x30241c]) : [-1, 1].flatMap((s) => [[G.sphere(0.028 * u, s * 0.1 * u, cy + 0.05 * u, frontZ(s * 0.1 * u, cy + 0.05 * u) - 0.012 * u, 0.8, 1.35, 0.5), 0x30241c], [G.sphere(0.009 * u, s * 0.1 * u + 0.008 * u, cy + 0.065 * u, frontZ(s * 0.1 * u, cy + 0.06 * u) - 0.004 * u), 0xffffff]]));
  const fz = (y) => frontZ(0, y) - 0.003 * u;
  const sad = solidProp([...eyes(false), [G.torus(0.06 * u, 0.01 * u, Math.PI * 0.8, 0, cy - 0.11 * u, fz(cy - 0.09 * u), Math.PI * 0.1), 0x30241c], shine], 0.5);
  const happy = solidProp([...eyes(true), [G.torus(0.09 * u, 0.012 * u, Math.PI, 0, cy - 0.01 * u, fz(cy - 0.06 * u), Math.PI), 0x30241c], [G.sphere(0.05 * u, 0, cy - 0.065 * u, fz(cy - 0.085 * u) - 0.01 * u, 1.5, 0.55, 0.3), 0xe85a6a],
    ...[-1, 1].map((s) => [G.sphere(0.04 * u, s * 0.2 * u, cy - 0.03 * u, frontZ(s * 0.2 * u, cy - 0.03 * u) - 0.012 * u, 1.2, 0.8, 0.3), 0xff8aa0]), shine], 0.5);
  const spotAt = [[-0.2, 0.13], [0.2, 0.15], [0.25, 0.0], [-0.27, -0.02], [-0.06, 0.2]], spots = many([[G.sphere(0.05 * u, 0, 0, 0, 1, 0.8, 0.35), 0x8a5a1c]], 5, 0.3);
  const rnd = seeded(7), N = 24, bub = [];
  for (let i = 0; i < N; i++) { const x = (rnd() - 0.5) * 0.6 * u, y = topY(x) - 0.01 * u - rnd() * 0.1 * u, z = (rnd() - 0.5) * 0.36 * u; bub.push({ x, y, z, r: (0.8 + 0.7 * rnd()) }); }
  const foam = many([[G.sphere(0.07 * u), 0xeaf6ff]], N, 0.75);
  tg.add(tooth, sad, happy, spots, foam); tg.position.set(cx, floor, 0); gum.position.set(cx, floor, 0);
  // the toothbrush: tip at the origin, handle up (+y); toothpaste on the bristles
  const ub = 1.4 * u;
  const brush = solidProp([[G.box(0.1 * ub, 0.07 * ub, 0.09 * ub, -0.09 * ub, 0.035 * ub, 0), 0x38b0ff], [G.box(0.1 * ub, 0.07 * ub, 0.09 * ub, 0.09 * ub, 0.035 * ub, 0), 0x38b0ff], [G.box(0.08 * ub, 0.07 * ub, 0.09 * ub, 0, 0.035 * ub, 0), 0xffffff],
    [G.box(0.3 * ub, 0.03 * ub, 0.1 * ub, 0, 0.085 * ub, 0), 0x2f7fd8], [G.cyl(0.02 * ub, 0.026 * ub, 0.16 * ub, 0, 0.17 * ub, 0), 0x2f7fd8], [G.capsule(0.032 * ub, 0.4 * ub, 0, 0.46 * ub, 0), 0x2f9fe8], [G.box(0.05 * ub, 0.12 * ub, 0.045 * ub, 0, 0.5 * ub, 0.005 * ub), 0xffffff]], 0.45);
  const paste = solidProp([[G.sphere(0.034 * ub, -0.05 * ub, -0.012 * ub, 0, 1.6, 0.6, 0.9), 0xb8f4d0], [G.sphere(0.03 * ub, 0.04 * ub, -0.01 * ub, 0, 1.5, 0.6, 0.9), 0xffffff]], 0.6);
  brush.add(paste);
  const hand = createHand({ u: 1.0 * u, sleeve: 0xe0782a }); hand.pose('grip');
  const spark = many([[new THREE.ExtrudeGeometry(sparkleShape(), { depth: 0.06, bevelEnabled: false }).translate(0, 0, -0.03), 0xfff6a0]], 6, 1);
  const hi = label(u, 'ピカピカ!', '#e0508a', 0.15);
  group.add(gum, tg, brush, hand.group, spark, hi);
  const sparkAt = [[-0.34, 0.95], [0.34, 0.9], [-0.12, 1.12], [0.18, 1.14], [-0.4, 0.68], [0.42, 0.62]], loop = 9.6, tilt = 0.3, aim = new THREE.Vector3(-Math.sin(tilt), Math.cos(tilt), 0), fore = new THREE.Vector3(1, 0.3, 0.55);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0.5, 0.7], down: [1.3, 0.7], up: [5.5, 0.9], out: [6.4, 0.8] });
      const brushing = v >= 2.0 && v < 5.5, ph = Math.max(0, Math.min(3.5, v - 2.0)), sx = brushing || v >= 5.5 ? 0.2 * u * Math.sin(ph * Math.PI * 2 * 4 / 3.5) : 0;
      // brush: far right -> hover -> down on the crown -> scrub -> back up and away
      const bx = cx + sx, restY = Math.max(topY(sx - 0.17 * u), topY(sx + 0.17 * u), topY(sx)) - 0.015 * u + floor, hov = floor + 1.2 * u;
      let x = cx + lerp(1.1 * u, 0.42 * u, T.in), y = lerp(floor + 1.7 * u, hov, T.in);
      if (v >= 1.3) { x = lerp(cx + 0.42 * u, bx, T.down); y = lerp(hov, restY, T.down); }
      if (v >= 5.5) { x = lerp(bx, cx + 0.42 * u, T.up); y = lerp(restY, hov, T.up); }
      if (v >= 6.4) { x = lerp(cx + 0.42 * u, cx + 1.1 * u, T.out); y = lerp(hov, floor + 1.7 * u, T.out); }
      const on = !pre && v > 0.5 && v < 7.2;
      brush.visible = hand.group.visible = on;
      const wig = brushing ? 0.05 * Math.sin(ph * 24) : 0; brush.rotation.z = tilt + wig; brush.position.set(x, y, 0.02 * u);
      paste.scale.setScalar(Math.max(1e-3, 1 - between(v, 2.0, 2.3)));
      handAim(hand, aim.set(-Math.sin(tilt + wig), Math.cos(tilt + wig), 0), fore);
      handTo(hand, x - Math.sin(tilt + wig) * 0.5 * ub, y + Math.cos(tilt + wig) * 0.5 * ub, 0.02 * u);
      // the tooth: scrubbed (wobble), then clean: squash, hop
      const hop = pre ? 0 : bump(v, 6.1, 0.6) * 0.12 * u, sq = pre ? 0 : bump(v, 5.85, 0.25) * 0.1 + bump(v, 6.7, 0.25) * 0.08;
      tg.position.y = floor + hop; tg.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
      tg.rotation.z = brushing ? 0.035 * Math.sin(ph * Math.PI * 2 * 8 / 3.5) : 0;
      const dirty = pre ? 1 : Math.min(1, (1 - between(v, 4.0, 5.6)) + between(v, 8.8, 9.4)), glad = !pre && v >= 6.0 && v < 9.0;
      tooth.material.color.copy(CLEAN).lerp(DIRTY, dirty); sad.visible = !glad; happy.visible = glad;
      spotAt.forEach(([sx0, sy0], i) => { const s = pre ? 1 : Math.min(1, 1 - between(v, 2.6 + 0.45 * i, 3.1 + 0.45 * i) + between(v, 8.8, 9.2)); spots.set(i, sx0 * u, cy + sy0 * u, frontZ(sx0 * u, cy + sy0 * u) - 0.01 * u, s, 0.3 * i); });
      spots.commit();
      bub.forEach((b, i) => {
        const g = pre ? 0 : between(v, 2.3 + i * 0.16, 2.8 + i * 0.16), po = between(v, 5.9 + i * 0.03, 6.05 + i * 0.03), gone = between(v, 6.05 + i * 0.03, 6.25 + i * 0.03);
        foam.set(i, b.x, b.y, b.z, b.r * g * (1 + 0.4 * po) * (1 - gone));
      });
      foam.commit();
      const sp = pre ? 0 : between(v, 6.4, 6.7) * (1 - between(v, 8.3, 8.7));
      sparkAt.forEach(([sx0, sy0], i) => spark.set(i, cx + sx0 * u, floor + sy0 * u, 0.2 * u, 0.2 * u * sp * (0.6 + 0.4 * Math.sin(v * 7 + i * 2)), v * 1.5 + i));
      spark.commit();
      pop(hi, pre ? 0 : between(v, 6.7, 6.95) * (1 - between(v, 8.5, 8.7)), cx + 0.62 * u, floor + 0.98 * u, 0.1 * u);
    },
  };
}

// ---- 絵 ----
export function easelPaint(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY, group = new THREE.Group();
  const W = 1.15 * u, H = 0.9 * u, bar = 0.07 * u, iw = W - 2 * bar, ih = H - 2 * bar, cx = B.maxX + 0.25 * u + W / 2, y0 = floor + 0.27 * u, il = cx - iw / 2, ib = y0 + bar;
  const leg = (tx, ty, tz, bx, bz, r) => { const dy = ty - floor, dx = tx - bx, dz = tz - bz, L = Math.hypot(dy, dx, dz); return G.cyl(r, r, L, (tx + bx) / 2, (ty + floor) / 2, (tz + bz) / 2, Math.atan2(dz, dy), 0, -Math.atan2(dx, dy)); };
  const wood = 0x9a6a3a, gold = 0xd9a43a;
  const frame = solidProp([
    [G.box(W, bar, 0.09 * u, cx, y0 + H - bar / 2, 0), gold], [G.box(W, bar, 0.09 * u, cx, y0 + bar / 2, 0), gold], [G.box(bar, H, 0.09 * u, cx - W / 2 + bar / 2, y0 + H / 2, 0), gold], [G.box(bar, H, 0.09 * u, cx + W / 2 - bar / 2, y0 + H / 2, 0), gold],
    [G.box(iw, 0.012 * u, 0.07 * u, cx, y0 + H - bar - 0.006 * u, 0.0), 0xb8832a], [G.box(iw, 0.012 * u, 0.07 * u, cx, ib + 0.006 * u, 0), 0xb8832a], [G.box(0.012 * u, ih, 0.07 * u, il + 0.006 * u, ib + ih / 2, 0), 0xb8832a], [G.box(0.012 * u, ih, 0.07 * u, il + iw - 0.006 * u, ib + ih / 2, 0), 0xb8832a],
    [G.box(iw, ih, 0.02 * u, cx, ib + ih / 2, -0.01 * u), 0xfbf7ee],
    [leg(cx - 0.42 * u, y0 + 0.85 * H, -0.06 * u, cx - 0.52 * u, -0.02 * u, 0.018 * u), wood], [leg(cx + 0.42 * u, y0 + 0.85 * H, -0.06 * u, cx + 0.52 * u, -0.02 * u, 0.018 * u), wood], [leg(cx, y0 + H + 0.03 * u, -0.07 * u, cx, -0.55 * u, 0.018 * u), 0x8a5a2a],
    [G.box(W + 0.12 * u, 0.04 * u, 0.15 * u, cx, y0 - 0.02 * u, 0.04 * u), wood], [G.box(0.9 * u, 0.025 * u, 0.025 * u, cx, floor + 0.5 * u, -0.045 * u), wood], [G.box(0.22 * u, 0.04 * u, 0.1 * u, cx, y0 + H + 0.02 * u, -0.01 * u), wood],
  ], 0.4);
  // painted pieces, in the inner rectangle's own coordinates (origin: its bottom-left); each sits behind the frame's lip
  const hb = (x) => ih * (0.26 + 0.1 * Math.sin(1.6 + (x / iw) * 3.1)), hf = (x) => ih * (0.12 + 0.07 * Math.cos((x / iw) * 5 + 0.8));
  const hill = (fn) => { const pts = [[0, 0]]; for (let i = 0; i <= 24; i++) pts.push([iw * i / 24, fn(iw * i / 24)]); pts.push([iw, 0]); return new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))); };
  const rect = (x0, y1, x1, y2) => new THREE.PlaneGeometry(x1 - x0, y2 - y1).translate((x0 + x1) / 2, (y1 + y2) / 2, 0);
  const disc = (r, x, y) => new THREE.CircleGeometry(r, 28).translate(x, y, 0);
  const sunP = [0.8 * iw, 0.78 * ih], cloudP = [0.27 * iw, 0.8 * ih], crownP = [0.68 * iw, 0.62 * ih], R = 0.085 * ih;
  const piece = (geo, color, z) => { const m = solidProp([[geo, color]], 0.6); m.userData.z = z; m.visible = false; return m; };
  const rays = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return [disc(0.016 * ih, Math.cos(a) * 1.55 * R, Math.sin(a) * 1.55 * R), 0xffb020]; });
  const sun = solidProp([[disc(R, 0, 0), 0xffd23a], ...rays], 0.7), cloud = solidProp([[disc(0.06 * ih, -0.07 * iw, 0), 0xffffff], [disc(0.075 * ih, 0, 0.02 * ih), 0xffffff], [disc(0.06 * ih, 0.07 * iw, 0), 0xffffff]], 0.7);
  const crown = solidProp([[disc(0.12 * ih, -0.04 * iw, 0), 0x2f8a3a], [disc(0.13 * ih, 0.03 * iw, 0.02 * ih), 0x37a044], [disc(0.1 * ih, 0, 0.09 * ih), 0x2f8a3a], [disc(0.015 * ih, -0.05 * iw, 0.03 * ih), 0xe03030], [disc(0.015 * ih, 0.06 * iw, 0.05 * ih), 0xe03030]], 0.6);
  const sky1 = piece(rect(0, 0.5 * ih, iw, ih), 0x5aa9f0, 0), sky2 = piece(rect(0, 0, iw, 0.56 * ih), 0xa9dcff, 1), hillB = piece(hill(hb), 0x6cc04a, 3), hillF = piece(hill(hf), 0x3e9a38, 4);
  const trunk = piece(rect(-0.018 * iw, 0, 0.018 * iw, 0.4 * ih), 0x7a4a24, 5), flowers = many([[disc(0.012 * ih, 0, 0), 0xffe040], ...[0, 1, 2, 3, 4].map((i) => [disc(0.011 * ih, Math.cos(i * 1.257) * 0.022 * ih, Math.sin(i * 1.257) * 0.022 * ih), i % 2 ? 0xff7aa0 : 0xffffff])], 6, 0.6);
  const flowerAt = [[0.12, 0.1], [0.25, 0.07], [0.4, 0.09], [0.52, 0.06], [0.84, 0.08], [0.93, 0.12]].map(([a, b]) => [a * iw, b * ih]);
  const items = [sky1, sky2, sun, cloud, hillB, hillF, trunk, crown, flowers];
  [[sun, 2], [cloud, 2], [crown, 6], [flowers, 7]].forEach(([m, z]) => { m.userData.z = z; m.visible = false; });
  const brush = solidProp([[G.cyl(0.02 * u, 0.012 * u, 0.08 * u, 0, 0.07 * u, 0), 0xc8ccd4], [G.cyl(0.012 * u, 0.022 * u, 0.3 * u, 0, 0.26 * u, 0), 0xd84030], [G.cyl(0.024 * u, 0.024 * u, 0.03 * u, 0, 0.42 * u, 0), 0x202428]], 0.45);
  const tip = solidProp([[G.cone(0.02 * u, 0.07 * u, 0, 0.035 * u, 0, Math.PI), 0xffffff]], 0.7);
  const hand = createHand({ u: 0.55 * u, sleeve: 0x7a5ad8 }); hand.pose('grip');
  group.add(frame, ...items, brush, tip, hand.group);
  const at = (p) => [il + p[0], ib + p[1]], zp = 0.02 * u, zl = 0.16 * u;
  // strokes: [start, end, piece, kind, brush colour, path(f) -> inner coords]
  const ST = [
    [1.0, 2.0, sky1, 'wipe', 0x5aa9f0, (f) => [iw * f, ih * (0.76 + 0.06 * Math.sin(f * 14))]], [2.5, 3.4, sky2, 'wipe', 0xa9dcff, (f) => [iw * f, ih * (0.38 + 0.08 * Math.sin(f * 12))]],
    [3.8, 4.7, sun, 'pop', 0xffd23a, (f) => [sunP[0] + 0.05 * ih * Math.cos(f * 9), sunP[1] + 0.05 * ih * Math.sin(f * 9)]], [5.0, 5.6, cloud, 'pop', 0xffffff, (f) => [cloudP[0] + 0.07 * iw * Math.sin(f * 14), cloudP[1] + 0.02 * ih * Math.cos(f * 7)]],
    [6.0, 6.8, hillB, 'wipe', 0x6cc04a, (f) => [iw * f, hb(iw * f) * 0.6]], [7.1, 7.9, hillF, 'wipe', 0x3e9a38, (f) => [iw * f, hf(iw * f) * 0.5]],
    [8.2, 8.7, trunk, 'grow', 0x7a4a24, (f) => [crownP[0], ih * (0.1 + 0.4 * f)]], [8.9, 9.6, crown, 'pop', 0x2f8a3a, (f) => [crownP[0] + 0.1 * ih * Math.cos(f * 10), crownP[1] + 0.07 * ih * Math.sin(f * 10)]],
    [9.9, 10.9, flowers, 'flowers', 0xff7aa0, (f) => flowerAt[Math.min(5, Math.floor(f * 6))]],
  ];
  const far = [iw + 0.5 * u, ih + 0.5 * u], loop = 14.0, b = new THREE.Vector3(0.5, 0.28, 0.82).normalize(), fore = new THREE.Vector3(0.9, -0.5, 0.6);
  const fv = (s, v) => between(v, s[0], s[1]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, erase = pre ? 0 : between(v, 12.6, 13.4);
      for (const s of ST) {
        const [, , m, kind] = s, f = pre ? 0 : fv(s, v) * (1 - erase), z = 0.008 * u + 0.003 * u * m.userData.z;
        if (kind === 'flowers') continue;
        m.visible = f > 0.001;
        if (kind === 'wipe') { m.position.set(il, ib, z); m.scale.set(Math.max(1e-3, f), 1, 1); }
        else if (kind === 'grow') { m.position.set(il + crownP[0], ib + 0.1 * ih, z); m.scale.set(1, Math.max(1e-3, f), 1); }
        else { const P = m === sun ? sunP : m === cloud ? cloudP : crownP; m.position.set(il + P[0], ib + P[1], z); m.scale.setScalar(Math.max(1e-3, f)); }
      }
      flowers.visible = !pre && v > 9.9 && erase < 1;
      flowerAt.forEach(([fx, fy], i) => flowers.set(i, il + fx, ib + fy, 0.008 * u + 0.003 * u * 7, pre ? 0 : between(fv(ST[8], v) * 6, i, i + 0.8) * (1 - erase)));
      flowers.commit();
      // brush tip (inner coords): the current stroke, a lifted move between strokes, in from and out to the right
      let p = far, down = 0, col = 0xffffff;
      const live = !pre && v > 0.3 && v < 12.4;
      if (live) {
        const first = ST[0], last = ST[ST.length - 1];
        if (v < first[0]) { const k = between(v, 0.3, first[0]); p = [lerp(far[0], first[5](0)[0], k), lerp(far[1], first[5](0)[1], k)]; }
        else if (v >= last[1]) { const k = between(v, last[1], 11.8), e = last[5](1); p = [lerp(e[0], far[0], k), lerp(e[1], far[1], k)]; col = last[4]; }
        for (let i = 0; i < ST.length; i++) {
          const s = ST[i], n = ST[i + 1];
          if (v >= s[0] && v <= s[1]) { p = s[5](fv(s, v)); down = 1; col = s[4]; }
          else if (n && v > s[1] && v < n[0]) { const k = between(v, s[1], n[0]), e = s[5](1), st = n[5](0); p = [lerp(e[0], st[0], k), lerp(e[1], st[1], k)]; col = s[4]; }
        }
      }
      const [px, py] = at(p), z = lerp(zl, zp, down);
      brush.visible = tip.visible = hand.group.visible = live;
      const wob = down ? 0.02 * Math.sin(v * 25) : 0;
      for (const m of [brush, tip]) { m.position.set(px, py, z); m.quaternion.setFromUnitVectors(V1.set(0, 1, 0), V2.copy(b).add(V1.set(wob, 0, 0)).normalize()); }
      tip.material.color.setHex(col);
      handAim(hand, b, fore);
      handTo(hand, px + b.x * 0.32 * u, py + b.y * 0.32 * u, z + b.z * 0.32 * u);
    },
  };
}
export const SCENES = { 'tooth-brush': toothBrush, 'easel-picture': easelPaint };
