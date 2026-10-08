// Step 1 scenes, part J: liking, many, the four directions, middle, left, gold, ears, small, five.
//   hug-puppy      好: a kid kneels and hugs a puppy, which wags; hearts float up. outcome love: a big heart swells
//                  bigger and bigger and beats, hearts burst out (大好き); icecream: a kid licks an ice cream and gets
//                  heart eyes (好き)
//   candy-pile     多: a jar tips and candies pour out into a heap that keeps growing and spills over. outcome birds:
//                  birds keep flying in and landing on a wire until it is packed (多い)
//   maybe-shrug    多分: a person looks up at a grey cloud, shrugs, "?", and opens an umbrella just in case
//   compass-west / compass-east / compass-north / compass-south  西 東 北 南: a compass rose beside the kanji; the
//                  needle swings round and settles on its letter while that direction's picture plays: the sun sets in
//                  the west (W) as a crow flies home; the sun rises in the east (E); snow falls on a penguin under the
//                  north star (N); a palm tree sways in the hot south sun (S)
//   ring-middle    中: a ball drops through the air into the middle of a ring and settles in the dead centre; a target
//                  ring pulses
//   left-l         左: two hands rise palms out, thumbs out; the left one makes an L and lights up with an "L"
//   coin-tower     金: gold coins drop one after another and stack into a shining tower that wobbles and topples with
//                  a jingle. outcome wallet: a wallet opens and coins and notes spill out (お金); week: 金曜日
//   bunny-ears     耳: a bunny's long ears prick up at a sound (rings), swivel towards it and twitch
//   ant-tiny       小: a magnifying glass slides along the ground and finds a tiny ant, which waves. outcome dolls:
//                  nesting dolls open into smaller and smaller ones (小さい); seed: a hand opens on one tiny seed (小さな)
//   hand-five      五: a hand counts up its fingers, one at a time, counted 1-5. outcome count: five stars (五つ);
//                  day: the 5th (五日)
import * as THREE from 'three';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, HEART } from '../pieces/kit-things.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint } from './helpers.js';
import { grow, countTag, countScene, dayScene, withWeek, seeded } from './step1-kit.js';
import { dogParts } from './step1-a.js';
import { sit } from './step1-d.js';
import { birdThing } from './step1-c.js';

const tmp = new THREE.Vector3();
const heartsUp = (m, n, x, y, v, on, u, spread = 0.3) => { for (let i = 0; i < n; i++) { const f = ((v * 0.5 + i / n) % 1); m.set(i, x + spread * u * (i / (n - 1 || 1) - 0.5) + 0.05 * u * Math.sin(f * 6 + i), y + 0.45 * u * f, 0.1 * u, on * Math.sin(Math.PI * f)); } m.commit(); };

