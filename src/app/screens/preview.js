// Preview (?preview=1): one card's animation on its own, looping, with its recipe, mnemonic and real cost, and Prev / Replay /
// Pause / Next buttons to flip through cards in the headset. URL options (all optional):
//   cards=65e5,706b  or  deck=n5 (or deck=haiku: content/decks/haiku.json, a review list outside the deck index)   which cards to flip through (default: every card of the enabled decks)
//   card=706b                      start at this card
//   recipe={...}                   try a recipe (JSON, URL-encoded) on the current card instead of its own
//   t=3.2                          freeze at this time (for screenshots); Pause / Play still work
//   trial=kenney                   a trial (content/trials/<name>.json: new recipes for some cards): flips through its cards
//                                  showing the new scene; the Old / New button shows the card's current one (old=1: start there)
//   review=1                       quick review: each card opens fully drawn with its scene playing (no stroke order) and
//                                  loops just the scene; Flag marks a card to fix (kept in this browser), Flagged flips
//                                  through only the flagged cards and lists them on screen; Send opens a GitHub issue
//                                  filled in with the flagged cards, to submit for fixing. On a flagged card, Talk / Stop
//                                  record a spoken note (speech to text) that goes on that card's line; Type leaves the
//                                  headset view for a text box (the system keyboard's own voice typing works there);
//                                  Unflag clears a card that now looks right (in Flagged mode the next one comes up)
import * as THREE from 'three';
import { LAYOUT, COLORS, EFFECTS, COMPONENT_LOOKS } from '../../config.js';
import { makeLabel } from '../../core/text.js';
import { createButton } from '../../ui/button.js';
import { createEffect } from '../../effects/index.js';
import { normalizeRecipe, describeRecipe } from '../../effects/catalog.js';
import { loadCardAssets } from '../../content/loader.js';
import { loadModelsFor } from '../../effects/models.js';
import { addMnemonic, addPlainFurigana, cardText } from '../card-player.js';
import { createSpeech } from '../speech.js';
import { openNoteEditor } from '../note-editor.js';

const LOOP_AFTER = 7;                    // seconds after the last stroke before the animation replays
const FLAGS_KEY = 'jp-review-flags', ISSUES = 'https://github.com/b123radk-blip/JP-app/issues/new';

// the review flags: { cardId: { w: its word, note: what to fix } }, kept in localStorage when it works (older saves kept
// just the word)
function loadFlags() {
  try { return new Map(Object.entries(JSON.parse(localStorage.getItem(FLAGS_KEY) ?? '{}')).map(([id, f]) => [id, typeof f === 'string' ? { w: f, note: '' } : f])); }
  catch { return new Map(); }
}
function saveFlags(map) { try { localStorage.setItem(FLAGS_KEY, JSON.stringify(Object.fromEntries(map))); } catch { /* not kept */ } }

