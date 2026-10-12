// Meal scenes built from the Kenney food kit (models: plates, fork, apple, rice ball, fish, ...).
//   food-row   食べ物: a wooden tray tilted towards you; three plates slide on, each with a food (an apple, a rice ball, a
//              fish); a hand brings a fork straight down onto the apple, spears it, lifts it, holds it up, sets it back
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { createHand } from '../pieces/kit-hand.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo } from './helpers.js';

// a model wrapped so it can be turned and scaled about its own middle
const wrap = (name, opts) => { const m = createModel(name, opts), g = new THREE.Group(); g.add(m.group); return { m, g, inner: m.group }; };

export function foodRow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY + 0.28 * u, gap = 0.6 * u, PW = 0.52 * u;
  const tray = new THREE.Group(), x0 = B.maxX + 0.28 * u + gap * 0.5;
  tray.position.set(x0 + gap, floor, 0.0); tray.rotation.x = 0.75;                       // tipped towards you so the plates face you
  const board = solidProp([[G.box(3 * gap + 0.1 * u, 0.04 * u, 0.8 * u, 0, -0.02 * u, 0), 0xb98550], [G.box(3 * gap + 0.14 * u, 0.03 * u, 0.78 * u, 0, -0.05 * u, 0), 0x8a5a30]], 0.3);
  const K = PW / 0.89, FLOOR = 0.05 * K;                                                  // the kit's plate is 0.89 wide, its dish floor 0.05 up
  const FOODS = [['foodApple', 1.7 * K], ['foodRiceBall', 2.4 * K], ['foodFish', 1.0 * K]];
  const dishes = FOODS.map(([name, k], i) => {
    const d = new THREE.Group(), plate = createModel('foodPlate', { width: PW }), food = createModel(name, { height: k * (name === 'foodApple' ? 0.19 : name === 'foodRiceBall' ? 0.13 : 0.322) });
    food.group.position.y = FLOOR; if (name === 'foodFish') food.group.rotation.y = Math.PI / 2; if (name === 'foodRiceBall') food.group.rotation.y = Math.PI - 0.4;
    d.add(plate.group, food.group); d.position.set((i - 1) * gap, 0.0, 0); tray.add(d); return { d, food };
  });
  // the fork, standing on its tines: long axis y, tines down, flat face towards +z
  const fk = wrap('foodFork', { width: 0.8 * u }), fork = fk.g;
  fk.inner.rotation.set(Math.PI / 2, 0, 0); fk.inner.position.set(0, 0, 0); fork.rotation.z = Math.PI / 2;
  const forkG = new THREE.Group(); forkG.add(fork);
  forkG.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(forkG), tipOff = bb.min.y, topOff = bb.max.y;       // tines end / handle end of the turned fork
  const hand = createHand({ u: 0.62 * u, side: -1, sleeve: 0x4a8a6a, arm: 7 }); hand.pose('grip');
  { // the viewer's own hand: the forearm comes from the bottom-front right (along the tray's +z, towards you and down), the fist round the upright handle
    const y = new THREE.Vector3(-1, -0.25, -0.45).normalize(), x = new THREE.Vector3(0, 1, 0), z = new THREE.Vector3().crossVectors(x, y);
    hand.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  }
  tray.add(board, forkG, hand.group);
  group.add(tray);
  const appleH = 1.7 * K * 0.19, loop = 5.2, RISE = 0.32 * u, stabY = FLOOR + 0.45 * appleH, hoverY = FLOOR + appleH + 0.4 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { down: [0.7, 0.55, 'in'], up: [1.55, 0.7, 'out'], set: [3.1, 0.7], gone: [3.9, 0.6] });
      dishes.forEach(({ d }, i) => {
        const f = pre ? between(A.setup, 0.25 + 0.2 * i, 0.55 + 0.2 * i) : 1;
        d.position.set((i - 1) * gap + (1 - f) * 1.6 * u, 0, 0); d.visible = f > 0.01;
      });
      // the fork comes straight down onto the apple, spears it, lifts it, holds it up, sets it back and goes
      const lift = T.up - T.set, tip = (T.down < 1 ? hoverY + (stabY - hoverY) * T.down : stabY + lift * RISE) + T.gone * 1.1 * u, px = -gap;
      forkG.position.set(px, tip - tipOff, 0.02 * u); forkG.visible = !pre;
      const apple = dishes[0].food.group;
      apple.position.y = FLOOR + lift * RISE; apple.rotation.z = 0.06 * Math.sin(v * 9) * bump(v, 2.25, 1.0);
      hand.group.visible = !pre; hand.update(); handTo(hand, px, tip - tipOff + topOff * 0.6, 0.03 * u, hand.grip);
    },
  };
}
