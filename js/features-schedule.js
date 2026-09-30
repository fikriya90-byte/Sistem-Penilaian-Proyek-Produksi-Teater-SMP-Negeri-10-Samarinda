/* ============================================================
   SP-PPT features-schedule.js — v1.0 MILESTONE 6
   Fitur:
   1. Master Schedule (bulan/minggu/hari, CRUD)
   2. Jadwal Mandiri per Divisi (Pimpro, Sekretaris, Bendahara, Sutradara, Astrada)
   3. Kalender Konten (Dokpub)
   4. Jadwal Latihan & Laporan Harian
   5. Booking Alat Musik + conflict detection + filter + hapus
   Load SETELAH features-comms.js
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico){ console.warn('[features-schedule] app.js belum di-load.'); return; }

/* ============================================================
   HELPERS
   ============================================================ */
function ic(n,s){ return window.ico ? window.ico(n,s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function fmtDate(ts){ return window.fmtDate ? window.fmtDate(ts) : '-'; }
function fmtDateShort(s){ if (!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); }
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

var BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function isoToday(){ return new Date().toISOString().split('T')[0]; }

/* ============================================================
   1. MASTER SCHEDULE (bulan/minggu/hari)
   ============================================================ */
var MS_PERIODE = [
  { key:'2025-10', label:'Oktober 2025', year:2025, month:10 },
  { key:'2025-11', label:'November 2025', year:2025, month:11 },
  { key:'2025-12', label:'Desember 2025', year:2025, month:12 },
  { key:'2026-01', label:'Januari 2026', year:2026, month:1 }
];

function msKey(cid){ return 'sppt_ms_' + cid; }
function getMS(cid){
  try {
    var raw = localStorage.getItem(msKey(cid));
    var data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.items)) return {items:[]};
    return data;
  } catch(e){ return {items:[]}; }
}
function setMS(cid, data){
  try {
    localStorage.setItem(msKey(cid), JSON.stringify(data));
    window.fbSet('master_schedule', cid, {classId: cid, items: data.items || []});
  } catch(e){ console.error('[setMS]', e); }
}

function getWeeksInMonth(year, month){
  var firstDay = new Date(year, month-1, 1).getDay();
  var daysInMonth = new Date(year, month, 0).getDate();
  var offset = firstDay === 0 ? 6 : firstDay - 1;
  return Math.ceil((daysInMonth + offset) / 7);
}

