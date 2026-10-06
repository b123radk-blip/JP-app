// Particle kinds (how one particle moves and looks) and their emitters (where and how often they appear).
// A layer in a recipe ("particles": ["rain"]) = one kind + one emitter. Tip emitters (front, sparks, drops, dust) are used
// by the reveal at the drawing tip. All randomness comes from ctx.rnd (seeded), so a given time always looks the same.
import { PARTICLE_KINDS } from '../catalog.js';
import { physics } from './particles.js';
import { pointAt } from '../../kanji/tube.js';
import { lerp } from './util.js';
import * as THREE from 'three';

const rgb = (hex) => [(hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255];
const hump = (a) => Math.sin(Math.PI * a);                       // 0 -> 1 -> 0 over a life
const set = (o, [r, g, b], a, w, h = w, rot = 0) => { o.r = r; o.g = g; o.b = b; o.a = a; o.w = w; o.h = h; o.rot = rot; };
const F0 = [1.0, 0.92, 0.65], F1 = [1.0, 0.5, 0.1], F2 = [0.75, 0.12, 0.02], mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ---- kinds: { shape, move(P, i, a, t, dt), look(P, i, a, t, out) }. `c` = colour override from the recipe (or null) ----
const KINDS = {
  flames: () => ({ shape: 0, move: physics({ rise: 0.32, w: [0.12, 4, 20, 0] }),
    look: (P, i, a, t, o) => set(o, a < 0.35 ? mix3(F0, F1, a / 0.35) : mix3(F1, F2, (a - 0.35) / 0.65), (1 - a) * 0.46, P.size0[i] * (0.55 + Math.sin(Math.PI * Math.min(1, a * 0.9 + 0.05))) * (1 - 0.35 * a)) }),
  embers: () => ({ shape: 0, move: physics({ w: [0.08, 2.5, 30, 0, 0.06, 2.1, 17, Math.PI / 2] }),
    look: (P, i, a, t, o) => set(o, [1.0, 0.55, 0.15], (1 - a) * (0.65 + 0.35 * Math.sin(t * 12 + P.seed[i] * 40)), P.size0[i]) }),
  sparks: () => ({ shape: 0, move: physics({ rise: -0.5, dragY: false }), look: (P, i, a, t, o) => set(o, [1.0, 0.9, 0.6], (1 - a) * 1.2, P.size0[i]) }),
  drops: (c) => ({ shape: 1, move: physics({ rise: -0.9, drag: 0.3, dragY: false }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0x9fdcff), (1 - a) * 0.8, P.size0[i]) }),
  dust: (c) => ({ shape: 1, move: physics({ rise: -0.6, drag: 1.2 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xb8ab98), (1 - a) * 0.75, P.size0[i] * (1 - 0.4 * a)) }),
  bubbles: (c) => ({ shape: 2, move: physics({ rise: 0.05, w: [0.05, 3, 13, 0], drag: 0.8 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xbfeaff), 0.5 * hump(a), P.size0[i] * (0.8 + 0.4 * a)) }),
  rain: (c) => ({ shape: 3, move: physics({ drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xc8dcf0), 0.42 * Math.min(1, a * 8), P.size0[i] * 0.06, P.size0[i]) }),
  leaves: (c) => ({ shape: 4, move: physics({ w: [0.22, 1.6, 20, 0, 0.08, 1.1, 9, 0], drag: 1.0, dragY: false }),
    look: (P, i, a, t, o) => { const s = P.seed[i]; set(o, rgb(c ?? [0x6bbf4a, 0x9acd3a, 0x4f9a3a, 0xe0a030][Math.floor(s * 4)]), Math.min(1, a * 6, (1 - a) * 4) * 0.95, P.size0[i] * 0.55, P.size0[i], s * 6.3 + t * (s - 0.5) * 3); } }),
  mist: (c) => ({ shape: 5, move: physics({ drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xd0dae6), 0.11 * hump(a), P.size0[i] * (0.85 + 0.3 * a)) }),
  motes: (c) => ({ shape: 0, move: physics({ w: [0.01, 1.3, 11, 0], drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xffe2a0), 0.9 * hump(a) * (0.55 + 0.45 * Math.sin(t * 6 + P.seed[i] * 30)), P.size0[i]) }),
  snow: (c) => ({ shape: 1, move: physics({ w: [0.03, 1.3, 20, 0, 0.02, 0.9, 7, 0], drag: 0.5, dragY: false }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xf6faff), 0.9 * Math.min(1, a * 6, (1 - a) * 5), P.size0[i]) }),
  petals: (c) => ({ shape: 4, move: physics({ w: [0.2, 1.4, 20, 0, 0.08, 1.0, 9, 0], drag: 1.0, dragY: false }),
    look: (P, i, a, t, o) => { const s = P.seed[i]; set(o, rgb(c ?? [0xffc0d0, 0xff9ab8, 0xfff0f4][Math.floor(s * 3)]), Math.min(1, a * 6, (1 - a) * 4) * 0.95, P.size0[i] * 0.6, P.size0[i] * 0.8, s * 6.3 + t * (s - 0.5) * 4); } }),
  steam: (c) => ({ shape: 5, move: physics({ rise: 0.012, w: [0.02, 1.2, 9, 0], drag: 0.4 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xf0f0f0), 0.16 * Math.sin(Math.PI * a), P.size0[i] * (0.6 + 1.2 * a)) }),
  coins: (c) => ({ shape: 1, move: physics({ drag: 0, dragY: false }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xffc84a), Math.min(1, a * 8, (1 - a) * 5), P.size0[i], P.size0[i] * Math.abs(Math.cos(t * 5 + P.seed[i] * 9))) }),
  hearts: (c) => ({ shape: 6, move: physics({ w: [0.03, 1.5, 11, 0], drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xff6a8a), 0.85 * Math.sin(Math.PI * a), P.size0[i]) }),
  notes: (c) => ({ shape: 7, move: physics({ w: [0.04, 2, 13, 0], drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xffe08a), 0.9 * Math.sin(Math.PI * a), P.size0[i], P.size0[i], 0.3 * Math.sin(t * 3 + P.seed[i] * 6)) }),
  flow: (c, ctx) => {                                            // runs along stroke P.aux[i] from its start to its end, on the front surface
    const v = new THREE.Vector3();
    return { shape: 0, move(P, i, a) { const s = ctx.strokes[P.aux[i]]; pointAt(s.pts, a, v); const j = i * 3, sd = P.seed[i]; P.pos[j] = v.x + (sd - 0.5) * ctx.radius; P.pos[j + 1] = v.y + (sd * 7 % 1 - 0.5) * ctx.radius; P.pos[j + 2] = ctx.rz * 0.95; },
      look: (P, i, a, t, o) => set(o, rgb(c ?? 0xd8f4ff), 0.85 * hump(a), P.size0[i]) };
  },
};
Object.assign(KINDS, {
  sprouts: (c) => ({ shape: 4, move: physics({ rise: 0.02, drag: 2.0 }), look: (P, i, a, t, o) => { const s = P.seed[i]; set(o, rgb(c ?? [0x7ad04a, 0x9ae05a, 0x5ab83a][Math.floor(s * 3)]), Math.min(1, a * 5, (1 - a) * 3), P.size0[i] * Math.min(1, a * 4) * 0.6, P.size0[i] * Math.min(1, a * 4), (s - 0.5) * 1.6); } }),
  ink: (c) => ({ shape: 1, move: physics({ rise: -0.7, drag: 0.6, dragY: false }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0x15151e), (1 - a) * 0.9, P.size0[i] * (1 - 0.3 * a)) }),
  footprints: (c) => ({ shape: 8, move: () => {}, look: (P, i, a, t, o) => set(o, rgb(c ?? 0xf2e2c8), 0.85 * Math.min(1, a * 10) * Math.min(1, (1 - a) * 2.5), P.size0[i] * 0.62, P.size0[i], P.aux[i]) }),
  wind: (c) => ({ shape: 3, move: physics({ w: [0.04, 2.2, 13, 0], drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xf0f6ff), 0.4 * hump(a), P.size0[i] * 0.05, P.size0[i], Math.atan2(P.vel[i * 3 + 1], P.vel[i * 3]) - Math.PI / 2) }),
  kana: (c) => ({ shape: (P, i) => 9 + Math.floor(P.seed[i] * 16), move: physics({ w: [0.03, 1.4, 11, 0], drag: 0 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xfff2d8), 0.95 * Math.min(1, a * 5, (1 - a) * 3), P.size0[i], P.size0[i], 0.25 * Math.sin(t * 1.5 + P.seed[i] * 9)) }),
});
KINDS.front = KINDS.flames;
// the kana a "kana" layer floats (from the bundled Noto Sans JP, already loaded for the app's text)
const KANA = 'あいうえおかきくけこさしすせその';
let atlas = null;
function kanaAtlas() {
  if (atlas) return atlas;
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.font = '700 100px "NSJ", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  [...KANA].forEach((ch, i) => g.fillText(ch, (i % 4) * 128 + 64, Math.floor(i / 4) * 128 + 70));
  return (atlas = new THREE.CanvasTexture(c));
}

