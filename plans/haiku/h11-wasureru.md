# Plan h11: 忘 "forget" (card 5fd8): a new scene `q-forgot-umbrella`

Plan in words (no code), with goals: `plans/haiku/goals/h11-wasureru.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** forget: a girl walks out of her front door and off down the street, leaving her umbrella in the stand by the door; rain starts, a thought bubble shows the umbrella, she slaps her forehead ("あっ!"), runs back, grabs it and opens it over her head. A child sees "she forgot her umbrella".

## Code
- Scene module `src/effects/vignettes/h-forget.js` (already created and registered; replace its empty `SCENES` with your scene `q-forgot-umbrella`).
- Catalog: one `VM(...)` line for `q-forgot-umbrella` in `src/effects/vcat-hb.js`, models `['gal2']`, with the right cost.
- Card `content/cards/5fd8.json`: set `"effect"` to exactly `{"material": "pearl", "backdrop": "sky:twilight", "vignette": {"type": "q-forgot-umbrella"}}`.

## The scene (loop 7 s)
- A front door (`'door'`): a door in a frame, standing on the ground at x 0.55, z -0.3, facing the learner (0.3 wide,
  0.75 tall), with a small step.
- An umbrella stand (`'stand'`, a short cylinder) on the ground at x 0.78, z -0.2, and in it a closed red umbrella
  (`'umbrella'`, handle up) resting in the stand.
- The girl (`gal2`, `ADULT`): 0 to 0.8 she steps out of the doorway (from z -0.3 to z 0.0 at x 0.6), 0.8 to 2.4 she
  walks (`Walk`) right to x 1.2, z 0.1. 2.4 to 2.8 a few raindrops start to fall (`DROP` with `many`) and a thought
  bubble (white cloud, `name = 'thought'`) with a small umbrella inside pops over her head. 2.8 to 3.2 she stops and
  slaps her forehead with her right hand (`'あっ!'` bubble). 3.2 to 4.6 she turns and hurries back to the stand. 4.6 to
  5.2 she takes the umbrella (`grip` + `hold`, the handle against her palm). 5.2 to 6.0 she lifts it over her head and
  it opens (a red canopy) while the rain falls harder. 6.0 to 7 she fades out and is back in the doorway for the loop,
  the umbrella back in its stand.

## Checks
Every inspect run with `--goals plans/haiku/goals/h11-wasureru.json --scan 0.25 --loop 7` (see common.md). Final run: `--times 1.6,3,5.4`, and the orbit render with `--times 3,5.4`.

## Commit
`忘: a girl forgets her umbrella, remembers in the rain and runs back for it (Haiku, plan h11)`
