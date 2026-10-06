# Roadmap: from 15 cards to 2000-3000

Goal: 2000-3000 cards, built in batches over many sessions. This file says how, so each session can pick up the next
batch without re-deciding. (Assumption: a card = one kanji, so the target is roughly the 2,136 jōyō kanji plus extras. If
"words" means vocabulary such as 日本 or 学生, see "Word cards" below: the plan changes a little, not a lot.)

## Where the time goes per card, and how to cut it

| Step | Today (by hand) | At scale |
|---|---|---|
| Stroke data + components | `build-kanji.mjs <hex>` | batch script: download KanjiVG for a whole level and build (done in seconds) |
| Meaning, readings | written by hand | imported from KANJIDIC2 (EDRDG, CC BY-SA 4.0; attribution in the footer), then trimmed: one short English meaning, the 1-3 most useful readings |
| Example sentence | written, then `verify-sentences.py` | candidates from Tatoeba (CC BY 2.0 FR) that only use kanji the learner already has, scored by length and level, then the same two-analyser check; `needsNativeReview` stays until a person confirms |
| Mnemonic | written | drafted from the components ("a person (亻) next to a tree (木)"), reviewed in batches |
| Animation recipe | designed per card | **drafted automatically** from components and meaning (below), then improved where the preview sheet shows a weak card |
| Voice | VOICEVOX on your PC | unchanged: `npm run voice:list` picks up new cards, `voicevox.mjs generate` renders only the new clips |

## Animations at scale

3000 hand-designed scenes is not realistic, and not needed. Three layers:

1. **Component families (automatic).** Most kanji are built from ~200 common components. Each recurring component gets one
   look and, where it makes sense, a prop: 氵 water + ripples, 木 wood + tree, 日 gold, 亻 skin, 口 rose, 言 paper + speech,
   火/灬 heat + flames, 艹 leaves, 金 gold + glints, 糸 thread, 心 heart ... A drafted recipe styles every component it
   contains, so 3000 cards start out consistent and readable through their parts (which is also how kanji are learned).
2. **Meaning props (semi-automatic).** A table from meaning words to scene props and emblems (mountain → mountains,
   river → river, see → eye, say → speech, up → arrow:up ...). The drafter picks one; it covers the concrete half of the
   list.
3. **Hand-made specials (manual).** For the cards the preview sheet shows as weak, and for the learner's look-alike pairs,
   design a stronger recipe or a new prop, as in this pilot. New props are cheap once the slot exists (~30-60 lines each).

Guards that keep this honest at any size: the similarity check (also against a list of **look-alike kanji** such as
土/士, 未/末, 人/入, 己/已, which should get maximally different animations), the per-card performance budget, and the
preview sheet per batch.

## Batches

| Batch | Cards | New pieces likely needed |
|---|---|---|
| N5 rest | ~95 | the "missing pieces" of docs/EFFECTS-PLAN.md: road, room, speech, eye, hand, footprints, walk, scale motions |
| N4 | ~170 | more components (彳 糸 言 門), calendar, food, transport props |
| N3 | ~370 | the component families do most of the work; drafter + review |
| N2, N1 | ~1500 | drafter + review; specials only where the sheet shows weakness |

Per batch: build data → draft cards → verify sentences → preview sheet → fix weak / similar cards → voice list → push.
Each session should finish a batch in a usable state (all checks green), so the app keeps working between sessions.

## App limits to watch

- Font subset: grows to ~2500 kanji, about 1-1.5 MB per weight; still fine, maybe split by level later.
- Decks: one file per level; cards and stroke data are already loaded one at a time.
- Study: new cards per day and the session size are in `config.js`; a stats screen and a level picker get useful past N4.
- Progress lives in the browser (export / import exists); with thousands of cards, cloud sync becomes worth adding.

## Word cards (if "words" means vocabulary)

A word card (日本, 学生, 食べる) would reuse the kanji animations: each kanji draws with its own recipe, side by side,
and the word gets its own short scene (e.g. 日本: the sunrise over islands). The SRS, sentences, voice and checks work the
same; the main new work is the card layout and choosing which words come first.
