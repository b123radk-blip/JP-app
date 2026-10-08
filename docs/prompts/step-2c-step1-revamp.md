# Step 2c prompt: revamp Step 1 — a scene of its own for every first-deck card

Continue the Kanji Memory WebXR app in b123radk-blip/JP-app on branch `claude/kanji-3d-galaxy-xr-uoi522` (GitHub Pages
serves it; no new branch, no PR). Read CLAUDE.md (especially "Add a scene (vignette)"), docs/ARCHITECTURE.md, the Step 2b
entry in docs/BATCH-LOG.md and docs/REVAMP.md first and follow them.

## Why
Step 2b gave every Step 2 card (deck positions 226-835) a short scene that acts its meaning out. The first 225 cards,
the ones a learner meets first, are still the old look: a material, a sky and an emblem floating beside the kanji. In
the headset the app now looks unchanged for the first weeks of study. This step brings Step 1 up to the same bar.

The test for every card is the same: **would someone who has never seen this kanji (a kid, say) guess its meaning from
the scene alone?**

## Scope
- Step 1's 112 kanji (the first 225 cards of `content/decks/n5.json`): 日 火 水 山 川 木 雨 休 明 林 上 下 何 三 時 二 一
  人 今 手 四 十 年 七 話 後 大 外 国 父 母 八 私 来 月 先 曜 週 毎 六 白 車 九 男 出 口 入 電 足 女 前 道 見 生 学 駅 花 子
  犬 少 午 魚 半 分 肉 千 右 本 好 多 西 中 左 金 北 東 南 耳 小 五 新 聞 会 言 万 知 気 間 校 社 名 高 買 長 読 行 天 古
  飲 食 書 歩 安 土 円 目 田 思 百 語 森 友
- Their 110 word cards (113 minus 二人, 上手 and 下手, which the Step 2b pilot already did).
- Card ids, meanings, readings, sentences and deck order do not change. Only `effect` changes, plus `mnemonic` when the
  new scene tells a better story.

## Not everything needs a person
Step 2b leaned on people (the props-kit person is easy to pose). For Step 1, **at most about half the scenes should have
a person**; many of these kanji are nature, objects, numbers and directions, and read better without one. Reach for the
whole range of actors:
- **The glyph itself.** Move single strokes (`stage.offset`), split it, lay it down and stand it up (`poseGlyph`), un-draw
  and redraw it (`ctx.rv.progress`), style its parts. 川's three strokes ripple as flowing water, then a leaf floats down
  them. 山 heaves up out of the ground and snow settles on its peak. 木 sprouts branches and leaves, and 林 / 森 multiply
  it into a wood. 雨's dots fall out of the frame as rain and splash. 口 opens and shuts like a mouth.
- **Nature and weather.** A sunrise that pushes the night away, the moon waxing (月), fire catching and roaring (火), a
  river carving a valley, lightning arcing between clouds (電), a seed growing into a flower (花, 生).
- **Animals.** A dog wags and fetches (犬), a fish leaps out of the water (魚); any creature is fair game.
- **Objects and machines.** A car rolls by (車), a train pulls into a station (駅), coins stack and topple (金 円),
  a gate opens on a gap (間), a compass needle swings to each point (東 西 南 北).
- **Abstract ideas as physics.** Small and big (小 大) as a pebble beside a boulder; 少 / 多 as a few grains against a
  pile; 半 as a cake cut exactly in half; 中 as a ball dropping into the middle of a ring; 上 / 下 / 右 / 左 / 前 / 後
  as one object moving around another; 新 / 古 as a shiny box next to a cracked, cobwebbed one.
- **People** where the meaning is human: 休 resting against a tree, 見 / 聞 / 言 / 話 / 読 / 書 / 飲 / 食 / 買 / 歩,
  the family (父 母 男 女 子 友).

## Families that need a plan first (design them as a set)
- **Numbers** 一 … 十, 百, 千 and 万, plus their counters (一つ 二つ …) and days (一日 二日 … 二十日). Every number must be
  different at a glance: count real things (one sun, two birds, three ducks in a row, a four-leaf clover, a hand's five
  fingers ...) or build the count from the glyph's own strokes. Then make the 〜つ and 〜日 words variants of their
  number's scene, with a different option each (counted objects for 〜つ, calendar pages for 〜日). Note: 一日 has two
  cards (ついたち, "first of the month", and いちにち, "one day") and they need different variants.
- **Weekdays** 月曜日 … 日曜日 are variants of their element kanji (月 moon, 火 fire, 水 water, 木 tree, 金 gold, 土 soil,
  日 sun) with a weekday strip lighting the day. 曜 and 週 themselves need their own week-shaped scenes.
