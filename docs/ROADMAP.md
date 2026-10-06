# Roadmap: about 3,000 words and their kanji, each with its own visual cue

**Goal.** Learn kanji *and* vocabulary fast, through visual cues the brain links to each one. About 3,000 words plus the
kanji they are written with. Built in steps over many sessions; every step ships a working app.

## The numbers (JLPT lists, see Sources)

| Through level | Words (cumulative) | Distinct kanji used in those words | JLPT kanji (cumulative) |
|---|---|---|---|
| N5 | 718 (155 kana-only) | 450 | 79 (the app's N5 set has 112) |
| N4 | 1,386 | 784 | 245 |
| N3 | 3,526 | 1,441 | 612 |

So **3,000 words ≈ N5 + N4 + most of N3**, about **3,000 word cards + ~650 kanji cards**. Words also use kanji from
higher levels (N5's 椅子 uses N2's 椅). Those kanji are shown in a neutral style with furigana until their own level
brings a kanji card for them.

## Learning design

1. **Kanji unlock words.** The teaching order is generated: a kanji card comes first, then the words written with it
   follow soon after (学 → 学生, 学校; 日 + 本 → 日本). Every new kanji is reused right away, which is what makes it stick.
   A word becomes "new" only after all its taught kanji have been introduced.
   From Step 2 on, kanji are chosen by **how many target words they unlock**, not by JLPT kanji level: the two do not
   line up. The N5 words still missing after Step 1 need 330 other kanji spread over N4 to N1; all N4 kanji would unlock
   only 127 of those 354 words, while the 150 kanji with the most unlocks complete 202 of them.
2. **Layered visual identity.**
   - Component look: 氵 water, 木 wood, 日 gold, 亻 skin.
   - Kanji look: its own recipe.
   - Word scene: what the word means.

   A word card draws its kanji in their own looks, then adds one strong scene for the word (日本: sunrise over islands).
   You see 学 the same way in 学 and in 学生, so the cue carries over.
3. **Word card.**
   - The word draws in stroke by stroke, each kanji in its own look, kana in a neutral style.
   - Then the word's scene, the reading, the meaning, a "built from" line (学 study + 生 life), an example sentence and the voice.
   - Retired cards (once known) show plain text, as kanji cards do.
4. **Recognition first** (see the word → recall reading and meaning). Production cards (English → word) come later, as an
   option per card.
5. **Kana-only words** (about 20 %) get word cards too: kana glyphs (hiragana ivory, katakana violet: the script is a cue)
   + the word's scene. They are spread through each new section by usefulness (the most frequent words of all).
6. **Kanji outside the plan** (椅子's 椅) are drawn plain grey with furigana over them; they never hold a word back.

## Production pipeline (built in Step 1)

| Piece of content | Source | Done by |
|---|---|---|
| Strokes, components (kanji and kana) | KanjiVG | script |
| Kanji meanings, readings | KANJIDIC2 | script (trimmed to 1-3 meanings) |
| Words, readings, meanings, part of speech | JLPT lists + JMdict | script |
| Per-kanji furigana of a word | KANJIDIC2 readings + alignment | script (special readings like 今日 stay whole) |
| Example sentence + English | Tatoeba | script picks short candidates, segments them with SudachiPy, keeps only those Open JTalk agrees with |
| Animation recipe | component families + meaning rules + similarity check | drafter script, then reviewed on contact sheets |
| Mnemonic (kanji) | | written per batch by the session (one line, labelled as a memory aid) |
| Voice | VOICEVOX on your PC | `scripts/voicevox.mjs` (only new clips) |

Every card records what is still a draft (`review` field) and every sentence keeps `needsNativeReview: true` until a
person confirms it. A generated review list makes that quick.

Sources and licences:
- KanjiVG: CC BY-SA 3.0.
- KANJIDIC2 and JMdict (EDRDG): CC BY-SA 4.0.
- JLPT word and kanji lists: Jonathan Waller (tanos.co.uk), via open-anki-jlpt-decks (MIT) and kanji-data (MIT); only the level assignment is used.
- Tatoeba: CC BY 2.0 FR.

The app's footer credits all of them.

## Steps

| Step | Content | Cards after |
|---|---|---|
| **1. Foundation** (done) | Pipeline, word cards in the app, unlock order, recipe drafter, look-alike check; the other 97 N5 kanji and the 113 N5 words written with N5 kanji only (54 more one-kanji words are taught by their kanji card) | 225 |
| **2. N5 complete** (done) | ~60 new pieces (emblems, reveals, stroke motions, footprints / wind / kana); 150 kanji chosen by unlock value, each designed by hand; 460 words: 154 with taught kanji, 167 with kanji drawn plain, 139 kana-only. 5 words wait for a native check (both analysers read the other reading) | 835 |
| **3. N4** (next) | the next kanji by unlock value over the N4 words + the N4 words they unlock, kana words and words with plain kanji; see docs/prompts/step-3-n4.md | ~1,600 |
| 4-8. N3 | ~350 kanji + ~2,100 words, in ~5 sessions of ~500 cards | ~4,100 |
| Then | Tune the learning with your review history (new cards per day, intervals), production cards, stats screen, cloud sync; N2 if wanted | |

Each step follows the same loop: generate → verify sentences → contact sheets → fix the weakest cards and every look-alike
pair → voice list → `npm test` + e2e → push. The prompt for each step is in `docs/prompts/`; the session that finishes a
step writes the prompt for the next one, using what it measured (how many drafts needed fixing).

**Your part per step** (about 30-60 minutes):
- Flip through the new cards in `?preview=1` on the headset and note weak ones.
- Run `node scripts/voicevox.mjs generate --speaker <id>` and push.
- Work through the native-review list if you have a native speaker.

## App limits to watch

- Font subset: about 3,000 characters, 1-1.5 MB per weight. Fine; can be split per level later.
- Content loads one card at a time; decks are id lists plus unlock rules. Thousands of cards are fine.
- Progress lives in the browser (export / import exists). With thousands of reviews, cloud sync becomes worth adding.
