# Plan h12: 正 "correct" (card 6b63): a new scene `q-shape-sorter`

Plan in words (no code), with goals: `plans/haiku/goals/h12-tadashii.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** correct: a child with a shape-sorter box tries to push a square block into the round hole: it won't go, a big red cross pops up. Then she tries the square hole: it drops right in, a big green tick and stars, and she cheers. A child sees "that's the right one".

## Code
- Scene module `src/effects/vignettes/h-correct.js` (already created and registered; replace its empty `SCENES` with your scene `q-shape-sorter`).
- Catalog: one `VM(...)` line for `q-shape-sorter` in `src/effects/vcat-hb.js`, models `['gal2']`, with the right cost.
- Card `content/cards/6b63.json`: set `"effect"` to exactly `{"material": "gold", "backdrop": "sky:noon", "vignette": {"type": "q-shape-sorter"}}`.

## The scene (loop 7 s)
- The box (`'sorter'`): a wooden box 0.4 wide, 0.2 tall, 0.3 deep on the ground at x 0.95, z 0.05, with two holes on
  its top: a round hole (a dark disc, 0.1 across) on the left at x 0.86 and a square hole (a dark square, 0.1 across) on
  the right at x 1.04.
- The girl (`gal2`, `KID`) behind the box at x 0.95, z -0.2, facing the learner, holding a blue cube (`'cube'`, 0.08u)
  in her right hand (`grip` + `hold`).
- Timing: 0 to 0.5 she holds the cube up. 0.5 to 1.2 she brings it down onto the round hole and pushes: it bumps on
  the top and won't go in (a small shake). 1.2 to 2.0 a big red cross (`emblemProp('cross')`, about 0.2u,
  `name = 'wrong'`) pops over the box and wobbles; she tilts her head. 2.0 to 2.8 she lifts the cube over the square
  hole. 2.8 to 3.4 it goes in and drops down into the box (hide it from 3.4, once it is inside). 3.4 to 4.6 a big green
  tick (`'check'`, `name = 'right'`) pops over the box with stars, and she raises both arms and cheers. 4.6 to 6.4
  they fade. 6.4 to 7 a new cube grows back in her hand.

## Checks
Every inspect run with `--goals plans/haiku/goals/h12-tadashii.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 0.3,1.5,3.3,4`, and the orbit render with `--times 1.5,4`.

## Commit
`正: a child finds the right hole for the square block (Haiku, plan h12)`
