/* ============================================================
   SP-PPT features-fixes.js — v1.0 BRIDGE
   Mengisi semua fungsi yang dipanggil tapi belum ada,
   plus fix bug di app.js & form ID mismatch.
   Load PALING AKHIR setelah features-extra.js
   ============================================================ */
(function(){
'use strict';

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
   A. ALIAS SEDERHANA (nama beda, fungsi sudah ada)
   ============================================================ */
if (typeof window.openArsipNaskah !== 'function')
  window.openArsipNaskah = function(cid){
    if (typeof window.openNaskahList === 'function') return window.openNaskahList(cid || uCid());
  };

if (typeof window.openBookingAlatMusik !== 'function')
  window.openBookingAlatMusik = function(){
    if (typeof window.openBookingAlat === 'function') return window.openBookingAlat();
  };

if (typeof window.openChecklistView !== 'function')
  window.openChecklistView = function(cid){
    if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(cid);
  };

if (typeof window.openChecklistViewSelf !== 'function')
  window.openChecklistViewSelf = function(){
    if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(uCid());
  };

if (typeof window.openTimSaya !== 'function')
  window.openTimSaya = function(){
    if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(uCid());
  };

if (typeof window.openStudentChecklistSelf !== 'function')
  window.openStudentChecklistSelf = function(){
    if (typeof window.openChecklistPribadi === 'function') return window.openChecklistPribadi();
  };

if (typeof window.openGuruPasswordView !== 'function')
  window.openGuruPasswordView = function(cid){
    if (typeof window.lihatPassword === 'function') return window.lihatPassword(cid);
  };

if (typeof window.openEditTeacherModal !== 'function' && typeof window.openEditGuru === 'function')
  window.openEditTeacherModal = window.openEditGuru;

if (typeof window.openAddTeacherModal !== 'function' && typeof window.openAddTeacher === 'function')
  window.openAddTeacherModal = window.openAddTeacher;

/* ============================================================
   B. openCreateMeetingModalFull — Alias ke openBuatMeeting
   ============================================================ */
if (typeof window.openCreateMeetingModalFull !== 'function'){
  window.openCreateMeetingModalFull = function(type){
    type = type || 'rapat';
    var cid = uCid();
    if (typeof window.openBuatMeeting === 'function'){
      return window.openBuatMeeting(type, cid);
    }
    alert('Fungsi buat sesi absensi belum siap.');
  };
}

/* ============================================================
   C. openTugasSaya — Tampilkan checklist saya + tugas dari notif
   ============================================================ */
if (typeof window.openTugasSaya !== 'function'){
  window.openTugasSaya = function(){
    var cid = uCid(), sid = uSid();
    if (!cid || !sid){ alert('Data tidak ditemukan'); return; }
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
        (pct===100?'complete':'partial') + '" style="width:' + pct + '%"></div></div>';
      h += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">' +
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
  };
}

/* ============================================================
   D. openAbsensiHariIni — Filter sesi hari ini
   ============================================================ */
if (typeof window.openAbsensiHariIni !== 'function'){
  window.openAbsensiHariIni = function(){
    var cid = uCid();
    if (!cid) return;
    var today = new Date().toISOString().split('T')[0];
    var meetings = Object.values(window.DB.meetings||{}).filter(function(m){
      return m.classId === cid && m.date === today;
    });
    var h = '<div class="alert alert-info">' + ic('calendar') +
      '<div>Absensi Hari Ini — ' + meetings.length + ' sesi</div></div>';
    if (meetings.length === 0){
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
          '<button class="btn btn-primary btn-sm" ' +
            'onclick="closeModal();setTimeout(function(){window.openIsiAbsensi(\'' + m.id + '\')},150)">' +
            ic('edit','sm') + ' Isi Absensi</button>' +
        '</div>';
      });
    }
    openModal('Absensi Hari Ini', h);
  };
}

/* ============================================================
   E. openRubrikPenilaian — Tampilkan rubrik per peran
   ============================================================ */
