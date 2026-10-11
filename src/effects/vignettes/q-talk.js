// Model scenes, talking, asking and answering (Step 3a model pass).
//   q-chat   話: two people on stools at a little table talk in turn, speech bubbles back and forth, nodding and
//            waving their hands; outcome phone: a person talks on a phone held flat to her ear, もしもし and うんうん (話す)
//   q-words  言葉: two people meet and talk; their bubbles say hello in other languages: Hello! こんにちは! Hola! 你好!
//   q-ask    問: a child shoots a hand up under a big "?" and asks; the teacher at the board turns, points to her and
//            nods; outcome answer: the board asks 1+1=?, the child's hand goes up, 2!, and a red ○ pops on the board (答);
//            mic: a reporter holds a microphone out to a person, a "?" bubble; he thinks, then answers (質問); phone:
//            a phone rings on a table, a person picks it up: はい! (答える); quiz: a quiz board flips to Q?, a
//            contestant slams the buzzer, ピンポン! and the light flashes (問題)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { textPlane, blackboard } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, label, pop, person, KID, speech, axisOf } from './q-common.js';

const W = new THREE.Vector3();
const SEAT = 0.075;      // the seat of the trousers below the Hips bone, in heights (SitDown pose)
// a three-legged stool 0.18u tall (scale.y sets its height)
const stoolOf = (u) => solidProp([[G.cyl(0.09 * u, 0.09 * u, 0.025 * u, 0, 0.1675 * u, 0), 0x8a5a30], ...[0, 1, 2].map((i) => [G.cyl(0.012 * u, 0.016 * u, 0.16 * u, 0.06 * u * Math.cos(i * 2.09), 0.08 * u, 0.06 * u * Math.sin(i * 2.09)), 0x6a4020])], 0.35);
// talking: the head bobs a little and a hand opens out now and then (k: talking amount)
function talk(p, k, v, side = 'R') { p.turn('Head', 0.05 * k * Math.sin(v * 13), 0.06 * k * Math.sin(v * 3)); p.handTo(side, p.local(side === 'R' ? -0.22 : 0.22, 0.5 + 0.04 * Math.sin(v * 5), 0.25, W), k * (0.6 + 0.4 * Math.sin(v * 2.5)), { out: 0.8, down: 0.8 }); }

