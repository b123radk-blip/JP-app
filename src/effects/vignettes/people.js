// People scenes: the kit's person acting with the kanji (they stand on its baseline, about as tall as it).
//   push          押: walks up beside the kanji, leans in and shoves it along in three heaves, dust puffing; steps back
//   lift-heavy    重: squats, grips the kanji's corner and strains (shaking, red-faced, sweat flying); it lifts a crack and
//                 thuds down, knocking them onto their bottom
//   come-near     近: far down a path, walks towards you until right beside the kanji, leans in and waves
//   hand-in-hand  二人: one walks out from behind the word, one in from the side; they take hands and swing them, hearts rise
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF, DROP, HEART } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { smooth } from '../pieces/util.js';
import { poseGlyph, puffs } from './helpers.js';
import { nearFace } from './variants.js';

function push(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), side = spec.dir === 'right' ? -1 : 1;   // stands on the right, pushes left
  const p = createPerson({ u, shirt: 0xe07a30 }).face(side > 0 ? 'left' : 'right'), dust = many(PUFF(u), 8);
  group.add(p.group, dust);
  const edge = side > 0 ? B.maxX : B.minX, gap = 0.47 * u, loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lean: [0, 0.45], h1: [0.5, 0.45, 'out'], h2: [1.1, 0.45, 'out'], h3: [1.7, 0.45, 'out'], up: [2.3, 0.5], back: [2.9, 1.3] });
      const walkIn = timeline(A.setup, { w: [0.15, 0.8, 'out'] }).w;
      const shove = (T.h1 + T.h2 + T.h3) / 3, dx = -side * 0.42 * u * (shove - T.back);
      poseGlyph(stage, dx, 0);
      const lean = pre ? 0 : T.lean - T.up, d = lerp(0.62 * u, gap, lean);
      const x = edge + dx + side * (pre ? lerp(1.6 * u, 0.62 * u, walkIn) : d);
      p.group.position.set(x, B.minY, 0.02 * u);
      const heave = [0.5, 1.1, 1.7].reduce((m, h) => Math.max(m, bump(v, h, 0.5)), 0);
      p.reset().walk(pre ? walkIn * 14 : (v * 9) * (heave + T.back * 0.6), pre ? (walkIn < 1 ? 1 : 0) : Math.max(heave, T.back - T.back * T.back) * 0.8);
      const bend = 0.45 * lean + 0.12 * heave;
      p.lean(bend);
      // arms level in the world (the hips' bend swings them back, so add it), elbows giving a little on each heave
      for (const s of ['L', 'R']) { p.bone(`arm${s}`).rotation.x = lerp(p.bone(`arm${s}`).rotation.x, Math.PI / 2 + bend - 0.12, lean); p.bone(`fore${s}`).rotation.x = lerp(0.3, 0.15 + 0.3 * heave, lean); }
      p.group.position.x += 0.004 * u * tremble(v) * heave;
      p.update();
      // a puff at each end of the kanji's base on every heave
      const f = pre ? 0 : Math.max(0, ...[0.5, 1.1, 1.7].map((h) => ((v - h) / 0.8 > 0 && (v - h) / 0.8 < 1 ? (v - h) / 0.8 : 0)));
      puffs(dust, 0, 4, edge + dx - side * B.w * 0.9, B.minY, f, u); puffs(dust, 4, 4, edge + dx, B.minY, f, u, 0.18);
      dust.commit();
    },
  };
}

function liftHeavy(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group();
  const p = createPerson({ u, shirt: 0x40a060 }).face('left'), dust = many(PUFF(u, 0xc8b8a0), 8), sweat = many(DROP(1.8 * u), 4);
  group.add(p.group, dust, sweat);
  const loop = 5.0, x0 = B.maxX + 0.27 * u, SKIN = 0xffd2b0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { squat: [0, 0.6], strain: [0.6, 1.2], drop: [1.85, 0.3, 'in'], fall: [1.9, 0.45, 'out'], getup: [3.7, 0.9] });
      const walkIn = timeline(A.setup, { w: [0.2, 0.75, 'out'] }).w;
      const holding = pre ? 0 : T.squat * (1 - T.drop), lifted = holding * T.strain * 0.13 * (1 + 0.2 * tremble(v, 9)) * (v < 1.85 ? 1 : 0);
      poseGlyph(stage, 0, 0.012 * u * wobble(v, 2.15, 0.5, 7), lifted, B.minX, B.minY);         // tips up on its left corner, thuds down
      const sit = pre ? 0 : T.fall * (1 - T.getup), crouch = holding;
      const x = pre ? x0 + 1.3 * u * (1 - walkIn) : x0 + 0.22 * u * sit;
      p.reset().walk(pre ? walkIn * 14 : 0, pre && walkIn < 1 ? 1 : 0);
      for (const s of ['L', 'R']) {                                          // squat: thighs forward, shins back; sitting: legs out
        p.bone(`leg${s}`).rotation.x += 1.25 * crouch + 1.5 * sit; p.bone(`shin${s}`).rotation.x += -1.9 * crouch - 0.2 * sit;
        p.bone(`arm${s}`).rotation.x = 1.25 * crouch + 2 * lifted + 0.6 * sit; p.bone(`fore${s}`).rotation.x = 0.3 * crouch;
      }
      p.raise('L', 0.9 * sit); p.raise('R', 0.9 * sit);
      p.bone('body').rotation.x = 0.55 * crouch - 0.25 * sit;
      p.bone('body').position.y = -0.17 * u * crouch - 0.3 * u * sit;
      p.group.position.set(x + 0.012 * u * tremble(v) * T.strain * (v < 1.85 ? 1 : 0), B.minY, 0.03 * u);
      p.rig.setColor('head', v > 0.9 && v < 2.6 ? 0xff9a80 : SKIN);           // red in the face while straining
      p.update();
      // sweat flying off while straining and after; the thud's dust
      const head = new THREE.Vector3(); p.rig.pointOn('head', 0.6, head);
      for (let i = 0; i < 4; i++) { const f = ((v - 0.8 - i * 0.3) % 1.2) / 0.7, on = !pre && v > 0.8 && v < 3.4 && f > 0 && f < 1; sweat.set(i, x + (i % 2 ? 1 : -1) * 0.15 * u * f, B.minY + head.y + 0.12 * u * Math.sin(Math.PI * f) - 0.1 * u * f * f, 0.06 * u, on ? 1 : 0); }
      sweat.commit();
      puffs(dust, 0, 8, B.cx, B.minY, pre ? 0 : (v - 2.1) / 0.9, u, 0.7);
      dust.commit();
    },
  };
}

