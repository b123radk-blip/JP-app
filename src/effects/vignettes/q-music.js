// Model scenes, music and manners (Step 3a model pass, batch 4).
//   q-piano-lesson 習う: a grandma at a keyboard plays three coloured notes; a little girl at a toy keyboard watches, then
//                  plays the same three notes; grandma nods: じょうず!
//   q-drum-fun     楽: a small boy beats a taiko drum, left, right, left ...; the kanji squashes on every beat and notes
//                  fly up; he throws both sticks up and cheers: たのしい!
//   q-headphones-dance 音楽: a girl in big headphones dances (bounces, pumps her arms, sways); colourful notes pour out
//   q-bell-ring    音: a bell swings in its frame and rings (rings of sound); a grandpa turns toward it and cups his ear: ♪
//   q-gift-bow     御: a woman in a kimono holds a wrapped gift out with both hands and bows deeply: どうぞ; the kanji
//                  bows back and sparkles
//   q-devil-vase   悪: a little red devil sneaks up and knocks a vase off its stand; it smashes; he snickers; a person comes
//                  in, sees it (!) and crosses her arms in a big X: だめ!; outcome thumbsdown: she points a big thumbs
//                  down at him and a rain cloud drizzles on him: わるい! (悪い)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many, stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { between, poseGlyph } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, TEEN, speech, say } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
const Q = new THREE.Quaternion(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), M4 = new THREE.Matrix4();
const NOTE_C = [0xff4a5a, 0xffd030, 0x3a8aff, 0x50d070];
// a music note (white: tinted per copy); many(NOTE(u), n) then setColorAt
export const NOTE = (u, s = 1) => [[G.sphere(0.04 * u * s, 0, 0, 0, 1.3, 1, 0.6), 0xffffff], [G.box(0.012 * u * s, 0.13 * u * s, 0.012 * u * s, 0.047 * u * s, 0.065 * u * s, 0), 0xffffff], [G.box(0.05 * u * s, 0.014 * u * s, 0.012 * u * s, 0.068 * u * s, 0.125 * u * s, 0, -0.4), 0xffffff]];
export const tint = (m, cols) => { for (let i = 0; i < m.count; i++) m.setColorAt(i, new THREE.Color(cols[i % cols.length])); m.instanceColor.needsUpdate = true; };

// a prop worn on the head (headphones, a crown): origin between the ears, turned with the head; lift: up from there
export function wear(a, prop, space, lift = 0) {
  const l = space.worldToLocal(a.at('earL', new THREE.Vector3())), r = space.worldToLocal(a.at('earR', new THREE.Vector3())), o = space.worldToLocal(a.at('over', new THREE.Vector3()));
  const mid = l.clone().add(r).multiplyScalar(0.5);
  X.copy(l).sub(r).normalize(); Y.copy(o).sub(mid); Y.addScaledVector(X, -Y.dot(X)).normalize(); Z.crossVectors(X, Y);
  prop.quaternion.setFromRotationMatrix(M4.makeBasis(X, Y, Z)); prop.position.copy(mid).addScaledVector(Y, lift);
}
// a stick held in the palm whose tip touches `tip` (world): the hand comes in from `dir` (actor frame), the stick runs
// from the palm to the tip; the stick's geometry lies along +z from its origin
function stickTo(a, side, stick, space, tip, dir, len, k) {
  const d = a.local(dir[0], dir[1], dir[2], W3).sub(a.local(0, 0, 0, W2)).normalize();
  a.handTo(side, tip.clone().addScaledVector(d, len), k, { out: 0.7, down: 0.7 });
  a.hold(stick, side, space, 0.01 * len);
  stick.lookAt(tip);
}
const drumStick = (u, len) => solidProp([[G.cyl(0.011 * u, 0.014 * u, len, 0, 0, len / 2, Math.PI / 2), 0xe8c890], [G.sphere(0.022 * u, 0, 0, len), 0xd04040]], 0.5);

