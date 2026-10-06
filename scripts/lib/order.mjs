// Teaching order, as pure functions (scripts/curriculum.mjs does the I/O; test/curriculum.test.mjs checks them).
//
// pickKanji: the next kanji to teach, chosen greedily by how many target words they complete. A word that still needs m
// untaught kanji gives each of them 1/m of its level weight (N5 words count more than N4, N4 more than N3), so a kanji that
// completes a word on its own scores more than one that only gets it half-way. Kanji frequency breaks ties.
// orderSection: the new cards after the existing ones: each planned kanji, right after it the words it unlocks (most useful
// first), then a fair share of the other words that are ready (kana-only words, words whose other kanji lie outside the plan),
// so those are spread through the section most useful first instead of piling up at the end.
// A word is ready once every kanji it has that is taught (already known or in the plan) has been introduced; kanji outside
// the plan are drawn plain with furigana on the word card and never hold it back.

export const LEVEL_WEIGHT = { 5: 1, 4: 0.3, 3: 0.1 };

// words: [{ kanji: [chars], level }]; known: Set of taught chars; freq: char -> frequency rank (lower = more common) or null
export function pickKanji(words, known, n, { freq = () => null, weight = LEVEL_WEIGHT } = {}) {
  const have = new Set(known), picked = [];
  const open = words.filter((w) => w.kanji.length && weight[w.level]);
  for (let i = 0; i < n; i++) {
    const score = new Map();
    for (const w of open) {
      const miss = [...new Set(w.kanji.filter((c) => !have.has(c)))];
      for (const c of miss) score.set(c, (score.get(c) ?? 0) + weight[w.level] / miss.length);
    }
    let best = null, bs = -Infinity;
    for (const [c, s] of score) { const f = freq(c), t = s + (f ? (3000 - Math.min(f, 3000)) / 1e6 : 0); if (t > bs || (t === bs && c < best)) { best = c; bs = t; } }
    if (!best) break;
    have.add(best); picked.push(best);
  }
  return picked;
}

// The kanji of a word that will have their own card (known or planned), and the ones drawn plain.
export function splitKanji(w, taught) {
  const uniq = [...new Set(w.kanji)];
  return { taught: uniq.filter((c) => taught.has(c)), outside: uniq.filter((c) => !taught.has(c)) };
}

// words: the target words not placed yet ({ id, kanji, use }); known: chars introduced before this section; plan: chars in
// teaching order. Returns [{ type: 'kanji', char } | { type: 'word', id }].
export function orderSection(words, known, plan) {
  const taught = new Set([...known, ...plan]), introduced = new Set(known), out = [], placed = new Set();
  const byUse = (a, b) => b.use - a.use || (a.id < b.id ? -1 : 1);
  const ready = (w) => splitKanji(w, taught).taught.every((c) => introduced.has(c));
  const place = (w) => { out.push({ type: 'word', id: w.id }); placed.add(w.id); };
  const pool = () => words.filter((w) => !placed.has(w.id) && ready(w)).sort(byUse);
  const total = words.length;
  plan.forEach((c, i) => {
    introduced.add(c); out.push({ type: 'kanji', char: c });
    for (const w of words.filter((x) => !placed.has(x.id) && x.kanji.includes(c) && ready(x)).sort(byUse)) place(w);
    // spread the rest: keep the share of words placed in step with the share of kanji introduced
    const due = Math.ceil((total * (i + 1)) / plan.length) - placed.size;
    for (const w of pool().slice(0, Math.max(0, due))) place(w);
  });
  for (const w of pool()) place(w);
  return out;
}
