// 洗う (wash): a pedestal basin with a tap; two hands come in from the sides and rub palm to palm under the running water,
// suds foaming between them; they part and rinse under the stream, the tap shuts off and they flick the water away.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createHand } from '../pieces/kit-hand.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo } from './helpers.js';

const lerp = (a, b, f) => a + (b - a) * f;
const F = new THREE.Vector3(), N = new THREE.Vector3(), X = new THREE.Vector3(), M4 = new THREE.Matrix4();

// stand a hand with its fingers along dir f (unit) and its palm facing n, its palm's middle at (x, y, z)
function place(hand, mid, f, n, x, y, z) {
  N.copy(n).addScaledVector(F.copy(f), -n.dot(f)).normalize(); X.crossVectors(f, N);
  hand.group.quaternion.setFromRotationMatrix(M4.makeBasis(X, F.copy(f), N));
  handTo(hand, x, y, z, mid);
}

export function handWash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.72 * u, yb = floor + 0.3 * u;   // yb: basin rim
  // the sink: a white bowl on a pedestal and a chrome tap whose spout reaches over the middle of the bowl
  const bowl = [[0, -0.11], [0.14, -0.11], [0.27, -0.075], [0.35, -0.03], [0.375, 0], [0.36, 0.014], [0.345, 0], [0.33, -0.006], [0.25, -0.055], [0.13, -0.085], [0, -0.085]].map(([r, y]) => new THREE.Vector2(r * u, y * u));
  const spout = G.tube([[-0.3, 0], [-0.3, 0.3], [-0.28, 0.45], [-0.17, 0.54], [-0.05, 0.52], [0, 0.45], [0, 0.4]].map(([x, y]) => [x * u, y * u]), 0.022 * u).rotateY(-Math.PI / 2);
  const sink = solidProp([[new THREE.LatheGeometry(bowl, 36), 0xf4f4f8], [G.cyl(0.085 * u, 0.1 * u, yb - floor - 0.1 * u, 0, -(yb - floor) / 2 - 0.045 * u, 0, 0, 0, 0, 20), 0xe8ecf2], [G.cyl(0.2 * u, 0.2 * u, 0.025 * u, 0, -(yb - floor) + 0.0125 * u, 0, 0, 0, 0, 28), 0xe8ecf2],
    [spout, 0xc8ccd4], [G.cyl(0.035 * u, 0.04 * u, 0.06 * u, 0, 0.03 * u, -0.3 * u), 0xc8ccd4], [G.box(0.07 * u, 0.025 * u, 0.025 * u, -0.1 * u, 0.1 * u, -0.3 * u), 0x4a8ae0], [G.box(0.07 * u, 0.025 * u, 0.025 * u, 0.1 * u, 0.1 * u, -0.3 * u), 0xe05050]], 0.3);
  sink.material.side = THREE.DoubleSide; sink.position.set(hx, yb, 0);
  const L = createHand({ u: 0.6 * u, side: -1, sleeve: 0x4a8a6a, arm: 0.5 }), R = createHand({ u: 0.6 * u, side: 1, sleeve: 0x4a8a6a, arm: 0.5 }), K = 0.6 * u;
  const midL = new THREE.Group(), midR = new THREE.Group(); midL.position.set(0, 0.19 * K, 0); midR.position.set(0, 0.19 * K, 0);
  L.bone('palm').add(midL); R.bone('palm').add(midR);
  const stream = solidProp([[G.cyl(0.014 * u, 0.014 * u, 1, 0, 0.5, 0, 0, 0, 0, 8), 0x8ad8ff]], 0.9);
  stream.material.transparent = true; stream.material.opacity = 0.6; stream.material.depthWrite = false;
  const drops = many([[G.sphere(0.016 * u, 0, 0, 0, 0.8, 1.4, 0.8), 0x9adcff]], 22, 0.9), suds = many([[G.sphere(0.03 * u), 0xffffff]], 16, 0.8);
  group.add(sink, stream, L.group, R.group, drops, suds);
  const loop = 5.0, SPY = yb + 0.4 * u, HY = yb + 0.2 * u, HALF = 0.067 * K + 0.003 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, vv = pre ? 0 : v;
      const T = timeline(v, { come: [0.0, 0.5], rinse: [2.1, 0.4], off: [2.9, 0.2], shake: [3.1, 0.3], leave: [4.2, 0.5] });
      const pres = pre ? 0 : T.come * (1 - T.leave);                                   // how far the hands are in (0: waiting at the sides)
      const rub = pre ? 0 : between(v, 0.35, 0.7) * (1 - T.rinse), rinse = T.rinse * (1 - T.shake);
      const flick = pre ? 0 : bump(v, 3.1, 1.1), s = Math.sin(vv * 13) * rub;
      const lift = 0.07 * u * T.shake * (1 - T.leave), spread = 0.1 * u * T.shake;
      // palm to palm: the lower (left) hand palm up, the upper (right) hand palm down, fingers away from you, wrists to the sides
      const tilt = 0.14 - 0.4 * rinse, gap = 0.012 * u + 0.055 * u * rinse, hold = 0.6 * u * (1 - pres);
      [[L, midL, 1], [R, midR, -1]].forEach(([h, mid, sg]) => {
        const a = tilt + 0.0 + 0.3 * flick * Math.sin(vv * 26 + (sg > 0 ? 0 : 1.5)), roll = 0.12 * (sg > 0 ? 1 : -1);
        const f = F.set(sg * Math.cos(a), sg * Math.sin(a), -0.16).normalize().clone(), n = N.set(-sg * Math.sin(a), sg * Math.cos(a), roll).normalize().clone();
        const slide = (sg > 0 ? 1 : -1) * (0.05 * u * s) * (sg > 0 ? 1 : 0.5), z = 0.015 * u * Math.cos(vv * 13) * rub;
        const side = -sg * (0.075 * u + hold + spread) + slide;
        const y = HY + sg * (HALF + gap / 2) + lift;
        h.pose('flat', 'open', 0.25 * rinse); h.update();
        h.group.visible = pres > 0.01;
        place(h, mid, f, n, hx + side, y, z);
      });
      // water: a stream from the spout down onto the top hand (or all the way to the bowl), plus falling drops
      const on = pre ? 0 : (1 - T.off), top = pres > 0.5 ? HY + HALF * 2 + 0.01 * u + 0.5 * gap : yb - 0.08 * u;
      stream.visible = on > 0.01; stream.position.set(hx, top, 0); stream.scale.set(1, Math.max(1e-3, SPY - top), 1);
      for (let i = 0; i < 14; i++) {
        const f = (((vv * 1.7 + i / 14) % 1) + 1) % 1, y = SPY - f * (SPY - yb + 0.07 * u), under = y < HY - HALF * 2 - 0.02 * u, spreadK = Math.max(0, (HY - y) / (0.2 * u));
        drops.set(i, hx + (pres > 0.5 && under ? 0.08 * u * Math.sin(i * 5.3) * (0.3 + 0.7 * spreadK) : 0.006 * u * Math.sin(i * 5)), y, 0.01 * u * Math.cos(i * 3), on * (pres > 0.5 ? (under ? 0.8 : 0) : 0.8));
      }
      for (let i = 14; i < 22; i++) {                                                      // flicked-off drops
        const k = i - 14, f = between(v, 3.2 + k * 0.05, 4.0 + k * 0.05), ang = k * 0.8 + 0.3, r = 0.4 * u * f;
        drops.set(i, hx + Math.cos(ang) * r, HY + lift + Math.sin(ang) * 0.5 * r - 0.22 * u * f * f, 0.1 * u * Math.sin(k * 2.3) * f, f > 0 && f < 0.9 && !pre ? 1 : 0);
      }
      drops.commit();
      // suds: foam between and on the hands while rubbing, drifting off with the water in the rinse
      const foam = pre ? 0 : between(v, 0.4, 1.1) * (1 - between(v, 2.1, 2.9));
      for (let i = 0; i < 16; i++) {
        const a = i * 2.4 + vv * 1.5, r = (0.05 + 0.09 * ((i * 7) % 5) / 5) * u, sz = foam * (0.55 + 0.45 * Math.sin(a * 2.1 + i)) * (i < 8 ? 1 : 0.8);
        suds.set(i, hx + r * Math.cos(a) * 1.2 + 0.02 * u * s, HY + (i < 8 ? 0.01 : 0.075 + 0.02 * Math.sin(a)) * u + 0.1 * u * rinse * ((i * 3) % 4) / 4 - 0.03 * u * rinse, 0.16 * u * Math.sin(a) * (i < 8 ? 0.5 : 0.3), Math.max(0, sz) * pres);
      }
      suds.commit();
    },
  };
}