// ---- 話 / 話す ----
function chat(ctx, spec, stage) {
  if (spec.outcome === 'phone') return phone(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, s = 0.8, xa = B.maxX + 0.55 * u, xb = xa + 0.86 * u;
  const a = person(spec.who, u, s), b = person(spec.other, u, s);
  // a round rug under a little cafe table with two cups; each stool stands under its sitter's hips (placed per frame)
  const table = solidProp([[G.cyl(0.46 * u, 0.46 * u, 0.012 * u, 0, 0.006 * u, 0, 0, 0, 0, 32), 0x8a4a5a], [G.cyl(0.17 * u, 0.17 * u, 0.025 * u, 0, 0.33 * u, 0), 0xc89a60], [G.cyl(0.02 * u, 0.03 * u, 0.33 * u, 0, 0.165 * u, 0), 0x8a5a30], [G.cyl(0.08 * u, 0.09 * u, 0.015 * u, 0, 0.018 * u, 0), 0x8a5a30], [G.cyl(0.03 * u, 0.025 * u, 0.06 * u, -0.07 * u, 0.375 * u, 0.02 * u), 0xf4f0e8], [G.cyl(0.03 * u, 0.025 * u, 0.06 * u, 0.07 * u, 0.375 * u, -0.02 * u), 0xe06a5a]], 0.4);
  const stools = [stoolOf(u), stoolOf(u)], lines = [['あのね…', 0], ['へえ!', 1], ['それでね!', 0], ['あはは!', 1]].map(([t, w]) => [speech(u, t, { h: 0.17, flip: w === 1 }), w]);
  table.position.set((xa + xb) / 2, floor, 0);
  group.add(table, ...stools, a.group, b.group, ...lines.map(([m]) => m));
  const loop = 7.2, hip = new THREE.Vector3();
  const stoolUnder = (p, st) => {
    group.updateWorldMatrix(true, false); p.group.updateWorldMatrix(true, true); group.worldToLocal(p.node('Hips').getWorldPosition(hip));
    st.position.set(hip.x, floor + 0.012 * u, hip.z); st.scale.set(1, Math.max(0.05 * u, hip.y - floor - 0.012 * u - SEAT * s * u) / (0.18 * u), 1);
  };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      a.pose('SitDown', 1.0, false); b.pose('SitDown', 1.0, false);
      a.group.position.set(xa, floor + 0.012 * u, 0.02 * u); a.group.rotation.y = RIGHT - 0.5; b.group.position.set(xb, floor + 0.012 * u, 0.02 * u); b.group.rotation.y = LEFT + 0.5;
      stoolUnder(a, stools[0]); stoolUnder(b, stools[1]);
      // four turns: she speaks, he answers, she goes on, he laughs; the listener nods
      lines.forEach(([m, w], i) => {
        const k = pre ? 0 : between(v, 0.3 + i * 1.6, 0.5 + i * 1.6) * (1 - between(v, 1.6 + i * 1.6, 1.8 + i * 1.6));
        const who = w ? b : a; pop(m, k, (w ? xb : xa) + (w ? 0.18 : -0.18) * u, floor + 0.95 * u, 0.12 * u);
        if (k > 0) { talk(who, k, v, w ? 'L' : 'R'); (w ? a : b).nod(k, v); }
      });
      if (!pre && v > 5.1 && v < 6.4) b.turn('Abdomen', 0.12 * Math.abs(Math.sin(v * 12)));
    },
  };
}
function phone(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), set = solidProp([[G.box(0.085 * u, 0.18 * u, 0.016 * u, 0, 0, 0), 0xff5a8a], [G.box(0.072 * u, 0.155 * u, 0.002 * u, 0, 0, 0.009 * u), 0x6ab0ff], [G.box(0.072 * u, 0.155 * u, 0.002 * u, 0, 0, -0.009 * u), 0xffd0e0]], 0.7);
  const lines = ['もしもし?', 'うん、うん!', 'またね!'].map((t) => speech(u, t, { h: 0.16 }));
  group.add(p.group, set, ...lines);
  const loop = 6.6, side = new THREE.Vector3(), up = new THREE.Vector3(), X = new THREE.Vector3(), Q = new THREE.Quaternion(), M = new THREE.Matrix4(), half = 0.008 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // she stands with the phone at her right ear, turning a little to and fro as she talks, the other hand gesturing
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = 0.3 + (pre ? 0 : 0.25 * Math.sin(2 * Math.PI * v / loop));
      p.group.updateWorldMatrix(true, true);
      lines.forEach((m, i) => { const k = pre ? 0 : between(v, 0.3 + i * 2.0, 0.5 + i * 2.0) * (1 - between(v, 1.8 + i * 2.0, 2.0 + i * 2.0)); pop(m, k, x0 + 0.3 * u, floor + 1.08 * u, 0.12 * u); if (k > 0) talk(p, k, v, 'L'); });
      // the phone lies flat on her cheek, from the ear down toward the mouth; the palm holds it there from outside
      const k = pre ? A.setup : 1;
      p.turn('Head', 0, 0, 0.12 * k);
      axisOf(p, 1, 0, 0, side);                            // her left: from the hand in toward her head
      p.at('earR', W, -0.035, -0.05, 0.035); W.addScaledVector(side, -half);
      p.grip('R', W, side, half, k, { out: 0.7, down: 0.9 });
      // in her hand while it comes up; then flat on the cheek (screen in), the palm pressing it from outside
      const n = k < 1 ? p.hold(set, 'R', group, half) : side;
      if (k >= 1) set.position.copy(group.worldToLocal(W));
      axisOf(p, 0, 1, -0.7, up); up.addScaledVector(n, -up.dot(n)).normalize(); X.crossVectors(up, n);
      group.getWorldQuaternion(Q).invert(); set.quaternion.setFromRotationMatrix(M.makeBasis(X, up, n)).premultiply(Q);
    },
  };
}

