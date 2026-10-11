// Step 1 scene 曜 (split out of step1-g.js):
//   weekday-wheel  曜: (name kept) seven separate day cards in a row beside the kanji, each with its big symbol on top
//                  and its kanji under it (moon, fire, water, tree, gold, soil, sun = 月火水木金土日); a red arrow hops
//                  from card to card, the card it stands over is framed, and the day's name (水曜日) shows above
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { many } from '../pieces/kit-things.js';
import { createModel } from '../models.js';
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

// a teardrop (round at the bottom, tapering to a tip at the top) turned about the y axis: r wide, h tall
const drop = (r, h, bulb = 0.55) => new THREE.LatheGeometry(Array.from({ length: 21 }, (_, i) => { const t = i / 20; return new THREE.Vector2(r * Math.sin(Math.PI * Math.pow(t, bulb)) * (i === 20 ? 0 : 1), h * t); }), 20);
// a crescent moon: a disc of radius R with a disc of radius r (centre d to the right) cut out; flat, with a soft bevel
function crescent(R, r, d, depth) {
  const xi = (d * d + R * R - r * r) / (2 * d), yi = Math.sqrt(R * R - xi * xi), th = Math.atan2(yi, xi), ph = Math.atan2(yi, xi - d), sh = new THREE.Shape();
  sh.moveTo(xi, yi); sh.absarc(0, 0, R, th, 2 * Math.PI - th, false); sh.absarc(d, 0, r, -ph, ph - 2 * Math.PI, true);
  const bev = depth * 0.25;
  return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 40 }).translate(0, 0, -depth / 2);
}
// a soft round glow (radial gradient) for behind the moon
function halo(size) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,240,170,0.75)'); gr.addColorStop(0.45, 'rgba(255,240,170,0.28)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
}
// a gold bar: a trapezoid block with a bright top face
const goldBar = (w, h, d, x, y, z) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w * 0.36, h); sh.lineTo(-w * 0.36, h); sh.closePath();
  return [[new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }).translate(x, y, z - d / 2), 0xffc02a], [G.box(w * 0.72, h * 0.14, d, x, y + h, z), 0xffe58a]]; };

