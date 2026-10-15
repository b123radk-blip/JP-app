# Report: 014-chikara-lift

## What I changed

- `src/effects/vignettes/q-power.js` — replaced the stub with the scene `q-power`: guy3 (ADULT, 0.9u) at
  x 0.95, z −0.15, facing the learner, on a blue floor mat (0.95×0.02×0.55, top at y 0). One barbell group:
  steel bar (r 0.015, 0.70 long, x 0.60–1.30) plus two black discs (r 0.2, 0.08 thick, x 0.52–0.60 and
  1.30–1.38) with a light rim on each outer face. Beats (loop 7 s, all plan numbers): 0–0.8 Idle;
  0.8–1.5 bow (k→1) and both hands grip the bar at x 0.82/1.08; 1.5–2.4 the bar's axis eases 0.2→0.5
  (`out`) while the bow comes back; 2.4–4.2 he holds it at his chest, trembling (tremble(v,1.2)·0.005u on
  bar and body) with two sweat drops flying off; 4.2–4.6 it drops 0.5→0.2 (`in`), hands on it until 4.6;
  4.6 the thud — the kanji jumps `bump(v,4.6,0.3)·0.06u` (poseGlyph) and grey dust bursts (0.4 s) at each
  plate's foot; 5.0–6.6 Victory with gold stars orbiting above his head 5.2–6.4; 6.6–7 Idle.
- `src/effects/vcat-qw.js` — q-power cost set to `pdc('guy3') + 8` (mat, bar, two plate discs, two dust
  bursts, stars, sweat = 8 draw calls). Description and models unchanged.

## Where I left the plan, and why

Five places, all small, all forced by the plan's own goals or by the inspector:

1. **Grip targets go through `group.localToWorld`**: `grip`/`handTo` take *world* points (q-ferry's comment
   says exactly this) and the scene group is offset in the world; passing the group-local grip points put the
   hands ~0.2u off the bar (hand goals failed at 0.18u apart).
2. **The plates are two solidProps (`plate L`, `plate R`), not one**: as one merged prop its union box
   (x 0.52–1.38) contains the bar's box, so the inspector read the plates as SUNK INTO the bar (gap −0.21u)
   at every moment and the three rests goals failed. As two discs, each reads "touches floor mat" at rest.
   +1 dc (hence cost +8).
3. **Grip radius is −0.025u, not the plan's +0.015u**: the goal's measured point is the fist (wrist) bone,
   which sits ~0.05u off the palm; with r = +0.015 (palm tangent to the bar) the wrist ends 0.054–0.07u from
   the bar's thin box, so "within 0.04" cannot pass with the plan's r. At r = −0.025 the palm closes on the
   thin bar — a real grip, the bar passes through the fist (which is what a barbell grip is) — and both
   wrists measure 0.03u from the bar.
4. **`bar.userData.flies = true` always, and the plates flip `flies` only while the bar is up**
   (`f > 0.06`): the bar sits at hub height (axis 0.2u → its bottom 0.185u above the mat) even when resting,
   which the inspector would list as FLOATS ABOVE; the plan's rests goals ask only about the plates. While
   held, the plates would likewise read FLOATS ABOVE — the plan's intended lift — so they are marked
   "in the air on purpose" only while up, and read "touches floor mat" at rest.
5. **Dust bursts at x 0.44/1.46 with s 0.16** instead of 0.56/1.36 with s 0.22: centred on the discs' feet
   their boxes intersected the plates' support columns and read SUNK INTO the plates at t 4.65; shifted just
   outside each disc's foot they still kick out from the impact point.

## Checks (real last lines)

- `node --check src/effects/vignettes/q-power.js` / `vcat-qw.js` — OK, no output.
- `npm test`:
  ```
  ℹ tests 64
  ℹ pass 63
  ℹ fail 0
  ℹ skipped 1
  content check ok: 854 cards (281 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
    0 pair(s) at or above 0.72
  recipe check ok
  ```
- `node scripts/check-piece-costs.mjs vignette "^q-power$"`:
  ```
  696 recipes, 0 cost mismatches
  ```
- `node scripts/inspect.mjs 529b --goals plans/qwen/goals/014-chikara-lift.json --times 1.2,3.3,4.65,5.8`:
  `## Goals: 11 of 11 PASS`, whole loop: `no measured faults at any moment`, and `No measured faults.` in
  each of the four time sections.
- `node scripts/orbit.mjs 529b --times 1.2,3.3,5.8 --out plans/qwen/renders/014-chikara-lift.jpg`:
  `plans/qwen/renders/014-chikara-lift.jpg (looking at 0.36,0.03,-0.00)`

Final Goals lines (last run):

