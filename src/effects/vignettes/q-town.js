// Model scenes, school and town (Step 3a model pass, batch 5).
//   q-teach-board   教: a teacher writes 1+1=2 on the blackboard with chalk; she turns to a small pupil, who shoots a hand
//                   up (はい!) as a lightbulb pops on over her; text (教える, あいう): she taps あ, い, う one after another
//                   and the pupil reads each aloud; a red はなまる pops up and the pupil cheers
//   q-classroom-kids 教室: three small kids walk in one after another and sit at three desks facing you, a blackboard behind;
//                   they all shoot a hand up (はい!), then stand and walk out
//   q-school-bell   校: a school with a clock tower; its bell swings and rings (キンコーン) and three kids run out of the
//                   door into the yard and jump for joy (わーい!), then run back in; outcome kids (学校): with red school
//                   bags on their backs, three kids run in through the door as the bell rings
//   q-office-tower  社: an office tower with a かいしゃ sign lights up floor by floor; in front of it two office workers
//                   bow and swap business cards with both hands (よろしく); outcome commute (会社): the two walk in at its
//                   door one after the other, briefcases in hand, and the floors light up behind them
//   q-police-box    交番: a little police box (こうばん, red lamp); a lost child walks up crying (えーん); the officer bends
//                   down and points the way (あっち!); she nods and walks off, waving
//   q-library-shelf 図書館: a boy at a reading table under a tall bookshelf (としょかん); a red book slides out and floats
//                   to him; he opens it and reads, then it floats back
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, turnTo, onHead, briefcase } from './q-common.js';
import { dyer } from './q-wear.js';
import { wscale } from './q-learn.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
// an actor walking from p to q ([x, z], group space) at f (0..1), facing the way it goes; clip while moving
export function stroll(a, p, q, f, floor, t, clip = 'Walk', idle = 'Idle') {
  const moving = f > 0 && f < 1;
  a.pose(moving ? clip : idle, t);
  a.group.position.set(lerp(p[0], q[0], f), floor, lerp(p[1], q[1], f));
  if (moving) a.group.rotation.y = Math.atan2(q[0] - p[0], q[1] - p[1]);
  return moving;
}
// show / hide an actor with a pop
export const appear = (a, k) => { a.group.visible = k > 0.01; a.group.scale.setScalar(grow(k)); };
// an emblem in a holder group, so pop() can scale the holder while the emblem keeps its size
export const held = (e) => { const g = new THREE.Group(); g.add(e); g.idle = (x) => e.idle(x); return g; };
// a red はなまる (a flower drawn round a circle: well done!)
const hanamaru = (u) => solidProp([[G.torus(0.07 * u, 0.012 * u), 0xe03040], [G.torus(0.035 * u, 0.01 * u), 0xe03040],
  ...[0, 1, 2, 3, 4, 5].map((i) => [G.torus(0.035 * u, 0.01 * u, Math.PI, 0.1 * u * Math.cos(i * 1.047), 0.1 * u * Math.sin(i * 1.047), 0, i * 1.047 - Math.PI / 2), 0xe03040])], 0.8);
// a wall blackboard: frame, green face, chalk tray; origin at the middle of the face
const wallBoard = (u, w, h) => solidProp([[G.box((w + 0.06) * u, (h + 0.06) * u, 0.03 * u, 0, 0, -0.012 * u), 0x8a5a30], [G.box(w * u, h * u, 0.02 * u, 0, 0, 0), 0x1f4a32], [G.box(w * 0.9 * u, 0.025 * u, 0.05 * u, 0, -(h / 2 + 0.02) * u, 0.02 * u), 0x8a5a30]]);
const BOARD = 0x1f4a32;

