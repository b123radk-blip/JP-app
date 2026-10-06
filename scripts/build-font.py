#!/usr/bin/env python3
"""Subset Noto Sans JP (SIL OFL 1.1) to the characters the app uses, so text never depends on the headset's fonts.

Setup (once):  python3 -m venv .venv-font && . .venv-font/bin/activate && pip install fonttools brotli && npm install
Run:           python3 scripts/build-font.py     (re-run whenever cards add new characters; `npm test` fails if one is missing)

Output: assets/fonts/NotoSansJP-{Regular,Bold}.subset.ttf, assets/fonts/charset.txt (every character in the subset), OFL.txt
Included: ASCII, hiragana, katakana, common CJK punctuation, a broad N5-level kanji set, plus every non-ASCII character found
in content/**/*.json and src/**/*.js.
"""
import glob, io, os, shutil, sys
from fontTools import subset
from fontTools.ttLib import TTFont

SRC = "node_modules/@expo-google-fonts/noto-sans-jp"
OUT = "assets/fonts"
WEIGHTS = {"Regular": f"{SRC}/400Regular/NotoSansJP_400Regular.ttf", "Bold": f"{SRC}/700Bold/NotoSansJP_700Bold.ttf"}

N5_KANJI = ("一二三四五六七八九十百千万円年月日火水木金土曜時分半午前後今週毎何人男女子父母友先生学校大小中高長上下左右外北南東西国語本名白天気雨電車駅道"
            "歩行来出入食飲見聞読書話買休目耳口手足山川田森花魚犬肉新古安多少好会社私間言思知")
KANA = "".join(chr(c) for c in range(0x3041, 0x3097)) + "".join(chr(c) for c in range(0x30A1, 0x30FB)) + "ー々"
PUNCT = "、。，．・「」『』（）〜…！？：；→←↑↓·–—‘’“”"

chars = set(chr(c) for c in range(0x20, 0x7F)) | set(N5_KANJI) | set(KANA) | set(PUNCT)
for pattern in ("content/**/*.json", "src/**/*.js", "index.html"):
    for f in glob.glob(pattern, recursive=True):
        chars |= {c for c in io.open(f, encoding="utf-8").read() if ord(c) >= 0x80 and not c.isspace()}

os.makedirs(OUT, exist_ok=True)
covered = None
for name, path in WEIGHTS.items():
    if not os.path.exists(path):
        sys.exit(f"missing {path}: run `npm install` first")
    opts = subset.Options(); opts.layout_features = ["kern", "vert", "vrt2", "palt"]; opts.name_IDs = [0, 1, 2, 3, 4, 6]; opts.notdef_outline = True
    font = TTFont(path)
    sub = subset.Subsetter(opts); sub.populate(text="".join(sorted(chars))); sub.subset(font)
    out = f"{OUT}/NotoSansJP-{name}.subset.ttf"
    font.save(out)
    cmap = set(chr(c) for c in TTFont(out).getBestCmap())
    covered = cmap if covered is None else covered & cmap
    print(f"{out}: {os.path.getsize(out) / 1024:.0f} KB, {len(cmap)} glyphs")
missing = sorted(c for c in chars if c not in covered and ord(c) > 0x20)
if missing:
    print("WARNING: not in the source font:", "".join(missing))
io.open(f"{OUT}/charset.txt", "w", encoding="utf-8").write("".join(sorted(covered)) + "\n")
shutil.copy(f"{SRC}/LICENSE_FONT", f"{OUT}/OFL.txt")
print(f"charset.txt: {len(covered)} characters")
