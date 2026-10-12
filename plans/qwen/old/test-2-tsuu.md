# Qwen test 2: rebuild 通 (pass through) as a cut-away tunnel

You are rebuilding one card's 3D scene in this repo. Read this whole file before you change anything. Do only what it
says; if something here seems impossible or wrong, stop and write that in the report at the end instead of improvising.

## The card

- Card `901a`, kanji 通, meaning "pass through; commute". Its scene is the vignette type `q-tunnel`.
- Code: the function `tunnel(ctx, spec, stage)` in `src/effects/vignettes/q-move.js` (around lines 195-216).
- Catalog entry: the line starting `'q-tunnel': VM(` in `src/effects/vignette-catalog.js` (around line 468).
- The quality bar: a child must understand "going through" from the scene alone.

## What is wrong now

A person walks into a round green blob and is hidden the whole time he is inside it, so the learner only sees him at the
two ends. The blob doesn't read as a hill with a tunnel, the path floats in the air (there is no ground), and the
tunnel is turned at an angle, so from the front you mostly see one round hole.

## The new scene

A **cut-away tunnel**, like a picture in a children's book: a hill whose front has been sliced off, so you look into the
tunnel from the side. The tunnel runs straight left to right through the hill. The person walks along the road from
the left, in through the left portal, along the lamp-lit tunnel (fully visible the whole way, because the front of
the hill is cut away) and out through the right portal, then the loop starts again.

## Coordinates

Group space, as the function already uses them: `u` is the size unit, `floor = B.minY` is ground level, `+x` is right,
`+y` up, `+z` toward the viewer. Everything below sits in one group `tun` placed at `(hx, floor, 0)` with
`hx = B.maxX + 0.95 * u`, and **no rotation** (delete the old `tun.rotation.y = 0.6`). All coordinates below are
relative to that group. Write every size as a multiple of `u`.

## What to build

Replace the whole body of `tunnel()` (keep its name and signature). Keep `const u = stage.u, B = stage.box,
group = new THREE.Group(), floor = B.minY` as they are.

### 1. The hill's outline (two `THREE.Shape`s)

The hill is a loaf shape: vertical end walls 0.6u tall at x = ±0.8u, and a rounded top 0.9u high in the middle.
Top points (x, y), in units of u, left to right:
`(-0.8, 0.6) (-0.7, 0.75) (-0.45, 0.86) (0, 0.9) (0.45, 0.86) (0.7, 0.75) (0.8, 0.6)`.
Make a `const top = [...]` array of `THREE.Vector2` from those (each multiplied by `u`).

- `whole` (the full hill): `moveTo(-0.8u, 0)`, `lineTo(-0.8u, 0.6u)`, `splineThru(top.slice(1))`, `lineTo(0.8u, 0)`,
  then `closePath()`.
- `roof` (the part of the hill above the tunnel; the tunnel is 0.56u tall): `moveTo(-0.8u, 0.56u)`,
  `lineTo(-0.8u, 0.6u)`, `splineThru(top.slice(1))`, `lineTo(0.8u, 0.56u)`, `closePath()`.

### 2. One static prop `hill` (glow `0.35`), parts `[geometry, color]`:

- **Ground** under everything: `G.box(2.5 * u, 0.03 * u, 1.1 * u, 0, -0.015 * u, -0.3 * u)`, `0x4e8a3a`.
- **Road**, through the tunnel and out both ends: `G.box(2.3 * u, 0.012 * u, 0.26 * u, 0.075 * u, 0.006 * u, -0.15 * u)`,
  `0xc8a878`.
- **Back of the hill**, the full outline as a solid from z -0.7u to -0.3u:
  `new THREE.ExtrudeGeometry(whole, { depth: 0.4 * u, bevelEnabled: false }).translate(0, 0, -0.7 * u)`, `0x5aa048`.
- **Hill above the tunnel**, the roof outline as a solid from z -0.3u to 0:
  `new THREE.ExtrudeGeometry(roof, { depth: 0.3 * u, bevelEnabled: false }).translate(0, 0, -0.3 * u)`, `0x5aa048`.
- **The cut face** (brown earth on the sliced-off front), a flat copy of the roof outline just in front of it:
  `new THREE.ShapeGeometry(roof).translate(0, 0, 0.002 * u)`, `0x8a6a48`.
- **Grass edge** along the top of the cut face: `G.tube(top.map((p) => [p.x, p.y]), 0.025 * u).translate(0, 0, 0.004 * u)`,
  `0x3a8a30`. (`G.tube` takes `[x, y]` pairs.)