window.openMasterSchedule = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var canEdit = isGuru() || uRole()==='pimpinan_produksi' || uRole()==='sekretaris';

  var h = '';
  h += '<div class="alert alert-info">'+ic('calendar')+'<div><b>Master Schedule Produksi</b><br><small>Jadwal bulanan per minggu &amp; hari &mdash; '+(canEdit?'bisa edit':'hanya lihat')+'</small></div></div>';

  // Tabs bulan
  h += '<div class="action-row" style="margin-bottom:14px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;">';
  MS_PERIODE.forEach(function(p, i){
    h += '<button class="btn btn-sm" id="ms-tab-'+p.key+'" onclick="switchMSMonth(\''+p.key+'\',\''+cid+'\')">'+esc(p.label)+'</button>';
  });
  h += '</div>';

  h += '<div id="ms-body"></div>';

  openModal('Master Schedule', h);
  setTimeout(function(){ switchMSMonth(MS_PERIODE[0].key, cid); }, 100);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.switchMSMonth = function(monthKey, cid){
  MS_PERIODE.forEach(function(p){
    var el = document.getElementById('ms-tab-'+p.key);
    if (el) el.className = 'btn btn-sm' + (p.key===monthKey ? ' btn-primary' : '');
  });
  var periode = MS_PERIODE.find(function(p){ return p.key===monthKey; });
  if (!periode) return;
  var data = getMS(cid);
  var items = (data.items||[]).filter(function(it){ return it.monthKey === monthKey; });
  var totalWeek = getWeeksInMonth(periode.year, periode.month);
  if (totalWeek < 4) totalWeek = 4;
  if (totalWeek > 5) totalWeek = 5;

  var canEdit = isGuru() || uRole()==='pimpinan_produksi' || uRole()==='sekretaris';
  var h = '';

  for (var w = 1; w <= totalWeek; w++){
    var weekItems = items.filter(function(it){ return it.weekNumber === w; });
    h += '<div class="card" style="margin-bottom:12px;border-left:3px solid var(--primary);">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
        '<div style="font-weight:700;font-size:13.5px;">'+ic('calendar','sm')+' '+periode.label+' &mdash; Minggu ke-'+w+'</div>' +
        '<span class="badge badge-gray">'+weekItems.length+' agenda</span>' +
      '</div>';

    if (weekItems.length === 0){
      h += '<div style="font-size:12px;color:var(--text-muted);padding:8px 0;">Belum ada agenda untuk minggu ini.</div>';
    } else {
      weekItems.sort(function(a,b){ return (a.day||0) - (b.day||0); });
      weekItems.forEach(function(it){
        h += '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px dashed var(--border);align-items:flex-start;">' +
          '<div style="flex:0 0 42px;text-align:center;background:var(--primary-soft);color:var(--primary);border-radius:6px;padding:5px 4px;font-size:11px;font-weight:700;">H'+(it.day||'?')+'</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:12.5px;font-weight:600;">'+esc(it.title)+'</div>' +
            (it.pic ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">PIC: '+esc(it.pic)+'</div>' : '') +
            (it.desc ? '<div style="font-size:11.5px;margin-top:3px;">'+esc(it.desc)+'</div>' : '') +
          '</div>' +
          (canEdit ? '<button class="btn btn-sm btn-danger" onclick="delMSItem(\''+cid+'\',\''+it.id+'\',\''+monthKey+'\')">'+ic('trash','sm')+'</button>' : '') +
        '</div>';
      });
    }

    if (canEdit){
      h += '<button class="btn btn-sm" style="margin-top:10px;" onclick="openAddMSItem(\''+cid+'\',\''+monthKey+'\','+w+')">'+ic('plus','sm')+' Tambah Agenda</button>';
    }
    h += '</div>';
  }

  var el = document.getElementById('ms-body');
  if (el){ el.innerHTML = h; if (window.hydrateIcons) window.hydrateIcons(el); }
};

window.openAddMSItem = function(cid, monthKey, weekNumber){
  openModal('Tambah Agenda',
    '<div class="form-group"><label>Judul Agenda</label><input id="ms-title" maxlength="120"></div>' +
    '<div class="form-group"><label>Hari ke (1-7)</label><input type="number" id="ms-day" min="1" max="7" value="1"></div>' +
    '<div class="form-group"><label>PIC</label><input id="ms-pic" maxlength="80" value="'+esc(u().name||'')+'"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="ms-desc" rows="2" maxlength="300"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveMSItem(\''+cid+'\',\''+monthKey+'\','+weekNumber+')">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.saveMSItem = function(cid, monthKey, weekNumber){
  var title = (document.getElementById('ms-title').value||'').trim();
  var day = parseInt(document.getElementById('ms-day').value) || 1;
  var pic = (document.getElementById('ms-pic').value||'').trim();
  var desc = (document.getElementById('ms-desc').value||'').trim();
  if (!title){ alert('Judul wajib diisi'); return; }
  var data = getMS(cid);
  data.items.push({
    id: uid(), monthKey: monthKey, weekNumber: weekNumber, day: day,
    title: title, pic: pic, desc: desc,
    createdBy: u().name, createdAt: Date.now()
  });
  setMS(cid, data);
  closeModal();
  alert('Agenda ditambahkan');
  setTimeout(function(){ window.openMasterSchedule(cid); setTimeout(function(){ switchMSMonth(monthKey, cid); }, 200); }, 200);
};

window.delMSItem = function(cid, itemId, monthKey){
  if (!confirm('Hapus agenda ini?')) return;
  var data = getMS(cid);
  data.items = data.items.filter(function(x){ return x.id !== itemId; });
  setMS(cid, data);
  setTimeout(function(){ window.openMasterSchedule(cid); setTimeout(function(){ switchMSMonth(monthKey, cid); }, 200); }, 200);
};

/* ============================================================
   2. JADWAL MANDIRI DIVISI
   ============================================================ */
var DIVISI_JADWAL_ROLES = {
  pimpinan_produksi: { label:'Pimpinan Produksi', icon:'star' },
  sekretaris: { label:'Sekretaris', icon:'clipboard' },
  bendahara: { label:'Bendahara', icon:'chart' },
  sutradara: { label:'Sutradara', icon:'target' },
  asisten_sutradara: { label:'Asisten Sutradara', icon:'clipboard' }
};

function jadwalKey(tipe, cid){ return 'sppt_jadwal_'+tipe+'_'+cid; }
function getJadwal(tipe, cid){
  try {
    var raw = localStorage.getItem(jadwalKey(tipe, cid));
    var data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.items)) return {items:[]};
    return data;
  } catch(e){ return {items:[]}; }
}
function setJadwal(tipe, cid, data){
  try {
    localStorage.setItem(jadwalKey(tipe, cid), JSON.stringify(data));
    window.fbSet('jadwal_divisi', tipe+'_'+cid, {tipe:tipe, classId:cid, items:data.items||[]});
  } catch(e){ console.error(e); }
}

