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
  flow: (c, ctx) => {                                            // runs along stroke P.aux[i] from its start to its end, on the front surface
    const v = new THREE.Vector3();
    return { shape: 0, move(P, i, a) { const s = ctx.strokes[P.aux[i]]; pointAt(s.pts, a, v); const j = i * 3, sd = P.seed[i]; P.pos[j] = v.x + (sd - 0.5) * ctx.radius; P.pos[j + 1] = v.y + (sd * 7 % 1 - 0.5) * ctx.radius; P.pos[j + 2] = ctx.rz * 0.95; },
      look: (P, i, a, t, o) => set(o, rgb(c ?? 0xd8f4ff), 0.85 * hump(a), P.size0[i]) };
  },
};
KINDS.front = KINDS.flames;

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
  bubbles: (ctx, k, spawn, n) => { const acc = accumulate(), r = ctx.rnd; return { acc, step(t, dt) {
    acc.add(8 * n * dt);
    while (acc.take()) { const [x, y, z] = box(r, [-0.32, 0.32], [-0.2, 0.0], [-0.15, 0.1]); spawn(k, x, y, z, 0, 0.02, 0, 3 + r(), 0.012 + r() * 0.018, r()); } } }; },
};

// A recipe particle layer: { step(t, dt), reset() }.
export function createLayer(ctx, spec) {
  const pool = ctx.pools[PARTICLE_KINDS[spec.type].pool];
  const k = pool.addKind(KINDS[spec.type](spec.color, ctx));
  const em = EMIT[spec.type](ctx, k, pool.spawn, spec.count ?? 1, spec);
  return { step: em.step, reset: () => em.acc.reset() };
}

// Tip particles for reveals: spawns `rate` per second at each tip in `tips`, thrown outward (sparks, drops) or falling (dust).
const TIP = {
  front: { rate: 90, fire: (ctx, k, sp, tip, r) => sp(k, tip.x + (r() - 0.5) * ctx.radius, tip.y, tip.z + (r() - 0.5) * ctx.rz, (r() - 0.5) * 0.06, 0.14 + r() * 0.18, (r() - 0.5) * 0.05, 0.6 + r() * 0.5, 0.045 + r() * 0.03, r()) },
  sparks: { rate: 60, fire: (ctx, k, sp, tip, r) => { const a = r() * Math.PI * 2, s = 0.15 + r() * 0.35; sp(k, tip.x, tip.y, tip.z, Math.cos(a) * s, 0.1 + r() * s, (r() - 0.5) * s, 0.35 + r() * 0.45, 0.006, r()); } },
  drops: { rate: 40, fire: (ctx, k, sp, tip, r) => { const a = r() * Math.PI * 2, s = 0.1 + r() * 0.2; sp(k, tip.x, tip.y, tip.z + ctx.rz * 0.5, Math.cos(a) * s, 0.12 + r() * 0.2, (r() - 0.3) * s, 0.5 + r() * 0.3, 0.007 + r() * 0.006, r()); } },
  dust: { rate: 35, fire: (ctx, k, sp, tip, r) => sp(k, tip.x + (r() - 0.5) * ctx.radius * 2, tip.y, tip.z + (r() - 0.5) * ctx.rz, (r() - 0.5) * 0.12, 0.03 + r() * 0.05, (r() - 0.5) * 0.08, 0.6 + r() * 0.4, 0.006 + r() * 0.007, r()) },
};
export function createTipEmitter(ctx, name, rate = 1) {
  const pool = ctx.pools[PARTICLE_KINDS[name].pool], k = pool.addKind(KINDS[name](null, ctx)), T = TIP[name];
  let acc = 0;
  return {
    add(dt) { acc += dt * T.rate * rate; },
    fire(tip) { for (let n = acc; n >= 1; n--) T.fire(ctx, k, pool.spawn, tip, ctx.rnd); },
    settle() { if (acc >= 1) acc -= Math.floor(acc); },
    reset() { acc = 0; },
  };
}
