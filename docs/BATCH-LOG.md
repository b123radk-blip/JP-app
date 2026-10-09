# Batch log

One entry per content batch: what was made, what the checks and the contact-sheet review found, what it cost. The numbers
here feed the prompt for the next step (docs/prompts/). Newest first.

## Step 3a: things held against the palm, 2026-10-09
- **User's headset look at the gestures:** the motions look good, but a held cup sat inside the fist. The fist has no
  fingers, so a held thing must rest where the palm would be. Also: use the static Everything Library animals only when
  nothing animated fits.
- **Kit:** measured the fist (a flat paddle 0.074 h thick, its middle 0.05 h past the wrist bone, the palm facing the
  bone's -x / +x). New `grip(side, middle, toward, r, k)` (IK so the palm touches the thing, then the forearm and wrist
  twist so the palm faces it), `hold(prop, side, space, r)`, `twist`, `palm`, `fistMid`; `carry` kept for old scenes.
- **Scenes:** 飲む: the hand holds the glass from its side (the glass pivots on its middle and tips at the mouth). 食べる:
  the bowl sits on the upturned left palm; the chopsticks start at the palm's edge. ペット: restaged: she scoops the cat
  onto her palm, holds it at her chest and strokes its head with her palm down (crouching hid the hand under her head).

## Step 3a: food and the missing animals arrive, 2026-10-09
- **From the user:** the Sushi Restaurant Kit's `Food/glTF` folder (Quaternius, CC0) and "Everything Library: Animals" by
  David O'Reilly (one .fbx of 239 static animals, **CC BY 4.0**: credited in the page footer, README and
  `assets/models/everything/License.txt`).
- **Added:** 36 foods in `assets/models/quaternius/food/` (onigiri, ramen, udon, gyoza, dango, chukaman, nigiri and rolls,
  fish, rice, nori ...; one textured part each, 1.2 MB in all) and 17 animals in `assets/models/everything/animals/`
  (cat, chicken, pigeon and a flying pigeon, a flying swallow, crow and a flying crow, duck, mouse, rabbit, elephant
  `grayElephant`, panda, monkey, bear, lion, giraffe, penguin; 1.4 MB). New `scripts/split-library.mjs` takes single
  models out of a library .glb (after `fbx-to-glb.mjs`). 112 models in model-list.js.
- **The Everything Library animals** are realistic low-poly, coloured per vertex, with no clips and no rig. The FBX left
  placeholder base colours (red); split-library sets them white, and `models.js` makes a vertex-coloured model glow in its
  own colours (the usual emissive glow washed them white; Quaternius deer, pig, sheep and llama are vertex-coloured too, unused so far).
- **Checks:** npm test ok; cost check 0 mismatches (523 recipes). They move by hand: a walking bob, squash and stretch, turns,
  and wings that flap through a vertex bend (`flap()` in `vignettes/q-animals.js`).
- **Scenes (trial, `content/trials/animals.json`, `?preview=1&trial=animals`):** 猫 `q-cat` (pads in, stretches, ニャー,
  rubs against the kanji), 鳥 `q-bird` (a pigeon flies in flapping, lands on a branch growing out of the kanji, pecks,
  ポッポー, flies off), ペット `q-pet` (a person crouches and strokes a cat with the gesture kit), 卵 `q-egg` (a hen hops
  off her nest: an egg, "!", コケコッコー). These four cards had no scene before. Not in the deck until the user has seen
  the style next to the Quaternius animals in the headset.

