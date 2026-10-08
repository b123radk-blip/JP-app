// Step 1 scenes, part M: soil, yen, eye, rice field, think, hundred, language, forest, friend.
//   spade-dig      土: a spade digs into a mound of brown soil and turns it over; clods fly and a worm pops up and
//                  wiggles. outcome week: 土曜日
//   coin-spin      円: a ¥ coin spins on its edge like a wheel, wobbles and settles flat; a circle draws itself round it
//   glyph-eye      目: the glyph is an eye: a big pupil appears between its strokes, looks left and right, and the eye
//                  blinks (the strokes squeeze shut and open)
//   paddy-grow     田: the 田 grid lies on a flooded field; rows of seedlings pop up in its squares, grow tall and green,
//                  then turn golden and nod
//   think-bubble   思: a person with a hand on their chin; a thought bubble grows over them and shows a cake, then a
//                  house, then a heart
//   centipede      百: a centipede with very many legs crawls along, its legs rippling, a counter running up to 100
//   globe-hello    語: a globe spins; speech bubbles pop up from it in turn: Hello, こんにちは, Hola, 你好
//   forest-rows    森: rows of tall pine trees spring up layer behind layer into a deep forest; mist drifts, an owl
//                  blinks from a branch
//   friends-five   友: two kids run up, high-five with a burst, then walk off arm in arm
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, puffs, liveText } from './helpers.js';
import { grow, withWeek, seeded } from './step1-kit.js';

// ---- 土 soil ----
function spadeDig(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(spadeDig, 5, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.5 * u;
  const mound = solidProp([[G.sphere(0.4 * u, 0, 0, 0, 1.2, 0.35, 0.6), 0x7a5230], [G.sphere(0.15 * u, -0.2 * u, 0.08 * u, 0.1 * u, 1, 0.5, 0.6), 0x8a6038]], 0.3);
  const spadeP = new THREE.Group(), spade = solidProp([[G.box(0.16 * u, 0.2 * u, 0.02 * u, 0, -0.1 * u, 0), 0xb8c0cc], [G.cyl(0.018 * u, 0.018 * u, 0.5 * u, 0, 0.25 * u, 0), 0x8a5a30], [G.box(0.14 * u, 0.03 * u, 0.03 * u, 0, 0.5 * u, 0), 0x8a5a30]], 0.45);
  spadeP.add(spade);
  const clods = many([[G.sphere(0.035 * u, 0, 0, 0, 1.2, 0.9, 1), 0x6a4428]], 8, 0.3), worm = many([[G.sphere(0.022 * u), 0xff9aa8]], 6, 0.6);
  mound.position.set(mx, floor, -0.05 * u);
  group.add(mound, spadeP, clods, worm);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { stab: [0.2, 0.3, 'in'], lever: [0.6, 0.4], lift: [1.0, 0.4], back: [4.6, 0.6] });
      spadeP.visible = !pre; spadeP.position.set(mx + 0.05 * u, floor + 0.38 * u - 0.2 * u * T.stab + 0.25 * u * T.lift - 0.05 * u * T.back, 0.08 * u); spadeP.rotation.z = -0.25 - 0.6 * T.lever + 0.85 * T.back;
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : between(v, 1.0 + 0.04 * i, 1.8 + 0.04 * i), a = 0.4 + i * 0.3; clods.set(i, mx + 0.05 * u + Math.cos(a) * 0.35 * u * f, floor + 0.15 * u + Math.sin(a) * 0.4 * u * f - 0.5 * u * f * f, 0.08 * u, f > 0 && f < 1 ? 1 : 0, i); }
      clods.commit();
      const w = pre ? 0 : between(v, 1.8, 2.3) * (1 - between(v, 4.2, 4.6));
      for (let i = 0; i < 6; i++) worm.set(i, mx - 0.1 * u + 0.025 * u * Math.sin(v * 6 + i * 0.8), floor + 0.1 * u + i * 0.035 * u * w, 0.12 * u, w > 0.02 ? 1 - 0.05 * i : 0);
      worm.commit();
    },
  };
}

