# Plan 008: 医者 "doctor" (card w1159980), scene `q-doctor`: fix the doctor's two faults

A plan in words: it says what the scene must show; you write the code. Up to **five** inspection rounds.

## Where the code is

- The scene: `doctor()` in `src/effects/vignettes/models-b.js` (read the whole function first). Change only that
  function and the imports at the top of models-b.js. Don't touch the other scenes in the file.
- The gesture kit: `src/effects/vignettes/model-kit.js`. `actor(name, height)` makes a person with the gestures;
  `a.grip(side, centre, toward, r, k)` brings that hand's palm against a thing of radius r whose middle is `centre`
  (`toward` = the direction from the hand to the thing, a world unit vector); `a.hold(prop, side, space, r)` places a prop
  against the palm; `a.fistMid(side, out)` is the middle of a fist in world space. Read their comments in model-kit.js.
  The doctor is made now with this file's own `person()`, which has no gestures: make **the doctor** with `actor('doctor',
  0.9 * u)` instead (import `actor` from `./model-kit.js`). Leave the patient as he is.
- The catalog line `'q-doctor'` in `src/effects/vignette-catalog.js`: change its number (16) only if the cost check says.

## What is wrong now (measured by the inspection tool)

1. **t+1 to t+1.5, carrying:** `doctor PASSES INTO the red-cross kit: 52 skin points, near FistL`. While he walks in
   with the kit, it floats at a fixed offset from his body, and his left fist is inside the box. House rule: a held
   thing rests against the palm, never inside the fist.
2. **t+3, setting it down:** `doctor PASSES INTO the kit: 68 skin points, near Head, Neck, UpperArmR`. As he bends to
   put the kit down, the kit is already sitting on the ground where his head goes, and his head goes through it.

## What the scene must show (keep everything else: the story, the timing, the patient, the cloud, the hearts, the cross)

- **Carrying:** he walks in (the `Walk_Carry` clip, arms forward) with the kit resting on both palms, held from below
  at chest height: both hands under the kit, palms up against its bottom. The kit's middle sits between his two hands.
  It moves with his hands every frame (not at a fixed offset from his body).
- **Setting it down:** when he bends (the `PickUp` clip played backwards, as now), the kit stays on his palms and goes
  down with his hands until its bottom touches the ground in front of his feet, between him and the patient. Then he
  lets go and stands up, and the kit stays there on the ground. At no moment are his head, neck or chest inside the kit.
- **After:** the kit sits on the ground (it touches the ground line, not sunk, not floating) until it disappears at the
  end of the loop as now.

## Checks

The usual ones (`node --check`, `npm test`, cost check `"^q-doctor$"`), then after every change:

- `node scripts/orbit.mjs w1159980 --times 1,3,4 --out plans/qwen/renders/008-isha.jpg`
- `node scripts/inspect.mjs w1159980 --times 1,3,4 --out plans/qwen/renders/008-isha`

The times: carrying, setting down, kit on the ground.

What the inspection must show when you are done:
- In the whole-loop list, no `doctor PASSES INTO ... red/dark brown` line (the kit), except, if any, a few points near
  `FistL` / `FistR` (fewer than 10) where the palms touch it.
- After he lets go (t+4): the kit `touches the ground line`.
- Expected and fine (meant): the grey cloud `FLOATS ABOVE model guy` (it hangs over the patient); `model doctor: ...
  only N% of it inside the picture` at t+0 to t+0.5 (he walks in from off the picture).

Look at `faults.jpg` and `people.jpg` after each round, and take a `--look` from the side at t+1 and t+3 to check the
palms are under the kit.

In the report, add a section `## Inspection rounds`: for each round, what the whole-loop list said, what you saw, what
you changed.

Commit message: `医者: the doctor carries the kit on his palms and sets it down without bumping it (Qwen, plan 008)`
