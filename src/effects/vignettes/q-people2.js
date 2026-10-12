// Model scenes, more people (flag-fix round 4):
//   q-buddies  友達: two friends walk toward you side by side, arm over each other's shoulders, laughing; they stop, step
//              apart and play catch with a ball (laughing), then walk off together arm in arm
//   q-child    子供: a small girl (a Kenney mini character, half the height of the grown-up beside him) holds the grown-up's hand,
//              then bounces a ball while the grown-up claps, then takes the hand again: the size contrast says "child"
//   q-exist    在る: sparkles gather, a woman materialises out of light, looks at her hands and body, jumps with a "!?", then
//              pats herself: I exist!
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { many, HEART, ball } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { RIGHT, LEFT, lerp, label, pop, hearts, person, TEEN, ADULT, turnTo, axisOf, speech } from './q-common.js';

const W = new THREE.Vector3(), F = [new THREE.Vector3(), new THREE.Vector3()], H = new THREE.Vector3(), BP = new THREE.Vector3();
const near = (d, u) => 1 - between(d, 0.07 * u, 0.3 * u);

// ---- 友達 ----
function buddies(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.52 * u, r = 0.045 * u;
  const a = person(spec.who, u, TEEN), b = person(spec.other, u, TEEN), toy = ball(u, { r: 0.045, color: 0xe8503a, stripe: 0xffffff });
  const ha = label(u, 'あはは!', '#f08a3a', 0.12), love = many(HEART(u, 0.09), 3, 1);
  group.add(a.group, b.group, toy, ha, love);
  const loop = 13.0, YI = [RIGHT - 0.8, LEFT + 0.8], P = [a, b];
  const yaw = (i, T, pre) => {
    const I = YI[i];
    if (pre) return Math.PI;
    if (T.back > 0) return turnTo(I, Math.PI, T.back);
    if (T.face > 0) return turnTo(0, I, T.face);
    return turnTo(Math.PI, 0, T.t1);
  };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { t1: [0, 0.4], walk: [0.4, 3.0, 'linear'], rel: [3.5, 0.4], face: [3.7, 0.5], apart: [4.2, 0.8], lift: [4.8, 0.4], lower: [10.0, 0.4],
        tog: [10.4, 0.6], up2: [10.8, 0.4], back: [11.0, 0.5], out: [11.5, 1.5, 'linear'] });
      const walkIn = !pre && T.walk > 0 && T.walk < 1, walkOut = !pre && T.out > 0 && T.out < 1;
      const stepApart = !pre && T.apart > 0 && T.apart < 1, stepTog = !pre && T.tog > 0 && T.tog < 1;
      const spread = pre ? 0 : T.apart - T.tog, zz = (pre ? -0.7 : lerp(-0.7, 0.2, T.walk) + (T.out > 0 ? lerp(0, -0.9, T.out) : 0)) * u;
      const arm = pre ? 1 : (1 - T.rel) + T.up2 * (T.rel > 0 ? 1 : 0), laugh = pre ? 0 : between(v, 1.8, 2.2) * (1 - between(v, 3.4, 3.7));
      P.forEach((p, i) => {
        const s = i ? 1 : -1, moving = walkIn || walkOut || stepApart || stepTog;
        p.pose(moving ? 'Walk' : 'Idle', moving ? (stepApart ? -v : v) + 0.45 * i : t + i);
        p.group.position.set(cx + s * (0.15 + 0.2 * spread) * u, floor, zz);
        p.group.rotation.y = yaw(i, T, pre);
        // laughing: shoulders and head bob
        const lf = Math.max(laugh, (pre ? 0 : between(v, 5.0, 5.4) * (1 - between(v, 10.0, 10.4))) * 0.5);
        p.turn('Head', 0.1 * lf * Math.sin(v * 15 + i), 0, 0.1 * lf * Math.sin(v * 9 + i));
      });
      // arm over the other's near shoulder, the other's hand round the waist: each uses the arm toward the partner
      a.handTo('L', b.local(-0.16, 0.7, -0.04, W), arm, { out: 0.5, down: 0.7 });
      b.handTo('R', a.local(0.18, 0.5, -0.04, W), arm, { out: 0.5, down: 0.6 });
      // the ball: carried at her hip, then tossed to and fro between their hands (4 throws), then carried again
      a.local(0, 0.6, 0.33, F[0]); b.local(0, 0.6, 0.33, F[1]); a.local(-0.17, 0.4, 0.1, H);
      const lift = pre ? 0 : T.lift * (1 - T.lower), play = !pre && v >= 5.4 && v < 10.0;
      if (play) {
        const n = Math.min(3, Math.floor((v - 5.4) / 1.2)), f = between(v, 5.4 + 1.2 * n, 6.4 + 1.2 * n), from = n % 2;
        if (f < 1) { BP.copy(F[from]).lerp(F[1 - from], f); BP.y += 0.14 * u * Math.sin(Math.PI * f); } else BP.copy(F[1 - from]);
      } else BP.copy(H).lerp(F[0], lift);
      toy.position.copy(group.worldToLocal(W.copy(BP)));
      P.forEach((p, i) => {
        const nb = near(BP.distanceTo(F[i]), u), carry = !play && (pre || v < 5.4 || v >= 10.0);
        const kR = i === 0 ? (carry ? 1 : nb) : play ? nb : 0, kL = i === 0 ? (v < 4.8 || v >= 10.4 ? 0 : carry ? lift : nb) : kR;
        p.grip('R', BP, axisOf(p, 1, 0, 0, W).normalize(), r, kR, { out: 0.5, down: 0.4 });
        p.grip('L', BP, axisOf(p, -1, 0, 0, W).normalize(), r, kL, { out: 0.5, down: 0.4 });
      });
      pop(ha, laugh, cx, floor + 1.0 * u, zz + 0.05 * u);
      hearts(love, 3, cx, floor + 0.95 * u, zz, pre ? -1 : v, 9.2, u);
    },
  };
}

