// step.mjs — pure frame function for a 6 s loop: a barbell's height (bar) and the kanji's landing jump (glyph).
// No state, no random, no Date. t may be negative or larger than the loop.
const LOOP = 6;
const smoothstep = (s) => 3 * s * s - 2 * s * s * s;

export function step(t) {
  const v = ((t % LOOP) + LOOP) % LOOP; // time within the loop (works for negative t)

  let bar;
  if (v < 1.5) {
    bar = 0.2; // rest low
  } else if (v < 2.4) {
    bar = 0.2 + 0.3 * smoothstep((v - 1.5) / 0.9); // lift 0.2 -> 0.5, smoothstep
  } else if (v < 4.2) {
    bar = 0.5; // hold high
  } else if (v < 4.6) {
    const s = (v - 4.2) / 0.4;
    bar = 0.5 - 0.3 * s * s; // drop back to 0.2, ease-in (s^2)
  } else {
    bar = 0.2;
  }

  const g = v >= 4.6 && v <= 4.9 ? 0.06 * Math.sin(Math.PI * (v - 4.6) / 0.3) : 0;
  const glyph = Math.abs(g) < 1e-12 ? 0 : g; // kill the floating-point residue at the ends of the bump

  return { bar, glyph };
}
