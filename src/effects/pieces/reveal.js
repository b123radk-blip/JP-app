// Reveal pieces: how the strokes appear. All draw the strokes in stroke order (longer strokes take longer) and publish the
// reveal state every frame in ctx.rv for the materials and particles:
//   progress[si] 0..1, tips[si] (point where the drawn part ends), ringTimes[si][i] (when the front reached sample i),
//   rings (all samples sorted by that time), burned (how many have been reached), frac (burned / all).
// They also reset ctx.so (per-stroke offsets, see glyph-shader.js) every frame, and may move the whole glyph (pose()).
//   draw     optional tip particles (drops, dust, sparks); erase: after a pause the strokes un-draw backwards, then redraw
//   ignite   big flames + sparks at the tip of the stroke being lit
//   grow     the kanji grows up out of its base while drawing, sprouts popping at the pen (grow, plant, life)
//   stamp    drawn on a raised seal that slams down at the end with a puff of dust (name, seal, now)
//   brush    a calligraphy brush draws each stroke, flicking ink (write, sentence, character)
//   assemble every stroke flies in from its own direction while it draws (fit together, build, gather)
import * as THREE from 'three';
import { strokeSchedule, pointAt } from '../../kanji/tube.js';
import { smooth, invSmooth, mulberry32 } from './util.js';
import { createTipEmitter } from './particle-kinds.js';
import { REVEAL_TIPS as TIPS } from '../catalog.js';
import { G, merge, solid, mesh } from './shape-kit.js';


export function create(ctx, spec, start) {
  const sched = strokeSchedule(ctx.strokes, { start, speed: spec.speed, gap: spec.gap });
  const n = ctx.strokes.length, span = sched.end - start;
  const ringTimes = ctx.strokes.map((s, si) => { const { start: s0, dur } = sched.items[si], segs = s.pts.length - 1; return Float32Array.from(s.pts, (_, i) => s0 + invSmooth(i / segs) * dur); });
  const rings = [];
  ringTimes.forEach((times, si) => times.forEach((t, i) => rings.push({ si, i, t })));
  rings.sort((a, b) => a.t - b.t);
  ctx.so = new Float32Array(n * 3);
  ctx.rv = { items: sched.items, end: sched.end, progress: new Float32Array(n), tips: ctx.strokes.map(() => new THREE.Vector3()), ringTimes, rings, burned: 0, frac: 0 };

  const tipNames = TIPS[spec.type] ?? (spec.tip ? [spec.tip] : []);
  const emitters = tipNames.map((name) => createTipEmitter(ctx, name, spec.rate ?? 1));
  const rv = ctx.rv, kind = spec.type;
  // assemble: where each stroke flies in from (seeded, so always the same)
  const rnd = mulberry32(7), from = ctx.strokes.map(() => { const a = rnd() * Math.PI * 2, d = 0.16 + rnd() * 0.08; return [Math.cos(a) * d, Math.sin(a) * d, 0.08 + rnd() * 0.06]; });
  // erase: the time the strokes are shown at (runs backwards while erasing)
  const hold = 1.6, E = Math.max(0.6, span * 0.45), blank = 0.6, cycle = E + blank + span + hold;
  const shown = (t) => {
    if (!spec.erase || t <= sched.end + hold) return t;
    const u = (t - sched.end - hold) % cycle;
    return u < E ? sched.end - (u / E) * span : u < E + blank ? start - 0.01 : u < E + blank + span ? start + (u - E - blank) : sched.end;
  };
  const brush = kind === 'brush' ? makeBrush(ctx, spec) : null;

  function step(t) {
    const ts = shown(t);
    ctx.so.fill(0);
    for (let si = 0; si < n; si++) {
      const it = sched.items[si];
      rv.progress[si] = smooth((ts - it.start) / it.dur); pointAt(ctx.strokes[si].pts, rv.progress[si], rv.tips[si]);
      if (kind === 'assemble') { const k = 1 - smooth((ts - it.start) / (it.dur + 0.35)); for (let c = 0; c < 3; c++) ctx.so[3 * si + c] = from[si][c] * k * ctx.K; }
    }
    let lo = 0, hi = rings.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (rings[m].t <= ts) lo = m + 1; else hi = m; }
    rv.burned = lo; rv.frac = lo / rings.length;
    brush?.step(t, ts, sched);
  }
  // the whole kanji's pose during the reveal (on a pivot at its base): grow rises out of the ground, stamp hovers then lands
  let landed = false;
  function pose(t, o) {
    const u = (t - start) / Math.max(0.01, span);
    if (kind === 'grow') { const k = smooth(u); o.scale.set(0.75 + 0.25 * k, 0.3 + 0.7 * k, 1); return; }
    if (kind !== 'stamp') return;
    const d = t - sched.end;
    if (d < 0) { o.position.z = 0.07 * ctx.K; o.rotation.x = -0.25; o.scale.setScalar(1.12); return; }
    const k = smooth(d / 0.16), squash = d > 0.16 && d < 0.4 ? 0.06 * Math.sin(Math.PI * (d - 0.16) / 0.24) : 0;
    o.position.z = 0.07 * ctx.K * (1 - k); o.rotation.x = -0.25 * (1 - k); o.scale.set(1.12 - 0.12 * k + squash, 1.12 - 0.12 * k - squash, 1);
    o.position.x = d > 0.16 && d < 0.5 ? 0.002 * ctx.K * Math.sin(d * 90) * (0.5 - d) / 0.34 : 0;
  }
  // tip particles on the stroke(s) being drawn right now (and a moment after, so the end of a stroke still splashes)
  function emit(t, dt) {
    if (!emitters.length) return;
    const ts = shown(t);
    emitters.forEach((e) => e.add(dt));
    if (kind === 'stamp') {                                  // no dust while drawing: one puff all round when the seal lands
      if (t >= sched.end + 0.16 && !landed) { landed = true; for (let i = 0; i < 70; i++) { const g = rings[Math.floor(ctx.rnd() * rings.length)]; emitters[0].burst(ctx.strokes[g.si].pts[g.i]); } }
      emitters.forEach((e) => e.settle()); return;
    }
    for (let si = 0; si < n; si++) {
      const p = (ts - sched.items[si].start) / sched.items[si].dur;
      if (p <= 0 || p >= 1.05) continue;
      emitters.forEach((e) => e.fire(rv.tips[si]));
    }
    emitters.forEach((e) => e.settle());
  }
  return { end: sched.end, step, emit, pose, group: brush?.group ?? null, reset: () => { landed = false; emitters.forEach((e) => e.reset()); } };
}

