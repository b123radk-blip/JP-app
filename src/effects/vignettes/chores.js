// Everyday life at home and out (word cards).
//   shop-basket   買い物: a person with a basket walks along a shelf of goods; things hop off the shelf into the basket
//   luggage-pile  荷物: a person staggers in under a tall pile of bags and cases, the top one teetering
//   hug-treasure  大切: a treasure chest opens on a glowing gem; a person hugs the chest tight, hearts rising
//   hand-wash     洗う: two hands rub together under a running tap, suds foaming, then shake dry
//   laundry       洗濯: clothes tumble round in a washing machine's window; it stops, a shirt hops out onto a line and flaps
//   toilet-dash   お手洗い: a person hops from foot to foot by a door marked WC, dashes in, the door shuts; it opens and they
//                 stroll out, relieved
//   switch-off    消す: a hand flicks a switch: the lamp goes out and the room goes dark; flick, it comes back
//   candle-out    消える: a candle flame flickers, shrinks and goes out by itself, a curl of smoke; it lights again
//   gift-open     開ける: a wrapped present: its flaps fly open and a star pops out, spinning
//   bath-tub      お風呂: a person relaxes in a bathtub, bubbles rising, a rubber duck bobbing, steam
//   sneeze        風邪: a person with a red nose: ah... ah... CHOO! a spray bursts out, a tissue flies, they shiver
import * as THREE from 'three';
import { acts, timeline, bump, wobble, tremble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF, HEART, burst } from '../pieces/kit-things.js';
import { emblemProp, cardBox, textPlane, veil } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, wisps, arc, handTo, bonePoint } from './helpers.js';

function shopBasket(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.75 * u;
  const COLORS = [0xe04848, 0x40a0e0, 0xf0c030, 0x60c060, 0xd070d0];
  const shelf = solidProp([[G.box(1.1 * u, 0.04 * u, 0.25 * u, 0, 0.55 * u, -0.1 * u), 0x8a6a4a], [G.box(1.1 * u, 0.04 * u, 0.25 * u, 0, 0.95 * u, -0.1 * u), 0x8a6a4a], [G.box(0.04 * u, 1.0 * u, 0.25 * u, -0.55 * u, 0.5 * u, -0.1 * u), 0x6a4a2a], [G.box(0.04 * u, 1.0 * u, 0.25 * u, 0.55 * u, 0.5 * u, -0.1 * u), 0x6a4a2a],
    ...COLORS.map((c, i) => [G.box(0.12 * u, 0.16 * u, 0.1 * u, (-0.42 + i * 0.2) * u, 1.05 * u, -0.1 * u), c])]);
  shelf.position.set(sx, floor, -0.1 * u);
  const goods = [0xe04848, 0x40c070, 0xf0a030].map((c) => solidProp([[G.box(0.12 * u, 0.14 * u, 0.1 * u, 0, 0, 0), c], [G.box(0.08 * u, 0.04 * u, 0.102 * u, 0, 0.02 * u, 0), 0xffffff]]));
  const p = createPerson({ u: 0.95 * u, shirt: 0x9a60d0 }), basket = solidProp([[G.box(0.24 * u, 0.12 * u, 0.16 * u, 0, -0.08 * u, 0), 0xc89040], [G.torus(0.1 * u, 0.01 * u, Math.PI, 0, -0.02 * u, 0), 0x8a5a30]]);
  p.rig.attach('handR', basket, 0.4);
  group.add(shelf, ...goods, p.group);
  const FROM = [-0.32, 0.08, 0.38], HOP = [0.6, 1.4, 2.2], loop = 4.4, hold = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const walk = pre ? 0 : between(v, 0, 3.0), x = sx + 0.8 * u - 1.3 * u * walk;
      p.group.position.set(x, floor, 0.2 * u); p.face('left').reset().walk(v * 9, pre ? 0 : walk < 1 ? 0.8 : 0); p.bone('armR').rotation.x = 0.5; p.update();
      bonePoint(p, 'handR', 0.4, hold);
      goods.forEach((g, i) => {
        const f = pre ? 0 : between(v, HOP[i], HOP[i] + 0.5), from = [sx + FROM[i] * u, floor + 0.65 * u], [gx, gy] = arc(from, [hold.x, hold.y - 0.05 * u], 0.25 * u, f);
        g.position.set(f >= 1 ? hold.x + (i - 1) * 0.05 * u : gx, f >= 1 ? hold.y - 0.06 * u : gy, f > 0 ? 0.2 * u : -0.1 * u); g.visible = !(v > 3.9);
      });
    },
  };
}

