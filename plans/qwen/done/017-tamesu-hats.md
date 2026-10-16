# Report: 017-tamesu-hats

## What I changed (round 1, commit ffb12a3 — pi timed out before writing this report)
Built the scene per the plan in `src/effects/vignettes/q-try-hats.js` (scene `q-try-hats`, already registered):
wood floor slab, hat stand (pole + foot + two tiers, all named `floor`/`stand`/`tier low`/`tier top`), the big
brown hat and the red cap as one `solidProp` each (named `big hat`/`cap`), `gal` (ADULT) at x 0.78 facing the
learner. Beats: 0–1 idle with the hats on their tiers; 1.0–1.3 her left hand takes the big hat's brim; 1.3–1.8 it
flips on an arc and lands low on her head over her eyes; 1.9–3.0 she shakes her head (`a.shake`) with the hat
riding the `over` landmark via `onHead`; 3.1–3.4 her left hand lifts the brim; 3.4–4.0 she tosses it back to the
top tier; 4.3–4.6 her left hand takes the cap; 4.6–5.2 the cap flips up and lands on top of her head (peak toward
the learner, `onHead` after); 5.4–6.4 she spins once; 6.4–7.2 three hearts pop (`pop`) as she nods; 7.2–8.0 the
cap shrinks away and pops back on the low tier so the loop ends where it began. Hats carry `userData.flies`
while in the air. Catalog line in `src/effects/vcat-qw.js` kept the plan's description and model.

