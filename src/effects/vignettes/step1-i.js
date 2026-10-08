// Step 1 scenes, part I: a child, few, noon, fish, half, divide, meat, a thousand, right, book.
//   kid-glyph     子: the glyph is a little kid: a face pops onto its top, its arm stroke flaps, and it hops and bounces
//                 about like a child at play
//   few-grains    少: a hand shakes a bag over a bowl; only three grains drop out, counted, and the hand shakes again:
//                 nothing more. outcome pinch: a pinch of salt drops into a pot (少し); jar: a cookie jar tips: only two
//                 cookies left, and the "?" (少ない)
//   noon-clock    午: a clock's hands sweep up to meet at twelve as the sun climbs to the top of the sky above it; ding.
//                 outcome am: the sun climbs from the left towards twelve, the morning half of the face lit (午前);
//                 pm: the sun sinks to the right after twelve, the afternoon half lit (午後)
//   fish-leap     魚: a fish leaps out of the water beside the kanji in an arc, flips its tail and splashes back down
//   orange-half   半: a knife cuts an orange exactly in half; the halves fall apart and show their insides. outcome share:
//                 a cookie snaps in two and two hands each take a half (半分)
//   glyph-split   分: the knife (刀) of the kanji chops down and its top (八) splits into two halves that slide apart and
//                 back. outcome untangle: a tangled ball of string unwinds into one straight line, a "!" (分かる)
//   meat-spit     肉: a big piece of meat on the bone turns on a spit over a fire, sizzling and dripping
//   crane-string  千: paper cranes drop one after another onto a long string while a counter runs up to 1000
//   turn-right    右: a car comes to a junction; its right indicator blinks and it turns off to the right
//   popup-book    本: a book falls open and a pop-up castle unfolds out of it; pages flutter; it closes again
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs, liveText, wisps } from './helpers.js';
import { grow, countTag } from './step1-kit.js';
import { carBody } from './step1-a.js';

const tmp = new THREE.Vector3();

// ---- 子 the glyph as a kid ----
function kidGlyph(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group();
  const head = solidProp([[G.sphere(0.13 * u), 0xffd2b0], [G.sphere(0.135 * u, 0, 0.04 * u, -0.02 * u, 1, 0.7, 1), 0x3a2416], [G.sphere(0.02 * u, -0.045 * u, 0, 0.12 * u, 1, 1.3, 0.6), 0x1a1a24], [G.sphere(0.02 * u, 0.045 * u, 0, 0.12 * u, 1, 1.3, 0.6), 0x1a1a24], [G.torus(0.04 * u, 0.009 * u, Math.PI, 0, -0.045 * u, 0.11 * u, Math.PI), 0xc04040], [G.sphere(0.025 * u, -0.08 * u, -0.03 * u, 0.1 * u), 0xff9aa0], [G.sphere(0.025 * u, 0.08 * u, -0.03 * u, 0.1 * u), 0xff9aa0]], 0.45);
  const arms = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => b.w > 0.6 * B.w).map(([i]) => i), dust = many(PUFF(u), 6, 0.3), notes = many([[G.sphere(0.03 * u, 0, 0, 0, 1.2, 1, 0.6), 0xffe060], [G.box(0.01 * u, 0.08 * u, 0.01 * u, 0.026 * u, 0.04 * u, 0), 0xffe060]], 3, 1.0);
  group.add(head, dust, notes);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { head: [0, 0.4, 'back'], play: [0.5, 4.2, 'linear'] }), playing = T.play > 0 && T.play < 1;
      const hop = playing ? Math.abs(Math.sin(v * 5)) * 0.22 * u : 0, dx = playing ? 0.35 * u * Math.sin(v * 1.3) : 0;
      poseGlyph(stage, dx, hop, playing ? 0.12 * Math.sin(v * 5) : 0, B.cx, B.minY, 1 + (playing ? 0.05 * Math.cos(v * 10) : 0));
      for (const si of arms) stage.offset(si, 0, 0.06 * u * Math.sin(v * 14) * (playing ? 1 : 0), 0);
      const k = pre ? 0 : T.head; head.visible = k > 0.01; head.scale.setScalar(grow(k)); head.position.set(B.cx + dx, B.maxY + 0.11 * u + hop, 0.03 * u); head.rotation.z = playing ? 0.12 * Math.sin(v * 5) : 0;
      puffs(dust, 0, 6, B.cx + dx, B.minY, playing ? ((v * 5 / Math.PI) % 1) : 0, u, 0.35); dust.commit();
      for (let i = 0; i < 3; i++) { const f = ((v * 0.5 + i / 3) % 1); notes.set(i, B.cx + dx + 0.3 * u + 0.15 * u * f, B.maxY + 0.2 * u + 0.4 * u * f, 0.05 * u, playing ? Math.sin(Math.PI * f) * 1.2 : 0); }
      notes.commit();
    },
  };
}