// ---- emitters ----
function accumulate() { let acc = 0; return { add(x) { acc += x; }, take() { if (acc >= 1) { acc--; return true; } return false; }, reset() { acc = 0; } }; }
function surfacePoint(ctx, s, i, spread) {
  const r = ctx.rnd, p = s.pts[i], a = r() * Math.PI * 2;
  return [p.x + Math.cos(a) * ctx.radius * spread * (0.4 + r()), p.y + Math.sin(a) * ctx.radius * 0.6 * r(), p.z + (r() - 0.5) * 2 * ctx.rz];
}
const box = (r, [x0, x1], [y0, y1], [z0, z1]) => [lerp(x0, x1, r()), lerp(y0, y1, r()), lerp(z0, z1, r())];

// Each emitter: (ctx, kindId, spawn, spec) -> step(t, dt). `spawn` = the pool's spawn; count scales the rate.
const EMIT = {
  flames: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    const burned = ctx.rv.burned; acc.add(burned * 1.0 * n * dt);
    while (acc.take()) { const g = ctx.rv.rings[Math.floor(r() * burned)], [x, y, z] = surfacePoint(ctx, ctx.strokes[g.si], g.i, 1);
      spawn(k, x, y, z, (r() - 0.5) * 0.04, 0.12 + r() * 0.16, (r() - 0.5) * 0.03, 0.9 + r() * 0.8, 0.04 + r() * 0.035, r()); } } }; },
  embers: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    const burned = ctx.rv.burned; acc.add(burned * 0.07 * n * dt);
    while (acc.take()) { const g = ctx.rv.rings[Math.floor(r() * burned)], [x, y, z] = surfacePoint(ctx, ctx.strokes[g.si], g.i, 1.5);
      spawn(k, x, y, z, (r() - 0.5) * 0.10, 0.06 + r() * 0.08, (r() - 0.5) * 0.06, 2.5 + r() * 2.0, 0.006 + r() * 0.004, r()); } } }; },
  flow: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    const done = ctx.strokes.filter((s, si) => ctx.rv.progress[si] >= 1);
    acc.add(done.length * 22 * n * dt);
    while (acc.take()) { const s = done[Math.floor(r() * done.length)]; const i = spawn(k, 0, 0, 0, 0, 0, 0, 0.7 + s.length * 0.012 + r() * 0.3, 0.018 + r() * 0.014, r()); ctx.pools[PARTICLE_KINDS.flow.pool].setAux(i, s.index); } } }; },
  rain: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(320 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.5, 0.5], [0.34, 0.42], [-0.35, 0.12]), vy = -(1.15 + r() * 0.35);
      spawn(k, x, y, z, 0.05, vy, 0, (y + 0.2) / (-vy * ctx.K), 0.06 + r() * 0.03, r()); } } }; },
  leaves: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(3 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.45, 0.45], [0.36, 0.42], [-0.2, 0.15]); spawn(k, x, y, z, 0, -(0.06 + r() * 0.03), 0, 5 + r() * 2, 0.022 + r() * 0.012, r()); } } }; },
  mist: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(2.2 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.65, 0.4], [-0.2, -0.04], [-0.3, 0.1]); spawn(k, x, y, z, 0.02 + r() * 0.025, 0.004, 0, 7 + r() * 3, 0.3 + r() * 0.15, r()); } } }; },
  motes: (ctx, k, spawn, n, spec) => { const acc = accumulate(), r = ctx.rnd, vy = { up: 0.05, down: -0.05 }[spec.dir] ?? 0; return { acc, step(t, dt) {
    acc.add(14 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.35, 0.35], [-0.2, 0.2], [-0.15, 0.15]); spawn(k, x, y, z, 0, vy * (0.6 + r() * 0.8), 0, 3 + r() * 2, 0.006 + r() * 0.007, r()); } } }; },
  snow: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(14 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.55, 0.55], [0.36, 0.44], [-0.3, 0.15]); spawn(k, x, y, z, 0, -(0.04 + r() * 0.03), 0, 7 + r() * 2, 0.008 + r() * 0.008, r()); } } }; },
  petals: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(7 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.45, 0.45], [0.36, 0.42], [-0.2, 0.15]); spawn(k, x, y, z, 0, -(0.05 + r() * 0.03), 0, 5 + r() * 2, 0.03 + r() * 0.012, r()); } } }; },
  steam: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(3.5 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.1, 0.1], [-0.16, -0.1], [-0.05, 0.08]); spawn(k, x, y, z, 0, 0.02, 0, 3 + r(), 0.06 + r() * 0.04, r()); } } }; },
  coins: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(7 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.45, 0.45], [0.36, 0.42], [-0.2, 0.1]); const vy = -(0.3 + r() * 0.2); spawn(k, x, y, z, 0, vy, 0, (y + 0.25) / (-vy * ctx.K), 0.03 + r() * 0.01, r()); } } }; },
  hearts: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(4.5 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.32, 0.32], [-0.15, 0.05], [-0.1, 0.12]); spawn(k, x, y, z, 0, 0.05 + r() * 0.03, 0, 3 + r() * 1.5, 0.03 + r() * 0.015, r()); } } }; },
  notes: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(3.5 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.35, 0.35], [-0.12, 0.1], [-0.1, 0.12]); spawn(k, x, y, z, (r() - 0.5) * 0.04, 0.045 + r() * 0.02, 0, 3.5 + r(), 0.036 + r() * 0.014, r()); } } }; },
  sparks: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {     // sparkling off the drawn strokes
    const burned = ctx.rv.burned; acc.add(burned * 0.05 * n * dt);
    while (acc.take()) { const g = ctx.rv.rings[Math.floor(r() * burned)], [x, y, z] = surfacePoint(ctx, ctx.strokes[g.si], g.i, 1.2); const a = r() * Math.PI * 2, sp = 0.05 + r() * 0.1;
      spawn(k, x, y, z, Math.cos(a) * sp, Math.sin(a) * sp + 0.05, (r() - 0.5) * sp, 0.5 + r() * 0.5, 0.006 + r() * 0.004, r()); } } }; },
  dust: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {      // motes drifting in the light
    acc.add(6 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.4, 0.4], [-0.2, 0.25], [-0.15, 0.1]); spawn(k, x, y, z, (r() - 0.5) * 0.02, -0.004, 0, 6 + r() * 3, 0.004 + r() * 0.004, r()); } } }; },
  bubbles: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(8 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.32, 0.32], [-0.2, 0.0], [-0.15, 0.1]); spawn(k, x, y, z, 0, 0.02, 0, 3 + r(), 0.012 + r() * 0.018, r()); } } }; },
  // a trail of footprints walking across the lower half of the kanji (dir right / left / away / toward)
  footprints: (ctx, k, spawn, n, spec) => { const r = ctx.rnd, pool = ctx.pools[PARTICLE_KINDS.footprints.pool]; let acc = 0, step = 0;
    const d = { right: [1, 0], left: [-1, 0], away: [0, 1], toward: [0, -1] }[spec.dir] ?? [1, 0];
    return { acc: { reset() { acc = 0; step = 0; } }, step(t, dt) {
      acc += dt * 3.2 * n;
      while (acc >= 1) { acc--; const u = (step % 14) / 13, side = step % 2 ? 1 : -1; step++;
        const along = -0.36 + 0.72 * u, x = d[0] ? along * d[0] : side * 0.035, y = d[1] ? -0.1 + along * 0.3 * d[1] : -0.1 + side * 0.03;
        const i = spawn(k, x, y, 0.02, 0, 0, 0, 2.8, (d[1] ? 0.08 - 0.022 * along * d[1] : 0.075) + r() * 0.004, r());
        pool.setAux(i, Math.atan2(d[0], d[1]) * -1 + side * 0.12); } } }; },
  wind: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(26 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.62, -0.5], [-0.2, 0.28], [-0.25, 0.12]); spawn(k, x, y, z, 0.6 + r() * 0.35, 0.03 * (r() - 0.5), 0, 1.6 + r() * 0.5, 0.07 + r() * 0.06, r()); } } }; },
  kana: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; ctx.pools[PARTICLE_KINDS.kana.pool].setAtlas(kanaAtlas()); return { acc, step(t, dt) {
    acc.add(3.2 * n * dt);
    while (acc.take()) { const side = r() < 0.5 ? -1 : 1, [x, y, z] = box(r, [0.3, 0.48], [-0.14, 0.04], [-0.06, 0.1]); spawn(k, side * x, y, z, side * (0.005 + r() * 0.02), 0.04 + r() * 0.02, 0, 3.4 + r(), 0.05 + r() * 0.016, r()); } } }; },   // from both sides, clear of the glyphs
};

