// Default effect for any kanji without its own: strokes draw in, glow, then sway gently. Cheap on purpose.
import * as THREE from 'three';
import { normalizeStrokes, strokeSchedule } from '../kanji/tube.js';
import { createGlowGlyph, PALETTES } from './glow-glyph.js';
import { disposeObject } from '../core/dispose.js';

const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

export function create({ kanji, glyphHeight }) {
  const group = new THREE.Group();
  const { S, strokes } = normalizeStrokes(kanji, glyphHeight);
  const sched = strokeSchedule(strokes, { start: 0.4 });
  const glyph = createGlowGlyph(strokes, S, PALETTES.cyan);
  const key = new THREE.PointLight(0xffffff, 0, 8, 2); key.position.set(-0.7, 0.6, 0.9);
  const rim = new THREE.PointLight(0x58d8ff, 0, 6, 1.5); rim.position.set(0, 0.15, -0.5);
  group.add(glyph.group, key, rim, new THREE.HemisphereLight(0xeaf6ff, 0x405060, 1.0));

  function applyTime(t) {
    sched.items.forEach((it, i) => glyph.setStrokeProgress(i, smooth((t - it.start) / it.dur)));
    const on = smooth(t / 1.0), idle = Math.max(0, t - sched.end), pulse = Math.sin(idle * 1.6) * smooth(idle);
    key.intensity = 5 * on; rim.intensity = 2.5 * on;
    glyph.setLook({ emissive: 0.15 * on, glow: 1.3 * on * (1 + 0.18 * pulse) });
    glyph.group.rotation.y = 0.25 * Math.sin(idle * 0.7) * smooth(idle / 1.5);
  }
  applyTime(0);
  return { group, strokesEnd: sched.end, step: (t) => applyTime(t), reset: () => applyTime(0), setPassthrough() {}, dispose: () => disposeObject(group) };
}
