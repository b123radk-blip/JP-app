# Effort test — label: medium

Start: 2026-10-16T19:30:55.739Z

## A. A piece on a tilted board

**Working.** The board only rotates about x, so the piece's world position is `origin + Rx(35°)·local`. A positive
`rotation.x` turns +y toward +z, so: `x' = x`, `y' = y·cos θ − z·sin θ`, `z' = y·sin θ + z·cos θ`.
With cos 35° = 0.819152, sin 35° = 0.573576 and local (−0.06, 0.05, −0.10):
- x: 0.95 + (−0.06) = 0.89
- y: 0.12 + 0.05·0.819152 − (−0.10)·0.573576 = 0.12 + 0.040958 + 0.057358 = 0.218315
- z: 0.08 + 0.05·0.573576 + (−0.10)·0.819152 = 0.08 + 0.028679 − 0.081915 = 0.026764

(verified with node)

1. World (0.89, 0.218, 0.027) u.
2. The top normal local (0,1,0) maps to (0, cos 35°, sin 35°) = **(0, 0.819, 0.574)**. Its z-component is positive,
   and z runs toward the learner, so **the top is turned toward the learner** (tilted face-on rather than edge-on).

ANSWER: A1 (0.89, 0.218, 0.027) u; A2 (0, 0.819, 0.574) — top turned toward the learner.

## B. Walking down a slope

**Working.** tan 20° = 0.363970.
1. At z = 0.40 the surface is at y = (0.5 − 0.40) × 0.363970 = 0.036397. Feet 0.045 above: 0.036397 + 0.045 = 0.081397.
2. Direction of travel: Δx = 0.52 − 0.80 = −0.28, Δz = 0.40 − (−0.45) = +0.85. A model at `rotation.y = 0` faces +z,
   and a positive `rotation.y` turns the facing from +z toward +x (the facing direction is (sin φ, 0, cos φ)),
   so the needed turn is φ = atan2(Δx, Δz) = atan2(−0.28, 0.85) = −18.232°.
   Sanity: the person walks left (x decreasing) and toward the learner (z increasing), i.e. left-forward,
   so a *negative* turn from +z — the sign is right.

ANSWER: B1 y = 0.081 u; B2 rotation.y = −18.232° (facing left and toward the learner, along the path).

## C. Can he reach it?

**Working.** Shoulder (0.88, 0.62, −0.15), target (0.85, 0.95, −0.15).
Distance = √((0.85−0.88)² + (0.95−0.62)² + 0²) = √(0.0009 + 0.1089) = √0.1098 = 0.331361.
Max reach 0.30, so he is short by 0.031361 u.

1. No: 0.331 u > 0.30 u.
2. The smallest change to the target is to move it straight down the line toward the shoulder by 0.031361
   (the perpendicular distance to the reach sphere). Unit vector toward the shoulder:
   (0.03, −0.33, 0)/0.331361 = (0.090535, −0.995888, 0). New target:
   (0.85 + 0.002839, 0.95 − 0.031232, −0.15) = **(0.853, 0.919, −0.15)**. The bar still sits ~0.30 u above the
   shoulder and well over his head, so "lift it high" is kept. (A simpler almost-as-small fix: lower the target
   to y 0.918, keeping x — distance 0.2995 ≤ 0.30.)

   Changing the arm or scaling the model is the wrong fix because the model's anatomy is a fixed fact shared by
   every card that uses it: its arm length and body height were measured once (`measure`) and other scenes,
   goals and comparisons rely on those numbers. Stretching one arm (or scaling him) to fit this one plan breaks
   the model for all the other cards, changes his height/visibility (other goals would need re-checking), and
   just looks wrong — a real person can't lift 0.331 over a 0.30 arm. The plan's target is the free variable;
   the actor's reach is the constraint. (Cheat sheet: "If the target is farther away, move the person closer.
   Don't stretch the arm.")

ANSWER: C1 no — 0.331 u apart, 0.031 u short. C2 move the target to (0.853, 0.919, −0.15) (0.031 u toward the shoulder); arm/model changes are wrong because the model's size is a shared measured fact, not a scene parameter.

## D. Step function

Wrote `.cache/effort-test/medium/step.mjs` (see file; pure, no state/random/Date; `v = ((t % 6) + 6) % 6`).
Structure: 0.2 until 1.5; rise `0.2 + 0.3·smoothstep((v−1.5)/0.9)` to 2.4; hold 0.5 until 4.2;
fall `0.2 + 0.3·(1 − s²)` with `s = (v−4.2)/0.4` (value starts at 0.5, derivative grows → accelerating); 0.2 after 4.6.
`glyph = 0.06·sin(π(v−4.6)/0.3)` for 4.6 ≤ v ≤ 4.9, else 0. Loop is continuous (v→6 and v=0 both give 0.2, glyph 0).

