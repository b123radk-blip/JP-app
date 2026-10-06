// A 3D button: rounded panel + label (+ optional small second line), registered with the input system for pointing.
import * as THREE from 'three';
import { makeLabel } from '../core/text.js';
import { COLORS } from '../config.js';

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}

// opts: id, label, sub, width, height, size (label font, m), subSize, color, onSelect, enabled
export function createButton(input, { id, label, sub = null, width, height, size = height * 0.42, subSize = size * 0.6, color = COLORS.button, onSelect, enabled = true }) {
  const group = new THREE.Group(); group.name = id;
  const base = new THREE.Color(color), hoverCol = base.clone().lerp(new THREE.Color(0xffffff), 0.22), offCol = new THREE.Color(COLORS.disabled);
  const mat = new THREE.MeshBasicMaterial({ color: base, transparent: true });
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(width, height, Math.min(width, height) * 0.2)), mat);
  mesh.userData.id = id; group.add(mesh);
  const texts = [];
  const addText = (t, y) => { t.mesh.position.set(0, y, 0.003); group.add(t.mesh); texts.push(t); };
  addText(makeLabel(label, { size, glow: null }), sub ? height * 0.16 : 0);
  if (sub) addText(makeLabel(sub, { size: subSize, weight: 400, color: COLORS.textDim, glow: null }), -height * 0.26);

  let hover = false, opacity = 1, shown = true;
  const handlers = { enabled, onSelect: () => onSelect?.(), onHover: (h) => { hover = h; refresh(); } };
  function refresh() {
    mat.color.copy(handlers.enabled ? (hover ? hoverCol : base) : offCol);
    mat.opacity = opacity; group.scale.setScalar(hover && handlers.enabled ? 1.05 : 1);
    texts.forEach((t) => t.setOpacity(opacity * (handlers.enabled ? 1 : 0.45)));
    group.visible = shown && opacity > 0.01;
  }
  const unregister = input.register(mesh, handlers);
  refresh();
  return {
    group, mesh, id,
    setEnabled(b) { handlers.enabled = b; if (!b) hover = false; refresh(); },
    setOpacity(a) { opacity = a; refresh(); },
    setVisible(b) { shown = b; handlers.enabled = b && handlers.enabled; refresh(); },                        // hidden buttons are neither drawn nor pressable

    dispose() { unregister(); texts.forEach((t) => t.dispose()); mesh.geometry.dispose(); mat.dispose(); group.removeFromParent(); },
  };
}
