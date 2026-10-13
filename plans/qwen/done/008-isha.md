# Report: 008-isha (医者 "doctor", card w1159980, scene `q-doctor`)

## What was done

The plan: the doctor now **carries the kit on both palms** (hands under the bottom, kit's middle between the
hands, moving with the hands every frame) and **sets it down with his hands** until its bottom touches the ground
between him and the patient, then lets go.

Changes (all inside `doctor()` in `src/effects/vignettes/models-b.js`, as the plan requires):

- `doc = actor('doctor', 0.9 * u)` instead of `person(...)` (import `actor` from `./model-kit.js`), so the doctor has
  `grip()`; the patient stays a `person()`.
- The kit's middle `C` is driven each frame: at `(docX, floor + 0.5u, 0.175u)` while he walks in, then it follows a
  smoothstep over the first 0.45 s of `T.put` down to `(docX - 0.22u, floor + 0.08u, 0.175u)` (bottom on the ground
  line, 0.35u in front of him, between him and the patient). `kit.position` is set from `C` every frame.
- Both hands grip from below: `doc.grip('R'/'L', target, UP, 0.02u*ws, holdK, { out: 0.4, down: 1.2 })` where the
  target is 0.08u (box half-width, `RO`) to the side, 0.025u behind the middle, and 0.03u **below the bottom** (so the
  kit rests on the palms, never inside a fist). The target is clamped to 0.05u above the ground line while the box is
  on the ground.
- `holdK = 1 - between(T.put, 0.3, 0.3)`: the grip fades as the bottom approaches the ground, so the hands open just
  as the kit is down; afterwards both arms return to the walk/idle pose.
- The bend that sets it down is the existing `PickUp` clip played backwards (unchanged); his turn to face the
  patient (unchanged, `-0.5` by v 2.4).

**Why the numbers are where they are** (measured in the page, not guessed): the doctor's shoulders sit at 0.475u and
are already 0.06–0.10u forward (chibi rig), and his arms reach only ~0.2u. A palm-up-under-the-bottom grip is only
reachable with the box at ~0.5u (not 0.44) and its back at z ≥ 0.11 (at z 0.12–0.16 the shoulders/upper arms pass
into the box's back; at z 0.12 the left shoulder itself sits inside the box's AABB). With the box at 0.5u/0.175u and
the fist aimed 0.03u below the bottom, both palms reach it and only a sliver of the left forearm grazes the box's
back-bottom edge.

The catalog line `q-doctor` stays at 16: `node scripts/check-piece-costs.mjs "^q-doctor$"` → **0 cost mismatches**
(25 dc built = 25 catalog, 6 particle slots, 2 lights, per the inspection footer). No new pieces, no other scenes
touched. `node --check` ok; `npm test` passes (content check ok: 835 cards, recipe check ok, 0 pairs ≥ 0.72).

## Inspection rounds

All rounds: `node scripts/inspect.mjs w1159980 --times 1,3,4 --out plans/qwen/renders/008-isha` (whole-loop list
every 0.5 s; only the kit-related lines are quoted).

### Round 1 — fists aimed at the box's middle (r = 0.11u)

```
  - t+0 to t+1.5: model doctor PASSES INTO mesh red/dark brown: 50–101 skin points inside it, near the bones FistL, FistR, LowerArmL
  - t+3: model doctor PASSES INTO mesh red/dark brown: 68 skin points inside it, near Head, Neck, UpperArmR
```
Saw (faults.jpg): both fists inside the box while carrying (the grip target was at the box's middle, so the IK pulled
the fists into it), and at t+3 his head/neck inside the box on the ground.
Changed: aim the fists **under the bottom** (target = bottom − 0.03u), drop the box with the hands.

### Round 2 — box 0.04u closer to the body (z 0.16u → tried tighter)

```
  - t+0 to t+1.5: 140 skin points near the fists/forearms (worse than round 1)
```
Saw: pulling the box toward the body moved the box into the forearms' path. Changed: moved the box forward again
(z 0.16u) and started the descent/release earlier.