// a keyboard on legs: w wide, its keys h up; three coloured keys (red, yellow, blue) at keyX(i)
function keyboard(u, w, color, h) {
  const g = new THREE.Group(), KW = w / 14;
  const keys = [];
  for (let i = 0; i < 14; i++) keys.push([G.box(KW * 0.9 * u, 0.02 * u, 0.1 * u, (-w / 2 + KW * (i + 0.5)) * u, h * u + 0.035 * u, 0.04 * u), [3, 7, 11].includes(i) ? NOTE_C[[3, 7, 11].indexOf(i)] : 0xfafafa]);
  for (let i = 0; i < 13; i++) if (i % 7 !== 2 && i % 7 !== 6) keys.push([G.box(KW * 0.5 * u, 0.025 * u, 0.06 * u, (-w / 2 + KW * (i + 1)) * u, h * u + 0.045 * u, 0.02 * u), 0x18181c]);
  const body = solidProp([[G.box(w * u + 0.04 * u, 0.05 * u, 0.16 * u, 0, h * u, 0), color], [G.box(w * u + 0.04 * u, 0.06 * u, 0.03 * u, 0, h * u + 0.04 * u, -0.07 * u), color],
    [G.box(0.03 * u, h * u, 0.03 * u, (-w / 2 + 0.03) * u, h * u / 2, 0), 0x404048], [G.box(0.03 * u, h * u, 0.03 * u, (w / 2 - 0.03) * u, h * u / 2, 0), 0x404048], ...keys], 0.45);
  g.add(body);
  return { group: g, keyX: (i) => (-w / 2 + KW * ([3, 7, 11][i] + 0.5)) * u, top: h * u + 0.045 * u, front: 0.06 * u };
}
// a hand playing keys `kb` at times `at` (one key each, in order); returns the hand target in kb's frame and the hit amount
function playing(kb, at, v) {
  let i = 0; while (i < at.length - 1 && v > at[i] + 0.3) i++;
  const move = i > 0 ? between(v, at[i - 1] + 0.2, at[i] - 0.1) : 1, x = lerp(kb.keyX(Math.max(0, i - 1)), kb.keyX(i), move);
  const hit = at.reduce((s, b) => s + bump(v, b - 0.12, 0.3), 0);
  return { x, hit };
}

