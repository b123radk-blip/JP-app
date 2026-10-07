// Batch 5 kanji, part 2.
//   banana-trip    転: a person walking along steps on a banana peel, flips head over heels and lands sitting, stars
//                  circling their head
//   sick-bed       病: a pale person lies in bed with a red nose and an ice bag on the forehead, sneezing; pills beside
//   ambulance      院: an ambulance with a flashing light pulls up at a building with a red cross; its doors slide open
//   walk-far       遠: a person waves goodbye and walks away down a long road towards far mountains, smaller and smaller
//   mirror-dance   同: two people side by side do exactly the same jumping jacks at the same time; an "=" glows above
//   wedding        夫: a groom in a suit and a bride in white face each other; rings float to them; confetti and a heart
import * as THREE from 'three';
import { doctor, germs } from './variants5a.js';
import { cardMatch, telescope } from './variants5b.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, stars, heart, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, puffs } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function bananaTrip(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.2 * u, bx = B.maxX + 0.6 * u, pu = 0.75 * u, hip = 0.39 * pu;
  const peel = solidProp([[G.sphere(0.05 * u, 0, 0.015 * u, 0, 1.6, 0.4, 1), 0xffe040], ...[-0.7, 0, 0.7].map((a) => [G.sphere(0.035 * u, Math.sin(a) * 0.08 * u, 0.012 * u, Math.cos(a) * 0.06 * u, 1.8, 0.25, 0.7), 0xf0d030])], 0.5);
  peel.position.set(bx, floor, 0.12 * u);
  const p = createPerson({ u: pu, shirt: 0x40a0e0 }), pivot = new THREE.Group(); pivot.add(p.group); p.group.position.y = -hip;
  const dizzy = stars(u, { r: 0.12, s: 0.07, n: 3 });
  group.add(peel, pivot, dizzy);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.0], flip: [1.0, 0.7, 'smooth'], up: [3.8, 0.5], out: [4.4, 0.4] });
      const sit = T.flip >= 1 ? 1 - T.up : 0, x = T.flip > 0 ? lerp(bx, bx + 0.3 * u, T.flip) : lerp(x0, bx, T.walk);
      p.reset().face('right').walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0);
      if (T.flip > 0 && T.flip < 1) { p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.2; p.raise('L', 2.4); p.raise('R', 2.4); }
      if (sit > 0) { p.bone('body').position.y = -0.36 * pu * sit; p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.5 * sit; p.raise('L', 0.6 * sit); p.raise('R', 0.6 * sit); p.bone('head').rotation.z = 0.2 * Math.sin(v * 4) * sit; }
      pivot.position.set(x, floor + hip + 0.3 * u * Math.sin(Math.PI * T.flip), 0.1 * u); pivot.rotation.z = Math.PI * 2 * T.flip; pivot.scale.setScalar(pop(pre ? 1 : 1 - T.out)); p.update();
      const d = sit > 0.5 ? 1 : 0; dizzy.visible = d > 0; dizzy.position.set(x + 0.02 * u, floor + 0.62 * pu - 0.36 * pu, 0.1 * u); dizzy.rotation.y = t * 4;
    },
  };
}

