// Renderer, scene, camera, desktop orbit controls and the frame loop. The `root` group is what gets placed in front of the
// viewer in XR; screens draw into `card` (a child of root, lifted a little so the card's middle sits near eye height).
import * as THREE from 'three';
import { OrbitControls } from '../../vendor/three/OrbitControls.js';
import { LAYOUT, COLORS } from '../config.js';

export function createScene(container = document.body) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  container.prepend(renderer.domElement);

  const BG = new THREE.Color(COLORS.bg);
  const scene = new THREE.Scene();
  scene.background = BG;
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 100);
  const desktopPos = new THREE.Vector3(...LAYOUT.desktopPos);
  camera.position.set(0, desktopPos.y, desktopPos.z + LAYOUT.dist + LAYOUT.desktopCameraBack);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(desktopPos);
  controls.enableDamping = true;
  controls.update();

  const root = new THREE.Group(); root.position.copy(desktopPos); scene.add(root);
  const card = new THREE.Group(); card.position.y = LAYOUT.cardY; root.add(card);

  const updaters = new Set();
  let last = null;
  renderer.setAnimationLoop((now, frame) => {
    const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000); last = now;
    for (const fn of [...updaters]) fn(dt, frame);
    if (controls.enabled) controls.update();
    renderer.render(scene, camera);
  });
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  return {
    renderer, scene, camera, controls, root, card, desktopPos,
    onFrame(fn) { updaters.add(fn); return () => updaters.delete(fn); },
    // In AR (passthrough) the real room is the backdrop, so drop the solid background.
    setPassthrough(on) { scene.background = on ? null : BG; renderer.setClearAlpha(on ? 0 : 1); },
  };
}