// ---- 好 like ----
function hugPuppy(ctx, spec, stage) {
  if (spec.outcome === 'love') return bigHeart(ctx, spec, stage);
  if (spec.outcome === 'icecream') return iceCream(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.85 * u, shirt: 0xff7aa0 }), dog = new THREE.Group(), { body, legs, tail } = dogParts(0.75 * u), tp = new THREE.Group(); tp.position.set(-0.16 * u, 0.28 * u, 0); tp.add(tail); dog.add(body, legs, tp);
  const hearts = many(HEART(u, 0.12), 4, 0.8);
  group.add(kid.group, dog, hearts);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, hug = pre ? 0 : between(v, 0.4, 0.9) * (1 - between(v, 4.6, 5.1)), squeeze = 1 + 0.05 * Math.sin(v * 4) * hug;
      kid.reset().face(0.5); kid.group.position.set(kx, floor, 0.0); sit(kid, 0.6 * hug); kid.group.position.y -= 0.12 * u * hug;
      for (const s of ['L', 'R']) { kid.bone(`arm${s}`).rotation.x = 1.2 * hug; kid.bone(`fore${s}`).rotation.x = 1.0 * hug; kid.raise(s, 0.3 * hug); }
      kid.bone('head').rotation.z = 0.3 * hug; kid.update();
      dog.position.set(kx + 0.32 * u, floor, 0.12 * u); dog.rotation.y = -Math.PI / 2 - 0.6; dog.scale.setScalar(squeeze);
      [[0.12, 0.15], [0.12, -0.15], [-0.12, 0.15], [-0.12, -0.15]].forEach(([lx, lz], i) => legs.set(i, lx * 0.75 * u, 0.22 * 0.75 * u, lz * 0.75 * u, 1, i > 1 ? 0.9 : 0)); legs.commit();
      tp.rotation.z = 0.5 + 0.7 * Math.sin(t * 16);
      heartsUp(hearts, 4, kx + 0.2 * u, floor + 0.7 * u, v, hug, u);
    },
  };
}
function bigHeart(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.6 * u, hy = B.cy;
  const heart = many(HEART(u, 0.55), 1, 0.8), small = many(HEART(u, 0.12), 8, 0.9), boom = burst(u, { s: 0.7, n: 12, color: 0xffe0f0 });
  group.add(boom, heart, small);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, g = pre ? 0 : between(v, 0, 2.4) * (1 - between(v, 4.6, 5.2)), beat = 1 + 0.12 * Math.max(0, Math.sin(v * 9)) * (g > 0.9 ? 1 : 0.3);
      heart.set(0, hx, hy, 0.02 * u, grow(0.3 + 1.2 * g) * beat); heart.commit();
      const b = pre ? 0 : between(v, 2.4, 3.4); boom.visible = b > 0 && b < 1; boom.scale.setScalar(grow(b * 1.3)); boom.position.set(hx, hy, -0.05 * u); boom.material.opacity = 1;
      for (let i = 0; i < 8; i++) { const a = i * 0.785, f = b; small.set(i, hx + Math.cos(a) * 0.6 * u * f, hy + Math.sin(a) * 0.5 * u * f, 0.05 * u, f > 0 && f < 1 ? 1 - f : 0, a); }
      small.commit();
    },
  };
}
function iceCream(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u;
  const kid = createPerson({ u: 0.9 * u, shirt: 0x40c0a0 }), cone = solidProp([[G.cone(0.06 * u, 0.18 * u, 0, -0.09 * u, 0, Math.PI), 0xe0a858], [G.sphere(0.07 * u, 0, 0.03 * u, 0), 0xffb0d0], [G.sphere(0.04 * u, 0.02 * u, 0.1 * u, 0), 0xfff4e0]], 0.55);
  const eyes = many(HEART(u, 0.07, 0xff3a6a), 2, 1.2), hearts = many(HEART(u, 0.1), 3, 0.8);
  group.add(kid.group, cone, eyes, hearts);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, lick = pre ? 0 : Math.max(bump(v, 0.5, 0.6), bump(v, 1.3, 0.6)), love = pre ? 0 : between(v, 1.9, 2.2) * (1 - between(v, 4.4, 4.8));
      kid.reset().face('toward'); kid.group.position.set(kx, floor + 0.04 * u * Math.abs(Math.sin(v * 6)) * love, 0.02 * u);
      kid.bone('armR').rotation.x = 1.2 + 0.4 * lick; kid.bone('foreR').rotation.x = 1.4 + 0.3 * lick; kid.bone('head').rotation.x = 0.15 * lick; kid.update();
      bonePoint(kid, 'handR', 0.6, tmp); cone.position.set(tmp.x, tmp.y + 0.1 * u, tmp.z + 0.02 * u); cone.visible = !pre;
      kid.rig.setColor('eyeL', love > 0.5 ? 0xffd2b0 : 0x1a1a24); kid.rig.setColor('eyeR', love > 0.5 ? 0xffd2b0 : 0x1a1a24);
      bonePoint(kid, 'head', 0.5, tmp); for (let i = 0; i < 2; i++) eyes.set(i, tmp.x + (i ? 0.04 : -0.04) * u * 0.9, tmp.y, tmp.z + 0.12 * u, love > 0.5 ? 1 + 0.15 * Math.sin(t * 8) : 0);
      eyes.commit(); heartsUp(hearts, 3, kx, floor + 1.0 * u, v, love, u, 0.25);
    },
  };
}

