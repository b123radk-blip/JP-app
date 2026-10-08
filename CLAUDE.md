# Kanji Memory (JP-app): notes for Claude sessions

Anki-style kanji **and vocabulary** study app for the Samsung Galaxy XR, built as a **WebXR web app** (Chrome on Android
XR). Each kanji and word has a memorable 3D animation while it is being learned; the animation retires once the learner
shows proficiency. Goal: about 3,000 words + their kanji (docs/ROADMAP.md), in batches (docs/prompts/, docs/BATCH-LOG.md).
Read this file and docs/ARCHITECTURE.md first; open code only for the part you are changing.

## Ground rules
- Plain ES modules, no bundler, no framework. three.js is vendored in `vendor/three` (`npm run vendor`). No CDNs at runtime.
- Files stay small (about 300 lines max). Every tunable number lives in `src/config.js`.
- Work on branch `claude/kanji-3d-galaxy-xr-uoi522`; GitHub Pages serves it at https://b123radk-blip.github.io/JP-app/ (1-2 min to update).
- Nobody can test in a headset from here. Never claim headset behaviour works; list what the user must check.
- Japanese content accuracy matters more than speed: meanings and readings come from the dictionaries (never invent
  them); verify every sentence (below) and keep `needsNativeReview: true` until a person has confirmed it.
- Distinctness is the point of the app: two cards must not get look-alike animations (`npm test` runs the similarity check).
- Mnemonics are memory aids (loose stories), never presented as a character's real origin.
- Generated content never overwrites existing cards. A card's `review` says what is still a draft (`recipe`, `mnemonic`:
  `draft` or `reviewed`).

## Commands
| | |
|---|---|
| `npm install` | dev dependencies (three, Noto Sans JP source, svg-path-properties) |
| `npm run serve` | http://localhost:8080 (start it detached: `setsid nohup python3 -m http.server 8080 &`) |
| `npm test` | unit tests (`node --test`) + content check + recipe check (similarity, look-alikes, contrast). Must pass before every push |
| `npm run e2e` | headless Chromium end-to-end run (needs the server); writes `docs/screenshots/app-*.png`. Look at them |
| `npm run preview-shots` | every deck card through `?preview=1` -> `docs/screenshots/preview-sheet-<n>.jpg` (36 per sheet; `-- 65e5,w1206900` for some cards, `OUT=.cache/review` to keep the committed sheets). Look at them |
| `npm run data:fetch` / `data:build` | open sources -> `.cache/` (gitignored) -> `data/lexicon/` (words, kanji) + sentence candidates |
| `node scripts/curriculum.mjs --level n5 [--plan 150]` | deck order + `requires`; work list of missing cards in `.cache/work/`. `--plan N` picks the next N kanji by how many words they unlock (N5 > N4 > N3, `scripts/lib/order.mjs`) and saves them in `scripts/data/kanji-plan.json`; later runs reuse that plan |
| `.venv-tts/bin/python scripts/pick-sentences.py n5` | one verified Tatoeba sentence per new card (`scripts/data/manual-sentences.json`: written ones, `sentence-review.json`: rejects) |
| `node scripts/draft-cards.mjs --level n5` | writes the new cards (`--dry` to try); kanji from `scripts/data/kanji-designs.json` when designed there, words from `scripts/lib/word-rules*.mjs`; varies drafts until no pair is >= 0.72 (two passes); log in `.cache/work/n5-draft-log.json` |
| `node scripts/look.mjs id,id [--one] [--times -1,0.5,2] [--recipes try.json]` | quick review sheet while designing (needs the server): cropped frames per card; `--recipes` tries recipes from a JSON file (`"id~a": effect`) |
| `node scripts/check-piece-costs.mjs` | builds every emblem, prop, reveal and particle once and compares built cost with the catalog (e2e only covers deck cards) |
| `node scripts/plan-from-designs.mjs` | regenerates the designed-kanji rows of docs/EFFECTS-PLAN.md from `kanji-designs.json` |
| `node scripts/set-recipes.mjs fixes.json` | hand fixes after the contact sheet (`{ id: effect }` or `{ id: { merge: true, effect } }`) |
| `node scripts/set-sentences.mjs --level n5 <ids>` | replace existing cards' sentence with the picker's current choice (after a reject or a written one) |
| `node scripts/check-recipes.mjs --verbose` | lists every pair >= 0.72; `--plan --write` refreshes the generated sections of docs/EFFECTS-PLAN.md |
| `node scripts/build-kanji.mjs <hex>` / `--all` | KanjiVG strokes + components -> `data/kanji-<hex>.json` (downloads `data/source/0<hex>.svg` if missing; kana too) |
| `npm run build:font` | re-subset Noto Sans JP after content adds characters (venv `.venv-font`: fonttools brotli) |
| `python3 scripts/verify-sentences.py` | furigana cross-check with SudachiPy + Open JTalk (venv `.venv-tts`: pyopenjtalk-plus sudachipy sudachidict_core) |
| `npm run voice:list` / `review:list` | regenerate `audio/clips.json` (every clip) / `docs/REVIEW.md` (native-review list). `npm test` fails when either is stale |

