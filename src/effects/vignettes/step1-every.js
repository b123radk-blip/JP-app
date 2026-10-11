// Step 1 scene 毎 (split out of step1-time.js):
//   every-unit  毎: unit cups: a woman with a teapot walks along a low table of four cups and fills every one, holding
//               the pot by its handle; day / week / month / year (毎日 毎週 毎月 毎年): the unit's tiles are pinned on a
//               notice board; a woman with a big rubber stamp walks along it and presses a red tick onto every tile,
//               thump, thump, thump
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { tileRow } from './step1-time.js';
import { LEFT, person } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), BACK = new THREE.Vector3(0, 0, -1);
// walking between stops: x along a list of stops (seconds `at` each), stepping for `dur` before each
function stops(v, xs, at, dur) {
  let x = xs[0], walking = false;
  for (let i = 1; i < xs.length; i++) { const f = between(v, at[i] - dur, at[i]); if (f > 0) { x = xs[i - 1] + (xs[i] - xs[i - 1]) * f; walking = walking || f < 1; } }
  return { x, walking };
}

export function everyUnit(ctx, spec, stage) {
  if ((spec.unit ?? 'cups') === 'cups') return everyCup(ctx, spec, stage);
  const u = stage.u, B = stage.box, floor = B.minY, row = tileRow(stage, spec.unit, { n: 3 }), group = new THREE.Group();
  // the stamp lies along its own +y: the red pad at y = 0, handle, knob at the far end
  const sl = 0.26 * u, kr = 0.05 * u;
  const stamp = solidProp([[G.cyl(0.08 * u, 0.09 * u, 0.06 * u, 0, 0.03 * u, 0), 0xc83030], [G.cyl(0.075 * u, 0.075 * u, 0.012 * u, 0, 0.003 * u, 0), 0x801818], [G.cyl(0.025 * u, 0.03 * u, sl - 0.1 * u, 0, 0.06 * u + (sl - 0.1 * u) / 2, 0), 0x8a5a30], [G.sphere(kr, 0, sl - kr * 0.6, 0), 0x8a5a30]], 0.5);
  const ticks = many([[G.poly([[-0.07 * u, 0], [-0.015 * u, -0.06 * u], [0.08 * u, 0.07 * u]], 0.018 * u), 0xe02020]], 3, 1.0);
  // a notice board the tiles are pinned to, on two legs
  const slotY = row.y + row.H / 2 + 0.17 * u;
  const bx0 = row.x(0) - row.W / 2 - 0.08 * u, bx1 = row.x(2) + row.W / 2 + 0.08 * u, by0 = row.y - row.H / 2 - 0.08 * u, by1 = row.y + row.H / 2 + 0.3 * u, bz = -0.045 * u;
  const board = solidProp([[G.box(bx1 - bx0, by1 - by0, 0.03 * u, (bx0 + bx1) / 2, (by0 + by1) / 2, bz), 0xc8945a], [G.box(bx1 - bx0 + 0.05 * u, 0.04 * u, 0.05 * u, (bx0 + bx1) / 2, by1, bz), 0x7a5232], [G.box(bx1 - bx0 + 0.05 * u, 0.04 * u, 0.05 * u, (bx0 + bx1) / 2, by0, bz), 0x7a5232],
    ...[bx0 + 0.06 * u, bx1 - 0.06 * u].map((x) => [G.box(0.04 * u, by0 - floor, 0.04 * u, x, (floor + by0) / 2, bz - 0.01 * u), 0x7a5232]),
    ...[0, 1, 2].map((i) => [G.sphere(0.018 * u, row.x(i), row.y + row.H / 2 - 0.03 * u, 0.0), 0x3a7ae0]),
    // a white check box above each tile: the tick goes there, never onto the sun
    ...[0, 1, 2].map((i) => [G.box(0.22 * u, 0.2 * u, 0.012 * u, row.x(i), slotY, bz + 0.02 * u), 0xfffaf0])], 0.35);
  const p = person(spec.who ?? 'gal2', u, 0.85);
  group.add(board, row.group, stamp, ticks, p.group);
  const loop = 6.4, AT = [0.9, 2.1, 3.3], xs = [0, 1, 2].map((i) => row.x(i) + 0.27 * u);
  const knob = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tiles: [0, 0.6, 'back'], off: [4.9, 0.6] }), k = pre ? 0 : T.tiles * (1 - T.off);
      row.place([0, 1, 2].map(() => [0, 0, grow(k) * 0.95, 0]), v);
      // she steps along the board from tile to tile (and back to the first while the tiles are cleared away)
      const go = stops(pre ? 0 : v, [...xs, xs[0]], [...AT, 6.1], 0.5);
      p.pose(go.walking ? 'Walk' : 'Idle', go.walking ? v * 1.2 : t);
      p.group.position.set(go.x, floor, 0.24 * u);
      p.group.rotation.y = go.walking ? (v > 4.5 ? LEFT : -LEFT) : LEFT - 0.55;
      // at each tile: the stamp comes back off the board, pushes in flat onto the tile (thump) and lifts off again
      let press = 0, i = 0;
      for (let j = 0; j < 3; j++) { const f = between(v, AT[j] + 0.05, AT[j] + 0.75); if (f > 0 && f < 1) { press = Math.sin(Math.PI * f); i = j; } }
      if (!pre && v > AT[2] + 0.75) i = 2;
      const gap = 0.16 * u * (1 - Math.pow(press, 0.6)), hold = pre ? 0 : between(v, 0.3, 0.6) * (1 - between(v, 4.4, 4.8));
      const sx = go.walking ? go.x - 0.2 * u : row.x(i);
      stamp.position.set(sx, slotY, 0.012 * u + gap); stamp.rotation.set(Math.PI / 2, 0, 0);
      stamp.visible = hold > 0.02; stamp.scale.setScalar(grow(hold));
      // her right hand pushes on the knob from behind (the palm against it, toward the board)
      knob.set(sx, slotY, 0.012 * u + gap + sl - kr * 0.6); group.localToWorld(knob);
      p.grip('R', knob, W.copy(BACK).transformDirection(group.matrixWorld), kr * group.getWorldScale(W2).x, hold, { out: 0.5, down: 0.8 });
      for (let j = 0; j < 3; j++) { const d = pre ? 0 : between(v, AT[j] + 0.4, AT[j] + 0.5) * (1 - T.off); ticks.set(j, row.x(j), slotY, 0.02 * u, d); }
      ticks.commit();
    },
  };
}

