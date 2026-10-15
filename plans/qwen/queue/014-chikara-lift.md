# Plan 014: 力 "power; strength" (card 529b), new scene `q-power`

Card: 529b
Inspect: --loop 7

A new card. This plan is in words, with **goals** in `plans/qwen/goals/014-chikara-lift.json`. Read
`plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`, `measure`, `try_value`). You write the code; the
plan gives every number. The layout is already checked with the real man (`plans/qwen/layouts/014-chikara-lift.json`;
what the learner sees: `plans/qwen/renders/014-plan-seat.jpg`). Keep its numbers.

**The idea a child should get:** a strong man bends down, grabs a barbell with huge black plates and heaves it up to his
chest. He holds it there, shaking with the effort, then drops it with a thud that makes the kanji jump, and cheers with
both arms up. That is power.

## Code

- `src/effects/vignettes/q-power.js` is a stub: replace it with the scene `q-power`, exported as `SCENES`. Start the
  file with a comment describing the scene beat by beat. It is already registered (`qwen-batch.js`) and the card
  already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-power': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Example to copy patterns from: `src/effects/vignettes/q-pour.js` (props, `grip`, `pop`, `burst`).

## The layout (lengths in u: x from the kanji's right edge, y up, z toward the learner)

| Thing | Name (`mesh.name`) | Size | Where | Colour |
|---|---|---|---|---|
| floor mat | `floor mat` | box 0.95 × 0.02 × 0.55 | top at y 0, centre x 0.95, z 0 | blue #3a6ea5 |
| bar | `bar` | cylinder radius 0.015, length 0.70, lying along x | from x 0.60 to 1.30, axis at y 0.2, z 0.12 when on the mat | steel #c0c4cc |
| plates | `plates` | two discs radius 0.2, 0.08 thick, axis along x, **one** `solidProp` | left disc from x 0.52 to 0.60, right disc from x 1.30 to 1.38, same axis as the bar | black #222222, a light grey rim if you like |
| the man | `guy3` (ADULT, `actor('guy3', 0.9 * u)`) | | feet at x 0.95, z −0.15, facing the learner (turn 0), all the time | |

- The bar and the plates move together (put both in one group and move the group). The bar stops at the plates' inner
  faces, so it never passes through them.
- Grip points: x 0.82 (his **right** hand: it is on the learner's left) and x 1.08 (his left hand), on the bar.
  Use `grip` with r = 0.015u for each hand, palms against the bar from above (from behind it when it is at his chest).

## Timing (loop 7 s; nothing moves while the strokes draw)

- 0 to 0.8: `Idle`, the barbell lies on the mat.
- 0.8 to 1.5: he bows down (`bow`, k up to 1.0) and both hands reach the grip points (the bar's axis is at y 0.2).
- 1.5 to 2.4: he heaves it up: the bar goes from y 0.2 to y 0.5 (z stays 0.12), eased; his bow goes back to 0 at the
  same time. The hands stay on the bar.
- 2.4 to 4.2: he holds it at his chest and trembles (the barbell and his body shake a little, about 0.005u, fast but
  never faster than 0.3 s per swing; `tremble` from timeline.js). Optional: two sweat drops (`DROP` from kit-things)
  fly off his head.
- 4.2 to 4.6: he lets it fall: y 0.5 to 0.2, accelerating (ease in), hands off at 4.6.
- 4.6: THUD. The kanji jumps: lift `stage.glyph` by up to 0.06u and back by 4.9 (a `bump`). A dust `burst` (grey,
  `pop`) at each plate's foot for 0.4 s.
- 5.0 to 6.6: `Victory` (both arms up). Gold `stars` pop above his head from 5.2 to 6.4.
- 6.6 to 7: `Idle`, everything as at 0.

## Goals and checks

- After every change: `check_goals` with card 529b, goals `plans/qwen/goals/014-chikara-lift.json`, loop 7.
- Before you change a number to fix a FAIL, `measure` the things it names at a failing moment (for example
  `what: "guy3 right hand,bar"`).
- Victory's arms pass close above the plates at about t 5.25. That's fine as long as nothing touches.
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-power$"`. Then one full inspect run and look at it:
  `node scripts/inspect.mjs 529b --goals plans/qwen/goals/014-chikara-lift.json --times 1.2,3.3,4.65,5.8
  --out plans/qwen/renders/014-chikara-lift`. Then the orbit render:
  `node scripts/orbit.mjs 529b --times 1.2,3.3,5.8 --out plans/qwen/renders/014-chikara-lift.jpg`. Ask yourself:
  would a child see a strong man lifting something very heavy?

## Commit

`力: a strong man heaves a barbell to his chest, drops it with a thud and cheers (plan 014)`, then the report as the
README says. Paste the last Goals lines, and add one line per round: what you changed, and the N of M PASS you got.