Headless Chromium: Playwright is global (`/opt/node22/lib/node_modules`), browser at `/opt/pw-browsers/chromium`; use
`--disable-background-networking` and wait for `load` + `window.__app.ready` (not `networkidle`: blocked Google hosts stall it).
Comparing renders: freeze the frame loop first (`window.__app.app.screen.update = () => {}`), then `seek(t)`; otherwise the
real-time loop moves things between the seek and the screenshot.

## Add cards (a batch)
`curriculum --plan N` -> design the new kanji in `scripts/data/kanji-designs.json` (recipe, mnemonic, the KANJIDIC meanings / reading to show; `keepSky` when the sky is the meaning) -> word rules -> `pick-sentences.py` -> **read every pick** (the English against the card's meaning: homographs such as
入れる いれる / はいれる pass both analysers; reject weak ones with a reason in `scripts/data/sentence-review.json`, or
write one in `manual-sentences.json`, and re-run) -> `draft-cards` -> `voice:list`, `review:list`, `build:font` ->
`npm test` -> `preview-shots` -> fix the weakest drafts and every pair the recipe check lists (`set-recipes`) ->
`npm test`, `npm run e2e` -> log the numbers in docs/BATCH-LOG.md. Kanji designs: `scripts/data/kanji-designs.json` (then `node scripts/plan-from-designs.mjs`); the drafter checks their
meanings and readings against KANJIDIC2 / JMdict. Word looks: one rule per word (`scripts/lib/word-rules-n5b.mjs` notation
`E:emblem B:backdrop S:scene M:motion R:reveal P:particles`).
One card by hand: copy an existing card (file name = id), `node scripts/build-kanji.mjs <hex>` for each new glyph, add the
id to the deck (`cards`, and `requires` for a word), then the same checks.

Kana-only words and words with kanji outside the plan get word cards too: the loader marks each glyph `kanji` (own card,
its look), `plain` (outside the plan: neutral grey, furigana over it), `hiragana` (ivory) or `katakana` (violet), config
`EFFECTS.glyphLooks`. **Kanji card** (`<hex>.json`): `kanji`, `meaning`, `primaryReading` (hiragana), `readings` (`kun`, `on`), optional
`mnemonic` (one line), `effect`, `sentences`. **Word card** (`w<JMdict ent_seq>.json`): `type: "word"`, `word`,
`primaryReading`, `furigana` (per-kanji segments), `meaning`, `pos`, `kanji` (hex ids of taught kanji), `builtFrom`,
`effect`, `sentences`. A word is new only after all its kanji (deck `requires`); its kanji are drawn in their own card's
look, kana in ivory, then the word's scene / backdrop / emblem / motion play. Words of one kanji (山 やま) are taught by
the kanji card. Sentences: `segments` of `{ text, reading? }` (every kanji segment needs a hiragana reading), `en`,
`verified`, `source`; rephrase until `verify-sentences.py` passes.

