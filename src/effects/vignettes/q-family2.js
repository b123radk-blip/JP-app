// Model scenes, the family part 2 (Step 3a model pass).
//   q-watch    親: a parent stands on a tree stump beside the kanji and shades her eyes, watching her child play further
//              off; the child waves, she waves back (立 + 木 + 見)
//   q-buckets  両: a worker walks in with a bucket in each hand, stops and lifts both up to the sides, level, then sets off
//              again; outcome parents: a mum and a dad walk with their child between them and swing her up (両親)
//   q-family   家族: a dad, a child and a mum walk in one after another, stand in a row and wave, hearts; walk off
//   q-home     家庭: the front of a little house swings open: inside, a parent and a child sit at a low table, wave to
//              each other, a heart rises; the front closes
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, HEART, heart } from '../pieces/kit-things.js';
import { bucket } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, UP, lerp, hearts, person, KID, handInHand, turnTo } from './q-common.js';

const W = new THREE.Vector3(), WOOD = 0xb07a48;

// ---- 親 ----
function watch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.35 * u, step = 0.12 * u;
  const pa = person(spec.who, u), kid = person(spec.kid, u, KID);
  const stump = solidProp([[G.cyl(0.17 * u, 0.2 * u, step, 0, step / 2, 0, 0, 0, 0, 20), 0x8a5a30], [G.cyl(0.165 * u, 0.165 * u, 0.006 * u, 0, step, 0, 0, 0, 0, 20), 0xe0b878], [G.torus(0.1 * u, 0.006 * u, Math.PI * 2, 0, step + 0.004 * u, 0).rotateX(Math.PI / 2).translate(0, step + 0.004 * u, 0), 0xb08048]], 0.35);
  stump.position.set(sx, floor, 0.05 * u);
  group.add(stump, pa.group, kid.group);
  const loop = 8.0, play = [B.maxX + 1.15 * u, floor, -0.3 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.2, 1.4, 'out'], back: [6.4, 1.4, 'in'], up: [0.4, 0.5], down: [6.9, 0.5] });
      // she steps up onto the stump and watches, a hand over her eyes, her head following the child
      pa.pose('Idle', t);
      pa.group.position.set(sx, floor + step * T.up * (1 - T.down), 0.05 * u); pa.group.rotation.y = 0.5;
      const kx = lerp(sx + 0.3 * u, play[0], T.out * (1 - T.back)), kz = lerp(0.3 * u, play[2], T.out * (1 - T.back));
      const circle = !pre && v > 1.6 && v < 6.4, a = (v - 1.6) * 1.3;
      kid.group.position.set(kx + (circle ? 0.25 * u * Math.sin(a) : 0), floor, kz + (circle ? 0.15 * u * (Math.cos(a) - 1) : 0));
      const running = !pre && (circle || (T.out > 0 && T.out < 1) || (T.back > 0 && T.back < 1));
      const waving = !pre && v > 4.3 && v < 5.6;
      kid.pose(waving ? 'Idle' : running ? 'Run' : 'Idle', running ? v : t + 1);
      kid.group.rotation.y = waving ? LEFT + 0.6 : circle ? a + (Math.PI / 2) : T.back > 0 ? LEFT + 0.3 : RIGHT - 0.4;
      if (waving) { kid.group.position.x = kx; kid.group.position.z = kz; kid.wave('R', between(v, 4.3, 4.5) * (1 - between(v, 5.4, 5.6)), v); }
      const look = Math.atan2(kid.group.position.x - sx, kid.group.position.z - 0.05 * u) - 0.5;
      pa.shadeEyes('R', pre ? 0 : between(v, 0.9, 1.3) * (1 - between(v, 4.6, 4.8)), THREE.MathUtils.clamp(look, -1.2, 1.2));
      pa.wave('L', between(v, 4.6, 4.8) * (1 - between(v, 5.6, 5.8)), v + 0.2);
    },
  };
}

