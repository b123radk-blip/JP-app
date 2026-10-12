// 語 / 英語: a desk globe with the real Earth (NASA Blue Marble texture) on a brass stand: tilted axis, a meridian arc, a base.
//   globe-hello           語: the Earth spins steadily; speech bubbles pop up in turn: Hello, こんにちは, Hola, Bonjour
//   globe-hello:english   英語: the Earth turns from the UK / Europe round to North America (a red pin on each); bubbles say
//                         "Hello!" over Europe and "ABC" over America, the language of those places
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { appUrl } from '../../core/urls.js';
import { TEXT } from '../../config.js';

let earthTex = null;
const earthMap = () => {
  if (!earthTex) { earthTex = new THREE.TextureLoader().load(appUrl('assets/textures/earth.jpg')); earthTex.colorSpace = THREE.SRGBColorSpace; earthTex.anisotropy = 4; }
  return earthTex;
};
// the point on a unit sphere at (lat, lon) in degrees, in the sphere's own space (lon 0 faces +x)
const onSphere = (lat, lon, r = 1) => { const a = (lat * Math.PI) / 180, o = (lon * Math.PI) / 180; return new THREE.Vector3(Math.cos(o) * Math.cos(a), Math.sin(a), -Math.sin(o) * Math.cos(a)).multiplyScalar(r); };
const faceLon = (lon) => -Math.PI / 2 - (lon * Math.PI) / 180;               // spin.rotation.y that turns longitude `lon` towards the viewer

// a rounded speech bubble (tail at the bottom left) with text, `h` tall
function bubble(text, h, { fill = '#ffffff', ink = '#202838', edge = '#c8d0dc' } = {}) {
  const px = 128, f = `800 ${px * 0.62}px "${TEXT.fontFamily}", sans-serif`, c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = f; const tw = Math.ceil(g.measureText(text).width + px * 0.7), th = Math.round(px * 1.5), tail = px * 0.4;
  c.width = tw; c.height = th + tail;
  g.beginPath(); g.roundRect(6, 6, tw - 12, th - 12, th * 0.34); g.moveTo(tw * 0.18, th - 8); g.lineTo(tw * 0.1, th + tail - 4); g.lineTo(tw * 0.34, th - 8); g.closePath();
  g.fillStyle = fill; g.fill(); g.lineWidth = 6; g.strokeStyle = edge; g.stroke();
  g.font = f; g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, tw / 2, th / 2 + 4);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const hh = h * (c.height / th), m = new THREE.Mesh(new THREE.PlaneGeometry(hh * (tw / c.height), hh), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.geometry.translate(hh * (tw / c.height) * 0.4, hh * 0.5 - h * 0.5 + h * 0.15, 0);  // origin at the tail tip
  return m;
}

// a map pin standing on the sphere at (lat, lon), radius R: stalk + round red head
function pin(R, u, lat, lon) {
  const dir = onSphere(lat, lon), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const stalk = G.cyl(0.004 * u, 0.004 * u, 0.06 * u, 0, 0, 0).translate(0, R + 0.03 * u, 0).applyQuaternion(q);
  const head = G.sphere(0.02 * u).translate(0, R + 0.07 * u, 0).applyQuaternion(q);
  return [[stalk, 0xe8e8f0], [head, 0xe03030]];
}

export function globeHello(ctx, spec, stage) {
  const en = spec.outcome === 'english', u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const R = (en ? 0.27 : 0.26) * u, Ra = R + 0.03 * u, tilt = en ? 0.41 : -0.41, gx = B.maxX + 0.48 * u, base = floor + 0.035 * u;
  const south = new THREE.Vector2(0, -Ra).rotateAround(new THREE.Vector2(), tilt), gy = base + 0.09 * u - south.y;
  const mat = new THREE.MeshStandardMaterial({ map: earthMap(), emissive: 0xffffff, emissiveMap: earthMap(), emissiveIntensity: 0.85, roughness: 0.9, metalness: 0 });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 56, 36), mat); earth.frustumCulled = false;
  const spin = new THREE.Group(), tiltG = new THREE.Group();
  spin.add(earth);
  const brass = 0xd0a850;
  const frame = solidProp([[G.torus(Ra, 0.008 * u, Math.PI, 0, 0, 0, -Math.PI / 2), brass], [G.cyl(0.006 * u, 0.006 * u, 2 * Ra + 0.04 * u, 0, 0, 0), 0xe8d8a0], [G.sphere(0.014 * u, 0, Ra + 0.02 * u, 0), brass], [G.sphere(0.014 * u, 0, -Ra - 0.02 * u, 0), brass]], 0.4);
  tiltG.add(spin, frame); tiltG.rotation.z = tilt; tiltG.position.set(gx, gy, 0);
  const sx = gx + south.x, stem = solidProp([[G.cyl(0.011 * u, 0.011 * u, 0.1 * u, 0, 0, 0), brass], [G.cyl(0.012 * u, 0.02 * u, 0.025 * u, 0, -0.04 * u, 0), brass]], 0.4);
  stem.position.set(sx, gy + south.y - 0.04 * u, 0);
  const stand = solidProp([[G.cyl(0.13 * u, 0.15 * u, 0.03 * u, 0, 0, 0, 0, 0, 0, 32), 0x5a3a22], [G.cyl(0.115 * u, 0.13 * u, 0.012 * u, 0, 0.02 * u, 0, 0, 0, 0, 32), brass]], 0.35);
  stand.position.set(sx, base - 0.015 * u, 0);
  group.add(stand, stem, tiltG);
  const pins = en ? solidProp([...pin(R, u, 54, -2), ...pin(R, u, 40, -100)], 0.7) : null; if (pins) spin.add(pins);
  const words = en ? ['Hello!', 'ABC'] : ['Hello', 'こんにちは', 'Hola', 'Bonjour'];
  const bubbles = words.map((w, i) => bubble(w, 0.2 * u, en ? { fill: i % 2 ? '#fff6d8' : '#e8f2ff', ink: i % 2 ? '#a02020' : '#1a3a80', edge: i % 2 ? '#e0a040' : '#80a8e0' } : undefined));
  group.add(...bubbles);
  const loop = 6.4, starts = en ? [0.4, 3.7] : [0.4, 1.8, 3.2, 4.6], dur = en ? [1.6, 1.9] : [1.4, 1.4, 1.4, 1.4];
  const spots = en ? [[-0.02, 0.4], [0.02, 0.4]] : [[0.06, 0.4], [0.18, 0.34], [0.04, 0.42], [0.2, 0.36]];
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { turn: [2.1, 1.4] });
      spin.rotation.y = en ? faceLon(8) + (faceLon(-88) - faceLon(8)) * T.turn * (1 - between(v, 5.7, 6.4)) : (pre ? 0.3 : 0.3 + v * ((Math.PI * 2) / loop));
      bubbles.forEach((b, i) => {
        const at = starts[i], k = pre ? 0 : between(v, at, at + 0.3) * (1 - between(v, at + dur[i] - 0.2, at + dur[i])), [dx, dy] = spots[i];
        b.visible = k > 0.01; b.scale.setScalar(grow(k) * (1 + 0.06 * bump(v, at, 0.4)));
        b.position.set(gx + (dx) * u, gy + dy * u + 0.01 * u * Math.sin(v * 4 + i), 0.1 * u);
      });
    },
  };
}
