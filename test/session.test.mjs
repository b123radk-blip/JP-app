import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQueue, StudySession } from '../src/srs/session.js';
import { createClock } from '../src/core/clock.js';
import { SRS } from '../src/config.js';
import { at } from './helpers.mjs';

const now = at(2026, 10, 6, 12);
const card = (due, firstDay = '2026-10-01') => ({ due, firstDay, history: [] });

test('due cards come first (oldest first), then new cards in deck order', () => {
  const cards = { b: card(now - 1000), c: card(now - 5000), d: card(now + 99999) };
  assert.deepEqual(buildQueue({ deckIds: ['a', 'b', 'c', 'd', 'e'], cards, now }), ['c', 'b', 'a', 'e']);
});
test('the daily new-card limit counts cards already introduced today', () => {
  const cfg = { ...SRS, newPerDay: 2 };
  const cards = { a: card(now + 99999, '2026-10-06') };
  assert.deepEqual(buildQueue({ deckIds: ['a', 'b', 'c', 'd'], cards, now, cfg }), ['b']);
});
test('nothing due: empty queue, unless studying ahead (then soonest first)', () => {
  const cards = { a: card(now + 3000), b: card(now + 1000) };
  assert.deepEqual(buildQueue({ deckIds: ['a', 'b'], cards, now }), []);
  assert.deepEqual(buildQueue({ deckIds: ['a', 'b'], cards, now, ahead: true }), ['b', 'a']);
});
test('session length is capped', () => {
  const cfg = { ...SRS, maxSessionCards: 2, newPerDay: 99 };
  assert.equal(buildQueue({ deckIds: ['a', 'b', 'c'], cards: {}, now, cfg }).length, 2);
});
test('rating Again re-queues a few cards later; other ratings finish the card', () => {
  const s = new StudySession(['a', 'b', 'c', 'd', 'e'], { ...SRS, againRequeueGap: 2 });
  assert.equal(s.answer('again'), 'b');
  assert.deepEqual(s.queue, ['b', 'c', 'a', 'd', 'e']);
  s.answer('good'); s.answer('good'); s.answer('good'); s.answer('good');
  assert.equal(s.current, 'e'); assert.equal(s.done, false);
  assert.equal(s.answer('easy'), null); assert.equal(s.done, true);
});
test('Again on the last card brings it straight back', () => {
  const s = new StudySession(['a']);
  assert.equal(s.answer('again'), 'a');
});
test('jumpTo moves a queued card to the front or adds an unqueued one', () => {
  const s = new StudySession(['a', 'b', 'c']);
  s.jumpTo('c'); assert.deepEqual(s.queue, ['c', 'a', 'b']);
  s.jumpTo('z'); assert.equal(s.current, 'z');
});
test('fake clock: ?today= sets the day, addDays crosses month ends', () => {
  const real = at(2026, 1, 1, 9, 30);
  const c = createClock({ search: '?debug=1&today=2026-10-06', realNow: () => real });
  assert.equal(c.today(), '2026-10-06');
  assert.equal(new Date(c.now()).getHours(), 9);          // same time of day
  c.addDays(26); assert.equal(c.today(), '2026-11-01');
  c.addDays(-1); assert.equal(c.today(), '2026-10-31');
  assert.equal(createClock({ search: '', realNow: () => real }).today(), '2026-01-01');
  assert.equal(createClock({ search: '?today=garbage', realNow: () => real }).today(), '2026-01-01');
});
