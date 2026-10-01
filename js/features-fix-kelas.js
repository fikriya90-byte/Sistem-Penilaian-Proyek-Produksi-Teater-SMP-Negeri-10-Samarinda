/* ============================================================
   SP-PPT features-fix-kelas.js — v7.0 SUPERFIX
   Load PALING AKHIR (sudah ada di index.html)
   
   Berisi SEMUA perbaikan dalam 1 file:
   A. Repair kelas guru (cache-first + failover)
   B. Fungsi yang hilang: openTugasSaya, openDeadlineList, dll
   C. Auto-populate dropdown kelas di login siswa
   D. GDrive integration (Kas, Keuangan, Dokpub)
   E. Tombol extra di toolbar (.mp-toolbar)
   ============================================================ */
(function(){
'use strict';

if (!window.DB){ console.warn('[superfix] DB belum siap'); return; }

/* ============================================================
   HELPERS
   ============================================================ */
function ic(n,s){ return window.ico ? window.ico(n,s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t,b){ if (window.openModal) window.openModal(t,b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id===cid; }); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }

/* ============================================================
   BAGIAN A — REPAIR KELAS GURU (cache-first + failover)
   ============================================================ */
function _cacheKey(){
  var em = (window.currentUser && window.currentUser.email) || 'anon';
  return 'sppt_cache_classes_' + String(em).toLowerCase();
}
function _saveCache(classes){
  try {
    localStorage.setItem(_cacheKey(), JSON.stringify({ classes: classes, at: Date.now() }));
  } catch(e){}
}
function _loadCache(){
  try {
    var raw = localStorage.getItem(_cacheKey());
    if (!raw) return null;
    var d = JSON.parse(raw);
    if (!d || !Array.isArray(d.classes)) return null;
    return d;
  } catch(e){ return null; }
}

window.myClasses = function(){
  if (!window.currentUser) return [];
  var all = window.DB.classes || [];
  if (window.currentUser.type === 'admin') return all.slice();
  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email||'').toLowerCase().trim();
    var myName  = String(window.currentUser.name ||'').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    return all.filter(function(c){
      var te = String(c.teacherEmail||'').toLowerCase().trim();
      var tn = String(c.teacherName ||'').toLowerCase().trim();
      if (!te) return true;
      if (te === myEmail) return true;
      if (tn && myName && tn === myName) return true;
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
      return false;
    });
  }
  if (window.currentUser.type === 'siswa'){
    return all.filter(function(c){ return c.id === window.currentUser.classId; });
  }
  return [];
};

window.ownsClass = function(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if (!c) return false;
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email||'').toLowerCase().trim();
    var myName  = String(window.currentUser.name ||'').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    var te = String(c.teacherEmail||'').toLowerCase().trim();
    var tn = String(c.teacherName ||'').toLowerCase().trim();
    if (!te) return true;
    if (te === myEmail) return true;
    if (tn && myName && tn === myName) return true;
    if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
  }
  return false;
};

function readClassesRobust(){
  return new Promise(function(resolve, reject){
    var errors = [];
    function tryPrimary(){
      if (!window.fb || !window.firebaseReady){
        errors.push('primary: not ready');
        return tryBackup();
      }
      console.log('[superfix] → Baca Primary...');
      window.fb.collection('classes').get()
        .then(function(snap){
          console.log('[superfix] ✓ Primary OK:', snap.size, 'kelas');
          resolve({ source:'primary', snap:snap });
        })
        .catch(function(e){
          console.warn('[superfix] ✗ Primary:', e.code || e.message);
          errors.push('primary: ' + (e.code || e.message));
          if (window.__isQuotaError && window.__isQuotaError(e)) window.__activeFB = 'backup';
          tryBackup();
        });
    }
    function tryBackup(){
      if (!window.fbBackup || !window.fbBackupReady){
        errors.push('backup: not ready');
        return tryCache();
      }
      console.log('[superfix] → Baca Backup...');
      window.fbBackup.collection('classes').get()
        .then(function(snap){
          console.log('[superfix] ✓ Backup OK:', snap.size, 'kelas');
          window.__activeFB = 'backup';
          resolve({ source:'backup', snap:snap });
        })
        .catch(function(e){
          console.warn('[superfix] ✗ Backup:', e.code || e.message);
          errors.push('backup: ' + (e.code || e.message));
          tryCache();
        });
    }
    function tryCache(){
      var cached = _loadCache();
      if (cached && cached.classes && cached.classes.length){
        console.log('[superfix] ✓ Cache OK:', cached.classes.length, 'kelas');
        resolve({ source:'cache', classes:cached.classes, cachedAt:cached.at });
      } else {
        errors.push('cache: empty');
        reject(new Error(errors.join(' | ')));
      }
    }
    tryPrimary();
  });
}