// ---- 教 / 教える ----
function teachBoard(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.78 * u, by = floor + 0.62 * u, bz = -0.5 * u;
  const text = spec.text ?? '1+1=2', kana = text !== '1+1=2', s = () => wscale(group);
  const tch = person(spec.who, u), kid = person(spec.kid, u, KID + 0.08);
  const board = wallBoard(u, 0.86, 0.4), words = textPlane(text, { h: 0.22 * u, color: '#f4f0e8' }), tw = words.geometry.parameters.width, left = bx - tw / 2;
  const mask = solidProp([[G.box(1, 0.22 * u, 0.004 * u, 0.5, 0, 0), BOARD]]), chalk = solidProp([[G.cyl(0.011 * u, 0.011 * u, 0.06 * u, 0, 0, 0, Math.PI / 2), 0xffffff]], 0.8);
  board.position.set(bx, by, bz); words.position.set(bx, by, bz + 0.015 * u);
  const extra = kana ? [...text].map((c) => label(u, c + '!', '#3a7ac0', 0.15)) : [held(emblemProp('lightbulb', 0.32 * u, { color: '#ffe060' })), label(u, 'はい!', '#3a8a5a', 0.13)];
  const flower = kana ? hanamaru(u) : null; group.add(board, words, mask, chalk, tch.group, kid.group, ...extra, ...(flower ? [flower] : [])); const loop = 7.6, kx = B.maxX + 0.3 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { write: [0.3, 2.3, 'linear'], turn: [2.8, 0.4], wipe: [6.6, 0.7], back: [6.4, 0.9] });
      // the text appears behind the chalk as she writes, and is wiped at the end
      const f = pre ? 0 : T.write * (1 - T.wipe), wx = left + tw * f;
      mask.position.set(wx, by, bz + 0.02 * u); mask.scale.x = Math.max(1e-3, tw * (1 - f) + 0.01 * u);
      // she walks along under the writing, facing the board; then turns to the pupil
      const writing = !pre && v > 0.3 && v < 2.7, walkBack = !pre && T.back > 0 && T.back < 1;
      tch.pose(walkBack ? 'Walk' : 'Idle', walkBack ? v : t);
      tch.group.position.set(lerp(left + 0.3 * u, left + tw + 0.3 * u, pre ? 0 : T.write * (1 - T.back)), floor, bz + 0.2 * u);
      tch.group.rotation.y = turnTo(LEFT - 0.25, LEFT + 0.75, T.turn * (1 - T.back));
      const tip = group.localToWorld(W2.set(wx + 0.01 * u, by - 0.02 * u + 0.03 * u * Math.sin(v * 9) * (writing ? 1 : 0), bz + 0.06 * u));
      // kana: after turning, she points the chalk at each letter in turn while the pupil reads it out
      const which = kana && !pre && v > 3.3 && v < 5.4 ? Math.min(2, Math.floor((v - 3.3) / 0.7)) : -1;
      if (writing) tch.write('R', tip, 1, v);
      else if (which >= 0) { tch.turn('Head', 0, -0.6); tch.handTo('R', group.localToWorld(W2.set(left + tw * (which + 0.5) / 3, by, bz + 0.1 * u)), 1, { out: 0.7, down: 0.4 }); }
      else tch.handTo('R', tch.local(-0.16, 0.5, 0.18, W2), 1, { out: 0.6, down: 0.8 });
      tch.hold(chalk, 'R', group, 0.011 * u * s()); chalk.rotation.set(0, tch.group.rotation.y, 0); tch.nod(pre || kana ? 0 : bump(v, 4.0, 1.4), v);
      kid.pose('Idle', t + 1); kid.group.position.set(kx, floor, 0.32 * u); kid.group.rotation.y = 0.7;
      if (!kana) {
        // got it: her hand shoots up and a bulb lights over her
        const up = pre ? 0 : between(v, 3.3, 3.6) * (1 - between(v, 5.8, 6.2));
        kid.handTo('R', kid.local(-0.24, 1.05, 0.06, W), up, { out: 0.4, down: 0.2 }); kid.turn('Head', -0.15 * up);
        const [bulb, hai] = extra; pop(bulb, pre ? 0 : between(v, 3.6, 3.9) * (1 - between(v, 5.8, 6.2)), kx - 0.05 * u, floor + 1.02 * u, 0.32 * u); bulb.idle(v);
        pop(hai, up, kx + 0.2 * u, floor + 0.86 * u, 0.4 * u);
      } else {
        extra.forEach((l, i) => pop(l, which === i ? 1 : 0, kx + 0.05 * u, floor + 0.78 * u, 0.4 * u));
        const yay = pre ? 0 : between(v, 5.5, 5.8) * (1 - between(v, 6.9, 7.2));
        if (yay > 0) { kid.pose('Victory', 0.4 + 0.2 * Math.sin(v * 5)); kid.group.position.set(kx, floor, 0.32 * u); }
        pop(flower, yay, kx + 0.3 * u, floor + 0.7 * u, 0.42 * u); flower.rotation.z = v;
      }
    },
  };
}

