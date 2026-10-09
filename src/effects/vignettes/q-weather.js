// Model scenes, weather felt by a person (Step 3a model pass).
//   q-gust    風: a person leans into a gust, streaks and leaves flying past; his straw hat blows off and tumbles
//             away: ビュー!
//   q-clear   晴: grey clouds slide apart, the sun beams out, and the person below throws her arms up; outcome
//             rainbow: the rain stops, she closes her umbrella and a rainbow arcs over (晴れる)
//   q-rain    降る: a person walks along; rain starts to fall, he stops and pops open an umbrella
//   q-parasol 差す: a person in a kimono stands in the hot sun, fanning herself; she opens a parasol over her head:
//             shade, ほっ
//   q-cloudy  曇る: a person smiles in the sunshine; grey clouds drift over the sun, the light dims, and she looks
//             up, shoulders dropping
//   q-noon    昼: the sun climbs to the top of the sky over a person; a clock reads 12:00; he opens his lunchbox;
//             outcome eat: he eats from the lunchbox with chopsticks, もぐもぐ (昼ご飯)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, DROP } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp, hat as strawHat, veil } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, onHead } from './q-common.js';

const W = new THREE.Vector3();
const cloud = (u, c = 0x8a909c) => solidProp([[G.sphere(0.16 * u, 0, 0, 0, 1.5, 0.8, 0.7), c], [G.sphere(0.12 * u, -0.2 * u, -0.04 * u, 0, 1.2, 0.8, 0.7), c], [G.sphere(0.12 * u, 0.2 * u, -0.05 * u, 0, 1.2, 0.8, 0.7), c]], 0.4);
const sunDisc = (u) => solidProp([[G.sphere(0.13 * u), 0xffc030], ...Array.from({ length: 8 }, (_, i) => [G.box(0.03 * u, 0.09 * u, 0.01 * u, Math.cos(i * Math.PI / 4) * 0.21 * u, Math.sin(i * Math.PI / 4) * 0.21 * u, 0, i * Math.PI / 4 - Math.PI / 2), 0xffd860])], 1.3);
function rainFall(d, x0, w, top, floor, v, on, u, z = 0.05 * u) {
  for (let i = 0; i < d.count; i++) { const f = ((v * 1.1 + i * 0.37) % 1); d.set(i, x0 + (((i * 0.53) % 1) - 0.5) * w, top - (top - floor) * f, z + (((i * 0.71) % 1) - 0.5) * 0.4 * u, on ? 1 : 0); }
  d.commit();
}
// hold an umbrella (emblem) open over the head: k 0..1
function umbrellaUp(p, umb, group, u, k, v) {
  p.handTo('R', p.local(-0.08, 0.72, 0.15, W), k, { out: 0.6, down: 0.8 });
  umb.visible = k > 0.02; umb.scale.setScalar(0.5 * u * grow(k)); p.local(-0.05, 1.12, 0.1, W); umb.position.copy(group.worldToLocal(W)); umb.idle(v);
}

// ---- 風 ----
function gust(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), cap = strawHat(u), whoosh = label(u, 'ビュー!', '#3a7ac0', 0.13);
  const streaks = many([[G.box(0.3 * u, 0.012 * u, 0.012 * u, 0, 0, 0), 0xf0f8ff]], 8, 1.0), leaves = many([[G.sphere(0.04 * u, 0, 0, 0, 1, 0.4, 0.15), 0x58b040]], 6, 0.6);
  group.add(p.group, cap, streaks, leaves, whoosh);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { blow: [0.6, 0.3], off: [1.2, 1.6, 'linear'], calm: [4.6, 0.5], back: [5.6, 0.6] });
      const wind = T.blow * (1 - T.calm);
      // he faces the wind (from the right), leaning into it, an arm up to his face
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = RIGHT - 0.5;
      p.turn('Abdomen', 0.35 * wind); p.turn('Head', 0.2 * wind);
      p.handTo('R', p.at('eyes', W, -0.04, 0.02, 0.1), wind * (T.off > 0.2 ? 1 : 0), { out: 0.8, down: 0.5 });
      p.handTo('L', p.at('over', W, 0.0, -0.02, 0), wind * (1 - between(v, 1.1, 1.3)), { out: 0.6, down: 0.3 });
      // the hat sits on his head until the gust whips it off; it tumbles away left over the kanji; it is back for the next loop
      onHead(p, cap, group, 'over', 0, -0.07, 0); cap.rotation.x = 0;
      if (T.off > 0 && T.back < 1) { const f = T.off; cap.position.x -= 1.4 * u * f; cap.position.y += 0.3 * u * Math.sin(Math.PI * f) - 0.2 * u * f; cap.rotation.set(f * 9, 0, f * 6); cap.visible = f < 0.98; } else cap.visible = true;
      for (let i = 0; i < 8; i++) { const f = (((pre ? 0 : v) * 1.5 + i * 0.37) % 1); streaks.set(i, x0 + 1.0 * u - 2.0 * u * f, floor + (0.2 + 0.12 * i) * u, 0.15 * u - 0.05 * u * (i % 3), wind > 0.1 ? 1 : 0); }
      streaks.commit();
      for (let i = 0; i < 6; i++) { const f = (((pre ? 0 : v) * 0.9 + i / 6) % 1); leaves.set(i, x0 + 1.0 * u - 2.0 * u * f, floor + (0.3 + 0.15 * i) * u + 0.1 * u * Math.sin(f * 12), 0.1 * u, wind > 0.1 ? 1 : 0, f * 20, f * 7); }
      leaves.commit();
      pop(whoosh, wind, x0 + 0.5 * u, floor + 1.15 * u, 0.15 * u);
    },
  };
}