// ---- 習う ----
function piano(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.45 * u, kx = gx + 0.85 * u;
  const T = person(spec.who, u), kid = person(spec.kid, u, KID + 0.12), big = keyboard(u, 0.56, 0x23232c, 0.26), small = keyboard(u, 0.36, 0xe04a8a, 0.22);
  const stool = solidProp([[G.cyl(0.1 * u, 0.1 * u, 0.03 * u, 0, 0.1 * u, 0), 0x8a5a30], [G.cyl(0.015 * u, 0.015 * u, 0.1 * u, 0, 0.05 * u, 0), 0x6a4020]], 0.35);
  const notes = many(NOTE(u), 6, 0.9), praise = speech(u, 'じょうず!', { h: 0.15 });
  tint(notes, [...NOTE_C.slice(0, 3), ...NOTE_C.slice(0, 3)]);
  stool.position.set(gx, floor, -0.08 * u); big.group.position.set(gx + 0.02 * u, floor, 0.2 * u); small.group.position.set(kx, floor, 0.17 * u);
  group.add(stool, T.group, kid.group, big.group, small.group, notes, praise);
  const loop = 7.4, T1 = [0.6, 1.2, 1.8], T2 = [3.0, 3.6, 4.2];
  const keyW = (kb, x, y) => group.localToWorld(W.set(kb.group.position.x + x, floor + kb.top + y, kb.group.position.z + 0.02 * u));
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      T.pose('SitDown', 1.0, false); T.group.position.set(gx, floor + 0.02 * u, -0.08 * u); T.group.rotation.y = 0.25;
      kid.pose('Idle', t); kid.group.position.set(kx, floor, -0.02 * u);
      // grandma plays three keys (red, yellow, blue); the girl watches her hands
      const ta = pre ? 0 : between(v, 0.1, 0.4) * (1 - between(v, 2.3, 2.7)), pa = playing(big, T1, v);
      T.handTo('R', keyW(big, pa.x, 0.07 * u * (1 - pa.hit)), ta, { out: 0.6, down: 0.9 });
      T.turn('Head', 0.3 * ta);
      const watch = pre ? 0 : between(v, 0.3, 0.6) * (1 - between(v, 2.4, 2.7));
      kid.group.rotation.y = -0.1 - 0.35 * watch; kid.turn('Head', 0.15 * watch, -0.5 * watch);
      // then she plays the same three keys on her toy keyboard
      const ka = pre ? 0 : between(v, 2.5, 2.8) * (1 - between(v, 4.6, 5.0)), pk = playing(small, T2, v);
      kid.handTo('R', keyW(small, pk.x, 0.06 * u * (1 - pk.hit)), ka, { out: 0.6, down: 0.9 });
      kid.turn('Head', 0.35 * ka);
      for (const [i0, at, kb, p] of [[0, T1, big, 0.5], [3, T2, small, 0.4]]) at.forEach((b, i) => {
        const f = pre ? -1 : between(v, b, b + 1.3);
        notes.set(i0 + i, kb.group.position.x + kb.keyX(i) + 0.08 * u * f, floor + kb.top + 0.08 * u + p * u * f, kb.group.position.z, f > 0 && f < 1 ? 1.2 * Math.sin(Math.PI * Math.min(1, f * 1.4)) + 0.2 : 0, 0.3 * Math.sin(f * 6));
      });
      notes.commit();
      // grandma nods: well done
      const ok = pre ? 0 : between(v, 4.7, 5.0) * (1 - between(v, 6.6, 7.0));
      T.nod(ok, v);
      say(praise, ok, gx + 0.42 * u, floor + 0.8 * u, 0.25 * u);
      kid.group.position.y = floor + 0.05 * u * Math.abs(Math.sin((v - 5.0) * 6)) * between(v, 5.0, 5.2) * (1 - between(v, 6.0, 6.2));
    },
  };
}

