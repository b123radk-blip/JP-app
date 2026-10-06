# Kanji Memory (JP-app)

A spaced-repetition kanji app (like Anki) for the **Samsung Galaxy XR**, where each kanji has a memorable 3D animation while
you are learning it. Runs as a WebXR web app in the headset's Chrome.

**Open:** https://b123radk-blip.github.io/JP-app/ (GitHub Pages, branch `claude/kanji-3d-galaxy-xr-uoi522`; after a push allow
1-2 minutes, then reload or reopen the tab). Press **Enter VR** or **Enter AR**, then point at a deck and pinch.

## What it does now
- Home: deck tiles N5 to N1 (N5 has 15 pilot cards: 日 火 水 山 川 木 雨 休 明 林 上 下 何 三 時; the rest say "coming soon").
- Study: new and due cards. While a card's animation is active you see the 3D kanji and its animation (each one built from
  a recipe of reusable pieces: material, reveal, particles, backdrop, motion, emblem), then the reading, the meaning with a
  short memory story, an example sentence with furigana and its English, then Again / Hard / Good / Easy.
  **Skip** jumps straight to the ratings.
- After Good/Easy on 2 different days the animation retires: the card shows the plain kanji and "Show answer".
  Again or Hard brings the animation back.
- Progress is saved in the browser; **Export / Import progress** on the 2D page keeps a copy.
- **Preview**: [?preview=1](https://b123radk-blip.github.io/JP-app/?preview=1) plays one card's animation on its own, looping;
  Prev / Next flip through the cards (also in the headset). Contact sheet of all cards: `docs/screenshots/preview-sheet.jpg`.
- Voice: none yet. You generate it with VOICEVOX on your PC: [docs/VOICEVOX.md](docs/VOICEVOX.md).
- Testing aids: add `?debug=1` (panel: add days, reset, force animation, jump to card) and `?today=2026-10-06` (fake date).
- Old prototypes: [prototypes/sun.html](prototypes/sun.html), [prototypes/fire.html](prototypes/fire.html) (moved from `/` and `/fire.html`). WebXR check: [status.html](status.html).

## What to check on the headset
1. Can you press the N5 tile and the rating buttons with a pinch (and with controllers)? Does the pointer reticle land where you aim?
2. Is the card's size, distance and height comfortable? Is the sentence text sharp?
3. Frame rate on 火 and 雨 (the heaviest effects), and on 時 (most strokes).
4. Enter AR: are the sentence panels readable over your room? Skies hide in AR; do the effects still read?
5. Flip through `?preview=1`: does every card look clearly different? Are the emblems (arrow, ?, Zzz, clock, dots) big enough?

## Credits
Stroke data: [KanjiVG](https://kanjivg.org) © Ulrich Apel, CC BY-SA 3.0 (derived `data/*.json` same licence) ·
Font: Noto Sans JP, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`) · [three.js](https://threejs.org) (MIT).
Voice clips, once generated, credit "VOICEVOX: <character>" in the app footer.

Developers (and Claude sessions): see [CLAUDE.md](CLAUDE.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), the effects audit [docs/EFFECTS-PLAN.md](docs/EFFECTS-PLAN.md) and the plan to 2000-3000 cards [docs/ROADMAP.md](docs/ROADMAP.md).
