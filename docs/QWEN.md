# Qwen on brad's PC: Opus plans, Qwen builds

Opus (Claude, in the cloud) designs a card's scene and pushes a plan to `plans/qwen/queue/` on the branch
`claude/project-thread-qtx77d`. On the PC, `scripts/qwen-watch.mjs` pulls every minute, hands each new plan to pi with
Qwen, and pushes the result: code, a six-angle render (`plans/qwen/renders/`), Qwen's report (`plans/qwen/done/`) and
pi's log (`plans/qwen/logs/`). Opus reviews it, merges what passes into the working branch, and writes a follow-up plan
for the rest. Qwen's standing rules: `plans/qwen/README.md`.

## One-time setup (PowerShell, in the JP-app folder, one command at a time)

1. `git checkout claude/project-thread-qtx77d`
2. `git pull`
3. `npm install`
4. `npx playwright install chromium` (downloads the browser the renders use)
5. Test a render: `node scripts/orbit.mjs 5915`, then `start .cache\orbit.jpg`: a sheet of 夕 from six angles.
6. Test pi without the chat window: `pi -p "Say hi"`. It should answer with Qwen and return to the prompt. If it uses
   another model, find Qwen's name with `pi --list-models` and use it below as `$env:PI_ARGS = "--model <name>"`.

## Each session

1. Start the model (as usual).
2. Double-click `Start Qwen watcher.cmd` in the JP-app folder (or run `node scripts/qwen-watch.mjs` there). Leave the
   window open; it prints a line when it starts and finishes a plan. Ctrl+C stops it. It runs pi with your line
   `--provider ninfer-quasar --model qwen3.8-27b-quasar --thinking xhigh` plus the JP-app tools; to use another model,
   set `$env:PI_ARGS = "..."` first.
3. Tell Opus when it says a plan is done (or just ask Opus to check).

## The repair loop (Qwen fixes, Opus reviews)

Each plan now runs as rounds, with no copying between agents:
1. Qwen builds the plan (30 min at most).
2. The watcher checks the work itself, without trusting Qwen's report: `npm test`, and the plan's goals with
   `inspect.mjs --goals --quick` (it finds the card from a line `Card: <id>` in the plan, or `(card <id>)` in its title;
   a line `Inspect: --loop 9` adds flags). Any FAIL goes back to Qwen for the next round (15 min at most).
3. When everything passes, Opus reviews once through Claude Code on the PC: it reads the plan and the code, renders
   the card, runs inspect and looks at the pictures, and answers approve, fix (a list that goes to Qwen for the next
   round) or needs_opus (the plan itself needs a new design: left for Opus in the cloud).
4. It stops at APPROVED, or after 4 Qwen rounds, 2 Opus calls or 120 minutes, whichever comes first.

Each plan's rounds, goal lines, Opus's verdicts and the outcome are in `plans/qwen/loop/<plan>.md`; Opus's raw answers
in `plans/qwen/logs/<plan>.review-<round>.json`. Limits: `--rounds 4 --reviews 2 --minutes 30 --fix-minutes 15
--plan-minutes 120`; `--no-review` turns Opus off.

Rules the watcher keeps: neither agent may change the plan, its goals file or the measuring scripts (the watcher puts
them back and says so); Opus may only read and run the render and inspect scripts, and a review that changes a file
doesn't count; nothing is merged into the working branch without a cloud Opus look.

Opus runs on your Claude Code login (the same as typing `claude`), so it uses your subscription, not per-call billing.
If the `ANTHROPIC_API_KEY` environment variable is set, Claude Code would bill the API instead, so the watcher turns
the review off and says why. Before the first run, check in PowerShell that `claude --version` works and that `claude`
opens logged in (type `/exit` to leave). The loop log shows a dollar figure per review: that is Claude Code's
list-price estimate, not a charge; how much of your plan's allowance it used isn't shown anywhere.

The watcher only touches the Qwen branch and skips its turn if the folder has uncommitted changes. For VOICEVOX
work, stop it first and switch back: `git checkout claude/kanji-3d-galaxy-xr-uoi522`, then `git pull`.

## Qwen's tools in pi

`scripts/pi/jp-tools.ts` is a pi extension that gives Qwen three tools, so it gets exact numbers instead of reading long
reports or guessing: `check_goals` (the goals PASS / FAIL and the whole-loop faults, ~8 s), `measure` (sizes and body
points such as hands and feet at a moment, in u, ~6 s) and `try_value` (tries an exact-text edit against the goals and
puts the file back, ~15 s). They run `scripts/qtool.mjs`, which works on its own too (`node scripts/qtool.mjs` lists its
commands). `plans/qwen/CHEATSHEET.md` explains them and the scene kit; the watcher points Qwen at it with every plan.

The watcher loads the extension by itself (`pi --extension scripts/pi/jp-tools.ts`). It sits outside `.pi/`, so pi's
project-trust question never comes up. To use the tools in your own pi chat in this folder, start pi the same way:
`pi --extension scripts/pi/jp-tools.ts`. Tested with pi 1.3.0; the extension imports nothing from pi, so other versions
should load it too.

## Where the time goes

The watcher keeps pi's full session for each plan in `.cache/pi-sessions/<plan>/` (not committed: it holds the
pictures) and pushes a breakdown next to the log, `plans/qwen/logs/<plan>.times.md`: the model's own turns against each
kind of tool run (inspect, orbit, tests, reading pictures, its own measuring scripts), the slowest turns and the rounds.
For runs from before this, `node scripts/qwen-times.mjs --all --push` finds pi's saved sessions on the PC and pushes the
same breakdowns.

## Writing a plan (Opus)

`plans/qwen/queue/<NNN>-<card>.md`, numbered so they run in order. Give: the card id, scene type, files and functions
Qwen may change, what the scene must show, every position and size as numbers (multiples of `u`), the commit message,
and any extra `orbit.mjs` flags. A plan runs once: the watcher writes a `NOT DONE` report when pi ends without one;
delete that report to run the plan again.

Give every plan a goals file, `plans/qwen/goals/<plan>.json` (format at the top of `scripts/lib/goals.mjs`): each
must-have of the plan that can be measured (hands at a body part or a thing, how much of a person the learner sees, what
a thing rests on, nothing through a person), with the moments it applies to. `inspect.mjs --goals` prints PASS or FAIL
for each, so Qwen knows when it is done and can't report a goal met that isn't. Name the props the goals refer to in the
plan's code (`mesh.name = 'slide'`): a prop measured by its box is only as exact as the box (a goal near "slide" is met
anywhere inside the whole slide's box). Try the goals on the current scene first (`node scripts/inspect.mjs <id> --goals
g.json --quick`): the ones the old scene fails are the plan's work. Old plans (tests 1 and 2) are in `plans/qwen/old/`.
