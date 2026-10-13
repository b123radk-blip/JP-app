# Plan 009: 習う "to take lessons" (card w1333070), scene `q-piano-lesson`: make the lesson easy to see

A plan in words: it says what the scene must show; you write the code. Up to **five** inspection rounds.

## Where the code is

- The scene: `piano()` in `src/effects/vignettes/q-music.js` (read it first), and the `keyboard()` helper above it (its
  arguments: width, colour, height of the keys above the floor, all in u). Change only those two functions. `keyboard()`
  is used only by `piano()`. q-music.js is at 300 lines: keep it near that (don't add more than about 15 lines).
- Its catalog line `'q-piano-lesson'` in `src/effects/vcat-q4c.js`: change the `+ 6` only if the cost check says.
- Card w1333070 uses `{ "type": "q-piano-lesson", "size": 1.2 }`: the people are 1.2 times bigger than the code's sizes.

## What is wrong now (measured by the inspection tool and the review sheet)

1. **The keyboards hide the people:** from the learner's seat the grandma is only 71% visible and the girl 67%: each
   stands or sits behind a keyboard whose top is at their chest, so their bodies and hands are behind it.
2. **The girl is too far right:** she stands at about 1.3u to 1.5u right of the kanji, at the edge of the picture.
3. **The notes are small:** the three coloured notes that rise from the keys are hard to see from the seat.

## What the scene must show (keep the story and timing: grandma plays three coloured notes, red, yellow, blue; the girl
watches her hands, then plays the same three on her toy keyboard; grandma nods, じょうず!)

- **Both players fully in view, hands on the keys visible:** the learner must see each player's whole body and the
  hands pressing the keys. Do it by placing each keyboard so it is not between the player and the learner. One way
  that works: turn each player together with her keyboard about 0.5 to 0.7 rad toward the kanji, so the learner sees
  her from the front-side and the keyboard from its end, and make the keyboards' tops sit at the player's waist (lower
  the `height` argument). Choose any way that meets the numbers below.
- **Closer:** the whole scene within 1.2u of the kanji's right edge (grandma nearest the kanji, the girl beyond her).
- **Bigger notes:** about 1.5 times their size now, rising a little higher, each in its key's colour.
- **The coloured keys** (red, yellow, blue on each keyboard) stay visible from the seat.

## Checks

The usual ones (`node --check`, `npm test`, cost check `"^q-piano-lesson$"`), then after every change:

- `node scripts/orbit.mjs w1333070 --times 1,3.5,5.5 --out plans/qwen/renders/009-narau.jpg`
- `node scripts/inspect.mjs w1333070 --times 1,3.5,5.5 --out plans/qwen/renders/009-narau`
- `node scripts/look.mjs w1333070 --times 1,3.5,5.5 --out plans/qwen/renders/009-narau-look.jpg` (the learner's view,
  cropped; it warns if the scene goes past the preview's edge). It needs the app served on port 8080: start
  `npm run serve` in a second window first, or skip this check and say so.

The times: grandma plays, the girl plays, grandma nods.

What the inspection must show when you are done:
- Seen from the learner's seat: grandma and the girl each **85% visible or more** at every moment of the whole loop,
  and fully inside the picture.
- Both players touch what they sit or stand on (grandma her stool, the girl the ground line).
- In the Things list, every thing's right edge (centre x plus half its width) at **1.2u or less**.
- Each player's playing hand is at most about 0.05u from her keyboard while she plays (the Hands lines, at t+1 for
  grandma and t+3.5 for the girl).
- Expected and fine (meant): the white speech bubble じょうず! `FLOATS ABOVE` something (it is a bubble).

In the report, add a section `## Inspection rounds`: for each round, what the whole-loop list and the seat lines
said, what you saw, what you changed.

Commit message: `習う: the lesson in full view: players turned toward the kanji, lower keyboards, bigger notes (Qwen, plan 009)`
