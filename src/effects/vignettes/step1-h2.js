// Step 1 scenes of step1-h.js, third round (the headset review of 出る 出口 電話 足 前), built from models where they exist:
//   awayDoor   出る / 出口 (turtle-out: door, exit): the viewer stands INSIDE a room; a person with their back to us walks (door:
//              calm walk, a green floor arrow and a small EXIT sign) or runs (exit: the big glowing 出口 sign lights first) away
//              from us to a door in the far wall; it opens outward onto bright daylight, they go through and are gone, it shuts
//   phoneCable 電話 (lightning-bulb: phone): lightning strikes a little junction post; a cable lies along the ground from it
//              and plugs into the side of an old phone; sparks run along the cable into the phone, which rings and hops
//   feetWalk   足 (feet-walk): two smooth bare feet (a lofted heel / arch / ball, ankle stump, five graded toes with nails)
//              on a sand slope tilted toward you: they walk heel to toe leaving prints, stop, and wiggle their toes
//   boatRace   前 (hen-lead): two rowing boats with a rower each; one rows ahead, a ring and an arrow mark it: in front
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor, SKIN } from './model-kit.js';
import { createModel } from '../models.js';
import { many } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp, kitMaterial, mergeColored } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const lerp = (a, b, f) => a + (b - a) * f;
const PI = Math.PI;

// a soft round glow (additive, see-through): a plane `w` x `h` with a radial gradient in `color` (css), 1 draw call
function glowPlane(w, h, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, color); r.addColorStop(0.45, color.replace(/[\d.]+\)$/, '0.35)')); r.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.frustumCulled = false; return m;
}

// ---- 出る / 出口: a room, a door in the far wall, daylight beyond ----
const flatArrow = (u) => [[new THREE.BoxGeometry(0.09 * u, 0.02 * u, 0.26 * u).translate(0, 0.01 * u, 0.13 * u), 0x30e070],
  [new THREE.ConeGeometry(0.12 * u, 0.2 * u, 3).rotateX(-PI / 2).scale(1, 0.12, 1).translate(0, 0.012 * u, -0.1 * u), 0x30e070]];

