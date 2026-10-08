// Step 1 scenes, part T: time. One picture for this / next / last / every: a row of three tiles of the unit beside the
// word (years 2025 2026 2027, months 9月 10月 11月, weeks as seven dots, days as suns; the middle tile is now).
//   this-unit    今: a spotlight comes down on the middle tile, a frame lands round it and it bounces: this one, now.
//                unit now (今): three clocks, the middle one ticking; day / week / month / year: 今日 今週 今月 今年
//   next-unit    来: the frame sits on the middle tile, an arrow points right, the frame steps onto the next tile, which
//                pops (来週 来月 来年)
//   last-unit    先: the left tile is faded like an old photo; an arrow points back, the frame steps onto it (先週 先月)
//   every-unit   毎: a stamp hops along the row and stamps a red tick on every tile, thump, thump, thump. unit cups (毎):
//                a teapot hops along a row of cups and fills every one; day / week / month / year: 毎日 毎週 毎月 毎年
//   year-seasons 年: a little tree runs through the seasons (pink blossom, green, red leaves, bare with snow), a counter
//                ticks the year on when winter ends
//   clock-hours  時: a clock beside the kanji: the long hand sweeps round, the short hand steps an hour each turn and a
//                bell on top rings on the hour. outcome sometimes: a bird pops out of the top only now and then, at uneven
//                times (時々); span: a coloured wedge fills the face as the hands move on: the time that went by (時間)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, liveText } from './helpers.js';
import { grow } from './step1-kit.js';
import { birdThing } from './step1-c.js';

const LABELS = { year: ['2025', '2026', '2027', '2028'], month: ['9月', '10月', '11月', '12月'], week: ['月〜日', '月〜日', '月〜日', '月〜日'] };
const frame = (u, w, h, color) => solidProp([[G.box(w + 0.04 * u, 0.03 * u, 0.02 * u, 0, h / 2, 0), color], [G.box(w + 0.04 * u, 0.03 * u, 0.02 * u, 0, -h / 2, 0), color], [G.box(0.03 * u, h, 0.02 * u, w / 2, 0, 0), color], [G.box(0.03 * u, h, 0.02 * u, -w / 2, 0, 0), color]], 1.2);
const arrow = (u, color) => solidProp([[G.box(0.18 * u, 0.05 * u, 0.02 * u, -0.05 * u, 0, 0), color], [G.cone(0.06 * u, 0.1 * u, 0.08 * u, 0, 0, -Math.PI / 2), color]], 1.0);

