// Step 1 scenes, part L: long, read, go, sky, old, drink, eat, write, walk, cheap.
//   snake-long     長: a snake slithers out and stretches longer and longer, its body winding on and on. outcome noodle:
//                  chopsticks lift a very long noodle up and up out of a bowl and it is slurped (長い)
//   read-book      読: a person sits reading a book; a page turns and little words float up out of it. outcome worm:
//                  a bookworm in glasses wriggles through the pages of an open book (読む)
//   go-light       行: a traffic light turns from red to green and a little car zooms off. outcome setoff: a person with
//                  a backpack waves goodbye and sets off walking (行く)
//   sky-rainbow    天: white clouds drift across a blue sky above the kanji, a rainbow arcs over and a bird flies by.
//                  outcome weather: over a little house the sun, a cloud, rain and snow take turns (天気)
//   old-box        古: a cracked old wooden box under cobwebs creaks open; dust puffs out and a moth flutters away.
//                  outcome car: an old car with a dent coughs smoke, rattles and a hubcap rolls off (古い)
//   gulp-drink     飲: a person tips back a glass of juice, gulp, gulp, the level dropping, and wipes their mouth.
//                  outcome cat: a cat laps milk from a saucer, its tongue flicking (飲む)
//   apple-bite     食: an apple gets bitten, chomp, chomp, chomp, down to the core. outcome sandwich: a person munches
//                  a sandwich bite by bite (食べる)
//   pencil-write   書: a pencil writes あいう on lined paper. outcome chalk: chalk writes on a blackboard (書く)
//   walker-steps   歩: a person walks along the path leaving footprints behind them. outcome penguin: a penguin
//                  waddles along (歩く)
//   price-slash    安: a price tag says ¥1000; a red line slashes it, and ¥100 drops in under a SALE sign.
//                  outcome bin: a bargain bin with a big SALE sign, things tumbling in (安い)
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { textPlane, blackboard } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint, puffs, wisps } from './helpers.js';
import { grow, seeded } from './step1-kit.js';
import { sit } from './step1-d.js';
import { carBody } from './step1-a.js';
import { birdThing } from './step1-c.js';

const tmp = new THREE.Vector3();
const writeText = (text, u, h, color) => { const m = textPlane(text, { h, color, weight: 700 }); m.geometry.translate(m.geometry.parameters.width / 2, 0, 0); m.width = m.geometry.parameters.width; m.reveal = (w) => { const k = Math.max(0.001, w); m.scale.x = k; m.material.map.repeat.x = k; m.visible = w > 0.01; }; return m; };

// ---- 長 long ----
function snakeLong(ctx, spec, stage) {
  if (spec.outcome === 'noodle') return noodle(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.15 * u, N = 40;
  const body = many([[G.sphere(0.055 * u), 0x40a040]], N, 0.5), head = solidProp([[G.sphere(0.075 * u, 0, 0, 0, 1.4, 0.9, 1), 0x40a040], [G.sphere(0.018 * u, 0.04 * u, 0.04 * u, 0.04 * u), 0x101010], [G.sphere(0.018 * u, 0.04 * u, 0.04 * u, -0.04 * u), 0x101010], [G.cone(0.01 * u, 0.06 * u, 0.12 * u, -0.01 * u, 0, -Math.PI / 2), 0xe02040]], 0.5);
  for (let i = 0; i < N; i++) body.setColorAt(i, new THREE.Color(i % 4 < 2 ? 0x40a040 : 0x80c040));
  group.add(body, head);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, L = pre ? 0.1 : 0.1 + 0.9 * between(v, 0.2, 3.6) * (1 - between(v, 5.0, 6.0));
      const P = (s) => [x0 + s * 1.3 * u, floor + 0.07 * u + 0.08 * u * Math.sin(s * 14 - v * 4) * Math.min(1, s * 4)];
      for (let i = 0; i < N; i++) { const s = (i / (N - 1)) * L, [x, y] = P(s); body.set(i, x, y, 0.05 * u, 1 - 0.3 * (1 - i / N)); }
      body.commit();
      const [hx, hy] = P(L + 0.03); head.position.set(hx, hy, 0.05 * u); head.rotation.z = 0.3 * Math.cos(L * 14 - v * 4);
    },
  };
}
function noodle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, N = 30;
  const bowl = solidProp([[new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.22, 0.16], [0.2, 0.16], [0.09, 0.02], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x * u, y * u)), 32), 0xe04848], [G.cyl(0.19 * u, 0.19 * u, 0.01 * u, 0, 0.13 * u, 0), 0xe0b060]], 0.45);
  const strand = many([[G.sphere(0.018 * u), 0xfff0c0]], N, 0.6), sticks = solidProp([[G.cyl(0.01 * u, 0.006 * u, 0.4 * u, -0.012 * u, 0, 0, 0, 0, 0.05), 0x8a3a20], [G.cyl(0.01 * u, 0.006 * u, 0.4 * u, 0.012 * u, 0, 0, 0, 0, -0.05), 0x8a3a20]], 0.45), steam = many([[G.sphere(0.03 * u), 0xf0f0f0]], 4, 0.5);
  bowl.position.set(bx, floor, 0); bowl.rotation.x = 0.3;
  group.add(bowl, strand, sticks, steam);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, lift = pre ? 0 : between(v, 0.3, 2.6), slurp = pre ? 0 : between(v, 3.0, 4.6);
      const top = floor + 0.2 * u + 0.85 * u * lift, len = top - floor - 0.12 * u;
      for (let i = 0; i < N; i++) { const s = i / (N - 1), y = floor + 0.12 * u + len * s, gone = s > 1 - slurp; strand.set(i, bx + 0.02 * u * Math.sin(s * 10 + v * 2), gone ? top : y, 0.04 * u, !pre && !gone ? 1 : 0); }
      strand.commit();
      sticks.visible = !pre; sticks.position.set(bx + 0.05 * u, top + 0.15 * u, 0.04 * u); sticks.rotation.z = -0.2;
      wisps(steam, 0, 4, bx, floor + 0.2 * u, v, u, { period: 1.6, rise: 0.4, on: pre ? 0 : 1 }); steam.commit();
    },
  };
}