export function awayDoor(ctx, spec, stage) {
  const exit = spec.outcome === 'exit', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.95 * u;
  const W = (exit ? 1.6 : 1.4) * u, WH = 1.45 * u, DW = (exit ? 0.7 : 0.54) * u, DH = (exit ? 1.1 : 1.05) * u, T = 0.1 * u, Z0 = -0.45 * u, side = (W - DW) / 2;
  const wall = exit ? 0x8f9bab : 0xece2cc, wall2 = exit ? 0x7a8696 : 0xd8cdb4, ground = exit ? 0x7d828c : 0xb98650;
  const root = new THREE.Group(); root.position.set(ax, floor, 0); group.add(root);
  // the room: the far wall with the doorway, a floor, two side walls (we stand in it, looking at the far wall)
  const room = solidProp([
    [G.box(side, WH, T, -(DW + side) / 2, WH / 2, Z0), wall], [G.box(side, WH, T, (DW + side) / 2, WH / 2, Z0), wall], [G.box(DW + 0.02 * u, WH - DH, T, 0, DH + (WH - DH) / 2, Z0), wall],
    [G.box(W + 0.1 * u, 0.04 * u, 1.55 * u, 0, -0.02 * u, Z0 + 0.775 * u), ground], [G.box(0.04 * u, WH, 1.5 * u, -W / 2, WH / 2, Z0 + 0.75 * u), wall2], [G.box(0.04 * u, WH, 1.5 * u, W / 2, WH / 2, Z0 + 0.75 * u), wall2],
    [G.box(DW + 0.08 * u, 0.05 * u, T * 1.3, 0, DH + 0.025 * u, Z0), exit ? 0x33383f : 0x7a5232], [G.box(0.04 * u, DH, T * 1.3, -DW / 2 - 0.02 * u, DH / 2, Z0), exit ? 0x33383f : 0x7a5232], [G.box(0.04 * u, DH, T * 1.3, DW / 2 + 0.02 * u, DH / 2, Z0), exit ? 0x33383f : 0x7a5232],
    ...(exit ? [] : [[G.box(0.3 * u, 0.012 * u, 1.45 * u, 0, 0.006 * u, Z0 + 0.73 * u), 0xb83a3a]]),     // a red runner leading to the door
  ], 0.55);
  // the outside, seen through the open door: sunny sky, sun, hills, grass, a tree
  const sky = solidProp([
    [G.box(1.9 * u, 0.04 * u, 1.9 * u, 0, -0.02 * u, Z0 - 0.95 * u), 0x6ccf5a], [G.box(1.9 * u, 1.9 * u, 0.04 * u, 0, 0.95 * u, Z0 - 1.9 * u), 0xb4e6ff],
    [G.sphere(0.16 * u, 0.35 * u, 0.95 * u, Z0 - 1.85 * u), 0xfff08a], [G.sphere(0.5 * u, -0.5 * u, 0, Z0 - 1.75 * u, 1, 0.7, 1), 0x58c04a], [G.sphere(0.55 * u, 0.5 * u, 0, Z0 - 1.8 * u, 1, 0.7, 1), 0x4cb040],
    [G.cyl(0.03 * u, 0.04 * u, 0.3 * u, -0.45 * u, 0.15 * u, Z0 - 1.0 * u), 0x8a5a30], [G.sphere(0.2 * u, -0.45 * u, 0.42 * u, Z0 - 1.0 * u), 0x3aa04a],
  ], 1.0);
  root.add(room, sky);
  // daylight spilling through the open door onto the floor
  const spill = glowPlane(0.9 * u, 1.0 * u, 'rgba(255,248,190,0.9)'); spill.rotation.x = -PI / 2; spill.position.set(0, 0.02 * u, Z0 + 0.4 * u); root.add(spill);
  // door leaves (hinged on the outer sides; they swing OUT, away from us)
  const leaf = (w, col) => solidProp([[G.box(w, DH - 0.01 * u, 0.035 * u, 0, (DH - 0.01 * u) / 2, 0), col], [G.sphere(0.022 * u, 0, DH * 0.48, 0.03 * u), 0xffd040]], 0.45);
  const hingeL = new THREE.Group(), hingeR = new THREE.Group();
  if (exit) {
    const a = leaf(DW / 2 - 0.005 * u, 0x4a5a6a), b = leaf(DW / 2 - 0.005 * u, 0x4a5a6a); a.position.x = DW / 4; b.position.x = -DW / 4;
    hingeL.add(a); hingeR.add(b); hingeL.position.set(-DW / 2, 0, Z0); hingeR.position.set(DW / 2, 0, Z0);
  } else {
    const a = leaf(DW - 0.01 * u, 0x8a5a30); a.position.x = DW / 2; hingeL.add(a); hingeL.position.set(-DW / 2, 0, Z0 + 0.0);
  }
  root.add(hingeL); if (exit) root.add(hingeR);
  // the signs
  let sign, housing, halo, patch;
  if (exit) {
    sign = textPlane('出口', { h: 0.25 * u, color: '#ffffff', size: 0.9, weight: 900 });
    housing = solidProp([[G.box(0.98 * u, 0.34 * u, 0.07 * u, 0, 0, 0), 0x0c8a42], [G.box(1.04 * u, 0.4 * u, 0.04 * u, 0, 0, -0.01 * u), 0x1c2a22]], 0.3);
    halo = glowPlane(2.6 * u, 1.3 * u, 'rgba(60,255,130,1)'); patch = glowPlane(1.3 * u, 1.5 * u, 'rgba(60,255,130,0.8)'); patch.rotation.x = -PI / 2; patch.position.set(0, 0.025 * u, Z0 + 0.7 * u);
    const sy = DH + 0.35 * u; housing.position.set(0, sy, Z0 + T * 0.8); sign.position.set(0, sy, Z0 + T * 0.8 + 0.04 * u); halo.position.set(0, sy, Z0 + T * 0.8 - 0.02 * u);
    root.add(housing, sign, halo, patch);
  } else {
    sign = textPlane('EXIT', { h: 0.15 * u, color: '#ffffff', bg: '#20a050', pad: 0.25, weight: 900 }); sign.position.set(0, DH + 0.2 * u, Z0 + T * 0.7); root.add(sign);
  }
  // door only: a green arrow on the runner pointing away from us, through the door
  const arrow = exit ? null : solidProp(flatArrow(u), 1.2);
  if (arrow) { arrow.position.set(0, 0.015 * u, Z0 + 0.55 * u); root.add(arrow); }
  // the person: back to us, facing -z (away)
  const p = actor(exit ? 'guy2' : 'guy', (exit ? 0.72 : 0.74) * u, { tint: { ...SKIN, Shirt: exit ? 0x2fae5a : 0xe0603a } }); root.add(p.group);
  const loop = exit ? 6.2 : 6.4, z0 = 0.95 * u, zFar = Z0 - 1.05 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      let open, shut, gone, lit, t0, speed, stride, cyc;
      if (exit) { lit = pre ? 0 : between(v, 0.3, 1.0) * (1 - between(v, 5.0, 5.6)); t0 = 1.0; speed = 1.15 * u; stride = 1.0 * u; cyc = 0.9; open = between(v, 1.3, 2.0); shut = between(v, 3.8, 4.4); gone = between(v, 2.9, 3.4); }
      else { lit = 1; t0 = 0.6; speed = 0.62 * u; stride = 0.7 * u; cyc = 1.3; open = between(v, 1.8, 2.6); shut = between(v, 4.7, 5.4); gone = between(v, 3.9, 4.6); }
      if (pre) { open = 0; shut = 0; gone = 0; }
      const dist = pre ? 0 : Math.min(z0 - zFar, Math.max(0, (v - t0) * speed)), z = z0 - dist, moving = dist > 0 && dist < z0 - zFar;
      if (moving) p.pose(exit ? 'Run' : 'Walk', dist * cyc / stride); else p.pose('Idle', t);
      p.group.position.set(0, 0, z); p.group.rotation.y = PI; p.group.visible = !pre || A.setup > 0.15; p.group.scale.setScalar(grow(Math.min(1 - gone, pre ? 1 : between(v, 0, 0.35) + 0.001)));
      const swing = 1.75 * (open - shut);
      hingeL.rotation.y = swing; hingeR.rotation.y = -swing;
      spill.material.opacity = 0.9 * (open - shut); spill.visible = open - shut > 0.02;
      if (arrow) arrow.position.z = Z0 + 0.5 * u + 0.05 * u * Math.sin(t * 5);
      if (exit) {
        const pulse = 0.9 + 0.1 * Math.sin(t * 7);
        housing.material.userData.glow.value = 0.05 + 1.5 * lit * pulse; sign.material.color.setScalar(0.18 + 0.82 * lit);
        halo.material.opacity = lit * (0.85 + 0.15 * Math.sin(t * 7)); halo.visible = lit > 0.02; patch.material.opacity = lit * 0.45 * pulse; patch.visible = lit > 0.02;
      } else sign.material.opacity = 0.85 + 0.15 * Math.sin(t * 4);
    },
  };
}

