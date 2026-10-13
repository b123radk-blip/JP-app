# Report: 006-inspect-test

## Version check
- `git log -1 --format=%h -- scripts/inspect.mjs` printed `2ccb8b7`.
- `node scripts/inspect.mjs` (no card) printed:
  `usage: node scripts/inspect.mjs <card id> [--times 1,2.5] [--scan 0.5] [--people] [--strict] [--recipe try.json] [--out dir] | --look T3 [--from right] [--t 1.5] [--zoom 2]`
  — mentions `--recipe`. Passed.

## Runs

### a (62bc push)
`done in 3 s`
Whole loop: `no measured faults at any moment`.
No faults to judge. Pictures (overview tiles 1–4): the person walks up beside the kanji, leans in and shoves it, dust balls at the feet — matches the description.
Caveat, see Problems: the report says "(no people or animals)" and the Things list has only white/beige pools — the pushing person is not measured at all, so "no measured faults" does not cover him.

### b (725b cow)
`done in 3 s`
Whole loop: `no measured faults at any moment`.
No faults. Cow's four legs touch the ground line, grass tufts grounded, 99%/98% visible. Overview: head down grazing at t+1, head up at t+2.5. Matches.

### c (725b + 006-cow-lifted.json)
`done in 5 s`
Whole loop:
```
- t+0 to t+6.5 (worst at t+0): model cow: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.3u)
- t+0 to t+6.5 (worst at t+0): model grass: SUNK INTO model grass (gap -0.04u)
- t+0 to t+6.5 (worst at t+0): model grass: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.3u)
```
- cow FLOATS 0.3u: REAL (planted), faults.jpg tiles 1–2: the legs hang over bare blue background with nothing below.
- grass SUNK INTO grass: consequence of the same lift (the two tufts sit at the same lifted height and touch); tiles 3–4.
- grass FLOATS 0.3u: REAL (planted), tiles 3, 5–6: tufts in mid-air.

### d (w1159980 + 006-doctor-low.json)
`done in 20 s`
Whole loop:
```
- t+0 to t+6.5 (worst at t+0): model guy: SUNK INTO the ground line (bottom of the kanji) (gap -0.45u)
- t+0 to t+6.5 (worst at t+0): model doctor: SUNK INTO the ground line (bottom of the kanji) (gap -0.45u)
- t+0 to t+3.5 (worst at t+0.5): mesh grey #8a94a8: FLOATS ABOVE model guy (gap 0.2u)
- t+0 to t+6.5 (worst at t+5.5): model guy: 60% visible (40% behind the meaning label)
- t+1 to t+1.5 (worst at t+1): model doctor PASSES INTO mesh red/dark brown #e02020/#404040: 52 skin points inside it, near the bones FistL
- t+2.5 to t+3 (worst at t+3): model doctor: 81% visible (19% behind the meaning label)
- t+3 (worst at t+3): model doctor PASSES INTO mesh red/dark brown #e02020/#404040: 68 skin points inside it, near the bones Head, Neck, UpperArmR
```
- guy/doctor SUNK -0.45u: REAL (planted), faults tiles 1–4: feet hang below the label over bare background.
- cloud FLOATS above guy: MEANT (grey cloud over the patient), tile 5.
- guy 60%/28% behind the meaning label: consequence of the planted left-shift (see Planted).
- doctor PASSES INTO red box (52 FistL, 68 Head/Neck/UpperArmR): same lines appear in case f without the fixture, so inherent to the recipe, not the plant (judged under f).

### e (7537 plough)
`done in 6 s`
Whole loop:
```
- t+0 to t+6.5 (worst at t+0): mesh brown/grey #8a5a30/#9aa2ae: SUNK INTO mesh green/dark brown #58b848/#4a2e18 (gap -0.03u)
- t+0.5 (worst at t+0.5): mesh dark brown #3a2414: SUNK INTO mesh brown/grey #8a5a30/#9aa2ae (gap -0.1u)
```
- plough SUNK INTO field -0.03u: MEANT (the share cutting a furrow), faults tile 1–2: the share is planted in the top of the field.
- share SUNK INTO plough -0.1u: MEANT (the share fitted into the plough), tiles 3–4: the dark share is mounted in the beam.
Overview: moustached man pushing the plough along the earth slab, hands on the handles (report: both hands 0.02–0.06u from the plough). Matches.