// ---- 楽 ----
function drum(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.42 * u, H = 0.24 * u, R = 0.14 * u;
  const kid = person(spec.who, u, KID + 0.17), sticks = [drumStick(u, 0.24 * u), drumStick(u, 0.24 * u)], notes = many(NOTE(u, 1.1), 6, 0.9), fun = label(u, 'たのしい!', '#e0702a', 0.15);
  tint(notes, NOTE_C);
  const taiko = solidProp([[G.cyl(R, R, 0.2 * u, 0, H - 0.1 * u, 0), 0xb0402a], [G.cyl(R * 1.04, R * 1.04, 0.02 * u, 0, H, 0), 0xf4e8d0], [G.cyl(R * 1.04, R * 1.04, 0.02 * u, 0, H - 0.2 * u, 0), 0xf4e8d0],
    [G.torus(R * 1.03, 0.008 * u, Math.PI * 2, 0, H - 0.1 * u, 0), 0xffd040], [G.box(0.03 * u, H - 0.18 * u, 0.03 * u, -R * 0.7, (H - 0.2 * u) / 2, 0.0), 0x6a4020], [G.box(0.03 * u, H - 0.18 * u, 0.03 * u, R * 0.7, (H - 0.2 * u) / 2, 0.0), 0x6a4020]], 0.4);
  // the drum skin faces up; the barrel's rings lie round it (the cylinder stands)
  taiko.position.set(kx - 0.02 * u, floor, 0.2 * u);
  group.add(kid.group, taiko, ...sticks, notes, fun);
  const beat = 0.42, beats = 8, loop = beat * beats + 2.2, skin = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, drumming = !pre && v < beat * beats;
      kid.pose('Idle', t); kid.group.position.set(kx, floor, -0.02 * u); kid.group.rotation.y = -0.25;
      // right, left, right ...: each stick comes down on the drum skin in turn
      const ph = drumming ? v / beat : 0, hitR = drumming ? Math.pow(Math.max(0, Math.cos(Math.PI * ph)), 2) : 0, hitL = drumming ? Math.pow(Math.max(0, -Math.cos(Math.PI * ph)), 2) : 0;
      const cheer = pre ? 0 : between(v, beat * beats + 0.1, beat * beats + 0.4) * (1 - between(v, loop - 0.5, loop - 0.1));
      for (const [i, side, hit, dx] of [[0, 'R', hitR, -0.05], [1, 'L', hitL, 0.05]]) {
        group.localToWorld(skin.set(taiko.position.x + dx * u, floor + H + 0.02 * u + 0.16 * u * (1 - hit), taiko.position.z - 0.02 * u));
        if (cheer > 0) { const up = kid.local(i ? 0.24 : -0.24, 1.15, 0.05, new THREE.Vector3()); skin.lerp(up, cheer); }
        stickTo(kid, side, sticks[i], group, skin, [i ? 0.2 : -0.2, 0.35 + 0.3 * cheer, -0.9 + 0.6 * cheer], 0.2 * u * group.getWorldScale(W).y, 1);
      }
      kid.turn('Head', 0.15 * (1 - cheer), 0, 0.12 * Math.sin(ph * Math.PI) * (drumming ? 1 : 0));
      kid.group.position.y = floor + 0.04 * u * cheer * Math.abs(Math.sin((v - beat * beats) * 5));
      // the kanji squashes on every beat
      const sq = drumming ? Math.pow(Math.max(0, Math.cos(Math.PI * (ph % 1))), 6) : 0;
      poseGlyph(stage, 0, 0, 0, B.cx, B.minY, 1); stage.glyph.scale.set(1 + 0.05 * sq, 1 - 0.08 * sq, 1);
      for (let i = 0; i < 6; i++) {
        const f = pre ? -1 : between(v, i * beat * 1.2 + 0.2, i * beat * 1.2 + 1.6);
        notes.set(i, lerp(kx, B.cx + 0.25 * u * Math.sin(i * 2.1), f), floor + H + 0.15 * u + 0.75 * u * f, 0.12 * u, f > 0 && f < 1 ? 1.2 * Math.sin(Math.PI * f) : 0, 0.3 * Math.sin(f * 8 + i));
      }
      notes.commit();
      pop(fun, cheer, kx + 0.1 * u, floor + 0.98 * u, 0.2 * u);
    },
  };
}