// the row of tiles: 4 tiles (the 4th waits off to the right for "next"); i = 0 left (past), 1 now, 2 next
function tileRow(stage, unit, { n = 4 } = {}) {
  const u = stage.u, B = stage.box, W = 0.3 * u, H = 0.36 * u, gap = 0.36 * u, x0 = B.maxX + 0.3 * u, y = B.minY + 0.42 * u;
  const g = new THREE.Group(), cards = many([[G.box(W, H, 0.02 * u), 0xffffff]], n, 0.5);
  const icons = [];
  if (unit === 'day') icons.push(many([[G.sphere(0.085 * u), 0xffb030], ...Array.from({ length: 8 }, (_, i) => [G.box(0.02 * u, 0.05 * u, 0.01 * u, Math.cos(i * 0.785) * 0.12 * u, Math.sin(i * 0.785) * 0.12 * u, 0, i * 0.785 + Math.PI / 2), 0xffc040])], n, 1.0));
  else if (unit === 'now') icons.push(many([[G.cyl(0.12 * u, 0.12 * u, 0.02 * u, 0, 0, 0, Math.PI / 2, 0, 0, 28), 0xffffff], [G.torus(0.12 * u, 0.012 * u), 0x404858]], n, 0.6), many([[G.box(0.016 * u, 0.1 * u, 0.01 * u, 0, 0.045 * u, 0), 0x202830]], 2 * n, 0.4));
  else LABELS[unit].slice(0, n).forEach((l) => icons.push(textPlane(l, { h: (unit === 'week' ? 0.085 : 0.11) * u, color: '#202838', weight: 900 })));
  g.add(cards, ...icons);
  const paper = new THREE.Color(0xfffaf0), old = new THREE.Color(0xc8b090);
  return {
    group: g, x: (i) => x0 + i * gap, y, W, H, drawCalls: 1 + icons.length,
    // show: per tile [dx, dy, scale, age (0 fresh .. 1 old photo)], hands: the clock hands' angles of tile i
    place(slots, t = 0) {
      slots.forEach(([dx, dy, k, age], i) => {
        const x = x0 + i * gap + dx, yy = y + dy;
        cards.set(i, x, yy, -0.02 * u, k); cards.setColorAt(i, paper.clone().lerp(old, age));
        if (unit === 'day') icons[0].set(i, x, yy, 0, k * 0.85, t * 0.3 * (i === 1 ? 1 : 0));
        else if (unit === 'now') { icons[0].set(i, x, yy, 0, k); const tt = i === 1 ? t : 2 + i * 3; icons[1].set(2 * i, x, yy, 0.012 * u, k, -tt * 0.5); icons[1].set(2 * i + 1, x, yy, 0.012 * u, k * 0.7, -tt * 0.04 - i * 2); }
        else { const m = icons[i]; m.position.set(x, yy, 0.012 * u); m.scale.setScalar(grow(k)); m.visible = k > 0.01; m.material.color.setScalar(1 - 0.35 * age); }
      });
      cards.commit(); cards.instanceColor.needsUpdate = true;
      if (unit === 'day' || unit === 'now') { icons[0].commit(); if (icons[1]) icons[1].commit(); }
    },
  };
}

function thisUnit(ctx, spec, stage) {
  const u = stage.u, row = tileRow(stage, spec.unit ?? 'now', { n: 3 }), group = new THREE.Group();
  const box = frame(u, row.W + 0.04 * u, row.H + 0.04 * u, 0xffd040), light = solidProp([[G.cone(0.3 * u, 0.9 * u, 0, -0.45 * u, 0), 0xfff4b0]], 1.0);
  light.material.transparent = true; light.material.opacity = 0.0;
  group.add(row.group, light, box);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tiles: [0, 0.6, 'back'], light: [0.8, 0.5], frame: [1.3, 0.4, 'back'], off: [4.6, 0.6] });
      const k = pre ? 0 : T.tiles * (1 - T.off), hop = 0.06 * u * (bump(v, 1.7, 0.35) + bump(v, 2.1, 0.35));
      row.place([0, 1, 2].map((i) => [0, i === 1 ? hop : 0, grow(k) * (i === 1 ? 1 + 0.12 * T.frame * (1 - T.off) : 0.9), i === 0 ? 0.7 : 0]), v);
      light.material.opacity = 0.35 * T.light * (1 - T.off); light.visible = T.light > 0.01; light.position.set(row.x(1), row.y + 0.95 * u, 0.02 * u);
      const f = pre ? 0 : T.frame * (1 - T.off); box.visible = f > 0.01; box.scale.setScalar(grow(f) * 1.12); box.position.set(row.x(1), row.y + hop, 0.02 * u);
    },
  };
}

