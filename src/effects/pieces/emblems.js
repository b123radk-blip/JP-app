// Emblems: a light, simple 3D symbol that pops out beside the kanji after its last stroke and then keeps a small idle
// animation (a "?" that bounces, an arrow that nudges its way, ...). Shapes are built in a unit box (about 1 tall) and scaled
// to EFFECTS.emblem.size; `at` places them in the effect's space (default: up and to the right of the kanji).
import * as THREE from 'three';
import { EFFECTS } from '../../config.js';
import { pop } from './util.js';
import { BODY } from './emblem-body.js';
import { THINGS } from './emblem-things.js';

const tube = (pts, r, closed = false) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), closed, 'catmullrom', 0.2), 48, r, 10, closed);
const poly = (pts, r) => { const path = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i - 1], 0), new THREE.Vector3(...pts[i], 0))); return new THREE.TubeGeometry(path, 24 * (pts.length - 1), r, 8, false); };
const DIR_ROT = { up: 0, left: Math.PI / 2, down: Math.PI, right: -Math.PI / 2 };
const DIR_VEC = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };

// Each builder: (spec, mat) -> { meshes: Object3D[], idle(o, t, s) } where o = the emblem group, s = seconds since it popped.
const SHAPES = {
  arrow: (spec, mat) => {
    const g = new THREE.Group(); g.rotation.z = DIR_ROT[spec.dir] ?? 0;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 16), mat); shaft.position.y = -0.2;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 24), mat); head.position.y = 0.27;
    g.add(shaft, head);
    const d = DIR_VEC[spec.dir] ?? DIR_VEC.up;
    return { meshes: [g], idle(o, s) { const b = 0.35 * Math.abs(Math.sin(s * 3.2)); o.position.x += d[0] * b; o.position.y += d[1] * b; } };
  },
  question: (spec, mat) => {
    const pts = []; for (let i = 0; i <= 12; i++) { const a = (150 - (240 * i) / 12) * Math.PI / 180; pts.push([0.2 * Math.cos(a), 0.22 + 0.2 * Math.sin(a)]); }
    pts.push([0, -0.1]);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), mat); dot.position.y = -0.36;
    return { meshes: [new THREE.Mesh(tube(pts, 0.07), mat), dot], idle(o, s) { o.position.y += 0.25 * Math.abs(Math.sin(s * 2.6)); o.rotation.z = 0.25 * Math.sin(s * 1.7); } };
  },
  zzz: (spec, mat) => {
    const Z = [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]];
    const zs = [0.75, 0.6, 0.48].map((k) => { const m = new THREE.Mesh(poly(Z.map(([x, y]) => [x * k, y * k]), 0.055), mat.clone()); m.material.transparent = true; return m; });
    return { meshes: zs, idle(o, s) { zs.forEach((m, i) => { const u = (s * 0.35 + i / 3) % 1; m.position.set(0.25 * u + 0.12 * Math.sin(u * 6), -0.3 + 1.1 * u, 0); m.material.opacity = Math.sin(Math.PI * u); m.scale.setScalar(0.6 + 0.6 * u); }); } };
  },
  clock: (spec, mat) => {
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshBasicMaterial({ color: 0x101420, transparent: true, opacity: 0.6 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 10, 48), mat);
    const hand = (len, w) => { const h = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.04), mat); m.position.set(0, len / 2, 0.03); h.add(m); return h; };
    const minute = hand(0.34, 0.045), hour = hand(0.22, 0.065);
    return { meshes: [face, ring, minute, hour], idle(o, s) { minute.rotation.z = -s * 2.4; hour.rotation.z = -s * 0.2 - 1; } };
  },
  dots: (spec, mat) => {
    const n = spec.n ?? 3, dots = Array.from({ length: n }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 12), mat); m.position.x = (i - (n - 1) / 2) * 0.34; return m; });
    return { meshes: dots, idle(o, s) { dots.forEach((m, i) => { const x = (s - i * 0.5) / 0.35; m.scale.setScalar(x < 0 ? 0 : x < 1 ? 1 + 0.4 * Math.sin(Math.PI * x) : 1); }); } };
  },
};

Object.assign(SHAPES, BODY, THINGS);

export function create(ctx, spec) {
  const E = EFFECTS.emblem, group = new THREE.Group(), inner = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.1 });
  const shape = SHAPES[spec.type](spec, mat);
  inner.add(...shape.meshes); group.add(inner);
  const [ax, ay] = spec.at ?? [Math.max(E.at[0], ctx.halfWidth + 0.08), E.at[1]];   // beside the kanji (or the whole word)
  group.scale.setScalar(E.size); group.visible = false;
  return {
    group,
    step(t) {
      const s = t - ctx.rv.end - E.delay, k = pop(s, E.pop);
      group.visible = k > 0;
      if (!group.visible) return;
      inner.position.set(0, 0, 0); inner.rotation.z = 0;
      shape.idle(inner, Math.max(0, s));
      group.position.set(ax, ay, 0.02); inner.scale.setScalar(k);
    },
  };
}
