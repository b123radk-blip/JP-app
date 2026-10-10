// Model scenes, things in hand (Step 3a model pass, batch 4).
//   q-shop-basket 買い物: along a shop shelf an apple, a milk carton and a loaf hop into her basket; she lifts it: いっぱい!
//   q-luggage-pile 荷物: a man staggers in under a pile of bags, the top one teeters (おっとっと), and staggers off
//   q-hug-treasure 大切: a chest opens on a glowing gem; he lifts it out and hugs it, swaying, hearts; lays it back
//   q-hand-over 渡す: a worker holds out a parcel; a woman takes it and bows: ありがとう
//   q-rope-pull 引: a worker hauls the kanji in on a rope in three heaves (よいしょ!); drawer: he pulls a drawer of toys out (引く)
//   q-boomerang-throw 返: a thrown boomerang loops out and back to his hand: おかえり!; book: a child hands a book back over
//                   a library counter, the librarian takes it (ありがとう), the child bows (返す)
//   q-photo-snap 写: peace sign at a camera on a tripod; flash; a photo slides out and develops into her picture; wall: a
//                   camera at her eye, flash by flash three photos fly up and pin themselves to a cork board (写真)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, HEART, burst } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, poseGlyph, puffs, beam } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, hearts, person, KID, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();
const ws = (g) => g.getWorldScale(W3).y;
// both hands on the sides of a thing of half-width r at world point P (palms inward)
const both = (a, P, r, k, o = { out: 0.8, down: 0.5 }) => { a.grip('R', P, axisOf(a, 1, 0, 0, new THREE.Vector3()), r, k, o); a.grip('L', P, axisOf(a, -1, 0, 0, new THREE.Vector3()), r, k, o); };
const parcelProp = (u, S = 0.17) => solidProp([[G.box(S * 1.2 * u, S * u, S * u, 0, 0, 0), 0xc89a60], [G.box(S * 1.22 * u, 0.02 * u, S * 1.02 * u, 0, 0, 0), 0xe8d8b0], [G.box(0.02 * u, S * 1.02 * u, S * 1.02 * u, 0, 0, 0), 0xe8d8b0]], 0.4);

// ---- 買い物 ----
function shopBasket(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, x1 = B.maxX + 1.35 * u, sz = -0.3 * u;
  const COL = [0xe04848, 0x40a0e0, 0xf0c030, 0x60c060, 0xd070d0, 0xf08030];
  const shelf = solidProp([[G.box(1.1 * u, 0.035 * u, 0.24 * u, 0, 0.5 * u, 0), 0x8a6a4a], [G.box(1.1 * u, 0.035 * u, 0.24 * u, 0, 0.85 * u, 0), 0x8a6a4a], [G.box(0.035 * u, 0.9 * u, 0.24 * u, -0.55 * u, 0.45 * u, 0), 0x6a4a2a], [G.box(0.035 * u, 0.9 * u, 0.24 * u, 0.55 * u, 0.45 * u, 0), 0x6a4a2a], [G.box(1.1 * u, 0.9 * u, 0.02 * u, 0, 0.45 * u, -0.12 * u), 0x5a4030],
    ...COL.map((c, i) => [G.box(0.1 * u, 0.14 * u, 0.09 * u, (-0.45 + i * 0.18) * u, 0.94 * u, 0), c])], 0.35);
  shelf.position.set((x0 + x1) / 2, floor, sz);
  const goods = [solidProp([[G.sphere(0.055 * u), 0xe02830], [G.sphere(0.018 * u, 0.012 * u, 0.06 * u, 0, 1.4, 0.4, 0.7), 0x40a040]], 0.5), solidProp([[G.box(0.08 * u, 0.13 * u, 0.08 * u, 0, 0, 0), 0xf8f8f8], [G.box(0.082 * u, 0.05 * u, 0.082 * u, 0, -0.02 * u, 0), 0x3a7ae0]], 0.5), solidProp([[G.capsule(0.04 * u, 0.1 * u, 0, 0, 0, Math.PI / 2), 0xd09050]], 0.5)];
  const FROM = [0.35, 0.05, -0.3], HOP = [0.9, 1.8, 2.7], IN = [[-0.04, 0.01], [0.03, 0.04], [0.0, 0.07]];
  const basket = solidProp([[G.box(0.24 * u, 0.12 * u, 0.15 * u, 0, -0.1 * u, 0), 0xc89040], [G.box(0.25 * u, 0.02 * u, 0.16 * u, 0, -0.04 * u, 0), 0xa87030], [G.torus(0.1 * u, 0.01 * u, Math.PI, 0, -0.04 * u, 0), 0x8a5a30]], 0.4);
  const p = person(spec.who, u), full = label(u, 'いっぱい!', '#e0802a', 0.13);
  group.add(shelf, ...goods, basket, p.group, full);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 3.4, 'linear'], face: [3.4, 0.3], lift: [3.8, 0.4], down: [5.0, 0.4], gone: [5.6, 0.4], back: [6.1, 0.5, 'back'] });
      const walking = !pre && T.walk > 0 && T.walk < 1;
      p.pose(walking ? 'Walk' : 'Idle', walking ? v * 0.8 : t);
      p.group.position.set(T.back > 0 ? x1 : lerp(x1, x0 + 0.1 * u, T.walk), floor, 0.15 * u); p.group.rotation.y = T.back > 0 ? LEFT + 0.35 : turnTo(LEFT + 0.35, 0.1, T.face);
      p.group.scale.setScalar(grow(T.back > 0 ? T.back : 1 - T.gone));
      // the basket in her left hand (the near one as she walks left); lifted up proudly at the end
      const lift = T.lift * (1 - T.down);
      p.grip('L', p.local(0.2, 0.36 + 0.25 * lift, 0.12 + 0.12 * lift, W), W2.set(0, 1, 0), 0, pre ? 1 : Math.max(0.5, lift), { out: 0.9, down: 0.5 });
      p.hold(basket, 'L', group, 0.004 * u); basket.rotation.set(0, p.group.rotation.y, 0); basket.scale.setScalar(p.group.scale.x);
      goods.forEach((g, i) => {
        const f = pre || T.back > 0 ? 0 : between(v, HOP[i], HOP[i] + 0.55), to = [basket.position.x + IN[i][0] * u, basket.position.y - 0.06 * u + IN[i][1] * u];
        const [gx, gy] = arc([shelf.position.x + FROM[i] * u, floor + 0.6 * u], to, 0.3 * u, f);
        g.position.set(f >= 1 ? to[0] : gx, f >= 1 ? to[1] : gy, f > 0 ? lerp(sz, basket.position.z, f) : sz); g.rotation.z = f < 1 ? f * 6 : 0;
        g.scale.setScalar(grow(f >= 1 ? p.group.scale.x : T.back > 0 ? T.back : 1));
      });
      pop(full, lift, p.group.position.x, floor + 1.05 * u, 0.2 * u);
    },
  };
}

