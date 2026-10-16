# Where the time went: 016-kangaeru-think.md

Wall time 20.6 min: the model's own turns 18.5 min (90%), tools 1.6 min (8%).
158 model turns, 230474 tokens written (208/s over its turns, prompt reading included); thinking 574128 characters vs 44809 of text and code; largest prompt 245809 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 158 | 18.5 min | 90% |
| measure | 34 | 0.7 min | 3% |
| inspect (whole run) | 3 | 0.3 min | 1% |
| try_value | 3 | 0.2 min | 1% |
| check_goals | 5 | 0.2 min | 1% |
| orbit render | 1 | 0.1 min | 0% |
| npm test | 1 | 0.0 min | 0% |
| cost check | 3 | 0.0 min | 0% |
| other shell | 30 | 0.0 min | 0% |
| read a picture | 6 | 0.0 min | 0% |
| read a file | 28 | 0.0 min | 0% |
| node --check | 5 | 0.0 min | 0% |
| own node scripts (measuring) | 2 | 0.0 min | 0% |
| edit / write code | 47 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 1.6 min at 1.6 min, after read a file: 23041 tokens written, prompt 73413
- 1.0 min at 0.6 min, after inspect (whole run): 14415 tokens written, prompt 51051
- 0.8 min at 4.1 min, after check_goals: 10022 tokens written, prompt 116747
- 0.7 min at 18.0 min, after read a file: 10297 tokens written, prompt 94553
- 0.6 min at 14.2 min, after measure: 5903 tokens written, prompt 245809
- 0.5 min at 17.1 min, after check_goals: 6595 tokens written, prompt 76950
- 0.5 min at 8.6 min, after read a picture: 4823 tokens written, prompt 184443
- 0.4 min at 0.2 min, after read a file: 6776 tokens written, prompt 43838

## Timeline (tool runs over 10 s)

- 5.8 min: inspect (whole run), 10 s (node scripts/inspect.mjs 8003 --goals plans/qwen/goals/016-kangaeru-think.json --loop 7.5 )
