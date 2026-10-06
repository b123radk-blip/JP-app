# Effects plan: N5 coverage audit

What each N5 kanji's animation could be, built from the composable pieces (CLAUDE.md "Write a recipe"), and what that
needs. The table is **machine-read**: `node scripts/check-recipes.mjs --plan --write` regenerates the two sections marked
"generated" (similar pairs, missing pieces) from it. Edit a row, re-run, and the lists follow.

**Scope.** The project's N5 set (`N5_KANJI` in `scripts/build-font.py`, 110 kanji) plus 明 and 林 from the pilot (often
listed as N4): 112 kanji. The 15 pilot cards (marked *pilot*) are built and in the deck; every other row is a draft.

**Notation.** One cell per slot, `type` or `type:variant` (`sky:storm`, `arrow:up`, `count:3`). Material presets
(`wood`, `gold` ...) are materials of the glow family. `—` = none. Parts lists components that get their shared look
(`config.js COMPONENT_LOOKS`), `木=wood` overrides it. A name that does not exist yet (`stamp`, `road`, `eye` ...) is a
*missing piece*; it shows up in the generated list with the kanji that need it.

**Mnemonics** here are ideas: loose memory stories, never claims about a character's real history. They become a card's
`mnemonic` only after review.

## Recipes

### Nature

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 日 | nature | cyan | draw | — | sunrise | sway | — | — | *pilot* The sun climbs over the hill: a bright window in the sky that starts each day. |
| 月 | nature | silver | draw | motes:still | sky:night | float | crescent | — | A crescent moon hanging in the dark; the two short lines are its craters. |
| 火 | nature | heat | ignite | flames, embers | halo | none | — | — | *pilot* A campfire: flames leap up the middle and two sparks jump out at the sides. |
| 水 | nature | water | draw:drops | bubbles | sky:deep | float | — | — | *pilot* One stream runs down the middle and splashes out to both sides. |
| 木 | nature | wood | draw | leaves | sky:day | sway | — | — | *pilot* A tree: a trunk, one branch across, and roots spreading below. |
| 金 | nature | gold | draw:sparks | coins | halo | pulse | — | — | A roof over nuggets of gold glinting in the ground. |
| 土 | nature | clay | grow | dust | ground | none | — | — | A sprout pushing up out of the flat ground: soil. |
| 山 | nature | stone | draw:dust | mist | sky:dusk | drift:up | — | — | *pilot* Three peaks side by side, the middle one the tallest. |
| 川 | nature | water | draw:drops | flow | sky:day | none | — | — | *pilot* Three streams of water running down side by side. |
| 田 | nature | jade | draw | — | field | none | — | — | A rice field seen from above, split into four paddies. |
| 天 | nature | ice | draw | motes:up | sky:day | drift:up | — | 大 | A big person (大) with the sky (一) resting on their head. |
| 気 | nature | cloud | draw | steam | sky:day | float | — | — | Steam curling up from a pot of rice: air, and your mood. |
| 雨 | nature | ice | draw | rain | sky:storm | none | — | — | *pilot* A cloud hangs from the sky and four raindrops fall beneath it. |
| 花 | nature | rose | grow | petals | sky:day | sway | — | 艹 | Grass (艹) on top, and below someone changing (化) into a flower. |
| 森 | nature | wood | grow | motes:still, mist | sky:night | none | — | 木 | Three trees (木) crowd together: a deep forest where fireflies glow at night. |
| 林 | nature | wood | draw | leaves, mist | sky:forest | none | — | 木 | *pilot* Two trees (木 木) side by side make a small wood. |
| 犬 | nature | fur | draw | — | sky:day | wag | — | 大 | A big (大) dog with one floppy ear (丶). |
| 魚 | nature | silver | draw | bubbles | sky:deep | swim | — | 灬 | A fish: head on top, scaly body (田) and a fanned tail (灬) below. |

