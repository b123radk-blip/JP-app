#!/usr/bin/env python3
"""Generate the spoken reading for the 火 page with Open JTalk (offline, no network at run time).

Setup (once):  python3 -m venv .venv-tts && . .venv-tts/bin/activate && pip install pyopenjtalk-plus soundfile
Run:           python3 scripts/make-audio.py          -> audio/hi.mp3  (needs ffmpeg)

This is a PLACEHOLDER voice: the bundled "Mei" HTS voice is intelligible but robotic. To use something better
(VOICEVOX, Azure, Google ...), render the same kana and overwrite audio/hi.mp3; the page does not care how it was made.
Voice credit: HTS Voice "Mei", MMDAgent Project Team / Nagoya Institute of Technology, CC BY 3.0.
"""
import subprocess, sys
import numpy as np
import pyopenjtalk, soundfile as sf

KANA = "ひ"          # reading shown as furigana on 火; we synthesise the kana, never the bare kanji, so the reading is fixed
EXPECT = "h i"       # phonemes we expect Open JTalk to produce for it

ph = pyopenjtalk.g2p(KANA)
if ph != EXPECT:
    sys.exit(f"unexpected phonemes for {KANA}: {ph!r} (expected {EXPECT!r})")

x, sr = pyopenjtalk.tts(KANA)
x = x.astype(np.float32) / 32768.0
# trim leading / trailing silence, keep a short pad, fade the edges, normalise to -3 dBFS
active = np.where(np.abs(x) > 0.02)[0]
a, b = max(0, active[0] - int(0.03 * sr)), min(len(x), active[-1] + int(0.06 * sr))
x = x[a:b]
fade = int(0.01 * sr)
x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
x *= 0.708 / np.abs(x).max()
sf.write("/tmp/hi.wav", x, sr)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/hi.wav", "-ac", "1", "-ar", "44100", "-b:a", "96k", "audio/hi.mp3"], check=True)
print(f"wrote audio/hi.mp3 ({len(x) / sr:.2f}s) phonemes={ph!r}")