export function weekdayWheel(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cy = B.cy + 0.02 * u, cx = B.maxX + 0.3 * u + 3 * PITCH * u, pw = PW * u, ph = PH * u;
  const X = (i) => (i - 3) * PITCH * u;
  // each day's symbol on its card: moon, water, gold, soil and sun are merged shapes; fire (campfire model + flickering flames)
  // and tree (oak model) are Kenney models
  const y0 = -0.045 * u, z = 0.03 * u;
  const sym = (i) => { const x = X(i);
    return [
      [[crescent(0.082 * u, 0.068 * u, 0.034 * u, 0.02 * u).rotateZ(0.35).translate(x - 0.012 * u, y0 + 0.12 * u, z), 0xfff0a0],                                        // 月 moon (soft glow behind it)
       ...[[0.075, 0.2], [-0.085, 0.07], [0.09, 0.05]].map(([dx, dy], j) => [G.sphere((j ? 0.007 : 0.01) * u, x + dx * u, y0 + dy * u + 0.06 * u, z), 0xffffff])],
      [],                                                                                                                                                              // 火 fire: models + flames, below
      [[drop(0.062 * u, 0.19 * u).translate(x, y0 + 0.03 * u, z), 0x2f9bff], [G.sphere(0.014 * u, x - 0.026 * u, y0 + 0.07 * u, z + 0.05 * u, 0.7, 1.5, 0.5), 0xd8f0ff],     // 水 water: a drop and its ripples
       [G.torus(0.07 * u, 0.007 * u).rotateX(Math.PI / 2).translate(x, y0 + 0.012 * u, z), 0x8ccfff], [G.torus(0.1 * u, 0.006 * u).rotateX(Math.PI / 2).translate(x, y0 + 0.008 * u, z), 0x5fb4ff]],
      [],                                                                                                                                                              // 木 tree: oak model, below
      [...goldBar(0.11 * u, 0.045 * u, 0.07 * u, x - 0.058 * u, y0 + 0.01 * u, z), ...goldBar(0.11 * u, 0.045 * u, 0.07 * u, x + 0.058 * u, y0 + 0.01 * u, z), ...goldBar(0.11 * u, 0.045 * u, 0.07 * u, x, y0 + 0.07 * u, z)],   // 金 gold: a stack of bars
      [[G.sphere(0.1 * u, x, y0 + 0.02 * u, z, 1, 0.5, 0.75), 0x7a4a26], [G.sphere(0.04 * u, x - 0.05 * u, y0 + 0.035 * u, z + 0.05 * u, 1, 0.6, 0.8), 0x5e3818], [G.sphere(0.03 * u, x + 0.06 * u, y0 + 0.03 * u, z + 0.055 * u, 1, 0.6, 0.8), 0x93603a],   // 土 soil: a mound with a sprout
       [G.cyl(0.005 * u, 0.006 * u, 0.06 * u, x, y0 + 0.09 * u, z), 0x4a9a38], [G.sphere(0.028 * u, x - 0.025 * u, y0 + 0.125 * u, z, 1.4, 0.55, 0.5), 0x58b848], [G.sphere(0.028 * u, x + 0.025 * u, y0 + 0.135 * u, z, 1.4, 0.55, 0.5), 0x58b848]],
      [[G.sphere(0.05 * u, x, y0 + 0.11 * u, z), 0xffa020], ...Array.from({ length: 8 }, (_, j) => [G.cone(0.016 * u, 0.045 * u, Math.cos(j * 0.785) * 0.085 * u + x, Math.sin(j * 0.785) * 0.085 * u + y0 + 0.11 * u, z, j * 0.785 - Math.PI / 2), 0xffc040])],   // 日 sun
    ][i]; };
  const row = new THREE.Group(), plates = cards(u), symbols = solidProp(Array.from({ length: 7 }, (_, i) => sym(i)).flat(), 0.7);
  const bar = 0.014 * u, fw = pw + 0.03 * u, fh = ph + 0.03 * u;
  const frame = solidProp([[G.box(fw, bar, 0.03 * u, 0, fh / 2, 0.01 * u), 0xffe060], [G.box(fw, bar, 0.03 * u, 0, -fh / 2, 0.01 * u), 0xffe060], [G.box(bar, fh, 0.03 * u, -fw / 2, 0, 0.01 * u), 0xffe060], [G.box(bar, fh, 0.03 * u, fw / 2, 0, 0.01 * u), 0xffe060]], 1.3);
  const pointer = solidProp([[G.cone(0.07 * u, 0.15 * u, 0, 0, 0, Math.PI), 0xe83a3a]], 0.8);
  const day = dayName(u);
  // fire: the campfire pit and logs with flames rising from it (layered orange and yellow tongues that flicker); tree: the oak
  const pit = createModel('campfire', { width: 0.2 * u }), oak = createModel('oak', { height: 0.23 * u, glow: 0.1 }), moonGlow = halo(0.34 * u);
  pit.group.position.set(X(1), y0, 0.05 * u); oak.group.position.set(X(3), y0, 0.05 * u); moonGlow.position.set(X(0) - 0.005 * u, y0 + 0.125 * u, 0.012 * u);
  const FL = [[0, 0, 1], [-0.034, 0.004, 0.68], [0.036, -0.004, 0.76], [0, -0.03, 0.8]],                       // [dx, dz (in u), size] outer orange tongues
    FY = [[0, 0.03, 0.62], [-0.024, 0.026, 0.4], [0.026, 0.024, 0.46], [0.004, 0.036, 0.3]];                  // inner yellow tongues, in front
  const flameO = many([[drop(0.06 * u, 0.18 * u), 0xff6a14]], FL.length, 0.9), flameY = many([[drop(0.06 * u, 0.18 * u), 0xffd840]], FY.length, 1.0), fy = y0 + 0.05 * u;
  row.add(moonGlow, plates, symbols, pit.group, oak.group, flameO, flameY, frame, pointer, day); row.position.set(cx, cy, 0);
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
      // flames flicker: each tongue stretches and sways on its own beat (only while the card is showing)
      const fl = (list, m, o) => { list.forEach(([dx, dz, h], j) => { const w = t * (7 + j * 2.1) + j * 1.7 + o, st = on > 0.01 ? h * (1 + 0.16 * Math.sin(w) + 0.08 * Math.sin(w * 2.3 + 1)) : 0;
        m.set(j, X(1) + dx * u, fy, 0.05 * u + dz * u, st, 0.12 * Math.sin(w * 0.8)); }); m.commit(); };
      fl(FL, flameO, 0); fl(FY, flameY, 1.3);
    },
  };
}

export const SCENES = { 'weekday-wheel': weekdayWheel };