Tested with node:

| t | v (in loop) | bar | glyph |
|---|---|---|---|
| −1 | 5 | 0.2 | 0 |
| 2.0 | 2.0 | 0.374897 | 0 |
| 4.4 | 4.4 | 0.425 | 0 |
| 4.75 | 4.75 | 0.2 | 0.06 |

Extras checked: t = −5 → {0.2, 0} (negative wrap), t = 7.75 → {0.256584, 0} (wraps to v = 1.75, mid-rise),
t = 2.4/4.2 → 0.5 exactly, t = 4.6 → 0.2 / glyph 0, t = 4.9 → glyph ≈ 0 (sin π).

ANSWER: t = 2.0 → { bar: 0.375, glyph: 0 }; t = 4.4 → { bar: 0.425, glyph: 0 }; t = 4.75 → { bar: 0.2, glyph: 0.06 }; t = −1 → { bar: 0.2, glyph: 0 } (v = 5).

## E. Reading the checker

**E1.** What is wrong: the goal's time window (t+4.65 to t+4.8) is narrower than the 0.5 s scan step and sits
entirely between two sample moments (4.5 and 5.0), so the checker never once measures the scene inside the window —
`e.n` stays 0 and the report prints "no moment measured". The *scene* is not the problem: the hand is on the piece
from 4.6 to 5.2 s, which covers both 4.5 and 5.0. Nothing needs changing in the scene. What to change: the goal —
widen `t` so it contains scan moments, e.g. `t: [4.5, 5.0]` (or `[4.5, 5.5]`); both sample moments fall inside the
hand-on-piece period, so the goal then PASSes. (Aside: in the current `scripts/inspect.mjs`, a `--goals` run with
`--scan` also adds the goal's midpoint 4.73 as its own measured moment, so this exact FAIL only appears with
`--scan 0` where only the `--times` moments are measured — either way the fix is the same: don't give a goal a
0.15 s window that no measured moment can land in.)
Report line: the scene is fine (hand measured on the piece, e.g. at t+4.5 and t+5.0); the goal was mis-specified —
its window fell between scan moments, so it was never measured; re-checked with `t: [4.5, 5.0]` and it PASSES.

ANSWER: E1 window off the 0.5 s grid → goal never measured; change the goal's `t` to [4.5, 5.0] (scene unchanged); report that the goal's window missed every sample moment, scene verified OK.

**E2.** Why it PASSes: `rests`-style goals measure the gap between the two things' *bounding boxes* (plus the
support text under the box). Grandpa's box bottom is his feet; the feet touch the cushion, so the box gap is 0 and
the support line reads "grandpa: touches cushion" with no fault ("in the air" / floating) → PASS. But
"sits on the cushion" is not "his lowest point touches the cushion": with thighs level and hips 0.13 u above the
cushion he is floating in mid-air, not sitting. So the goal passing does **not** mean the scene is right — the
scene is wrong (he is not actually sitting). A better goal measures the part of the body that defines sitting:
`{ "goal": "he sits on the cushion", "point": "grandpa hips", "near": "cushion", "within": 0.05, "t": [...] }`
— the hips must be at most 0.05 u from the cushion's top (the floating-hips case measures 0.13 u apart and FAILs),
ideally combined with the existing rests-on check so the whole pose is constrained.

ANSWER: E2 it passes because `rests` only measures the box-to-box gap (feet touch → gap 0); the scene is not right — he floats; a better goal is a point goal "grandpa hips near cushion within 0.05" (plus rests-on).

## F. Flaws in the 書 plan

1. **Desk height / reach.** A 0.6 × 0.05 × 0.4 board flat on the floor has its top at y ≈ 0.05 — that's a floor
   mat, not a desk. The paper sits at y ≈ 0.06, ~0.34 u below her shoulder (0.4) and ~0.3 u in front of her
   (z −0.3 → desk centre z 0): distance ≥ ~0.47 u, far beyond a 0.5-tall chibi's ~0.17 u arm. Fix: give the desk
   legs so its top is at ~0.28–0.3 u (child-desk height for a 0.5-tall), put the sheet near the desk's back edge
   (z ≈ −0.15) and her at the desk edge (z ≈ −0.22); then verify with `measure` at a writing moment that
   shoulder-to-pen ≤ arm reach.
2. **"Raises the pen above her head to y 0.85" is unreachable.** 0.85 is 0.45 u above her shoulder (0.4) and 0.35 u
   above the top of her head (0.5) — no arm does that (C1 showed a full-grown arm is 0.30; hers is ~0.17). Max
   raise ≈ 0.57–0.62. Fix: show-off pose at (0.9, ~0.62, −0.3), still clearly "above the head", still readable.
