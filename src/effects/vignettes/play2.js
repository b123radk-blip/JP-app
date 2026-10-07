// Batch 2 word scenes: play, school and weather.
//   paper-plane    飛ぶ: a hand throws a paper plane; it swoops up, loops the loop and glides back round
//   snowman        作る: snowballs roll in and stack into a snowman; a carrot nose, eyes and a scarf pop on
//   essay-star     作文: a pencil writes a title and lines on a page; a gold star sticker slaps on the top
//   juggle-crash   大変: a person juggles more and more plates, wobbling; it all comes crashing down, they cover their eyes
//   black-cat      黒い: in the dark a black cat sits, only its yellow eyes blinking; it swishes its tail and walks off
//   rain-umbrella  降る: a cloud rolls over, rain begins to fall, a person pops open an umbrella and the drops bounce off
//   practice-kick  練習: a person kicks a ball against a wall again and again, it bounces back each time
//   piano-lesson   習う: a teacher plays three notes on a piano; a kid on a small keyboard copies them, note for note
//   play-catch     兄弟: a big brother and a little brother throw a ball back and forth
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, ball, burst } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo, bonePoint, arc } from './helpers.js';

const NOTE = (u, c = 0xffe060) => [[G.sphere(0.035 * u, 0, 0, 0, 1.3, 1, 0.7), c], [G.box(0.01 * u, 0.12 * u, 0.01 * u, 0.04 * u, 0.06 * u, 0), c]];

function paperPlane(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.4 * u, sy = floor + 0.55 * u;
  const plane = emblemProp('plane', 0.35 * u), hand = createHand({ u: 0.55 * u, side: -1, sleeve: 0x3a8ae0 });
  hand.pose('pinch'); hand.group.rotation.z = 1.3;
  group.add(plane, hand.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { throw: [0.3, 0.3, 'in'], fly: [0.6, 3.6, 'linear'] }), f = T.fly;
      // a swoop up, a loop, then a long glide round and back to the hand
      const a = f * Math.PI * 2, x = sx + 0.9 * u * Math.sin(a) + 0.2 * u * Math.sin(2 * a), y = sy + 0.35 * u * (1 - Math.cos(a)) + (f > 0.3 && f < 0.6 ? 0.3 * u * Math.sin((f - 0.3) / 0.3 * Math.PI * 2) : 0);
      plane.position.set(f > 0 && f < 1 ? x : sx - 0.1 * u * T.throw, f > 0 && f < 1 ? y : sy, 0.08 * u); plane.rotation.z = f > 0 && f < 1 ? 0.6 * Math.cos(a) + (f > 0.3 && f < 0.6 ? (f - 0.3) / 0.3 * Math.PI * 2 : 0) : 0; plane.idle(0);
      hand.update(); hand.group.visible = !pre && (v < 0.9 || v > 4.0); handTo(hand, sx + 0.1 * u - 0.15 * u * T.throw, sy - 0.04 * u, 0.08 * u);
    },
  };
}

function snowman(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.5 * u, R = [0.2, 0.15, 0.1];
  const balls = R.map((r) => solidProp([[G.sphere(r * u), 0xfafcff]], 0.5)), face = solidProp([[G.cone(0.025 * u, 0.12 * u, 0, 0, 0.1 * u, -Math.PI / 2), 0xff8a20], [G.sphere(0.015 * u, -0.035 * u, 0.04 * u, 0.085 * u), 0x101010], [G.sphere(0.015 * u, 0.035 * u, 0.04 * u, 0.085 * u), 0x101010]], 0.5);
  const scarf = solidProp([[G.torus(0.11 * u, 0.03 * u).rotateX(Math.PI / 2), 0xe03838], [G.box(0.05 * u, 0.15 * u, 0.02 * u, 0.06 * u, -0.08 * u, 0.1 * u), 0xe03838]], 0.5);
  group.add(...balls, face, scarf);
  const loop = 5.6, Y = [R[0], 2 * R[0] + R[1] - 0.03, 2 * R[0] + 2 * R[1] + R[2] - 0.06];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, melt = between(v, 4.8, 5.5);
      balls.forEach((b, i) => {
        const f = pre ? 0 : between(v, i * 0.7, i * 0.7 + 0.6), from = [sx + 1.0 * u, floor + R[i] * u], to = [sx, floor + Y[i] * u], [x, y] = i === 0 ? [from[0] + (to[0] - from[0]) * f, from[1]] : arc(from, to, 0.4 * u, f);
        b.visible = f > 0 && melt < 1; b.position.set(x, y, 0.04 * u); b.rotation.z = (1 - f) * 6; b.scale.setScalar(Math.max(1e-3, (i === 0 ? 0.5 + 0.5 * f : 1) * (1 - melt)));
      });
      const k = pre ? 0 : between(v, 2.3, 2.6) * (1 - melt); face.visible = scarf.visible = k > 0.01;
      face.position.set(sx, floor + Y[2] * u, 0.04 * u); face.scale.setScalar(Math.max(1e-3, k)); scarf.position.set(sx, floor + (Y[2] - R[2] + 0.01) * u, 0.04 * u); scarf.scale.setScalar(Math.max(1e-3, between(v, 2.7, 3.0) * (1 - melt)));
    },
  };
}

