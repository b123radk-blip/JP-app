// Model scenes, bed and getting up (Step 3a model pass).
//   q-night  夜: a person sitting up in bed on a futon yawns (ふぁ〜), switches off the lamp, lies down and pulls the
//            blanket up; the moon rises in the window, stars twinkle, Zzz
//   q-wake   起: a person asleep in bed (Zzz); the alarm clock rings and hops (リリリ!), she sits bolt upright (!), slaps
//            the clock quiet and stretches both arms up; outcome sun: the sun rises in the window, birds sing (♪), she
//            sits up slowly, stretches and yawns (起きる)
//   q-stand  立: a grandpa sits on a stool beside the kanji, which lies on its side; he stands up and the kanji springs
//            upright with him; outcome toddler: a toddler wobbles up onto her feet, arms out, while her mum claps (立つ)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { between, poseGlyph, puffs } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID } from './q-common.js';

const W = new THREE.Vector3();

// A futon with a pillow at its left end and a blanket; the sleeper lies on her back along x, head on the pillow. sit
// (0..1) tips her back up from the waist; cover (0..1) is how far up the blanket reaches (0 legs, 1 the chin).
export function bed(u, a, x, y, z) {
  const L = 1.2 * a.h, D = 0.42 * a.h, group = new THREE.Group();
  const futon = solidProp([[G.box(L, 0.05 * a.h, D, L / 2, 0.025 * a.h, 0), 0xf4f0e8], [G.box(0.2 * a.h, 0.07 * a.h, 0.3 * a.h, 0.13 * a.h, 0.085 * a.h, 0), 0xa0c8f0]], 0.4);
  const blanket = solidProp([[G.box(1, 0.1 * a.h, D * 0.95, -0.5, 0.11 * a.h, 0), 0xe06a5a], [G.box(1, 0.02 * a.h, D * 0.97, -0.5, 0.16 * a.h, 0), 0xf08a7a]], 0.4);
  group.add(futon, blanket); group.position.set(x, y, z);
  const feet = L - 0.05 * a.h;
  return {
    group,
    // lay the actor on her back (head toward -x), then sit / cover
    place(sit, cover) {
      a.group.rotation.order = 'YXZ'; a.group.rotation.set(-Math.PI / 2, RIGHT, 0);
      a.group.position.set(x + feet, y + 0.11 * a.h, z);
      a.turn('Abdomen', 1.0 * sit); a.turn('Torso', 0.45 * sit); a.turn('Head', 0.1 * sit - 0.15 * (1 - sit));
      blanket.position.set(feet + 0.04 * a.h, 0, 0); blanket.scale.x = Math.max(0.01, lerp(0.42, 0.78, cover) * a.h * (1 - 0.15 * sit));
    },
  };
}
// a window on the back wall: a sun or a moon rises in it (f 0..1)
function windowWith(u, thing) {
  const g = new THREE.Group(), frame = solidProp([[G.box(0.5 * u, 0.42 * u, 0.02 * u, 0, 0, -0.02 * u), 0x1a2a4a], ...[[0, 0.22, 0.54, 0.04], [0, -0.22, 0.54, 0.04], [-0.26, 0, 0.04, 0.46], [0.26, 0, 0.04, 0.46], [0, 0, 0.02, 0.42]].map(([x, y, w, h]) => [G.box(w * u, h * u, 0.04 * u, x * u, y * u, 0), 0xc89a60])], 0.35);
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * u, 0.3 * u), new THREE.MeshBasicMaterial({ colorWrite: false }));
  mask.position.set(0, -0.37 * u, 0.0); mask.renderOrder = -1;
  g.add(frame, thing, mask);
  return { group: g, rise(f) { thing.position.set(0.05 * u, lerp(-0.32, 0.04, f) * u, -0.01 * u); thing.visible = f > 0.02; } };
}