// ---- 読 read ----
function readBook(ctx, spec, stage) {
  if (spec.outcome === 'worm') return bookworm(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0x8a5ad0 }), book = solidProp([[G.box(0.24 * u, 0.16 * u, 0.01 * u, -0.12 * u, 0, 0, 0), 0xfaf4e4], [G.box(0.24 * u, 0.16 * u, 0.01 * u, 0.12 * u, 0, 0), 0xfaf4e4], [G.box(0.5 * u, 0.17 * u, 0.008 * u, 0, 0, -0.008 * u), 0xc03030]], 0.5);
  const page = new THREE.Group(), pageM = solidProp([[G.box(0.23 * u, 0.15 * u, 0.006 * u, 0.115 * u, 0, 0), 0xffffff]], 0.6); page.add(pageM);
  const words = ['あ', 'い', 'う', 'え'].map((c) => textPlane(c, { h: 0.1 * u, color: '#ffe060', weight: 900 }));
  group.add(p.group, book, page, ...words);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.reset().face('toward'); sit(p, 1); p.group.position.set(px, floor - 0.2 * u, 0.0);
      for (const s of ['L', 'R']) { p.bone(`arm${s}`).rotation.x = 1.0; p.bone(`fore${s}`).rotation.x = 1.0; p.raise(s, 0.15); }
      p.bone('head').rotation.x = 0.3 + 0.05 * Math.sin(v * 2); p.update();
      bonePoint(p, 'handL', 0.5, tmp); book.position.set(px, tmp.y + 0.06 * u, tmp.z + 0.06 * u); book.rotation.x = -0.6; book.visible = !pre;
      const turn = pre ? 0 : between(v, 1.2, 1.8); page.position.copy(book.position).add(new THREE.Vector3(0, 0, 0.01 * u)); page.rotation.set(-0.6, -Math.PI * turn, 0, 'ZXY'); page.visible = turn > 0 && turn < 1;
      words.forEach((w, i) => { const f = pre ? 0 : ((v * 0.45 + i / 4) % 1); w.visible = !pre; w.position.set(px + (i - 1.5) * 0.12 * u + 0.05 * u * Math.sin(f * 6 + i), book.position.y + 0.1 * u + 0.6 * u * f, 0.15 * u); w.scale.setScalar(grow(Math.sin(Math.PI * f))); });
    },
  };
}
function bookworm(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u, N = 8;
  const book = solidProp([[G.box(0.32 * u, 0.04 * u, 0.42 * u, -0.17 * u, 0, 0, 0.12), 0xfaf4e4], [G.box(0.32 * u, 0.04 * u, 0.42 * u, 0.17 * u, 0, 0, -0.12), 0xfaf4e4], [G.box(0.7 * u, 0.02 * u, 0.44 * u, 0, -0.03 * u, 0), 0x3a7ae0], ...[0, 1, 2, 3].map((i) => [G.box(0.22 * u, 0.006 * u, 0.012 * u, 0.17 * u, 0.03 * u, (0.12 - 0.08 * i) * u), 0x9a9a9a])], 0.45);
  const worm = many([[G.sphere(0.04 * u), 0x80d040]], N, 0.5), head = solidProp([[G.sphere(0.055 * u), 0x80d040], [G.torus(0.025 * u, 0.006 * u, Math.PI * 2, -0.025 * u, 0.01 * u, 0.045 * u), 0x202020], [G.torus(0.025 * u, 0.006 * u, Math.PI * 2, 0.025 * u, 0.01 * u, 0.045 * u), 0x202020], [G.sphere(0.008 * u, -0.025 * u, 0.01 * u, 0.05 * u), 0x101010], [G.sphere(0.008 * u, 0.025 * u, 0.01 * u, 0.05 * u), 0x101010]], 0.5);
  const tilt = new THREE.Group(); tilt.add(book, worm, head); tilt.position.set(bx, floor + 0.05 * u, 0); tilt.rotation.x = 0.55;
  group.add(tilt);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.3, 4.8);
      for (let i = 0; i < N; i++) { const s = f * 1.0 - i * 0.05, x = -0.32 * u + 0.64 * u * Math.max(0, s), dive = Math.sin(s * 9) > 0.6; worm.set(i, x, 0.04 * u + 0.04 * u * Math.abs(Math.sin(s * 18)) - (dive ? 0.05 * u : 0), 0.0, s > 0 && s < 1 ? 1 : 0); }
      worm.commit();
      const hx = -0.32 * u + 0.64 * u * f; head.position.set(hx + 0.04 * u, 0.08 * u + 0.03 * u * Math.abs(Math.sin(f * 18)), 0); head.visible = f > 0 && f < 1; head.rotation.x = -0.55;
    },
  };
}

