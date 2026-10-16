# Plan 017: 試 "test; try" (card 8a66), new scene `q-try-hats`

Card: 8a66
Inspect: --loop 8

A new card. This plan is in words, with **goals** in `plans/qwen/goals/017-tamesu-hats.json`. Read
`plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`, `measure`, `try_value`). You write the code; the
plan gives every number. The layout is already checked with the real woman (`plans/qwen/layouts/017-tamesu-hats.json`;
what the learner sees: `plans/qwen/renders/017-plan-seat.jpg`, where the hats are plain cylinders). Keep its numbers.

**The idea a child should get:** a woman tries on hats, as if the learner were her mirror. She flips a big brown hat
onto her head: it is far too big and drops over her eyes. She shakes her head, lifts it off and tosses it back. Then
she tries the small red cap: it fits! She spins round to show it off, and hearts pop up. She tried them.

## Code

- `src/effects/vignettes/q-try-hats.js` is a stub: replace it with the scene `q-try-hats`, exported as `SCENES`. Start
  the file with a comment describing the scene beat by beat. It is already registered (`qwen-batch.js`) and the card
  already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-try-hats': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Examples: `src/effects/vignettes/q-pour.js` (props, `grip`, `pop`, `heart`), `onHead` in `q-common.js` (puts a prop
  on a body point every frame, e.g. `onHead(a, cap, group, 'over')`; measure where 'over' is first).

## The layout (lengths in u: x from the kanji's right edge, y up, z toward the learner)

| Thing | Name (`mesh.name`) | Size | Where | Colour |
|---|---|---|---|---|
| floor | `floor` | box 0.95 × 0.02 × 0.55 | top at y 0, centre x 0.93, z 0 | wood #b08a60 |
| hat stand | `stand` | pole r 0.015 from y 0 to 0.76, a foot disc r 0.09 × 0.02 | x 1.25, z −0.06 | dark wood #6a4a28 |
| low tier | `tier low` | disc r 0.13, 0.02 thick | top at y 0.45, on the pole | dark wood |
| top tier | `tier top` | disc r 0.13, 0.02 thick | top at y 0.78, on the pole | dark wood |
| big hat | `big hat` | one `solidProp`: crown cylinder r 0.19, 0.2 high, brim disc r 0.24, 0.012 thick at its bottom, a dark band | see timing | brown #7a5030 |
| cap | `cap` | one `solidProp`: crown r 0.16, 0.13 high, rounded top if you like, a peak (visor) 0.12 long at the front | see timing | red #d03040 |
| the woman | `gal` (ADULT, `actor('gal', 0.9 * u)`) | | feet at x 0.78, z 0, facing the learner | |

- A hat's position below is the bottom-middle of its crown. Her head's middle is at about (0.80, 0.78, −0.06) and its top
  at y 0.93; check with `measure`.
- Her arms are short: her hand reaches up to about y 0.83 only, so she can't lift a hat over her head. She **flips**
  each hat onto her head instead: a quick arc through the air. While a hat flies (only then), set
  `hat.userData.flies = true`; set it back to false when it lands.
- She uses her left hand (on the learner's right, toward the stand). Hold a hat with `grip` on the brim's edge
  (palm against the brim, r 0.012u), never inside it.

## Timing (loop 8 s; nothing moves while the strokes draw)

- 0 to 1.0: `Idle`. The big hat on the top tier (crown bottom at x 1.25, y 0.78, z −0.06), the cap on the low tier
  (x 1.25, y 0.45, z −0.06).
- 1.0 to 1.3: her left hand takes the big hat's brim at its near edge, about (0.98, 0.80, −0.06).
- 1.3 to 1.8: she flips it onto her head: it arcs through (1.02, 1.12, −0.06) and lands with its crown bottom at
  (0.80, 0.66, −0.06), so it covers her eyes. Her hand drops back to her side.
- 1.9 to 3.0: she shakes her head (`a.shake`); the hat wobbles with her head. A small sweat drop if you like.
- 3.1 to 3.4: her left hand lifts the hat by its brim at about (1.07, 0.67, −0.06), up to y 0.74.
- 3.4 to 4.0: she tosses it back: it arcs through (1.05, 1.10, −0.06) and lands on the top tier again.
- 4.3 to 4.6: her left hand takes the cap's near edge, about (1.03, 0.48, −0.06).
- 4.6 to 5.2: she flips it up: it arcs through (0.95, 1.10, −0.06) and lands on top of her head (crown bottom at about
  y 0.80, follow her head with `onHead` from then on), its peak toward the learner.
- 5.4 to 6.4: she spins once round (turn 0 to 360°), the cap staying on her head.
- 6.4 to 7.2: two or three `heart`s pop up beside her head (`pop`); she smiles at the learner.
- 7.2 to 7.5: the cap shrinks away on her head; 7.5 to 8.0 it pops back in on the low tier, so the loop ends where it
  started.

## Goals and checks

- After every change: `check_goals` with card 8a66, goals `plans/qwen/goals/017-tamesu-hats.json`, loop 8.
- Before you change a number to fix a FAIL, `measure` the things it names at a failing moment (for example
  `what: "gal left hand,big hat"`).
- Expected while a hat is on her head: a fault that her head passes into the hat (a hat is a solid shape). The goals
  only check "nothing passes through her" when no hat is on her head.
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-try-hats$"`. Then one full inspect run and look at it:
  `node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hats.json --loop 8 --times 0.5,2.5,5.3,6.8
  --out plans/qwen/renders/017-tamesu-hats`. Then the orbit render:
  `node scripts/orbit.mjs 8a66 --times 2.5,5.3,6.8 --out plans/qwen/renders/017-tamesu-hats.jpg`. Ask yourself: would
  a child see a woman trying on hats until one fits?

## Commit

`試: a woman tries on hats until one fits (plan 017)`, then the report as the README says. Paste the last Goals lines,
and add one line per round: what you changed, and the N of M PASS you got.
