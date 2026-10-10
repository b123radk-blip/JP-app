// Model scenes, shops and buildings (Step 3a model pass, batch 5).
//   q-shop-open    屋: a little shop: its shutter rolls up, the shopkeeper behind the counter waves (いらっしゃい!) and it
//                  rolls down again; outcome veg (八百屋): crates of vegetables on the counter (やおや); he holds up a
//                  daikon, then a carrot (やすいよ!); closed (閉まる): at dusk he waves goodbye and the shutter rolls
//                  down by itself (ガラガラ) and a へいてん sign swings on it
//   q-shop-counter 店: a market stall with a till; a woman pays a coin, the till drawer pops (チン!) and the shopkeeper
//                  hands her a paper bag; she walks off with it; outcome cafe (喫茶店): she sits at a café table, a waiter
//                  brings a cup of coffee and a cake on a tray (どうぞ), she sips: hearts
//   q-butler-door  仕: a butler opens a big door and bows low holding it (どうぞ) while a guest walks in; he shuts it and
//                  bows again; outcome hardhat (仕事): a worker carries a long plank on his shoulder to two trestles,
//                  lays it down and hammers it (トントン), wipes his brow: よし!
//   q-hall-rise    館: a big columned hall rises out of the ground; two visitors walk up its steps and in; outcome embassy
//                  (大使館): two flags wave on poles either side and the man shows a passport at the door; cinema
//                  (映画館): a えいが marquee with chasing lights, the pair go in holding popcorn
//   q-queue-number 番: three people queue at a counter under a number board; ピンポン, the number goes up and the front one
//                  steps up, gets a parcel from the clerk and walks off; the rest move up one place, and round again
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps, liveText } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, hearts, turnTo } from './q-common.js';
import { dyer } from './q-wear.js';
import { wscale, pass } from './q-learn.js';
import { stroll, appear } from './q-town.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), V3 = () => new THREE.Vector3();
const awning = (u, w, y, z, a, b) => Array.from({ length: 6 }, (_, i) => [G.box(w / 6, 0.03 * u, 0.3 * u, 0, 0, 0).rotateX(0.35).translate(-w / 2 + (i + 0.5) * w / 6, y, z), i % 2 ? b : a]);
const coinProp = (u) => solidProp([[G.cyl(0.05 * u, 0.05 * u, 0.01 * u, 0, 0, 0, Math.PI / 2), 0xffc830]], 0.8);
const bagProp = (u) => solidProp([[G.box(0.18 * u, 0.2 * u, 0.08 * u, 0, -0.12 * u, 0), 0xe8d0a0], [G.torus(0.045 * u, 0.008 * u, Math.PI, 0, -0.02 * u, 0), 0x8a5a30], [G.sphere(0.035 * u, 0, -0.12 * u, 0.04 * u, 1, 1, 0.3), 0xe03a3a]], 0.4);

