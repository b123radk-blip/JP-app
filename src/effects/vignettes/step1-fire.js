// Step 1 scene 火 (split out of step1-b.js):
//   fire-catch  火: a camper stands by a ring of stones round a pile of logs, a matchbox in his right hand and a match in
//               his left; he strikes the match along the box (it lights), tosses it onto the logs; flames catch, grow
//               and roar, sparks fly; he pockets the box and warms both hands at the fire, palms to it; it dies down to
//               glowing embers. outcome week: 火曜日 (the same, smaller, with the weekday strip)
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow, withWeek } from './step1-kit.js';
import { LEFT, person, axisOf } from './q-common.js';

const FLAME = (u) => [[G.cone(0.07 * u, 0.24 * u, 0, 0.12 * u, 0), 0xff7a1a], [G.cone(0.04 * u, 0.15 * u, 0, 0.075 * u, 0.02 * u), 0xffe040]];
const W = new THREE.Vector3(), Q = new THREE.Quaternion(), M = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();
// turn a prop of `space` so its own y runs along world direction y and its z along (world) z, made square to y
function orient(prop, space, y, z) {
  space.getWorldQuaternion(Q).invert();
  Y.copy(y).applyQuaternion(Q).normalize(); Z.copy(z).applyQuaternion(Q); Z.addScaledVector(Y, -Z.dot(Y)).normalize();
  X.crossVectors(Y, Z); prop.quaternion.setFromRotationMatrix(M.makeBasis(X, Y, Z));
}