// ---- 晴 / 晴れる ----
function clear(ctx, spec, stage) {
  const rb = spec.outcome === 'rainbow', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, sy = floor + 1.25 * u;
  const p = person(spec.who, u), sun = sunDisc(u), c1 = cloud(u), c2 = cloud(u), yay = label(u, rb ? 'やんだ!' : 'はれた!', '#e07a3a', 0.13);
  const umb = rb ? emblemProp('umbrella', 0.5 * u, { color: '#3a8ae0' }) : null, bow = rb ? emblemProp('rainbow', 1.0 * u) : null, rain = rb ? many(DROP(u), 14, 0.8) : null;
  sun.position.set(x0 + 0.2 * u, sy, -0.4 * u);
  group.add(p.group, sun, c1, c2, yay, ...[umb, bow, rain].filter(Boolean));
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { part: [1.0, 1.2, 'out'], beam: [1.8, 0.6, 'back'], cheer: [2.2, 0.3], close: [5.6, 0.7] });
      const o = pre ? 0 : T.part * (1 - T.close);
      c1.position.set(x0 + 0.2 * u - 0.55 * u * o, sy, -0.25 * u); c2.position.set(x0 + 0.2 * u + 0.55 * u * o, sy + 0.04 * u, -0.22 * u);
      sun.scale.setScalar(grow(0.6 + 0.4 * T.beam * (1 - T.close)) * (1 + 0.05 * Math.sin(v * 4))); sun.rotation.z = v * 0.5;
      const cheer = !pre && v > 2.2 && v < 5.4;
      p.pose(cheer ? 'Victory' : 'Idle', cheer ? 0.4 + 0.2 * Math.sin((v - 2.2) * 3) : t, !cheer); p.group.position.set(x0, floor, 0.1 * u); p.group.rotation.y = -0.2;
      if (rb) {
        // under her umbrella in the rain until it stops; she closes it; a rainbow rises behind
        rainFall(rain, x0 + 0.2 * u, 1.4 * u, sy, floor, pre ? 0 : v, pre || v < 1.2 || v > 6.0, u);
        umbrellaUp(p, umb, group, u, pre ? 1 : 1 - between(v, 1.6, 2.1) + between(v, 5.8, 6.3), v);
        bow.visible = !pre && T.beam > 0.05 && T.close < 0.95; bow.scale.setScalar(1.0 * u * grow(T.beam * (1 - T.close))); bow.position.set(x0 + 0.3 * u, floor + 0.6 * u, -0.6 * u);
      }
      pop(yay, cheer ? 1 : 0, x0 + 0.35 * u, floor + 0.95 * u, 0.2 * u);
    },
  };
}

