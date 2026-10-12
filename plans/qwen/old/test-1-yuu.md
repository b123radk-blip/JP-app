# Qwen test 1: give 夕 (evening) a real place to stand

You are fixing one card's 3D scene in this repo. Read this whole file before you change anything. Do only what it says;
if something here seems impossible or wrong, stop and write that in the report at the end instead of improvising.

## The card

- Card `5915`, kanji 夕, meaning "evening". Its scene is the vignette type `q-dusk`.
- Code: the function `dusk(ctx, spec, stage)` in `src/effects/vignettes/q-warm.js` (around lines 155-182).
- Catalog entry: the line starting `'q-dusk': VM(` in `src/effects/vignette-catalog.js` (around line 480).
- The quality bar: a child must understand "evening" from the scene alone.

What the scene does now (keep all of this): two children stand side by side, wave goodbye with a バイバイ! label, then
walk home in opposite directions and disappear; the orange sun sinks through the loop; three crows fly past.

## What is wrong (seen from six camera angles)

1. **The children float in empty space.** There is no ground under them at all; from the side and from behind they hang
   in the red sky.
2. **The hills are tiny dark blobs** at the children's feet, so they don't read as hills, and the sun never goes behind
   them: the sun sinks *in front of* the hills, between the children.
3. Nothing says "time to go home" except the wave.

## What to build

Coordinates are group space, as the function already uses them: `u` is the size unit, `floor = B.minY` is ground level,
`x0` is the middle of the scene (the children stand at `x0 ∓ 0.18 * u`), +z points toward the viewer, -z away.
Write every size as a multiple of `u` exactly as below.

### 1. One static `land` prop replaces `hills`

Delete the old `hills` solidProp. Make a new one, `land = solidProp([...], 0.2)`, with `land.position.set(x0, floor, 0)`,
so every part below is relative to (x0, floor, 0). Parts (each is `[geometry, color]`):

- **Grass**: `G.box(2.75 * u, 0.04 * u, 3.4 * u, 0.43 * u, -0.02 * u, -1.2 * u)`, color `0x4e6b3a`.
  (Its top is exactly at y = 0, the children's feet. It runs from x -0.95u to +1.8u so it does not slide under the
  kanji on the left, and from z +0.5u back to -2.9u.)
- **Dirt road** the children stand and walk on: `G.box(1.9 * u, 0.012 * u, 0.28 * u, 0, 0.003 * u, 0.1 * u)`,
  color `0xc9a46a`.
- **Three hills, as domes** (top halves of spheres only, so nothing pokes below the grass when seen from low down).
  `G.sphere` cannot make a half sphere, so build the geometry directly:
  `new THREE.SphereGeometry(r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, sy, 0.4).translate(x, 0, z)`
  - left hill: r `0.6 * u`, sy `0.8`, x `-0.3 * u`, z `-2.3 * u`, color `0x5a3d5c`
  - middle hill (the tallest; the sun sets behind it): r `0.75 * u`, sy `0.9`, x `0.3 * u`, z `-2.5 * u`, color `0x4a3350`
  - right hill: r `0.6 * u`, sy `0.7`, x `1.2 * u`, z `-2.3 * u`, color `0x5a3d5c`
- **Two little houses** (homes to go back to), each made of walls, a roof and a door:
  - house centres (x, z): left `(-0.55 * u, -1.1 * u)`, right `(0.95 * u, -1.1 * u)`
  - walls: `G.box(0.32 * u, 0.26 * u, 0.28 * u, hx, 0.13 * u, hz)`, color `0xe8d2b0`
  - roof, a four-sided pyramid:
    `new THREE.ConeGeometry(0.27 * u, 0.18 * u, 4).rotateY(Math.PI / 4).translate(hx, 0.35 * u, hz)`, color `0x8a3a2a`
  - door on the front face: `G.box(0.08 * u, 0.14 * u, 0.01 * u, hx + 0.06 * u, 0.07 * u, hz + 0.141 * u)`, color `0x5a3a24`

### 2. Windows that light up as the sun goes down

A separate prop so it can switch on: `windows = solidProp([...], 1.5)`, `windows.position.set(x0, floor, 0)`.
For each house, one window on the front face, left of the door:
`G.box(0.07 * u, 0.07 * u, 0.01 * u, hx - 0.07 * u, 0.15 * u, hz + 0.141 * u)`, color `0xffd060`.
In `step(t)`, after `s` is computed: `windows.visible = !pre && s > 0.5;`

### 3. The sun sets behind the middle hill

Keep the sun prop and its sinking amount `s`, but change its position line to:
`sun.position.set(x0 + 0.3 * u, floor + 1.0 * u - 0.75 * u * s, -3.0 * u);`
(It starts well above the hills and ends with its centre at 0.25u: its bottom stays above the grass, so it never shows
under the ground from a low camera, and its top (0.45u) is hidden behind the middle hill, whose top is at 0.675u and
whose back is at z -2.8u.)

### 4. A shorter walk home

The left child currently walks into the kanji. In the line that computes `d`, change `0.75 * u` to `0.6 * u`.

