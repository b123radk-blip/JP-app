# Kanji Memory (JP-app)

A spaced-repetition kanji app (like Anki) for the **Samsung Galaxy XR**, where each kanji has a memorable 3D animation while
you are learning it. Runs as a WebXR web app in the headset's Chrome.

**Open:** https://b123radk-blip.github.io/JP-app/ (GitHub Pages, branch `claude/kanji-3d-galaxy-xr-uoi522`; after a push allow
1-2 minutes, then reload or reopen the tab). Press **Enter VR** or **Enter AR**, then point at a deck and pinch.

## What it does now
- Home: deck tiles N5 to N1 (N5 has 3 seed cards: 日, 火, 水; the rest say "coming soon").
- Study: new and due cards. While a card's animation is active you see the 3D kanji and its effect (sunrise for 日, fire for 火,
  a glowing draw-in for others), then the reading, meaning, an example sentence with furigana and its English, then
  Again / Hard / Good / Easy. **Skip** jumps straight to the ratings.
- After Good/Easy on 2 different days the animation retires: the card shows the plain kanji and "Show answer".
  Again or Hard brings the animation back.
- Progress is saved in the browser; **Export / Import progress** on the 2D page keeps a copy.
- Testing aids: add `?debug=1` (panel: add days, reset, force animation, jump to card) and `?today=2026-10-06` (fake date).
- Old prototypes: [prototypes/sun.html](prototypes/sun.html), [prototypes/fire.html](prototypes/fire.html) (moved from `/` and `/fire.html`). WebXR check: [status.html](status.html).

## What to check on the headset
1. Can you press the N5 tile and the rating buttons with a pinch (and with controllers)? Does the pointer reticle land where you aim?
2. Is the card's size, distance and height comfortable? Is the sentence text sharp?
3. Frame rate on 火 (the fire effect is the heaviest).
4. Enter AR: are the sentence panels readable over your room?

## Credits
Stroke data: [KanjiVG](https://kanjivg.org) © Ulrich Apel, CC BY-SA 3.0 (derived `data/*.json` same licence) ·
Font: Noto Sans JP, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`) · [three.js](https://threejs.org) (MIT) ·
Placeholder voice: HTS Voice "Mei", MMDAgent Project Team / Nagoya Institute of Technology, CC BY 3.0, via Open JTalk.

Developers (and Claude sessions): see [CLAUDE.md](CLAUDE.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
