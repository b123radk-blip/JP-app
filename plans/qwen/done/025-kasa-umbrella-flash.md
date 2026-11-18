# Report: 025-kasa-umbrella-flash (card w1301940, scene `q-umbrella`)

Round 1 left this file as `# NOT DONE (written by qwen-watch)`, so there is no round-1 report to quote: round 1 built
`src/effects/vignettes/q-umbrella.js` and its watcher run measured **8 of 9 PASS**, with one goal failing:
`nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it)`, from t+0 to
t+7.5, worst at t+0 (`13 skin points inside mesh handle … near the bones FistR`).

## Round 2

Round line: fixed the hand-in-the-handle collision -> **9 of 9 PASS**, 0 faults over the whole loop.

## What I changed

Only `src/effects/vignettes/q-umbrella.js` (the handle's numbers, the closed umbrella's tilt, and the comments that
described the old band). Nothing else in the repo; the catalog line and the goals file are untouched.

The FAIL was her own right fist inside the handle near `FistR`. `measure` at t+0 showed why: `grip` was multiplied by
`e` (0 while the umbrella is still down), so at t+0 the palm was not turned against the shaft at all — the fist's skin
reached 0.14u *past* the palm plane along the shaft, and the crook (a half-ring centred at `HOOK = -0.06`) sat inside
that skin. Three changes:

- `who.grip('R', P, toward, GRIP * u, 1, …)` — the grip is live for the whole loop instead of `e`, so the palm faces up
  the shaft in the closed pose too and the fist's band stays across the shaft rather than along it.
- `GRIP = 0.017` (was 0.021) and `HOOK = -0.145` (was -0.06): the fist now owns the band -0.017u..-0.084u along the
  shaft, the crook's ring is centred outside it at -0.145 (its tube spans -0.157..-0.133), and the wooden grip is a
  0.11u cylinder at +0.075 (spanning +0.02..+0.13) so it starts on the shaft's side of the band. The crook keeps the
  plan's own sizes: radius 0.035u, tube 0.012u.
- `umb.rotation.set(0.5 * e - 0.72 * (1 - e), 0, (Math.PI + 0.06) + e * (Math.PI - 0.23))`: closed, the umbrella now
  hangs down and *toward the learner* instead of down and into her legs. The previous tries at "straight down"
  (`-0.337`) and "out at her side" (`Math.PI + 0.75` with the palm un-twisted) both failed — the first left the fist
  inside the crook (11 points), the second put the closed bundle through her right thigh (`canopy … 4 skin points …
  near Hips/FootR`). At -0.72 the bundle hangs in front of her feet, its tip 0.01u above the floor.

## Where I left the plan, and why

- The plan says the palm is "against the handle's inside, never with the fist round it". With a real rigged fist, the
  skin of the fist always reaches ~0.07u past the palm plane along what it holds, so a crook drawn at the palm plane is
  always inside the hand. I kept the palm against the grip (`grip` + `hold`, distance 0u in both poses) and moved the
  crook to the far side of the fist's band, where it reads as the J hanging past her hand. The plan's hand points
  (0.42, 0.40, 0.06) down and (0.42, 0.58, 0.06) up are the model's own `Idle` fist and a `handTo`-style reach; the
  measured hand is at (0.49, 0.35, -0.07) closed and (0.56, 0.60, 0.02) up — within about 0.1u of the plan's points, and
  the up point is the one the goals measure.
- Everything else (beat order, rain, splash, canopy scale, the three named meshes, cost) is as the plan wrote it.

## Checks (the real last lines)