// ---- 言葉 ----
function words(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xa = B.maxX + 0.3 * u, xb = xa + 0.7 * u;
  const a = person(spec.who, u), b = person(spec.other, u);
  const lines = [['Hello!', 0], ['こんにちは!', 1], ['Hola!', 0], ['你好!', 1]].map(([t, w]) => [speech(u, t, { h: 0.15, flip: w === 1 }), w]);
  group.add(a.group, b.group, ...lines.map(([m]) => m));
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      a.pose('Idle', t); b.pose('Idle', t + 1.3);
      a.group.position.set(xa, floor, 0.05 * u); a.group.rotation.y = RIGHT - 0.5; b.group.position.set(xb, floor, 0.05 * u); b.group.rotation.y = LEFT + 0.5;
      lines.forEach(([m, w], i) => {
        const k = pre ? 0 : between(v, 0.3 + i * 1.6, 0.5 + i * 1.6) * (1 - between(v, 1.6 + i * 1.6, 1.8 + i * 1.6));
        pop(m, k, (w ? xb + 0.15 * u : xa - 0.12 * u), floor + 1.12 * u, 0.12 * u);
        if (k > 0) { talk(w ? b : a, k, v, w ? 'L' : 'R'); (w ? a : b).nod(k, v); }
      });
      a.wave('R', pre ? 0 : bump(v, 0.2, 1.3), v); b.wave('L', pre ? 0 : bump(v, 1.8, 1.3), v);
    },
  };
}