// ---- 教室 ----
function classroom(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.38 * u, dz = 0.2 * u, sz = dz - 0.26 * u, wz = sz - 0.2 * u;
  const kids = [spec.who, spec.other, spec.third].map((n) => person(n, u, KID + 0.12)), top = 0.2 * u, gap = 0.42 * u;
  const desk = (x) => [[G.box(0.32 * u, 0.025 * u, 0.2 * u, x, top, dz), 0xc89060], [G.box(0.3 * u, top, 0.02 * u, x, top / 2, dz + 0.09 * u), 0x9a6a3a],
    [G.box(0.16 * u, 0.02 * u, 0.14 * u, x, 0.13 * u, sz - 0.02 * u), 0x6a8ac0], [G.box(0.16 * u, 0.2 * u, 0.02 * u, x, 0.23 * u, sz - 0.1 * u), 0x6a8ac0]];
  const room = solidProp([...[0, 1, 2].flatMap((i) => desk(x0 + i * gap)), [G.box(1.1 * u, 0.42 * u, 0.03 * u, x0 + gap, 0.78 * u, -0.6 * u), 0x8a5a30], [G.box(1.04 * u, 0.36 * u, 0.02 * u, x0 + gap, 0.78 * u, -0.58 * u), BOARD]]);
  room.position.y = floor; const chalk = textPlane('あいうえお', { h: 0.13 * u, color: '#f4f0e8' }), hai = label(u, 'はい!', '#3a8a5a', 0.14);
  chalk.position.set(x0 + gap, floor + 0.8 * u, -0.565 * u); group.add(room, chalk, hai, ...kids.map((k) => k.group));
  const loop = 9.0, door = x0 + 1.3 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      kids.forEach((k, i) => {
        const dx = x0 + i * gap, at = 0.2 + 0.8 * i, dur = (door - dx) / (0.42 * u);
        const T = timeline(v, { in: [at, dur, 'linear'], seat: [at + dur, 0.4], sit: [at + dur + 0.3, 0.6, 'linear'], up: [5.8, 0.5, 'linear'], out: [6.3 + 0.2 * (2 - i), (door - dx) / (0.6 * u), 'linear'] });
        if (pre || T.in <= 0) { appear(k, 0); return; }
        appear(k, Math.min(between(v, at, at + 0.3), 1 - between(T.out, 0.85, 1)));
        // walk in behind the desks, step forward to the chair and turn round, sit; at the end stand and walk out
        const going = T.out > 0; stroll(k, going ? [dx, wz] : [door, wz], going ? [door, wz] : [dx, wz], going ? T.out : T.in, floor, v * 1.1);
        if (T.in >= 1 && !going) {
          const sit = T.sit * (1 - T.up); k.pose(sit > 0 ? 'SitDown' : 'Idle', sit > 0 ? sit : t, false);
          k.group.position.set(dx, floor, lerp(wz, sz, T.seat * (1 - T.up))); k.group.rotation.y = T.up > 0 ? turnTo(0, RIGHT, T.up) : turnTo(LEFT, 0, T.seat);
          // everyone's hand shoots up
          const hand = between(v, 4.0 + 0.1 * i, 4.3 + 0.1 * i) * (1 - between(v, 5.4, 5.8));
          k.handTo('R', k.local(-0.24, 1.05, 0.06, W), hand, { out: 0.4, down: 0.2 });
        }
      });
      pop(hai, pre ? 0 : between(v, 4.1, 4.4) * (1 - between(v, 5.4, 5.7)), x0 + gap, floor + 0.98 * u, 0.3 * u);
    },
  };
}

