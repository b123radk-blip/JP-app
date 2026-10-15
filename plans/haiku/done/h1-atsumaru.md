# Report: h1-atsumaru

## What I changed
- New file `src/effects/vignettes/q-gather.js`: scene `q-chicks-gather` (girl `gal2` at ADULT scale, bowl held in her left
  hand with grip + hold, right hand dips and throws, `grass` patch named `grass`, six `chick` models, two "!" labels).
- `src/effects/vignettes/index.js`: registered `QGA`.
- `src/effects/vcat-q5a.js`: catalog entry `'q-chicks-gather': VM(41, ..., ['gal2', 'chick'])`. The 41 is the draw-call
  argument; the catalog adds 4 on top, so it declares 45, which matches what is built (45).
- `content/cards/96c6.json`: `effect.vignette` = `{ "type": "q-chicks-gather" }` added; nothing else in the card changed.
- Render pictures in `plans/haiku/renders/` (`h1-atsumaru.jpg`, `h1-atsumaru/`).

## Where I left the plan, and why
- Chick start: 0.52u from her centre -> 0.72u (x and z), so that at the start at most 1 chick is within 0.25u of her box.
  The goal cannot hold with starts on a 1.1u patch: her box is 0.37u wide and 0.54u deep, and a chick box is about 0.2u wide.
- Grass patch: radius 0.55u -> 0.7u (1.4u across, the plan said about 1.1u). Chicks start just outside it and walk in.
- Ring: 0.24u -> 0.34u from her centre (the plan said about 0.2u). With six chicks at 0.24u their boxes overlap at the ring.
  The ring angles avoid the front of her legs (slots at 20, 330, 290, 250, 210, 170 degrees; none in front).
- Start positions and the chick -> ring mapping (`RING_OF`) were changed: with the first mapping two chicks walked through
  each other at about t+3 (measured as SUNK INTO), and a chick path ran through her box.
- Chick height: on the grass 0.03u up (the grass top); off the patch on the ground line. Before this, the chicks that
  started off the patch floated 0.03u above the ground line (measured as FLOATS ABOVE).
- Bowl hold distance (`rB`): 0.03u -> 0.045u. The bowl's lower edge was passing into the top of her left fist (measured as
  PASSES INTO FistL, 7 skin points). This is one number change, one try; the next run passed.
- Full inspection moments: the plan gave no `--times`, so I used 1, 2.5 and 4.5 s (plus `--scan 0.25 --loop 7`).

## Checks (paste the real last lines of each)
```
$ node --check src/effects/vignettes/q-gather.js  (and index.js, vcat-q5a.js)   -> no output
$ npm test
# tests 64
# pass 64
# fail 0
content check ok: 838 cards (265 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 838 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
$ node scripts/check-piece-costs.mjs vignette "^q-chicks-gather$"
676 recipes, 0 cost mismatches
$ node scripts/orbit.mjs 96c6 --times 1,2.5,4.5 --out plans/haiku/renders/h1-atsumaru.jpg
plans/haiku/renders/h1-atsumaru.jpg (looking at 0.33,0.04,-0.01)
```

## What I see in the render (each of the six views, one line each, and any fault left)
- front: at t+1 the girl throws grains from her right hand over the patch; chicks at the rim; at t+4.5 the chicks are gathered at her feet with two "!" tags.
- right side: the bowl sits at her left chest; chicks gather at her feet from t+2.5; no visible passing through.
- top: chicks come in from all round and stand in a ring; grains lie on the grass; at t+4.5 they are crowded on the back-right of the ring.
- back-left: the chicks cluster at her feet by t+2.5 and the "!" tags show at t+4.5.
- front-right: the chicks pile up close together at her feet at t+2.5 and t+4.5 (close, touching); no sinking measured.
- low front: the grass patch is visible; chicks are on it at t+2.5 and t+4.5.
- Faults left that I can see: the chicks look crowded at the ring (they touch at t+4.5); the girl's head is cut off by the top of the whole-scene frames (camera framing only). I did not look at the throw and the peck in motion beyond the frames above.
- Not checked: the headset itself (cannot test here); the hand motion of the throw and peck at real speed.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (`--scan 0.25 --loop 7 --times 1,2.5,4.5`):
```
## Goals: 7 of 7 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
  no measured faults at any moment
  (no fault close-ups: no measured faults)
  (no people close-ups: no fault names a person or animal; --people adds them)
```
No POSSIBLE FAULTS are listed. The chicks touch the grass while gathered and do not sink into each other on the last run.

## Inspection rounds
- R1 (`--quick`, original layout): Goals 5 of 7 PASS. FAIL: at the start, 5 of 6 chicks within 0.25u of her; nothing passes through her (bowl into FistL).
- R2 (`--quick`, chick start / ring / mapping / grass radius changed): Goals 6 of 7 PASS. FAIL: nothing passes through her (bowl into FistL). Faults: two chicks FLOAT ABOVE the ground line off the patch.
- R3 (full, `--times 1,2.5,4.5`, chick height changed to 0.03u on grass only): Goals 6 of 7 PASS. Faults: the bowl PASSES INTO her left fist (t+1, t+2.5, t+4.5).
- R4 (`--quick`, `rB` 0.03u -> 0.045u): Goals 7 of 7 PASS. No faults.
- R5 (full run with pictures, plus orbit): Goals 7 of 7 PASS. No measured faults.
