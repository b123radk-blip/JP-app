// Validates content/ and the files it points at. Run with `npm run check` (also part of `npm test`). Exit code 1 on any problem.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { BESPOKE_IDS } from '../src/effects/ids.js';
import { validateRecipe, normalizeRecipe, estimateCost } from '../src/effects/catalog.js';
import { EFFECTS, COMPONENT_LOOKS } from '../src/config.js';
import { buildClipList } from './voice-list.mjs';

const problems = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);
const json = (path) => { try { return JSON.parse(readFileSync(path, 'utf8')); } catch (e) { bad(path, `cannot read/parse (${e.message})`); return null; } };
const HAS_KANJI = /[一-鿿々]/;
const KANA_ONLY = /^[ぁ-ゟー]+$/;

const manifest = json('audio/manifest.json');
const clips = manifest?.clips ?? {};
for (const [id, c] of Object.entries(clips)) if (!existsSync(c.src)) bad(`audio/manifest.json`, `clip "${id}" file ${c.src} is missing`);
const charset = existsSync('assets/fonts/charset.txt') ? new Set(readFileSync('assets/fonts/charset.txt', 'utf8')) : null;
if (!charset) bad('assets/fonts/charset.txt', 'missing: run `npm run build:font`');

const index = json('content/decks/index.json');
const cardIds = new Set(readdirSync('content/cards').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)));

for (const id of cardIds) {
  const path = `content/cards/${id}.json`, c = json(path);
  if (!c) continue;
  if (c.id !== id) bad(path, `id "${c.id}" does not match the file name`);
  if (!c.kanji || [...c.kanji].length !== 1) bad(path, 'kanji must be exactly one character');
  else if (c.kanji.codePointAt(0).toString(16) !== id) bad(path, `file name should be the code point (${c.kanji.codePointAt(0).toString(16)}.json)`);
  for (const f of ['meaning', 'primaryReading']) if (!c[f] || typeof c[f] !== 'string') bad(path, `missing ${f}`);
  if (c.primaryReading && !KANA_ONLY.test(c.primaryReading)) bad(path, 'primaryReading must be hiragana');
  if (c.audio !== undefined) bad(path, '"audio" is no longer used: clip ids come from the card id (src/content/clips.js)');
  if (c.mnemonic !== undefined && (typeof c.mnemonic !== 'string' || !c.mnemonic.trim() || c.mnemonic.length > 160)) bad(path, 'mnemonic must be one short line of text (max 160 characters)');
  const strokes = existsSync(`data/kanji-${id}.json`) ? json(`data/kanji-${id}.json`) : (bad(path, `stroke data data/kanji-${id}.json is missing (node scripts/build-kanji.mjs ${id})`), null);
  if (strokes && (!strokes.strokes?.length || strokes.character !== c.kanji)) bad(`data/kanji-${id}.json`, 'no strokes, or it is for a different character');
  if (strokes && !Array.isArray(strokes.components)) bad(`data/kanji-${id}.json`, 'no component list: rebuild it with node scripts/build-kanji.mjs ' + id);
  for (const p of validateRecipe(c.effect, { bespokeIds: BESPOKE_IDS, components: strokes?.components ?? null })) bad(path, `effect: ${p}`);
  if (strokes?.strokes && typeof c.effect !== 'string' && !validateRecipe(c.effect, { bespokeIds: BESPOKE_IDS }).length) {
    const cost = estimateCost(normalizeRecipe(c.effect, COMPONENT_LOOKS), strokes.strokes.length);
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
    if (!segs.some((seg) => seg.text.includes(c.kanji))) bad(w, `sentence does not use the card's kanji ${c.kanji}`);
  });
  if (charset) for (const ch of JSON.stringify(c)) if (ch.charCodeAt(0) > 0x7f && !charset.has(ch)) { bad(path, `character "${ch}" is not in the bundled font subset: run \`npm run build:font\``); break; }
}

for (const d of index?.decks ?? []) {
  if (!d.enabled) continue;
  const deck = json(`content/decks/${d.file}`);
  for (const id of deck?.cards ?? []) if (!cardIds.has(id)) bad(`content/decks/${d.file}`, `card ${id} does not exist`);
  if (deck && new Set(deck.cards).size !== deck.cards.length) bad(`content/decks/${d.file}`, 'duplicate card ids');
}

// the voice clip list must match the content (it is what you render with VOICEVOX)
const list = existsSync('audio/clips.json') ? json('audio/clips.json') : null;
if (!list) bad('audio/clips.json', 'missing: run `npm run voice:list`');
else if (JSON.stringify(list.clips) !== JSON.stringify(buildClipList().clips)) bad('audio/clips.json', 'out of date with the cards: run `npm run voice:list`');
if (Object.keys(clips).length && !manifest.voice?.credit) bad('audio/manifest.json', 'has clips but no voice.credit (VOICEVOX requires "VOICEVOX: <character>")');

if (problems.length) { console.error(`content check FAILED (${problems.length}):\n - ` + problems.join('\n - ')); process.exit(1); }
console.log(`content check ok: ${cardIds.size} cards, ${index.decks.filter((d) => d.enabled).length} enabled deck(s), ${Object.keys(clips).length} audio clips`);
