/* ============================================================
   SP-PPT features-multifirebase.js — Dual Firebase Failover
   Fitur:
   1. Init 2 Firebase (Primary + Backup)
   2. Auto-failover saat primary error "resource-exhausted"
   3. Auto-recovery: cek primary tiap 5 menit, sync balik kalau pulih
   4. Panel monitoring status kedua server
   5. Log riwayat failover
   Load SETELAH app.js, SEBELUM features-fix.js
   ============================================================ */
(function(){
'use strict';

if (typeof firebase === 'undefined'){
  console.error('[multi-fb] Firebase SDK belum termuat'); return;
}
if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey){
  console.warn('[multi-fb] Primary config belum diisi'); return;
}

/* ============================================================
   1. INIT PRIMARY (sudah ada dari app.js)
   ============================================================ */
window.fbPrimary = null;
try {
  if (firebase.apps.length > 0){
    // App utama sudah di-init oleh app.js
    window.fbPrimary = firebase.app().firestore();
  }
} catch(e){ console.warn('[multi-fb] primary detect error:', e.message); }

/* ============================================================
   2. INIT BACKUP
   ============================================================ */
window.fbBackup = null;
window.fbBackupReady = false;
window.fbBackupError = '';

(function initBackup(){
  try {
    var cfg = window.FIREBASE_CONFIG_BACKUP;
    if (!cfg || !cfg.apiKey || String(cfg.apiKey).indexOf('ISI_') === 0){
      throw new Error('FIREBASE_CONFIG_BACKUP belum diisi');
    }
    var appBackup;
    try { appBackup = firebase.app('backup'); }
    catch(e){ appBackup = firebase.initializeApp(cfg, 'backup'); }
    window.fbBackup = appBackup.firestore();
    window.fbBackupReady = true;
    console.log('[multi-fb] Backup Firebase ready →', cfg.projectId);
  } catch(e){
    window.fbBackupError = e.message;
    console.warn('[multi-fb] Backup tidak aktif:', e.message);
  }
})();

/* ============================================================
   3. STATE — Firebase mana yang AKTIF?
   ============================================================ */
window.__activeFB = 'primary';   // 'primary' | 'backup'
window.__failoverLog = [];        // riwayat kejadian
window.__lastFailoverCheck = 0;

function logFailover(event, detail){
  var entry = {
    at: Date.now(),
    event: event,
    detail: detail || '',
    active: window.__activeFB
  };
  window.__failoverLog.unshift(entry);
  if (window.__failoverLog.length > 50) window.__failoverLog.pop();
  console.log('[multi-fb][failover]', event, detail || '');
  try { localStorage.setItem('sppt_failover_log', JSON.stringify(window.__failoverLog.slice(0, 20))); } catch(e){}
}
window.__logFailover = logFailover;

/* Restore log dari localStorage */
try {
  var saved = localStorage.getItem('sppt_failover_log');
  if (saved) window.__failoverLog = JSON.parse(saved) || [];
} catch(e){}

/* ============================================================
   4. DETEKSI ERROR QUOTA
   ============================================================ */
function isQuotaError(err){
  if (!err) return false;
  var msg = String(err.message || err.code || err || '').toLowerCase();
  return msg.indexOf('resource-exhausted') >= 0 ||
         msg.indexOf('quota') >= 0 ||
         msg.indexOf('exceeded') >= 0 ||
         msg.indexOf('too many requests') >= 0 ||
         msg.indexOf('429') >= 0;
}
window.__isQuotaError = isQuotaError;

/* ============================================================
   5. WRAPPER — set/get yang otomatis failover
   ============================================================ */
function getActiveFirestore(){
  if (window.__activeFB === 'backup' && window.fbBackupReady && window.fbBackup){
    return window.fbBackup;
  }
  return window.fbPrimary || window.fb;
}
window.__getActiveFB = getActiveFirestore;

/**
 * Set dokumen dengan auto-failover.
 * Kalau primary quota habis → switch ke backup & retry.
 */
window.fbSetSmart = function(col, id, data){
  var payload = data;
  try {
    if (window.sanitizeFirestore) payload = window.sanitizeFirestore(data);
    else if (window.U && window.U.safeFS) payload = window.U.safeFS(data);
  } catch(e){}

  var active = getActiveFirestore();
  if (!active) return Promise.reject(new Error('Firebase belum siap'));

  return active.collection(col).doc(id).set(payload, {merge:true})
    .catch(function(err){
      // Kalau primary error quota DAN backup ready → failover
      if (window.__activeFB === 'primary' && isQuotaError(err) && window.fbBackupReady){
        logFailover('FAILOVER', 'Primary quota habis → switch ke Backup. Error: ' + (err.message||err.code));
        window.__activeFB = 'backup';
        // Notifikasi halus ke user
        if (window.toast){
          window.toast('Server utama penuh — beralih ke server cadangan', 'warning');
        }
        // Retry ke backup
        return window.fbBackup.collection(col).doc(id).set(payload, {merge:true});
      }
      throw err;
    });
};

window.fbDelSmart = function(col, id){
  var active = getActiveFirestore();
  if (!active) return Promise.resolve();
  return active.collection(col).doc(id).delete()
    .catch(function(err){
      if (window.__activeFB === 'primary' && isQuotaError(err) && window.fbBackupReady){
        logFailover('FAILOVER', 'Primary quota habis (delete) → switch Backup');
        window.__activeFB = 'backup';
        if (window.toast) window.toast('Server utama penuh — beralih ke server cadangan', 'warning');
        return window.fbBackup.collection(col).doc(id).delete();
      }
      throw err;
    });
};

window.fbGetSmart = function(col, id){
  var active = getActiveFirestore();
  if (!active) return Promise.reject(new Error('Firebase belum siap'));
  return active.collection(col).doc(id).get()
    .catch(function(err){
      if (window.__activeFB === 'primary' && isQuotaError(err) && window.fbBackupReady){
        logFailover('FAILOVER', 'Primary quota habis (read) → switch Backup');
        window.__activeFB = 'backup';
        return window.fbBackup.collection(col).doc(id).get();
      }
      throw err;
    });
};

/* ============================================================
   6. OVERRIDE GLOBAL — Semua kode lama otomatis pakai Smart
   ============================================================ */
(function overrideGlobals(){
  // Simpan referensi asli (untuk debugging)
  window.__fbSetOriginal = window.fbSet;
  window.__fbDelOriginal = window.fbDel;

  // Ganti fbSet & fbDel dengan versi smart
  window.fbSet = window.fbSetSmart;
  window.fbDel = window.fbDelSmart;

  console.log('[multi-fb] Global fbSet/fbDel → failover-aware');
})();

/* ============================================================
   7. AUTO-RECOVERY — Cek primary tiap 5 menit
   ============================================================ */
function checkPrimaryRecovery(){
  if (window.__activeFB !== 'backup') return;
  if (!window.fbPrimary) return;

  window.__lastFailoverCheck = Date.now();

  // Coba write dummy ke primary
  var testDoc = window.fbPrimary.collection('_health_check').doc('ping_' + Date.now());
  testDoc.set({ t: Date.now(), src: 'auto-recovery' }, {merge:true})
    .then(function(){
      // Primary pulih! Sync dari Backup → Primary
      logFailover('RECOVERY', 'Primary sudah pulih — mulai sync dari Backup');
      if (window.toast) window.toast('Server utama sudah pulih — sinkronisasi data...', 'info');

      return syncBackupToPrimary();
    })
    .then(function(result){
      // Switch balik ke primary
      window.__activeFB = 'primary';
      logFailover('RECOVERED', 'Sync selesai (' + result.synced + ' dokumen) — kembali ke Primary');
      if (window.toast) window.toast('Kembali ke server utama (' + result.synced + ' data disinkron)', 'success');
      // Bersihkan test doc
      testDoc.delete().catch(function(){});
    })
    .catch(function(err){
      // Masih penuh
      if (isQuotaError(err)){
        logFailover('CHECK', 'Primary masih penuh — tetap pakai Backup');
      } else {
        logFailover('CHECK', 'Gagal cek primary: ' + (err.message||err.code));
      }
      testDoc.delete().catch(function(){});
    });
}

/* Cek setiap 5 menit */
setInterval(checkPrimaryRecovery, 5 * 60 * 1000);

/* Cek pertama setelah 1 menit (kalau sudah di backup) */
setTimeout(checkPrimaryRecovery, 60 * 1000);

/* ============================================================
   8. SYNC BACKUP → PRIMARY
   ============================================================ */
window.syncBackupToPrimary = function(){
  if (!window.fbBackupReady || !window.fbBackup) return Promise.reject(new Error('Backup tidak aktif'));
  if (!window.fbPrimary) return Promise.reject(new Error('Primary tidak aktif'));

  var cols = ['teachers','classes','evaluations','deadlines','activeStages',
              'notifications','checklists','meetings','activity_logs',
              'bookings','coordination','aduan','wa_logs','config',
              'keuangan','kas_kelas','peminjaman_barang','master_schedule',
              'jadwal_divisi','kalender_konten','jadwal_latihan','laporan_latihan',
              'templates_shared','template_uploads','gdrive_links_siswa',
              'gdrive_links','tasks','_health_check'];

  var totalSynced = 0;
  var chain = Promise.resolve();

  cols.forEach(function(col){
    chain = chain.then(function(){
      return window.fbBackup.collection(col).get().then(function(snap){
        if (snap.size === 0) return;
        var chunks = [];
        var currentBatch = window.fbPrimary.batch();
        var count = 0;

        snap.forEach(function(d){
          var ref = window.fbPrimary.collection(col).doc(d.id);
          currentBatch.set(ref, d.data(), {merge:true});
          count++;
          if (count >= 400){ // Firestore batch limit 500
            chunks.push(currentBatch.commit());
            currentBatch = window.fbPrimary.batch();
            count = 0;
          }
        });
        if (count > 0) chunks.push(currentBatch.commit());
        return Promise.all(chunks).then(function(){
          totalSynced += snap.size;
        });
      }).catch(function(e){
        console.warn('[multi-fb] sync ' + col + ' gagal:', e.message);
      });
    });
  });

  return chain.then(function(){
    return { synced: totalSynced };
  });
};

/* ============================================================
   9. SYNC PRIMARY → BACKUP (reverse — full backup)
   ============================================================ */
window.syncPrimaryToBackup = function(){
  if (!window.fbBackupReady) return Promise.reject(new Error('Backup tidak aktif'));

  var cols = ['teachers','classes','evaluations','deadlines','activeStages',
              'notifications','checklists','meetings','activity_logs',
              'bookings','coordination','aduan','wa_logs','config',
              'keuangan','kas_kelas','peminjaman_barang','master_schedule',
              'jadwal_divisi','kalender_konten','jadwal_latihan','laporan_latihan',
              'templates_shared','template_uploads','gdrive_links_siswa',
              'gdrive_links','tasks'];

  var total = 0;
  var chain = Promise.resolve();

  cols.forEach(function(col){
    chain = chain.then(function(){
      return window.fbPrimary.collection(col).get().then(function(snap){
        if (snap.size === 0) return;
        var chunks = [];
        var batch = window.fbBackup.batch();
        var count = 0;
        snap.forEach(function(d){
          var ref = window.fbBackup.collection(col).doc(d.id);
          batch.set(ref, d.data(), {merge:true});
          count++;
          if (count >= 400){
            chunks.push(batch.commit());
            batch = window.fbBackup.batch();
            count = 0;
          }
        });
        if (count > 0) chunks.push(batch.commit());
        return Promise.all(chunks).then(function(){ total += snap.size; });
      }).catch(function(e){
        console.warn('[multi-fb] backup ' + col + ' gagal:', e.message);
      });
    });
  });

  return chain.then(function(){ return { synced: total }; });
};

/* ============================================================
   10. UI — Panel Monitoring Status
   ============================================================ */
window.openStatusFirebase = function(){
  var active = window.__activeFB;
  var primOk = !!window.fbPrimary;
  var backOk = window.fbBackupReady;

  var h = '';

  /* Status besar */
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">';

  // Primary card
  var pColor = active === 'primary' ? 'var(--success)' : (primOk ? 'var(--warning)' : 'var(--danger)');
  var pLabel = active === 'primary' ? 'AKTIF' : (primOk ? 'STANDBY' : 'MATI');
  h += '<div style="padding:14px;background:var(--card);border:2px solid ' + pColor + ';border-radius:10px;">' +
    '<div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Server 1 (Primary)</div>' +
    '<div style="font-size:14px;font-weight:800;margin-top:4px;">' + (window.FIREBASE_CONFIG.projectId || '-') + '</div>' +
    '<div style="margin-top:6px;"><span class="badge" style="background:' + pColor + ';color:#fff;font-size:11px;">' + pLabel + '</span></div>' +
    '</div>';

  // Backup card
  var bColor = active === 'backup' ? 'var(--success)' : (backOk ? 'var(--info)' : 'var(--border-strong)');
  var bLabel = active === 'backup' ? 'AKTIF' : (backOk ? 'SIAGA' : 'BELUM SET');
  h += '<div style="padding:14px;background:var(--card);border:2px solid ' + bColor + ';border-radius:10px;">' +
    '<div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Server 2 (Backup)</div>' +
    '<div style="font-size:14px;font-weight:800;margin-top:4px;">' + (window.FIREBASE_CONFIG_BACKUP && window.FIREBASE_CONFIG_BACKUP.projectId || '-') + '</div>' +
    '<div style="margin-top:6px;"><span class="badge" style="background:' + bColor + ';color:#fff;font-size:11px;">' + bLabel + '</span></div>' +
    '</div>';

  h += '</div>';

  /* Info sistem */
  if (!backOk){
    h += '<div class="alert alert-warning">' + window.ico('warning','sm') +
      '<div><b>Backup belum aktif</b><br>' + (window.fbBackupError || 'FIREBASE_CONFIG_BACKUP belum diisi') + '</div></div>';
  }

  /* Aksi manual */
  if (backOk){
    h += '<div class="card" style="border-left:4px solid var(--primary);">';
    h += '<h3>' + window.ico('refresh') + ' Aksi Manual</h3>';
    h += '<div style="display:flex;flex-direction:column;gap:8px;">';
    h += '<button class="btn btn-primary" data-fx="fxSyncPrimToBack">' +
      window.ico('download','sm') + ' Backup Sekarang (Primary → Backup)</button>';
    h += '<button class="btn" data-fx="fxSyncBackToPrim">' +
      window.ico('upload','sm') + ' Restore dari Backup (Backup → Primary)</button>';
    h += '<button class="btn btn-warning" data-fx="fxForceSwitchBackup">' +
      window.ico('refresh','sm') + ' Paksa Aktifkan Backup</button>';
    if (active === 'backup'){
      h += '<button class="btn btn-success" data-fx="fxTryRecoverPrimary">' +
        window.ico('check','sm') + ' Coba Kembali ke Primary</button>';
    }
    h += '</div></div>';
  }

  /* Riwayat failover */
  h += '<div class="card" style="border-left:4px solid var(--info);">';
  h += '<h3>' + window.ico('activity') + ' Riwayat Failover</h3>';
  var log = window.__failoverLog || [];
  if (!log.length){
    h += '<div style="font-size:12.5px;color:var(--text-muted);padding:8px 0;">Belum ada kejadian failover. Sistem normal.</div>';
  } else {
    log.slice(0, 15).forEach(function(e){
      var color = e.event === 'FAILOVER' ? 'var(--warning)' :
                  e.event === 'RECOVERY' || e.event === 'RECOVERED' ? 'var(--success)' :
                  'var(--text-muted)';
      h += '<div style="padding:8px 10px;background:var(--surface);border-radius:6px;margin-bottom:5px;border-left:3px solid ' + color + ';">' +
        '<div style="font-weight:700;font-size:12px;color:' + color + ';">' + e.event + '</div>' +
        '<div style="font-size:11.5px;margin-top:2px;">' + (e.detail || '-') + '</div>' +
        '<div style="font-size:10.5px;color:var(--text-muted);margin-top:3px;">' + new Date(e.at).toLocaleString('id-ID') + '</div>' +
        '</div>';
    });
  }
  h += '</div>';

  /* Penjelasan */
  h += '<div class="alert alert-info" style="margin-top:12px;font-size:12px;">' +
    window.ico('info','sm') + '<div>' +
    '<b>Cara kerja:</b><br>' +
    '&bull; Aplikasi otomatis deteksi kalau Server 1 penuh (kuota habis)<br>' +
    '&bull; Kalau penuh → otomatis pindah ke Server 2<br>' +
    '&bull; Setiap 5 menit cek Server 1. Kalau sudah pulih → data dari Server 2 disinkron balik ke Server 1, lalu kembali normal.' +
    '</div></div>';

  window.openModal('Status Firebase', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   11. Handler aksi manual
   ============================================================ */
window.fxSyncPrimToBack = function(){
  if (!window.fbBackupReady){ alert('Backup tidak aktif'); return; }
  if (!confirm('Backup SEMUA data dari Server 1 ke Server 2?')) return;
  var btn = document.querySelector('[data-fx="fxSyncPrimToBack"]');
  var orig = btn ? btn.innerHTML : '';
  if (btn){ btn.disabled = true; btn.innerHTML = 'Memproses...'; }

  window.syncPrimaryToBackup().then(function(r){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    logFailover('MANUAL_BACKUP', 'Manual backup: ' + r.synced + ' dokumen');
    alert('Backup selesai!\n' + r.synced + ' dokumen tersalin ke Server 2.');
  }).catch(function(e){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    alert('Gagal: ' + e.message);
  });
};

window.fxSyncBackToPrim = function(){
  if (!confirm('Restore data dari Server 2 ke Server 1?\n\nData di Server 1 akan ditimpa.')) return;
  var btn = document.querySelector('[data-fx="fxSyncBackToPrim"]');
  var orig = btn ? btn.innerHTML : '';
  if (btn){ btn.disabled = true; btn.innerHTML = 'Memproses...'; }

  window.syncBackupToPrimary().then(function(r){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    logFailover('MANUAL_RESTORE', 'Manual restore: ' + r.synced + ' dokumen');
    alert('Restore selesai!\n' + r.synced + ' dokumen disalin ke Server 1.');
    location.reload();
  }).catch(function(e){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    alert('Gagal: ' + e.message);
  });
};

window.fxForceSwitchBackup = function(){
  if (!window.fbBackupReady){ alert('Backup tidak aktif'); return; }
  if (!confirm('Paksa pakai Server 2 (Backup)?\n\nSemua operasi akan masuk ke Server 2 sampai Anda kembali manual.')) return;
  window.__activeFB = 'backup';
  logFailover('MANUAL_SWITCH', 'User paksa switch ke Backup');
  alert('Sekarang memakai Server 2 (Backup).');
  window.openStatusFirebase();
};

window.fxTryRecoverPrimary = function(){
  if (!window.fbPrimary){ alert('Primary tidak aktif'); return; }
  window.checkPrimaryRecovery && window.checkPrimaryRecovery();
  setTimeout(function(){ window.openStatusFirebase(); }, 3000);
};

/* Expose checkPrimaryRecovery */
window.checkPrimaryRecovery = checkPrimaryRecovery;

/* ============================================================
   12. INIT — Sync awal sekali saat load
   ============================================================ */
setTimeout(function(){
  if (window.fbBackupReady && window.fbPrimary){
    console.log('[multi-fb] Sistem siap. Aktif:', window.__activeFB);
    console.log('[multi-fb] Backup URL: https://console.firebase.google.com/project/' +
      (window.FIREBASE_CONFIG_BACKUP.projectId || '?'));
  }
}, 3000);

console.log('[multi-fb] Dual Firebase FAILOVER loaded');
console.log('  → Primary:', window.FIREBASE_CONFIG.projectId || '?');
console.log('  → Backup :', (window.FIREBASE_CONFIG_BACKUP && window.FIREBASE_CONFIG_BACKUP.projectId) || '(belum diisi)');
console.log('  → Auto-failover: aktif');
console.log('  → Auto-recovery: cek tiap 5 menit');

})();
