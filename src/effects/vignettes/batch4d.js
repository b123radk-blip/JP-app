// Batch 4 kanji, part 4.
//   bus-ride       乗: a bus pulls up; a person walks to its door and gets on; they wave from the window as it drives off
//   fever          熱: a person with a thermometer in their mouth: the red shoots up, their face goes red, steam puffs from
//                  their ears; an ice pack lands on their head and they cool down
//   brush-enso     筆: a big writing brush dips into an ink stone and paints a circle in one sweep, flicking ink
//   cow-moo        牛: a cow walks in, says モー (rings of sound) and a milk pail fills up
//   heart-beat     心: a heart glows in a person's chest, beating lub-dub; they hug themselves and it beats bigger
//   parent-watch   親: a parent walks with a small kid; the kid runs ahead and the parent climbs a tree stump to watch
//                  over them, hand shading their eyes; the kid waves back
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, heart, PUFF } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function busRide(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.75 * u, W = 0.95 * u, H = 0.42 * u, D = 0.3 * u, lo = 0.08 * u, YEL = 0xf0c020;
  const winY = lo + H * 0.62, winH = 0.13 * u, xs = [-0.3, -0.1, 0.1, 0.3];
  const side = [[G.box(W, winY - winH / 2 - lo, D, 0, lo + (winY - winH / 2 - lo) / 2, 0), YEL], [G.box(W, lo + H - (winY + winH / 2), D, 0, (winY + winH / 2 + lo + H) / 2, 0), YEL], ...[-0.475, -0.2, 0, 0.2, 0.475].map((x) => [G.box(0.05 * u, winH, D, x * u, winY, 0), YEL])];
  const bus = solidProp([...side, [G.box(W * 0.98, winH, D * 0.9, 0, winY, -0.02 * u), 0x203048], [G.box(0.14 * u, 0.26 * u, 0.005 * u, -0.38 * u, lo + 0.13 * u, D / 2 + 0.003 * u), 0x3a4a6a], ...[-0.3, 0.3].map((x) => [G.cyl(0.07 * u, 0.07 * u, D + 0.02 * u, x * u, lo, 0, Math.PI / 2), 0x202024]), [G.box(W, 0.03 * u, D, 0, lo + H * 0.32, 0.002 * u), 0x40a060]], 0.35);
  const rider = createPerson({ u: 0.55 * u, shirt: 0xe04848 }), walker = createPerson({ u: 0.55 * u, shirt: 0xe04848 });
  const busG = new THREE.Group(); busG.add(bus, rider.group); rider.group.position.set(0.1 * u, winY - 0.42 * u, 0); group.add(busG, walker.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0, 0.9, 'out'], walk: [1.0, 1.0], off: [3.0, 1.5, 'in'] });
      const x = bx + 1.0 * u * (1 - T.in) + 1.3 * u * T.off; busG.position.set(x, floor + 0.01 * u * Math.sin(t * 20) * (T.in < 1 || T.off > 0 ? 1 : 0), -0.1 * u);
      busG.visible = T.off < 0.95; busG.scale.setScalar(pop(pre ? 1 : 1 - Math.max(0, T.off - 0.6) * 2.5));
      const door = bx - 0.38 * u, on = !pre && T.walk >= 1;
      walker.reset().face('right').walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); walker.group.position.set(lerp(B.maxX + 0.1 * u, door, T.walk), floor, 0.15 * u); walker.group.visible = !pre && !on && T.in >= 1; walker.update();
      rider.reset().face(0); rider.raise('R', on ? 2.6 + 0.4 * Math.sin(v * 10) : 0); rider.group.visible = on; rider.update();
    },
  };
}

