// 切手: a hand reaches in from your side, straight along your line of sight (the z axis), holding a postage stamp by its
// lower edge, and presses it onto the top-right corner of the envelope; the thump nudges the letter, the hand pulls back
// and the stamp stays stuck there, then a wavy postmark inks over it.
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createHand } from '../pieces/kit-hand.js';
import { burst } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, handTo } from './helpers.js';

// a postage stamp on a canvas: white perforated border, a little picture (Mt Fuji over a lake, a red sun), the price
function stampTexture() {
  const W = 200, H = 240, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, W, H);
  const sky = g.createLinearGradient(0, 22, 0, 150); sky.addColorStop(0, '#5aa8e8'); sky.addColorStop(1, '#bfe4f8');
  g.fillStyle = sky; g.fillRect(22, 22, W - 44, H - 74);
  g.fillStyle = '#e8483a'; g.beginPath(); g.arc(138, 62, 15, 0, 7); g.fill();                              // the sun
  g.fillStyle = '#4a5f9a'; g.beginPath(); g.moveTo(22, 150); g.lineTo(100, 66); g.lineTo(178, 150); g.fill();   // the mountain
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(80, 86); g.lineTo(100, 66); g.lineTo(120, 86); g.lineTo(108, 82); g.lineTo(100, 90); g.lineTo(92, 82); g.fill();
  g.fillStyle = '#2f8a6a'; g.fillRect(22, 150, W - 44, 26);
  g.fillStyle = '#c42a2a'; g.font = '700 34px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('84', 62, 204);
  g.fillStyle = '#2a2a3a'; g.font = '700 26px sans-serif'; g.fillText('郵便', 140, 204);
  g.globalCompositeOperation = 'destination-out';                                                           // the perforation: round bites out of every edge
  for (let x = 6; x < W; x += 20) { g.beginPath(); g.arc(x, 0, 7, 0, 7); g.arc(x, H, 7, 0, 7); g.fill(); }
  for (let y = 6; y < H; y += 20) { g.beginPath(); g.arc(0, y, 7, 0, 7); g.arc(W, y, 7, 0, 7); g.fill(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}

function stampLetter(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), lx = B.maxX + 0.32 * u, ly = B.cy, ES = 0.68;
  const env = emblemProp('letter', ES * u);
  const SW = 0.165 * u, SH = 0.198 * u, sx = lx + 0.8 * ES * u / 2 - 0.125 * u, sy = ly + 0.5 * ES * u / 2 - 0.14 * u, zOn = 0.05 * ES * u;   // stamp spot: top-right corner of the letter
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: stampTexture(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  stamp.frustumCulled = false;
  const mark = solidProp([[G.torus(0.07 * u, 0.007 * u), 0x30303c], ...[0, 1, 2].map((i) => [G.box(0.17 * u, 0.007 * u, 0.004 * u, 0.2 * u, (i - 1) * 0.028 * u, 0), 0x30303c])], 0.3);
  const hu = 0.7 * u, hand = createHand({ u: hu, side: -1, arm: 1.5, sleeve: 0x4a78d8 }), tip = new THREE.Object3D();
  hand.bone('f0b').add(tip); tip.position.y = 0.13 * hu; hand.pose('pinch');
  hand.group.rotation.order = 'XYZ'; hand.group.rotation.set(-Math.PI / 2 + 0.35, 0.2, 0);                          // the arm comes from you, fingers pointing away along -z
  const thump = burst(u, { s: 0.3, color: 0xfff0b0 });
  env.position.set(lx, ly, 0);
  group.add(env, stamp, mark, hand.group, thump);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      env.idle(0); env.scale.setScalar(ES * u * Math.max(1e-3, timeline(A.setup, { a: [0.3, 0.4, 'back'] }).a));
      const T = timeline(v, { reach: [0.2, 0.8, 'in'], away: [1.5, 0.7], gone: [3.8, 0.4] });
      const hit = pre ? 0 : bump(v, 1.0, 0.35), z = zOn + 0.9 * u * (1 - T.reach) + 0.9 * u * T.away;                // straight along z
      const stuck = !pre && v >= 1.0 && T.gone < 1;
      env.position.set(lx, ly, -0.03 * u * hit); env.rotation.x = -0.06 * hit;
      // the stamp rides at the fingertips until the press, then stays on the letter
      stamp.visible = !pre && T.gone < 1; stamp.position.set(sx, sy, stuck ? zOn : z);
      hand.group.visible = !pre && v > 0.15 && T.away < 1; hand.update();
      handTo(hand, sx, sy - SH * 0.5 + 0.02 * u, z + 0.012 * u, tip);
      mark.visible = !pre && v > 2.0 && T.gone < 1; mark.position.set(sx - 0.12 * u, sy - 0.01 * u, zOn + 0.012 * u); mark.scale.setScalar(Math.max(1e-3, between(v, 2.0, 2.15)));
      const th = pre ? 0 : bump(v, 1.0, 0.45); thump.visible = th > 0; thump.scale.setScalar(Math.max(1e-3, th)); thump.position.set(sx + 0.13 * u, sy + 0.12 * u, zOn + 0.05 * u); thump.rotation.z = v * 3;
    },
  };
}

export const SCENES = { 'stamp-letter': stampLetter };
