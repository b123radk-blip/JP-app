# Effects plan: N5 coverage audit

What each N5 kanji's animation could be, built from the composable pieces (CLAUDE.md "Write a recipe"), and what that
needs. The table is **machine-read**: `node scripts/check-recipes.mjs --plan --write` regenerates the two sections marked
"generated" (similar pairs, missing pieces) from it. Edit a row, re-run, and the lists follow.

**Scope.** The project's N5 set (`N5_KANJI` in `scripts/build-font.py`, 110 kanji) plus 明 and 林 from the pilot (often
listed as N4): 112 kanji.

**Status (Step 2 done).** Every row is a card. Step 1's 112 rows were drafted from the table and hand-tuned on contact sheets
(67 of them). Step 2's 150 kanji were designed by hand in `scripts/data/kanji-designs.json`; their rows below (between the
`designs` markers) are generated from it (`node scripts/plan-from-designs.mjs`), and 18 were changed after the contact sheet.
A card's JSON can differ from its row: **the card is the truth**. docs/BATCH-LOG.md has what the reviews found.

**Notation.** One cell per slot, `type` or `type:variant` (`sky:storm`, `arrow:up`, `count:3`). Scene props ride in the
backdrop cell after a `+` (`sky:dusk + mountains`, `sky:golden + tree:木`). Material presets
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
| 水 | nature | water | draw:drops | bubbles | sky:lake + ripples | float | — | — | *pilot* One stream runs down the middle and splashes out to both sides. |
| 木 | nature | wood | draw | leaves | sky:day + tree | sway | — | — | *pilot* A tree: a trunk, one branch across, and roots spreading below. |
| 金 | nature | gold | draw:sparks | coins | halo | pulse | — | — | A roof over nuggets of gold glinting in the ground. |
| 土 | nature | clay | grow | dust | ground | none | — | — | A sprout pushing up out of the flat ground: soil. |
| 山 | nature | stone | draw:dust | mist | sky:dusk + mountains | none | — | — | *pilot* Three peaks side by side, the middle one the tallest. |
| 川 | nature | water | draw:drops | flow | sky:morning + river | none | — | — | *pilot* Three streams of water running down side by side. |
| 田 | nature | jade | draw | — | field | none | — | — | A rice field seen from above, split into four paddies. |
| 天 | nature | ice | draw | motes:up | sky:day | drift:up | — | 大 | A big person (大) with the sky (一) resting on their head. |
| 気 | nature | cloud | draw | steam | sky:day | float | — | — | Steam curling up from a pot of rice: air, and your mood. |
| 雨 | nature | ice | draw | rain | sky:storm | none | — | — | *pilot* A cloud hangs from the sky and four raindrops fall beneath it. |
| 花 | nature | rose | grow | petals | sky:day | sway | — | 艹 | Grass (艹) on top, and below someone changing (化) into a flower. |
| 森 | nature | wood | grow | motes:still, mist | sky:night + tree:木 | none | — | 木 | Three trees (木) crowd together: a deep forest where fireflies glow at night. |
| 林 | nature | wood | draw | leaves | sky:golden + tree:木 | none | — | 木 | *pilot* Two trees (木 木) side by side make a small wood. |
| 犬 | nature | fur | draw | — | sky:day | wag | — | 大 | A big (大) dog with one floppy ear (丶). |
| 魚 | nature | silver | draw | bubbles | sky:deep + ripples | swim | — | 灬 | A fish: head on top, scaly body (田) and a fanned tail (灬) below. |

