# Report: 022-kagi-key.md

## What I changed
- `src/effects/vignettes/q-key-door.js` (replaced the stub): the scene `q-key-door` — at night a man (`guy3`, ADULT)
  stands at his locked front door (a frame, a warm light panel behind the opening, and a wood door 0.42 × 0.85 × 0.04
  hinged at its right edge, with a knob and a small lock on its face, all in a group turned -π/4). He holds a gold key
  (a `G.torus` bow, radius 0.045u, and a 0.12u blade with two teeth; pivot at the blade's tip) by its bow — every frame
  `grip('L', bow, toward, r)` with the palm against the ring, never the fist round it. Loop 8 s: 0-1.0 Idle, the key
  held up in front of him (a white glint at 0.5); 1.0-1.85 he brings it to the lock, the last of the move along the
  door's back direction so the tip slides straight in (0.01u inside the face by 1.85); 1.85-2.3 he turns it a quarter
  turn (his hand turns with it) and at 2.3 a click (a small yellow star at the lock); 2.3-3.3 the door swings open 75°
  about its hinge onto the warm room, the key drawn back 0.1u along the blade at 2.4 and his hand lowered to
  (0.70, 0.40, 0.12) by 3.0; 3.3-5.4 he looks at the open door and nods, pleased; 5.4-6.4 the door swings shut; 6.4-8.0
  Idle, the key back up in front of him, so the loop ends where it began.
- `src/effects/vcat-qw.js`: the `q-key-door` cost from `pdc('guy3') + 6` (the stub's placeholder) to `pdc('guy3') + 9`
  (frame posts + lintel + room light + door + lock + key + the two bursts). Description and models unchanged.

## Where I left the plan, and why (two number fixes, both verified with `try_value`)
- The man's feet at x 0.44 instead of the plan's 0.56: at 0.56 his body stands between the learner's seat and the key,
  so the key shows 0% as big as the kanji ("the key shows big" FAIL, and at 0.50 too — 0% at t+1.5, and his hand then
  misses the turned key, "his hand stays on the key" FAIL). At 0.44 the key shows 2% and his hand stays on it; all the
  visibility and grip goals hold.
- The grip radius 0.045u instead of the plan's 0.012u: at 0.012 (the ring's tube radius) the man's fist passes through
  the ring ("nothing passes through him" FAIL, 4 skin points inside the key near FistL — his fist is simply larger than
  the ring). At 0.045 the palm rests against the ring's outer band, the fist clear of it.
Everything else is as written: door at x 0.95, z -0.1, turned -π/4; the frame, room light, door, knob and lock; the key's
shape and pivot; the timing beats; the glint at 0.5; the click at 2.3; the door open 75° at 2.3-3.3; the key out at 2.4
and lowered by 3.0; the nod 3.4-3.7; the door shut 5.4-6.4; the key back up 6.4-7.0.

## A goal that fails, and why (the plan and the goal contradict each other)
Goal 3, "the key's blade is in the lock (t+1.85 to t+3.3)", **FAILS** at t+2.5 to t+3 (the blade is 0.08u from the lock).
The plan says "2.3 to 3.3: ... the key coming out of the lock at 2.4 (he draws it back 0.1u along the blade ...)"; the
goal says the blade is in the lock from 1.85 to **3.3**. So the key can be in the lock until 3.3 only if it does not come
out at 2.4 — the two can't both hold. I followed the plan (the key leaves the lock at 2.4) and left the goal failing;
its end time looks like it should be 2.4, when the key actually comes out, not 3.3.

I also tried the other way (keep the key in the lock until 3.3 and open the door only after): that fails goals 2 and 9
instead, because the man's hand reaches the in-lock key only while the door is still shut, and once the door swings the
key hides behind him. The plan's timing is the workable one.

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/q-key-door.js` and `node --check src/effects/vcat-qw.js`: no output.
- `npm test`:
  ```
  ℹ tests 64
  ℹ pass 63
  ℹ fail 0
  content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-key-door$"`:
  ```
  701 recipes, 0 cost mismatches
  ```
- `node scripts/orbit.mjs w1260490 --out plans/qwen/renders/022-kagi-key.jpg`:
  `plans/qwen/renders/022-kagi-key.jpg (looking at 0.27,0.05,0.05)`
- `node scripts/inspect.mjs w1260490 --goals plans/qwen/goals/022-kagi-key.json --loop 8 --times 0.5,2.0,3.5
  --out plans/qwen/renders/022-kagi-key` — the last Goals lines:
  ```
  ## Goals: 9 of 10 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

    PASS he holds the key by its bow at first (t+0 to t+1): 3 moments, e.g. t+0: 0u apart (needs ≤ 0.04)
    PASS his hand stays on the key while it goes in and turns (t+1 to t+3.4): 5 moments, e.g. t+1: 0u apart (needs ≤ 0.04)
    FAIL the key's blade is in the lock (t+1.85 to t+3.3): fails at t+2.5 to t+3 of 3 moments; t+2.5: 0.08u apart (needs ≤ 0.01)
    PASS the door swings open (t+3.1 to t+5.4): 4 moments, e.g. t+3.5: 0.13u apart (needs ≥ 0.06)
    PASS the door is shut at first (t+0 to t+2.2): 5 moments, e.g. t+0: 0u apart (needs ≤ 0.03)
    PASS nothing passes through him (his hand against the key's bow, never through the door): 16 moments, e.g. t+0: nothing passes into it
    PASS the learner sees him: 16 moments, e.g. t+0: 100% visible (needs ≥ 85)
    PASS the learner sees the kanji: 16 moments, e.g. t+0: 100% visible (needs ≥ 95)
    PASS the key shows big: 16 moments, e.g. t+0: shows 2% as big as the kanji (needs ≥ 1)
    PASS the door shows big (t+0 to t+2.2): 5 moments, e.g. t+0: shows 131% as big as the kanji (needs ≥ 40)
  ```

Rounds (goal counts from `check_goals`, loop 8):
- Initial build, following the plan's timing (man x 0.44, grip 0.045u): **9 of 10 PASS** — FAIL "the key's blade is in
  the lock" at t+2.5-3.0 (the plan draws the key out at 2.4; see above).
- Keeping the key in the lock until 3.3 (door opens only after, `open [3.3, 0.25]`, key out and lowered 3.3-3.5):
  **8 of 10 PASS** — FAIL "his hand stays on the key" (0.06u at t+2.5-3.0, the hand only reaches the turned in-lock key
  while the door is shut) and, until the key reached the lowered spot, "the key shows big" (it hid behind him at t+3.5).
- Back to the plan's timing (the working state above): **9 of 10 PASS**.

## What I see in the render (each of the six views, one line each, and any fault left)
Orbit sheet `plans/qwen/renders/022-kagi-key.jpg` (t+0.5 and t+1.5 each):
1. front: the man stands by the kanji holding the gold key up in front of him, the door shut to his right; at t+1.5 the
   key is at the lock.
2. right side: profile — the door edge-on with the warm light glowing behind it, the man on the near side at the lock.
3. top: from above, the man and the door (the light panel glowing through the opening).
4. back-left: his back, the key in his hand toward the door on the far side, the kanji behind.
5. low front: both beats from below; he reads as a man at a door with a key.
6. front-right: the same story at a shallower angle; no body or prop faults in any view.

The learner-seat views (overview tiles 3/6/9) read as the plan wants: at t+0.5 he holds the key up at the shut door;
at t+2 the key is in the lock; at t+3.5 the door is open and the warm light comes through the doorway. A child would see
a man putting a key in a lock, turning it, and a door opening onto a lit room.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (`--times 0.5,2.0,3.5`, loop 8):
- t+0.5 and t+3.5: `T3 mesh lock (black #101010): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.42u)` — the
  lock is a keyhole on the door's face at y 0.44, so it is meant to be up there, not on the ground. Intended.
- t+6: `T7 mesh room light (skin #ffd27a): SUNK INTO T2 mesh door (...) (gap -0.85u)` — the warm light is a panel behind
  the opening (z -0.12) and the door swings into the room on its hinge, so while it is closing their boxes cross. It is
  meant to glow through the opening; the close-ups (faults tiles 3-4) show the light correctly behind the door. Left as-is.
- t+2: no measured faults (the key's tip touches the lock).

Whole-loop scan (every 0.5 s): only the two lines above repeat (the lock "floats" all along except t+2.0, where it touches
the key; the room light crosses the door at t+6). No body passes into anything, and the learner sees the man 100% and
the kanji 100% at every moment.