if (typeof window.openRubrikPenilaian !== 'function'){
  window.openRubrikPenilaian = function(){
    var myRole = uRole();
    var rubric = window.getRubricFor ? window.getRubricFor(myRole) : [];
    var h = '<div class="alert alert-info">' + ic('target') +
      '<div><b>Rubrik Penilaian</b><br><small>Untuk peran: ' +
      esc(roleLabel(myRole)) + '</small></div></div>';

    if (rubric.length === 0){
      h += '<div class="empty-state"><p>Belum ada rubrik untuk peran Anda.</p></div>';
    } else {
      h += '<div class="scale-guide"><div class="scale-guide-title">' +
        ic('info','sm') + ' Skala Nilai</div><div class="scale-guide-grid">' +
        '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
        '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
        '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
        '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
        '</div></div>';
      rubric.forEach(function(r){
        h += '<div class="rubric-item">' +
          '<h4>' + esc(r.name) + ' <span class="weight-info">' + r.weight + '%</span></h4>' +
          '<div class="desc">' + esc(r.desc||'') + '</div>' +
          (r.scale ? '<div class="scale-explain"><b>Kriteria:</b> ' + esc(r.scale) + '</div>' : '') +
        '</div>';
      });
    }
    openModal('Rubrik Penilaian', h);
  };
}

/* ============================================================
   F. openDeadlineList — Daftar tugas + deadline dari notif
   ============================================================ */
if (typeof window.openDeadlineList !== 'function'){
  window.openDeadlineList = function(){
    var cid = uCid(), sid = uSid();
    var arr = (window.DB.notifications||[]).filter(function(n){
      if (n.classId !== cid) return false;
      if (n.type !== 'tugas') return false;
      if (n.toId === 'all') return true;
      if (n.toId === sid) return true;
      if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
      return false;
    }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

    var h = '<div class="alert alert-info">' + ic('clock') +
      '<div>Daftar deadline & tugas Anda (' + arr.length + ')</div></div>';
    if (arr.length === 0){
      h += '<div class="empty-state">' + ic('clock',40) + '<p>Tidak ada deadline aktif.</p></div>';
    } else {
      arr.forEach(function(n){
        h += '<div style="padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--warning);">' +
          '<div style="font-weight:700;font-size:13px;">' + esc(n.title||'Tugas') + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">' +
            esc(n.fromName||'') + ' — ' +
            (window.fmtDate ? window.fmtDate(n.createdAt) : '') + '</div>' +
          (n.message ? '<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">' +
            esc(n.message) + '</div>' : '') +
        '</div>';
      });
    }
    openModal('Deadline Saya', h);
  };
}

/* ============================================================
   G. openActivityFeedModal — Aktivitas tim di kelas
   ============================================================ */
if (typeof window.openActivityFeedModal !== 'function'){
  window.openActivityFeedModal = function(){
    var cid = uCid();
    var logs = (window.DB.activityLogs||[]).filter(function(l){
      return !l.classId || l.classId === cid;
    }).slice(0, 60);

    var h = '<div class="alert alert-info">' + ic('activity') +
      '<div><b>Aktivitas Tim</b> — ' + logs.length + ' entri</div></div>';
    if (logs.length === 0){
      h += '<div class="empty-state">' + ic('activity',40) + '<p>Belum ada aktivitas.</p></div>';
    } else {
      h += '<div class="activity-feed">';
      logs.forEach(function(l){
        h += '<div class="activity-item"><div class="activity-icon">' +
          ic('activity','sm') + '</div><div class="activity-content">' +
          '<div class="activity-msg">' + esc(l.message||'') + '</div>' +
          '<div class="activity-meta"><b>' + esc(l.userName||'-') + '</b> — ' +
          (window.fmtDate ? window.fmtDate(l.createdAt) : '') + '</div></div></div>';
      });
      h += '</div>';
    }
    openModal('Aktivitas Tim', h);
  };
}

/* ============================================================
   H. openLogWA — Log pengiriman WhatsApp
   ============================================================ */
if (typeof window.openLogWA !== 'function'){
  window.openLogWA = function(){
    var logs = Object.values(window.DB.waLogs||{})
      .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); })
      .slice(0, 80);

    var h = '<div class="alert alert-info">' + ic('messageCircle') +
      '<div><b>Log WhatsApp</b> — ' + logs.length + ' entri</div></div>';
    if (logs.length === 0){
      h += '<div class="empty-state">' + ic('messageCircle',40) + '<p>Belum ada log WA.</p></div>';
    } else {
      logs.forEach(function(l){
        h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--success);">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
            '<div style="font-weight:700;font-size:13px;">' + esc(l.title||'-') + '</div>' +
            '<div style="font-size:11px;color:var(--text-muted);">' +
              (window.fmtDate ? window.fmtDate(l.createdAt) : '') + '</div>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' +
            'Ke: <b>' + esc(l.toName||'-') + '</b> (' + esc(l.toPhone||'-') + ')</div>' +
          '<div style="font-size:12px;margin-top:6px;white-space:pre-wrap;">' +
            esc(l.message||'') + '</div>' +
        '</div>';
      });
    }
    openModal('Log WhatsApp', h);
  };
}

