# Plan 007: test the inspection tool's new checks (no code changes)

After plan 006 the inspection tool changed in four ways, all from your report:
1. People built from the props kit (the older scenes' people) are now measured, as `kit person 1`, `kit person 2`.
2. Anything a person or animal carries or wears is listed as theirs ("carried or worn by ..."): it is not checked for
   standing on anything, and inside it only their hand counts.
3. Fault close-ups are framed wider.
4. The rules say how to read an exit code (your `--strict` result in plan 006 came from cmd.exe's `%ERRORLEVEL%` being
   read before the command ran, not from the tool).

This plan tests them. **Change no code.** Two runs use recipes with a fault planted on purpose; you are not told what.
As before: "I can't tell" with what you would need is a good answer; a confident wrong one is not.

## 0. Version check (stop if it fails)

`git log -1 --format=%h -- scripts/inspect.mjs` must print `6823c61` (a longer hash starting with it is fine), and
`plans/qwen/README.md` must contain the words `kit person`. If not, write only the report saying what you saw, and stop.

## 1. The runs

One at a time, from the repo folder. Open each run's `faults.jpg` first (if any), then `overview.jpg` and `people.jpg`.

| case | command |
|---|---|
| a | `node scripts/inspect.mjs 62bc --out .cache/inspect/007-a-push` |
| b | `node scripts/inspect.mjs 62bc --recipe plans/qwen/fixtures/007-push-lifted.json --out .cache/inspect/007-b-push-test1` |
| c | `node scripts/inspect.mjs 62bc --recipe plans/qwen/fixtures/007-push-onto.json --out .cache/inspect/007-c-push-test2` |
| d | `node scripts/inspect.mjs 592b --out .cache/inspect/007-d-husband` |
| e | `node scripts/inspect.mjs 7537 --out .cache/inspect/007-e-plough` |
| f | `node scripts/inspect.mjs w1159980 --out .cache/inspect/007-f-doctor` |

What each scene is meant to show:
- 62bc 押 "push" (`push`, a kit person): a person walks up beside the kanji, leans in with both hands on it and shoves it
  along in three heaves, dust puffing where it scrapes.
- 592b 夫 "husband" (`wedding`, two kit people): a groom in a black suit and a bride in white (a long white skirt and a
  veil) hold hands; rings float above them, confetti falls, he puts his arm round her shoulders, a heart rises.
- 7537 男 "male" (`q-plough`): a moustached man pushes a hand plough across a field of dark earth, the share cutting a
  dark furrow; he wipes his brow, flexes like a strong man, turns and ploughs back.
- w1159980 医者 "doctor" (`q-doctor`): a patient sits slumped under a grey cloud; a doctor walks in carrying a red-cross
  kit and sets it down; the patient jumps up cheering.
- Cases b and c are card a with a test recipe; each has one fault planted on purpose: find it.

For every fault in each run's whole-loop list decide **MEANT** (the description wants it), **REAL** (a mistake a viewer
would notice; house rule: a held thing rests against the palm, never inside the fist) or **CAN'T TELL** (say what you
would need), and name the tile that showed you. Where a scene has many lines of the same kind (two people touching each
other), you may judge them as a group.

Questions about the new checks (answer each in a line or two):
- a: Is the pushing person in the Things list? What does the report say it stands on, and how much of it the learner
  sees? Does that match the pictures?
- d: How many things does the report list for the bride and the groom (people, and anything listed as theirs)? Which
  of the bride's clothes are separate things, and did the tool call any of them "carried or worn"?
- e: What does the report now say about the plough, and is that right?
- f: In plan 006 you could not tell whether the kit passes through the doctor's head at t+3. Look at the wider fault
  close-ups (and take a `--look` if you need one). What is your call now?
- All: are the fault close-ups framed well now (enough around the fault to see what it is)? Name one tile that is still
  too tight or too wide, if any.
- Open one single picture from case d's folder whose name starts with `kit-person` (with your read tool): does the
  file name work?

## 2. Exit codes

Run each command, then read the code **on a line of its own** as the rules say (PowerShell: `echo $LASTEXITCODE`;
cmd.exe: `echo %ERRORLEVEL%`):
- `node scripts/inspect.mjs 62bc --strict --scan 0 --out .cache/inspect/007-g-strict-push`
- `node scripts/inspect.mjs w1159980 --strict --scan 0 --out .cache/inspect/007-h-strict-doctor`

Say which shell you used and paste exactly what it printed.

## 3. Commit

Run `node plans/qwen/fixtures/007-collect.mjs` (copies each run's report and sheets to `plans/qwen/renders/007/`), then
commit `plans/qwen/renders/007` as `Qwen inspection test (plan 007)`. Don't commit `.cache`.

## Report (`plans/qwen/done/007-inspect-kit-people.md`; this replaces the usual format)

```
# Report: 007-inspect-kit-people
## Version check
## Runs
### a (paste the "done in N s" line and the whole-loop list)
- <fault or group of faults>: MEANT / REAL / CAN'T TELL, why, tile
### b ... ### f (the same)
## The planted faults (b and c: what you think was planted, and what told you)
## The new checks (answer each question above)
## Exit codes (the shell, and what it printed)
## Problems with the tool (crashes, slow runs, anything confusing, wrong or missing)
```

If time runs short, finish the cases in order and write the report with what you have.
