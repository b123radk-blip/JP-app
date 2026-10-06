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
| `node scripts/curriculum.mjs --level n5` | deck order (kanji, then the words they unlock) + `requires`; work list of missing cards in `.cache/work/` |
| `.venv-tts/bin/python scripts/pick-sentences.py n5` | one verified Tatoeba sentence per new card (`scripts/data/manual-sentences.json`: written ones, `sentence-review.json`: rejects) |
| `node scripts/draft-cards.mjs --level n5` | writes the new cards with drafted recipes (`--dry` to try); log in `.cache/work/n5-draft-log.json` |
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
`curriculum` -> `pick-sentences.py` -> **read every pick** (the English against the card's meaning: homographs such as
入れる いれる / はいれる pass both analysers; reject weak ones with a reason in `scripts/data/sentence-review.json`, or
write one in `manual-sentences.json`, and re-run) -> `draft-cards` -> `voice:list`, `review:list`, `build:font` ->
`npm test` -> `preview-shots` -> fix the weakest drafts and every pair the recipe check lists (`set-recipes`) ->
`npm test`, `npm run e2e` -> log the numbers in docs/BATCH-LOG.md. Kanji mnemonics come from the docs/EFFECTS-PLAN.md rows (write rows for new kanji
first); word looks come from `scripts/lib/word-rules.mjs` (add the batch's words there).
One card by hand: copy an existing card (file name = id), `node scripts/build-kanji.mjs <hex>` for each new glyph, add the
id to the deck (`cards`, and `requires` for a word), then the same checks.

**Kanji card** (`<hex>.json`): `kanji`, `meaning`, `primaryReading` (hiragana), `readings` (`kun`, `on`), optional
`mnemonic` (one line), `effect`, `sentences`. **Word card** (`w<JMdict ent_seq>.json`): `type: "word"`, `word`,
`primaryReading`, `furigana` (per-kanji segments), `meaning`, `pos`, `kanji` (hex ids of taught kanji), `builtFrom`,
`effect`, `sentences`. A word is new only after all its kanji (deck `requires`); its kanji are drawn in their own card's
look, kana in ivory, then the word's scene / backdrop / emblem / motion play. Words of one kanji (山 やま) are taught by
the kanji card. Sentences: `segments` of `{ text, reading? }` (every kanji segment needs a hiragana reading), `en`,
`verified`, `source`; rephrase until `verify-sentences.py` passes.

## Write a recipe
`"effect": { "material", "reveal", "particles": [ ≤ 2 ], "scene": [ ≤ 2 ], "backdrop", "motion", "emblem", "parts", "options" }`. Each slot is
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
| material | `glow` (`preset`, plus `body emissive glow emissiveK glowK breath`); presets as names: `cyan gold silver jade skin water ice wood stone ivory rose paper ink metal clay cloud chalk pearl fur neon lacquer` (config `MATERIALS`); `heat` (charcoal lit by the reveal front) | glow 4 dc / part, heat 2 / part (strokes reveal on the GPU) |
| reveal | `draw` (`tip`: `drops dust sparks`; `speed gap rate`), `ignite` (flame front + sparks) | tip particles 90-120 p |
| particles | `flames embers sparks dust` (from the strokes), `flow` (along strokes), `bubbles mist motes hearts notes steam` (`motes`: `dir up/down/still`, `color`), `rain leaves snow petals coins` (from above); option `count` scales | max 25-900 p each, +1 dc per pool |
| scene | `mountains` (peaks behind the stroke tops), `river`, `ripples` (a ring where each stroke lands), `tree` (`on`: a component, e.g. `tree:木`), `lanterns` (`n`; one lights per stroke when n = stroke count), `dial` (clock face + sun arc), `road` (`dashes false` = a path), `field` (rice paddies), `room` (wall, window, lamp), `gate` (doors slide open); colour options per prop | 1-7 dc (lanterns 5 n, tree 1 per instance, room 6) |
| backdrop | `plain` (`rim`), `halo` (`color size flicker`; grows with the reveal), `sunrise` (first stroke at 1.6 s), `sky` (`preset`: `day dusk night twilight storm forest deep lake morning golden noon dawn sunset snow indoor`, config `SKIES`; `moon`, `stars` override) | 0 / 1 / 14 / 1-6 dc, 2 lights |
| motion | `none sway` (`amp speed bob axis phase`; axis `z` rocks from the base) `float pulse drift` (`dir up down left right toward away`) `lean` (`toward angle`) `tilt count` (`n`) `grow shrink` (`to`) `stretch` (`axis x/y`) `spin bounce shake wave wag walk blink swim` | 0 |
| emblem | `arrow` (`dir`) `question zzz clock dots` (`n`) `speech eye ear hand foot person heart note lightbulb book yen crescent compass` (`dir N E S W`) `plus calendar stars` (`n`) `window bowl cup phone train car bolt sun cloud target house pen`; all take `color at` | 1-4 dc (dots n) |

## Add a piece
Implementation in `src/effects/pieces/`, registered in `catalog.js` (options with defaults, `cost`, `desc`) and wired in
`compose.js` (materials, backdrops, scene props) or the piece's own table (`MOTIONS`, `SHAPES`, `KINDS` + `EMIT`). Read the reveal state
from `ctx.rv` (progress, tips, ring times), the light level from `ctx.light`, idle time from `ctx.idle`; draw randomness only
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
