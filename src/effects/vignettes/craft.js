// Craft scenes (tools in hands).
//   hammer-nail  上手 / 下手. Set-up (while the strokes draw): a board slides in beside the kanji, a nail pops up on it, a
//                helper hand pinches the nail upright and a hand with a hammer comes down from above.
//                outcome clean (skilled): a tap, the helper lets go, two firm blows drive the nail in flush, a sparkle,
//                  and the hammer is twirled like a baton.
//                outcome bend (unskilled): the first blow bends the nail over, the second lands on the helper's thumb:
//                  it flashes red, swells, the hand jerks away shaking, stars circle it.
//                Then a fresh nail pops up and the action loops.
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble } from './timeline.js';
import { createHand } from '../pieces/kit-hand.js';
import { hammer, nail, board, burst, stars } from '../pieces/kit-things.js';

const SKIN = 0xffd2b0, OUCH = 0xff4a3a;

function hammerNail(ctx, spec, stage) {
  const u = stage.u, B = stage.box, bend = spec.outcome === 'bend', group = new THREE.Group(), uh = 0.85 * u;
  const bw = 0.95, xc = B.maxX + 0.1 * u + (bw / 2) * u, yb = B.minY + 0.16 * u;     // board centre and top
  const plank = board(u, { w: bw }); plank.position.set(xc, yb, 0);
  const pin = nail(uh); const xn = xc - 0.22 * u; pin.position.set(xn, yb, 0);
  const top = () => yb + pin.len;                                                   // the nail head before it goes in
  // the hammer hand: forearm hanging down from the elbow, fist holding the handle level, head to the left, face down
  const hand = createHand({ u: uh, sleeve: 0x2f6fd0 }), tool = hammer(uh);
  tool.rotation.z = -Math.PI / 2; hand.grip.add(tool);
  hand.pose('grip');
  const reach = 0.87 * uh;                                                          // elbow to the grip
  // the helper hand: comes in from the lower left, pinching the nail
  const helper = createHand({ u: 0.78 * uh, sleeve: 0xd8a040, side: -1 });
  helper.pose('pinch');
  const spark = burst(u, { s: 0.42, color: bend ? 0xff7040 : 0xfff0a0 }), ring = stars(u, { r: 0.13, s: 0.1, color: 0xffe040 });
  group.add(plank, pin, hand.group, helper.group, spark, ring);

  // where the hammer hand's elbow goes so the striking face lands on `target` (x, y): face is 0.52 uh left, 0.165 uh below the grip
  const elbowFor = (x, y) => [x + 0.52 * uh, y + 0.165 * uh + reach];
  const thumbAt = [xn - 0.02 * u, top() - 0.13 * u];                                 // where the helper's thumb tip rests
  function placeHelper(dx, dy, lift) {                                              // pinching just under the nail head
    helper.group.position.set(xn - 0.36 * u + dx, top() - 0.62 * u + dy, 0.05 * u);
    helper.group.rotation.z = -0.62 + lift;
  }
  const loop = 4.0, HITS = bend ? [0.3, 1.45] : [0.3, 1.1, 1.9];
  function step(t) {
    const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = A.setup;
    // ---- set-up: board, nail, helper hand, then the hammer hand comes down cocked ----
    const I = timeline(s, { board: [0.05, 0.3, 'back'], nail: [0.35, 0.25, 'back'], helper: [0.5, 0.35, 'out'], hand: [0.6, 0.4, 'out'] });
    plank.scale.setScalar(Math.max(1e-3, I.board)); plank.position.x = xc + (1 - I.board) * 0.4 * u;
    // ---- action (starts and ends cocked, so it loops) ----
    const T = bend
      ? timeline(v, { dn1: [0, 0.3, 'in'], up2: [0.7, 0.4, 'out'], dn2: [1.15, 0.3, 'in'], up3: [1.45, 0.35, 'out'], gone: [2.9, 0.2], fresh: [3.15, 0.45, 'back'], back: [3.0, 0.6] })
      : timeline(v, { dn1: [0, 0.3, 'in'], up2: [0.45, 0.35, 'out'], dn2: [0.8, 0.3, 'in'], up3: [1.25, 0.35, 'out'], dn3: [1.6, 0.3, 'in'], up4: [2.05, 0.4, 'out'], twirl: [2.35, 0.8], gone: [2.9, 0.2], fresh: [3.15, 0.45, 'back'], back: [3.0, 0.6], go: [0.4, 0.4, 'out'] });
    const raise = pre ? 1 : 1 - T.dn1 + T.up2 - T.dn2 + T.up3 - (T.dn3 ?? 0) + (T.up4 ?? 0);
    const hits = pre || v >= 3.1 ? 0 : HITS.filter((h) => v >= h).length;
    const inDepth = bend ? (hits >= 1 ? 0.18 : 0) : [0, 0.22, 0.62, 0.97][hits];
    const bent = bend && hits >= 1 ? -1.25 - 0.15 * wobble(v, 0.3, 0.7, 4) : 0;   // bends away from the helper
    // nail: in by hits, bent over (bend); the old one shrinks away and a fresh one pops up before the loop
    pin.position.y = yb - inDepth * pin.len; pin.top.rotation.z = bent;
    pin.scale.setScalar(Math.max(1e-3, pre ? I.nail : v >= 3.1 ? T.fresh : 1 - T.gone));
    // hammer: the striking face comes down on the nail head (bend: the second blow on the helper's thumb)
    const head = [xn, top() - inDepth * pin.len];
    const target = bend && v >= 0.7 && v < 2.9 ? thumbAt : head;
    const [ex, ey] = elbowFor(target[0], target[1]);
    hand.group.position.set(ex + 0.04 * u * raise, ey + 0.02 * u * raise + (1 - I.hand) * 0.8 * u, 0);
    hand.group.rotation.z = Math.PI + 0.22 * raise;
    hand.bone('palm').rotation.z = 0.95 * raise;                                    // cock the wrist
    tool.rotation.z = -Math.PI / 2 - (bend ? 0 : Math.PI * 2 * T.twirl);           // clean: a baton twirl to finish
    hand.update();
    // helper hand: holds the nail; lets go after the tap (clean) or jerks away when its thumb is hit (bend); back for the loop
    const away = pre ? 1 - I.helper : Math.max(0, (bend ? T.up3 : T.go) - T.back);
    const hurt = bend && v >= 1.45 && v < 3.0 ? 1 : 0, shake = hurt ? 0.012 * u * tremble(v) : 0;
    placeHelper(-0.3 * u * away + shake, -0.25 * u * away, -0.25 * away);
    helper.rig.setColor('tb', hurt ? OUCH : SKIN); helper.rig.setColor('ta', hurt ? OUCH : SKIN);
    helper.bone('tb').scale.setScalar(1 + 0.45 * hurt * (0.85 + 0.15 * Math.sin(v * 9)));
    helper.update();
    // the sparkle on the flush nail (clean) or the ouch flash on the thumb (bend), and stars circling the hurt hand
    const fl = pre ? 0 : bend ? bump(v, 1.45, 0.45) : bump(v, 1.9, 0.8);
    spark.visible = fl > 0; spark.scale.setScalar(Math.max(1e-3, fl));
    spark.position.set(bend ? thumbAt[0] : xn, bend ? thumbAt[1] : yb + 0.02 * u, 0.08 * u); spark.rotation.z = v * 2;
    const st = bend && !pre ? Math.min(1, Math.max(0, (v - 1.6) / 0.3)) * (1 - Math.min(1, Math.max(0, (v - 2.7) / 0.3))) : 0;
    ring.visible = st > 0.01; ring.scale.setScalar(Math.max(1e-3, st));
    ring.position.set(helper.group.position.x + 0.3 * u, helper.group.position.y + 0.6 * u, 0.05 * u); ring.rotation.y = v * 4;
    hand.group.visible = I.hand > 0.01; helper.group.visible = I.helper > 0.01;
  }
  return { group, step };
}

export const SCENES = { 'hammer-nail': hammerNail };
