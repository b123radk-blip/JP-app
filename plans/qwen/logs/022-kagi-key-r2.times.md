# Where the time went: 022-kagi-key.md

Wall time 14.1 min: the model's own turns 13.1 min (92%), tools 1.1 min (8%).
40 model turns, 177854 tokens written (227/s over its turns, prompt reading included); thinking 430441 characters vs 23648 of text and code; largest prompt 233416 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 40 | 13.1 min | 92% |
| inspect (whole run) | 1 | 0.3 min | 2% |
| try_value | 3 | 0.2 min | 2% |
| inspect --look (close-up) | 3 | 0.2 min | 1% |
| orbit render | 1 | 0.1 min | 1% |
| check_goals | 2 | 0.1 min | 1% |
| npm test | 1 | 0.0 min | 0% |
| read a file | 11 | 0.0 min | 0% |
| measure | 2 | 0.0 min | 0% |
| other shell | 7 | 0.0 min | 0% |
| own node scripts (measuring) | 5 | 0.0 min | 0% |
| read a picture | 7 | 0.0 min | 0% |
| node --check | 1 | 0.0 min | 0% |
| edit / write code | 4 | 0.0 min | 0% |
| cost check | 1 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 5.0 min at 7.5 min, after own node scripts (measuring): 69691 tokens written, prompt 144173
- 1.5 min at 1.5 min, after read a file: 21227 tokens written, prompt 55149
- 1.0 min at 3.1 min, after check_goals: 13787 tokens written, prompt 77253
- 0.9 min at 0.0 min, after read a file: 14020 tokens written, prompt 22561
- 0.8 min at 4.1 min, after measure: 11653 tokens written, prompt 91756
- 0.5 min at 1.0 min, after measure: 8022 tokens written, prompt 43664
- 0.5 min at 7.0 min, after own node scripts (measuring): 6486 tokens written, prompt 136621
- 0.4 min at 6.0 min, after read a picture: 5516 tokens written, prompt 116372

## Timeline (tool runs over 10 s)

- 12.9 min: inspect (whole run), 15 s (cd /g/AI/JP-app && node scripts/inspect.mjs w1260490 --goals plans/qwen/goals/022-kagi-key)
