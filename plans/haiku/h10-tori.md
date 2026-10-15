# Plan h10: 鳥 "bird" (card 9ce5): a new scene `q-bird-branch`

Plan in words (no code), with goals: `plans/haiku/goals/h10-tori.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** a bird swoops down out of the sky, lands on a branch, hops, turns its head and sings (music notes), then flies off. A child sees "a bird".

## Code
- Scene module `src/effects/vignettes/h-bird.js` (already created and registered; replace its empty `SCENES` with your scene `q-bird-branch`).
- Catalog: one `VM(...)` line for `q-bird-branch` in `src/effects/vcat-hb.js`, models `['pigeon', 'pigeonFlying']`, with the right cost.
- Card `content/cards/9ce5.json`: set `"effect"` to exactly `{"material": "jade", "backdrop": "sky:morning", "vignette": {"type": "q-bird-branch"}}`.

## The scene (loop 7 s)
- A small tree: a brown trunk (`'trunk'`, radius 0.04) from the ground to y 0.6 at x 1.0, z -0.1, a bare branch
  (`'branch'`, radius 0.02) going left from the trunk at y 0.58 out to x 0.72, and a few green leaf clusters
  (spheres) at the top of the trunk (y 0.6 to 0.8).
- The bird, about 0.18u long: the `pigeonFlying` model while it flies, the `pigeon` model while it sits (show one,
  hide the other; the goals measure them by these model names). The models do not flap, so while flying bob the bird up and down and tilt it
  gently in time.
- Timing: 0 to 0.5 nothing. 0.5 to 2.0 it swoops in from the upper left (x 0.55, y 1.05, z 0.2) down to the branch,
  slowing, and lands at x 0.82 standing on top of the branch at 2.0. 2.0 to 4.5 it sits: a little hop along the branch
  to x 0.88 (2.4 to 2.7), turns its head left and right, and sings: three music notes (`emblemProp('note')`, named
  `'note'`) rise from its beak one after another 2.8 to 4.0. 4.5 to 6.2 it takes off and flies up and to the right to
  x 1.35, y 1.1, z 0.1, fading out 5.8 to 6.2. 6.2 to 7 nothing.

## Checks
Every inspect run with `--goals plans/haiku/goals/h10-tori.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 0.9,3.4,5.2`, and the orbit render with `--times 0.9,3.4`.

## Commit
`鳥: a bird swoops onto a branch, sings and flies away (Haiku, plan h10)`
