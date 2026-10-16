# Where the time went: 017-tamesu-hats.md

Wall time 2.7 min: the model's own turns 2.1 min (77%), tools 0.6 min (23%).
28 model turns, 29492 tokens written (239/s over its turns, prompt reading included); thinking 68605 characters vs 12693 of text and code; largest prompt 81289 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 28 | 2.1 min | 77% |
| inspect (whole run) | 1 | 0.2 min | 9% |
| orbit render | 1 | 0.1 min | 4% |
| try_value | 1 | 0.1 min | 3% |
| measure | 4 | 0.1 min | 2% |
| npm test | 1 | 0.0 min | 2% |
| check_goals | 1 | 0.0 min | 2% |
| cost check | 1 | 0.0 min | 1% |
| other shell | 9 | 0.0 min | 0% |
| node --check | 1 | 0.0 min | 0% |
| read a picture | 1 | 0.0 min | 0% |
| read a file | 11 | 0.0 min | 0% |
| edit / write code | 2 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 0.4 min at 0.5 min, after read a file: 5877 tokens written, prompt 48914
- 0.3 min at 1.9 min, after read a picture: 4528 tokens written, prompt 69140
- 0.3 min at 0.2 min, after read a file: 4052 tokens written, prompt 38123
- 0.2 min at 2.4 min, after read a file: 2952 tokens written, prompt 78058
- 0.2 min at 1.2 min, after measure: 2264 tokens written, prompt 60222
- 0.1 min at 1.0 min, after measure: 2222 tokens written, prompt 55426
- 0.1 min at 0.0 min, after read a file: 1378 tokens written, prompt 23662
- 0.1 min at 2.6 min, after other shell: 1310 tokens written, prompt 81289

## Timeline (tool runs over 10 s)

- 1.5 min: inspect (whole run), 15 s (cd G:/AI/JP-app && node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hats.)
