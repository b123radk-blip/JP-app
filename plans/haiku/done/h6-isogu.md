# Report: h6-isogu

## What I changed
- `src/effects/vignettes/h-hurry.js`: scene `q-late-run` (77 lines), replacing the empty `SCENES`. A man (`guy2`, ADULT)
  with `Run` clip runs the path from (x 1.3, z -0.4) to (x 0.6, z 0.35), facing along it. A speed profile (integrated once
  at load) makes him slow at 1.1-1.7 s, then run faster to 2.5 s. Fade in 0-0.3 s, fade out 2.6-3.0 s, nothing 3.0-3.4 s.
  He holds the briefcase (`briefcase`, named `briefcase`) in his right hand (`grip` with the palm down on the handle, `hold`).
  At 1.1-1.7 s his left hand goes up to his eyes and his head tips down (the watch). `exclaim` pops over his head at
  1.2-1.7 s. Six sweat drops (`many(DROP)`) fly backwards off his head; three speed lines trail behind him. The alarm
  (`emblemProp('alarm', 0.25u)`) hangs at (x 1.0, y 1.0, z -0.1), shakes (rotation z, 0.12 rad) and its hands spin
  (-9 rad/s) the whole loop. A `speech` bubble いそげ! pops at 0.5-1.2 s.
