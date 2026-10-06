// The data pipeline's pure parts: furigana alignment, JLPT/CSV and Tatoeba index parsing, JMdict matching.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alignFurigana, readingCandidates } from '../scripts/data/furigana.mjs';
import { csvRow, parseIndexLine, parseKanjidic, parseJmdict } from '../scripts/data/parse.mjs';
import { pickEntry, displayForm, shortMeaning } from '../scripts/data/match.mjs';

const KD = { 学: { on: ['がく'], kun: ['まな.ぶ'] }, 生: { on: ['せい', 'しょう'], kun: ['い.きる', 'う.まれる', 'なま'] }, 校: { on: ['こう'], kun: [] },
  本: { on: ['ほん'], kun: ['もと'] }, 三: { on: ['さん'], kun: ['み', 'みっ.つ'] }, 人: { on: ['じん', 'にん'], kun: ['ひと'] }, 食: { on: ['しょく'], kun: ['く.う', 'た.べる'] },
  母: { on: ['ぼ'], kun: ['はは'] }, 今: { on: ['こん', 'きん'], kun: ['いま'] }, 日: { on: ['にち', 'じつ'], kun: ['ひ', '-び', '-か'] } };
const al = (w, r) => alignFurigana(w, r, (c) => KD[c]).map((s) => (s.reading ? `${s.text}(${s.reading})` : s.text)).join(' ');

test('furigana: dictionary readings with rendaku and gemination, kana kept apart', () => {
  assert.equal(al('学生', 'がくせい'), '学(がく) 生(せい)');
  assert.equal(al('学校', 'がっこう'), '学(がっ) 校(こう)');
  assert.equal(al('三本', 'さんぼん'), '三(さん) 本(ぼん)');
  assert.equal(al('人々', 'ひとびと'), '人(ひと) 々(びと)');
  assert.equal(al('食べる', 'たべる'), '食(た) べる');
  assert.equal(readingCandidates(KD.本).get('ぽん'), 'ほん');
});
test('furigana: special readings keep the whole kanji run', () => {
  assert.equal(al('今日', 'きょう'), '今日(きょう)');
  assert.equal(al('お母さん', 'おかあさん'), 'お 母(かあ) さん');
  assert.equal(alignFurigana('学生', 'せんせい', (c) => KD[c])[0].reading, 'せんせい', 'a reading that matches nothing still gives one run');
});
test('CSV rows with quoted commas; Tatoeba index tokens', () => {
  assert.deepEqual(csvRow('会う,あう,"to meet, to see",JLPT,x'), ['会う', 'あう', 'to meet, to see', 'JLPT', 'x']);
  const l = parseIndexLine('4851\t1434\t食べる{食べます}~ 為る(する)[01]{する}');
  assert.deepEqual(l.words, [{ word: '食べる', reading: null, sense: null, surface: '食べます', good: true }, { word: '為る', reading: 'する', sense: 1, surface: 'する', good: false }]);
});
test('KANJIDIC2 / JMdict parsing and matching a JLPT row to its entry', () => {
  const kd = parseKanjidic('<character><literal>学</literal><misc><grade>1</grade><stroke_count>8</stroke_count></misc><reading_meaning><rmgroup><reading r_type="ja_on">ガク</reading><reading r_type="ja_kun">まな.ぶ</reading><meaning>study</meaning><meaning m_lang="fr">étude</meaning></rmgroup></reading_meaning></character>');
  assert.deepEqual(kd.get('学'), { strokes: 8, grade: 1, freq: null, jlptOld: null, on: ['がく'], kun: ['まな.ぶ'], meanings: ['study'] });
  const jm = parseJmdict(`<entry><ent_seq>1</ent_seq><k_ele><keb>学生</keb><ke_pri>ichi1</ke_pri></k_ele><r_ele><reb>がくせい</reb></r_ele><sense><pos>&n;</pos><gloss>student (esp. a university student)</gloss></sense></entry>
    <entry><ent_seq>2</ent_seq><k_ele><keb>学生</keb></k_ele><r_ele><reb>がくしょう</reb></r_ele><sense><pos>&n;</pos><misc>&arch;</misc><gloss>old student</gloss></sense></entry>
    <entry><ent_seq>3</ent_seq><k_ele><keb>在る</keb></k_ele><r_ele><reb>ある</reb><re_pri>ichi1</re_pri></r_ele><sense><pos>&v5r-i;</pos><misc>&uk;</misc><gloss>to exist</gloss></sense></entry>`);
  assert.equal(pickEntry(jm.slice(0, 2), '学生', 'がくせい').seq, 1);
  assert.equal(shortMeaning(jm[0].senses), 'student');
  assert.deepEqual(displayForm(jm[2], '在る', 'ある'), { word: 'ある', kana: true }, 'usually-kana words are shown in kana');
});

test('homonyms: a kana word takes the entry whose glosses match the JLPT meaning (はい "yes", not 肺 "lung")', () => {
  const e = (seq, gloss, pri = []) => ({ seq, k: [], r: [{ text: 'はい', pri, restr: [] }], senses: [{ gloss, pos: [], misc: [] }] });
  const lung = e(1, ['lung'], ['ichi1']), yes = e(2, ['yes', 'that is correct']);
  assert.equal(pickEntry([lung, yes], 'はい', 'はい', 'yes').seq, 2);
  assert.equal(pickEntry([lung, yes], 'はい', 'はい').seq, 1, 'without a meaning, JMdict priority decides as before');
});
