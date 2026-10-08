// Content loading with a cache. Failed loads are not cached, so a retry can succeed.
import { appUrl } from '../core/urls.js';
import { loadModelsFor } from '../effects/models.js';

const cache = new Map();
function getJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(appUrl(path)).then((r) => { if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`); return r.json(); }).catch((e) => { cache.delete(path); throw e; }));
  }
  return cache.get(path);
}
export const loadDeckIndex = () => getJSON('content/decks/index.json');
export const loadDeck = (file) => getJSON(`content/decks/${file}`);
export const loadCard = (id) => getJSON(`content/cards/${id}.json`);
export const loadStrokes = (id) => getJSON(`data/kanji-${id}.json`);
export const loadTrial = (name) => getJSON(`content/trials/${name}.json`);   // { title, note, cards: { id: effect } }

// What kind of glyph a character of a word is: a kanji with its own card ('kanji'), a kanji outside the plan, drawn plain
// with furigana ('plain'), or kana ('hiragana', 'katakana'; the long-vowel mark ー counts as katakana).
export function glyphKind(ch, taught) {
  const c = ch.codePointAt(0);
  if (c >= 0x3040 && c <= 0x309f) return 'hiragana';
  if (c >= 0x30a0 && c <= 0x30ff) return 'katakana';
  return taught ? 'kanji' : 'plain';
}

// Everything a card's animation needs. Kanji card: its stroke data. Word card: every glyph's stroke data, plus the recipe of
// each kanji the word teaches (from that kanji's card), so the word draws each kanji in its own look.
export async function loadCardAssets(id) {
  const card = await loadCard(id);
  await loadModelsFor(card.effect);                          // the 3D models its scene uses (effects/models.js)
  if (card.type !== 'word') return { card, assets: { kanji: await loadStrokes(id) } };
  const glyphs = await Promise.all([...card.word].map(async (ch) => {
    const hex = ch.codePointAt(0).toString(16), taught = (card.kanji ?? []).includes(hex);
    const [data, kcard] = await Promise.all([loadStrokes(hex), taught ? loadCard(hex) : null]);
    return { char: ch, data, taught, kind: glyphKind(ch, taught), effect: kcard?.effect };
  }));
  return { card, assets: { word: { glyphs } } };
}
