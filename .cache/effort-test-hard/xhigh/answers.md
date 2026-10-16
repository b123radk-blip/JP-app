# Effort test — label xhigh

Started: 2026-10-16T19:55:41.419Z

## A

Notes first: three.js Euler `'XYZ'` composes as R = Rx(20°)·Ry(30°)·Rz(0), so P's rotation matrix is

```
[ 0.866025   0         0.5     ]
[ 0.171010   0.939693  -0.296198]
[-0.469846   0.342020   0.813798]
```

and C's **scale 0.5 also scales G's position offset**: (0, 0.3, 0) → (0, 0.15, 0) → Rz(90°) → (−0.15, 0, 0),
plus C's position (0.2, 0, 0.1) gives G at (0.05, 0, 0.1) in P's frame. (Direction answers are unaffected by
scale; only position 1 depends on it.)

Work: G world = P.pos + R_P·(0.05, 0, 0.1) = (1.0, 0.1, −0.2) + (0.093301, −0.021069, 0.057887).
G's local +y in world = R_P·(Rz90·ŷ) = R_P·(−1, 0, 0) = −(P's first column).
P-local of (1.2, 0.5, 0.0) = R_Pᵀ·(0.2, 0.4, 0.2) (round-trips exactly, checked with three.js).

ANSWER: 1. (1.093, 0.079, −0.142)   2. (−0.866, −0.171, 0.470)   3. (0.148, 0.444, 0.144)

## B

Shoulder→cup: dy = 0.45 − 0.55 = −0.10, dz = 0.05 − (−0.1) = 0.15. Reach 0.30 requires
dx² ≤ 0.09 − 0.01 − 0.0225 = 0.0575 → |dx| ≤ 0.239792 → x(t) ≥ 1 − 0.239792 = 0.760208.
The cup sits at 0.6 until t = 1 (out of reach: d = √(0.4²+0.0325) = 0.4387), then smoothsteps to 1.1 by t = 3
and stays there (x = 1.1 → d = √(0.01+0.0325) = 0.2062, in reach). So it becomes reachable once
0.6 + 0.5·(3s²−2s³) = 0.760208 with s = (t−1)/2, i.e. 3s²−2s³ = 0.320417 → s = 0.377846 → t = 1 + 2s = 1.755692,
and stays reachable for the rest of the interval (the cup never leaves x 1.1).

ANSWER: between t = 1.76 s and t = 4.00 s (within the given 0–4 s interval; it stays in reach after 4 s too, since the cup holds at x 1.1).

## C

Eye E = (−0.45, 0.35, 2.6). A segment E→P is blocked if, on its x/y/z ranges, the t-ranges overlap.

1. Head (0.95, 0.62, −0.25): the line is inside the cabinet's x∩z slab only for t ∈ [0.821429, 0.877193];
   there y(t) = 0.35 + 0.27t runs 0.572 → 0.588, above the top (0.5) → **not hidden** (it clears the top edge by ~0.07 u).
2. Knee (0.95, 0.20, −0.15): t-ranges x [0.821429, 1.178571], z [0.836364, 0.909091], y [−1.0, 2.333] →
   overlap [0.836364, 0.909091] ⊂ (0,1) → **hidden** (the sight line passes through the cabinet).
3. With x = 0.95, z = −0.25 fixed, the ray enters the slab through the x = 0.7 face at t = 1.15/1.4 = 0.821429
   (at that moment z = 0.2589, inside the z slab) and exits through z = 0.1 at t = 0.877193. y(t) increases in t,
   so the lowest point of the ray inside the slab is the entry point; the ray must clear the top edge
   (0.7, 0.5, 0.2589): 0.35 + (y − 0.35)·0.821429 = 0.5 → y = 0.35 + 0.15·1.4/1.15 = 0.532609.
   (Checked: a ray to y = 0.532 enters the box; y = 0.534 clears it.)

ANSWER: 1. no   2. yes   3. y = 0.533

## D

