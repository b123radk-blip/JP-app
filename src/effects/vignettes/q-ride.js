// Model scenes, buses and bicycles (Step 3a model pass, batch 5).
//   q-bus-ride  乗: a girl waits at a bus stop (バス); a green bus comes up the road and pulls in; the door folds open, she
//               climbs in, sits down at a window and waves out of it as the bus drives off; outcome bike: a boy walks up
//               to his bicycle, hops up onto the saddle (よいしょ!), waves and pedals off (乗る)
//   q-bus-off   降りる: an orange bus pulls in with a man sitting at a window; he stands up, the door opens and he steps
//               down onto the pavement with a hop (ぴょん), waves the bus off and walks away
//   q-bike-bell 自転車: a boy rides a big red bicycle round and round in front of you, pedalling; each time he passes he
//               rings the bell: チリンチリン!
// Buses and bicycles are shapes; people sit with the SitDown clip and hold handlebars with handTo.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { textPlane } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, TEEN } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), E = new THREE.Euler();
const TAU = Math.PI * 2;

// A city bus side-on, its front toward local +x; origin on the ground under its middle. Open windows over a dark far
// wall, so a passenger inside shows; the door (near the front, on the viewer's side) folds open. 3 draw calls.
export function busProp(u, color = 0x2fa060, L = 1.45) {
  const k = (x) => x * u, l = k(L), D = k(0.5), z0 = D / 2, cream = 0xf4f0e0, glass = 0x9ad0f0;
  const yb = k(0.12), yw = k(0.46), yr = k(0.92), yt = k(1.02), d0 = l / 2 - k(0.38), d1 = l / 2 - k(0.1), g = new THREE.Group();
  const pill = (x) => [G.box(k(0.045), yr - yw, k(0.03), x, (yw + yr) / 2, z0 - k(0.015)), color];
  const body = solidProp([
    [G.box(d0 + l / 2, yw - yb, D, (d0 - l / 2) / 2, (yb + yw) / 2, 0), color], [G.box(l / 2 - d1, yw - yb, D, (d1 + l / 2) / 2, (yb + yw) / 2, 0), color],
    [G.box(l, k(0.03), D, 0, yb + k(0.015), 0), 0x5a5f68], [G.box(l, yr - yb, k(0.02), 0, (yb + yr) / 2, -z0 + k(0.01)), 0x2a3442],
    [G.box(l + k(0.01), yt - yr, D + k(0.01), 0, (yr + yt) / 2, 0), cream], [G.box(k(0.03), yr - yw, D, l / 2 - k(0.015), (yw + yr) / 2, 0), glass],
    [G.box(k(0.03), yr - yw, D, -l / 2 + k(0.015), (yw + yr) / 2, 0), color], [G.box(k(0.02), k(0.07), D * 0.7, l / 2 + k(0.01), yr - k(0.05), 0), 0xffa020],
    [G.box(d0 + l / 2, k(0.04), k(0.01), (d0 - l / 2) / 2, yb + k(0.07), z0 + k(0.005)), cream], [G.box(l / 2 - d1, k(0.04), k(0.01), (d1 + l / 2) / 2, yb + k(0.07), z0 + k(0.005)), cream],
    ...[-l / 2 + k(0.02), -l / 2 + k(0.33), -l / 2 + k(0.64), d0].map(pill), pill(d1), pill(l / 2 - k(0.02)),
    ...[-0.45, -0.15, 0.15].map((x) => [G.box(k(0.2), k(0.16), k(0.04), k(x) * L / 1.35, yw + k(0.02), -k(0.12)), 0x3a5ab0]),
    [G.sphere(k(0.035), l / 2, yb + k(0.1), z0 - k(0.07)), 0xfff4b0], [G.sphere(k(0.035), l / 2, yb + k(0.1), -z0 + k(0.07)), 0xfff4b0],
  ], 0.4);
  const r = k(0.13), wheels = many([[G.cyl(r, r, k(0.08), 0, 0, 0, Math.PI / 2), 0x202428], [G.cyl(r * 0.5, r * 0.5, k(0.085), 0, 0, 0, Math.PI / 2), 0xc8ccd4], [G.box(r * 1.1, r * 0.18, k(0.09), 0, 0, 0), 0x8a8f98]], 4, 0.3);
  const door = solidProp([[G.box(d1 - d0 - k(0.04), yr - yb - k(0.02), k(0.015), -(d1 - d0) / 2, (yb + yr) / 2, 0), cream], [G.box((d1 - d0) * 0.6, (yr - yw) * 0.8, k(0.02), -(d1 - d0) / 2, (yw + yr) / 2, 0), glass]], 0.4);
  door.position.set(d1 - k(0.02), 0, z0 + k(0.008));
  g.add(body, wheels, door);
  const WX = [l / 2 - k(0.28), -l / 2 + k(0.3)];
  return {
    group: g, l, D, floorY: yb + k(0.03), doorX: (d0 + d1) / 2, sillY: yw, x0: -l / 2,
    // f: how far the door is open; dist: how far the bus has rolled (turns the wheels)
    set(f, dist) {
      door.scale.x = 1 - 0.85 * f;
      for (let i = 0; i < 4; i++) wheels.set(i, WX[i % 2], r, (i < 2 ? 1 : -1) * (z0 - k(0.03)), 1, -dist / r);
      wheels.commit();
    },
  };
}
// a bus stop: a pole with a round sign saying バス. 2 draw calls.
export function busStop(u) {
  const k = (x) => x * u, g = new THREE.Group();
  const post = solidProp([[G.cyl(k(0.015), k(0.015), k(0.95), 0, k(0.475), 0), 0xb8c0cc], [G.cyl(k(0.15), k(0.15), k(0.025), 0, k(0.95), 0, Math.PI / 2), 0x2a7ad0], [G.cyl(k(0.07), k(0.08), k(0.04), 0, k(0.02), 0), 0x6a707a]], 0.4);
  const word = textPlane('バス', { h: k(0.11), color: '#ffffff' }); word.position.set(0, k(0.95), k(0.016));
  g.add(post, word);
  return g;
}
// the road a bus comes along: from far back it turns into a street along x; a pavement in front. 1 draw call.
const street = (u, x0, x1, xBack) => solidProp([[G.box(x1 - x0, 0.01 * u, 0.65 * u, (x0 + x1) / 2, 0, -0.05 * u), 0x50545c], [G.box(0.65 * u, 0.01 * u, 6 * u, xBack, 0, -3.3 * u), 0x50545c],
  [G.box(x1 - x0, 0.04 * u, 0.5 * u, (x0 + x1) / 2, 0.02 * u, 0.53 * u), 0xc8c4bc], [G.box(x1 - x0, 0.05 * u, 0.04 * u, (x0 + x1) / 2, 0.025 * u, 0.28 * u), 0x8a8a8a],
  ...[0, 1, 2, 3].map((i) => [G.box(0.18 * u, 0.012 * u, 0.03 * u, x0 + (i + 0.5) * (x1 - x0) / 4, 0.001 * u, -0.05 * u), 0xf4f0e0])], 0.3);

