// Model scenes with gestures (Step 3a, the gesture test): Quaternius people doing what their clips cannot, through the
// gesture kit (model-kit.js).
//   q-eat        食べる: a person holds a rice bowl and eats with chopsticks, bite after bite, chewing (もぐもぐ), until
//                the bowl is empty; a happy nod and hearts; the bowl fills again
//   q-drink      飲む: a person raises a glass of milk, tips it back and gulps (ごくごく) as the milk goes down, lowers it:
//                ぷはー; the glass fills again
//   q-meet       会う: one person walks in from the right, the other up out of the distance; they see each other (!), wave,
//                bow to each other (お辞儀) saying こんにちは, and walk back the way they came
//   q-gesture    review (not for cards): one gesture of the kit (g) on one person
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { many, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2;
const lerp = (a, b, f) => a + (b - a) * f;
const label = (u, text, bg, h = 0.16) => textPlane(text, { h: h * u, color: '#ffffff', bg, pad: 0.25 });
const pop = (m, k, x, y, z) => { m.visible = k > 0.01; m.scale.setScalar(grow(k)); m.position.set(x, y, z); };
const W = new THREE.Vector3(), W2 = new THREE.Vector3();

// ---- 食べる ----
function eat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.62 * u;
  const who = actor(spec.who, 0.9 * u);
  const bowl = solidProp([[G.cyl(0.085 * u, 0.05 * u, 0.07 * u, 0, 0, 0), 0xc83a2a], [G.cyl(0.08 * u, 0.08 * u, 0.006 * u, 0, 0.033 * u, 0), 0x2a1410], [G.cyl(0.035 * u, 0.04 * u, 0.012 * u, 0, -0.04 * u, 0), 0x8a2018]], 0.4);
  const rice = solidProp([[G.sphere(0.075 * u, 0, 0, 0, 1, 0.55, 1), 0xfffaf0]], 0.6);
  const sticks = solidProp([[G.cyl(0.009 * u, 0.006 * u, 0.22 * u, -0.012 * u, 0, 0.09 * u, Math.PI / 2), 0xf0c878], [G.cyl(0.009 * u, 0.006 * u, 0.22 * u, 0.012 * u, 0, 0.09 * u, Math.PI / 2), 0xf0c878]], 0.4);
  const bite = solidProp([[G.sphere(0.028 * u, 0, 0, 0, 1, 0.8, 1), 0xffffff]], 0.7);
  const chew = label(u, 'もぐもぐ', '#c06a2a', 0.13), hearts = many(HEART(u, 0.1), 3, 1);
  bowl.add(rice); rice.position.y = 0.03 * u;
  group.add(who.group, bowl, sticks, bite, chew, hearts);
  const loop = 7.4, bites = [0.3, 1.9, 3.5];               // each bite: down to the bowl, up to the mouth, chew
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      who.pose('Idle', t);
      who.group.position.set(x0, floor, 0.05 * u); who.group.rotation.y = -0.35;
      // the bowl in the left hand, at the chest
      const hold = pre ? A.setup : 1;
      who.handTo('L', who.local(0.1, 0.4, 0.27, W), hold);
      who.carry(bowl, 'L', group, [-0.02, 0.05, 0.02]);
      bowl.rotation.y = -0.35;
      // the right hand: bowl -> mouth for each bite (a 1.4 s beat), then the happy nod
      let up = 0, at = -1;
      for (const b of bites) if (v >= b && v < b + 1.5) { at = v - b; up = between(at, 0.35, 0.75) * (1 - between(at, 1.15, 1.45)); }
      const dip = at >= 0 ? bump(at, 0, 0.4) : 0;
      const bowlTop = new THREE.Vector3(); bowl.getWorldPosition(bowlTop).add(W2.set(0, 0.04 * u * (1 - dip), 0));
      const mouth = who.at('mouth', new THREE.Vector3(), 0, -0.01, 0.04);
      const tip = bowlTop.lerp(mouth, up);
      // the chopsticks: from the hand to the tip, pointing into the bowl (left, down, forward), then up into the mouth
      const len = 0.17 * u * group.getWorldScale(W).y, dir = who.local(lerp(0.85, 0.55, up), lerp(-0.4, 0.15, up), lerp(0.25, -0.5, up), W2).sub(who.local(0, 0, 0, W)).normalize();
      who.handTo('R', tip.clone().addScaledVector(dir, -len), pre ? 0.4 * A.setup : 1);
      if (up > 0.2) who.turn('Head', 0.12 * up);
      who.carry(sticks, 'R', group, [0, 0, 0]);
      const fistW = who.fist('R', new THREE.Vector3());
      sticks.lookAt(fistW.addScaledVector(dir, len));
      bite.visible = !pre && at >= 0.25 && at < 0.82; bite.position.copy(group.worldToLocal(tip.clone()));
      // the rice goes down a third each bite; it fills again at the end of the loop
      const eaten = pre ? 0 : bites.filter((b) => v > b + 0.8).length / 3, refill = pre ? 0 : between(v, 6.6, 7.2);
      const r = Math.max(0.05, (1 - eaten) + eaten * refill); rice.scale.set(r, r, r); rice.position.y = 0.03 * u - 0.02 * u * (1 - r);
      const chewing = !pre && at >= 0.8 && at < 1.5;
      who.turn('Head', 0, 0, chewing ? 0.05 * Math.sin(v * 18) : 0);
      pop(chew, chewing ? 1 : 0, x0 - 0.05 * u, floor + 1.05 * u, 0.2 * u);
      // done: a happy nod and hearts
      const happy = pre ? 0 : between(v, 5.0, 5.3) * (1 - between(v, 6.4, 6.7));
      who.nod(happy, v);
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 5.1 + i * 0.3, 6.2 + i * 0.3); hearts.set(i, x0 - 0.15 * u + 0.15 * u * i, floor + 0.95 * u + 0.35 * u * f, 0.15 * u, f > 0 && f < 1 ? 1.3 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

// ---- 飲む ----
function drink(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.6 * u;
  const who = actor(spec.who, 0.9 * u);
  const glass = solidProp([[G.cyl(0.06 * u, 0.05 * u, 0.2 * u, 0, 0.1 * u, 0), 0xcfe8ff]], 0.25);
  glass.material.transparent = true; glass.material.opacity = 0.45; glass.material.depthWrite = false;
  const milk = solidProp([[G.cyl(0.052 * u, 0.045 * u, 0.17 * u, 0, 0.085 * u, 0), 0xffffff]], 0.7);
  const gulp = label(u, 'ごくごく', '#3a7ac0', 0.13), ahh = label(u, 'ぷはー', '#c0603a', 0.15);
  glass.add(milk); milk.position.y = 0.012 * u;
  group.add(who.group, glass, gulp, ahh);
  const loop = 6.6, yaw = -0.35;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0.3, 0.8], tip: [1.0, 0.6], down: [3.2, 0.6], lower: [3.5, 0.8], fill: [5.6, 0.8] });
      who.pose('Idle', t);
      who.group.position.set(x0, floor, 0.05 * u); who.group.rotation.y = yaw;
      // the glass in the right hand: at the chest, then up at the mouth, tipped back with the head
      const sip = T.lift * (1 - T.lower), tip = T.tip * (1 - T.down);
      const chest = who.local(-0.06, 0.42, 0.26, new THREE.Vector3()), mouth = who.at('mouth', new THREE.Vector3(), -0.01, -0.06, 0.1);
      who.handTo('R', chest.lerp(mouth, sip), pre ? A.setup : 1);
      who.turn('Head', -0.35 * tip);
      who.carry(glass, 'R', group, [0, -0.02, 0.02]);
      glass.rotation.set(-1.5 * tip, yaw, 0, 'YXZ');
      // the milk goes down while tipped, fills again at the end
      const left = pre ? 1 : Math.max(0.04, 1 - between(v, 1.4, 3.2) * 0.96 + T.fill * 0.96);
      milk.scale.set(1, left, 1); milk.position.y = 0.012 * u;
      const swallow = !pre && v > 1.4 && v < 3.2;
      who.turn('Neck', swallow ? 0.03 * Math.sin(v * 12) : 0);
      pop(gulp, swallow ? 1 : 0, x0 - 0.1 * u, floor + 1.08 * u + 0.02 * u * Math.sin(v * 10), 0.2 * u);
      // ぷはー: the head comes forward, a happy breath
      const aah = pre ? 0 : between(v, 3.6, 3.9) * (1 - between(v, 5.2, 5.5));
      who.turn('Head', 0.12 * aah * bump(v, 3.6, 1.2));
      pop(ahh, aah, x0 - 0.05 * u, floor + 1.08 * u, 0.2 * u);
    },
  };
}

