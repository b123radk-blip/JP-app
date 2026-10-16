# 運 "carry; transport" — scene plan

## The idea (one child should get this)
A porter walks a route in front of the kanji carrying a heavy crate in his hand, sets the crate down
right in front of the kanji, and carries it off again — the kanji itself is what gets carried and
delivered. "A man carries a crate to and fro, setting it down in front of the sign: 運 (un) is
carry / transport." (The 辶 "walks" radical is the mover; 軍 is the convoy that moves the goods.)

## Loop: 5.4 s (beats in v-seconds after the strokes finish)
The porter (ADULT, `hiker`, 0.9 u) walks the straight route **z 0.10, x 0.4 → 1.3 and back** at
0.5 u/s, carrying a 0.25 u crate in his right hand at his side (palm against the crate's inner top,
suitcase-style; the crate bobs ±0.012 u with the step, bob zero at each walk's start so the seam
is continuous).

| v (s) | what happens |
|---|---|
| 0.0 – 1.8 | walk (0.4, 0.10) → (1.3, 0.10), facing +x (yaw 90°), crate in the hand, bobbing |
| 1.8 – 2.0 | right end: turn 90° → −90° over 0.2 s (smoothstep, via the learner, yaw 0° at the mid) |
| 2.0 – 3.8 | walk (1.3, 0.10) → (0.4, 0.10), facing −x (yaw −90°), crate in the hand |
| 3.8 – 4.0 | left end: turn −90° → 90° over 0.2 s (smoothstep, **via the back**, yaw 180° at the mid — chosen because the via-learner swing would put the crate at x 0.10, poking through the kanji plane) |
| 4.0 – 4.2 | the crate is set down beside him (ease; the hand stays against the crate until its 0.30 u reach limit, crate top at y ≈ 0.34, then opens; the crate drops the last 0.09 u) |
| 4.2 – 5.1 | crate on the ground in front of the kanji's right part — "delivered" (0.9 s, quiet) |
| 5.1 – 5.4 | the crate is lifted back to the hand (ease; the hand re-grips the same point) |
| 5.4 ≡ 0.0 | walking resumes — see "loop closes" below |

Both 180° turns use a 0.2 s smoothstep; at exactly 180° the "short way" is tied, so the winding is a
deliberate choice (right end via the learner, left end via the back) — the plan states it, the code
must not pick randomly.

## Layout
| name | size (u) | where (world, u) | colour |
|---|---|---|---|
| hiker | 0.9 tall (shoulders y 0.62, reach 0.30) | route z 0.10, x 0.4–1.3; stop at (0.4, 0.10) | model colours |
| crate | 0.25 cube | carried: centre at his right side 0.30 away, y 0.30 (top 0.425, bottom 0.175); set down at (0.4, 0.125, 0.385) (spans x 0.275–0.525, y 0–0.25, z 0.26–0.51) | 0xc8935a planks, 0x8a6b43 bands |
| road | 1.2 × 0.35 strip, 0.005 thick | centre (0.85, 0.005, 0.10), `road` prop, dashes false (a path), tilted 4° toward the learner | 0x9a9184 |
| kanji | 1 × 1 (recipe `wood`, sky `dawn`) | as usual (x −1…0, y 0…1, z ≈ 0); 辶 part gets the recipe's shared component look so "the walker" radical reads as the mover | recipe |

Recipe: `{ "vignette": "q-porter", "material": "wood", "backdrop": "sky:dawn", "scene": "road",
"emblem": none, "motion": "none" }` — the scene is the meaning; the kanji stays put.
Cost: hiker 2 dc + crate 1 dc (solidProp, one material) + road ~2 dc → well under the 160 dc / 2000 p /
3 light budget. New vignette type `q-porter` in a theme module, registered with
`VM(dc, desc, ['hiker'])`; the crate is named `crate`, the road `road`.