// where the bus is: a 1 (far back, coming toward you) .. 0 (at the stop, facing +x), then g 0..1 drives it off to the right
const R = 0.8;
function drive(bus, bx, y, a, g, u) {
  const turn = Math.min(1, a * 3), far = Math.max(0, a - 1 / 3) * 1.5, th = Math.PI / 2 * (1 + turn);
  bus.group.position.set(bx + R * u * Math.cos(th) + 2.8 * u * g, y, -R * u + R * u * Math.sin(th) - far * 6 * u);
  bus.group.rotation.y = -Math.PI / 2 * turn;
  bus.group.visible = a < 0.98 && g < 0.99;
  return (R * Math.PI / 2 * (1 - turn) + (1 - far) * 6 + 2.8 * g) * u;
}
// a person inside the bus at its own point (x, y, z) facing yaw (in the bus's frame)
function inBus(p, bus, space, x, y, z, yaw) {
  bus.group.updateWorldMatrix(true, false);
  p.group.position.copy(space.worldToLocal(bus.group.localToWorld(W.set(x, y, z))));
  p.group.rotation.y = bus.group.rotation.y + yaw;
}

// shift a posed person so her hips bone sits on world point `at` (a saddle, a seat, a hammock); call after pose()
const H1 = new THREE.Vector3(), H2 = new THREE.Vector3();
export function seatAt(p, space, at, k = 1) {
  const hips = p.node('Hips'); if (!hips) return;
  p.group.updateWorldMatrix(true, true); hips.getWorldPosition(H1);
  space.worldToLocal(H1); space.worldToLocal(H2.copy(at));
  p.group.position.add(H2.sub(H1).multiplyScalar(k)); p.group.updateWorldMatrix(true, true);
}

