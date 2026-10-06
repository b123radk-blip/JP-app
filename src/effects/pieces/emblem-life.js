// Emblems that are animals, plants, vehicles and buildings: bird, cow, snail, leaf, flower, bike, plane (paper), boat, stairs,
// blocks, puzzle, pill, hospital, museum, shield, letter. Same contract as emblem-body.js; mesh counts in LIFE_COST.
import * as THREE from 'three';
import { G, merge, solid, mesh } from './shape-kit.js';
import { smooth } from './util.js';

const DARK = 0x1a1820, WHITE = 0xf6f2ea;
const bump = (s, every, dur) => { const u = (s % every) / dur; return u < 1 ? Math.sin(Math.PI * u) : 0; };
const shape = (pts) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath(); return sh; };

export const LIFE = {
  bird: (spec, mat) => {                                   // a little bird flapping its wings, beak open (chirp, fly)
    const wing = (d) => { const g = new THREE.Group(); g.add(mesh(G.extrude(shape([[0, 0], [0.32 * d, 0.06], [0.28 * d, -0.08], [0.1 * d, -0.1]]), 0.02).rotateX(-Math.PI / 2), mat)); g.position.set(0.02 * d, 0.04, 0); return g; };
    const L = wing(-1), R = wing(1);
    return { meshes: [mesh(merge([G.sphere(0.2, 0, 0, 0, 1.25, 1, 1), G.sphere(0.13, 0.22, 0.13), G.cone(0.08, 0.2, -0.3, 0.02, 0, Math.PI / 2 + 0.4)]), mat), mesh(merge([G.cone(0.05, 0.13, 0.39, 0.12, 0, -Math.PI / 2), G.sphere(0.03, 0.27, 0.17, 0.11)]), solid(0xffa030, 0.4)), L, R],
      idle(o, s) { const f = Math.sin(s * 14) * 0.9; L.rotation.z = -f; R.rotation.z = f; o.position.y += 0.05 * Math.sin(s * 3); } };
  },
  cow: (spec, mat) => ({ meshes: [mesh(merge([G.sphere(0.3, 0, 0, 0, 1, 1.1, 0.8), G.sphere(0.1, -0.36, 0.14, 0, 1.6, 0.7, 0.6), G.sphere(0.1, 0.36, 0.14, 0, 1.6, 0.7, 0.6)]), mat),
    mesh(merge([G.cone(0.06, 0.22, -0.2, 0.36, 0, 0.5), G.cone(0.06, 0.22, 0.2, 0.36, 0, -0.5), G.sphere(0.16, 0, -0.2, 0.14, 1.3, 0.8, 0.8)]), solid(0xf0d8c0, 0.3)), mesh(merge([G.sphere(0.04, -0.11, 0.06, 0.24), G.sphere(0.04, 0.11, 0.06, 0.24), G.sphere(0.025, -0.06, -0.2, 0.27), G.sphere(0.025, 0.06, -0.2, 0.27), G.sphere(0.09, 0.15, 0.2, 0.18, 1, 0.8, 0.4)]), solid(DARK, 0.05))],
    idle(o, s) { o.rotation.z = 0.1 * Math.sin(s * 1.5); } }),
  snail: (spec, mat) => {                                  // a snail creeping very slowly (late, slow)
    const shell = []; for (let i = 0; i <= 40; i++) { const a = i * 0.32, r = 0.04 + i * 0.0065; shell.push([r * Math.cos(a), 0.12 + r * Math.sin(a)]); }
    return { meshes: [mesh(merge([G.tube(shell.reverse(), 0.04), G.sphere(0.26, 0, 0.12, -0.05, 1, 1, 0.5)]), mat), mesh(merge([G.capsule(0.07, 0.6, 0.02, -0.16, 0, Math.PI / 2), G.cyl(0.012, 0.012, 0.16, 0.32, -0.04, 0, 0, 0, -0.3), G.sphere(0.03, 0.35, 0.04)]), solid(0xd8c8a0, 0.3))],
      idle(o, s) { o.position.x += 0.04 * ((s * 0.05) % 1) - 0.02; o.scale.x *= 1 + 0.03 * Math.sin(s * 2); } };
  },
  leaf: (spec, mat) => {
    const sh = new THREE.Shape(); sh.moveTo(0, -0.42); sh.bezierCurveTo(0.36, -0.2, 0.32, 0.2, 0, 0.44); sh.bezierCurveTo(-0.32, 0.2, -0.36, -0.2, 0, -0.42);
    return { meshes: [mesh(G.extrude(sh, 0.03), mat), mesh(merge([G.box(0.02, 0.82, 0.02, 0, 0, 0.03), ...[-0.15, 0.0, 0.15].flatMap((y) => [G.box(0.02, 0.2, 0.02, -0.08, y + 0.05, 0.03, 0.9), G.box(0.02, 0.2, 0.02, 0.08, y + 0.05, 0.03, -0.9)]), G.box(0.025, 0.2, 0.025, 0, -0.5, 0)]), solid(0x2a6a20, 0.2))],
      idle(o, s) { o.rotation.z = 0.3 * Math.sin(s * 1.6); o.rotation.y = 0.4 * Math.sin(s * 1.1); } };
  },
  flower: (spec, mat) => {
    const head = new THREE.Group(); head.add(mesh(merge([...Array(8).keys()].map((i) => { const a = (i / 8) * Math.PI * 2; return G.sphere(0.12, 0.17 * Math.cos(a), 0.17 * Math.sin(a), 0, 1, 1, 0.4); })), mat), mesh(G.sphere(0.11, 0, 0, 0.04, 1, 1, 0.6), solid(0x7a4a10, 0.3)));
    head.position.y = 0.16;
    return { meshes: [head, mesh(merge([G.cyl(0.02, 0.02, 0.6, 0, -0.2), G.sphere(0.08, 0.08, -0.25, 0, 1.4, 0.5, 0.4)]), solid(0x3a9a30, 0.3))], idle(o, s) { head.rotation.z = s * 0.6; o.rotation.z = 0.08 * Math.sin(s * 1.4); } };
  },
  bike: (spec, mat) => {                                   // a bicycle, wheels turning (ride)
    const wheel = (x) => { const w = new THREE.Group(); w.add(mesh(merge([G.torus(0.2, 0.025), G.box(0.38, 0.015, 0.015, 0, 0, 0), G.box(0.015, 0.38, 0.015, 0, 0, 0)]), solid(DARK, 0.1))); w.position.x = x; return w; };
    const A = wheel(-0.3), B = wheel(0.3);
    return { meshes: [mesh(G.poly([[-0.3, 0], [-0.05, 0], [0.18, 0.24], [-0.12, 0.24], [-0.05, 0], [-0.15, 0.34], [-0.15, 0.3], [0.3, 0], [0.18, 0.24], [0.18, 0.36]], 0.025), mat), A, B], idle(o, s) { A.rotation.z = B.rotation.z = -s * 6; o.position.x += 0.04 * Math.sin(s * 1.2); } };
  },
  plane: (spec, mat) => {                                  // a paper plane gliding in loops
    const v = [[0.45, 0, 0], [-0.35, 0.02, 0.3], [-0.3, 0, 0], [0.45, 0, 0], [-0.3, 0, 0], [-0.35, 0.02, -0.3], [0.45, 0, 0], [-0.3, 0, 0], [-0.3, -0.12, 0]];
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v.flat()), 3)); g.computeVertexNormals();
    const p = mesh(g, new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.4, side: THREE.DoubleSide, flatShading: true }));
    return { meshes: [p], idle(o, s) { p.position.set(0.25 * Math.sin(s * 1.3), 0.1 * Math.sin(s * 2.6), 0); p.rotation.set(1.0 + 0.2 * Math.sin(s * 2.6), 0.5, 0.15 * Math.cos(s * 1.3)); } };
  },
  boat: (spec, mat) => ({ meshes: [mesh(G.extrude(shape([[-0.45, 0], [0.45, 0], [0.32, -0.18], [-0.32, -0.18]]), 0.26), mat), mesh(merge([G.extrude(shape([[0.02, 0.06], [0.02, 0.6], [0.36, 0.06]]), 0.02), G.cyl(0.015, 0.015, 0.62, 0, 0.3, 0)]), solid(WHITE, 0.3))], idle(o, s) { o.rotation.z = 0.12 * Math.sin(s * 1.8); o.position.y += 0.03 * Math.sin(s * 1.8 + 1); } }),
  stairs: (spec, mat) => {                                 // a flight of steps, a ball bouncing down them (steps, descend)
    const ball = mesh(G.sphere(0.07), solid(spec.ball ?? 0xff6040, 0.5));
    return { meshes: [mesh(merge([0, 1, 2, 3].map((i) => G.box(0.22, 0.16 * (4 - i), 0.3, -0.33 + i * 0.22, -0.4 + 0.08 * (4 - i), 0))), mat), ball],
      idle(o, s) { const u = (s % 2.2) / 2.2, k = Math.min(3, Math.floor(u * 4)), f = u * 4 - k; ball.position.set(-0.33 + (k + f) * 0.22, -0.4 + 0.16 * (4 - k) + 0.07 - 0.16 * f + 0.12 * Math.sin(Math.PI * f), 0.1); } };
  },
  blocks: (spec, mat) => {                                 // blocks stacking up one by one (build)
    const cols = [spec.color, 0x40a0e0, 0xf0c040], cubes = cols.map((c, i) => mesh(G.box(0.3, 0.26, 0.3, [-0.17, 0.17, 0][i], [-0.3, -0.3, -0.04][i], 0), solid(c, 0.4)));
    return { meshes: cubes, idle(o, s) { const u = s % 3.6; cubes.forEach((c, i) => { const k = smooth((u - i * 0.5) / 0.35); c.position.y = 0.5 * (1 - k); c.visible = k > 0 && u < 3.2; }); } };
  },
  puzzle: (spec, mat) => {                                 // two puzzle pieces snapping together (fit, match)
    const a = shape([[-0.3, -0.25], [0, -0.25], [0, -0.08], [0.1, -0.08], [0.1, 0.08], [0, 0.08], [0, 0.25], [-0.3, 0.25]]), b = shape([[0, -0.25], [0.3, -0.25], [0.3, 0.25], [0, 0.25], [0, 0.08], [0.1, 0.08], [0.1, -0.08], [0, -0.08]]);
    const A = mesh(G.extrude(a, 0.08), mat), B = mesh(G.extrude(b, 0.08), solid(spec.other ?? 0x40a0e0, 0.4));
    return { meshes: [A, B], idle(o, s) { const u = s % 2.6, k = u < 0.6 ? 0.2 * (1 - smooth(u / 0.6)) : u > 2.0 ? 0.2 * smooth((u - 2.0) / 0.6) : 0; A.position.x = -k; B.position.x = k; } };
  },
  pill: (spec, mat) => ({ meshes: [mesh(merge([G.cyl(0.13, 0.13, 0.3, -0.15, 0, 0, 0, 0, Math.PI / 2), G.sphere(0.13, -0.3, 0)]), mat), mesh(merge([G.cyl(0.13, 0.13, 0.3, 0.15, 0, 0, 0, 0, Math.PI / 2), G.sphere(0.13, 0.3, 0)]), solid(WHITE, 0.3))], idle(o, s) { o.rotation.z = 0.5 + 0.3 * Math.sin(s * 1.5); } }),
  hospital: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.8, 0.6, 0.3, 0, -0.1, 0), G.box(0.3, 0.2, 0.3, 0, 0.3, 0)]), solid(WHITE, 0.3)), mesh(merge([G.box(0.2, 0.06, 0.02, 0, 0.3, 0.16), G.box(0.06, 0.2, 0.02, 0, 0.3, 0.16)]), mat), mesh(merge([-0.28, -0.1, 0.1, 0.28].flatMap((x) => [G.box(0.1, 0.1, 0.02, x, 0.02, 0.16), G.box(0.1, 0.1, 0.02, x, -0.2, 0.16)])), solid(0x80b8e0, 0.4))], idle(o, s) { o.children[1].scale.setScalar(1 + 0.15 * bump(s, 1.5, 0.3)); } }),
  museum: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.9, 0.08, 0.3, 0, -0.4, 0), G.box(0.86, 0.06, 0.3, 0, 0.12, 0), G.extrude(shape([[-0.48, 0.15], [0.48, 0.15], [0, 0.38]]), 0.26), ...[-0.3, -0.1, 0.1, 0.3].map((x) => G.cyl(0.05, 0.05, 0.46, x, -0.14, 0))]), mat)], idle(o, s) { o.rotation.y = 0.25 * Math.sin(s * 0.9); } }),
  shield: (spec, mat) => ({ meshes: [mesh(G.extrude(shape([[-0.32, 0.36], [0.32, 0.36], [0.3, -0.05], [0, -0.42], [-0.3, -0.05]]), 0.08), mat), mesh(merge([G.box(0.06, 0.6, 0.04, 0, 0, 0.06), G.box(0.46, 0.06, 0.04, 0, 0.12, 0.06)]), solid(0xffd060, 0.4))], idle(o, s) { o.scale.multiplyScalar(1 + 0.08 * bump(s, 1.8, 0.3)); } }),
  letter: (spec, mat) => ({ meshes: [mesh(G.box(0.8, 0.5, 0.04, 0, 0, 0), solid(WHITE, 0.25)), mesh(merge([G.poly([[-0.38, 0.23], [0, -0.04], [0.38, 0.23]], 0.025).translate(0, 0, 0.03)]), mat)], idle(o, s) { o.rotation.z = 0.1 * Math.sin(s * 1.7); o.position.y += 0.04 * Math.sin(s * 1.7); } }),
};
export const LIFE_COST = { bird: 4, cow: 3, snail: 2, leaf: 2, flower: 3, bike: 3, plane: 1, boat: 2, stairs: 2, blocks: 3, puzzle: 2, pill: 2, hospital: 3, museum: 1, shield: 2, letter: 2 };