// ---- 行 go ----
function goLight(ctx, spec, stage) {
  if (spec.outcome === 'setoff') return setOff(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, lx = B.maxX + 0.3 * u;
  const pole = solidProp([[G.cyl(0.02 * u, 0.02 * u, 0.6 * u, 0, 0.3 * u, 0), 0x404048], [G.box(0.14 * u, 0.36 * u, 0.08 * u, 0, 0.75 * u, 0), 0x202028]], 0.35);
  const lamps = many([[G.cyl(0.045 * u, 0.045 * u, 0.02 * u, 0, 0, 0, Math.PI / 2), 0xffffff]], 3, 1.6), road = solidProp([[G.box(1.4 * u, 0.01 * u, 0.3 * u, 0.6 * u, 0, 0.15 * u), 0x4a4d58], ...[0, 1, 2, 3].map((i) => [G.box(0.12 * u, 0.012 * u, 0.025 * u, (0.15 + 0.3 * i) * u, 0, 0.15 * u), 0xffffff])], 0.3);
  const car = carBody(0.8 * u, { color: 0x30b060 }), dust = many(PUFF(u), 6, 0.3), off = new THREE.Color(0x303038), RED = new THREE.Color(0xff3030), YEL = new THREE.Color(0xffc020), GRN = new THREE.Color(0x30e060);
  pole.position.set(lx, floor, -0.1 * u); road.position.set(lx, floor, 0); road.rotation.x = 0.0;
  for (let i = 0; i < 3; i++) lamps.set(i, lx, floor + (0.86 - 0.11 * i) * u, -0.055 * u, 1); lamps.commit();
  group.add(pole, lamps, road, car, dust);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, state = pre || v < 1.4 ? 0 : v < 1.8 ? 1 : v < 4.6 ? 2 : 0;
      lamps.setColorAt(0, state === 0 ? RED : off); lamps.setColorAt(1, state === 1 ? YEL : off); lamps.setColorAt(2, state === 2 ? GRN : off); lamps.instanceColor.needsUpdate = true;
      const go = pre ? 0 : between(v, 1.9, 3.4), back = pre ? 0 : between(v, 4.6, 5.4), x = lx + 0.25 * u + 1.1 * u * go * go * (1 - back), shake = state === 0 && !pre ? 0.005 * u * Math.sin(t * 40) : 0;
      car.position.set(x + shake, floor, 0.15 * u); car.scale.setScalar(grow(back > 0 ? back : 1 - between(go, 0.85, 1))); car.roll(go * 25, 0.6);
      puffs(dust, 0, 6, lx + 0.15 * u, floor, pre ? 0 : (v - 1.9) / 0.7, u, 0.3); dust.commit();
    },
  };
}
function setOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const p = createPerson({ u: 0.9 * u, shirt: 0xe0603a }), pack = solidProp([[G.box(0.2 * u, 0.26 * u, 0.12 * u, 0, 0, 0), 0x3a7a40], [G.box(0.16 * u, 0.08 * u, 0.13 * u, 0, -0.05 * u, 0.0), 0x2a5a30]], 0.4);
  p.rig.attach('body', pack, 0.55); pack.position.set(0, 0, -0.14 * u);
  const path = solidProp([[G.box(0.25 * u, 0.01 * u, 1.2 * u, 0, 0, -0.5 * u), 0xd0b080]], 0.3); path.position.set(px + 0.3 * u, floor, 0.1 * u);
  group.add(path, p.group);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, wave = pre ? 0 : bump(v, 0.3, 1.6), f = pre ? 0 : between(v, 1.9, 5.2);
      p.reset().face(f > 0 ? 'away' : 'toward'); if (f > 0 && f < 1) p.walk(v * 9, 1); if (wave > 0) { p.raise('R', 2.6 * wave); p.bone('foreR').rotation.z = -0.5 * Math.sin(v * 10); }
      p.group.position.set(px + 0.3 * u, floor + 0.35 * u * f, 0.1 * u - 0.9 * u * f); p.group.scale.setScalar(1 - 0.6 * f); p.group.visible = !pre && f < 0.99; p.update();
    },
  };
}

