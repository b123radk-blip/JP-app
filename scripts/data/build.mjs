// Builds the compact lexicon the card generator uses, from the cached sources (npm run data:fetch first).
// Usage: npm run data:build [-- --levels n5,n4,n3]
// Writes data/lexicon/words.json (JLPT words matched to JMdict: display form, reading, meaning, part of speech, per-kanji
// furigana, usefulness), data/lexicon/kanji.json (KANJIDIC2 meanings / readings + the readings each kanji has in those
// words) and .cache/derived/sentences.jsonl (Tatoeba pairs with their headwords, for scripts/pick-sentences.py).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { CACHE, hexId } from './sources.mjs';
import { readGz, parseKanjidic, parseJmdict, parseJlptCsv, parseIndexLine, readTsvSentences } from './parse.mjs';
import { alignFurigana, isKanji } from './furigana.mjs';
import { pickEntry, displayForm, shortMeaning, priScore } from './match.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LEVELS = arg('--levels', 'n5,n4,n3').split(',');
const N5_SET = readFileSync('scripts/build-font.py', 'utf8').match(/N5_KANJI = \("([^"]+)"\s*"([^"]+)"\)/).slice(1).join('');

const kd = parseKanjidic(readGz('kanjidic2.xml.gz'));
const kdata = JSON.parse(readFileSync(`${CACHE}/kanji-data.json`, 'utf8'));
const jm = parseJmdict(readGz('JMdict_e.gz'));
const byText = new Map(); for (const e of jm) for (const f of [...e.k, ...e.r]) { if (!byText.has(f.text)) byText.set(f.text, []); byText.get(f.text).push(e); }

// Tatoeba: headword counts (usefulness) and the sentence pairs
const lines = readFileSync(`${CACHE}/jpn_indices.csv`, 'utf8').split('\n').map(parseIndexLine).filter(Boolean);
const count = new Map(); for (const l of lines) for (const w of l.words) count.set(w.word, (count.get(w.word) || 0) + 1);
const jpn = readTsvSentences('jpn_sentences.tsv'), eng = readTsvSentences('eng_sentences.tsv', new Set(lines.map((l) => l.eng)));
mkdirSync('.cache/derived', { recursive: true });
let kept = 0;
writeFileSync('.cache/derived/sentences.jsonl', lines.map((l) => {
  const text = jpn.get(l.jpn), en = eng.get(l.eng);
  if (!text || !en || [...text].length > 28) return null;
  kept++; return JSON.stringify({ jpn: l.jpn, eng: l.eng, text, en, words: l.words.map((w) => [w.word, w.reading, w.surface, w.good ? 1 : 0]) });
}).filter(Boolean).join('\n') + '\n');

const words = [], seen = new Map(), problems = [];
const DIGIT = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const numerals = (s) => s.replace(/[０-９]+/g, (d) => { const n = +[...d].map((c) => c.charCodeAt(0) - 0xff10).join(''); return n >= 10 ? `${n >= 20 ? DIGIT[Math.floor(n / 10)] : ''}十${DIGIT[n % 10]}` : DIGIT[n]; });   // ５日 -> 五日
for (const level of LEVELS) {
  for (const row of parseJlptCsv(readFileSync(`${CACHE}/jlpt-${level}.csv`, 'utf8'), +level[1])) {
    const affix = /[～~]/.test(row.expression);
    const expr = numerals(row.expression.split(/[;；]/)[0].replace(/[～~]/g, '').trim());
    const options = row.reading.split(/[;；]/).map((r) => r.replace(/[～~]/g, '').trim()).filter(Boolean);
    const e = pickEntry(byText.get(expr) ?? [], expr, options[0]);
    // several readings listed (毎年 まいねん; まいとし): teach the one JMdict lists first, keep the others as alternatives
    const rank = (r) => { const i = e?.r.findIndex((x) => x.text === r) ?? -1; return i < 0 ? 99 : i - (e.r[i].pri.length ? 10 : 0); };
    const [reading, ...others] = [...options].sort((a, b) => rank(a) - rank(b));
    if (!e) { problems.push(`${level} ${row.expression} (${row.reading}): no JMdict entry`); continue; }
    const id = `w${e.seq}`;
    if (seen.has(id)) { const o = seen.get(id); if (reading !== o.reading && !o.alsoReadings.includes(reading)) o.alsoReadings.push(reading); continue; }   // 九 きゅう / く
    const { word, kana } = displayForm(e, expr, reading);
    const sense = e.senses[0] ?? { pos: [], gloss: [] };
    const w = {
      id, seq: e.seq, level: +level[1], word, reading, kanaOnly: kana, affix, meaning: shortMeaning(e.senses), pos: sense.pos,
      kanji: [...new Set([...word].filter(isKanji))], furigana: kana ? [{ text: word }] : alignFurigana(word, reading, (c) => kd.get(c)),
      forms: [...new Set([word, reading, ...e.k.filter((k) => k.pri.length).map((k) => k.text), ...e.r.filter((r) => r.pri.length).map((r) => r.text)])],
      use: Math.round(10 * (Math.log1p(Math.max(...[...e.k, ...e.r].map((f) => count.get(f.text) || 0))) + priScore(e))) / 10,
      alsoReadings: others,
    };
    if (!w.furigana) problems.push(`${level} ${word} (${reading}): furigana did not align`);
    seen.set(id, w); words.push(w);
  }
}

// kanji: everything the words use + the JLPT kanji of these levels + the app's N5 set
const wanted = new Set([...words.flatMap((w) => w.kanji), ...[...N5_SET], ...Object.entries(kdata).filter(([, v]) => v.jlpt_new && LEVELS.includes(`n${v.jlpt_new}`)).map(([k]) => k)]);
const kanji = {};
for (const ch of [...wanted].sort()) {
  const k = kd.get(ch); if (!k) { problems.push(`${ch}: not in KANJIDIC2`); continue; }
  const inWords = {};
  for (const w of words) for (const s of w.furigana ?? []) if (s.text === ch && s.base) inWords[s.base] = (inWords[s.base] || 0) + 1;
  kanji[ch] = { hex: hexId(ch), jlpt: kdata[ch]?.jlpt_new ?? null, n5set: N5_SET.includes(ch), strokes: k.strokes, grade: k.grade, freq: k.freq,
    on: k.on.slice(0, 3), kun: k.kun.slice(0, 4).map((r) => r.replace(/-/g, '').replace(/\.(.+)$/, '($1)')), meanings: k.meanings.slice(0, 3), inWords,
    words: words.filter((w) => w.kanji.includes(ch)).map((w) => w.id) };
}
mkdirSync('data/lexicon', { recursive: true });
const lineJson = (arr) => `[\n${arr.map((x) => JSON.stringify(x)).join(',\n')}\n]\n`;
writeFileSync('data/lexicon/words.json', lineJson(words));
writeFileSync('data/lexicon/kanji.json', `{\n${Object.entries(kanji).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n}\n`);
writeFileSync('data/lexicon/problems.txt', problems.join('\n') + '\n');
console.log(`words ${words.length} (${LEVELS.join(' ')}), kanji ${Object.keys(kanji).length}, Tatoeba pairs kept ${kept}, problems ${problems.length} (data/lexicon/problems.txt)`);
