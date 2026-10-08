// Step 1 scenes, part F: family and people.
//   dad-shoulders  父: a dad with a moustache lifts his kid up onto his shoulders; the kid cheers, arms up, as he sways.
//                  outcome home: dad comes home with his briefcase and the kid runs to him and is swung up high (お父さん)
//   mum-cradle     母: a mum rocks a baby in her arms, side to side; hearts and a lullaby note rise. outcome cook: mum in an
//                  apron stirs a steaming pot, lifts the ladle and tastes, mm (お母さん)
//   me-me          私: a kid jumps up and down waving one hand high, then points at their own chest: "わたし!" (me!)
//   plough-man     男: a man leans into a plough and drags it through the rice field, a furrow opening behind him.
//                  outcome boy: a boy runs round holding a toy plane up high, zooming (男の子)
//   woman-twirl    女: a woman with long hair and a flower in it twirls round in her dress, the skirt flaring, petals.
//                  outcome girl: a girl swings high on a swing (女の子)
//   binoculars     見: a person lifts binoculars and looks left and right; a bird lands far off, they stop, look, and wave.
//                  outcome stars: a telescope on a stand turns up to the stars and a shooting star streaks past (見る);
//                  show: a kid holds up a drawing to show you, bouncing proudly (見せる)
//   abacus-kid     学: a kid flicks the beads of an abacus, counting, then lifts their hand: got it! outcome backpack:
//                  a student in a cap with a school bag and books walks off to school (学生); caps: graduation caps fly up and spin
//                  down (大学)
//   teacher-bow    先生: a teacher with glasses and a pointer bows; two pupils in front bow back
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
import { dadHome, mumCook, boyPlane, girlSwing, telescope, showDrawing, studentWalk, capsToss } from './step1-fv.js';

const tmp = new THREE.Vector3();
const note = (u) => many([[G.sphere(0.03 * u, 0, 0, 0, 1.2, 1, 0.6), 0xffffff], [G.box(0.01 * u, 0.08 * u, 0.01 * u, 0.026 * u, 0.04 * u, 0), 0xffffff]], 2, 1.0);

