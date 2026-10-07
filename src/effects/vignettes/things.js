// Scenes with things (no people).
//   stack-plates  皿: the kanji is the stand: plates fly in one by one and land on its top with a clink, the top one
//                 wobbles, a cake drops onto it; then they lift off together and the stack builds again
//   odd-one-out   違: a row of identical blue balls bounces in step beside the kanji; one is a red cube hopping out of
//                 time; a magnifier glides along the row, stops on it, it flashes and a red cross pops up
import * as THREE from 'three';
import { acts, timeline, bump, wobble, lerp } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { G } from '../pieces/shape-kit.js';
import { solidProp } from '../pieces/kit-rig.js';

function plateShape(u, r, color = 0xf6f4ee, rim = 0x3a6ad0) {
  const k = (x) => x * u, pts = [[0, 0], [k(r * 0.55), 0], [k(r * 0.62), k(0.014)], [k(r * 0.95), k(0.04)], [k(r), k(0.05)]].map(([x, y]) => new THREE.Vector2(x, y));
  return [[new THREE.LatheGeometry(pts, 40), color], [G.torus(k(r * 0.8), k(0.01)).rotateX(Math.PI / 2).translate(0, k(0.034), 0), rim]];
}

function stackPlates(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), N = 4, R = Math.min(0.42, (B.w / u) * 0.42), H = 0.06 * u;
  const plates = many(plateShape(u, R), N, 0.35);
  const cake = solidProp([[G.cyl(0.16 * u, 0.16 * u, 0.13 * u, 0, 0.065 * u), 0xffe8c8], [G.cyl(0.165 * u, 0.165 * u, 0.03 * u, 0, 0.12 * u), 0xff8ab0], [G.sphere(0.035 * u, 0, 0.165 * u), 0xe02030], [G.cyl(0.004 * u, 0.004 * u, 0.04 * u, 0, 0.2 * u), 0x40a040]]);
  group.add(plates, cake);
  const top = B.maxY + 0.005 * u, LAND = [0.2, 0.75, 1.3, 1.85], loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { cake: [2.4, 0.45, 'bounce'], away: [3.6, 0.6, 'in'] });
      const lift = T.away * 1.6 * u, fade = 1 - T.away;
      let shake = 0;
      for (let i = 0; i < N; i++) {                                    // each flies in from the upper right on an arc, lands, clinks
        const f = pre ? 0 : Math.min(1, Math.max(0, (v - (LAND[i] - 0.45)) / 0.45)), arc = 1 - f;
        const y = top + i * H + arc * 0.9 * u + lift + 0.008 * u * bump(v, LAND[i], 0.18);
        const x = B.cx + arc * 1.4 * u, w = wobble(v, LAND[i], 0.5, 6) * 0.08;
        if (i === N - 1) shake = wobble(v, LAND[i], 0.9, 3) * 0.06 + wobble(v, 2.85, 0.9, 3) * 0.08;
        plates.set(i, x, y, 0.02 * u, f > 0 ? fade : 0, w + (i === N - 1 ? shake : 0) - arc * 0.8, 0, 0.42);   // tipped towards you: you see they are plates
      }
      plates.commit();
      // the cake drops onto the top plate (and wobbles with it)
      const cy = top + N * H + (1 - T.cake) * 0.9 * u + lift;
      cake.visible = !pre && v > 2.4; cake.position.set(B.cx + Math.sin(shake) * 0.05 * u, cy, 0.02 * u); cake.rotation.set(0.42, 0, shake); cake.scale.setScalar(Math.max(1e-3, fade));
      stage.glyph.position.y = stage.glyph.userData.base.y - 0.004 * u * LAND.reduce((s, l) => s + bump(v, l, 0.2), 0);   // the stand gives a little
    },
  };
}

function oddOneOut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), N = 4, odd = 2, r = 0.085 * u, gap = 0.26 * u;
  const balls = many([[G.sphere(r), 0x3a8ae8], [G.torus(r * 1.0, r * 0.1).rotateX(Math.PI / 2), 0xe8f2ff]], N, 0.4);
  const cube = solidProp([[new THREE.BoxGeometry(1.6 * r, 1.6 * r, 1.6 * r), 0xe03838]], 0.45);
  const lens = solidProp([[G.torus(0.17 * u, 0.025 * u), 0x404858], [new THREE.CircleGeometry(0.16 * u, 32), 0xbfe8ff], [G.cyl(0.025 * u, 0.03 * u, 0.26 * u, 0.24 * u, -0.24 * u, 0.0, 0, 0, Math.PI / 4), 0x8a5a30]], 0.35);
  lens.material.transparent = true; lens.material.opacity = 0.85;
  const cross = solidProp([[G.box(0.36 * u, 0.08 * u, 0.06 * u, 0, 0, 0, Math.PI / 4), 0xff3030], [G.box(0.36 * u, 0.08 * u, 0.06 * u, 0, 0, 0, -Math.PI / 4), 0xff3030]], 0.6);
  group.add(balls, cube, lens, cross);
  const x0 = B.maxX + 0.28 * u, floor = B.minY + 0.12 * u, loop = 4.4;
  const xOf = (i) => x0 + i * gap;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = A.setup;
      const T = timeline(v, { glide: [0.6, 1.4], found: [2.0, 0.3, 'back'], x: [2.3, 0.4, 'back'], away: [3.7, 0.5] });
      const show = timeline(s, { a: [0.3, 0.5, 'back'] }).a;
      const beat = (pre ? A.s : v) * 2.2;                                // they all hop together, twice a second
      for (let i = 0; i < N; i++) {
        if (i === odd) continue;
        const hop = Math.abs(Math.sin(beat * Math.PI)) * 0.18 * u;
        balls.set(i, xOf(i), floor + r + hop, 0, show);
      }
      balls.set(odd, 0, 0, 0, 0); balls.commit();
      const hopOdd = Math.abs(Math.sin(beat * Math.PI * 1.37 + 1.2)) * 0.26 * u, flash = 1 + 0.25 * bump(v, 2.0, 0.4);
      cube.position.set(xOf(odd), floor + 0.8 * r + hopOdd, 0); cube.rotation.z = beat * 1.3; cube.scale.setScalar(Math.max(1e-3, show * flash));
      // the magnifier glides along the row, stops over the odd one; then the cross
      const gx = lerp(xOf(0), xOf(odd), pre ? 0 : T.glide);
      lens.visible = !pre && v > 0.4 && T.away < 1; lens.position.set(gx, floor + 0.55 * u, 0.12 * u); lens.scale.setScalar(Math.max(1e-3, timeline(v, { a: [0.4, 0.3, 'back'] }).a * (1 - T.away)));
      cross.visible = !pre && T.x > 0 && T.away < 1; cross.position.set(xOf(odd), floor + 0.95 * u, 0.15 * u); cross.scale.setScalar(Math.max(1e-3, T.x * (1 - T.away))); cross.rotation.z = 0.15 * wobble(v, 2.3, 0.6, 5);
    },
  };
}

export const SCENES = { 'stack-plates': stackPlates, 'odd-one-out': oddOneOut };
