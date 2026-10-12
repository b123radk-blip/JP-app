# Report: 003-karada-fix

## What I changed

All in `src/effects/vignettes/q-feel.js`, exactly as the plan said:

1. `PARTS` row `かた`: now `bow: 0, at: (p, x) => p.local(0.17 * x, 0.64, -0.01, W), out: 1.0, down: 0.9` (was `0.13*x, 0.66, 0.03`, `out: 0.9, down: 0.6`).
2. `PARTS` row `つまさき`: now `bow: 1.0, at: (p, x) => p.local(0.07 * x, 0.02, 0.17, W)` (was `bow: 0.8`, `0.04, 0.14`); `out: 0.3, down: 0.4` kept as before.
3. The four part-name labels: height `0.13` → `0.17`.
4. Deleted the unused `arms` helper (line 22); nothing else referenced it.

Changed nothing else. No tuning tries were needed: the first render with the
plan's numbers already showed the hands where the plan asks (see below), so I did
not re-render.

## Where I left the plan, and why (or "Nowhere")

Nowhere.

## Checks (paste the real last lines of each)

`node --check src/effects/vignettes/q-feel.js`

    (printed nothing)

`npm test`

    ℹ tests 64
    ℹ suites 0
    ℹ pass 63
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 1
    ℹ todo 0
    ℹ duration_ms 726.5377
    content check ok: 835 cards (262 kanji, 573 words), 1 enabled deck(s), 1670 audio clips
    deck n5: 835 recipes (573 words), 0 cards with no recipe yet (default animation)
      0 pair(s) at or above 0.72
    recipe check ok

`node scripts/check-piece-costs.mjs vignette "^q-exercise$"`

    675 recipes, 0 cost mismatches

`node scripts/orbit.mjs 4f53 --times 1.05,2.55,4.05,5.55 --dist 0.45 --at 0.36,0.22,0 --out plans/qwen/renders/003-karada-fix.jpg`

    plans/qwen/renders/003-karada-fix.jpg (looking at 0.36,0.22,0.00)

## What I see in the render (each of the six views, one line each, and any fault left)

Render: `plans/qwen/renders/003-karada-fix.jpg` (sheet of 1500×450; I also cropped
and enlarged the front, right-side and low-front tiles to judge the hands).

- **front:** t+1.05 both hands up at the ears (head), t+2.55 the two glow balls sit
  wide apart at the outer ends of the shoulders, outside the neck — no longer
  clapping in front of the chest — t+4.05 hands on the knees, t+5.55 bent fully
  forward, hands down at the feet; the orange labels (あたま かた ひざ つまさき)
  are clearly bigger than before. No fault.
- **right side:** t+2.55 the hand is at shoulder/neck height, elbow out, not held
  ahead of the chest; t+5.55 the person is bent over with the arm reaching down
  in front of the body toward the feet. The shoulder hand is a touch forward of
  the neck rather than dead over the shoulder line, but it is at shoulder height
  and reads as "hand on the shoulder".
- **top:** the person on the round grass patch seen from above; head, arms and
  feet on the grass, nothing sunk in or floating. No fault.
- **back-left:** the person from behind; t+2.55 arms raised to the shoulders,
  t+5.55 bent at the waist toward the feet; label visible. No fault.
- **front-right:** the person standing to the right of the glowing 体 glyph on
  the grass; poses match the front view, feet on the grass. No fault.
- **low front:** closest look at the poses — t+2.55 the hands are up at the
  outer shoulders; t+5.55 the person is bent fully over and the hands come down
  in front of the shoes, just above the grass, not through it. No fault.

Fault left: none significant. The one borderline thing is that in the right-side
view the shoulder hands read a hair ahead of the shoulder line; if Opus's own
render shows that, the knob is `z` on the `かた` row (make it more negative) or
`down` lower, per the plan.