var __lastRepairAt = 0;
window.__repairKelas = function(callback){
  if (!window.currentUser){ if (callback) callback(false); return; }
  var uu = window.currentUser;
  if (uu.type !== 'guru' && uu.type !== 'admin'){ if (callback) callback(false); return; }
  __lastRepairAt = Date.now();
  console.log('[superfix] ▶ Repair kelas:', uu.email);

  readClassesRobust().then(function(res){
    var classes = res.snap
      ? res.snap.docs.map(function(d){ var o=d.data(); o.id=d.id; return o; })
      : res.classes;
    window.DB.classes = classes;
    window.__kelasSource = res.source;
    if (res.source !== 'cache') _saveCache(classes);
    if (classes.length === 0){ if (callback) callback(false); return; }

    var myEmail = String(uu.email||'').toLowerCase().trim();
    var myName  = String(uu.name ||'').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];

    var matched = classes.filter(function(c){
      var te = String(c.teacherEmail||'').toLowerCase().trim();
      var tn = String(c.teacherName ||'').toLowerCase().trim();
      if (!te) return true;
      if (te === myEmail) return true;
      if (tn && myName && tn === myName) return true;
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
      return false;
    });

    if (matched.length === 0 && classes.length > 0){
      var ok = confirm('⚠️ KELAS TIDAK COCOK\n\n' +
        'Ada ' + classes.length + ' kelas di server,\n' +
        'tapi tidak satupun terhubung ke akun Anda:\n  ' + myEmail + '\n\n' +
        'Kaitkan SEMUA kelas ini ke akun Anda?');
      if (!ok){ if (callback) callback(false); return; }
      Promise.all(classes.map(function(c){
        var upd = Object.assign({}, c, { teacherEmail:uu.email, teacherName:uu.name||uu.email });
        delete upd._id;
        return window.fbSet('classes', c.id, upd);
      })).then(function(){
        classes.forEach(function(c){ c.teacherEmail=uu.email; c.teacherName=uu.name||uu.email; });
        window.DB.classes = classes;
        _saveCache(classes);
        if (window.renderGuruDash) window.renderGuruDash();
        hideStatusBar();
        alert('✅ ' + classes.length + ' kelas dikaitkan!');
        if (callback) callback(true);
      }).catch(function(e){ alert('Gagal: ' + e.message); if (callback) callback(false); });
      return;
    }

    hideStatusBar();
    if (window.renderGuruDash) window.renderGuruDash();
    if (callback) callback(matched.length > 0);
  }).catch(function(err){
    console.error('[superfix] ❌ Semua sumber gagal:', err.message);
    showStatusBar('Kelas tidak dapat dimuat — cek koneksi / tunggu reset kuota.');
    if (callback) callback(false, err);
  });
};

function showStatusBar(msg){
  var bar = document.getElementById('superfix-status');
  if (bar){
    var m = bar.querySelector('.sf-msg');
    if (m) m.textContent = msg || 'Kelas tidak dapat dimuat.';
    return;
  }
  bar = document.createElement('div');
  bar.id = 'superfix-status';
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;' +
    'background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;' +
    'padding:10px 16px;text-align:center;font-size:13px;font-weight:600;' +
    'box-shadow:0 2px 8px rgba(0,0,0,.3);font-family:inherit;' +
    'display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;';
  bar.innerHTML = '<span>⚠️ <span class="sf-msg">' + esc(msg||'Kelas tidak dapat dimuat.') + '</span></span>' +
    '<button id="sf-retry" style="background:#fff;color:#dc2626;border:none;padding:4px 12px;' +
    'border-radius:6px;cursor:pointer;font-weight:700;font-size:12px;font-family:inherit;">Coba Lagi</button>';
  document.body.appendChild(bar);
  document.getElementById('sf-retry').onclick = function(){
    window.__repairKelas(function(ok, err){
      if (ok) location.reload(); else showStatusBar(err ? err.message : 'Masih gagal');
    });
  };
}
function hideStatusBar(){
  var bar = document.getElementById('superfix-status');
  if (bar) bar.remove();
}

/* ============================================================
   BAGIAN B — FUNGSI YANG HILANG
   ============================================================ */