// ---- 少 a few ----
function fewGrains(ctx, spec, stage) {
  if (spec.outcome === 'pinch') return saltPinch(ctx, spec, stage);
  if (spec.outcome === 'jar') return cookieJar(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u;
  const bowl = solidProp([[new THREE.LatheGeometry([[0, 0], [0.12, 0], [0.22, 0.14], [0.2, 0.14], [0.11, 0.02], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 32), 0x3a6ad0]], 0.45);
  const bag = solidProp([[G.sphere(0.16 * u, 0, 0, 0, 0.9, 1.2, 0.8), 0xd8c8a0], [G.cyl(0.06 * u, 0.09 * u, 0.08 * u, 0, 0.2 * u, 0), 0xd8c8a0], [G.torus(0.065 * u, 0.012 * u, Math.PI * 2, 0, 0.17 * u, 0), 0x8a5a30]], 0.45);
  const grains = many([[G.sphere(0.025 * u, 0, 0, 0, 1, 1.5, 1), 0xfff8e0]], 3, 0.9), tag = countTag(u, { s: 0.22 }), hand = createHand({ u: 0.45 * u, sleeve: 0x3a8ae0 });
  bowl.position.set(bx, floor, 0); bowl.rotation.x = 0.35;
  group.add(bowl, bag, grains, tag, hand.group);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, shaking = !pre && ((v > 0.3 && v < 2.6) || (v > 3.4 && v < 4.4));
      const sx = bx + 0.05 * u + (shaking ? 0.04 * u * Math.sin(v * 25) : 0), sy = floor + 0.7 * u;
      bag.position.set(sx, sy, 0.02 * u); bag.rotation.z = Math.PI - 0.5 + (shaking ? 0.15 * Math.sin(v * 25) : 0); bag.visible = !pre;
      hand.pose('grip'); hand.group.visible = !pre; hand.group.position.set(sx + 0.28 * u, sy + 0.05 * u, 0.04 * u); hand.group.rotation.set(0, 0, 1.4);
      let n = 0;
      for (let i = 0; i < 3; i++) { const at = 0.6 + 0.6 * i, f = pre ? 0 : between(v, at, at + 0.45), off = pre ? 1 : between(v, 5.3, 5.8); if (f >= 1) n = i + 1; grains.set(i, bx + (i - 1) * 0.06 * u, sy - 0.18 * u - (sy - 0.18 * u - floor - 0.06 * u) * f * f, 0.03 * u, f > 0 ? 1 - off : 0); }
      grains.commit();
      tag.show(Math.max(1, n), n ? 1 - between(v, 5.3, 5.8) : 0); tag.position.set(bx + 0.35 * u, floor + 0.3 * u, 0.06 * u);
    },
  };
}
function saltPinch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const pot = solidProp([[G.cyl(0.2 * u, 0.17 * u, 0.24 * u, 0, 0.12 * u, 0), 0x404858], [G.cyl(0.19 * u, 0.19 * u, 0.01 * u, 0, 0.23 * u, 0), 0xe0a050], [G.box(0.12 * u, 0.03 * u, 0.03 * u, -0.26 * u, 0.2 * u, 0), 0x303038], [G.box(0.12 * u, 0.03 * u, 0.03 * u, 0.26 * u, 0.2 * u, 0), 0x303038]], 0.45);
  const hand = createHand({ u: 0.45 * u, sleeve: 0xe06a8a }), salt = many([[G.box(0.012 * u, 0.012 * u, 0.012 * u), 0xffffff]], 8, 1.2), steam = many([[G.sphere(0.03 * u), 0xf0f0f0]], 4, 0.6), tag = textPlane('ちょっと', { h: 0.14 * u, color: '#202838', bg: '#ffffff', pad: 0.3 });
  pot.position.set(px, floor, 0); group.add(pot, hand.group, salt, steam, tag);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rub = !pre && v > 1.0 && v < 2.2;
      hand.pose('pinch', 'open', rub ? 0.15 + 0.15 * Math.sin(v * 20) : 0); hand.group.visible = !pre; hand.group.position.set(px + 0.05 * u, floor + 0.62 * u + 0.08 * u * (1 - between(v, 0.2, 0.8)), 0.04 * u); hand.group.rotation.set(0, 0, Math.PI + 0.3);
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : between(v, 1.0 + i * 0.13, 1.6 + i * 0.13); salt.set(i, px + 0.0 * u + 0.03 * u * Math.sin(i * 2), floor + 0.48 * u - 0.24 * u * f, 0.04 * u, f > 0 && f < 1 ? 1 : 0, i); }
      salt.commit(); wisps(steam, 0, 4, px, floor + 0.26 * u, v, u, { period: 1.6, rise: 0.4, on: pre ? 0 : 1 }); steam.commit();
      const k = pre ? 0 : between(v, 2.3, 2.6) * (1 - between(v, 4.4, 4.8)); tag.visible = k > 0.01; tag.scale.setScalar(grow(k)); tag.position.set(px + 0.38 * u, floor + 0.85 * u, 0.06 * u);
    },
  };
}
function cookieJar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, jx = B.maxX + 0.45 * u;
  const jar = solidProp([[G.cyl(0.18 * u, 0.18 * u, 0.36 * u, 0, 0.18 * u, 0, 0, 0, 0, 28), 0xc8e8ff]], 0.3), lid = solidProp([[G.cyl(0.15 * u, 0.15 * u, 0.04 * u, 0, 0, 0), 0xe05a3a], [G.sphere(0.04 * u, 0, 0.04 * u, 0), 0xe05a3a]], 0.45);
  jar.material.transparent = true; jar.material.opacity = 0.45;
  const cookies = many([[G.cyl(0.07 * u, 0.07 * u, 0.025 * u, 0, 0, 0, Math.PI / 2), 0xc88a48], [G.sphere(0.012 * u, 0.02 * u, 0.02 * u, 0.014 * u), 0x3a2010], [G.sphere(0.012 * u, -0.03 * u, -0.01 * u, 0.014 * u), 0x3a2010]], 2, 0.5), tag = countTag(u, { s: 0.22 }), crumbs = many([[G.sphere(0.012 * u), 0xc88a48]], 6, 0.4);
  jar.position.set(jx, floor, 0); group.add(jar, lid, cookies, tag, crumbs);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, tip = pre ? 0 : bump(v, 0.6, 2.6);
      jar.rotation.z = -0.8 * tip; lid.position.set(jx + 0.35 * u * Math.sin(0.8 * tip) + 0.2 * u * between(v, 0.6, 1.0) * (1 - between(v, 2.8, 3.2)), floor + 0.38 * u * Math.cos(0.8 * tip) + 0.04 * u, 0.02 * u); lid.rotation.z = -0.8 * tip;
      for (let i = 0; i < 2; i++) { const f = pre ? 0 : between(v, 1.1 + 0.3 * i, 1.6 + 0.3 * i); cookies.set(i, jx + 0.1 * u + (0.25 + 0.17 * i) * u * f, floor + 0.07 * u + 0.1 * u * Math.sin(Math.PI * f), 0.05 * u, 1, f * 5); }
      cookies.commit();
      for (let i = 0; i < 6; i++) crumbs.set(i, jx + 0.3 * u + 0.05 * u * i, floor + 0.01 * u, 0.06 * u, !pre && v > 1.6 ? 1 : 0);
      crumbs.commit();
      tag.show(2, pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 4.8, 5.2))); tag.position.set(jx + 0.45 * u, floor + 0.38 * u, 0.06 * u);
    },
  };
}