// ---- 屋 / 八百屋 / 閉まる ----
function shopOpen(ctx, spec, stage) {
  const o = spec.outcome ?? 'open', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.72 * u, Wd = 0.95 * u, H = 0.95 * u, CH = 0.34 * u;
  const front = solidProp([[G.box(Wd, H, 0.03 * u, 0, H / 2, -0.38 * u), 0x5a3a24], [G.box(0.07 * u, H, 0.07 * u, -Wd / 2, H / 2, 0), 0x8a5a30], [G.box(0.07 * u, H, 0.07 * u, Wd / 2, H / 2, 0), 0x8a5a30],
    [G.box(Wd + 0.12 * u, 0.24 * u, 0.1 * u, 0, H + 0.1 * u, 0), 0x6a4024], [G.box(Wd - 0.04 * u, CH, 0.22 * u, 0, CH / 2, -0.05 * u), 0xc89a60], [G.box(Wd, 0.03 * u, 0.26 * u, 0, CH, -0.05 * u), 0x8a5a30],
    ...awning(u, Wd + 0.1 * u, H - 0.02 * u, 0.13 * u, 0xe03838, 0xffffff), ...(o === 'veg' ? veg(u, Wd, CH) : [])], 0.35);
  const sign = textPlane(o === 'veg' ? 'やおや' : 'みせ', { h: 0.15 * u, color: '#ffffff', pad: 0.3 }), shutter = solidProp([[G.box(Wd, 1, 0.02 * u, 0, -0.5, 0), 0xb8c0cc], ...[0.2, 0.4, 0.6, 0.8].map((y) => [G.box(Wd, 0.012, 0.024 * u, 0, -y, 0), 0x8a94a4])], 0.25);
  front.position.set(sx, floor, -0.1 * u); sign.position.set(sx, floor + H + 0.1 * u, -0.04 * u); shutter.position.set(sx, floor + H - 0.04 * u, 0.04 * u); const keeper = person(spec.who, u), call = label(u, o === 'veg' ? 'やすいよ!' : o === 'closed' ? 'またね!' : 'いらっしゃい!', '#e07a2a', 0.12);
  const extra = o === 'veg' ? [radish(u), carrot(u)] : o === 'closed' ? [textPlane('へいてん', { h: 0.1 * u, color: '#ffffff', bg: '#c03030', pad: 0.3 }), label(u, 'ガラガラ', '#6a7080', 0.11)] : [];
  group.add(front, sign, shutter, keeper.group, call, ...extra); const loop = 7.2, s = () => wscale(group);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      keeper.pose('Idle', t); keeper.group.position.set(sx, floor, -0.24 * u); keeper.group.rotation.y = 0; let shut = 0;
      if (o === 'open') {
        // the shutter rolls up on the shopkeeper, who waves you in; it rolls down at the end
        const T = timeline(v, { up: [0.3, 1.0, 'out'], down: [5.8, 1.0, 'in'] }); shut = pre ? 1 : 1 - T.up + T.down;
        const k = pre ? 0 : between(v, 1.2, 1.5) * (1 - between(v, 5.2, 5.6)); keeper.wave('R', k, v); pop(call, k, sx + 0.45 * u, floor + 1.12 * u, 0.25 * u);
      } else if (o === 'veg') {
        // he holds up a big daikon, then a carrot, calling out
        const [rad, car] = extra, a = pre ? 0 : between(v, 0.4, 0.8) * (1 - between(v, 2.8, 3.2)), b = pre ? 0 : between(v, 3.4, 3.8) * (1 - between(v, 5.8, 6.2));
        keeper.handTo('R', keeper.local(-0.24, 1.0, 0.1, W), a, { out: 0.4, down: 0.2 }); keeper.handTo('L', keeper.local(0.24, 1.0, 0.1, W), b, { out: 0.4, down: 0.2 });
        rad.visible = a > 0.05; keeper.hold(rad, 'R', group, 0.03 * u * s()); rad.rotation.set(0, 0, 0.3 * Math.sin(v * 3));
        car.visible = b > 0.05; keeper.hold(car, 'L', group, 0.025 * u * s()); car.rotation.set(0, 0, -0.3 * Math.sin(v * 3));
        pop(call, Math.max(a, b) > 0.9 ? 1 : 0, sx + 0.45 * u, floor + 1.12 * u, 0.25 * u);
      } else {
        // closing time: he waves goodbye and the shutter comes down by itself; a へいてん sign swings on it
        const [tag, noise] = extra, T = timeline(v, { down: [1.6, 1.4, 'in'], up: [6.0, 1.0, 'out'] }); shut = pre ? 0 : T.down * (1 - T.up);
        const k = pre ? 0 : between(v, 0.2, 0.5) * (1 - between(v, 1.6, 1.9)); keeper.wave('R', k, v); pop(call, k, sx + 0.45 * u, floor + 1.12 * u, 0.25 * u);
        pop(noise, pre ? 0 : (v > 1.7 && v < 3.0 ? 1 : 0), sx + 0.6 * u, floor + 0.7 * u, 0.2 * u);
        const hang = pre ? 0 : between(v, 3.0, 3.3) * (1 - between(v, 5.8, 6.0));
        pop(tag, hang, sx, floor + 0.55 * u, 0.07 * u); tag.rotation.z = 0.25 * Math.sin((v - 3.0) * 4) * Math.exp(-(v - 3.0) * 0.8);
      }
      shutter.scale.set(1, Math.max(1e-3, (H - 0.05 * u) * shut), 1);
    },
  };
}
function veg(u, Wd, CH) {
  const k = (x) => x * u, crate = (x) => [G.box(k(0.26), k(0.08), k(0.18), x, CH + k(0.04), k(0.02)), 0xb07a40];
  return [crate(-k(0.32)), crate(0), crate(k(0.32)),
    ...[0, 1, 2, 3].map((i) => [G.sphere(k(0.055), -k(0.4) + k(0.055) * i, CH + k(0.11), k(0.02) + k(0.03) * (i % 2)), 0x58b040]),
    ...[0, 1, 2, 3, 4].map((i) => [G.sphere(k(0.035), -k(0.08) + k(0.04) * i, CH + k(0.1), k(0.02) + k(0.03) * (i % 2)), 0xe03028]),
    ...[0, 1, 2].map((i) => [G.cone(k(0.025), k(0.16), k(0.25) + k(0.06) * i, CH + k(0.1), k(0.03), Math.PI / 2), 0xf08020])];
}
const radish = (u) => solidProp([[G.cyl(0.05 * u, 0.025 * u, 0.36 * u, 0, 0.12 * u, 0), 0xf8f4ea], ...[-0.5, 0, 0.5].map((a) => [G.cone(0.04 * u, 0.18 * u, 0.04 * u * a, 0.38 * u, 0, a), 0x48a040])], 0.5);
const carrot = (u) => solidProp([[G.cone(0.05 * u, 0.3 * u, 0, 0.08 * u, 0, Math.PI), 0xf07820], ...[-0.5, 0, 0.5].map((a) => [G.cone(0.03 * u, 0.14 * u, 0.03 * u * a, 0.29 * u, 0, a), 0x48a040])], 0.5);

