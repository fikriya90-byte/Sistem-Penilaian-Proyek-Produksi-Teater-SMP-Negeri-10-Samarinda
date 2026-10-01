/* ============================================================
   Konfigurasi Firebase (Utama & Cadangan untuk Failover)
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyDczk0n-4QvvwTDikDBnuTkRX_SlXIV9JQ",
  authDomain: "penilaian-proyek-teater-siswa.firebaseapp.com",
  projectId: "penilaian-proyek-teater-siswa",
  storageBucket: "penilaian-proyek-teater-siswa.firebasestorage.app",
  messagingSenderId: "278312873930",
  appId: "1:278312873930:web:0de00becefffd9e4a2e933"
};

// Konfigurasi Firebase Cadangan (Failover otomatis jika kuota utama habis / 429)
const firebaseConfig = {
  apiKey: "AIzaSyBSbIJRXhsXsfHmJzSDLEVbN6PrDf-tz-s",
  authDomain: "penilaian-proyek-teatersiswa2.firebaseapp.com",
  projectId: "penilaian-proyek-teatersiswa2",
  storageBucket: "penilaian-proyek-teatersiswa2.firebasestorage.app",
  messagingSenderId: "164909498367",
  appId: "1:164909498367:web:a9cd478c6343b1511271ca"
};
