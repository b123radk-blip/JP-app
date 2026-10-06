// Content loading with a cache. Failed loads are not cached, so a retry can succeed.
import { appUrl } from '../core/urls.js';

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

// Everything a card's animation needs. Kanji card: its stroke data. Word card: every glyph's stroke data, plus the recipe of
// each kanji the word teaches (from that kanji's card), so the word draws each kanji in its own look.
export async function loadCardAssets(id) {
  const card = await loadCard(id);
  if (card.type !== 'word') return { card, assets: { kanji: await loadStrokes(id) } };
  const glyphs = await Promise.all([...card.word].map(async (ch) => {
    const hex = ch.codePointAt(0).toString(16), taught = (card.kanji ?? []).includes(hex);
    const [data, kcard] = await Promise.all([loadStrokes(hex), taught ? loadCard(hex) : null]);
    return { char: ch, data, taught, effect: kcard?.effect };
  }));
  return { card, assets: { word: { glyphs } } };
}
