#!/usr/bin/env python3
"""Picks an example sentence for every new card from Tatoeba, with furigana that two analysers agree on.

Setup: the .venv-tts venv (see CLAUDE.md) and `npm run data:fetch && npm run data:build`.
Run:   .venv-tts/bin/python scripts/pick-sentences.py n5        (reads .cache/work/n5-items.json, writes .cache/work/n5-sentences.json)

Per card: candidate sentences that use the word (Tatoeba's headword index, so conjugated forms count) or the kanji; scored
(checked "good" examples first, short, few kanji beyond the level); then each candidate is segmented with SudachiPy
(furigana only over kanji, okurigana split off) and kept only if Open JTalk reads the whole sentence the same way and the
target word is read as on the card. Cards with no passing candidate are listed in the output with the reason.
"""
import json, os, re, sys
from jp_check import TOK as tok, MODE, SUDACHI_VARIANTS, check

LEVEL = sys.argv[1] if len(sys.argv) > 1 else "n5"
work = json.load(open(f".cache/work/{LEVEL}-items.json", encoding="utf-8"))
known = set(work["known"])

hira = lambda s: "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)
kata = lambda s: "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)
strip = lambda s: "".join(c for c in s if c not in "。、，．！？!? 　「」")
is_kanji = lambda c: "㐀" <= c <= "鿿" or c == "々"
BAD = re.compile(r"[A-Za-z0-9０-９Ａ-Ｚａ-ｚ「」『』（）()…〜～]")
NAMES = re.compile(r"トム|メアリー|マイク|ジョン|ケン|ボブ|ジェーン|ナンシー|ジャック|ベティー|ルーシー|ジム|ビル|ポール|メアリ|クミ|マユコ")

sentences = [json.loads(l) for l in open(".cache/derived/sentences.jsonl", encoding="utf-8")]
by_word, by_char, by_surface = {}, {}, {}
for i, s in enumerate(sentences):
    for w in s["words"]:
        by_word.setdefault(w[0], []).append(i)
        by_surface.setdefault(w[2], []).append(i)
    for c in set(s["text"]):
        if is_kanji(c):
            by_char.setdefault(c, []).append(i)

def split_token(surface, reading):
    """One Sudachi token -> segments, furigana only over the kanji part."""
    if not any(is_kanji(c) for c in surface):
        return [{"text": surface}]
    r = hira(reading)
    i = 0
    while i < len(surface) and not is_kanji(surface[i]) and i < len(r) and hira(surface[i]) == r[i]:
        i += 1
    j = 0
    while j < len(surface) - i and not is_kanji(surface[-1 - j]) and j < len(r) - i and hira(surface[-1 - j]) == r[-1 - j]:
        j += 1
    mid, mid_r = surface[i:len(surface) - j], r[i:len(r) - j]
    if not mid or not mid_r or not re.fullmatch(r"[ぁ-ゟー]+", mid_r):
        return None
    out = ([{"text": surface[:i]}] if i else []) + [{"text": mid, "reading": mid_r}] + ([{"text": surface[len(surface) - j:]}] if j else [])
    return out

def segment(text):
    segs = []
    for m in tok.tokenize(text, MODE):
        part = split_token(m.surface(), SUDACHI_VARIANTS.get((m.surface(), m.reading_form()), m.reading_form()))
        if part is None:
            return None
        for p in part:
            if "reading" not in p and segs and "reading" not in segs[-1]:
                segs[-1]["text"] += p["text"]          # merge neighbouring kana / punctuation
            else:
                segs.append(dict(p))
    return segs

def reading_of(segs):
    return strip(kata("".join(s.get("reading", s["text"]) for s in segs)))

def agrees(text, segs):
    ok, _, _, jtalk = check(text, segs)
    return ok, jtalk

