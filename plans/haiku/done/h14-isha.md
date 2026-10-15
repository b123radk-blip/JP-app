# Report: h14-isha

## What I changed
- `src/effects/vignettes/h-doctor.js`: the scene `q-doctor-checkup` (7 s loop) in place of the empty stub. Doctor
  (`doctor`, ADULT) at x 0.92, z -0.06, turned 70°; boy (`guy2`, KID) at x 1.17, z -0.03, turned -70°; the kit
  (box 0.24 x 0.17 x 0.14 at x 0.62, z 0.2, a grey handle, a mesh named `cross` on the front face at z 0.078); the
  stethoscope disc (`scope`, radius 0.03u, on the doctor's right palm: `grip` + `hold`, its face turned to the palm); a
  cord (one thin cylinder stretched each frame from the doctor's chest + 0.1 heights to the disc); a pill (`emblemProp
  ('pill', 0.12u)`); the いたい… bubble; a heart (`many`) and stars (`stars`) over the boy's head during the jump.
- The reach uses the plan's numbers: the right fist to (1.115, 0.3, -0.01) through `handTo`, the bow at k 0.7, the
  chest reach ramping 1.5 to 1.8 s and back 3.3 to 3.5 s. The palm turns to the boy with `twist` during the reach.
- `src/effects/vcat-hb.js`: one catalog line for `q-doctor-checkup`, `VM(pdc('doctor', 'guy2') + 10, ..., ['doctor', 'guy2'])`.
- `content/cards/533b.json`: `effect` is `{"material": "pearl", "backdrop": "sky:day", "vignette": {"type": "q-doctor-checkup"}}`
  (written across several lines, same content).
- `plans/haiku/renders/h14-isha.jpg` and `plans/haiku/renders/h14-isha/` (the orbit sheet and the inspection pictures).

Choices the plan left to me: the speech bubble at P(1.32, 0.8, -0.03); the pill starts at the boy's head landmark
`over` + 0.3 heights and goes to `mouth` + 0.05 z; the boy's jump uses `pose('Jump', v - 4.6, false)` (the clip, not looped);
the heart size 0.1u, three stars of size 0.08u at r 0.13u; the cross centre at z 0.078u so it sits just in front of the
kit's face; the doctor's rest grip centre at local (-0.2, 0.5, 0.1) with its palm turned up. No layout number changed.

Two things I added beyond the plan, both found in the numbers of the first run and recorded below:
- `pill.userData.flies = true` and `bubble.userData.flies = true`: the pill and the speech bubble hang in the air on
  purpose, and the kit's `flies` mark (README, "Kit effects meant to fly") is how the inspection is told so.
- Two bugs of my own, fixed before the commit: the cord's length was set after the direction was normalised (the cord
  came out one world unit long), and the pill's scale overwrote the size `emblemProp` gives it (the pill came out about
  one world unit big).

## Where I left the plan, and why (or "Nowhere")
- The goal "the boy stands on the ground" FAILS at t+5: the boy's jump lifts him 0.27u at t+5 (the Jump clip). The plan
  asks for that jump, and the goal checks the ground at every moment of the loop, so the two cannot both hold. I did not
  edit the goals file. Leaving it failing as the README asks.
- Nothing else left the plan.

## Checks (paste the real last lines of each)
```
$ node --check src/effects/vignettes/h-doctor.js && node --check src/effects/vcat-hb.js && echo "NODE CHECK OK"
NODE CHECK OK
$ npm test   (last lines)
# pass 64
# fail 0
content check ok: 851 cards (278 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 851 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
$ node scripts/check-piece-costs.mjs vignette "^q-doctor-checkup$"
690 recipes, 0 cost mismatches
```
Not run: `npm run e2e` and `npm run preview-shots` (the plan does not ask for them). I did not test in a headset.

## What I see in the render (each of the six views, one line each, and any fault left)
Render: `plans/haiku/renders/h14-isha.jpg` (orbit, times 2.5 and 5.1), plus the inspection sheets at 0.8, 2.5, 4.0, 5.1.
- front: at 2.5 the doctor leans over the boy with the disc on his chest; at 5.1 the boy is in the air with his arms up,
  a heart and stars over him, the kit at the bottom left with its cross showing. Fault left: the boy's jump (wanted).
- right side: at 2.5 the doctor bends over the boy, the cord running from his chest to the disc; at 5.1 the boy is airborne
  in front of the doctor. No fault besides the jump.
- top: the doctor's head and the boy's head seen from above, the kit in front of them; the pill is visible at 5.1 (wanted).
- back-left: at 2.5 the doctor's back and the boy's head, the kit on the ground to the right; at 5.1 the boy's jump is
  visible from behind. Nothing else.
- front-right: at 2.5 the doctor and boy are small against the kanji; the kit's cross shows; at 5.1 the boy's arms are
  up. The kit's cross shows. Nothing else.
- low front: at 2.5 the kit and the two people sit on the ground; at 5.1 the heart and stars are above the boy. No fault.

Sheets (`plans/haiku/renders/h14-isha/overview.jpg`, `faults.jpg`): the boy's right hand is at his mouth at 4.0 (the pill
over his head, at his mouth next); the doctor's disc is on the boy's chest at 2.5. The doctor's nod at 5.1 I did not look at closely. I could not
tell from the sheets whether the disc on the chest reads as a stethoscope at the learner's distance: it is 0.06u across.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last run: `node scripts/inspect.mjs 533b --goals plans/haiku/goals/h14-isha.json --scan 0.25 --loop 7 --times 0.8,2.5,4.0,5.1 --out plans/haiku/renders/h14-isha`

```
## Goals: 11 of 12 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS the kanji stays in view: 30 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the doctor stays in view: 30 moments, e.g. t+0: 99% visible (needs ≥ 85)
  PASS the boy stays in view: 30 moments, e.g. t+0: 100% visible (needs ≥ 85)
  PASS the doctor stands on the ground: 30 moments, e.g. t+0: doctor: touches the ground line (bottom of the kanji)
  FAIL the boy stands on the ground: fails at t+5 to t+5.1 of 30 moments; t+5: guy2: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.27u)
  PASS the first-aid kit stands on the ground: 30 moments, e.g. t+0: kit (grey/white #9aa0a8/#f4f4f4): is on T3 model doctor (worn or held: check it sits right in the close-ups)
  PASS the first-aid kit shows big: 30 moments, e.g. t+0: shows 9% as big as the kanji (needs ≥ 6)
  PASS its red cross shows: 30 moments, e.g. t+0: 100% visible (needs ≥ 80)
  PASS the stethoscope hand touches the boy (t+1.8 to t+3.3): 6 moments, e.g. t+2: 0.03u apart (needs ≤ 0.04)
  PASS at his chest height (t+1.8 to t+3.3): 6 moments, e.g. t+2: 0.14u apart (needs ≤ 0.16)
  PASS nothing passes through the doctor: 30 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through the boy: 30 moments, e.g. t+0: nothing passes into it
```

POSSIBLE FAULTS, per moment (the full run's report):
```
t+0.8
  - T2 mesh cross (red #d03028): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.03u)
t+2.5
  - T2 mesh cross (red #d03028): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.03u)
t+4
  - T2 mesh cross (red #d03028): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.03u)
  - T7 mesh red #e04848: FLOATS ABOVE T4 model guy2 (gap 0.11u)
  - T8 mesh white #f6f2ea: FLOATS ABOVE T4 model guy2 (gap 0.12u)
t+5.1
  - T2 mesh cross (red #d03028): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.03u)
  - T4 model guy2: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.24u)
```
Why each is fine or what is left:
- The cross (T2) floats 0.03u: it is a decal on the front face of the kit, 0.025u above the ground (the kit's bottom
  is at the ground). The plan asks for the cross on the face, not on the ground. Fine, as planned.
- The pill (T7) and its white half (T8) float above the boy at t+4: the pill is in the air on purpose, rising from over
  his head to his mouth. Fine, as planned. The report lists them anyway, although the pill carries `userData.flies`
  (the flies mark does not remove them from the per-moment list). Left as is.
- The boy floats 0.24u at t+5.1 (0.27u at t+5): the jump. The plan wants it; the goal "the boy stands on the ground" FAILS
  at t+5 for that reason (see above). Left failing; the goal file is unchanged.
- Not listed as faults: the hand reports say the doctor's right hand is 0.04u from the disc at 0.8, 2.5 and 4.0 (the
  disc sits on the palm), and the boy's right hand is inside the doctor's bounding box at 2.5 and 4.0 (0u). The
  bounding box is not the skin: "nothing passes through the doctor" and "nothing passes through the boy" both PASS at
  every moment, so no skin point is inside the other person.

## Inspection rounds
- Round 1 (numbers only, `--quick`, `--scan 0.25`): Goals 5 of 12 PASS. The cord was one world unit long (my bug: the
  direction was normalised before its length was read) and the pill was about one world unit big (my bug: the scale
  overwrote the size `emblemProp` sets). Both made the doctor and the boy hidden at t+3.75 to t+4.25.
- Round 2 (numbers only): cord fixed. Goals 5 of 12 PASS; the pill size still wrong.
- Round 3 (numbers only): pill scale set to 0.12u times the grow factor; pill and bubble marked `userData.flies`.
  Goals 11 of 12 PASS (only "the boy stands on the ground" FAILS, at t+5: the jump).
- Round 4 (full run with pictures at 0.8, 2.5, 4.0, 5.1, and the orbit sheet): Goals 11 of 12 PASS, the same single
  FAIL; pictures checked (see "What I see in the render"). Done: no further changes.

## Goals: 11 of 12 PASS
FAIL: the boy stands on the ground (fails at t+5: floats 0.27u, the plan's jump; the goal checks every moment).
