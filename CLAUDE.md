# Kanji Memory (JP-app): notes for Claude sessions

Anki-style kanji study app for the Samsung Galaxy XR, built as a **WebXR web app** (Chrome on Android XR). Each kanji has a
memorable 3D animation while it is being learned; the animation retires once the learner shows proficiency.
Read this file and docs/ARCHITECTURE.md first; open code only for the part you are changing.

## Ground rules
- Plain ES modules, no bundler, no framework. three.js is vendored in `vendor/three` (`npm run vendor`). No CDNs at runtime.
- Files stay small (about 300 lines max). Every tunable number lives in `src/config.js`.
- Work on branch `claude/kanji-3d-galaxy-xr-uoi522`; GitHub Pages serves it at https://b123radk-blip.github.io/JP-app/ (1-2 min to update).
- Nobody can test in a headset from here. Never claim headset behaviour works; list what the user must check.
- Japanese content accuracy matters more than speed: never invent readings; verify every sentence (below) and keep
  `needsNativeReview: true` until a person has confirmed it.
- Distinctness is the point of the app: two cards must not get look-alike animations (`npm test` runs the similarity check).
- Mnemonics are memory aids (loose stories), never presented as a character's real origin.

## Commands
| | |
|---|---|
| `npm install` | dev dependencies (three, Noto Sans JP source, svg-path-properties) |
| `npm run serve` | http://localhost:8080 (start it detached: `setsid nohup python3 -m http.server 8080 &`) |
| `npm test` | unit tests (`node --test`) + content check + recipe similarity check. Must pass before every push |
| `npm run e2e` | headless Chromium end-to-end run (needs the server); writes `docs/screenshots/app-*.png`. Look at them |
| `npm run preview-shots` | every card through `?preview=1` -> `docs/screenshots/preview/*.jpg` + `preview-sheet.jpg`. Look at the sheet |
| `node scripts/check-recipes.mjs --plan --write` | refresh the generated sections of docs/EFFECTS-PLAN.md (similar pairs, missing pieces) |
| `node scripts/build-kanji.mjs <hex>` / `--all` | KanjiVG strokes + components -> `data/kanji-<hex>.json` (needs `data/source/0<hex>.svg` from raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/) |
| `npm run build:font` | re-subset Noto Sans JP after content adds characters (venv `.venv-font`: fonttools brotli) |
| `python3 scripts/verify-sentences.py` | furigana cross-check with SudachiPy + Open JTalk (venv `.venv-tts`: pyopenjtalk-plus sudachipy sudachidict_core) |
| `npm run voice:list` | regenerate `audio/clips.json` (every clip the content needs). `npm test` fails when it is stale |

Headless Chromium: Playwright is global (`/opt/node22/lib/node_modules`), browser at `/opt/pw-browsers/chromium`; use
`--disable-background-networking` and wait for `load` + `window.__app.ready` (not `networkidle`: blocked Google hosts stall it).
Comparing renders: freeze the frame loop first (`window.__app.app.screen.update = () => {}`), then `seek(t)`; otherwise the
real-time loop moves things between the seek and the screenshot.

## Add a card
1. `curl -o data/source/0XXXX.svg https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/0XXXX.svg` then `node scripts/build-kanji.mjs xxxx`.
2. `content/cards/xxxx.json` (file name = code point in hex; copy an existing card): `meaning`, `primaryReading` (hiragana),
   `readings`, optional `mnemonic` (one line), `effect` (a recipe, below), `sentences` (`segments` of `{ text, reading? }`,
   every kanji segment needs a hiragana reading, + `en` + `verified`). Draft the recipe from docs/EFFECTS-PLAN.md.
3. Add the id to `content/decks/n5.json`. Run `python3 scripts/verify-sentences.py` (rephrase until both analysers agree),
   `npm run voice:list`, `npm run build:font` if new characters, `npm test`, then look at it with `?preview=1&card=xxxx`.