// ---- 円 a yen coin ----
function coinSpin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = floor + 0.25 * u, R = 0.2 * u;
  const coin = solidProp([[G.cyl(R, R, 0.04 * u, 0, 0, 0, Math.PI / 2, 0, 0, 32), 0xffc030], [G.cyl(R * 0.8, R * 0.8, 0.044 * u, 0, 0, 0, Math.PI / 2, 0, 0, 32), 0xffd860]], 0.8), yen = textPlane('¥', { h: 0.22 * u, color: '#a06a10', weight: 900 });
  const g = new THREE.Group(); yen.position.z = 0.025 * u; g.add(coin, yen);
  const ring = many([[G.sphere(0.018 * u), 0xffe060]], 30, 1.4);
  group.add(g, ring);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, spin = pre ? 0 : between(v, 0, 2.4), settle = pre ? 0 : between(v, 2.4, 3.0) * (1 - between(v, 5.0, 5.5));
      g.position.set(cx, cy + 0.02 * u * Math.abs(Math.sin(v * 20)) * (1 - spin), 0.02 * u); g.rotation.set(-0.3 * settle, (1 - spin) * 0 + spin * 14 * (1 - spin * 0.5) * (settle > 0 ? 0 : 1), 0.12 * wobble(v, 2.4, 0.8, 4));
      const d = pre ? 0 : between(v, 3.0, 4.2) * (1 - between(v, 5.0, 5.5));
      for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + Math.PI / 2; ring.set(i, cx + Math.cos(a) * 0.32 * u, cy + Math.sin(a) * 0.32 * u, 0.03 * u, i / 30 < d ? 1 : 0); }
      ring.commit();
    },
  };
}

// ---- 目 the glyph as an eye ----
function glyphEye(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group();
  const flats = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => b.h < 0.2 * B.h).sort((a, b) => a[1].cy - b[1].cy);
  const top = flats[flats.length - 1]?.[0], bottom = flats[0]?.[0], inner = flats.slice(1, -1).map(([i]) => i);
  const white = solidProp([[G.sphere(0.5, 0, 0, 0, 1, 1, 0.2), 0xffffff]], 0.7), iris = solidProp([[G.sphere(0.1 * u, 0, 0, 0, 1, 1, 0.3), 0x3a7ae0], [G.sphere(0.055 * u, 0, 0, 0.02 * u, 1, 1, 0.3), 0x101018], [G.sphere(0.02 * u, 0.03 * u, 0.03 * u, 0.04 * u), 0xffffff]], 0.7);
  white.scale.set(B.w * 0.8, B.h * 0.75, 0.1 * u); white.position.set(B.cx, B.cy, -0.03 * u);
  group.add(white, iris);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, open = pre ? 0 : between(v, 0, 0.4), blink = pre ? 0 : Math.max(bump(v, 2.6, 0.35), bump(v, 3.1, 0.35));
      const look = pre ? 0 : (v < 0.8 ? 0 : v < 1.5 ? -between(v, 0.8, 1.0) : v < 2.3 ? -1 + 2 * between(v, 1.5, 1.7) : 1 - between(v, 2.3, 2.5));
      white.visible = open > 0.01; white.scale.set(B.w * 0.8 * grow(open), B.h * 0.75 * grow(open) * (1 - 0.95 * blink), 0.1 * u);
      iris.visible = open > 0.5 && blink < 0.6; iris.position.set(B.cx + look * 0.12 * B.w, B.cy, 0.02 * u);
      const sq = blink * (B.h * 0.38);
      if (top !== undefined) stage.offset(top, 0, -sq, 0); if (bottom !== undefined) stage.offset(bottom, 0, sq, 0);
      for (const si of inner) stage.offset(si, 0, 0, -0.06 * u * open);
    },
  };
}