function fever(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u, pu = 0.95 * u, SKIN = 0xffd2b0;
  const p = createPerson({ u: pu, shirt: 0x9ad0f0 }), k = pu;
  const thermo = solidProp([[G.cyl(0.012 * k, 0.012 * k, 0.2 * k, 0, 0.1 * k, 0), 0xf0f4f8], [G.sphere(0.018 * k), 0xe02020]], 0.6), red = solidProp([[G.cyl(0.007 * k, 0.007 * k, 1, 0, 0.5, 0.008 * k), 0xe02020]], 0.9);
  const tp = p.rig.attach('head', thermo, 0.35); tp.position.z = 0.12 * k; tp.rotation.set(0, 0, -1.2); thermo.add(red);
  const steam = many(PUFF(u, 0xffffff), 6, 0.6), ice = solidProp([[G.box(0.2 * u, 0.05 * u, 0.14 * u, 0, 0, 0), 0x8ad0ff], [G.box(0.04 * u, 0.06 * u, 0.04 * u, 0.1 * u, 0.02 * u, 0), 0x5aa0e0]], 0.6);
  group.add(p.group, steam, ice);
  const loop = 5.6, head = new THREE.Vector3(), col = new THREE.Color(), hot = new THREE.Color(0xff6a6a);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { rise: [0.3, 1.2, 'in'], ice: [3.0, 0.4, 'bounce'], cool: [3.4, 1.0], iceOff: [4.8, 0.4] });
      const heat = T.rise * (1 - T.cool), dizzy = heat > 0.8 ? 0.08 * Math.sin(v * 7) : 0;
      red.scale.y = pop(0.04 * k + 0.13 * k * heat); p.rig.setColor('head', col.setHex(SKIN).lerp(hot, heat).getHex());
      p.reset(); p.bone('body').rotation.z = dizzy; p.group.position.set(px, floor, 0.1 * u); p.update();
      p.rig.pointOn('head', 0.55, head); p.group.updateMatrix(); head.applyMatrix4(p.group.matrix);
      for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, f = ((v * 1.2 + i / 6) % 1); steam.set(i, head.x + s * (0.14 * k + 0.1 * u * f), head.y + 0.25 * u * f, head.z, heat > 0.7 && v < 3.4 ? Math.sin(Math.PI * f) : 0); }
      steam.commit();
      const iy = lerp(head.y + 0.8 * u, head.y + 0.15 * k, T.ice) + 0.5 * u * T.iceOff; ice.visible = !pre && T.ice > 0 && T.iceOff < 1; ice.position.set(head.x, iy, head.z);
    },
  };
}

function brushEnso(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, cy = B.cy + 0.02 * u, R = 0.22 * u, N = 36;
  const paper = solidProp([[G.box(0.62 * u, 0.62 * u, 0.006 * u, 0, 0, 0), 0xfaf6ea]], 0.6); paper.position.set(cx, cy, -0.02 * u);
  const stone = solidProp([[G.box(0.24 * u, 0.06 * u, 0.14 * u, 0, 0.03 * u, 0), 0x2a2a30], [G.box(0.08 * u, 0.01 * u, 0.1 * u, 0.06 * u, 0.062 * u, 0), 0x0a0a10]], 0.3); stone.position.set(cx + 0.45 * u, floor, 0.1 * u);
  const brush = new THREE.Group(), brushM = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.4 * u, 0, 0.26 * u, 0), 0xc8a060], [G.cyl(0.024 * u, 0.024 * u, 0.03 * u, 0, 0.07 * u, 0), 0x3a2a1a], [G.cone(0.03 * u, 0.08 * u, 0, 0.02 * u, 0, Math.PI), 0x1a1a20]], 0.4); brush.add(brushM);
  const ink = many([[G.sphere(0.028 * u, 0, 0, 0, 1, 1, 0.3), 0x14141c]], N, 0.2), splat = many([[G.sphere(0.012 * u, 0, 0, 0, 1, 1, 0.3), 0x14141c]], 6, 0.2);
  group.add(paper, stone, brush, ink, splat);
  const loop = 5.0, A0 = Math.PI * 0.6, at = (s) => { const a = A0 - s * Math.PI * 1.85; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
  return {
    group,
    step(t) {
      const S = acts(ctx, t, loop), pre = S.u < 0, v = pre ? -1 : S.v, T = timeline(v, { dip: [0.1, 0.6], go: [0.9, 1.4, 'smooth'], flick: [2.35, 0.3], out: [4.3, 0.5] });
      const s = T.go, fade = 1 - T.out;
      for (let i = 0; i < N; i++) { const si = i / (N - 1), [x, y] = at(si), w = 1.25 - 0.6 * si; ink.set(i, x, y, -0.012 * u, !pre && si <= s ? w * fade : 0); }
      ink.commit();
      let bx, by; if (v < 0.9) { const d = bump(v, 0.1, 0.7); bx = cx + 0.5 * u; by = floor + 0.3 * u - 0.2 * u * d; } else if (T.flick < 1) { [bx, by] = at(s); bx += 0.15 * u * T.flick; by += 0.15 * u * T.flick; } else { bx = cx + 0.3 * u; by = cy + 0.3 * u; }
      brush.visible = !pre && T.out < 0.5; brush.position.set(bx, by, 0.02 * u); brush.rotation.z = -0.3 - 0.4 * T.flick;
      const [ex, ey] = at(1); for (let i = 0; i < 6; i++) { const f = between(v, 2.35, 2.75), a = 0.4 + i * 0.25; splat.set(i, ex + Math.cos(a) * 0.25 * u * f, ey + Math.sin(a) * 0.25 * u * f, -0.01 * u, f > 0 ? (0.6 + (i % 3) * 0.3) * fade : 0); }
      splat.commit();
    },
  };
}

