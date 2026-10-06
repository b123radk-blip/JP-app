// Card JSON in the house style: one top-level key per line, short values inline, the effect one slot per line when long,
// each sentence's segments on one line. Keeps diffs readable when cards are reviewed.
const inline = (v) => JSON.stringify(v, null, 1).replace(/\n\s*/g, ' ').replace(/\[ /g, '[').replace(/ \]/g, ']').replace(/\{ /g, '{ ').replace(/ \}/g, ' }');

export function formatCard(card) {
  const lines = Object.entries(card).filter(([, v]) => v !== undefined).map(([k, v]) => {
    if (k === 'effect' && typeof v === 'object' && inline(v).length > 110) return `  "effect": {\n${Object.entries(v).map(([a, b]) => `    ${JSON.stringify(a)}: ${inline(b)}`).join(',\n')}\n  }`;
    if (k === 'sentences') {
      return `  "sentences": [\n${v.map((s) => `    {\n${Object.entries(s).map(([a, b]) => `      ${JSON.stringify(a)}: ${a === 'segments' ? `[ ${b.map(inline).join(', ')} ]` : inline(b)}`).join(',\n')}\n    }`).join(',\n')}\n  ]`;
    }
    return `  ${JSON.stringify(k)}: ${inline(v)}`;
  });
  const out = `{\n${lines.join(',\n')}\n}\n`;
  JSON.parse(out);                                           // never write broken JSON
  return out;
}
