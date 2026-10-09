// Model scenes, singing, tumbling, tasting, likes and dislikes (Step 3a model pass).
//   q-sing     歌: a person on a little stage sings into a microphone, swaying, notes pouring out; her free arm swings
//              up on the high note; outcome shower: a person sings in the shower with a back brush as a microphone,
//              water raining down, notes and bubbles (歌う)
//   q-tumble   転: a person walks along, steps on a banana peel and goes head over heels, rolling over and over; he
//              stands up dizzy, stars circling his head
//   q-taste    味: a chef dips a spoon in a steaming pot and tastes it; his face lights up (!), he rubs his belly: うまい!
//   q-refuse   嫌: a child at a table; a spoon of green peas comes at her; she turns her head away, crosses her arms and
//              shakes her head: イヤ!; outcome stink: she holds her nose at a smelly sock, green fumes, and pushes it
//              away: くさい! (嫌い)
//   q-flower   美: a flower grows and opens beside a person, sparkling; she gasps, hands to her cheeks: きれい!; outcome yum:
//              she bites a rice ball, her cheeks glow pink and she nods, hearts: おいしい! (美味しい)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, DROP, HEART, stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { between, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, hearts, person, KID, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
const notes = (u, n, color = '#e0407a') => ['♪', '♫', '♪', '♫'].slice(0, n).map((c) => label(u, c, color, 0.18));
// notes rising one after another from point (x, y, z) from time `at`
function flowNotes(list, x, y, z, v, at, u, pre) {
  list.forEach((m, i) => { const f = pre ? -1 : ((v - at) / 1.6 + i / list.length) % 1; const on = !pre && v > at && f >= 0; pop(m, on ? Math.sin(Math.PI * f) * 1.1 : 0, x + 0.3 * u * f + 0.05 * u * Math.sin(f * 9), y + 0.4 * u * f, z); });
}

// ---- 歌 / 歌う ----
function sing(ctx, spec, stage) {
  if (spec.outcome === 'shower') return shower(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, sy = 0.06 * u;
  const p = person(spec.who, u), ns = notes(u, 4);
  const stageBox = solidProp([[G.box(0.7 * u, sy, 0.45 * u, 0, sy / 2, 0), 0x8a3a2a], [G.box(0.72 * u, 0.01 * u, 0.47 * u, 0, sy, 0), 0xc89a60]], 0.4);
  const mic = solidProp([[G.sphere(0.035 * u, 0, 0.09 * u, 0), 0x50585f], [G.cyl(0.014 * u, 0.01 * u, 0.12 * u, 0, 0.02 * u, 0), 0x202428]], 0.5);
  stageBox.position.set(x0, floor, 0); group.add(stageBox, p.group, mic, ...ns);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor + sy, 0.05 * u); p.group.rotation.y = -0.15 + 0.15 * Math.sin(v * 2);
      // the microphone in her right hand, at her mouth; she sways, and flings the left arm up on the high note
      const k = pre ? A.setup : 1, high = pre ? 0 : bump(v, 2.8, 1.8);
      p.turn('Abdomen', 0, 0, 0.08 * Math.sin(v * 2.4)); p.turn('Head', -0.2 * high);
      p.at('mouth', W, -0.02, -0.06, 0.07); mic.position.copy(group.worldToLocal(W)); mic.rotation.set(-0.5, p.group.rotation.y, 0, 'YXZ');
      p.handTo('R', p.at('mouth', W2, -0.02, -0.13, 0.08), k, { out: 0.6, down: 0.8 });
      p.handTo('L', p.local(0.45, 1.1, 0.15, W2), high, { out: 0.8, down: 0.3 });
      flowNotes(ns, x0 + 0.1 * u, floor + 1.0 * u, 0.15 * u, v, 0.3, u, pre);
    },
  };
}
function shower(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), ns = notes(u, 3, '#3a7ac0'), rain = many(DROP(u, 0x9ad8ff), 24, 0.8), bubbles = many([[G.sphere(0.03 * u), 0xf4fbff]], 6, 0.9);
  const head = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.3 * u, 0, -0.15 * u, -0.22 * u), 0xc0c8d0], [G.cyl(0.012 * u, 0.012 * u, 0.2 * u, 0, 0, -0.12 * u, Math.PI / 2), 0xc0c8d0], [G.cyl(0.07 * u, 0.04 * u, 0.04 * u, 0, -0.02 * u, 0), 0xd8dee6],
    [G.box(0.7 * u, 0.02 * u, 0.4 * u, 0, -1.12 * u, -0.05 * u), 0xe8f4ff]], 0.5);
  const brush = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.22 * u, 0, 0, 0), 0xc89a60], [G.box(0.05 * u, 0.08 * u, 0.03 * u, 0, 0.13 * u, 0), 0xe8b0d0]], 0.5);
  head.position.set(x0, floor + 1.12 * u, 0); group.add(head, p.group, brush, rain, bubbles, ...ns);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.0); p.group.rotation.y = -0.25 + 0.2 * Math.sin(v * 2.2);
      const k = pre ? A.setup : 1;
      p.turn('Head', -0.2); p.turn('Abdomen', 0, 0, 0.08 * Math.sin(v * 2.2));
      p.at('mouth', W, -0.02, -0.12, 0.1); brush.position.copy(group.worldToLocal(W)); brush.rotation.set(-0.4, p.group.rotation.y, 0, 'YXZ');
      p.handTo('R', p.at('mouth', W2, -0.02, -0.2, 0.11), k, { out: 0.6, down: 0.8 });
      p.wave('L', pre ? 0 : bump(v, 2.0, 2.0), v);
      for (let i = 0; i < 24; i++) { const f = (((pre ? 0 : v) * 1.4 + i * 0.29) % 1); rain.set(i, x0 + (((i * 0.37) % 1) - 0.5) * 0.3 * u, floor + 1.08 * u - 1.08 * u * f, (((i * 0.61) % 1) - 0.5) * 0.25 * u, 0.9); }
      rain.commit();
      for (let i = 0; i < 6; i++) { const f = (((pre ? 0 : v) * 0.3 + i / 6) % 1); bubbles.set(i, x0 + 0.25 * u * Math.sin(i * 2 + f * 3), floor + 0.3 * u + 0.8 * u * f, 0.12 * u, Math.sin(Math.PI * f)); }
      bubbles.commit();
      flowNotes(ns, x0 + 0.15 * u, floor + 1.0 * u, 0.15 * u, v, 0.3, u, pre);
    },
  };
}

