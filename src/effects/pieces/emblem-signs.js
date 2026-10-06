// Emblems that are signs and symbols: stop, check, cross, exclaim, equals, repeat, swap, flag, pin, signpost, ticket, tag,
// pie, trophy, gem, onsen, globe, splash, rainbow, frown. Same contract as emblem-body.js: (spec, mat) -> { meshes, idle(o, s) };
// the mesh count of each is its draw-call cost (SIGNS_COST, used by catalog.js; npm run e2e checks them).
import * as THREE from 'three';
import { G, merge, solid, mesh } from './shape-kit.js';
import { smooth } from './util.js';

const DARK = 0x1a1820, WHITE = 0xf6f2ea;
const bump = (s, every, dur) => { const u = (s % every) / dur; return u < 1 ? Math.sin(Math.PI * u) : 0; };
const ngon = (n, r, rot = 0) => { const sh = new THREE.Shape(); for (let i = 0; i < n; i++) { const a = rot + (i / n) * Math.PI * 2; i ? sh.lineTo(r * Math.cos(a), r * Math.sin(a)) : sh.moveTo(r * Math.cos(a), r * Math.sin(a)); } sh.closePath(); return sh; };
const sector = (r, a0, a1) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.absarc(0, 0, r, a0, a1, false); sh.closePath(); return sh; };
const arrowHead = (x, y, rz, s = 1) => G.cone(0.1 * s, 0.2 * s, x, y, 0, rz);

