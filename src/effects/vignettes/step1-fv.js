// Step 1 word variants of step1-f.js (same scene types, another outcome): dadHome, mumCook, boyPlane, girlSwing, telescope, showDrawing, studentWalk, capsToss
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, HEART, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps, bonePoint } from './helpers.js';
import { grow } from './step1-kit.js';
import { sit } from './step1-d.js';
import { birdThing } from './step1-c.js';

const tmp = new THREE.Vector3();

export function dadHome(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.6 * u;
  const dad = createPerson({ u: 1.15 * u, shirt: 0xf0f0f0, pants: 0x303848 }), kid = createPerson({ u: 0.55 * u, shirt: 0xff6a8a });
  const tie = solidProp([[G.box(0.03 * u, 0.14 * u, 0.01 * u, 0, 0, 0), 0xd03030]], 0.5); dad.rig.attach('body', tie, 0.75); tie.position.set(0, 0, 0.12 * u);
  const bag = solidProp([[G.box(0.22 * u, 0.15 * u, 0.06 * u, 0, -0.08 * u, 0), 0x6a4020], [G.torus(0.04 * u, 0.008 * u, Math.PI, 0, 0, 0), 0x404040]], 0.4), hearts = many(HEART(u, 0.1), 3, 0.8);
  group.add(dad.group, kid.group, bag, hearts);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.4, 'out'], run: [1.0, 0.8, 'out'], lift: [1.9, 0.5, 'out'], down: [4.0, 0.5], back: [4.8, 1.2, 'in'] });
      const x = mx + 0.6 * u * (1 - T.walk), walking = T.walk > 0 && T.walk < 1;
      dad.reset().face(T.walk < 1 ? 'left' : 'toward'); if (walking) dad.walk(v * 9, 1);
      const up = T.lift - T.down; dad.raise('L', 2.0 * up); dad.raise('R', 2.0 * up); dad.group.position.set(x, floor, 0); dad.update();
      bonePoint(dad, 'handR', 0.5, tmp); bag.visible = up < 0.5 && !pre; bag.position.set(up < 0.5 ? tmp.x : x + 0.25 * u, up < 0.5 ? tmp.y : floor + 0.08 * u, 0.05 * u);
      const kx = B.maxX + 0.05 * u + (x - 0.15 * u - B.maxX - 0.05 * u) * T.run - 0.6 * u * T.back, running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      kid.reset().face(T.back > 0 ? 'left' : 'right'); if (running) kid.walk(v * 14, 1);
      kid.group.position.set(kx + 0.15 * u * up, floor + 0.65 * u * up, 0.06 * u); kid.raise('L', 2.4 * up); kid.raise('R', 2.4 * up); kid.update(); kid.group.visible = !pre && T.back < 0.98;
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 2.1 + 0.25 * i, 3.4 + 0.25 * i); hearts.set(i, x + (i - 1) * 0.12 * u, floor + 1.3 * u + 0.3 * u * f, 0.1 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

export function mumCook(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.35 * u, px = mx + 0.48 * u;
  const mum = createPerson({ u: 1.05 * u, shirt: 0xe06a8a, hair: 0x5a2a14 }), apron = solidProp([[G.box(0.2 * u, 0.26 * u, 0.02 * u, 0, 0, 0), 0xffffff], [G.box(0.08 * u, 0.06 * u, 0.022 * u, 0, -0.04 * u, 0), 0xffb0c0]], 0.5);
  mum.rig.attach('body', apron, 0.35); apron.position.set(0, 0, 0.12 * u);
  const stove = solidProp([[G.box(0.4 * u, 0.4 * u, 0.3 * u, 0, 0.2 * u, 0), 0xd8dce4], [G.cyl(0.14 * u, 0.11 * u, 0.16 * u, 0, 0.48 * u, 0), 0x404858], [G.cyl(0.14 * u, 0.14 * u, 0.02 * u, 0, 0.56 * u, 0), 0xc86a3a]], 0.4);
  const ladle = solidProp([[G.cyl(0.01 * u, 0.01 * u, 0.3 * u, 0, 0.15 * u, 0), 0x9aa4b4], [G.sphere(0.035 * u, 0, 0, 0, 1, 0.6, 1), 0x9aa4b4]], 0.5), steam = many([[G.sphere(0.04 * u), 0xf0f0f0]], 6, 0.6);
  stove.position.set(px, floor, -0.05 * u);
  group.add(mum.group, stove, ladle, steam);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, taste = pre ? 0 : bump(v, 3.0, 1.6);
      mum.reset().face(0.9); mum.group.position.set(mx, floor, 0.05 * u);
      mum.bone('armR').rotation.x = 1.1 + 0.6 * taste; mum.bone('foreR').rotation.x = 0.4 + 1.2 * taste; mum.bone('armL').rotation.x = 0.3; mum.update();
      const stir = pre ? 0 : v * 5;
      if (taste < 0.2) { ladle.position.set(px + 0.05 * u * Math.cos(stir), floor + 0.5 * u, -0.05 * u + 0.05 * u * Math.sin(stir)); ladle.rotation.set(0, 0, 0.3); }
      else { bonePoint(mum, 'handR', 0.5, tmp); ladle.position.copy(tmp); ladle.rotation.set(0, 0, 0.6 + 1.6 * taste); }
      mum.bone('head').rotation.x = 0.2 - 0.3 * taste; mum.update();
      wisps(steam, 0, 6, px, floor + 0.6 * u, v, u, { period: 1.8, rise: 0.6, sway: 0.05, on: pre ? 0 : 1 }); steam.commit();
    },
  };
}