// ---- 両 / 両親 ----
function buckets(ctx, spec, stage) {
  if (spec.outcome === 'parents') return parents(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.65 * u;
  const p = person(spec.who, u), bl = bucket(0.7 * u, { color: 0x4a8ae0 }), br = bucket(0.7 * u, { color: 0x4a8ae0 });
  group.add(p.group, bl, br);
  const loop = 7.0, up = 0.7 * 0.24 * u;                        // the handle's top above the bucket's base
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { come: [0, 1.6, 'out'], lift: [2.0, 0.7], lower: [4.2, 0.7], go: [5.2, 1.6, 'in'] });
      const walk = !pre && ((T.come > 0 && T.come < 1) || T.go > 0);
      p.pose(walk ? 'Walk' : 'Idle', walk ? v : t);
      p.group.position.set(x0 + (pre ? 0 : (1 - T.come) * 0.9 * u - T.go * 0.0), floor, 0.05 * u - (pre ? 0 : T.go * 0.9 * u));
      p.group.rotation.y = pre ? 0 : T.go > 0 ? turnTo(0, Math.PI - 0.4, between(v, 5.0, 5.4)) : T.come < 1 ? LEFT + 0.7 : turnTo(LEFT + 0.7, 0, between(v, 1.5, 1.9));
      // both arms out to the sides and up, level; the buckets hang from the fists
      const k = T.lift * (1 - T.lower), wob = 0.02 * Math.sin(v * 6) * k;
      p.handTo('R', p.local(-0.42, 0.55 + wob, 0.12, W), k, { out: 1, down: 0.2 }); p.handTo('L', p.local(0.42, 0.55 - wob, 0.12, W), k, { out: 1, down: 0.2 });
      for (const [b, s] of [[bl, 'L'], [br, 'R']]) { b.position.copy(group.worldToLocal(p.fistMid(s, W))); b.position.y -= up; b.rotation.y = p.group.rotation.y; }
    },
  };
}
function parents(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.8 * u;
  const dad = person(spec.who, u), mum = person(spec.other, u, 0.86), kid = person(spec.kid, u, KID), love = many(HEART(u, 0.08), 3, 1);
  group.add(dad.group, mum.group, kid.group, love);
  const loop = 6.0, yaw = 0.15;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // they walk toward you on the spot (a slow drift), and on each swing the child flies up between them
      const swing = pre ? 0 : Math.max(0, bump(v, 1.2, 1.1), bump(v, 2.6, 1.1), bump(v, 4.0, 1.1)), walk = !pre;
      for (const [p, dx] of [[mum, -0.4], [dad, 0.4], [kid, 0]]) {
        p.pose(p === kid && swing > 0.3 ? 'Jump' : walk ? 'Walk' : 'Idle', p === kid && swing > 0.3 ? 0.45 : v + dx);
        p.group.position.set(x0 + dx * u, floor + (p === kid ? 0.32 * u * swing : 0), 0.1 * u * Math.sin(v * 0.5)); p.group.rotation.y = yaw;
      }
      // her hands in theirs: the child's hands go up to the grown-ups' hands as she flies
      handInHand(mum, 'L', kid, 'R', 1); handInHand(dad, 'R', kid, 'L', 1);
      hearts(love, 3, x0, floor + 1.0 * u, 0.2 * u, pre ? -1 : v, 2.0, u);
    },
  };
}

// ---- 家族 ----
function family(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.75 * u;
  const dad = person(spec.who, u), mum = person(spec.other, u, 0.86), kid = person(spec.kid, u, KID), love = many(HEART(u, 0.1), 3, 1);
  group.add(dad.group, mum.group, kid.group, love);
  const loop = 7.6, row = [[dad, 0.42, 0], [kid, 0, 0.4], [mum, -0.42, 0.8]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      for (const [p, dx, lag] of row) {
        // in from the right one after another, into the row; off to the right again at the end
        const out = pre ? 1 : between(v, lag * 0.6, 1.6 + lag * 0.6), back = pre ? 0 : between(v, 6.0 + (0.8 - lag) * 0.3, 7.4 + (0.8 - lag) * 0.3), f = out * (1 - back);
        const x = lerp(x0 + 1.4 * u, x0 + dx * u, f), z = lerp(-0.2 * u, 0.1 * u, f);
        const moving = !pre && ((out > 0 && out < 1) || (back > 0 && back < 1));
        p.pose(moving ? 'Walk' : 'Idle', moving ? v + lag : t + lag);
        p.group.position.set(x, floor, z);
        p.group.rotation.y = moving ? (back > 0 ? RIGHT - 0.4 : LEFT + 0.4) : 0;
        p.wave(p === mum ? 'L' : 'R', pre ? 0 : between(v, 2.6 + lag * 0.3, 2.9 + lag * 0.3) * (1 - between(v, 5.4, 5.7)), v + lag);
      }
      hearts(love, 3, x0, floor + 1.05 * u, 0.3 * u, pre ? -1 : v, 3.0, u);
    },
  };
}