// ---- 午 noon ----
function noonClock(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = B.cy - 0.05 * u, R = 0.3 * u, mode = spec.outcome ?? 'noon';
  const face = solidProp([[G.cyl(R, R, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 40), 0xfaf6ea], [G.torus(R, 0.025 * u), 0x3a6ad0], ...Array.from({ length: 12 }, (_, i) => [G.box(0.015 * u, 0.05 * u, 0.01 * u, Math.sin(i * Math.PI / 6) * R * 0.82, Math.cos(i * Math.PI / 6) * R * 0.82, 0.02 * u, -i * Math.PI / 6), 0x303848])], 0.45);
  const n12 = textPlane('12', { h: 0.11 * u, color: '#d02020', weight: 900 }), hands = many([[G.box(0.024 * u, 1, 0.01 * u, 0, 0.5, 0), 0x202830]], 2, 0.4);
  const half = solidProp([[new THREE.CircleGeometry(R * 0.9, 24, 0, Math.PI), mode === 'pm' ? 0xffb070 : 0xa0d8ff]], 0.6), sun = solidProp([[G.sphere(0.09 * u), 0xffb030]], 1.3), ding = many([[G.torus(0.1 * u, 0.008 * u), 0xffe080]], 2, 1.0);
  half.material.transparent = true; half.material.opacity = 0.7; half.rotation.z = mode === 'pm' ? -Math.PI / 2 : Math.PI / 2;
  face.position.set(cx, cy, -0.02 * u); n12.position.set(cx, cy + R * 0.62, 0.02 * u); half.position.set(cx, cy, 0.0);
  group.add(face, n12, hands, sun, ding); if (mode !== 'noon') group.add(half);
  const loop = 5.4, M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), S = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 2.6);
      // the sun's arc over the clock: noon and am climb from the left to the top; pm sinks from the top to the right
      const a = mode === 'pm' ? Math.PI / 2 - f * Math.PI / 2 : Math.PI - f * Math.PI / 2, hour = mode === 'pm' ? f * 4 : mode === 'am' ? 8 + f * 3.5 : 9 + f * 3;
      const h = (hour % 12) / 12 * Math.PI * 2, m = (hour % 1) * Math.PI * 2 + (mode === 'noon' ? f * Math.PI * 6 : 0);
      hands.setMatrixAt(0, M4.compose(tmp.set(cx, cy, 0.03 * u), Q.setFromAxisAngle(Z, -m), S.set(1, R * 0.82, 1))); hands.setMatrixAt(1, M4.compose(tmp.set(cx, cy, 0.035 * u), Q.setFromAxisAngle(Z, -h), S.set(1.3, R * 0.55, 1))); hands.commit();
      sun.position.set(cx + Math.cos(a) * 0.62 * u, cy + Math.sin(a) * 0.5 * u, -0.1 * u); sun.visible = !pre;
      half.material.opacity = 0.7 * f;
      const d = mode === 'noon' && !pre ? between(v, 2.6, 3.4) : 0; for (let i = 0; i < 2; i++) ding.set(i, cx, cy + R + 0.04 * u, 0, d > 0 && d < 1 ? 1 + 1.5 * ((d + i * 0.3) % 1) : 0); ding.commit();
      n12.scale.setScalar(1 + 0.3 * (mode === 'noon' && !pre ? bump(v, 2.6, 0.5) : 0));
    },
  };
}

