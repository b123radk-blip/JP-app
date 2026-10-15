# Plan h1: 集 "gather; meet" (card 96c6): a new scene `q-chicks-gather`

Plan in words (no code), with goals: `plans/haiku/goals/h1-atsumaru.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Similar finished scene to read first: `m-three-chicks` in `src/effects/vignettes/models-a.js`
(chick models walking and cheering).

**The idea:** a girl scatters feed and little chicks come running from every side until they are all gathered round
her feet, pecking. A child sees "they all come together".

## Code
- New file `src/effects/vignettes/q-gather.js` (scene `q-chicks-gather`), registered in `src/effects/vignettes/index.js`.
- Catalog: a `VM(...)` entry in `src/effects/vcat-q5a.js` with models `['gal2', 'chick']` and the right cost.
- Card `content/cards/96c6.json`: `effect.vignette` = `{ "type": "q-chicks-gather" }`.

## The scene (loop 7 s)
- A round grass patch (`mesh.name = 'grass'`), flat on the ground line, about 1.1u across, centred at x 0.8, z 0.
- The girl (`gal2`, scale `ADULT`) stands in the middle of the patch facing the learner, holding a small bowl of feed
  in her left hand (a bowl from shapes, held with `grip` + `hold`).
- Six chicks (`chick` model, about 0.22u tall), each starting at the edge of the patch (spread round it, at least
  0.4u from her, some at the back, some at the sides, some in front but not in front of her body).
- Timing (seconds after the strokes): 0 to 1 she dips her right hand in the bowl and throws feed: a little spray of
  yellow grains (`many`) lands round her feet. 1 to 3.5 the chicks walk (clip `walk`, then `run` for the last ones)
  to a ring round her feet (about 0.2u from her, none in front of her legs from the learner's side, none overlapping).
  3.5 to 5.5 they peck (clip `eat`), a small "!" or heart over one or two. 5.5 to 7 they walk back to where they
  started (the loop ends where it began).

## Commit
`集: chicks run in from all round and gather at a girl's feet (Haiku, plan h1)`.