// ---- 店 / 喫茶店 ----
function shopCounter(ctx, spec, stage) {
  if (spec.outcome === 'cafe') return cafe(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.6 * u, Wd = 0.8 * u, CH = 0.36 * u;
  const stall = solidProp([[G.box(Wd, CH, 0.26 * u, 0, CH / 2, 0), 0xc89060], [G.box(Wd + 0.04 * u, 0.03 * u, 0.3 * u, 0, CH + 0.015 * u, 0), 0x8a5a30],
    [G.box(0.04 * u, 1.05 * u, 0.04 * u, -Wd / 2, 0.525 * u, -0.12 * u), 0x8a5a30], [G.box(0.04 * u, 1.05 * u, 0.04 * u, Wd / 2, 0.525 * u, -0.12 * u), 0x8a5a30],
    ...awning(u, Wd + 0.1 * u, 1.04 * u, 0.0, 0x3a7ad0, 0xffffff), [G.box(0.2 * u, 0.13 * u, 0.15 * u, -0.24 * u, CH + 0.08 * u, 0), 0x707884], [G.box(0.13 * u, 0.05 * u, 0.01 * u, -0.24 * u, CH + 0.11 * u, 0.076 * u), 0x60e080],
    ...[0, 1, 2].map((i) => [G.box(0.1 * u, 0.12 * u, 0.08 * u, 0.12 * u + 0.11 * u * i, CH + 0.06 * u, 0), [0xf0c040, 0xe05a5a, 0x5ab0e0][i]])], 0.35);
  stall.position.set(sx, floor, 0); const drawer = solidProp([[G.box(0.18 * u, 0.035 * u, 0.13 * u, 0, 0, 0), 0x50545c], ...[0, 1].map((i) => [G.cyl(0.025 * u, 0.025 * u, 0.006 * u, -0.04 * u + 0.08 * u * i, 0.02 * u, 0), 0xffc830])], 0.4);
  const ding = label(u, 'チン!', '#e0a020', 0.14), coin = coinProp(u), bag = bagProp(u);
  const keeper = person(spec.who, u), buyer = person(spec.other, u), dye = dyer(keeper);
  group.add(stall, drawer, ding, coin, bag, keeper.group, buyer.group); const loop = 8.0, bIn = [sx + 1.2 * u, 0.5 * u], bAt = [sx + 0.58 * u, 0.28 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = wscale(group);
      const T = timeline(v, { in: [0.2, 1.4, 'linear'], pay: [1.8, 0.9, 'linear'], till: [2.7, 0.2, 'back'], shut: [3.6, 0.3], give: [3.3, 1.0, 'linear'], go: [4.8, 1.6, 'linear'] });
      dye('Hat', 0xd04040); dye('Vest', 0x3a7ad0);
      keeper.pose('Idle', t); keeper.group.position.set(sx + 0.12 * u, floor, -0.22 * u); keeper.group.rotation.y = 0.75;
      const going = T.go > 0; stroll(buyer, going ? bAt : bIn, going ? [sx + 1.4 * u, 0.6 * u] : bAt, going ? T.go : T.in, floor, v);
      if (T.in >= 1 && !going) buyer.group.rotation.y = LEFT + 0.2; appear(buyer, pre ? 0 : between(v, 0.1, 0.4) * (1 - between(T.go, 0.85, 1)));
      // the coin: her hand -> his hand -> the till; the bag: his hand -> hers
      const kRest = keeper.local(-0.15, 0.45, 0.25, V3()), bRest = buyer.local(0.15, 0.45, 0.25, V3()), mid = keeper.local(0, 0.5, 0.35, V3()).lerp(buyer.local(0, 0.5, 0.3, W2), 0.5);
      coin.visible = !pre && T.in > 0.5 && T.pay < 1; coin.rotation.set(0, v * 3, 0);
      if (T.pay > 0 && T.pay < 1) pass(buyer, 'L', keeper, 'R', coin, group, T.pay, bRest, kRest, mid, 0.01 * u * s);
      else if (coin.visible) { buyer.handTo('L', bRest, 1); buyer.hold(coin, 'L', group, 0.01 * u * s); }
      bag.visible = !pre && T.give > 0 && T.go < 0.85;
      if (T.give > 0 && T.give < 1) pass(keeper, 'R', buyer, 'L', bag, group, T.give, kRest, bRest, mid, 0.04 * u * s);
      else if (bag.visible) { buyer.handTo('L', buyer.local(0.2, 0.32, 0.08, W), 1, { out: 0.8, down: 0.9 }); buyer.hold(bag, 'L', group, 0.04 * u * s); }
      bag.rotation.y = buyer.group.rotation.y; drawer.position.set(sx - 0.24 * u, floor + CH + 0.035 * u, 0.04 * u + 0.12 * u * (T.till - T.shut));
      pop(ding, pre ? 0 : bump(v, 2.7, 0.8) > 0.2 ? 1 : 0, sx - 0.12 * u, floor + CH + 0.62 * u, 0.15 * u);
    },
  };
}
function cafe(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.55 * u, TH = 0.3 * u;
  const table = solidProp([[G.cyl(0.2 * u, 0.2 * u, 0.025 * u, 0, TH, 0), 0xf4f0e8], [G.cyl(0.02 * u, 0.02 * u, TH, 0, TH / 2, 0), 0x404040], [G.cyl(0.1 * u, 0.1 * u, 0.02 * u, 0, 0.01 * u, 0), 0x404040],
    [G.box(0.2 * u, 0.025 * u, 0.2 * u, 0, 0.2 * u, -0.38 * u), 0x8a5a30], [G.box(0.2 * u, 0.25 * u, 0.025 * u, 0, 0.32 * u, -0.48 * u), 0x8a5a30], ...[-1, 1].map((a) => [G.box(0.02 * u, 0.2 * u, 0.02 * u, a * 0.08 * u, 0.1 * u, -0.38 * u), 0x6a4024])], 0.35);
  table.position.set(tx, floor, 0.1 * u); const sign = textPlane('きっさてん', { h: 0.13 * u, color: '#ffffff', bg: '#7a4a2a', pad: 0.3 }); sign.position.set(tx + 0.1 * u, floor + 1.05 * u, -0.5 * u);
  const k = (x) => x * u, tray = solidProp([[G.cyl(k(0.13), k(0.13), k(0.012), 0, 0, 0), 0xc0c4cc]], 0.4);
  const cup = solidProp([[G.cyl(k(0.035), k(0.03), k(0.06), 0, k(0.03), 0), 0xffffff], [G.cyl(k(0.03), k(0.03), k(0.004), 0, k(0.058), 0), 0x4a2a14], [G.torus(k(0.017), k(0.006), Math.PI * 2, k(0.04), k(0.032), 0), 0xffffff], [G.cyl(k(0.055), k(0.055), k(0.006), 0, 0, 0), 0xffffff]], 0.5);
  const cake = solidProp([[G.cyl(k(0.05), k(0.05), k(0.006), 0, 0, 0), 0xffffff], [G.cyl(k(0.035), k(0.035), k(0.045), 0, k(0.025), 0, 0, 0, 0, 3), 0xfff0d0], [G.sphere(k(0.014), 0, k(0.055), 0), 0xe02030]], 0.5);
  const guest = person(spec.other, u), waiter = person(spec.who, u), steam = many(PUFF(u, 0xffffff), 4, 0.5), hs = many(HEART(u, 0.09), 3, 1), say = label(u, 'どうぞ', '#7a4a2a', 0.12);
  group.add(table, sign, tray, cup, cake, guest.group, waiter.group, steam, hs, say); const loop = 8.4, wIn = [tx + 1.1 * u, 0.15 * u], wAt = [tx + 0.36 * u, 0.15 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = wscale(group);
      const T = timeline(v, { in: [0.2, 1.6, 'linear'], put: [2.0, 0.5], bow: [2.6, 0.4], up: [3.2, 0.4], go: [3.5, 1.1, 'linear'], sip: [4.4, 0.6], down: [6.0, 0.6], gone: [7.6, 0.5] });
      guest.pose('SitDown', 1.0, false); guest.group.position.set(tx, floor, -0.28 * u + 0.1 * u); guest.group.rotation.y = 0.15;
      const going = T.go > 0; stroll(waiter, going ? wAt : wIn, going ? wIn : wAt, going ? T.go : T.in, floor, v);
      if (T.in >= 1 && !going) waiter.group.rotation.y = LEFT + 0.3; appear(waiter, pre ? 0 : between(v, 0.1, 0.4) * (1 - between(T.go, 0.6, 1)));
      // he carries the tray flat before him, sets the cup and the cake down, bows
      const carry = 1 - T.put, top = V3().set(tx, floor + TH + 0.015 * u, 0.1 * u);
      waiter.holdOut(waiter.group.visible ? carry : 0, { apart: 0.22, y: 0.45, z: 0.3 }); waiter.bow(0.6 * T.bow * (1 - T.up));
      const onTray = group.worldToLocal(waiter.local(0, 0.46, 0.33, V3()));
      tray.visible = waiter.group.visible && carry > 0.02; tray.position.copy(onTray); tray.rotation.y = waiter.group.rotation.y;
      const served = T.put >= 1 && T.gone < 1;
      cup.position.copy(served ? top.clone().add(W.set(-0.06 * u, 0, 0.06 * u)) : onTray.clone().add(W.set(0, 0.008 * u, 0.04 * u)));
      cake.position.copy(served ? top.clone().add(W.set(0.08 * u, 0, 0.04 * u)) : onTray.clone().add(W.set(0, 0.008 * u, -0.05 * u)));
      cup.visible = cake.visible = (served || tray.visible) && !(T.gone > 0.5);
      // she reaches for the cup, lifts it to her lips and sips; hearts
      const reach = served ? between(v, 4.0, 4.4) * (1 - between(v, 6.6, 7.0)) : 0, lift = T.sip * (1 - T.down);
      if (reach > 0) {
        guest.handTo('R', group.localToWorld(cup.position.clone().add(W.set(0.05 * u, 0.03 * u, 0))).lerp(guest.at('mouth', W2, -0.03, -0.05, 0.1), lift), reach, { out: 0.6, down: 0.8 });
        guest.turn('Head', -0.15 * lift); if (reach > 0.95) { guest.hold(cup, 'R', group, 0.035 * u * s); cup.position.y -= 0.03 * u; }
      }
      wisps(steam, 0, 4, cup.position.x, cup.position.y + 0.06 * u, pre ? 0 : v, u, { period: 1.4, rise: 0.3, size: 0.5, on: cup.visible ? 1 : 0 }); steam.commit();
      hearts(hs, 3, tx - 0.05 * u, floor + 0.75 * u, 0.15 * u, pre ? -1 : v, 5.0, u);
      pop(say, T.put > 0.5 && T.up < 1 ? 1 : 0, wAt[0] + 0.05 * u, floor + 1.05 * u, 0.3 * u);
    },
  };
}

