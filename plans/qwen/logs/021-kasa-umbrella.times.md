# Where the time went: 021-kasa-umbrella.md

Wall time 6.9 min: the model's own turns 4.4 min (64%), tools 2.5 min (36%).
46 model turns, 56982 tokens written (216/s over its turns, prompt reading included); thinking 133119 characters vs 18707 of text and code; largest prompt 116681 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 46 | 4.4 min | 64% |
| check_goals | 3 | 1.7 min | 25% |
| inspect (whole run) | 1 | 0.3 min | 5% |
| try_value | 1 | 0.2 min | 2% |
| orbit render | 1 | 0.1 min | 2% |
| npm test | 1 | 0.0 min | 1% |
| measure | 2 | 0.0 min | 1% |
| cost check | 3 | 0.0 min | 0% |
| other shell | 11 | 0.0 min | 0% |
| read a picture | 4 | 0.0 min | 0% |
| node --check | 3 | 0.0 min | 0% |
| own node scripts (measuring) | 2 | 0.0 min | 0% |
| edit / write code | 8 | 0.0 min | 0% |
| read a file | 13 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 1.4 min at 0.4 min, after read a file: 19095 tokens written, prompt 43704
- 0.6 min at 1.8 min, after cost check: 7260 tokens written, prompt 65200
- 0.3 min at 5.1 min, after measure: 3803 tokens written, prompt 92071
- 0.2 min at 0.1 min, after other shell: 3413 tokens written, prompt 36669
- 0.2 min at 4.2 min, after check_goals: 2890 tokens written, prompt 78690
- 0.2 min at 4.5 min, after measure: 2775 tokens written, prompt 82892
- 0.2 min at 6.6 min, after other shell: 2631 tokens written, prompt 113605
- 0.2 min at 2.3 min, after other shell: 2628 tokens written, prompt 73245

## Timeline (tool runs over 10 s)

- 2.6 min: check_goals, 91 s ()
- 5.4 min: try_value, 10 s ()
- 5.7 min: inspect (whole run), 20 s (cd "G:/AI/JP-app"; node scripts/inspect.mjs w1301940 --goals plans/qwen/goals/021-kasa-umb)
