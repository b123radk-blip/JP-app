# Architecture

## Flow
`index.html` -> `src/main.js` -> `app/app.js` builds the shared services and shows a screen:
**home** (deck tiles N5-N1; only enabled decks are pressable) -> **study** (session over due + new cards) -> **done**
(summary, or "all caught up" with Study ahead). A screen is `create(app, props) -> { name, group, update(dt), dispose(), onPlaced?, onEnvironment? }`.

| Folder | Responsibility |
|---|---|
| `src/config.js` | every tunable: SRS numbers, retirement rule, layout (metres), card timeline, text resolution, colours |
| `src/core/` | `scene` (renderer, camera, root/card groups, frame loop), `xr` (Enter VR/AR, placement, passthrough), `input` + `pick` (mouse, controller and hand rays), `audio` (clips by id), `text` (canvas text, furigana), `clock` (fake days) |
| `src/srs/` | pure logic, unit-tested: `scheduler`, `retirement`, `storage`, `session`, `dates` |
| `src/kanji/tube.js` | KanjiVG centre-lines -> 3D tubes, stroke timing |
| `src/effects/` | `sun` (日), `fire` (火), `default`; shared `glow-glyph` |
| `src/ui/` | 3D `button`, 2D `debug-panel` |
| `src/app/` | app wiring, `card-player`, screens |
| `content/` | cards, decks (data only); `audio/manifest.json` maps clip ids to files; `data/` holds stroke data |

## Decisions and why
- **WebXR, not native.** Fast loop: everything except the headset itself can be built and checked here. Content carries over if we port later.
- **Card stages.** Animation ACTIVE: 3D kanji + effect -> reading (spoken) -> meaning -> example sentence (2D, spoken) -> English -> ratings; a Skip button jumps to the ratings.
  Animation RETIRED: plain 2D kanji + "Show answer" -> everything else at once -> ratings. The example sentence never has a 3D character (cost and clarity).
- **Retirement rule** (`srs/retirement.js`): retired once the ratings since the last lapse include >= 2 Good/Easy on >= 2 different local days. Again or Hard is a lapse: the animation comes back. Numbers in `config.js`.
- **Scheduler** is deliberately simple (Again 10 min; Good walks 1, 3, 7, 14, 30... days; Easy skips a rung; Hard x1.2) behind a small interface (`newState`, `review`, `isDue`, `label`) so FSRS can replace it. Day intervals fall due at local midnight. Note: for a brand-new card Hard and Good both mean 1 day.
- **Session**: due cards first (oldest due first), then new cards (10/day), max 20; Again re-queues the card 3 cards later.
- **Storage**: one versioned JSON object in localStorage. Unreadable or newer-version data is backed up to `<key>:backup`, never silently overwritten; card entries are validated on load and import. Export/import buttons are the safety net (browsers can clear site data). No accounts or sync yet.
- **XR input**: on the session's `select` event (pinch or trigger) we raycast from that input source's target-ray pose; every frame we raycast for hover and draw a small reticle. Desktop uses the same raycast from the mouse. Hidden or disabled buttons are never hit.
- **Text: canvas, not SDF.** Both were rendered side by side (docs/screenshots/text-eval-*.png): equally crisp at reading distance; up close the canvas text was cleaner (SDF showed hairline seams where 熱 / 火 contours overlap). Canvas text measures synchronously, so furigana is exact; no worker or extra library. Resolution ~5000 px/m (about 2.5x the headset's pixel density at 1.2 m). Font: Noto Sans JP (OFL) subset to the characters in use (`assets/fonts/charset.txt`); the content check fails if a card uses a character outside it.
- **Placement**: on session start the card is placed 1.2 m in front of where the viewer looks, at eye height, facing them; the card restarts then.

## Known limits / next steps
- Headset behaviour (pinch accuracy, comfort, text sharpness, frame rate with the fire effect) is untested here.
- Audio is a robotic placeholder for two clips; VOICEVOX via a clip manifest is the plan.
- One sentence per card (the first); no card editing; no stats screen; no cloud sync.