## Step 3a part 1: the gesture kit and the gesture test, 2026-10-09
- **Kit:** `src/effects/vignettes/model-kit.js`. `actor(name, h)` is a Quaternius person (skin tint built in) with
  two-bone IK for the arms in world space (`handTo(side, point, k)`: the fist reaches any point, the elbow bends out and
  down), `turn(bone, ax, ay, az)` about the actor's own axes, landmarks that follow the head (`at('mouth' | 'eyes' |
  'earR' | 'earL' | 'over' | 'chest' | 'front' | 'lap')`), `local(x, y, z)` in heights, and `carry(prop, side, space)`
  (a prop rides in the fist). Gestures, each with a 0..1 amount over any clip: `toMouth sip toEar cupEar shadeEyes wave
  hold bow nod shake point write`. Sheet: docs/screenshots/models-gesture-kit.jpg (the `q-gesture` review scene).
- **Gesture test (go):** 食べる `q-eat` (holds a rice bowl up and eats with chopsticks, three bites, もぐもぐ, the rice
  goes down, a happy nod), 飲む `q-drink` (lifts a glass of milk, tips it back with the head, ごくごく as the milk drops,
  ぷはー), 会う `q-meet` (one walks in from the right, the other up out of the distance, both see each other "!", wave,
  bow お辞儀 with こんにちは, walk back). Recipes in `content/trials/gestures.json` (`?preview=1&trial=gestures`, Old /
  New). Strips: docs/screenshots/models-gestures.jpg. **Verdict:** gestures read clearly from the seat and nothing
  looked broken in the frames; IK keeps hands on target from any clip and facing. Limits: the chibi arms are short (the
  hand reaches the mouth with the arm nearly straight, so a held bowl sits just under the chin, which happens to be the
  Japanese way), fingers do not move (fists only), and big heads collide when two people bow closer than about 0.75 u.
- **Catalog:** `PERSON_DC` / `pdc()` in vignette-catalog.js cost a scene by the person a recipe picks (`who`, `other`).
- **Promoted into the deck** (`set-recipes`): 女 犬 牛 休 歩 医者 走る 座る (their Quaternius trial scenes), 車 `m-car-beep`,
  電車 `m-tram`, and 魚 `q-fish-leap` (the Kenney fish leap with a Quaternius fish, 0.3 u tall: the model is long). 三's
  chicks and 大きい's elephant keep their current scenes (no Quaternius chick or elephant).
- **Draw calls of the FBX models:** the sea creatures and farm animals came as one mesh of many parts (the orange fish: 95
  draw calls for 3 materials). `models.js` now merges a model's sibling parts that share a material when it loads
  (`mergeParts`), so they cost one draw call per material (fish 2-3, farm animals 2-3); list-models counts the same way.
- **Checks:** npm test ok (0 pairs >= 0.72); cost check 0 mismatches (519 recipes); e2e all checks passed (built = catalog for all 835 cards).

## Model library for Step 3a, 2026-10-09
- **Verdict on the trials (user, headset):** Quaternius for people and animals, Kenney for vehicles (objects and places
  may be Kenney too), shapes and the glyph for the abstract. Next step: docs/prompts/step-3a-models.md.
- **Added** (all CC0, slimmed with `scripts/prep-model.mjs`, every clip kept except weapon ones): 7 Quaternius animals
  (shiba cow horse fox deer wolf husky), 4 farm animals and 6 sea creatures converted from FBX (new
  `scripts/fbx-to-glb.mjs`: three's FBXLoader + GLTFExporter in headless Chromium), 16 people on one rig, 15 sushi-kit
  decorations. 59 models in `src/effects/model-list.js` (moved out of models.js), 15 MB of Quaternius files in all;
  docs/MODELS.md lists clips, lengths and draw calls (`node scripts/list-models.mjs --write`).
- **Notes:** FBX exports name clips `Armature|Idle`; prep-model strips that. The farm animals have only Idle and Jump;
  the sea creatures only Swim. Still missing: a cat, a bird, children, Quaternius food (the sushi kit's Food folder).
- **Checks:** npm test ok; cost check 0 mismatches on the model scenes; e2e all checks passed. Run e2e on its own: while
  other headless browsers ran at the same time, "day 1 shows the first 10 cards in order" failed once (timing).

## 3D model trial 2: Quaternius models on 8 cards, 2026-10-08
- **What:** CC0 models from Quaternius's Ultimate Animated Animal Pack and Ultimate Animated Character Pack (the user
  downloaded the glTF folders: Google Drive refuses downloads from this cloud server, itch.io and poly.pizza are not
  reachable). Six models slimmed with `scripts/prep-model.mjs` (only the clips a scene uses, quantized, binary .glb:
  2-3 MB -> 0.7-1 MB each, 4.8 MB in all) into `assets/models/quaternius/` (License.txt names the packs).
- **Cards:** 犬 `q-dog-fetch` (Shiba Inu), 牛 `q-cow`, 休 `q-rest-tree`, 歩 `q-walker`, 女 `q-kimono`, 医者 `q-doctor`
  (patient slumped under a cloud, doctor brings a red-cross kit, patient cheers), 走る `q-run` (laps a little track),
  座る `q-sit` (sits on a chair). Recipes in `content/trials/quaternius.json`; `?preview=1&trial=quaternius`, Old / New.
  Sheets: docs/screenshots/quaternius-trial-1.jpg (犬 休 歩: current / Kenney / Quaternius) and -2.jpg (current / new).
- **Lessons:** the people come with near-black skin and white eye shapes (the pack's style); tinted to skin with dark eyes
  (`tint: { Skin, Face }`) so they read on dark skies. Their SitDown pose is a seated pose with the hips at 0.18 of the
  body height: give them a seat at about 0.13 (a log, a low chair) or they sit on air. three.js renames bones without dots
  (`Foot.L` -> `FootL`). Draw calls = material parts (Shiba 6, cow 7, people 5-6).
- **Checks:** npm test ok, cost check 0 mismatches on the `m-*` / `q-*` scenes, e2e all checks passed.

## 3D model trial: Kenney packs on 8 Step 1 cards, 2026-10-08
- **What:** glTF models from Kenney's CC0 packs (cube pets, mini characters, nature, car, train kits), copied into
  `assets/models/kenney/<pack>/` with each pack's License.txt (1.5 MB: only the 11 models used). Loader:
  `src/effects/models.js` (vendored `GLTFLoader` + `SkeletonUtils` in `vendor/three/addons/`, no CDN); a scene lists its
  models in the catalog (`VM(dc, desc, models)`), the app loads them before it builds the card, a scene clones them
  synchronously and poses them from their own clips (`pose('walk', t)`: idle walk run sit dance eat gesture-positive ...).
- **Cards:** 犬 `m-dog-fetch`, 三 `m-three-chicks`, 休 `m-rest-tree`, 車 `m-car-beep`, 電車 `m-tram`, 魚 `m-fish-leap`,
  歩 `m-walker`, 大きい `m-elephant`; same stories as their current scenes. Recipes in `content/trials/kenney.json`
  (the deck is unchanged). View: `?preview=1&trial=kenney`, Old / New button. Sheets (old row above new):
  docs/screenshots/kenney-trial-1.jpg, -2.jpg.
- **Lessons:** the mixer only writes values that changed, so `pose()` first puts back what it wrote last frame and the
  rest pose of what the clip does not drive (otherwise a scene's tweak, such as a nodding head, piles up frame after
  frame). Floors are seen almost edge-on from the seat: tilt roads and ponds toward the viewer, make footprints face
  you. A model walking straight right shows its back from the seat; turn it 0.5-0.75 rad toward the viewer. Draw calls
  = mesh parts (cube pet 3-6, character 2, car 5); the cost check covers them (`check-piece-costs.mjs vignette`).
- **Checks:** npm test ok (0 pairs >= 0.72), cost check 0 mismatches on the `m-*` scenes, e2e all checks passed.

## Step 2c revamp: a scene for every Step 1 card, 2026-10-08

**Made:** 222 cards changed (only `effect`, plus `mnemonic` on 八 二 一 三 四 七 下 年 月 出 国 and the `review` mark from
`set-recipes.mjs`): all 112 Step 1 kanji and their 110 words (二人 上手 下手 were done in the Step 2b pilot). Triage grades
(docs/REVAMP.md, "Step 1 revamp"): kanji A 0, B 6 (日 火 川 雨 歩 時: the right ingredient was there but static), C 106;
words A 0, B 0, C 110. All six B cards got scenes too (川 keeps its river prop underneath; 歩's footprints now come from its walker).

**Built:**
- 119 new scene types in 16 theme modules (`src/effects/vignettes/step1-a.js` ... `step1-o.js`, `step1-time.js`, with the
  word variants split into `step1-*v.js`; about 4,600 lines), 69 of them with variants. Scenes cost 1-10 draw calls.
- `step1-kit.js`, the pieces the families share: `weekStrip` / `withWeek` (an element scene played smaller with the strip
  月火水木金土日 lighting its day: 月 火 水 木 金 土 日曜日), `countScene` and `countTag` (the 〜つ words: the number's thing
  dropping into place under a counting badge), `monthGrid` / `dayScene` (the 〜日 words: a month whose days light up to
  the date, a red ring, the number's thing hopping on), and `seeded`.
- `step1-time.js`: one picture for this / next / last / every over a row of unit tiles (years 2025-2027, months 9月-11月,
  weeks 月〜日, days as suns, now as clocks): `this-unit` (spotlight and frame on the middle tile), `next-unit` (an arrow,
  the frame steps right), `last-unit` (the left tile faded like an old photo, the frame steps back), `every-unit` (a stamp
  ticks every tile; the kanji 毎 is a teapot filling every cup). 今日 今年 今月 今週 来年 来月 来週 先月 先週 毎日 毎年 毎週
  毎月 are its variants, so the grid reads as one system.
- Numbers each count their own thing and act differently: 一 one candle, 二 two birds on the strokes as wires, 三 three
  ducks, 四 a clover's four leaves, 五 a hand's fingers, 六 a die, 七 a rainbow's stripes, 八 an octopus's arms, 九 a
  noughts-and-crosses grid, 十 a bowling strike, 百 a centipede with a counter, 千 a thousand paper cranes, 万 a counter
  rolling to 10000 with fireworks. 一日 is two variants (ついたち: a new month's page; いちにち: one sun's arc).
- The glyph acts in 川 (rippling strokes), 口 (opens as a mouth), 人 (walks on its legs), 子 (a kid hopping), 目 (an eye
  that looks and blinks), 雨 (its dots fall as rain), 分 (its 刀 chops its 八 apart), 大 (swells over a mouse), 田 (the grid
  floods and grows rice), 明 (the 日 half glows gold, the 月 half silver), 木 / 林 (crowns grow on the trunks).
- Unit tests now pin the old Step 1 recipes they exercise (the cards carry scenes now).

**People:** 50 of the 225 Step 1 scenes have a person (20 kanji, 30 words; 22%), 12 more use a hand only. The rest are
nature and weather (sunrise, moon phases, fire catching, rain, snow, a mountain rising, rivers, rainbows), animals (dog,
fish, octopus, owl, bunny, centipede, penguin, hen and chicks), objects and machines (car, trains, compass, coins, clocks,
dice, traffic lights) and the glyph itself.

**Process:** a pilot of 11 cards with no person (三 三つ 三日 月 月曜日 川 上 上げる 犬 車 口), then four batches. Each scene
was written, rendered as a trial strip (`look.mjs --recipes`, 4 frames), fixed and applied. About half the scenes needed
one fix round, again almost always framing:
- too small: the default `u` is a kanji card's glyph height, and small props (shoes, a coin stack, a piggy bank) needed
  1.3-1.7x; scenes that build from `u` take a local `u = 1.4 * stage.u` rather than a recipe `size`;
- overlapping the kanji (a car, a boat race, a person by a gate): start the actors 0.35-0.5 glyph heights right;
- flat things edge-on again (coins, a lane, water, a road): tilt them 0.3-0.55 rad, or turn instanced coins on x;
- a dark disc meant to cover the moon read as a black ball: the moon is now a canvas-painted phase disc;
- a label plane with an opaque background hid the weekday strip's highlight; and the font subset has no "➜" (use →);
- the look strips crop the right edge of word cards (`--clip 90,60,660,300` shows what the app shows).

**Checks:** `npm test` passes: 0 deck pairs at or above 0.72, every look-alike pair under 0.5 (56 look-alike pairs touch a
Step 1 kanji, all now 0.00: every Step 1 kanji has its own scene type). `npm run e2e` passes after every batch (built
cost equals the estimate for all 835 cards); `node scripts/check-piece-costs.mjs`: 0 mismatches. Frame strips:
`docs/screenshots/revamp-s1-*.jpg` (pilot, b1-b4 kanji and words); contact sheet of all 222 changed cards:
`docs/screenshots/revamp-s1-contact/`.

**Weakest scenes (check these first in the headset):** 左 (two hands, the left one makes an L: relies on the English
letter), 私 (a kid pointing at their chest, わたし!), 先 (a boat pulling ahead), 前 (a hen in front of her chicks), 気
(a battery filling over a person), 間 (a book sliding into a gap), 足 (two bare feet: the shape is rough), 時々 (a bird
popping out of a clock now and then), 多分 (a shrug and an umbrella), 曜 (a wheel of day symbols).

**Carry into N4:** plan families first (numbers, counters, days, time words), give each kanji its own scene type and
the words variants of it; build the shared parts (strips, grids, counters) once in a kit module; size props 1.3-1.7x a
kanji's glyph; keep at most about half the scenes with a person, using animals, weather, machines and the glyph itself.

## Step 2b revamp: a scene for every Step 2 card, 2026-10-07

**Made:** 323 cards changed (only `effect`, plus the `review` mark from `set-recipes.mjs`): 147 of the 150 Step 2 kanji,
173 of their 177 words, and the pilot 上手 下手 二人. Kept as they were: 朝 色 開 (graded A: the glyph already acts the
meaning out) and 今朝 毎朝 毎晩 今晩 (their meaning is their kanji's scene). Triage grades (docs/REVAMP.md): kanji A 3, B 4,
C 143; words A 0, B 17, C 160. The four B kanji (消 閉 渡 立) got scenes too, and so did 13 of the 17 B words.

**Built:**
- The `vignette` recipe slot: catalog entry with declared draw calls (a number or a function of the options), similarity by
  scene (same type 1, another variant 0.7, different 0), cost estimate, `look.mjs --recipes` trials.
- `vignettes/timeline.js` (acts, beats with exact 0 / 1 ends, bump, wobble) so every frame is a pure function of t.
- The props kit (`src/effects/pieces/kit-*.js`): bone rigs drawn as 2 instanced meshes (a person: walk, lean, raise, face,
  attach props to bones, recolour bones; a hand with poses), `solidProp` (static props, 1 draw call), `many()` (instanced
  small shapes with per-instance colours), text planes and live text (counters, clocks).
- 233 scene types in 50 modules (`src/effects/vignettes/`, about 300 lines each), 80 of them with variants chosen by an
  option (`outcome`, `time`, `letters` ...): a word reuses its kanji's scene with another outcome (歌 sings on stage, 歌う in
  the shower; 牛 moos, 牛乳 pours milk, 牛肉 sizzles) and scores 0.7 against it.
- Scenes cost 1-13 draw calls (the classroom of 授業 is the largest); every card is far inside the 160 dc budget.

**Process:** six batches (25 kanji + the words they unlock). Each scene was written, rendered as a trial strip
(`look.mjs --recipes`, 4 frames), fixed, and applied with `set-recipes.mjs`. About a third of the scenes needed one fix round,
almost always framing, not the idea:
- too small (props sized for a kanji card look tiny next to a 3-glyph word): the `size` option, 1.2-1.5 on words;
- overlapping the word or the label (start the action about 0.3-0.6 glyph heights right of the kanji);
- flat things seen edge-on vanish (a pool, a crossroads, a map lying down): tilt them 0.45-0.55 rad toward the viewer;
- walking into depth barely reads: fake it on a flat picture (a road narrowing to the horizon, the walker shrinking);
- dark actors on dark skies (a silhouette needs a lit doorway or window behind it); ink / metal kanji on dark skies
  (the recipe check catches these);
- emblems facing the camera can read as something else (the camera emblem looked like an eye; replaced by a boxy camera).

**Checks:** `npm test` passes (62 unit tests, content check, recipe check): 0 deck pairs at or above 0.72, every look-alike
pair under 0.5. `npm run e2e` passes after every batch: built draw calls / particle slots / lights equal the catalog
estimate for all 835 cards. `node scripts/check-piece-costs.mjs vignette`: 378 recipes, 0 mismatches. Frame strips of every
changed card: `docs/screenshots/revamp-*.jpg` (pilot, b1-b6 kanji and words).

**Weakest scenes (abstract meanings; check these first in the headset):** 用 (an errand: a note, a run, milk), 要 (a phone
that needs charging), 有 (a coin kept in the hand), 丈 (a post that does not budge), 両 (two buckets), 台 (a stand), 題 (a
title band on a notebook), 辞 (letter tiles flying out of a book), 真 (a real gem sparkles, a fake one cracks).

**Carry into Step 1's 112 kanji** (same prompt, `docs/prompts/step-2b-revamp.md`): reuse the kit and the module pattern;
many Step 1 meanings already have a matching scene type to vary (日 / 月 / 火 / 水 ... need their own). Look at the strips
at the moments the beats happen (`--times` after the strokes finish), and size scenes for the longest word that will
reuse them.

**Carry into N4:** design each kanji as a scene line first (REVAMP style), build in theme modules, give words variants of
their kanji's scene, render trials before applying. Budget a framing-fix round for about a third of the scenes.

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