/* ---- openTugasSaya ---- */
window.openTugasSaya = function(){
  var cid = uCid(), sid = uSid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  if (!sid && isGuru()) return openTugasKelas(cid);

  var myRole = uRole();
  var ch = (window.DB.checklists && window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var myTasks = ch.filter(function(it){ return !it.isPersonal && it.assignedRole === myRole; });
  var doneCnt = myTasks.filter(function(x){ return x.done; }).length;

  var notifs = (window.DB.notifications||[]).filter(function(n){
    if (n.classId !== cid) return false;
    if (n.type !== 'tugas') return false;
    if (n.toId === 'all') return true;
    if (n.toId === sid) return true;
    if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
    return false;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '<div class="alert alert-info">' + ic('clipboard') +
    '<div><b>Tugas Saya</b> &mdash; ' + esc(roleLabel(myRole)) + '</div></div>';

  if (myTasks.length > 0){
    var pct = Math.round(doneCnt/myTasks.length*100);
    h += '<div class="progress-container"><div class="progress-bar ' +
      (pct===100?'complete':pct>0?'partial':'') + '" style="width:' + pct + '%"></div></div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">' +
      doneCnt + ' / ' + myTasks.length + ' checklist selesai</div>';
    myTasks.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border-radius:6px;margin-bottom:5px;">' +
        '<span style="font-size:16px;">' + (it.done ? '✓' : '○') + '</span>' +
        '<div style="flex:1;font-size:12.5px;' + (it.done ? 'text-decoration:line-through;color:var(--text-muted);' : '') + '">' +
          esc(it.name) + '</div></div>';
    });
  }

  if (notifs.length > 0){
    h += '<h3 style="font-size:13.5px;margin:16px 0 8px;">Tugas dari Notifikasi (' + notifs.length + ')</h3>';
    notifs.slice(0,10).forEach(function(n){
      h += '<div class="welcome-item urgent" style="margin-bottom:6px;">' +
        '<div style="flex:1;"><b>' + esc(n.title||'Tugas') + '</b><br>' +
        '<small style="color:var(--text-muted);">' + esc(n.fromName||'') + ' — ' +
        (window.fmtDate ? window.fmtDate(n.createdAt) : '') + '</small></div></div>';
    });
  }

  if (myTasks.length === 0 && notifs.length === 0){
    h += '<div class="empty-state">' + ic('clipboard',40) + '<p>Belum ada tugas.</p></div>';
  }
  openModal('Tugas Saya', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

function openTugasKelas(cid){
  var c = findClass(cid); if (!c) return;
  var notifs = (window.DB.notifications||[]).filter(function(n){
    return n.classId === cid && n.type === 'tugas';
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
  var h = '<div class="alert alert-info">' + ic('clipboard') + '<div>Tugas kelas</div></div>';
  if (!notifs.length){
    h += '<div class="empty-state">' + ic('clipboard',40) + '<p>Belum ada tugas.</p></div>';
  } else {
    notifs.slice(0,30).forEach(function(n){
      h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;font-size:13px;">' + esc(n.title||'-') + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(n.fromName||'') + ' — ' + (window.fmtDate?window.fmtDate(n.createdAt):'') + '</div>' +
        (n.message ? '<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">' + esc(n.message) + '</div>' : '') + '</div>';
    });
  }
  openModal('Tugas Kelas', h);
}

/* ---- openDeadlineList ---- */
window.openDeadlineList = function(){
  var cid = uCid(), sid = uSid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var arr = (window.DB.notifications||[]).filter(function(n){
    if (n.classId !== cid || n.type !== 'tugas') return false;
    if (!sid) return true;
    if (n.toId === 'all') return true;
    if (n.toId === sid) return true;
    if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
    return false;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '<div class="alert alert-info">' + ic('clock') +
    '<div>Daftar deadline & tugas (' + arr.length + ')</div></div>';
  if (!arr.length){
    h += '<div class="empty-state">' + ic('clock',40) + '<p>Tidak ada deadline.</p></div>';
  } else {
    arr.forEach(function(n){
      h += '<div style="padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--warning);">' +
        '<div style="font-weight:700;font-size:13px;">' + esc(n.title||'Tugas') + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">' +
          esc(n.fromName||'') + ' — ' + (window.fmtDate?window.fmtDate(n.createdAt):'') + '</div>' +
        (n.message ? '<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">' + esc(n.message) + '</div>' : '') +
      '</div>';
    });
  }
  openModal('Deadline Saya', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ---- openAbsensiHariIni ---- */
window.openAbsensiHariIni = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var today = new Date().toISOString().split('T')[0];
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){
    return m.classId === cid && m.date === today;
  });
  var h = '<div class="alert alert-info">' + ic('calendar') +
    '<div>Absensi Hari Ini — ' + meetings.length + ' sesi</div></div>';
  if (!meetings.length){
    h += '<div class="empty-state">' + ic('calendar',40) + '<p>Tidak ada sesi absensi hari ini.</p></div>';
  } else {
    meetings.forEach(function(m){
      var isWajib = !m.wajibIds || m.wajibIds.length === 0 || m.wajibIds.indexOf(uSid()) >= 0;
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">' +
        '<div style="font-weight:700;font-size:13.5px;">' + esc(m.title) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">' +
          esc(m.type||'-') + ' — ' + (m.openTime||'?') + ' - ' + (m.closeTime||'?') +
          (isWajib ? ' <span class="badge badge-warning" style="font-size:9px;">Wajib</span>' : '') +
        '</div>' +
        '<button class="btn btn-primary btn-sm" onclick="closeModal();setTimeout(function(){window.openIsiAbsensi(\'' + m.id + '\')},150)">' +
          ic('edit','sm') + ' Isi Absensi</button>' +
      '</div>';
    });
  }
  openModal('Absensi Hari Ini', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ---- openRubrikPenilaian ---- */
window.openRubrikPenilaian = function(){
  var myRole = uRole();
  var rubric = window.getRubricFor ? window.getRubricFor(myRole) : [];
  var h = '<div class="alert alert-info">' + ic('target') +
    '<div><b>Rubrik Penilaian</b><br><small>Untuk peran: ' + esc(roleLabel(myRole)) + '</small></div></div>';
  if (!rubric.length){
    h += '<div class="empty-state"><p>Belum ada rubrik.</p></div>';
  } else {
    h += '<div class="scale-guide"><div class="scale-guide-title">' +
      ic('info','sm') + ' Skala Nilai</div><div class="scale-guide-grid">' +
      '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
      '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
      '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
      '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
      '</div></div>';
    rubric.forEach(function(r){
      h += '<div class="rubric-item"><h4>' + esc(r.name) +
        ' <span class="weight-info">' + r.weight + '%</span></h4>' +
        '<div class="desc">' + esc(r.desc||'') + '</div></div>';
    });
  }
  openModal('Rubrik Penilaian', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ---- openChangePassword ---- */
window.openChangePassword = function(){
  openModal('Ubah Password',
    '<div class="form-group pw-toggle"><label>Password Lama</label>' +
    '<input type="password" id="sf-cp-old">' +
    '<button class="toggle-btn" type="button" onclick="togglePw(\'sf-cp-old\',this)">' +
      '<span data-ico="eye" data-size="16"></span></button></div>' +
    '<div class="form-group pw-toggle"><label>Password Baru</label>' +
    '<input type="password" id="sf-cp-new">' +
    '<button class="toggle-btn" type="button" onclick="togglePw(\'sf-cp-new\',this)">' +
      '<span data-ico="eye" data-size="16"></span></button></div>' +
    '<div class="form-group pw-toggle"><label>Konfirmasi</label>' +
    '<input type="password" id="sf-cp-conf">' +
    '<button class="toggle-btn" type="button" onclick="togglePw(\'sf-cp-conf\',this)">' +
      '<span data-ico="eye" data-size="16"></span></button></div>' +
    '<button class="btn btn-primary btn-block" onclick="window.__sfSavePassword()">' +
      ic('save') + ' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.__sfSavePassword = function(){
  var uu = window.currentUser || {};
  var o = (document.getElementById('sf-cp-old').value||'').trim();
  var n = (document.getElementById('sf-cp-new').value||'').trim();
  var c = (document.getElementById('sf-cp-conf').value||'').trim();
  if (!o || !n || !c){ alert('Lengkapi'); return; }
  if (n.length < 6){ alert('Min 6 karakter'); return; }
  if (n !== c){ alert('Konfirmasi tidak cocok'); return; }

  if (uu.type === 'guru'){
    var t = (window.DB.teachers||[]).find(function(x){
      return x.email && x.email.toLowerCase() === String(uu.email).toLowerCase();
    });
    if (t && String(t.password).trim() === o){
      t.password = n;
      window.fbSet('teachers', t.email, t).then(function(){ closeModal(); alert('Password diubah'); });
      return;
    }
    if (window.fb && window.firebaseReady){
      window.fb.collection('teachers').doc(uu.email).get().then(function(snap){
        if (!snap.exists){ alert('Akun tidak ditemukan'); return; }
        var td = snap.data();
        if (String(td.password).trim() !== o){ alert('Password lama salah'); return; }
        td.password = n;
        window.fbSet('teachers', uu.email, td).then(function(){ closeModal(); alert('Password diubah'); });
      });
      return;
    }
    alert('Password lama salah');
    return;
  }

  if (uu.type === 'siswa'){
    var c2 = findClass(uu.classId);
    if (!c2){ alert('Kelas tidak ditemukan'); return; }
    var s = (c2.students||[]).find(function(x){ return x.id === uu.studentId; });
    if (!s || String(s.password).trim() !== o){ alert('Password lama salah'); return; }
    var ns = (c2.students||[]).map(function(x){
      return x.id === s.id ? Object.assign({}, x, {password: n}) : x;
    });
    window.fbSet('classes', c2.id, Object.assign({}, c2, {students: ns})).then(function(){
      c2.students = ns;
      closeModal(); alert('Password diubah');
    });
    return;
  }
  alert('Tidak bisa ubah password admin');
};

/* ---- openActivityFeedModal ---- */
window.openActivityFeedModal = function(){
  var cid = uCid();
  var logs = (window.DB.activityLogs||[]).filter(function(l){
    return !l.classId || l.classId === cid;
  }).slice(0,60);
  var h = '<div class="alert alert-info">' + ic('activity') +
    '<div><b>Aktivitas</b> — ' + logs.length + ' entri</div></div>';
  if (!logs.length){
    h += '<div class="empty-state">' + ic('activity',40) + '<p>Belum ada aktivitas.</p></div>';
  } else {
    h += '<div class="activity-feed">';
    logs.forEach(function(l){
      h += '<div class="activity-item"><div class="activity-icon">' +
        ic('activity','sm') + '</div><div class="activity-content">' +
        '<div class="activity-msg">' + esc(l.message||'') + '</div>' +
        '<div class="activity-meta"><b>' + esc(l.userName||'-') + '</b> — ' +
        (window.fmtDate?window.fmtDate(l.createdAt):'') + '</div></div></div>';
    });
    h += '</div>';
  }
  openModal('Aktivitas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ---- openLogWA ---- */
window.openLogWA = function(){
  var logs = Object.values(window.DB.waLogs||{})
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,80);
  var h = '<div class="alert alert-info">' + ic('messageCircle') +
    '<div><b>Log WhatsApp</b> — ' + logs.length + '</div></div>';
  if (!logs.length){
    h += '<div class="empty-state">' + ic('messageCircle',40) + '<p>Belum ada log.</p></div>';
  } else {
    logs.forEach(function(l){
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--success);">' +
        '<div style="font-weight:700;font-size:13px;">' + esc(l.title||'-') + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Ke: ' +
          esc(l.toName||'-') + ' — ' + (window.fmtDate?window.fmtDate(l.createdAt):'') + '</div></div>';
    });
  }
  openModal('Log WhatsApp', h);
};

/* ---- openDashboardPesan ---- */
window.openDashboardPesan = function(){
  var notifs = (window.DB.notifications||[])
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,80);
  var h = '<div class="alert alert-info">' + ic('messageCircle') +
    '<div><b>Pesan</b> — ' + notifs.length + '</div></div>';
  if (!notifs.length){
    h += '<div class="empty-state"><p>Belum ada pesan.</p></div>';
  } else {
    notifs.forEach(function(n){
      h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;font-size:13px;">' +
        esc(n.title||'-') + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Dari: ' +
          esc(n.fromName||'-') + ' — ' + (window.fmtDate?window.fmtDate(n.createdAt):'') + '</div>' +
        (n.message?'<div style="font-size:12.5px;margin-top:6px;">' + esc(n.message) + '</div>':'') + '</div>';
    });
  }
  openModal('Dashboard Pesan', h);
};

/* ============================================================
   BAGIAN C — AUTO-POPULATE DROPDOWN KELAS DI LOGIN
   ============================================================ */
function populateLoginDropdown(){
  var sel = document.getElementById('siswa-kelas');
  if (!sel) return;
  var list = window.DB.classes || [];
  if (!list.length) return;

  var existing = [];
  for (var i = 0; i < sel.options.length; i++){
    if (sel.options[i].value) existing.push(sel.options[i].value);
  }
  if (existing.length === list.length && existing[0] === list[0].id) return;

  var cur = sel.value;
  sel.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  list.forEach(function(c){
    var o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.name || c.id;
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
}

function autoReadClassesForLogin(){
  if ((window.DB.classes||[]).length > 0){ populateLoginDropdown(); return; }

  function tryServer(server, label){
    if (!server) return Promise.reject(new Error('no server'));
    return server.collection('classes').get().then(function(snap){
      var arr = snap.docs.map(function(d){ var o=d.data(); o.id=d.id; return o; });
      if (arr.length > 0){
        window.DB.classes = arr;
        populateLoginDropdown();
        console.log('[superfix] ✓ ' + arr.length + ' kelas dari ' + label);
      }
      return arr.length;
    });
  }

  tryServer(window.fb, 'Primary')
    .catch(function(e){
      console.warn('[superfix] Primary gagal:', e.code || e.message);
      return tryServer(window.fbBackup, 'Backup');
    })
    .catch(function(e2){
      console.warn('[superfix] Backup gagal:', e2.message);
      try {
        var raw = localStorage.getItem('sppt_cache_classes_' + String((window.currentUser||{}).email||'').toLowerCase());
        if (raw){
          var d = JSON.parse(raw);
          if (d && d.classes){
            window.DB.classes = d.classes;
            populateLoginDropdown();
            console.log('[superfix] ✓ Cache:', d.classes.length, 'kelas');
          }
        }
      } catch(err){}
    });
}

/* ============================================================
   BAGIAN D — GDRIVE INTEGRATION
   ============================================================ */
function injectGDriveKasButton(){
  if (!window.currentUser) return;
  if (uRole() !== 'bendahara' && !isGuru()) return;
  var mb = document.getElementById('modal-body');
  if (!mb) return;
  var mt = document.getElementById('modal-title');
  if (!mt) return;
  var titleText = (mt.textContent || mt.innerHTML || '').toLowerCase();
  if (titleText.indexOf('kas') < 0) return;
  if (mb.querySelector('.sf-gdrive-kas-card')) return;

  var cid = uCid();
  if (!cid) return;

  var card = document.createElement('div');
  card.className = 'card sf-gdrive-kas-card';
  card.style.cssText = 'border-left:4px solid var(--primary);margin-bottom:14px;' +
    'background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));';
  card.innerHTML =
    '<h3 style="font-size:13.5px;margin-bottom:6px;">' + ic('folder') +
    ' Arsip Nota & Foto Barang</h3>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.55;">' +
      'Simpan link Google Drive folder berisi foto nota belanja & foto barang yang dibeli. ' +
      'Digunakan sebagai bukti LPJ keuangan.' +
    '</p>' +
    '<button class="btn btn-primary btn-sm btn-block" onclick="window.__sfOpenGDriveKas()">' +
      ic('edit','sm') + ' Set / Ubah Link Google Drive' +
    '</button>';

  var firstCard = mb.querySelector('.card');
  var firstActionRow = mb.querySelector('.action-row');
  if (firstCard && firstCard.parentNode){
    firstCard.parentNode.insertBefore(card, firstCard);
  } else if (firstActionRow && firstActionRow.parentNode){
    firstActionRow.parentNode.insertBefore(card, firstActionRow);
  } else {
    mb.insertBefore(card, mb.firstChild);
  }
  if (window.hydrateIcons) window.hydrateIcons(card);
}

window.__sfOpenGDriveKas = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  closeModal();
  setTimeout(function(){
    if (typeof window.openGDriveKeuangan === 'function'){
      window.openGDriveKeuangan(cid);
    } else {
      alert('Fitur GDrive belum siap. Refresh halaman lalu coba lagi.');
    }
  }, 200);
};

function injectGDriveKeuanganButton(){
  if (!window.currentUser) return;
  if (uRole() !== 'bendahara' && !isGuru()) return;
  var mb = document.getElementById('modal-body');
  if (!mb) return;
  var mt = document.getElementById('modal-title');
  if (!mt) return;
  var titleText = (mt.textContent || mt.innerHTML || '').toLowerCase();
  if (titleText.indexOf('keuangan') < 0) return;
  if (mb.querySelector('.sf-gdrive-keu-card')) return;

  var cid = uCid();
  if (!cid) return;

  var card = document.createElement('div');
  card.className = 'card sf-gdrive-keu-card';
  card.style.cssText = 'border-left:4px solid var(--success);margin-bottom:14px;' +
    'background:linear-gradient(135deg,var(--success-soft),var(--info-soft));';
  card.innerHTML =
    '<h3 style="font-size:13.5px;margin-bottom:6px;">' + ic('folder') +
    ' Arsip Nota & Foto Barang</h3>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.55;">' +
      'Link folder Google Drive berisi bukti belanja & foto barang.' +
    '</p>' +
    '<button class="btn btn-success btn-sm btn-block" onclick="window.__sfOpenGDriveKas()">' +
      ic('folder','sm') + ' Buka Arsip GDrive' +
    '</button>';

  var firstCard = mb.querySelector('.card');
  if (firstCard && firstCard.parentNode){
    firstCard.parentNode.insertBefore(card, firstCard);
  } else {
    mb.insertBefore(card, mb.firstChild);
  }
  if (window.hydrateIcons) window.hydrateIcons(card);
}

function injectGDriveDokpubCard(){
  if (!window.currentUser) return;
  if (!isSiswa()) return;
  var role = uRole();
  if (role !== 'koor_publikasi' && role !== 'anggota_publikasi') return;
  var mc = document.getElementById('main-content');
  if (!mc) return;
  if (mc.querySelector('.sf-gdrive-dokpub-card')) return;

  var cid = uCid();
  if (!cid) return;

  var card = document.createElement('div');
  card.className = 'card sf-gdrive-dokpub-card';
  card.style.cssText = 'border-left:4px solid var(--success);margin-bottom:14px;' +
    'background:linear-gradient(135deg,var(--success-soft),var(--info-soft));';
  card.innerHTML =
    '<h3 style="font-size:13.5px;margin-bottom:6px;">' + ic('folder') +
    ' Galeri Dokumentasi GDrive</h3>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;line-height:1.55;">' +
      'Kelola link folder Google Drive untuk foto & video dokumentasi produksi.' +
    '</p>' +
    '<button class="btn btn-success btn-sm" onclick="window.__sfOpenGDriveDokpub()">' +
      ic('folder','sm') + ' Buka Galeri' +
    '</button>';

  var qa = mc.querySelector('.quick-actions-wrap');
  var toolbar = mc.querySelector('.mp-toolbar');
  if (qa && qa.parentNode){
    qa.parentNode.insertBefore(card, qa);
  } else if (toolbar && toolbar.nextSibling){
    toolbar.parentNode.insertBefore(card, toolbar.nextSibling);
  } else if (toolbar){
    toolbar.parentNode.appendChild(card);
  } else {
    mc.insertBefore(card, mc.firstChild);
  }
  if (window.hydrateIcons) window.hydrateIcons(card);
}

window.__sfOpenGDriveDokpub = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  if (typeof window.openGDriveDokpub === 'function'){
    window.openGDriveDokpub(cid);
  } else {
    alert('Fitur GDrive Dokpub belum siap. Refresh halaman lalu coba lagi.');
  }
};

/* ============================================================
   BAGIAN E — TOMBOL EXTRA DI TOOLBAR (.mp-toolbar)
   ============================================================ */
function injectToolbarExtraButtons(){
  if (!window.currentUser) return;
  if (!isSiswa()) return;
  var tb = document.querySelector('.mp-toolbar');
  if (!tb) return;
  var role = uRole();
  var cid = uCid();
  if (!cid) return;

  if (role === 'bendahara' && !tb.querySelector('.btn-gdrive-keuangan')){
    var b1 = document.createElement('button');
    b1.className = 'btn btn-gdrive-keuangan';
    b1.style.background = 'linear-gradient(135deg,var(--primary),var(--primary-dark))';
    b1.style.color = '#fff';
    b1.style.border = 'none';
    b1.onclick = function(){ if (window.openGDriveKeuangan) window.openGDriveKeuangan(cid); };
    b1.innerHTML = ic('folder', 14) + ' <span style="margin-left:4px;">Arsip Nota</span>';
    tb.appendChild(b1);
  }
  if ((role === 'koor_publikasi' || role === 'anggota_publikasi') && !tb.querySelector('.btn-gdrive-dokpub')){
    var b2 = document.createElement('button');
    b2.className = 'btn btn-gdrive-dokpub';
    b2.style.background = 'linear-gradient(135deg,var(--success),#059669)';
    b2.style.color = '#fff';
    b2.style.border = 'none';
    b2.onclick = function(){ if (window.openGDriveDokpub) window.openGDriveDokpub(cid); };
    b2.innerHTML = ic('folder', 14) + ' <span style="margin-left:4px;">Galeri Dokpub</span>';
    tb.appendChild(b2);
  }
  if ((role === 'pimpinan_produksi' || role === 'sekretaris') && !tb.querySelector('.btn-master-schedule')){
    var b3 = document.createElement('button');
    b3.className = 'btn btn-master-schedule';
    b3.onclick = function(){ if (window.openMasterSchedule) window.openMasterSchedule(cid); };
    b3.innerHTML = ic('calendar', 14) + ' <span style="margin-left:4px;">Master Jadwal</span>';
    tb.appendChild(b3);
  }
  if ((role === 'koor_publikasi' || role === 'anggota_publikasi') && !tb.querySelector('.btn-kalender-konten')){
    var b4 = document.createElement('button');
    b4.className = 'btn btn-kalender-konten';
    b4.onclick = function(){ if (window.openKalenderKonten) window.openKalenderKonten(cid); };
    b4.innerHTML = ic('image', 14) + ' <span style="margin-left:4px;">Kalender Konten</span>';
    tb.appendChild(b4);
  }
}

/* ============================================================
   BAGIAN F — HOOKS
   ============================================================ */

/* Hook renderGuruDash — auto-repair kelas */
(function(){
  var orig = window.renderGuruDash;
  if (typeof orig !== 'function') return;
  window.renderGuruDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      if (window.currentUser && window.currentUser.type === 'guru'){
        if (window.myClasses().length === 0 && Date.now() - __lastRepairAt > 5000){
          window.__repairKelas();
        }
      }
    }, 600);
    return ret;
  };
})();

/* Hook renderSiswaDash — inject toolbar & GDrive */
(function(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      injectToolbarExtraButtons();
      injectGDriveDokpubCard();
    }, 300);
    setTimeout(function(){
      injectToolbarExtraButtons();
      injectGDriveDokpubCard();
    }, 1000);
    return ret;
  };
})();

/* Hook showApp — load cache instan + repair */
(function(){
  var orig = window.showApp;
  if (typeof orig !== 'function') return;
  window.showApp = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      if (!window.currentUser || window.currentUser.type !== 'guru') return;

      // Load cache instan dulu (biar kelas langsung kelihatan)
      var cached = _loadCache();
      if (cached && cached.classes && cached.classes.length){
        window.DB.classes = cached.classes;
        console.log('[superfix] Cache instan:', cached.classes.length, 'kelas');
        if (window.renderGuruDash) window.renderGuruDash();
      }

      // Fresh read
      window.__repairKelas(function(ok, err){
        if (!ok && err && window.myClasses().length === 0){
          showStatusBar('Kelas tidak dapat dimuat.');
        }
      });
    }, 800);
    return ret;
  };
})();

/* Hook openKasKelas — inject GDrive card */
(function(){
  var orig = window.openKasKelas;
  if (typeof orig !== 'function') return;
  window.openKasKelas = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(injectGDriveKasButton, 120);
    setTimeout(injectGDriveKasButton, 400);
    return ret;
  };
})();

