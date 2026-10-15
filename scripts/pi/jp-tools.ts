// JP-app tools for Qwen in pi: check_goals, measure and try_value. Each runs scripts/qtool.mjs and returns its short
// report, so Qwen gets exact numbers instead of reading long reports or guessing. Load it with
//   pi --extension scripts/pi/jp-tools.ts
// (qwen-watch.mjs does this for every plan). Plain JavaScript in a .ts file and no imports from pi itself, so it works
// across pi versions; parameters are plain JSON Schema. Guide: docs/QWEN.md.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX = 12000;   // characters of a report the model sees (the reports are far shorter)

function qtool(cwd, args, signal) {
  return new Promise((resolve, reject) => {
    const p = spawn("node", ["scripts/qtool.mjs", ...args], { cwd, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    let killed = false;
    const stop = () => { killed = true; p.kill(); };
    const timer = setTimeout(stop, 6 * 60000);
    signal?.addEventListener?.("abort", stop, { once: true });
    p.stdout.on("data", (d) => out.push(d));
    p.stderr.on("data", (d) => out.push(d));
    p.on("error", (e) => { clearTimeout(timer); reject(new Error(`could not run node scripts/qtool.mjs: ${e.message}`)); });
    p.on("close", (code) => {
      clearTimeout(timer); signal?.removeEventListener?.("abort", stop);
      let text = Buffer.concat(out).toString("utf8").trim();
      if (text.length > MAX) text = `${text.slice(0, MAX)}\n... (cut: ask for fewer things with "what")`;
      if (killed) return reject(new Error(`stopped (time limit or cancelled). Output so far:\n${text}`));
      // exit 2: the tool could not do it (bad card, file, text); the report says why
      if (code === 2) return reject(new Error(text || "qtool failed"));
      resolve({ content: [{ type: "text", text }], details: { exit: code } });
    });
  });
}

const str = (description) => ({ type: "string", description });

export default function (pi) {
  pi.registerTool({
    name: "check_goals",
    label: "Check goals",
    description: "Measure the card's scene and return only the plan's goals (PASS or FAIL, with the measured numbers and the moments it fails) and the faults over the whole loop (floating, sunk, things through bodies, hidden people). About 8 seconds. Use it after every change instead of the full inspect report.",
    promptSnippet: "check_goals: the plan's goals PASS/FAIL with measured numbers, plus whole-loop faults (fast, numbers only)",
    parameters: { type: "object", properties: {
      card: str("the card id, e.g. 4f53 or w1444610"),
      goals: str("the goals file, e.g. plans/qwen/goals/011-karada-toes.json (leave out for faults only)"),
      loop: { type: "number", description: "the loop length in seconds when the plan's scene is longer than 7 s" },
    }, required: ["card"], additionalProperties: false },
    async execute(_id, p, signal, _onUpdate, ctx) {
      return qtool(ctx?.cwd ?? process.cwd(), ["goals", p.card, ...(p.goals ? [p.goals] : []), ...(p.loop ? ["--loop", String(p.loop)] : [])], signal);
    },
  });

  pi.registerTool({
    name: "measure",
    label: "Measure",
    description: "Exact numbers from the card's scene at given moments: each thing's size, centre, bottom and top, and each person's body points (top of the head, head (middle), neck, shoulders, chest, hips, knees, feet, hands). Units are u (the kanji's height): [x from the kanji's right edge, y above the ground, z toward the viewer]. Moments are seconds after the last stroke. About 6 seconds. Use it before changing a number, instead of guessing from pictures.",
    promptSnippet: "measure: exact positions/sizes of things and body points (hands, feet, head) at given moments, in u",
    parameters: { type: "object", properties: {
      card: str("the card id"),
      t: str("moments, comma-separated seconds after the last stroke, e.g. \"1\" or \"2.5,4\" (default 1)"),
      what: str("keep only lines that mention any of these comma-separated words, e.g. \"gal2 right hand,rowboat\" (default: everything)"),
    }, required: ["card"], additionalProperties: false },
    async execute(_id, p, signal, _onUpdate, ctx) {
      return qtool(ctx?.cwd ?? process.cwd(), ["measure", p.card, ...(p.t ? ["--t", String(p.t)] : []), ...(p.what ? ["--what", p.what] : [])], signal);
    },
  });

  pi.registerTool({
    name: "try_value",
    label: "Try a change",
    description: "Try edits to one scene or card file WITHOUT keeping them: each change replaces exact old text (it must appear exactly once) with new text; the goals are measured before and after, then the file is put back. Shows which goals changed (e.g. FAIL -> PASS) and which faults appeared or went. About 15 seconds. To keep a change that helps, make the same edit with your edit tool. Only files under src/ or content/.",
    promptSnippet: "try_value: test an exact-text edit on the scene against the goals without keeping it",
    parameters: { type: "object", properties: {
      card: str("the card id"),
      file: str("the file to change, e.g. src/effects/vignettes/q-ferry.js"),
      changes: { type: "array", minItems: 1, maxItems: 8, description: "the edits, applied in order",
        items: { type: "object", properties: { old: str("exact text now in the file (once)"), new: str("what to put instead") }, required: ["old", "new"], additionalProperties: false } },
      goals: str("the goals file (plans/qwen/goals/<plan>.json)"),
      loop: { type: "number", description: "the loop length in seconds when longer than 7 s" },
    }, required: ["card", "file", "changes"], additionalProperties: false },
    async execute(id, p, signal, _onUpdate, ctx) {
      const cwd = ctx?.cwd ?? process.cwd(), dir = join(cwd, ".cache"), f = join(dir, `qtool-try-${String(id).replace(/[^\w-]/g, "")}.json`);
      mkdirSync(dir, { recursive: true });
      writeFileSync(f, JSON.stringify({ file: p.file, changes: p.changes }));
      return qtool(cwd, ["try", p.card, f, ...(p.goals ? ["--goals", p.goals] : []), ...(p.loop ? ["--loop", String(p.loop)] : [])], signal);
    },
  });
}
