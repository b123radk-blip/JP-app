// Step 1 scenes, part L (second file): the old box (古) and the bitten apple (食).
//   old-box     古: a cracked old wooden box with a cobweb strung across its mouth, from the rim to the lid's edge. The lid creaks
//               open and the web stretches, then snaps; a soft grey puff of dust drifts out and fades, and a moth flutters away.
//   apple-bite  食: a hand-built apple (dimple, stem, leaf) turns to show each bite: a round scoop is taken out of it with cream
//               flesh showing inside, bite after bite until only the core is left, with a もぐもぐ label.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { many } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp, kitMaterial } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow, seeded } from './step1-kit.js';
import { oldCar, sandwich } from './step1-lv.js';

// ---- 古 old ----
export function oldBox(ctx, spec, stage) {
  if (spec.outcome === 'car') return oldCar(ctx, spec, stage);
  const u = 1.3 * stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.35 * u;
  const box = solidProp([[G.box(0.46 * u, 0.3 * u, 0.3 * u, 0, 0.15 * u, 0), 0x7a5a3a], [G.box(0.47 * u, 0.03 * u, 0.31 * u, 0, 0.08 * u, 0), 0x5a3a20], [G.poly([[-0.1 * u, 0.25 * u], [-0.05 * u, 0.18 * u], [-0.08 * u, 0.1 * u], [-0.02 * u, 0.04 * u]], 0.006 * u).translate(0, 0, 0.152 * u), 0x2a1a10], [G.poly([[0.15 * u, 0.28 * u], [0.12 * u, 0.2 * u], [0.16 * u, 0.14 * u]], 0.006 * u).translate(0, 0, 0.152 * u), 0x2a1a10]], 0.3);
  const lidP = new THREE.Group(), lid = solidProp([[G.box(0.48 * u, 0.04 * u, 0.32 * u, 0, 0, 0.16 * u), 0x6a4a2a]], 0.3);
  lidP.add(lid); lidP.position.set(bx, floor + 0.3 * u, -0.16 * u);
  // the cobweb: flat strips lying in the plane of the box's mouth, from the rim's front edge across to the lid's free edge
  const HUB = [0, 0.5], RING = [[-1, 0], [0, 0], [1, 0], [1, 0.5], [1, 1], [0, 1], [-1, 1], [-1, 0.5]], RHO = [0.3, 0.55, 0.8], rnd = seeded(5);
  const segs = [];                                        // [[s0, w0], [s1, w1], sag]: points in the mouth's (across, rim -> lid) coordinates
  RING.forEach((p, i) => segs.push([HUB, p, 0.4]));
  RHO.forEach((r, k) => RING.forEach((p, i) => { const q = RING[(i + 1) % 8]; if (rnd() > 0.12) segs.push([[HUB[0] + (p[0] - HUB[0]) * r, HUB[1] + (p[1] - HUB[1]) * r], [HUB[0] + (q[0] - HUB[0]) * r, HUB[1] + (q[1] - HUB[1]) * r], 1 + k * 0.4]); }));
  segs.push([[-1, 0], [-1, 1], 0.5], [[1, 0], [1, 1], 0.5]);
  const NS = segs.length, wpos = new Float32Array(NS * 4 * 3), widx = [];
  for (let i = 0; i < NS; i++) widx.push(4 * i, 4 * i + 1, 4 * i + 2, 4 * i + 1, 4 * i + 3, 4 * i + 2);
  const wgeo = new THREE.BufferGeometry(); wgeo.setAttribute('position', new THREE.BufferAttribute(wpos, 3)); wgeo.setIndex(widx);
  const web = new THREE.Mesh(wgeo, new THREE.MeshBasicMaterial({ color: 0xf2f2f8, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })); web.frustumCulled = false;
  const NB = 44, dust = many([[G.sphere(0.013 * u), 0xffffff]], NB, 0.1), D = Array.from({ length: NB }, () => [rnd(), rnd(), rnd(), rnd()]);
  dust.material.transparent = true; dust.material.opacity = 0.34; dust.material.depthWrite = false;
  D.forEach((d, i) => dust.setColorAt(i, new THREE.Color().setHSL(0.09, 0.05, 0.42 + 0.22 * d[3])));
  const moth = solidProp([[G.sphere(0.02 * u, 0, 0, 0, 1, 1.6, 1), 0x8a8070], [G.sphere(0.04 * u, -0.03 * u, 0, 0, 1, 0.2, 0.7), 0xc8c0a8], [G.sphere(0.04 * u, 0.03 * u, 0, 0, 1, 0.2, 0.7), 0xc8c0a8]], 0.4);
  box.position.set(bx, floor, 0);
  group.add(box, lidP, web, dust, moth);
  const loop = 6.0, rim = new THREE.Vector3(), free = new THREE.Vector3(), N = new THREE.Vector3(), a3 = new THREE.Vector3(), b3 = new THREE.Vector3(), d3 = new THREE.Vector3(), sd = new THREE.Vector3();
  const at = (s, w, out) => out.set(bx + s * 0.235 * u, 0, 0).add(rim.clone().lerp(free, w));   // a point of the web plane; rim and free hold (0, y, z)
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, creak = pre ? 0 : between(v, 0.6, 1.8) * (1 - between(v, 4.6, 5.2));
      const ang = -0.9 * creak + 0.04 * Math.sin(v * 30) * (creak > 0 && creak < 1 ? 1 : 0); lidP.rotation.x = ang;
      // the web: anchored on the rim's front edge and the lid's free edge; thins and snaps once the lid is wide open
      const snap = pre ? 1 : between(v, 2.5, 2.75), alive = creak > 0.04 && snap < 1 && v < 4;
      web.visible = alive;
      if (alive) {
        rim.set(0, floor + 0.3 * u, 0.152 * u); const cs = Math.cos(ang), sn = Math.sin(ang);
        free.set(0, floor + 0.3 * u - 0.02 * u * cs - 0.32 * u * sn, -0.16 * u - 0.02 * u * sn + 0.32 * u * cs);
        N.set(0, -(free.z - rim.z), free.y - rim.y).normalize();                // the plane's normal, perpendicular to the rim -> lid direction (in the y-z plane)
        const hw = 0.0035 * u * (1 - snap), P = wgeo.attributes.position;
        segs.forEach(([p, q, sag], i) => {
          at(p[0], p[1], a3); at(q[0], q[1], b3);
          const slack = 0.012 * u * sag * (1 - creak * 0.6);
          a3.addScaledVector(N, slack * 0.3); b3.addScaledVector(N, slack * 0.3);
          sd.subVectors(b3, a3).normalize(); d3.crossVectors(sd, N).multiplyScalar(hw);
          P.setXYZ(4 * i, a3.x - d3.x, a3.y - d3.y, a3.z - d3.z); P.setXYZ(4 * i + 1, a3.x + d3.x, a3.y + d3.y, a3.z + d3.z);
          P.setXYZ(4 * i + 2, b3.x - d3.x, b3.y - d3.y, b3.z - d3.z); P.setXYZ(4 * i + 3, b3.x + d3.x, b3.y + d3.y, b3.z + d3.z);
        });
        P.needsUpdate = true;
      }
      // a soft puff: small grey specks lifting out of the open box, drifting and spreading, swelling then fading away
      D.forEach(([r1, r2, r3, r4], i) => {
        const f = pre ? 0 : (v - 2.5 - 0.03 * i) / (1.6 + r4), ok = f > 0 && f < 1, ph = r1 * 6.28;
        const k = ok ? Math.sin(Math.PI * f) ** 0.7 * (0.9 + 1.2 * f) : 0, e = 1 - (1 - f) ** 2;
        dust.set(i, bx + (r1 - 0.5) * 0.3 * u + (r2 - 0.5) * 0.32 * u * e + 0.03 * u * Math.sin(f * 5 + ph), floor + 0.33 * u + (0.1 + 0.3 * r3) * u * e, (r2 - 0.3) * 0.2 * u * e + 0.04 * u, k);
      });
      dust.commit();
      const m = pre ? 0 : between(v, 2.6, 4.6); moth.visible = m > 0 && m < 1; moth.position.set(bx + 0.6 * u * m, floor + 0.35 * u + 0.6 * u * m + 0.05 * u * Math.sin(m * 20), 0.05 * u); moth.scale.set(1 + 0.4 * Math.sin(t * 30), 1, 1);
    },
  };
}