function sickBed(ctx, spec, stage) {
  if (spec.outcome === 'germs') return germs(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.55 * u, top = floor + 0.24 * u, pu = 0.7 * u;
  const bed = solidProp([[G.box(0.8 * u, 0.2 * u, 0.34 * u, 0, 0.1 * u, 0), 0x8a5a30], [G.box(0.78 * u, 0.06 * u, 0.32 * u, 0, 0.21 * u, 0), 0xf4f4f4], [G.box(0.04 * u, 0.36 * u, 0.34 * u, -0.4 * u, 0.18 * u, 0), 0x6a4020], [G.box(0.16 * u, 0.06 * u, 0.26 * u, -0.3 * u, 0.27 * u, -0.02 * u), 0xffffff], [G.box(0.5 * u, 0.1 * u, 0.3 * u, 0.12 * u, 0.28 * u, 0.04 * u), 0x9ad0f0]], 0.35);
  bed.position.set(bx, floor, 0);
  const p = createPerson({ u: pu, shirt: 0x9ad0f0, skin: 0xd8e8b8 }), nose = solidProp([[G.sphere(0.025 * u), 0xff3030]], 0.8), ice = solidProp([[G.sphere(0.06 * u, 0, 0, 0, 1.4, 0.5, 1), 0x6ab8f0]], 0.6);
  p.rig.attach('head', nose, 0.5).position.z = 0.13 * pu; p.rig.attach('head', ice, 0.95).position.z = 0.03 * pu;
  const achoo = many(PUFF(u, 0xe0f0e0), 6, 0.5), pills = emblemProp('pill', 0.18 * u), table = solidProp([[G.box(0.16 * u, 0.26 * u, 0.16 * u, 0, 0.13 * u, 0), 0xa86a38]], 0.3);
  table.position.set(bx - 0.55 * u, floor, 0.0); pills.position.set(bx - 0.55 * u, floor + 0.33 * u, 0.02 * u);
  group.add(bed, p.group, achoo, pills, table);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, sneeze = pre ? 0 : bump(v, 1.6, 0.6), shiver = 0.02 * Math.sin(t * 25);
      p.reset().face('toward'); p.group.rotation.set(0, 0, Math.PI / 2 - 0.25 * sneeze + shiver); p.group.position.set(bx + 0.3 * u, top + 0.08 * u, 0.0); p.update();
      const hx = bx - 0.3 * u + 0.05 * u, hy = top + 0.12 * u + 0.12 * u * sneeze;
      puffs(achoo, 0, 6, hx - 0.1 * u, hy, between(v, 1.75, 2.4), u, 0.35); achoo.commit();
      pills.idle(t);
    },
  };
}

function ambulance(ctx, spec, stage) {
  if (spec.outcome === 'doctor') return doctor(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u, W = 0.6 * u, H = 0.6 * u;
  const hosp = solidProp([[G.box(W, H, 0.3 * u, 0, H / 2, 0), 0xf4f4f8], [G.box(0.2 * u, 0.2 * u, 0.01 * u, 0, H - 0.14 * u, 0.151 * u), 0xffffff], [G.box(0.14 * u, 0.04 * u, 0.012 * u, 0, H - 0.14 * u, 0.153 * u), 0xe02020], [G.box(0.04 * u, 0.14 * u, 0.012 * u, 0, H - 0.14 * u, 0.153 * u), 0xe02020], [G.box(0.26 * u, 0.24 * u, 0.008 * u, 0, 0.12 * u, 0.15 * u), 0x203048], ...[-0.22, 0.22].map((x) => [G.box(0.1 * u, 0.08 * u, 0.008 * u, x * u, 0.32 * u, 0.151 * u), 0x8ad0ff])], 0.35);
  hosp.position.set(hx, floor, -0.2 * u);
  const door = (s) => { const m = solidProp([[G.box(0.13 * u, 0.24 * u, 0.012 * u, 0, 0.12 * u, 0), 0xb8e0f0]], 0.5); return m; }, dL = door(-1), dR = door(1);
  const van = solidProp([[G.box(0.5 * u, 0.24 * u, 0.26 * u, 0, 0.17 * u, 0), 0xffffff], [G.box(0.14 * u, 0.16 * u, 0.25 * u, -0.31 * u, 0.13 * u, 0), 0xffffff], [G.box(0.1 * u, 0.08 * u, 0.252 * u, -0.32 * u, 0.17 * u, 0), 0x203048], [G.box(0.64 * u, 0.03 * u, 0.262 * u, -0.07 * u, 0.11 * u, 0), 0xe02020], [G.box(0.1 * u, 0.03 * u, 0.004 * u, 0.05 * u, 0.2 * u, 0.132 * u), 0xe02020], [G.box(0.03 * u, 0.1 * u, 0.004 * u, 0.05 * u, 0.2 * u, 0.132 * u), 0xe02020], ...[-0.25, 0.15].map((x) => [G.cyl(0.05 * u, 0.05 * u, 0.27 * u, x * u, 0.05 * u, 0, Math.PI / 2), 0x202024])], 0.4);
  const light = solidProp([[G.box(0.12 * u, 0.04 * u, 0.06 * u, 0, 0, 0), 0xffffff]], 1.0);
  group.add(hosp, dL, dR, van, light);
  const loop = 5.2, red = new THREE.Color(0xff2020), blue = new THREE.Color(0x3060ff);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0, 1.2, 'out'], open: [1.5, 0.4], shut: [3.6, 0.4], out: [4.1, 1.0, 'in'] });
      const vx = hx + 0.25 * u + 1.0 * u * (1 - T.in) + 1.1 * u * T.out; van.position.set(vx, floor, 0.25 * u); van.visible = T.out < 0.95; light.position.set(vx + 0.05 * u, floor + 0.31 * u, 0.25 * u); light.visible = van.visible;
      light.material.color.copy(Math.floor(t * 4) % 2 ? red : blue);
      const o = T.open - T.shut; dL.position.set(hx - 0.065 * u - 0.12 * u * o, floor, -0.04 * u); dR.position.set(hx + 0.065 * u + 0.12 * u * o, floor, -0.04 * u);
    },
  };
}

