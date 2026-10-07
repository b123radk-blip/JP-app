// Props kit: more things for scenes (Step 2b batches). Like kit-things.js, each is built to a size `u` (usually the glyph
// height) and its origin is noted. Draw calls: 1 per mesh; groups note theirs as `.drawCalls`.
//   emblemProp(type, size)  any emblem shape (emblems.js: cup, car, bird, umbrella ...) as a prop, with its idle animation
//   textPlane(text)         flat text (a number on a calendar page, chalk on a board)
import * as THREE from 'three';
import { G } from './shape-kit.js';
import { solidProp, kitMaterial } from './kit-rig.js';
import { SHAPES } from './emblems.js';
import { PIECES } from '../catalog.js';
import { TEXT } from '../../config.js';

// An emblem as a prop: built about `size` metres tall; prop.idle(s) plays its own idle animation (s seconds).
export function emblemProp(type, size, opts = {}) {
  const spec = { ...PIECES.emblem[type].opts, ...opts, type };
  const mat = new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.1 });
  const shape = SHAPES[type](spec, mat), outer = new THREE.Group(), inner = new THREE.Group();
  inner.add(...shape.meshes); outer.add(inner); outer.scale.setScalar(size);
  return Object.assign(outer, {
    drawCalls: PIECES.emblem[type].cost(spec).drawCalls,
    idle(s) { inner.position.set(0, 0, 0); inner.rotation.set(0, 0, 0); inner.scale.setScalar(1); shape.idle(inner, s); },
  });
}

// Flat text on a plane `h` tall (width from the text, or `w` metres): colour, background (null = clear), weight.
export function textPlane(text, { h = 0.1, w: wm = null, color = '#ffffff', bg = null, weight = 700, pad = 0.15, size = 1 } = {}) {
  const px = 128, c = document.createElement('canvas'), g = c.getContext('2d'), font = `${weight} ${Math.round(px * size)}px "${TEXT.fontFamily}", sans-serif`;
  g.font = font; const w = wm ? Math.round(px * 1.3 * wm / h) : Math.ceil(g.measureText(text).width + px * pad * 2);
  c.width = w; c.height = Math.ceil(px * 1.3);
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
  g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * (w / c.height), h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  return m;
}
// a see-through veil (dusk falling over the scene): origin at its middle, opacity 0 to start
export function veil(w, h, color = 0x050818) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
}

