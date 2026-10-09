// Model scenes with the Everything Library animals (static models: no clips, no rig), moved by hand: a walking bob, a
// stretch, wings that flap through a vertex bend (flap()). Animals face +z like every model.
//   q-cat    猫: a cat pads in, turns to you, stretches and meows ニャー, rubs against the kanji (hearts), pads off
//   q-bird   鳥: a pigeon flies in flapping, lands on a branch growing out of the kanji, pecks and coos ポッポー, flies off
//   q-pet    ペット: a person crouches by a cat and strokes its back; the cat leans into the hand, hearts
//   q-egg    卵: a hen fluffs up, hops, and an egg is under her; she looks down at it (!), コケコッコー
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { actor } from './model-kit.js';
import { many, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2;
const lerp = (a, b, f) => a + (b - a) * f;
const label = (u, text, bg, h = 0.14) => textPlane(text, { h: h * u, color: '#ffffff', bg, pad: 0.25 });
const pop = (m, k, x, y, z) => { m.visible = k > 0.01; m.scale.setScalar(grow(k)); m.position.set(x, y, z); };
// a padding walk: a little bob and roll while `on`
const gait = (m, t, on, u) => { m.position.y += on * 0.02 * u * Math.abs(Math.sin(t * 9)); m.rotation.z = on * 0.05 * Math.sin(t * 9); };
const hearts = (h, n, x, y, z, v, at, u) => { for (let i = 0; i < n; i++) { const f = between(v, at + i * 0.3, at + 1.1 + i * 0.3); h.set(i, x + 0.13 * u * (i - 1), y + 0.35 * u * f, z, f > 0 && f < 1 ? 1.3 * Math.sin(Math.PI * f) : 0); } h.commit(); };

// Wings that flap: vertices further than `body` (a share of the half span) from the middle bend up and down by `uFlap`.
// The model gets its own materials (ownMaterials) so the bend does not reach other copies.
function flap(model, body = 0.18) {
  const mesh = []; model.group.traverse((o) => { if (o.isMesh) mesh.push(o); });
  const half = Math.max(...mesh.map((o) => { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; return Math.max(-b.min.x, b.max.x); }));
  const k = { value: 0 }, w = { value: body * half }, span = { value: half };
  for (const o of mesh) {
    const m = o.material, before = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      before?.call(m, sh, r);
      Object.assign(sh.uniforms, { uFlap: k, uBody: w, uSpan: span });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uFlap, uBody, uSpan;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat fx = max(abs(transformed.x) - uBody, 0.0);\ntransformed.y += fx * uFlap;\ntransformed.x -= sign(transformed.x) * fx * (1.0 - cos(atan(uFlap))) * 0.6;');
    };
    const key = m.customProgramCacheKey?.() ?? '';
    m.customProgramCacheKey = () => `${key}-flap`;
    m.needsUpdate = true;
  }
  return (a) => { k.value = a; };          // a: wing tip rise per unit out (about -0.8 .. 0.8)
}

