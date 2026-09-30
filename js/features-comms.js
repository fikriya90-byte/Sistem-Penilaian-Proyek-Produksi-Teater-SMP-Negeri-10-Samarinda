/* ============================================================
   features-comms.js — v2.0 FINAL
   FIX: Aduan Siswa
   ============================================================ */
(function(){
'use strict';

function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function fmtDate(ts){ return window.fmtDate ? window.fmtDate(ts) : '-'; }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t, b){ if (window.openModal) window.openModal(t, b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id === cid; }); }
function logAct(t, m, k){ if (window.logActivity) window.logActivity(t, m, k); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }
function normalizePhone(p){
  p = String(p||'').replace(/\D/g,'');
  if (!p) return '';
  if (p.charAt(0) === '0') p = '62' + p.substring(1);
  if (p.substring(0,2) !== '62') p = '62' + p;
  return p;
}
window.normalizePhone = normalizePhone;

/* ============================================================
   ADUAN SISWA — FIX
   ============================================================ */
window.openAduanSiswa = function(){
  if (!isSiswa()){ alert('Hanya untuk siswa'); return; }
  var cid = uCid();
  if (!cid) return;
  var c = findClass(cid);
  if (!c) return;
  var aduanList = (window.DB.aduan || {});
  var myAduan = Object.values(aduanList).filter(function(a){
    return a.classId === cid && a.fromId === uSid();
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var guruPhone = '';
  if (c.teacherEmail){
    var t = (window.DB.teachers||[]).find(function(x){ return x.email && x.email.toLowerCase() === c.teacherEmail.toLowerCase(); });
    if (t) guruPhone = t.phone || '';
  }

  var h = '<div class="alert alert-warning">' + ic('warning') + '<div><b>PENTING:</b> Aduan hanya untuk masalah signifikan. Gunakan dengan bijak.</div></div>';
  if (!guruPhone){
    h += '<div class="alert alert-danger">' + ic('warning') + '<div>Guru belum mengisi No. WA. Hubungi guru secara langsung.</div></div>';
  }
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" ' + (guruPhone ? 'onclick="openBuatAduan()"' : 'disabled') + '>' + ic('plus','sm') + ' Buat Aduan Baru</button>';
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
        (a.feedback ? '<div style="margin-top:8px;padding:10px;background:var(--success-soft);border-radius:6px;font-size:12.5px;"><b>Balasan Guru:</b><br>' + esc(a.feedback) + '</div>' : '') +
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
  var h = '<div class="alert alert-info">' + ic('info') + '<div>Aduan akan dikirim ke guru: <b>' + esc(guruName) + '</b></div></div>';
  h += '<div class="form-group"><label>Kategori</label><select id="ad-cat">' +
    '<option value="Perundungan">Perundungan</option>' +
    '<option value="Kekerasan fisik">Kekerasan fisik</option>' +
    '<option value="Kerusakan alat">Kerusakan alat</option>' +
    '<option value="Kendala besar">Kendala besar</option>' +
    '<option value="Kesalahan koordinasi">Kesalahan koordinasi</option>' +
    '<option value="Lainnya">Lainnya</option>' +
    '</select></div>';
  h += '<div class="form-group"><label>Judul Singkat</label><input id="ad-title" maxlength="100"></div>';
  h += '<div class="form-group"><label>Detail Kronologi</label><textarea id="ad-detail" rows="6" maxlength="1000" placeholder="Jelaskan apa yang terjadi, kapan, di mana, siapa yang terlibat..."></textarea><small class="hint">Minimal 20 karakter.</small></div>';
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
    id: aduanId, classId: cid,
    fromId: uSid(), fromName: u().name, fromRole: uRole(),
    category: cat, title: title, detail: detail,
    status: 'pending', feedback: '', createdAt: Date.now()
  };
  window.fbSet('aduan', aduanId, aduan);
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
  logAct('aduan_create', u().name + ' kirim aduan: ' + title, {classId: cid});
  closeModal();

  if (channel === 'wa' || channel === 'both'){
    var guruPhone = '';
    if (c.teacherEmail){
      var t = (window.DB.teachers||[]).find(function(x){ return x.email && x.email.toLowerCase() === c.teacherEmail.toLowerCase(); });
      if (t) guruPhone = t.phone || '';
    }
    if (guruPhone){
      var msg = '*ADUAN SISWA*\n\nDari: *' + u().name + '*\nKelas: ' + c.name + '\nPeran: ' + roleLabel(uRole()) + '\n\nKategori: *' + cat + '*\nJudul: ' + title + '\n\nDetail:\n' + detail + '\n\n—\nDikirim: ' + new Date().toLocaleString('id-ID');
      var link = 'https://wa.me/' + normalizePhone(guruPhone) + '?text=' + encodeURIComponent(msg);
      window.open(link, '_blank');
    }
    alert('Aduan terkirim!');
  } else {
    alert('Aduan terkirim!');
  }
  setTimeout(window.openAduanSiswa, 400);
};

/* ============================================================
   GURU LIHAT ADUAN
   ============================================================ */
window.openAduanGuru = function(cid){
  cid = cid || uCid();
  var allAduan = Object.values(window.DB.aduan || {});
  var myIds = (window.myClasses ? window.myClasses() : []).map(function(c){ return c.id; });
  var filtered = allAduan.filter(function(a){
    if (cid) return a.classId === cid;
    return myIds.length === 0 || myIds.indexOf(a.classId) >= 0;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>Aduan Siswa</b> &mdash; ' + filtered.length + ' aduan</div></div>';
  if (filtered.length === 0){
    h += '<div class="empty-state">' + ic('messageCircle',40) + '<p>Belum ada aduan</p></div>';
    openModal('Aduan Siswa', h);
    if (window.hydrateIcons) window.hydrateIcons();
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
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">' + esc(a.fromName) + ' (' + esc(roleLabel(a.fromRole)) + ') &middot; ' + (c ? esc(c.name) : '') + ' &middot; ' + fmtDate(a.createdAt) + '</div>' +
      '<div style="font-size:11.5px;margin-bottom:6px;">Kategori: <b>' + esc(a.category) + '</b></div>' +
      '<div style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;padding:10px;background:var(--surface);border-radius:6px;">' + esc(a.detail) + '</div>' +
      (a.feedback ? '<div style="margin-top:8px;padding:10px;background:var(--success-soft);border-radius:6px;font-size:12.5px;"><b>Balasan:</b><br>' + esc(a.feedback) + '</div>' : '') +
      '<div class="action-row" style="margin-top:10px;">' +
        (a.status !== 'read' && a.status !== 'resolved' ? '<button class="btn btn-sm btn-info" onclick="markAduanRead(\'' + a.id + '\')">' + ic('check','sm') + ' Dibaca</button>' : '') +
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
  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>Aduan:</b> ' + esc(a.title) + '</div></div>';
  h += '<div class="form-group"><label>Balasan / Tindak Lanjut</label><textarea id="ad-feedback" rows="5" maxlength="800"></textarea></div>';
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
  window.fbSet('aduan', aduanId, Object.assign({}, a, {
    status: 'resolved', feedback: feedback, resolvedAt: Date.now(), resolvedBy: u().name
  }));
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
  if (channel === 'wa' || channel === 'both'){
    var c = findClass(a.classId);
    if (c){
      var student = (c.students || []).find(function(s){ return s.id === a.fromId; });
      if (student && student.phone && normalizePhone(student.phone)){
        var msg = '*SP-PPT — SMP Negeri 10 Samarinda*\n\n_Balasan Aduan_\n\nYth. *' + student.name + '*\n\nAduan Anda:\n_' + a.title + '_\n\nBalasan:\n' + feedback + '\n\n—\nDari: ' + u().name;
        window.open('https://wa.me/' + normalizePhone(student.phone) + '?text=' + encodeURIComponent(msg), '_blank');
      }
    }
  }
  alert('Balasan terkirim!');
  setTimeout(function(){ window.openAduanGuru(a.classId); }, 300);
};

/* ============================================================
   FLOATING ADUAN
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
  btn.innerHTML = ic('warning', 22) + '<span class="floating-panduan-label">Aduan</span>';
  document.body.appendChild(btn);
}

setTimeout(injectFloatingAduan, 1500);
setTimeout(injectFloatingAduan, 3000);

(function(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(injectFloatingAduan, 500);
    setTimeout(injectFloatingAduan, 1500);
    return ret;
  };
})();

console.log('[features-comms] v2.0 loaded');

})();
