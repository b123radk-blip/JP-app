// Step 1 scenes, part A (the Step 2c pilot): numbers, the moon, a river, up, a dog, a car, a mouth.
//   three-ducks  三: three ducks waddle in a row up beside the kanji; each quacks in turn, a badge counting 1, 2, 3, and
//                the stroke of 三 that matches it hops; then they turn and waddle off. outcome count: three dango drop onto
//                a stick (三つ); day: the month grid lights to the 3rd and a duck hops onto it (三日)
//   moon-wax     月: in the night beside the kanji the moon grows from a thin crescent to full, glows, and wanes away
//                again while stars twinkle. outcome week: smaller, with the weekday strip lighting 月 (月曜日)
//   river-flow   川: grass on the banks; the three strokes ripple like running water, a paper boat drifts down the middle
//                one, twirls at the bottom and floats away downstream
//   balloon-up   上: a gift box pops open and a red balloon rises out of it, up past the kanji to float above it, bobbing,
//                then sails off upwards as the next one rises. outcome flag: a flag is hauled up a pole to the top (上げる)
//   dog-fetch    犬: a dog sits wagging beside the kanji; a ball bounces in from the far side, the dog dashes after it,
//                brings it back in its mouth, drops it and wags, jumping for joy
//   car-beep     車: a car comes up a road from the distance, growing, parks beside the kanji, beeps twice with its lights
//                flashing, and backs away down the road
//   mouth-open   口: the glyph is a mouth: its bottom stroke drops like a jaw showing teeth and a tongue that pokes out and
//                waggles; it shuts, then opens wide for a big "あー" and shuts again
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, ball, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, puffs } from './helpers.js';
import { seeded, grow, withWeek, countScene, dayScene } from './step1-kit.js';

// ---- 三 three ducks ----
const DUCK = (u) => [
  [G.sphere(0.16 * u, 0, 0.17 * u, 0, 1.35, 0.85, 0.9), 0xffd23a], [G.sphere(0.1 * u, 0.15 * u, 0.36 * u, 0), 0xffd23a],
  [G.cone(0.045 * u, 0.12 * u, 0.28 * u, 0.34 * u, 0, -Math.PI / 2), 0xff8a20], [G.sphere(0.022 * u, 0.19 * u, 0.4 * u, 0.075 * u), 0x101018],
  [G.cone(0.06 * u, 0.12 * u, -0.22 * u, 0.24 * u, 0, Math.PI / 2 + 0.6), 0xffd23a], [G.box(0.05 * u, 0.1 * u, 0.04 * u, 0, 0.04 * u, 0.04 * u), 0xff8a20],
];
export const duckThing = (s) => { const m = solidProp(DUCK(s / 0.5), 0.5); return m; };

function threeDucks(ctx, spec, stage) {
  const u = stage.u, B = stage.box, floor = B.minY;
  if (spec.outcome === 'count') {
    const dango = many([[G.sphere(0.12 * u, 0, 0, 0), 0xffffff]], 3, 0.5), cols = [0xff9ab8, 0xf8f4e8, 0x8ad070];
    cols.forEach((c, i) => dango.setColorAt(i, new THREE.Color(c)));
    const s = countScene(ctx, stage, 3, dango, [0, 1, 2].map((i) => [B.maxX + 0.45 * u, floor + (0.25 + 0.23 * i) * u]), { tagUp: 0, tagDx: 0.27 });
    const stick = solidProp([[G.cyl(0.015 * u, 0.015 * u, 1.0 * u, 0, 0, 0), 0xd8b070]], 0.4); stick.position.set(B.maxX + 0.45 * u, floor + 0.45 * u, -0.02 * u);
    s.group.add(stick);
    return s;
  }
  if (spec.outcome === 'day') return dayScene(ctx, stage, 3, duckThing);
  const group = new THREE.Group(), ducks = many(DUCK(0.85 * u), 3, 0.5), tags = [1, 2, 3].map((n) => textPlane(String(n), { h: 0.22 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 }));
  group.add(ducks, ...tags);
  // the strokes of 三 from top to bottom
  const order = ctx.strokes.map((s, i) => [i, stage.strokeBox(i).cy]).sort((a, b) => b[1] - a[1]).map(([i]) => i);
  const loop = 6.4, X = (i) => B.maxX + (0.28 + 0.38 * i) * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.6, 'out'], turn: [4.4, 0.3], leave: [4.6, 1.6, 'in'] });
      for (let i = 0; i < 3; i++) {
        const q = 1.8 + 0.6 * i, quack = bump(v, q, 0.35), walking = (T.walk > 0 && T.walk < 1) || (T.leave > 0 && T.leave < 1);
        const x = X(i) + (1 - T.walk) * 1.6 * u + T.leave * 1.8 * u, face = T.turn > 0.5 ? 0 : Math.PI;
        ducks.set(i, x, floor + (walking ? 0.03 * u * Math.abs(Math.sin(v * 9 + i)) : 0) + 0.05 * u * quack, 0, pre ? 0 : 1, (walking ? 0.12 * Math.sin(v * 9 + i) : 0) + 0.2 * quack, face);
        const k = pre ? 0 : between(v, q, q + 0.25) * (1 - T.turn);
        tags[i].visible = k > 0.01; tags[i].scale.setScalar(grow(k)); tags[i].position.set(X(i), floor + 0.72 * u + 0.05 * u * quack, 0.05 * u);
        if (order[i] !== undefined) stage.offset(order[i], 0, 0.07 * u * quack, 0);
      }
      ducks.commit();
    },
  };
}

