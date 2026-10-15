# Plan 013: 渡す "to ferry across; to carry across" (card w1444610), scene `q-ferry` rebuilt

Card: w1444610
Inspect: --loop 8.5

This plan is in words, with **goals** in `plans/qwen/goals/013-watasu-ferry.json`. Read `plans/qwen/CHEATSHEET.md`
first and use your tools (`check_goals`, `measure`, `try_value`). You may use up to **six** fix rounds. You write the
code; the plan gives every number.

**Why this is a redo:** 渡す is two glyphs wide, so the learner only sees about one glyph of room to the right of す.
Plan 012's river ran left to right over 2.5 glyphs, so the far bank was off the picture. This version crosses **toward
the learner**: the far bank is at the back, the near bank in front, and the boat comes forward between them. The whole
ground is one sloping surface, tilted 26° so the learner sees the water from above. In the picture the far bank sits
higher up and the near bank lower down. The layout is already checked with the real people
(`plans/qwen/layouts/013-watasu-ferry.json`; what the learner sees: `plans/qwen/renders/013-plan-seat.jpg`). Keep its
numbers.

**The idea a child should get:** a woman waits on the far side of a river. A ferryman standing in the back of a little
boat pushes it across with a long pole, bringing her to this side. She gets out and waves. So she was "carried across".

## Code

- Rewrite `src/effects/vignettes/q-ferry.js` completely: one scene, `q-ferry`, exported as `SCENES`. Start the file with
  a comment describing the scene beat by beat. The old file's rowing code is not needed.
- Its catalog line in `src/effects/vcat-q5c.js` (`'q-ferry': VM(...)`): a new one-line description (a ferryman poles a
  woman across the river toward you), models `['guy3', 'gal2', 'rowboat']`, and the right cost (the cost check says if
  it's wrong).
- Leave the card file alone; it already uses `q-ferry`.
- Example to copy patterns from: `src/effects/vignettes/q-pour.js` (holding a thing with `grip` + `hold`, named props,
  `pop`). To seat someone: `seatAt` in `src/effects/vignettes/q-ride.js`. The boat model: `createModel('rowboat',
  { height: 0.64 * kb })` with `kb = 0.3 * u`. Remove its fixed oars the way `rower()` in `step1-boat.js` does
  (`boat.node('paddles')`). The model's bow points along +z, toward the learner, which is what this scene needs
  (no turn).

## The layout (lengths in u: x from the kanji's right edge, y up, z toward the learner)

The sloping ground: a point at depth z is at height **y = (0.5 − z) × 0.488** (tan 26°). Everything that lies on the
ground is turned `rotation.x = 26°` (0.4538 rad): its far end goes up and its near end goes down. People and the pole
stay upright.

| Thing | Name (`mesh.name`) | Size w × h × d | Its bottom-middle at | Colour |
|---|---|---|---|---|
| far bank (grass) | `far bank` | 0.95 × 0.06 × 0.3 | x 0.5, z −1.0, y 0.732 | green #6ab04c |
| river | `river` | 0.95 × 0.03 × 1.2 | x 0.5, z −0.25, y 0.366 | blue #2f8fe0, a lighter top if you like |
| near bank (grass) | `near bank` | 0.95 × 0.06 × 0.3 | x 0.5, z 0.5, y 0 | green #6ab04c |
| the boat (`rowboat` model, kb 0.3u) | its model name | about 0.42 × 0.19 × 0.72 | x 0.58, z from −0.49 (at the far bank) to −0.01 (at the near bank), y = slope(z) + 0.02, turned 26° like the ground | model |
| the pole | `pole` | a cylinder, radius 0.012, length 0.75 | in the ferryman's hands at his right side (x about 0.70), its bottom end in the water beside the boat | brown #8a5a30 |

- **The ferryman** (`guy3`, height 0.42u): stands upright in the back of the boat, 0.24 behind the boat's middle (z =
  boat − 0.24), x 0.58, facing the learner (turn 0). His feet are on the boat's floor, not on the bench. Use `measure` to
  find the floor height once the boat is in, then set his y so his feet touch it. He holds the pole with both hands
  (`grip` each hand on the pole with r = 0.012u, the right hand higher). Palms rest against the pole; it never goes
  inside a fist.
- **The woman** (`gal2`, height 0.42u, a grown-up): see the timing below. In the boat she sits on the front bench
  (z = boat + 0.14, x 0.58), facing the learner. Put her hips on the bench top (`seatAt`). In the 前 race, the bench top
  is about 0.56·kb above the boat's origin; check it with `measure`.
- On the sloping banks, her feet must stay on the grass: set her y from the slope at her z (plus the bank's 0.06).

## Timing (loop 8.5 s; nothing moves while the strokes draw)

- 0 to 0.9: she stands on the far bank at x 0.25, z −1.0 (`Idle`), facing the learner. The boat waits with its back end
  touching the far bank.
- 0.9 to 1.6: she walks (`Walk`) to the boat and steps in at the front bench (x 0.58, z −0.35). From 1.6 she sits
  (`SitDown`, hips on the bench by 1.8).
- 1.8 to 5.0: the ferryman poles the boat forward. The boat goes from z −0.49 to −0.01 (eased start and stop, a small
  bob). He pushes about once every 1.1 s: the pole's bottom is planted in the water behind him, he leans and pushes as
  the top tips forward, then he lifts it and swings it back. The pole's bottom stays in the water while he pushes.
- 5.0 to 5.2: the boat touches the near bank.
- 5.2 to 5.9: she stands up and steps out onto the near bank (x 0.45, z 0.5).
- 5.9 to 6.6: she faces the learner and waves (`wave`), happy.
- 6.6 to 7.8: she turns right (turn 90°) and walks off along the near bank to x 0.95. From 7.4 she shrinks away
  (`pop` from q-common.js, k going to 0 by 7.8).
- 6.4 to 8.5: the ferryman poles the empty boat back to the far bank (z −0.01 to −0.49).
- 8.0 to 8.5: she pops back in on the far bank at x 0.25, z −1.0 (k 0 to 1), so the loop ends where it started.

## Goals and checks

- After every change: `check_goals` with card w1444610, goals `plans/qwen/goals/013-watasu-ferry.json`, loop 8.5.
- Before you change a number to fix a FAIL, `measure` the things it names at a failing moment (for example
  `what: "gal2 hips,rowboat"`).
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-ferry$"`. Then do one full inspect run and look at it:
  `node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/013-watasu-ferry.json --loop 8.5 --times 0.5,3.4,6.2
  --out plans/qwen/renders/013-watasu-ferry`. Then do the orbit render:
  `node scripts/orbit.mjs w1444610 --times 0.5,3.4,6.2 --out plans/qwen/renders/013-watasu-ferry.jpg`. Ask yourself:
  would a child see a woman being taken across a river to this side?

## Commit

`渡す: a ferryman poles a woman across the river toward you (plan 013)`, then the report as the README says. Paste the
last Goals lines, and add one line per round: what you changed, and the N of M PASS you got.
