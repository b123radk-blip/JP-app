# Plan h14: 医 "doctor; medicine" (card 533b): a new scene `q-doctor-checkup`

Plan in words (no code), with goals: `plans/haiku/goals/h14-isha.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/h-hurry.js` (fades by opacity) and
`q-pour.js` (held props).

**The idea:** a doctor in a white coat listens to a poorly little boy's chest with a stethoscope, gives him a pill, and
the boy jumps for joy. A child sees "the doctor makes you better".

**The layout is already checked** (`plans/haiku/layouts/h14-isha.json`, every goal passes with the real models): keep
its numbers. The doctor at x 0.92, z -0.06, turned 70° toward +x (rotation.y = +70°); the boy at x 1.17, z -0.03,
turned -70° (toward the doctor). The doctor bends forward (`bow(0.7)`) to reach the boy's chest with his right hand;
the reach point is (1.115, 0.3, -0.01).

## Code
- Scene module `src/effects/vignettes/h-doctor.js` (already created and registered; replace its empty `SCENES` with your scene `q-doctor-checkup`).
- Catalog: one `VM(...)` line for `q-doctor-checkup` in `src/effects/vcat-hb.js`, models `['doctor', 'guy2']`, with the right cost.
- Card `content/cards/533b.json`: set `"effect"` to exactly `{"material": "pearl", "backdrop": "sky:day", "vignette": {"type": "q-doctor-checkup"}}`.

## The scene (loop 7 s)
- People: `doctor` (`ADULT`) and `guy2` (`KID`), placed and turned as above, both on the ground.
- A first-aid box (`'kit'`): white box 0.24 wide, 0.17 tall, 0.14 deep standing on the ground at x 0.62, z 0.2, with a
  red cross on its front face (two red bars 0.12 x 0.04, one mesh named `'cross'`, just in front of the face so it faces
  the learner), and a small grey handle on top.
- A stethoscope on the doctor: a silver disc (`'scope'`, radius 0.03, thin) at his right palm (`grip` + `hold`, against
  the palm), and a dark grey cord: one thin cylinder (radius 0.006) stretched every frame from his neck (`at('chest')`
  raised 0.1 heights) to the disc (place it at the middle point, turn it along the line, scale its length).
- Timing:
  - 0 to 1.5: the boy holds his tummy with both hands (hands to his own front, about `local(±0.06, 0.32, 0.12)`), a
    small `'いたい…'` speech bubble over him (0.3 to 1.4). The doctor stands, scope in hand at his side.
  - 1.5 to 3.5: the doctor bows (0 to 0.7 over 1.5-1.9, back over 3.3-3.5) and puts the disc on the boy's chest (right
    hand to the reach point); the boy stands still, his hands back down.
  - 3.6 to 4.4: a pill (`emblemProp('pill')`, about 0.12u) pops over the boy's head, then moves to his mouth and shrinks
    away while his right hand goes to his mouth (`toMouth`).
  - 4.6 to 5.6: the boy jumps (`Jump` clip, his feet back on the ground at the end) with a heart and stars over his
    head; the doctor nods (`nod`).
  - 5.6 to 7: both stand (`Idle`), back to the start pose for the loop.

## Checks
Every inspect run with `--goals plans/haiku/goals/h14-isha.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 0.8,2.5,4.0,5.1`, and the orbit render with `--times 2.5,5.1`.

## Commit
`医: a doctor listens to a poorly boy's chest, gives him a pill and he jumps for joy (Haiku, plan h14)`