// ---- 問 / 答 / 質問 / 答える / 問題 ----
function ask(ctx, spec, stage) {
  const o = spec.outcome;
  if (o === 'mic') return mic(ctx, spec, stage);
  if (o === 'phone') return ring(ctx, spec, stage);
  if (o === 'quiz') return quiz(ctx, spec, stage);
  const answer = o === 'answer', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u, tx = kx + 0.85 * u;
  const kid = person(spec.who, u, KID + 0.15), teacher = person(spec.other, u), board = blackboard(u, { w: 0.6, h: 0.36 });
  const q = answer ? textPlane('1+1=?', { h: 0.12 * u, color: '#ffffff', weight: 700 }) : label(u, '?', '#e07a3a', 0.28);
  const line = speech(u, answer ? '2!' : 'せんせい、なぜ?', { h: answer ? 0.2 : 0.15 }), ok = answer ? solidProp([[G.torus(0.12 * u, 0.025 * u, Math.PI * 2, 0, 0, 0), 0xe03030]], 1.0) : null;
  board.position.set(tx + 0.5 * u, floor + 0.85 * u, -0.3 * u);
  group.add(kid.group, teacher.group, board, q, line, ...(ok ? [ok] : []));
  if (answer) q.position.set(tx + 0.5 * u, floor + 0.85 * u, -0.27 * u);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { hand: [0.4, 0.3, 'back'], turn: [1.4, 0.5], point: [1.9, 0.4], say: [2.4, 0.3], ok: [3.6, 0.3, 'back'], down: [5.4, 0.5] });
      kid.pose('Idle', t); kid.group.position.set(kx, floor + 0.03 * u * Math.abs(Math.sin(v * 7)) * T.hand * (1 - T.point), 0.15 * u); kid.group.rotation.y = RIGHT - 0.3;
      // her hand shoots up, stretching (はい! はい!)
      const hk = T.hand * (1 - T.down);
      kid.handTo('R', kid.local(-0.24, 1.05 + 0.03 * Math.sin(v * 9), 0.06, W), hk, { out: 0.4, down: 0.2 });
      teacher.pose('Idle', t + 2); teacher.group.position.set(tx, floor, 0.0); teacher.group.rotation.y = (RIGHT - 0.3) * (1 - T.turn) + (LEFT + 0.5) * T.turn;
      teacher.point('R', kid.at('over', W), T.point * (1 - T.say));
      teacher.nod(T.say * (1 - T.down), v);
      if (!answer) pop(q, pre ? 0 : T.hand * (1 - T.down), kx + 0.05 * u, floor + 1.15 * u, 0.1 * u);
      pop(line, T.say * (1 - T.down), kx + 0.25 * u, floor + 0.85 * u, 0.2 * u);
      if (ok) pop(ok, T.ok * (1 - T.down), tx + 0.5 * u, floor + 0.85 * u, -0.25 * u);
    },
  };
}
function mic(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xa = B.maxX + 0.3 * u, xb = xa + 0.7 * u;
  const rep = person(spec.other, u), p = person(spec.who, u), m = solidProp([[G.sphere(0.04 * u, 0, 0.12 * u, 0), 0x30343c], [G.cyl(0.014 * u, 0.012 * u, 0.14 * u, 0, 0.04 * u, 0), 0x20242c], [G.box(0.05 * u, 0.04 * u, 0.04 * u, 0, 0.0, 0), 0xe04848]], 0.5);
  const q = speech(u, '?', { h: 0.2 }), hm = label(u, 'えーと…', '#6a6a7a', 0.12), ans = speech(u, 'はい、それは…', { h: 0.12, flip: true });
  group.add(rep.group, p.group, m, q, hm, ans);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      rep.pose('Idle', t); rep.group.position.set(xa, floor, 0.05 * u); rep.group.rotation.y = RIGHT - 0.5;
      p.pose('Idle', t + 1); p.group.position.set(xb, floor, 0.05 * u); p.group.rotation.y = LEFT + 0.5;
      // the reporter thrusts the microphone toward his mouth and asks; he thinks (hand on chin), then answers
      const out = pre ? 0.3 : 0.3 + 0.7 * between(v, 0.3, 0.7) * (1 - between(v, 5.6, 6.0));
      const from = rep.local(-0.1, 0.55, 0.3, new THREE.Vector3()), to = p.at('mouth', W, 0, -0.08, 0.12);
      from.lerp(to, out * 0.8); m.position.copy(group.worldToLocal(from.clone())); m.rotation.set(0, 0, 0.9);
      rep.handTo('R', from.add(W.set(0.06 * u, -0.05 * u, 0)), 1, { out: 0.7, down: 0.7 });
      pop(q, pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 2.2, 2.4)), xa - 0.05 * u, floor + 1.1 * u, 0.12 * u);
      const think = pre ? 0 : between(v, 2.3, 2.6) * (1 - between(v, 3.6, 3.9));
      p.handTo('L', p.at('mouth', W, 0.01, -0.05, 0.05), think, { out: 0.3, down: 1 }); p.turn('Head', -0.15 * think, 0, 0.15 * think);
      pop(hm, think, xb + 0.1 * u, floor + 1.1 * u, 0.12 * u);
      const a = pre ? 0 : between(v, 3.9, 4.1) * (1 - between(v, 5.4, 5.6)); pop(ans, a, xb + 0.2 * u, floor + 1.1 * u, 0.12 * u); if (a > 0) talk(p, a, v, 'L');
    },
  };
}
function ring(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, tx = x0 + 0.5 * u;
  const p = person(spec.who, u), rr = label(u, 'リリリン!', '#e04848', 0.12), hai = speech(u, 'はい!', { h: 0.16 });
  const table = solidProp([[G.box(0.3 * u, 0.025 * u, 0.24 * u, 0, 0.42 * u, 0), 0xc89a60], [G.box(0.025 * u, 0.42 * u, 0.025 * u, -0.12 * u, 0.21 * u, -0.1 * u), 0x8a5a30], [G.box(0.025 * u, 0.42 * u, 0.025 * u, 0.12 * u, 0.21 * u, 0.1 * u), 0x8a5a30], [G.box(0.025 * u, 0.42 * u, 0.025 * u, -0.12 * u, 0.21 * u, 0.1 * u), 0x8a5a30], [G.box(0.025 * u, 0.42 * u, 0.025 * u, 0.12 * u, 0.21 * u, -0.1 * u), 0x8a5a30], [G.box(0.16 * u, 0.06 * u, 0.12 * u, 0, 0.465 * u, 0), 0xe04848]], 0.4);
  const hand = solidProp([[G.capsule(0.03 * u, 0.16 * u, 0, 0, 0, Math.PI / 2), 0xe04848]], 0.5);
  table.position.set(tx, floor, -0.05 * u);
  group.add(table, p.group, hand, rr, hai);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pick: [1.6, 0.5], hang: [4.8, 0.6] });
      const ringing = !pre && v > 0.3 && v < 1.8, k = T.pick * (1 - T.hang);
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.1 * u); p.group.rotation.y = RIGHT - 0.6 + 0.4 * k;
      // the receiver jumps on its cradle while it rings; she lifts it to her ear and answers
      const cradle = table.localToWorld(new THREE.Vector3(0, 0.51 * u, 0)), ear = p.at('earR', new THREE.Vector3(), -0.05, -0.02, 0.03);
      const at = cradle.lerp(ear, k); if (ringing) at.y += 0.01 * u * Math.abs(Math.sin(v * 40));
      hand.position.copy(group.worldToLocal(at.clone())); hand.rotation.set(0, p.group.rotation.y, k * 1.3);
      p.handTo('R', at, Math.min(1, T.pick * 1.5) * (1 - T.hang), { out: 0.7, down: 0.6 });
      pop(rr, ringing ? 1 : 0, tx, floor + 0.8 * u, 0.1 * u);
      pop(hai, pre ? 0 : between(v, 2.2, 2.4) * (1 - between(v, 4.4, 4.6)), x0 - 0.1 * u, floor + 1.1 * u, 0.15 * u);
    },
  };
}
function quiz(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, bx = x0 + 0.85 * u;
  const p = person(spec.who, u), ping = label(u, 'ピンポン!', '#e07a3a', 0.13);
  const panel = solidProp([[G.box(0.5 * u, 0.36 * u, 0.04 * u, 0, 0, 0), 0x3a2a7a], [G.box(0.46 * u, 0.32 * u, 0.01 * u, 0, 0, 0.022 * u), 0x1a1440]], 0.5), qtext = textPlane('Q.?', { h: 0.18 * u, color: '#ffe040', weight: 900 });
  const desk = solidProp([[G.box(0.24 * u, 0.4 * u, 0.2 * u, 0, 0.2 * u, 0), 0x2a6ae0], [G.box(0.26 * u, 0.02 * u, 0.22 * u, 0, 0.41 * u, 0), 0xf0f0f0], [G.cyl(0.05 * u, 0.06 * u, 0.025 * u, 0, 0.43 * u, 0), 0x30343c]], 0.4);
  const btn = solidProp([[G.sphere(0.05 * u, 0, 0, 0, 1, 0.6, 1), 0xff3030]], 0.8), lamp = solidProp([[G.sphere(0.06 * u), 0xffe040]], 1.6);
  panel.position.set(bx, floor + 0.95 * u, -0.35 * u); qtext.position.set(bx, floor + 0.95 * u, -0.32 * u); desk.position.set(x0 + 0.25 * u, floor, 0.1 * u);
  group.add(panel, qtext, desk, btn, lamp, p.group, ping);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { flip: [0.3, 0.4], slam: [1.6, 0.15, 'in'], up: [1.75, 0.3] });
      panel.rotation.x = qtext.rotation.x = (1 - (pre ? 1 : T.flip)) * Math.PI / 2; qtext.visible = T.flip > 0.5 || pre;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.1 * u); p.group.rotation.y = RIGHT - 0.5; p.turn('Head', -0.1, 0.4 * (1 - T.slam));
      // he raises his hand and slams the buzzer; it lights and pings
      const top = desk.localToWorld(new THREE.Vector3(0, 0.47 * u, 0)), raise = pre ? 0 : between(v, 0.9, 1.4) * (1 - T.slam);
      const hit = T.slam * (1 - between(v, 3.6, 4.0));
      p.handTo('R', top.clone().add(W.set(0, 0.25 * u * raise * group.getWorldScale(W).y, 0)), Math.max(raise, hit), { out: 0.6, down: 0.4 });
      btn.position.set(x0 + 0.25 * u, floor + 0.445 * u - 0.01 * u * hit, 0.1 * u);
      const on = !pre && v > 1.75 && v < 3.6; lamp.visible = on && Math.sin(v * 18) > -0.2; lamp.position.set(x0 + 0.25 * u, floor + 0.62 * u, 0.1 * u);
      pop(ping, on ? 1 : 0, x0 + 0.25 * u, floor + 1.05 * u, 0.15 * u);
    },
  };
}

export const SCENES = { 'q-chat': chat, 'q-words': words, 'q-ask': ask };
