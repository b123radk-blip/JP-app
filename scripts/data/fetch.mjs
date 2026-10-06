// Downloads the open data sources into .cache/sources (skips files already there; --force re-downloads).
// Usage: npm run data:fetch      Needs: curl-free Node 18+ fetch, bunzip2 and tar on the PATH (Linux sessions have them).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { CACHE, SOURCES } from './sources.mjs';

const force = process.argv.includes('--force');
mkdirSync(CACHE, { recursive: true });
await Promise.all(SOURCES.map(async (s) => {
  const path = `${CACHE}/${s.file}`;
  if (existsSync(path) && !force) return console.log(`have  ${s.file}`);
  const res = await fetch(s.url);
  if (!res.ok) throw new Error(`${s.url}: HTTP ${res.status}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  console.log(`got   ${s.file}`);
}));
for (const s of SOURCES.filter((x) => x.unpack)) {
  const r = s.unpack === 'bz2' ? spawnSync('bunzip2', ['-kf', s.file], { cwd: CACHE, stdio: 'inherit' }) : spawnSync('tar', ['xjf', s.file], { cwd: CACHE, stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`unpacking ${s.file} failed`);
}
console.log(`sources ready in ${CACHE}`);