// ---- 仕 / 仕事 ----
function butlerDoor(ctx, spec, stage) {
  if (spec.outcome === 'hardhat') return hardhat(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.85 * u, hz = -0.35 * u, DW = 0.34 * u, DH = 0.72 * u;
  const wall = solidProp([[G.box(1.0 * u, 1.05 * u, 0.1 * u, 0, 0.525 * u, -0.05 * u), 0xe8dcc8], [G.box(1.08 * u, 0.06 * u, 0.16 * u, 0, 1.07 * u, -0.03 * u), 0x8a7a68], [G.box(DW + 0.08 * u, DH + 0.05 * u, 0.02 * u, 0, (DH + 0.05 * u) / 2, 0.005 * u), 0x6a3a1a],
    [G.box(DW, DH, 0.01 * u, 0, DH / 2, 0.012 * u), 0xffe0a0], [G.box(0.56 * u, 0.04 * u, 0.24 * u, 0, 0.02 * u, 0.1 * u), 0xa8a098], ...[-1, 1].map((a) => [G.sphere(0.045 * u, a * 0.33 * u, 0.62 * u, 0.04 * u), 0xffe080])], 0.35);
  const door = solidProp([[G.box(DW, DH, 0.03 * u, DW / 2, DH / 2, 0), 0x8a3a20], [G.box(DW * 0.7, DH * 0.3, 0.035 * u, DW / 2, DH * 0.7, 0), 0x7a2a14], [G.box(DW * 0.7, DH * 0.3, 0.035 * u, DW / 2, DH * 0.3, 0), 0x7a2a14], [G.sphere(0.022 * u, DW * 0.85, DH * 0.5, 0.03 * u), 0xf0c040]], 0.35);
  wall.position.set(hx, floor, hz); door.position.set(hx - DW / 2, floor, hz + 0.03 * u); const butler = person(spec.who, u), guest = person(spec.other, u), dye = dyer(butler), say = label(u, 'どうぞ', '#6a3a1a', 0.13);
  group.add(wall, door, butler.group, guest.group, say); const loop = 8.4, from = [hx + 0.95 * u, 0.5 * u], stop = [hx + 0.2 * u, hz + 0.45 * u], inside = [hx + 0.02 * u, hz - 0.15 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { in: [0.2, 1.7, 'linear'], open: [1.5, 0.8], bow: [2.2, 0.5], walk: [3.2, 1.2, 'linear'], up: [4.0, 0.5], shut: [4.6, 0.8], bow2: [5.6, 0.4], up2: [6.4, 0.4] });
      dye('Shirt', 0xffffff); door.rotation.y = -1.75 * T.open * (1 - T.shut);
      // the butler stands by the hinge; he holds the open door by its edge and bows low, sweeping the other hand in
      butler.pose('Idle', t); butler.group.position.set(hx - DW / 2 - 0.2 * u, floor, hz + 0.3 * u); butler.group.rotation.y = 0.5;
      const hold = between(T.open, 0.5, 1) * (1 - between(T.shut, 0, 0.4)); door.updateWorldMatrix(true, false);
      butler.handTo('R', door.localToWorld(W.set(DW * 0.85, DH * 0.5, 0.04 * u)), hold, { out: 0.7, down: 0.8 });
      const b = 0.75 * T.bow * (1 - T.up) + 0.6 * T.bow2 * (1 - T.up2); butler.bow(b);
      butler.handTo('L', butler.local(0.3, 0.4, 0.3, W2), T.bow * (1 - T.up), { out: 0.7, down: 0.6 });
      // the guest walks up, nods to him and goes in; she comes round again at the end
      const going = T.walk > 0; stroll(guest, going ? stop : from, going ? inside : stop, going ? T.walk : T.in, floor, v);
      if (T.in >= 1 && !going) guest.group.rotation.y = turnTo(LEFT + 0.4, Math.PI + 0.2, between(v, 2.9, 3.3));
      appear(guest, pre ? 1 : v > 7.6 ? between(v, 7.6, 8.1) : 1 - between(T.walk, 0.75, 1));
      if (v > 7.6) { guest.group.position.set(from[0], floor, from[1]); guest.group.rotation.y = LEFT; }
      pop(say, pre ? 0 : bump(v, 2.2, 1.8) > 0.25 ? 1 : 0, hx - DW / 2 - 0.25 * u, floor + 1.05 * u, 0.4 * u);
    },
  };
}
function hardhat(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.75 * u, TH = 0.3 * u;
  const trestles = solidProp([-1, 1].flatMap((a) => [[G.box(0.04 * u, 0.025 * u, 0.24 * u, tx + a * 0.32 * u, TH - 0.012 * u, 0), 0xb07a40], [G.box(0.025 * u, TH, 0.025 * u, tx + a * 0.32 * u, TH / 2, 0.09 * u, 0.15), 0xb07a40], [G.box(0.025 * u, TH, 0.025 * u, tx + a * 0.32 * u, TH / 2, -0.09 * u, -0.15), 0xb07a40]]), 0.35);
  const plank = solidProp([[G.box(0.09 * u, 0.035 * u, 0.95 * u, 0, 0, 0), 0xe0b070], [G.box(0.092 * u, 0.006 * u, 0.95 * u, 0, 0.018 * u, 0), 0xc8964a]], 0.4);
  const hammer = solidProp([[G.cyl(0.013 * u, 0.015 * u, 0.2 * u, 0, 0.06 * u, 0), 0x8a5a30], [G.box(0.1 * u, 0.04 * u, 0.04 * u, 0.0, 0.16 * u, 0), 0x6a7480]], 0.45);
  trestles.position.y = floor; const p = person(spec.who, u), tok = label(u, 'トントン', '#c07a2a', 0.12), ok = label(u, 'よし!', '#3a8a3a', 0.14), sweat = many([[G.sphere(0.02 * u, 0, 0, 0, 0.8, 1.2, 0.8), 0x9ad8ff]], 2, 0.8);
  group.add(trestles, plank, hammer, p.group, tok, ok, sweat); const loop = 9.0, from = [B.maxX + 1.6 * u, -0.25 * u], at = [tx, -0.25 * u], rest = new THREE.Vector3(tx, floor + TH + 0.02 * u, 0);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = wscale(group);
      const T = timeline(v, { in: [0.2, 1.8, 'linear'], turn: [2.0, 0.4], down: [2.3, 0.7], tool: [3.0, 0.3], wipe: [5.6, 0.4], unwipe: [6.6, 0.4], out: [7.6, 0.4], back: [8.2, 0.5] });
      stroll(p, from, at, T.in, floor, v);
      if (T.in >= 1) p.group.rotation.y = turnTo(LEFT, 0, T.turn); if (T.in <= 0) p.group.rotation.y = LEFT;
      appear(p, pre ? 1 : (1 - T.out) + T.back);
      if (T.back > 0) { p.pose('Idle', t); p.group.position.set(from[0], floor, from[1]); p.group.rotation.y = LEFT; }
      // the plank: on his right shoulder, along the way he walks; then laid across the trestles
      const lay = T.back > 0 ? 0 : T.down, sh = group.worldToLocal(p.local(-0.22, 0.66, 0.02, V3()));
      plank.position.copy(sh.lerp(rest, lay)); plank.position.y += 0.08 * u * Math.sin(Math.PI * lay);
      plank.rotation.y = lerp(p.group.rotation.y, RIGHT, lay); plank.visible = p.group.visible || lay >= 1; plank.scale.setScalar(lay >= 1 ? 1 : p.group.scale.x);
      const carry = 1 - lay; p.handTo('R', group.localToWorld(plank.position.clone().add(W.set(0, -0.03 * u, 0))), carry > 0.02 ? 1 : 0, { out: 0.7, down: 0.6 });
      if (lay > 0 && lay < 1) p.handTo('L', group.localToWorld(plank.position.clone().add(W.set(0.12 * u, -0.03 * u, 0))), 1, { out: 0.7, down: 0.7 });
      // three blows with the hammer, then a wipe of the brow: よし!
      const work = T.tool * (1 - T.wipe), hit = !pre && v > 3.3 && v < 5.5 ? Math.abs(Math.sin((v - 3.3) * Math.PI / 0.7)) : 0;
      p.handTo('R', group.localToWorld(W.set(tx - 0.12 * u, floor + TH + 0.1 * u + 0.12 * u * hit, 0.02 * u)), work, { out: 0.8, down: 0.5 });
      hammer.visible = work > 0.05; p.hold(hammer, 'R', group, 0.014 * u * s); hammer.rotation.set(0, 0, RIGHT - 0.9 * hit);
      p.turn('Head', 0.35 * work); pop(tok, hit > 0.6 && work > 0.9 ? 1 : 0, tx - 0.3 * u, floor + 0.7 * u, 0.2 * u);
      const wipe = T.wipe * (1 - T.unwipe); p.handTo('L', p.at('eyes', W, 0.05, 0.1, 0.06), wipe, { out: 0.7, down: 0.6 });
      for (let i = 0; i < 2; i++) { p.at('eyes', W, (i ? 1 : -1) * 0.15, 0.08 - 0.1 * ((v * 0.8 + i * 0.5) % 1), 0); group.worldToLocal(W); sweat.set(i, W.x, W.y, W.z, wipe > 0.3 ? 1 : 0); } sweat.commit();
      pop(ok, wipe, tx + 0.1 * u, floor + 1.12 * u, 0.25 * u);
    },
  };
}

