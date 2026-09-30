/* ============================================================
   SP-PPT features-comms.js — v1.0 MILESTONE 5
   Fitur:
   1. Aduan Siswa (form + floating button + riwayat + feedback)
   2. Dashboard Pesan Peran Penting
   3. WA Deep Link (wa.me + 3 tombol: per penerima / semua / copy)
   4. Koordinasi Antar Kelas (target peran spesifik)
   5. Log WA lengkap + filter + search + export
   6. Broadcast lanjutan
   Load SETELAH features-docs.js
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico){ console.warn('[features-comms] app.js belum di-load.'); return; }

/* ============================================================
   HELPERS
   ============================================================ */
function ic(n,s){ return window.ico ? window.ico(n,s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function fmtDate(ts){ return window.fmtDate ? window.fmtDate(ts) : '-'; }
function fmtDateShort(s){ return window.fmtDateShort ? window.fmtDateShort(s) : '-'; }
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
function logAct(t,m,k){ if (window.logActivity) window.logActivity(t,m,k); }
function roleLabel(r){ return (window.ROLES&&window.ROLES[r]&&window.ROLES[r].label) || r; }

/* ============================================================
   NORMALIZE PHONE & BUILD WA LINK
   ============================================================ */
function normalizePhone(p){
  p = String(p||'').replace(/\D/g,'');
  if (!p) return '';
  if (p.charAt(0) === '0') p = '62' + p.substring(1);
  if (p.substring(0,2) !== '62') p = '62' + p;
  return p;
}

function buildWALink(phone, message){
  var p = normalizePhone(phone);
  if (!p) return '';
  return 'https://wa.me/' + p + '?text=' + encodeURIComponent(message || '');
}
window.buildWALink = buildWALink;
window.normalizePhone = normalizePhone;

/* ============================================================
   TEMPLATE PESAN WA
   ============================================================ */
window.WA_TEMPLATES = {
  tugas: {
    label:'Beri Tugas',
    build: function(opts){
      return '*SP-PPT — SMP Negeri 10 Samarinda*\n' +
        '_Tugas Baru_\n\n' +
        'Yth. *' + opts.name + '*\n' +
        '(' + opts.role + ')\n\n' +
        'Anda mendapat tugas:\n\n' +
        '*' + opts.title + '*\n\n' +
        (opts.desc || '') +
        (opts.deadline ? '\n\nDeadline: *' + opts.deadline + '*' : '') +
        '\n\nMohon dikerjakan dengan baik.\n\n' +
        '—\nDari: ' + opts.sender + '\n' +
        'Waktu: ' + new Date().toLocaleString('id-ID');
    }
  },
  kas: {
    label:'Tagihan Kas',
    build: function(opts){
      return '*SP-PPT — SMP Negeri 10 Samarinda*\n' +
        '_Pengingat Kas Kelas_\n\n' +
        'Yth. *' + opts.name + '*\n' +
        '(' + opts.role + ')\n\n' +
        'Anda belum membayar kas kelas:\n\n' +
        '*' + (opts.kasName || 'Kas Kelas') + '*\n' +
        'Nominal: *Rp ' + (opts.nominal || 0).toLocaleString('id-ID') + '*\n' +
        'Periode: ' + (opts.periode || '-') + '\n\n' +
        'Mohon segera diselesaikan ya.\n\n' +
        '—\nDari: ' + opts.sender + '\n' +
        'Waktu: ' + new Date().toLocaleString('id-ID');
    }
  },
  peringatan: {
    label:'Peringatan',
    build: function(opts){
      return '*SP-PPT — SMP Negeri 10 Samarinda*\n' +
        '_Peringatan_\n\n' +
        'Yth. *' + opts.name + '*\n\n' +
        (opts.message || '') + '\n\n' +
        'Mohon diperhatikan.\n\n' +
        '—\nDari: ' + opts.sender + '\n' +
        'Waktu: ' + new Date().toLocaleString('id-ID');
    }
  },
  info: {
    label:'Informasi',
    build: function(opts){
      return '*SP-PPT — SMP Negeri 10 Samarinda*\n' +
        '_Informasi_\n\n' +
        'Yth. *' + opts.name + '*\n\n' +
        (opts.message || '') + '\n\n' +
        '—\nDari: ' + opts.sender + '\n' +
        'Waktu: ' + new Date().toLocaleString('id-ID');
    }
  },
  aduan_response: {
    label:'Balasan Aduan',
    build: function(opts){
      return '*SP-PPT — SMP Negeri 10 Samarinda*\n' +
        '_Balasan Aduan_\n\n' +
        'Yth. *' + opts.name + '*\n\n' +
        'Terima kasih atas aduan Anda mengenai:\n' +
        '_' + (opts.aduanTitle || '-') + '_\n\n' +
        'Balasan dari guru:\n\n' +
        (opts.message || '') + '\n\n' +
        '—\nDari: ' + opts.sender + '\n' +
        'Waktu: ' + new Date().toLocaleString('id-ID');
    }
  }
};

/* ============================================================
   1. WA PANEL GENERIK
   ============================================================ */
window.__waContext = null;

/**
 * Buka panel WA untuk kirim pesan ke beberapa penerima
 * opts: { targets: [{name, role, phone, id}], title, message, cid, type }
 */
function openWAPanel(opts){
  var targets = (opts.targets || []).filter(function(t){
    return t.phone && normalizePhone(t.phone);
  });
  if (targets.length === 0){
    alert('Tidak ada penerima dengan No. WA valid.');
    return;
  }

  window.__waContext = {
    targets: targets,
    title: opts.title || 'Pesan',
    message: opts.message || '',
    sender: u().name || 'Admin',
    cid: opts.cid || uCid(),
    type: opts.type || 'info'
  };

  var h = '';
  h += '<div class="alert alert-info">' + ic('phone') + '<div><b>Kirim via WhatsApp</b><br>' +
    '<small>' + targets.length + ' penerima dengan No. WA valid</small></div></div>';

  h += '<div class="action-row" style="margin-bottom:12px;flex-wrap:wrap;">' +
    '<button class="btn btn-sm btn-primary" onclick="openAllWABerurutan()">' + ic('send','sm') + ' Buka Semua Berurutan</button>' +
    '<button class="btn btn-sm" onclick="copySemuaWAPesan()">' + ic('copy','sm') + ' Copy Semua Pesan</button>' +
    '<button class="btn btn-sm" onclick="previewWAPesan(0)">' + ic('eye','sm') + ' Preview</button>' +
  '</div>';

  h += '<div style="max-height:400px;overflow-y:auto;">';
  targets.forEach(function(t, i){
    var link = buildWALink(t.phone, buildMessageFor(t));
    h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;flex-wrap:wrap;">' +
      '<div style="flex:1;min-width:150px;">' +
        '<div style="font-weight:700;font-size:13px;">' + esc(t.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--success);">' + ic('phone','sm') + ' ' + esc(t.phone) + '</div>' +
        '<div style="font-size:10.5px;color:var(--text-muted);">' + esc(roleLabel(t.role)) + '</div>' +
      '</div>' +
      '<a href="' + link + '" target="_blank" rel="noopener" class="btn btn-sm btn-success" style="text-decoration:none;" onclick="markWASent(' + i + ')">' +
        ic('send','sm') + ' Buka WA' +
      '</a>' +
      '<span id="wa-status-' + i + '"></span>' +
    '</div>';
  });
  h += '</div>';

  h += '<div style="margin-top:14px;padding:12px;background:var(--surface);border-radius:8px;font-size:12px;color:var(--text-muted);line-height:1.6;">' +
    '<b>' + ic('info','sm') + ' Catatan:</b><br>' +
    '&bull; Di HP: link akan membuka aplikasi WhatsApp<br>' +
    '&bull; Di laptop: WhatsApp Web akan terbuka, pastikan sudah login<br>' +
    '&bull; Pesan sudah terisi otomatis — tinggal klik Send<br>' +
  '</div>';

  h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="closeModal()">Selesai</button>';

  openModal('Kirim via WhatsApp', h);
  if (window.hydrateIcons) window.hydrateIcons();
}

function buildMessageFor(t){
  var ctx = window.__waContext;
  if (!ctx) return '';
  var tpl = window.WA_TEMPLATES[ctx.type] || window.WA_TEMPLATES.info;
  return tpl.build({
    name: t.name,
    role: roleLabel(t.role),
    title: ctx.title,
    message: ctx.message,
    sender: ctx.sender,
    desc: ctx.desc || '',
    deadline: ctx.deadline || '',
    kasName: ctx.kasName || '',
    nominal: ctx.nominal || 0,
    periode: ctx.periode || '',
    aduanTitle: ctx.aduanTitle || ''
  });
}

window.openWA = function(i){
  var ctx = window.__waContext;
  if (!ctx) return;
  var t = ctx.targets[i];
  if (!t) return;
  var msg = buildMessageFor(t);
  var link = buildWALink(t.phone, msg);
  window.open(link, '_blank');
  // Log ke Firestore
  var logId = uid();
  window.fbSet('wa_logs', logId, {
    id: logId, classId: ctx.cid || '',
    fromId: uSid() || u().email || 'system',
    fromName: ctx.sender, fromType: uType(), fromRole: uRole(),
    toId: t.id || '', toName: t.name, toRole: t.role || '', toPhone: t.phone,
    type: ctx.type, title: ctx.title, message: ctx.message,
    channel: 'wa', createdAt: Date.now()
  });
  var st = document.getElementById('wa-status-' + i);
  if (st) st.innerHTML = '<span class="badge badge-success">' + ic('check','sm') + ' Dibuka</span>';
};

window.openAllWABerurutan = function(){
  var ctx = window.__waContext;
  if (!ctx) return;
  var ts = ctx.targets;
  if (ts.length === 0) return;
  if (!confirm('Buka ' + ts.length + ' tab WhatsApp berurutan?\n(jeda 1.2 detik antar tab)')) return;
  var i = 0;
  function next(){
    if (i >= ts.length){
      alert('Selesai! ' + ts.length + ' tab dibuka.');
      return;
    }
    window.openWA(i);
    i++;
    setTimeout(next, 1200);
  }
  next();
};

window.copySemuaWAPesan = function(){
  var ctx = window.__waContext;
  if (!ctx) return;
  var txt = '=== PENERIMA & PESAN ===\n\n';
  ctx.targets.forEach(function(t, i){
    var msg = buildMessageFor(t);
    txt += (i+1) + '. ' + t.name + ' (' + roleLabel(t.role) + ')\n   WA: ' + t.phone + '\n\n' + msg + '\n\n---\n\n';
  });
  if (navigator.clipboard){
    navigator.clipboard.writeText(txt).then(function(){ alert('Semua pesan disalin ke clipboard!'); })
      .catch(function(){ prompt('Copy pesan:', txt); });
  } else {
    prompt('Copy pesan:', txt);
  }
};

window.previewWAPesan = function(i){
  var ctx = window.__waContext;
  if (!ctx) return;
  var t = ctx.targets[i || 0];
  if (!t) return;
  var msg = buildMessageFor(t);
  openModal('Preview Pesan ke ' + esc(t.name),
    '<div style="padding:14px;background:#dcf8c6;border-radius:12px;font-size:12.5px;line-height:1.7;white-space:pre-wrap;font-family:Segoe UI;">' +
    esc(msg) + '</div>' +
    '<div style="display:flex;gap:6px;margin-top:12px;">' +
    '<button class="btn btn-primary" onclick="closeModal();openWA(' + i + ')" style="flex:1;">' + ic('send') + ' Buka WA</button>' +
    '<button class="btn" onclick="closeModal()">Tutup</button>' +
    '</div>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.markWASent = function(i){
  setTimeout(function(){
    var st = document.getElementById('wa-status-' + i);
    if (st) st.innerHTML = '<span class="badge badge-success">' + ic('check','sm') + ' Dibuka</span>';
  }, 200);
};

/* ============================================================
   2. BERI TUGAS (dengan WA template)
   ============================================================ */
window.openBeriTugas = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var students = (c.students || []).filter(function(s){
    return isGuru() || s.id !== uSid();
  });
  if (students.length === 0){ alert('Tidak ada siswa'); return; }

  var h = '';
  h += '<div class="alert alert-info">' + ic('send') + '<div><b>Beri Tugas</b> &mdash; pilih penerima + kirim via WA</div></div>';
  h += '<div class="form-group"><label>Judul Tugas</label><input id="bt-title" maxlength="100"></div>';
  h += '<div class="form-group"><label>Deskripsi</label><textarea id="bt-desc" rows="3" maxlength="500"></textarea></div>';
  h += '<div class="form-group"><label>Deadline (opsional)</label><input type="date" id="bt-deadline"></div>';
  h += '<div class="form-group"><label>Filter Cepat</label>' +
    '<div class="action-row">' +
    '<button type="button" class="btn btn-sm" onclick="btSelectAll(true)">Semua</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelectAll(false)">Kosongkan</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelectRole(\'pemain\')">Pemain</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelectTeam(\'produksi\')">Produksi</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelectTeam(\'artistik\')">Artistik</button>' +
    '</div></div>';
  h += '<div class="form-group"><label>Penerima</label>' +
    '<div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  students.forEach(function(s){
    var hasWA = s.phone && normalizePhone(s.phone);
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="bt-cb" value="' + s.id + '" data-name="' + esc(s.name) + '" data-role="' + esc(s.role) + '" data-phone="' + esc(s.phone || '') + '" checked>' +
      '<span style="flex:1;font-weight:600;">' + esc(s.name) + '</span>' +
      '<span style="font-size:10.5px;color:var(--text-muted);">' + esc(roleLabel(s.role)) + '</span>' +
      (hasWA ? '<span class="badge badge-success" style="font-size:9px;">WA</span>' : '<span class="badge badge-gray" style="font-size:9px;">-</span>') +
    '</label>';
  });
  h += '</div></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" onclick="doBeriTugas(\'' + cid + '\')">' + ic('send') + ' Kirim Tugas</button>';
  openModal('Beri Tugas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.btSelectAll = function(c){ document.querySelectorAll('.bt-cb').forEach(function(cb){ cb.checked = c; }); };
window.btSelectRole = function(role){
  document.querySelectorAll('.bt-cb').forEach(function(cb){
    cb.checked = cb.getAttribute('data-role') === role;
  });
};
window.btSelectTeam = function(team){
  document.querySelectorAll('.bt-cb').forEach(function(cb){
    var r = cb.getAttribute('data-role');
    var t = (window.ROLES[r] || {}).team;
    cb.checked = t === team;
  });
};

window.doBeriTugas = function(cid){
  var title = (document.getElementById('bt-title').value || '').trim();
  var desc = (document.getElementById('bt-desc').value || '').trim();
  var deadline = document.getElementById('bt-deadline').value;
  if (!title){ alert('Judul wajib diisi'); return; }

  var targets = [];
  document.querySelectorAll('.bt-cb:checked').forEach(function(cb){
    targets.push({
      id: cb.value,
      name: cb.getAttribute('data-name'),
      role: cb.getAttribute('data-role'),
      phone: cb.getAttribute('data-phone') || ''
    });
  });
  if (targets.length === 0){ alert('Pilih minimal 1 penerima'); return; }

  var taskId = uid();
  var deadlineStr = deadline ? fmtDateShort(deadline) : '';
  var messageFull = desc + (deadline ? '\n\nDeadline: ' + deadlineStr : '');

  // Buat notifikasi
  targets.forEach(function(t){
    window.fbSet('notifications', uid(), {
      id: uid(), classId: cid,
      fromId: uSid() || u().email || 'guru',
      fromName: u().name, fromType: uType(), fromRole: uRole(),
      toId: t.id, type: 'tugas',
      title: '[TUGAS] ' + title,
      message: messageFull,
      taskId: taskId,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
  });

  // Simpan task record
  window.fbSet('tasks', taskId, {
    id: taskId, classId: cid,
    title: title, desc: desc, deadline: deadline || null,
    recipientIds: targets.map(function(t){ return t.id; }),
    fromId: uSid() || u().email || 'guru',
    fromName: u().name,
    createdAt: Date.now(),
    status: 'active'
  });

  logAct('task_create', u().name + ' beri tugas "' + title + '" ke ' + targets.length + ' siswa', {classId:cid});

  closeModal();

  // Buka WA panel untuk yang punya WA
  var withWA = targets.filter(function(t){ return t.phone && normalizePhone(t.phone); });
  if (withWA.length > 0){
    openWAPanel({
      targets: withWA,
      title: title,
      message: messageFull,
      cid: cid,
      type: 'tugas'
    });
  } else {
    alert('Tugas terkirim ke ' + targets.length + ' siswa!');
  }
};

/* ============================================================
   3. ADUAN SISWA
   ============================================================ */
window.openAduanSiswa = function(){
  if (!isSiswa()){ alert('Hanya untuk siswa'); return; }
  var cid = uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var aduanList = (window.DB.aduan || {});
  var myAduan = Object.values(aduanList).filter(function(a){
    return a.classId === cid && a.fromId === uSid();
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var guruPhone = '';
  if (c.teacherEmail){
    var t = (window.DB.teachers||[]).find(function(x){ return x.email && x.email.toLowerCase() === c.teacherEmail.toLowerCase(); });
    if (t) guruPhone = t.phone || '';
  }

  var h = '';
  h += '<div class="alert alert-warning">' + ic('warning') + '<div><b>PENTING:</b> Aduan hanya untuk masalah signifikan. Gunakan dengan bijak.</div></div>';

  if (!guruPhone){
    h += '<div class="alert alert-danger">' + ic('warning') + '<div>Guru belum mengisi No. WA. Hubungi guru secara langsung.</div></div>';
  }

  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" ' + (guruPhone ? 'onclick="openBuatAduan()"' : 'disabled') + '>' +
    ic('plus','sm') + ' Buat Aduan Baru</button>';

  h += '<h3 style="font-size:14px;font-weight:700;margin-bottom:10px;">Riwayat Aduan Saya (' + myAduan.length + ')</h3>';

  if (myAduan.length === 0){
    h += '<div class="empty-state">' + ic('messageCircle',40) + '<p>Belum ada aduan</p></div>';
  } else {
    myAduan.forEach(function(a){
      var statusBadge = a.status === 'resolved' ? '<span class="badge badge-success">Selesai</span>' :
        a.status === 'read' ? '<span class="badge badge-info">Dibaca</span>' :
        '<span class="badge badge-warning">Menunggu</span>';
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid ' + (a.status === 'resolved' ? 'var(--success)' : 'var(--warning)') + ';">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
          '<div style="font-weight:700;font-size:13px;">' + esc(a.title) + '</div>' + statusBadge +
        '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">Kategori: <b>' + esc(a.category) + '</b> &middot; ' + fmtDate(a.createdAt) + '</div>' +
        '<div style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;">' + esc(a.detail) + '</div>' +
        (a.feedback ? '<div style="margin-top:8px;padding:10px;background:var(--success-soft);border-radius:6px;font-size:12.5px;border-left:3px solid var(--success);"><b>Balasan Guru:</b><br>' + esc(a.feedback) + '</div>' : '') +
      '</div>';
    });
  }

  openModal('Aduan Siswa', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openBuatAduan = function(){
  var cid = uCid();
  var c = findClass(cid);
  if (!c) return;
  var guruName = '-';
  if (c.teacherEmail){
    var t = (window.DB.teachers||[]).find(function(x){ return x.email && x.email.toLowerCase() === c.teacherEmail.toLowerCase(); });
    if (t) guruName = t.name;
  }

  var h = '';
  h += '<div class="alert alert-info">' + ic('info') + '<div>Aduan akan dikirim ke guru: <b>' + esc(guruName) + '</b></div></div>';
  h += '<div class="form-group"><label>Kategori</label>' +
    '<select id="ad-cat">' +
    '<option value="Perundungan">Perundungan</option>' +
    '<option value="Kekerasan fisik">Kekerasan fisik</option>' +
    '<option value="Kerusakan alat">Kerusakan alat</option>' +
    '<option value="Kendala besar">Kendala besar</option>' +
    '<option value="Kesalahan koordinasi">Kesalahan koordinasi</option>' +
    '<option value="Lainnya">Lainnya</option>' +
    '</select></div>';
  h += '<div class="form-group"><label>Judul Singkat</label><input id="ad-title" maxlength="100"></div>';
  h += '<div class="form-group"><label>Detail Kronologi</label>' +
    '<textarea id="ad-detail" rows="6" maxlength="1000" placeholder="Jelaskan apa yang terjadi, kapan, di mana, siapa yang terlibat..."></textarea>' +
    '<small class="hint">Minimal 20 karakter. Jelaskan dengan jelas.</small></div>';
  h += '<div class="form-group"><label>Kirim via</label><select id="ad-channel">' +
    '<option value="both">Notifikasi + WhatsApp</option>' +
    '<option value="app">Hanya Notifikasi</option>' +
    '<option value="wa">Hanya WhatsApp</option>' +
    '</select></div>';
  h += '<button class="btn btn-danger btn-block btn-lg" onclick="submitAduan()">' + ic('send') + ' Kirim Aduan</button>';
  openModal('Buat Aduan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.submitAduan = function(){
  var cid = uCid();
  var c = findClass(cid);
  if (!c) return;
  var cat = document.getElementById('ad-cat').value;
  var title = (document.getElementById('ad-title').value || '').trim();
  var detail = (document.getElementById('ad-detail').value || '').trim();
  var channel = document.getElementById('ad-channel').value;

  if (!title || title.length < 3){ alert('Judul minimal 3 karakter'); return; }
  if (!detail || detail.length < 20){ alert('Detail minimal 20 karakter'); return; }

  var aduanId = uid();
  var aduan = {
    id: aduanId,
    classId: cid,
    fromId: uSid(),
    fromName: u().name,
    fromRole: uRole(),
    category: cat,
    title: title,
    detail: detail,
    status: 'pending',
    feedback: '',
    createdAt: Date.now()
  };

  // Simpan ke Firestore
  window.fbSet('aduan', aduanId, aduan);

  // Notif ke guru
  if (channel === 'app' || channel === 'both'){
    window.fbSet('notifications', uid(), {
      id: uid(), classId: cid,
      fromId: uSid(), fromName: u().name, fromType: 'siswa', fromRole: uRole(),
      toId: 'guru', type: 'urgent',
      title: '[ADUAN] ' + title,
      message: 'Kategori: ' + cat + '\n\n' + detail,
      aduanId: aduanId,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
  }

  logAct('aduan_create', u().name + ' kirim aduan: ' + title, {classId:cid});

  closeModal();

  // Buka WA
  if (channel === 'wa' || channel === 'both'){
    var guruPhone = '';
    if (c.teacherEmail){
      var t = (window.DB.teachers||[]).find(function(x){ return x.email && x.email.toLowerCase() === c.teacherEmail.toLowerCase(); });
      if (t) guruPhone = t.phone || '';
    }
    if (guruPhone){
      var msg = '*ADUAN SISWA*\n\n' +
        'Dari: *' + u().name + '*\n' +
        'Kelas: ' + c.name + '\n' +
        'Peran: ' + roleLabel(uRole()) + '\n\n' +
        'Kategori: *' + cat + '*\n' +
        'Judul: ' + title + '\n\n' +
        'Detail:\n' + detail + '\n\n' +
        '—\nDikirim: ' + new Date().toLocaleString('id-ID');
      var link = buildWALink(guruPhone, msg);
      window.open(link, '_blank');
      // Log
      window.fbSet('wa_logs', uid(), {
        id: uid(), classId: cid,
        fromId: uSid(), fromName: u().name,
        toId: 'guru', toName: 'Guru Pengampu', toPhone: guruPhone,
        type: 'aduan', title: '[ADUAN] ' + title, message: detail,
        channel: 'wa', createdAt: Date.now()
      });
    }
    alert('Aduan terkirim!');
  } else {
    alert('Aduan terkirim!');
  }
  setTimeout(window.openAduanSiswa, 400);
};

/* ============================================================
   4. GURU LIHAT ADUAN
   ============================================================ */
window.openAduanGuru = function(cid){
  cid = cid || uCid();
  var allAduan = Object.values(window.DB.aduan || {});
  var filtered = allAduan.filter(function(a){
    if (cid) return a.classId === cid;
    var myIds = (window.myClasses ? window.myClasses() : []).map(function(c){ return c.id; });
    return myIds.length === 0 || myIds.indexOf(a.classId) >= 0;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '';
  h += '<div class="alert alert-info">' + ic('info') + '<div><b>Aduan Siswa</b> &mdash; ' + filtered.length + ' aduan</div></div>';

  if (filtered.length === 0){
    h += '<div class="empty-state">' + ic('messageCircle',40) + '<p>Belum ada aduan</p></div>';
    openModal('Aduan Siswa', h);
    return;
  }

  filtered.forEach(function(a){
    var c = findClass(a.classId);
    var statusColor = a.status === 'resolved' ? 'var(--success)' : a.status === 'read' ? 'var(--info)' : 'var(--warning)';
    h += '<div class="card" style="margin-bottom:10px;border-left:3px solid ' + statusColor + ';">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
        '<div style="font-weight:700;font-size:13.5px;">' + esc(a.title) + '</div>' +
        '<span class="badge badge-' + (a.status === 'resolved' ? 'success' : a.status === 'read' ? 'info' : 'warning') + '">' +
          (a.status === 'resolved' ? 'Selesai' : a.status === 'read' ? 'Dibaca' : 'Menunggu') +
        '</span>' +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">' +
        esc(a.fromName) + ' (' + esc(roleLabel(a.fromRole)) + ') &middot; ' +
        (c ? esc(c.name) : '') + ' &middot; ' + fmtDate(a.createdAt) +
      '</div>' +
      '<div style="font-size:11.5px;margin-bottom:6px;">Kategori: <b>' + esc(a.category) + '</b></div>' +
      '<div style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;padding:10px;background:var(--surface);border-radius:6px;">' + esc(a.detail) + '</div>' +
      (a.feedback ? '<div style="margin-top:8px;padding:10px;background:var(--success-soft);border-radius:6px;font-size:12.5px;"><b>Balasan Anda:</b><br>' + esc(a.feedback) + '</div>' : '') +
      '<div class="action-row" style="margin-top:10px;">' +
        (a.status !== 'read' && a.status !== 'resolved' ? '<button class="btn btn-sm btn-info" onclick="markAduanRead(\'' + a.id + '\')">' + ic('check','sm') + ' Tandai Dibaca</button>' : '') +
        '<button class="btn btn-sm btn-primary" onclick="openBalasAduan(\'' + a.id + '\')">' + ic('messageCircle','sm') + ' Balas</button>' +
        (a.status !== 'resolved' ? '<button class="btn btn-sm btn-success" onclick="markAduanResolved(\'' + a.id + '\')">' + ic('check','sm') + ' Selesai</button>' : '') +
        '<button class="btn btn-sm btn-danger" onclick="hapusAduan(\'' + a.id + '\')">' + ic('trash','sm') + '</button>' +
      '</div>' +
    '</div>';
  });

  openModal('Aduan Siswa', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.markAduanRead = function(aduanId){
  var a = (window.DB.aduan || {})[aduanId];
  if (!a) return;
  window.fbSet('aduan', aduanId, Object.assign({}, a, {status: 'read', readAt: Date.now()})).then(function(){
    closeModal();
    setTimeout(function(){ window.openAduanGuru(a.classId); }, 200);
  });
};

window.markAduanResolved = function(aduanId){
  var a = (window.DB.aduan || {})[aduanId];
  if (!a) return;
  window.fbSet('aduan', aduanId, Object.assign({}, a, {status: 'resolved', resolvedAt: Date.now()})).then(function(){
    closeModal();
    setTimeout(function(){ window.openAduanGuru(a.classId); }, 200);
  });
};

window.hapusAduan = function(aduanId){
  if (!confirm('Hapus aduan ini?')) return;
  var a = (window.DB.aduan || {})[aduanId];
  if (!a) return;
  window.fbDel('aduan', aduanId).then(function(){
    closeModal();
    setTimeout(function(){ window.openAduanGuru(a.classId); }, 200);
  });
};

window.openBalasAduan = function(aduanId){
  var a = (window.DB.aduan || {})[aduanId];
  if (!a) return;
  var c = findClass(a.classId);
  var h = '';
  h += '<div class="alert alert-info">' + ic('info') + '<div><b>Aduan:</b> ' + esc(a.title) + '</div></div>';
  h += '<div class="form-group"><label>Balasan / Tindak Lanjut</label>' +
    '<textarea id="ad-feedback" rows="5" maxlength="800" placeholder="Jelaskan tindakan yang akan diambil atau sudah dilakukan..."></textarea></div>';
  h += '<div class="form-group"><label>Kirim via</label><select id="ad-reply-channel">' +
    '<option value="both">Notifikasi + WhatsApp</option>' +
    '<option value="app">Hanya Notifikasi</option>' +
    '<option value="wa">Hanya WhatsApp</option>' +
    '</select></div>';
  h += '<button class="btn btn-primary btn-block" onclick="submitBalasAduan(\'' + aduanId + '\')">' + ic('send') + ' Kirim Balasan</button>';
  openModal('Balas Aduan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.submitBalasAduan = function(aduanId){
  var a = (window.DB.aduan || {})[aduanId];
  if (!a) return;
  var feedback = (document.getElementById('ad-feedback').value || '').trim();
  var channel = document.getElementById('ad-reply-channel').value;
  if (!feedback || feedback.length < 5){ alert('Balasan minimal 5 karakter'); return; }

  // Update aduan
  window.fbSet('aduan', aduanId, Object.assign({}, a, {
    status: 'resolved',
    feedback: feedback,
    resolvedAt: Date.now(),
    resolvedBy: u().name
  }));

  // Notif ke siswa
  if (channel === 'app' || channel === 'both'){
    window.fbSet('notifications', uid(), {
      id: uid(), classId: a.classId,
      fromId: uSid() || u().email || 'guru',
      fromName: u().name, fromType: 'guru',
      toId: a.fromId, type: 'info',
      title: '[BALASAN ADUAN] ' + a.title,
      message: feedback,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
  }

  logAct('aduan_reply', u().name + ' balas aduan: ' + a.title, {classId: a.classId});

  closeModal();

  // WA
  if (channel === 'wa' || channel === 'both'){
    var c = findClass(a.classId);
    if (c){
      var student = (c.students || []).find(function(s){ return s.id === a.fromId; });
      if (student && student.phone && normalizePhone(student.phone)){
        var msg = window.WA_TEMPLATES.aduan_response.build({
          name: student.name,
          message: feedback,
          sender: u().name,
          aduanTitle: a.title
        });
        var link = buildWALink(student.phone, msg);
        window.open(link, '_blank');
        // Log
        window.fbSet('wa_logs', uid(), {
          id: uid(), classId: a.classId,
          fromId: uSid() || u().email, fromName: u().name,
          toId: student.id, toName: student.name, toPhone: student.phone,
          type: 'aduan_response', title: a.title, message: feedback,
          channel: 'wa', createdAt: Date.now()
        });
      }
    }
  }

  alert('Balasan terkirim!');
  setTimeout(function(){ window.openAduanGuru(a.classId); }, 300);
};

/* ============================================================
   5. FLOATING ADUAN (untuk siswa)
   ============================================================ */
function injectFloatingAduan(){
  if (!isSiswa()) return;
  if (document.getElementById('btn-floating-aduan')) return;
  var btn = document.createElement('button');
  btn.id = 'btn-floating-aduan';
  btn.type = 'button';
  btn.className = 'floating-panduan';
  btn.style.cssText = 'bottom:100px;background:linear-gradient(135deg,#dc2626,#991b1b);box-shadow:0 6px 20px rgba(220,38,38,.4);';
  btn.title = 'Buat Aduan';
  btn.onclick = function(){ window.openAduanSiswa(); };
  btn.innerHTML = window.ico('warning', 22) + '<span class="floating-panduan-label">Aduan</span>';
  document.body.appendChild(btn);
}

function injectFloatingNaskah(){
  if (!isSiswa()) return;
  if (document.getElementById('btn-floating-naskah')) return;
  var btn = document.createElement('button');
  btn.id = 'btn-floating-naskah';
  btn.type = 'button';
  btn.className = 'floating-panduan';
  btn.style.cssText = 'bottom:180px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);box-shadow:0 6px 20px rgba(139,92,246,.4);';
  btn.title = 'Arsip Naskah';
  btn.onclick = function(){ window.openNaskahList(); };
  btn.innerHTML = window.ico('book', 22) + '<span class="floating-panduan-label">Naskah</span>';
  document.body.appendChild(btn);
}

/* ============================================================
   6. KOORDINASI ANTAR KELAS
   ============================================================ */
var KOORD_ROLES = ['pimpinan_produksi','sekretaris','sutradara','asisten_sutradara','koor_musik','koor_perlengkapan'];

window.openKoordinasi = function(){
  var role = uRole();
  var canAccess = isGuru() || KOORD_ROLES.indexOf(role) >= 0;
  if (!canAccess){
    alert('Fitur ini hanya untuk:\n\u2022 Pimpinan Produksi\n\u2022 Sekretaris\n\u2022 Sutradara\n\u2022 Asisten Sutradara\n\u2022 Koor Musik\n\u2022 Koor Perlengkapan\n\u2022 Guru/Admin');
    return;
  }

  var cid = uCid();
  var otherClasses = (window.DB.classes || []).filter(function(c){ return c.id !== cid; });
  var msgs = Object.values(window.DB.coordination || {}).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0, 30);

  var h = '';
  h += '<div class="alert alert-info">' + ic('messageCircle') + '<div><b>Koordinasi Antar Kelas</b><br><small>Kirim pesan ke kelas lain (dengan target peran spesifik)</small></div></div>';

  // Filter
  h += '<div class="form-group"><label>Filter</label>' +
    '<select id="koord-filter" onchange="filterKoord()">' +
    '<option value="all">Semua</option>' +
    '<option value="inbox">Untuk Kelas Saya</option>' +
    '<option value="sent">Dari Kelas Saya</option>' +
    '</select></div>';

  // List pesan
  h += '<div id="koord-list" style="max-height:320px;overflow-y:auto;padding:8px;background:var(--surface);border-radius:8px;margin-bottom:14px;">';
  if (msgs.length === 0){
    h += '<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:12.5px;">Belum ada pesan</div>';
  } else {
    h += renderKoordList(msgs, cid, 'all');
  }
  h += '</div>';

  // Form kirim
  h += '<div style="border-top:1px solid var(--border);padding-top:14px;">';
  h += '<h4 style="font-size:13px;font-weight:700;margin-bottom:10px;">Kirim Pesan Baru</h4>';
  h += '<div class="form-group"><label>Ke Kelas</label>' +
    '<select id="koord-target">' +
    '<option value="">Semua Kelas</option>' +
    otherClasses.map(function(c){ return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') +
    '</select></div>';
  h += '<div class="form-group"><label>Untuk Peran (opsional)</label>' +
    '<select id="koord-role">' +
    '<option value="">Semua Peran</option>' +
    Object.keys(window.ROLES).map(function(r){ return '<option value="' + r + '">' + esc(roleLabel(r)) + '</option>'; }).join('') +
    '</select></div>';
  h += '<div class="form-group"><label>Pesan</label><textarea id="koord-msg" rows="3" maxlength="500"></textarea></div>';
  h += '<button class="btn btn-primary btn-block" onclick="kirimKoord()">' + ic('send') + ' Kirim</button>';
  h += '</div>';

  openModal('Koordinasi Antar Kelas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

function renderKoordList(msgs, cid, filter){
  var list = msgs.filter(function(m){
    if (filter === 'inbox') return !m.toClassId || m.toClassId === cid;
    if (filter === 'sent') return m.fromClassId === cid;
    return true;
  });
  if (list.length === 0) return '<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:12.5px;">Tidak ada pesan</div>';
  var h = '';
  list.forEach(function(m){
    var isMine = m.fromClassId === cid;
    h += '<div style="padding:10px;margin-bottom:6px;background:' + (isMine ? 'var(--primary-soft)' : 'var(--card)') + ';border-radius:8px;border-left:3px solid ' + (isMine ? 'var(--primary)' : 'var(--border-strong)') + ';">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px;flex-wrap:wrap;">' +
        '<div style="font-size:12px;font-weight:700;">' + esc(m.fromClassName || '-') + ' &mdash; ' + esc(m.fromName) + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + fmtDate(m.createdAt) + '</div>' +
      '</div>' +
      '<div style="font-size:11px;margin-bottom:6px;">' + ic('send','sm') + ' Ke: <b>' + esc(m.toClassName || 'Semua Kelas') + '</b>' +
      (m.toRole ? ' &middot; <b>' + esc(roleLabel(m.toRole)) + '</b>' : '') +
      '</div>' +
      '<div style="font-size:12.5px;line-height:1.5;white-space:pre-wrap;">' + esc(m.message) + '</div>' +
    '</div>';
  });
  return h;
}

window.filterKoord = function(){
  var cid = uCid();
  var filter = document.getElementById('koord-filter').value;
  var msgs = Object.values(window.DB.coordination || {}).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0, 30);
  document.getElementById('koord-list').innerHTML = renderKoordList(msgs, cid, filter);
};

window.kirimKoord = function(){
  var cid = uCid();
  var msg = (document.getElementById('koord-msg').value || '').trim();
  var toCid = document.getElementById('koord-target').value;
  var toRole = document.getElementById('koord-role').value;
  if (!msg){ alert('Pesan kosong'); return; }
  if (msg.length < 3){ alert('Pesan minimal 3 karakter'); return; }

  var c = findClass(cid);
  var toC = toCid ? findClass(toCid) : null;

  var id = uid();
  var data = {
    id: id,
    message: msg,
    fromClassId: cid,
    fromClassName: c ? c.name : '-',
    fromName: u().name,
    fromRole: uRole(),
    fromId: uSid() || u().email,
    toClassId: toCid || null,
    toClassName: toC ? toC.name : 'Semua Kelas',
    toRole: toRole || null,
    createdAt: Date.now()
  };

  window.fbSet('coordination', id, data).then(function(){
    // Notif ke kelas tujuan
    if (toCid){
      window.fbSet('notifications', uid(), {
        id: uid(), classId: toCid,
        fromId: uSid() || u().email,
        fromName: u().name + ' (' + (c ? c.name : '') + ')',
        fromType: uType(), fromRole: uRole(),
        toId: 'all', type: 'info',
        title: '[KOORDINASI] dari ' + (c ? c.name : 'Kelas'),
        message: (toRole ? 'Untuk ' + roleLabel(toRole) + ':\n\n' : '') + msg,
        createdAt: Date.now(), readBy: [], doneBy: []
      });
    }
    logAct('koordinasi_send', u().name + ' kirim koordinasi: ' + msg.substring(0, 50), {classId: cid});
    closeModal();
    alert('Pesan terkirim!');
    setTimeout(window.openKoordinasi, 200);
  });
};

/* ============================================================
   7. DASHBOARD PESAN PERAN PENTING
   ============================================================ */
window.openDashboardPesan = function(){
  var role = uRole();
  var cid = uCid();
  var c = findClass(cid);
  if (!c) return;
  var students = c.students || [];

  var h = '';
  h += '<div class="alert alert-info">' + ic('messageCircle') + '<div><b>Dashboard Pesan</b><br><small>Kirim pesan cepat ke berbagai target</small></div></div>';

  h += '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">';

  // Kirim ke semua siswa
  h += '<div class="card" style="cursor:pointer;margin:0;" onclick="openPesanCepat(\'all\')">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;">' + ic('users',18) + '</div>' +
      '<div><div style="font-weight:700;font-size:13px;">Semua Siswa</div><div style="font-size:11px;color:var(--text-muted);">' + students.length + ' siswa</div></div>' +
    '</div>' +
  '</div>';

  // Kirim ke divisi produksi
  var produksiCount = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'produksi'; }).length;
  h += '<div class="card" style="cursor:pointer;margin:0;" onclick="openPesanCepat(\'produksi\')">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--info-soft);color:var(--info);display:flex;align-items:center;justify-content:center;">' + ic('briefcase',18) + '</div>' +
      '<div><div style="font-weight:700;font-size:13px;">Tim Produksi</div><div style="font-size:11px;color:var(--text-muted);">' + produksiCount + ' siswa</div></div>' +
    '</div>' +
  '</div>';

  // Kirim ke divisi artistik
  var artistikCount = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'artistik'; }).length;
  h += '<div class="card" style="cursor:pointer;margin:0;" onclick="openPesanCepat(\'artistik\')">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--warning-soft);color:var(--warning);display:flex;align-items:center;justify-content:center;">' + ic('layers',18) + '</div>' +
      '<div><div style="font-weight:700;font-size:13px;">Tim Artistik</div><div style="font-size:11px;color:var(--text-muted);">' + artistikCount + ' siswa</div></div>' +
    '</div>' +
  '</div>';

  // Kirim ke pemain
  var pemainCount = students.filter(function(s){ return s.role === 'pemain'; }).length;
  h += '<div class="card" style="cursor:pointer;margin:0;" onclick="openPesanCepat(\'pemain\')">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--success-soft);color:var(--success);display:flex;align-items:center;justify-content:center;">' + ic('user',18) + '</div>' +
      '<div><div style="font-weight:700;font-size:13px;">Pemain</div><div style="font-size:11px;color:var(--text-muted);">' + pemainCount + ' siswa</div></div>' +
    '</div>' +
  '</div>';

  // Kirim ke koor-koor
  var koorCount = students.filter(function(s){ return s.role.indexOf('koor_') === 0; }).length;
  h += '<div class="card" style="cursor:pointer;margin:0;" onclick="openPesanCepat(\'koor\')">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;">' + ic('star',18) + '</div>' +
      '<div><div style="font-weight:700;font-size:13px;">Koordinator</div><div style="font-size:11px;color:var(--text-muted);">' + koorCount + ' siswa</div></div>' +
    '</div>' +
  '</div>';

  h += '</div>';

  openModal('Dashboard Pesan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openPesanCepat = function(filter){
  var cid = uCid();
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];

  if (filter === 'produksi') students = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'produksi'; });
  else if (filter === 'artistik') students = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'artistik'; });
  else if (filter === 'pemain') students = students.filter(function(s){ return s.role === 'pemain'; });
  else if (filter === 'koor') students = students.filter(function(s){ return s.role.indexOf('koor_') === 0; });

  var h = '';
  h += '<div class="alert alert-info">' + ic('send') + '<div><b>Pesan Cepat</b> &mdash; ' + students.length + ' penerima</div></div>';
  h += '<div class="form-group"><label>Jenis Pesan</label><select id="pc-type">' +
    '<option value="info">Informasi</option>' +
    '<option value="instruksi">Instruksi</option>' +
    '<option value="peringatan">Peringatan</option>' +
    '</select></div>';
  h += '<div class="form-group"><label>Judul</label><input id="pc-title" maxlength="80"></div>';
  h += '<div class="form-group"><label>Pesan</label><textarea id="pc-msg" rows="4" maxlength="500"></textarea></div>';
  h += '<div class="form-group"><label>Channel</label><select id="pc-channel">' +
    '<option value="both">Notif + WA</option>' +
    '<option value="app">Hanya Notif</option>' +
    '<option value="wa">Hanya WA</option>' +
    '</select></div>';
  h += '<button class="btn btn-primary btn-block" onclick="kirimPesanCepat(\'' + filter + '\')">' + ic('send') + ' Kirim</button>';
  openModal('Pesan Cepat', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.kirimPesanCepat = function(filter){
  var cid = uCid();
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];
  if (filter === 'produksi') students = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'produksi'; });
  else if (filter === 'artistik') students = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'artistik'; });
  else if (filter === 'pemain') students = students.filter(function(s){ return s.role === 'pemain'; });
  else if (filter === 'koor') students = students.filter(function(s){ return s.role.indexOf('koor_') === 0; });

  var type = document.getElementById('pc-type').value;
  var title = (document.getElementById('pc-title').value || '').trim();
  var msg = (document.getElementById('pc-msg').value || '').trim();
  var channel = document.getElementById('pc-channel').value;
  if (!title || !msg){ alert('Lengkapi'); return; }

  // Notif
  if (channel === 'app' || channel === 'both'){
    students.forEach(function(s){
      window.fbSet('notifications', uid(), {
        id: uid(), classId: cid,
        fromId: uSid() || u().email || 'guru',
        fromName: u().name, fromType: uType(), fromRole: uRole(),
        toId: s.id, type: type,
        title: title, message: msg,
        createdAt: Date.now(), readBy: [], doneBy: []
      });
    });
  }

  logAct('pesan_cepat', u().name + ' kirim pesan ke ' + students.length + ' siswa', {classId:cid});

  closeModal();

  // WA
  if (channel === 'wa' || channel === 'both'){
    var withWA = students.filter(function(s){ return s.phone && normalizePhone(s.phone); });
    if (withWA.length > 0){
      openWAPanel({
        targets: withWA.map(function(s){
          return {id: s.id, name: s.name, role: s.role, phone: s.phone};
        }),
        title: title,
        message: msg,
        cid: cid,
        type: type
      });
    } else {
      alert('Tidak ada penerima dengan No. WA valid.');
    }
  } else {
    alert('Pesan terkirim ke ' + students.length + ' siswa!');
  }
};

/* ============================================================
   8. LOG WA LENGKAP
   ============================================================ */
window.openLogWA = function(){
  var logs = Object.values(window.DB.waLogs || {});
  // Filter berdasarkan kelas (guru: kelas yang diajar; siswa: kelas sendiri)
  if (isGuru()){
    var myIds = (window.myClasses ? window.myClasses() : []).map(function(c){ return c.id; });
    if (myIds.length > 0){
      logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
    }
  } else if (isSiswa()){
    logs = logs.filter(function(l){ return l.classId === uCid() || l.fromId === uSid() || l.toId === uSid(); });
  }
  logs.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '';
  h += '<div class="alert alert-info">' + ic('messageCircle') + '<div><b>Log Komunikasi WhatsApp</b><br><small>' + logs.length + ' entri</small></div></div>';

  h += '<div class="form-group"><label>Filter Kelas</label>';
  if (isGuru()){
    h += '<select id="wa-filter-class" onchange="renderLogWAList()">';
    h += '<option value="">Semua Kelas</option>';
    (window.myClasses ? window.myClasses() : []).forEach(function(c){
      h += '<option value="' + c.id + '">' + esc(c.name) + '</option>';
    });
    h += '</select>';
  } else {
    h += '<div style="font-size:12.5px;color:var(--text-muted);">Kelas: ' + esc((findClass(uCid()) || {}).name || '-') + '</div>';
  }
  h += '</div>';

  h += '<div class="form-group"><label>Cari</label>' +
    '<input type="text" class="search-box" id="wa-search" placeholder="Cari nama / judul / pesan..." oninput="renderLogWAList()" style="margin-bottom:0;"></div>';

  h += '<div class="action-row" style="margin-bottom:12px;">' +
    '<button class="btn btn-sm" onclick="exportLogWA()">' + ic('download','sm') + ' Export Excel</button>' +
  '</div>';

  h += '<div id="wa-log-list" style="max-height:400px;overflow-y:auto;"></div>';

  openModal('Log Komunikasi WA', h);
  setTimeout(renderLogWAList, 100);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.renderLogWAList = function(){
  var el = document.getElementById('wa-log-list');
  if (!el) return;
  var logs = Object.values(window.DB.waLogs || {});
  var filterCid = '';
  var searchQ = '';
  var fC = document.getElementById('wa-filter-class');
  if (fC) filterCid = fC.value;
  var sQ = document.getElementById('wa-search');
  if (sQ) searchQ = (sQ.value || '').toLowerCase();

  if (isGuru()){
    var myIds = (window.myClasses ? window.myClasses() : []).map(function(c){ return c.id; });
    if (myIds.length > 0){
      logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
    }
  }
  if (filterCid) logs = logs.filter(function(l){ return l.classId === filterCid; });
  if (searchQ){
    logs = logs.filter(function(l){
      var hay = ((l.toName||'') + ' ' + (l.fromName||'') + ' ' + (l.title||'') + ' ' + (l.message||'')).toLowerCase();
      return hay.indexOf(searchQ) >= 0;
    });
  }
  logs.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  if (logs.length === 0){
    el.innerHTML = '<div class="empty-state">' + ic('messageCircle',40) + '<p>Tidak ada log</p></div>';
    return;
  }

  var h = '';
  logs.slice(0, 100).forEach(function(l){
    var typeLabel = {tugas:'Tugas', kas:'Kas', peringatan:'Peringatan', info:'Info', aduan:'Aduan', aduan_response:'Balasan Aduan', broadcast:'Broadcast'}[l.type] || l.type;
    var typeColor = {tugas:'badge-info', kas:'badge-warning', peringatan:'badge-danger', info:'badge-success', aduan:'badge-danger', aduan_response:'badge-primary', broadcast:'badge-primary'}[l.type] || 'badge-gray';
    h += '<div style="padding:12px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--primary);">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
        '<span class="badge ' + typeColor + '">' + esc(typeLabel) + '</span>' +
        '<span style="font-size:11px;color:var(--text-muted);">' + fmtDate(l.createdAt) + '</span>' +
      '</div>' +
      '<div style="font-weight:700;font-size:13px;margin-bottom:4px;">' + esc(l.title || '-') + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">' +
        'Dari: <b>' + esc(l.fromName || '-') + '</b> → Ke: <b>' + esc(l.toName || '-') + '</b>' +
        (l.toPhone ? ' (' + esc(l.toPhone) + ')' : '') +
      '</div>' +
      '<div style="font-size:12.5px;line-height:1.5;padding:8px;background:var(--card);border-radius:6px;white-space:pre-wrap;">' + esc(l.message || '') + '</div>' +
    '</div>';
  });
  el.innerHTML = h;
};

window.exportLogWA = function(){
  var logs = Object.values(window.DB.waLogs || {});
  if (isGuru()){
    var myIds = (window.myClasses ? window.myClasses() : []).map(function(c){ return c.id; });
    if (myIds.length > 0) logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
  }
  if (logs.length === 0){ alert('Tidak ada log'); return; }
  if (!window.XLSX){ alert('Library Excel belum siap'); return; }

  var rows = [['Waktu','Dari','Ke','No WA','Tipe','Judul','Pesan']];
  logs.forEach(function(l){
    rows.push([
      new Date(l.createdAt).toLocaleString('id-ID'),
      l.fromName || '-',
      l.toName || '-',
      l.toPhone || '-',
      l.type || '-',
      l.title || '-',
      l.message || '-'
    ]);
  });
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:20},{wch:20},{wch:20},{wch:15},{wch:12},{wch:30},{wch:50}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Log WA');
  XLSX.writeFile(wb, 'Log_WA_' + new Date().toISOString().split('T')[0] + '.xlsx');
};

/* ============================================================
   9. BROADCAST LANJUTAN
   ============================================================ */
window.openBroadcastLanjutan = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];

  var h = '';
  h += '<div class="alert alert-info">' + ic('megaphone') + '<div><b>Broadcast Pesan</b></div></div>';
  h += '<div class="form-group"><label>Jenis</label><select id="bc-type">' +
    '<option value="info">Info</option>' +
    '<option value="instruksi">Instruksi</option>' +
    '<option value="tugas">Tugas</option>' +
    '<option value="urgent">Penting</option>' +
    '</select></div>';
  h += '<div class="form-group"><label>Judul</label><input id="bc-title" maxlength="100"></div>';
  h += '<div class="form-group"><label>Pesan</label><textarea id="bc-msg" rows="4" maxlength="1000"></textarea></div>';
  h += '<div class="form-group"><label>Filter Cepat</label>' +
    '<div class="action-row">' +
    '<button type="button" class="btn btn-sm" onclick="bcSelAll(true)">Semua</button>' +
    '<button type="button" class="btn btn-sm" onclick="bcSelAll(false)">Kosongkan</button>' +
    '<button type="button" class="btn btn-sm" onclick="bcSelTeam(\'produksi\')">Produksi</button>' +
    '<button type="button" class="btn btn-sm" onclick="bcSelTeam(\'artistik\')">Artistik</button>' +
    '</div></div>';
  h += '<div class="form-group"><label>Penerima</label>' +
    '<div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  students.forEach(function(s){
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="bc-cb" value="' + s.id + '" data-name="' + esc(s.name) + '" data-role="' + esc(s.role) + '" data-phone="' + esc(s.phone || '') + '" checked>' +
      '<span style="flex:1;font-weight:600;">' + esc(s.name) + '</span>' +
      '<span style="font-size:10.5px;color:var(--text-muted);">' + esc(roleLabel(s.role)) + '</span>' +
    '</label>';
  });
  h += '</div></div>';
  h += '<div class="form-group"><label>Channel</label><select id="bc-channel">' +
    '<option value="both">Notif + WA</option>' +
    '<option value="app">Hanya Notif</option>' +
    '<option value="wa">Hanya WA</option>' +
    '</select></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" onclick="doBroadcastLanjutan(\'' + cid + '\')">' + ic('send') + ' Broadcast</button>';

  openModal('Broadcast', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.bcSelAll = function(c){ document.querySelectorAll('.bc-cb').forEach(function(cb){ cb.checked = c; }); };
window.bcSelTeam = function(team){
  document.querySelectorAll('.bc-cb').forEach(function(cb){
    var r = cb.getAttribute('data-role');
    var t = (window.ROLES[r] || {}).team;
    cb.checked = t === team;
  });
};

window.doBroadcastLanjutan = function(cid){
  var type = document.getElementById('bc-type').value;
  var title = (document.getElementById('bc-title').value || '').trim();
  var msg = (document.getElementById('bc-msg').value || '').trim();
  var channel = document.getElementById('bc-channel').value;
  if (!title || !msg){ alert('Lengkapi judul & pesan'); return; }

  var targets = [];
  document.querySelectorAll('.bc-cb:checked').forEach(function(cb){
    targets.push({
      id: cb.value, name: cb.getAttribute('data-name'),
      role: cb.getAttribute('data-role'), phone: cb.getAttribute('data-phone')
    });
  });
  if (targets.length === 0){ alert('Pilih minimal 1 penerima'); return; }

  if (channel === 'app' || channel === 'both'){
    targets.forEach(function(t){
      window.fbSet('notifications', uid(), {
        id: uid(), classId: cid,
        fromId: uSid() || u().email || 'guru',
        fromName: u().name, fromType: uType(), fromRole: uRole(),
        toId: t.id, type: type,
        title: title, message: msg,
        createdAt: Date.now(), readBy: [], doneBy: []
      });
    });
  }

  logAct('broadcast', u().name + ' broadcast "' + title + '" ke ' + targets.length + ' siswa', {classId:cid});

  closeModal();

  if (channel === 'wa' || channel === 'both'){
    var withWA = targets.filter(function(t){ return t.phone && normalizePhone(t.phone); });
    if (withWA.length > 0){
      openWAPanel({
        targets: withWA,
        title: title,
        message: msg,
        cid: cid,
        type: type
      });
    } else {
      alert('Tidak ada penerima dengan No. WA valid.');
    }
  } else {
    alert('Broadcast terkirim ke ' + targets.length + ' siswa!');
  }
};

/* ============================================================
   10. AUTO-INJECT FLOATING BUTTONS
   ============================================================ */
function injectAllFloating(){
  if (!isSiswa()) return;
  injectFloatingAduan();
  injectFloatingNaskah();
}

setTimeout(injectAllFloating, 1500);
setTimeout(injectAllFloating, 3000);

// Hook renderSiswaDash
(function(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(injectAllFloating, 500);
    setTimeout(injectAllFloating, 1500);
    return ret;
  };
})();

// Hook logout: hapus floating buttons
(function(){
  var orig = window.logout;
  if (typeof orig !== 'function') return;
  window.logout = function(){
    ['btn-floating-aduan','btn-floating-naskah'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    return orig.apply(this, arguments);
  };
})();

console.log('[features-comms] M5 loaded');

})();
