// "kit": a review sheet of the props kit (not for cards). Look at a new prop here before using it widely:
//   node scripts/look.mjs 5927~kit --recipes kit.json  (with { "5927~kit": { "material": "chalk", "vignette": "kit" } })
// Left: four hands cycling through the poses; right: a person walking, then waving; below: the things.
import * as THREE from 'three';
import { createHand, POSES } from '../pieces/kit-hand.js';
import { createPerson } from '../pieces/kit-person.js';
import { hammer, nail, board, plate, ball, heart, burst, stars } from '../pieces/kit-things.js';

function kit(ctx, spec, stage) {
  const u = stage.u, group = new THREE.Group(), names = Object.keys(POSES);
  const hands = [0, 1, 2, 3].map((i) => { const h = createHand({ u: 0.75 * u, side: i % 2 ? -1 : 1 }); h.group.position.set(-0.95 * u + 0.26 * u * i, -0.55 * u, 0); group.add(h.group); return h; });
  const walker = createPerson({ u }).face('right'); walker.group.position.set(0.75 * u, -0.5 * u, 0);
  const waver = createPerson({ u, shirt: 0xe05a8a, hair: 0x8a4a20 }); waver.group.position.set(1.25 * u, -0.5 * u, 0);
  group.add(walker.group, waver.group);
  const things = [hammer(u), nail(u), board(u, { w: 0.6 }), plate(u), ball(u, { stripe: 0xffffff }), heart(u), burst(u), stars(u)];
  things.forEach((m, i) => { m.position.set(-1.0 * u + 0.36 * u * i, -1.05 * u, 0); group.add(m); });
  things[2].position.y += 0.12 * u; things[3].rotation.x = 0.5;
  return {
    group,
    step(t) {
      hands.forEach((h, i) => { const k = (t * 0.5 + i) % names.length, a = Math.floor(k); h.pose(names[a], names[(a + 1) % names.length], Math.min(1, (k - a) * 2)); });
      walker.reset().walk(t * 6).update();
      waver.reset().raise('R', 2.4).update(); waver.bone('foreR').rotation.z = 0.5 * Math.sin(t * 6); waver.update();
      things[0].rotation.z = 0.3 * Math.sin(t * 2); things[6].rotation.z = t; things[7].rotation.y = t * 2;
    },
  };
}

export const SCENES = { kit };