// ---- 館 / 大使館 / 映画館 ----
const tri = () => { const sh = new THREE.Shape(); sh.moveTo(-1, 0); sh.lineTo(1, 0); sh.lineTo(0, 1); sh.lineTo(-1, 0); return sh; };
// a columned hall on three steps, its door at the top; origin at the foot of the steps' middle (front z = 0)
const hall = (u) => { const k = (x) => x * u, S = 0xe8e0d0, D = 0xd0c6b4; return solidProp([...[0, 1, 2].map((i) => [G.box(k(1.2 - 0.1 * i), k(0.045), k(0.42 - 0.1 * i), 0, k(0.0225 + 0.045 * i), k(-0.21 - 0.05 * i)), i % 2 ? D : S]),
  [G.box(k(1.0), k(0.6), k(0.3), 0, k(0.435), k(-0.48)), S], [G.box(k(0.22), k(0.4), k(0.01), 0, k(0.335), k(-0.325)), 0x2a1c14], ...[-0.4, -0.16, 0.16, 0.4].map((x) => [G.cyl(k(0.04), k(0.045), k(0.6), k(x), k(0.435), k(-0.27)), 0xf4f0e8]),
  [G.box(k(1.1), k(0.08), k(0.5), 0, k(0.775), k(-0.4)), D], [G.extrude(tri(), 1).scale(k(0.56), k(0.22), k(0.5)).translate(0, k(0.815), k(-0.4)), S]], 0.35); };
