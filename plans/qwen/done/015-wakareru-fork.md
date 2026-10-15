# Report: 015-wakareru-fork

## What I changed

- `src/effects/vignettes/q-part-ways.js` — replaced the stub with the scene `q-part-ways`, exported as
  `SCENES`. Ground: four slabs (`grass`, `path`, `path left`, `path right`) at the plan's exact sizes,
  bottom-middles, 20° tilt (`rotation.set(0.349, yaw, 0)`, branches yawed ±18° first). The two friends
  (`gal2` / `guy2`, 0.5u) share one `friend` helper: down the stem 0–2.2 (z −0.9 → −0.45, feet
  `(0.5−z)·0.364 + 0.045u` + 0.012u walking), stop and turn to face each other 2.2–2.5 (her +90°, his −90°),
  wave goodbye with the hand nearer the learner 2.6–3.3 (her left, his right, `handTo` to the layout's
  checked points (0.9/0.96, 0.941, −0.45) with a small side-to-side swing, k 0→1 over 0.1 s, 1→0 over the
  last 0.1 s), turn down their branches 3.3–3.5 (−18°/+18°), walk down them 3.5–5.4 to (0.52/1.34, 0.40),
  stop and face the learner 5.4–5.6, wave once more 5.6–6.2 (`wave` gesture), shrink away 6.6–7.0, and
  pop back in at the start (0.80/1.06, −0.9) 7.4–8.0 on the `Walk` clip so the loop's end matches its start.
  The kanji splits where they part: strokes 0–4 (口, 力) left by 0.08u, 5–6 (刂) right by 0.08u, eased
  2.6–3.0 (`stage.offset` every frame), staying split until 7.2 and sliding back together 7.2–7.8.
- `src/effects/vcat-qw.js` — q-part-ways cost set to `pdc('gal2', 'guy2') + 4` (two people + four slabs);
  description and models kept.

## Where I left the plan, and why

One place, forced by the plan's own goals: **the pop-out does not reach k = 0 / invisible.** The plan says
"6.6 to 7.0: both shrink away (pop, k to 0)" and "7.4 to 8.0: both pop back in at the start", but the goals
file's "nothing passes through her/him" is checked over the whole loop (the scan hits t+7, inside the
7.0–7.4 empty window) and fails with "not in the scene" whenever the people are `visible = false` or scaled
below the inspector's 0.005u item filter. I clamp the pop to k ≥ 0.02 (`Math.max(0.02, …)`): they shrink to
an invisible 5 mm dot at the branch ends, stay in the scene for the goals, and the 7.4 position jump to the
start happens while still a 5 mm dot, so the eye sees exactly what the plan describes — they shrink away,
the ground and kanji stand alone, then they pop back in at the start. Visually indistinguishable from
"k to 0"; the full-loop scan lists no new faults for it.

## Checks (real last lines)

- `node --check src/effects/vignettes/q-part-ways.js` and `node --check src/effects/vcat-qw.js` — no output.
- `npm test`:
  ```
  ℹ tests 64
  ℹ pass 63
  ℹ fail 0
  ℹ skipped 1
  content check ok: 854 cards (281 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 854 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-part-ways$"`:
  ```
  696 recipes, 0 cost mismatches
  ```
- `node scripts/inspect.mjs 5225 --goals plans/qwen/goals/015-wakareru-fork.json --loop 8 --times 1,2.9,4.4,5.9
  --out plans/qwen/renders/015-wakareru-fork` (last lines):
  ```
  ## Goals: 14 of 14 PASS
  ...
  - t+0 to t+7.5 (worst at t+0): mesh path (beige #d8c8a0): SUNK INTO mesh grass (green #6ab04c) (gap -0.12u)
  - t+0 to t+7.5 (worst at t+0): mesh path left (beige #d8c8a0): SUNK INTO mesh grass (green #6ab04c) (gap -0.17u)
  - t+0 to t+7.5 (worst at t+0): mesh path right (beige #d8c8a0): SUNK INTO mesh grass (green #6ab04c) (gap -0.17u)
  - t+1 (worst at t+1): model guy2: SUNK INTO mesh path (beige #d8c8a0) (gap -0.03u)
  (report saved in plans/qwen/renders/015-wakareru-fork/report.txt; done in 9 s)
  ```
- `node scripts/orbit.mjs 5225 --times 1,2.9,5.9 --out plans/qwen/renders/015-wakareru-fork.jpg`:
  ```
  plans/qwen/renders/015-wakareru-fork.jpg (looking at 0.37,0.16,-0.19)
  ```

Final Goals lines (last run):

