// End of a session, or "nothing due": a short summary with the way back (and "study ahead" when nothing is due).
import * as THREE from 'three';
import { makeLabel } from '../../core/text.js';
import { createButton } from '../../ui/button.js';
import { COLORS } from '../../config.js';
import { localDay } from '../../srs/dates.js';

function whenText(app, deckCards) {
  const dues = deckCards.map((id) => app.progress.cards[id]?.due).filter((d) => d);
  if (!dues.length) return '';
  const today = app.clock.today(), day = localDay(Math.min(...dues));
  if (day <= today) return 'Next card due: later today';
  const days = Math.round((new Date(day) - new Date(today)) / 86400000);
  return days === 1 ? 'Next card due: tomorrow' : `Next card due: in ${days} days`;
}

export function create(app, { deckId, reviewed = 0, nothingDue = false }) {
  const group = new THREE.Group(), texts = [], buttons = [];
  const deck = app.decks.find((d) => d.id === deckId);
  const text = (str, o, y) => { const t = makeLabel(str, o); t.mesh.position.y = y; group.add(t.mesh); texts.push(t); };
  text(nothingDue ? 'All caught up' : 'Session complete', { size: 0.085 }, 0.30);
  text(nothingDue ? 'Nothing is due in this deck right now.' : `${reviewed} card${reviewed === 1 ? '' : 's'} reviewed`, { size: 0.045, weight: 400, color: COLORS.textDim, glow: null }, 0.17);
  const next = whenText(app, deck.cards);
  if (next) text(next, { size: 0.04, weight: 400, color: COLORS.textDim, glow: null }, 0.09);
  const add = (opts, x, y) => { const b = createButton(app.input, opts); b.group.position.set(x, y, 0); group.add(b.group); buttons.push(b); };
  add({ id: 'home', label: 'Home', width: 0.3, height: 0.1, size: 0.045, onSelect: () => app.show('home') }, nothingDue ? -0.17 : 0, -0.08);
  if (nothingDue) add({ id: 'study-ahead', label: 'Study ahead', width: 0.3, height: 0.1, size: 0.045, color: 0x24604a, onSelect: () => app.show('study', { deckId, ahead: true }) }, 0.17, -0.08);
  return { name: 'done', group, update() {}, dispose() { buttons.forEach((b) => b.dispose()); texts.forEach((t) => t.dispose()); group.removeFromParent(); } };
}
