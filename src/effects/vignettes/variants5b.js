// Batch 5 word variants, part 2:
//   walk-far:scope       遠い: a person looks through a telescope; a round zoom view shows a tiny castle far away on the horizon
//   mirror-dance:match   同じ: two face-down cards flip over one after the other: the same star on both; "=" and a sparkle
//   post-kick:ok         大丈夫: a kid trips and falls; a grown-up rushes over "?"; the kid hops up with a big tick, arms up
//   post-kick:weight     丈夫: a heavy weight drops onto a sturdy wooden table; dust puffs, the table holds; a tick
//   alarm-wake:sun       起きる: morning sun rises in the window; the person in bed sits up slowly, yawns and stretches; birds sing
//   home-greet:bird      帰る: a mother bird flies home to the nest with a worm; the chicks bounce and open their beaks
//   toast-run:tortoise   遅い: a tortoise plods slowly along while a rabbit zooms past it, there and back
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, puffs } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

export function telescope(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.3 * u;
  const p = createPerson({ u: 0.75 * u, shirt: 0x60b060 }), scope = solidProp([[G.cyl(0.03 * u, 0.045 * u, 0.36 * u, 0, 0, 0, 0, 0, -1.2), 0xc8a030], [G.cyl(0.006 * u, 0.006 * u, 0.4 * u, -0.05 * u, -0.25 * u, 0, 0, 0, 0.3), 0x3a3a44], [G.cyl(0.006 * u, 0.006 * u, 0.4 * u, 0.05 * u, -0.25 * u, 0, 0, 0, -0.3), 0x3a3a44]], 0.45);
  scope.position.set(px + 0.18 * u, floor + 0.55 * u, 0.15 * u);
  const view = solidProp([[G.cyl(0.24 * u, 0.24 * u, 0.01 * u, 0, 0, 0, Math.PI / 2, 0, 0, 32), 0x8ad0ff], [new THREE.CircleGeometry(0.23 * u, 32, Math.PI, Math.PI).translate(0, 0.0, 0.007 * u), 0x60b050], [G.box(0.1 * u, 0.1 * u, 0.01 * u, 0, 0.05 * u, 0.01 * u), 0xe8e0d0], [G.cone(0.04 * u, 0.06 * u, -0.05 * u, 0.13 * u, 0.012 * u), 0xc04030], [G.cone(0.04 * u, 0.06 * u, 0.05 * u, 0.13 * u, 0.012 * u), 0xc04030], [G.box(0.03 * u, 0.05 * u, 0.012 * u, 0, 0.025 * u, 0.016 * u), 0x3a2a1a], [G.torus(0.24 * u, 0.02 * u), 0x3a3a44]], 0.5);
  const far = solidProp([[G.box(0.04 * u, 0.04 * u, 0.01 * u, 0, 0.02 * u, 0), 0xe8e0d0], [G.cone(0.016 * u, 0.025 * u, 0, 0.05 * u, 0), 0xc04030], [G.sphere(0.12 * u, 0, -0.02 * u, 0, 1.4, 0.3, 0.3), 0x60b050]], 0.4);
  far.position.set(px + 1.0 * u, floor + 0.5 * u, -0.6 * u);
  group.add(p.group, scope, view, far);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, z = pre ? 0 : timeline(v, { a: [0.8, 0.5, 'back'], b: [4.0, 0.4] }), zoom = z.a - z.b;
      p.reset().face(0.9); p.bone('armR').rotation.x = 1.8; p.bone('foreR').rotation.x = 0.8; p.bone('armL').rotation.x = 1.5; p.group.position.set(px, floor, 0.1 * u); p.update();
      view.visible = zoom > 0.01; view.scale.setScalar(pop(zoom)); view.position.set(px + 0.55 * u, floor + 1.0 * u, 0.1 * u);
    },
  };
}

