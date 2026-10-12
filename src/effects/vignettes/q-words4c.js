// Model scene for できる (to be able to do), flag-fix round 4.
//   hurdle-jump: a runner takes a run-up on a diagonal towards a high bar and jumps, but only gets his feet up so far: the bar
//                is knocked off (あっ!), he lands on the mat and hangs his head; he walks back, the bar is set up again
//                (もういちど!), he runs and jumps again, sails over it, lands on the mat and cheers: できた! with stars.
//   The bar runs across the picture (left-right) so its height reads from the front seat; he runs in from back-left to front-right.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { label, pop, lerp, person } from './q-common.js';
import { sparkleShape } from './words4-kit.js';

const YAW = 0.55, DX = Math.sin(YAW), DZ = Math.cos(YAW), sm = (x) => x * x * (3 - 2 * x);

export function hurdleJump(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY, group = new THREE.Group(), h = 0.8 * u;
  const p = person(spec.who, u, 0.8), xb = B.maxX + 0.6 * u, hb = 0.4 * u, half = 0.5 * u, matTop = 0.14 * u, s0 = -0.95 * u, sLand = 0.65 * u;
  const stripes = Array.from({ length: 8 }, (_, i) => [G.box(2 * half / 8, 0.035 * u, 0.035 * u, -half + (i + 0.5) * 2 * half / 8, 0, 0), i % 2 ? 0xffffff : 0xe03030]);
  const bar = solidProp([...stripes, ...[-1, 1].map((s) => [G.sphere(0.022 * u, s * (half + 0.005 * u), 0, 0), 0xc8ccd4])], 0.5);
  const posts = solidProp([...[-1, 1].flatMap((s) => [[G.cyl(0.02 * u, 0.02 * u, 0.62 * u, s * (half + 0.05 * u), 0.31 * u, 0), 0xf0f0f0], [G.cyl(0.05 * u, 0.06 * u, 0.025 * u, s * (half + 0.05 * u), 0.0125 * u, 0), 0x40444c], [G.box(0.06 * u, 0.02 * u, 0.05 * u, s * (half + 0.02 * u), hb - 0.03 * u, 0), 0xffd040]]),
    ...Array.from({ length: 5 }, (_, i) => [G.box(0.02 * u, 0.004 * u, 0.04 * u, (half + 0.075 * u) * (i % 2 ? 1 : -1), 0.1 * u + 0.1 * u * i, 0), 0x40444c])], 0.4);
  const mat = solidProp([[G.box(1.5 * u, matTop, 1.1 * u, 0, matTop / 2, 0), 0xe0603a], [G.box(1.52 * u, 0.02 * u, 1.12 * u, 0, matTop - 0.01 * u, 0), 0xf08a4a], [G.box(1.52 * u, 0.02 * u, 1.12 * u, 0, 0.01 * u, 0), 0xa0381e]], 0.4);
  mat.position.set(xb, floor, 0.6 * u); posts.position.set(xb, floor, 0);
  const no = label(u, 'あっ!', '#d83030', 0.15), again = label(u, 'もういちど!', '#e0782a', 0.15), yes = label(u, 'できた!', '#2aa050', 0.2);
  const stars = many([[new THREE.ExtrudeGeometry(sparkleShape(), { depth: 0.06, bevelEnabled: false }).translate(0, 0, -0.03), 0xffe040]], 7, 1);
  group.add(mat, posts, bar, p.group, no, again, yes, stars);
  const loop = 15.0, pos = (s) => [xb + DX * s, DZ * s];
  const ground = (s) => matTop * sm(Math.min(1, Math.max(0, (s - 0.12 * u) / (0.15 * u))));
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      let s = s0, y = 0, yaw = YAW, clip = 'Idle', ct = t, pitch = 0, head = 0;
      if (!pre) {
        if (v < 0.7) { /* ready */ }
        else if (v < 2.2) { s = lerp(s0, -0.4 * u, between(v, 0.7, 2.2)); clip = 'Run'; ct = v; }
        else if (v < 3.3) { const f = between(v, 2.2, 3.3); s = lerp(-0.4 * u, sLand, f); y = -0.16 * u * 4 * f * (1 - f); clip = 'Jump'; ct = (v - 2.2); }
        else if (v < 5.4) { s = sLand; clip = v < 3.9 ? 'RecieveHit' : 'Idle'; ct = v < 3.9 ? v - 3.3 : t; head = between(v, 3.5, 4.0) * (1 - between(v, 5.0, 5.4)); yaw = lerp(YAW, 0.2, between(v, 3.5, 4.2)); pitch = head; }
        else if (v < 7.2) { const f = between(v, 5.4, 7.2); s = lerp(sLand, s0, f); clip = 'Walk'; ct = v; yaw = YAW + Math.PI; }
        else if (v < 8.7) { yaw = lerp(YAW + Math.PI, YAW, between(v, 7.2, 7.5)); }
        else if (v < 9.9) { s = lerp(s0, -0.4 * u, between(v, 8.7, 9.9)); clip = 'Run'; ct = v; }
        else if (v < 11.0) { const f = between(v, 9.9, 11.0); s = lerp(-0.4 * u, sLand, f); y = 0.3 * u * 4 * f * (1 - f); clip = 'Jump'; ct = v - 9.9; }
        else if (v < 13.2) { s = sLand; clip = 'Victory'; ct = v - 11.0; yaw = lerp(YAW, 0, between(v, 11.0, 11.4)); }
        else { const f = between(v, 13.2, 14.7); s = lerp(sLand, s0, f); clip = 'Walk'; ct = v; yaw = YAW + Math.PI; }
        if (v >= 13.2 && v < 13.5) yaw = lerp(0, YAW + Math.PI, between(v, 13.2, 13.5));
      }
      const [px, pz] = pos(s);
      p.pose(clip, ct, clip === 'Jump' || clip === 'RecieveHit' || clip === 'Victory' ? false : true);
      p.turn('Head', pitch * 0.5); p.turn('Abdomen', pitch * 0.5);
      p.group.position.set(px, floor + ground(s) + y, pz); p.group.rotation.y = yaw;
      // the bar: on its pegs, knocked off at the first jump (flies back and lies on the ground), set back up while he walks away
      const fall = pre ? 0 : between(v, 2.7, 3.3), back = pre ? 1 : v < 5.9 ? 0 : sm(between(v, 5.9, 6.4)), up = v >= 5.9 || pre ? back : 1 - fall;
      const k = fall * (1 - (pre || v < 5.9 ? 0 : 1)), bounce = fall > 0.7 ? 0.03 * u * Math.abs(Math.sin((fall - 0.7) * 20)) : 0;
      if (!pre && v >= 5.9) { bar.position.set(xb, floor + hb, 0); bar.rotation.set(0, 0, 0); bar.scale.setScalar(Math.max(1e-3, back)); }
      else { bar.scale.setScalar(1); bar.position.set(xb + 0.1 * u * k, floor + lerp(hb, 0.02 * u, k * k) + bounce, -0.55 * u * k); bar.rotation.set(2.6 * k, 0.3 * k, 0.1 * k); }
      bar.visible = !(v >= 5.9 && back < 0.01 && !pre);
      const head3 = floor + 0.98 * h + ground(s) + y;
      pop(no, pre ? 0 : between(v, 2.75, 3.0) * (1 - between(v, 4.8, 5.0)), px + 0.1 * u, head3 + 0.12 * u, pz + 0.1 * u);
      pop(again, pre ? 0 : between(v, 7.3, 7.6) * (1 - between(v, 8.5, 8.7)), px + 0.05 * u, head3 + 0.15 * u, pz + 0.1 * u);
      pop(yes, pre ? 0 : between(v, 11.4, 11.7) * (1 - between(v, 12.9, 13.2)), px + 0.1 * u, head3 + 0.2 * u, pz + 0.12 * u);
      const st = pre ? 0 : between(v, 11.3, 11.6) * (1 - between(v, 12.9, 13.2));
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.4; stars.set(i, px + Math.cos(a) * (0.3 + 0.05 * (i % 3)) * u, floor + matTop + 0.5 * h + Math.sin(a) * 0.45 * u, pz + 0.1 * u, 0.15 * u * st * (0.6 + 0.4 * Math.sin(v * 6 + i)), v * 1.5 + i); }
      stars.commit();
    },
  };
}
export const SCENES = { 'hurdle-jump': hurdleJump };
