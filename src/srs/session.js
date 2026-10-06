// Which cards to study now, and the in-session queue.
import { SRS } from '../config.js';
import { localDay } from './dates.js';

// deckIds: ordered card ids. cards: { id: state }. Due cards first (oldest due first), then new cards up to the daily limit.
// requires: { wordId: [kanji ids] }: a word is new only once all its kanji have been introduced (kanji unlock words).
// If nothing is due and `ahead` is set, returns the cards due soonest instead (studying ahead of schedule).
export function buildQueue({ deckIds, cards, now, cfg = SRS, ahead = false, requires = {} }) {
  const today = localDay(now);
  const introducedToday = Object.values(cards).filter((c) => c.firstDay === today).length;
  const due = deckIds.filter((id) => cards[id] && cards[id].due <= now).sort((a, b) => cards[a].due - cards[b].due);
  const limit = Math.max(0, cfg.newPerDay - introducedToday), fresh = [], soon = new Set();
  for (const id of deckIds) {                                   // a kanji earlier in today's new cards also unlocks its words
    if (fresh.length >= limit) break;
    if (!cards[id] && (requires[id] ?? []).every((k) => cards[k] || soon.has(k))) { fresh.push(id); soon.add(id); }
  }
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