### Time

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 年 | time | gold | draw | leaves | seasons | none | calendar | — | A farmer carries the rice harvest home once every year. |
| 時 | time | stone | draw | motes:still | sky:dusk | none | clock | 日 | *pilot* The sun (日) crosses the sky over a temple whose bell rings the hours. |
| 分 | time | metal | split | sparks | plain | split | — | 刀 | A knife (刀) cuts something in two (八): divide; also minutes. |
| 半 | time | jade | split | — | plain | split | — | — | A thing cut straight down the middle into halves. |
| 午 | time | gold | draw | motes:still | sky:noon | none | sundial | — | The post of a sundial at high noon. |
| 前 | time | cyan | draw | — | road | drift:toward | arrow:toward | 月 | A boat (月) pushed forward with oars (刂): in front, before. |
| 後 | time | ink | draw | footprints | road | drift:away | arrow:away | 彳 | Slow steps (彳 夂) trailing behind: behind, after. |
| 今 | time | cyan | stamp | — | plain | pulse | clock | 人 | A roof (人) over one single tick of the clock: now. |
| 週 | time | paper | draw | — | calendar | none | — | ⻌ | A loop (周) you walk (⻌) every seven days: a week. |
| 毎 | time | rose | draw | — | calendar | count:3 | — | 毋 | Every morning the same person in the same hat comes by: every. |
| 曜 | time | silver | draw | — | calendar | none | — | 日 | The sun (日) and a bird with wings (羽 隹) flying over the days of the week. |
| 先 | time | jade | draw | footprints | road | drift:right | arrow:right | 儿 | Legs (儿) striding out ahead of everyone: ahead, previous. |

### Position

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 上 | position | jade | draw | motes:up | sky:day | drift:up | arrow:up | — | *pilot* A line for the ground, and a stalk pointing up above it. |
| 下 | position | silver | draw | motes:down | sky:deep | drift:down | arrow:down | — | *pilot* A line for the ceiling, and a stalk hanging down below it. |
| 左 | position | jade | draw | — | plain | drift:left | hand | 工 | A hand holding a carpenter's tool (工) on the left. |
| 右 | position | rose | draw | — | plain | drift:right | hand | 口 | A hand bringing food to the mouth (口), as most people do with the right. |
| 中 | position | gold | draw | — | plain | pulse | target | 口 | A line straight through the middle of a box: inside, centre. |
| 外 | position | silver | draw | motes:still | sky:night | drift:away | — | 夕 | The evening (夕) fortune-teller (卜) sits outside. |
| 北 | position | ice | draw | snow | sky:snow | none | compass | — | Two people sitting back to back to keep warm in the cold north. |
| 南 | position | gold | draw | — | sky:noon | none | compass | — | A tent with a warm fire inside: the sunny south. |
| 東 | position | gold | draw | — | sunrise | none | compass | 木 日 | The sun (日) rising behind a tree (木): east. |
| 西 | position | rose | draw | — | sky:sunset | drift:down | compass | — | A window where the evening sun sinks: west. |
| 間 | position | metal | draw | motes:still | gate | open | — | 門 日 | The sun (日) shining through the gap in a gate (門): between. |

