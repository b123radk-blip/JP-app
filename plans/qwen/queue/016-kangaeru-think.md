# Plan 016: 考 "consider; think over" (card 8003), new scene `q-ponder`

Card: 8003
Inspect: --loop 7.5

A new card. This plan is in words, with **goals** in `plans/qwen/goals/016-kangaeru-think.json`. Read
`plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`, `measure`, `try_value`). You write the code; the
plan gives every number. The layout is already checked with the real grandpa
(`plans/qwen/layouts/016-kangaeru-think.json`; what the learner sees: `plans/qwen/renders/016-plan-seat.jpg`). Keep its
numbers.

**The idea a child should get:** an old man sits on a cushion in front of a shogi board, his hand on his chin, thinking
hard. A thought bubble with a big "?" floats over him. The "?" turns into a lightbulb, his finger goes up (he has it!),
he leans in and moves one piece, and nods, pleased. He thought it over.

## Code

- `src/effects/vignettes/q-ponder.js` is a stub: replace it with the scene `q-ponder`, exported as `SCENES`. Start the
  file with a comment describing the scene beat by beat. It is already registered (`qwen-batch.js`) and the card
  already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-ponder': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Examples to copy patterns from: `src/effects/vignettes/q-pour.js` (props, `pop`, `burst`, `label`) and `seatAt` in
  `src/effects/vignettes/q-ride.js` if you need to place his hips exactly.

## The layout (lengths in u: x from the kanji's right edge, y up, z toward the learner)

| Thing | Name (`mesh.name`) | Size w × h × d | Where | Colour |
|---|---|---|---|---|
| tatami floor | `tatami` | 0.95 × 0.02 × 0.6 | top at y 0, centre x 0.93, z 0 | straw #c8c070 |
| cushion | `cushion` | 0.3 × 0.03 × 0.3 | bottom-middle at x 0.95, y 0, z −0.23 | red #a03040 |
| stand | `stand` | 0.3 × 0.12 × 0.1 | bottom-middle at x 0.95, y 0, z 0.08 | brown #8a5a30 |
| shogi board | `shogi board` | 0.36 × 0.04 × 0.3 | bottom-middle at x 0.95, y 0.12, z 0.08, **tilted `rotation.x = 35°`** (0.611 rad) so its top faces the learner | wood #e0b060 |
| the moving piece | `piece` | 0.06 × 0.02 × 0.065 | on the board, see below | pale #f8e0b0 |
| thought dots | `dot1`, `dot2` | spheres r 0.025 and 0.035 | centres (1.10, 0.825, −0.25) and (1.16, 0.895, −0.25) | white |
| thought cloud | `bubble` | 3 or 4 white spheres, the main one r 0.15 | main centre (1.27, 0.95, −0.25) | white #ffffff |

- Make the board a group at its bottom-middle, tilted 35°. In it: one `solidProp` with the board, a 5 × 5 grid of thin
  dark lines on its top (0.004 high) and five or six static pieces (same size as the moving one, lying on the top, kept
  out of the moving piece's row). Name that mesh `shogi board`.
- **The moving piece is a child of the board group**, so it lies on the tilted top by itself. In the board's own
  coordinates (x along the board, y up from its bottom, z along its depth) it starts at **(−0.06, 0.05, −0.10)** and
  ends at **(0.05, 0.05, −0.10)**. In the world that is (0.89, 0.21, 0.02) to (1.00, 0.21, 0.02).
- **The grandpa** `grandpa`, ADULT (`actor('grandpa', 0.9 * u)`): group at x 0.95, y 0.03 (on the cushion), z −0.05,
  facing the learner (turn 0). He sits the whole time: every frame `a.pose('SitDown', 5, false)` (a time past the
  clip's end holds its last, seated pose). That pose sits his hips about 0.18u behind the group's origin, at about
  z −0.23, on the cushion; check with `measure`.
- Resting hands: on his thighs, the right hand at (0.87, 0.20, −0.14), the left at (1.03, 0.20, −0.14).
- The "?" is `label(u, '?', '#3060c0')` about 0.14u tall, in front of the cloud's middle (z −0.09). The lightbulb: a
  glowing yellow sphere r 0.06 on a grey cylinder base (r 0.03, 0.04 high), same spot, with a small yellow `burst`
  behind it.

## Timing (loop 7.5 s; nothing moves while the strokes draw)

- 0 to 0.6: he sits looking at the board, hands on his thighs.
- 0.6 to 1.2: his right hand goes to his chin, at (0.93, 0.53, −0.17); his head tilts a little to one side
  (`a.turn('Head', 0, 0, 0.15)`).
- 1.2 to 3.6: he thinks: the hand stays at his chin, his head rocks slowly side to side. `dot1` pops in at 1.3, `dot2`
  at 1.6, the cloud with the "?" at 1.9 (`pop`).
- 3.6 to 4.0: the "?" pops out and the lightbulb pops in, with the burst. From 3.7 to 4.2 his right hand goes up beside
  his head, finger up, at (0.90, 0.66, −0.20).
- 4.3 to 4.6: he leans in (`bow`, k up to 1.0) and his right hand reaches the piece.
- 4.7 to 5.2: the piece slides to its new square with his hand on it (`grip` with the piece, r about 0.02u, palm from
  above).
- 5.25 to 5.5: he lets go and sits up (bow back to 0), right hand back to his thigh.
- 5.5 to 6.2: he nods, pleased (`a.nod(k, t)`).
- 6.0 to 6.5: the cloud, dots and bulb shrink away.
- 6.6 to 6.9: the piece shrinks away on its new square; 6.9 to 7.3 it pops back in on its first square, so the loop
  ends where it started.

## Goals and checks

- After every change: `check_goals` with card 8003, goals `plans/qwen/goals/016-kangaeru-think.json`, loop 7.5.
- Before you change a number to fix a FAIL, `measure` the things it names at a failing moment (for example
  `what: "grandpa right hand,piece"`).
- Expected fault you can ignore: `shogi board SUNK INTO stand` (the tilted board's lower edge dips into its stand).
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-ponder$"`. Then one full inspect run and look at it:
  `node scripts/inspect.mjs 8003 --goals plans/qwen/goals/016-kangaeru-think.json --loop 7.5 --times 2.5,3.9,4.9,5.8
  --out plans/qwen/renders/016-kangaeru-think`. Then the orbit render:
  `node scripts/orbit.mjs 8003 --times 2.5,3.9,4.9 --out plans/qwen/renders/016-kangaeru-think.jpg`. Ask yourself:
  would a child see an old man thinking hard about his next move?

## Commit

`考: grandpa thinks over his shogi move, gets an idea and plays it (plan 016)`, then the report as the README says.
Paste the last Goals lines, and add one line per round: what you changed, and the N of M PASS you got.