// ---- 猫 ----
function cat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, home = B.maxX + 0.45 * u, far = B.maxX + 1.3 * u;
  const c = createModel('cat', { height: 0.65 * u }), meow = label(u, 'ニャー', '#c07a3a'), love = many(HEART(u, 0.08), 3, 1);
  group.add(c.group, meow, love);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.8, 'out'], face: [1.8, 0.4], stretch: [2.3, 0.6], back: [3.3, 0.5], rub: [4.0, 0.5], leave: [6.0, 1.8, 'in'] });
      const walking = !pre && ((T.come > 0 && T.come < 1) || (T.leave > 0 && T.leave < 1));
      const rubbing = !pre && v > 4.2 && v < 5.6;
      const x = pre ? far : lerp(far, home, T.come) - 0.22 * u * (T.rub - between(v, 5.6, 5.9)) + (far - home) * T.leave;
      c.group.position.set(x + (rubbing ? 0.04 * u * Math.sin(v * 5) : 0), floor, 0.05 * u);
      c.group.rotation.set(0, pre ? -0.5 : T.leave > 0 ? lerp(-0.5, RIGHT - 0.4, between(v, 5.8, 6.1)) : lerp(LEFT + 0.4, -0.5, T.face), 0);
      gait(c.group, v, walking ? 1 : 0, u);
      // the stretch: front low and long, then back up
      const s = T.stretch * (1 - T.back);
      c.group.scale.set(1, 1 - 0.12 * s + (pre ? 0.015 * Math.sin(t * 2.4) : 0), 1 + 0.18 * s);
      c.group.rotation.x = 0.18 * s;
      if (rubbing) c.group.rotation.z = 0.12 * Math.sin(v * 5);
      pop(meow, pre ? 0 : between(v, 2.6, 2.9) * (1 - between(v, 3.8, 4.0)), home + 0.1 * u, floor + 0.85 * u, 0.15 * u);
      hearts(love, 3, home - 0.15 * u, floor + 0.55 * u, 0.15 * u, pre ? -1 : v, 4.3, u);
    },
  };
}

// ---- 鳥 ----
function bird(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), perch = [B.maxX + 0.28 * u, B.maxY - 0.22 * u];
  // a branch sticks out of the kanji's right side; the bird lands on it
  const branch = solidProp([[G.cyl(0.018 * u, 0.026 * u, 0.55 * u, 0, 0, 0, 0, 0, Math.PI / 2 - 0.08), 0x7a5230], [G.sphere(0.06 * u, 0.24 * u, 0.04 * u, 0, 1.4, 0.6, 1), 0x58b848], [G.sphere(0.05 * u, -0.05 * u, 0.03 * u, 0.02 * u, 1.3, 0.6, 1), 0x58b848]], 0.4);
  branch.position.set(B.maxX + 0.15 * u, perch[1] - 0.02 * u, 0); group.add(branch);
  const fly = createModel('pigeonFlying', { width: 1.0 * u, ownMaterials: true }), sit = createModel('pigeon', { height: 0.45 * u });
  const wings = flap(fly), coo = label(u, 'ポッポー', '#6a7a9a');
  group.add(fly.group, sit.group, coo);
  const loop = 7.6, from = [B.maxX + 1.4 * u, B.maxY + 0.9 * u, -0.3 * u], to = [B.minX - 0.6 * u, B.maxY + 1.0 * u, -0.6 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.6, 'out'], go: [5.4, 1.8, 'in'] });
      const flying = !pre && ((T.come < 1) || (T.go > 0 && T.go < 1));
      fly.group.visible = flying; sit.group.visible = !pre && !flying;
      if (flying) {
        const out = T.go > 0, f = out ? T.go : T.come, a = out ? perch : from, b = out ? to : perch;
        const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) + 0.25 * u * Math.sin(Math.PI * f) * (out ? 1 : -0.5), z = lerp(out ? 0 : a[2], out ? b[2] : 0, f);
        fly.group.position.set(x, y - 0.05 * u, z);
        fly.group.rotation.set(out ? -0.25 : 0.2, out ? -2.4 : -0.6, 0);
        wings(0.75 * Math.sin(v * 13) * (out ? 1 : 1 - 0.6 * f));
      }
      // on the kanji: hops round to you, pecks twice, coos
      const peck = bump(v, 2.2, 0.35) + bump(v, 2.8, 0.35), hop = bump(v, 1.65, 0.3) + bump(v, 4.6, 0.3);
      sit.group.position.set(perch[0], perch[1] + 0.06 * u * hop, 0);
      sit.group.rotation.set(0.7 * peck, lerp(-0.6, 0.2, between(v, 1.6, 2.0)) + 0.5 * between(v, 4.5, 4.8), 0);
      if (!pre && v > 3.4 && v < 4.4) sit.group.scale.set(1.08, 1.08, 1.08); else sit.group.scale.set(1, 1, 1);   // puffs up to coo
      pop(coo, pre ? 0 : between(v, 3.4, 3.6) * (1 - between(v, 4.3, 4.5)), perch[0] + 0.3 * u, perch[1] + 0.45 * u, 0.1 * u);
    },
  };
}