// ---- 田 rice field ----
function paddyGrow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const water = solidProp([[G.box(1, 1, 0.01 * u, 0, 0, 0), 0x5aa0e0]], 0.5); water.material.transparent = true;
  water.scale.set(B.w * 0.92, B.h * 0.92, 1); water.position.set(B.cx, B.cy, -0.03 * u);
  const N = 16, sprouts = many([[G.cone(0.025 * u, 0.12 * u, 0, 0.06 * u, 0), 0xffffff], [G.cone(0.02 * u, 0.1 * u, 0.02 * u, 0.05 * u, 0, -0.3), 0xffffff], [G.cone(0.02 * u, 0.1 * u, -0.02 * u, 0.05 * u, 0, 0.3), 0xffffff]], N, 0.5);
  const scare = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.5 * u, 0, 0.25 * u, 0), 0x8a5a30], [G.cyl(0.012 * u, 0.012 * u, 0.32 * u, 0, 0.36 * u, 0, 0, 0, Math.PI / 2), 0x8a5a30], [G.sphere(0.06 * u, 0, 0.5 * u, 0), 0xf0e0b0], [G.cone(0.1 * u, 0.06 * u, 0, 0.56 * u, 0), 0xd0a040], [G.box(0.12 * u, 0.14 * u, 0.04 * u, 0, 0.36 * u, 0), 0xc04040]], 0.4);
  scare.position.set(B.maxX + 0.35 * u, floor, -0.02 * u);
  group.add(water, sprouts, scare);
  const loop = 6.6, green = new THREE.Color(0x58c040), gold = new THREE.Color(0xf0c030), c = new THREE.Color();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, flood = pre ? 0 : between(v, 0, 0.6) * (1 - between(v, 6.0, 6.5));
      water.material.opacity = 0.55 * flood; water.visible = flood > 0.01;
      const ripe = pre ? 0 : between(v, 3.2, 4.2) * (1 - between(v, 5.8, 6.2)); c.copy(green).lerp(gold, ripe);
      for (let i = 0; i < N; i++) { const q = i % 4, r = Math.floor(i / 4), x = B.minX + (0.16 + 0.225 * q) * B.w, y = B.minY + (0.12 + 0.24 * r) * B.h, k = pre ? 0 : between(v, 0.6 + 0.08 * i, 1.0 + 0.08 * i) * (1 - between(v, 6.0, 6.5)), h = 0.6 + 0.6 * between(v, 1.8, 3.0); sprouts.set(i, x, y - 0.03 * u, 0.04 * u, grow(k) * h, 0.15 * Math.sin(t * 2 + i) * (0.3 + ripe)); sprouts.setColorAt(i, c); }
      sprouts.commit(); sprouts.instanceColor.needsUpdate = true;
      scare.rotation.z = 0.05 * Math.sin(t * 1.5); scare.visible = !pre;
    },
  };
}