export function create(app, { ids, index = 0, recipe = null, trial = null, old = false, freeze = null, review = false }) {
  const group = new THREE.Group(), Y = LAYOUT.y, buttons = [];
  let i = Math.max(0, index), view = null, paused = freeze !== null, gen = 0, showOld = old;
  const allIds = ids, flags = loadFlags();
  let onlyFlagged = false, flagText = null, listText = null, noteText = null, noteBase = '', live = '', speechError = '';
  // spoken notes: Talk appends what is said to the flagged card's note until Stop
  const speech = createSpeech({
    onText(heard, interim) { const f = view && flags.get(view.card.id); if (!f) return; f.note = [noteBase, heard].filter(Boolean).join(' '); live = interim; saveFlags(flags); redrawNote(); },
    onState() { live = ''; showFlag(); },
    onError(m) { speechError = m; app.note(m); showFlag(); },              // shown in the scene too: app.note is 2D only
  });
  const start = () => (review ? view?.effect.strokesEnd ?? 0 : 0);          // review skips the strokes: the scene starts at once
  const bar = [['prev', 'Prev', () => go(-1)], ['replay', 'Replay', () => view?.seek(start())], ['pause', 'Pause', () => togglePause()], ['next', 'Next', () => go(1)],
    ...(trial ? [['swap', 'Old / New', () => { showOld = !showOld; show(); }]] : []),
    ...(review ? [['flag', 'Flag', () => toggleFlag()], ['flagged', 'Flagged', () => toggleFlagged()], ['send', 'Send', () => send()]] : [])];
  const bw = review ? 0.155 : 0.17, gap = 0.02, row = bar.length * bw + (bar.length - 1) * gap;
  bar.forEach(([id, label, fn], k) => { const b = createButton(app.input, { id: `preview-${id}`, label, width: bw, height: 0.07, size: 0.032, onSelect: fn }); b.group.position.set(-row / 2 + bw / 2 + k * (bw + gap), Y.buttons, 0.004); group.add(b.group); buttons.push(b); });
  const talkRow = review ? [['talk', 'Talk', '#1f7a4c', () => talk()], ['stop', 'Stop', '#8a2a2a', () => speech.stop()], ['type', 'Type', '#3a5a9a', () => typeNote()], ['unflag', 'Unflag', '#1f6f8f', () => unflag()]].map(([id, label, color, fn], k) => {
    const b = createButton(app.input, { id: `preview-${id}`, label, width: 0.2, height: 0.07, size: 0.032, color, onSelect: fn });
    b.group.position.set((k - 1.5) * 0.22, Y.buttons + 0.09, 0.004); b.setVisible(false); group.add(b.group); buttons.push(b); return b;
  }) : [];
  const exit = createButton(app.input, { id: 'exit', label: 'Exit', width: 0.16, height: 0.065, size: 0.032, onSelect: () => app.show('home') });
  exit.group.position.set(-0.62, Y.top, 0.004); group.add(exit.group); buttons.push(exit);

  function togglePause() { paused = !paused; }
  function go(d) { speech.stop(); speechError = ''; i = (i + d + ids.length) % ids.length; recipe = null; show(); }
  function toggleFlag() {
    if (!view) return; const id = view.card.id; speech.stop();
    if (flags.has(id)) flags.delete(id); else flags.set(id, { w: cardText(view.card), note: '' });
    saveFlags(flags); showFlag();
  }
  // the card looks right now: its flag (and note) goes, and in Flagged mode the next flagged card comes up
  function unflag() {
    if (!view || !flags.has(view.card.id)) return; const id = view.card.id; speech.stop();
    flags.delete(id); saveFlags(flags); app.note(`Unflagged ${cardText(view.card)}`);
    if (!onlyFlagged) { showFlag(); return; }
    ids = allIds.filter((x) => flags.has(x));
    if (!ids.length) { onlyFlagged = false; ids = allIds; i = Math.max(0, ids.indexOf(id)); } else i = Math.min(i, ids.length - 1);
    recipe = null; show();
  }
  // the note is redrawn at most every 0.2 s while words come in (each redraw builds a new text texture)
  let noteTimer = 0;
  function redrawNote() { if (noteTimer) return; noteTimer = setTimeout(() => { noteTimer = 0; if (!disposed) showNote(); }, 200); }
  function talk() { const f = view && flags.get(view.card.id); if (!f) return; noteBase = f.note; speechError = ''; speech.start(); }
  // the note in a 2D text box: leaves the headset view, where the system keyboard (and its voice typing) can be used
  function typeNote() {
    const f = view && flags.get(view.card.id); if (!f) return;
    speech.stop(); app.kit.renderer.xr.getSession()?.end();
    openNoteEditor({ title: `Note for ${f.w}`, text: f.note, onSave(text) { f.note = text; speechError = ''; saveFlags(flags); showFlag(); } });
  }
  function toggleFlagged() {
    if (!onlyFlagged && !flags.size) { app.note('No flagged cards yet'); return; }
    const id = ids[i]; onlyFlagged = !onlyFlagged; ids = onlyFlagged ? allIds.filter((x) => flags.has(x)) : allIds;
    i = Math.max(0, ids.indexOf(id)); show();
  }
  // a new GitHub issue with the flagged cards filled in; it leaves the headset view so the page can be read and submitted
  function send() {
    if (!flags.size) { app.note('No flagged cards yet'); return; }
    speech.stop();
    const body = `Flagged in review mode. Add or fix a note after any card (what looks wrong), then Submit.\n\n${[...flags].map(([id, f]) => `- ${f.w} (${id}): ${f.note}`).join('\n')}\n`;
    const url = `${ISSUES}?title=${encodeURIComponent(`Review flags: ${flags.size} card${flags.size > 1 ? 's' : ''}`)}&body=${encodeURIComponent(body)}`;
    if (!window.open(url, '_blank')) location.href = url;
    app.kit.renderer.xr.getSession()?.end();
  }
  // the flagged card's note (or a prompt to record one) above the Talk / Stop buttons
  function showNote() {
    noteText?.dispose(); noteText = null;
    const f = review && view && flags.get(view.card.id); if (!f) return;
    const err = !speech.listening && speechError;
    const text = speech.listening ? `Listening…  ${[f.note, live].filter(Boolean).join(' ')}` : err ? `${speechError}. Use Type instead.${f.note ? `  Note: ${f.note}` : ''}` : f.note ? `Note: ${f.note}` : 'Tap Talk and say what to fix (or Type)';
    noteText = makeLabel(text, { size: 0.028, weight: 400, color: '#ffffff', glow: null, maxWidth: 1.1, panel: { pad: 0.012, radius: 0.016, color: speech.listening ? '#1f7a4c' : err ? '#a03030' : '#3a4256' } });
    noteText.mesh.position.set(0, Y.buttons + 0.2, 0.006); group.add(noteText.mesh);
  }
  // the card's flag mark and count (top right), the note and Talk / Stop on a flagged card, and in Flagged mode the list
  // of flagged words (bottom)
  function showFlag() {
    flagText?.dispose(); listText?.dispose(); flagText = listText = null;
    const on = !!(review && view && flags.has(view.card.id));
    talkRow.forEach((b, k) => { b.setVisible(on); if (on) b.setEnabled([!speech.listening, speech.listening, true, true][k]); });
    showNote();
    if (!review || !view) return;
    flagText = makeLabel(on ? `FLAGGED  ·  ${flags.size} flagged` : `${flags.size} flagged`, { size: 0.035, color: '#ffffff', glow: null, panel: { pad: 0.012, radius: 0.016, color: on ? '#c0392b' : '#3a4256' } });
    flagText.mesh.position.set(0.5, Y.top, 0.004); group.add(flagText.mesh);
    if (onlyFlagged) {
      listText = makeLabel(`Flagged: ${[...flags.values()].map((f) => f.w).join('  ')}`, { size: 0.026, weight: 400, color: '#ffffff', glow: null, maxWidth: 1.2, panel: { pad: 0.012, radius: 0.016, color: '#3a4256' } });
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
    addText(makeLabel(`${card.meaning}  ·  ${card.primaryReading}`, { size: 0.045, panel: { pad: 0.012, radius: 0.018 } }), 0, Y.meaning).mesh.name = 'meaning';
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

  // where the kanji and the scene's visible meshes are on screen now (CSS pixels), for scripts/look.mjs --fit
  function bounds(v, camera) {
    const box = new THREE.Box3(), b = new THREE.Box3(), p = new THREE.Vector3(), m = new THREE.Matrix4(), out = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    v.group.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    for (const g of v.effect.glyphBoxes) {
      b.set(p.set(g.x - g.size / 2, g.top - g.size, 0), new THREE.Vector3(g.x + g.size / 2, g.top, 0)).applyMatrix4(v.effect.group.matrixWorld); box.union(b);
    }
    (function walk(o) {
      if (!o.visible) return;
      if (o.isInstancedMesh) {                           // only the instances shown (a hidden one is scaled to 0)
        o.geometry.boundingBox ?? o.geometry.computeBoundingBox();
        for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); if (Math.abs(m.determinant()) > 1e-12) box.union(b.copy(o.geometry.boundingBox).applyMatrix4(m.premultiply(o.matrixWorld))); }
      } else if (o.isMesh) {                             // a skinned mesh has its own (posed) box
        if (o.isSkinnedMesh) { o.computeBoundingBox(); b.copy(o.boundingBox); } else { o.geometry.boundingBox ?? o.geometry.computeBoundingBox(); b.copy(o.geometry.boundingBox); }
        box.union(b.applyMatrix4(o.matrixWorld));
      }
      for (const c of o.children) walk(c);
    })(v.group.getObjectByName('vignette') ?? new THREE.Group());
    for (let k = 0; k < 8; k++) {
      p.set(k & 1 ? box.max.x : box.min.x, k & 2 ? box.max.y : box.min.y, k & 4 ? box.max.z : box.min.z).project(camera);
      const x = ((p.x + 1) / 2) * innerWidth, y = ((1 - p.y) / 2) * innerHeight;
      out.x0 = Math.min(out.x0, x); out.y0 = Math.min(out.y0, y); out.x1 = Math.max(out.x1, x); out.y1 = Math.max(out.y1, y);
    }
    return out;
  }

  let disposed = false;
  show();
  return {
    name: 'preview', group,
    update(dt) { view?.update(dt); },
    get player() {                                            // the test hook (window.__app.seek / info) talks to this
      return view && { seek: (x) => view.seek(x), bounds: () => bounds(view, app.kit.camera), info: () => ({ id: view.card.id, preview: true, t: view.t, paused, strokesEnd: view.effect.strokesEnd, effect: view.effect.stats?.() ?? null, glyphKinds: view.glyphKinds, plainFurigana: view.furigana, times: { rating: view.effect.strokesEnd + 3 } }) };
    },
    onPlaced: () => view?.seek(0),
    onEnvironment: (p) => view?.effect.setPassthrough(p),
    jump(id) { const k = ids.indexOf(id); if (k >= 0) { i = k; recipe = null; show(); } },
    dispose() { disposed = true; speech.stop(); view?.dispose(); flagText?.dispose(); listText?.dispose(); noteText?.dispose(); buttons.forEach((b) => b.dispose()); group.removeFromParent(); },
  };
}
