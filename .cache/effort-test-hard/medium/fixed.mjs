// Task F — fixed scene: 6 s pure loop. Ball rolls in (0-2 s), bounces (3.0-3.5 s), rolls back (4-6 s).
// o = { ball: {x, y}, glyph: {rotY}, board: {rotX, rotY} } (plain numbers, radians).

const L = 6;
const R = Math.PI / 180;
const clamp01 = (s) => Math.min(1, Math.max(0, s));
const ease = (s) => s * s * (3 - 2 * s); // smoothstep

export function step(t, o) {
  const v = ((t % L) + L) % L; // negative t must wrap too

  // ball x: 0.8 -> 1.2 over 0..2 s, hold, 1.2 -> 0.8 over 4..6 s (loop closes)
  if (v < 2) o.ball.x = 0.8 + 0.4 * ease(v / 2);
  else if (v <= 4) o.ball.x = 1.2;
  else o.ball.x = 1.2 - 0.4 * ease((v - 4) / 2);

  // single bounce 3.0 -> 3.5 s: same smoothstep window for ball height and glyph turn
  const s = clamp01((v - 3) / 0.5);
  const e = ease(s);
  o.ball.y = 0.1 + 0.3 * Math.sin(Math.PI * e);
  o.glyph.rotY = 15 * R * Math.sin(Math.PI * e);

  // board: tilted 30 deg toward the learner (x), turned 20 deg about y, all the time
  o.board.rotX = 30 * R;
  o.board.rotY = 20 * R;
  return o;
}