// ---- 多 many ----
function candyPile(ctx, spec, stage) {
  if (spec.outcome === 'birds') return birdsWire(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, jx = B.maxX + 0.3 * u, N = 30;
  const jar = solidProp([[G.cyl(0.13 * u, 0.13 * u, 0.3 * u, 0, 0.15 * u, 0, 0, 0, 0, 24), 0xc8e8ff]], 0.3); jar.material.transparent = true; jar.material.opacity = 0.5;
  const candies = many([[G.sphere(0.04 * u), 0xffffff], [G.cone(0.025 * u, 0.04 * u, 0.05 * u, 0, 0, -Math.PI / 2), 0xffffff], [G.cone(0.025 * u, 0.04 * u, -0.05 * u, 0, 0, Math.PI / 2), 0xffffff]], N, 0.7), COL = [0xff5a7a, 0xffd040, 0x5ab0ff, 0x60d070, 0xc080ff];
  for (let i = 0; i < N; i++) candies.setColorAt(i, new THREE.Color(COL[i % 5]));
  const r = seeded(31), heap = Array.from({ length: N }, (_, i) => { const row = Math.floor(Math.sqrt(i * 2)), x = (r() - 0.5) * (0.9 - row * 0.1); return [x, row * 0.07 + r() * 0.02]; }).sort((a, b) => a[1] - b[1]);
  jar.position.set(jx, floor + 0.55 * u, 0); jar.rotation.z = -2.2;
  group.add(jar, candies);
  const loop = 6.4, hx = jx + 0.5 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.6, 6.2);
      jar.rotation.z = -1.0 - 1.2 * (pre ? 0 : between(v, 0, 0.5)) * (1 - off);
      heap.forEach(([x, y], i) => { const at = 0.4 + i * 0.12, f = pre ? 0 : between(v, at, at + 0.4), sx = jx + 0.2 * u, sy = floor + 0.5 * u; candies.set(i, sx + (hx + x * u - sx) * f, sy + (floor + 0.04 * u + y * u - sy) * f + 0.15 * u * Math.sin(Math.PI * f), 0.05 * u, f > 0 ? 1 - off : 0, i * 1.3); });
      candies.commit();
    },
  };
}
function birdsWire(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.1 * u, x1 = B.maxX + 1.3 * u, wy = B.cy + 0.2 * u, N = 10;
  const wire = solidProp([[G.cyl(0.006 * u, 0.006 * u, x1 - x0, (x1 - x0) / 2, 0, 0, 0, 0, Math.PI / 2), 0x303030], [G.cyl(0.02 * u, 0.02 * u, 0.9 * u, 0, -0.45 * u, 0), 0x6a5040], [G.cyl(0.02 * u, 0.02 * u, 0.9 * u, x1 - x0, -0.45 * u, 0), 0x6a5040]], 0.35);
  const birds = many([[birdThing(0.24 * u).geometry, 0xffffff]], N, 0.5); const COL = [0x4a8ae0, 0xe05a8a, 0x40b060, 0xffb030, 0x8a5ad0]; for (let i = 0; i < N; i++) birds.setColorAt(i, new THREE.Color(COL[i % 5]));
  wire.position.set(x0, wy, -0.05 * u);
  group.add(wire, birds);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, off = pre ? 1 : between(v, 5.2, 5.9);
      for (let i = 0; i < N; i++) { const at = 0.2 + i * 0.3, f = pre ? 0 : between(v, at, at + 0.6), x = x0 + (0.06 + 0.11 * i) * u, y = wy - 0.005 * u; birds.set(i, x + 0.6 * u * (1 - f) + 0.8 * u * off, y + 0.5 * u * (1 - f) + 0.6 * u * off, -0.04 * u, f > 0 ? 1 : 0, 0.1 * Math.sin(t * 3 + i) * (f >= 1 ? 1 : 0), Math.PI); }
      birds.commit();
    },
  };
}
function maybeShrug(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0xd0903a }), cloud = many([[G.sphere(0.12 * u), 0x9aa0ac], [G.sphere(0.09 * u, 0.12 * u, -0.02 * u, 0), 0x9aa0ac], [G.sphere(0.09 * u, -0.12 * u, -0.02 * u, 0), 0x9aa0ac]], 1, 0.35), q = textPlane('?', { h: 0.24 * u, color: '#ffe040', weight: 900 });
  const umb = emblemProp('umbrella', 0.5 * u);
  group.add(p.group, cloud, q, umb);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { look: [0.2, 0.4], shrug: [1.0, 0.3], drop: [1.9, 0.3], umb: [2.6, 0.5, 'back'], close: [5.0, 0.5] });
      cloud.set(0, px + 0.45 * u + 0.03 * u * Math.sin(t), floor + 1.15 * u, -0.1 * u, pre ? 0 : 1); cloud.commit();
      p.reset().face(0.3); p.group.position.set(px, floor, 0.02 * u); p.bone('head').rotation.x = -0.4 * (T.look - T.umb * 0.5);
      const s = T.shrug - T.drop; p.raise('L', 0.9 * s); p.raise('R', 0.9 * s); p.bone('foreL').rotation.z = 1.4 * s; p.bone('foreR').rotation.z = -1.4 * s;
      const u2 = T.umb - T.close; if (u2 > 0) p.raise('R', 2.4 * u2);
      p.update();
      const k = pre ? 0 : between(v, 1.0, 1.3) * (1 - between(v, 2.4, 2.6)); q.visible = k > 0.01; q.scale.setScalar(grow(k)); q.position.set(px + 0.2 * u, floor + 1.05 * u, 0.06 * u);
      umb.visible = u2 > 0.02; umb.scale.setScalar(grow(u2) * 0.5 * u); bonePoint(p, 'handR', 0.6, tmp); umb.position.set(tmp.x, tmp.y + 0.25 * u * u2, tmp.z + 0.02 * u); umb.idle(t * 0);
    },
  };
}