// ---- 月 the moon waxing ----
function moonWax(ctx, spec, stage) {
  if (spec.outcome === 'week') return withWeek(moonWax, 0, ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), R = 0.3 * u, mx = B.maxX + 0.6 * u, my = B.cy + 0.2 * u;
  const moon = moonDisc(R), halo = solidProp([[G.cyl(R * 1.45, R * 1.45, 0.001 * u, 0, 0, 0, Math.PI / 2, 0, 0, 40), 0xfff0b0]], 0.6);
  halo.material.transparent = true; halo.material.opacity = 0;
  const rnd = seeded(11), spots = Array.from({ length: 16 }, () => [rnd(), rnd(), rnd()]), stars = many([[G.sphere(0.014 * u), 0xfff6c0]], 16, 1.5);
  moon.position.set(mx, my, -0.1 * u); halo.position.set(mx, my, -0.16 * u);
  group.add(halo, moon, stars);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { wax: [0, 2.6], wane: [3.6, 2.6] });
      moon.phase(pre ? 0.08 : 0.08 + 0.42 * T.wax + 0.42 * T.wane);
      const full = pre ? 0 : bump(v, 2.2, 1.8); halo.material.opacity = 0.35 * full; halo.scale.setScalar(1 + 0.15 * full);
      spots.forEach(([a, b, c], i) => stars.set(i, B.maxX - 0.1 * u + a * 1.4 * u, B.minY + 0.1 * u + b * 1.1 * u, -0.3 * u, (0.5 + 0.6 * Math.abs(Math.sin(t * (1.2 + 2 * c) + i))) * (0.3 + 0.7 * (1 - full))));
      stars.commit();
    },
  };
}
// the moon as a painted disc: phase 0 new, 0.25 first quarter (right half lit), 0.5 full, 0.75 last quarter, 1 new
export function moonDisc(R) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  let shown = -1;
  m.phase = (p) => {
    const q = Math.round(((p % 1) + 1) % 1 * 96); if (q === shown) return; shown = q;
    const f = q / 96, r = 60, k = Math.cos(f * Math.PI * 2) * r, waxing = f < 0.5;
    g.clearRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(40,48,80,0.55)'; g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff4c8'; g.beginPath();
    g.arc(64, 64, r, -Math.PI / 2, Math.PI / 2, !waxing);                                      // the lit limb
    g.ellipse(64, 64, Math.abs(k), r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);       // the terminator
    g.fill();
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(200,180,120,0.5)';
    [[48, 50, 10], [76, 80, 8], [70, 40, 6]].forEach(([x, y, s]) => { g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill(); });
    g.globalCompositeOperation = 'source-over'; tex.needsUpdate = true;
  };
  return m;
}