function everyCup(ctx, spec, stage) {
  const B = stage.box, U = stage.u, u = 1.35 * U, group = new THREE.Group(), floor = B.minY, X = (i) => B.maxX + (0.2 + 0.28 * i) * u, ty = 0.2 * U;
  // a low table the cups stand on
  const table = solidProp([[G.box(1.2 * u, 0.04 * U, 0.22 * u, X(1.5), ty - 0.02 * U, 0), 0xa8744a], ...[-1, 1].flatMap((s) => [-1, 1].map((sz) => [G.box(0.04 * U, ty - 0.04 * U, 0.04 * U, X(1.5) + s * 0.55 * u, (ty - 0.04 * U) / 2, sz * 0.08 * u), 0x8a5a36]))], 0.35);
  table.position.y = floor;
  const cups = many([[G.cyl(0.09 * u, 0.07 * u, 0.12 * u, 0, 0.06 * u, 0, 0, 0, 0, 20), 0xf4efe6], [G.torus(0.04 * u, 0.012 * u, Math.PI * 2, 0.1 * u, 0.06 * u, 0), 0xf4efe6]], 4, 0.5), tea = many([[G.cyl(0.08 * u, 0.08 * u, 0.01 * u, 0, 0, 0), 0x6aa040]], 4, 0.7);
  // the pot: spout to -x, handle (a ring) at +x, its grip point at (0.15u, 0.16u)
  const pot = solidProp([[G.sphere(0.14 * u, 0, 0.12 * u, 0, 1.1, 0.9, 1), 0x3a7a5a], [G.cyl(0.02 * u, 0.03 * u, 0.16 * u, -0.17 * u, 0.15 * u, 0, 0, 0, 0.9), 0x3a7a5a], [G.torus(0.07 * u, 0.015 * u, Math.PI * 1.2, 0.13 * u, 0.16 * u, 0, -0.6), 0x3a7a5a], [G.sphere(0.03 * u, 0, 0.24 * u, 0), 0xc8a050]], 0.45);
  const stream = solidProp([[G.cyl(0.012 * u, 0.012 * u, 1, 0, -0.5, 0), 0x7ab050]], 0.8);
  const p = person(spec.who ?? 'gal2', U, 0.85);
  group.add(table, cups, tea, pot, stream, p.group);
  const loop = 6.4, AT = [0, 1, 2, 3].map((i) => 0.6 + i * 1.0), xs = [0, 1, 2, 3].map((i) => X(i) + 0.42 * u);
  const grip = new THREE.Vector3(), tip = new THREE.Vector3(), M = new THREE.Matrix4();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.3, 5.8);
      for (let i = 0; i < 4; i++) { cups.set(i, X(i), floor + ty, 0, pre ? 0 : 1 - off); const f = pre ? 0 : between(v, AT[i] + 0.15, AT[i] + 0.5) * (1 - off); tea.set(i, X(i), floor + ty + 0.02 * u + 0.09 * u * f, 0, f > 0.01 ? 1 : 0); }
      cups.commit(); tea.commit();
      // she walks along behind the table from cup to cup, then back to the first while the cups are cleared
      const go = stops(pre ? 0 : v, [...xs, xs[0]], [...AT, 6.3], 0.38);
      // with the pot she side-steps to the next cup (still facing the cups, a little hop); empty-handed she walks back
      const back = go.walking && v > 5;
      p.pose(back ? 'Walk' : 'Idle', back ? v * 1.2 : t);
      p.group.position.set(go.x, floor + (go.walking && !back ? 0.03 * U * Math.abs(Math.sin(v * 16)) : 0), -0.17 * u); p.group.rotation.y = back ? LEFT : LEFT + 0.35;
      let pour = 0, i = 0;
      for (let j = 0; j < 4; j++) { const f = between(v, AT[j], AT[j] + 0.6); if (f > 0 && f < 1) { pour = Math.min(1, Math.sin(Math.PI * f) * 1.6); i = j; } }
      if (!pre && v > AT[3] + 0.6) i = 3;
      const px = go.x - 0.12 * u, py = floor + ty + 0.2 * u, on = pre ? 0 : between(v, 0.2, 0.5) * (1 - between(v, 4.9, 5.3));
      pot.visible = on > 0.02; pot.scale.setScalar(grow(on)); pot.position.set(px, py, 0.02 * u); pot.rotation.z = 0.05 + 0.5 * pour;
      // her left hand (the near one) holds the pot by its handle, the palm against the handle's outside
      pot.updateMatrix(); grip.set(0.2 * u, 0.16 * u, 0).applyMatrix4(pot.matrix); group.localToWorld(grip);
      // the tea runs from the spout's tip down into the cup
      tip.set(-0.245 * u, 0.225 * u, 0).applyMatrix4(pot.matrix); stream.visible = pour > 0.6;
      stream.position.copy(tip); stream.scale.set(1, Math.max(0.01 * u, tip.y - floor - ty - 0.1 * u), 1);
      const toward = W.set(-1, 0, 0).applyMatrix4(M.extractRotation(pot.matrix)).transformDirection(group.matrixWorld);
      p.grip('L', grip, toward, 0.015 * u * group.getWorldScale(W2).x, on, { out: 0.6, down: 0.6 });
    },
  };
}

export const SCENES = { 'every-unit': everyUnit };
