# Plan 003: 体 fixes after Opus's review of plan 002 (card 4f53, scene `q-exercise`)

Good work on 002: the code, checks and report were right. Opus rendered it closer
(`node scripts/orbit.mjs 4f53 --times 1.05,2.55,4.05,5.55 --dist 0.45 --at 0.36,0.22,0`) and found two poses that miss:

- **Shoulders (column 2):** the hands meet in front of the chest, near the middle, like clapping. They must rest ON TOP
  of each shoulder, one on each side, outside the neck, elbows out to the sides.
- **Toes (column 4):** the hands stop at the knees/shins. They must reach down to the feet, at the front of the shoes,
  just above the grass.

Also, the labels moved to fit the orbit frame. The orbit camera's framing is not the learner's view: a label above the
frame edge is not a fault. Keep the labels where they are now, but make them bigger.

## Changes, all in `src/effects/vignettes/q-feel.js`

1. In `PARTS`, the `かた` row: start from `p.local(0.17 * x, 0.64, -0.01, W)` with `out: 1.0, down: 0.9`.
2. In `PARTS`, the `つまさき` row: start from `bow: 1.0` and `p.local(0.07 * x, 0.02, 0.17, W)`.
3. The label height `0.13` in `names = PARTS.map(...)` becomes `0.17`.
4. Delete the `arms` helper (line 22, `const arms = ...`); nothing uses it now.

Change nothing else.

## Checks

The same as in the rules, and render with the close camera so the hands can be seen:

`node scripts/orbit.mjs 4f53 --times 1.05,2.55,4.05,5.55 --dist 0.45 --at 0.36,0.22,0 --out plans/qwen/renders/003-karada-fix.jpg`

Look at the **front** and **right side** rows, columns 2 and 4:
- column 2: each hand on top of its own shoulder (front: the two glow balls at the outer ends of the shoulders, wide
  apart, not in front of the chest; side: hands at the shoulder, not ahead of the body);
- column 4: hands at the shoe tips (front: the glow balls down by the feet; side: hands at the front of the feet, above
  the grass, not through it).

If either is still off, tune only the numbers in that row (x spread, height, z, `bow`, `out`/`down`): at most two more
tries. Write what you tried and what each render showed in the report.

Commit message: `体: hands on the shoulders and down to the toes (Qwen, plan 003)`