// as a layer, dust drifts in the light instead of falling like chips from the pen
const LAYER_KINDS = { dust: (c) => ({ shape: 1, move: physics({ w: [0.01, 1.1, 9, 0], drag: 0.2 }), look: (P, i, a, t, o) => set(o, rgb(c ?? 0xe8d8b8), 0.6 * hump(a), P.size0[i]) }) };

// A recipe particle layer: { step(t, dt), reset() }.
export function createLayer(ctx, spec) {
  const pool = ctx.pools[PARTICLE_KINDS[spec.type].pool];
  const k = pool.addKind((LAYER_KINDS[spec.type] ?? KINDS[spec.type])(spec.color, ctx));
  const em = EMIT[spec.type](ctx, k, pool.spawn, spec.count ?? 1, spec);
  return { step: em.step, reset: () => em.acc.reset() };
}

// Tip particles for reveals: spawns `rate` per second at each tip in `tips`, thrown outward (sparks, drops) or falling (dust).
const TIP = {
  front: { rate: 90, fire: (ctx, k, sp, tip, r) => sp(k, tip.x + (r() - 0.5) * ctx.radius, tip.y, tip.z + (r() - 0.5) * ctx.rz, (r() - 0.5) * 0.06, 0.14 + r() * 0.18, (r() - 0.5) * 0.05, 0.6 + r() * 0.5, 0.045 + r() * 0.03, r()) },
  sparks: { rate: 60, fire: (ctx, k, sp, tip, r) => { const a = r() * Math.PI * 2, s = 0.15 + r() * 0.35; sp(k, tip.x, tip.y, tip.z, Math.cos(a) * s, 0.1 + r() * s, (r() - 0.5) * s, 0.35 + r() * 0.45, 0.006, r()); } },
  drops: { rate: 40, fire: (ctx, k, sp, tip, r) => { const a = r() * Math.PI * 2, s = 0.1 + r() * 0.2; sp(k, tip.x, tip.y, tip.z + ctx.rz * 0.5, Math.cos(a) * s, 0.12 + r() * 0.2, (r() - 0.3) * s, 0.5 + r() * 0.3, 0.007 + r() * 0.006, r()); } },
  sprouts: { rate: 22, fire: (ctx, k, sp, tip, r) => sp(k, tip.x + (r() - 0.5) * ctx.radius * 2, tip.y + ctx.radius, tip.z + ctx.rz * (r() - 0.3), (r() - 0.5) * 0.06, 0.04 + r() * 0.04, 0.02, 0.9 + r() * 0.5, 0.016 + r() * 0.01, r()) },
  ink: { rate: 30, fire: (ctx, k, sp, tip, r) => { const a = r() * Math.PI * 2, s = 0.08 + r() * 0.16; sp(k, tip.x, tip.y, tip.z + ctx.rz, Math.cos(a) * s, 0.05 + Math.abs(Math.sin(a)) * s, 0.05 + r() * 0.05, 0.4 + r() * 0.4, 0.004 + r() * 0.005, r()); } },
  dust: { rate: 35, burst: (ctx, k, sp, p, r) => { const a = Math.atan2(p.y, p.x) + (r() - 0.5) * 0.8, s = 0.1 + r() * 0.18; sp(k, p.x, p.y, p.z + ctx.rz, Math.cos(a) * s, Math.sin(a) * s, 0.05 + r() * 0.1, 0.5 + r() * 0.4, 0.008 + r() * 0.008, r()); }, fire: (ctx, k, sp, tip, r) => sp(k, tip.x + (r() - 0.5) * ctx.radius * 2, tip.y, tip.z + (r() - 0.5) * ctx.rz, (r() - 0.5) * 0.12, 0.03 + r() * 0.05, (r() - 0.5) * 0.08, 0.6 + r() * 0.4, 0.006 + r() * 0.007, r()) },
};
export function createTipEmitter(ctx, name, rate = 1) {
  const pool = ctx.pools[PARTICLE_KINDS[name].pool], k = pool.addKind(KINDS[name](null, ctx)), T = TIP[name];
  let acc = 0;
  return {
    add(dt) { acc += dt * T.rate * rate; },
    fire(tip) { for (let n = acc; n >= 1; n--) T.fire(ctx, k, pool.spawn, tip, ctx.rnd); },
    burst(p) { (T.burst ?? T.fire)(ctx, k, pool.spawn, p, ctx.rnd); },
    settle() { if (acc >= 1) acc -= Math.floor(acc); },
    reset() { acc = 0; },
  };
}
