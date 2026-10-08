// Step 1 word variants of step1-l.js (same scene types, another outcome): noodle, bookworm, setOff, weatherTurns, oldCar, catLap, sandwich
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { textPlane, blackboard } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, puffs, wisps } from './helpers.js';
import { grow, seeded } from './step1-kit.js';
import { sit } from './step1-d.js';
import { carBody } from './step1-a.js';
import { birdThing } from './step1-c.js';

const tmp = new THREE.Vector3();

export function noodle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, N = 30;
  const bowl = solidProp([[new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.22, 0.16], [0.2, 0.16], [0.09, 0.02], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 32), 0xe04848], [G.cyl(0.19 * u, 0.19 * u, 0.01 * u, 0, 0.13 * u, 0), 0xe0b060]], 0.45);
  const strand = many([[G.sphere(0.018 * u), 0xfff0c0]], N, 0.6), sticks = solidProp([[G.cyl(0.01 * u, 0.006 * u, 0.4 * u, -0.012 * u, 0, 0, 0, 0, 0.05), 0x8a3a20], [G.cyl(0.01 * u, 0.006 * u, 0.4 * u, 0.012 * u, 0, 0, 0, 0, -0.05), 0x8a3a20]], 0.45), steam = many([[G.sphere(0.03 * u), 0xf0f0f0]], 4, 0.5);
  bowl.position.set(bx, floor, 0); bowl.rotation.x = 0.3;
  group.add(bowl, strand, sticks, steam);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, lift = pre ? 0 : between(v, 0.3, 2.6), slurp = pre ? 0 : between(v, 3.0, 4.6);
      const top = floor + 0.2 * u + 0.85 * u * lift, len = top - floor - 0.12 * u;
      for (let i = 0; i < N; i++) { const s = i / (N - 1), y = floor + 0.12 * u + len * s, gone = s > 1 - slurp; strand.set(i, bx + 0.02 * u * Math.sin(s * 10 + v * 2), gone ? top : y, 0.04 * u, !pre && !gone ? 1 : 0); }
      strand.commit();
      sticks.visible = !pre; sticks.position.set(bx + 0.05 * u, top + 0.15 * u, 0.04 * u); sticks.rotation.z = -0.2;
      wisps(steam, 0, 4, bx, floor + 0.2 * u, v, u, { period: 1.6, rise: 0.4, on: pre ? 0 : 1 }); steam.commit();
    },
  };
}

export function bookworm(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, N = 8;
  const book = solidProp([[G.box(0.32 * u, 0.04 * u, 0.42 * u, -0.17 * u, 0, 0, 0.12), 0xfaf4e4], [G.box(0.32 * u, 0.04 * u, 0.42 * u, 0.17 * u, 0, 0, -0.12), 0xfaf4e4], [G.box(0.7 * u, 0.02 * u, 0.44 * u, 0, -0.03 * u, 0), 0x3a7ae0], ...[0, 1, 2, 3].map((i) => [G.box(0.22 * u, 0.006 * u, 0.012 * u, 0.17 * u, 0.03 * u, (0.12 - 0.08 * i) * u), 0x9a9a9a])], 0.45);
  const worm = many([[G.sphere(0.04 * u), 0x80d040]], N, 0.5), head = solidProp([[G.sphere(0.055 * u), 0x80d040], [G.torus(0.025 * u, 0.006 * u, Math.PI * 2, -0.025 * u, 0.01 * u, 0.045 * u), 0x202020], [G.torus(0.025 * u, 0.006 * u, Math.PI * 2, 0.025 * u, 0.01 * u, 0.045 * u), 0x202020], [G.sphere(0.008 * u, -0.025 * u, 0.01 * u, 0.05 * u), 0x101010], [G.sphere(0.008 * u, 0.025 * u, 0.01 * u, 0.05 * u), 0x101010]], 0.5);
  const tilt = new THREE.Group(); tilt.add(book, worm, head); tilt.position.set(bx, floor + 0.05 * u, 0); tilt.rotation.x = 0.55;
  group.add(tilt);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.3, 4.8);
      for (let i = 0; i < N; i++) { const s = f * 1.0 - i * 0.05, x = -0.32 * u + 0.64 * u * Math.max(0, s), dive = Math.sin(s * 9) > 0.6; worm.set(i, x, 0.04 * u + 0.04 * u * Math.abs(Math.sin(s * 18)) - (dive ? 0.05 * u : 0), 0.0, s > 0 && s < 1 ? 1 : 0); }
      worm.commit();
      const hx = -0.32 * u + 0.64 * u * f; head.position.set(hx + 0.04 * u, 0.08 * u + 0.03 * u * Math.abs(Math.sin(f * 18)), 0); head.visible = f > 0 && f < 1; head.rotation.x = -0.55;
    },
  };
}

