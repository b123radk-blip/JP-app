# Effort test — hard — label: medium

START: 2026-10-16T19:45:55.858Z

## A

Worked with the repo's vendored three (0.186) by building the actual groups (`checkA*.mjs`). In this three,
`rotation.set(20°, 30°, 0)` (order XYZ) gives axis images x̂→(0.866, 0.171, −0.470), ŷ→(0, 0.940, 0.342),
ẑ→(0.500, −0.296, 0.814), i.e. R = Rx(x)·Ry(y)·Rz(z) — rotations applied to a vector in the order z, then y, then x.
C's frame: G's local (0, 0.3, 0) under 0.5·Rz90 lands at (0.05, 0, 0.1) in P's frame; C's own position in P's frame is (0.2, 0, 0.1).
C's world position comes out (1.223, 0.105, −0.213).

1. G world = P·(0.05, 0, 0.1) + (1.0, 0.1, −0.2).
ANSWER: (1.093, 0.079, −0.142)
2. World direction of G's local +y = R_P·R_C·(0,1,0) = R_P·(−1,0,0) = −(x̂ image).
ANSWER: (−0.866, −0.171, 0.470)
3. P-local of (1.2, 0.5, 0) = R_Pᵀ·(0.2, 0.4, 0.2) (world minus P's position).
ANSWER: (0.148, 0.444, 0.144)

## B

Reach test: d² = (x(t)−1.0)² + (0.45−0.55)² + (0.05−(−0.1))² = (x−1)² + 0.0325. Within 0.30 → (x−1)² ≤ 0.0575 →
x ∈ [0.7602, 1.2398]. The cup's x rises 0.6 → 1.1 during t ∈ [1, 3] and stays at 1.1 through t = 4.
Entry: 0.6 + 0.5·ss(u) = 0.7602 → ss(u) = 0.32042 → u = 0.37785 → t = 1 + 2u = 1.7557 s.
From t = 3 the cup sits at x = 1.1 (d = 0.206 ≤ 0.3), so it stays in reach until the end of the given interval.
ANSWER: the cup is within reach from t = 1.76 s to t = 4.00 s

## C

Segment from the eye (−0.45, 0.35, 2.6); slab test against the box x[0.7, 1.2], y[0, 0.5], z[0.1, 0.3].
x-slab entry s = (0.7 + 0.45)/1.40 = 0.82143; z-slab exit s = (2.6 − 0.3)/2.85 = 0.87719; so any hit must occur at s ∈ [0.82143, 0.87719].
1. Head (0.95, 0.62, −0.25): y(s) = 0.35 + 0.27s; over the window y ≈ 0.572–0.587, all above the cabinet top (0.5). The sight line clears the box.
ANSWER: no — the head is visible
2. Knee (0.95, 0.20, −0.15): y(s) = 0.35 − 0.15s; over the window y ≈ 0.218–0.227, inside [0, 0.5] with x and z inside too → the segment passes through the box.
ANSWER: yes — the knee is hidden
3. Lowest head height: the line must graze the top of the cabinet at the x-slab entry: y_entry = 0.5 = 0.35 + (y − 0.35)·0.82143 → y = 0.35 + 0.15/0.82143 = 0.532609.
ANSWER: y = 0.533 (below 0.533 the segment enters the box; at 0.533 it just grazes the top-front edge)

## D

Eye direction from the board centre: d = (−1.40, 0.20, 2.60), |d| = 2.95973. Top normal n = (0, cos θ, sin θ); n·d = 0.20 cos θ + 2.60 sin θ.
1. θ = 0: n·d = 0.20 → cos angle = 0.067573 → angle = 86.125° → N = 90 − 86.125.
ANSWER: N = 3.875°
2. N ≥ 30° ⟺ n·d ≥ 0.5·|d| = 1.47987. Solve 0.20 cos θ + 2.60 sin θ = 1.47987 for the smallest θ ≥ 0 (bisection; the maximum of the LHS is √6.8 = 2.608 so it is reachable): θ = 30.1775°.
ANSWER: θ = 30.18°

## E

`walker.mjs` (exports `walker(t)`; also prints its own test output when run). Position is piecewise linear at 0.5 u/s
(segments 1.8 / 1.4 / 1.8 / 1.4 s), yaw is the segment heading except inside each 0.2 s corner window where it smoothsteps
from the old heading to the new one, and y = (0.5 − z)·tan 20° + 0.045 (+ 0.012 while v < 6.4).

Output for the requested times:
```
t=1.75: x=0.6000 y=0.1389 z=0.2750 yaw=14.063
t=3.2:  x=1.3000 y=0.1298 z=0.3000 yaw=135.000
t=5.05: x=1.2750 y=0.4574 z=-0.6000 yaw=-104.062
t=6.7:  x=0.6000 y=0.4454 z=-0.6000 yaw=-45.000
t=-0.5: x=0.6000 y=0.4454 z=-0.6000 yaw=0.000   (v = 7.5: standing, holding yaw 0)
```
Discontinuity scan over the whole loop (8000 steps, x/z, y and wrapped yaw): position and yaw are continuous at every
loop time, including the loop point (v→8⁻: (0.6, −0.6), yaw 0 → v→0⁺: identical). But y jumps in two places:
- at v = 6.4 s (walk → stand): y drops 0.45737 → 0.44537, a drop of 0.012, because the +0.012
  "while walking (v < 6.4)" bonus switches off instantly;
- at the loop point v = 8 ≡ 0: y jumps up by the same 0.012 (the bonus switches back on).
The spec itself creates both jumps — a step function with no ramp.
The beat that does nothing: the 7.6–8.0 s turn "from 0 to the first segment's heading" — the first heading is 0, so
that beat is an identity turn (0° → 0°) and changes nothing.
One ambiguity I had to resolve: corner 3 turns 180° → −90°, which is 90° either way, so "the short way round" is
degenerate there; I take the normalised delta (+90°, i.e. 180° → 270° ≡ −90°). Same end yaw either way; only the
intermediate yaw during that 0.2 s window differs by direction.

ANSWER: the only discontinuities are in y: −0.012 at v = 6.4 s and +0.012 at the loop point v = 0/8 s (the walking
bonus step); x, z and yaw are continuous everywhere. The 7.6–8.0 s beat does nothing (0° → 0°).

## F

Bugs (line → what goes wrong → a moment it shows; verified numerically against the truth):
1. `const v = t % L;` — negative t gives negative v, so every branch misfires. At t = −0.5: v = −0.5 → ball.x = 0.888
   (should be 1.047), and the bounce formula eats ease(−1.7). Fix: `((t % L) + L) % L`.
2. `else o.ball.x += 0.0;` — the hold (2–4 s) never sets x from t; it carries whatever the previous call left. Call
   step(4.5) then step(2.5): x = 1.1531 (should be 1.2); call step(2.5) first on a fresh object: x = NaN.
3. `const b = ease((v - 3) / 0.5);` — unclamped, so the bounce leaks out of its window: at t = 2.4 s y = −0.094
   (ball below the floor, bouncing before 3.0); at t = 3.6 s y = 0.224 (still bouncing after 3.5). Fix: clamp s to [0,1].
4. `o.ball.x = 1.2 - 0.3 * ease((v - 4) / 2);` — returns only 0.3 u instead of 0.4: at t = 5.5 s x = 0.947 (should be
   1.0625); at the loop point x → 0.9 and then jumps to 0.8 at t = 0 — the loop no longer closes.
5. `o.glyph.rotY = 15 * Math.sin(...)` — 15 is in degrees but the output contract is radians: at t = 3.25 s rotY = 15.0
   rad ≈ 859° of spin (should be 0.262 rad = 15°).
6. `o.glyph.rotY += (Math.random() - 0.5) * 0.002;` — a random tremble is in the code but not in the truth, and it makes
   the same t give different results on every call (not pure; breaks seek determinism).
7. `o.board.rotX = yaw; o.board.rotY = tilt;` — swapped: rotX = 0.3491 (20°) and rotY = 0.5236 (30°); the truth wants
   rotX = 0.5236 (30° tilt toward the learner), rotY = 0.3491 (20° turn).

`fixed.mjs` implements the truth: wrapped v, x from t in all three phases (0.8 + 0.4·ss, hold 1.2, 1.2 − 0.4·ss),
clamped bounce window shared by ball y and glyph turn (15° in radians), fixed board angles, no randomness.
Verified: pure under scrambled call orders; loop closes (x = 0.8 at v = 6⁻ and v = 0); ball y = 0.1 outside 3.0–3.5.

ANSWER: 7 bugs (negative-t wrap, stateful hold, unclamped bounce, 0.3/0.4 return + loop jump, degrees for radians,
random tremble, swapped board angles); fixed implementation in `fixed.mjs`.

## G

1. **expected** — the plan explicitly says the tilted top dipping into its own legs is fine (−0.04 u of a 25° tilt on a
   low table is the design, not a fault).
2. **expected** — the teapot is being held in the right hand; a 0.035 u overlap is the grip (palm against the pot),
   exactly the intended contact, not a pass-through.
3. **checker** — "no moment measured" means the goal's t-window (3.1–3.3) was never sampled (a 0.5 s scan step cannot
   land inside a 0.2 s window); the report says nothing about the scene, so this is a goal/measurement setup fault.
