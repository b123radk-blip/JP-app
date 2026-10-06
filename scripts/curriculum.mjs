// Teaching order for a level: each kanji, then the words it unlocks (all their kanji taught), most useful first.
// Usage: node scripts/curriculum.mjs --level n5 [--kanji-set n5|jlpt] [--dry]
// Writes content/decks/<level>.json ({ cards: [ids in order], requires: { wordId: [kanji ids] } }) and the work list
// .cache/work/<level>-items.json of cards that do not exist yet (input of pick-sentences.py and draft-cards.mjs).
// Existing cards keep their place at the front (their ids and the learner's progress never change).
// Words written with one kanji (山 やま, 人 ひと) are taught by that kanji's card, not by a separate word card.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LEVEL = arg('--level', 'n5'), LV = +LEVEL[1], SET = arg('--kanji-set', LEVEL === 'n5' ? 'n5' : 'jlpt');
const words = JSON.parse(readFileSync('data/lexicon/words.json', 'utf8'));
const kanji = JSON.parse(readFileSync('data/lexicon/kanji.json', 'utf8'));
const deckPath = `content/decks/${LEVEL}.json`;
const deck = existsSync(deckPath) ? JSON.parse(readFileSync(deckPath, 'utf8')) : { id: LEVEL, title: LEVEL.toUpperCase(), cards: [] };
const exists = (id) => existsSync(`content/cards/${id}.json`);

// the kanji this level teaches: the app's N5 set for N5, otherwise the JLPT kanji of the level
const taught = new Set(Object.entries(kanji).filter(([, k]) => (SET === 'n5' ? k.n5set : k.jlpt === LV)).map(([c]) => c));
const earlier = new Set(Object.entries(kanji).filter(([, k]) => (LV < 5 && (k.n5set || (k.jlpt && k.jlpt > LV)))).map(([c]) => c));
const known = (c) => taught.has(c) || earlier.has(c);
const pool = words.filter((w) => w.level === LV && !w.kanaOnly && !w.affix && w.kanji.length && w.kanji.every(known) && w.furigana);
const single = pool.filter((w) => [...w.word].length === 1);                 // taught by the kanji card itself
const multi = pool.filter((w) => [...w.word].length > 1);

const order = [...deck.cards], introduced = new Set(order.filter((id) => !id.startsWith('w')).map((id) => String.fromCodePoint(parseInt(id, 16))));
const placed = new Set(order);
const unlocked = (w) => w.kanji.every((c) => introduced.has(c) || earlier.has(c));
function placeWords() {                                                        // every word unlocked now, most useful first
  for (const w of multi.filter((x) => !placed.has(x.id) && unlocked(x)).sort((a, b) => b.use - a.use)) { order.push(w.id); placed.add(w.id); }
}
placeWords();
const left = new Set([...taught].filter((c) => !introduced.has(c)));
while (left.size) {
  // next kanji: the one whose words (now or soon) are most useful, then the more common kanji
  let best = null, bestScore = -1;
  for (const c of left) {
    let s = 0;
    for (const w of multi) if (!placed.has(w.id) && w.kanji.includes(c)) s += w.use * (w.kanji.every((x) => x === c || introduced.has(x) || earlier.has(x)) ? 1 : 0.25);
    s += 2 * (single.find((w) => w.word === c)?.use ?? 0) + (kanji[c].freq ? (2500 - kanji[c].freq) / 500 : 0);
    if (s > bestScore) { best = c; bestScore = s; }
  }
  left.delete(best); introduced.add(best);
  const id = kanji[best].hex;
  if (!placed.has(id)) { order.push(id); placed.add(id); }
  placeWords();
}

// primary reading of a kanji card: its own one-kanji word if it has one (山 やま), else the reading its words use most
function primaryReading(c) {
  const own = single.filter((w) => w.word === c).sort((a, b) => b.use - a.use)[0];
  if (own) return own.reading;
  const counts = Object.entries(kanji[c].inWords).sort((a, b) => b[1] - a[1]);
  return counts[0]?.[0] ?? (kanji[c].kun[0]?.replace(/\(.*\)/, '') || kanji[c].on[0]);
}
const requires = {};
for (const w of multi) if (placed.has(w.id)) requires[w.id] = w.kanji.filter((c) => taught.has(c) || earlier.has(c)).map((c) => kanji[c].hex);

const items = order.filter((id) => !exists(id)).map((id) => {
  if (!id.startsWith('w')) {
    const c = String.fromCodePoint(parseInt(id, 16)), k = kanji[c];
    return { id, type: 'kanji', kanji: c, meanings: k.meanings, on: k.on, kun: k.kun, primaryReading: primaryReading(c), words: single.filter((w) => w.word === c).map((w) => ({ id: w.id, reading: w.reading, meaning: w.meaning })), deckWords: pool.filter((w) => w.kanji.includes(c)).flatMap((w) => w.forms.filter((f) => f.includes(c))), strokes: k.strokes };
  }
  const w = multi.find((x) => x.id === id);
  return { id, type: 'word', word: w.word, reading: w.reading, meaning: w.meaning, pos: w.pos, furigana: w.furigana, kanji: requires[id], forms: w.forms, use: w.use, seq: w.seq };
});

console.log(`${LEVEL}: ${order.length} cards in order (${order.filter((i) => !i.startsWith('w')).length} kanji, ${order.filter((i) => i.startsWith('w')).length} words); ${items.length} new (${items.filter((i) => i.type === 'kanji').length} kanji, ${items.filter((i) => i.type === 'word').length} words); ${single.length} one-kanji words taught by their kanji card`);
if (process.argv.includes('--dry')) { console.log(order.map((id) => (id.startsWith('w') ? multi.find((w) => w.id === id)?.word : String.fromCodePoint(parseInt(id, 16)))).join(' ')); process.exit(0); }
mkdirSync('.cache/work', { recursive: true });
writeFileSync(`.cache/work/${LEVEL}-items.json`, JSON.stringify({ level: LEVEL, known: [...taught, ...earlier], items }, null, 1));
writeFileSync(deckPath, `{ "id": ${JSON.stringify(deck.id)}, "title": ${JSON.stringify(deck.title)},\n  "cards": [\n${chunk(order).join(',\n')}\n  ],\n  "requires": {\n${Object.entries(requires).filter(([id]) => placed.has(id)).map(([id, ks]) => `    ${JSON.stringify(id)}: ${JSON.stringify(ks)}`).join(',\n')}\n  }\n}\n`);
function chunk(ids) { const out = []; for (let i = 0; i < ids.length; i += 10) out.push('    ' + ids.slice(i, i + 10).map((x) => JSON.stringify(x)).join(', ')); return out; }
console.log(`wrote ${deckPath} and .cache/work/${LEVEL}-items.json`);
