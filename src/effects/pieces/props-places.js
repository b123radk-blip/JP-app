// Scene props that are places, behind the kanji: "road" (a road or path winding towards you, its centre line moving as if
// you walk), "field" (rice paddies seen from above, water glinting between them), "room" (an interior: wall, floor, a window
// with daylight, a hanging lamp), "gate" (a gate whose doors slide open after the strokes, light behind).
import * as THREE from 'three';
import { smooth } from './util.js';
import { G, merge, solid, mesh } from './shape-kit.js';
import { radialTexture } from './util.js';

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
function panel(w, h, uniforms, frag, pos, tilt) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: frag, transparent: true, depthWrite: false }));
  m.position.set(...pos); m.rotation.x = tilt; m.renderOrder = -5;
  return m;
}
const color = (c) => ({ value: new THREE.Color(c) });

export function road(ctx, spec) {
  const U = { uTime: { value: 0 }, uOn: { value: 0 }, uRoad: color(spec.color), uEdge: color(spec.verge), uLine: color(spec.line) };
  const m = panel(1.7, 1.3, U, `varying vec2 vUv; uniform float uTime, uOn; uniform vec3 uRoad, uEdge, uLine;
    void main(){
      float v = vUv.y, cx = 0.5 + 0.09 * sin(v * 3.2 + 0.4), w = mix(0.24, 0.05, v), d = abs(vUv.x - cx) / w;
      float onRoad = smoothstep(1.0, 0.94, d), dash = step(0.5, fract(v * 9.0 + uTime * 0.35)) * smoothstep(0.08, 0.0, abs(vUv.x - cx) / w);
      vec3 verge = uEdge * (0.8 + 0.2 * sin(vUv.x * 9.0 + v * 4.0) * sin(v * 11.0));
      vec3 col = mix(verge, mix(uRoad, uLine, dash * ${spec.dashes ? '1.0' : '0.0'}), onRoad);
      float a = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.1, v) * smoothstep(1.0, 0.7, v);
      gl_FragColor = vec4(col, a * uOn);
      #include <colorspace_fragment>
    }`, [0, -0.06, -0.38], -0.55);
  const group = new THREE.Group(); group.add(m);
  return { group, step(t) { U.uTime.value = t; U.uOn.value = smooth(t / Math.max(0.6, ctx.rv.end * 0.6)); } };
}

export function field(ctx, spec) {
  const U = { uTime: { value: 0 }, uOn: { value: 0 }, uRice: color(spec.color), uWater: color(spec.water), uRidge: color(spec.ridge) };
  const m = panel(1.6, 1.2, U, `varying vec2 vUv; uniform float uTime, uOn; uniform vec3 uRice, uWater, uRidge;
    void main(){
      vec2 g = vUv * vec2(5.0, 4.0), f = fract(g), id = floor(g);
      float ridge = 1.0 - smoothstep(0.03, 0.07, min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)));
      float rows = smoothstep(0.35, 0.5, abs(fract(f.x * 7.0 + id.y * 0.3) - 0.5) * 2.0);
      float glint = smoothstep(0.85, 1.0, sin(f.x * 30.0 + uTime * 1.4 + id.x * 2.0) * sin(f.y * 23.0 - uTime + id.y));
      vec3 paddy = mix(uWater + glint * 0.25, uRice * (0.85 + 0.15 * sin(id.x * 3.0 + id.y * 5.0)), rows);
      vec3 col = mix(paddy, uRidge, ridge);
      float a = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
      gl_FragColor = vec4(col, a * uOn);
      #include <colorspace_fragment>
    }`, [0, -0.04, -0.36], -0.7);
  const group = new THREE.Group(); group.add(m);
  return { group, step(t) { U.uTime.value = t; U.uOn.value = smooth(t / 1.0); } };
}

