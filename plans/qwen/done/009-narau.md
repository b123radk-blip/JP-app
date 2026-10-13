# Report: 009-narau (習う "to take lessons", card w1333070, scene `q-piano-lesson`)

## What was done

The plan: make the lesson easy to see — **both players fully in view with hands on the keys**, the **keyboard not
between the player and the learner**, the whole **scene within 1.2u** of the kanji's right edge, and **bigger notes**
(≈1.5×, a little higher, each in its key's colour). The story and timing are unchanged: the grandma plays three coloured
notes (red, yellow, blue), the girl watches her hands, then plays the same three on her toy keyboard, the grandma nods,
じょうず!

All changes are inside `piano()` in `src/effects/vignettes/q-music.js`, exactly as the plan requires. `keyboard()`
(its width / colour / key-height arguments, all in u) is unchanged; the file is 305 lines (+5).

- **Turn each player together with her keyboard toward the kanji.** `ry = -0.85` rad, applied to the person *and* the
  keyboard group. The learner now sees the player from the front-side and the keyboard from its **end**, so the key bed
  no longer stands between the player and the learner. (The plan suggested 0.5–0.7 rad as one option; 0.85 reads the
  end-on keys more clearly and still meets every number below, so I used it.)
- **Keyboards lowered and narrowed, top at the waist.** big `keyboard(u, 0.48, …, 0.16)` (was wider / taller), small
  `keyboard(u, 0.30, …, 0.15)`. The top sits at the player's waist, not chest, so the body and hands stay in view.
- **Closer, and the girl pulled in from the edge.** Grandma `gx = maxX + 0.32u` (nearest the kanji), girl `kx = gx +
  0.62u`. Each keyboard is `D = 0.26u` in front of its player along the facing direction. The girl's right edge is now
  ~1.14u (was ~1.3–1.5u at the picture's edge).
- **Notes 1.5× and higher, in a fan that clears the heads.** `NOTE(u, 1.5)`. Each note pops at its key's colour, rises
  **0.8u in 0.5 s** (past both players' heads), in a three-note fan (±0.05u) aimed into the **gap between the two
  players**, at that player's own depth — so the cloud sits in the middle and does not drift in front of either face.

## Inspection rounds

All rounds: `node scripts/inspect.mjs w1333070 --times 1,3.5,5.5 --out plans/qwen/renders/009-narau` (whole loop every
0.5 s from t+0 to t+6.5; the whole-loop summary + the three seat lines are quoted).

### Round 1 — players + keyboards turned ~0.85 rad, keyboards lowered

Turning the keyboards end-on did the main job: the big, front-facing keyboards that had hidden the bodies are gone.
But the note cloud (rising at the girl's depth) started covering the **grandma's** right side at t+3.5 and the **girl's**
face at t+4.5 — the two players are only ~0.5u apart.

### Round 2 — pull the notes back to each player's depth, reduce spread

The notes now rise beside their own player instead of in front. The girl's notes still drifted **left** (toward the
grandma) because they rise from the keys across the keyboard width, while the offset needed to clear the girl's own face
pushed the leftmost (red) note onto the grandma. A left/right trade: fixing one face un-fixed the other.

### Round 3 — shift the note cloud left + rise higher

Moved the cloud toward the gap and up. The girl's t+4.5 dip cleared, but the grandma's t+3.5 dip returned (~81–83%).
Root cause (measured): the gap between the players is only ~0.08u wide, so a three-note fan at face height **always**
overlaps one of them — the cloud cannot sit in the gap at face height.

### Round 4 — notes rise fast and high, past the heads, in a small fan into the gap

Instead of moving the cloud sideways (which trades occlusions), the notes now pop, rise **0.8u in 0.5 s** to above both
heads, and fade up there, fanned ±0.05u toward the middle gap at each player's depth. Both dips cleared:

```
  ## The whole loop …   no measured faults at any moment
  t+1   grandma 92% · girl 89% · kanji 99%
  t+3.5 grandma 89% · girl 89% · kanji 99%
  t+5.5 grandma 88% · girl 87% · kanji 99%
```
"no measured faults at any moment" means every 0.5 s step (t+0→t+6.5) is ≥85% and fully inside the picture for both
players. Right edges: girl worst **1.14u** (t+5.5, centre 1.0 + 0.29/2), jōzu label 1.03u, keyboards ≤0.93u — all ≤1.2u.
Rests-on: grandma `is on` her stool (T1, "check it sits right" — confirmed in the close-ups, she is seated on it) and the
girl `touches the ground line`; the じょうず! bubble `FLOATS ABOVE` (gap 0.64u) — the expected/fine case.

### Round 5 — playing hands closer to the keys

Lowered the hand hover (`0.07→0.04u`) so the playing hand rests nearer the keys:

```
  t+1   grandma right hand 0.09u from her keyboard
  t+3.5 girl    right hand 0.08u from her keyboard
```
The target is at `kb.top + 0.04u` (just over the key surface). The measured fist sits ~0.08–0.09u above the key top:
the sitting model's arm cannot reach the fist lower than ~0.32u from this pose — I verified `down: 0.9→1.3` (and a
higher target) move it not at all, so the residual is the model's reach limit, not a targeting error. It is just over
the plan's ~0.05u target; from the learner's seat the hand reads as on the keys (see `t1-learner.jpg`). Left as-is
rather than lift the hand off the keys.

## Renders

- `plans/qwen/renders/009-narau.jpg` — **after**: orbit, six angles × t+1/t+3.5/t+5.5.
- `plans/qwen/renders/009-narau-before.jpg` — **before**: same six angles × times, from the pre-change code (git stash).
  Players face the learner with wide keyboards in front of them (bodies/hands hidden); the red note overlaps the player
  at t+3.5.
- `plans/qwen/renders/009-narau/` — final inspection sheets (report.txt, faults.jpg, overview.jpg, and t+1/t+3.5/t+5.5
  from front / right / the learner's seat).

## Checks run

- `node --check src/effects/vignettes/q-music.js` — ok
- `npm test` — passes (content check ok: 835 cards, recipe check ok, 0 pairs ≥ 0.72)
- `node scripts/check-piece-costs.mjs vignette "^q-piano-lesson$"` — 675 recipes, **0 cost mismatches** (the catalog line
  in `src/effects/vcat-q4c.js` was left unchanged, as the plan says to only touch the `+ 6` if the check demands)
- `node scripts/orbit.mjs w1333070 --times 1,3.5,5.5` — before + after sheets, looked at, read correctly from all six angles
- `node scripts/inspect.mjs w1333070 --times 1,3.5,5.5` — final, "no measured faults at any moment", seat lines above
- `node scripts/look.mjs …` — **not run**: on this machine it hard-codes `createRequire('/opt/node22/lib/node_modules/_')`
  (a non-portable path, a pre-existing issue, not from this change), so it cannot find playwright. The learner's-seat
  check it does was covered by the inspect sheets instead: `t1-learner.jpg` / `t3.5-learner.jpg` / `t5.5-learner.jpg`
  show both players fully in the learner's view and the scene within the preview (no "outside the picture" warnings).

## For the user to check in the headset

I cannot see the headset; please watch card w1333070 (習う) and confirm:

1. From the seat, both players' **whole bodies are in view** for the whole loop and the keyboards no longer hide them
   (the keyboards read end-on; the red/yellow/blue keys are visible).
2. The grandma **sits on her stool** and the girl **stands on the ground**; neither is sunk, floating, or off the picture.
3. Each player's hand reads as **pressing the keys** while she plays (note: the measured hand-to-key gap is ~0.08–0.09u,
   a touch more than the 0.05u target, because the sitting model's arm can't reach lower — judge how close it *looks*).
4. The three notes are clearly **bigger** and in the three key colours (red, yellow, blue), rising above the players and
   staying out of their faces; the girl's cloud does not cover the grandma and vice-versa.
5. The じょうず! bubble floats up at the end (that is meant) and the 7.4 s loop plays cleanly.
