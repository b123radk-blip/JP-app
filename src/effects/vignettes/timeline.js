// The clock every vignette shares. A vignette is a short scene that acts out a card's meaning in three acts:
//   set-up   while the strokes draw (actors walk on, the board and nail appear)       v < 0 (seconds before the last stroke)
//   action   once the kanji is complete (the hammer swings)                           0 <= v < loop
//   settle   the end of the action, which must leave the scene as it was at v = 0, so the action loops seamlessly
// Everything is a pure function of t, so seek(t) always gives the same frame (no state, no randomness).
import { clamp01, smooth } from '../pieces/util.js';

export const EASE = {
  linear: (x) => x,
  smooth,
  in: (x) => x * x * x,                                       // speeds up (a hammer coming down, a fall)
  out: (x) => 1 - Math.pow(1 - x, 3),                         // slows down (a throw rising, a slide stopping)
  back: (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },   // overshoots, settles
  bounce: (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; },
};

// Where we are in the scene. loop: length of the action (s). Returns
//   setup 0..1 (how far the strokes are drawn), u (s since the last stroke, < 0 before), v (s into the current loop of the
//   action; = u while negative), n (which loop), s (seconds since the first stroke started).
export function acts(ctx, t, loop) {
  const start = ctx.rv.items[0]?.start ?? 0, end = ctx.rv.end, u = t - end;
  return { setup: clamp01((t - start) / Math.max(0.01, end - start)), u, v: u < 0 ? u : u % loop, n: u < 0 ? -1 : Math.floor(u / loop), s: t - start };
}

// beats: { name: [at, dur, ease?] } -> { name: 0..1 }, each eased (default smooth). 0 before `at`, 1 after at + dur.
export function timeline(v, beats) {
  const out = {};
  for (const [name, [at, dur, ease = 'smooth']] of Object.entries(beats)) {
    const x = clamp01((v - at) / Math.max(1e-3, dur));
    out[name] = x <= 0 ? 0 : x >= 1 ? 1 : EASE[ease](x);           // exact ends (back and bounce are off by 1e-16 there)
  }
  return out;
}

// 0 -> 1 -> 0 over [at, at + dur] (a squash, a flash, a jump)
export const bump = (v, at, dur) => { const x = (v - at) / dur; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); };
// a damped wobble that starts at `at` (an impact): amplitude 1 decaying over `dur` seconds, `hz` swings a second
export const wobble = (v, at, dur = 0.6, hz = 9) => { const x = v - at; return x < 0 || x > dur ? 0 : Math.sin(x * hz * Math.PI * 2) * (1 - x / dur); };
// steady shaking (strain, fear, pain) of amplitude 1
export const tremble = (v, hz = 14) => Math.sin(v * hz * 2 * Math.PI) * 0.6 + Math.sin(v * hz * 1.7 * 2 * Math.PI + 1) * 0.4;
export const lerp = (a, b, x) => a + (b - a) * x;