// ---- 校 / 学校 ----
// a school: a long block with a clock tower and an open belfry, a dark doorway in the middle; origin at the door's foot
const schoolHouse = (u) => solidProp([[G.box(1.05 * u, 0.48 * u, 0.3 * u, 0, 0.24 * u, -0.15 * u), 0xf4ead8], [G.box(1.1 * u, 0.04 * u, 0.34 * u, 0, 0.5 * u, -0.15 * u), 0xb04a3a],
  [G.box(0.28 * u, 0.3 * u, 0.28 * u, 0, 0.66 * u, -0.15 * u), 0xf4ead8], [G.cyl(0.09 * u, 0.09 * u, 0.012 * u, 0, 0.68 * u, 0.0, Math.PI / 2), 0xffffff],
  [G.box(0.012 * u, 0.07 * u, 0.008 * u, 0, 0.71 * u, 0.008 * u), 0x202020], [G.box(0.055 * u, 0.012 * u, 0.008 * u, 0.025 * u, 0.68 * u, 0.008 * u), 0x202020],
  [G.box(0.03 * u, 0.2 * u, 0.03 * u, -0.11 * u, 0.91 * u, -0.15 * u), 0xf4ead8], [G.box(0.03 * u, 0.2 * u, 0.03 * u, 0.11 * u, 0.91 * u, -0.15 * u), 0xf4ead8], [G.cone(0.21 * u, 0.16 * u, 0, 1.09 * u, -0.15 * u), 0xb04a3a],
  [G.box(0.2 * u, 0.3 * u, 0.01 * u, 0, 0.15 * u, 0.002 * u), 0x2a1c14], ...[-0.4, -0.25, 0.25, 0.4].map((x) => [G.box(0.1 * u, 0.12 * u, 0.01 * u, x * u, 0.28 * u, 0.002 * u), 0x9ad8ff])], 0.4);
function schoolBell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.78 * u, sz = -0.3 * u, kids = spec.outcome === 'kids';
  const school = schoolHouse(u), hang = new THREE.Group(), bell = solidProp([[G.sphere(0.07 * u, 0, -0.05 * u, 0, 1, 1.1, 1), 0xe8b030], [G.cyl(0.075 * u, 0.075 * u, 0.02 * u, 0, -0.1 * u, 0), 0xe8b030], [G.sphere(0.022 * u, 0, -0.12 * u, 0), 0x8a6020]], 0.8);
  const K = 1.35; school.scale.setScalar(K); school.position.set(sx, floor, sz); hang.add(bell); hang.position.set(sx, floor + 0.99 * K * u, sz - 0.15 * K * u);
  const rings = many([[G.torus(0.12 * u, 0.01 * u), 0xffe080]], 3, 1.0), ding = label(u, 'キンコーン', '#c08a20', 0.12), joy = kids ? null : label(u, 'わーい!', '#e0702a', 0.14);
  const pupils = [spec.who, spec.other, spec.third].map((n) => person(n, u, KID + 0.03));
  const bags = kids ? many([[G.box(0.16 * u, 0.18 * u, 0.1 * u, 0, 0, 0), 0xd02a2a], [G.box(0.165 * u, 0.08 * u, 0.105 * u, 0, 0.06 * u, 0.003 * u), 0xa01a1a]], 3, 0.5) : null;
  group.add(school, hang, rings, ding, ...pupils.map((p) => p.group), ...[joy, bags].filter(Boolean)); const loop = kids ? 6.4 : 8.0, door = [sx, sz + 0.02 * u], yard = (i) => [sx - 0.3 * u + 0.38 * u * i, 0.32 * u + 0.08 * u * (i % 2)], street = (i) => [sx + 0.95 * u + 0.15 * u * i, 0.45 * u - 0.05 * u * i];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const ringing = pre ? 0 : between(v, 0.2, 0.4) * (1 - between(v, 2.2, 2.6)) + (kids ? 0 : between(v, 4.4, 4.6) * (1 - between(v, 5.6, 6.0)));
      hang.rotation.z = 0.55 * Math.sin(v * 10) * ringing;
      for (let i = 0; i < 3; i++) { const f = (v * 1.2 + i / 3) % 1; rings.set(i, sx, floor + 0.93 * K * u, sz - 0.1 * u, ringing > 0.2 ? 0.6 + 1.6 * f : 0); }
      rings.commit(); pop(ding, ringing > 0.3 ? 1 : 0, sx + 0.5 * u, floor + 1.32 * u, 0.0);
      pupils.forEach((p, i) => {
        if (kids) {
          // with school bags on, they run in from the street through the door, one after another
          const back = pre ? 0 : between(v, 5.5, 5.9), f = pre || back > 0 ? 0 : between(v, 0.6 + 0.45 * i, 2.6 + 0.45 * i);
          stroll(p, street(i), door, f, floor, v, 'Run');
          if (f <= 0) p.group.rotation.y = LEFT - 0.3;
          appear(p, pre ? 1 : back > 0 ? back : 1 - between(f, 0.9, 1));
          p.local(0, 0.42, -0.17, W); group.worldToLocal(W); bags.set(i, W.x, W.y, W.z, p.group.visible ? p.group.scale.x : 0, 0, p.group.rotation.y);
        } else {
          // break time: they run out into the yard, jump for joy, and run back in at the next bell
          const o = pre ? 0 : between(v, 0.7 + 0.3 * i, 2.0 + 0.3 * i), b = pre ? 0 : between(v, 5.0 + 0.3 * i, 6.5 + 0.3 * i);
          stroll(p, b > 0 ? yard(i) : door, b > 0 ? door : yard(i), b > 0 ? b : o, floor, v * 1.1, 'Run');
          appear(p, b > 0 ? 1 - between(b, 0.9, 1) : between(o, 0, 0.1));
          if (o >= 1 && b <= 0) { const jump = v > 2.6 && v < 4.6; p.pose(jump ? 'Jump' : 'Idle', jump ? (v - 2.6 + 0.3 * i) % 1.0 : t + i); p.group.rotation.y = turnTo(p.group.rotation.y, 0.2 * (1 - i), 1); }
        }
      });
      if (bags) bags.commit(); if (joy) pop(joy, pre ? 0 : between(v, 2.7, 3.0) * (1 - between(v, 4.3, 4.6)), sx, floor + 0.88 * u, 0.4 * u);
    },
  };
}

