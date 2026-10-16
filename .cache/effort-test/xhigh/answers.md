# Effort test — label: xhigh

Started: 2026-10-16T19:33:00.672Z

## A. A piece on a tilted board

Board rotation is a pure +35° about x, so local vectors map through
R_x(35°) with cos 35° = 0.8192, sin 35° = 0.5736 (positive rotation.x turns +y toward +z, per the project convention):

- piece local (−0.06, 0.05, −0.10) → world offset
  (−0.06, 0.8192·0.05 − 0.5736·(−0.10), 0.5736·0.05 + 0.8192·(−0.10))
  = (−0.06, 0.0983, −0.0532). Adding the group origin (0.95, 0.12, 0.08):
  (0.89, 0.2183, 0.0268).
- The top normal (0, 1, 0) maps to (0, 0.8192, 0.5736). Its z component is
  positive, i.e. toward the learner: the board's top leans *toward* the viewer
  (its far edge, at negative local z, is the raised one — consistent with the
  piece's negative local z becoming world y +0.057).

ANSWER: 1) (0.890, 0.218, 0.027). 2) (0, 0.819, 0.574); the top is turned toward the learner.

## B. Walking down a slope

1) Surface at z = 0.40: y = (0.5 − 0.40) × tan 20° = 0.1 × 0.36397 = 0.0364.
   Feet 0.045 above that: 0.0814.
2) Walk direction: Δx = 0.52 − 0.80 = −0.28, Δz = 0.40 − (−0.45) = +0.85.
   A model with turn 0 faces +z; a rotation.y = θ turns its forward vector to
   (sin θ, 0, cos θ) (three.js is right-handed, and −90° faces left/−x, matching
   the cheat sheet). So θ = atan2(Δx, Δz) = atan2(−0.28, 0.85) = −18.232°.
   The sign is negative because the path goes left (−x) while coming toward the learner.

ANSWER: 1) 0.081. 2) rotation.y ≈ −18.23° (−0.318 rad).

## C. Can he reach it?

1) Shoulder (0.88, 0.62, −0.15) → bar (0.85, 0.95, −0.15): Δ = (−0.03, +0.33, 0).
   Distance = √(0.03² + 0.33²) = √0.1098 = 0.331 u. That exceeds his 0.30 u
   reach, so he cannot hold it there.
2) Keep x 0.85 and z −0.15; the arm then allows at most
   √(0.30² − 0.03²) = 0.2985 u above the shoulder, i.e. the bar can be as high
   as y = 0.62 + 0.2985 = 0.9185. Lowering the target from 0.95 to 0.918 (a 0.032
   change) puts the distance at exactly 0.300 and still leaves it ~0.30 u above
   his shoulder — "lift it high" survives. The strictly smallest movement is
   0.331 − 0.30 = 0.031 u along the shoulder→bar line, landing at
   (0.853, 0.919, −0.15).

ANSWER: 1) No — shoulder-to-bar distance is 0.331 u, more than the 0.30 u reach. 2) Lower the plan's bar target to y ≈ 0.918 (same x/z): distance 0.300, still well above his head. (Smallest possible change: shift the target 0.031 u along the shoulder→bar line to (0.853, 0.919, −0.15).) Don't fix the arm or the model's size: arm length and model height are fixed catalog values the checker measures against the real models — stretching the arm distorts the person (and the project rule is "don't stretch the arm, move the person/target"), and rescaling the model breaks his proportions and consistency with every other card that uses him. The plan has to fit the model, not the other way round.

## D. Write a step function

`step.mjs` (this folder): wraps t into the loop with `v = ((t % 6) + 6) % 6`,
then bar: 0.2 for v < 1.5; 0.2 + 0.3·smoothstep((v−1.5)/0.9) for 1.5 ≤ v < 2.4;
0.5 for 2.4 ≤ v < 4.2; 0.5 − 0.3·s² with s = (v−4.2)/0.4 for 4.2 ≤ v < 4.6; 0.2
after. glyph: 0.06·sin(π(v−4.6)/0.3) for 4.6 ≤ v ≤ 4.9, else 0 (ends clamped to
exactly 0). Verified with node:

