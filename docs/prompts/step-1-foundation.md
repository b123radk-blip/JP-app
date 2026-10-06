# Step 1 prompt: foundation for kanji + vocabulary at scale

Continue the Kanji Memory WebXR app in b123radk-blip/JP-app on branch `claude/kanji-3d-galaxy-xr-uoi522` (GitHub Pages
serves it; no new branch, no PR). Read CLAUDE.md, docs/ARCHITECTURE.md and docs/ROADMAP.md first and follow them.

## Goal
Turn the app from 15 hand-made kanji cards into a pipeline that produces kanji **and vocabulary** cards at a rate of hundreds
per session, with distinct visual cues. Prove it by finishing N5 part 1: every kanji of the app's N5 set (112; 15 exist) and
the N5 words that can be written with them (196). Measure how many drafts needed hand fixes, so later steps can be planned.

## Decisions already made (do not re-decide)
- **Sources:**
  - KanjiVG (strokes and components, kanji and kana).
  - KANJIDIC2 and JMdict from ftp.edrdg.org.
  - JLPT levels from open-anki-jlpt-decks (`src/n*.csv`) and kanji-data (`jlpt_new` only). Never use their WaniKani fields.
  - Tatoeba per-language exports + `jpn_indices`.

  Download into `.cache/` (gitignored) with one script and commit only compact derived files (`data/lexicon/`). Credit
  every source in the footer and README.
- **Ids:** kanji cards keep the code-point id (`65e5`); word cards are `w<JMdict ent_seq>` (`w1206900`). Stroke data for
  every glyph a card draws (kana too) lives in `data/kanji-<hex>.json`.
- **Order:**
  - A curriculum script writes the deck: kanji, each followed soon by the words it unlocks, ordered by usefulness (JMdict
    priority tags, Tatoeba frequency).
  - The deck file also lists which kanji each word needs.
  - A word is introduced only after all its taught kanji have been. Existing pilot cards keep their ids and progress.
- **Word card:**
  - `type: "word"`, `word`, `primaryReading`, `furigana` (per-kanji segments), `meaning`, `pos`, `kanji` (ids of taught
    kanji), `effect`, `sentences`, `source`.
  - The animation draws every glyph of the word in sequence. Each taught kanji uses its own card's materials and parts;
    kana and untaught kanji use a neutral material. Then the word's own scene, backdrop, emblem and motion play.
  - The left panel shows "Built from: 学 study + 生 life" and an optional mnemonic.
- **Content rules:**
  - Meanings and readings come from the dictionaries, never invented.
  - Sentences come from Tatoeba, segmented by SudachiPy (furigana only over kanji, okurigana split off) and kept only when
    Open JTalk agrees (the existing `verify-sentences.py` check).
  - Every sentence keeps `needsNativeReview: true`.
  - Each card has a `review` field (`recipe` / `mnemonic`: `draft` or `reviewed`).
  - Hand-made pilot content is never overwritten.
- **Recipe drafter:**
  - Rules tables (component families, meaning keywords → scene, emblem, particles, motion; contrast-safe backdrops)
    produce a draft for every new card.
  - It then varies the draft until it is below the similarity warning line against the whole deck.
  - It reports which missing pieces its rules wanted, ranked by how many cards wanted them.
- **Look-alike kanji** (same KanjiVG stroke-type sequence, or one stroke apart): their recipes must score below 0.5.

## Work, in this order (each step leaves `npm test` green)
1. Data pipeline:
   - `npm run data:fetch`, `npm run data:build` → `data/lexicon/kanji.json`, `words-n5.json`, sentence candidates.
   - Unit tests for parsing and for furigana alignment.
2. Sentence picker + segmenter (Python, venv `.venv-tts`):
   - Short sentences, preferring known kanji; up to 3 candidates per card.
   - Every pick passes the two-analyser check; cards with no passing sentence are listed, not shipped.
3. Card generator (`scripts/draft-cards.mjs`) for kanji and word cards, plus the curriculum script for the N5 deck.
4. App support for word cards:
   - multi-glyph effect composer;
   - card layout ("Built from" panel);
   - unlock rule in the session builder;
   - preview and debug support;
   - content check, voice list and similarity check for words;
   - e2e covering a word card and the unlock rule.
5. Recipe drafter + look-alike check. Build the pieces the drafter wants most (expect: speech, eye, hand, book, road,
   room / house, person, bowl + steam, coins, car / train, calendar, walk, grow / shrink). Each piece needs a declared
   cost, the cost check, and a look on the contact sheet.
6. Content: all 97 missing N5 kanji (with one-line mnemonics) and the 196 words. Voice list, font subset, sentences verified.
7. Review: contact sheets of every new card (`npm run preview-shots`):
   - fix the weakest ~20% and every look-alike or similar pair by hand;
   - log the numbers in `docs/BATCH-LOG.md`: cards, sentences rejected, drafts fixed, pieces still wanted.
8. Docs: update CLAUDE.md, ARCHITECTURE.md and EFFECTS-PLAN.md, write a native-review list (`docs/REVIEW.md`, generated),
   and write the next step's prompt (`docs/prompts/step-2-*.md`) from what was measured.

## Constraints
- Same as CLAUDE.md: files about 300 lines; tunables in `src/config.js`; effects deterministic for `seek()`; no runtime CDNs;
  never claim headset behaviour.
- Commit and push in working increments (pipeline, then app support, then content), not once at the end.

## Final message
- What exists.
- Numbers: cards added, sentences rejected and why, drafts fixed by hand, look-alike pairs.
- Three or four example cards with recipe + mnemonic.
- What still needs the user: headset check, VOICEVOX run, native review.
- The next step's prompt.
