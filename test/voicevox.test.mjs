// scripts/voicevox.mjs against a small mock VOICEVOX engine (the real one cannot run here): reading check, synthesis,
// file formats, manifest + credit, skipping unchanged clips, --accept, voice change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { foldKana, plannedKana } from '../scripts/voicevox.mjs';

const run = promisify(execFile);
// what the mock engine "says" for each text (pronunciation kana, as VOICEVOX spells moras)
const SAYS = { 'ひ': ['ヒ'], '今日はいい日です。': ['キョ', 'オ', 'ワ', 'イ', 'イ', 'ヒ', 'デ', 'ス'], '火は熱い。': ['カ', 'ワ', 'ア', 'ツ', 'イ'] };
function wav(n = 2400) {                                   // a valid 24 kHz mono 16-bit WAV
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(24000, 24); b.writeUInt32LE(48000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(8000 * Math.sin(i / 8)), 44 + i * 2);
  return b;
}
function mockEngine() {
  const calls = [];
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'); calls.push(`${req.method} ${u.pathname}`);
    let body = ''; req.on('data', (d) => { body += d; });
    req.on('end', () => {
      if (u.pathname === '/version') return res.end('"0.0.0-mock"');
      if (u.pathname === '/speakers') return res.end(JSON.stringify([{ name: 'テスト', speaker_uuid: 'x', styles: [{ name: 'ノーマル', id: 3 }, { name: 'ささやき', id: 4 }] }, { name: '別の声', speaker_uuid: 'y', styles: [{ name: 'ノーマル', id: 8 }] }]));
      if (u.pathname === '/audio_query') { const moras = (SAYS[u.searchParams.get('text')] ?? ['ア']).map((text) => ({ text })); return res.end(JSON.stringify({ accent_phrases: [{ moras, accent: 1, pause_mora: null }], speedScale: 1 })); }
      if (u.pathname === '/synthesis') { const q = JSON.parse(body); assert.ok(q.speedScale > 0); res.setHeader('Content-Type', 'audio/wav'); return res.end(wav()); }
      res.statusCode = 404; res.end('not found');
    });
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, calls, host: `http://127.0.0.1:${server.address().port}` })));
}
function workspace() {
  const dir = mkdtempSync(join(tmpdir(), 'vv-')); mkdirSync(join(dir, 'audio'));
  const clips = [
    { id: '65e5-reading', kind: 'reading', text: 'ひ', reading: 'ヒ', spoken: 'ヒ', speed: { normal: 0.9, slow: 0.7 } },
    { id: '65e5-s1', kind: 'sentence', text: '今日はいい日です。', reading: 'キョウハイイヒデス', spoken: 'キョウワイイヒデス', speed: { normal: 1, slow: 0.75 } },
    { id: '706b-s1', kind: 'sentence', text: '火は熱い。', reading: 'ヒハアツイ', spoken: 'ヒワアツイ', speed: { normal: 1, slow: 0.75 } },   // the mock misreads 火 as カ
  ];
  writeFileSync(join(dir, 'audio/clips.json'), JSON.stringify({ clips }));
  return dir;
}
const script = join(process.cwd(), 'scripts/voicevox.mjs');
async function vv(dir, args) {
  try { const r = await run('node', [script, ...args], { cwd: dir }); return { code: 0, out: r.stdout + r.stderr }; }
  catch (e) { return { code: e.code, out: e.stdout + e.stderr }; }
}

test('kana folding: long vowels and particles compare as spoken, real differences do not', () => {
  assert.equal(foldKana('キョウ'), foldKana('キョオ'));
  assert.equal(foldKana('センセイ'), foldKana('センセエ'));
  assert.equal(foldKana('テーブル'), foldKana('テエブル'));
  assert.equal(foldKana('ミズヲノミマス'), foldKana('ミズオノミマス'));
  assert.equal(foldKana('きょう'), foldKana('キョウ'));
  assert.notEqual(foldKana('ヒワアツイ'), foldKana('カワアツイ'));
  assert.notEqual(foldKana('ニチ'), foldKana('ヒ'));
  assert.equal(plannedKana({ accent_phrases: [{ moras: [{ text: 'キョ' }, { text: 'オ' }] }, { moras: [{ text: 'ワ' }] }] }), 'キョオワ');
});

