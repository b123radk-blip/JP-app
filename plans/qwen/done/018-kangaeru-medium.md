# Report: 018-kangaeru-medium

## What I changed
- `src/effects/vignettes/q-ponder.js`: replaced the stub with the `q-ponder` scene: grandpa (ADULT, `SitDown` held) on a
  red cushion before a 35°-tilted shogi board on a stand, on a tatami. Right hand blends between thigh / chin / idea /
  the moving piece / back to the thigh (left hand stays on his thigh); the bow is applied **before** the hand IK so the
  reach goes out from the leaned-in shoulders. Piece is a child of the board group, slides 4.7–5.2 under his gripping
  hand (palm from above, r 0.02u), shrinks 6.6–6.9 and pops back 6.9–7.3. Thought dots, cloud (one mesh: main sphere
  r 0.15 + three touching puffs), "?" label, lightbulb and a small burst pop in/out on the plan's seconds.
- `src/effects/vcat-qw.js`: `q-ponder` cost set to `pdc('grandpa') + 11` (tatami, cushion, stand, board, piece, dot1,
  dot2, bubble, "?" label, bulb, burst = 11 draw calls).
- Hand targets are converted to world space with `group.localToWorld` before `handTo`/`grip` (as in `q-pour.js`): the
  effect group is translated in world space, and the IK targets must be world points.