// ---- 乗 / 乗る ----
function busRide(ctx, spec, stage) {
  if (spec.outcome === 'bike') return bikeOn(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.35 * u + 0.68 * u;
  const bus = busProp(u, 0x2fa060), p = person(spec.who, u, 0.8), stop = busStop(u), road = street(u, B.maxX + 0.1 * u, B.maxX + 3.2 * u, bx - R * u);
  const sx = bx + bus.doorX, seat = -0.18 * u;
  stop.position.set(sx + 0.3 * u, floor + 0.04 * u, 0.62 * u); road.position.set(0, floor, 0);
  group.add(road, bus.group, stop, p.group);
  const loop = 10.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0.3, 2.4, 'out'], door: [2.8, 0.4], walk: [3.2, 0.8, 'linear'], aisle: [4.0, 0.7, 'linear'], sit: [4.7, 0.6], shut: [4.6, 0.4], go: [6.6, 1.8, 'in'], back: [8.6, 1.3, 'linear'] });
      const a = pre ? 0 : 1 - T.come, gone = pre ? 0 : T.go;
      const dist = drive(bus, bx, floor, pre ? 1 : a, gone, u);
      bus.set(T.door * (1 - T.shut), dist);
      // she waits at the stop; climbs in through the door, walks to a seat and sits facing the window; waves as it goes
      if (pre || v < 3.2 || v >= 8.6) {
        const inn = pre ? 0 : T.back;
        p.pose(inn > 0 && inn < 1 ? 'Walk' : 'Idle', inn > 0 && inn < 1 ? v : t);
        p.group.position.set(lerp(B.maxX + 3.0 * u, sx, pre || v < 3.2 ? 1 : inn), floor + 0.04 * u, 0.5 * u);
        p.group.rotation.y = inn > 0 && inn < 1 ? LEFT : -0.25;
        p.group.visible = true;
      } else if (v < 4.0) {
        p.pose('Walk', v); const f = T.walk;
        inBus(p, bus, group, bus.doorX, lerp(0, bus.floorY, between(f, 0.35, 0.6)), lerp(0.5 * u, 0, f), Math.PI);
      } else if (v < 4.7) {
        p.pose('Walk', v); inBus(p, bus, group, lerp(bus.doorX, seat, T.aisle), bus.floorY, -0.02 * u, LEFT);
      } else {
        p.pose('SitDown', Math.min(1, (v - 4.7) * 1.2), false);
        inBus(p, bus, group, seat, bus.floorY, -0.08 * u, lerp(LEFT, -0.3, T.sit));
        seatAt(p, group, bus.group.localToWorld(W.set(seat, bus.floorY + 0.2 * u, -0.1 * u)), T.sit);
        const w = between(v, 5.4, 5.7) * (1 - between(v, 8.2, 8.5));
        p.wave('R', w, v);
      }
    },
  };
}

// ---- 降りる ----
function busOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.35 * u + 0.68 * u;
  const bus = busProp(u, 0xe0782a), p = person(spec.who, u, 0.85), road = street(u, B.maxX + 0.1 * u, B.maxX + 3.2 * u, bx - R * u);
  const seat = -0.2 * u, down = label(u, 'ぴょん', '#e0782a', 0.12);
  road.position.set(0, floor, 0);
  group.add(road, bus.group, p.group, down);
  const loop = 9.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 2.4, 'out'], door: [3.2, 0.4], aisle: [3.4, 0.8, 'linear'], out: [4.2, 0.9, 'linear'], shut: [5.4, 0.4], go: [6.0, 1.8, 'in'], away: [7.8, 1.4, 'linear'] });
      const a = pre ? 0 : 1 - T.come, gone = pre ? 0 : T.go;
      const dist = drive(bus, bx, floor, a, gone, u);
      bus.set(T.door * (1 - T.shut), dist);
      if (pre || v < 2.6) {
        p.pose('SitDown', 1, false); inBus(p, bus, group, seat, bus.floorY, -0.08 * u, -0.3);
        seatAt(p, group, bus.group.localToWorld(W.set(seat, bus.floorY + 0.2 * u, -0.1 * u)));
        p.wave('R', 0, 0);
      } else if (v < 3.4) {
        p.pose('StandUp', (v - 2.6) * 1.5, false); inBus(p, bus, group, seat, bus.floorY, -0.08 * u, -0.3 + (RIGHT + 0.3) * between(v, 2.9, 3.4));
        seatAt(p, group, bus.group.localToWorld(W.set(seat, bus.floorY + 0.2 * u, -0.1 * u)), 1 - between(v, 2.6, 3.3));
      } else if (v < 4.2) {
        p.pose('Walk', v); inBus(p, bus, group, lerp(seat, bus.doorX, T.aisle), bus.floorY, -0.02 * u, RIGHT);
      } else if (v < 5.1) {
        // out of the door and a hop down onto the pavement
        const f = T.out, hop = between(f, 0.4, 0.8);
        p.pose('Walk', v);
        inBus(p, bus, group, bus.doorX, lerp(bus.floorY, 0.04 * u, hop) + 0.08 * u * Math.sin(Math.PI * hop), lerp(-0.02 * u, 0.5 * u, f), lerp(RIGHT, 0, between(f, 0, 0.4)));
      } else {
        const w = T.away;
        p.pose(w > 0 && w < 1 ? 'Walk' : 'Idle', w > 0 && w < 1 ? v : t);
        p.group.position.set(lerp(bx + bus.doorX, B.maxX + 3.2 * u, w), floor + 0.04 * u, 0.5 * u);
        p.group.rotation.y = w > 0 ? RIGHT : lerp(0, RIGHT - 0.3, between(v, 5.8, 6.2));
        p.wave('R', between(v, 6.0, 6.3) * (1 - between(v, 7.4, 7.7)), v);
      }
      pop(down, pre ? 0 : bump(v, 4.5, 1.0) > 0.2 ? 1 : 0, bx + bus.doorX + 0.35 * u, floor + 0.9 * u, 0.55 * u);
    },
  };
}

