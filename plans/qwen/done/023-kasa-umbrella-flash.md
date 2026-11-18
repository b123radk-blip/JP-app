# Report: 023-kasa-umbrella-flash.md

Card w1301940 (傘 かさ), new scene `q-umbrella`, loop 8 s.

## Goals: 9 of 9 PASS

(last `node scripts/inspect.mjs w1301940 --goals plans/qwen/goals/023-kasa-umbrella-flash.json --loop 8 --times 0.4,1.4,3.5,7.6 --out plans/qwen/renders/021-kasa-umbrella`)

```
  PASS her right hand holds the umbrella's handle at first (t+0 to t+1): 4 moments, e.g. t+0: 0.03u apart (needs ≤ 0.04)
  PASS her right hand holds the handle while it is up (t+1.8 to t+7.5): 12 moments, e.g. t+2: 0.01u apart (needs ≤ 0.04)
  PASS the open canopy is just above her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0.06u apart (needs ≤ 0.25)
  PASS the open canopy covers her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0.06u apart (needs ≤ 0.2)
  PASS nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it): 19 moments, e.g. t+0: nothing passes into it
  PASS the learner sees her: 19 moments, e.g. t+0: 100% visible (needs ≥ 75)
  PASS the learner sees the kanji: 19 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the open umbrella shows big (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: shows 57% as big as the kanji (needs ≥ 25)
  PASS rain falls (t+0.6 to t+6.4): 12 moments, e.g. t+1: 1 of 1 rain within 1.5u of gal2 (needs ≥ 1)
```

## What I changed

- `src/effects/vignettes/q-umbrella.js`: the stub replaced by the scene (girl `gal2`, one `umbrella` group parented to
  her with three named solidProps `handle` / `shaft` / `canopy`, a `rain` and a `splash` `many()` pool of 60 each, all
  frames pure functions of `t`; the beats and the loop-back are in the file's header comment).
- `src/effects/vcat-qw.js`: cost `pdc('gal2') + 6` → `pdc('gal2') + 5` (handle, shaft, canopy, rain, splash = 5 draw
  calls; description and models unchanged).

## Rounds

1. First build (girl, umbrella group, `grip('R', the hook's left tube point, toward its own +x, r = tube)`, rain and
   splash) — **8 of 9 PASS**: `her right hand holds the umbrella's handle at first` FAIL, 0.06u apart.
2. `measure` at t+0.5 and t+3: in the down pose the wrist bone sat 0.05u under and 0.03u behind the handle's box
   (handle centre [0.44, 0.54], right hand [0.48, 0.45]), because facing the palm along the hook twists the forearm so
   the fist hangs below the tube.
3. `try_value`: grip the **underside of the hook's bowl** (palm under it, `toward` = the umbrella's own −y, so the fist
   sits on the shaft's axis above the handle) and raise the up-pose hand 0.60 → 0.64 — **9 of 9 PASS, 0 faults**. Kept.
4. Rain shape: the plan's `DROP(u)` stretched 1.5× in y, and the shield hand retargeted from `who.local(0.13, 1.05, 0.08)`
   (measured at [0.95, 0.74]: out to her side, not over her head) to `who.at('over', V3, 0.06, −0.04, 0.05)` —
   **9 of 9 PASS**, and the peak now measures [0.69, 0.80] just beside the top of her head.
5. The shield held until 1.15-1.8 instead of 1.0-1.7, and the canopy's `solidProp` glow 0.5 → 0.3 (a white hotspot on its
   underside in the low close-up) — **9 of 9 PASS**.
6. `HOLD_DOWN` 0.51 → 0.42 to follow the plan's hand at y 0.40 — **9 of 9 PASS**, but the inspect listing showed
   `shaft ... bottom -0.08`: the closed umbrella's tip buried 0.08u under the ground line (it is carried, so no fault is
   reported). Put back to 0.51 → shaft bottom 0.01, tip just off the floor — **9 of 9 PASS, 0 faults**.