- **Time words** 今 / 来 / 先 / 毎 with 年 / 月 / 週 / 日 (今年 来年 先月 毎週 …): one way of showing "this / next /
  last / every", applied over each unit. Plan the whole grid before building any of it.
- **Look-alikes** (the recipe check fails them at >= 0.5; 61 pairs touch a Step 1 kanji). The tightest groups:
  日 目 白 田 口 中; 人 入 八; 大 犬 天 木 本 (and Step 2's 太 夫 丈); 千 午 (and 牛); 小 少; 四 西; 休 (and 体);
  間 (and 問). Their scenes must be unmistakably different, including from the Step 2 partners that already have one
  (体 body-stretch, 問 hand-question, 牛 cow-moo, 太 trunk-thick, 夫 wedding, 丈 post-kick).

## How to build it
Everything from Step 2b is in place: the vignette slot, `vignettes/timeline.js`, the props kit (`src/effects/pieces/
kit-*.js`), 233 scene types, variants, `look.mjs --recipes` trials, `set-recipes.mjs`, the cost checks.
- Write new scenes in new theme modules (`src/effects/vignettes/step1*.js`, about 300 lines each) and register them in
  `vignettes/index.js` and `vignette-catalog.js`.
- A Step 1 card may reuse a Step 2 scene type only as a clearly different variant. Prefer a new scene: two different
  types score 0 similarity, while a variant of the same type scores 0.7.
- Keep the useful old pieces underneath a scene when they help (歩's footprints, 火's flames, 語's kana).
- The old recipes that already act the meaning out can stay (grade A).

## Lessons from Step 2b (docs/BATCH-LOG.md)
About a third of the scenes needed one framing fix. Plan for these from the start:
- Size for the longest word that will reuse the scene: `size` 1.2-1.5 on 3-glyph words.
- Start the action 0.3-0.6 glyph heights right of the kanji, so it doesn't overlap the word or the meaning label.
- Tilt flat things (pools, roads, maps) 0.45-0.55 rad toward the viewer. Fake depth with a flat picture (a road that
  narrows to the horizon) rather than real z motion.
- Put dark silhouettes in front of something lit. Ink or metal kanji go only on light skies.
- Look at the frames when the beats happen (`--times` after the strokes finish), not just at the start.

## Work, in this order (each step leaves `npm test` green; commit and push after each)
1. **Triage.** Grade the 112 kanji and 110 words on frame strips (`node scripts/look.mjs ids --times 1,3,6`) as A
   (keep), B (a tweak fixes it) or C (needs a scene). Add a "Step 1" section to `docs/REVAMP.md` with one line per C
   card saying the scene, and the plans for the families above. Check the people share: at most about half.
2. **Pilot.** Eight cards of different kinds with no person in at least five of them: one number, one weekday, a nature
   kanji (川 or 山), a direction (上 or 右), an animal, an object, a glyph-as-actor scene, and one word variant. Frame
   strips, fixes, commit, push. Show the pilot strips in the reply, then carry on with the batches.
3. **Batches of about 25 kanji with their words.** Scene, mnemonic if needed, trial strips, fixes, `set-recipes.mjs`;
   tick them in `docs/REVAMP.md`, `npm test`, `npm run e2e`, strips into `docs/screenshots/revamp-s1-*.jpg`, commit, push.
4. **Review.** A contact sheet of every changed card (`OUT=docs/screenshots/revamp-s1-contact npm run preview-shots --
   <ids>`), 0 pairs >= 0.72, every look-alike pair < 0.5, `npm run e2e`, `node scripts/check-piece-costs.mjs`.
5. **Docs.** The BATCH-LOG entry (cards changed by grade, scenes and props built, the share of scenes with people,
   what carries into N4), CLAUDE.md if the workflow changed, docs/REVAMP.md "Where to continue".

## Constraints
Same as CLAUDE.md: files about 300 lines; tunables in `src/config.js`; effects deterministic for `seek()` (pure functions
of t, no state, no random); no runtime CDNs; never claim headset behaviour. Scenes must read from the learner's seat:
actors about a glyph-height tall, the action within about 1.5 glyph widths of the kanji, high contrast, nothing faster
than about 0.3 s. If the session runs short, finish fewer cards completely (built, looked at, ticked, pushed) rather than
many half-way; `docs/REVAMP.md` says where the next session starts.

## Final message
- What exists.
- Numbers: cards by grade, scenes built, cards changed, share of scenes with people, look-alike pairs.
- Four example cards with their beats, at least two without a person.
- Preview links for the user (`https://b123radk-blip.github.io/JP-app/?preview=1&card=<id>`), because these cards are
  the first ones a learner meets.
- What still needs the user: a headset look.
- Where the next session continues in `docs/REVAMP.md`.
