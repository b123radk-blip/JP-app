# Plan h16: 冬 "winter" (card 51ac): a new scene `q-snowman`

Plan in words (no code), with goals: `plans/haiku/goals/h16-fuyu.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-pour.js` and `h-play.js`.

**The idea:** snow falls, a girl in a red scarf and woolly hat rolls a big snowball, lifts a smaller one on top, gives
it a carrot nose, then shivers "さむい!". A child sees "winter".

**The layout is already checked** (`plans/haiku/layouts/h16-fuyu.json`, every goal passes with the real models): keep
its numbers. Falling snow comes from the card's recipe (`particles: snow`), not from the scene.

## Code
- Scene module `src/effects/vignettes/h-winter.js` (already created and registered; replace its empty `SCENES` with your scene `q-snowman`).
- Catalog: one `VM(...)` line for `q-snowman` in `src/effects/vcat-hb.js`, models `['gal2']`, with the right cost.
- Card `content/cards/51ac.json`: set `"effect"` to exactly `{"material": "ice", "backdrop": "sky:snow", "particles": [{"type": "snow"}], "vignette": {"type": "q-snowman"}}`.

## The scene (loop 7 s)
- Snow on the ground (`'snowfield'`): a white slab 0.95 wide (x), 0.03 tall, 0.7 deep, centred at x 0.93, z 0, on the
  ground, with soft rounded edges if you can (a flattened sphere is fine).
- The snowman, standing on the snow at x 0.72, z 0.02: body (`'snowbody'`) a white ball radius 0.17 (its bottom on the
  snow top, y 0.03); head (`'snowhead'`) a white ball radius 0.11. Two coal eyes and an orange carrot nose (a cone, 0.08
  long, pointing at the learner) and three coal buttons, all part of the head and body meshes they sit on.
- The girl (`gal2`, `KID`) on the snow at x 0.98, z 0.07, turned -60° (toward the snowman and the learner), with a red
  scarf (a torus round her neck) and a red woolly hat (a half sphere on her head), worn the whole loop.
- Timing:
  - 0 to 2.4: the body ball grows from radius 0.06 to 0.17 as it rolls from x 0.95 to 0.72 (it turns as it rolls, its
    bottom always on the snow), the girl walking behind it (`Walk`) from x 1.2 to 0.98, bent forward (`bow(0.5)`),
    pushing it with both hands (her hands at its back side, against it, not in it). She never passes into the ball.
  - 2.4 to 2.6: the head ball sits on the snow beside her (x 1.15, z 0.15).
  - 2.6 to 3.4: she lifts the head ball onto the body: hands at its sides (right hand point (0.855, 0.47, 0.07) when
    it is on top), the ball rising from the snow to its place on top of the body (bottom at y 0.37).
  - 3.4 to 4.0: the eyes, nose and buttons pop in one after another.
  - 4.0 to 5.6: she shivers (small fast side-to-side tremble, arms hugging her chest), a `'さむい!'` speech bubble.
  - 5.6 to 6.4: she waves at the learner. 6.4 to 7.0: the snowman shrinks back into a small ball at x 1.0 (radius 0.06)
    and the head goes back beside her, for the loop.

## Checks
Every inspect run with `--goals plans/haiku/goals/h16-fuyu.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 1.2,3.0,4.8`, and the orbit render with `--times 3.0,4.8`.

## Commit
`冬: a girl in a scarf builds a snowman in the falling snow and shivers (Haiku, plan h16)`
