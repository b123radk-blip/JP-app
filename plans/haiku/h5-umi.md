# Plan h5: 海 "sea" (card 6d77): a new scene `q-sea-shore`

Plan in words (no code), with goals: `plans/haiku/goals/h5-umi.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** the sea: rows of white-topped waves roll in over a wide blue sea onto a sandy beach; a small girl on the sand jumps back laughing when a big wave washes up to her feet, and a fish leaps out of the sea. A child sees "the sea".

## Code
- Scene module `src/effects/vignettes/h-sea.js` (already created and registered; replace its empty `SCENES` with your scene `q-sea-shore`).
- Catalog: one `VM(...)` line for `q-sea-shore` in `src/effects/vcat-hb.js`, models `['gal2', 'fishBlue']`, with the right cost.
- Card `content/cards/6d77.json`: set `"effect"` to exactly `{"material": "water", "backdrop": "sky:noon", "vignette": {"type": "q-sea-shore"}}`.

## The scene (loop 7 s)
- Sand (`'sand'`): a flat sand-coloured box on the ground, x 0.45 to 1.4, z 0.1 to 0.45, 0.02 thick.
- The sea (`'sea'`): a flat blue box on the ground behind it, x 0.45 to 1.4, z -0.45 to 0.1, 0.015 thick, tilted
  slightly toward the learner if needed so it reads from the seat (keep it on the ground).
- Waves: three long white-topped crests (one mesh each, all named `'wave'`), each as wide as the sea (x 0.5 to 1.35),
  lying on the sea. Each rolls from the back (z -0.4) to the shore line (z 0.1) in 2.3 s, rising to about 0.05u tall
  in the middle of its run and flattening as it reaches the sand, then starts again at the back; the three are spaced a
  third of the way apart.
- Foam (`'foam'`): a thin white sheet on the sand that slides up from the shore line to z 0.32 at 2.5 to 2.9 and back
  down to the shore line at 2.9 to 3.8; hidden otherwise.
- The girl (`gal2`, `KID`) on the sand at x 0.95, z 0.3, turned to face the sea at an angle so the learner sees her
  side and face. 2.8 to 3.4 she jumps back (0.08 up, 0.06 toward the learner) with both arms up, laughing (a small
  `'わあ!'` bubble with `speech`); she lands back on the sand by 3.5.
- A fish (`fishBlue`, about 0.15u long) leaps out of the sea at x 0.7, z -0.2: 4.2 to 5.2 an arc up to y 0.35 and
  back down, turning nose-down as it falls, with a splash of small white drops (`many`) where it goes out and back in.
  Hide it when it is not jumping (under water it would count as sunk).

## Checks
Every inspect run with `--goals plans/haiku/goals/h5-umi.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 1,2.85,4.7`, and the orbit render with `--times 2.85,4.7`.

## Commit
`海: waves roll in on a sandy beach, a girl jumps back from the foam and a fish leaps (Haiku, plan h5)`