// ---- 荷物 ----
function luggage(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.7 * u, xs = px + 0.75 * u;
  const p = person(spec.who, u), oops = label(u, 'おっとっと', '#e0702a', 0.12);
  const pile = solidProp([[G.box(0.34 * u, 0.2 * u, 0.2 * u, 0, 0.1 * u, 0), 0xd06030], [G.box(0.1 * u, 0.03 * u, 0.04 * u, 0, 0.215 * u, 0), 0x3a2a20], [G.box(0.3 * u, 0.16 * u, 0.18 * u, 0.02 * u, 0.28 * u, 0), 0x3a7ad0], [G.box(0.26 * u, 0.15 * u, 0.16 * u, -0.03 * u, 0.435 * u, 0), 0x6ab040], [G.box(0.27 * u, 0.02 * u, 0.17 * u, -0.03 * u, 0.44 * u, 0), 0x3a6a20]], 0.4);
  const top = solidProp([[G.box(0.22 * u, 0.13 * u, 0.14 * u, 0, 0.065 * u, 0), 0xf0c020], [G.box(0.225 * u, 0.025 * u, 0.145 * u, 0, 0.1 * u, 0), 0xc03a3a], [G.torus(0.05 * u, 0.012 * u, Math.PI, 0, 0.13 * u, 0), 0x6a4a20]], 0.5);
  group.add(p.group, pile, top, oops);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 2.2, 'out'], go: [4.2, 0.3], out: [4.4, 1.6, 'in'], home: [6.0, 0.4] });
      const moving = !pre && ((T.walk > 0 && T.walk < 0.97) || (T.out > 0 && T.out < 1)), teeter = pre ? 0 : bump(v, 2.3, 1.8);
      p.pose('Walk_Carry', pre ? 0.2 : moving ? v * 0.8 : 0.2 + 0.25 * Math.sin(v * 2.5), true);
      p.group.position.set(pre ? xs : lerp(lerp(xs, px, T.walk), xs, T.out), floor, 0.1 * u);
      p.group.rotation.y = pre ? LEFT + 0.5 : turnTo(turnTo(lerp(LEFT + 0.5, LEFT + 0.95, between(v, 1.6, 2.3)), RIGHT - 0.5, T.go), LEFT + 0.5, T.home);
      // he staggers: the body rocks; the pile sways with him and the top bag tips far out and back
      const sway = 0.1 * Math.sin((pre ? t : v) * 4) * (moving ? 1 : 0.4) + 0.25 * teeter * Math.sin(v * 5);
      p.turn('Abdomen', 0, 0, sway * 0.6); p.turn('Head', -0.2, 0, -sway * 0.5);
      const hands = p.fistMid('R', new THREE.Vector3()).add(p.fistMid('L', W)).multiplyScalar(0.5);
      group.worldToLocal(hands);
      pile.position.set(hands.x, hands.y - 0.03 * u, hands.z); pile.rotation.set(0, p.group.rotation.y, sway); pile.scale.setScalar(0.85);
      const tip = sway * 2.6 + 0.12 * Math.sin((pre ? t : v) * 7);
      top.position.set(hands.x - Math.sin(sway) * 0.45 * u - 0.12 * u * Math.sin(tip), hands.y + 0.4 * u, hands.z + 0.02 * u); top.rotation.set(0, p.group.rotation.y, tip);
      pop(oops, teeter > 0.3 ? 1 : 0, px + 0.35 * u, floor + 1.02 * u, 0.2 * u);
    },
  };
}