Centre C = (0.95, 0.15, 0); direction to eye d = (−1.4, 0.2, 2.6), |d| = 2.959729,
d̂ = (−0.473016, 0.067574, 0.878459). Top normal n(θ) = (0, cos θ, sin θ).

1. θ = 0: n = (0,1,0), angle between n and d̂ = arccos(0.067574) = 86.125° → N = 90 − 86.125 = 3.875°.
2. N ≥ 30° ⇔ cos(angle) ≥ 0.5 ⇔ 0.067574·cos θ + 0.878459·sin θ = 0.5 (the smallest θ; the function is
   increasing for θ < 85.6°). Solution θ = 30.1775° (N = 29.85° at 30°, 30.69° at 31°).

ANSWER: 1. N(θ=0) = 3.875°   2. θ = 30.18°

## E

`walker.mjs` (in this folder) exports `walker(t)`. Paste of the output:

```
t=1.75   x=0.600000  y=0.138893  z=0.275000  yaw=14.0625 deg
t=3.2    x=1.300000  y=0.129794  z=0.300000  yaw=135.0000 deg
t=5.05   x=1.275000  y=0.457367  z=-0.600000  yaw=-104.0625 deg
t=6.7    x=0.600000  y=0.445367  z=-0.600000  yaw=-45.0000 deg
t=-0.5   x=0.600000  y=0.445367  z=-0.600000  yaw=0.0000 deg
```

(5.05 is inside corner C's 0.2 s turn: u = 0.75, smoothstep = 0.84375, so yaw = 180° + 90°·0.84375 = 255.9375° ≡ −104.0625°;
−0.5 wraps to v = 7.5, standing with yaw 0.)

Does it jump? **Yes, exactly two places, both in y, both 0.012 u** (a dense 0.5 ms scan over the whole loop finds no
other discontinuity; x, z and yaw are continuous everywhere, including at the loop point):
1. **v = 6.4 s** — y drops 0.457367 → 0.445367: the +0.012 walking bob is removed the instant he stops walking
   (the spec gives it only for v < 6.4).
2. **The loop point v = 0 s (≡ 8 s)** — y jumps 0.445367 → 0.457367: the bob reappears the instant the walk restarts.
   Position (0.6, −0.6) and yaw (0° standing → 0° walking) match across the seam, so only y jumps there.

The beat that does nothing: **the 7.6–8.0 s turn, "from 0 to the first segment's heading"** — the first segment's
heading *is* 0° (+z), so that "turn" is a 0° turn (smoothstep of a zero delta). (Everything else the spec asks for
does something; the walking bob is the deliberate discontinuity.)

ANSWER: it jumps twice — y by −0.012 at v = 6.4 s and y by +0.012 at the loop point v = 0/8 s (x, z, yaw continuous throughout); the 7.6–8.0 s turn does nothing.

## F

Bug list for the given code (line numbers as written in the task):

1. **Line 5** `const v = t % L;` — for negative t, `v` is negative, so line 7 evaluates `ease(v/2)` with a negative
   argument, where ease(s) = s²(3−2s) = s²(3+2s) grows huge. t = −2 → v = −2 → ball.x = 0.8 + 0.4·ease(−1) =
   0.8 + 2.0 = 2.8 (truth: t ≡ 4 mod 6 → x = 1.2). Shows at any seek with t < 0.
2. **Line 8** `else o.ball.x += 0.0;` — for 2 ≤ v ≤ 4 the ball's x is never set to 1.2; it keeps whatever value it
   had before, so the result depends on call history instead of t (violates the pure/seek contract). Fresh object,
   seek(2.5) → x stays 0.8 (its initial value) instead of 1.2. Related edge: at exactly v = 4 line 11's
   `v > 4` is false, so x is not updated there either.
3. **Line 9** `const b = ease((v - 3) / 0.5);` — the bounce parameter is not clamped to [0,1], so the bounce leaks
   outside 3.0–3.5 s: t = 2.9 → s = −0.2, ease = 0.136 → y = 0.1 + 0.3·sin(0.136π) ≈ 0.22 instead of 0.1;
   t = 3.6 → s = 1.2, ease = 0.864 → y ≈ 0.22 instead of 0.1. (At t = 2.5 and 3.75 sin(π·ease) happens to be 0,
   which hides the bug in casual playback.)
