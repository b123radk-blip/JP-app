// The app: wires scene, XR, input, audio, progress storage and the screens together. Screens are small modules:
// `create(app, props) -> { name, group, update(dt), dispose(), onPlaced?(), onEnvironment?(passthrough) }`.
import * as THREE from 'three';
import { SRS } from '../config.js';
import { createScene } from '../core/scene.js';
import { createInput } from '../core/input.js';
import { createXR } from '../core/xr.js';
import { createAudio } from '../core/audio.js';
import { createClock } from '../core/clock.js';
import { loadFonts, setAnisotropy } from '../core/text.js';
import { createScheduler } from '../srs/scheduler.js';
import { createStorage, safeBackend } from '../srs/storage.js';
import { loadDeckIndex, loadDeck } from '../content/loader.js';
import { createDebugPanel } from '../ui/debug-panel.js';
import * as home from './screens/home.js';
import * as study from './screens/study.js';
import * as done from './screens/done.js';

const screens = { home, study, done };
const $ = (id) => document.getElementById(id);

function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function startApp() {
  const kit = createScene();
  setAnisotropy(kit.renderer.capabilities.getMaxAnisotropy());
  const input = createInput(kit);
  let app;
  const xr = createXR({
    kit, input, statusEl: $('status'), buttonsEl: $('buttons'),
    onPlaced: () => app?.screen?.onPlaced?.(),
    onSession: ({ passthrough }) => { if (app) { app.passthrough = passthrough; app.screen?.onEnvironment?.(passthrough); } },
  });
  const audio = createAudio({ onNote: xr.note });
  const clock = createClock({ search: location.search });
  const { backend, persistent } = safeBackend();
  const storage = createStorage(backend);
  const loaded = storage.load();

  app = {
    kit, input, audio, clock, storage, persistent, srsConfig: SRS, scheduler: createScheduler(SRS),
    progress: loaded.data, passthrough: false, debug: { forceAnimation: 'auto' }, decks: [], screen: null,
    note: xr.note, say: (m) => { $('msg').textContent = m; },
    save: () => storage.save(app.progress),
    show(name, props = {}) {
      app.screen?.dispose();
      app.screen = screens[name].create(app, props);
      kit.card.add(app.screen.group);
      app.screen.onEnvironment?.(app.passthrough);
    },
  };
  kit.onFrame((dt) => app.screen?.update?.(dt));

  if (loaded.status === 'recovered' || loaded.status === 'future') xr.note(`Saved progress could not be read (${loaded.error}); a backup was kept and you are starting fresh.`);
  if (!persistent) app.say('This browser cannot store progress (private mode?): it will be lost when you close the page.');

  // 2D page controls: sound, and progress export / import (a safety net: browsers can clear site data)
  const hudButton = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.onclick = fn; $('buttons').append(b); return b; };
  const soundBtn = hudButton('Sound: on', () => { audio.setEnabled(!audio.enabled); soundBtn.textContent = `Sound: ${audio.enabled ? 'on' : 'off'}`; xr.note(''); });
  hudButton('Export progress', () => download(`jp-app-progress-${clock.today()}.json`, storage.exportJSON(app.progress)));
  const file = Object.assign(document.createElement('input'), { type: 'file', accept: 'application/json,.json' });
  file.onchange = async () => {
    try { const { data, dropped } = storage.importJSON(await file.files[0].text()); app.progress = data; app.save(); app.say(`Imported ${Object.keys(data.cards).length} cards${dropped ? ` (${dropped} unreadable entries skipped)` : ''}.`); app.show('home'); }
    catch (e) { xr.note(`Import failed: ${e.message}`); }
    file.value = '';
  };
  hudButton('Import progress', () => file.click());

  await Promise.all([loadFonts(), audio.init()]);
  const index = await loadDeckIndex();
  app.decks = await Promise.all(index.decks.map(async (d) => ({ ...d, cards: d.enabled ? (await loadDeck(d.file)).cards : [] })));
  app.show('home');
  createDebugPanel(app);

  // Test hook (also handy in the console): press buttons by id, find where one is on screen, jump the card timeline.
  window.__app = {
    app, ready: true,
    press: (id) => input.press(id), ids: () => input.ids(),
    screenPos(id) { const m = input.byId(id); if (!m) return null; kit.camera.updateMatrixWorld(true); const v = m.getWorldPosition(new THREE.Vector3()).project(kit.camera); return { x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight }; },
    seek: (t) => app.screen?.player?.seek(t),
    info: () => ({ screen: app.screen?.name, today: clock.today(), ids: input.ids(), player: app.screen?.player?.info?.() ?? null, cards: app.progress.cards }),
  };
  return app;
}