// ---- 大切 ----
function treasure(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.4 * u, px = cx + 0.42 * u;
  const chest = solidProp([[G.box(0.38 * u, 0.22 * u, 0.24 * u, 0, 0.11 * u, 0), 0x8a4a20], [G.box(0.4 * u, 0.03 * u, 0.25 * u, 0, 0.19 * u, 0), 0xf0c040], [G.box(0.05 * u, 0.07 * u, 0.02 * u, 0, 0.17 * u, 0.125 * u), 0xf0c040]], 0.4);
  const lidPivot = new THREE.Group(), lid = solidProp([[G.cyl(0.12 * u, 0.12 * u, 0.38 * u, 0, 0, 0.12 * u, 0, 0, Math.PI / 2), 0x9a5a28]], 0.4);
  lid.scale.set(1, 0.6, 1); lidPivot.position.set(cx, floor + 0.22 * u, -0.12 * u); lidPivot.add(lid); chest.position.set(cx, floor, 0);
  const gem = emblemProp('gem', 0.3 * u), shine = burst(u, { s: 0.3, n: 8, color: 0xc8f4ff }), hs = many(HEART(u, 0.12), 3, 1), p = person(spec.who, u);
  group.add(chest, lidPivot, gem, shine, hs, p.group);
  const loop = 6.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.5, 'back'], rise: [0.7, 0.6, 'out'], reach: [1.4, 0.4], take: [1.8, 0.6], hug: [2.4, 0.4], unhug: [4.6, 0.4], put: [5.0, 0.6], shut: [5.9, 0.4] });
      lidPivot.rotation.x = -1.7 * (pre ? 0 : T.open * (1 - T.shut));
      p.pose('Idle', t); p.group.position.set(px, floor, 0.12 * u);
      p.group.rotation.y = turnTo(LEFT + 0.6, -0.1, T.take * (1 - T.put)) + 0.2 * Math.sin((v - 2.8) * 3) * T.hug * (1 - T.unhug);
      // the gem rises out of the chest; he takes it in both hands, hugs it to his chest and sways with it; then lays it back
      const inChest = W.set(cx, floor + 0.28 * u + 0.12 * u * T.rise, 0.02 * u), chestPt = group.worldToLocal(p.at('chest', W2, 0, -0.04, -0.05));
      const held = T.take * (1 - T.put), hug = T.hug * (1 - T.unhug), gp = inChest.clone().lerp(chestPt, held);
      gem.visible = !pre && T.open > 0.3 && T.shut < 0.5; gem.position.copy(gp); gem.rotation.y = held > 0 ? p.group.rotation.y : v; gem.idle(hug > 0 ? 0 : v);
      gem.scale.setScalar(0.3 * u * (1 - 0.1 * hug));
      const r = 0.1 * u * ws(group);
      if (!pre) both(p, group.localToWorld(gp.clone()), r, Math.max(T.reach * (1 - T.shut), 0) * (1 - 0.3 * hug), { out: 0.7, down: 0.6 });
      p.turn('Head', 0.25 * hug, 0, 0.15 * hug * Math.sin((v - 2.8) * 3));
      pop(shine, pre ? 0 : bump(v, 0.7, 1.2), cx, floor + 0.5 * u, -0.05 * u); shine.rotation.z = v;
      hearts(hs, 3, px, floor + 0.95 * u, 0.2 * u, pre || hug < 0.5 ? -1 : ((v - 2.7) % 1.5) + 2.7, 2.7, u);
    },
  };
}

