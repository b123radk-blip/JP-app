# Plan h3: 送 "escort; send" (card 9001): a new scene `q-send-letter`

Plan in words (no code), with goals: `plans/haiku/goals/h3-okuru.json`. Read `plans/haiku/common.md` first. Up to
**six** inspection rounds. Similar finished scenes to read first: `postcard-post` in `src/effects/vignettes/town.js`
(a postcard flies) and `q-meet` in `src/effects/vignettes/q-gestures.js` (two people facing each other, waving).

**The idea:** a girl kisses a letter goodbye and sends it off: it flies like a little bird, flapping, in a high arc over
to a boy on the other side, who catches it on his palm, opens it and a heart pops up. A child sees "she sent it to him".

## Code
- New file `src/effects/vignettes/q-send.js` (scene `q-send-letter`), registered in `src/effects/vignettes/index.js`.
- Catalog: a `VM(...)` entry in `src/effects/vcat-q5c.js` with models `['gal2', 'guy2']` and the right cost.
- Card `content/cards/9001.json`: `effect.vignette` = `{ "type": "q-send-letter" }`.

## The scene (loop 7 s)
- The girl (`gal2`, `ADULT`) at x 0.35, z 0.05, turned to face the boy (and a little toward the learner). The boy
  (`guy2`, `ADULT`) at x 1.2, z 0.05, turned to face her (and a little toward the learner). Both stand on the ground line.
- The letter (`group.name = 'letter'`): a white envelope with a red heart seal (about 0.16u wide), with two small paper
  wings that flap while it flies. Use `emblemProp('letter', ...)` for the envelope or build one from shapes.
- A dotted trail of small pale dots (`many`) follows the letter's path while it flies.
- Timing: 0 to 1 she holds the letter on her right palm at chest height (`grip` + `hold`), lifts it to her face
  (a kiss, a tiny heart). 1 to 1.5 she lifts her arm and lets go. 1.5 to 3.8 the letter flies in a high arc (top about
  0.95u high, at x about 0.75) over to the boy, wings flapping. 3.8 to 4 he raises his right hand, palm up, and it lands
  on his palm (`grip` + `hold`), 4 to 5 he holds it in front of his chest, it opens (the flap lifts) and a red heart
  pops up over it. 5 to 5.8 both wave. 5.8 to 7 the letter fades on his palm and reappears on hers (the loop starts
  again).

## Commit
`送: a girl sends a letter flying over to a boy, who catches it (Haiku, plan h3)`.