// ---- 社 / 会社 ----
function officeTower(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.78 * u, tz = -0.8 * u, commute = spec.outcome === 'commute';
  const tower = solidProp([[G.box(0.7 * u, 1.45 * u, 0.3 * u, 0, 0.725 * u, 0), 0x56688a], [G.box(0.74 * u, 0.05 * u, 0.33 * u, 0, 1.45 * u, 0), 0x34445e], [G.box(0.2 * u, 0.26 * u, 0.01 * u, 0, 0.13 * u, 0.152 * u), 0x9ad8ff], [G.box(0.005 * u, 0.26 * u, 0.012 * u, 0, 0.13 * u, 0.155 * u), 0x34445e]], 0.35);
  const wins = many([[G.box(0.14 * u, 0.12 * u, 0.01 * u), 0xffffff]], 18, 1.2), sign = textPlane('かいしゃ', { h: 0.13 * u, color: '#ffffff', bg: '#d03030', pad: 0.3 }), dark = new THREE.Color(0x203048), lit = new THREE.Color(0xffe080);
  tower.position.set(tx, floor, tz); sign.position.set(tx, floor + 1.56 * u, tz + 0.05 * u);
  for (let i = 0; i < 18; i++) wins.set(i, tx + ((i % 3) - 1) * 0.2 * u, floor + (0.4 + Math.floor(i / 3) * 0.17) * u, tz + 0.155 * u, 1);
  wins.commit(); const a = person(spec.who, u), b = person(spec.other, u), say = commute ? null : label(u, 'よろしく!', '#3a6ac0', 0.12);
  const props = commute ? [briefcase(u), briefcase(u)] : [0, 1].map(() => solidProp([[G.box(0.11 * u, 0.065 * u, 0.006 * u, 0, 0, 0), 0xffffff], [G.box(0.07 * u, 0.01 * u, 0.007 * u, 0, 0.01 * u, 0), 0x404a60]], 0.7));
  group.add(tower, wins, sign, a.group, b.group, ...props, ...(say ? [say] : [])); const loop = commute ? 7.2 : 6.8, door = [tx, tz + 0.18 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = wscale(group);
      // the floors light up one after another (commute: once they are in), and go dark at the end
      const f = pre ? 0 : commute ? between(v, 2.8, 5.0) * (1 - between(v, 6.6, 7.0)) : between(v, 0.2, 2.6) * (1 - between(v, 6.2, 6.6));
      for (let i = 0; i < 18; i++) wins.setColorAt(i, f * 6 > Math.floor(i / 3) + 0.5 ? lit : dark);
      wins.instanceColor.needsUpdate = true;
      if (commute) {
        [a, b].forEach((p, i) => {
          const back = pre ? 0 : between(v, 6.6, 7.1), g = pre || back > 0 ? 0 : between(v, 0.3 + 0.8 * i, 2.5 + 0.8 * i), from = [B.maxX + 1.0 * u + 0.35 * u * i, 0.45 * u];
          stroll(p, from, door, g, floor, v + i * 0.6);
          if (g <= 0) p.group.rotation.y = 0.3 - 0.6 * i;
          appear(p, back > 0 ? back : 1 - between(g, 0.88, 1));
          p.handTo('L', p.local(0.2, 0.35, 0.02, W), 1, { out: 0.8, down: 0.9 });
          p.hold(props[i], 'L', group, 0.03 * u * s); props[i].rotation.set(0, p.group.rotation.y + RIGHT, 0); props[i].visible = p.group.visible; props[i].scale.setScalar(p.group.scale.x);
        });
      } else {
        // they face each other, hold a card out with both hands, bow, and the cards change hands
        const T = timeline(v, { offer: [0.8, 0.5], bow: [1.5, 0.5], up: [2.5, 0.5], swap: [2.6, 0.8], down: [4.6, 0.5] });
        [a, b].forEach((p, i) => {
          p.pose('Idle', t + i * 2); p.group.position.set(B.maxX + 0.42 * u + 0.62 * u * i, floor, 0.2 * u); p.group.rotation.y = i ? LEFT + 0.55 : RIGHT - 0.55;
          const off = T.offer * (1 - T.down); p.bow(0.6 * T.bow * (1 - T.up));
          p.holdOut(off, { apart: 0.12, y: 0.5, z: 0.32 });
          const mine = props[T.swap > 0.5 ? 1 - i : i];
          p.local(0, 0.5, 0.32 + 0.12 * off, W); group.worldToLocal(W); mine.position.copy(W); mine.rotation.set(-0.3, p.group.rotation.y, 0);
          if (off < 0.05) mine.position.copy(group.worldToLocal(p.local(0, 0.55, 0.12, W)));
        });
        // mid-swap the cards travel across between them
        if (T.swap > 0 && T.swap < 1) props.forEach((c, i) => { const p0 = (i ? b : a).local(0, 0.5, 0.42, W), p1 = (i ? a : b).local(0, 0.5, 0.42, W2); c.position.copy(group.worldToLocal(p0.lerp(p1, T.swap))).add(W.set(0, 0.06 * u * Math.sin(Math.PI * T.swap) * (i ? -1 : 1), 0)); });
        pop(say, pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 2.9, 3.2)), B.maxX + 0.73 * u, floor + 0.98 * u, 0.4 * u);
      }
    },
  };
}