function nextUnit(ctx, spec, stage) {
  const u = stage.u, row = tileRow(stage, spec.unit ?? 'year', { n: 3 }), group = new THREE.Group();
  const box = frame(u, row.W + 0.04 * u, row.H + 0.04 * u, 0x40e0a0), go = arrow(u, 0x40e0a0);
  group.add(row.group, box, go);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tiles: [0, 0.6, 'back'], frame: [0.6, 0.4, 'back'], arrow: [1.2, 0.5, 'back'], step: [1.9, 0.6, 'out'], off: [4.8, 0.6] });
      const k = pre ? 0 : T.tiles * (1 - T.off), pop = 0.15 * bump(v, 2.4, 0.5);
      row.place([0, 1, 2].map((i) => [0, 0, grow(k) * (i === 2 ? 1 + 0.12 * T.step + pop : 0.92), i === 0 ? 0.7 : 0]), v);
      const f = pre ? 0 : T.frame * (1 - T.off); box.visible = f > 0.01; box.scale.setScalar(grow(f) * (1.1 + 0.12 * T.step)); box.position.set(row.x(1) + (row.x(2) - row.x(1)) * T.step, row.y, 0.02 * u);
      const a = pre ? 0 : T.arrow * (1 - T.off) * (1 - T.step * 0.0); go.visible = a > 0.01; go.scale.setScalar(grow(a)); go.position.set(row.x(1) + 0.18 * u + 0.08 * u * Math.sin(v * 6) * (1 - T.step), row.y + row.H / 2 + 0.12 * u, 0.04 * u);
    },
  };
}

function lastUnit(ctx, spec, stage) {
  const u = stage.u, row = tileRow(stage, spec.unit ?? 'month', { n: 3 }), group = new THREE.Group();
  const box = frame(u, row.W + 0.04 * u, row.H + 0.04 * u, 0xd0a060), back = arrow(u, 0xd0a060); back.rotation.z = Math.PI;
  group.add(row.group, box, back);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tiles: [0, 0.6, 'back'], frame: [0.6, 0.4, 'back'], arrow: [1.2, 0.5, 'back'], step: [1.9, 0.7, 'out'], off: [4.8, 0.6] });
      const k = pre ? 0 : T.tiles * (1 - T.off), sway = 0.08 * Math.sin(v * 2) * T.step;
      row.place([0, 1, 2].map((i) => [0, 0, grow(k) * (i === 0 ? 1 + 0.1 * T.step : 0.92), i === 0 ? 0.8 : i === 1 ? 0 : 0]), v);
      const f = pre ? 0 : T.frame * (1 - T.off); box.visible = f > 0.01; box.scale.setScalar(grow(f) * (1.1 + 0.1 * T.step)); box.position.set(row.x(1) + (row.x(0) - row.x(1)) * T.step, row.y, 0.02 * u); box.rotation.z = sway;
      const a = pre ? 0 : T.arrow * (1 - T.off); back.visible = a > 0.01; back.scale.setScalar(grow(a)); back.position.set(row.x(1) - 0.18 * u - 0.08 * u * Math.sin(v * 6) * (1 - T.step), row.y + row.H / 2 + 0.12 * u, 0.04 * u);
    },
  };
}

