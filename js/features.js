/* ============================================================
   SP-PPT features.js — v12.0
   Fitur: Checklist, Absensi, Naskah, Booking, Koordinasi,
          Struktur, Templates, Rekap, Penilaian, Dokumentasi
   ============================================================ */
(function(){
'use strict';

function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return String(s==null?'':s).replace(/[<>&"']/g, function(c){
  return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c];
}); }
function uid(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t, b){ if (window.openModal) window.openModal(t, b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function getRubricFor(r){ return window.getRubricFor ? window.getRubricFor(r) : []; }
function canEval(eRole, tRole){
  if (eRole==='guru'||eRole==='admin') return true;
  if (tRole==='pimpinan_produksi') return true; // semua nilai pimpro
  if (tRole==='sutradara') return ['pimpinan_produksi','asisten_sutradara','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','pemain'].indexOf(eRole)>=0;
  if (tRole.indexOf('koor_')===0){
    var base = tRole.substring(5);
    return eRole==='sutradara'||eRole==='pimpinan_produksi'||eRole==='asisten_sutradara'||eRole==='anggota_'+base;
  }
  if (tRole.indexOf('anggota_')===0){
    var base2 = tRole.substring(8);
    return eRole==='koor_'+base2||eRole==='anggota_'+base2;
  }
  if (tRole==='pemain') return eRole==='sutradara'||eRole==='asisten_sutradara'||eRole==='pemain';
  if (tRole==='sekretaris'||tRole==='bendahara') return eRole==='pimpinan_produksi';
  if (tRole==='asisten_sutradara') return eRole==='sutradara';
  return true;
}

/* ========== SISTEM TAHAPAN ========== */
window.openSistemTahapan = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var stages = window.DB.stages || [];
  var activeIds = (window.DB.activeStages[cid] && window.DB.activeStages[cid].activeIds) || [];
  var canEdit = isGuru() || uRole()==='pimpinan_produksi' || uRole()==='sutradara';

  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Sistem Tahapan</b> - '+activeIds.length+'/'+stages.length+' aktif</div></div>';
  if (canEdit){
    h += '<div class="action-row" style="margin-bottom:12px;">' +
      '<button class="btn btn-primary btn-sm" onclick="openTambahTahapan()">'+ic('plus','sm')+' Tambah</button>' +
      '</div>';
  }
  stages.forEach(function(stage, i){
    var isActive = activeIds.indexOf(stage.id)>=0;
    h += '<div class="stage-manage-item">' +
      '<div class="num">'+(i+1)+'</div>' +
      '<div class="info"><strong>'+esc(stage.name)+'</strong><small>'+esc(stage.subtitle||'')+'</small></div>' +
      '<span class="weight-tag">'+stage.weight+'%</span>' +
      (isActive ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-gray">Belum</span>') +
      (canEdit ? '<label class="switch"><input type="checkbox" '+(isActive?'checked':'')+' onchange="toggleTahapan(\''+cid+'\',\''+stage.id+'\',this.checked)"><span class="slider"></span></label>' : '') +
      '</div>';
  });
  openModal('Sistem Tahapan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.toggleTahapan = function(cid, sid, checked){
  var cur = (window.DB.activeStages[cid] && window.DB.activeStages[cid].activeIds) || [];
  if (!Array.isArray(cur)) cur = [];
  var nw = checked ? cur.concat([sid]).filter(function(v,i,a){ return a.indexOf(v)===i; }) : cur.filter(function(x){ return x!==sid; });
  window.fbSet('activeStages', cid, {classId:cid, activeIds:nw, updatedAt:Date.now()}).then(function(){
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.openTambahTahapan = function(){
  openModal('Tambah Tahapan',
    '<div class="form-group"><label>Nama</label><input id="stg-name"></div>' +
    '<div class="form-group"><label>Sub-Judul</label><input id="stg-sub"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="stg-desc" rows="2"></textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label><input type="number" id="stg-w" value="10" min="1" max="100"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanTahapan()">'+ic('save')+' Simpan</button>');
};
window.simpanTahapan = function(){
  var n = document.getElementById('stg-name').value.trim();
  var su = document.getElementById('stg-sub').value.trim();
  var d = document.getElementById('stg-desc').value.trim();
  var w = parseFloat(document.getElementById('stg-w').value) || 10;
  if (!n){ alert('Nama wajib'); return; }
  var stages = (window.DB.stages||[]).concat([{id:'stage_'+Date.now().toString(36), name:n, subtitle:su, description:d, longDesc:d, weight:w}]);
  window.fbSet('config', 'stages', {stages:stages}).then(function(){
    closeModal(); alert('Tahapan ditambahkan');
  });
};

/* ========== CHECKLIST PRIBADI ========== */
window.openChecklistPribadi = function(){
  var cid = uCid();
  if (!cid) return;
  var items = ((window.DB.checklists && window.DB.checklists[cid] && window.DB.checklists[cid].items) || []).filter(function(it){ return it.isPersonal && it.ownerId===uSid(); });
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Checklist pribadi Anda</div></div>';
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahChecklistPribadi()">'+ic('plus','sm')+' Tambah</button>';
  if (items.length===0) h += '<div class="empty-state">'+ic('checkSquare',40)+'<p>Belum ada tugas</p></div>';
  else {
    var done = items.filter(function(x){ return x.done; }).length;
    h += '<div class="progress-container"><div class="progress-bar '+(done===items.length?'complete':'partial')+'" style="width:'+Math.round(done/items.length*100)+'%"></div></div>';
    h += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">'+done+'/'+items.length+' selesai</div>';
    items.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:10px;padding:9px;background:var(--surface);border-radius:6px;margin-bottom:5px;">' +
        '<input type="checkbox" '+(it.done?'checked':'')+' onchange="toggleChecklistPribadi(\''+it.id+'\',this.checked)">' +
        '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(it.name)+'</div>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusChecklistPribadi(\''+it.id+'\')">'+ic('trash','sm')+'</button></div>';
    });
  }
  openModal('Checklist Saya', h);
};
window.openTambahChecklistPribadi = function(){
  openModal('Tambah Tugas',
    '<div class="form-group"><label>Nama Tugas</label><input id="cp-name"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanChecklistPribadi()">'+ic('save')+' Simpan</button>');
};
window.simpanChecklistPribadi = function(){
  var n = document.getElementById('cp-name').value.trim();
  if (!n) return;
  var cid = uCid();
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.concat([{id:uid(), name:n, isPersonal:true, ownerId:uSid(), ownerName:u().name, done:false, createdAt:Date.now()}]);
  window.fbSet('checklists', cid, {classId:cid, items:items}).then(function(){
    closeModal(); setTimeout(window.openChecklistPribadi, 200);
  });
};
window.toggleChecklistPribadi = function(itemId, checked){
  var cid = uCid();
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.map(function(it){ return it.id===itemId ? Object.assign({}, it, {done:checked, doneAt:checked?Date.now():null}) : it; });
  window.fbSet('checklists', cid, {classId:cid, items:items});
};
window.hapusChecklistPribadi = function(itemId){
  if (!confirm('Hapus?')) return;
  var cid = uCid();
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.filter(function(it){ return it.id!==itemId; });
  window.fbSet('checklists', cid, {classId:cid, items:items}).then(function(){ setTimeout(window.openChecklistPribadi, 200); });
};

/* ========== CHECKLIST TIM ========== */
window.openChecklistTim = function(){
  var cid = uCid();
  if (!cid) return;
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var myRole = uRole();
  var items = ch.filter(function(it){ return !it.isPersonal && (it.assignedRole===myRole || it.assignedRole==='umum' || isGuru()); });
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Checklist tim untuk peran Anda</div></div>';
  if (items.length===0) h += '<div class="empty-state">'+ic('users',40)+'<p>Belum ada checklist</p></div>';
  else {
    var byRole = {};
    items.forEach(function(it){ var r = it.assignedRole||'umum'; if (!byRole[r]) byRole[r]=[]; byRole[r].push(it); });
    Object.keys(byRole).forEach(function(rk){
      var label = (window.ROLES[rk]&&window.ROLES[rk].label)||rk;
      h += '<div class="card" style="margin-bottom:10px;"><h3 style="font-size:13px;">'+esc(label)+'</h3>';
      byRole[rk].forEach(function(it){
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed var(--border);">' +
          '<input type="checkbox" '+(it.done?'checked':'')+' onchange="toggleChecklistTim(\''+it.id+'\',this.checked)">' +
          '<div style="flex:1;font-size:12.5px;">'+esc(it.name)+'</div></div>';
      });
      h += '</div>';
    });
  }
  openModal('Checklist Tim', h);
};
window.toggleChecklistTim = function(itemId, checked){
  var cid = uCid();
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.map(function(it){ return it.id===itemId ? Object.assign({}, it, {done:checked, doneBy:checked?u().name:null, doneAt:checked?Date.now():null}) : it; });
  window.fbSet('checklists', cid, {classId:cid, items:items});
};

/* ========== CHECKLIST MANAGE (Guru) ========== */
window.openChecklistManage = function(cid){
  cid = cid || uCid();
  if (!cid) return;
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.filter(function(it){ return !it.isPersonal; });
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Kelola Checklist</b> - '+items.length+' item</div></div>';
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahChecklistItem(\''+cid+'\')">'+ic('plus','sm')+' Tambah Item</button>';
  if (items.length===0) h += '<div class="empty-state">'+ic('clipboard',40)+'<p>Belum ada item</p></div>';
  else {
    items.forEach(function(it){
      var rl = (window.ROLES[it.assignedRole]&&window.ROLES[it.assignedRole].label)||it.assignedRole||'umum';
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--surface);border-radius:6px;margin-bottom:5px;">' +
        '<div style="flex:1;"><div style="font-size:12.5px;font-weight:600;">'+esc(it.name)+'</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">'+esc(rl)+'</div></div>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusChecklistItem(\''+cid+'\',\''+it.id+'\')">'+ic('trash','sm')+'</button></div>';
    });
  }
  openModal('Kelola Checklist', h);
};
window.openTambahChecklistItem = function(cid){
  var opts = '';
  Object.keys(window.ROLES).forEach(function(k){ opts += '<option value="'+k+'">'+window.ROLES[k].label+'</option>'; });
  opts += '<option value="umum">Umum (semua)</option>';
  openModal('Tambah Item Checklist',
    '<div class="form-group"><label>Nama Tugas</label><input id="cli-name"></div>' +
    '<div class="form-group"><label>Untuk Peran</label><select id="cli-role">'+opts+'</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanChecklistItem(\''+cid+'\')">'+ic('save')+' Simpan</button>');
};
window.simpanChecklistItem = function(cid){
  var n = document.getElementById('cli-name').value.trim();
  var r = document.getElementById('cli-role').value;
  if (!n) return;
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.concat([{id:uid(), name:n, assignedRole:r, done:false, createdAt:Date.now(), isPersonal:false, createdBy:u().name}]);
  window.fbSet('checklists', cid, {classId:cid, items:items}).then(function(){
    closeModal(); setTimeout(function(){ window.openChecklistManage(cid); }, 200);
  });
};
window.hapusChecklistItem = function(cid, itemId){
  if (!confirm('Hapus?')) return;
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var items = ch.filter(function(x){ return x.id!==itemId; });
  window.fbSet('checklists', cid, {classId:cid, items:items}).then(function(){ setTimeout(function(){ window.openChecklistManage(cid); }, 200); });
};

/* ========== ABSENSI ========== */
window.openMeetingList = function(cid){
  cid = cid || uCid();
  if (!cid) return;
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){ return m.classId===cid; });
  var role = uRole();
  var canCreateRapat = role==='sekretaris'||role==='pimpinan_produksi'||isGuru();
  var canCreateLatihan = role==='sutradara'||role==='asisten_sutradara'||isGuru();
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Daftar Sesi Absensi</div></div>';
  h += '<div class="action-row" style="margin-bottom:12px;">';
  if (canCreateRapat) h += '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'rapat\',\''+cid+'\')">'+ic('plus','sm')+' Buat Rapat</button>';
  if (canCreateLatihan) h += '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'latihan\',\''+cid+'\')">'+ic('plus','sm')+' Buat Latihan</button>';
  h += '</div>';
  if (meetings.length===0) h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada sesi</p></div>';
  else {
    meetings.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).forEach(function(m){
      h += '<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;">'+esc(m.title)+'</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(m.type||'')+' - '+esc(m.date||'')+'</div>' +
        '<button class="btn btn-sm btn-primary" style="margin-top:8px;" onclick="openIsiAbsensi(\''+m.id+'\')">'+ic('edit','sm')+' Isi Absensi</button></div>';
    });
  }
  openModal('Absensi', h);
};
window.openBuatMeeting = function(type, cid){
  openModal('Buat Sesi '+(type==='rapat'?'Rapat':'Latihan'),
    '<div class="form-group"><label>Judul</label><input id="mt-title"></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="mt-date" value="'+new Date().toISOString().split('T')[0]+'"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanMeeting(\''+type+'\',\''+cid+'\')">'+ic('save')+' Simpan</button>');
};
window.simpanMeeting = function(type, cid){
  var t = document.getElementById('mt-title').value.trim();
  var d = document.getElementById('mt-date').value;
  if (!t || !d){ alert('Lengkapi'); return; }
  var id = uid();
  window.fbSet('meetings', id, {id:id, title:t, type:type, date:d, classId:cid, records:{}, createdAt:Date.now(), createdBy:u().name}).then(function(){
    closeModal(); setTimeout(function(){ window.openMeetingList(cid); }, 200);
  });
};
window.openIsiAbsensi = function(mid){
  var m = window.DB.meetings[mid];
  if (!m) return;
  var c = window.DB.classes.find(function(x){ return x.id===m.classId; });
  if (!c) return;
  var sid = uSid();
  if (isSiswa()){
    var cur = (m.records && m.records[sid]) || '';
    var opts = [{v:'hadir',l:'Hadir'},{v:'izin',l:'Izin'},{v:'sakit',l:'Sakit'},{v:'telat',l:'Telat'},{v:'alpa',l:'Alpa'}];
    var h = '<div class="alert alert-info">'+ic('info')+'<div><b>'+esc(m.title)+'</b></div></div>';
    opts.forEach(function(o){
      h += '<label style="display:flex;align-items:center;gap:10px;padding:10px;border:1.5px solid '+(cur===o.v?'var(--primary)':'var(--border)')+';border-radius:8px;margin-bottom:6px;cursor:pointer;'+(cur===o.v?'background:var(--primary-soft);':'')+'">' +
        '<input type="radio" name="att" value="'+o.v+'" '+(cur===o.v?'checked':'')+'><b>'+o.l+'</b></label>';
    });
    h += '<button class="btn btn-primary btn-block" onclick="simpanAbsensi(\''+mid+'\')">'+ic('save')+' Simpan</button>';
    openModal('Isi Absensi', h);
  } else {
    var h2 = '<div class="alert alert-info">'+ic('info')+'<div><b>'+esc(m.title)+'</b></div></div>';
    h2 += '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Status</th></tr></thead><tbody>';
    (c.students||[]).forEach(function(s){
      var r = (m.records && m.records[s.id]) || '-';
      h2 += '<tr><td>'+esc(s.name)+'</td><td>'+r+'</td></tr>';
    });
    h2 += '</tbody></table></div>';
    openModal('Absensi', h2);
  }
};
window.simpanAbsensi = function(mid){
  var sel = document.querySelector('input[name="att"]:checked');
  if (!sel){ alert('Pilih status'); return; }
  var m = window.DB.meetings[mid];
  if (!m) return;
  var rec = Object.assign({}, m.records||{});
  rec[uSid()] = sel.value;
  window.fbSet('meetings', mid, {records:rec}).then(function(){ closeModal(); alert('Tersimpan'); });
};

/* ========== NASKAH ========== */
window.openNaskahList = function(cid){
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var naskah = (c.naskah || []);
  var canEdit = uRole()==='sutradara' || isGuru();
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Arsip Naskah Teater</b></div></div>';
  if (canEdit) h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahNaskah(\''+cid+'\')">'+ic('upload','sm')+' Tambah Naskah</button>';
  if (naskah.length===0) h += '<div class="empty-state">'+ic('book',40)+'<p>Belum ada naskah</p></div>';
  else {
    naskah.slice().reverse().forEach(function(n){
      h += '<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;font-size:13.5px;">'+ic('book','sm')+' '+esc(n.title)+'</div>' +
        (n.desc ? '<div style="font-size:12px;color:var(--text-muted);margin:4px 0;">'+esc(n.desc)+'</div>' : '') +
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Oleh '+esc(n.uploadedBy||'-')+'</div>';
      if (n.url) h += '<a href="'+esc(n.url)+'" target="_blank" class="btn btn-sm btn-primary" style="text-decoration:none;">'+ic('upload','sm')+' Buka</a>';
      if (canEdit) h += '<button class="btn btn-sm btn-danger" onclick="hapusNaskah(\''+cid+'\',\''+n.id+'\')">'+ic('trash','sm')+'</button>';
      h += '</div>';
    });
  }
  openModal('Arsip Naskah', h);
};
window.openTambahNaskah = function(cid){
  openModal('Tambah Naskah',
    '<div class="form-group"><label>Judul</label><input id="nk-title"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="nk-desc" rows="2"></textarea></div>' +
    '<div class="form-group"><label>Link Google Drive</label><input id="nk-url" placeholder="https://drive.google.com/..."></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanNaskah(\''+cid+'\')">'+ic('save')+' Simpan</button>');
};
window.simpanNaskah = function(cid){
  var t = document.getElementById('nk-title').value.trim();
  var d = document.getElementById('nk-desc').value.trim();
  var url = document.getElementById('nk-url').value.trim();
  if (!t || !url){ alert('Judul & Link wajib'); return; }
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var ns = (c.naskah||[]).concat([{id:uid(), title:t, desc:d, url:url, uploadedBy:u().name, uploadedAt:Date.now()}]);
  window.fbSet('classes', cid, Object.assign({}, c, {naskah:ns})).then(function(){ closeModal(); setTimeout(function(){ window.openNaskahList(cid); }, 200); });
};
window.hapusNaskah = function(cid, id){
  if (!confirm('Hapus naskah?')) return;
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var ns = (c.naskah||[]).filter(function(x){ return x.id!==id; });
  window.fbSet('classes', cid, Object.assign({}, c, {naskah:ns})).then(function(){ setTimeout(function(){ window.openNaskahList(cid); }, 200); });
};

/* ========== BOOKING ALAT MUSIK ========== */
window.openBookingAlat = function(){
  var canAccess = ['pimpinan_produksi','koor_musik','sutradara','koor_perlengkapan'].indexOf(uRole())>=0 || isGuru();
  if (!canAccess){ alert('Hanya Pimpro, Koor Musik, Sutradara, Koor Perlengkapan'); return; }
  var bookings = Object.values(window.DB.bookings||{}).sort(function(a,b){ return String(a.date||'').localeCompare(String(b.date||'')); });
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Booking Alat Musik</b></div></div>';
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahBooking()">'+ic('plus','sm')+' Booking Baru</button>';
  if (bookings.length===0) h += '<div class="empty-state">'+ic('briefcase',40)+'<p>Belum ada booking</p></div>';
  else {
    bookings.forEach(function(b){
      h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;">'+esc(b.alat)+'</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">'+esc(b.date)+' '+esc(b.startTime)+'-'+esc(b.endTime)+'</div>' +
        '<div style="font-size:11.5px;">Kelas: '+esc(b.namaKelas||'-')+' - '+esc(b.bookedBy||'-')+'</div></div>';
    });
  }
  openModal('Booking Alat Musik', h);
};
window.openTambahBooking = function(){
  var classes = window.DB.classes || [];
  var opts = classes.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join('');
  openModal('Booking Alat Musik',
    '<div class="form-group"><label>Nama Alat</label><input id="bk-alat"></div>' +
    '<div class="form-group"><label>Kelas</label><select id="bk-kelas">'+opts+'</select></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="bk-date" value="'+new Date().toISOString().split('T')[0]+'"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group"><label>Mulai</label><input type="time" id="bk-mulai" value="15:00"></div>' +
    '<div class="form-group"><label>Selesai</label><input type="time" id="bk-selesai" value="16:00"></div></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanBooking()">'+ic('save')+' Simpan</button>');
};
window.simpanBooking = function(){
  var alat = document.getElementById('bk-alat').value.trim();
  var cid = document.getElementById('bk-kelas').value;
  var date = document.getElementById('bk-date').value;
  var start = document.getElementById('bk-mulai').value;
  var end = document.getElementById('bk-selesai').value;
  if (!alat || !cid || !date){ alert('Lengkapi'); return; }
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var id = uid();
  window.fbSet('bookings', id, {id:id, alat:alat, classId:cid, namaKelas:c?c.name:'-', date:date, startTime:start, endTime:end, bookedBy:u().name, createdAt:Date.now()}).then(function(){
    closeModal(); setTimeout(window.openBookingAlat, 200);
  });
};

/* ========== KOORDINASI ANTAR KELAS ========== */
window.openKoordinasi = function(){
  var others = (window.DB.classes||[]).filter(function(c){ return c.id !== uCid(); });
  var msgs = Object.values(window.DB.coordination||{}).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,20);
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Koordinasi Antar Kelas</b></div></div>';
  if (msgs.length>0){
    h += '<div style="max-height:260px;overflow-y:auto;margin-bottom:12px;padding:8px;background:var(--surface);border-radius:8px;">';
    msgs.forEach(function(m){
      h += '<div style="padding:8px;background:var(--card);border-radius:6px;margin-bottom:6px;">' +
        '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(m.fromClassName||'')+' - '+esc(m.fromName||'')+' ke '+esc(m.toClassName||'Semua')+'</div>' +
        '<div style="font-size:12.5px;margin-top:4px;">'+esc(m.message)+'</div></div>';
    });
    h += '</div>';
  }
  h += '<div class="form-group"><label>Kirim Ke Kelas</label><select id="koord-target"><option value="">Semua Kelas</option>' +
    others.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join('') + '</select></div>';
  h += '<div class="form-group"><label>Untuk Peran (opsional)</label><select id="koord-role"><option value="">Semua Peran</option>';
  Object.keys(window.ROLES).forEach(function(k){ h += '<option value="'+k+'">'+esc(window.ROLES[k].label)+'</option>'; });
  h += '</select></div>';
  h += '<div class="form-group"><label>Pesan</label><textarea id="koord-msg" rows="3"></textarea></div>';
  h += '<button class="btn btn-primary btn-block" onclick="kirimKoord()">'+ic('send')+' Kirim</button>';
  openModal('Koordinasi Antar Kelas', h);
};
window.kirimKoord = function(){
  var msg = document.getElementById('koord-msg').value.trim();
  var toCid = document.getElementById('koord-target').value;
  var toRole = document.getElementById('koord-role').value;
  if (!msg){ alert('Pesan kosong'); return; }
  var cid = uCid();
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var toC = toCid ? window.DB.classes.find(function(x){ return x.id===toCid; }) : null;
  var id = uid();
  window.fbSet('coordination', id, {
    id:id, message:msg,
    fromClassId:cid, fromClassName:c?c.name:'-', fromName:u().name, fromRole:uRole(),
    toClassId:toCid||null, toClassName:toC?toC.name:'Semua Kelas', toRole:toRole||null,
    createdAt:Date.now()
  }).then(function(){
    closeModal(); setTimeout(window.openKoordinasi, 200);
  });
};

/* ========== STRUKTUR KERABAT KERJA ========== */
window.openStrukturKerabatKerja = function(cid){
  cid = cid || uCid();
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var canEdit = isGuru() || uRole()==='pimpinan_produksi';
  var h = '';
  // Header dengan logo & nama
  h += '<div style="text-align:center;padding:16px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;margin-bottom:12px;">';
  if (c.kerabatLogo) h += '<img src="'+esc(c.kerabatLogo)+'" style="max-height:80px;border-radius:8px;margin-bottom:8px;">';
  h += '<div style="font-size:18px;font-weight:800;color:#78350f;">'+esc(c.kerabatNama||'Kerabat Kerja '+c.name)+'</div>';
  h += '</div>';
  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openEditKerabat(\''+cid+'\')">'+ic('edit','sm')+' Edit Nama & Logo</button>';
  }
  // List members
  var students = c.students||[];
  var ROLE_ORDER = ['pimpinan_produksi','sutradara','asisten_sutradara','sekretaris','bendahara','koor_publikasi','koor_perlengkapan','koor_akomodasi','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya','pemain'];
  var sorted = students.slice().sort(function(a,b){
    var ia = ROLE_ORDER.indexOf(a.role), ib = ROLE_ORDER.indexOf(b.role);
    if (ia===-1) ia = 999; if (ib===-1) ib = 999;
    return ia-ib;
  });
  sorted.forEach(function(s){
    var rl = (window.ROLES[s.role]&&window.ROLES[s.role].label)||s.role;
    var isMe = s.id===uSid();
    h += '<div class="struktur-member '+(isMe?'me':'')+'">' +
      '<div class="struktur-avatar">'+esc((s.name||'?').charAt(0))+'</div>' +
      '<div style="flex:1;"><div style="font-weight:700;font-size:13px;">'+esc(s.name)+'</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(rl)+'</div></div></div>';
  });
  openModal('Struktur Kerabat Kerja', h);
};
window.openEditKerabat = function(cid){
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  openModal('Edit Kerabat Kerja',
    '<div class="form-group"><label>Nama Kerabat Kerja</label><input id="kk-nama" value="'+esc(c.kerabatNama||'Kerabat Kerja '+c.name)+'"></div>' +
    '<div class="form-group"><label>Logo (URL atau upload)</label><input id="kk-logo" value="'+esc(c.kerabatLogo||'')+'" placeholder="https://... atau upload"></div>' +
    '<div class="form-group"><label>Upload Logo (maks 300KB)</label><input type="file" id="kk-file" accept="image/*"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKerabat(\''+cid+'\')">'+ic('save')+' Simpan</button>');
};
window.simpanKerabat = function(cid){
  var n = document.getElementById('kk-nama').value.trim();
  var logoUrl = document.getElementById('kk-logo').value.trim();
  var fileInput = document.getElementById('kk-file');
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var proceed = function(logoData){
    var upd = Object.assign({}, c, {kerabatNama:n, kerabatLogo:logoData||logoUrl||c.kerabatLogo||''});
    window.fbSet('classes', cid, upd).then(function(){ closeModal(); alert('Tersimpan'); setTimeout(function(){ window.openStrukturKerabatKerja(cid); }, 200); });
  };
  if (fileInput.files && fileInput.files[0]){
    var f = fileInput.files[0];
    if (f.size > 300*1024){ alert('Logo terlalu besar'); return; }
    var r = new FileReader();
    r.onload = function(e){ proceed(e.target.result); };
    r.readAsDataURL(f);
  } else proceed(null);
};

/* ========== REKAP NILAI ========== */
window.openRekapNilai = function(cid){
  cid = cid || uCid();
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var stages = window.getActiveStages(cid);
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Rekap Nilai</b> - Bobot Guru 40% + Ketua 30% + Rekan 30%</div></div>';
  if (stages.length===0){ h += '<div class="empty-state">'+ic('chart',40)+'<p>Belum ada tahap aktif</p></div>'; openModal('Rekap', h); return; }
  h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Peran</th>';
  stages.forEach(function(s){ h += '<th>'+esc(s.name)+'<br><small>('+s.weight+'%)</small></th>'; });
  h += '<th>Nilai Akhir</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(t, i){
    var finalScore = 0;
    h += '<tr><td>'+(i+1)+'</td><td><b>'+esc(t.name)+'</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">'+esc((window.ROLES[t.role]||{}).label||t.role)+'</span></td>';
    stages.forEach(function(s){
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var scores = [];
      for (var eid in ev){
        if (ev[eid] && ev[eid][s.id]){
          var sc = 0, tw = 0;
          getRubricFor(t.role).forEach(function(r){
            var v = ev[eid][s.id][r.id];
            if (typeof v === 'number'){ sc += v * r.weight; tw += r.weight; }
          });
          if (tw > 0) scores.push(sc/tw);
        }
      }
      var avg = scores.length > 0 ? scores.reduce(function(a,b){ return a+b; }, 0) / scores.length : 0;
      finalScore += avg * (s.weight/100);
      var color = avg>=3.5?'badge-success':avg>=2.5?'badge-info':avg>=1.5?'badge-warning':'badge-danger';
      h += '<td><span class="badge '+color+'">'+avg.toFixed(2)+'</span></td>';
    });
    h += '<td><b style="font-size:14px;color:var(--primary);">'+finalScore.toFixed(2)+'</b></td></tr>';
  });
  h += '</tbody></table></div>';
  openModal('Rekap Nilai', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ========== PENILAIAN GURU ========== */
window.openPenilaianGuruDashboard = function(cid){
  cid = cid || uCid();
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var targets = (c.students||[]).filter(function(s){ return s.role==='pimpinan_produksi'||s.role==='sutradara'; });
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Penilaian Guru</b> - Pimpro & Sutradara</div></div>';
  if (targets.length===0){ h += '<div class="empty-state">'+ic('users',40)+'<p>Belum ada target</p></div>'; openModal('Penilaian', h); return; }
  targets.forEach(function(t){
    h += '<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;">'+esc(t.name)+'</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">'+esc((window.ROLES[t.role]||{}).label||t.role)+'</div>' +
      '<button class="btn btn-primary btn-sm" onclick="openFormNilaiGuru(\''+cid+'\',\''+t.id+'\')">'+ic('edit','sm')+' Nilai</button></div>';
  });
  openModal('Penilaian Guru', h);
};
window.openFormNilaiGuru = function(cid, tid){
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var t = (c.students||[]).find(function(x){ return x.id===tid; });
  if (!t) return;
  var stages = window.getActiveStages(cid);
  var rubric = getRubricFor(t.role);
  var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid] && window.DB.evaluations[cid][tid].guru) || {};
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Nilai: '+esc(t.name)+'</b></div></div>';
  stages.forEach(function(s){
    var sc = ev[s.id] || {};
    h += '<div class="rubric-item"><h4>'+esc(s.name)+'</h4>';
    rubric.forEach(function(r){
      var v = sc[r.id];
      h += '<div style="margin-top:10px;"><div style="font-weight:600;font-size:12.5px;">'+esc(r.name)+'</div>' +
        '<div class="radio-group">';
      [4,3,2,1].forEach(function(val){
        h += '<label class="rs-'+val+'"><input type="radio" name="sc_'+s.id+'_'+r.id+'" value="'+val+'" '+(v===val?'checked':'')+' onchange="simpanNilaiGuru(\''+cid+'\',\''+tid+'\',\''+s.id+'\',\''+r.id+'\',this.value)"><b>'+val+'</b></label>';
      });
      h += '</div></div>';
    });
    h += '</div>';
  });
  openModal('Nilai '+t.name, h);
  if (window.hydrateIcons) window.hydrateIcons();
};
window.simpanNilaiGuru = function(cid, tid, sid, rid, val){
  var docId = cid+'__'+tid;
  window.fb.collection('evaluations').doc(docId).get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:tid};
    data.guru = data.guru || {}; data.guru[sid] = data.guru[sid] || {};
    data.guru[sid][rid] = parseFloat(val);
    return window.fb.collection('evaluations').doc(docId).set(safeFS(data), {merge:true});
  });
};