window.openJadwalDivisi = function(tipe){
  var cid = uCid(); if (!cid) return;
  var meta = DIVISI_JADWAL_ROLES[tipe];
  if (!meta){ alert('Jadwal divisi tidak ditemukan'); return; }

  var myRole = uRole();
  var canEdit = isGuru() || myRole === tipe;
  var data = getJadwal(tipe, cid);
  var items = (data.items||[]).slice().sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });

  var h = '';
  h += '<div class="alert alert-info">'+ic(meta.icon)+'<div><b>Jadwal '+esc(meta.label)+'</b><br><small>'+(canEdit?'Bisa edit':'Hanya lihat')+'</small></div></div>';

  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" onclick="openAddJadwalDivisi(\''+tipe+'\')">'+ic('plus','sm')+' Tambah Jadwal</button>';
  }

  if (items.length === 0){
    h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada jadwal</p></div>';
  } else {
    items.forEach(function(it){
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">' +
        '<div style="font-weight:700;font-size:13px;">'+esc(it.title)+'</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">' +
          ic('calendar','sm')+' '+fmtDateShort(it.date)+
          (it.time ? ' &middot; '+ic('clock','sm')+' '+esc(it.time) : '') +
        '</div>' +
        (it.location ? '<div style="font-size:11.5px;margin-top:3px;">'+ic('target','sm')+' '+esc(it.location)+'</div>' : '') +
        (it.note ? '<div style="font-size:12px;margin-top:6px;padding:8px;background:var(--surface);border-radius:6px;">'+esc(it.note)+'</div>' : '') +
        (canEdit ? '<div class="action-row" style="margin-top:8px;"><button class="btn btn-sm btn-danger" onclick="delJadwalDivisi(\''+tipe+'\',\''+it.id+'\')">'+ic('trash','sm')+' Hapus</button></div>' : '') +
      '</div>';
    });
  }

  openModal('Jadwal '+esc(meta.label), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openAddJadwalDivisi = function(tipe){
  openModal('Tambah Jadwal',
    '<div class="form-group"><label>Judul Agenda</label><input id="jd-title" maxlength="120"></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="jd-date" value="'+isoToday()+'"></div>' +
    '<div class="form-group"><label>Jam</label><input type="time" id="jd-time" value="14:00"></div>' +
    '<div class="form-group"><label>Lokasi</label><input id="jd-loc" maxlength="100"></div>' +
    '<div class="form-group"><label>Catatan</label><textarea id="jd-note" rows="2" maxlength="300"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveJadwalDivisi(\''+tipe+'\')">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.saveJadwalDivisi = function(tipe){
  var title = (document.getElementById('jd-title').value||'').trim();
  var date = document.getElementById('jd-date').value;
  var time = document.getElementById('jd-time').value;
  var loc = (document.getElementById('jd-loc').value||'').trim();
  var note = (document.getElementById('jd-note').value||'').trim();
  if (!title || !date){ alert('Judul & tanggal wajib'); return; }
  var cid = uCid();
  var data = getJadwal(tipe, cid);
  data.items.push({id:uid(), title:title, date:date, time:time, location:loc, note:note, createdBy:u().name, createdAt:Date.now()});
  setJadwal(tipe, cid, data);
  logAct('jadwal_add', u().name+' tambah jadwal '+tipe+': '+title, {classId:cid});
  closeModal();
  setTimeout(function(){ window.openJadwalDivisi(tipe); }, 200);
};

window.delJadwalDivisi = function(tipe, itemId){
  if (!confirm('Hapus jadwal ini?')) return;
  var cid = uCid();
  var data = getJadwal(tipe, cid);
  data.items = data.items.filter(function(x){ return x.id !== itemId; });
  setJadwal(tipe, cid, data);
  setTimeout(function(){ window.openJadwalDivisi(tipe); }, 200);
};

/* ============================================================
   3. KALENDER KONTEN (Dokpub)
   ============================================================ */
function kontenKey(cid){ return 'sppt_konten_' + cid; }
function getKonten(cid){
  try {
    var raw = localStorage.getItem(kontenKey(cid));
    var data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.items)) return {items:[]};
    return data;
  } catch(e){ return {items:[]}; }
}
function setKonten(cid, data){
  try {
    localStorage.setItem(kontenKey(cid), JSON.stringify(data));
    window.fbSet('kalender_konten', cid, {classId: cid, items: data.items||[]});
  } catch(e){ console.error(e); }
}

