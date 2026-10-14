# How Opus writes a Haiku plan (checked before anyone builds)

Most redo rounds in batch 1 came from plan numbers that could not work with the real models (a 0.16u gap for a man
0.31u deep, a door lower than the girl, a hips goal at a height the hips never reach, feet on the ground while seated)
and from scenes whose key thing was small or seen edge-on from the learner's seat (stones, sorter holes, cake tops).
So every plan's layout is measured first:

1. **Write the layout** as `plans/haiku/layouts/<plan>.json`: a blockout scene (`src/effects/vignettes/blockout.js`)
   with the plan's props as boxes, cylinders or balls at their real sizes and positions, the real models with their
   moves (`keys`), clips (`clips`) and hand reaches (`hands`). The key moments only; no labels, stars or bubbles.
2. **Write the goals** (`plans/haiku/goals/<plan>.json`), always including, for the thing that carries the meaning:
   - `big`: it shows at least N% as big as the kanji (about 8 for a held prop, 15+ for the main object);
   - `faces`: when its top matters (a pond, a table top, a box with holes), at least 20° toward the learner;
   - `visible` on each person (85) and on the key prop (70).
3. **Run** `node scripts/plan-check.mjs <card> plans/haiku/layouts/<plan>.json --goals plans/haiku/goals/<plan>.json
   --times <key moments>` and read the whole report: the models' real sizes (facing and sideways), hips and shoulder
   heights, arm reach and clip lifts; the goals (BUILD lines are checked only once built); the faults; `seat.jpg`.
4. **Change the layout or the goals until every goal it can check passes** and `seat.jpg` reads at a glance. A goal
   the layout fails is a plan mistake: never hand it to a builder.
5. Copy the checked numbers into the plan's words, and name the layout file in the plan, so the builder starts from
   numbers that are known to work.

Layouts from batch 1, as examples: `h8-hosoi-v1.json` (the gap too narrow: the man passes into both walls),
`h4-kimeru-v1.json` (the girl hidden behind the table, the cakes seen from below) and `h4-kimeru-v2.json` (lower table,
bigger cakes, the girl beside it: everything passes but the cake tops at 14°, so tilt them more).
