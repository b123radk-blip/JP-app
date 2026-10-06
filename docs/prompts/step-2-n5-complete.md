# Step 2 prompt: N5 complete, kanji chosen by the words they unlock

Continue the Kanji Memory WebXR app in b123radk-blip/JP-app on branch `claude/kanji-3d-galaxy-xr-uoi522` (GitHub Pages
serves it; no new branch, no PR). Read CLAUDE.md, docs/ARCHITECTURE.md, docs/ROADMAP.md and docs/BATCH-LOG.md first and
follow them.

## Goal
Every N5 word gets a card, and the next kanji are the ones that unlock the most words. Raise draft quality first, so fewer
cards need hand fixes. Step 1 hand-fixed 67 of 210 cards (32 %), mostly because the piece that *is* the meaning did not
exist. Target for this step: under 20 %.

## What Step 1 measured (docs/BATCH-LOG.md)
- The N5 deck has 225 cards: 112 kanji and 113 words.
- N5 words still without a card:
  - 354 need a kanji outside the N5 set. Those 330 kanji spread over all levels: N4 110, N3 115, N2 62, N1 33, none 10.
  - 146 are kana only; 58 of them are katakana loanwords (コーヒー, カメラ ...).
  - 一月 was skipped (no sentence passed).
- **JLPT kanji levels do not match the word levels.** Teaching every N4 kanji would unlock only 127 of the 354 words.
  Choosing kanji greedily by the words they unlock does much better: 50 kanji unlock 99 words, 100 unlock 152, 150
  unlock 202, 200 unlock 252.
- The drafts lacked the meaning piece most often. Most wanted: footprints trail (後 先 足 道 千 行 歩), grow / sprout
  reveal (生 花 土 森), stamp reveal (今 五 名 円), brush reveal (九 読 書 語), kana particles (話 言 読 語), split motion
  (八 半 分), arrows toward / away (来 前 後 入).
- The review also asked for: room variants (room is on 15 cards), a knife emblem, a globe or flag (国 語), and a tree for
  whole words (a tree behind a whole word covers the kana).
- Some pieces are on many cards already: calendar 22, arrow 18, dots 18, road 21, room 15. New words should not lean on
  them.

## Decisions already made (do not re-decide)
- **Kanji by unlock value, not by JLPT level.** The curriculum picks the next kanji greedily by how many target words it
  completes, with N5 words weighted above N4 above N3, and kanji frequency breaking ties. This step teaches the ~150
  kanji that unlock the most remaining N5 words (they unlock many N4 / N3 words later too).
- **Words with a kanji outside the plan** (N2 / N1 kanji in N5 words, 椅子): the card draws that kanji in the neutral
  look, with furigana over it. Such a word is placed after the planned kanji it needs; its "Built from" panel lists only
  the taught kanji.
- **Kana-only words get word cards:**
  - their glyphs are kana from KanjiVG;
  - hiragana in `ivory`, katakana (loanwords) in a distinct preset, so the script itself is a cue;
  - the word's scene carries the meaning.

  They enter the deck by usefulness, mixed in from the start of the new section (they are the most frequent words), not
  saved for the end.
- **Existing cards never move or change id;** new cards go after them in `content/decks/n5.json`.
- Content rules, look-alike rule, contrast rule, budgets and `review` fields: as in Step 1 (CLAUDE.md).

## Work, in this order (each step leaves `npm test` green; commit and push after each)
1. **Pieces** (declared cost, e2e cost check, a look on the contact sheet):
   - footprints particle trail; grow / sprout reveal; stamp and brush reveals; kana particles (glyphs from the bundled
     font); split motion (parts move apart and back); arrows `toward` / `away`;
   - room variants as options (classroom, kitchen, shop, station); knife and globe emblems;
   - `tree` anchored to the kanji of a word (not behind the kana).

   Do not re-draft existing cards. Use the new pieces on Step 1 cards only where its review asked for them (後 先 足
   歩 千, 生 花 土, 八 半 分, 国 語, room cards that look alike), with `scripts/set-recipes.mjs`.
2. **Curriculum v2** (`scripts/curriculum.mjs`):
   - the unlock-value order above;
   - planned vs. outside-the-plan kanji in `requires`;
   - kana words mixed in by usefulness.

   Unit tests for the order and for the unlock rule with a kanji outside the plan.
3. **App:**
   - neutral kanji with furigana in word cards;
   - kana-only word cards (layout for 1-8 kana, katakana preset);
   - e2e covering both.
4. **Content:** the ~150 kanji (with mnemonics: write their docs/EFFECTS-PLAN.md rows first), the N5 words they unlock,
   the remaining N5 words with neutral kanji, the 146 kana words, and 一月 if a sentence passes. Word rules in
   `scripts/lib/word-rules.mjs` for the new words (by meaning, not by reusing calendar / arrow / road).
   - Sentences verified as before; Tatoeba first, written ones logged.
   - Read every pick against the card's meaning before drafting. Step 1 rejected 17 more after both analysers had passed
     them: weak English, dropped particles, and a homograph (入れる read いれ in a sentence meaning はいれる).
   - Then `npm run voice:list`, `npm run review:list`, `npm run build:font`.
5. **Review:**
   - contact sheets of every new card;
   - fix the weakest cards and every pair the recipe check lists;
   - log the numbers in docs/BATCH-LOG.md: hand-fix rate against the 20 % target, pieces still wanted, piece use.
6. **Docs:** CLAUDE.md, ARCHITECTURE.md, ROADMAP.md (actual numbers), README. Then write `docs/prompts/step-3-*.md` from
   what was measured: the next kanji by unlock value over the N4 words, and the batch size the measured fix rate allows.

## Constraints
Same as CLAUDE.md:
- files about 300 lines;
- tunables in `src/config.js`;
- effects deterministic for `seek()`;
- no runtime CDNs;
- never claim headset behaviour.

If the session runs short, finish a smaller batch completely (checked, reviewed, logged, pushed) rather than a large one
half-way.

## Final message
- What exists.
- Numbers:
  - cards added (kanji, words with taught kanji, words with neutral kanji, kana words);
  - sentences rejected;
  - hand-fix rate;
  - look-alike pairs.
- Three or four example cards with recipe + mnemonic.
- What still needs the user: headset check, VOICEVOX run for the new clips, native review (docs/REVIEW.md).
- The next step's prompt.