// what makes each kind of room recognisable (one or two merged meshes on top of the plain room) and its wall / floor tint
const ROOMS = {
  classroom: { wall: 0xb8a88a, floor: 0x7a5a3a, build: () => [mesh(merge([G.box(0.62, 0.36, 0.02, 0.18, 0.14, -0.53), G.box(0.66, 0.03, 0.04, 0.18, -0.05, -0.52)]), solid(0x1f4a34, 0.12)),
    mesh(merge([G.box(0.2, 0.012, 0.01, 0.06, 0.24, -0.515), G.box(0.12, 0.012, 0.01, 0.3, 0.18, -0.515), G.box(0.16, 0.012, 0.01, 0.1, 0.08, -0.515, 0.2), G.box(0.06, 0.06, 0.01, 0.34, 0.06, -0.515)]), solid(0xf0f0e0, 0.5))] },
  kitchen: { wall: 0xd8d0b8, floor: 0x6a5a48, build: () => [mesh(merge([G.box(1.0, 0.2, 0.22, 0.2, -0.16, -0.43), G.box(1.0, 0.025, 0.24, 0.2, -0.05, -0.43)]), solid(0x8a6a48, 0.1)),
    mesh(merge([G.cyl(0.075, 0.07, 0.09, 0.38, 0.005, -0.42), G.box(0.06, 0.015, 0.015, 0.47, 0.03, -0.42), G.cyl(0.06, 0.06, 0.015, 0.12, -0.03, -0.42), G.box(0.12, 0.015, 0.015, -0.0, -0.03, -0.42)]), solid(0xd04a30, 0.3))] },
  shop: { wall: 0xc89868, floor: 0x5a4030, build: () => [mesh(merge([0, 1, 2].map((r) => G.box(0.62, 0.02, 0.12, 0.2, -0.12 + r * 0.17, -0.48))), solid(0x6a4a2a, 0.1)),
    mesh(merge([0, 1, 2].flatMap((r) => [0, 1, 2, 3, 4].map((c) => G.box(0.07, 0.09, 0.08, -0.04 + c * 0.12, -0.065 + r * 0.17, -0.47)))), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x402010, roughness: 0.5, vertexColors: false })),
  ] },
  station: { wall: 0x8a98a8, floor: 0x50545a, build: () => [mesh(merge([G.box(1.6, 0.03, 0.06, 0, -0.2, -0.05), G.box(0.36, 0.1, 0.02, 0.3, 0.3, -0.52)]), solid(0xf0d040, 0.4)),
    mesh(merge([G.box(1.2, 0.26, 0.2, -0.1, -0.05, -0.47), ...[0, 1, 2, 3].map((i) => G.box(0.14, 0.08, 0.01, -0.5 + i * 0.26, 0.0, -0.36))]), solid(0x3a9a60, 0.25))] },
};