// ---- 天 the sky ----
function skyRainbow(ctx, spec, stage) {
  if (spec.outcome === 'weather') return weatherTurns(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.cx + 0.4 * u, top = B.maxY + 0.15 * u;
  const clouds = many([[G.sphere(0.13 * u), 0xffffff], [G.sphere(0.1 * u, 0.13 * u, -0.02 * u, 0), 0xffffff], [G.sphere(0.1 * u, -0.13 * u, -0.02 * u, 0), 0xffffff], [G.sphere(0.09 * u, 0.05 * u, 0.07 * u, 0), 0xffffff]], 3, 0.6);
  const bow = many([[G.torus(1, 0.05, Math.PI), 0xffffff]], 7, 0.7); [0xe83030, 0xff8a20, 0xffe030, 0x40c040, 0x30a0f0, 0x3050c0, 0x9040c0].forEach((c, i) => bow.setColorAt(i, new THREE.Color(c)));
  const bird = birdThing(0.2 * u), sun = solidProp([[G.sphere(0.12 * u), 0xffc040]], 1.3);
  bow.material.transparent = true; bow.material.opacity = 0.85;
  group.add(sun, bow, clouds, bird);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      [[-0.8, 0.1], [0.3, 0.25], [1.1, 0.05]].forEach(([x, y], i) => clouds.set(i, cx + x * u + ((v * 0.12 + i * 0.4) % 1.6 - 0.8) * u * 0.6, top + y * u, -0.2 * u, pre ? 0.6 : 1));
      clouds.commit();
      const r = pre ? 0 : between(v, 1.0, 2.2) * (1 - between(v, 5.4, 6.2)); for (let i = 0; i < 7; i++) bow.set(i, B.maxX + 0.55 * u, B.minY, -0.3 * u, grow(r) * (0.7 - i * 0.05) * u);
      bow.commit();
      sun.position.set(B.maxX + 0.95 * u, top + 0.15 * u, -0.35 * u);
      const f = pre ? 0 : between(v, 2.6, 5.0); bird.visible = f > 0 && f < 1; bird.position.set(B.minX - 0.3 * u + (B.w + 1.6 * u) * f, top - 0.05 * u + 0.08 * u * Math.sin(f * 12), 0.05 * u); bird.rotation.y = 0;
    },
  };
}
function weatherTurns(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.5 * u;
  const house = solidProp([[G.box(0.32 * u, 0.24 * u, 0.22 * u, 0, 0.12 * u, 0), 0xf0e0c0], [G.cone(0.26 * u, 0.18 * u, 0, 0.33 * u, 0), 0xc04a3a]], 0.4);
  const sun = solidProp([[G.sphere(0.12 * u), 0xffb030]], 1.3), cloud = many([[G.sphere(0.12 * u), 0x9aa4b4], [G.sphere(0.09 * u, 0.12 * u, -0.02 * u, 0), 0x9aa4b4], [G.sphere(0.09 * u, -0.12 * u, -0.02 * u, 0), 0x9aa4b4]], 1, 0.4), drops = many([[G.sphere(0.015 * u, 0, 0, 0, 1, 2, 1), 0x7fc8ff]], 10, 1.0), flakes = many([[G.sphere(0.02 * u), 0xffffff]], 10, 1.2);
  house.position.set(hx, floor, -0.05 * u);
  group.add(house, sun, cloud, drops, flakes);
  const loop = 6.4, r = seeded(9), S = Array.from({ length: 10 }, () => [r(), r()]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, phase = pre ? 0 : Math.floor(v / 1.6) % 4, f = pre ? 0 : (v / 1.6) % 1, k = Math.min(1, f * 4, (1 - f) * 4);
      const sy = floor + 0.8 * u; sun.visible = phase === 0; sun.position.set(hx + 0.1 * u, sy, -0.2 * u); sun.scale.setScalar(grow(k));
      cloud.set(0, hx, sy, -0.15 * u, phase > 0 ? grow(k) : 0); cloud.commit();
      S.forEach(([a, b], i) => { const g = ((v * 1.2 + b) % 1); drops.set(i, hx - 0.25 * u + a * 0.5 * u, sy - 0.1 * u - 0.6 * u * g, -0.1 * u, phase === 2 ? k : 0); flakes.set(i, hx - 0.25 * u + a * 0.5 * u + 0.03 * u * Math.sin(v * 3 + i), sy - 0.1 * u - 0.6 * u * ((v * 0.5 + b) % 1), -0.1 * u, phase === 3 ? k : 0); });
      drops.commit(); flakes.commit();
    },
  };
}

