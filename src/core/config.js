/* ============================================================
   Konfigurasi Firebase (Utama & Cadangan untuk Failover)
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_PRIMARY_API_KEY",
  authDomain: "spppt-app.firebaseapp.com",
  projectId: "spppt-app",
  storageBucket: "spppt-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};

// Konfigurasi Firebase Cadangan (Failover otomatis jika kuota utama habis / 429)
window.FIREBASE_BACKUP_CONFIG = {
  apiKey: "YOUR_BACKUP_API_KEY",
  authDomain: "spppt-backup.firebaseapp.com",
  projectId: "spppt-backup",
  storageBucket: "spppt-backup.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:321:web:xyz"
};
