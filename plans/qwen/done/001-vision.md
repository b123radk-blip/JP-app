# Report: 001-vision

## What I changed
Nothing. Plan 001 asked for no code changes — only to render card 5915 (夕, "evening") from six angles and
describe what I see, then run the two checks. I ran `node scripts/orbit.mjs 5915 --out
plans/qwen/renders/001-vision.jpg` and committed only that render.

## Where I left the plan, and why (or "Nowhere")
Nowhere. The image read tool works now (the fix from plan 000 took effect); the render came back as a
viewable JPEG, so I was able to look at it.

## Checks (paste the real last lines of each)

`npm test` (last lines):
```
ℹ tests 64
ℹ suites 0
ℹ pass 63
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 694.7628
content check ok: 835 cards (262 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
deck n5: 835 recipes (573 words), 0 cards with no recipe yet (default animation)
  0 pair(s) at or above 0.72
recipe check ok
```
(1 skipped test: "with ffmpeg: mp3 files..." — skipped because ffmpeg is not installed.)

`node scripts/check-piece-costs.mjs vignette "^q-dusk$"`:
```
675 recipes, 0 cost mismatches
```

## What I see in the render (each of the six views, one line each, and any fault left)
Scene: two small people on a green grassy mound with a couple of small houses, a glowing gold 夕 glyph,
a deep red/orange sunset sky, and a "バイバイ!" (bye-bye) call-out at t+1.5 — the taller person raises an arm to
wave, which reads as "evening / saying goodbye".

- front (t+0.5 / t+1.5): short dark-haired person and taller blond person side by side on the green hill,
  houses with purple/white roofs behind them, glowing 夕 upper-left, sunset red sky; at t+1.5 the blond one
  raises an arm and the "バイバイ!" bubble appears. No float/sink/intersect.
- right side (t+0.5 / t+1.5): profile view, one person on the mound waving up at the 夕 seen edge-on as a tall
  glowing gold shape, a white house to the right; red sky, green ground. No fault.
- top (t+0.5 / t+1.5): top-down; the two people seen from above standing on a light plank/path strip across
  green ground with red around; the 夕 is essentially edge-on and not clearly visible from directly above (that
  is expected for a vertical glyph, not a fault).
- back-left (t+0.5 / t+1.5): the two people seen from behind on the path, a red-roofed house in the
  foreground, houses/hill behind. No fault.
- front-right (t+0.5 / t+1.5): the large glowing 夕 on the left with the "evening・ゆう" label and recipe text,
  the two people (blond one waving at t+1.5), purple hill/house to the right and a sun orb top-right. No fault.
- low front (t+0.5 / t+1.5): low angle looking up at the two people on the hill against the darker red sky, 夕
  partly visible at the left edge, "evening・ゆう" label along the bottom. No fault.

Leftover faults: none spotted. Both people sit on the hill, the houses and props rest on the ground, and the
glowing 夕 floats as an intentional glyph rather than a grounded prop. I did not see anything floating in mid-air,
sunk below the ground, or passing through another object in any view.
