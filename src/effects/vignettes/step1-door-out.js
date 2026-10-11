// Step 1 word variant of turtle-out (出る): outcome door. A lit room behind a wall with a closed door and a green EXIT
// sign over it; the door swings OUT toward you, a person walks from inside the room through the doorway out toward you
// into the open (a green arrow lies on the ground pointing the way out), waves, and the door swings shut behind them.
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { grow } from './step1-kit.js';

export function doorOut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.75 * u;
  const W = 1.2 * u, WH = 1.25 * u, DW = 0.5 * u, DH = 0.95 * u, side = (W - DW) / 2, D = 0.5 * u;
  // the wall with the doorway, and the room behind it (lit back wall, floor, ceiling, side walls)
  const room = solidProp([
    [G.box(side, WH, 0.1 * u, -(DW + side) / 2, WH / 2, 0), 0xe8e0d0], [G.box(side, WH, 0.1 * u, (DW + side) / 2, WH / 2, 0), 0xe8e0d0],
    [G.box(DW, WH - DH, 0.1 * u, 0, DH + (WH - DH) / 2, 0), 0xe8e0d0],
    [G.box(W, WH, 0.02 * u, 0, WH / 2, -D), 0xfff0c0], [G.box(W, 0.02 * u, D, 0, 0.01 * u, -D / 2), 0xc8a468], [G.box(W, 0.02 * u, D, 0, WH, -D / 2), 0xcfc4a8],
    [G.box(0.02 * u, WH, D, -W / 2, WH / 2, -D / 2), 0xcfc4a8], [G.box(0.02 * u, WH, D, W / 2, WH / 2, -D / 2), 0xcfc4a8],
    [G.box(DW + 0.06 * u, 0.04 * u, 0.12 * u, 0, DH + 0.02 * u, 0), 0x7a5232],
  ], 0.6);
  const hinge = new THREE.Group(), leaf = solidProp([[G.box(DW, DH, 0.03 * u, DW / 2, DH / 2, 0), 0x8a5a30], [G.sphere(0.02 * u, DW - 0.06 * u, DH / 2, 0.025 * u), 0xffd040]], 0.4);
  hinge.add(leaf); hinge.position.set(-DW / 2, 0, 0.05 * u);
  const sign = textPlane('EXIT', { h: 0.17 * u, color: '#ffffff', bg: '#20a050', pad: 0.25, weight: 900 });
  sign.position.set(0, DH + 0.15 * u + 0.02 * u, 0.07 * u);
  // a green arrow lying on the ground beside the path, its tip toward you: this is the way out
  const arrow = solidProp([[G.box(0.09 * u, 0.3 * u, 0.025 * u, 0, 0.15 * u, 0), 0x30d070], [G.cone(0.1 * u, 0.18 * u, 0, 0.39 * u, 0), 0x30d070]], 1.0);
  arrow.rotation.x = Math.PI / 2; arrow.scale.setScalar(1.4);
  const aim = new THREE.Group(); aim.add(arrow); aim.rotation.y = 0.6; aim.position.set(0.5 * u, 0.02 * u, 0.2 * u);
  const p = createPerson({ u: 0.8 * u, shirt: 0xe0603a });
  const all = new THREE.Group(); all.add(room, hinge, sign, aim, p.group); all.position.set(dx, floor, -0.15 * u);
  group.add(all);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.3, 0.5, 'out'], out: [0.9, 1.7, 'linear'], shut: [3.3, 0.5, 'in'], gone: [5.0, 0.6] });
      hinge.rotation.y = -1.75 * (T.open - T.shut);
      // from deep in the room, through the doorway, out toward you
      const f = T.out, z = -0.3 * u + 1.0 * u * f;
      p.reset().face(0.35 * f); p.group.visible = !pre && v > 0.5 && T.gone < 0.98; p.group.position.set(0.3 * u * f, 0, z); p.group.scale.setScalar(grow(1 - T.gone));
      if (f > 0 && f < 1) p.walk(v * 9, 1);
      else if (f >= 1) { p.raise('R', 2.4); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 9); }
      p.update();
      arrow.position.y = 0.05 * u * Math.sin(t * 5); sign.material.opacity = 0.8 + 0.2 * Math.sin(t * 4);
    },
  };
}