// ---- 思 think ----
function thinkBubble(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.3 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0x9a6ad0 }), cloud = many([[G.sphere(0.16 * u, 0, 0, 0, 1.4, 1, 0.3), 0xffffff]], 1, 0.9), dots = many([[G.sphere(0.03 * u), 0xffffff]], 3, 0.9);
  const cake = solidProp([[G.cyl(0.08 * u, 0.08 * u, 0.08 * u, 0, 0, 0), 0xf8e0b0], [G.cyl(0.082 * u, 0.082 * u, 0.02 * u, 0, 0.04 * u, 0), 0xff8ab0], [G.sphere(0.02 * u, 0, 0.07 * u, 0), 0xe02040]], 0.6), house = solidProp([[G.box(0.12 * u, 0.09 * u, 0.04 * u, 0, -0.02 * u, 0), 0xf0e0c0], [G.cone(0.1 * u, 0.07 * u, 0, 0.06 * u, 0), 0xc04a3a]], 0.6), heart = solidProp([[G.extrude((() => { const s = new THREE.Shape(); s.moveTo(0, -0.42); s.bezierCurveTo(-0.55, -0.05, -0.5, 0.42, 0, 0.18); s.bezierCurveTo(0.5, 0.42, 0.55, -0.05, 0, -0.42); return s; })(), 0.2).scale(0.2 * u, 0.2 * u, 0.2 * u), 0xff4a6a]], 0.8);
  group.add(p.group, cloud, dots, cake, house, heart);
  const loop = 6.4, things = [cake, house, heart];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, b = pre ? 0 : between(v, 0.4, 0.9) * (1 - between(v, 5.6, 6.1));
      p.reset().face(0.5); p.group.position.set(px, floor, 0.02 * u); p.bone('armR').rotation.x = 1.5; p.bone('foreR').rotation.x = 2.0; p.raise('L', 0.2); p.bone('head').rotation.x = -0.15; p.bone('head').rotation.z = 0.1 * Math.sin(v * 1.5); p.update();
      const bx = px + 0.4 * u, by = floor + 1.15 * u;
      cloud.set(0, bx, by, 0.0, grow(b)); cloud.commit();
      for (let i = 0; i < 3; i++) dots.set(i, px + (0.12 + 0.1 * i) * u, floor + (0.85 + 0.09 * i) * u, 0.0, between(b, i * 0.2, i * 0.2 + 0.3) * (0.6 + 0.2 * i));
      dots.commit();
      things.forEach((m, i) => { const k = pre ? 0 : between(v, 1.0 + 1.5 * i, 1.3 + 1.5 * i) * (1 - between(v, 2.3 + 1.5 * i, 2.5 + 1.5 * i)) * (i === 2 ? 1 : 1); m.visible = k > 0.01; m.scale.setScalar(grow(k)); m.position.set(bx, by, 0.05 * u); m.rotation.y = 0.4 * Math.sin(v * 2); });
    },
  };
}

// ---- 百 a hundred legs ----
function centipede(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, N = 12;
  const segs = many([[G.sphere(0.06 * u, 0, 0, 0, 1.1, 0.9, 1), 0x8a3a20]], N, 0.45), legs = many([[G.cyl(0.008 * u, 0.008 * u, 0.09 * u, 0, -0.045 * u, 0), 0x5a2010]], N * 4, 0.3);
  const head = solidProp([[G.sphere(0.07 * u), 0xc04a20], [G.sphere(0.015 * u, 0.03 * u, 0.03 * u, 0.05 * u), 0x101010], [G.sphere(0.015 * u, 0.03 * u, 0.03 * u, -0.05 * u), 0x101010], [G.cyl(0.005 * u, 0.005 * u, 0.12 * u, 0.04 * u, 0.09 * u, 0.03 * u, 0, 0, -0.5), 0x5a2010], [G.cyl(0.005 * u, 0.005 * u, 0.12 * u, 0.04 * u, 0.09 * u, -0.03 * u, 0, 0, -0.5), 0x5a2010]], 0.45);
  const count = liveText(u, { h: 0.16, w: 0.36, color: '#ffffff', bg: '#d03030' });
  group.add(segs, legs, head, count);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 4.4), x0 = B.maxX + 1.4 * u - 1.0 * u * f;
      for (let i = 0; i < N; i++) {
        const x = x0 + (i + 1) * 0.085 * u, y = floor + 0.08 * u + 0.015 * u * Math.sin(v * 8 - i * 0.8);
        segs.set(i, x, y, 0.05 * u, 1 - 0.02 * i);
        for (let k = 0; k < 4; k++) { const side = k < 2 ? 1 : -1, ph = Math.sin(v * 14 - i * 0.9 + (k % 2) * Math.PI) * (f > 0 && f < 1 ? 1 : 0.2); legs.set(i * 4 + k, x + (k % 2 ? 0.02 : -0.02) * u, y - 0.02 * u, 0.05 * u + side * 0.05 * u, 1, 0.5 * ph, 0, side * 0.7); }
      }
      segs.commit(); legs.commit();
      head.position.set(x0, floor + 0.09 * u, 0.05 * u); head.rotation.y = Math.PI; head.visible = true;
      count.set(String(Math.round(100 * Math.min(1, f * 1.3)))); count.position.set(B.maxX + 0.75 * u, floor + 0.55 * u, 0.04 * u); count.scale.setScalar(1 + 0.2 * bump(v, 3.4, 0.5));
    },
  };
}