function everyUnit(ctx, spec, stage) {
  if ((spec.unit ?? 'cups') === 'cups') return everyCup(ctx, spec, stage);
  const u = stage.u, row = tileRow(stage, spec.unit, { n: 3 }), group = new THREE.Group();
  const stamp = solidProp([[G.cyl(0.07 * u, 0.09 * u, 0.12 * u, 0, 0.06 * u, 0), 0xc83030], [G.cyl(0.03 * u, 0.03 * u, 0.12 * u, 0, 0.18 * u, 0), 0x8a5a30], [G.sphere(0.05 * u, 0, 0.26 * u, 0), 0x8a5a30]], 0.5);
  const ticks = many([[G.poly([[-0.07 * u, 0], [-0.015 * u, -0.06 * u], [0.08 * u, 0.07 * u]], 0.018 * u), 0xe02020]], 3, 1.0);
  group.add(row.group, stamp, ticks);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tiles: [0, 0.6, 'back'], off: [4.9, 0.6] }), k = pre ? 0 : T.tiles * (1 - T.off);
      row.place([0, 1, 2].map(() => [0, 0, grow(k) * 0.95, 0]), v);
      // hops: 0.8, 1.7, 2.6: lift, move over, slam
      const hop = Math.min(2, Math.max(0, Math.floor((v - 0.8) / 0.9))), ph = pre ? 0 : ((v - 0.8) / 0.9) - hop;
      const x = v > 3.5 ? row.x(2) + 0.6 * u * between(v, 3.5, 4.2) : row.x(Math.min(2, Math.floor(Math.max(0, (v - 0.8) / 0.9))));
      const slam = v > 0.8 && v < 3.5 ? Math.abs(Math.sin(Math.PI * ph)) : 1;
      stamp.visible = !pre && T.off < 1 && v < 4.2; stamp.position.set(x, row.y + row.H / 2 - 0.02 * u + 0.25 * u * slam, 0.08 * u); stamp.rotation.x = 0.4;
      for (let i = 0; i < 3; i++) { const d = pre ? 0 : between(v, 0.8 + i * 0.9 + 0.45, 0.8 + i * 0.9 + 0.6) * (1 - T.off); ticks.set(i, row.x(i), row.y, 0.03 * u, d); }
      ticks.commit();
    },
  };
}
function everyCup(ctx, spec, stage) {
  const B = stage.box, u = 1.35 * stage.u, group = new THREE.Group(), floor = B.minY, X = (i) => B.maxX + (0.2 + 0.28 * i) * u;
  const cups = many([[G.cyl(0.09 * u, 0.07 * u, 0.12 * u, 0, 0.06 * u, 0, 0, 0, 0, 20), 0xf4efe6], [G.torus(0.04 * u, 0.012 * u, Math.PI * 2, 0.1 * u, 0.06 * u, 0), 0xf4efe6]], 4, 0.5), tea = many([[G.cyl(0.08 * u, 0.08 * u, 0.01 * u, 0, 0, 0), 0x6aa040]], 4, 0.7);
  const pot = solidProp([[G.sphere(0.14 * u, 0, 0.12 * u, 0, 1.1, 0.9, 1), 0x3a7a5a], [G.cyl(0.02 * u, 0.03 * u, 0.16 * u, -0.17 * u, 0.15 * u, 0, 0, 0, 0.9), 0x3a7a5a], [G.torus(0.07 * u, 0.015 * u, Math.PI * 1.2, 0.13 * u, 0.16 * u, 0, -0.6), 0x3a7a5a], [G.sphere(0.03 * u, 0, 0.24 * u, 0), 0xc8a050]], 0.45);
  const stream = solidProp([[G.cyl(0.012 * u, 0.012 * u, 1, 0, -0.5, 0), 0x7ab050]], 0.8);
  group.add(cups, tea, pot, stream);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.3, 5.8);
      for (let i = 0; i < 4; i++) { cups.set(i, X(i), floor, 0, pre ? 0 : 1 - off); const f = pre ? 0 : between(v, 0.7 + i * 1.0, 1.3 + i * 1.0) * (1 - off); tea.set(i, X(i), floor + 0.02 * u + 0.09 * u * f, 0, f > 0.01 ? 1 : 0); }
      cups.commit(); tea.commit();
      const i = Math.min(3, Math.max(0, Math.floor((v - 0.4) / 1.0))), ph = ((v - 0.4) / 1.0) - i, pour = !pre && v > 0.4 && v < 4.4 && ph > 0.3 && ph < 0.9;
      const px = X(i) + 0.17 * u, py = floor + 0.32 * u + 0.12 * u * (ph < 0.3 ? Math.sin(Math.PI * ph / 0.3) : 0);
      pot.visible = !pre && v < 4.6; pot.position.set(px, py, 0.02 * u); pot.rotation.z = pour ? 0.5 : 0.05;
      stream.visible = pour; stream.position.set(X(i) + 0.02 * u, py + 0.05 * u, 0.02 * u); stream.scale.set(1, py - floor - 0.05 * u, 1);
    },
  };
}