## Write a recipe
`"effect": { "material", "reveal", "particles": [ ≤ 2 ], "scene": [ ≤ 2 ], "backdrop", "motion", "emblem", "vignette", "parts", "options" }`. Each slot is
`"type"`, `"type:variant"` or `{ "type": ..., options }`; colours may be `"#rrggbb"`. Omitted: `glow` (cyan), `draw`, no
particles, `plain`, `none`, no emblem. A card with no `effect` gets the default (cyan glow that sways). `parts` styles
KanjiVG components: `"parts": { "木": {} }` gives every 木 its shared look (`COMPONENT_LOOKS` in config: 日 gold, 月 silver,
木 wood, 亻/人 skin); `{ "material": ..., "motion": ... }` overrides it (repeated parts, like the two 木 of 林, are staggered;
a part motion such as `wave` makes 刀 chop). `options`: `start` (first stroke time), `seed`. Example (休):
`{ "material": "wood", "particles": [{ "type": "leaves", "count": 0.5 }], "backdrop": "sky:night", "emblem": { "type": "zzz", "at": [-0.2, 0.1] }, "parts": { "亻": { "motion": { "type": "lean", "toward": "right" } }, "木": {} } }`
**Clarity first:** a card reads instantly when something on screen *is* the meaning (a scene prop or emblem: the sun,
the fire, the train, the compass needle pointing south). Material + sky alone is too weak. Keep the kanji contrasting
with its backdrop: ink and metal only on light skies (`day noon morning dawn snow`) and never on the dark road (the recipe
check fails otherwise; `silver` and `chalk` are the light alternatives).
Check every new card on the contact sheet.
The content check validates recipes (unknown pieces / options / components are errors) and their cost; the recipe check
fails a deck pair at >= 0.9, lists pairs >= 0.72, and fails look-alike kanji at >= 0.5 (same KanjiVG stroke types, or
one stroke more / less / different: 人入, 日目, 大犬; `scripts/lib/lookalike.mjs`). Pieces, options (defaults) and costs (draw calls dc, particle slots p, point lights): `src/effects/catalog.js`.
Budget per card (config `EFFECTS.budget`): 160 dc, 2000 p, 3 lights.

| Slot | Pieces (variant key) | Cost |
|---|---|---|
| material | `glow` (`preset`, plus `body emissive glow emissiveK glowK breath cycle`); presets as names: `cyan gold silver jade skin water ice wood stone ivory rose paper ink metal clay cloud chalk pearl fur neon lacquer katakana plain` (config `MATERIALS`); `rainbow` (hue walks round); `heat` (charcoal lit by the reveal front) | glow 4 dc / part, heat 2 / part (strokes reveal on the GPU) |
| reveal | `draw` (`tip`: `drops dust sparks`; `speed gap rate`; `erase`: un-draws backwards and redraws), `ignite` (flame front), `grow` (rises out of its base, sprouts), `stamp` (raised seal slams down, dust), `brush` (a brush draws, ink flicks), `assemble` (strokes fly in) | tip particles 40-220 p; brush 2 dc |
| particles | `flames embers sparks dust` (from the strokes), `flow` (along strokes), `bubbles mist motes hearts notes steam wind kana` (`motes`: `dir up/down/still`; `kana`: hiragana from the font), `footprints` (`dir right left away toward`), `rain leaves snow petals coins` (from above); option `count` scales, `color` | max 25-900 p each, +1 dc per pool |
| scene | `mountains`, `river`, `ripples`, `tree` (`on`: a component; `glyph`: one glyph of a word), `lanterns` (`n`), `dial`, `road` (`dashes false` = a path), `field`, `room` (`kind`: `home classroom kitchen shop station`), `gate` (`close`: doors slide shut), `bridge`; colour options per prop | 1-8 dc (lanterns 5 n, tree 1 per instance, room 6 / 8) |
| backdrop | `plain` (`rim`), `halo` (`color size flicker`; grows with the reveal), `sunrise` (first stroke at 1.6 s), `sky` (`preset`: `day dusk night twilight storm forest deep lake morning golden noon dawn sunset snow indoor`, config `SKIES`; `moon`, `stars` override) | 0 / 1 / 14 / 1-6 dc, 2 lights |
| motion | `none sway` (`amp speed bob axis phase`) `float pulse drift` (`dir`) `lean tilt count grow shrink stretch spin bounce shake wave wag walk blink swim`, and `fly sink roll stand bow hang turn flip shove` (`dir`) `vanish slide`; stroke motions `split` (`axis dist`: strokes either side of the middle move apart and back), `jiggle` | 0 |
| emblem | `arrow` (`dir` incl. `toward away`) `question zzz clock dots` (`n`) `speech eye ear hand foot person heart note lightbulb book yen crescent compass plus calendar stars window bowl cup phone train car bolt sun cloud target house pen`; signs `stop` (止まれ) `check cross exclaim equals repeat swap flag` (`kind start finish japan`) `pin signpost ticket tag pie` (`part`) `trophy gem onsen globe splash rainbow frown`; things `knife umbrella gears camera hammer wrench scale dumbbell weight thermometer` (`level`) `ruler suitcase briefcase bag box mirror glasses shirt shoe bed pot spoon plate frame film mic speaker sheet ring mask alarm bow boomerang`; life `bird cow snail leaf flower bike plane boat stairs blocks puzzle pill hospital museum shield letter`; all take `color at size` | 1-6 dc |

