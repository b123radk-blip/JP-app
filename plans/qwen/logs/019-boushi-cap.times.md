# Where the time went: 019-boushi-cap.md

Wall time 29.7 min: the model's own turns 23.4 min (79%), tools 6.1 min (20%).
98 model turns, 304684 tokens written (217/s over its turns, prompt reading included); thinking 670001 characters vs 55912 of text and code; largest prompt 244323 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 98 | 23.4 min | 79% |
| inspect (whole run) | 4 | 1.9 min | 7% |
| check_goals | 9 | 1.9 min | 6% |
| try_value | 4 | 1.2 min | 4% |
| measure | 11 | 0.4 min | 1% |
| look.mjs | 5 | 0.3 min | 1% |
| orbit render | 1 | 0.1 min | 0% |
| cost check | 5 | 0.1 min | 0% |
| npm test | 1 | 0.1 min | 0% |
| inspect --look (close-up) | 1 | 0.0 min | 0% |
| read a file | 23 | 0.0 min | 0% |
| read a picture | 10 | 0.0 min | 0% |
| other shell | 12 | 0.0 min | 0% |
| own node scripts (measuring) | 5 | 0.0 min | 0% |
| edit / write code | 17 | 0.0 min | 0% |
| node --check | 1 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 3.3 min at 11.4 min, after read a picture: 44637 tokens written, prompt 199657
- 3.3 min at 16.8 min, after read a file: 50953 tokens written, prompt 77688
- 1.6 min at 7.8 min, after measure: 19867 tokens written, prompt 156677
- 1.3 min at 23.6 min, after measure: 18639 tokens written, prompt 169398
- 1.3 min at 5.4 min, after read a file: 16707 tokens written, prompt 125045
- 0.8 min at 1.7 min, after other shell: 11657 tokens written, prompt 79481
- 0.7 min at 10.3 min, after read a picture: 9809 tokens written, prompt 185738
- 0.6 min at 1.1 min, after read a file: 7248 tokens written, prompt 70933

## Timeline (tool runs over 10 s)

- 2.6 min: check_goals, 16 s ()
- 3.8 min: inspect (whole run), 36 s (node scripts/inspect.mjs w1519170 --goals plans/qwen/goals/019-boushi-cap.json --loop 8 --)
- 7.1 min: check_goals, 13 s ()
- 9.3 min: inspect (whole run), 37 s (node scripts/inspect.mjs w1519170 --goals plans/qwen/goals/019-boushi-cap.json --loop 8 --)
- 15.6 min: check_goals, 12 s ()
- 16.0 min: try_value, 23 s ()
- 20.4 min: check_goals, 12 s ()
- 21.8 min: try_value, 25 s ()
- 24.9 min: check_goals, 12 s ()
- 25.4 min: check_goals, 12 s ()
- 25.8 min: inspect (whole run), 11 s (node scripts/inspect.mjs w1519170 --times 4,4.5 --quick 2>&1 / tail -30)
- 26.0 min: inspect (whole run), 32 s (node scripts/inspect.mjs w1519170 --times 3.5,4,4.5 --goals plans/qwen/goals/019-boushi-ca)
- 27.3 min: check_goals, 12 s ()
- 27.6 min: try_value, 24 s ()
- 28.3 min: check_goals, 13 s ()
- 28.7 min: check_goals, 12 s ()