// ---- 夜 ----
function night(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.25 * u;
  const p = person(spec.who, u, 0.8), b = bed(u, p, x0, floor, 0.1 * u), yawn = label(u, 'ふぁ〜', '#6a5ac0', 0.12);
  const moon = emblemProp('crescent', 0.2 * u, { color: '#ffe680' }), win = windowWith(u, moon), sky = emblemProp('stars', 0.3 * u, { color: '#fff4b0' });
  win.group.position.set(x0 + 0.6 * u, floor + 0.85 * u, -0.45 * u); sky.position.set(x0 + 0.15 * u, floor + 1.15 * u, -0.5 * u);
  const lamp = solidProp([[G.cyl(0.015 * u, 0.04 * u, 0.2 * u, 0, 0.1 * u, 0), 0x8a6a40], [G.cyl(0.05 * u, 0.09 * u, 0.1 * u, 0, 0.24 * u, 0), 0xf4e4c0]], 0.4), bulb = solidProp([[G.sphere(0.13 * u, 0, 0, 0, 1, 1, 1), 0xffe9a0]], 1.4);
  bulb.material.transparent = true; bulb.material.opacity = 0.35; bulb.material.depthWrite = false;
  lamp.position.set(x0 - 0.12 * u, floor, -0.15 * u); bulb.position.set(x0 - 0.12 * u, floor + 0.22 * u, -0.15 * u);
  const zzz = ['Z', 'z', 'Z'].map((c, i) => label(u, c, '#4a5ac0', 0.1 + 0.03 * i));
  group.add(p.group, b.group, win.group, sky, lamp, bulb, yawn, ...zzz);
  const loop = 7.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { yawn: [0.3, 0.4], unyawn: [1.5, 0.3], off: [1.9, 0.5], down: [2.5, 0.9], up: [6.6, 0.7] });
      p.pose('Idle', 0.3);
      const sit = pre ? 1 : 1 - T.down + T.up, cover = 1 - sit;
      b.place(sit, cover);
      p.toMouth('R', T.yawn * (1 - T.unyawn));
      pop(yawn, T.yawn * (1 - T.unyawn), x0 + 0.4 * u, floor + 0.85 * u, 0.15 * u);
      // she reaches back and switches the lamp off; the light goes out
      const reach = pre ? 0 : bump(v, 1.8, 0.7);
      p.handTo('L', lamp.localToWorld(W.set(0, 0.28 * u, 0)), reach, { out: 0.6, down: 0.6 });
      const lit = pre ? 1 : 1 - between(v, 2.1, 2.2) + between(v, 6.6, 6.7); bulb.visible = lit > 0.5;
      // the moon rises in the window, the stars twinkle, Zzz floats up
      const dark = pre ? 0 : between(v, 2.2, 3.8) * (1 - between(v, 6.6, 7.2));
      win.rise(dark); sky.visible = dark > 0.1; sky.scale.setScalar(0.3 * u * grow(dark) * (0.9 + 0.1 * Math.sin(v * 5))); sky.idle?.(v);
      zzz.forEach((z, i) => { const f = ((pre ? 0 : v) - 3.6 - i * 0.5) / 1.6; const k = f > 0 && f < 1 && v < 6.6 ? Math.sin(Math.PI * f) : 0; pop(z, k, x0 + 0.15 * u + 0.12 * u * f + 0.05 * i * u, floor + 0.3 * u + 0.45 * u * f, 0.2 * u); });
    },
  };
}