// A bicycle facing local +z (like a person), origin on the ground between the wheels; s scales it (1: a child's bike).
// 2 draw calls (frame, wheels). set(dist) turns the wheels; bar(side) / seatY / pedal give the rider's holds.
export function bikeProp(u, s = 1, color = 0xe04848) {
  const k = (x) => x * u * s, r = k(0.14), wb = k(0.5), seatY = k(0.4), barY = k(0.46), g = new THREE.Group();
  const yz = (geo) => geo.rotateY(-Math.PI / 2);         // built in x (forward) / y, turned so forward is +z
  const P = { ra: [-wb / 2, r], bb: [0, r * 0.95], st: [-k(0.07), seatY - k(0.03)], ht: [wb / 2 - k(0.06), barY - k(0.05)], fa: [wb / 2, r] };
  const frame = solidProp([
    [yz(G.poly([P.ra, P.bb, P.st, P.ra], k(0.012))), color], [yz(G.poly([P.st, P.ht, P.bb], k(0.014))), color], [yz(G.poly([P.fa, P.ht, [wb / 2 - k(0.08), barY]], k(0.012))), 0xc8ccd4],
    [G.box(k(0.07), k(0.025), k(0.12), 0, seatY, -k(0.08)), 0x202428], [G.cyl(k(0.012), k(0.012), k(0.3), 0, barY, wb / 2 - k(0.09), 0, 0, Math.PI / 2), 0xc8ccd4],
    [G.sphere(k(0.022), k(0.08), barY + k(0.02), wb / 2 - k(0.09)), 0xffd040], [G.box(k(0.12), k(0.015), k(0.04), 0, r * 0.95, 0), 0x404448],
  ], 0.4);
  const wheels = many([[yz(G.torus(r, k(0.016))), 0x202428], [G.box(k(0.012), r * 1.9, k(0.01), 0, 0, 0), 0xd8dce4], [G.box(k(0.012), k(0.01), r * 1.9, 0, 0, 0), 0xd8dce4], [G.cyl(k(0.02), k(0.02), k(0.03), 0, 0, 0, 0, 0, Math.PI / 2), 0xc8ccd4]], 2, 0.4);
  g.add(frame, wheels);
  return {
    group: g, seatY, r, saddle: [0, seatY + k(0.03), -k(0.09)], bell: [k(0.08), barY + k(0.02), wb / 2 - k(0.09)],
    set(dist) { wheels.set(0, 0, r, -wb / 2, 1, 0, 0, dist / r); wheels.set(1, 0, r, wb / 2, 1, 0, 0, dist / r); wheels.commit(); },
    bar: (side) => [side === 'R' ? -k(0.14) : k(0.14), barY, wb / 2 - k(0.09)],
  };
}
// the rider sits on the saddle (SitDown pose), hands on the bars, feet going round (ph: pedal angle)
export function ride(p, bike, space, ph, hands = { R: 1, L: 1 }) {
  p.pose('SitDown', 1, false);
  bike.group.updateWorldMatrix(true, false);
  p.group.position.copy(space.worldToLocal(bike.group.localToWorld(W.set(0, 0, 0))));
  p.group.rotation.y = bike.group.rotation.y;
  seatAt(p, space, bike.group.localToWorld(W.set(...bike.saddle)));
  p.turn('UpperLegL', -0.35 + 0.3 * Math.sin(ph)); p.turn('UpperLegR', -0.35 - 0.3 * Math.sin(ph));
  p.turn('Abdomen', 0.25);
  for (const side of ['R', 'L']) if (hands[side] > 0) p.handTo(side, bike.group.localToWorld(W2.set(...bike.bar(side))), hands[side], { out: 0.5, down: 0.6 });
}

