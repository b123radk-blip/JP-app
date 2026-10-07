// Batch 4 word variants, part 1 (same scene type as their kanji, another `outcome`):
//   brick-build:tower    建物: floor after floor drops onto a tall building; then its windows light up
//   bag-carry:balloon    持つ: a kid holds a balloon by its string; gusts tug at it and the kid holds on tight
//   car-cross:scramble   交差点: a crossroads with zebra crossings and walk lights; two people cross it corner to corner
//   turn-around:across   向こう: someone on this bank of a river waves to a friend on the other side, who waves back
//   stand-up:toddler     立つ: a toddler pushes up off the floor, wobbles, stands with arms out (sparkles), then sits back down
//   shop-counter:cafe    喫茶店: at a little café table a waiter brings a steaming coffee and a slice of cake on a tray
//   phone-charge:water   要る: a person wilting in the sun sees a water bottle "!", grabs it and drinks, and perks up
//   projector:popcorn    映画: the audience sits in a row of red seats watching a flickering screen; popcorn pops
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst, PUFF, DROP } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, beam, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), ROAD = 0x3a3c44, S = 0x1a1a24;

export function towerRise(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.4 * u, N = 6, FH = 0.15 * u, W = 0.4 * u;
  const floors = many([[G.box(W, FH * 0.96, 0.3 * u, 0, 0, 0), 0x8a96b0], [G.box(W * 0.84, FH * 0.45, 0.004 * u, 0, 0, 0.151 * u), 0xffffff]], N, 0.45);
  const roof = solidProp([[G.box(W * 1.04, 0.03 * u, 0.32 * u, 0, 0, 0), 0x5a6478], [G.cyl(0.006 * u, 0.006 * u, 0.2 * u, 0.1 * u, 0.1 * u, 0), 0xc8ccd4], [G.sphere(0.015 * u, 0.1 * u, 0.2 * u, 0), 0xff3030]], 0.5);
  group.add(floors, roof);
  const loop = 5.0, dark = new THREE.Color(0x3a4a6a), lit = new THREE.Color(0xffe080);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.4, 4.9);
      let top = floor;
      for (let i = 0; i < N; i++) { const f = pre ? 1 : timeline(v, { f: [0.1 + 0.35 * i, 0.3, 'bounce'] }).f, y = floor + FH * (i + 0.5) + 0.6 * u * (1 - f); floors.set(i, tx, y, 0, f > 0 ? 1 - out : 0); if (f > 0) top = Math.max(top, y + FH / 2); floors.setColorAt(i, !pre && v > 2.4 + 0.12 * i && v < 4.4 ? lit : dark); }
      floors.commit(); floors.instanceColor.needsUpdate = true;
      roof.visible = pre || (v > 2.2 && out < 1); roof.position.set(tx, top + 0.015 * u, 0); roof.scale.setScalar(pop(1 - out));
    },
  };
}

export function balloonHold(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const kid = createPerson({ u: 0.7 * u, shirt: 0x60b060 }), balloon = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 1.15, 1), 0xe03040], [G.cone(0.02 * u, 0.03 * u, 0, -0.15 * u, 0, Math.PI), 0xe03040]], 0.6);
  const string = solidProp([[G.cyl(0.004 * u, 0.004 * u, 1, 0, 0.5, 0), 0xf4f4f4]], 0.4), wind = many([[G.box(0.2 * u, 0.008 * u, 0.008 * u, 0, 0, 0), 0xe8f4ff]], 4, 0.8);
  group.add(kid.group, balloon, string, wind);
  const loop = 5.0, hand = new THREE.Vector3(), knot = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, gust = pre ? 0 : Math.max(bump(v, 1.0, 1.2), bump(v, 2.8, 1.2)), sway = 0.08 * Math.sin(t * 2);
      kid.reset().face(0.3); kid.bone('armR').rotation.x = 1.6 + 0.6 * gust; kid.bone('armL').rotation.x = 1.4 * gust; kid.lean(-0.25 * gust); kid.group.position.set(px - 0.04 * u * gust, floor, 0.1 * u); kid.update();
      bonePoint(kid, 'handR', 0.7, hand);
      const bx = hand.x + 0.1 * u + 0.35 * u * gust + 0.05 * u * Math.sin(t * 1.3), by = hand.y + 0.45 * u - 0.12 * u * gust;
      balloon.position.set(bx, by, hand.z); balloon.rotation.z = -0.4 * gust + sway; knot.set(bx, by - 0.17 * u, hand.z);
      beam(string, hand, knot);
      for (let i = 0; i < 4; i++) { const f = ((v * 1.5 + i / 4) % 1 + 1) % 1; wind.set(i, px - 0.6 * u + 1.3 * u * f, floor + (0.4 + 0.12 * i) * u, 0.15 * u, gust > 0.2 ? gust : 0); }
      wind.commit();
    },
  };
}