// ---- 年 the seasons of a year ----
const SEASON = [[0xffa0c8, 0x7a4a24], [0x3aa040, 0x7a4a24], [0xe86020, 0x7a4a24], [0xf8f8ff, 0x6a4a34]];
function yearSeasons(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.55 * u;
  const trunk = solidProp([[G.cyl(0.04 * u, 0.06 * u, 0.5 * u, 0, 0.25 * u, 0), 0x7a4a24], [G.cyl(0.02 * u, 0.03 * u, 0.25 * u, 0.08 * u, 0.5 * u, 0, 0, 0, -0.7), 0x7a4a24], [G.cyl(0.02 * u, 0.03 * u, 0.25 * u, -0.08 * u, 0.48 * u, 0, 0, 0, 0.7), 0x7a4a24]], 0.35);
  const crown = many([[G.sphere(0.13 * u), 0xffffff]], 6, 0.5), fall = many([[G.sphere(0.025 * u, 0, 0, 0, 1.3, 0.4, 1), 0xffffff]], 8, 0.8);
  const year = liveText(u, { h: 0.18, w: 0.42, color: '#ffffff', bg: '#3a3a48' }), sun = solidProp([[G.sphere(0.07 * u), 0xffc040]], 1.2);
  trunk.position.set(tx, floor, -0.05 * u); year.position.set(tx, floor + 1.02 * u, 0.04 * u);
  group.add(trunk, crown, fall, year, sun);
  const loop = 6.8, C = [[0, 0.68, 1.1], [-0.15, 0.6, 0.9], [0.15, 0.6, 0.9], [-0.08, 0.8, 0.8], [0.09, 0.79, 0.85], [0, 0.55, 0.8]];
  const col = new THREE.Color(), col2 = new THREE.Color();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // four seasons of 1.4 s from v = 0.4; the year number goes up when winter ends
      const s = pre ? 0 : Math.max(0, (v - 0.4) / 1.4), si = Math.min(3, Math.floor(s)), f = s - si, blend = between(f, 0.75, 1) * (si < 3 ? 1 : 0);
      col.setHex(SEASON[si][0]).lerp(col2.setHex(SEASON[Math.min(3, si + 1)][0]), blend);
      const bare = si === 3 ? 0.55 : 1;
      C.forEach(([x, y, k], i) => { crown.set(i, tx + x * u, floor + y * u, 0, k * bare * (1 + 0.03 * Math.sin(t * 2 + i))); crown.setColorAt(i, col); });
      crown.commit(); crown.instanceColor.needsUpdate = true;
      for (let i = 0; i < 8; i++) { const g = ((v * 0.6 + i / 8) % 1); fall.set(i, tx - 0.3 * u + (i % 4) * 0.2 * u + 0.05 * u * Math.sin(g * 8 + i), floor + 0.9 * u - 0.9 * u * g, 0.08 * u, !pre && si !== 1 ? Math.sin(Math.PI * g) : 0, g * 5); fall.setColorAt(i, si === 3 ? col2.setHex(0xffffff) : col); }
      fall.commit(); fall.instanceColor.needsUpdate = true;
      const y = 2026 + (pre ? 0 : v > 6.0 ? 1 : 0); year.set(String(y)); year.scale.setScalar(1 + 0.2 * bump(v, 6.0, 0.4));
      const a = Math.PI * (0.15 + 0.7 * (1 - (si === 1 ? 0 : si === 3 ? 1 : 0.5))); sun.position.set(tx - 0.35 * u, floor + 0.55 * u + 0.3 * u * Math.sin(a), -0.15 * u); sun.visible = si !== 3;
    },
  };
}