// ---- 転 ----
function tumble(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.2 * u, xp = xs + 0.35 * u, xe = xs + 1.15 * u;
  const p = person(spec.who, u, 0.8), st = stars(u, { r: 0.13, s: 0.07, n: 4 }), oops = label(u, 'わっ!', '#e07a3a', 0.13);
  const peel = solidProp([[G.capsule(0.025 * u, 0.1 * u, 0, 0.02 * u, 0, Math.PI / 2), 0xffd84a], [G.capsule(0.018 * u, 0.06 * u, -0.06 * u, 0.02 * u, 0.04 * u, 2.4), 0xf0c830], [G.capsule(0.018 * u, 0.06 * u, 0.06 * u, 0.02 * u, 0.04 * u, -2.4), 0xf0c830]], 0.5);
  group.add(p.group, peel, st, oops);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.0, 'linear'], roll: [1.2, 2.0, 'linear'], back: [5.6, 1.2, 'linear'] });
      // walk up, slip on the peel (it shoots off), tumble over and over, stand dizzy; then walk back to the start
      let x = lerp(xs, xp, T.walk), clip = 'Walk', ct = v * 0.9;
      if (pre) { clip = 'Idle'; ct = t; x = xs; }
      else if (v >= 1.0 && v < 1.2) { clip = 'Idle'; ct = 0.1; }
      else if (v >= 1.2 && v < 3.2) { clip = 'Roll'; ct = (v - 1.2) % 1.0; x = lerp(xp, xe, T.roll); }
      else if (v >= 3.2 && v < 5.6) { clip = 'Idle'; ct = t; x = xe; }
      else if (v >= 5.6) { x = lerp(xe, xs, T.back); }
      p.pose(clip, ct); p.group.position.set(x, floor, 0.05 * u); p.group.rotation.y = v >= 5.6 ? LEFT + 0.3 : RIGHT - 0.25;
      const dizzy = !pre && v >= 3.2 && v < 5.6 ? 1 : 0;
      p.turn('Head', 0, 0, 0.25 * dizzy * Math.sin(v * 4)); p.turn('Abdomen', 0, 0, 0.1 * dizzy * Math.sin(v * 4 + 1));
      // the peel: lies in his path, shoots off forward when he slips, comes back for the next loop
      const fly = pre ? 0 : between(v, 1.0, 1.6) * (1 - between(v, 6.6, 6.9));
      peel.position.set(xp + 0.08 * u + 0.6 * u * fly, floor + 0.25 * u * Math.sin(Math.PI * Math.min(1, fly * 1.2)), 0.12 * u); peel.rotation.z = 8 * fly; peel.visible = fly < 0.98;
      st.visible = dizzy > 0; p.at('over', W, 0, 0.05, 0); st.position.copy(group.worldToLocal(W)); st.rotation.y = v * 5;
      pop(oops, pre ? 0 : bump(v, 1.0, 0.9) * 1.2, xp, floor + 1.0 * u, 0.15 * u);
    },
  };
}

