# Report: h16-fuyu

## Goals: 7 of 9 PASS

```
  PASS the kanji stays in view: 30 moments, e.g. t+0: 100% visible (needs ≥ 95)
  FAIL the girl stays in view: fails at t+2.75 of 30 moments; t+2.75: 78% visible (needs ≥ 85)
  PASS the girl stands on the snow: 30 moments, e.g. t+0: gal2: touches T1 mesh snowfield (white #eef4ff)
  PASS the snowman's body sits on the snow (t+2.4 to t+7): 19 moments, e.g. t+2.5: snowbody (white #ffffff): touches T1 mesh snowfield (white #eef4ff)
  PASS the snowman's head sits on its body (t+3.4 to t+7): 15 moments, e.g. t+3.5: snowhead (white #ffffff): touches T2 mesh snowbody (white #ffffff)
  PASS the snowman shows big (t+2.4 to t+6.3): 17 moments, e.g. t+2.5: shows 36% as big as the kanji (needs ≥ 8)
  PASS the snowman is not hidden (t+2.4 to t+7): 19 moments, e.g. t+2.5: 100% visible (needs ≥ 85)
  PASS her hands are on the head as she lifts it on (t+2.7 to t+3.3): 3 moments, e.g. t+2.75: 0u apart (needs ≤ 0.06)
  FAIL nothing passes through her: fails at t+0 to t+3, t+4 to t+5.5 of 30 moments; t+0: model gal2 PASSES INTO mesh red #d02828: 7 skin points inside it, near the bones Head; t+2.25: model gal2 PASSES INTO mesh red #d02828: 5 skin points inside it, near the bones Head; t+2.5: model gal2 PASSES INTO mesh snowhead (white #ffffff): 61 skin points inside it, near the bones LowerLegL, FistL
```
(Goals line of the final full run, `.cache` output saved as `plans/haiku/renders/h16-fuyu/report.txt`. The two FAIL goals are listed under Inspection.)

## What I changed
- `src/effects/vignettes/h-winter.js`: the scene `q-snowman` (about 95 lines), replacing the empty `SCENES`.
- `src/effects/vcat-hb.js`: one catalog line, `'q-snowman': VM(pdc('gal2') + 10, ...)`, models `['gal2']`. The built cost is 20 draw calls and the declared cost is 20.
- `content/cards/51ac.json`: `effect` set to exactly the plan's recipe (material ice, backdrop sky:snow, particles snow, vignette q-snowman). The rest of the file is unchanged (round trip checked).
- Renders: `plans/haiku/renders/h16-fuyu/` (full run at t 1.2, 3.0, 4.8: `faults.jpg`, `overview.jpg`, `people.jpg`, `report.txt`, per-fault close-ups) and `plans/haiku/renders/h16-fuyu.jpg` (orbit at 3.0 and 4.8).

## Where I left the plan, and why
1. **The melt.** The plan has the snowman shrink to a 0.06 ball at x 1.0 and the head go back beside her (6.4-7.0). A ball shrinking that way runs into her body, and the goal "head sits on its body" holds to t+7. So the snowman melts in place at x 0.72 (body radius 0.17 to 0 over 6.4-7.0). The head shrinks with the body, stays on top, and goes at 6.95-7.0. The loop start is the snowball growing from nothing at x 0.95 while it rolls to 0.72 (0-2.4), not a visible 0.06 ball.
2. **The head is hidden until 2.2.** The plan has it beside her from the start of the loop, but the walking girl passes exactly where it sits (x 1.15, z 0.15).
3. **The lift path.** The plan gives none. I used an arc: up 0.3u over her head at the middle of the lift, and 0.15u toward the learner, so the head does not pass through her body.
4. **Her turn.** She keeps the plan's rest turn (-60 degrees) all loop. To reach the head at ground level she leans to her left (abdomen -0.5 rad, torso -0.25 rad) during 2.4-2.7 and comes back by 3.3. Turning her toward the head first put her leg into the ball (rounds 2-4).
5. **Hands during the lift.** The plan's end points are kept (right (0.855, 0.47, 0.07), left (0.82, 0.50, -0.04)). During the lift the hands move on a circle 0.15u round the head's centre. Interpolating straight between start and end put them inside the ball at mid-lift.
6. **Walk.** She walks along her facing (-60 degrees), from (1.196, -0.055) to (0.98, 0.07), not in x only.
7. **Scarf and hat: my own numbers, not fixed.** The scarf is at `chest` +0.32h, but the `chest` landmark lies in front of the body (z 0.2h), so the scarf sits in front of her neck and reads as a flat red ring in front of her face (visible in every picture). The hat (radius 0.075u at eyes +0.19h) reads oversized. I did not fix either because the six rounds were used up.
8. **Walk to idle.** The pose switches from `Walk` to `Idle` at 2.4 with no blend. I did not check whether that reads as a snap.

