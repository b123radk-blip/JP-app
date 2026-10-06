// Preview (?preview=1): one card's animation on its own, looping, with its recipe, mnemonic and real cost, and Prev / Replay /
// Pause / Next buttons to flip through cards in the headset. URL options (all optional):
//   cards=65e5,706b  or  deck=n5   which cards to flip through (default: every card of the enabled decks)
//   card=706b                      start at this card
//   recipe={...}                   try a recipe (JSON, URL-encoded) on the current card instead of its own
//   t=3.2                          freeze at this time (for screenshots); Pause / Play still work
import * as THREE from 'three';
import { LAYOUT, COLORS, EFFECTS, COMPONENT_LOOKS } from '../../config.js';
import { makeLabel } from '../../core/text.js';
import { createButton } from '../../ui/button.js';
import { createEffect } from '../../effects/index.js';
import { normalizeRecipe, describeRecipe } from '../../effects/catalog.js';
import { loadCardAssets } from '../../content/loader.js';
import { addMnemonic, cardText } from '../card-player.js';

const LOOP_AFTER = 7;                    // seconds after the last stroke before the animation replays

export function create(app, { ids, index = 0, recipe = null, freeze = null }) {
  const group = new THREE.Group(), Y = LAYOUT.y, buttons = [];
  let i = Math.max(0, index), view = null, paused = freeze !== null, gen = 0;
  const bar = [['prev', 'Prev', () => go(-1)], ['replay', 'Replay', () => view?.seek(0)], ['pause', 'Pause', () => togglePause()], ['next', 'Next', () => go(1)]];
  const bw = 0.17, gap = 0.02, row = bar.length * bw + (bar.length - 1) * gap;
  bar.forEach(([id, label, fn], k) => { const b = createButton(app.input, { id: `preview-${id}`, label, width: bw, height: 0.07, size: 0.032, onSelect: fn }); b.group.position.set(-row / 2 + bw / 2 + k * (bw + gap), Y.buttons, 0.004); group.add(b.group); buttons.push(b); });
  const exit = createButton(app.input, { id: 'exit', label: 'Exit', width: 0.16, height: 0.065, size: 0.032, onSelect: () => app.show('home') });
  exit.group.position.set(-0.62, Y.top, 0.004); group.add(exit.group); buttons.push(exit);

  function togglePause() { paused = !paused; }
  function go(d) { i = (i + d + ids.length) % ids.length; recipe = null; show(); }

  async function show() {
    const my = ++gen, id = ids[i];
    let card, assets;
    try { ({ card, assets } = await loadCardAssets(id)); } catch (e) { app.note(`Could not load card ${id}: ${e.message}`); return; }
    if (my !== gen || disposed) return;
    view?.dispose();
    view = buildView(card, assets, recipe ?? card.effect);
    group.add(view.group);
    view.seek(freeze ?? 0);
  }

  function buildView(card, assets, effectSpec) {
    const g = new THREE.Group(), texts = [];
    const addText = (t, x, y) => { t.mesh.position.set(x, y, 0); g.add(t.mesh); texts.push(t); return t; };
    const effect = createEffect(effectSpec, { ...assets, glyphHeight: LAYOUT.glyphHeight });
    effect.setPassthrough(app.passthrough); effect.group.position.y = Y.kanji; g.add(effect.group);
    const r = normalizeRecipe(effectSpec, COMPONENT_LOOKS), st = effect.stats?.() ?? {}, B = EFFECTS.budget;
    addText(makeLabel(`${cardText(card)}  ${card.id}  ·  ${i + 1} / ${ids.length}${recipe ? '  ·  trying a URL recipe' : ''}`, { size: 0.04, weight: 400, color: COLORS.textDim, glow: null }), 0, Y.top);
    addText(makeLabel(`${card.meaning}  ·  ${card.primaryReading}`, { size: 0.045, panel: { pad: 0.012, radius: 0.018 } }), 0, Y.meaning);
    addText(makeLabel(describeRecipe(r), { size: 0.026, weight: 400, color: '#ffe9c9', glow: null, maxWidth: 1.1, panel: { pad: 0.012, radius: 0.018 } }), 0, Y.sentence + 0.02);
    addText(makeLabel(`built: ${st.drawCalls ?? '?'} draw calls (budget ${B.drawCalls}) · ${st.particles ?? 0} particle slots (${B.particles}) · ${st.pointLights ?? '?'} point lights (${B.pointLights})`, { size: 0.022, weight: 400, color: COLORS.textDim, glow: null }), 0, Y.english);
    addMnemonic(card, addText);
    let t = 0;
    app.say(`Preview ${cardText(card)} (${card.id}): ${describeRecipe(r)}\n${JSON.stringify(effectSpec ?? '(no effect: default recipe)', null, 1)}`);
    return {
      group: g, card, effect,
      get t() { return t; },
      update(dt) { if (paused) return; t += dt; if (t > effect.strokesEnd + LOOP_AFTER) { this.seek(0); return; } effect.step(t, dt); },
      seek(target) { effect.reset(); const h = 1 / 60; for (let tau = h; tau < target; tau += h) effect.step(tau, h); t = target; effect.step(t, 0); },
      dispose() { effect.dispose(); texts.forEach((x) => x.dispose()); g.removeFromParent(); },
    };
  }

  let disposed = false;
  show();
  return {
    name: 'preview', group,
    update(dt) { view?.update(dt); },
    get player() {                                            // the test hook (window.__app.seek / info) talks to this
      return view && { seek: (x) => view.seek(x), info: () => ({ id: view.card.id, preview: true, t: view.t, paused, strokesEnd: view.effect.strokesEnd, effect: view.effect.stats?.() ?? null, times: { rating: view.effect.strokesEnd + 3 } }) };
    },
    onPlaced: () => view?.seek(0),
    onEnvironment: (p) => view?.effect.setPassthrough(p),
    jump(id) { const k = ids.indexOf(id); if (k >= 0) { i = k; recipe = null; show(); } },
    dispose() { disposed = true; view?.dispose(); buttons.forEach((b) => b.dispose()); group.removeFromParent(); },
  };
}
