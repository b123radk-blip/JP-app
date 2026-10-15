# Report: h11-wasureru

## What I changed
- `src/effects/vignettes/h-forget.js`: scene `q-forgot-umbrella` (the girl, a front door, a stand, a closed umbrella that opens, rain, a thought bubble, the "あっ!" bubble).
- `src/effects/vcat-hb.js`: one catalog line, `'q-forgot-umbrella': VM(pdc('gal2') + 7, ..., ['gal2'])` (check-piece-costs builds 17 draw calls, 0 mismatches).
- `content/cards/5fd8.json`: `effect` = `{"material": "pearl", "backdrop": "sky:twilight", "vignette": {"type": "q-forgot-umbrella"}}`.
- Renders: `plans/haiku/renders/h11-wasureru.jpg` (orbit, times 3,5.4) and `plans/haiku/renders/h11-wasureru/` (inspect pictures, times 1.6,3,5.4).

## Where I left the plan, and why
Each change below is a number or a small structure change made to clear an inspection fault. Please review them.
1. **Door height 0.75 u -> 1.0 u** (frame 1.04). At 0.75 u the girl (0.93 u tall) had her head and shoulders in the lintel.
2. **Door panel swung open** into the house (about 75 degrees on its left hinge), not closed and facing the learner. With a closed panel at z -0.3 she stands in the panel's bounding box while in the doorway.
3. **Step removed.** Her feet sank into it at every moment she stood by the door. The plan's "small step" is not in the scene.
4. **Girl's doorway path:** x 0.6 -> 0.55 (door centre), start and return z -0.3 -> -0.1 (she starts at the threshold, not inside the frame). Her head was in the door's bounding box at z -0.3.
5. **Stand moved from z -0.2 to z -0.3**: her path passed the stand's rod at 0.15 u (arm and head touched it). She grabs from z -0.1.
6. **Umbrella is one mesh** (`name = 'umbrella'`, handle at the origin). Closed and open shapes are two geometries swapped at 5.5 s. The open shape is a snap, not a gradual grow: separate meshes for the rod and the canopy were flagged as "sunk into" each other. The umbrella rests on the stand with its tip on the stand top (0.2 u).
7. **Flip direction:** the umbrella turns about x by -pi, so the rod swings out to her right, away from her body (it passed her torso the other way).
8. **Lift:** handle held at chest height (0.6 u) with the canopy above her head, not "over her head" at arm's length (canopy base at about 1.05 u, under the 1.2 u limit). The lift point is pinned in stage units, not measured from her body, so the fade does not drag her hand to the ground.
9. **Thought bubble** at x 1.0, y 1.08 (plan: over her head). Over the head it overlapped her head top. Its top reaches about 1.26 u, a little above the 1.2 u limit.
10. **Speech bubble** "あっ!" marked as flying (`flies()` on every part), because it hangs in the air on purpose.
11. **Forehead slap target:** `at('eyes', 0, 0.03, -0.06)` (plan: "forehead"), to get the hand within 0.12 u of the head middle.

Goal that cannot pass as written: "she has walked away" uses hips at y 0.45 u. The hips bone is at about y 0.28 u (measured with scratch probes at t+2.5: distances 0.18 to (1.2,0.45,0.1), 0.08 to (1.2,0.25,0.1), so the hips are near (1.14, 0.28, 0.10)). At that height the hips cannot get within 0.12 u of the goal point. I left the goal failing and did not change the walk to chase it. I did not edit the goals file; the scratch probe file is in the scratchpad only.

## Checks (real output)
- `node --check src/effects/vignettes/h-forget.js src/effects/vcat-hb.js`: printed nothing (exit 0).
- `npm test`: `# tests 64`, `# pass 64`, `# fail 0`; `content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips`; `deck n5: 848 recipes (573 words), 0 cards with no recipe yet`; `0 pair(s) at or above 0.72`; `recipe check ok`. Exit 0.
- `node scripts/check-piece-costs.mjs vignette "^q-forgot-umbrella$"`: `679 recipes, 0 cost mismatches`.
- `node scripts/orbit.mjs 5fd8 --times 3,5.4 --out plans/haiku/renders/h11-wasureru.jpg`: exit 0, wrote the sheet.
- Final inspect (`--goals plans/haiku/goals/h11-wasureru.json --scan 0.25 --loop 7 --times 1.6,3,5.4 --out plans/haiku/renders/h11-wasureru`), exit 1 (a goal fails):