4. **expected** — 0.012 u above the floor while walking is stride foot-lift, well within walking tolerance.
5. **look** — a hand 0.06 u into the *chest* could be a genuinely bad pour pose or just the rough chest hitbox on a
   model; the numbers alone can't tell — render a close look at t+3.5 first.
6. **expected** — it is a PASS (66% ≥ 65%): the teapot she is holding sits in front of her body from the seat, so ~30%
   occlusion by her own prop is by design.
7. **real** — the cup floats 0.09 u above the (tilted) tabletop; too big for tolerance and visibly levitating. Fix the
   cup's placement on the tilted top.
8. **look** — "stream not in view" could be a mis-aimed stream, or a stream that exists but is too thin/veiled by the
   teapot at the learner's seat. The numbers can't distinguish; close look at t+3.5 before judging.
9. **expected** — steam particles drifting over the tea in front of the kanji veil 28% of it; that is the reveal
   particles doing their job, and 72% visible is fine for this scene.
10. **checker** — the cup's support was attributed to the girl ("cup: on gal2") instead of the table: the scene puts
    the cup on the table, the measurement/name is wrong (a goal written `on: table` would FAIL on this report even
    though the scene is right).

ANSWER: 1 expected, 2 expected, 3 checker, 4 expected, 5 look, 6 expected, 7 real, 8 look, 9 expected, 10 checker.

