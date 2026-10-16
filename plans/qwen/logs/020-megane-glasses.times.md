# Where the time went: 020-megane-glasses.md

Wall time 6.0 min: the model's own turns 4.5 min (75%), tools 1.5 min (25%).
43 model turns, 60802 tokens written (223/s over its turns, prompt reading included); thinking 141259 characters vs 20607 of text and code; largest prompt 114218 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 43 | 4.5 min | 75% |
| inspect (whole run) | 2 | 0.6 min | 9% |
| orbit render | 2 | 0.4 min | 6% |
| try_value | 3 | 0.3 min | 6% |
| cost check | 1 | 0.1 min | 1% |
| check_goals | 2 | 0.1 min | 1% |
| npm test | 1 | 0.0 min | 1% |
| measure | 1 | 0.0 min | 0% |
| other shell | 10 | 0.0 min | 0% |
| git | 4 | 0.0 min | 0% |
| own node scripts (measuring) | 3 | 0.0 min | 0% |
| read a picture | 7 | 0.0 min | 0% |
| node --check | 1 | 0.0 min | 0% |
| read a file | 9 | 0.0 min | 0% |
| edit / write code | 6 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 0.7 min at 0.8 min, after other shell: 11400 tokens written, prompt 46034
- 0.6 min at 2.7 min, after own node scripts (measuring): 9476 tokens written, prompt 72026
- 0.5 min at 1.9 min, after measure: 7206 tokens written, prompt 63017
- 0.3 min at 5.7 min, after git: 4512 tokens written, prompt 109267
- 0.3 min at 0.1 min, after other shell: 3889 tokens written, prompt 29037
- 0.3 min at 3.5 min, after own node scripts (measuring): 4470 tokens written, prompt 83081
- 0.2 min at 1.7 min, after check_goals: 2538 tokens written, prompt 58767
- 0.2 min at 3.8 min, after try_value: 2551 tokens written, prompt 88247

## Timeline (tool runs over 10 s)

- 4.0 min: inspect (whole run), 17 s (node scripts/inspect.mjs w1577670 --goals plans/qwen/goals/020-megane-glasses.json --loop )
- 4.9 min: orbit render, 13 s (node scripts/orbit.mjs w1577670 --times 0.5,3.5,6.5 --out plans/qwen/renders/020-megane-gl)
- 5.1 min: inspect (whole run), 17 s (node scripts/inspect.mjs w1577670 --goals plans/qwen/goals/020-megane-glasses.json --loop )