## Add a scene (vignette)
Since Step 2b a card's look is first of all its **scene**: the recipe slot `"vignette": { "type": ..., options }`
(`"hammer-nail:bend"` for short) acts the meaning out with the kanji taking part (上手: a hammer drives a nail in; 押: a
person shoves the kanji along). The rest of the recipe (material, sky ...) stays underneath it. Test for every card:
would a kid who has never seen the kanji guess its meaning from the scene alone? Progress list: docs/REVAMP.md.
- Types, options, descriptions and draw calls: `src/effects/vignette-catalog.js` (pure data; every type also takes `at`
  and `size`). Implementation: a theme module in `src/effects/vignettes/` (`craft.js`, `people.js`, `things.js` ...),
  each `SCENES = { type: create(ctx, spec, stage) -> { group, step(t) } }`, registered in `vignettes/index.js`.
- Timing (`vignettes/timeline.js`): `acts(ctx, t, loop)` gives `setup` (0..1 while the strokes draw), `v` (seconds into
  the looping action), `n`; `timeline(v, { beat: [at, dur, ease] })` eases each beat 0..1; `bump`, `wobble`, `tremble`.
  Write every frame as a pure function of t (no state, no random), and end the action where it started so it loops.
- `stage`: `glyph` (the kanji's pivot: move or turn the whole kanji; keep the recipe's motion `none`), `parts`, `box`,
  `glyphBox(i)`, `offset(si, x, y, z)` (move one stroke), `u` (glyph height: build actors about that tall).
- Props kit (`src/effects/pieces/kit-*.js`): `createHand` (poses open grip point thumbs pinch flat), `createPerson`
  (walk, lean, raise, face), things (hammer, nail, board, plate, ball, heart, burst, stars) and `many()` (one small shape
  many times, one draw call). Articulated props are bone rigs drawn as 2 instanced meshes. Look at a new prop with
  `{ "vignette": "kit" }` (`node scripts/look.mjs 5927~kit --recipes kit.json --cam x,y,d --clip 0,40,760,520`).
- Readable from the learner's seat: actors about a glyph tall, within about 1.5 glyph widths of the kanji, high
  contrast, nothing faster than about 0.3 s; the left side is the story panel and the meaning label sits just under the
  kanji, so scenes play on the kanji itself, to its right, above it, or in depth.