function luggagePile(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const p = createPerson({ u, shirt: 0x50a0a0 });
  const pile = solidProp([[G.box(0.36 * u, 0.2 * u, 0.2 * u, 0, 0.1 * u, 0), 0xd06030], [G.box(0.12 * u, 0.04 * u, 0.04 * u, 0, 0.22 * u, 0), 0x3a2a20], [G.box(0.3 * u, 0.16 * u, 0.18 * u, 0.02 * u, 0.28 * u, 0), 0x3a7ad0], [G.box(0.26 * u, 0.14 * u, 0.16 * u, -0.03 * u, 0.43 * u, 0), 0x6ab040]]);
  const top = solidProp([[G.box(0.2 * u, 0.12 * u, 0.14 * u, 0, 0.06 * u, 0), 0xe0b030], [G.torus(0.05 * u, 0.01 * u, Math.PI, 0, 0.12 * u, 0), 0x6a4a20]]);
  group.add(p.group, pile, top);
  const loop = 4.6, hands = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 2.2, 'out'], back: [3.8, 0.8] });
      const go = pre ? 0 : T.walk - T.back, x = B.maxX + 0.45 * u + 1.2 * u * (1 - go), sway = 0.12 * Math.sin(v * 5) * (T.walk < 1 ? 1 : 0.4);
      p.group.position.set(x, floor, 0.05 * u); p.face(pre ? 'toward' : -1.3).reset().walk(v * 7, !pre && T.walk < 1 ? 0.7 : 0);
      p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.25; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.0; p.bone('body').rotation.z = sway * 0.5; p.update();   // held in front of the chest
      bonePoint(p, 'handL', 0.4, hands);
      pile.position.set(hands.x, hands.y + 0.02 * u, hands.z); pile.rotation.z = sway;
      top.position.set(hands.x - 0.02 * u + Math.sin(sway) * -0.5 * u, hands.y + 0.52 * u, hands.z); top.rotation.z = sway * 2.5 + 0.15 * Math.sin(v * 7);
    },
  };
}

function hugTreasure(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.4 * u;
  const chest = solidProp([[G.box(0.42 * u, 0.24 * u, 0.26 * u, 0, 0.12 * u, 0), 0x8a4a20], [G.box(0.44 * u, 0.03 * u, 0.27 * u, 0, 0.2 * u, 0), 0xf0c040], [G.box(0.06 * u, 0.08 * u, 0.02 * u, 0, 0.18 * u, 0.135 * u), 0xf0c040]]);
  const lidPivot = new THREE.Group(), lid = solidProp([[G.cyl(0.13 * u, 0.13 * u, 0.42 * u, 0, 0, 0.13 * u, 0, 0, Math.PI / 2), 0x9a5a28]]);
  lid.scale.set(1, 0.6, 1); lidPivot.position.set(cx, floor + 0.24 * u, -0.13 * u); lidPivot.add(lid);
  const gem = emblemProp('gem', 0.3 * u), hearts = many(HEART(u, 0.16), 4, 0.8), p = createPerson({ u: 0.9 * u, shirt: 0xe06a8a });
  chest.position.set(cx, floor, 0);
  group.add(chest, lidPivot, gem, hearts, p.group);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.5, 'back'], hug: [1.2, 0.5], let: [4.1, 0.5], shut: [4.2, 0.4] });
      lidPivot.rotation.x = -1.6 * (pre ? 0 : T.open - T.shut);
      gem.visible = !pre && T.open > 0.3 && T.shut < 0.6; gem.position.set(cx, floor + 0.3 * u + 0.06 * u * Math.sin(v * 3), 0.02 * u); gem.idle(v);
      const hug = pre ? 0 : T.hug - T.let;
      p.group.position.set(cx + 0.38 * u - 0.12 * u * hug, floor, 0.12 * u); p.face(-1.0).reset();
      p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.3 * hug; p.raise('L', -0.4 * hug); p.raise('R', -0.4 * hug); p.lean(0.3 * hug); p.bone('head').rotation.z = 0.2 * hug * Math.sin(v * 3);
      p.update();
      for (let i = 0; i < 4; i++) { const f = ((v * 0.5 + i / 4) % 1); hearts.set(i, cx + 0.2 * u + 0.15 * u * Math.sin(f * 7 + i), floor + 0.7 * u + 0.6 * u * f, 0.1 * u, hug > 0.5 ? Math.sin(Math.PI * f) : 0); }
      hearts.commit();
    },
  };
}

