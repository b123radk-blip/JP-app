// F. fixed.mjs -- the scene done exactly as the truth says.
//   Loop 6 s. Pure: seek(t) may be called at any t (negative included), any order,
//   any number of times, on the same object. No state, no randomness.
const L = 6;
const DEG = Math.PI / 180;
const ease = (s) => s * s * (3 - 2 * s);        // smoothstep
const clamp01 = (s) => Math.min(1, Math.max(0, s));

export function step(t, o) {
  const v = ((t % L) + L) % L;                  // wrap ANY t into [0, L)
  // ball x: 0.8 -> 1.2 (0..2 s, smoothstep), wait at 1.2 (2..4 s), 1.2 -> 0.8 (4..6 s, smoothstep)
  if (v < 2) o.ball.x = 0.8 + 0.4 * ease(v / 2);
  else if (v < 4) o.ball.x = 1.2;
  else o.ball.x = 1.2 - 0.4 * ease((v - 4) / 2);
  // one bounce during 3.0..3.5 s; s runs 0 -> 1 over the half second (clamped, so the
  // formula gives exactly 0.1 / exactly 0 outside the window)
  const s = clamp01((v - 3) / 0.5);
  o.ball.y = 0.1 + 0.3 * Math.sin(Math.PI * ease(s));
  // the kanji turns up to 15 degrees TOWARD the ball (radians) with the same s
  o.glyph.rotY = 15 * DEG * Math.sin(Math.PI * s);
  // the board: tilted 30 degrees toward the learner (rotation.x), turned 20 degrees
  // about y (rotation.y), all the time, radians
  o.board.rotX = 30 * DEG;
  o.board.rotY = 20 * DEG;
  return o;
}
