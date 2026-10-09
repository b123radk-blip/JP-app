# Step 3a prompt: the model pass — real 3D people and animals in the scenes

Continue the Kanji Memory WebXR app in b123radk-blip/JP-app on branch `claude/kanji-3d-galaxy-xr-uoi522` (GitHub Pages
serves it; no new branch, no PR). Read CLAUDE.md (especially "Add a scene (vignette)" and its 3D-model bullet),
docs/ARCHITECTURE.md, docs/MODELS.md, the three newest entries of docs/BATCH-LOG.md and docs/REVAMP.md first.

## Why
Every one of the 835 deck cards now has a scene (Steps 2b and 2c), but every actor in them is built from spheres, boxes
and a hand-made bone rig. Two trials put real glTF models into the scenes (`?preview=1&trial=kenney`,
`?preview=1&trial=quaternius`, Old / New button). The user looked at both in the headset and decided the style:
- **Quaternius for people and animals** (natural low-poly animals, chibi people with their own animations).
- **Kenney for vehicles** (and Kenney is fine for objects and places: furniture, food, buildings, streets).
- **The existing shapes and the glyph itself** for everything abstract (numbers, time, directions, "maybe", "please").

This step brings that style to the deck. The test for every card stays the same: **would someone who has never seen
this kanji guess its meaning from the scene alone?**

## What is in the repo
- `src/effects/models.js` (loader: `createModel(name, { height, width, tint })`, `pose(clip, t, loop)`, `node(name)`),
  `src/effects/model-list.js` (59 models by name), docs/MODELS.md (clips, lengths, draw calls of each; regenerate with
  `node scripts/list-models.mjs --write`).
- Quaternius: 7 animals with 12-13 clips each (shiba cow horse fox deer wolf husky: Idle Walk Gallop Eating Jump Attack
  Death ...), 4 farm animals with Idle and Jump only (pig sheep pug llama), 6 sea creatures that Swim (three fish, whale,
  dolphin, shark), 16 people on one shared rig with 14-15 clips (Idle Walk Run SitDown StandUp PickUp Walk_Carry
  Run_Carry Victory Defeat Jump Roll Punch RecieveHit Death): casual ×6, kimono woman / man, doctor ×2, chef, suit
  man / woman, worker, grandpa, grandma; 15 sushi-restaurant decorations (sakura tree and flower, bamboo, bell, lantern,
  signs with 寿司 / マグロ, paintings, plants, koi banner, carpet).
