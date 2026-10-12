// 朝ごはん (breakfast): a Kenney toaster in the morning light; two slices of toast stand in its two slots (parallel to the slot
// lines, flat faces towards you) and pop straight up. One tumbles out onto the plate (with a fried egg) a woman holds out
// beside the toaster; she catches it, picks it up and takes two bites, chews, and the other slice drops back down.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc } from './helpers.js';

const UP = new THREE.Vector3(0, 1, 0), W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
const lerp = (a, b, f) => a + (b - a) * f;

// a slice of bread in 1 x 1 units (origin at its middle): outline of points; bites push the points inside a circle onto it
function outline() {
  const s = new THREE.Shape();
  s.moveTo(-0.38, -0.5); s.lineTo(0.38, -0.5); s.quadraticCurveTo(0.45, -0.5, 0.45, -0.42); s.lineTo(0.45, 0.04);
  s.bezierCurveTo(0.6, 0.12, 0.56, 0.5, 0.26, 0.5); s.lineTo(-0.26, 0.5); s.bezierCurveTo(-0.56, 0.5, -0.6, 0.12, -0.45, 0.04);
  s.lineTo(-0.45, -0.42); s.quadraticCurveTo(-0.45, -0.5, -0.38, -0.5);
  const pts = s.getPoints(10), out = [];
  for (let i = 0; i < pts.length; i++) {                          // dense enough for a round bite
    const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(a.distanceTo(b) / 0.025));
    for (let k = 0; k < n; k++) out.push(a.clone().lerp(b, k / n));
  }
  return out;
}
const BASE = outline(), BITES = [[0.5, 0.45, 0.2], [-0.48, 0.36, 0.17]];
function sliceMesh(s, th, bites) {
  const make = (k, depth, color) => {
    const pts = BASE.map((p) => { let q = p.clone().multiplyScalar(k); for (const [cx, cy, r] of BITES.slice(0, bites)) { const d = q.clone().sub(new THREE.Vector2(cx, cy)); if (d.length() < r) q = new THREE.Vector2(cx, cy).add(d.setLength(r)); } return q.multiplyScalar(s); });
    return [new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth, bevelEnabled: false }).translate(0, 0, -depth / 2), color];
  };
  return solidProp([make(1, th, 0xa9622a), make(0.84, th + 0.008 * s, 0xedb868)], 0.35);
}

