// Family and self.
//   coat-on      着: a person walks in and stops on a mat beside the kanji (arrive); a coat drops onto them from above, the
//                sleeves slide down their arms, they tug the front straight and twirl to show it off (wear)
//   mirror-me    自: a person in front of a standing mirror; in the mirror their face looks back; they point at their
//                own nose (the Japanese "me"), the reflection does too, a sparkle: that is me
//   big-brother  兄: a big kid holds a ball up high while a small one hops for it; he laughs, lowers it, hands it over
//                and pats the small one's head
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { ball, burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint } from './helpers.js';

const SHIRT = 0xd8d8e0, SKIN = 0xffd2b0;

function coatOn(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, COAT = spec.color ?? 0xc8402a;
  const p = createPerson({ u, shirt: SHIRT });
  const coat = solidProp([[G.box(0.25 * u, 0.3 * u, 0.2 * u, 0, 0, 0), COAT], [G.cyl(0.05 * u, 0.05 * u, 0.3 * u, -0.17 * u, -0.02 * u, 0, 0, 0, 0.3), COAT], [G.cyl(0.05 * u, 0.05 * u, 0.3 * u, 0.17 * u, -0.02 * u, 0, 0, 0, -0.3), COAT], [G.box(0.12 * u, 0.04 * u, 0.21 * u, 0, 0.16 * u, 0), 0x8a2a1a], ...[0, 1, 2].map((i) => [G.sphere(0.012 * u, 0, (0.08 - i * 0.08) * u, 0.105 * u), 0xffd040])]);
  const mat = solidProp([[G.box(0.5 * u, 0.02 * u, 0.3 * u, 0, 0.01 * u, 0), 0x6a8a4a]], 0.3); mat.position.set(px, floor, 0.02 * u);
  group.add(mat, p.group, coat);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.0, 'out'], drop: [1.2, 0.5, 'in'], sleeves: [1.75, 0.5], tug: [2.3, 0.4], twirl: [2.8, 0.9], off: [4.3, 0.5] });
      const x = pre ? px + 1.4 * u : px + (1 - T.walk) * 1.2 * u;
      p.group.position.set(x, floor, 0.02 * u); p.face(pre || T.walk < 1 ? 'left' : 0).group.rotation.y += pre ? 0 : Math.PI * 2 * T.twirl;
      p.reset().walk(v * 9, !pre && T.walk < 1 ? 1 : 0);
      const tug = bump(v, 2.3, 0.45); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 0.8 * tug; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.4 * tug;
      p.update();
      // the coat: falls from above onto the shoulders, then becomes the person's own (body, then the sleeves down to the wrists)
      const on = pre ? 0 : T.drop * (1 - T.off), dressed = pre ? 0 : T.drop >= 1 ? 1 - T.off : 0;
      coat.visible = on > 0 && dressed === 0; coat.position.set(x, floor + 0.53 * u + (1 - T.drop) * 1.1 * u, 0.02 * u); coat.rotation.z = 0.4 * (1 - T.drop);
      const sl = dressed * T.sleeves;
      p.rig.setColor('body', dressed > 0.5 ? COAT : SHIRT);
      p.rig.setColor('armL', sl > 0.3 && dressed > 0.5 ? COAT : SHIRT); p.rig.setColor('armR', sl > 0.3 && dressed > 0.5 ? COAT : SHIRT);
      p.rig.setColor('foreL', sl > 0.8 && dressed > 0.5 ? COAT : SKIN); p.rig.setColor('foreR', sl > 0.8 && dressed > 0.5 ? COAT : SKIN);
    },
  };
}