// ---- 時 a clock ----
const M4 = new THREE.Matrix4(), V3 = new THREE.Vector3(), S3 = new THREE.Vector3(), Q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);
function clockHours(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.55 * u, cy = B.cy + 0.02 * u, R = 0.36 * u, mode = spec.outcome ?? 'hours';
  const face = solidProp([[G.cyl(R, R, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 40), 0xfaf6ea], [G.torus(R, 0.03 * u), 0x8a5a30], ...Array.from({ length: 12 }, (_, i) => [G.box(0.018 * u, 0.06 * u, 0.01 * u, Math.sin(i * Math.PI / 6) * R * 0.82, Math.cos(i * Math.PI / 6) * R * 0.82, 0.02 * u, -i * Math.PI / 6), 0x303848]), [G.sphere(0.025 * u, 0, 0, 0.03 * u), 0x303848]], 0.45);
  const hands = many([[G.box(0.025 * u, 1, 0.01 * u, 0, 0.5, 0), 0x202830]], 2, 0.4);
  const bell = solidProp([[G.sphere(0.09 * u, 0, -0.04 * u, 0, 1, 1, 1), 0xe8b030], [G.sphere(0.03 * u, 0, -0.13 * u, 0), 0xa07020]], 0.7), bellPivot = new THREE.Group(), rings = many([[G.torus(0.12 * u, 0.008 * u), 0xffe080]], 2, 1.0);
  bellPivot.add(bell); bellPivot.position.set(cx, cy + R + 0.12 * u, 0);
  const wedge = many([[new THREE.CircleGeometry(R * 0.92, 2, 0, Math.PI / 12), 0x60a0ff]], 24, 0.6), bird = mode === 'sometimes' ? birdThing(0.3 * u) : null;
  face.position.set(cx, cy, -0.02 * u);
  group.add(face, hands, bellPivot, rings); if (mode === 'span') group.add(wedge); if (bird) group.add(bird);
  const loop = mode === 'span' ? 6.0 : 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // the long hand: one turn per 1.6 s; the short hand steps an hour each turn
      const turns = pre ? 0 : v / 1.6, m = turns * Math.PI * 2, h = (Math.floor(turns) + between(turns % 1, 0, 0.15)) * Math.PI / 6 + (mode === 'span' ? 0 : 0);
      hands.setMatrixAt(0, M4.compose(V3.set(cx, cy, 0.03 * u), Q.setFromAxisAngle(Z, -m), S3.set(1, R * 0.85, 1)));
      hands.setMatrixAt(1, M4.compose(V3.set(cx, cy, 0.035 * u), Q.setFromAxisAngle(Z, -h), S3.set(1.3, R * 0.55, 1)));
      hands.commit();
      const ding = mode === 'hours' && !pre ? Math.max(...[1.6, 3.2, 4.8].map((x) => (v >= x && v < x + 0.6 ? 1 - (v - x) / 0.6 : 0)), v < 0.6 ? 1 - v / 0.6 : 0) : 0;
      bellPivot.rotation.z = 0.5 * Math.sin(v * 18) * ding;
      for (let i = 0; i < 2; i++) { const f = 1 - ding + i * 0.3; rings.set(i, cx, cy + R + 0.08 * u, -0.01 * u, ding > 0.05 && f < 1 ? 1 + 1.5 * f : 0); }
      rings.commit();
      if (mode === 'span') { const span = pre ? 0 : Math.min(1, v / 4.8) * (1 - between(v, 5.4, 5.9)); for (let i = 0; i < 24; i++) wedge.set(i, cx, cy, 0.0, i < Math.floor(span * 12) ? 1 : 0, Math.PI / 2 - (i + 1) * Math.PI / 12); wedge.commit(); }
      if (bird) { const pops = [0.5, 1.4, 3.6], p = pre ? 0 : Math.max(...pops.map((x) => bump(v, x, 0.7))); bird.visible = p > 0.01; bird.position.set(cx, cy + R + 0.02 * u + 0.18 * u * p, 0.04 * u); bird.scale.setScalar(grow(p)); }
    },
  };
}

export const SCENES = { 'this-unit': thisUnit, 'next-unit': nextUnit, 'last-unit': lastUnit, 'every-unit': everyUnit, 'year-seasons': yearSeasons, 'clock-hours': clockHours };