function handWash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.5 * u, ty = floor + 0.85 * u;
  const tap = solidProp([[G.cyl(0.035 * u, 0.035 * u, 0.3 * u, 0.15 * u, 0.15 * u, -0.05 * u), 0xc8ccd4], [G.cyl(0.03 * u, 0.03 * u, 0.2 * u, 0.05 * u, 0.3 * u, -0.05 * u, 0, 0, Math.PI / 2), 0xc8ccd4], [G.cyl(0.03 * u, 0.035 * u, 0.06 * u, -0.05 * u, 0.27 * u, -0.05 * u), 0xc8ccd4], [G.box(0.08 * u, 0.03 * u, 0.03 * u, 0.15 * u, 0.33 * u, -0.05 * u), 0x4a8ae0], [G.cyl(0.32 * u, 0.25 * u, 0.12 * u, 0, -0.55 * u, -0.05 * u, 0, 0, 0, 24), 0xf4f4f8]], 0.3);
  tap.position.set(tx, ty - 0.3 * u, 0);
  const L = createHand({ u: 0.6 * u, side: 1, sleeve: 0x4a8a6a }), R = createHand({ u: 0.6 * u, side: -1, sleeve: 0x4a8a6a });
  L.pose('flat'); R.pose('flat');
  const water = many([[G.sphere(0.02 * u, 0, 0, 0, 0.8, 1.8, 0.8), 0x7ad0ff]], 10, 0.9), suds = many([[G.sphere(0.035 * u), 0xffffff]], 10, 0.8);
  group.add(tap, L.group, R.group, water, suds);
  const loop = 4.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const rub = pre ? 0 : between(v, 0.3, 0.6) * (1 - between(v, 3.2, 3.6)), r = Math.sin(v * 12) * rub;
      const hx = tx - 0.05 * u, hy = ty - 0.42 * u;
      L.group.rotation.set(0, 0, -1.3 + 0.2 * r); R.group.rotation.set(0, 0, 1.3 - 0.2 * r);
      handTo(L, hx - 0.04 * u + 0.03 * u * r, hy + 0.02 * u * r, 0.06 * u, L.bone('palm')); handTo(R, hx + 0.04 * u - 0.03 * u * r, hy - 0.02 * u * r, 0.03 * u, R.bone('palm'));
      L.group.position.x -= (1 - rub) * 0.3 * u; R.group.position.x += (1 - rub) * 0.3 * u; L.update(); R.update();
      L.group.position.y += 0.03 * u * Math.sin(v * 25) * bump(v, 3.6, 0.5); R.group.position.y += 0.03 * u * Math.sin(v * 25) * bump(v, 3.6, 0.5);   // shake dry
      for (let i = 0; i < 10; i++) { const f = ((v * 2 + i / 10) % 1); water.set(i, tx - 0.05 * u, ty - 0.03 * u - 0.6 * u * f, 0.0, pre ? 0 : v < 3.3 ? 1 : 0); }
      water.commit();
      for (let i = 0; i < 10; i++) { const a = i * 2.4 + v * 2; suds.set(i, hx + 0.12 * u * Math.cos(a), hy + 0.1 * u * Math.sin(a * 1.3), 0.08 * u, rub * (0.6 + 0.4 * Math.sin(a * 3))); }
      suds.commit();
    },
  };
}

