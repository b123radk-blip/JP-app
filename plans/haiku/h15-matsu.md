# Plan h15: 待 "wait" (card 5f85): a new scene `q-wait-friend`

Plan in words (no code), with goals: `plans/haiku/goals/h15-matsu.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/h-hurry.js` (a clock with racing
hands, fades by opacity) and `q-send.js`.

**The idea:** a girl waits by a big clock. Its hands race round (time passes), she checks her watch, sighs "まだかな…",
and at last her friend walks in and they wave. A child sees "waiting".

**The layout is already checked** (`plans/haiku/layouts/h15-matsu.json`, every goal passes with the real models): keep
its numbers.

## Code
- Scene module `src/effects/vignettes/h-wait.js` (already created and registered; replace its empty `SCENES` with your scene `q-wait-friend`).
- Catalog: one `VM(...)` line for `q-wait-friend` in `src/effects/vcat-hb.js`, models `['gal2', 'guy2']`, with the right cost.
- Card `content/cards/5f85.json`: set `"effect"` to exactly `{"material": "stone", "backdrop": "sky:day", "vignette": {"type": "q-wait-friend"}}`.

## The scene (loop 8 s)
- A station clock: a grey post (`'post'`, a cylinder radius 0.02, 0.72 tall) standing on the ground at x 0.6, z -0.15,
  and on top of it a round clock (`'clock'`, one group: a white disc radius 0.14 facing the learner, a dark rim, 12
  short dark marks, a short and a long dark hand), its middle at y 0.86. The long hand turns a full circle every second
  and the short hand every 12 seconds, the whole loop (time flying by).
- The girl (`gal2`, `ADULT`) at x 0.92, z 0.02, turned 20° toward +x (toward where her friend will come from).
- The friend (`guy2`, `ADULT`): not seen until 3.9 (opacity 0, as in `h-hurry.js`; he stays in the scene).
- Timing:
  - 0 to 1.0: she stands (`Idle`), looks right (head turned toward +x).
  - 1.0 to 2.0: she raises her left wrist to the point (0.98, 0.5, 0.15) and looks down at it (her watch: a small dark
    band with a white face on that wrist, worn the whole time).
  - 2.0 to 3.6: hand back down; she sighs: a `'まだかな…'` speech bubble pops over her (2.2 to 3.4), and her body sways
    slowly side to side.
  - 3.6 to 4.0: she looks right again. 3.9 to 4.1 the friend fades in at x 1.7, z 0.05, facing -x (turned -90°).
  - 4.0 to 5.0: he walks (`Walk`) to x 1.27, z 0.05, then turns to -60° (toward her and the learner).
  - 5.1 to 6.3: both wave (`wave`, her right hand, his left hand), and a heart pops between their heads.
  - 6.4 to 7.0: he fades out where he stands; 7.0 to 8.0 she stands, looking right, ready for the loop.

## Checks
Every inspect run with `--goals plans/haiku/goals/h15-matsu.json --scan 0.25 --loop 8` (see common.md). Final run: `--times 1.5,2.8,4.5,5.6`, and the orbit render with `--times 1.5,5.6`.

## Commit
`待: a girl waits by a racing clock, checks her watch and sighs until her friend arrives (Haiku, plan h15)`
