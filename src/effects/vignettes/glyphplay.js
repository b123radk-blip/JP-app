// Scenes where the kanji itself does the acting.
//   ground-thud   地: the kanji hops up and slams down onto a strip of earth: cracks shoot out, grass springs up along it
//                 and a mole pokes its head out of a hole to see what happened
//   lid-fit       合: the top of the kanji (人 and 一) lifts off like a lid, hovers, and drops back onto the box (口) with a
//                 click: a perfect fit, a sparkle
//   gate-shut     閉: the two halves of 門 slide together over the middle, clunk, and a padlock snaps shut on them; then
//                 it unlocks and they slide open again
//   kanji-wings   飛: the kanji sprouts two wings, flaps, lifts off and flies up and round, then glides back down to land
//   scroll-write  文: a scroll unrolls beside the kanji and a brush writes a line of characters along it
//   frog-prince   変: a frog hops onto the kanji, POOF, it is a prince with a crown; POOF, a frog again; the kanji wobbles
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF, burst } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs, strokeSides } from './helpers.js';

function groundThud(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const earth = solidProp([[G.box(2.6 * u, 0.22 * u, 0.5 * u, 0, -0.11 * u, 0), 0x7a5230], [G.box(2.6 * u, 0.04 * u, 0.51 * u, 0, -0.01 * u, 0), 0x5aa040]], 0.25);
  earth.position.set(B.cx + 0.7 * u, floor - 0.005 * u, -0.1 * u);
  const cracks = many([[G.box(0.3 * u, 0.02 * u, 0.01 * u, 0.15 * u, 0, 0), 0x2a1a10]], 6, 0.1), grass = many([[G.cone(0.025 * u, 0.12 * u, 0, 0.06 * u), 0x60c040], [G.cone(0.02 * u, 0.09 * u, 0.025 * u, 0.045 * u, 0, -0.3), 0x50b040]], 10, 0.4);
  const mole = solidProp([[G.sphere(0.1 * u, 0, 0, 0, 1, 1.1, 0.9), 0x5a4a40], [G.sphere(0.035 * u, 0, -0.01 * u, 0.09 * u), 0xff8aa0], [G.sphere(0.015 * u, -0.04 * u, 0.04 * u, 0.08 * u), 0x101010], [G.sphere(0.015 * u, 0.04 * u, 0.04 * u, 0.08 * u), 0x101010]], 0.35);
  const hole = solidProp([[G.sphere(0.12 * u, 0, 0, 0, 1.2, 0.25, 0.6), 0x2a1a10]], 0.1), dust = many(PUFF(u, 0xa08060), 8, 0.3);
  const mx = B.maxX + 0.7 * u; hole.position.set(mx, floor + 0.01 * u, 0.1 * u);
  group.add(earth, cracks, grass, hole, mole, dust);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [0.1, 0.45, 'out'], down: [0.55, 0.3, 'in'], mole: [1.4, 0.4, 'back'], hide: [3.8, 0.4] });
      const hop = pre ? 0 : 0.5 * u * (T.up - T.down), land = !pre && v > 0.85 ? wobble(v, 0.85, 0.4, 5) : 0;
      poseGlyph(stage, 0, hop, 0, B.cx, B.minY); stage.glyph.scale.set(1 + 0.08 * land, 1 - 0.1 * Math.abs(land), 1);
      const crack = pre ? 0 : between(v, 0.85, 1.1) * (1 - between(v, 4.2, 4.6));
      for (let i = 0; i < 6; i++) { const a = i < 3 ? Math.PI - 0.15 - i * 0.12 : 0.15 + (i - 3) * 0.12; cracks.set(i, B.cx + (i < 3 ? -0.2 : 0.2) * B.w, floor + 0.005 * u, 0.12 * u, crack, a * (i < 3 ? 1 : 1)); }
      cracks.commit();
      for (let i = 0; i < 10; i++) { const k = pre ? 0 : between(v, 1.0 + i * 0.05, 1.3 + i * 0.05) * (1 - between(v, 4.2, 4.6)); grass.set(i, B.minX - 0.2 * u + i * 0.28 * u, floor, 0.15 * u, k); }
      grass.commit();
      puffs(dust, 0, 8, B.cx, floor, pre ? 0 : (v - 0.85) / 0.8, u, 0.7); dust.commit();
      const pop = pre ? 0 : T.mole - T.hide; mole.visible = pop > 0.01; mole.position.set(mx, floor - 0.08 * u + 0.16 * u * pop, 0.1 * u); mole.rotation.y = 0.5 * Math.sin(v * 3) * pop;
    },
  };
}