// ---- 魚 a fish ----
function fishLeap(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.6 * u, sea = floor + 0.15 * u;
  const water = solidProp([[G.box(1.2 * u, 0.3 * u, 0.3 * u, 0, -0.15 * u, 0), 0x2a6ad0], ...[0, 1, 2, 3].map((i) => [G.sphere(0.1 * u, (-0.45 + 0.3 * i) * u, 0, 0, 1.5, 0.4, 1.6), 0x3a7ae0])], 0.4);
  const fish = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1.6, 0.9, 0.5), 0xff8a30], [G.cone(0.1 * u, 0.14 * u, -0.25 * u, 0, 0, Math.PI / 2), 0xff8a30], [G.sphere(0.025 * u, 0.12 * u, 0.03 * u, 0.055 * u), 0xffffff], [G.sphere(0.013 * u, 0.13 * u, 0.03 * u, 0.07 * u), 0x101010], [G.cone(0.05 * u, 0.08 * u, 0, 0.12 * u, 0, -0.3), 0xff6a20], [G.box(0.01 * u, 0.12 * u, 0.06 * u, 0.05 * u, 0, 0), 0xffd0a0]], 0.5);
  const splash = many([[G.sphere(0.03 * u), 0xd8f0ff]], 12, 1.0), rings = many([[G.torus(0.08 * u, 0.01 * u).rotateX(Math.PI / 2), 0xd8f0ff]], 2, 1.0);
  water.position.set(wx, sea, 0); group.add(fish, water, splash, rings);
  const loop = 5.0, x0 = wx - 0.4 * u, x1 = wx + 0.4 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.3, 2.1);
      const x = x0 + (x1 - x0) * f, y = sea - 0.1 * u + 0.75 * u * 4 * f * (1 - f), a = Math.atan2(0.75 * 4 * (1 - 2 * f), x1 - x0 + 1e-6) * 0.8;
      fish.visible = f > 0 && f < 1; fish.position.set(x, y, 0.1 * u); fish.rotation.z = a; fish.rotation.x = 0.25 * Math.sin(v * 14);
      [[x0, 0.3], [x1, 2.1]].forEach(([sx, at], k) => {
        const g = pre ? 0 : between(v, at, at + 0.7);
        for (let i = 0; i < 6; i++) { const b = (i / 6) * Math.PI; splash.set(k * 6 + i, sx + Math.cos(b) * 0.15 * u * g, sea + Math.sin(b) * 0.3 * u * Math.sin(Math.PI * g), 0.1 * u, g > 0 && g < 1 ? 1 - g : 0); }
        rings.set(k, sx, sea + 0.01 * u, 0.12 * u, g > 0 && g < 1 ? 0.5 + 2 * g : 0, 0, 0, 0.4);
      });
      splash.commit(); rings.commit();
    },
  };
}

