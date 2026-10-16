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

## Round 3
**What I changed** (one commit, `src/effects/vignettes/q-try-hats.js` only): tightened the two big-hat grip timings so
her hand is on the brim across each goal's *whole* window, not just near its middle — matching the plan's beats
("1.0 to 1.3: her left hand takes the big hat's brim", "3.1 to 3.4: her left hand lifts the hat by its brim"):
- g1 (take): reach 1.0→1.15, release 1.3→1.5, now **reach 1.0→1.1, release 1.3→1.4** — hand on the brim from 1.1
  to 1.3 (measured 0.034u from the hat's box at t+1.1, 1.15, 1.2, 1.25 and 1.3; needs ≤ 0.06).
- g2 (lift): reach 3.1→3.25, release 3.4→3.6, now **reach 3.1→3.2, release 3.4→3.5** — hand on the brim from 3.2
  to 3.4 (measured 0.056u at t+3.2, 0.056u at 3.25, 0.052u at 3.3, 0.052u at 3.35, 0.040u at 3.4; needs ≤ 0.06).
I tried the edit with `try_value` first (goals unchanged 10 of 13, faults 6 before / 6 after) and only then made
it with the edit tool.

**Why the three FAIL lines cannot be fixed from the scene.** The watcher checks with
`node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hats.json --quick --loop 8` (the plan's
`Inspect:` line adds only `--loop 8`). That run measures the whole loop on its default 0.5 s scan grid
t+0, 0.5, 1.0, …, 7.5 — exactly the 16 moments the `the learner sees her` line lists — plus its default
`--times 1, 2.5` and any fault's worst moment, all of them also multiples of 0.5 s. A goal with a `t` window is
judged only at measured moments inside the window (`goalChecker.note()` in `scripts/lib/goals.mjs` skips a moment
outside `g.t`), and the three failing windows [1.1, 1.3], [3.2, 3.4], [5.25, 5.4] contain **no multiple of 0.5 s**.
So the checker never measures a moment inside them and prints `no moment measured in its time` for *any* scene:
the PASS/FAIL of those lines is decided by the goals file's windows plus `inspect.mjs`'s measurement grid, both
protected files I may not edit (the watcher would put them back), and no code in `q-try-hats.js` can change which
moments `inspect.mjs` measures. The plan's own command (`--times 0.5,2.5,5.3,6.8`) is the same for the two hand
goals; 5.3 does fall in [5.25, 5.4], which is why the cap goal PASSes there. The goals file would need windows
that hold a measured moment (e.g. [1.0, 1.5], [3.0, 3.5], [5.0, 5.5]); per the rules I leave those lines failing
and record below that the scene satisfies each of them.

**The scene does satisfy all three goals, measured across their whole windows this round** (`measure`):
- t+1.1 to t+1.3: left hand 0.034u from the big hat (needs ≤ 0.06)
- t+3.2 to t+3.4: left hand 0.040–0.056u from the big hat (needs ≤ 0.06)
- t+5.25 to t+5.4: cap 0u from her top of the head at t+5.3 (needs ≤ 0.03); the cap rides her head from t+5.2
  (the flip's landing) through t+7.5
At a 0.25 s grid the windows would be measured at t+1.25, t+3.25 and t+5.25, and the scene passes all three there
(0.034u, 0.056u, 0u).

**Goals lines of my last inspect runs.** Watcher-equivalent (`check_goals`, 0.5 s grid, loop 8):
`## Goals: 10 of 13 PASS`:
```
  PASS the big hat sits on the top tier at first (t+0 to t+0.9): 2 moments, e.g. t+0: big hat (brown/dark brown #7a5030/#4a3020): touches T5 mesh tier top (dark brown #6a4a28)
  PASS the cap sits on the low tier at first (t+0 to t+3): 7 moments, e.g. t+0: cap (red #d03040): touches T4 mesh tier low (dark brown #6a4a28)
  FAIL her left hand takes the big hat off the stand (t+1.1 to t+1.3): no moment measured in its time (add it to --times or use --scan)
  PASS the big hat sinks over her eyes (t+1.9 to t+3.1): 3 moments, e.g. t+2: 0u apart (needs ≤ 0.02)
  FAIL her left hand lifts the big hat off her head (t+3.2 to t+3.4): no moment measured in its time (add it to --times or use --scan)
  PASS the big hat is back on the top tier (t+4.1 to t+8): 7 moments, e.g. t+4.5: big hat (brown/dark brown #7a5030/#4a3020): touches T5 mesh tier top (dark brown #6a4a28)
  PASS her left hand takes the cap off the stand (t+4.45 to t+4.6): 1 moments, e.g. t+4.5: 0.04u apart (needs ≤ 0.06)
  FAIL the cap sits on top of her head (t+5.25 to t+5.4): no moment measured in its time (add it to --times or use --scan)
  PASS the learner sees her: 16 moments, e.g. t+0: 100% visible (needs ≥ 70)
  PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the cap shows big (t+0 to t+5.4): 11 moments, e.g. t+0: shows 15% as big as the kanji (needs ≥ 6)
  PASS nothing passes through her before the first hat (t+0 to t+1.4): 3 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through her between the hats (t+4 to t+4.35): 1 moments, e.g. t+4: nothing passes into it
```
Full inspect with the plan's `--times 0.5,2.5,5.3,6.8 --loop 8`: `## Goals: 11 of 13 PASS` — the same lines with
`the cap sits on top of her head` PASSing (`1 moments, e.g. t+5.3: 0u apart (needs ≤ 0.03)`) and `the big hat is
back on the top tier` / `the learner sees her` / `the cap shows big` at 9 / 18 / 12 moments (the added t+5.3 and
t+6.8); the two hand goals still have no measured moment in their windows under that command either.

**Checks (this round):** `node --check src/effects/vignettes/q-try-hats.js` and `… vcat-qw.js`: no output.
`npm test`: `ℹ tests 64 / ℹ pass 63 / ℹ fail 0 / ℹ skipped 1`, `content check ok: 855 cards`, `0 pair(s) at or
above 0.72`, `recipe check ok`. `node scripts/check-piece-costs.mjs vignette "^q-try-hats$"`: `697 recipes, 0 cost
mismatches`. Full inspect + orbit rerun; the orbit sheet is byte-identical to round 2's (the changed grips only
act at t+1.0–1.4 and 3.1–3.5, outside the 2.5/5.3/6.8 shots).

**Inspection (POSSIBLE FAULTS lines of the last full run, and why each is fine):**
- t+0.5: no measured faults
- t+2.5: `T6 mesh big hat … SUNK INTO T1 model gal (gap -0.23u)`; `T1 model gal PASSES INTO T6 mesh big hat …:
  726 skin points inside it, near the bones Head`; `T1 model gal: 79% visible (21% behind the big hat)` — the
  plan's expected "too big" beat: the hat sits over her eyes, head in the solid hat; her visibility stays above
  the goal's 70
- loop scan t+2.5: `T6 mesh big hat … FLOATS ABOVE T1 model gal (gap 0.09u)` — the hat wobbles with her head
  shake; a box measurement against her hair at one shake phase; the `sinks over her eyes` goal (hat box vs her
  head middle) still holds at t+2, t+2.5 and t+3 (0u apart)
- t+5.3 and t+6.8: `T7 mesh cap (red #d03040): SUNK INTO T1 model gal (gap -0.09u)` and `T1 model gal PASSES
  INTO T7 mesh cap …: 219 skin points inside it, near the bones Head` — the "it fits!" beat: the cap is meant to
  sit on her head through the spin and the hearts
No fault the plan doesn't want.

**Per-round line:** round 3: grip timings tightened (hand on the brim across the whole 1.1–1.3 and 3.2–3.4
windows); 10 of 13 PASS on the watcher's grid (11 of 13 on the plan's `--times`) — unchanged from round 2, the
three FAIL lines being the goals-file windows that hold no moment on the protected 0.5 s measurement grid, with
the scene measuring inside tolerance at every point of each window (0.034u, 0.040–0.056u, 0u).

