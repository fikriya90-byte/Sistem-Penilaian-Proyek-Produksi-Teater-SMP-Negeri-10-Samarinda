/* ============================================================
   SP-PPT features-checklist-absensi.js — v1.0 MILESTONE 3
   Fitur:
   1. Master Checklist Teater (12 peran × 4 fase)
   2. Student Checklist Templates (18 template)
   3. Checklist Pribadi (CRUD + toggle)
   4. Checklist Tim (view + toggle)
   5. Checklist Manage (guru: broadcast, hapus semua, copy kelas)
   6. Peer Roles (koor ↔ anggota saling lihat)
   7. Absensi (rapat, latihan, gladi + pilih peserta wajib)
   8. Faktor Kehadiran (auto-multiply ke nilai)
   9. Beri Tugas multi-select + deadline
   10. WhatsApp Deep Link (buka per penerima / berurutan / copy)
   Load SETELAH features-tahapan.js
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico){ console.warn('[features-checklist] app.js belum di-load.'); return; }

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
   1. MASTER CHECKLIST TEATER — 12 PERAN × 4 FASE
   ============================================================ */
window.MASTER_CHECKLIST = {
  pimpinan_produksi: {
    label:'Pimpinan Produksi', phases: {
      persiapan: ['Menyusun Master Production Schedule','Menetapkan Pekan Bebas Ujian & Libur','Membatasi durasi pertemuan maks 1 jam','Kontrol target awal tiap divisi'],
      produksi: ['Ikut pemanasan olah tubuh/suara/rasa','Briefing singkat maks 1 jam','Freeze saat PAS/SAS + libur','Konsolidasi ulang pasca-libur'],
      show: ['Rapat komando akhir','Sterilisasi panggung','Penilaian berjenjang'],
      pasca: ['Bersihkan panggung','Susun LPJ Produksi']
    }
  },
  sekretaris: {
    label:'Sekretaris', phases: {
      persiapan: ['Formulir izin les di web','Upload draf naskah ke web'],
      produksi: ['Rekap presensi harian','Bekukan lalu lintas surat','Rancang tiket & nametag'],
      show: ['Zonasi meja penerimaan tamu','Scan tiket digital'],
      pasca: ['Kompilasi dokumen produksi']
    }
  },
  bendahara: {
    label:'Bendahara', phases: {
      persiapan: ['Susun RAB efisien','Kebijakan material daur ulang','Sistem digitalisasi nota'],
      produksi: ['Kelola arus kas harian','Verifikasi kuitansi digital'],
      show: ['Dana darurat P3K','Koordinasi konsumsi'],
      pasca: ['Rekap nota','Susun LPJ Keuangan']
    }
  },
  sutradara: {
    label:'Sutradara', phases: {
      persiapan: ['Scene Breakdown','Upload Visi Penyutradaraan'],
      produksi: ['Latihan modular maks 1 jam','Evaluasi hafalan via video','Gladi bersih utuh'],
      show: ['Koordinasi Stage Manager','Input nilai keaktoran'],
      pasca: ['Analisis keaktoran']
    }
  },
  asisten_sutradara: {
    label:'Asisten Sutradara', phases: {
      persiapan: ['Susun Call Sheet','Upload prompt book'],
      produksi: ['Pemanasan & briefing','Setor hafalan via video','Latih Shadow Player'],
      show: ['Panggil pemain ke wing','Backup Sutradara'],
      pasca: ['Catatan harian pemain']
    }
  },
  pemain: {
    label:'Pemeran', phases: {
      persiapan: ['Analisis karakter di web','Setor jadwal les'],
      produksi: ['Pemanasan & briefing','Setor hafalan via video','Kerja sama Shadow Player'],
      show: ['Pemanasan vokal','Tampil 30 menit'],
      pasca: ['Refleksi kritis']
    }
  },
  koor_busana: {
    label:'Koor. Tata Busana', phases: {
      persiapan: ['Moodboard Gemini AI','Data ukuran tubuh pemain'],
      produksi: ['Fitting bergantian maks 1 jam','Modifikasi pakaian bekas','Simulasi quick change'],
      show: ['Area rak gantung di backstage','Quick change'],
      pasca: ['Bersihkan & inventaris kostum']
    }
  },
  koor_rias: {
    label:'Koor. Tata Rias', phases: {
      persiapan: ['Face chart Gemini AI','Data kit rias higienis'],
      produksi: ['Latih aplikasi rias','Sterilkan alat rias'],
      show: ['Eksekusi rias','Touch-up antar adegan'],
      pasca: ['Bersihkan wajah pemain','Sterilkan alat']
    }
  },
  koor_perlengkapan: {
    label:'Koor. Perlengkapan', phases: {
      persiapan: ['Breakdown properti per adegan','Denah penataan properti'],
      produksi: ['Rakit properti sederhana','Sediakan air galon'],
      show: ['Zona prop table','Transisi properti 10 detik'],
      pasca: ['Bersihkan area panggung']
    }
  },
  koor_panggung: {
    label:'Koor. Tata Pentas', phases: {
      persiapan: ['Sketsa denah panggung','Sistem Cross-Operator'],
      produksi: ['Lakban spotting','Konstruksi set'],
      show: ['Pasang set 10 menit','Bongkar set 5 menit'],
      pasca: ['Bongkar set aman']
    }
  },
  koor_publikasi: {
    label:'Koor. Publikasi & Dokumentasi', phases: {
      persiapan: ['Strategi publikasi 65% web','Kalender konten','Launching pengurus','Kelola Instagram kelas','Publikasi logo'],
      produksi: ['Dokumentasi behind the scene','Upload video ke web'],
      show: ['Dokumentasi hari-H','Rekam 30 menit'],
      pasca: ['Aftermovie sinematik','Arsip repositori']
    }
  },
  koor_musik: {
    label:'Koor. Tata Musik', phases: {
      persiapan: ['Inventarisasi alat musik','Sound cue sheet'],
      produksi: ['Upload rekaman iringan','Latihan musik maks 1 jam'],
      show: ['Check sound 10 menit','Musik iringan 30 menit'],
      pasca: ['Rapikan instrumen']
    }
  }
};

window.MASTER_CHECKLIST_PER_ROLE = {
  pimpinan_produksi:'pimpinan_produksi',
  sekretaris:'sekretaris', bendahara:'bendahara',
  sutradara:'sutradara', asisten_sutradara:'asisten_sutradara',
  pemain:'pemain',
  koor_busana:'koor_busana', anggota_busana:'koor_busana',
  koor_rias:'koor_rias', anggota_rias:'koor_rias',
  koor_perlengkapan:'koor_perlengkapan', anggota_perlengkapan:'koor_perlengkapan',
  koor_panggung:'koor_panggung', anggota_panggung:'koor_panggung',
  koor_publikasi:'koor_publikasi', anggota_publikasi:'koor_publikasi',
  koor_musik:'koor_musik', anggota_musik:'koor_musik'
};

/* ============================================================
   2. STUDENT CHECKLIST TEMPLATES (18 TEMPLATE)
   ============================================================ */