export function boyPlane(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u;
  const boy = createPerson({ u: 0.75 * u, shirt: 0x3a8ae0, hair: 0x201008 }), plane = solidProp([[G.capsule(0.03 * u, 0.2 * u, 0, 0, 0, Math.PI / 2), 0xe03a3a], [G.box(0.06 * u, 0.008 * u, 0.3 * u, 0.02 * u, 0, 0), 0xffd040], [G.box(0.04 * u, 0.08 * u, 0.008 * u, -0.12 * u, 0.04 * u, 0), 0xffd040]], 0.6), trail = many([[G.sphere(0.015 * u), 0xffffff]], 8, 1.0);
  group.add(boy.group, plane, trail);
  const loop = 5.4, R = 0.35 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, a = pre ? 0 : v * 1.4;
      const x = cx + Math.cos(a) * R, z = Math.sin(a) * R * 0.6;
      boy.reset().face(-a + Math.PI); boy.walk(v * 12, pre ? 0 : 1); boy.raise('R', 2.9); boy.group.position.set(x, floor + 0.02 * u * Math.abs(Math.sin(v * 12)), z); boy.update();
      bonePoint(boy, 'handR', 0.8, tmp); plane.position.copy(tmp).add(new THREE.Vector3(0, 0.05 * u, 0)); plane.rotation.set(0.3 * Math.sin(v * 3), -a + Math.PI, 0.2); plane.visible = !pre;
      for (let i = 0; i < 8; i++) { const b = a - (i + 1) * 0.12; trail.set(i, cx + Math.cos(b) * R, tmp.y + 0.05 * u, Math.sin(b) * R * 0.6, pre ? 0 : 1 - i / 8); }
      trail.commit();
    },
  };
}

export function girlSwing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u, top = floor + 1.0 * u;
  const frame = solidProp([[G.cyl(0.02 * u, 0.02 * u, 1.05 * u, -0.35 * u, 0.5 * u, 0, 0, 0, 0.12), 0xd84a3a], [G.cyl(0.02 * u, 0.02 * u, 1.05 * u, 0.35 * u, 0.5 * u, 0, 0, 0, -0.12), 0xd84a3a], [G.cyl(0.02 * u, 0.02 * u, 0.75 * u, 0, 1.0 * u, 0, 0, 0, Math.PI / 2), 0xd84a3a]], 0.4);
  const pivot = new THREE.Group(), ropes = solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.62 * u, -0.1 * u, -0.31 * u, 0), 0xe0d0b0], [G.cyl(0.006 * u, 0.006 * u, 0.62 * u, 0.1 * u, -0.31 * u, 0), 0xe0d0b0], [G.box(0.26 * u, 0.025 * u, 0.1 * u, 0, -0.62 * u, 0), 0x8a5a30]], 0.4);
  const girl = createPerson({ u: 0.6 * u, shirt: 0xff8a40, hair: 0x5a2a14 }), tails = solidProp([[G.sphere(0.04 * u, -0.09 * u, 0, -0.03 * u, 0.8, 1.6, 0.8), 0x5a2a14], [G.sphere(0.04 * u, 0.09 * u, 0, -0.03 * u, 0.8, 1.6, 0.8), 0x5a2a14]], 0.3);
  girl.rig.attach('head', tails, 0.55); pivot.add(ropes, girl.group); pivot.position.set(sx, top, -0.05 * u); frame.position.set(sx, floor, -0.08 * u);
  group.add(frame, pivot);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, a = pre ? 0 : 0.7 * Math.sin(v * Math.PI * 2 / 2.0) * between(v, 0, 0.8);
      pivot.rotation.x = a;
      girl.reset().face('toward'); sit(girl, 1); girl.group.position.set(0, -0.62 * u - 0.07 * u, 0.0); girl.raise('L', 2.7); girl.raise('R', 2.7); girl.bone('foreL').rotation.z = -0.3; girl.bone('foreR').rotation.z = 0.3;
      for (const s of ['L', 'R']) girl.bone(`shin${s}`).rotation.x = -1.3 + 0.9 * Math.max(0, Math.sin(v * Math.PI)); girl.update();
    },
  };
}