// ---- 乗る (bike) ----
function bikeOn(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.75 * u;
  const p = person(spec.who, u, KID + 0.1), bike = bikeProp(u, 1, 0x2a8ae0), ring = label(u, 'よいしょ!', '#2a8ae0', 0.12);
  group.add(bike.group, p.group, ring);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.2, 1.0, 'linear'], hop: [1.6, 0.6], go: [3.6, 2.2, 'in'] });
      const x = bx + 2.6 * u * T.go, k = grow(pre ? 1 : between(v, 0, 0.3));
      bike.group.position.set(x, floor, 0.1 * u); bike.group.rotation.y = RIGHT; bike.set(2.6 * u * T.go);
      bike.group.scale.setScalar(k); p.group.scale.setScalar(k);
      if (T.hop < 1 && !pre) {
        // he walks up beside the bike, then hops up onto the saddle
        p.pose(T.walk > 0 && T.walk < 1 ? 'Walk' : T.hop > 0 ? 'SitDown' : 'Idle', T.walk > 0 && T.walk < 1 ? v : T.hop > 0 ? T.hop : t, T.hop === 0);
        const sx = lerp(bx - 0.5 * u, bx - 0.05 * u, T.walk), hz = lerp(0.35 * u, 0.1 * u, T.hop);
        p.group.position.set(lerp(sx, bx, T.hop), floor + 0.12 * u * Math.sin(Math.PI * T.hop), hz);
        p.group.rotation.y = T.walk < 1 ? RIGHT : lerp(0, RIGHT, T.hop);
        seatAt(p, group, bike.group.localToWorld(W.set(...bike.saddle)), T.hop);
      } else ride(p, bike, group, 2.6 * u * T.go / bike.r, { R: 1, L: 1 - bump(v, 2.6, 0.9) });
      if (!pre && v > 2.4 && v < 3.4) p.wave('L', bump(v, 2.5, 0.9), v);
      pop(ring, pre ? 0 : bump(v, 1.5, 1.0) > 0.2 ? 1 : 0, bx + 0.3 * u, floor + 0.95 * u, 0.2 * u);
    },
  };
}

// ---- 自転車 ----
function bikeBell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.95 * u, cz = -0.35 * u, rx = 0.6 * u, rz = 0.5 * u;
  const p = person(spec.who, u, TEEN), bike = bikeProp(u, 1.3, 0xe04040), ring = label(u, 'チリンチリン!', '#e0a020', 0.12);
  const lines = many([[G.box(0.012 * u, 0.06 * u, 0.01 * u, 0, 0.05 * u, 0), 0xffd040]], 3, 1.2);
  group.add(bike.group, p.group, ring, lines);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // round an oval in front of you, anticlockwise from above: passing in front he rides to the right
      const th = (pre ? 0 : v / loop) * TAU - Math.PI / 2 - Math.PI / 3, x = cx + rx * Math.cos(th), z = cz - rz * Math.sin(th);
      const hx = -rx * Math.sin(th), hz = -rz * Math.cos(th);
      bike.group.position.set(x, floor, z); bike.group.rotation.y = Math.atan2(hx, hz); bike.group.rotation.z = 0;
      const dist = (pre ? 0 : v) * (TAU * 0.55 * u / loop); bike.set(dist);
      const ding = pre ? 0 : bump(v, 0.3, 1.4);
      ride(p, bike, group, dist / bike.r, { R: 1, L: 1 });
      bike.group.localToWorld(W.set(...bike.bell)); group.worldToLocal(W);
      for (let i = 0; i < 3; i++) lines.set(i, W.x, W.y + 0.02 * u, W.z, ding > 0.2 ? 1 : 0, (i - 1) * 0.7);
      lines.commit();
      pop(ring, ding > 0.2 ? 1 : 0, x + 0.45 * u, floor + 1.1 * u, z + 0.1 * u);
    },
  };
}

export const SCENES = { 'q-bus-ride': busRide, 'q-bus-off': busOff, 'q-bike-bell': bikeBell };