// ---- 降る ----
function rain(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.2 * u, xe = xs + 0.6 * u;
  const p = person(spec.who, u), drops = many(DROP(u), 20, 0.8), umb = emblemProp('umbrella', 0.5 * u, { color: '#e0a020' }), c = cloud(u, 0x6a707c), ah = label(u, 'あめだ!', '#3a7ac0', 0.13);
  c.position.set(xe, floor + 1.4 * u, -0.3 * u); c.scale.setScalar(1.4);
  group.add(p.group, drops, umb, c, ah);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.1, 1.4, 'linear'], open: [2.4, 0.4, 'back'], close: [5.6, 0.5] });
      const walking = !pre && T.walk > 0 && T.walk < 1, raining = !pre && v > 1.2 && v < 5.8;
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t); p.group.position.set(lerp(xs, xe, pre ? 1 : T.walk), floor, 0.1 * u); p.group.rotation.y = walking ? RIGHT : -0.2;
      // a drop on the head: he looks up, holds out a hand, then pops the umbrella open
      const look = pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 2.4, 2.6));
      p.turn('Head', -0.4 * look); p.handTo('L', p.local(0.25, 0.6, 0.25, W), look, { out: 0.7, down: 0.8 });
      umbrellaUp(p, umb, group, u, T.open * (1 - T.close), v);
      rainFall(drops, xe, 1.6 * u, floor + 1.3 * u, floor, pre ? 0 : v, raining, u);
      pop(ah, look, xe + 0.3 * u, floor + 1.05 * u, 0.2 * u);
    },
  };
}

// ---- 差す ----
function parasol(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), sun = sunDisc(u), umb = emblemProp('umbrella', 0.5 * u, { color: '#d04870' }), hot = label(u, 'あつい…', '#e05a2a', 0.12), ah = label(u, 'ほっ', '#3a8a5a', 0.13);
  const shade = solidProp([[G.cyl(0.3 * u, 0.3 * u, 0.005 * u, 0, 0, 0, 0, 0, 0, 24), 0x203040]], 0.0);
  shade.material.transparent = true; shade.material.opacity = 0.35; shade.material.depthWrite = false;
  sun.position.set(x0 + 0.5 * u, floor + 1.35 * u, -0.4 * u);
  group.add(sun, p.group, umb, shade, hot, ah);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [2.0, 0.5, 'back'], close: [5.6, 0.6] }), o = T.open * (1 - T.close);
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.3;
      sun.rotation.z = v * 0.4; sun.scale.setScalar(1 + 0.08 * Math.sin(v * 5));
      // hot: she fans her face with a hand; then the parasol opens and its shade falls on her
      const fan = pre ? 0 : between(v, 0.3, 0.6) * (1 - T.open);
      p.handTo('L', p.at('mouth', W, 0.08, 0.02 + 0.03 * Math.sin(v * 14), 0.08), fan, { out: 0.7, down: 0.6 });
      umbrellaUp(p, umb, group, u, o, v);
      shade.position.set(x0, floor + 0.003 * u, 0.1 * u); shade.scale.setScalar(grow(o));
      pop(hot, fan, x0 + 0.3 * u, floor + 1.1 * u, 0.15 * u); pop(ah, pre ? 0 : between(v, 2.6, 2.9) * (1 - between(v, 5.2, 5.5)), x0 + 0.35 * u, floor + 0.85 * u, 0.2 * u);
    },
  };
}

// ---- 曇る ----
function cloudy(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, sy = floor + 1.3 * u;
  const p = person(spec.who, u), sun = sunDisc(u), cs = [cloud(u), cloud(u, 0x7a808c), cloud(u, 0x9aa0aa)], dim = veil(6 * u, 4 * u), oh = label(u, 'あ…', '#6a6a7a', 0.13);
  sun.position.set(x0 + 0.3 * u, sy, -0.5 * u); dim.position.set(x0, floor + 0.8 * u, 0.5 * u);
  group.add(sun, ...cs, p.group, dim, oh);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const f = pre ? 0 : between(v, 0.8, 3.0) * (1 - between(v, 6.0, 6.9));
      // the clouds drift in from the right and cover the sun; the scene darkens
      cs.forEach((c, i) => { c.position.set(x0 + 0.3 * u + (1.5 + 0.4 * i) * u * (1 - f) + (i - 1) * 0.25 * u, sy + (i - 1) * 0.06 * u, -0.35 * u + 0.03 * u * i); c.scale.setScalar(1.3); });
      dim.material.opacity = 0.35 * f;
      sun.scale.setScalar(1 + 0.05 * Math.sin(v * 3)); sun.rotation.z = v * 0.4;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.2;
      // in the sun she stands with her arms open; when it goes she looks up and droops
      const sunny = 1 - f, look = pre ? 0 : between(v, 2.8, 3.2) * (1 - between(v, 6.0, 6.6));
      p.handTo('R', p.local(-0.35, 0.75, 0.1, W), sunny * (pre ? 1 : between(v, 0.1, 0.4)), { out: 0.9, down: 0.4 }); p.handTo('L', p.local(0.35, 0.75, 0.1, W), sunny * (pre ? 1 : between(v, 0.1, 0.4)), { out: 0.9, down: 0.4 });
      p.turn('Head', -0.35 * look, 0.2 * look); p.turn('Torso', 0.15 * look);
      pop(oh, look, x0 + 0.25 * u, floor + 1.05 * u, 0.2 * u);
    },
  };
}

