// Step 1 scenes, part N: buying.
//   cart-shop   買: a person pushes a shopping cart along a shelf (hands on the handle), stops, takes a can and then an apple
//               off the shelf with one hand and drops each into the cart, then pushes on to the till: ピッ, and a long
//               receipt curls out. outcome vending: a person walks up to a vending machine, puts a coin in its slot,
//               presses the button, the can drops into the tray, she bends, takes it out and holds it up, happy (買う)
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { many, HEART } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { createModel } from '../models.js';
import { smooth } from '../pieces/util.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, person, hearts, turnTo } from './q-common.js';

const GOODS = [0xff5a5a, 0xffd040, 0x5ab0ff, 0x60d070];
const V3 = THREE.Vector3, W = new V3(), W2 = new V3();
const sm = (v, a, b) => smooth(between(v, a, b));
const DOWN = new V3(0, -1, 0), UPV = new V3(0, 1, 0), AWAY = new V3(0, 0, -1);
const HANDLE_YAW = Math.PI / 2;          // turns the cart model so its long axis runs along x
// a model standing on y = 0, wrapped so that its origin is its middle (a held thing is placed by its middle)
function centred(name, height) { const m = createModel(name, { height }), g = new THREE.Group(); m.group.position.y = -height / 2; g.add(m.group); return g; }
// the fist's middle (not the wrist) goes to `target` (world): pressing with the fist
function reach(p, side, target, k, opts) {
  if (k <= 0) return;
  for (let i = 0; i < 2; i++) p.handTo(side, target.clone().sub(p.fistMid(side, W2).sub(p.fist(side, W))), k, opts);
}

