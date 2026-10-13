# Report: 007-inspect-kit-people

## Version check

`git log -1 --format=%h -- scripts/inspect.mjs` printed `6823c61`; `plans/qwen/README.md` contains the words
`kit person` (one match). Passed.

## Runs

### a (62bc 押, `done in 4 s`)

Whole loop: `no measured faults at any moment`. No faults to judge.

### b (62bc, lifted recipe, `done in 6 s`)

Whole loop:
```
  - t+0 to t+6.5 (worst at t+2): model kit person 1: FLOATS ABOVE the ground line (bottom of the kanji) (gap 0.24u)
```
- the person floats ~0.23–0.24u above the ground line the whole loop: **REAL (planted)**. What told me: the report
  (bottom 0.23 vs the ground) and faults.jpg tiles 1–2, where the boots hang in the air over the dust line.

### c (62bc, onto recipe, `done in 9 s`)

Whole loop:
```
  - t+0, t+3 to t+4.5 (worst at t+0): the kanji: 74% visible (26% behind model kit person 1)
```
- the kanji is 26% hidden behind the person at t+0 (and 17–20% at t+1/t+2.5, below the fault threshold): **REAL (planted)**.
  What told me: the report's "the kanji: 74% visible (26% behind T1)" and faults.jpg tile 1 (learner's seat), where the
  person stands in the middle of the kanji instead of to its left.

### d (592b 夫, `done in 19 s`)

Whole loop:
```
  - t+0 to t+6.5 (worst at t+0): model kit person 2: SUNK INTO mesh white #ffffff (gap -0.28u)
  - t+1, t+6.5 (worst at t+1): model kit person 1 right hand is AT model kit person 2's handL (0.03u): touching or passing through; make sure the plan wants this
  - t+1, t+6.5 (worst at t+1): model kit person 2 left hand is AT model kit person 1's handR (0.02u): touching or passing through; make sure the plan wants this
  - t+3 to t+3.5 (worst at t+3): model kit person 1 PASSES INTO mesh white/white #ffd0e0/#f4f4ff: 67 skin points inside it, near the bones handL
  - t+3 (worst at t+3): model kit person 1 left hand is AT model kit person 2's hair (0.02u): touching or passing through; make sure the plan wants this
  - t+3 (worst at t+3): model kit person 2 right upper arm is AT model kit person 1's armL (0.01u): touching or passing through; make sure the plan wants this
  - t+3.5 (worst at t+3.5): model kit person 1 left upper arm is AT model kit person 2's foreR (0u): touching or passing through; make sure the plan wants this
  - t+3.5 to t+4 (worst at t+3.5): model kit person 2 right upper arm is AT model kit person 1's foreL (0.01u): touching or passing through; make sure the plan wants this
  - t+4 (worst at t+4): model kit person 1 left upper arm is AT model kit person 2's armR (0.03u): touching or passing through; make sure the plan wants this
```
- bride SUNK INTO T5 (her white skirt, 0.28u): **MEANT (tool false positive)** — T5 is her own skirt, listed in the same
  run as "carried or worn by T3 model kit person 2"; legs going into a worn skirt is how wearing works. faults.jpg tiles
  1–2 show the hem at the ground, nothing sunk.
