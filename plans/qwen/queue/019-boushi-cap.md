# Plan 019: 帽子 "hat; cap" (card w1519170), new scene `q-hat-wind`

Card: w1519170
Inspect: --loop 8

A new card, and a test of **precise fitting**: a cap must sit exactly on a boy's head, and a man's hands must hold it
by its edges, never inside it. This plan is in words, with **goals** in `plans/qwen/goals/019-boushi-cap.json`. Read
`plans/qwen/CHEATSHEET.md` first (above all "Anything worn on a head") and use your tools (`check_goals`, `measure`,
`try_value`). You write the code; the plan gives the numbers. The layout is already checked with the real people
(`plans/qwen/layouts/019-boushi-cap.json`; there the cap is a plain cylinder and the hands reach for points, so
its hand faults mean nothing; yours must have none).

**The idea a child should get:** a windy day. A little boy in a red cap stands in front of his dad. A gust blows the
cap off his head! Dad catches it, and with both hands puts it back on the boy's head and pulls it snug. The boy
bounces, happy. The thing everyone cares about is the cap: a hat.

## Code

- `src/effects/vignettes/q-hat-wind.js` is a stub: replace it with the scene `q-hat-wind`, exported as `SCENES`. Start
  the file with a comment describing the scene beat by beat. It is already registered (`qwen-batch.js`) and the card
  already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-hat-wind': VM(...)`). Keep the description and models; set
  the cost so the cost check passes.
- Examples: `src/effects/vignettes/q-try-hats.js` (a cap built from the head's measured size, `wear`, `grip`, a hat
  that flies; read it all first), `src/effects/vignettes/q-pour.js` (`grip` and `hold`).

## The people and the cap (lengths in u: x from the kanji's right edge, y up, z toward the learner)

| Thing | Name | Where |
|---|---|---|
| the boy | `guy2` at `KID` height: `actor('guy2', KID * u)` (`KID` from `q-common.js`) | feet at x 0.45, z 0.15, facing the learner |
| his dad | `guy` at `ADULT` height | feet at x 0.48, z −0.07 (just behind the boy), facing the learner |
| the cap | `cap` (`cap.name = 'cap'`), red #d03040, one `solidProp` | on the boy's head, see below |

- **Size the cap from the boy's head, never by eye:** `const ku = KID * u, rc = boy.headR(0.11);` crown radius
  `(rc + 0.01) * ku`, crown height `0.07 * ku`, a `G.dome` top `0.1 * ku` high, everything a touch deeper than wide
  (`.scale(1, 1, 1.08)`), and a peak (visor) box `1.1 × 0.02 × 0.6` crown radii (heights in `ku`) at the front, its
  middle `1.33` crown radii forward and `0.03 * ku` up. This is the cap of `q-try-hats.js` sized for the boy.
- **Put it on with `wear`:** while the cap is on his head, every frame: `boy.wear(onCap, group, rc + 0.01)` on a helper
  `THREE.Object3D` (`onCap`, added to the group), then copy its position and quaternion to the cap. That keeps it on his
  head when he bounces or turns his head. Its peak points toward the learner.
- The dad's arms are short (an arm is 0.27u; a hand reaches up to about y 0.8). Everything he does below is within his
  reach from where he stands; don't move the people.

## Timing (loop 8 s; nothing moves while the strokes draw)

- 0 to 1.0: both `Idle`, the cap worn on the boy's head.
- 1.0 to 1.6: **the gust.** Three white wind streaks (thin white boxes or flat bars about 0.5 × 0.015, named `gust`)
  sweep from left to right across the scene at heights 0.45, 0.65 and 0.85, quickly, gone by 1.6. The kanji leans
  away from the wind and back: `stage.glyph.rotation.z = -0.08 * bump(v, 1.3, 0.6)` (keep the recipe's motion none).
- 1.0 to 2.2: **the cap blows off**: it lifts off his head, flies up and right and toward the learner, through about
  (0.68, 0.84, 0.30) at 1.35 and (0.84, 0.72, 0.28) at 1.75, tumbling (one turn round its own x axis), then drops
  toward dad's left hand at (0.70, 0.56, 0.14) by 2.2, landing upright. `cap.userData.flies = true` only while it
  flies (1.0 to 2.2). The boy looks up after it (turn his head up, 1.1 to 2.0, and back) and throws both hands up in
  surprise (`handTo` both hands about 0.1 above his shoulders, 1.2 to 1.9).
- 1.8 to 2.2: dad's left hand (on the learner's right) reaches out and **catches the cap at its right edge**: `grip('L',
  ...)` with the palm against the crown's side (palm facing the cap: `toward` points from his hand to the cap), r 0.012u.
  From 2.2 on the cap moves **with his hand**: each frame grip first, then place the cap from the hand
  (`hold`, or the grip point plus the cap's radius), never with the fist inside it.
- 2.4 to 3.5: he lifts it over the boy's head: the cap ends at about (0.50, 0.64, 0.09), upright, peak toward the
  learner, his left hand still on its right side.
- 3.4 to 3.6: his right hand comes to the cap's left side: `grip('R', ...)`, palm against the crown, r 0.012u. Both
  hands now hold it by its two sides, at the crown's middle height.
- 3.6 to 4.2: **he sets it on the boy's head**, both hands going down with it: the cap ends exactly where `wear` puts
  it (blend the cap from its held place to the worn place, and keep both grips on the cap's sides as it goes). He
  bends a little (`bow` up to 0.3) to reach.
- 4.2 to 4.6: he tugs it snug: the cap goes down 0.01 heights (`wear`'s `sink` from 0 to 0.01) and back to 0, both
  hands with it.
- 4.6 to 5.0: both his hands let go and drop back to his sides; he straightens up.
- 5.0 to 6.4: the boy bounces happily, twice (feet leave the floor by 0.06u, a smooth up and down), the cap staying on
  (it is worn: `wear` every frame). Dad nods (`nod`).
- 6.4 to 8.0: both `Idle`, the cap on the boy's head, so the loop ends where it started.

## Goals and checks

- After every change: `check_goals` with card w1519170, goals `plans/qwen/goals/019-boushi-cap.json`, loop 8.
- The fit goals measure the cap on the boy's head: how much of his head and hair it covers, how far hair sticks out,
  how far off-centre it sits. If one FAILs, fix how you call `wear` or the cap's size; never shrink the head.
- "Nothing passes through dad" checks his hands against the cap: a hand must rest against its side, not sink into it.
  If it FAILs, `measure` the hand and the cap at the failing moment (`what: "guy left hand,cap"`) and move the grip
  point out from the crown (radius + r), or turn the palm.
- Dad's hands may touch the boy's hair while they set the cap (3.4 to 4.7); the goals don't check the boy then.
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-hat-wind$"`. Then one full inspect run and look at it, above all
  `held.jpg` (the cap close up from three sides): `node scripts/inspect.mjs w1519170 --goals
  plans/qwen/goals/019-boushi-cap.json --loop 8 --times 0.5,1.5,2.8,4.0,5.5 --out plans/qwen/renders/019-boushi-cap`.
  Then the orbit render: `node scripts/orbit.mjs w1519170 --times 1.5,2.8,4.0 --out
  plans/qwen/renders/019-boushi-cap.jpg`. Ask yourself: would a child see a cap blow off and get put back on?

## Commit

`帽子: dad puts the boy's blown-off cap back on (plan 019)`, then the report as the README says. Paste the last Goals
lines, and add one line per round: what you changed, and the N of M PASS you got.
