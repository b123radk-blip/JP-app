# Plan h4: 決 "decide" (card 6c7a): a new scene `q-pick-cake`

Plan in words (no code), with goals: `plans/haiku/goals/h4-kimeru.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** a girl can't choose between two cakes: a big "?" over her head, her finger hovers over one, then the other, then back. Then "!": she taps the chocolate one, a big green tick pops over it, and she pulls it toward her, happy. A child sees "she decided".

## Code
- Scene module `src/effects/vignettes/h-decide.js` (already created and registered; replace its empty `SCENES` with your scene `q-pick-cake`).
- Catalog: one `VM(...)` line for `q-pick-cake` in `src/effects/vcat-hb.js`, models `['gal2']`, with the right cost.
- Card `content/cards/6c7a.json`: set `"effect"` to exactly `{"material": "stone", "backdrop": "sky:day", "vignette": {"type": "q-pick-cake"}}`.

## The scene (loop 7 s)
- A small table (`mesh.name = 'table'`) standing on the ground: top 0.6 wide (x) and 0.26 deep (z), top surface at
  y 0.42, centred at x 0.8, z 0.15, four thin legs.
- On it two cakes, each a slice on a little white plate, one mesh each: `'cakeA'` (white sponge with a red
  strawberry on top) at x 0.65, z 0.15 and `'cakeB'` (chocolate brown, a cherry on top) at x 0.95, z 0.15. About
  0.12 wide and 0.1 tall each; plates rest on the table top.
- The girl (`gal2`, `ADULT`) behind the table at x 0.8, z -0.12, facing the learner, both feet on the ground. If her
  hand cannot reach the cakes, move her a little closer, never into the table.
- Timing: 0 to 1 she looks down at the cakes. 1 to 3.2 a big question mark (`emblemProp('question')`, about 0.18u,
  `name = 'question'`) floats over her head (y about 1.05); her right hand hovers about 0.08 above cake A (1 to 1.8),
  then over cake B (1.8 to 2.6), then over cake A again (2.6 to 3.2). 3.2 to 3.6 the question mark is replaced by an
  exclamation mark (`'exclaim'`). 3.6 to 4.4 her hand comes down to touch the side of cake B's plate (resting against
  it, not inside), and a big green tick (`'check'`, `name = 'tick'`) pops up over cake B. 4.4 to 5.8 she slides cake B
  0.08 toward her (still on the table) and a small heart pops over her head. 5.8 to 7 the tick and heart fade and cake B
  slides back to its place, her hand back at her side.

## Checks
Every inspect run with `--goals plans/haiku/goals/h4-kimeru.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 1.4,2.2,4,5`, and the orbit render with `--times 2.2,4`.

## Commit
`決: a girl chooses between two cakes and decides on one (Haiku, plan h4)`
