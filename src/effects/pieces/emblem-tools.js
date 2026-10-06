// Emblems that are tools and household things: knife, umbrella, gears, camera, hammer, wrench, scale, dumbbell, weight,
// thermometer, ruler, suitcase, briefcase, bag, box, mirror, glasses, shirt, shoe, bed, pot, spoon, plate, frame, film, mic,
// speaker, sheet, ring, mask, alarm, bow, boomerang. Same contract as emblem-body.js; mesh counts in TOOLS_COST.
import * as THREE from 'three';
import { G, merge, solid, mesh } from './shape-kit.js';
import { smooth } from './util.js';

const DARK = 0x1a1820, WHITE = 0xf6f2ea, WOOD = 0x8a5a30, STEEL = 0xd8dde6;
const bump = (s, every, dur) => { const u = (s % every) / dur; return u < 1 ? Math.sin(Math.PI * u) : 0; };
const shape = (pts) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath(); return sh; };
const steel = () => new THREE.MeshStandardMaterial({ color: STEEL, emissive: 0x404858, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.7 });
function gearGeo(r, teeth, w = 0.08) {
  const pts = []; for (let i = 0; i < teeth * 4; i++) { const a = (i / (teeth * 4)) * Math.PI * 2, out = i % 4 === 1 || i % 4 === 2; pts.push([(out ? r : r * 0.8) * Math.cos(a), (out ? r : r * 0.8) * Math.sin(a)]); }
  const sh = shape(pts), hole = new THREE.Path(); hole.absarc(0, 0, r * 0.28, 0, Math.PI * 2, true); sh.holes.push(hole);
  return G.extrude(sh, w);
}

