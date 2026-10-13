# Report: 005-otoko

## What I changed

Only `src/effects/vignettes/q-plough.js` and the `q-plough` line of `src/effects/vignette-catalog.js`.

- **Field (田):** the paper-thin brown board is now a thick dark-brown soil block, 0.12u tall
  (`G.box(2.2u, 0.12u, 0.8u, 0, 0.06u, 0)`, colour 0x4a2e18 instead of 0x7a5230), so its sides show it is
  earth. The field's base is raised by `0.4u·sin(tilt)` so its front bottom edge lies on the ground line; the
  `sy()` helper (field top at depth z) carries the same offset, so the man's feet and the furrows sit on the
  top as before. The single green spike row is replaced by two rows of young rice along the back (field-local
  z = -0.34 and -0.24, seven and six plants, staggered): each plant a tuft of four thin cones (0.012u radius,
  0.12u tall) tilted 0.55 rad from vertical, all merged into the field's one `solidProp` as the plan says.
- **The man (男):** a big dark moustache (the two drooping capsules from `q-dad.js`, colour 0x2a1810, copied
  into this file) is mounted on his upper lip every frame with `onBone(man, 'Head', stache, group, [0, 0.2, 0.52])`
  (imported from `./bone-mount.js`, not from q-dad.js). He now reads as a grown man.
- **Strength (力):** the `Victory` cheer is replaced by a strong-man flex, held 5.2–6.4 with the existing yellow
  burst behind him: both hands `handTo` fists beside the head at `local(±0.25, 0.8, 0)` with `{ out: 1, down: 1 }`
  so the elbows bend out and down and the forearms point up; the amount ramps in over 5.2–5.5 and out over
  6.1–6.4, and the grip on the plough handles comes straight back as now (brow wipe, plough, turns, furrows and
  all other timing are untouched).
- **Burst position:** raised from `floor + 1.15u` to `floor + 1.3u` — the field raise put his head 0.087u higher,
  and the star's bottom touched his head box at 1.15.
- **Catalog:** the `5` in `pdc(o.who) + (o.outcome === 'boy' ? 2 : 5)` is now `6` (the moustache is a sixth mesh
  `ploughMan` adds) and the description now says "a moustached man … thick field of dark earth, young rice along
  its back … flexes like a strong man". The `boy` outcome and `boyPlane` were not touched.

## Where I left the plan, and why (or "Nowhere")

- The plan's expected line "His feet touch the field (`touches` the soil block) at every time, not FLOATS ABOVE
  or SUNK INTO" is not literally met, and I don't think it can be while following the plan's instruction to build
  all the rice into the field's one `solidProp`: the inspector then measures the man against the field's merged
  bounding box (whose top is the rice tips, 0.39u), or against the flat ground line, and reports "SUNK INTO T1
  (gap -0.16u)" / "FLOATS ABOVE the ground line (gap 0.15u)" / "PASSES INTO T1 … near the bones Foot" even though
  his soles are exactly on the soil top. In every close-up (t+2, t+4.6, t+5.8, t+9 from front and right) his feet
  are on the field top and nothing of his body is visibly inside the soil except the sole line. If Opus wants the
  inspector to report a clean `touches`, the rice would have to be its own prop (a seventh mesh; I was told to
  keep them in the field's solidProp) or the tilt reduced.
- "While ploughing: each hand's nearest other thing is the plough, about 0u away" — the plough is a child of the
  man's model, so the inspector folds it into the "model worker" entry and never lists it as a separate thing;
  it reports the nearest *other* thing as the field. I judged the hand–handle contact by eye instead: at t+2 and
  t+9 the close-ups show both palms resting on the two grips.
- Otherwise: nowhere.

## Checks (paste the real last lines of each)

- `node --check src/effects/vignettes/q-plough.js` and `... vignette-catalog.js`: printed nothing (SYNTAX-OK echoed by me).
- `npm test`:
  ```
  ℹ tests 64
  ℹ pass 63
  ℹ fail 0
  content check ok: 835 cards (262 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 835 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-plough$"`: `675 recipes, 0 cost mismatches`
- `node scripts/orbit.mjs 7537 --times 2,4.6,5.8,9 --dist 0.9 --out plans/qwen/renders/005-otoko.jpg`
  → `plans/qwen/renders/005-otoko.jpg (looking at 0.44,0.08,0.03)`
- `node scripts/inspect.mjs 7537 --times 2,4.6,5.8,9 --out plans/qwen/renders/005-otoko` — final run pasted in
  "Inspection" below; plus one extra look, `--look T4 --from left --t 5.8 --zoom 2`
  → `plans/qwen/renders/005-otoko/look-T4-left-t5.8.jpg`.

## What I see in the render (each of the six views, one line each, and any fault left)

The orbit sheet has six angles × two moments (t+2 ploughing the front row, t+4.6 brow, t+5.8 flex, t+9 back row);
I checked the full-scene and close-up pictures from the inspection runs for each moment (front and right), plus
the orbit sheet itself.

- **t+2 (ploughing, front/right):** he leans on both grips and pushes, share in the soil ahead of his feet, one
  step forward on the field top; two rows of young rice behind him; the field is a thick dark block, its front
  bottom edge on the ground line. No fault.
- **t+2 close-ups:** both palms on the two handles; feet on the soil (a walking mid-stride, one foot up); the
  moustache sits on his upper lip.
- **t+4.6 (brow wipe, front/right):** mid-wipe (k ≈ 0.4 at 4.6): his right hand is part-way up toward the brow,
  left arm relaxed — it reads as reaching up, not as a fault; the moustache is clearly visible from the side.
- **t+5.8 (flex, front/right):** elbows out and down, both fists beside the head at cap height, yellow star burst
  clear above/behind him; from the extra front-on look (`look-T4-left-t5.8.jpg`) the big moustache reads strongly
  and one fist + out elbow is clearly visible (the other arm is behind the kanji at that angle). It reads as a
  strong-man flex, though a front view would make it unmistakable.
- **t+9 (back row, front/right):** hands back on the grips, share cutting the second furrow behind him, rice rows
  visible on both sides; from the right his lower legs are hidden behind the field's front edge (occlusion, not
  sinking — front and close-up views show the feet on the top).