```
  PASS the barbell lies on the mat before the lift (t+0 to t+1.4): 4 moments, e.g. t+0: plate L (black/grey #222222/#9aa0a8): touches T2 mesh floor mat (blue #3a6ea5)
  PASS the barbell lies on the mat after he drops it (t+4.7 to t+5.1): 1 moments, e.g. t+5: plate L (black/grey #222222/#9aa0a8): touches T2 mesh floor mat (blue #3a6ea5)
  PASS the barbell still lies on the mat while he cheers (t+5.5 to t+7): 4 moments, e.g. t+5.5: plate L (black/grey #222222/#9aa0a8): touches T2 mesh floor mat (blue #3a6ea5)
  PASS his right hand holds the bar (t+1.5 to t+4.5): 8 moments, e.g. t+1.5: 0.03u apart (needs ≤ 0.04)
  PASS his left hand holds the bar (t+1.5 to t+4.5): 8 moments, e.g. t+1.5: 0.03u apart (needs ≤ 0.04)
  PASS his hands hold the bar apart (t+1.5 to t+4.5): 8 moments, e.g. t+1.5: 0.31u apart (needs ≥ 0.2)
  PASS he holds the barbell up at his chest (t+2.5 to t+4.1): 5 moments, e.g. t+2.5: 0u apart (needs ≤ 0.05)
  PASS nothing passes through him: 18 moments, e.g. t+0: nothing passes into it
  PASS the learner sees him: 18 moments, e.g. t+0: 97% visible (needs ≥ 80)
  PASS the learner sees the kanji: 18 moments, e.g. t+0: 100% visible (needs ≥ 95)
  PASS the plates show big: 18 moments, e.g. t+0: shows 57% as big as the kanji (needs ≥ 10)
```

Rounds:

1. First build (stub → full scene; plates one prop; grip r +0.015; local grip points): **6 of 11** —
   plates SUNK INTO bar (merged box, −0.21u); hands 0.18u from the bar.
2. World-space grip points (`group.localToWorld`), plates split into two discs, bar/plates flies handling:
   **9 of 11** — hands now 0.07u from the bar (wrist-bone offset).
3. Grip radius +0.015 → −0.025 (tried −0.02: 0.03/0.04 apart; −0.025: 0.03/0.03): **11 of 11**, 0 loop faults.
4. Dust moved to x 0.44/1.46, s 0.22 → 0.16 (it read SUNK INTO the plates at t 4.65 in the full inspect):
   **11 of 11**, no faults in the whole loop or at any --times moment.

## What I see in the render

Orbit sheet (three times × six angles; plan times 1.2 bowed grip, 3.3 held at chest, 5.8 cheering):

- **front**: t1.2 he is bowed over the barbell on the mat, both hands on the bar; t3.3 standing, bar at his
  chest, hands gripping, the two big black plates either side; t5.8 both arms flung up with the gold stars
  above his head. The kanji (clay, left) is fully visible in all three.
- **right side**: the near plate (a disc seen face-on) partly screens him — that is the review camera sitting
  in the plate's column; the learner's seat (front) is unaffected and he measures 94–98% visible there.
- **top**: barbell on the mat with him behind it (t1.2), him over the lifted bar (t3.3), arms up with the
  stars (t5.8).
- **back-left**: his back as he bows (t1.2), the bar at his chest seen from behind (t3.3), arms up (t5.8);
  the barbell stays in front of him on its own line in every phase.
- **front-right**: the same three beats at a three-quarter angle; the lift from the mat to the chest reads
  clearly.
- **low front**: from below the mat line the whole barbell and man show; at t5.8 the cheer with the stars is
  readable.

No fault left in any view: nothing floats, sinks or passes through; close-ups confirm the hands grip the bar
in both phases (at t1.2 the bar crosses in front of the bowed fist, at t3.3 it passes through both fists);
the dust (t4.65) and stars are the intended transient effects. A child sees a strong man lifting something
very heavy: huge black plates, the bent heave, the trembling hold with sweat, the thud that jumps the kanji,
and the arms-up cheer.

## Inspection

Last run: `no measured faults at any moment` over the whole loop, and `No measured faults.` in every
--times section — the POSSIBLE FAULTS list is empty (no faults.jpg was produced). The support lines that do
appear, and why each is fine:

- `T3 mesh bar: in the air on purpose` (all times) — the flies flag I set: the bar sits at hub height
  (bottom 0.185u above the mat) whether resting or held; the plan's rests goals name the plates only.
- `T4/T5 mesh plate L/R: in the air on purpose` at t3.3 (held at the chest) — the plan's intended lift; at
  t1.2/t4.65/t5.8 they read `touches T2 mesh floor mat`.
- `T6/T7 mesh grey #9a9a94` (dust) and `T6 mesh yellow #ffd24a` (stars): "in the air on purpose" — transient
  effects (dust 4.6–5.0, stars 5.2–6.4).
- Hands: t1.2 at [0.82,0.26,0.09]/[1.07,0.26,0.08] (0.05u from the bar), t3.3 at [0.78,0.48,0.09]/
  [1.11,0.48,0.08] (0.01u/0.03u from the bar), t5.8 up by his shoulders (Victory). Bodies passing into
  things: none. guy3 94–98% visible; the kanji 100%; the plates show 56–58% of the kanji's size.
