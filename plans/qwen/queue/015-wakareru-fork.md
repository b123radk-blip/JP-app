# Plan 015: 別 "separate; branch off" (card 5225), new scene `q-part-ways`

Card: 5225
Inspect: --loop 8

A new card. This plan is in words, with **goals** in `plans/qwen/goals/015-wakareru-fork.json`. Read
`plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`, `measure`, `try_value`). You write the code; the
plan gives every number. The layout is already checked with the real people (`plans/qwen/layouts/015-wakareru-fork.json`;
what the learner sees: `plans/qwen/renders/015-plan-seat.jpg`). Keep its numbers.

**The idea a child should get:** two friends walk together down a path toward you. Where the path forks they stop,
turn to each other and wave goodbye, then each takes a different branch, so they end up far apart, and wave once more.
The kanji splits in two as they part.

## Code

- `src/effects/vignettes/q-part-ways.js` is a stub: replace it with the scene `q-part-ways`, exported as `SCENES`.
  Start the file with a comment describing the scene beat by beat. It is already registered (`qwen-batch.js`) and the
  card already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-part-ways': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Example to copy patterns from: `src/effects/vignettes/q-ferry.js` (people walking on sloping ground, `pop`).

## The layout (lengths in u: x from the kanji's right edge, y up, z toward the learner)

The ground slopes **20°** toward the learner so the paths show from above. The grass's bottom at depth z is at
**y = (0.5 − z) × 0.364** (tan 20°). Everything that lies on the ground is turned `rotation.x = 20°` (0.349 rad), and the
branches are also turned about y (yaw) first: set `rotation.set(0.349, yaw, 0)` (three.js applies the yaw before the
tilt in this order). People stay upright.

| Thing | Name (`mesh.name`) | Size w × h × d | Its bottom-middle at | Yaw | Colour |
|---|---|---|---|---|---|
| grass | `grass` | 1.0 × 0.03 × 1.5 | x 0.93, z −0.25, y 0.273 | 0 | green #6ab04c |
| path (the stem) | `path` | 0.4 × 0.015 × 0.7 | x 0.93, z −0.65, y 0.449 (on the grass) | 0 | sand #d8c8a0 |
| left branch | `path left` | 0.26 × 0.015 × 0.98 | x 0.66, z −0.025, y 0.221 | −18° | sand #d8c8a0 |
| right branch | `path right` | 0.26 × 0.015 × 0.98 | x 1.20, z −0.025, y 0.221 | +18° | sand #d8c8a0 |

- **The girl** `gal2` and **the boy** `guy2`, both 0.5u tall (`actor('gal2', 0.5 * u)`), friends. She walks on the
  left (x 0.80), he on the right (x 1.06).
- Feet height: standing on a path at depth z, **y = (0.5 − z) × 0.364 + 0.045**. While walking add 0.012 (the slope
  makes the back foot dip).

## Timing (loop 8 s; nothing moves while the strokes draw)

- 0 to 2.2: both walk (`Walk`) side by side toward the learner down the stem, from z −0.9 to z −0.45 (turn 0).
- 2.2 to 2.5: they stop (`Idle`) and turn to face each other: she turns to 90° (faces +x), he to −90°.
- 2.6 to 3.3: they wave goodbye with the hand **nearer the learner**: her left hand, his right hand (`wave`, k up to 1
  and down). From 2.6 to 3.0 the kanji splits: strokes 0 to 4 (口 and 力) move left by 0.08u and strokes 5 and 6 (刂)
  move right by 0.08u, eased (`stage.offset(si, x, 0, 0)` every frame, x in world units: 0.08 * u). It stays split
  until 7.2.
- 3.3 to 3.5: each turns down their own branch: she to −18°, he to +18°.
- 3.5 to 5.4: each walks down their branch: she from (x 0.80, z −0.45) to (x 0.52, z 0.40), he from (x 1.06, z −0.45)
  to (x 1.34, z 0.40).
- 5.4 to 5.6: they stop and turn to face the learner (turn 0).
- 5.6 to 6.2: both wave once more toward the learner (her left hand, his right hand).
- 6.6 to 7.0: both shrink away (`pop` from q-common.js, k to 0).
- 7.2 to 7.8: the kanji's two halves slide back together.
- 7.4 to 8.0: both pop back in at the start, (x 0.80, z −0.9) and (x 1.06, z −0.9), facing the learner, so the loop
  ends where it started.

## Goals and checks

- After every change: `check_goals` with card 5225, goals `plans/qwen/goals/015-wakareru-fork.json`, loop 8.
- Before you change a number to fix a FAIL, `measure` the things it names at a failing moment (for example
  `what: "gal2 left hand,gal2 top of the head"`).
- Expected faults you can ignore: `path ... SUNK INTO grass`, paths overlapping each other at the fork, `grass FLOATS
  ABOVE the ground line` (thin layers on sloping ground), and a person FLOATS / SUNK by 0.04u or less while walking
  down the slope. Anything bigger, or anything that passes through a person, is real.
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-part-ways$"`. Then one full inspect run and look at it:
  `node scripts/inspect.mjs 5225 --goals plans/qwen/goals/015-wakareru-fork.json --loop 8 --times 1,2.9,4.4,5.9
  --out plans/qwen/renders/015-wakareru-fork`. Then the orbit render:
  `node scripts/orbit.mjs 5225 --times 1,2.9,5.9 --out plans/qwen/renders/015-wakareru-fork.jpg`. Ask yourself: would
  a child see two friends saying goodbye and going separate ways?

## Commit

`別: two friends part where the path forks, and the kanji splits (plan 015)`, then the report as the README says. Paste
the last Goals lines, and add one line per round: what you changed, and the N of M PASS you got.