## Where I left the plan, and why

- **Down-pose hand**: plan (0.42, 0.40). The shaft is 0.62u and points down at 2.5 rad, so with the hand at 0.40 its far
  end is 0.22u under the ground; 0.51 is the lowest hand height that keeps the tip about 0.01u above the ground line.
- **Up-pose hand**: plan (0.42, 0.58) measured the open canopy's rim 0.02u above her hair (resting on it). 0.64 gives the
  plan's ~0.09 clearance (measured 0.06u) and keeps the shaft beside her head, not through it.
- **The rain** is `many(DROP(u), 60)` as the plan says, but each drop's geometry is stretched 1.5× in y: unstretched they
  read as floating bubbles in the learner's view.
- **The grip**: the palm presses the hook's tube (r = 0.012u, nothing inside the fist) on the bowl's underside rather than
  on its inside face; the inside-face version left the wrist 0.06u from the handle, over the goal's 0.04u.
- **"her left hand just above her forehead"**: her shoulder sits 0.39u below the crown and her arm is 0.28u, so the IK
  cannot reach over the head; the hand lands 0.12u below the crown, at her hairline. The hunch (Abdomen / Torso / Head
  turns) carries the read.
- **The closed umbrella leans** 2.5 rad (down and toward the kanji) instead of hanging straight down; straight down needs
  the hand at y 0.64, which would sink the canopy's rim or lift her arm.

## Checks

```
node --check src/effects/vignettes/q-umbrella.js && node --check src/effects/vcat-qw.js   (no output)
node scripts/check-piece-costs.mjs vignette "^q-umbrella$"
701 recipes, 0 cost mismatches
npm test
ℹ tests 64 ... ℹ pass 63 ℹ fail 0 ℹ skipped 1
content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```

Not run: `npm run e2e` (the plan does not ask for it; the cost check covers this card's draw calls).

## What I see in the render (`plans/qwen/renders/021-kasa-umbrella/`)

- front t+0.4: a girl with a folded red umbrella resting tip-down on the floor, her right fist round the dark J hook —
  no rain yet; nothing overlaps the kanji.
- right t+0.4: the folded canopy hangs beside her leg clear of it; the hook reads against her palm.
- learner t+0.4: the kanji 傘 on the left, the girl and her closed umbrella to its right, the meaning label clear below
  the kanji. She shows 161% of the kanji's size, 100% visible.
- front t+3.5: cyan drops falling all around her, the red canopy open over her head tilted slightly in, white splashes
  sitting on the canopy's top, her right fist on the handle at chest height. A child sees rain + umbrella + dry girl.
- right t+3.5: the shaft passes in front of her shoulder and beside her head; the canopy's rim is clearly above her hair;
  splashes on the canopy's crown.
- learner t+3.5: the umbrella reads as an umbrella (the open canopy 57% of the kanji's size), rain on both sides of her,
  her face lit under it.
- t+1.4 (sheet tiles 4-6): she hunches with her left forearm up at her hairline while the closed umbrella swings up.
- t+7.6 (tiles 10-12): the canopy has folded back into the narrow cone and she is lowering it; at 8.0 it is where it
  started, so the loop closes.
- `held.jpg` (handle from front / left / right at t+0.4): the hook curls over the top of the fist with the tube against
  the palm, no part of the fist wrapped through it; the folded canopy and shaft are hers (the inspector lists all three
  as carried by gal2).

## Inspection

```
## The whole loop, every 0.5 s from t+0 to t+7.5 (numbers only; the T ids differ from moment to moment)

  no measured faults at any moment
```

No POSSIBLE FAULTS lines, no fault close-ups, nothing hidden, nothing under the meaning label. One thing the numbers do
not check: the umbrella is a child of the girl (so `carried`), which means the inspector never asks what the shaft and
canopy stand on — I checked it by hand from the listing (shaft bottom 0.01, closed canopy bottom −0.01, open canopy rim
0.06u above her head top 0.94).
