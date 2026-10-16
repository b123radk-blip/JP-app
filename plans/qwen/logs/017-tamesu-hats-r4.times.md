# Where the time went: 017-tamesu-hats.md

Wall time 2.4 min: the model's own turns 1.9 min (76%), tools 0.6 min (24%).
23 model turns, 25555 tokens written (230/s over its turns, prompt reading included); thinking 62716 characters vs 12474 of text and code; largest prompt 80409 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 23 | 1.9 min | 76% |
| inspect (whole run) | 3 | 0.4 min | 15% |
| orbit render | 1 | 0.1 min | 4% |
| check_goals | 1 | 0.1 min | 2% |
| npm test | 1 | 0.0 min | 2% |
| cost check | 1 | 0.0 min | 1% |
| other shell | 6 | 0.0 min | 0% |
| own node scripts (measuring) | 1 | 0.0 min | 0% |
| read a file | 11 | 0.0 min | 0% |
| read a picture | 1 | 0.0 min | 0% |
| edit / write code | 1 | 0.0 min | 0% |
| measure | 1 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 0.3 min at 1.9 min, after read a picture: 5161 tokens written, prompt 73252
- 0.2 min at 0.7 min, after read a file: 3279 tokens written, prompt 56664
- 0.2 min at 0.4 min, after read a file: 2693 tokens written, prompt 44622
- 0.2 min at 0.1 min, after read a file: 2365 tokens written, prompt 23096
- 0.2 min at 1.0 min, after measure: 2827 tokens written, prompt 63900
- 0.2 min at 0.3 min, after read a file: 2422 tokens written, prompt 35461
- 0.1 min at 1.3 min, after inspect (whole run): 1388 tokens written, prompt 67795
- 0.1 min at 2.4 min, after other shell: 1303 tokens written, prompt 80409

## Timeline (tool runs over 10 s)

- 1.5 min: inspect (whole run), 14 s (cd "G:/AI/JP-app" && node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hat)