// ---- 音楽 ----
function dance(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const p = person(spec.who, u, TEEN + 0.1), hh = p.h, notes = many(NOTE(u), 10, 0.9);
  tint(notes, NOTE_C);
  const phones = solidProp([[G.torus(0.25 * hh, 0.025 * hh, Math.PI, 0, 0.0, 0), 0x2a2a34], [G.cyl(0.085 * hh, 0.085 * hh, 0.07 * hh, 0.25 * hh, 0, 0, 0, 0, Math.PI / 2), 0xff3a6a], [G.cyl(0.085 * hh, 0.085 * hh, 0.07 * hh, -0.25 * hh, 0, 0, 0, 0, Math.PI / 2), 0xff3a6a],
    [G.cyl(0.06 * hh, 0.06 * hh, 0.075 * hh, 0.25 * hh, 0, 0, 0, 0, Math.PI / 2), 0xffe040], [G.cyl(0.06 * hh, 0.06 * hh, 0.075 * hh, -0.25 * hh, 0, 0, 0, 0, Math.PI / 2), 0xffe040]], 0.6);
  group.add(p.group, phones, notes);
  const loop = 4.8, BEAT = 0.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, on = pre ? 0 : between(v, 0, 0.3) * (1 - between(v, loop - 0.3, loop));
      const b = Math.sin(v * Math.PI * 2 / BEAT), half = Math.sin(v * Math.PI / BEAT);
      p.pose('Idle', t);
      p.group.position.set(px, floor + 0.04 * u * on * Math.abs(b), 0.1 * u); p.group.rotation.y = -0.2 + 0.4 * on * half;
      // she bounces on the beat, sways her hips and pumps one arm up, then the other; her head bobs
      p.turn('Hips', 0, 0, 0.1 * on * half); p.turn('Torso', 0, 0, -0.12 * on * half);
      const up = Math.max(0, half), dn = Math.max(0, -half);
      p.handTo('R', p.local(-0.24, 1.05, 0.06, W), on * up, { out: 0.9, down: 0.4 }); p.handTo('L', p.local(0.24, 1.05, 0.06, W), on * dn, { out: 0.9, down: 0.4 });
      p.handTo('R', p.local(-0.18, 0.5, 0.2, W), on * dn * 0.8, { out: 0.7, down: 0.9 }); p.handTo('L', p.local(0.18, 0.5, 0.2, W), on * up * 0.8, { out: 0.7, down: 0.9 });
      p.turn('Head', 0.18 * on * Math.max(0, b), 0, 0.15 * on * half);
      wear(p, phones, group);
      phones.scale.setScalar(1 + 0.06 * on * Math.max(0, b));
      // notes pour out of the headphones, both sides
      for (let i = 0; i < 10; i++) {
        const f = (((pre ? 0 : v) * 0.45 + i / 10) % 1), s = i % 2 ? 1 : -1;
        notes.set(i, px + s * (0.2 + 0.35 * f) * u, floor + p.h * 0.85 + 0.45 * u * f, 0.1 * u + 0.1 * u * Math.sin(i), pre ? 0 : 1.1 * Math.sin(Math.PI * f), 0.4 * Math.sin(f * 8 + i));
      }
      notes.commit();
    },
  };
}

// ---- 音 ----
function bell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.38 * u, top = floor + 1.0 * u, px = bx + 0.62 * u;
  const p = person(spec.who, u), note = label(u, '♪', '#3a8a5a', 0.18), gong = label(u, 'カーン', '#c08a20', 0.13);
  const frame = solidProp([[G.box(0.04 * u, 1.0 * u, 0.04 * u, -0.2 * u, 0.5 * u, 0), 0x8a3a2a], [G.box(0.04 * u, 1.0 * u, 0.04 * u, 0.2 * u, 0.5 * u, 0), 0x8a3a2a], [G.box(0.56 * u, 0.05 * u, 0.07 * u, 0, 1.0 * u, 0), 0x2a1a14], [G.box(0.46 * u, 0.035 * u, 0.05 * u, 0, 0.9 * u, 0), 0x8a3a2a], [G.cyl(0.004 * u, 0.004 * u, 0.06 * u, 0, 0.95 * u, 0), 0x404040]], 0.35);
  frame.position.set(bx, floor, -0.05 * u);
  const hang = new THREE.Group(), b = createModel('bell', { height: 0.34 * u });
  b.group.position.y = -0.36 * u; hang.add(b.group); hang.position.set(bx, top - 0.08 * u, -0.05 * u);
  const rings = many([[G.torus(0.1 * u, 0.012 * u, Math.PI * 0.7, 0, 0, 0, -Math.PI * 0.35), 0xffe070]], 5, 0.9);
  group.add(frame, hang, rings, p.group, note, gong);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { turn: [1.0, 0.6], back: [5.0, 0.6] });
      const ring = !pre && v > 0.3 && v < 3.8, swing = ring ? Math.sin((v - 0.3) * Math.PI * 2 / 1.1) * (1 - between(v, 2.6, 3.8)) : 0;
      hang.rotation.z = 0.45 * swing;

      // he stands looking away; at the ring he turns to the bell and cups an ear toward it, then nods happily
      const k = T.turn * (1 - T.back);
      p.pose('Idle', t); p.group.position.set(px, floor, 0.12 * u); p.group.rotation.y = lerp(RIGHT + 0.2, 0.15, k);
      p.cupEar('R', pre ? 0 : between(v, 1.4, 1.8) * (1 - between(v, 4.4, 4.8)));
      // rings of sound travel from the bell to his ear
      const ear = group.worldToLocal(p.at('earR', W, -0.06, 0, 0));
      for (let i = 0; i < 5; i++) { const f = ring ? (((v - 0.3) * 0.9 + i / 5) % 1) : 0, x = lerp(bx + 0.1 * u, ear.x - 0.02 * u, f); rings.set(i, x, lerp(top - 0.3 * u, ear.y, f), lerp(-0.05 * u, ear.z, f), f > 0.02 ? (0.7 + 0.6 * f) * Math.min(1, 4 * (1 - f)) * (1 - between(v, 3.2, 3.8)) : 0); }
      rings.commit();
      p.nod(pre ? 0 : between(v, 3.0, 3.2) * (1 - between(v, 4.2, 4.4)), v);
      pop(gong, pre ? 0 : between(v, 0.4, 0.6) * (1 - between(v, 2.4, 2.7)), bx + 0.05 * u, top + 0.15 * u, 0.1 * u);
      pop(note, pre ? 0 : between(v, 2.9, 3.2) * (1 - between(v, 4.6, 4.9)), px, floor + 1.08 * u, 0.15 * u);
    },
  };
}

