// Every tunable number lives here. Change values here, not in the modules.

// ---- spaced repetition and animation retirement ----
export const SRS = {
  goodRatings: ['good', 'easy'],      // ratings that count towards retiring a card's animation
  lapseRatings: ['again', 'hard'],    // ratings that bring the animation back
  retireMinRatings: 2,                // a card's animation retires after this many good/easy ratings since its last lapse...
  retireMinDays: 2,                   // ...made on at least this many different local calendar days
  againMinutes: 10,                   // "Again": see the card again after this long
  hardFactor: 1.2, minHardDays: 1,    // "Hard": previous interval x factor, at least this many days
  ladderDays: [1, 3, 7, 14, 30, 60, 120, 240], // "Good" walks up this ladder, "Easy" skips a rung
  newPerDay: 10,                      // new cards introduced per local day
  maxSessionCards: 20,
  againRequeueGap: 3,                 // a card rated Again returns this many cards later in the same session
  historyLimit: 30,                   // ratings remembered per card
};
export const STORAGE_KEY = 'jp-app:progress';

// ---- layout (metres, in the card's own space; the card is placed ~1.2 m in front of the viewer) ----
export const LAYOUT = {
  dist: 1.2,
  desktopPos: [0, 1.4, -1.2],
  cardY: 0.05,                        // lifts the whole card so its middle sits near eye height
  glyphHeight: 0.28,                  // 3D kanji bounding box height
  y: { top: 0.50, furigana: 0.38, kanji: 0.16, meaning: -0.06, sentence: -0.22, english: -0.36, buttons: -0.52, hint: -0.52 },
  buttonW: 0.2, buttonH: 0.085, buttonGap: 0.02,
};

// ---- the study-card timeline: seconds after the animation's last stroke ----
export const TIMELINE = {
  meaningDelay: 0.9,                  // meaning fades in
  sentenceDelay: 1.9,                 // example sentence fades in
  sayDelay: 0.7,                      // sentence audio starts this long after the sentence appears
  englishPad: 0.4,                    // English appears this long after the sentence audio ends
  fallbackAudioLen: 1.1,              // used when a sentence has no audio
  ratingDelay: 0.8,                   // rating buttons appear this long after the English line
  fade: 0.6,
};

// ---- text ----
export const TEXT = { pxPerMeter: 5120, maxCanvasPx: 4096, fontFamily: 'NSJ' };

export const COLORS = {
  bg: 0x05060a, text: '#fff4de', textDim: '#c9b9a3', accent: 0xff8a3d, accentText: '#fff3e2',
  button: 0x2b2118, buttonHover: 0x4a3524, disabled: 0x171718, panel: 'rgba(10,8,14,0.62)',
  rating: { again: 0x6e2a24, hard: 0x6b4a1f, good: 0x24604a, easy: 0x2a4f7a },
};