function lidFit(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), { hi: top } = strokeSides(ctx, 'y', B.cy - 0.05 * B.h);
  const spark = burst(u, { s: 0.35, color: 0xffffff });
  group.add(spark);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0.3, 0.5, 'out'], drop: [1.4, 0.35, 'in'] });
      const h = pre ? 0 : 0.42 * u * (T.lift - T.drop) + 0.03 * u * Math.sin(v * 6) * (T.lift - T.drop) + 0.02 * u * wobble(v, 1.75, 0.3, 6), tilt = 0.1 * (T.lift - T.drop) * Math.sin(v * 3);
      for (const si of top) stage.offset(si, -tilt * 0.3 * u, h, 0.02 * u * (T.lift - T.drop));
      const sp = pre ? 0 : bump(v, 1.75, 0.6); spark.visible = sp > 0; spark.scale.setScalar(Math.max(1e-3, sp)); spark.position.set(B.maxX + 0.05 * u, B.cy, 0.1 * u); spark.rotation.z = v * 3;
    },
  };
}

function gateShut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const L = strokeSides(ctx, 'x', B.minX + 0.3 * B.w).lo, R = strokeSides(ctx, 'x', B.maxX - 0.3 * B.w).hi;
  const lock = solidProp([[G.box(0.16 * u, 0.13 * u, 0.06 * u, 0, 0, 0), 0xe0b030], [G.torus(0.055 * u, 0.015 * u, Math.PI, 0, 0.065 * u, 0), 0xb8c0cc], [G.cyl(0.015 * u, 0.015 * u, 0.065 * u, 0, -0.01 * u, 0.031 * u, Math.PI / 2), 0x202020]], 0.4);
  const dust = many(PUFF(u), 6, 0.3);
  group.add(lock, dust);
  const loop = 4.8, gap = 0.27 * B.w;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { shut: [0.3, 0.6, 'in'], lock: [1.1, 0.35, 'back'], unlock: [3.2, 0.3], open: [3.6, 0.7] });
      const c = pre ? 0 : T.shut - T.open;
      for (const si of L) stage.offset(si, gap * c, 0, 0.01 * u * c); for (const si of R) stage.offset(si, -gap * c, 0, 0.01 * u * c);
      const k = pre ? 0 : T.lock * (1 - T.unlock); lock.visible = k > 0.01; lock.scale.setScalar(Math.max(1e-3, k)); lock.position.set(B.cx, B.cy - 0.05 * u, 0.12 * u); lock.rotation.z = 0.2 * wobble(v, 1.3, 0.5, 4);
      puffs(dust, 0, 6, B.cx, floor, pre ? 0 : (v - 0.9) / 0.7, u, 0.4); dust.commit();
    },
  };
}

function kanjiWings(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group();
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.bezierCurveTo(2, 1.6, 4.2, 1.8, 5, 1.0); shape.bezierCurveTo(4.2, 0.6, 3.6, 0.2, 3.9, -0.3); shape.bezierCurveTo(3.0, 0.0, 2.6, -0.4, 2.8, -0.9); shape.bezierCurveTo(1.6, -0.5, 0.8, -0.6, 0, 0);
  const wing = (s) => { const pivot = new THREE.Group(), m = solidProp([[G.extrude(shape, 0.15).scale(s * 0.1 * u, 0.1 * u, 0.1 * u), 0xf8f8ff]], 0.6); pivot.add(m); pivot.position.set(s > 0 ? B.maxX - 0.05 * u - stage.glyph.userData.base.x : B.minX + 0.05 * u - stage.glyph.userData.base.x, B.cy + 0.1 * u - stage.glyph.userData.base.y, -0.03 * u); return pivot; };
  const wings = [wing(1), wing(-1)];
  stage.glyph.add(...wings);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { grow: [0, 0.4, 'back'], flap: [0.4, 0.8], fly: [1.0, 2.4, 'linear'], land: [3.4, 1.0, 'out'], fold: [4.8, 0.5] });
      const k = pre ? 0 : T.grow * (1 - T.fold), beat = Math.sin(v * (v > 3.4 ? 4 : 11)) * (0.5 + 0.5 * (1 - T.land));
      wings[0].rotation.set(0, 0.3, 0.5 * beat); wings[1].rotation.set(0, -0.3, -0.5 * beat);
      wings.forEach((w) => { w.scale.setScalar(Math.max(1e-3, k)); w.visible = k > 0.01; });
      const f = T.fly, up = pre ? 0 : 1.1 * u * Math.sin(Math.PI * Math.min(1, f)) * (1 - T.land) + 0.08 * u * Math.sin(v * 3) * k, dx = pre ? 0 : 0.6 * u * Math.sin(Math.PI * 2 * f) * (1 - T.land);
      poseGlyph(stage, dx, up, -0.15 * Math.cos(Math.PI * 2 * f) * (f > 0 && f < 1 ? 1 : 0), B.cx, B.cy);
    },
  };
}