// ---- 川 a river ----
function riverFlow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const hull = new THREE.Shape(); hull.moveTo(-0.16, 0.05); hull.lineTo(0.16, 0.05); hull.lineTo(0.1, -0.04); hull.lineTo(-0.1, -0.04); hull.closePath();
  const sail = new THREE.Shape(); sail.moveTo(-0.07, 0.05); sail.lineTo(0.07, 0.05); sail.lineTo(0.0, 0.17); sail.closePath();
  const boat = solidProp([[G.extrude(hull, 0.12).scale(u, u, u), 0xffffff], [G.extrude(sail, 0.02).scale(u, u, u), 0xff6a4a]], 0.7);
  const tufts = many([[G.cone(0.03 * u, 0.12 * u, 0, 0.06 * u, 0), 0x58b048], [G.cone(0.025 * u, 0.09 * u, 0.03 * u, 0.045 * u, 0, -0.3), 0x4aa040]], 6, 0.4);
  [-1, 1].forEach((sd, j) => [0, 1, 2].forEach((i) => tufts.set(j * 3 + i, (sd < 0 ? B.minX - 0.12 * u : B.maxX + 0.12 * u) + sd * 0.1 * u * i, B.minY + (0.15 + 0.35 * i) * u, 0.02 * u, 1.2)));
  tufts.commit();
  const sparkle = many([[G.sphere(0.018 * u), 0xe8f8ff]], 10, 1.4);
  group.add(tufts, boat, sparkle);
  // the middle stroke (by x) and its points from top to bottom
  const mid = ctx.strokes.map((s, i) => [i, stage.strokeBox(i).cx]).sort((a, b) => a[1] - b[1])[Math.floor(ctx.strokes.length / 2)][0];
  const pts = [...ctx.strokes[mid].pts].sort((a, b) => b.y - a.y);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, on = pre ? 0 : between(A.u, 0, 0.6);
      ctx.strokes.forEach((s, si) => stage.offset(si, 0.04 * u * on * Math.sin(t * 3.2 - si * 1.3), 0.01 * u * on * Math.sin(t * 2.1 + si), 0));
      const T = timeline(v, { fall: [0.4, 2.6, 'linear'], drift: [3.0, 2.4, 'in'] }), f = T.fall, p = pts[Math.min(pts.length - 1, Math.floor(f * (pts.length - 1)))];
      boat.visible = !pre && T.drift < 1;
      if (T.drift <= 0) boat.position.set(p.x + 0.025 * u * Math.sin(t * 3.2 - mid * 1.3) + 0.03 * u * Math.sin(v * 4), p.y + 0.03 * u, 0.06 * u);
      else boat.position.set(p.x + 1.5 * u * T.drift, floor - 0.02 * u + 0.02 * u * Math.sin(v * 5), 0.06 * u + 0.3 * u * T.drift);
      boat.rotation.set(0.25, 0.4 * Math.sin(v * 1.5), 0.15 * Math.sin(v * 3));
      for (let i = 0; i < 10; i++) { const si = i % ctx.strokes.length, sp = ctx.strokes[si].pts, ph = ((t * 0.45 + i * 0.37) % 1), q = sp[Math.floor(ph * (sp.length - 1))]; sparkle.set(i, q.x + 0.025 * u * Math.sin(t * 3.2 - si * 1.3), q.y, 0.04 * u, on * Math.sin(Math.PI * ph)); }
      sparkle.commit();
    },
  };
}

