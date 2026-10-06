import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, normalize, safeBackend, VERSION } from '../src/srs/storage.js';
import { memBackend } from './helpers.mjs';

const KEY = 'k';
const goodCard = { step: 1, interval: 1, due: 5, reps: 1, lapses: 0, firstDay: '2026-10-06', history: [{ t: 1, day: '2026-10-06', rating: 'good' }] };

test('fresh when nothing is stored; save then load round-trips', () => {
  const st = createStorage(memBackend(), KEY);
  assert.equal(st.load().status, 'fresh');
  const { data } = st.load();
  data.cards.a = { id: 'a', ...goodCard };
  assert.equal(st.save(data), true);
  const again = st.load();
  assert.equal(again.status, 'ok');
  assert.deepEqual(again.data.cards.a, { id: 'a', ...goodCard });
});
test('corrupt JSON: starts fresh, keeps a backup of the unreadable text, never throws', () => {
  const b = memBackend({ [KEY]: '{not json' });
  const r = createStorage(b, KEY).load();
  assert.equal(r.status, 'recovered'); assert.deepEqual(r.data.cards, {});
  assert.equal(b.map.get(`${KEY}:backup`), '{not json');
});
test('wrong shape is treated like corrupt data', () => {
  assert.equal(createStorage(memBackend({ [KEY]: '[1,2]' }), KEY).load().status, 'recovered');
  assert.equal(createStorage(memBackend({ [KEY]: '{"cards":5}' }), KEY).load().status, 'recovered');
});
test('data from a NEWER app version is backed up, not silently overwritten', () => {
  const raw = JSON.stringify({ v: VERSION + 1, cards: {} });
  const b = memBackend({ [KEY]: raw });
  const r = createStorage(b, KEY).load();
  assert.equal(r.status, 'future');
  assert.equal(b.map.get(`${KEY}:backup`), raw);
});
test('old unversioned data ({ cards } only) migrates to the current version', () => {
  const { data } = normalize({ cards: { a: goodCard } });
  assert.equal(data.v, VERSION);
  assert.equal(data.cards.a.reps, 1);
});
test('invalid card entries are dropped and counted, valid ones kept; bad numbers are repaired', () => {
  const { data, dropped } = normalize({ v: 1, cards: { good: goodCard, bad: 'x', worse: { history: 'nope' }, nan: { ...goodCard, due: 'soon', reps: NaN } } });
  assert.equal(dropped, 2);
  assert.deepEqual(Object.keys(data.cards).sort(), ['good', 'nan']);
  assert.equal(data.cards.nan.due, 0); assert.equal(data.cards.nan.reps, 0);
});
test('export then import gives the same progress; garbage import throws a clear error', () => {
  const st = createStorage(memBackend(), KEY);
  const { data } = st.load(); data.cards.a = { id: 'a', ...goodCard };
  const back = st.importJSON(st.exportJSON(data));
  assert.deepEqual(back.data.cards, data.cards);
  assert.throws(() => st.importJSON('hello'), /not valid JSON/);
  assert.throws(() => st.importJSON('{"a":1}'), /not a progress file/);
  assert.throws(() => st.importJSON(JSON.stringify({ v: 99, cards: {} })), /newer/);
});
test('a backend that throws never breaks load / save / reset', () => {
  const boom = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const st = createStorage(boom, KEY);
  assert.equal(st.load().status, 'fresh'); assert.equal(st.save({}), false); assert.deepEqual(st.reset().cards, {});
});
test('safeBackend falls back to memory when localStorage is unavailable', () => {
  const r = safeBackend({ get localStorage() { throw new Error('denied'); } });
  assert.equal(r.persistent, false);
  r.backend.setItem('a', '1'); assert.equal(r.backend.getItem('a'), '1');
});