function essayStar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.45 * u, cy = B.cy + 0.03 * u;
  const page = solidProp([[G.box(0.45 * u, 0.58 * u, 0.01 * u, 0, 0, 0), 0xfaf8f0], [G.box(0.02 * u, 0.58 * u, 0.012 * u, -0.17 * u, 0, 0), 0xf08080]], 0.4);
  const lines = many([[G.box(1, 0.012 * u, 0.004 * u, 0.5, 0, 0), 0x3a4a8a]], 6, 0.3), pen = emblemProp('pen', 0.3 * u), star = burst(u, { s: 0.25, n: 5, color: 0xffc820 });
  page.position.set(cx, cy, 0);
  group.add(page, lines, pen, star);
  const loop = 5.2, N = 6, LW = [0.22, 0.3, 0.32, 0.28, 0.32, 0.18];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, w = pre ? 0 : between(v, 0.2, 3.2) * N, clear = between(v, 4.6, 5.0);
      let px = cx - 0.13 * u, py = cy + 0.2 * u;
      for (let i = 0; i < N; i++) { const k = Math.max(0, Math.min(1, w - i)), y = cy + 0.2 * u - i * 0.075 * u - (i ? 0.03 * u : 0), x0 = cx - 0.13 * u + (i ? 0 : 0.03 * u); lines.set(i, x0, y, 0.008 * u, k > 0 && clear < 1 ? 1 : 0); lines.instanceMatrix.needsUpdate = true; if (k > 0 && k < 1) { px = x0 + LW[i] * u * k; py = y; } }
      for (let i = 0; i < N; i++) { const k = Math.max(0, Math.min(1, w - i)), m = new THREE.Matrix4(); lines.getMatrixAt(i, m); const p = new THREE.Vector3().setFromMatrixPosition(m); lines.setMatrixAt(i, m.makeScale(Math.max(1e-4, LW[i] * u * k * (1 - clear)), i ? 1 : 1.6, 1).setPosition(p)); }
      lines.commit();
      pen.visible = !pre && w > 0 && w < N; pen.position.set(px + 0.05 * u, py + 0.08 * u, 0.04 * u); pen.rotation.z = 0.3; pen.idle(0);
      const s = pre ? 0 : between(v, 3.4, 3.6) * (1 - clear); star.visible = s > 0.01; star.position.set(cx + 0.13 * u, cy + 0.22 * u, 0.02 * u); star.scale.setScalar(Math.max(1e-3, s * (1 + 0.3 * bump(v, 3.4, 0.3)))); star.rotation.z = 0.3;
    },
  };
}

function juggleCrash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u, N = 5;
  const p = createPerson({ u, shirt: 0x3aa0a0 }), plates = many([[G.cyl(0.15 * u, 0.1 * u, 0.03 * u, 0, 0, 0, Math.PI / 2 - 0.3, 0, 0, 24), 0xf6f4ee], [G.torus(0.12 * u, 0.012 * u).rotateX(-0.3).translate(0, 0, 0.016 * u), 0x3a6ad0]], N, 0.45);   // face-on to you
  const shards = many([[G.cone(0.025 * u, 0.04 * u, 0, 0), 0xf6f4ee]], 8, 0.4);
  group.add(p.group, plates, shards);
  const loop = 5.4, crash = 3.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const n = pre ? 0 : Math.min(N, 1 + Math.floor(v / 0.5)), falling = !pre && v > crash, cover = between(v, crash + 0.3, crash + 0.6) * (1 - between(v, 4.8, 5.2));
      p.group.position.set(px, floor, 0.05 * u); p.face('toward').reset();
      const j = Math.sin(v * 9); p.bone('armL').rotation.x = falling ? 1.6 * cover : 1.0 + 0.4 * j; p.bone('armR').rotation.x = falling ? 1.6 * cover : 1.0 - 0.4 * j; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = falling ? 1.9 * cover : 0.8;
      p.group.rotation.z = !falling ? 0.04 * n * Math.sin(v * 5) : 0; p.update();
      for (let i = 0; i < N; i++) {
        if (i >= n) { plates.set(i, 0, 0, 0, 0); continue; }
        const ph = v * 3 + (i / N) * Math.PI * 2, x = px + 0.25 * u * Math.cos(ph), y = floor + 0.85 * u + 0.25 * u * Math.abs(Math.sin(ph));
        const fall = falling ? between(v, crash + i * 0.05, crash + 0.45 + i * 0.05) : 0, yy = y - (y - floor) * fall * fall;
        plates.set(i, x + 0.1 * u * fall * (i - 2), yy, 0.1 * u, fall >= 1 ? 0 : 1, ph * 2 + fall * 4);
      }
      plates.commit();
      for (let i = 0; i < 8; i++) { const f = between(v, crash + 0.45, crash + 1.2), a = (i / 8) * Math.PI; shards.set(i, px + Math.cos(a) * 0.5 * u * f, floor + 0.02 * u + 0.25 * u * Math.sin(Math.PI * f) * Math.sin(a), 0.12 * u, f > 0 && f < 1 ? 1 : 0, i); }
      shards.commit();
    },
  };
}