// ---- 半 half ----
function orangeHalf(ctx, spec, stage) {
  if (spec.outcome === 'share') return cookieShare(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ox = B.maxX + 0.55 * u, oy = floor + 0.2 * u, R = 0.2 * u;
  const halfGeo = () => [[new THREE.SphereGeometry(R, 24, 16, 0, Math.PI), 0xff9a20], [new THREE.CircleGeometry(R * 0.98, 24).rotateY(-Math.PI / 2).translate(0, 0, 0), 0xffd070], ...Array.from({ length: 8 }, (_, i) => [G.box(0.004 * u, R * 1.7, 0.01 * u, 0.001 * u, 0, 0, i * Math.PI / 8).rotateY(-Math.PI / 2), 0xffffff])];
  const L = solidProp(halfGeo(), 0.5), Rh = solidProp(halfGeo(), 0.5), knife = solidProp([[G.box(0.04 * u, 0.36 * u, 0.012 * u, 0, 0.18 * u, 0), 0xd8dde6], [G.box(0.05 * u, 0.15 * u, 0.03 * u, 0, 0.43 * u, 0), 0x5a3a20]], 0.5);
  const board = solidProp([[G.box(0.8 * u, 0.04 * u, 0.4 * u, 0, -0.02 * u, 0), 0xc89a60]], 0.35), tag = textPlane('½', { h: 0.2 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  L.rotation.y = Math.PI; board.position.set(ox, floor, -0.05 * u); board.rotation.x = 0.4;
  group.add(board, L, Rh, knife, tag);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { cut: [0.4, 0.5, 'in'], up: [1.0, 0.4], part: [1.0, 0.6, 'back'], back: [4.6, 0.6] }), p = T.part - T.back;
      L.position.set(ox - 0.12 * u * p, oy, 0.02 * u); L.rotation.set(0, Math.PI + 0.9 * p, 0); Rh.position.set(ox + 0.12 * u * p, oy, 0.02 * u); Rh.rotation.set(0, -0.9 * p, 0);
      knife.visible = !pre && v < 1.5; knife.position.set(ox, oy + 0.35 * u - 0.4 * u * T.cut + 0.4 * u * T.up, 0.05 * u);
      const k = pre ? 0 : between(v, 1.5, 1.8) * (1 - T.back); tag.visible = k > 0.01; tag.scale.setScalar(grow(k)); tag.position.set(ox, oy + 0.42 * u, 0.06 * u);
    },
  };
}
function cookieShare(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = B.cy;
  const halfC = () => solidProp([[new THREE.CylinderGeometry(0.17 * u, 0.17 * u, 0.04 * u, 24, 1, false, 0, Math.PI).rotateX(Math.PI / 2), 0xd09a50], [G.sphere(0.02 * u, 0.06 * u, 0.06 * u, 0.02 * u), 0x3a2010], [G.sphere(0.02 * u, 0.1 * u, -0.05 * u, 0.02 * u), 0x3a2010], [G.sphere(0.02 * u, 0.03 * u, -0.1 * u, 0.02 * u), 0x3a2010]], 0.5);
  const left = halfC(), right = halfC(), H1 = createHand({ u: 0.45 * u, sleeve: 0x3a8ae0 }), H2 = createHand({ u: 0.45 * u, sleeve: 0xe06a8a, side: -1 }), crumbs = many([[G.sphere(0.012 * u), 0xd09a50]], 6, 0.4);
  left.rotation.z = Math.PI;
  group.add(left, right, H1.group, H2.group, crumbs);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { snap: [0.5, 0.3, 'back'], take: [1.2, 0.9, 'out'], back: [4.4, 0.8] }), s = T.snap - T.back, k = T.take - T.back;
      left.position.set(cx - 0.03 * u * s - 0.35 * u * k, cy - 0.15 * u * k, 0.02 * u); left.rotation.z = Math.PI + 0.2 * s; right.position.set(cx + 0.03 * u * s + 0.35 * u * k, cy - 0.15 * u * k, 0.02 * u); right.rotation.z = -0.2 * s;
      left.visible = right.visible = !pre;
      H1.pose('pinch'); H1.group.position.set(cx - 0.12 * u - 0.35 * u * k, cy - 0.5 * u - 0.15 * u * k, 0.04 * u); H1.group.rotation.set(0, 0, -0.5); H1.group.visible = !pre;
      H2.pose('pinch'); H2.group.position.set(cx + 0.12 * u + 0.35 * u * k, cy - 0.5 * u - 0.15 * u * k, 0.04 * u); H2.group.rotation.set(0, 0, 0.5); H2.group.visible = !pre;
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : between(v, 0.6, 1.4); crumbs.set(i, cx + (i - 2.5) * 0.03 * u, cy - 0.5 * u * f * f, 0.05 * u, f > 0 && f < 1 ? 1 : 0); }
      crumbs.commit();
    },
  };
}

