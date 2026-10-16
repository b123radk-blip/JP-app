# Where the time went: 017-tamesu-hats.md

Wall time 7.6 min: the model's own turns 6.8 min (90%), tools 0.8 min (10%).
61 model turns, 88866 tokens written (217/s over its turns, prompt reading included); thinking 216476 characters vs 22814 of text and code; largest prompt 181644 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 61 | 6.8 min | 90% |
| inspect (whole run) | 2 | 0.2 min | 3% |
| own node scripts (measuring) | 12 | 0.1 min | 2% |
| measure | 5 | 0.1 min | 1% |
| orbit render | 1 | 0.1 min | 1% |
| check_goals | 2 | 0.1 min | 1% |
| npm test | 1 | 0.0 min | 1% |
| cost check | 2 | 0.0 min | 0% |
| other shell | 20 | 0.0 min | 0% |
| read a picture | 3 | 0.0 min | 0% |
| read a file | 17 | 0.0 min | 0% |
| node --check | 1 | 0.0 min | 0% |
| edit / write code | 5 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 1.1 min at 3.9 min, after read a file: 15726 tokens written, prompt 116739
- 0.5 min at 7.0 min, after other shell: 6443 tokens written, prompt 173001
- 0.4 min at 3.4 min, after measure: 5056 tokens written, prompt 106235
- 0.4 min at 0.7 min, after read a file: 5451 tokens written, prompt 47032
- 0.4 min at 2.2 min, after read a file: 4186 tokens written, prompt 89205
- 0.3 min at 5.1 min, after measure: 4966 tokens written, prompt 133474
- 0.3 min at 3.1 min, after other shell: 3867 tokens written, prompt 101972
- 0.2 min at 0.4 min, after read a file: 3888 tokens written, prompt 38269

## Timeline (tool runs over 10 s)

- 6.1 min: inspect (whole run), 15 s (cd G:/AI/JP-app && node scripts/inspect.mjs 8a66 --goals plans/qwen/goals/017-tamesu-hats.)