export const SIGNS = {
  stop: (spec, mat) => {                                   // Japan's stop sign: a red triangle, point down, saying 止まれ
    const tri = new THREE.Shape(); tri.moveTo(-0.46, 0.3); tri.lineTo(0.46, 0.3); tri.lineTo(0, -0.5); tri.closePath();
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.font = '700 84px "NSJ", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(spec.text, 128, 68);
    const label = mesh(new THREE.PlaneGeometry(0.56, 0.28).translate(0, 0.1, 0.075), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
    const pole = mesh(G.cyl(0.03, 0.03, 0.5, 0, -0.62, -0.02), solid(0x9098a0, 0.1));
    return { meshes: [mesh(G.extrude(tri, 0.06), mat), label, pole], idle(o, s) { o.rotation.z = 0.12 * Math.sin(s * 9) * Math.exp(-(s % 3) * 3); } };
  },
  check: (spec, mat) => ({ meshes: [mesh(G.poly([[-0.34, 0.02], [-0.1, -0.26], [0.36, 0.3]], 0.075), mat)], idle(o, s) { o.scale.multiplyScalar(1 + 0.12 * bump(s, 1.6, 0.3)); } }),
  cross: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.8, 0.16, 0.12, 0, 0, 0, Math.PI / 4), G.box(0.8, 0.16, 0.12, 0, 0, 0, -Math.PI / 4)]), mat)], idle(o, s) { o.rotation.z = 0.15 * Math.sin(s * 14) * bump(s, 1.8, 0.5); } }),
  exclaim: (spec, mat) => ({ meshes: [mesh(merge([G.capsule(0.08, 0.4, 0, 0.12), G.sphere(0.09, 0, -0.34)]), mat)], idle(o, s) { o.position.y += 0.2 * bump(s, 1.2, 0.35); } }),
  equals: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.7, 0.13, 0.12, 0, 0.13, 0), G.box(0.7, 0.13, 0.12, 0, -0.13, 0)]), mat)], idle(o, s) { o.scale.multiplyScalar(1 + 0.08 * bump(s, 2, 0.4)); } }),
  repeat: (spec, mat) => {                                 // a circular arrow going round
    const ring = new THREE.Group(); ring.add(mesh(merge([G.torus(0.32, 0.055, Math.PI * 1.6, 0, 0, 0, 0.3), arrowHead(0.32 * Math.cos(0.3), 0.32 * Math.sin(0.3) - 0.03, Math.PI)]), mat));
    return { meshes: [ring], idle(o, s) { ring.rotation.z = -s * 1.6; } };
  },
  swap: (spec, mat) => {                                   // two arrows passing each other (exchange, cross)
    const a = mesh(merge([G.box(0.5, 0.07, 0.07, -0.05, 0, 0), arrowHead(0.26, 0, -Math.PI / 2, 0.8)]), mat), b = mesh(merge([G.box(0.5, 0.07, 0.07, 0.05, 0, 0), arrowHead(-0.26, 0, Math.PI / 2, 0.8)]), solid(spec.other, 0.45));
    a.position.y = 0.14; b.position.y = -0.14;
    return { meshes: [a, b], idle(o, s) { const k = 0.08 * Math.sin(s * 3); a.position.x = k; b.position.x = -k; } };
  },
  flag: (spec, mat) => {                                   // kind: start (plain colour), finish (checkered), japan (white, red disc)
    const cloth = new THREE.Group(), w = 0.56, h = 0.38;
    cloth.add(mesh(G.box(w, h, 0.02, w / 2, 0, 0), spec.kind === 'start' ? mat : solid(WHITE, 0.25)));
    if (spec.kind === 'finish') { const sq = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) sq.push(G.box(w / 4, h / 3, 0.03, w / 8 + (i * w) / 4, -h / 3 + (j * h) / 3, 0)); cloth.add(mesh(merge(sq), solid(DARK, 0.05))); }
    if (spec.kind === 'japan') cloth.add(mesh(G.cyl(0.1, 0.1, 0.03, w / 2, 0, 0, Math.PI / 2), solid(0xd02030, 0.4)));
    cloth.position.set(-0.22, 0.24, 0);
    return { meshes: [mesh(G.cyl(0.025, 0.025, 1.0, -0.24, 0, 0), solid(0xc0b8a8, 0.1)), cloth], idle(o, s) { cloth.rotation.y = 0.35 * Math.sin(s * 3); cloth.scale.x = 1 - 0.12 * Math.abs(Math.sin(s * 3)); } };
  },
  pin: (spec, mat) => {                                    // a map pin dropping onto its spot
    const pin = new THREE.Group(); pin.add(mesh(merge([G.sphere(0.2, 0, 0.18), G.cone(0.17, 0.4, 0, -0.08, 0, Math.PI)]), mat), mesh(G.sphere(0.08, 0, 0.18, 0.15), solid(WHITE, 0.3)));
    const shadow = mesh(G.cyl(0.16, 0.16, 0.01, 0, -0.3, 0, Math.PI / 2 - 0.3), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    return { meshes: [pin, shadow], idle(o, s) { const u = s % 3.2, d = u < 0.4 ? 1 - smooth(u / 0.4) : 0; pin.position.y = 0.5 * d + 0.06 * Math.abs(Math.sin(Math.min(u, 0.9) * 10)) * (u > 0.4 && u < 0.9 ? 1 : 0); } };
  },
  signpost: (spec, mat) => {
    const boards = new THREE.Group(), sh = (dir) => { const s = new THREE.Shape(), x = dir * 0.42; s.moveTo(0, -0.08); s.lineTo(x - dir * 0.1, -0.08); s.lineTo(x, 0); s.lineTo(x - dir * 0.1, 0.08); s.lineTo(0, 0.08); s.closePath(); return s; };
    boards.add(mesh(merge([G.extrude(sh(1), 0.04).translate(0, 0.28, 0), G.extrude(sh(-1), 0.04).translate(0, 0.06, 0)]), mat));
    return { meshes: [mesh(G.cyl(0.03, 0.03, 0.95, 0, -0.05, -0.03), solid(0x6a4a2a, 0.1)), boards], idle(o, s) { boards.rotation.y = 0.25 * Math.sin(s * 1.1); } };
  },
  ticket: (spec, mat) => {                                 // a numbered queue ticket popping out of a slot
    const sh = new THREE.Shape(); sh.moveTo(-0.3, -0.4); sh.lineTo(0.3, -0.4); sh.lineTo(0.3, -0.06); sh.absarc(0.3, 0, 0.06, -Math.PI / 2, Math.PI / 2, true); sh.lineTo(0.3, 0.4); sh.lineTo(-0.3, 0.4); sh.lineTo(-0.3, 0.06); sh.absarc(-0.3, 0, 0.06, Math.PI / 2, -Math.PI / 2, true); sh.closePath();
    const num = mesh(merge([G.box(0.07, 0.3, 0.03, -0.1, 0.12, 0.04), G.torus(0.09, 0.03, Math.PI * 2, 0.1, 0.12, 0.04), G.box(0.4, 0.03, 0.03, 0, -0.2, 0.04), G.box(0.3, 0.03, 0.03, 0, -0.28, 0.04)]), solid(DARK, 0.05));
    const t = new THREE.Group(); t.add(mesh(G.extrude(sh, 0.04), mat), num);
    return { meshes: [t], idle(o, s) { t.position.y = -0.1 + 0.1 * smooth((s % 2.8) / 0.5); t.rotation.z = 0.05 * Math.sin(s * 2); } };
  },
  tag: (spec, mat) => {                                    // a price tag swinging on its string
    const sh = new THREE.Shape(); sh.moveTo(-0.15, 0.3); sh.lineTo(0.15, 0.3); sh.lineTo(0.28, 0.12); sh.lineTo(0.28, -0.4); sh.lineTo(-0.28, -0.4); sh.lineTo(-0.28, 0.12); sh.closePath();
    const yen = [G.poly([[-0.12, 0.02], [0, -0.12], [0.12, 0.02]], 0.025), G.poly([[0, -0.12], [0, -0.32]], 0.025), G.box(0.22, 0.03, 0.03, 0, -0.15, 0), G.box(0.22, 0.03, 0.03, 0, -0.22, 0)].map((g) => g.translate(0, 0, 0.04));
    const tag = new THREE.Group(); tag.add(mesh(G.extrude(sh, 0.04), mat), mesh(merge([G.torus(0.05, 0.02, Math.PI * 2, 0, 0.16, 0.03), ...yen]), solid(DARK, 0.05)));
    tag.position.y = -0.15;
    const hang = new THREE.Group(); hang.add(tag); hang.position.y = 0.2;
    return { meshes: [mesh(G.cyl(0.008, 0.008, 0.25, 0, 0.32, 0, 0, 0, 0.3), solid(WHITE, 0.1)), hang], idle(o, s) { hang.rotation.z = 0.25 * Math.sin(s * 2.2); } };
  },
  pie: (spec, mat) => {                                    // a pie chart; part = the share lifted out (0 = whole, it closes up)
    const part = spec.part ?? 0.25, a0 = Math.PI / 2, cut = part * Math.PI * 2;
    const rest = mesh(G.extrude(sector(0.42, a0, a0 + Math.PI * 2 - Math.max(cut, 0.001)), 0.1), part ? solid(spec.rest ?? 0xf0e6d2, 0.3) : mat);
    const slice = mesh(G.extrude(sector(0.42, a0 - Math.max(cut, 0.001), a0), 0.1), mat), mid = a0 - cut / 2;
    return { meshes: [rest, slice], idle(o, s) { const k = part ? 0.14 * (0.5 + 0.5 * Math.sin(s * 2)) : 0; slice.position.set(Math.cos(mid) * k, Math.sin(mid) * k, 0.03 * k); if (!part) o.scale.multiplyScalar(1 + 0.08 * bump(s, 1.6, 0.4)); } };
  },
  trophy: (spec, mat) => {
    const cup = new THREE.LatheGeometry([[0.001, -0.05], [0.12, -0.02], [0.25, 0.12], [0.3, 0.38], [0.29, 0.4]].map(([x, y]) => new THREE.Vector2(x, y)), 28);
    return { meshes: [mesh(merge([cup, G.torus(0.11, 0.03, Math.PI, -0.3, 0.24, 0, Math.PI / 2), G.torus(0.11, 0.03, Math.PI, 0.3, 0.24, 0, -Math.PI / 2), G.cyl(0.04, 0.05, 0.22, 0, -0.16), G.box(0.36, 0.1, 0.2, 0, -0.3, 0)]), mat)],
      idle(o, s) { o.rotation.y = 0.5 * Math.sin(s * 1.2); mat.emissiveIntensity = 0.45 + 0.5 * bump(s, 1.4, 0.25); } };
  },
  gem: (spec, mat) => {
    const g = new THREE.LatheGeometry([[0.001, -0.42], [0.36, 0.08], [0.24, 0.24], [0.001, 0.24]].map(([x, y]) => new THREE.Vector2(x, y)), 8);
    const m = mesh(g, new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.3, roughness: 0.05, metalness: 0.2, flatShading: true }));
    return { meshes: [m], idle(o, s) { m.rotation.y = s * 0.9; m.material.emissiveIntensity = 0.3 + 0.8 * bump(s, 1.3, 0.2); } };
  },
  onsen: (spec, mat) => {                                  // ♨: a bath and three wavy plumes of steam
    const bath = mesh(G.torus(0.3, 0.06, Math.PI, 0, -0.08, 0, Math.PI), mat);
    const plume = (x) => G.tube([...Array(7).keys()].map((i) => [x + 0.06 * Math.sin(i * 1.4), -0.02 + i * 0.08]), 0.035);
    const steam = mesh(merge([plume(-0.16), plume(0), plume(0.16)]), mat);
    return { meshes: [bath, steam], idle(o, s) { steam.position.x = 0.02 * Math.sin(s * 3); steam.scale.y = 1 + 0.12 * Math.sin(s * 2); } };
  },
  globe: (spec, mat) => {                                  // a turning globe on its stand
    const globe = new THREE.Group();
    globe.add(mesh(G.sphere(0.36), solid(0x2a6ad0, 0.35)), mesh(merge([0.5, 0.1, -0.4, 0.3, -0.2, 0.6, -0.5].map((la, i) => { const lo = [0, 0.5, 0.3, 2.2, 2.6, 4.0, 4.6][i], r = [0.16, 0.2, 0.14, 0.2, 0.12, 0.18, 0.15][i]; return G.sphere(r, 0.31 * Math.cos(la) * Math.sin(lo), 0.31 * Math.sin(la), 0.31 * Math.cos(la) * Math.cos(lo), 1, 1, 1); })), solid(0x4ab04a, 0.35)));
    globe.rotation.z = 0.4;
    return { meshes: [globe, mesh(merge([G.torus(0.44, 0.02, Math.PI, 0, 0, 0, 0.4 + Math.PI / 2), G.cyl(0.03, 0.03, 0.16, 0, -0.5), G.cyl(0.18, 0.2, 0.05, 0, -0.58)]), mat)], idle(o, s) { globe.rotation.y = s * 0.8; } };
  },
  splash: (spec, mat) => {                                 // a blob of paint with drops: a colour
    const sh = new THREE.Shape(); for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, r = 0.3 + 0.06 * Math.sin(a * 5) + 0.03 * Math.sin(a * 11); i ? sh.lineTo(r * Math.cos(a), r * Math.sin(a)) : sh.moveTo(r * Math.cos(a), r * Math.sin(a)); }
    return { meshes: [mesh(merge([G.extrude(sh, 0.06), G.sphere(0.07, 0.42, 0.2, 0, 1, 1, 0.4), G.sphere(0.05, -0.4, -0.25, 0, 1, 1, 0.4), G.sphere(0.06, 0.1, -0.45, 0, 1, 1, 0.4)]), mat)], idle(o, s) { o.scale.multiplyScalar(1 + 0.06 * Math.sin(s * 3)); } };
  },
  rainbow: () => {
    const arcs = [0xff4040, 0xffa030, 0xffe040, 0x40c050, 0x4080ff, 0x9050e0].map((c, i) => mesh(G.torus(0.5 - i * 0.06, 0.032, Math.PI, 0, -0.2), solid(c, 0.5)));
    return { meshes: arcs, idle(o, s) { arcs.forEach((a, i) => { a.scale.setScalar(Math.min(1, Math.max(0.001, (s - i * 0.08) / 0.4))); }); } };
  },
  frown: (spec, mat) => {                                  // a face shaking its head: dislike
    const face = new THREE.Group(); face.add(mesh(G.sphere(0.4, 0, 0, 0, 1, 1, 0.5), mat), mesh(merge([G.sphere(0.05, -0.13, 0.08, 0.18), G.sphere(0.05, 0.13, 0.08, 0.18), G.torus(0.14, 0.03, Math.PI, 0, -0.22, 0.18), G.box(0.14, 0.03, 0.03, -0.13, 0.2, 0.17, -0.4), G.box(0.14, 0.03, 0.03, 0.13, 0.2, 0.17, 0.4)]), solid(DARK, 0.05)));
    return { meshes: [face], idle(o, s) { face.rotation.y = 0.5 * Math.sin(s * 10) * bump(s, 2, 0.7); } };
  },
};
export const SIGNS_COST = { stop: 3, check: 1, cross: 1, exclaim: 1, equals: 1, repeat: 1, swap: 2, flag: (o) => (o.kind === 'start' ? 2 : 3), pin: 3, signpost: 2, ticket: 2, tag: 3, pie: 2, trophy: 1, gem: 1, onsen: 2, globe: 3, splash: 1, rainbow: 6, frown: 2 };