function cowMoo(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u;
  const cow = emblemProp('cow', 0.62 * u), rings = many([[G.torus(0.08 * u, 0.01 * u), 0xffffff]], 3, 0.9), moo = textPlane('モー', { h: 0.32 * u, color: '#ffffff', bg: null });
  const pail = solidProp([[G.cyl(0.1 * u, 0.08 * u, 0.16 * u, 0, 0.08 * u, 0, 0, 0, 0, 20), 0xa8acb4], [G.torus(0.1 * u, 0.008 * u, Math.PI, 0, 0.16 * u, 0), 0x6a6e76]], 0.4), milk = solidProp([[G.cyl(0.095 * u, 0.095 * u, 0.01 * u, 0, 0, 0, 0, 0, 0, 20), 0xffffff]], 0.8);
  const kx = cx + 0.55 * u; pail.position.set(kx, floor, 0.2 * u);
  group.add(cow, rings, moo, pail, milk);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0, 1.0, 'out'], fill: [2.2, 1.8], out: [4.8, 0.5] });
      cow.position.set(cx + 0.6 * u * (1 - T.in), floor + 0.3 * u + 0.015 * u * Math.abs(Math.sin(v * 8)) * (T.in < 1 ? 1 : 0), 0.0); cow.scale.setScalar(0.62 * u * pop(pre ? 1 : Math.min(1, v * 4) * (1 - T.out))); cow.rotation.z = 0.06 * Math.sin(t * 3) * bump(v, 1.2, 1.2); cow.idle(t);
      for (let i = 0; i < 3; i++) { const f = between(v, 1.2 + 0.2 * i, 2.0 + 0.2 * i); rings.set(i, cx - 0.2 * u, floor + 0.45 * u, 0.1 * u, f > 0 && f < 1 ? 0.5 + 2.5 * f : 0, 0, 0.6); }
      rings.commit();
      const m = pre ? 0 : bump(v, 1.2, 1.4); moo.visible = m > 0; moo.scale.setScalar(pop(Math.min(1, m * 1.6))); moo.position.set(cx - 0.15 * u, floor + 0.85 * u, 0.1 * u);
      const lvl = pre ? 0.5 : T.fill * (1 - T.out); milk.visible = lvl > 0.02; milk.position.set(kx, floor + 0.02 * u + 0.13 * u * lvl, 0.2 * u);
    },
  };
}

