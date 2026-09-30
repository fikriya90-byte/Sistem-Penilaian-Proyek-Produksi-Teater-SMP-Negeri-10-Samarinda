/* ============================================================
   SP-PPT features-fix-kelas.js — v3.0 SUPER REPAIR PLUS
   Fix: Kelas hilang karena cache kosong / teacherEmail mismatch
   
   PERUBAHAN v3.0:
   - Deteksi mismatch teacherEmail (bukan hanya kosong)
   - Tawarkan CLAIM semua kelas kalau 0 match
   - Log diagnostik lengkap
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
   3. REPAIR UTAMA — v3.0 dengan auto-claim
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

  console.log('[fix-kelas] Mulai repair untuk:', u.email);

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
    window.DB.classes = freshClasses;

    var myEmail = String(u.email || '').toLowerCase().trim();
    var myName  = String(u.name  || '').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];

    // Hitung berapa yang match
    var matching = freshClasses.filter(function(c){
      var te = String(c.teacherEmail || '').toLowerCase().trim();
      var tn = String(c.teacherName  || '').toLowerCase().trim();
      if (!te) return true;
      if (te === myEmail) return true;
      if (tn && myName && tn === myName) return true;
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
      return false;
    });

    console.log('[fix-kelas] Kelas match untuk akun ini: ' + matching.length + '/' + freshClasses.length);

    // ===== KASUS KHUSUS: 0 match tapi ada kelas → mismatch =====
    if (matching.length === 0 && freshClasses.length > 0){
      console.warn('[fix-kelas] teacherEmail MISMATCH terdeteksi!');

      var emailCount = {};
      freshClasses.forEach(function(c){
        var te = String(c.teacherEmail || '').trim() || '(kosong)';
        emailCount[te] = (emailCount[te] || 0) + 1;
      });
      var info = Object.keys(emailCount).map(function(k){
        return '  • ' + k + ' → ' + emailCount[k] + ' kelas';
      }).join('\n');

      var ok = confirm(
        'KELAS TIDAK DITEMUKAN\n\n' +
        'Ada ' + freshClasses.length + ' kelas di database,\n' +
        'tetapi TIDAK ADA yang terhubung ke akun Anda:\n' +
        '  ' + myEmail + '\n\n' +
        'Email yang tersimpan di kelas:\n' + info + '\n\n' +
        'Apakah Anda ingin MENGAITKAN SEMUA kelas ini\n' +
        'ke akun Anda?\n\n' +
        '(Klik OK HANYA jika Anda yakin semua kelas ini milik Anda)'
      );

      if (!ok){
        console.log('[fix-kelas] User menolak claim.');
        if (callback) callback(false);
        return;
      }

      console.log('[fix-kelas] User setuju — claim ' + freshClasses.length + ' kelas...');

      var promises = freshClasses.map(function(c){
        var upd = Object.assign({}, c, {
          teacherEmail: u.email,
          teacherName: u.name || u.email
        });
        delete upd._id;
        return window.fbSet('classes', c.id, upd);
      });

      Promise.all(promises).then(function(){
        freshClasses.forEach(function(c){
          c.teacherEmail = u.email;
          c.teacherName  = u.name || u.email;
        });
        window.DB.classes = freshClasses;
        console.log('[fix-kelas] ✓ Claim selesai: ' + freshClasses.length + ' kelas');
        alert('Berhasil!\n\n' + freshClasses.length + ' kelas dikaitkan ke akun Anda.');
        if (window.renderGuruDash) window.renderGuruDash();
        if (callback) callback(true);
      }).catch(function(e){
        console.error('[fix-kelas] Claim gagal:', e);
        alert('Gagal claim: ' + e.message);
        if (callback) callback(false);
      });
      return;
    }

    // ===== KASUS NORMAL: repair teacherEmail yang kosong =====
    var repairs = [];
    freshClasses.forEach(function(c){
      var te = String(c.teacherEmail || '').trim();
      if (te === '' || te === 'undefined'){
        c.teacherEmail = u.email;
        c.teacherName  = u.name || u.email;
        var upd = Object.assign({}, c);
        delete upd._id;
        repairs.push(window.fbSet('classes', c.id, upd));
      }
    });

    Promise.all(repairs).then(function(){
      if (repairs.length > 0){
        console.log('[fix-kelas] ✓ ' + repairs.length + ' kelas di-repair (teacherEmail diisi)');
      }

      var mine = window.myClasses();
      console.log('[fix-kelas] Hasil myClasses(): ' + mine.length + ' kelas');
      mine.forEach(function(c){
        console.log('  ✓ ' + c.name + ' (teacherEmail: ' + (c.teacherEmail||'-') + ')');
      });

      if (window.currentUser.type === 'guru' && window.renderGuruDash){
        window.renderGuruDash();
        console.log('[fix-kelas] Dashboard di-refresh');
      }

      if (callback) callback(mine.length > 0);
    }).catch(function(e){
      console.warn('[fix-kelas] repair error:', e.message);
      if (callback) callback(window.myClasses().length > 0);
    });

  }).catch(function(err){
    console.error('[fix-kelas] GAGAL BACA FIRESTORE:', err.message);
    console.error('[fix-kelas] Kemungkinan: Firestore Rules memblokir read.');
    console.error('[fix-kelas] Cek: https://console.firebase.google.com/project/penilaian-proyek-teater-siswa/firestore/rules');
    if (callback) callback(false);
  });
};

/* ============================================================
   4. AUTO-RUN
   ============================================================ */