// ---- 西 東 北 南 the compass ----
function compassScene(dir) {
  return function (ctx, spec, stage) {
    const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, cy = B.cy - 0.05 * u, R = 0.3 * u;
    const rose = solidProp([[G.cyl(R, R, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 40), 0xf4ecd8], [G.torus(R, 0.025 * u), 0xb08a40], ...[0, 1, 2, 3].map((i) => [G.cone(0.05 * u, R * 0.7, Math.sin(i * Math.PI / 2) * R * 0.45, Math.cos(i * Math.PI / 2) * R * 0.45, 0.02 * u, -i * Math.PI / 2), 0xc8b088])], 0.45);
    const letters = ['N', 'E', 'S', 'W'].map((l, i) => { const m = textPlane(l, { h: 0.1 * u, color: l === dir ? '#e02020' : '#404040', weight: 900 }); m.position.set(cx + Math.sin(i * Math.PI / 2) * R * 0.78, cy + Math.cos(i * Math.PI / 2) * R * 0.78, 0.03 * u); return m; });
    const needle = solidProp([[G.cone(0.035 * u, R * 0.75, 0, R * 0.375, 0), 0xe02020], [G.cone(0.035 * u, R * 0.75, 0, -R * 0.375, 0, Math.PI), 0x3a4048], [G.sphere(0.03 * u), 0xffd040]], 0.6);
    rose.position.set(cx, cy, 0); needle.position.set(cx, cy, 0.04 * u);
    group.add(rose, needle, ...letters);
    const target = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 }[dir], side = { N: 0, E: 1, S: 0, W: -1 }[dir];
    // the direction's picture, beside the compass
    const sun = solidProp([[G.sphere(0.13 * u), 0xffa030]], 1.3), extra = new THREE.Group(), anim = [];
    if (dir === 'W' || dir === 'E') {
      const hill = solidProp([[G.sphere(0.5 * u, 0, 0, 0, 1.4, 0.3, 0.2), 0x2a4a30]], 0.2); hill.position.set(cx + 0.55 * u, floor - 0.02 * u, -0.3 * u); extra.add(hill);
      if (dir === 'W') { const crow = solidProp([[G.sphere(0.05 * u, 0, 0, 0, 1.5, 0.8, 0.8), 0x101014], [G.poly([[-0.12 * u, 0.04 * u], [0, 0], [0.12 * u, 0.04 * u]], 0.012 * u), 0x101014]], 0.2); extra.add(crow); anim.push((v) => { const f = between(v, 1.5, 4.5); crow.visible = f > 0 && f < 1; crow.position.set(cx + 1.0 * u - 1.2 * u * f, floor + 0.9 * u + 0.05 * u * Math.sin(v * 9), -0.1 * u); crow.scale.y = 1 + 0.4 * Math.sin(v * 12); }); }
    } else if (dir === 'N') {
      const ice = solidProp([[G.box(0.6 * u, 0.08 * u, 0.3 * u, 0, -0.04 * u, 0), 0xe8f4ff]], 0.6), peng = solidProp([[G.sphere(0.1 * u, 0, 0.13 * u, 0, 0.9, 1.3, 0.9), 0x202028], [G.sphere(0.075 * u, 0, 0.12 * u, 0.04 * u, 0.85, 1.2, 0.7), 0xffffff], [G.sphere(0.06 * u, 0, 0.3 * u, 0), 0x202028], [G.cone(0.02 * u, 0.05 * u, 0, 0.29 * u, 0.07 * u, -Math.PI / 2), 0xffa020], [G.sphere(0.012 * u, -0.025 * u, 0.32 * u, 0.05 * u), 0xffffff], [G.sphere(0.012 * u, 0.025 * u, 0.32 * u, 0.05 * u), 0xffffff]], 0.45);
      const flakes = many([[G.sphere(0.015 * u), 0xffffff]], 10, 1.2); ice.position.set(cx + 0.6 * u, floor, 0); extra.add(ice, peng, flakes);
      anim.push((v, t) => { peng.position.set(cx + 0.6 * u, floor, 0.05 * u); peng.rotation.z = 0.15 * Math.sin(v * 5); for (let i = 0; i < 10; i++) { const f = ((v * 0.3 + i * 0.1) % 1); flakes.set(i, cx + 0.25 * u + (i % 5) * 0.18 * u, floor + 1.1 * u - 1.1 * u * f, 0.05 * u, 1); } flakes.commit(); });
    } else {
      const palm = solidProp([[G.cyl(0.03 * u, 0.045 * u, 0.7 * u, 0, 0.35 * u, 0, 0, 0, -0.12), 0x8a5a30], ...[0, 1, 2, 3, 4].map((i) => [G.sphere(0.2 * u, 0.06 * u + Math.cos(i * 1.257) * 0.13 * u, 0.72 * u, Math.sin(i * 1.257) * 0.05 * u, 1.3, 0.2, 0.5).rotateZ(0), 0x3aa040]), [G.sphere(0.035 * u, 0.06 * u, 0.66 * u, 0.05 * u), 0x6a4020]], 0.45);
      const sand = solidProp([[G.sphere(0.4 * u, 0, 0, 0, 1.4, 0.2, 0.6), 0xf0d890]], 0.4); palm.position.set(cx + 0.6 * u, floor, -0.05 * u); sand.position.set(cx + 0.6 * u, floor - 0.02 * u, -0.1 * u); extra.add(sand, palm);
      anim.push((v, t) => { palm.rotation.z = 0.05 * Math.sin(t * 1.5); });
    }
    group.add(sun, extra);
    const loop = 6.0;
    return {
      group,
      step(t) {
        const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
        const f = pre ? 0 : between(v, 0.2, 1.6), swing = target + (1 - f) * (2.6 + 0.6 * Math.sin(v * 3)) + 0.12 * wobble(v, 1.6, 0.8, 3);
        needle.rotation.z = pre ? 1.2 : swing;
        const g = pre ? 0 : between(v, 1.0, 4.4);
        if (dir === 'W') { sun.visible = true; sun.position.set(cx + 0.7 * u, floor + 0.9 * u - 0.95 * u * g, -0.35 * u); }
        else if (dir === 'E') { sun.visible = true; sun.position.set(cx + 0.7 * u, floor - 0.05 * u + 0.95 * u * g, -0.35 * u); }
        else if (dir === 'N') { sun.visible = !pre; sun.position.set(cx + 0.95 * u, floor + 1.05 * u, -0.3 * u); sun.scale.setScalar(0.4 + 0.15 * Math.sin(t * 5)); sun.material.userData.glow.value = 2.0; }
        else { sun.visible = true; sun.position.set(cx + 0.95 * u, floor + 1.0 * u, -0.35 * u); sun.scale.setScalar(1 + 0.08 * Math.sin(t * 3)); }
        anim.forEach((fn) => fn(v, t));
        letters.forEach((m, i) => { const hit = ['N', 'E', 'S', 'W'][i] === dir; m.scale.setScalar(hit ? 1 + 0.4 * (pre ? 0 : between(v, 1.6, 1.9)) : 1); });
        void side;
      },
    };
  };
}

