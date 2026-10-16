# Where the time went: 020-megane-glasses.md

Wall time 3.6 min: the model's own turns 2.4 min (66%), tools 1.2 min (34%).
41 model turns, 34528 tokens written (241/s over its turns, prompt reading included); thinking 76109 characters vs 15062 of text and code; largest prompt 76614 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 41 | 2.4 min | 66% |
| inspect (whole run) | 2 | 0.6 min | 16% |
| try_value | 2 | 0.2 min | 6% |
| cost check | 2 | 0.2 min | 6% |
| check_goals | 2 | 0.1 min | 3% |
| npm test | 1 | 0.0 min | 1% |
| other shell | 10 | 0.0 min | 0% |
| read a picture | 6 | 0.0 min | 0% |
| own node scripts (measuring) | 5 | 0.0 min | 0% |
| node --check | 2 | 0.0 min | 0% |
| read a file | 7 | 0.0 min | 0% |
| edit / write code | 6 | 0.0 min | 0% |
| orbit render | 1 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 0.4 min at 0.0 min, after read a file: 6941 tokens written, prompt 21421
- 0.4 min at 0.8 min, after own node scripts (measuring): 5976 tokens written, prompt 37963
- 0.2 min at 1.9 min, after other shell: 2756 tokens written, prompt 48541
- 0.2 min at 3.0 min, after other shell: 2117 tokens written, prompt 63209
- 0.1 min at 3.3 min, after other shell: 2226 tokens written, prompt 72096
- 0.1 min at 2.1 min, after read a picture: 1710 tokens written, prompt 53224
- 0.1 min at 2.7 min, after read a picture: 1362 tokens written, prompt 59076
- 0.1 min at 2.8 min, after read a picture: 1213 tokens written, prompt 61721

## Timeline (tool runs over 10 s)

- 1.4 min: cost check, 11 s (cd /g/AI/JP-app && node scripts/check-piece-costs.mjs vignette "^q-glasses$")
- 1.6 min: inspect (whole run), 19 s (cd /g/AI/JP-app && node scripts/inspect.mjs w1577670 --goals plans/qwen/goals/020-megane-g)
- 2.4 min: inspect (whole run), 17 s (cd /g/AI/JP-app && node --check src/effects/vignettes/q-glasses.js && node scripts/inspect)