### Numbers

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 一 | numbers | jade | draw | motes:still | sky:dawn | count:1 | dots:1 | — | One finger laid flat: a single line on the horizon. |
| 二 | numbers | wood | draw | — | sky:day | count:2 | chopsticks | — | Two chopsticks lying one above the other. |
| 三 | numbers | gold | draw:sparks | — | halo | count:3 | dots:3 | — | *pilot* Three lines, like three fingers: count them, one, two, three. |
| 四 | numbers | paper | draw | — | room | count:4 | window | — | A window (囗) with its curtains drawn: four panes. |
| 五 | numbers | metal | stamp | sparks | plain | count:5 | hand | — | One hand, five fingers, pressed down like a stamp. |
| 六 | numbers | clay | draw | — | sky:dusk | count:6 | dice | — | A lamp with a lid on top and two legs: roll a six. |
| 七 | numbers | silver | draw | — | sky:night | count:7 | stars | — | A cross with a bent tail: the seven stars of the Big Dipper. |
| 八 | numbers | jade | split | — | sky:day | split | — | — | Two strokes leaning apart like a tent that opens eight ways. |
| 九 | numbers | ink | brush | — | plain | count:9 | — | — | An arm hooking round a corner to catch the ninth ball. |
| 十 | numbers | gold | draw | sparks | halo | spin | plus | — | A plus sign: all ten fingers crossed. |
| 百 | numbers | paper | draw | — | plain | stack | — | 白 | One (一) white (白) sheet, stacked a hundred times. |
| 千 | numbers | stone | draw | footprints | road | none | — | 十 | A thousand footsteps crossing at the crossroads (十). |
| 万 | numbers | gold | draw | coins | halo | none | yen | — | Ten thousand coins pouring into a pile. |

### Size and quality

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 大 | size | skin | draw | — | plain | grow | — | — | A person stretching arms and legs as wide as they can: big. |
| 小 | size | ice | draw | motes:still | plain | shrink | — | — | A tiny stick with two drops beside it: small. |
| 高 | size | stone | draw | mist | sky:day | drift:up | — | 口 | A tall tower with two windows (口): tall, expensive. |
| 長 | size | silver | draw | — | plain | stretch | — | — | An old person with long hair streaming down: long. |
| 安 | size | rose | draw | — | room | float | — | 宀 女 | A woman (女) safe under a roof (宀): calm; also cheap. |
| 新 | size | wood | carve | dust | plain | none | — | 立 木 斤 | Stand (立) by a tree (木) with an axe (斤): freshly cut, new. |
| 古 | size | stone | draw | dust | sky:dusk | none | — | 十 口 | Ten (十) mouths (口) have retold this story: old. |
| 多 | size | gold | draw | motes:still | plain | count:2 | — | 夕 | Evening (夕) piled on evening: many. |
| 少 | size | ice | draw | motes:down | plain | shrink | — | 小 | Small (小) with one more piece sliding away: a little, few. |
| 白 | size | pearl | draw | snow | sky:day | pulse | — | 日 | A ray of light (丿) on the sun (日): bright white. |
| 好 | size | rose | assemble | hearts | plain | none | — | 女 子 | A woman (女) with a child (子): someone you like. |
| 明 | size | cyan | draw | motes:still | sky:twilight | pulse | — | 日 月 | *pilot* Sun (日) and moon (月) side by side: twice the light, so it is bright. |

### People and body

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 人 | people | skin | draw | — | plain | walk | — | — | A person walking: two legs. |
| 男 | people | clay | draw | — | field | none | — | 田 力 | Power (力) in the rice field (田): a man. |
| 女 | people | rose | draw | — | plain | sway | — | — | A woman kneeling gracefully. |
| 子 | people | skin | draw | — | plain | bounce | — | — | A baby wrapped up, arms out: child. |
| 父 | people | wood | draw | — | room | none | — | — | Father with two crossed sticks (乂) to chop firewood. |
| 母 | people | rose | draw | — | room | pulse | heart | — | Mother's arms around two little ones. |
| 友 | people | jade | assemble | — | plain | none | — | 又 | Two hands (𠂇 又) reaching to shake: friend. |
| 生 | people | jade | grow | leaves | sky:day | none | — | — | A plant sprouting from the ground: life, to be born. |
| 学 | people | chalk | draw | — | school | none | book | 子 | A child (子) under a roof, sparks of ideas (⺍) above: study. |
| 名 | people | paper | stamp | — | sky:night | none | — | 夕 口 | In the dark evening (夕) you call out your name with your mouth (口). |
| 私 | people | gold | draw | — | plain | pulse | — | 禾 | Grain (禾) I keep for myself (厶): I, private. |
| 目 | body | cyan | draw | — | plain | blink | eye | — | An eye stood on its side. |
| 耳 | body | skin | draw | notes | plain | none | ear | — | An ear with its folds. |
| 口 | body | rose | draw | — | plain | pulse | speech | — | An open mouth: a square. |
| 手 | body | skin | draw | — | plain | wave | hand | — | A hand with the fingers spread. |
| 足 | body | skin | draw | footprints | road | walk | foot | 口 | A knee (口) above a foot: foot, leg; also enough. |

