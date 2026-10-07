# Step 2b revamp: a scene of its own for every kanji (progress checklist)

The prompt: [docs/prompts/step-2b-revamp.md](prompts/step-2b-revamp.md). This file is where each session continues.
The test for every card: **would someone who has never seen this kanji (a kid, say) guess its meaning from the scene
alone?** Scenes act the meaning out (a beginning, an action, an end) and the kanji takes part when its shape allows.

**Where to continue:** the pilot and Batches 1-4 are built (105 of the 150 kanji, 137 words). Next is Batch 5: the next 25 unticked
kanji of the list below, then their words (every word whose Step 2 kanji are all ticked). Each batch: build,
look at the frame strips, fix, apply with `scripts/set-recipes.mjs`, tick here, `npm test`, e2e, commit and push.

## Grades
Triaged on frame strips of every card (`node scripts/look.mjs ids --times 1,3,6`, sheets in `.cache/revamp/`), plus the
recipe of each card:
- **A**: distinct and readable; keep.
- **B**: a better existing piece or a small tweak fixes it.
- **C**: needs a scene.

The scene on each C line is the plan, not a promise. When a better story turns up while building it, use that one and
update the line.

| | Kanji (150) | Words (177) |
|---|---|---|
| A | 3: 朝 色 開 | 0 |
| B | 4: 消 閉 渡 立 | 17: the meaning is their kanji (今朝 毎晩 ...); a word rule that does not repeat a kanji's emblem |
| C | 143 (5 built in the pilot) | 160 |

Almost every Step 2 card is a material, a sky and an emblem floating beside the kanji, so it reads as a label rather
than a story (`物` + a box, `計` + a clock). The three A cards act their meaning out with the glyph itself: the sun
rises behind 朝 while the moon still hangs there, 色 walks round the rainbow, and 開's gate doors slide open with light
pouring out.

## Pilot (built, waiting for the headset look)
Strips: `docs/screenshots/revamp-pilot-*.jpg`.

- [x] 上手 (word, Step 1), hammer-nail clean. A board slides in beside the word, a nail pops up, a helper hand pinches
  it, and a hand with a hammer comes down. A tap, the helper lets go, two firm blows drive the nail in flush, a sparkle,
  and the hammer is twirled like a baton.
- [x] 下手 (word, Step 1), hammer-nail bend. The same set-up. The first blow bends the nail over; the second lands on
  the helper's thumb, which flashes red, swells, jerks away shaking, with stars circling.
- [x] 押 push (action). A person walks up beside the kanji, leans in with both hands on it and shoves it along in three
  heaves, dust puffing at its base. Then they step back and it slides home.
- [x] 重 heavy (quality). A person squats, grips the kanji's corner and strains: shaking, red in the face, sweat
  flying. It tips up a crack, then thuds down in a cloud of dust and knocks them onto their bottom.
- [x] 近 near (direction). Far down a sandy path a tiny person walks towards you, growing, until they stand right
  beside the kanji, lean in close and wave.
- [x] 皿 dish (object). The kanji is the stand: plates fly in one by one and land on its top with a clink (it gives a
  little), the top one wobbles, and a cake drops onto it. Then they lift away and the stack builds again.
- [x] 違 different (abstract). A row of identical blue balls hops in step beside the kanji, but one is a red cube
  hopping out of time. A magnifier glides along the row, stops on it, and a red cross pops up.