function blackCat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u, CAT = 0x16161c;
  const cat = solidProp([[G.sphere(0.17 * u, 0, 0.17 * u, 0, 1, 1.1, 0.8), CAT], [G.sphere(0.12 * u, 0, 0.42 * u, 0.02 * u), CAT], [G.cone(0.045 * u, 0.1 * u, -0.07 * u, 0.54 * u, 0, 0.3), CAT], [G.cone(0.045 * u, 0.1 * u, 0.07 * u, 0.54 * u, 0, -0.3), CAT]], 0.15);
  const tail = solidProp([[G.tube([[0, 0], [0.15 * u, 0.05 * u], [0.22 * u, 0.2 * u], [0.18 * u, 0.32 * u]], 0.025 * u), CAT]], 0.15);
  const eyes = many([[G.sphere(0.028 * u, 0, 0, 0, 1, 0.9, 0.5), 0xffe020]], 2, 1.6), dark = solidProp([[new THREE.CircleGeometry(0.75 * u, 40), 0x05050a]], 0);
  dark.material.transparent = true; dark.material.opacity = 0.75; dark.position.set(cx, floor + 0.4 * u, -0.1 * u);
  const g = new THREE.Group(); g.add(cat, tail); tail.position.set(0.14 * u, 0.06 * u, -0.03 * u);
  group.add(dark, g, eyes);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [3.6, 1.2, 'in'] }), x = cx + 0.9 * u * T.walk;
      g.position.set(x, floor, 0.05 * u); g.rotation.y = T.walk > 0 ? Math.PI / 2 : 0; tail.rotation.z = 0.3 * Math.sin(t * 2.5);
      const blink = (v % 1.6) < 0.12 ? 0.15 : 1, on = T.walk < 0.3 && !pre ? blink : 0;
      eyes.set(0, x - 0.045 * u, floor + 0.44 * u, 0.17 * u, on); eyes.set(1, x + 0.045 * u, floor + 0.44 * u, 0.17 * u, on); eyes.commit();
      eyes.scale.set(1, 1, 1);
    },
  };
}