// ---- 起 / 起きる ----
function wake(ctx, spec, stage) {
  const sun = spec.outcome === 'sun';
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.25 * u;
  const p = person(spec.who, u, 0.8), b = bed(u, p, x0, floor, 0.1 * u), bang = label(u, '!', '#e0a020', 0.2);
  const clock = sun ? null : emblemProp('alarm', 0.2 * u), ring = sun ? null : label(u, 'リリリ!', '#e04848', 0.12);
  const disc = sun ? solidProp([[G.sphere(0.1 * u, 0, 0, 0), 0xffb030]], 1.3) : null, win = sun ? windowWith(u, disc) : null;
  const song = sun ? label(u, '♪ ♪', '#3a8a5a', 0.12) : null, yawn = sun ? label(u, 'ふぁ〜', '#6a5ac0', 0.12) : null;
  const zzz = label(u, 'Zzz', '#4a5ac0', 0.12);
  if (clock) clock.position.set(x0 - 0.12 * u, floor + 0.1 * u, 0.15 * u);
  if (win) win.group.position.set(x0 + 0.6 * u, floor + 0.85 * u, -0.45 * u);
  group.add(p.group, b.group, bang, zzz, ...[clock, ring, win?.group, song, yawn].filter(Boolean));
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', 0.3);
      if (!sun) {
        // asleep; the clock rings and hops; she sits bolt upright, slaps it quiet, stretches; lies down again at the end
        const T = timeline(v, { up: [2.0, 0.25, 'back'], slap: [2.6, 0.3], unslap: [3.1, 0.3], arms: [3.5, 0.5], down: [5.8, 0.8] });
        const sit = pre ? 0 : T.up * (1 - T.down), ringing = !pre && v > 1.0 && v < 2.9;
        b.place(sit, 0.3 + 0.7 * (1 - sit));
        clock.idle(ringing ? v : 0); clock.position.y = floor + 0.1 * u + (ringing ? 0.02 * u * Math.abs(Math.sin(v * 20)) : 0);
        pop(ring, ringing ? 1 : 0, x0 - 0.12 * u, floor + 0.42 * u + 0.01 * u * Math.sin(v * 30), 0.2 * u);
        pop(bang, pre ? 0 : bump(v, 2.0, 0.9) * 1.2, x0 + 0.5 * u, floor + 0.95 * u, 0.15 * u);
        p.handTo('R', clock.localToWorld(W.set(0, 0.6, 0)), T.slap * (1 - T.unslap), { out: 0.5, down: 0.5 });
        const st = T.arms * (1 - between(v, 5.0, 5.4));
        p.handTo('R', p.at('over', W, -0.1, 0.2, 0), st, { out: 0.4, down: 0.2 }); p.handTo('L', p.at('over', W, 0.1, 0.2, 0), st, { out: 0.4, down: 0.2 });
        pop(zzz, pre ? 1 : (1 - between(v, 1.0, 1.2)) + between(v, 6.4, 6.6), x0 + 0.2 * u, floor + 0.45 * u, 0.2 * u);
        return;
      }
      // the sun climbs in the window; birds sing; she sits up slowly, stretches, yawns
      const T = timeline(v, { dawn: [0.2, 1.6], up: [1.8, 1.0], arms: [3.0, 0.6], yawn: [4.2, 0.4], down: [6.0, 0.8] });
      const sit = pre ? 0 : T.up * (1 - T.down);
      win.rise(pre ? 0 : T.dawn * (1 - T.down));
      b.place(sit, 0.3 + 0.7 * (1 - sit));
      const st = T.arms * (1 - between(v, 4.0, 4.3));
      p.handTo('R', p.at('over', W, -0.1, 0.2, 0), st, { out: 0.4, down: 0.2 }); p.handTo('L', p.at('over', W, 0.1, 0.2, 0), st, { out: 0.4, down: 0.2 });
      p.toMouth('R', T.yawn * (1 - between(v, 5.2, 5.5)));
      pop(yawn, T.yawn * (1 - between(v, 5.2, 5.5)), x0 + 0.45 * u, floor + 0.85 * u, 0.15 * u);
      pop(song, pre ? 0 : bump(v, 0.8, 2.6) * 1.2, x0 + 0.85 * u, floor + 1.2 * u + 0.03 * u * Math.sin(v * 6), -0.4 * u);
      pop(zzz, pre ? 1 : (1 - between(v, 1.6, 1.8)) + between(v, 6.6, 6.8), x0 + 0.2 * u, floor + 0.45 * u, 0.2 * u);
    },
  };
}