/* ========== PENILAIAN SISWA ========== */
window.openPenilaianSiswaDashboard = function(){
  var cid = uCid(); var sid = uSid();
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var me = (c.students||[]).find(function(s){ return s.id===sid; });
  if (!me) return;
  var targets = (c.students||[]).filter(function(s){ return s.id!==sid && canEval(me.role, s.role); });
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Pilih rekan untuk dinilai ('+targets.length+')</div></div>';
  if (targets.length===0){ h += '<div class="empty-state">'+ic('users',40)+'<p>Tidak ada rekan untuk dinilai</p></div>'; openModal('Penilaian', h); return; }
  targets.forEach(function(t){
    h += '<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;">'+esc(t.name)+'</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">'+esc((window.ROLES[t.role]||{}).label||t.role)+'</div>' +
      '<button class="btn btn-primary btn-sm" onclick="openPenilaianTahap(\''+cid+'\',\'all\',\''+t.id+'\')">'+ic('edit','sm')+' Beri Nilai</button></div>';
  });
  openModal('Penilaian Rekan', h);
};
window.openPenilaianTahap = function(cid, sid, targetId){
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var me = (c.students||[]).find(function(s){ return s.id===uSid(); });
  if (!me) return;
  if (!targetId){
    // Pilih target dulu
    var targets = (c.students||[]).filter(function(s){ return s.id!==me.id && canEval(me.role, s.role); });
    var h = '<div class="alert alert-info">'+ic('info')+'<div>Pilih rekan untuk dinilai tahap ini</div></div>';
    if (targets.length===0) h += '<div class="empty-state">'+ic('users',40)+'<p>Tidak ada target</p></div>';
    targets.forEach(function(t){
      h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;">'+esc(t.name)+'</div>' +
        '<button class="btn btn-primary btn-sm" style="margin-top:6px;" onclick="openPenilaianTahap(\''+cid+'\',\''+sid+'\',\''+t.id+'\')">'+ic('edit','sm')+' Nilai</button></div>';
    });
    openModal('Penilaian Tahap', h);
    return;
  }
  var stage = (window.DB.stages||[]).find(function(s){ return s.id===sid; });
  if (!stage){ alert('Tahap tidak ditemukan'); return; }
  if (!window.isStageActive(cid, sid)){ alert('Tahap belum aktif'); return; }
  var t = (c.students||[]).find(function(x){ return x.id===targetId; });
  if (!t) return;
  var rubric = getRubricFor(t.role);
  var myScores = (window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId] && window.DB.evaluations[cid][targetId][me.id] && window.DB.evaluations[cid][targetId][me.id][sid]) || {};
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Nilai <b>'+esc(t.name)+'</b> - '+esc(stage.name)+'</div></div>';
  h += '<div class="scale-guide"><div class="scale-guide-title">'+ic('info','sm')+' Panduan Skala</div>' +
    '<div class="scale-guide-grid">' +
    '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
    '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
    '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
    '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
    '</div></div>';
  rubric.forEach(function(r){
    var v = myScores[r.id];
    h += '<div class="rubric-item"><h4>'+esc(r.name)+'</h4>' +
      '<div class="desc">'+esc(r.desc||'')+'</div>' +
      '<div class="radio-group">';
    [4,3,2,1].forEach(function(val){
      h += '<label class="rs-'+val+'"><input type="radio" name="s_'+r.id+'" value="'+val+'" '+(v===val?'checked':'')+'><b>'+val+'</b></label>';
    });
    h += '</div></div>';
  });
  h += '<button class="btn btn-primary btn-block btn-lg" onclick="simpanNilaiSiswa(\''+cid+'\',\''+targetId+'\',\''+sid+'\')">'+ic('save')+' Simpan Nilai</button>';
  openModal('Nilai '+t.name, h);
  if (window.hydrateIcons) window.hydrateIcons();
};
window.simpanNilaiSiswa = function(cid, tid, sid){
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var t = (c.students||[]).find(function(x){ return x.id===tid; });
  if (!t) return;
  var rubric = getRubricFor(t.role);
  var scores = {};
  var missing = [];
  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="s_'+r.id+'"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });
  if (missing.length > 0){ alert('Belum lengkap: '+missing.slice(0,3).join(', ')); return; }
  var docId = cid+'__'+tid;
  window.fb.collection('evaluations').doc(docId).get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:tid};
    data[uSid()] = data[uSid()] || {};
    data[uSid()][sid] = scores;
    return window.fb.collection('evaluations').doc(docId).set(safeFS(data), {merge:true});
  }).then(function(){
    alert('Nilai tersimpan!');
    closeModal();
  });
};