// ---- 分 divide ----
function glyphSplit(ctx, spec, stage) {
  if (spec.outcome === 'untangle') return untangle(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), cut = B.minY + 0.55 * B.h;
  const top = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => b.cy > cut), knife = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => b.cy <= cut).map(([i]) => i);
  const L = top.filter(([, b]) => b.cx < B.cx).map(([i]) => i), R = top.filter(([, b]) => b.cx >= B.cx).map(([i]) => i), flash = many([[G.box(0.02 * u, 0.4 * u, 0.01 * u), 0xffffff]], 1, 1.6);
  group.add(flash);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0.2, 0.4, 'out'], chop: [0.6, 0.2, 'in'], part: [0.8, 0.5, 'back'], join: [3.4, 0.7] }), p = T.part - T.join;
      const kUp = 0.15 * u * (T.lift - T.chop);
      for (const si of knife) stage.offset(si, 0, kUp, 0.02 * u);
      for (const si of L) stage.offset(si, -0.2 * u * p, 0, 0); for (const si of R) stage.offset(si, 0.2 * u * p, 0, 0);
      const f = pre ? 0 : bump(v, 0.75, 0.4); flash.set(0, B.cx, cut + 0.1 * u, 0.05 * u, f); flash.commit();
    },
  };
}
function untangle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = B.cy, N = 40;
  const bits = many([[G.sphere(0.022 * u), 0xe04848]], N, 0.6), bang = textPlane('!', { h: 0.25 * u, color: '#ffe040', weight: 900 });
  group.add(bits, bang);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.6, 2.6) * (1 - between(v, 4.6, 5.4));
      for (let i = 0; i < N; i++) {
        const s = i / (N - 1), a = s * 31, tangled = [cx + 0.15 * u * Math.sin(a) * Math.cos(a * 0.37), cy + 0.15 * u * Math.cos(a * 1.3) * Math.sin(a * 0.21 + 1)], straight = [cx - 0.5 * u + s * 1.0 * u, cy - 0.1 * u + 0.03 * u * Math.sin(s * 6 + v * 2) * (1 - f)];
        bits.set(i, tangled[0] + (straight[0] - tangled[0]) * f, tangled[1] + (straight[1] - tangled[1]) * f, 0.03 * u * Math.sin(a), pre ? 0 : 1);
      }
      bits.commit();
      const k = pre ? 0 : between(v, 2.6, 2.9) * (1 - between(v, 4.6, 5.0)); bang.visible = k > 0.01; bang.scale.setScalar(grow(k)); bang.position.set(cx, cy + 0.3 * u, 0.05 * u);
    },
  };
}

// ---- 肉 meat on a spit ----
function meatSpit(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.55 * u, my = floor + 0.45 * u;
  const meat = solidProp([[G.sphere(0.17 * u, 0, 0, 0, 1.5, 1.05, 1), 0xb0502a], [G.sphere(0.15 * u, 0.02 * u, 0.03 * u, 0, 1.4, 0.9, 1.02), 0xc8603a], [G.cyl(0.03 * u, 0.03 * u, 0.2 * u, 0.32 * u, 0, 0, 0, 0, Math.PI / 2), 0xf4ecd8], [G.sphere(0.045 * u, 0.42 * u, 0.02 * u, 0), 0xf4ecd8], [G.sphere(0.045 * u, 0.42 * u, -0.03 * u, 0), 0xf4ecd8]], 0.5);
  const spit = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.9 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0x9aa4b4], [G.cyl(0.015 * u, 0.015 * u, 0.35 * u, -0.4 * u, -0.17 * u, 0), 0x6a6a72], [G.cyl(0.015 * u, 0.015 * u, 0.35 * u, 0.4 * u, -0.17 * u, 0), 0x6a6a72]], 0.4);
  const fire = many([[G.cone(0.06 * u, 0.2 * u, 0, 0.1 * u, 0), 0xff7a1a], [G.cone(0.035 * u, 0.12 * u, 0, 0.06 * u, 0.02 * u), 0xffe040]], 5, 1.3), drips = many([[G.sphere(0.015 * u, 0, 0, 0, 1, 1.4, 1), 0xffd060]], 4, 1.0), smoke = many([[G.sphere(0.035 * u), 0xc8c8d0]], 5, 0.3);
  spit.position.set(mx, my, -0.02 * u);
  group.add(spit, meat, fire, drips, smoke);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      meat.position.set(mx - 0.1 * u, my, 0); meat.rotation.x = pre ? 0 : v * 1.3; meat.visible = true;
      for (let i = 0; i < 5; i++) fire.set(i, mx + (i - 2) * 0.09 * u, floor, 0.0, (0.8 + 0.25 * Math.sin(t * (9 + i) + i)) * (i % 2 ? 0.8 : 1.1), 0.1 * Math.sin(t * 7 + i));
      fire.commit();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.9 + i / 4) % 1); drips.set(i, mx - 0.2 * u + i * 0.1 * u, my - 0.15 * u - 0.15 * u * f, 0.03 * u, pre ? 0 : 1 - f); }
      drips.commit(); wisps(smoke, 0, 5, mx - 0.1 * u, my + 0.15 * u, v, u, { period: 1.6, rise: 0.5, on: pre ? 0 : 1 }); smoke.commit();
    },
  };
}