// ---- home and kitchen ----
// cardboard box: origin at the middle of its bottom; .flaps[0/1] hinge open (rotation.z), 3 draw calls
export function cardBox(u, { w = 0.5, h = 0.38, color = 0xc89a60 } = {}) {
  const k = (x) => x * u, g = new THREE.Group(), body = solidProp([[G.box(k(w), k(h), k(w * 0.8), 0, k(h / 2), 0), color], [G.box(k(w * 0.6), k(0.03), k(0.002), 0, k(h * 0.7), k(w * 0.4)), 0xa07840]]);
  const flap = (s) => { const p = new THREE.Group(), m = solidProp([[G.box(k(w / 2), k(0.012), k(w * 0.8), s * k(w / 4), 0, 0), 0xd8aa70]]); p.position.set(s * k(w / 2), k(h), 0); m.position.x = -s * k(w / 2); p.add(m); return p; };
  const flaps = [flap(-1), flap(1)];
  g.add(body, ...flaps);
  return Object.assign(g, { flaps, drawCalls: 3 });
}
// teapot: origin at the middle of its bottom, spout to -x (pour by turning it: rotation.z > 0 tips the spout down)
export function teapot(u, { color = 0x3a7a5a } = {}) {
  const k = (x) => x * u;
  return solidProp([[G.sphere(k(0.16), 0, k(0.14), 0, 1.15, 0.85, 1.15), color], [G.cyl(k(0.06), k(0.03), k(0.18), -k(0.2), k(0.17), 0, 0, 0, 0.95), color],
    [G.torus(k(0.075), k(0.018), Math.PI * 1.2, k(0.19), k(0.15), 0, -Math.PI * 0.6), 0x2a5a40], [G.cyl(k(0.07), k(0.08), k(0.03), 0, k(0.27)), 0x2a5a40], [G.sphere(k(0.025), 0, k(0.3)), 0xe8d8a0]]);
}
// cup (teacup): origin at the middle of its bottom
export const teacup = (u, { color = 0xf4efe6, band = 0x3a6ad0 } = {}) => { const k = (x) => x * u; return solidProp([[G.cyl(k(0.1), k(0.075), k(0.13), 0, k(0.065), 0, 0, 0, 0, 24), color], [G.torus(k(0.1), k(0.008)).rotateX(Math.PI / 2).translate(0, k(0.12), 0), band]]); };
// a flat disc of liquid (the level inside a cup or a bowl of rice: scale y to fill); origin at its middle
export const disc = (u, r, color) => solidProp([[G.cyl(r * u, r * u, 0.01 * u, 0, 0, 0, 0, 0, 0, 24), color]], 0.5);
// bowl: origin at the middle of its bottom
export function bowl(u, { color = 0x2a4a90, inner = 0xf4f0e8 } = {}) {
  const k = (x) => x * u, pts = [[0, 0], [k(0.07), 0], [k(0.075), k(0.02)], [k(0.16), k(0.08)], [k(0.2), k(0.15)]].map(([x, y]) => new THREE.Vector2(x, y));
  return solidProp([[new THREE.LatheGeometry(pts, 32), color], [G.torus(k(0.2), k(0.012)).rotateX(Math.PI / 2).translate(0, k(0.15), 0), inner]]);
}
// chopsticks: origin at the tips, pointing along -y from the top
export const chopsticks = (u, { color = 0x8a3a20 } = {}) => { const k = (x) => x * u; return solidProp([[G.cyl(k(0.012), k(0.006), k(0.42), -k(0.012), k(0.21), 0, 0, 0, 0.03), color], [G.cyl(k(0.012), k(0.006), k(0.42), k(0.012), k(0.21), 0, 0, 0, -0.03), color]]); };
// cleaver: origin at the middle of the blade's edge, blade up (+y) to the spine, handle to +x
export const cleaver = (u) => { const k = (x) => x * u; return solidProp([[G.box(k(0.42), k(0.2), k(0.015), 0, k(0.1), 0), 0xd8dde6], [G.box(k(0.42), k(0.025), k(0.02), 0, k(0.19), 0), 0x9aa4b4], [G.cyl(k(0.03), k(0.03), k(0.22), k(0.31), k(0.15), 0, 0, 0, Math.PI / 2), 0x5a3a20]], 0.3); };
// apple: origin at the centre; body only (colour it with .material.color); stem and leaf are apple.top (a second mesh)
export function apple(u, { r = 0.11 } = {}) {
  const k = (x) => x * u, body = solidProp([[G.sphere(k(r), 0, 0, 0, 1.05, 0.95, 1.05), 0xffffff]], 0.35);
  const top = solidProp([[G.cyl(k(0.008), k(0.01), k(0.06), 0, k(r * 0.95), 0, 0, 0, 0.2), 0x5a3a20], [G.sphere(k(0.035), k(0.04), k(r * 1.05), 0, 1.6, 0.5, 0.8), 0x4aa040]]);
  const g = new THREE.Group(); g.add(body, top);
  return Object.assign(g, { body, drawCalls: 2 });
}
// sponge: origin at its centre
export const sponge = (u) => { const k = (x) => x * u; return solidProp([[G.box(k(0.2), k(0.08), k(0.12), 0, k(0.04), 0), 0x40b060], [G.box(k(0.2), k(0.08), k(0.12), 0, -k(0.04), 0), 0xffd040]]); };
// bucket: origin at the middle of its bottom
export const bucket = (u, { color = 0x4a8ae0 } = {}) => { const k = (x) => x * u; return solidProp([[G.cyl(k(0.15), k(0.11), k(0.22), 0, k(0.11), 0, 0, 0, 0, 20), color], [G.torus(k(0.14), k(0.008), Math.PI, 0, k(0.22), 0), 0x9aa4b4], [G.cyl(k(0.135), k(0.135), k(0.01), 0, k(0.2)), 0x6ac0ff]]); };
// ---- signs and things to aim at ----
// target board on a stand: origin at the middle of the board's face
export const target = (u) => { const k = (x) => x * u; return solidProp([[G.cyl(k(0.24), k(0.24), k(0.04), 0, 0, -k(0.02), Math.PI / 2), 0xf4f0e8], [G.cyl(k(0.18), k(0.18), k(0.042), 0, 0, -k(0.02), Math.PI / 2), 0xe03838], [G.cyl(k(0.12), k(0.12), k(0.044), 0, 0, -k(0.02), Math.PI / 2), 0xf4f0e8], [G.cyl(k(0.06), k(0.06), k(0.046), 0, 0, -k(0.02), Math.PI / 2), 0xe03838], [G.cyl(k(0.02), k(0.02), k(0.5), 0, -k(0.4), -k(0.05)), 0x6a4a2a]]); };
// dart: origin at its tip, pointing -x
export const dart = (u) => { const k = (x) => x * u; return solidProp([[G.cone(k(0.012), k(0.05), -k(0.02), 0, 0, Math.PI / 2), 0xb8c0cc], [G.cyl(k(0.016), k(0.016), k(0.14), k(0.08), 0, 0, 0, 0, Math.PI / 2), 0x3060d0], [G.box(k(0.07), k(0.06), k(0.004), k(0.16), 0, 0), 0xffd040], [G.box(k(0.07), k(0.004), k(0.06), k(0.16), 0, 0), 0xffd040]]); };
// map pin: origin at its point, standing up
export const pin = (u, { color = 0xe03838 } = {}) => { const k = (x) => x * u; return solidProp([[G.cone(k(0.05), k(0.16), 0, k(0.08), 0, Math.PI), color], [G.sphere(k(0.09), 0, k(0.2)), color], [G.sphere(k(0.035), 0, k(0.2), k(0.06)), 0xffffff]], 0.45); };
// signpost: origin at the foot of the pole; .arm turns (rotation.y), 2 draw calls
export function signpost(u) {
  const k = (x) => x * u, g = new THREE.Group(), arm = new THREE.Group();
  const pole = solidProp([[G.cyl(k(0.025), k(0.03), k(0.75), 0, k(0.375)), 0x7a5a3a]]);
  const sh = new THREE.Shape(); [[0, -0.6], [3.2, -0.6], [4, 0], [3.2, 0.6], [0, 0.6]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));   // built at 10x, scaled (the extrude bevel is sized for unit shapes)
  const board = solidProp([[G.extrude(sh, 0.3).scale(k(0.1), k(0.1), k(0.1)), 0xf0d080]]);
  arm.position.y = k(0.66); arm.add(board); g.add(pole, arm);
  return Object.assign(g, { arm, drawCalls: 2 });
}
// eraser in a hand-sized block: origin at its rubbing face (bottom)
export const eraser = (u) => { const k = (x) => x * u; return solidProp([[G.box(k(0.16), k(0.07), k(0.08), 0, k(0.035), 0), 0xf8a0b0], [G.box(k(0.16), k(0.06), k(0.085), 0, k(0.1), 0), 0x3a6ad0]]); };
// clipboard with three lines and three tick boxes (a to-do list): origin at its centre, facing +z
export function clipboard(u) {
  const k = (x) => x * u, list = [[G.box(k(0.34), k(0.44), k(0.02), 0, 0, 0), 0x8a5a30], [G.box(k(0.29), k(0.38), k(0.006), 0, -k(0.01), k(0.012)), 0xfaf6ee], [G.box(k(0.12), k(0.04), k(0.03), 0, k(0.21), k(0.012)), 0xb8c0cc]];
  for (let i = 0; i < 3; i++) list.push([G.box(k(0.05), k(0.05), k(0.004), -k(0.09), k(0.1 - i * 0.11), k(0.017)), 0x9aa4b4], [G.box(k(0.13), k(0.014), k(0.004), k(0.04), k(0.1 - i * 0.11), k(0.017)), 0x8a8f9a]);
  return solidProp(list);
}
// a tick mark (for a box on the clipboard): origin at its middle
export const tick = (u, { color = 0x30b050 } = {}) => { const k = (x) => x * u; return solidProp([[G.poly([[-k(0.03), 0], [-k(0.005), -k(0.025)], [k(0.035), k(0.03)]], k(0.008)), color]], 0.6); };
// hat (a round sun hat): origin at the middle of its brim
export const hat = (u, { color = 0xf0d070, band = 0xd04040 } = {}) => { const k = (x) => x * u; return solidProp([[G.cyl(k(0.17), k(0.17), k(0.012), 0, 0), color], [G.sphere(k(0.09), 0, k(0.01), 0, 1, 0.8, 1), color], [G.cyl(k(0.092), k(0.092), k(0.025), 0, k(0.02)), band]]); };
// wheel: origin at its hub, facing +z
export const wheel = (u, { r = 0.08 } = {}) => { const k = (x) => x * u; return solidProp([[G.torus(k(r), k(r * 0.32)), 0x202428], [G.cyl(k(r * 0.45), k(r * 0.45), k(r * 0.5), 0, 0, 0, Math.PI / 2), 0xc8ccd4], [G.box(k(r * 1.4), k(r * 0.15), k(r * 0.3), 0, 0, 0), 0xc8ccd4]]); };
// big leaf: origin at its stem's end, pointing +y
export function bigLeaf(u, { color = 0x48b040 } = {}) {
  const k = (x) => x * u, s = new THREE.Shape();                  // built 10x and scaled (the extrude bevel is sized for unit shapes)
  s.moveTo(0, 0); s.bezierCurveTo(1.6, 0.8, 1.4, 3, 0, 4); s.bezierCurveTo(-1.4, 3, -1.6, 0.8, 0, 0);
  return solidProp([[G.extrude(s, 0.12).scale(k(0.1), k(0.1), k(0.1)), color], [G.cyl(k(0.006), k(0.006), k(0.36), 0, k(0.2), k(0.012)), 0x2a7a20], [G.cyl(k(0.008), k(0.008), k(0.08), 0, -k(0.04)), 0x5a3a20]], 0.35);
}
// blackboard on legs: origin at the middle of the board, facing +z; `w` wide
export const blackboard = (u, { w = 0.9, h = 0.55 } = {}) => { const k = (x) => x * u; return solidProp([[G.box(k(w + 0.06), k(h + 0.06), k(0.03), 0, 0, -k(0.01)), 0x8a5a30], [G.box(k(w), k(h), k(0.02), 0, 0, 0), 0x1f4a32], [G.box(k(w * 0.9), k(0.03), k(0.05), 0, -k(h / 2 + 0.02), k(0.02)), 0x8a5a30], [G.cyl(k(0.02), k(0.02), k(0.5), -k(w * 0.4), -k(h / 2 + 0.25), -k(0.02)), 0x6a4a2a], [G.cyl(k(0.02), k(0.02), k(0.5), k(w * 0.4), -k(h / 2 + 0.25), -k(0.02)), 0x6a4a2a]]); };
// a stick (a pointer, a drumstick): origin at the hand end, along +y
export const stick = (u, { len = 0.4, color = 0xc89a60, tip = 0xf4f0e8 } = {}) => { const k = (x) => x * u; return solidProp([[G.cyl(k(0.012), k(0.016), k(len), 0, k(len / 2)), color], [G.sphere(k(0.025), 0, k(len)), tip]]); };
// calendar pad: origin at the middle of its face; pages are text planes added by the scene
export const calendarPad = (u) => { const k = (x) => x * u; return solidProp([[G.box(k(0.4), k(0.42), k(0.06), 0, -k(0.03), -k(0.035)), 0xf4f0e8], [G.box(k(0.4), k(0.1), k(0.07), 0, k(0.2), -k(0.03)), 0xd83838], [G.cyl(k(0.012), k(0.012), k(0.08), -k(0.1), k(0.25), 0), 0x404040], [G.cyl(k(0.012), k(0.012), k(0.08), k(0.1), k(0.25), 0), 0x404040]]); };
export { kitMaterial };
