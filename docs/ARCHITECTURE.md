# Architecture

## Flow
`index.html` -> `src/main.js` -> `app/app.js` builds the shared services and shows a screen:
**home** (deck tiles N5-N1; only enabled decks are pressable) -> **study** (session over due + new cards) -> **done**
(summary, or "all caught up" with Study ahead). `?preview=1` shows **preview** instead (one card's animation, looping, with
its recipe and real cost; Prev / Replay / Pause / Next). Kanji cards and word cards go through the same player. A screen is `create(app, props) -> { name, group, update(dt), dispose(), onPlaced?, onEnvironment? }`.

| Folder | Responsibility |
|---|---|
| `src/config.js` | every tunable: SRS numbers, retirement rule, layout (metres), card timeline, text resolution, colours |
| `src/core/` | `scene` (renderer, camera, root/card groups, frame loop), `xr` (Enter VR/AR, placement, passthrough), `input` + `pick` (mouse, controller and hand rays), `audio` (clips by id), `text` (canvas text, furigana), `clock` (fake days) |
| `src/srs/` | pure logic, unit-tested: `scheduler`, `retirement`, `storage`, `session` (unlock rule for words), `dates` |
| `src/kanji/tube.js` | KanjiVG centre-lines -> merged 3D tubes per part, stroke timing, the glyph row of a word |
| `src/effects/` | composable effects: `catalog` (pure: pieces, options, costs, recipe parsing / validation), `plan` (pure: which strokes form which part, for a kanji or a word), `similarity` (pure), `compose` (builds one card's effect), `pieces/` (materials + the reveal shader, particles, scene props, backdrops, motion, emblems) |
| `src/ui/` | 3D `button`, 2D `debug-panel` |
| `src/app/` | app wiring, `card-player` (also the mnemonic panel), screens (home, study, done, preview) |
| `content/` | cards (kanji `<hex>.json`, words `w<JMdict seq>.json`), decks (card order + `requires`: the kanji each word needs); `src/content/clips.js` derives voice clip ids; `audio/clips.json` lists every clip the content needs, `audio/manifest.json` the ones that exist |
| `data/` | stroke data + KanjiVG components per glyph (kanji and kana), `lexicon/` (words and kanji derived from JMdict, KANJIDIC2 and the JLPT lists) |
| `scripts/` | `data/` (fetch + build the lexicon), `curriculum`, `pick-sentences.py`, `draft-cards` + `lib/` (drafter, word rules, look-alikes), `set-recipes`; build (kanji, font); checks (content, recipes, sentences); e2e, contact sheets; `voice-list` + `voicevox` (run on the user's PC), `review-list` |

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
- **Effects are recipes, not code.** A card's `effect` names one piece per slot (material, reveal, up to 2 particle layers,
  backdrop, motion, emblem) plus per-component styling. New cards need data only, and the similarity check keeps them
  distinct. 日 and 火 were rebuilt as recipes and compared with the old bespoke code with the frame loop frozen: 日 and the
  default effect render pixel-identical, 火 differs only where spark positions are one frame apart.
  Per frame: reveal -> backdrop -> materials -> particle layers -> tip particles -> pools -> motions -> emblem. Shared state:
  `ctx.rv` (stroke progress, tips, when the front reached each sample), `ctx.light` (backdrop light level), `ctx.idle`.
  All particles of one blend mode and space share one instanced mesh (one draw call); all randomness is one seeded generator.
- **Components** come from KanjiVG's `kvg:element` groups (`scripts/lib/kanjivg.mjs`): each part gets its own material
  instance and pivot group, so a component keeps one look across kanji (`COMPONENT_LOOKS`) and can move on its own.
- **Strokes reveal on the GPU.** All strokes of one part are one merged tube mesh with per-vertex `aStroke` (stroke index)
  and `aT` (position along the stroke); the shader discards what is past that stroke's progress (`uProg[stroke]`), and the
  round caps are instanced. A material costs a fixed number of draw calls per part (glow 4, heat 2), whatever the stroke
  count, which is what lets word cards with many glyphs fit the budget.
- **Single strokes can move.** Every glyph material reads a per-stroke offset (`uOff`, from `ctx.so`) in its vertex shader
  and offsets its round caps the same way, so reveals and motions can move strokes without new meshes: `assemble` (strokes
  fly in), `split` (the two sides part), `jiggle`, and the `stamp` / `grow` reveals pose the whole glyph on a pivot at its base.
- **Glyph kinds in words.** The loader tags each character of a word: `kanji` (has its own card: its look), `plain` (a kanji
  outside the plan: neutral grey with furigana over it, from the card's furigana), `hiragana` (the word's material, ivory),
  `katakana` (its own violet preset, so a loanword reads as one). Long kana-only words get a wider row. The furigana labels
  are card text, not effect meshes (the draw-call budget covers the effect only).
- **Words are built from their kanji.** A word card lays its glyphs out in a row (`layoutWord`); each kanji that has its
  own card is drawn with that card's material and parts, kana and other kanji in ivory, so the cue learned on 学 is the
  one seen in 学生. The word's own recipe adds the scene, backdrop, emblem and motion; its stroke reveal is compressed to
  at most `EFFECTS.word.maxReveal` seconds. The left panel shows "Built from: 学 study + 生 life".
- **Kanji chosen by the words they unlock.** From Step 2 the curriculum picks the next kanji greedily: a word still missing
  m kanji gives each 1/m of its level weight (N5 1, N4 0.3, N3 0.1), frequency breaks ties (`scripts/lib/order.mjs`). The
  chosen list is saved (`scripts/data/kanji-plan.json`). Kana-only words and words with kanji outside the plan are spread
  through the new section by usefulness; a kanji outside the plan never holds a word back.
- **Kanji unlock words.** `scripts/curriculum.mjs` orders a level: each kanji, then the words it unlocks, most useful first
  (JMdict priority + Tatoeba frequency). The deck lists each word's kanji (`requires`); the session builder holds a word
  back until all of them were introduced, and allows it the same day, right after its kanji. Words written with one kanji
  are taught by the kanji card. Existing cards keep their ids and place, so progress is never lost.
- **Similarity ignores what neither card uses.** Slots neither recipe uses (particles, scene, emblem, parts) are left out
  of the score; material, reveal, backdrop and motion always count. Before Step 2 "both empty" counted as a match, which made
  any two sparse cards with one shared sky score 0.72.
- **Content is generated, then reviewed.** Meanings and readings come from KANJIDIC2 / JMdict; sentences from Tatoeba,
  kept only when SudachiPy's segmentation and Open JTalk's reading agree; recipes are drafted from rule tables and varied
  until no other card looks alike. The contact sheet review fixes the weak ones (`review.recipe`), and every sentence keeps
  `needsNativeReview` until a person confirms it (docs/REVIEW.md lists them).
- **Cost is declared and checked.** Each piece declares draw calls / particle slots / lights; the content check rejects a
  recipe over `EFFECTS.budget`, and e2e checks that what is built equals the declaration.
- **Mnemonic** (optional, one line): shown left of the kanji with the meaning, under the label "Memory aid (a story, not
  the origin)". Accuracy rules apply to meanings, readings and sentences, not to the story.
- **Voice**: generated by the user with VOICEVOX on their PC (docs/VOICEVOX.md). The script checks VOICEVOX's planned kana
  against the verified reading before saving. The app plays only clips listed in the manifest; with none, it is silent
  and shows no Sound button or voice credit.
- **Placement**: on session start the card is placed 1.2 m in front of where the viewer looks, at eye height, facing them; the card restarts then.

## Known limits / next steps
- Headset behaviour (pinch accuracy, comfort, text sharpness, frame rate with the fire and rain effects) is untested here.
- No voice until the user renders it (docs/VOICEVOX.md). Slow clips (`--slow-too`) are not used by the app yet.
- Pieces still wanted: docs/BATCH-LOG.md.
- One sentence per card (the first); recognition cards only (no English -> word yet); no stats screen; no cloud sync.