export function scramble(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.65 * u;
  const zebra = (x, z, alongX) => Array.from({ length: 5 }, (_, i) => [alongX ? G.box(0.025 * u, 0.004 * u, 0.24 * u, x + (i - 2) * 0.05 * u, 0.023 * u, z) : G.box(0.24 * u, 0.004 * u, 0.025 * u, x, 0.023 * u, z + (i - 2) * 0.05 * u), 0xf4f4f4]);
  const roads = solidProp([[G.box(1.4 * u, 0.02 * u, 0.32 * u, 0, 0.01 * u, 0), ROAD], [G.box(0.32 * u, 0.021 * u, 1.1 * u, 0, 0.011 * u, 0), ROAD], ...zebra(-0.24 * u, 0, true), ...zebra(0.24 * u, 0, true), ...zebra(0, -0.24 * u, false), ...zebra(0, 0.24 * u, false), [G.box(0.07 * u, 0.004 * u, 0.07 * u, 0, 0.023 * u, 0), 0xf4f4f4]], 0.3);
  const poles = solidProp([[-1, -1], [1, 1]].flatMap(([a, b]) => [[G.cyl(0.01 * u, 0.01 * u, 0.4 * u, a * 0.24 * u, 0.2 * u, b * 0.22 * u), 0x60646c], [G.box(0.06 * u, 0.1 * u, 0.04 * u, a * 0.24 * u, 0.42 * u, b * 0.22 * u), 0x202428], [G.sphere(0.018 * u, a * 0.24 * u, 0.42 * u, b * 0.22 * u + 0.022 * u), 0x30e060]]), 0.6);
  const tilt = new THREE.Group(), P = [createPerson({ u: 0.3 * u, shirt: 0xe04848 }), createPerson({ u: 0.3 * u, shirt: 0x40a0e0 })];
  tilt.add(roads, poles, ...P.map((p) => p.group)); tilt.position.set(cx, floor + 0.15 * u, 0); tilt.rotation.x = 0.55; group.add(tilt);
  const loop = 4.8, path = [[[-0.3, -0.3], [0.3, 0.3]], [[0.3, -0.3], [-0.3, 0.3]]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      P.forEach((p, i) => {
        const f = pre ? 0.2 : between(v, 0.3 + 0.2 * i, 3.6 + 0.2 * i), [[ax, az], [bx, bz]] = path[i], x = lerp(ax, bx, f) * u, z = lerp(az, bz, f) * u;
        p.reset().face(Math.atan2(bx - ax, bz - az)).walk(v * 9, f > 0 && f < 1 ? 1 : 0); p.group.position.set(x, 0.022 * u, z); p.group.visible = pre || (f > 0 && f < 1); p.update();
      });
    },
  };
}