// ---- 食 eat ----
const SKINR = new THREE.Color(0xd82a2a), SKING = new THREE.Color(0xe8b030), FLESH = new THREE.Color(0xfff0c8), FLESHD = new THREE.Color(0xf0d890);
// an apple: a lathe-like sphere (shoulders wider than the base, a dimple round the stem, five soft lobes at the bottom). Each frame the
// vertices inside a bite sphere are pushed out to that sphere's surface (a round scoop) and turn cream.
function appleGeo(R, SEG = 168, RIN = 112) {
  const P = [], I = [];
  for (let i = 0; i <= RIN; i++) for (let j = 0; j <= SEG; j++) {
    const ph = Math.PI * i / RIN, ps = 2 * Math.PI * j / SEG, s = Math.sin(ph), c = Math.cos(ph);
    const rad = R * s * (1 + 0.07 * c + 0.03 * Math.cos(5 * ps) * Math.max(0, -c) * 1.5), y = R * 0.93 * c - R * 0.2 * Math.exp(-((ph / 0.3) ** 2)) + R * 0.06 * Math.exp(-(((Math.PI - ph) / 0.3) ** 2));
    P.push(rad * Math.cos(ps), y, rad * Math.sin(ps));
  }
  for (let i = 0; i < RIN; i++) for (let j = 0; j < SEG; j++) { const a = i * (SEG + 1) + j, b = a + 1, c = a + SEG + 1, d = c + 1; I.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(P.length), 3)); g.setIndex(I);
  g.userData.base = Float32Array.from(P); return g;
}
export function appleBite(ctx, spec, stage) {
  if (spec.outcome === 'sandwich') return sandwich(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ax = B.maxX + 0.5 * u, ay = floor + 0.3 * u, R = 0.22 * u;
  const geo = appleGeo(R), base = geo.userData.base, pos = geo.attributes.position, col = geo.attributes.color, apple = new THREE.Mesh(geo, kitMaterial(0.1)); apple.frustumCulled = false;
  const stem = solidProp([[G.cyl(0.011 * u, 0.014 * u, 0.09 * u, 0.006 * u, R * 0.93 - R * 0.2 + 0.05 * u, 0, 0, 0, -0.18), 0x5a3a1a], [G.sphere(0.06 * u, 0.075 * u, R * 0.93 - R * 0.2 + 0.08 * u, 0.005 * u, 1.7, 0.28, 0.85), 0x3fa040], [G.sphere(0.03 * u, 0.13 * u, R * 0.93 - R * 0.2 + 0.075 * u, 0.005 * u, 1.4, 0.25, 0.7), 0x58b850]], 0.4);
  const core = solidProp([[G.cyl(0.05 * u, 0.045 * u, 0.3 * u, 0, 0, 0), 0xfff0c8], [G.sphere(0.12 * u, 0, 0.15 * u, 0, 1, 0.4, 1), 0xe03030], [G.sphere(0.12 * u, 0, -0.15 * u, 0, 1, 0.4, 1), 0xe03030], [G.sphere(0.012 * u, 0.02 * u, 0, 0.05 * u), 0x3a2010], [G.cyl(0.012 * u, 0.012 * u, 0.08 * u, 0, 0.2 * u, 0), 0x5a3a1a]], 0.5);
  const crumbs = many([[G.sphere(0.012 * u), 0xfff0c8]], 8, 0.5), chomp = textPlane('もぐもぐ', { h: 0.12 * u, color: '#ffffff', bg: '#e04848', pad: 0.3 });
  const body = new THREE.Group(); body.add(apple, stem); body.position.set(ax, ay, 0); core.position.set(ax, ay, 0);
  group.add(body, core, crumbs, chomp);
  // the bites: [azimuth round the apple, height (-1..1), size]; each is taken on the side facing you, then the apple turns
  const BITES = [[0.5, 0.3, 0.54], [2.2, 0.2, 0.52], [3.9, 0.25, 0.52], [5.3, 0.15, 0.54], [1.35, -0.5, 0.5], [3.1, -0.55, 0.5]];
  const C = BITES.map(([az, h, k]) => { const r = Math.sqrt(1 - h * h), c = new THREE.Vector3(r * Math.cos(az), h * 0.93, r * Math.sin(az)).multiplyScalar(R * 1.02); return { c, cl: c.length(), a: c.clone().normalize(), r: k * R, az }; });
  const loop = 6.0, tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), dir = new THREE.Vector3(), lastN = { n: -2 };
  const shape = (grow6) => {
    for (let i = 0, n = pos.count; i < n; i++) {
      tmp.set(base[3 * i], base[3 * i + 1], base[3 * i + 2]); let cut = 0;
      for (let b = 0; b < 6; b++) {
        const g = grow6[b]; if (g <= 0) continue;
        const rb = C[b].r * g; tmp2.copy(tmp).sub(C[b].c);
        if (tmp2.length() < rb) {
          // inside the bite sphere: lay the vertex on the sphere's inner wall at the same angle round the bite's axis, spreading the
          // angle from the bottom of the scoop (0) to its rim (1) evenly, so the scoop is smooth (no stretched streaks)
          const { a, cl } = C[b], ax = tmp.dot(a); dir.copy(tmp).addScaledVector(a, -ax); const rho = dir.length();
          const zr = (R * R + cl * cl - rb * rb) / (2 * cl), rr = Math.sqrt(Math.max(1e-8, R * R - zr * zr));
          const f = Math.min(1, Math.asin(Math.min(1, rho / R)) / Math.asin(Math.min(1, rr / R))), psi = f * Math.acos(Math.min(1, Math.max(-1, (cl - zr) / rb)));
          if (rho > 1e-6) dir.divideScalar(rho); else dir.set(1, 0, 0).addScaledVector(a, -a.x).normalize();
          tmp2.copy(C[b].c).addScaledVector(a, -Math.cos(psi) * rb).addScaledVector(dir, Math.sin(psi) * rb);
          if (tmp2.lengthSq() < tmp.lengthSq()) { tmp.copy(tmp2); cut = 1; }
        }
      }
      pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
      // colour: red skin with a yellowish blush toward the top, cream flesh in the scoops (a little darker deep inside)
      const y = base[3 * i + 1] / R, sk = Math.max(0, y - 0.35) * 0.9 + 0.12 * Math.sin(Math.atan2(base[3 * i + 2], base[3 * i]) * 7);
      let col0 = SKINR.clone().lerp(SKING, Math.min(1, Math.max(0, sk)));
      if (cut > 0) { const depth = Math.min(1, Math.max(0, 1 - tmp.length() / R) * 2.2); col0 = FLESH.clone().lerp(FLESHD, depth); }
      col.setXYZ(i, col0.r, col0.g, col0.b);
    }
    pos.needsUpdate = col.needsUpdate = true; geo.computeVertexNormals();
  };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, bt = (b) => 0.45 + 0.5 * b;                    // when bite b lands (s)
      const done = pre ? 0 : between(v, 3.9, 4.1) * (1 - between(v, 5.4, 5.8)), n = pre ? 0 : Math.min(6, Math.floor(Math.max(0, v - 0.45) / 0.5) + (v >= 0.45 ? 1 : 0));
      body.visible = done < 0.5; core.visible = done >= 0.5;
      const gr = C.map((_, b) => (pre ? 0 : (1 - (1 - between(v, bt(b), bt(b) + 0.18)) ** 3) * (1 - between(v, 5.4, 5.8))));
      const key = gr.map((x) => x.toFixed(2)).join(',');
      if (lastN.key !== key) { shape(gr); lastN.key = key; }
      // turn the apple so the bite being taken is on the side facing you (toward +z)
      const cur = Math.max(0, n - 1), target = C[cur].az - Math.PI / 2, prev = n > 1 ? C[cur - 1].az - Math.PI / 2 : target, f = between(v, bt(cur) - 0.2, bt(cur));
      body.rotation.y = pre ? C[0].az - Math.PI / 2 : prev + (target - prev) * f;
      body.rotation.z = 0.04 * Math.sin(v * 12) * (n > 0 && n < 6 ? 1 : 0);
      for (let i = 0; i < 8; i++) { const g = pre ? 0 : ((v * 1.3 + i / 8) % 1); crumbs.set(i, ax + (i - 3.5) * 0.04 * u, ay - 0.2 * u - 0.2 * u * g, 0.1 * u, v > 0.45 && v < 3.9 ? 1 - g : 0); }
      crumbs.commit();
      const k = !pre && v > 0.4 && v < 3.9 ? 1 : 0; chomp.visible = k > 0; chomp.position.set(ax, ay + 0.42 * u + 0.02 * u * Math.sin(v * 12), 0.06 * u);
    },
  };
}