function laundry(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.45 * u;
  const machine = solidProp([[G.box(0.6 * u, 0.7 * u, 0.4 * u, 0, 0.35 * u, 0), 0xf0f0f4], [G.torus(0.19 * u, 0.035 * u, Math.PI * 2, 0, 0.32 * u, 0.2 * u), 0xb8c0cc], [G.cyl(0.17 * u, 0.17 * u, 0.01 * u, 0, 0.32 * u, 0.19 * u, Math.PI / 2), 0x6ab8f0], [G.box(0.5 * u, 0.08 * u, 0.01 * u, 0, 0.62 * u, 0.2 * u), 0xd8dde6], [G.cyl(0.03 * u, 0.03 * u, 0.02 * u, 0.18 * u, 0.62 * u, 0.205 * u, Math.PI / 2), 0xe04040]], 0.3);
  machine.position.set(mx, floor, -0.05 * u);
  const clothes = many([[G.sphere(0.06 * u, 0, 0, 0, 1.3, 0.7, 0.6), 0xffffff]], 5, 0.4); clothes.instanceColor = null;
  const line = solidProp([[G.cyl(0.006 * u, 0.006 * u, 0.8 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xe0e0e0], [G.cyl(0.015 * u, 0.015 * u, 0.6 * u, -0.4 * u, -0.3 * u, 0), 0x8a6a4a], [G.cyl(0.015 * u, 0.015 * u, 0.6 * u, 0.4 * u, -0.3 * u, 0), 0x8a6a4a]]);
  line.position.set(mx + 0.85 * u, floor + 0.6 * u, -0.05 * u);
  const shirt = emblemProp('shirt', 0.3 * u, { color: 0x4a8ae0 }), shirt2 = emblemProp('shirt', 0.26 * u, { color: 0xe05a5a });
  group.add(machine, clothes, line, shirt, shirt2);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const spin = pre ? A.s * 2 : v < 2.0 ? v * 9 : 18 + 2 * (v - 2.0), shake = !pre && v < 2.0 ? 0.004 * u * Math.sin(v * 60) : 0;
      machine.position.x = mx + shake;
      for (let i = 0; i < 5; i++) { const a = spin + (i / 5) * Math.PI * 2; clothes.set(i, mx + 0.1 * u * Math.cos(a), floor + 0.32 * u + 0.1 * u * Math.sin(a), 0.17 * u, v < 2.1 ? 1 : 0, a); }
      clothes.commit();
      [shirt, shirt2].forEach((s, i) => {
        const f = pre ? 0 : between(v, 2.1 + i * 0.4, 2.7 + i * 0.4), [x, y] = arc([mx, floor + 0.32 * u], [mx + (0.68 + i * 0.32) * u, floor + 0.5 * u], 0.5 * u, f);
        s.visible = f > 0 && v < 4.6; s.position.set(x, y, 0.0); s.rotation.z = f >= 1 ? 0.1 * Math.sin(v * 5 + i) : f * 6; s.idle(0);
      });
    },
  };
}

function toiletDash(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, dx = B.maxX + 0.55 * u;
  const wall = solidProp([[G.box(0.62 * u, 1.05 * u, 0.04 * u, 0, 0.52 * u, -0.02 * u), 0xd8e4ec], [G.box(0.5 * u, 0.86 * u, 0.02 * u, 0, 0.43 * u, -0.005 * u), 0x203040]]);
  const door = new THREE.Group(), panel = solidProp([[G.box(0.46 * u, 0.82 * u, 0.03 * u, 0.23 * u, 0.41 * u, 0), 0x5a8ac0], [G.sphere(0.02 * u, 0.4 * u, 0.42 * u, 0.025 * u), 0xf0d060]]);
  door.position.set(dx - 0.23 * u, floor, 0.01 * u); door.add(panel);
  const sign = textPlane('WC', { h: 0.18 * u, color: '#ffffff', bg: '#2a6ad0' }); sign.position.set(dx, floor + 1.0 * u, 0.03 * u);
  const p = createPerson({ u: 0.9 * u, shirt: 0xf09030 });
  wall.position.set(dx, floor, 0);
  group.add(wall, door, sign, p.group);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [1.2, 0.25], dash: [1.3, 0.4, 'in'], shut: [1.7, 0.2], open2: [3.0, 0.3], out: [3.2, 1.0], shut2: [4.3, 0.3] });
      door.rotation.y = -1.4 * (T.open - T.shut + T.open2 - T.shut2);
      const inside = !pre && v > 1.7 && v < 3.15, x = pre || v < 1.3 ? dx + 0.55 * u : v < 1.7 ? dx + 0.55 * u * (1 - T.dash) : dx + 0.05 * u + 0.6 * u * T.out;
      p.group.visible = !inside; p.group.position.set(x, floor, v > 1.3 && v < 3.2 ? -0.02 * u : 0.1 * u);
      p.face(v > 3.0 && !pre ? 'right' : 'toward').reset();
      if (pre || v < 1.3) { const hop = Math.sin(v * 14); p.bone('legL').rotation.x = 0.5 * Math.max(0, hop); p.bone('legR').rotation.x = 0.5 * Math.max(0, -hop); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 0.6; p.bone('foreL').rotation.x = p.bone('foreR').rotation.x = 1.4; }
      else if (v > 3.0) { p.walk(v * 6, T.out < 1 ? 0.6 : 0); p.bone('body').rotation.z = 0.08 * Math.sin(v * 3); }
      p.update();
    },
  };
}

