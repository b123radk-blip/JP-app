# Plan 011: 体 "body" (card 4f53), scene `q-exercise`: the toe touch, with goals

A plan in words, with **goals**: `plans/qwen/goals/011-karada-toes.json`. Read "Goals" in the README first. Up to
**six** inspection rounds. This card's last move was meant to be "toes" (head, shoulders, knees and toes), but the hands
stop at the knees: the person bows (`p.bow(1.6)`) and his arms are too short to reach lower, so the label was renamed
あし (legs). Your job is to make the hands really reach the feet.

## Where the code is

- `exercise()` and its `PARTS` table in `src/effects/vignettes/q-feel.js`. Change only the last row of `PARTS` (`あし`)
  and the lines in `step(t)` that pose the person, and only so that they affect that last move; the first three moves
  (あたま, かた, ひざ) must stay exactly as they are.
- The gesture kit: `src/effects/vignettes/model-kit.js`. `p.bow(k)`, `p.handTo(side, point, k, { out, down })`, and
  `p.turn(bone, ax, ay, az)` (turns one bone about the person's own axes; +ax tips forward). The bones you may turn:
  `Hips`, `Abdomen`, `Torso`, `UpperLegR`, `UpperLegL`, `LowerLegR`, `LowerLegL`. You may also move the person down
  (`p.group.position.y`) while he bends his knees, as long as his feet stay on the grass.
- Measured now (t+6, the lowest moment): his hands stop **0.21u above the ground, 0.2u from the feet**, at the knees.
  Bowing deeper alone does not help. Ideas to try, measure each: bend the knees (a squat: upper legs forward, lower
  legs back, the body lowered so the feet stay on the grass), a deeper bow from the hips, the hand targets lower and
  nearer the feet. A child touching their toes with bent knees is fine.

## Rounds

- Every round: `node scripts/inspect.mjs 4f53 --goals plans/qwen/goals/011-karada-toes.json --scan 0.25 --quick`
  (about 15 s). It measures every 0.25 s and prints PASS or FAIL for each goal with the numbers.
- When all four pass (or your rounds are used up): one full run without `--quick`, `--times 1,3,4.5,6`, with
  `--out plans/qwen/renders/011-karada-toes`, and the orbit render `node scripts/orbit.mjs 4f53 --times 1,6 --out
  plans/qwen/renders/011-karada-toes.jpg`. Look at the toe-touch pictures: does it read as touching the toes?
- If the goals all pass: rename the label `あし` back to `つまさき` (toes) in `PARTS`, in the scene's comment at the
  top of q-feel.js, and in the `'q-exercise'` catalog line in `src/effects/vignette-catalog.js` (also "legs" -> "toes"
  there). If they don't all pass, keep あし and say in the report what stopped you, with the numbers.

## Commit

`体: the hands reach the toes (Qwen, plan 011)` (or `体: toe touch tried, not reached (Qwen, plan 011)`), then the
report as the README says. In the report, add `## Inspection rounds`: one line per round with what you changed and the
two toe numbers it measured.
