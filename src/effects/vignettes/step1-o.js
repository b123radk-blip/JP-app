// Step 1 scenes, part O: countries.
//   island-flag   国: an island rises out of the sea, a dotted border draws itself round it and a flag plants on top,
//                 waving. outcome plane: a little plane flies from one island with a flag over the sea to another island
//                 with a different flag (外国); visitor: a traveller with a suitcase walks up to a desk, a passport opens
//                 and a stamp thumps down on it (外国人)
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const island = (u, s, color = 0x58b048) => [[G.sphere(0.3 * u * s, 0, 0, 0, 1.4, 0.35, 0.8), color], [G.sphere(0.12 * u * s, -0.1 * u * s, 0.06 * u * s, 0, 1, 0.8, 0.8), 0x3a8a3a], [G.sphere(0.32 * u * s, 0, -0.03 * u * s, 0, 1.45, 0.25, 0.85), 0xf0d890]];
const flag = (u, s, a, b) => [[G.cyl(0.008 * u * s, 0.008 * u * s, 0.3 * u * s, 0, 0.15 * u * s, 0), 0x404048], [G.box(0.16 * u * s, 0.1 * u * s, 0.005 * u * s, 0.08 * u * s, 0.25 * u * s, 0), a], [G.cyl(0.03 * u * s, 0.03 * u * s, 0.007 * u * s, 0.08 * u * s, 0.25 * u * s, 0, Math.PI / 2), b]];