export function room(ctx, spec) {
  const group = new THREE.Group(), kind = ROOMS[spec.kind];
  if (kind && spec.wall === ROOM_DEFAULT.wall) spec = { ...spec, wall: kind.wall, floor: kind.floor };
  const wallMat = new THREE.MeshStandardMaterial({ color: spec.wall, roughness: 0.95 }), floorMat = new THREE.MeshStandardMaterial({ color: spec.floor, roughness: 0.8 });
  const wall = mesh(new THREE.PlaneGeometry(1.8, 1.2), wallMat); wall.position.set(0, 0.05, -0.55);
  const floor = mesh(new THREE.PlaneGeometry(1.8, 0.9), floorMat); floor.rotation.x = -Math.PI / 2 + 0.25; floor.position.set(0, -0.26, -0.2);
  const frame = mesh(merge([G.box(0.42, 0.03, 0.03, 0, 0.17, 0), G.box(0.42, 0.03, 0.03, 0, -0.17, 0), G.box(0.03, 0.37, 0.03, -0.2, 0, 0), G.box(0.03, 0.37, 0.03, 0.2, 0, 0), G.box(0.015, 0.34, 0.02, 0, 0, 0)]), solid(spec.frame, 0.1));
  const glass = mesh(new THREE.PlaneGeometry(0.4, 0.34), new THREE.MeshBasicMaterial({ color: spec.window })); glass.position.z = -0.01;
  const win = new THREE.Group(); win.add(frame, glass); win.position.set(-0.42, 0.14, -0.53);
  const lamp = new THREE.Group(), glowMat = new THREE.MeshBasicMaterial({ map: radialTexture(0.3, 0.3), color: 0xffc070, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  lamp.add(mesh(merge([G.cyl(0.004, 0.004, 0.3, 0, 0.15), G.cone(0.07, 0.07, 0, -0.02)]), solid(0x302820, 0.1)), mesh(new THREE.PlaneGeometry(0.4, 0.4).translate(0, -0.05, 0.01), glowMat));
  lamp.position.set(0.42, 0.3, -0.45);
  group.add(wall, floor, win, lamp);
  if (kind) { const extra = kind.build(); group.add(...extra); if (spec.kind === 'shop') extra[1].material.color.set(0xe85a40); }
  return { group, step(t) { const on = smooth(t / 1.0); wallMat.emissive.set(spec.wall).multiplyScalar(0.25 * on); glowMat.opacity = 0.8 * smooth((t - 0.6) / 0.8); lamp.rotation.z = 0.03 * Math.sin(t * 0.9); } };
}

export const ROOM_DEFAULT = { wall: 0x8a6a50 };

// a red arched bridge across the lower part of the card (cross over); pairs well with a river
export function bridge(ctx, spec) {
  const group = new THREE.Group(), arch = [...Array(13).keys()].map((i) => { const u = i / 12; return [-0.55 + 1.1 * u, 0.12 * Math.sin(Math.PI * u)]; });
  const posts = arch.filter((_, i) => i % 2 === 0).map(([x, y]) => G.cyl(0.008, 0.008, 0.08, x, y + 0.04, 0.03));
  group.add(mesh(merge([G.tube(arch, 0.02), G.tube(arch.map(([x, y]) => [x, y + 0.08]), 0.01), ...posts].map((g, i) => (i === 1 ? g.translate(0, 0, 0.03) : g))), solid(spec.color, 0.3)),
    mesh(merge([G.tube(arch.map(([x, y]) => [x, y - 0.012]), 0.016).scale(1, 1, 4)]), solid(spec.deck, 0.1)));
  group.position.set(0, -0.2, -0.3);
  return { group, step(t) { group.scale.setScalar(0.85 * (0.4 + 0.6 * smooth(t / 0.8))); } };
}

export function gate(ctx, spec) {
  const group = new THREE.Group(), frameMat = solid(spec.color, 0.15);
  const frame = mesh(merge([G.box(0.06, 0.8, 0.06, -0.36, -0.02, 0), G.box(0.06, 0.8, 0.06, 0.36, -0.02, 0), G.box(0.9, 0.07, 0.08, 0, 0.42, 0), G.box(0.8, 0.04, 0.05, 0, 0.32, 0)]), frameMat);
  const doorMat = solid(spec.door, 0.08), left = mesh(G.box(0.33, 0.66, 0.02, 0, 0, 0), doorMat), right = mesh(G.box(0.33, 0.66, 0.02, 0, 0, 0), doorMat);
  const light = mesh(new THREE.PlaneGeometry(0.66, 0.68), new THREE.MeshBasicMaterial({ map: radialTexture(0.5, 0.6), color: spec.light, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  light.position.set(0, -0.05, -0.03); left.position.set(-0.165, -0.05, 0.01); right.position.set(0.165, -0.05, 0.01);
  group.add(frame, left, right, light); group.position.set(0, 0.02, -0.32);
  return {
    group,
    step(t) {
      const k = smooth((ctx.idle - 0.2) / 1.2), open = (spec.close ? 1 - k : k) * 0.3;
      left.position.x = -0.165 - open; right.position.x = 0.165 + open; light.material.opacity = 0.9 * (open / 0.3);
      group.scale.setScalar(0.6 + 0.4 * smooth(t / 0.8));
    },
  };
}
