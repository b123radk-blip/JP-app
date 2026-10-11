// 休む (q-rest-day, outcome bed): a girl ill in bed, a thermometer in her mouth (38°); she sits up, picks her phone off
// the bed, phones in sick (やすみます…), lies back down and sleeps, Zzz. Split out of q-ride3.js.
// The bed stands on legs, with a headboard at her head (left) end; she lies on her back on the mattress, propped on the
// pillow so her head rests on it (the people have big heads: lying flat, the back of the head would sink through).
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { RIGHT, lerp, label, pop, person, speech, say, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), Q = new THREE.Quaternion(), M = new THREE.Matrix4();
const X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();

export function sickDay(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const p = person(spec.who, u, 0.85), h = p.h, x0 = B.maxX + 0.4 * u, z0 = 0.05 * u;
  // the bed (in heights h): legs, frame, mattress, headboard at the left, footboard at the right, pillow
  const L = 1.25 * h, D = 0.5 * h, top = 0.2 * h, mat = 0.07 * h, Ym = top + mat;
  const bedP = solidProp([
    ...[[0.03 * h, -1], [0.03 * h, 1], [L - 0.03 * h, -1], [L - 0.03 * h, 1]].map(([x, s]) => [G.box(0.05 * h, top, 0.05 * h, x, top / 2, s * (D / 2 - 0.03 * h)), 0x7a5232]),
    [G.box(L, 0.05 * h, D, L / 2, top - 0.025 * h, 0), 0x9a6a42],
    [G.box(L - 0.04 * h, mat, D - 0.02 * h, L / 2, top + mat / 2, 0), 0xf6f2ea],
    [G.box(0.05 * h, 0.62 * h, D + 0.04 * h, -0.02 * h, 0.31 * h, 0), 0x8a5a36], [G.box(0.06 * h, 0.08 * h, D + 0.08 * h, -0.02 * h, 0.64 * h, 0), 0x7a4a2a],
    [G.box(0.05 * h, 0.4 * h, D + 0.04 * h, L + 0.02 * h, 0.2 * h, 0), 0x8a5a36],
    [G.sphere(0.15 * h, 0.15 * h, Ym + 0.05 * h, 0, 0.85, 0.42, 1.3), 0xa8d0f4],
  ], 0.4);
  // the duvet: from the foot end leftward, scale.x = its length; a turned-down band at its top edge
  const duvet = solidProp([[G.box(1, 0.1 * h, D + 0.02 * h, -0.5, Ym + 0.05 * h, 0), 0xe06a5a], [G.box(0.08, 0.104 * h, D + 0.03 * h, -0.96, Ym + 0.052 * h, 0), 0xf6dcd4]], 0.4);
  bedP.position.set(x0, floor, z0); duvet.position.set(x0 + L - 0.02 * h, floor, z0);
  const therm = solidProp([[G.cyl(0.011 * u, 0.011 * u, 0.2 * u, 0, 0.1 * u, 0), 0xf4f8fc], [G.cyl(0.006 * u, 0.006 * u, 0.12 * u, 0, 0.07 * u, 0.008 * u), 0xe02020], [G.sphere(0.018 * u, 0, 0, 0), 0xe02020]], 0.8);
  const pw = 0.07 * u, ph = 0.14 * u, pt = 0.02 * u;
  const phone = solidProp([[G.box(pw, ph, pt, 0, 0, 0), 0x30343c], [G.box(pw * 0.8, ph * 0.75, pt * 1.1, 0, 0.005 * u, 0), 0x3a9ae8]], 0.6);
  const temp = label(u, '38°', '#e03030', 0.14), zzz = label(u, 'Zzz', '#4a5ac0', 0.13), bubble = speech(u, 'やすみます…', { h: 0.12, flip: false });
  group.add(bedP, duvet, p.group, therm, phone, temp, zzz, bubble);
  const rest = new THREE.Vector3(x0 + 0.5 * h, floor + Ym + pt / 2, z0 + D / 2 - 0.09 * h);   // the phone, lying on the bed in front of her
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [2.4, 0.6], grab: [3.0, 0.4], ear: [3.4, 0.4], down: [5.4, 0.4], lie: [5.8, 0.8] });
      const sit = pre ? 0 : T.up * (1 - T.lie);
      // on her back along the mattress, head on the pillow (head toward -x), feet at the foot end
      p.pose('Idle', 0.3);
      p.group.rotation.order = 'YXZ'; p.group.rotation.set(-Math.PI / 2, RIGHT, 0);
      p.group.position.set(x0 + L - 0.27 * h, floor + Ym + 0.06 * h, z0);
      p.turn('Abdomen', lerp(0.22, 0.95, sit)); p.turn('Torso', lerp(0.12, 0.45, sit)); p.turn('Head', lerp(0.1, 0.05, sit));
      duvet.scale.x = lerp(0.8, 0.62, sit) * h;
      // arms: on the duvet over her tummy while she lies, in her lap when she sits up
      const sc = group.getWorldScale(W2).x, s = sit;
      for (const [side, dx] of [['R', -0.07], ['L', 0.07]]) {
        const lap = group.localToWorld(W.set(x0 + lerp(0.5, 0.42, s) * h, floor + Ym + 0.12 * h, z0 - dx * h * 1.5)).clone();
        p.handTo(side, lap, 1, { out: 0.5, down: 0.4 });
      }
      // the thermometer sticks out of her mouth, up and out
      const th = pre || v < 2.4 || v > 6.6;
      therm.visible = th; p.at('mouth', W, 0, -0.01, 0.04); therm.position.copy(group.worldToLocal(W)); therm.rotation.set(0, 0, -0.9);
      pop(temp, th && !(v > 6.6) ? 1 : 0, x0 + 0.42 * h, floor + 0.7 * h + 0.01 * u * Math.sin(v * 2), z0);
      // the phone: she reaches for it on the bed (palm on it from above), lifts it to her right ear (palm against its back)
      const reach = pre ? 0 : Math.max(bump(v, 2.8, 0.6), T.grab * (1 - T.down)), lift = pre ? 0 : T.ear * (1 - T.down);
      const ear = p.at('earR', new THREE.Vector3(), -0.04, -0.01, 0.07), restW = group.localToWorld(W2.copy(rest)).clone();
      const at = restW.clone().lerp(ear, lift), side = axisOf(p, 1, 0, 0), toward = new THREE.Vector3(0, -1, 0).lerp(side, lift).normalize();
      const r = pt / 2 * sc;
      if (reach > 0) { p.grip('R', at, toward, r, reach, { out: lerp(0.6, 0.3, lift), down: lerp(0.5, 1.4, lift) }); }
      const held = T.grab * (1 - T.down) > 0.5 && !pre;
      if (held) p.hold(phone, 'R', group, r); else phone.position.copy(rest);
      // the phone's face points away from the palm; its long side runs along her head when at her ear, along the bed at rest
      group.getWorldQuaternion(Q).invert();
      Z.copy(held ? toward : W.set(0, -1, 0)).applyQuaternion(Q).negate().normalize();
      Y.copy(held ? axisOf(p, 0, 1, 0, W) : W.set(-1, 0, 0)).applyQuaternion(held ? Q : Q.identity()); Y.addScaledVector(Z, -Y.dot(Z)).normalize();
      X.crossVectors(Y, Z); phone.quaternion.setFromRotationMatrix(M.makeBasis(X, Y, Z));
      say(bubble, pre ? 0 : between(v, 3.8, 4.1) * (1 - between(v, 5.3, 5.5)), x0 + 0.95 * h, floor + 1.05 * h, z0);
      pop(zzz, pre ? 0 : between(v, 6.6, 6.8) * (1 - between(v, 7.8, 8.0)), x0 + 0.62 * h, floor + 0.66 * h + 0.05 * u * Math.sin(v * 2), z0);
    },
  };
}