function switchOff(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, lx = B.maxX + 0.45 * u;
  const lamp = solidProp([[G.cyl(0.004 * u, 0.004 * u, 0.4 * u, 0, 0.2 * u, 0), 0x303030], [G.cone(0.16 * u, 0.12 * u, 0, -0.03 * u, 0), 0x3a5a8a]], 0.3);
  lamp.position.set(lx, B.maxY + 0.1 * u, 0);
  const bulb = solidProp([[G.sphere(0.06 * u, 0, 0, 0), 0xfff0a0]], 2), glow = solidProp([[new THREE.CircleGeometry(0.32 * u, 32), 0xfff4c0]], 0);
  glow.material.transparent = true; glow.material.depthWrite = false; glow.material.blending = THREE.AdditiveBlending;
  bulb.position.set(lx, B.maxY + 0.02 * u, 0); glow.position.set(lx, B.maxY - 0.1 * u, -0.1 * u);
  const plate = solidProp([[G.box(0.14 * u, 0.2 * u, 0.02 * u, 0, 0, 0), 0xf4f4f0]]), toggle = solidProp([[G.box(0.05 * u, 0.09 * u, 0.04 * u, 0, 0, 0.02 * u), 0xe8e0d0]]);
  const sx = lx + 0.45 * u, sy = floor + 0.5 * u; plate.position.set(sx, sy, -0.02 * u); toggle.position.set(sx, sy, -0.02 * u);
  const hand = createHand({ u: 0.6 * u, side: -1, sleeve: 0xd06a30 }), dark = veil(6 * u, 4 * u, 0x000000);
  hand.pose('point'); hand.group.rotation.z = 0.5; dark.position.set(B.cx, B.cy, 0.25 * u);
  group.add(lamp, bulb, glow, plate, toggle, hand.group, dark);
  const loop = 4.2, tipF = new THREE.Object3D();
  hand.bone('f0b').add(tipF); tipF.position.y = 0.13 * 0.6 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const press = pre ? 0 : bump(v, 0.5, 0.5) + bump(v, 2.6, 0.5), off = !pre && v > 0.75 && v < 2.85;
      toggle.rotation.x = off ? 0.5 : -0.5;
      bulb.material.userData.glow.value = off ? 0.05 : 2; glow.material.opacity = off ? 0 : 0.18; dark.material.opacity = off ? 0.55 : 0;
      hand.update(); handTo(hand, sx + 0.04 * u + (1 - press) * 0.12 * u, sy + 0.02 * u + (off ? -0.02 * u : 0.02 * u), 0.05 * u + (1 - press) * 0.1 * u, tipF);
    },
  };
}