### Round 3 — descent + early release

```
  - t+0: 20 points (LowerArmL); t+0.5: 35; t+1: 47; t+1.5: 41; t+2: 21; t+2.5: 60 (FistL, FistR, LowerArmL)
  - t+3: 4 skin points near FistR   ← the t+3 head-through-kit fault was gone
```
Saw (side close-ups): the set-down was clean, but the fists still settled a few mm inside the box's back-bottom while
carrying. Measured the rig in the page (bone positions vs the box AABB): shoulders at 0.475u and ~0.06–0.10u forward,
arm reach ~0.2u — the fists were being clamped short and landed inside the box's back.
Changed: box up to 0.5u, forward to z 0.175u (clear of the shoulders), fist target 0.03u below the bottom, wider
grip (RO 0.08u), elbow pole lowered (`out 0.4, down 1.2`) so the forearms stay under the box, release timed to the
last 0.3 s of the descent. (An intermediate try with the box at z 0.12u and him turned more toward the camera gave
81 points — the box's back sat in his shoulders — so the box went forward instead.)

### Round 4 (final)

```
  - t+0, t+1 to t+1.5 (worst at t+1): model doctor PASSES INTO mesh red/dark brown: 9 skin points inside it, near the bones LowerArmL, UpperArmL
```
- t+3 and t+4: **no** `doctor PASSES INTO` kit line. t+4: "No measured faults", kit `bottom 0` (on the ground line,
  not sunk, not floating), doctor's hands open at his sides 0.24–0.31u from the kit.
- The whole-loop list's other lines are the expected ones: the grey cloud `FLOATS ABOVE model guy` (meant — it hangs
  over the patient) and `model doctor: 100% visible; only 1% of it inside the picture` at t+0–0.5 (he walks in from
  off the picture).
- Saw (faults.jpg, people.jpg, and the right-side t+1/t+3 views — `scripts/look.mjs` does not run on this machine
  (no CJS `playwright`), so the side close-ups came from the inspect sheets): at t+1 he walks in with the white
  red-cross kit at chest height, arms reaching down to it from below; at t+3 he is bent over the kit on the ground
  between him and the patient, hands at its base. The remaining 9 points (< 10, at the plan's tolerance) are the
  left forearm/upper arm grazing the box's back-bottom edge while he walks — from the learner's seat the kit hides
  that edge (see `t1-learner.jpg`).

## Renders

- `plans/qwen/renders/008-isha.jpg` — orbit, six angles × t+1/t+3/t+4 (carrying, setting down, kit on the ground).
- `plans/qwen/renders/008-isha/` — final inspection sheets (report.txt, faults.jpg, people.jpg, overview.jpg,
  t1/t3/t4 scene views from front/right/learner's seat).

## Checks run

- `node --check src/effects/vignettes/models-b.js` — ok
- `npm test` — passes (unit tests, content check: 835 cards, recipe check: 0 pairs ≥ 0.72)
- `node scripts/check-piece-costs.mjs "^q-doctor$"` — 675 recipes, 0 cost mismatches (catalog unchanged: 16)
- `node scripts/orbit.mjs w1159980 --times 1,3,4 --out plans/qwen/renders/008-isha.jpg` — looked at, reads correctly
  from all six angles
- `npm run e2e` — not run (the plan's check list does not require it; the deck is unchanged, no new pieces)

## For the user to check in the headset

I cannot see the headset; please watch card w1159980 (医者) and confirm:

1. While the doctor walks in (first ~2 s of the loop): the kit rests on **both palms from below** at chest height and
   bobs with his steps; neither fist is visibly inside the box; the red cross reads from the learner's seat.
2. The set-down: the kit descends **with his hands** as he bends, touches the ground between him and the patient, and
   his hands open naturally as it lands (nothing snaps or lags); at no point do his head/neck/chest pass through it.
3. After: the kit sits still on the ground line (not sunk, not floating) until it disappears at the end of the loop.
4. The whole 7.4 s loop plays smoothly with no visible arm/kit clipping from the learner's seat.