function mirrorMe(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.6 * u, mz = -0.15 * u, my = floor + 0.62 * u;
  const frame = solidProp([[G.torus(0.3 * u, 0.04 * u).scale(1, 1.3, 1), 0xd8a040], [G.cyl(0.29 * u, 0.29 * u, 0.01 * u, 0, 0, -0.012 * u, Math.PI / 2).scale(1, 1.3, 1), 0xbfe0f0], [G.cyl(0.02 * u, 0.025 * u, 0.25 * u, 0, -0.5 * u, -0.02 * u), 0x8a5a30], [G.box(0.3 * u, 0.03 * u, 0.15 * u, 0, -0.62 * u, -0.02 * u), 0x8a5a30]], 0.35);
  frame.position.set(mx, my, mz);
  const me = createPerson({ u, shirt: 0x3aa0e0 }), you = createPerson({ u: 0.8 * u, shirt: 0x3aa0e0 });
  for (const b of ['legL', 'legR', 'shinL', 'shinR', 'footL', 'footR']) you.rig.hide(b);     // only the top half shows in the glass
  const spark = burst(u, { s: 0.3, color: 0xffffff });
  group.add(frame, you.group, me.group, spark);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const show = timeline(A.setup, { a: [0.3, 0.5, 'back'] }).a;
      frame.scale.setScalar(Math.max(1e-3, show));
      const T = timeline(v, { point: [0.4, 0.4, 'back'], down: [2.6, 0.5], wave: [3.1, 1.0, 'linear'] });
      const pt = pre ? 0 : T.point - T.down, wave = pre ? 0 : bump(v, 3.1, 1.0);
      // the real person stands in front of the mirror, back to you, a little to the left so you see the reflection
      me.group.position.set(mx - 0.32 * u, floor, 0.22 * u); me.face('away').reset();
      me.bone('armR').rotation.x = 2.3 * pt; me.bone('foreR').rotation.x = 1.9 * pt; me.raise('L', 2.4 * wave);
      me.update();
      // the reflection faces you inside the glass and copies them (mirrored: the other arm)
      you.group.position.set(mx + 0.02 * u, my - 0.62 * u, mz + 0.02 * u); you.group.visible = show > 0.9; you.face('toward').reset();
      you.bone('armL').rotation.x = 2.3 * pt; you.bone('foreL').rotation.x = 1.9 * pt; you.raise('R', 2.4 * wave);
      you.update();
      const sp = pre ? 0 : bump(v, 1.0, 0.8); spark.visible = sp > 0; spark.scale.setScalar(Math.max(1e-3, sp)); spark.position.set(mx + 0.22 * u, my + 0.32 * u, 0.05 * u); spark.rotation.z = v * 2;
    },
  };
}

function bigBrother(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = createPerson({ u: 1.05 * u, shirt: 0x3a6ae0 }), small = createPerson({ u: 0.62 * u, shirt: 0xf0c030, hair: 0x6a3a1a }), toy = ball(u, { r: 0.07, color: 0xe84040, stripe: 0xffffff });
  const bx = B.maxX + 0.35 * u, sx = B.maxX + 0.78 * u;
  group.add(big.group, small.group, toy);
  const loop = 5.0, pos = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lower: [1.9, 0.5], give: [2.4, 0.4], pat: [2.9, 0.4], unpat: [3.9, 0.4], up: [4.4, 0.5] });
      const high = pre ? 1 : 1 - T.lower + T.up;
      big.group.position.set(bx, floor, 0); big.face(0.6).reset();
      big.raise('L', 2.7 * high); big.bone('head').rotation.z = 0.15 * Math.sin(v * 12) * bump(v, 0.6, 1.2);      // laughs
      big.bone('armL').rotation.x = 1.0 * T.give * (1 - T.up) + 1.4 * (T.pat - T.unpat);
      big.update();
      const hop = pre ? 0 : Math.abs(Math.sin(v * Math.PI * 1.6)) * (v < 1.9 ? 1 : 0), happy = pre ? 0 : Math.abs(Math.sin(v * 9)) * between(v, 3.2, 3.4) * (1 - T.up);
      small.group.position.set(sx, floor + 0.12 * u * hop + 0.03 * u * happy, 0.05 * u); small.face(-0.6).reset();
      small.raise('R', 2.8 * (v < 1.9 || pre ? 1 : 0.3)); small.raise('L', 2.2 * hop);
      small.update();
      // the ball: in the big kid's raised hand, then handed down into the small one's hands
      const hb = bonePoint(big, 'handL', 0.5, pos).clone(), hs = bonePoint(small, 'handR', 0.5, pos).clone(), k = pre ? 0 : T.give * (1 - T.up);
      toy.position.lerpVectors(hb, hs, k); toy.position.y += 0.06 * u; toy.position.z += 0.04 * u;
    },
  };
}

export const SCENES = { 'coat-on': coatOn, 'mirror-me': mirrorMe, 'big-brother': bigBrother };
