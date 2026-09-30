/* ============================================================
   features-extra.js — v2.0 FINAL
   Fitur:
   1. Kas Reminder Dashboard
   2. Patch Jam 24 Jam
   3. Patch Deadline Waktu
   4. Wajib Kerabat (Pimpro)
   5. Panduan V2 (Lengkap)
   6. Progres Divisi
   7. Umpan Balik Siswa → Guru
   8. Master Timeline Horizontal Slide
   9. Kalender Konten Horizontal Slide
   10. Inject GDrive Button di Toolbar
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico) return;

function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function u(){ return window.currentUser || {}; }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uType(){ return String(u().type||'').toLowerCase(); }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id === cid; }); }
function openModal(t, b){ if (window.openModal) window.openModal(t, b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }
function fmtDateShort(s){ if (!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); }

/* ============================================================
   1. KAS REMINDER DASHBOARD
   ============================================================ */
window.checkKasReminder = function(cid, sid){
  try {
    var raw = localStorage.getItem('sppt_kas_' + cid);
    if (!raw) return null;
    var data = JSON.parse(raw);
    if (!data || !data.active) return null;

    function getPeriodeStart(periode){
      var d = new Date();
      var iso = function(x){ return x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0'); };
      if (periode === 'daily') return iso(d);
      if (periode === 'weekly'){
        var day = d.getDay();
        var diff = day === 0 ? 6 : day - 1;
        var s = new Date(d); s.setDate(d.getDate() - diff);
        return iso(s);
      }
      if (periode === 'monthly') return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-01';
      return iso(d);
    }
    var start = getPeriodeStart(data.periode);
    var pays = (data.payments && data.payments[sid]) || [];
    var paid = pays.some(function(p){ return p.tanggal >= start; });
    if (paid) return null;
    var periodeLabel = {daily:'hari', weekly:'minggu', biweekly:'2 minggu', monthly:'bulan'}[data.periode] || data.periode;
    return 'Anda belum membayar <b>' + esc(data.nama) + '</b> (Rp ' + (data.nominal||0).toLocaleString('id-ID') + ' / ' + periodeLabel + '). ' +
      '<a href="#" onclick="openKasKelas();return false;" style="color:var(--primary);font-weight:700;">Bayar sekarang</a>';
  } catch(e){ return null; }
};

/* ============================================================
   2. PATCH JAM 24 JAM
   ============================================================ */
(function(){
  var orig = Date.prototype.toLocaleTimeString;
  Date.prototype.toLocaleTimeString = function(locales, opts){
    opts = Object.assign({}, opts || {}, {hour12: false});
    return String(orig.call(this, locales || 'id-ID', opts)).replace(/\./g, ':');
  };
  var origS = Date.prototype.toLocaleString;
  Date.prototype.toLocaleString = function(locales, opts){
    var o = Object.assign({}, opts || {});
    if (o.hour || o.minute || o.second) o.hour12 = false;
    var result = origS.call(this, locales || 'id-ID', o);
    return String(result).replace(/(\d{1,2})\.(\d{2})(?!\d)/g, '$1:$2');
  };
})();

/* ============================================================
   3. PATCH DEADLINE WAKTU
   ============================================================ */
window.fmtDateTime = function(date, time){
  if (!date) return '-';
  var t = String(time || '23:59').replace('.', ':');
  var d = new Date(date + 'T' + t + ':00');
  if (isNaN(d.getTime())) return date + ', ' + t;
  var bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return d.getDate() + ' ' + bln[d.getMonth()] + ' ' + d.getFullYear() + ', ' + t;
};
window.isDeadlinePassed = function(date, time){
  if (!date) return false;
  var t = String(time || '23:59').replace('.', ':');
  var d = new Date(date + 'T' + t + ':00');
  if (isNaN(d.getTime())) return false;
  return Date.now() > d.getTime();
};
window.hitungSelisih = function(date, time){
  if (!date) return '';
  var t = String(time || '23:59').replace('.', ':');
  var d = new Date(date + 'T' + t + ':00');
  if (isNaN(d.getTime())) return '';
  var diff = d.getTime() - Date.now();
  if (diff <= 0) return 'TERLEWAT';
  var hari = Math.floor(diff / (1000*60*60*24));
  var jam = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  if (hari > 0) return hari + ' hari ' + jam + ' jam lagi';
  var menit = Math.floor((diff % (1000*60*60)) / (1000*60));
  if (jam > 0) return jam + ' jam ' + menit + ' menit lagi';
  return menit + ' menit lagi';
};

/* ============================================================
   4. WAJIB ISI KERABAT (PIMPRO)
   ============================================================ */
window.__checkWajibKerabat = function(){
  if (!isSiswa()) return;
  if (uRole() !== 'pimpinan_produksi') return;
  var cid = uCid();
  if (!cid) return;
  var c = findClass(cid);
  if (!c) return;
  if (c.kerabatNama) return;

  var h = '<div class="alert alert-warning">' + ic('warning') + '<div><b>WAJIB DIISI</b><br>Sebagai Pimpinan Produksi, Anda harus mengisi <b>Kerabat Kerja</b> kelas ini terlebih dahulu.</div></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" onclick="closeModal();openEditKerabat(\'' + cid + '\')">' + ic('award') + ' Isi Kerabat Kerja Sekarang</button>';
  openModal('Wajib Diisi', h);
};

/* ============================================================
   5. PROGRES DIVISI
   ============================================================ */
window.openDivisionProgressSelf = function(){
  var cid = uCid();
  if (!cid) return;
  var ch = (window.DB.checklists && window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.filter(function(it){ return !it.isPersonal; });
  if (items.length === 0){
    openModal('Progres Divisi', '<div class="empty-state">' + ic('book',40) + '<p>Belum ada checklist</p></div>');
    return;
  }
  var h = '<div class="alert alert-info">' + ic('info') + '<div>Statistik progres per divisi.</div></div>';
  ['produksi','artistik'].forEach(function(div){
    var arr = items.filter(function(it){
      var d = it.division || (window.getDivisionOfRole ? window.getDivisionOfRole(it.assignedRole || 'umum') : 'produksi');
      return d === div;
    });
    if (arr.length === 0) return;
    var divMeta = window.DIVISIONS && window.DIVISIONS[div];
    var divLabel = divMeta ? divMeta.label : div;
    var icon = div === 'produksi' ? 'briefcase' : 'layers';
    var done = arr.filter(function(x){ return x.done; }).length;
    var pct = Math.round(done/arr.length*100);

    h += '<div class="card" style="margin-bottom:12px;border-left:4px solid var(--'+(div==='produksi'?'info':'accent')+');">' +
      '<h3>' + ic(icon) + ' ' + esc(divLabel) + ' <span class="badge ' + (pct===100 ? 'badge-success' : pct>0 ? 'badge-warning' : 'badge-gray') + '">' + done + '/' + arr.length + ' (' + pct + '%)</span></h3>' +
      '<div class="progress-container"><div class="progress-bar ' + (pct===100 ? 'complete' : pct>0 ? 'partial' : '') + '" style="width:' + pct + '%"></div></div>';

    // Breakdown per peran
    var byRole = {};
    arr.forEach(function(it){
      var r = it.assignedRole || 'umum';
      if (!byRole[r]) byRole[r] = [];
      byRole[r].push(it);
    });
    Object.keys(byRole).forEach(function(rk){
      var rArr = byRole[rk];
      var rDone = rArr.filter(function(x){ return x.done; }).length;
      h += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border);font-size:12px;">' +
        '<span>' + esc(roleLabel(rk)) + '</span>' +
        '<span class="badge ' + (rDone===rArr.length ? 'badge-success' : rDone>0 ? 'badge-warning' : 'badge-gray') + '">' + rDone + '/' + rArr.length + '</span>' +
      '</div>';
    });
    h += '</div>';
  });
  openModal('Progres Divisi', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   6. UMPAN BALIK SISWA → GURU
   ============================================================ */
window.openUmpanBalik = function(notifId){
  var n = (window.DB.notifications || []).find(function(x){ return x.id === notifId; });
  if (!n){ alert('Notifikasi tidak ditemukan'); return; }
  if (!isSiswa()){ alert('Hanya siswa'); return; }

  var h = '<div class="alert alert-info">' + ic('info') + '<div>Umpan balik untuk:<br><b>' + esc(n.title || '-') + '</b></div></div>';
  h += '<div class="form-group"><label>Jenis</label><select id="fb-type">' +
    '<option value="terima">Sudah saya terima</option>' +
    '<option value="tanya">Ada pertanyaan</option>' +
    '<option value="kendala">Saya kendala</option>' +
    '<option value="usulan">Usulan</option>' +
    '</select></div>';
  h += '<div class="form-group"><label>Catatan</label><textarea id="fb-msg" rows="4" maxlength="500"></textarea></div>';
  h += '<button class="btn btn-primary btn-block" onclick="sendUmpanBalik(\'' + notifId + '\')">' + ic('send') + ' Kirim</button>';
  openModal('Umpan Balik', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.sendUmpanBalik = function(notifId){
  var n = (window.DB.notifications || []).find(function(x){ return x.id === notifId; });
  if (!n) return;
  var type = document.getElementById('fb-type').value;
  var msg = (document.getElementById('fb-msg').value || '').trim();
  if (!msg){ alert('Tulis catatan'); return; }

  window.fbSet('notifications', uid(), {
    id: uid(), classId: n.classId,
    fromId: uSid(), fromName: u().name, fromType: 'siswa', fromRole: uRole(),
    toId: n.fromId || 'guru', type: 'info',
    title: 'Umpan Balik dari ' + u().name,
    message: '[' + type + '] ' + msg + '\n\nRe: ' + (n.title || ''),
    createdAt: Date.now(), readBy: [], doneBy: []
  }).then(function(){
    if (window.logActivity) window.logActivity('feedback', u().name + ' kirim umpan balik: ' + type, {classId: n.classId});
    closeModal();
    alert('Umpan balik terkirim!');
  });
};

/* ============================================================
   7. MASTER TIMELINE HORIZONTAL SLIDE
   ============================================================ */
window.renderMasterTimelineHorizontal = function(cid, targetId){
  var el = document.getElementById(targetId);
  if (!el) return;

  var ms = (window.getMasterSchedule ? window.getMasterSchedule(cid) : null) || {items: []};
  var jadwal = (window.getJadwalLatihanData ? window.getJadwalLatihanData(cid) : null) || {items: []};
  var konten = (window.getKalenderKonten ? window.getKalenderKonten(cid) : null) || {items: []};
  var meetings = Object.values(window.DB.meetings || {}).filter(function(m){ return m.classId === cid; });

  if ((ms.items||[]).length + (jadwal.items||[]).length + (konten.items||[]).length + meetings.length === 0){
    el.innerHTML = '<div class="alert alert-info">' + ic('info') + '<div>Master Timeline belum diisi oleh Pimpro/Sekretaris.</div></div>';
    return;
  }

  // Group per bulan
  var perBulan = {};
  var bulanOrder = [];

  (ms.items || []).forEach(function(it){
    var key = it.monthKey || '2025-10';
    if (!perBulan[key]){ perBulan[key] = []; bulanOrder.push(key); }
    perBulan[key].push({
      title: it.title, sub: 'Minggu ' + it.weekNumber + ' · H' + it.day, pic: it.pic, type: 'Agenda'
    });
  });
  (jadwal.items || []).forEach(function(it){
    var key = (it.date||'').substring(0,7);
    if (!key) return;
    if (!perBulan[key]){ perBulan[key] = []; bulanOrder.push(key); }
    perBulan[key].push({ title: it.title, sub: fmtDateShort(it.date) + (it.time ? ' ' + it.time : ''), pic: it.createdBy, type: 'Latihan' });
  });
  (konten.items || []).forEach(function(it){
    var key = (it.date||'').substring(0,7);
    if (!key) return;
    if (!perBulan[key]){ perBulan[key] = []; bulanOrder.push(key); }
    perBulan[key].push({ title: it.title, sub: it.platform + ' · ' + it.type, pic: it.pic, type: 'Konten' });
  });
  meetings.forEach(function(m){
    var key = (m.date||'').substring(0,7);
    if (!key) return;
    if (!perBulan[key]){ perBulan[key] = []; bulanOrder.push(key); }
    perBulan[key].push({ title: m.title, sub: fmtDateShort(m.date), pic: m.createdBy, type: 'Absensi' });
  });

  bulanOrder.sort();
  var namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  var h = '<div style="overflow-x:auto;padding:16px;background:var(--card);border-radius:12px;border:1px solid var(--border);">';
  h += '<div style="display:flex;align-items:center;gap:20px;min-width:' + (bulanOrder.length * 220) + 'px;padding:60px 0;position:relative;">';

  // Garis horizontal
  h += '<div style="position:absolute;left:40px;right:40px;top:50%;height:3px;background:linear-gradient(90deg,#dc2626,#f59e0b,#10b981,#2563eb);transform:translateY(-50%);"></div>';

  bulanOrder.forEach(function(key, i){
    var parts = key.split('-');
    var label = namaBulan[parseInt(parts[1],10)-1] + ' ' + parts[0];
    var items = perBulan[key].slice(0, 3);
    var dotColors = ['#dc2626','#f59e0b','#10b981','#2563eb'];
    var color = dotColors[i % 4];

    h += '<div style="flex:1;position:relative;display:flex;flex-direction:column;align-items:center;min-width:200px;">';

    // Card di atas
    h += '<div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:16px;width:180px;">';
    items.forEach(function(it, j){
      h += '<div style="background:var(--card);border-left:3px solid ' + color + ';border-radius:8px;padding:8px 10px;margin-bottom:6px;box-shadow:0 2px 8px rgba(0,0,0,.06);">' +
        '<div style="font-size:11px;font-weight:700;color:' + color + ';">' + esc(it.type) + '</div>' +
        '<div style="font-size:11.5px;font-weight:700;color:var(--text-strong);line-height:1.3;">' + esc(it.title) + '</div>' +
        '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">' + esc(it.sub) + '</div>' +
      '</div>';
    });
    h += '</div>';

    // Dot + Label
    h += '<div style="width:20px;height:20px;background:' + color + ';border:4px solid #fff;border-radius:50%;box-shadow:0 0 0 2px ' + color + ';z-index:2;"></div>';
    h += '<div style="font-size:14px;font-weight:800;color:' + color + ';margin-top:10px;">' + label + '</div>';
    h += '</div>';
  });

  h += '</div></div>';
  el.innerHTML = h;
};

/* ============================================================
   8. KALENDER KONTEN HORIZONTAL SLIDE
   ============================================================ */
window.renderKalenderKontenHorizontal = function(cid, targetId){
  var el = document.getElementById(targetId);
  if (!el) return;
  var konten = (window.getKalenderKonten ? window.getKalenderKonten(cid) : null) || {items: []};
  if ((konten.items||[]).length === 0){
    el.innerHTML = '<div class="alert alert-info">' + ic('info') + '<div>Kalender Konten belum diisi oleh Divisi Publikasi.</div></div>';
    return;
  }

  var byMonth = {};
  konten.items.forEach(function(it){
    var key = (it.date||'').substring(0,7);
    if (!key) return;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(it);
  });
  var bulanOrder = Object.keys(byMonth).sort();
  var namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  var platColor = function(p){
    p = String(p||'').toLowerCase();
    if (p.indexOf('insta')>=0) return '#e1306c';
    if (p.indexOf('tiktok')>=0) return '#000000';
    if (p.indexOf('youtube')>=0) return '#ff0000';
    if (p.indexOf('wa')>=0) return '#25d366';
    return '#2563eb';
  };

  var h = '<div style="overflow-x:auto;padding:16px;background:var(--card);border-radius:12px;border:1px solid var(--border);">';
  h += '<div style="display:flex;align-items:center;gap:20px;min-width:' + (bulanOrder.length * 240) + 'px;padding:60px 0;position:relative;">';
  h += '<div style="position:absolute;left:40px;right:40px;top:50%;height:3px;background:linear-gradient(90deg,#e1306c,#000,#ff0000,#25d366);transform:translateY(-50%);"></div>';

  bulanOrder.forEach(function(key, i){
    var items = byMonth[key].slice(0, 3);
    var parts = key.split('-');
    var label = namaBulan[parseInt(parts[1],10)-1] + ' ' + parts[0];
    var color = ['#e1306c','#000','#ff0000','#25d366'][i % 4];

    h += '<div style="flex:1;position:relative;display:flex;flex-direction:column;align-items:center;min-width:220px;">';
    h += '<div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:16px;width:200px;">';
    items.forEach(function(it){
      var pc = platColor(it.platform);
      h += '<div style="background:var(--card);border-left:3px solid ' + pc + ';border-radius:8px;padding:8px 10px;margin-bottom:6px;box-shadow:0 2px 8px rgba(0,0,0,.06);">' +
        '<div style="display:flex;justify-content:space-between;gap:6px;margin-bottom:2px;">' +
          '<span style="font-size:9.5px;font-weight:700;color:' + pc + ';text-transform:uppercase;">' + esc(it.platform) + '</span>' +
          '<span style="font-size:9.5px;color:var(--text-muted);">' + fmtDateShort(it.date).split(' ')[0] + ' ' + namaBulan[parseInt((it.date||'').split('-')[1],10)-1] + '</span>' +
        '</div>' +
        '<div style="font-size:11.5px;font-weight:700;color:var(--text-strong);line-height:1.3;">' + esc(it.title) + '</div>' +
        '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">' + esc(it.type) + (it.pic ? ' · ' + esc(it.pic) : '') + '</div>' +
      '</div>';
    });
    h += '</div>';
    h += '<div style="width:20px;height:20px;background:' + color + ';border:4px solid #fff;border-radius:50%;box-shadow:0 0 0 2px ' + color + ';z-index:2;"></div>';
    h += '<div style="font-size:14px;font-weight:800;color:' + color + ';margin-top:10px;">' + label + '</div>';
    h += '</div>';
  });

  h += '</div></div>';
  el.innerHTML = h;
};

/* ============================================================
   9. INJECT GDRIVE BUTTON DI TOOLBAR
   ============================================================ */
function injectGDriveButton(){
  if (!isSiswa()) return;
  var tb = document.querySelector('.extras-toolbar-top');
  if (!tb) return;
  var role = uRole();
  var cid = uCid();

  if (role === 'bendahara' && !tb.querySelector('.btn-gdrive-keuangan')){
    var b1 = document.createElement('button');
    b1.className = 'btn btn-sm btn-gdrive-keuangan';
    b1.style.cssText = 'background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;';
    b1.onclick = function(){ if (window.openGDriveKeuangan) window.openGDriveKeuangan(cid); };
    b1.innerHTML = ic('folder', 14) + ' <span style="margin-left:5px;">Arsip Nota</span>';
    tb.appendChild(b1);
  }
  if ((role === 'koor_publikasi' || role === 'anggota_publikasi') && !tb.querySelector('.btn-gdrive-dokpub')){
    var b2 = document.createElement('button');
    b2.className = 'btn btn-sm btn-gdrive-dokpub';
    b2.style.cssText = 'background:linear-gradient(135deg,var(--success),#059669);color:#fff;';
    b2.onclick = function(){ if (window.openGDriveDokpub) window.openGDriveDokpub(cid); };
    b2.innerHTML = ic('folder', 14) + ' <span style="margin-left:5px;">Galeri Dokpub</span>';
    tb.appendChild(b2);
  }
}

setTimeout(injectGDriveButton, 1500);
setTimeout(injectGDriveButton, 3000);

(function(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(injectGDriveButton, 500);
    return ret;
  };
})();

/* ============================================================
   10. PANDUAN V2 (LENGKAP)
   ============================================================ */
window.__openPanduanV2 = function(){
  var h = '';
  h += '<div style="text-align:center;padding:20px 16px;background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));border-radius:14px;margin-bottom:16px;">' +
    '<div style="margin-bottom:6px;">' + ic('book', 32) + '</div>' +
    '<div style="font-size:17px;font-weight:800;color:var(--text-strong);">Panduan SP-PPT</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);margin-top:4px;">Sistem Penilaian Proyek Produksi Teater</div>' +
    '<div style="font-size:11.5px;color:var(--text-muted);">SMP Negeri 10 Samarinda</div>' +
  '</div>';

  h += '<div class="card" style="border-left:4px solid var(--primary);">' +
    '<h3>' + ic('info') + ' Bobot Nilai Akhir</h3>' +
    '<div style="background:var(--surface);padding:10px 12px;border-radius:8px;font-size:12px;line-height:1.8;">' +
      '&bull; <b>Guru</b>: 40% (Pimpro & Sutradara)<br>' +
      '&bull; <b>Ketua</b>: 30% (Pimpro & Sutradara nilai semua)<br>' +
      '&bull; <b>Rekan</b>: 30% (atasan + peer sekawan)<br>' +
      '&bull; <b>Faktor Kehadiran</b>: 0.75 - 1.0 (auto-multiply)<br>' +
      '&bull; <b>Tahapan</b>: Perencanaan 20% + Pelaksanaan 35% + Pertunjukan 35% + Evaluasi 10%' +
    '</div>' +
  '</div>';

  h += '<details class="card" style="border-left:4px solid var(--success);">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:14px;">' + ic('lock') + ' Cara Login</summary>' +
    '<div style="margin-top:12px;font-size:12.5px;line-height:1.8;">' +
      '<b>GURU:</b> Tab Guru → email + password.<br>' +
      '<b>SISWA:</b> Tab Siswa → pilih kelas → email ATAU No. WA + password.<br>' +
      '<b>Lupa Password?</b> Klik link di bawah tombol login → email → kode 6 digit muncul → reset.' +
    '</div></details>';

  h += '<details class="card" style="border-left:4px solid var(--info);">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:14px;">' + ic('user') + ' Untuk Siswa</summary>' +
    '<div style="margin-top:12px;font-size:12.5px;line-height:1.8;">' +
      '<b>1. Dashboard:</b> Lihat peran, tahapan, tugas, timeline.<br>' +
      '<b>2. Checklist Saya:</b> Tugas pribadi (Ambil dari Template atau Tambah Manual).<br>' +
      '<b>3. Checklist Tim:</b> Tugas kolaboratif per peran.<br>' +
      '<b>4. Beri Nilai Rekan:</b> Skala 1-4 per rubrik. Berdasarkan BUKTI NYATA.<br>' +
      '<b>5. Absensi:</b> Isi kehadiran rapat/latihan/gladi.<br>' +
      '<b>6. Kerabat Kerja:</b> Struktur tim per jobdesk + WA call.<br>' +
      '<b>7. Dokumen Saya:</b> Download template → kerjakan → upload hasil.<br>' +
      '<b>8. Arsip Naskah:</b> Baca naskah dari Sutradara.<br>' +
      '<b>9. Booking Alat:</b> Khusus peran tertentu. Cek bentrok otomatis.<br>' +
      '<b>10. Aduan:</b> Lapor masalah signifikan via tombol merah.' +
    '</div></details>';

  h += '<details class="card" style="border-left:4px solid var(--success);">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:14px;">' + ic('shield') + ' Untuk Guru</summary>' +
    '<div style="margin-top:12px;font-size:12.5px;line-height:1.8;">' +
      '<b>1. Kelola Kelas:</b> Buat kelas, kode otomatis, kelola siswa.<br>' +
      '<b>2. Kelola Tahapan:</b> Aktifkan/nonaktifkan, atur deadline.<br>' +
      '<b>3. Penilaian:</b> Nilai Pimpro & Sutradara.<br>' +
      '<b>4. Rekap:</b> Lihat nilai lengkap, export Excel.<br>' +
      '<b>5. Kelola Template:</b> Atur template mana untuk peran apa (pusat, berlaku semua kelas).<br>' +
      '<b>6. Broadcast:</b> Kirim pengumuman ke semua siswa.<br>' +
      '<b>7. Aduan:</b> Baca dan balas aduan siswa.<br>' +
      '<b>8. Log:</b> Aktivitas & WhatsApp.' +
    '</div></details>';

  h += '<details class="card" style="border-left:4px solid var(--warning);">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:14px;">' + ic('star') + ' Aturan Emas</summary>' +
    '<div style="margin-top:12px;font-size:12.5px;line-height:1.9;">' +
      '1. Maksimal <b>1 jam</b> per sesi latihan<br>' +
      '2. Maksimal <b>2x latihan</b> per minggu<br>' +
      '3. <b>Tidak ada latihan</b> saat ujian<br>' +
      '4. Iuran kas <b>sukarela</b><br>' +
      '5. Manfaatkan <b>material bekas</b><br>' +
      '6. <b>Transparansi</b> keuangan wajib<br>' +
      '7. Nilai berdasarkan <b>bukti nyata</b>, bukan suka/duka<br>' +
      '8. Hormati semua peran & jobdesk' +
    '</div></details>';

  h += '<div class="card" style="border-left:4px solid var(--info);">' +
    '<h3>' + ic('info') + ' Kendala Umum</h3>' +
    '<table style="width:100%;font-size:12px;border-collapse:collapse;">' +
    '<tr style="background:var(--surface);"><th style="padding:8px;text-align:left;">Masalah</th><th style="padding:8px;text-align:left;">Solusi</th></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Tidak bisa login</td><td style="padding:8px;border-bottom:1px solid var(--border);">Hubungi Bendahara untuk reset</td></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Lupa password</td><td style="padding:8px;border-bottom:1px solid var(--border);">Klik "Lupa Password?"</td></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Menu tidak muncul</td><td style="padding:8px;border-bottom:1px solid var(--border);">Refresh Ctrl+Shift+R</td></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Upload gagal</td><td style="padding:8px;border-bottom:1px solid var(--border);">File &lt; 1 MB, format PDF/DOCX</td></tr>' +
    '<tr><td style="padding:8px;">Notif numpuk</td><td style="padding:8px;">Klik "Tandai Semua Dibaca" di panel notif</td></tr>' +
    '</table>' +
  '</div>';

  openModal('Panduan Sistem', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

// Override panduan lama
window.openPanduan = window.__openPanduanV2;

/* ============================================================
   11. AUTO-TRIGGER — Wajib Kerabat setelah login
   ============================================================ */
setTimeout(function(){
  if (window.__checkWajibKerabat) window.__checkWajibKerabat();
}, 2500);

console.log('[features-extra] v2.0 FINAL loaded');

})();