// ---- 語 language ----
function globeHello(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.45 * u, gy = floor + 0.35 * u;
  const globe = solidProp([[G.sphere(0.24 * u), 0x3a8ae0], ...[[0.1, 0.08, 0.2], [-0.12, -0.05, 0.19], [0.05, -0.14, 0.17], [-0.05, 0.15, 0.16]].map(([x, y, z]) => [G.sphere(0.08 * u, x * u, y * u, z * u, 1.2, 0.8, 0.4), 0x50b050])], 0.5);
  const stand = solidProp([[G.torus(0.28 * u, 0.012 * u, Math.PI, 0, 0, 0, -Math.PI / 2), 0xc8a050], [G.cyl(0.015 * u, 0.015 * u, 0.1 * u, 0, -0.33 * u, 0), 0xc8a050], [G.cyl(0.1 * u, 0.12 * u, 0.03 * u, 0, -0.38 * u, 0), 0x8a6a30]], 0.4);
  const words = ['Hello', 'こんにちは', 'Hola', 'Bonjour'].map((w) => textPlane(w, { h: 0.18 * u, color: '#202838', bg: '#ffffff', pad: 0.3 }));
  globe.position.set(gx, gy, 0); stand.position.set(gx, gy, 0);
  group.add(stand, globe, ...words);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      globe.rotation.y = pre ? 0 : v * 1.4;
      words.forEach((w, i) => { const at = 0.4 + 1.4 * i, k = pre ? 0 : between(v, at, at + 0.3) * (1 - between(v, at + 1.2, at + 1.4)), a = -0.6 + i * 0.45; w.visible = k > 0.01; w.scale.setScalar(grow(k)); w.position.set(gx + Math.cos(Math.PI / 2 + a) * -0.4 * u + 0.15 * u, gy + 0.45 * u + 0.05 * u * i % 2, 0.08 * u); });
    },
  };
}