// ---- 電話: lightning, a cable along the ground, an old phone ----
export function phoneCable(ctx, spec, stage) {
  const su = stage.u, u = 1.9 * su, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const kx = B.maxX + 0.35 * su, px = B.maxX + 1.65 * su, YAW = 0.4, R = 0.02 * u;
  const rodTop = 0.34 * u;
  // the junction post where the bolt lands: a small steel box with a yellow cap, a lightning rod and a socket on its side
  const post = solidProp([[G.box(0.17 * u, 0.12 * u, 0.13 * u, 0, 0.06 * u, 0), 0x6a7080], [G.box(0.18 * u, 0.025 * u, 0.14 * u, 0, 0.13 * u, 0), 0xffc41a], [G.cyl(0.008 * u, 0.008 * u, 0.2 * u, 0, 0.24 * u, 0), 0xb8bcc8], [G.sphere(0.02 * u, 0, rodTop, 0), 0xe8ecf4],
    [G.box(0.04 * u, 0.06 * u, 0.07 * u, 0.1 * u, 0.06 * u, 0), 0x2a2d36]], 0.5);
  post.position.set(kx, floor, 0); group.add(post);
  const plugK = solidProp([[G.box(0.06 * u, 0.05 * u, 0.05 * u, 0, 0, 0), 0xd0d4dc], [G.box(0.03 * u, 0.035 * u, 0.04 * u, 0.045 * u, 0, 0), 0x40444c]], 0.5);
  const kJack = new THREE.Vector3(kx + 0.125 * u + 0.05 * u, floor + 0.06 * u, 0); plugK.position.set(kJack.x - 0.025 * u, kJack.y, 0); group.add(plugK);
  // the phone (as before: red body, dial, cradle and handset), turned a little so its left side faces us, with a plug in that side
  const body = solidProp([[G.box(0.36 * u, 0.22 * u, 0.24 * u, 0, 0.11 * u, 0), 0xd83030], [G.cyl(0.085 * u, 0.085 * u, 0.02 * u, 0, 0.12 * u, 0.125 * u, PI / 2), 0xf4efe6], ...Array.from({ length: 8 }, (_, i) => [G.cyl(0.012 * u, 0.012 * u, 0.022 * u, Math.cos(i * 0.7 + 0.5) * 0.06 * u, 0.12 * u + Math.sin(i * 0.7 + 0.5) * 0.06 * u, 0.128 * u, PI / 2), 0x303030]), [G.box(0.08 * u, 0.06 * u, 0.1 * u, -0.13 * u, 0.24 * u, 0), 0xb82020], [G.box(0.08 * u, 0.06 * u, 0.1 * u, 0.13 * u, 0.24 * u, 0), 0xb82020],
    [G.box(0.07 * u, 0.05 * u, 0.05 * u, -0.2 * u, 0.07 * u, -0.02 * u), 0xd0d4dc], [G.box(0.03 * u, 0.04 * u, 0.045 * u, -0.245 * u, 0.07 * u, -0.02 * u), 0x40444c]], 0.45);
  const handset = solidProp([[G.cyl(0.03 * u, 0.03 * u, 0.36 * u, 0, 0, 0, 0, 0, PI / 2), 0xd83030], [G.sphere(0.07 * u, -0.18 * u, -0.03 * u, 0, 1, 0.7, 1), 0xd83030], [G.sphere(0.07 * u, 0.18 * u, -0.03 * u, 0, 1, 0.7, 1), 0xd83030]], 0.45);
  const ph = new THREE.Group(); ph.add(body, handset); handset.position.set(0, 0.32 * u, 0); ph.position.set(px, floor, 0); ph.rotation.y = YAW; group.add(ph);
  // the cable: a chain of small spheres along a curve from the post's plug to the phone's plug (re-laid every frame, so it stays joined when the phone hops)
  const N = 52, cable = many([[G.sphere(R), 0xa4aabc]], N, 0.5), pulse = many([[G.sphere(R * 1.9), 0xfff060]], 5, 1.8), pj = new THREE.Vector3(), pk = new THREE.Vector3(), tmp = new THREE.Vector3();
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], false, 'catmullrom', 0.5);
  // clouds and the bolt
  const cloud = solidProp([[G.sphere(0.2 * u, 0, 0, 0), 0x4a5068], [G.sphere(0.15 * u, 0.2 * u, -0.04 * u, 0), 0x4a5068], [G.sphere(0.15 * u, -0.2 * u, -0.04 * u, 0), 0x4a5068], [G.sphere(0.12 * u, 0.06 * u, 0.1 * u, 0.06 * u), 0x5a6078]], 0.3);
  cloud.position.set(kx - 0.06 * u, floor + 0.85 * u, -0.05 * u); group.add(cloud);
  const bolt = solidProp([[G.poly([[-0.06, 0.0], [0.03, -0.18], [-0.05, -0.33], [0.04, -0.5], [-0.03, -0.66], [0.0, -0.8]].map(([x, y]) => [x * u, y * u]), 0.026 * u), 0xfff4a0]], 1.8);
  bolt.position.set(kx, cloud.position.y - 0.12 * u, 0.03 * u); group.add(bolt);
  const flash = glowPlane(0.7 * u, 0.7 * u, 'rgba(255,240,140,0.9)'); flash.position.set(kx, floor + rodTop, 0.08 * u); group.add(flash);
  const rings = many([[G.torus(0.1 * u, 0.01 * u, PI * 0.5, 0, 0, 0, PI * 0.25), 0xffe060]], 4, 1.2);
  group.add(cable, pulse, rings);
  const loop = 6.0;
  // the bolt's own point: from the cloud down to the rod tip
  const boltLen = cloud.position.y - 0.12 * u - (floor + rodTop);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // 0.7 strike, 0.9-2.3 pulses run along the cable, 2.3 the phone gets it, rings till 5.0
      const strike = pre ? 0 : bump(v, 0.7, 0.35) + 0.6 * bump(v, 1.1, 0.25), run = pre ? -1 : (v - 0.95) / 1.35, ringing = !pre && v > 2.35 && v < 5.0 && ((v - 2.35) % 1.25) < 0.85;
      const shake = ringing ? Math.sin(t * 50) : 0, hop = ringing ? 0.035 * u * Math.abs(Math.sin(t * 24)) : 0;
      ph.position.set(px, floor + hop, 0); ph.rotation.set(0, YAW, 0.04 * shake);
      handset.position.set(0, 0.32 * u + (ringing ? 0.05 * u * Math.abs(shake) : 0), 0); handset.rotation.z = 0.08 * shake;
      // the cable ends, in group space (the phone's plug follows the hop)
      ph.updateMatrix(); pj.set(-0.28 * u, 0.07 * u, -0.02 * u).applyMatrix4(ph.matrix); pk.set(kJack.x + 0.012 * u, kJack.y, 0);
      curve.points[0].copy(pk);
      curve.points[1].set(pk.x + 0.07 * u, R + 0.025 * u, 0.0);
      curve.points[2].set(lerp(pk.x, pj.x, 0.35), R, -0.09 * u);
      curve.points[3].set(lerp(pk.x, pj.x, 0.7), R, 0.08 * u);
      curve.points[4].set(pj.x - 0.1 * u, Math.max(R, pj.y * 0.5), pj.z - 0.02 * u);
      curve.points[5].copy(pj);
      for (let i = 0; i < N; i++) { curve.getPointAt(i / (N - 1), tmp); cable.set(i, tmp.x, tmp.y, tmp.z, 1); } cable.commit();
      for (let i = 0; i < 5; i++) {
        const f = run - i * 0.09, on = f > 0 && f < 1 && !pre;
        if (on) { curve.getPointAt(f, tmp); pulse.set(i, tmp.x, tmp.y + 0.005 * u, tmp.z, 0.8 + 0.4 * Math.sin(t * 30 + i)); } else pulse.set(i, 0, 0, 0, 0);
      } pulse.commit();
      bolt.visible = strike > 0.25; bolt.scale.set(1, bolt.visible ? boltLen / (0.8 * u) : 1, 1);
      flash.visible = strike > 0.05; flash.material.opacity = Math.min(1, strike); flash.scale.setScalar(0.6 + strike);
      post.material.userData.glow.value = 0.5 + 1.2 * (pre ? 0 : Math.max(strike, between(v, 0.9, 1.0) * (1 - between(v, 2.3, 2.6))));
      body.material.userData.glow.value = 0.45 + (pre ? 0 : 0.9 * bump(v, 2.2, 0.5));
      cloud.position.x = kx - 0.06 * u + 0.01 * u * Math.sin(t * 3) * strike;
      for (let i = 0; i < 4; i++) { const f = ((v * 1.6 + (i % 2) / 2) % 1), s = i < 2 ? 1 : -1; rings.set(i, px + s * (0.25 + 0.1 * f) * u, floor + 0.38 * u, 0.02 * u, ringing ? 1 + f : 0, s > 0 ? 0 : PI); } rings.commit();
    },
  };
}