// ---- 上 up ----
function balloonUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u;
  if (spec.outcome === 'flag') return flagUp(ctx, spec, stage);
  const box = solidProp([[G.box(0.32 * u, 0.26 * u, 0.26 * u, 0, 0.13 * u, 0), 0x3a7ae0], [G.box(0.06 * u, 0.265 * u, 0.265 * u, 0, 0.13 * u, 0), 0xffd040], [G.box(0.36 * u, 0.06 * u, 0.3 * u, 0, 0.29 * u, 0), 0x2a62c8]], 0.4);
  const balloon = solidProp([[G.sphere(0.17 * u, 0, 0, 0, 1, 1.18, 1), 0xff3a4a], [G.cone(0.03 * u, 0.05 * u, 0, -0.21 * u, 0, Math.PI), 0xff3a4a], [G.sphere(0.04 * u, -0.06 * u, 0.08 * u, 0.13 * u), 0xffb0b8]], 0.7);
  const string = solidProp([[G.cyl(0.005 * u, 0.005 * u, 1, 0, 0.5, 0), 0xf0f0f0]], 0.6), trail = many([[G.sphere(0.02 * u), 0xffffff]], 6, 1.2);
  box.position.set(bx, floor, 0);
  group.add(box, balloon, string, trail);
  const loop = 5.2, top = B.maxY + 0.22 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pop: [0, 0.4, 'back'], rise: [0.5, 1.8, 'out'], away: [4.0, 1.2, 'in'] });
      const y = floor + 0.55 * u + (top - floor - 0.55 * u) * T.rise + 1.6 * u * T.away, x = bx - 0.25 * u * T.rise + 0.06 * u * Math.sin(v * 2), k = pre ? 0 : T.pop;
      balloon.visible = k > 0.01; balloon.scale.setScalar(grow(k)); balloon.position.set(x, y + 0.03 * u * Math.sin(v * 3), 0.02 * u); balloon.rotation.z = 0.08 * Math.sin(v * 2.4);
      const sy = y - 0.24 * u, len = Math.min(0.5 * u, Math.max(0.01, sy - floor - 0.3 * u) + 0.05 * u);
      string.visible = balloon.visible; string.position.set(x, sy - len, 0.02 * u); string.scale.set(1, len, 1); string.rotation.z = 0.1 * Math.sin(v * 2.4 + 1);
      box.position.y = floor + 0.02 * u * bump(v, 0, 0.3);
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : ((v * 0.8 + i / 6) % 1); trail.set(i, x + 0.12 * u * Math.sin(i * 2.3), y - 0.3 * u - f * 0.6 * u, 0.0, T.rise > 0 && T.away < 0.5 ? (1 - f) * 1.2 : 0); }
      trail.commit();
    },
  };
}
function flagUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, H = 1.05 * u;
  const pole = solidProp([[G.cyl(0.018 * u, 0.022 * u, H, 0, H / 2, 0), 0xd8dde6], [G.sphere(0.04 * u, 0, H + 0.02 * u, 0), 0xffd040], [G.cyl(0.12 * u, 0.14 * u, 0.06 * u, 0, 0.03 * u, 0), 0x6a6a72]], 0.4);
  const flag = solidProp([[G.box(0.42 * u, 0.28 * u, 0.01 * u, 0.21 * u, 0, 0), 0xffffff], [G.cyl(0.08 * u, 0.08 * u, 0.012 * u, 0.21 * u, 0, 0, Math.PI / 2), 0xe02020]], 0.6);
  const cheer = many([[G.box(0.04 * u, 0.04 * u, 0.01 * u), 0xffd040]], 8, 1.0);
  pole.position.set(px, floor, -0.02 * u);
  group.add(pole, flag, cheer);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [0.2, 2.2, 'linear'], down: [4.2, 0.9] }), h = T.up - T.down;
      const jerk = 0.03 * u * Math.abs(Math.sin(v * 7)) * (T.up > 0 && T.up < 1 ? 1 : 0);
      flag.position.set(px + 0.02 * u, floor + 0.2 * u + (H - 0.36 * u) * h + jerk, 0); flag.rotation.y = 0.25 * Math.sin(t * 4);
      const c = pre ? 0 : between(v, 2.4, 3.6);
      for (let i = 0; i < 8; i++) cheer.set(i, px + 0.25 * u + 0.4 * u * Math.cos(i * 0.8) * c, floor + H + 0.25 * u * Math.sin(i * 0.8 + 0.5) * c - 0.3 * u * c * c, 0.05 * u, c > 0 && c < 1 ? 1 : 0, i + v * 6);
      cheer.commit();
    },
  };
}

