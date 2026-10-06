// Simple Anki-like scheduler. Swappable: anything that returns { newState, review, isDue, label } can replace it (e.g. FSRS).
// A card state is plain JSON: { id, step, interval, due, reps, lapses, firstDay, history: [{ t, day, rating }] }.
import { SRS } from '../config.js';
import { localDay, addLocalDays } from './dates.js';

export function createScheduler(cfg = SRS) {
  const ladder = cfg.ladderDays;
  const atRung = (i) => ladder[Math.min(i, ladder.length - 1)];

  function newState(id) {
    return { id, step: 0, interval: 0, due: 0, reps: 0, lapses: 0, firstDay: null, history: [] };
  }

  // Returns a NEW state; never mutates the input. Day-based intervals become due at the start of a local day.
  function review(state, rating, now) {
    const s = { ...state, history: [...state.history] };
    if (s.firstDay === null) s.firstDay = localDay(now);
    const minutes = (m) => now + m * 60000;
    if (rating === 'again') {
      if (s.interval > 0) s.lapses++;
      s.step = 0; s.interval = 0; s.due = minutes(cfg.againMinutes);
    } else if (rating === 'hard') {
      s.interval = Math.max(cfg.minHardDays, Math.round(s.interval * cfg.hardFactor));
      s.due = addLocalDays(now, s.interval);
    } else if (rating === 'good') {
      s.interval = atRung(s.step); s.step++;
      s.due = addLocalDays(now, s.interval);
    } else if (rating === 'easy') {
      s.interval = atRung(s.step + 1); s.step += 2;
      s.due = addLocalDays(now, s.interval);
    } else {
      throw new Error(`unknown rating: ${rating}`);
    }
    s.reps++;
    s.history.push({ t: now, day: localDay(now), rating });
    if (s.history.length > cfg.historyLimit) s.history.splice(0, s.history.length - cfg.historyLimit);
    return s;
  }

  const isDue = (state, now) => !state || state.due <= now;
  // Label for a rating button, e.g. "10m" or "3d", without changing anything.
  const label = (state, rating, now) => {
    const n = review(state || newState('?'), rating, now);
    return n.interval === 0 ? `${cfg.againMinutes}m` : `${n.interval}d`;
  };
  return { newState, review, isDue, label };
}
