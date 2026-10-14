# What every Haiku pilot plan shares

- Read `plans/haiku/README.md` (your standing rules; "Goals" in it is the part that decides when you are done).
- Positions are in u (the kanji's height), x measured from the kanji's right edge, y up from the ground line, z toward
  the learner. **Keep everything between x 0.15 and 1.4, z -0.45 to 0.45, below y 1.2**: the learner's picture ends
  just past x 1.5, and the goals check that people and the kanji stay in view.
- People: `person(name, u, scale)` from `src/effects/vignettes/q-common.js` (scale `ADULT` 0.9, `TEEN` 0.75, `KID`
  0.55); it is an actor with the gestures of `src/effects/vignettes/model-kit.js` (read the comments at its top: `pose`,
  `handTo`, `grip` + `hold` for a held thing, which rests against the palm, never inside the fist). Clips per model:
  docs/MODELS.md. Props: shapes from `src/effects/pieces/shape-kit.js` (`G.box`, `G.cyl`, `G.sphere` ...) merged with
  `solidProp` (`src/effects/pieces/kit-rig.js`), little things in bulk with `many()` (`src/effects/pieces/kit-things.js`),
  labels and emblems with `textPlane` / `emblemProp` (`src/effects/pieces/kit-props.js`).
- Look at one similar finished scene before you start (each plan names one) and write yours in the same style.
- Give each prop the goals name with `mesh.name = '...'` (or `group.name`) exactly as the plan says.
- The card's recipe: change only `effect.vignette` in the card file to `{ "type": "<the scene type>" }`.
- Every inspect run: `node scripts/inspect.mjs <card> --goals plans/haiku/goals/<plan>.json --scan 0.25 --loop <the
  plan's loop> --quick`; at the end one full run without `--quick` (`--times` as the plan says, `--out
  plans/haiku/renders/<plan>`) and `node scripts/orbit.mjs <card> --times <same> --out plans/haiku/renders/<plan>.jpg`.
- Checks: `node --check` on every changed file, `npm test`, `node scripts/check-piece-costs.mjs vignette "^<type>$"`.
- Commit the code with the plan's message, then the report in `plans/haiku/done/<plan>.md` (README format, plus
  `## Inspection rounds`: one line per round, what you changed and its Goals line).
