# Kanji Memory (JP-app)

A spaced-repetition kanji and vocabulary app (like Anki) for the **Samsung Galaxy XR**, where each kanji and each word has
a memorable 3D animation while you are learning it. Runs as a WebXR web app in the headset's Chrome.

**Open:** https://b123radk-blip.github.io/JP-app/ (GitHub Pages, branch `claude/kanji-3d-galaxy-xr-uoi522`; after a push allow
1-2 minutes, then reload or reopen the tab). Press **Enter VR** or **Enter AR**, then point at a deck and pinch.

## What it does now
- Home: deck tiles N5 to N1. N5 has 835 cards: 262 kanji and 573 words, nearly every N5 word; the others say "coming soon".
- Study: new and due cards, 10 new a day. Each kanji comes first, then the words it unlocks: a word is new only once all
  its kanji have been introduced.
- Kanji card: while its animation is active you see the 3D kanji and its animation (built from a recipe of reusable
  pieces: material, reveal, particles, scene, backdrop, motion, emblem), then the reading, the meaning with a short memory
  story, an example sentence with furigana and its English, then Again / Hard / Good / Easy. **Skip** jumps to the ratings.
- Word card: the word draws in with each kanji in its own card's look (the 学 of 学生 looks like the 学 card), then the
  word's own scene; a "Built from" panel shows its kanji and their meanings. A kanji you have not met yet is drawn plain
  grey with its reading above it (椅子); kana-only words draw their kana (katakana in violet, so loanwords stand out).
- After Good/Easy on 2 different days the animation retires: the card shows the plain kanji and "Show answer".
  Again or Hard brings the animation back.
- Progress is saved in the browser; **Export / Import progress** on the 2D page keeps a copy.
- **Preview**: [?preview=1](https://b123radk-blip.github.io/JP-app/?preview=1) plays one card's animation on its own, looping;
  Prev / Next flip through the cards (also in the headset). Contact sheets of all cards: `docs/screenshots/preview-sheet-*.jpg`.
- Readings and sentences come from dictionaries and Tatoeba and are checked by two analysers, but no native speaker has
  confirmed them yet: [docs/REVIEW.md](docs/REVIEW.md) lists them for review.
- Voice: none yet. You generate it with VOICEVOX on your PC: [docs/VOICEVOX.md](docs/VOICEVOX.md).
- Testing aids: add `?debug=1` (panel: add days, reset, force animation, jump to card) and `?today=2026-10-06` (fake date).
- Old prototypes: [prototypes/sun.html](prototypes/sun.html), [prototypes/fire.html](prototypes/fire.html) (moved from `/` and `/fire.html`). WebXR check: [status.html](status.html).

## What to check on the headset
1. Can you press the N5 tile and the rating buttons with a pinch (and with controllers)? Does the pointer reticle land where you aim?
2. Is the card's size, distance and height comfortable? Is the sentence text sharp?
3. Frame rate on 火 and 雨 (the heaviest effects), and on 時 (most strokes).
4. Enter AR: are the sentence panels readable over your room? Skies hide in AR; do the effects still read?
5. Flip through `?preview=1`: does every card look clearly different? Are the emblems (arrow, ?, Zzz, clock, dots) big enough?
6. Word cards (e.g. 電車, 学生, 来週): do the kanji read as the same characters you learned on their own cards? Is a row
   of 3-4 glyphs still sharp and comfortable to read?
7. Long kana words (テープレコーダー, エレベーター): readable at their smaller size? Is the furigana over plain kanji (椅子,
   荷物) big enough?
8. The new motions (立 stands up, 返 flips, 転 rolls, 無 vanishes, 消 erases itself, 切 / 八 split): smooth and comfortable?

## Credits
- Stroke data: [KanjiVG](https://kanjivg.org) © Ulrich Apel, CC BY-SA 3.0 (derived `data/kanji-*.json` same licence).
- Dictionaries: [JMdict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project) and
  [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project), property of the Electronic Dictionary Research and
  Development Group, used under [CC BY-SA 4.0](https://www.edrdg.org/edrdg/licence.html). Derived `data/lexicon/` and the
  meanings and readings on the cards are under the same licence.
- Example sentences: [Tatoeba](https://tatoeba.org), CC BY 2.0 FR (each card lists its sentence ids).
- JLPT levels: Jonathan Waller's lists ([tanos.co.uk](https://www.tanos.co.uk/jlpt/)), via
  [open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks) and
  [kanji-data](https://github.com/davidluzgouveia/kanji-data) (MIT); only the level assignment is used.
- Font: Noto Sans JP, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`) · [three.js](https://threejs.org) (MIT).
Voice clips, once generated, credit "VOICEVOX: <character>" in the app footer.

Developers (and Claude sessions): see [CLAUDE.md](CLAUDE.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), the effects audit [docs/EFFECTS-PLAN.md](docs/EFFECTS-PLAN.md), the plan to about 3,000 words [docs/ROADMAP.md](docs/ROADMAP.md), what each batch made [docs/BATCH-LOG.md](docs/BATCH-LOG.md) and the prompt for the next step ([docs/prompts/](docs/prompts/)).