setTimeout(function(){
  if (window.currentUser && window.currentUser.type === 'guru'){
    window.__repairKelas();
  }
}, 2000);

/* Setelah login */
(function(){
  var orig = window.showApp;
  if (typeof orig !== 'function') return;
  window.showApp = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      if (window.currentUser && window.currentUser.type === 'guru'){
        window.__repairKelas();
      }
    }, 1500);
    return ret;
  };
})();

/* Setelah renderGuruDash, cek kalau kosong */
(function(){
  var orig = window.renderGuruDash;
  if (typeof orig !== 'function') return;
  window.renderGuruDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      try {
        var mine = window.myClasses();
        if (mine.length === 0 && window.currentUser && window.currentUser.type === 'guru'){
          window.__repairKelas();
        }
      } catch(e){}
    }, 1200);
    return ret;
  };
})();

/* ============================================================
   5. HANDLER MANUAL — Console
   ============================================================ */
window.fixKelasSekarang = function(){
  console.log('[fix-kelas] Manual repair...');
  window.__repairKelas(function(success){
    if (success){
      console.log('Kelas berhasil dimuat!');
      alert('Kelas berhasil dimuat! Lihat dashboard.');
    } else {
      console.log('Masih belum ada kelas.');
      alert('Kelas masih belum muncul.\n\nBuka Console (F12) untuk detail.');
    }
  });
};

/* Command diagnostik tambahan */
window.diagnosaKelas = function(){
  console.log('=== DIAGNOSA KELAS ===');
  console.log('Current User:', window.currentUser);
  console.log('Total kelas di DB:', (window.DB.classes||[]).length);
  console.log('myClasses():', window.myClasses().length);
  console.log('Firebase ready:', window.firebaseReady);
  console.log('=== DETAIL KELAS ===');
  (window.DB.classes||[]).forEach(function(c){
    console.log('- ' + c.name + ' | teacherEmail: "' + (c.teacherEmail||'') + '" | teacherName: "' + (c.teacherName||'') + '"');
  });
  if (!window.fb || !window.firebaseReady){
    console.log(' Firebase belum siap');
    return;
  }
  window.fb.collection('classes').get().then(function(snap){
    console.log('=== FIRESTORE ===');
    console.log('Jumlah kelas di Firestore:', snap.size);
    snap.forEach(function(d){
      var o = d.data();
      console.log('  - ' + (o.name||'-') + ' | teacherEmail: "' + (o.teacherEmail||'') + '"');
    });
  });
};

console.log('[features-fix-kelas] v3.0 SUPER REPAIR PLUS loaded');
console.log('  → Auto-repair saat login guru');
console.log('  → Auto-claim kalau teacherEmail mismatch');
console.log('  → Manual: ketik fixKelasSekarang() di Console');
console.log('  → Diagnosa: ketik diagnosaKelas() di Console');
})();
