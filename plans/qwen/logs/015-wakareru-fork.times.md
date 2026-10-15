# Where the time went: 015-wakareru-fork.md

Wall time 7.9 min: the model's own turns 7.0 min (89%), tools 0.9 min (11%).
68 model turns, 94657 tokens written (224/s over its turns, prompt reading included); thinking 211207 characters vs 29310 of text and code; largest prompt 178049 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 68 | 7.0 min | 89% |
| inspect (whole run) | 4 | 0.4 min | 5% |
| check_goals | 5 | 0.2 min | 2% |
| own node scripts (measuring) | 14 | 0.1 min | 2% |
| orbit render | 1 | 0.1 min | 1% |
| npm test | 1 | 0.0 min | 1% |
| cost check | 1 | 0.0 min | 0% |
| other shell | 12 | 0.0 min | 0% |
| read a picture | 9 | 0.0 min | 0% |
| read a file | 22 | 0.0 min | 0% |
| node --check | 3 | 0.0 min | 0% |
| edit / write code | 10 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 1.6 min at 0.2 min, after read a file: 25765 tokens written, prompt 37683
- 1.3 min at 1.9 min, after other shell: 20114 tokens written, prompt 66174
- 0.5 min at 5.9 min, after read a file: 5731 tokens written, prompt 141059
- 0.2 min at 7.6 min, after other shell: 3418 tokens written, prompt 174188
- 0.2 min at 5.3 min, after own node scripts (measuring): 1890 tokens written, prompt 129592
- 0.2 min at 3.2 min, after other shell: 1293 tokens written, prompt 86626
- 0.1 min at 5.7 min, after check_goals: 1554 tokens written, prompt 136404
- 0.1 min at 3.3 min, after read a picture: 2285 tokens written, prompt 88379

## Timeline (tool runs over 10 s)

