# Report: h2-sosogu

## What I changed
- New file `src/effects/vignettes/q-pour.js` (scene `q-jug-pour`): table (`table`), glass (`glass`, transparent, with the
  water `water` as its child, so the water is part of the glass and not a second body in it), jug (`jug`, a cream jug
  built from a cylinder, a handle ring and a spout), stream (`stream`, a thin blue cylinder scaled to reach from the
  spout to the water's surface), a `burst` sparkle, and gal2 (`actor('gal2', 0.9 u)`) with a nod at the end.
- Right hand grips the top of the jug's handle, palm down (`grip` + `hold`, the palm turns with the jug); the jug tilts
  about the hand-side handle centre. Timing as in the plan: lift 0-1.2, tip 1.2-2, pour 2-4 (stream and water), tip back
  4-4.6, sparkle and nod 4.6-5.5, lower and drain 5.5-6.5 (loop 6.5 s).
- `src/effects/vignettes/index.js`: import and register `QPOUR`.
- `src/effects/vcat-q5b.js`: catalog entry `'q-jug-pour': VM(pdc('gal2') + 6, ..., ['gal2'])`.
- `content/cards/6ce8.json`: `effect.vignette` = `{ "type": "q-jug-pour" }` (the other recipe fields are unchanged).
- Renders: `plans/haiku/renders/h2-sosogu.jpg` (orbit, times 1, 3, 5), `plans/haiku/renders/h2-sosogu/` (inspection
  pictures for t 1, 3, 5), and two close-ups `look-T3-front-t1.jpg`, `look-T3-front-t4.jpg`, `look-T3-top-t4.jpg`.

## Where I left the plan, and why
- Girl at x 1.1 (plan 1.15), table and glass at x 0.8 (plan 0.75). At 1.15 / 0.75 the right hand could not reach the
  jug over the glass: the arm stopped about 0.1 u short, the jug dipped into the glass rim at t+1.5 and the stream
  missed the glass by 0.04-0.09 u. The table and glass moved to 0.8 (the stream then reached the glass); the girl was
  kept at 1.1 because 1.05 and 1.15 gave worse results in the rounds.
- The jug is not held over the glass during the lift: it hovers beside the glass (its body clears the rim, which the
  first version did not, since the body hangs 0.13 u below the handle) and slides in as it tips, so the spout lands over
  the glass.
- The water is a child of the glass (not a separate mesh in the glass). The separate mesh was measured as sunk into the
  glass, which fails the "glass stands on the table" goal.
- The girl turns to the table by yaw -(pi/2) + 0.5 (as the plan says: toward the table, a bit toward the learner).
- Card 6ce8 still has its old `emblem: "cup"` (a white mug, which shows at the left of the learner's view next to the jug).
  The plan asked only for `effect.vignette`, so I left it; Opus may want to drop it.
- Inspection rounds: I ran about nine quick rounds and four picture runs, which is more than the plan's six (see below).

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/q-pour.js`, `src/effects/vignettes/index.js`, `src/effects/vcat-q5b.js`: no output (ok).
- `npm test` (final code):
```
content check ok: 838 cards (265 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 838 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```
  and `# pass 64`, `# fail 0` from the unit tests before them. npm test passed (exit 0).
- `node scripts/check-piece-costs.mjs vignette "^q-jug-pour$"`: `676 recipes, 0 cost mismatches`.
- `node scripts/orbit.mjs 6ce8 --times 1,3,5 --out plans/haiku/renders/h2-sosogu.jpg`: wrote the sheet (exit 0).
- `node scripts/inspect.mjs 6ce8 --goals plans/haiku/goals/h2-sosogu.json --times 1,3,5 --out plans/haiku/renders/h2-sosogu`
  (exit 1, one goal FAIL, see below).

## What I see in the render (each of the six views, one line each, and any fault left)
- front: t+1 the girl holds the jug over the table, next to the glass; t+3 the stream runs into the blue water; t+5 the glass is full and a sparkle is above it. No fault seen.
- right side: she stands beside the table, the jug and the glass are visible; the figure is small in this view. No fault seen.
- top: the jug is over the glass; the stream reaches it at t+3. No fault seen.
- back-left: the jug is over the glass and the table stands on the ground. No fault seen.
- front-right: the jug, glass and her hand are all in view; the kanji label is visible. No fault seen.
- low front: the scene reads as pouring at all three moments. No fault seen.
- I looked at the close-ups too: at t+1 the forearm passes to the right of the glass and above the table, and nothing lies under the glass; at t+4 the glass is full, the jug is tipped over it. The learner's view (`t3-learner.jpg`) shows her, the table, the jug and the glass at a readable size on the right of the kanji.
- Not verified: the headset, the timing by eye, and whether the jug reads as a jug at small size.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (times 1, 3, 5; `Goals` line from the same run):
```
## Goals: 8 of 9 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
  FAIL the glass stands on the table: fails at t+0.5 to t+1.5, t+3 to t+6 of 14 moments; t+0.5: glass (white #cfe8ff): is on T1 model gal2 (worn or held: check it sits right in the close-ups)
```
POSSIBLE FAULTS in that run: `no measured faults at any moment`.
- The one failing goal: the inspector's support test casts a ray down from the glass's base and reports the first thing it
  hits, here gal2 (not the table) at t+0.5-1.5 and t+3-6. The close-ups show nothing under the glass, so I think the ray
  hits the girl's mesh at a point that is not visible (the skinned mesh probably raycast in its bind pose). I did not
  confirm this, and I could not fix it by moving the girl or the table without breaking another goal (the sink and the
  reach). For Opus: check the support ray or move the girl a little (the test passed at 1.1 with the glass at 0.75, but
  then the reach failed).

Goal lines in the last quick run (all moments, `--scan 0.25`):
```
  PASS her right hand holds the jug all loop: 0.03u apart (needs <= 0.04)
  PASS the jug is right over the glass while she pours (t+2 to t+4): 0u apart (needs <= 0.12)
  PASS the stream reaches into the glass while she pours (t+2.25 to t+3.75): 0.01u apart (needs <= 0.01)
  PASS nothing passes through her: nothing passes into it
```

## Inspection rounds
- R1 (girl 1.15, glass 0.75, water a separate mesh): 7 of 9. Glass sunk into water; stream 0.09 u from the glass.
- R2 (water a child of the glass, girl 1.05): 8 of 9. Glass "on" the girl at t+0.75-1.5 and t+3-6.
- R3 (girl 1.1): 7 of 9. Jug sinks into the glass at t+1.5; stream 0.04 u off.
- R4 (glass 0.8): 8 of 9. Stream PASS; glass "on" the girl still.
- R5 (jug hovers beside the glass, shift to the spout): 8 of 9. Sink gone; glass "on" the girl still.
- R6 (glass 0.75, girl yaw -0.5): 7 of 9. Hand 0.05 off at t+6.25; glass "on" the girl.
- R7 (glass 0.8, girl 1.13, yaw -0.5): 8 of 9. Glass "on" the girl over the whole loop.
- R8 (restored to glass 0.8, girl 1.1, yaw -(pi/2) + 0.5): 8 of 9. Final; all other goals PASS.
- Picture runs (look, top look, full run with times 1, 3, 5): the full run is the last and gives the Goals line above.
- Rounds went beyond the plan's six. Each round changed one number in the code; none of them was a new piece.
