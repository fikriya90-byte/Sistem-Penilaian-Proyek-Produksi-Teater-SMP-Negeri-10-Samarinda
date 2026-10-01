/* ============================================================
   SP-PPT features-fix-kelas.js — v15.0 MINIMAL
   Hanya:
   1. Repair kelas guru (cache-first + failover)
   2. Login siswa fix (baca Firestore fresh)
   3. Register siswa auto-login
   4. Role sync otomatis
   5. Tombol kembali
   TIDAK override dashboard/checklist/beri tugas/menu
   ============================================================ */
(function(){
'use strict';
if (!window.DB){ console.warn('[fix-kelas] DB belum siap'); return; }

function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id===cid; }); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }

/* ============================================================
   1. uCid + SYNC
   ============================================================ */
window.uCid = function(){
  if (window.currentUser && window.currentUser.classId) return window.currentUser.classId;
  if (window.__viewClassId) return window.__viewClassId;
  if (window.__currentViewClassId) return window.__currentViewClassId;
  return null;
};
function uCid(){ return window.uCid(); }

(function(){
  var _o = window.viewClass;
  if (typeof _o !== 'function') return;
  window.viewClass = function(cid){
    window.__viewClassId = cid;
    window.__currentViewClassId = cid;
    return _o.apply(this, arguments);
  };
})();
if (window.__viewClassId && !window.__currentViewClassId) window.__currentViewClassId = window.__viewClassId;
setInterval(function(){
  if (window.__viewClassId && window.__currentViewClassId !== window.__viewClassId) window.__currentViewClassId = window.__viewClassId;
}, 500);

/* Sync role siswa */
setInterval(function(){
  if (!window.currentUser || window.currentUser.type !== 'siswa') return;
  var c = findClass(window.currentUser.classId);
  if (!c) return;
  var s = (c.students||[]).find(function(x){ return x.id === window.currentUser.studentId; });
  if (!s) return;
  if (window.currentUser.role !== s.role){
    window.currentUser.role = s.role || 'pemain';
    window.currentUser.name = s.name || window.currentUser.name;
    try { localStorage.setItem('sppt_session', JSON.stringify(window.currentUser)); } catch(e){}
    if (window.saveSession) window.saveSession();
  }
}, 4000);

/* ============================================================
   2. REPAIR KELAS GURU
   ============================================================ */
function _ck(){
  var em = (window.currentUser && window.currentUser.email) || 'anon';
  return 'sppt_cache_classes_' + String(em).toLowerCase();
}
function _sv(c){ try { localStorage.setItem(_ck(), JSON.stringify({classes:c, at:Date.now()})); } catch(e){} }
function _ld(){
  try {
    var r = localStorage.getItem(_ck());
    if (!r) return null;
    var d = JSON.parse(r);
    return (d && Array.isArray(d.classes)) ? d : null;
  } catch(e){ return null; }
}

window.myClasses = function(){
  if (!window.currentUser) return [];
  var all = window.DB.classes || [];
  if (window.currentUser.type === 'admin') return all.slice();
  if (window.currentUser.type === 'guru'){
    var me = String(window.currentUser.email||'').toLowerCase().trim();
    var mn = String(window.currentUser.name ||'').toLowerCase().trim();
    var mu = me.split('@')[0];
    return all.filter(function(c){
      var te = String(c.teacherEmail||'').toLowerCase().trim();
      var tn = String(c.teacherName ||'').toLowerCase().trim();
      if (!te) return true;
      if (te === me) return true;
      if (tn && mn && tn === mn) return true;
      if (tn && mu && tn.indexOf(mu) >= 0) return true;
      return false;
    });
  }
  if (window.currentUser.type === 'siswa') return all.filter(function(c){ return c.id === window.currentUser.classId; });
  return [];
};

