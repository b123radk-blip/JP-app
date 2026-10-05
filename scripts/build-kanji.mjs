// Converts the KanjiVG stroke paths for 日 (U+65E5) into sampled centre-line points.
// Input:  data/source/065e5.svg   (KanjiVG, CC BY-SA 3.0, https://kanjivg.org)
// Output: data/kanji-65e5.json    (loaded by src/main.js, which extrudes the 3D strokes)
import { readFileSync, writeFileSync } from 'node:fs';
import { svgPathProperties } from 'svg-path-properties';

const SRC = 'data/source/065e5.svg';
const OUT = 'data/kanji-65e5.json';
const STEP = 0.6; // sample spacing in KanjiVG units (the glyph box is 109 x 109)

const svg = readFileSync(SRC, 'utf8');
const strokes = [];
for (const m of svg.matchAll(/<path\s+id="kvg:065e5-s(\d+)"[^>]*\sd="([^"]+)"/g)) {
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
  return { id: `kvg:065e5-s${n}`, length: +len.toFixed(2), points };
});

const data = {
  character: '日',
  codepoint: 'U+65E5',
  source: 'KanjiVG (https://kanjivg.org), CC BY-SA 3.0, file kanji/065e5.svg',
  viewBox: [0, 0, 109, 109],
  strokeWidth: 3,
  bbox,
  strokes: out,
};
writeFileSync(OUT, JSON.stringify(data));
console.log(`${out.length} strokes, ${out.reduce((s, k) => s + k.points.length, 0)} points -> ${OUT}`);
console.log('bbox', bbox, 'stroke lengths', out.map(s => s.length).join(', '));