// ---- 渡す ----
function handOver(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.35 * u, bx = ax + 0.62 * u;
  const a = person(spec.who, u), b = person(spec.other, u), box = parcelProp(u), thx = label(u, 'ありがとう', '#e0607a', 0.12);
  group.add(a.group, b.group, box, thx);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { reach: [0.3, 0.5], pass: [1.0, 0.8], let: [1.8, 0.4], bow: [2.3, 0.5], up: [3.2, 0.5], away: [4.8, 0.4], fresh: [5.6, 0.5, 'back'] });
      a.pose('Idle', t); b.pose('Idle', t + 1.3);
      a.group.position.set(ax, floor, 0.12 * u); a.group.rotation.y = RIGHT - 0.55; b.group.position.set(bx, floor, 0.12 * u); b.group.rotation.y = LEFT + 0.55;
      // the parcel: held out in his hands, carried across to hers; she bows holding it; it goes, a new one in his hands
      const pa = a.local(0, 0.42, 0.3, new THREE.Vector3()), pb = b.local(0, 0.42, 0.3, new THREE.Vector3()), P = pa.clone().lerp(pb, T.pass);
      P.y += 0.06 * u * ws(group) * Math.sin(Math.PI * T.pass);
      const r = 0.1 * u * ws(group), mine = pre ? 1 : T.fresh > 0 ? T.fresh : 1 - T.let, hers = pre ? 0 : T.reach * (1 - T.away);
      a.bow(0.25 * bump(v, 0.9, 1.0));
      b.bow(0.6 * T.bow * (1 - T.up));
      const at = T.fresh > 0 ? pa : P;
      both(a, at, r, Math.min(mine, 1), { out: 0.8, down: 0.5 }); both(b, at, r, hers, { out: 0.8, down: 0.5 });
      box.position.copy(group.worldToLocal(at.clone())); box.rotation.set(0, T.fresh > 0 ? a.group.rotation.y : lerp(a.group.rotation.y, b.group.rotation.y, T.pass), 0);
      box.scale.setScalar(grow(T.fresh > 0 ? T.fresh : 1 - T.away)); box.visible = !(T.away >= 1 && T.fresh <= 0);
      pop(thx, pre ? 0 : between(v, 2.3, 2.6) * (1 - between(v, 4.2, 4.5)), bx + 0.05 * u, floor + 1.0 * u, 0.2 * u);
    },
  };
}

