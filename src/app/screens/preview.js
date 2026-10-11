// Preview (?preview=1): one card's animation on its own, looping, with its recipe, mnemonic and real cost, and Prev / Replay /
// Pause / Next buttons to flip through cards in the headset. URL options (all optional):
//   cards=65e5,706b  or  deck=n5   which cards to flip through (default: every card of the enabled decks)
//   card=706b                      start at this card
//   recipe={...}                   try a recipe (JSON, URL-encoded) on the current card instead of its own
//   t=3.2                          freeze at this time (for screenshots); Pause / Play still work
//   trial=kenney                   a trial (content/trials/<name>.json: new recipes for some cards): flips through its cards
//                                  showing the new scene; the Old / New button shows the card's current one (old=1: start there)
//   review=1                       quick review: each card opens fully drawn with its scene playing (no stroke order) and
//                                  loops just the scene; Flag marks a card to fix (kept in this browser), Flagged flips
//                                  through only the flagged cards and lists them on screen
import * as THREE from 'three';
import { LAYOUT, COLORS, EFFECTS, COMPONENT_LOOKS } from '../../config.js';
import { makeLabel } from '../../core/text.js';
import { createButton } from '../../ui/button.js';
import { createEffect } from '../../effects/index.js';
import { normalizeRecipe, describeRecipe } from '../../effects/catalog.js';
import { loadCardAssets } from '../../content/loader.js';
import { loadModelsFor } from '../../effects/models.js';
import { addMnemonic, addPlainFurigana, cardText } from '../card-player.js';

const LOOP_AFTER = 7;                    // seconds after the last stroke before the animation replays
const FLAGS_KEY = 'jp-review-flags';

// the review flags: { cardId: its word }, kept in localStorage when it works
function loadFlags() { try { return new Map(Object.entries(JSON.parse(localStorage.getItem(FLAGS_KEY) ?? '{}'))); } catch { return new Map(); } }
function saveFlags(map) { try { localStorage.setItem(FLAGS_KEY, JSON.stringify(Object.fromEntries(map))); } catch { /* not kept */ } }

