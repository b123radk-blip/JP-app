# Effort test: six small tasks like your card work

This is a test, not a plan. Nothing here changes the app. Work alone: do **not** open `plans/qwen/done/`,
`plans/qwen/loop/`, `plans/qwen/logs/` or any other folder under `.cache/effort-test/`. You may read
`plans/qwen/CHEATSHEET.md` and any source file.

The message after this file gives your **label** (for example `medium`). Write everything to
`.cache/effort-test/<label>/`. First run `node -e "console.log(new Date().toISOString())"` and put the time at the top
of `answers.md`; run it again at the very end and put that time at the bottom.

Answers go in `answers.md` with one heading per task (`## A` to `## F`). Show your working briefly, then give the final
answer on a line starting `ANSWER:`. Round lengths to 3 decimals. Don't commit and don't push.

Conventions (same as the project): lengths in u. x runs right (from the kanji's right edge), y up, z toward the learner.
three.js is right-handed: a positive `rotation.x` turns +y toward +z. A model with turn 0 faces +z (the learner).

## A. A piece on a tilted board

A board group has its origin (bottom-middle) at world (0.95, 0.12, 0.08) and `rotation.x = 35°`, with no other
rotation. A piece is a child of the group at local (−0.06, 0.05, −0.10).
1. Where is the piece in world coordinates?
2. The board's top normal is local (0, 1, 0). What is it in world coordinates, and is the top turned toward the learner
   or away from them?

## B. Walking down a slope

The ground's surface at depth z is at y = (0.5 − z) × tan 20°. A person's feet sit 0.045 above that surface.
1. What is the feet's y when the person stands at z = 0.40?
2. The person walks in a straight line from (x 0.80, z −0.45) to (x 0.52, z 0.40). Which `rotation.y`, in degrees, makes
   them face along the path?

## C. Can he reach it?

A chibi man stands with his right shoulder at world (0.88, 0.62, −0.15). His arm reaches at most 0.30 from the
shoulder. A plan asks his right hand to hold a barbell's bar at (0.85, 0.95, −0.15), above his head.
1. Can he reach it? Show the distance.
2. If not, give the smallest change to the **plan's target** that works and keeps "lift it high", and say why changing
   the arm or the model's size is the wrong fix.

## D. Write a step function

Write `.cache/effort-test/<label>/step.mjs`, exporting `step(t)` that returns `{ bar, glyph }`. Rules: a pure function
of t (no state, no random, no Date), loop length 6 s, and t may be negative or larger than 6.
- `bar` (a barbell's height): 0.2 until 1.5 s; rises to 0.5 from 1.5 to 2.4 s with smoothstep easing (3s² − 2s³); holds
  0.5 until 4.2 s; falls back to 0.2 from 4.2 to 4.6 s, accelerating (ease-in, s²); then stays 0.2.
- `glyph` (the kanji's jump when it lands): 0.06 × sin(π × (v − 4.6) / 0.3) while 4.6 ≤ v ≤ 4.9, otherwise 0, where v
  is the time within the loop.
Test it yourself with node at a few times, and paste the values for t = 2.0, 4.4, 4.75 and −1 under `## D`.

## E. Reading the checker

1. The checker samples a scene every 0.5 s (0, 0.5, 1.0 …). A goal says:
   `FAIL his hand reaches the piece (t+4.65 to t+4.8): no moment measured`. Your scene's hand is on the piece from 4.6
   to 5.2 s. What is wrong, what should you change in the scene, and what do you write in your report?
2. A goal `he sits on the cushion` PASSes with `grandpa: touches cushion`. But in a side render his thighs are level
   and his hips float about 0.13 above the cushion; only his feet touch it. Why does the goal pass, is the scene
   right, and what would a better goal measure?

## F. Find the flaws in this plan

Read this short plan as if Opus had sent it to you, and list **every** problem you would raise before building it,
each with a concrete fix. The learner's eyes are at about y 0.3, level with the kanji, looking straight ahead (−z).

> Card 書 "write". A desk (0.6 × 0.05 × 0.4) lies flat on the floor at x 0.9, z 0 (rotation 0). A sheet of paper lies
> flat on the desk; a pen writes a word on it. A girl, 0.5 tall, stands behind the desk at z −0.3, shoulder at y 0.4;
> at 1.0 to 2.0 s she raises the pen above her head to (0.9, 0.85, −0.3) to show it off, then writes. A speech bubble
> saying "できた!" pops up at x −0.6, y 0.4, left of the kanji. The pen moves from x 0.8 to 1.1 while writing (2.5 to
> 5.5 s) and the loop ends at 6 s with the pen at x 1.1. The goal "pen touches the paper" is checked from 3.1 to 3.3 s.

## Last step

Run the time command again, put it at the bottom of `answers.md`, and finish with a one-line summary of anything you
were unsure about.