// ---- 引 / 引く ----
function ropePull(ctx, spec, stage) {
  if (spec.outcome === 'drawer') return drawer(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.7 * u;
  const p = person(spec.who, u), rope = solidProp([[G.cyl(0.014 * u, 0.014 * u, 1, 0, 0.5, 0), 0xd8b070]], 0.4), dust = many(PUFF(u), 6, 0.5), heave = label(u, 'よいしょ!', '#c0702a', 0.12);
  group.add(p.group, rope, dust, heave);
  const loop = 6.0, H = [0.6, 1.4, 2.2];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { grab: [0, 0.4], h0: [H[0], 0.45, 'out'], h1: [H[1], 0.45, 'out'], h2: [H[2], 0.45, 'out'], back: [4.0, 1.5] });
      // three heaves: each one drags the kanji toward him and he steps back; then it slides home and he walks after it
      const pulled = pre ? 0 : (T.h0 + T.h1 + T.h2) / 3 * (1 - T.back), dx = 0.36 * u * pulled, hv = pre ? 0 : Math.max(...H.map((h) => bump(v, h - 0.1, 0.6)));
      poseGlyph(stage, dx, 0);
      const walking = !pre && T.back > 0.05 && T.back < 0.95;
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t); p.group.position.set(x0 + dx, floor, 0.06 * u); p.group.rotation.y = LEFT + 0.55;
      p.turn('Abdomen', -(pre ? 0.15 : 0.3 * T.grab + 0.25 * hv) * (1 - 0.6 * (walking ? 1 : 0)));
      const tie = new THREE.Vector3(B.maxX + dx - 0.04 * u, B.cy - 0.05 * u, 0.05 * u), hand = p.local(0, 0.42, 0.28, new THREE.Vector3()), dir = group.localToWorld(tie.clone()).sub(hand).normalize();
      p.handTo('R', hand, 1, { out: 0.5, down: 0.9 }); p.handTo('L', hand.clone().addScaledVector(dir, 0.1 * u * ws(group)), 1, { out: 0.5, down: 0.9 });
      beam(rope, tie, group.worldToLocal(hand.addScaledVector(dir, -0.06 * u * ws(group))));
      const f = pre ? 0 : Math.max(...H.map((h) => (v - h) / 0.7 > 0 && (v - h) / 0.7 < 1 ? (v - h) / 0.7 : 0));
      puffs(dust, 0, 6, B.minX + dx, floor, f, u, 0.3); dust.commit();
      pop(heave, hv > 0.3 ? 1 : 0, x0 + dx, floor + 1.02 * u, 0.15 * u);
    },
  };
}
function drawer(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, cz = -0.2 * u, dy = 0.5 * u;
  const chest = solidProp([[G.box(0.55 * u, 0.66 * u, 0.36 * u, 0, 0.33 * u, 0), 0xb07040], ...[0.3, 0.12].map((y) => [G.box(0.48 * u, 0.15 * u, 0.02 * u, 0, y * u, 0.18 * u), 0x9a5a30]), ...[0.3, 0.12].map((y) => [G.sphere(0.025 * u, 0, y * u, 0.2 * u), 0xf0d060])], 0.35);
  chest.position.set(cx, floor, cz);
  const box = solidProp([[G.box(0.48 * u, 0.15 * u, 0.02 * u, 0, 0, 0.17 * u), 0xc88050], [G.box(0.46 * u, 0.12 * u, 0.32 * u, 0, -0.01 * u, 0), 0xd89060], [G.sphere(0.03 * u, 0, 0, 0.2 * u), 0xf0d060],
    [G.sphere(0.08 * u, -0.12 * u, 0.1 * u, 0.04 * u), 0xa86a3a], [G.sphere(0.03 * u, -0.18 * u, 0.17 * u, 0.04 * u), 0xa86a3a], [G.sphere(0.03 * u, -0.06 * u, 0.17 * u, 0.04 * u), 0xa86a3a], [G.sphere(0.012 * u, -0.145 * u, 0.115 * u, 0.115 * u), 0x1a1010], [G.sphere(0.012 * u, -0.095 * u, 0.115 * u, 0.115 * u), 0x1a1010], [G.sphere(0.06 * u, 0.05 * u, 0.08 * u, 0.06 * u), 0xe04040], [G.capsule(0.03 * u, 0.1 * u, 0.15 * u, 0.09 * u, 0.0, 1.2), 0x40a0e0]], 0.45);
  const p = person(spec.who, u), heave = label(u, 'よいしょ!', '#c0702a', 0.12);
  group.add(chest, box, p.group, heave);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { tug: [0.5, 0.9, 'out'], push: [4.0, 0.8] }), out = pre ? 0 : T.tug * (1 - T.push), lean = pre ? 0 : bump(v, 0.4, 1.1);
      box.position.set(cx, floor + dy, cz + 0.32 * u * out);
      p.pose('Idle', t); p.group.position.set(cx + 0.44 * u + 0.05 * u * out, floor, 0.34 * u); p.group.rotation.y = LEFT + 0.75;
      p.turn('Abdomen', -0.3 * lean); p.turn('Head', 0.2 * out * (1 - lean));
      // his right hand on the knob all the way out and back in
      const knob = group.localToWorld(W.set(cx + 0.03 * u, floor + dy - 0.02 * u, cz + 0.32 * u * out + 0.22 * u)).clone();
      p.grip('R', knob, axisOf(p, 0, 0, 1, W2), 0.02 * u * ws(group), pre ? A.setup : 1, { out: 0.6, down: 0.7 });
      pop(heave, lean > 0.3 ? 1 : 0, cx + 0.45 * u, floor + 0.98 * u, 0.3 * u);
    },
  };
}

