// Motion pieces: how the kanji (or one of its parts) moves once its strokes are drawn. Each eases in over EFFECTS.idleRamp
// seconds after the last stroke, so the strokes are always drawn in place. A motion acts on a pivot group (compose.js puts
// the pivot at the base for rocking / leaning, at the centre otherwise); `index` staggers repeated parts (the two 木 of 林).
import { EFFECTS } from '../../config.js';
import { smooth } from './util.js';

// How much wider than at rest a whole-glyph motion makes the kanji or word (the emblem keeps clear of it).
export const widthScale = (s) => (s.type === 'grow' ? s.to + 0.02 : s.type === 'stretch' && s.axis === 'x' ? s.to : s.type === 'pulse' ? 1 + s.amp : 1);
export const PIVOT = { sway: (s) => (s.axis === 'z' ? 'base' : 'center'), lean: () => 'base', tilt: () => 'base', grow: () => 'base', shrink: () => 'base', stretch: () => 'base', wave: () => 'base', wag: () => 'base', walk: () => 'base',
  sink: () => 'base', stand: () => 'base', bow: () => 'base', hang: () => 'top', slide: () => 'base' };
const DIRS = { up: [0, 1, 0], down: [0, -1, 0], left: [-1, 0, 0], right: [1, 0, 0], toward: [0, 0, 1], away: [0, 0, -1] };
const cycle = (idle, every) => idle % every;
const held = (x) => Math.tanh(3 * Math.sin(x)) / Math.tanh(3);          // a sine that holds near its peaks

