# Report: h7-hatsu
## What I changed
- `src/effects/vignettes/h-launch.js`: scene `q-rocket-launch` (replaced the empty SCENES). Pad (`pad`, grey disc r 0.2u), rocket (`rocket` mesh: white body, red nose, three red fins, blue window; `flame` child, flies), countdown 3/2/1 (dark round label + white number, 0.5-2.0 s), smoke burst (10 puffs, 2.0-2.4 s), smoke trail (12 puffs left at the rocket's base as it passes), lift-off 2.4-4.5 (base height = 0.05 + 0.5 * smoothstep), shrink and rise out of view 4.5-5.0, growth back out of the pad 6.2-7.0, boy `guy2` (KID) at x 0.55 z 0.25 turned to the rocket, both arms raised 3.0-4.4 (IK to above the head), one jump 3.1-4.0 (group offset 0.12u), bubble わーい! 3.2-4.4.
- `src/effects/vcat-hb.js`: one line, `'q-rocket-launch': VM(pdc('guy2') + 13, ..., ['guy2'])`. The first try used +19; the check reported built 23 vs declared 29, so I set +13 (cost fix, no scene change).
- `content/cards/767a.json`: `effect` set exactly to the plan's recipe.
- Renders: `plans/haiku/renders/h7-hatsu.jpg` (orbit, times 2.2,4.1) and `plans/haiku/renders/h7-hatsu/` (inspect, times 0.5,2.2,4.1).
- No inspection-driven changes were needed: no number was changed after the first inspection.

## Where I left the plan, and why (or "Nowhere")
- The flame is a child of the rocket and starts at the rocket's base, so its box overlaps the rocket's bottom (see the inspection). Any flame at the nozzle has to do that, because the pad top is the rocket's base. I kept the plan's flame (2.0-2.4 s only, as written) and did not move the rocket off the pad.
- Bubble centre is at x 0.68 u, so its left edge reaches about x 0.5, inside the plan's 0.45 to 1.4 band. It stays in view.
- The boy's jump is a group offset (no Jump clip), so it is a simple hop.

## Checks (paste the real last lines of each)
- `node --check src/effects/vignettes/h-launch.js` and `node --check src/effects/vcat-hb.js`: both printed nothing.
- `npm test`: last lines
```
# tests 64
# suites 0
# pass 64
# fail 0
...
content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 848 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```
(exit 0, no FAILED)
- `node scripts/check-piece-costs.mjs vignette "^q-rocket-launch$"`: `679 recipes, 0 cost mismatches`
- `node scripts/orbit.mjs 767a --times 2.2,4.1 --out plans/haiku/renders/h7-hatsu.jpg`: exit 0, wrote the jpg.
- `node scripts/inspect.mjs 767a --goals plans/haiku/goals/h7-hatsu.json --scan 0.25 --loop 7 --times 0.5,2.2,4.1 --out plans/haiku/renders/h7-hatsu`: exit 0.
- Extra, not in the plan: `node scripts/look.mjs 767a --times 0.75,1.25,1.75,2.1` to check the countdown numbers (they are not in the inspect sheets at those times). The frames show 3, 2, 1, and the flame at 2.1.

## What I see in the render (each of the six views, one line each, and any fault left)
Orbit sheet, times 2.2 and 4.1:
- front: 2.2 the rocket stands on the pad inside a smoke cloud, the boy stands to its left; 4.1 the rocket is high at the top right, the boy has both arms up, bubble わーい! shows (its top edge is cut by the tile).
- right side: 2.2 smoke round the pad with the kanji's strokes behind; 4.1 the rocket is up, a trail of puffs under it.
- top: pad and smoke, the boy beside the pad; the rocket leaves a puff trail at 4.1.
- back-left: rocket on the pad in smoke at 2.2; at 4.1 it is higher, the boy is beside it.
- front-right: the rocket on the pad, the boy to its left, the kanji in the background; at 4.1 the rocket is high, bubble above the boy.
- low front: at 2.2 the rocket is small on the pad; at 4.1 it is higher with the bubble.
- Faults left: the flame and the rocket's base overlap (by design, see above); the rocket and the boy's jump are in the air on purpose (see below).

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last run (full, `--times 0.5,2.2,4.1`), its Goals line verbatim:
```
## Goals: 8 of 8 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
```
Each goal PASS (last run): kanji in view 100% (needs ≥ 95); boy in view 100% (≥ 85); boy on the ground t 0-2.9; pad on the ground; rocket on the pad t 0-1.9; rocket high up t 4-4.3 (0u apart, needs ≤ 0.15); boy's right hand near his head t 3.3-4 (0.12u, needs ≤ 0.2); nothing passes through him.

POSSIBLE FAULTS in the last run:
```
  - T2 mesh rocket (blue/red #3a8cff/#e03030): SUNK INTO T3 mesh flame (orange #ffa030) (gap -0.09u)     [t+2.2]
  - T2 mesh rocket (blue/red #3a8cff/#e03030): FLOATS ABOVE T1 mesh pad (grey #9aa2ae) (gap 0.27u)       [t+3.5]
  - T7 model guy2: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.12u)                        [t+3.5]
  - T2 mesh rocket (blue/red #3a8cff/#e03030): FLOATS ABOVE T1 mesh pad (grey #9aa2ae) (gap 0.45u)       [t+4.1]
```
- Rocket SUNK INTO flame (-0.09u at 2.2): the flame is a skirt under the nozzle, so its box meets the rocket's bottom. Visually the flame sits round the base under the smoke, which is what the plan asks for. Left as is; Opus may decide whether the flame should be drawn lower.
- Rocket FLOATS ABOVE the pad (0.27u at 3.5, 0.45u at 4.1): it lifts off on purpose (plan 2.4-4.5).
- Boy FLOATS ABOVE the ground (0.12u at 3.5): the jump 3.1-4.0 that the plan asks for.
- The whole-loop scan (quick run, every 0.25 s) gave the same list.

## Inspection rounds
- Round 1 (`--quick`, `--scan 0.25 --loop 7`): `## Goals: 8 of 8 PASS (checked at every moment measured; a goal passes only if it holds at all of them)`. Faults: flame overlap at 2.25 (-0.11u), lift-off and jump as above. No change.
- Round 2 (full, `--times 0.5,2.2,4.1`, plus orbit): `## Goals: 8 of 8 PASS (checked at every moment measured; a goal passes only if it holds at all of them)`. Same faults. No change.

Not done: nothing was run in a headset. The countdown and cheer were checked only in the desktop renders.