// ---- 犬 a dog ----
export function dogParts(u) {
  const body = solidProp([
    [G.sphere(0.16 * u, 0, 0.32 * u, 0, 1.5, 0.85, 0.85), 0xc88a48], [G.sphere(0.13 * u, 0.24 * u, 0.48 * u, 0), 0xc88a48],
    [G.sphere(0.07 * u, 0.36 * u, 0.44 * u, 0, 1.2, 0.8, 0.9), 0xe8c898], [G.sphere(0.03 * u, 0.43 * u, 0.47 * u, 0), 0x181818],
    [G.sphere(0.02 * u, 0.29 * u, 0.53 * u, 0.09 * u), 0x181818], [G.sphere(0.02 * u, 0.29 * u, 0.53 * u, -0.09 * u), 0x181818],
    [G.sphere(0.06 * u, 0.2 * u, 0.55 * u, 0.1 * u, 0.6, 1.4, 0.5), 0x7a4a20], [G.sphere(0.06 * u, 0.2 * u, 0.55 * u, -0.1 * u, 0.6, 1.4, 0.5), 0x7a4a20],
    [G.torus(0.09 * u, 0.018 * u, Math.PI * 2, 0.17 * u, 0.4 * u, 0, 1.0), 0xe02828],
  ], 0.4);
  const legs = many([[G.cyl(0.035 * u, 0.03 * u, 0.22 * u, 0, -0.11 * u, 0), 0xb87a40]], 4, 0.4);
  const tail = solidProp([[G.cyl(0.025 * u, 0.012 * u, 0.2 * u, 0, 0.1 * u, 0), 0xc88a48]], 0.4);
  return { body, legs, tail };
}
function dogFetch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, home = B.maxX + 0.4 * u, far = B.maxX + 1.15 * u;
  const dog = new THREE.Group(), { body, legs, tail } = dogParts(u), tailPivot = new THREE.Group();
  tailPivot.position.set(-0.22 * u, 0.38 * u, 0); tailPivot.add(tail); dog.add(body, legs, tailPivot);
  const toy = ball(u, { r: 0.07, color: 0x40c0ff, stripe: 0xffffff }), dust = many(PUFF(u), 6, 0.3), hearts = many([[G.sphere(0.03 * u), 0xff6a8a]], 3, 1);
  group.add(dog, toy, dust, hearts);
  const loop = 6.4, LEG = [[0.12, 0.15], [0.12, -0.15], [-0.12, 0.15], [-0.12, -0.15]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { throw: [0.4, 1.0, 'linear'], run: [0.9, 1.0, 'in'], back: [2.4, 1.1], drop: [3.6, 0.2] });
      const out = T.run - T.back, x = home + (far - home) * out, running = (T.run > 0 && T.run < 1) || (T.back > 0 && T.back < 1);
      const sit = !running, jump = pre ? 0 : 0.18 * u * (bump(v, 4.0, 0.45) + bump(v, 4.6, 0.45));
      dog.position.set(x, floor + jump + (running ? 0.03 * u * Math.abs(Math.sin(v * 14)) : 0), 0.05 * u);
      dog.rotation.y = T.run >= 1 && T.back < 1 && T.back > 0 ? Math.PI : 0; dog.rotation.z = sit ? 0.12 : 0;
      LEG.forEach(([lx, lz], i) => legs.set(i, lx * u, 0.22 * u, lz * u, 1, running ? 0.7 * Math.sin(v * 14 + (i % 2 ? Math.PI : 0) + (i > 1 ? 1 : 0)) : (sit && i > 1 ? 0.9 : 0)));
      legs.commit();
      tailPivot.rotation.z = (running ? -0.6 : 0.4) + (sit ? 0.6 * Math.sin(t * 16) : 0.2 * Math.sin(t * 8));
      // the ball: thrown in from the left high over the kanji, bounces to the far spot; carried back in the mouth; dropped
      let bx, by;
      if (pre || T.throw <= 0) { bx = home + 0.5 * u; by = floor + 0.07 * u; toy.visible = !pre && v > 4.2; }
      else if (T.run < 1) { const f = T.throw; bx = B.minX + (far + 0.4 * u - B.minX) * f; by = floor + 0.07 * u + Math.abs(Math.sin(f * Math.PI * 2.2)) * 0.9 * u * (1 - f); toy.visible = true; }
      else if (T.drop < 1) { const mouth = dog.rotation.y ? -0.42 : 0.42; bx = x + mouth * u; by = floor + jump + 0.43 * u; toy.visible = true; }
      else { bx = home + 0.5 * u; by = floor + 0.07 * u + 0.1 * u * bump(v, 3.6, 0.3); toy.visible = true; }
      toy.position.set(bx, by, 0.08 * u);
      puffs(dust, 0, 6, far, floor, pre ? 0 : (v - 1.9) / 0.6, u, 0.4); dust.commit();
      for (let i = 0; i < 3; i++) { const f = pre ? 0 : between(v, 4.0 + i * 0.3, 5.2 + i * 0.3); hearts.set(i, home + 0.2 * u + 0.1 * u * i, floor + 0.7 * u + 0.4 * u * f, 0.05 * u, f > 0 && f < 1 ? 1.4 * Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

// ---- 車 a car ----
export function carBody(u, { color = 0xe03a3a } = {}) {
  const g = new THREE.Group(), body = solidProp([
    [G.box(0.62 * u, 0.16 * u, 0.3 * u, 0, 0.16 * u, 0), color], [G.box(0.36 * u, 0.15 * u, 0.28 * u, -0.04 * u, 0.31 * u, 0), color],
    [G.box(0.3 * u, 0.11 * u, 0.285 * u, -0.04 * u, 0.31 * u, 0), 0x9ad8ff], [G.box(0.03 * u, 0.12 * u, 0.29 * u, -0.04 * u, 0.31 * u, 0), color],
    [G.box(0.02 * u, 0.05 * u, 0.08 * u, 0.31 * u, 0.17 * u, 0.09 * u), 0xfff4b0], [G.box(0.02 * u, 0.05 * u, 0.08 * u, 0.31 * u, 0.17 * u, -0.09 * u), 0xfff4b0],
  ], 0.45);
  const wheels = many([[G.cyl(0.075 * u, 0.075 * u, 0.06 * u, 0, 0, 0, Math.PI / 2), 0x202428], [G.cyl(0.035 * u, 0.035 * u, 0.065 * u, 0, 0, 0, Math.PI / 2), 0xc8ccd4], [G.box(0.11 * u, 0.02 * u, 0.066 * u, 0, 0, 0), 0xc8ccd4]], 4, 0.35);
  const lamps = many([[G.sphere(0.035 * u), 0xffffa0]], 2, 1.6);
  g.add(body, wheels, lamps);
  return Object.assign(g, { drawCalls: 3, roll(a, lit = 0) { [[0.2, 0.15], [0.2, -0.15], [-0.2, 0.15], [-0.2, -0.15]].forEach(([x, z], i) => wheels.set(i, x * u, 0.075 * u, z * u, 1, -a)); wheels.commit(); lamps.set(0, 0.33 * u, 0.17 * u, 0.09 * u, lit); lamps.set(1, 0.33 * u, 0.17 * u, -0.09 * u, lit); lamps.commit(); } });
}
function carBeep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.65 * u;
  const shape = new THREE.Shape(); shape.moveTo(-0.55, 0); shape.lineTo(0.55, 0); shape.lineTo(0.07, 1.1); shape.lineTo(-0.02, 1.1); shape.closePath();
  const strip = solidProp([[new THREE.ShapeGeometry(shape).scale(u, u, u), 0x4a4d58]], 0.15), dashes = many([[G.box(0.035 * u, 0.12 * u, 0.002 * u), 0xf0f0f0]], 5, 0.5);
  strip.position.set(px + 0.1 * u, floor - 0.06 * u, -0.25 * u);
  const car = carBody(u), beeps = many([[G.torus(0.07 * u, 0.012 * u, Math.PI * 0.6, 0, 0, 0, -0.3 * Math.PI), 0xffe060]], 4, 1.2);
  group.add(strip, dashes, car, beeps);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.8, 'out'], go: [4.3, 1.4, 'in'] }), d = pre ? 1 : 1 - T.come + T.go;     // 1 far, 0 here
      const s = 1 - 0.85 * d, x = px + (0.12 - 0.08 * d) * u, y = floor - 0.04 * u + 0.95 * u * d;
      car.position.set(x, y, -0.2 * u * d); car.scale.setScalar(grow(s)); car.rotation.y = -Math.PI / 2 + 0.35 * (1 - d) + 0.0;
      const beep = pre ? 0 : bump(v, 2.3, 0.45) + bump(v, 2.9, 0.45);
      car.roll(-(1 - d) * 18, d < 0.05 ? 0.8 + 1.2 * (bump(v, 2.3, 0.3) + bump(v, 2.9, 0.3)) : 0.3);
      car.position.y += 0.01 * u * beep;
      for (let i = 0; i < 4; i++) { const at = i < 2 ? 2.3 : 2.9, f = pre ? 0 : between(v, at + (i % 2) * 0.1, at + 0.5 + (i % 2) * 0.1); beeps.set(i, x - 0.05 * u + 0.15 * u * f * (i % 2 ? 1 : 0.6), floor + 0.5 * u + 0.12 * u * f, 0.1 * u, f > 0 && f < 1 ? 1 + 1.5 * f : 0); }
      beeps.commit();
      for (let i = 0; i < 5; i++) { const f = ((i / 5) + (pre ? 0 : 0)) % 1, w = 1 - f; dashes.set(i, px + 0.1 * u + 0.025 * u * f, floor - 0.04 * u + f * 1.05 * u, -0.24 * u, Math.max(0.15, w)); }
      dashes.commit();
    },
  };
}

