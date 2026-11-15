---
name: fix-a-failing-goal
description: Fix a goal that says FAIL or a fault the whole-loop scan lists (floating, sunk, passing into a body, hidden). Use in every repair round and after any check_goals run with a FAIL.
---

# Fixing a FAIL

## The loop (one change at a time)
1. `check_goals`: note each FAIL, its moments and its numbers.
2. `measure` the two things the FAIL names at its worst moment. Write down the gap.
3. Work out the change from the numbers (gap + 0.02u margin). Don't guess from a picture.
4. Not sure? `try_value` the edit. Keep it only if the FAIL goes and nothing else breaks; then make the same edit with
   your edit tool.
5. `check_goals` again. Stop changing things once everything passes.

## Reading faults
- FLOATS ABOVE / SUNK INTO by N u: move that thing's y by exactly N u the other way.
- PASSING INTO a body: move one thing by the overlap + 0.02u.
- Under 85% visible: move the blocker aside or the person forward (+z).
- A hand short of its target: move the person closer. Never stretch the arm.
- Kit stars, hearts and bursts are in the air on purpose.

## Goals you can't fix
- "no moment measured": the goal's window is shorter than the scan step. That's a goal problem, not your code.
- A goal that fights the plan's own numbers (the plan puts a hand where the goal can't pass).
Leave these failing, never edit the goals file or the plan, and explain them in the report with the numbers.
Don't spend rounds on them.

## Report
Paste the real Goals lines. A goal that says FAIL is not met, whatever the picture looks like.