const MOTIONS = {
  none: () => () => {},
  sway: (s, o, k) => (idle, r) => { o.rotation[s.axis] = s.amp * Math.sin(idle * s.speed + s.phase + k * 1.9) * r; o.position.y = o.userData.base.y + s.bob * Math.sin(idle * 1.1) * r; },
  float: (s, o, k) => (idle, r) => { o.position.y = o.userData.base.y + s.amp * Math.sin(idle * s.speed + k) * r; },
  pulse: (s, o, k) => (idle, r) => { o.scale.setScalar(1 + s.amp * Math.sin(idle * s.speed + k) * r); },
  drift: (s, o, k) => { const d = DIRS[s.dir] || DIRS.up; return (idle, r) => {
    const f = s.dist * smooth(idle / s.dur), b = s.bob * Math.sin(idle * 1.3 + k) * r, B = o.userData.base;
    o.position.set(B.x + d[0] * f, B.y + d[1] * f + b, B.z + d[2] * f); }; },
  lean: (s, o) => (idle, r) => { o.rotation.z = (s.toward === 'left' ? 1 : -1) * (s.angle * smooth(idle / s.dur) + 0.015 * Math.sin(idle * 1.2) * r); },
  tilt: (s, o, k) => (idle, r) => { o.rotation.z = s.angle * held((idle * Math.PI) / s.every + k) * r; },
  grow: (s, o) => (idle, r) => { o.scale.setScalar(1 + (s.to - 1) * smooth(idle / s.dur) + 0.02 * Math.sin(idle * 1.5) * r); },
  shrink: (s, o) => (idle, r) => { o.scale.setScalar(1 + (s.to - 1) * smooth(idle / s.dur) + 0.015 * Math.sin(idle * 1.5) * r); },
  stretch: (s, o) => (idle) => { const k = 1 + (s.to - 1) * smooth(idle / s.dur); o.scale.set(s.axis === 'x' ? k : 1, s.axis === 'x' ? 1 : k, 1); },
  spin: (s, o) => (idle) => { const u = (idle % s.every) / s.dur; o.rotation.y = u < 1 ? Math.PI * 2 * smooth(u) : 0; },        // one full turn now and then (readable most of the time)
  bounce: (s, o, k) => (idle, r) => { o.position.y = o.userData.base.y + s.height * Math.abs(Math.sin(idle * s.speed + k)) * r; },
  shake: (s, o) => (idle, r) => { const u = idle % s.every; o.position.x = o.userData.base.x + (u < 0.5 ? s.amp * Math.sin(idle * 60) * (1 - u / 0.5) : 0) * r; },
  wave: (s, o, k) => (idle, r) => { o.rotation.z = s.amp * Math.sin(idle * s.speed + k) * r; },
  wag: (s, o, k) => (idle, r) => { o.rotation.z = s.amp * Math.sin(idle * s.speed + k) * r * (0.6 + 0.4 * Math.sin(idle * 0.7)); },
  walk: (s, o, k) => (idle, r) => { const ph = idle * s.speed + k; o.position.y = o.userData.base.y + s.step * Math.abs(Math.sin(ph)) * r; o.rotation.z = 0.05 * Math.sin(ph) * r; o.position.x = o.userData.base.x + s.dist * Math.sin(idle * 0.5) * r; },
  blink: (s, o) => (idle) => { const u = idle % s.every; o.scale.y = u < 0.25 ? 1 - 0.85 * Math.sin(Math.PI * u / 0.25) : 1; },
  swim: (s, o, k) => (idle, r) => { o.position.x = o.userData.base.x + s.amp * Math.sin(idle * s.speed + k) * r; o.rotation.z = 0.12 * Math.cos(idle * s.speed + k) * r; o.rotation.y = 0.25 * Math.sin(idle * s.speed * 2) * r; },
  fly: (s, o, k) => (idle, r) => { const B = o.userData.base, up = s.height * (0.5 - 0.5 * Math.cos(idle * 0.9)) * r; o.position.set(B.x + 0.012 * Math.sin(idle * 0.45) * r, B.y + up + 0.004 * Math.sin(idle * 9) * r, B.z); o.rotation.z = 0.1 * Math.sin(idle * 0.9 + k) * r; },
  sink: (s, o) => (idle, r) => { const u = cycle(idle, s.every), d = u < 0.18 ? smooth(u / 0.18) : 1 - smooth((u - 0.5) / 1.4); o.position.y = o.userData.base.y - s.depth * d * r; o.scale.set(1 + 0.06 * d * r, 1 - 0.12 * d * r, 1); },
  roll: (s, o) => (idle) => { const u = cycle(idle, s.every) / s.dur; o.rotation.z = u < 1 ? -Math.PI * 2 * smooth(u) : 0; o.position.x = o.userData.base.x + (u < 1 ? s.dist * Math.sin(Math.PI * u) : 0); },
  stand: (s, o) => (idle) => { const u = cycle(idle + s.every - 0.8, s.every), down = smooth(u / 0.5) * (1 - smooth((u - 1.1) / 0.35)); const over = u > 1.45 && u < 1.9 ? -0.12 * Math.sin(Math.PI * (u - 1.45) / 0.45) : 0; o.rotation.x = -1.25 * down + over; },
  bow: (s, o) => (idle) => { const u = cycle(idle, s.every), d = smooth(u / 0.6) * (1 - smooth((u - 1.1) / 0.6)); o.rotation.x = s.angle * d; },
  hang: (s, o, k) => (idle, r) => { o.rotation.z = s.amp * Math.sin(idle * s.speed + k) * (0.4 + 0.6 * r); },
  turn: (s, o) => (idle) => { const u = cycle(idle + s.every - 0.6, s.every), away = smooth(u / 0.5) * (1 - smooth((u - 1.0) / 0.7)); o.rotation.y = 1.25 * away; },
  flip: (s, o) => (idle) => { const u = cycle(idle, s.every); o.rotation.y = Math.PI * (smooth(u / 0.6) + smooth((u - 1.4) / 0.6)); },
  shove: (s, o) => { const d = DIRS[s.dir] || DIRS.right; return (idle) => { const u = cycle(idle, s.every), f = s.dist * (u < 0.15 ? smooth(u / 0.15) : 1 - smooth((u - 0.4) / 1.2)), B = o.userData.base; o.position.set(B.x + d[0] * f, B.y + d[1] * f, B.z + d[2] * f); o.rotation.z = -d[0] * 0.08 * (u < 0.15 ? smooth(u / 0.15) : 1 - smooth((u - 0.15) / 0.3)); }; },
  vanish: (s, o) => (idle) => { const u = cycle(idle + s.every - 1.4, s.every), k = 1 - smooth(u / 0.8) + smooth((u - 1.5) / 0.4) * (1 + 0.15 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 1.5) / 0.6)))); o.scale.setScalar(Math.max(1e-3, k)); },
  slide: (s, o, k) => (idle, r) => { const v = Math.cos(idle * s.speed + k); o.position.x = o.userData.base.x + s.dist * Math.sin(idle * s.speed + k) * r; o.rotation.z = -0.06 * v * r; },
  count: (s, o) => (idle) => {
    const cyc = s.n * s.every + s.rest, c = idle % cyc; let b = 0;
    for (let i = 0; i < s.n; i++) { const x = (c - i * s.every) / 0.35; if (x > 0 && x < 1) b = Math.max(b, Math.sin(Math.PI * x)); }
    o.scale.setScalar(1 + s.amp * b);
  },
};

// target: the pivot group to move; index: which repeat of a part this is.
export function create(ctx, spec, target, index = 0) {
  target.userData.base = target.position.clone();
  const fn = (MOTIONS[spec.type] || MOTIONS.none)(spec, target, index);
  return { step() { fn(ctx.idle, smooth(ctx.idle / EFFECTS.idleRamp)); } };
}
