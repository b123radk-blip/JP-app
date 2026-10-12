# Report: 002-karada

## What I changed

Exactly the two places the plan names:

1. `src/effects/vignettes/q-feel.js`: header comment lines 2-3 and the whole `// ---- 体 ----` block (the `PARTS`
   table + `exercise()`), verbatim from the plan except the label position (see below). The `SCENES` table is
   untouched.
2. `src/effects/vignette-catalog.js`: the `'q-exercise'` line, verbatim from the plan (`+ 6`, `who: 'guy'`).

Number fixes I made (the plan allows "the label position", at most two tries, re-render after each — I used both):

1. **Label y: `floor + 1.1 * u` → `floor + 0.95 * u`.** At 1.1u the label center sits at world y ≈ 1.736, which is
   *above* the top of the orbit frame in the front view (camera 0.6 m away, target at foot level, fov 50 → frame top
   ≈ 1.74) — I measured its NDC y at 1.03 in front, 1.27 in right side, 1.18 in front-right, 1.01 in back-left:
   clipped or fully out of frame in 4 of the 6 views. At 0.95u the label center is just above the top of the head
   (head top ≈ floor + 0.93u) and the label fits the frame in the front, front-right and low-front views.
2. **Label x: `x0 + 0.55 * u` → `x0 + 0.95 * u`.** After fix 1, the label in the front view landed directly behind
   the orbit sheet's per-tile header bar ("4f53 front t+1.05" spans the top ~19 px of the tile) and only a sliver
   showed. Moving it 0.4u further right (0.35u from the person's center) puts it clear of the header text, fully
   visible in the front view. It still sits to the right of the person, at/above head height, and covers neither the
   person nor the kanji.

## Where I left the plan, and why

- The two label-position numbers above (1.1u → 0.95u, 0.55u → 0.95u); everything else is the plan's code verbatim.
- The `arms` helper at the top of q-feel.js is now unused (only the old exercise called it). The plan says "nothing
  else in the file", so I left it in place for you to drop if you want.
- The catalog cost: the plan's `+ 6` is what the cost check builds — no change needed.

## Checks (paste the real last lines of each)

- `node --check src/effects/vignettes/q-feel.js` and `node --check src/effects/vignette-catalog.js`:
  (no output, both files)
- `npm test`:
  ```
  ℹ pass 63
  ℹ fail 0
  ℹ skipped 1
  content check ok: 835 cards (262 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 835 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-exercise$"`:
  ```
  675 recipes, 0 cost mismatches
  ```
- `node scripts/orbit.mjs 4f53 --times 1.05,2.55,4.05,5.55 --out plans/qwen/renders/002-karada.jpg`:
  ```
  plans/qwen/renders/002-karada.jpg (looking at 0.30,0.04,-0.00)
  ```

## What I see in the render (each of the six views, one line each, and any fault left)

Four columns per row: t+1.05 (head), t+2.55 (shoulders), t+4.05 (knees), t+5.55 (toes) — the midpoints of the
`bump(v, 0.4 + 1.5*i, 1.3)` beats, so in each column the hands are at full reach (k = 1).

- **front**: person stands on the round grass patch (feet exactly on its top; I measured feet y = 1.458 = grass
  top). Col 1: both hands at the sides of the head with the two yellow glow balls beside the ears, あたま label at
  the upper right. Col 2: hands on the shoulders, glow on both, かた label. Col 3: bent a little (bow 0.45), hands
  on the knees, ひざ label. Col 4: bent right down (bow 0.8), hands at the toes above the grass, not through it,
  つまさき label.
- **right side**: side view of the person on the grass; the col 3/4 forward bends read clearly from the side; the
  part label is above the top of the frame here (camera is 0.6 m at foot level) — see fault left.
- **top**: straight down onto the person's head and the green patch; in cols 3–4 the head dips (the bend); in col 3
  the yellow glow peeks out from under the bent torso (the hands at the knees), in col 4 it is hidden under the torso
  (hands at the toes); the label is edge-on (a thin line) — expected for a flat plane.
- **back-left**: person seen from behind on the patch, kanji glowing to the right; the cols 3–4 forward lean is
  visible; the label is not visible in this view (behind the tile's header bar / at the frame edge).
- **front-right**: label visible upper right in all four columns; col 1 hands at the head, col 4 deep bend to the
  toes; nothing passes through anything.
- **low front**: from below; all four poses read (head-touch, shoulder-touch, knee bend, toe bend), labels visible
  to the right of the head.

Faults left:

- In the orbit **right side** and **back-left** views the part-name label is not visible (top of frame / behind the
  orbit sheet's per-tile header bar). It is fully visible in front, front-right and low front, and in the actual
  learner's app view (I checked the `?preview=1` screenshots: label sits at the upper right of the person's head in
  all four poses, covering neither the person nor the kanji). This is a framing limit of the 0.6 m orbit camera
  looking at foot level, not a scene defect; I used both allowed tries on the label position.
- Nothing floats, sinks or passes through: feet on the grass top, hands never inside the head, toes' hands above the
  grass. The unused `arms` helper (see above) is the only leftover.
