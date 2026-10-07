// Times of day.
//   sunset-lights  晩: the sun sinks behind a hill with little houses on it, dusk falls, their windows light up one by one,
//                  the moon rises and stars come out
//   calendar-back  昨: a calendar shows today; its page flips BACK a day while a little sun runs backwards across the sky
//                  (days: 2 flips back two days, for 一昨日)
//   rewind-clock   昨: a clock beside the kanji: its hands spin backwards, a rewind sign (◀◀) flashes, a little sun runs back
//                  across the sky from right to left
//   go-to-bed      夜: a person yawns and stretches, lies down on a futon, pulls up the blanket; dusk falls, the moon
//                  rises, stars twinkle and Zzz floats up (the sleep then holds)
//   noon-sun       昼: the sun climbs from the horizon to straight overhead, the person's head following it up; at the
//                  top it flares, and they cheer and open their lunchbox
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many } from '../pieces/kit-things.js';
import { emblemProp, textPlane, veil, calendarPad, cardBox } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc } from './helpers.js';
import { noonEat } from './variants.js';
import { smooth } from '../pieces/util.js';

const sunBall = (u, r = 0.16) => solidProp([[G.sphere(r * u), 0xffa030]], 1.2);
const starField = (u, n, rnd) => { const m = many([[G.sphere(0.012 * u), 0xfff6c0]], n, 1.5); m.spots = Array.from({ length: n }, () => [rnd(), rnd(), rnd()]); return m; };
const twinkle = (m, x0, y0, w, h, on, t) => { m.spots.forEach(([a, b, c], i) => m.set(i, x0 + a * w, y0 + b * h, -0.3 * h, on * (0.6 + 0.6 * Math.abs(Math.sin(t * (1.5 + 2 * c) + i)))));  m.commit(); };
function seeded(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }

function sunsetLights(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.75 * u;
  const hillList = [[G.sphere(1.0 * u, 0, 0, 0, 1.3, 0.38, 0.4), 0x1f4a2a]];
  const HOUSES = [[-0.35, 0.3], [0.05, 0.36], [0.45, 0.28]];
  HOUSES.forEach(([x, y]) => { hillList.push([G.box(0.2 * u, 0.16 * u, 0.12 * u, x * u, y * u, 0.25 * u), 0xd8c8a8], [G.cone(0.16 * u, 0.1 * u, x * u, y * u + 0.13 * u, 0.25 * u), 0x8a3a2a]); });
  const hill = solidProp(hillList, 0.25); hill.position.set(hx, floor - 0.05 * u, -0.25 * u);
  const wins = many([[G.box(0.07 * u, 0.07 * u, 0.01 * u), 0xffd060]], 3, 1.4), sun = sunBall(u), moon = emblemProp('crescent', 0.35 * u), dusk = veil(6 * u, 4 * u), stars = starField(u, 14, seeded(5));
  dusk.position.set(B.cx + 0.5 * u, floor + 1.2 * u, -0.6 * u);
  group.add(dusk, sun, hill, wins, moon, stars);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { sink: [0, 1.8, 'in'], dusk: [0.8, 1.2], moon: [2.6, 0.9, 'out'], stars: [3.0, 0.6], morning: [4.8, 0.7] });
      const night = pre ? 0 : T.dusk - T.morning;
      sun.position.set(hx + 0.35 * u, floor + (pre ? 0.95 : 0.95 - 1.15 * T.sink + 1.15 * T.morning) * u, -0.45 * u);
      dusk.material.opacity = 0.62 * night;
      HOUSES.forEach(([x, y], i) => { const on = pre ? 0 : between(v, 1.9 + i * 0.35, 2.05 + i * 0.35) * (1 - T.morning); wins.set(i, hx + x * u, floor - 0.05 * u + y * u - 0.005 * u, -0.25 * u + 0.312 * u, on > 0 ? 1 : 0); });
      wins.commit();
      wins.material.userData.glow.value = 1.4 * night;
      moon.visible = night > 0.05; moon.position.set(hx + 0.5 * u, floor + (0.35 + 0.65 * T.moon) * u, -0.2 * u); moon.idle(t);
      twinkle(stars, B.maxX + 0.1 * u, floor + 0.7 * u, 1.3 * u, 0.6 * u, (pre ? 0 : T.stars) * (1 - T.morning), t);
    },
  };
}