4. **Line 11** `o.ball.x = 1.2 - 0.3 * ease((v - 4) / 2);` — the return trip is 0.3 u instead of 0.4 u, so at
   v = 6 the ball is at 0.9, not 0.8: the loop does not close and x jumps 0.9 → 0.8 by 0.1 u at the loop seam (t = 6 ≡ 0).
5. **Line 13** `o.glyph.rotY = 15 * Math.sin(...)` — 15 is in **degrees**; the contract says every angle in radians,
   so this should be 15·π/180 = 0.261799. At the bounce peak t = 3.25 the glyph turns 15 radians (≈ 860°) instead of
   15° (0.262 rad).
6. **Line 15** `o.glyph.rotY += (Math.random() - 0.5) * 0.002;` — two faults: (a) impure — the same seek twice gives
   different results, breaking "pure, seek at any t in any order"; (b) truth violation — the rotation must be
   exactly 0 outside the bounce and exactly 15°·sin(πs) during it, but ±0.001 rad of noise is added at every moment.
   Shows immediately: seek(0.5) twice → different rotY.
7. **Line 18** `o.board.rotX = yaw; o.board.rotY = tilt;` — the two are swapped: the board should have
   rotation.x = 30° (tilt toward the learner) and rotation.y = 20° (turn); the code gives rotX = 20°, rotY = 30°.
   Wrong at every moment of the loop.

(`fixed.mjs` in this folder implements the truth: wraps any t into [0, 6), sets the ball's x in all three phases,
clamps the bounce/glyph parameter so both are exactly 0 outside 3.0–3.5 s, returns the ball 0.4 u so the loop
closes, uses radians (15° = 0.2618), no randomness, and rotX = 30°, rotY = 20°. Verified deterministic,
order-independent, loop-closing in `test.mjs` output.)

ANSWER: seven bugs — lines 5, 8, 9, 11, 13, 15, 18 (negative-t wrap; stale wait-phase x; unclamped bounce; short return trip; degrees not radians; random tremble; swapped board angles).

## G

Scene: gal2 (0.5) pours tea from a pot into a cup on a low table tilted 25° toward the learner; plan says the tilted
tabletop dipping into its legs is fine.

1. `table top SUNK INTO table legs (−0.04u)` — **expected**: the plan explicitly allows the tilted top to dip into
   its legs; 0.04 u is the by-design overlap.
2. `teapot INSIDE gal2 right hand (0.035u)` — **real**: a held thing 3.5 mm inside the hand violates the
   "palm rests against the thing, never inside the fist" rule; move the pot/hand so the palm rests on it.
3. `FAIL cup stays on the table (t+3.1 to t+3.3): no moment measured` — **checker**: per `goals.mjs`, "no moment
   measured" means no sample fell inside the t-window; with 0.5 s sampling (…3.0, 3.5…) a 0.2 s window at 3.1–3.3
   contains no sample — widen the window (e.g. [3.0, 3.5]). The goal's text says nothing about the scene here.
4. `gal2 FLOATS 0.012u (walking)` — **expected**: 0.012 u is the walking-cycle bob (mid-stride feet leave the
   floor); not a placement fault.
5. `gal2 left hand INTO gal2 chest (0.06u)` — **real**: a hand passing through her own body is a body-through
   fault; re-route the pouring gesture (move by the overlap + 0.02 u).
6. `PASS girl seen 66% (needs 65) — 30% behind teapot` — **expected**: it passes, and 30% behind the pot is
   natural — she's holding it in front of her while pouring (note the 1-pt margin is thin).
7. `cup FLOATS 0.09u above table top` — **real**: a 9 mm float is visible; lower the cup by 0.09 u. This is why
   line 10 measures the cup "on gal2" instead of on the table.
