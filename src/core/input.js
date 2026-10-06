// Pointing: mouse on desktop; controllers AND hands in XR. In XR a pinch / trigger fires the session's `select` event; we
// raycast from that input source's target-ray pose against the registered buttons. Each frame we also raycast for hover feedback.
import * as THREE from 'three';
import { pick, rayFromPose, isShown } from './pick.js';

export function createInput({ renderer, camera, scene }) {
  const items = new Map();                 // mesh -> { onSelect(hit), onHover(bool), enabled }
  const hoverBy = new Map();               // pointer key ('mouse', 'xr0', ...) -> mesh
  const shownHover = new Set();
  const targets = () => [...items.entries()].filter(([, h]) => h.enabled !== false).map(([m]) => m);

  const reticleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.9 });
  const reticles = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.013, 24), reticleMat); m.renderOrder = 30; m.visible = false; scene.add(m); return m; });

  function setHover(key, mesh) {
    if (mesh) hoverBy.set(key, mesh); else hoverBy.delete(key);
    const now = new Set(hoverBy.values());
    for (const m of [...shownHover]) if (!now.has(m)) { shownHover.delete(m); items.get(m)?.onHover?.(false); }
    for (const m of now) if (!shownHover.has(m)) { shownHover.add(m); items.get(m)?.onHover?.(true); }
  }
  const activate = (hit) => { const h = hit && items.get(hit.object); if (h && h.enabled !== false) h.onSelect?.(hit); return !!h; };

  const api = {
    register(mesh, handlers) { items.set(mesh, handlers); return () => { items.delete(mesh); setHover('mouse', null); for (const k of [...hoverBy.keys()]) if (hoverBy.get(k) === mesh) setHover(k, null); }; },
    pickRay: (origin, direction) => pick(targets(), origin, direction),
    // Test / debug helpers: ids of the buttons that can be pressed right now, and a way to press one without a ray.
    ids: () => targets().filter((m) => m.userData.id && isShown(m)).map((m) => m.userData.id),
    byId: (id) => targets().find((m) => m.userData.id === id && isShown(m)) || null,
    press(id) { const m = api.byId(id); if (m) items.get(m).onSelect?.({ object: m }); return !!m; },
    // XR: called from the session's `select` event. refSpace defaults to the renderer's.
    handleXRSelect(event, refSpace = renderer.xr.getReferenceSpace()) {
      const space = event.inputSource && event.inputSource.targetRaySpace;
      const pose = space && event.frame && event.frame.getPose(space, refSpace);
      if (!pose) return false;
      const { origin, direction } = rayFromPose(pose);
      return activate(api.pickRay(origin, direction));
    },
    // XR: each frame, hover feedback + a small reticle where each pointer lands.
    updateXR(frame) {
      const session = renderer.xr.getSession(), refSpace = renderer.xr.getReferenceSpace();
      if (!session || !frame) { reticles.forEach((r) => (r.visible = false)); return; }
      let n = 0;
      for (const src of session.inputSources) {
        const pose = src.targetRaySpace && frame.getPose(src.targetRaySpace, refSpace);
        const key = `xr${n}`, r = reticles[Math.min(n, 1)]; n++;
        if (!pose) { setHover(key, null); r.visible = false; continue; }
        const { origin, direction } = rayFromPose(pose), hit = api.pickRay(origin, direction);
        setHover(key, hit ? hit.object : null);
        r.visible = !!hit;
        if (hit) { r.position.copy(hit.point); r.quaternion.copy(camera.quaternion); }
      }
      for (let i = n; i < 2; i++) { setHover(`xr${i}`, null); reticles[i].visible = false; }
    },
    clearXR() { reticles.forEach((r) => (r.visible = false)); for (const k of [...hoverBy.keys()]) if (k.startsWith('xr')) setHover(k, null); },
  };

  // desktop mouse: hover on move, select on a click that did not drag (dragging orbits the camera)
  const dom = renderer.domElement, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const mousePick = (e) => {
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return api.pickRay(ray.ray.origin, ray.ray.direction);
  };
  let down = null;
  dom.addEventListener('pointermove', (e) => { if (!renderer.xr.isPresenting) { const h = mousePick(e); setHover('mouse', h ? h.object : null); dom.style.cursor = h ? 'pointer' : ''; } });
  dom.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  dom.addEventListener('pointerup', (e) => {
    if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6 && !renderer.xr.isPresenting) activate(mousePick(e));
    down = null;
  });
  return api;
}
