# JP-app: 日 WebXR proof of concept

One kanji, 日, as a 3D object with a sunrise animation behind it, a stroke-order draw-in, and tap-to-replay.
Target: Samsung Galaxy XR (Android XR, Chrome). Also runs in a desktop browser.

**Live page:** https://b123radk-blip.github.io/JP-app/  (GitHub Pages, built from the `claude/kanji-3d-galaxy-xr-uoi522` branch; allow a minute or two after each push, then reload or reopen the tab)
**Status check page:** https://b123radk-blip.github.io/JP-app/status.html

## 火 fire test (separate page)
https://b123radk-blip.github.io/JP-app/fire.html: 火 on its own, with the fire as part of the glyph. Built to be viewed in isolation; the 日 page is unchanged.
- A flame front runs along each stroke as it is drawn (longer strokes take longer), with a column of flame and a spray of sparks at the tip.
- Strokes behind the front glow white-hot, then cool to breathing embers (the charcoal body's glow is driven per vertex by how long ago the front passed).
- Flames, embers and sparks rise from the stroke surfaces for as long as the page is open, and a warm bloom behind the glyph flickers with the fire.
- Timing: all strokes finish in about 2.9 s (was about 4.6 s). `STROKE_SPEED` at the top of `src/fire.js` scales every stroke's burn time; lower is faster.
- Fire density, flame size and opacity were dialled down about 20% so the strokes stay readable (`FLAME_PER_RING`, `FRONT_FLAMES`, flame alpha and size in `src/fire.js`).
- Furigana: when the last stroke finishes, the reading ひ fades in above the glyph over about 0.7 s, drawn on top of the flames over a faint dark backing. It is drawn with the device's own Japanese font (`READING` in `src/fire.js`).
- Sound (placeholder voice, 0.5x speed): a spoken "ひ" plays when the strokes finish, then the sentence 火は熱い。 plays when the example appears. There is a "Sound: on/off" button on the 2D page. The voice is Open JTalk's "Mei": intelligible but robotic. `python3 scripts/make-audio.py` regenerates both clips (it verifies the phonemes / kana first; `SPEED` at the top sets the pace), or overwrite `audio/*.mp3` with better recordings or a TTS render of the same text.
- Card flow (all times from the start, in seconds): strokes burn in until about 2.9, then ひ fades in and is spoken, "fire" (the kanji's meaning) fades in at about 3.8, the example sentence 火は熱い。 appears at about 4.8 and is spoken at about 5.5, and the English "Fire is hot." fades in at about 7.0. Constants are at the top of `src/fire.js`.
- Reuse: the fire is a function, `createFireGlyph({ glyphHeight, maxParticles, density, parallel, seed })` in `src/fire.js`. The big 火 uses it with the stroke order; the 火 inside the sentence is a second instance with `parallel: true` (all strokes ignite at once, no stroke order), smaller and with less fire, running on its own clock. To make a card for another kanji you need its KanjiVG data (`node scripts/build-kanji.mjs <hex>`), a new reading / meaning / sentence, and its own heat-and-particle look; the fire itself is specific to 火.
- Click / pinch / controller select re-ignites it (the furigana and sound restart too). Code: `fire.html`, `src/fire.js`, data from `node scripts/build-kanji.mjs 706b`.
- Screenshots: `PAGE=fire.html PREFIX=fire- TIMES=3.6,5.2,8,12 npm run screenshots`.
- Particle count is capped at 1800 + 700 (instanced billboard quads, one pool per fire glyph). If it stutters on the headset, lower `FLAME_PER_RING` / `MAX_P` at the top of `src/fire.js`.

## What it does (日 page)
- About 5 s sequence, then an idle loop: dawn (sky shifts dark blue-purple to orange, a sun rises behind a hill) → the four strokes of 日 draw in order → the sun pulses gently behind the glyph.
- The glyph is a real 3D object: each stroke is a deep, rounded slab (about 2x as deep as it is wide), shaded by a key light, a warm rim light from the sun, and a soft fill. A soft halo glows around the strokes and brightens with the sunrise.
- The sun and hill sit about 0.9 m behind the glyph, so moving your head gives real parallax. After the strokes finish, the glyph sways slowly (about 17 degrees each way) so the depth shows even when you hold still.
- Colour: the default is an icy cyan-white glyph with a cyan halo, chosen to contrast with the orange sky. Try `?color=gold`, `?color=jade` or `?color=rose` on the URL; the palettes are in `src/main.js`.
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
7. Depth: does the glyph read as a solid 3D object, from head-on and when you move your head? Is the sway comfortable, or distracting?
8. Colour: cyan vs `?color=gold` etc. Which reads best against the sky?

## Credits
- Stroke data: [KanjiVG](https://kanjivg.org) © Ulrich Apel and contributors, licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The derived `data/kanji-65e5.json` is under the same licence.
- [three.js](https://threejs.org) (MIT, see `vendor/three/LICENSE`).
- Voice (placeholder): HTS Voice "Mei", MMDAgent Project Team / Nagoya Institute of Technology, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), synthesised with Open JTalk (via `pyopenjtalk-plus`).