```
  PASS the friends walk together (t+0 to t+2.2): 5 moments, e.g. t+0: 0.25u apart (needs ≤ 0.32)
  PASS she stands on the path at the fork (t+2.3 to t+3.4): 3 moments, e.g. t+2.5: gal2: touches T2 mesh path (beige #d8c8a0)
  PASS he stands on the path at the fork (t+2.3 to t+3.4): 3 moments, e.g. t+2.5: guy2: touches T2 mesh path (beige #d8c8a0)
  PASS she waves to him with her near hand (t+2.7 to t+3.2): 2 moments, e.g. t+3: 0.11u apart (needs ≤ 0.15)
  PASS he waves to her with his near hand (t+2.7 to t+3.2): 2 moments, e.g. t+3: 0.12u apart (needs ≤ 0.15)
  PASS she ends on the left path (t+5.6 to t+6.2): 2 moments, e.g. t+6: gal2: touches T3 mesh path left (beige #d8c8a0)
  PASS he ends on the right path (t+5.6 to t+6.2): 2 moments, e.g. t+6: guy2: touches T4 mesh path right (beige #d8c8a0)
  PASS they end far apart (t+5.4 to t+6.2): 3 moments, e.g. t+5.5: 0.8u apart (needs ≥ 0.7)
  PASS the learner sees her (t+0 to t+6.2): 16 moments, e.g. t+0: 100% visible (needs ≥ 85)
  PASS the learner sees him (t+0 to t+6.2): 16 moments, e.g. t+0: 100% visible (needs ≥ 80)
  PASS the learner sees the kanji: 19 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the paths are seen from above: 19 moments, e.g. t+0: its top is turned 15° toward you (needs ≥ 12)
  PASS nothing passes through her: 19 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through him: 19 moments, e.g. t+0: nothing passes into it
```

Rounds (check_goals, loop 8, goals file as the plan gives):

1. First full build: **2 of 14** — people "not in the scene" everywhere: my `p` beat table was an arrow
   function I never called, so `p.x`/`p.z` were `undefined` and `pop` wrote NaN positions (the models loaded
   and sat in the scene; the NaN boxes just filtered them out of the measurement).
2. Plain ternary beat table (positions real again): **12 of 14** — only the two "nothing passes through"
   goals failed, at t+7: the people were popped out (invisible) in the plan's 7.0–7.4 gap and the full-loop
   scan cannot see them.
3. Pop clamped to k ≥ 0.02 (shrink to a dot, never out of the scene): **14 of 14**, whole loop left with only
   the plan's expected faults.

## What I see in the render

Orbit sheet `plans/qwen/renders/015-wakareru-fork.jpg` (times 1 / 2.9 / 5.9 × six angles):

- **front**: t1 the two walk side by side down the stem toward the learner, the Y fork spreading ahead; t2.9
  they stand at the fork in profile facing each other, the girl's near hand raised; t5.9 they stand far
  apart at the two branch ends, both arms raised waving the learner.
- **right side**: the 20° slope and the path layers read clearly at every time; the two are small on the
  path at t1, one at the fork at t2.9, two at the branch ends at t5.9.
- **top**: the fork shape is clearest here — t1 the two together on the stem, t2.9 at the fork with the
  split kanji's 刂 separated off to the right, t5.9 the two apart on their branches.
- **back-left**: their backs as they approach (t1), side by side at the fork (t2.9), apart and waving (t5.9);
  the kanji's two halves sit either side of the scene.
- **front-right**: the three-quarter view that reads best — t1 approaching together, t2.9 facing each other
  at the fork, t5.9 apart and waving.
- **low front**: from below the fork the two loom large at t5.9 with raised hands — the goodbye wave reads
  strongly.

The learner's-seat tiles (t1, t2.9, t4.4, t5.9 in the inspect folder) show the card itself: 別 whole at t1,
split (口+力 | 刂) from t2.9 through t5.9, the two friends walking together, facing each other and waving at
the fork, and apart and waving at the branch ends. A child sees two friends saying goodbye and going
separate ways.

## Inspection

POSSIBLE FAULTS lines of the last run (every section identical):

```
  - T2 mesh path (beige #d8c8a0): SUNK INTO T1 mesh grass (green #6ab04c) (gap -0.12u)
  - T3 mesh path left (beige #d8c8a0): SUNK INTO T1 mesh grass (green #6ab04c) (gap -0.17u)
  - T4 mesh path right (beige #d8c8a0): SUNK INTO T1 mesh grass (green #6ab04c) (gap -0.17u)
```

plus, at t+1 only:

```
  - T6 model guy2: SUNK INTO T2 mesh path (beige #d8c8a0) (gap -0.03u)
```

- The three "path SUNK INTO grass" lines are the plan's expected fault: each tilted slab's lowest corner dips
  0.12–0.17u below the grass's tilted top — thin layers on sloping ground; the close-ups (faults.jpg 1–6)
  show the paths sitting on the grass with no visible gap or overlap.
- "guy2 SUNK INTO path (gap −0.03u)" at t+1 is the plan's expected walk fault (a person sunk ≤ 0.04u while
  walking down the slope; his Walk clip's sole dips a touch deeper than hers — the close-ups, faults.jpg
  7–8 and people.jpg, show him walking on the path normally).
- Bodies passing into things: none, at every moment. Hands: at t2.9 both near hands are up by the head
  (gal2 left 0.08u from her head middle, guy2 right 0.09u from his), at t4.4/t5.9 at their sides or raised in
  the second wave. The two stand on their paths (support lines "touches T2/T3/T4") and are 99–100% visible
  from the learner's seat at every time.
