#!/usr/bin/env python3
"""Generate the spoken audio for the 火 page with Open JTalk (offline, no network at run time).

Setup (once):  python3 -m venv .venv-tts && . .venv-tts/bin/activate && pip install pyopenjtalk-plus soundfile
Run:           python3 scripts/make-audio.py          -> audio/*.mp3  (needs ffmpeg)

Each clip is checked first: Open JTalk must produce exactly the phonemes and kana we expect, otherwise nothing is written.
(The sentence reading was also cross-checked against SudachiPy: 火/ヒ noun, は/ハ topic particle, 熱い/アツイ adjective.)

This is a PLACEHOLDER voice: the bundled "Mei" HTS voice is intelligible but robotic. To use something better
(VOICEVOX, Azure, Google ...), render the same text and overwrite the mp3s; the page does not care how they were made.
Voice credit: HTS Voice "Mei", MMDAgent Project Team / Nagoya Institute of Technology, CC BY 3.0.
"""
import subprocess, sys
import numpy as np
import pyopenjtalk, soundfile as sf

SPEED = 0.5  # 1.0 is the engine default; the first version was too fast for learners

# file, text to synthesise, expected phonemes, expected kana
CLIPS = [
    ("hi.mp3",           "ひ",       "h i",              "ヒ"),
    ("fire-is-hot.mp3",  "火は熱い。", "h i w a a ts u i", "ヒワアツイ。"),   # "Fire is hot."  は = topic particle, read "wa"
]

for fname, text, want_ph, want_kana in CLIPS:
    ph, kana = pyopenjtalk.g2p(text), pyopenjtalk.g2p(text, kana=True)
    if ph != want_ph or kana != want_kana:
        sys.exit(f"{text}: got phonemes {ph!r} / kana {kana!r}, expected {want_ph!r} / {want_kana!r}")
    x, sr = pyopenjtalk.tts(text, speed=SPEED)
    x = x.astype(np.float32) / 32768.0
    # trim leading / trailing silence (keep a short pad), fade the edges, normalise to -3 dBFS
    active = np.where(np.abs(x) > 0.02)[0]
    a, b = max(0, active[0] - int(0.04 * sr)), min(len(x), active[-1] + int(0.12 * sr))
    x = x[a:b]
    fade = int(0.012 * sr)
    x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    x *= 0.708 / np.abs(x).max()
    sf.write("/tmp/clip.wav", x, sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/clip.wav", "-ac", "1", "-ar", "44100", "-b:a", "96k", f"audio/{fname}"], check=True)
    print(f"wrote audio/{fname} ({len(x) / sr:.2f}s) {text!r} phonemes={ph!r} kana={kana!r}")