- [x] 二人 two people (word, Step 1, the user's own example). One person walks out from behind the word, another in
  from the side. They turn to you, take hands and swing them, heads tilted together, hearts rising between them.

## Kanji (Step 2 plan order)
Batches of about 25 in this order. Tick a line when its scene is built, looked at, and pushed.

- [x] 物 thing (C): a cardboard box tips open and things tumble out one after another (a ball, a cup, a book, a shoe) and land in a heap; the lid flaps shut. Built: `box-tumble`.
- [x] 切 cut (C): a knife comes down through the middle of the kanji; the two halves slide apart (split), a little gap glints, then they ease back together. Built: `chop-split`.
- [x] 朝 morning (A): keep (sunrise behind it, the moon still up). Kept.
- [x] 着 wear / arrive (C): a person walks in (arrive), stops, and a coat drops onto them from above; arms slide into the sleeves, they straighten it, proud. Built: `coat-on`.
- [x] 色 colour (A): keep (the glyph walks round the rainbow). Kept.
- [x] 茶 tea (C): a teapot tips over a cup, a green stream pours, steam curls up, a hand lifts the cup away. Built: `tea-pour`.
- [x] 晩 nightfall (C): the sun sinks below a hill line, the sky dims, windows of little houses light up one by one, a moon rises. Built: `sunset-lights`.
- [x] 事 matter / thing (C): a hand stamps a stack of papers one by one (thump, thump), each slides onto an "done" pile: business to deal with. Built: `todo-list`.
- [x] 家 house (C): a little house builds itself around the kanji (floor, walls, the roof dropping on), a chimney puffs, a light comes on inside. Built: `house-build`.
- [x] 動 move (C): the kanji, stuck still, gets a push of wind; it shuffles, then slides across in jerks, wheels popping out under it (things moving). Built: `wheels-roll`.
- [x] 自 oneself (C): a person points at their own nose (the Japanese "me" gesture), then a mirror swings round and shows them themselves. Built: `mirror-me`.
- [x] 洗 wash (C): a sponge in a hand scrubs the kanji, suds foam up, a bucket of water splashes over it and it comes out sparkling. Built: `scrub-wash`.
- [x] 昨 yesterday (C): a clock whose hands spin backwards, a rewind sign, a little sun running back across the sky (the calendar went to 昨日 / 一昨日, so the kanji and its word do not share a scene). Built: `rewind-clock`.
- [x] 夜 night (C): a person yawns, a sleeping cap drops onto them, they lie down; stars blink on, the moon rises over the kanji. Built: `go-to-bed`.
- [x] 兄 older brother (C): two kids stand side by side; the taller one pats the small one on the head and lifts a toy out of their reach. Built: `big-brother`.
- [x] 赤 red (C): a green apple on a branch ripens to bright red (colour sweeps over it), and the kanji blushes red with it. Built: `apple-ripen`.
- [x] 当 hit / right (C): a dart flies in a curve and thunks into the bullseye on a target; the target wobbles, a ding. Built: `dart-bullseye`.
- [x] 近 near (C): pilot, built. Built: `come-near`.
- [x] 方 direction (C): a person at a crossroads looks one way, then the other, then a signpost arm swings round and points the way; they walk off that way. Built: `which-way`.
- [x] 消 erase / put out (B): the strokes rub away already; add a hand with an eraser rubbing them out, crumbs falling (消す); a candle blown out for 消える. Built: `eraser-rub`.
- [x] 開 open (A): keep (gate doors slide open, light pours out). Kept.
- [x] 教 teach (C): a teacher (person) at the blackboard taps it with a pointer, a small pupil raises a hand, a speech bubble with a lightbulb pops up. Built: `teach-board`.
- [x] 葉 leaf (C): the kanji's 木 grows a branch; one big leaf unfurls on it, flutters loose and zigzags down to the ground. Built: `leaf-fall`.
- [x] 昼 noon (C): the sun climbs to the very top of the sky over a person; their shadow shrinks under their feet; they open a lunchbox. Built: `noon-sun`.
- [x] 飯 meal / rice (C): a bowl of rice is set down, chopsticks dip in and lift a clump, steam rises; the bowl empties, gets refilled. Built: `rice-bowl`.
- [x] 所 place (C): a map pin drops out of the sky and stabs into the ground right next to the kanji with a thunk; a little "here" flag pops up. Built: `pin-drop`.
- [x] 楽 fun / music (C): two kids bounce on a seesaw / play drums; music notes fly up with each bounce; the kanji bobs to the beat. Built: `drum-fun`.
- [x] 番 turn / number (C): a line of three people; a ticket machine spits a numbered ticket, the front one steps up when "1" lights, then the next. Built: `queue-number`.
- [x] 風 wind (C): a big gust blows across: the kanji leans over, a person's hat flies off and tumbles away, leaves streak by. Built: `gust-hat`.
- [x] 地 ground (C): the kanji drops onto the ground with a thud; the ground cracks around it, grass sprouts; a tiny globe turns underneath. Built: `ground-thud`.
- [x] 初 first time (C): a chick pecks its way out of an egg next to the kanji and blinks at the world for the very first time. Built: `egg-hatch`.
- [x] 引 pull (C): a person grabs a rope tied to the kanji and pulls, leaning back; it slides towards them in jerks (the mirror of 押). Built: `rope-pull`.
- [x] 止 stop (C): a person running along stops dead at a red stop sign (止まれ), skidding, arms windmilling. Built: `stop-sign`.
- [x] 歌 sing (C): a person on a little stage holds a mic, mouth wide; notes stream out and a spotlight sways. Built: `sing-mic`.
- [x] 晴 clear weather (C): grey clouds part and slide off both sides; the sun beams out over the kanji; a person takes off their raincoat. Built: `clouds-part`.
- [x] 嫌 dislike (C): a hand offers a spoonful of green vegetables to a kid, who turns their head away, crosses arms and shakes their head. Built: `refuse-spoon`.
- [x] 冷 cold (C): a person shivers, teeth chattering; ice crystals creep over the kanji; an icicle grows under it and drips. Built: `shiver-frost`.
- [x] 合 fit / join (C): the top part (人一) lifts like a lid and drops onto the box (口) with a click; it fits perfectly, a sparkle. Built: `lid-fit`.
- [x] 味 taste (C): a spoon dips into a pot, lifts to a mouth; the person's eyes widen, they smack their lips and nod (mm!). Built: `taste-spoon`.
- [x] 意 meaning / mind (C): a person scratching their head; a lightbulb above them flickers then switches on bright: they get it. Built: `think-click`.
- [x] 青 blue (C): the sky behind turns from grey to deep blue; a blue wave rolls in under the kanji; a blue bird lands on it. Built: `roller-blue`.
- [x] 並 line up (C): little people run in from both sides and line up in a neat row in front of the kanji, shoulder to shoulder. Built: `line-up`.
- [x] 屋 roof / shop (C): a little shop: a shutter rolls up, a shopkeeper waves from behind the counter, an awning flaps. Built: `shop-open`.
- [x] 閉 close (B): gate already slides shut; add a person ducking inside just before the doors meet, and a click / lock. Built: `gate-shut`.
- [x] 姉 older sister (C): an older girl ties the shoelace of a little one, then takes their hand and leads them along. Built: `sister-help`.
- [x] 場 place / venue (C): a stage with curtains opens; spotlights sweep and land on a spot marked X where a person stands. Built: `playground`.
- [x] 飛 fly (C): the kanji itself sprouts wings (its hooks flap), lifts off and soars up out of the frame, then glides back down. Built: `kanji-wings`.
- [x] 作 make (C): two hands assemble things on a workbench: blocks stack, a hammer taps, and a toy car rolls off finished. Built: `build-toy`.
- [x] 文 sentence / writing (C): a brush writes a line of characters across a scroll that unrolls beside the kanji. Built: `scroll-write`.
- [x] 変 strange / change (C): a frog hops onto the kanji, *poof*, turns into a prince(ss), then back; the kanji jiggles. Built: `frog-prince`.
- [x] 黒 black (C): an ink bottle tips over; black ink floods across and paints the kanji black; a cat's eyes blink in the dark. Built: `soot-puff`.
- [x] 降 descend / fall (C): a person walks down a staircase and steps off the last step; rain starts falling as they reach the bottom. Built: `stairs-down`.
- [x] 習 learn (C): a fledgling on a branch flaps its wings, falls, flaps again, and the third time flies: learning by practice. Built: `learn-fly`.
- [x] 弟 younger brother (C): a small kid tries to keep up behind a bigger one, tugging their sleeve, bouncing to see over. Built: `little-follow`.
- [x] 部 section / part (C): a cake is sliced into four; one slice slides out and away from the others. Built: `cake-slice`.
- [x] 全 whole / all (C): puzzle pieces fly in and fill a frame until the last one clicks in; the whole picture glows. Built: `puzzle-fill`.
- [x] 体 body (C): a person stretches: arms up, touches toes, twists; their outline glows part by part (head, arms, legs). Built: `body-stretch`.
- [x] 字 letter / character (C): wooden letter blocks drop in a row and spell something, a child points at each in turn. Built: `letter-blocks`.
- [x] 通 pass through (C): a train runs through a tunnel mouth beside the kanji: in one side, out the other, lights flickering past. Built: `walk-through`.
- [x] 空 sky / empty (C): a bird cage door opens, the bird flies out into the blue sky; the cage is left empty. Built: `cage-open`.
- [x] 渡 cross (B): river and bridge already there; add a person walking over the bridge from one bank to the other. Built: `bridge-walk`.
- [x] 紙 paper (C): a sheet of paper flutters down, folds itself into a paper plane in three folds and glides away. Built: `paper-fold`.
- [x] 夏 summer (C): a person under a blazing sun fans themselves, then licks an ice cream that melts and drips. Built: `ice-melt`.
- [x] 庭 garden (C): a person waters a little garden plot; flowers pop up one by one in rows, a butterfly visits. Built: `garden-water`.
- [x] 夕 evening (C): the sun sets into the sea, painting it orange; a crow flies home across it; the first star. Built: `home-time`.
- [x] 御 honourable (C): a person bows deeply and offers a gift box with both hands (polite). Built: `gift-bow`.
- [x] 黄 yellow (C): a chick hatches and fluffs up bright yellow; a banana peels itself beside it. Built: `yellow-things`.
- [x] 靴 shoes (C): a pair of shoes walks in by themselves, a foot steps into one, laces tie themselves. Built: `shoe-step`.
- [x] 曇 cloudy (C): fat grey clouds drift in and cover the sun one by one; the light dims; the sun peeks out and is covered again. Built: `clouds-gather`.
- [x] 誰 who (C): a door with a knock-knock; it opens a crack and a silhouette peeks out; a big "?" over it. Built: `knock-door`.
- [x] 広 wide (C): two hands grab the kanji's sides and stretch it wide; a field unrolls behind it to the horizon. Built: `stretch-wide`.
- [x] 背 back / height (C): two kids stand back to back, measuring height; a ruler slides down onto their heads. Built: `back-to-back`.
- [x] 無 nothing (C): a box is opened and turned upside down, shaken: nothing falls out; the kanji poofs to nothing and back. Built: `empty-box`.
- [x] 理 reason (C): two gears that do not turn; a hand slots in the missing middle gear and all three turn together: it makes sense. Built: `gears-click`.
- [x] 段 steps (C): the kanji's strokes rearrange into a staircase; a ball bounces down it step by step. Built: `ball-steps`.
- [x] 図 map / drawing (C): a map unrolls on the ground; a dotted path draws itself across it to an X. Built: `map-unroll`.
- [x] 館 large building (C): a big columned hall rises out of the ground behind the kanji; doors open, people walk in. Built: `hall-rise`.
- [x] 使 use (C): a hand picks up a tool (a spoon), uses it to scoop, then puts it back on its hook. Built: `tool-use`.
- [x] 強 strong (C): a person lifts a heavy barbell over their head easily and flexes (the opposite of 重's struggle). Built: `barbell-flex`.
- [x] 交 mingle / cross (C): two cars come from left and right and cross at a junction under the kanji, passing each other. Built: `car-cross`.
- [x] 差 difference (C): two towers of blocks side by side; one grows taller; a ruler measures the gap between them. Built: `tower-gap`.
- [x] 度 degrees / times (C): a thermometer beside a person rises a notch each time they shiver (1, 2, 3 times). Built: `jump-rope`.
- [x] 機 machine (C): a little machine with gears and a conveyor: a ball goes in one side, gets pressed, comes out a cube. Built: `factory-press`.
- [x] 建 build (C): bricks fly in and stack into a wall; a crane lowers the roof on top. Built: `brick-build`.
- [x] 音 sound (C): a bell swings and rings; sound rings ripple out; a person turns their head and cups their ear. Built: `bell-ring`.
- [x] 用 use / errand (C): a person with a shopping list ticks items off as they pop into their basket. Built: `errand-run`.
- [x] 持 hold / have (C): a hand reaches down and lifts a bag by its handle, then holds it up, swinging. Built: `bag-carry`.
- [x] 点 point / dot (C): a pen dots four points under the kanji (its 灬 dots), then a pointer taps one and it glows. Built: `dot-point`.
- [x] 向 face towards (C): a person standing with their back to you turns round to face you, then turns and points "over there". Built: `turn-around`.
- [x] 重 heavy (C): pilot, built. Built: `lift-heavy`.
- [x] 違 different (C): pilot, built. Built: `odd-one-out`.
- [x] 立 stand up (B): the kanji lies flat and springs upright; add a person who gets up from sitting at the same moment, with dust. Built: `stand-up`.
- [x] 計 measure / plan (C): a hand moves a tape measure along the kanji; numbers count up; a clock hand ticks round (時計). Built: `tape-measure`.
- [x] 再 again (C): a ball rolls off a table and falls, then rewinds and does it again, and again. Built: `rewind-ball`.
- [x] 店 shop (C): a shop counter: a customer hands over a coin, the shopkeeper hands back a bag; the till dings. Built: `shop-counter`.
- [x] 要 need (C): a person in the rain pats their pockets, panics; an umbrella drops into their hand just in time. Built: `phone-charge`.
- [x] 服 clothes (C): a T-shirt and trousers fly off a hanger onto a person, who twirls to show them off. Built: `wardrobe-dress`.
- [x] 画 picture (C): an easel; a brush paints a sun and a hill on the canvas; a frame drops round it. Built: `easel-paint`.
- [x] 映 project / reflect (C): a projector beam lights a screen behind the kanji and the kanji's shadow plays on it. Built: `projector`.
- [x] 料 materials / fee (C): ingredients drop into a pot one by one (carrot, fish, rice), a ladle stirs, steam rises. Built: `pot-cook`.
- [x] 乗 ride (C): a person climbs onto a bus that pulls up beside the kanji; it drives off with them waving. Built: `bus-ride`.
- [x] 熱 hot / fever (C): a person with a thermometer in their mouth; it shoots up red, steam puffs from their ears. Built: `fever`.
- [x] 筆 writing brush (C): a brush dips into ink and writes a stroke with a flourish, flicking ink. Built: `brush-enso`.
- [x] 牛 cow (C): a cow walks in, chewing; it moos (a big "moo" ring) and a milk pail fills. Built: `cow-moo`.
- [x] 皿 dish (C): pilot, built. Built: `stack-plates`.
- [x] 心 heart (C): a heart beats inside a person's chest, glowing brighter; they hug themselves happily. Built: `heart-beat`.
- [x] 親 parent (C): a big person holds a small one's hand and watches over them from a little behind (standing on the tree 木 to see). Built: `parent-watch`.
- [ ] 美 beautiful (C): a flower opens; sparkles; a person gasps with hands on their cheeks.
- [ ] 最 most (C): three people race up to a podium; the winner climbs the top step and lifts a trophy.
- [ ] 面 face / mask (C): a mask lifts off the kanji's middle; underneath, a face winks.
- [ ] 売 sell (C): a stall: a seller holds up an apple and calls out, a buyer hands a coin, the apple goes over.
- [ ] 始 begin (C): runners on a line; a flag drops and they dash off (the start), dust flying.
- [ ] 終 end (C): a runner breaks the finish tape (chequered flag); they slow and collapse, finished; a curtain falls.
- [ ] 住 live / dwell (C): a person carries a box into a little house; the window lights up, smoke from the chimney: they live there now.
- [ ] 転 roll / turn over (C): a person on a bike wobbles and falls over (tumbles), the wheel spinning.
- [ ] 病 ill (C): a person in bed with a red nose, sneezing; a thermometer and a bowl of medicine on the side.
- [ ] 院 institution / hospital (C): an ambulance pulls up at a building with a red cross; the doors open.
- [ ] 遠 far (C): a person waves goodbye and walks away down a long road, smaller and smaller until a dot (the mirror of 近).
- [ ] 同 same (C): two people side by side do exactly the same moves at the same time, like a mirror.
- [ ] 夫 husband (C): a groom and bride stand together; rings slide onto fingers; confetti.
- [ ] 丈 length / sturdy (C): a tape measure pulls out along the kanji, longer and longer; a sturdy post doesn't budge when kicked.
- [ ] 起 wake up (C): an alarm clock rings and hops; a person in bed bolts upright, hair sticking out.
- [ ] 帰 return home (C): a person walks home along a path at dusk; the house door opens and light spills out to greet them.
- [ ] 遅 slow / late (C): a snail and a person race; the snail is hopelessly behind; a clock spins: late!
- [ ] 汚 dirty (C): a person in clean clothes steps in a puddle; mud splashes all over them and the kanji.
- [ ] 問 question / ask (C): a person at the gate (門) knocks, a speech bubble with "?" pops out of the mouth (口).
- [ ] 題 topic / title (C): a sheet of paper; a title writes itself in big letters at the top, underlined.
- [ ] 宿 inn (C): a sleepy traveller with a suitcase walks into a little inn; a bed, the light switches off, "zzz".
- [ ] 取 take (C): a hand reaches in, grabs an apple off a table and pulls it away (the table is left empty).
- [ ] 真 true (C): a magnifier over a gem: it sparkles real; a fake beside it cracks.
- [ ] 写 copy / photo (C): a person poses, a camera flashes, a photo slides out and develops into the same picture.
- [ ] 洋 ocean / western (C): big waves roll across; a ship sails over the horizon.
- [ ] 旅 travel (C): a person with a backpack and a suitcase walks along a road past changing scenery (a mountain, the sea).
- [x] 押 push (C): pilot, built. Built: `push`.
- [ ] 泳 swim (C): a person swims across a pool in front of the kanji (arms windmilling), splashes, a dive.
- [ ] 鳴 chirp / cry (C): a bird on the kanji opens its beak and sings; notes rise; another bird answers.
- [ ] 暖 warm (C): a person by a stove holds out their hands; frost on them melts; they smile and relax.
- [ ] 温 warm (water) (C): a person lowers into a hot spring tub, steam rises, they sigh "ahh" (onsen).
- [ ] 両 both (C): a person lifts two buckets at once, one in each hand, balanced.
- [ ] 運 carry / luck (C): a person pushes a wheelbarrow loaded with boxes along; a four-leaf clover falls in.
- [ ] 台 stand / platform (C): a little stand is set down and a vase is placed on it; a person steps up on a stage block.
- [ ] 有 have (C): a hand opens to show a coin, closes over it and keeps it (it is mine).
- [ ] 仕 serve (C): a waiter carries a tray with a cup, bows and serves it on a table.
- [ ] 答 answer (C): a hand shoots up in class; a speech bubble with a big check mark pops; the teacher nods.
- [ ] 悪 bad (C): a little devil sneaks up, knocks over a vase, and snickers; it shatters.
- [ ] 太 thick / fat (C): a person eats a cake and puffs up rounder and rounder; a belt pings off.
- [ ] 辞 word / dictionary (C): a thick book opens, pages flip; a word lifts out of a page and glows.
- [ ] 返 return (C): a boomerang flies out in a loop and comes back to the hand that threw it.
- [ ] 覚 memorize (C): a person reads a book; the picture from the page floats into their head and stays there (a lightbulb).
- [ ] 業 work / business (C): a person at a desk types; papers stack up; a clock spins; a factory chimney puffs.

## Words (177, Step 2 kanji)
Grades: **B** when the meaning *is* its kanji side by side (a word rule that does not repeat a kanji's emblem);
**C** when it needs its own scene, as a vignette option of its kanji's scene or a scene of its own.

- [x] 食べ物 food (C): plates of different foods slide in one after another (onigiri, fish, apple), a fork stabs one. Built: `food-row`.
- [x] 買い物 shopping (C): a person with a basket walks along a shelf, items hop into the basket, they pay. Built: `shop-basket`.
- [x] 荷物 luggage (C): a person staggers under a pile of suitcases and bags, the top one wobbles. Built: `luggage-pile`.
- [x] 果物 fruit (C): a fruit bowl fills: an apple, a banana and grapes drop in. Built: `fruit-bowl`.
- [x] 飲み物 drink (C): a cup fills from a pitcher; a straw pops in and the level goes down. Built: `drink-straw`.
- [x] 大切 important (C): a person hugs a treasure box tight, a heart over it. Built: `hug-treasure`.
- [x] 切る cut (C): 切's knife scene, option: chopping a carrot into rounds. Built: `chop-split:carrot`.
- [x] 切符 ticket (C): a ticket pops out of a machine slot, a hand takes it, a gate opens. Built: `ticket-gate`.
- [x] 切手 stamp (C): a stamp is licked and pressed onto an envelope corner, thump. Built: `stamp-letter`.
- [x] 今朝 this morning (B): 朝's sunrise with a "now" clock face. Kept.
- [x] 毎朝 every morning (B): three small sunrises one after another (each morning). Kept.
- [x] 朝ごはん breakfast (C): toast pops out of a toaster in the sunrise, an egg fries. Built: `toaster`.
- [x] 着る wear (C): 着's scene, option: buttoning up the coat. Built: `coat-on:wear`.
- [x] 上着 jacket (C): a jacket on a hanger slides off and wraps around a person. Built: `coat-on:jacket`.
- [x] 着く arrive (C): a train pulls into a station and stops; a person steps off. Built: `train-arrive`.
- [x] 色々 various (B): many small coloured shapes popping in one after another (no rainbow emblem). Built: `confetti-shapes`.
- [x] お茶 tea (C): 茶's scene, option: a bow and two hands offering the cup. Built: `tea-pour:serve`.
- [x] 紅茶 black tea (C): a teabag dunks into a cup, red-brown colour spreads. Built: `teabag`.
- [x] 茶碗 rice bowl (C): a bowl on a hand, rice heaped into it. Built: `bowl-spin`.
- [x] 茶色 brown (B): the kanji turns from green to brown, leaves dry. Built: `paint-pour`.
- [x] 毎晩 every night (B): moon rising three times, a calendar ticking. Kept.
- [x] 今晩 tonight (B): the sun dips and the moon rises right now (a clock pointing). Kept.
- [x] 家族 family (C): a parent, a child and a dog come out of a house and stand together, waving. Built: `family-wave`.
- [x] 動物 animal (C): a dog, a cat and a bird walk across in a parade. Built: `animal-parade`.
- [x] 自分 myself (C): a person points at their own nose, then pats their chest (自's scene, option). Built: `me-spotlight`.
- [x] 自動車 car (C): a car drives in by itself, honks, parks. Built: `car-park`.
- [x] 洗う wash (C): 洗's scene, option: washing hands under a tap. Built: `hand-wash`.
- [x] 洗濯 laundry (C): a washing machine drum spins clothes, then shirts hang on a line flapping. Built: `laundry`.
- [x] お手洗い toilet (C): a door with a sign, a person dashing in, the sound of a flush, hand washing. Built: `toilet-dash`.
- [x] 昨日 yesterday (C): a calendar page flips back a day while the sun runs backwards. Built: `calendar-back:1 days`.
- [x] 一昨日 day before yesterday (C): the same, two pages back. Built: `calendar-back:2 days`.
- [x] お兄さん older brother (C): 兄's scene, option: big brother carries the little one piggyback. Built: `big-brother:piggyback`.
- [x] 赤い red (B): the word's kana and kanji flush red one by one (no splash). Built: `traffic-red`.
- [x] 本当 truth (C): a person tells a story; a fake mask falls off a second person and their real face smiles; a green check. Built: `mask-off`.
- [x] お弁当 lunch box (C): a lunch box lid opens to show rice, egg, sausage; chopsticks pick. Built: `bento-open`.
- [x] 近い near (C): 近's scene, option: two people standing close, nearly touching. Built: `come-near:face`.
- [x] 近く neighbourhood (C): little houses gather round a person's house; a map pin with a circle around it. Built: `neighbourhood`.
- [x] 消す erase (C): 消's eraser rubbing out. Built: `switch-off`.
- [x] 消える disappear (C): a candle flame goes out by itself, smoke curls. Built: `candle-out`.
- [x] 開ける open (C): a hand opens a box lid; a present pops out. Built: `gift-open`.
- [x] 教室 classroom (C): a classroom: desks, a blackboard, kids filing in and sitting. Built: `classroom-kids`.
- [x] 教える teach (C): 教's scene, option: the teacher points and the pupil nods. Built: `teach-board:あいう`.
- [x] 言葉 language (C): speech bubbles with different scripts float out of two mouths. Built: `talk-bubbles`.
- [x] 葉書 postcard (C): a postcard with a picture flips over, is written on, dropped into a postbox. Built: `postcard-post`.
- [x] 昼ご飯 lunch (C): at noon sun, a person opens a lunch box at a desk. Built: `noon-sun:eat`.
- [x] 楽しい fun (C): kids on a merry-go-round, laughing, going round. Built: `merry-go-round`.
- [x] 一番 first (C): a race: one runner breaks the tape, a "1" medal. Built: `race-win`.
- [x] 番号 number (C): a keypad; fingers press 1-2-3, the numbers light. Built: `keypad`.
- [x] 風邪 cold (illness) (C): a person sneezes (ah-choo!), a tissue flies, a red nose. Built: `sneeze`.
- [x] お風呂 bath (C): a person in a tub with bubbles and a rubber duck. Built: `bath-tub`.
- [x] 地下鉄 subway (C): the ground cuts away to show a train running in a tunnel underneath. Built: `subway-cut`.
- [x] 初め beginning (C): a book opens on page 1; a little "start" flag. Built: `book-one`.
- [x] 初めて first time (C): 初's egg scene, option: the chick's first wobbly step. Built: `egg-hatch:step`.
- [x] 引く pull (C): 引's rope scene, option: pulling open a drawer. Built: `rope-pull:drawer`.
- [x] 止まる stop (C): 止's scene, option: a car stops at a red light. Built: `stop-sign:car`.
- [x] 歌う sing (C): 歌's scene, option: a person singing in the shower with notes. Built: `sing-mic:shower`.
- [x] 晴れ clear weather (C): a weather board flips from cloud to sun. Built: `weather-board`.
- [x] 晴れる clear up (C): 晴's scene, option: rain stops and clouds part. Built: `clouds-part:rainbow`.
- [x] 嫌い dislike (C): 嫌's scene, option: a cat recoils from a cucumber. Built: `refuse-spoon:stink`.
- [x] 冷蔵庫 fridge (C): a fridge door opens, cold mist pours out, a hand takes milk. Built: `fridge`.
- [x] 冷たい cold (to touch) (C): a hand touches an ice cube and jerks back, shaking. Built: `touch-ice`.
- [x] 意味 meaning (C): a person reads a word, a lightbulb goes on and a picture of the thing pops up. Built: `word-picture`.
- [x] 青い blue (B): the word turns blue like the sea beneath it. Built: `roller-blue:balloon`.
- [x] 並ぶ line up (C): 並's scene, option: people queue at a door. Built: `line-up:height`.
- [x] 並べる line up (things) (C): a hand sets cups in a neat row. Built: `arrange-row`.
- [x] 八百屋 greengrocer (C): a stall of vegetables; a hand picks a carrot and a radish. Built: `shop-open:veg`.
- [x] 閉める close (C): a hand shuts a window with a slam, the curtain swings. Built: `window-shut`.
- [x] 閉まる be shut (C): 閉's gate scene, option: a shop's shutter rolls down by itself. Built: `shop-open:closed`.
- [x] お姉さん older sister (C): 姉's scene, option: braiding the little one's hair. Built: `sister-help:hair`.
- [x] 飛ぶ fly (C): 飛's scene, option: a bird lifts off a branch. Built: `paper-plane`.
- [x] 作る make (C): 作's scene, option: hands shape a clay pot on a wheel. Built: `snowman`.
- [x] 作文 composition (C): a pencil writes lines on a page, a title at the top, a gold star. Built: `essay-star`.
- [x] 文章 writing (C): paragraphs of lines write themselves on a page. Built: `scroll-write:これはぶんしょうです。`.
- [x] 大変 very / terrible (C): a person juggles too many plates, everything wobbles, they crash. Built: `juggle-crash`.
- [x] 黒い black (B): ink pours over the word. Built: `black-cat`.
- [x] 降りる get off (C): a person steps down off a bus. Built: `bus-off`.
- [x] 降る fall (rain) (C): rain starts falling from a cloud onto an umbrella. Built: `rain-umbrella`.
- [x] 練習 practice (C): a person kicks a ball against a wall again and again. Built: `practice-kick`.
- [x] 習う take lessons (C): a teacher plays a note on a piano, a kid copies it. Built: `piano-lesson`.
- [x] 兄弟 siblings (C): big brother and little brother play catch. Built: `play-catch`.
- [x] 部屋 room (C): a door opens into a cosy room with a bed and a lamp. Built: `my-room`.
- [x] 全部 all (C): a hand sweeps every coin on a table into a jar. Built: `sweep-all`.
- [x] 漢字 kanji (C): a brush writes a kanji on paper; it lifts off and glows. Built: `letter-blocks`.
- [x] 字引 dictionary (C): a finger runs down a dictionary page and stops on a word. Built: `dictionary`.
- [x] 渡す hand over (C): one hand passes a parcel to another. Built: `hand-over`.
- [x] 渡る cross (C): 渡's scene, option: a person crosses a zebra crossing. Built: `bridge-walk:zebra`.
- [x] 手紙 letter (C): an envelope opens, a letter unfolds, a heart. Built: `paper-fold:letter`.
- [x] 夏休み summer holiday (C): a beach umbrella, a person relaxing in a chair, a crab scuttles by. Built: `beach-day`.
- [x] 家庭 home / household (C): a family at a dinner table, a lamp overhead. Built: `house-heart`.
- [x] 夕方 dusk (B): the sun touching the horizon (no clock). Built: `home-time:clock`.
- [x] 夕飯 dinner (C): a family table at sunset, a steaming pot is set down. Built: `dinner-table`.
- [x] 御飯 cooked rice (C): a rice cooker lid lifts, steam, a scoop of rice. Built: `rice-cooker`.
- [x] 晩御飯 dinner (C): a dinner table under a hanging lamp, night window. Built: `dinner-table`.
- [x] 黄色 yellow (B): the word turns yellow, a lemon rolls under it. Built: `yellow-things:crayon`.
- [x] 黄色い yellow (B): yellow paint drips down from the top of the word. Built: `yellow-things:hat`.
- [x] 靴下 socks (C): a sock is pulled onto a foot, toes wiggle. Built: `shoe-step:socks`.
- [x] 曇り cloudy (B): grey clouds drift over the word (no sun emblem). Built: `clouds-gather:grey`.
- [x] 曇る cloud over (C): 曇's scene, option: a mirror fogs up. Built: `fog-glass`.
- [x] 誰か someone (C): footsteps, a shadow appears behind a door frosted glass. Built: `knock-door:window`.
- [x] 広い spacious (C): 広's scene, option: a person spreads their arms in a huge empty room. Built: `room-expand`.
- [x] 背広 business suit (C): a suit on a hanger, a tie knots itself. Built: `suit-up`.
- [x] 無くす lose (C): a person pats their pockets, the keys are gone; they look everywhere. Built: `lost-key`.
- [x] 階段 stairs (C): a person climbs a staircase step by step. Built: `ball-steps:climb`.
- [x] 段々 gradually (C): a plant grows a little each frame, a sun crossing faster. Built: `snail-climb`.
- [x] 地図 map (C): 図's map scene, option: a person turns the map upside down, confused. Built: `map-read`.
- [x] 図書館 library (C): tall bookshelves; a person takes a book and sits to read; "shh". Built: `library-shelf`.
- [x] 使う use (C): 使's scene, option: using scissors to cut paper. Built: `tool-use:scissors`.
- [x] 大使館 embassy (C): a building with a flag on a pole that rises. Built: `hall-rise:embassy`.
- [x] 勉強 study (C): a person at a desk with books, a lamp, writing; pages turn. Built: `study-desk`.
- [x] 強い strong (C): 強's scene, option: arm-wrestling and winning. Built: `barbell-flex:car`.
- [x] 交番 police box (C): a little police box; an officer steps out and salutes. Built: `police-box`.
- [x] 差す hold up (umbrella) (C): rain starts, a hand opens and raises an umbrella. Built: `parasol-up`.
- [x] 丁度 exactly (C): a ball rolls and stops exactly on the line; a check. Built: `stopwatch-exact`.
- [x] 飛行機 aeroplane (C): a plane taxis, takes off and climbs over the word. Built: `plane-takeoff`.
- [x] 建物 building (B): buildings rising behind the word (no emblem). Built: `brick-build:tower`.
- [x] 音楽 music (C): a band: drum, guitar, notes streaming. Built: `headphones-dance`.
- [x] 持つ hold (C): 持's scene, option: a hand holds a balloon by its string. Built: `bag-carry:balloon`.
- [x] 交差点 intersection (C): a crossroads seen from above with cars taking turns at the lights. Built: `car-cross:scramble`.
- [x] 向こう other side (C): a person on one bank waves to someone on the far side of a river. Built: `turn-around:across`.
- [x] 重い heavy (C): 重's scene, option: a person dragging a huge suitcase. Built: `drag-suitcase`.
- [x] 違う differ (C): 違's scene, option: two pictures side by side, a circle marks the difference. Built: `spot-difference`.
- [x] 立つ stand (C): 立's scene, option: a person stands up from a chair. Built: `stand-up:toddler`.
- [x] 時計 clock (C): a wall clock ticking, the hands sweep, a cuckoo pops out. Built: `cuckoo-clock`.
- [x] 再来年 year after next (B): two calendar years flip forward (2 years). Built: `year-hop`.
- [x] 喫茶店 coffee shop (C): a café table, a cup of coffee with steam, a cake. Built: `shop-counter:cafe`.
- [x] 要る need (C): 要's scene, option: someone needs a key to open a door. Built: `phone-charge:water`.
- [x] 映画 movie (C): a film reel spins and a projector shows a little movie on a screen. Built: `projector:popcorn`.
- [x] 映画館 cinema (C): rows of seats, the lights dim, popcorn. Built: `hall-rise:cinema`.
- [x] 料理 cooking (C): a frying pan, a flip of the food, flames. Built: `pot-cook:pan`.
- [x] 乗る ride / get on (C): 乗's scene, option: a person hops onto a bicycle. Built: `bus-ride:bike`.
- [x] 熱い hot (to touch) (C): a hand touches a hot pan, jerks away, steam. Built: `fever:touch`.
- [x] 鉛筆 pencil (C): a pencil sharpens itself and draws a line. Built: `brush-enso:pencil`.
- [x] 万年筆 fountain pen (C): a pen's cap clicks off, it writes a curly signature. Built: `brush-enso:pen`.
- [x] 牛乳 milk (C): milk pours into a glass from a carton, a cow moos. Built: `cow-moo:milk`.
- [x] 牛肉 beef (C): a steak sizzles on a grill. Built: `cow-moo:steak`.
- [x] 灰皿 ashtray (C): a dish with ash, a cigarette stubbed out with smoke curling. Built: `ashtray`.
- [x] お皿 plate (C): 皿's scene, option: plates washed and stacked. Built: `stack-plates:dry`.
- [ ] 美味しい delicious (C): a person takes a bite, their face lights up, sparkles, a thumbs up.
- [ ] 面白い interesting / funny (C): a person reading laughs so hard they roll over.
- [ ] 売る sell (C): 売's scene, option: a "sold" sign stamped on an item.
- [ ] 始まる begin (C): 始's scene, option: curtains open on a stage.
- [ ] 終わる end (C): 終's scene, option: "The End" on a screen, curtains close.
- [ ] 住む live (C): 住's scene, option: a bird builds a nest and settles in it.
- [ ] 自転車 bicycle (C): a person pedals a bicycle across, bell ringing.
- [ ] 病気 illness (C): 病's scene, option: germs bounce around a sneezing person.
- [ ] 病院 hospital (C): a doctor with a stethoscope listens to a patient's chest.
- [ ] 遠い far (C): 遠's scene, option: binoculars looking at a far mountain.
- [ ] 同じ same (C): 同's scene, option: two identical cats sit side by side.
- [ ] 大丈夫 all right (C): a person trips, gets up, gives a thumbs up: OK!
- [ ] 丈夫 sturdy (C): a person stands firm in strong wind and doesn't budge.
- [ ] 起きる get up (C): 起's scene, option: stretching out of bed.
- [ ] 帰る go home (C): 帰's scene, option: "I'm home" at the door, shoes off.
- [ ] 遅い slow (C): 遅's scene, option: a tortoise plods.
- [ ] 汚い dirty (C): 汚's scene, option: a dog shakes mud everywhere.
- [ ] 質問 question (C): a hand goes up in a crowd, a "?" bubble.
- [ ] 問題 problem (C): a maths problem on a board, a person scratching their head.
- [ ] 宿題 homework (C): a person at a desk at night with a pile of worksheets.
- [ ] 取る take (C): 取's scene, option: picking a cookie from a jar.
- [ ] 写真 photo (C): 写's scene, option: a selfie with a peace sign.
- [ ] 洋服 western clothes (C): a dress and a suit on a rack, a person tries one on.
- [ ] 旅行 trip (C): a suitcase rolls along, stickers of places appear on it.
- [x] 押す push (C): 押's scene, option: a finger presses a big button, it lights. Built: `button-press`.
- [ ] 泳ぐ swim (C): 泳's scene, option: a fish swims by.
- [ ] 鳴く cry (animal) (C): 鳴's scene, option: a cat meows, a dog barks.
- [ ] 暖かい warm (weather) (C): spring sun; snow melts and flowers come up.
- [ ] 温い lukewarm (C): a hand tests bath water, makes a "meh" face, so-so.
- [ ] 両親 parents (C): a mum and dad each hold a hand of a child, swing them.
- [ ] 台所 kitchen (C): a stove and a sink; a pot boils, a person chops.
- [ ] 有名 famous (C): a person on a red carpet, camera flashes, autographs.
- [ ] 仕事 work / job (C): a person at a desk typing, coffee, papers stacking.
- [ ] 答える answer (C): 答's scene, option: answering a phone call.
- [ ] 悪い bad (C): 悪's scene, option: a thumbs down.
- [ ] 太い thick (C): 太's scene, option: a thin pencil and a fat crayon side by side.
- [ ] 辞書 dictionary (C): 辞's scene, option: the book slams shut.
- [ ] 返す return (thing) (C): 返's scene, option: a borrowed book is handed back.
- [ ] 覚える memorize (C): 覚's scene, option: flashcards flip, one sticks in the head.
- [ ] 授業 lesson (C): 教室 set, the teacher writes on the board, a bell rings.

## Notes for later batches
- Props built so far (`src/effects/pieces/kit-*.js`; look at them with the "kit" vignette):
  - kit-hand / kit-person: an articulated hand (open, grip, point, thumbs up, pinch, flat) and a person (walk, lean,
    raise, face; squat, sit and lie by posing the bones).
  - kit-things: hammer, a nail that bends, board, plate, ball, heart, star burst, dizzy stars, and `many()` (one small
    shape many times in one draw call: dust, sweat, hearts, steam, rain).
  - kit-props: `emblemProp` (any of the ~100 emblem shapes as a prop: cup, car, train, bird, cow, letter, gem ...),
    `textPlane` / `liveText` (a number, chalk, a sign), `veil` (dusk falling), a box with flaps, teapot, teacup, bowl,
    chopsticks, cleaver, apple, sponge, bucket, target, dart, map pin, signpost, eraser, clipboard, hat, wheel, leaf,
    blackboard, stick, calendar pad.
  - Scenes build one-offs inline when nothing fits (a house, a tap, a washing machine, a traffic light).
- Helpers (`vignettes/helpers.js`): `poseGlyph` (shift / turn / squash the kanji about any point), `handTo` (put a hand
  so its grip or fingertip lands on a point), `bonePoint` (where a hand or head is), `arc` (a throw), `wisps` (steam,
  smoke), `puffs` (dust).
- Lessons from Batch 1: build props 1.5-2x the size that looks right in the close-up (they must read from the seat);
  from eye level a flat thing on the ground is edge-on (tip plates, cups, shadows towards you); the meaning label
  covers the ground just under the kanji; words with 3-4 glyphs have small glyphs, so actors are sized to at least a
  kanji card's glyph height (`stage.u`) and recipes use `size` 1.0 (2-glyph words 1.2).
- Pairs that mirror each other share a prop but never an action: 押 / 引 (push vs pull a rope), 近 / 遠 (walk in vs walk
  away), 重 / 強 (fails to lift vs lifts easily), 開 / 閉, 始 / 終, 消す / 消える.
- Step 1's 112 kanji get this same pass later. What carries over: the kit, the timeline, and the "kanji takes part"
  tricks (`poseGlyph` in vignettes/people.js turns or shifts the kanji about any point; `stage.offset` moves single
  strokes).
