# Plan 022: 鍵 "key" (card w1260490), new scene `q-key-door`

Card: w1260490
Inspect: --loop 8

A new card and a **precise fitting** test: a man pinches a key by its bow (palm against it, never through it) and its
blade goes exactly into a lock on a door; he turns it, and the door swings open. This plan is in words, with **goals**
in `plans/qwen/goals/022-kagi-key.json`. Read `plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`,
`measure`, `try_value`). The layout is checked with the real man (`plans/qwen/layouts/022-kagi-key.json`; there the key
is a ball and the hand only reaches for a point, so its hand faults mean nothing; yours must have none).

**The idea a child should get:** at night a man stands at his locked front door. He puts his golden key in the lock,
turns it, *click*, and the door swings open onto a warm, lit room. A key opens doors.

## Code

- `src/effects/vignettes/q-key-door.js` is a stub: replace it with the scene `q-key-door`, exported as `SCENES`. Start
  the file with a comment describing the scene beat by beat. It is already registered and the card already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-key-door': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Examples: `src/effects/vignettes/q-hat-wind.js` (`grip` on a prop each frame, a prop moving with the hand), `burst`
  in `src/effects/pieces/kit-things.js` (a star flash for the click).

## The door, the key and the man (lengths in u: x from the kanji's right edge, y up, z toward the learner)

- **The door** is turned 45° toward the learner and the kanji (`rotation.y = -π/4`, so its front faces left and toward
  you), standing on the floor with its middle at x 0.95, z −0.1:
  - a frame (`door frame`, dark wood #4a2e1a): two posts and a lintel round a 0.42 × 0.85 opening;
  - behind the opening a warm light panel (`room light`, #ffd27a, glow high) that you see when the door opens;
  - the door itself (`door`, wood #7a4a2a): a box 0.42 wide, 0.85 tall, 0.04 thick, hinged at its right edge (put it in
    a pivot group at the hinge, so it swings about that edge, inward, away from the learner), with a round knob
    (#e0b030) 0.06 in from its left edge at y 0.5;
  - the lock (`lock`, near-black #101010): a small dark disc on the door's front face, 0.06 in from the left edge, at
    y 0.44, on the door so it swings with it.
- **The key** (`gold key`, #e0b030, one solidProp): a bow (a `G.torus` ring, radius 0.045u, tube 0.012u) and a blade
  (a box 0.12u long, 0.02 × 0.01 thick) with two small teeth near its tip. Its pivot is the blade's tip. In the lock the
  blade points straight into the door (along the door's back direction), the tip 0.01u inside the door's face.
- **The man:** `actor('guy3', ADULT * u)`, feet at x 0.56, z 0.02, turned 34° toward the door (`rotation.y = 0.6`).
  His arm is 0.3u. He uses his **left** hand (on the learner's right, toward the door).
- He holds the key by its bow: every frame `grip('L', bow point, toward, 0.012u)` with the palm against the bow's flat
  side (`toward` from his hand to the bow), never with the fist round the bow, and the key placed from the grip.

## Timing (loop 8 s; nothing moves while the strokes draw)

- 0 to 1.0: `Idle`. The door shut. He holds the key up in front of him at about (0.72, 0.45, 0.12), the blade pointing
  at the door; it glints once (a small white star at 0.5).
- 1.0 to 1.7: he brings the key to the lock: the blade lines up with the lock and slides straight in (the last 0.1u of
  the move along the door's back direction), the tip in the lock by 1.85.
- 1.85 to 2.3: he turns it a quarter turn (the key rotates 90° about its blade; his hand turns with it, the grip on the
  bow every frame). At 2.3 *click*: a small yellow star flash at the lock.
- 2.3 to 3.3: the door swings open 75° about its hinge (smooth), the key coming out of the lock at 2.4 (he draws it
  back 0.1u along the blade, then lowers his hand to about (0.70, 0.40, 0.12) by 3.0). The warm light shows through
  the doorway.
- 3.3 to 5.4: he looks at the open door, pleased, and nods (`nod`), the key in his hand.
- 5.4 to 6.4: the door swings shut.
- 6.4 to 8.0: `Idle`, the key back up in front of him, so the loop ends where it started.

## Goals and checks

- After every change: `check_goals` with card w1260490, goals `plans/qwen/goals/022-kagi-key.json`, loop 8.
- "The key's blade is in the lock" measures the key against the lock disc. If it FAILs, `measure` both at a failing
  moment (`what: "gold key,lock,guy3 left hand"`) and fix where the key's tip goes.
- "Nothing passes through him" checks his hand against the key's bow and his body against the door. If it FAILs,
  move the grip point out from the bow (radius + r) or turn the palm.
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-key-door$"`. Then one full inspect run and look at it, above all
  `held.jpg` (the key close up from three sides): `node scripts/inspect.mjs w1260490 --goals
  plans/qwen/goals/022-kagi-key.json --loop 8 --times 0.5,2.0,3.5 --out plans/qwen/renders/022-kagi-key`. Ask
  yourself: would a child see a key opening a door?
- Keep your rounds short: a check after each change, the full inspect only at the end.

## Commit

`鍵: a man unlocks his door with a key (plan 022)`, then the report as the README says. Paste the last Goals lines,
and add one line per round: what you changed, and the N of M PASS you got.