window.openKalenderKonten = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var myRole = uRole();
  var canEdit = isGuru() || myRole === 'koor_publikasi' || myRole === 'anggota_publikasi';
  var data = getKonten(cid);
  var items = (data.items||[]).slice().sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });

  var h = '';
  h += '<div class="alert alert-info">'+ic('image')+'<div><b>Kalender Konten Publikasi</b><br><small>'+(canEdit?'Bisa edit':'Hanya lihat')+'</small></div></div>';

  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" onclick="openAddKonten(\''+cid+'\')">'+ic('plus','sm')+' Tambah Konten</button>';
  }

  if (items.length === 0){
    h += '<div class="empty-state">'+ic('image',40)+'<p>Belum ada konten</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Platform</th><th>Jenis</th><th>Judul</th><th>PIC</th>'+(canEdit?'<th>Aksi</th>':'')+'</tr></thead><tbody>';
    items.forEach(function(it){
      h += '<tr>' +
        '<td>'+fmtDateShort(it.date)+'</td>' +
        '<td><span class="badge badge-info">'+esc(it.platform||'-')+'</span></td>' +
        '<td>'+esc(it.type||'-')+'</td>' +
        '<td><b>'+esc(it.title||'-')+'</b></td>' +
        '<td>'+esc(it.pic||'-')+'</td>' +
        (canEdit ? '<td><button class="btn btn-sm btn-danger" onclick="delKonten(\''+cid+'\',\''+it.id+'\')">'+ic('trash','sm')+'</button></td>' : '') +
      '</tr>';
    });
    h += '</tbody></table></div>';
  }

  openModal('Kalender Konten', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openAddKonten = function(cid){
  openModal('Tambah Konten',
    '<div class="form-group"><label>Tanggal Posting</label><input type="date" id="kt-date" value="'+isoToday()+'"></div>' +
    '<div class="form-group"><label>Platform</label><select id="kt-platform">' +
      '<option>Instagram</option><option>TikTok</option><option>YouTube</option><option>WhatsApp Status</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Jenis Konten</label><select id="kt-type">' +
      '<option>Teaser</option><option>Poster</option><option>BTS</option><option>Countdown</option><option>After Movie</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Judul / Caption</label><input id="kt-title" maxlength="150"></div>' +
    '<div class="form-group"><label>PIC</label><input id="kt-pic" maxlength="80" value="'+esc(u().name||'')+'"></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveKonten(\''+cid+'\')">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.saveKonten = function(cid){
  var date = document.getElementById('kt-date').value;
  var platform = document.getElementById('kt-platform').value;
  var type = document.getElementById('kt-type').value;
  var title = (document.getElementById('kt-title').value||'').trim();
  var pic = (document.getElementById('kt-pic').value||'').trim();
  if (!date || !title){ alert('Tanggal & judul wajib'); return; }
  var data = getKonten(cid);
  data.items.push({id:uid(), date:date, platform:platform, type:type, title:title, pic:pic, createdAt:Date.now()});
  setKonten(cid, data);
  logAct('konten_add', u().name+' tambah konten: '+title, {classId:cid});
  closeModal();
  setTimeout(function(){ window.openKalenderKonten(cid); }, 200);
};

window.delKonten = function(cid, itemId){
  if (!confirm('Hapus konten ini?')) return;
  var data = getKonten(cid);
  data.items = data.items.filter(function(x){ return x.id !== itemId; });
  setKonten(cid, data);
  setTimeout(function(){ window.openKalenderKonten(cid); }, 200);
};

/* ============================================================
   4. JADWAL LATIHAN & LAPORAN HARIAN
   ============================================================ */
function latihanKey(cid){ return 'sppt_latihan_' + cid; }
function getLatihan(cid){
  try {
    var raw = localStorage.getItem(latihanKey(cid));
    var data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.items)) return {items:[]};
    return data;
  } catch(e){ return {items:[]}; }
}
function setLatihan(cid, data){
  try {
    localStorage.setItem(latihanKey(cid), JSON.stringify(data));
    window.fbSet('jadwal_latihan', cid, {classId: cid, items: data.items||[]});
  } catch(e){ console.error(e); }
}

window.openJadwalLatihan = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var myRole = uRole();
  var canEdit = isGuru() || myRole === 'sutradara' || myRole === 'asisten_sutradara';
  var data = getLatihan(cid);
  var items = (data.items||[]).slice().sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });

  var h = '';
  h += '<div class="alert alert-info">'+ic('calendar')+'<div><b>Jadwal Latihan</b><br><small>'+(canEdit?'Bisa edit':'Hanya lihat')+'</small></div></div>';

  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" onclick="openAddJadwalLatihan(\''+cid+'\')">'+ic('plus','sm')+' Tambah Jadwal</button>';
  }

  if (items.length === 0){
    h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada jadwal latihan</p></div>';
  } else {
    items.forEach(function(it){
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">' +
        '<div style="font-weight:700;font-size:13px;">'+esc(it.title||'Latihan')+'</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">' +
          ic('calendar','sm')+' '+fmtDateShort(it.date)+
          (it.time ? ' &middot; '+ic('clock','sm')+' '+esc(it.time) : '') +
        '</div>' +
        (it.adegan ? '<div style="font-size:12px;margin-top:6px;">Adegan: <b>'+esc(it.adegan)+'</b></div>' : '') +
        (it.pemain ? '<div style="font-size:11.5px;margin-top:3px;">Pemain: '+esc(it.pemain)+'</div>' : '') +
        (it.note ? '<div style="font-size:12px;margin-top:6px;padding:8px;background:var(--surface);border-radius:6px;">'+esc(it.note)+'</div>' : '') +
        (canEdit ? '<div class="action-row" style="margin-top:8px;"><button class="btn btn-sm btn-danger" onclick="delJadwalLatihan(\''+cid+'\',\''+it.id+'\')">'+ic('trash','sm')+'</button></div>' : '') +
      '</div>';
    });
  }

  openModal('Jadwal Latihan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openAddJadwalLatihan = function(cid){
  openModal('Tambah Jadwal Latihan',
    '<div class="form-group"><label>Judul Sesi</label><input id="jl-title" maxlength="120" placeholder="Contoh: Latihan Rutin #1"></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="jl-date" value="'+isoToday()+'"></div>' +
    '<div class="form-group"><label>Jam</label><input type="time" id="jl-time" value="15:00"></div>' +
    '<div class="form-group"><label>Adegan yang Dilatih</label><input id="jl-adegan" maxlength="150"></div>' +
    '<div class="form-group"><label>Pemain Hadir</label><textarea id="jl-pemain" rows="2" maxlength="300"></textarea></div>' +
    '<div class="form-group"><label>Catatan Sutradara</label><textarea id="jl-note" rows="3" maxlength="500"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveJadwalLatihan(\''+cid+'\')">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.saveJadwalLatihan = function(cid){
  var title = (document.getElementById('jl-title').value||'').trim();
  var date = document.getElementById('jl-date').value;
  var time = document.getElementById('jl-time').value;
  var adegan = (document.getElementById('jl-adegan').value||'').trim();
  var pemain = (document.getElementById('jl-pemain').value||'').trim();
  var note = (document.getElementById('jl-note').value||'').trim();
  if (!title || !date){ alert('Judul & tanggal wajib'); return; }
  var data = getLatihan(cid);
  data.items.push({id:uid(), title:title, date:date, time:time, adegan:adegan, pemain:pemain, note:note, createdBy:u().name, createdAt:Date.now()});
  setLatihan(cid, data);
  logAct('jadwal_latihan', u().name+' tambah jadwal latihan: '+title, {classId:cid});
  closeModal();
  alert('Jadwal tersimpan');
  setTimeout(function(){ window.openJadwalLatihan(cid); }, 200);
};

window.delJadwalLatihan = function(cid, itemId){
  if (!confirm('Hapus jadwal ini?')) return;
  var data = getLatihan(cid);
  data.items = data.items.filter(function(x){ return x.id !== itemId; });
  setLatihan(cid, data);
  setTimeout(function(){ window.openJadwalLatihan(cid); }, 200);
};

/* ============================================================
   5. LAPORAN LATIHAN HARIAN
   ============================================================ */
function laporanKey(cid){ return 'sppt_laporan_' + cid; }
function getLaporan(cid){
  try {
    var raw = localStorage.getItem(laporanKey(cid));
    var data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.items)) return {items:[]};
    return data;
  } catch(e){ return {items:[]}; }
}
function setLaporan(cid, data){
  try {
    localStorage.setItem(laporanKey(cid), JSON.stringify(data));
    window.fbSet('laporan_latihan', cid, {classId: cid, items: data.items||[]});
  } catch(e){ console.error(e); }
}