/* Hook openKeuanganModal — inject GDrive card */
(function(){
  var orig = window.openKeuanganModal;
  if (typeof orig === 'function'){
    window.openKeuanganModal = function(){
      var ret = orig.apply(this, arguments);
      setTimeout(injectGDriveKeuanganButton, 120);
      setTimeout(injectGDriveKeuanganButton, 400);
      return ret;
    };
  }
})();

/* Hook openKeuangan alias */
(function(){
  var orig = window.openKeuangan;
  if (typeof orig === 'function'){
    window.openKeuangan = function(){
      var ret = orig.apply(this, arguments);
      setTimeout(injectGDriveKeuanganButton, 120);
      setTimeout(injectGDriveKeuanganButton, 400);
      return ret;
    };
  }
})();

/* MutationObserver */
if (typeof MutationObserver !== 'undefined'){
  var mo = new MutationObserver(function(){
    injectGDriveKasButton();
    injectGDriveKeuanganButton();
    injectToolbarExtraButtons();
    injectGDriveDokpubCard();
  });
  var startMO = function(){
    var modal = document.getElementById('modal');
    if (modal) mo.observe(modal, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
    var mc = document.getElementById('main-content');
    if (mc) mo.observe(mc, {childList:true, subtree:true});
  };
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(startMO, 800); });
  } else {
    setTimeout(startMO, 800);
  }
}

