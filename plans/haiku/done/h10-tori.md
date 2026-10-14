# Report: h10-tori

## What I changed
- `src/effects/vignettes/h-bird.js`: scene `q-bird-branch` (loop 7 s). A small tree (`trunk`, `branch`, `leaves`, named
  meshes), the perched `pigeon` model (`pigeon`, sits on the branch at x 0.82, hops to x 0.88 at 2.4-2.7, yaws left and
  right at 2.0-4.4, leans up while singing), the flying `pigeonFlying` model (swoops in from (0.55, 1.1, 0.2) to the
  branch 0.5-2.0; takes off 4.5-6.2 along a curve to (1.35, 1.1, 0.1), fades 5.8-6.2), and three music notes (`note`,
  `emblemProp('note')`) rising from the beak 2.8-4.0.
- `src/effects/vcat-hb.js`: one line, `'q-bird-branch': VM(8, ..., ['pigeon', 'pigeonFlying'])`.
- `content/cards/9ce5.json`: `effect` set to `{ "material": "jade", "backdrop": "sky:morning", "vignette": { "type": "q-bird-branch" } }`
  (the old `motion: float` is dropped, as the plan says).
- Renders: `plans/haiku/renders/h10-tori.jpg` (orbit), `plans/haiku/renders/h10-tori/` (inspection pictures and report.txt).

## Where I left the plan, and why
- **Flying model size.** At the plan's 0.18u height the `pigeonFlying` model is about 1.08u across its wings (its
  body only about 0.45u long). I set its height to `FLY = 0.075u` so the body is about 0.19u long and the wings about
  0.43u across. The perched `pigeon` is 0.18u tall as planned.
- **Flying bird's turn.** The flying model faces the learner (wings across x), so it is turned 0.3 rad while it swoops
  and turned to face right (RIGHT) during the take-off, so that its wings clear the leaves.
- **Take-off path.** The plan gives only the end point. The path is a curve (control point (0.84, 1.35)) so that the
  bird rises clear of the leaves before it turns right.
- **Leaves.** Leaf offsets moved +0.06 to +0.07u in x and -0.03u in y: the beak and the notes were inside the leaves
  (measured as PASSES INTO / FLOATS ABOVE) and the leaves floated 0.03u above the trunk top.
- **Head turn.** The pigeon model has no head bone, so the whole bird yaws +-0.45 rad (2.0-4.4 s) instead of its head turning.
- **Hop.** The hop is a slide along the branch with a small forward lean; the bird does not leave the branch. A lift
  would fail the "sits on the branch" goal (the inspector treats it as in the air).
- **Flags.** The flying bird and the notes carry `userData.flies` (the kit's "in the air on purpose" mark), so the
  inspector does not list them as floating. Each note's meshes are named `note` so that the goal can count them.
- **Goal "the bird is clearly seen on the branch" FAILS and I did not fix it.** The inspector measures visibility only for
  people and animals with a skeleton (skinned models). `pigeon` is a static model, so the inspector reports "not in the
  learner's view" for it at every moment, although the bird is in the picture (see the learner's seat at t+3.4 in
  `plans/haiku/renders/h10-tori/t3.4-learner.jpg`, where it is small but visible). The goal cannot pass with a static
  pigeon in this inspector; I did not change the goals or the inspector. Opus should decide: a skinned bird model, or
  change the goal.

