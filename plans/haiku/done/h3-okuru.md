# Report: h3-okuru

## What I changed
- New scene `q-send-letter` in `src/effects/vignettes/q-send.js`: the girl (gal2) at x 0.35u and the boy (guy2) at x 1.2u,
  both ADULT, facing each other and a little toward the learner. The letter is a white envelope with a red heart seal,
  a flap on its own pivot, and two wings on their own pivots that flap in the air. The envelope mesh is named `letter`
  and so is its group. A dotted trail (12 dots) follows the flight; kiss hearts use `hearts()`, the big heart uses `pop()`.
- Registered in `src/effects/vignettes/index.js`.
- Catalog entry in `src/effects/vcat-q5c.js`: `VM(pdc('gal2', 'guy2') + 7, ..., ['gal2', 'guy2'])`.
- `content/cards/9001.json`: added `"vignette": { "type": "q-send-letter" }` inside `effect`; the existing keys stay.
- Changes made during inspection (details in "Where I left the plan"): the letter faces the learner, the boy turns his
  palm forward after the catch, and the letter is lifted 0.06u above the fist.
- Pictures: `plans/haiku/renders/h3-okuru.jpg` (orbit, six views) and `plans/haiku/renders/h3-okuru/` (faults, overview,
  people, learner's seat, the scene at t 0.5 / 2.5 / 4.5 / 6.2, and one close look `look-0.7_0.9_0.05-front-t2.5.jpg`).

## Where I left the plan, and why
- The plan puts the letter flat on her right palm and has him catch it palm up. Flat on a palm, the envelope is seen
  edge-on from the learner's seat (a thin white stick) and its flap cannot be seen opening. So her palm is behind the
  letter and the letter stands in front of it, facing the learner. His palm is up for the catch (3.6-4.0 s) and turns to
  the front during 4.0-4.4 s, so the flap opens facing the learner. This changes the pose design, not only a number:
  Opus should look at it.
- The letter is held 0.06u above the fist, so the palm holds its lower edge. Without the lift her forearm passed into the
  envelope (inspection round 3). For the boy the lift applies only once his palm faces the front.
- The card already has `"emblem": "letter"` in its effect (not part of this plan). It draws a second, large cream
  envelope beside the kanji, next to the scene's letter (seen in the close look and in the orbit sheet). I did not
  remove it because the plan says to change only `effect.vignette`. Opus should decide whether to drop the emblem.
- The plan gives no inspection times; I used 0.5, 2.5, 4.5, 6.2.
- The goals file was not edited.

## Checks (paste the real last lines of each)
- `node --check` on `src/effects/vignettes/q-send.js`, `src/effects/vignettes/index.js`, `src/effects/vcat-q5c.js`: printed nothing.
- `npm test` (final code):
  ```
  # pass 64
  # fail 0
  content check ok: 838 cards (265 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
  deck n5: 838 recipes (573 words), 0 cards with no recipe yet (default animation)
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-send-letter$"`: `676 recipes, 0 cost mismatches`

## What I see in the render (the six orbit views; one line each, and any fault left)
- front: the girl holds the letter facing the viewer at chest height (t 0.5); the letter is high over the girl's head in the
  flight (t 2.5); the boy holds it on his palm with a small heart above (t 4.5); at t 6.2 it is fading on his palm.
- right side: the two actors seen from the side and behind; I saw no body passing through the other or through the letter.
- top: flat view along the ground line; the actors and the letter sit on the ground line; nothing sinks through the floor.
- back-left: the flight is visible only faintly from this side; no body passing through anything.
- front-right: the kanji with the letter between it and the boy; the meaning label is not covered.
- low front: the letter is visible in her hand and his; the boy's arm reaches to the letter.
- Faults left: none that I could see in these views. The card's own envelope emblem (above) is a second letter, which is a
  visual problem. The kiss at the lips was not examined close up.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (`--times 0.5,2.5,4.5,6.2`). Goals line:
```
## Goals: 11 of 11 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
```
POSSIBLE FAULTS lines:
```
  - T3 mesh letter (red/white #d82020/#faf6ea): SUNK INTO T4 mesh white #f1ead8 (gap -0.11u)
  - T4 mesh white #f1ead8: SUNK INTO T3 mesh letter (red/white #d82020/#faf6ea) (gap -0.05u)
```
Both are the envelope and its closed flap, which lies over the front of the envelope by design. Fine.

## Inspection rounds
1. quick, first code (letter mesh not named): 8 of 11 PASS; the three letter goals failed with "letter is not in the scene".
2. quick, envelope mesh named `letter`: 11 of 11 PASS. Whole loop: the right wing "FLOATS ABOVE" (the wings belong to the letter, which rests in her hand; they stick out past the palm).
3. quick, letter faces the learner and the boy turns his palm forward: 11 of 11 PASS. New fault: the girl's arm PASSES INTO the letter (near FistR).
4. quick, letter lifted 0.06u above the fist (both hands): 10 of 11 PASS. The boy's letter was 0.1u from his hand at t+4 (the lift still applied while his palm was up).
5. quick, lift applied only once his palm faces the front: 11 of 11 PASS. Only the flap "SUNK" fault (closed flap, by design).
6. full run with pictures: 11 of 11 PASS; POSSIBLE FAULTS as above. The wing "FLOATS ABOVE" is not listed in the last run.

## Not done / not checked
- No headset or real Chrome run; these are headless renders and inspection only.
- The kiss at the lips was not examined close up; only the goals cover its timing.
- The emblem duplicate (see above) is left for Opus.