- Kenney: cube pets (dog chick fish elephant), two mini characters, oak, grass, sedan, tram, track. More Kenney packs
  can be downloaded from here (kenney.nl is reachable; CC0; take only the .glb files used, with the pack's License.txt):
  furniture-kit, food-kit, city-kit-suburban, city-kit-commercial, city-kit-roads, mini-market, holiday-kit, car-kit,
  train-kit, watercraft-kit, nature-kit (page `https://kenney.nl/assets/<name>`, zip link in the page).
- Tools: `scripts/prep-model.mjs` (slim a model: only the clips used, quantized .glb), `scripts/fbx-to-glb.mjs` (FBX ->
  .glb in headless Chromium), `scripts/list-models.mjs`. The trial scenes: `vignettes/models-a.js` (Kenney, `m-*`) and
  `vignettes/models-b.js` (Quaternius, `q-*`); trial recipes in `content/trials/`.
- **Quaternius downloads do not work from this machine** (Google Drive refuses the cloud server, itch.io is blocked).
  If a card needs a model that is not here, ask the user to download it (name the pack page and the exact files) and
  carry on with other cards; never wait idle.
- Known gaps: no cat (猫) and no bird (鳥) in Quaternius style (the itch.io pack "LowPoly Animated Animals" may have
  them), no children (scale an adult down to about 0.7 and say so), and no Quaternius food (the Sushi Restaurant Kit's
  `Food/glTF` folder was not sent). Until they arrive, those cards keep their current scenes.

## The hard part: actions the clips do not have
The people's clips cover walking, running, sitting, carrying, picking up, cheering and slumping. N5 needs far more
verbs (食べる 飲む 話す 読む 書く 聞く 見る 寝る 買う 待つ 会う 教える ...). Build them as **gestures layered on a
clip**: call `pose('Idle', t)` (or another clip) every frame, then turn bones (`node('UpperArmR')`, `LowerArmR`,
`FistR`, `Head`, `Neck`, `Torso`; three.js drops the dots of `UpperArm.R`). `pose()` restores what it wrote, so the
tweak never piles up. Make these a small kit (`src/effects/vignettes/model-kit.js`): `actor(name, h)` (with the skin
tint of models-b.js), and gestures with a 0..1 amount: hand to mouth (eat, drink), cup or bowl in the hand, phone to
ear, wave, bow (お辞儀), nod, head shake, point, hands holding a book open, writing hand, cupped ear, hand over eyes
(looking), lie down asleep. Props travel with a hand via `node('FistR').getWorldPosition()` (or attach the prop to the
bone). Be creative with staging where no clip fits: a scene can show the result of an action (an empty bowl and a happy
face), a before and after, or a second actor reacting.

## Work, in this order (each step leaves `npm test` green; commit and push after each)
1. **Gesture test (go / no-go).** Build `model-kit.js` and three verb scenes as a trial (`content/trials/gestures.json`):
   食べる (w1358280), 飲む (w1169870) and お辞儀 or 会う (w1198180). Frame strips at several moments; fix until they read.
   If gestures look stiff or broken after a real effort, say so plainly in the reply and fall back to clips plus props.
2. **Promote the trial winners.** Into the deck with `scripts/set-recipes.mjs`: the Quaternius versions of 犬 牛 休 歩
   女 医者 走る 座る (`q-*`), the Kenney 車 and 電車 (`m-car-beep`, `m-tram`), and 魚 rebuilt with a Quaternius fish
   (the Kenney cube fish does not match the style). Cards whose trial animal has no Quaternius model (三's chicks, 大きい's
   elephant) keep their current scenes.
3. **Plan the pass.** Find every card whose scene has a person or an animal (`grep -l "createPerson\|createHand"
   src/effects/vignettes/*.js`, animals by name in the scene modules and catalog descriptions; map scene types to cards
   through the recipes). Add a "Model pass (Step 3a)" section to docs/REVAMP.md: one line per card with the model(s) and
   the beats, grouped by family: animals; family members (父 母 兄 姉 ... with grandpa / grandma); occupations
   (医者 先生 学生 会社員 ...); verbs of the body (食べる 飲む 見る 聞く 寝る 起きる 走る 歩く 泳ぐ ...); verbs with
   things (読む 書く 買う 持つ 貸す 借りる ...); people in places (駅 店 病院 学校 ...). Leave abstract cards out.
4. **Batches of about 25 cards**, family by family. New scene types in new modules (`vignettes/q-*.js`, about 300
   lines each; word variants in a `*v.js` module), catalog entries with `VM(dc, desc, [models])`, trial strips, fixes,
   `set-recipes.mjs`; tick them in docs/REVAMP.md, `npm test`, `node scripts/check-piece-costs.mjs vignette`,
   `npm run e2e`, strips into `docs/screenshots/models-*.jpg`, commit, push. Show the first batch's strips in the reply,
   then carry on.
5. **Review and docs.** A contact sheet of every changed card (`OUT=docs/screenshots/models-contact npm run
   preview-shots -- <ids>`), 0 pairs >= 0.72, look-alikes < 0.5, e2e, the full cost check; a BATCH-LOG entry (cards
   changed, scenes built, gestures made, models used and their total download size, what is still missing);
   docs/REVAMP.md "Where to continue"; CLAUDE.md if the workflow changed.

## Lessons from the trials (docs/BATCH-LOG.md)
- Quaternius people have near-black skin and white eye shapes: tint `{ Skin: 0xf0c49c, Face: 0x2a1c18 }`. Vary the
  characters between cards (16 to choose from) so the deck does not show the same person everywhere.
- SitDown is a stool-height pose (hips at 0.18 of the body height): give the sitter a seat about 0.13 high.
- Seen from the seat, a model walking straight right shows its back: turn it 0.5-0.75 rad toward the viewer.
- Floors are seen almost edge-on: tilt roads, ponds and tracks about 0.2-0.6 rad toward the viewer; footprints face you.
- Draw calls = material parts (people 5-6, animals 6-8); keep a scene under about 40 and at most 3 distinct models
  (each person is about 0.5-0.6 MB to load the first time).
- Look at the frames when the beats happen, and zoom (`--cam x,y,d`) on anything that looks off: a person sitting on air,
  a ball not in the mouth, a prop clipping through a hand.

## Constraints
Same as CLAUDE.md: files about 300 lines; tunables in `src/config.js`; scenes deterministic for `seek()` (pure functions
of t: always `pose()` before any bone tweak); no runtime CDNs; never claim headset behaviour. Scenes read from the
learner's seat: actors about a glyph tall, the action within about 1.5 glyph widths of the kanji, nothing faster than
about 0.3 s. Two cards must not share a scene type (similarity). Card ids, meanings, readings and sentences do not
change; only `effect` (and `mnemonic` when the new scene tells a better story). If the session runs short, finish fewer
cards completely rather than many half-way; docs/REVAMP.md says where the next session starts.

## Final message
- What exists: the gesture kit (with an honest verdict on how well gestures work), cards promoted, cards changed.
- Numbers: cards changed per family, scenes built, models used, any model the user should download (pack page + files).
- Four example cards with their beats, and preview links (`https://b123radk-blip.github.io/JP-app/?preview=1&card=<id>`).
- What still needs the user: a headset look (name the cards most worth checking).
- Where the next session continues in docs/REVAMP.md.
