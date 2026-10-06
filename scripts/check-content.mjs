// Validates content/ and the files it points at. Run with `npm run check` (also part of `npm test`). Exit code 1 on any problem.
// Kanji cards (file = code point) and word cards (file = w<JMdict entry>): fields, readings, furigana, stroke data for every
// glyph, recipe (valid pieces, within budget), sentences (furigana rules, uses the card's kanji), font coverage, decks
// (cards exist, words come after the kanji they need), the voice clip list and the native-review list.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { BESPOKE_IDS } from '../src/effects/ids.js';
import { validateRecipe, normalizeRecipe, estimateCost } from '../src/effects/catalog.js';
import { EFFECTS, COMPONENT_LOOKS } from '../src/config.js';
import { buildClipList } from './voice-list.mjs';
import { buildReviewList } from './review-list.mjs';

const problems = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);
const json = (path) => { try { return JSON.parse(readFileSync(path, 'utf8')); } catch (e) { bad(path, `cannot read/parse (${e.message})`); return null; } };
const HAS_KANJI = /[一-鿿々]/, KANA_ONLY = /^[ぁ-ゟー]+$/, KANA_ANY = /^[ぁ-ゟァ-ヿー]+$/;
const hira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const hex = (ch) => ch.codePointAt(0).toString(16);

const manifest = json('audio/manifest.json');
const clips = manifest?.clips ?? {};
for (const [id, c] of Object.entries(clips)) if (!existsSync(c.src)) bad(`audio/manifest.json`, `clip "${id}" file ${c.src} is missing`);
const charset = existsSync('assets/fonts/charset.txt') ? new Set(readFileSync('assets/fonts/charset.txt', 'utf8')) : null;
if (!charset) bad('assets/fonts/charset.txt', 'missing: run `npm run build:font`');

const index = json('content/decks/index.json');
const cardIds = new Set(readdirSync('content/cards').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)));
const cards = Object.fromEntries([...cardIds].map((id) => [id, json(`content/cards/${id}.json`)]).filter(([, c]) => c));
const strokeData = (h, where) => (existsSync(`data/kanji-${h}.json`) ? json(`data/kanji-${h}.json`) : (bad(where, `stroke data data/kanji-${h}.json is missing (node scripts/build-kanji.mjs ${h})`), null));

function checkKanjiCard(path, id, c) {
  if (!c.kanji || [...c.kanji].length !== 1) return bad(path, 'kanji must be exactly one character');
  if (hex(c.kanji) !== id) bad(path, `file name should be the code point (${hex(c.kanji)}.json)`);
  if (c.primaryReading && !KANA_ONLY.test(c.primaryReading)) bad(path, 'primaryReading must be hiragana');
  const s = strokeData(id, path);
  if (s && (!s.strokes?.length || s.character !== c.kanji)) bad(`data/kanji-${id}.json`, 'no strokes, or it is for a different character');
  if (s && !Array.isArray(s.components)) bad(`data/kanji-${id}.json`, 'no component list: rebuild it with node scripts/build-kanji.mjs ' + id);
  return { glyphs: null, n: s?.strokes?.length ?? 0, components: s?.components ?? null, uses: [c.kanji] };
}

function checkWordCard(path, id, c) {
  if (!/^w\d+$/.test(id)) bad(path, 'word card files are named w<JMdict entry number>.json');
  if (!c.word) return bad(path, 'missing word');
  if (c.primaryReading && !KANA_ANY.test(c.primaryReading)) bad(path, 'primaryReading must be kana');
  const furi = c.furigana ?? [];
  if (furi.map((f) => f.text).join('') !== c.word) bad(path, 'furigana texts must spell the word');
  if (hira(furi.map((f) => f.reading ?? f.text).join('')) !== hira(c.primaryReading ?? '')) bad(path, 'furigana readings must spell primaryReading');
  for (const f of furi) if (f.reading && (!KANA_ONLY.test(f.reading) || !HAS_KANJI.test(f.text))) bad(path, `furigana "${f.text}": reading must be hiragana over kanji`);
  const taught = c.kanji ?? [];
  for (const k of taught) {
    if (!cards[k]) bad(path, `kanji ${k} has no kanji card`);
    if (![...c.word].some((ch) => hex(ch) === k)) bad(path, `kanji ${k} is not in the word`);
  }
  const glyphs = [...c.word].map((ch) => { const d = strokeData(hex(ch), path); const t = taught.includes(hex(ch)) && cards[hex(ch)];
    return d && { strokes: d.strokes.length, components: d.components, recipe: t && typeof t.effect !== 'string' ? normalizeRecipe(t.effect, COMPONENT_LOOKS) : null }; });
  return { glyphs: glyphs.every(Boolean) ? glyphs : null, n: 0, components: null, uses: [...c.word].filter((ch) => HAS_KANJI.test(ch)) };
}