export function setOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0xe0603a }), pack = solidProp([[G.box(0.2 * u, 0.26 * u, 0.12 * u, 0, 0, 0), 0x3a7a40], [G.box(0.16 * u, 0.08 * u, 0.13 * u, 0, -0.05 * u, 0.0), 0x2a5a30]], 0.4);
  p.rig.attach('body', pack, 0.55); pack.position.set(0, 0, -0.14 * u);
  const path = solidProp([[G.box(0.25 * u, 0.01 * u, 1.2 * u, 0, 0, -0.5 * u), 0xd0b080]], 0.3); path.position.set(px + 0.3 * u, floor, 0.1 * u);
  group.add(path, p.group);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, wave = pre ? 0 : bump(v, 0.3, 1.6), f = pre ? 0 : between(v, 1.9, 5.2);
      p.reset().face(f > 0 ? 'away' : 'toward'); if (f > 0 && f < 1) p.walk(v * 9, 1); if (wave > 0) { p.raise('R', 2.6 * wave); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 10); }
      p.group.position.set(px + 0.3 * u, floor + 0.35 * u * f, 0.1 * u - 0.9 * u * f); p.group.scale.setScalar(1 - 0.6 * f); p.group.visible = !pre && f < 0.99; p.update();
    },
  };
}

export function weatherTurns(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.5 * u;
  const house = solidProp([[G.box(0.32 * u, 0.24 * u, 0.22 * u, 0, 0.12 * u, 0), 0xf0e0c0], [G.cone(0.26 * u, 0.18 * u, 0, 0.33 * u, 0), 0xc04a3a]], 0.4);
  const sun = solidProp([[G.sphere(0.12 * u), 0xffb030]], 1.3), cloud = many([[G.sphere(0.12 * u), 0x9aa4b4], [G.sphere(0.09 * u, 0.12 * u, -0.02 * u, 0), 0x9aa4b4], [G.sphere(0.09 * u, -0.12 * u, -0.02 * u, 0), 0x9aa4b4]], 1, 0.4), drops = many([[G.sphere(0.015 * u, 0, 0, 0, 1, 2, 1), 0x7fc8ff]], 10, 1.0), flakes = many([[G.sphere(0.02 * u), 0xffffff]], 10, 1.2);
  house.position.set(hx, floor, -0.05 * u);
  group.add(house, sun, cloud, drops, flakes);
  const loop = 6.4, r = seeded(9), S = Array.from({ length: 10 }, () => [r(), r()]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, phase = pre ? 0 : Math.floor(v / 1.6) % 4, f = pre ? 0 : (v / 1.6) % 1, k = Math.min(1, f * 4, (1 - f) * 4);
      const sy = floor + 0.8 * u; sun.visible = phase === 0; sun.position.set(hx + 0.1 * u, sy, -0.2 * u); sun.scale.setScalar(grow(k));
      cloud.set(0, hx, sy, -0.15 * u, phase > 0 ? grow(k) : 0); cloud.commit();
      S.forEach(([a, b], i) => { const g = ((v * 1.2 + b) % 1); drops.set(i, hx - 0.25 * u + a * 0.5 * u, sy - 0.1 * u - 0.6 * u * g, -0.1 * u, phase === 2 ? k : 0); flakes.set(i, hx - 0.25 * u + a * 0.5 * u + 0.03 * u * Math.sin(v * 3 + i), sy - 0.1 * u - 0.6 * u * ((v * 0.5 + b) % 1), -0.1 * u, phase === 3 ? k : 0); });
      drops.commit(); flakes.commit();
    },
  };
}

export function oldCar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u;
  const car = carBody(1.1 * u, { color: 0x8a7a5a }), smoke = many([[G.sphere(0.05 * u), 0x505058]], 6, 0.2), cap = solidProp([[G.cyl(0.04 * u, 0.04 * u, 0.012 * u, 0, 0, 0, Math.PI / 2), 0xc8ccd4]], 0.5), rust = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 1, 0.3), 0x8a4a20]], 4, 0.3);
  group.add(car, smoke, cap, rust);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rattle = pre ? 0 : 0.008 * u * Math.sin(t * 45) * (v > 0.3 && v < 4.5 ? 1 : 0);
      car.position.set(cx + rattle, floor + Math.abs(rattle), 0.02 * u); car.rotation.set(0, 0, 0.03 * Math.sin(t * 20) * (v < 4.5 ? 1 : 0)); car.roll(0, 0.1);
      for (let i = 0; i < 4; i++) rust.set(i, cx + (-0.2 + 0.13 * i) * u, floor + (0.14 + 0.03 * (i % 2)) * u, 0.18 * u, 1);
      rust.commit();
      for (let i = 0; i < 6; i++) { const f = ((v * 0.8 + i / 6) % 1), cough = Math.floor(v / 1.2) % 2 === 0; smoke.set(i, cx - 0.4 * u - 0.3 * u * f, floor + 0.12 * u + 0.25 * u * f, 0.0, !pre && cough ? (0.6 + 1.4 * f) * (1 - f) * 1.5 : 0); }
      smoke.commit();
      const r = pre ? 0 : between(v, 2.0, 3.6); cap.visible = r > 0 && r < 1; cap.position.set(cx + 0.2 * u + 0.8 * u * r, floor + 0.04 * u + 0.05 * u * Math.abs(Math.sin(r * 15)) * (1 - r), 0.2 * u); cap.rotation.z = -r * 20;
    },
  };
}