// ---- 中 middle ----
function ringMiddle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u, cy = floor + 0.02 * u;
  const rings = solidProp([[G.torus(0.36 * u, 0.025 * u), 0xe04848], [G.torus(0.24 * u, 0.025 * u), 0xffffff], [G.torus(0.12 * u, 0.025 * u), 0xe04848], [G.cyl(0.04 * u, 0.04 * u, 0.01 * u, 0, 0, 0, Math.PI / 2), 0xffd040]], 0.6);
  const ball = solidProp([[G.sphere(0.07 * u), 0x3a7ae0], [G.torus(0.07 * u, 0.012 * u), 0xffffff]], 0.6), pulse = solidProp([[G.torus(0.1 * u, 0.012 * u), 0xffe060]], 1.4);
  rings.position.set(cx, cy + 0.0 * u, 0); rings.rotation.x = -Math.PI / 2 + 0.55; pulse.rotation.x = -Math.PI / 2 + 0.55;
  group.add(rings, ball, pulse);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const f = pre ? 0 : between(v, 0.3, 1.2), bounce = v > 1.2 ? 0.15 * u * Math.abs(Math.sin((v - 1.2) * 7)) * Math.max(0, 1 - (v - 1.2) * 1.4) : 0, away = pre ? 0 : between(v, 4.3, 4.8);
      ball.visible = !pre && away < 1; ball.position.set(cx + 0.5 * u * (1 - f) * (1 - f), cy + 0.07 * u + 0.9 * u * (1 - f * f) + bounce + 0.8 * u * away, 0.1 * u); ball.rotation.z = -v * 3;
      const p = pre ? 0 : between(v, 1.9, 2.8); pulse.visible = p > 0 && p < 1; pulse.scale.setScalar(1 + 3 * p); pulse.position.set(cx, cy + 0.01 * u, 0.01 * u);
    },
  };
}

// ---- 左 left ----
function leftL(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = B.cy - 0.15 * u;
  const L = createHand({ u: 0.6 * u, sleeve: 0x3a7ae0, side: -1 }), R = createHand({ u: 0.6 * u, sleeve: 0x3a7ae0, side: 1 });
  const glow = solidProp([[G.sphere(0.3 * u), 0x60ff90]], 1.2), mark = textPlane('L', { h: 0.25 * u, color: '#20c050', weight: 900 });
  glow.material.transparent = true;
  group.add(glow, L.group, R.group, mark);
  const LPOSE = { f: [0, 1, 1, 1], spread: 0.2, thumb: [-0.35, -0.1] };
  return {
    group,
    step(t) {
      const loop = 5.0, A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [0, 0.6, 'out'], l: [1.0, 0.5], down: [4.3, 0.6, 'in'] }), up = pre ? 0 : T.up - T.down;
      L.group.visible = R.group.visible = up > 0.01;
      L.pose('open', LPOSE, T.l); R.pose('open');
      L.group.position.set(cx - 0.25 * u, cy - 0.5 * u * (1 - up), 0.05 * u); L.group.rotation.set(0, 0, 0.12); R.group.position.set(cx + 0.25 * u, cy - 0.5 * u * (1 - up), 0.05 * u); R.group.rotation.set(0, 0, -0.12);
      const k = pre ? 0 : T.l * (1 - T.down); glow.visible = k > 0.01; glow.material.opacity = 0.35 * k; glow.position.set(cx - 0.25 * u, cy + 0.15 * u, 0); glow.scale.setScalar(1 + 0.08 * Math.sin(t * 5));
      mark.visible = k > 0.01; mark.scale.setScalar(grow(k)); mark.position.set(cx - 0.25 * u, cy + 0.6 * u, 0.06 * u);
    },
  };
}