// ---- 古 old ----
function oldBox(ctx, spec, stage) {
  if (spec.outcome === 'car') return oldCar(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.5 * u;
  const box = solidProp([[G.box(0.46 * u, 0.3 * u, 0.3 * u, 0, 0.15 * u, 0), 0x7a5a3a], [G.box(0.47 * u, 0.03 * u, 0.31 * u, 0, 0.08 * u, 0), 0x5a3a20], [G.poly([[-0.1 * u, 0.25 * u], [-0.05 * u, 0.18 * u], [-0.08 * u, 0.1 * u], [-0.02 * u, 0.04 * u]], 0.006 * u).translate(0, 0, 0.152 * u), 0x2a1a10], [G.poly([[0.15 * u, 0.28 * u], [0.12 * u, 0.2 * u], [0.16 * u, 0.14 * u]], 0.006 * u).translate(0, 0, 0.152 * u), 0x2a1a10]], 0.3);
  const lidP = new THREE.Group(), lid = solidProp([[G.box(0.48 * u, 0.04 * u, 0.32 * u, 0, 0, 0.16 * u), 0x6a4a2a]], 0.3), web = solidProp([...[0, 1, 2, 3, 4].map((i) => [G.cyl(0.003 * u, 0.003 * u, 0.25 * u, 0, 0, 0, 0, 0, i * 0.39 - 0.78).translate(0, 0, 0), 0xe0e0e8]), ...[0.06, 0.12, 0.18].map((r) => [G.torus(r * u, 0.003 * u, Math.PI / 2, 0, 0, 0, Math.PI), 0xe0e0e8])], 0.6);
  lidP.add(lid); lidP.position.set(bx, floor + 0.3 * u, -0.16 * u); web.position.set(bx + 0.23 * u, floor + 0.32 * u, 0.15 * u);
  const dust = many([[G.sphere(0.05 * u), 0xb8a890]], 8, 0.3), moth = solidProp([[G.sphere(0.02 * u, 0, 0, 0, 1, 1.6, 1), 0x8a8070], [G.sphere(0.04 * u, -0.03 * u, 0, 0, 1, 0.2, 0.7), 0xc8c0a8], [G.sphere(0.04 * u, 0.03 * u, 0, 0, 1, 0.2, 0.7), 0xc8c0a8]], 0.4);
  box.position.set(bx, floor, 0);
  group.add(box, lidP, web, dust, moth);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, creak = pre ? 0 : between(v, 0.6, 1.8) * (1 - between(v, 4.6, 5.2));
      lidP.rotation.x = -0.9 * creak + 0.04 * Math.sin(v * 30) * (creak > 0 && creak < 1 ? 1 : 0);
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : between(v, 1.0 + 0.05 * i, 2.6 + 0.05 * i), a = (i / 8) * Math.PI; dust.set(i, bx + Math.cos(a) * 0.3 * u * f, floor + 0.35 * u + 0.35 * u * f * Math.sin(a), 0.05 * u, f > 0 && f < 1 ? 1.4 * Math.sin(Math.PI * f) : 0); }
      dust.commit();
      const m = pre ? 0 : between(v, 1.6, 4.4); moth.visible = m > 0 && m < 1; moth.position.set(bx + 0.6 * u * m, floor + 0.35 * u + 0.6 * u * m + 0.05 * u * Math.sin(m * 20), 0.05 * u); moth.scale.set(1 + 0.4 * Math.sin(t * 30), 1, 1);
    },
  };
}
function oldCar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u;
  const car = carBody(1.1 * u, { color: 0x8a7a5a }), smoke = many([[G.sphere(0.05 * u), 0x505058]], 6, 0.2), cap = solidProp([[G.cyl(0.04 * u, 0.04 * u, 0.012 * u, 0, 0, 0, Math.PI / 2), 0xc8ccd4]], 0.5), rust = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 1, 0.3), 0x8a4a20]], 4, 0.3);
  group.add(car, smoke, cap, rust);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rattle = pre ? 0 : 0.008 * u * Math.sin(t * 45) * (v > 0.3 && v < 4.5 ? 1 : 0);
      car.position.set(cx + rattle, floor + Math.abs(rattle), 0.02 * u); car.rotation.set(0, 0, 0.03 * Math.sin(t * 20) * (v < 4.5 ? 1 : 0)); car.roll(0, 0.1);
      for (let i = 0; i < 4; i++) rust.set(i, cx + (-0.2 + 0.13 * i) * u, floor + (0.14 + 0.03 * (i % 2)) * u, 0.18 * u, 1);
      rust.commit();
      for (let i = 0; i < 6; i++) { const f = ((v * 0.8 + i / 6) % 1), cough = Math.floor(v / 1.2) % 2 === 0; smoke.set(i, cx - 0.4 * u - 0.3 * u * f, floor + 0.12 * u + 0.25 * u * f, 0.0, !pre && cough ? (0.6 + 1.4 * f) * (1 - f) * 1.5 : 0); }
      smoke.commit();
      const r = pre ? 0 : between(v, 2.0, 3.6); cap.visible = r > 0 && r < 1; cap.position.set(cx + 0.2 * u + 0.8 * u * r, floor + 0.04 * u + 0.05 * u * Math.abs(Math.sin(r * 15)) * (1 - r), 0.2 * u); cap.rotation.z = -r * 20;
    },
  };
}

// ---- 飲 drink ----
function gulpDrink(ctx, spec, stage) {
  if (spec.outcome === 'cat') return catLap(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0x40a0e0 }), glass = solidProp([[G.cyl(0.05 * u, 0.04 * u, 0.15 * u, 0, 0, 0), 0xd8f0ff]], 0.3), juice = solidProp([[G.cyl(0.045 * u, 0.037 * u, 1, 0, 0.5, 0), 0xffa020]], 0.7), gulps = many([[G.torus(0.04 * u, 0.008 * u), 0xffffff]], 2, 1.0);
  glass.material.transparent = true; glass.material.opacity = 0.5;
  group.add(p.group, glass, juice, gulps);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, tip = pre ? 0 : between(v, 0.3, 0.9) * (1 - between(v, 3.0, 3.5)), wipe = pre ? 0 : bump(v, 3.6, 1.0), level = pre ? 1 : 1 - between(v, 0.9, 2.9) + between(v, 4.8, 5.3);
      p.reset().face(0.5); p.group.position.set(px, floor, 0.02 * u); p.bone('armR').rotation.x = 1.0 + 1.0 * tip; p.bone('foreR').rotation.x = 1.5 * tip + 0.4; p.bone('head').rotation.x = -0.45 * tip;
      if (wipe > 0) { p.bone('armL').rotation.x = 1.2 * wipe; p.bone('foreL').rotation.x = 1.6 * wipe; } p.update();
      bonePoint(p, 'handR', 0.6, tmp); glass.position.set(tmp.x, tmp.y + 0.05 * u, tmp.z + 0.03 * u); glass.rotation.z = 1.4 * tip; glass.visible = !pre;
      juice.position.copy(glass.position).add(new THREE.Vector3(Math.sin(1.4 * tip) * 0.07 * u, -Math.cos(1.4 * tip) * 0.07 * u, 0)); juice.rotation.z = glass.rotation.z; juice.scale.set(1, Math.max(1e-3, 0.13 * u * level), 1); juice.visible = level > 0.02 && !pre;
      for (let i = 0; i < 2; i++) { const g = ((v * 1.5 + i / 2) % 1); gulps.set(i, px + 0.25 * u, floor + 0.8 * u + 0.1 * u * g, 0.1 * u, tip > 0.8 && v < 2.9 ? 1 + g : 0); }
      gulps.commit();
    },
  };
}
function catLap(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u;
  const cat = solidProp([[G.sphere(0.14 * u, 0, 0.15 * u, 0, 1.5, 0.9, 0.9), 0xff9a40], [G.sphere(0.1 * u, 0.22 * u, 0.12 * u, 0), 0xff9a40], [G.cone(0.035 * u, 0.07 * u, 0.2 * u, 0.22 * u, 0.06 * u), 0xff9a40], [G.cone(0.035 * u, 0.07 * u, 0.26 * u, 0.22 * u, -0.05 * u), 0xff9a40], [G.sphere(0.015 * u, 0.3 * u, 0.14 * u, 0.05 * u), 0x101010], [G.sphere(0.015 * u, 0.3 * u, 0.14 * u, -0.05 * u), 0x101010], [G.cyl(0.02 * u, 0.015 * u, 0.3 * u, -0.22 * u, 0.3 * u, 0, 0, 0, 0.6), 0xff9a40], ...[[-0.1, 0.07], [-0.1, -0.07], [0.12, 0.07], [0.12, -0.07]].map(([x, z]) => [G.cyl(0.025 * u, 0.025 * u, 0.12 * u, x * u, 0.06 * u, z * u), 0xff9a40])], 0.45);
  const saucer = solidProp([[G.cyl(0.13 * u, 0.1 * u, 0.025 * u, 0, 0.012 * u, 0), 0x6ab0ff], [G.cyl(0.1 * u, 0.1 * u, 0.006 * u, 0, 0.026 * u, 0), 0xffffff]], 0.6), tongue = solidProp([[G.sphere(0.02 * u, 0, 0, 0, 1, 1.6, 0.6), 0xff6a80]], 0.6), drops = many([[G.sphere(0.01 * u), 0xffffff]], 3, 1.0);
  const catG = new THREE.Group(); catG.add(cat); catG.position.set(cx - 0.05 * u, floor, 0); saucer.position.set(cx + 0.3 * u, floor, 0.02 * u);
  group.add(catG, saucer, tongue, drops);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, bend = pre ? 0 : between(v, 0.2, 0.6) * (1 - between(v, 3.6, 4.0)), lap = Math.max(0, Math.sin(v * 9)) * bend;
      catG.rotation.z = -0.35 * bend;
      tongue.visible = lap > 0.2; tongue.position.set(cx + 0.27 * u, floor + 0.05 * u + 0.04 * u * lap, 0.02 * u);
      for (let i = 0; i < 3; i++) { const g = ((v * 2 + i / 3) % 1); drops.set(i, cx + 0.3 * u + 0.04 * u * (i - 1), floor + 0.04 * u + 0.08 * u * Math.sin(Math.PI * g), 0.04 * u, bend > 0.5 ? 1 : 0); }
      drops.commit();
    },
  };
}