function candleOut(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.4 * u;
  const candle = solidProp([[G.cyl(0.07 * u, 0.07 * u, 0.42 * u, 0, 0.21 * u, 0), 0xf6f0e0], [G.cyl(0.13 * u, 0.15 * u, 0.04 * u, 0, 0.02 * u, 0), 0xc8a040], [G.cyl(0.006 * u, 0.006 * u, 0.05 * u, 0, 0.44 * u, 0), 0x202020]]);
  const flame = solidProp([[G.sphere(0.05 * u, 0, 0.05 * u, 0, 0.8, 1.8, 0.8), 0xffb030], [G.sphere(0.025 * u, 0, 0.04 * u, 0.01 * u, 0.8, 1.5, 0.8), 0xffffc0]], 2);
  const smoke = many(PUFF(u, 0xc0c0c8), 5, 0.4);
  candle.position.set(cx, floor, 0); flame.position.set(cx, floor + 0.46 * u, 0);
  group.add(candle, flame, smoke);
  const loop = 4.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { flicker: [0.3, 1.0], out: [1.3, 0.35, 'in'], light: [3.8, 0.5, 'back'] });
      const k = pre ? 1 : (1 - T.out) + T.light, fl = 1 + 0.12 * Math.sin(t * 23) + 0.25 * T.flicker * Math.sin(t * 41) * (1 - T.out);
      flame.visible = k > 0.02; flame.scale.set(Math.max(1e-3, k), Math.max(1e-3, k * fl), Math.max(1e-3, k)); flame.rotation.z = 0.15 * Math.sin(t * 7) * T.flicker;
      wisps(smoke, 0, 5, cx, floor + 0.5 * u, v, u, { period: 1.6, rise: 0.7, sway: 0.08, on: !pre && v > 1.5 && v < 3.6 ? 1 : 0 });
      smoke.commit();
    },
  };
}

function giftOpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, gx = B.maxX + 0.45 * u;
  const box = cardBox(u, { w: 0.5, h: 0.42, color: 0xe04a7a }), ribbon = solidProp([[G.box(0.06 * u, 0.43 * u, 0.41 * u, 0, 0.21 * u, 0), 0xf8d040], [G.box(0.51 * u, 0.43 * u, 0.06 * u, 0, 0.21 * u, 0), 0xf8d040]]);
  box.position.set(gx, floor, 0); ribbon.position.set(gx, floor, 0);
  const star = burst(u, { s: 0.45, n: 5, color: 0xffe040 });
  group.add(box, ribbon, star);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { shake: [0, 0.6], open: [0.6, 0.35, 'back'], pop: [0.8, 0.7, 'back'], close: [3.6, 0.5] });
      box.rotation.z = 0.06 * Math.sin(v * 30) * (v < 0.6 && !pre ? 1 : 0);
      const open = pre ? 0 : T.open - T.close; box.flaps[0].rotation.z = 2.4 * open; box.flaps[1].rotation.z = -2.4 * open;
      const k = pre ? 0 : T.pop * (1 - T.close); star.visible = k > 0.01; star.scale.setScalar(Math.max(1e-3, k)); star.position.set(gx, floor + 0.45 * u + 0.45 * u * k, 0.05 * u); star.rotation.y = v * 3;
    },
  };
}

