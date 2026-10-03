/**
 * app.js
 * Entry point: init firebase, UI, and service worker registration.
 */

import { initUI } from './ui.js';
import { APP_INFO } from './config.js';

/** Initialize app */
function init() {
  // set document title
  document.title = `${APP_INFO.nama} — ${APP_INFO.sekolah}`;
  initUI();
}

window.addEventListener('DOMContentLoaded', () => {
  init();
});