### Time

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 年 | time | gold | draw | leaves | seasons | none | calendar | — | A farmer carries the rice harvest home once every year. |
| 時 | time | silver | draw | motes:still | sky:dusk + dial | none | — | 日 | *pilot* The sun (日) crosses the sky over a temple whose bell rings the hours. |
| 分 | time | metal | split | sparks | plain | split | — | 刀 | A knife (刀) cuts something in two (八): divide; also minutes. |
| 半 | time | jade | split | — | plain | split | — | — | A thing cut straight down the middle into halves. |
| 午 | time | gold | draw | motes:still | sky:noon + dial | none | sundial | — | The post of a sundial at high noon. |
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
| 三 | numbers | gold | draw:sparks | — | sky:night + lanterns:3 | count:3 | — | — | *pilot* Three lines, like three fingers: count them, one, two, three. |
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
| 友 | people | jade | assemble | — | plain | none | — | 又 | Two hands (one shaped like ナ, one like 又) reaching to shake: friend. |
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
| 出 | actions | stone | draw | — | ground + mountains | drift:up | arrow:up | 山 | A sprout climbing out of a pot: go out. |
| 入 | actions | metal | draw | — | gate | drift:away | arrow:away | — | A tent flap pulled aside: go in. |
| 食 | actions | rose | draw | steam | kitchen | none | — | — | A lid over a bowl of steaming food: eat. |
| 飲 | actions | water | pour | bubbles | kitchen + ripples | none | — | 食 欠 | Someone opening wide (欠) over a drink: drink. |
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
| 本 | abstract | paper | draw | — | plain + tree:木 | none | book | 木 | A tree (木) with a mark at its root: origin; also book. |

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

<!-- designs:start -->
### N5 part 2 (Step 2): designed by hand (generated from scripts/data/kanji-designs.json)

#### Things

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 物 | things | clay | draw | — | sky:indoor | none | box | 牛=glow:fur | A cow (牛) and all kinds of things (勿) packed into a box: thing, object. |
| 茶 | things | jade | draw | steam | sky:indoor | none | cup | 艹=glow:jade 木 | Leaves (艹) picked by a person (人) from a tea bush (木), brewed green: tea. |
| 飯 | things | ivory | draw | steam | sky:indoor | none | bowl | 飠=glow:gold | Food (飠) you go back (反) for every day: rice, a meal. |
| 紙 | things | paper | draw | — | sky:day | sway | plane | 糸 | Threads (糸) pressed flat by the family (氏): paper, folded into a letter. |
| 靴 | things | fur | draw | footprints | sky:day | none | shoe | 革=glow:clay | Leather (革) that changes (化) into shoes. |
| 図 | things | paper | draw | — | sky:day + field | none | pin | — | A drawing inside a frame (囗): a map, a plan. |
| 服 | things | pearl | draw | — | sky:indoor + room:shop | sway | shirt | — | Clothes for the body (月) hung up by a hand (又): clothing. |
| 画 | things | paper | draw | — | sky:day | none | frame | — | Fields (由) inside a frame (凵): a picture. |
| 映 | things | pearl | draw | motes:still | sky:indoor | none | film | 日 | The sun (日) right in the centre (央) of the screen: project, reflect. |
| 料 | things | gold | draw | steam | sky:indoor | none | pot | 米=glow:ivory | Rice (米) measured with a ladle (斗): ingredients, a fee. |
| 筆 | things | ink | brush | — | sky:snow | none | — | 竹=glow:jade | A bamboo (竹) handle holding the brush tip (聿): writing brush. |
| 皿 | things | pearl | draw | — | sky:indoor | none | plate | — | A plate on its stand, seen from the side: dish. |
| 機 | things | metal | draw:sparks | — | sky:noon | shake | gears | 木 | A wooden (木) loom full of tiny (幾) moving parts: machine. |
| 台 | things | wood | draw | — | sky:indoor + room:kitchen | none | — | — | A mouth (口) under a nose (厶) at the counter: a stand, a platform; the kitchen (台所). |