function comeNear(ctx, spec, stage) {
  if (spec.outcome === 'face') return nearFace(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), xs = B.maxX + 0.3 * u;
  const p = createPerson({ u, shirt: 0xd04a6a, hair: 0x6a3a1a }).face('toward');
    // a path from far away to the kanji's feet: sandy, with a lighter edge on each side (flat on the floor)
  const L = 5.6 * u, path = solidProp([[new THREE.PlaneGeometry(0.5 * u, L).rotateX(-Math.PI / 2).translate(0, 0, -L / 2), 0xe8c890], ...[-1, 1].map((sd) => [new THREE.PlaneGeometry(0.05 * u, L).rotateX(-Math.PI / 2).translate(sd * 0.25 * u, 0.0005, -L / 2), 0xfff0c8])], 0.45);
  path.position.set(xs, B.minY - 0.004, 0.25 * u);
  group.add(path, p.group);
  const far = -5 * u, loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 2.6, 'linear'], stop: [2.5, 0.3], lean: [2.8, 0.5, 'back'], wave: [2.9, 1.3, 'linear'], poof: [4.4, 0.3, 'in'], again: [4.7, 0.5, 'back'] });
      const z = pre ? far : v < 4.6 ? lerp(far, 0.05 * u, smooth(T.walk * 0.6 + 0.4 * T.walk * T.walk)) : far;
      p.group.position.set(xs, B.minY, z);
      p.group.scale.setScalar(Math.max(1e-3, pre ? timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a : v < 4.6 ? 1 - T.poof : T.again));
      const walking = !pre && v < 2.7;
      p.reset().walk(v * 7, walking ? 1 - T.stop : 0);
      p.lean(0.45 * (T.lean - T.poof));
      if (!pre && v > 2.8 && v < 4.4) { p.raise('R', 2.5 * T.lean); p.bone('foreR').rotation.z = -0.5 * Math.sin(T.wave * Math.PI * 6); }
      p.update();
    },
  };
}

function handInHand(ctx, spec, stage) {
  const u = 0.85 * stage.u, B = stage.box, group = new THREE.Group();
  const a = createPerson({ u, shirt: 0x3a7ae0 }), b = createPerson({ u, shirt: 0xff6a9a, pants: 0x6a3a8a, hair: 0x8a3a1a });
  const hearts = many(HEART(u), 6, 0.7);
  group.add(a.group, b.group, hearts);
  const xa = B.maxX + 0.2 * u, xb = xa + 0.64 * u, loop = 3.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const inA = timeline(A.setup, { w: [0.1, 0.85, 'out'] }).w, inB = timeline(A.setup, { w: [0.2, 0.8, 'out'] }).w;
      const take = pre ? 0 : smooth(A.u / 0.6), swing = pre ? 0 : 0.18 * Math.sin((v / loop) * Math.PI * 4) * take;
      a.group.position.set(pre ? lerp(B.cx, xa, inA) : xa, B.minY, pre ? lerp(-0.4, 0.04, inA) : 0.04);
      b.group.position.set(pre ? lerp(xb + 1.2 * u, xb, inB) : xb, B.minY, 0.04);
      a.face(pre && inA < 1 ? 0.9 : lerp(Math.PI / 2, 0, take)); b.face(pre ? -Math.PI / 2 : lerp(-Math.PI / 2, 0, take));
      const hop = pre ? 0 : Math.abs(Math.sin((v / loop) * Math.PI * 4)) * 0.03 * u * take;
      a.reset().walk(pre ? inA * 14 : 0, pre && inA < 1 ? 1 : 0); b.reset().walk(pre ? inB * 14 : 0, pre && inB < 1 ? 1 : 0);
      a.raise('L', 0.55 * take + swing); b.raise('R', 0.55 * take - swing);
      a.bone('body').position.y = b.bone('body').position.y = hop;
      a.bone('head').rotation.z = -0.12 * take; b.bone('head').rotation.z = 0.12 * take;   // heads tilted towards each other
      a.update(); b.update();
      for (let i = 0; i < 6; i++) {                                      // hearts drifting up between them, one after another
        const f = ((v + i * (loop / 6)) % loop) / loop, on = !pre && take > 0.5;
        hearts.set(i, (xa + xb) / 2 + 0.12 * u * Math.sin(f * 9 + i * 2), B.minY + 0.7 * u + 0.9 * u * f, 0.08 * u, on ? Math.sin(Math.PI * f) * (0.8 + 0.4 * (i % 2)) : 0, 0.25 * Math.sin(f * 6 + i));
      }
      hearts.commit();
    },
  };
}

export const SCENES = { push, 'lift-heavy': liftHeavy, 'come-near': comeNear, 'hand-in-hand': handInHand };
