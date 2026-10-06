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

## Commands
| | |
|---|---|
| `npm install` | dev dependencies (three, Noto Sans JP source, svg-path-properties) |
| `npm run serve` | http://localhost:8080 (start it detached: `setsid nohup python3 -m http.server 8080 &`) |
| `npm test` | unit tests (`node --test`) + content check. Must pass before every push |
| `npm run e2e` | headless Chromium end-to-end run (needs the server); writes `docs/screenshots/app-*.png`. Look at them |
| `node scripts/build-kanji.mjs <hex>` | KanjiVG stroke data -> `data/kanji-<hex>.json` (needs `data/source/0<hex>.svg` from raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/) |
| `npm run build:font` | re-subset Noto Sans JP after content adds characters (python venv with fonttools) |
| `python3 scripts/verify-sentences.py` | furigana cross-check with SudachiPy + Open JTalk (venv: pyopenjtalk-plus sudachipy sudachidict_core) |
| `python3 scripts/make-audio.py` | placeholder voice clips (Open JTalk). Real voice will be VOICEVOX later |

Headless Chromium: Playwright is global (`/opt/node22/lib/node_modules`), browser at `/opt/pw-browsers/chromium`; use
`--disable-background-networking` and wait for `load` + `window.__app.ready` (not `networkidle`: blocked Google hosts stall it).

## Add a card
1. `curl -o data/source/0XXXX.svg https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/0XXXX.svg` then `node scripts/build-kanji.mjs xxxx`.
2. `content/cards/xxxx.json` (file name = code point in hex; copy an existing card). `effect` is optional (default effect otherwise).
   Sentence = `segments` (`{ text, reading? }`; every kanji segment needs a hiragana reading) + `en` + optional `audio` id.
3. Add the id to `content/decks/n5.json`. Run `python3 scripts/verify-sentences.py`, `npm run build:font` if new characters, `npm test`.

## Add an effect
`src/effects/<id>.js` exporting `create({ kanji, glyphHeight })` returning `{ group, strokesEnd, step(t, dt), reset(), setPassthrough(bool), dispose() }`;
register it in `src/effects/index.js` and `src/effects/ids.js`. Reuse `kanji/tube.js` (geometry, stroke schedule) and
`effects/glow-glyph.js`. `step` must be deterministic for a given t (seed any randomness) so `seek()` and screenshots work.

## Test hooks
`?debug=1` panel (+days, reset, force animation, jump to card); `?today=YYYY-MM-DD` fake clock;
`window.__app` (`press(id)`, `ids()`, `screenPos(id)`, `seek(t)`, `info()`).