/* ========== INFORMASI UMUM ========== */
window.openInformasiUmum = function(){
  var cid = uCid();
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var items = c.informasiUmum || [];
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Informasi Umum</b></div></div>';
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahInfo(\''+cid+'\')">'+ic('plus','sm')+' Tambah Info</button>';
  if (items.length===0) h += '<div class="empty-state">'+ic('info',40)+'<p>Belum ada informasi</p></div>';
  else {
    items.slice().reverse().forEach(function(it){
      h += '<div class="card" style="margin-bottom:8px;"><div style="font-size:11.5px;color:var(--text-muted);">'+esc(it.by||'-')+' - '+fmtDate(it.createdAt)+'</div>' +
        '<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">'+esc(it.message)+'</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Untuk: '+esc(it.target||'Semua')+'</div></div>';
    });
  }
  openModal('Informasi Umum', h);
};
window.openTambahInfo = function(cid){
  openModal('Tambah Info',
    '<div class="form-group"><label>Untuk Peran</label><select id="iu-target"><option value="">Semua</option>' +
    Object.keys(window.ROLES).map(function(k){ return '<option value="'+k+'">'+esc(window.ROLES[k].label)+'</option>'; }).join('') +
    '</select></div>' +
    '<div class="form-group"><label>Pesan</label><textarea id="iu-msg" rows="4"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanInfo(\''+cid+'\')">'+ic('save')+' Simpan</button>');
};
window.simpanInfo = function(cid){
  var msg = document.getElementById('iu-msg').value.trim();
  var target = document.getElementById('iu-target').value;
  if (!msg){ alert('Pesan wajib'); return; }
  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  var items = (c.informasiUmum||[]).concat([{id:uid(), message:msg, target:target, by:u().name, createdAt:Date.now()}]);
  window.fbSet('classes', cid, Object.assign({}, c, {informasiUmum:items})).then(function(){ closeModal(); setTimeout(function(){ window.openInformasiUmum(); }, 200); });
};

/* ========== JADWAL ALAT MUSIK ========== */
window.openJadwalAlatMusik = function(){
  var bookings = Object.values(window.DB.bookings||{}).sort(function(a,b){ return String(a.date||'').localeCompare(String(b.date||'')); });
  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Jadwal Penggunaan Alat Musik</b></div></div>';
  if (bookings.length===0) h += '<div class="empty-state">'+ic('briefcase',40)+'<p>Belum ada jadwal</p></div>';
  else {
    bookings.forEach(function(b){
      h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;">'+esc(b.alat)+'</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">'+esc(b.date)+' '+esc(b.startTime||'')+'-'+esc(b.endTime||'')+'</div>' +
        '<div style="font-size:11.5px;">Kelas: '+esc(b.namaKelas||'-')+' - '+esc(b.bookedBy||'-')+'</div></div>';
    });
  }
  openModal('Jadwal Alat Musik', h);
};

/* ========== CAROUSEL (Timeline, Jadwal) ========== */
window.injectCarousel = function(){
  if (!window.currentUser) return;
  var mc = document.getElementById('main-content');
  if (!mc || mc.querySelector('.carousel-wrap')) return;
  var cid = uCid();
  if (!cid) return;

  var c = window.DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;

  var stages = window.DB.stages || [];
  var activeStages = window.getActiveStages(cid);
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){ return m.classId===cid; });

  var h = '<div class="carousel-wrap">' +
    '<div class="carousel-header">' +
      '<h3>'+ic('layers')+' Timeline & Jadwal</h3>' +
      '<div class="carousel-tabs">' +
        '<button class="carousel-tab active" data-tab="0" type="button">'+ic('calendar','sm')+' Jadwal</button>' +
        '<button class="carousel-tab" data-tab="1" type="button">'+ic('layers','sm')+' Timeline</button>' +
        '<button class="carousel-tab" data-tab="2" type="button">'+ic('activity','sm')+' Aktivitas</button>' +
      '</div>' +
    '</div>' +
    '<div class="carousel-track" id="carousel-track-main">';

  // Slide 1: Jadwal (meetings)
  h += '<div class="carousel-slide">';
  if (meetings.length === 0) h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada jadwal</p></div>';
  else {
    meetings.sort(function(a,b){ return String(a.date||'').localeCompare(String(b.date||'')); });
    meetings.slice(0, 5).forEach(function(m){
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--primary);">' +
        '<div style="font-weight:700;font-size:13px;">'+esc(m.title)+'</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(m.type||'')+' - '+esc(m.date||'')+'</div></div>';
    });
  }
  h += '</div>';

  // Slide 2: Timeline
  h += '<div class="carousel-slide">';
  if (stages.length === 0) h += '<div class="empty-state">'+ic('layers',40)+'<p>Belum ada tahapan</p></div>';
  else {
    stages.forEach(function(s, i){
      var isAct = activeStages.indexOf(s) >= 0;
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid '+(isAct?'var(--success)':'var(--border)')+';">' +
        '<div style="font-weight:700;font-size:13px;">'+(i+1)+'. '+esc(s.name)+'</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(s.subtitle||'')+' - Bobot '+s.weight+'%</div></div>';
    });
  }
  h += '</div>';

  // Slide 3: Aktivitas
  h += '<div class="carousel-slide">';
  var logs = (window.DB.activityLogs||[]).slice(0, 10);
  if (logs.length === 0) h += '<div class="empty-state">'+ic('activity',40)+'<p>Belum ada aktivitas</p></div>';
  else {
    logs.forEach(function(l){
      h += '<div style="padding:8px;background:var(--surface);border-radius:6px;margin-bottom:4px;font-size:12px;">' +
        '<div>'+esc(l.message)+'</div>' +
        '<div style="font-size:10.5px;color:var(--text-muted);">'+fmtDate(l.createdAt)+'</div></div>';
    });
  }
  h += '</div>';

  h += '</div>' +
    '<div class="carousel-dots">' +
      '<button class="carousel-dot active" data-dot="0" type="button"></button>' +
      '<button class="carousel-dot" data-dot="1" type="button"></button>' +
      '<button class="carousel-dot" data-dot="2" type="button"></button>' +
    '</div>' +
  '</div>';

  // Insert after extras-toolbar-top
  var ref = mc.querySelector('.extras-toolbar-top');
  var wrap = document.createElement('div');
  wrap.innerHTML = h;
  if (ref && ref.nextSibling) ref.parentNode.insertBefore(wrap.firstElementChild, ref.nextSibling);
  else mc.insertBefore(wrap.firstElementChild, mc.firstChild);

  setTimeout(setupCarousel, 100);
  setTimeout(setupCarousel, 500);
};

function setupCarousel(){
  var track = document.getElementById('carousel-track-main');
  if (!track) return;
  var tabs = track.parentNode.querySelectorAll('.carousel-tab');
  var dots = track.parentNode.querySelectorAll('.carousel-dot');
  function goTo(i){ track.scrollTo({left: track.clientWidth * i, behavior:'smooth'}); }
  tabs.forEach(function(t){ t.onclick = function(){ goTo(parseInt(t.dataset.tab, 10)); }; });
  dots.forEach(function(d){ d.onclick = function(){ goTo(parseInt(d.dataset.dot, 10)); }; });
  var timer = null;
  track.onscroll = function(){
    if (timer) clearTimeout(timer);
    timer = setTimeout(function(){
      var idx = Math.round(track.scrollLeft / track.clientWidth);
      tabs.forEach(function(t, i){ t.classList.toggle('active', i===idx); });
      dots.forEach(function(d, i){ d.classList.toggle('active', i===idx); });
    }, 60);
  };
}
window.injectCarousel = window.injectCarousel;

/* ========== AUTO-INJECT ========== */
setInterval(function(){
  if (window.currentUser && document.getElementById('main-content')){
    window.injectCarousel();
  }
}, 1500);

console.log('[features.js] v12.0 loaded');
})();
