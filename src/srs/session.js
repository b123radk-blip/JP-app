// Which cards to study now, and the in-session queue.
import { SRS } from '../config.js';
import { localDay } from './dates.js';

// deckIds: ordered card ids. cards: { id: state }. Due cards first (oldest due first), then new cards up to the daily limit.
// If nothing is due and `ahead` is set, returns the cards due soonest instead (studying ahead of schedule).
export function buildQueue({ deckIds, cards, now, cfg = SRS, ahead = false }) {
  const today = localDay(now);
  const introducedToday = Object.values(cards).filter((c) => c.firstDay === today).length;
  const due = deckIds.filter((id) => cards[id] && cards[id].due <= now).sort((a, b) => cards[a].due - cards[b].due);
  const fresh = deckIds.filter((id) => !cards[id]).slice(0, Math.max(0, cfg.newPerDay - introducedToday));
  let queue = [...due, ...fresh];
  if (!queue.length && ahead) queue = deckIds.filter((id) => cards[id]).sort((a, b) => cards[a].due - cards[b].due);
  return queue.slice(0, cfg.maxSessionCards);
}

export class StudySession {
  constructor(queue, cfg = SRS) { this.queue = [...queue]; this.cfg = cfg; this.total = queue.length; this.reviewed = 0; }
  get current() { return this.queue[0] ?? null; }
  get done() { return this.queue.length === 0; }
  // Rating Again puts the card back a few cards later; any other rating finishes it for this session.
  answer(rating) {
    const id = this.queue.shift();
    this.reviewed++;
    if (rating === 'again') this.queue.splice(Math.min(this.cfg.againRequeueGap, this.queue.length), 0, id);
    return this.current;
  }
  jumpTo(id) { const i = this.queue.indexOf(id); if (i > 0) { this.queue.splice(i, 1); this.queue.unshift(id); } else if (i < 0) this.queue.unshift(id); }
}
