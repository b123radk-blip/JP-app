# Plan 000: smoke test (no code changes)

This checks that the watcher, the renders and your image reading all work on this PC. **Change no code.**

1. Run `node scripts/orbit.mjs 5915 --out plans/qwen/renders/000-smoke.jpg` (card 5915 is 夕, "evening").
2. Look at the render with your read tool and describe each of the six views (front, right side, top, back-left,
   front-right, low front) in one line each: who and what you see, and whether anything floats, sinks or passes through
   something else.
3. Run `npm test` and `node scripts/check-piece-costs.mjs vignette "^q-dusk$"` and paste their last lines.
4. Commit the render as `Qwen smoke test render`, then write the report (format in the rules) to
   `plans/qwen/done/000-smoke.md` and commit it as `Qwen report: 000-smoke.md`.
