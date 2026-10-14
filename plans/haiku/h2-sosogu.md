# Plan h2: 注 "pour; notes" (card 6ce8): a new scene `q-jug-pour`

Plan in words (no code), with goals: `plans/haiku/goals/h2-sosogu.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Similar finished scenes to read first: `tea-pour` in `src/effects/vignettes/home.js` (a
teapot tips and a stream of drops pours into a cup that fills) and `q-drink` in `src/effects/vignettes/q-gestures.js`
(a person holding a glass with `grip` + `hold`).

**The idea:** a girl tips a big jug of water and pours a clear blue stream into a tall glass on a little table; the
water rises up the glass until it is full, she stops and smiles. A child sees "pouring".

## Code
- New file `src/effects/vignettes/q-pour.js` (scene `q-jug-pour`), registered in `src/effects/vignettes/index.js`.
- Catalog: a `VM(...)` entry in `src/effects/vcat-q5b.js` with models `['gal2']` and the right cost.
- Card `content/cards/6ce8.json`: `effect.vignette` = `{ "type": "q-jug-pour" }`.

## The scene (loop 6.5 s)
- A small round table (`mesh.name = 'table'`, top about 0.45u high, about 0.35u across) at x 0.75, z 0.1, standing on
  the ground line.
- A tall clear glass (`mesh.name = 'glass'`, about 0.1u wide, 0.22u tall, light blue, see-through look) standing on
  the table top; inside it the water (`mesh.name = 'water'`), a blue cylinder whose height grows from almost nothing to
  near the rim while she pours.
- The girl (`gal2`, `ADULT`) stands at x 1.15, z 0.05, turned toward the table (and a bit toward the learner so we see
  her face). She holds a jug (`mesh.name = 'jug'`: a white or light-orange jug with a handle and spout, about 0.18u
  tall, built from shapes) in her right hand by the handle (`grip` + `hold`; the palm against the handle).
- Timing: 0 to 1.2 she lifts the jug from her side to above the glass (spout over the glass, about 0.1u above the rim).
  1.2 to 2 she tips it; 2 to 4 a stream of water (`many` drops or a thin blue cylinder, named `stream`) runs from the
  spout down into the glass, and the water rises. 4 to 4.6 she tips back, the stream stops. 4.6 to 5.5 a small sparkle
  over the full glass, she smiles (a nod). 5.5 to 6.5 she lowers the jug and the water drains back to empty (fading),
  so the loop starts again.

## Commit
`注: a girl pours a jug of water into a glass until it is full (Haiku, plan h2)`.