### 5. Everything else stays

Keep the children, their timeline, wave, walk (except the distance above), visibility rule, the バイバイ! label and the crows exactly as they are.
Update `group.add(...)` to add `land` and `windows` instead of `hills`.

### 6. Update the descriptions and the cost

- The comment block at the top of `q-warm.js` (the two lines starting `//   q-dusk`): describe the new scene: two
  children on a dirt road wave goodbye as the orange sun sinks behind the hills and the windows of their homes light up,
  then walk home opposite ways; crows fly past.
- The catalog line for `'q-dusk'`: the scene now has 5 meshes of its own (sun, land, windows, crows, label) instead of 4,
  so change `pdc(o.who, o.other) + 4` to `pdc(o.who, o.other) + 5`, and update its description text the same way.

## Rules

- Change only those three places: `dusk()` and the header comment in `q-warm.js`, and the `'q-dusk'` line in
  `vignette-catalog.js`. Don't touch any other scene, file or helper.
- Match the surrounding code style: dense lines, `const` declarations chained with commas, no new helper functions,
  no new imports (`THREE`, `G`, `solidProp`, `many` are already imported).
- Don't rename or reorder anything else.

## Checks you must run (paste the real output in the report)

1. `node --check src/effects/vignettes/q-warm.js` (must print nothing).
2. `npm test` (must end with `# fail 0`). If it fails with "Cannot find package 'three'", run `npm install` once and try again.
3. `git diff --stat` (must list only the two files).

You cannot render the scene on this machine. Opus renders it from six angles after you push, so don't claim anything
about how it looks.

## When done

Commit with the message `夕 (q-dusk): ground, dome hills, homes with lit windows; sun sets behind the hills (Qwen test 1)`.
Then fill in the report below (replace the placeholders), and commit that too with the message `Qwen test 1 report`.

## Report (Qwen fills this in)

- What I changed:
  - `src/effects/vignettes/q-warm.js`, `dusk()`: deleted the old `hills` solidProp and added a static `land` prop (grass slab, a dirt road the children stand/walk on, three half-sphere dome hills built with `THREE.SphereGeometry(...).scale(1, sy, 0.4).translate(...)`, and two little houses — walls + a 4-sided-pyramid roof + a door each) placed at `(x0, floor, 0)` with all parts relative to it, exactly the sizes in the plan. Added a separate `windows` solidProp (one lit front window per house, left of each door) placed at `(x0, floor, 0)`, and switched it on in `step(t)` with `windows.visible = !pre && s > 0.5`. Moved the sun to `sun.position.set(x0 + 0.3 * u, floor + 1.0 * u - 0.75 * u * s, -3.0 * u)` so it sinks behind the middle hill. Shortened the walk home: `0.75 * u` -> `0.6 * u` in the `d` line. Updated `group.add(sun, land, windows, crows, a.group, b.group, bye)`. Everything else (children, timeline, wave, walk, visibility rule, the バイバイ! label, the crows) is untouched.
  - `q-warm.js` header comment: rewrote the two `//   q-dusk` lines to describe the new scene.
  - `src/effects/vignette-catalog.js`, `'q-dusk'` line: cost `pdc(o.who, o.other) + 4` -> `+ 5` and updated the description text to match (dirt road, sun behind the hills, windows light up).
- Anything in the plan I could not follow, and why:
  - The `dusk()` scene change, both descriptions, and the cost bump were all done exactly as specified.
  - Check 2 does NOT pass on this machine, but not because of my change. The unit-test phase passes with `fail 0` (63 pass, 1 skipped). The `content check` that runs afterwards reports `docs/REVIEW.md: out of date`, which is a pre-existing, environment-only line-ending issue: this Windows checkout has `core.autocrlf=true`, so the working copy of `docs/REVIEW.md` is materialised with CRLF, while `buildReviewList()` (called by `scripts/check-content.mjs`) emits LF. The two differ only by `\r` on every line (854/854 lines), and `git show HEAD:docs/REVIEW.md` is byte-identical to a fresh `buildReviewList()`. I did NOT rewrite `docs/REVIEW.md` because the plan says to change only `dusk()`/the header in `q-warm.js` and the `'q-dusk'` catalog line; doing so would have committed a spurious whole-file line-ending diff. On a normal (autocrlf-off / LF) checkout the content check passes.
- Output of check 1:
  ```
  $ node --check src/effects/vignettes/q-warm.js
  (no output — clean)
  ```
- Output of check 2 (last 8 lines):
  ```
  ℹ pass 63
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 1
  ℹ todo 0
  ℹ duration_ms 704.3044
  content check FAILED (1):
   - docs/REVIEW.md: out of date with the cards: run `npm run review:list`
  ```
  (Unit tests: `fail 0`. The content-check line above is the pre-existing CRLF issue explained above, unrelated to this change.)
- Output of check 3:
  ```
  src/effects/vignette-catalog.js |  2 +-
  src/effects/vignettes/q-warm.js | 22 +++++++++++++++-------
  2 files changed, 16 insertions(+), 8 deletions(-)
  ```
  (Lists only the two intended files.)