// ---- 食 eat ----
const BITES = (u, R) => many([[G.sphere(R * 0.45), 0xfff4d8]], 6, 0.6);
function appleBite(ctx, spec, stage) {
  if (spec.outcome === 'sandwich') return sandwich(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.5 * u, ay = floor + 0.3 * u, R = 0.22 * u;
  const apple = solidProp([[G.sphere(R), 0xe02828], [G.cyl(0.012 * u, 0.012 * u, 0.08 * u, 0, R + 0.03 * u, 0), 0x5a3a1a], [G.sphere(0.05 * u, 0.06 * u, R + 0.04 * u, 0, 1.6, 0.4, 0.8), 0x40a040]], 0.5);
  const core = solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.3 * u, 0, 0, 0), 0xfff4d8], [G.sphere(0.12 * u, 0, 0.15 * u, 0, 1, 0.4, 1), 0xe02828], [G.sphere(0.12 * u, 0, -0.15 * u, 0, 1, 0.4, 1), 0xe02828], [G.sphere(0.012 * u, 0.02 * u, 0, 0.05 * u), 0x3a2010], [G.cyl(0.012 * u, 0.012 * u, 0.08 * u, 0, 0.2 * u, 0), 0x5a3a1a]], 0.5);
  const bites = BITES(u, R), crumbs = many([[G.sphere(0.012 * u), 0xfff4d8]], 8, 0.5), chomp = textPlane('もぐもぐ', { h: 0.12 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  apple.position.set(ax, ay, 0); core.position.set(ax, ay, 0);
  group.add(apple, bites, core, crumbs, chomp);
  const loop = 6.0, SPOTS = [[1, 0.3], [-1, 0.2], [0.9, -0.4], [-0.9, -0.3], [0.2, 0.8], [0.1, -0.85]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, n = pre ? 0 : Math.min(6, Math.floor(between(v, 0.4, 3.4) * 6.99)), done = pre ? 0 : between(v, 3.6, 3.8) * (1 - between(v, 5.4, 5.8));
      apple.visible = done < 0.5; core.visible = done >= 0.5;
      SPOTS.forEach(([x, y], i) => bites.set(i, ax + x * R * 0.95, ay + y * R * 0.9, 0.12 * u, i < n && done < 0.5 ? 1 : 0)); bites.commit();
      apple.rotation.y = n * 0.5; apple.scale.setScalar(1 - 0.02 * n);
      for (let i = 0; i < 8; i++) { const g = pre ? 0 : ((v * 1.3 + i / 8) % 1); crumbs.set(i, ax + (i - 3.5) * 0.04 * u, ay - 0.1 * u - 0.2 * u * g, 0.1 * u, v > 0.4 && v < 3.6 ? 1 - g : 0); }
      crumbs.commit();
      const k = !pre && v > 0.4 && v < 3.6 ? 1 : 0; chomp.visible = k > 0; chomp.position.set(ax, ay + 0.4 * u + 0.02 * u * Math.sin(v * 12), 0.06 * u);
    },
  };
}
function sandwich(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const p = createPerson({ u: 0.95 * u, shirt: 0xd0603a }), sw = solidProp([[G.box(0.2 * u, 0.03 * u, 0.12 * u, 0, 0, 0), 0xf0d8a0], [G.box(0.21 * u, 0.02 * u, 0.13 * u, 0, 0.025 * u, 0), 0x60c040], [G.box(0.2 * u, 0.02 * u, 0.12 * u, 0, 0.045 * u, 0), 0xe05050], [G.box(0.2 * u, 0.03 * u, 0.12 * u, 0, 0.07 * u, 0), 0xf0d8a0]], 0.5);
  const munch = textPlane('もぐもぐ', { h: 0.11 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  group.add(p.group, sw, munch);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, b = pre ? 0 : Math.max(bump(v, 0.5, 0.6), bump(v, 1.5, 0.6), bump(v, 2.5, 0.6));
      p.reset().face(0.4); p.group.position.set(px, floor, 0.02 * u); p.bone('armR').rotation.x = 1.3 + 0.5 * b; p.bone('foreR').rotation.x = 1.4 + 0.4 * b; p.bone('head').rotation.x = 0.1 * b; p.update();
      bonePoint(p, 'handR', 0.7, tmp); sw.position.set(tmp.x, tmp.y, tmp.z + 0.04 * u); sw.rotation.z = 0.4; sw.visible = !pre; sw.scale.x = 1 - 0.15 * Math.min(3, Math.floor(Math.max(0, v - 0.6))) * (v < 4.2 ? 1 : 0);
      const k = !pre && v > 0.5 && v < 3.2 ? 1 : 0; munch.visible = k > 0; munch.position.set(px + 0.35 * u, floor + 1.0 * u + 0.02 * u * Math.sin(v * 12), 0.06 * u);
    },
  };
}

