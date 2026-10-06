// Reads one KanjiVG SVG: the stroke paths (in stroke order) and the component groups (kvg:element) each stroke belongs to.
// Components: [{ element, original?, position?, depth, strokes: [stroke indices] }], outermost first; the kanji itself is
// not listed. A component KanjiVG splits into parts (kvg:part="1", "2", ...) is merged back into one entry.
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

export function parseKanjiVG(svg, id) {
  const strokes = [], components = [], stack = [];
  for (const m of svg.matchAll(/<g\b[^>]*>|<\/g>|<path\b[^>]*>/g)) {
    const tag = m[0];
    if (tag === '</g>') { stack.pop(); continue; }
    if (tag.startsWith('<path')) {
      const n = Number(attr(tag, 'id')?.match(/-s(\d+)$/)?.[1]);
      if (!attr(tag, 'id')?.startsWith(`kvg:${id}-s`) || !Number.isFinite(n)) continue;
      strokes.push({ n, d: attr(tag, 'd') });
      for (const c of stack) if (c) c.strokes.push(n);
      continue;
    }
    const element = attr(tag, 'kvg:element'), gid = attr(tag, 'id') ?? '';
    if (!element || gid === `kvg:${id}` || !gid.startsWith(`kvg:${id}-g`)) { stack.push(null); continue; }
    const depth = stack.filter(Boolean).length + 1, part = attr(tag, 'kvg:part');
    let comp = part && part !== '1' ? components.find((c) => c.element === element && c.part && c.depth === depth) : null;
    if (!comp) {
      comp = { element, original: attr(tag, 'kvg:original'), position: attr(tag, 'kvg:position'), depth, part, strokes: [] };
      components.push(comp);
    }
    stack.push(comp);
  }
  strokes.sort((a, b) => a.n - b.n);
  const index = new Map(strokes.map((s, i) => [s.n, i]));
  return {
    strokes,
    components: components.map(({ part, ...c }) => ({ ...Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined)), strokes: [...new Set(c.strokes)].map((n) => index.get(n)).sort((a, b) => a - b) })),
  };
}
