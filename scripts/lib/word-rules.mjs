// What a word card shows on top of its kanji (which keep their own looks): one strong scene / emblem for the meaning.
// BY_WORD: exact words (most N5 words; add N4 / N3 words here as batches arrive). BY_MEANING: patterns on the English
// meaning for words not listed. A rule gives part of a recipe; draft-recipe.mjs fills the rest and keeps cards distinct.
// Only new cards are drafted: once a card exists its JSON is the truth (hand fixes: scripts/set-recipes.mjs).
import { BY_WORD_N5B } from './word-rules-n5b.mjs';

const N = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
const num = (w) => (w.startsWith('二十') ? 20 : N[[...w][0]] ?? null);

export const BY_WORD = {
  // weekdays: each takes the element of its first kanji
  月曜日: { emblem: 'crescent', backdrop: 'sky:night', particles: ['motes'] }, 火曜日: { particles: ['flames'], backdrop: 'halo', emblem: 'calendar' },
  水曜日: { scene: ['ripples'], backdrop: 'sky:lake', emblem: 'calendar' }, 木曜日: { scene: ['tree'], backdrop: 'sky:day', particles: ['leaves'] },
  金曜日: { particles: ['coins'], emblem: 'yen', backdrop: 'sky:golden' }, 土曜日: { scene: ['field'], backdrop: 'sky:noon', emblem: 'calendar' },
  日曜日: { backdrop: 'sunrise', emblem: 'sun' },
  // this / next / last / every + day, week, month, year
  今日: { emblem: 'calendar', backdrop: 'sky:noon', motion: 'pulse' }, 今週: { emblem: 'calendar', backdrop: 'sky:morning', motion: 'pulse' },
  今月: { emblem: 'crescent', backdrop: 'sky:twilight', motion: 'pulse' }, 今年: { emblem: 'calendar', backdrop: 'sky:golden', particles: ['leaves'] },
  来週: { emblem: 'arrow:right', motion: 'drift:right', backdrop: 'sky:morning' }, 来月: { emblem: 'arrow:right', motion: 'drift:right', backdrop: 'sky:night' },
  来年: { emblem: 'arrow:right', motion: 'drift:right', backdrop: 'sky:golden', particles: ['petals'] },
  先週: { emblem: 'arrow:left', motion: 'drift:left', backdrop: 'sky:dusk' }, 先月: { emblem: 'arrow:left', motion: 'drift:left', backdrop: 'sky:twilight' },
  毎日: { emblem: 'calendar', motion: 'count:3', backdrop: 'sky:noon' }, 毎週: { emblem: 'calendar', motion: 'count:3', backdrop: 'sky:morning', particles: ['motes'] },
  毎月: { emblem: 'crescent', motion: 'count:3', backdrop: 'sky:night' }, 毎年: { emblem: 'calendar', motion: 'count:3', backdrop: 'sky:golden', particles: ['leaves'] },
  午前: { backdrop: 'sky:dawn', emblem: 'sun', motion: 'drift:up' }, 午後: { backdrop: 'sky:golden', emblem: 'sun', motion: 'drift:down' },
  時間: { scene: ['dial'], backdrop: 'sky:dusk' }, 時々: { emblem: 'clock', motion: 'blink', backdrop: 'sky:twilight' },
  // people
  先生: { scene: ['room'], emblem: 'speech' }, 学生: { scene: ['room'], emblem: 'book' }, 大人: { emblem: 'person', motion: 'grow', backdrop: 'sky:day' },
  外国人: { emblem: 'person', scene: ['road'], backdrop: 'sky:sunset' }, お父さん: { emblem: 'person', scene: ['room'] }, お母さん: { emblem: 'heart', scene: ['room'] },
  男の子: { emblem: 'person', motion: 'bounce', backdrop: 'sky:noon' }, 女の子: { emblem: 'person', motion: 'bounce', backdrop: 'sky:dawn', particles: ['petals'] },
  一人: { emblem: 'person', backdrop: 'sky:dusk' }, 二人: { emblem: 'person', motion: 'count:2', particles: ['hearts'], backdrop: 'sky:dawn' },
  名前: { emblem: 'speech', particles: ['notes'], backdrop: 'sky:twilight' },
  // places
  学校: { scene: ['gate'], emblem: 'book', backdrop: 'sky:morning' }, 大学: { scene: ['gate'], emblem: 'lightbulb', backdrop: 'sky:golden', motion: 'grow' },
  外国: { emblem: 'compass', backdrop: 'sky:sunset', particles: ['motes'] }, 会社: { scene: ['road'], emblem: 'house', backdrop: 'sky:morning' },
  入り口: { scene: ['gate'], emblem: 'arrow:up', backdrop: 'sky:day' }, 出口: { scene: ['gate'], emblem: 'arrow:down', backdrop: 'sky:dusk' },
  // doing
  会う: { emblem: 'hand', particles: ['hearts'], backdrop: 'sky:dawn' }, 上げる: { emblem: 'arrow:up', motion: 'drift:up', backdrop: 'sky:noon' },
  歩く: { emblem: 'foot', scene: ['road'], motion: 'walk' }, 言う: { emblem: 'speech', backdrop: 'sky:indoor' }, 話す: { emblem: 'speech', particles: ['notes'], backdrop: 'sky:dusk' },
  行く: { scene: ['road'], emblem: 'arrow:up', motion: 'drift:away' }, 来る: { scene: ['road'], emblem: 'arrow:down', motion: 'drift:toward' },
  入る: { scene: ['gate'], motion: 'drift:away', backdrop: 'sky:night' }, 入れる: { emblem: 'cup', motion: 'drift:down', backdrop: 'sky:indoor' },
  出る: { scene: ['gate'], motion: 'drift:toward', backdrop: 'sky:morning' }, 出す: { emblem: 'hand', motion: 'drift:toward', backdrop: 'sky:day' },
  生まれる: { particles: ['petals'], emblem: 'heart', backdrop: 'sky:dawn', motion: 'grow' }, 買う: { emblem: 'yen', particles: ['coins'], backdrop: 'sky:day' },
  書く: { emblem: 'pen', backdrop: 'sky:noon' }, 聞く: { emblem: 'ear', particles: ['notes'], backdrop: 'sky:twilight' },
  知る: { emblem: 'lightbulb', motion: 'tilt', backdrop: 'sky:twilight' }, 分かる: { emblem: 'lightbulb', motion: 'pulse', backdrop: 'sky:dawn', particles: ['sparks'] },
  食べる: { emblem: 'bowl', particles: ['steam'], backdrop: 'sky:indoor' }, 飲む: { emblem: 'cup', particles: ['steam'], backdrop: 'sky:morning' },
  見る: { emblem: 'eye', backdrop: 'sky:day' }, 見せる: { emblem: 'eye', motion: 'drift:toward', backdrop: 'sky:noon', particles: ['sparks'] },
  読む: { emblem: 'book', particles: ['motes'], backdrop: 'sky:twilight' }, 休む: { emblem: 'zzz', backdrop: 'sky:night', motion: 'float' },
  休み: { emblem: 'sun', backdrop: 'sky:golden', particles: ['petals'] }, 下さい: { emblem: 'hand', backdrop: 'sky:dawn', motion: 'tilt' },
  // how things are
  大きい: { motion: 'grow', backdrop: 'sky:noon', particles: ['motes'] }, 大きな: { motion: 'grow:1.35', backdrop: 'sky:dawn' },
  小さい: { motion: 'shrink', backdrop: 'sky:indoor' }, 小さな: { motion: 'shrink:0.6', backdrop: 'sky:twilight', particles: ['dust'] },
  多い: { particles: ['motes'], emblem: 'stars', backdrop: 'sky:night' }, 多分: { emblem: 'question', motion: 'tilt', backdrop: 'sky:dusk' },
  少ない: { motion: 'shrink', particles: ['dust'], backdrop: 'sky:dusk' }, 少し: { motion: 'shrink:0.85', emblem: 'dots:1', backdrop: 'sky:morning' },
  新しい: { particles: ['sparks'], motion: 'pulse', backdrop: 'sky:morning' }, 古い: { particles: ['dust'], backdrop: 'sky:dusk' },
  高い: { scene: ['mountains'], motion: 'drift:up', backdrop: 'sky:noon' }, 安い: { emblem: 'yen', motion: 'shrink', backdrop: 'sky:day' },
  長い: { motion: 'stretch', scene: ['road'], backdrop: 'sky:morning' }, 白い: { particles: ['snow'], backdrop: 'sky:snow' },
  好き: { particles: ['hearts'], backdrop: 'sky:dawn' }, 大好き: { particles: ['hearts'], emblem: 'heart', motion: 'grow' },
  上手: { emblem: 'hand', particles: ['sparks'], backdrop: 'sky:noon' }, 下手: { emblem: 'hand', motion: 'shake', backdrop: 'sky:storm' },
  後ろ: { emblem: 'arrow:down', motion: 'drift:away', backdrop: 'sky:dusk' }, 半分: { emblem: 'dots:2', motion: 'pulse', backdrop: 'sky:dusk' },
  // things
  お金: { particles: ['coins'], emblem: 'yen', backdrop: 'sky:indoor' }, 電話: { emblem: 'phone', backdrop: 'sky:indoor' },
  電車: { emblem: 'train', scene: ['road'], backdrop: 'sky:morning' }, 電気: { emblem: 'bolt', particles: ['sparks'], backdrop: 'sky:storm' },
  天気: { emblem: 'cloud', backdrop: 'sky:noon', particles: ['motes'] }, 新聞: { emblem: 'book', backdrop: 'sky:morning', particles: ['dust'] },
};

