# Report: h15-matsu

## What I changed
- `src/effects/vignettes/h-wait.js`: replaced the empty `SCENES` with `q-wait-friend` (a grey post, a station clock whose
  long hand turns once a second and short hand once every 12 s, the girl with a watch on her left wrist, the friend fading in
  at 3.9 s, walking in at 4-5 s and turning at 5-5.3 s, a sigh bubble over her at 2.2-3.4 s, both waving 5.1-6.3 s with a
  heart between them, him fading out at 6.4-7 s). Numbers as in the plan, except the two noted below.
- `src/effects/vcat-hb.js`: one line for `q-wait-friend`, `VM(pdc('gal2', 'guy2') + 8, ..., ['gal2', 'guy2'])`.
- `content/cards/5f85.json`: `effect` set to `{"material": "stone", "backdrop": "sky:day", "vignette": {"type": "q-wait-friend"}}`
  (written over several lines, same content).
- Fixes made during the rounds (all inside the scene module):
  1. The first build passed her left-hand reach point in u-units without converting it to world space, so the hand went
     to the wrong place (goal "she raises her wrist" failed at 0.4u). Now the point is `P(0.98, 0.5, 0.15)` (group space),
     converted to world with `group.localToWorld`.
  2. The friend's stopping point moved from x 1.27 to x 1.30 (walk `0.43` -> `0.40`), see below.
  3. The watch sat at the fist's middle, where the fist hid it completely (checked close up). It now sits on the back of the
     wrist, 0.8 of the way from elbow to fist, 0.03u out, face outward, and is 0.05 x 0.04 x 0.025u with a 0.016u face (was
     0.04 x 0.035 x 0.02u, face 0.012u).
