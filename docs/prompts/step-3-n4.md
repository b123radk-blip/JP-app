# Step 3 prompt: N4, kanji chosen by the words they unlock

Continue the Kanji Memory WebXR app in b123radk-blip/JP-app on branch `claude/kanji-3d-galaxy-xr-uoi522` (GitHub Pages
serves it; no new branch, no PR). Read CLAUDE.md, docs/ARCHITECTURE.md, docs/ROADMAP.md and docs/BATCH-LOG.md first and
follow them. Step 2b is done (docs/BATCH-LOG.md, docs/REVAMP.md): every N5 Step 2 card is a scene (vignette). Design the
N4 kanji as scenes from the start, the same way, not as emblem recipes (CLAUDE.md "Add a scene").

## Goal
An N4 deck: the next ~150 kanji by unlock value over the N4 words, the N4 words they unlock, the N4 kana-only words, and the
N4 words whose other kanji lie outside the plan (drawn plain). Same quality bar as Step 2: **the main priority is that
every kanji's animation shows its meaning** (something on screen *is* the meaning); build a new piece when nothing fits.
Keep the hand-fix rate under 20 % (Step 2: 12 % of kanji, 2 % of words).

## What Step 2 measured (docs/BATCH-LOG.md)
- The N5 deck has 835 cards (262 kanji, 573 words). 5 N5 words wait for a native check (昨夜 開く 明後日 伯父 一月).
- N4 list: 623 words, 107 kana-only. 154 of the 516 with kanji are already fully covered by the 262 kanji taught.
- Kanji by unlock value over the N4 words (weights N4 1, N3 0.3) complete: 50 kanji -> 80 more N4 words, 100 -> 141,
  **150 -> 183**, 200 -> 218, 250 -> 256. First in line: 急 決 以 産 発 正 品 代 付 内 別 特 予 不 直 注 伝 彼 表 都 ...
- Only 51 JLPT-N4 kanji are still untaught: the unlock order matters more than the level.
- Designing every kanji by hand in `scripts/data/kanji-designs.json`, then one contact-sheet pass, cost 18 fixes in 150.
  Fixes were mostly contrast (clay / jade / gold on a field or sunrise; dark parts on a storm sky) and cues that read as
  something else; plan for that while designing (light material on busy scenes, check a cue's silhouette).
- Reading every sentence pick is still needed: 104 Tatoeba picks were rejected after both analysers passed them. The picker
  now rejects other spellings of the entry and kana matches with the wrong lemma; watch for grammar words read as the
  card's word (〜そうだ, でも as a particle), idioms, and senses other than the card's.
- Data: the JLPT list words some N3 meanings oddly (ちょうだい, ロケット); 早い / 速い share one JMdict entry (the card shows
  the sense that fits the spelling). Expect a few more like that in N4.
- Pieces still wanted: a toothbrush / smile, a station backdrop (駅), electric arcs (電). A map (map-unroll, map-read), a
  projector beam (projector) and a tray (cafe) now exist as scenes.
- Step 2b: 233 scene types, 80 with variants; about a third of the scenes needed one framing fix (size on long words,
  flat props tilted toward the viewer, silhouettes in front of something lit). The weakest were the abstract meanings
  (用 要 有 丈 両 台 題 辞 真): give abstract kanji the most thought.

## Decisions already made (do not re-decide)
- Kanji by unlock value (`node scripts/curriculum.mjs --level n4 --plan 150`), words placed after their last planned kanji,
  kana-only and plain-kanji words spread by usefulness. Existing cards never move or change id.
- The N4 deck is its own deck (`content/decks/n4.json`, enabled in `content/decks/index.json`); its "known" kanji are all
  kanji with a card in N5.
- Kanji designs live in `scripts/data/kanji-designs.json` (recipe, mnemonic, the KANJIDIC meanings / reading to show,
  `keepSky`); EFFECTS-PLAN rows are generated from it (`node scripts/plan-from-designs.mjs`).
- Similarity: slots neither card uses do not count (Step 2); 0 pairs >= 0.72 and every look-alike pair < 0.5 before pushing.
- Content rules, contrast rule, budgets and `review` fields: as in CLAUDE.md.

## Work, in this order (each step leaves `npm test` green; commit and push after each)
1. **Scene lines first.** For each of the ~150 kanji write one line (REVAMP style: "would a kid guess the meaning?") and
   the props it needs; build missing props in the kit (`src/effects/pieces/kit-*.js`), declared cost,
   `node scripts/check-piece-costs.mjs vignette`, a look with `scripts/look.mjs`.
2. **Curriculum** for N4 (multi-deck: the N5 deck's kanji count as known; check the session builder and the home screen
   handle a second enabled deck), with a unit test.
3. **Content:** designs for the ~150 kanji as scenes in theme modules (`src/effects/vignettes/`; the recipe in
   `kanji-designs.json` names the `vignette`), words as variants of their kanji's scene where it fits, word rules for the
   other N4 words (`scripts/lib/word-rules-n4.mjs`),
   sentences verified and read, then `npm run voice:list`, `npm run review:list`, `npm run build:font`.
4. **Review:** contact sheets of every new card (`scripts/look.mjs ids --one`, frame strips with `--times` for motion
   cards); fix the weakest cards and every listed pair; log the hand-fix rate, pieces still wanted, piece use.
5. **Docs:** CLAUDE.md, ARCHITECTURE.md, ROADMAP.md (actual numbers), README, and `docs/prompts/step-4-*.md` (N3) from
   what was measured, with the batch size the fix rate allows.

## Constraints
Same as CLAUDE.md: files about 300 lines; tunables in `src/config.js`; effects deterministic for `seek()`; no runtime CDNs;
never claim headset behaviour. If the session runs short, finish a smaller batch completely (checked, reviewed, logged,
pushed) rather than a large one half-way.

## Final message
What exists; numbers (cards added by kind, sentences rejected, hand-fix rate, look-alike pairs); three or four example cards
with recipe + mnemonic; what still needs the user (headset check, VOICEVOX for the new clips, native review); the next
step's prompt.