// ---- 家庭 ----
function home(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.75 * u, Wd = 1.0 * u, H = 0.72 * u, D = 0.6 * u;
  const tri = new THREE.Shape(); tri.moveTo(-4.4, 0); tri.lineTo(4.4, 0); tri.lineTo(0, 2.6); tri.lineTo(-4.4, 0); const k = Wd / 8;
  const house = solidProp([[G.box(Wd, 0.03 * u, D, 0, 0.015 * u, 0), 0xc89a60], [G.box(Wd, H, 0.02 * u, 0, H / 2, -D / 2), 0xf6e8d0], [G.box(0.02 * u, H, D, -Wd / 2, H / 2, 0), 0xf0dcc0], [G.box(0.02 * u, H, D, Wd / 2, H / 2, 0), 0xf0dcc0],
    [G.extrude(tri, 4.6).scale(k, k, k * D / Wd * 1.8).translate(0, H, 0), 0xd04030], [G.box(0.4 * u, 0.05 * u, 0.24 * u, 0, 0.14 * u, 0.02 * u), WOOD], [G.box(0.05 * u, 0.12 * u, 0.05 * u, 0, 0.06 * u, 0.02 * u), 0x8a5a30],
    [G.box(0.12 * u, 0.07 * u, 0.12 * u, -0.3 * u, 0.035 * u, 0.02 * u), 0x8a5a30], [G.box(0.12 * u, 0.07 * u, 0.12 * u, 0.3 * u, 0.035 * u, 0.02 * u), 0x8a5a30],
    [G.cyl(0.05 * u, 0.04 * u, 0.04 * u, -0.08 * u, 0.185 * u, 0.02 * u), 0xf4f4f8], [G.cyl(0.05 * u, 0.04 * u, 0.04 * u, 0.08 * u, 0.185 * u, 0.02 * u), 0xc03030], [G.box(0.24 * u, 0.16 * u, 0.01 * u, 0, 0.45 * u, -D / 2 + 0.02 * u), 0xffd070]], 0.35);
  const front = new THREE.Group(), frontM = solidProp([[G.box(Wd, H, 0.02 * u, -Wd / 2, H / 2, 0), 0xffe8c8], [G.box(0.16 * u, 0.32 * u, 0.006 * u, -Wd * 0.7, 0.16 * u, 0.012 * u), 0x8a5a30], [G.box(0.22 * u, 0.16 * u, 0.006 * u, -Wd * 0.3, 0.45 * u, 0.012 * u), 0x8ad0ff]], 0.35);
  front.add(frontM); front.position.set(hx + Wd / 2, floor, D / 2 - 0.01 * u); house.position.set(hx, floor, 0);   // the front is hinged on the right, away from the kanji
  const pa = person(spec.who, u, 0.62), kid = person(spec.kid, u, 0.42), hrt = heart(u, { s: 0.2 });
  group.add(house, front, pa.group, kid.group, hrt);
  const loop = 6.0;                                              // stools 0.07 high: about 0.13 of a sitter's height
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.3, 0.7, 'out'], close: [5.2, 0.6, 'in'] }), o = pre ? 0 : T.open - T.close;
      front.rotation.y = 1.9 * o;
      // both sit on stools either side of the low table, turned to each other and a little to you
      pa.pose('SitDown', 1.0, false); kid.pose('SitDown', 1.0, false);
      pa.group.position.set(hx - 0.3 * u, floor - 0.01 * u, 0.06 * u); pa.group.rotation.y = RIGHT - 0.6;
      kid.group.position.set(hx + 0.3 * u, floor + 0.015 * u, 0.06 * u); kid.group.rotation.y = LEFT + 0.6;
      pa.wave('R', between(v, 1.2, 1.5) * (1 - between(v, 2.4, 2.7)), v); kid.wave('L', between(v, 1.6, 1.9) * (1 - between(v, 2.8, 3.1)), v + 0.3);
      pa.nod(between(v, 3.0, 3.2) * (1 - between(v, 4.0, 4.2)), v); kid.nod(between(v, 3.2, 3.4) * (1 - between(v, 4.2, 4.4)), v + 0.4);
      const h = pre ? 0 : bump(v, 1.6, 3.4); hrt.visible = h > 0; hrt.scale.setScalar(grow(Math.min(1, h * 1.5)));
      hrt.position.set(hx, floor + H + 0.3 * u + 0.25 * u * between(v, 1.6, 5.0), 0.15 * u); hrt.rotation.y = 0.4 * Math.sin(t * 2);
    },
  };
}

export const SCENES = { 'q-watch': watch, 'q-buckets': buckets, 'q-family': family, 'q-home': home };
