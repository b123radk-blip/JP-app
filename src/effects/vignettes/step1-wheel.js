// Step 1 scene 曜 (split out of step1-g.js):
//   weekday-wheel  曜: (name kept) seven separate day cards in a row beside the kanji, each with its big symbol on top
//                  and its kanji under it (moon, fire, water, tree, gold, soil, sun = 月火水木金土日); a red arrow hops
//                  from card to card, the card it stands over is framed, and the day's name (水曜日) shows above
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow, DAYS } from './step1-kit.js';
import { TEXT } from '../../config.js';

const SEG = ['#3a4466', '#4a5478', '#3a4466', '#4a5478', '#3a4466', '#2c58b0', '#c03848'];
const PW = 0.25, PH = 0.42, PITCH = 0.285;   // card size and spacing in glyph heights

// the seven cards: a coloured card per day with its kanji under the symbol (one canvas, one draw call)
function cards(u) {
  const c = document.createElement('canvas'), cw = 96, ch = 160, g = c.getContext('2d'); c.width = cw * 7; c.height = ch;
  const gap = Math.round(cw * (1 - PW / PITCH) / 2);
  for (let i = 0; i < 7; i++) {
    g.fillStyle = SEG[i]; g.fillRect(i * cw + gap, 0, cw - 2 * gap, ch);
    g.fillStyle = '#fff'; g.font = `900 52px "${TEXT.fontFamily}", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(DAYS[i], i * cw + cw / 2, ch * 0.82);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(PITCH * 7 * u, PH * u), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
}

// the name of the day it stands on (月曜日 ...): a sign in the app's font that redraws only when the day changes
function dayName(u) {
  const c = document.createElement('canvas'), g = c.getContext('2d'), h = 0.2 * u, w = 0.64 * u; c.width = 320; c.height = 100;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  let shown = -1;
  mesh.set = (i) => {
    if (i === shown) return; shown = i;
    g.fillStyle = SEG[i] === SEG[0] || SEG[i] === SEG[1] ? '#20283c' : SEG[i]; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#ffffff'; g.font = `900 72px "${TEXT.fontFamily}", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(`${DAYS[i]}曜日`, c.width / 2, c.height * 0.54); tex.needsUpdate = true;
  };
  return mesh;
}

export function weekdayWheel(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cy = B.cy + 0.02 * u, cx = B.maxX + 0.3 * u + 3 * PITCH * u, pw = PW * u, ph = PH * u, k = 1.5 * u;
  const X = (i) => (i - 3) * PITCH * u, SY = ph * 0.12, z = 0.02 * u;
  // each day's symbol on its card
  const sym = (i) => { const x = X(i), y = SY;
    return [
      [[G.torus(0.06 * k, 0.024 * k, Math.PI * 1.15, x, y, z, 1.4), 0xfff0b0]],                                      // 月 moon
      [[G.cone(0.05 * k, 0.13 * k, x, y, z), 0xff6a20], [G.cone(0.025 * k, 0.07 * k, x, y - 0.02 * k, z + 0.02 * u), 0xffe040]],   // 火 fire
      [[G.sphere(0.045 * k, x, y - 0.015 * k, z), 0x3aa0ff], [G.cone(0.044 * k, 0.07 * k, x, y + 0.03 * k, z), 0x3aa0ff]],          // 水 water
      [[G.cyl(0.014 * k, 0.014 * k, 0.07 * k, x, y - 0.045 * k, z), 0x7a4a24], [G.sphere(0.05 * k, x, y + 0.02 * k, z), 0x3aa040]],  // 木 tree
      [[G.cyl(0.05 * k, 0.05 * k, 0.02 * k, x, y, z, Math.PI / 2), 0xffc030], [G.cyl(0.032 * k, 0.032 * k, 0.025 * k, x, y, z, Math.PI / 2), 0xe09a10]],   // 金 gold coin
      [[G.sphere(0.065 * k, x, y - 0.03 * k, z, 1, 0.55, 0.6), 0x8a5a30], [G.sphere(0.03 * k, x + 0.02 * k, y, z, 1, 0.6, 0.6), 0x6a4020]],   // 土 soil
      [[G.sphere(0.045 * k, x, y, z), 0xffa020], ...Array.from({ length: 8 }, (_, j) => [G.box(0.014 * k, 0.03 * k, 0.01 * k, Math.cos(j * 0.785) * 0.075 * k + x, Math.sin(j * 0.785) * 0.075 * k + y, z, 0, 0, j * 0.785 - Math.PI / 2), 0xffc040])],   // 日 sun
    ][i]; };
  const row = new THREE.Group(), plates = cards(u), symbols = solidProp(Array.from({ length: 7 }, (_, i) => sym(i)).flat(), 0.7);
  const bar = 0.014 * u, fw = pw + 0.03 * u, fh = ph + 0.03 * u;
  const frame = solidProp([[G.box(fw, bar, 0.03 * u, 0, fh / 2, 0.01 * u), 0xffe060], [G.box(fw, bar, 0.03 * u, 0, -fh / 2, 0.01 * u), 0xffe060], [G.box(bar, fh, 0.03 * u, -fw / 2, 0, 0.01 * u), 0xffe060], [G.box(bar, fh, 0.03 * u, fw / 2, 0, 0.01 * u), 0xffe060]], 1.3);
  const pointer = solidProp([[G.cone(0.07 * u, 0.15 * u, 0, 0, 0, Math.PI), 0xe83a3a]], 0.8);
  const day = dayName(u);
  row.add(plates, symbols, frame, pointer, day); row.position.set(cx, cy, 0);
  group.add(row);
  const loop = 6.4, STEP = 0.55, T0 = 0.5;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const on = pre ? 0 : between(v, 0, 0.5) * (1 - between(v, 5.8, 6.2));
      row.visible = on > 0.01; row.scale.setScalar(grow(on));
      // the arrow hops from day to day (月 first), one card per STEP seconds
      const q = Math.max(0, (v - T0) / STEP), i = Math.min(6, Math.floor(q)), f = Math.min(1, q - i), hop = Math.sin(Math.PI * f);
      const showing = !pre && v > T0 - 0.1 && v < 5.8;
      pointer.visible = frame.visible = day.visible = showing;
      pointer.position.set(X(i), ph / 2 + 0.17 * u + 0.1 * u * hop + 0.015 * u * Math.sin(v * 9), 0.04 * u);
      frame.position.set(X(i), 0, 0.01 * u); frame.scale.setScalar(1 + 0.05 * bump(v, T0 + i * STEP + 0.1, 0.25));
      day.set(i); day.position.set(X(i), ph / 2 + 0.55 * u, 0.04 * u);
    },
  };
}

export const SCENES = { 'weekday-wheel': weekdayWheel };