- Similarity: two cards with the same scene type are look-alikes (1); the same type with another variant (上手 / 下手's
  `outcome`) scores `sceneVariant` (0.7); different scenes score 0.
- Variants: a word reuses its kanji's scene with another option (牛 moos, 牛乳 pours milk). Declare it in the catalog
  (`V(dc, desc, { outcome: 'moo' }, 'outcome')`, `dc` may be a function of the options) and dispatch at the top of the
  scene (`if (spec.outcome === 'milk') return milkGlass(ctx, spec, stage)`), with the variant in a `variants*.js` module.
- Families (Step 2c, `vignettes/step1-kit.js`, `step1-time.js`): `withWeek` turns an element scene into its weekday word
  (月曜日 = `moon-wax:week`), `countScene` / `dayScene` give a number's 〜つ / 〜日 words (`three-ducks:count`, `:day`),
  and `this-unit` / `next-unit` / `last-unit` / `every-unit` with `unit` cover 今 来 先 毎 × 年 月 週 日. Reuse them for N4's
  counters and time words. Word variants of a theme module live in its `step1-*v.js` (keeps modules near 300 lines).
- 3D models (trial): `src/effects/models.js` loads glTF files from `assets/models/` (Kenney CC0 packs, License.txt per
  pack); a scene names them in the catalog (`VM(dc, desc, ['dog'])`), clones with `createModel('dog', { height })` and
  poses with `pose('run', t)` every frame (clips: idle walk run sit dance eat gesture-positive ...). Trials of new recipes
  for existing cards: `content/trials/<name>.json`, viewed with `?preview=1&trial=<name>` (Old / New button).
- Trial loop: recipes in a JSON (`"id~a": effect`), `node scripts/look.mjs ids --recipes try.json --times -0.4,1,2.2,3.2
  --clip 150,20,560,340`, fix, then `scripts/set-recipes.mjs`. Word cards: `--clip 90,60,660,300` (the default crops their right edge). Usual fixes: `size` 1.2-1.5 on long words, tilt flat props
  (pools, roads) toward the viewer, a lit doorway behind a silhouette, fake depth on a flat picture. Log: docs/BATCH-LOG.md.
- Check costs: `node scripts/check-piece-costs.mjs vignette`, then `npm run e2e`.

## Add a piece
Implementation in `src/effects/pieces/`, registered in `catalog.js` (options with defaults, `cost`, `desc`) and wired in
`compose.js` (materials, backdrops, scene props) or the piece's own table (`MOTIONS`, `SHAPES`, `KINDS` + `EMIT`). Read the reveal state
from `ctx.rv` (progress, tips, ring times), the light level from `ctx.light`, idle time from `ctx.idle`; single strokes move
through `ctx.so` (3 floats per stroke, reset by the reveal each frame, added to by stroke motions, applied by the materials' shaders); draw randomness only
from `ctx.rnd` (seeded, reset by `reset()`) so `seek(t)` is deterministic. Keep the catalog cost equal to what is built
(`npm run e2e` compares them for every deck card). Look at a new piece on a contact sheet before using it widely.
The most wanted missing pieces are listed in docs/BATCH-LOG.md. A truly one-off effect can still be bespoke: a module in
`src/effects/index.js` + `ids.js`.

## Voice
No voice ships until the user renders it with VOICEVOX on their PC (docs/VOICEVOX.md, `scripts/voicevox.mjs`). Clip ids
come from the card id (`src/content/clips.js`: `<id>-reading`, `<id>-s1`); the app plays a clip only if
`audio/manifest.json` lists it, and shows the Sound button and `voice.credit` only when clips exist. Open JTalk is used only
by `verify-sentences.py` for analysis.

## Test hooks
`?debug=1` panel (+days, reset, force animation, jump to card); `?today=YYYY-MM-DD` fake clock; `?preview=1` (`card=`,
`deck=`/`cards=`, `recipe=` JSON, `t=` freeze); `window.__app` (`press(id)`, `ids()`, `screenPos(id)`, `seek(t)`, `info()`).
