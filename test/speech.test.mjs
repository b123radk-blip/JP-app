import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeech } from '../src/app/speech.js';

// a fake recogniser: the test drives its results and end events; each new session is the latest instance
const made = [];
class FakeRec {
  constructor() { made.push(this); this.started = false; }
  start() { this.started = true; }
  stop() { this.onend?.(); }
  abort() { this.aborted = true; }
  say(text, isFinal) { this.onresult?.({ results: [Object.assign([{ transcript: text }], { isFinal })] }); }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('speech: phrases add up across sessions, cut-off phrases kept, Stop is immediate', async () => {
  globalThis.webkitSpeechRecognition = FakeRec;
  let text = '', states = [];
  const s = createSpeech({ onText: (t) => { text = t; }, onState: (on) => states.push(on) });
  s.start();
  assert.equal(made.at(-1).continuous, false);
  made.at(-1).say('the rope', false); made.at(-1).say('the ropes are too low', true); made.at(-1).onend();
  assert.equal(text, 'the ropes are too low');
  await wait(200);                                         // the next session starts after a short pause
  made.at(-1).say('and the man floats', false); made.at(-1).onend();   // ended before a final result
  assert.equal(text, 'the ropes are too low and the man floats');
  await wait(200);
  made.at(-1).say('fix it', false);
  s.stop();
  assert.equal(text, 'the ropes are too low and the man floats fix it');
  assert.equal(made.at(-1).aborted, true);
  assert.deepEqual(states, [true, false]);
  assert.equal(s.listening, false);
  const n = made.length; await wait(200); assert.equal(made.length, n);  // nothing restarts after Stop
  delete globalThis.webkitSpeechRecognition;
});
