// KanjiVG stroke data -> 3D stroke geometry. Strokes are flat centre-lines (x/y); each becomes a round-ish tube.
import * as THREE from 'three';

export const RADIAL = 14;           // vertices around each tube cross-section
export const WIDTH_UNITS = 6.5;     // stroke width in KanjiVG units (the source glyph uses 3; bolder reads better in VR)

// Normalise a kanji data file (see scripts/build-kanji.mjs) to metres, centred on the origin.
export function normalizeStrokes(kanji, glyphHeight) {
  const bb = kanji.bbox, S = glyphHeight / (bb.maxY - bb.minY);
  const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
  return { S, strokes: kanji.strokes.map((s) => ({ length: s.length, pts: s.points.map(([x, y]) => new THREE.Vector3((x - cx) * S, -(y - cy) * S, 0)) })) };
}

// When each stroke is drawn: longer strokes take longer. Returns [{ start, dur }] and the time the last one ends.
export function strokeSchedule(strokes, { start = 0.5, speed = 0.6, gap = 0.06 } = {}) {
  let t = start;
  const items = strokes.map((s) => { const dur = (0.35 + s.length * 0.012) * speed; const it = { start: t, dur }; t += dur + gap; return it; });
  return { items, end: Math.max(...items.map((i) => i.start + i.dur)) };
}

// Extrude an elliptical cross-section (width radius rw, depth radius rd) along a centre-line. Normals are exact for the ellipse.
export function buildTube(pts, rw, rd) {
  const n = pts.length;
  const pos = new Float32Array(n * RADIAL * 3), nor = new Float32Array(n * RADIAL * 3);
  const t = new THREE.Vector3(), nrm = new THREE.Vector3(), dir = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    t.subVectors(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize();
    nrm.set(-t.y, t.x, 0);
    for (let j = 0; j < RADIAL; j++) {
      const ang = (j / RADIAL) * Math.PI * 2, c = Math.cos(ang), sn = Math.sin(ang), k = (i * RADIAL + j) * 3;
      pos[k] = pts[i].x + nrm.x * c * rw; pos[k + 1] = pts[i].y + nrm.y * c * rw; pos[k + 2] = pts[i].z + sn * rd;
      dir.copy(nrm).multiplyScalar(c / rw); dir.z += sn / rd; dir.normalize();
      nor[k] = dir.x; nor[k + 1] = dir.y; nor[k + 2] = dir.z;
    }
  }
  const idx = [];
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < RADIAL; j++) {
    const a = i * RADIAL + j, b = i * RADIAL + ((j + 1) % RADIAL), c = (i + 1) * RADIAL + j, d = (i + 1) * RADIAL + ((j + 1) % RADIAL);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

// Show the first part of a stroke (p in 0..1). Returns the point where the drawn part ends, for tips and flame fronts.
export function drawProgress(geometry, pts, p, out = new THREE.Vector3()) {
  const segs = pts.length - 1, f = p * segs, k = Math.min(segs, Math.floor(f));
  geometry.setDrawRange(0, k * RADIAL * 6);
  return out.lerpVectors(pts[k], pts[Math.min(segs, k + 1)], f - k);
}