// ---- 金 gold ----
const COIN = (u, s = 1) => [[G.cyl(0.09 * u * s, 0.09 * u * s, 0.03 * u * s, 0, 0, 0), 0xffc030], [G.cyl(0.065 * u * s, 0.065 * u * s, 0.032 * u * s, 0, 0, 0), 0xffdc60]];
export const coinThing = (s) => solidProp(COIN(s / 0.1, 1).map(([g, c]) => [g.rotateX(Math.PI / 2).translate(0, 0.09 * s / 0.1, 0), c]), 0.8);
function coinTower(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(coinTower, 4, ctx, spec, stage);
  if (spec.outcome === 'wallet') return walletSpill(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.45 * u, N = 9;
  const coins = many(COIN(u), N, 0.8), shine = many([[G.sphere(0.02 * u), 0xffffff]], 4, 1.8);
  group.add(coins, shine);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, fall = pre ? 0 : between(v, 4.2, 4.9), off = pre ? 1 : between(v, 5.8, 6.3), sway = 0.04 * Math.sin(v * 3) * between(v, 3.0, 4.2);
      for (let i = 0; i < N; i++) {
        const at = 0.2 + 0.3 * i, f = pre ? 0 : between(v, at, at + 0.3), y = floor + 0.015 * u + 0.033 * u * i, h = y - floor;
        const ang = (sway + 1.2 * fall) * (h / (0.3 * u)), x = tx + Math.sin(ang) * h + 0.4 * u * fall * (i / N) * (i % 2 ? 1 : 0.6), yy = floor + Math.cos(ang) * h * (1 - fall) + 0.02 * u * fall + 0.2 * u * Math.sin(Math.PI * fall) * (i / N);
        coins.set(i, x, f < 1 ? y + 0.8 * u * (1 - f) : yy, 0.02 * u, f > 0 ? 1 - off : 0, -ang * (1 - fall * 0.5) - fall * (i % 3), 0, 0);
      }
      coins.commit();
      for (let i = 0; i < 4; i++) { const g = ((t * 0.8 + i / 4) % 1); shine.set(i, tx + 0.1 * u * Math.cos(i * 2), floor + (0.1 + 0.08 * i) * u, 0.12 * u, !pre && v > 2.5 && v < 4.2 ? Math.sin(Math.PI * g) * 1.5 : 0); }
      shine.commit();
    },
  };
}
function walletSpill(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.4 * u;
  const base = solidProp([[G.box(0.4 * u, 0.03 * u, 0.26 * u, 0, 0, 0), 0x6a3a1a]], 0.4), flapP = new THREE.Group(), flap = solidProp([[G.box(0.4 * u, 0.03 * u, 0.26 * u, 0, 0, -0.13 * u), 0x7a4a24], [G.cyl(0.02 * u, 0.02 * u, 0.04 * u, 0, 0.02 * u, -0.24 * u), 0xffd040]], 0.4);
  flapP.add(flap); flapP.position.set(wx, floor + 0.05 * u, -0.13 * u); base.position.set(wx, floor + 0.02 * u, 0); base.rotation.x = 0.0;
  const coins = many(COIN(u, 0.8), 6, 0.8), notes = many([[G.box(0.24 * u, 0.12 * u, 0.005 * u, 0, 0, 0), 0x90d090], [G.cyl(0.03 * u, 0.03 * u, 0.006 * u, 0, 0, 0, Math.PI / 2), 0x509050]], 3, 0.6), yen = textPlane('¥', { h: 0.18 * u, color: '#ffd040', weight: 900 });
  group.add(base, flapP, coins, notes, yen);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, open = pre ? 0 : between(v, 0.2, 0.7) * (1 - between(v, 4.8, 5.3)), spill = pre ? 0 : between(v, 0.8, 2.2) * (1 - between(v, 4.6, 5.0));
      flapP.rotation.x = -2.2 * open;
      for (let i = 0; i < 6; i++) { const a = -0.4 + i * 0.35, f = between(spill, i * 0.08, 0.6 + i * 0.08); coins.set(i, wx + Math.cos(a) * 0.45 * u * f, floor + 0.05 * u + 0.35 * u * Math.sin(Math.PI * f) * 0.8 + 0.015 * u, 0.1 * u + Math.sin(a) * 0.1 * u * f, f > 0 ? 1 : 0, f * 6, 0, Math.PI / 2 * f); }
      coins.commit();
      for (let i = 0; i < 3; i++) { const f = between(spill, 0.1 + i * 0.15, 0.7 + i * 0.15); notes.set(i, wx + (i - 1) * 0.15 * u, floor + 0.08 * u + 0.4 * u * f, 0.02 * u, f > 0 ? 1 : 0, (i - 1) * 0.4 + 0.2 * Math.sin(v * 3 + i), 0, -0.5 * f); }
      notes.commit();
      const k = pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 4.6, 5.0)); yen.visible = k > 0.01; yen.scale.setScalar(grow(k)); yen.position.set(wx, floor + 0.85 * u, 0.05 * u);
    },
  };
}

