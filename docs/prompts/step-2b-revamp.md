# Step 2b prompt: revamp — a scene of its own for every kanji

Continue the Kanji Memory WebXR app in b123radk-blip/JP-app on branch `claude/kanji-3d-galaxy-xr-uoi522` (GitHub Pages
serves it; no new branch, no PR). Read CLAUDE.md, docs/ARCHITECTURE.md and docs/BATCH-LOG.md first and follow them.

## Why
The user went through about 50 cards in the headset. Some got "wow, that's really good"; the next one often got
"that kinda looks the same as the other one". The cause is the recipe system itself: 150 kanji built from one shared set
of pieces (a material, a sky, an emblem beside the kanji, an idle motion) look like variations of one card, even when the
similarity check passes. An emblem sitting next to the kanji is a label, not a memory.

**Goal: every kanji gets its own short scene that acts out its meaning**, a small story with a beginning and an end, and the
kanji's strokes take part in it. The user's example: 上手 (skilled) is not a waving hand; a hand swings a hammer and drives
a nail cleanly into a board. 下手 (unskilled) is the same set-up and the nail bends over, or the hammer hits the thumb. The
same goes for every card: 閉 a gate sliding shut is good; 計 a clock emblem beside it is not.

Use judgement, card by card: **"Would someone who has never seen this kanji guess its meaning from the scene alone?"**
If yes and it is unlike every other card, keep it. If not, build a scene. Being practical is allowed (two kanji may share a
prop: a hand, a board), being samey is not (no two kanji share the same action).

## Scope
- The 150 kanji added in Step 2 (`scripts/data/kanji-plan.json`, `n5`) and the 177 word cards that use them.
- Plus 上手 / 下手 (the user's example; Step 1 words) as the pilot.
- Step 1's 112 kanji are a later pass with this same prompt (log what carries over).
- Card ids, meanings, readings, sentences and deck order do not change. Only `effect` (and `mnemonic` when the new scene
  tells a better story) changes.

## How to build it
1. **A scene slot.** Add `"vignette"` to the recipe (`{ "type": "hammer-nail", "outcome": "bend" }`). A vignette is a module
   in `src/effects/vignettes/` with a timeline of beats:
   - Set-up while the strokes draw.
   - The action once the kanji is complete.
   - A settle, then the loop.

   Each module gets a shared helper (`timeline(t, beats)` with easing) and the shared props kit, and must:
   - Run deterministically from `ctx.idle` / the reveal (`seek(t)` must give the same frame).
   - Declare its cost in the catalog, and stay within the budget (160 dc, 2000 p, 3 lights).
   - Be a file of about 300 lines.

   Several small vignettes may share a file by theme (`hands.js`, `weather.js` ...).
2. **Props kit first.** Many kanji need the same few actors.

   Build each actor once, well, and look at it on a contact sheet before using it widely:
   - An articulated hand that can grip, point, push and wave.
   - A simple person: a capsule body with a head, arms that move, and a walk cycle.
   - Hammer, nail, board, door, box, cup, book, ball, car, bird.

   Primitives and extrudes only (no model files, no CDNs). A prop kit lives in `src/effects/pieces/` like the emblems.
3. **The kanji is in the scene, not beside it.** Strokes can be the stage:
   - The bottom stroke of 上 as the ground.
   - 門 as the doorway the person walks through.
   - 力 bending under a weight.

   The existing stroke offsets (`ctx.so`), part motions and reveal pivots allow this. Prefer it whenever the shape suggests it.
4. **Words.** A word card gets a scene when its meaning is more than its kanji side by side. 上手 / 下手 are the model:
   - One set-up, two outcomes.
   - Use a vignette option, never a copy of the kanji's scene.

   Words whose meaning *is* their kanji (今日, 毎週) may keep a word rule, but the rule must not just repeat a kanji's
   emblem.

   Kana-only and plain-kanji words are out of scope unless one of these kanji is in them.
5. **Similarity check.** Two cards with the same vignette type are look-alikes whatever else differs; different
   vignette types do not count as a match on the other slots. Update `src/effects/similarity.js` and its test so a scene
   card is compared by its scene.

## Work, in this order (each step leaves `npm test` green; commit and push after each)
1. **Triage.** Grade all 150 kanji and the 177 words on frame strips (`node scripts/look.mjs ids --times 1,3,6`):
   - A: distinct and readable; keep.
   - B: a better existing piece or a tweak fixes it.
   - C: needs a scene.

   Write the list, with one line per C card saying the scene, into `docs/REVAMP.md`. This file is the progress
   checklist; later sessions continue from it. Expect most cards to be C.
2. **Framework + pilot.**
   - Build the vignette slot, the timeline helper, the hand, the hammer / nail / board.
   - Make 上手 / 下手 and five C kanji of different kinds (an action, an object, a quality, a direction, an abstract one).
   - Frame strips of each; fix until each one reads at a glance.
   - Commit, push, and stop to report. Send the pilot strips, so the user can check them in the headset before the rest
     is built that way.
3. **Batches of about 25 kanji with their words.**
   - Scene, mnemonic if needed, frame strips, fixes.
   - Tick them in `docs/REVAMP.md`, then commit and push.
   - Keep new props generic enough for the next batches.
4. **Review.** One contact sheet plus frame strips of every changed card; 0 pairs >= 0.72; `npm run e2e` (cost check for
   every card); `node scripts/check-piece-costs.mjs`.
5. **Docs.** CLAUDE.md (the vignette slot, the props kit, how to add a scene), ARCHITECTURE.md, the BATCH-LOG entry
   (cards changed by grade, props built, what to carry into Step 1's kanji and into N4), and update
   `docs/prompts/step-3-n4.md` so N4 is designed as scenes from the start.

## Already fixed before this step
- 一 drew far too big (kanji were scaled by height, and 一 has almost none). They are now capped at `LAYOUT.glyphMaxAspect`
  glyph heights wide. Check other flat or thin glyphs (一 ー 丶) in any new scene.

## Constraints
Same as CLAUDE.md:
- Files about 300 lines; tunables in `src/config.js`.
- Effects deterministic for `seek()`; no runtime CDNs.
- Never claim headset behaviour.

Scenes must read from the learner's seat: actors at least about a glyph-height tall, the action within about 1.5 glyph
widths of the kanji, high contrast, nothing faster than about 0.3 s. If the session runs short, finish fewer cards
completely (built, looked at, ticked, pushed), never many half-way; `docs/REVAMP.md` says where the next session starts.

## Final message
- What exists.
- Numbers: cards by grade A/B/C, scenes built, props built, cards changed, look-alike pairs.
- Three or four example cards: scene beats and mnemonic.
- What still needs the user: a headset look at the pilot and at the new scenes.
- Where the next session continues in `docs/REVAMP.md`.
