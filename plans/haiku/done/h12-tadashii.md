# Report: h12-tadashii

## What I changed
- `src/effects/vignettes/h-correct.js`: scene `q-shape-sorter` (the girl `gal2`, KID; the sorter box with a round and a square dark hole; a blue 0.08u cube held in her right hand with grip + hold; `cross` named `wrong` and `check` named `right`, both with the mesh flagged `userData.flies` (they hang over the box on purpose); `stars`; both arms up for the cheer; head tilt at the wrong hole). Timing follows the plan (0-0.5 up, 0.5-1.2 down on the round hole with a shake, 1.2-2 cross, 2-2.8 over the square hole, 2.8-3.4 drops in, hidden from 3.4, 3.4-4.6 tick and stars, cheer, fade by 5, new cube grows 6.4-7).
- `src/effects/vcat-hb.js`: one line, `'q-shape-sorter': VM(11, ..., ['gal2'])`.
- `content/cards/6b63.json`: `effect` set to `{ "material": "gold", "backdrop": "sky:noon", "vignette": { "type": "q-shape-sorter" } }` (one line edited; the old `motion: pulse` dropped).
- Numeric fixes during inspection (both in h-correct.js, the cube's radius `rc` used by grip and hold): `0.04u` (plan default, first try) -> `0.05u` -> `0.06u`. The fist was passing into the cube (26 skin points, then 10). At `0.06u` the passes are gone.
- Also added `named()` so the cross and tick carry their goal names on their meshes (the first version named the group, which the inspector does not read).

## Where I left the plan, and why
- Goal "the girl stays in view" (>= 85%) FAILS. Her visibility from the learner's seat is 49-64% over the loop. The plan puts her behind the 0.2u-tall box at z -0.2, so the box hides her lower body (about 35-45% of her 0.57u height) from the learner's seat, and the cross and cube hide more. Moving her further back would take her hands out of reach of the holes, so this is not a number fix. It needs a plan change (for example a different box height, or her beside the box), which I did not make.
- The cross and tick sit at head height (y 0.5u) in front of the box rather than low over it. I kept the plan's position.
- The cube sinks into the box at 2.8-3.4 by design (it drops into the box and is hidden from 3.4).

## Checks (real last lines)
- `node --check src/effects/vignettes/h-correct.js` and `node --check src/effects/vcat-hb.js`: no output (pass).
- `npm test` (final run, after the last edit):
```
content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 848 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```
  exit code 0, 64 of 64 unit tests pass, no FAILED.
- `node scripts/check-piece-costs.mjs vignette "^q-shape-sorter$"`: `679 recipes, 0 cost mismatches`
- Goals (final full run, `--times 0.3,1.5,3.3,4`): see Inspection.
- `npm run e2e` was not run (the plan did not ask for it).

## What I see in the render (six views, two moments each, `plans/haiku/renders/h12-tadashii.jpg`)
- front: t+1.5 a red cross over her head, the blue cube in her right hand at her side; t+4 a green tick with yellow stars over her head, both arms up.
- right side: t+1.5 cross above the box, cube at the round hole; t+4 tick and stars beside her, she leans with arms up.
- top: t+1.5 the round hole (dark disc) and square hole (dark square) show on the box top, the cube by the round one; t+4 the tick lies flat, stars around it.
- back-left: t+1.5 cross by her head, cube by the box; t+4 tick and stars by her head.
- front-right: t+1.5 cross, cube above the box; t+4 tick and stars.
- low front: t+1.5 cross over her head; t+4 tick over her head.
- Faults left in the render: none that the plan does not want. The box hides her legs from the learner's seat (the goal above). The cross and tick read as "wrong" and "right" at a glance.

## Inspection (POSSIBLE FAULTS of the last run, `--times 0.3,1.5,3.3,4 --scan 0.25 --loop 7`, full run)
Goals line, verbatim from that run:
```
## Goals: 9 of 10 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
  FAIL the girl stays in view: fails at t+0 to t+6.75 of 30 moments; t+0: 56% visible (needs ≥ 85); t+0.5: 57% visible (needs ≥ 85); t+0.75: 59% visible (needs ≥ 85)
```
(The other nine goals PASS: kanji in view, girl on the ground, box on the ground, cube starts in her hand, cross for the wrong hole, cube goes into the box, tick for the right hole, no cross with the tick, nothing passes through her.)

POSSIBLE FAULTS lines:
```
  - t+0 to t+6.75 (worst at t+1.75): model gal2: 49% visible (51% behind other things (props, labels))
  - t+3.25 (worst at t+3.25): mesh cube (blue #2a6ae0): SUNK INTO mesh sorter (black/red #1a1a22/#c08850) (gap -0.08u)
  T1 model gal2: 56% visible (44% behind other things (props, labels))   [t+0.3]
  T1 model gal2: 53% visible (47% behind other things (props, labels))   [t+1.5]
  T3 mesh cube (blue #2a6ae0): SUNK INTO T2 mesh sorter (black/red #1a1a22/#c08850) (gap -0.1u)   [t+3.3]
  T1 model gal2: 64% visible (36% behind other things (props, labels))   [t+3.3]
  T1 model gal2: 54% visible (46% behind other things (props, labels))   [t+4]
```
- Girl partly hidden: the box (and the cube and signs at times) hide her lower body. Left as is; it is the reason the visibility goal fails (see above).
- Cube sunk into the sorter at 3.25-3.3: intended, it drops into the square hole and is inside the box (hidden from 3.4).
- No body passes into anything in the last run (the earlier fist-into-cube fault is gone at `rc = 0.06u`).

## Inspection rounds
1. quick, first build (`rc` 0.04u): Goals 7 of 10 PASS; the cross and tick had no name in the report (fixed by `named()`); fist passes into the cube (26 points).
2. full, first build, pictures: Goals 7 of 10 PASS (same cause).
3. quick, `named()` applied, `rc` 0.04u: Goals 9 of 10 PASS (girl visibility FAIL); fist passes into the cube (10 points at t+1 to t+1.75).
4. full, pictures: Goals 9 of 10 PASS.
5. quick, `rc` 0.05u: Goals 9 of 10 PASS; fist passes into the cube (10 points, t+1 to t+1.75 and t+2.75).
6. quick, `rc` 0.06u: Goals 9 of 10 PASS; no fist passes. (Two numeric tries used, as allowed.)
7. full, final (`--times 0.3,1.5,3.3,4`): Goals 9 of 10 PASS; the girl visibility goal is the only FAIL.

Orbit render: `node scripts/orbit.mjs 6b63 --times 1.5,4 --out plans/haiku/renders/h12-tadashii.jpg` (exit 0).

## Round 2 (Opus layout: lower tilted box, girl beside it)
- Box 0.45 x 0.12 x 0.3u at x 0.85, z 0.05, tilted 20 degrees about x (top faces the learner). Red ring round the round hole (left, 0.11 across), blue frame round the square hole (right). Cube 0.1u, blue, same blue as the frame. Cross and tick 0.28u at (0.85, 0.6, 0.05). Girl at x 1.22, z 0.05, turned to the box and 0.4 rad toward the learner; her right hand reaches the holes with IK (no box move needed).
- Grip/hold radius went to 0.07u (cube half-width 0.05u plus a gap).
- Quick run: Goals 10 of 10 PASS. Full run (`--times 0.3,1.5,3.3,4`): Goals 10 of 10 PASS; the only POSSIBLE FAULT is the cube sunk into the box at t+3.3 (intended: it drops in and is hidden from 3.4).
- Orbit render regenerated (`plans/haiku/renders/h12-tadashii.jpg`). A thin dark line hangs below the scene in the right-side and back-left tiles; I did not find its source.