window.STUDENT_TEMPLATES = {
  pimpinan_produksi: { label:'Pimpinan Produksi', items:['Susun Master Schedule','Kalender bebas ujian','Batasi durasi 1 jam','Kontrol target divisi'] },
  sutradara: { label:'Sutradara', items:['Scene Breakdown','Upload Visi','Latihan modular','Gladi bersih'] },
  asisten_sutradara: { label:'Asisten Sutradara', items:['Call Sheet','Prompt book','Setor hafalan','Latih Shadow Player'] },
  sekretaris: { label:'Sekretaris', items:['Formulir izin les','Rekap presensi','Bekukan surat','Tiket & nametag'] },
  bendahara: { label:'Bendahara', items:['Susun RAB','Digitalisasi nota','Verifikasi kuitansi','LPJ Keuangan'] },
  koor_publikasi: { label:'Divisi Publikasi', items:['Strategi 65% web','Kalender konten','Materi Canva','Launching pengurus','Instagram kelas','Logo Kerabat Kerja'] },
  anggota_publikasi: { label:'Anggota Publikasi', items:['Dokumentasi latihan','Upload video','Editing konten'] },
  koor_perlengkapan: { label:'Divisi Perlengkapan', items:['Breakdown properti','Barang daur ulang','Denah penataan','Inventaris'] },
  anggota_perlengkapan: { label:'Anggota Perlengkapan', items:['Rakit properti','Tata letak','Air galon','Bersihkan panggung'] },
  pemain: { label:'Pemeran', items:['Analisis karakter','Jadwal les','Hafal dialog','Refleksi'] },
  koor_panggung: { label:'Divisi Tata Pentas', items:['Sketsa denah','Alur dekorasi','Spotting','Bongkar set'] },
  anggota_panggung: { label:'Anggota Tata Pentas', items:['Konstruksi set','Lakban','Transisi','Sterilkan wings'] },
  koor_musik: { label:'Divisi Tata Musik', items:['Inventarisasi','Cue sheet','Tata letak mikrofon','Check sound'] },
  anggota_musik: { label:'Anggota Tata Musik', items:['Latih instrumen','Upload iringan','Standby'] },
  koor_busana: { label:'Divisi Tata Busana', items:['Moodboard AI','Fitting','Modifikasi','Quick change'] },
  anggota_busana: { label:'Anggota Tata Busana', items:['Bantu fitting','Rawat kostum','Standby'] },
  koor_rias: { label:'Divisi Tata Rias', items:['Face chart AI','Kit rias','Jadwal merias','Sterilkan'] },
  anggota_rias: { label:'Anggota Tata Rias', items:['Bantu rias','Touch-up','Bersihkan alat'] }
};

/* ============================================================
   3. HELPER: CHECKLIST ITEMS
   ============================================================ */
