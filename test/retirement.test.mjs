import test from 'node:test';
import assert from 'node:assert/strict';
import { isRetired, animationActive } from '../src/srs/retirement.js';
import { createScheduler } from '../src/srs/scheduler.js';
import { entry, at } from './helpers.mjs';

test('a new card (no history) has an active animation', () => {
  assert.equal(isRetired([]), false);
  assert.equal(animationActive(null), true);
});
test('two Good ratings on the SAME day do not retire it', () => {
  assert.equal(isRetired([entry('good', '2026-10-06'), entry('good', '2026-10-06')]), false);
});
test('Good on two different days retires it; Easy counts too', () => {
  assert.equal(isRetired([entry('good', '2026-10-06'), entry('good', '2026-10-07')]), true);
  assert.equal(isRetired([entry('good', '2026-10-06'), entry('easy', '2026-10-08')]), true);
});
test('one rating is never enough', () => assert.equal(isRetired([entry('easy', '2026-10-06')]), false));
test('Again or Hard (a lapse) brings the animation back', () => {
  const retired = [entry('good', '2026-10-06'), entry('good', '2026-10-07')];
  assert.equal(isRetired([...retired, entry('again', '2026-10-20')]), false);
  assert.equal(isRetired([...retired, entry('hard', '2026-10-20')]), false);
});
test('after a lapse only the ratings since the lapse count', () => {
  const h = [entry('good', '2026-10-06'), entry('good', '2026-10-07'), entry('hard', '2026-10-20'), entry('good', '2026-10-21')];
  assert.equal(isRetired(h), false);                                   // one good day since the lapse
  assert.equal(isRetired([...h, entry('good', '2026-10-22')]), true);  // second day since the lapse
});
test('thresholds are configurable', () => {
  const cfg = { goodRatings: ['good', 'easy'], lapseRatings: ['again', 'hard'], retireMinRatings: 3, retireMinDays: 3 };
  const h = [entry('good', '2026-10-06'), entry('good', '2026-10-07')];
  assert.equal(isRetired(h, cfg), false);
  assert.equal(isRetired([...h, entry('good', '2026-10-09')], cfg), true);
});
test('debug override: on / off beat the rules', () => {
  const retired = { history: [entry('good', '2026-10-06'), entry('good', '2026-10-07')] };
  assert.equal(animationActive(retired, 'auto'), false);
  assert.equal(animationActive(retired, 'on'), true);
  assert.equal(animationActive({ history: [] }, 'off'), false);
});
test('multi-day sequence through the real scheduler: retire, lapse, come back, retire again', () => {
  const s = createScheduler();
  let st = s.newState('x');
  const rate = (rating, d) => { st = s.review(st, rating, at(2026, 10, d)); return animationActive(st); };
  assert.equal(rate('good', 6), true);      // day 1: still active
  assert.equal(rate('good', 7), false);     // day 2: retired
  assert.equal(rate('good', 10), false);    // stays retired
  assert.equal(rate('hard', 17), true);     // struggled: animation returns
  assert.equal(rate('good', 18), true);     // 1 good day since the lapse
  assert.equal(rate('good', 19), false);    // 2 good days: retired again
});
