# Report: 020-megane-glasses

## What I changed
- `src/effects/vignettes/q-glasses.js`: replaced the stub with the `q-glasses` scene: an old man (`grandpa`, `ADULT * u`, feet at x 0.55) holds black glasses in front of his chest with both hands at the end pieces (hinges), the kanji jiggles (per-stroke `stage.offset`, 0.015 u, 0-2.6); 1.4-2.4 both hands lift the glasses to his face (position lerp / quaternion slerp between the chest place and the `onEyes` place, grips following the hinges every frame); 2.4-2.6 they settle on and the jiggle eases out; 3.0-3.4 a white four-point star glints on the left lens (`burst(u, { s: 0.08, n: 4 })` + `pop`); 3.4-5.2 he nods twice with the glasses on (worn with `onEyes` every frame, hands down); 5.2-6.0 the hands come back to the hinges; 6.0-7.0 he takes them off (blend back to the chest); the kanji jiggles again from 6.4; 7.0-8.0 Idle at the chest, so the loop ends where it began. The glasses are built from `who.shape().eyes` (black #202020): two ring lenses + bridge + end pieces in one `lenses` solidProp, two temple boxes in an `arms` solidProp (length `e.z - mid.z + 0.02` to the ears), group named `glasses` pivoted at the middle of the lenses; both hands `grip` the ends with the palm toward the glasses (toward from hand to hinge, inward along x).
- `src/effects/vcat-qw.js`: `q-glasses` cost `pdc('grandpa') + 4` → `+ 3` (lenses, arms, glint = 3 draw calls; description and models kept as the plan says).

## Where I left the plan, and why
- **Lens ring size/position (the plan's `0.25 * e.apart` rings do not work on this model).** Grandpa's measured `e.apart` is only about 0.02 heights (his eyes sit very close together), so the plan's rings (radius `0.25 * e.apart * hu` at ±`0.27 * e.apart`) end up about 0.01 u across, overlapping in the middle of the face: the "the glasses show big" goal measured 1% (needs ≥ 3) and the lenses were a nearly invisible smudge. I made the rings `0.04 * hu` radius, `0.02 * hu` tube, centred at ±`0.02 * hu` (each ring still covers its eye; the pivot stays at the middle of the eyes so the "sits right in front of his eyes" goal is unaffected). I also made the bridge 0.06 hu wide and the end pieces 0.025 hu high (thick, readable frame).
- **A bug I introduced and fixed:** I passed `0` as the 3rd argument of `G.torus` — that argument is the **arc** (signature `torus(R, r, arc, x, y, z)`), so both rings were degenerate zero-arc tori and the lenses rendered flat/invisible (that is why "big" stayed 1% across my first two size attempts). Fixed to `Math.PI * 2`. After that single fix `big` measured 3% and passed.
- **Chest place z 0.16 → 0.13 u** (the plan's "about (0.56, 0.465, 0.16)"): at 0.16 both hands measured 0.06 u from the lenses (arms are 0.24 u and the hinges were just past full reach); at 0.13 the hands reach and measure 0.02-0.04 u.
- **Grip points at ±(hx − 0.01 hu)** and the end pieces extended out to **hx + 0.05 hu** (a short hinge tab past the face's half-width): the fist centre sits ~0.043 u past the grip point (fist half-thickness), so without the tab the hands measured ~0.06 u from the lenses box; with the tab the palms rest against the ends of the frame and the goals measure 0.01-0.04 u. The arms (temples) still start at the hinges ±hx.
- **`onEyes` out 0.02 → 0.03 heights** so the thicker tube (0.02 hu) does not touch the face front (the "nothing passes through him" goal passes at 16 moments).
- The catalog description still says he "picks his glasses up from a little table" — the plan told me to keep the description, but there is no table in this scene (he starts holding them); flagging it for Opus.

## Rounds (check_goals, goals file, loop 8)
1. Built exactly per the plan: **9 of 13 PASS** (left hand 0.06 u short in three hand goals; `big` 1%).
2. Bigger rings (0.078 hu) + grip opts `{ out: 0.3, down: 0.4 }` + chest z 0.15: **7 of 13** (grip opts made both hands 0.06 u; abandoned).
3. Rings 0.035 hu at ±0.02 hu, bridge 0.05 hu, end pieces to hx + 0.03, grips at hx + 0.015, chest z 0.13: **10 of 13** (hand goals mostly fixed; `big` still 1%).
4. Ring 0.04 hu, tube 0.02 hu, bridge 0.06 hu, end pieces to hx + 0.05, grips at hx − 0.01, `onEyes` out 0.03: **12 of 13** (`big` still 1% — the zero-arc torus bug).
5. Torus arc `0` → `Math.PI * 2`: **13 of 13 PASS**, no measured faults over the whole loop.

## Checks (real last lines)
- `node --check src/effects/vignettes/q-glasses.js` → printed nothing (syntax OK)
- `npm test` →
  ```
  content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-glasses$"` → `701 recipes, 0 cost mismatches`
- `node scripts/orbit.mjs w1577670 --times 0.5,3.5,6.5 --out plans/qwen/renders/020-megane-glasses.jpg` → `plans/qwen/renders/020-megane-glasses.jpg (looking at 0.43,0.04,-0.02)`
- `node scripts/inspect.mjs w1577670 --goals plans/qwen/goals/020-megane-glasses.json --loop 8 --times 0.5,2.0,3.2,6.5 --out plans/qwen/renders/020-megane-glasses` (final run, after all fixes):
  ```
  ## Goals: 13 of 13 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

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

  The whole loop, every 0.5 s from t+0 to t+7.5: no measured faults at any moment
  ```

## What I see in the render (orbit sheet, three moments 0.5 / 3.5 / 6.5 per angle)
- front: t+0.5 he stands right of the kanji holding the glasses at his chest, both hands on the end pieces; t+3.5 the glasses are on his eyes, hands down; t+6.5 he is taking them off, hands at the hinges, the frame between face and chest. No faults.
- right side: the frame sits in front of his face and the temples run back to the ears (not through the head); held in front of the chest at 0.5/6.5. No faults.
- top: the lens plane faces the learner (the frame is seen edge-on from above, temples along the sides of the head); nothing floating or sunk.
- back-left: from behind the temples follow the sides of the head and the front of the frame pokes out in front of his face — no pass-through.
- front-right: glasses visible at the chest (0.5), on the face (3.5), and being removed (6.5); the glint star is seen on the left lens around t+3.2 in the overview sheet.
- low front: same three phases readable from below; hands rest against the ends of the frame, feet on the ground.

## Inspection
Last run: `no measured faults at any moment` over the whole loop (0.5 s steps, t+0..t+7.5); "Bodies passing into things: none". The only note is the hands: "grandpa right hand ... nearest other thing T2 mesh lenses 0u away" and "grandpa left hand ... 0u away (inside its box: touching or passing through)" — that is meant: the flat fist paddles rest against the end pieces they grip (the palm-against-thing rule; the "hands never inside the glasses" goal passes on all 16 moments). `held.jpg` shows the frame close up from three sides: the rings sit over his eyes, the end pieces are gripped by both hands, the temples reach the ears; at t+3.2 the learner's view shows the old man wearing the glasses, and the kanji is unjiggled while he wears them. A child would see: an old man squinting at a wobbling kanji, puts on his glasses, it goes still, he nods happily, takes them off, it wobbles again.

One open flag for Opus: the catalog line's description mentions a little table, which this scene does not have (kept per the plan's instruction).