test('generate: matching clips are rendered (wav), a misread one is reported and not saved; manifest carries the credit', async () => {
  const { server, host, calls } = await mockEngine(), dir = workspace();
  try {
    const r = await vv(dir, ['generate', '--speaker', '3', '--host', host, '--format', 'wav']);
    assert.equal(r.code, 2, r.out);
    assert.match(r.out, /706b-s1\s+火は熱い。\s+expected ヒワアツイ\s+voicevox カワアツイ/);
    assert.ok(existsSync(join(dir, 'audio/65e5-reading.wav')) && existsSync(join(dir, 'audio/65e5-s1.wav')));
    assert.ok(!existsSync(join(dir, 'audio/706b-s1.wav')), 'a mismatched clip must not be written');
    const m = JSON.parse(readFileSync(join(dir, 'audio/manifest.json'), 'utf8'));
    assert.equal(m.voice.credit, 'VOICEVOX: テスト');
    assert.deepEqual(Object.keys(m.clips), ['65e5-reading', '65e5-s1']);
    assert.equal(m.clips['65e5-s1'].src, 'audio/65e5-s1.wav');
    assert.equal(m.clips['65e5-reading'].speed, 0.9);
    assert.equal(readFileSync(join(dir, 'audio/65e5-s1.wav')).subarray(0, 4).toString(), 'RIFF');

    const synth = calls.filter((c) => c.endsWith('/synthesis')).length;
    const again = await vv(dir, ['generate', '--speaker', '3', '--host', host, '--format', 'wav', '--only', '65e5-reading,65e5-s1']);
    assert.equal(again.code, 0, again.out);
    assert.equal(calls.filter((c) => c.endsWith('/synthesis')).length, synth, 'unchanged clips are not rendered again');
    assert.match(again.out, /unchanged 2/);

    const acc = await vv(dir, ['generate', '--speaker', '3', '--host', host, '--format', 'wav', '--only', '706b-s1', '--accept', '706b-s1', '--credit', 'VOICEVOX:テスト']);
    assert.equal(acc.code, 0, acc.out);
    assert.ok(existsSync(join(dir, 'audio/706b-s1.wav')));
    await vv(dir, ['generate', '--speaker', '3', '--host', host, '--format', 'wav', '--only', '65e5-s1', '--force']);
    assert.equal(JSON.parse(readFileSync(join(dir, 'audio/manifest.json'), 'utf8')).voice.credit, 'VOICEVOX:テスト', 'a --credit set earlier is kept for the same character');
  } finally { server.close(); }
});

test('check writes nothing; speakers lists style ids; an unreachable engine gives a clear message', async () => {
  const { server, host } = await mockEngine(), dir = workspace();
  try {
    const c = await vv(dir, ['check', '--speaker', '3', '--host', host]);
    assert.equal(c.code, 2); assert.match(c.out, /Would render 2/);
    assert.ok(!existsSync(join(dir, 'audio/manifest.json')));
    const s = await vv(dir, ['speakers', '--host', host]);
    assert.match(s.out, /3 {2}テスト \/ ノーマル/); assert.match(s.out, /8 {2}別の声 \/ ノーマル/);
    const bad = await vv(dir, ['generate', '--speaker', '99', '--host', host]);
    assert.equal(bad.code, 1); assert.match(bad.out, /no VOICEVOX style with id 99/);
  } finally { server.close(); }
  const off = await vv(dir, ['speakers', '--host', 'http://127.0.0.1:9']);
  assert.match(off.out, /cannot reach VOICEVOX .* Is the engine running\?/);
});

test('with ffmpeg: mp3 files; changing the voice re-renders everything and updates the credit', { skip: spawnSync('ffmpeg', ['-version']).status !== 0 && 'ffmpeg not installed' }, async () => {
  const { server, host } = await mockEngine(), dir = workspace();
  try {
    await vv(dir, ['generate', '--speaker', '3', '--host', host]);
    assert.ok(existsSync(join(dir, 'audio/65e5-s1.mp3')));
    assert.equal(JSON.parse(readFileSync(join(dir, 'audio/manifest.json'), 'utf8')).clips['65e5-s1'].src, 'audio/65e5-s1.mp3');
    const r = await vv(dir, ['generate', '--speaker', '8', '--host', host, '--slow-too']);
    assert.match(r.out, /re-rendering every clip/);
    const m = JSON.parse(readFileSync(join(dir, 'audio/manifest.json'), 'utf8'));
    assert.equal(m.voice.credit, 'VOICEVOX: 別の声');
    assert.ok(m.clips['65e5-s1-slow'] && m.clips['65e5-s1-slow'].speed === 0.75);
  } finally { server.close(); }
});
