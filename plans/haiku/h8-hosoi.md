# Plan h8: 細 "slender; narrow" (card 7d30): a new scene `q-narrow-gap`

Plan in words (no code), with goals: `plans/haiku/goals/h8-hosoi.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** narrow: a man walks up to a very narrow gap between two tall walls, bumps (too wide!), turns sideways, breathes in and squeezes through toward you, then wipes his brow on the other side. A child sees "so narrow!".

## Code
- Scene module `src/effects/vignettes/h-narrow.js` (already created and registered; replace its empty `SCENES` with your scene `q-narrow-gap`).
- Catalog: one `VM(...)` line for `q-narrow-gap` in `src/effects/vcat-hb.js`, models `['guy2']`, with the right cost.
- Card `content/cards/7d30.json`: set `"effect"` to exactly `{"material": "silver", "backdrop": "sky:dawn", "vignette": {"type": "q-narrow-gap"}}`.

## The scene (loop 7 s)
- Two tall walls standing on the ground, each a brick-coloured box 0.25 wide (x), 0.95 tall, 0.5 deep (z -0.25 to
  0.25): `'wallL'` from x 0.62 to 0.87 and `'wallR'` from x 1.03 to 1.28, so the gap between them is 0.16 wide and
  runs from the back to the front. Darker lines on them for bricks are welcome.
- The man (`guy2`, `ADULT`) in the gap's line, x 0.95.
- Timing: 0 to 1.2 he walks (`Walk`) from the back (z -0.45) to the gap's back opening (z -0.33), facing the learner;
  1.2 to 1.5 he stops, shoulders against the opening (too wide), an exclamation mark pops over his head. 1.5 to 2.0 he
  turns sideways (facing +x) and stands tall, chest in, arms tight at his sides. 2.0 to 4.5 he shuffles sideways
  through the gap from z -0.3 to z 0.33, small steps, without touching the walls. 4.5 to 5.2 he is out at the front
  (z 0.35): he turns to face the learner and wipes his brow with his right hand (`'ふう'` bubble). 5.2 to 6.3 he stands
  there; 6.3 to 6.7 he fades out and reappears at the back for the loop.

## Checks
Every inspect run with `--goals plans/haiku/goals/h8-hosoi.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 1.2,3.2,5`, and the orbit render with `--times 1.6,3.2`.

## Commit
`細: a man turns sideways and squeezes through a narrow gap between two walls (Haiku, plan h8)`
