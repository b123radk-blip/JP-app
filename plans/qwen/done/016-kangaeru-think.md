# Report: 016-kangaeru-think

## What I changed
- `src/effects/vignettes/q-ponder.js` (was a stub): the full `q-ponder` scene per the plan. Tatami strip, red cushion,
  brown stand, the shogi board as a group at its bottom-middle tilted `rotation.x = 35°` with a 5×5 grid of thin dark
  lines and five static pieces; the moving piece is a child of the board group (board-local (−0.06, 0.05, −0.10) →
  (0.05, 0.05, −0.10), slide 4.7–5.2 with a small lift, shrink 6.6–6.9, pop back 6.9–7.3). Grandpa (ADULT) at
  (0.95, 0.03, −0.05) holds the SitDown pose: hands on his thighs (0–0.6), right hand to the chin (0.6–1.2) with a head
  tilt, the chin held with a slow head rock (1.2–3.6), finger up beside his head (3.7–4.2), bow in (4.3–4.6), grip on
  the piece and slide it (4.7–5.2), sit up with the hand back on the thigh (5.25–5.5), nod (5.5–6.2). The thought pops
  in: dot1 at 1.3, dot2 at 1.6, cloud + "?" at 1.9; the "?" gives way to a lightbulb with a star burst (3.6–4.1); the
  whole thought fades 6.0–6.5.
- The one mechanic worth knowing: hand IK targets are given in the actor's own frame (`who.local`, in heights), not
  hand-crafted world points. During `scene.step` the model's world matrices are one compose phase stale, so a point
  written in the learner/measurement frame lands in the wrong frame and `handTo` never reaches it, while a local
  point is self-consistent with the shoulder the IK reads. Targets: chin (−0.022, 0.556, −0.133), finger
  (0.022, 1.078, −0.256), thighs (±0.089, 0.189, −0.1) — these are the plan's world points (0.93, 0.53, −0.17),
  (0.90, 0.66, −0.20)-up, (0.87/1.03, 0.20, −0.14) converted to the actor's frame; the piece target is the piece's
  `board.localToWorld` position with `grip('R', …, down, 0.01u, 1)` (palm from above).
- Fault fixes, all inside the plan's own geometry: the five static stones lifted 0.02u (board-local y 0.05 → 0.07) so
  the inspector no longer reads the tilted stone's AABB as sunk −0.04u into the board; the thought dots moved 0.05u
  out along the same diagonal (dot1 (1.05, 0.79), dot2 (1.105, 0.84)) because the plan's dot2 centre was inside the
  bubble's main sphere (SUNK −0.25u); the lightbulb's globe raised to local y 0.055 so it sits on its grey base
  instead of sinking 0.035u into it; dot1/dot2/bubble marked `userData.flies` (a thought floats on purpose); the star
  burst shrunk (s 0.4 → 0.3) and placed 0.05u behind the bulb so its star no longer contains the base.
- `src/effects/vcat-qw.js`: the `q-ponder` cost line `pdc('grandpa') + 4` → `pdc('grandpa') + 13` (built 25 draw calls,
  declared was 16).
- `src/effects/vignettes/model-kit.js`: touched during diagnosis, then restored with `git checkout` — final diff empty.

Rounds (check_goals after each):
1. First full scene, hand targets hand-crafted in the measurement frame: 8 of 11 PASS (hand not at the chin, finger
   not up, plus the board/stand SUNK and a stone/bubble/bulb SUNK pair).
2. Diagnosis: `measure` + `try_value` showed `handTo` moves the hand for `who.local`/`who.at` targets but not for
   points written in the measurement frame (stale world matrices during step); rewrote all hand targets in the
   actor's local frame: 11 of 11 PASS.
3. Fault pass (stones lifted, dots moved out, globe on its base, burst behind the bulb, thought dots `flies`):
   11 of 11 PASS, whole loop clean except the plan's expected board/stand SUNK and a visibility note.
4. Catalog cost set to the built 25 dc: cost check `0 cost mismatches`.

## Where I left the plan, and why
- The thought dots: the plan's centres (1.10, 0.825) and (1.16, 0.895) overlap the bubble (main sphere r 0.15 at
  (1.27, 0.95) — the plan's dot2 sits 0.062u inside it; the inspector reported SUNK −0.25u). I kept the same diagonal,
  radii and colours and moved the dots to (1.05, 0.79) and (1.105, 0.84), which clear every bubble sphere.