export function catLap(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u;
  const cat = solidProp([[G.sphere(0.14 * u, 0, 0.15 * u, 0, 1.5, 0.9, 0.9), 0xff9a40], [G.sphere(0.1 * u, 0.22 * u, 0.12 * u, 0), 0xff9a40], [G.cone(0.035 * u, 0.07 * u, 0.2 * u, 0.22 * u, 0.06 * u), 0xff9a40], [G.cone(0.035 * u, 0.07 * u, 0.26 * u, 0.22 * u, -0.05 * u), 0xff9a40], [G.sphere(0.015 * u, 0.3 * u, 0.14 * u, 0.05 * u), 0x101010], [G.sphere(0.015 * u, 0.3 * u, 0.14 * u, -0.05 * u), 0x101010], [G.cyl(0.02 * u, 0.015 * u, 0.3 * u, -0.22 * u, 0.3 * u, 0, 0, 0, 0.6), 0xff9a40], ...[[-0.1, 0.07], [-0.1, -0.07], [0.12, 0.07], [0.12, -0.07]].map(([x, z]) => [G.cyl(0.025 * u, 0.025 * u, 0.12 * u, x * u, 0.06 * u, z * u), 0xff9a40])], 0.45);
  const saucer = solidProp([[G.cyl(0.13 * u, 0.1 * u, 0.025 * u, 0, 0.012 * u, 0), 0x6ab0ff], [G.cyl(0.1 * u, 0.1 * u, 0.006 * u, 0, 0.026 * u, 0), 0xffffff]], 0.6), tongue = solidProp([[G.sphere(0.02 * u, 0, 0, 0, 1, 1.6, 0.6), 0xff6a80]], 0.6), drops = many([[G.sphere(0.01 * u), 0xffffff]], 3, 1.0);
  const catG = new THREE.Group(); catG.add(cat); catG.position.set(cx - 0.05 * u, floor, 0); saucer.position.set(cx + 0.3 * u, floor, 0.02 * u);
  group.add(catG, saucer, tongue, drops);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, bend = pre ? 0 : between(v, 0.2, 0.6) * (1 - between(v, 3.6, 4.0)), lap = Math.max(0, Math.sin(v * 9)) * bend;
      catG.rotation.z = -0.35 * bend;
      tongue.visible = lap > 0.2; tongue.position.set(cx + 0.27 * u, floor + 0.05 * u + 0.04 * u * lap, 0.02 * u);
      for (let i = 0; i < 3; i++) { const g = ((v * 2 + i / 3) % 1); drops.set(i, cx + 0.3 * u + 0.04 * u * (i - 1), floor + 0.04 * u + 0.08 * u * Math.sin(Math.PI * g), 0.04 * u, bend > 0.5 ? 1 : 0); }
      drops.commit();
    },
  };
}

export function sandwich(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0xd0603a }), sw = solidProp([[G.box(0.2 * u, 0.03 * u, 0.12 * u, 0, 0, 0), 0xf0d8a0], [G.box(0.21 * u, 0.02 * u, 0.13 * u, 0, 0.025 * u, 0), 0x60c040], [G.box(0.2 * u, 0.02 * u, 0.12 * u, 0, 0.045 * u, 0), 0xe05050], [G.box(0.2 * u, 0.03 * u, 0.12 * u, 0, 0.07 * u, 0), 0xf0d8a0]], 0.5);
  const munch = textPlane('もぐもぐ', { h: 0.11 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  group.add(p.group, sw, munch);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, b = pre ? 0 : Math.max(bump(v, 0.5, 0.6), bump(v, 1.5, 0.6), bump(v, 2.5, 0.6));
      p.reset().face(0.4); p.group.position.set(px, floor, 0.02 * u); p.bone('armR').rotation.x = 1.3 + 0.5 * b; p.bone('foreR').rotation.x = 1.4 + 0.4 * b; p.bone('head').rotation.x = 0.1 * b; p.update();
      bonePoint(p, 'handR', 0.7, tmp); sw.position.set(tmp.x, tmp.y, tmp.z + 0.04 * u); sw.rotation.z = 0.4; sw.visible = !pre; sw.scale.x = 1 - 0.15 * Math.min(3, Math.floor(Math.max(0, v - 0.6))) * (v < 4.2 ? 1 : 0);
      const k = !pre && v > 0.5 && v < 3.2 ? 1 : 0; munch.visible = k > 0; munch.position.set(px + 0.35 * u, floor + 1.0 * u + 0.02 * u * Math.sin(v * 12), 0.06 * u);
    },
  };
}