// ---- 書 write ----
function pencilWrite(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, chalk = spec.outcome === 'chalk', px = B.maxX + 0.55 * u, py = B.cy;
  const sheet = chalk ? blackboard(u, { w: 0.85, h: 0.5 }) : solidProp([[G.box(0.6 * u, 0.5 * u, 0.01 * u, 0, 0, 0), 0xfffcf0], ...[0, 1, 2, 3].map((i) => [G.box(0.56 * u, 0.006 * u, 0.012 * u, 0, (0.15 - 0.1 * i) * u, 0), 0x9ac0e8]), [G.box(0.006 * u, 0.48 * u, 0.012 * u, -0.22 * u, 0, 0), 0xf09090]], 0.5);
  const text = writeText(chalk ? 'あいうえお' : 'あいう', u, (chalk ? 0.13 : 0.15) * u, chalk ? '#f4f4f0' : '#202838');
  const tool = chalk ? solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.1 * u, 0, 0.05 * u, 0), 0xffffff]], 0.8) : solidProp([[G.cyl(0.018 * u, 0.018 * u, 0.32 * u, 0, 0.16 * u, 0), 0xffc030], [G.cone(0.018 * u, 0.05 * u, 0, -0.025 * u, 0, Math.PI), 0xf0d0a0], [G.cyl(0.019 * u, 0.019 * u, 0.04 * u, 0, 0.33 * u, 0), 0xff8aa0]], 0.5);
  sheet.position.set(px, chalk ? py + 0.1 * u : py, -0.02 * u); text.position.set(px - text.width / 2, (chalk ? py + 0.1 * u : py + 0.06 * u), 0.012 * u);
  group.add(sheet, text, tool);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 0 : between(v, 0.3, 3.4) * (1 - between(v, 4.8, 5.4));
      text.reveal(w);
      tool.visible = !pre && v < 3.8; tool.position.set(px - text.width / 2 + text.width * w + 0.02 * u, text.position.y - 0.02 * u + 0.03 * u * Math.sin(v * 16), 0.05 * u); tool.rotation.z = chalk ? -0.8 : -0.5;
    },
  };
}

// ---- 歩 walk ----
function walkerSteps(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 1.3 * u, x1 = B.maxX + 0.3 * u, penguin = spec.outcome === 'penguin';
  const p = penguin ? null : createPerson({ u: 0.9 * u, shirt: 0x50a060 }), peng = penguin ? solidProp([[G.sphere(0.13 * u, 0, 0.17 * u, 0, 0.9, 1.3, 0.9), 0x202028], [G.sphere(0.1 * u, 0, 0.16 * u, 0.05 * u, 0.85, 1.2, 0.7), 0xffffff], [G.sphere(0.08 * u, 0, 0.38 * u, 0), 0x202028], [G.cone(0.025 * u, 0.06 * u, 0, 0.36 * u, 0.09 * u, -Math.PI / 2), 0xffa020], [G.sphere(0.015 * u, -0.03 * u, 0.4 * u, 0.06 * u), 0xffffff], [G.sphere(0.015 * u, 0.03 * u, 0.4 * u, 0.06 * u), 0xffffff], [G.sphere(0.04 * u, -0.05 * u, 0.01 * u, 0.04 * u, 1, 0.3, 1.4), 0xffa020], [G.sphere(0.04 * u, 0.05 * u, 0.01 * u, 0.04 * u, 1, 0.3, 1.4), 0xffa020]], 0.45) : null;
  const prints = many([[G.sphere(0.045 * u, 0, 0, 0, 0.7, 0.05, 1.3), penguin ? 0x9ab0d0 : 0x8a6a50]], 8, 0.3), ground = penguin ? solidProp([[G.box(1.6 * u, 0.04 * u, 0.4 * u, 0, -0.02 * u, 0), 0xf0f6ff]], 0.6) : null;
  if (ground) { ground.position.set(B.maxX + 0.7 * u, floor, 0.0); group.add(ground); }
  group.add(prints, penguin ? peng : p.group);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.1, 4.6), fade = pre ? 1 : between(v, 5.2, 5.8), x = x0 + (x1 - x0) * f;
      if (penguin) { peng.position.set(x, floor + 0.01 * u * Math.abs(Math.sin(v * 9)), 0.12 * u); peng.rotation.set(0, -Math.PI / 2, 0.15 * Math.sin(v * 9) * (f < 1 ? 1 : 0)); peng.visible = fade < 1; peng.scale.setScalar(grow(1 - fade)); }
      else { p.reset().face('left'); p.walk(v * 8, f > 0 && f < 1 ? 1 : 0); p.group.position.set(x, floor, 0.12 * u); p.group.visible = !pre && fade < 1; p.update(); }
      for (let i = 0; i < 8; i++) { const at = (i + 1) / 9, px = x0 + (x1 - x0) * at; prints.set(i, px + 0.1 * u, floor + 0.004 * u, 0.12 * u + (i % 2 ? 0.05 : -0.05) * u, f > at ? 1 - fade : 0, 0, -Math.PI / 2, 0.5); }
      prints.commit();
    },
  };
}