// ---- 昼 / 昼ご飯 ----
function noon(ctx, spec, stage) {
  const eat = spec.outcome === 'eat', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u, 0.8), sun = sunDisc(u), clock = emblemProp('clock', 0.3 * u), mog = label(u, 'もぐもぐ', '#e07a3a', 0.12);
  const box = solidProp([[G.box(0.2 * u, 0.06 * u, 0.13 * u, 0, 0, 0), 0x3a3a44], [G.box(0.18 * u, 0.012 * u, 0.11 * u, 0, 0.03 * u, 0), 0xfaf8f0], [G.sphere(0.022 * u, 0.04 * u, 0.04 * u, 0), 0xe04848], [G.box(0.05 * u, 0.02 * u, 0.04 * u, -0.05 * u, 0.04 * u, 0), 0xf0c020], [G.sphere(0.02 * u, 0.0, 0.04 * u, 0.03 * u), 0x48b040]], 0.5);
  const lid = solidProp([[G.box(0.21 * u, 0.012 * u, 0.14 * u, 0.105 * u, 0, 0), 0xc03a3a]], 0.5), sticks = solidProp([[G.cyl(0.004 * u, 0.004 * u, 0.16 * u, 0, 0.08 * u, 0), 0x8a3a20], [G.cyl(0.004 * u, 0.004 * u, 0.16 * u, 0.012 * u, 0.08 * u, 0), 0x8a3a20]], 0.5);
  clock.position.set(x0 + 0.65 * u, floor + 0.8 * u, -0.2 * u);
  group.add(p.group, sun, clock, box, lid, sticks, mog);
  const loop = 6.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { climb: [0.1, 1.8, 'out'], open: [2.6, 0.4], set: [6.2, 0.5] });
      // the sun arcs up from the right to straight overhead; the clock's hands come round to 12
      const c = pre ? 1 : T.climb * (1 - T.set);
      sun.position.set(x0 + 0.9 * u * Math.cos(Math.PI / 2 * c) + 0.05 * u, floor + 0.55 * u + 0.85 * u * Math.sin(Math.PI / 2 * c), -0.4 * u); sun.rotation.z = v * 0.4;
      clock.idle(pre ? 0 : 3.0 * Math.min(1, c));
      p.pose('SitDown', 1.0, false); p.group.position.set(x0, floor, 0.1 * u); p.group.rotation.y = -0.3;
      p.turn('Head', -0.45 * c * (1 - T.open) + (eat ? 0.25 : 0.15) * T.open);
      // the lunchbox on his lap; the lid swings open; (eat) the chopsticks go box to mouth
      p.at('lap', W, 0, 0.04, 0.12); box.position.copy(group.worldToLocal(W)); box.rotation.y = p.group.rotation.y;
      p.handTo('L', p.local(0.14, 0.27, 0.2, W), pre ? A.setup : 1, { out: 0.7, down: 0.7 });
      const yaw = p.group.rotation.y; lid.position.set(box.position.x - 0.105 * u * Math.cos(yaw), box.position.y + 0.035 * u, box.position.z + 0.105 * u * Math.sin(yaw));
      lid.rotation.set(0, p.group.rotation.y, 2.6 * T.open);
      const bite = eat && !pre ? Math.max(0, Math.sin((v - 3.0) * 2.6)) * between(v, 3.0, 3.3) * (1 - between(v, 5.8, 6.1)) : 0;
      const tip = box.getWorldPosition(new THREE.Vector3()).lerp(p.at('mouth', W, 0, -0.01, 0.05), bite);
      sticks.visible = eat; sticks.position.copy(group.worldToLocal(tip.clone())); sticks.rotation.set(0.6, p.group.rotation.y, 0.2);
      if (eat) p.handTo('R', tip.add(W.set(0, 0.1 * u * group.getWorldScale(W).y, 0)), pre ? 0 : T.open, { out: 0.7, down: 0.7 });
      pop(mog, eat && bite > 0.6 ? 1 : 0, x0 + 0.3 * u, floor + 0.85 * u, 0.2 * u);
    },
  };
}

export const SCENES = { 'q-gust': gust, 'q-clear': clear, 'q-rain': rain, 'q-parasol': parasol, 'q-cloudy': cloudy, 'q-noon': noon };