const flag = (u, japan) => solidProp(japan ? [[G.box(0.3 * u, 0.2 * u, 0.008 * u, 0.15 * u, 0, 0), 0xffffff], [G.cyl(0.055 * u, 0.055 * u, 0.012 * u, 0.15 * u, 0, 0, Math.PI / 2), 0xe02030]]
  : [0x2050b0, 0xffffff, 0xd02030].map((c, i) => [G.box(0.1 * u, 0.2 * u, 0.008 * u, (0.05 + 0.1 * i) * u, 0, 0), c]), 0.5);
function hallRise(ctx, spec, stage) {
  const o = spec.outcome ?? 'hall', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.85 * u, hz = -0.1 * u;
  const K = 1.25, H = hall(u * K); H.position.set(hx, floor, hz);
  const a = person(spec.who, u, 0.82), b = person(spec.other, u, 0.82), extra = [];
  if (o === 'embassy') {
    const poles = solidProp([-1, 1].map((sg) => [G.cyl(0.012 * u, 0.012 * u, 1.45 * u, sg * 0.8 * u, 0.725 * u, -0.25 * u), 0xc0c4cc]), 0.4); poles.position.set(hx, floor, hz);
    extra.push(poles, flag(u, true), flag(u, false), solidProp([[G.box(0.12 * u, 0.16 * u, 0.02 * u, 0, 0, 0), 0x9a1a2a], [G.sphere(0.03 * u, 0, 0.01 * u, 0.008 * u, 1, 1, 0.2), 0xf0c040]], 0.5), label(u, 'パスポート', '#9a1a2a', 0.1));
  } else if (o === 'cinema') {
    const sign = textPlane('えいが', { h: 0.2 * u, color: '#ffe060', bg: '#401020', pad: 0.4 }), bulbs = many([[G.sphere(0.022 * u), 0xffffff]], 16, 1.3);
    extra.push(sign, bulbs, ...[0, 1].map(() => solidProp([[G.cyl(0.05 * u, 0.035 * u, 0.1 * u, 0, 0, 0), 0xe03030], [G.cyl(0.051 * u, 0.036 * u, 0.1 * u, 0, 0, 0, 0, 0.5, 0, 6), 0xffffff], [G.sphere(0.05 * u, 0, 0.055 * u, 0, 1, 0.6, 1), 0xfff0a0]], 0.5)));
  }
  group.add(H, a.group, b.group, ...extra); const loop = 7.6, top = 0.135 * K * u, door = (i) => [hx + (i - 0.5) * 0.12 * u, hz - 0.4 * K * u], foot = (i) => [hx + (i - 0.5) * 0.22 * u + 0.1 * u, hz + 0.12 * u], from = (i) => [hx + 0.85 * u + 0.25 * u * i, 0.55 * u - 0.1 * u * i];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, s = wscale(group);
      // (館) the hall rises out of the ground while the strokes draw
      H.scale.y = o === 'hall' && pre ? grow(A.setup) : 1;
      [a, b].forEach((p, i) => {
        const at = 0.2 + 0.5 * i, wait = o === 'embassy' && i === 0 ? 1.4 : 0; const T = timeline(v, { walk: [at, 1.5, 'linear'], climb: [at + 1.5 + wait, 0.8, 'linear'], back: [6.9, 0.5] });
        if (T.climb > 0) { stroll(p, foot(i), door(i), T.climb, floor, v); p.group.position.y = floor + top * Math.min(1, T.climb * 1.6); }
        else stroll(p, from(i), foot(i), T.walk, floor, v);
        if (T.walk <= 0) p.group.rotation.y = LEFT + 0.6; if (T.walk >= 1 && T.climb <= 0) p.group.rotation.y = Math.PI - 0.15;
        appear(p, pre ? 1 : T.back > 0 ? T.back : 1 - between(T.climb, 0.8, 1));
        if (T.back > 0) { p.pose('Idle', t); p.group.position.set(from(i)[0], floor, from(i)[1]); p.group.rotation.y = LEFT + 0.6; }
        if (o === 'cinema') { const pop2 = extra[2 + i]; p.handTo('L', p.local(0.14, 0.42, 0.22, W), 1, { out: 0.6, down: 0.8 }); p.hold(pop2, 'L', group, 0.045 * u * s); pop2.rotation.set(0, 0, 0); pop2.visible = p.group.visible; pop2.scale.setScalar(p.group.scale.x); }
      });
      if (o === 'embassy') {
        // two flags wave on their poles; at the foot of the steps he holds up his passport
        const [, f1, f2, pass2, tag] = extra;
        [f1, f2].forEach((f, i) => { f.position.set(hx + (i ? 0.8 : -0.8) * u, floor + 1.32 * u, hz - 0.25 * u); f.rotation.y = (i ? 0 : Math.PI) + 0.35 * Math.sin(v * 3 + i * 1.3); f.scale.x = 0.9 + 0.1 * Math.sin(v * 5 + i); });
        const up = pre ? 0 : between(v, 1.8, 2.1) * (1 - between(v, 2.9, 3.2));
        if (up > 0) a.group.rotation.y = turnTo(Math.PI - 0.15, 0.6, up); a.handTo('R', a.local(-0.24, 1.05, 0.06, W), up, { out: 0.4, down: 0.2 });
        pass2.visible = up > 0.05; a.hold(pass2, 'R', group, 0.01 * u * s); pass2.rotation.set(0, a.group.rotation.y + Math.PI, 0);
        pop(tag, up, foot(0)[0] - 0.25 * u, floor + 1.0 * u, 0.3 * u);
      } else if (o === 'cinema') {
        // a marquee over the door: the えいが sign in a ring of chasing bulbs
        const [sign, bulbs] = extra, lit = new THREE.Color(0xffe060), dim = new THREE.Color(0x604020); sign.position.set(hx, floor + 1.2 * u, hz + 0.02 * u);
        for (let i = 0; i < 16; i++) { const f = i / 16, x = f < 0.5 ? lerp(-0.3, 0.3, f * 2) : lerp(0.3, -0.3, f * 2 - 1); bulbs.set(i, hx + 1.25 * x * u, floor + (f < 0.5 ? 1.35 : 1.05) * u, hz + 0.03 * u, 1); bulbs.setColorAt(i, (i + Math.floor((pre ? 0 : v) * 6)) % 3 === 0 ? lit : dim); }
        bulbs.instanceColor.needsUpdate = true; bulbs.commit();
      }
    },
  };
}

