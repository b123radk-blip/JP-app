# Where the time went: 018-kangaeru-medium.md

Wall time 12.8 min: the model's own turns 10.1 min (79%), tools 2.6 min (21%).
115 model turns, 122110 tokens written (201/s over its turns, prompt reading included); thinking 268915 characters vs 31389 of text and code; largest prompt 231337 tokens.

| kind | runs | time | share |
|---|---|---|---|
| the model's own turns | 115 | 10.1 min | 79% |
| own node scripts (measuring) | 34 | 1.0 min | 8% |
| edit / write code | 15 | 0.5 min | 4% |
| inspect (whole run) | 5 | 0.4 min | 3% |
| orbit render | 2 | 0.2 min | 1% |
| check_goals | 5 | 0.2 min | 1% |
| npm test | 1 | 0.1 min | 1% |
| measure | 6 | 0.1 min | 1% |
| inspect --look (close-up) | 2 | 0.1 min | 1% |
| other shell | 26 | 0.0 min | 0% |
| cost check | 3 | 0.0 min | 0% |
| read a picture | 16 | 0.0 min | 0% |
| read a file | 20 | 0.0 min | 0% |

## Slowest model turns (what it had just done)

- 0.7 min at 1.2 min, after other shell: 10732 tokens written, prompt 50489
- 0.6 min at 0.1 min, after other shell: 8341 tokens written, prompt 29294
- 0.6 min at 9.0 min, after own node scripts (measuring): 6830 tokens written, prompt 171742
- 0.5 min at 0.7 min, after other shell: 8076 tokens written, prompt 41033
- 0.4 min at 3.4 min, after check_goals: 5006 tokens written, prompt 74858
- 0.3 min at 7.4 min, after edit / write code: 3395 tokens written, prompt 150604
- 0.3 min at 7.0 min, after own node scripts (measuring): 3506 tokens written, prompt 142850
- 0.3 min at 8.2 min, after measure: 3233 tokens written, prompt 159735

## Timeline (tool runs over 10 s)

- 2.1 min: edit / write code, 31 s (G:\AI\JP-app\src\effects\vcat-qw.js)
- 2.8 min: own node scripts (measuring), 13 s (cd G:/AI/JP-app && cat > .cache/dumperr.mjs <<'EOF'
import { launch, serve } from '../scri)
- 3.0 min: own node scripts (measuring), 11 s (cd G:/AI/JP-app && cat > .cache/dumperr.mjs <<'EOF'
import { launch, serve } from '../scri)
