import { startApp } from './app/app.js';

startApp().catch((e) => {
  console.error(e);
  const s = document.getElementById('status');
  if (s) s.insertAdjacentHTML('beforeend', `<br><span class="bad">The app failed to start: ${String(e.message || e).replace(/</g, '&lt;')}</span>`);
});
