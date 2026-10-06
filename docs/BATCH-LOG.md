# Batch log

One entry per content batch: what was made, what the checks and the contact-sheet review found, what it cost. The numbers
here feed the prompt for the next step (docs/prompts/). Newest first.

## N5 part 2 (Step 2), 2026-10-06

**Made:** 610 cards on top of Step 1's 225, so the N5 deck has 835 cards (262 kanji, 573 words):
- 150 kanji, chosen greedily by how many words they complete (N5 words weight 1, N4 0.3, N3 0.1; `scripts/lib/order.mjs`,
  saved in `scripts/data/kanji-plan.json`): 物 切 朝 着 色 茶 晩 事 家 動 自 洗 昨 夜 兄 赤 当 近 始 温 ...
- 460 words: 154 written with taught kanji only, 167 with a kanji outside the plan (drawn plain with furigana), 139 kana-only.
- Left out, 5: 昨夜 (ゆうべ) and 開く (あく): both analysers read the other reading (さくや, ひらく) in every candidate, so
  they wait for a native check; 明後日 (both read みょうごにち); 伯父 (the list's reading おじさん belongs to 伯父さん);
  一月 (ひとつき, "one month": the analysers read いちがつ, as in Step 1).

**Pieces built first** (about 60, all costed and checked by `scripts/check-piece-costs.mjs`): per-stroke offsets in the
glyph shaders (strokes can move without new meshes), reveals `grow` `stamp` `brush` `assemble` and `draw` + `erase`,
stroke motions `split` `jiggle`, glyph motions `fly sink roll stand bow hang turn flip shove vanish slide`, particles
`footprints` `wind` `kana`, the `rainbow` material, ~60 emblems (stop sign with 止まれ, umbrella, gears, camera, pin,
signpost, globe, scale, thermometer, bird, cow, snail, stairs, puzzle ...), room kinds (classroom, kitchen, shop,
station), `bridge`, a gate that closes, a tree on one glyph of a word. Step 1 cards got what their review asked for:
footprints (後 先 足 歩 千), grow (生 花 土), split (八 半 分), a flag (国), kana (語), room kinds (学 食 買 先生).

**Kanji designed by hand.** Every recipe, mnemonic and the KANJIDIC meanings to show were written per kanji in
`scripts/data/kanji-designs.json`, asking "what on screen *is* the meaning?" (the drafter checks meanings and readings against
KANJIDIC2 / JMdict; it caught 8 meanings and 1 reading I had paraphrased). Where the obvious object was taken, the kanji's own parts or a
motion carry it: 閉 the gate slides shut, 立 lies back and springs up, 返 flips over, 消 rubs itself out, 無 shrinks to
nothing, 合 flies together, 切 / 両 split apart, 降 sinks with rain and stairs, 止 a Japanese stop sign (止まれ).
13 kanji have neither emblem nor scene and read through motion / reveal / particles (動 消 楽 風 文 字 御 無 点 立 筆 悪 太).

**Contact-sheet review** (one idle frame per card, plus frame strips for the motion cards):
- Kanji: **18 of 150 changed (12 %)**, under the 20 % target (Step 1: 32 %). Most fixes were contrast or a weak cue,
  not a missing piece: clay / jade / gold on a field or sunrise (地 場 広 黄), dark parts on a storm (嫌 悪), a cue that
  read as something else (映's film reel as a second moon, 全's whole pie as an orange sun, 自's mirror as a magnifier),
  nothing saying the meaning (晩 → lanterns, 初 → one big bead, 仕 → a cup served with a bow), the emblem matching the
  N5 word instead of the card's meaning (丈 shield → ruler), a split too small to see (切).
- Words: **10 of 460 changed (2 %)**, all looked at in 19 sheets. The word rules mostly reuse the kanji's own look, so
  fewer cues go wrong: a sky that fought the emblem (映画 映画館 レコード テープ: the reel next to the moon → indoor / dusk),
  公園's tree moved onto 園 (garden), 冬 on a twilight sky, 全部 five dots, テレビ a bigger frame, 零 / ゼロ now show
  "nothing" (no emblem, the word vanishes). Three piece fixes came out of the word sheets: big tree crowns
  sat over the strokes (now behind them), the kana particles covered short words (now they come in from both sides),
  and the film reel was a grey disc at card size (now light with dark holes and a strip of film, 3 draw calls).
- Meanings: 14 kanji show other KANJIDIC meanings than the first two ("morning", not "morning; dynasty"); 早い shows its
  entry's second sense ("early; soon": 早い and 速い share one JMdict entry); 差す shows "to hold up (an umbrella, etc.)",
  the sense its sentences use, not JMdict's first ("to shine").

**Sentences:** 610 / 610 have one: 556 from Tatoeba, 54 written. All pass `verify-sentences.py`; all keep
`needsNativeReview`. Every pick was read: **104 Tatoeba sentences rejected** with a reason (proverbs, insults, slang,
the wrong sense: 角 read つの "horn", かぶる matched かぶれる, 遊ぶ for an idle machine; grammar words mistaken for the
card's word: 〜そうだ for そう, どっちでも for でも, これじゃ for じゃ, まず for まずい).
Fixed in the tools, so later batches do not repeat them:
- Kana words were matched to the wrong JMdict homonym (はい "lung", あれ "I", じゃ "snake", どう "copper", その "garden"):
  the JLPT list's meaning now picks the entry (`scripts/data/match.mjs`), with a unit test. N3 has a few the list itself
  words oddly (ちょうだい, ロケット); check them in the N3 step.
- The display form could swap in another spelling of the entry (跳ぶ for the list's 飛ぶ, so the card said "to fly"):
  the list's own spelling now wins when JMdict has it with priority.
- A sentence could use another spelling of the same entry (速い for 早い, 夕べ for 昨夜, 空いて for 開く, ご飯 for 御飯):
  every kanji of the card's word must now appear in it.
- Kana-only words found no candidates (Tatoeba's index files them under kanji lemmas: 珈琲 for コーヒー): they are now
  matched by what is written, a conjugated one only when the lemma agrees (まず is not まずい).
- Readings with "(する)" (勉強 べんきょう (する)) broke the furigana; stripped. Conjugated words keep the dictionary
  furigana of their stem when Sudachi misreads it (辛くて: Open JTalk からくて, Sudachi つらくて).

**Similarity check changed.** Slots that neither card uses (no particles, no scene, no emblem, no parts) no longer count
as a match. With 460 words, any two sparse cards sharing one sky scored 0.72 (543 pairs), whatever their emblems and
glyphs. Identical recipes still score 1; same material + sky + emblem is still flagged. On the Step 1 deck the one pair
(三日 ~ 五日) drops under the line and all 26 look-alike kanji pairs still pass. The drafter also varies drafts more
gently (an idle motion, the emblem's colour, a light particle layer, and the sky last; never the sky of a design marked
`keepSky`), in two passes. Result: **0 pairs at or above 0.72**, no look-alike pair at or above 0.5.

**Checks:** `npm test` (58 unit tests, content check, recipe check) and `npm run e2e` pass; e2e builds every one of the
835 cards and its cost equals the catalog estimate; it also opens a word with a plain kanji (荷物), a katakana word
(パーティー) and a hiragana word (なる).

**Piece use in the new cards:** 98 different emblems; most used hand 27, person 23, arrow 16, book 16, shirt 15,
question 14. Scenes: room 41, road 22, gate 11. Motions: float 61, drift 50.

**Still wanted:** a toothbrush / smile for 歯, a map (図 and 所 share the pin), a projector beam for 映, a tray for 仕,
a station backdrop for 駅 and electric arcs for 電 (from Step 1). Arrows toward / away read only in motion.

## N5 part 1 (Step 1), 2026-10-06

**Made:** 210 cards (97 kanji + 113 words) on top of the 15 pilot kanji, so the N5 deck has 225 cards (112 kanji, 113 words).
Order: each kanji, then the words it unlocks, most useful first (`scripts/curriculum.mjs`). One word was left out:
一月 (w1162130). It has two readings (いちがつ "January", ひとつき "one month"), and no sentence passed for the reading the
entry is about.

**N5 vocabulary coverage** (the Waller N5 list matched to JMdict: 695 entries):

| | words | where they go |
|---|---|---|
| written with N5 kanji only, 2+ characters | 114 | word cards in this batch (113 made) |
| written with one N5 kanji (山 やま, 人 ひと) | 54 | taught by that kanji's card (its reading and sentence) |
| need a kanji outside the N5 set (青い, 朝, 家, 物 ...) | 354 | arrive with the N4 kanji that unlock them (330 such kanji; 物 色 茶 朝 切 飯 晩 most often) |
| kana only (これ, とても, ください ...) | 146 | later: a kana word card design (nothing to draw stroke by stroke) |
| affixes / counters (〜円, 〜時) | 27 | inside the words that use them |

**Sentences:** 210 / 210 cards have one. 181 come from Tatoeba (CC BY 2.0 FR). 29 were written for this batch
(`scripts/data/manual-sentences.json`): mostly counters and dates, which Tatoeba writes with digits, and replacements where
every Tatoeba candidate was weak. 52 Tatoeba sentences were rejected, each with a reason
(`scripts/data/sentence-review.json`): the English does not match, idioms and proverbs, stereotypes or upsetting content,
vocabulary far above N5, a typo in the source, dropped particles, archaic phrasing.

17 of those rejections came from reading all 210 picks after the contact sheets, so **expect to read every pick**: the two
analysers check readings, not whether a sentence teaches the word well. Two lessons:
- **Homographs pass the analysers.** The 入れる card (いれる, "put in") had 中には入れなかったよ. Its English shows the
  sentence means はいれなかった ("could not get in", the potential of 入る), yet both analysers read いれ. Words with a
  same-spelling twin (入れる, 開く, 行った ...) need their English read against the card's meaning.
- **Both analysers misread 何曜日** (ナンヨウヒ / ナニヨウビ). The check rejected it, so the written sentence became
  今日は何日ですか.

All 225 deck sentences pass `scripts/verify-sentences.py`, which means SudachiPy and Open JTalk agree on every reading.
Every sentence keeps `needsNativeReview: true`.

**Recipes:** the drafter wrote all 210. Kanji recipes come from the docs/EFFECTS-PLAN.md rows, with missing pieces swapped
for the closest one that exists. Word recipes come from `scripts/lib/word-rules.mjs`. 70 drafts were varied automatically
to stay under the similarity line.

Every card was then checked on the contact sheets (docs/screenshots/preview-sheet-1..7.jpg, one tile per card, 2.5 s
after the last stroke). 67 cards were hand-tuned (`review.recipe: "reviewed"`); 143 keep the draft
(`review.recipe: "draft"`):
- **The meaning was not on screen** (only material + sky), so a prop or emblem was added: 電 lightning bolt, 駅 train,
  車 car, 週 seven beads + a road, 曜 seven lanterns lighting one by one, 毎 a rising sun, 国 mountains + river with a gold
  jewel (玉) inside the border, 半 a clock (三時半), 分 the knife part (刀) chops, 女 a pink figure, 外 a house it drifts
  away from, 社 a shrine gate, 名 a speech bubble, 天 a cloud, 古 an old book, 書 a book + the brush part (聿) moving,
  百 a silver 100-yen coin, 九 a target, 先 footprints, 新 the axe part (斤) chops, 長 flowing strands, 高 stretches
  tall with lit windows, 小 two drops on water, 土 a bare field, 多 the two 夕 pop one after the other, 私 a swaying grain
  stalk + an arm. Words: 大きい / 小さい grow / shrink in front of mountains, 大きな / 小さな grow / shrink beside a house,
  高い stretches tall + a yen coin (tall, expensive), 天気 sun + rain, 電気 a blinking light bulb, 名前 a pencil
  (writing your name), 古い a clock, 今年 petals + snow (a whole year), 少ない two beads.
- **Compass needles all pointed north:** 北 東 南 西 now point N E S W.
- **Unreadable:**
  - 後 and 九 were ink on a dark sky; both are now chalk.
  - Six words with a metal kanji (入る 入れる 時間 多分 半分 五日) moved to light skies.
  - 車 and 駅 were metal on the dark road (and 車 again inside 電車); both are now silver.
- **Look-alike pairs flagged by the check:** 19 pairs started at or above 0.72; one is left (三日 ~ 五日 0.72). That
  pair is a deliberate family: day of the month = calendar + that many lanterns.

**Fixed in the tools, so later batches do not repeat these problems:**
- The distinctness resolver picked dark skies for ink and metal. It now uses light skies only, also for words that contain
  such a kanji. The recipe check fails ink or metal on a dark backdrop or on the road, and the drafter swaps in silver
  or chalk when the road is the meaning.
- The resolver replaced drafted motions (大きい lost its "grow"). It now adds an idle motion only when the draft has none.
- The room scene's catalog cost was 7 draw calls but it builds 6 (found by the e2e cost check).

**Checks:** `npm test` passes: 53 unit tests, the content check and the recipe check. In the recipe check, no deck pair is
at or above 0.9, one pair sits at 0.72, and all 26 N5 look-alike kanji pairs are under 0.5. `npm run e2e` passes: day 2
brings the first word cards, every word comes after its kanji, and built cost equals the catalog estimate for all 225 cards.
The most expensive cards are well inside the budget of 160 draw calls, 2,000 particle slots and 3 lights: 十日 uses
63 draw calls (ten lanterns), 火 uses 1,280 particle slots, and no card uses more than 2 lights.

**Piece use across the deck** (shows where the library is thin). Emblems: calendar 22, arrow 18, dots 18, hand 10,
person 10, book 9, yen 8. Scenes: road 21, room 15, lanterns 12, gate 10. 21 cards have neither a scene prop nor an
emblem. Most of them read through their particles or motion (火 flames, 雨 rain, 好 hearts, 犬 wagging); the weakest of
these are 子, 気, 白, 私 and 多.

**Pieces the drafts asked for that do not exist yet** (most wanted first):
- footprints trail: 後 先 足 道 千 行 歩
- stamp reveal: 今 五 名 円
- kana particles: 話 言 読 語
- brush reveal: 九 読 書 語
- sprout / grow reveal: 生 花 土 森
- split motion: 八 半 分
- calendar backdrop: 曜 週 毎
- assemble reveal: 好 会 友
- arrows toward / away: 来 前 後 入
- ground backdrop: 出 土
- carve reveal: 肉 新
- once each: chopsticks 二, seasons 年, map 国, dice 六, arcs 電, sundial 午, open 間, pour 飲, stack 百

The review also asked for: room variants (classroom, kitchen, shop, station; the room scene is on 15 cards), a knife
emblem, a flag or globe (国, 語), and a word-level tree (a tree behind a whole word covers the kana).

**Cost of this batch:**
- Data pipeline, curriculum and sentence picking run in minutes once the sources are cached (the picker takes 8 s).
- The 29 written sentences and the 52 rejections were the slow part of the Japanese work.
- Contact sheets take 5.5 min for 225 cards, `npm run e2e` about 3 min.
- Hand-tuning was about a third of the new cards (67 of 210), in 10 small rounds with `scripts/set-recipes.mjs`, each
  followed by the recipe check.
