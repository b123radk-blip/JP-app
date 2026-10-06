#!/usr/bin/env python3
"""Cross-checks every example sentence's furigana against two independent Japanese analysers.

Setup (once):  python3 -m venv .venv-tts && . .venv-tts/bin/activate && pip install pyopenjtalk-plus sudachipy sudachidict_core
Run:           .venv-tts/bin/python scripts/verify-sentences.py [--quiet]     (exit code 1 if any sentence disagrees)

For each sentence the expected reading is built from the card's segments (reading if present, else the kana itself) and must
equal the reading SudachiPy gives for the sentence AND the reading Open JTalk gives (known analyser quirks: scripts/jp_check.py).
Passing does NOT mean the sentence is natural: every sentence stays needsNativeReview until a person confirms it.
"""
import glob, json, sys
from jp_check import check

quiet = "--quiet" in sys.argv
failed = total = 0
for path in sorted(glob.glob("content/cards/*.json")):
    card = json.load(open(path, encoding="utf-8"))
    for i, s in enumerate(card["sentences"], 1):
        text = "".join(seg["text"] for seg in s["segments"])
        ok, e, su, jt = check(text, s["segments"])
        failed += not ok
        total += 1
        if not ok or not quiet:
            print(f"{'PASS' if ok else 'FAIL'}  {card.get('word', card.get('kanji'))} #{i}  {text}  expected={e}  sudachi={su}  openjtalk={jt}")
print(f"{total - failed}/{total} sentences pass")
sys.exit(1 if failed else 0)
