// Shared pieces for the Step 1 scenes (Step 2c): the families that need one look across many cards.
//   weekStrip   the seven days 月火水木金土日 in a row, one of them lit (the weekday words: 2 draw calls)
//   withWeek    wraps an element scene (月 moon, 火 fire ...) into its weekday word: the scene smaller, the strip above the word
//   countTag    a round number badge that pops up (1, 2, 3 ...) when a thing is counted (1 draw call, redraws on change)
//   monthGrid   a calendar month whose days light up one by one to a date, which gets a red ring (the 〜日 words: 4 dc)
//   seeded      a tiny deterministic random generator (star fields, scattered snow)
import * as THREE from 'three';
import { acts, timeline } from './timeline.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { many } from '../pieces/kit-things.js';
import { G } from '../pieces/shape-kit.js';
import { between, liveText } from './helpers.js';

export const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
export function seeded(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }
export const grow = (f) => Math.max(1e-3, f);

// seven tiles with the day kanji; tile `day` (0 = 月 ... 6 = 日) lights up when on > 0. Origin at the strip's middle.
export function weekStrip(u, day, { w = 1.5 } = {}) {
  const g = new THREE.Group(), cell = w / 7;
  const label = textPlane(DAYS.join(''), { h: 0.2 * u, w: w * u, color: '#ffffff', bg: '#2a3048', size: 0.92 });
  const lit = solidProp([[G.box(cell * u * 0.98, 0.22 * u, 0.01 * u, 0, 0, 0), day === 6 ? 0xff5a5a : day === 5 ? 0x4a8aff : 0xffc040]], 1.0);
  label.position.z = 0.012 * u; lit.position.set((day - 3) * cell * u, 0, 0.004 * u);
  g.add(lit, label);
  return Object.assign(g, { drawCalls: 2, light(on, t = 0) { lit.scale.set(1, Math.max(1e-3, on), 1); lit.visible = on > 0.01; lit.material.userData.glow.value = 0.8 + 0.4 * Math.sin(t * 5) * on; } });
}

// The weekday word: the element's own scene played at `scale` about the word's right end, and the strip above the word
// lighting `day` once the strokes are drawn. make(ctx, spec, stage) builds the element's scene as usual.
export function withWeek(make, day, ctx, spec, stage, { scale = 0.85, lift = 0 } = {}) {
  const u = stage.u, B = stage.box, inner = make(ctx, { ...spec, outcome: null }, stage), group = new THREE.Group(), holder = new THREE.Group();
  holder.add(inner.group); holder.scale.setScalar(scale); holder.position.set(B.maxX * (1 - scale), B.minY * (1 - scale) + lift * u, 0);
  const strip = weekStrip(u, day, { w: Math.max(1.5, B.w / u * 1.05) });
  strip.position.set(B.cx, B.maxY + 0.22 * u, 0.02 * u);
  group.add(holder, strip);
  return {
    group,
    step(t) {
      inner.step(t);
      const A = acts(ctx, t, 1e9), on = A.u < 0 ? 0 : between(A.u, 0, 0.5);
      strip.light(on, t);
    },
  };
}

// a round badge with a number: badge.show(n, k) (k: 0..1 pop size); origin at its middle
export function countTag(u, { color = '#ffffff', bg = '#e04848', s = 0.22 } = {}) {
  const m = liveText(u, { h: s, w: s, color, bg });
  m.show = (n, k) => { m.set(String(n)); m.visible = k > 0.01; m.scale.setScalar(Math.max(1e-3, k)); };
  return m;
}