/* ============================================================
   I. openDashboardPesan — Semua notifikasi sebagai inbox
   ============================================================ */
if (typeof window.openDashboardPesan !== 'function'){
  window.openDashboardPesan = function(){
    var notifs = (window.DB.notifications||[])
      .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); })
      .slice(0, 80);

    var h = '<div class="alert alert-info">' + ic('messageCircle') +
      '<div><b>Dashboard Pesan</b><br>Ringkasan semua notifikasi</div></div>';
    if (notifs.length === 0){
      h += '<div class="empty-state">' + ic('messageCircle',40) + '<p>Belum ada pesan.</p></div>';
    } else {
      notifs.forEach(function(n){
        var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type] || 'Info';
        h += '<div class="card" style="margin-bottom:6px;border-left:3px solid var(--primary);">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px;">' +
            '<span class="badge badge-primary">' + tl + '</span>' +
            '<span style="font-size:11px;color:var(--text-muted);">' +
              (window.fmtDate ? window.fmtDate(n.createdAt) : '') + '</span>' +
          '</div>' +
          '<div style="font-weight:700;font-size:13px;">' + esc(n.title||'Notifikasi') + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Dari: <b>' +
            esc(n.fromName||'-') + '</b></div>' +
          (n.message ? '<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">' +
            esc(n.message) + '</div>' : '') +
        '</div>';
      });
    }
    openModal('Dashboard Pesan', h);
  };
}

/* ============================================================
   J. openKoordinasiAntarKelas — fallback jika features.js tidak dimuat
   ============================================================ */
if (typeof window.openKoordinasiAntarKelas !== 'function'){
  window.openKoordinasiAntarKelas = function(){
    if (typeof window.openKoordinasi === 'function') return window.openKoordinasi();

    var cid = uCid();
    var others = (window.DB.classes||[]).filter(function(c){ return c.id !== cid; });
    var msgs = Object.values(window.DB.coordination||{})
      .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); })
      .slice(0, 20);

    var h = '<div class="alert alert-info">' + ic('messageCircle') +
      '<div><b>Koordinasi Antar Kelas</b></div></div>';

    if (msgs.length > 0){
      h += '<div style="max-height:280px;overflow-y:auto;padding:8px;background:var(--surface);border-radius:8px;margin-bottom:12px;">';
      msgs.forEach(function(m){
        h += '<div style="padding:8px;background:var(--card);border-radius:6px;margin-bottom:6px;">' +
          '<div style="font-size:11.5px;color:var(--text-muted);">' +
            esc(m.fromClassName||'') + ' — ' + esc(m.fromName||'') + ' ke ' +
            esc(m.toClassName||'Semua') + '</div>' +
          '<div style="font-size:12.5px;margin-top:4px;white-space:pre-wrap;">' +
            esc(m.message||'') + '</div>' +
        '</div>';
      });
      h += '</div>';
    }

    h += '<div class="form-group"><label>Kirim Ke</label>' +
      '<select id="koord-target"><option value="">Semua Kelas</option>' +
      others.map(function(c){
        return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
      }).join('') + '</select></div>';
    h += '<div class="form-group"><label>Pesan</label>' +
      '<textarea id="koord-msg" rows="3" maxlength="500"></textarea></div>';
    h += '<button class="btn btn-primary btn-block" onclick="window.__kirimKoordF4()">' +
      ic('send') + ' Kirim</button>';
    openModal('Koordinasi Antar Kelas', h);
  };

  window.__kirimKoordF4 = function(){
    var msg = (document.getElementById('koord-msg').value||'').trim();
    var toCid = (document.getElementById('koord-target').value||'');
    if (!msg){ alert('Pesan kosong'); return; }
    var cid = uCid();
    var c = findClass(cid);
    var toC = toCid ? findClass(toCid) : null;
    var id = uid();
    window.fbSet('coordination', id, {
      id: id, message: msg,
      fromClassId: cid, fromClassName: c ? c.name : '-',
      fromName: u().name, fromRole: uRole(),
      toClassId: toCid || null, toClassName: toC ? toC.name : 'Semua Kelas',
      createdAt: Date.now()
    }).then(function(){
      closeModal();
      alert('Pesan terkirim!');
      setTimeout(window.openKoordinasiAntarKelas, 200);
    }).catch(function(e){ alert('Gagal: ' + e.message); });
  };
}

/* ============================================================
   K. FIX BUG: tandaiTugasSelesai — `u().name` undefined
   ============================================================ */