export function telescope(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u;
  const legs = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.5 * u, -0.1 * u, 0.24 * u, 0, 0, 0, 0.3), 0x606878], [G.cyl(0.012 * u, 0.012 * u, 0.5 * u, 0.1 * u, 0.24 * u, 0, 0, 0, -0.3), 0x606878], [G.cyl(0.012 * u, 0.012 * u, 0.5 * u, 0, 0.24 * u, -0.1 * u, 0.3), 0x606878]], 0.4);
  const tubeP = new THREE.Group(), tube = solidProp([[G.cyl(0.05 * u, 0.07 * u, 0.5 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xe8ecf4], [G.cyl(0.072 * u, 0.072 * u, 0.04 * u, 0.25 * u, 0, 0, 0, 0, Math.PI / 2), 0x3a6ad0], [G.cyl(0.06 * u, 0.06 * u, 0.005 * u, 0.272 * u, 0, 0, 0, 0, Math.PI / 2), 0x9ad8ff]], 0.5);
  tubeP.add(tube); tubeP.position.set(tx, floor + 0.5 * u, 0); legs.position.set(tx, floor, 0);
  const stars = many([[G.sphere(0.018 * u), 0xfff6c0]], 10, 1.6), shoot = many([[G.sphere(0.02 * u), 0xffffff]], 6, 1.8);
  group.add(legs, tubeP, stars, shoot);
  const loop = 6.0, S = Array.from({ length: 10 }, (_, i) => [((i * 0.37) % 1), ((i * 0.61) % 1)]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      tubeP.rotation.z = pre ? 0 : 0.2 + 0.6 * between(v, 0.2, 1.4) + 0.1 * Math.sin(v * 0.8) * between(v, 1.4, 2);
      S.forEach(([a, b], i) => stars.set(i, B.maxX + 0.2 * u + a * 1.2 * u, floor + 0.8 * u + b * 0.5 * u, -0.3 * u, 0.6 + 0.6 * Math.abs(Math.sin(t * (1.5 + a * 2) + i))));
      stars.commit();
      const f = pre ? 0 : between(v, 2.2, 3.0);
      for (let i = 0; i < 6; i++) shoot.set(i, B.maxX + 1.3 * u - 1.0 * u * f + i * 0.05 * u, floor + 1.3 * u - 0.35 * u * f + i * 0.018 * u, -0.25 * u, f > 0 && f < 1 ? 1 - i / 6 : 0);
      shoot.commit();
    },
  };
}

export function showDrawing(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.85 * u, shirt: 0xffb030 }), paper = solidProp([[G.box(0.36 * u, 0.28 * u, 0.01 * u, 0, 0, 0), 0xffffff], [G.sphere(0.05 * u, -0.08 * u, 0.06 * u, 0.006 * u, 1, 1, 0.2), 0xffb020], [G.box(0.3 * u, 0.04 * u, 0.004 * u, 0, -0.1 * u, 0.006 * u), 0x50b040], [G.box(0.06 * u, 0.08 * u, 0.004 * u, 0.06 * u, -0.04 * u, 0.006 * u), 0xe04848], [G.cone(0.06 * u, 0.05 * u, 0.06 * u, 0.025 * u, 0.006 * u), 0x8a3a20]], 0.6);
  const stars = many([[G.sphere(0.02 * u), 0xffe060]], 4, 1.4);
  group.add(kid.group, paper, stars);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, up = pre ? 0 : between(v, 0.2, 0.7) * (1 - between(v, 4.3, 4.8)), bounce = 0.03 * u * Math.abs(Math.sin(v * 5)) * up;
      kid.reset().face('toward'); kid.group.position.set(kx, floor + bounce, 0.0);
      for (const s of ['L', 'R']) { kid.bone(`arm${s}`).rotation.x = 1.9 * up; kid.bone(`fore${s}`).rotation.x = 0.4 * up; kid.raise(s, 0.15); }
      kid.update(); bonePoint(kid, 'handL', 0.5, tmp);
      paper.visible = !pre; paper.position.set(kx, tmp.y + 0.08 * u, 0.25 * u * up + 0.1 * u); paper.rotation.z = 0.06 * Math.sin(v * 5) * up;
      for (let i = 0; i < 4; i++) { const f = ((v * 0.8 + i / 4) % 1), a = i * 1.57 + v; stars.set(i, kx + Math.cos(a) * 0.3 * u, tmp.y + 0.1 * u + Math.sin(a) * 0.22 * u, 0.3 * u, up * Math.sin(Math.PI * f)); }
      stars.commit();
    },
  };
}