## Round 4
**What I changed:** no code. No change in any file the plan lets me touch can fix the three FAIL lines — this
round I proved that end to end by reading the whole measuring path, instead of re-arguing it:
1. `scripts/qwen-watch.mjs` `check()` runs exactly
   `node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hats.json --quick --loop 8 --out …`
   (`extra` is the plan's `Inspect:` line, which is only `--loop 8`).
2. `scripts/inspect.mjs` then measures at the scan grid `dt = 0, 0.5, 1.0, …, 7.5` (default `--scan 0.5`,
   `for (let dt = 0; dt < LOOP; dt += scan)`) plus its `--times` (default `1,2.5` — both already on the grid)
   plus each fault's worst moment, which `note()` picks from the same scan moments. **Every measured moment is
   a multiple of 0.5 s; nothing in the scene can change which moments are measured.**
3. `scripts/lib/goals.mjs` `note()` judges a goal only at measured moments inside its `t` window. The three
   failing windows — [1.1, 1.3], [3.2, 3.4], [5.25, 5.4] — contain **no multiple of 0.5 s**, so `e.n === 0` and
   the line prints `no moment measured in its time` (→ FAIL) **for any scene**, no matter how well built.
4. The files that would change this — the goals file, the plan, `inspect.mjs`, `goals.mjs`, `qtool.mjs`,
   `qwen-watch.mjs` — are all on the watcher's `PROTECTED` list (restored by its `guard()`), and my prompt
   forbids editing the goals file and the plan.

**What the windows were written for:** 1.25 ∈ [1.1, 1.3], 3.25 ∈ [3.2, 3.4], 5.25 ∈ [5.25, 5.4] — the windows
fit a **0.25 s** scan. The plan's `Inspect:` line is missing `--scan 0.25` (or the windows need to hold a
0.5-grid moment, e.g. [1.0, 1.5] / [3.0, 3.5] / [5.0, 5.5]). I ran the same checker at that resolution
(`--scan 0.25 --loop 8`, the only difference from the watcher's own command): **13 of 13 PASS** — the scene
itself satisfies every goal. That run's three previously-failing lines:
```
  PASS her left hand takes the big hat off the stand (t+1.1 to t+1.3): 1 moments, e.g. t+1.25: 0.03u apart (needs ≤ 0.06)
  PASS her left hand lifts the big hat off her head (t+3.2 to t+3.4): 1 moments, e.g. t+3.25: 0.06u apart (needs ≤ 0.06)
  PASS the cap sits on top of her head (t+5.25 to t+5.4): 1 moments, e.g. t+5.25: 0u apart (needs ≤ 0.03)
```

**Fresh measurements this round** (`measure`, across each whole window, against tolerances 0.06 / 0.06 / 0.03):
- t+1.1 to t+1.3: left hand [1.00, 0.75, −0.07] vs the big hat's box (bottom y 0.78) — **0.03u** at every moment
- t+3.2 / 3.25 / 3.3 / 3.35 / 3.4: left hand vs the big hat's box — **0.056 / 0.056 / 0.052 / 0.052 / 0.040u**
- t+5.25 to t+5.4: her top of the head [0.80, 0.93, −0.05] sits inside the cap's box — **0u** at every moment

**Checks (this round):** `node --check` on both files: no output. `npm test`: `ℹ tests 64 / ℹ pass 63 /
ℹ fail 0 / ℹ skipped 1`, `content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio
clips`, `deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)`, `0 pair(s) at or
above 0.72`, `recipe check ok`. `node scripts/check-piece-costs.mjs vignette "^q-try-hats$"`: `697 recipes,
0 cost mismatches`. Full inspect (the plan's `--goals … --loop 8 --times 0.5,2.5,5.3,6.8`) and the orbit
render reran; both outputs are **byte-identical to round 3's committed versions** (`git status` clean), as
expected with no code change — I opened the orbit sheet again: front t+2.5 the big hat sits over her eyes, at
5.3/6.8 the red cap fits on her head with hearts at 6.8 and the big hat back on the top tier; right side,
top, back-left, front-right and low front all read as the plan intends; no floating, sinking or
unplanned overlaps.

**Goals lines of my last inspect runs.** Watcher-equivalent (`check_goals`, its 0.5 s grid, loop 8):
`## Goals: 10 of 13 PASS`:
```
  PASS the big hat sits on the top tier at first (t+0 to t+0.9): 2 moments, e.g. t+0: big hat (brown/dark brown #7a5030/#4a3020): touches T5 mesh tier top (dark brown #6a4a28)
  PASS the cap sits on the low tier at first (t+0 to t+3): 7 moments, e.g. t+0: cap (red #d03040): touches T4 mesh tier low (dark brown #6a4a28)
  FAIL her left hand takes the big hat off the stand (t+1.1 to t+1.3): no moment measured in its time (add it to --times or use --scan)
  PASS the big hat sinks over her eyes (t+1.9 to t+3.1): 3 moments, e.g. t+2: 0u apart (needs ≤ 0.02)
  FAIL her left hand lifts the big hat off her head (t+3.2 to t+3.4): no moment measured in its time (add it to --times or use --scan)
  PASS the big hat is back on the top tier (t+4.1 to t+8): 7 moments, e.g. t+4.5: big hat (brown/dark brown #7a5030/#4a3020): touches T5 mesh tier top (dark brown #6a4a28)
  PASS her left hand takes the cap off the stand (t+4.45 to t+4.6): 1 moments, e.g. t+4.5: 0.04u apart (needs ≤ 0.06)
  FAIL the cap sits on top of her head (t+5.25 to t+5.4): no moment measured in its time (add it to --times or use --scan)
  PASS the learner sees her: 16 moments, e.g. t+0: 100% visible (needs ≥ 70)
  PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the cap shows big (t+0 to t+5.4): 11 moments, e.g. t+0: shows 15% as big as the kanji (needs ≥ 6)
  PASS nothing passes through her before the first hat (t+0 to t+1.4): 3 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through her between the hats (t+4 to t+4.35): 1 moments, e.g. t+4: nothing passes into it
```
Full inspect with the plan's own command (`--loop 8 --times 0.5,2.5,5.3,6.8`): `## Goals: 11 of 13 PASS` —
the same lines with `the cap sits on top of her head` PASSing (`1 moments, e.g. t+5.3: 0u apart (needs ≤
0.03)`). Same run at `--scan 0.25`: `## Goals: 13 of 13 PASS`. No commit for code this round: there is no
code change that can alter these three lines (proof above), so a round-4 code commit would be empty; the
scene, report and renders are as committed in rounds 1–3.

**Inspection (faults of the last full run, and why each is fine):** unchanged from round 3 — t+2/t+2.5: the
big hat SUNK/FLOATS against her head and her head PASSES INTO the solid hat (726 skin points, near the bones
Head) with her 77–80% visible: the plan's expected "far too big, drops over her eyes" beat, and her visibility
stays above the goal's 70; t+5.3/t+6.8: the cap SUNK 0.09u / head PASSES INTO the solid cap (219–221 points,
near the bones Head): the "it fits!" beat. At the finer 0.25 s grid one more moment of the same expected
overlap appears (t+3.25: 871 points near Head and FistL — her hand on the brim while the hat still covers her
head, the plan's "lifts it by its brim" beat). No fault the plan doesn't want.

**Per-round line:** round 4: no code change — proved from the watcher/inspect/goals code that the three FAIL
lines can never be measured (their windows hold no moment of the 0.5 s grid the protected command uses) and
that the scene passes all 13 goals at the 0.25 s grid the windows assume (13 of 13 PASS); 10 of 13 on the
watcher's grid, unchanged from rounds 2–3. Fixing the three lines needs one protected-file change: add
`--scan 0.25` to the plan's `Inspect:` line or widen the goal windows to hold a 0.5-grid moment.