```
$ node --check src/effects/vignettes/q-umbrella.js
(no output)
```
```
content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```
```
$ node scripts/check-piece-costs.mjs vignette "^q-umbrella$"
701 recipes, 0 cost mismatches
```
```
$ node scripts/orbit.mjs w1301940 --out plans/qwen/renders/025-kasa-umbrella-flash.jpg
plans/qwen/renders/025-kasa-umbrella-flash.jpg (looking at 0.31,0.04,-0.02)
```
```
$ node scripts/inspect.mjs w1301940 --goals plans/qwen/goals/025-kasa-umbrella-flash.json --loop 8 \
    --times 0.4,1.4,3.5,7.6 --out plans/qwen/renders/021-kasa-umbrella

## Goals: 9 of 9 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS her right hand holds the umbrella's handle at first (t+0 to t+1): 4 moments, e.g. t+0: 0u apart (needs ≤ 0.04)
  PASS her right hand holds the handle while it is up (t+1.8 to t+7.5): 12 moments, e.g. t+2: 0u apart (needs ≤ 0.04)
  PASS the open canopy is just above her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0u apart (needs ≤ 0.25)
  PASS the open canopy covers her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0u apart (needs ≤ 0.2)
  PASS nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it): 19 moments, e.g. t+0: nothing passes into it
  PASS the learner sees her: 19 moments, e.g. t+0: 100% visible (needs ≥ 75)
  PASS the learner sees the kanji: 19 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the open umbrella shows big (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: shows 32% as big as the kanji (needs ≥ 25)
  PASS rain falls (t+0.6 to t+6.4): 12 moments, e.g. t+1: 1 of 1 rain within 1.5u of gal2 (needs ≥ 1)

## The whole loop, every 0.5 s from t+0 to t+7.5 (numbers only; the T ids differ from moment to moment)

  no measured faults at any moment
```
An earlier run at the plan's other moments (`--times 0,1,1.8,2.5,4,6.9,7.5`) gave the same `9 of 9 PASS` and
`no measured faults at any moment`.

## What I see in the render (`plans/qwen/renders/025-kasa-umbrella-flash.jpg`, t+0.5 and t+1.5)

- **front t+0.5** — she stands at the kanji's right, the closed umbrella hanging out of her right fist down past her
  knee, its ferrule tip at the floor; no rain yet. Reads as "holding a closed umbrella".
- **front t+1.5** — rain in a column over her, her left hand up over her forehead, the umbrella mid-swing across her
  chest pointing to her left. The swing is the one moment where the handle looks like a rod plus a separate hook,
  because the crook is on the far side of her fist while the axis is horizontal; nothing intersects.
- **right side t+0.5 / t+1.5** — the closed bundle hangs in front of her feet (tilted toward the learner), tip clear of
  the ground; at t+1.5 the bundle sweeps up in front of her chest.
- **top t+0.5 / t+1.5** — only her hair and the bundle from above; nothing floats, nothing sunk.
- **back-left t+0.5 / t+1.5** — her back and the bundle behind her at her side; the drops read as a line of rain.
- **front-right t+0.5 / t+1.5** — the clearest closed-umbrella view: the grip comes out of the bottom of her fist, the
  red bundle and its tip below it, the crook's curl peeking out behind her forearm.
- **low front t+0.5 / t+1.5** — same as front from below; the tip still clears the floor line.

Left: the crook is partly hidden behind her forearm while the umbrella is closed (it cannot be drawn where her fist's
skin is). Nothing else left.

## Inspection (`plans/qwen/renders/021-kasa-umbrella/report.txt`)

The last run lists no POSSIBLE FAULTS lines at all — the whole-loop scan says `no measured faults at any moment`, and
"Bodies passing into things" is empty at every moment. What the report does say, and why each is fine:

- `T1 model gal2 right hand at [0.49,0.35,-0.07]: … nearest other thing T2 mesh handle … 0u away (inside its box:
  touching or passing through)` — "inside its box" is the mesh's bounding box, which spans the crook and the grip; the
  skin-point test (what the goal measures) finds 0 points inside either mesh, and `held.jpg` shows the palm on the
  grip. Same for the t+1.4, t+3.5 and t+7.6 hand lines.
- `mesh handle … carried or worn by T1 model gal2 (it moves with them)` and the same for shaft and canopy — correct:
  the umbrella is held, and `held.jpg` (12 tiles, three sides × t+0.4 and t+1.4) shows the grip inside her fist in both
  poses.
- `T2 model gal2: 96% / 97% visible (… behind other things)` — the 3-4% is her raised forearm against the shaft; the
  goal needs ≥ 75% and it measures 100% at every moment in the goals run.
