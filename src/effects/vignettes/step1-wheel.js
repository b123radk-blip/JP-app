// Step 1 scene 曜 (split out of step1-g.js):
//   weekday-wheel  曜: a prize wheel on a stand beside the kanji, its seven segments the days of the week, each with its
//                  kanji at the rim (月火水木金土日, 土 blue, 日 red) and its symbol (moon, fire, water, tree, gold, soil,
//                  sun); it spins and slows until the pointer stops on one day, which glows, and that day's name pops up
//                  beside it (水曜日); each loop lands on another day
import * as THREE from 'three';
import { acts, bump, wobble } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow, DAYS } from './step1-kit.js';
import { TEXT } from '../../config.js';

const SEG = ['#3a4466', '#4a5478', '#3a4466', '#4a5478', '#3a4466', '#2c58b0', '#c03848'];
// the wheel's face: seven coloured segments with each day's kanji upright toward the rim (one canvas, one draw call)
function face(R) {
  const c = document.createElement('canvas'), n = 512, m = n / 2, g = c.getContext('2d'); c.width = c.height = n;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI / 2 - (i / 7) * Math.PI * 2;      // the segment's middle (maths angle, y up)
    g.fillStyle = SEG[i]; g.beginPath(); g.moveTo(m, m); g.arc(m, m, m, -a - Math.PI / 7, -a + Math.PI / 7); g.closePath(); g.fill();
    g.save(); g.translate(m + Math.cos(a) * m * 0.76, m - Math.sin(a) * m * 0.76); g.rotate(Math.PI / 2 - a);
    g.fillStyle = '#ffffff'; g.font = `900 ${Math.round(n * 0.15)}px "${TEXT.fontFamily}", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(DAYS[i], 0, 0); g.restore();
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.CircleGeometry(R, 56), new THREE.MeshBasicMaterial({ map: tex }));
}

// the name of the day it stopped on (月曜日 ...): a sign in the app's font that redraws only when the day changes
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
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = B.cy + 0.08 * u, R = 0.42 * u, r = 0.42 * R, d = 0.06 * u;
  const sym = (i) => { const a = Math.PI / 2 - (i / 7) * Math.PI * 2, x = Math.cos(a) * r, y = Math.sin(a) * r, z = d / 2 + 0.02 * u, k = u;
    return [
      [[G.torus(0.06 * k, 0.022 * k, Math.PI * 1.1, x, y, z, 1.4), 0xfff0b0]],                                      // 月 moon
      [[G.cone(0.05 * k, 0.13 * k, x, y, z), 0xff6a20], [G.cone(0.025 * k, 0.07 * k, x, y - 0.02 * k, z + 0.02 * k), 0xffe040]],   // 火 fire
      [[G.sphere(0.045 * k, x, y - 0.015 * k, z), 0x3aa0ff], [G.cone(0.044 * k, 0.07 * k, x, y + 0.03 * k, z), 0x3aa0ff]],          // 水 water
      [[G.cyl(0.012 * k, 0.012 * k, 0.07 * k, x, y - 0.04 * k, z), 0x7a4a24], [G.sphere(0.05 * k, x, y + 0.02 * k, z), 0x3aa040]],  // 木 tree
      [[G.cyl(0.05 * k, 0.05 * k, 0.02 * k, x, y, z, Math.PI / 2), 0xffc030]],                                        // 金 gold
      [[G.sphere(0.06 * k, x, y - 0.02 * k, z, 1, 0.6, 0.6), 0x8a5a30]],                                              // 土 soil
      [[G.sphere(0.055 * k, x, y, z), 0xffa020]],                                                                    // 日 sun
    ][i]; };
  // the wheel: a thick disc with a silver rim, pegs between the segments and a hub; the face (kanji) on its front
  const wheel = new THREE.Group(), body = solidProp([[G.cyl(R, R, d, 0, 0, 0, Math.PI / 2, 0, 0, 42), 0x2a3048], [G.torus(R, 0.022 * u), 0xc8ccd4],
    ...Array.from({ length: 7 }, (_, i) => { const a = Math.PI / 2 - (i + 0.5) / 7 * Math.PI * 2; return [G.cyl(0.012 * u, 0.012 * u, 0.06 * u, Math.cos(a) * R, Math.sin(a) * R, d / 2 + 0.02 * u, Math.PI / 2), 0xf0f0f4]; }),
    [G.cyl(0.05 * u, 0.05 * u, 0.03 * u, 0, 0, d / 2 + 0.015 * u, Math.PI / 2), 0xc8ccd4], ...Array.from({ length: 7 }, (_, i) => sym(i)).flat()], 0.6);
  const disc = face(R * 0.97); disc.position.z = d / 2 + 0.002 * u;
  wheel.add(body, disc);
  // the stand: a post from the floor to the hub behind the wheel, on two feet
  const ph = cy - floor;
  const stand = solidProp([[G.box(0.06 * u, ph, 0.06 * u, 0, ph / 2, -d / 2 - 0.04 * u), 0x8a6a48], [G.box(0.5 * u, 0.04 * u, 0.1 * u, 0, 0.02 * u, -d / 2 - 0.04 * u), 0x6a4a30], [G.box(0.08 * u, 0.04 * u, 0.36 * u, 0, 0.02 * u, -d / 2 - 0.04 * u), 0x6a4a30]], 0.35);
  const pointer = solidProp([[G.cone(0.06 * u, 0.13 * u, 0, 0, 0, Math.PI), 0xe83a3a]], 0.8), ring = solidProp([[G.torus(0.1 * u, 0.014 * u), 0xffe060]], 1.4);
  const day = dayName(u);
  wheel.position.set(cx, cy, 0); stand.position.set(cx, floor, 0); pointer.position.set(cx, cy + R + 0.05 * u, d / 2 + 0.03 * u);
  group.add(stand, wheel, pointer, ring, day);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, n = A.n < 0 ? 0 : A.n % 7;
      // spin 0..3 s easing out to land day `stop` under the pointer
      const stop = (n * 3) % 7, f = pre ? 0 : 1 - Math.pow(1 - between(v, 0.2, 3.2), 3), turns = 2 + stop / 7;
      wheel.rotation.z = (pre ? 0 : f * turns * Math.PI * 2) + 0.03 * wobble(v, 3.2, 0.5, 5);
      const k = pre ? 0 : between(v, 3.2, 3.5) * (1 - between(v, 5.0, 5.4));
      ring.visible = k > 0.01; ring.scale.setScalar(grow(k) * (1.25 + 0.1 * Math.sin(t * 6))); ring.position.set(cx, cy + 0.6 * R, d / 2 + 0.06 * u);   // round the day's kanji and symbol
      pointer.position.y = cy + R + 0.05 * u + 0.02 * u * bump(v, 3.2, 0.3);
      // the day it stopped on, by name, beside the pointer
      day.set(stop); day.visible = k > 0.01; day.scale.setScalar(grow(k)); day.position.set(cx + 0.55 * u, cy + R + 0.12 * u, 0.04 * u);
    },
  };
}

export const SCENES = { 'weekday-wheel': weekdayWheel };
