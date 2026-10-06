// Teaching order for a level: the cards that exist keep their place; after them come the planned kanji (chosen by how many
// of the level's words they unlock, scripts/lib/order.mjs), each followed by the words it unlocks, with kana-only words and
// words whose other kanji lie outside the plan spread through the section by usefulness.
// Usage: node scripts/curriculum.mjs --level n5 [--plan 150] [--dry]
//   --plan N  choose N new kanji by unlock value and save them to scripts/data/kanji-plan.json (later runs reuse that list)
// Writes content/decks/<level>.json ({ cards: [ids in order], requires: { wordId: [kanji ids with a card] } }) and the work
// list .cache/work/<level>-items.json of cards that do not exist yet (input of pick-sentences.py and draft-cards.mjs).
// Words written with one taught kanji (山 やま) are taught by that kanji's card, not by a separate word card.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { pickKanji, orderSection, splitKanji } from './lib/order.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LEVEL = arg('--level', 'n5'), LV = +LEVEL[1], PLAN_FILE = 'scripts/data/kanji-plan.json';
const words = JSON.parse(readFileSync('data/lexicon/words.json', 'utf8'));
const kanji = JSON.parse(readFileSync('data/lexicon/kanji.json', 'utf8'));
const deckPath = `content/decks/${LEVEL}.json`;
const deck = existsSync(deckPath) ? JSON.parse(readFileSync(deckPath, 'utf8')) : { id: LEVEL, title: LEVEL.toUpperCase(), cards: [] };
const exists = (id) => existsSync(`content/cards/${id}.json`);
const charOf = (id) => String.fromCodePoint(parseInt(id, 16));

// kanji with a card in any deck so far (this deck's existing cards first)
const known = new Set(deck.cards.filter((id) => !id.startsWith('w')).map(charOf));
const plans = existsSync(PLAN_FILE) ? JSON.parse(readFileSync(PLAN_FILE, 'utf8')) : {};
if (arg('--plan')) {
  const n = +arg('--plan');
  const weight = { [LV]: 1, [LV - 1]: 0.3, [LV - 2]: 0.1 };                       // this level's words count most, the next ones less
  plans[LEVEL] = pickKanji(words.filter((w) => !w.affix), known, n, { freq: (c) => kanji[c]?.freq ?? null, weight });
  writeFileSync(PLAN_FILE, `${JSON.stringify(plans, null, 1)}\n`);
}
const plan = (plans[LEVEL] ?? []).filter((c) => !known.has(c));
const taught = new Set([...known, ...plan]);

// the level's words; one-kanji words of a taught kanji are its card's own word
const level = words.filter((w) => w.level === LV && !w.affix && (w.kanaOnly || w.furigana));
const single = level.filter((w) => w.kanji.length === 1 && [...w.word].length === 1 && taught.has(w.kanji[0]));
const target = level.filter((w) => !single.includes(w) && !deck.cards.includes(w.id));
const section = orderSection(target, known, plan);
const order = [...deck.cards, ...section.map((e) => (e.type === 'kanji' ? kanji[e.char].hex : e.id))];

// primary reading of a kanji card: its own one-kanji word if it has one (山 やま), else the reading this level's words use most
// (汚 きたな from 汚い), else the one its words at any level use most
function primaryReading(c) {
  const own = single.filter((w) => w.word === c).sort((a, b) => b.use - a.use)[0];
  if (own) return own.reading;
  const here = {};
  for (const w of level) for (const f of w.furigana ?? []) if (f.reading && f.text === c) here[f.reading] = (here[f.reading] ?? 0) + w.use;
  const counts = Object.entries(Object.keys(here).length ? here : kanji[c].inWords).sort((a, b) => b[1] - a[1]);
  return counts[0]?.[0] ?? (kanji[c].kun[0]?.replace(/\(.*\)/, '') || kanji[c].on[0]);
}
const byId = new Map(words.map((w) => [w.id, w]));
const requires = { ...(deck.requires ?? {}) };
for (const id of order) if (id.startsWith('w') && !requires[id]) requires[id] = splitKanji(byId.get(id), taught).taught.map((c) => kanji[c].hex);

const items = order.filter((id) => !exists(id)).map((id) => {
  if (!id.startsWith('w')) {
    const c = charOf(id), k = kanji[c];
    return { id, type: 'kanji', kanji: c, meanings: k.meanings, on: k.on, kun: k.kun, jlpt: k.jlpt, primaryReading: primaryReading(c), words: single.filter((w) => w.word === c).map((w) => ({ id: w.id, reading: w.reading, meaning: w.meaning })), deckWords: level.filter((w) => w.kanji.includes(c)).flatMap((w) => w.forms.filter((f) => f.includes(c))), strokes: k.strokes };
  }
  const w = byId.get(id), { outside } = splitKanji(w, taught);
  return { id, type: 'word', word: w.word, reading: w.reading, meaning: w.meaning, pos: w.pos, furigana: w.furigana, kanji: requires[id], outside, kanaOnly: w.kanaOnly, forms: w.forms, use: w.use, seq: w.seq };
});

const count = (f) => order.filter(f).length, isK = (id) => !id.startsWith('w');
console.log(`${LEVEL}: ${order.length} cards in order (${count(isK)} kanji, ${count((i) => !isK(i))} words); ${items.length} new: ${items.filter((i) => i.type === 'kanji').length} kanji, ` +
  `${items.filter((i) => i.type === 'word' && !i.kanaOnly && !i.outside.length).length} words with taught kanji, ${items.filter((i) => i.outside?.length).length} with kanji outside the plan, ${items.filter((i) => i.kanaOnly).length} kana-only; ${single.length} one-kanji words taught by their kanji card`);
if (process.argv.includes('--dry')) { console.log(section.map((e) => (e.type === 'kanji' ? `[${e.char}]` : byId.get(e.id).word)).join(' ')); process.exit(0); }
mkdirSync('.cache/work', { recursive: true });
writeFileSync(`.cache/work/${LEVEL}-items.json`, JSON.stringify({ level: LEVEL, known: [...taught], items }, null, 1));
writeFileSync(deckPath, `{ "id": ${JSON.stringify(deck.id)}, "title": ${JSON.stringify(deck.title)},\n  "cards": [\n${chunk(order).join(',\n')}\n  ],\n  "requires": {\n${Object.entries(requires).filter(([id]) => order.includes(id)).map(([id, ks]) => `    ${JSON.stringify(id)}: ${JSON.stringify(ks)}`).join(',\n')}\n  }\n}\n`);
function chunk(ids) { const out = []; for (let i = 0; i < ids.length; i += 10) out.push('    ' + ids.slice(i, i + 10).map((x) => JSON.stringify(x)).join(', ')); return out; }
console.log(`wrote ${deckPath} and .cache/work/${LEVEL}-items.json`);
