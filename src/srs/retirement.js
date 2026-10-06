// A card's 3D animation is "active" until the learner has shown proficiency; a lapse brings it back.
import { SRS } from '../config.js';

// history: [{ rating, day }] oldest first. Looks only at the ratings since the last lapse.
export function isRetired(history = [], cfg = SRS) {
  let count = 0;
  const days = new Set();
  for (let i = history.length - 1; i >= 0; i--) {
    const { rating, day } = history[i];
    if (cfg.lapseRatings.includes(rating)) break;
    if (cfg.goodRatings.includes(rating)) { count++; days.add(day); }
  }
  return count >= cfg.retireMinRatings && days.size >= cfg.retireMinDays;
}

// mode: 'auto' follows the rules, 'on' / 'off' force it (debug panel)
export function animationActive(cardState, mode = 'auto', cfg = SRS) {
  if (mode === 'on') return true;
  if (mode === 'off') return false;
  return !isRetired(cardState ? cardState.history : [], cfg);
}