export function fireCatch(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(fireCatch, 1, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, fx = B.maxX + 0.45 * u;
  const logs = solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.5 * u, 0, 0.05 * u, 0.06 * u, 0, 0.3, Math.PI / 2 - 0.25), 0x7a4a24], [G.cyl(0.05 * u, 0.05 * u, 0.5 * u, 0, 0.05 * u, -0.06 * u, 0, -0.3, Math.PI / 2 + 0.25), 0x8a5428], [G.cyl(0.045 * u, 0.045 * u, 0.42 * u, 0, 0.12 * u, 0, 0, 0, Math.PI / 2), 0x6a3e1e]], 0.3);
  const stones = solidProp([...Array(10)].map((_, i) => { const a = i * Math.PI / 5 + 0.2; return [G.sphere(0.055 * u, 0.3 * u * Math.cos(a), 0.025 * u, 0.2 * u * Math.sin(a), 1.2, 0.6, 1), i % 2 ? 0x8a8a92 : 0x6e6e78]; }), 0.3);
  // the matchbox, lying on the palm of his right hand: the striking strip (brown) on top; 0.045u thick
  const bt = 0.045 * u, box = solidProp([[G.box(0.17 * u, bt, 0.11 * u, 0, 0, 0), 0xd83030], [G.box(0.15 * u, 0.006 * u, 0.06 * u, 0, bt / 2, 0), 0x4a2a1a]], 0.4);
  const ml = 0.2 * u, match = solidProp([[G.cyl(0.01 * u, 0.01 * u, ml, 0, ml / 2, 0), 0xf0d8a0], [G.sphere(0.022 * u, 0, ml, 0, 1, 1.3, 1), 0xd02020]], 0.5);
  const tip = solidProp([[G.cone(0.025 * u, 0.08 * u, 0, 0.04 * u, 0), 0xffb030]], 1.3);
  const flames = many(FLAME(u), 7, 1.3), sparks = many([[G.sphere(0.012 * u), 0xffd060]], 10, 1.6), glow = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 0.6, 1), 0xff4010]], 4, 1.4);
  const p = person(spec.who ?? 'guy', u, 0.8);
  logs.position.set(fx, floor, 0); stones.position.set(fx, floor, 0);
  group.add(logs, stones, p.group, box, match, tip, flames, sparks, glow);
  const loop = 7.6, F = [[0, 0, 1.0], [-0.1, 0.03, 0.95], [0.1, 0.02, 1.0], [-0.05, 0.05, 0.7], [0.06, 0.05, 0.75], [-0.16, 0, 0.55], [0.15, 0, 0.6]];
  const land = new THREE.Vector3(fx, floor + 0.15 * u, 0.02 * u), fire = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0.2 : A.v;
      const T = timeline(v, { strike: [0.5, 0.35, 'in'], swing: [0.95, 0.35], fly: [1.3, 0.5, 'linear'], catch: [1.7, 1.4, 'out'], pocket: [1.9, 0.4], warm: [2.6, 0.7], unwarm: [5.4, 0.6], die: [5.6, 1.4], back: [7.0, 0.4] });
      // he stands right of the fire, turned to it and a little to you
      p.pose('Idle', t); p.group.position.set(fx + 0.46 * u, floor, 0.06 * u); p.group.rotation.y = LEFT + 0.55;
      const sc = group.getWorldScale(W).x, inward = axisOf(p, 1, 0, 0), fwd = axisOf(p, 0, 0, 1), up = axisOf(p, 0, 1, 0);
      // right hand (the far one): the box on its upturned palm, in front of his tummy (gone into his pocket while he warms his hands)
      const boxOn = pre ? 1 : (1 - T.pocket) + T.back, bc = p.local(-0.03, 0.38, 0.24);
      p.grip('R', bc, W.copy(up).negate(), bt / 2 * sc, Math.min(1, boxOn * 1.5));
      p.hold(box, 'R', group, bt / 2 * sc); orient(box, group, up, inward);
      box.visible = boxOn > 0.02; box.scale.setScalar(grow(Math.min(1, boxOn * 1.5)));
      // left hand (toward you): the match, held head down, runs along the strip on top of the box toward the fire (strike);
      // then the hand swings out over the fire
      const S = group.localToWorld(W.copy(box.position)).addScaledVector(up, (bt / 2 + 0.012 * u) * sc).addScaledVector(fwd, (-0.06 + 0.13 * T.strike) * u * sc).clone();
      const strikeAt = S.clone().addScaledVector(up, ml * 0.95 * sc).addScaledVector(fwd, -0.04 * u * sc).addScaledVector(inward, 0.03 * u * sc);
      const tossAt = p.local(0.05, 0.5, 0.5), warm = T.warm * (1 - T.unwarm);
      p.handTo('L', strikeAt.lerp(tossAt, T.swing), Math.max(0, 1 - T.pocket * 1.2 + T.back) , { out: 0.6, down: 0.6 });
      // both hands held out to the fire, palms to it
      fire.set(fx, floor + 0.3 * u, 0); group.localToWorld(fire);
      for (const [side, x] of [['R', -0.09], ['L', 0.09]]) { p.handTo(side, p.local(x, 0.4, 0.4), warm, { out: 0.5, down: 0.7 }); p.twist(side, W.copy(fire).sub(p.fist(side, X)).normalize(), warm); }
      const base = p.fistMid('L', new THREE.Vector3()), held = pre || v < 1.3 || v > 7.1;
      if (held) {
        match.position.copy(group.worldToLocal(base.clone()));
        orient(match, group, S.clone().sub(base).normalize().lerp(fwd, T.swing), inward);
        match.scale.setScalar(v > 7.1 ? grow(between(v, 7.1, 7.4)) : 1);
      } else {
        // tossed: it tumbles in an arc from his hand onto the logs
        const f = T.fly, from = group.worldToLocal(tossAt.clone());
        match.position.lerpVectors(from, land, f); match.position.y += 0.18 * u * 4 * f * (1 - f);
        match.quaternion.setFromAxisAngle(Z.set(0, 0, 1), 1.2 + 4.5 * f); match.scale.setScalar(1);
      }
      match.visible = held || T.catch < 0.5;
      const lit = !pre && v > 0.75 && match.visible;
      tip.visible = lit; match.updateMatrix(); tip.position.set(0, ml, 0).applyMatrix4(match.matrix); tip.scale.setScalar(0.8 + 0.3 * Math.sin(t * 20));
      const size = pre ? 0 : 1.25 * T.catch * (1 - 0.8 * T.die);
      F.forEach(([x, z, s], i) => { const fl = 1 + 0.18 * Math.sin(t * (9 + i) + i * 2) + 0.1 * Math.sin(t * 17 + i); flames.set(i, fx + x * u, floor + 0.13 * u, z * u + 0.02 * u, size * s * fl * (i < 3 ? 1.4 : between(T.catch, 0.3, 1) * 1.2), 0.1 * Math.sin(t * 7 + i)); });
      flames.commit();
      for (let i = 0; i < 10; i++) { const f = ((t * 0.7 + i * 0.137) % 1); sparks.set(i, fx + 0.2 * u * Math.sin(i * 2.4 + f * 3), floor + 0.3 * u + 0.8 * u * f, 0.03 * u, size > 0.6 ? (1 - f) * 1.3 : 0); }
      sparks.commit();
      for (let i = 0; i < 4; i++) glow.set(i, fx + (i - 1.5) * 0.08 * u, floor + 0.06 * u, 0.09 * u, pre ? 0 : (T.catch > 0.2 ? 1 : 0) * (0.8 + 0.3 * Math.sin(t * 5 + i)));
      glow.commit();
    },
  };
}

export const SCENES = { 'fire-catch': fireCatch };
