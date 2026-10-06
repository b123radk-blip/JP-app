// Plays one study card. While the card's animation is ACTIVE: 3D kanji + effect, then furigana, meaning, sentence (2D), English,
// ratings. When it is retired: the kanji is plain text, "Show answer" reveals the rest, then ratings. Asynchronous only to learn
// the sentence audio length (so the English line appears after the voice finishes).
import * as THREE from 'three';
import { LAYOUT, TIMELINE as T, COLORS } from '../config.js';
import { makeLabel, makeRubyLine } from '../core/text.js';
import { createButton } from '../ui/button.js';
import { createEffect } from '../effects/index.js';
import { readingClipId, sentenceClipId } from '../content/clips.js';

const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const PANEL = { pad: 0.016, radius: 0.022 };

// The left panel: for a word, what it is built from (学 study · 生 life); then the optional memory story, labelled as a
// memory aid (it is never presented as the character's origin).
export function addMnemonic(card, addText, M = LAYOUT.mnemonic) {
  const out = []; let top = M.top;
  const block = (heading, text) => {
    const head = addText(makeLabel(heading, { size: M.headSize, weight: 400, color: COLORS.textDim, glow: null, maxWidth: M.width }), M.x, top);
    const body = makeLabel(text, { size: M.size, weight: 400, color: '#ffe9c9', glow: null, outline: false, maxWidth: M.width, panel: PANEL });
    addText(body, M.x, top - head.height / 2 - body.height / 2 - 0.006);
    top -= head.height + body.height + 0.03; out.push(head, body);
  };
  if (card.builtFrom?.length) block('Built from', card.builtFrom.map((b) => `${b.k} ${b.m}`).join('  ·  '));
  if (card.mnemonic) block('Memory aid (a story, not the origin)', card.mnemonic);
  return out;
}
export const cardText = (card) => card.word ?? card.kanji;
// the glyph kinds of a word, from its assets (loader.js glyphKind)
const kindsOf = (assets) => assets.word?.glyphs.map((g) => g.kind) ?? [];
export const isKanaOnly = (assets) => !!assets.word && kindsOf(assets).every((k) => k === 'hiragana' || k === 'katakana');

// Furigana over the kanji of a word that are drawn plain (outside the plan: the learner has not met them yet), shown from the
// start. One label per furigana segment that holds such a kanji, centred over that segment's glyphs.
export function addPlainFurigana(card, assets, effect, addText) {
  const kinds = kindsOf(assets), boxes = effect.glyphBoxes ?? [], out = [];
  let i = 0;
  for (const seg of card.furigana ?? []) {
    const n = [...seg.text].length, span = boxes.slice(i, i + n);
    if (seg.reading && kinds.slice(i, i + n).includes('plain') && span.length) {
      const x = (span[0].x + span.at(-1).x) / 2, size = Math.min(0.045, span[0].size * 0.24);
      const label = addText(makeLabel(seg.reading, { size, weight: 700, color: '#fff4de', glow: null, panel: { pad: 0.006, radius: 0.01 } }), x, span[0].top + size * 0.9);
      effect.group.add(label.mesh); out.push(label);
    }
    i += n;
  }
  return out;
}
// The retired (plain text) form of a card: a word with plain kanji keeps its furigana over them.
function plainText(card, assets, size) {
  const kinds = kindsOf(assets);
  if (!kinds.includes('plain')) return makeLabel(cardText(card), { size, outline: false, glow: 'rgba(255,150,60,0.6)' });
  let i = 0;
  const segs = card.furigana.map((seg) => { const n = [...seg.text].length, plain = kinds.slice(i, i + n).includes('plain'); i += n; return plain ? seg : { text: seg.text }; });
  return makeRubyLine(segs, { size });
}