export function acrossRiver(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u;
  const land = solidProp([[G.box(1.4 * u, 0.04 * u, 0.4 * u, 0, -0.02 * u, 0.35 * u), 0x6aaa4a], [G.box(1.4 * u, 0.02 * u, 0.5 * u, 0, -0.03 * u, -0.1 * u), 0x2a8ad8], [G.box(1.4 * u, 0.04 * u, 0.5 * u, 0, -0.02 * u, -0.6 * u), 0x6aaa4a], [G.cone(0.08 * u, 0.25 * u, 0.4 * u, 0.12 * u, -0.7 * u), 0x2f7a2f], [G.cone(0.08 * u, 0.25 * u, -0.3 * u, 0.12 * u, -0.75 * u), 0x2f7a2f]], 0.35);
  land.position.set(cx, floor, 0);
  const me = createPerson({ u: 0.75 * u, shirt: 0xe04848 }), you = createPerson({ u: 0.75 * u, shirt: 0x40a0e0 }), ripples = many([[G.torus(0.06 * u, 0.006 * u).rotateX(Math.PI / 2), 0xa8dcff]], 3, 0.8);
  group.add(land, me.group, you.group, ripples);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w1 = pre ? 0 : bump(v, 0.4, 1.8), w2 = pre ? 0 : bump(v, 1.4, 2.4);
      me.reset().face(Math.PI - 0.4); me.raise('R', 2.7 * w1 + 0.3 * Math.sin(v * 10) * w1); me.group.position.set(cx - 0.3 * u, floor, 0.4 * u); me.update();
      you.reset().face(0.3); you.raise('L', 2.7 * w2 + 0.3 * Math.sin(v * 10 + 1) * w2); you.group.position.set(cx + 0.35 * u, floor, -0.6 * u); you.update();
      for (let i = 0; i < 3; i++) { const f = ((t * 0.4 + i / 3) % 1); ripples.set(i, cx + (i - 1) * 0.4 * u, floor - 0.015 * u, -0.1 * u, 0.5 + 1.5 * f); }
      ripples.commit();
    },
  };
}

export function toddler(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, pu = 0.5 * u;
  const baby = createPerson({ u: pu, shirt: 0xffb0d0, pants: 0xffffff }), stars = burst(u, { s: 0.3, n: 6, color: 0xffe040 }), rug = solidProp([[G.cyl(0.3 * u, 0.3 * u, 0.01 * u, 0, 0.005 * u, 0, 0, 0, 0, 28).scale(1, 1, 0.5), 0x8ad0a0]], 0.4);
  rug.position.set(px, floor, 0.1 * u);
  group.add(rug, baby.group, stars);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { up: [0.5, 1.0, 'smooth'], sit: [3.8, 0.4, 'in'] }), up = pre ? 0 : T.up - T.sit, sit = 1 - up;
      const wob = up > 0.5 ? 0.15 * Math.sin(v * 9) * (1 - between(v, 2.0, 3.0) * 0.6) : 0;
      baby.reset().face(-0.3); baby.bone('body').position.y = -0.36 * pu * sit; baby.bone('legL').rotation.x = baby.bone('legR').rotation.x = 1.5 * sit; baby.bone('body').rotation.z = wob; baby.lean(0.6 * bump(up, 0, 1));
      baby.raise('L', 1.4 * up); baby.raise('R', 1.4 * up); baby.group.position.set(px, floor + 0.01 * u, 0.1 * u); baby.update();
      const s = pre ? 0 : bump(v, 1.6, 1.4); stars.visible = s > 0; stars.scale.setScalar(pop(s)); stars.position.set(px, floor + 0.65 * u, -0.05 * u); stars.rotation.z = t;
    },
  };
}