// ---- 森 forest ----
function forestRows(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, N = 12;
  const pines = many([[G.cyl(0.02 * u, 0.025 * u, 0.12 * u, 0, 0.06 * u, 0), 0x6a4020], [G.cone(0.12 * u, 0.22 * u, 0, 0.2 * u, 0), 0xffffff], [G.cone(0.095 * u, 0.18 * u, 0, 0.32 * u, 0), 0xffffff], [G.cone(0.07 * u, 0.14 * u, 0, 0.42 * u, 0), 0xffffff]], N, 0.4);
  const rows = [], r = seeded(17); for (let i = 0; i < N; i++) { const row = Math.floor(i / 4); rows.push([B.maxX + (0.15 + (i % 4) * 0.28 + row * 0.12 + r() * 0.06) * u, row]); }
  rows.forEach(([, row], i) => pines.setColorAt(i, new THREE.Color([0x2e8a3a, 0x237030, 0x1a5a28][row])));
  const mist = many([[G.sphere(0.2 * u, 0, 0, 0, 2, 0.4, 0.6), 0xe8eef4]], 4, 0.6), owl = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1, 1.2, 0.9), 0x8a6a4a], [G.sphere(0.025 * u, -0.025 * u, 0.03 * u, 0.06 * u), 0xffe060], [G.sphere(0.025 * u, 0.025 * u, 0.03 * u, 0.06 * u), 0xffe060], [G.sphere(0.012 * u, -0.025 * u, 0.03 * u, 0.08 * u), 0x101010], [G.sphere(0.012 * u, 0.025 * u, 0.03 * u, 0.08 * u), 0x101010]], 0.5);
  mist.material.transparent = true; mist.material.opacity = 0.22;
  group.add(pines, mist, owl);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.8, 6.4);
      rows.forEach(([x, row], i) => { const at = 0.1 + row * 0.6 + (i % 4) * 0.12, k = pre ? 0 : between(v, at, at + 0.4) * (1 - off), s = (1.8 - 0.35 * row) * (k < 1 ? 1 + 0.15 * Math.sin(Math.PI * k) : 1); pines.set(i, x, floor + row * 0.12 * u, -0.1 * u - row * 0.2 * u, grow(k) * s, 0.03 * Math.sin(t + i)); });
      pines.commit();
      for (let i = 0; i < 4; i++) mist.set(i, B.maxX + 0.3 * u + ((v * 0.1 + i * 0.3) % 1.2) * u, floor + (0.15 + 0.12 * i) * u, 0.05 * u, pre ? 0 : between(v, 2.0, 2.8) * (1 - off));
      mist.commit();
      const o = pre ? 0 : between(v, 2.6, 3.0) * (1 - off), blink = bump(v, 3.6, 0.3) + bump(v, 4.4, 0.3); owl.visible = o > 0.01; owl.scale.set(grow(o), grow(o) * (1 - 0.3 * blink), grow(o)); owl.position.set(B.maxX + 0.55 * u, floor + 0.72 * u, 0.02 * u);
    },
  };
}

// ---- 友 friends ----
function friendsFive(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.6 * u;
  const a = createPerson({ u: 0.8 * u, shirt: 0xff8a40 }), b = createPerson({ u: 0.8 * u, shirt: 0x40a0e0, hair: 0x5a2a14 }), boom = burst(u, { s: 0.35, n: 8, color: 0xffe060 }), dust = many(PUFF(u), 4, 0.3);
  group.add(a.group, b.group, boom, dust);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { run: [0, 1.0, 'out'], five: [1.1, 0.3, 'back'], down: [1.8, 0.3], turn: [2.4, 0.3], walk: [2.7, 3.0, 'linear'] });
      const d = 0.5 * u * (1 - T.run) + 0.17 * u, walking = T.walk > 0 && T.walk < 1;
      [[a, -1], [b, 1]].forEach(([p, s]) => {
        p.reset().face(T.turn > 0.5 ? 'away' : (s < 0 ? 'right' : 'left')); if ((T.run > 0 && T.run < 1) || walking) p.walk(v * 12, 1);
        p.group.position.set(mx + s * (T.turn > 0.5 ? 0.13 * u : d), floor, 0.05 * u - 0.6 * u * T.walk); p.group.scale.setScalar(1 - 0.35 * T.walk); p.group.visible = !pre && T.walk < 0.99;
        const hi = T.five - T.down; p.raise(s < 0 ? 'R' : 'L', 2.7 * hi);
        if (T.turn > 0.5) { p.raise(s < 0 ? 'R' : 'L', 1.6); }
        p.update();
      });
      const k = pre ? 0 : bump(v, 1.3, 0.5); boom.visible = k > 0.01; boom.scale.setScalar(grow(k)); boom.position.set(mx, floor + 0.95 * u, 0.06 * u); boom.rotation.z = v * 3;
      puffs(dust, 0, 4, mx, floor, pre ? 0 : (v - 0.6) / 0.6, u, 0.3); dust.commit();
    },
  };
}

export const SCENES = { 'spade-dig': spadeDig, 'coin-spin': coinSpin, 'glyph-eye': glyphEye, 'paddy-grow': paddyGrow, 'think-bubble': thinkBubble, centipede, 'globe-hello': globeHello, 'forest-rows': forestRows, 'friends-five': friendsFive };