// by reading where one spelling has two words (一日 いちにち "one day" / ついたち "the 1st")
export const BY_READING = { いちにち: { scene: ['dial'], emblem: 'sun', backdrop: 'sky:noon' } };

export const BY_MEANING = [
  [/day of the month|^\w+ days?$/i, (w) => ({ emblem: 'calendar', scene: num(w.word) && num(w.word) <= 10 ? [`lanterns:${num(w.word)}`] : [], backdrop: 'sky:indoor' })],
  [/^(one|two|three|four|five|six|seven|eight|nine|ten)( things| objects)?\b/i, (w) => ({ emblem: num(w.word) && num(w.word) <= 9 ? `dots:${num(w.word)}` : 'dots:3', particles: ['motes'] })],
  [/\bperson|people\b/i, () => ({ emblem: 'person' })],
  [/\beat|food|meal\b/i, () => ({ emblem: 'bowl', particles: ['steam'] })],
  [/\bdrink\b/i, () => ({ emblem: 'cup' })],
  [/\bsee|look|watch\b/i, () => ({ emblem: 'eye' })],
  [/\bhear|listen\b/i, () => ({ emblem: 'ear' })],
  [/\bsay|speak|talk|tell\b/i, () => ({ emblem: 'speech' })],
  [/\bwrite\b/i, () => ({ emblem: 'pen' })],
  [/\bread\b/i, () => ({ emblem: 'book' })],
  [/\bbuy|sell|money|yen|price\b/i, () => ({ emblem: 'yen', particles: ['coins'] })],
  [/\bwalk|go|come\b/i, () => ({ scene: ['road'] })],
  [/\blove|like\b/i, () => ({ particles: ['hearts'] })],
  [/\btime|hour|o'clock\b/i, () => ({ scene: ['dial'] })],
];

export function wordRule(w) {
  if (BY_READING[w.reading] && !BY_WORD[`${w.word}:${w.reading}`]) return { rule: `reading ${w.reading}`, recipe: BY_READING[w.reading] };
  if (BY_WORD[w.word]) return { rule: `word ${w.word}`, recipe: BY_WORD[w.word] };
  if (BY_WORD_N5B[w.word]) return { rule: `word ${w.word}`, recipe: BY_WORD_N5B[w.word] };
  for (const [re, fn] of BY_MEANING) if (re.test(w.meaning)) return { rule: `meaning ${re}`, recipe: fn(w) };
  return { rule: 'default', recipe: {} };
}
