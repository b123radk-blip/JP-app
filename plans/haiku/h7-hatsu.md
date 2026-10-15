# Plan h7: 発 "departure" (card 767a): a new scene `q-rocket-launch`

Plan in words (no code), with goals: `plans/haiku/goals/h7-hatsu.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** departure: a rocket stands on its launch pad, a countdown 3, 2, 1 pops over it, smoke bursts out and it lifts off into the sky while a boy cheers. A child sees "it set off".

## Code
- Scene module `src/effects/vignettes/h-launch.js` (already created and registered; replace its empty `SCENES` with your scene `q-rocket-launch`).
- Catalog: one `VM(...)` line for `q-rocket-launch` in `src/effects/vcat-hb.js`, models `['guy2']`, with the right cost.
- Card `content/cards/767a.json`: set `"effect"` to exactly `{"material": "metal", "backdrop": "sky:morning", "vignette": {"type": "q-rocket-launch"}}`.

## The scene (loop 7 s)
- Launch pad (`'pad'`): a grey disc, radius 0.2, 0.05 tall, on the ground at x 0.95, z -0.05.
- Rocket (`group.name = 'rocket'`): a white body (cylinder, radius 0.07, 0.45 tall), a red nose cone 0.12 tall, three
  red fins at the bottom, one round blue window; standing on the pad (about 0.6u tall in all).
- A boy (`guy2`, `KID`) at x 0.55, z 0.25, turned toward the rocket (and a little toward the learner).
- Timing: 0.5 to 2.0 the countdown: big numbers `'3'`, `'2'`, `'1'` (`textPlane`, white on a dark round label) pop one
  after another over the rocket at y 0.85, half a second each. 2.0 to 2.4 smoke puffs (`PUFF` with `many`, about 10)
  burst out round the pad and an orange flame flickers under the rocket. 2.4 to 5.0 the rocket rises, slowly at first
  and then faster, its top reaching y 1.15 by 4.5; a trail of smoke puffs stays along its path. 4.5 to 5.0 it shrinks
  and fades away at the top (gone into the sky). 3.0 to 4.4 the boy raises both arms and jumps once, cheering
  (`'わーい!'` bubble). 5.0 to 6.2 the smoke drifts and fades. 6.2 to 7 a new rocket grows up out of the pad (the loop
  starts again).

## Checks
Every inspect run with `--goals plans/haiku/goals/h7-hatsu.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 0.5,2.2,4.1`, and the orbit render with `--times 2.2,4.1`.

## Commit
`発: a rocket counts down and lifts off its pad while a boy cheers (Haiku, plan h7)`