function rainUmbrella(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u;
  const cloud = solidProp([[G.sphere(0.2 * u, 0, 0, 0, 1.4, 0.8, 0.8), 0x7a808c], [G.sphere(0.15 * u, -0.22 * u, -0.04 * u), 0x7a808c], [G.sphere(0.16 * u, 0.22 * u, -0.03 * u), 0x7a808c]], 0.3);
  const rain = many([[G.sphere(0.014 * u, 0, 0, 0, 0.7, 2.6, 0.7), 0x8ac8ff]], 20, 0.8), splash = many([[G.sphere(0.012 * u), 0xc8eaff]], 6, 0.8);
  const p = createPerson({ u: 0.85 * u, shirt: 0xf0c030 }), brolly = emblemProp('umbrella', 0.55 * u, { color: 0xe04848 });
  group.add(cloud, rain, p.group, brolly, splash);
  const loop = 5.0, top = floor + 1.0 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { roll: [0, 0.8, 'out'], rain: [0.8, 0.3], open: [1.4, 0.4, 'back'], go: [4.3, 0.6] }), c = pre ? 0 : T.roll * (1 - T.go);
      cloud.position.set(px + 1.0 * u * (1 - T.roll) + 1.2 * u * T.go, floor + 1.25 * u, 0); cloud.visible = c > 0.01;
      const raining = T.rain > 0.5 && T.go < 0.5, open = pre ? 0 : T.open * (1 - T.go);
      for (let i = 0; i < 20; i++) { const f = ((t * 1.8 + i / 20 * 3) % 1), x = px + (i % 10 - 4.5) * 0.07 * u, under = Math.abs(x - px) < 0.25 * u && open > 0.5, stopY = under ? top + 0.05 * u : floor; const y = floor + 1.15 * u - 1.15 * u * f; rain.set(i, x, Math.max(y, stopY), 0.08 * u * ((i % 3) - 1), raining && y > stopY ? 1 : 0); }
      rain.commit();
      for (let i = 0; i < 6; i++) { const f = ((t * 3 + i / 6) % 1); splash.set(i, px + (i - 2.5) * 0.08 * u, top + 0.06 * u + 0.05 * u * Math.sin(Math.PI * f), 0.05 * u, raining && open > 0.5 ? Math.sin(Math.PI * f) : 0); }
      splash.commit();
      p.group.position.set(px, floor, 0.05 * u); p.face('toward').reset(); p.raise('R', 0.5 + 1.0 * open); p.bone('foreR').rotation.z = -0.6 * open; p.lean(raining && open < 0.5 ? 0.2 : 0); p.update();
      brolly.visible = open > 0.01; brolly.position.set(px + 0.03 * u, top - 0.05 * u, 0.05 * u); brolly.scale.set(0.55 * u * Math.max(1e-3, open), 0.55 * u, 0.55 * u * Math.max(1e-3, open)); brolly.idle(t * 0.3);
    },
  };
}

function practiceKick(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wallX = B.maxX + 1.25 * u, px = B.maxX + 0.35 * u;
  const wall = solidProp([[G.box(0.08 * u, 0.9 * u, 0.6 * u, 0, 0.45 * u, 0), 0xc08060], [G.box(0.085 * u, 0.02 * u, 0.6 * u, 0, 0.3 * u, 0), 0xa06040], [G.box(0.085 * u, 0.02 * u, 0.6 * u, 0, 0.6 * u, 0), 0xa06040]], 0.3);
  wall.position.set(wallX, floor, -0.05 * u);
  const p = createPerson({ u: 0.85 * u, shirt: 0x40a050 }), b = ball(u, { r: 0.075, color: 0xffffff, stripe: 0x202020 });
  group.add(wall, p.group, b);
  const per = 1.2, loop = per * 4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = pre ? 0 : (v % per) / per;
      const kick = bump(s, 0, 0.25), out = s < 0.5 ? s / 0.5 : 1 - (s - 0.5) / 0.5, bx = px + 0.18 * u + (wallX - 0.04 * u - 0.075 * u - px - 0.18 * u) * out;
      b.position.set(bx, floor + 0.075 * u + 0.12 * u * Math.sin(Math.PI * out), 0.05 * u); b.rotation.z = -out * 8;
      p.group.position.set(px, floor, 0.05 * u); p.face('right').reset(); p.bone('legR').rotation.x = 1.1 * kick - 0.4 * bump(s, 0.85, 0.15); p.raise('L', 0.6 * kick); p.update();
    },
  };
}

