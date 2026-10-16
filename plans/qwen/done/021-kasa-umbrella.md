# Report: 021-kasa-umbrella.md

## What I changed
- `src/effects/vignettes/q-umbrella.js` (replaced the stub): the scene `q-umbrella` — a girl (`gal2`, ADULT)
  holds a closed umbrella by its J-hook in her right hand (grip every frame, palm against the hook). Rain (60 drops,
  one `many(DROP(u))` draw call, each its own x/z/phase, a fall from 1.5 to the floor every 8/13 s) fades in at 0.5;
  she hunches with her left hand over her head (0.5-1.8) while the rain falls on her; she swings the umbrella up
  (1.0-1.8), the canopy springs open over her head (1.8-2.4, the shaft passing at x 0.46 at head height, clear of her),
  the rain bounces off the canopy in tiny splashes and she sways side to side (2.4-6.4); the rain fades out (6.4-6.9),
  the canopy closes (6.9-7.4) and she lowers it by her side (7.4-8.0), so the loop ends where it began.
- `src/effects/vcat-qw.js`: the `q-umbrella` cost from `pdc('gal2') + 6` to `pdc('gal2') + 4` (handle, shaft, canopy,
  rain = 4 draw calls on top of the model). Description and models unchanged.

## Where I left the plan, and why (or "Nowhere")
Two small number changes, both from inspect faults:
- The up pose's shaft bottom sits at x 0.40 instead of the plan's 0.42: at t+5 her swaying hair touched the shaft
  (`gal2 PASSES INTO shaft: 4 skin points near Head`). Moving it 0.02u out cleared it; the canopy still sits at
  (0.51, 1.12) over her head and all goals pass.
- Her happy sway is 0.03 rad instead of a bigger default (the plan says "small, slow"); with 0.045 the same hair
  fault appeared at t+5.
Everything else is as written: girl at x 0.62, down pose hand at (0.42, 0.40-0.46, ~0.03), up pose canopy middle at
about (0.51, 1.12), the closed canopy hugging the shaft (radius 0.12 of open, 2.5 times taller), drops over the open
canopy stopping at its top and splashing.

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/q-umbrella.js` and `node --check src/effects/vcat-qw.js`: no output.
- `npm test`:
  ```
  ℹ tests 64
  ℹ pass 63
  ℹ fail 0
  content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-umbrella$"`:
  ```
  701 recipes, 0 cost mismatches
  ```
- `node scripts/orbit.mjs w1301940 --out plans/qwen/renders/021-kasa-umbrella.jpg`:
  `plans/qwen/renders/021-kasa-umbrella.jpg (looking at 0.31,0.04,-0.02)`
- `node scripts/inspect.mjs w1301940 --goals plans/qwen/goals/021-kasa-umbrella.json --loop 8 --times 0.4,1.4,3.5,7.6
  --out plans/qwen/renders/021-kasa-umbrella` — the last Goals lines:
  ```
  ## Goals: 9 of 9 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

    PASS her right hand holds the umbrella's handle at first (t+0 to t+1): 4 moments, e.g. t+0: 0u apart (needs ≤ 0.04)
    PASS her right hand holds the handle while it is up (t+1.8 to t+7.5): 12 moments, e.g. t+2: 0.01u apart (needs ≤ 0.04)
    PASS the open canopy is just above her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0.04u apart (needs ≤ 0.25)
    PASS the open canopy covers her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0.04u apart (needs ≤ 0.2)
    PASS nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it): 19 moments, e.g. t+0: nothing passes into it
    PASS the learner sees her: 19 moments, e.g. t+0: 100% visible (needs ≥ 75)
    PASS the learner sees the kanji: 19 moments, e.g. t+0: 100% visible (needs ≥ 95)
    PASS the open umbrella shows big (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: shows 75% as big as the kanji (needs ≥ 25)
    PASS rain falls (t+0.6 to t+6.4): 12 moments, e.g. t+1: 1 of 1 rain within 1.5u of gal2 (needs ≥ 1)
  ```

Rounds (goal counts from `check_goals`, loop 8):
- Initial build: **6 of 9 PASS** — canopy was built but never positioned (it sat at the umbrella's local origin, at
  her hand): FAIL "canopy just above her head" (0.36u apart), FAIL "canopy covers her head" (0.36u), FAIL "nothing
  passes through her" (her arm/hand inside the closed canopy at t 0-1). Fix: `canopy.position.set(0, 0.62 * u, 0)`.
- After that: **8 of 9 PASS** — remaining FAIL "nothing passes through her" at t+5 (4 hair points inside the shaft
  while she sways).
- After moving the up-pivot x 0.42 -> 0.40 and easing the sway 0.045 -> 0.03 rad (tested with `try_value` first):
  **9 of 9 PASS**, whole-loop faults 3 -> 2.

## What I see in the render (each of the six views, one line each, and any fault left)
Orbit sheet `plans/qwen/renders/021-kasa-umbrella.jpg` (t+0.5 and t+1.5 each):
1. front: she stands by the kanji holding the closed umbrella down at her right side, red tip near the floor (t+0.5); at t+1.5 the rain is falling and she hunches with her hand over her forehead while the closed umbrella swings up.
2. right side: profile of both beats; the closed umbrella points down and the rain clearly falls on her head.
3. top: the closed umbrella seen from above is a red cone by her side; drops ring around her in the rain beat.
4. back-left: her back, the closed umbrella leaning down on the far side, rain at t+1.5.
5. low front: both beats from below; she reads as a girl in the rain, umbrella at her side then mid-swing.
6. front-right: same story at a shallower angle; no body or prop faults in any view (the only whole-loop lines are
   the shaft-through-canopy structure of the umbrella itself, see below).

The learner-seat views (overview tiles 3/6/9/12) read as the plan wants: rain -> hand over head -> red canopy open
over her head with drops bouncing off -> closed umbrella lowered by her side. A child would see rain, an umbrella
opening, and a girl staying dry.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (`--times 0.4,1.4,3.5,7.6`, loop 8):
- t+0.4: `T3 mesh shaft (dark brown #303030): SUNK INTO T4 mesh canopy (red #d03040) (gap -0.15u)` and
  `T4 mesh canopy (red #d03040): SUNK INTO T3 mesh shaft (dark brown #303030) (gap -0.1u)` — the closed umbrella:
  the shaft runs through the middle of the closed canopy, which is how an umbrella is built (the plan's one umbrella
  group, shaft at the canopy's centre). The close-ups (faults tiles 1-2) show a normal closed umbrella. Left as-is.
- t+1.4: `T3 mesh shaft (dark brown #303030): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.5u)` — she is
  mid-swing, the umbrella is in her raised hand in the air. Intended.
- t+3.5: `T4 mesh canopy (red #d03040): SUNK INTO T3 mesh shaft (dark brown #303030) (gap -0.13u)` — the open canopy:
  the shaft pokes through its centre (same structure as above). The close-up (faults tile 3) shows a correct open
  umbrella over her head. Left as-is.
- t+7.6: no measured faults.

Whole-loop scan (every 0.5 s): only the two shaft/canopy lines above repeat (`t+0 to t+1: shaft SUNK INTO canopy
(-0.15u)`; `t+0 to t+1, t+2 to t+7: canopy SUNK INTO shaft (-0.13u)`). No body passes into anything, the learner sees
her 100% and the kanji 100% at every moment.