/* ============================================================
   BAGIAN G — RUN AWAL + AUTO-RETRY + INTERVAL
   ============================================================ */

/* Login dropdown */
setTimeout(autoReadClassesForLogin, 800);
setTimeout(autoReadClassesForLogin, 2000);
setTimeout(populateLoginDropdown, 1500);
setTimeout(populateLoginDropdown, 3000);
setInterval(populateLoginDropdown, 2500);

/* Initial repair kelas */
setTimeout(function(){
  if (!window.currentUser || window.currentUser.type !== 'guru') return;
  var cached = _loadCache();
  if (cached && cached.classes && cached.classes.length){
    window.DB.classes = cached.classes;
    if (window.renderGuruDash) window.renderGuruDash();
  }
  window.__repairKelas(function(ok, err){
    if (!ok && err && window.myClasses().length === 0){
      showStatusBar('Kelas tidak dapat dimuat.');
    }
  });
}, 1500);

/* Auto-retry kelas tiap 45 detik */
setInterval(function(){
  if (!window.currentUser || window.currentUser.type !== 'guru') return;
  if (window.myClasses().length > 0) return;
  if (Date.now() - __lastRepairAt < 40000) return;
  console.log('[superfix] Auto-retry kelas...');
  window.__repairKelas();
}, 45000);