## Write a recipe
`"effect": { "material", "reveal", "particles": [ ≤ 2 ], "scene": [ ≤ 2 ], "backdrop", "motion", "emblem", "parts", "options" }`. Each slot is
`"type"`, `"type:variant"` or `{ "type": ..., options }`; colours may be `"#rrggbb"`. Omitted: `glow` (cyan), `draw`, no
particles, `plain`, `none`, no emblem. A card with no `effect` gets the default (cyan glow that sways). `parts` styles
KanjiVG components: `"parts": { "木": {} }` gives every 木 its shared look (`COMPONENT_LOOKS` in config: 日 gold, 月 silver,
木 wood, 亻/人 skin); `{ "material": ..., "motion": ... }` overrides it (repeated parts, like the two 木 of 林, are staggered).
`options`: `start` (first stroke time), `seed`. Example (休):
`{ "material": "wood", "particles": [{ "type": "leaves", "count": 0.5 }], "backdrop": "sky:night", "emblem": { "type": "zzz", "at": [-0.2, 0.1] }, "parts": { "亻": { "motion": { "type": "lean", "toward": "right" } }, "木": {} } }`
**Clarity first:** a card reads instantly when something on screen *is* the meaning (a scene prop or emblem: the sun,
the fire, the mountains, the river, the lanterns). Material + sky alone is too weak. Keep the kanji contrasting with its
backdrop (no blue water on a blue sky). Check every new card on the preview sheet.
The content check validates recipes (unknown pieces / options / components are errors) and their cost; the similarity check
fails a deck pair at >= 0.9 and lists pairs >= 0.72. Pieces, options (defaults) and costs (draw calls dc, particle slots p,
point lights): `src/effects/catalog.js`. Budget per card (config `EFFECTS.budget`): 160 dc, 2000 p, 3 lights.

| Slot | Pieces (variant key) | Cost |
|---|---|---|
| material | `glow` (`preset`, plus `body emissive glow emissiveK glowK breath`); presets as names: `cyan gold silver jade skin water ice wood stone` (config `MATERIALS`); `heat` (charcoal lit by the reveal front) | glow 6 dc / stroke, heat 3 |
| reveal | `draw` (`tip`: `drops dust sparks`; `speed gap rate`), `ignite` (flame front + sparks) | tip particles 60-170 p |
| particles | `flames embers` (from drawn strokes), `flow` (along strokes), `bubbles mist motes` (`dir up/down/still`, `color`), `rain leaves` (from above); option `count` scales | max 36-900 p each, +1 dc per pool |
| scene | `mountains` (peaks behind the stroke tops, snow caps), `river` (valley panel, fills then flows), `ripples` (a ring where each stroke lands), `tree` (`on`: a component, e.g. `tree:木`; leafy crown behind the strokes), `lanterns` (`n`; one lights per stroke when n = stroke count), `dial` (clock face + sun arc); colour options per prop | 1-7 dc (lanterns 5 n, tree 1 per instance) |
| backdrop | `plain` (`rim`), `halo` (`color size flicker`; grows with the reveal), `sunrise` (first stroke at 1.6 s), `sky` (`preset`: `day dusk night twilight storm forest deep lake morning golden`, config `SKIES`; `moon`, `stars` override) | 0 / 1 / 14 / 1-6 dc, 2 lights |
| motion | `none sway` (`amp speed bob axis phase`; axis `z` rocks from the base) `float pulse drift` (`dir up down left right toward away`, `dist dur`) `lean` (`toward angle`) `tilt count` (`n every amp rest`) | 0 |
| emblem | `arrow` (`dir`) `question zzz clock dots` (`n`); all take `color at` | 2-4 dc (dots n) |

## Add a piece
Implementation in `src/effects/pieces/`, registered in `catalog.js` (options with defaults, `cost`, `desc`) and wired in
`compose.js` (materials, backdrops, scene props) or the piece's own table (`MOTIONS`, `SHAPES`, `KINDS` + `EMIT`). Read the reveal state
from `ctx.rv` (progress, tips, ring times), the light level from `ctx.light`, idle time from `ctx.idle`; draw randomness only
from `ctx.rnd` (seeded, reset by `reset()`) so `seek(t)` is deterministic. Keep the catalog cost equal to what is built
(`npm run e2e` compares them). A truly one-off effect can still be bespoke: a module in `src/effects/index.js` + `ids.js`.

## Voice
No voice ships until the user renders it with VOICEVOX on their PC (docs/VOICEVOX.md, `scripts/voicevox.mjs`). Clip ids
come from the card id (`src/content/clips.js`: `<id>-reading`, `<id>-s1`); the app plays a clip only if
`audio/manifest.json` lists it, and shows the Sound button and `voice.credit` only when clips exist. Open JTalk is used only
by `verify-sentences.py` for analysis.

## Test hooks
`?debug=1` panel (+days, reset, force animation, jump to card); `?today=YYYY-MM-DD` fake clock; `?preview=1` (`card=`,
`deck=`/`cards=`, `recipe=` JSON, `t=` freeze); `window.__app` (`press(id)`, `ids()`, `screenPos(id)`, `seek(t)`, `info()`).