// ---- 千 a thousand cranes ----
function craneString(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.3 * u, top = B.maxY + 0.15 * u;
  const crane = (s) => { const k = s * u; return [[G.cone(0.06 * k, 0.12 * k, 0, 0, 0, Math.PI), 0xffffff], [G.poly([[-0.14 * k, 0.04 * k], [0, 0], [0.14 * k, 0.04 * k]], 0.012 * k), 0xffffff], [G.cone(0.012 * k, 0.08 * k, 0.08 * k, 0.04 * k, 0, -0.9), 0xffffff]]; };
  const cranes = many(crane(1.1), 24, 0.6), COL = [0xff6a8a, 0xffd040, 0x5ab0ff, 0x60d070, 0xc080ff, 0xff9a40]; for (let i = 0; i < 24; i++) cranes.setColorAt(i, new THREE.Color(COL[i % 6]));
  const strings = solidProp([0, 1, 2, 3].map((i) => [G.cyl(0.004 * u, 0.004 * u, 1.0 * u, (0.12 + 0.24 * i) * u, -0.5 * u, 0), 0xe0e0e0]), 0.5), bar = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.9 * u, 0.48 * u, 0, 0, 0, 0, Math.PI / 2), 0x8a5a30]], 0.4);
  const count = liveText(u, { h: 0.18, w: 0.46, color: '#ffffff', bg: '#d03030' });
  strings.position.set(sx, top, -0.03 * u); bar.position.set(sx, top, -0.03 * u); count.position.set(sx + 0.48 * u, top + 0.16 * u, 0.04 * u);
  group.add(bar, strings, cranes, count);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 3.6), off = pre ? 1 : between(v, 5.2, 5.8);
      for (let i = 0; i < 24; i++) { const col = i % 4, row = Math.floor(i / 4), at = (row * 4 + col) / 24, k = between(f, at, at + 0.08); cranes.set(i, sx + (0.12 + 0.24 * col) * u, top - (0.12 + 0.15 * row) * u + 0.4 * u * (1 - k), 0.0, k * (1 - off), 0.1 * Math.sin(t * 2 + i), 0.3 * Math.sin(t + i)); }
      cranes.commit();
      count.set(String(Math.round(f * 1000))); count.scale.setScalar(1 + 0.2 * bump(v, 3.6, 0.5)); count.visible = !pre;
    },
  };
}