// ---- 交番 ----
function policeBox(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u, kz = -0.4 * u, NAVY = 0x1c2a50;
  const koban = solidProp([[G.box(0.62 * u, 0.8 * u, 0.42 * u, 0, 0.4 * u, 0), 0xf0ece4], [G.box(0.72 * u, 0.07 * u, 0.5 * u, 0, 0.84 * u, 0), NAVY], [G.box(0.22 * u, 0.46 * u, 0.01 * u, 0.12 * u, 0.23 * u, 0.211 * u), 0x203048],
    [G.box(0.16 * u, 0.16 * u, 0.01 * u, -0.15 * u, 0.4 * u, 0.211 * u), 0x9ad8ff], [G.cyl(0.012 * u, 0.012 * u, 0.12 * u, 0, 0.93 * u, 0), 0x404040]], 0.35);
  const lamp = solidProp([[G.sphere(0.055 * u), 0xff2020]], 1.2), sign = textPlane('こうばん', { h: 0.1 * u, color: '#ffffff', bg: '#1c2a50', pad: 0.3 });
  koban.position.set(kx, floor, kz); lamp.position.set(kx, floor + 1.02 * u, kz); sign.position.set(kx, floor + 0.68 * u, kz + 0.22 * u); const cop = person(spec.who, u), kid = person(spec.kid, u, KID + 0.05), dye = dyer(cop);
  const cap = solidProp([[G.cyl(0.13 * u, 0.12 * u, 0.06 * u, 0, 0, 0), NAVY], [G.box(0.12 * u, 0.01 * u, 0.07 * u, 0, -0.03 * u, 0.1 * u), 0x101018], [G.sphere(0.018 * u, 0, 0.0, 0.13 * u, 1, 1, 0.4), 0xffd040]], 0.4);
  const cry = label(u, 'えーん', '#5a8ad0', 0.12), way = label(u, 'あっち!', '#2a5ab0', 0.13), thanks = label(u, 'ありがとう!', '#e07a3a', 0.11);
  group.add(koban, lamp, sign, cop.group, kid.group, cap, cry, way, thanks); const loop = 8.0, cx = kx + 0.55 * u, stop = [cx + 0.42 * u, 0.3 * u], from = [cx + 1.1 * u, 0.55 * u], away = [cx + 1.15 * u, -0.6 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0.2, 1.4, 'linear'], bend: [2.0, 0.5], point: [2.6, 0.4], up: [4.2, 0.5], go: [5.2, 1.8, 'linear'] });
      lamp.scale.setScalar(1 + 0.15 * Math.sin(t * 6)); dye('Shirt', 0x8ab0e0); dye('Vest', NAVY); dye('Pants', NAVY); dye('Hat', NAVY);
      cop.pose('Idle', t); cop.group.position.set(cx, floor, 0.1 * u); cop.group.rotation.y = 0.9;
      // he bends down to the child, then points the way with his whole arm
      cop.bow(0.55 * T.bend * (1 - T.up));
      const pt = T.point * (1 - between(v, 4.6, 5.0));
      cop.point('L', group.localToWorld(W2.set(cx + 1.4 * u, floor + 0.75 * u, -0.9 * u)), pt);
      onHead(cop, cap, group, 'over', 0, -0.12, 0.0); cap.rotation.x = 0.45 * T.bend * (1 - T.up);
      // the child walks up crying, listens, nods, and walks off the way he pointed, waving
      const going = T.go > 0; stroll(kid, going ? stop : from, going ? away : stop, going ? T.go : T.in, floor, v);
      if (T.in >= 1 && !going) kid.group.rotation.y = LEFT + 0.5; appear(kid, pre ? 0 : between(v, 0.1, 0.4) * (1 - between(T.go, 0.85, 1)));
      const sob = pre ? 0 : between(v, 0.3, 0.5) * (1 - between(v, 2.6, 2.9));
      kid.handTo('R', kid.at('eyes', W, -0.04, 0, 0.05), sob, { out: 0.5, down: 0.8 }); kid.handTo('L', kid.at('eyes', W, 0.04, 0, 0.05), sob, { out: 0.5, down: 0.8 });
      kid.turn('Head', 0.2 * sob - 0.25 * T.bend * (1 - T.up) * (1 - sob));
      kid.nod(pre ? 0 : bump(v, 3.4, 1.0), v);
      if (going) kid.wave('L', between(T.go, 0.05, 0.2), v);
      pop(cry, sob, stop[0] + 0.12 * u, floor + 0.8 * u, 0.4 * u);
      pop(way, pt, cx + 0.35 * u, floor + 1.08 * u, 0.3 * u);
      pop(thanks, pre ? 0 : between(v, 4.6, 4.9) * (1 - between(v, 6.4, 6.7)), lerp(stop[0], away[0], T.go) + 0.05 * u, floor + 0.8 * u, 0.4 * u);
    },
  };
}

