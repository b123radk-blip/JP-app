// Nature.
//   leaf-fall  葉: a branch reaches out from the kanji, a bud on its tip unfurls into a big leaf; it flutters, lets go and
//              zigzags down to the ground; a new bud
//   gust-hat   風: a gust blows across from the left (streaks, leaves): the kanji leans over, a person leans into it and
//              their hat flies off, tumbling away up and out; the wind drops and a new hat drops onto their head
import * as THREE from 'three';
import { acts, timeline, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many } from '../pieces/kit-things.js';
import { bigLeaf, hat } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, bonePoint } from './helpers.js';

function leafFall(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const bx = B.maxX - 0.05 * u, by = B.cy + 0.05 * u, tipX = bx + 0.55 * u, tipY = by + 0.12 * u;
  const branch = solidProp([[G.tube([[0, 0], [0.2 * u, 0.06 * u], [0.4 * u, 0.08 * u], [0.55 * u, 0.12 * u]], 0.022 * u), 0x6a4a2a], [G.sphere(0.035 * u, 0.3 * u, 0.09 * u, 0, 1.5, 0.6, 1), 0x58b048]]);
  branch.position.set(bx, by, -0.02 * u);
  const leaf = bigLeaf(1.6 * u), small = many([[G.sphere(0.03 * u, 0, 0, 0, 1.7, 0.4, 1), 0x9ac83a]], 2, 0.5);
  group.add(branch, leaf, small);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      branch.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.5, 'out'] }).a));
      const T = timeline(v, { open: [0, 1.0, 'back'], flutter: [1.1, 0.8], fall: [1.9, 2.2, 'linear'], gone: [4.6, 0.4] });
      if (pre || v < 1.9) {                                           // on the branch: unfurls, then flutters in the breeze
        const k = pre ? 0.02 : 0.02 + 0.98 * T.open;
        leaf.position.set(tipX, tipY, 0.01 * u); leaf.scale.setScalar(k); leaf.rotation.set(0, 0, -0.9 + 0.25 * Math.sin(v * 9) * T.flutter);
      } else {                                                        // lets go and zigzags down
        const f = T.fall, x = tipX + 0.25 * u * Math.sin(f * Math.PI * 3), y = tipY - (tipY - floor - 0.05 * u) * f;
        leaf.position.set(x, y, 0.03 * u); leaf.scale.setScalar(1 - T.gone); leaf.rotation.set(0.3 * Math.sin(f * 9), 0, -0.9 + 1.2 * Math.cos(f * Math.PI * 3) + (f >= 1 ? 0 : 0));
      }
      for (let i = 0; i < 2; i++) { const f = (((v - 0.5 - i * 1.7) / 2.4) % 1 + 1) % 1; small.set(i, tipX - 0.2 * u + 0.15 * u * Math.sin(f * 9 + i), tipY - 1.0 * u * f, 0.02 * u, pre ? 0 : Math.sin(Math.PI * f), f * 6); }
      small.commit();
    },
  };
}

function gustHat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u;
  const p = createPerson({ u, shirt: 0x5a7ad0 }), cap = hat(1.5 * u), streaks = many([[G.box(0.4 * u, 0.012 * u, 0.006 * u, 0, 0, 0), 0xf0f8ff]], 8, 1.2), leaves = many([[G.sphere(0.03 * u, 0, 0, 0, 1.7, 0.4, 1), 0x8ac040]], 4, 0.5);
  group.add(p.group, cap, streaks, leaves);
  const loop = 5.4, headTop = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { gust: [0.2, 0.5], calm: [2.8, 0.8], fly: [0.6, 1.6, 'linear'], drop: [3.9, 0.6, 'bounce'] });
      const wind = pre ? 0 : T.gust - T.calm;
      poseGlyph(stage, 0, 0, -0.22 * wind + 0.03 * wind * Math.sin(v * 7), B.maxX, B.minY);    // leans over, from its right foot
      p.group.position.set(px, floor, 0.05 * u); p.face(-1.2).reset();
      p.lean(0.35 * wind); p.raise('R', 2.4 * wind * between(v, 0.7, 1.0)); p.bone('head').rotation.x = 0.2 * wind;
      p.update();
      bonePoint(p, 'head', 0.95, headTop);
      if (pre || v >= 3.9) { cap.position.set(headTop.x, headTop.y + 0.02 * u + (pre ? 0 : (1 - T.drop) * 1.2 * u), headTop.z); cap.rotation.set(0, 0, 0); cap.visible = pre || T.drop > 0.01; }
      else if (v < 0.6) { cap.position.copy(headTop).y += 0.02 * u; cap.rotation.set(0, 0, 0); cap.visible = true; }
      else { const f = T.fly; cap.position.set(headTop.x + 1.5 * u * f, headTop.y + 0.02 * u + 0.9 * u * f - 0.3 * u * Math.sin(f * 6) * f, headTop.z + 0.1 * u * f); cap.rotation.set(f * 9, 0, -f * 6); cap.visible = f < 1; }
      for (let i = 0; i < 8; i++) { const f = ((v * 1.4 + i / 8) % 1); streaks.set(i, B.minX - 0.4 * u + 2.6 * u * f, floor + (0.15 + 0.11 * i) * u, 0.1 * u * (i % 2), wind * Math.sin(Math.PI * f)); }
      streaks.commit();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.8 + i / 4) % 1); leaves.set(i, B.minX - 0.3 * u + 2.4 * u * f, floor + (0.3 + 0.2 * i) * u + 0.1 * u * Math.sin(f * 12), 0.05 * u, wind, f * 14); }
      leaves.commit();
    },
  };
}

export const SCENES = { 'leaf-fall': leafFall, 'gust-hat': gustHat };