// ---- 右 turn right ----
function turnRight(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, jx = B.maxX + 0.5 * u;
  const roads = solidProp([[G.box(0.34 * u, 0.01 * u, 1.2 * u, 0, 0, -0.2 * u), 0x4a4d58], [G.box(1.0 * u, 0.01 * u, 0.34 * u, 0.33 * u, 0.001 * u, -0.45 * u), 0x4a4d58], ...[0, 1, 2].map((i) => [G.box(0.03 * u, 0.012 * u, 0.12 * u, 0, 0.0, (0.25 - 0.22 * i) * u), 0xffffff])], 0.3);
  const car = carBody(0.75 * u, { color: 0x3a7ae0 }), blink = solidProp([[G.sphere(0.03 * u), 0xffa020]], 2.0), arrow = solidProp([[G.box(0.16 * u, 0.04 * u, 0.02 * u, -0.04 * u, 0, 0), 0xffa020], [G.cone(0.05 * u, 0.08 * u, 0.07 * u, 0, 0, -Math.PI / 2), 0xffa020]], 1.5);
  const tilt = new THREE.Group(); tilt.position.set(jx, floor, 0); tilt.rotation.x = 0.55; tilt.add(roads, car, blink);
  group.add(tilt, arrow);
  const loop = 5.6, P = (f) => { if (f < 0.5) { const g = f / 0.5; return [0, 0.35 * u - 0.75 * u * g, Math.PI]; } const g = (f - 0.5) / 0.5, a = Math.PI / 2 * Math.min(1, g * 1.6); return [0.85 * u * g, -0.4 * u - 0.05 * u * Math.sin(a), Math.PI - a]; };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0, 1.2) * 0.5 + between(v, 2.2, 3.6) * 0.5, gone = pre ? 0 : between(v, 3.6, 4.0);
      const [x, z, yaw] = P(f); car.position.set(x + 0.04 * u, 0.0, z); car.rotation.y = yaw + Math.PI / 2; car.visible = !pre && gone < 1; car.scale.setScalar(grow(1 - gone)); car.roll(v * 12 * (f > 0 && f < 1 ? 1 : 0), 0.3);
      const on = !pre && v > 1.0 && v < 3.0 && (v * 3) % 1 < 0.5; blink.visible = on; blink.position.set(x + 0.18 * u * Math.sin(yaw + Math.PI / 2 + 0.6), 0.12 * u, z + 0.18 * u * Math.cos(yaw + Math.PI / 2 + 0.6));
      const k = !pre && v > 1.0 && v < 3.6 ? 1 : 0; arrow.visible = k > 0; arrow.position.set(jx + 0.3 * u + 0.05 * u * Math.sin(v * 6), floor + 0.75 * u, 0.06 * u);
    },
  };
}

// ---- 本 a pop-up book ----
function popupBook(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.55 * u, by = floor + 0.08 * u;
  const cover = (s) => { const g = new THREE.Group(), m = solidProp([[G.box(0.36 * u, 0.02 * u, 0.48 * u, s * 0.18 * u, 0, 0), 0xc03030], [G.box(0.34 * u, 0.025 * u, 0.46 * u, s * 0.17 * u, 0.01 * u, 0), 0xfaf4e4]], 0.45); g.add(m); return g; };
  const L = cover(-1), R = cover(1), castle = solidProp([[G.box(0.3 * u, 0.22 * u, 0.02 * u, 0, 0.11 * u, 0), 0xe0d8c8], ...[-0.13, 0, 0.13].map((x, i) => [G.box(0.07 * u, (0.3 + 0.08 * (i === 1)) * u, 0.025 * u, x * u, (0.15 + 0.04 * (i === 1)) * u, 0), 0xd8d0c0]), ...[-0.13, 0, 0.13].map((x, i) => [G.cone(0.055 * u, 0.1 * u, x * u, (0.35 + 0.08 * (i === 1)) * u, 0), 0x3a6ad0]), [G.box(0.06 * u, 0.09 * u, 0.03 * u, 0, 0.045 * u, 0), 0x6a3a1a], [G.box(0.04 * u, 0.03 * u, 0.005 * u, 0.04 * u, 0.5 * u, 0), 0xe03030]], 0.5);
  const hinge = new THREE.Group(); hinge.add(L, R); hinge.position.set(bx, by, 0); hinge.rotation.x = 0.55;
  const pop = new THREE.Group(); pop.add(castle); pop.position.set(bx, by + 0.005 * u, -0.02 * u); const sparks = many([[G.sphere(0.018 * u), 0xffe060]], 6, 1.4);
  group.add(hinge, pop, sparks);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.7, 'out'], pop: [0.7, 0.6, 'back'], fold: [4.4, 0.4], close: [4.7, 0.6, 'in'] }), o = pre ? 0 : T.open - T.close;
      L.rotation.z = -(Math.PI / 2) * (1 - o); R.rotation.z = (Math.PI / 2) * (1 - o);
      const p = T.pop - T.fold; castle.scale.set(1, grow(p), 1); castle.rotation.x = -(1 - p) * 1.2; castle.visible = p > 0.02;
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : between(v, 1.2 + 0.1 * i, 2.2 + 0.1 * i), a = i * 1.05; sparks.set(i, bx + Math.cos(a) * 0.35 * u * f, by + 0.3 * u + Math.sin(a) * 0.25 * u * f, 0.05 * u, f > 0 && f < 1 ? 1 - f : 0); }
      sparks.commit();
    },
  };
}

export const SCENES = { 'kid-glyph': kidGlyph, 'few-grains': fewGrains, 'noon-clock': noonClock, 'fish-leap': fishLeap, 'orange-half': orangeHalf, 'glyph-split': glyphSplit, 'meat-spit': meatSpit, 'crane-string': craneString, 'turn-right': turnRight, 'popup-book': popupBook };