export function cafe(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.62 * u, TH = 0.36 * u;
  const table = solidProp([[G.cyl(0.2 * u, 0.2 * u, 0.02 * u, 0, TH, 0, 0, 0, 0, 28), 0xfaf6ea], [G.cyl(0.015 * u, 0.015 * u, TH, 0, TH / 2, 0), 0x3a3a44], [G.cyl(0.1 * u, 0.1 * u, 0.01 * u, 0, 0.005 * u, 0, 0, 0, 0, 20), 0x3a3a44]], 0.35);
  table.position.set(tx, floor, 0.05 * u);
  const tray = new THREE.Group(), trayM = solidProp([[G.cyl(0.13 * u, 0.13 * u, 0.01 * u, 0, 0, 0, 0, 0, 0, 24), 0xc8ccd4], [G.cyl(0.04 * u, 0.033 * u, 0.06 * u, -0.04 * u, 0.035 * u, 0), 0xffffff], [G.cyl(0.036 * u, 0.036 * u, 0.004 * u, -0.04 * u, 0.064 * u, 0), 0x5a3218], [G.torus(0.018 * u, 0.006 * u, Math.PI * 2, -0.08 * u, 0.04 * u, 0), 0xffffff], [new THREE.CylinderGeometry(0.06 * u, 0.06 * u, 0.05 * u, 12, 1, false, 0, Math.PI / 3).translate(0.05 * u, 0.03 * u, 0), 0xffe8c8], [G.sphere(0.012 * u, 0.07 * u, 0.06 * u, 0.02 * u), 0xe02030]], 0.45);
  tray.add(trayM);
  const steam = many(PUFF(u, 0xffffff), 5, 0.5), waiter = createPerson({ u: 0.85 * u, shirt: 0xffffff, pants: 0x1a1a24 }), guest = createPerson({ u: 0.8 * u, shirt: 0xe07ab0 });
  group.add(table, tray, steam, waiter.group, guest.group);
  const loop = 5.4, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0.1, 1.0], set: [1.2, 0.4], out: [1.8, 1.0], clear: [4.6, 0.4] });
      const walking = (T.in > 0 && T.in < 1) || (T.out > 0 && T.out < 1), wx = tx + 0.75 * u - 0.45 * u * T.in + 0.5 * u * T.out;
      waiter.reset().face(T.out > 0 ? 'right' : walking ? 'left' : -1.2).walk(v * 9, walking ? 1 : 0); waiter.bone('armL').rotation.x = T.set < 1 ? 1.4 : 0; waiter.bone('foreL').rotation.x = T.set < 1 ? 0.3 : 0;
      waiter.group.position.set(wx, floor, 0.25 * u); waiter.group.visible = !pre && T.out < 1; waiter.update(); bonePoint(waiter, 'handL', 0.7, hand);
      const onTable = [tx, floor + TH + 0.015 * u, 0.05 * u], carry = [hand.x, hand.y + 0.03 * u, hand.z];
      const tp = pre || T.set >= 1 ? onTable : T.set > 0 ? carry.map((c, i) => lerp(c, onTable[i], T.set)) : carry; tray.position.set(...tp); tray.visible = (pre || v > 0.1) && T.clear < 1; tray.scale.setScalar(pop(1 - T.clear));
      guest.reset().face(0.4); guest.bone('body').position.y = -0.17 * 0.8 * u; guest.bone('legL').rotation.x = guest.bone('legR').rotation.x = 1.5; guest.bone('shinL').rotation.x = guest.bone('shinR').rotation.x = -1.5; guest.raise('R', 0.6 * bump(v, 1.6, 1.0));
      guest.group.position.set(tx - 0.24 * u, floor + 0.02 * u, -0.05 * u); guest.update();
      wisps(steam, 0, 5, tray.position.x - 0.04 * u, tray.position.y + 0.08 * u, t, u, { period: 1.6, rise: 0.3, size: 0.6, on: (pre || T.set >= 1) && T.clear < 1 ? 1 : 0 }); steam.commit();
    },
  };
}

export function waterNeed(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u, pu = 0.85 * u;
  const p = createPerson({ u: pu, shirt: 0xf0a030 }), sun = emblemProp('sun', 0.45 * u), sweat = many(DROP(u, 0x7fd0ff), 4, 0.8), warn = emblemProp('exclaim', 0.22 * u, { color: 0xff4040 });
  const bottle = new THREE.Group(), glass = solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.2 * u, 0, 0.1 * u, 0, 0, 0, 0, 16), 0xd8f0ff], [G.cyl(0.025 * u, 0.025 * u, 0.04 * u, 0, 0.22 * u, 0), 0x3a7ad0]], 0.4), water = solidProp([[G.cyl(0.047 * u, 0.047 * u, 1, 0, 0.5, 0, 0, 0, 0, 16), 0x40a0f0]], 0.7);
  bottle.add(glass, water); water.position.y = 0.005 * u; sun.position.set(px + 0.35 * u, B.maxY + 0.15 * u, -0.25 * u);
  group.add(p.group, sun, sweat, warn, bottle);
  const loop = 5.4, hand = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { see: [0.8, 0.3, 'back'], grab: [1.4, 0.5], drink: [2.0, 0.4], gulp: [2.4, 1.0], done: [3.5, 0.4], out: [4.8, 0.4] });
      const droop = pre ? 0.4 : 0.4 * (1 - T.drink), drinking = T.drink - T.done, perk = bump(v, 3.7, 0.9);
      p.reset().face(0.2); p.lean(droop); p.bone('head').rotation.x = -0.6 * drinking; p.bone('armR').rotation.x = 1.0 * T.grab + 1.3 * drinking; p.bone('foreR').rotation.x = 1.0 * drinking; p.raise('L', 2.6 * perk);
      p.group.position.set(px, floor + 0.05 * u * perk, 0.1 * u); p.update(); bonePoint(p, 'handR', 0.6, hand);
      const rest = [px + 0.35 * u, floor, 0.2 * u]; bottle.position.set(...(T.grab > 0 ? rest.map((r, i) => lerp(r, [hand.x, hand.y - 0.1 * u, hand.z][i], T.grab)) : rest)); bottle.rotation.z = 2.2 * drinking; bottle.scale.setScalar(pop(1 - T.out));
      water.scale.y = pop(0.19 * u * (1 - 0.9 * T.gulp));
      for (let i = 0; i < 4; i++) { const f = ((t * 1.2 + i / 4) % 1); sweat.set(i, px + (i % 2 ? 0.1 : -0.1) * pu, floor + 0.8 * pu - 0.2 * u * f, 0.15 * u, !pre && T.drink < 0.5 ? Math.sin(Math.PI * f) : 0); }
      sweat.commit();
      const w = pre ? 0 : T.see * (1 - T.grab); warn.visible = w > 0.01; warn.scale.setScalar(pop(0.22 * u * w)); warn.position.set(px + 0.35 * u, floor + 0.45 * u, 0.2 * u);
      sun.scale.setScalar(0.45 * u * (1 + 0.1 * Math.sin(t * 5))); sun.idle(t);
    },
  };
}