## Checks (real last lines)
- `node --check src/effects/vignettes/h-winter.js src/effects/vcat-hb.js`: no output, exit 0.
- `npm test` (final code): exit 0, 0 FAILED. Last lines:
```
content check ok: 851 cards (278 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 851 recipes (573 words), 0 cards with no recipe yet (default animation)
  1 pair(s) at or above 0.72 (list them with --verbose)
recipe check ok
```
  (The earlier run also showed `# pass 64` and `# fail 0`.)
- `node scripts/check-piece-costs.mjs vignette "^q-snowman$"`: `690 recipes, 0 cost mismatches`.
- `node scripts/orbit.mjs 51ac --times 3.0,4.8 --out plans/haiku/renders/h16-fuyu.jpg`: `plans/haiku/renders/h16-fuyu.jpg (looking at 0.39,0.04,0.02)`.
- Final `node scripts/inspect.mjs 51ac --goals ... --scan 0.25 --loop 7 --times 1.2,3.0,4.8 --out plans/haiku/renders/h16-fuyu`: `(report saved in plans/haiku/renders/h16-fuyu/report.txt; done in 35 s)`. Its exit code was 1 because of the two FAIL goals.
- One scratch command during the checks wrote a file to /tmp by mistake. I removed it.

## What I see in the render
I opened the orbit sheet (six views, two moments each), the full run's `faults.jpg` (12 tiles) and `overview.jpg` (9 tiles). I did not open `people.jpg`, and no picture shows the wave (5.6-6.4) or the melt (6.4-7.0).
- front: t+3 the head is held up in front of her face and a flat red scarf ring hangs in front of her face; t+4.8 the snowman has eyes, carrot nose, three buttons, she stands in front of it with arms in, and さむい! shows. Fault left: the scarf ring.
- right side: t+3 the head is above the body with her hands at its side; t+4.8 she stands beside the snowman. Fault left: her right arm reaches into the body (see Inspection).
- top: the snow slab with the snowman and the scarf ring; nothing more to say from above.
- back-left: the head and body are on the snow and she stands beside them; at t+4.8 the bubble reads mirrored from behind (normal).
- front-right: the kanji, its label and the snowman beside her are all in view at t+3 and t+4.8.
- low front: the same from low down; the snow slab and the snowman sit on the ground.

## Inspection
The POSSIBLE FAULTS lines of the final full run (whole loop, every 0.25 s from t+0 to t+6.75):
```
  - t+0 to t+2.25, t+2.75 (worst at t+0): model gal2 PASSES INTO mesh red #d02828: 7 skin points inside it, near the bones Head
  - t+2.5 (worst at t+2.5): model gal2 PASSES INTO mesh snowhead (white #ffffff): 61 skin points inside it, near the bones LowerLegL, FistL
  - t+2.75 to t+3 (worst at t+3): mesh snowhead (white #ffffff): FLOATS ABOVE mesh snowfield (white #eef4ff) (gap 0.47u)
  - t+2.75 (worst at t+2.75): mesh red #d02828: FLOATS ABOVE mesh snowfield (white #eef4ff) (gap 0.44u)
  - t+2.75 (worst at t+2.75): model gal2 PASSES INTO mesh snowhead (white #ffffff): 168 skin points inside it, near the bones UpperArmL, LowerArmL, UpperLegL
  - t+2.75 (worst at t+2.75): model gal2: 78% visible (17% behind the snowhead, 5% behind other things (props, labels)); shows 27% as big as the kanji
  - t+3 (worst at t+3): model gal2 PASSES INTO mesh snowhead (white #ffffff): 72 skin points inside it, near the bones FistL, FistR
  - t+3.25 (worst at t+3.25): mesh snowhead (white #ffffff): FLOATS ABOVE mesh snowbody (white #ffffff) (gap 0.06u)
  - t+3.5 (worst at t+3.5): mesh black #2a2a2a: SUNK INTO mesh snowhead (white #ffffff) (gap -0.07u)
  - t+3.75 to t+4, t+6 to t+6.75 (worst at t+3.75): mesh black #2a2a2a: SUNK INTO mesh snowbody (white #ffffff) (gap -0.17u)
  - t+3.75 to t+6.75 (worst at t+3.75): mesh orange #ff8a2a: FLOATS ABOVE mesh snowbody (white #ffffff) (gap 0.14u)
  - t+4 (worst at t+4): model gal2 PASSES INTO mesh snowbody (white #ffffff): 156 skin points inside it, near the bones FistR
  - t+4.25 to t+5.5 (worst at t+4.5): mesh red #d02828: FLOATS ABOVE model gal2 (gap 0.2u)
  - t+4.25 to t+5.25 (worst at t+5): mesh white #ffffff: FLOATS ABOVE model gal2 (gap 0.31u)
  - t+4.25 to t+5.5 (worst at t+4.25): model gal2 PASSES INTO mesh snowhead (white #ffffff): 21 skin points inside it, near the bones FistR
```
My reading of each:
- **Hat in the head, t+0 to t+2.75 (7 points):** small, but real. Left.
- **Lean at t+2.5, left lower leg and fist in the ball (61 points):** real. Her leg and hand touch the ball as she leans to take it. Left.
- **Left arm and upper leg through the ball at t+2.75 (168 points):** real. The arm crosses the ball at the moment she takes it. Left. This is also the cause of the failing "nothing passes through her" goal.
- **Fists in the ball at t+3 (72 points) and t+4.25 (21 points):** both hands hold the ball, so some contact is expected, but 72 points is more than a touch. Left.
- **Right fist in the body at t+4 (156 points):** real. When she hugs herself her right arm crosses the snowball (her right side faces it). Left.
- **Red scarf floats 0.2u above her (t+4.25-5.5):** real. This is the scarf ring in front of her face (item 7 above). Left.
- **Head floats at t+2.75-3.25 (gap 0.06 to 0.47u):** intended. The hands hold it in the air during the lift.
- **Hat floats above the snow at t+2.75 (gap 0.44u):** intended. It is worn at head height while she lifts the head.
- **Black buttons "sunk" into the body and head, and the orange nose "floating" above the body (gaps -0.07, -0.17, 0.14u):** not faults. The plan has the buttons and nose stuck to the surfaces of the body and head. The tool measures these separate meshes against the ball beneath them.
- **White piece "floats above" her (t+4.25-5.25, gap 0.31u):** I could not place this pair on the sheets. Nothing rests on her: the snowman stands beside her.