#### Actions

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 切 | actions | silver | draw:sparks | — | sky:noon | split | knife | — | Seven (七) chops of a sword (刀) and the kanji falls in two: cut. |
| 着 | actions | fur | stamp | — | sky:morning | none | shirt | 羊 | A sheep (羊) arrives and puts on its woolly coat, eyes (目) shining: wear, arrive. |
| 動 | actions | clay | draw:dust | wind | sky:day | slide | — | 力=glow:lacquer | Heavy (重) things only move with power (力): move. |
| 洗 | actions | water | draw:drops | bubbles | sky:morning | shake | hand | 氵 | Water (氵) first (先): wash, scrubbing up the suds. |
| 開 | actions | lacquer | draw | — | sky:dusk + gate | none | — | 开=glow:skin | Two hands (开) push the gate (門) open and light pours in: open. |
| 消 | actions | water | draw | steam | sky:night | none | — | 氵 | Water (氵) on a little (肖) flame: it goes out; the strokes rub away: erase, put out. |
| 教 | actions | chalk | draw | — | sky:indoor + room:classroom | none | — | 攵 | A teacher's hand (攵) taps the blackboard for the child (孝): teach. |
| 引 | actions | wood | draw | — | sky:day | shove:left | bow | 弓 | A bow (弓) and its string (丨) drawn back: pull. |
| 止 | actions | lacquer | stamp | — | sky:day | none | stop | — | A foot planted firmly on the ground: stop. (Japan's stop sign says 止まれ.) |
| 歌 | actions | rose | draw | notes | sky:golden | sway | mic | 欠 | Two mouths (哥) and a wide-open yawn (欠): singing a song. |
| 合 | actions | jade | assemble | — | sky:day | none | puzzle | — | A lid (人一) drops onto a box (口): they fit together. |
| 閉 | actions | lacquer | draw | — | sky:night + gate | none | — | — | The gate (門) barred shut (才): close. |
| 掛 | actions | wood | draw | — | sky:indoor + room | hang | — | 扌 | A hand (扌) hangs a lucky charm (卦) on a nail: hang. |
| 作 | actions | wood | draw:sparks | — | sky:indoor | none | hammer | 亻 | A person (亻) hammering away in a moment (乍): make. |
| 降 | actions | ice | draw | rain | sky:storm | drift:down | stairs | — | Feet (夅) going down the hill steps (⻖): get off, come down; rain falls. |
| 習 | actions | paper | draw | — | sky:morning | none | pen | 羽=glow:cloud | A fledgling flaps its wings (羽) a hundred (白) times, like practising with a pen: learn. |
| 通 | actions | silver | draw | — | sky:dusk + road + gate | drift:away | — | — | Walking (⻌) straight through the tunnel (甬): pass through, commute. |
| 渡 | actions | lacquer | draw | — | sky:day + river + bridge | drift:right | — | 氵=glow:water | Crossing the water (氵) step by step (度): cross over, hand over. |
| 使 | actions | skin | draw | — | sky:day | none | wrench | 亻 | A person (亻) put to work by an official (吏): use. |
| 交 | actions | jade | draw | — | sky:day + road | none | swap | — | Legs crossed (父) under a lid: cross, exchange. |
| 差 | actions | water | draw | rain | sky:storm | none | umbrella | 羊=glow:fur | A sheep (羊) holds up an umbrella against the rain: hold up; difference. |
| 建 | actions | wood | assemble | dust | sky:day | none | blocks | — | A brush (聿) drafts the plan, a long stride (廴) builds it: build. |
| 持 | actions | skin | draw | — | sky:dusk | none | bag | 扌 | A hand (扌) at the temple (寺) holding the bag: hold, have, carry. |
| 立 | actions | skin | draw | — | sky:morning | stand | — | — | A person standing on the ground, arms out: stand. |
| 乗 | actions | silver | draw | — | sky:day + road | bounce | train | — | Someone perched on top of a tree (木), riding high: ride. |
| 売 | actions | gold | draw | coins | sky:golden | none | tag | — | A samurai (士) on long legs (儿) under a roof (冖) calling out his wares: sell. |
| 転 | actions | silver | draw | — | sky:day + road | roll | bike | 車 | A cart (車) whose wheels go round and round (云): roll, turn over. |
| 起 | actions | gold | draw | — | sunrise | stand | alarm | 走 | Run (走) as soon as you (己) are up: wake up, get up. |
| 帰 | actions | wood | draw | footprints:left | sky:dusk | drift:left | house | — | Sweeping (帚) the path back home: go home, return. |
| 返 | actions | gold | draw | — | sky:day | flip | boomerang | — | Walking (⻌) it back the other way (反): return, give back. |
| 問 | actions | chalk | draw | — | sky:dusk + gate | none | question | 口=glow:rose | A mouth (口) at the gate (門) asking: a question. |
| 取 | actions | skin | draw | — | sky:day | shove:left | hand | 又=glow:lacquer | A hand (又) grabbing an ear (耳): take. |
| 写 | actions | silver | draw | — | sky:day | none | camera | — | A cover (冖) over the camera: copy, take a photo. |
| 旅 | actions | clay | draw | — | sky:morning + road | walk | suitcase | — | People (亻) under a banner (方) setting off: travel. |
| 押 | actions | skin | draw | — | sky:day | shove:right | hand | 扌 | A hand (扌) pushing on armour (甲): push. |
| 泳 | actions | water | draw | bubbles | sky:lake + ripples | swim | — | 氵 | Water (氵) that goes on forever (永): swim. |
| 飛 | actions | cloud | draw | wind | sky:day | fly | bird | — | Two wings beating as it lifts off: fly. |
| 張 | actions | rose | draw | — | sky:day | stretch:x | — | 弓=glow:wood | A bowstring (弓) pulled long (長): stretch, try hard (頑張る). |
| 運 | actions | silver | draw | — | sky:day + road | drift:right | car | 軍 | An army (軍) on the march (⻌) carrying its supplies: carry, transport; luck. |

#### Time

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 朝 | time | gold | draw | — | sunrise | none | crescent | 月 | The sun rises through the grass (𠦝) while the moon (月) still hangs there: morning. |
| 晩 | time | pearl | draw | motes:still | sky:twilight + lanterns:3 | none | — | 日 | The sun (日) slips down, excused (免) for the day: evening, night. |
| 昨 | time | silver | draw | — | sky:sunset | drift:left | arrow:left | 日 | The sun (日) of a moment ago (乍), sliding back to the left: yesterday. |
| 夜 | time | neon | draw | motes:still | sky:night | none | zzz | 亻 | A person (亻) under a roof (亠) as the evening moon (夕) rises: night. |
| 始 | time | rose | draw | — | sky:dawn | none | flag | 女 | A woman (女) at the platform (台) waves the start flag: begin. |
| 昼 | time | gold | draw | — | sky:noon + dial | none | — | 日 | The sun (日) stands highest over the horizon line (一): noon, daytime. |
| 夏 | time | gold | draw | motes:up | sky:noon + ripples | none | flower | — | A head (自) dragging its feet (夂) in the heat: summer. |
| 夕 | time | gold | draw | — | sky:sunset | drift:up | crescent | — | Half a moon (月) rising at dusk: evening. |
| 終 | time | silver | draw | — | sky:sunset | none | flag:finish | 糸 | The thread (糸) runs out in winter (冬): the end. |
| 遅 | time | clay | draw | — | sky:golden + road | slide | snail | — | A sheep (羊) dawdling along the road (⻌): slow, late. |
| 初 | time | pearl | draw:sparks | — | sky:dawn | none | dots:1 | 衤=glow:paper 刀=glow:silver | Scissors (刀) cutting new cloth (衤) for the very first time: first, beginning. |

#### Quality

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 色 | quality | rainbow | draw | — | sky:night | none | rainbow | — | A painter (⺈) bent over a curled-up palette (巴), cycling through every colour: colour. |
| 赤 | quality | lacquer | draw | embers | halo | pulse | splash | — | A fire glowing on the ground (土): red. |
| 温 | quality | clay | draw | steam | halo | none | onsen | 氵 | Water (氵) warmed by the sun (日) in a basin (皿): a warm bath. |
| 冷 | quality | ice | draw | snow | sky:snow | shake | thermometer:0.15 | 冫 | Ice (冫) by order (令): cold. |
| 味 | quality | rose | draw | steam | sky:indoor | none | spoon | 口 | A mouth (口) trying something not yet (未) tasted: flavour, taste. |
| 青 | quality | water | draw | — | sky:day + ripples | none | splash | — | Young plants sprouting on top of a moonlit (月) field: blue, green. |
| 黒 | quality | ink | draw | — | sky:snow | none | splash | 灬=heat | Soot from the fire (灬) under the village (里): black. |
| 黄 | quality | gold | draw | motes:up | sky:day | none | splash | — | Ripe rice fields glowing at harvest: yellow. |
| 強 | quality | metal | draw | — | sky:noon | pulse | dumbbell | 弓=glow:wood | A bow (弓) only the strong can bend: strong. |
| 重 | quality | stone | draw | dust | sky:day | sink | weight | — | A thousand (千) villages (里) piled up: heavy. |
| 熱 | quality | lacquer | draw | embers | halo | shake | thermometer:0.95 | 灬=heat | Fire (灬) under the plant (埶): heat, a fever. |
| 美 | quality | pearl | draw | petals | sky:dawn | none | flower | — | A big (大) sheep (羊), the finest of the flock: beautiful. |
| 汚 | quality | clay | draw | dust | sky:day | none | splash | 氵=glow:clay | Muddy water (氵) splashed everywhere: dirty. |
| 最 | quality | gold | draw | sparks | sky:golden | grow:1.15 | trophy | 日 | Taking (取) the sun (日) itself: the most, the best. |
| 悪 | quality | lacquer | draw | — | sky:storm | shake | — | 心=heat | A heart (心) under a crooked lid (亜): bad. |
| 暖 | quality | gold | draw | petals | sky:golden | none | sun | 日 | The sun (日) lending a warm hand (爰) to the spring: warm weather. |

#### Abstract

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 事 | abstract | chalk | draw | — | sky:indoor | none | briefcase | — | A hand (⺕) gripping a stick with papers stuck on it: a matter, business to deal with. |
| 当 | abstract | gold | draw | sparks | sky:day | none | target | — | Little sparks (⺌) above a hand (⺕) that hits the mark: hit, right. |
| 有 | abstract | gold | draw | coins | halo | none | hand | 月 | A hand (ナ) holding a piece of meat (月): have, possess. |
| 楽 | abstract | gold | draw | notes | sky:golden | bounce | — | 木 | Bells (白) ring on a wooden (木) stand: music, fun. |
| 番 | abstract | paper | draw | — | sky:indoor | none | ticket | 田=glow:jade | Seeds (釆) sown field (田) by field, in turn: your turn, your number. |
| 御 | abstract | gold | draw | — | halo | bow | — | — | Stepping (彳) up to bow (卸) politely: the honourable prefix (御飯). |
| 嫌 | abstract | silver | draw | — | sky:storm | shake | frown | 女 | A woman (女) handed two of something (兼) she doesn't want: dislike. |
| 意 | abstract | pearl | draw | hearts | sky:twilight | pulse | lightbulb | 心=glow:rose | The sound (音) of your heart (心) lights up an idea: meaning, mind. |
| 文 | abstract | ink | brush | — | sky:morning | none | — | — | Brush strokes crossing on the page: writing, a sentence. |
| 変 | abstract | neon | draw | — | sky:twilight | jiggle | question | — | Red (亦) feet (夂) wobbling like jelly: strange, change. |
| 字 | abstract | paper | brush | kana | sky:day | none | — | 子 | A child (子) under the roof (宀) learning letters: character. |
| 部 | abstract | chalk | draw | — | sky:day | none | pie:0.25 | ⻏=glow:jade | A village (⻏) divided into sections: part, section. |
| 全 | abstract | gold | draw | sparks | halo | pulse | dots:5 | — | A king (王) under one roof (人) owns it all: whole, all. |
| 無 | abstract | chalk | draw | — | sky:night | vanish | — | 灬=heat | Everything burned away in the fire (灬): nothing left. |
| 理 | abstract | jade | draw | — | sky:twilight | none | scale | 王 | Jade (王) cut along its grain in the village (里): reason, logic. |
| 度 | abstract | silver | draw | — | sky:snow | none | thermometer:0.5 | — | A hand (又) under the eaves (广) reading the degrees: degrees, times. |
| 音 | abstract | gold | draw | notes | sky:twilight | none | speaker | 日 | Stand (立) under the sun (日) and listen: sound. |
| 用 | abstract | silver | draw | — | sky:morning | none | letter | — | A frame for hanging things ready to use: use, business, an errand. |
| 点 | abstract | neon | stamp | sparks | sky:night | none | — | 灬=glow:gold | Four dots of fire (灬) under a fortune (占): a point, a mark. |
| 違 | abstract | silver | draw | — | sky:dusk | shake | cross | — | Walking (⻌) the wrong way round the leather (韋): different, wrong. |
| 再 | abstract | jade | draw | — | sky:day | none | repeat | — | The same frame built once more: again. |
| 要 | abstract | gold | draw | — | sky:day | pulse | exclaim | 女 | A woman (女) carrying a basket (覀) she can't do without: need, essential. |
| 計 | abstract | silver | draw | — | sky:day | none | clock | 言 | Words (言) counting up to ten (十): measure, plan; a clock (時計). |
| 同 | abstract | silver | draw | — | sky:day | count:2 | equals | — | One mouth (口) under the same roof (冂): the same. |
| 丈 | abstract | wood | draw | — | sky:golden | stretch:y | ruler | — | Ten (十) measures, crossed (乂): length; sturdy (丈夫). |
| 題 | abstract | paper | draw | — | sky:indoor | none | sheet | 頁 | The head (頁) of the page: the title, the topic; homework (宿題). |
| 真 | abstract | pearl | draw | sparks | sky:day | none | gem | 目 | Ten (十) eyes (目) checking the gem on its stand: true, genuine. |
| 両 | abstract | gold | draw | — | sky:day | split | dots:2 | — | Two equal pans hung from one beam: both. |
| 答 | abstract | jade | draw | — | sky:day | none | check | 竹 | Bamboo slips (竹) fitted together (合): the answer. |
| 辞 | abstract | paper | draw | kana | sky:indoor | none | speech | 舌=glow:rose | A tongue (舌) and a spicy (辛) word: words; a dictionary (辞書). |
| 覚 | abstract | pearl | draw | sparks | sky:twilight | none | book | 見 | Seeing (見) the book with sparks (⺍) over your head: memorize, remember. |
| 業 | abstract | silver | draw | — | sky:morning | none | gears | 木=glow:wood | A wooden (木) frame hung with tools: work, business, a class (授業). |

#### Places

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 家 | places | wood | draw | steam | sky:dusk | none | house | 宀=glow:lacquer | A pig (豕) snug under the roof (宀): home. |
| 所 | places | stone | draw | — | sky:day | none | pin | 戸=glow:wood | An axe (斤) hung by the door (戸): this is the place. |
| 屋 | places | wood | draw | — | sky:indoor + room | none | window | — | A body (尸) reaching (至) the shelter of a roof: house, room, shop. |
| 場 | places | chalk | draw | — | sunrise + field | none | — | 土 | The sun rising (昜) over open ground (土): a place, a venue. |
| 庭 | places | jade | draw | petals | sky:day + tree | none | — | 广=glow:wood | A courtyard (廷) under the eaves (广), trees in bloom: garden. |
| 段 | places | stone | draw | — | sky:day | none | stairs | — | Steps cut out with a hammer (殳): stairs, step by step. |
| 館 | places | stone | draw | — | sky:day | none | museum | — | A large official (官) hall where meals (飠) are served: building, hall. |
| 店 | places | wood | draw | — | sky:indoor + room:shop | none | tag | — | A stall under the eaves (广) where a fortune-teller (占) sells: shop. |
| 住 | places | skin | draw | — | sky:night + room | none | — | 亻 主=glow:gold | A person (亻) beside the master's lamp (主): live, dwell. |
| 院 | places | chalk | draw | — | sky:day | none | hospital | — | A complete (完) building up on the hill (⻖): an institution, the hospital (病院). |
| 宿 | places | wood | draw | — | sky:night | none | bed | 宀=glow:lacquer | A hundred (百) people (亻) sleeping under one roof (宀): an inn. |

#### People

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 自 | people | pearl | draw | — | sky:morning | turn | mirror | — | A long nose (point at your nose to say "me"), seen in the mirror: oneself. |
| 兄 | people | skin | draw | — | sky:day | grow:1.2 | person | — | A big mouth (口) on long legs (儿): the older brother, tallest and loudest. |
| 姉 | people | rose | draw | — | sky:day | grow:1.2 | person | 女 | A woman (女) who goes to the market (市) for the family: older sister. |
| 体 | people | skin | draw | — | sky:day | stretch:y | person | 亻 | A person (亻) and their trunk (本): body. |
| 弟 | people | skin | draw | — | sky:day | bounce | person | — | A little boy bouncing along behind: younger brother. |
| 誰 | people | silver | draw | — | sky:dusk | tilt | question | — | A bird (隹) asking (言), "Who? Who?": who. |
| 背 | people | skin | draw | — | sky:morning | stretch:y | person | — | Two people back to back (北) over a body (月): your back, your height. |
| 心 | people | rose | draw | hearts | sky:dusk | pulse | heart | — | A heart with drops of feeling around it: heart, mind. |
| 親 | people | skin | draw | — | sky:day + tree:木 | none | eye | 見 | Standing (立) on a tree (木) to watch (見) over the children: parent. |
| 面 | people | ivory | draw | — | sky:dusk | turn | mask | — | A face framed with its nose in the middle: face, mask, surface. |
| 病 | people | chalk | draw | — | sky:storm | shake | pill | 疒=glow:clay | Someone lying on the sickbed (疒) with a fever (丙): ill. |
| 眼 | people | cyan | draw | — | sky:day | blink | glasses | 目 | An eye (目) that stops (艮) to stare: eyeball; glasses (眼鏡). |
| 夫 | people | skin | draw | — | sky:day | none | ring | — | A big (大) man with a hairpin (一) on his wedding day: husband; also sturdy (丈夫). |
| 仕 | people | skin | draw | — | sky:indoor | bow | cup | 亻 | A person (亻) serving the samurai (士): serve, work (仕事). |

#### Position

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 近 | position | jade | draw | — | sky:golden + road | drift:toward | arrow:toward | — | Walk (⻌) up to the axe (斤) close by: near. |
| 方 | position | gold | draw | — | sky:golden | none | signpost | — | A signpost on the hilltop (亠) pointing every way: direction, way. |
| 並 | position | chalk | draw | — | sky:dusk + lanterns:4 | count:4 | — | — | People standing side by side on one line: line up, in a row. |
| 向 | position | jade | draw | — | sky:morning | turn | arrow:toward | — | A window (口) in the house (冂) turned to face you: face towards, over there. |
| 遠 | position | jade | draw | — | sky:golden + road | shrink:0.65 | arrow:away | — | Walking (⻌) off in a long robe (袁), smaller and smaller: far. |

#### Nature

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 葉 | nature | jade | grow | leaves | sky:forest | sway | leaf | 木 | Grass (艹) over a generation (世) of trees (木): leaf. |
| 風 | nature | cloud | draw | wind, leaves | sky:day | lean:right | — | — | An insect (虫) blown about under a sail (几): wind. |
| 地 | nature | clay | draw:dust | — | sky:day | none | globe | 土 | Soil (土) spread over the whole land: ground, the earth. |
| 晴 | nature | gold | draw | motes:up | sky:noon | none | sun | 日 青=glow:water | The sun (日) in a blue (青) sky: clear weather. |
| 空 | nature | cloud | draw | — | sky:noon | float | cloud | — | A hole (穴) in the roof over the workbench (工): the empty sky above. |
| 曇 | nature | cloud | draw | mist | sky:snow | none | cloud | 日=glow:gold | Clouds (雲) drift over the sun (日): cloudy. |
| 牛 | nature | fur | draw | — | sky:day + field | tilt | cow | — | A cow's head with its horns: cow. |
| 洋 | nature | water | draw | — | sky:day + ripples | sway | boat | 氵 | Water (氵) as wide as a flock of sheep (羊): the ocean; Western. |
| 鳴 | nature | jade | draw | notes | sky:forest | none | bird | 口=glow:rose | A bird (鳥) opening its mouth (口): chirp, sing, ring. |

#### Size

| Kanji | Group | Material | Reveal | Particles | Backdrop | Motion | Emblem | Parts | Mnemonic idea |
|---|---|---|---|---|---|---|---|---|---|
| 広 | size | chalk | draw | — | sky:day + field | stretch:x | — | — | A wide hall under the eaves (广) stretching out: wide. |
| 太 | size | clay | draw | — | sky:day | stretch:x | — | — | Big (大) with an extra dot (丶) of belly: fat, thick. |
<!-- designs:end -->

## Too alike

<!-- generated:similar -->
19 pairs at or above 0.72 (bold: at or above 0.9, which `npm test` would reject in a deck):

- 先 ~ 行 0.88 (same: material, reveal, particles, backdrop, motion, emblem)
- 千 ~ 道 0.85 (same: material, reveal, particles, backdrop, motion)
- 兄 ~ 弟 0.82 (same: material, reveal, backdrop, emblem)
- 言 ~ 語 0.79 (same: material, particles, backdrop, motion, emblem)
- 足 ~ 歩 0.78 (same: reveal, particles, backdrop, motion, emblem)
- 話 ~ 言 0.78 (same: reveal, particles, backdrop, motion, emblem)
- 大 ~ 人 0.77 (same: material, reveal, backdrop)
- 大 ~ 子 0.77 (same: material, reveal, backdrop)
- 人 ~ 子 0.77 (same: material, reveal, backdrop)
- 段 ~ 館 0.76 (same: material, reveal, backdrop, motion)
- 取 ~ 押 0.76 (same: material, reveal, backdrop, emblem)
- 近 ~ 遠 0.75 (same: material, reveal, scene, backdrop)
- 開 ~ 閉 0.74 (same: material, reveal, scene, motion)
- 話 ~ 語 0.73 (same: particles, backdrop, motion, emblem)
- 小 ~ 少 0.73 (same: material, reveal, backdrop, motion)
- 兄 ~ 姉 0.73 (same: reveal, backdrop, motion, emblem)
- 体 ~ 背 0.73 (same: material, reveal, motion, emblem)
- 後 ~ 行 0.72 (same: reveal, particles, backdrop, parts)
- 水 ~ 泳 0.72 (same: material, particles, scene, backdrop)
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
17 pieces or presets named in the table above that do not exist yet (with the kanji that need them):

- reveal: split — 3: 分 半 八
- backdrop: calendar — 3: 週 毎 曜
- backdrop: ground — 2: 土 出
- reveal: carve — 2: 新 肉
- backdrop: school — 2: 学 校
- backdrop: kitchen — 2: 食 飲
- backdrop: market — 2: 買 肉
- backdrop: seasons — 1: 年
- emblem: sundial — 1: 午
- motion: open — 1: 間
- emblem: chopsticks — 1: 二
- emblem: dice — 1: 六
- motion: stack — 1: 百
- reveal: pour — 1: 飲
- backdrop: map — 1: 国
- backdrop: station — 1: 駅
- particles: arcs — 1: 電
<!-- /generated:missing -->

Build order suggested by that list (most kanji unlocked per piece, cheapest first). Lesson from the pilot: the cards that
read instantly have a **scene prop that is the meaning** (sun, fire, rain, mountains, river, tree, lanterns, clock); the
weak ones only had a material and a sky. So scene props come first wherever a kanji is a thing or a place.

0. **Scene props** (new slot, `pieces/props-*.js`): `road`, `room`, `field`, `gate`, `book`, `bowl` (食 飲 肉), `calendar`,
   `window`, `crossroads`, `house`, `train`/`car`, `coins`. Several backdrops below are better built as props.

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

## Built so far

Pieces (see CLAUDE.md for options and costs):
- **Materials:** `glow` with 23 presets (cyan, gold, silver, jade, skin, water, ice, wood, stone, ivory, rose, paper, ink,
  metal, clay, cloud, chalk, pearl, fur, neon, lacquer, katakana, plain), `rainbow` and `heat`.
- **Reveals:** `draw` (tips drops, dust, sparks; `erase`), `ignite`, `grow`, `stamp`, `brush`, `assemble`.
- **Particles:** flames, embers, sparks, dust, bubbles, flow, rain, leaves, mist, motes, snow, petals, steam, coins,
  hearts, notes, footprints, wind, kana.
- **Scene props:** mountains, river, ripples, tree (on a component or one glyph of a word), lanterns, dial, road, field,
  room (home, classroom, kitchen, shop, station), gate (opens or closes), bridge.
- **Backdrops:** plain, halo, sunrise, and `sky` with 15 presets.
- **Motions:** none, sway, float, pulse, drift, lean, tilt, count, grow, shrink, stretch, spin, bounce, shake, wave, wag,
  walk, blink, swim, fly, sink, roll, stand, bow, hang, turn, flip, shove, vanish, slide; stroke motions split, jiggle.
- **Emblems:** 98 kinds (CLAUDE.md lists them), from arrow and question to the Japanese stop sign, umbrella, gears, camera,
  globe, thermometer, scale, bird, cow, snail, stairs and puzzle pieces.

History:
- The pilot built the first set.
- Round 2 added the scene props and three high-contrast skies, and rebuilt 山 川 水 木 林 三 時 with them.
- Step 1 moved the stroke reveal to the GPU (fixed draw calls per part) and added most emblems, motions and props.
- Step 2 added per-stroke offsets (strokes move without new meshes) and the pieces the drafts and the N5 part 2 kanji wanted.

Still missing: see the generated list above and the review notes in docs/BATCH-LOG.md.

Why these: they cover the 15 pilot cards (literal nature, compounds with components, abstract words via emblem + motion,
and the two hardest groups, numbers 三 and time 時), and the generated list above shows they are also the pieces the rest
of the table leans on most (sky presets, glow presets, drift / count / pulse, arrows).