// ---- 返 / 返す ----
function boomerang(ctx, spec, stage) {
  if (spec.outcome === 'book') return bookBack(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const p = person(spec.who, u), boom = emblemProp('boomerang', 0.3 * u, { color: 0xe07a30 }), trail = many([[G.sphere(0.014 * u), 0xffffff]], 10, 0.8), back = label(u, 'おかえり!', '#e0802a', 0.12);
  group.add(p.group, boom, trail, back);
  const loop = 5.0, F = [0.85, 2.6];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { wind: [0.2, 0.4], throw: [0.6, 0.25, 'in'], fly: [F[0], F[1], 'smooth'] });
      p.pose('Idle', t); p.group.position.set(px, floor, 0.1 * u); p.group.rotation.y = 0.45;
      // wind up behind his shoulder, fling forward; the arm drops while it flies and comes up to catch it
      const C = group.worldToLocal(p.local(-0.26, 0.5, 0.22, new THREE.Vector3())), S = group.worldToLocal(p.local(-0.16, 0.62, 0.4, new THREE.Vector3()));
      const tgt = p.local(-0.26, 0.5, 0.22, W).lerp(p.local(-0.24, 0.8, -0.12, W2), T.wind * (1 - T.throw)).lerp(p.local(-0.16, 0.62, 0.4, W2), T.throw * (1 - between(v, 1.0, 1.3)));
      const arm = pre ? 1 : 1 - between(v, 1.0, 1.4) + between(v, 3.0, 3.4);
      p.handTo('R', tgt, arm, { out: 0.7, down: 0.6 });
      const flying = !pre && T.fly > 0 && T.fly < 1, at = (s) => { const a = s * Math.PI * 2; return S.clone().lerp(C, s).add(W3.set(0.42 * u * (1 - Math.cos(a)), 0.3 * u * Math.sin(Math.PI * s), -0.2 * u * Math.sin(a))); };
      if (flying) { boom.position.copy(at(T.fly)); boom.rotation.set(0.3, 0, -v * 14); }
      else { p.hold(boom, 'R', group, 0.03 * u); boom.rotation.set(0, p.group.rotation.y, 0.6); }
      boom.idle(0);
      for (let i = 0; i < 10; i++) { const s = T.fly - 0.022 * (i + 1), q = at(Math.max(0, s)); trail.set(i, q.x, q.y, q.z, flying && s > 0 ? 1 - i / 10 : 0); }
      trail.commit();
      pop(back, pre ? 0 : between(v, F[0] + F[1], F[0] + F[1] + 0.3) * (1 - between(v, 4.6, 4.9)), px, floor + 1.02 * u, 0.15 * u);
    },
  };
}
function bookBack(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.95 * u, CH = 0.42 * u, kx = cx - 0.45 * u;
  const desk = solidProp([[G.box(0.42 * u, CH, 0.3 * u, 0, CH / 2, 0), 0x8a5a30], [G.box(0.46 * u, 0.03 * u, 0.34 * u, 0, CH, 0), 0xa87040],
    ...[0x3a6ad8, 0xe04848, 0x60c060].map((c, i) => [G.box(0.17 * u, 0.04 * u, 0.12 * u, 0.12 * u, CH + 0.035 * u + 0.042 * u * i, 0), c])], 0.35);
  desk.position.set(cx, floor, -0.05 * u);
  const book = solidProp([[G.box(0.16 * u, 0.2 * u, 0.04 * u, 0, 0, 0), 0xf0c030], [G.box(0.15 * u, 0.19 * u, 0.042 * u, 0.006 * u, 0, 0), 0xffffff], [G.box(0.17 * u, 0.21 * u, 0.012 * u, 0, 0, 0.018 * u), 0xf0c030]], 0.45);
  const kid = person(spec.who, u, KID + 0.12), lib = person(spec.other, u), thx = label(u, 'ありがとう', '#e0607a', 0.12);
  group.add(desk, book, kid.group, lib.group, thx);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { give: [0.4, 0.7], take: [1.1, 0.6], bow: [2.0, 0.5], up: [2.9, 0.5], shelf: [3.4, 0.6], fresh: [5.6, 0.6, 'back'] });
      kid.pose('Idle', t); kid.group.position.set(kx, floor, 0.12 * u); kid.group.rotation.y = RIGHT - 0.6;
      lib.pose('Idle', t + 2); lib.group.position.set(cx + 0.05 * u, floor, -0.38 * u); lib.group.rotation.y = -0.45;
      // the child holds the book out over the counter; the librarian takes it, thanks him and lays it on the pile
      const k0 = group.localToWorld(W.set(kx + 0.1 * u, floor + 0.38 * u, 0.25 * u)).clone(), over = group.localToWorld(W.set(cx - 0.12 * u, floor + CH + 0.16 * u, 0.0)).clone();
      const pile = group.localToWorld(W.set(cx + 0.12 * u, floor + CH + 0.19 * u, -0.05 * u)).clone(), L = lib.local(0, 0.45, 0.3, new THREE.Vector3());
      const P = T.fresh > 0 || pre ? k0 : k0.clone().lerp(over, T.give).lerp(L, T.take).lerp(pile, T.shelf);
      const r = 0.085 * u * ws(group), kh = pre ? 1 : (1 - T.take) + T.fresh, lh = pre ? 0 : between(v, 0.9, 1.2) * (1 - T.shelf);
      both(kid, P, r, Math.min(1, kh)); both(lib, P, r, lh);
      kid.bow(0.7 * T.bow * (1 - T.up));
      book.position.copy(group.worldToLocal(P.clone())); book.rotation.set(T.shelf * -Math.PI / 2, kid.group.rotation.y * (1 - T.take) + lib.group.rotation.y * T.take, 0, 'YXZ');
      book.scale.setScalar(grow(T.fresh > 0 ? T.fresh : 1 - (v > 5.2 ? between(v, 5.2, 5.5) : 0))); book.visible = pre || v < 5.5 || T.fresh > 0;
      pop(thx, pre ? 0 : between(v, 1.8, 2.1) * (1 - between(v, 3.4, 3.7)), cx, floor + 1.05 * u, 0.0);
    },
  };
}

