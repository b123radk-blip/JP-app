// Plays one study card. While the card's animation is ACTIVE: 3D kanji + effect, then furigana, meaning, sentence (2D), English,
// ratings. When it is retired: the kanji is plain text, "Show answer" reveals the rest, then ratings. Asynchronous only to learn
// the sentence audio length (so the English line appears after the voice finishes).
import * as THREE from 'three';
import { LAYOUT, TIMELINE as T, COLORS } from '../config.js';
import { makeLabel, makeRubyLine } from '../core/text.js';
import { createButton } from '../ui/button.js';
import { createEffect } from '../effects/index.js';

const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const PANEL = { pad: 0.016, radius: 0.022 };

// opts: card, kanjiData, active, index, total, labels { again, hard, good, easy } (interval text), onRate(rating), onExit()
export async function createCardPlayer(app, { card, kanjiData, active, index, total, labels, onRate, onExit }) {
  const { kit, input, audio } = app, Y = LAYOUT.y;
  const sentence = card.sentences[0];
  const len = await audio.duration(sentence.audio, T.fallbackAudioLen);
  const group = new THREE.Group(), texts = [], buttons = [];
  const addText = (t, x, y) => { t.mesh.position.set(x, y, 0); group.add(t.mesh); texts.push(t); return t; };
  const addButton = (opts, x, y, parent = group) => { const b = createButton(input, opts); b.group.position.set(x, y, 0.004); parent.add(b.group); buttons.push(b); return b; };

  addText(makeLabel(`${index + 1} / ${total}`, { size: 0.035, weight: 400, color: COLORS.textDim, glow: null }), 0, Y.top);
  addButton({ id: 'exit', label: 'Exit', width: 0.16, height: 0.065, size: 0.032, onSelect: () => { audio.stop(); onExit(); } }, -0.62, Y.top);

  let effect = null, plain = null;
  if (active) {
    effect = createEffect(card.effect, { kanji: kanjiData, glyphHeight: LAYOUT.glyphHeight });
    effect.setPassthrough(app.passthrough);
    effect.group.position.y = Y.kanji; group.add(effect.group);
  } else plain = addText(makeLabel(card.kanji, { size: 0.22, outline: false, glow: 'rgba(255,150,60,0.6)' }), 0, Y.kanji);

  const furi = addText(makeLabel(card.primaryReading, { size: 0.075 }), 0, Y.furigana);
  const meaning = addText(makeLabel(card.meaning, { size: 0.05, color: '#ffe9c9', panel: PANEL }), 0, Y.meaning);
  const jp = addText(makeRubyLine(sentence.segments, { size: 0.075, panel: PANEL }), 0, Y.sentence);
  const en = addText(makeLabel(sentence.en, { size: 0.045, weight: 400, color: '#ffe9c9', maxWidth: 1.0, panel: PANEL }), 0, Y.english);

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
    furi.setOpacity(f(S.reading)); meaning.setOpacity(f(S.meaning)); jp.setOpacity(f(S.sentence)); en.setOpacity(f(S.english));
    if (rt >= 0 && !saidReading && rt >= S.reading) { saidReading = true; if (active) audio.play(card.audio?.reading); }
    if (rt >= 0 && !saidSentence && rt >= S.say) { saidSentence = true; audio.play(sentence.audio); }
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
    info: () => ({ id: card.id, active, t, revealed: revealT !== null, ratingsVisible: ratingGroup.visible, times: S, hasEffect: !!effect, effectId: card.effect || 'default' }),
    dispose() { audio.stop(); effect?.dispose(); buttons.forEach((b) => b.dispose()); texts.forEach((x) => x.dispose()); group.removeFromParent(); },
  };
}