- `src/effects/vcat-hb.js`: one line, `'q-late-run': VM(pdc('guy2') + 9, ..., ['guy2'])` (the cost check says it matches).
- `content/cards/6025.json`: `effect` set to `{"material": "lacquer", "backdrop": "sky:dusk", "vignette": {"type": "q-late-run"}}`.
- Renders: `plans/haiku/renders/h6-isogu.jpg` (orbit, six views at 0.6 and 1.8 s) and `plans/haiku/renders/h6-isogu/`
  (faults.jpg, overview.jpg, people.jpg, the learner's seat and scene pictures at 0.4 / 1.4 / 2.5 s, fault close-ups).
- Commits: code `69c0a6d` (the render is in it too). This report is committed separately.

## Where I left the plan, and why
- **Fade by opacity, not by scale.** The first version faded by scaling the man's group to about zero. The goal
  "nothing passes through him" has no time window, so every measured moment counts, and at 0 s and 3.0-3.25 s he was
  "not in the scene", which fails the goal. The fade now sets the opacity of his own materials (cloned per actor) and of
  the briefcase's material. He stays at full size and transparent when faded out. This is a code change, not a number.
- **Clock name.** The goals tool finds a named mesh, not a named group, so the name is on the alarm's body mesh
  (`clock.children[0].children[0]`). Its centre is the clock's centre.
- **Clock motion.** I did not use the emblem's own `idle` (it rings only half of each 2.2 s). The shake and the hand spin
  are set in the scene every frame. The hands are the alarm's third mesh (`clock.children[0].children[2]`).
- **Watch target.** The left hand was 0.36u from the head middle at 1.5 s (goal: 0.3). It now reaches
  `eyes + (0.1, -0.17, -0.08)` heights (was `(0.12, -0.1, 0.1)`, which put the hand 0.3 heights in front of the face).
  This is a number inside the plan's design (one change, round 2).
- **Exclaim position.** It sits at the top of his head, lifted 0.15 heights and 0.12 forward (not "over his head" exactly),
  so it does not hit the clock at 1.0u. The plan gave no position.
- **Speech bubble position.** `P(1.3, 1.13, -0.05)`, height 0.11, tail to the lower right. The plan gave no position.
- **Run clip at the slow phase.** He slows at 1.1-1.7 s with the `Run` clip unchanged (no walk clip), so the feet may slide
  a little while he is slow. I did not measure this as a fault.
- **Clock height vs his head.** The alarm at its plan position is only about 0.08u above his head at 1.4 s (his head top
  is about 0.9u). The inspection lists this as "floats above", which is what the plan wants. Opus should decide whether to
  raise the clock.
- **Floating feet (not fixed).** The `Run` clip's bob puts his feet up to about 0.08u above the ground (in a flight phase).
  I tried lowering the runner by 0.04u (round 4): the feet then sank 0.05u at other moments and the goals went to 6 of 8.
  I reverted it (the committed code is at 0). Only one such numeric try was used. The lift is the bob of the run clip,
  which the plan asked for, so I left it.

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/h-hurry.js` and `node --check src/effects/vcat-hb.js`: printed nothing.
- `npm test` (final code, exit 0), last lines:
  ```
  # skipped 0
  # todo 0
  # duration_ms 20908.037333
  content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 848 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
  (The first `npm test` run earlier also showed `# pass 64` and `# fail 0`.)
- `node scripts/check-piece-costs.mjs vignette "^q-late-run$"`: `679 recipes, 0 cost mismatches`

## What I see in the render (the six orbit views, at 0.6 and 1.8 s; plus a wider sheet I did not commit)
- front: the man runs with the briefcase in his right hand at his side, sweat and speed lines; no fault seen.
- right side: in profile, speed lines behind, the briefcase hangs from the hand; no body through anything.
- top: flat view on the ground line; the man and briefcase sit on the ground; sweat above the head.
- back-left: the man runs away from the learner, lines behind; the briefcase is on his side.
- front-right: the kanji and its label are clear; the man runs beside them; the clock is cut off by this framing.
- low front: the briefcase and the lines are visible; no fault seen.
- Wider sheet (`--dist 0.9`, at 0.8 and 1.4 s, in my scratch folder): いそげ! reads clearly; the red alarm sits above and
  left of his head; the exclamation mark is visible at 1.4 s.
- Faults left: the feet lift about 0.08u in the run's flight phase; the alarm hangs about 0.08u over his head at 1.4 s.
  Both are discussed above.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (`--times 0.4,1.4,2.5 --out plans/haiku/renders/h6-isogu`, with goals, `--scan 0.25 --loop 3.4`). Goals line:
```
## Goals: 8 of 8 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
```
Goal lines, all PASS:
```
  PASS the kanji stays in view: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the man stays in view (t+0.4 to t+2.5): 11 moments, e.g. t+0.5: 96% visible (needs ≥ 85)
  PASS he starts at the back right (t+0.3 to t+0.4): 1 moments, e.g. t+0.4: 0.15u apart (needs ≤ 0.15)
  PASS he ends at the front left (t+2.5 to t+2.6): 1 moments, e.g. t+2.5: 0.15u apart (needs ≤ 0.15)
  PASS he looks at his watch (t+1.3 to t+1.5): 2 moments, e.g. t+1.5: 0.25u apart (needs ≤ 0.3)
  PASS the briefcase stays in his hand (t+0.3 to t+2.6): 11 moments, e.g. t+0.5: 0u apart (needs ≤ 0.05)
  PASS the clock floats over the street: 16 moments, e.g. t+0: 0u apart (needs ≤ 0.1)
  PASS nothing passes through him: 16 moments, e.g. t+0: nothing passes into it
```
POSSIBLE FAULTS lines of the full run (each section's own list):
```
  - t+0.25, t+0.75, t+1.25, t+1.75 to t+2, t+2.5, t+3 (worst at t+0.25): model guy2: FLOATS ABOVE the ground line (gap 0.08u)
  - t+1, t+1.5 to t+1.75 (worst at t+1.75): mesh clock (red #e04040): FLOATS ABOVE model guy2 (gap 0.5u)
  - t+1 to t+1.75 (worst at t+1): mesh white #f6f2ea: FLOATS ABOVE model guy2 (gap 0.15u)
  - t+1 to t+1.5 (worst at t+1): mesh black #1a1820: FLOATS ABOVE model guy2 (gap 0.19u)
  (t+0.4)  - T1 model guy2: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.05u)
  (t+1.4)  - T6 mesh clock (red #e04040): FLOATS ABOVE T1 model guy2 (gap 0.08u)
           - T7 mesh white #f6f2ea: FLOATS ABOVE T1 model guy2 (gap 0.12u)
           - T8 mesh black #1a1820: FLOATS ABOVE T1 model guy2 (gap 0.16u)
  (t+2.5)  - T1 model guy2: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.08u)
```
Why each is left:
- guy2 floats 0.05-0.08u: the run's flight phase (the `Run` clip's bob). Lowering him by 0.04u made him sink 0.05u at other
  moments, so I left it at 0. It is about 2 cm at this scale, and the plan asks for a run.
- clock, white face, black hands "float above" him at 1.0-1.75 s: the alarm is meant to hang over the street at its plan
  position; it is over his head only at about 1.0-1.5 s (0.08-0.19u gaps). The gap at t+1.75 (0.5u) is the clock over him
  as he has moved on. Nothing is in contact with it. Opus should decide whether to raise it.
- Nothing else: no body passes into anything, no hand is off the plan (the right hand holds the briefcase at 0u; the left
  hand reaches the watch), and the kanji stays 100% visible.

## Inspection rounds
1. `--goals ... --scan 0.25 --loop 3.4 --quick` (no times): Goals 4 of 8 PASS. Failing: no sample in 0.3-0.4 s (scan steps are
   0.25 s), "clock is not in the scene" (clock unnamed), watch hand 0.36u from the head, "nothing passes through him" because
   he was not in the scene at 0 s and 3.0-3.25 s (scale fade).
2. Same with `--times 0.35,1.4,2.5 --quick`: fixes: clock named on its body mesh, watch target moved, scale fade kept.
   Goals 7 of 8 (only "nothing passes through him": not in the scene at 0 s and 3.0-3.25 s).
3. Fade by opacity (his materials and the briefcase), `--times 0.35,1.4,2.5 --quick`: Goals 8 of 8 PASS.
4. Trial: runner lowered by 0.04u (`P(x, -0.04, z)`), `--times 0.4,1.4,2.5 --quick`: Goals 6 of 8 (sinks 0.05u at other
   moments). Reverted; not committed.
5. Full run, `--times 0.4,1.4,2.5 --out plans/haiku/renders/h6-isogu` (the committed code): Goals 8 of 8 PASS, faults as above.
6. Orbit `--times 0.6,1.8` (committed in the renders), and a wider orbit `--dist 0.9` at 0.8 and 1.4 s (not committed).