function cartShop(ctx, spec, stage) {
  if (spec.outcome === 'vending') return vending(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u;
  const p = person(spec.who, u), CH = 0.47 * u;
  const cartM = createModel('marketCart', { height: CH }), cart = new THREE.Group(); cartM.group.rotation.y = HANDLE_YAW; cart.add(cartM.group);
  const tillM = createModel('marketTill', { height: 0.38 * u }), till = new THREE.Group(); till.add(tillM.group);
  // the shelf: a back panel, two posts and four boards; goods (instanced boxes) on the 2nd and top boards
  const SZ = -0.47 * u, BOARDS = [0.02, 0.29, 0.55, 0.81], SB = floor + 0.55 * u;
  const shelf = solidProp([[G.box(0.9 * u, 0.95 * u, 0.02 * u, 0, 0.475 * u, SZ), 0xb89060], ...BOARDS.map((y) => [G.box(0.9 * u, 0.025 * u, 0.28 * u, 0, y * u, SZ + 0.14 * u), 0xc89a60]),
    ...[-0.44, 0.44].map((x) => [G.box(0.03 * u, 0.95 * u, 0.28 * u, x * u, 0.475 * u, SZ + 0.14 * u), 0xa87a40])], 0.4);
  shelf.position.set(x0 + 0.65 * u, floor, 0);
  const filler = many([[G.box(0.1 * u, 0.12 * u, 0.1 * u, 0, 0.06 * u, 0), 0xffffff]], 8, 0.6);
  for (let i = 0; i < 8; i++) filler.setColorAt(i, new THREE.Color(GOODS[i % 4]));
  filler.instanceColor.needsUpdate = true;
  for (let i = 0; i < 8; i++) filler.set(i, x0 + 0.65 * u + ((i % 4) - 1.5) * 0.2 * u, floor + (i < 4 ? 0.3 : 0.82) * u, -0.4 * u, 1);
  filler.commit();
  const items = [{ m: centred('foodCan', 0.12 * u), h: 0.12 * u }, { m: centred('foodApple', 0.1 * u), h: 0.1 * u }];
  const receipt = solidProp([[G.box(0.1 * u, 1, 0.004 * u, 0, -0.5, 0), 0xffffff]], 0.8), beep = textPlane('ピッ', { h: 0.1 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  group.add(p.group, cart, till, shelf, filler, ...items.map((i) => i.m), receipt, beep);
  const loop = 9.9, T0 = [1.6, 4.1], px1 = x0 + 0.5 * u, stepD = 0.15 * u, px2 = px1 + stepD + 0.5 * u, CX = 0.37 * u;
  const HX = -0.27 * u, HY = CH - 0.01 * u, HZ = 0.12 * u, tillX = px2 + CX + 0.6 * u, RH = 0.012 * u, IR = 0.05 * u;
  till.position.set(tillX, floor, -0.33 * u);
  const shelfAt = [new V3(px1 + 0.17 * u, SB + 0.0125 * u + items[0].h / 2, -0.3 * u), new V3(px1 + stepD + 0.17 * u, SB + 0.0125 * u + items[1].h / 2, -0.3 * u)];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      group.updateWorldMatrix(true, true);
      const ws = group.getWorldScale(W).y;
      const w1 = pre ? 0 : sm(v, 0.2, 1.5), w2 = pre ? 0 : sm(v, 6.1, 7.2), st = pre ? 0 : sm(v, 3.55, 4.0), back = pre ? 0 : sm(v, 9.0, 9.6);
      const px = x0 + 0.5 * u * w1 + stepD * st + (px2 - px1 - stepD) * w2, cx = px + CX;
      const walking = (w1 > 0 && w1 < 1) || (st > 0 && st < 1) || (w2 > 0 && w2 < 1);
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(px, floor, 0); p.group.rotation.y = RIGHT - 0.15; p.group.scale.setScalar(grow(1 - back));
      cart.position.set(cx, floor, 0); cart.scale.setScalar(grow(1 - back));
      const toW = (x) => group.localToWorld(x.clone()), handle = (z) => new V3(cx + HX, floor + HY, z);
      p.grip('R', toW(handle(HZ)), DOWN, RH * ws, 1, { out: 0.5, down: 0.6 });
      // the left hand: handle -> shelf item -> over the cart -> back to the handle, for each item
      let lc = handle(-HZ), lt = DOWN, lr = RH, held = -1;
      items.forEach((it, i) => {
        const t0 = T0[i], S = shelfAt[i], D = new V3(cx - 0.14 * u, floor + 0.62 * u, 0), rest = new V3(cx - 0.12 * u + i * 0.12 * u, floor + 0.08 * u + it.h / 2, (i ? -0.04 : 0.04) * u);
        const a = pre ? 0 : sm(v, t0, t0 + 0.6), c = pre ? 0 : sm(v, t0 + 0.75, t0 + 1.5), r = pre ? 0 : sm(v, t0 + 1.6, t0 + 2.1), fall = pre ? 0 : between(v, t0 + 1.6, t0 + 1.95);
        if (a > 0 && r < 1) {
          lc = handle(-HZ).lerp(S, a).lerp(D, c).lerp(handle(-HZ), r); lc.y += 0.05 * u * Math.sin(Math.PI * c) * (1 - r);
          lt = DOWN.clone().lerp(AWAY, a).lerp(UPV, c).lerp(DOWN, r).normalize(); lr = RH + (IR - RH) * a * (1 - r);
        }
        if (v >= t0 + 0.7 && v < t0 + 1.6) held = i;
        else if (v >= t0 + 1.6) it.m.position.copy(D).lerp(rest, fall * fall * fall);
        else it.m.position.copy(S);
        it.m.scale.setScalar(grow(v >= t0 + 1.6 ? 1 - back : 1));
      });
      p.grip('L', toW(lc), lt, lr * ws, 1, { out: 0.5, down: 0.6 });
      if (held >= 0) p.hold(items[held].m, 'L', group, IR * ws);
      // the till beeps, a receipt curls out
      const b = pre ? 0 : bump(v, 7.5, 0.6), r = pre ? 0 : sm(v, 7.6, 8.6) * (1 - back);
      receipt.visible = r > 0.01; receipt.position.set(tillX + 0.1 * u, floor + 0.3 * u, -0.1 * u); receipt.scale.set(1, Math.max(1e-3, 0.2 * u * r), 1); receipt.rotation.set(-0.25 * r, 0, 0.12 * Math.sin(v * 3) + 0.1);
      beep.visible = b > 0.05; beep.scale.setScalar(grow(b)); beep.position.set(tillX, floor + 0.62 * u, -0.2 * u);
    },
  };
}

function vending(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.85 * u, MY = -0.8;
  const p = person(spec.who, u), mach = new THREE.Group();
  mach.position.set(mx, floor, -0.05 * u); mach.rotation.y = MY; mach.updateMatrix();
  const cans = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cans.push([G.cyl(0.035 * u, 0.035 * u, 0.1 * u, (-0.04 + 0.1 * c) * u, (0.5 + 0.13 * r) * u, 0.162 * u), GOODS[(r + c) % 4]]);
  const machine = solidProp([[G.box(0.5 * u, 0.95 * u, 0.3 * u, 0, 0.475 * u, 0), 0xe04848], [G.box(0.32 * u, 0.5 * u, 0.01 * u, 0.06 * u, 0.62 * u, 0.15 * u), 0xd8f0ff], ...cans,
    [G.box(0.4 * u, 0.12 * u, 0.02 * u, 0, 0.16 * u, 0.151 * u), 0x202028], [G.box(0.4 * u, 0.02 * u, 0.1 * u, 0, 0.1 * u, 0.2 * u), 0x404048],
    [G.box(0.06 * u, 0.08 * u, 0.012 * u, -0.17 * u, 0.66 * u, 0.152 * u), 0x202028], [G.box(0.01 * u, 0.05 * u, 0.014 * u, -0.17 * u, 0.66 * u, 0.152 * u), 0xffc030]], 0.4);
  const buttons = many([[G.cyl(0.02 * u, 0.02 * u, 0.012 * u, 0, 0, 0, Math.PI / 2), 0xffffff]], 3, 1.2);
  const coin = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.008 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xffc030]], 0.9);
  const can = centred('sodaCan', 0.13 * u), hs = many(HEART(u, 0.09), 3, 1);
  mach.add(machine, buttons, coin, can);
  group.add(p.group, mach, hs);
  const M = (x, y, z) => new V3(x * u, y * u, z * u);                                  // a point in the machine frame
  const toG = (x) => x.clone().applyMatrix4(mach.matrix);                              // machine frame -> group space
  const loop = 8.5, off = new THREE.Color(0x606870), lit = new THREE.Color(0x60ff90);
  const stand = toG(M(-0.54, 0, 0.3)), standX = stand.x, standZ = stand.z, step2 = 0.1 * u, yaw = RIGHT - 0.3;
  const slotY = 0.66, ledgeY = 0.11, canR = 0.065, coinR = 0.03 * u;
  const canTop = M(-0.04, 0.5, 0.162), canLand = M(-0.04, ledgeY + canR, 0.2);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      group.updateWorldMatrix(true, true);
      const ws = group.getWorldScale(W).y, toW = (x) => group.localToWorld(x.clone());
      const w1 = pre ? 0 : sm(v, 0.1, 1.3), st = pre ? 0 : sm(v, 4.7, 5.1), back = pre ? 0 : sm(v, 7.7, 8.2);
      const px = standX - 0.3 * u * (1 - w1) + step2 * st, walking = (w1 > 0 && w1 < 1) || (st > 0 && st < 1);
      const hop = pre ? 0 : Math.abs(Math.sin(between(v, 6.6, 7.6) * Math.PI * 2));
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(px, floor + 0.03 * u * hop * (v > 6.6 && v < 7.6 ? 1 : 0), standZ); p.group.rotation.y = turnTo(yaw, 0.1, pre ? 0 : sm(v, 6.0, 6.6)); p.group.scale.setScalar(grow(1 - back));
      const left = p.local(0.1, 0, 0, W).sub(p.local(0, 0, 0, W2)).normalize().clone();   // the way her left points
      // the coin: in her right hand from the start; she holds it to the slot and pushes it in
      const k1 = pre ? 0 : sm(v, 1.3, 1.8) * (1 - sm(v, 2.8, 3.3)), toSlot = sm(v, 1.3, 2.2), pushIn = sm(v, 2.2, 2.55);
      const K = toG(M(-0.17, slotY, 0.34)).lerp(toG(M(-0.17, slotY, 0.175)), toSlot).lerp(toG(M(-0.17, slotY, 0.1)), pushIn);
      p.grip('R', toW(K), left, coinR * ws, k1, { out: 0.5, down: 0.7 });
      coin.visible = pushIn < 0.95 && back < 0.5; coin.rotation.set(0, 0, 0);
      p.hold(coin, 'R', mach, coinR * ws);
      // press the middle button with the fist
      const pk = pre ? 0 : sm(v, 3.4, 3.9) * (1 - sm(v, 4.1, 4.6)), push = bump(v, 3.9, 0.3);
      reach(p, 'R', toW(toG(M(-0.17, 0.42, 0.185 - 0.012 * push))), pk, { out: 0.5, down: 0.7 });
      // the can drops from the window into the tray
      const d = pre ? 0 : between(v, 4.3, 4.85), fall = d * d;
      // she takes it: bends, the palm against its side (toward her body), then holds it up beside her face
      const ga = pre ? 0 : sm(v, 5.0, 5.6), lf = pre ? 0 : sm(v, 5.9, 6.6);
      p.bow(0.42 * ga * (1 - lf));
      const handC = toG(canLand).lerp(group.worldToLocal(p.local(-0.2, 0.74, 0.28, new V3())), lf), fwd = p.local(0, 0, 0.1, W).sub(p.local(0, 0, 0, W2)).normalize().clone();
      p.grip('R', toW(handC), left.clone().lerp(fwd, lf).normalize(), canR * u * ws, ga, { out: 0.6, down: 0.6 });
      can.visible = !pre && d > 0 && back < 0.99; can.rotation.set(0, 0, 0);
      if (v < 5.65) can.position.copy(canTop).lerp(canLand, fall); else p.hold(can, 'R', mach, canR * u * ws);
      can.scale.setScalar(grow(1 - back));
      for (let i = 0; i < 3; i++) { buttons.set(i, -0.17 * u, (0.5 - 0.08 * i) * u, 0.158 * u - (i === 1 ? 0.012 * u * push : 0), 1); buttons.setColorAt(i, pushIn >= 1 && v < 5.6 && (i === 1 || v < 3.9) ? lit : off); }
      buttons.commit(); buttons.instanceColor.needsUpdate = true;
      hearts(hs, 3, px - 0.05 * u, floor + 0.95 * u, standZ + 0.05 * u, pre ? -1 : v, 6.7, u);
    },
  };
}

export const SCENES = { 'cart-shop': cartShop };