// ---- 会う ----
function meet(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mid = B.maxX + 0.68 * u, gap = 0.38 * u;
  const a = actor(spec.who, 0.88 * u), b = actor(spec.other, 0.86 * u);
  const bangA = label(u, '!', '#e0a020', 0.2), bangB = label(u, '!', '#e0a020', 0.2), hello = label(u, 'こんにちは', '#3a8a5a', 0.12);
  group.add(a.group, b.group, bangA, bangB, hello);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.8, 'out'], wave: [2.0, 1.2, 'linear'], bow: [3.4, 0.7], up: [4.6, 0.6], turn: [5.4, 0.4], go: [5.7, 1.8, 'in'] });
      const walking = !pre && ((T.come > 0 && T.come < 1) || (T.go > 0 && T.go < 1));
      for (const [p, s] of [[a, 1], [b, -1]]) {                     // a comes from the right (s = 1), b from behind the kanji
        p.pose(walking ? 'Walk' : 'Idle', walking ? v : t + s);
        const off = pre ? 1 : (1 - T.come) + T.go;
        if (s > 0) p.group.position.set(mid + gap + off * 0.65 * u, floor, 0.1 * u);
        else p.group.position.set(mid - gap - 0.1 * off * u, floor, -0.05 * u - 1.1 * off * u);    // b comes up out of the distance
        const facing = s > 0 ? LEFT + 0.6 : RIGHT - 0.6, away = s > 0 ? RIGHT - 0.5 : LEFT - 0.5;
        const walkIn = s > 0 ? LEFT + 0.5 : 0.1;                       // b walks toward you, then turns to a
        p.group.rotation.y = pre ? 0 : T.turn > 0 ? lerp(facing, s > 0 ? away : Math.PI - 0.1, T.turn) : lerp(walkIn, facing, between(v, 1.5, 1.9));
        const w = pre ? 0 : between(v, 2.0, 2.25) * (1 - between(v, 3.0, 3.3));
        p.wave(s > 0 ? 'R' : 'L', w, v + (s > 0 ? 0 : 0.3));
        p.bow(0.85 * T.bow * (1 - T.up));
      }
      pop(bangA, pre ? 0 : bump(v, 1.7, 0.6) * 1.2, mid + gap, floor + 1.05 * u, 0.15 * u);
      pop(bangB, pre ? 0 : bump(v, 1.8, 0.6) * 1.2, mid - gap, floor + 1.05 * u, 0.0);
      pop(hello, pre ? 0 : between(v, 3.4, 3.7) * (1 - between(v, 4.8, 5.0)), mid, floor + 1.18 * u, 0.2 * u);
    },
  };
}

// ---- review: one gesture of the kit (spec.g) on one person, beside the kanji ----
function sheet(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), p = actor(spec.who, 0.9 * u);
  group.add(p.group);
  return {
    group,
    step(t) {
      const g = spec.g, k = spec.k;
      p.pose(spec.clip, t);
      p.group.position.set(B.maxX + 0.6 * u, B.minY, 0.05 * u); p.group.rotation.y = spec.yaw;
      if (g === 'point') p.point('R', p.local(-1, 0.6, 0.5, W), k);
      else if (g === 'write') p.write('R', p.local(0, 0.3, 0.3, W), k, t);
      else if (g === 'hold' || g === 'bow') p[g](k);
      else if (g === 'nod' || g === 'shake') p[g](k, t);
      else if (g === 'shadeEyes') p[g]('R', k, 0.3);
      else p[g]('R', k, t);
    },
  };
}

export const SCENES = { 'q-eat': eat, 'q-drink': drink, 'q-meet': meet, 'q-gesture': sheet };