export function cardMatch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cy = B.cy, x0 = B.maxX + 0.3 * u;
  const card = () => { const p = new THREE.Group(), m = solidProp([[G.box(0.24 * u, 0.32 * u, 0.012 * u, 0, 0, 0), 0x3a6ad8], [G.box(0.22 * u, 0.3 * u, 0.004 * u, 0, 0, 0.008 * u), 0xffffff], [G.box(0.2 * u, 0.28 * u, 0.004 * u, 0, 0, -0.008 * u), 0x5a8af0]], 0.5); p.add(m); return p; };
  const star = (n) => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.1 : 5; i ? sh.lineTo(r * Math.cos(a), r * Math.sin(a)) : sh.moveTo(r * Math.cos(a), r * Math.sin(a)); } return solidProp([[G.extrude(sh, 0.3).scale(0.016 * u, 0.016 * u, 0.016 * u).translate(0, 0, 0.013 * u), 0xffc020]], 0.7); };
  const cards = [card(), card()]; cards.forEach((c, i) => { c.add(star()); c.position.set(x0 + i * 0.32 * u, cy, 0); });
  const eq = emblemProp('equals', 0.2 * u, { color: 0xffe040 }), shine = burst(u, { s: 0.6, n: 10, color: 0xfff0a0 });
  group.add(...cards, eq, shine);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      cards.forEach((c, i) => { const f = pre ? 1 : timeline(v, { a: [0.4 + 0.6 * i, 0.4], b: [3.8 + 0.1 * i, 0.4] }); c.rotation.y = Math.PI * (1 - (pre ? 1 : f.a - f.b)); c.position.y = cy + 0.04 * u * bump(v, 0.4 + 0.6 * i, 0.4); });
      const m = pre ? 1 : timeline(v, { m: [1.5, 0.3, 'back'] }).m * (1 - between(v, 3.6, 3.9)); eq.visible = m > 0.01; eq.scale.setScalar(pop(0.2 * u * m)); eq.position.set(x0 + 0.16 * u, cy + 0.26 * u, 0.05 * u); eq.idle(t);
      const s = pre ? 0 : bump(v, 1.5, 1.4); shine.visible = s > 0; shine.scale.setScalar(pop(s)); shine.position.set(x0 + 0.16 * u, cy, -0.05 * u); shine.rotation.z = t;
    },
  };
}

export function okUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.4 * u, pu = 0.6 * u, hip = 0.39 * pu;
  const kid = createPerson({ u: pu, shirt: 0xe04848 }), pivot = new THREE.Group(); pivot.add(kid.group); kid.group.position.y = -hip;
  const adult = createPerson({ u: 0.95 * u, shirt: 0x40a080 }), q = emblemProp('question', 0.22 * u, { color: 0xffe040 }), ok = emblemProp('check', 0.3 * u);
  group.add(pivot, adult.group, q, ok);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { fall: [0.3, 0.3, 'in'], run: [0.5, 0.8], up: [1.8, 0.3, 'back'], back: [4.2, 0.5] }), down = T.fall - T.up, yay = T.up * (1 - T.back);
      kid.reset().face(0.2); kid.raise('L', 2.8 * yay); kid.raise('R', 2.8 * yay); kid.update();
      pivot.position.set(kx, floor + hip * (1 - 0.7 * down) + 0.05 * u * bump(v, 2.0, 0.3), 0.15 * u); pivot.rotation.set(0, 0, -1.3 * down);
      adult.reset().face(T.run < 1 ? 'left' : -0.9).walk(v * 10, T.run > 0 && T.run < 1 ? 1 : 0); adult.lean(0.4 * (T.run >= 1 ? 1 - T.up : 0)); adult.group.position.set(lerp(kx + 1.0 * u, kx + 0.4 * u, T.run), floor, 0.0); adult.update();
      const qq = pre ? 0 : bump(v, 1.1, 0.9); q.visible = qq > 0; q.scale.setScalar(pop(0.22 * u * qq)); q.position.set(kx + 0.4 * u, floor + 1.1 * u, 0.05 * u); q.idle(t);
      const k = pre ? 0 : yay; ok.visible = k > 0.01; ok.scale.setScalar(pop(0.3 * u * k)); ok.position.set(kx, floor + 0.85 * u, 0.15 * u);
    },
  };
}

export function sturdyTable(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u, TH = 0.3 * u;
  const table = solidProp([[G.box(0.5 * u, 0.06 * u, 0.3 * u, 0, TH, 0), 0x8a5a30], ...[[-0.2, 0.1], [0.2, 0.1], [-0.2, -0.1], [0.2, -0.1]].map(([x, z]) => [G.box(0.07 * u, TH, 0.07 * u, x * u, TH / 2, z * u), 0x6a4020])], 0.35);
  table.position.set(tx, floor, 0);
  const wt = emblemProp('weight', 0.34 * u), dust = many(PUFF(u), 6, 0.4), ok = emblemProp('check', 0.26 * u);
  group.add(table, wt, dust, ok);
  const loop = 4.6, top = floor + TH + 0.03 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { drop: [0.4, 0.45, 'in'], lift: [3.8, 0.6, 'in'] }), d = pre ? 1 : T.drop - T.lift;
      wt.position.set(tx, top + 0.15 * u + 0.9 * u * (1 - d), 0.0); wt.visible = pre || v > 0.3; wt.idle(0);
      table.position.y = floor - 0.01 * u * bump(v, 0.85, 0.25); table.scale.y = 1 - 0.04 * bump(v, 0.85, 0.25);
      puffs(dust, 0, 6, tx, floor, between(v, 0.85, 1.5), u, 0.4); dust.commit();
      const k = pre ? 0 : bump(v, 1.2, 2.4); ok.visible = k > 0; ok.scale.setScalar(pop(0.26 * u * Math.min(1, k * 2))); ok.position.set(tx + 0.4 * u, floor + 0.7 * u, 0.1 * u);
    },
  };
}

