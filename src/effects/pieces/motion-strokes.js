// Motions that move single strokes instead of the whole kanji (they add to ctx.so, the per-stroke offsets the materials
// apply, see glyph-shader.js). Like the other motions they start once the strokes are drawn.
//   split   the strokes on either side of the middle move apart, hold, and come back together (divide, cut, half)
//   jiggle  every stroke wobbles on its own, like jelly (strange, change)
import { EFFECTS } from '../../config.js';
import { smooth } from './util.js';

const centroid = (s) => s.pts.reduce((a, p) => [a[0] + p.x / s.pts.length, a[1] + p.y / s.pts.length], [0, 0]);

export const MOVES = {
  split: (ctx, s) => {
    const ax = s.axis === 'y' ? 1 : 0, c = ctx.strokes.map(centroid), lo = Math.min(...c.map((p) => p[ax])), hi = Math.max(...c.map((p) => p[ax]));
    const mid = (lo + hi) / 2, dead = 0.08 * (hi - lo);
    const side = c.map((p) => (p[ax] - mid > dead ? 1 : p[ax] - mid < -dead ? -1 : 0));
    return (idle) => {
      const u = idle % s.every, open = smooth(u / 0.45) * (1 - smooth((u - 0.45 - s.hold) / 0.5));
      side.forEach((d, si) => { ctx.so[3 * si + ax] += d * s.dist * ctx.K * open; });
    };
  },
  jiggle: (ctx, s) => (idle) => {
    for (let si = 0; si < ctx.strokes.length; si++) {
      const a = s.amp * ctx.K * Math.min(1, idle / EFFECTS.idleRamp);
      ctx.so[3 * si] += a * Math.sin(idle * s.speed + si * 2.1); ctx.so[3 * si + 1] += a * Math.sin(idle * s.speed * 1.3 + si * 1.3 + 1);
    }
  },
};

export function create(ctx, spec) {
  const fn = MOVES[spec.type](ctx, spec);
  return { step() { if (ctx.idle > 0) fn(ctx.idle); } };
}
