// Progress storage: versioned JSON in localStorage (or any backend with getItem/setItem/removeItem). Never throws.
import { STORAGE_KEY } from '../config.js';

export const VERSION = 1;
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
const fresh = () => ({ v: VERSION, createdAt: Date.now(), cards: {} });

function cleanCard(id, c) {
  if (!isObj(c) || !Array.isArray(c.history)) return null;
  const num = (x, d = 0) => (Number.isFinite(x) ? x : d);
  const history = c.history.filter((h) => isObj(h) && typeof h.rating === 'string' && typeof h.day === 'string').map((h) => ({ t: num(h.t), day: h.day, rating: h.rating }));
  return { id, step: num(c.step), interval: num(c.interval), due: num(c.due), reps: num(c.reps), lapses: num(c.lapses), firstDay: typeof c.firstDay === 'string' ? c.firstDay : null, history };
}

// Accepts the current format and the old unversioned one ({ cards }). Returns { data, dropped } or throws for unusable input.
export function normalize(raw) {
  if (!isObj(raw) || !isObj(raw.cards)) throw new Error('not a progress file');
  if (raw.v !== undefined && (!Number.isInteger(raw.v) || raw.v > VERSION)) throw new Error(`progress version ${raw.v} is newer than this app understands (${VERSION})`);
  const data = { v: VERSION, createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(), cards: {} };
  let dropped = 0;
  for (const [id, c] of Object.entries(raw.cards)) { const n = cleanCard(id, c); if (n) data.cards[id] = n; else dropped++; }
  return { data, dropped };
}

// A backend that always works: localStorage if usable, otherwise memory (and `persistent` is false).
export function safeBackend(win = globalThis) {
  try { const ls = win.localStorage; ls.setItem('__t', '1'); ls.removeItem('__t'); return { backend: ls, persistent: true }; }
  catch { const m = new Map(); return { backend: { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }, persistent: false }; }
}

export function createStorage(backend, key = STORAGE_KEY) {
  // status: 'ok' | 'fresh' | 'recovered' (unreadable data was backed up and replaced) | 'future' (newer version, backed up)
  function load() {
    let raw = null;
    try { raw = backend.getItem(key); } catch { /* treated as no data */ }
    if (raw === null || raw === undefined) return { data: fresh(), status: 'fresh', dropped: 0 };
    try { const { data, dropped } = normalize(JSON.parse(raw)); return { data, status: 'ok', dropped }; }
    catch (e) {
      try { backend.setItem(`${key}:backup`, raw); } catch { /* nothing more to do */ }
      return { data: fresh(), status: /newer/.test(String(e.message)) ? 'future' : 'recovered', dropped: 0, error: String(e.message) };
    }
  }
  function save(data) { try { backend.setItem(key, JSON.stringify(data)); return true; } catch { return false; } }
  const exportJSON = (data) => JSON.stringify(data, null, 2);
  const importJSON = (text) => { let parsed; try { parsed = JSON.parse(text); } catch { throw new Error('not valid JSON'); } return normalize(parsed); };
  function reset() { try { backend.removeItem(key); } catch { /* ignore */ } return fresh(); }
  return { load, save, exportJSON, importJSON, reset };
}