- Nothing else deviates: layout positions, colours, timings and the plan's hand points are as written.

## Checks (paste the real last lines of each)
`node --check src/effects/vignettes/q-ponder.js src/effects/vcat-qw.js` — printed nothing.

`npm test` — last lines:
```
ℹ tests 64
ℹ pass 63
ℹ fail 0
ℹ skipped 1          (the ffmpeg test; ffmpeg not installed)
content check ok: 854 cards (281 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 854 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```

`node scripts/check-piece-costs.mjs vignette "^q-ponder$"` — `696 recipes, 0 cost mismatches`

`node scripts/orbit.mjs 8003 --times 2.5,3.9,4.9 --out plans/qwen/renders/016-kangaeru-think.jpg`
— `plans/qwen/renders/016-kangaeru-think.jpg (looking at 0.38,0.04,-0.03)`

`node scripts/inspect.mjs 8003 --goals plans/qwen/goals/016-kangaeru-think.json --loop 7.5 --times 2.5,3.9,4.9,5.8
--out plans/qwen/renders/016-kangaeru-think` — last Goals run:
```
## Goals: 11 of 11 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS he sits on the cushion: 15 moments, e.g. t+0: grandpa: touches T3 mesh cushion (brown #a03040)
  PASS his hand is at his chin while he thinks (t+1.2 to t+3.5): 5 moments, e.g. t+1.5: 0u apart (needs ≤ 0.04)
  PASS his finger goes up with the idea (t+3.8 to t+4.2): 1 moments, e.g. t+4: 0.07u apart (needs ≤ 0.14)
  PASS his hand reaches the piece (t+4.65 to t+5.2): 1 moments, e.g. t+5: 0.01u apart (needs ≤ 0.04)
  PASS the piece lies on the board (t+0 to t+4.2): 9 moments, e.g. t+0: piece (skin #f8e0b0): touches T5 mesh shogi board (dark brown/yellow #6a4a28/#e0b060)
  PASS the piece lies on the board after the move (t+5.3 to t+6.5): 3 moments, e.g. t+5.5: piece (skin #f8e0b0): touches T5 mesh shogi board (dark brown/yellow #6a4a28/#e0b060)
  PASS the board's top faces the learner: 15 moments, e.g. t+0: its top is turned 30° toward you (needs ≥ 25)
  PASS the thought bubble shows big (t+2.2 to t+5.8): 7 moments, e.g. t+2.5: shows 23% as big as the kanji (needs ≥ 8)
  PASS the learner sees him: 15 moments, e.g. t+0: 77% visible (needs ≥ 65)
  PASS the learner sees the kanji: 15 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS nothing passes through him: 15 moments, e.g. t+0: nothing passes into it
```

## What I see in the render (orbit, six views)
- front: grandpa in his top hat sits on the red cushion behind the tilted shogi board; hand on his chin with the
  "?" bubble (t+2.5), finger up with the lightbulb in the cloud (t+3.9), leaned in with his hand on the moving
  piece (t+4.9).
- right side: he sits on the cushion, the board tilted on its stand (its lower edge dips into the stand, the
  expected fault); the lean-and-move reads clearly.
- top: the board seen from above with its grid, the five static pieces and the moving one; the bubble floats beside
  his head.
- back-left: his back and the board beyond it; nothing floats or passes through.
- front-right: the board's top faces the learner with the grid and pieces; at t+4.9 his hand is on the piece.
- low front: the board's edge and the stand from below; the tilt and the stand contact are visible, nothing else amiss.

## Inspection (last run)
POSSIBLE FAULTS lines, and why each is fine:
- `T5 mesh shogi board (dark brown/yellow #6a4a28/#e0b060): SUNK INTO T4 mesh stand (brown #8a5a30) (gap -0.09u)` —
  the plan's "Expected fault you can ignore" (the tilted board's lower edge dips into its stand).
- `T1 model grandpa: 76% visible (21% behind the shogi board, 3% behind other things (props, labels))` — a
  visibility note, not a fault verdict: he sits behind his own board, and the goal "the learner sees him" (≥ 65)
  passes at 76%.

Hands (from the last inspect report): right hand at [0.87, 0.2, −0.14] and left at [1.03, 0.2, −0.14] — exactly the
plan's resting points. The whole-loop scan otherwise lists no fault.
