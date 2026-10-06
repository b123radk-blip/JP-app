// Emblems that are things: book, yen, crescent, compass, plus, calendar, stars, window, bowl, cup, phone, train, car, bolt,
// sun, cloud, target, house. Same contract as emblem-body.js; mesh counts in THINGS_COST (catalog.js uses them).
import * as THREE from 'three';
import { G, merge, solid, mesh } from './shape-kit.js';

const DARK = 0x1a1820, WHITE = 0xf6f2ea;
const bump = (s, every, dur) => { const u = (s % every) / dur; return u < 1 ? Math.sin(Math.PI * u) : 0; };

export const THINGS = {
  book: (spec, mat) => {
    const pages = solid(WHITE, 0.15);
    const open = mesh(merge([G.box(0.42, 0.56, 0.03, -0.21, 0, 0).rotateY(0.3), G.box(0.42, 0.56, 0.03, 0.21, 0, 0).rotateY(-0.3)]), pages);
    const cover = mesh(merge([G.box(0.46, 0.6, 0.02, -0.22, 0, -0.03).rotateY(0.3), G.box(0.46, 0.6, 0.02, 0.22, 0, -0.03).rotateY(-0.3), G.cyl(0.03, 0.03, 0.6, 0, 0, -0.06)]), mat);
    const leaf = new THREE.Group(), sheet = mesh(G.box(0.4, 0.54, 0.01, 0.2, 0, 0), pages); leaf.add(sheet);
    return { meshes: [cover, open, leaf], idle(o, s) { const u = (s % 2.6) / 0.9; leaf.rotation.y = -0.3 - (u < 1 ? Math.PI * 0.8 * (1 - Math.cos(Math.PI * u)) / 2 : 0); leaf.visible = u < 1; } };
  },
  yen: (spec, mat) => {
    const coin = new THREE.Group();
    coin.add(mesh(G.cyl(0.45, 0.45, 0.08, 0, 0, 0, Math.PI / 2), mat), mesh(merge([G.poly([[-0.2, 0.3], [0, 0.04], [0.2, 0.3]], 0.04), G.poly([[0, 0.04], [0, -0.3]], 0.04), G.box(0.36, 0.05, 0.05, 0, -0.03, 0), G.box(0.36, 0.05, 0.05, 0, -0.15, 0)].map((g) => g.translate(0, 0, 0.06))), solid(DARK, 0.05)));
    return { meshes: [coin], idle(o, s) { const u = (s % 2.6) / 0.8; coin.rotation.y = u < 1 ? Math.PI * 2 * (1 - Math.cos(Math.PI * u)) / 2 : 0; } };
  },
  crescent: (spec, mat) => {
    const sh = new THREE.Shape(); sh.absarc(0, 0, 0.45, 0.9, Math.PI * 2 - 0.9, false); sh.absarc(0.2, 0, 0.36, Math.PI * 2 - 1.2, 1.2, true);
    return { meshes: [mesh(G.extrude(sh, 0.1), mat)], idle(o, s) { o.rotation.z = 0.15 * Math.sin(s * 0.8); } };
  },
  compass: (spec, mat) => {
    const dirs = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 }, target = dirs[spec.dir] ?? 0;
    const rose = mesh(merge([0, 1, 2, 3].map((i) => G.cone(0.09, 0.42, Math.sin((i * Math.PI) / 2) * 0.24, Math.cos((i * Math.PI) / 2) * 0.24, 0.02, (-i * Math.PI) / 2))), mat);
    const needle = new THREE.Group(); needle.add(mesh(merge([G.cone(0.06, 0.34, 0, 0.17, 0.06), G.sphere(0.05, 0, 0, 0.06)]), solid(0xe04040, 0.5)));
    return { meshes: [mesh(G.cyl(0.5, 0.5, 0.04, 0, 0, -0.02, Math.PI / 2, 0, 0, 40), solid(DARK, 0.05)), rose, needle], idle(o, s) { needle.rotation.z = target + 0.9 * Math.exp(-s * 1.2) * Math.sin(s * 6); } };
  },
  plus: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.8, 0.2, 0.15, 0, 0, 0), G.box(0.2, 0.8, 0.15, 0, 0, 0)]), mat)], idle(o, s) { o.rotation.z = 0.2 * Math.sin(s * 1.2); } }),
  calendar: (spec, mat) => {
    const page = solid(WHITE, 0.15), dots = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) dots.push(G.box(0.1, 0.07, 0.02, -0.24 + c * 0.16, 0.02 - r * 0.15, 0.04));
    const flip = mesh(G.box(0.8, 0.62, 0.012, 0, -0.31, 0.05), page), hinge = new THREE.Group(); hinge.position.y = 0.24; hinge.add(flip);
    return { meshes: [mesh(merge([G.box(0.8, 0.8, 0.05, 0, -0.05, 0), G.cyl(0.03, 0.03, 0.14, -0.22, 0.36, 0.03), G.cyl(0.03, 0.03, 0.14, 0.22, 0.36, 0.03)]), page), mesh(G.box(0.8, 0.18, 0.07, 0, 0.27, 0.01), mat), mesh(merge(dots), solid(DARK, 0.05)), hinge],
      idle(o, s) { const u = (s % 3) / 0.7; hinge.rotation.x = u < 1 ? -Math.PI * 0.9 * Math.sin((Math.PI / 2) * u) : 0; flip.visible = u < 1; } };
  },
  stars: (spec, mat) => {
    const P = [[-0.45, 0.2], [-0.25, 0.25], [-0.08, 0.18], [0.08, 0.08], [0.15, -0.15], [0.42, -0.12], [0.45, 0.1]].slice(0, spec.n ?? 7);
    return { meshes: [mesh(merge(P.map(([x, y]) => new THREE.OctahedronGeometry(0.07).translate(x, y, 0))), mat)], idle(o, s) { mat.emissiveIntensity = 0.5 + 0.5 * Math.abs(Math.sin(s * 2.3)); } };
  },
  window: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.8, 0.07, 0.07, 0, 0.4, 0), G.box(0.8, 0.07, 0.07, 0, -0.4, 0), G.box(0.07, 0.8, 0.07, -0.4, 0, 0), G.box(0.07, 0.8, 0.07, 0.4, 0, 0), G.box(0.8, 0.04, 0.04, 0, 0, 0), G.box(0.04, 0.8, 0.04, 0, 0, 0)]), mat),
    mesh(new THREE.PlaneGeometry(0.76, 0.76).translate(0, 0, -0.02), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.45 }))], idle() {} }),
  bowl: (spec, mat) => {
    const lathe = new THREE.LatheGeometry([...Array(9).keys()].map((i) => { const a = (i / 8) * (Math.PI / 2); return new THREE.Vector2(0.42 * Math.sin(a) + 0.001, -0.3 * Math.cos(a)); }), 32);
    const sticks = new THREE.Group(); sticks.add(mesh(merge([G.cyl(0.018, 0.012, 0.9, 0.05, 0.25, 0.05, 0, 0, -0.5), G.cyl(0.018, 0.012, 0.9, 0.12, 0.25, 0.08, 0, 0, -0.42)]), solid(0x5a3010, 0.05)));
    return { meshes: [mesh(lathe, mat), mesh(G.sphere(0.36, 0, 0.02, 0, 1, 0.35, 1), solid(WHITE, 0.25)), sticks], idle(o, s) { sticks.rotation.z = 0.06 * bump(s, 1.4, 0.3); } };
  },
  cup: (spec, mat) => ({ meshes: [mesh(merge([G.cyl(0.26, 0.2, 0.55, 0, -0.05), G.torus(0.13, 0.035, Math.PI * 1.3, 0.28, -0.05, 0, -Math.PI * 0.65)]), mat), mesh(G.cyl(0.23, 0.23, 0.01, 0, 0.21, 0, 0, 0, 0, 24), solid(spec.drink ?? 0x7a4a20, 0.3))],
    idle(o, s) { o.rotation.z = -0.25 * bump(s, 3, 1.2); } }),
  phone: (spec, mat) => {                                   // an old-style handset: arched grip, ear and mouth cups
    const arch = [...Array(9).keys()].map((i) => { const a = Math.PI * (0.15 + 0.7 * (i / 8)); return [-Math.cos(a) * 0.4, Math.sin(a) * 0.16 - 0.02]; });
    const waves = [0, 1].map(() => new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0 }));
    const rings = waves.map((m, i) => mesh(G.torus(0.5 + i * 0.13, 0.02, 1.0, 0, 0.05, 0, Math.PI / 2 - 0.5), m));
    const handset = mesh(merge([G.tube(arch, 0.07), G.sphere(0.13, -0.38, -0.08, 0, 1, 0.55, 0.8), G.sphere(0.13, 0.38, -0.08, 0, 1, 0.55, 0.8)]), mat);
    return { meshes: [handset, ...rings], idle(o, s) { const ring = s % 2 < 1; o.rotation.z = (ring ? 0.1 * Math.sin(s * 40) : 0) - 0.15; waves.forEach((w, i) => { w.opacity = ring ? 0.8 * Math.abs(Math.sin(s * 6 + i)) : 0; }); } };
  },
  train: (spec, mat) => ({ meshes: [mesh(merge([G.box(1.0, 0.42, 0.3, 0, 0.05, 0), G.sphere(0.21, 0.5, 0.05, 0, 0.6, 1, 0.7)]), mat),
    mesh(merge([0, 1, 2, 3].map((i) => G.box(0.16, 0.13, 0.02, -0.33 + i * 0.22, 0.12, 0.16)).concat([-0.32, -0.1, 0.12, 0.34].map((x) => G.cyl(0.07, 0.07, 0.34, x, -0.2, 0, Math.PI / 2)))), solid(DARK, 0.05))],
    idle(o, s) { o.position.x += 0.04 * Math.sin(s * 1.5); o.position.y += 0.01 * Math.abs(Math.sin(s * 9)); } }),
  car: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.9, 0.24, 0.32, 0, -0.05, 0), G.box(0.5, 0.22, 0.3, -0.05, 0.17, 0)]), mat),
    mesh(merge([[-0.28, 0.17], [0.15, 0.17]].map(([x, y]) => G.box(0.18, 0.14, 0.02, x, y, 0.16)).concat([-0.28, 0.28].map((x) => G.cyl(0.1, 0.1, 0.36, x, -0.18, 0, Math.PI / 2)))), solid(DARK, 0.05))],
    idle(o, s) { o.position.y += 0.012 * Math.abs(Math.sin(s * 7)); } }),
  bolt: (spec, mat) => {
    const sh = new THREE.Shape(); [[0.12, 0.5], [-0.2, 0.02], [0.02, 0.02], [-0.12, -0.5], [0.24, 0.08], [0.02, 0.08], [0.2, 0.5]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    return { meshes: [mesh(G.extrude(sh, 0.1), mat)], idle(o, s) { mat.emissiveIntensity = 0.4 + 1.4 * bump(s, 1.7, 0.15); } };
  },
  sun: (spec, mat) => ({ meshes: [mesh(merge([G.sphere(0.24), ...[...Array(8).keys()].map((i) => { const a = (i / 8) * Math.PI * 2; return G.cone(0.06, 0.16, Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0, a - Math.PI / 2); })]), mat)], idle(o, s) { o.rotation.z = s * 0.4; } }),
  cloud: (spec, mat) => ({ meshes: [mesh(merge([G.sphere(0.2, -0.22, -0.05), G.sphere(0.27, 0, 0.06), G.sphere(0.19, 0.24, -0.04), G.sphere(0.15, 0.08, -0.13, 1.8, 0.6, 1)]), mat)], idle(o, s) { o.position.x += 0.05 * Math.sin(s * 0.7); } }),
  target: (spec, mat) => ({ meshes: [mesh(merge([G.torus(0.42, 0.04), G.torus(0.27, 0.04), G.sphere(0.11)]), mat)], idle(o, s) { o.scale.multiplyScalar(1 + 0.1 * bump(s, 1.5, 0.3)); } }),
  house: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.66, 0.46, 0.4, 0, -0.18, 0), new THREE.ConeGeometry(0.56, 0.36, 4).rotateY(Math.PI / 4).translate(0, 0.23, 0)]), mat), mesh(G.box(0.16, 0.26, 0.02, 0, -0.28, 0.21), solid(DARK, 0.05))], idle() {} }),
};
export const THINGS_COST = { book: 3, yen: 2, crescent: 1, compass: 3, plus: 1, calendar: 4, stars: 1, window: 2, bowl: 3, cup: 2, phone: 3, train: 2, car: 2, bolt: 1, sun: 1, cloud: 1, target: 1, house: 2 };
