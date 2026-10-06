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
  desktopCameraBack: 0.25,            // desktop only: camera a little further back than the headset so the whole card fits
  cardY: 0.05,                        // lifts the whole card so its middle sits near eye height
  glyphHeight: 0.26,                  // 3D kanji bounding box height
  y: { top: 0.42, furigana: 0.31, kanji: 0.13, meaning: -0.06, sentence: -0.20, english: -0.32, buttons: -0.45 },
  buttonW: 0.2, buttonH: 0.085, buttonGap: 0.02,
  mnemonic: { x: -0.46, top: 0.24, width: 0.32, size: 0.03, headSize: 0.02 },   // memory-aid story, left of the kanji
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

// ---- composable effects (src/effects/; how to write a recipe: CLAUDE.md) ----
export const EFFECTS = {
  defaultStart: 0.4,                  // first stroke starts this long after the card appears (a backdrop may ask for more: sunrise 1.6)
  // Per-card performance budget. Every piece declares its own cost (src/effects/catalog.js); `npm test` fails a recipe over budget,
  // the preview page and e2e also count what was really built. Draw calls: glow strokes cost 6 each, heat strokes 3.
  budget: { particles: 2000, drawCalls: 160, pointLights: 3 },
  emblem: { delay: 0.35, pop: 0.45, size: 0.135, at: [0.25, 0.08] },   // after the last stroke; size and default place in metres (glyph space)
  idleRamp: 1.5,                      // idle motions fade in over this many seconds after the last stroke
  // Recipe similarity (scripts/check-recipes.mjs): 0 = nothing shared, 1 = identical. Slot weights below.
  similarity: { warn: 0.72, fail: 0.9, weights: { material: 2, reveal: 1, particles: 2, scene: 2.5, backdrop: 2, motion: 1.5, emblem: 2, parts: 1.5 } },
};

// Glyph materials of the "glow" family: a recipe names one ("wood", or { "type": "glow", "preset": "wood" }) and may override fields.
// body/emissive/glow: colours; rough/metal: surface; emissiveK/glowK: strength once fully lit; breath: idle glow pulse.
export const MATERIALS = {
  cyan:   { body: 0xdaf7ff, emissive: 0x58d8ff, glow: 0x3fd0ff, rough: 0.38, metal: 0.1, emissiveK: 0.15, glowK: 1.3, breath: 0.18 },
  gold:   { body: 0xffe9b8, emissive: 0xffc060, glow: 0xffb347, rough: 0.3, metal: 0.35, emissiveK: 0.2, glowK: 1.3, breath: 0.18 },
  silver: { body: 0xe9eef8, emissive: 0x9fb8ff, glow: 0x8aa8ff, rough: 0.25, metal: 0.4, emissiveK: 0.14, glowK: 1.1, breath: 0.12 },
  jade:   { body: 0xd2f7df, emissive: 0x3fd08a, glow: 0x34c27c, rough: 0.3, metal: 0.05, emissiveK: 0.16, glowK: 1.2, breath: 0.15 },
  skin:   { body: 0xffdcc0, emissive: 0xff9a6a, glow: 0xffb08a, rough: 0.55, metal: 0.0, emissiveK: 0.12, glowK: 0.6, breath: 0.1 },
  water:  { body: 0xa8dcff, emissive: 0x2f8cff, glow: 0x3a9cff, rough: 0.08, metal: 0.1, emissiveK: 0.22, glowK: 1.2, breath: 0.2 },
  ice:    { body: 0xeefcff, emissive: 0x9be7ff, glow: 0xbfeeff, rough: 0.12, metal: 0.05, emissiveK: 0.12, glowK: 0.9, breath: 0.1 },
  wood:   { body: 0x9a6438, emissive: 0x4a2a10, glow: 0x7a5a20, rough: 0.85, metal: 0.0, emissiveK: 0.1, glowK: 0.35, breath: 0.05 },
  stone:  { body: 0x9a958e, emissive: 0x2a2620, glow: 0x6a7080, rough: 0.95, metal: 0.0, emissiveK: 0.05, glowK: 0.25, breath: 0.0 },
};

// Skies for the "sky" backdrop ("sky:night"). top/horizon: gradient (band: view heights it spans, default [-0.05, 0.75]);
// rim/fill: light colours; extras: moon, stars (count), lightning (flash timing), shafts (light beams).
export const SKIES = {
  day:    { top: 0x163f86, horizon: 0x5d8fc8, rim: 0xffffff, fill: [0xeaf4ff, 0x5a6a50], fillK: 1.0 },
  dusk:   { top: 0x141634, horizon: 0x7a3e5a, rim: 0xffb0a0, fill: [0xffe0e8, 0x403048], fillK: 0.9, band: [-0.1, 0.35] },
  night:  { top: 0x03050f, horizon: 0x101a3a, rim: 0x9fb8ff, fill: [0xb8c8ff, 0x202030], fillK: 0.8, stars: 220, moon: true },
  twilight: { top: 0x070a24, horizon: 0x4a3060, rim: 0xffd9a0, fill: [0xffeedd, 0x302840], fillK: 0.85, stars: 160, band: [-0.1, 0.4] },
  storm:  { top: 0x0d1016, horizon: 0x3a4250, rim: 0xb8d0ff, fill: [0xc8d4e8, 0x20242c], fillK: 0.8, lightning: { every: 3.4, first: 1.2 } },
  forest: { top: 0x061a10, horizon: 0x2c5428, rim: 0xfff0b0, fill: [0xe8ffd8, 0x203a20], fillK: 0.9, shafts: 5, band: [-0.1, 0.45] },
  deep:   { top: 0x02142a, horizon: 0x0a4a7a, rim: 0x7fd0ff, fill: [0xbfe8ff, 0x0a2030], fillK: 0.9, shafts: 4 },
  lake:   { top: 0x02070c, horizon: 0x0b2532, rim: 0x7fd8ff, fill: [0xcfefff, 0x0a2030], fillK: 0.9 },
  morning: { top: 0x1c2c58, horizon: 0xd99a68, rim: 0xffe0b0, fill: [0xfff0dd, 0x405048], fillK: 1.0, band: [-0.15, 0.5] },
  golden: { top: 0x261a44, horizon: 0xd88a40, rim: 0xffd090, fill: [0xffe8c8, 0x403020], fillK: 0.95, band: [-0.15, 0.45] },
};

// Components keep one look across kanji: a recipe that lists a component under "parts" gets this look unless it overrides it.
export const COMPONENT_LOOKS = {
  '日': { material: 'gold' },
  '月': { material: 'silver' },
  '木': { material: 'wood' },
  '亻': { material: 'skin' },
  '人': { material: 'skin' },
};

// ---- voice clips (audio/manifest.json; generated on your PC with VOICEVOX, see docs/VOICEVOX.md) ----
export const VOICE = { speed: { normal: 1.0, slow: 0.75 }, readingSpeed: { normal: 0.9, slow: 0.7 } };
