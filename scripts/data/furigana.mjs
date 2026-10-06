// Per-kanji furigana for a word from its kana reading, using each kanji's dictionary readings (KANJIDIC2) with the usual
// sound changes (rendaku か→が, gemination つ→っ). Kana in the word must match the reading literally. When a kanji run has
// no dictionary match (special readings like 今日 きょう, 大人 おとな) the whole run keeps the whole reading.
import { kata2hira } from './parse.mjs';

const DAKU = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢじ', つ: 'づず', て: 'で', と: 'ど', は: 'ばぱ', ひ: 'びぴ', ふ: 'ぶぷ', へ: 'べぺ', ほ: 'ぼぽ' };
export const isKanji = (c) => /[㐀-鿿豈-﫿]/.test(c);
const isKana = (c) => /[぀-ヿ]/.test(c);

// Map(spelling -> base reading) for one kanji. info: { on: ['がく'], kun: ['まな.ぶ'] }
export function readingCandidates(info) {
  const out = new Map(), add = (v, base) => { if (v && !out.has(v)) out.set(v, base); };
  const bases = [...(info?.on ?? []), ...(info?.kun ?? []).flatMap((k) => { const [stem, oku = ''] = k.replace(/-/g, '').split('.'); return oku ? [stem, stem + oku] : [stem]; })].map((r) => r.replace(/-/g, ''));
  for (const b of bases) add(b, b);
  for (const b of bases) {
    for (const d of DAKU[b[0]] ?? '') add(d + b.slice(1), b);
    if (b.length > 1 && 'つちくき'.includes(b.at(-1))) add(b.slice(0, -1) + 'っ', b);
  }
  return out;
}

// -> [{ text, reading?, base? }] (kana segments have no reading), or null when the kana parts cannot match at all
export function alignFurigana(word, reading, kanjiInfo) {
  const chars = [...word], R = kata2hira(reading).replace(/[ヶヵ]/g, 'か'), memo = new Map();
  function go(i, j, prev) {
    if (i === chars.length) return j === R.length ? [] : null;
    const key = `${i}:${j}`; if (memo.has(key)) return memo.get(key);
    const c = chars[i]; let res = null;
    if (isKana(c) || c === 'ー') {
      if (kata2hira(c) === R[j] || (c === 'ー' && R[j] === 'ー') || ('ヶヵ'.includes(c) && R[j] === 'か')) { const rest = go(i + 1, j + 1, null); if (rest) res = [{ text: c }, ...rest]; }
    } else if (isKanji(c) || c === '々') {
      const cands = c === '々' ? prev : readingCandidates(kanjiInfo(c));
      for (const [v, base] of [...(cands ?? new Map())].sort((a, b) => b[0].length - a[0].length)) {
        if (!R.startsWith(v, j)) continue;
        const rest = go(i + 1, j + v.length, readingCandidates(kanjiInfo(c === '々' ? chars[i - 1] : c)));
        if (rest) { res = [{ text: c, reading: v, base }, ...rest]; break; }
      }
    }
    memo.set(key, res); return res;
  }
  let segs = go(0, 0, null) ?? runFallback(chars, R);
  if (!segs) return null;
  // merge neighbouring kana into one segment
  return segs.reduce((out, s) => { const last = out.at(-1); if (last && !s.reading && !last.reading) last.text += s.text; else out.push({ ...s }); return out; }, []);
}

// Kanji runs take whatever reading lies between the kana anchors (jukujikun, irregular readings).
function runFallback(chars, R) {
  const units = []; for (const c of chars) { const k = isKanji(c) || c === '々' || 'ヶヵ'.includes(c); const last = units.at(-1); if (last && last.k === k) last.text += c; else units.push({ k, text: c }); }
  function go(u, j) {
    if (u === units.length) return j === R.length ? [] : null;
    const { k, text } = units[u];
    if (!k) { const t = kata2hira(text); if (!R.startsWith(t, j)) return null; const rest = go(u + 1, j + t.length); return rest && [{ text }, ...rest]; }
    for (let end = R.length; end > j; end--) { const rest = go(u + 1, end); if (rest) return [{ text, reading: R.slice(j, end), base: null }, ...rest]; }
    return null;
  }
  return go(0, 0);
}
