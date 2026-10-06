// Emblems about people and senses: speech, eye, ear, hand, foot, person, heart, note, lightbulb.
// Each: (spec, mat) -> { meshes, idle(o, s) }; o = the emblem's inner group, s = seconds since it popped out.
// Mesh counts (= draw calls) are listed in catalog.js; keep them in step.
import * as THREE from 'three';
import { G, merge, solid, mesh, heartShape } from './shape-kit.js';

const DARK = 0x1a1820;
const wave = (s, every, dur) => { const u = (s % every) / dur; return u < 1 ? Math.sin(Math.PI * u) : 0; };   // a bump every `every` s

export const BODY = {
  speech: (spec, mat) => {
    const sh = new THREE.Shape(), w = 0.5, h = 0.3, r = 0.14;
    sh.moveTo(-w + r, -h); sh.lineTo(-0.12, -h); sh.lineTo(-0.36, -0.56); sh.lineTo(-0.28, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r);
    sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
    const dark = solid(DARK, 0.1), dots = [-0.22, 0, 0.22].map((x) => mesh(G.sphere(0.065, x, 0, 0.1), dark));
    return { meshes: [mesh(G.extrude(sh, 0.1), mat), ...dots], idle(o, s) { dots.forEach((d, i) => { d.position.y = 0.06 * wave(s - i * 0.18, 1.2, 0.35); }); } };
  },
  eye: (spec, mat) => {
    const lens = []; for (let i = 0; i <= 24; i++) { const x = -0.5 + i / 24; lens.push([x, 0.3 * (1 - (x * x) / 0.25)]); } for (let i = 23; i > 0; i--) { const x = -0.5 + i / 24; lens.push([x, -0.3 * (1 - (x * x) / 0.25)]); }
    const lid = new THREE.Group(), iris = new THREE.Group();
    iris.add(mesh(G.sphere(0.17, 0, 0, 0, 1, 1, 0.4), solid(spec.iris ?? 0x3a7ad0, 0.35)), mesh(merge([G.sphere(0.085, 0, 0, 0.05, 1, 1, 0.4), G.sphere(0.035, 0.06, 0.06, 0.09)]), solid(DARK, 0.05)));
    lid.add(mesh(G.tube(lens, 0.035, true), mat), iris);
    return { meshes: [lid], idle(o, s) { iris.position.x = 0.12 * Math.sin(s * 0.9); lid.scale.y = 1 - 0.9 * wave(s, 3.2, 0.22); } };
  },
  ear: (spec, mat) => {
    const arc = (R, a0, a1, cx = 0) => Array.from({ length: 16 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 15; return [cx + R * Math.cos(a), R * 1.3 * Math.sin(a)]; });
    const ear = mesh(merge([G.tube(arc(0.3, -1.3, 2.6), 0.055), G.tube(arc(0.15, -0.6, 2.2, 0.03), 0.035)]), mat);
    const waves = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0 }));
    const rings = waves.map((m) => { const r = mesh(G.torus(0.3, 0.02, 1.4, 0, 0, 0, Math.PI - 0.7), m); r.position.x = 0.1; return r; });
    return { meshes: [ear, ...rings], idle(o, s) { rings.forEach((r, i) => { const u = (s * 0.7 + i / 3) % 1; r.scale.setScalar(1.2 + 1.2 * u); waves[i].opacity = Math.sin(Math.PI * u) * 0.8; }); } };
  },
  hand: (spec, mat) => {
    const fingers = [-0.2, -0.07, 0.07, 0.2].map((x, i) => G.capsule(0.06, 0.22 + (i === 1 || i === 2 ? 0.06 : 0), x, 0.28 + (i === 1 || i === 2 ? 0.03 : 0), 0, -x * 0.5));
    const pivot = new THREE.Group(), h = mesh(merge([G.sphere(0.3, 0, -0.1, 0, 1, 1.05, 0.4), ...fingers, G.capsule(0.065, 0.2, -0.32, -0.02, 0, 0.9)]), mat);
    h.position.y = 0.35; pivot.position.y = -0.35; pivot.add(h);
    return { meshes: [pivot], idle(o, s) { pivot.rotation.z = 0.28 * Math.sin(s * 5) * (0.5 + 0.5 * Math.sin(s * 0.8)); } };
  },
  foot: (spec, mat) => {
    const print = (m) => merge([G.sphere(0.17, 0, -0.1, 0, 0.72, 1.25, 0.25), ...[0, 1, 2, 3, 4].map((i) => G.sphere(0.06 - i * 0.006, m * (-0.14 + i * 0.075), 0.23 - Math.abs(i - 1.2) * 0.03, 0, 1, 1, 0.3))]);
    const left = mesh(print(1), mat), right = mesh(print(-1), mat);           // the right foot is mirrored in the geometry (a negative scale would flip its faces)
    left.position.set(-0.26, -0.3, 0); right.position.set(0.26, 0.32, 0);
    return { meshes: [left, right], idle(o, s) { const u = s % 2.4; left.visible = u < 2.1; right.visible = u > 0.6 && u < 2.1; } };
  },
  person: (spec, mat) => {
    const body = mesh(merge([G.sphere(0.13, 0, 0.36), G.capsule(0.1, 0.22, 0, 0.02), G.capsule(0.055, 0.28, -0.08, -0.33, 0, 0.1), G.capsule(0.055, 0.28, 0.08, -0.33, 0, -0.1), G.capsule(0.05, 0.24, -0.17, 0.05, 0, -0.5)]), mat);
    const arm = new THREE.Group(), a = mesh(G.capsule(0.05, 0.24, 0, 0.14), mat); arm.position.set(0.12, 0.12, 0); arm.add(a);
    return { meshes: [body, arm], idle(o, s) { arm.rotation.z = -0.9 + 0.35 * Math.sin(s * 4); } };
  },
  heart: (spec, mat) => ({ meshes: [mesh(G.extrude(heartShape(), 0.2), mat)], idle(o, s) { o.scale.multiplyScalar(1 + 0.12 * wave(s, 1.1, 0.18) + 0.08 * wave(s - 0.25, 1.1, 0.18)); } }),
  note: (spec, mat) => ({ meshes: [mesh(merge([G.sphere(0.15, -0.08, -0.32, 0, 1.3, 1, 0.5), G.cyl(0.03, 0.03, 0.62, 0.1, -0.02), G.box(0.22, 0.07, 0.06, 0.2, 0.26, 0, -0.5)]), mat)], idle(o, s) { o.rotation.z = 0.2 * Math.sin(s * 3); o.position.y += 0.08 * Math.abs(Math.sin(s * 3)); } }),
  lightbulb: (spec, mat) => {
    const ring = (y) => G.torus(0.115, 0.018).rotateX(Math.PI / 2).translate(0, y, 0);
    const glass = solid(spec.color, 0.2), base = mesh(merge([G.cyl(0.12, 0.1, 0.18, 0, -0.32), ring(-0.27), ring(-0.35)]), solid(0x9a9aa8, 0.1, { metalness: 0.8, roughness: 0.3 }));
    return { meshes: [mesh(merge([G.sphere(0.3, 0, 0.12), G.cyl(0.13, 0.15, 0.14, 0, -0.18)]), glass), base], idle(o, s) { glass.emissiveIntensity = 0.2 + 1.6 * Math.min(1, s / 0.3) * (0.85 + 0.15 * Math.sin(s * 9)); } };
  },
};
export const BODY_COST = { speech: 4, eye: 3, ear: 4, hand: 1, foot: 2, person: 2, heart: 1, note: 1, lightbulb: 2 };
