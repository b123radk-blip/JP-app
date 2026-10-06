// Teaching order (scripts/lib/order.mjs): which kanji come next, and when a word is ready.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickKanji, orderSection, splitKanji } from '../scripts/lib/order.mjs';

const W = (id, kanji, use = 5, level = 5) => ({ id, kanji: [...kanji], use, level });

test('kanji are picked by the words they complete, N5 words above N4, frequency breaking ties', () => {
  const words = [W('a', '朝'), W('b', '朝'), W('c', '夜'), W('d', '春夏', 5, 5), W('e', '秋', 5, 4), W('f', '冬', 5, 4), W('g', '冬', 5, 4), W('h', '冬', 5, 4)];
  const plan = pickKanji(words, new Set(['日']), 3);
  assert.equal(plan[0], '朝', 'two N5 words beat three N4 words (0.9)');
  assert.ok(plan.indexOf('冬') < plan.indexOf('秋') || !plan.includes('秋'));
  const tie = pickKanji([W('x', '春'), W('y', '雪')], new Set(), 1, { freq: (c) => ({ 春: 600, 雪: 900 })[c] });
  assert.deepEqual(tie, ['春'], 'the more common kanji wins a tie');
  assert.deepEqual(pickKanji([W('x', '春夏')], new Set(), 2).sort(), ['夏', '春'], 'a two-kanji word gives each half its weight');
});

test('a word comes right after its last planned kanji, kana words are spread through the section', () => {
  const words = [W('w-asa', '朝'), W('w-maiasa', '毎朝', 4), W('w-kore', '', 9), W('w-sore', '', 1), W('w-yoru', '夜', 3)];
  const out = orderSection(words, new Set(['毎']), ['朝', '夜']).map((e) => e.char ?? e.id);
  assert.deepEqual(out.slice(0, 3), ['朝', 'w-asa', 'w-maiasa']);
  assert.ok(out.indexOf('w-kore') < out.indexOf('夜'), 'the most useful kana word does not wait for the end');
  assert.ok(out.indexOf('w-yoru') > out.indexOf('夜'));
  assert.equal(out.length, 7);
});

test('a kanji outside the plan never holds a word back; it is drawn plain', () => {
  const words = [W('w-isu', '椅子'), W('w-chair-room', '椅部')];
  assert.deepEqual(splitKanji(words[0], new Set(['子'])), { taught: ['子'], outside: ['椅'] });
  const out = orderSection(words, new Set(['子']), ['部']).map((e) => e.char ?? e.id);
  assert.ok(out.indexOf('w-isu') >= 0 && out.indexOf('w-chair-room') > out.indexOf('部'), 'placed after the planned kanji it needs, not after 椅');
});