- Render committed: `plans/haiku/renders/h15-matsu.jpg` and the folder `plans/haiku/renders/h15-matsu/` (the full inspection
  run at the plan's times: `faults.jpg`, `overview.jpg`, `report.txt`, per-time pictures).

## Where I left the plan, and why
- Friend's stop x 1.27 -> 1.30. The goal "he stops beside her, not in her" (0.03u) failed at 0.02u with the real models in
  round 1 and 2 (his bounding box at -60 turn). Moving the stop by 0.03u is the one allowed number fix (two tries; one used).
  The goal "he stops close to her" still passes (0.07u).
- Watch position and size: the plan says only "a small dark band with a white face on that wrist". My placement and size are
  described above (fix 3).
- The short hand is a turn per 12 s as the plan says. The scene uses the global time `t`, not the loop time, so there is no
  jump at the 8 s loop boundary; the clock keeps moving across loops, as "time flying by" asks.
- Nothing else changed from the plan.

## Checks (paste the real last lines of each)
```
$ node --check src/effects/vignettes/h-wait.js && node --check src/effects/vcat-hb.js && echo CHECK-OK
CHECK-OK

$ npm test   (last lines of the final run)
# pass 64
# fail 0
content check ok: 851 cards (278 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 851 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok

$ node scripts/check-piece-costs.mjs vignette "^q-wait-friend$"
690 recipes, 0 cost mismatches

$ node scripts/orbit.mjs 5f85 --times 1.5,5.6 --out plans/haiku/renders/h15-matsu.jpg
plans/haiku/renders/h15-matsu.jpg (looking at 0.48,0.03,0.00)
```
Not run: `npm run e2e` (not in the Haiku checks list).

## What I see in the render (each of the six views, one line each, and any fault left)
- front: t+1.5 she holds her left wrist up at her chest, looking down; the clock stands upright on its post at left. t+5.6 she waves with her right hand, he stands beside her with his left hand up.
- right side: t+1.5 she alone with her wrist raised, him faded out. t+5.6 both, he partly behind her, his hand up.
- top: t+1.5 her head, the clock's edge at the left edge. t+5.6 the pink heart between their heads.
- back-left: t+1.5 her and the post with the clock; t+5.6 his head beside hers, the clock at the right.
- front-right: 待 and its "wait · ま" label at the left, the two figures to its right, the scene reads on the kanji's right.
- low front: the clock and her at t+1.5; both waving at t+5.6.
- Faults left: none visible in the renders. The clock hands cross each other at the centre, which is how a clock looks (see Inspection). The top and front-right tiles cut the kanji at the tile edge; that is the review framing, not a fault.
- Close look at the watch (`--look T7 --from front --t 1.5 --zoom 3`, after fix 3): a dark strap with a white face on the outside of the wrist, readable. That close look file was overwritten by the final full run and is not committed.

## Inspection (the POSSIBLE FAULTS lines of the last run, and why each is fine)
Last run: `node scripts/inspect.mjs 5f85 --goals plans/haiku/goals/h15-matsu.json --scan 0.25 --loop 8 --times 1.5,2.8,4.5,5.6 --out plans/haiku/renders/h15-matsu`
```
## Goals: 13 of 13 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS the kanji stays in view: 34 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the girl stays in view: 34 moments, e.g. t+0: 100% visible (needs ≥ 85)
  PASS the friend is in view once he has arrived (t+5 to t+6.3): 7 moments, e.g. t+5: 100% visible (needs ≥ 85)
  PASS the girl stands on the ground: 34 moments, e.g. t+0: gal2: touches the ground line (bottom of the kanji)
  PASS the friend stands on the ground (t+4 to t+7): 14 moments, e.g. t+4: guy2: touches the ground line (bottom of the kanji)
  PASS the clock's post stands on the ground: 34 moments, e.g. t+0: post (brown #606870): touches the ground line (bottom of the kanji)
  PASS the clock shows big: 34 moments, e.g. t+0: shows 20% as big as the kanji (needs ≥ 8)
  PASS the clock is not hidden: 34 moments, e.g. t+0: 99% visible (needs ≥ 90)
  PASS she raises her wrist to look at her watch (t+1.3 to t+1.8): 2 moments, e.g. t+1.5: 0.22u apart (needs ≤ 0.25)
  PASS he stops beside her, not in her (t+5 to t+6.3): 7 moments, e.g. t+5: 0.06u apart (needs ≥ 0.03)
  PASS he stops close to her (t+5.2 to t+6.3): 6 moments, e.g. t+5.25: 0.07u apart (needs ≤ 0.2)
  PASS nothing passes through her: 34 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through him: 34 moments, e.g. t+0: nothing passes into it
...
  - t+0, t+2.25, t+4.5, t+5.5, t+7.75 (worst at t+5.5): mesh black #20262e: SUNK INTO mesh black #20262e (gap -0.07u)
  - t+1.5 (worst at t+1.5): mesh black #20262e: FLOATS ABOVE mesh black #20262e (gap 0.03u)
...
POSSIBLE FAULTS (each has close-ups on the faults sheet, at its worst moment):
  - T3 mesh black #20262e: FLOATS ABOVE T4 mesh black #20262e (gap 0.03u)        [t+1.5]
POSSIBLE FAULTS (each has close-ups on the faults sheet, at its worst moment):
  - T3 mesh black #20262e: SUNK INTO T4 mesh black #20262e (gap -0.03u)          [t+2.8]
```
Why these are fine: T3 and T4 are the clock's long and short hands. Both are pinned at the clock's centre and turn
through each other, so when they cross or line up the measurement reads one as sunk into or floating above the other.
The faults sheet shows the two hands crossing at the centre (fault 1 from front at t+4.5, fault 2 at t+1.5), which is
what a clock does. No other fault is listed. The clock face's bottom (0.71u) sits on the post's top (0.72u) and the
whole-loop check finds nothing else.

## Inspection rounds
- Round 1 (as built): Goals 11 of 13 PASS. FAIL "she raises her wrist" (0.4u apart at t+1.5, the reach point was in u-units, not converted). FAIL "he stops beside her, not in her" (0.02u at t+6). Faults: the clock hands only.
- Round 2 (reach point converted to world space): Goals 12 of 13 PASS. FAIL "he stops beside her, not in her" (still 0.02u at t+6).
- Round 3 (friend's stop x 1.27 -> 1.30, fix 1 of 2): `## Goals: 13 of 13 PASS`.
- Round 4 (watch moved to the outer wrist and enlarged to 0.05u): `## Goals: 13 of 13 PASS` (quick).
- Round 5 (full run with pictures at 1.5, 2.8, 4.5, 5.6, and the orbit sheet): `## Goals: 13 of 13 PASS`. Six rounds were allowed; five used.

## Not checked
- Nothing in a headset. The checks are the measured goals, the inspection and my reading of the renders.
- Whether the watch is readable at real headset distance; the close look is at 3x zoom only.
- The learner's-seat frames are small (the clock about 20% of the kanji, the people about 75-80%); I did not change sizes for that because the goals pass.
- `npm run e2e` was not run.