8. `FAIL tea stream shows big (t+3 to t+4): stream is not in the learner's view` — **look**: that is the goal's
   missing-target branch; for a few-mm stream the numbers can't tell whether it is truly occluded (scene fix:
   move pot/girl) or the thin mesh is under-sampled by the seat measurement (checker fix). Render a close look
   first.
9. `kanji 72% visible — 28% behind mesh steam` — **checker**: geometrically impossible as described — the kanji
   occupies x −1…0 and the steam rises off the cup (x ≳ 0.5); sight lines from the eye (−0.45, ·, 2.6) to any point
   of the kanji stay at x ≤ 0 and can never pass through the steam. The occlusion attribution/measurement is at
   fault. (If a close look showed the steam mesh misplaced at x < 0, it would be a real scene bug — but with the
   steam at the cup, the scene is right and the measurement is wrong.)
10. `PASS cup rests on the table: cup: on gal2` — **checker**: the goal has no `on` field, so the `rests` judge
    passes if the cup rests on *anything* without a fault — "cup: on gal2" (the girl) satisfies it. The goal as
    written accepts the girl as the table; it should be `{"rests": "cup", "on": "table"}`. The PASS is a false
    positive (the scene fault is line 7).

ANSWER: 1 expected, 2 real, 3 checker, 4 expected, 5 real, 6 expected, 7 real, 8 look, 9 checker, 10 checker.

## H

In `plan.md` (full plan) and `goals.json` (the 8 goals). Summary:

- **Idea**: a porter walks a route in front of the kanji carrying a heavy crate, sets it down in front of the
  kanji, and carries it off — the kanji is what gets carried/delivered (運 = carry, transport).
- **Scene**: `hiker` (ADULT, 0.9 u) on a 5.4 s loop: walk 0.4 → 1.3 (z 0.10, +x, 1.8 s), 0.2 s turn via the
  learner, walk back (1.8 s), 0.2 s turn via the back (via-learner would swing the crate through the kanji plane),
  set the crate down (0.2 s), crate on the ground (0.9 s), lift it back (0.3 s); a 0.25 u crate in the right hand
  at his side, a `road` path under the route.
- **Reach (shown in the plan)**: grip point G = (−0.175, 0.425, 0.08) local from the right shoulder (−0.1, 0.62, 0)
  → d = √(0.075² + 0.195² + 0.08²) = 0.224 u ≤ 0.30; the release happens at the reach limit (hand y 0.341, crate
  top 0.34) with the crate dropping the last 0.09 u; re-grip is the same 0.224 u.
- **Facing/seen (shown in the plan)**: kanji 100% visible (all sight lines to it stay x ≤ 0; nearest scene thing
  x 0.25); porter never hidden by the kanji (worst corner ray crosses the slab's z plane at x 0.232 > 0); crate
  front faces the eye within 21.7°, screen size 27% set down / 23% worst case (≥ 15).
- **Loop closes**: every quantity is a pure function of v = t mod 5.4; position (0.4, 0.10), yaw 90°, crate in
  hand, bob zero at the seam — the end state equals the start state exactly.
- **goals.json**: 8 goals — hand-on-crate (t [0, 3.8]), crate rests on ground (t [4.5, 5.0]), hiker stands on
  ground (t [4.5, 5.0]), hiker visible ≥ 85, kanji visible ≥ 85, crate big ≥ 15, clear hiker (except crate — the
  grip is deliberate), clear kanji. Time windows all contain 0.5 s sample moments.

ANSWER: see plan.md + goals.json (5.4 s porter loop, 8 goals, all reach/face/visibility numbers verified above).

## What I was least sure of

Task G, lines 8 and 9: the category hinges on what the seat measurement actually does for a thin mesh (line 8 —
I chose *look* because "stream not in view" is the goal's missing-target branch and a thin stream is exactly the
ambiguous case) and on trusting that the steam really sits at the cup (line 9 — the *checker* verdict uses the
geometry; if the steam mesh were misplaced at x < 0 the answer would be *real*). I was also slightly unsure in G
whether line 2 was meant as *look* rather than *real*, but the project's explicit palm-never-fist rule made *real*
the defensible call.

Finished: 2026-10-16T20:03:17.625Z