export function toaster(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.5 * u, px = tx + 0.8 * u;
  const TK = 0.6 * u / 0.188, SLOT_TOP = 0.13 * TK, SLOT_Z = 0.025 * TK, SW = 0.3 * u, TH = 0.03 * u, YAW = -0.6;
  const tk = createModel('toasterKit', { width: 0.6 * u });
  tk.group.position.set(tx, floor, 0);
  const slice = [sliceMesh(SW, TH, 0), sliceMesh(SW, TH, 0)], bit = [sliceMesh(SW, TH, 1), sliceMesh(SW, TH, 2)];
  const gal = actor('gal', 0.9 * u), PR = 0.15 * u, plate = new THREE.Group(), pm = createModel('foodPlate', { width: 2 * PR }), egg = createModel('foodEgg', { width: 0.95 * PR });
  const KP = 2 * PR / 0.89, PLATE_Y = 0.05 * KP;
  egg.group.position.set(-0.3 * PR, PLATE_Y, 0.15 * PR); plate.add(pm.group, egg.group);
  const mat = solidProp([[G.box(2.0 * u, 0.04 * u, 0.7 * u, 0, -0.02 * u, 0), 0xc99560], [G.box(2.0 * u, 0.012 * u, 0.7 * u, 0, -0.046 * u, 0), 0x8a5a30]], 0.3);
  mat.position.set(tx + 0.55 * u, floor, 0.0);
  group.add(mat, tk.group, ...slice, ...bit, gal.group, plate);
  const loop = 6.4, SLOT = [new THREE.Vector3(tx, floor + SLOT_TOP, SLOT_Z), new THREE.Vector3(tx, floor + SLOT_TOP, -SLOT_Z)], REST = 0.12 * u - SW / 2, RISE = 0.36 * u;
  const landed = new THREE.Vector3(), mouthW = new THREE.Vector3(), grab = new THREE.Vector3(), handW = new THREE.Vector3(), fist = new THREE.Vector3();
  const SKIN_HELD = 0.45;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ws = group.getWorldScale(W).y;
      const T = timeline(v, { pop: [0.7, 0.45, 'out'], fly: [1.1, 0.7, 'linear'], reach: [2.25, 0.5], lift: [2.85, 0.55], away: [4.65, 0.5], back: [5.3, 0.5], again: [5.5, 0.6] });
      const appear = pre ? between(A.setup, 0.2, 0.6) : 1;
      tk.group.scale.set(1 + 0.02 * (pre ? 0 : bump(v, 0.65, 0.5)), 1 - 0.03 * (pre ? 0 : bump(v, 0.65, 0.5)), 1);
      // ---- the woman: stands on the floor beside the toaster, holds the plate out on her left palm
      gal.group.position.set(px, floor, 0.05 * u); gal.group.rotation.y = YAW; gal.group.scale.setScalar(Math.max(1e-3, appear)); gal.group.updateMatrixWorld(true);
      gal.pose('Idle', t);
      const dip = pre ? 0 : 0.02 * u * bump(v, 1.8, 0.4);
      const plateC = gal.local(0.0, 0.43, 0.34, W2).add(W.set(0, -dip - 0.012 * u, 0));
      gal.grip('L', plateC, UP, 0.006 * u * ws, 1, { out: 0.5, down: 0.7 });
      gal.hold(plate, 'L', group, 0.004 * u * ws); plate.visible = appear > 0.05; plate.scale.setScalar(Math.max(1e-3, appear));
      landed.set(plate.position.x + 0.1 * PR, plate.position.y + PLATE_Y + TH / 2 + 0.002 * u, plate.position.z - 0.1 * PR);
      // ---- slice B: always in its slot; pops a little way up and sinks back at the end
      const sb = slice[1]; sb.visible = appear > 0.3;
      sb.position.set(SLOT[1].x, SLOT[1].y + REST + (pre ? 0 : T.pop * RISE * 0.7 * (1 - T.back)), SLOT[1].z); sb.rotation.set(0, 0, 0);
      // ---- slice A: pops straight up out of the front slot, tumbles onto the plate, is eaten in two bites; a fresh one drops in
      const sa = slice[0], top = SLOT[0].clone(); top.y += REST + RISE;
      let which = 0, vis = appear > 0.3;
      if (pre || v < 1.1) { sa.position.set(SLOT[0].x, SLOT[0].y + REST + (pre ? 0 : T.pop * RISE), SLOT[0].z); sa.rotation.set(0, 0, 0); sa.scale.setScalar(1); }
      else if (v < 4.8) {
        const f = T.fly;
        if (T.reach < 1) {                                                              // in flight, then lying on the plate
          const [x, y] = arc([top.x, top.y], [landed.x, landed.y], 0.22 * u, f);
          sa.position.set(x, y, lerp(top.z, landed.z, f)); sa.rotation.set(-(Math.PI / 2 + Math.PI * 2) * f, 0, 0); sa.scale.setScalar(lerp(1, SKIN_HELD, f));
        }
        // her right fist comes down to the toast, picks it up, takes it to the mouth, bites twice, and drops away
        const bite = Math.max(bump(v, 3.5, 0.45), bump(v, 4.2, 0.45)), eatK = T.lift * (1 - 0.2 * bite);
        gal.at('mouth', mouthW, 0.0, -0.13, 0.2); grab.copy(group.localToWorld(W3.copy(landed))).add(W3.set(0, 0.045 * u * ws, 0));
        handW.copy(grab).lerp(mouthW, eatK);
        const reach = T.reach * (1 - T.away);
        gal.handTo('R', handW, reach, { out: 0.6, down: 0.8 });
        if (T.reach >= 1) {
          gal.fistMid('R', fist);
          sa.position.copy(group.worldToLocal(fist.add(W3.set(0, 0.5 * SW * SKIN_HELD * 0.8, 0)))); sa.rotation.set(0, 0.45, 0); sa.scale.setScalar(SKIN_HELD);
        }
        gal.turn('Head', 0.1 * T.lift * (1 - T.away) + 0.07 * Math.sin(v * 15) * (between(v, 3.6, 3.7) - between(v, 4.05, 4.15) + between(v, 4.3, 4.4) - between(v, 4.7, 4.8)));
        which = v < 3.7 ? 0 : v < 4.4 ? 1 : 2; vis = vis && v < 4.78;
      } else {
        vis = false;
        if (v >= 5.4) { const k = T.again; vis = true; sa.scale.setScalar(Math.max(1e-3, k)); sa.rotation.set(0, 0, 0); sa.position.set(SLOT[0].x, SLOT[0].y + REST + (1 - k) * 0.25 * u, SLOT[0].z); }
      }
      const meshes = [sa, bit[0], bit[1]];
      meshes.forEach((m, i) => { m.visible = vis && i === which; if (m !== sa) { m.position.copy(sa.position); m.rotation.copy(sa.rotation); m.scale.copy(sa.scale); } });
    },
  };
}