/* Auto-inject toolbar & GDrive tiap 5 detik */
setTimeout(function(){
  injectToolbarExtraButtons();
  injectGDriveDokpubCard();
}, 2000);
setTimeout(function(){
  injectToolbarExtraButtons();
  injectGDriveDokpubCard();
}, 4000);
setInterval(function(){
  injectToolbarExtraButtons();
  injectGDriveDokpubCard();
}, 5000);

/* ============================================================
   BAGIAN H — CONSOLE COMMANDS
   ============================================================ */
window.fixKelasSekarang = function(){
  window.__repairKelas(function(ok, err){
    if (ok) alert('✅ Kelas berhasil dimuat!');
    else if (err) alert('❌ ' + err.message);
    else alert('❌ Tidak ada kelas.');
  });
};

window.cekKelas = async function(){
  console.log('=== CEK KELAS ===');
  console.log('User  :', window.currentUser ? window.currentUser.email : '-');
  console.log('DB    :', (window.DB.classes||[]).length, 'kelas');
  var cached = _loadCache();
  console.log('Cache :', cached ? cached.classes.length + ' kelas (' + new Date(cached.at).toLocaleString('id-ID') + ')' : 'kosong');
  console.log('Source:', window.__kelasSource || '-');
  if (window.fb && window.firebaseReady){
    try {
      var s = await window.fb.collection('classes').get();
      console.log('✅ Primary:', s.size, 'kelas');
    } catch(e){ console.log('❌ Primary:', e.code, '-', e.message); }
  }
  if (window.fbBackup && window.fbBackupReady){
    try {
      var s2 = await window.fbBackup.collection('classes').get();
      console.log('✅ Backup:', s2.size, 'kelas');
    } catch(e){ console.log('❌ Backup:', e.code, '-', e.message); }
  }
};

