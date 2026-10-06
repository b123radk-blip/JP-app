# Generating the voice with VOICEVOX (on your Windows PC)

The app has no voice until you make one. You render every clip yourself with VOICEVOX running locally, commit the files,
and the app picks them up: a **Sound** button and the credit **"VOICEVOX: &lt;character&gt;"** appear once clips exist.

What you run: `scripts/voicevox.mjs`, a plain Node script (no `npm install` needed). Before it saves a clip it asks
VOICEVOX which kana it is going to say and compares that with the reading from the card's verified sentence. If they differ
(for example 日 read as にち where the card says ひ) the clip is **reported, not saved**.

The list of clips is `audio/clips.json` (every card's reading and every example sentence, with the expected kana and a
suggested speed). It is regenerated from the cards with `npm run voice:list`, and `npm test` fails if it is out of date, so
new cards always show up in it.

## 1. Install (once)

1. **VOICEVOX**: download the Windows version from https://voicevox.hiroshiba.jp/ and install it (the GPU version is
   faster if you have an NVIDIA card; the CPU version works everywhere).
2. **Node.js** (LTS, version 18 or newer): https://nodejs.org/ (default options).
3. **Git**: https://git-scm.com/download/win (or GitHub Desktop, if you prefer clicking).
4. Optional, recommended: **ffmpeg**, so clips are saved as small mp3 files instead of wav.
   In PowerShell: `winget install Gyan.FFmpeg` and then open a new PowerShell window. Without ffmpeg the script writes
   wav files, which also work but are about 10 times bigger.

Check in a new PowerShell window: `node --version` (v18 or higher) and, if installed, `ffmpeg -version`.

## 2. Start the engine

Start the **VOICEVOX** app and keep it open: it runs the engine at http://localhost:50021.
Check: open http://localhost:50021/docs in a browser; you should see the API page.

## 3. Get the project

```powershell
git clone https://github.com/b123radk-blip/JP-app.git
cd JP-app
git checkout claude/kanji-3d-galaxy-xr-uoi522
```

Later, to get new cards: `git pull` in that folder.

## 4. Choose a voice and check its terms

```powershell
node scripts/voicevox.mjs speakers
```

This lists every voice as `style id  character / style`. Try voices in the VOICEVOX app first (a calm style at normal
speed is easiest to learn from), then note the **style id**.

**Terms of use.** VOICEVOX itself asks for the credit "VOICEVOX:&lt;character name&gt;" wherever the audio is used, and every
character has its *own* terms (利用規約), linked from its page on the VOICEVOX site. The app is published on GitHub Pages
(public), so read the character's terms and make sure they allow this use. The app shows the credit from
`audio/manifest.json` automatically. If the character's terms ask for an exact wording, pass it once with
`--credit "VOICEVOX:ずんだもん"` (it is kept for later runs with the same character).

## 5. Check the readings (writes nothing)

```powershell
node scripts/voicevox.mjs check --speaker 3
```

(Replace 3 with your style id.) It ends with `Would render N ... mismatched M`. For each mismatch it shows (made-up example):

```
  706b-s1  火は熱い。
      expected ヒワアツイ
      voicevox カワアツイ
```

Long vowels and particles are compared as spoken (今日 キョウ = キョオ, は = ワ), so what is listed is a real difference.
What to do: tell a Claude session which clip and what VOICEVOX planned (the card may be rephrased), or, if you are sure the
VOICEVOX version is fine after listening in the app, keep it with `--accept` (step 6).

## 6. Generate

```powershell
node scripts/voicevox.mjs generate --speaker 3
```

- Clips go to `audio/<id>.mp3` (`.wav` without ffmpeg); `audio/manifest.json` is updated with the voice and the credit.
- Running it again only renders clips that are new or whose text or speed changed.
- Options: `--slow-too` also renders a slower copy of every clip (`<id>-slow`, for a later "slow" button);
  `--speed slow` or `--speed 0.85` changes the speed; `--only "65e5-s1,706b-s1"` limits the run (keep the quotes in
  PowerShell); `--accept "706b-s1"` saves a clip even though its reading differs; `--force` re-renders everything;
  `--format wav|mp3|opus`; `--prune` deletes clips no card needs any more.
- Switching to another `--speaker` re-renders every clip, so the app never mixes voices.

## 7. Listen

Double-click a few files in `audio\`, or run the app locally: `python -m http.server 8080` in the project folder
(Python is optional; any static server works) and open http://localhost:8080/. The **Sound** button and the credit
in the footer appear because clips now exist.

## 8. Commit and publish

```powershell
git add audio
git commit -m "Voice clips (VOICEVOX: <character>)"
git push
```

GitHub Pages updates 1-2 minutes later; reload the app in the headset.

## Troubleshooting

| Message | Fix |
|---|---|
| `cannot reach VOICEVOX at http://localhost:50021` | Start the VOICEVOX app (step 2). Another port: `--host http://localhost:PORT`. |
| `no VOICEVOX style with id N` | Use an id from `node scripts/voicevox.mjs speakers`. |
| `--format mp3 needs ffmpeg` | Install ffmpeg (step 1.4) and open a new PowerShell window, or use `--format wav`. |
| Exit code 2 | Some readings differ (step 5). Everything else was saved. |
| `audio/clips.json is out of date` (npm test) | Run `npm run voice:list` (Claude sessions do this when they add cards). |