// ---- 立 / 立つ ----
function stand(ctx, spec, stage) {
  if (spec.outcome === 'toddler') return toddler(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u, h = 0.9;
  const p = person(spec.who, u, h), sh = 0.12 * h * u;
  const stool = solidProp([[G.cyl(0.1 * u, 0.1 * u, 0.025 * u, 0, sh - 0.0125 * u, 0), 0x8a5a30], [G.cyl(0.012 * u, 0.012 * u, sh, -0.06 * u, sh / 2, 0), 0x6a4020], [G.cyl(0.012 * u, 0.012 * u, sh, 0.06 * u, sh / 2, 0), 0x6a4020]], 0.35);
  const dust = many(PUFF(u), 5, 0.4);
  group.add(stool, p.group, dust);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // seated; he pushes up (StandUp) and the kanji springs upright with him; at the end both sit back down
      const T = timeline(v, { up: [0.6, 0.6, 'back'], down: [4.5, 0.7, 'in'] }), up = pre ? 0 : T.up * (1 - T.down);
      poseGlyph(stage, -(B.maxY - B.minY) * (1 - up), 0, -Math.PI / 2 * (1 - up), B.maxX, B.minY);
      if (pre || v < 0.4) p.pose('SitDown', 1.0, false);
      else if (v < 1.5) p.pose('StandUp', (v - 0.4) * 1.0, false);
      else if (v < 4.3) p.pose('Idle', t);
      else p.pose('SitDown', Math.min(1.0, (v - 4.3) * 0.9), false);
      p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = LEFT + 0.8;
      stool.position.set(x0 + 0.06 * u, floor, -0.02 * u);
      const yay = pre ? 0 : between(v, 1.6, 1.9) * (1 - between(v, 3.2, 3.5));
      p.handTo('R', p.at('over', W, -0.15, 0.15, 0.05), yay, { out: 0.6, down: 0.2 }); p.handTo('L', p.at('over', W, 0.15, 0.15, 0.05), yay, { out: 0.6, down: 0.2 });
      puffs(dust, 0, 5, B.maxX - 0.2 * u, floor, pre ? 0 : between(v, 1.0, 1.6), u, 0.4); dust.commit();
    },
  };
}
function toddler(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u;
  const kid = person(spec.who, u, 0.48), mum = person(spec.other, u, 0.7), clap = label(u, 'パチパチ', '#e07a3a', 0.11);
  const box = solidProp([[G.box(0.18 * u, 0.05 * u, 0.14 * u, 0, 0.025 * u, 0), 0xf0b040], [G.box(0.05 * u, 0.05 * u, 0.05 * u, 0.12 * u, 0.025 * u, 0.04 * u), 0x48a8e0], [G.box(0.05 * u, 0.05 * u, 0.05 * u, -0.11 * u, 0.025 * u, 0.05 * u), 0xe05050]], 0.4);
  group.add(kid.group, mum.group, box, clap);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // she sits on a toy box, pushes up, wobbles with her arms out, stands; mum kneels facing her and claps
      const T = timeline(v, { up: [0.6, 1.2], down: [5.2, 0.8, 'in'] }), up = pre ? 0 : T.up * (1 - T.down);
      if (up < 0.02) kid.pose('SitDown', 1.0, false); else if (up < 0.99) kid.pose('StandUp', 0.1 + 0.85 * up, false); else kid.pose('Idle', t);
      const wob = (pre ? 0 : 1) * between(v, 1.2, 1.8) * (1 - between(v, 4.0, 4.8));
      kid.group.position.set(x0, floor, 0.12 * u); kid.group.rotation.set(0, RIGHT - 0.5, 0.12 * wob * Math.sin(v * 5));
      box.position.set(x0 - 0.02 * u, floor, 0.1 * u); box.visible = true;
      kid.handTo('R', kid.local(-0.6, 0.62, 0.15, W), wob, { out: 0.9, down: 0.3 }); kid.handTo('L', kid.local(0.6, 0.62, 0.15, W), wob, { out: 0.9, down: 0.3 });
      mum.pose('Idle', t); mum.turn('Abdomen', 0.25); mum.turn('Head', 0.2); mum.group.position.set(x0 + 0.5 * u, floor, -0.05 * u); mum.group.rotation.y = LEFT + 0.4;
      const c = pre ? 0 : between(v, 2.0, 2.2) * (1 - between(v, 4.4, 4.6));
      const s = 0.05 * Math.abs(Math.sin(v * 9)) * c;
      mum.handTo('R', mum.local(-0.04 - s, 0.62, 0.25, W), c, { out: 0.7, down: 0.6 }); mum.handTo('L', mum.local(0.04 + s, 0.62, 0.25, W), c, { out: 0.7, down: 0.6 });
      pop(clap, c, x0 + 0.55 * u, floor + 0.85 * u, 0.2 * u);
    },
  };
}

export const SCENES = { 'q-night': night, 'q-wake': wake, 'q-stand': stand };
