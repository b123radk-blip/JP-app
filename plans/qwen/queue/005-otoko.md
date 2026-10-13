# Plan 005: 男 "male" (card 7537), scene `q-plough`, a plan in words

Like plan 004, this plan says **what** the scene must show; you write the code. The new part: after every change you
run the inspection tool (see the rules) and fix what it reports. Up to **five** rounds.

## Where the code is

- The scene: `ploughMan()` in `src/effects/vignettes/q-plough.js` (the whole file is this scene; read it first). Keep
  its story and timing: he ploughs one row toward the kanji, wipes his brow, celebrates, turns, ploughs the next row
  back, turns again.
- Its catalog line: `'q-plough'` in `src/effects/vignette-catalog.js`. The `5` in `(o.outcome === 'boy' ? 2 : 5)` is the
  number of meshes `ploughMan` adds itself; if you add meshes, raise that 5 (the cost check tells you the right number).
  **Do not change** the `boy` outcome (the `boyPlane` scene in q-people.js, used by the word 男の子).
- A moustache already exists in `src/effects/vignettes/q-dad.js`: the `tache()` shape, the `MOUSTACHE` offset and how
  `onBone(pa, 'Head', stache, group, MOUSTACHE)` keeps it on the face every frame (import `onBone` from
  `./bone-mount.js`). Copy the shape and the idea into q-plough.js; don't import from q-dad.js.
- Change only q-plough.js and that catalog line.

## What is wrong now

1. The field is a paper-thin brown board floating in the sky, and the "rice" along its back is a row of green spikes.
2. Nothing says "man": it's just a person pushing sticks. A child should think "a man, a strong man".

## What the scene must show

- **The field (田, rice field):** a thick block of dark brown soil (about 0.12u thick) so its sides show it is earth, not a
  board, with its bottom on the ground line (it may stay tipped a little toward the viewer, as now). Along the back of
  the field, two rows of young rice plants: each plant a small tuft of three or four thin green blades spreading up and
  out (thin cones, tilted), about 0.12u tall, not single spikes. Keep everything within the current draw-call style:
  build all the plants into the field's one `solidProp`.
- **The man (男):** the same worker, now with a big dark moustache on his upper lip, so he reads as a grown man.
- **Strength (力):** replace the cheer (the `Victory` pose) with a strong-man flex: both upper arms out to the sides,
  forearms up, fists beside his head (use `handTo` with the elbows out), held for about a second with the yellow burst
  behind him. Then he goes back to the plough as now.
- The plough as now: his palms on its two handles while ploughing, the share in the soil in front of his feet.

## Checks

The usual ones (`node --check`, `npm test`, cost check `"^q-plough$"`), then after every change:

- `node scripts/orbit.mjs 7537 --times 2,4.6,5.8,9 --dist 0.9 --out plans/qwen/renders/005-otoko.jpg`
- `node scripts/inspect.mjs 7537 --times 2,4.6,5.8,9 --out plans/qwen/renders/005-otoko`

The times are: ploughing the front row, wiping his brow, flexing, ploughing the back row.

What the inspection must show when you are done (and what is expected):
- His feet touch the field (`touches` the soil block) at every time, not FLOATS ABOVE or SUNK INTO.
- The field is ground or touches the ground line; it does not float.
- While ploughing (t+2, t+9): each hand's nearest other thing is the plough, about 0u away.
- At t+5.8 (flex): each hand's nearest own body part is the head or a shoulder, and the hands are above the shoulders.
- The moustache: on his face in the close-up pictures (look at the person close-ups from front and right). Expected: the
  inspection may call the moustache "high in the air above" something, because it is fixed to the face; that is fine.
- No body passing into the field or the plough except the hands on the handles.

Use `--look` for anything you are unsure of, e.g. the moustache from the side: `node scripts/inspect.mjs 7537 --look T3
--from right --t 5.8 --zoom 2 --out plans/qwen/renders/005-otoko` (use the man's id from the report).

In the report, list each round: what the inspection said, what you saw, what you changed.

Commit message: `男: a moustached man ploughs a rice field and flexes (Qwen, plan 005)`
