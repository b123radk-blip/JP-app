// Voice clip ids the app looks for in audio/manifest.json. They come from the content, so cards never name clips themselves:
// `npm run voice:list` writes the full list (audio/clips.json) and scripts/voicevox.mjs renders the files with these ids.
export const readingClipId = (card) => `${card.id}-reading`;
export const sentenceClipId = (card, i = 0) => `${card.id}-s${i + 1}`;
