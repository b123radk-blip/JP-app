#!/usr/bin/env node
// Renders the app's voice clips with a VOICEVOX engine running on your own PC. No npm packages needed (Node 18+).
// Step-by-step guide: docs/VOICEVOX.md.
//
//   node scripts/voicevox.mjs speakers                       list voices: character, style and the style id to use
//   node scripts/voicevox.mjs check --speaker 3              compare readings only (what VOICEVOX would say vs the cards)
//   node scripts/voicevox.mjs generate --speaker 3           render every missing / changed clip into audio/, update the manifest
//
// Options: --speed normal|slow|<number>  (default normal: each clip's suggested speed)   --slow-too  also render "<id>-slow"
//          --only id,id   --accept id,id (save even though the reading differs; listen first!)   --force (re-render all)
//          --format auto|mp3|opus|wav (auto = mp3 when ffmpeg is installed, else wav)   --prune (delete clips no card needs)
//          --credit "VOICEVOX:ずんだもん" (if the character's terms want an exact form; default "VOICEVOX: <character>")
//          --host http://localhost:50021   --list audio/clips.json   --manifest audio/manifest.json
//
// Every clip is checked BEFORE it is synthesised: the kana VOICEVOX plans to speak (audio_query) must match the reading
// built from the card's verified segments (audio/clips.json, `npm run voice:list`). Mismatches are reported, not saved.
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// ---- kana comparison --------------------------------------------------------------------------------------------------
// VOICEVOX spells moras as pronounced (キョウ -> キョ・オ, セイ -> セ・エ, ー -> the vowel). Fold both sides the same way so
// only real differences (another word, another reading) are reported.
const ROWS = { a: 'アカガサザタダナハバパマヤラワャァ', i: 'イキギシジチヂニヒビピミリィ', u: 'ウクグスズツヅヌフブプムユルュゥヴ', e: 'エケゲセゼテデネヘベペメレェ', o: 'オコゴソゾトドノホボポモヨロヲョォ' };
const VOWEL = {}; for (const [v, s] of Object.entries(ROWS)) for (const c of s) VOWEL[c] = v;
const VK = { a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ' };
const SMALL = 'ャュョァィゥェォ';
const toKata = (s) => [...s].map((c) => (c >= 'ぁ' && c <= 'ゖ' ? String.fromCharCode(c.charCodeAt(0) + 0x60) : c)).join('');
export function foldKana(s) {
  const chars = [...toKata(s).replace(/[。、，．！？!?・「」『』（）\s]/g, '')].map((c) => ({ ヲ: 'オ', ヅ: 'ズ', ヂ: 'ジ' }[c] ?? c));
  const out = []; let prev = null;                                    // prev = vowel of the previous mora
  for (let i = 0; i < chars.length; i++) {
    let c = chars[i];
    if (chars[i + 1] && SMALL.includes(chars[i + 1])) { c += chars[++i]; prev = VOWEL[chars[i]]; out.push(c); continue; }
    if (c === 'ー' && prev) c = VK[prev];
    else if (c === 'ウ' && prev === 'o') c = 'オ';
    else if (c === 'イ' && prev === 'e') c = 'エ';
    out.push(c); prev = VOWEL[c] ?? null;
  }
  return out.join('');
}
export const plannedKana = (query) => query.accent_phrases.flatMap((ap) => ap.moras.map((m) => m.text)).join('');

// ---- engine ----------------------------------------------------------------------------------------------------------
async function api(host, path, { method = 'GET', body } = {}) {
  let res;
  try { res = await fetch(host + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { throw new Error(`cannot reach VOICEVOX at ${host} (${e.cause?.code || e.message}). Is the engine running? See docs/VOICEVOX.md, step 2.`); }
  if (!res.ok) throw new Error(`VOICEVOX ${method} ${path.split('?')[0]}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res;
}
// keep a credit you set with --credit earlier, as long as the character is the same
const manifestCredit = (m, name) => (m.voice?.speaker?.character === name && m.voice?.credit) || `VOICEVOX: ${name}`;
const hasFfmpeg = () => { try { return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0; } catch { return false; } };

function parseArgs(argv) {
  const o = { cmd: argv[0], host: 'http://localhost:50021', list: 'audio/clips.json', manifest: 'audio/manifest.json', speed: 'normal', format: 'auto', only: null, accept: [], force: false, slowToo: false, prune: false, credit: null };
  for (let i = 1; i < argv.length; i++) {
    const k = argv[i], v = () => argv[++i];
    if (k === '--speaker') o.speaker = Number(v()); else if (k === '--host') o.host = v().replace(/\/$/, ''); else if (k === '--list') o.list = v();
    else if (k === '--manifest') o.manifest = v(); else if (k === '--speed') o.speed = v(); else if (k === '--format') o.format = v();
    else if (k === '--only') o.only = v().split(','); else if (k === '--accept') o.accept = v().split(','); else if (k === '--force') o.force = true;
    else if (k === '--slow-too') o.slowToo = true; else if (k === '--prune') o.prune = true; else if (k === '--credit') o.credit = v();
    else throw new Error(`unknown option ${k}`);
  }
  return o;
}

async function speakers(o) {
  const list = await (await api(o.host, '/speakers')).json();
  console.log(`VOICEVOX ${await (await api(o.host, '/version')).text()} at ${o.host}\n\nstyle id  character / style`);
  for (const sp of list) for (const st of sp.styles) console.log(`${String(st.id).padStart(8)}  ${sp.name} / ${st.name}`);
  console.log('\nUse the style id with --speaker. Each character has its own terms of use: read them before you publish (docs/VOICEVOX.md).');
}

async function generate(o, { dry }) {
  if (!Number.isInteger(o.speaker)) throw new Error('--speaker <style id> is required (list them with: node scripts/voicevox.mjs speakers)');
  const version = (await (await api(o.host, '/version')).text()).replace(/"/g, '');
  const sp = (await (await api(o.host, '/speakers')).json()).find((s) => s.styles.some((st) => st.id === o.speaker));
  if (!sp) throw new Error(`no VOICEVOX style with id ${o.speaker} (see: node scripts/voicevox.mjs speakers)`);
  const style = sp.styles.find((st) => st.id === o.speaker).name;
  const { clips } = JSON.parse(readFileSync(o.list, 'utf8'));
  const manifest = existsSync(o.manifest) ? JSON.parse(readFileSync(o.manifest, 'utf8')) : { clips: {} };
  manifest.clips ??= {};
  const outDir = dirname(o.manifest), root = dirname(resolve(outDir));
  const changedVoice = manifest.voice && manifest.voice.speaker?.id !== o.speaker;
  if (changedVoice && !dry) console.log(`Voice changes from ${manifest.voice.speaker?.character} (${manifest.voice.speaker?.id}) to ${sp.name} (${o.speaker}): re-rendering every clip.`);
  const format = o.format === 'auto' ? (hasFfmpeg() ? 'mp3' : 'wav') : o.format;
  if (format !== 'wav' && !hasFfmpeg()) throw new Error(`--format ${format} needs ffmpeg on the PATH (or use --format wav)`);
  mkdirSync(outDir, { recursive: true });

  const jobs = [];
  for (const c of clips) {
    if (o.only && !o.only.includes(c.id)) continue;
    const speed = typeof c.speed === 'object' ? (Number.isFinite(+o.speed) ? +o.speed : c.speed[o.speed] ?? c.speed.normal) : 1;
    jobs.push({ id: c.id, clip: c, speed });
    if (o.slowToo) jobs.push({ id: `${c.id}-slow`, clip: c, speed: c.speed?.slow ?? 0.75 });
  }
  const report = { made: [], kept: [], mismatch: [], accepted: [] };
  for (const j of jobs) {
    const old = manifest.clips[j.id];
    if (!dry && !o.force && !changedVoice && old && old.text === j.clip.text && old.speed === j.speed && existsSync(join(root, old.src))) { report.kept.push(j.id); continue; }
    const query = await (await api(o.host, `/audio_query?text=${encodeURIComponent(j.clip.text)}&speaker=${o.speaker}`, { method: 'POST' })).json();
    const planned = plannedKana(query);
    if (foldKana(planned) !== foldKana(j.clip.spoken)) {
      if (!o.accept.includes(j.id) && !o.accept.includes(j.clip.id)) { report.mismatch.push({ ...j, planned }); continue; }
      report.accepted.push(j.id);
    }
    if (dry) { report.made.push(j.id); continue; }
    query.speedScale = j.speed; query.prePhonemeLength = 0.08; query.postPhonemeLength = 0.12;
    const wav = Buffer.from(await (await api(o.host, `/synthesis?speaker=${o.speaker}`, { method: 'POST', body: query })).arrayBuffer());
    const ext = { wav: 'wav', mp3: 'mp3', opus: 'ogg' }[format], file = join(outDir, `${j.id}.${ext}`);
    if (format === 'wav') writeFileSync(file, wav);
    else {
      const tmp = join(outDir, `${j.id}.tmp.wav`); writeFileSync(tmp, wav);
      const codec = format === 'mp3' ? ['-codec:a', 'libmp3lame', '-b:a', '96k'] : ['-codec:a', 'libopus', '-b:a', '48k'];
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', ...codec, file], { stdio: 'inherit' });
      unlinkSync(tmp);
      if (r.status !== 0) throw new Error(`ffmpeg failed on ${j.id}`);
    }
    if (old && old.src !== relative(root, file).split('\\').join('/') && existsSync(join(root, old.src))) unlinkSync(join(root, old.src));
    manifest.clips[j.id] = { src: relative(root, file).split('\\').join('/'), text: j.clip.text, kana: planned, speed: j.speed };
    report.made.push(j.id);
    process.stdout.write(`  ${j.id}  ${j.clip.text}  ${planned}\n`);
  }
  const needed = new Set(jobs.map((j) => j.id).concat(clips.map((c) => c.id)));
  const stale = Object.keys(manifest.clips).filter((id) => !needed.has(id) && !needed.has(id.replace(/-slow$/, '')));
  if (!dry) {
    if (o.prune) for (const id of stale) { const f = join(root, manifest.clips[id].src); if (existsSync(f)) unlinkSync(f); delete manifest.clips[id]; }
    if (changedVoice) for (const [id, c] of Object.entries(manifest.clips)) if (!report.made.includes(id)) { const f = join(root, c.src); if (existsSync(f)) unlinkSync(f); delete manifest.clips[id]; }
    manifest.note = 'Written by scripts/voicevox.mjs (docs/VOICEVOX.md). The app shows voice.credit whenever clips exist.';
    if (Object.keys(manifest.clips).length) manifest.voice = { engine: 'VOICEVOX', engineVersion: version, speaker: { id: o.speaker, character: sp.name, style }, credit: o.credit ?? manifestCredit(manifest, sp.name) };
    manifest.clips = Object.fromEntries(Object.entries(manifest.clips).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(o.manifest, JSON.stringify({ note: manifest.note, voice: manifest.voice ?? null, clips: manifest.clips }, null, 1) + '\n');
  }
  console.log(`\n${dry ? 'Would render' : 'Rendered'} ${report.made.length}, unchanged ${report.kept.length}, accepted despite a different reading ${report.accepted.length}, mismatched ${report.mismatch.length}` +
    `${stale.length ? `, ${o.prune && !dry ? 'removed' : 'no longer needed (use --prune)'} ${stale.length}` : ''}. Voice: ${sp.name} / ${style} (credit "${o.credit ?? manifestCredit(manifest, sp.name)}").`);
  if (report.mismatch.length) {
    console.log('\nReading mismatches (NOT saved). expected = from the card, voicevox = what it would say:');
    for (const m of report.mismatch) console.log(`  ${m.id}  ${m.clip.text}\n      expected ${m.clip.spoken}\n      voicevox ${m.planned}`);
    console.log('\nFix the card (or tell me), or listen and keep one anyway with: --only <id> --accept <id>');
    process.exitCode = 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const o = parseArgs(process.argv.slice(2));
    if (o.cmd === 'speakers') await speakers(o);
    else if (o.cmd === 'generate' || o.cmd === 'check') await generate(o, { dry: o.cmd === 'check' });
    else { const lines = readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1); console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith('//'))).map((l) => l.slice(3)).join('\n')); process.exitCode = 1; }
  } catch (e) { console.error(`error: ${e.message}`); process.exitCode = 1; }
}
