// Writes the new cards of a level from the curriculum work list and the picked sentences, with drafted recipes.
// Usage: node scripts/draft-cards.mjs --level n5 [--dry]
// Before: node scripts/curriculum.mjs --level n5 && .venv-tts/bin/python scripts/pick-sentences.py n5
// After:  npm run voice:list && npm run build:font && npm test, then look at the contact sheet (npm run preview-shots).
// Never overwrites an existing card. Cards without a verified sentence are left out (and taken out of the deck).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EFFECTS } from '../src/config.js';
import { recipeSimilarity } from '../src/effects/similarity.js';
import { parseSpec } from '../src/effects/catalog.js';
import { ensureGlyphs } from './build-kanji.mjs';
import { readPlan } from './lib/plan-table.mjs';
import { draftKanji, draftWord, ALL_SKIES, LIGHT_SKIES, isDark, hash } from './lib/draft-recipe.mjs';
import { cardRecipe, loadCards } from './lib/similar-cards.mjs';
import { lookalikePairs } from './lib/lookalike.mjs';
import { formatCard } from './lib/format-card.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LEVEL = arg('--level', 'n5'), DRY = process.argv.includes('--dry'), TODAY = new Date().toISOString().slice(0, 10);
const work = JSON.parse(readFileSync(`.cache/work/${LEVEL}-items.json`, 'utf8'));
const picks = JSON.parse(readFileSync(`.cache/work/${LEVEL}-sentences.json`, 'utf8')).sentences;
const lex = JSON.parse(readFileSync('data/lexicon/kanji.json', 'utf8'));
const plan = Object.fromEntries(readPlan().map((r) => [r.name, r]));
// hand-written designs (scripts/data/kanji-designs.json): the recipe, mnemonic, and which KANJIDIC meanings / reading to show
const designs = existsSync('scripts/data/kanji-designs.json') ? JSON.parse(readFileSync('scripts/data/kanji-designs.json', 'utf8')) : {};
const hiraOf = (s) => [...s].map((c) => (c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c)).join('');
// every English meaning KANJIDIC2 gives a kanji (the lexicon keeps only the first three)
const fullMeanings = (() => {
  const src = '.cache/sources/kanjidic2.xml.gz', out = {};
  if (!existsSync(src)) return out;
  for (const ch of gunzipSync(readFileSync(src)).toString('utf8').split('<character>').slice(1)) {
    const lit = ch.match(/<literal>(.+?)<\/literal>/)?.[1];
    if (designs[lit]) out[lit] = [...ch.matchAll(/<meaning>(.+?)<\/meaning>/g)].map((m) => m[1]);
  }
  return out;
})();
function designProblems(c, d) {
  const k = lex[c], out = [], all = fullMeanings[c] ?? k.meanings;
  for (const m of (d.meaning ?? '').split(/;\s*/).filter(Boolean)) if (!all.includes(m)) out.push(`meaning "${m}" is not a KANJIDIC meaning (${all.join(', ')})`);
  const readings = new Set([...k.on.map(hiraOf), ...k.kun.map((r) => r.replace(/[.(].*$/, '').replace(/^-|-$/g, '')), ...Object.keys(k.inWords)]);   // also the readings JMdict words use (汚 きたな)
  if (d.reading && !readings.has(d.reading)) out.push(`reading "${d.reading}" is not a KANJIDIC reading stem (${[...readings].join(' ')})`);
  return out;
}
const cards = loadCards(), { warn, lookalike } = EFFECTS.similarity;
const kata = (s) => [...s].map((c) => (c >= 'ぁ' && c <= 'ゖ' ? String.fromCharCode(c.charCodeAt(0) + 0x60) : c)).join('');
const charOf = (hex) => String.fromCodePoint(parseInt(hex, 16));
const firstMeaning = (m) => m.split(/;\s*/)[0];
const kanjiMeaning = (k) => k.meanings.filter((m) => !/radical|\(no\.|katakana|hiragana/i.test(m)).slice(0, 2).join('; ');

await ensureGlyphs(work.items.flatMap((it) => (it.type === 'kanji' ? [it.kanji] : [...it.word])));
const deckIds = work.items.map((i) => i.id);
const looks = lookalikePairs([...Object.keys(cards).filter((id) => !id.startsWith('w')), ...work.items.filter((i) => i.type === 'kanji').map((i) => i.id)]);
const lookalikeOf = (id) => looks.filter(([a, b]) => a === id || b === id).map(([a, b]) => (a === id ? b : a));

// Vary a draft until no existing card scores at or above `warn` (look-alike kanji: `lookalike`). Order of changes: an idle
// motion (only if the draft has none: a drafted motion is part of the meaning), then a light particle layer, then the sky
// (only light skies behind dark materials). Keeps the best variant if none gets under the line.
const recipeCache = new Map(), recipeOf = (id) => { if (!recipeCache.has(id)) recipeCache.set(id, cardRecipe(cards[id])); return recipeCache.get(id); };
const KEEP_COLOR = new Set(['splash', 'rainbow', 'flag', 'stop']);              // emblems whose colour is the meaning
const RECOLOR = ['#ffd27a', '#8ad0ff', '#ff9ab0', '#a8f0a0', '#ffffff', '#c8a0ff'];
function resolve(id, card, { keepSky = false } = {}) {
  const others = Object.keys(cards).filter((oid) => oid !== id);
  const strictWith = new Set(lookalikeOf(id));
  const worst = (c) => { const r = cardRecipe(c); return Math.max(0, ...others.map((oid) => recipeSimilarity(r, recipeOf(oid)).score - (strictWith.has(oid) ? warn - lookalike : 0))); };
  const base = structuredClone(card.effect), h = hash(id), tries = [() => {}];
  const skies = [card.effect, ...(card.type === 'word' ? card.kanji.map((k) => cards[k]?.effect) : [])].some(isDark) ? LIGHT_SKIES : ALL_SKIES;
  // the drafted sky is often part of the meaning (snow for cold, night for every night): change it last
  if (!base.motion) for (const m of ['float', 'pulse', 'tilt', 'sway', 'bounce']) tries.push((e) => { e.motion = m; });
  // the same emblem in another colour is still the same thing (a pen is a pen)
  const em = base.emblem ? parseSpec('emblem', base.emblem) : null;
  if (em && !em.color && !KEEP_COLOR.has(em.type)) for (const color of RECOLOR) tries.push((e) => { e.emblem = typeof base.emblem === 'string' ? { ...parseSpec('emblem', base.emblem), color } : { ...base.emblem, color }; });
  for (const p of ['motes', 'sparks', 'dust', 'mist', 'bubbles', 'petals']) for (const m of base.motion ? [base.motion] : ['float', 'pulse', 'sway', 'tilt', 'bounce']) tries.push((e) => { e.motion = m; e.particles = [...(base.particles ?? []).slice(0, 1), p]; });
  if (!keepSky) for (let i = 1; i < skies.length; i++) tries.push((e) => { e.backdrop = skies[(h + i) % skies.length]; });
  let best = null;
  for (const t of tries) {
    const e = structuredClone(base); t(e);
    const c = { ...card, effect: e }, score = worst(c);
    if (!best || score < best.score) best = { effect: e, score };
    if (score < warn) break;
  }
  return best;
}

const made = [], skipped = [], wantedCount = {}, varied = [];
for (const item of work.items) {
  if (cards[item.id]) continue;
  const pick = picks[item.id];
  if (!pick) { skipped.push(`${item.word ?? item.kanji} (${item.id}): no verified sentence`); continue; }
  const sentence = { segments: pick.segments, en: pick.en, verified: { analysers: ['SudachiPy', 'Open JTalk'], date: TODAY, needsNativeReview: true }, source: pick.tatoeba ? { tatoeba: pick.tatoeba } : { written: true } };
  let card;
  if (item.type === 'kanji') {
    const row = plan[item.kanji], data = JSON.parse(readFileSync(`data/kanji-${item.id}.json`, 'utf8')), design = designs[item.kanji];
    if (design) { const p = designProblems(item.kanji, design); if (p.length) { console.log(`DESIGN ${item.kanji}: ${p.join('; ')}`); process.exitCode = 1; } }
    const { effect, wanted } = design ? { effect: structuredClone(design.effect), wanted: [] } : row ? draftKanji(row, data.components) : { effect: { backdrop: ALL_SKIES[hash(item.id) % ALL_SKIES.length] }, wanted: ['plan row'] };
    wanted.forEach((w) => { wantedCount[w] = (wantedCount[w] ?? []).concat(item.kanji); });
    card = { id: item.id, kanji: item.kanji, meaning: design?.meaning ?? kanjiMeaning(lex[item.kanji]), primaryReading: design?.reading ?? item.primaryReading,
      readings: { kun: item.kun, on: item.on.map(kata) }, mnemonic: design?.mnemonic ?? row?.mnemonic, effect, sentences: [sentence],
      review: { recipe: 'draft', mnemonic: 'draft' }, source: { kanjidic2: true, ...(item.words.length ? { words: item.words.map((w) => w.id) } : {}) } };
  } else {
    const { effect, rule } = draftWord(item, item.kanji.map((hex) => cards[hex]?.effect));
    const builtFrom = item.kanji.map((hex) => { const c = cards[hex]; return { k: charOf(hex), m: firstMeaning(c ? c.meaning : kanjiMeaning(lex[charOf(hex)])) }; });
    card = { id: item.id, type: 'word', word: item.word, primaryReading: item.kanaOnly ? item.word : item.reading,   // じゃ, not the list's じゃあ
      furigana: item.furigana.map(({ text, reading }) => (reading ? { text, reading } : { text })),
      meaning: item.meaning, pos: item.pos, kanji: item.kanji, builtFrom, effect, sentences: [sentence], review: { recipe: 'draft', rule },
      source: { jmdict: item.seq, jlpt: +LEVEL[1] } };
  }
  // a hand-written design keeps its material, reveal, scene, emblem, parts and motion; only an idle motion, a light particle
  // layer and the sky may vary (not the sky either when it carries the meaning: "keepSky")
  const best = resolve(item.id, card, { keepSky: item.type === 'kanji' && designs[item.kanji]?.keepSky });
  if (best && JSON.stringify(best.effect) !== JSON.stringify(card.effect)) varied.push(`${item.word ?? item.kanji} (${best.score.toFixed(2)})`);
  if (best) card.effect = best.effect;
  cards[item.id] = card; made.push(item.id); recipeCache.delete(item.id);
}
// second pass: each new card against every other card (the first pass only saw the ones made before it)
let polished = 0;
for (const id of made) {
  const card = cards[id], best = resolve(id, card, { keepSky: card.type !== 'word' && designs[card.kanji]?.keepSky });
  if (JSON.stringify(best.effect) !== JSON.stringify(card.effect)) { card.effect = best.effect; recipeCache.delete(id); polished++; }
}
if (!DRY) for (const id of made) writeFileSync(`content/cards/${id}.json`, formatCard(cards[id]));

// the deck keeps only ids that have a card
const deckPath = `content/decks/${LEVEL}.json`, deck = JSON.parse(readFileSync(deckPath, 'utf8'));
const has = (id) => !!cards[id] && (DRY || existsSync(`content/cards/${id}.json`) || made.includes(id));
deck.cards = deck.cards.filter(has);
deck.requires = Object.fromEntries(Object.entries(deck.requires ?? {}).filter(([id]) => has(id)));
if (!DRY) writeFileSync(deckPath, `{ "id": ${JSON.stringify(deck.id)}, "title": ${JSON.stringify(deck.title)},\n  "cards": [\n${deck.cards.reduce((rows, id, i) => { if (i % 10 === 0) rows.push([]); rows.at(-1).push(JSON.stringify(id)); return rows; }, []).map((r) => `    ${r.join(', ')}`).join(',\n')}\n  ],\n  "requires": {\n${Object.entries(deck.requires).map(([id, ks]) => `    ${JSON.stringify(id)}: ${JSON.stringify(ks)}`).join(',\n')}\n  }\n}\n`);

const log = { level: LEVEL, date: TODAY, made: made.length, kanji: made.filter((i) => !i.startsWith('w')).length, words: made.filter((i) => i.startsWith('w')).length, skipped, varied, wanted: Object.fromEntries(Object.entries(wantedCount).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => [k, v.join('')])), lookalikes: looks.map(([a, b]) => charOf(a) + charOf(b)) };
writeFileSync(`.cache/work/${LEVEL}-draft-log.json`, JSON.stringify(log, null, 1));
console.log(`${DRY ? '[dry] ' : ''}made ${log.made} cards (${log.kanji} kanji, ${log.words} words); skipped ${skipped.length}; varied for distinctness ${varied.length}, again in the second pass ${polished}`);
console.log('skipped:', skipped.join('; ') || 'none');
console.log('pieces the drafts wanted:', JSON.stringify(log.wanted));