// ---- 安 cheap ----
function priceSlash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.5 * u, ty = B.cy, bin = spec.outcome === 'bin';
  if (bin) {
    const basket = solidProp([[G.box(0.6 * u, 0.3 * u, 0.3 * u, 0, 0.15 * u, 0), 0xc89a50], ...[0, 1, 2, 3].map((i) => [G.box(0.6 * u, 0.012 * u, 0.31 * u, 0, (0.05 + 0.07 * i) * u, 0), 0xa87a30])], 0.4), sale = textPlane('SALE', { h: 0.16 * u, color: '#ffffff', bg: '#e03030', pad: 0.3 });
    const items = many([[G.box(0.1 * u, 0.1 * u, 0.1 * u), 0xffffff]], 5, 0.6); [0x5ab0ff, 0xffd040, 0x60d070, 0xff6a9a, 0xc080ff].forEach((c, i) => items.setColorAt(i, new THREE.Color(c)));
    basket.position.set(tx, floor, 0); sale.position.set(tx, floor + 0.6 * u, 0.05 * u);
    group.add(basket, sale, items);
    return {
      group,
      step(t) {
        const A = acts(ctx, t, 5.4), pre = A.u < 0, v = pre ? -1 : A.v;
        for (let i = 0; i < 5; i++) { const f = pre ? 0 : between(v, 0.3 + 0.5 * i, 0.8 + 0.5 * i), off = pre ? 1 : between(v, 4.8, 5.3); items.set(i, tx + (i - 2) * 0.1 * u, floor + 0.3 * u + 0.6 * u * (1 - f) + 0.6 * u * off, 0.02 * u, f > 0 ? 1 : 0, i + f * 3, f * 2); }
        items.commit(); sale.scale.setScalar(1 + 0.08 * Math.sin(t * 6)); sale.visible = !pre;
      },
    };
  }
  const tag = solidProp([[G.box(0.5 * u, 0.3 * u, 0.02 * u, 0, 0, 0), 0xfff8e0], [G.cyl(0.025 * u, 0.025 * u, 0.025 * u, -0.2 * u, 0.09 * u, 0, Math.PI / 2), 0xc8c0a0]], 0.5), p1 = textPlane('¥1000', { h: 0.12 * u, color: '#303030', weight: 900 }), p2 = textPlane('¥100', { h: 0.15 * u, color: '#e02020', weight: 900 });
  const slash = solidProp([[G.box(0.4 * u, 0.025 * u, 0.01 * u, 0, 0, 0), 0xe02020]], 0.9), sale = textPlane('SALE', { h: 0.12 * u, color: '#ffffff', bg: '#e03030', pad: 0.3 });
  tag.position.set(tx, ty, 0); p1.position.set(tx + 0.02 * u, ty + 0.05 * u, 0.015 * u); slash.rotation.z = -0.2;
  group.add(tag, p1, slash, p2, sale);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : between(v, 0.6, 1.0) * (1 - between(v, 4.8, 5.3)), d = pre ? 0 : between(v, 1.2, 1.6) * (1 - between(v, 4.8, 5.3));
      slash.visible = s > 0.01; slash.scale.set(grow(s), 1, 1); slash.position.set(tx + 0.02 * u, ty + 0.05 * u, 0.02 * u);
      p2.visible = d > 0.01; p2.position.set(tx + 0.02 * u, ty - 0.06 * u + 0.15 * u * (1 - d), 0.02 * u); p2.scale.setScalar(grow(d));
      sale.visible = d > 0.01; sale.position.set(tx + 0.18 * u, ty + 0.26 * u, 0.04 * u); sale.rotation.z = -0.25 + 0.05 * Math.sin(t * 6); sale.scale.setScalar(grow(d));
    },
  };
}

export const SCENES = { 'snake-long': snakeLong, 'read-book': readBook, 'go-light': goLight, 'sky-rainbow': skyRainbow, 'old-box': oldBox, 'gulp-drink': gulpDrink, 'apple-bite': appleBite, 'pencil-write': pencilWrite, 'walker-steps': walkerSteps, 'price-slash': priceSlash };