window.ownsClass = function(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if (!c) return false;
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  if (window.currentUser.type === 'guru'){
    var me = String(window.currentUser.email||'').toLowerCase().trim();
    var mn = String(window.currentUser.name ||'').toLowerCase().trim();
    var mu = me.split('@')[0];
    var te = String(c.teacherEmail||'').toLowerCase().trim();
    var tn = String(c.teacherName ||'').toLowerCase().trim();
    if (!te) return true;
    if (te === me) return true;
    if (tn && mn && tn === mn) return true;
    if (tn && mu && tn.indexOf(mu) >= 0) return true;
  }
  return false;
};

function readClasses(){
  return new Promise(function(resolve, reject){
    var errs = [];
    function p(){
      if (!window.fb || !window.firebaseReady){ errs.push('p'); return b(); }
      window.fb.collection('classes').get()
        .then(function(s){ resolve({source:'primary', snap:s}); })
        .catch(function(){ errs.push('p'); b(); });
    }
    function b(){
      if (!window.fbBackup || !window.fbBackupReady){ errs.push('b'); return c(); }
      window.fbBackup.collection('classes').get()
        .then(function(s){ window.__activeFB='backup'; resolve({source:'backup', snap:s}); })
        .catch(function(){ errs.push('b'); c(); });
    }
    function c(){
      var cd = _ld();
      if (cd && cd.classes.length) resolve({source:'cache', classes:cd.classes});
      else reject(new Error(errs.join('|')));
    }
    p();
  });
}

var __lastRepair = 0;
window.__repairKelas = function(cb){
  if (!window.currentUser){ if (cb) cb(false); return; }
  var uu = window.currentUser;
  if (uu.type !== 'guru' && uu.type !== 'admin'){ if (cb) cb(false); return; }
  __lastRepair = Date.now();

  readClasses().then(function(res){
    var classes = res.snap ? res.snap.docs.map(function(d){ var o=d.data(); o.id=d.id; return o; }) : res.classes;
    window.DB.classes = classes;
    if (res.source !== 'cache') _sv(classes);
    if (!classes.length){ if (cb) cb(false); return; }

    var me = String(uu.email||'').toLowerCase().trim();
    var mn = String(uu.name ||'').toLowerCase().trim();
    var mu = me.split('@')[0];
    var matched = classes.filter(function(c){
      var te = String(c.teacherEmail||'').toLowerCase().trim();
      var tn = String(c.teacherName ||'').toLowerCase().trim();
      if (!te) return true;
      if (te === me) return true;
      if (tn && mn && tn === mn) return true;
      if (tn && mu && tn.indexOf(mu) >= 0) return true;
      return false;
    });

    if (matched.length === 0 && classes.length > 0){
      if (!confirm('Kaitkan ' + classes.length + ' kelas ke ' + me + '?')){ if (cb) cb(false); return; }
      Promise.all(classes.map(function(c){
        var upd = Object.assign({}, c, {teacherEmail:uu.email, teacherName:uu.name||uu.email});
        delete upd._id;
        return window.fbSet('classes', c.id, upd);
      })).then(function(){
        classes.forEach(function(c){ c.teacherEmail=uu.email; c.teacherName=uu.name||uu.email; });
        window.DB.classes = classes; _sv(classes);
        if (window.renderGuruDash) window.renderGuruDash();
        alert(classes.length + ' kelas dikaitkan!');
        if (cb) cb(true);
      });
      return;
    }
    if (window.renderGuruDash) window.renderGuruDash();
    if (cb) cb(matched.length > 0);
  }).catch(function(){ if (cb) cb(false); });
};

/* ============================================================
   3. LOGIN SISWA FIX
   ============================================================ */
