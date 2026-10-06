"""Shared reading check for verify-sentences.py and pick-sentences.py: a sentence passes when the reading built from its
segments equals what SudachiPy AND Open JTalk read (punctuation ignored).

Known analyser quirks are normalised here, each with its reason, instead of rephrasing around them:
- SudachiPy always reads 私 as ワタクシ (its dictionary form); Open JTalk and everyday Japanese use ワタシ. When the card's
  segments say わたし, a ワタクシ from Sudachi on that token is not a disagreement.
- SudachiPy misreads many counters and dates (四つ ヨンツ, 二日 フタカ, 二十日 ニトウカ). A segment marked "dict": true
  carries the card's own word with its reading from JMdict; there Open JTalk must still agree, but Sudachi may differ
  inside that segment (only there: the rest of the sentence must match both analysers).
"""
from sudachipy import dictionary, tokenizer
import pyopenjtalk

TOK = dictionary.Dictionary().create()
MODE = tokenizer.Tokenizer.SplitMode.C
SUDACHI_VARIANTS = {("私", "ワタクシ"): "ワタシ"}

kata = lambda s: "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)
strip = lambda s: "".join(c for c in s if c not in "。、，．！？!? 　「」")

def expected_reading(segments):
    return strip(kata("".join(s.get("reading", s["text"]) for s in segments)))

def sudachi_reading(text, expected=None):
    out = ""
    for m in TOK.tokenize(text, MODE):
        r = m.reading_form()
        alt = SUDACHI_VARIANTS.get((m.surface(), r))
        if alt and expected is not None and strip(out + alt) == expected[:len(strip(out + alt))]:
            r = alt
        out += r
    return strip(out)

def jtalk_reading(text):
    return strip("".join(f["read"] for f in pyopenjtalk.run_frontend(text)))

def check(text, segments):
    """-> (ok, expected, sudachi, jtalk)"""
    e = expected_reading(segments)
    s, j = sudachi_reading(text, e), jtalk_reading(text)
    if e == s == j:
        return True, e, s, j
    if e == j and any(g.get("dict") for g in segments):
        # Sudachi may differ only inside the dictionary-backed segment(s): same reading before and after them
        i = next(k for k, g in enumerate(segments) if g.get("dict"))
        k = max(k for k, g in enumerate(segments) if g.get("dict"))
        before, after = expected_reading(segments[:i]), expected_reading(segments[k + 1:])
        ok = s.startswith(before) and s.endswith(after) and len(s) >= len(before) + len(after)
        return ok, e, s, j
    return False, e, s, j
