// Plan 006: copies each inspection's report and picture sheets (not the single pictures) from .cache/inspect/006-<case>/
// (and any --look picture) to plans/qwen/renders/006/<case>/, so the commit stays small. Usage: node plans/qwen/fixtures/006-collect.mjs
import { readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';

const SRC = '.cache/inspect', DST = 'plans/qwen/renders/006';
const runs = existsSync(SRC) ? readdirSync(SRC).filter((d) => d.startsWith('006-')) : [];
if (!runs.length) { console.log(`no ${SRC}/006-* folders: run the inspections first`); process.exit(1); }
for (const run of runs) {
  const files = readdirSync(`${SRC}/${run}`).filter((f) => f === 'report.txt' || /^((overview|faults|people)(-\d+)?|look-.*)\.jpg$/.test(f));
  mkdirSync(`${DST}/${run.slice(4)}`, { recursive: true });
  for (const f of files) copyFileSync(`${SRC}/${run}/${f}`, `${DST}/${run.slice(4)}/${f}`);
  console.log(`${run}: ${files.join(' ')}`);
}