def span_reading(segs, start, end):
    """Reading of the characters [start, end) if segment boundaries allow it (None otherwise)."""
    pos, out = 0, ""
    for s in segs:
        a, b = pos, pos + len(s["text"])
        pos = b
        if b <= start or a >= end:
            continue
        if a < start:
            return None
        out += s.get("reading", hira(s["text"]))
    return out

def kana_stem(item):
    """A kana-only word as it may appear in a sentence: the word, or for a verb / i-adjective of 3+ kana its stem (かかり)."""
    w = item["word"]
    return w[:-1] if len(w) > 2 and item["pos"] and re.match(r"^(v|adj-i)", item["pos"][0]) else None

def kana_hit(item, w):
    """The token is the card's kana word: written exactly so, or conjugated (then its dictionary lemma must agree: まず is not まずい)."""
    stem = kana_stem(item)
    if any(is_kanji(c) for c in w[2]):
        return False
    return w[2] == item["word"] or (stem is not None and w[2].startswith(stem) and len(w[2]) <= len(item["word"]) + 3 and w[0] in item["forms"])

def target_ok(item, s, segs):
    """The card's word (or kanji) is read in this sentence the way the card teaches it."""
    if item["type"] == "kanji":
        return True
    furi = item["furigana"]
    if not any("reading" in f for f in furi):                 # a kana-only word: it must be there, written in kana as on the card
        return any(kana_hit(item, w) for w in s["words"])
    last = max(i for i, f in enumerate(furi) if "reading" in f)
    expect = "".join(f.get("reading", hira(f["text"])) for f in furi[:last + 1])
    n = sum(len(f["text"]) for f in furi[:last + 1])
    for w in s["words"]:
        if w[0] in item["forms"]:
            at = s["text"].find(w[2])
            if not any(is_kanji(c) for c in w[2]):
                return False                                  # written in kana here (たぶん for 多分): the learner would not see the kanji
            if not all(c in w[2] for c in item["word"] if is_kanji(c)):
                return False                                  # another spelling of the same entry (速い for 早い, ご飯 for 御飯, 夕べ for 昨夜)
            if at >= 0:
                got = span_reading(segs, at, at + n)
                return got is not None and hira(got).startswith(hira(expect))
    return False

def score(item, s):
    text = s["text"]
    if BAD.search(text) or NAMES.search(text) or TOPICS.search(text) or s["jpn"] in REJECT or not text.endswith(("。", "？", "！")) or len(s["en"]) > 70:
        return None
    if REVIEW["pin"].get(item["id"]) == s["jpn"]:
        return 100
    unknown = sum(1 for c in set(text) if is_kanji(c) and c not in known)
    sc = -abs(len(text) - 11) * 0.35 - unknown * 2.5 + (2 if not unknown else 0) - 4 * used.get(s["jpn"], 0)
    if item["type"] == "word":
        good = any((w[0] in item["forms"] or (item.get("kanaOnly") and kana_hit(item, w))) and w[3] for w in s["words"])
        return sc + (4 if good else 0)
    k = item["kanji"]
    own = [x["id"] for x in item["words"]]
    deck = set(item.get("deckWords", []))
    hits = [w for w in s["words"] if k in w[0] or k in w[2]]
    if any(w[0] == k for w in hits):
        sc += 3 if own else 1
    if any(w[0] in deck for w in hits):                       # the kanji inside one of this deck's own words (学 in 学生)
        sc += 5 + (2 if any(w[0] in deck and w[3] for w in hits) else 0)
    elif not any(w[0] == k for w in hits):
        sc -= 3                                               # only inside words the learner will not meet (八百長)
    return sc

MANUAL = json.load(open("scripts/data/manual-sentences.json", encoding="utf-8"))
REVIEW = json.load(open("scripts/data/sentence-review.json", encoding="utf-8"))
REJECT = {int(k) for k in REVIEW["reject"]}
TOPICS = re.compile(r"殺|死|血|銃|爆|葬|おりもの|戦争|自殺|酔")      # topics that make poor first examples
used = {}                                                           # jpn id -> times used, so cards get different sentences

