// Batch 5 word scenes.
//   hourglass-end  終わる: the sand in an hourglass runs down; the last grain drops, a bell dings and it glows: time's up
//   bike-bell      自転車: a kid rides a bicycle across, ringing the bell (チリン, rings of sound)
//   mannequin      洋服: a mannequin on a stand changes outfit with a sparkle: a red dress, a suit and tie, a hat and coat
import * as THREE from 'three';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function hourglassEnd(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), hx = B.maxX + 0.35 * u, hy = B.cy, H = 0.24 * u, R = 0.14 * u, SAND = 0xf0c060;
  const frame = solidProp([[G.box(0.36 * u, 0.04 * u, 0.2 * u, 0, H + 0.02 * u, 0), 0x8a5a30], [G.box(0.36 * u, 0.04 * u, 0.2 * u, 0, -H - 0.02 * u, 0), 0x8a5a30], [G.cyl(0.012 * u, 0.012 * u, 2 * H, -0.15 * u, 0, 0), 0x8a5a30], [G.cyl(0.012 * u, 0.012 * u, 2 * H, 0.15 * u, 0, 0), 0x8a5a30]], 0.35);
  const glass = solidProp([[G.cone(R, H, 0, H / 2, 0, Math.PI), 0xd8f0ff], [G.cone(R, H, 0, -H / 2, 0), 0xd8f0ff]], 0.3); glass.material.transparent = true; glass.material.opacity = 0.3;
  const top = solidProp([[G.cone(R * 0.9, H * 0.9, 0, -H * 0.45, 0, Math.PI), SAND]], 0.5), bot = solidProp([[G.cone(R * 0.9, H * 0.9, 0, H * 0.45, 0), SAND]], 0.5), stream = solidProp([[G.cyl(0.006 * u, 0.006 * u, 2 * H * 0.9, 0, 0, 0), SAND]], 0.6);
  const hg = new THREE.Group(); hg.add(frame, glass, top, bot, stream); hg.position.set(hx, hy, 0); top.position.y = H; bot.position.y = -H;
  const rings = many([[G.torus(0.1 * u, 0.008 * u), 0xffe060]], 3, 0.9), glow = burst(u, { s: 0.7, n: 12, color: 0xff7040 });
  group.add(glow, hg, rings);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.3 : between(v, 0.1, 3.0), flip = between(v, 4.6, 5.2);
      top.scale.setScalar(pop(Math.cbrt(1 - f))); bot.scale.setScalar(pop(Math.cbrt(f))); stream.visible = !pre && f > 0 && f < 1; hg.rotation.z = Math.PI * flip;
      for (let i = 0; i < 3; i++) { const g = between(v, 3.0 + 0.15 * i, 3.8 + 0.15 * i); rings.set(i, hx, hy + H + 0.1 * u, 0.02 * u, g > 0 && g < 1 ? 0.6 + 2 * g : 0); } rings.commit();
      const gl = pre ? 0 : bump(v, 3.0, 1.6); glow.visible = gl > 0; glow.scale.setScalar(pop(gl)); glow.position.set(hx, hy, -0.1 * u); glow.rotation.z = t;
    },
  };
}