```
## Goals: 8 of 9 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
  PASS the kanji stays in view: 30 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the girl stays in view (t+0.8 to t+6): 23 moments, e.g. t+1: 100% visible (needs ≥ 85)
  PASS the girl stands on the ground: 30 moments, e.g. t+0: gal2: touches the ground line (bottom of the kanji)
  PASS the door stands on the ground: 30 moments, e.g. t+0: door (dark brown/brown #5a3a24/#9a6a3a): touches the ground line (bottom of the kanji)
  PASS the umbrella waits in its stand (t+0 to t+4.4): 19 moments, e.g. t+0: umbrella (black/dark brown #2a2a2a/#6a4a2a): touches T3 mesh stand (grey #6a7a8a)
  FAIL she has walked away (t+2.4 to t+2.8): fails at t+2.5 to t+2.75 of 2 moments; t+2.5: 0.18u apart (needs ≤ 0.12)
  PASS she slaps her forehead (t+2.9 to t+3.1): 1 moments, e.g. t+3: 0.11u apart (needs ≤ 0.12)
  PASS she takes the umbrella (t+5 to t+5.8): 5 moments, e.g. t+5: 0.03u apart (needs ≤ 0.05)
  PASS nothing passes through her: 30 moments, e.g. t+0: nothing passes into it
```

## What I see in the render (orbit sheet, times 3 and 5.4)
- front: at t+3 she has walked off past the open door, the umbrella stands in its stand; rain drops fall. At t+5.4 she is at the stand with the umbrella raised beside her; rain is heavier.
- right side: the rod is at her right, rain above; at t+5.4 the handle is in her hand at chest height.
- top: the door panel swings open into the house; at t+5.4 the red end of the umbrella is above her head. I could not confirm from this view that the canopy opens clearly.
- back-left: the door and stand stay clear of her body at both times.
- front-right: the kanji 忘 with its label is in view; the girl is beside the door.
- low front: at t+3 the "あっ!" bubble is above her head.
- Faults left in this sheet: none that I could judge by eye. The open canopy's size is hard to read at this scale, and I could not check the snap-open on the headset.

## Inspection (last full run, POSSIBLE FAULTS lines)
```
  - T4 mesh umbrella (black/dark brown #2a2a2a/#6a4a2a): SUNK INTO T1 model gal2 (gap -0.03u)
  - T1 model gal2 PASSES INTO T4 mesh umbrella (black/dark brown #2a2a2a/#6a4a2a): 14 skin points inside it, near the bones FistR
  - T4 mesh umbrella (black/dark brown #2a2a2a/#6a4a2a): FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.13u)
```
- The first two are the same moment in the fade (about t+5 to t+6.25): the umbrella is in her right hand while she shrinks away. The hand sits about 0.03 u off the handle and the fist touches the handle's bounding box by about 14 points. The fade scales the girl but not the handle radius (`rr` uses full scale), so the grip is slightly too loose as she shrinks. I did not fix it: the inspection rounds were used up.
- The third is the same fade moment. The umbrella floats 0.13 u above the ground because it is in her hand as it shrinks. This is a held prop that the checker does not count as held. Not a real fault, but I did not verify it on a picture beyond the sheet.
- The POSSIBLE FAULTS list for the whole loop (quick runs) also had "FLOATS ABOVE T1 model gal2 (gap 0.03u)" at t+5.25 (the umbrella held in her hand, not counted as held). Same cause.

## Inspection rounds
Up to six were planned. I ran about seven full or quick inspections (one was a probe with scratch goals for the hips). Each line is the Goals line of that run:
1. quick, first build: `3 of 9` (door sank under her feet, closed umbrella sank into the rod, she passed the stand, the thought bubble touched her head).
2. quick, door 1.0 u, doorway x 0.55, step behind the door, one-mesh umbrella with the geometry swap, thought moved: `6 of 9`.
3. quick, step removed, cost re-set to +7: `7 of 9` (the hips, the doorway head contact).
4. full at 1.6,3,5.4 after the bubble flag (did not take effect on the group): `7 of 9`.
5. quick, girl starts and returns at z -0.1, stand z -0.3: `7 of 9` (the hips; a fist in the door's box while she lifts).
6. quick, flip about -pi (rod swings away from her), lift point at local z -0.04: `7 of 9` (the umbrella sank into her during the fade).
7. quick, lift point pinned in stage units: `8 of 9`.
8. final full (times 1.6,3,5.4) with pictures: `8 of 9`, the Goals line above.

I stopped after step 7 because the remaining faults are in the fade and the last goal cannot pass with the hips at 0.28 u.

## Not done
- I could not look at the scene in a headset, and I did not check the snap-open of the umbrella or how the thought bubble reads at headset scale.
- The walk-away goal needs a decision from Opus: either the goal's height changes to about 0.28 u, or the hips point changes.
- The plan's door (0.75 u), step, door position (x 0.6, z -0.3), stand z (-0.2) and bubble position differ from the plan as listed above. Each is a deliberate change to clear a fault; please confirm them on the next render.