window.openLaporanLatihan = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var myRole = uRole();
  var canCreate = isGuru() || myRole === 'sutradara' || myRole === 'asisten_sutradara';
  var data = getLaporan(cid);
  var items = (data.items||[]).slice().sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });

  var h = '';
  h += '<div class="alert alert-info">'+ic('fileText')+'<div><b>Laporan Latihan Harian</b><br><small>'+(canCreate?'Bisa buat laporan':'Hanya lihat')+'</small></div></div>';

  if (canCreate){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" onclick="openAddLaporan(\''+cid+'\')">'+ic('plus','sm')+' Buat Laporan Baru</button>';
  }

  if (items.length === 0){
    h += '<div class="empty-state">'+ic('fileText',40)+'<p>Belum ada laporan</p></div>';
  } else {
    items.forEach(function(l){
      h += '<div class="card card-accent blue" style="margin-bottom:10px;">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
          '<div style="font-weight:700;font-size:13.5px;">'+ic('calendar','sm')+' '+fmtDateShort(l.date)+'</div>' +
          (canCreate ? '<button class="btn btn-sm btn-danger" onclick="delLaporan(\''+cid+'\',\''+l.id+'\')">'+ic('trash','sm')+'</button>' : '') +
        '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">Oleh: <b>'+esc(l.createdBy||'-')+'</b></div>' +
        '<div style="font-size:12.5px;line-height:1.6;">' +
          (l.adegan ? '<div><b>Adegan:</b> '+esc(l.adegan)+'</div>' : '') +
          (l.hadir ? '<div><b>Hadir:</b> '+esc(l.hadir)+'</div>' : '') +
          (l.tidakHadir ? '<div><b>Tidak Hadir:</b> '+esc(l.tidakHadir)+'</div>' : '') +
        '</div>' +
        (l.catatan ? '<div style="margin-top:8px;padding:8px;background:var(--surface);border-left:3px solid var(--primary);border-radius:6px;font-size:12.5px;white-space:pre-wrap;">' +
          '<b>Catatan:</b><br>'+esc(l.catatan)+'</div>' : '') +
        (l.kendala ? '<div style="margin-top:6px;padding:8px;background:var(--danger-soft);border-left:3px solid var(--danger);border-radius:6px;font-size:12.5px;white-space:pre-wrap;">' +
          '<b>Kendala:</b><br>'+esc(l.kendala)+'</div>' : '') +
      '</div>';
    });
  }

  openModal('Laporan Latihan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openAddLaporan = function(cid){
  openModal('Buat Laporan Latihan',
    '<div class="form-group"><label>Tanggal</label><input type="date" id="lap-date" value="'+isoToday()+'"></div>' +
    '<div class="form-group"><label>Adegan yang Dilatih</label><input id="lap-adegan" maxlength="150"></div>' +
    '<div class="form-group"><label>Pemain Hadir</label><textarea id="lap-hadir" rows="2" maxlength="300"></textarea></div>' +
    '<div class="form-group"><label>Pemain Tidak Hadir</label><textarea id="lap-tidak" rows="2" maxlength="300"></textarea></div>' +
    '<div class="form-group"><label>Catatan Sutradara</label><textarea id="lap-catatan" rows="4" maxlength="500"></textarea></div>' +
    '<div class="form-group"><label>Kendala (opsional)</label><textarea id="lap-kendala" rows="2" maxlength="300"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveLaporan(\''+cid+'\')">'+ic('save')+' Simpan Laporan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.saveLaporan = function(cid){
  var date = document.getElementById('lap-date').value;
  var adegan = (document.getElementById('lap-adegan').value||'').trim();
  var hadir = (document.getElementById('lap-hadir').value||'').trim();
  var tidakHadir = (document.getElementById('lap-tidak').value||'').trim();
  var catatan = (document.getElementById('lap-catatan').value||'').trim();
  var kendala = (document.getElementById('lap-kendala').value||'').trim();
  if (!date || !adegan){ alert('Tanggal & adegan wajib'); return; }
  var data = getLaporan(cid);
  data.items.push({
    id: uid(), date: date, adegan: adegan, hadir: hadir, tidakHadir: tidakHadir,
    catatan: catatan, kendala: kendala,
    createdBy: u().name, creatorRole: uRole(),
    createdAt: Date.now()
  });
  setLaporan(cid, data);
  logAct('laporan_buat', u().name+' buat laporan latihan: '+adegan, {classId:cid});
  closeModal();
  alert('Laporan tersimpan');
  setTimeout(function(){ window.openLaporanLatihan(cid); }, 200);
};

window.delLaporan = function(cid, itemId){
  if (!confirm('Hapus laporan ini?')) return;
  var data = getLaporan(cid);
  data.items = data.items.filter(function(x){ return x.id !== itemId; });
  setLaporan(cid, data);
  setTimeout(function(){ window.openLaporanLatihan(cid); }, 200);
};

/* ============================================================
   6. BOOKING ALAT MUSIK + CONFLICT DETECTION
   ============================================================ */
var BOOKING_ROLES = ['pimpinan_produksi','koor_musik','sutradara','koor_perlengkapan'];

window.openBookingAlat = function(){
  var myRole = uRole();
  var canAccess = isGuru() || BOOKING_ROLES.indexOf(myRole) >= 0;
  if (!canAccess){
    alert('Fitur ini hanya untuk:\n\u2022 Pimpinan Produksi\n\u2022 Koor Musik\n\u2022 Sutradara\n\u2022 Koor Perlengkapan\n\u2022 Guru/Admin');
    return;
  }

  var cid = uCid();
  var allBookings = Object.values(window.DB.bookings || {}).sort(function(a,b){
    return String(a.date+a.startTime).localeCompare(String(b.date+b.startTime));
  });

  var h = '';
  h += '<div class="alert alert-info">'+ic('briefcase')+'<div><b>Booking Alat Musik</b><br><small>'+allBookings.length+' booking aktif</small></div></div>';

  // Filter kelas
  h += '<div class="form-group"><label>Filter</label>' +
    '<select id="bk-filter" onchange="renderBookingList(\''+(cid||'')+'\')">' +
    '<option value="all">Semua Kelas</option>' +
    '<option value="mine">Kelas Saya</option>' +
    '</select></div>';

  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" onclick="openAddBooking(\''+(cid||'')+'\')">'+ic('plus','sm')+' Booking Baru</button>';

  h += '<div id="bk-list"></div>';

  openModal('Booking Alat Musik', h);
  setTimeout(function(){ renderBookingList(cid); }, 100);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.renderBookingList = function(myCid){
  var el = document.getElementById('bk-list');
  if (!el) return;
  var filter = document.getElementById('bk-filter') ? document.getElementById('bk-filter').value : 'all';
  var bookings = Object.values(window.DB.bookings || {});
  if (filter === 'mine' && myCid){
    bookings = bookings.filter(function(b){ return b.classId === myCid; });
  }
  bookings.sort(function(a,b){
    return String(a.date+a.startTime).localeCompare(String(b.date+b.startTime));
  });

  if (bookings.length === 0){
    el.innerHTML = '<div class="empty-state">'+ic('briefcase',40)+'<p>Belum ada booking</p></div>';
    return;
  }

  var h = '';
  bookings.forEach(function(b){
    var isMine = b.classId === myCid;
    var canDelete = isGuru() || isMine || b.bookedById === uSid();
    var today = isoToday();
    var status = b.date < today ? 'Selesai' : b.date === today ? 'Hari ini' : 'Akan datang';
    var color = status === 'Selesai' ? 'gray' : status === 'Hari ini' ? 'warning' : 'primary';

    h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--'+color+');">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
        '<div style="font-weight:700;font-size:13.5px;">'+esc(b.alat)+'</div>' +
        '<span class="badge badge-'+color+'">'+status+'</span>' +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);">' +
        ic('calendar','sm')+' '+fmtDateShort(b.date)+
        ' &middot; '+ic('clock','sm')+' '+esc(b.startTime||'-')+' - '+esc(b.endTime||'-') +
      '</div>' +
      '<div style="font-size:11.5px;margin-top:4px;">' +
        'Kelas: <b>'+esc(b.namaKelas||'-')+'</b> &middot; PIC: '+esc(b.bookedBy||'-') +
        (isMine ? ' <span class="badge badge-primary" style="font-size:9px;">Kelas Anda</span>' : '') +
      '</div>' +
      (b.notes ? '<div style="font-size:12px;margin-top:6px;padding:8px;background:var(--surface);border-radius:6px;">'+esc(b.notes)+'</div>' : '') +
      (canDelete ? '<div class="action-row" style="margin-top:8px;"><button class="btn btn-sm btn-danger" onclick="delBooking(\''+b.id+'\')">'+ic('trash','sm')+' Hapus</button></div>' : '') +
    '</div>';
  });
  el.innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons(el);
};

window.openAddBooking = function(myCid){
  var classes = window.DB.classes || [];
  var opts = classes.map(function(c){
    return '<option value="'+c.id+'"'+(c.id===myCid?' selected':'')+'>'+esc(c.name)+'</option>';
  }).join('');

  openModal('Booking Alat Musik',
    '<div class="form-group"><label>Nama Alat</label><input id="bk-alat" maxlength="100" placeholder="Contoh: Gitar Akustik"></div>' +
    '<div class="form-group"><label>Kelas</label><select id="bk-kelas">'+opts+'</select></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="bk-date" value="'+isoToday()+'"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group"><label>Jam Mulai</label><input type="time" id="bk-start" value="15:00"></div>' +
    '<div class="form-group"><label>Jam Selesai</label><input type="time" id="bk-end" value="16:00"></div>' +
    '</div>' +
    '<div class="form-group"><label>Catatan (opsional)</label><textarea id="bk-notes" rows="2" maxlength="200"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanBooking()">'+ic('save')+' Booking</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanBooking = function(){
  var alat = (document.getElementById('bk-alat').value||'').trim();
  var cid = document.getElementById('bk-kelas').value;
  var date = document.getElementById('bk-date').value;
  var start = document.getElementById('bk-start').value;
  var end = document.getElementById('bk-end').value;
  var notes = (document.getElementById('bk-notes').value||'').trim();

  if (!alat || !cid || !date || !start || !end){ alert('Lengkapi semua field'); return; }
  if (start >= end){ alert('Jam selesai harus lebih besar dari jam mulai'); return; }

  // Conflict detection
  var all = Object.values(window.DB.bookings || {});
  var conflict = all.find(function(b){
    if (b.alat.toLowerCase() !== alat.toLowerCase()) return false;
    if (b.date !== date) return false;
    // Time overlap: [start, end) vs [b.startTime, b.endTime)
    return !(end <= b.startTime || start >= b.endTime);
  });

  if (conflict){
    var confClass = findClass(conflict.classId);
    var confMsg = 'BENTROK JADWAL!\n\n' +
      'Alat: '+conflict.alat+'\n' +
      'Tanggal: '+fmtDateShort(conflict.date)+'\n' +
      'Waktu: '+conflict.startTime+' - '+conflict.endTime+'\n' +
      'Dipakai: '+(confClass ? confClass.name : '-')+'\n\n' +
      'Pilih waktu lain.';
    alert(confMsg);
    return;
  }

  var c = findClass(cid);
  var id = uid();
  var booking = {
    id: id, alat: alat, classId: cid, namaKelas: c ? c.name : '-',
    date: date, startTime: start, endTime: end, notes: notes,
    bookedBy: u().name, bookedById: uSid() || u().email,
    createdAt: Date.now()
  };

  window.fbSet('bookings', id, booking).then(function(){
    logAct('booking_add', u().name+' booking '+alat+' ('+date+' '+start+'-'+end+')', {classId:cid});
    closeModal();
    alert('Booking berhasil!');
    setTimeout(function(){ window.openBookingAlat(); }, 200);
  }).catch(function(e){ alert('Gagal: '+e.message); });
};

window.delBooking = function(bookingId){
  var b = (window.DB.bookings || {})[bookingId];
  if (!b) return;
  if (!confirm('Hapus booking "'+b.alat+'" pada '+fmtDateShort(b.date)+'?')) return;
  window.fbDel('bookings', bookingId).then(function(){
    logAct('booking_delete', u().name+' hapus booking: '+b.alat, {classId:b.classId});
    closeModal();
    setTimeout(function(){ window.openBookingAlat(); }, 200);
  });
};

/* ============================================================
   7. CAROUSEL INJECT (Timeline + Jadwal)
   ============================================================ */
window.injectCarouselSchedule = function(){
  if (!window.currentUser) return;
  var mc = document.getElementById('main-content');
  if (!mc) return;
  if (mc.querySelector('.dash-carousel-wrap')) return;

  var cid = uCid();
  if (!cid) return;
  var c = findClass(cid);
  if (!c) return;

  var stages = (window.DB.stages || []).filter(function(s){
    return window.isStageActive ? window.isStageActive(cid, s.id) : false;
  });
  var meetings = Object.values(window.DB.meetings || {}).filter(function(m){ return m.classId === cid; });
  var konten = getKonten(cid).items || [];
  var latihan = getLatihan(cid).items || [];

  var h = '';
  h += '<div class="dash-carousel-wrap" style="margin:16px 0;">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">';
  h += '<h3 style="font-size:14.5px;font-weight:800;display:flex;align-items:center;gap:8px;margin:0;">'+ic('layers')+' Timeline &amp; Jadwal</h3>';
  h += '<div style="display:flex;gap:4px;background:var(--surface);padding:4px;border-radius:10px;overflow-x:auto;">';
  h += '<button class="carousel-tab active" data-tab="0" type="button" style="background:var(--card);color:var(--primary);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('calendar','sm')+' Jadwal</button>';
  h += '<button class="carousel-tab" data-tab="1" type="button" style="background:none;color:var(--text-muted);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('layers','sm')+' Timeline</button>';
  h += '<button class="carousel-tab" data-tab="2" type="button" style="background:none;color:var(--text-muted);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('image','sm')+' Konten</button>';
  h += '</div></div>';

  h += '<div class="carousel-track-schedule" id="carousel-track-m6" style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:0;border-radius:12px;touch-action:pan-x pan-y;">';

  // Slide 1: Jadwal (meetings + latihan)
  h += '<div style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  if (meetings.length === 0 && latihan.length === 0){
    h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada jadwal</p></div>';
  } else {
    var allEvents = [];
    meetings.forEach(function(m){ allEvents.push({date:m.date||'', title:m.title, type:m.type||'Sesi', time:(m.openTime||'')+'-'+(m.closeTime||'')}); });
    latihan.forEach(function(l){ allEvents.push({date:l.date||'', title:l.title, type:'Latihan', time:l.time||''}); });
    allEvents.sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });
    allEvents.slice(0, 5).forEach(function(e){
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--primary);">' +
        '<div style="font-weight:700;font-size:12.5px;">'+esc(e.title)+'</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:3px;">'+esc(e.type)+' &middot; '+fmtDateShort(e.date)+(e.time?' &middot; '+esc(e.time):'')+'</div>' +
      '</div>';
    });
  }
  h += '</div>';

  // Slide 2: Timeline (stages)
  h += '<div style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  if (stages.length === 0){
    h += '<div class="empty-state">'+ic('layers',40)+'<p>Belum ada tahap aktif</p></div>';
  } else {
    stages.forEach(function(s, i){
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--success);">' +
        '<div style="font-weight:700;font-size:12.5px;">'+(i+1)+'. '+esc(s.name)+'</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">'+esc(s.subtitle||'')+' &middot; Bobot '+s.weight+'%</div>' +
      '</div>';
    });
  }
  h += '</div>';

  // Slide 3: Konten (kalender konten)
  h += '<div style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  if (konten.length === 0){
    h += '<div class="empty-state">'+ic('image',40)+'<p>Belum ada konten</p></div>';
  } else {
    konten.slice(0, 5).forEach(function(k){
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--info);">' +
        '<div style="font-weight:700;font-size:12.5px;">'+esc(k.title)+'</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">'+esc(k.platform)+' &middot; '+fmtDateShort(k.date)+'</div>' +
      '</div>';
    });
  }
  h += '</div>';

  h += '</div>';

  // Dots
  h += '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;">';
  h += '<button class="carousel-dot-m6 active" data-dot="0" type="button" style="width:8px;height:8px;border-radius:50%;background:var(--primary);border:none;cursor:pointer;padding:0;"></button>';
  h += '<button class="carousel-dot-m6" data-dot="1" type="button" style="width:8px;height:8px;border-radius:50%;background:var(--border-strong);border:none;cursor:pointer;padding:0;"></button>';
  h += '<button class="carousel-dot-m6" data-dot="2" type="button" style="width:8px;height:8px;border-radius:50%;background:var(--border-strong);border:none;cursor:pointer;padding:0;"></button>';
  h += '</div>';

  h += '</div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = h;
  var el = wrap.firstElementChild;

  // Insert setelah toolbar
  var ref = mc.querySelector('.extras-toolbar-top');
  if (ref && ref.parentNode){
    ref.parentNode.insertBefore(el, ref.nextSibling);
  } else {
    mc.insertBefore(el, mc.firstChild);
  }

  setTimeout(setupCarouselM6, 100);
  setTimeout(setupCarouselM6, 500);
};