### f (w1159980 plain doctor)
`done in 15 s`
Whole loop:
```
- t+0 to t+3.5 (worst at t+0.5): mesh grey #8a94a8: FLOATS ABOVE model guy (gap 0.2u)
- t+0 to t+0.5 (worst at t+0): model doctor: 100% visible; only 1% of it inside the picture
- t+1 to t+1.5 (worst at t+1): model doctor PASSES INTO mesh red/dark brown #e02020/#404040: 52 skin points inside it, near the bones FistL
- t+3 (worst at t+3): model doctor PASSES INTO mesh red/dark brown #e02020/#404040: 68 skin points inside it, near the bones Head, Neck, UpperArmR
```
- cloud FLOATS above guy 0.2u: MEANT (gloom cloud over the slumped patient), faults tile 1.
- doctor only 1% inside the picture at t+0: MEANT (he walks in from off the picture), tile 3 (learner's seat: doctor at the right edge).
- PASSES INTO red box, 52 pts near FistL (t+1): leaning REAL, mild. My own close looks (front and front-right at t+1) show the white kit resting on the doctor's left hand with its lower corner biting into the fist — the fist is partly inside the box, i.e. not "resting against the open palm" per the house rule. Small, but a viewer could notice it.
- PASSES INTO red box, 68 pts near Head/Neck/UpperArmR (t+3): CAN'T TELL. Close looks from front-right and left at t+3 (and faults tiles 6–7) show the doctor bent low setting the kit down, the top of the white box right at his lowered face; his hair hides the back of the head, so I can't confirm whether the box clips it or the points come from the bent arm/neck. I'd need a close look from behind at t+3.

### g (72ac dog)
`done in 4 s`
Whole loop:
```
- t+1 (worst at t+1): model shiba PASSES INTO mesh white/blue #ffffff/#40c0ff: 8 skin points inside it, near the bones FrontLowerLegR, FrontShoulderR
- t+2 to t+6.5 (worst at t+2.5): model shiba PASSES INTO mesh white/blue #ffffff/#40c0ff: 36 skin points inside it, near the bones Head
- t+4.5 (worst at t+4.5): model shiba: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.12u)
```
- shiba PASSES INTO ball, 8 pts near FrontLowerLegR/FrontShoulderR (t+1): MEANT (the ball bouncing past as the dog starts after it; only 8 points), though the ball's position in that close-up (faults tile 1) is hard to spot.
- shiba PASSES INTO ball, 36 pts near Head (t+2–6.5): MEANT (the ball stays in the mouth), faults tiles 3–4 and overview tile 4: blue ball held at the muzzle.
- shiba FLOATS 0.12u (t+4.5): MEANT (the joy hop), small gap.

## The planted faults
- **c**: `at: [0, 0.3]` in the vignette — the whole scene lifted 0.3u. Told by the whole-loop list: cow *and both* grass tufts FLOAT above the ground line at exactly 0.3u for the entire loop (in a real fault one thing would be off, not every object in the scene at the same gap), and the fault close-ups show legs and grass hanging over bare sky.
- **d**: `at: [-0.9, -0.45]` — the scene shifted 0.9u left and sunk 0.45u. Told by guy and doctor SUNK into the ground line at exactly -0.45u all loop, plus the side effect of the left-shift: the patient ends up under the kanji and the meaning label (guy 60–72% visible, 28–40% behind the label; kanji 84% visible with 9% behind the guy). The red-box PASSES-INTO lines also appear, but they appear in case f too, so they are not the plant.

## Strict exit codes
- `node scripts/inspect.mjs 62bc --strict --scan 0 ...` → no measured faults → exit **0** (`EXIT_PUSH=0`).
- `node scripts/inspect.mjs 7537 --strict --scan 0 ...` → faults measured (plough SUNK INTO the field at t+1 and t+2.5, listed under POSSIBLE FAULTS) → exit **0** (`EXIT_PLOUGH=0`). Expected 1. See Problems, item 1.
(Note: my first attempt at the push run used `;` as a separator, which cmd.exe does not treat as one — I redid both runs with `&` and `%ERRORLEVEL%`; the numbers above are from the clean runs.)

## Close look (case f, t+3)
The doctor is `T2 model doctor`. `--look T2 --from front-right --t 3` → `look-T2-front-right-t3.jpg`: the doctor is bent almost flat, head lowered, looking down at the kit between the patient and himself; the top of the white kit box sits right at his face, just below the chin. It looks set down (or one frame short of the ground) and very close to his face — close but I can't confirm an intersection from this angle (back of the head hidden by hair; from the left it is the same: box top against the face). The kit's red cross faces the patient.

## Reading the sheets
Case f `faults.jpg`:
- Tile 1 caption, word for word: `fault 1 from front t+2.5` — shows the grey gloom cloud floating above the patient's head, with the doctor's head at the right edge.
- Last tile (7) caption, word for word: `fault 4 from right t+3` — shows the bent doctor from the right, the white kit at his lowered face, the patient's raised arm at the left.
Readability: the red corner numbers (white digits on red square) are large and unmissable; the small white top-left captions are small but legible against the dark tiles. Both were easy to read on this screen.

## Problems with the tool
1. **`--strict` with `--scan 0` never exits 1.** The exit code comes from `found = seen.size`, and `seen` is only built by the whole-loop scan; faults measured at the fixed `--times` sections (the plough's SUNK-INTO, listed and given close-ups) do not count. With `--scan 0`, a card with visible faults still exits 0. Either strict should include the section faults or the docs should say strict only covers the scan.
2. **Kit-built people are invisible to the measurements.** Case a (push): the person shoving the kanji is not in the Things list, not measured for grounding, and the learner-view section says "(no people or animals)", yet he is clearly in the scene. Model people (cow, doctor, worker, shiba) are all measured fine. So case a's "no measured faults" does not actually cover its person.
3. **Fault close-up framing is very tight.** Some fault tiles are mostly background or one surface (e.g. case e tile 2 is almost the soil slab; case g tile 5 is mostly empty blue). The numbered full-size pictures fix it (`--look`-style single shots exist in the folder), but a slightly wider default for the fault tiles would save a step.
4. Minor: in case c the two grass tufts report SUNK INTO *each other* (a consequence of the lift, not a real fault) — a one-line "these move together" hint would help, but the whole-loop listing made it obvious.
5. No crashes; runs took 3–20 s (case d, 20 s, was the slowest, with the most fault close-ups). The `--look` mode worked every time I used it (four extra looks in case f), and printing the output path on one line is just right.