function walkFar(ctx, spec, stage) {
  if (spec.outcome === 'scope') return telescope(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, rx = B.maxX + 0.55 * u, HZ = 0.5 * u;
  const trap = new THREE.Shape(); trap.moveTo(-0.26 * u, 0); trap.lineTo(0.26 * u, 0); trap.lineTo(0.015 * u, HZ); trap.lineTo(-0.015 * u, HZ); trap.lineTo(-0.26 * u, 0);
  const land = solidProp([[new THREE.PlaneGeometry(1.2 * u, HZ).translate(0, HZ / 2, -0.01 * u), 0x6aaa4a], [new THREE.ShapeGeometry(trap), 0xd8c098], ...[-0.35, -0.1, 0.25].map((x, i) => [G.cone(0.14 * u, 0.16 * u, x * u, HZ + 0.07 * u, -0.02 * u), i % 2 ? 0x7a8ab8 : 0x5a6a9a])], 0.35);
  land.position.set(rx, floor, -0.1 * u);
  const p = createPerson({ u: 0.75 * u, shirt: 0xe04848 });
  group.add(land, p.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { go: [1.2, 3.6, 'out'], back: [5.0, 0.4] }), w = bump(v, 0.1, 1.1), g = T.go;
      p.reset().face(w > 0 ? 0.3 : Math.PI).walk(v * 8, g > 0 && g < 1 ? 1 : 0); p.raise('R', 2.6 * w + 0.3 * Math.sin(v * 10) * w);
      const k = g >= 1 ? T.back : 1 - 0.94 * g; p.group.position.set(rx, floor + (g >= 1 ? 0 : HZ * 0.92 * g), 0.0); p.group.scale.setScalar(pop(k)); p.update();
    },
  };
}

function mirrorDance(ctx, spec, stage) {
  if (spec.outcome === 'match') return cardMatch(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u;
  const P = [createPerson({ u: 0.75 * u, shirt: 0xe07ab0 }), createPerson({ u: 0.75 * u, shirt: 0x40a0e0 })], eq = emblemProp('equals', 0.28 * u, { color: 0xffe040 });
  group.add(...P.map((p) => p.group), eq);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, j = pre ? 0 : Math.max(0, Math.sin(v * Math.PI * 2)), clap = pre ? 0 : bump(v, 3.2, 0.6);
      P.forEach((p, i) => {
        p.reset().face(0); p.raise('L', 2.7 * j); p.raise('R', 2.7 * j); p.bone('legL').rotation.z = 0.3 * j; p.bone('legR').rotation.z = -0.3 * j;
        if (clap > 0) { p.raise('L', 0); p.raise('R', 0); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.5 * clap; p.bone('armL').rotation.z = -0.4 * clap; p.bone('armR').rotation.z = 0.4 * clap; }
        p.group.position.set(cx + (i ? 0.25 : -0.25) * u, floor + 0.08 * u * j, 0.1 * u); p.update();
      });
      const e = pre ? 1 : 0.8 + 0.2 * j; eq.scale.setScalar(0.28 * u * e); eq.position.set(cx, floor + 0.95 * u, 0.1 * u); eq.idle(t);
    },
  };
}

