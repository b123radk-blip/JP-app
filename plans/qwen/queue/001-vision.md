# Plan 001: vision check (no code changes)

Plan 000 worked except the image reading: pi had your model marked as text only. That is fixed now, so this time look at the render. If your read tool still shows no image, say so and stop. **Change no code.**

1. Run `node scripts/orbit.mjs 5915 --out plans/qwen/renders/001-vision.jpg` (card 5915 is 夕, "evening").
2. Look at the render with your read tool and describe each of the six views (front, right side, top, back-left,
   front-right, low front) in one line each: who and what you see, and whether anything floats, sinks or passes through
   something else.
3. Run `npm test` and `node scripts/check-piece-costs.mjs vignette "^q-dusk$"` and paste their last lines.
4. Commit the render as `Qwen vision check render`, then write the report (format in the rules) to
   `plans/qwen/done/001-vision.md` and commit it as `Qwen report: 001-vision.md`.
