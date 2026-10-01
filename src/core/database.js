/* ============================================================
   SP-PPT Database Module — Multi-Firebase Failover & Real-Time Sync
   ============================================================ */
const DBService = {
  activeFB: 'primary',
  
  init: function() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      window.fbPrimary = firebase.firestore();
    }
    
    if (window.FIREBASE_BACKUP_CONFIG && window.FIREBASE_BACKUP_CONFIG.apiKey) {
      try {
        const backupApp = firebase.initializeApp(window.FIREBASE_BACKUP_CONFIG, 'backupApp');
        window.fbBackup = backupApp.firestore();
        window.fbBackupReady = true;
      } catch(e) {
        console.warn('Gagal menginisialisasi Firebase Backup:', e);
      }
    }
  },

  getActiveInstance: function() {
    if (this.activeFB === 'backup' && window.fbBackupReady && window.fbBackup) {
      return window.fbBackup;
    }
    return window.fbPrimary || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
  },

  isQuotaError: function(err) {
    const msg = String(err.message || err.code || '').toLowerCase();
    return msg.includes('resource-exhausted') || msg.includes('quota') || msg.includes('429');
  },

  set: function(collection, id, data) {
    const db = this.getActiveInstance();
    if (!db) return Promise.reject(new Error('Firebase instance tidak siap.'));
    
    return db.collection(collection).doc(id).set(data, { merge: true })
      .catch((err) => {
        if (this.activeFB === 'primary' && this.isQuotaError(err) && window.fbBackupReady) {
          this.activeFB = 'backup';
          console.warn('[FAILOVER] Primary quota exhausted. Switching to Backup.');
          if (typeof window.toast === 'function') window.toast('Beralih ke server cadangan.', 'warning');
          return window.fbBackup.collection(collection).doc(id).set(data, { merge: true });
        }
        throw err;
      });
  },

  listenCollection: function(collectionName, callback) {
    const db = this.getActiveInstance();
    if (!db) return;
    
    db.collection(collectionName).onSnapshot((snapshot) => {
      const dataList = [];
      snapshot.forEach(doc => {
        dataList.push({ id: doc.id, ...doc.data() });
      });
      callback(dataList);
    }, (error) => {
      console.error(`Gagal menyinkronkan koleksi ${collectionName}:`, error);
    });
  }
};

window.DBService = DBService;
window.fbSet = (col, id, data) => DBService.set(col, id, data);
