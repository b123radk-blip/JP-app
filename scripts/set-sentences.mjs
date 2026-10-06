// Replaces the example sentence of existing cards with the picker's current choice, e.g. after rejecting a sentence
// (scripts/data/sentence-review.json) or writing one (manual-sentences.json) and re-running scripts/pick-sentences.py.
// Usage: node scripts/set-sentences.mjs --level n5 <card id> [...]   (then npm run voice:list, review:list, npm test)
import { readFileSync, writeFileSync } from 'node:fs';
import { formatCard } from './lib/format-card.mjs';

const args = process.argv.slice(2), at = args.indexOf('--level'), LEVEL = at >= 0 ? args[at + 1] : 'n5';
const ids = args.filter((a, i) => a !== '--level' && i !== at + 1);
const picks = JSON.parse(readFileSync(`.cache/work/${LEVEL}-sentences.json`, 'utf8')).sentences, today = new Date().toISOString().slice(0, 10);
for (const id of ids) {
  const pick = picks[id];
  if (!pick) { console.error(`${id}: the picker has no sentence for it (is it in .cache/work/${LEVEL}-items.json?)`); process.exitCode = 1; continue; }
  const path = `content/cards/${id}.json`, card = JSON.parse(readFileSync(path, 'utf8'));
  card.sentences[0] = { segments: pick.segments, en: pick.en, verified: { analysers: ['SudachiPy', 'Open JTalk'], date: today, needsNativeReview: true },
    source: pick.tatoeba ? { tatoeba: pick.tatoeba } : { written: true } };
  writeFileSync(path, formatCard(card));
  console.log(`${card.word ?? card.kanji} ${id}: ${pick.segments.map((s) => s.text).join('')}`);
}
