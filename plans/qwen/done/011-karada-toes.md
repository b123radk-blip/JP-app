# Report: 011-karada-toes

## What I changed

`src/effects/vignettes/q-feel.js`, `exercise()` only (nothing else touched):

1. **Last row of `PARTS`** (`あし`): `bow 1.6 -> 2.3`, hand target `p.local(0.07x, 0.02, 0.17) -> p.local(0.09x, 0.03, 0)` (aimed at the feet, probed to be at ~ (0.575, 0.01, −0.01)u for the right), `out 0.3 -> 0.2`, `down 0.4 -> 1`.
2. **Last touch's hold** in `step(t)`: `bump(v, 0.4 + 1.5*i, 1.3) -> bump(v, 0.4 + 1.5*i, i === 3 ? 1.9 : 1.3)`. Necessary, not cosmetic: with the original 1.3 s bump the amount k is back at 0 from t+6.2, so between t+6.0 and t+6.25 the hands are already returning to rest and the hand goals (which must hold over t+5.75–6.25) could not pass for any pose. Affects only the fourth move (it ends at t+6.8, before the 7.5 s loop).
3. **Posing lines for that last move only** (inside an `if (i === 3)` after `p.bow`):
   - child's squat: `p.turn('UpperLegR/L', 0.7k)`, `p.turn('LowerLegR/L', −1.4k)`;
   - `p.group.position.y += 0.01 * u * k` (the bend drops the feet ~0.01u, so the group is raised, not lowered — my first 0.11u lower attempt sunk him 0.12u);
   - `p.turn('Head', −0.6 * k)` — at bow 2.3 the head tips ~152° from vertical (face into the grass); this lifts it so he looks down at his toes instead of into the grass.
   The first three moves are byte-for-byte unchanged.

Because the rests goal still fails, I **kept the label あし** (no rename to つまさき), per the plan.

## Where I left the plan, and why

- **"he stands on the grass all loop" FAILs**: at the bottom of the bend (t+5.5–6.25) the guy's lowest point is 0.04u below the grass top (SUNK gap −0.04u, worst at t+5.5). That point is the front of his hair at the deepest bow (the fist, shown by its glow, is above the grass in the pictures). Lifting it further (deeper head tilt or raising the group) would raise the hands, which are exactly at the 0.1u goal limit; I used all six rounds here. Numbers below.
- Everything else: both hand goals and the visibility goal PASS; the toe touch reads clearly from the side (see orbit).

## Inspection rounds

Quick runs (`--scan 0.25 --quick --goals ...`), the two toe numbers are right-hand→right-foot / left-hand→left-foot (worst in the t+5.75–6.25 window):

1. Baseline, no changes: **0.25 / 0.25u**; no rests fault (hands at the knees, as the plan measured).
2. bow 2.0, squat (0.7/−1.4), group lowered 0.11u, target (0.05x, 0, 0.05), last hold 1.9 s: **0.15 / 0.16u**; SUNK 0.12u (lowered too far).
3. bow 2.3, group raised 0.01u instead: **0.14 / 0.15u**; SUNK 0.05u. (A scratch probe goals file in `.cache/probe-goals.json` located the right foot at ≈ (0.575, 0.01, −0.01)u, feet 0.14u apart.)
4. target (0.09x, 0.03, 0) aimed at the feet: **0.10 / 0.10u — both hand goals PASS**; SUNK 0.05u (the head had tipped into the grass).
5. `p.turn('Head', −0.6k)` added: **0.10 / 0.10u — hand goals still PASS**; SUNK 0.04u (front of the hair at the deepest bow).

## Checks (paste the real last lines of each)

- `node --check src/effects/vignettes/q-feel.js` — no output.
- `npm test` —
  ```
  content check ok: 835 cards (262 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 835 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-exercise$"` — `675 recipes, 0 cost mismatches`
- `node scripts/orbit.mjs 4f53 --times 1,6 --out plans/qwen/renders/011-karada-toes.jpg` — `plans/qwen/renders/011-karada-toes.jpg (looking at 0.30,0.04,-0.00)`
- `node scripts/inspect.mjs 4f53 --goals plans/qwen/goals/011-karada-toes.json --scan 0.25 --times 1,3,4.5,6 --out plans/qwen/renders/011-karada-toes` (last run) —
  ```
  ## Goals: 3 of 4 PASS
    PASS right hand at the right foot (the toe touch) (t+5.75 to t+6.25): 3 moments, e.g. t+5.75: 0.1u apart (needs ≤ 0.1)
    PASS left hand at the left foot (the toe touch) (t+5.75 to t+6.25): 3 moments, e.g. t+5.75: 0.1u apart (needs ≤ 0.1)
    FAIL he stands on the grass all loop (feet not sunk, not floating): fails at t+5.5 to t+6.25 of 28 moments; t+5.5: guy: SUNK INTO T1 mesh green #6ab04c (gap -0.04u)
    PASS the learner sees him all loop: 28 moments, e.g. t+0: 99% visible (needs ≥ 85)
  ```

## What I see in the render (each of the six views, one line each, and any fault left)

1. **Front** — t+1: standing, both hands up on the head (あたま). t+6: the forward-bow silhouette, head at grass level, あし label.
2. **Right side** — t+1: hands on the head. t+6: the readable toe-touch profile: back bent, both arms straight down, fists at the glowing toes, head turned back to face them. This is the view it works from.
3. **Top** — t+1: head-and-shoulders lump on the grass. t+6: folded forward into a low V over the grass patch.
4. **Back-left** — t+1: standing with hands raised. t+6: bowing away toward the grass, arms reaching down between his legs.
5. **Front-right** — t+1: hands on the head. t+6: the toe touch seen obliquely, fists at the glow on the toes.
6. **Low front** — t+1: full standing figure, hands raised. t+6: mostly just the head at grass level; the body is folded behind it (expected at a deep bow).

Fault left: nothing floating or passing through anything; the only measured fault is the 0.04u sink of his hairline at the bottom of the bend (t+5.5–6.25), which the rests goal still fails on.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)

```
POSSIBLE FAULTS (each has close-ups on the faults sheet, at its worst moment):
  - T2 model guy: SUNK INTO T1 mesh green #6ab04c (gap -0.04u)
```

- **SUNK 0.04u (t+5.5–6.25)** — left, what stopped me: at bow 2.3 + squat his front hair (and possibly the shoe tips) sit ~0.04u below the grass top at the deepest moment. Lifting it more raises the hands, which sit exactly at the goal's 0.1u limit (0.10u worst in the window), so the two goals trade against each other here. Six rounds used; the label stays あし. A small fix for Opus to consider: tilt the head a little more (−0.8 instead of −0.6) and/or aim the hands 0.02u lower to recover the margin.