3. **The pen's writing span (x 0.8 → 1.1) outruns her right reach.** At x 1.1 the pen is 0.2 u to the right of her
   shoulder (x 0.9) — at the edge of or past a 0.5-tall's arm, before any vertical/horizontal offset. Fix: shorten
   the span (e.g. x 0.85 → 1.0, still ~0.15 u of "writing"), or move her/ the sheet to the right; verify with
   `measure` at v = 5.4.
4. **The loop is not seamless.** The plan ends the 6 s loop with the pen at x 1.1 on the desk, but the next loop's
   1.0 s already needs the pen in her raised hand at (0.9, 0.85, −0.3) — a jump of ~0.2 u in x and ~0.8 u in y at
   the 6→0 boundary; the plan also never says where the pen is at 0–1.0 s. Rule: the last frame must look like the
   first. Fix: define the resting pose (pen in her hand at her side, e.g. (0.9, ~0.3, −0.3)) for 0–1.0 s and add a
   5.5–6.0 beat that brings the pen back from x 1.1 to that resting pose, so t = 6 frame = t = 0 frame.
5. **Speech bubble position hides the kanji.** x −0.6, y 0.4 (x measured from the kanji's right edge, y 0.4 ≈ mid
   kanji) puts the bubble directly on the kanji itself (which spans roughly x −1 to 0) — it would hide the kanji
   from the learner and sit on the story-panel/meaning-label side. Scenes play on the kanji, to its right, above
   it, or in depth. Fix: move the "できた!" bubble to the girl's head (x ≈ 0.9, y ≈ 0.6, above her, after she
   finishes) or to the upper right (x ≈ 1.0, y ≈ 1.1).
6. **Speech bubble timing unspecified (and must loop).** "Pops up" with no seconds — and if it pops at some point
   and is still up at 6 s, the next loop starts with it visible. Fix: pop at ~5.5 s (after the last stroke of
   writing) and fade out by ~5.9 s, before the loop point.
7. **Goal "pen touches the paper" checked 3.1–3.3 s will never be measured.** No multiple of the 0.5 s scan step
   falls in [3.1, 3.3] (4.5/5.0 style, here 3.0 and 3.5 are both outside) → same failure as E1: "no moment
   measured" even though the pen is on the paper the whole 2.5–5.5 s. Fix: a grid-aligned window, e.g.
   `t: [3.0, 3.5]` (or check the whole writing span `[2.5, 5.5]`); the scene already satisfies it there.
8. **The 2.0–2.5 s transition is unspecified and fast.** "Show it off, then writes": between 2.0 s (pen at
   (0.9, 0.85, −0.3)) and 2.5 s (pen at x 0.8 on the paper at y ≈ 0.06) the pen must travel ~0.8 u in 0.5 s —
   fine only if it is an explicit, eased beat (lower the pen back into writing position), not an accidental
   lerp through unspecified keyframes. Fix: state the beat explicitly (2.0–2.5: pen from show-off pose to the
   start of the line, eased).
9. **Props not named.** The goals and `measure` find things by name; the plan mentions desk, paper and pen but
   never says they are named. Fix: `desk.name = 'desk'; paper.name = 'paper'; pen.name = 'pen'` (the goal
   `point: "pen", near: "paper"` depends on it).
10. **Minor: girl 0.5 tall vs the standard KID height.** The scene constants use ADULT 0.9 / TEEN 0.75 / KID 0.55;
    a one-off 0.5-tall girl is inconsistent with other cards' kids. Fix: use `actor(..., 0.55 * u)` (KID) and keep
    the shoulder at ~0.44 instead of 0.4.

ANSWER: ten flaws — floor-level desk making the paper unreachable (raise desk to ~0.28 u + reposition sheet/girl); impossible above-head raise to y 0.85 (use ~0.62); writing span to x 1.1 outruns her arm (shorten to ~0.85→1.0); non-seamless loop (pen at x 1.1 at 6 s vs in hand at 1 s, 0–1.0 s undefined — add a 5.5–6.0 return beat); bubble at x −0.6 y 0.4 hides the kanji (move to her head/upper right); bubble pop timing unspecified and must end before 6 s; goal window 3.1–3.3 s off the 0.5 s scan grid (use 3.0–3.5); 2.0–2.5 s pen transition unspecified/fast (make it an explicit eased beat); props not named for goals/measure; girl 0.5 vs standard KID 0.55.

## Last step

One-line uncertainty: I'm least sure of the exact arm-reach number for a 0.5-tall chibi (I estimated ~0.17 u by
scaling C's 0.30 reach for a shorter body, and of the exact kanji's on-screen extent used to judge the bubble's
overlap) — in real work those are settled with `measure`, not by hand.

End: 2026-10-16T19:32:26.300Z
