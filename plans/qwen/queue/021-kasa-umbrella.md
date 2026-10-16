# Plan 021: 傘 "umbrella" (card w1301940), new scene `q-umbrella`

Card: w1301940
Inspect: --loop 8

A new card and a **precise fitting** test: a girl holds an umbrella by its handle (palm against it, never through it),
the shaft must pass beside her head, not through it, and the open canopy must sit over her head. The rain must stop on
the canopy. This plan is in words, with **goals** in `plans/qwen/goals/021-kasa-umbrella.json`. Read
`plans/qwen/CHEATSHEET.md` first and use your tools (`check_goals`, `measure`, `try_value`). The layout is checked with
the real girl (`plans/qwen/layouts/021-kasa-umbrella.json`; there the umbrella is plain cylinders).

**The idea a child should get:** rain pours down on a girl. She lifts her umbrella and opens it over her head: the rain
bounces off it and she stays dry, smiling. Then the rain stops and she closes it.

## Code

- `src/effects/vignettes/q-umbrella.js` is a stub: replace it with the scene `q-umbrella`, exported as `SCENES`. Start
  the file with a comment describing the scene beat by beat. It is already registered and the card already uses it.
- Its catalog line is in `src/effects/vcat-qw.js` (`'q-umbrella': VM(...)`). Keep the description and models; set the
  cost so the cost check passes.
- Examples: `src/effects/vignettes/q-hat-wind.js` (`grip` on a prop each frame), `many()` in
  `src/effects/pieces/kit-things.js` (many raindrops in one draw call; `DROP` is a raindrop shape).

## The girl, the umbrella and the rain (lengths in u: x from the kanji's right edge, y up, z toward the learner)

- The girl: `actor('gal2', ADULT * u)`, feet at x 0.62, z 0, facing the learner. Her arm is 0.28u; a hand reaches up
  to about y 0.83. Her head's top is at about y 0.93.
- The umbrella is one `THREE.Group` named `umbrella` whose pivot is the bottom of the shaft, holding three named
  solidProps:
  - `handle`: a dark J hook (a short `G.torus` half-ring, radius 0.035u, tube 0.012u) at the shaft's bottom,
    dark brown #4a2a18.
  - `shaft`: a thin cylinder, radius 0.01u, 0.62u long, dark grey #303030, going up from the pivot.
  - `canopy`: a red #d03040 cone at the shaft's top, radius 0.38u, 0.12u high (its rim 0.1u below the shaft's top).
    Closed, it is a narrow cone hugging the shaft (scale its radius to 0.12 of open, its height 2.5 times); it opens
    by easing that scale back to 1.
- Her **right** hand (on the learner's left) holds the handle the whole loop: every frame
  `grip('R', handle point, toward, 0.012u)` with the palm against the handle's inside, never with the fist round it.
- **Up:** the shaft's bottom (the hand) at about (0.42, 0.58, 0.06), the shaft leaning a little in, so the canopy's
  middle is at about (0.52, 1.07, 0.0) and its rim's bottom about 0.09u above her head. The shaft passes beside her
  head, never through it (measure!).
- **Down** (closed, at the start): the umbrella hangs from her hand by her side, pointing down, the hand at about
  (0.42, 0.40, 0.06), the tip a little off the floor.
- **The rain:** `many(DROP(u), 60)` named `rain`: drops falling straight down, each a pure function of t (its own x
  in 0.05 to 1.15, z in −0.2 to 0.3, its own phase; a fall from y 1.5 to the floor in about 0.6 s). While the canopy
  is open, a drop over the canopy (within its radius of the canopy's middle, in x and z) stops at the canopy's top and
  turns into a tiny splash (scale up then gone) instead of falling on. Drops elsewhere fall to the floor.

## Timing (loop 8 s; nothing moves while the strokes draw)

- 0 to 0.5: `Idle`, the umbrella closed and down. No rain yet.
- 0.5: the rain starts (fade the drops in over 0.3 s). 0.5 to 1.8: she hunches and holds her left hand over her head
  (`handTo('L', ...)` to just above her forehead), rain falling on her.
- 1.0 to 1.8: she swings the closed umbrella up (rotate the group from pointing down to the up pose, the grip
  following), her left hand comes down.
- 1.8 to 2.4: the canopy opens.
- 2.4 to 6.4: the rain bounces off the canopy; she sways happily side to side a little (small, slow), holding it up.
- 6.4 to 6.9: the rain stops (fade the drops out).
- 6.9 to 7.4: the canopy closes. 7.4 to 8.0: she lowers it back down by her side, so the loop ends where it started.

## Goals and checks

- After every change: `check_goals` with card w1301940, goals `plans/qwen/goals/021-kasa-umbrella.json`, loop 8.
- "Nothing passes through her" checks the shaft and canopy against her head and her hand against the handle. If it
  FAILs, `measure` what it names at the failing moment (`what: "gal2 right hand,handle,shaft,gal2 head (middle)"`)
  and move the hand or lean the shaft, keeping the canopy over her head.
- When every goal passes, run the usual checks from the README: `node --check` on the files you changed, `npm test`,
  `node scripts/check-piece-costs.mjs vignette "^q-umbrella$"`. Then one full inspect run and look at it, above all
  `held.jpg` (the handle close up from three sides): `node scripts/inspect.mjs w1301940 --goals
  plans/qwen/goals/021-kasa-umbrella.json --loop 8 --times 0.4,1.4,3.5,7.6 --out plans/qwen/renders/021-kasa-umbrella`.
  Ask yourself: would a child see rain, an umbrella opening, and a girl staying dry?
- Keep your rounds short: a check after each change, the full inspect only at the end.

## Commit

`傘: a girl opens her umbrella in the rain (plan 021)`, then the report as the README says. Paste the last Goals
lines, and add one line per round: what you changed, and the N of M PASS you got.
