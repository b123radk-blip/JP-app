// Kanji that are easy to confuse by shape: same KanjiVG stroke-type sequence, or one stroke added / removed / changed
// (人/入, 日/目, 木/本, 大/犬). Their animations must be clearly different (check-recipes.mjs, draft-cards.mjs).
import { readFileSync, existsSync } from 'node:fs';

const types = (hex) => (existsSync(`data/kanji-${hex}.json`) ? JSON.parse(readFileSync(`data/kanji-${hex}.json`, 'utf8')).strokes.map((s) => (s.type ?? '').replace(/[a-z/]/g, '')) : null);
// identical sequences (人/入); one stroke added when the shorter has >= 3 strokes (大/犬, 日/目, 木/本); one stroke swapped
// from 4 strokes on. Shorter kanji differ too much in layout for one-stroke rules to mean much (一/十).
function close(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.join() === b.join()) return true;
  if (Math.min(a.length, b.length) < (a.length === b.length ? 4 : 3)) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}
// hexes: kanji card ids -> [[hexA, hexB], ...]
export function lookalikePairs(hexes) {
  const seq = Object.fromEntries(hexes.map((h) => [h, types(h)]).filter(([, t]) => t && t.length && t.every(Boolean)));
  const ids = Object.keys(seq), out = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (close(seq[ids[i]], seq[ids[j]])) out.push([ids[i], ids[j]]);
  return out;
}
