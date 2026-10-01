/**
 * @file config.js
 * Konfigurasi Firebase, role, dan konstanta sistem SP-PPT.
 */

export const FIREBASE_PRIMARY = {
  apiKey: import.meta.env.VITE_FB_API_KEY || 'AIzaSyDczk0n-4QvvwTDikDBnuTkRX_SlXIV9JQ',
  authDomain: 'penilaian-proyek-teater-siswa.firebaseapp.com',
  projectId: 'penilaian-proyek-teater-siswa',
  storageBucket: 'penilaian-proyek-teater-siswa.firebasestorage.app',
  messagingSenderId: '278312873930',
  appId: '1:278312873930:web:0de00becefffd9e4a2e933',
};

export const FIREBASE_BACKUP = {
  apiKey: import.meta.env.VITE_FB_BACKUP_API_KEY || 'AIzaSyBSbIJRXhsXsfHmJzSDLEVbN6PrDf-tz-s',
  authDomain: 'penilaian-proyek-teatersiswa2.firebaseapp.com',
  projectId: 'penilaian-proyek-teatersiswa2',
  storageBucket: 'penilaian-proyek-teatersiswa2.firebasestorage.app',
  messagingSenderId: '164909498367',
  appId: '1:164909498367:web:a9cd478c6343b1511271ca',
};

export const ROLES = {
  pimpinan_produksi: { label: 'Pimpinan Produksi',      divisi: 'inti',          level: 1 },
  sutradara:         { label: 'Sutradara',              divisi: 'inti',          level: 1 },
  asisten_sutradara: { label: 'Asisten Sutradara',      divisi: 'inti',          level: 2 },
  sekretaris:        { label: 'Sekretaris',             divisi: 'inti',          level: 2 },
  bendahara:         { label: 'Bendahara',              divisi: 'inti',          level: 2 },

  koor_perlengkapan:    { label: 'Koordinator Perlengkapan', divisi: 'perlengkapan', level: 3, koordinator: true },
  anggota_perlengkapan: { label: 'Anggota Perlengkapan',     divisi: 'perlengkapan', level: 4 },

  koor_publikasi:    { label: 'Koordinator Publikasi',  divisi: 'publikasi', level: 3, koordinator: true },
  anggota_publikasi: { label: 'Anggota Publikasi',      divisi: 'publikasi', level: 4 },

  koor_rias:    { label: 'Koordinator Tata Rias', divisi: 'rias', level: 3, koordinator: true },
  anggota_rias: { label: 'Anggota Tata Rias',     divisi: 'rias', level: 4 },

  koor_busana:    { label: 'Koordinator Tata Busana', divisi: 'busana', level: 3, koordinator: true },
  anggota_busana: { label: 'Anggota Tata Busana',     divisi: 'busana', level: 4 },

  koor_musik:    { label: 'Koordinator Tata Musik', divisi: 'musik', level: 3, koordinator: true },
  anggota_musik: { label: 'Anggota Tata Musik',     divisi: 'musik', level: 4 },

  koor_pemeran: { label: 'Koordinator Pemeran', divisi: 'pemeran', level: 3, koordinator: true },
  pemain:       { label: 'Pemeran',             divisi: 'pemeran', level: 4 },
};

export const DIVISIONS = {
  inti:          { label: 'Pengurus Inti',              icon: 'shield' },
  perlengkapan:  { label: 'Perlengkapan',               icon: 'tool' },
  publikasi:     { label: 'Publikasi & Dokumentasi',    icon: 'camera' },
  rias:          { label: 'Tata Rias',                  icon: 'palette' },
  busana:        { label: 'Tata Busana',                icon: 'shirt' },
  musik:         { label: 'Tata Musik & Suara',         icon: 'music' },
  pemeran:       { label: 'Pemeran',                    icon: 'star' },
};

export const DEFAULT_STAGES = [
  { id: 'development', name: 'Development', weight: 15, order: 1 },
  { id: 'latihan',     name: 'Latihan',     weight: 25, order: 2 },
  { id: 'gladi',       name: 'Gladi Resik', weight: 25, order: 3 },
  { id: 'pementasan',  name: 'Pementasan',  weight: 25, order: 4 },
  { id: 'evaluasi',    name: 'Evaluasi',    weight: 10, order: 5 },
];

export const RUBRIC_ASPECTS = [
  { id: 'kerjasama',      name: 'Kerja Sama',       weight: 25 },
  { id: 'tanggungjawab',  name: 'Tanggung Jawab',   weight: 25 },
  { id: 'kehadiran',      name: 'Kehadiran',        weight: 20 },
  { id: 'kreativitas',    name: 'Kreativitas',      weight: 15 },
  { id: 'teknis',         name: 'Kemampuan Teknis', weight: 15 },
];

export const EVALUATOR_WEIGHTS = {
  guru:  0.60,
  ketua: 0.25,
  rekan: 0.15,
};

export const LIMITS = {
  MAX_CLASSES: 15,
  MAX_UPLOAD_SIZE: 102400,
  TOAST_DURATION: 2600,
  THROTTLE_MS: 2000,
  NOTIF_TTL_DAYS: 30,
};

export const ADMIN = {
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  name: 'Fikri Yassaar (Admin)',
};
