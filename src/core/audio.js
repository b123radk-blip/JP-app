// Clip playback by id through audio/manifest.json. Missing clips are skipped silently (not every card has audio yet).
import { appUrl } from './urls.js';

export function createAudio({ onNote = () => {} } = {}) {
  let clips = {};
  const els = new Map();
  let enabled = true, current = null;
  const api = {
    async init() { try { clips = (await (await fetch(appUrl('audio/manifest.json'))).json()).clips || {}; } catch { clips = {}; } },
    has: (id) => !!(id && clips[id]),
    get enabled() { return enabled; },
    setEnabled(b) { enabled = b; if (!b) api.stop(); },
    // Load a clip's metadata so its length is known; resolves with the duration in seconds (or `fallback`).
    duration(id, fallback) {
      if (!api.has(id)) return Promise.resolve(fallback);
      const a = api._el(id);
      if (Number.isFinite(a.duration)) return Promise.resolve(a.duration);
      return new Promise((res) => { a.addEventListener('loadedmetadata', () => res(a.duration), { once: true }); a.addEventListener('error', () => res(fallback), { once: true }); setTimeout(() => res(fallback), 3000); });
    },
    _el(id) {
      if (!els.has(id)) { const a = new Audio(appUrl(clips[id].src)); a.preload = 'auto'; a.addEventListener('error', () => onNote(`Could not load ${clips[id].src}`)); els.set(id, a); }
      return els.get(id);
    },
    play(id) {
      if (!enabled || !api.has(id)) return false;
      api.stop();
      current = api._el(id); current.currentTime = 0;
      current.play().catch(() => onNote('Sound is blocked until you tap the page once (browser autoplay rule).'));
      return true;
    },
    stop() { if (current) { current.pause(); current = null; } },
  };
  return api;
}
