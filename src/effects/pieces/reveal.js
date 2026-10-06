// Reveal pieces: how the strokes appear. Both draw the strokes in stroke order (longer strokes take longer) and publish the
// reveal state every frame in ctx.rv for the materials and particles:
//   progress[si] 0..1, tips[si] (point where the drawn part ends), ringTimes[si][i] (when the front reached sample i),
//   rings (all samples sorted by that time), burned (how many have been reached), frac (burned / all).
// "draw": optional tip particles (drops, dust, sparks). "ignite": big flames + sparks at the tip of the stroke being lit.
import * as THREE from 'three';
import { strokeSchedule, pointAt } from '../../kanji/tube.js';
import { smooth, invSmooth } from './util.js';
import { createTipEmitter } from './particle-kinds.js';

export function create(ctx, spec, start) {
  const sched = strokeSchedule(ctx.strokes, { start, speed: spec.speed, gap: spec.gap });
  const n = ctx.strokes.length;
  const ringTimes = ctx.strokes.map((s, si) => { const { start: s0, dur } = sched.items[si], segs = s.pts.length - 1; return Float32Array.from(s.pts, (_, i) => s0 + invSmooth(i / segs) * dur); });
  const rings = [];
  ringTimes.forEach((times, si) => times.forEach((t, i) => rings.push({ si, i, t })));
  rings.sort((a, b) => a.t - b.t);
  ctx.rv = { items: sched.items, end: sched.end, progress: new Float32Array(n), tips: ctx.strokes.map(() => new THREE.Vector3()), ringTimes, rings, burned: 0, frac: 0 };

  const tipNames = spec.type === 'ignite' ? ['front', 'sparks'] : spec.tip ? [spec.tip] : [];
  const emitters = tipNames.map((name) => createTipEmitter(ctx, name, spec.rate ?? 1));
  const rv = ctx.rv;

  function step(t) {
    for (let si = 0; si < n; si++) { rv.progress[si] = smooth((t - sched.items[si].start) / sched.items[si].dur); pointAt(ctx.strokes[si].pts, rv.progress[si], rv.tips[si]); }
    let lo = 0, hi = rings.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (rings[m].t <= t) lo = m + 1; else hi = m; }
    rv.burned = lo; rv.frac = lo / rings.length;
  }
  // tip particles on the stroke(s) being drawn right now (and a moment after, so the end of a stroke still splashes)
  function emit(t, dt) {
    if (!emitters.length) return;
    emitters.forEach((e) => e.add(dt));
    for (let si = 0; si < n; si++) {
      const p = (t - sched.items[si].start) / sched.items[si].dur;
      if (p <= 0 || p >= 1.05) continue;
      emitters.forEach((e) => e.fire(rv.tips[si]));
    }
    emitters.forEach((e) => e.settle());
  }
  return { end: sched.end, step, emit, reset: () => emitters.forEach((e) => e.reset()) };
}
