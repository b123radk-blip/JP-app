# Loop: 025-kasa-umbrella-flash.md

Model: flash (Qwen 3.8 Flash Next (gyro M quant, strata)): pi --provider strata --model strata --thinking xhigh; repair rounds --thinking xhigh.

Started 2026-11-18T07:23:54.139Z at 8d70415.

## Round 1: Qwen builds
pi (flash): timed out after 30.0 min.
Watcher's checks: npm test passed; ## Goals: 8 of 9 PASS
```
  PASS her right hand holds the umbrella's handle at first (t+0 to t+1): 3 moments, e.g. t+0: 0.01u apart (needs ≤ 0.04)
  PASS her right hand holds the handle while it is up (t+1.8 to t+7.5): 12 moments, e.g. t+2: 0u apart (needs ≤ 0.04)
  PASS the open canopy is just above her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0u apart (needs ≤ 0.25)
  PASS the open canopy covers her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0u apart (needs ≤ 0.2)
  FAIL nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it): fails at t+0 to t+7.5 of 16 moments; t+0: model gal2 PASSES INTO mesh handle (dark brown/dark brown #4a2a18/#5a3620) (its own: the hand is inside what it holds): 13 skin points inside it, near the bones FistR; t+1: model gal2 PASSES INTO mesh handle (dark brown/dark brown #4a2a18/#5a3620) (its own: the hand is inside what it holds): 6 skin points inside it, near the bones FistR; t+1.5: model gal2 PASSES INTO mesh handle (dark brown/dark brown #4a2a18/#5a3620) (its own: the hand is inside what it holds): 4 skin points inside it, near the bones FistR
  PASS the learner sees her: 16 moments, e.g. t+0: 100% visible (needs ≥ 75)
  PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the open umbrella shows big (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: shows 32% as big as the kanji (needs ≥ 25)
  PASS rain falls (t+0.6 to t+6.4): 11 moments, e.g. t+1: 1 of 1 rain within 1.5u of gal2 (needs ≥ 1)
```
## Round 2: Qwen fixes
pi (flash, --thinking xhigh): 0 after 12.4 min.
Watcher's checks: npm test passed; ## Goals: 9 of 9 PASS
```
  PASS her right hand holds the umbrella's handle at first (t+0 to t+1): 3 moments, e.g. t+0: 0u apart (needs ≤ 0.04)
  PASS her right hand holds the handle while it is up (t+1.8 to t+7.5): 12 moments, e.g. t+2: 0u apart (needs ≤ 0.04)
  PASS the open canopy is just above her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0u apart (needs ≤ 0.25)
  PASS the open canopy covers her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0u apart (needs ≤ 0.2)
  PASS nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it): 16 moments, e.g. t+0: nothing passes into it
  PASS the learner sees her: 16 moments, e.g. t+0: 100% visible (needs ≥ 75)
  PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the open umbrella shows big (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: shows 32% as big as the kanji (needs ≥ 25)
  PASS rain falls (t+0.6 to t+6.4): 11 moments, e.g. t+1: 1 of 1 rain within 1.5u of gal2 (needs ≥ 1)
```
Opus reviews (call 1 of 2)
Opus: fix (list-price estimate $0.70: on a subscription it is not billed per call); denied: Bash

> All 9 goals pass and nothing passes through her, but the scene doesn't read the way the plan wants. The rain is one diagonal string of drops instead of a shower. With the umbrella open, its front rim hangs over her eyes and her fist covers her chin, so you can't see a dry, smiling girl. Each splash on the canopy is a large blue cone that looks like a blue hat.
- F1 (src/effects/vignettes/q-umbrella.js, rnd() (line 34) and the xs/zs/ph loop (line 58)): rnd(i,k) multiplies i by the same 7919 for every k, so a drop's x, z and phase all come from the same fraction of i. All 90 drops therefore sit on one sawtooth line. In every render the rain is a single diagonal column of drops, mostly between the kanji and the girl (rain pool at t+1.4 is only 0.39u wide). It doesn't read as rain pouring on her. -> Make the three numbers independent, e.g. `const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };` (still pure). Keep x in 0.05 to 1.15 as the plan says (`X(0.05 + 1.1 * rnd(i, 1))`). Check in the overview that at t+1.4 the drops are spread over the whole width (several over her head) and not in one line.
- F2 (src/effects/vignettes/q-umbrella.js, umbrellaScene step(): HOLD (line 33) and umb.rotation.set (line 76)): Up pose (t+3.5, t+4.5 close-up from the front): the canopy leans 0.5 rad (29°) toward the learner, so its front rim drops to y 0.73, below her eyes (head top 0.93). Her eyes and forehead are hidden. Her right fist holds the grip at (0.56, 0.60, 0.02), right in front of her chin. Canopy bbox centre is at z 0.19 instead of the plan's z 0.0. -> In the up pose, lower the lean toward the viewer from 0.5 to about 0.12 (the `0.5 * e` term). Move the held point beside her head on her right, as the plan says (hand about (0.42, 0.58 to 0.75, 0.06) world): try HOLD = [-0.18, 0.74, 0.05]. Change the up value of rotation z so the shaft leans in and puts the canopy middle over her head (about x 0.52 to 0.6, y 1.05 or more). Measure with `gal2 head (middle),shaft,canopy`: the canopy's lowest rim point must be at least 0.05u above her head top at every up moment (t 2.5 to 6.9), and her face (eyes to chin) must not be behind the canopy or her fist from the learner's seat. Keep 'nothing passes through her' and all 9 goals passing.
- F3 (src/effects/vignettes/q-umbrella.js, the rain loop in step(), splash branch (lines 94-97)): A drop that hits the canopy grows to 3× its size (`rainK * (1 + 2 * sp)` on top of K = 1.7) and sits there for 0.18 s. Hits near the middle stack at the apex, so a blue cone about as big as her head stands on the umbrella (t+3.5 and t+4.5 renders). It reads as a blue hat, not a splash. -> Make the splash tiny and short, as the plan says: `k = sp < 1 ? rainK * (1 + 0.4 * sp) * (1 - sp) : 0` with the splash time 0.12 s instead of 0.18. Set its y on the canopy surface at the drop's own x and z, using the tilted canopy after F2. Check the t+4.5 close-up: small blue flecks on the red canopy, nothing standing up from it.