// ---- 父 dad ----
function dadShoulders(ctx, spec, stage) {
  if (spec.outcome === 'home') return dadHome(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.55 * u;
  const dad = createPerson({ u: 1.2 * u, shirt: 0x3a6ab0, pants: 0x2a3040 }), kid = createPerson({ u: 0.55 * u, shirt: 0xffa030 });
  const tache = solidProp([[G.sphere(0.05 * u, 0, 0, 0, 1.6, 0.5, 0.6), 0x3a2416]], 0.3); dad.rig.attach('head', tache, 0.42); tache.position.set(0, 0, 0.14 * u);
  group.add(dad.group, kid.group);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [0.2, 0.4], lift: [0.6, 0.9, 'out'], cheer: [1.6, 0.4], down: [4.6, 0.9, 'in'] });
      const up = T.lift - T.down, sway = 0.08 * Math.sin(t * 2.5) * up;
      dad.reset().face('toward'); dad.group.position.set(dx, floor, 0); dad.group.rotation.z = sway * 0.5;
      const reach = Math.max(T.reach * (1 - T.lift), up); dad.raise('L', 2.4 * reach); dad.raise('R', 2.4 * reach); dad.bone('foreL').rotation.z = 0.6 * reach; dad.bone('foreR').rotation.z = -0.6 * reach; dad.update();
      bonePoint(dad, 'head', 1, tmp);
      kid.reset().face('toward'); const ky = floor + (tmp.y - floor + 0.02 * u) * up, kx = dx + 0.32 * u * (1 - up) + (tmp.x - dx) * up;
      kid.group.position.set(kx, ky - 0.18 * u * up, 0.02 * u); sit(kid, up * 0.9);
      const ch = T.cheer * (1 - T.down); kid.raise('L', 2.6 * ch + 0.3 * Math.sin(v * 8) * ch); kid.raise('R', 2.6 * ch - 0.3 * Math.sin(v * 8) * ch); kid.update();
    },
  };
}
// ---- 母 mum ----
function mumCradle(ctx, spec, stage) {
  if (spec.outcome === 'cook') return mumCook(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.5 * u;
  const mum = createPerson({ u: 1.1 * u, shirt: 0xe06a8a, hair: 0x5a2a14 }), hairLong = solidProp([[G.sphere(0.15 * u, 0, -0.07 * u, -0.05 * u, 1, 1.5, 0.8), 0x5a2a14]], 0.3);
  mum.rig.attach('head', hairLong, 0.5);
  const baby = solidProp([[G.sphere(0.11 * u, 0, 0, 0, 1.5, 0.9, 0.9), 0xfff0d8], [G.sphere(0.065 * u, 0.13 * u, 0.03 * u, 0.02 * u), 0xffd8b8], [G.sphere(0.012 * u, 0.15 * u, 0.04 * u, 0.075 * u), 0x404040]], 0.5), hearts = many(HEART(u, 0.1), 3, 0.8), notes = note(u);
  group.add(mum.group, baby, hearts, notes);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rock = pre ? 0 : Math.sin(v * 2.2) * between(v, 0, 0.6);
      mum.reset().face(-0.3); mum.group.position.set(mx, floor, 0); mum.group.rotation.z = 0.06 * rock;
      for (const s of ['L', 'R']) { mum.bone(`arm${s}`).rotation.x = 0.9; mum.bone(`fore${s}`).rotation.x = 1.3; mum.raise(s, 0.25); }
      mum.bone('head').rotation.x = 0.35; mum.bone('head').rotation.z = 0.1 * rock; mum.update();
      bonePoint(mum, 'foreL', 0.6, tmp); baby.position.set((tmp.x + mx) / 2 - 0.02 * u, tmp.y + 0.04 * u, tmp.z + 0.12 * u); baby.rotation.z = 0.25 * rock; baby.visible = !pre;
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : ((v * 0.4 + i / 3) % 1); hearts.set(i, mx + 0.25 * u + 0.1 * u * Math.sin(f * 5 + i), floor + 0.9 * u + 0.5 * u * f, 0.1 * u, Math.sin(Math.PI * f) * 0.9); }
      hearts.commit();
      for (let i = 0; i < 2; i++) { const f = pre ? 0 : ((v * 0.35 + i / 2 + 0.25) % 1); notes.set(i, mx - 0.3 * u - 0.1 * u * f, floor + 1.0 * u + 0.4 * u * f, 0.1 * u, Math.sin(Math.PI * f) * 1.3, 0.3 * Math.sin(f * 8)); }
      notes.commit();
    },
  };
}
// ---- 私 me ----
function meMe(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.95 * u, shirt: 0x40b0e0 }), say = textPlane('わたし!', { h: 0.17 * u, color: '#202838', bg: '#ffffff', pad: 0.3 }), dust = many(PUFF(u), 4, 0.3);
  group.add(kid.group, say, dust);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { jumps: [0.2, 2.0, 'linear'], point: [2.4, 0.3], drop: [4.4, 0.4] });
      const jumping = T.jumps > 0 && T.jumps < 1, hop = jumping ? Math.abs(Math.sin(v * 7)) * 0.2 * u : 0;
      kid.reset().face('toward'); kid.group.position.set(kx, floor + hop, 0.05 * u);
      if (jumping) { kid.raise('R', 2.8); kid.bone('foreR').rotation.z = -0.4 * Math.sin(v * 12); }
      const p = T.point - T.drop; kid.bone('armR').rotation.x = 1.3 * p; kid.bone('foreR').rotation.x = 1.9 * p; kid.bone('armL').rotation.z = 0.2;
      kid.update();
      const k = pre ? 0 : between(v, 2.5, 2.8) * (1 - T.drop); say.visible = k > 0.01; say.scale.setScalar(grow(k)); say.position.set(kx + 0.25 * u, floor + 1.05 * u, 0.06 * u);
    },
  };
}