// ---- 御 ----
function gift(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.55 * u, S = 0.17 * u;
  const p = person(spec.who, u), please = speech(u, 'どうぞ', { h: 0.15 }), sparkle = stars(u, { r: 0.42, s: 0.09, n: 5, color: 0xfff0a0 });
  const box = solidProp([[G.box(S * 1.3, S * 0.75, S, 0, 0, 0), 0xe03a4a], [G.box(S * 1.32, S * 0.77, 0.03 * u, 0, 0, 0), 0xffd040], [G.box(0.03 * u, S * 0.77, S * 1.02, 0, 0, 0), 0xffd040],
    [G.torus(0.035 * u, 0.012 * u, Math.PI * 2, -0.03 * u, S * 0.42, 0, 0.5), 0xffd040], [G.torus(0.035 * u, 0.012 * u, Math.PI * 2, 0.03 * u, S * 0.42, 0, -0.5), 0xffd040]], 0.5);
  sparkle.position.set(B.cx, B.cy, 0);
  group.add(p.group, box, please, sparkle);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.2, 0.6], bow: [1.0, 0.8], nod: [1.9, 0.5], up: [3.6, 0.7], nodUp: [3.7, 0.5], back: [5.2, 0.6] });
      const out = pre ? 0.3 * A.setup : T.out * (1 - T.back), bow = T.bow * (1 - T.up);
      p.pose('Idle', t); p.group.position.set(px, floor, 0.1 * u); p.group.rotation.y = LEFT + 0.75;
      p.bow(1.1 * bow);
      // the gift is held out in front of her with both hands, palms against its sides; it dips with the bow
      const c = p.local(0, lerp(0.42, 0.5, out) - 0.12 * bow, lerp(0.2, 0.36, out) + 0.04 * bow, W2), sc = group.getWorldScale(W).y, r = S * 0.65 * sc;
      const side = p.local(1, 0, 0, W3).sub(p.local(0, 0, 0, W)).normalize();
      p.grip('R', c, side, r, 1, { out: 0.8, down: 0.6 }); p.grip('L', c, side.clone().negate(), r, 1, { out: 0.8, down: 0.6 });
      box.position.copy(group.worldToLocal(c.clone())); box.rotation.set(0.5 * bow, p.group.rotation.y, 0, 'YXZ');
      say(please, pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 3.4, 3.7)), px + 0.15 * u, floor + 1.05 * u, 0.15 * u);
      // the kanji bows back and sparkles
      const nod = pre ? 0 : T.nod - T.nodUp; poseGlyph(stage, 0, 0, -0.18 * nod, B.cx, B.minY);
      const sp = pre ? 0 : bump(v, 2.0, 1.8); sparkle.visible = sp > 0; sparkle.scale.setScalar(grow(sp)); sparkle.rotation.y = t;
    },
  };
}