export function sunWake(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.6 * u, top = floor + 0.24 * u, pu = 0.7 * u, hip = 0.39 * pu;
  const bed = solidProp([[G.box(0.8 * u, 0.2 * u, 0.34 * u, 0, 0.1 * u, 0), 0x8a5a30], [G.box(0.78 * u, 0.06 * u, 0.32 * u, 0, 0.21 * u, 0), 0xf4f4f4], [G.box(0.04 * u, 0.36 * u, 0.34 * u, -0.4 * u, 0.18 * u, 0), 0x6a4020]], 0.35);
  bed.position.set(bx, floor, 0);
  const win = solidProp([[G.box(0.4 * u, 0.32 * u, 0.01 * u, 0, 0, 0), 0x9ad8ff], [G.box(0.44 * u, 0.025 * u, 0.02 * u, 0, -0.17 * u, 0.01 * u), 0xffffff], [G.box(0.44 * u, 0.025 * u, 0.02 * u, 0, 0.17 * u, 0.01 * u), 0xffffff], [G.box(0.025 * u, 0.34 * u, 0.02 * u, 0, 0, 0.01 * u), 0xffffff]], 0.6);
  win.position.set(bx + 0.1 * u, floor + 0.75 * u, -0.35 * u);
  const sun = solidProp([[new THREE.CircleGeometry(0.07 * u, 24), 0xffc030]], 1.0), blanket = solidProp([[G.box(0.46 * u, 0.08 * u, 0.3 * u, 0, 0, 0), 0xffb0c8]], 0.4);
  const p = createPerson({ u: pu, shirt: 0x40a0e0 }), pivot = new THREE.Group(); pivot.add(p.group); p.group.position.y = -hip;
  const notes = many([[G.sphere(0.022 * u, 0, 0, 0, 1.3, 1, 0.6), 0xffe060], [G.box(0.006 * u, 0.06 * u, 0.006 * u, 0.024 * u, 0.03 * u, 0), 0xffe060]], 4, 0.9);
  group.add(bed, win, sun, blanket, pivot, notes);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rise = pre ? 0 : between(v, 0, 1.8), T = timeline(v, { up: [1.6, 1.0, 'smooth'], down: [4.6, 0.6] }), lie = pre ? 1 : 1 - (T.up - T.down);
      sun.position.set(bx + 0.18 * u, floor + 0.62 * u + 0.2 * u * rise, -0.34 * u); sun.visible = !pre;
      p.reset().face('right'); p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.5 * (1 - lie); const st = bump(v, 2.8, 1.4); p.raise('L', 2.8 * st); p.raise('R', 2.8 * st); p.bone('head').rotation.x = -0.3 * st; p.update();
      pivot.position.set(bx - 0.18 * u, top + 0.06 * u, 0.0); pivot.rotation.z = Math.PI / 2 * lie;
      blanket.position.set(bx + 0.12 * u, top + 0.06 * u, 0.04 * u);
      for (let i = 0; i < 4; i++) { const f = ((v * 0.5 + i / 4) % 1 + 1) % 1; notes.set(i, bx + 0.05 * u + 0.25 * u * f, floor + 0.8 * u + 0.25 * u * f, -0.3 * u, rise > 0.5 ? Math.sin(Math.PI * f) : 0); } notes.commit();
    },
  };
}

