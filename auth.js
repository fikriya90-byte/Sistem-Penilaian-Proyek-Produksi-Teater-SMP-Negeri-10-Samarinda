/* ============================================================
   CORE / AUTH — Login + Register (CASE-INSENSITIVE + TRIM)
   ============================================================ */
(function(){
'use strict';

var ADMIN = { email: 'fikri.yassaar15@guru.smp.belajar.id', password: '#Smpn10smd', name: 'Fikri Yassaar (Admin)' };
var DEFAULT_TEACHERS = [{ email: 'fikri.yassaar15@guru.smp.belajar.id', password: '#Smpn10smd', name: 'Fikri Yassaar, S.Sn.' }];

/* Tab switching */
document.addEventListener('click', function(e){
  var tab = e.target.closest('.tab');
  if (!tab) return;
  var name = tab.getAttribute('data-tab');
  if (!name) return;
  document.querySelectorAll('.tab').forEach(function(t){
    t.classList.toggle('active', t === tab);
  });
  ['guru','siswa','admin'].forEach(function(x){
    var f = document.getElementById('form-login-' + x);
    if (f) f.classList.toggle('hidden', x !== name);
  });
});

/* ============================================================
   LOGIN GURU
   ============================================================ */
document.addEventListener('DOMContentLoaded', function(){
  var formGuru = document.getElementById('form-login-guru');
  if (formGuru){
    formGuru.addEventListener('submit', function(e){
      e.preventDefault();
      var email = window.U.normEmail(document.getElementById('guru-email').value);
      var pw = String(document.getElementById('guru-password').value || '').trim();
      if (!email || !pw){ window.toast('Lengkapi email & password', 'warning'); return; }

      var t = (window.DB.teachers || []).find(function(x){
        return window.U.normEmail(x.email) === email && String(x.password).trim() === pw;
      });
      if (!t){ window.toast('Email atau password salah', 'error'); return; }

      window.currentUser = { type: 'guru', email: t.email, name: t.name };
      window.saveSession();
      window.logAct('login', t.name + ' login', {});
      window.showApp();
    });
  }

  /* ============================================================
     LOGIN SISWA — FIX CASE-INSENSITIVE + TRIM
     ============================================================ */
  var formSiswa = document.getElementById('form-login-siswa');
  if (formSiswa){
    formSiswa.addEventListener('submit', function(e){
      e.preventDefault();
      var cid = document.getElementById('siswa-kelas').value;
      var input = String(document.getElementById('siswa-login').value || '').trim();
      var pw = String(document.getElementById('siswa-password').value || '').trim();

      if (!cid){ window.toast('Pilih kelas dulu', 'warning'); return; }
      if (!input){ window.toast('Email/WA wajib diisi', 'warning'); return; }
      if (!pw){ window.toast('Password wajib diisi', 'warning'); return; }

      var btn = formSiswa.querySelector('button[type="submit"]');
      var orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Memeriksa...';

      function finish(s, c){
        btn.disabled = false;
        btn.innerHTML = orig;
        if (!s){
          window.toast('Email/WA atau password salah', 'error');
          return;
        }
        window.currentUser = {
          type: 'siswa',
          classId: c.id,
          studentId: s.id,
          name: window.U.trim(s.name),
          role: s.role,
          phone: window.U.normPhone(s.phone),
          email: window.U.normEmail(s.email)
        };
        window.saveSession();
        window.logAct('login', s.name + ' login', { classId: c.id });
        window.showApp();
      }

      var isEmail = input.indexOf('@') >= 0;
      var emailLower = input.toLowerCase();
      var phoneClean = window.U.normPhone(input);
      var pwLower = pw.toLowerCase();

      function match(s){
        if (!s || !s.name || !s.password) return false;
        var sPw = String(s.password).trim();
        // case-insensitive + trim password
        if (sPw !== pw && sPw.toLowerCase() !== pwLower) return false;
        if (isEmail){
          return window.U.normEmail(s.email) === emailLower;
        }
        return window.U.normPhone(s.phone) === phoneClean;
      }

      // 1) cari di cache
      var c = (window.DB.classes || []).find(function(x){ return x.id === cid; });
      if (c && c.students){
        var found = c.students.find(match);
        if (found){ finish(found, c); return; }
      }

      // 2) fetch dari firestore
      if (window.fbReady){
        window.fsGet('classes', cid).then(function(snap){
          if (!snap.exists){ finish(null, null); return; }
          var fresh = snap.data();
          fresh.id = cid;
          var idx = (window.DB.classes || []).findIndex(function(x){ return x.id === cid; });
          if (idx >= 0) window.DB.classes[idx] = fresh;
          else window.DB.classes.push(fresh);
          var s = (fresh.students || []).find(match);
          finish(s || null, fresh);
        }).catch(function(){ finish(null, null); });
      } else {
        finish(null, null);
      }
    });
  }

  /* ============================================================
     LOGIN ADMIN
     ============================================================ */
  var formAdmin = document.getElementById('form-login-admin');
  if (formAdmin){
    formAdmin.addEventListener('submit', function(e){
      e.preventDefault();
      var email = window.U.normEmail(document.getElementById('admin-email').value);
      var pw = String(document.getElementById('admin-password').value || '').trim();
      if (email === ADMIN.email && pw === ADMIN.password){
        window.currentUser = { type: 'admin', email: ADMIN.email, name: ADMIN.name };
        window.saveSession();
        window.showApp();
      } else {
        window.toast('Email atau password admin salah', 'error');
      }
    });
  }

  /* ============================================================
     REGISTER
     ============================================================ */
  var formReg = document.getElementById('form-register');
  if (formReg){
    formReg.addEventListener('submit', function(e){
      e.preventDefault();
      var code = window.U.trim(document.getElementById('reg-code').value).toUpperCase();
      var name = window.U.trim(document.getElementById('reg-name').value);
      var email = window.U.normEmail(document.getElementById('reg-email').value);
      var phone = window.U.normPhone(document.getElementById('reg-phone').value);
      var pw = String(document.getElementById('reg-password').value || '').trim();
      var cf = String(document.getElementById('reg-confirm').value || '').trim();
      var role = document.getElementById('reg-role').value;

      if (!code || !name || !email || !phone || !pw || !cf || !role){
        window.toast('Lengkapi semua field', 'warning'); return;
      }
      if (phone.length < 10 || phone.length > 15){ window.toast('No. WA tidak valid', 'error'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ window.toast('Email tidak valid', 'error'); return; }
      if (pw.length < 6){ window.toast('Password minimal 6 karakter', 'error'); return; }
      if (pw !== cf){ window.toast('Konfirmasi password tidak cocok', 'error'); return; }

      var cls = (window.DB.classes || []).find(function(c){ return c.code === code; });
      if (!cls){ window.toast('Kode kelas tidak valid', 'error'); return; }

      var dupEmail = (window.DB.classes || []).some(function(c){
        return (c.students || []).some(function(s){ return window.U.normEmail(s.email) === email; });
      });
      if (dupEmail){ window.toast('Email sudah terdaftar', 'error'); return; }

      var dupPhone = (window.DB.classes || []).some(function(c){
        return (c.students || []).some(function(s){ return window.U.normPhone(s.phone) === phone; });
      });
      if (dupPhone){ window.toast('No. WA sudah terdaftar', 'error'); return; }

      var ns = {
        id: window.U.uid(),
        name: name, email: email, phone: phone, password: pw,
        role: role, registeredAt: Date.now()
      };
      var newStudents = (cls.students || []).concat([ns]);

      window.fsSet('classes', cls.id, Object.assign({}, cls, { students: newStudents }))
        .then(function(){
          window.toast('Pendaftaran berhasil! Silakan login.', 'success');
          document.getElementById('siswa-kelas').value = cls.id;
          document.getElementById('siswa-login').value = email;
          window.showLogin();
          document.querySelector('.tab[data-tab="siswa"]').click();
        })
        .catch(function(err){ window.toast('Gagal: ' + err.message, 'error'); });
    });
  }
});

/* Nav helpers */
window.showLogin = function(){
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
};

window.showRegister = function(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
};

document.addEventListener('click', function(e){
  if (e.target.id === 'link-register'){ e.preventDefault(); window.showRegister(); }
  if (e.target.id === 'link-login'){ e.preventDefault(); window.showLogin(); }
});

console.log('[auth] loaded');
})();