function bathTub(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.55 * u;
  const tub = solidProp([[G.box(0.8 * u, 0.32 * u, 0.36 * u, 0, 0.2 * u, 0), 0xf4f4f8], [G.box(0.82 * u, 0.04 * u, 0.38 * u, 0, 0.36 * u, 0), 0xffffff], ...[-0.34, 0.34].map((x) => [G.sphere(0.04 * u, x * u, 0.03 * u, 0.1 * u), 0xd8b040])], 0.3);
  tub.position.set(bx, floor, 0);
  const p = createPerson({ u: 0.85 * u, shirt: 0xffd2b0 }), bubbles = many([[G.sphere(0.045 * u), 0xffffff]], 12, 0.8), steam = many(PUFF(1.3 * u, 0xf4f4f8), 5, 0.6);
  const duck = solidProp([[G.sphere(0.06 * u, 0, 0.05 * u, 0, 1.2, 0.9, 1), 0xffd820], [G.sphere(0.04 * u, 0.05 * u, 0.11 * u), 0xffd820], [G.cone(0.015 * u, 0.04 * u, 0.1 * u, 0.1 * u, 0, -Math.PI / 2), 0xff7a20]], 0.5);
  group.add(p.group, tub, bubbles, steam, duck);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, 1e9), pre = A.u < 0, v = pre ? -1 : A.u;
      const sink = pre ? 0 : between(v, 0, 0.8);
      p.group.position.set(bx - 0.12 * u, floor + 0.18 * u - 0.18 * u * sink, -0.02 * u); p.face(0.3).reset(); p.raise('L', 1.6); p.raise('R', 1.6); p.bone('foreL').rotation.z = 1.2; p.bone('foreR').rotation.z = -1.2;
      p.bone('head').rotation.z = 0.15 * Math.sin(t * 0.8); p.update();
      for (let i = 0; i < 12; i++) { const f = ((t * 0.3 + i / 12) % 1); bubbles.set(i, bx + (i / 12 - 0.5) * 0.7 * u, floor + 0.4 * u + 0.25 * u * f * (i % 3 === 0 ? 2 : 0.2), 0.12 * u * (i % 2), i % 3 === 0 ? Math.sin(Math.PI * f) : 1); }
      bubbles.commit();
      duck.position.set(bx + 0.22 * u + 0.05 * u * Math.sin(t * 1.3), floor + 0.36 * u + 0.015 * u * Math.sin(t * 3), 0.12 * u); duck.rotation.z = 0.1 * Math.sin(t * 3);
      wisps(steam, 0, 5, bx, floor + 0.45 * u, t, u, { period: 2, rise: 0.6, sway: 0.15 });
      steam.commit();
    },
  };
}

function sneeze(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.4 * u;
  const p = createPerson({ u, shirt: 0x7a9ad0 }), nose = solidProp([[G.sphere(0.03 * u), 0xff4040]], 0.6), spray = many([[G.sphere(0.035 * u), 0xc8f0ff]], 18, 0.9);
  const tissue = solidProp([[G.box(0.12 * u, 0.14 * u, 0.005 * u, 0, 0, 0), 0xffffff]], 0.6);
  p.rig.attach('head', nose, 0.5); nose.position.set(0, 0, 0.13 * u);
  group.add(p.group, spray, tissue);
  const loop = 4.4, np = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { ah1: [0.2, 0.4], ah2: [0.7, 0.5], choo: [1.25, 0.15, 'in'], rec: [1.4, 0.8] });
      const back = pre ? 0 : 0.25 * T.ah1 + 0.25 * T.ah2 - 0.5 * T.choo, fwd = pre ? 0 : T.choo * (1 - T.rec) * 0.5;
      p.group.position.set(px, floor, 0.05 * u); p.face(-1.0).reset(); p.lean(fwd - back * 0.3); p.bone('head').rotation.x = -back * 1.4 + fwd;
      p.raise('R', 0.3); p.bone('armR').rotation.x = 1.8 * bump(v, 1.1, 0.9); p.bone('foreR').rotation.x = 1.8 * bump(v, 1.1, 0.9);
      p.group.position.x += !pre && v > 2.4 ? 0.006 * u * tremble(v, 10) : 0;          // shivers
      p.update();
      bonePoint(p, 'head', 0.5, np);
      const f = pre ? 0 : between(v, 1.35, 2.0);
      for (let i = 0; i < 18; i++) { const a = (i / 18 - 0.5) * 1.0, r = 0.8 * u * f; spray.set(i, np.x - Math.cos(a) * r - 0.1 * u, np.y + Math.sin(a) * r * 0.6, np.z + 0.1 * u, f > 0 && f < 1 ? 1 - f * 0.5 : 0); }
      spray.commit();
      const tf = pre ? 0 : between(v, 1.4, 2.6), [tx, ty] = arc([np.x, np.y], [np.x - 0.9 * u, np.y + 0.1 * u], 0.4 * u, tf);
      tissue.visible = tf > 0 && tf < 1; tissue.position.set(tx, ty, np.z + 0.05 * u); tissue.rotation.set(tf * 5, tf * 3, tf * 7);
    },
  };
}

export const SCENES = { 'shop-basket': shopBasket, 'luggage-pile': luggagePile, 'hug-treasure': hugTreasure, 'hand-wash': handWash, laundry, 'toilet-dash': toiletDash, 'switch-off': switchOff, 'candle-out': candleOut, 'gift-open': giftOpen, 'bath-tub': bathTub, sneeze };