- **Tunnel back wall** (stone, in front of the hill's back part):
  `G.box(1.6 * u, 0.56 * u, 0.02 * u, 0, 0.28 * u, -0.29 * u)`, `0x6a6a72`.
- **Two stone portals**, one at each end (x = -0.8u and x = +0.8u; write them with a `flatMap` over `[-1, 1]`, `sx`
  being that sign). Each is two posts and a beam on top, color `0x9a9aa0`:
  - posts: `G.box(0.05 * u, 0.56 * u, 0.05 * u, sx * 0.8 * u, 0.28 * u, -0.025 * u)` and the same with z `-0.275 * u`
  - beam: `G.box(0.05 * u, 0.05 * u, 0.3 * u, sx * 0.8 * u, 0.585 * u, -0.15 * u)`

### 3. A second prop `lamps` (glow `1.4`)

Three warm lamps on the tunnel's back wall: `G.sphere(0.03 * u, x, 0.46 * u, -0.27 * u)` for x = `-0.45 * u`, `0`,
`0.45 * u`, color `0xffd070`.

### 4. The person

`const p = person(spec.who, u, 0.5)` (smaller than before, so he fits under the 0.56u ceiling with room to spare).
`tun.add(hill, lamps, p.group); tun.position.set(hx, floor, 0); group.add(tun);`

### 5. The motion

`const loop = 6.4;` and in `step(t)`:

```js
const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
const f = pre ? 0 : between(v, 0.3, 5.6), x = lerp(-1.0 * u, 1.15 * u, f);
p.pose(pre || f >= 1 ? 'Idle' : 'Walk', pre ? t : v); p.group.position.set(x, 0, -0.13 * u); p.group.rotation.y = RIGHT;
```

He is **always visible** (do not hide him inside the tunnel; that was the old scene's problem). He walks at z -0.13u,
between the back wall (-0.28u) and the cut face (0).

### 6. Descriptions and cost

- The header comment at the top of `q-move.js`, the line starting `//   q-tunnel`: `通: a cut-away hill: a person walks
  along a road in through one stone portal, along the lamp-lit tunnel (seen from the side) and out the other end`.
- The catalog line for `'q-tunnel'`: the scene now has 2 meshes of its own (`hill`, `lamps`), so change `pdc(o.who) + 4`
  to `pdc(o.who) + 2`, and change its description to the same words as the header comment.

## Rules

- Change only `tunnel()` and its header comment line in `q-move.js`, and the `'q-tunnel'` line in
  `vignette-catalog.js`. Don't touch any other scene, file or helper.
- Match the surrounding code style: dense lines, `const` declarations chained with commas, no new helper functions
  outside `tunnel()`, no new imports (`THREE`, `G`, `solidProp`, `between`, `lerp`, `person`, `RIGHT` are already
  imported).
- Don't rename or reorder anything else. After your change, check that nothing else in the file used something you
  removed.

## Checks you must run (paste the real output in the report)

1. `node --check src/effects/vignettes/q-move.js` (must print nothing).
2. `npm test`: the unit tests must end with `fail 0`. On this Windows checkout the content check also reports
   `docs/REVIEW.md: out of date`; that is the known line-ending issue from test 1. Ignore it and don't touch that file.
3. `git diff --stat` (must list only the two files).

You cannot render the scene on this machine. Opus renders it from six angles after you push, so don't claim anything
about how it looks.

## When done

Commit with the message `通 (q-tunnel): cut-away tunnel, lamp-lit, person visible all the way through (Qwen test 2)`.
Then fill in the report below (replace the placeholders), and commit that too with the message `Qwen test 2 report`.

## Report (Qwen fills this in)

- What I changed:
  - `src/effects/vignettes/q-move.js`: replaced the whole body of `tunnel()` with the cut-away tunnel exactly as specified: two `THREE.Shape` outlines (`whole`, `roof`) from the `top` point list, one `hill` prop (glow 0.35) with ground, road, the two extruded hill solids, the brown cut face, the grass tube along the top, the stone back wall, and two stone portals via `flatMap` over `[-1, 1]`; a second `lamps` prop (glow 1.4) with three warm spheres; the person at scale 0.5 walking left to right at z -0.13u, always visible (no more `visible` hiding, no more `tun.rotation.y`). Also updated the `//   q-tunnel` header comment line.
  - `src/effects/vignette-catalog.js`: the `'q-tunnel'` line now costs `pdc(o.who) + 2` (was + 4) and its description matches the header comment.
  - Nothing else touched; `git diff --stat` lists only these two files.
- Anything in the plan I could not follow, and why:
  - Nothing. One note: `npm test` did report `docs/REVIEW.md: out of date` in the content check, which the plan identifies as the known line-ending issue from test 1; I ignored it and did not touch that file, as instructed. The unit tests themselves end with `fail 0`.
  - I could not render the scene (no renderable checkout here), so no claim is made about how it looks.
- Output of check 1:
  ```
  $ node --check src/effects/vignettes/q-move.js
  (no output)
  ```
- Output of check 2 (last 10 lines):
  ```
  ℹ tests 64
  ℹ suites 0
  ℹ pass 63
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 1
  ℹ todo 0
  ℹ duration_ms 690.5813
  content check FAILED (1):
   - docs/REVIEW.md: out of date with the cards: run `npm run review:list`
  ```
- Output of check 3:
  ```
  src/effects/vignette-catalog.js |  2 +-
  src/effects/vignettes/q-move.js | 29 ++++++++++++++++-------------
  2 files changed, 17 insertions(+), 14 deletions(-)
  ```
