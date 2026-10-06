// WebXR entry: Enter VR / Enter AR buttons (only for modes the browser reports as supported), session start/end, passthrough
// handling, placing the card in front of the viewer, and routing the session's `select` events to the input system.
import * as THREE from 'three';
import { LAYOUT } from '../config.js';

export function createXR({ kit, input, statusEl, buttonsEl, onPlaced, onSession }) {
  const { renderer, root } = kit;
  const state = { secure: window.isSecureContext, xr: !!navigator.xr, vr: null, ar: null, hands: 'n/a (enter a session)', note: '' };
  function render() {
    const f = (v) => (v === null ? '…' : `<span class="${v ? 'ok' : 'bad'}">${v ? 'yes' : 'no'}</span>`);
    statusEl.innerHTML = `HTTPS: ${f(state.secure)} · WebXR: ${f(state.xr)} · VR: ${f(state.vr)} · AR: ${f(state.ar)} · hands: ${state.hands}` +
      (state.note ? `<br><span class="bad">${state.note.replace(/</g, '&lt;')}</span>` : '');
  }
  const note = (msg) => { state.note = msg; render(); };
  render();

  async function start(mode) {
    try {
      const session = await navigator.xr.requestSession(mode, { optionalFeatures: ['local-floor', 'hand-tracking'] });
      renderer.xr.setReferenceSpaceType('local-floor');
      await renderer.xr.setSession(session);
    } catch (e) { note(`Could not start ${mode}: ${e && e.message ? e.message : e}`); }
  }
  const hands = (session) => { state.hands = [...session.inputSources].some((s) => s.hand) ? '<span class="ok">tracked</span>' : 'not detected yet'; render(); };

  let placed = true, frames = 0;
  renderer.xr.addEventListener('sessionstart', () => {
    const session = renderer.xr.getSession();
    const passthrough = !!(session.environmentBlendMode && session.environmentBlendMode !== 'opaque');
    kit.setPassthrough(passthrough);
    kit.controls.enabled = false;
    placed = false; frames = 0; root.visible = false;                 // hidden until we know where the viewer is looking
    state.note = ''; state.hands = 'looking…'; render();
    session.addEventListener('select', (e) => input.handleXRSelect(e));
    session.addEventListener('inputsourceschange', () => hands(session));
    hands(session);
    onSession?.({ presenting: true, passthrough });
  });
  renderer.xr.addEventListener('sessionend', () => {
    kit.setPassthrough(false);
    root.visible = true; root.position.copy(kit.desktopPos); root.rotation.set(0, 0, 0);
    kit.controls.enabled = true; placed = true; input.clearXR();
    state.hands = 'n/a (enter a session)'; render();
    onSession?.({ presenting: false, passthrough: false });
  });

  // Put the card LAYOUT.dist metres in front of where the viewer is looking, at eye height, facing them.
  function tryPlace(frame) {
    frames++;
    const pose = frame && frame.getViewerPose(renderer.xr.getReferenceSpace());
    if (!pose || frames < 10) return;
    const p = pose.transform.position, o = pose.transform.orientation;
    if (p.y < 0.3 && frames < 60) return;                              // wait for a plausible local-floor eye height
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(o.x, o.y, o.z, o.w));
    dir.y = 0; if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1); dir.normalize();
    root.position.set(p.x + dir.x * LAYOUT.dist, p.y, p.z + dir.z * LAYOUT.dist);
    root.lookAt(p.x, p.y, p.z);
    root.visible = true; placed = true;
    onPlaced?.();
  }
  kit.onFrame((dt, frame) => { if (renderer.xr.isPresenting) { if (!placed) tryPlace(frame); input.updateXR(frame); } });

  (async function detect() {
    if (!navigator.xr) { state.vr = state.ar = false; return render(); }
    for (const [mode, key, label] of [['immersive-vr', 'vr', 'Enter VR'], ['immersive-ar', 'ar', 'Enter AR']]) {
      try { state[key] = await navigator.xr.isSessionSupported(mode); } catch (e) { state[key] = false; state.note = `${mode}: ${e.message}`; }
      if (state[key]) { const b = document.createElement('button'); b.textContent = label; b.onclick = () => start(mode); buttonsEl.appendChild(b); }
    }
    render();
  })();
  return { state, note };
}
