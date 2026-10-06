import test from 'node:test';
import assert from 'node:assert/strict';
import { createScheduler } from '../src/srs/scheduler.js';
import { SRS } from '../src/config.js';
import { at } from './helpers.mjs';

const s = createScheduler();
const day = 86400000;

test('Good walks up the ladder; due is the start of a local day', () => {
  let st = s.newState('a');
  const t0 = at(2026, 10, 6, 15);
  st = s.review(st, 'good', t0);
  assert.equal(st.interval, 1);
  assert.equal(st.due, at(2026, 10, 7, 0));
  st = s.review(st, 'good', at(2026, 10, 7, 9));
  assert.equal(st.interval, 3);
  assert.equal(st.due, at(2026, 10, 10, 0));
  assert.equal(st.reps, 2);
  assert.equal(st.firstDay, '2026-10-06');
});
test('Again: due in minutes, back to the first rung; lapses only count for learned cards', () => {
  const t0 = at(2026, 10, 6, 10);
  let st = s.review(s.newState('a'), 'again', t0);
  assert.equal(st.due, t0 + SRS.againMinutes * 60000);
  assert.equal(st.lapses, 0);                                  // never learned, not a lapse
  st = s.review(st, 'good', t0 + 1000);                        // learned (interval 1)
  st = s.review(st, 'again', t0 + 2000);
  assert.equal(st.lapses, 1);
  assert.equal(st.step, 0); assert.equal(st.interval, 0);
});
test('Hard grows a mature interval a little, at least one day; Easy skips a rung', () => {
  let st = { ...s.newState('a'), interval: 10, step: 3 };
  assert.equal(s.review(st, 'hard', at(2026, 10, 6)).interval, 12);
  assert.equal(s.review(s.newState('b'), 'hard', at(2026, 10, 6)).interval, 1);
  const e = s.review(s.newState('c'), 'easy', at(2026, 10, 6));
  assert.equal(e.interval, SRS.ladderDays[1]); assert.equal(e.step, 2);
});
test('the top rung is reused instead of running off the ladder', () => {
  let st = { ...s.newState('a'), step: 50 };
  assert.equal(s.review(st, 'good', at(2026, 10, 6)).interval, SRS.ladderDays.at(-1));
});
test('review never mutates its input; history is capped; unknown rating throws', () => {
  const st = s.newState('a');
  const before = JSON.stringify(st);
  s.review(st, 'good', at(2026, 10, 6));
  assert.equal(JSON.stringify(st), before);
  let cur = st;
  for (let i = 0; i < SRS.historyLimit + 10; i++) cur = s.review(cur, 'good', at(2026, 10, 6) + i * day);
  assert.equal(cur.history.length, SRS.historyLimit);
  assert.throws(() => s.review(st, 'meh', 0), /unknown rating/);
});
test('isDue and button labels', () => {
  const t0 = at(2026, 10, 6);
  assert.equal(s.isDue(undefined, t0), true);                  // new card
  const st = s.review(s.newState('a'), 'good', t0);
  assert.equal(s.isDue(st, t0), false);
  assert.equal(s.isDue(st, t0 + day), true);
  assert.equal(s.label(undefined, 'again', t0), `${SRS.againMinutes}m`);
  assert.equal(s.label(st, 'good', t0), '3d');
});
test('day-based due times survive a daylight-saving change (always local midnight)', () => {
  const st = s.review({ ...s.newState('a'), step: 2 }, 'good', at(2026, 3, 7, 20));   // 7-day rung across a US DST change
  const due = new Date(st.due);
  assert.equal(due.getHours(), 0); assert.equal(due.getDate(), 14);
});
