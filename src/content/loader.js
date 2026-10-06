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