window.doLoginSiswa = function(){
  var cid = (document.getElementById('siswa-kelas')||{}).value || '';
  var inp = ((document.getElementById('siswa-email')||{}).value||'').trim();
  var pw = ((document.getElementById('siswa-password')||{}).value||'').trim();
  if (!cid || !inp || !pw){ alert('Lengkapi semua field!'); return; }

  var btn = document.querySelector('#form-login-siswa button[type="submit"]');
  var orig = btn ? btn.innerHTML : '';
  if (btn){ btn.disabled = true; btn.innerHTML = 'Memeriksa...'; }

  function finish(s, c){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    if (!s || !c){ alert('Email/WA atau password salah!'); return; }
    window.currentUser = {
      type:'siswa', classId:c.id, studentId:s.id,
      name:s.name, role:s.role || 'pemain',
      phone:s.phone||'', email:s.email||''
    };
    try { localStorage.setItem('sppt_session', JSON.stringify(window.currentUser)); } catch(e){}
    if (window.saveSession) window.saveSession();
    if (window.showApp) window.showApp();
  }

  function match(s){
    if (!s || !s.password) return false;
    var sp = String(s.password).trim();
    if (sp !== pw && sp.toLowerCase() !== pw.toLowerCase()) return false;
    if (inp.indexOf('@') >= 0) return String(s.email||'').trim().toLowerCase() === inp.toLowerCase();
    return String(s.phone||'').replace(/\D/g,'') === inp.replace(/\D/g,'');
  }

  function tryFS(){
    if (!window.fb || !window.firebaseReady) return Promise.reject();
    return window.fb.collection('classes').doc(cid).get().then(function(snap){
      if (!snap.exists) throw new Error('no');
      var c = snap.data(); c.id = cid;
      var idx = (window.DB.classes||[]).findIndex(function(x){ return x.id===cid; });
      if (idx >= 0) window.DB.classes[idx]=c; else window.DB.classes.push(c);
      return c;
    });
  }
  function tryBK(){
    if (!window.fbBackup || !window.fbBackupReady) return Promise.reject();
    return window.fbBackup.collection('classes').doc(cid).get().then(function(snap){
      if (!snap.exists) throw new Error('no');
      var c = snap.data(); c.id = cid;
      var idx = (window.DB.classes||[]).findIndex(function(x){ return x.id===cid; });
      if (idx >= 0) window.DB.classes[idx]=c; else window.DB.classes.push(c);
      return c;
    });
  }
  function tryCA(){
    var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
    if (!c) return Promise.reject();
    return Promise.resolve(c);
  }
  tryFS().catch(tryBK).catch(tryCA).then(function(c){
    if (!c){ finish(null, null); return; }
    var s = (c.students||[]).find(match);
    finish(s, c);
  }).catch(function(){ finish(null, null); });
};

/* ============================================================
   4. REGISTER SISWA + AUTO LOGIN
   ============================================================ */