function setupCarouselM6(){
  var track = document.getElementById('carousel-track-m6');
  if (!track) return;
  var tabs = document.querySelectorAll('.carousel-tab');
  var dots = document.querySelectorAll('.carousel-dot-m6');
  function goTo(i){ track.scrollTo({left: track.clientWidth * i, behavior:'smooth'}); }
  tabs.forEach(function(t){ t.onclick = function(){ goTo(parseInt(t.dataset.tab,10)); }; });
  dots.forEach(function(d){ d.onclick = function(){ goTo(parseInt(d.dataset.dot,10)); }; });
  var timer = null;
  track.onscroll = function(){
    if (timer) clearTimeout(timer);
    timer = setTimeout(function(){
      var idx = Math.round(track.scrollLeft / track.clientWidth);
      tabs.forEach(function(t, i){
        t.style.background = i === idx ? 'var(--card)' : 'none';
        t.style.color = i === idx ? 'var(--primary)' : 'var(--text-muted)';
      });
      dots.forEach(function(d, i){
        d.style.background = i === idx ? 'var(--primary)' : 'var(--border-strong)';
      });
    }, 60);
  };
}

// Auto-inject carousel
setTimeout(window.injectCarouselSchedule, 1500);
setTimeout(window.injectCarouselSchedule, 3000);

(function(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(window.injectCarouselSchedule, 500);
    setTimeout(window.injectCarouselSchedule, 1500);
    return ret;
  };
})();

/* ============================================================
   EXPORTS
   ============================================================ */
window.getMasterSchedule = getMS;
window.getJadwalDivisi = getJadwal;
window.getKalenderKonten = getKonten;
window.getJadwalLatihanData = getLatihan;
window.getLaporanLatihanData = getLaporan;

console.log('[features-schedule] M6 loaded');

})();