### Actions

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 行 | actions | jade | draw | footprints | road | drift:right | arrow:right | 彳 | A crossroads seen from above: go. |
| 来 | actions | gold | draw | leaves | road | drift:toward | arrow:toward | — | A rice plant (米) walking towards you: come. |
| 出 | actions | stone | draw | — | ground | drift:up | arrow:up | 山 | A sprout climbing out of a pot: go out. |
| 入 | actions | metal | draw | — | gate | drift:away | arrow:away | — | A tent flap pulled aside: go in. |
| 食 | actions | rose | draw | steam | kitchen | none | — | — | A lid over a bowl of steaming food: eat. |
| 飲 | actions | water | pour | bubbles | kitchen | none | — | 食 欠 | Someone opening wide (欠) over a drink: drink. |
| 見 | actions | cyan | draw | — | plain | none | eye | 目 | An eye (目) on legs (儿): see. |
| 聞 | actions | silver | draw | notes | gate | none | ear | 門 耳 | An ear (耳) pressed to the gate (門): listen, hear. |
| 読 | actions | paper | brush | kana | room | none | book | 言 | Words (言) you buy (売) in a shop and take home: read. |
| 書 | actions | ink | brush | — | plain | none | — | 聿 日 | A brush (聿) over a sheet (曰): write. |
| 話 | actions | rose | draw | kana | plain | none | speech | 言 舌 | Words (言) rolling off the tongue (舌): talk. |
| 買 | actions | gold | draw | coins | market | none | yen | 貝 | A net (罒) scooping up shiny shells to pay with: buy. |
| 休 | actions | wood | draw | leaves | sky:night | none | zzz | 亻 木 | *pilot* A person (亻) leans against a tree (木) to rest. |
| 言 | actions | paper | draw | kana | plain | none | speech | 口 | Lines of words coming out of a mouth (口): say. |
| 会 | actions | jade | assemble | — | room | none | — | 人 云 | People (人) under one roof, talking (云): meet. |
| 歩 | actions | clay | draw | footprints | road | walk | foot | 止 少 | Stop (止) a little (少), then step again: walk. |

### Abstract

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 何 | abstract | cyan | draw | — | plain | tilt | question | 亻 | *pilot* A person (亻) points at a strange box and asks: what's that? |
| 思 | abstract | rose | draw | — | plain | pulse | heart | 田 心 | A field (田) on top of a heart (心): think, feel. |
| 知 | abstract | gold | draw | — | plain | none | lightbulb | 矢 口 | The answer flies from the mouth (口) like an arrow (矢): know. |
| 語 | abstract | paper | brush | kana | plain | none | speech | 言 吾 | Words (言) of my (吾) people: language. |
| 本 | abstract | paper | draw | — | plain | none | book | 木 | A tree (木) with a mark at its root: origin; also book. |

