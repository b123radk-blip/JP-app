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