// ---- 子供 ----
const Q = [new THREE.Quaternion(), new THREE.Quaternion(), new THREE.Quaternion()], V = [new THREE.Vector3(), new THREE.Vector3()];
// swing a Kenney mini-character's arm (a bone, hanging straight down at rest) to point along world direction `dir`
function aimArm(bone, dir) {
  bone.parent.updateWorldMatrix(true, false); bone.updateWorldMatrix(false, false);
  bone.quaternion.identity(); bone.updateWorldMatrix(false, false);
  bone.getWorldQuaternion(Q[0]); bone.parent.getWorldQuaternion(Q[1]);
  Q[2].setFromUnitVectors(V[0].set(0, -1, 0).applyQuaternion(Q[0]), V[1].copy(dir).normalize());
  bone.quaternion.copy(Q[1].invert().multiply(Q[2]).multiply(Q[0])); bone.updateMatrixWorld(true);
}
function child(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, hc = 0.5 * u, r = 0.05 * u;
  const dad = person(spec.who, u, ADULT), kid = createModel(spec.kid, { height: hc }), toy = ball(u, { r: 0.05, color: 0x3a8ae0, stripe: 0xffffff });
  const wee = label(u, 'わーい!', '#e05a8a', 0.12);
  group.add(dad.group, kid.group, toy, wee);
  const loop = 7.2, S = new THREE.Vector3(), T3 = new THREE.Vector3(), ARM = 0.3 * hc;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { rel: [2.6, 0.4], pick: [3.0, 0.3, 'back'], gone: [6.3, 0.3], grab: [6.6, 0.5] });
      const hold = pre ? 1 : (1 - T.rel) + T.grab, play = pre ? 0 : T.pick * (1 - T.gone);
      const hop = hold > 0.5 ? 0.012 * u * Math.abs(Math.sin((pre ? t : v) * 5)) : 0.02 * u * Math.abs(Math.sin(v * 5.2));
      dad.pose('Idle', t); dad.group.position.set(x0, floor, 0); dad.group.rotation.y = -0.2;
      kid.pose('idle', t * 1.3); kid.group.position.set(x0 + 0.5 * u, floor + hop, 0.03 * u); kid.group.rotation.y = 0.15;
      kid.group.updateWorldMatrix(true, true);
      // the ball bounces beside him on his far side, his hand following it down and up
      const ph = ((v - 3.0) / 0.62) % 1, by = floor + r + 0.2 * u * Math.abs(Math.sin(Math.PI * ph));
      const ballX = x0 + 0.5 * u + 0.2 * u, bz = 0.09 * u;
      pop(toy, play, ballX, by, bz);
      const sh = kid.node('arm-left').getWorldPosition(S);
      T3.set(ballX, by + r, bz); group.localToWorld(T3);
      aimArm(kid.node('arm-left'), V[1].copy(T3).sub(sh).lerp(V[0].set(0.15, -1, 0.05), 1 - play));
      // the near arm (toward him) goes up to his hand while they hold hands, and hangs down otherwise
      const sr = kid.node('arm-right').getWorldPosition(S);
      const up = V[0].set(-0.85, 0.7, 0.2).normalize(), down = V[1].set(-0.1, -1, 0);
      const armDir = V[0].copy(down).lerp(up, hold).normalize();
      aimArm(kid.node('arm-right'), armDir);
      T3.copy(sr).addScaledVector(armDir, ARM);
      dad.handTo('L', T3, hold, { out: 0.3, down: 1 });
      // he looks down at the little one; claps while the ball bounces
      dad.turn('Head', 0.3, 0.35);
      const clap = play * 0.9 * (0.5 + 0.5 * Math.sin(v * 12));
      dad.handTo('R', dad.local(-0.04 - 0.1 * (1 - clap), 0.5, 0.3, S), play * (1 - T.gone) * 0.95, { out: 0.5, down: 0.5 });
      dad.handTo('L', dad.local(0.04 + 0.1 * (1 - clap), 0.5, 0.3, S), play * 0.95, { out: 0.5, down: 0.5 });
      pop(wee, pre ? 0 : between(v, 3.3, 3.6) * (1 - between(v, 6.0, 6.3)), x0 + 0.5 * u, floor + 0.75 * u, 0.15 * u);
    },
  };
}

