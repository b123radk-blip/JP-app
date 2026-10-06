// Small shared helpers for effect pieces: easing, seeded random numbers, soft textures.
import * as THREE from 'three';

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const invSmooth = (y) => 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(y)) / 3);   // inverse of smooth()
export const lerp = (a, b, t) => a + (b - a) * t;
export const mulberry32 = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
// pop-in scale with a little overshoot (ease-out-back): 0 before x = 0, 1 from x = dur on
export const pop = (x, dur) => { const u = clamp01(x / dur); if (u <= 0) return 0; const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

// A white radial gradient (centre alpha 1, `mid` alpha at `at`, edge 0), tinted by the material colour.
export function radialTexture(at = 0.4, mid = 0.35) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(at, `rgba(255,255,255,${mid})`); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
// A soft vertical beam (bright at the bottom, fading up and to both sides): sun rays, light shafts.
export function beamTexture() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 256;
  const g = c.getContext('2d'), v = g.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,.9)'); v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v; g.fillRect(0, 0, 32, 256);
  g.globalCompositeOperation = 'destination-in';
  const h = g.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = h; g.fillRect(0, 0, 32, 256);
  return new THREE.CanvasTexture(c);
}
