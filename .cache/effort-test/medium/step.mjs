// Task D: a 6 s loop, pure function of t (t may be negative or > 6).
// bar:   barbell height (0.2 at rest, 0.5 lifted); glyph: the kanji's jump when it lands.
const LOOP = 6;
const wrap = (t) => ((t % LOOP) + LOOP) % LOOP;   // negative t -> time within the loop
const smoothstep = (s) => 3 * s * s - 2 * s * s * s;

export function step(t) {
  const v = wrap(t);
  let bar;
  if (v < 1.5) bar = 0.2;                                                        // rest
  else if (v < 2.4) { const s = (v - 1.5) / 0.9; bar = 0.2 + 0.3 * smoothstep(s); } // rise, smoothstep
  else if (v < 4.2) bar = 0.5;                                                    // hold
  else if (v < 4.6) { const s = (v - 4.2) / 0.4; bar = 0.2 + 0.3 * (1 - s * s); }  // fall, ease-in (s²)
  else bar = 0.2;                                                                 // landed
  const glyph = (v >= 4.6 && v <= 4.9) ? 0.06 * Math.sin(Math.PI * (v - 4.6) / 0.3) : 0;
  return { bar, glyph };
}
