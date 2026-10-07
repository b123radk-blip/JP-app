// Small helpers shared by the scene modules.
import * as THREE from 'three';
import { clamp01 } from '../pieces/util.js';

// moves the kanji: shift (dx, dy) and turn by a about the point (px, py) of the kanji (a corner) instead of its middle
export function poseGlyph(stage, dx, dy, a = 0, px = 0, py = 0, scale = 1) {
  const g = stage.glyph, B = g.userData.base, c = Math.cos(a), s = Math.sin(a);
  const ox = px - B.x, oy = py - B.y;                                   // the pivot point, from the glyph pivot
  g.rotation.z = a; g.scale.setScalar(scale);
  g.position.set(B.x + dx + ox - scale * (c * ox - s * oy), B.y + dy + oy - scale * (s * ox + c * oy), B.z);
}
// n dust puffs in a fan around (x, y), from slot i0 of a many(); f 0..1: born, spread, gone
export function puffs(d, i0, n, x, y, f, u, spread = 0.25) {
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI - Math.PI / 2 + 0.3, r = spread * u * f; d.set(i0 + i, x + Math.sin(a) * r, y + 0.04 * u + Math.abs(Math.cos(a)) * r * 0.4, 0.05 * u, f > 0 && f < 1 ? 1.2 * Math.sin(Math.PI * f) : 0); }
}
// rising wisps (steam, smoke) from (x, y): n slots from i0 of a many(), looping every `period` seconds
export function wisps(d, i0, n, x, y, t, u, { period = 1.6, rise = 0.5, sway = 0.06, size = 1, on = 1 } = {}) {
  for (let i = 0; i < n; i++) { const f = ((t / period + i / n) % 1 + 1) % 1; d.set(i0 + i, x + sway * u * Math.sin(f * 7 + i * 2), y + rise * u * f, 0.02 * u, on * size * Math.sin(Math.PI * f) * (0.6 + 0.6 * f)); }
}
// a point along a throw from a to b (arc height h), f 0..1
export const arc = (a, b, h, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + h * 4 * f * (1 - f)];
// where to put a hand's group so that its grip (hand.grip, or another object on the hand) lands on (x, y, z) of the group's
// parent, at the hand's current turn, scale and pose
const v = new THREE.Vector3(), m4 = new THREE.Matrix4();
export function handTo(hand, x, y, z = 0, at = hand.grip) {
  const g = hand.group;
  g.updateMatrixWorld(true);
  m4.identity(); for (let o = at; o !== g; o = o.parent) m4.premultiply(o.matrix);
  v.setFromMatrixPosition(m4).multiply(g.scale).applyQuaternion(g.quaternion);
  g.position.set(x - v.x, y - v.y, z - v.z);
}
export const between = (v0, a, b) => clamp01((v0 - a) / (b - a));
// colour a straight blend between two hex colours into a THREE.Color
export const mixColor = (out, a, b, f) => out.setHex(a).lerp(new THREE.Color(b), clamp01(f));
// a point on a person's (or hand's) bone in the scene group's space (where a held ball is, where a head is)
export function bonePoint(actor, name, y = 0.5, out = new THREE.Vector3()) {
  actor.rig.pointOn(name, y, out); actor.group.updateMatrix(); return out.applyMatrix4(actor.group.matrix);
}
// a sign whose text can change (a queue number): draws again only when the text changes
export function liveText(u, { h = 0.2, w = 0.3, color = '#ffe060', bg = '#202428' } = {}) {
  const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w);
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * u, h * u), new THREE.MeshBasicMaterial({ map: tex }));
  let shown = null;
  mesh.set = (text) => {
    if (text === shown) return; shown = text;
    g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(c.height * 0.8)}px sans-serif`; g.fillText(text, c.width / 2, c.height * 0.54); tex.needsUpdate = true;
  };
  return mesh;
}