### Things and places

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 円 | things | gold | stamp | coins | plain | spin | yen | — | A coin drawn as a box: yen, round. |
| 国 | things | jade | draw | — | map | none | — | 囗 玉 | A jewel (玉) inside the border (囗): country. |
| 車 | things | metal | draw | dust | road | drift:right | — | — | A cart from above: two wheels on an axle. |
| 駅 | things | metal | draw | — | station | none | — | 馬 尺 | A stop where the horses (馬) rest: station. |
| 道 | things | stone | draw | footprints | road | none | — | 首 ⻌ | A head (首) leading the way along the road (⻌). |
| 電 | things | neon | draw:sparks | arcs | sky:storm | shake | — | 雨 | Rain (雨) and a bolt striking the field: electricity. |
| 社 | things | lacquer | draw | petals | sky:day | none | — | 礻 土 | An altar (礻) on the ground (土): shrine, company. |
| 校 | things | wood | draw | — | school | none | — | 木 交 | Wooden (木) buildings where children mix (交): school. |
| 肉 | things | rose | carve | steam | market | none | — | — | A slab of meat with its marbling, cut at the butcher's. |

## Too alike

<!-- generated:similar -->
17 pairs at or above 0.72 (bold: at or above 0.9, which `npm test` would reject in a deck):

- 先 ~ 行 0.88 (same: material, reveal, particles, backdrop, motion, emblem)
- 千 ~ 道 0.88 (same: material, reveal, particles, backdrop, motion, emblem)
- 大 ~ 人 0.88 (same: material, reveal, particles, backdrop, emblem, parts)
- 大 ~ 子 0.88 (same: material, reveal, particles, backdrop, emblem, parts)
- 人 ~ 子 0.88 (same: material, reveal, particles, backdrop, emblem, parts)
- 半 ~ 八 0.83 (same: material, reveal, particles, motion, emblem, parts)
- 言 ~ 語 0.79 (same: material, particles, backdrop, motion, emblem)
- 大 ~ 長 0.78 (same: reveal, particles, backdrop, emblem, parts)
- 小 ~ 少 0.78 (same: material, reveal, backdrop, motion, emblem)
- 長 ~ 人 0.78 (same: reveal, particles, backdrop, emblem, parts)
- 長 ~ 子 0.78 (same: reveal, particles, backdrop, emblem, parts)
- 九 ~ 書 0.75 (same: material, reveal, particles, backdrop, emblem)
- 目 ~ 見 0.75 (same: material, reveal, particles, backdrop, emblem)
- 食 ~ 肉 0.75 (same: material, particles, motion, emblem, parts)
- 山 ~ 高 0.73 (same: material, particles, motion, emblem)
- 田 ~ 父 0.73 (same: reveal, particles, motion, emblem, parts)
- 森 ~ 林 0.73 (same: material, motion, emblem, parts)
<!-- /generated:similar -->

What to do about the groups the check and a read-through flag:

- **Numbers** are the hardest group: they share `count` motion and counting emblems by design, and their shapes give few
  literal images. Each needs its own object world (chopsticks, window, dice, stars ...) and its own backdrop and colour, not
  just a different count. Recommendation: build `count` + `dots` once (done), then give each number a distinct emblem.
- **Mirror pairs** 上/下, 左/右, 前/後, 出/入, 大/小, 多/少: the pair *should* share a family look (that helps) but differ in
  direction, colour and backdrop. The pilot 上/下 pair scores well below the warning line; keep that pattern.
- **The road family** (行 来 先 前 後 歩 足 道 千): `road` + `footprints` would make them blur. Differentiate by the walker
  (person / feet / cart), direction and time of day; give 道 the road itself and the others something else.
- **Speech and reading** (言 話 語 読 書 聞): `kana` particles + `speech` emblem risk a blur. Split by: speaking (speech
  bubble, mouth), reading (book, paper), writing (brush reveal, ink), hearing (ear, notes).
- **Water and trees**: 水/川 and 木/林/森 share materials on purpose (component consistency), so they must differ in
  particles, backdrop and motion. 森 vs 林 was the tightest pair (0.92); with night and fireflies for 森 it is 0.73, and a canopy backdrop would
  separate them further.
- **Plain people** (人 子 大 長, and 田/父): `skin` + `plain` + no emblem makes them blur. Each needs its own motion
  *and* an emblem or backdrop (人 walking on a road, 子 bouncing with a toy, 大 growing against a ruler, 長 stretching).
