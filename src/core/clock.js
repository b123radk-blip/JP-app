// The app's clock. `?today=YYYY-MM-DD` starts it on that day (same time of day); the debug panel can add days.
import { localDay } from '../srs/dates.js';

export function createClock({ search = '', realNow = () => Date.now() } = {}) {
  let offset = 0;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(new URLSearchParams(search).get('today') || '');
  if (m) { const r = new Date(realNow()); offset = new Date(+m[1], +m[2] - 1, +m[3], r.getHours(), r.getMinutes(), r.getSeconds()).getTime() - r.getTime(); }
  return {
    now: () => realNow() + offset,
    today: () => localDay(realNow() + offset),
    addDays(n) { const d = new Date(realNow() + offset); d.setDate(d.getDate() + n); offset = d.getTime() - realNow(); },
  };
}
