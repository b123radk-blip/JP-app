# JP-app: 日 WebXR proof of concept

One kanji, 日, as a 3D object with a sunrise animation behind it, a stroke-order draw-in, and tap-to-replay.
Target: Samsung Galaxy XR (Android XR, Chrome). Also runs in a desktop browser.

**Live page:** https://b123radk-blip.github.io/JP-app/  (GitHub Pages, built from the `claude/kanji-3d-galaxy-xr-uoi522` branch; allow a minute or two after each push, then reload or reopen the tab)
**Status check page:** https://b123radk-blip.github.io/JP-app/status.html

## What it does
- About 5 s sequence, then an idle loop: dawn (sky shifts dark blue-purple to orange, a sun rises behind a hill) → the four strokes of 日 draw in order → the sun pulses gently behind the glyph.
- Glyph is about 30 cm tall, placed about 1.2 m in front of where you are looking when the session starts, at eye height, facing you.
- Replay: pinch (hands), controller select, mouse click, or R / Space on desktop.
- "Enter VR" / "Enter AR" buttons appear only if the browser reports the mode as supported. In AR (passthrough) the sky and hill are hidden and only the sun and kanji show. Errors starting a session are shown on the 2D page.

## How it was built
1. `data/source/065e5.svg`: KanjiVG's file for U+65E5 (`curl -o data/source/065e5.svg https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/065e5.svg`).
2. `npm run build:kanji` (`scripts/build-kanji.mjs`) samples each stroke's path every 0.6 units into `data/kanji-65e5.json`.
3. `src/main.js` extrudes each stroke into its own tube mesh with round end caps and reveals it along its length.
4. three.js is vendored in `vendor/three/` (`npm run vendor`), so nothing is loaded from a CDN at runtime.

Tunable constants (size, distance, timings, stroke width) are at the top of `src/main.js`.

## Run locally
```
npm install          # only needed to rebuild data / re-vendor / take screenshots
npm run serve        # http://localhost:8080
npm run screenshots  # headless Chromium (software WebGL) -> docs/screenshots/
```
`?t=2.5` freezes the timeline at that time (used by the screenshot script).
WebXR needs HTTPS or localhost; the headset needs the Pages URL (or a tunnel / `adb reverse` to localhost).

## What to check on the headset
Look at these first:
1. Does "Enter VR" start a session, and does the page ask for permissions you can accept?
2. Is the glyph at a comfortable distance and size (about 1.2 m, 30 cm)? Is it sharp and readable?
3. Does it appear in front of you, upright and facing you, rather than off to the side or at floor height?
4. Does a pinch replay the animation? Does Enter AR work, and does the sun/kanji look right over passthrough?
5. Timing (dawn about 2 s, strokes about 3 s): too fast or slow? Anything that flickers or stutters?
6. The glow and rays: pleasant, or too bright / distracting?

## Credits
- Stroke data: [KanjiVG](https://kanjivg.org) © Ulrich Apel and contributors, licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The derived `data/kanji-65e5.json` is under the same licence.
- [three.js](https://threejs.org) (MIT, see `vendor/three/LICENSE`).