// ---- ペット ----
function pet(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, px = cx + 0.4 * u;
  const c = createModel('cat', { height: 0.42 * u }), who = actor(spec.who, 0.85 * u), love = many(HEART(u, 0.08), 3, 1);
  group.add(c.group, who.group, love);
  const back = new THREE.Vector3(), loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { down: [0.2, 0.7], up: [5.0, 0.8] }), k = T.down * (1 - T.up);
      // crouching: the PickUp clip held at its lowest, the hand strokes along the cat's back
      who.pose(k > 0.05 ? 'PickUp' : 'Idle', k > 0.05 ? 0.45 * k : t, false);
      who.group.position.set(px, floor, 0.05 * u); who.group.rotation.y = LEFT + 0.6;
      c.group.position.set(cx, floor, 0.12 * u); c.group.rotation.set(0, 0.6, (pre ? 0 : 0.08 * k * Math.sin(v * 2.6)));
      const stroke = Math.sin(v * 2.6) * 0.5 + 0.5;
      group.localToWorld(back.set(cx + lerp(0.06, -0.06, stroke) * u, floor + 0.37 * u, 0.12 * u + lerp(0.06, -0.06, stroke) * u));
      who.handTo('R', back, pre ? 0 : between(v, 0.7, 1.1) * (1 - between(v, 4.7, 5.0)), { out: 0.3, down: 0.6 });
      hearts(love, 3, cx, floor + 0.5 * u, 0.2 * u, pre ? -1 : v, 2.0, u);
    },
  };
}

// ---- 卵 ----
function egg(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.6 * u;
  const hen = createModel('chicken', { height: 0.6 * u }), crow = label(u, 'コケコッコー', '#c0503a', 0.12), bang = label(u, '!', '#e0a020', 0.2);
  const e = solidProp([[G.sphere(0.095 * u, 0, 0.11 * u, 0, 0.8, 1.05, 0.8), 0xfff4e0]], 0.6);
  const nest = solidProp([[G.torus(0.13 * u, 0.04 * u).rotateX(Math.PI / 2), 0xb08848]], 0.4);
  nest.position.set(hx, floor + 0.03 * u, 0.05 * u);
  group.add(nest, e, hen.group, crow, bang);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fluff: [0.3, 0.5], hop: [1.2, 0.6], step: [1.2, 0.6], look: [2.0, 0.4], away: [6.2, 0.6] });
      const fl = T.fluff * (1 - T.hop), hop = bump(v, 1.2, 0.6);
      hen.group.position.set(hx + 0.25 * u * T.step * (1 - T.away), floor + 0.25 * u * hop + 0.02 * u, 0);
      hen.group.scale.set(1 + 0.1 * fl, 1 - 0.05 * fl, 1 + 0.1 * fl);
      hen.group.rotation.set(0.45 * T.look * (1 - between(v, 4.6, 5.0)), -0.4 - 0.5 * T.look * (1 - T.away), 0);
      // the egg is there once she hops off it; it rocks; at the loop's end she settles back on it
      const shown = !pre && v > 1.3 && v < 6.6;
      e.visible = shown; e.position.set(hx, floor, 0.05 * u); e.rotation.z = shown ? 0.15 * Math.sin(v * 6) * between(v, 2.4, 2.6) * (1 - between(v, 3.6, 3.8)) : 0;
      pop(bang, pre ? 0 : bump(v, 2.2, 0.8) * 1.2, hx + 0.25 * u, floor + 0.8 * u, 0.1 * u);
      pop(crow, pre ? 0 : between(v, 4.6, 4.9) * (1 - between(v, 5.8, 6.0)), hx + 0.15 * u, floor + 0.85 * u, 0.15 * u);
    },
  };
}

export const SCENES = { 'q-cat': cat, 'q-bird': bird, 'q-pet': pet, 'q-egg': egg };