function getChecklistItems(cid){
  return (window.DB.checklists && window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
}
function setChecklistItems(cid, items){
  return window.fbSet('checklists', cid, {classId:cid, items:items});
}

/**
 * Cek apakah 2 role adalah peer (koor ↔ anggota sekawan).
 */
function isPeerRole(roleA, roleB){
  if (!roleA || !roleB) return false;
  if (roleA === roleB) return false;
  if (roleA.indexOf('koor_') === 0){
    return roleB === 'anggota_' + roleA.substring(5);
  }
  if (roleA.indexOf('anggota_') === 0){
    return roleB === 'koor_' + roleA.substring(8);
  }
  return false;
}

/* ============================================================
   4. CHECKLIST PRIBADI
   ============================================================ */
window.openChecklistPribadi = function(){
  var cid = uCid(); if (!cid) return;
  var sid = uSid(); if (!sid){ alert('Data siswa tidak ditemukan'); return; }
  var items = getChecklistItems(cid).filter(function(it){
    return it.isPersonal && it.ownerId === sid;
  });
  var done = items.filter(function(x){ return x.done; }).length;
  var pct = items.length > 0 ? Math.round(done/items.length*100) : 0;

  var h = '';
  h += '<div class="alert alert-info">'+ic('info')+'<div>Checklist ini <b>milik Anda sendiri</b>. Bisa tambah, edit, hapus.</div></div>';

  h += '<div class="action-row" style="margin-bottom:12px;">' +
    '<button class="btn btn-primary btn-sm" onclick="openAmbilDariTemplate()">'+ic('plus','sm')+' Ambil dari Template</button>' +
    '<button class="btn btn-sm" onclick="openTambahItemPribadi()">'+ic('plus','sm')+' Tambah Manual</button>' +
    (items.length > 0 ? '<button class="btn btn-sm btn-danger" onclick="hapusSemuaItemPribadi()">'+ic('trash','sm')+' Hapus Semua</button>' : '') +
  '</div>';

  if (items.length > 0){
    h += '<div class="progress-banner" style="padding:14px;">' +
      '<div style="font-size:13px;font-weight:700;">Progres</div>' +
      '<div class="big-count" style="font-size:22px;">'+done+' / '+items.length+'</div>' +
      '<div class="progress-container"><div class="progress-bar '+(pct===100?'complete':pct>0?'partial':'')+'" style="width:'+pct+'%"></div></div>' +
    '</div>';
  }

  if (items.length === 0){
    h += '<div class="empty-state">'+ic('checkSquare',40)+'<p>Belum ada item. Klik <b>Ambil dari Template</b> atau <b>Tambah Manual</b>.</p></div>';
  } else {
    items.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;">' +
        '<input type="checkbox" '+(it.done?'checked':'')+' style="width:18px;height:18px;" onchange="toggleItemPribadi(\''+it.id+'\',this.checked)">' +
        '<div style="flex:1;font-size:13px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(it.name)+'</div>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusItemPribadi(\''+it.id+'\')">'+ic('trash','sm')+'</button>' +
      '</div>';
    });
  }

  openModal('Checklist Saya', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openTambahItemPribadi = function(){
  openModal('Tambah Item Pribadi',
    '<div class="form-group"><label>Nama Tugas</label><input id="pi-name" maxlength="150" placeholder="Contoh: Latihan dialog adegan 1"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanItemPribadi()">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanItemPribadi = function(){
  var name = (document.getElementById('pi-name').value||'').trim();
  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }
  var cid = uCid(), sid = uSid();
  var items = getChecklistItems(cid).slice();
  items.push({
    id: uid(), name: name, assignedRole: uRole(),
    division: window.getDivisionOfRole ? window.getDivisionOfRole(uRole()) : 'produksi',
    done: false, isPersonal: true,
    ownerId: sid, ownerName: u().name,
    createdAt: Date.now()
  });
  setChecklistItems(cid, items).then(function(){
    closeModal();
    setTimeout(window.openChecklistPribadi, 200);
  });
};

window.openAmbilDariTemplate = function(){
  var role = uRole();
  var tpl = window.STUDENT_TEMPLATES[role];
  if (!tpl){ alert('Template untuk peran Anda belum tersedia.'); return; }
  var cid = uCid(), sid = uSid();
  var existing = getChecklistItems(cid).filter(function(it){ return it.isPersonal && it.ownerId === sid; });
  var existingNames = existing.map(function(it){ return it.name.toLowerCase(); });

  var h = '<div class="alert alert-info">'+ic('info')+'<div>Template: <b>'+esc(tpl.label)+'</b></div></div>';
  h += '<div style="max-height:340px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px;">';
  tpl.items.forEach(function(name, i){
    var isDup = existingNames.indexOf(name.toLowerCase()) >= 0;
    h += '<label style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:6px;margin-bottom:4px;cursor:pointer;'+
      (isDup?'opacity:.5;':'')+'background:var(--surface);">' +
      '<input type="checkbox" class="tpl-cb" value="'+esc(name)+'" '+(isDup?'disabled checked':'checked')+'>' +
      '<span style="flex:1;font-size:12.5px;">'+esc(name)+'</span>' +
      (isDup ? '<span class="badge badge-gray">Sudah ada</span>' : '') +
    '</label>';
  });
  h += '</div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="applyTemplatePribadi()">'+ic('save')+' Tambahkan ke Checklist</button>';
  openModal('Template: '+tpl.label, h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.applyTemplatePribadi = function(){
  var cbs = document.querySelectorAll('.tpl-cb:not(:disabled):checked');
  if (cbs.length === 0){ alert('Pilih minimal 1 item'); return; }
  var cid = uCid(), sid = uSid();
  var items = getChecklistItems(cid).slice();
  cbs.forEach(function(cb){
    items.push({
      id: uid(), name: cb.value, assignedRole: uRole(),
      division: window.getDivisionOfRole ? window.getDivisionOfRole(uRole()) : 'produksi',
      done: false, isPersonal: true,
      ownerId: sid, ownerName: u().name,
      createdAt: Date.now()
    });
  });
  setChecklistItems(cid, items).then(function(){
    closeModal(); alert('Ditambahkan!');
    setTimeout(window.openChecklistPribadi, 200);
  });
};

window.toggleItemPribadi = function(itemId, checked){
  var cid = uCid();
  var items = getChecklistItems(cid).map(function(it){
    if (it.id !== itemId) return it;
    return Object.assign({}, it, {
      done: checked,
      doneBy: checked ? u().name : null,
      doneAt: checked ? Date.now() : null
    });
  });
  setChecklistItems(cid, items);
};

window.hapusItemPribadi = function(itemId){
  if (!confirm('Hapus item ini?')) return;
  var cid = uCid();
  var items = getChecklistItems(cid).filter(function(x){ return x.id !== itemId; });
  setChecklistItems(cid, items).then(function(){ setTimeout(window.openChecklistPribadi, 200); });
};

window.hapusSemuaItemPribadi = function(){
  if (!confirm('Hapus SEMUA item checklist pribadi Anda?')) return;
  var cid = uCid(), sid = uSid();
  var items = getChecklistItems(cid).filter(function(x){
    return !(x.isPersonal && x.ownerId === sid);
  });
  setChecklistItems(cid, items).then(function(){ setTimeout(window.openChecklistPribadi, 200); });
};

/* ============================================================
   5. CHECKLIST TIM (VIEW)
   ============================================================ */
window.openChecklistTim = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var items = getChecklistItems(cid).filter(function(it){ return !it.isPersonal; });
  var myRole = uRole();
  var isFullAccess = isGuru() || myRole === 'pimpinan_produksi' || myRole === 'sutradara' || myRole === 'asisten_sutradara';
  var isKoor = myRole.indexOf('koor_') === 0;

  // Filter berdasarkan role
  var visible = items.filter(function(it){
    if (isFullAccess) return true;
    var role = it.assignedRole || 'umum';
    if (role === 'umum') return true;
    if (role === myRole) return true;
    if (isKoor && isPeerRole(myRole, role)) return true;
    return false;
  });

  var h = '';
  h += '<div class="alert alert-info">'+ic('info')+'<div>Checklist tim &mdash; '+visible.length+' item</div></div>';

  if (visible.length === 0){
    h += '<div class="empty-state">'+ic('users',40)+'<p>Belum ada checklist untuk Anda.</p></div>';
    openModal('Checklist Tim', h);
    return;
  }

  var canToggle = function(role){
    if (isGuru()) return true;
    if (isFullAccess) return true;
    if (role === 'umum' || role === myRole) return true;
    if (isKoor && isPeerRole(myRole, role)) return true;
    return false;
  };

  var byRole = {};
  visible.forEach(function(it){
    var r = it.assignedRole || 'umum';
    if (!byRole[r]) byRole[r] = [];
    byRole[r].push(it);
  });

  Object.keys(byRole).sort().forEach(function(role){
    var arr = byRole[role];
    var d = arr.filter(function(x){ return x.done; }).length;
    var pct = Math.round(d/arr.length*100);
    var editable = canToggle(role);

    h += '<div class="card" style="margin-bottom:10px;">' +
      '<h3 style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
        '<span>'+esc(roleLabel(role))+'</span>' +
        '<span class="badge '+(d===arr.length?'badge-success':d>0?'badge-warning':'badge-gray')+'">'+d+'/'+arr.length+'</span>' +
      '</h3>' +
      '<div class="progress-container" style="margin-bottom:10px;"><div class="progress-bar '+(pct===100?'complete':pct>0?'partial':'')+'" style="width:'+pct+'%"></div></div>';
    arr.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed var(--border);">' +
        '<input type="checkbox" '+(it.done?'checked':'')+' style="width:16px;height:16px;" '+(editable?'':'disabled')+' onchange="toggleItemTim(\''+it.id+'\',this.checked)">' +
        '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(it.name)+
        (it.done && it.doneBy ? '<div style="font-size:10.5px;color:var(--success);">'+ic('check','sm')+' '+esc(it.doneBy)+'</div>' : '') +
        '</div></div>';
    });
    h += '</div>';
  });

  openModal('Checklist Tim', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.toggleItemTim = function(itemId, checked){
  var cid = uCid();
  var items = getChecklistItems(cid).map(function(it){
    if (it.id !== itemId) return it;
    return Object.assign({}, it, {
      done: checked,
      doneBy: checked ? u().name : null,
      doneAt: checked ? Date.now() : null
    });
  });
  setChecklistItems(cid, items);
};

/* ============================================================
   6. CHECKLIST MANAGE (GURU/ADMIN)
   ============================================================ */
window.openChecklistManage = function(cid){
  cid = cid || uCid(); if (!cid) return;
  if (!isGuru() && uRole() !== 'pimpinan_produksi'){ alert('Akses terbatas'); return; }
  var c = findClass(cid); if (!c) return;

  var items = getChecklistItems(cid).filter(function(it){ return !it.isPersonal; });
  var h = '';
  h += '<div class="alert alert-info">'+ic('info')+'<div><b>Kelola Checklist</b> &mdash; '+esc(c.name)+'<br><small>'+items.length+' item tim</small></div></div>';

  h += '<div class="action-row" style="margin-bottom:14px;">' +
    '<button class="btn btn-primary btn-sm" onclick="openTambahChecklistItem(\''+cid+'\')">'+ic('plus','sm')+' Tambah</button>' +
    '<button class="btn btn-sm" onclick="openAmbilMasterChecklist(\''+cid+'\')">'+ic('book','sm')+' Ambil Master</button>' +
    (items.length > 0 ? '<button class="btn btn-sm" onclick="openBroadcastChecklist(\''+cid+'\')">'+ic('send','sm')+' Broadcast</button>' : '') +
    '<button class="btn btn-sm" onclick="openCopyChecklist(\''+cid+'\')">'+ic('copy','sm')+' Copy Kelas</button>' +
    (items.length > 0 ? '<button class="btn btn-sm btn-danger" onclick="hapusSemuaChecklistItem(\''+cid+'\')">'+ic('trash','sm')+' Hapus Semua</button>' : '') +
  '</div>';

  if (items.length === 0){
    h += '<div class="empty-state">'+ic('clipboard',40)+'<p>Belum ada item.</p></div>';
  } else {
    var byRole = {};
    items.forEach(function(it){
      var r = it.assignedRole || 'umum';
      if (!byRole[r]) byRole[r] = [];
      byRole[r].push(it);
    });
    Object.keys(byRole).sort().forEach(function(role){
      var arr = byRole[role];
      h += '<div class="card" style="margin-bottom:10px;background:var(--surface);">' +
        '<h3 style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
          '<span>'+esc(roleLabel(role))+'</span>' +
          '<span class="badge badge-gray">'+arr.length+'</span>' +
        '</h3>';
      arr.forEach(function(it){
        h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--border);">' +
          '<input type="checkbox" '+(it.done?'checked':'')+' disabled style="width:16px;height:16px;">' +
          '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(it.name)+'</div>' +
          '<button class="btn btn-sm" onclick="openEditChecklistItem(\''+it.id+'\')">'+ic('edit','sm')+'</button>' +
          '<button class="btn btn-sm btn-danger" onclick="hapusChecklistItem(\''+it.id+'\')">'+ic('trash','sm')+'</button>' +
        '</div>';
      });
      h += '</div>';
    });
  }

  openModal('Kelola Checklist', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

function roleOpts(selected){
  var o = '<option value="umum"'+(selected==='umum'?' selected':'')+'>Umum (Semua Siswa)</option>';
  Object.keys(window.ROLES || {}).forEach(function(k){
    o += '<option value="'+k+'"'+(selected===k?' selected':'')+'>'+esc(roleLabel(k))+'</option>';
  });
  return o;
}

window.openTambahChecklistItem = function(cid){
  openModal('Tambah Item Checklist',
    '<div class="form-group"><label>Nama Tugas</label><input id="cli-name" maxlength="150"></div>' +
    '<div class="form-group"><label>Detail (opsional)</label><textarea id="cli-detail" rows="2" maxlength="250"></textarea></div>' +
    '<div class="form-group"><label>Untuk Peran</label><select id="cli-role">'+roleOpts('umum')+'</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanChecklistItem(\''+cid+'\',\'new\')">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openEditChecklistItem = function(itemId){
  var cid = uCid();
  var it = getChecklistItems(cid).find(function(x){ return x.id===itemId; });
  if (!it) return;
  openModal('Edit Item',
    '<div class="form-group"><label>Nama Tugas</label><input id="cli-name" value="'+esc(it.name)+'" maxlength="150"></div>' +
    '<div class="form-group"><label>Detail</label><textarea id="cli-detail" rows="2" maxlength="250">'+esc(it.detail||'')+'</textarea></div>' +
    '<div class="form-group"><label>Untuk Peran</label><select id="cli-role">'+roleOpts(it.assignedRole||'umum')+'</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanChecklistItem(\''+cid+'\',\''+itemId+'\')">'+ic('save')+' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanChecklistItem = function(cid, mode){
  var name = (document.getElementById('cli-name').value||'').trim();
  var detail = (document.getElementById('cli-detail').value||'').trim();
  var role = document.getElementById('cli-role').value;
  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }

  var items = getChecklistItems(cid).slice();
  if (mode === 'new'){
    items.push({
      id: uid(), name: name, detail: detail,
      assignedRole: role,
      division: window.getDivisionOfRole ? window.getDivisionOfRole(role) : 'produksi',
      done: false, doneBy: null, doneAt: null,
      isPersonal: false,
      createdAt: Date.now(), createdBy: u().name
    });
  } else {
    items = items.map(function(it){
      if (it.id !== mode) return it;
      return Object.assign({}, it, {name:name, detail:detail, assignedRole:role});
    });
  }
  setChecklistItems(cid, items).then(function(){
    logAct('checklist_update', u().name+' '+(mode==='new'?'tambah':'edit')+' item: '+name, {classId:cid});
    closeModal();
    setTimeout(function(){ window.openChecklistManage(cid); }, 200);
  });
};

window.hapusChecklistItem = function(itemId){
  if (!confirm('Hapus item ini?')) return;
  var cid = uCid();
  var items = getChecklistItems(cid).filter(function(x){ return x.id !== itemId; });
  setChecklistItems(cid, items).then(function(){ setTimeout(function(){ window.openChecklistManage(cid); }, 200); });
};

window.hapusSemuaChecklistItem = function(cid){
  if (!confirm('Hapus SEMUA item checklist tim? Item pribadi siswa tetap aman.')) return;
  var items = getChecklistItems(cid).filter(function(x){ return x.isPersonal; });
  setChecklistItems(cid, items).then(function(){
    alert('Semua item tim dihapus');
    setTimeout(function(){ window.openChecklistManage(cid); }, 200);
  });
};

/* ============================================================
   7. AMBIL MASTER CHECKLIST (Per Role)
   ============================================================ */
window.openAmbilMasterChecklist = function(cid){
  var c = findClass(cid); if (!c) return;
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Pilih peran untuk auto-generate checklist dari Master Checklist Teater.</div></div>';
  h += '<div class="form-group"><label>Peran</label><select id="mcl-role">';
  Object.keys(window.MASTER_CHECKLIST).forEach(function(k){
    h += '<option value="'+k+'">'+esc(window.MASTER_CHECKLIST[k].label)+'</option>';
  });
  h += '</select></div>';
  h += '<button class="btn btn-primary btn-block" onclick="applyMasterChecklist(\''+cid+'\')">'+ic('save')+' Generate</button>';
  openModal('Ambil Master Checklist', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.applyMasterChecklist = function(cid){
  var role = document.getElementById('mcl-role').value;
  var mcl = window.MASTER_CHECKLIST[role];
  if (!mcl) return;
  var items = getChecklistItems(cid).slice();
  var phases = mcl.phases;
  Object.keys(phases).forEach(function(phase){
    phases[phase].forEach(function(name){
      items.push({
        id: uid(),
        name: name,
        detail: 'Fase: '+phase.charAt(0).toUpperCase()+phase.slice(1),
        assignedRole: role,
        division: window.getDivisionOfRole ? window.getDivisionOfRole(role) : 'produksi',
        phase: phase,
        done: false, isPersonal: false,
        createdAt: Date.now(), createdBy: u().name
      });
    });
  });
  setChecklistItems(cid, items).then(function(){
    alert('Master checklist ditambahkan!');
    closeModal();
    setTimeout(function(){ window.openChecklistManage(cid); }, 200);
  });
};

/* ============================================================
   8. BROADCAST CHECKLIST
   ============================================================ */
window.openBroadcastChecklist = function(cid){
  var items = getChecklistItems(cid).filter(function(it){ return !it.isPersonal; });
  if (items.length === 0){ alert('Belum ada item checklist'); return; }
  var byRole = {};
  items.forEach(function(it){
    var r = it.assignedRole || 'umum';
    if (!byRole[r]) byRole[r] = [];
    byRole[r].push(it);
  });
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Pilih item yang ingin dikirim ke siswa.</div></div>';
  h += '<div style="max-height:280px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  Object.keys(byRole).forEach(function(role){
    h += '<div style="margin-bottom:8px;">' +
      '<div style="font-weight:700;font-size:12px;padding:4px 8px;background:var(--primary-soft);border-radius:6px;margin-bottom:4px;">'+esc(roleLabel(role))+' ('+byRole[role].length+')</div>';
    byRole[role].forEach(function(it){
      h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
        '<input type="checkbox" class="bc-cl-cb" value="'+it.id+'" data-name="'+esc(it.name)+'" data-role="'+esc(it.assignedRole||'umum')+'" checked>' +
        '<span style="flex:1;">'+esc(it.name)+'</span>' +
      '</label>';
    });
    h += '</div>';
  });
  h += '</div>';
  h += '<div class="form-group" style="margin-top:12px;"><label>Judul</label><input id="bc-cl-title" value="Checklist Tugas Tersedia"></div>';
  h += '<div class="form-group"><label>Pesan Tambahan (opsional)</label><textarea id="bc-cl-msg" rows="2" maxlength="300"></textarea></div>';
  h += '<div class="form-group"><label>Kirim Ke</label><select id="bc-cl-target">' +
    '<option value="all">Semua Siswa</option>' +
    '<option value="produksi">Tim Produksi</option>' +
    '<option value="artistik">Tim Artistik</option>' +
    '</select></div>';
  h += '<button class="btn btn-primary btn-block" onclick="kirimBroadcastChecklist(\''+cid+'\')">'+ic('send')+' Kirim Broadcast</button>';
  openModal('Broadcast Checklist', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.kirimBroadcastChecklist = function(cid){
  var ti = (document.getElementById('bc-cl-title').value||'').trim();
  var msg = (document.getElementById('bc-cl-msg').value||'').trim();
  var tgt = document.getElementById('bc-cl-target').value;
  if (!ti){ alert('Judul wajib diisi'); return; }

  var cbs = document.querySelectorAll('.bc-cl-cb:checked');
  if (cbs.length === 0){ alert('Pilih minimal 1 item'); return; }

  var c = findClass(cid); if (!c) return;
  var students = (c.students||[]).slice();
  if (tgt === 'produksi') students = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'produksi'; });
  else if (tgt === 'artistik') students = students.filter(function(s){ return (window.ROLES[s.role]||{}).team === 'artistik'; });
  if (students.length === 0){ alert('Tidak ada penerima'); return; }

  var lines = [];
  cbs.forEach(function(cb, i){
    lines.push((i+1)+'. '+cb.getAttribute('data-name')+' ('+roleLabel(cb.getAttribute('data-role'))+')');
  });
  var fullMsg = 'Checklist:\n\n' + lines.join('\n') + (msg ? '\n\n'+msg : '');

  var id = uid();
  window.fbSet('notifications', id, {
    id: id, classId: cid,
    fromId: uSid() || u().email || 'guru',
    fromName: u().name, fromType: uType(),
    toId: 'some',
    recipientIds: students.map(function(s){ return s.id; }),
    type: 'tugas',
    title: '[CHECKLIST] '+ti,
    message: fullMsg,
    createdAt: Date.now(), readBy: [], doneBy: []
  }).then(function(){
    logAct('broadcast', u().name+' broadcast checklist ke '+students.length+' siswa', {classId:cid});
    closeModal();
    alert('Broadcast terkirim ke '+students.length+' siswa!');
  });
};

/* ============================================================
   9. COPY CHECKLIST DARI KELAS LAIN
   ============================================================ */
window.openCopyChecklist = function(targetCid){
  var others = (window.DB.classes || []).filter(function(c){
    return c.id !== targetCid && (isGuru() ? true : false);
  });
  if (others.length === 0){ alert('Tidak ada kelas lain'); return; }
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Pilih kelas sumber untuk menyalin checklist.</div></div>';
  h += '<div class="form-group"><label>Kelas Sumber</label><select id="cp-src" onchange="loadCopyItems()">';
  others.forEach(function(c){
    var n = getChecklistItems(c.id).filter(function(x){ return !x.isPersonal; }).length;
    h += '<option value="'+c.id+'">'+esc(c.name)+' ('+n+' item)</option>';
  });
  h += '</select></div>';
  h += '<div id="cp-list" style="max-height:280px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);"></div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="doCopyChecklist(\''+targetCid+'\')">'+ic('save')+' Salin Item Terpilih</button>';
  openModal('Copy Checklist dari Kelas', h);
  setTimeout(loadCopyItems, 100);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.loadCopyItems = function(){
  var src = document.getElementById('cp-src').value;
  var items = getChecklistItems(src).filter(function(it){ return !it.isPersonal; });
  var el = document.getElementById('cp-list');
  if (!el) return;
  if (items.length === 0){ el.innerHTML = '<div style="padding:14px;text-align:center;color:var(--text-muted);">Kosong</div>'; return; }
  var h = '';
  items.forEach(function(it){
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="cp-cb" value="'+it.id+'" checked>' +
      '<span style="flex:1;">'+esc(it.name)+' <small style="color:var(--text-muted);">('+esc(roleLabel(it.assignedRole||'umum'))+')</small></span>' +
    '</label>';
  });
  el.innerHTML = h;
};

window.doCopyChecklist = function(targetCid){
  var src = document.getElementById('cp-src').value;
  var srcItems = getChecklistItems(src);
  var selected = [];
  document.querySelectorAll('.cp-cb:checked').forEach(function(cb){
    var it = srcItems.find(function(x){ return x.id===cb.value; });
    if (it) selected.push(it);
  });
  if (selected.length === 0){ alert('Pilih minimal 1 item'); return; }
  if (!confirm('Salin '+selected.length+' item ke kelas ini?')) return;
  var items = getChecklistItems(targetCid).slice();
  selected.forEach(function(it){
    items.push({
      id: uid(), name: it.name, detail: it.detail || '',
      assignedRole: it.assignedRole, division: it.division,
      phase: it.phase || null,
      done: false, isPersonal: false,
      createdAt: Date.now(), createdBy: u().name,
      copiedFrom: src
    });
  });
  setChecklistItems(targetCid, items).then(function(){
    alert('Berhasil disalin!');
    closeModal();
    setTimeout(function(){ window.openChecklistManage(targetCid); }, 200);
  });
};

/* ============================================================
   10. ABSENSI — BUAT MEETING
   ============================================================ */
window.openMeetingList = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var meetings = Object.values(window.DB.meetings || {}).filter(function(m){ return m.classId === cid; });
  var role = uRole();
  var canBuatRapat = isGuru() || role === 'sekretaris' || role === 'pimpinan_produksi';
  var canBuatLatihan = isGuru() || role === 'sutradara' || role === 'asisten_sutradara';
  var canBuatGladi = isGuru() || role === 'sutradara' || role === 'asisten_sutradara';

  var h = '<div class="alert alert-info">'+ic('info')+'<div><b>Daftar Sesi Absensi</b> &mdash; '+meetings.length+' sesi</div></div>';

  h += '<div class="action-row" style="margin-bottom:14px;flex-wrap:wrap;">';
  if (canBuatRapat) h += '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'rapat\',\''+cid+'\')">'+ic('plus','sm')+' Buat Rapat</button>';
  if (canBuatLatihan) h += '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'latihan\',\''+cid+'\')">'+ic('plus','sm')+' Buat Latihan</button>';
  if (canBuatGladi) h += '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'gladi\',\''+cid+'\')">'+ic('plus','sm')+' Buat Gladi</button>';
  h += '</div>';

  if (meetings.length === 0){
    h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada sesi absensi.</p></div>';
    openModal('Absensi', h);
    return;
  }

  meetings.sort(function(a,b){ return (b.createdAt||0) - (a.createdAt||0); });
  meetings.forEach(function(m){
    var records = m.records || {};
    var total = Object.keys(records).length;
    var hadir = 0, izin = 0, sakit = 0, telat = 0, alpa = 0;
    Object.keys(records).forEach(function(k){
      var v = records[k];
      if (v === 'hadir') hadir++;
      else if (v === 'izin') izin++;
      else if (v === 'sakit') sakit++;
      else if (v === 'telat') telat++;
      else if (v === 'alpa') alpa++;
    });
    var c = findClass(cid);
    var totalStudents = (c && c.students) ? c.students.length : 0;
    var typeLbl = {rapat:'Rapat', latihan:'Latihan', gladi:'Gladi'}[m.type] || m.type;

    h += '<div class="card" style="margin-bottom:10px;border-left:3px solid var(--primary);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="font-weight:700;font-size:13.5px;">'+esc(m.title)+'</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' +
            typeLbl+' &middot; '+(m.date?fmtDateShort(m.date):'-')+
            (m.openTime ? ' &middot; '+m.openTime+' - '+(m.closeTime||'?') : '') +
          '</div>' +
          (m.wajibIds && m.wajibIds.length > 0 ? '<div style="font-size:11px;color:var(--warning);margin-top:4px;">Wajib: '+m.wajibIds.length+' siswa</div>' : '') +
        '</div>' +
        '<span class="badge badge-primary">'+hadir+'/'+(totalStudents||total)+' hadir</span>' +
      '</div>' +
      '<div class="action-row" style="margin-top:10px;flex-wrap:wrap;">' +
        '<button class="btn btn-sm btn-primary" onclick="openIsiAbsensi(\''+m.id+'\')">'+ic('edit','sm')+' Isi Absensi</button>' +
        '<button class="btn btn-sm" onclick="openRekapMeeting(\''+m.id+'\')">'+ic('chart','sm')+' Rekap</button>' +
        (isGuru() ? '<button class="btn btn-sm btn-danger" onclick="hapusMeeting(\''+m.id+'\')">'+ic('trash','sm')+'</button>' : '') +
      '</div>' +
    '</div>';
  });

  openModal('Absensi', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openBuatMeeting = function(type, cid){
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];
  var titleMap = {rapat:'Buat Sesi Rapat', latihan:'Buat Sesi Latihan', gladi:'Buat Sesi Gladi'};

  var h = '';
  h += '<div class="alert alert-info">'+ic('info')+'<div>'+titleMap[type]+'</div></div>';
  h += '<div class="form-group"><label>Judul</label><input id="mt-title" maxlength="100" placeholder="Contoh: Latihan Rutin #1"></div>';
  h += '<div class="form-group"><label>Tanggal</label><input type="date" id="mt-date" value="'+new Date().toISOString().split('T')[0]+'"></div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group"><label>Jam Buka</label><input type="time" id="mt-open" value="14:00"></div>' +
    '<div class="form-group"><label>Jam Tutup</label><input type="time" id="mt-close" value="15:00"></div>' +
    '</div>';

  if (type === 'latihan' || type === 'gladi'){
    h += '<div class="form-group"><label>Pilih Peserta Wajib Hadir</label>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
      '<button type="button" class="btn btn-sm" onclick="mtSelectAll(true)">Semua</button>' +
      '<button type="button" class="btn btn-sm" onclick="mtSelectAll(false)">Kosongkan</button>' +
      '</div>' +
      '<div style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
    if (students.length === 0){
      h += '<div style="padding:10px;text-align:center;color:var(--text-muted);font-size:12px;">Belum ada siswa</div>';
    } else {
      students.forEach(function(s){
        h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
          '<input type="checkbox" class="mt-wajib-cb" value="'+s.id+'">' +
          '<span style="flex:1;font-weight:600;">'+esc(s.name)+'</span>' +
          '<span style="font-size:10.5px;color:var(--text-muted);">'+esc(roleLabel(s.role))+'</span>' +
        '</label>';
      });
    }
    h += '</div></div>';
  }

  h += '<button class="btn btn-primary btn-block btn-lg" onclick="simpanMeeting(\''+type+'\',\''+cid+'\')">'+ic('save')+' Buat Sesi</button>';
  openModal(titleMap[type], h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.mtSelectAll = function(checked){
  document.querySelectorAll('.mt-wajib-cb').forEach(function(cb){ cb.checked = checked; });
};

window.simpanMeeting = function(type, cid){
  var title = (document.getElementById('mt-title').value||'').trim();
  var date = document.getElementById('mt-date').value;
  var open = document.getElementById('mt-open').value || '14:00';
  var close = document.getElementById('mt-close').value || '15:00';
  if (!title || !date){ alert('Lengkapi judul dan tanggal'); return; }

  var wajibIds = [];
  if (type === 'latihan' || type === 'gladi'){
    document.querySelectorAll('.mt-wajib-cb:checked').forEach(function(cb){ wajibIds.push(cb.value); });
  }

  var id = uid();
  var m = {
    id: id, classId: cid, title: title, type: type,
    date: date, openTime: open, closeTime: close,
    wajibIds: wajibIds,
    records: {},
    createdAt: Date.now(),
    createdBy: u().name, createdById: uSid() || u().email
  };

  window.fbSet('meetings', id, m).then(function(){
    logAct('meeting_create', u().name+' buat '+type+': '+title, {classId:cid});
    // Notif ke siswa
    window.fbSet('notifications', uid(), {
      id: uid(), classId: cid,
      fromName: u().name, fromType: uType(),
      toId: 'all', type: 'tugas',
      title: '[ABSENSI] '+title,
      message: 'Jenis: '+type+'\nTanggal: '+date+'\nJam: '+open+' - '+close+
        (wajibIds.length > 0 ? '\n\nPeserta wajib hadir: '+wajibIds.length+' siswa' : ''),
      createdAt: Date.now(), readBy: [], doneBy: []
    });
    closeModal();
    alert('Sesi absensi dibuat!');
    setTimeout(function(){ window.openMeetingList(cid); }, 200);
  }).catch(function(e){ alert('Gagal: '+e.message); });
};

window.hapusMeeting = function(mid){
  var m = window.DB.meetings[mid];
  if (!m) return;
  if (!confirm('Hapus sesi "'+m.title+'"?')) return;
  window.fbDel('meetings', mid).then(function(){
    closeModal();
    setTimeout(function(){ window.openMeetingList(m.classId); }, 200);
  });
};

/* ============================================================
   11. ISI ABSENSI
   ============================================================ */
window.openIsiAbsensi = function(mid){
  var m = window.DB.meetings[mid];
  if (!m){ alert('Sesi tidak ditemukan'); return; }
  var c = findClass(m.classId);
  if (!c) return;
  var students = c.students || [];
  var sid = uSid();

  // Jika siswa: hanya bisa isi dirinya sendiri
  if (isSiswa()){
    var isWajib = !m.wajibIds || m.wajibIds.length === 0 || m.wajibIds.indexOf(sid) >= 0;
    var cur = (m.records && m.records[sid]) || '';
    var h = '<div class="alert alert-info">'+ic('calendar')+'<div><b>'+esc(m.title)+'</b><br><small>'+(m.date?fmtDateShort(m.date):'-')+
      (isWajib ? ' &middot; <span style="color:var(--warning);">WAJIB</span>' : '')+'</small></div></div>';
    if (!isWajib){
      h += '<div class="alert alert-warning">'+ic('info')+'<div>Anda tidak termasuk peserta wajib sesi ini.</div></div>';
    }
    var opts = [{v:'hadir',l:'Hadir'},{v:'izin',l:'Izin'},{v:'sakit',l:'Sakit'},{v:'telat',l:'Telat'},{v:'alpa',l:'Tidak Hadir'}];
    opts.forEach(function(o){
      h += '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid '+(cur===o.v?'var(--primary)':'var(--border)')+';border-radius:8px;margin-bottom:6px;cursor:pointer;'+(cur===o.v?'background:var(--primary-soft);':'')+'">' +
        '<input type="radio" name="att" value="'+o.v+'" '+(cur===o.v?'checked':'')+'><b>'+o.l+'</b>' +
      '</label>';
    });
    h += '<button class="btn btn-primary btn-block btn-lg" onclick="simpanAbsensiSiswa(\''+mid+'\')">'+ic('save')+' Simpan</button>';
    openModal('Isi Absensi', h);
    if (window.hydrateIcons) window.hydrateIcons();
    return;
  }

  // Jika guru: isi semua
  var h2 = '<div class="alert alert-info">'+ic('info')+'<div><b>'+esc(m.title)+'</b></div></div>';
  h2 += '<div class="action-row" style="margin-bottom:12px;">' +
    '<button class="btn btn-sm" onclick="setAllAtt(\''+mid+'\',\'hadir\')">Hadir Semua</button>' +
    '<button class="btn btn-sm" onclick="setAllAtt(\''+mid+'\',\'alpa\')">Alpa Semua</button>' +
    '</div>';
  h2 += '<div style="max-height:420px;overflow-y:auto;">';
  students.forEach(function(s){
    var r = (m.records && m.records[s.id]) || '';
    h2 += '<div style="padding:10px;border-bottom:1px solid var(--border);">' +
      '<div style="font-weight:700;font-size:12.5px;margin-bottom:6px;">'+esc(s.name)+' <small style="color:var(--text-muted);font-weight:400;">'+esc(roleLabel(s.role))+'</small>' +
      (m.wajibIds && m.wajibIds.indexOf(s.id) >= 0 ? ' <span class="badge badge-warning" style="font-size:9px;">Wajib</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap;">';
    ['hadir','izin','sakit','telat','alpa'].forEach(function(opt){
      var lbl = {hadir:'Hadir',izin:'Izin',sakit:'Sakit',telat:'Telat',alpa:'Alpa'}[opt];
      var color = {hadir:'success',izin:'info',sakit:'warning',telat:'warning',alpa:'danger'}[opt];
      h2 += '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:5px 9px;border-radius:6px;border:1px solid var(--border);cursor:pointer;background:'+(r===opt?'var(--'+color+'-soft)':'var(--surface)')+';font-weight:600;">' +
        '<input type="radio" name="att_'+s.id+'" value="'+opt+'" '+(r===opt?'checked':'')+' onchange="updateAttRecord(\''+mid+'\',\''+s.id+'\',\''+opt+'\')"> '+lbl +
      '</label>';
    });
    h2 += '</div></div>';
  });
  h2 += '</div>';
  h2 += '<button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="closeModal()">Selesai</button>';
  openModal('Absensi: '+esc(m.title), h2);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanAbsensiSiswa = function(mid){
  var sel = document.querySelector('input[name="att"]:checked');
  if (!sel){ alert('Pilih status kehadiran'); return; }
  var m = window.DB.meetings[mid];
  if (!m) return;
  var rec = Object.assign({}, m.records || {});
  rec[uSid()] = sel.value;
  window.fbSet('meetings', mid, {records: rec}).then(function(){
    logAct('meeting_attend', u().name+' isi absensi: '+sel.value, {classId:m.classId, role:uRole()});
    closeModal();
    alert('Absensi tersimpan');
  });
};

window.updateAttRecord = function(mid, sid, status){
  var m = window.DB.meetings[mid];
  if (!m) return;
  var rec = Object.assign({}, m.records || {});
  rec[sid] = status;
  window.fbSet('meetings', mid, {records: rec});
};

window.setAllAtt = function(mid, status){
  var m = window.DB.meetings[mid];
  if (!m) return;
  var c = findClass(m.classId);
  if (!c) return;
  if (!confirm('Set semua siswa menjadi "'+status+'"?')) return;
  var rec = {};
  (c.students||[]).forEach(function(s){ rec[s.id] = status; });
  window.fbSet('meetings', mid, {records: rec}).then(function(){
    closeModal();
    setTimeout(function(){ window.openIsiAbsensi(mid); }, 200);
  });
};

/* ============================================================
   12. REKAP MEETING
   ============================================================ */
window.openRekapMeeting = function(mid){
  var m = window.DB.meetings[mid];
  if (!m) return;
  var c = findClass(m.classId);
  if (!c) return;
  var h = '<div class="alert alert-info">'+ic('chart')+'<div><b>Rekap: '+esc(m.title)+'</b></div></div>';
  h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Status</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(s, i){
    var r = (m.records && m.records[s.id]) || '-';
    var color = r==='hadir'?'badge-success':r==='izin'?'badge-info':r==='sakit'?'badge-warning':r==='telat'?'badge-warning':r==='alpa'?'badge-danger':'badge-gray';
    h += '<tr><td>'+(i+1)+'</td><td>'+esc(s.name)+'</td><td><span class="badge '+color+'">'+esc(r)+'</span></td></tr>';
  });
  h += '</tbody></table></div>';
  openModal('Rekap Absensi', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   13. FAKTOR KEHADIRAN (Multiply ke Nilai)
   ============================================================ */
window.hitungFaktorKehadiran = function(cid, sid){
  var meetings = Object.values(window.DB.meetings || {}).filter(function(m){ return m.classId === cid; });
  if (meetings.length === 0) return null;
  var present = 0, total = 0;
  meetings.forEach(function(m){
    var r = m.records && m.records[sid];
    if (!r) return;
    total++;
    if (r === 'hadir') present += 1;
    else if (r === 'izin' || r === 'sakit') present += 0.75;
    else if (r === 'telat') present += 0.5;
    // alpa = 0
  });
  if (total === 0) return null;
  var pct = present / total;
  // Faktor antara 0.75 - 1.0
  return 0.75 + 0.25 * Math.min(1, Math.max(0, pct));
};

/* ============================================================
   14. BERI TUGAS (Multi-select + WA)
   ============================================================ */
window.openBeriTugas = function(cid){
  cid = cid || uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var students = (c.students || []).filter(function(s){
    return isGuru() || s.id !== uSid();
  });
  if (students.length === 0){ alert('Tidak ada siswa'); return; }

  var h = '';
  h += '<div class="alert alert-info">'+ic('send')+'<div><b>Beri Tugas</b> &mdash; pilih penerima + WA template</div></div>';
  h += '<div class="form-group"><label>Judul Tugas</label><input id="bt-title" maxlength="100"></div>';
  h += '<div class="form-group"><label>Deskripsi</label><textarea id="bt-desc" rows="3" maxlength="500"></textarea></div>';
  h += '<div class="form-group"><label>Deadline</label><input type="date" id="bt-deadline"></div>';
  h += '<div class="form-group"><label>Penerima</label>' +
    '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
    '<button type="button" class="btn btn-sm" onclick="btSelAll(true)">Semua</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelAll(false)">Kosongkan</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelRole(\'pemain\')">Pemain</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelRole(\'produksi\')">Produksi</button>' +
    '<button type="button" class="btn btn-sm" onclick="btSelRole(\'artistik\')">Artistik</button>' +
    '</div>' +
    '<div style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  students.forEach(function(s){
    var hasWA = s.phone && s.phone.replace(/\D/g,'').length >= 10;
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="bt-cb" value="'+s.id+'" data-name="'+esc(s.name)+'" data-role="'+esc(s.role)+'" data-phone="'+esc(s.phone||'')+'" checked>' +
      '<span style="flex:1;font-weight:600;">'+esc(s.name)+'</span>' +
      '<span style="font-size:10.5px;color:var(--text-muted);">'+esc(roleLabel(s.role))+'</span>' +
      (hasWA ? '<span class="badge badge-success" style="font-size:9px;">WA</span>' : '<span class="badge badge-gray" style="font-size:9px;">-</span>') +
    '</label>';
  });
  h += '</div></div>';
  h += '<div class="form-group"><label>Kirim Via</label><select id="bt-channel">' +
    '<option value="both">Notifikasi + WA</option>' +
    '<option value="app">Hanya Notifikasi</option>' +
    '<option value="wa">Hanya WhatsApp</option>' +
    '</select></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" onclick="doBeriTugas(\''+cid+'\')">'+ic('send')+' Kirim</button>';
  openModal('Beri Tugas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.btSelAll = function(c){ document.querySelectorAll('.bt-cb').forEach(function(cb){ cb.checked = c; }); };
window.btSelRole = function(filter){
  document.querySelectorAll('.bt-cb').forEach(function(cb){
    var role = cb.getAttribute('data-role') || '';
    var team = (window.ROLES[role]||{}).team || '';
    var match = false;
    if (filter === 'pemain') match = role === 'pemain';
    else if (filter === 'produksi') match = team === 'produksi';
    else if (filter === 'artistik') match = team === 'artistik';
    cb.checked = match;
  });
};

window.doBeriTugas = function(cid){
  var title = (document.getElementById('bt-title').value||'').trim();
  var desc = (document.getElementById('bt-desc').value||'').trim();
  var deadline = document.getElementById('bt-deadline').value;
  var channel = document.getElementById('bt-channel').value;
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
  var deadlineStr = deadline ? fmtDateShort(deadline) : 'tidak ada';
  var senderName = u().name;

  // Buat 1 task record + notifikasi ke masing-masing
  if (channel === 'app' || channel === 'both'){
    targets.forEach(function(t){
      window.fbSet('notifications', uid(), {
        id: uid(), classId: cid,
        fromId: uSid() || u().email || 'guru',
        fromName: senderName, fromType: uType(),
        toId: t.id, type: 'tugas',
        title: '[TUGAS] '+title,
        message: desc + (deadline ? '\n\nDeadline: '+deadlineStr : ''),
        taskId: taskId,
        createdAt: Date.now(), readBy: [], doneBy: []
      });
    });
  }

  // Simpan task record (untuk tracking)
  window.fbSet('tasks', taskId, {
    id: taskId, classId: cid,
    title: title, desc: desc, deadline: deadline || null,
    recipientIds: targets.map(function(t){ return t.id; }),
    fromId: uSid() || u().email || 'guru',
    fromName: senderName,
    createdAt: Date.now(),
    status: 'active'
  });

  logAct('task_create', senderName+' beri tugas "'+title+'" ke '+targets.length+' siswa', {classId:cid});

  closeModal();

  // Tampilkan panel WA
  var withWA = targets.filter(function(t){ return t.phone && t.phone.replace(/\D/g,'').length >= 10; });
  if ((channel === 'wa' || channel === 'both') && withWA.length > 0){
    window.__waTargets = withWA;
    window.__waTitle = title;
    window.__waMessage = desc + (deadline ? '\n\nDeadline: '+deadlineStr : '');
    window.__waSender = senderName;
    showWAPanel(withWA, title, window.__waMessage, senderName, cid);
  } else if (channel === 'wa' && withWA.length === 0){
    alert('Tidak ada penerima dengan No. WA valid. Cek data siswa.');
  } else {
    alert('Tugas terkirim ke '+targets.length+' siswa!');
  }
};

/* ============================================================
   15. WA PANEL & DEEP LINK
   ============================================================ */
function buildWAMessage(targetName, targetRole, title, message, senderName){
  return '*SP-PPT — SMP Negeri 10 Samarinda*\n' +
    '_'+title+'_\n\n' +
    'Yth. *'+targetName+'*\n' +
    '('+roleLabel(targetRole)+')\n\n' +
    message+'\n\n' +
    '—\nDari: '+senderName+'\n' +
    'Waktu: '+new Date().toLocaleString('id-ID');
}

function normalizePhone(p){
  p = String(p||'').replace(/\D/g,'');
  if (!p) return '';
  if (p.charAt(0) === '0') p = '62' + p.substring(1);
  if (p.substring(0,2) !== '62') p = '62' + p;
  return p;
}

window.__waTargets = [];
window.__waTitle = '';
window.__waMessage = '';
window.__waSender = '';
window.__waCid = null;

function showWAPanel(targets, title, message, senderName, cid){
  window.__waCid = cid;
  var h = '';
  h += '<div class="alert alert-info">'+ic('phone')+'<div><b>Kirim via WhatsApp</b><br><small>Klik tombol per penerima atau Buka Semua Berurutan</small></div></div>';
  h += '<div class="action-row" style="margin-bottom:12px;flex-wrap:wrap;">' +
    '<button class="btn btn-sm btn-primary" onclick="openAllWA()">'+ic('send','sm')+' Buka Semua Berurutan</button>' +
    '<button class="btn btn-sm" onclick="copyAllWAMessages()">'+ic('copy','sm')+' Copy Semua Pesan</button>' +
    '<span class="badge badge-warning" style="align-self:center;">'+targets.length+' penerima</span>' +
  '</div>';
  h += '<div style="max-height:400px;overflow-y:auto;">';
  targets.forEach(function(t, i){
    h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;flex-wrap:wrap;">' +
      '<div style="flex:1;min-width:150px;">' +
        '<div style="font-weight:700;font-size:13px;">'+esc(t.name)+'</div>' +
        '<div style="font-size:11.5px;color:var(--success);">'+ic('phone','sm')+' '+esc(t.phone)+'</div>' +
      '</div>' +
      '<button class="btn btn-sm btn-success" onclick="openWA('+i+')">'+ic('send','sm')+' Buka WA</button>' +
      '<span id="wa-status-'+i+'"></span>' +
    '</div>';
  });
  h += '</div>';
  h += '<div style="margin-top:14px;padding:12px;background:var(--surface);border-radius:8px;font-size:12px;color:var(--text-muted);line-height:1.6;">' +
    '<b>'+ic('info','sm')+' Catatan:</b><br>' +
    '&bull; WhatsApp Web harus sudah login (buka web.whatsapp.com)<br>' +
    '&bull; Setelah tab terbuka, klik tombol <b>Send</b> di WhatsApp<br>' +
    '&bull; Pesan otomatis terisi dari template<br>' +
  '</div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="closeModal()">Selesai</button>';
  openModal('Kirim via WhatsApp', h);
  if (window.hydrateIcons) window.hydrateIcons();
}

window.openWA = function(i){
  var t = window.__waTargets[i];
  if (!t) return;
  var phone = normalizePhone(t.phone);
  if (!phone){ alert('No. WA tidak valid'); return; }
  var body = buildWAMessage(t.name, t.role, window.__waTitle, window.__waMessage, window.__waSender);
  var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(body);
  window.open(url, '_blank');
  // Log
  var logId = uid();
  window.fbSet('wa_logs', logId, {
    id: logId, classId: window.__waCid || '',
    fromName: window.__waSender,
    toName: t.name, toPhone: phone, toRole: t.role,
    type: 'tugas', title: window.__waTitle, message: window.__waMessage,
    channel: 'wa', createdAt: Date.now()
  });
  var st = document.getElementById('wa-status-'+i);
  if (st) st.innerHTML = '<span class="badge badge-success">'+ic('check','sm')+' Dibuka</span>';
};

window.openAllWA = function(){
  var ts = window.__waTargets || [];
  if (ts.length === 0) return;
  if (!confirm('Buka '+ts.length+' tab WhatsApp berurutan? (jeda 1.2 detik)')) return;
  var i = 0;
  function next(){
    if (i >= ts.length){ alert('Selesai! '+ts.length+' tab dibuka.'); return; }
    window.openWA(i);
    i++;
    setTimeout(next, 1200);
  }
  next();
};

window.copyAllWAMessages = function(){
  var ts = window.__waTargets || [];
  if (ts.length === 0){ alert('Tidak ada penerima'); return; }
  var txt = '=== PENERIMA & PESAN ===\n\n';
  ts.forEach(function(t, i){
    var body = buildWAMessage(t.name, t.role, window.__waTitle, window.__waMessage, window.__waSender);
    txt += (i+1)+'. '+t.name+' ('+roleLabel(t.role)+')\n   WA: '+t.phone+'\n\n'+body+'\n\n---\n\n';
  });
  if (navigator.clipboard){
    navigator.clipboard.writeText(txt).then(function(){ alert('Semua pesan disalin ke clipboard!'); })
      .catch(function(){ prompt('Copy pesan berikut:', txt); });
  } else {
    prompt('Copy pesan berikut:', txt);
  }
};

/* ============================================================
   16. TANDAI TUGAS SELESAI (Siswa)
   ============================================================ */
window.tandaiTugasSelesai = function(notifId){
  var n = (window.DB.notifications||[]).find(function(x){ return x.id===notifId; });
  if (!n) return;
  var sid = uSid();
  if (!sid) return;
  var db = n.doneBy || [];
  if (db.indexOf(sid) >= 0){ alert('Tugas sudah ditandai selesai'); return; }
  db.push(sid);
  window.fbSet('notifications', notifId, Object.assign({}, n, {doneBy: db})).then(function(){
    logAct('task_done', u().name+' tandai tugas selesai: '+(n.title||''), {classId:n.classId});
    alert('Tugas ditandai selesai!');
    if (document.getElementById('notif-panel').classList.contains('open')){
      if (window.renderNotifPanel) window.renderNotifPanel();
    }
  });
};

/* ============================================================
   17. AUTO-INJECT KE MENU (tambahan opsi)
   ============================================================ */
// Hook renderSiswaDash untuk tambah tombol checklist & tugas
(function hookSiswa(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  // Tidak override, karena kita sudah punya menu di app.js
})();

console.log('[features-checklist] M3 loaded');

})();
