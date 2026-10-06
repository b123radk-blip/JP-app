// Parsers for the open data (no npm packages): KANJIDIC2 and JMdict (XML, regex-based: both files are flat and regular),
// the JLPT CSV lists, and Tatoeba's Japanese index (one line per sentence: jpn id, eng id, headwords).
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { CACHE } from './sources.mjs';

const kata2hira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const all = (re, s) => [...s.matchAll(re)].map((m) => m[1]);
const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
export const readGz = (file) => gunzipSync(readFileSync(`${CACHE}/${file}`)).toString('utf8');

// KANJIDIC2 -> Map(literal -> { strokes, grade, freq, jlptOld, on: [hiragana], kun: ['まな.ぶ'], meanings: [en] })
export function parseKanjidic(xml) {
  const out = new Map();
  for (const m of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)) {
    const c = m[1], lit = c.match(/<literal>(.*?)<\/literal>/)[1];
    out.set(lit, {
      strokes: +(c.match(/<stroke_count>(\d+)/)?.[1] ?? 0), grade: +(c.match(/<grade>(\d+)/)?.[1] ?? 0) || null,
      freq: +(c.match(/<freq>(\d+)/)?.[1] ?? 0) || null, jlptOld: +(c.match(/<jlpt>(\d+)/)?.[1] ?? 0) || null,
      on: all(/<reading r_type="ja_on">(.*?)<\/reading>/g, c).map(kata2hira), kun: all(/<reading r_type="ja_kun">(.*?)<\/reading>/g, c),
      meanings: all(/<meaning>(.*?)<\/meaning>/g, c).map(unxml),            // English only: other languages carry m_lang="..."
    });
  }
  return out;
}

// JMdict -> [{ seq, k: [{ text, pri }], r: [{ text, pri, restr, nokanji }], senses: [{ pos, misc, gloss }] }]
export function parseJmdict(xml) {
  const entries = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    entries.push({
      seq: +e.match(/<ent_seq>(\d+)/)[1],
      k: [...e.matchAll(/<k_ele>([\s\S]*?)<\/k_ele>/g)].map(([, x]) => ({ text: x.match(/<keb>(.*?)<\/keb>/)[1], pri: all(/<ke_pri>(.*?)<\/ke_pri>/g, x), inf: all(/<ke_inf>&(.*?);<\/ke_inf>/g, x) })),
      r: [...e.matchAll(/<r_ele>([\s\S]*?)<\/r_ele>/g)].map(([, x]) => ({ text: x.match(/<reb>(.*?)<\/reb>/)[1], pri: all(/<re_pri>(.*?)<\/re_pri>/g, x), restr: all(/<re_restr>(.*?)<\/re_restr>/g, x), nokanji: x.includes('<re_nokanji') })),
      senses: [...e.matchAll(/<sense>([\s\S]*?)<\/sense>/g)].map(([, x]) => ({ pos: all(/<pos>&(.*?);<\/pos>/g, x), misc: all(/<misc>&(.*?);<\/misc>/g, x), gloss: all(/<gloss[^>]*>(.*?)<\/gloss>/g, x).map(unxml) })),
    });
  }
  return entries;
}

// A CSV line with "quoted, fields" -> array of strings
export function csvRow(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  return [...out, cur];
}
// JLPT list -> [{ expression, reading, level }] (open-anki-jlpt-decks: expression,reading,meaning,tags,guid)
export function parseJlptCsv(text, level) {
  return text.split('\n').slice(1).filter((l) => l.trim()).map(csvRow).map(([expression, reading, meaning = '']) => ({ expression: expression.trim(), reading: reading.trim(), meaning: meaning.trim(), level }));
}

// Tatoeba jpn_indices.csv: "jpnId \t engId \t headwords". A headword token: word(reading)[sense]{surface}~ ; "~" = checked good example.
export function parseIndexLine(line) {
  const [jpn, eng, idx] = line.split('\t');
  if (!idx) return null;
  const words = idx.trim().split(/\s+/).map((tok) => {
    const m = tok.match(/^([^([{~]+)(?:\(([^)]*)\))?(?:\[(\d+)\])?(?:\{([^}]*)\})?(~)?$/);
    return m ? { word: m[1], reading: m[2] ?? null, sense: m[3] ? +m[3] : null, surface: m[4] ?? m[1], good: !!m[5] } : null;
  }).filter(Boolean);
  return { jpn: +jpn, eng: +eng, words };
}
export function readTsvSentences(file, ids) {        // Map(id -> text) for the ids wanted (eng file is 2M lines; filter while reading)
  const out = new Map();
  for (const line of readFileSync(`${CACHE}/${file}`, 'utf8').split('\n')) {
    const t1 = line.indexOf('\t'); if (t1 < 0) continue;
    const id = +line.slice(0, t1);
    if (ids && !ids.has(id)) continue;
    out.set(id, line.slice(line.indexOf('\t', t1 + 1) + 1));
  }
  return out;
}
export { kata2hira };
