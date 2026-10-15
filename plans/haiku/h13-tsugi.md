# Plan h13: 次 "next" (card 6b21): a new scene `q-stepping-stones`

Plan in words (no code), with goals: `plans/haiku/goals/h13-tsugi.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Finished scenes to read first: `src/effects/vignettes/q-send.js` and `q-pour.js` (built from plans like this one).

**The idea:** next: a child crosses a pond on stepping stones; each time a yellow arrow points at the next stone, it lights up, she calls "つぎ!" and hops onto it. A child sees "the next one".

## Code
- Scene module `src/effects/vignettes/h-next.js` (already created and registered; replace its empty `SCENES` with your scene `q-stepping-stones`).
- Catalog: one `VM(...)` line for `q-stepping-stones` in `src/effects/vcat-hb.js`, models `['gal2']`, with the right cost.
- Card `content/cards/6b21.json`: set `"effect"` to exactly `{"material": "clay", "backdrop": "sky:golden", "vignette": {"type": "q-stepping-stones"}}`.

## The scene (loop 8 s)
- A pond (`'pond'`): a flat blue oval on the ground, x 0.5 to 1.4, z -0.35 to 0.35, 0.01 thick.
- Four grey stepping stones (flat discs, radius 0.08, 0.04 tall) resting on the pond in a curve: `'stone1'` at x 0.6,
  z 0.25; `'stone2'` at x 0.85, z 0.08; `'stone3'` at x 1.08, z -0.08; `'stone4'` at x 1.3, z -0.22.
- The girl (`gal2`, `KID`), standing on stone 1 at the start, facing along the path (and a little toward the learner).
- Timing: three hops, at 1.0, 2.5 and 4.0 (each 0.5 s: `Jump`, an arc 0.12 high, landing on the next stone). 0.6 s
  before each hop a yellow arrow (`emblemProp('arrow', ..., { dir: 'down' })` or similar, `name = 'pointer'`) appears
  0.25 over the next stone, that stone glows warm yellow, and a `'つぎ!'` bubble pops near her; the arrow and glow go
  when she lands. 4.5 to 6.5 she stands on stone 4 and waves. 6.5 to 7.0 she fades out; 7.0 to 8.0 she fades in on
  stone 1 again.

## Checks
Every inspect run with `--goals plans/haiku/goals/h13-tsugi.json --scan 0.25 --loop 8` (see common.md). Final run: `--times 0.5,0.8,1.6,4.8`, and the orbit render with `--times 0.8,4.8`.

## Commit
`次: a child hops across a pond from stone to stone, an arrow showing the next one (Haiku, plan h13)`
