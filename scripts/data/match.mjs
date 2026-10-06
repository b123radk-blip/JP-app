// Matching a JLPT list row to its JMdict entry, and choosing how the word is shown.
const PRI = { ichi1: 2, news1: 2, spec1: 1.5, gai1: 1, ichi2: 0.5, news2: 0.5, spec2: 0.5, gai2: 0.3 };
export const priScore = (e) => Math.max(0, ...[...e.k, ...e.r].map((f) => f.pri.reduce((s, p) => s + (PRI[p] ?? (p.startsWith('nf') ? (50 - +p.slice(2)) / 25 : 0)), 0)));

// expr: the list's written form, reading: its kana. Prefer entries that have both, then the most common.
// meaning: the JLPT list's English (optional). Homonyms share a spelling (はい "yes" / "lung", あれ "that" / "I"), so among
// the entries that fit, the one whose glosses share the most words with it wins; then JMdict priority.
const STOP = new Set(['to', 'a', 'an', 'the', 'of', 'e', 'g', 'etc', 'be', 'in', 'on', 'one', 's']);
const words = (s) => new Set((s.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => !STOP.has(w)));
function overlap(e, meaning) {                    // shared words, a match on the first sense counting double
  if (!meaning) return 0;
  const want = [...words(meaning)], first = words((e.senses[0]?.gloss ?? []).join(' ')), all = words(e.senses.flatMap((s) => s.gloss).join(' '));
  const lead = [...words(meaning.split(/[;,]/)[0])];                       // the list's first gloss breaks ties (コート "coat; court")
  return want.filter((w) => first.has(w)).length * 2 + want.filter((w) => all.has(w)).length + (lead.some((w) => first.has(w)) ? 3 : 0);
}
export function pickEntry(cands, expr, reading, meaning = '') {
  const kanaExpr = !/[㐀-鿿]/.test(expr);
  const fits = (e) => (kanaExpr ? e.r.some((r) => r.text === expr) : e.k.some((k) => k.text === expr) && e.r.some((r) => r.text === reading && (!r.restr.length || r.restr.includes(expr))));
  const ok = cands.filter(fits);
  const pool = ok.length ? ok : cands;
  return pool.sort((a, b) => overlap(b, meaning) - overlap(a, meaning) || priScore(b) - priScore(a) || a.seq - b.seq)[0] ?? null;
}

// Shown form: the most common kanji spelling, or kana when the word is usually written in kana ("uk") or has no kanji.
export function displayForm(e, expr, reading) {
  const usuallyKana = e.senses[0]?.misc.includes('uk') && !e.k.some((k) => k.pri.length);
  if (!e.k.length || usuallyKana || !/[㐀-鿿]/.test(expr)) return { word: !/[㐀-鿿]/.test(expr) ? expr : reading, kana: true };
  const k = [...e.k].filter((x) => !x.inf.some((i) => ['sK', 'rK', 'iK', 'oK', 'ik'].includes(i)) && !/[0-9０-９]/.test(x.text)).sort((a, b) => (b.pri.length - a.pri.length))[0];
  // the list's own spelling wins when JMdict has it with priority (飛ぶ, not the 跳ぶ of the same entry)
  if (e.k.some((x) => x.text === expr && x.pri.length)) return { word: expr, kana: false };
  return { word: k?.pri.length ? k.text : /[0-9０-９]/.test(expr) ? (k?.text ?? expr) : expr, kana: false };
}

// "student (esp. a university student)" -> "student"; up to two glosses of the first sense
export function shortMeaning(senses) {
  const clean = (g) => g.replace(/\s*\((?:esp\.|e\.g\.|usu\.|lit\.|orig\.|i\.e\.)[^)]*\)/g, '').replace(/\s*\([^)]{16,}\)/g, '').trim();
  const gl = (senses[0]?.gloss ?? []).map(clean).filter(Boolean);
  let out = gl.slice(0, 2).join('; ');
  if (out.length > 34) out = gl[0];
  return out;
}
