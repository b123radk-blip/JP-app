// Crisp 2D text as canvas textures (about 5000 px per metre) using the bundled Noto Sans JP subset, so it never depends on the
// headset's fonts. Evaluated against SDF text: see docs/ARCHITECTURE.md. Furigana (ruby) is laid out exactly with measureText.
import * as THREE from 'three';
import { TEXT, COLORS } from '../config.js';
import { appUrl } from './urls.js';

let anisotropy = 4;
export const setAnisotropy = (n) => { anisotropy = n; };

export async function loadFonts() {
  const faces = [['400', 'Regular'], ['700', 'Bold']].map(([weight, file]) => new FontFace(TEXT.fontFamily, `url(${appUrl(`assets/fonts/NotoSansJP-${file}.subset.ttf`)})`, { weight }));
  await Promise.all(faces.map((f) => f.load()));
  faces.forEach((f) => document.fonts.add(f));
}

const measureCtx = document.createElement('canvas').getContext('2d');
const font = (px, weight) => `${weight} ${px}px "${TEXT.fontFamily}", sans-serif`;
const REF = 100;                                              // measure at 100 px, scale to any size
const widthEm = (s, weight) => { measureCtx.font = font(REF, weight); return measureCtx.measureText(s).width / REF; };

function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrap(text, weight, maxEm) {
  if (!maxEm) return [text];
  const lines = []; let line = '';
  for (const word of text.split(' ')) { const t = line ? `${line} ${word}` : word; if (line && widthEm(t, weight) > maxEm) { lines.push(line); line = word; } else line = t; }
  return [...lines, line];
}

// draw(g, ppm): paint into a canvas of widthM x heightM metres; returns a plane mesh that can fade and be disposed.
function textMesh(widthM, heightM, draw) {
  const ppm = Math.min(TEXT.pxPerMeter, TEXT.maxCanvasPx / widthM);
  const c = document.createElement('canvas'); c.width = Math.ceil(widthM * ppm); c.height = Math.ceil(heightM * ppm);
  const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  draw(g, ppm);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = anisotropy;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1, depthTest: false, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(widthM, heightM), mat);
  mesh.renderOrder = 20;
  return { mesh, width: widthM, height: heightM, setOpacity(a) { mat.opacity = a; mesh.visible = a > 0.01; }, dispose() { tex.dispose(); mat.dispose(); mesh.geometry.dispose(); mesh.removeFromParent(); } };
}

function paint(g, str, x, y, px, weight, color, outline, glow) {
  g.font = font(px, weight);
  if (outline) { g.lineJoin = 'round'; g.lineWidth = px * 0.09; g.strokeStyle = 'rgba(8,6,4,0.9)'; g.strokeText(str, x, y); }
  if (glow) { g.shadowColor = glow; g.shadowBlur = px * 0.22; }
  g.fillStyle = color; g.fillText(str, x, y); g.shadowBlur = 0;
}
function paintPanel(g, w, h, panel, ppm) { if (!panel) return; g.fillStyle = panel.color ?? COLORS.panel; roundRect(g, 0, 0, w, h, panel.radius * ppm); g.fill(); }

// A text label. size = font size in metres. Options: weight, color, glow, outline, maxWidth (metres, wraps), panel { pad, radius, color? }.
export function makeLabel(text, { size = 0.05, weight = 700, color = COLORS.text, glow = 'rgba(255,150,60,0.55)', outline = true, maxWidth = null, panel = null } = {}) {
  const pad = panel ? panel.pad : 0.012, lines = wrap(text, weight, maxWidth ? maxWidth / size : 0), lh = size * 1.35;
  const w = Math.max(...lines.map((l) => widthEm(l, weight))) * size + 2 * pad, h = lh * lines.length + 2 * pad;
  return textMesh(w, h, (g, ppm) => {
    paintPanel(g, w * ppm, h * ppm, panel, ppm);
    lines.forEach((l, i) => paint(g, l, (w / 2) * ppm, (pad + lh * i + size * 1.02) * ppm, size * ppm, weight, color, outline, glow));
  });
}

// One line of Japanese with furigana centred over its base text. segments: [{ text, reading? }].
export function makeRubyLine(segments, { size = 0.09, rubyScale = 0.42, weight = 700, color = COLORS.text, rubyColor = COLORS.textDim, panel = null } = {}) {
  const rs = size * rubyScale, pad = panel ? panel.pad : 0.012, rubyH = rs * 1.35, baseH = size * 1.3;
  const segs = segments.map((s) => { const bw = widthEm(s.text, weight) * size, rw = s.reading ? widthEm(s.reading, weight) * rs : 0; return { ...s, bw, rw, w: Math.max(bw, rw + rs * 0.2) }; });
  const w = segs.reduce((a, s) => a + s.w, 0) + 2 * pad, h = rubyH + baseH + 2 * pad;
  return textMesh(w, h, (g, ppm) => {
    paintPanel(g, w * ppm, h * ppm, panel, ppm);
    let x = pad;
    for (const s of segs) {
      paint(g, s.text, (x + s.w / 2) * ppm, (pad + rubyH + size * 1.0) * ppm, size * ppm, weight, color, true, 'rgba(255,150,60,0.45)');
      if (s.reading) paint(g, s.reading, (x + s.w / 2) * ppm, (pad + rs * 1.05) * ppm, rs * ppm, weight, rubyColor, true, null);
      x += s.w;
    }
  });
}