window.doRegister = function(){
  var code = ((document.getElementById('daftar-code')||{}).value||'').trim().toUpperCase();
  var name = ((document.getElementById('daftar-name')||{}).value||'').trim();
  var email = ((document.getElementById('daftar-email')||{}).value||'').trim().toLowerCase();
  var phone = ((document.getElementById('daftar-phone')||{}).value||'').replace(/\D/g,'');
  var pw = (document.getElementById('daftar-password')||{}).value || '';
  var cf = (document.getElementById('daftar-confirm')||{}).value || '';
  if (!code || !name || !email || !phone || !pw || !cf){ alert('Lengkapi semua field!'); return; }
  if (phone.length < 10 || phone.length > 15){ alert('No. WA tidak valid!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length < 6){ alert('Password minimal 6 karakter!'); return; }
  if (pw !== cf){ alert('Konfirmasi tidak cocok!'); return; }

  var btn = document.querySelector('#register-screen button[type="submit"]');
  var orig = btn ? btn.innerHTML : '';
  if (btn){ btn.disabled = true; btn.innerHTML = 'Memproses...'; }
  function done(ok, msg){
    if (btn){ btn.disabled = false; btn.innerHTML = orig; }
    if (!ok && msg) alert(msg);
  }

  function findCls(){
    if (!window.fb || !window.firebaseReady){
      var c = (window.DB.classes||[]).find(function(x){ return x.code===code; });
      return c ? Promise.resolve(c) : Promise.reject(new Error('Kode kelas tidak ditemukan'));
    }
    return window.fb.collection('classes').get().then(function(snap){
      var found = null;
      snap.forEach(function(d){
        var o = d.data();
        if (String(o.code||'').toUpperCase() === code){ o.id=d.id; found=o; }
      });
      if (!found) throw new Error('Kode Kelas tidak valid!');
      return found;
    });
  }

  findCls().then(function(cls){
    var nid = uid();
    var ns = { id:nid, name:name, email:email, phone:phone, password:pw, role:'pemain', registeredAt:Date.now() };
    var server = (window.__activeFB === 'backup' && window.fbBackup) ? window.fbBackup : window.fb;
    if (!server){ done(false, 'Server tidak tersedia'); return; }

    server.collection('classes').doc(cls.id).get().then(function(snap){
      var cur = snap.exists ? snap.data() : cls;
      cur.students = cur.students || [];
      if (cur.students.some(function(s){ return s.email && String(s.email).toLowerCase() === email; })){
        done(false, 'Email sudah terdaftar!'); return Promise.reject(new Error('d'));
      }
      if (cur.students.some(function(s){ return s.phone && String(s.phone).replace(/\D/g,'') === phone; })){
        done(false, 'No. WA sudah terdaftar!'); return Promise.reject(new Error('d'));
      }
      cur.students.push(ns);
      return server.collection('classes').doc(cls.id).set({students:cur.students, classId:cls.id}, {merge:true});
    }).then(function(){
      var idx = (window.DB.classes||[]).findIndex(function(x){ return x.id===cls.id; });
      if (idx >= 0){
        window.DB.classes[idx].students = window.DB.classes[idx].students || [];
        if (!window.DB.classes[idx].students.some(function(s){ return s.email===email; }))
          window.DB.classes[idx].students.push(ns);
      } else {
        cls.students = cls.students || []; cls.students.push(ns); window.DB.classes.push(cls);
      }
      window.fbSet('notifications', uid(), {
        id:uid(), classId:cls.id, fromId:nid, fromName:name, fromType:'siswa',
        toId:'guru', type:'info', title:'Pendaftaran Siswa Baru',
        message: name + ' mendaftar di ' + (cls.name||'kelas'),
        createdAt:Date.now(), readBy:[], doneBy:[]
      }).catch(function(){});
      window.currentUser = {
        type:'siswa', classId:cls.id, studentId:nid,
        name:name, role:'pemain', phone:phone, email:email
      };
      try { localStorage.setItem('sppt_session', JSON.stringify(window.currentUser)); } catch(e){}
      if (window.saveSession) window.saveSession();
      done(true);
      alert('Pendaftaran berhasil!\n\nAnda otomatis login.\n(Tunggu guru menetapkan peran Anda.)');
      if (window.showApp) window.showApp();
    }).catch(function(err){ if (err.message!=='d') done(false, 'Gagal: ' + err.message); });
  }).catch(function(err){ done(false, 'Gagal: ' + err.message); });
};

/* ============================================================
   5. TOMBOL KEMBALI
   ============================================================ */
function __injectBack(){
  var mc = document.getElementById('main-content');
  if (!mc) return;
  if (!isGuru() || (!window.__viewClassId && !window.__currentViewClassId)){
    var o = document.querySelectorAll('.sf-back-wrap');
    for (var i=0;i<o.length;i++) o[i].remove();
    return;
  }
  if (mc.querySelector('.sf-back-wrap')) return;
  var cid = window.__viewClassId || window.__currentViewClassId;
  var c = findClass(cid);
  var w = document.createElement('div');
  w.className = 'sf-back-wrap';
  w.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:12px 14px;background:linear-gradient(135deg,#fee2e2,#fecaca);border-left:4px solid #dc2626;border-radius:10px;align-items:center;';
  var b = document.createElement('button');
  b.type = 'button';
  b.style.cssText = 'padding:10px 18px;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:13.5px;font-family:inherit;';
  b.textContent = 'Kembali ke Dashboard';
  b.onclick = function(){
    window.__viewClassId = null;
    window.__currentViewClassId = null;
    var o = document.querySelectorAll('.sf-back-wrap');
    for (var i=0;i<o.length;i++) o[i].remove();
    if (window.renderGuruDash) window.renderGuruDash();
  };
  var info = document.createElement('div');
  info.style.cssText = 'flex:1;font-size:12.5px;color:#7f1d1d;';
  if (c) info.innerHTML = 'Sedang melihat: <b>' + esc(c.name) + '</b>';
  w.appendChild(b); w.appendChild(info);
  if (mc.firstChild) mc.insertBefore(w, mc.firstChild); else mc.appendChild(w);
}

(function(){
  var _o = window.renderGuruDash;
  if (typeof _o !== 'function') return;
  window.renderGuruDash = function(){
    window.__viewClassId = null;
    window.__currentViewClassId = null;
    var o = document.querySelectorAll('.sf-back-wrap');
    for (var i=0;i<o.length;i++) o[i].remove();
    return _o.apply(this, arguments);
  };
})();
setInterval(__injectBack, 2000);

/* ============================================================
   6. AUTO POPULATE DROPDOWN LOGIN
   ============================================================ */
function populateDropdown(){
  var sel = document.getElementById('siswa-kelas');
  if (!sel) return;
  var list = window.DB.classes || [];
  if (!list.length) return;
  var cur = sel.value;
  sel.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  list.forEach(function(c){
    var o = document.createElement('option');
    o.value = c.id; o.textContent = c.name || c.id;
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
}
function autoReadForLogin(){
  if ((window.DB.classes||[]).length > 0){ populateDropdown(); return; }
  function t(s){
    if (!s) return Promise.reject();
    return s.collection('classes').get().then(function(snap){
      var arr = snap.docs.map(function(d){ var o=d.data(); o.id=d.id; return o; });
      if (arr.length){ window.DB.classes = arr; populateDropdown(); }
    });
  }
  t(window.fb).catch(function(){ return t(window.fbBackup); }).catch(function(){});
}

/* ============================================================
   7. HOOKS + RUN
   ============================================================ */
(function(){
  var o = window.renderGuruDash;
  if (typeof o !== 'function') return;
  window.renderGuruDash = function(){
    var r = o.apply(this, arguments);
    setTimeout(function(){
      if (window.currentUser && window.currentUser.type === 'guru'){
        if (window.myClasses().length === 0 && Date.now() - __lastRepair > 5000) window.__repairKelas();
      }
    }, 600);
    return r;
  };
})();

(function(){
  var o = window.showApp;
  if (typeof o !== 'function') return;
  window.showApp = function(){
    var r = o.apply(this, arguments);
    setTimeout(function(){
      if (!window.currentUser || window.currentUser.type !== 'guru') return;
      var cd = _ld();
      if (cd && cd.classes.length){ window.DB.classes = cd.classes; if (window.renderGuruDash) window.renderGuruDash(); }
      window.__repairKelas(function(){});
    }, 800);
    return r;
  };
})();

setTimeout(autoReadForLogin, 800);
setTimeout(autoReadForLogin, 2000);
setTimeout(populateDropdown, 1500);
setTimeout(populateDropdown, 3000);
setInterval(populateDropdown, 2500);

setTimeout(function(){
  if (!window.currentUser || window.currentUser.type !== 'guru') return;
  var cd = _ld();
  if (cd && cd.classes.length){ window.DB.classes = cd.classes; if (window.renderGuruDash) window.renderGuruDash(); }
  window.__repairKelas(function(){});
}, 1500);

setInterval(function(){
  if (!window.currentUser || window.currentUser.type !== 'guru') return;
  if (window.myClasses().length > 0) return;
  if (Date.now() - __lastRepair < 40000) return;
  window.__repairKelas();
}, 45000);

window.fixKelasSekarang = function(){
  window.__repairKelas(function(ok){ alert(ok ? 'Kelas dimuat!' : 'Masih gagal'); });
};

console.log('[fix-kelas] v15.0 MINIMAL loaded — hanya repair + login/register/role/back');
})();