function calendarBack(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), days = spec.days ?? 1, cx = B.maxX + 0.45 * u, cy = B.minY + 0.45 * u;
  const pad = calendarPad(1.3 * u), page = (n) => textPlane(String(n), { h: 0.36 * u, w: 0.46 * u, color: '#222222', bg: '#fbf8f0', size: 0.9 });
  const today = page(8), back = Array.from({ length: days }, (_, i) => page(7 - i)), sun = sunBall(u, 0.09);
  pad.position.set(cx, cy, 0); today.position.set(cx, cy - 0.06 * u, 0.005 * u);
  const hinges = back.map((p, i) => { const h = new THREE.Group(); h.position.set(cx, cy + 0.15 * u, 0.01 * u + 0.004 * u * i); p.position.y = -0.21 * u; h.add(p); return h; });
  group.add(pad, today, ...hinges, sun);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      group.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      // pages come down from behind the binding: the day before, then (days 2) the one before that
      hinges.forEach((h, i) => { const f = pre ? 0 : between(v, 0.9 + i * 0.8, 1.45 + i * 0.8) * (1 - between(v, 3.9, 4.4)); h.rotation.x = -Math.PI * (1 - smooth(f)); h.visible = f > 0.02; });
      // the sun runs backwards: from the right over the top to the left
      const f = pre ? 0 : between(v, 0.4, 0.9 + days * 0.8) * (1 - between(v, 3.9, 4.4)), a = Math.PI * 0.12 + Math.PI * 0.76 * f;
      sun.position.set(cx + Math.cos(a) * 0.55 * u, cy + 0.1 * u + Math.sin(a) * 0.5 * u, 0.05 * u);
    },
  };
}

function goToBed(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.55 * u;
  const p = createPerson({ u, shirt: 0x8a7ad8, pants: 0x8a7ad8 }), futon = solidProp([[G.box(0.95 * u, 0.06 * u, 0.4 * u, 0, 0.03 * u, 0), 0xf0f0f8], [G.box(0.22 * u, 0.1 * u, 0.3 * u, 0.36 * u, 0.1 * u, 0), 0xffffff]]);
  const blanket = solidProp([[G.box(0.62 * u, 0.2 * u, 0.3 * u, 0, 0, 0), 0x4a6ad8], [G.box(0.04 * u, 0.21 * u, 0.31 * u, 0.3 * u, 0, 0), 0xf0d060]]);
  const zzz = emblemProp('zzz', 0.3 * u), moon = emblemProp('crescent', 0.32 * u), stars = starField(u, 12, seeded(9)), dusk = veil(6 * u, 4 * u);
  futon.position.set(px, floor, -0.05 * u); dusk.position.set(B.cx + 0.5 * u, floor + 1.2 * u, -0.6 * u);
  group.add(dusk, futon, blanket, p.group, zzz, moon, stars);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, 1e9), pre = A.u < 0, v = pre ? -1 : A.u;       // happens once, then the sleep holds
      const T = timeline(v, { yawn: [0, 0.9], down: [1.0, 0.6], cover: [1.6, 0.4], dusk: [0.6, 1.4], moon: [1.8, 1.0, 'out'] });
      const yawn = pre ? 0 : bump(v, 0, 1.0), lie = pre ? 0 : T.down;
      p.reset(); p.raise('L', 2.6 * yawn); p.raise('R', 2.6 * yawn); p.bone('head').rotation.x = -0.4 * yawn;
      p.group.rotation.set(0, 0, -Math.PI / 2 * lie);                              // lies down facing you, head on the pillow (right)
      p.group.position.set(px - 0.42 * u * lie, floor + 0.16 * u * lie, 0.0);
      p.update();
      blanket.visible = T.cover > 0.01; blanket.position.set(px - 0.15 * u, floor + 0.16 * u, 0.06 * u + (1 - T.cover) * 0.3 * u); blanket.scale.setScalar(Math.max(1e-3, T.cover));
      dusk.material.opacity = 0.6 * T.dusk;
      moon.visible = T.dusk > 0.1; moon.position.set(px + 0.2 * u, floor + (0.6 + 0.4 * T.moon) * u, -0.25 * u); moon.idle(t);
      twinkle(stars, B.minX, floor + 0.85 * u, 2.2 * u, 0.5 * u, T.dusk, t);
      zzz.visible = !pre && v > 2.0; zzz.position.set(px + 0.42 * u, floor + 0.3 * u, 0.02 * u); zzz.idle(v - 2.0);
    },
  };
}

