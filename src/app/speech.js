// Speech to text for review notes (the browser's Web Speech API; in Chrome it sends the audio to Google's recogniser).
// createSpeech({ onText(text, interim), onState(listening), onError(message) }) -> { supported, listening, start(), stop() }.
// Listens until stop(), one phrase at a time: each recognition session hears one phrase (continuous mode is unreliable
// in Android Chrome, where the Galaxy XR browser runs: it repeats earlier words in later results and drops sessions),
// then a new one starts after a short pause. onText gets the text heard since start() and the words still being recognised.
export function createSpeech({ onText, onState, onError, lang = 'en-US' } = {}) {
  const Rec = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;
  let rec = null, want = false, done = '', phrase = '', interim = '', timer = 0, fails = 0;
  const join = (a, b) => [a, b].map((s) => s.trim()).filter(Boolean).join(' ');
  const finish = () => { clearTimeout(timer); timer = 0; rec = null; onText?.(done, ''); onState?.(false); };
  function open() {
    const r = rec = new Rec(); r.lang = lang; r.continuous = false; r.interimResults = true; r.maxAlternatives = 1;
    phrase = interim = '';
    r.onresult = (e) => {
      if (r !== rec) return;
      const last = e.results[e.results.length - 1];                    // one phrase per session: its latest guess is the whole phrase
      if (last.isFinal) { phrase = last[0].transcript; interim = ''; } else interim = last[0].transcript;
      fails = 0; onText?.(join(done, phrase), interim);
    };
    r.onerror = (e) => {
      if (r !== rec || e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'network' && ++fails < 3) return;                   // a dropped connection: onend tries again
      want = false;
      const why = { 'not-allowed': 'Speech to text or the microphone is blocked here', 'service-not-allowed': 'Speech to text is not available in this browser', 'audio-capture': 'No microphone found', network: 'Speech to text needs a connection' }[e.error];
      onError?.(why ?? `Speech to text failed (${e.error})`);
    };
    r.onend = () => {
      if (r !== rec) return;
      done = join(done, phrase || interim);                            // a phrase cut off before its final result still counts
      phrase = interim = '';
      if (!want) { finish(); return; }
      onText?.(done, '');
      timer = setTimeout(() => { timer = 0; if (!want) { finish(); return; } try { open(); } catch { want = false; finish(); } }, 150);
    };
    r.start();
  }
  return {
    supported: !!Rec,
    get listening() { return want; },
    start() {
      if (!Rec) { onError?.('Speech to text is not available in this browser'); return; }
      if (want) return;
      done = ''; fails = 0; want = true;
      try { open(); onState?.(true); } catch (e) { want = false; rec = null; onError?.(`Speech to text failed (${e.message})`); }
    },
    // stops at once: the words heard so far are kept, and the recogniser is told to finish in the background
    stop() {
      if (!want) return; want = false;
      const r = rec; rec = null; clearTimeout(timer); timer = 0;
      done = join(done, phrase || interim); phrase = interim = '';
      try { r?.abort(); } catch { /* already stopped */ }
      onText?.(done, ''); onState?.(false);
    },
  };
}
