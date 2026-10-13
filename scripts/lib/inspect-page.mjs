// Runs inside the app page (Playwright sends the function's source, so it imports nothing at the top): measures a card's
// scene at one moment for scripts/inspect.mjs. Lengths are in u (the kanji's height); y is above the kanji's bottom line
// (the ground), x from the kanji's right edge, z toward the viewer.
export async function measure({ t, cam }) {
  const THREE = await import('three');
  const app = window.__app, { kit } = app.app, V = () => new THREE.Vector3();
  app.seek(t); kit.scene.updateMatrixWorld(true);
  const holder = kit.scene.getObjectByName('vignette');
  if (!holder) return { error: 'this card has no scene (vignette): nothing to inspect' };
  const info = holder.userData.inspect, k = holder.getWorldScale(V()).y, u = info.u * k;
  const origin = holder.localToWorld(new THREE.Vector3(info.right, info.floor, 0)), floorY = origin.y;
  const U = (v) => Math.round(v / u * 100) / 100, P = (p) => [U(p.x - origin.x), U(p.y - floorY), U(p.z - origin.z)];
  const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };

  // the scene's things: models (people, animals, objects), labels, meshes; plain groups are opened up
  const found = [];
  // a model's own body is its first child; props hung on it (a plough, a cup) are listed as things of their own
  const walk = (o) => { for (const c of o.children) { if (!shown(c)) continue; if (c.userData.model) { found.push(c); walk({ children: c.children.slice(1) }); } else if (c.isMesh || c.isPoints) found.push(c); else walk(c); } };
  walk(holder);
  const boxOf = (o) => {
    const b = new THREE.Box3();
    if (o.isInstancedMesh) {
      const m = new THREE.Matrix4(), s = V(); o.geometry.computeBoundingBox();
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); s.setFromMatrixScale(m); if (s.x > 1e-3) b.union(o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld)); }
      return b;
    }
    return b.setFromObject(o.userData.model ? o.children[0] : o, true);
  };
  const colours = (o) => {
    const col = o.geometry?.getAttribute('color');
    if (!col) return o.material?.color ? `#${o.material.color.getHexString()}` : '';
    const n = {};
    for (let j = 0; j < col.count; j += 5) { const h = new THREE.Color(col.getX(j), col.getY(j), col.getZ(j)).getHexString(); n[h] = (n[h] ?? 0) + 1; }
    return Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([h]) => `#${h}`).join('/');
  };
  const items = found.map((o) => ({ o, box: boxOf(o) })).filter((x) => !x.box.isEmpty() && x.box.getSize(V()).length() > 0.005 * u);
  items.forEach((x, i) => {
    const o = x.o, s = x.box.getSize(V());
    x.id = `T${i + 1}`;
    x.kind = o.userData.model ? 'model' : o.userData.label != null ? 'label' : o.isInstancedMesh ? 'pool' : o.isPoints ? 'particles' : 'mesh';
    x.name = o.userData.model ?? (x.kind === 'label' ? `"${o.userData.label}"` : colours(o));
    x.size = [U(s.x), U(s.y), U(s.z)]; x.centre = P(x.box.getCenter(V())); x.bottom = U(x.box.min.y - floorY); x.top = U(x.box.max.y - floorY);
    x.world = x.box.getCenter(V()).toArray(); x.radius = s.length() / 2;
  });
  const solid = items.filter((x) => x.kind === 'model' || x.kind === 'mesh'), models = () => items.filter((x) => x.kind === 'model');
  const label = (x) => `${x.id} ${x.kind} ${x.name}`;

  const skins = new Map(), q = V();
  const skin = (a) => {
    if (skins.has(a)) return skins.get(a);
    const pts = [], bones = [];
    (a.o.children[0] ?? a.o).traverse((m) => { if (m.isBone) bones.push(m); if (!m.isMesh) return; for (let j = 0; j < m.geometry.attributes.position.count; j += 3) pts.push(m.getVertexPosition(j, V()).applyMatrix4(m.matrixWorld)); });
    const boneAt = (p) => bones.map((bn) => [bn.name, bn.getWorldPosition(q).distanceTo(p)]).sort((x, y) => x[1] - y[1])[0]?.[0] ?? '?';
    const r = { pts, bones, boneAt }; skins.set(a, r); return r;
  };
  // the surfaces: every solid thing's own meshes (skinned ones posed); a ray straight down finds what is really under a
  // point (a tipped field's top, a head's hair), not just boxes
  // (rays must hit faces from both sides to tell inside from outside: sides are switched back before returning)
  const sides = new Map();
  const own = (x) => { const a = []; (x.kind === 'model' ? x.o.children[0] : x.o).traverse((m) => { if (m.isMesh && shown(m)) { if (m.isSkinnedMesh) { m.computeBoundingBox(); m.computeBoundingSphere(); } for (const mt of [m.material].flat()) if (!sides.has(mt)) { sides.set(mt, mt.side); mt.side = THREE.DoubleSide; } a.push(m); } }); return a; };
  const meshesOf = new Map();
  const rc = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0), UP = new THREE.Vector3(0, 1, 0);
  // the highest surface of another thing under point p, looking down from height `from`: [height, thing] or the ground line
  const below = (p, a, from) => {
    rc.set(new THREE.Vector3(p.x, from, p.z), DOWN); rc.far = 10;
    for (const b of solid) if (!meshesOf.has(b)) meshesOf.set(b, own(b));
    const hit = solid.filter((b) => b !== a).flatMap((b) => rc.intersectObjects(meshesOf.get(b), false).map((h) => [h.point.y, b]))
      .filter(([y]) => y > floorY - 0.02 * u).sort((x, y) => y[0] - x[0])[0];
    return hit ?? [floorY, null];
  };
  const support = solid.map((a) => {
    // the points it stands on: a model's lowest skin points (its soles), a mesh's bottom middle
    const feet = a.kind === 'model' ? skin(a).pts.slice().sort((x, y) => x.y - y.y).slice(0, 12) : [new THREE.Vector3((a.box.min.x + a.box.max.x) / 2, a.box.min.y, (a.box.min.z + a.box.max.z) / 2)];
    // (a model looks from 0.3u above its soles, to find a floor its feet sank into; a mesh from its own middle)
    const from = (p) => a.kind === 'model' ? p.y + 0.3 * u : (a.box.min.y + a.box.max.y) / 2;
    // a small thing on a person (a moustache, a hat, a cup in the hand) is worn or held, not standing anywhere
    const wearer = a.kind === 'mesh' && models().find((m) => m.box.intersectsBox(a.box) && a.box.getSize(V()).length() < 0.5 * m.box.getSize(V()).length());
    if (wearer) return { id: a.id, text: `${label(a)}: is on ${label(wearer)} (worn or held: check it sits right in the close-ups)`, gap: 0, point: a.box.getCenter(V()).toArray(), fault: false };
    const best = feet.map((p) => { const [y, b] = below(p, a, from(p)); return [p.y - y, b, p]; }).sort((x, y) => Math.abs(x[0]) - Math.abs(y[0]))[0];
    const gap = U(best[0]), on = best[1] ? label(best[1]) : 'the ground line (bottom of the kanji)';
    const flat = a.kind === 'mesh' && a.box.max.y - a.box.min.y < 0.12 * u && Math.abs(a.box.max.y - floorY) <= 0.02 * u && !best[1];
    const verdict = flat ? 'is ground: its top is on' : Math.abs(gap) <= 0.02 ? 'touches' : gap < 0 ? 'SUNK INTO' : gap > 0.5 ? 'is high in the air above' : 'FLOATS ABOVE';
    return { id: a.id, text: `${label(a)}: ${verdict} ${on}${Math.abs(gap) > 0.02 && !flat ? ` (gap ${gap}u)` : ''}`, gap, point: best[2].toArray(), fault: verdict === 'SUNK INTO' || verdict === 'FLOATS ABOVE' };
  });

  // bodies passing through things: points of each model's skin inside another thing's box (the box shrunk a little), and
  // which part of the body they belong to (the nearest bone)
  const through = [];
  for (const a of items.filter((x) => x.kind === 'model')) {
    const { pts, boneAt } = skin(a);
    for (const b of solid.filter((x) => x !== a && x.kind === 'mesh')) {
      // inside its box, and really inside its surface: a ray straight up crosses the surface an odd number of times
      const box = b.box.clone().expandByScalar(-0.005 * u), mb = meshesOf.get(b) ?? own(b);
      // (a sole pressed a hair into the floor doesn't count: only points deeper than 0.03u)
      const inside = pts.filter((p) => { if (!box.containsPoint(p)) return false; rc.set(p, UP); rc.far = 10; const h = mb.flatMap((m) => rc.intersectObject(m, false)); return h.length % 2 === 1 && Math.min(...h.map((x) => x.distance)) > 0.03 * u; });
      if (inside.length < 4) continue;
      const parts = {};
      for (const p of inside) { const n = boneAt(p); parts[n] = (parts[n] ?? 0) + 1; }
      const c = inside.reduce((s, p) => s.add(p), V()).multiplyScalar(1 / inside.length);
      through.push({ id: a.id, point: c.toArray(), text: `${label(a)} PASSES INTO ${label(b)}: ${inside.length} skin points inside it, near the bones ${Object.entries(parts).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([n]) => n).join(', ')}` });
    }
  }

  for (const [mt, side] of sides) mt.side = side;

  // hands of the people: where each fist is, the nearest point of the person's own body and the nearest other thing
  const hands = [], touching = [];
  for (const a of models()) {
    const bone = {}; a.o.traverse((b) => { if (b.isBone) bone[b.name] = b; });
    if (!bone.FistR || !bone.Head) continue;
    const at = (n) => bone[n]?.getWorldPosition(V());
    const head = at('Head'), marks = { 'top of the head': new THREE.Vector3(head.x, a.box.max.y, head.z), 'head (middle)': head.clone().lerp(new THREE.Vector3(head.x, a.box.max.y, head.z), 0.5),
      neck: at('Neck'), 'right shoulder': at('UpperArmR'), 'left shoulder': at('UpperArmL'), chest: at('Torso'), hips: at('Hips'),
      'right knee': at('LowerLegR'), 'left knee': at('LowerLegL'), 'right foot': at('FootR'), 'left foot': at('FootL') };
    for (const [side, word] of [['R', 'right'], ['L', 'left']]) {
      const p = at(`Fist${side}`); if (!p) continue;
      const own = Object.entries(marks).filter(([, q]) => q).map(([n, q]) => [n, q.distanceTo(p)]).sort((x, y) => x[1] - y[1])[0];
      const other = solid.filter((b) => b !== a).map((b) => [b, b.box.distanceToPoint(p)]).sort((x, y) => x[1] - y[1])[0];
      // another person's or animal's body part right at this hand (a pat, a handshake, or a hand through a face)
      // points along the whole arm (shoulder, elbow, wrist) against the other bodies' skin
      const sh = at(`UpperArm${side}`), el = at(`LowerArm${side}`), along = [0.5, 1].map((f) => sh.clone().lerp(el, f)).concat([0.33, 0.66, 1].map((f) => el.clone().lerp(p, f)));
      let near = null;
      for (const o of models().filter((x) => x !== a)) for (const q of skin(o).pts) for (const [i, ap] of along.entries()) { const d = q.distanceTo(ap); if (d < 0.04 * u && (!near || d < near[1])) near = [o, d, q, i]; }
      if (near) touching.push({ point: near[2].toArray(), text: `${label(a)} ${word} ${near[3] === along.length - 1 ? 'hand' : near[3] < 2 ? 'upper arm' : 'forearm'} is AT ${label(near[0])}'s ${skin(near[0]).boneAt(near[2])} (${U(near[1])}u): touching or passing through; make sure the plan wants this` });
      hands.push({ id: a.id, point: p.toArray(), text: `${label(a)} ${word} hand at ${JSON.stringify(P(p))}: nearest own body part ${own[0]} ${U(own[1])}u away${other ? `; nearest other thing ${label(other[0])} ${U(other[1])}u away${other[1] === 0 ? ' (inside its box: touching or passing through)' : ''}` : ''}` });
    }
  }

  // who hides whom from a camera: each model drawn alone, then everything together, in flat colours (render target)
  const hidden = [];
  if (cam) {
    kit.camera.position.fromArray(cam.pos); kit.controls.target.fromArray(cam.target); kit.controls.update(); kit.camera.updateMatrixWorld(true);
    const W = 240, H = 192, rt = new THREE.WebGLRenderTarget(W, H), r = kit.renderer, saved = [], bg = kit.scene.background, actors = items.filter((x) => x.kind === 'model');
    const flat = (i) => new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(i < 0 ? 0 : (i + 1) * 30 / 255, i < 0 ? 0 : 1, i < 0 ? 1 : 0, THREE.LinearSRGBColorSpace), toneMapped: false, fog: false, side: THREE.DoubleSide });
    const owner = new Map(); actors.forEach((x, i) => x.o.traverse((m) => owner.set(m, i)));
    // drawn: opaque meshes that are showing now, and labels (they hide what is behind them too)
    kit.scene.traverse((m) => { if (m.isMesh || m.isPoints || m.isLine || m.isSprite) saved.push([m, m.material, m.visible, m.isMesh && shown(m) && !(m.material?.transparent && m.userData.label == null)]); });
    const grey = flat(-1), mats = actors.map((_, i) => flat(i));
    const draw = (only) => {
      for (const [m, , , drawn] of saved) { const i = owner.get(m); m.visible = drawn && (only == null || i === only); m.material = i == null ? grey : mats[i]; }
      kit.scene.background = null; r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear(); r.render(kit.scene, kit.camera); r.setRenderTarget(null);
      const buf = new Uint8Array(W * H * 4); r.readRenderTargetPixels(rt, 0, 0, W, H, buf); return buf;
    };
    const whoAt = (buf, j) => buf[j + 3] < 128 ? null : buf[j + 2] > 128 && buf[j + 1] < 128 ? 'other' : Math.round(buf[j] / 30) - 1;
    const alone = actors.map((_, i) => draw(i)), all = draw(null);
    for (const [m, mat, vis] of saved) { m.material = mat; m.visible = vis; }
    kit.scene.background = bg; rt.dispose();
    actors.forEach((a, i) => {
      let n = 0, seen = 0; const by = {};
      for (let j = 0; j < W * H * 4; j += 4) {
        if (whoAt(alone[i], j) !== i) continue; n++;
        const w = whoAt(all, j); if (w === i) seen++; else { const key = w === 'other' ? 'other things (props, the kanji, labels)' : w == null ? '?' : label(actors[w]); by[key] = (by[key] ?? 0) + 1; }
      }
      if (!n) { hidden.push({ id: a.id, text: `${label(a)}: not in this view at all` }); return; }
      const pct = Math.round(100 * seen / n), behind = Object.entries(by).sort((x, y) => y[1] - x[1]).map(([w, c]) => `${Math.round(100 * c / n)}% behind ${w}`).join(', ');
      hidden.push({ id: a.id, pct, text: `${label(a)}: ${pct}% visible${behind ? ` (${behind})` : ''}` });
    });
  }
  return { u, origin: [origin.x, floorY, origin.z], items: items.map(({ id, kind, name, size, centre, bottom, top, world, radius }) => ({ id, kind, name, size, centre, bottom, top, world, radius })), support, through, hands, touching, hidden };
}

// point the camera at world point `target` from a named side, `dist` metres away
export function aim({ target, dist, az, el, t }) {
  const { kit } = window.__app.app, a = az * Math.PI / 180, [x, y, z] = target;
  kit.camera.position.set(x + dist * Math.sin(a) * Math.cos(el), y + dist * Math.sin(el), z + dist * Math.cos(a) * Math.cos(el));
  kit.controls.target.set(x, y, z); kit.controls.update(); window.__app.seek(t);
}