// ---- 耳 bunny ears ----
function bunnyEars(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.45 * u;
  const head = solidProp([[G.sphere(0.2 * u, 0, 0.2 * u, 0, 1, 0.95, 0.9), 0xf0f0f4], [G.sphere(0.03 * u, -0.07 * u, 0.25 * u, 0.16 * u), 0x101018], [G.sphere(0.03 * u, 0.07 * u, 0.25 * u, 0.16 * u), 0x101018], [G.sphere(0.025 * u, 0, 0.17 * u, 0.18 * u), 0xff8aa0], [G.sphere(0.04 * u, -0.1 * u, 0.13 * u, 0.15 * u), 0xffc8d0], [G.sphere(0.04 * u, 0.1 * u, 0.13 * u, 0.15 * u), 0xffc8d0]], 0.5);
  const ear = (s) => { const p = new THREE.Group(), m = solidProp([[G.sphere(0.06 * u, 0, 0.22 * u, 0, 1, 3.6, 0.6), 0xf0f0f4], [G.sphere(0.035 * u, 0, 0.22 * u, 0.03 * u, 1, 3.2, 0.4), 0xffb0c0]], 0.5); p.add(m); p.position.set(bx + s * 0.09 * u, floor + 0.35 * u, -0.02 * u); return p; };
  const ears = [ear(-1), ear(1)], bell = emblemProp('note', 0.25 * u), rings = many([[G.torus(0.1 * u, 0.01 * u, Math.PI * 0.6, 0, 0, 0, -0.3 * Math.PI), 0xffe060]], 3, 1.2);
  head.position.set(bx, floor, 0);
  group.add(head, ...ears, bell, rings);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, perk = pre ? 0 : between(v, 1.0, 1.25) * (1 - between(v, 4.6, 5.2)), turn = pre ? 0 : between(v, 1.4, 1.9) * (1 - between(v, 4.6, 5.2));
      ears.forEach((e, i) => { const s = i ? 1 : -1; e.rotation.z = s * (0.9 * (1 - perk) + 0.1) + 0.15 * Math.sin(t * 9 + i) * (v > 2 && v < 4 ? 1 : 0); e.rotation.y = -0.8 * turn; });
      head.rotation.y = -0.4 * turn;
      const s = pre ? 0 : between(v, 0.6, 4.4); bell.visible = s > 0 && s < 1; bell.position.set(bx + 0.75 * u, floor + 0.8 * u, 0.0); bell.idle(t);
      for (let i = 0; i < 3; i++) { const g = ((v * 1.2 + i / 3) % 1); rings.set(i, bx + 0.65 * u - 0.25 * u * g, floor + 0.75 * u, 0.0, s > 0 && s < 1 ? 1 + g : 0, Math.PI); }
      rings.commit();
    },
  };
}

// ---- 小 small ----
function antTiny(ctx, spec, stage) {
  if (spec.outcome === 'dolls') return nestingDolls(ctx, spec, stage);
  if (spec.outcome === 'seed') return tinySeed(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.55 * u;
  const ant = solidProp([[G.sphere(0.012 * u, -0.02 * u, 0.012 * u, 0), 0x101010], [G.sphere(0.009 * u, 0, 0.012 * u, 0), 0x101010], [G.sphere(0.008 * u, 0.016 * u, 0.014 * u, 0), 0x101010]], 0.3);
  const glassP = new THREE.Group(), glass = solidProp([[G.torus(0.16 * u, 0.02 * u), 0x404858], [G.cyl(0.02 * u, 0.025 * u, 0.3 * u, 0.22 * u, -0.22 * u, 0, 0, 0, 0.785), 0x6a3a1a]], 0.45), lens = solidProp([[G.cyl(0.15 * u, 0.15 * u, 0.01 * u, 0, 0, 0, Math.PI / 2), 0xc8e8ff]], 0.3);
  lens.material.transparent = true; lens.material.opacity = 0.35; glassP.add(glass, lens);
  const big = solidProp([[G.sphere(0.04 * u, -0.06 * u, 0.04 * u, 0, 1.2, 1, 1), 0x202020], [G.sphere(0.03 * u, 0, 0.04 * u, 0), 0x202020], [G.sphere(0.035 * u, 0.055 * u, 0.05 * u, 0), 0x202020], [G.sphere(0.008 * u, 0.07 * u, 0.06 * u, 0.03 * u), 0xffffff], ...[-0.03, 0, 0.03].map((x) => [G.cyl(0.004 * u, 0.004 * u, 0.06 * u, x * u, 0.015 * u, 0.02 * u, 0.5, 0, 0.6), 0x202020]), [G.cyl(0.004 * u, 0.004 * u, 0.06 * u, 0.07 * u, 0.1 * u, 0, 0, 0, -0.5), 0x202020]], 0.3);
  group.add(ant, glassP, big);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.2, 1.8), stay = pre ? 0 : between(v, 1.8, 2.1) * (1 - between(v, 4.6, 5.0));
      const gx = ax + 0.7 * u * (1 - f) + 0.6 * u * (pre ? 0 : between(v, 4.8, 5.6)); ant.position.set(ax + 0.01 * u * Math.sin(t * 3), floor, 0.15 * u); ant.visible = !pre;
      glassP.position.set(gx, floor + 0.2 * u, 0.2 * u); glassP.visible = !pre;
      big.visible = stay > 0.01; big.scale.setScalar(grow(stay)); big.position.set(gx, floor + 0.14 * u, 0.22 * u); big.rotation.z = 0.15 * Math.sin(v * 6) * stay;
    },
  };
}
function nestingDolls(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.3 * u;
  const doll = (s, c) => [[G.sphere(0.12 * u * s, 0, 0.12 * u * s, 0, 1, 1.15, 1), c], [G.sphere(0.085 * u * s, 0, 0.3 * u * s, 0), c], [G.sphere(0.06 * u * s, 0, 0.3 * u * s, 0.04 * u * s, 1, 1, 0.6), 0xffe0c8], [G.sphere(0.06 * u * s, 0, 0.12 * u * s, 0.07 * u * s, 1, 1, 0.5), 0xfff0e0]];
  const COL = [0xe03838, 0x3a7ae0, 0x40b060, 0xffb030], dolls = COL.map((c, i) => solidProp(doll(1.6 * Math.pow(0.68, i), c), 0.5));
  group.add(...dolls);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, back = pre ? 0 : between(v, 4.6, 5.6);
      let x = dx;
      dolls.forEach((d, i) => { const out = i === 0 ? 1 : (pre ? 0 : between(v, 0.4 + 0.8 * (i - 1), 0.9 + 0.8 * (i - 1))) * (1 - back), s = 1.6 * Math.pow(0.68, i); if (i) x += 0.32 * u * Math.pow(0.68, i - 1) * 1.2 * out; d.position.set(x, floor + 0.04 * u * Math.abs(Math.sin(v * 5 + i)) * out, 0.02 * u * i); d.visible = !pre && (i === 0 || out > 0.02); d.scale.setScalar(i ? grow(0.3 + 0.7 * out) : 1); void s; });
    },
  };
}
function tinySeed(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.45 * u;
  const hand = createHand({ u: 0.7 * u, sleeve: 0x8a6a40 }), seed = solidProp([[G.sphere(0.018 * u, 0, 0, 0, 1.3, 0.9, 0.9), 0x8a5a30]], 0.6), ring = solidProp([[G.torus(0.05 * u, 0.006 * u), 0xffe060]], 1.4);
  group.add(hand.group, seed, ring);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, open = pre ? 0 : between(v, 0.6, 1.2) * (1 - between(v, 4.2, 4.7));
      hand.pose('grip', 'flat', open); hand.group.position.set(hx, floor + 0.05 * u, 0.1 * u); hand.group.rotation.set(-1.2, 0, 0); hand.group.visible = !pre;
      seed.position.set(hx, floor + 0.12 * u, 0.28 * u); seed.visible = open > 0.6;
      const p = pre ? 0 : between(v, 1.3, 2.3); ring.visible = open > 0.6; ring.position.set(hx, floor + 0.13 * u, 0.29 * u); ring.scale.setScalar(1 + 0.5 * Math.sin(t * 4) * 0.3); ring.rotation.x = -1.2; void p;
    },
  };
}

