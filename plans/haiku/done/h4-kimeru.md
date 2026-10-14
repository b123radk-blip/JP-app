# Report: h4-kimeru

## What I changed
- `src/effects/vignettes/h-decide.js`: `SCENES` now holds `q-pick-cake`. A girl (gal2, ADULT) stands behind a table
  (`table`, top at 0.42u); cakes `cakeA` (x 0.65) and `cakeB` (x 0.95) are one mesh each on white plates. A `question`
  emblem (0.18u) floats over her head from 0.9 to 3.2 s, an `exclaim` (0.18u) from 3.2 to 3.6 s, a `tick` (0.2u, the
  check emblem; its meshes are named `tick`) pops over cake B from 3.6 to 5.8 s, and a small heart (`HEART`) pops over
  her head from 4.4 to 5.6 s. Her right hand follows the plan's sequence (hover A, B, A, B, then the rim of B). Cake B
  is pulled 0.08u toward her from 4.4 to 5.0 s and pushed back from 5.8 to 6.6 s. The loop is 7 s.
- `src/effects/vcat-hb.js`: one line, `'q-pick-cake': VM(pdc('gal2') + 8, ..., ['gal2'])`.
- `content/cards/6c7a.json`: `effect` set to `{"material": "stone", "backdrop": "sky:day", "vignette": {"type": "q-pick-cake"}}`.

## Where I left the plan, and why
- **Touch point (a number and a side, not the design).** The plan says she touches "the side of cake B's plate". The
  first version touched the front edge of the plate: the fist then passed into the cake (goal "nothing passes through
  her" failed at 4-5 skin points). I moved the contact to the near rim (the side toward her), which is where a hand
  pulling the plate toward her would be. The fist centre sits at z 0.055u (was 0.25u). The hand comes back over the
  plate at 0.6u first, then down to the rim, so the fist does not pass through the cherry.
- **Extra back offset during the pull.** While cake B moves toward her, the hand target sits 0.03u further back than the
  rim, so no skin point enters the cake's box. This is a number. It gives a gap of about 0.03u (invisible at the scale).
- **Emblem scale.** The first code called `pop()` on the emblems, which overwrites their scale (the question mark was
  2.3u tall). I added a local `popE(m, k, size, ...)` (size * grow(k)); it is in the scene file only.
- Nothing else in the plan was changed: timings, positions, cake sizes, the table and the recipe are as written.

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/h-decide.js` and `node --check src/effects/vcat-hb.js`: no output (passed).
- `npm test` (final, after the last code change):
  ```
  # tests 64
  # pass 64
  # fail 0
  content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 848 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
  Exit code 0.
- `node scripts/check-piece-costs.mjs vignette "^q-pick-cake$"`: first run `MISMATCH ... built drawCalls 18 declared 20`
  (with `pdc('gal2') + 10`); changed to `+ 8`. Final: `679 recipes, 0 cost mismatches`.
- `node scripts/orbit.mjs 6c7a --times 2.2,4 --out plans/haiku/renders/h4-kimeru.jpg`: exit 0, written.
- `node scripts/inspect.mjs 6c7a --goals plans/haiku/goals/h4-kimeru.json --scan 0.25 --loop 7 --times 1.4,2.2,4,5 --out plans/haiku/renders/h4-kimeru`:
  exit 1 (goals FAIL).
  ```
  ## Goals: 9 of 11 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
    FAIL cake A sits on the table: fails at t+1 to t+4.5, t+6.25 to t+6.5 of 30 moments; t+1: cakeA (red/white #e0283a/#ffffff): is on T1 model gal2 (worn or held: check it sits right in the close-ups)
    FAIL cake B sits on the table: fails at t+1 to t+6.5 of 30 moments; t+1: cakeB (red/white #b0102a/#ffffff): is on T1 model gal2 (worn or held: check it sits right in the close-ups)
  ```
  Goals, all PASS: kanji in view, girl in view, girl on the ground, table on the ground, hand over cake A (0.07u),
  hand over cake B (0.09u), she touches cake B (0.05u, limit 0.05), tick over cake B (1 of 1 within 0.3u), nothing
  passes through her.

## What I see in the render (orbit, times 2.2 and 4)
- front: at 2.2 the "?" is over her head and her right hand is raised toward cake A's side; at 4 the green tick is
  beside her head, right of it, with her hand on cake B's rim.
- right side: at 2.2 the hand is over the cakes; at 4 the tick is above cake B and the hand is on its near rim.
- top: both cakes on the table; at 4 the hand is at cake B's near rim.
- back-left: the girl's back, the table with both cakes on it, nothing through her.
- front-right: the table, the cakes, the girl's hand over cake B's side; the "decide" label and the kanji are clear.
- low front: the table stands on the ground, the girl stands; the "?" reads as a small orange mark above her head.
- Faults left: the emblems float on purpose (see below). Please check the hover height: from the front the hand looks
  higher than 0.08u above cake A (the render is at about 0.6u, which the numbers say is correct).

## Inspection (POSSIBLE FAULTS of the final run, whole loop)
```
  - t+1 to t+3 (worst at t+3): mesh orange #ff9f1c: FLOATS ABOVE model gal2 (gap 0.15u)
  - t+1.5 to t+2 (worst at t+1.5): mesh orange #ff9f1c: FLOATS ABOVE mesh orange #ff9f1c (gap 0.03u)
  - t+3.25 to t+3.5 (worst at t+3.25): mesh orange #ff3b3b: FLOATS ABOVE model gal2 (gap 0.09u)
  - t+3.75 to t+6 (worst at t+3.75): mesh tick (green #2ecc40): FLOATS ABOVE mesh cakeB (red/white #b0102a/#ffffff) (gap 0.16u)
  - t+4.5 to t+5.75 (worst at t+4.5): mesh orange #ff4a6a: FLOATS ABOVE model gal2 (gap 0.19u)
```
- Question mark, exclaim, heart: they float above her head on purpose (the plan says "floats over her head"). The
  "orange on orange" line is the question mark's dot, which hangs 0.03u below its tube (the emblem's own shape).