// ---- 男 man ----
function ploughMan(ctx, spec, stage) {
  if (spec.outcome === 'boy') return boyPlane(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.25 * u;
  const field = solidProp([[G.box(1.5 * u, 0.02 * u, 0.5 * u, 0, 0, 0), 0x5a9a3a]], 0.3), furrow = solidProp([[G.box(1, 0.025 * u, 0.12 * u, 0.5, 0, 0), 0x6a4022]], 0.3);
  const man = createPerson({ u: 1.0 * u, shirt: 0x5a7a9a, pants: 0x5a4030 }), plough = solidProp([[G.box(0.3 * u, 0.03 * u, 0.03 * u, -0.15 * u, 0.2 * u, 0, 0.6), 0x8a5a30], [G.cone(0.05 * u, 0.12 * u, -0.3 * u, 0.04 * u, 0, Math.PI / 2 + 0.6), 0x9aa4b4], [G.box(0.03 * u, 0.15 * u, 0.2 * u, 0, 0.3 * u, 0), 0x8a5a30]], 0.4), sweat = many([[G.sphere(0.02 * u), 0x9ad8ff]], 3, 1);
  field.position.set(x0 + 0.7 * u, floor - 0.01 * u, 0); field.rotation.x = 0.45;
  group.add(field, furrow, man.group, plough, sweat);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.1, 4.6), fade = pre ? 1 : between(v, 5.0, 5.8);
      const x = x0 + 0.35 * u + 0.9 * u * f;
      man.reset().face('right'); man.walk(v * 6, f > 0 && f < 1 ? 0.7 : 0); man.lean(0.45);
      for (const s of ['L', 'R']) { man.bone(`arm${s}`).rotation.x = -0.4; }
      man.group.position.set(x, floor, 0.05 * u); man.update(); man.group.visible = !pre && fade < 1;
      plough.position.set(x - 0.38 * u, floor, 0.05 * u); plough.visible = man.group.visible; plough.rotation.z = 0.04 * Math.sin(v * 12);
      furrow.position.set(x0, floor + 0.005 * u, 0.05 * u); furrow.scale.set(Math.max(1e-3, (x - 0.65 * u - x0)) * (1 - fade), 1, 1); furrow.visible = x - 0.65 * u > x0 && fade < 1;
      for (let i = 0; i < 3; i++) { const g = ((v * 0.8 + i / 3) % 1); sweat.set(i, x + 0.1 * u + 0.1 * u * g, floor + 0.8 * u - 0.2 * u * g * g, 0.1 * u, f > 0.1 && f < 1 ? 1 - g : 0); }
      sweat.commit();
    },
  };
}
// ---- 女 woman ----
function womanTwirl(ctx, spec, stage) {
  if (spec.outcome === 'girl') return girlSwing(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.5 * u;
  const w = createPerson({ u: 1.05 * u, shirt: 0xc04a9a, pants: 0xffd2b0, hair: 0x2a1408 }), hair = solidProp([[G.sphere(0.15 * u, 0, -0.1 * u, -0.06 * u, 1.05, 1.7, 0.7), 0x2a1408], [G.sphere(0.035 * u, 0.12 * u, 0.06 * u, 0.06 * u), 0xffe040], ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.03 * u, 0.12 * u + 0.04 * u * Math.cos(i * 1.257), 0.06 * u + 0.04 * u * Math.sin(i * 1.257), 0.055 * u), 0xff6a9a])], 0.45);
  const skirt = solidProp([[G.cone(0.22 * u, 0.3 * u, 0, -0.15 * u, 0), 0xc04a9a]], 0.45), petals = many([[G.sphere(0.025 * u, 0, 0, 0, 1.2, 0.3, 0.9), 0xff8ab0]], 8, 0.8);
  w.rig.attach('head', hair, 0.5); w.rig.attach('body', skirt, 0.05);
  group.add(w.group, petals);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, spin = pre ? 0 : between(v, 0.5, 3.3), turn = spin * Math.PI * 4;
      w.reset().face(turn); w.group.position.set(wx, floor, 0.05 * u); w.raise('L', 1.4 * (spin > 0 && spin < 1 ? 1 : 0.3)); w.raise('R', 1.4 * (spin > 0 && spin < 1 ? 1 : 0.3)); w.update();
      const flare = spin > 0 && spin < 1 ? 1 : 0; skirt.scale.set(1 + 0.4 * flare, 1 - 0.15 * flare, 1 + 0.4 * flare);
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : ((v * 0.5 + i / 8) % 1), a = i * 0.8 + v; petals.set(i, wx + Math.cos(a) * (0.25 + 0.2 * f) * u, floor + 0.9 * u - 0.7 * u * f, Math.sin(a) * 0.2 * u, Math.sin(Math.PI * f), a * 2); }
      petals.commit();
    },
  };
}
// ---- 見 see ----
function binoculars(ctx, spec, stage) {
  if (spec.outcome === 'stars') return telescope(ctx, spec, stage);
  if (spec.outcome === 'show') return showDrawing(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0x6a9a3a }), bino = solidProp([[G.cyl(0.035 * u, 0.04 * u, 0.12 * u, -0.045 * u, 0, 0.06 * u, Math.PI / 2), 0x202028], [G.cyl(0.035 * u, 0.04 * u, 0.12 * u, 0.045 * u, 0, 0.06 * u, Math.PI / 2), 0x202028], [G.cyl(0.03 * u, 0.03 * u, 0.005 * u, -0.045 * u, 0, 0.125 * u, Math.PI / 2), 0x9ad8ff], [G.cyl(0.03 * u, 0.03 * u, 0.005 * u, 0.045 * u, 0, 0.125 * u, Math.PI / 2), 0x9ad8ff]], 0.5);
  p.rig.attach('head', bino, 0.5); bino.position.set(0, 0, 0.1 * u);
  const branch = solidProp([[G.cyl(0.015 * u, 0.02 * u, 0.35 * u, 0, 0, 0, 0, 0, Math.PI / 2 - 0.2), 0x7a4a24], [G.sphere(0.06 * u, 0.15 * u, 0.04 * u, 0), 0x3aa040]], 0.4), bird = birdThing(0.22 * u), bang = textPlane('!', { h: 0.22 * u, color: '#ffe040', weight: 900 });
  branch.position.set(px + 0.85 * u, floor + 0.85 * u, -0.3 * u);
  group.add(p.group, branch, bird, bang);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0, 0.4], scan: [0.4, 2.0, 'linear'], land: [1.6, 0.8, 'out'], spot: [2.4, 0.3, 'back'], wave: [3.2, 1.2], down: [4.6, 0.4], fly: [4.8, 0.9, 'in'] });
      p.reset().face(0.5 + 0.5 * Math.sin(T.scan * Math.PI * 2) * (1 - T.spot) + 0.35 * T.spot); p.group.position.set(px, floor, 0.05 * u);
      const l = T.lift - T.down; for (const s of ['L', 'R']) { p.bone(`arm${s}`).rotation.x = 1.2 * l; p.bone(`fore${s}`).rotation.x = 1.6 * l; p.raise(s, 0.4 * l); }
      if (T.wave > 0 && T.wave < 1) { p.raise('R', 2.6); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 10); p.bone('armR').rotation.x = 0; }
      p.bone('head').rotation.x = -0.15 * l; p.update(); bino.visible = l > 0.3;
      const bx = px + 0.88 * u + 0.6 * u * (1 - T.land) + 0.8 * u * T.fly, by = floor + 0.9 * u + 0.4 * u * (1 - T.land) + 0.5 * u * T.fly;
      bird.visible = !pre && T.land > 0 && T.fly < 1; bird.position.set(bx, by, -0.28 * u); bird.rotation.y = T.fly > 0 ? 0 : Math.PI;
      const k = pre ? 0 : T.spot * (1 - T.wave); bang.visible = k > 0.01; bang.scale.setScalar(grow(k)); bang.position.set(px + 0.1 * u, floor + 1.15 * u, 0.06 * u);
    },
  };
}
// ---- 学 study ----
function abacusKid(ctx, spec, stage) {
  if (spec.outcome === 'backpack') return studentWalk(ctx, spec, stage);
  if (spec.outcome === 'caps') return capsToss(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.3 * u, ax = kx + 0.45 * u, ay = floor + 0.5 * u;
  const kid = createPerson({ u: 0.8 * u, shirt: 0x3a7ae0 }), frame = solidProp([[G.box(0.5 * u, 0.03 * u, 0.04 * u, 0, 0.14 * u, 0), 0x6a3a1a], [G.box(0.5 * u, 0.03 * u, 0.04 * u, 0, -0.14 * u, 0), 0x6a3a1a], [G.box(0.5 * u, 0.02 * u, 0.04 * u, 0, 0.06 * u, 0), 0x6a3a1a], ...[-0.24, 0.24].map((x) => [G.box(0.03 * u, 0.31 * u, 0.04 * u, x * u, 0, 0), 0x6a3a1a]), ...[-0.15, -0.075, 0, 0.075, 0.15].map((x) => [G.cyl(0.004 * u, 0.004 * u, 0.28 * u, x * u, 0, 0), 0xc8b090])], 0.4);
  const beads = many([[G.sphere(0.03 * u, 0, 0, 0, 1.2, 0.7, 1.2), 0xe05a3a]], 15, 0.5), bulb = solidProp([[G.sphere(0.07 * u, 0, 0.03 * u, 0), 0xfff080], [G.cyl(0.03 * u, 0.03 * u, 0.04 * u, 0, -0.04 * u, 0), 0xa8acb4]], 1.2), table = solidProp([[G.box(0.6 * u, 0.04 * u, 0.3 * u, 0, 0.32 * u, 0), 0xc89a60], [G.box(0.04 * u, 0.32 * u, 0.04 * u, -0.25 * u, 0.16 * u, 0), 0xa87a40], [G.box(0.04 * u, 0.32 * u, 0.04 * u, 0.25 * u, 0.16 * u, 0), 0xa87a40]], 0.35);
  frame.position.set(ax, ay, 0.05 * u); frame.rotation.x = -0.2; table.position.set(ax, floor, -0.05 * u);
  group.add(table, kid.group, frame, beads, bulb);
  const loop = 6.0, rods = [-0.15, -0.075, 0, 0.075, 0.15];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      kid.reset().face(0.9); kid.group.position.set(kx, floor, 0.12 * u);
      const flick = pre ? 0 : Math.floor(between(v, 0.3, 3.3) * 6);
      kid.bone('armR').rotation.x = 1.3; kid.bone('foreR').rotation.x = 0.5 + 0.3 * Math.abs(Math.sin(v * 6)) * (v < 3.3 ? 1 : 0);
      const ok = pre ? 0 : between(v, 3.6, 3.9) * (1 - between(v, 5.3, 5.6)); kid.raise('L', 2.7 * ok); kid.update();
      rods.forEach((x, r) => { for (let b = 0; b < 3; b++) { const moved = r * 3 + b < flick * 2.5; beads.set(r * 3 + b, ax + x * u, ay - 0.1 * u + b * 0.055 * u + (moved ? 0.04 * u : 0) + (b === 2 ? 0.07 * u : 0), 0.07 * u, 1); } });
      beads.commit();
      bulb.visible = ok > 0.01; bulb.scale.setScalar(grow(ok)); bulb.position.set(kx, floor + 1.05 * u, 0.12 * u);
    },
  };
}
// ---- 先生 teacher ----
function teacherBow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.75 * u;
  const teacher = createPerson({ u: 1.15 * u, shirt: 0x7a5aa0, pants: 0x303040 }), glasses = solidProp([[G.torus(0.035 * u, 0.008 * u, Math.PI * 2, -0.045 * u, 0, 0), 0x202020], [G.torus(0.035 * u, 0.008 * u, Math.PI * 2, 0.045 * u, 0, 0), 0x202020], [G.box(0.02 * u, 0.006 * u, 0.006 * u, 0, 0, 0), 0x202020]], 0.4);
  teacher.rig.attach('head', glasses, 0.5); glasses.position.set(0, 0, 0.14 * u);
  const pointer = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.4 * u, 0, 0.2 * u, 0), 0xc89a60]], 0.4), kids = [0xff8a40, 0x40b0e0].map((c) => createPerson({ u: 0.55 * u, shirt: c }));
  teacher.rig.attach('handR', pointer, 0.5); pointer.rotation.x = Math.PI / 2;
  group.add(teacher.group, ...kids.map((k) => k.group));
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, bow = pre ? 0 : bump(v, 0.5, 1.4), bowK = pre ? 0 : bump(v, 1.4, 1.5);
      teacher.reset().face(-0.9); teacher.group.position.set(tx, floor, -0.1 * u); teacher.lean(0.7 * bow); teacher.bone('armR').rotation.x = 0.4; teacher.update();
      kids.forEach((k, i) => { k.reset().face(Math.PI / 2 + 0.6); k.group.position.set(B.maxX + (0.2 + 0.25 * i) * u, floor, 0.12 * u - 0.1 * u * i); k.lean(0.8 * bowK); k.update(); });
    },
  };
}

export const SCENES = { 'dad-shoulders': dadShoulders, 'mum-cradle': mumCradle, 'me-me': meMe, 'plough-man': ploughMan, 'woman-twirl': womanTwirl, binoculars, 'abacus-kid': abacusKid, 'teacher-bow': teacherBow };