export function create(app, { ids, index = 0, recipe = null, trial = null, old = false, freeze = null, review = false }) {
  const group = new THREE.Group(), Y = LAYOUT.y, buttons = [];
  let i = Math.max(0, index), view = null, paused = freeze !== null, gen = 0, showOld = old;
  const allIds = ids, flags = loadFlags();
  let onlyFlagged = false, flagText = null, listText = null;
  const start = () => (review ? view?.effect.strokesEnd ?? 0 : 0);          // review skips the strokes: the scene starts at once
  const bar = [['prev', 'Prev', () => go(-1)], ['replay', 'Replay', () => view?.seek(start())], ['pause', 'Pause', () => togglePause()], ['next', 'Next', () => go(1)],
    ...(trial ? [['swap', 'Old / New', () => { showOld = !showOld; show(); }]] : []),
    ...(review ? [['flag', 'Flag', () => toggleFlag()], ['flagged', 'Flagged', () => toggleFlagged()]] : [])];
  const bw = 0.17, gap = 0.02, row = bar.length * bw + (bar.length - 1) * gap;
  bar.forEach(([id, label, fn], k) => { const b = createButton(app.input, { id: `preview-${id}`, label, width: bw, height: 0.07, size: 0.032, onSelect: fn }); b.group.position.set(-row / 2 + bw / 2 + k * (bw + gap), Y.buttons, 0.004); group.add(b.group); buttons.push(b); });
  const exit = createButton(app.input, { id: 'exit', label: 'Exit', width: 0.16, height: 0.065, size: 0.032, onSelect: () => app.show('home') });
  exit.group.position.set(-0.62, Y.top, 0.004); group.add(exit.group); buttons.push(exit);

  function togglePause() { paused = !paused; }
  function go(d) { i = (i + d + ids.length) % ids.length; recipe = null; show(); }
  function toggleFlag() { if (!view) return; const id = view.card.id; if (flags.has(id)) flags.delete(id); else flags.set(id, cardText(view.card)); saveFlags(flags); showFlag(); }
  function toggleFlagged() {
    if (!onlyFlagged && !flags.size) { app.note('No flagged cards yet'); return; }
    const id = ids[i]; onlyFlagged = !onlyFlagged; ids = onlyFlagged ? allIds.filter((x) => flags.has(x)) : allIds;
    i = Math.max(0, ids.indexOf(id)); show();
  }
  // the card's flag mark and count (top right), and in Flagged mode the list of flagged words (bottom)
  function showFlag() {
    flagText?.dispose(); listText?.dispose(); flagText = listText = null;
    if (!review || !view) return;
    const on = flags.has(view.card.id);
    flagText = makeLabel(on ? `FLAGGED  ·  ${flags.size} flagged` : `${flags.size} flagged`, { size: 0.035, color: '#ffffff', glow: null, panel: { pad: 0.012, radius: 0.016, color: on ? '#c0392b' : '#3a4256' } });
    flagText.mesh.position.set(0.5, Y.top, 0.004); group.add(flagText.mesh);
    if (onlyFlagged) {
      listText = makeLabel(`Flagged: ${[...flags.values()].join('  ')}`, { size: 0.026, weight: 400, color: '#ffffff', glow: null, maxWidth: 1.2, panel: { pad: 0.012, radius: 0.016, color: '#3a4256' } });
      listText.mesh.position.set(0, Y.buttons - 0.1, 0.004); group.add(listText.mesh);
    }
    app.say(`Flagged (${flags.size}): ${[...flags.keys()].join(',')}`);
  }

  async function show() {
    const my = ++gen, id = ids[i];
    let card, assets, spec;
    try { ({ card, assets } = await loadCardAssets(id)); spec = effectOf(card); await loadModelsFor(spec); } catch (e) { app.note(`Could not load card ${id}: ${e.message}`); return; }
    if (my !== gen || disposed) return;
    view?.dispose();
    view = buildView(card, assets, spec);
    group.add(view.group);
    view.seek(freeze ?? start());
    showFlag();
  }

  // the recipe shown: a URL recipe, else the trial's new one (unless Old is on), else the card's own
  const trialSide = (card) => (trial?.cards[card.id] ? (showOld ? 'old' : 'new') : null);
  const effectOf = (card) => recipe ?? (trialSide(card) === 'new' ? trial.cards[card.id] : card.effect);

  function buildView(card, assets, effectSpec) {
    const g = new THREE.Group(), texts = [];
    const addText = (t, x, y) => { t.mesh.position.set(x, y, 0); g.add(t.mesh); texts.push(t); return t; };
    const effect = createEffect(effectSpec, { ...assets, glyphHeight: LAYOUT.glyphHeight });
    effect.setPassthrough(app.passthrough); effect.group.position.y = Y.kanji; g.add(effect.group);
    const furigana = addPlainFurigana(card, assets, effect, addText);
    const r = normalizeRecipe(effectSpec, COMPONENT_LOOKS), st = effect.stats?.() ?? {}, B = EFFECTS.budget;
    addText(makeLabel(`${cardText(card)}  ${card.id}  ·  ${i + 1} / ${ids.length}${recipe ? '  ·  trying a URL recipe' : ''}`, { size: 0.04, weight: 400, color: COLORS.textDim, glow: null }), 0, Y.top);
    addText(makeLabel(`${card.meaning}  ·  ${card.primaryReading}`, { size: 0.045, panel: { pad: 0.012, radius: 0.018 } }), 0, Y.meaning);
    if (!review) addText(makeLabel(describeRecipe(r), { size: 0.026, weight: 400, color: '#ffe9c9', glow: null, maxWidth: 1.1, panel: { pad: 0.012, radius: 0.018 } }), 0, Y.sentence + 0.02);
    if (!review) addText(makeLabel(`built: ${st.drawCalls ?? '?'} draw calls (budget ${B.drawCalls}) · ${st.particles ?? 0} particle slots (${B.particles}) · ${st.pointLights ?? '?'} point lights (${B.pointLights})`, { size: 0.022, weight: 400, color: COLORS.textDim, glow: null }), 0, Y.english);
    addMnemonic(card, addText);
    const side = recipe ? null : trialSide(card);
    if (side) addText(makeLabel(side === 'new' ? `NEW · ${trial.title}` : 'OLD · the current scene', { size: 0.04, color: '#ffffff', panel: { pad: 0.014, radius: 0.018, color: side === 'new' ? '#1f8a4c' : '#6a6f7a' } }), 0.45, Y.top - 0.065);
    let t = 0;
    app.say(`Preview ${cardText(card)} (${card.id}): ${describeRecipe(r)}\n${JSON.stringify(effectSpec ?? '(no effect: default recipe)', null, 1)}`);
    return {
      group: g, card, effect, glyphKinds: assets.word?.glyphs.map((x) => x.kind) ?? ['kanji'], furigana: furigana.length,
      get t() { return t; },
      update(dt) { if (paused) return; t += dt; if (t > effect.strokesEnd + LOOP_AFTER) { this.seek(start()); return; } effect.step(t, dt); },
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
      return view && { seek: (x) => view.seek(x), info: () => ({ id: view.card.id, preview: true, t: view.t, paused, strokesEnd: view.effect.strokesEnd, effect: view.effect.stats?.() ?? null, glyphKinds: view.glyphKinds, plainFurigana: view.furigana, times: { rating: view.effect.strokesEnd + 3 } }) };
    },
    onPlaced: () => view?.seek(0),
    onEnvironment: (p) => view?.effect.setPassthrough(p),
    jump(id) { const k = ids.indexOf(id); if (k >= 0) { i = k; recipe = null; show(); } },
    dispose() { disposed = true; view?.dispose(); flagText?.dispose(); listText?.dispose(); buttons.forEach((b) => b.dispose()); group.removeFromParent(); },
  };
}