- Tick over cake B: it pops over the cake on purpose. The gap is about 0.16u above the cake's top.
- No "PASSES INTO", "SUNK INTO" or "touches / sits" fault remains for the girl, table, or cakes in the final run.
- "cakeA / cakeB is on model gal2": NOT fixed. This is the inspect tool's wearer rule (`scripts/lib/inspect-page.mjs`):
  a small mesh whose box overlaps a person's whole bounding box is reported as worn or held. While she hovers her hand
  over a cake, or touches and pulls it, her box reaches the cake, so the cake is reported as "on her" and the goal
  "sits on the table" fails at those moments. At rest (0 to 1 s, and after 6.6 s) both cakes pass. The cakes do sit on
  the table (their bottoms at 0.42u, the table top). To pass this goal the hover would have to sit at the back rim of
  the plate (z about 0.04u), which would change the plan's "hover over the cake" design. I did not do that; Opus should
  decide.

## Inspection rounds
- Round 1 (quick): 3 of 11 PASS. Emblems were 2.3u tall (pop() reset their scale).
- Round 2 (quick): 7 of 11. Fixed the emblem scale (popE). Failing: cakes (wearer rule), tick not found (its mesh had
  no name), and the fist passing into cake B from the front.
- Round 3 (quick): 8 of 11. Touch moved to the near rim; tick meshes named `tick`. Fails: cakes, touch 0.06u (limit 0.05).
- Round 4 (quick): 8 of 11. Fist z 0.055u: touch 0.05u PASS. Fails: cakes, "nothing passes through her" (4-5 skin points
  in cake B at 4.75 and 6.25 s, during the pull and return).
- Round 5 (quick): 8 of 11. Added 0.012u back offset during the pull: still the same fail.
- Round 6 (quick): 9 of 11. Back offset 0.03u during the pull: "nothing passes through her" PASS.
- Final full run (`--times 1.4,2.2,4,5`, 30 moments): 9 of 11 PASS. Only the two cake goals fail (see above).

## Not done
- Nothing was checked in a headset. Please look at the hand over the cakes and the tick from the learner's seat: the
  "?" is 0.18u, which is small from the learner's seat in the render.
- The cakes are box slices with a cream or chocolate top, not wedges; the plate is round. A wedge would be a new shape
  (design, not done).

## Round 2 (coordinator's review: bigger cakes and signs)
- Cakes: plates radius 0.1u (0.2u wide), each a wedge slice (tip toward the learner) with a sponge layer, a cream layer and a
  fruit (strawberry on A, cherry on B), about 0.15u tall. Cake A at x 0.62, cake B at x 0.98 (they do not touch).
- Signs: question and exclamation 0.3u at (x 0.98, y 1.1, z 0.05); tick 0.3u over cake B at y 0.75.
- Hands: hover 0.66u (0.08 above the cake tops) over A and B; touch at the near rim, target z 0.02u (was 0.055u, the
  plate is bigger); pull back offset 0.03u as before.
- Girl unchanged at z -0.12u (tried -0.15u: touch went to 0.07u, FAIL, reverted).
- Commands: `npm test` 64 pass, 0 fail (exit 0); `check-piece-costs "^q-pick-cake$"`: 0 cost mismatches (cost unchanged,
  pdc('gal2') + 8). Orbit rendered to plans/haiku/renders/h4-kimeru.jpg (times 2.2, 4).
- Inspect (quick, 28 moments) per change: first pass 8 of 11 (touch FAIL 0.06u, fist into cake B at t+4);
  target 0.02u: 8 of 11 (girl visibility 84% at t+5.25-5.75: the pulled cake covers her); girl at -0.15u: 8 of 11 (touch 0.07u).
- Final full run (--times 1.4,2.2,4,5, 30 moments): `## Goals: 8 of 11 PASS`. FAIL: girl visible 84% (needs 85) at
  t+5.25 to t+5.75 (the pulled cake covers part of her; the pull is the plan's 0.08u); cake A and cake B "sit on the table"
  (the wearer rule, as in round 1).
- Remaining POSSIBLE FAULTS (whole loop): question dot 0.06u below its tube (emblem design); tick 0.1-0.14u above
  cake B (it pops over the cake on purpose); heart 0.15-0.19u above her head (on purpose).
