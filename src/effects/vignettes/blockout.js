// A plan's layout in rough shapes and the real models, before anything is built (scripts/plan-check.mjs; not for cards).
// Opus writes the layout as data in the recipe, and the inspection measures it like a built scene: the real people at
// their real sizes and clips, plain boxes for the props. So a plan's numbers and goals are checked before a builder starts.
//   { "type": "blockout", "loop": 7, "things": [
//       { "name": "wallL", "box": [0.25, 1.05, 0.5], "at": [0.655, 0, 0], "color": "#b0583a" },
//       { "name": "sea", "box": [0.95, 0.04, 0.55], "at": [0.92, 0, -0.18], "tilt": [25, 0] },
//       { "name": "ball", "ball": 0.06, "at": [1.1, 0.5, 0], "flies": true },
//       { "name": "post", "cyl": [0.03, 0.6], "at": [0.6, 0, -0.2] },
//       { "model": "guy2", "h": "ADULT", "clips": [[0, "Walk"], [1.2, "Idle"]],
//         "keys": [[0, 0.95, 0, -0.45, 0], [1.2, 0.95, 0, -0.33, 0], [2, 0.95, 0, -0.3, 90], [4.5, 0.95, 0, 0.33, 90]] } ] }
// Lengths in u (the kanji's height): x from the kanji's right edge, y up from the ground line, z toward the learner. `at` is
// the bottom middle of a shape (a ball's too) and the feet of a model. `keys`: [seconds into the loop, x, y, z, turn]
// with straight moves between them (turn in degrees: 0 faces the learner, 90 faces +x). `tilt`: [about x, about z] in
// degrees (a top tilted toward the learner: positive x). `h`: a model's height in u, or ADULT / TEEN / KID. A box's
// mesh is named `name` (a model goes by its model name), so the plan's goals find it.
// A model's `hands`: [{ "side": "R", "to": [x, y, z] or "<a thing's name>", "t": [from, to] }]: the hand reaches there
// (two-bone IK, as the built scene would), so a reach that the arm can't make shows in the numbers.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { ADULT, TEEN, KID } from './q-common.js';

const SIZES = { ADULT, TEEN, KID }, D = Math.PI / 180, w = new THREE.Vector3();
const colour = (c) => (typeof c === 'string' ? parseInt(c.replace('#', ''), 16) : c ?? 0x9aa4b0);

// [x, y, z, turn] at time v from keys (held before the first and after the last)
function at(th, v) {
  const k = th.keys ?? [[0, ...(th.at ?? [0.9, 0, 0]), th.turn ?? 0]];
  if (v <= k[0][0]) return k[0].slice(1);
  for (let i = 1; i < k.length; i++) if (v <= k[i][0]) { const f = (v - k[i - 1][0]) / Math.max(1e-6, k[i][0] - k[i - 1][0]); return k[i].slice(1).map((x, j) => k[i - 1][j + 1] + (x - k[i - 1][j + 1]) * f); }
  return k.at(-1).slice(1);
}
// a model's clip at time v: [name, seconds into it]
function clipAt(th, v) {
  const c = th.clips ?? [[0, th.clip ?? 'Idle']];
  let cur = c[0];
  for (const x of c) if (v >= x[0]) cur = x;
  return [cur[1], Math.max(0, v - cur[0])];
}

function blockout(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), loop = spec.loop ?? 7;
  const list = (spec.things ?? []).map((th) => {
    if (th.model) {
      const a = actor(th.model, (SIZES[th.h] ?? th.h ?? ADULT) * u);
      group.add(a.group);
      return { th, a, obj: a.group };
    }
    const c = colour(th.color), geo = th.box ? G.box(th.box[0] * u, th.box[1] * u, th.box[2] * u, 0, th.box[1] * u / 2, 0)
      : th.cyl ? G.cyl(th.cyl[0] * u, th.cyl[0] * u, th.cyl[1] * u, 0, th.cyl[1] * u / 2, 0) : G.sphere((th.ball ?? 0.05) * u, 0, (th.ball ?? 0.05) * u, 0);
    const obj = solidProp([[geo, c]], 0.3);
    obj.name = th.name ?? 'prop';
    obj.traverse((m) => { if (m.isMesh) { m.name = obj.name; if (th.flies) m.userData.flies = true; } });
    if (th.flies) obj.userData.flies = true;
    if (th.tilt) obj.rotation.set(th.tilt[0] * D, 0, th.tilt[1] * D);
    group.add(obj);
    return { th, obj };
  });
  group.userData.blockout = list;   // for scripts/plan-check.mjs (model sizes)
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), v = A.v < 0 ? 0 : A.v;
      // every thing in place first, then the models' clips and reaches (a hand can reach for a thing listed after it)
      for (const { th, a, obj } of list) {
        const [x, y, z, turn] = at(th, v);
        obj.position.set(B.maxX + x * u, B.minY + y * u, z * u); obj.rotation.y = (turn ?? 0) * D;
      }
      group.updateWorldMatrix(true, true);
      for (const { th, a } of list) {
        if (!a) continue;
        const [clip, s] = clipAt(th, v); a.pose(clip, s);
        for (const hd of th.hands ?? []) {
          if (hd.t && (v < hd.t[0] || v > hd.t[1])) continue;
          const o = typeof hd.to === 'string' && group.getObjectByName(hd.to);
          if (o) { o.updateWorldMatrix(true, true); new THREE.Box3().setFromObject(o).getCenter(w); } else if (Array.isArray(hd.to)) group.localToWorld(w.set(B.maxX + hd.to[0] * u, B.minY + hd.to[1] * u, hd.to[2] * u)); else continue;
          a.handTo(hd.side ?? 'R', w, 1, { out: 0.4, down: 0.6 });
        }
      }
    },
  };
}

export const SCENES = { blockout };