for (const [id, c] of Object.entries(cards)) {
  const path = `content/cards/${id}.json`;
  if (c.id !== id) bad(path, `id "${c.id}" does not match the file name`);
  for (const f of ['meaning', 'primaryReading']) if (!c[f] || typeof c[f] !== 'string') bad(path, `missing ${f}`);
  if (c.audio !== undefined) bad(path, '"audio" is no longer used: clip ids come from the card id (src/content/clips.js)');
  if (c.mnemonic !== undefined && (typeof c.mnemonic !== 'string' || !c.mnemonic.trim() || c.mnemonic.length > 160)) bad(path, 'mnemonic must be one short line of text (max 160 characters)');
  const info = (c.type === 'word' ? checkWordCard : checkKanjiCard)(path, id, c);
  if (!info) continue;
  for (const p of validateRecipe(c.effect, { bespokeIds: BESPOKE_IDS, components: info.components })) bad(path, `effect: ${p}`);
  if (typeof c.effect !== 'string' && !validateRecipe(c.effect, { bespokeIds: BESPOKE_IDS }).length && (info.n || info.glyphs)) {
    const cost = estimateCost(normalizeRecipe(c.effect, COMPONENT_LOOKS), info.n, info.components ?? [], info.glyphs);
    for (const k of Object.keys(EFFECTS.budget)) if (cost[k] > EFFECTS.budget[k]) bad(path, `effect over budget: ${k} ${cost[k]} > ${EFFECTS.budget[k]} (src/config.js EFFECTS.budget)`);
  }
  if (!Array.isArray(c.sentences) || !c.sentences.length) bad(path, 'needs at least one sentence');
  (c.sentences ?? []).forEach((s, i) => {
    const w = `${path} sentence ${i + 1}`;
    if (!s.en) bad(w, 'missing English translation');
    if (s.audio !== undefined) bad(w, '"audio" is no longer used: clip ids come from the card id (src/content/clips.js)');
    if (typeof s.verified?.needsNativeReview !== 'boolean') bad(w, 'verified.needsNativeReview must be true/false');
    const segs = s.segments ?? [];
    if (!segs.length) bad(w, 'no segments');
    segs.forEach((seg, j) => {
      if (!seg.text) bad(w, `segment ${j + 1} has no text`);
      if (HAS_KANJI.test(seg.text ?? '') && !seg.reading) bad(w, `segment "${seg.text}" has kanji but no reading`);
      if (seg.reading && !KANA_ONLY.test(seg.reading)) bad(w, `reading of "${seg.text}" must be hiragana`);
      if (seg.reading && !HAS_KANJI.test(seg.text)) bad(w, `"${seg.text}" has a reading but no kanji`);
    });
    const text = segs.map((g) => g.text).join('');
    if (!info.uses.some((k) => text.includes(k))) bad(w, `sentence does not use the card's kanji (${info.uses.join('')})`);
  });
  if (charset) for (const ch of JSON.stringify(c)) if (ch.charCodeAt(0) > 0x7f && !charset.has(ch)) { bad(path, `character "${ch}" is not in the bundled font subset: run \`npm run build:font\``); break; }
}

for (const d of index?.decks ?? []) {
  if (!d.enabled) continue;
  const deck = json(`content/decks/${d.file}`), where = `content/decks/${d.file}`;
  for (const id of deck?.cards ?? []) if (!cardIds.has(id)) bad(where, `card ${id} does not exist`);
  if (deck && new Set(deck.cards).size !== deck.cards.length) bad(where, 'duplicate card ids');
  const pos = new Map((deck?.cards ?? []).map((id, i) => [id, i]));
  for (const id of deck?.cards ?? []) {
    if (cards[id]?.type !== 'word') continue;
    const need = deck.requires?.[id];
    if (!need) { bad(where, `word ${id} has no "requires" entry (its kanji)`); continue; }
    for (const k of need) if (!(pos.get(k) < pos.get(id))) bad(where, `word ${id} (${cards[id].word}) comes before its kanji ${k}`);
  }
}

// the voice clip list must match the content (it is what you render with VOICEVOX)
const list = existsSync('audio/clips.json') ? json('audio/clips.json') : null;
if (!list) bad('audio/clips.json', 'missing: run `npm run voice:list`');
else if (JSON.stringify(list.clips) !== JSON.stringify(buildClipList().clips)) bad('audio/clips.json', 'out of date with the cards: run `npm run voice:list`');
// so does the native-review list
if (!existsSync('docs/REVIEW.md') || readFileSync('docs/REVIEW.md', 'utf8') !== buildReviewList()) bad('docs/REVIEW.md', 'out of date with the cards: run `npm run review:list`');
if (Object.keys(clips).length && !manifest.voice?.credit) bad('audio/manifest.json', 'has clips but no voice.credit (VOICEVOX requires "VOICEVOX: <character>")');

if (problems.length) { console.error(`content check FAILED (${problems.length}):\n - ` + problems.join('\n - ')); process.exit(1); }
const words = Object.values(cards).filter((c) => c.type === 'word').length;
console.log(`content check ok: ${cardIds.size} cards (${cardIds.size - words} kanji, ${words} words), ${index.decks.filter((d) => d.enabled).length} enabled deck(s), ${Object.keys(clips).length} audio clips`);
