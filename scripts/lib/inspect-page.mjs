// Runs inside the app page (Playwright sends the function's source, so it imports nothing at the top): measures a card's
// scene at one moment for scripts/inspect.mjs. Lengths are in u (the kanji's height); y is above the kanji's bottom line
// (the ground), x from the kanji's right edge, z toward the viewer.
export async function measure({ t, cam, watch = [] }) {
  const THREE = await import('three');
  const app = window.__app, { kit } = app.app, V = () => new THREE.Vector3();
  app.seek(t); kit.scene.updateMatrixWorld(true);
  const holder = kit.scene.getObjectByName('vignette');
  if (!holder) return { error: 'this card has no scene (vignette): nothing to inspect' };
  const info = holder.userData.inspect, k = holder.getWorldScale(V()).y, u = info.u * k;
  // the ground line is the kanji's bottom, in the kanji's own space (a scene moved by its recipe's `at` does not move it)
  const origin = holder.parent.localToWorld(new THREE.Vector3(info.right, info.floor, 0)), floorY = origin.y;
  const U = (v) => Math.round(v / u * 100) / 100, P = (p) => [U(p.x - origin.x), U(p.y - floorY), U(p.z - origin.z)];
  const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };

  // the scene's things: models (people, animals, objects), labels, meshes; plain groups are opened up
  const found = [];
  // a model's own body is its first child; props hung on it (a plough, a cup) are listed as things of their own. A kit
  // person (pieces/kit-person.js) is a bone rig drawn as two instanced meshes (children 1, 2); props ride on its bones
  const walk = (o) => { for (const c of o.children) { if (!shown(c)) continue; if (c.userData.model || c.userData.kitPerson) { found.push(c); walk({ children: c.userData.model ? c.children.slice(1) : [c.children[0], ...c.children.slice(3)] }); } else if (c.isMesh || c.isPoints) found.push(c); else walk(c); } };
  const bodyMeshes = (o) => { if (o.userData.kitPerson) return [o.children[1], o.children[2]]; const a = []; o.children[0].traverse((m) => { if (m.isMesh) a.push(m); }); return a; };
  const instBox = (o, b) => {
    const m = new THREE.Matrix4(), s = V(); o.geometry.computeBoundingBox();
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); s.setFromMatrixScale(m); if (s.x > 1e-3) b.union(o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld)); }
    return b;
  };
  walk(holder);
  const boxOf = (o) => {
    const b = new THREE.Box3();
    if (o.isInstancedMesh) return instBox(o, b);
    if (o.userData.kitPerson) return instBox(o.children[2], instBox(o.children[1], b));
    return b.setFromObject(o.userData.model ? o.children[0] : o, true);
  };
  // the nearest plain colour word, so "brown/grey" says more than two hex codes
  const NAMES = { red: 0xd03028, orange: 0xe88030, yellow: 0xe8d040, green: 0x48a040, teal: 0x30a0a0, blue: 0x3060c0, purple: 0x8048b0, pink: 0xf0a0c0, brown: 0x8a5a30, 'dark brown': 0x3a2414, beige: 0xd8c098, skin: 0xf0c49c, white: 0xf4f4f4, grey: 0x909498, black: 0x181818 };
  const colourName = (hex) => {
    const c = new THREE.Color(`#${hex}`), d = (x) => { const k = new THREE.Color(x); return (c.r - k.r) ** 2 + (c.g - k.g) ** 2 + (c.b - k.b) ** 2; };
    return Object.entries(NAMES).sort((a, b) => d(a[1]) - d(b[1]))[0][0];
  };
  const colours = (o) => {
    const col = o.geometry?.getAttribute('color');
    if (!col) return o.material?.color ? `${colourName(o.material.color.getHexString())} #${o.material.color.getHexString()}` : '';
    const n = {};
    for (let j = 0; j < col.count; j += 5) { const h = new THREE.Color(col.getX(j), col.getY(j), col.getZ(j)).getHexString(); n[h] = (n[h] ?? 0) + 1; }
    const top = Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([h]) => h);
    return `${top.map(colourName).join('/')} #${top.join('/#')}`;
  };
  const items = found.map((o) => ({ o, box: boxOf(o) })).filter((x) => !x.box.isEmpty() && x.box.getSize(V()).length() > 0.005 * u);
  let kits = 0;
  items.forEach((x, i) => {
    const o = x.o, s = x.box.getSize(V());
    x.id = `T${i + 1}`;
    x.kit = !!o.userData.kitPerson;
    x.kind = o.userData.model || x.kit ? 'model' : o.userData.label != null ? 'label' : o.isInstancedMesh ? 'pool' : o.isPoints ? 'particles' : 'mesh';
    // a body: a model with a skeleton (a person or an animal), not a static one (grass, a tree, a car)
    x.body = x.kit || x.kind === 'model' && (() => { let b = false; o.traverse((m) => { if (m.isSkinnedMesh) b = true; }); return b; })();
    x.name = x.kit ? `kit person ${++kits}` : o.userData.model ?? (x.kind === 'label' ? `"${o.userData.label}"` : o.name ? `${o.name} (${colours(o)})` : colours(o));
    x.size = [U(s.x), U(s.y), U(s.z)]; x.centre = P(x.box.getCenter(V())); x.bottom = U(x.box.min.y - floorY); x.top = U(x.box.max.y - floorY);
    x.world = x.box.getCenter(V()).toArray(); x.radius = s.length() / 2;
  });
  const solid = items.filter((x) => x.kind === 'model' || x.kind === 'mesh'), models = () => items.filter((x) => x.kind === 'model');
  const label = (x) => `${x.id} ${x.kind} ${x.name}`;
  // the person or animal a thing hangs on (a prop on a hand bone, a veil, a plough held by a model): it moves with them
  const carrierOf = (x) => models().find((m) => m !== x && m.body && (() => { for (let p = x.o.parent; p; p = p.parent) if (p === m.o) return true; return false; })());

  const skins = new Map(), q = V();
  const KIT_BONES = { FistR: 'handR', FistL: 'handL', Head: 'head', Neck: 'head', Torso: 'body', Hips: 'body', UpperArmR: 'armR', UpperArmL: 'armL', LowerArmR: 'foreR', LowerArmL: 'foreL', LowerLegR: 'shinR', LowerLegL: 'shinL', FootR: 'footR', FootL: 'footL' };
  const skin = (a) => {
    if (skins.has(a)) return skins.get(a);
    const pts = [], bones = [];
    if (a.kit) {                                       // the rig's bones are named groups; its skin is every shown instance
      a.o.children[0].traverse((g) => { if (g.name) bones.push(g); });
      const m = new THREE.Matrix4(), s = V();
      for (const mesh of bodyMeshes(a.o)) for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, m); s.setFromMatrixScale(m); if (s.x <= 1e-3) continue;
        const pos = mesh.geometry.attributes.position;
        for (let j = 0; j < pos.count; j += 3) pts.push(V().fromBufferAttribute(pos, j).applyMatrix4(m).applyMatrix4(mesh.matrixWorld));
      }
    } else (a.o.children[0] ?? a.o).traverse((m) => { if (m.isBone) bones.push(m); if (!m.isMesh) return; for (let j = 0; j < m.geometry.attributes.position.count; j += 3) pts.push(m.getVertexPosition(j, V()).applyMatrix4(m.matrixWorld)); });
    const boneAt = (p) => bones.map((bn) => [bn.name, bn.getWorldPosition(q).distanceTo(p)]).sort((x, y) => x[1] - y[1])[0]?.[0] ?? '?';
    const r = { pts, bones, boneAt }; skins.set(a, r); return r;
  };
  // the surfaces: every solid thing's own meshes (skinned ones posed); a ray straight down finds what is really under a
  // point (a tipped field's top, a head's hair), not just boxes
  // (rays must hit faces from both sides to tell inside from outside: sides are switched back before returning)
  const sides = new Map();
  const own = (x) => { const a = [], list = []; if (x.kind === 'model') list.push(...bodyMeshes(x.o)); else x.o.traverse((m) => list.push(m)); list.forEach((m) => { if (m.isMesh && shown(m)) { if (m.isSkinnedMesh) { m.computeBoundingBox(); m.computeBoundingSphere(); } if (m.isInstancedMesh) { m.boundingBox = null; m.boundingSphere = null; } for (const mt of [m.material].flat()) if (!sides.has(mt)) { sides.set(mt, mt.side); mt.side = THREE.DoubleSide; } a.push(m); } }); return a; };
  const meshesOf = new Map();
  const rc = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0), UP = new THREE.Vector3(0, 1, 0);
  // the highest surface of another thing under point p, looking down from height `from`: [height, thing] or the ground line
  // (not a thing of its own: a person does not stand on the skirt they wear)
  const below = (p, a, from) => {
    rc.set(new THREE.Vector3(p.x, from, p.z), DOWN); rc.far = 10;
    for (const b of solid) if (!meshesOf.has(b)) meshesOf.set(b, own(b));
    const hit = solid.filter((b) => b !== a && carrierOf(b) !== a).flatMap((b) => rc.intersectObjects(meshesOf.get(b), false).map((h) => [h.point.y, b, h]))
      .filter(([y]) => y > floorY - 0.02 * u).sort((x, y) => y[0] - x[0])[0];
    if (!hit) return [floorY, null];
    // the first face below looks down: the ray started inside that thing (a furrow sunk a little into the soil), so its
    // top above the point is the surface
    if (hit[2].face && hit[2].face.normal.clone().transformDirection(hit[2].object.matrixWorld).y < 0) {
      rc.set(new THREE.Vector3(p.x, hit[1].box.max.y + 0.01 * u, p.z), DOWN);
      const top = rc.intersectObjects(meshesOf.get(hit[1]), false)[0];
      if (top) return [top.point.y, hit[1]];
    }
    return [hit[0], hit[1]];
  };
  const support = solid.map((a) => {
    // the points it stands on: a model's lowest skin points (its soles), a mesh's bottom middle
    const feet = a.kind === 'model' ? skin(a).pts.slice().sort((x, y) => x.y - y.y).slice(0, 12) : [new THREE.Vector3((a.box.min.x + a.box.max.x) / 2, a.box.min.y, (a.box.min.z + a.box.max.z) / 2)];
    // (a model looks from 0.3u above its soles, to find a floor its feet sank into; a mesh from its own middle)
    const from = (p) => a.kind === 'model' ? p.y + 0.3 * u : (a.box.min.y + a.box.max.y) / 2;
    // a small thing on a person (a moustache, a hat, a cup in the hand) is worn or held, not standing anywhere
    const carrier = carrierOf(a);
    if (carrier) return { id: a.id, text: `${label(a)}: carried or worn by ${label(carrier)} (it moves with them: check it sits right in the close-ups)`, gap: 0, point: a.box.getCenter(V()).toArray(), fault: false };
    const wearer = a.kind === 'mesh' && models().find((m) => m.box.intersectsBox(a.box) && a.box.getSize(V()).length() < 0.5 * m.box.getSize(V()).length());
    if (a.o.userData.flies) return { id: a.id, text: `${label(a)}: in the air on purpose (an effect: a star, a heart)`, gap: 0, point: a.box.getCenter(V()).toArray(), fault: false };
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
      // its own things (worn, carried): only a hand inside counts (held things rest against the palm, not in the fist)
      const mine = carrierOf(b) === a, hits = mine ? inside.filter((p) => /^(Fist|hand)/.test(boneAt(p))) : inside;
      if (hits.length < 4) continue;
      const parts = {};
      for (const p of hits) { const n = boneAt(p); parts[n] = (parts[n] ?? 0) + 1; }
      const c = hits.reduce((s, p) => s.add(p), V()).multiplyScalar(1 / hits.length), near = Object.entries(parts).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([n]) => n).filter((n) => n !== '?');
      through.push({ id: a.id, thing: b.id, near, hitBones: hits.map((p) => boneAt(p)), point: c.toArray(), text: `${label(a)} PASSES INTO ${label(b)}${mine ? ' (its own: the hand is inside what it holds)' : ''}: ${hits.length} skin points inside it${near.length ? `, near the bones ${near.join(', ')}` : ''}` });
    }
  }

  // worn things (a hat, a cap, a helmet: a mesh on or over a person's head): how well it covers the head. In the thing's
  // own frame, every head and hair skin point above the thing's bottom should be inside its surface; a point outside
  // sticks out (hair through a crown, a head beside an off-centre hat). cover = % inside, poke = the farthest one out.
  const fits = [], ROUND = [UP, DOWN, new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
  for (const a of models()) {
    const hb = []; a.o.traverse((b) => { if (b.isBone && /head/i.test(b.name)) hb.push(b); });
    if (a.kit) { const h = a.o.children[0].getObjectByName('head'); if (h) hb.push(h); }
    if (!hb.length) continue;
    const { pts, boneAt } = skin(a), headPts = pts.filter((p) => /head|hair/i.test(boneAt(p)));
    if (headPts.length < 8) continue;
    const headBox = new THREE.Box3().setFromPoints(headPts), headAt = headBox.getCenter(V());
    for (const b of solid.filter((x) => x.kind === 'mesh' && !x.o.userData.flies)) {
      const sz = b.box.getSize(V());
      if (sz.length() > 0.9 * a.box.getSize(V()).length() || !b.box.intersectsBox(headBox.clone().expandByScalar(0.02 * u))) continue;
      const inv = b.o.matrixWorld.clone().invert(), lbox = new THREE.Box3(), mb = meshesOf.get(b) ?? own(b);
      for (const m of mb) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); lbox.union(m.geometry.boundingBox.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld))); }
      const sc = V(); b.o.matrixWorld.decompose(V(), new THREE.Quaternion(), sc);
      // only a thing whose bottom is below the top of the head and that sits over it is "worn on the head"
      const above = headPts.filter((p) => p.clone().applyMatrix4(inv).y > lbox.min.y + 0.002 * u / sc.y);
      // ... and only over the head: the head's highest point lies inside its footprint
      const crown = headPts.reduce((t, p) => (p.y > t.y ? p : t)).clone().applyMatrix4(inv);
      if (above.length < 8 || crown.x < lbox.min.x || crown.x > lbox.max.x || crown.z < lbox.min.z || crown.z > lbox.max.z) continue;
      let inside = 0, poke = 0, far = null;
      for (const p of above) {
        // enclosed: the thing's surface all round it (a hat is often several overlapping closed parts, so a crossing
        // count can't tell inside from outside)
        if (ROUND.every((dir) => { rc.set(p, dir); rc.far = 2 * u; return mb.some((m) => rc.intersectObject(m, false).length); })) { inside++; continue; }
        const d = lbox.distanceToPoint(p.clone().applyMatrix4(inv)) * sc.x;
        const dd = d > 0 ? d : 0.005 * u;                 // inside its box but outside its surface: just through
        if (dd > poke) { poke = dd; far = p; }
      }
      // its middle: the middle of its upper part (a cap's peak or a brim would pull the box's middle off)
      const upper = new THREE.Box3(), lim = lbox.min.y + 0.4 * (lbox.max.y - lbox.min.y), lv = V();
      for (const m of mb) { const pa = m.geometry.attributes.position, mm = inv.clone().multiply(m.matrixWorld); for (let j = 0; j < pa.count; j++) { lv.fromBufferAttribute(pa, j).applyMatrix4(mm); if (lv.y > lim) upper.expandByPoint(lv); } }
      const cover = Math.round(100 * inside / above.length), mid = (upper.isEmpty() ? lbox : upper).getCenter(V()).applyMatrix4(b.o.matrixWorld);
      // (off-centre against the part of the head it covers: a ponytail hanging below doesn't pull the middle back)
      const cov = new THREE.Box3().setFromPoints(above).getCenter(V()), off = U(Math.hypot(mid.x - cov.x, mid.z - cov.z));
      fits.push({ id: b.id, who: a.id, cover, poke: U(poke), off, point: (far ?? mid).toArray(),
        text: `${label(b)} on ${label(a)}'s head: covers ${cover}% of the head and hair above its bottom${poke ? `; hair or head sticks out up to ${U(poke)}u` : ''}; its middle is ${off}u from the head's middle (sideways); the head and hair are ${U(headBox.max.x - headBox.min.x)} wide, ${U(headBox.max.z - headBox.min.z)} deep, top at y ${P(headBox.max)[1]}`, fault: cover < 90 || poke > 0.02 * u });
    }
  }

  // a hat near two heads (a parent leaning over a child's cap) is worn by the one it covers best
  for (let i = fits.length - 1; i >= 0; i--) if (fits.some((f, j) => j !== i && f.id === fits[i].id && (f.cover > fits[i].cover || (f.cover === fits[i].cover && j < i)))) fits.splice(i, 1);
  // a hat on a head stands on nothing: its fit says how it sits
  for (const f of fits) { const sp = support.find((x) => x.id === f.id); if (sp) Object.assign(sp, { text: `${label(solid.find((x) => x.id === f.id))}: worn on ${label(models().find((x) => x.id === f.who))}'s head (see how it fits)`, gap: 0, fault: false }); }
  // a head inside a hat it wears is the fit above, not a body passing through a thing
  for (let i = through.length - 1; i >= 0; i--) {
    const h = through[i];
    if (!fits.some((f) => f.id === h.thing && f.who === h.id)) continue;
    const rest = h.hitBones.filter((n) => !/head|hair|neck/i.test(n));
    if (rest.length < 4) { through.splice(i, 1); continue; }
    const parts = [...new Set(rest)].slice(0, 3);
    h.text = `${label(models().find((x) => x.id === h.id))} PASSES INTO ${label(solid.find((x) => x.id === h.thing))} (a worn thing: not counting the head in it): ${rest.length} skin points inside it, near the bones ${parts.join(', ')}`;
  }
  for (const h of through) { delete h.hitBones; delete h.near; delete h.thing; }
  for (const [mt, side] of sides) mt.side = side;

  // hands of the people: where each fist is, the nearest point of the person's own body and the nearest other thing
  const hands = [], touching = [], bodies = [];
  for (const a of models()) {
    const bone = {}; a.o.traverse((b) => { if (b.isBone) bone[b.name] = b; });
    // a kit person's bones under the models' names (its hand bone starts at the wrist)
    if (a.kit) for (const [n, k] of Object.entries(KIT_BONES)) bone[n] = a.o.children[0].getObjectByName(k);
    if (!bone.FistR || !bone.Head) continue;
    const at = (n) => bone[n]?.getWorldPosition(V());
    const head = at('Head'), marks = { 'top of the head': new THREE.Vector3(head.x, a.box.max.y, head.z), 'head (middle)': head.clone().lerp(new THREE.Vector3(head.x, a.box.max.y, head.z), 0.5),
      neck: at('Neck'), 'right shoulder': at('UpperArmR'), 'left shoulder': at('UpperArmL'), chest: at('Torso'), hips: at('Hips'),
      'right knee': at('LowerLegR'), 'left knee': at('LowerLegL'), 'right foot': at('FootR'), 'left foot': at('FootL') };
    // the same points in u, with the hands, for a plan's goals (scripts/inspect.mjs --goals)
    bodies.push({ id: a.id, name: a.name, marks: Object.fromEntries(Object.entries({ ...marks, 'right hand': at('FistR'), 'left hand': at('FistL') }).filter(([, q]) => q).map(([n, q]) => [n, P(q)])) });
    for (const [side, word] of [['R', 'right'], ['L', 'left']]) {
      const p = at(`Fist${side}`); if (!p) continue;
      const own = Object.entries(marks).filter(([, q]) => q).map(([n, q]) => [n, q.distanceTo(p)]).sort((x, y) => x[1] - y[1])[0];
      const other = solid.filter((b) => b !== a).map((b) => [b, b.box.distanceToPoint(p)]).sort((x, y) => x[1] - y[1])[0];
      // another person's or animal's body part right at this hand (a pat, a handshake, or a hand through a face)
      // points along the whole arm (shoulder, elbow, wrist) against the other bodies' skin
      const sh = at(`UpperArm${side}`), el = at(`LowerArm${side}`), along = [0.5, 1].map((f) => sh.clone().lerp(el, f)).concat([0.33, 0.66, 1].map((f) => el.clone().lerp(p, f)));
      let near = null;
      for (const o of models().filter((x) => x !== a)) for (const q of skin(o).pts) for (const [i, ap] of along.entries()) { const d = q.distanceTo(ap); if (d < 0.04 * u && (!near || d < near[1])) near = [o, d, q, i]; }
      if (near) touching.push({ point: near[2].toArray(), text: `${label(a)} ${word} ${near[3] === along.length - 1 ? 'hand' : near[3] < 2 ? 'upper arm' : 'forearm'} is AT ${label(near[0])}${((b) => (b === '?' ? '' : `'s ${b}`))(skin(near[0]).boneAt(near[2]))} (${U(near[1])}u): touching or passing through; make sure the plan wants this` });
      hands.push({ id: a.id, point: p.toArray(), text: `${label(a)} ${word} hand at ${JSON.stringify(P(p))}: nearest own body part ${own[0]} ${U(own[1])}u away${other ? `; nearest other thing ${label(other[0])} ${U(other[1])}u away${other[1] === 0 ? ' (inside its box: touching or passing through)' : ''}` : ''}` });
    }
  }

  // who hides whom from a camera: each model (and the kanji, and the meaning label) drawn alone, then everything together,
  // in flat colours (render target). Card text is drawn over everything (no depth test): what lies under the meaning label
  // is hidden by it, so that is counted from the label's own pixels.
  const hidden = [];
  if (cam) {
    kit.camera.position.fromArray(cam.pos); kit.controls.target.fromArray(cam.target); kit.controls.update(); kit.camera.updateMatrixWorld(true);
    const W = 240, H = 192, rt = new THREE.WebGLRenderTarget(W, H), r = kit.renderer, saved = [], bg = kit.scene.background, actors = items.filter((x) => x.body);
    // props a plan's goals name (watch): measured like the people, all the meshes whose name (or a group's) holds the word
    const bodyNames = new Set(actors.map((x) => x.name.toLowerCase()));
    // (the most specific name first: it owns its meshes, so 'cakeB' and 'cake' can both be watched)
    for (const [w, shownName] of watch.map((n) => [String(n).toLowerCase(), n]).sort((a, b) => b[0].length - a[0].length).filter(([n]) => n !== 'kanji' && ![...bodyNames].some((b) => b === n || b.includes(n)))) {
      const objs = []; holder.traverse((o) => { if (o !== holder && o.name && o.name.toLowerCase().includes(w) && shown(o) && !objs.some((p) => { for (let q = o.parent; q; q = q.parent) if (q === p) return true; return false; })) objs.push(o); });
      if (objs.length) { const members = new Set(); objs.forEach((o) => o.traverse((m) => members.add(m))); actors.push({ watch: w, shown: shownName, id: `watch ${w}`, o: { traverse: (f) => objs.forEach((o) => o.traverse(f)) }, objs, members }); }
    }
    const glyph = kit.scene.getObjectByName('glyph'), meaning = kit.scene.getObjectByName('meaning'), K = actors.length, L = K + 1;
    const flat = (i) => new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(i < 0 ? 0 : (i + 1) * 12 / 255, i < 0 ? 0 : 1, i < 0 ? 1 : 0, THREE.LinearSRGBColorSpace), toneMapped: false, fog: false, side: THREE.DoubleSide });
    const owner = new Map(); actors.forEach((x, i) => x.o.traverse((m) => { if (!x.watch || !owner.has(m)) owner.set(m, i); }));
    // the colours a watched prop's own meshes are drawn in (some may belong to a more specific name)
    actors.forEach((x) => { if (x.watch) x.mine = new Set([...x.members].map((m) => owner.get(m))); });
    glyph?.traverse((m) => { if (!owner.has(m)) owner.set(m, K); }); meaning?.traverse((m) => owner.set(m, L));
    // drawn: opaque meshes that are showing now, and labels (they hide what is behind them too); the meaning label only alone;
    // a watched prop even when see-through (a glass), unless faded out
    kit.scene.traverse((m) => { if (m.isMesh || m.isPoints || m.isLine || m.isSprite) saved.push([m, m.material, m.visible, m.isMesh && shown(m) && (owner.get(m) === L || actors[owner.get(m)]?.watch && (m.material?.opacity ?? 1) > 0.05 || !(m.material?.transparent && m.userData.label == null))]); });
    const grey = flat(-1), mats = [...actors, 0, 0].map((_, i) => flat(i));
    // instance colours (a kit person's skin and shirt) would tint the flat colours: off while drawing
    const tints = []; kit.scene.traverse((m) => { if (m.isInstancedMesh && m.instanceColor) { tints.push([m, m.instanceColor]); m.instanceColor = null; } });
    const draw = (only) => {
      for (const [m, , , drawn] of saved) { const i = owner.get(m); m.visible = drawn && (only == null ? i !== L : actors[only]?.watch ? actors[only].members.has(m) : i === only); m.material = i == null ? grey : mats[i]; }
      kit.scene.background = null; r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear(); r.render(kit.scene, kit.camera); r.setRenderTarget(null);
      const buf = new Uint8Array(W * H * 4); r.readRenderTargetPixels(rt, 0, 0, W, H, buf); return buf;
    };
    // (anything not drawn in one of the flat colours reads as 'other')
    const whoAt = (buf, j) => { if (buf[j + 3] < 128) return null; const i = Math.round(buf[j] / 12) - 1; return buf[j + 1] > 200 && buf[j + 2] < 60 && i >= 0 && i <= L ? i : 'other'; };
    const alone = [...actors.map((_, i) => draw(i)), glyph ? draw(K) : null], under = meaning ? draw(L) : null, all = draw(null);
    for (const [m, mat, vis] of saved) { m.material = mat; m.visible = vis; }
    for (const [m, c] of tints) m.instanceColor = c;
    kit.scene.background = bg; rt.dispose();
    const name = (w) => (w === 'other' ? 'other things (props, labels)' : w === K ? 'the kanji' : actors[w]?.watch ? `the ${actors[w].shown}` : actors[w] ? label(actors[w]) : '?');
    const ndc = V(), inFrame = (a) => { if (a.watch) return 100; const pts = skin(a).pts; return pts.length ? Math.round(100 * pts.filter((p) => { ndc.copy(p).project(kit.camera); return Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && ndc.z < 1; }).length / pts.length) : 100; };
    // how big each one shows: its seen pixels against the kanji's own (the kanji alone, nothing in front)
    let kanjiPx = 0; if (glyph) for (let j = 0; j < W * H * 4; j += 4) if (whoAt(alone[K], j) === K) kanjiPx++;
    const camPos = kit.camera.position.clone();
    [...actors, ...(glyph ? [{ id: 'kanji', glyph: true }] : [])].forEach((a, i) => {
      let n = 0, seen = 0, lab = 0; const by = {};
      for (let j = 0; j < W * H * 4; j += 4) {
        const me = (w) => (a.mine ? a.mine.has(w) : w === i);
        if (!me(whoAt(alone[i], j))) continue; n++;
        if (!a.glyph && under && whoAt(under, j) === L) { lab++; continue; }
        const w = whoAt(all, j); if (me(w)) seen++; else by[name(w)] = (by[name(w)] ?? 0) + 1;
      }
      const who = a.glyph ? 'the kanji' : a.watch ? `the ${a.shown} (${a.objs.length} piece${a.objs.length > 1 ? 's' : ''})` : label(a);
      // a watched prop's top (its own up axis): how far it is turned toward the learner, in degrees (0 = edge-on)
      const tops = a.watch ? a.objs.map((o) => { const c = new THREE.Box3().setFromObject(o).getCenter(V()), up = V().set(0, 1, 0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())); return Math.round(Math.asin(Math.max(-1, Math.min(1, up.dot(camPos.clone().sub(c).normalize())))) / Math.PI * 180); }) : null;
      const top = tops ? Math.min(...tops) : null, topText = tops ? `; its top turned ${top}° toward you (0 = edge-on, 90 = facing you)` : '';
      if (!n) { hidden.push({ id: a.id, watch: a.watch, prop: !!a.watch, pct: a.watch ? 0 : undefined, area: 0, top, text: `${who}: not in this view at all${topText}` }); return; }
      if (lab) by['the meaning label'] = lab;
      const pct = Math.round(100 * seen / n), behind = Object.entries(by).sort((x, y) => y[1] - x[1]).map(([w, c]) => `${Math.round(100 * c / n)}% behind ${w}`).join(', ');
      const frame = a.glyph ? 100 : inFrame(a), area = kanjiPx ? Math.round(100 * seen / kanjiPx) : null;
      const wb = a.watch ? a.objs.reduce((b, o) => b.union(new THREE.Box3().setFromObject(o)), new THREE.Box3()) : null, box = wb && !wb.isEmpty() ? { centre: P(wb.getCenter(V())), size: wb.getSize(V()).toArray().map(U) } : undefined;
      hidden.push({ id: a.id, watch: a.watch, prop: !!a.watch, pct, glyph: !!a.glyph, frame, area, top, box, text: `${who}: ${pct}% visible${behind ? ` (${behind})` : ''}${frame < 100 ? `; only ${frame}% of it inside the picture` : ''}${area != null && !a.glyph ? `; shows ${area}% as big as the kanji` : ''}${topText}` });
    });
  }
  return { u, origin: [origin.x, floorY, origin.z], items: items.map(({ id, kind, body, name, size, centre, bottom, top, world, radius }) => ({ id, kind, body, name, size, centre, bottom, top, world, radius })), support, through, fits, hands, touching, hidden, bodies };
}

// point the camera at world point `target` from a named side, `dist` metres away
export function aim({ target, dist, az, el, t }) {
  const { kit } = window.__app.app, a = az * Math.PI / 180, [x, y, z] = target;
  kit.camera.position.set(x + dist * Math.sin(a) * Math.cos(el), y + dist * Math.sin(el), z + dist * Math.cos(a) * Math.cos(el));
  kit.controls.target.set(x, y, z); kit.controls.update(); window.__app.seek(t);
}
