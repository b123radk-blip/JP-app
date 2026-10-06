export const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();
export const entry = (rating, day) => ({ rating, day, t: 0 });
export function memBackend(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), map: m };
}
