/* ============================================================
   SP-PPT features-fix-kelas.js — v1.0
   Fix: Kelas tidak muncul karena teacherEmail mismatch
   
   TIDAK mengubah:
   - Fitur apapun
   - Desain / CSS
   - File lain manapun
   
   HANYA override:
   - window.myClasses  → toleran terhadap teacherEmail
   - window.ownsClass  → toleran terhadap teacherEmail
   - Auto-heal: isi teacherEmail kosong
   
   Load PALING AKHIR setelah features-fix.js
   ============================================================ */
(function(){
'use strict';

if (!window.DB){ console.warn('[fix-kelas] DB belum siap'); return; }

/* ============================================================
   1. TOLERANT myClasses
   Cocokkan kelas ke guru dengan 4 cara:
   1. teacherEmail persis sama
   2. teacherEmail kosong → tampilkan
   3. teacherName cocok dengan nama guru
   4. teacherName mengandung username email
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

      if (te && te === myEmail) return true;          // (1) email cocok
      if (!te) return true;                            // (2) email kosong
      if (tn && myName && tn === myName) return true;  // (3) nama cocok
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true; // (4) nama ↔ username
      return false;
    });
  }

  if (window.currentUser.type === 'siswa'){
    return all.filter(function(c){ return c.id === window.currentUser.classId; });
  }

  return [];
};

/* ============================================================
   2. TOLERANT ownsClass
   ============================================================ */
window.ownsClass = function(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;

  var c = (window.DB.classes || []).find(function(x){ return x.id === cid; });
  if (!c) return false;

  if (window.currentUser.type === 'siswa'){
    return window.currentUser.classId === cid;
  }

  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email || '').toLowerCase().trim();
    var myName  = String(window.currentUser.name  || '').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    var te = String(c.teacherEmail || '').toLowerCase().trim();
    var tn = String(c.teacherName  || '').toLowerCase().trim();

    if (te && te === myEmail) return true;
    if (!te) return true;
    if (tn && myName && tn === myName) return true;
    if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
    return false;
  }

  return false;
};

/* ============================================================
   3. AUTO-HEAL: isi teacherEmail / teacherName yang kosong
   Hanya berlaku untuk guru yang sedang login.
   Tidak menyentuh kelas yang sudah ada teacherEmail.
   ============================================================ */
window.__autoHealClasses = function(){
  if (!window.currentUser) return;
  if (window.currentUser.type !== 'guru' && window.currentUser.type !== 'admin') return;
  if (typeof window.fbSet !== 'function') return;

  var myEmail = window.currentUser.email || '';
  var myName  = window.currentUser.name  || '';
  if (!myEmail) return;

  var healed = 0;
  (window.DB.classes || []).forEach(function(c){
    var te = String(c.teacherEmail || '').trim();
    if (te === '' || te === 'undefined'){
      // Update di memori dulu supaya UI langsung berubah
      c.teacherEmail = myEmail;
      c.teacherName  = myName;

      // Update di Firestore
      var upd = Object.assign({}, c, {
        teacherEmail: myEmail,
        teacherName:  myName
      });
      delete upd._id;
      window.fbSet('classes', c.id, upd).then(function(){
        console.log('[fix-kelas] healed:', c.name);
      }).catch(function(e){
        console.warn('[fix-kelas] heal gagal:', c.name, e.message);
      });
      healed++;
    }
  });

  if (healed > 0){
    console.log('[fix-kelas] auto-heal selesai — ' + healed + ' kelas diperbaiki');
    // Refresh tampilan biar kelas langsung muncul
    if (typeof window.renderGuruDash === 'function'){
      setTimeout(window.renderGuruDash, 400);
    }
  }
};

/* ============================================================
   4. JALANKAN AUTO-HEAL
   - Saat load
   - Setelah 3 detik
   - Setelah 6 detik
   - Setiap kali renderGuruDash dipanggil
   ============================================================ */
setTimeout(function(){
  if (window.currentUser && window.currentUser.type === 'guru'){
    window.__autoHealClasses();
  }
}, 2500);

setTimeout(function(){
  if (window.currentUser && window.currentUser.type === 'guru'){
    window.__autoHealClasses();
  }
}, 6000);

/* Hook: setiap renderGuruDash, coba heal */
(function(){
  var orig = window.renderGuruDash;
  if (typeof orig !== 'function') return;
  window.renderGuruDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      try { window.__autoHealClasses(); } catch(e){}
    }, 1200);
    return ret;
  };
})();

console.log('[features-fix-kelas] v1.0 loaded — myClasses toleran + auto-heal');
})();