- `the canopy … 93% visible … shows 30% as big as the kanji` at t+3.5 — the 7% is her hair at the canopy's rim; the
  `big` goal (≥ 25%) passes at 32%.
- Feet: the report says `touches the ground line` for gal2 at all four moments (her bounding box's bottom reads 0, or
  -0.01 at t+3.5 where she leans in her sway — 1% of the kanji's height, and the scan lists no `SUNK INTO`), and the
  closed umbrella's shaft bottom 0.01 / canopy bottom -0.02: the plan asks for "the tip a little off the floor".

## Round 3

Round line: Opus's F1 + F2 + F3 -> **9 of 9 PASS**, 0 faults over the whole loop.

Only `src/effects/vignettes/q-umbrella.js` changed (the catalog line and the goals file untouched).

**F1 - the rain was one sawtooth line.** `rnd(i, k)` multiplied `i` by the same 7919 for every slot, so a drop's x, z and
phase were all the same fraction of `i`: 90 drops on one diagonal line, 0.39u wide at t+1.4.
`rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); }` (still pure),
and the spread back to the plan's own box: `xs.push(X(0.05 + 1.1 * rnd(i, 1)))` (was 1.2), `zs.push(-0.2 + 0.5 * rnd(i, 2))`
(was 0.55). The rain pool's box is now 1.13u wide x 1.66u deep centred at x 0.6, and in the t+1.4 and t+3.5 renders the
drops cover the whole panel, several of them over her head.

**F2 - the canopy hid her face.** Two problems: it leaned 0.5 rad (29°) at the learner, so its front rim dropped to y 0.73
(below her eyes at 0.74), and her fist held the grip at (0.56, 0.60) right in front of her chin.

- `HOLD = [-0.18, 0.74, 0.04]` (was `[-0.033, 0.69, 0.05]`): the hand moves to her right side and up. Measured up-pose
  hand: (0.43-0.46, 0.57-0.58, 0.01), the plan's (0.42, 0.58 to 0.75, 0.06); her head is at x 0.64-0.68, so the fist is
  0.2u to the learner's left of her face and behind its front plane (eyes z 0.07-0.09), not in front of her chin.
- `umb.rotation.set(0.10 * e - 1.1 * (1 - e), 0, (Math.PI + 0.06) + e * (Math.PI - 0.32))`: the lean toward the viewer
  is the `0.10 * e` term (was 0.5), and the z term now ends at 2π - 0.26, so the shaft leans *in* over her head instead
  of out.
- That lean alone could not lift the canopy high enough (the shaft was only 0.33 heights to the canopy's middle, and the
  tilted rim drops about 0.08u), so the umbrella is now the plan's size: `SHAFT = 0.42, TOP = 0.545, CAN = 0.50, CR = 0.33`
  (was 0.20 / 0.35 / 0.33 / 0.30), the shaft cylinder centred at 0.34 instead of 0.23, and the closed bundle hugs the
  shaft at `lerp(0.30, CAN, open)` instead of `lerp(0.24, ...)`. Measured at t+2.5, 3.5, 4.5, 6.0, 6.9: canopy centre
  [0.54-0.60, 1.10, 0.03-0.04] (plan: x 0.52-0.6, y 1.05 or more, z 0), canopy bbox bottom 0.98-1.00 against her head top
  0.93-0.94 -> the lowest rim point is 0.05-0.06u above her crown at every up moment, and her eyes (0.74-0.75) are
  0.23u below it. The close-up `look-0.55_0.8_0-front-t3.5.jpg` shows the shaft passing beside her head (a clear gap, the
  goal `nothing passes through her` reports nothing inside her at all 19 moments) and her whole face free of both the
  canopy and her fist.
- The longer umbrella hung through the floor when closed (shaft bottom -0.11 at t+0.4), so the closed pose tilts further
  toward the learner: -1.1 rad instead of -0.72. Measured closed: shaft bottom 0.02, canopy bottom 0.07, tip a little off
  the floor as the plan says, at z 0.46 in front of her feet.

**F3 - the splash was a blue hat.** `rainK * (1 + 2 * sp)` on top of `K = 1.7` grew a landed drop to 3x and held it for
0.18 s, so hits near the apex stacked into a cone the size of her head. Now
`k = sp < 1 ? rainK * (1 + 0.4 * sp) * (1 - sp) : 0` with the splash window 0.12 s: the fleck is at most 0.6x a falling
drop and shrinks to nothing. Its y is now taken on the tilted cone at the drop's own x and z - the cone's axis
(`canopy.getWorldQuaternion`), its rim middle `b = cp - axis * h/2`, then `hit = b.y + ax.y * h * (1 - d / R)` - and the
radius and height are multiplied by `ADULT * u`, because the umbrella is built in her heights while the rain is in world
units (the old code compared world distances with unscaled local radii). `look-0.6_1.1_0.03-front-t4.5.jpg` shows small
blue flecks sitting on the red canopy with a few drops bouncing off its edge; nothing stands up from it.

## Round 3 checks (the real lines)

```
$ node --check src/effects/vignettes/q-umbrella.js
(no output)
```
```
npm test: ℹ tests 64 / ℹ pass 63 / ℹ fail 0 / ℹ skipped 1
content check ok: 855 cards (282 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 855 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```
```
$ node scripts/check-piece-costs.mjs vignette "^q-umbrella$"
701 recipes, 0 cost mismatches
```
```
$ node scripts/inspect.mjs w1301940 --goals plans/qwen/goals/025-kasa-umbrella-flash.json --loop 8 \
    --times 0.4,1.4,3.5,7.6 --out plans/qwen/renders/021-kasa-umbrella

## Goals: 9 of 9 PASS (checked at every moment measured; a goal passes only if it holds at all of them)

  PASS her right hand holds the umbrella's handle at first (t+0 to t+1): 4 moments, e.g. t+0: 0u apart (needs ≤ 0.04)
  PASS her right hand holds the handle while it is up (t+1.8 to t+7.5): 12 moments, e.g. t+2: 0u apart (needs ≤ 0.04)
  PASS the open canopy is just above her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0.05u apart (needs ≤ 0.25)
  PASS the open canopy covers her head (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: 0.05u apart (needs ≤ 0.2)
  PASS nothing passes through her (shaft, canopy and handle outside her; her hand against the handle, not in it): 19 moments, e.g. t+0: nothing passes into it
  PASS the learner sees her: 19 moments, e.g. t+0: 100% visible (needs ≥ 75)
  PASS the learner sees the kanji: 19 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the open umbrella shows big (t+2.5 to t+6.9): 9 moments, e.g. t+2.5: shows 31% as big as the kanji (needs ≥ 25)
  PASS rain falls (t+0.6 to t+6.4): 12 moments, e.g. t+1: 1 of 1 rain within 1.5u of gal2 (needs ≥ 1)

## The whole loop, every 0.5 s from t+0 to t+7.5 (numbers only; the T ids differ from moment to moment)

  no measured faults at any moment
```

## Round 3: what I see in the pictures

- `overview.jpg` t+0.4: the closed umbrella hangs from her right fist, tip a little off the floor in front of her feet,
  crook below the fist. t+1.4: rain over the whole panel, drops on her head and shoulders, her left hand over her
  forehead, the umbrella mid-swing to her left. t+3.5: the red canopy over her head, the shaft down to her fist beside
  her head, rain falling all round it, her face clear. t+7.6: closed again, lowered across her chest toward her side.
- `025-kasa-umbrella-flash.jpg` (t+0.5, t+1.5, six angles) and `025-kasa-umbrella-flash-round3.jpg` (t+3.5, t+4.5, six
  angles, --dist 0.75): nothing floats, nothing sunk, nothing through her body; the top tiles show the splashes as small
  flecks on the canopy.
- `held.jpg`: the palm on the wooden grip in both poses, the crook hanging past the fist, nothing inside the hand.
- Still open (not a fault, and not something F1-F3 asked for): at t+1.4 the swinging closed bundle reaches x 1.08, near
  the edge of the learner's panel for a moment, and the ferrule tip pokes ~0.03u above the canopy's apex cap, which from
  a very close look reads as a thin spike on top of the umbrella.