export function birdHome(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, nx = B.maxX + 0.55 * u, ny = floor + 0.5 * u;
  const tree = solidProp([[G.cyl(0.04 * u, 0.05 * u, 0.6 * u, 0.2 * u, -0.2 * u, -0.05 * u), 0x8a5a30], [G.cyl(0.02 * u, 0.025 * u, 0.4 * u, 0.0, 0.0, -0.02 * u, 0, 0, Math.PI / 2 - 0.2), 0x8a5a30], [G.torus(0.1 * u, 0.035 * u).rotateX(Math.PI / 2).translate(0, 0.04 * u, 0), 0xa87a40], [G.sphere(0.1 * u, 0, 0.02 * u, 0, 1, 0.4, 1), 0x8a5a30]], 0.35);
  tree.position.set(nx, ny, 0);
  const chicks = many([[G.sphere(0.045 * u), 0xffe040], [G.cone(0.015 * u, 0.03 * u, 0, 0.0, 0.05 * u, 0), 0xff8a20], [G.sphere(0.008 * u, -0.015 * u, 0.015 * u, 0.04 * u), 0x1a1a24], [G.sphere(0.008 * u, 0.015 * u, 0.015 * u, 0.04 * u), 0x1a1a24]], 2, 0.6);
  const mom = emblemProp('bird', 0.3 * u, { color: 0x6a9ad8 }), worm = solidProp([[G.tube([[0, 0], [0.02 * u, -0.02 * u], [0.04 * u, 0], [0.06 * u, -0.02 * u]], 0.008 * u), 0xff8aa0]], 0.6);
  group.add(tree, chicks, mom, worm);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 1 : timeline(v, { f: [0.2, 1.4, 'out'] }).f, away = between(v, 4.0, 4.8), excited = f > 0.8 && away === 0;
      const [x, y] = arc([nx + 1.0 * u, ny + 0.6 * u], [nx + 0.02 * u, ny + 0.16 * u], 0.2 * u, f), bx = x + 1.0 * u * away, by = y + 0.5 * u * away;
      mom.position.set(bx, by, 0.05 * u); mom.idle(f < 1 || away > 0 ? t * 3 : 0); mom.scale.setScalar(0.3 * u);
      worm.visible = !pre && f < 1 && v < 1.6; worm.position.set(bx - 0.12 * u, by - 0.02 * u, 0.06 * u);
      for (let i = 0; i < 2; i++) chicks.set(i, nx + (i ? 0.05 : -0.05) * u, ny + 0.08 * u + (excited ? 0.03 * u * Math.abs(Math.sin(v * 12 + i)) : 0), 0.03 * u, 1, 0, 0, excited ? -0.3 * Math.abs(Math.sin(v * 12 + i)) : 0);
      chicks.commit();
    },
  };
}

export function tortoiseHare(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.15 * u;
  const tort = solidProp([[new THREE.SphereGeometry(0.12 * u, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.3, 0.8, 1), 0x4a8a3a], [G.torus(0.12 * u * 1.15, 0.01 * u).rotateX(Math.PI / 2).scale(1.13, 1, 0.87), 0x2a5a2a], [G.sphere(0.04 * u, 0.18 * u, 0.04 * u, 0), 0x9ac878], [G.sphere(0.008 * u, 0.21 * u, 0.055 * u, 0.025 * u), 0x1a1a24], ...[[-0.1, 0.07], [0.1, 0.07], [-0.1, -0.07], [0.1, -0.07]].map(([x, z]) => [G.cyl(0.025 * u, 0.025 * u, 0.04 * u, x * u, -0.01 * u, z * u), 0x9ac878])], 0.45);
  const hare = solidProp([[G.sphere(0.08 * u, 0, 0, 0, 1.4, 1, 1), 0xf4f4f4], [G.sphere(0.05 * u, 0.1 * u, 0.06 * u, 0), 0xf4f4f4], [G.cyl(0.015 * u, 0.012 * u, 0.12 * u, 0.09 * u, 0.15 * u, 0.0, 0, 0, -0.3), 0xf4f4f4], [G.cyl(0.015 * u, 0.012 * u, 0.12 * u, 0.11 * u, 0.15 * u, 0.02 * u, 0, 0, -0.1), 0xf4f4f4], [G.sphere(0.008 * u, 0.13 * u, 0.075 * u, 0.03 * u), 0x1a1a24], [G.sphere(0.025 * u, -0.11 * u, 0.02 * u, 0), 0xffffff]], 0.5);
  const dust = many(PUFF(u), 4, 0.4);
  group.add(tort, hare, dust);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.3 : v / loop;
      tort.position.set(x0 + 0.2 * u + 0.3 * u * f, floor + 0.02 * u + 0.006 * u * Math.abs(Math.sin(v * 3)), 0.1 * u); tort.rotation.z = 0.03 * Math.sin(v * 3);
      const h1 = between(v, 0.6, 1.2), h2 = between(v, 2.6, 3.2), hx = h1 > 0 && h1 < 1 ? lerp(x0 - 0.1 * u, x0 + 1.3 * u, h1) : h2 > 0 && h2 < 1 ? lerp(x0 + 1.3 * u, x0 - 0.1 * u, h2) : null;
      hare.visible = hx !== null && !pre; if (hx !== null) { hare.position.set(hx, floor + 0.08 * u + 0.08 * u * Math.abs(Math.sin(v * 20)), -0.12 * u); hare.rotation.y = h2 > 0 ? Math.PI : 0; }
      for (let i = 0; i < 4; i++) { const g = ((v * 3 + i / 4) % 1); dust.set(i, hx === null ? 0 : hx - (h2 > 0 ? -1 : 1) * 0.15 * u * (1 + g), floor + 0.03 * u, -0.12 * u, hare.visible ? 0.8 * (1 - g) : 0); } dust.commit();
    },
  };
}