// ---- 在る ----
const SPARK = (u, s) => { const sh = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, d = i % 2 ? 0.2 : 0.5; sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * d * s * u, Math.sin(a) * d * s * u); } return [[new THREE.ExtrudeGeometry(sh, { depth: 0.01 * u, bevelEnabled: false }), 0xfff6b0]]; };
function exist(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u, 0.75), sparks = many(SPARK(u, 0.16), 14, 1), say = speech(u, '!?', { h: 0.16, color: '#ffffff', bg: '#e8503a' });
  const beam = solidProp([[G.cyl(0.2 * u, 0.2 * u, 1.3 * u, 0, 0.65 * u, 0, 0, 0, 0, 24), 0xfffbe0]], 1.0), love = many(HEART(u, 0.08), 2, 1);
  beam.material.transparent = true; beam.material.depthWrite = false;
  for (const m of p.materials) m.transparent = true;
  group.add(p.group, sparks, beam, say, love);
  const loop = 7.6, C = new THREE.Vector3(x0, floor + 0.5 * u, 0);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { mat: [0.9, 1.0], hands: [2.0, 0.4], body: [3.4, 0.4], surprise: [4.2, 0.2], pat: [5.3, 0.3], dis: [6.9, 0.6] });
      // sparkles gather into the spot and rise, then thin out
      const gather = pre ? 0.25 : between(v, 0, 0.5) * (1 - between(v, 1.8, 2.6)) + 0.25 * (1 - between(v, 0, 0.5)) * (v < 0 ? 1 : 0) + 0.25 * T.dis;
      for (let i = 0; i < 14; i++) {
        const f = (((pre ? t : v) * 0.7 + i / 14) % 1 + 1) % 1, a = i * 2.4 + f * 4, rad = 0.38 * u * (1 - f * 0.8);
        sparks.set(i, x0 + Math.cos(a) * rad, floor + (0.15 + 0.9 * f) * u, Math.sin(a) * rad * 0.6, gather * Math.sin(Math.PI * f) * 1.6, 0, a);
      }
      sparks.commit();
      const vis = pre ? 0 : T.mat * (1 - T.dis), flash = pre ? 0 : between(v, 0.7, 1.4) * (1 - between(v, 1.4, 2.2)) + between(v, 6.9, 7.2) * (1 - between(v, 7.2, 7.8));
      beam.visible = flash > 0.01; beam.material.opacity = 0.5 * flash; beam.position.set(x0, floor, 0); beam.scale.set(1 - 0.3 * flash, 1, 1 - 0.3 * flash);
      p.group.visible = vis > 0.01; p.group.scale.setScalar(0.6 + 0.4 * vis);
      for (const m of p.materials) { m.opacity = vis; m.transparent = vis < 0.99; m.depthWrite = vis > 0.6; }
      // the person: looks at her hands, then her body, jumps with a "!?", pats herself
      const jump = !pre && v >= 4.2 && v < 5.3;
      p.pose(jump ? 'Jump' : 'Idle', jump ? v - 4.2 : t, false);
      p.group.position.set(x0, floor, 0); p.group.rotation.y = -0.1;
      const hands = pre ? 0 : T.hands * (1 - T.body), body = pre ? 0 : T.body * (1 - T.surprise), wig = Math.sin(v * 9) * 0.03;
      p.turn('Head', 0.6 * (hands + body) * (1 - (jump ? 1 : 0)));
      p.handTo('R', p.local(-0.1, 0.52 + wig, 0.2, V[0]), hands, { out: 0.3, down: 1 });
      p.handTo('L', p.local(0.1, 0.52 - wig, 0.2, V[0]), hands, { out: 0.3, down: 1 });
      p.handTo('R', p.local(-0.08, 0.55, 0.2, V[0]), body, { out: 0.5, down: 0.5 });
      p.handTo('L', p.local(0.08, 0.4, 0.2, V[0]), body, { out: 0.5, down: 0.5 });
      const up = jump ? between(v, 4.2, 4.5) * (1 - between(v, 5.0, 5.3)) : 0;
      p.handTo('R', p.local(-0.3, 1.0, 0.1, V[0]), up, { out: 0.9, down: 0.2 });
      p.handTo('L', p.local(0.3, 1.0, 0.1, V[0]), up, { out: 0.9, down: 0.2 });
      const pats = pre ? 0 : T.pat * (1 - between(v, 6.7, 7.0)), pt = Math.abs(Math.sin(v * 7));
      p.handTo('R', p.local(-0.1, 0.56, 0.17 + 0.08 * (1 - pt), V[0]), pats, { out: 0.5, down: 0.5 });
      p.handTo('L', p.local(0.14, 0.4, 0.14 + 0.08 * pt, V[0]), pats, { out: 0.5, down: 0.5 });
      p.turn('Head', 0.1 * pats * pt);
      pop(say, pre ? 0 : between(v, 4.3, 4.6) * (1 - between(v, 5.5, 5.8)), x0 + 0.27 * u, floor + 0.78 * u, 0.1 * u);
      hearts(love, 2, x0, floor + 0.95 * u, 0.05 * u, pre ? -1 : v, 5.9, u);
    },
  };
}

export const SCENES = { 'q-buddies': buddies, 'q-child': child, 'q-exist': exist };
