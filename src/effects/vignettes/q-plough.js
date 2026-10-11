// 男 (models; split out of q-people.js): a man in a work cap pushes a hand plough across a field. The plough is built in
// his own frame (a child of his model), so its share always cuts the soil in front of his feet and his palms rest on its
// two handles. He ploughs one furrow toward the kanji, wipes his brow, cheers, turns round and ploughs the next row back,
// turns again; the furrows stay dark behind the share and the soil closes over them as the loop starts again.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { LEFT, RIGHT, lerp, person, turnTo } from './q-common.js';

const W = new THREE.Vector3(), DOWN = new THREE.Vector3(0, -1, 0), Y = new THREE.Vector3(0, 1, 0);
// a round rod from a to b ([x, y, z])
const rod = (a, b, r) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
  return new THREE.CylinderGeometry(r, r, d.length(), 8).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.normalize())).translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
};
// the plough in the ploughman's frame (+z ahead, y up, origin between his feet), units of u: handle grips at
// (±0.09, 0.34, 0.24); the beam runs down-forward to the share, which lies a little into the soil LEAD ahead
export const GRIP = [0.09, 0.34, 0.24], LEAD = 0.55;
function plough(u) {
  const k = (p) => p.map((x) => x * u), wood = 0x8a5a30, iron = 0x9aa2ae;
  return solidProp([
    [rod(k([GRIP[0], GRIP[1], GRIP[2]]), k([0.035, 0.15, 0.38]), 0.02 * u), wood], [rod(k([-GRIP[0], GRIP[1], GRIP[2]]), k([-0.035, 0.15, 0.38]), 0.02 * u), wood],
    [rod(k([0.075, 0.27, 0.29]), k([-0.075, 0.27, 0.29]), 0.014 * u), wood],
    [rod(k([0, 0.16, 0.36]), k([0, 0.03, 0.54]), 0.028 * u), wood], [rod(k([0, 0.15, 0.39]), k([0, 0.0, 0.44]), 0.022 * u), wood],
    [new THREE.ConeGeometry(0.06 * u, 0.2 * u, 4).rotateX(Math.PI / 2).scale(1, 0.55, 1).translate(0, 0.01 * u, 0.55 * u), iron],
  ], 0.4);
}