// ---- 五 five ----
const STAR = (u, s = 1) => { const sh = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2 + Math.PI / 2, d = i % 2 ? 0.045 : 0.1; i ? sh.lineTo(Math.cos(a) * d * s, Math.sin(a) * d * s) : sh.moveTo(Math.cos(a) * d * s, Math.sin(a) * d * s); } return [[G.extrude(sh, 0.04).scale(u, u, u), 0xffd040]]; };
export const starThing = (s) => solidProp(STAR(s / 0.2, 1).map(([g, c]) => [g.translate(0, 0.1 * s / 0.2, 0), c]), 0.8);
function handFive(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') return countScene(ctx, stage, 5, many(STAR(1.4 * u), 5, 0.8), Array.from({ length: 5 }, (_, i) => [B.maxX + (0.3 + (i % 3) * 0.28) * u + (i > 2 ? 0.14 * u : 0), floor + 0.15 * u + (i > 2 ? 0.3 * u : 0)]), { tagUp: 0.35 });
  if (spec.outcome === 'day') return dayScene(ctx, stage, 5, starThing);
  const group = new THREE.Group(), hand = createHand({ u: 0.75 * u, sleeve: 0xe0a040 }), tag = countTag(u, { s: 0.26 }), hx = B.maxX + 0.5 * u;
  group.add(hand.group, tag);
  const loop = 6.0, ORDER = ['t', 0, 1, 2, 3];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, close = pre ? 1 : between(v, 4.8, 5.4);
      let n = 0; const f = [1, 1, 1, 1], th = [0.9, 0.8];
      ORDER.forEach((k, i) => { const o = pre ? 0 : between(v, 0.5 + 0.6 * i, 0.8 + 0.6 * i) * (1 - close); if (o > 0.5) n = i + 1; if (k === 't') { th[0] = 0.9 - 1.2 * o; th[1] = 0.8 - 0.9 * o; } else f[k] = 1 - o; });
      hand.pose({ f, spread: 1 - f.reduce((a, b) => a + b, 0) / 4, thumb: th });
      hand.group.position.set(hx, B.minY - 0.05 * u, 0.05 * u); hand.group.rotation.set(0, 0, 0); hand.group.visible = !pre;
      tag.show(Math.max(1, n), n ? 1 : 0); tag.position.set(hx + 0.4 * u, floor + 0.85 * u, 0.06 * u); tag.scale.multiplyScalar(1 + 0.2 * bump(v, 0.5 + 0.6 * (n - 1), 0.3));
    },
  };
}

export const SCENES = { 'hug-puppy': hugPuppy, 'candy-pile': candyPile, 'maybe-shrug': maybeShrug, 'compass-west': compassScene('W'), 'compass-east': compassScene('E'), 'compass-north': compassScene('N'), 'compass-south': compassScene('S'), 'ring-middle': ringMiddle, 'left-l': leftL, 'coin-tower': coinTower, 'bunny-ears': bunnyEars, 'ant-tiny': antTiny, 'hand-five': handFive };
