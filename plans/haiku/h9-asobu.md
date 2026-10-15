# Plan h9: 遊 "play" (card 904a): a new scene `q-seesaw`

Plan in words (no code), with goals: `plans/haiku/goals/h9-asobu.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** play: two children on a seesaw go up and down, laughing, stars popping over whoever is up. A child sees "they're playing".

## Code
- Scene module `src/effects/vignettes/h-play.js` (already created and registered; replace its empty `SCENES` with your scene `q-seesaw`).
- Catalog: one `VM(...)` line for `q-seesaw` in `src/effects/vcat-hb.js`, models `['gal2', 'guy2']`, with the right cost.
- Card `content/cards/904a.json`: set `"effect"` to exactly `{"material": "glow:gold", "backdrop": "sky:day", "vignette": {"type": "q-seesaw"}}`.

## The scene (loop 6 s)
- A seesaw: a red stand (`'pivot'`, a triangular block or a short thick cylinder on its side, 0.2 tall) on the ground
  at x 0.95, z 0; a plank (`'plank'`, 0.9 long from x 0.5 to 1.4, 0.04 thick, 0.1 wide) resting on top of it at y 0.22,
  with a small handle bar near each end. The plank tilts about the top of the stand, up to 15 degrees each way.
- Two kids (`KID`): the girl (`gal2`) sitting on the left end (x 0.58), the boy (`guy2`) on the right end (x 1.32),
  facing each other, both hands on the handle in front of them. Use the seated pose of `SitDown` (or `seatAt` in
  `src/effects/vignettes/q-ride.js`); each kid moves with their end of the plank.
- Timing: three full ups and downs (2 s each). At t 0.5 the left end is all the way down and the right end all the way
  up (then 1.5 the other way, and so on). The kid at the bottom bends the knees, feet touching the ground, and pushes
  off; the kid at the top raises one arm, and a few yellow stars (`stars`) pop over their head. A `'わーい!'` bubble at
  1.0 and 4.0.

## Checks
Every inspect run with `--goals plans/haiku/goals/h9-asobu.json --scan 0.25 --loop 6` (see common.md). Final run: `--times 0.5,1.5,2.5`, and the orbit render with `--times 0.5,1.5`.

## Commit
`遊: two children go up and down on a seesaw (Haiku, plan h9)`