- **Back/top/low-front angles:** field block sits on the ground line with the kanji above it; nothing new.
- Faults left: none that a fix within the plan would remove — see "Inspection" for the measured lines I can't
  clear because of the merged field+rice bbox.

## Inspection

Rounds, in order:

1. **Round 1** (first build): `T1 field SUNK INTO the ground line (gap -0.09u)`; worker `PASSES INTO T1` near
   the feet at every time; flex at t+5.8 had the arms stretched up and over the head (target too far: the arms
   are only ~0.4u long, a target 0.3–0.35u out and 0.3u up is near full reach, so no elbow bend); brow wipe at
   t+4.6 mid-motion. I saw the field's front bottom edge hanging below the ground line in the scene views and
   the arms-over-head in the t+5.8 close-ups.
2. **Round 2:** raised the field by `0.4u·sin(tilt)` (front bottom edge on the ground line; `sy()` follows) and
   moved the flex target to `local(±0.34, 0.78, 0.02)` with `{ out: 1, down: 1 }`. Inspection: `T1 touches the
   ground line` ✓; but the flex still stretched the arms up — the fists were at cap height with straight arms,
   and the t+5.8 close-up showed the arms over the head, not out to the sides.
3. **Round 3:** flex target to `local(±0.22, 0.72, 0.06)` (within reach so the elbow can bend). Render showed
   both fists clapped in front of his mouth (the target was too close to the face). Also raised the burst to
   `floor + 1.3u` — after the field raise its bottom touched his head box (`SUNK INTO T4 (gap -0.08u)` in round 2).
4. **Round 4:** flex target to `local(±0.25, 0.8, 0.0)` (beside the head, not in front of it). Hands now report
   `right hand at [0.72,0.9,-0.12]: nearest own body part right shoulder 0.26u; left hand at [0.78,0.9,0.32]:
   nearest own body part head (middle) 0.23u` — above the shoulders, beside the head ✓; the close-ups show the
   double-biceps flex. I stopped there (round 4 of the allowed 5).

POSSIBLE FAULTS of the last run, and why each is fine or what is left:

- t+2 / t+4.6 / t+5.8: `T2 mesh #2a1810 (moustache): FLOATS ABOVE T1 (gap 0.39–0.44u)` — expected, the plan says
  so: it is fixed to his face, its "gap" to the field is meaningless. Close-ups (front and right) show it on the
  upper lip.
- all times: `T3/T4 mesh #3a2414 (furrows): FLOATS ABOVE the ground line (gap 0.16–0.25u)` — by design: the
  furrows are dark strips on the field's *top*, which is 0.12–0.25u above the flat ground line because the field
  is a thick tipped block; the inspector has no way to see the tilted top surface.
- t+2 / t+4.6: `worker SUNK INTO T3 (furrow) (gap -0.04u)` — by design: he walks along the furrow line he just
  cut; his soles are at the field top and the furrow strip protrudes 0.006u above it, so the foot sole overlaps
  the strip by ~1 cm. Close-ups show the feet on the soil, not sunk.
- t+5.8: `worker FLOATS ABOVE the ground line (gap 0.15u)` and t+9: `worker SUNK INTO T1 (gap -0.16u)` — the
  merged field+rice bbox (top 0.39u at the rice tips) defeats the inspector: at t+5.8 it compares him to the
  flat ground, at t+9 to the rice-tip top. His feet are on the soil top at both times in the pictures. (See "Where
  I left the plan".)
- all times: `worker PASSES INTO T1 … 184–333 skin points inside its box, near the bones Foot / LowerLeg` —
  his feet stand on the field, so skin points at sole height fall inside the field's horizontal bbox; the
  close-ups show nothing of his body inside the soil.
- t+5.8: `T5 burst FLOATS ABOVE T4 (gap 0.07u)` / previously `SUNK INTO T4 (-0.08u)` — the burst is a floating
  star effect behind/above him during the flex, meant to hover; after the raise it clears his head by 0.07u.
