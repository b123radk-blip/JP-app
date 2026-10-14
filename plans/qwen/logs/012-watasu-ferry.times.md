# Where the time went: 012-watasu-ferry.md

Wall time 59.9 min: the model's own turns 50.4 min (84%), tools 4.4 min (7%).
101 model turns, 236350 tokens written (78/s over its turns, prompt reading included); thinking 567445 characters vs 75252 of text and code; largest prompt 114419 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 101 | 50.4 min | 84% |
| inspect (whole run) | 12 | 3.1 min | 5% |
| look.mjs | 3 | 0.6 min | 1% |
| cost check | 2 | 0.5 min | 1% |
| own node scripts (measuring) | 22 | 0.2 min | 0% |
| inspect --look (close-up) | 1 | 0.0 min | 0% |
| other shell | 22 | 0.0 min | 0% |
| read a file | 27 | 0.0 min | 0% |
| read a picture | 4 | 0.0 min | 0% |
| edit / write code | 20 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 2.4 min at 38.3 min, after read a picture: 11823 tokens written, prompt 82622
- 2.3 min at 19.2 min, after read a file: 11456 tokens written, prompt 66134
- 2.2 min at 40.7 min, after edit / write code: 9070 tokens written, prompt 94484
- 2.1 min at 42.8 min, after edit / write code: 8773 tokens written, prompt 103598
- 2.1 min at 27.4 min, after read a file: 10218 tokens written, prompt 107879
- 1.9 min at 54.1 min, after read a file: 11680 tokens written, prompt 95030
- 1.8 min at 0.5 min, after other shell: 8299 tokens written, prompt 44069
- 1.8 min at 2.5 min, after read a file: 11175 tokens written, prompt 57951

## Timeline (tool runs over 10 s)

- 4.6 min: cost check, 31 s (cd C:/Users/Brad/JP-app && node --check src/effects/vignettes/q-ferry.js && node --check s)
- 5.2 min: look.mjs, 31 s (cd C:/Users/Brad/JP-app && node scripts/look.mjs w1444610 --times 0.5,3.5 2>&1 / tail -20)
- 8.9 min: inspect (whole run), 56 s (cd C:/Users/Brad/JP-app && node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/012-)
- 25.4 min: inspect (whole run), 40 s (cd C:/Users/Brad/JP-app && node scripts/inspect.mjs w1444610 --times 0.5,1.2,2.5,4,6,6.8,7)
- 34.2 min: inspect (whole run), 35 s (cd C:/Users/Brad/JP-app && node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/012-)
- 34.8 min: inspect (whole run), 34 s (cd C:/Users/Brad/JP-app && node scripts/inspect.mjs w1444610 --goals plans/qwen/goals/012-)
