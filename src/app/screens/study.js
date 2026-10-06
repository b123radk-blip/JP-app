// A study session over one deck: builds the queue, shows each card with the card player, applies the rating, saves progress.
import * as THREE from 'three';
import { makeLabel } from '../../core/text.js';
import { buildQueue, StudySession } from '../../srs/session.js';
import { animationActive } from '../../srs/retirement.js';
import { loadCard, loadStrokes } from '../../content/loader.js';
import { createCardPlayer } from '../card-player.js';
import { COLORS } from '../../config.js';

export function create(app, { deckId, ahead = false }) {
  const group = new THREE.Group();
  const deck = app.decks.find((d) => d.id === deckId);
  let player = null, session = null, disposed = false, loading = null, gen = 0;

  async function showCard() {
    const id = session.current, my = ++gen;
    if (!loading) { loading = makeLabel('Loading…', { size: 0.05, weight: 400, color: COLORS.textDim, glow: null }); group.add(loading.mesh); }
    try {
      const [card, kanjiData] = await Promise.all([loadCard(id), loadStrokes(id)]);
      const state = app.progress.cards[id], now = app.clock.now();
      const active = animationActive(state, app.debug.forceAnimation);
      const labels = Object.fromEntries(['again', 'hard', 'good', 'easy'].map((r) => [r, app.scheduler.label(state, r, now)]));
      const p = await createCardPlayer(app, {
        card, kanjiData, active, labels,
        index: Math.min(session.reviewed, session.total - 1), total: session.total,
        onRate: (rating) => rate(id, rating), onExit: () => app.show('home'),
      });
      if (disposed || my !== gen) { p.dispose(); return; }
      player?.dispose(); player = p; group.add(p.group);
      loading?.dispose(); loading = null;
    } catch (e) { app.note(`Could not load card ${id}: ${e.message}`); }
  }
  function rate(id, rating) {
    const next = app.scheduler.review(app.progress.cards[id] || app.scheduler.newState(id), rating, app.clock.now());
    app.progress.cards[id] = next; app.save();
    session.answer(rating);
    if (session.done) app.show('done', { deckId, reviewed: session.reviewed });
    else showCard();
  }

  const queue = buildQueue({ deckIds: deck.cards, cards: app.progress.cards, now: app.clock.now(), cfg: app.srsConfig, ahead });
  if (!queue.length) queueMicrotask(() => app.show('done', { deckId, nothingDue: true }));
  else { session = new StudySession(queue, app.srsConfig); showCard(); }

  return {
    name: 'study', group, deckId,
    update: (dt) => player?.update(dt),
    get player() { return player; },
    get session() { return session; },
    onPlaced: () => player?.restart(),
    onEnvironment: (passthrough) => player?.setPassthrough(passthrough),
    jump(id) { session?.jumpTo(id); showCard(); },                  // debug panel
    reload() { if (session) showCard(); },                          // debug panel: re-evaluate whether the animation is active
    dispose() { disposed = true; player?.dispose(); loading?.dispose(); group.removeFromParent(); },
  };
}
