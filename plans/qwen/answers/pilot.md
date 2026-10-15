# Pilot: three real scenes from word-only plans (008-010), kept off the Qwen branch

Question: does "Opus plans in words, Qwen builds and self-inspects, Opus reviews" cost Opus less per scene than Opus
building directly, with no loss of quality? (See the 2026-10-13 discussion: estimate 50-100k tokens per scene direct,
20-35k with Qwen.)

| plan | card | kind | what a pass looks like |
|---|---|---|---|
| 008 | 医者 w1159980 `q-doctor` | fix two measured faults | no doctor-into-kit lines (fist < 10 points), kit on the ground after |
| 009 | 習う w1333070 `q-piano-lesson` | clarity | both players >= 85% visible all loop, scene within 1.2u, notes bigger |
| 010 | 場 5834 `playground` | rebuild with models | two model children, girl climbs / slides on the chute, boy in the sandbox, no frame faults |

To record for each when the reports come in:
- Qwen: rounds used, minutes (the pi log's first line), whether it left the plan and why.
- Opus review: did it pass as delivered? Size of any fix (lines), and whether a second plan was needed.
- Measured: run `node scripts/inspect.mjs <id>` in the cloud and compare with Qwen's last report.
- Later: the user's headset flags on these three cards.

## Results (2026-10-13)

| plan | Qwen | rounds | Opus review | verdict |
|---|---|---|---|---|
| 008 医者 | 27 min | 4 | my inspection matches its report exactly; no fix | pass: kit on the palms, no head in the kit; 9 forearm points at the kit's back edge (plan limit 10) |
| 009 習う | 20 min | 5 | matches; no fix | pass: both players 87-92% visible (were 67-71%), scene within 1.14u, notes 1.5x; hands 0.08u over the keys (the seated model's reach) |
| 010 場 | 32 min | 6 | 1 line (the spade hung in the air before the boy appeared) | pass with small leftovers: feet 0.1u into the steps at some moments, girl 84% visible mid-slide; reads as a playground with real children |

Qwen's reports were honest and matched the cloud measurements; one overstatement (010: "touches the treads" while its own
numbers showed the feet a little into them). It found a real tool bug (look.mjs could not run on the PC: fixed).
For later plans: attach a held prop to the person (or the tool cannot list it as carried); say where the notes / effects
may go (009's notes rise to the card's title).
