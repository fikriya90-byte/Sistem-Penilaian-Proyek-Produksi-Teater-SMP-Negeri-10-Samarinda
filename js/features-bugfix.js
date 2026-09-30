/* ============================================================
   SP-PPT features-bugfix.js — v1.0 CRITICAL FIX
   Load PALING AKHIR setelah features-fix.js
   ============================================================ */
(function(){
'use strict';

if (!window.DB || typeof window.ico !== 'function'){ 
  console.warn('[bugfix] app.js belum siap, skip'); 
  return; 
}

/* ============================================================
   DEFAULT TEACHERS (fallback hardcoded)
   ============================================================ */
var FALLBACK_TEACHERS = [{
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar Arrazaq, S.Sn.',
  phone: ''
}];

/* ============================================================
   BUG #1 FIX — loginGuru dengan fallback berlapis
   ============================================================ */
window.loginGuru = function(){
  var e = (document.getElementById('guru-email').value || '').trim().toLowerCase();
  var p = (document.getElementById('guru-password').value || '').trim();

  if (!e || !p){ alert('Lengkapi email dan password!'); return; }

  var btn = document.querySelector('#form-login-guru button[type="submit"]');
  var orig = btn ? btn.innerHTML : '';
  if (btn){ btn.disabled = true; btn.innerHTML = 'Memeriksa...'; }

  function finish(t){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    if (!t){ alert('Email atau password salah!'); return; }
    window.currentUser = {
      type: 'guru',
      email: t.email,
      name: t.name,
      phone: t.phone || ''
    };
    if (window.saveSession) window.saveSession();
    if (window.logActivity) window.logActivity('login', t.name + ' login', {});
    if (window.showApp) window.showApp();
  }

  // LANGKAH 1: Cek di DB.teachers (hasil snapshot Firestore)
  var t = (window.DB.teachers || []).find(function(x){
    return x.email && String(x.email).toLowerCase() === e &&
           String(x.password || '').trim() === p;
  });
  if (t){ finish(t); return; }

  // LANGKAH 2: Cek di FALLBACK_TEACHERS (hardcoded)
  t = FALLBACK_TEACHERS.find(function(x){
    return x.email.toLowerCase() === e && x.password === p;
  });
  if (t){
    if (window.fbSet) window.fbSet('teachers', t.email, t).catch(function(){});
    finish(t);
    return;
  }

  // LANGKAH 3: Baca langsung ke Firestore
  if (window.fb && window.firebaseReady){
    window.fb.collection('teachers').doc(e).get()
      .then(function(snap){
        if (snap.exists){
          var td = snap.data();
          if (String(td.password || '').trim() === p){
            finish({ email: td.email || e, name: td.name || e, phone: td.phone || '' });
            return;
          }
        }
        finish(null);
      })
      .catch(function(err){
        console.error('[loginGuru] Firestore error:', err.message);
        finish(null);
      });
    return;
  }

  finish(null);
};

/* ============================================================
   BUG #2 FIX — loginSiswa dengan fallback Firestore direct
   ============================================================ */
window.loginSiswa = function(){
  var cid = document.getElementById('siswa-kelas').value;
  var inp = (document.getElementById('siswa-email').value || '').trim();
  var p = (document.getElementById('siswa-password').value || '').trim();

  if (!cid){ alert('Pilih kelas dulu!'); return; }
  if (!inp){ alert('Email atau No. WA wajib diisi!'); return; }
  if (!p){ alert('Password wajib diisi!'); return; }

  var btn = document.querySelector('#form-login-siswa button[type="submit"]');
  var orig = btn ? btn.innerHTML : '';
  if (btn){ btn.disabled = true; btn.innerHTML = 'Memeriksa...'; }

  var isEmail = inp.indexOf('@') >= 0;
  var emailL = inp.toLowerCase();
  var phoneC = inp.replace(/\D/g,'');

  function match(x){
    if (!x || !x.password) return false;
    if (String(x.password).trim() !== p) return false;
    if (isEmail) return x.email && String(x.email).toLowerCase() === emailL;
    return x.phone && String(x.phone).replace(/\D/g,'') === phoneC;
  }

  function finish(s, c){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    if (!s || !c){ alert('Email/WA atau password salah!'); return; }
    window.currentUser = {
      type: 'siswa',
      classId: c.id,
      studentId: s.id,
      name: s.name,
      role: s.role,
      phone: s.phone || '',
      email: s.email || ''
    };
    if (window.saveSession) window.saveSession();
    if (window.logActivity) window.logActivity('login', s.name + ' login', {classId: c.id});
    if (window.showApp) window.showApp();
  }

  // LANGKAH 1: Cek di DB.classes lokal
  var c = (window.DB.classes || []).find(function(x){ return x.id === cid; });
  if (c){
    var s = (c.students || []).find(match);
    if (s){ finish(s, c); return; }
  }

  // LANGKAH 2: Baca langsung Firestore
  if (window.fb && window.firebaseReady){
    window.fb.collection('classes').doc(cid).get()
      .then(function(snap){
        if (!snap.exists){ finish(null, null); return; }
        var fresh = snap.data();
        fresh.id = cid;
        var idx = (window.DB.classes || []).findIndex(function(x){ return x.id === cid; });
        if (idx >= 0) window.DB.classes[idx] = fresh;
        else window.DB.classes.push(fresh);
        var s2 = (fresh.students || []).find(match);
        finish(s2 || null, fresh);
      })
      .catch(function(err){
        console.error('[loginSiswa] Firestore error:', err.message);
        finish(null, null);
      });
    return;
  }

  finish(null, null);
};

/* ============================================================
   BUG #3 FIX — tandaiTugasSelesai: fix ReferenceError u()
   ============================================================ */
window.tandaiTugasSelesai = function(id){
  var n = (window.DB.notifications || []).find(function(x){ return x.id === id; });
  if (!n){ alert('Notifikasi tidak ditemukan'); return; }

  var me = window.currentUser || {};
  var key;
  if (me.type === 'siswa') key = me.studentId;
  else if (me.type === 'guru') key = 'guru:' + String(me.email||'').toLowerCase();
  else if (me.type === 'admin') key = 'admin';
  else key = 'anon';

  if (!key){ alert('Tidak bisa menandai tugas'); return; }

  var db = (n.doneBy || []).slice();
  if (db.indexOf(key) >= 0){ alert('Tugas sudah ditandai selesai'); return; }
  db.push(key);

  window.fbSet('notifications', id, Object.assign({}, n, { doneBy: db }))
    .then(function(){
      if (window.logActivity){
        window.logActivity('task_done',
          (me.name || 'User') + ' tandai tugas selesai: ' + (n.title || ''),
          { classId: n.classId });
      }
      alert('Tugas ditandai selesai!');
      if (window.renderNotifPanel) window.renderNotifPanel();
      if (window.updateBadge) window.updateBadge();
    })
    .catch(function(err){
      console.error('[tandaiTugasSelesai]', err);
      alert('Gagal: ' + err.message);
    });
};

/* ============================================================
   BUG #4 FIX — registerSiswa: notification ID mismatch
   ============================================================ */
(function patchRegister(){
  var orig = window.registerSiswa;
  if (typeof orig !== 'function') return;

  window.registerSiswa = function(){
    var code = (document.getElementById('daftar-code').value || '').trim().toUpperCase();
    var name = (document.getElementById('daftar-name').value || '').trim();
    var email = (document.getElementById('daftar-email').value || '').trim().toLowerCase();
    var phone = (document.getElementById('daftar-phone').value || '').replace(/\D/g,'');
    var pw = document.getElementById('daftar-password').value;
    var cf = document.getElementById('daftar-confirm').value;
    var roleEl = document.getElementById('daftar-role');
    var role = roleEl ? roleEl.value : 'pemain';

    if (!code || !name || !email || !phone || !pw || !cf){
      alert('Lengkapi semua field!'); return;
    }
    if (phone.length < 10 || phone.length > 15){ alert('No. WA tidak valid! (10-15 digit)'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
    if (pw.length < 6){ alert('Password minimal 6 karakter!'); return; }
    if (pw !== cf){ alert('Konfirmasi password tidak cocok!'); return; }
    if (!role){ role = 'pemain'; }

    var cls = (window.DB.classes || []).find(function(c){ return c.code === code; });
    if (!cls){ alert('Kode Kelas tidak valid!'); return; }

    var dup = false;
    (window.DB.classes || []).forEach(function(c){
      if ((c.students||[]).some(function(s){
        return s.email && String(s.email).toLowerCase() === email;
      })) dup = true;
    });
    if (dup){ alert('Email sudah terdaftar!'); return; }

    var dupPhone = false;
    (window.DB.classes || []).forEach(function(c){
      if ((c.students||[]).some(function(s){ return s.phone === phone; })) dupPhone = true;
    });
    if (dupPhone){ alert('No. WA sudah terdaftar!'); return; }

    var ns = {
      id: window.uid ? window.uid() : ('id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6)),
      name: name, email: email, phone: phone,
      password: pw, role: role, registeredAt: Date.now()
    };
    var newStudents = (cls.students || []).concat([ns]);

    window.fbSet('classes', cls.id, Object.assign({}, cls, { students: newStudents }))
      .then(function(){
        var notifId = window.uid ? window.uid() : ('notif_' + Date.now().toString(36));
        window.fbSet('notifications', notifId, {
          id: notifId,
          classId: cls.id,
          fromId: ns.id, fromName: name, fromType: 'siswa',
          toId: 'guru', type: 'info',
          title: 'Pendaftaran Siswa Baru',
          message: name + ' mendaftar di ' + cls.name + ' sebagai ' + role,
          createdAt: Date.now(), readBy: [], doneBy: []
        }).catch(function(){});

        if (window.logActivity){
          window.logActivity('student_register',
            name + ' mendaftar di ' + cls.name, { classId: cls.id });
        }

        alert('Pendaftaran berhasil!\n\nNama: ' + name + '\nKelas: ' + cls.name + '\n\nSilakan login.');
        if (window.showLoginPage) window.showLoginPage();
        if (window.switchLoginTab) window.switchLoginTab('siswa');
        setTimeout(function(){
          var sel = document.getElementById('siswa-kelas');
          if (sel) sel.value = cls.id;
          var em = document.getElementById('siswa-email');
          if (em) em.value = email;
        }, 300);
      })
      .catch(function(err){
        alert('Gagal mendaftar: ' + err.message);
      });
  };
})();

/* ============================================================
   BUG #5 FIX — Auto-seed guru bawaan dengan retry
   ============================================================ */
function seedDefaultTeachers(attempt){
  attempt = attempt || 1;
  if (!window.fb || !window.firebaseReady) return;
  if (window.DB.teachers && window.DB.teachers.length > 0) return;

  window.fb.collection('teachers').get()
    .then(function(snap){
      if (snap.size > 0) return;
      var batch = window.fb.batch();
      FALLBACK_TEACHERS.forEach(function(t){
        batch.set(window.fb.collection('teachers').doc(t.email), t);
      });
      return batch.commit();
    })
    .then(function(){
      console.log('[bugfix] ✓ Default teachers seeded ke Firestore');
    })
    .catch(function(err){
      console.warn('[bugfix] Seed attempt ' + attempt + ' gagal:', err.message);
      if (attempt < 3){
        setTimeout(function(){ seedDefaultTeachers(attempt + 1); }, 3000);
      }
    });
}

setTimeout(function(){ seedDefaultTeachers(1); }, 3000);
setTimeout(function(){ seedDefaultTeachers(1); }, 8000);

console.log('[features-bugfix] v1.0 loaded — 5 bugs fixed');
console.log('  ✓ loginGuru fallback (DEFAULT_TEACHERS + Firestore)');
console.log('  ✓ loginSiswa fallback Firestore direct');
console.log('  ✓ tandaiTugasSelesai fixed u() undefined');
console.log('  ✓ registerSiswa fixed notification ID');
console.log('  ✓ Auto-seed guru bawaan dengan retry');

})();