Goal FAIL 1, "the girl stays in view", 78% at t+2.75 (needs 85%): 17% of her is behind the snowhead while the head is lifted up in front of her. I did not get this above 85% in the rounds.

Goal FAIL 2, "nothing passes through her": the faults at t+2.5, t+2.75 and t+4 listed above. The first two are her left side meeting the head while she takes it; the third is her right arm and the body while she hugs herself. The plan's layout checked only the head at its top position, which is why these only show when the head is beside her and the girl moves.

## Inspection rounds
The plan allows six. Each round is a `--quick` run with the `--goals` file. Each line gives the result of that round, then the changes made after it. The final full run with pictures came after round 6 and changed nothing.
1. 4 of 9 PASS. Fails: the girl in view (79%, 55%, 66% at t+2.5 to t+6.75); the girl 0.03u sunk into the snow; "snowbody" and "snowhead" not found (the groups were named, the goals read meshes); the girl passes into the hat and the body. After: girl at y 0.03; meshes named snowbody and snowhead; hat at eyes +0.09h; hands start at the head's sides; a lean; she turns to face the head (yaw 0).
2. 6 of 9 PASS. Fails: the girl 59% visible at t+3; the head floats 0.08u above the body at t+6.75 (the melt lerped the head); the hat and her left leg pass into things. After: she turns to 20 degrees; the head arc toward the learner is 0.15u; the hat at eyes +0.16h; the melt rebuilt.
3. 6 of 9 PASS. Fails: the girl 66% visible at t+3 (31% behind the snowhead); the head floats 0.08u at t+6.75; hat and fists pass into the head (the hands lerped through the head's centre mid-lift). After: she turns to 40 degrees; the head arc goes over her head (+0.3u); the hands move on a circle 0.15u round the head; the hat at eyes +0.24h; the head sits rigidly on the body in the melt.
4. 7 of 9 PASS. Fails: the head sits on the girl at t+6.75 (the melt slid the body into her); the hat; her left leg into the head at t+2.5 (61 points); her left arm into the head at t+2.75 (168 points). After: no turn (she keeps -60 all loop); the body grows from nothing and melts in place at x 0.72; the hat at eyes +0.19h.
5. 7 of 9 PASS. Fails: the girl 78% visible at t+2.75 (behind the head); the hat (7 points); her left leg into the head at t+2.5 (61 points); her left arm into the head at t+2.75 (168 points). After: the hands' start sides swapped (right hand to the back of the head, left to the front).
6. 7 of 9 PASS. Same fails as round 5. No change after it.

Final full run (with pictures; not counted among the six): 7 of 9 PASS, the same two fails. It also lists the right fist in the body at t+4 (156 points), which the quick rounds showed only as a range.

Not done: no look at the wave (5.6-6.4) or the melt (6.4-7.0) in a picture; no `--look` close-ups; no `people.jpg` review; no `npm run e2e`; no headset check.
