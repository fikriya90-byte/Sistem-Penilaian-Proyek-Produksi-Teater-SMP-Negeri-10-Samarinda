/* ============================================================
   SP-PPT features-fix-kelas.js — v2.0 SUPER REPAIR
   Fix: Kelas hilang karena cache kosong / teacherEmail mismatch
   
   Strategi:
   1. Langsung baca dari Firestore (bukan cache)
   2. Update window.DB.classes
   3. Auto-repair teacherEmail kalau kosong
   4. Force re-render dashboard
   
   TIDAK mengubah fitur atau desain.
   Load PALING AKHIR setelah features-fix.js
   ============================================================ */
(function(){
'use strict';

if (!window.DB){ console.warn('[fix-kelas] DB belum siap'); return; }

/* ============================================================
   1. myClasses TOLERAN — cocokkan dengan 4 cara
   ============================================================ */
window.myClasses = function(){
  if (!window.currentUser) return [];
  var all = window.DB.classes || [];
  if (window.currentUser.type === 'admin') return all.slice();

  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email || '').toLowerCase().trim();
    var myName  = String(window.currentUser.name  || '').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];

    return all.filter(function(c){
      var te = String(c.teacherEmail || '').toLowerCase().trim();
      var tn = String(c.teacherName  || '').toLowerCase().trim();

      if (!te) return true;                             // email kosong → terima
      if (te === myEmail) return true;                  // email cocok
      if (tn && myName && tn === myName) return true;   // nama cocok
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
      return false;
    });
  }

  if (window.currentUser.type === 'siswa'){
    return all.filter(function(c){ return c.id === window.currentUser.classId; });
  }
  return [];
};

/* ============================================================
   2. ownsClass TOLERAN
   ============================================================ */
window.ownsClass = function(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  var c = (window.DB.classes || []).find(function(x){ return x.id === cid; });
  if (!c) return false;

  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;

  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email || '').toLowerCase().trim();
    var myName  = String(window.currentUser.name  || '').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    var te = String(c.teacherEmail || '').toLowerCase().trim();
    var tn = String(c.teacherName  || '').toLowerCase().trim();

    if (!te) return true;
    if (te === myEmail) return true;
    if (tn && myName && tn === myName) return true;
    if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
  }
  return false;
};

/* ============================================================
   3. REPAIR UTAMA — Baca langsung dari Firestore
   ============================================================ */
window.__repairKelas = function(callback){
  if (!window.currentUser){
    if (callback) callback(false);
    return;
  }

  var u = window.currentUser;
  if (u.type !== 'guru' && u.type !== 'admin'){
    if (callback) callback(false);
    return;
  }

  if (!window.fb || !window.firebaseReady){
    console.warn('[fix-kelas] Firebase belum siap');
    if (callback) callback(false);
    return;
  }

  console.log('[fix-kelas] Mulai repair — baca langsung dari Firestore...');

  window.fb.collection('classes').get().then(function(snap){
    console.log('[fix-kelas] Firestore punya ' + snap.size + ' kelas');

    if (snap.size === 0){
      console.warn('[fix-kelas] Firestore KOSONG — tidak ada kelas');
      if (callback) callback(false);
      return;
    }

    // Bangun ulang array classes dari Firestore
    var freshClasses = snap.docs.map(function(d){
      var o = d.data();
      o.id = d.id;
      return o;
    });

    // Update window.DB.classes
    window.DB.classes = freshClasses;

    // Cari kelas yang perlu di-repair (teacherEmail kosong / beda)
    var myEmail = u.email || '';
    var myName  = u.name  || '';
    var repairs = [];

    freshClasses.forEach(function(c){
      var te = String(c.teacherEmail || '').trim();
      if (te === '' || te === 'undefined'){
        // Isi teacherEmail yang kosong
        c.teacherEmail = myEmail;
        c.teacherName  = myName;
        var upd = Object.assign({}, c);
        delete upd._id;
        repairs.push(window.fbSet('classes', c.id, upd));
      }
    });

    // Tunggu semua repair selesai
    Promise.all(repairs).then(function(){
      if (repairs.length > 0){
        console.log('[fix-kelas] ✓ ' + repairs.length + ' kelas di-repair (teacherEmail diisi)');
      }

      // Cek hasil
      var mine = window.myClasses();
      console.log('[fix-kelas] Hasil myClasses(): ' + mine.length + ' kelas');
      mine.forEach(function(c){
        console.log('  ✓ ' + c.name);
      });

      // Re-render dashboard
      if (window.currentUser.type === 'guru'){
        if (typeof window.renderGuruDash === 'function'){
          window.renderGuruDash();
          console.log('[fix-kelas] Dashboard di-refresh');
        }
      }

      if (callback) callback(mine.length > 0);
    }).catch(function(e){
      console.warn('[fix-kelas] repair error:', e.message);
      if (callback) callback(window.myClasses().length > 0);
    });

  }).catch(function(err){
    console.error('[fix-kelas] ❌ GAGAL BACA FIRESTORE:', err.message);
    console.error('[fix-kelas] Kemungkinan: Firestore Rules memblokir read.');
    console.error('[fix-kelas] Cek: https://console.firebase.google.com/project/penilaian-proyek-teater-siswa/firestore/rules');
    if (callback) callback(false);
  });
};

/* ============================================================
   4. AUTO-RUN — Jalankan repair otomatis
   ============================================================ */

/* Saat pertama load (kalau user sudah login) */
setTimeout(function(){
  if (window.currentUser && window.currentUser.type === 'guru'){
    window.__repairKelas();
  }
}, 2000);

/* Setelah login (hook showApp) */
(function(){
  var orig = window.showApp;
  if (typeof orig !== 'function') return;
  window.showApp = function(){
    var ret = orig.apply(this, arguments);
    // Kalau guru login, jalankan repair
    setTimeout(function(){
      if (window.currentUser && window.currentUser.type === 'guru'){
        window.__repairKelas();
      }
    }, 1500);
    return ret;
  };
})();

/* Setelah renderGuruDash, cek lagi kalau kosong */
(function(){
  var orig = window.renderGuruDash;
  if (typeof orig !== 'function') return;
  window.renderGuruDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      try {
        var mine = window.myClasses();
        // Kalau kosong tapi Firestore mungkin ada, coba repair
        if (mine.length === 0 && window.currentUser && window.currentUser.type === 'guru'){
          window.__repairKelas();
        }
      } catch(e){}
    }, 1000);
    return ret;
  };
})();

/* ============================================================
   5. HANDLER MANUAL — untuk dipanggil dari Console
   ============================================================ */
window.fixKelasSekarang = function(){
  console.log('[fix-kelas] Manual repair...');
  window.__repairKelas(function(success){
    if (success){
      console.log('✅ Kelas berhasil dimuat!');
      alert('✅ Kelas berhasil dimuat! Lihat dashboard.');
    } else {
      console.log('❌ Masih belum ada kelas. Cek pesan error di atas.');
      alert('❌ Kelas masih belum muncul.\n\nKemungkinan:\n1. Firestore Rules memblokir read\n2. Belum ada kelas di Firestore\n\nBuka Console (F12) untuk detail.');
    }
  });
};

console.log('[features-fix-kelas] v2.0 SUPER REPAIR loaded');
console.log('  → Auto-repair saat login guru');
console.log('  → Baca langsung dari Firestore (bukan cache)');
console.log('  → Manual: ketik fixKelasSekarang() di Console');
})();