## Checks (paste the real last lines of each)
```
$ node --check src/effects/vignettes/h-bird.js && node --check src/effects/vcat-hb.js
(no output)
$ npm test   (final run, after the last code change)
# tests 64
# pass 64
# fail 0
content check ok: 848 cards (275 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 848 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
$ node scripts/check-piece-costs.mjs vignette "^q-bird-branch$"
679 recipes, 0 cost mismatches
$ node scripts/orbit.mjs 9ce5 --times 0.9,3.4 --out plans/haiku/renders/h10-tori.jpg
plans/haiku/renders/h10-tori.jpg (looking at 0.60,0.10,0.00)
$ node scripts/inspect.mjs 9ce5 --goals plans/haiku/goals/h10-tori.json --scan 0.25 --loop 7 --times 0.9,3.4,5.2 --out plans/haiku/renders/h10-tori
## Goals: 6 of 7 PASS (checked at every moment measured; a goal passes only if it holds at all of them)
  ... (exit code 1: the one FAIL goal below)
  no measured faults at any moment
```
Full goal lines of the final run:
```
  PASS the kanji stays in view: 31 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the trunk stands on the ground: 31 moments, e.g. t+0: trunk (brown #7a4a24): touches the ground line (bottom of the kanji)
  PASS the bird flies in high (t+0.8 to t+1): 2 moments, e.g. t+1: 0u apart (needs ≤ 0.2)
  PASS the bird sits on the branch (t+2.2 to t+4.3): 10 moments, e.g. t+2.25: pigeon: touches T2 mesh branch (brown #7a4a24)
  FAIL the bird is clearly seen on the branch (t+2.2 to t+4.3): fails at t+2.25 to t+4.25 of 10 moments; t+2.25: pigeon is not in the learner's view
  PASS it sings (t+3.2 to t+3.6): 3 moments, e.g. t+3.25: 2 of 2 note within 0.35u of pigeon (needs ≥ 1)
  PASS nothing passes through the bird (t+2.2 to t+4.3): 10 moments, e.g. t+2.25: nothing passes into it
```
Not run: the headset, `npm run e2e`, `preview-shots` (not in this plan).

## What I see in the render (each of the six views, one line each, and any fault left)
- front: t+0.9 the bird comes in high at the top of the tile (framing cuts its wing tips); t+3.4 it sits on the branch with a note above.
- right side: the tree with its leaves; the bird is small on the branch at t+3.4 and high and small at t+0.9 and t+5.2 (flying away).
- top: the branch runs left from the trunk under the leaves; the bird sits at its right end at t+3.4.
- back-left: the bird sits on the branch at the trunk top at t+3.4; the leaves are clear of it.
- front-right: the bird on the branch and a note above the leaves at t+3.4.
- low front: the bird on the branch, its note above, at t+3.4; the bird is small compared with the kanji (about 0.2u, as the plan says).
- Faults left that I can see: the bird is small in the learner's seat (about 25 px next to a 150 px kanji at 900 px width); the head turn is a whole-body yaw; I could not judge the hop or the take-off at real speed.

## Inspection (paste the POSSIBLE FAULTS lines of the last run, and say for each why it is fine or what is left)
Last full run (`--times 0.9,3.4,5.2`, `--scan 0.25 --loop 7`): no POSSIBLE FAULTS are listed
(`no measured faults at any moment`). Nothing to explain; the one FAIL goal is the visibility goal above, which the
inspector cannot measure for a static model.

## Inspection rounds
- R1 (`--quick`, first build): Goals 5 of 7 PASS. FAIL: clearly seen (static model, not measured); it sings (notes not named as meshes, 0 counted). Faults: the flying bird FLOATS ABOVE the branch (t+1.75, gap 0.06u) and PASSES INTO the leaves (275 points); the flying model 1.08u across; notes FLOAT ABOVE the leaves.
- R2 (`--quick`, flying model height 0.075u, yaw 0.3, curve take-off, leaves moved +x/-y, flies flags, note meshes named): Goals 6 of 7 PASS. Faults: notes FLOAT ABOVE the trunk and leaves (t+3 to t+3.75; the note flag was on the holder only); the flying bird PASSES INTO the leaves at t+4.5 (69 points, wings at take-off).
- R3 (`--quick`, flies flag on the note meshes, take-off yaw RIGHT): Goals 6 of 7 PASS. No measured faults at any moment.
- R4 (full, `--times 0.9,3.4,5.2`, pictures and orbit): Goals 6 of 7 PASS. No measured faults at any moment. The visibility goal still FAILS (see above).
