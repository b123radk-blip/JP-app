# Plan 012: 渡す "to ferry across; to carry across" (card w1444610): a new scene `q-ferry`

A plan in words, with **goals**: `plans/qwen/goals/012-watasu-ferry.json`. Read "Goals" in the README first. Up to
**six** inspection rounds. You write all the code; this plan gives no code.

The card's scene now (`q-hand-over`: a worker hands a woman a parcel) shows "hand over", but the card's meaning is
**to ferry across**. Build a new scene where a ferryman rows a woman across a river in a little boat, so a child sees
"someone is carried across the water".

## Where the code goes

- A new file `src/effects/vignettes/q-ferry.js` with one scene, `q-ferry`, exported as `SCENES` like the other modules
  (first lines: a comment saying what the scene shows, like the other files). Register it in
  `src/effects/vignettes/index.js` (import its SCENES and add it to the big `SCENES` list at the end).
- Its catalog entry in `src/effects/vcat-q5c.js` (the `Q5C` list): a `VM(...)` entry like its neighbours, with a
  one-line description of the scene, the models `['guy3', 'gal2', 'rowboat', 'paddle']`, and its draw-call cost (the
  cost check tells you if the number is wrong).
- The card `content/cards/w1444610.json`: change only `effect.vignette` to `{ "type": "q-ferry" }` (keep material and
  backdrop).
- **Read first, as your example:** `src/effects/vignettes/step1-boat.js` (the 前 boat race). Its `rower()` already
  builds a rowboat (the `rowboat` model) with a person sitting on the middle bench rowing two oars (`paddle` models), the
  hands on the oar handles, and the oars dipping and pulling. Build your boat and rower the same way (you may copy
  and adapt that code into your file). For sitting someone on a seat, `seatAt` in `src/effects/vignettes/q-ride.js`
  puts a posed person's hips on a point. People: `person(name, u, scale)` from `q-common.js` (an actor with the
  gestures in `model-kit.js`: `pose`, `wave`, `turn` ...); the clips are listed in docs/MODELS.md (`Walk`, `SitDown`,
  `StandUp`, `Idle`, `Victory`).

## What the scene must show (x from the kanji's right edge, in u)

- **Ground and water**, low and tilted a little toward the learner so the water reads from the seat:
  a grass **left bank** from about x 0.15 to 0.55, a blue **river** from 0.55 to 2.15, a grass **right bank** from
  2.15 to 2.55. The river runs from the back to the front (the boat crosses it from left to right). Give these three
  meshes the names `left bank`, `river`, `right bank` (`mesh.name = ...`): the goals find them by those names.
- **The boat** (rowboat, about as big as in the 前 scene, bow pointing right) with **the ferryman** (`guy3`) on the
  middle bench rowing with two oars, his hands on the handles. He stays in the boat the whole loop.
- **The woman** (`gal2`, a grown-up) sits at the boat's back seat (the stern, behind the ferryman), facing the way they go.
- **Timing** (seconds into the loop; the loop is 9 s; nothing moves while the strokes draw):
  - 0 to 1: she stands on the left bank (Idle), the boat waits touching the left bank.
  - 1 to 1.6: she steps into the boat and sits down at the stern (a short step, then `SitDown` with her hips on the seat).
  - 1.6 to 5.6: the ferryman rows; the boat crosses the river to the right bank (eased start and stop, a little bob,
    the oars dipping every stroke).
  - 5.6 to 6.4: she stands up and steps out onto the right bank.
  - 6.4 to 7.6: she turns to the ferryman and waves (thank you).
  - 7.6 to 9: she walks off to the right and fades out, while the boat with the ferryman rows back to the left bank,
    so the loop ends where it started (she is back on the left bank at 0).
- Keep the scene's height small (about a glyph tall, people about 0.72u like the 前 rowers) and the kanji and its
  meaning label uncovered.

## Rounds

- Every round: `node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/012-watasu-ferry.json --scan 0.25 --quick`.
- When all goals pass (or your rounds are used up): one full run without `--quick`, `--times 0.5,3.5,6,7`, with
  `--out plans/qwen/renders/012-watasu-ferry`, and the orbit render
  `node scripts/orbit.mjs w1444610 --times 0.5,3.5,7 --out plans/qwen/renders/012-watasu-ferry.jpg`.
  Look at the pictures: does a child see a woman being rowed across a river?
- The usual checks too (README step 3): `node --check` on each changed file, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-ferry$"`.

## Commit

`渡す: a ferryman rows a woman across the river (plan 012)`, then the report as the README says, with
`## Inspection rounds`: one line per round with what you changed and the Goals line (N of M PASS).