export function studentWalk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 1.3 * u;
  const s = createPerson({ u: 0.85 * u, shirt: 0x202a48, pants: 0x202a48 }), bag = solidProp([[G.box(0.2 * u, 0.24 * u, 0.12 * u, 0, 0, 0), 0xc02020], [G.box(0.205 * u, 0.1 * u, 0.13 * u, 0, 0.08 * u, 0.0), 0x901818]], 0.45), books = solidProp([[G.box(0.16 * u, 0.04 * u, 0.12 * u, 0, 0, 0), 0x3a7ae0], [G.box(0.15 * u, 0.04 * u, 0.11 * u, 0, 0.04 * u, 0), 0x40b060]], 0.5), cap = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 0.5, 1), 0x202a48], [G.box(0.14 * u, 0.01 * u, 0.1 * u, 0, -0.02 * u, 0.1 * u), 0x101828]], 0.4);
  s.rig.attach('body', bag, 0.6); bag.position.set(0, 0, -0.14 * u); s.rig.attach('head', cap, 0.85);
  group.add(s.group, books);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0, 5.0);
      s.reset().face(-Math.PI / 2 - 0.4); s.walk(v * 9, f < 1 ? 1 : 0); s.bone('armL').rotation.x = 1.1; s.bone('foreL').rotation.x = 1.2;
      s.group.position.set(x0 - 1.0 * u * f, floor, 0.05 * u - 0.35 * u * f); s.group.scale.setScalar(1 - 0.35 * f); s.group.visible = !pre; s.update();
      bonePoint(s, 'handL', 0.3, tmp); books.position.copy(tmp).add(new THREE.Vector3(0, 0.03 * u, 0.04 * u)); books.visible = !pre; books.scale.setScalar(1 - 0.35 * f);
    },
  };
}

export function capsToss(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u;
  const caps = many([[G.box(0.22 * u, 0.015 * u, 0.22 * u, 0, 0.05 * u, 0), 0x202028], [G.cyl(0.07 * u, 0.08 * u, 0.06 * u, 0, 0.02 * u, 0), 0x202028], [G.cyl(0.004 * u, 0.004 * u, 0.1 * u, 0.1 * u, 0.0, 0.1 * u), 0xffd040], [G.sphere(0.015 * u, 0.1 * u, -0.05 * u, 0.1 * u), 0xffd040]], 4, 0.5);
  const confetti = many([[G.box(0.03 * u, 0.03 * u, 0.004 * u), 0xffffff]], 12, 1.0); [0xffd040, 0xff6a9a, 0x40c0ff, 0x60e060].forEach((c, i) => { for (let j = i; j < 12; j += 4) confetti.setColorAt(j, new THREE.Color(c)); });
  group.add(caps, confetti);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      for (let i = 0; i < 4; i++) { const f = pre ? 0 : between(v, 0.2 + 0.1 * i, 2.6 + 0.1 * i), x = cx + (i - 1.5) * 0.25 * u + 0.1 * u * Math.sin(f * 4 + i), y = floor + 0.15 * u + 1.0 * u * 4 * f * (1 - f); caps.set(i, x, y, 0.05 * u * i, pre ? 0 : 1, 0.3 * Math.sin(f * 9 + i), f * 9 + i, 0.4 * Math.sin(f * 7)); }
      caps.commit();
      for (let i = 0; i < 12; i++) { const f = pre ? 0 : between(v, 1.0, 3.6), a = i * 0.52; confetti.set(i, cx + Math.cos(a) * 0.5 * u * f, floor + 0.9 * u + Math.sin(a) * 0.3 * u * f - 0.6 * u * f * f, 0.05 * u, f > 0 && f < 1 ? 1 : 0, v * 5 + i, v * 3); }
      confetti.commit();
    },
  };
}