// opts: card, assets (loader.loadCardAssets), active, index, total, labels { again, hard, good, easy } (interval text), onRate(rating), onExit()
export async function createCardPlayer(app, { card, assets, active, index, total, labels, onRate, onExit }) {
  const { kit, input, audio } = app, Y = LAYOUT.y;
  const sentence = card.sentences[0];
  const sayId = sentenceClipId(card, 0), len = await audio.duration(sayId, T.fallbackAudioLen);
  const group = new THREE.Group(), texts = [], buttons = [];
  const addText = (t, x, y) => { t.mesh.position.set(x, y, 0); group.add(t.mesh); texts.push(t); return t; };
  const addButton = (opts, x, y, parent = group) => { const b = createButton(input, opts); b.group.position.set(x, y, 0.004); parent.add(b.group); buttons.push(b); return b; };

  addText(makeLabel(`${index + 1} / ${total}`, { size: 0.035, weight: 400, color: COLORS.textDim, glow: null }), 0, Y.top);
  addButton({ id: 'exit', label: 'Exit', width: 0.16, height: 0.065, size: 0.032, onSelect: () => { audio.stop(); onExit(); } }, -0.62, Y.top);

  let effect = null, plain = null;
  if (active) {
    effect = createEffect(card.effect, { ...assets, glyphHeight: LAYOUT.glyphHeight });
    effect.setPassthrough(app.passthrough);
    effect.group.position.y = Y.kanji; group.add(effect.group);
    addPlainFurigana(card, assets, effect, addText);
  } else plain = addText(plainText(card, assets, Math.min(0.22, 0.62 / [...cardText(card)].length)), 0, Y.kanji);

  // the reading line above (a kana-only word shows it only once: the word itself)
  const furi = addText(makeLabel(card.primaryReading, { size: 0.075 }), 0, Y.furigana);
  furi.mesh.visible = !isKanaOnly(assets);
  const meaning = addText(makeLabel(card.meaning, { size: 0.05, color: '#ffe9c9', panel: PANEL }), 0, Y.meaning);
  const jp = addText(makeRubyLine(sentence.segments, { size: 0.075, panel: PANEL }), 0, Y.sentence);
  const en = addText(makeLabel(sentence.en, { size: 0.045, weight: 400, color: '#ffe9c9', maxWidth: 1.0, panel: PANEL }), 0, Y.english);
  const aid = addMnemonic(card, addText);

  const ratings = ['again', 'hard', 'good', 'easy'], bw = LAYOUT.buttonW, gap = LAYOUT.buttonGap, rowW = 4 * bw + 3 * gap;
  const ratingGroup = new THREE.Group(); ratingGroup.position.y = Y.buttons; group.add(ratingGroup);
  const rateBtns = ratings.map((r, i) => addButton({ id: `rate-${r}`, label: cap(r), sub: labels[r], width: bw, height: LAYOUT.buttonH, size: 0.036, subSize: 0.024, color: COLORS.rating[r], onSelect: () => { audio.stop(); onRate(r); } }, -rowW / 2 + bw / 2 + i * (bw + gap), 0, ratingGroup));
  const showBtn = addButton({ id: 'show-answer', label: 'Show answer', width: 0.5, height: LAYOUT.buttonH, size: 0.04, onSelect: () => reveal() }, 0, Y.buttons);
  const skipBtn = addButton({ id: 'skip', label: 'Skip', width: 0.16, height: 0.065, size: 0.032, onSelect: () => skip() }, 0.62, Y.top);

  // ---- timeline ----
  let t = 0, revealT = active ? 0 : null, saidReading = false, saidSentence = false, S;
  function schedule() {
    if (active) {
      const end = effect.strokesEnd, say = end + T.sayDelay + T.sentenceDelay, english = say + len + T.englishPad;
      return { reading: end, meaning: end + T.meaningDelay, sentence: end + T.sentenceDelay, say, english, rating: english + T.ratingDelay };
    }
    return { reading: 0, meaning: 0.1, sentence: 0.25, say: 0.3, english: 0.5, rating: 0.5 + T.ratingDelay * 0.6 };   // after "Show answer", relative to the reveal
  }
  S = schedule();

  function reveal() { if (revealT === null) { revealT = t; } }
  function skip() { if (active) { audio.stop(); saidReading = saidSentence = true; t = Math.max(t, S.rating); } }
  function restart() { t = 0; revealT = active ? 0 : null; saidReading = saidSentence = false; effect?.reset(); audio.stop(); }
  function seek(target) {                                      // deterministic jump, for tests and screenshots
    const wasRevealed = revealT !== null;
    restart(); if (!active && wasRevealed) revealT = 0;     // a retired card that was already revealed stays revealed
    const h = 1 / 60;
    if (effect) for (let tau = h; tau < target; tau += h) effect.step(tau, h);
    t = target; saidReading = saidSentence = true; update(0);
  }

  function update(dt) {
    t += dt;
    effect?.step(t, dt);
    const rt = revealT === null ? -1 : t - revealT;
    const f = (at) => (rt < 0 ? 0 : smooth((rt - at) / T.fade));
    furi.setOpacity(f(S.reading)); meaning.setOpacity(f(S.meaning)); aid.forEach((x) => x.setOpacity(f(S.meaning))); jp.setOpacity(f(S.sentence)); en.setOpacity(f(S.english));
    if (rt >= 0 && !saidReading && rt >= S.reading) { saidReading = true; if (active) audio.play(readingClipId(card)); }
    if (rt >= 0 && !saidSentence && rt >= S.say) { saidSentence = true; audio.play(sayId); }
    const rf = f(S.rating);
    ratingGroup.visible = rf > 0; rateBtns.forEach((b) => { b.setOpacity(rf); b.setEnabled(rf > 0.6); });
    const showOn = !active && revealT === null, skipOn = active && rf === 0;
    showBtn.setEnabled(showOn); showBtn.setVisible(showOn);
    skipBtn.setEnabled(skipOn); skipBtn.setVisible(skipOn);
  }
  update(0);
  return {
    group, update, seek, restart, reveal, skip,
    setPassthrough: (b) => effect?.setPassthrough(b),
    info: () => ({ id: card.id, type: card.type ?? 'kanji', active, t, revealed: revealT !== null, ratingsVisible: ratingGroup.visible, times: S, hasEffect: !!effect, effectId: typeof card.effect === 'string' ? card.effect : card.effect ? 'recipe' : 'default', effect: effect?.stats?.() ?? null }),
    dispose() { audio.stop(); effect?.dispose(); buttons.forEach((b) => b.dispose()); texts.forEach((x) => x.dispose()); group.removeFromParent(); },
  };
}
