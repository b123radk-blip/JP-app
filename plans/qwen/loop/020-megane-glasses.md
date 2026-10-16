# Loop: 020-megane-glasses.md

Started 2026-10-16T22:59:35.294Z at 0581568.

## Round 1: Qwen builds
pi: 0 after 6.0 min.
Watcher's checks: npm test passed; ## Goals: 13 of 13 PASS
```
  PASS he holds the glasses in front of his chest at first (t+0 to t+1.3): 3 moments, e.g. t+0: 0.2u apart (needs ≤ 0.3)
  PASS both hands hold the glasses at first (t+0 to t+1.3): 3 moments, e.g. t+0: 0.02u apart (needs ≤ 0.05)
  PASS his right hand holds them too (t+0 to t+1.3): 3 moments, e.g. t+0: 0.02u apart (needs ≤ 0.05)
  PASS both hands bring the glasses up (t+1.5 to t+2.5): 3 moments, e.g. t+1.5: 0.02u apart (needs ≤ 0.05)
  PASS his right hand brings them up too (t+1.5 to t+2.5): 3 moments, e.g. t+1.5: 0.02u apart (needs ≤ 0.05)
  PASS the lenses sit right in front of his eyes (t+2.6 to t+5.5): 6 moments, e.g. t+3: 0.03u apart (needs ≤ 0.035)
  PASS his hands are down while he wears them (t+3.2 to t+5): 4 moments, e.g. t+3.5: 0.36u apart (needs ≥ 0.15)
  PASS his right hand is down too (t+3.2 to t+5): 4 moments, e.g. t+3.5: 0.36u apart (needs ≥ 0.15)
  PASS both hands take the glasses off (t+6 to t+6.9): 2 moments, e.g. t+6: 0.01u apart (needs ≤ 0.05)
  PASS nothing passes through him (lenses and arms outside his face and head, hands never inside the glasses): 16 moments, e.g. t+0: nothing passes into it
  PASS the learner sees him: 16 moments, e.g. t+0: 93% visible (needs ≥ 85)
  PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the glasses show big: 16 moments, e.g. t+0: shows 3% as big as the kanji (needs ≥ 3)
```
Opus reviews (call 1 of 2)
Opus: fix (list-price estimate $0.66: on a subscription it is not billed per call)

> The timing, the grips and the onEyes wearing all work, and 13 of 13 goals pass with no measured faults. But the glasses don't look like glasses: two fat rings overlap into one black doughnut blob over his nose and both eyes, with a long bar sticking out well past each side of his face. From the learner's seat it reads as a mask or a gag, not 'he put on glasses'.
- F1 (src/effects/vignettes/q-glasses.js, glassesScene (the lenses solidProp)): The rings are radius 0.04 hu with a 0.02 hu tube, centred at only ±0.02 hu, so they overlap by a whole radius and form one thick black blob. Seen close up from the front at t+3.5 (inspect --look T2 --zoom 3), it covers his nose and both eyes and no eye shows through a lens. Measured from his brows, his eyes sit about ±0.056 u (about ±0.06 hu) from the middle of his face. The measured e.apart (~0.02) is far too small for this model, so it can't be used for spacing. -> Space the rings from his face width, not from e.apart: ring centres at x = ±0.06 * hu, ring radius 0.045 * hu, tube 0.008 * hu (thin wire frame; the plan says 0.006, which is fine if 'big' still passes). Make the bridge box 0.03 * hu wide and 0.01 * hu tall at y +0.01 * hu, between the inner edges of the two rings. Make the end pieces 0.012 * hu tall (not 0.025), running from each ring's outer edge (0.105 * hu) out to the hinge. Keep the pivot at the middle between the lenses and keep onEyes. Then run check_goals: 'the glasses show big' must still be ≥ 3. If it drops, raise the tube to 0.01 * hu before anything else.
- F2 (src/effects/vignettes/q-glasses.js, glassesScene (tab and the end-piece boxes)): The end pieces run out to tab = hx + 0.05 hu (±0.175 u). His visible face is only about ±0.10 u wide, so when he wears them a black bar sticks out about 0.07 u past each cheek (see the t+3.2 front tile and the zoomed look), like a rod through his head. -> Set tab = hx + 0.02 * hu. If a hand goal then fails (≤ 0.05), move the grip point out to ±(hx + 0.005 * hu) rather than making the bar longer again. The arms (temples) stay at ±hx.
- F3 (src/effects/vignettes/q-glasses.js, step() (the glint position gp)): The glint sits at x = -0.27 * e.apart * hu. That is almost the middle of the frame (it covers the bridge at t+3.2), and it is on his right lens, but the plan says his left lens (+x, the learner's right). -> Put the glint at the new left-lens centre: gp = (+0.06 * hu, 0.01 * hu, 0.02 * hu) in the glasses' frame (same applyQuaternion and add as now).