- the two hand-AT-hand lines (t+1, t+6.5): **MEANT** — they hold hands, as the plan says. Tiles 3–6.
- groom PASSES INTO T4 (the veil, #ffd0e0/#f4f4ff, 67 then 14 skin points near handL, t+3–3.5): **REAL (minor)** — the
  plan wants his arm round her shoulders but not through the veil; the measurement is there and tiles 7–8 show his
  left hand/forearm on the far side of the veil at head height.
- groom's left hand AT bride's hair (0.02u, t+3): **MEANT** — the hand rests on top of her head in the embrace. Tile 9.
- the four upper-arm/forearm AT lines (t+3–4): **MEANT** — it is the arm-round-shoulders embrace; the plan describes it.
  Tiles 11–18.

### e (7537 男, `done in 6 s`)

Whole loop:
```
  - t+0.5 (worst at t+0.5): mesh dark brown #3a2414: SUNK INTO mesh brown/grey #8a5a30/#9aa2ae (gap -0.1u)
```
- the furrow strip (T3) sunk 0.1u into the plough (T5) at t+0.5 only: **MEANT** — that is the instant the share cuts the
  furrow, the two meshes are at the same place by design; at t+1 the report says the furrow merely "touches" the plough.
  faults.jpg tiles 1–2 show the blade at the furrow, nothing out of place.

### f (w1159980 医者, `done in 15 s`)

Whole loop:
```
  - t+0 to t+3.5 (worst at t+0.5): mesh grey #8a94a8: FLOATS ABOVE model guy (gap 0.2u)
  - t+0 to t+0.5 (worst at t+0): model doctor: 100% visible; only 1% of it inside the picture
  - t+1 to t+1.5 (worst at t+1): model doctor PASSES INTO mesh red/dark brown #e02020/#404040: 52 skin points inside it, near the bones FistL
  - t+3 (worst at t+3): model doctor PASSES INTO mesh red/dark brown #e02020/#404040: 68 skin points inside it, near the bones Head, Neck, UpperArmR
```
- the grey cloud floating 0.2u above the patient: **MEANT** — a cloud floats. Tiles 1–2.
- the doctor only 1% inside the picture at t+0: **MEANT** — he walks in from the right; tile 3 shows him just off the edge.
- doctor PASSES INTO the red-cross kit near FistL (52 skin points, t+1–1.5): **REAL (minor)** — he carries the kit and his
  left fist is buried in the box, against the house rule (a held thing rests against the palm). Tiles 4–5: from the right
  (tile 5) the kit's face is hidden against his arm/chest rather than resting on his palm.
- doctor PASSES INTO the kit near Head, Neck, UpperArmR (68 skin points, t+3): **REAL** — see "The new checks" for the
  verdict with the close-ups.

## The planted faults (b and c)

- b: the person was lifted off the ground: he FLOATS ~0.23u above the ground line for the whole loop (bottom 0.23 in
  every section, "gap 0.24u" in the whole-loop list), while in case a his bottom is -0.02. The close-ups show the boots
  dangling over the dust. Fixture name "push-lifted" fits.
- c: the person was pushed onto the kanji: from the learner's seat he stands over the middle of the kanji and hides 26%
  of it at t+0 (case a: kanji 98–100% visible, person at x≈0.15–0.33; case c: person at x=-0.27 to -0.94, i.e. shifted left
  into the kanji). Tile 1 of faults.jpg shows it at a glance. Fixture name "push-onto" fits.

## The new checks

- a: yes — the pushing person is in the Things list as `model kit person 1` (0.63 x 0.99 x 0.33, bottom -0.02). The report
  says it "touches the ground line (bottom of the kanji)" and that the learner sees 99% of it (1% behind the kanji) at t+1,
  100% at t+2.5. Both match the pictures: overview tiles 1/3 show the feet on the label line, fully visible beside the kanji.
- d: the report lists 2 things for the groom — `kit person 1` (T1) and `mesh white/black #ffffff/#1a1a24` (T2, his tie,
  called "carried or worn by T1") — and 3 for the bride — `kit person 2` (T3) plus T4 (`#ffd0e0/#f4f4ff`, the veil) and
  T5 (`#ffffff`, the white skirt), both called "carried or worn by T3 model kit person 2". So the bride's separate clothing
  things are the veil and the skirt, and yes, the tool called both of them "carried or worn".
- e: the report now says the plough (T5, brown/grey #8a5a30/#9aa2ae) is "carried or worn by T4 model worker (it moves with
  them)" instead of a thing that must stand on the field. That is right: the man pushes it, so it moves with him, and
  correctly it is no longer asked to touch the field. The only remaining flag is the 0.1u furrow/plough overlap at the
  cutting instant, which is meant.
- f: my call now: **REAL**. At t+3 the doctor's head/neck/upper arm are inside the red-cross kit (68 skin points
  measured, near Head, Neck, UpperArmR). The wider fault close-ups (tiles 6–7) show him doubled over with the kit right at
  his neck, and two `--look` shots of T3 at t+3 confirm it: from front-right the back of his head covers the box with only
  the white cross-face peeking out, and from the left the white top of the kit is wedged directly between his bent neck and
  his head. It is not the kit passing through a standing head; it is his head buried in the kit while he sets it down.
- framing: the wider close-ups are good enough to judge every fault; nothing is unreadable. The tightest tile is case b's
  fault1 (tiles 1–2): the person is cut off at the chest, only the hanging legs and the gap to the ground show — still
  clear, but a little more headroom would make it unmistakable. Case c's tile 1 is the widest (the whole card at small
  scale) but it reads fine.
- opened `.cache/inspect/007-d-husband/kit-person-1-front-t1.jpg`: the file name works; it is the groom close up from the
  front (holding hands with the bride, feet on the ground line).

## Exit codes

Shell: PowerShell, `echo $LASTEXITCODE` on a line of its own after each command.
- `node scripts/inspect.mjs 62bc --strict --scan 0 --out .cache/inspect/007-g-strict-push`
  → report ended "(report saved in .cache/inspect/007-g-strict-push/report.txt; done in 3 s)" and then the code on its own
  line: `0`
- `node scripts/inspect.mjs w1159980 --strict --scan 0 --out .cache/inspect/007-h-strict-doctor`
  → report ended "(report saved in .cache/inspect/007-h-strict-doctor/report.txt; done in 13 s)" and then the code on its
  own line: `1`

The codes are now read correctly (the plan 006 problem was cmd.exe's `%ERRORLEVEL%` from the previous command): the clean
card gives 0, the faulty card gives 1.

## Problems with the tool

- Case d: the tool reports `model kit person 2: SUNK INTO T5 mesh white #ffffff (gap -0.28u)` while the same run lists T5
  as "carried or worn by T3 model kit person 2". The carried-or-worn exemption works one way only: the skirt is not checked
  for standing on anything, but the wearer is still checked for sinking *into* her own worn thing, which a person in a
  long skirt always does (~0.3u of legs). Suggestion: skip the person-vs-own-carried-or-worn pair both ways.
- Case f: the new off-picture check ("model doctor: 100% visible; only 1% of it inside the picture") fires at t+0 while
  the doctor walks in by design. Useful check, just worth knowing it will flag walk-ins.
- `--scan 0` (cases g/h) measures only t+1 and t+2.5, so the t+3 head-in-kit fault does not appear there; that is
  consistent with the flag's name, just noting it.
- No crashes; run times 3–19 s, case d the slowest (two people, nine faults, two fault sheets). Nothing else confusing.