```
step(2.0)  -> { bar: 0.3748971193415638, glyph: 0 }     (s = 0.5556, smoothstep = 0.583)
step(4.4)  -> { bar: 0.4249999999999999, glyph: 0 }     (s = 0.5, 0.5 − 0.3·0.25)
step(4.75) -> { bar: 0.2, glyph: 0.06 }                 (sin(π/2) = 1)
step(-1)   -> { bar: 0.2, glyph: 0 }                    (v wraps to 5)
```

Edge checks: step(1.5) → 0.2, step(2.4) → 0.5, step(4.2) → 0.5, step(4.6) → 0.2,
step(4.9) → 0, step(6) and step(7) → 0.2 / 0, step(−0.5) → 0.2 / 0.

ANSWER: t = 2.0 → bar 0.375, glyph 0; t = 4.4 → bar 0.425, glyph 0; t = 4.75 → bar 0.2, glyph 0.06; t = −1 → bar 0.2, glyph 0.

## E. Reading the checker

1) The goal window 4.65–4.8 s is only 0.15 s wide and lies *between* two sample
   times (the checker measures at 4.5 and 5.0, never in between), so the checker
   had no measurement inside the window and reported "no moment measured" — a
   spurious FAIL. The scene is actually fine: the hand is on the piece from
   4.6 to 5.2 s, which covers the window and includes the sample at t = 5.0.
   Change in the scene: make the contact robustly straddle a sample, e.g. keep
   the hand on the piece 4.6–5.5 s; and change the goal window so it contains a
   sample, e.g. 4.9–5.1 (or 4.5–5.0). In the report: "FAIL was a sampling
   artifact — the goal window sat between the 0.5 s samples; contact verified at
   t = 5.0, window widened, goal now passes."
2) "Sits on the cushion" passes because the goal only measures *touch*: any
   part of the person touching the cushion satisfies it, and his feet do. The
   scene is not right — hips 0.13 u above the cushion with level thighs is a
   stand/squat on the cushion, not sitting. A better goal measures the sitting
   pose itself, e.g. "his hip (pelvis) point is within 0.03 u above the
   cushion's top surface" (hip y − cushion top y ∈ [0, 0.03]), or a goal that the
   hip/seat point touches the cushion top, with the thigh-level check as a
   second goal.

ANSWER: 1) The 0.15 s goal window falls between the 0.5 s samples (4.5, 5.0), so nothing was measured; the scene's 4.6–5.2 contact is valid (it covers t = 5.0). Widen the contact (e.g. to 4.6–5.5) and the goal window (e.g. 4.9–5.1) so a sample lands inside, and report the FAIL as a window/sampling artifact with contact verified at 5.0 s. 2) The goal passes on feet-only touch because it checks "touches cushion", not sitting; the scene is wrong (floating hips). A better goal measures the hip/seat height relative to the cushion top (within ~0.03 u above it).

## F. Find the flaws in this plan

Numbers used: the girl's arm reach is 0.30 u (project standard); the kanji sits
on the floor with its right edge at x 0, so it occupies roughly x −0.9…0,
y 0…1 (u ≈ 1); scenes live in that frame (stage box: maxX = kanji right edge,
minY = floor).

1. **The show-off is unreachable.** Pen target (0.9, 0.85, −0.3) is 0.45 u above
   her shoulder at y 0.4 (distance √(0.05² + 0.45²) ≈ 0.45 from a shoulder near
   x 0.85–0.9), far beyond the 0.30 u reach — and 0.85 is 0.35 u above the head
   of a 0.5-tall girl, a strange "show it off" height anyway. Fix: lower the
   show-off to y ≤ ~0.68, e.g. 0.65 (still clearly above her head, 0.25 above
   the shoulder, reachable with margin).
