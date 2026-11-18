# Report: 026-kagi-key-flash

(Rounds 1 and 2 of this plan ended without a report - their only record is the `Qwen (flash): ... round 1/2 pi log`
commits, which left the scene built but 3 goals failing. This file is the report of the finished card, with round 3
described in full.)

## What I changed

Rounds 1-2: `src/effects/vignettes/q-key-door.js` replaced the stub with the scene as the plan draws it (frame, room
light panel, hinged door with knob and lock disc, one `solidProp` gold key pivoted at the blade's tip, `guy3` at the
door, `grip('L', ...)` every frame, `burst` for the glint and the click), and the catalog line in
`src/effects/vcat-qw.js` was left as given.

Round 3, all in `src/effects/vignettes/q-key-door.js` (nothing else but one number in `src/effects/vcat-qw.js`):

- **The grip** (`his hand stays on the key`, `nothing passes through him`): with the palm pressed against the bow's flat
  side at the plan's `r = 0.012u`, the fist's skin points fell inside the gold key's box (7 points near `FistL`, t+3.5 to
  t+5.5) and the hand measured 0.08u from the key at t+2.5. As the plan's own hint says ("move the grip point out from the
  bow (radius + r) or turn the palm"): the grip point is now the bow's middle, `toward` is straight down (the palm presses
  the bow's top edge from above, the ring hangs out under the fist instead of the fist closing round the ring), and
  `r = 0.036 * u`. Hand on the key: 0u at every moment; no skin point inside the key anywhere in the loop.