## H

Full plan in `plan.md`, measurable goals in `goals.json` (8 goals: both hands on the crate (within 0.1 u, whole loop),
crate in front of the chest, carrier visible ≥ 85%, crate "big" ≥ 10% of the kanji, crate rests on the carrier (not
the ground), crate back at (0.7, 0.52, 0.05) in the last 0.1 s (loop closes), nothing passes through the carrier).
Loop: 6 s — setup 0–1 s (strokes), two steps right 1–2.5 s, pause/offering lean 2.5–3.5 s, two steps back 3.5–5 s,
settle 5–6 s; every pose at 6.0 equals 0.0.
Key numbers: both grip points are 0.270 u from their shoulders upright (≤ 0.30 reach, margin 0.030) and 0.151/0.167 u
when leaned 12° in (the lean helps); the carrier's facing is 22–27° off the sight line (deep in his front hemisphere);
the crate's taped face is 24.5° off the sight line; the eye→head line crosses the crate plane at y 0.851, above the
crate top (0.63), so the crate (in front) never hides the head.

ANSWER: plan.md + goals.json written; carry-and-deliver loop, adult + crate + house emblem on a road, all hand targets
in reach, key things facing and visible from the seat, loop closes exactly.

## Least sure of
- Task A: I trust the vendored three 0.186 objects (verified by building them), but I could not reconcile its XYZ
  matrix with the familiar "extrinsic ZYX" form I learned — the numbers above are what this repo's three actually
  produces, which is presumably what is meant.
- Task G lines 5 and 8: genuinely unjudgeable from numbers (hence "look"); and line 2 could be argued "real" if the
  intended grip is palm-only, but 0.035 u reads as a normal hold.
- Task E corner 3: "the short way" is ambiguous at an exact right-angle turn; I picked the +90° direction.

END: 2026-10-16T19:51:08.366Z