- **食/肉, 目/見, 言/語, 九/書, 半/八**: drafts that share most slots; give each pair one strong difference (emblem or
  backdrop) before building them. The check makes that visible again whenever a card is added.
- **Calendar words** (週 毎 曜 年): one `calendar` backdrop would make all four alike; vary the emblem and motion.

## Missing pieces

<!-- generated:missing -->
78 pieces or presets named in the table above that do not exist yet (with the kanji that need them):

- material preset (data only): rose — 13: 花 毎 右 西 安 好 女 母 口 食 話 思 肉
- backdrop: road — 10: 前 後 先 千 足 行 来 歩 車 道
- material preset (data only): paper — 8: 週 四 百 名 読 言 語 本
- particles: footprints — 7: 後 先 千 足 行 歩 道
- material preset (data only): metal — 6: 分 間 五 入 車 駅
- backdrop: room — 6: 四 安 父 母 読 会
- particles: coins — 4: 金 万 買 円
- material preset (data only): clay — 4: 土 六 男 歩
- reveal: grow — 4: 土 花 森 生
- particles: dust as a layer (the tip kind exists; needs an emitter) — 4: 土 新 古 車
- reveal: stamp — 4: 今 五 名 円
- emblem: hand — 4: 左 右 五 手
- emblem: compass — 4: 北 南 東 西
- reveal: brush — 4: 九 読 書 語
- emblem: speech — 4: 口 話 言 語
- particles: kana — 4: 読 話 言 語
- particles: steam — 3: 気 食 肉
- reveal: split — 3: 分 半 八
- motion: split — 3: 分 半 八
- particles: sparks as a layer (the tip kind exists; needs an emitter) — 3: 分 五 十
- material preset (data only): ink — 3: 後 九 書
- backdrop: calendar — 3: 週 毎 曜
- backdrop: gate — 3: 間 入 聞
- emblem: yen — 3: 万 買 円
- reveal: assemble — 3: 好 友 会
- motion: walk — 3: 人 足 歩
- emblem: book — 3: 学 読 本
- backdrop: ground — 2: 土 出
- backdrop: field — 2: 田 男
- particles: petals — 2: 花 社
- sky preset (data only): noon — 2: 午 南
- particles: snow — 2: 北 白
- motion: spin — 2: 十 円
- motion: shrink — 2: 小 少
- reveal: carve — 2: 新 肉
- emblem: heart — 2: 母 思
- backdrop: school — 2: 学 校
- emblem: eye — 2: 目 見
- emblem: ear — 2: 耳 聞
- particles: notes — 2: 耳 聞
- emblem: foot — 2: 足 歩
- backdrop: kitchen — 2: 食 飲
- backdrop: market — 2: 買 肉
- emblem: crescent — 1: 月
- material preset (data only): cloud — 1: 気
- material preset (data only): fur — 1: 犬
- motion: wag — 1: 犬
- motion: swim — 1: 魚
- backdrop: seasons — 1: 年
- emblem: calendar — 1: 年
- emblem: sundial — 1: 午
- emblem: target — 1: 中
- sky preset (data only): snow — 1: 北
- sky preset (data only): sunset — 1: 西
- motion: open — 1: 間
- sky preset (data only): dawn — 1: 一
- emblem: chopsticks — 1: 二
- emblem: window — 1: 四
- emblem: dice — 1: 六
- emblem: stars — 1: 七
- emblem: plus — 1: 十
- motion: stack — 1: 百
- motion: grow — 1: 大
- motion: stretch — 1: 長
- material preset (data only): pearl — 1: 白
- particles: hearts — 1: 好
- motion: bounce — 1: 子
- material preset (data only): chalk — 1: 学
- motion: blink — 1: 目
- motion: wave — 1: 手
- reveal: pour — 1: 飲
- emblem: lightbulb — 1: 知
- backdrop: map — 1: 国
- backdrop: station — 1: 駅
- material preset (data only): neon — 1: 電
- motion: shake — 1: 電
- particles: arcs — 1: 電
- material preset (data only): lacquer — 1: 社
<!-- /generated:missing -->

