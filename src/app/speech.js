// Speech to text for review notes (the browser's Web Speech API; in Chrome it sends the audio to Google's recogniser).
// createSpeech({ onText(text, interim), onState(listening), onError(message) }) -> { supported, listening, start(), stop() }.
// Listens until stop(): Chrome ends a session after a pause, so it is restarted until stop() is called. onText gets the
// final text heard since start() (each pause adds to it) and the words still being recognised.
export function createSpeech({ onText, onState, onError, lang = 'en-US' } = {}) {
  const Rec = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;
  let rec = null, want = false, heard = '', done = '';           // done: text from earlier sessions of this take
  const join = (a, b) => [a, b].map((s) => s.trim()).filter(Boolean).join(' ');
  function open() {
    rec = new Rec(); rec.lang = lang; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e) => {
      let finals = '', interim = '';                                    // e.results holds the whole session so far
      for (const r of e.results) { if (r.isFinal) finals = join(finals, r[0].transcript); else interim = join(interim, r[0].transcript); }
      heard = join(done, finals);
      onText?.(heard, interim);
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      want = false;
      const why = { 'not-allowed': 'Speech to text or the microphone is blocked here', 'service-not-allowed': 'Speech to text is not available in this browser', 'audio-capture': 'No microphone found', network: 'Speech to text needs a connection' }[e.error];
      onError?.(why ?? `Speech to text failed (${e.error})`);
    };
    rec.onend = () => { done = heard; if (want) { try { rec.start(); return; } catch { want = false; } } rec = null; onText?.(heard, ''); onState?.(false); };
    rec.start();
  }
  return {
    supported: !!Rec,
    get listening() { return want; },
    start() {
      if (!Rec) { onError?.('Speech to text is not available in this browser'); return; }
      if (want) return;
      heard = done = ''; want = true;
      try { open(); onState?.(true); } catch (e) { want = false; onError?.(`Speech to text failed (${e.message})`); }
    },
    stop() { if (!want) return; want = false; try { rec?.stop(); } catch { /* already stopped */ } },
  };
}