export function ploughMan(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tilt = 0.22;
  const mL = B.maxX + 0.75 * u, mR = B.maxX + 1.6 * u, rows = [0.1 * u, -0.18 * u];     // where he walks between; the rows' z
  const man = person(spec.who, u), tool = plough(u), cheer = burst(u, { s: 0.22, color: 0xffd040 });
  man.group.add(tool);
  // a field of brown soil tipped a little toward you, with a row of green shoots along the back
  const field = solidProp([[G.box(2.2 * u, 0.04 * u, 0.8 * u, 0, -0.02 * u, 0), 0x7a5230], ...[-0.32].flatMap((z) => [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map((x) => [G.cone(0.03 * u, 0.1 * u, x * u, 0.05 * u, z * u), 0x58b848]))], 0.3);
  field.position.set(B.maxX + 1.18 * u, floor, 0); field.rotation.x = tilt;
  const sy = (z) => floor - z * Math.sin(tilt);                 // the field's top at depth z
  const furrows = rows.map(() => solidProp([[G.box(1, 0.012 * u, 0.07 * u, 0.5, 0, 0), 0x3a2414]], 0.25));
  group.add(field, ...furrows, man.group, cheer);
  // one row toward the kanji (0-4.2), brow (4.4), cheer (5.2-6.4), turn onto the back row (6.4-7.2), the row back
  // (7.2-11.2), turn onto the front row (11.2-12); the soil closes over the furrows over the last second
  const loop = 12.0, lead = LEAD * u, Lw = LEFT + 0.12, Rw = RIGHT + 0.12;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { go: [0, 4.2, 'linear'], wipe: [4.4, 0.5], yay: [5.2, 0.3], turn1: [6.4, 0.8], back: [7.2, 4.0, 'linear'], turn2: [11.2, 0.8], close: [11.0, 1.0] });
      const walking = !pre && ((T.go > 0 && T.go < 1) || (T.back > 0 && T.back < 1)), yay = !pre && v > 5.2 && v < 6.4;
      const turning = !pre && ((T.turn1 > 0 && T.turn1 < 1) || (T.turn2 > 0 && T.turn2 < 1));
      man.pose(walking || turning ? 'Walk' : yay ? 'Victory' : 'Idle', walking || turning ? v * 0.7 : yay ? 0.4 + 0.25 * Math.sin((v - 5.2) * 3) : t);
      // his path: the front row toward the kanji, a turn on the spot (stepping back a row), the back row out, a turn
      // (stepping forward a row); the plough swings round with him, its share `lead` ahead of his feet
      let mx, mz, yaw;
      if (pre || v < 6.4) { mx = lerp(mR, mL, pre ? 0 : T.go); mz = rows[0]; yaw = Lw; }
      else if (v < 7.2) { mx = mL; mz = lerp(rows[0], rows[1], T.turn1); yaw = turnTo(Lw, Rw, T.turn1); }
      else if (v < 11.2) { mx = lerp(mL, mR, T.back); mz = rows[1]; yaw = Rw; }
      else { mx = mR; mz = lerp(rows[1], rows[0], T.turn2); yaw = turnTo(Rw, Lw, T.turn2); }
      man.group.position.set(mx, sy(mz), mz); man.group.rotation.y = yaw;
      tool.rotation.x = Math.sin(tilt) * Math.cos(yaw);            // the plough lies along the tipped field
      man.group.updateWorldMatrix(true, true);
      // he leans into the handles and pushes; palms on the grips (they let go for the brow and the cheer)
      const hold = pre ? 1 : 1 - between(v, 4.3, 4.5) * (1 - between(v, 6.3, 6.5));
      if (hold > 0.5) { man.turn('Abdomen', 0.3 * hold); man.turn('Torso', 0.12 * hold); }
      const r = 0.014 * u * group.getWorldScale(W).y;
      for (const [side, sgn] of [['R', -1], ['L', 1]]) man.grip(side, tool.localToWorld(W.set(sgn * GRIP[0] * u, GRIP[1] * u, GRIP[2] * u)), DOWN, r, hold, { out: 0.5, down: 0.9 });
      const wipe = T.wipe * (1 - T.yay);
      man.handTo('R', man.at('eyes', W, -0.05, 0.08, 0.02), wipe, { out: 0.8, down: 0.5 });
      // the furrows: from where the row began to the share (kept once done), closing at the end of the loop
      const close = pre ? 0 : T.close, f0 = pre ? 0 : T.go, f1 = pre ? 0 : T.back;
      [[mR + Math.sin(Lw) * lead, lerp(mR, mL, f0) + Math.sin(Lw) * lead, rows[0] + Math.cos(Lw) * lead, f0], [mL + Math.sin(Rw) * lead, lerp(mL, mR, f1) + Math.sin(Rw) * lead, rows[1] + Math.cos(Rw) * lead, f1]].forEach(([a, b, z, f], i) => {
        const m = furrows[i]; m.visible = f > 0.01 && close < 0.99;
        m.position.set(Math.min(a, b), sy(z) + 0.004 * u, z); m.scale.set(Math.max(1e-3, Math.abs(b - a)), 1 - close, 1); m.rotation.x = tilt;
      });
      const c = yay ? Math.min(1, (v - 5.2) / 0.3) * (1 - between(v, 6.1, 6.4)) : 0;
      cheer.visible = c > 0.01; cheer.scale.setScalar(grow(c)); cheer.position.set(mx, floor + 1.15 * u, mz + 0.1 * u); cheer.rotation.z = v;
    },
  };
}