// ---- 写 / 写真 ----
function photoSnap(ctx, spec, stage) {
  const wall = spec.outcome === 'wall', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u, cx = px + 0.75 * u, cy = floor + 0.5 * u;
  const p = person(spec.who, u), flash = burst(u, { s: 0.45, n: 10, color: 0xffffff });
  const camGeo = (k) => [[G.box(0.24 * k * u, 0.15 * k * u, 0.1 * k * u, 0, 0, 0), 0x2a2a30], [G.cyl(0.05 * k * u, 0.05 * k * u, 0.06 * k * u, 0, 0, 0.07 * k * u, Math.PI / 2), 0x14141c], [G.cyl(0.036 * k * u, 0.036 * k * u, 0.062 * k * u, 0, 0, 0.072 * k * u, Math.PI / 2), 0x3a6ad8], [G.box(0.05 * k * u, 0.03 * k * u, 0.01 * k * u, 0.08 * k * u, 0.05 * k * u, 0.052 * k * u), 0xffffff]];
  const pic = (sky, extra) => solidProp([[G.box(0.2 * u, 0.24 * u, 0.006 * u, 0, 0, 0), 0xffffff], [G.box(0.17 * u, 0.15 * u, 0.007 * u, 0, 0.025 * u, 0.001 * u), sky], ...extra, [G.sphere(0.014 * u, 0, 0.1 * u, 0.01 * u), 0xe02020]], 0.55);
  group.add(p.group, flash);
  if (wall) {
    const board = solidProp([[G.box(0.66 * u, 0.48 * u, 0.03 * u, 0, 0, 0), 0xc89a60], [G.box(0.7 * u, 0.52 * u, 0.025 * u, 0, 0, -0.006 * u), 0x8a5a30]], 0.35), bx = px + 0.85 * u, by = floor + 0.8 * u;
    board.position.set(bx, by, -0.2 * u);
    const photos = [pic(0x8ad0ff, [[G.sphere(0.03 * u, 0.04 * u, 0.06 * u, 0.006 * u), 0xffd040], [G.box(0.17 * u, 0.04 * u, 0.008 * u, 0, -0.03 * u, 0.002 * u), 0x60b050]]), pic(0xffb070, [[G.cone(0.05 * u, 0.07 * u, 0, 0.02 * u, 0.006 * u), 0x5a6a9a]]), pic(0xf0e0ff, [[G.sphere(0.025 * u, -0.03 * u, 0.04 * u, 0.006 * u), 0xffd2b0], [G.sphere(0.022 * u, 0.03 * u, 0.035 * u, 0.006 * u), 0xffd2b0]])];
    const cam = solidProp(camGeo(0.8), 0.45), SPOT = [[-0.2, 0.06, 0.12], [0.02, -0.04, -0.08], [0.22, 0.07, 0.1]];
    group.add(board, cam, ...photos);
    const loop = 5.2;
    return {
      group,
      step(t) {
        const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, out = between(v, 4.6, 5.0);
        p.pose('Idle', t); p.group.position.set(px, floor, 0.12 * u); p.group.rotation.y = 0.75;
        // the camera at her eye in both hands; each flash sends a photo flying up onto the board, where it pins itself
        const C = p.at('eyes', new THREE.Vector3(), 0, -0.02, 0.12);
        p.handTo('R', p.at('eyes', W, -0.1, -0.05, 0.1), pre ? A.setup : 1, { out: 0.8, down: 0.6 }); p.handTo('L', p.at('eyes', W, 0.1, -0.05, 0.1), pre ? A.setup : 1, { out: 0.8, down: 0.6 });
        cam.position.copy(group.worldToLocal(C)); cam.rotation.set(0, p.group.rotation.y, 0);
        photos.forEach((ph, i) => {
          const f = pre ? 0 : timeline(v, { f: [0.5 + 1.0 * i, 0.6, 'out'] }).f * (1 - out), [sx, sy, r] = SPOT[i], [x, y] = arc([cam.position.x, cam.position.y], [bx + sx * u, by + sy * u], 0.25 * u, f);
          ph.visible = f > 0.01; ph.position.set(x, y, lerp(cam.position.z, -0.17 * u, f)); ph.rotation.set(0, (1 - f) * 0.8, r + (1 - f) * 2); ph.scale.setScalar(grow(0.4 + 0.6 * f));
        });
        const fl = pre ? 0 : Math.max(...[0, 1, 2].map((i) => bump(v, 0.3 + 1.0 * i, 0.3))); pop(flash, fl, cam.position.x + 0.1 * u, cam.position.y, cam.position.z + 0.1 * u); flash.rotation.z = v * 2;
      },
    };
  }
  const cam = solidProp([...camGeo(1), [G.cyl(0.008 * u, 0.008 * u, 0.5 * u, -0.06 * u, -0.27 * u, 0, 0, 0, 0.2), 0x3a3a44], [G.cyl(0.008 * u, 0.008 * u, 0.5 * u, 0.06 * u, -0.27 * u, 0, 0, 0, -0.2), 0x3a3a44], [G.cyl(0.008 * u, 0.008 * u, 0.5 * u, 0, -0.27 * u, -0.06 * u, 0.2, 0, 0), 0x3a3a44]], 0.4);
  cam.position.set(cx, cy, 0); cam.rotation.y = LEFT + 0.7;
  const photo = pic(0xffffff, []), inner = solidProp([[G.box(0.17 * u, 0.15 * u, 0.004 * u, 0, 0.025 * u, 0.006 * u), 0xffffff]], 0.6), mini = solidProp([[G.cyl(0.022 * u, 0.03 * u, 0.06 * u, 0, -0.01 * u, 0.008 * u), 0xe07ab0], [G.sphere(0.022 * u, 0, 0.04 * u, 0.008 * u), 0xffd2b0], [G.box(0.01 * u, 0.04 * u, 0.004 * u, 0.03 * u, 0.05 * u, 0.008 * u, -0.3), 0xffd2b0], [G.box(0.01 * u, 0.04 * u, 0.004 * u, 0.045 * u, 0.05 * u, 0.008 * u, 0.3), 0xffd2b0]], 0.6);
  const vee = solidProp([[G.capsule(0.012 * u, 0.06 * u, -0.015 * u, 0.04 * u, 0, 0.3), 0xf0c49c], [G.capsule(0.012 * u, 0.06 * u, 0.015 * u, 0.04 * u, 0, -0.3), 0xf0c49c]], 0.4);
  group.add(cam, photo, inner, mini, vee);
  const loop = 6.0, grey = new THREE.Color(0x404048), sky = new THREE.Color(0x8ad0ff);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { pose: [0.2, 0.3, 'back'], out: [1.5, 0.5], up: [2.0, 0.5], dev: [2.4, 1.4], drop: [5.2, 0.5] });
      const pose = T.pose * (1 - between(v, 4.6, 5.0));
      p.pose('Idle', t); p.group.position.set(px, floor + 0.03 * u * bump(v, 0.3, 0.3), 0.1 * u); p.group.rotation.y = 0.55;
      // a peace sign beside her face; the camera flashes; a photo slides out, rises and develops: it is her
      p.handTo('R', p.local(-0.2, 0.78, 0.12, W), pose, { out: 0.9, down: 0.4 }); p.turn('Head', 0, 0, -0.15 * pose);
      p.hold(vee, 'R', group, 0.005 * u); vee.rotation.set(0, p.group.rotation.y, 0); vee.position.y += 0.03 * u; vee.visible = pose > 0.5;
      pop(flash, pre ? 0 : bump(v, 1.1, 0.35), cx - 0.12 * u, cy + 0.03 * u, 0.1 * u); flash.rotation.z = v * 2;
      const k = pre ? 0 : T.out * (1 - T.drop), y = cy - 0.1 * u - 0.12 * u * T.out + 0.5 * u * T.up, sc = k * (0.6 + 0.9 * T.up), x = cx - 0.1 * u * T.up;
      for (const m of [photo, inner, mini]) { m.visible = k > 0.01; m.position.set(x, y, 0.12 * u); m.scale.setScalar(grow(sc)); }
      inner.material.color.copy(grey).lerp(sky, T.dev); mini.position.set(x, y + 0.02 * u * sc, 0.135 * u); mini.scale.setScalar(grow(sc * T.dev));
    },
  };
}

export const SCENES = { 'q-shop-basket': shopBasket, 'q-luggage-pile': luggage, 'q-hug-treasure': treasure, 'q-hand-over': handOver, 'q-rope-pull': ropePull, 'q-boomerang-throw': boomerang, 'q-photo-snap': photoSnap };