// a month on a wall calendar: 5 rows of 7 days; days 1..date light up in order (lit: 0..1 how far), then a red ring lands
// on the date. Origin at the middle of the page. 4 draw calls (page, header, the day cells, the ring).
export function monthGrid(u, date, { w = 0.78 } = {}) {
  const g = new THREE.Group(), cw = w / 7, h = cw * 5;
  const page = solidProp([[G.box(w * u + 0.06 * u, h * u + 0.24 * u, 0.03 * u, 0, 0.06 * u, -0.02 * u), 0xf8f4ea], [G.box(w * u + 0.06 * u, 0.13 * u, 0.035 * u, 0, h * u / 2 + 0.115 * u, -0.018 * u), 0xd83838]], 0.5);
  const cells = many([[G.box(cw * u * 0.84, cw * u * 0.84, 0.012 * u), 0xffffff]], 35, 0.6);
  const off = new THREE.Color(0xd8d2c4), on = new THREE.Color(0xffc040), today = new THREE.Color(0xff6a4a);
  const at = (d) => { const i = d - 1; return [(i % 7 - 3) * cw * u, (2 - Math.floor(i / 7)) * cw * u]; };
  for (let i = 0; i < 35; i++) { const [x, y] = at(i + 1); cells.set(i, x, y, 0.004 * u, 1); cells.setColorAt(i, off); }
  cells.commit();
  const num = textPlane(String(date), { h: 0.24 * u, color: '#d02020', weight: 900 }), ring = solidProp([[G.torus(cw * u * 0.62, 0.014 * u), 0xe02020]], 0.9);
  const [rx, ry] = at(date); ring.position.set(rx, ry, 0.02 * u);
  num.position.set(w * u / 2 - 0.12 * u, h * u / 2 + 0.115 * u, 0.01 * u);
  g.add(page, cells, ring, num);
  let shown = -1;
  return Object.assign(g, {
    drawCalls: 4, cellAt: (d) => at(d),
    // lit 0..1: how many days are lit (up to the date); k: the ring's pop
    show(lit, k) {
      const n = Math.round(lit * date);
      if (n !== shown) { shown = n; for (let i = 0; i < 35; i++) cells.setColorAt(i, i < n ? (i === date - 1 ? today : on) : off); cells.instanceColor.needsUpdate = true; }
      ring.visible = k > 0.01; ring.scale.setScalar(Math.max(1e-3, k)); num.visible = k > 0.01; num.scale.setScalar(Math.max(1e-3, k));
    },
  });
}

// The 〜日 word: the month grid beside the word lights day by day up to `date`, the ring pops, and the number's own thing
// (a mesh from thing(u), origin at its feet) hops onto the date. Loop 5.6 s.
export function dayScene(ctx, stage, date, thing) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cal = monthGrid(u, date), cx = B.maxX + 0.46 * u, cy = B.cy - 0.06 * u, size = 1;
  cal.position.set(cx, cy, 0); const mascot = thing(0.32 * u);
  group.add(cal, mascot);
  const loop = 5.6, [dx, dy] = cal.cellAt(date);
  return {
    group, drawCalls: cal.drawCalls + (mascot.drawCalls ?? 1),
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lit: [0.1, Math.min(2.6, 0.5 + 0.12 * date), 'linear'], ring: [2.9, 0.4, 'back'], hop: [3.3, 0.6], fade: [5.1, 0.4] });
      cal.show(pre ? 0 : T.lit * (1 - T.fade), pre ? 0 : T.ring * (1 - T.fade));
      const h = T.hop, sx = cx + 0.25 * u, sy = B.minY;
      mascot.visible = !pre && T.fade < 1;
      mascot.position.set(sx + (cx + dx - sx) * h, sy + (cy + dy - 0.06 * u * size - sy) * h + 0.35 * u * size * Math.sin(Math.PI * h), 0.06 * u);
      mascot.scale.setScalar(grow(1 - T.fade));
    },
  };
}

// The 〜つ word: n things drop one by one into their places (x, y pairs from the caller), a tag counting each; they stay,
// then all lift away. thing: a many() of the thing (n copies, 1 draw call). Loop 6 s.
export function countScene(ctx, stage, n, things, places, { tagUp = 0.28, tagDx = 0 } = {}) {
  const u = stage.u, group = new THREE.Group(), tag = countTag(u);
  group.add(things, tag);
  const loop = 6, gap = Math.min(0.55, 3.0 / n);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 0 : between(v, 5.0, 5.6);
      let last = -1;
      for (let i = 0; i < n; i++) {
        const at = 0.2 + i * gap, f = pre ? 0 : between(v, at, at + 0.35), [x, y] = places[i];
        if (f > 0) last = i;
        things.set(i, x, y + (1 - f) * 0.9 * u + off * 1.2 * u, 0.02 * u, f > 0 ? 1 - off : 0, 0.15 * Math.sin(v * 3 + i) * (1 - f));
      }
      things.commit();
      if (last >= 0) { const [x, y] = places[last], k = pre ? 0 : between(v, 0.2 + last * gap + 0.3, 0.2 + last * gap + 0.45) * (1 - off); tag.show(last + 1, k); tag.position.set(x + tagDx * u, y + tagUp * u, 0.08 * u); }
      else tag.show(1, 0);
    },
  };
}