function islandFlag(ctx, spec, stage) {
  if (spec.outcome === 'plane') return planeHop(ctx, spec, stage);
  if (spec.outcome === 'visitor') return visitor(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ix = B.maxX + 0.55 * u, sea = floor + 0.08 * u;
  const water = solidProp([[G.box(1.4 * u, 0.02 * u, 0.6 * u, 0, 0, 0), 0x2a6ad0]], 0.4), land = solidProp(island(u, 1.3), 0.4), pole = new THREE.Group(), flagM = solidProp(flag(u, 1.6, 0xffffff, 0xe02020), 0.6);
  pole.add(flagM); water.position.set(ix, sea, -0.1 * u); water.rotation.x = 0.45;
  const border = many([[G.sphere(0.018 * u), 0xffe060]], 24, 1.4);
  group.add(water, land, pole, border);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rise = pre ? 0 : between(v, 0.1, 1.2) * (1 - between(v, 5.6, 6.3)), b = pre ? 0 : between(v, 1.3, 2.6) * (1 - between(v, 5.4, 5.8)), f = pre ? 0 : between(v, 2.7, 3.1) * (1 - between(v, 5.4, 5.8));
      land.position.set(ix, sea - 0.12 * u + 0.14 * u * rise, 0.0); land.scale.set(1, grow(rise), 1);
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; border.set(i, ix + Math.cos(a) * 0.45 * u, sea + 0.04 * u + Math.sin(a) * 0.1 * u, 0.0 + Math.sin(a) * 0.12 * u, i / 24 < b && i % 2 === 0 ? 1 : 0); }
      border.commit();
      pole.visible = f > 0.01; pole.position.set(ix + 0.05 * u, sea + 0.05 * u + 0.15 * u * (1 - f), 0.02 * u); pole.scale.setScalar(grow(f)); flagM.rotation.y = 0.25 * Math.sin(t * 3); pole.rotation.z = 0.15 * wobble(v, 3.1, 0.6, 4);
    },
  };
}
function planeHop(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sea = floor + 0.05 * u, a = B.maxX + 0.15 * u, b = B.maxX + 1.15 * u;
  const water = solidProp([[G.box(1.6 * u, 0.02 * u, 0.5 * u, 0, 0, 0), 0x2a6ad0]], 0.4), isles = solidProp([...island(u, 0.7).map(([g, c]) => [g.clone().translate(a - (a + b) / 2, 0, 0), c]), ...island(u, 0.8, 0xa0c860).map(([g, c]) => [g.clone().translate(b - (a + b) / 2, 0, 0), c]), ...flag(u, 1.2, 0xffffff, 0xe02020).map(([g, c]) => [g.clone().translate(a - (a + b) / 2, 0.05 * u, 0), c]), ...flag(u, 1.2, 0x3a6ad0, 0xffd040).map(([g, c]) => [g.clone().translate(b - (a + b) / 2, 0.06 * u, 0), c])], 0.45);
  const plane = solidProp([[G.capsule(0.03 * u, 0.22 * u, 0, 0, 0, Math.PI / 2), 0xf0f0f4], [G.box(0.06 * u, 0.008 * u, 0.32 * u, 0.0, 0, 0), 0xd03030], [G.box(0.04 * u, 0.08 * u, 0.008 * u, -0.13 * u, 0.04 * u, 0), 0xd03030]], 0.6), trail = many([[G.sphere(0.012 * u), 0xffffff]], 10, 1.0);
  water.position.set((a + b) / 2, sea, -0.1 * u); water.rotation.x = 0.45; isles.position.set((a + b) / 2, sea + 0.02 * u, 0);
  group.add(water, isles, plane, trail);
  const loop = 5.6, P = (f) => [a + (b - a) * f, sea + 0.35 * u + 0.35 * u * Math.sin(Math.PI * f)];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.3, 3.6), [x, y] = P(f);
      plane.visible = f > 0 && f < 1; plane.position.set(x, y, 0.05 * u); plane.rotation.z = Math.cos(Math.PI * f) * 0.4;
      for (let i = 0; i < 10; i++) { const g = f - (i + 1) * 0.03, [tx, ty] = P(Math.max(0, g)); trail.set(i, tx, ty, 0.04 * u, g > 0 && f < 1 ? 1 - i / 10 : 0); }
      trail.commit();
    },
  };
}
function visitor(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.45 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0x3a9a8a, hair: 0xe0b040 }), bag = solidProp([[G.box(0.22 * u, 0.28 * u, 0.1 * u, 0, 0.14 * u, 0), 0xc04a3a], [G.box(0.08 * u, 0.02 * u, 0.02 * u, 0, 0.3 * u, 0), 0x303030], [G.cyl(0.02 * u, 0.02 * u, 0.1 * u, -0.07 * u, 0.0, 0, Math.PI / 2), 0x202020], [G.cyl(0.02 * u, 0.02 * u, 0.1 * u, 0.07 * u, 0.0, 0, Math.PI / 2), 0x202020]], 0.45);
  const passport = solidProp([[G.box(0.25 * u, 0.33 * u, 0.01 * u, 0, 0, 0), 0x2a3a8a], [G.cyl(0.055 * u, 0.055 * u, 0.012 * u, 0, 0.04 * u, 0, Math.PI / 2), 0xffd040]], 0.5), inside = solidProp([[G.box(0.24 * u, 0.32 * u, 0.012 * u, 0, 0, 0), 0xf4f0e4], [G.box(0.08 * u, 0.1 * u, 0.014 * u, -0.06 * u, 0.06 * u, 0), 0x9ab0c8]], 0.5), mark = solidProp([[G.torus(0.06 * u, 0.012 * u), 0xe02020], [G.box(0.07 * u, 0.012 * u, 0.01 * u, 0, 0, 0), 0xe02020]], 1.0);
  const stamp = solidProp([[G.cyl(0.04 * u, 0.05 * u, 0.06 * u, 0, 0.03 * u, 0), 0xc03030], [G.cyl(0.015 * u, 0.015 * u, 0.1 * u, 0, 0.1 * u, 0), 0x6a3a1a], [G.sphere(0.03 * u, 0, 0.16 * u, 0), 0x6a3a1a]], 0.5);
  group.add(p.group, bag, passport, inside, mark, stamp);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 0 : between(v, 0, 1.4), open = pre ? 0 : between(v, 1.6, 2.0) * (1 - between(v, 4.8, 5.2)), thump = pre ? 0 : between(v, 2.4, 2.7);
      const x = dx + 0.7 * u * (1 - w);
      p.reset().face(w < 1 ? 'left' : 0.5); if (w > 0 && w < 1) p.walk(v * 9, 1); p.group.position.set(x, floor, 0.0); p.update();
      bag.position.set(x + 0.22 * u, floor, -0.02 * u); bag.rotation.z = w > 0 && w < 1 ? 0.05 * Math.sin(v * 9) : 0;
      const px = dx - 0.3 * u, py = floor + 0.55 * u;
      passport.visible = !pre && open < 0.5; passport.position.set(px, py, 0.15 * u);
      inside.visible = open >= 0.5; inside.position.set(px, py, 0.15 * u); mark.visible = open >= 0.5 && thump > 0.6; mark.position.set(px + 0.04 * u, py - 0.06 * u, 0.16 * u); mark.rotation.z = 0.3;
      const sy = py + 0.35 * u - 0.36 * u * bump(v, 2.2, 0.6); stamp.visible = open >= 0.5 && v < 3.4; stamp.position.set(px + 0.04 * u, sy, 0.17 * u); stamp.rotation.x = Math.PI / 2;
    },
  };
}

export const SCENES = { 'island-flag': islandFlag };