- **The timing** (`the key's blade is in the lock`, `the door swings open`, `the key shows big`): the beat table is now
  `turn: [1.85, 0.45], open: [2.9, 0.9], out: [3.32, 0.5], shut: [5.4, 1], back: [6.4, 1.6]` (was `open: [3.05, 0.5],
  out: [3.05, 0.4]`). The door starts swinging at 2.9 and slowly, so it is already past the goal's 0.06u at t+3.1 while
  the key stays in the lock until 3.3 (it was pulled out at 3.05 and measured 0.44u from the lock at t+3); it is fully
  open at 3.8 and the nod moved with it (3.8-4.3, undone 4.9-5.4, still inside the plan's 3.3-5.4 window).
- **Drawing the key out**: `bow.lerp(lower, T.out)` instead of `bow.addScaledVector(nrm, 0.1u * T.out)`. The door's face
  normal points into the room once the door has swung inward, so pulling the key "out of the lock" along it put the key
  behind the swung panel and the room light: 0% size at t+3.5. Now his hand takes the key out of the lock toward his own
  chest and down to (0.70, 0.40, 0.12), which keeps it silhouetted against the lit doorway (1-2% as big as the kanji).
  The now-unused `down` beat and two spare vectors were dropped, and the file's beat-by-beat header comment was rewritten
  to match.
- **Cost**: the catalog line is `VM(pdc('guy3') + 7, ...)`, not `+ 6`. The scene builds 7 meshes (frame, room light,
  door, lock, key, glint, click) and `check-piece-costs` reported `built 17 / declared 16`.

## Where I left the plan, and why

Only the three things above: the grip radius and palm direction, the exact seconds of the door/key beats, the direction
the key travels when it leaves the lock, and the catalog cost. The door still swings inward away from the learner, the
blade still goes straight in along the door's back direction with the tip 0.01u inside, the click is still at 2.3, the
door still shuts at 5.4-6.4 and the loop ends where it started. The key cannot be drawn out along the blade *and* stay
visible after the door has swung inward, so the hand carries it toward himself instead - a child still sees "key out of
the lock, door open".

## Checks (paste the real last lines of each)

`node --check src/effects/vignettes/q-key-door.js` and `node --check src/effects/vcat-qw.js`: nothing.

`npm test`:

```
ℹ tests 64
ℹ pass 63
ℹ fail 0
content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```

`node scripts/check-piece-costs.mjs vignette "^q-key-door$"`:

```
701 recipes, 0 cost mismatches
```

`node scripts/orbit.mjs w1260490 --out plans/qwen/renders/026-kagi-key-flash.jpg`:

```
plans/qwen/renders/026-kagi-key-flash.jpg (looking at 0.31,0.05,0.05)
```

`node scripts/inspect.mjs w1260490 --goals plans/qwen/goals/026-kagi-key-flash.json --loop 8 --times 0.5,2,3.5 --out
plans/qwen/renders/026-kagi-key-flash`:

```
## Goals: 10 of 10 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS he holds the key by its bow at first (t+0 to t+1): 3 moments, e.g. t+0: 0u apart (needs ≤ 0.04)
  PASS his hand stays on the key while it goes in and turns (t+1 to t+3.4): 5 moments, e.g. t+1: 0u apart (needs ≤ 0.04)
  PASS the key's blade is in the lock (t+1.85 to t+3.3): 3 moments, e.g. t+2: 0u apart (needs ≤ 0.01)
  PASS the door swings open (t+3.1 to t+5.4): 4 moments, e.g. t+3.5: 0.13u apart (needs ≥ 0.06)
  PASS the door is shut at first (t+0 to t+2.2): 5 moments, e.g. t+0: 0u apart (needs ≤ 0.03)
  PASS nothing passes through him (his hand against the key's bow, never through the door): 16 moments, e.g. t+0: nothing passes into it
  PASS the learner sees him: 16 moments, e.g. t+0: 100% visible (needs ≥ 85)
  PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the key shows big: 16 moments, e.g. t+0: shows 2% as big as the kanji (needs ≥ 1)
  PASS the door shows big (t+0 to t+2.2): 5 moments, e.g. t+0: shows 101% as big as the kanji (needs ≥ 40)
```

Round 3 started at `Goals: 7 of 10 PASS` (the watcher's number, reproduced here) and ends at `10 of 10 PASS`.

## What I see in the render

- front t+0.5: the man stands left of his shut door, the gold key in his left hand, bow under his fist, blade pointing at
  the door. Nothing sunk or floating; feet on the floor line.
- front t+1.5: the key moved to the lock, his arm bent toward the door, the blade level with the keyhole.
- right side t+0.5 / t+1.5: the door seen from its hinge side; the warm panel shows beside it here - only the review
  camera sees it from this angle, the learner's seat has it hidden behind the shut door (tiles 3 and 6 of `overview.jpg`).
- top t+0.5 / t+1.5: the door's top edge, the lit strip behind it, the man's head; no overlap.
- back-left t+0.5 / t+1.5: his back, the key sticking out toward the door on his left, no clipping.
- front-right t+0.5 / t+1.5 and low front: the key clearly between his fist and the door, the frame and door standing on
  the ground line.
- Nothing floats, nothing sinks, nothing passes through anything; the only thing the learner cannot see is the lock disc
  (0% visible at t+3.5, behind the swung door), which is fine - the plan wants the key *in* it while the door is shut.

## Inspection (the POSSIBLE FAULTS lines of the last run)

```
## The whole loop, every 0.5 s from t+0 to t+7.5 (numbers only; the T ids differ from moment to moment)
  no measured faults at any moment
```

`held.jpg` (the key from front, left, right at t+0.5): the fist holds the bow's top edge with the ring hanging out below
it and the blade out the other side; from the left the blade and ring are clear of the fist. The third tile is cropped by
the review camera's framing (only the door's edge and the light), which is not a fault.

`overview.jpg`: at t+0.5 and t+2 the learner sees the man at his shut door with the gold key in his hand (the key reads
2% of the kanji, small but unmistakably a key against the dark door); at t+3.5 the doorway is lit warm and the key
silhouettes against it at his lowered hand. `the door shows big` is the shut door at 101% of the kanji. One note for
Opus: when the door is fully open it is almost edge-on from the seat (26% of the kanji, 47% visible, partly behind the
man), so the "open door" reads mostly as the lit opening plus its dark edge; opening it less far, or turning the whole
door a little more toward the learner, would make the panel itself read.

## Round 3

Started at `Goals: 7 of 10 PASS` with 1 whole-loop fault. Changes: the grip (palm pressing the bow's top edge from above
at `r = 0.036u` instead of the flat side at `0.012u`), the beat times (`open: [2.9, 0.9]`, `out: [3.32, 0.5]`, nod
3.8-4.3), the key's exit path (lerped to his lowered hand instead of out along the door's normal), the header comment,
and the catalog cost `+ 6` -> `+ 7`. Ended at **`Goals: 10 of 10 PASS`**, `no measured faults at any moment`,
`0 cost mismatches`, `npm test` clean.