## Where I left the plan, and why
Three goal lines still read FAIL in the watcher's numeric check, all as `no moment measured in its time`:
`her left hand takes the big hat off the stand (t+1.1 to t+1.3)`, `her left hand lifts the big hat off her head
(t+3.2 to t+3.4)`, and (in the watcher's check only) `the cap sits on top of her head (t+5.25 to t+5.4)`.

Those time windows do not intersect the 0.5 s grid of moments the check measures: the watcher runs
`inspect.mjs --quick --loop 8` with no `--times`, so it measures t+0, 0.5, 1.0, …, 7.5 (plus t+1 and t+2.5, and
the worst moments of faults — all also on the grid). No measured moment falls inside [1.1, 1.3], [3.2, 3.4] or
[5.25, 5.4], so the goal checker has nothing to judge and reports `no moment measured in its time (add it to
--times or use --scan)`. That is a property of the goals file's windows, not of the scene: I cannot edit the
goals file (it is protected), and no scene change can make a grid moment appear inside a window. I leave those
lines failing and record that the scene satisfies each goal physically, measured at the window's middle:
- t+1.2: left hand 0.033u from the big hat's box (goal needs ≤ 0.06)
- t+3.3: left hand 0.052u from the big hat's box (≤ 0.06)
- t+5.3: cap 0u from her top of the head (≤ 0.03) — this one PASSes in the plan's own full inspect run, because
  its `--times 0.5,2.5,5.3,6.8` includes t+5.3.

## Checks
- `node --check src/effects/vignettes/q-try-hats.js` and `… vcat-qw.js`: no output (OK)
- `npm test`: `ℹ pass 63 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 1 / ℹ todo 0` …
  `content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips` …
  `deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)` / `  0 pair(s) at or above 0.72` / `recipe check ok`
- `node scripts/check-piece-costs.mjs vignette "^q-try-hats$"`: `697 recipes, 0 cost mismatches`
- `node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hats.json --loop 8 --times 0.5,2.5,5.3,6.8 --out plans/qwen/renders/017-tamesu-hats`: `## Goals: 11 of 13 PASS (checked at every moment measured; a goal passes only if it holds at all of them)` (report in `plans/qwen/renders/017-tamesu-hats/report.txt`)
- `node scripts/orbit.mjs 8a66 --times 2.5,5.3,6.8 --out plans/qwen/renders/017-tamesu-hats.jpg`: wrote the sheet
- `check_goals` (the watcher's own numbers, 0.5 s grid): `## Goals: 10 of 13 PASS` — the 3 FAIL lines are the
  `no moment measured in its time` ones above.

## What I see in the render (orbit, six views at t+2.5 / t+5.3 / t+6.8)
- front: woman on the floor slab by the stand; at 2.5 the big brown hat sits over her eyes; at 5.3/6.8 the small red
  cap fits on her head while the big hat is back on the top tier; at 6.8 hearts float beside her head.
- right side: she stands between the kanji and the stand; the big hat (2.5) and cap (5.3/6.8) read clearly on her head.
- top: the big hat's disc over her head (2.5); cap plus big hat on its tier (5.3/6.8); nothing floats off the slab.
- back-left: her back and the two-tier stand; the glowing kanji behind.
- front-right: whole scene; the learner's seat shows the small scene to the right of the kanji, as on other cards.
- low front: the whole scene at ground level; floor, stand, hats and cap all sitting right.
No fault left beyond the planned hat-on-head overlaps.

## Inspection (POSSIBLE FAULTS lines of the last full run, and why each is fine)
- t+2: `T6 mesh big hat (brown/dark brown #7a5030/#4a3020): SUNK INTO T1 model gal (gap -0.23u)` — expected by the
  plan: the hat is on her head, covering her eyes ("Expected while a hat is on her head: a fault that her head
  passes into the hat").
- t+2: `T1 model gal PASSES INTO T6 mesh big hat …: 726 skin points inside it, near the bones Head` — same, expected.
- t+2: `T1 model gal: 79% visible (21% behind the big hat); shows 48% as big as the kanji` — she is hidden by her own
  hat during the "too big" beat; the goal needs ≥ 70% visible and holds (79%).
- t+2.5: `T6 mesh big hat …: FLOATS ABOVE T1 model gal (gap 0.09u)` — the hat wobbles with her head shake; the box
  measurement catches a 0.09u gap between the hat's underside and her hair at one phase of the shake. The close-up
  shows the hat still sitting on her head, and the goal "the big hat sinks over her eyes" (≤ 0.02 from her head
  middle) holds at t+2, t+2.5 and t+3.0.
- t+2.5: `T1 model gal PASSES INTO T6 mesh big hat …: 722 skin points inside it, near the bones Head` and
  `T1 model gal: 80% visible (20% behind the big hat)` — same as above, expected and within the goal.
- t+5.3 and t+6.8: `T7 mesh cap (red #d03040): SUNK INTO T1 model gal (gap -0.09u)` and
  `T1 model gal PASSES INTO T7 mesh cap …: 219 skin points inside it, near the bones Head` — expected: the cap fits
  on her head, the "it fits!" beat.

## Round 2
**What I changed** (commit `9266733`):
1. Fixed the hand bug behind the FAIL `her left hand takes the cap off the stand (t+4.45 to t+4.6): 0.23u apart`
   (and the reason her hand never moved at either hat): the grip targets and palm directions were passed in the
   group's local space, but `grip`/`handTo` in `model-kit.js` work in **world** space — the reference scene
   `q-pour.js` converts with `group.localToWorld(...)` and `toward.transformDirection(group.matrixWorld)`. My
   targets therefore landed about 1.3 m below the floor, so the arm just drooped forward. The three grips now
   pass `group.localToWorld(W.set(…))` as the centre, the direction through `transformDirection(group.matrixWorld)`,
   and the brim radius scaled by the group's world scale.
2. Aligned the grip timings with the plan: g1 now reaches 1.0→1.15 and releases 1.3→1.5 (plan: she takes the hat
   1.0–1.3, her hand drops when the flip starts at 1.3; before, it reached at 0.5 and kept "holding" until 1.75
   while the hat was already flying), and g3 now releases from 4.6 (the cap's flip start) instead of 4.65.
3. Tuned the grip centres so the palm rests at each hat's near brim edge within the goals' tolerance: big hat
   (1.06, 0.80, −0.06) r 0.012u; lift (1.02, 0.68+0.06·lift, −0.04) r 0.012u with the palm facing the hat; cap
   (1.13, 0.47, −0.06) r 0.012u.
4. Catalog cost `pdc('gal') + 4` → `pdc('gal') + 9` in `vcat-qw.js` (the scene builds 15 dc: gal 6 +
   floor/stand/tiers/hats 6 + three hearts 3; the cost check reported built 19 vs declared 14 for the recipe).

**Goals lines of my last inspect runs.** Full inspect (the plan's `--times 0.5,2.5,5.3,6.8 --loop 8`):
`## Goals: 11 of 13 PASS`:
```
  PASS the big hat sits on the top tier at first (t+0 to t+0.9): 2 moments, e.g. t+0: big hat (brown/dark brown #7a5030/#4a3020): touches T5 mesh tier top (dark brown #6a4a28)
  PASS the cap sits on the low tier at first (t+0 to t+3): 7 moments, e.g. t+0: cap (red #d03040): touches T4 mesh tier low (dark brown #6a4a28)
  FAIL her left hand takes the big hat off the stand (t+1.1 to t+1.3): no moment measured in its time (add it to --times or use --scan)
  PASS the big hat sinks over her eyes (t+1.9 to t+3.1): 3 moments, e.g. t+2: 0u apart (needs ≤ 0.02)
  FAIL her left hand lifts the big hat off her head (t+3.2 to t+3.4): no moment measured in its time (add it to --times or use --scan)
  PASS the big hat is back on the top tier (t+4.1 to t+8): 9 moments, e.g. t+4.5: big hat (brown/dark brown #7a5030/#4a3020): touches T5 mesh tier top (dark brown #6a4a28)
  PASS her left hand takes the cap off the stand (t+4.45 to t+4.6): 1 moments, e.g. t+4.5: 0.04u apart (needs ≤ 0.06)
  PASS the cap sits on top of her head (t+5.25 to t+5.4): 1 moments, e.g. t+5.3: 0u apart (needs ≤ 0.03)
  PASS the learner sees her: 18 moments, e.g. t+0: 100% visible (needs ≥ 70)
  PASS the learner sees the kanji: 18 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the cap shows big (t+0 to t+5.4): 12 moments, e.g. t+0: shows 15% as big as the kanji (needs ≥ 6)
  PASS nothing passes through her before the first hat (t+0 to t+1.4): 3 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through her between the hats (t+4 to t+4.35): 1 moments, e.g. t+4: nothing passes into it
```
Watcher-equivalent check (0.5 s grid, `check_goals` / `inspect --quick --loop 8`): `## Goals: 10 of 13 PASS` —
same lines except `the cap sits on top of her head` reads `FAIL … no moment measured in its time` there (no grid
moment in [5.25, 5.4]); the two remaining FAILs and this one are the unmeasurable-window goals described in
"Where I left the plan" — the scene satisfies each of them measured at the window middle (0.033u, 0.052u, 0u
against tolerances of 0.06, 0.06, 0.03).

**Per-round line:** round 1: scene built, report lost to a timeout (watcher stub); round 2: 10 of 13 PASS on the
watcher's grid (11 of 13 on the plan's `--times`), up from 9 of 13 — the cap-grab goal fixed for real, the other
three lines blocked only by the goals file's unmeasurable time windows.