window.bridgeInfo = function(){
  console.log('=== SUPERFIX INFO ===');
  console.log('User :', (window.currentUser||{}).name, '/', (window.currentUser||{}).role);
  console.log('CID  :', uCid());
  console.log('openTugasSaya:', typeof window.openTugasSaya);
  console.log('openDeadlineList:', typeof window.openDeadlineList);
  console.log('openGDriveKeuangan:', typeof window.openGDriveKeuangan);
  console.log('openGDriveDokpub:', typeof window.openGDriveDokpub);
  console.log('openKasKelas:', typeof window.openKasKelas);
  console.log('openMasterSchedule:', typeof window.openMasterSchedule);
};

window.clearKelasCache = function(){
  try {
    localStorage.removeItem(_cacheKey());
    console.log('Cache dibersihkan');
    alert('Cache kelas dibersihkan. Refresh halaman untuk coba lagi.');
  } catch(e){}
};

/* ============================================================
   LOADED
   ============================================================ */
console.log('[superfix] v7.0 loaded — semua perbaikan aktif');
console.log('  A. Repair kelas guru (cache-first + failover)');
console.log('  B. openTugasSaya, openDeadlineList, dll');
console.log('  C. Auto-populate dropdown kelas login');
console.log('  D. GDrive integration (Kas/Keuangan/Dokpub)');
console.log('  E. Tombol extra di toolbar sesuai role');
console.log('  → Console: bridgeInfo() | cekKelas() | fixKelasSekarang()');

})();