function pianoLesson(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const keys = (w, n) => { const c = document.createElement('canvas'); c.width = 32 * n; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#fafafa'; g.fillRect(0, 0, c.width, 64); g.fillStyle = '#202020'; for (let i = 0; i < n; i++) { g.fillRect(i * 32, 0, 2, 64); if (i % 7 !== 2 && i % 7 !== 6) g.fillRect(i * 32 + 22, 0, 18, 38); } const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; };
  const big = solidProp([[G.box(0.7 * u, 0.5 * u, 0.3 * u, 0, 0.25 * u, -0.1 * u), 0x1a1a20], [G.box(0.7 * u, 0.25 * u, 0.06 * u, 0, 0.62 * u, -0.22 * u), 0x1a1a20]], 0.2);
  const bigKeys = new THREE.Mesh(new THREE.PlaneGeometry(0.66 * u, 0.12 * u).rotateX(-Math.PI / 2 + 0.4), new THREE.MeshBasicMaterial({ map: keys(0.66, 14) }));
  const small = solidProp([[G.box(0.45 * u, 0.06 * u, 0.15 * u, 0, 0.28 * u, 0), 0xe04a8a], [G.box(0.03 * u, 0.28 * u, 0.03 * u, -0.18 * u, 0.14 * u, 0), 0x404040], [G.box(0.03 * u, 0.28 * u, 0.03 * u, 0.18 * u, 0.14 * u, 0), 0x404040]], 0.3);
  const smallKeys = new THREE.Mesh(new THREE.PlaneGeometry(0.42 * u, 0.09 * u).rotateX(-Math.PI / 2 + 0.4), new THREE.MeshBasicMaterial({ map: keys(0.42, 10) }));
  const bx = B.maxX + 0.5 * u, sx = bx + 0.85 * u; big.position.set(bx, floor, 0); bigKeys.position.set(bx, floor + 0.51 * u, 0.06 * u); small.position.set(sx, floor, 0.1 * u); smallKeys.position.set(sx, floor + 0.315 * u, 0.1 * u);
  const teacher = createPerson({ u: 0.95 * u, shirt: 0x6a4a8a }), kid = createPerson({ u: 0.6 * u, shirt: 0xf0a030 }), notes = many(NOTE(u), 3, 0.9), kidNotes = many(NOTE(u, 0x9ae0ff), 3, 0.9);
  group.add(big, bigKeys, small, smallKeys, teacher.group, kid.group, notes, kidNotes);
  const loop = 5.4, T1 = [0.3, 0.7, 1.1], T2 = [2.2, 2.6, 3.0];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      teacher.group.position.set(bx, floor, 0.32 * u); teacher.face('away').reset(); const tp = pre ? 0 : Math.max(...T1.map((x) => bump(v, x, 0.25))); teacher.bone('armL').rotation.x = teacher.bone('armR').rotation.x = 1.2 - 0.25 * tp; teacher.update();
      kid.group.position.set(sx, floor, 0.32 * u); kid.face('away').reset(); const kp = pre ? 0 : Math.max(...T2.map((x) => bump(v, x, 0.25))); kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 1.2 - 0.25 * kp; kid.update();
      T1.forEach((x, i) => { const f = pre ? 0 : between(v, x, x + 1.0); notes.set(i, bx - 0.15 * u + i * 0.15 * u, floor + 0.75 * u + 0.4 * u * f, 0.05 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) * 1.2 : 0); }); notes.commit();
      T2.forEach((x, i) => { const f = pre ? 0 : between(v, x, x + 1.0); kidNotes.set(i, sx - 0.12 * u + i * 0.12 * u, floor + 0.55 * u + 0.4 * u * f, 0.12 * u, f > 0 && f < 1 ? Math.sin(Math.PI * f) * 1.2 : 0); }); kidNotes.commit();
    },
  };
}

function playCatch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = createPerson({ u: 1.0 * u, shirt: 0x3a6ae0 }), small = createPerson({ u: 0.6 * u, shirt: 0xf0c030, hair: 0x6a3a1a }), b = ball(u, { r: 0.06, color: 0xe04848, stripe: 0xffffff });
  group.add(big.group, small.group, b);
  const per = 1.4, loop = per * 2, hb = new THREE.Vector3(), hs = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      big.group.position.set(B.maxX + 0.3 * u, floor, 0.05 * u); small.group.position.set(B.maxX + 1.25 * u, floor, 0.05 * u);
      const s = pre ? 0 : (v % loop) / per, toSmall = s < 1, f = toSmall ? s : s - 1;
      big.face('right').reset(); big.bone('armR').rotation.x = 1.0 + (toSmall ? 1.2 * bump(f, 0, 0.3) : 0.6 * between(f, 0.7, 1)); big.update();
      small.face('left').reset(); small.bone('armL').rotation.x = 1.0 + (!toSmall ? 1.2 * bump(f, 0, 0.3) : 0.6 * between(f, 0.7, 1)); small.bone('armR').rotation.x = 1.0; small.group.position.y += !toSmall && f > 0.85 ? 0 : 0; small.update();
      bonePoint(big, 'handR', 0.5, hb); bonePoint(small, 'handL', 0.5, hs);
      const [x, y] = arc(toSmall ? [hb.x, hb.y] : [hs.x, hs.y], toSmall ? [hs.x, hs.y] : [hb.x, hb.y], 0.45 * u, f);
      b.position.set(x, y + 0.04 * u, 0.1 * u); b.rotation.z = f * 6;
    },
  };
}

export const SCENES = { 'paper-plane': paperPlane, snowman, 'essay-star': essayStar, 'juggle-crash': juggleCrash, 'black-cat': blackCat, 'rain-umbrella': rainUmbrella, 'practice-kick': practiceKick, 'piano-lesson': pianoLesson, 'play-catch': playCatch };
