// Home: the deck tiles (N5 to N1). Nothing starts until a deck is pointed at.
import * as THREE from 'three';
import { makeLabel } from '../../core/text.js';
import { createButton } from '../../ui/button.js';
import { COLORS } from '../../config.js';
import { buildQueue } from '../../srs/session.js';

export function create(app) {
  const group = new THREE.Group(), texts = [], buttons = [];
  const text = (str, o, y) => { const t = makeLabel(str, o); t.mesh.position.y = y; group.add(t.mesh); texts.push(t); };
  text('Kanji Memory', { size: 0.085 }, 0.40);
  text('Choose a deck to study', { size: 0.04, weight: 400, color: COLORS.textDim, glow: null }, 0.29);

  const w = 0.21, h = 0.30, gap = 0.025, n = app.decks.length;
  app.decks.forEach((d, i) => {
    let sub = 'coming soon';
    if (d.enabled) {
      const queue = buildQueue({ deckIds: d.cards, requires: d.requires, cards: app.progress.cards, now: app.clock.now(), cfg: { ...app.srsConfig, maxSessionCards: 9999 } });
      const due = queue.filter((id) => app.progress.cards[id]).length;
      sub = `${due} due · ${queue.length - due} new`;
    }
    const b = createButton(app.input, { id: `deck-${d.id}`, label: d.title, sub, width: w, height: h, size: 0.09, subSize: 0.028, color: d.enabled ? 0x3a2414 : COLORS.disabled, enabled: d.enabled, onSelect: () => app.show('study', { deckId: d.id }) });
    b.group.position.set(-((n - 1) / 2) * (w + gap) + i * (w + gap), 0.02, 0);
    group.add(b.group); buttons.push(b);
  });
  text('Point at a deck and pinch (or click) to start', { size: 0.032, weight: 400, color: COLORS.textDim, glow: null }, -0.25);
  return { name: 'home', group, update() {}, dispose() { buttons.forEach((b) => b.dispose()); texts.forEach((t) => t.dispose()); group.removeFromParent(); } };
}