- Deviations from the plan's numbers (each needed for a goal or for the scene to read, see "left the plan"):
  - "?" label and lightbulb at z −0.07u instead of "z −0.09 in front of the cloud's middle" (−0.16u): the plan's spot is
    inside the main cloud sphere (r 0.15u), so both were invisible (depth-tested out by the cloud's front face). At
    −0.07u they sit 0.03u in front of the cloud's front face and show clearly.
  - The cloud's three extra puffs are my own (the plan only fixes the main sphere): placed to touch the main sphere
    (no overlap between cloud pieces) and kept off grandpa's head — an earlier position over the head made
    "nothing passes through him" fail.
  - grip `toward` is the world `DOWN` turned by the group's quaternion.

## Where I left the plan, and why
- "?" and bulb at z −0.07u (see above) — the plan's −0.16u puts them inside the r 0.15u main cloud sphere; the plan's
  intent ("in front of the cloud") needs z ≤ −0.10u.
- dot2 (plan centre 1.16, 0.895, −0.25) sits inside the main cloud sphere (plan numbers): it shows as
  `dot2 SUNK INTO bubble` every 0.5 s scan — a thought trail leading into the cloud, which the design wants; I kept the
  plan's centre.
- Board's lower edge sunk into its stand (gap −0.09u) — the expected fault the plan lists.

## Checks (paste the real last lines of each)
`node --check` on both changed files: no output.
`npm test`:
```
ℹ tests 64
ℹ pass 63
ℹ fail 0
content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  0 pair(s) at or above 0.72
recipe check ok
```
`node scripts/check-piece-costs.mjs vignette "^q-ponder$"`:
```
697 recipes, 0 cost mismatches
```
`node scripts/inspect.mjs 8003 --goals plans/qwen/goals/018-kangaeru-medium.json --loop 7.5 --times 2.5,3.9,4.9,5.8
--out plans/qwen/renders/018-kangaeru-medium` (final run):
```
## Goals: 11 of 11 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
  PASS he sits on the cushion: 18 moments, e.g. t+0: grandpa: touches T3 mesh cushion (brown #a03040)
  PASS his hand is at his chin while he thinks (t+1.2 to t+3.5): 5 moments, e.g. t+1.5: 0u apart (needs ≤ 0.04)
  PASS his finger goes up with the idea (t+3.8 to t+4.2): 2 moments, e.g. t+4: 0.11u apart (needs ≤ 0.14)
  PASS his hand reaches the piece (t+4.65 to t+5.2): 2 moments, e.g. t+5: 0.02u apart (needs ≤ 0.04)
  PASS the piece lies on the board (t+0 to t+4.2): 10 moments, e.g. t+0: piece (skin #f8e0b0): touches T5 mesh shogi board
  PASS the piece lies on the board after the move (t+5.3 to t+6.5): 4 moments, e.g. t+5.5: piece: touches T5 mesh shogi board
  PASS the board's top faces the learner: 18 moments, e.g. t+0: its top is turned 30° toward you (needs ≥ 25)
  PASS the thought bubble shows big (t+2.2 to t+5.8): 10 moments, e.g. t+2.5: shows 35% as big as the kanji (needs ≥ 8)
  PASS the learner sees him: 18 moments, e.g. t+0: 77% visible (needs ≥ 65)
  PASS the learner sees the kanji: 18 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS nothing passes through him: 18 moments, e.g. t+0: nothing passes into it
```
`node scripts/orbit.mjs 8003 --times 2.5,3.9,4.9 --out plans/qwen/renders/018-kangaeru-medium.jpg`: wrote the sheet.

Rounds (check_goals, goals 018-kangaeru-medium, loop 7.5):
1. first build: 5/11 — hands never moved (IK targets passed in the group's local space instead of world), cushion and
   piece not named.
2. world-space targets + names: 7/11 — piece was scaled to grow(0) (grow clamps to 1e-3, so the "pop back" test was
   always true); hand short of the piece.
3. fixed the piece scale test: 9/11 — hand still 0.12u from the piece: the bow was applied after the hand IK, so the
   reach went out from the un-bowed (too far) shoulders; moved the cloud puff that overlapped grandpa's head.
4. bow before hands, puff above the head: 11/11.
5. "?" and bulb moved from z −0.16u (inside the cloud, invisible) to z −0.07u: 11/11, still.

## What I see in the render (each of the six views, one line each, and any fault left)
- front t2.5: old man in a bowler hat sits on the red cushion behind the grid board, hand on his chin, white cloud and
  blue "?" in front of it above his head — reads as "thinking".
- front t3.9: same, cloud now shows the yellow bulb in front (the idea).
- front t4.9: he is leaned forward over the board, fist on the moving piece.
- right side: board clearly tilted toward the learner, top showing its grid; he leans in over it t4.9; sits on the
  cushion throughout (red cushion and stand visible).
- top: cloud + "?" / bulb over his head, board on the tatami, kanji fully clear on the left.
- low front: board + tatami read as a low table; he is a little small from here but the story (board, cushion, cloud)
  is still legible.
Fault left: the board's lower edge dips into its stand (the expected fault); dot2 overlaps the cloud (plan's centres).

## Inspection (POSSIBLE FAULTS of the last run, and why each is fine or left)
- `t+0 to t+7: mesh shogi board: SUNK INTO mesh stand (gap -0.09u)` — expected by the plan (the tilted board's lower
  edge rests in its stand); left as is.
- `t+2.5 to t+6: mesh dot2: SUNK INTO mesh bubble (gap -0.4u)` — the plan's dot2 centre (1.16, 0.895, −0.25) is inside
  the plan's main cloud sphere; it is the thought trail leading into the cloud, which the design wants; left as is.
- `t+0 to t+7: model grandpa: 76–77% visible (19–20% behind the shogi board, …)` — not a goal failure (needs ≥ 65):
  the board in front of his seated legs hides his lower body; his head, hands and face are all visible, which is what
  carries the story; left as is.
- Hands section of the last run: right hand at the chin (t2.5: [0.93,0.53,−0.17], nearest own part neck 0.14u), on the
  piece (t4.9: [0.89,0.26,0], 0.02u from the board's top), back on his thigh (t5.8: [0.87,0.2,−0.14]); left hand on his
  thigh throughout — where the plan wants them. "Bodies passing into things: none".
- I also looked at the learner's-seat pictures (t2.5/3.9/4.9/5.8) and grandpa close-ups from front and right at t4.9:
  the old man, the board, the cushion, the cloud with the blue "?" and then the yellow bulb, and the leaned-in piece
  move all read clearly; no floating or pass-through I can see.
