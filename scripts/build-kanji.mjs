// Converts KanjiVG stroke paths into sampled centre-lines, plus the components (kvg:element groups) each stroke belongs to.
// Usage:  node scripts/build-kanji.mjs <hex codepoint ...>    e.g. 65e5 (日) 706b (火); `--all` rebuilds every data/source/*.svg
// Input:  data/source/0XXXX.svg   (KanjiVG, CC BY-SA 3.0, https://kanjivg.org; the file name is the code point padded to 5 hex digits)
// Output: data/kanji-XXXX.json    { character, strokes: [{ id, length, points }], components: [{ element, original?, position?, depth, strokes }] }
//         Recipes style components by element ("parts": { "木": ... }); see src/effects/compose.js.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { svgPathProperties } from 'svg-path-properties';
import { parseKanjiVG } from './lib/kanjivg.mjs';

const STEP = 0.6; // sample spacing in KanjiVG units (the glyph box is 109 x 109)

function build(hex) {
  hex = hex.toLowerCase().replace(/^0+(?=[0-9a-f]{4})/, '');
  const id = hex.padStart(5, '0'), SRC = `data/source/${id}.svg`, OUT = `data/kanji-${hex}.json`;
  const { strokes, components } = parseKanjiVG(readFileSync(SRC, 'utf8'), id);
  if (strokes.length === 0) throw new Error('no stroke paths found in ' + SRC);
  const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const out = strokes.map(({ n, d }) => {
    const props = new svgPathProperties(d), len = props.getTotalLength();
    const count = Math.max(2, Math.ceil(len / STEP) + 1), points = [];
    for (let i = 0; i < count; i++) {
      const p = props.getPointAtLength((len * i) / (count - 1)), x = +p.x.toFixed(3), y = +p.y.toFixed(3);
      points.push([x, y]);
      bbox.minX = Math.min(bbox.minX, x); bbox.maxX = Math.max(bbox.maxX, x);
      bbox.minY = Math.min(bbox.minY, y); bbox.maxY = Math.max(bbox.maxY, y);
    }
    return { id: `kvg:${id}-s${n}`, length: +len.toFixed(2), points };
  });
  const data = {
    character: String.fromCodePoint(parseInt(hex, 16)), codepoint: 'U+' + hex.toUpperCase(),
    source: `KanjiVG (https://kanjivg.org), CC BY-SA 3.0, file kanji/${id}.svg`,
    viewBox: [0, 0, 109, 109], strokeWidth: 3, bbox, components, strokes: out,
  };
  writeFileSync(OUT, JSON.stringify(data));
  console.log(`${data.character} ${out.length} strokes, ${out.reduce((s, k) => s + k.points.length, 0)} points, components ${components.map((c) => `${'  '.repeat(c.depth - 1)}${c.element}[${c.strokes}]`).join(' ') || 'none'} -> ${OUT}`);
}
const args = process.argv.slice(2);
const list = args[0] === '--all' ? readdirSync('data/source').filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)) : args;
if (!list.length) { console.error('usage: node scripts/build-kanji.mjs <hex ...> | --all'); process.exit(1); }
for (const hex of list) build(hex);