export function popcorn(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u, sy = B.cy + 0.2 * u;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * u, 0.48 * u), new THREE.MeshBasicMaterial({ color: 0xffffff })); screen.position.set(sx, sy, -0.6 * u);
  const seats = solidProp([-0.25, 0, 0.25].map((x) => [G.box(0.2 * u, 0.32 * u, 0.06 * u, x * u, 0.16 * u, 0), 0xc02030]), 0.35); seats.position.set(sx, floor, 0.25 * u);
  const viewers = [createPerson({ u: 0.75 * u, shirt: S, pants: S, skin: S, hair: S, shoes: S, eyes: S, glow: 0.1 }), createPerson({ u: 0.7 * u, shirt: S, pants: S, skin: S, hair: 0x2a1a10, shoes: S, eyes: S, glow: 0.1 })];
  const bucket = solidProp([[G.cyl(0.07 * u, 0.05 * u, 0.14 * u, 0, 0.07 * u, 0, 0, 0, 0, 12), 0xffffff], ...[0, 1, 2, 3, 4, 5].map((i) => [G.box(0.02 * u, 0.141 * u, 0.02 * u, Math.cos(i) * 0.062 * u, 0.07 * u, Math.sin(i) * 0.062 * u), 0xe02030]), [G.sphere(0.07 * u, 0, 0.15 * u, 0, 1, 0.5, 1), 0xfff4c0]], 0.5);
  const corn = many([[G.sphere(0.018 * u), 0xfff4c0]], 6, 0.7);
  group.add(screen, seats, ...viewers.map((p) => p.group), bucket, corn);
  const loop = 4.0, col = new THREE.Color(), PAL = [0x80c0ff, 0xffd080, 0xa0ffa0, 0xffffff];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      screen.material.color.copy(col.setHex(PAL[Math.floor(t * 1.5) % 4]).multiplyScalar(pre ? 0.5 : 0.85 + 0.15 * Math.sin(t * 7)));
      viewers.forEach((p, i) => { p.reset().face(Math.PI); p.bone('head').rotation.z = 0.1 * Math.sin(t + i); if (i === 1) { p.bone('armR').rotation.x = 1.0 + 0.8 * Math.max(0, Math.sin(v * 3)); } p.group.position.set(sx + (i ? 0.25 : -0.25) * u, floor + 0.0, 0.22 * u); p.update(); });
      bucket.position.set(sx + 0.45 * u, floor + 0.32 * u, 0.3 * u);
      for (let i = 0; i < 6; i++) { const f = ((t * 0.9 + i / 6) % 1); corn.set(i, sx + 0.45 * u + 0.08 * u * Math.cos(i * 2.1) * f, floor + 0.48 * u + 0.2 * u * Math.sin(Math.PI * f), 0.3 * u + 0.05 * u * Math.sin(i), pre ? 0 : 1); }
      corn.commit();
    },
  };
}
