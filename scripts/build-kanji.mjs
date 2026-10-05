// Converts KanjiVG stroke paths into sampled centre-line points.
// Usage:  node scripts/build-kanji.mjs [hex codepoint ...]   (default: 65e5 = 日; 706b = 火)
// Input:  data/source/0XXXX.svg   (KanjiVG, CC BY-SA 3.0, https://kanjivg.org; the file name is the code point padded to 5 hex digits)
// Output: data/kanji-XXXX.json    (loaded by the pages, which extrude the 3D strokes)
import { readFileSync, writeFileSync } from 'node:fs';
import { svgPathProperties } from 'svg-path-properties';

const STEP = 0.6; // sample spacing in KanjiVG units (the glyph box is 109 x 109)

function build(hex) {
const id = hex.toLowerCase().padStart(5, '0');
const SRC = `data/source/${id}.svg`;
const OUT = `data/kanji-${hex.toLowerCase()}.json`;
const svg = readFileSync(SRC, 'utf8');
const strokes = [];
for (const m of svg.matchAll(new RegExp(`<path\\s+id="kvg:${id}-s(\\d+)"[^>]*\\sd="([^"]+)"`, 'g'))) {
  strokes.push({ n: Number(m[1]), d: m[2] });
}
strokes.sort((a, b) => a.n - b.n);
if (strokes.length === 0) throw new Error('no stroke paths found in ' + SRC);

const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
const out = strokes.map(({ n, d }) => {
  const props = new svgPathProperties(d);
  const len = props.getTotalLength();
  const count = Math.max(2, Math.ceil(len / STEP) + 1);
  const points = [];
  for (let i = 0; i < count; i++) {
    const p = props.getPointAtLength((len * i) / (count - 1));
    const x = +p.x.toFixed(3), y = +p.y.toFixed(3);
    points.push([x, y]);
    bbox.minX = Math.min(bbox.minX, x); bbox.maxX = Math.max(bbox.maxX, x);
    bbox.minY = Math.min(bbox.minY, y); bbox.maxY = Math.max(bbox.maxY, y);
  }
  return { id: `kvg:${id}-s${n}`, length: +len.toFixed(2), points };
});

const data = {
  character: String.fromCodePoint(parseInt(hex, 16)),
  codepoint: 'U+' + hex.toUpperCase(),
  source: `KanjiVG (https://kanjivg.org), CC BY-SA 3.0, file kanji/${id}.svg`,
  viewBox: [0, 0, 109, 109],
  strokeWidth: 3,
  bbox,
  strokes: out,
};
writeFileSync(OUT, JSON.stringify(data));
console.log(`${out.length} strokes, ${out.reduce((s, k) => s + k.points.length, 0)} points -> ${OUT}`);
console.log('bbox', bbox, 'stroke lengths', out.map(s => s.length).join(', '));
}
for (const hex of process.argv.slice(2).length ? process.argv.slice(2) : ['65e5']) build(hex);
