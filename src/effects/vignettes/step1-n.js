// Step 1 scenes, part N: buying.
//   cart-shop   買: a shopping cart rolls along under a row of goods; things hop off the shelf into it, the till beeps
//               and a long receipt curls out. outcome vending: a coin goes into a vending machine, a button lights and
//               a can drops out into the tray (買う)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const GOODS = [0xff5a5a, 0xffd040, 0x5ab0ff, 0x60d070];
function cartShop(ctx, spec, stage) {
  if (spec.outcome === 'vending') return vending(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u;
  const shelf = solidProp([[G.box(1.0 * u, 0.03 * u, 0.2 * u, 0.5 * u, 0, 0), 0xc89a60], [G.box(0.03 * u, 0.7 * u, 0.2 * u, 0.0, -0.35 * u, 0), 0xa87a40], [G.box(0.03 * u, 0.7 * u, 0.2 * u, 1.0 * u, -0.35 * u, 0), 0xa87a40]], 0.35);
  const goods = many([[G.box(0.1 * u, 0.13 * u, 0.08 * u, 0, 0.065 * u, 0), 0xffffff]], 4, 0.6); GOODS.forEach((c, i) => goods.setColorAt(i, new THREE.Color(c)));
  const cart = solidProp([[G.box(0.32 * u, 0.02 * u, 0.2 * u, 0, 0.12 * u, 0), 0xb8c0cc], [G.box(0.32 * u, 0.16 * u, 0.01 * u, 0, 0.2 * u, 0.1 * u), 0xb8c0cc], [G.box(0.32 * u, 0.16 * u, 0.01 * u, 0, 0.2 * u, -0.1 * u), 0xb8c0cc], [G.box(0.01 * u, 0.16 * u, 0.2 * u, -0.16 * u, 0.2 * u, 0), 0xb8c0cc], [G.box(0.01 * u, 0.16 * u, 0.2 * u, 0.16 * u, 0.2 * u, 0), 0xb8c0cc], [G.cyl(0.012 * u, 0.012 * u, 0.2 * u, -0.22 * u, 0.32 * u, 0, Math.PI / 2), 0x3a7ae0], [G.box(0.08 * u, 0.012 * u, 0.012 * u, -0.19 * u, 0.29 * u, 0.1 * u, 0.6), 0xb8c0cc], ...[-0.12, 0.12].map((x) => [G.cyl(0.03 * u, 0.03 * u, 0.22 * u, x * u, 0.03 * u, 0, Math.PI / 2), 0x202428])], 0.45);
  const receipt = solidProp([[G.box(0.1 * u, 1, 0.004 * u, 0, -0.5, 0), 0xffffff]], 0.8), beep = textPlane('ピッ', { h: 0.1 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  shelf.position.set(x0, floor + 0.72 * u, -0.25 * u);
  group.add(shelf, goods, cart, receipt, beep);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0.1, 3.2), back = pre ? 0 : between(v, 5.4, 6.2), cx = x0 + 0.15 * u + 0.75 * u * f;
      cart.position.set(cx, floor, 0.05 * u); cart.visible = !pre && back < 0.98; cart.scale.setScalar(grow(1 - back));
      for (let i = 0; i < 4; i++) { const sx = x0 + (0.15 + 0.24 * i) * u, at = 0.3 + 0.7 * i, h = pre ? 0 : between(v, at, at + 0.4), inCart = h >= 1; goods.set(i, inCart ? cx + (i - 1.5) * 0.06 * u : sx + (cx - sx) * h, inCart ? floor + 0.13 * u : floor + 0.735 * u + (0.13 - 0.735) * u * h + 0.25 * u * Math.sin(Math.PI * h), inCart ? 0.05 * u : -0.25 * u + 0.3 * u * h, (1 - back) * (inCart ? 0.85 : 1)); }
      goods.commit();
      const r = pre ? 0 : between(v, 3.4, 4.6) * (1 - back); receipt.visible = r > 0.01; receipt.position.set(cx + 0.25 * u, floor + 0.55 * u, 0.06 * u); receipt.scale.set(1, Math.max(1e-3, 0.45 * u * r), 1); receipt.rotation.z = 0.1 * Math.sin(v * 3);
      const b = pre ? 0 : bump(v, 3.3, 0.6); beep.visible = b > 0.05; beep.scale.setScalar(grow(b)); beep.position.set(cx + 0.25 * u, floor + 0.7 * u, 0.07 * u);
    },
  };
}
function vending(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.45 * u;
  const machine = solidProp([[G.box(0.5 * u, 0.95 * u, 0.3 * u, 0, 0.475 * u, 0), 0xe04848], [G.box(0.36 * u, 0.48 * u, 0.01 * u, -0.04 * u, 0.6 * u, 0.15 * u), 0xd8f0ff], ...[0, 1, 2].map((r) => [0, 1, 2].map((c) => [G.cyl(0.035 * u, 0.035 * u, 0.1 * u, (-0.15 + 0.11 * c) * u, (0.45 + 0.15 * r) * u, 0.12 * u), GOODS[(r + c) % 4]])).flat(), [G.box(0.3 * u, 0.1 * u, 0.02 * u, -0.04 * u, 0.15 * u, 0.15 * u), 0x202028], [G.box(0.04 * u, 0.06 * u, 0.012 * u, 0.19 * u, 0.6 * u, 0.152 * u), 0x404040]], 0.4);
  const buttons = many([[G.cyl(0.018 * u, 0.018 * u, 0.012 * u, 0, 0, 0, Math.PI / 2), 0xffffff]], 3, 1.2), coin = solidProp([[G.cyl(0.035 * u, 0.035 * u, 0.01 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xffc030]], 0.9), can = solidProp([[G.cyl(0.045 * u, 0.045 * u, 0.13 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0x3a7ae0], [G.cyl(0.046 * u, 0.046 * u, 0.04 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xffffff]], 0.6);
  machine.position.set(mx, floor, -0.05 * u);
  group.add(machine, buttons, coin, can);
  const loop = 5.6, off = new THREE.Color(0x606870), lit = new THREE.Color(0x60ff90);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { coin: [0.3, 0.6, 'in'], press: [1.3, 0.2], drop: [1.8, 0.4, 'in'], take: [4.6, 0.6] });
      coin.visible = !pre && T.coin < 1; coin.position.set(mx + 0.14 * u + 0.4 * u * (1 - T.coin), floor + 0.6 * u + 0.2 * u * (1 - T.coin), 0.11 * u);
      for (let i = 0; i < 3; i++) { buttons.set(i, mx + (-0.15 + 0.11 * i) * u, floor + 0.32 * u, 0.115 * u - (i === 1 ? 0.005 * u * bump(v, 1.3, 0.3) : 0), 1); buttons.setColorAt(i, T.coin >= 1 && T.take < 0.5 && (i === 1 || v < 1.3) ? lit : off); }
      buttons.commit(); buttons.instanceColor.needsUpdate = true;
      const d = T.drop; can.visible = !pre && d > 0 && T.take < 1; can.position.set(mx - 0.04 * u + 0.5 * u * T.take, floor + 0.62 * u - 0.45 * u * d + 0.15 * u * T.take, 0.12 * u + 0.1 * u * T.take); can.rotation.z = 0.3 * Math.sin(v * 10) * (d < 1 ? 1 : 0);
    },
  };
}

export const SCENES = { 'cart-shop': cartShop };