function wedding(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u, pu = 0.85 * u;
  const groom = createPerson({ u: pu, shirt: 0x1a1a24, pants: 0x1a1a24 }), bride = createPerson({ u: 0.8 * u, shirt: 0xffffff, pants: 0xffffff });
  const tie = solidProp([[G.box(0.07 * pu, 0.08 * pu, 0.01 * pu, 0, -0.04 * pu, 0), 0xffffff], [G.box(0.06 * pu, 0.025 * pu, 0.015 * pu, 0, -0.01 * pu, 0.006 * pu), 0x1a1a24]], 0.4);
  groom.rig.attach('body', tie, 0.95).position.z = 0.1 * pu;
  const k = 0.8 * u, skirt = solidProp([[G.cone(0.2 * k, 0.4 * k, 0, -0.18 * k, 0), 0xffffff]], 0.5), veil = solidProp([[G.sphere(0.14 * k, 0, 0, -0.03 * k, 1.1, 1.2, 0.9), 0xf4f4ff], [G.torus(0.1 * k, 0.012 * k).rotateX(Math.PI / 2), 0xffd0e0]], 0.5);
  bride.rig.attach('body', skirt, 0.1); bride.rig.attach('head', veil, 0.7);
  const rings = many([[G.torus(0.025 * u, 0.007 * u), 0xffd040]], 2, 0.9), confetti = many([[G.box(0.02 * u, 0.012 * u, 0.004 * u, 0, 0, 0), 0xffffff]], 14, 0.8), hrt = heart(u, { s: 0.16 });
  const PAL = [0xff6a9a, 0xffe040, 0x40c8f0, 0x60e080]; for (let i = 0; i < 14; i++) confetti.setColorAt(i, new THREE.Color(PAL[i % 4]));
  group.add(groom.group, bride.group, rings, confetti, hrt);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { ring: [0.5, 0.9], turn: [2.2, 0.4], back: [4.6, 0.4] }), face = T.turn - T.back;
      groom.reset().face(lerp(1.2, 0.3, face)); bride.reset().face(lerp(-1.2, -0.3, face)); groom.bone('armR').rotation.x = bride.bone('armL').rotation.x = 0.9 * bump(v, 0.4, 1.6);
      if (face > 0.5) { groom.raise('L', 2.4 * bump(v, 2.6, 1.6)); bride.raise('R', 2.4 * bump(v, 2.6, 1.6)); }
      groom.group.position.set(cx - 0.17 * u, floor, 0.1 * u); bride.group.position.set(cx + 0.17 * u, floor, 0.1 * u); groom.update(); bride.update();
      for (let i = 0; i < 2; i++) { const [x, y] = arc([cx, floor + 1.0 * u], [cx + (i ? 0.08 : -0.08) * u, floor + 0.42 * u], 0.1 * u, T.ring); rings.set(i, x, y, 0.2 * u, !pre && T.ring > 0 && T.ring < 1 ? 1 : 0, 0, v * 4); }
      rings.commit();
      for (let i = 0; i < 14; i++) { const f = ((v * 0.4 + i / 14) % 1 + 1) % 1, on = !pre && v > 1.5 && v < 4.8; confetti.set(i, cx + (((i * 37) % 13) / 13 - 0.5) * 0.9 * u, floor + 1.2 * u - 1.1 * u * f, 0.2 * u * Math.sin(i), on ? 1 : 0, v * 3 + i, v * 2 + i); }
      confetti.commit();
      const h = pre ? 0 : bump(v, 1.4, 1.6); hrt.visible = h > 0; hrt.scale.setScalar(pop(h)); hrt.position.set(cx, floor + 0.95 * u + 0.1 * u * h, 0.1 * u);
    },
  };
}

export const SCENES = { 'banana-trip': bananaTrip, 'sick-bed': sickBed, ambulance, 'walk-far': walkFar, 'mirror-dance': mirrorDance, wedding };