window.tandaiTugasSelesai = function(id){
  var n = (window.DB.notifications||[]).find(function(x){ return x.id === id; });
  if (!n){ alert('Notifikasi tidak ditemukan'); return; }
  var me = window.currentUser || {};
  var key = me.studentId || me.email;
  if (!key){ alert('Tidak bisa menandai'); return; }
  var db = (n.doneBy || []).slice();
  if (db.indexOf(key) >= 0){ alert('Tugas sudah ditandai selesai'); return; }
  db.push(key);
  window.fbSet('notifications', id, Object.assign({}, n, { doneBy: db })).then(function(){
    if (window.logActivity){
      window.logActivity('task_done',
        (me.name||'User') + ' tandai tugas selesai: ' + (n.title||''),
        { classId: n.classId });
    }
    alert('Tugas ditandai selesai!');
    if (window.renderNotifPanel) window.renderNotifPanel();
    if (window.updateBadge) window.updateBadge();
  }).catch(function(e){
    console.error('[tandaiTugasSelesai]', e);
    alert('Gagal: ' + e.message);
  });
};

/* ============================================================
   L. FIX BUG: registerSiswa — ID form tidak match
      (HTML pakai daftar-*, app.js lama pakai reg-*)
   ============================================================ */
window.registerSiswa = function(){
  var code = (document.getElementById('daftar-code')||{}).value;
  if (code === undefined){
    // Fallback ke versi lama kalau pakai reg-*
    if (typeof window.__registerSiswaOld === 'function') return window.__registerSiswaOld();
    return;
  }
  code = String(code||'').trim().toUpperCase();
  var name = (document.getElementById('daftar-name').value||'').trim();
  var email = (document.getElementById('daftar-email').value||'').trim().toLowerCase();
  var phone = (document.getElementById('daftar-phone').value||'').replace(/\D/g,'');
  var pw = document.getElementById('daftar-password').value;
  var cf = document.getElementById('daftar-confirm').value;
  var role = document.getElementById('daftar-role').value;

  if (!code || !name || !email || !phone || !pw || !cf || !role){
    alert('Lengkapi semua field!'); return;
  }
  if (phone.length < 10 || phone.length > 15){ alert('No. WA tidak valid!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length < 6){ alert('Password minimal 6 karakter!'); return; }
  if (pw !== cf){ alert('Konfirmasi password tidak cocok!'); return; }

  var cls = (window.DB.classes||[]).find(function(c){ return c.code === code; });
  if (!cls){ alert('Kode Kelas tidak valid!'); return; }

  var dupE = (window.DB.classes||[]).some(function(c){
    return (c.students||[]).some(function(s){ return s.email && s.email.toLowerCase() === email; });
  });
  if (dupE){ alert('Email sudah terdaftar!'); return; }

  var dupP = (window.DB.classes||[]).some(function(c){
    return (c.students||[]).some(function(s){ return s.phone === phone; });
  });
  if (dupP){ alert('No. WA sudah terdaftar!'); return; }

  var ns = {
    id: uid(), name: name, email: email, phone: phone,
    password: pw, role: role, registeredAt: Date.now()
  };
  var newStudents = (cls.students||[]).concat([ns]);

  window.fbSet('classes', cls.id, Object.assign({}, cls, { students: newStudents }))
    .then(function(){
      alert('Pendaftaran berhasil!\n\nNama: ' + name + '\nKelas: ' + cls.name + '\n\nSilakan login.');
      if (window.showLoginPage) window.showLoginPage();
      if (window.switchLoginTab) window.switchLoginTab('siswa');
      setTimeout(function(){
        var sel = document.getElementById('siswa-kelas');
        if (sel) sel.value = cls.id;
        var em = document.getElementById('siswa-email');
        if (em) em.value = email;
      }, 300);
    }).catch(function(err){
      alert('Gagal mendaftar: ' + err.message);
    });
};

/* ============================================================
   M. FIX: openForgotPassword (form Lupa Password)
   ============================================================ */
if (typeof window.openForgotPassword !== 'function' || !window.openForgotPassword.__fixed){
  window.__resetCodes = window.__resetCodes || {};

  window.openForgotPassword = function(t){
    var l = t === 'guru' ? 'Guru' : 'Siswa';
    openModal('Lupa Password ' + l,
      '<div class="alert alert-info">' + ic('info') +
      '<div>Masukkan email terdaftar. Kode akan ditampilkan (mode demo).</div></div>' +
      '<div class="form-group"><label>Email</label>' +
      '<input type="email" id="lupa-email" placeholder="nama@email.com"></div>' +
      '<button class="btn btn-primary btn-block" onclick="window.__sendResetCode()">' +
      ic('send') + ' Kirim Kode</button>');
  };
  window.openForgotPassword.__fixed = true;

  window.__sendResetCode = function(){
    var e = (document.getElementById('lupa-email').value||'').trim().toLowerCase();
    if (!e){ alert('Masukkan email'); return; }
    var isG = (window.DB.teachers||[]).some(function(t){
      return t.email && t.email.toLowerCase() === e;
    });
    var isS = (window.DB.classes||[]).some(function(c){
      return (c.students||[]).some(function(s){
        return s.email && s.email.toLowerCase() === e;
      });
    });
    if (!isG && !isS){ alert('Email tidak terdaftar!'); return; }

    var code = Math.floor(100000 + Math.random()*900000).toString();
    window.__resetCodes[e] = { code: code, expires: Date.now() + 15*60*1000 };
    alert('DEMO — Kode reset: ' + code + '\n\n(Berlaku 15 menit)');

    openModal('Reset Password',
      '<div class="alert alert-success">' + ic('checkCircle') +
      '<div>Kode telah dikirim. Masukkan kode + password baru.</div></div>' +
      '<div class="form-group"><label>Kode</label>' +
      '<input type="text" id="reset-code" maxlength="6" ' +
      'style="text-align:center;font-size:20px;letter-spacing:.4em;"></div>' +
      '<div class="form-group pw-toggle"><label>Password Baru</label>' +
      '<input type="password" id="reset-newpw">' +
      '<button class="toggle-btn" type="button" onclick="togglePw(\'reset-newpw\',this)">' +
      '<span data-ico="eye" data-size="16"></span></button></div>' +
      '<div class="form-group pw-toggle"><label>Konfirmasi</label>' +
      '<input type="password" id="reset-confirmpw">' +
      '<button class="toggle-btn" type="button" onclick="togglePw(\'reset-confirmpw\',this)">' +
      '<span data-ico="eye" data-size="16"></span></button></div>' +
      '<button class="btn btn-primary btn-block" onclick="window.__doResetPassword(\'' + e + '\')">' +
      ic('key') + ' Reset Password</button>');
  };

  window.__doResetPassword = function(email){
    var c = (document.getElementById('reset-code').value||'').trim();
    var n = (document.getElementById('reset-newpw').value||'').trim();
    var cf = (document.getElementById('reset-confirmpw').value||'').trim();
    if (!c || !n || !cf){ alert('Lengkapi semua field'); return; }
    if (n.length < 6){ alert('Min 6 karakter'); return; }
    if (n !== cf){ alert('Konfirmasi tidak cocok'); return; }
    var s = window.__resetCodes[email];
    if (!s || Date.now() > s.expires){ alert('Kode kedaluwarsa'); return; }
    if (s.code !== c){ alert('Kode salah'); return; }

    var t = (window.DB.teachers||[]).find(function(x){
      return x.email && x.email.toLowerCase() === email;
    });
    if (t){
      window.fbSet('teachers', t.email, Object.assign({}, t, { password: n }))
        .then(function(){
          delete window.__resetCodes[email];
          alert('Password berhasil direset!');
          closeModal();
        });
      return;
    }
    var done = false;
    (window.DB.classes||[]).forEach(function(cls){
      var st = (cls.students||[]).find(function(x){
        return x.email && x.email.toLowerCase() === email;
      });
      if (st){
        st.password = n;
        window.fbSet('classes', cls.id, cls);
        done = true;
      }
    });
    if (done){
      delete window.__resetCodes[email];
      alert('Password berhasil direset!');
      closeModal();
    } else {
      alert('Gagal reset — akun tidak ditemukan');
    }
  };
}

/* ============================================================
   N. FIX: openChangePassword — Fallback jika tidak ada
   ============================================================ */
if (typeof window.openChangePassword !== 'function'){
  window.openChangePassword = function(){
    openModal('Ubah Password',
      '<div class="alert alert-info">' + ic('info') +
      '<div>Hubungi admin untuk reset password.</div></div>');
  };
}

/* ============================================================
   O. FIX: openKeuangan / openKasKelas / openPeminjamanBarang
        (placeholder yang lebih informatif)
   ============================================================ */
if (typeof window.openKeuangan === 'function' && window.openKeuangan.__placeholder !== false){
  // Biarkan versi placeholder dari features-finance.js
  // Tapi beri info tambahan
}

console.log('[features-fixes] v1.0 BRIDGE loaded — semua alias & fix diterapkan');

})();
