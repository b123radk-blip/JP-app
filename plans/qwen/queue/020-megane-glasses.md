# Plan 020: 眼鏡 "glasses" (card w1577670), new scene `q-glasses`

Card: w1577670
Inspect: --loop 8

A new card and a **precise fitting** test: glasses must sit exactly on an old man's eyes, their arms clear of his
head, and both his hands must hold them by their ends, never inside them. This plan is in words, with **goals** in
`plans/qwen/goals/020-megane-glasses.json`. Read `plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`,
`measure`, `try_value`). The layout is checked with the real old man (`plans/qwen/layouts/020-megane-glasses.json`;
there the glasses are a plain box and the hands only reach for points, so its hand faults mean nothing; yours must
have none).

**The idea a child should get:** an old man peers at the kanji, but it wobbles, blurry. He puts on his glasses and
the kanji goes still and sharp. He nods, then takes them off, and it wobbles again. Glasses help you see.

## Code

- `src/effects/vignettes/q-glasses.js` is a stub: replace it with the scene `q-glasses`, exported as `SCENES`. Start
  the file with a comment describing the scene beat by beat. It is already registered and the card already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-glasses': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Examples: `src/effects/vignettes/q-hat-wind.js` (two hands gripping a thing's sides, a worn thing following the
  head), `src/effects/vignettes/q-try-hats.js`.

## The old man and the glasses (lengths in u: x from the kanji's right edge, y up, z toward the learner)

- The old man: `actor('grandpa', ADULT * u)`, feet at x 0.55, z 0, facing the learner. His arm is 0.24u; a hand
  reaches up to about y 0.71, his eyes are at about y 0.64.
- **Size the glasses from his face, never by eye.** `const e = who.shape().eyes, hu = ADULT * u;` gives (in heights)
  `e.apart` (outer edge of one eye to the other's), `e.half` (half his face's width at the eyes) and `e.z` (the face's
  front). Build a `THREE.Group` named `glasses` (its pivot is the middle between the lenses) holding two solidProps,
  both black #202020:
  - `lenses` (`mesh.name = 'lenses'`): two rings `G.torus(0.25 * e.apart * hu, 0.006 * hu)` with their middles at
    x ±0.27 · e.apart · hu (a torus faces the learner as built), a bridge box between them, and an end piece each side
    (a thin box, 0.008 hu thick) from the ring's outer edge out to x ±e.half · hu (the hinges).
  - `arms` (`mesh.name = 'arms'`): two thin boxes (0.008 hu square) from the hinges straight back (−z), each
    `(e.z - who.shape().mid.z + 0.02) * hu` long, so they reach back to his ears.
- **Put them on with `onEyes`:** while he wears them, every frame `who.onEyes(glasses, group, { out: 0.02 })`: it puts
  the group's pivot in front of the middle of his eyes and turns it with his head. Never place them by a guessed
  offset from the head.
- He holds the glasses by their **hinges**: his left hand (on the learner's right) at the +x hinge, his right hand at
  the −x hinge, each with `grip(side, hinge point, toward, 0.01u)`, the palm toward the glasses (`toward` from the hand
  to the hinge, so pointing inward along x), never with the fist round the frame.

## Timing (loop 8 s; nothing moves while the strokes draw)

- 0 to 1.4: `Idle`. He holds the glasses in front of his chest with both hands at the hinges (the glasses upright,
  lenses toward the learner, middle at about (0.56, 0.465, 0.16)). He leans his head toward the kanji, squinting
  (`turn('Head', ...)` a little toward the kanji and forward). The kanji wobbles: every stroke jiggles (stroke
  offsets with `stage.offset`, about 0.015u, quick, a different phase for each stroke) from 0 to 2.6.
- 1.4 to 2.4: both hands lift the glasses up to his face: the glasses blend from the chest place to the `onEyes`
  place (position lerp, quaternion slerp), and both grips follow the hinges every frame.
- 2.4 to 2.6: they settle on (exactly `onEyes`). The kanji stops wobbling at 2.6 (ease the jiggle out by then).
- 2.6 to 3.0: both hands let go and drop back to his sides. From now until 6.0 the glasses follow his head
  (`onEyes` every frame).
- 3.0 to 3.4: a glint: a small white four-point star flashes on his left lens and fades.
- 3.4 to 5.2: he looks at the kanji, pleased, and nods twice (`nod`), the glasses staying on his eyes.
- 5.2 to 6.0: both hands come back up to the hinges.
- 6.0 to 7.0: he takes the glasses off: they blend back from his eyes to the chest place, both hands with them. The
  kanji starts wobbling again from 6.4.
- 7.0 to 8.0: `Idle`, holding them at his chest, so the loop ends where it started.

## Goals and checks

- After every change: `check_goals` with card w1577670, goals `plans/qwen/goals/020-megane-glasses.json`, loop 8.
- "The lenses sit right in front of his eyes" measures the lenses' middle against the middle of his eyes (the eyes
  are measured from the face itself). If it FAILs, check you call `onEyes` on the group and that the lenses' middle is
  the group's pivot.
- "Nothing passes through him" checks the arms against his head and his hands against the glasses. If it FAILs,
  `measure` the things it names at the failing moment (`what: "grandpa left hand,lenses,arms"`).
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-glasses$"`. Then one full inspect run and look at it, above all
  `held.jpg` (the glasses close up from three sides): `node scripts/inspect.mjs w1577670 --goals
  plans/qwen/goals/020-megane-glasses.json --loop 8 --times 0.5,2.0,3.2,6.5 --out plans/qwen/renders/020-megane-glasses`.
  Ask yourself: would a child see a man put on glasses and see better?
- Keep your rounds short: a check after each change, the full inspect only at the end.

## Commit

`眼鏡: an old man puts on his glasses and the kanji stops wobbling (plan 020)`, then the report as the README says.
Paste the last Goals lines, and add one line per round: what you changed, and the N of M PASS you got.
