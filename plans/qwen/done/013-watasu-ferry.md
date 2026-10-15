# NOT DONE (written by qwen-watch)

pi ended (timed out) after 30.0 min without a report. Last lines of its output:

```

```

## Round 2

The watcher sent back: `npm test` passed, but inspect gave no Goals result (exit 1) — the round-1 session
timed out (its last command died on an unquoted Windows path, `'C:\Program' is not recognized`) before the
goals run finished. This round: ran the goals run to completion, reviewed the whole-loop fault list against
the plan, tried the fixable faults, and investigated an object the plan didn't expect.

### What I changed

`src/effects/vignettes/q-ferry.js`: **no change kept.** The round-1 code already satisfies all 17 goals, and
every fix attempt I made either broke a goal or made the scene look worse (each tested with `try_value`,
then reverted):

- pole `pz = bz - 0.30` (0.08 behind him, per the plan's "planted in the water behind him") + tip 0.02u below
  the water: `his right hand is on the pole` FAILS (hand 0.08u from the pole, needs ≤ 0.04 — the IK arm is
  already at its limit: at the plan's x 0.68 the right hand sits 0.04u off the pole) and `the pole reaches
  the water` FAILS at t+2 (0.03u from the river, needs ≤ 0.02: its far edge is at z −0.788, and at t+2 the
  tip at z ≈ −0.85 is past it, in the grass).
- `glow: 0` on the boat: goals stay 17/17, but the hull goes dull dark brown and the red oar is unchanged
  (its red is saturated diffuse + bloom, not emissive). Reverted.
- wood `tint: { colormap: 0x9a6b45 }` on the boat: goals stay 17/17, hull muddier, oar still red. Reverted.

So the scene is exactly the round-1 code; the round-2 deliverable is the completed goals run plus this
report. The last two check runs of the plan (inspect with goals, orbit) are fresh for this round.

### Why the pole faults can't be fixed with the plan's numbers

The plan's layout puts the pole at x ≈ 0.70 with "its bottom end in the water beside the boat". With the
ferryman at the boat's middle (x 0.58) and his arm reach ≈ 0.15–0.18u (measured: his right hand is already
0.04–0.05u short of the pole at x 0.68), the pole's x must stay ≤ ~0.70 for the hand goals. At x 0.68–0.70
the Kenney hull's plan view extends back to z ≈ boat−0.28…−0.32, while the river's far edge (z −0.788)
forces the tip to z ≥ boat−0.19 while the boat waits at the far bank. So every tip z that keeps the pole in
the river also lands inside the hull (the close-up `plans/qwen/renders/013-pole-tip-top/` shows the tip
resting on the boat floor), and every tip outside the hull breaks the hand-reach or river goals (measured
above). Left at the plan's placement (x 0.68, z = boat−0.22, tip at the waterline, goal 0.01u). This is a
design decision for Opus: a narrower boat (kb ≈ 0.22 → hull half-width ≈ 0.15u, so a tip near x 0.70 could
  clear the stern), a bigger ferryman, or retelling the stroke. The narrower-boat option drops `the boat is
  big enough` from 21% to ~11%, under its 12% minimum.

### Goals (real lines, last inspect run, exit 0)

`node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/013-watasu-ferry.json --loop 8.5 --times 0.5,3.4,6.2
--out plans/qwen/renders/013-watasu-ferry`

```
## Goals: 17 of 17 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS the boat touches the far bank when she gets in (t+0 to t+1.8): 4 moments, e.g. t+0: 0u apart (needs ≤ 0.03)
  PASS the boat touches the near bank when she gets out (t+5 to t+6.4): 4 moments, e.g. t+5: 0u apart (needs ≤ 0.03)
  PASS she stands on the far bank first (t+0 to t+0.9): 2 moments, e.g. t+0: gal2: touches T1 mesh far bank (green #6ab04c)
  PASS she sits in the boat while it crosses (t+1.8 to t+5): 8 moments, e.g. t+2: 0u apart (needs ≤ 0.03)
  PASS she stands on the near bank after (t+5.9 to t+6.6): 3 moments, e.g. t+6: gal2: touches T3 mesh near bank (green #6ab04c)
  PASS the ferryman stands in the boat: 19 moments, e.g. t+0: guy3: touches T4 model rowboat
  PASS his right hand is on the pole: 19 moments, e.g. t+0: 0.04u apart (needs ≤ 0.04)
  PASS his left hand is on the pole: 19 moments, e.g. t+0: 0.02u apart (needs ≤ 0.04)
  PASS the pole reaches the water while he poles (t+1.8 to t+5): 8 moments, e.g. t+2: 0.01u apart (needs ≤ 0.02)
  PASS the learner sees her on the far bank (t+0 to t+0.9): 2 moments, e.g. t+0: 99% visible (needs ≥ 85)
  PASS the learner sees her in the boat (t+1.8 to t+5): 8 moments, e.g. t+2: 99% visible (needs ≥ 65)
  PASS the learner sees her on the near bank (t+5.9 to t+6.6): 3 moments, e.g. t+6: 98% visible (needs ≥ 85)
  PASS the learner sees the ferryman (after she has sat down) (t+1.8 to t+8.5): 15 moments, e.g. t+2: 79% visible (needs ≥ 70)
  PASS the boat is big enough: 19 moments, e.g. t+0: shows 21% as big as the kanji (needs ≥ 12)
  PASS the river is seen from above: 19 moments, e.g. t+0: its top is turned 19° toward you (needs ≥ 15)
  PASS nothing passes through her: 19 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through him: 19 moments, e.g. t+0: nothing passes into it
```

### Whole-loop faults (last run) and my verdict

```
  - t+0 to t+2, t+5 to t+6.5 (worst at t+0): mesh river (blue #2f8fe0): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.1u)
  - t+0 to t+8 (worst at t+0): mesh near bank (green #6ab04c): SUNK INTO the ground line (bottom of the kanji) (gap -0.07u)
  - t+0 to t+1.5, t+2.5, t+3.5 to t+6, t+7 to t+8 (worst at t+1): mesh pole (brown #8a5a30): SUNK INTO model rowboat (gap -0.1u)
  - t+2, t+3, t+6.5 (worst at t+2): mesh pole (brown #8a5a30): FLOATS ABOVE mesh river (blue #2f8fe0) (gap 0.05u)
  - t+2 to t+5 (worst at t+2): model gal2: SUNK INTO model rowboat (gap -0.03u)
  - t+2 to t+5 (worst at t+3.5): model guy3: 76% visible (24% behind model gal2); shows 11% as big as the kanji
  - t+2.5 to t+4.5, t+7 to t+8 (worst at t+2.5): mesh river (blue #2f8fe0): SUNK INTO model rowboat (gap -0.38u)
  - t+4 to t+4.5, t+7.5 (worst at t+4): model rowboat PASSES INTO mesh river (blue #2f8fe0): 6 skin points inside it
```

- river FLOATS ABOVE the ground line (0.1u) — by plan design: the plan's layout puts the river on the 26°
  sloping surface (its bottom middle on the tilted ground line at its centre z), not on the flat bottom-of-
  the-kanji line the checker compares against.
- near bank SUNK INTO the ground line (−0.07u) — by plan design: the near (lower) end of the tilted slab dips
  below the flat ground line; sin 26° × half-depth = 0.066u ≈ the reported 0.07u.
- pole SUNK INTO rowboat (−0.1u) / pole FLOATS ABOVE river (0.05u) — the tip-inside-the-hull consequence of
  the plan's numbers (see "Why the pole faults can't be fixed" above; close-ups in
  `plans/qwen/renders/013-pole-tip-top/`). The FLOATS line at the push peaks is also a checker artifact on
  top of that: its support ray casts from the pole's AABB bottom-centre, which on the 26° ground sits
  0.06–0.10u down-slope of the actual waterline contact; the goal that measures tip→water passes at 0.01u.
- gal2 SUNK INTO rowboat (−0.03u) — by plan design: she sits inside the boat; the checker sees her lowest
  body points below the boat's top surface.
- guy3 76–79% visible (21–24% behind gal2) — as intended: he poles from the back of the boat, behind her;
  the goal (≥ 70%) passes. The 11% size line is informational (he is small and at the back).
- river SUNK INTO rowboat (−0.26/−0.38u) + rowboat PASSES INTO river (6 skin points) — by plan design: the
  boat floats in the water; its keel sits 0.03u below the waterline (the plan's y = slope(z) + 0.02).

### Finding for Opus: a red oar baked into the Kenney hull mesh

The side views show a bright red oar at the boat's stern (a shaft with a blade, red diffuse + bloom halo).
It is not a scene prop: hiding the boat group makes it disappear, and after the plan's removal
(`boat.node('paddles')`, exactly as `rower()` in step1-boat.js) the boat group contains exactly one mesh
(verified in-browser: the `paddles` node is found and removed, `node('paddles')` then returns null, and the
traverse shows only the hull mesh `boat-row-small_1`). So the red oar is part of the hull mesh geometry of
`kenney/pirate-kit/boat-row-small.glb` (the GLB's separate `paddles` node is a different mesh; the red one
is baked into the `boat-row-small` mesh). It can't be removed with `node()`; `glow: 0` and a wood `tint`
were tested and don't help. The same baked-in red oar is on the shipped 前 card (524d, same model and same
removal) — see `plans/qwen/renders/mae-boat3/`. Needs a vertex-level trim of the hull mesh or a re-prepped
model.

### What I see in the render (orbit sheet `plans/qwen/renders/013-watasu-ferry.jpg`, six views × t 0.5/3.4/6.2)

- front t+0.5: the woman waits on the far bank, the man stands in the boat with its back end at the bank —
  the waiting beat reads.
- front t+3.4: she is seated in the boat mid-crossing, he poles from the back — the ferrying beat reads.
- front t+6.2: the boat at the near bank, she steps out and waves.
- right side (all three): the crossing reads as a move toward the viewer across the sloping river; the red
  baked-in oar at the stern is conspicuous (the model finding above).
- top (all three): the layout is clear — river between the two banks, the boat moving from the far bank to
  the near one; the red dot at the boat's stern is the baked-in oar.
- back-left / front-right / low front: the kanji 渡す and the label read, the story is visible from the
  learner's side; the low-front t+6.2 shows her wave close up.

### Checks (real last lines)

- `node --check src/effects/vignettes/q-ferry.js` → (no output)
- `npm test` → `tests 64 / pass 63 / fail 0 / skipped 1` (the skip is the ffmpeg-voice test), then
  `content check ok: 851 cards (278 kanji, 573 words)`, `0 pair(s) at or above 0.72`, `recipe check ok`
- `node scripts/check-piece-costs.mjs vignette "^q-ferry$"` → `693 recipes, 0 cost mismatches`
- `node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/013-watasu-ferry.json --loop 8.5
  --times 0.5,3.4,6.2 --out plans/qwen/renders/013-watasu-ferry` → exit 0, `## Goals: 17 of 17 PASS` (lines
  above)
- `node scripts/orbit.mjs w1444610 --times 0.5,3.4,6.2 --out plans/qwen/renders/013-watasu-ferry.jpg` →
  `plans/qwen/renders/013-watasu-ferry.jpg (looking at 0.38,0.28,-0.27)`

### Per-round lines

- Round 1: built the `q-ferry` scene from the plan (sloping ground, the crossing, all beats); the session
  timed out before the goals run, so no Goals result was recorded. The code as committed (731fec3) measures
  17 of 17 PASS (verified in round 2, untouched since).
- Round 2: completed the goals run (the round-1 inspect had died on a shell error) — exit 0, 17 of 17 PASS;
  no code change kept (pole z-shift and two boat-material variants tried and reverted, see above); 17 of 17
  PASS.
- Round 3: no scene change (nothing to fix: 17 of 17 PASS). The watcher's "inspect gave no Goals result" is a
  bug in its own script, reproduced and explained below; my own full inspect run (same measuring code) is 17 of
  17 PASS, exit 0.

## Round 3

The watcher sent back: `npm test` passed, but inspect gave no Goals result (exit 1) —
`'C:\Program' is not recognized as an internal or external command`. This is **not a scene problem: it is the
watcher's own check failing to run on this PC, and it has failed identically in rounds 1 and 2** (the loop file
`plans/qwen/loop/013-watasu-ferry.md` shows "inspect gave no Goals result (exit 1)" after both of them — the
watcher has never once measured this plan's goals; the round-2 17/17 came from my own inspect run).

### Root cause (reproduced)

`check()` in `scripts/qwen-watch.mjs` runs
`run(process.execPath, ['scripts/inspect.mjs', card, '--goals', goals, '--quick', ...])`, and on Windows `run()`
spawns with `{ shell: true }` (cmd.exe). On this PC `process.execPath` is
`C:\Program Files\nodejs\node.exe`; the path is joined into the command line **unquoted**, so cmd.exe parses
`C:\Program` as the command. Reproduced exactly, in isolation:

```
node -e "const {spawn}=require('child_process'); const p=spawn(process.execPath,['-e','console.log(42)'],{shell:true});
  let o=''; p.stdout.on('data',d=>o+=d); p.stderr.on('data',d=>o+=d); p.on('close',c=>console.log('code',c,JSON.stringify(o.slice(0,200))))"

→ code 1  "'C:\\Program' is not recognized as an internal or external command,\r\noperable program or batch file.\r\n"
```

(`npm test` passes from the same watcher because its command is bare `npm`, resolved via PATH with no space.)

### What I changed

**Nothing in the scene** (`src/effects/vignettes/q-ferry.js`, `src/effects/vcat-q5c.js`): all 17 goals pass and
the whole-loop fault list is line-for-line the same as round 2, every entry already judged in that report as by
plan design (tilted ground vs the flat ground line, pole tip, seating, occlusion, boat-in-water). There is no
number in the plan's files that affects this failure — the failure happens before inspect's code ever runs.

I did **not** fix `scripts/qwen-watch.mjs`: it is in the watcher's own `PROTECTED` list ("files neither agent may
change", and `guard()` would check it back out and commit the revert), and the plan only authorizes
`q-ferry.js` and the catalog line. The one-line fix, for Brad or Opus, is in `run()` in `scripts/qwen-watch.mjs`
(the arguments are documented as space-free, so quoting just the command is safe):

```js
// before
p = spawn(cmd, args, { shell: WIN, ... });
// after
p = spawn(cmd.includes(' ') ? `"${cmd}"` : cmd, args, { shell: WIN, ... });
```

Until that lands, the watcher's `inspect gave no Goals result` line for this card can be read as "the check
couldn't run" — the scene's real state is the run below.

### Goals (real lines, last inspect run, exit 0)

`node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/013-watasu-ferry.json --loop 8.5 --times 0.5,3.4,6.2
--out plans/qwen/renders/013-watasu-ferry`

```
## Goals: 17 of 17 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS the boat touches the far bank when she gets in (t+0 to t+1.8): 4 moments, e.g. t+0: 0u apart (needs ≤ 0.03)
  PASS the boat touches the near bank when she gets out (t+5 to t+6.4): 4 moments, e.g. t+5: 0u apart (needs ≤ 0.03)
  PASS she stands on the far bank first (t+0 to t+0.9): 2 moments, e.g. t+0: gal2: touches T1 mesh far bank (green #6ab04c)
  PASS she sits in the boat while it crosses (t+1.8 to t+5): 8 moments, e.g. t+2: 0u apart (needs ≤ 0.03)
  PASS she stands on the near bank after (t+5.9 to t+6.6): 3 moments, e.g. t+6: gal2: touches T3 mesh near bank (green #6ab04c)
  PASS the ferryman stands in the boat: 19 moments, e.g. t+0: guy3: touches T4 model rowboat
  PASS his right hand is on the pole: 19 moments, e.g. t+0: 0.04u apart (needs ≤ 0.04)
  PASS his left hand is on the pole: 19 moments, e.g. t+0: 0.02u apart (needs ≤ 0.04)
  PASS the pole reaches the water while he poles (t+1.8 to t+5): 8 moments, e.g. t+2: 0.01u apart (needs ≤ 0.02)
  PASS the learner sees her on the far bank (t+0 to t+0.9): 2 moments, e.g. t+0: 99% visible (needs ≥ 85)
  PASS the learner sees her in the boat (t+1.8 to t+5): 8 moments, e.g. t+2: 99% visible (needs ≥ 65)
  PASS the learner sees her on the near bank (t+5.9 to t+6.6): 3 moments, e.g. t+6: 98% visible (needs ≥ 85)
  PASS the learner sees the ferryman (after she has sat down) (t+1.8 to t+8.5): 15 moments, e.g. t+2: 79% visible (needs ≥ 70)
  PASS the boat is big enough: 19 moments, e.g. t+0: shows 21% as big as the kanji (needs ≥ 12)
  PASS the river is seen from above: 19 moments, e.g. t+0: its top is turned 19° toward you (needs ≥ 15)
  PASS nothing passes through her: 19 moments, e.g. t+0: nothing passes into it
  PASS nothing passes through him: 19 moments, e.g. t+0: nothing passes into it
```

Whole-loop faults: identical to the round-2 list (river/near bank vs the flat ground line, pole tip in hull/water,
gal2 seated, guy3 76–79% behind gal2, boat keel in the water) — all "by plan design" verdicts stand; the full
`POSSIBLE FAULTS` lines and close-ups are in `plans/qwen/renders/013-watasu-ferry/report.txt`.

### Checks (real last lines, this round)

- `node --check src/effects/vignettes/q-ferry.js` → (no output)
- `npm test` → `content check ok: 851 cards (278 kanji, 573 words), 1 enabled deck(s), 1670 audio clips`,
  `0 pair(s) at or above 0.72`, `recipe check ok`
- `node scripts/check-piece-costs.mjs vignette "^q-ferry$"` → `693 recipes, 0 cost mismatches`
- the inspect run above → exit 0, `## Goals: 17 of 17 PASS`
- `node scripts/orbit.mjs w1444610 --times 0.5,3.4,6.2 --out plans/qwen/renders/013-watasu-ferry.jpg` →
  `plans/qwen/renders/013-watasu-ferry.jpg (looking at 0.38,0.28,-0.27)`

Render: the same six views as round 2 (deterministic scene — the re-render is byte-identical). A child sees the
story in order: woman waiting on the far bank (t+0.5) → seated in the boat while he poles from the back (t+3.4) →
stepping out on the near bank and waving (t+6.2). The only open visual is still the baked-in red oar in the
Kenney hull (round-2 finding; needs a re-prepped model, not a scene fix).