// ---- 口 a mouth ----
function mouthOpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group();
  const flat = ctx.strokes.map((s, i) => [i, stage.strokeBox(i)]).filter(([, b]) => b.h < 0.3 * B.h).sort((a, b) => a[1].cy - b[1].cy);
  const bottom = flat[0]?.[0] ?? ctx.strokes.length - 1, top = ctx.strokes.map((s, i) => [i, stage.strokeBox(i).maxY]).sort((a, b) => b[1] - a[1])[0][0];
  const inside = solidProp([[G.box(B.w * 0.8, 1, 0.01 * u, 0, -0.5, 0), 0x5a0a14]], 0.3);
  const teethTop = solidProp(Array.from({ length: 5 }, (_, i) => [G.box(B.w * 0.13, 0.07 * u, 0.02 * u, (i - 2) * B.w * 0.15, -0.035 * u, 0), 0xffffff]), 0.6);
  const teethBot = teethTop.clone(); const tongue = solidProp([[G.sphere(0.15 * u, 0, 0, 0, 1.2, 0.6, 0.45), 0xff5a6a], [G.box(0.01 * u, 0.06 * u, 0.06 * u, 0, 0.0, 0.03 * u), 0xd83a4a]], 0.6);
  const ah = textPlane('あー', { h: 0.3 * u, color: '#ffffff', bg: '#d83a4a', pad: 0.3 });
  const yTop = B.maxY - 0.08 * B.h, yBot = stage.strokeBox(bottom).cy;
  group.add(inside, teethTop, teethBot, tongue, ah);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open1: [0.2, 0.4, 'back'], shut1: [2.4, 0.3, 'in'], open2: [3.0, 0.35, 'back'], shut2: [4.8, 0.3, 'in'] });
      const o = pre ? 0 : 0.42 * u * (T.open1 - T.shut1) + 0.55 * u * (T.open2 - T.shut2) + 0.02 * u * Math.sin(v * 5) * (T.open1 - T.shut1);
      const up = 0.6 * o, dn = 0.4 * o;
      stage.offset(bottom, 0, -dn, 0.02 * u); if (top !== bottom) stage.offset(top, 0, up, 0.02 * u);
      const gap = yTop - yBot + o, k = o > 0.01 * u;
      inside.visible = teethTop.visible = teethBot.visible = k;
      inside.position.set(B.cx, yTop + up, -0.03 * u); inside.scale.set(1, Math.max(1e-3, gap - 0.02 * u), 1);
      teethTop.position.set(B.cx, yTop + up - 0.04 * u, -0.01 * u); teethBot.position.set(B.cx, yBot - dn + 0.11 * u, -0.01 * u); teethBot.rotation.z = Math.PI;
      const stick = (pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 2.0, 2.35)));
      tongue.visible = k; tongue.position.set(B.cx + 0.03 * u * Math.sin(v * 9) * stick, yBot - dn + 0.1 * u - 0.12 * u * stick, 0.04 * u + 0.12 * u * stick);
      tongue.rotation.set(0.6 * stick, 0, 0.3 * Math.sin(v * 9) * stick); tongue.scale.set(1, 1 + 0.8 * stick, 1);
      const say = pre ? 0 : between(v, 3.3, 3.6) * (1 - between(v, 4.6, 4.8));
      ah.visible = say > 0.01; ah.scale.setScalar(grow(say)); ah.position.set(B.maxX + 0.45 * u, B.maxY + 0.05 * u + 0.03 * u * Math.sin(v * 8), 0.05 * u);
    },
  };
}

export const SCENES = { 'three-ducks': threeDucks, 'moon-wax': moonWax, 'river-flow': riverFlow, 'balloon-up': balloonUp, 'dog-fetch': dogFetch, 'car-beep': carBeep, 'mouth-open': mouthOpen };