Build order suggested by that list (most kanji unlocked per piece, cheapest first):

1. **Data only** (no code): sky presets `noon`, `dawn`, `sunset`, `snow`; material presets `paper`, `ink`, `metal`, `rose`,
   `clay`, `cloud`, `chalk`, `pearl`, `fur`, `neon`, `lacquer`.
2. **Emblems** (one small shape each): `speech`, `eye`, `ear`, `hand`, `foot`, `book`, `heart`, `yen`, `compass`, `calendar`,
   `crescent`, `target`, `lightbulb` ... Each is ~10 lines in `pieces/emblems.js`.
3. **Motions**: `grow` / `shrink` / `stretch` (scale), `walk` (step + bob), `split` / `open` (parts move apart),
   `spin`, `bounce`, `blink`, `wave`, `shake`, `stack`, `wag`, `swim`.
4. **Particles**: `footprints`, `kana` (floating hiragana from the bundled font), `steam`, `coins`, `petals`, `snow`,
   `notes`, `hearts`, `arcs`.
5. **Backdrops**: `road` (many actions), `room`, `kitchen`, `school`, `gate`, `calendar`, `field`, `ground`, `station`,
   `market`, `map`, `seasons`.
6. **Reveals**: `stamp`, `brush`, `grow`, `split`, `assemble`, `carve`, `pour`.

## Components: one look across kanji

KanjiVG component groups (`data/kanji-*.json` → `components`) let a recipe style a component the same way everywhere
(`COMPONENT_LOOKS` in `src/config.js`). Components that recur most in this N5 set (from KanjiVG, all depths):

| Component | Kanji | Look now / proposed |
|---|---|---|
| 口 | 中 何 古 右 名 知 言 話 語 読 足 週 高 (16 uses) | proposed: `rose` (a mouth) |
| 木 | 休 新 本 来 東 林 校 森 私 (12) | `wood` (built) |
| 日 | 明 時 曜 書 東 白 百 間 電 (9) | `gold` (built). Note: the 日 card itself stays cyan; recolour it gold if you want it to match |
| 亻 / 人 | 休 何 後 曜 花 行 / 今 会 (8) | `skin` (built) |
| 言 | 話 語 読 (3, plus 言 itself) | proposed: `paper` |
| 田 | 思 男 魚 (3, plus 田) | proposed: `jade` (a green field) |
| 目 | 見 買 道 (3, plus 目) | proposed: `cyan` with a blink |
| 月 | 明 前 (2, plus 月) | `silver` (built) |
| 女 / 子 | 好 安 / 好 学 | proposed: `rose` / `skin` |
| 門 | 聞 間 | proposed: `metal` |

## Built in this pilot

Pieces (see CLAUDE.md for options and costs): materials `glow` (presets cyan, gold, silver, jade, skin, water, ice, wood,
stone) and `heat`; reveals `draw` (tips drops, dust, sparks) and `ignite`; particles `flames`, `embers`, `bubbles`, `flow`,
`rain`, `leaves`, `mist`, `motes`; backdrops `plain`, `halo`, `sunrise`, `sky` (day, dusk, night, twilight, storm, forest,
deep); motions `none`, `sway`, `float`, `pulse`, `drift`, `lean`, `tilt`, `count`; emblems `arrow`, `question`, `zzz`,
`clock`, `dots`.

Why these: they cover the 15 pilot cards (literal nature, compounds with components, abstract words via emblem + motion,
and the two hardest groups, numbers 三 and time 時), and the generated list above shows they are also the pieces the rest
of the table leans on most (sky presets, glow presets, drift / count / pulse, arrows).
