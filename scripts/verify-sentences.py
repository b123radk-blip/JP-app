#!/usr/bin/env python3
"""Cross-checks every example sentence's furigana against two independent Japanese analysers.

Setup (once):  python3 -m venv .venv-tts && . .venv-tts/bin/activate && pip install pyopenjtalk-plus sudachipy sudachidict_core
Run:           python3 scripts/verify-sentences.py          (exit code 1 if any sentence disagrees)

For each sentence the expected reading is built from the card's segments (reading if present, else the kana itself) and must equal
the reading SudachiPy gives for the sentence AND the reading Open JTalk gives. Passing does NOT mean the sentence is natural:
every sentence is still marked needsNativeReview until a person confirms it.
"""
import glob, json, sys
import pyopenjtalk
from sudachipy import dictionary, tokenizer

tok = dictionary.Dictionary().create()
kata = lambda s: "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)
strip = lambda s: "".join(c for c in s if c not in "。、，．！？ 　")
failed = 0
for path in sorted(glob.glob("content/cards/*.json")):
    card = json.load(open(path, encoding="utf-8"))
    for i, s in enumerate(card["sentences"], 1):
        text = "".join(seg["text"] for seg in s["segments"])
        expected = strip(kata("".join(seg.get("reading", seg["text"]) for seg in s["segments"])))
        sudachi = strip("".join(m.reading_form() for m in tok.tokenize(text, tokenizer.Tokenizer.SplitMode.C)))
        jtalk = strip("".join(f["read"] for f in pyopenjtalk.run_frontend(text)))
        ok = expected == sudachi == jtalk
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {card['kanji']} #{i}  {text}  expected={expected}  sudachi={sudachi}  openjtalk={jtalk}")
sys.exit(1 if failed else 0)