// ---- 番 ----
function queueNumber(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.6 * u, CH = 0.36 * u;
  const counter = solidProp([[G.box(0.22 * u, CH, 0.55 * u, 0, CH / 2, 0), 0xa8b0c0], [G.box(0.26 * u, 0.03 * u, 0.6 * u, 0, CH, 0), 0x6a7080], [G.cyl(0.015 * u, 0.015 * u, 0.75 * u, 0, CH + 0.37 * u, -0.22 * u), 0x404650], [G.box(0.5 * u, 0.3 * u, 0.04 * u, 0.12 * u, 1.18 * u, -0.22 * u), 0x202428]], 0.35);
  counter.position.set(cx, floor, 0); const board = liveText(u, { h: 0.24, w: 0.44, color: '#ff5040', bg: '#101214' }); board.position.set(cx + 0.12 * u, floor + 1.18 * u, -0.195 * u);
  const parcel = solidProp([[G.box(0.14 * u, 0.1 * u, 0.12 * u, 0, 0, 0), 0xc8964a], [G.box(0.142 * u, 0.012 * u, 0.122 * u, 0, 0.0, 0), 0xf0e0a0]], 0.4), ding = label(u, 'ピンポン', '#3a7ac0', 0.11);
  const clerk = person(spec.clerk, u), folk = [spec.who, spec.other, spec.third].map((n) => person(n, u, 0.82));
  group.add(counter, board, parcel, ding, clerk.group, ...folk.map((f) => f.group)); const CYC = 2.8, loop = 3 * CYC, slot = (j) => [cx + 0.42 * u + 0.31 * u * j, 0.12 * u + 0.05 * u * j], desk = [cx + 0.28 * u, 0.1 * u], away = [cx + 1.5 * u, 0.62 * u];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? 0 : A.v, s = wscale(group);
      const c = Math.floor(v / CYC), w = v - c * CYC, T = timeline(pre ? -1 : w, { up: [0.3, 0.5, 'linear'], give: [0.9, 0.7, 'linear'], go: [1.8, 0.9, 'linear'], move: [2.0, 0.6, 'linear'], back: [2.45, 0.35] });
      board.set(`${pre ? 1 : c + 1}ばん`); pop(ding, pre ? 0 : (w < 0.6 ? 1 : 0), cx + 0.62 * u, floor + 1.42 * u, -0.2 * u);
      clerk.pose('Idle', t); clerk.group.position.set(cx - 0.24 * u, floor, 0.0); clerk.group.rotation.y = RIGHT - 0.35;
      folk.forEach((f, i) => {
        const j = ((i - c) % 3 + 3) % 3;
        if (j === 0) {
          // the front one: steps up to the counter, takes the parcel, walks off; then joins the back of the line again
          if (T.back > 0) { f.pose('Idle', t); f.group.position.set(slot(2)[0], floor, slot(2)[1]); f.group.rotation.y = LEFT + 0.35; appear(f, T.back); return; }
          const going = T.go > 0; stroll(f, going ? desk : slot(0), going ? away : desk, going ? T.go : T.up, floor, v);
          if (!going && T.up >= 1) f.group.rotation.y = LEFT + 0.2; if (!going && T.up <= 0) f.group.rotation.y = LEFT + 0.35;
          appear(f, 1 - between(T.go, 0.8, 1)); f.bow(0.4 * bump(w, 1.5, 0.5));
          const fRest = f.local(0.14, 0.45, 0.25, V3()), cRest = clerk.local(-0.14, 0.45, 0.25, V3()), mid = fRest.clone().lerp(cRest, 0.5);
          parcel.visible = !pre && T.up > 0.5 && T.go < 0.8;
          if (T.give > 0 && T.give < 1) pass(clerk, 'R', f, 'L', parcel, group, T.give, cRest, fRest, mid, 0.05 * u * s);
          else if (T.give >= 1) { f.handTo('L', f.local(0.2, 0.36, 0.12, W), 1, { out: 0.8, down: 0.9 }); f.hold(parcel, 'L', group, 0.05 * u * s); }
          else { clerk.handTo('R', cRest, 1); clerk.hold(parcel, 'R', group, 0.05 * u * s); }
          parcel.rotation.y = f.group.rotation.y;
        } else {
          // the others wait, then move up one place
          stroll(f, slot(j), slot(j - 1), T.move, floor, v + i);
          if (T.move <= 0 || T.move >= 1) { f.pose('Idle', t + i); f.group.rotation.y = LEFT + 0.35; }
          appear(f, 1);
        }
      });
    },
  };
}

export const SCENES = { 'q-shop-open': shopOpen, 'q-shop-counter': shopCounter, 'q-butler-door': butlerDoor, 'q-hall-rise': hallRise, 'q-queue-number': queueNumber };
