/**
 * firebase-init.js
 * Inisialisasi Firebase Realtime Database (global firebase SDK digunakan).
 *
 * Export:
 *  - db (firebase.database())
 *  - getRef(path) -> reference
 */

import { FIREBASE_CONFIG } from './config.js';

if (!window.firebase || !window.firebase.app) {
  console.error('Firebase SDK tidak ditemukan. Pastikan script firebase-app.js & firebase-database.js dimuat di index.html');
}

/** Initialize Firebase app (idempotent) */
function initFirebase() {
  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
      console.info('Firebase diinisialisasi.');
    }
    return firebase.database();
  } catch (err) {
    console.error('Gagal inisialisasi Firebase', err);
    throw err;
  }
}

const db = initFirebase();

/**
 * Dapatkan reference ke path di Realtime Database
 * @param {string} path - path seperti 'users' atau 'kelas/IX-A'
 * @returns {firebase.database.Reference}
 */
function getRef(path) {
  return db.ref(path);
}

export { db, getRef };