function noonSun(ctx, spec, stage) {
  if (spec.outcome === 'eat') return noonEat(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const p = createPerson({ u, shirt: 0xf0a030 }), sun = emblemProp('sun', 0.42 * u);
  const lunch = cardBox(0.6 * u, { w: 0.5, h: 0.22, color: 0xd83838 }), rice = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1, 0.9, 0.8), 0xffffff], [G.box(0.06 * u, 0.05 * u, 0.02 * u, 0, -0.01 * u, 0.055 * u), 0x1a2a1a]]);
  lunch.position.set(px - 0.32 * u, floor, 0.12 * u);
  group.add(p.group, sun, lunch, rice);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { rise: [0, 2.0], open: [2.3, 0.4, 'back'], cheer: [2.6, 0.6], set: [4.6, 0.7] });
      const h = pre ? 0 : T.rise - T.set, a = Math.PI * (0.05 + 0.45 * h);                // from the right horizon up to straight overhead
      sun.position.set(px + Math.cos(a) * 1.2 * u, floor + 0.1 * u + Math.sin(a) * 1.1 * u, -0.2 * u); sun.idle(t);
      sun.scale.setScalar(0.42 * u * (1 + 0.45 * (pre ? 0 : bump(v, 2.0, 0.6))));          // flares at the very top
      p.group.position.set(px, floor, 0.02 * u); p.reset().raise('L', 0.6 * bump(v, 2.6, 0.6)).raise('R', 2.4 * bump(v, 2.6, 0.6));
      p.bone('head').rotation.x = -0.5 * h; p.update();                                   // looks up, following the sun
      lunch.flaps[0].rotation.z = 2.0 * (T.open - T.set); lunch.flaps[1].rotation.z = -2.0 * (T.open - T.set);
      lunch.scale.setScalar(Math.max(1e-3, timeline(A.setup, { a: [0.4, 0.4, 'back'] }).a));
      rice.visible = !pre && T.open > 0.3 && T.set < 0.7; rice.position.set(px - 0.32 * u, floor + 0.13 * u + 0.08 * u * T.open, 0.12 * u);
    },
  };
}

function rewindClock(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.5 * u, cy = B.cy + 0.05 * u;
  const clock = emblemProp('clock', 0.75 * u), sun = sunBall(u, 0.08), tri = (x) => [G.cone(0.08 * u, 0.13 * u, x, 0, 0, Math.PI / 2), 0xffffff];
  const rewind = solidProp([tri(-0.06 * u), tri(0.06 * u)], 1.2);
  group.add(clock, sun, rewind);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      clock.position.set(cx, cy, 0); clock.scale.setScalar(0.75 * u * Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const back = pre ? 0 : between(v, 0.3, 3.3);
      clock.idle(-(back * 6) * (1 + 2 * back));                       // the hands run backwards, faster and faster
      const f = pre ? 0 : between(v, 0.3, 3.3), a = Math.PI * (0.1 + 0.8 * f);
      sun.position.set(cx + Math.cos(a) * 0.55 * u, cy + 0.1 * u + Math.sin(a) * 0.5 * u, -0.05 * u); sun.visible = f < 1;
      const fl = !pre && v > 0.3 && v < 3.3 ? 0.6 + 0.4 * Math.abs(Math.sin(v * 5)) : 0;
      rewind.visible = fl > 0; rewind.position.set(cx, cy - 0.5 * u, 0.06 * u); rewind.material.userData.glow.value = 1.2 * fl;
    },
  };
}

export const SCENES = { 'rewind-clock': rewindClock, 'sunset-lights': sunsetLights, 'calendar-back': calendarBack, 'go-to-bed': goToBed, 'noon-sun': noonSun };
