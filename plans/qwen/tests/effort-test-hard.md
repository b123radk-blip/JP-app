# Hard effort test: eight tasks at the top end of your card work

This is a test, not a plan. Nothing here changes the app. Work alone: do **not** open `plans/qwen/done/`,
`plans/qwen/loop/`, `plans/qwen/logs/` or any folder under `.cache/effort-test/` other than your own. You may read any
source file (for example `scripts/lib/goals.mjs`, `plans/qwen/CHEATSHEET.md`, `node_modules/three`), and you may write
and run your own node scripts (three.js is at `node_modules/three/build/three.module.js`).

The message after this file gives your **label** (for example `medium`). Write everything to
`.cache/effort-test-hard/<label>/`. First run `node -e "console.log(new Date().toISOString())"` and put the time at the
top of `answers.md`; run it again at the very end and put that time at the bottom.

`answers.md` has one heading per task (`## A` to `## H`), brief working, and the final answer on a line starting
`ANSWER:`. Numbers to 3 decimals unless asked otherwise. Code tasks also go in their own files (named below). Don't
commit and don't push. The tasks get harder; do them all, and say honestly where you are unsure.

Conventions (same as the project): lengths in u. x runs right (from the kanji's right edge), y up, z toward the learner.
three.js is right-handed: positive `rotation.x` turns +y toward +z; Euler order is the default `'XYZ'`. A model with
turn 0 faces +z (the learner); `rotation.y = θ` makes it face (sin θ, 0, cos θ).

**The learner's eye** is at (−0.45, 0.35, 2.6). The kanji fills x −1 to 0, y 0 to 1, z ≈ 0; its meaning label sits just
under it. Scenes play at x 0 to 1.5, y 0 to 1.3, z −0.8 to 0.6. The goal checker samples the loop every 0.5 s.

## A. Nested groups

Group P: position (1.0, 0.1, −0.2), rotation (x 20°, y 30°, z 0). Its child C: position (0.2, 0, 0.1), rotation
(0, 0, z 90°), uniform scale 0.5. C's child G: position (0, 0.3, 0).
1. G's world position.
2. The world direction of G's local +y axis (a unit vector).
3. The world point (1.2, 0.5, 0.0) in P's local coordinates.

## B. When can he reach the cup?

A cup's centre moves along x(t) = 0.6 + 0.5 × smoothstep(clamp((t − 1) / 2, 0, 1)), with y 0.45 and z 0.05 fixed
(smoothstep(s) = 3s² − 2s³), for t from 0 to 4 s. A man's right shoulder is fixed at (1.0, 0.55, −0.1) and his hand
reaches at most 0.30 from it. Between which times (2 decimals) is the cup within his reach?

## C. Can the learner see him?

A cabinet is the box x 0.7 to 1.2, y 0 to 0.5, z 0.1 to 0.3. Treat sight lines as straight segments from the eye.
1. Is his head at (0.95, 0.62, −0.25) hidden by the cabinet?
2. Is his knee at (0.95, 0.20, −0.15) hidden?
3. Keeping x 0.95 and z −0.25, what is the lowest head height y (3 decimals) the learner can still see?

## D. How far to tilt a board

A flat board's centre is at (0.95, 0.15, 0). Tilting it by `rotation.x = θ` turns its top normal to (0, cos θ, sin θ).
"Its top faces the learner by N°" means N = 90° − the angle between the top normal and the direction from the board's
centre to the eye.
1. N for the untilted board (θ = 0).
2. The smallest θ (2 decimals, degrees) that gives N ≥ 30°.

## E. A walker (code: `walker.mjs`)

Export `walker(t)` returning `{ x, y, z, yaw }` (yaw in degrees, normalised to (−180, 180]), a pure function of t with
loop length 8 s (t may be negative or larger than 8).
- Path, a closed loop of straight segments at constant speed 0.5 u/s: (x 0.6, z −0.6) → (0.6, 0.3) → (1.3, 0.3) →
  (1.3, −0.6) → back to (0.6, −0.6). It walks it once from v = 0 to 6.4 s (v = time within the loop), then stands at the
  start until 8 s.
- yaw while walking: the current segment's heading (atan2(Δx, Δz) in degrees). At each of the three corners, during the
  0.2 s centred on the moment it reaches the corner, yaw turns from the old heading to the new one with smoothstep,
  **the short way round**.
- yaw while standing: from 6.4 to 7.0 s it turns (smoothstep, short way) from the last segment's heading to 0; holds 0;
  from 7.6 to 8.0 s it turns (smoothstep, short way) from 0 to the first segment's heading.
- y = (0.5 − z) × tan 20° + 0.045, plus 0.012 while walking (v < 6.4).
In `answers.md`: paste your output for t = 1.75, 3.2, 5.05, 6.7 and −0.5, and answer: **does the result ever jump (is
anything discontinuous) over the loop, including at the loop point?** Name each place and what jumps, and say whether
any beat of this spec does nothing.

## F. Debug a scene (code: `fixed.mjs`)

This is what the scene must do (the truth):
- Loop 6 s. Pure: `seek(t)` may be called at any t, in any order, any number of times, on the same object.
- Ball: starts at x 0.8, rolls to x 1.2 from 0 to 2 s (smoothstep), waits there, rolls back to x 0.8 from 4 to 6 s
  (smoothstep) so the loop closes. It bounces once from 3.0 to 3.5 s: y = 0.1 + 0.3 × sin(π × smoothstep(s)), s going
  0 to 1 over that half second; otherwise y = 0.1.
- The kanji turns about y by up to 15° toward the ball during the bounce: 15° × sin(π s), same s; otherwise 0.
- The board: tilted 30° toward the learner (rotation.x) and turned 20° about y (rotation.y), all the time.
- Every angle in radians.

This is the code someone wrote. List **every** bug (line, what goes wrong, a moment where it shows), then write
`fixed.mjs`, exporting the same `step(t, o)` and doing exactly what the truth says.

```js
// o = { ball: {x, y}, glyph: {rotY}, board: {rotX, rotY} } (plain numbers, radians).
const L = 6;
const ease = (s) => s * s * (3 - 2 * s);
export function step(t, o) {
  const v = t % L;
  // the ball rolls in from the left, waits, then bounces once on the kanji and rolls back
  if (v < 2) o.ball.x = 0.8 + 0.4 * ease(v / 2);
  else o.ball.x += 0.0;
  const b = ease((v - 3) / 0.5);
  o.ball.y = 0.1 + 0.3 * Math.sin(Math.PI * b);
  if (v > 4) o.ball.x = 1.2 - 0.3 * ease((v - 4) / 2);
  // the kanji turns 15 degrees toward the ball while it bounces
  o.glyph.rotY = 15 * Math.sin(Math.PI * Math.min(1, Math.max(0, (v - 3) / 0.5)));
  // a little tremble so it feels alive
  o.glyph.rotY += (Math.random() - 0.5) * 0.002;
  // the board under the ball: tilted 30 degrees toward the learner, turned 20 degrees about y
  const tilt = 30 * Math.PI / 180, yaw = 20 * Math.PI / 180;
  o.board.rotX = yaw; o.board.rotY = tilt;
  return o;
}
```

## G. Triage an inspect report

For each line say **real** (must fix in the scene), **expected** (fine as designed), **checker** (the scene is right;
the goal or the measuring is at fault) or **look** (can't tell from the numbers; render a close look first), with one
line why. The scene: a girl (gal2, 0.5 tall) pours tea from a pot into a cup on a low table tilted 25° toward the
learner; the plan says "the table's tilted top dips into its legs" is fine.

1. `t+0 to t+7: mesh table top: SUNK INTO mesh table legs (gap -0.04u)`
2. `t+2.5 to t+4: mesh teapot: INSIDE model gal2 right hand (0.035u deep)`
3. `FAIL the cup stays on the table (t+3.1 to t+3.3): no moment measured`
4. `t+1 to t+1.5: model gal2: FLOATS 0.012u above mesh floor (walking)`
5. `t+3 to t+4: model gal2: left hand passes INTO model gal2 chest (0.06u)`
6. `PASS the girl is seen: 66% visible (needs ≥ 65) — 30% behind mesh teapot`
7. `t+5 to t+5.5: mesh cup: FLOATS 0.09u above mesh table top`
8. `FAIL the tea stream shows big (t+3 to t+4): stream is not in the learner's view`
9. `t+0 to t+7: kanji: 72% visible — 28% behind mesh steam`
10. `PASS the cup rests on the table: cup: on gal2`

## H. Plan a new card (in `plan.md` and `goals.json`)

Card 運 "carry; transport". Write a plan the way Opus writes them for you: the idea a child should get (one or two
sentences), a layout table (name, size, where, colour), timing beats to the second for a loop you choose, and a
`goals.json` of at least 6 goals in the format of `scripts/lib/goals.mjs`. Body numbers to use: an ADULT model 0.9 tall
has its shoulders at y 0.62 above its feet, 0.1 either side of its centre, and its hands reach at most 0.30 from the
shoulder; a KID 0.55 tall: shoulders at 0.38, 0.06 either side, reach 0.18. Hands hold things against the palm, never
inside the fist. Show in the plan, with numbers, that every hand target is in reach, that the key things face and are
seen from the eye, and that the loop ends where it starts. Keep it within the scene room above.

## Last step

Run the time command again, put it at the bottom of `answers.md`, and finish with a line or two on what you were least
sure of.
