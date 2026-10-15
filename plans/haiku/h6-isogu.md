# Plan h6: 急 "hurry" (card 6025): a new scene `q-late-run`

Plan in words (no code), with goals: `plans/haiku/goals/h6-isogu.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** hurry: a man with a briefcase runs flat out across the street, sweat flying, glances at his watch (!) and runs faster; above him a big alarm clock rings and its hands race round. A child sees "he's in a hurry".

## Code
- Scene module `src/effects/vignettes/h-hurry.js` (already created and registered; replace its empty `SCENES` with your scene `q-late-run`).
- Catalog: one `VM(...)` line for `q-late-run` in `src/effects/vcat-hb.js`, models `['guy2']`, with the right cost.
- Card `content/cards/6025.json`: set `"effect"` to exactly `{"material": "lacquer", "backdrop": "sky:dusk", "vignette": {"type": "q-late-run"}}`.

## The scene (loop 3.4 s)
- The man (`guy2`, `ADULT`), `Run` clip, holding a briefcase (`briefcase` from q-common, `name = 'briefcase'`) in
  his right hand (`grip` + `hold`, the handle against his palm).
- His path: a smooth curve from the back right (x 1.3, z -0.4) to the front left (x 0.6, z 0.35), always facing the
  way he runs. 0 to 0.3 he fades in at the start; 0.3 to 2.6 he runs along the path; 1.2 to 1.6 he slows, lifts his
  left wrist to his face to look at his watch, and an exclamation mark (`'exclaim'`) pops over his head; then he runs on
  faster. 2.6 to 3.0 he fades out at the end; 3.0 to 3.4 nothing (the loop starts again).
- Sweat drops (`DROP` with `many`, about 6) fly off his head backwards while he runs; three thin white speed lines
  trail behind him.
- An alarm clock (`emblemProp('alarm')`, about 0.25u, `name = 'clock'`) floats at x 1.0, y 1.0, z -0.1, shaking as it
  rings the whole loop; if the emblem has hands, spin them fast. A speech bubble `'いそげ!'` (`speech`) pops near the
  man 0.5 to 1.2.

## Checks
Every inspect run with `--goals plans/haiku/goals/h6-isogu.json --scan 0.25 --loop 3.4` (see common.md). Final run: `--times 0.4,1.4,2.5`, and the orbit render with `--times 0.6,1.8`.

## Commit
`急: a man runs late with his briefcase under a ringing alarm clock (Haiku, plan h6)`
