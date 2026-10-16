# Plan: 運 "carry; transport"

## The idea a child should get
運 is moving a thing from where you are to where it is wanted: a porter carries a
crate across the room and hands it over at the little house. The scene reads as
"carrying" even with no kanji: crate in two hands, two-step carry, delivery point.

## Layout (scene room x 0–1.5, y 0–1.3, z −0.8–0.6; kanji at x −1..0, y 0..1)

| piece | size (u) | where | colour |
|---|---|---|---|
| carrier — ADULT model | 0.9 tall, shoulders y 0.62, ±0.1 in x, reach 0.30 | feet (0.7, 0, −0.2), turn 0 (faces the learner) | Quaternius person, jacket slate |
| crate | 0.25 × 0.22 × 0.25 (x·y·z) | centre (0.7, 0.52, 0.05), carried, moves with the body | cardboard #b0803c, tape stripe |
| road | strip x 0.3–1.4, z −0.35–0.35, 0.01 above floor | under both | asphalt grey, white dashes |
| house (emblem `house`) | 0.3 | flat at (1.35, 0.35, −0.5) | red roof / white |
| particles | footprints, ≤ 2 tracks | on the road, while walking | dark grey |

Everything is inside the room: carrier head at y 0.9 ≤ 1.3; rightmost point x 1.35 + 0.15 (half emblem) = 1.5 —
the emblem edge just touches the room wall at its corner, so the emblem is centred at x 1.3 (edge 1.45) to keep a
margin; house then sits at (1.3, 0.35, −0.5).

## Reach check (hands hold the crate against the palm, never inside the fist)
Crate grip points = its two side faces: left (0.575, 0.52, 0.05), right (0.825, 0.52, 0.05) (the whole crate moves
with the body, so every check below holds at both standing spots).

Standing / walking, upright (shoulders at y 0.62, body z −0.2):
- right shoulder (0.8, 0.62, −0.2) → right grip (0.825, 0.52, 0.05): Δ = (0.025, −0.10, 0.25), d = √(0.000625+0.01+0.0625) = **0.270** ≤ 0.30 (margin 0.030)
- left shoulder (0.6, 0.62, −0.2) → left grip (0.575, 0.52, 0.05): mirror, **0.270** ✓

Pause, leaning 12° forward toward the learner (shoulder y 0.62·cos12° = 0.606, z −0.2 + 0.62·sin12° = −0.071):
- right shoulder (1.05, 0.606, −0.071) → right grip (1.075, 0.52, 0.05): Δ = (0.025, −0.086, 0.121), d = **0.151** ✓
- left shoulder (0.85, 0.606, −0.071) → left grip (0.925, 0.52, 0.05): Δ = (0.075, −0.086, 0.121), d = **0.167** ✓
The lean moves the shoulders *toward* the crate, so the tightest grip (upright, 0.270) is the binding case and it
passes. The crate's front faces the learner, so both palms face forward/outward and the crate sits against them —
nothing inside a fist.

## Facing and visibility (eye at (−0.45, 0.35, 2.6))
- Carrier faces +z (turn 0). Direction carrier → eye (from chest (0.7, 0.45, −0.2)): (−1.15, −0.10, 2.80); horizontal
  angle atan2(−1.15, 2.80) = −22.3° — only 22° off his facing, deep in the front hemisphere at both standing spots
  (at x 0.95: atan2(−1.40, 2.80) = −26.6°).
- Crate: direction crate → eye (from (0.7, 0.52, 0.05)): (−1.15, −0.17, 2.55); its front normal (0,0,1) is 24.6° from
  that line — the taped face is presented to the learner.
- Occlusion: the crate (z 0.05) is in front of the carrier (z −0.2) from the learner's seat, so it can hide the
  carrier only below y 0.63. Eye → head (0.7, 0.9, −0.2) crosses the crate's z-plane at y 0.851 > 0.63 — head and
  torso stay clear; only the legs (on the road) are partly veiled by the crate, which is the correct carrying read.
  House emblem (x 1.3, z −0.5) is behind everything and hides nothing.

## Timing (loop 6 s; beats in seconds, pure in t)
| s | beat |
|---|---|
| 0.0–1.0 | setup: strokes draw; carrier stands at (0.7, −0.2), crate at (0.7, 0.52, 0.05), upright, yaw 0 |
| 1.0–2.5 | walks two steps right, x 0.7 → 0.95 (smoothstep over the whole beat); crate bobs ±0.015 in y, two bobs (one per step); lean 8° |
| 2.5–3.5 | pause at (0.95, −0.2) in front of the house: offers the crate — lean eases to 12°, crate held at (0.95, 0.52, 0.05) |
| 3.5–5.0 | walks two steps back, x 0.95 → 0.7 (smoothstep); crate bobs; lean eases back toward upright |
| 5.0–6.0 | stands at start; bob amplitude eases to 0; lean is exactly 0 — identical to 0.0 |

## Loop closes on itself
At 6.0: carrier (0.7, 0, −0.2) yaw 0 lean 0 — identical to 0.0; crate (0.7, 0.52, 0.05), bob phase completed
(integers of the bob frequency at 5.0 and 6.0: bob frequency 2 bobs / 1.5 s → at 5.0 and 6.0 the smoothstep beat
is finished and amplitude is 0), so crate is exactly at rest position; footprints have faded (particles are
emitted only during the walking beats and die within 1 s). Position, orientation, crate pose and lean all match
beat-for-beat — no jump at the loop point.

## Goals
`goals.json` beside this file (checked by `inspect --goals`).
