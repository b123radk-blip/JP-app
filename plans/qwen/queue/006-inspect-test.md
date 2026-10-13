# Plan 006: test the new inspection tool (no code changes)

The inspection tool (`scripts/inspect.mjs`) was rebuilt. It now measures the whole loop, puts its pictures on numbered
sheets (`faults.jpg`, `overview.jpg`, `people.jpg`), and can inspect a card with a test recipe (`--recipe`). This plan
tests whether it works on this PC and whether its report and sheets are clear enough for you. **Change no code.** Two of
the runs use recipes with a fault planted on purpose; you are not told what it is.

Keep your judgement honest: "I can't tell from the pictures" is a good answer; a confident wrong one is not.

## 0. Version check (stop if it fails)

Run `git log -1 --format=%h -- scripts/inspect.mjs`. It must print `2ccb8b7` (a longer hash starting with it is fine). Then run
`node scripts/inspect.mjs` with no card: the usage line must mention `--recipe`. If either fails, you have an old copy:
write only the report, saying what you saw, and stop.

## 1. The runs

Run each command from the repo folder, one at a time. Each prints a report and ends with `done in N s`. For each run, open
its `faults.jpg` first (if there is one; the report lists the sheets), then `overview.jpg` and `people.jpg`. Open a
single picture only when a tile is too small to judge.

| case | command |
|---|---|
| a | `node scripts/inspect.mjs 62bc --out .cache/inspect/006-a-push` |
| b | `node scripts/inspect.mjs 725b --out .cache/inspect/006-b-cow` |
| c | `node scripts/inspect.mjs 725b --recipe plans/qwen/fixtures/006-cow-lifted.json --out .cache/inspect/006-c-cow-test` |
| d | `node scripts/inspect.mjs w1159980 --recipe plans/qwen/fixtures/006-doctor-low.json --out .cache/inspect/006-d-doctor-test` |
| e | `node scripts/inspect.mjs 7537 --out .cache/inspect/006-e-plough` |
| f | `node scripts/inspect.mjs w1159980 --out .cache/inspect/006-f-doctor` |
| g | `node scripts/inspect.mjs 72ac --out .cache/inspect/006-g-dog` |

What each scene is meant to show (use this to decide whether a fault is meant):
- 62bc 押 "push" (`push`): a person walks up beside the kanji, leans in and shoves it along in three heaves, dust puffing.
- 725b 牛 "cow" (`q-cow`): a cow walks up, grazes, lifts its head and moos モー, then wanders off.
- w1159980 医者 "doctor" (`q-doctor`): a patient sits slumped under a grey cloud; a doctor walks in carrying a red-cross
  kit and sets it down; the patient jumps up cheering.
- 7537 男 "male" (`q-plough`): a moustached man pushes a hand plough across a field of dark earth, the share cutting a
  dark furrow; he wipes his brow, flexes like a strong man, turns and ploughs back.
- 72ac 犬 "dog" (`q-dog-fetch`): a Shiba waits; a ball bounces past, it gallops after it, brings it back in its mouth
  (the ball stays in the mouth to the end) and hops for joy.
- Cases c and d are cards b and f with a test recipe. Each has one fault planted on purpose: find it.

For every fault in each run's "whole loop" list, decide:
- **MEANT**: the scene description wants it (something carried or held, a hop or jump, a cloud over someone, someone
  walking in from off the picture, a tool digging into soil), or
- **REAL**: a mistake a viewer would notice. The house rule: a held thing rests against the palm, never inside the fist.
- **CAN'T TELL**: say what you would need to decide.

Name the tile (sheet and number) that showed you.

## 2. Two more checks

- `--strict` exit codes: run `node scripts/inspect.mjs 62bc --strict --scan 0 --out .cache/inspect/006-h-strict-push`
  and `node scripts/inspect.mjs 7537 --strict --scan 0 --out .cache/inspect/006-i-strict-plough`, and after each print
  the exit code (`echo $?` in bash, `echo $LASTEXITCODE` in PowerShell).
- A close look: in case f's report, find the doctor's id in the `## t+3` section (`T2 model doctor` or similar). Run
  `node scripts/inspect.mjs w1159980 --look <that id> --from front-right --t 3 --out .cache/inspect/006-f-doctor` and
  open the picture it prints. Say what the kit and the doctor's head are doing.

## 3. Reading the sheets

From case f's `faults.jpg`: for tile 1 and for the last tile, copy the small caption in the tile's top-left corner
word for word, and say in one line what the picture shows. Say whether the red tile numbers and the small captions were
easy to read.

## 4. Commit

Run `node plans/qwen/fixtures/006-collect.mjs` (copies each run's report and sheets to `plans/qwen/renders/006/`), then
commit `plans/qwen/renders/006` as `Qwen inspection test (plan 006)`. Don't commit `.cache`.

## Report (`plans/qwen/done/006-inspect-test.md`; this replaces the usual format)

```
# Report: 006-inspect-test
## Version check (what the two commands printed)
## Runs
### a (paste the "done in N s" line and the whole-loop list)
- <fault>: MEANT / REAL / CAN'T TELL, why, tile
### b ... ### g (the same)
## The planted faults (c and d: what you think was planted, and what told you)
## Strict exit codes
## Close look (case f, t+3)
## Reading the sheets
## Problems with the tool (crashes, slow runs, anything confusing or missing in the report or sheets)
```

If time runs short, finish the cases in order and write the report with what you have: the report matters more than
doing every case.