def with_dict_word(item, text):
    """Segments where the card's own word keeps its dictionary furigana (marked "dict"), the rest from Sudachi. A conjugated
    word (辛くて for 辛い) keeps the furigana of its kanji stem."""
    furi, at = item["furigana"], text.find(item["word"])
    if at < 0:
        last = max((i for i, f in enumerate(furi) if "reading" in f), default=-1)
        furi = furi[:last + 1]
        stem = "".join(f["text"] for f in furi)
        at = text.find(stem) if stem else -1
        if at < 0 or last < 0:
            return None
    n = sum(len(f["text"]) for f in furi)
    before, after = segment(text[:at]) if at else [], segment(text[at + n:])
    if before is None or after is None:
        return None
    word = [dict(f, dict=True) if "reading" in f else {"text": f["text"]} for f in furi]
    return [*before, *word, *after]

def try_sentence(item, s):
    """-> (segments or None, reason)"""
    segs = segment(s["text"])
    if not segs:
        return None, "segmentation failed"
    if item["type"] == "kanji" and not any(item["kanji"] in g["text"] for g in segs):
        return None, "kanji not in a segment"
    ok, jt = agrees(s["text"], segs)
    if ok and target_ok(item, s, segs):
        return segs, ""
    if item["type"] == "word":
        alt = with_dict_word(item, s["text"])
        if alt and agrees(s["text"], alt)[0]:
            return alt, ""
    return None, (f"analysers disagree ({jt})" if not ok else "target read differently")

results, missing = {}, []
for item in work["items"]:
    if item["type"] == "word":
        cand = {i for f in item["forms"] for i in by_word.get(f, [])}
        if item.get("kanaOnly"):                                 # the index files kana words under kanji lemmas (珈琲, 彼の): match what is written
            stem = kana_stem(item)
            for surf, ids in by_surface.items():
                if surf == item["word"] or (stem and surf.startswith(stem) and len(surf) <= len(item["word"]) + 3):
                    cand.update(ids)
    else:
        cand = set(by_char.get(item["kanji"], []))
    scored = sorted(((score(item, sentences[i]), i) for i in cand), key=lambda x: -(x[0] if x[0] is not None else -1e9))
    tried, chosen, why = 0, None, "no candidate sentence in Tatoeba"
    if item["id"] in MANUAL:                                   # a written sentence goes first, through the same checks
        m = MANUAL[item["id"]]
        segs, why = try_sentence(item, {"text": m["text"], "words": [[item.get("word", ""), None, m.get("surface", item.get("word", "")), 0]]})
        if segs:
            results[item["id"]] = {"segments": segs, "en": m["en"], "written": True, "tried": 1}
            continue
        why = f"written sentence failed: {why}"
    for sc, i in scored[:40]:
        if sc is None:
            break
        s = sentences[i]
        tried += 1
        if any(m.part_of_speech()[1] == "固有名詞" for m in tok.tokenize(s["text"], MODE)):
            why = "only sentences with names"; continue            # skip "Tom ..." and other names
        segs, reason = try_sentence(item, s)
        if not segs:
            why = reason; continue
        chosen = {"segments": segs, "en": s["en"], "tatoeba": [s["jpn"], s["eng"]]}
        break
    if chosen:
        chosen["tried"] = tried
        if "tatoeba" in chosen:
            used[chosen["tatoeba"][0]] = used.get(chosen["tatoeba"][0], 0) + 1
        results[item["id"]] = chosen
    else:
        missing.append({"id": item["id"], "card": item.get("word") or item["kanji"], "reason": why, "candidates": len(cand)})

json.dump({"sentences": results, "missing": missing}, open(f".cache/work/{LEVEL}-sentences.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(results)} cards got a verified sentence, {len(missing)} did not")
for m in missing:
    print(f"  {m['card']} ({m['id']}): {m['reason']} [{m['candidates']} candidates]")
