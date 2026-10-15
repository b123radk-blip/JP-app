# Standing rules for the builder

You are a builder model. Opus (Claude) designs each card's 3D scene and writes you a plan in `plans/haiku/`; you build
it, check it, render it and report. **Never push** and never switch branches.

The app: kanji flash cards for a VR headset; each card plays a small 3D scene that must show the card's meaning so
clearly that a child would understand it without being told. Scene code lives in `src/effects/vignettes/` (one function
per scene type), its cost and description in `src/effects/vignette-catalog.js`. `CLAUDE.md` describes the repo, but the
plan is what you follow.

## How to do a plan

1. Read the whole plan before changing anything. It names the files and functions you may change; change nothing else.
   If something in it looks impossible or wrong, don't improvise: do what you can and explain the problem in the report.
2. Make the change in the style of the surrounding code (dense lines, `const` chains, no new imports or helpers unless
   the plan says so).
3. Run the checks, in this order:
   - `node --check <each file you changed>` (must print nothing)
   - `npm test` (must end without `FAILED`)
   - `node scripts/check-piece-costs.mjs vignette "^<scene type>$"` (must say `0 cost mismatches`; the scene type is in
     the plan, e.g. `q-tunnel`)
   - `node scripts/orbit.mjs <card id> --out plans/haiku/renders/<plan name>.jpg` (the plan may give extra flags such as
     `--times`). It renders the card from six angles (front, right side, top, back-left, front-right, low front), two
     moments each.
   - `node scripts/inspect.mjs <card id> --times <the plan's times> --out plans/haiku/renders/<plan name without .md>`:
     measures the scene and takes big close-up pictures. Read its whole report first: it lists every thing (T1, T2 ...),
     what each rests on (FLOATS ABOVE / SUNK INTO), bodies PASSING INTO things, where each hand is on the body, and how
     much of each person (and of the kanji) the learner can see, what hides behind the meaning label, and who is partly
     outside the picture. It first measures the whole loop every 0.5 s and lists each fault with the moments it shows; a
     fault outside the plan's times gets a section and close-ups of its own. Stars, hearts and bursts from the kit are
     in the air on purpose and are not faults. Its POSSIBLE FAULTS are measured, so trust them over your impression of a
     picture: a fault it lists is a fault unless the plan wants it (a jump, tiptoes, a bird in the air). Then open its
     picture sheets (one at a time): `faults.jpg` first (each fault close up once, at its worst moment), then
     `overview.jpg` (the whole scene and the learner's view) and `people.jpg` (each person a fault names). Tiles are
     numbered as in the report; open a tile's own picture only when the tile is too small to judge.
   - People built from the props kit (older scenes) are measured too, as `kit person 1`, `kit person 2`. Anything a
     person or animal carries or wears is listed as theirs; inside it only their hand counts (held things rest against
     the palm, not inside the fist).
   - Someone walking in from off the picture shows as "only N% of it inside the picture" for the first moments: that is
     meant when the plan says they walk in.
   - Exit codes (`--strict`): read them on a line of their own after the command: PowerShell `echo $LASTEXITCODE`,
     cmd.exe `echo %ERRORLEVEL%`. In cmd.exe, `node ... & echo %ERRORLEVEL%` on one line shows the code of the command
     *before*, not this one.
   - For any doubt, take your own close look: `node scripts/inspect.mjs <card id> --look T3 --from right --t 1.5
     --zoom 2 --out plans/haiku/renders/<plan name without .md>` (any thing id from the report, or a point x,y,z in u).
     Look at the thing in doubt from two sides before deciding.
4. **Look at the render** (open the .jpg with your read tool) and the inspection pictures. Check what the plan says the scene must show, and these
   faults in every view: people or props floating above the ground or sunk into it; things passing through each other
   (a body through a wall, a hand through a cup); something hidden that should be seen; pieces in the wrong place.
   After every change, run the inspection again: the next round starts from its new report.
5. If the render or the inspection shows such a fault and the fix is a number inside the code the plan gave you (a position, a size), you
   may fix it: at most two tries, re-rendering after each. Say exactly what you changed and why in the report. Anything
   bigger (a new piece, a different design): don't do it; describe it in the report for Opus.
   The orbit sheet's framing is only a review camera: something cut off by a tile's edge or its header bar is not a
   fault, and you don't need to move it. To see more of the scene, re-render with `--dist 0.9` instead. Judge poses and
   contacts (hands on things, feet on the ground) by eye; don't spend time measuring screen coordinates.
6. Commit the code with the plan's commit message (render included).
7. Write the report to `plans/haiku/done/<plan name>` (same file name as the plan) and commit it as
   `Qwen report: <plan name>`.

## Goals (when the plan has them)

A plan may come with a goals file, `plans/haiku/goals/<plan name without .md>.json`: the plan's must-haves written as
measurements (a hand within 0.1u of the toes from t+4 to t+5, a person at least 85% visible, a kit resting on the
ground). Then:
- Add `--goals plans/haiku/goals/<plan name without .md>.json` to every inspect run. The report starts with
  `## Goals: N of M PASS`, one PASS or FAIL line each, with the moments it fails and the measured numbers.
- In the rounds between changes, add `--quick` too: numbers only, no pictures, about a quarter of the time. Look at
  pictures (a full run, without `--quick`) only when the numbers can't tell you what is wrong, and once at the end.
- The plan is done when every goal says PASS and the whole-loop list has no fault the plan doesn't want. Don't stop
  while one fails if you have rounds left; don't keep changing things once all pass.
- Never edit the goals file. If a goal looks wrong or impossible, leave it failing and explain it in the report.
- A goal's PASS or FAIL is what you report about it: paste the Goals lines. Don't call a goal met that says FAIL.
- To measure a prop by name, give it one in the code (`mesh.name = 'sandbox'`) when the plan asks you to. A name on a group works too.
- Seat-view goals: `big` (the thing shows at least N% as big as the kanji from the learner's seat) and `faces` (its top
  is turned at least N degrees toward the learner; flat things seen edge-on fail). If one fails, make the thing bigger,
  bring it forward or tilt its top toward the learner, within the plan's numbers.

## The report

```
# Report: <plan name>
## What I changed
## Where I left the plan, and why (or "Nowhere")
## Checks (paste the real last lines of each)
## What I see in the render (each of the six views, one line each, and any fault left)
## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
```

Be exact and honest: paste real output, and if you did not run a check or could not look at the render, say so. Opus
renders and reviews every card again, so a wrong claim costs more than an open problem.