// A calligraphy brush whose tip follows the stroke being drawn, gliding to the start of the next one, then lifting away.
function makeBrush(ctx, spec) {
  const group = new THREE.Group(), L = 0.2 * ctx.K, inner = new THREE.Group();
  const handle = mesh(merge([G.cyl(0.008 * ctx.K, 0.01 * ctx.K, L, 0, L / 2 + 0.04 * ctx.K), G.cyl(0.011 * ctx.K, 0.011 * ctx.K, 0.016 * ctx.K, 0, 0.04 * ctx.K)]), solid(spec.color, 0.2));
  const tip = mesh(G.cone(0.012 * ctx.K, 0.042 * ctx.K, 0, 0.021 * ctx.K, 0, Math.PI), solid(spec.ink, 0.05));
  inner.add(handle, tip); inner.rotation.set(0.35, 0, -0.45); group.add(inner);
  const at = new THREE.Vector3(), next = new THREE.Vector3();
  return {
    group,
    step(t, ts, sched) {
      const items = sched.items;
      let i = items.findIndex((it) => ts < it.start + it.dur);
      if (i < 0) { const d = t - sched.end; group.visible = d < 0.8; at.copy(ctx.strokes.at(-1).pts.at(-1)); group.position.set(at.x + 0.05 * ctx.K * smooth(d / 0.8), at.y + 0.12 * ctx.K * smooth(d / 0.8), ctx.rz * 1.2); return; }
      group.visible = true;
      const it = items[i], pts = ctx.strokes[i].pts;
      if (ts >= it.start) pointAt(pts, smooth((ts - it.start) / it.dur), at);
      else { const prev = i ? ctx.strokes[i - 1].pts.at(-1) : pts[0], k = i ? smooth((ts - items[i - 1].start - items[i - 1].dur) / Math.max(0.01, it.start - items[i - 1].start - items[i - 1].dur)) : 1; next.copy(pts[0]); at.lerpVectors(prev, next, k); }
      const lift = ts < it.start ? 0.012 * ctx.K : 0;
      group.position.set(at.x, at.y, ctx.rz * 1.2 + lift);
    },
  };
}