function scrollWrite(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), sx = B.maxX + 0.1 * u, sy = B.cy, W = 1.3 * u;
  const paper = solidProp([[G.box(1, 0.5 * u, 0.005 * u, 0.5, 0, 0), 0xfaf3e0]], 0.4), rollers = many([[G.cyl(0.03 * u, 0.03 * u, 0.58 * u, 0, 0, 0), 0x8a3a20]], 2, 0.3);
  const text = textPlane(spec.text ?? 'ぶんしょう', { h: 0.24 * u, color: '#15151e', weight: 700 }); text.geometry.translate(text.geometry.parameters.width / 2, 0, 0);
  const tw = text.geometry.parameters.width, brush = solidProp([[G.cyl(0.015 * u, 0.02 * u, 0.3 * u, 0, 0.19 * u, 0), 0x8a5a30], [G.cone(0.025 * u, 0.06 * u, 0, 0.03 * u, 0, Math.PI), 0x15151e]], 0.3);
  group.add(paper, rollers, text, brush);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { unroll: [0, 0.8, 'out'], write: [0.9, 2.4, 'linear'], roll: [4.3, 0.7] });
      const open = pre ? 0 : T.unroll - T.roll, w = Math.max(1e-3, W * open);
      paper.position.set(sx, sy, 0); paper.scale.set(w, 1, 1); paper.visible = open > 0.01;
      rollers.set(0, sx, sy, 0.01 * u, open > 0.01 ? 1 : 0); rollers.set(1, sx + w, sy, 0.01 * u, open > 0.01 ? 1 : 0); rollers.commit();
      const shown = pre ? 0.001 : Math.max(0.001, T.write * (1 - T.roll)) * Math.min(1, W / tw * 0.9);
      text.position.set(sx + 0.08 * u, sy, 0.006 * u); text.scale.x = shown; text.material.map.repeat.x = shown; text.visible = shown > 0.01;
      brush.visible = !pre && T.write > 0 && T.write < 1; brush.position.set(sx + 0.08 * u + tw * shown, sy - 0.02 * u + 0.04 * u * Math.sin(v * 14), 0.04 * u); brush.rotation.z = -0.4;
    },
  };
}

function frogPrince(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), top = B.maxY;
  const frog = solidProp([[G.sphere(0.12 * u, 0, 0.08 * u, 0, 1.3, 0.8, 1), 0x48b048], [G.sphere(0.05 * u, -0.07 * u, 0.17 * u, 0.04 * u), 0x58c058], [G.sphere(0.05 * u, 0.07 * u, 0.17 * u, 0.04 * u), 0x58c058], [G.sphere(0.022 * u, -0.07 * u, 0.18 * u, 0.085 * u), 0x101010], [G.sphere(0.022 * u, 0.07 * u, 0.18 * u, 0.085 * u), 0x101010], [G.box(0.12 * u, 0.012 * u, 0.01 * u, 0, 0.07 * u, 0.13 * u), 0xc04040]], 0.4);
  const prince = createPerson({ u: 0.75 * u, shirt: 0x6a3ab8, pants: 0xf0f0f0 }), crown = solidProp([[G.cyl(0.07 * u, 0.07 * u, 0.06 * u, 0, 0, 0, 0, 0, 0, 10), 0xffd030], ...[0, 1, 2, 3, 4].map((i) => [G.cone(0.02 * u, 0.05 * u, Math.cos(i * 1.256) * 0.06 * u, 0.05 * u, Math.sin(i * 1.256) * 0.06 * u), 0xffd030])], 0.7);
  prince.rig.attach('head', crown, 1.0);
  const poof = many(PUFF(1.6 * u, 0xf0e8ff), 8, 0.7);
  group.add(frog, prince.group, poof);
  const loop = 5.2, px = B.cx + 0.1 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const hop = pre ? 0 : between(v, 0.1, 0.7), P1 = 1.3, P2 = 3.9, isPrince = !pre && v >= P1 + 0.15 && v < P2 + 0.15;
      const fx = B.maxX + 0.6 * u - (B.maxX + 0.6 * u - px) * hop, fy = top + 0.4 * u * Math.sin(Math.PI * hop);
      frog.visible = !pre && !isPrince; frog.position.set(fx, v > P2 ? top : fy, 0.04 * u); frog.scale.setScalar(1 + 0.08 * Math.sin(v * 5));
      prince.group.visible = isPrince; prince.group.position.set(px, top, 0.04 * u); prince.face('toward').reset();
      if (isPrince) { prince.raise('R', 2.4 * bump(v, P1 + 0.4, 1.4)); prince.bone('foreR').rotation.z = -0.4 * Math.sin(v * 8); prince.lean(0.3 * bump(v, 2.6, 0.8)); }
      prince.update();
      for (const [i0, at] of [[0, P1], [4, P2]]) for (let i = 0; i < 4; i++) { const f = (v - at) / 0.6, a = i * 1.57 + 0.4; poof.set(i0 + i, px + Math.cos(a) * 0.2 * u * f, top + 0.15 * u + Math.sin(a) * 0.2 * u * f, 0.06 * u, !pre && f > 0 && f < 1 ? 1.3 * Math.sin(Math.PI * f) : 0); }
      poof.commit();
      for (let si = 0; si < ctx.strokes.length; si++) { const j = !pre ? (bump(v, P1, 0.6) + bump(v, P2, 0.6)) * 0.012 * u : 0; stage.offset(si, j * Math.sin(v * 30 + si), j * Math.cos(v * 27 + si * 2), 0); }
    },
  };
}

export const SCENES = { 'ground-thud': groundThud, 'lid-fit': lidFit, 'gate-shut': gateShut, 'kanji-wings': kanjiWings, 'scroll-write': scrollWrite, 'frog-prince': frogPrince };