function bikeBell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const bike = emblemProp('bike', 0.55 * u, { color: 0xe04848 }), kid = createPerson({ u: 0.6 * u, shirt: 0x40a0e0 }), rings = many([[G.torus(0.05 * u, 0.006 * u), 0xffe060]], 3, 0.9), ring = textPlane('チリン', { h: 0.12 * u, color: '#ffe060', bg: null });
  group.add(bike, kid.group, rings, ring);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.4 : v / loop, x = B.maxX + 0.1 * u + 1.0 * u * f, k = pop(Math.min(1, Math.min(f, 1 - f) * 8)), ped = pre ? 0 : v * 10;
      bike.position.set(x, floor + 0.25 * u, 0.0); bike.scale.setScalar(0.55 * u * k); bike.idle(pre ? 0 : v * 2);
      kid.reset().face('right'); kid.bone('legL').rotation.x = 1.0 + 0.5 * Math.sin(ped); kid.bone('legR').rotation.x = 1.0 - 0.5 * Math.sin(ped); kid.bone('shinL').rotation.x = -1.0 - 0.4 * Math.cos(ped); kid.bone('shinR').rotation.x = -1.0 + 0.4 * Math.cos(ped); kid.bone('armL').rotation.x = kid.bone('armR').rotation.x = 1.2; kid.lean(0.25);
      kid.group.position.set(x - 0.02 * u, floor + 0.22 * u, 0.04 * u); kid.group.scale.setScalar(k); kid.update();
      const ding = Math.max(bump(v, 1.0, 0.8), bump(v, 2.4, 0.8));
      for (let i = 0; i < 3; i++) rings.set(i, x + 0.15 * u, floor + 0.55 * u, 0.05 * u, ding > 0 ? (0.6 + 1.2 * i) * ding : 0); rings.commit();
      ring.visible = ding > 0; ring.scale.setScalar(pop(ding)); ring.position.set(x + 0.2 * u, floor + 0.85 * u, 0.05 * u);
    },
  };
}

function mannequin(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.45 * u, pu = 0.9 * u, PALE = 0xe8e0d8;
  const stand = solidProp([[G.cyl(0.14 * u, 0.16 * u, 0.04 * u, 0, 0.02 * u, 0, 0, 0, 0, 20), 0x3a3a44], [G.cyl(0.012 * u, 0.012 * u, 0.12 * u, 0, 0.08 * u, 0), 0x3a3a44]], 0.35); stand.position.set(mx, floor, 0);
  const m = createPerson({ u: pu, shirt: 0xe04848, pants: 0xe04848, skin: PALE, hair: PALE, eyes: PALE, shoes: 0x2a2a30 });
  const skirt = solidProp([[G.cone(0.2 * pu, 0.35 * pu, 0, -0.16 * pu, 0), 0xe04848]], 0.5), tie = solidProp([[G.box(0.08 * pu, 0.09 * pu, 0.01 * pu, 0, -0.04 * pu, 0), 0xffffff], [G.box(0.03 * pu, 0.13 * pu, 0.012 * pu, 0, -0.1 * pu, 0.004 * pu), 0x3a6ad8]], 0.45), hat = solidProp([[G.cyl(0.11 * pu, 0.12 * pu, 0.08 * pu, 0, 0.04 * pu, 0), 0x8a5a30], [G.cyl(0.2 * pu, 0.2 * pu, 0.012 * pu, 0, 0.0, 0), 0x8a5a30]], 0.45);
  m.rig.attach('body', skirt, 0.1); m.rig.attach('body', tie, 0.95).position.z = 0.1 * pu; m.rig.attach('head', hat, 0.85);
  const sparkle = burst(u, { s: 0.8, n: 10, color: 0xfff0a0 });
  group.add(stand, sparkle, m.group);
  const loop = 6.0, LOOKS = [[0xe04848, 0xe04848], [0x23304a, 0x23304a], [0xc8a060, 0x5a6a8a]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, k = pre ? 0 : Math.min(2, Math.floor(v / 2)), [top, bottom] = LOOKS[k];
      ['body', 'armL', 'armR'].forEach((n) => m.rig.setColor(n, top)); ['legL', 'legR', 'shinL', 'shinR'].forEach((n) => m.rig.setColor(n, bottom));
      skirt.visible = k === 0; tie.visible = k === 1; hat.visible = k === 2;
      m.reset().face(0); m.raise('L', 0.3); m.raise('R', 0.3); m.group.position.set(mx, floor + 0.14 * u, 0.0); m.group.rotation.y = 0.4 * Math.sin(v * Math.PI); m.update();
      const s = pre ? 0 : Math.max(bump(v % 2, 0, 0.5), 0); sparkle.visible = s > 0; sparkle.scale.setScalar(pop(s)); sparkle.position.set(mx, floor + 0.6 * u, -0.1 * u); sparkle.rotation.z = t;
    },
  };
}

export const SCENES = { 'hourglass-end': hourglassEnd, 'bike-bell': bikeBell, mannequin };