// ---- 悪 / 悪い ----
function devil(ctx, spec, stage) {
  const td = spec.outcome === 'thumbsdown', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.32 * u, SH = 0.36 * u, RED = 0xff3a30, px = sx + 0.95 * u;
  const stand = solidProp([[G.box(0.2 * u, 0.03 * u, 0.2 * u, 0, SH, 0), 0xb07a48], [G.cyl(0.03 * u, 0.04 * u, SH, 0, SH / 2, 0), 0x8a5a30]], 0.35); stand.position.set(sx, floor, 0);
  const vase = solidProp([[new THREE.LatheGeometry([[0, 0], [0.04, 0], [0.065, 0.06], [0.045, 0.15], [0.03, 0.18], [0.04, 0.2]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 20), 0x40c8c8]], 0.5);
  const shards = many([[G.box(0.03 * u, 0.03 * u, 0.01 * u, 0, 0, 0), 0x40c8c8]], 8, 0.5);
  const imp = createPerson({ u: 0.55 * u, shirt: RED, pants: RED, skin: 0xff5a4a, hair: 0x2a1010, glow: 0.6 }), horns = solidProp([[G.cone(0.015 * u, 0.05 * u, -0.04 * u, 0.02 * u, 0, 0.3), 0xffffff], [G.cone(0.015 * u, 0.05 * u, 0.04 * u, 0.02 * u, 0, -0.3), 0xffffff]], 0.5), tail = solidProp([[G.tube([[0, 0], [0.05 * u, -0.03 * u], [0.1 * u, 0.02 * u], [0.12 * u, 0.06 * u]], 0.008 * u), RED], [G.cone(0.02 * u, 0.04 * u, 0.13 * u, 0.08 * u, 0, -0.5), RED]], 0.5);
  imp.rig.attach('head', horns, 0.9); const tp = imp.rig.attach('body', tail, 0.1); tp.position.z = -0.05 * u; tp.rotation.y = Math.PI / 2;
  const p = person(spec.who, u), no = label(u, td ? 'わるい!' : 'だめ!', '#c02a2a', 0.15), bang = label(u, '!', '#e0a020', 0.2);
  const extra = td ? { hand: createHand({ u: 0.32 * u, side: -1, sleeve: 0xffd040, arm: 0.45 }), cloud: solidProp([[G.sphere(0.1 * u, 0, 0, 0, 1.4, 0.8, 0.8), 0x7a8090], [G.sphere(0.07 * u, -0.1 * u, -0.02 * u, 0), 0x6a7080], [G.sphere(0.07 * u, 0.1 * u, -0.02 * u, 0), 0x6a7080]], 0.4), rain: many([[G.sphere(0.01 * u, 0, 0, 0, 0.6, 2.4, 0.6), 0x8ad0ff]], 6, 0.7) } : null;
  if (extra) { extra.hand.pose('thumbs'); group.add(extra.hand.group, extra.cloud, extra.rain); }
  group.add(stand, vase, shards, imp.group, p.group, no, bang);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { sneak: [0.2, 1.0], fall: [1.5, 0.45, 'in'], turn: [2.2, 0.4], react: [2.8, 0.4, 'back'], run: [4.6, 1.0, 'in'], calm: [5.6, 0.5], fix: [6.3, 0.5] });
      // the devil sneaks in from the right, pushes the vase off, snickers, then runs off when he is caught
      const top = floor + SH + 0.015 * u, broken = T.fall >= 1 && T.fix === 0;
      vase.visible = !broken; vase.position.set(sx + 0.15 * u * T.fall * (1 - T.fix), lerp(top, floor, T.fall * T.fall) * (1 - T.fix) + top * T.fix, 0.0); vase.rotation.z = -1.5 * T.fall * (1 - T.fix); vase.scale.setScalar(grow(T.fix > 0 ? T.fix : 1));
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, f = between(v, 1.95, 2.4); shards.set(i, sx + 0.15 * u + Math.cos(a) * 0.2 * u * f, floor + 0.02 * u + 0.1 * u * Math.sin(Math.PI * f) * Math.abs(Math.sin(a)), 0.05 * u + Math.sin(a) * 0.12 * u * f, broken ? 1 : 0, a + f * 4); }
      shards.commit();
      const snick = v > 2.0 && v < 4.6, ix = T.run > 0 ? lerp(sx + 0.05 * u, sx - 0.9 * u, T.run) : lerp(sx + 0.55 * u, sx + 0.05 * u, T.sneak);
      imp.reset().face(T.run > 0 ? 'left' : T.sneak < 1 ? 'left' : 0.3).walk(v * (T.run > 0 ? 14 : 6), (T.sneak > 0 && T.sneak < 1) || (T.run > 0 && T.run < 1) ? 1 : 0); if (T.sneak < 1) imp.lean(0.4);
      imp.bone('armL').rotation.x = 1.5 * bump(v, 1.25, 0.4);
      let iy = floor; if (snick && T.react < 0.5) { imp.bone('armR').rotation.x = 1.6; imp.bone('foreR').rotation.x = 1.5; iy = floor + 0.02 * u * Math.abs(Math.sin(v * 16)); }
      imp.group.position.set(ix, iy, 0.2 * u); imp.group.visible = !pre && T.run < 1; imp.update();
      // she turns at the crash (!), then crosses her arms in a big X (or gives him a thumbs down): no!
      const k = T.react * (1 - T.calm);
      p.pose('Idle', t); p.group.position.set(px, floor, 0.05 * u);
      p.group.rotation.y = lerp(lerp(0.5, LEFT + 0.6, T.turn * (1 - T.calm)), LEFT + 0.75, k);
      if (!td) {
        // a hand on her hip, a finger wagging at him
        p.handTo('L', p.local(0.24, 0.4, 0.0, W), k, { out: 1, down: 0.2 });
        p.point('R', group.localToWorld(W.set(ix, floor + 0.5 * u, 0.2 * u)), k); p.turn('LowerArmR', 0, 0.25 * k * Math.sin(v * 10));
      }
      else {
        // a big thumbs down: a gloved hand along her forearm, thumb pointing down at him
        p.handTo('R', p.local(-0.08, 0.42, 0.42, W), k, { out: 0.6, down: 0.6 });
        const el = group.worldToLocal(p.node('LowerArmR').getWorldPosition(W)).clone(), fm = group.worldToLocal(p.fistMid('R', W2));
        const hand = extra.hand.group; hand.visible = k > 0.05; hand.position.copy(el);
        hand.quaternion.setFromUnitVectors(W3.set(0, 1, 0), fm.sub(el).normalize()).premultiply(Q.setFromAxisAngle(fm, Math.PI)); hand.scale.setScalar(grow(k)); extra.hand.update();
        const c = pre ? 0 : between(v, 3.0, 3.3) * (1 - between(v, 4.6, 4.8));
        extra.cloud.visible = c > 0.05; extra.cloud.scale.setScalar(grow(c)); extra.cloud.position.set(ix, floor + 0.62 * u, 0.2 * u);
        for (let i = 0; i < 6; i++) { const g = ((t * 1.4 + i / 6) % 1); extra.rain.set(i, ix - 0.08 * u + 0.03 * u * i, floor + 0.58 * u - 0.3 * u * g, 0.2 * u, c > 0.5 ? 1 : 0); }
        extra.rain.commit();
      }
      p.shake(0.6 * k, v);
      pop(bang, pre ? 0 : bump(v, 2.1, 0.8) > 0.2 ? 1 : 0, px, floor + 1.08 * u, 0.1 * u);
      pop(no, k, px - 0.05 * u, floor + 1.1 * u, 0.15 * u);
    },
  };
}

export const SCENES = { 'q-piano-lesson': piano, 'q-drum-fun': drum, 'q-headphones-dance': dance, 'q-bell-ring': bell, 'q-gift-bow': gift, 'q-devil-vase': devil };
