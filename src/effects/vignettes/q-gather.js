// Haiku plan h1 (集 "gather; meet"): a girl scatters feed from a bowl and little chicks run in from all round and gather
// in a ring at her feet, pecking; they walk back to where they started.
//   q-chicks-gather  集: a girl dips her hand in a bowl and throws feed onto a grass patch; six chicks run in from the edge,
//                    gather round her feet, peck (!), and walk back the way they came
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { person, ADULT, label, pop } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
const lerp = (a, b, f) => a + (b - a) * f;
// in u from her feet (x to her left, z toward the learner): where the chicks start (round the patch, at least 0.4u from
// her) and their ring round her feet (0.34u out, none in front of her legs); RING_OF[i] is the ring place of chick i
const START = [[0.62, -0.287], [0.62, 0.287], [0, -0.72], [-0.62, -0.287], [-0.62, 0.287], [-0.22, 0.7]];
const RING = [[0.3195, 0.1163], [0.2944, -0.17], [0.1164, -0.3195], [-0.1164, -0.3195], [-0.2944, -0.17], [-0.3349, 0.059]];
const RING_OF = [1, 0, 2, 3, 4, 5], GRAINS = 14;

// ---- 集 ----
function chicksGather(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.8 * u, top = floor + 0.03 * u;
  const grass = solidProp([[G.cyl(0.7 * u, 0.7 * u, 0.03 * u, 0, 0.015 * u, 0), 0x6ab04c]], 0.35);
  grass.name = 'grass'; grass.position.set(x0, floor, 0);
  const who = person('gal2', u, ADULT);
  const bowl = solidProp([[G.cyl(0.06 * u, 0.045 * u, 0.05 * u, 0, 0, 0), 0xf4ead8], [G.sphere(0.05 * u, 0, 0.02 * u, 0, 1, 0.4, 1), 0xffd34a]], 0.4);
  const grains = many([[G.sphere(0.012 * u, 0, 0, 0), 0xffd34a]], GRAINS, 0.6);
  const chicks = START.map(() => createModel('chick', { height: 0.22 * u }));
  const tags = [1, 4].map(() => label(u, '!', '#e04848', 0.16));
  group.add(grass, who.group, bowl, grains, ...chicks.map((c) => c.group), ...tags);
  const loop = 7;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, S = group.getWorldScale(W).y;
      who.pose('Idle', t);
      who.group.position.set(x0, top, 0); who.group.rotation.y = 0;
      // the bowl rests on her left palm, held up at the chest (as the eating scene does)
      const rB = 0.045 * u * S;
      who.grip('L', who.local(0.1, 0.42, 0.27, W), W3.set(0, 1, 0), rB, 1, { out: 0.9, down: 0.5 });
      const palmL = who.hold(bowl, 'L', group, rB);
      bowl.quaternion.setFromUnitVectors(W2.set(0, 1, 0), palmL.lerp(W3.set(0, 1, 0), 0.75).normalize());
      // the right hand: into the bowl (0 to 0.5 s), then swings out to her right and throws (0.45 to 0.9 s), back at rest
      const bt = bowl.getWorldPosition(new THREE.Vector3());
      bt.y += 0.02 * u * S - 0.03 * u * S * bump(v, 0.2, 0.4);     // a little lower in the bowl at the dip
      const out = who.local(-0.35, 0.3, 0.3, new THREE.Vector3()), reach = between(v, 0, 0.3) * (1 - between(v, 1.3, 1.8));
      const target = bt.lerp(out, between(v, 0.45, 0.9));
      who.handTo('R', target, reach, { out: 0.6, down: 0.8 });
      // grains leave the hand from 0.6 s, arc out and land on the grass round her feet; gone by 5.5 s (pecked up)
      const from = group.worldToLocal(out.clone());
      for (let i = 0; i < GRAINS; i++) {
        const tg = 0.6 + 0.02 * i, f = between(v, tg, tg + 0.8), a = i * 2.4, r = (0.3 + 0.2 * ((i * 0.37) % 1)) * u;
        const lx = x0 + r * Math.cos(a), lz = r * Math.sin(a), on = !pre && f > 0 && v < 5.5;
        grains.set(i, lerp(from.x, lx, f), lerp(from.y, top + 0.006 * u, f) + 0.25 * u * Math.sin(Math.PI * f), lerp(from.z, lz, f), on ? 1 : 0);
      }
      grains.commit();
      // the chicks: depart from the edge (1 to 1.75 s, the last two running) to the ring, peck (3.5 to 5.5 s), walk back
      chicks.forEach((c, i) => {
        const [sx, sz] = START[i], [rx, rz] = RING[RING_OF[i]], q = 1.0 + 0.15 * i;
        const fo = between(v, q, 3.4), fb = between(v, 5.5 + 0.1 * i, 6.9), f = fo - fb;
        const moving = (fo > 0 && fo < 1) || (fb > 0 && fb < 1), running = i >= 4 && moving;
        if (moving) c.pose(running ? 'run' : 'walk', v + 0.2 * i);
        else if (!pre && v >= 3.5 && v < 5.5) c.pose('eat', v + 0.2 * i);
        else c.pose('idle', t + 0.4 * i);
        const dir = fb > 0 && fb < 1 ? [sx - rx, sz - rz] : fo > 0 && fo < 1 ? [rx - sx, rz - sz] : fo >= 1 && fb <= 0 ? [-rx, -rz] : [-sx, -sz];
        c.group.visible = !pre; c.group.rotation.y = Math.atan2(dir[0], dir[1]);
        const cx = lerp(sx, rx, f), cz = lerp(sz, rz, f), onGrass = Math.hypot(cx, cz) <= 0.7 ? top : floor;   // the grass is 0.03u thick
        c.group.position.set(x0 + cx * u, onGrass, cz * u);
      });
      // a "!" over two chicks while they peck
      [1, 4].forEach((i, k) => {
        const [rx, rz] = RING[RING_OF[i]], on = pre ? 0 : between(v, 3.8 + 0.2 * k, 4.0 + 0.2 * k) * (1 - between(v, 4.9, 5.2));
        pop(tags[k], on, x0 + rx * u, top + 0.32 * u, rz * u);
      });
    },
  };
}

export const SCENES = { 'q-chicks-gather': chicksGather };
