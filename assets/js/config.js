/**
 * Konfigurasi aplikasi (export)
 * @module config
 */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDczk0n-4QvvwTDikDBnuTkRX_SlXIV9JQ",
  authDomain: "penilaian-proyek-teater-siswa.firebaseapp.com",
  projectId: "penilaian-proyek-teater-siswa",
  databaseURL: "https://penilaian-proyek-teater-siswa-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "penilaian-proyek-teater-siswa.firebasestorage.app",
  messagingSenderId: "278312873930",
  appId: "1:278312873930:web:0de00becefffd9e4a2e933"
};

export const APP_INFO = {
  nama: 'SP-PPT',
  sekolah: 'SMP Negeri 10 Samarinda',
  alamat: 'Jl. Untung Suropati No. 10, Samarinda 75126',
  tahunAjaran: '2024/2025',
  versi: '1.0.0'
};

export const GRADING_WEIGHTS = { guru: 0.60, ketua: 0.25, rekan: 0.15 };

export const WHATSAPP_GURU = '6281254320981'; // Nomor WA guru pengampu

export const LOGO_SEKOLAH = 'https://iili.io/nBiviCX.png';
export const LOGO_MAPEL = 'https://iili.io/nap50AB.png';
export const BACKGROUND_IMG = 'https://iili.io/nJ1Rcj1.png';

export const KELAS_LIST = [
  { id: 'IX-A', kode: 'IXA-2025', lakon: 'Naskah Tradisi Pesisir Mahakam' },
  { id: 'IX-B', kode: 'IXB-2025', lakon: 'Pantomim & Gerak Mahakam' },
  { id: 'IX-C', kode: 'IXC-2025', lakon: 'Teater Cerita Rakyat Kaltim' }
];

export const TAHAPAN = [
  'Development', 'Latihan', 'Gladi Resik', 'Pementasan', 'Evaluasi'
];

export const DIVISI_LIST = [
  'Perlengkapan', 'Publikasi', 'Panggung', 'Musik',
  'Rias', 'Busana', 'Dokumentasi'
];

export const PERAN_LIST = [
  'Pimpinan Produksi', 'Sutradara', 'Asisten Sutradara',
  'Sekretaris', 'Bendahara', 'Koordinator Divisi',
  'Anggota Divisi', 'Pemain'
];