// ---- 味 ----
function taste(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, px = x0 + 0.42 * u;
  const p = person(spec.who, u), yum = label(u, 'うまい!', '#e07a3a', 0.13), bang = label(u, '!', '#e0a020', 0.2), steam = many(PUFF(u, 0xf4f4f4), 6, 0.5);
  const stove = solidProp([[G.box(0.36 * u, 0.4 * u, 0.3 * u, 0, 0.2 * u, 0), 0xd8dce4], [G.box(0.36 * u, 0.02 * u, 0.3 * u, 0, 0.41 * u, 0), 0x30343c], [G.cyl(0.12 * u, 0.1 * u, 0.14 * u, 0, 0.49 * u, 0), 0x8a94a4], [G.cyl(0.11 * u, 0.11 * u, 0.01 * u, 0, 0.555 * u, 0), 0xe0a040]], 0.4);
  const spoon = solidProp([[G.sphere(0.045 * u, 0, 0, 0, 1, 0.4, 1.3), 0xe0a050], [G.cyl(0.01 * u, 0.01 * u, 0.26 * u, 0, 0.0, -0.14 * u, Math.PI / 2), 0xe0a050]], 0.6);
  stove.position.set(px, floor, -0.05 * u);
  group.add(stove, p.group, spoon, steam, yum, bang);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { dip: [0.3, 0.6], up: [1.2, 0.6], taste: [1.8, 0.4], light: [2.6, 0.3, 'back'], rub: [3.2, 0.3], done: [5.4, 0.6] });
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.15 * u); p.group.rotation.y = RIGHT - 0.7;
      // the spoon goes into the pot, comes up to his mouth (bowl first), then down again while he rubs his belly
      const potTop = stove.localToWorld(W.set(0, 0.56 * u, 0)), mouth = p.at('mouth', W2, 0, -0.01, 0.06);
      const atPot = T.dip * (1 - T.up), atMouth = T.up * (1 - T.done);
      const rest = p.local(-0.15, 0.45, 0.3, new THREE.Vector3());
      const pos = rest.clone().lerp(potTop, atPot).lerp(mouth, atMouth);
      spoon.position.copy(group.worldToLocal(pos.clone())); spoon.rotation.set(0.2, p.group.rotation.y + Math.PI, 0, 'YXZ');
      p.handTo('R', pos.addScaledVector(axisOf(p, 0, 0, 1, W), -0.26 * u * group.getWorldScale(W2).y), pre ? A.setup : 1, { out: 0.6, down: 0.8 });
      p.turn('Head', 0.25 * atPot - 0.1 * T.light);
      const rub = T.rub * (1 - T.done);
      p.handTo('L', p.local(0.03 * Math.sin(v * 8), 0.45 + 0.03 * Math.cos(v * 8), 0.14, W), rub, { out: 0.5, down: 0.9 });
      wisps(steam, 0, 6, px, floor + 0.6 * u, pre ? 0 : v, u, { period: 1.6, rise: 0.4, size: 0.8, on: pre ? A.setup : 1 }); steam.commit();
      pop(bang, pre ? 0 : T.light * (1 - between(v, 3.2, 3.4)), x0, floor + 1.1 * u, 0.2 * u);
      pop(yum, rub, x0 - 0.05 * u, floor + 1.12 * u, 0.2 * u);
    },
  };
}

export const SCENES = { 'q-sing': sing, 'q-tumble': tumble, 'q-taste': taste };