function heartBeat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u, pu = 0.95 * u;
  const p = createPerson({ u: pu, shirt: 0x9a9ad8 }), h = heart(u, { s: 0.16, color: 0xff3a5a }), pin = p.rig.attach('body', h, 0.62);
  pin.position.z = 0.11 * pu; pin.position.x = 0.03 * pu;
  const rings = many([[G.torus(0.1 * u, 0.008 * u), 0xff8aa0]], 3, 0.9);
  group.add(p.group, rings);
  const loop = 4.8, at = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, hug = pre ? 0 : timeline(v, { a: [1.8, 0.5], b: [4.0, 0.5] }), hg = hug.a - hug.b;
      const ph = (t * 1.2) % 1, beat = 0.22 * (bump(ph, 0, 0.15) + 0.7 * bump(ph, 0.2, 0.15)), big = 1 + 0.5 * hg;
      h.scale.setScalar(big * (1 + beat));
      p.reset(); p.group.position.set(px, floor, 0.1 * u); p.group.rotation.z = 0.06 * Math.sin(v * 3) * hg;
      if (hg > 0) { p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.3 * hg; p.bone('armL').rotation.z = -0.6 * hg; p.bone('armR').rotation.z = 0.6 * hg; p.bone('foreL').rotation.z = -1.4 * hg; p.bone('foreR').rotation.z = 1.4 * hg; }
      p.update(); p.group.updateMatrixWorld(true); h.getWorldPosition(at); group.worldToLocal(at);
      for (let i = 0; i < 3; i++) { const f = ((t * 1.2 + i / 3) % 1); rings.set(i, at.x, at.y, at.z + 0.02 * u, !pre ? (0.5 + 1.6 * f) * big : 0); }
      rings.commit();
    },
  };
}

function parentWatch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u, SH = 0.14 * u;
  const stump = solidProp([[G.cyl(0.13 * u, 0.15 * u, SH, 0, SH / 2, 0, 0, 0, 0, 20), 0x8a5a30], [G.cyl(0.125 * u, 0.125 * u, 0.006 * u, 0, SH + 0.003 * u, 0, 0, 0, 0, 20), 0xe0b880], [G.torus(0.07 * u, 0.005 * u).rotateX(Math.PI / 2).translate(0, SH + 0.007 * u, 0), 0xb08050]], 0.35);
  stump.position.set(sx, floor, -0.05 * u);
  const parent = createPerson({ u: 1.0 * u, shirt: 0x40a080 }), kid = createPerson({ u: 0.5 * u, shirt: 0xf0a030 });
  group.add(stump, parent.group, kid.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.0], run: [1.2, 1.0], climb: [1.6, 0.4, 'back'], wave: [2.5, 0.3], down: [4.4, 0.4], back: [4.6, 0.8] });
      const together = T.run === 0, px = sx - 0.25 * u + 0.25 * u * T.walk, kx = px + 0.22 * u + 0.6 * u * (T.run - T.back) + 0.0;
      parent.reset().face(T.climb > 0 ? 0.6 : 'right').walk(v * 8, T.walk > 0 && T.walk < 1 ? 1 : 0);
      if (together) parent.bone('armL').rotation.z = 0.4; const look = T.climb - T.down;
      if (look > 0) { parent.raise('R', 2.6 * look); parent.bone('foreR').rotation.z = -2.0 * look; }
      parent.group.position.set(T.climb > 0 ? lerp(px, sx, T.climb) : px, floor + (SH + 0.005 * u) * look, 0.0); parent.update();
      const running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      kid.reset().face(T.back > 0 ? 'left' : running || together ? 'right' : -0.6).walk(v * 12, running || (T.walk > 0 && T.walk < 1) ? 1 : 0);
      if (together) kid.bone('armR').rotation.z = -0.5; if (T.wave > 0 && T.back === 0) kid.raise('R', 2.6 + 0.3 * Math.sin(v * 10));
      kid.group.position.set(kx, floor, 0.12 * u); kid.update();
    },
  };
}

export const SCENES = { 'bus-ride': busRide, fever, 'brush-enso': brushEnso, 'cow-moo': cowMoo, 'heart-beat': heartBeat, 'parent-watch': parentWatch };