// ---- 図書館 ----
function libraryShelf(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 1.15 * u, shz = -0.35 * u, top = 0.22 * u, x1 = B.maxX + 0.5 * u;
  const COLS = [0xd04040, 0x3a6ad0, 0x40a060, 0xe0a030, 0x8a50c0, 0x30a0b0];
  const books = [0, 1, 2, 3].flatMap((r) => Array.from({ length: 9 }, (_, i) => { if (r === 2 && i === 4) return []; const h = (0.15 + 0.04 * ((i * 7 + r * 3) % 3)) * u; return [[G.box(0.06 * u, h, 0.16 * u, (-0.27 + i * 0.067) * u, (0.06 + r * 0.29) * u + h / 2, 0.02 * u), COLS[(i + r * 2) % 6]]]; }).flat());
  const shelf = solidProp([[G.box(0.7 * u, 1.2 * u, 0.04 * u, 0, 0.6 * u, -0.1 * u), 0x7a4a24], [G.box(0.04 * u, 1.2 * u, 0.24 * u, -0.33 * u, 0.6 * u, 0), 0x8a5a30], [G.box(0.04 * u, 1.2 * u, 0.24 * u, 0.33 * u, 0.6 * u, 0), 0x8a5a30],
    ...[0, 1, 2, 3, 4].map((r) => [G.box(0.66 * u, 0.025 * u, 0.24 * u, 0, (0.05 + r * 0.29) * u, 0), 0x8a5a30]), ...books], 0.35);
  const sign = textPlane('としょかん', { h: 0.09 * u, color: '#ffffff', bg: '#3a6a4a', pad: 0.3 });
  const table = solidProp([[G.box(0.62 * u, 0.025 * u, 0.3 * u, 0, top, 0), 0xc89060], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [G.box(0.03 * u, top, 0.03 * u, a * 0.28 * u, top / 2, b * 0.12 * u), 0x8a5a30])], 0.35);
  shelf.position.set(x0, floor, shz); sign.position.set(x0, floor + 1.28 * u, shz + 0.02 * u); table.position.set(x1, floor, 0.3 * u);
  const kid = person(spec.who, u, KID + 0.13), shh = label(u, 'しーん', '#6a7a9a', 0.11);
  // the red book: two covers hinged at the spine (origin), the pages on their +z side; shut (folded to -z) until he holds it
  const book = new THREE.Group(), half = (sgn) => { const g = new THREE.Group(); g.add(solidProp([[G.box(0.15 * u, 0.21 * u, 0.014 * u, sgn * 0.075 * u, 0, 0), 0xd03030], [G.box(0.14 * u, 0.2 * u, 0.006 * u, sgn * 0.075 * u, 0, 0.008 * u), 0xfaf6ea], [G.sphere(0.03 * u, sgn * 0.075 * u, 0.02 * u, -0.007 * u, 1, 1, 0.3), 0xffd040]], 0.5)); return g; };
  const L = half(-1), R = half(1); book.add(L, R); group.add(shelf, sign, table, kid.group, book, shh);
  const loop = 8.0, slot = new THREE.Vector3(x0 - 0.002 * u, floor + 0.745 * u, shz + 0.1 * u);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.3, 0.5], fly: [0.8, 1.3], open: [2.3, 0.5, 'back'], shut: [5.2, 0.4], back: [5.6, 1.2], home: [6.8, 0.5] });
      kid.pose('SitDown', 1.0, false); kid.group.position.set(x1, floor, 0.04 * u); kid.group.rotation.y = 0.25;
      // the book slides out of its gap, floats over in an arc and lands open in his hands; later it shuts and floats home
      const rest = group.worldToLocal(kid.local(0, 0.47, 0.3, new THREE.Vector3()));
      const out = slot.clone().add(W.set(0, 0, 0.22 * u * (T.out - T.home)));
      const f = pre ? 0 : T.fly * (1 - T.back), at = out.lerp(rest, f); at.y += 0.25 * u * Math.sin(Math.PI * f);
      book.position.copy(at); book.rotation.set(-0.3 * f, (Math.PI + 0.25) * f, 0, 'YXZ');
      const o = pre ? 0 : T.open * (1 - T.shut); L.rotation.y = lerp(-Math.PI / 2, 0.3, o); R.rotation.y = lerp(Math.PI / 2, -0.3, o);
      const reach = pre ? 0 : between(f, 0.6, 1); book.updateWorldMatrix(true, true); kid.handTo('L', book.localToWorld(W.set(-0.17 * u * (0.2 + 0.8 * o), -0.05 * u, 0)), reach, { out: 0.8, down: 0.8 });
      kid.handTo('R', book.localToWorld(W2.set(0.17 * u * (0.2 + 0.8 * o), -0.05 * u, 0)), reach, { out: 0.8, down: 0.8 });
      kid.turn('Head', 0.25 * o);
      pop(shh, o > 0.9 ? 1 : 0, x1 + 0.1 * u, floor + 0.88 * u, 0.3 * u);
    },
  };
}

export const SCENES = { 'q-teach-board': teachBoard, 'q-classroom-kids': classroom, 'q-school-bell': schoolBell, 'q-office-tower': officeTower, 'q-police-box': policeBox, 'q-library-shelf': libraryShelf };