## Reach (every hand target, ADULT: shoulders y 0.62, 0.1 either side, reach 0.30 — local frame, x to his left, z to his front)
- **Grip G** (palm against the crate's inner top, the held thing rests against the palm, never inside the fist):
  right shoulder S = (−0.1, 0.62, 0), crate centre local (−0.30, 0.30, 0) → crate spans x −0.425…−0.175 (clears the
  body's side at −0.15 by 0.025). G = (−0.175, 0.425, 0.08):
  d = √(0.075² + 0.195² + 0.08²) = √(0.005625 + 0.038025 + 0.0064) = **0.224 u ≤ 0.30** (margin 0.076).
- **Release** during the set-down: the hand follows the crate's top until the reach sphere runs out. With the
  hand's horizontal offset (0.075, 0.08) from S, the deepest reachable y is 0.62 − √(0.09 − 0.075² − 0.08²) =
  0.62 − √0.078 = **0.341** → the hand opens with the crate top at y ≈ 0.34 (0.09 u above its ground top of 0.25),
  the crate drops the last bit. Nothing is stretched.
- **Re-grip** on the lift: the same G, **0.224 u** again.
- Left hand: free (walks), no target.

## Facing and visibility from the eye (eye at (−0.45, 0.35, 2.6))
- **The kanji is never occluded**: every sight line from the eye to the kanji stays at x ≤ 0 (the line to its
  right edge (0, y, 0) has max x = 0), while the nearest scene thing is the porter's back at x 0.25 and the
  crate at x 0.275 → the kanji is 100% visible at every moment (goal needs 85).
- **The porter is never hidden by the kanji**: worst case is his back-bottom corner (0.25, ·, −0.05) at the left
  end. The sight line from the eye to it crosses the slab's z 0.02 plane at x = −0.45 + 0.7 · (2.58/2.65) =
  **0.232 > 0** → the slab (x ≤ 0) never cuts the line; the porter is ≥ 85% (in practice ~95–100%; the crate on the
  ground briefly hides a little of his shins, ~5–10%, by design).
- **The crate faces and is seen**: set down, its front face (normal +z) makes an angle of 90° − cos⁻¹(2.215/2.383) =
  **21.7°** with the line to the eye (nearly facing the learner); its centre (0.4, 0.125, 0.385) is 2.38 u from
  the eye and its sight line crosses the slab's z plane at t > 1 (x would be 0.23 at z 0.02) → fully visible.
  Screen size: (0.25 u at 2.38 u) vs (1 u at 2.60 u) = **27%** of the kanji's size (≥ 15); worst case is the right
  end, (0.25 at 2.81 u) = **23%** — still ≥ 15.
- **Room check (x 0…1.5, y 0…1.3, z −0.8…0.6)**: body x 0.25…1.45, z −0.05…0.25; crate x 0.275…1.425,
  z −0.325…0.525 (all corners including both turn swings); crate top 0.425, man 0.9 → y max 0.9. The crate never
  crosses x 0 (min 0.275), so it never touches the kanji slab either.

## Loop closes (5.4⁻ vs 0⁺)
| quantity | at v 5.4⁻ | at v 0⁺ |
|---|---|---|
| position | (0.4, 0.10) | (0.4, 0.10) (walk segment starts there) |
| yaw | 90° (turn finished at 4.0, held) | 90° (route heading) |
| crate | in hand (re-gripped by 5.4), bob 0 | in hand, bob 0 (bob phase starts at each walk's start) |
| clip | Idle → Walk 0.2 s blend | Walk |
Every quantity is a pure function of v = t mod 5.4, so the seam is exact — the loop ends where it starts.

## goals.json
The 8 goals (time windows all contain 0.5-s sample moments; the crate's ground window covers samples 4.5 and 5.0,
which is why the set-down must finish by 4.2 and the lift must start at 5.1):

- "the right hand holds the crate" — `point`/`near`/`within` 0.1, t [0, 3.8] (the hand is off the crate during the set-down, so the window stops before 4.0).
- "the crate rests on the ground" — `rests`/`on: ground`, t [4.5, 5.0].
- "the hiker stands on the ground" — `rests`/`on: ground`, t [4.5, 5.0] (while standing, not walking, so no walk-bob float).
- "the hiker is seen" — `visible` ≥ 85, all moments.
- "the kanji is seen" — `visible` ≥ 85, all moments.
- "the crate shows big" — `big` ≥ 15, all moments.
- "nothing passes through the hiker" — `clear`, with `except: ["crate"]` (the grip is a deliberate palm touch, not a fault).
- "nothing passes through the kanji" — `clear`, all moments.