export const TOOLS = {
  knife: (spec, mat) => {                                  // a kitchen knife chopping
    const k = new THREE.Group(); k.add(mesh(G.extrude(shape([[-0.05, 0.02], [0.5, 0.02], [0.42, -0.1], [0.2, -0.16], [-0.05, -0.16]]), 0.02), steel()), mesh(G.box(0.3, 0.1, 0.06, -0.2, -0.07, 0), solid(spec.color, 0.2)));
    k.position.x = -0.1;
    return { meshes: [k], idle(o, s) { k.rotation.z = 0.35 * bump(s, 0.9, 0.45); } };
  },
  umbrella: (spec, mat) => {                               // an open umbrella, twirling, rain running off it
    const canopy = new THREE.Group(), ribs = 8;
    canopy.add(mesh(new THREE.ConeGeometry(0.48, 0.24, ribs, 1, true).translate(0, 0.2, 0), new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.35, side: THREE.DoubleSide, flatShading: true })));
    const stick = mesh(merge([G.cyl(0.018, 0.018, 0.62, 0, 0), G.torus(0.07, 0.022, Math.PI, 0.07, -0.31, 0, Math.PI)]), solid(WOOD, 0.15));
    return { meshes: [canopy, stick], idle(o, s) { canopy.rotation.y = s * 1.2; o.rotation.z = -0.15 + 0.05 * Math.sin(s * 1.3); } };
  },
  gears: (spec, mat) => {                                  // two gears meshing (machine, mechanism)
    const a = mesh(gearGeo(0.3, 10), mat), b = mesh(gearGeo(0.2, 7), solid(spec.other ?? 0x9aa8c0, 0.3));
    a.position.set(-0.14, 0.06, 0); b.position.set(0.32, -0.2, 0);
    return { meshes: [a, b], idle(o, s) { a.rotation.z = s * 1.2; b.rotation.z = -s * 1.2 * (10 / 7) + 0.2; } };
  },
  camera: (spec, mat) => {                                 // a camera; the flash fires now and then
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    return { meshes: [mesh(merge([G.box(0.8, 0.5, 0.3, 0, 0, 0), G.box(0.2, 0.1, 0.22, -0.22, 0.29, 0)]), mat), mesh(merge([G.cyl(0.17, 0.17, 0.18, 0, 0, 0.2, Math.PI / 2), G.box(0.14, 0.08, 0.02, 0.26, 0.15, 0.16)]), solid(DARK, 0.1)), mesh(new THREE.CircleGeometry(0.6, 32).translate(0.26, 0.15, 0.2), flashMat)],
      idle(o, s) { flashMat.opacity = 0.9 * Math.max(0, 1 - ((s % 2.4) / 0.25)); } };
  },
  hammer: (spec, mat) => {                                 // strikes down fast, lifts slowly (make, build)
    const pivot = new THREE.Group(); pivot.add(mesh(G.box(0.36, 0.16, 0.16, 0, 0.62, 0), steel()), mesh(G.cyl(0.035, 0.04, 0.62, 0, 0.31), solid(WOOD, 0.15))); pivot.position.set(0.05, -0.4, 0);
    return { meshes: [pivot], idle(o, s) { const u = s % 1.1; pivot.rotation.z = u < 0.15 ? 0.9 * (1 - smooth(u / 0.15)) : 0.9 * smooth((u - 0.3) / 0.7); } };
  },
  wrench: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.12, 0.6, 0.06, 0, -0.1, 0), G.torus(0.13, 0.05, Math.PI * 1.5, 0, 0.3, 0, -Math.PI * 0.25)]), steel())], idle(o, s) { o.rotation.z = 0.5 * Math.sin(s * 2.5); } }),
  scale: (spec, mat) => {                                  // a balance; its beam tips one way, then the other
    const beam = new THREE.Group(), pan = (x) => [G.cyl(0.005, 0.005, 0.3, x, -0.15), G.cyl(0.15, 0.08, 0.06, x, -0.31)];
    beam.add(mesh(merge([G.box(0.8, 0.04, 0.04, 0, 0, 0), ...pan(-0.38), ...pan(0.38)]), mat)); beam.position.y = 0.25;
    return { meshes: [mesh(merge([G.cyl(0.03, 0.03, 0.6, 0, -0.05), G.cyl(0.2, 0.22, 0.05, 0, -0.36), G.sphere(0.05, 0, 0.26)]), solid(WOOD, 0.15)), beam], idle(o, s) { beam.rotation.z = 0.18 * Math.sin(s * 1.6) * Math.exp(-(s % 4) * 0.4); } };
  },
  dumbbell: (spec, mat) => ({ meshes: [mesh(merge([G.cyl(0.035, 0.035, 0.7, 0, 0, 0, 0, 0, Math.PI / 2), ...[-0.3, 0.3].flatMap((x) => [G.cyl(0.16, 0.16, 0.08, x, 0, 0, 0, 0, Math.PI / 2), G.cyl(0.12, 0.12, 0.08, x * 1.28, 0, 0, 0, 0, Math.PI / 2)])]), mat)], idle(o, s) { o.position.y += 0.25 * Math.abs(Math.sin(s * 2.2)); } }),
  weight: (spec, mat) => ({ meshes: [mesh(merge([new THREE.CylinderGeometry(0.26, 0.4, 0.5, 4).rotateY(Math.PI / 4).translate(0, -0.1, 0), G.torus(0.1, 0.035, Math.PI * 2, 0, 0.22, 0)]), mat)],
    idle(o, s) { const u = s % 2.4; o.position.y += u < 0.3 ? 0.4 * (1 - smooth(u / 0.3)) : 0; o.scale.y *= u > 0.3 && u < 0.5 ? 0.9 : 1; } }),
  thermometer: (spec, mat) => {                            // level: how high the red line climbs (0..1; hot ~0.9, cold ~0.15)
    const lvl = spec.level ?? 0.85, col = new THREE.Group(); col.add(mesh(G.box(0.07, 0.62, 0.05, 0, 0.31, 0.02), solid(spec.color, 0.6))); col.position.y = -0.28;
    return { meshes: [mesh(merge([G.capsule(0.08, 0.7, 0, 0.08), G.sphere(0.14, 0, -0.38)]), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })), mesh(G.sphere(0.1, 0, -0.38, 0.02), solid(spec.color, 0.6)), col],
      idle(o, s) { col.scale.y = Math.max(0.02, lvl * smooth(s / 1.2) + 0.03 * Math.sin(s * 2)); } };
  },
  ruler: (spec, mat) => ({ meshes: [mesh(G.box(0.9, 0.18, 0.04, 0, 0, 0), mat), mesh(merge([...Array(10).keys()].map((i) => G.box(0.012, i % 5 ? 0.06 : 0.1, 0.02, -0.4 + i * 0.09, 0.09 - (i % 5 ? 0.03 : 0.05), 0.03))), solid(DARK, 0.05))], idle(o, s) { o.rotation.z = 0.1 * Math.sin(s * 1.4); } }),
  suitcase: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.56, 0.62, 0.22, 0, 0, 0), G.box(0.04, 0.6, 0.23, -0.12, 0, 0)]), mat), mesh(merge([G.torus(0.1, 0.025, Math.PI, 0, 0.31, 0), G.cyl(0.05, 0.05, 0.05, -0.2, -0.34, 0, Math.PI / 2), G.cyl(0.05, 0.05, 0.05, 0.2, -0.34, 0, Math.PI / 2)]), solid(DARK, 0.1))],
    idle(o, s) { o.position.x += 0.06 * Math.sin(s * 1.5); o.rotation.z = 0.04 * Math.sin(s * 9); } }),
  briefcase: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.8, 0.52, 0.2, 0, -0.06, 0), G.torus(0.12, 0.03, Math.PI, 0, 0.2, 0)]), mat), mesh(merge([G.box(0.8, 0.03, 0.21, 0, 0.08, 0), G.box(0.08, 0.06, 0.22, 0, 0.08, 0)]), solid(0xd8b060, 0.3))], idle(o, s) { o.rotation.z = 0.06 * Math.sin(s * 2.4); } }),
  bag: (spec, mat) => ({ meshes: [mesh(merge([new THREE.CylinderGeometry(0.3, 0.36, 0.56, 4).rotateY(Math.PI / 4).scale(1, 1, 0.4).translate(0, -0.1, 0), G.torus(0.12, 0.022, Math.PI, -0.1, 0.18, 0.04), G.torus(0.12, 0.022, Math.PI, 0.1, 0.18, -0.04)]), mat)], idle(o, s) { o.rotation.z = 0.12 * Math.sin(s * 2.2); } }),
  box: (spec, mat) => {                                    // a cardboard box whose flaps open (a thing, an object)
    const L = new THREE.Group(), R = new THREE.Group(), flap = solid(0xc89a60, 0.2);
    L.add(mesh(G.box(0.3, 0.02, 0.4, 0.15, 0, 0), flap)); R.add(mesh(G.box(0.3, 0.02, 0.4, -0.15, 0, 0), flap)); L.position.set(-0.3, 0.2, 0); R.position.set(0.3, 0.2, 0);
    return { meshes: [mesh(G.box(0.6, 0.42, 0.4, 0, -0.01, 0), mat), L, R], idle(o, s) { const k = 1.9 * smooth((s % 3) / 0.6) * (1 - smooth(((s % 3) - 2) / 0.6)); L.rotation.z = k; R.rotation.z = -k; o.rotation.y = 0.3; } };
  },
  mirror: (spec, mat) => {                                 // a hand mirror with a glint sweeping across (self)
    const glint = mesh(G.box(0.06, 0.6, 0.01, 0, 0.12, 0.05, 0.5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
    return { meshes: [mesh(merge([G.torus(0.28, 0.04, Math.PI * 2, 0, 0.12, 0), G.cyl(0.035, 0.035, 0.36, 0, -0.32)]), mat), mesh(G.cyl(0.26, 0.26, 0.02, 0, 0.12, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8f0ff, emissive: 0x80a0c0, emissiveIntensity: 0.4, metalness: 0.9, roughness: 0.05 })), glint],
      idle(o, s) { glint.position.x = -0.3 + 0.6 * ((s * 0.6) % 1); glint.visible = Math.abs(glint.position.x) < 0.22; } };
  },
  glasses: (spec, mat) => ({ meshes: [mesh(merge([G.torus(0.17, 0.03, Math.PI * 2, -0.22, 0, 0), G.torus(0.17, 0.03, Math.PI * 2, 0.22, 0, 0), G.torus(0.06, 0.025, Math.PI, 0, 0.02, 0), G.box(0.15, 0.03, 0.03, -0.45, 0.06, -0.05), G.box(0.15, 0.03, 0.03, 0.45, 0.06, -0.05)]), mat)], idle(o, s) { o.position.y += 0.04 * Math.sin(s * 2); } }),
  shirt: (spec, mat) => ({ meshes: [mesh(G.extrude(shape([[-0.14, 0.36], [-0.48, 0.18], [-0.38, 0.0], [-0.24, 0.08], [-0.24, -0.4], [0.24, -0.4], [0.24, 0.08], [0.38, 0.0], [0.48, 0.18], [0.14, 0.36], [0.07, 0.28], [-0.07, 0.28]]), 0.06), mat)], idle(o, s) { o.rotation.y = 0.35 * Math.sin(s * 1.5); } }),
  shoe: (spec, mat) => ({ meshes: [mesh(G.extrude(shape([[-0.4, -0.1], [0.42, -0.1], [0.44, 0.0], [0.3, 0.1], [0.05, 0.14], [-0.08, 0.3], [-0.38, 0.3]]), 0.2), mat), mesh(merge([G.box(0.86, 0.06, 0.24, 0.02, -0.12, 0), G.box(0.18, 0.02, 0.21, -0.02, 0.18, 0, -0.5)]), solid(WHITE, 0.2))], idle(o, s) { o.position.y += 0.1 * Math.abs(Math.sin(s * 3)); o.rotation.z = 0.08 * Math.sin(s * 3); } }),
  bed: (spec, mat) => ({ meshes: [mesh(merge([G.box(0.9, 0.08, 0.4, 0, -0.18, 0), G.box(0.06, 0.4, 0.4, -0.45, -0.04, 0), G.box(0.06, 0.26, 0.4, 0.45, -0.11, 0)]), solid(WOOD, 0.15)), mesh(merge([G.box(0.82, 0.1, 0.38, 0, -0.1, 0), G.sphere(0.12, -0.3, 0.0, 0, 1, 0.5, 1.4)]), solid(WHITE, 0.2)), mesh(G.box(0.55, 0.06, 0.4, 0.14, -0.03, 0.01), mat)],
    idle(o, s) { o.children[2].position.y = 0.01 * Math.sin(s * 1.5); } }),
  pot: (spec, mat) => {                                    // a cooking pot whose lid rattles
    const lid = mesh(merge([G.cyl(0.36, 0.38, 0.05, 0, 0.18), G.sphere(0.05, 0, 0.23)]), solid(DARK, 0.15));
    return { meshes: [mesh(merge([G.cyl(0.35, 0.32, 0.36, 0, 0), G.box(0.14, 0.05, 0.08, -0.42, 0.1, 0), G.box(0.14, 0.05, 0.08, 0.42, 0.1, 0)]), mat), lid], idle(o, s) { lid.position.y = 0.03 * Math.abs(Math.sin(s * 14)) * bump(s, 1.6, 0.6); lid.rotation.z = 0.05 * Math.sin(s * 14) * bump(s, 1.6, 0.6); } };
  },
  spoon: (spec, mat) => ({ meshes: [mesh(merge([G.sphere(0.16, 0, 0.24, 0, 0.8, 1.1, 0.35), G.cyl(0.03, 0.035, 0.55, 0, -0.16)]), steel())], idle(o, s) { o.rotation.z = 0.4 * Math.sin(s * 2); } }),
  plate: (spec, mat) => ({ meshes: [mesh(merge([G.cyl(0.46, 0.34, 0.05, 0, 0, 0), G.torus(0.44, 0.03, Math.PI * 2, 0, 0, 0).rotateX(Math.PI / 2).translate(0, 0.03, 0)]).rotateX(0.9), mat), mesh(G.sphere(0.2, 0, 0.06, 0.06, 1, 0.45, 0.7).rotateX(0.9 - Math.PI / 2 + Math.PI / 2), solid(0xe86040, 0.4))], idle(o, s) { o.rotation.y = 0.4 * Math.sin(s * 2); } }),
  frame: (spec, mat) => {                                  // a framed picture: hills, a sun
    const pic = new THREE.Group(); pic.add(mesh(new THREE.PlaneGeometry(0.66, 0.46), solid(0x8ac8f0, 0.5)), mesh(merge([G.sphere(0.3, -0.12, -0.3, 0.01, 1.2, 0.6, 0.02), G.sphere(0.25, 0.2, -0.3, 0.01, 1.2, 0.5, 0.02)]), solid(0x4a9a40, 0.4)), mesh(G.sphere(0.06, 0.2, 0.12, 0.01, 1, 1, 0.1), solid(0xffc030, 0.7)));
    return { meshes: [mesh(merge([G.box(0.8, 0.07, 0.06, 0, 0.27, 0), G.box(0.8, 0.07, 0.06, 0, -0.27, 0), G.box(0.07, 0.6, 0.06, -0.37, 0, 0), G.box(0.07, 0.6, 0.06, 0.37, 0, 0)]), mat), pic], idle(o, s) { o.rotation.z = 0.04 * Math.sin(s * 1.6); } };
  },
  film: (spec, mat) => {                                   // a reel (spec colour) with dark holes and a strip of film unrolling
    const reel = new THREE.Group();
    reel.add(mesh(G.cyl(0.36, 0.36, 0.06, 0, 0, 0, Math.PI / 2), mat), mesh(merge([G.cyl(0.03, 0.03, 0.08, 0, 0, 0.01, Math.PI / 2), ...[0, 1, 2, 3, 4].map((i) => G.cyl(0.08, 0.08, 0.08, 0.2 * Math.cos(i * 1.257), 0.2 * Math.sin(i * 1.257), 0.01, Math.PI / 2))]), solid(DARK, 0.1)));
    const strip = mesh(G.box(0.5, 0.11, 0.02, 0.25, -0.33, -0.02), solid(DARK, 0.1));
    return { meshes: [reel, strip], idle(o, s) { reel.rotation.z = -s * 2; } };
  },
  mic: (spec, mat) => ({ meshes: [mesh(G.sphere(0.17, 0, 0.26), solid(0x505860, 0.2)), mesh(merge([G.cyl(0.06, 0.05, 0.5, 0, -0.08), G.torus(0.2, 0.025, Math.PI, 0, 0.18, 0, Math.PI)]), mat)], idle(o, s) { o.rotation.z = 0.2 * Math.sin(s * 3); } }),
  speaker: (spec, mat) => {                                // a loudspeaker with sound rings going out (sound)
    const waves = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0 }));
    const rings = waves.map((m) => mesh(G.torus(0.25, 0.025, 1.6, 0.1, 0, 0, -0.8), m));
    return { meshes: [mesh(merge([G.box(0.16, 0.24, 0.16, -0.3, 0, 0), G.cone(0.24, 0.3, -0.12, 0, 0, -Math.PI / 2)]), mat), ...rings], idle(o, s) { rings.forEach((r, i) => { const u = (s * 0.8 + i / 3) % 1; r.scale.setScalar(0.6 + 1.2 * u); waves[i].opacity = Math.sin(Math.PI * u); }); } };
  },
  sheet: (spec, mat) => ({ meshes: [mesh(G.box(0.6, 0.78, 0.02, 0, 0, 0), solid(WHITE, 0.25)), mesh(merge([G.box(0.4, 0.05, 0.02, -0.02, 0.28, 0.02), ...[0, 1, 2, 3].map((i) => G.box(0.38, 0.025, 0.02, 0.04, 0.1 - i * 0.12, 0.02)), ...[0, 1, 2, 3].map((i) => G.box(0.04, 0.04, 0.02, -0.22, 0.1 - i * 0.12, 0.02))]), mat)], idle(o, s) { o.rotation.z = 0.06 * Math.sin(s * 1.3); } }),
  ring: (spec, mat) => ({ meshes: [mesh(G.torus(0.26, 0.06, Math.PI * 2, 0, -0.1, 0), mat), mesh(new THREE.OctahedronGeometry(0.12).translate(0, 0.25, 0), new THREE.MeshStandardMaterial({ color: 0xe8f8ff, emissive: 0xa0d0ff, emissiveIntensity: 0.6, flatShading: true }))], idle(o, s) { o.rotation.y = s * 1.2; } }),
  mask: (spec, mat) => ({ meshes: [mesh(G.sphere(0.36, 0, 0, 0, 0.8, 1.05, 0.35), mat), mesh(merge([G.sphere(0.06, -0.12, 0.08, 0.11, 1.4, 0.6, 0.5), G.sphere(0.06, 0.12, 0.08, 0.11, 1.4, 0.6, 0.5), G.sphere(0.07, 0, -0.18, 0.11, 1.4, 0.5, 0.5)]), solid(DARK, 0.05)), mesh(merge([G.sphere(0.05, -0.16, -0.05, 0.1, 1.2, 0.8, 0.4), G.sphere(0.05, 0.16, -0.05, 0.1, 1.2, 0.8, 0.4)]), solid(0xff8090, 0.3))],
    idle(o, s) { o.rotation.y = 0.35 * Math.sin(s * 0.9); } }),
  alarm: (spec, mat) => {                                  // an alarm clock ringing (wake up)
    const hands = mesh(merge([G.box(0.03, 0.2, 0.02, 0, 0.08, 0.13), G.box(0.03, 0.14, 0.02, 0.05, 0.02, 0.13, -1.2)]), solid(DARK, 0.05));
    return { meshes: [mesh(merge([G.cyl(0.3, 0.3, 0.2, 0, 0, 0, Math.PI / 2), G.sphere(0.1, -0.22, 0.28), G.sphere(0.1, 0.22, 0.28), G.cyl(0.02, 0.02, 0.15, -0.2, -0.32, 0, 0, 0, 0.5), G.cyl(0.02, 0.02, 0.15, 0.2, -0.32, 0, 0, 0, -0.5)]), mat), mesh(G.cyl(0.25, 0.25, 0.02, 0, 0, 0.11, Math.PI / 2), solid(WHITE, 0.3)), hands],
      idle(o, s) { const ring = (s % 2.2) < 1.1; o.rotation.z = ring ? 0.12 * Math.sin(s * 45) : 0; o.position.x += ring ? 0.01 * Math.sin(s * 60) : 0; } };
  },
  bow: (spec, mat) => {                                    // a bow being drawn, an arrow on the string (pull)
    const arrowM = new THREE.Group(); arrowM.add(mesh(merge([G.cyl(0.015, 0.015, 0.8, 0, 0, 0, 0, 0, Math.PI / 2), G.cone(0.05, 0.12, 0.44, 0, 0, -Math.PI / 2)]), solid(STEEL, 0.3)));
    const string = mesh(G.box(0.012, 1, 0.012, 0, 0, 0), solid(WHITE, 0.4));
    return { meshes: [mesh(G.torus(0.5, 0.035, Math.PI * 0.7, -0.38, 0, 0, -Math.PI * 0.35), mat), string, arrowM],
      idle(o, s) { const u = s % 2.4, pull = u < 1.6 ? smooth(u / 1.4) : 0, fly = u >= 1.6 ? (u - 1.6) * 2.5 : 0; string.position.x = -0.03 - 0.2 * pull; string.scale.y = 0.9 - 0.08 * pull; arrowM.position.x = 0.36 - 0.2 * pull + fly; arrowM.visible = fly < 1; } };
  },
  boomerang: (spec, mat) => {                              // flies out and comes back (return)
    const b = mesh(G.extrude(shape([[-0.4, 0.05], [0, 0.35], [0.4, 0.05], [0.35, -0.02], [0, 0.2], [-0.35, -0.02]]), 0.05), mat);
    return { meshes: [b], idle(o, s) { const u = (s % 2.6) / 2.6, a = u * Math.PI * 2; b.position.set(0.5 * Math.sin(a), 0.2 * Math.sin(a * 2) * 0.5, -0.3 * (1 - Math.cos(a))); b.rotation.z = s * 12; } };
  },
};
export const TOOLS_COST = { knife: 2, umbrella: 2, gears: 2, camera: 3, hammer: 2, wrench: 1, scale: 2, dumbbell: 1, weight: 1, thermometer: 3, ruler: 2, suitcase: 2, briefcase: 2, bag: 1, box: 3, mirror: 3, glasses: 1, shirt: 1, shoe: 2, bed: 3, pot: 2, spoon: 1, plate: 1, frame: 4, film: 3, mic: 2, speaker: 4, sheet: 2, ring: 2, mask: 3, alarm: 3, bow: 3, boomerang: 1 };
