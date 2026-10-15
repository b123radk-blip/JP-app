# Report: h9-asobu

## What I changed
- `src/effects/vignettes/h-play.js`: scene `q-seesaw` (the only export `SCENES`). A board group at the pivot tilts
  `15 deg * cos(pi (t - 0.5))` about z (loop 6 s: girl down at 0.5, boy down at 1.5, ...). Plank (`plank`, 0.9 x 0.04 x 0.1 u,
  with two handle posts and bars), red triangular stand (`pivot`) on the ground at x 0.95. The kids (`gal2` girl at x -0.37
  local, `guy2` boy at +0.37, both KID scale) are seated with `SitDown` at t 1.0 and placed with `seatAt` (q-ride.js) with
  hips 0.05 u above the plank top; they face each other along the plank. Both hands go to the handle bar; the top kid's
  right hand rises to a raised pose (a point 0.98 u up beside the head), blended by how far up that kid is. Stars (`stars`,
  two groups) pop over the kid on top and spin; a `わーい!` speech bubble at 1.0-2.0 over the girl and 4.0-5.0 over the boy.
- `src/effects/vcat-hb.js`: one catalog line for `q-seesaw`, `VM(pdc('gal2','guy2') + 6, ..., ['gal2','guy2'])`.
- `content/cards/904a.json`: `effect` set to exactly `{"material": "glow:gold", "backdrop": "sky:day", "vignette": {"type": "q-seesaw"}}`.
- Renders: `plans/haiku/renders/h9-asobu.jpg` (orbit, times 0.5,1.5), `plans/haiku/renders/h9-asobu/` (inspection pictures, times 0.5,1.5,2.5).

## Where I left the plan, and why (or "Nowhere")
- **Feet on the ground at the bottom (not done).** The plan says the kid at the bottom bends the knees, feet touching the
  ground, and pushes off. The same plan's goals require each kid to stay seated on the plank within 0.06 u at every moment,
  and a seated kid's feet hang at about plank height, so they do not reach the ground. I did not add a stand-up or
  knee-bend motion, so the bottom kid is only seated, with no push-off. Opus should decide whether the goal or the feet
  line wins.
- **Fix in my own code during round 2**: the first version of `over()` shared one vector for both kids, so the stars and
  the bubble went to the boy's position. Fixed with separate vectors. The bubble was also moved 0.1 u left and 0.2 u up so
  the stars do not cover it; its tail points at the head.

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/h-play.js` and `node --check src/effects/vcat-hb.js`: no output (passed).
- `npm test`: last lines:
```
# cancelled 0
# skipped 0
# todo 0
# duration_ms 10076.560551
content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 848 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
679 recipes, 0 cost mismatches
```
  (exit code 0, no `FAILED` line.)
- `node scripts/check-piece-costs.mjs vignette "^q-seesaw$"`: `679 recipes, 0 cost mismatches`.
  (My catalog cost is pdc(12) + 6 = 18 draw calls; the checker matched it.)
- `node scripts/orbit.mjs 904a --times 0.5,1.5 --out plans/haiku/renders/h9-asobu.jpg`: last line
  `plans/haiku/renders/h9-asobu.jpg (looking at 0.38,0.08,0.00)`, exit 0.
- Final `inspect.mjs 904a --goals plans/haiku/goals/h9-asobu.json --scan 0.25 --loop 6 --times 0.5,1.5,2.5 --out plans/haiku/renders/h9-asobu`:
  exit 0. Its goals line:
```
## Goals: 11 of 11 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
```

## What I see in the render (each of the six views, one line each, and any fault left)
- front t+0.5: seated girl on the left, boy on the right, plank tilted with the boy up and stars over him; no visible floating. Fault left: the feet do not touch the ground (see above).
- right side t+0.5: stars over the top kid's head, the stand below the plank, nothing visibly through anything.
- top t+1.5: seesaw seen from above, the kids sit on the plank at the two ends; nothing visibly through anything. A dark dashed line runs under the stand (probably the ground line or grid), not part of the scene.
- back-left t+0.5: the girl's raised arm and both kids at the handle, stars over the top kid.
- front-right t+1.5: the girl up with the bubble and stars over her head, the boy down.
- low front t+1.5: the bubble over the girl's head, stars at the top; the plank rests on the stand's apex.
- Close-ups: the plank's bottom sits on the apex of the stand; the kids' hands rest on the handle bars.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last run (full, t+0.5 / t+1.5 / t+2.5), POSSIBLE FAULTS at each moment:
```
  - T1 mesh plank (blue/yellow #2a7ad0/#e8b848): SUNK INTO T4 mesh pivot (red #d03030) (gap -0.11u)
  - T2 model gal2: SUNK INTO T1 mesh plank (blue/yellow #2a7ad0/#e8b848) (gap -0.21u)
  - T3 model guy2: SUNK INTO T1 mesh plank (blue/yellow #2a7ad0/#e8b848) (gap -0.05u)
```
(At t+1.5 the gal2 gap is -0.05 and the guy2 gap -0.21.) The whole-loop list has the same three, with gal2 and guy2 worst at -0.21 u.
- "Plank SUNK INTO pivot, -0.11 u": the measure uses the plank's tilted box, which dips below the stand's top. The
  plank's real ends (x 0.5 and 1.4) are well outside the triangle, and the plank rests on the apex. Fine by eye. The goal
  "the plank lies on the stand" is PASS at 0 u, and the close-ups (faults 1-2) show the plank on the apex.
- "Girl / boy SUNK INTO plank, -0.05 to -0.21 u": the measure uses the body's lowest point (hanging feet and the seat box)
  against the plank's box. In the close-ups (faults 3, 5 and 6) the seated bodies sit on the plank with the legs beside its
  end; nothing passes through the plank. Fine by eye for a seated body on a tilted plank. "Bodies passing into things" is
  "none" in every run.
- Goals: 11 of 11 PASS. The girl's and boy's hands are within the plank's box because they hold the handle posts, which are part of the plank mesh; expected.

## Inspection rounds
1. `--quick` with goals: 11 of 11 PASS. Faults: plank SUNK into pivot, girl and boy SUNK into plank (box measures), bubble FLOATS ABOVE the boy (bubble in the wrong place).
2. Full run with pictures (t 0.5, 1.5, 2.5): found the shared-vector bug (stars and bubble went to the boy's place). Fixed in code (separate vectors); goals still 11 of 11 PASS.
3. `--quick` after the fix: 11 of 11 PASS. Faults: the same three SUNK lines; the bubble still too low over the girl's stars.
4. Full run after moving the bubble (0.1 u left, 0.2 u up): `## Goals: 11 of 11 PASS`. Faults: only the three SUNK lines above, judged fine by eye.