2. **Writing is unreachable, because the "desk" is a floor slab.** Desk 0.6 ×
   0.05 × 0.4 flat on the floor means its top is at y 0.05. Her shoulder is at
   y 0.4, z −0.3, so shoulder→paper ≈ √(0.35² + 0.3²) ≈ 0.46 u > 0.30 u: she
   cannot touch the paper while writing. Fix: give the desk legs so its top is
   ~y 0.30, stand her right at the back edge (z ≈ −0.22), and have her write
   near the near edge of the paper — then shoulder→paper ≈ 0.16 u, reachable.
3. **The writing (the card's meaning) sits at floor level, below the eyeline.**
   Learner's eyes are at y 0.3; a paper at y 0.05 puts the whole action low and
   small at the bottom of the screen. Fix 2 (desk top ≈ 0.30) puts the writing
   at eye level.
4. **The girl's x is unspecified.** Her reach, the show-off distance and the
   composition all depend on it. Fix: state it (e.g. x 0.9, centred behind the
   desk).
5. **The pen's height/depth while writing (2.5–5.5 s) is unspecified.** The
   goal "pen touches the paper" can only pass if the pen tip is at the paper's
   y/z (after fix 2: y ≈ 0.30, z ≈ 0); as written the plan leaves that open.
   Fix: state that the pen tip follows the paper surface while writing.
6. **The loop doesn't close.** At 6 s the pen is at x 1.1, but the loop
   restarts with the pen elsewhere (its position for v 0–1.0 is not even
   specified) — a visible teleport every 6 s. Fix: finish the stroke by ~5.4 s
   and carry the pen back to its v = 0 position (lifting it off the paper) so
   the 6.0 s frame equals the 0 s frame.
7. **The goal window 3.1–3.3 s contains no sample.** The checker samples every
   0.5 s (3.0, 3.5, …); a 0.2 s window between them yields "no moment
   measured" and a spurious FAIL even when the pen really is on the paper.
   Fix: widen it to cover a sample, e.g. 3.0–3.4 s.
8. **The speech bubble sits in the kanji's footprint and away from the
   speaker.** The kanji spans leftward from x 0 and rises from the floor, so
   (x −0.6, y 0.4) lands on the kanji's own strokes at mid-height — hiding part
   of it (or being hidden behind it) — and it is ~1.5 u from the girl who says
   "できた!". Fix: put the bubble above her head, e.g. (0.9, ~0.62, −0.3).
9. **The bubble has no timing.** "Pops up" — when? It must appear at a stated
   moment (sensibly after the word is finished, ~5.5 s) and must be gone at the
   loop boundary (or present from 0 s), or it will pop discontinuously at the
   loop restart.
10. **The paper's size is unspecified.** The pen writes x 0.8 → 1.1 (0.3 u), so
    the sheet must cover at least that span plus margin; as written it could be
    smaller, and part of the "word" would be written on bare desk or air. Fix:
    size it, e.g. 0.36 × 0.25 centred at (0.95, 0.30, 0).

ANSWER: ten problems — (1) show-off 0.45 u above the shoulder vs 0.30 u reach: lower it to ~y 0.65; (2) desk top at 0.05 makes writing unreachable (shoulder→paper ≈ 0.46 u): raise the desk to ~0.30 top and stand her at z ≈ −0.22; (3) writing at floor level is below the y 0.3 eyeline: solved by the desk height; (4) girl's x unspecified: state x 0.9; (5) pen's y/z while writing unspecified: pin it to the paper surface; (6) loop discontinuity at 6 s (pen at x 1.1 vs start): return the pen to its start position by 6.0; (7) goal window 3.1–3.3 has no 0.5 s sample: widen to e.g. 3.0–3.4; (8) bubble at (−0.6, 0.4) sits on the kanji and 1.5 u from the speaker: move it above her head; (9) bubble timing missing: pop at ~5.5 and clear it before the loop restarts; (10) paper size missing: make it cover x 0.8–1.1, e.g. 0.36 × 0.25.

Ended: 2026-10-16T19:34:56.754Z

Unsure: nothing material — the only assumption is the project-standard 0.30 u arm reach used for C and F (the task gives it for C, and I extended it to the 0.5-tall girl in F).
