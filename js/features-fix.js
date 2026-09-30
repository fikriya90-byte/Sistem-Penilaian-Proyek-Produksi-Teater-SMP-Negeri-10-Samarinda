/* ============================================================
   SP-PPT features-fix.js — v9.0 FINAL
   Load PALING AKHIR di index.html (setelah features-extra.js)
   
   1. Alias fungsi hilang (24 fungsi)
   2. Fix bug tandaiTugasSelesai
   3. Kas Kelas SIMPLE (nama siswa, tanpa tim)
   4. Beri Tugas CEPAT (3 kolom)
   5. Keuangan + Peminjaman Barang
   6. Foto Profil di HEADER (avatar bulat)
   7. Toolbar MINIMALIS (3-4 tombol saja)
   8. Quick Action Cards di dashboard
   9. Menu pop-up prioritas (grid, bukan numpuk)
   ============================================================ */
(function(){
'use strict';

if (!window.DB || typeof window.ico !== 'function'){ console.error('[fix] app.js belum siap'); return; }

function ic(n,s){ return window.ico(n,s); }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('fx_'+Date.now().toString(36)+Math.random().toString(36).substr(2,5)); }
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
function roleLabel(r){ return (window.ROLES&&window.ROLES[r]&&window.ROLES[r].label)||r; }
function fmtDate(ts){ return window.fmtDate ? window.fmtDate(ts) : (ts?new Date(ts).toLocaleString('id-ID'):'-'); }
function fmtDateShort(s){ return window.fmtDateShort ? window.fmtDateShort(s) : (s?new Date(s).toLocaleDateString('id-ID'):'-'); }
function safeLS(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); return true; }catch(e){ return null; } }
function safeJSON(s,fb){ try{ var p=JSON.parse(s||'null'); return p==null?fb:p; }catch(e){ return fb; } }
function K(cid,name){ return 'sppt_'+name+'_'+cid; }

/* ============================================================
   CSS INJECT
   ============================================================ */
(function injectCSS(){
  if (document.getElementById('fix9-css')) return;
  var st = document.createElement('style');
  st.id = 'fix9-css';
  st.textContent = [
    /* Sembunyikan toolbar lama */
    '.toolbar-main, .extras-toolbar-top { display: none !important; }',
    
    /* Toolbar baru */
    '.mp-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;',
    'background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(59,130,246,.04));',
    'border-left:4px solid var(--primary);border-radius:10px;margin-bottom:14px;align-items:center;}',
    '.mp-toolbar .btn{padding:8px 12px;font-size:12px;min-height:36px;background:var(--card);',
    'border:1px solid var(--border);color:var(--text-strong);}',
    '.mp-toolbar .btn:hover{background:var(--primary-soft);color:var(--primary);border-color:var(--primary);}',
    '.mp-toolbar .btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark));',
    'color:#fff;border:none;}',
    '.mp-toolbar .btn-primary svg{stroke:#fff;}',
    
    /* Quick Action Cards */
    '.quick-actions{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));',
    'gap:10px;margin:0 0 18px 0;}',
    '.quick-card{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:8px;padding:16px 10px;background:var(--card);border:1.5px solid var(--border);',
    'border-radius:12px;cursor:pointer;font-family:inherit;color:var(--text);',
    'transition:.15s;min-height:110px;text-align:center;}',
    '.quick-card:hover{border-color:var(--primary);transform:translateY(-2px);',
    'box-shadow:0 6px 18px rgba(37,99,235,.12);}',
    '.quick-card .qc-icon{width:46px;height:46px;border-radius:12px;display:flex;',
    'align-items:center;justify-content:center;flex-shrink:0;}',
    '.quick-card .qc-label{font-size:12.5px;font-weight:700;color:var(--text-strong);line-height:1.3;}',
    
    /* Menu tile */
    '.fx-mi-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:6px;padding:12px 6px;background:var(--card);border:1.5px solid var(--border);',
    'border-radius:12px;cursor:pointer;font-family:inherit;color:var(--text);',
    'transition:.15s;min-height:88px;text-align:center;}',
    '.fx-mi-tile:hover{border-color:var(--primary);background:var(--primary-soft);transform:translateY(-2px);}',
    '.fx-mi-tile .fx-mi{width:38px;height:38px;border-radius:50%;background:var(--primary-soft);',
    'color:var(--primary);display:flex;align-items:center;justify-content:center;}',
    '.fx-mi-tile .fx-ml{font-size:11.5px;font-weight:600;line-height:1.25;color:var(--text-strong);}',
    '.fx-menu-section{font-size:10.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;',
    'letter-spacing:.6px;margin:14px 0 8px;display:flex;align-items:center;gap:6px;}',
    '.fx-menu-section:first-child{margin-top:0;}',
    '.fx-menu-scroll{max-height:70vh;overflow-y:auto;padding-right:4px;}',
    
    /* Foto Profil di Header */
    '.avatar-header{width:42px;height:42px;border-radius:50%;object-fit:cover;',
    'border:2px solid var(--border);flex-shrink:0;cursor:pointer;transition:.15s;}',
    '.avatar-header:hover{border-color:var(--primary);transform:scale(1.05);}',
    '.avatar-initials{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;',
    'justify-content:center;font-weight:800;font-size:16px;color:#fff;',
    'background:linear-gradient(135deg,var(--primary),var(--primary-dark));',
    'flex-shrink:0;cursor:pointer;border:2px solid var(--card);}',
    '.header-info.has-avatar{display:flex;align-items:center;gap:10px;}',
    '.header-info.has-avatar > .header-text-wrap{flex:1;min-width:0;}',
    
    /* Mobile */
    '@media (max-width:480px){',
    '.quick-actions{grid-template-columns:repeat(2,1fr);}',
    '.quick-card{min-height:96px;padding:12px 8px;}',
    '.quick-card .qc-icon{width:40px;height:40px;}',
    '.quick-card .qc-label{font-size:11.5px;}',
    '.fx-mi-tile{min-height:78px;padding:10px 4px;}',
    '.fx-mi-tile .fx-ml{font-size:10.5px;}',
    '.avatar-header,.avatar-initials{width:36px;height:36px;}',
    '.avatar-initials{font-size:14px;}',
    '}'
  ].join('');
  document.head.appendChild(st);
})();

/* ============================================================
   1. ALIAS FUNGSI HILANG
   ============================================================ */
window.openArsipNaskah = function(cid){ if (typeof window.openNaskahList === 'function') return window.openNaskahList(cid || uCid()); };
window.openBookingAlatMusik = function(){ if (typeof window.openBookingAlat === 'function') return window.openBookingAlat(); };
window.openChecklistView = function(cid){ if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(cid || uCid()); };
window.openStudentChecklistSelf = function(){ if (typeof window.openChecklistPribadi === 'function') return window.openChecklistPribadi(); };
window.openTimSaya = function(){ if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(uCid()); };
window.openGuruPasswordView = function(cid){ if (typeof window.lihatPassword === 'function') return window.lihatPassword(cid); };
window.openEditTeacherModal = window.openEditTeacherModal || window.openEditGuru;
window.openAddTeacherModal = window.openAddTeacherModal || window.openAddTeacher;
window.openCreateMeetingModalFull = function(type){
  type = type || 'rapat';
  if (typeof window.openBuatMeeting === 'function') return window.openBuatMeeting(type, uCid());
  if (typeof window.openMeetingList === 'function') return window.openMeetingList(uCid());
};
window.openKoordinasiAntarKelas = function(){ if (typeof window.openKoordinasi === 'function') return window.openKoordinasi(); };

/* ============================================================
   2. FIX BUG tandaiTugasSelesai
   ============================================================ */
window.tandaiTugasSelesai = function(id){
  var n = (window.DB.notifications||[]).find(function(x){ return x.id===id; });
  if (!n){ alert('Notifikasi tidak ditemukan'); return; }
  var me = window.currentUser || {};
  var key = me.studentId || me.email || 'anon';
  var db = (n.doneBy||[]).slice();
  if (db.indexOf(key) >= 0){ alert('Sudah ditandai selesai'); return; }
  db.push(key);
  window.fbSet('notifications', id, Object.assign({}, n, { doneBy: db })).then(function(){
    if (window.logActivity) window.logActivity('task_done', (me.name||'User')+' tandai selesai: '+(n.title||''), {classId:n.classId});
    alert('Tugas ditandai selesai!');
    if (window.renderNotifPanel) window.renderNotifPanel();
  });
};

/* ============================================================
   3. KAS KELAS — SIMPLE (nama siswa saja)
   ============================================================ */
function getKas(cid){
  var d = safeJSON(safeLS(K(cid,'kas')), null);
  if (!d) return {active:false, nama:'', nominal:0, payments:{}};
  return { active:!!d.active, nama:d.nama||'', nominal:d.nominal||0, payments:d.payments||{} };
}
function setKas(cid, data){
  safeLS(K(cid,'kas'), JSON.stringify(data));
  if (window.fbSet) window.fbSet('kas_kelas', cid, data).catch(function(){});
}

window.openKasKelas = function(){
  var cid = uCid(); if (!cid) return;
  var canEdit = uRole()==='bendahara' || isGuru();
  var data = getKas(cid);
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];

  var h = '<div class="alert alert-info">'+ic('briefcase')+'<div><b>Kas Kelas</b></div></div>';

  if (!data.active){
    h += '<div class="card" style="border-left:4px solid var(--warning);"><h3>'+ic('warning')+' Kas Belum Aktif</h3>'+
      '<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:12px;">Aktifkan dulu sebelum mencatat pembayaran.</p>';
    if (canEdit){
      h += '<div class="form-group"><label>Nama Kas</label>'+
        '<input id="fx-kas-nama" value="'+esc(data.nama||'Kas Kelas')+'"></div>'+
        '<div class="form-group"><label>Nominal (Rp)</label>'+
        '<input type="number" id="fx-kas-nominal" min="0" value="'+(data.nominal||10000)+'"></div>'+
        '<button class="btn btn-success btn-block btn-lg" data-fx="fxAktifkanKas" data-arg="'+cid+'">'+ic('check')+' Aktifkan Kas</button>';
    }
    h += '</div>';
    openModal('Kas Kelas', h);
    return;
  }

  var totalKumpul = 0, paid = 0;
  students.forEach(function(s){
    var pays = (data.payments[s.id]||[]);
    pays.forEach(function(p){ totalKumpul += p.nominal || data.nominal; });
    if (pays.length > 0) paid++;
  });
  var pct = students.length ? Math.round(paid/students.length*100) : 0;

  h += '<div class="progress-banner"><h3>'+ic('briefcase')+' '+esc(data.nama)+'</h3>'+
    '<div style="font-size:14px;">Rp '+data.nominal.toLocaleString('id-ID')+' / siswa</div>'+
    '<div class="big-count" style="font-size:22px;">'+paid+' / '+students.length+'</div>'+
    '<div class="pct">Terkumpul: <b>Rp '+totalKumpul.toLocaleString('id-ID')+'</b></div>'+
    '<div class="progress-container"><div class="progress-bar '+(pct===100?'complete':'partial')+'" style="width:'+pct+'%"></div></div>'+
    '</div>';

  if (canEdit){
    h += '<div class="action-row" style="margin-bottom:12px;">'+
      '<button class="btn btn-sm btn-danger" data-fx="fxDeactivateKas" data-arg="'+cid+'">'+ic('x','sm')+' Nonaktifkan</button>'+
      '<button class="btn btn-sm" data-fx="fxResetKas" data-arg="'+cid+'">'+ic('refresh','sm')+' Reset Semua</button>'+
      '</div>';
  }

  h += '<div class="table-wrap"><table><thead><tr>'+
    '<th style="width:40px;">No</th><th>Nama Siswa</th><th style="width:90px;">Status</th>'+
    '<th style="width:120px;">Total Bayar</th>'+(canEdit?'<th style="width:80px;"></th>':'')+
    '</tr></thead><tbody>';

  students.forEach(function(s, i){
    var pays = (data.payments[s.id]||[]);
    var isPaid = pays.length > 0;
    var total = 0;
    pays.forEach(function(p){ total += p.nominal || data.nominal; });
    h += '<tr>'+
      '<td>'+(i+1)+'</td>'+
      '<td><b>'+esc(s.name)+'</b><br><small style="color:var(--text-muted);font-size:10.5px;">'+esc(roleLabel(s.role))+'</small></td>'+
      '<td>'+(isPaid ? '<span class="badge badge-success">Lunas</span>' : '<span class="badge badge-warning">Belum</span>')+'</td>'+
      '<td>Rp '+total.toLocaleString('id-ID')+'</td>'+
      (canEdit?'<td>'+
        (isPaid ? '<button class="btn btn-sm btn-danger" data-fx="fxKasUnpaid" data-arg="'+cid+'|'+s.id+'">'+ic('x','sm')+'</button>'
                : '<button class="btn btn-sm btn-success" data-fx="fxKasPaid" data-arg="'+cid+'|'+s.id+'">'+ic('check','sm')+'</button>')+
        '</td>':'')+
      '</tr>';
  });
  h += '</tbody></table></div>';

  openModal('Kas Kelas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxAktifkanKas = function(cid){
  var nama = (document.getElementById('fx-kas-nama').value||'').trim();
  var nominal = parseFloat(document.getElementById('fx-kas-nominal').value)||0;
  if (!nama || nominal<=0){ alert('Lengkapi'); return; }
  var data = getKas(cid);
  data.active = true; data.nama = nama; data.nominal = nominal;
  if (!data.payments) data.payments = {};
  setKas(cid, data);
  alert('Kas diaktifkan!');
  window.openKasKelas();
};
window.fxDeactivateKas = function(cid){
  if (!confirm('Nonaktifkan kas?')) return;
  var data = getKas(cid); data.active = false;
  setKas(cid, data);
  window.openKasKelas();
};
window.fxResetKas = function(cid){
  if (!confirm('Reset semua pembayaran?')) return;
  var data = getKas(cid); data.payments = {};
  setKas(cid, data);
  window.openKasKelas();
};
window.fxKasPaid = function(arg){
  var p = String(arg).split('|'), cid = p[0], sid = p[1];
  var data = getKas(cid);
  if (!data.payments) data.payments = {};
  if (!data.payments[sid]) data.payments[sid] = [];
  data.payments[sid].push({ tanggal: new Date().toISOString().split('T')[0], nominal: data.nominal, by: u().name, at: Date.now() });
  setKas(cid, data);
  window.openKasKelas();
};
window.fxKasUnpaid = function(arg){
  var p = String(arg).split('|'), cid = p[0], sid = p[1];
  if (!confirm('Hapus pembayaran terakhir?')) return;
  var data = getKas(cid);
  if (data.payments && data.payments[sid] && data.payments[sid].length) data.payments[sid].pop();
  setKas(cid, data);
  window.openKasKelas();
};

window.checkKasReminder = function(cid, sid){
  var data = getKas(cid);
  if (!data.active) return null;
  var pays = (data.payments||{})[sid] || [];
  if (pays.length > 0) return null;
  return 'Anda belum membayar <b>'+esc(data.nama)+'</b> (Rp '+(data.nominal||0).toLocaleString('id-ID')+')';
};

/* ============================================================
   4. BERI TUGAS CEPAT (3 kolom)
   ============================================================ */
window.openBeriTugasCepat = function(){
  var cid = uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var role = uRole();
  var canSend = isGuru() || ['pimpinan_produksi','sutradara','asisten_sutradara'].indexOf(role)>=0 || role.indexOf('koor_')===0;
  if (!canSend){ alert('Tidak punya akses'); return; }

  var students = (c.students||[]).filter(function(s){ return s.id !== uSid(); });
  if (!students.length){ alert('Tidak ada siswa lain'); return; }

  var h = '';
  h += '<div class="alert alert-info">'+ic('send')+'<div><b>Kirim Tugas Cepat</b><br><small>Isi 3 kolom, langsung kirim ke banyak siswa</small></div></div>';
  h += '<div class="form-group"><label>Judul Tugas *</label><input id="fx-bt-title" maxlength="80" placeholder="Contoh: Setor hafalan adegan 1"></div>';
  h += '<div class="form-group"><label>Keterangan (opsional)</label><textarea id="fx-bt-desc" rows="2" maxlength="300"></textarea></div>';
  h += '<div class="form-group"><label>Deadline (opsional)</label><input type="date" id="fx-bt-deadline" value="'+new Date(Date.now()+7*86400000).toISOString().split('T')[0]+'"></div>';
  h += '<div class="form-group"><label>Penerima</label>'+
    '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">'+
    '<button type="button" class="btn btn-sm" data-fx="fxBtAll">Pilih Semua</button>'+
    '<button type="button" class="btn btn-sm" data-fx="fxBtNone">Kosongkan</button>'+
    '<button type="button" class="btn btn-sm" data-fx="fxBtByRole" data-arg="pemain">Pemain</button>'+
    '<button type="button" class="btn btn-sm" data-fx="fxBtByTeam" data-arg="produksi">Tim Produksi</button>'+
    '<button type="button" class="btn btn-sm" data-fx="fxBtByTeam" data-arg="artistik">Tim Artistik</button>'+
    '</div>'+
    '<div style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px;background:var(--surface);">';
  students.forEach(function(s){
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">'+
      '<input type="checkbox" class="fx-bt-cb" value="'+s.id+'" checked>'+
      '<span style="flex:1;font-weight:600;">'+esc(s.name)+'</span>'+
      '<span style="font-size:10px;color:var(--text-muted);">'+esc(roleLabel(s.role))+'</span>'+
      '</label>';
  });
  h += '</div></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" data-fx="fxKirimTugasCepat" data-arg="'+cid+'">'+ic('send')+' Kirim Tugas</button>';
  openModal('Beri Tugas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxBtAll = function(){ document.querySelectorAll('.fx-bt-cb').forEach(function(cb){ cb.checked = true; }); };
window.fxBtNone = function(){ document.querySelectorAll('.fx-bt-cb').forEach(function(cb){ cb.checked = false; }); };
window.fxBtByRole = function(role){
  var c = findClass(uCid());
  document.querySelectorAll('.fx-bt-cb').forEach(function(cb){
    var st = (c.students||[]).find(function(s){ return s.id===cb.value; });
    cb.checked = st && st.role === role;
  });
};
window.fxBtByTeam = function(team){
  var c = findClass(uCid());
  document.querySelectorAll('.fx-bt-cb').forEach(function(cb){
    var st = (c.students||[]).find(function(s){ return s.id===cb.value; });
    cb.checked = st && (window.ROLES[st.role]||{}).team === team;
  });
};

window.fxKirimTugasCepat = function(cid){
  var title = (document.getElementById('fx-bt-title').value||'').trim();
  var desc = (document.getElementById('fx-bt-desc').value||'').trim();
  var dl = document.getElementById('fx-bt-deadline').value;
  if (!title){ alert('Judul wajib'); return; }

  var targets = [];
  document.querySelectorAll('.fx-bt-cb:checked').forEach(function(cb){ targets.push(cb.value); });
  if (!targets.length){ alert('Pilih minimal 1 penerima'); return; }

  var me = window.currentUser || {};
  var msg = desc + (dl ? '\n\n⏰ Deadline: '+fmtDateShort(dl) : '');
  var promises = targets.map(function(tid){
    var nid = uid();
    return window.fbSet('notifications', nid, {
      id: nid, classId: cid,
      fromId: me.studentId || me.email || 'guru',
      fromName: me.name || 'Guru',
      fromType: uType(), fromRole: uRole(),
      toId: tid, type: 'tugas',
      title: '[TUGAS] '+title,
      message: msg,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
  });
  Promise.all(promises).then(function(){
    if (window.logActivity) window.logActivity('task_create', me.name+' kirim tugas "'+title+'" ke '+targets.length+' siswa', {classId:cid});
    alert('Tugas terkirim ke '+targets.length+' siswa!');
    closeModal();
  }).catch(function(err){ alert('Gagal: '+err.message); });
};

/* ============================================================
   5. KEUANGAN + PEMINJAMAN
   ============================================================ */
function getKeuangan(cid){
  var d = safeJSON(safeLS(K(cid,'keuangan')), null);
  if (!d) return { tx: [] };
  return { tx: Array.isArray(d.tx)?d.tx:[] };
}
function setKeuangan(cid, data){
  safeLS(K(cid,'keuangan'), JSON.stringify(data));
  if (window.fbSet) window.fbSet('keuangan', cid, data).catch(function(){});
}
window.openKeuangan = function(){ window.openKeuanganModal(); };
window.openKeuanganModal = function(){
  var cid = uCid(); if (!cid) return;
  var canEdit = uRole()==='bendahara' || isGuru();
  var data = getKeuangan(cid);
  var masuk = 0, keluar = 0;
  data.tx.forEach(function(t){ if(t.type==='masuk') masuk += t.amount||0; else keluar += t.amount||0; });
  var saldo = masuk - keluar;

  var h = '<div class="alert alert-info">'+ic('chart')+'<div><b>Keuangan Kelas</b></div></div>';
  h += '<div class="grid" style="margin-bottom:16px;">'+
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Pemasukan</div><div style="font-size:20px;font-weight:800;color:var(--success);">Rp '+masuk.toLocaleString('id-ID')+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--danger);"><div style="font-size:11.5px;">Pengeluaran</div><div style="font-size:20px;font-weight:800;color:var(--danger);">Rp '+keluar.toLocaleString('id-ID')+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;">Saldo</div><div style="font-size:20px;font-weight:800;">Rp '+saldo.toLocaleString('id-ID')+'</div></div>'+
    '</div>';
  if (canEdit) h += '<div class="action-row" style="margin-bottom:12px;">'+
    '<button class="btn btn-sm btn-success" data-fx="fxAddTx" data-arg="'+cid+'|masuk">'+ic('plus','sm')+' Pemasukan</button>'+
    '<button class="btn btn-sm btn-danger" data-fx="fxAddTx" data-arg="'+cid+'|keluar">'+ic('plus','sm')+' Pengeluaran</button></div>';
  if (!data.tx.length) h += '<div class="empty-state">'+ic('chart',40)+'<p>Belum ada transaksi</p></div>';
  else {
    h += '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Jumlah</th>'+(canEdit?'<th></th>':'')+'</tr></thead><tbody>';
    data.tx.slice().reverse().forEach(function(t){
      h += '<tr><td>'+esc(t.date||'-')+'</td>'+
        '<td><span class="badge '+(t.type==='masuk'?'badge-success':'badge-danger')+'">'+esc(t.type)+'</span></td>'+
        '<td>'+esc(t.category||'-')+'</td>'+
        '<td>Rp '+(t.amount||0).toLocaleString('id-ID')+'</td>'+
        (canEdit?'<td><button class="btn btn-sm btn-danger" data-fx="fxDelTx" data-arg="'+cid+'|'+t.id+'">'+ic('trash','sm')+'</button></td>':'')+
        '</tr>';
    });
    h += '</tbody></table></div>';
  }
  openModal('Keuangan Kelas', h);
};
window.fxAddTx = function(arg){
  var p = String(arg).split('|'), cid = p[0], type = p[1];
  openModal('Tambah '+(type==='masuk'?'Pemasukan':'Pengeluaran'),
    '<div class="form-group"><label>Kategori</label><input id="fx-tx-cat"></div>'+
    '<div class="form-group"><label>Jumlah (Rp)</label><input type="number" id="fx-tx-amt" min="0"></div>'+
    '<div class="form-group"><label>Tanggal</label><input type="date" id="fx-tx-date" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxSaveTx" data-arg="'+cid+'|'+type+'">'+ic('save')+' Simpan</button>');
};
window.fxSaveTx = function(arg){
  var p = String(arg).split('|'), cid = p[0], type = p[1];
  var cat = (document.getElementById('fx-tx-cat').value||'').trim();
  var amt = parseFloat(document.getElementById('fx-tx-amt').value)||0;
  var dt = document.getElementById('fx-tx-date').value;
  if (!cat || amt<=0){ alert('Lengkapi'); return; }
  var data = getKeuangan(cid);
  data.tx.push({id:uid(), type:type, category:cat, amount:amt, date:dt, by:u().name, at:Date.now()});
  setKeuangan(cid, data);
  closeModal();
  setTimeout(window.openKeuanganModal, 200);
};
window.fxDelTx = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Hapus?')) return;
  var data = getKeuangan(cid);
  data.tx = data.tx.filter(function(x){ return x.id!==id; });
  setKeuangan(cid, data);
  window.openKeuanganModal();
};

function getPinjam(cid){
  var d = safeJSON(safeLS(K(cid,'pinjam')), null);
  if (!d || !Array.isArray(d.items)) return { items: [] };
  return d;
}
function setPinjam(cid, data){
  safeLS(K(cid,'pinjam'), JSON.stringify(data));
  if (window.fbSet) window.fbSet('peminjaman_barang', cid, data).catch(function(){});
}
window.openPeminjamanBarang = function(){
  var cid = uCid(); if (!cid) return;
  var canEdit = uRole()==='koor_perlengkapan' || uRole()==='anggota_perlengkapan' || isGuru();
  var data = getPinjam(cid);
  var aktif = data.items.filter(function(x){ return x.status==='dipinjam'; });
  var selesai = data.items.filter(function(x){ return x.status==='dikembalikan'; });
  var h = '<div class="alert alert-info">'+ic('briefcase')+'<div><b>Peminjaman Barang</b></div></div>';
  h += '<div class="grid" style="margin-bottom:12px;">'+
    '<div class="card" style="border-left:4px solid var(--warning);"><div style="font-size:11.5px;">Dipinjam</div><div style="font-size:20px;font-weight:800;">'+aktif.length+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Dikembalikan</div><div style="font-size:20px;font-weight:800;">'+selesai.length+'</div></div></div>';
  if (canEdit) h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" data-fx="fxAddPinjam" data-arg="'+cid+'">'+ic('plus','sm')+' Catat</button>';
  if (!data.items.length) h += '<div class="empty-state">'+ic('briefcase',40)+'<p>Belum ada catatan</p></div>';
  else aktif.concat(selesai).forEach(function(it){
    var isAktif = it.status === 'dipinjam';
    h += '<div class="card" style="margin-bottom:8px;border-left:4px solid '+(isAktif?'var(--warning)':'var(--success)')+';">'+
      '<div style="font-weight:700;">'+esc(it.nama)+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);">Peminjam: <b>'+esc(it.peminjam||'-')+'</b> · Jumlah: '+it.jumlah+'</div>'+
      (canEdit?'<div class="action-row" style="margin-top:8px;">'+
        (isAktif?'<button class="btn btn-sm btn-success" data-fx="fxMarkKembali" data-arg="'+cid+'|'+it.id+'">'+ic('check','sm')+' Kembalikan</button>':'')+
        '<button class="btn btn-sm btn-danger" data-fx="fxDelPinjam" data-arg="'+cid+'|'+it.id+'">'+ic('trash','sm')+'</button></div>':'')+
      '</div>';
  });
  openModal('Peminjaman Barang', h);
};
window.fxAddPinjam = function(cid){
  openModal('Catat Peminjaman',
    '<div class="form-group"><label>Nama Barang</label><input id="fx-pj-nama"></div>'+
    '<div class="form-group"><label>Jumlah</label><input type="number" id="fx-pj-jumlah" value="1" min="1"></div>'+
    '<div class="form-group"><label>Peminjam</label><input id="fx-pj-peminjam"></div>'+
    '<div class="form-group"><label>Tanggal</label><input type="date" id="fx-pj-tgl" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxSavePinjam" data-arg="'+cid+'">'+ic('save')+' Simpan</button>');
};
window.fxSavePinjam = function(cid){
  var nama = (document.getElementById('fx-pj-nama').value||'').trim();
  if (!nama){ alert('Nama wajib'); return; }
  var data = getPinjam(cid);
  data.items.push({
    id:uid(), nama:nama,
    jumlah:parseInt(document.getElementById('fx-pj-jumlah').value)||1,
    peminjam:(document.getElementById('fx-pj-peminjam').value||'').trim(),
    tanggalPinjam:document.getElementById('fx-pj-tgl').value,
    status:'dipinjam', createdAt:Date.now()
  });
  setPinjam(cid, data);
  closeModal();
  window.openPeminjamanBarang();
};
window.fxMarkKembali = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Tandai dikembalikan?')) return;
  var data = getPinjam(cid);
  data.items = data.items.map(function(x){
    if (x.id !== id) return x;
    return Object.assign({}, x, {status:'dikembalikan', tanggalKembaliAktual: new Date().toISOString().split('T')[0]});
  });
  setPinjam(cid, data);
  window.openPeminjamanBarang();
};
window.fxDelPinjam = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Hapus?')) return;
  var data = getPinjam(cid);
  data.items = data.items.filter(function(x){ return x.id !== id; });
  setPinjam(cid, data);
  window.openPeminjamanBarang();
};

/* ============================================================
   6. FOTO PROFIL — Upload + Tampil di HEADER
   ============================================================ */
function getMyPhoto(){
  var cid = uCid(); if (!cid) return null;
  var c = findClass(cid); if (!c) return null;
  var sid = uSid(); if (!sid) return null;
  var s = (c.students||[]).find(function(x){ return x.id === sid; });
  return s && s.foto;
}

window.openUploadFotoProfil = function(){
  if (!isSiswa()){ alert('Hanya siswa'); return; }
  var myPhoto = getMyPhoto();
  var h = '<div class="alert alert-info">'+ic('user')+'<div>Foto profil tampil di <b>header</b> & <b>struktur kerabat</b>.<br>Maks <b>200 KB</b>, JPG/PNG.</div></div>';
  if (myPhoto){
    h += '<div style="text-align:center;margin-bottom:14px;"><img src="'+esc(myPhoto)+'" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid var(--primary);"></div>';
  }
  h += '<div class="form-group"><label>Pilih Foto</label><input type="file" id="fx-foto-input" accept="image/*" style="padding:8px;width:100%;"></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" data-fx="fxSaveFoto">'+ic('save')+' Simpan Foto</button>';
  if (myPhoto) h += '<button class="btn btn-danger btn-block" style="margin-top:8px;" data-fx="fxHapusFoto">'+ic('trash')+' Hapus Foto</button>';
  openModal('Foto Profil', h);
};

window.fxSaveFoto = function(){
  var el = document.getElementById('fx-foto-input');
  if (!el || !el.files || !el.files[0]){ alert('Pilih foto'); return; }
  var f = el.files[0];
  if (f.size > 200*1024){ alert('Foto terlalu besar (maks 200 KB)'); return; }
  var me = window.currentUser || {};
  var cid = uCid(); if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var c = findClass(cid); if (!c) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var dataUrl = e.target.result;
    var students = (c.students||[]).map(function(s){
      if (s.id !== me.studentId) return s;
      return Object.assign({}, s, {foto: dataUrl});
    });
    window.fbSet('classes', cid, Object.assign({}, c, {students: students})).then(function(){
      me.foto = dataUrl;
      if (window.saveSession) window.saveSession();
      alert('Foto tersimpan!');
      closeModal();
      renderHeaderAvatar();
    }).catch(function(err){ alert('Gagal: '+err.message); });
  };
  reader.readAsDataURL(f);
};

window.fxHapusFoto = function(){
  if (!confirm('Hapus foto profil?')) return;
  var me = window.currentUser || {};
  var cid = uCid();
  var c = findClass(cid); if (!c) return;
  var students = (c.students||[]).map(function(s){
    if (s.id !== me.studentId) return s;
    var x = Object.assign({}, s); delete x.foto; return x;
  });
  window.fbSet('classes', cid, Object.assign({}, c, {students: students})).then(function(){
    delete me.foto;
    if (window.saveSession) window.saveSession();
    alert('Foto dihapus');
    closeModal();
    renderHeaderAvatar();
  });
};

function renderHeaderAvatar(){
  if (!isSiswa()) return;
  var headerInfo = document.querySelector('.header-info');
  if (!headerInfo) return;

  var old = headerInfo.querySelector('.avatar-header, .avatar-initials');
  if (old) old.remove();

  var me = window.currentUser || {};
  var photo = getMyPhoto();

  var inner = headerInfo.querySelector('.header-text-wrap');
  if (!inner){
    var children = Array.from(headerInfo.children);
    inner = document.createElement('div');
    inner.className = 'header-text-wrap';
    inner.style.cssText = 'flex:1;min-width:0;';
    children.forEach(function(ch){ inner.appendChild(ch); });
    headerInfo.innerHTML = '';
    headerInfo.appendChild(inner);
  }

  var avatar;
  if (photo){
    avatar = document.createElement('img');
    avatar.src = photo;
    avatar.className = 'avatar-header';
    avatar.alt = me.name || '';
    avatar.title = 'Klik untuk ubah foto';
    avatar.onclick = window.openUploadFotoProfil;
  } else {
    avatar = document.createElement('div');
    avatar.className = 'avatar-initials';
    avatar.textContent = (me.name||'?').charAt(0).toUpperCase();
    avatar.title = 'Klik untuk upload foto';
    avatar.onclick = window.openUploadFotoProfil;
  }

  headerInfo.classList.add('has-avatar');
  headerInfo.insertBefore(avatar, inner);
}

/* ============================================================
   7. TOOLBAR MINIMALIS
   ============================================================ */
function getToolbarItems(){
  var role = uRole();
  var t = uType();
  if (t === 'guru' || t === 'admin'){
    return [
      {i:'gear',    l:'Menu',       a:'openMainMenu', primary:true},
      {i:'send',    l:'Beri Tugas', a:'openBeriTugasCepat'},
      {i:'chart',   l:'Analitik',   a:'openAnalitikGuru'},
      {i:'user',    l:'Profil',     a:'openGuruProfile'}
    ];
  }
  var items = [
    {i:'gear',        l:'Menu',       a:'openMainMenu', primary:true},
    {i:'clipboard',   l:'Tugas Saya', a:'openTugasSaya'},
    {i:'checkSquare', l:'Checklist',  a:'openChecklistPribadi'}
  ];
  if (['pimpinan_produksi','sutradara','asisten_sutradara'].indexOf(role) >= 0){
    items.push({i:'send', l:'Beri Tugas', a:'openBeriTugasCepat'});
  }
  if (role === 'bendahara'){
    items.push({i:'briefcase', l:'Kas', a:'openKasKelas'});
  }
  return items;
}

window.injectToolbar = function(){
  var mc = document.getElementById('main-content');
  if (!mc || !window.currentUser) return;

  var old = mc.querySelectorAll('.toolbar-main, .mp-toolbar, .extras-toolbar-top');
  for (var i = 0; i < old.length; i++) old[i].remove();

  var items = getToolbarItems();
  if (!items.length) return;

  var h = '<div class="mp-toolbar">';
  items.forEach(function(it){
    h += '<button class="btn '+(it.primary?'btn-primary':'')+'" data-fx-menu="'+it.a+'">'+
      ic(it.i,'sm')+' '+esc(it.l)+'</button>';
  });
  h += '</div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = h;
  if (mc.firstChild) mc.insertBefore(wrap.firstElementChild, mc.firstChild);
  else mc.appendChild(wrap.firstElementChild);
};

/* ============================================================
   8. QUICK ACTION CARDS (di dashboard)
   ============================================================ */
function getQuickActions(){
  var role = uRole();
  if (isGuru()) return [];
  
  var common = [
    {i:'clipboard',   l:'Tugas Saya', c:'primary', a:'openTugasSaya'},
    {i:'checkSquare', l:'Checklist',  c:'success', a:'openChecklistPribadi'},
    {i:'edit',        l:'Beri Nilai', c:'info',    a:'openPenilaianSiswaDashboard'},
    {i:'clock',       l:'Deadline',   c:'warning', a:'openDeadlineList'}
  ];
  var byRole = {
    bendahara: [
      {i:'briefcase', l:'Kas Kelas', a:'openKasKelas', c:'success'},
      {i:'chart',     l:'Keuangan',  a:'openKeuangan', c:'primary'}
    ],
    pimpinan_produksi: [
      {i:'send',   l:'Beri Tugas', a:'openBeriTugasCepat', c:'primary'},
      {i:'layers', l:'Tahapan',    a:'openSistemTahapan',  c:'info'}
    ],
    sutradara: [
      {i:'send',   l:'Beri Tugas', a:'openBeriTugasCepat', c:'primary'},
      {i:'layers', l:'Tahapan',    a:'openSistemTahapan',  c:'info'}
    ],
    koor_perlengkapan: [
      {i:'briefcase', l:'Peminjaman', a:'openPeminjamanBarang', c:'success'},
      {i:'send',      l:'Beri Tugas', a:'openBeriTugasCepat',   c:'primary'}
    ],
    koor_musik: [
      {i:'briefcase', l:'Booking',    a:'openBookingAlat',    c:'info'},
      {i:'send',      l:'Beri Tugas', a:'openBeriTugasCepat', c:'primary'}
    ]
  };
  var roleSpecific = byRole[role] || [];
  if (role.indexOf('koor_') === 0 && roleSpecific.length === 0){
    roleSpecific = [{i:'send', l:'Beri Tugas', a:'openBeriTugasCepat', c:'primary'}];
  }
  return roleSpecific.concat(common).slice(0, 6);
}

function injectQuickActions(){
  if (!isSiswa()) return;
  var mc = document.getElementById('main-content');
  if (!mc) return;
  var existing = mc.querySelector('.quick-actions-wrap');
  if (existing) existing.remove();

  var actions = getQuickActions();
  if (!actions.length) return;

  var colorMap = {
    primary: ['var(--primary-soft)', 'var(--primary)'],
    success: ['var(--success-soft)', 'var(--success)'],
    info:    ['var(--info-soft)',    'var(--info)'],
    warning: ['var(--warning-soft)', 'var(--warning)'],
    danger:  ['var(--danger-soft)',  'var(--danger)']
  };

  var h = '<div class="quick-actions-wrap" style="margin-bottom:18px;">';
  h += '<div style="font-size:11.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+ic('star','sm')+' Aksi Cepat</div>';
  h += '<div class="quick-actions">';
  actions.forEach(function(a){
    var cs = colorMap[a.c] || colorMap.primary;
    h += '<button class="quick-card" data-fx-menu="'+a.a+'">'+
      '<div class="qc-icon" style="background:'+cs[0]+';color:'+cs[1]+';">'+ic(a.i,22)+'</div>'+
      '<div class="qc-label">'+esc(a.l)+'</div>'+
    '</button>';
  });
  h += '</div></div>';

  var tb = mc.querySelector('.mp-toolbar');
  var wrap = document.createElement('div');
  wrap.innerHTML = h;
  if (tb && tb.nextSibling) tb.parentNode.insertBefore(wrap.firstElementChild, tb.nextSibling);
  else if (tb) tb.parentNode.appendChild(wrap.firstElementChild);
  else mc.insertBefore(wrap.firstElementChild, mc.firstChild);
}

/* ============================================================
   9. MENU POP-UP — PRIORITAS
   ============================================================ */
function tileGrid(items){
  var o = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  items.forEach(function(it){
    o += '<button class="fx-mi-tile" data-fx-menu="'+it.a+'">'+
      '<div class="fx-mi">'+ic(it.i,20)+'</div>'+
      '<div class="fx-ml">'+esc(it.l)+'</div></button>';
  });
  return o + '</div>';
}
function sectionHeader(icon, label){
  return '<div class="fx-menu-section">'+ic(icon,'sm')+' '+label+'</div>';
}

window.openSiswaMenu = function(){
  var role = uRole();
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">'+
    ic('user','lg')+'<div style="flex:1;min-width:0;"><b>'+esc(u().name||'')+'</b><br>'+
    '<small style="color:var(--text-muted);">'+esc(roleLabel(role))+'</small></div>'+
    '<button class="btn btn-sm" data-fx-menu="openUploadFotoProfil">'+ic('user','sm')+' Foto</button>'+
    '</div>';

  /* PRIORITAS 1 — Tugas & Nilai */
  h += sectionHeader('clipboard','Tugas & Nilai');
  h += tileGrid([
    {i:'clipboard',   l:'Tugas Saya',  a:'openTugasSaya'},
    {i:'checkSquare', l:'Checklist',   a:'openChecklistPribadi'},
    {i:'edit',        l:'Beri Nilai',  a:'openPenilaianSiswaDashboard'},
    {i:'target',      l:'Rubrik',      a:'openRubrikPenilaian'},
    {i:'clock',       l:'Deadline',    a:'openDeadlineList'},
    {i:'users',       l:'Checklist Tim',a:'openChecklistTim'}
  ]);

  /* PRIORITAS 2 — Peran Khusus */
  var kItems = [];
  if (role === 'bendahara'){
    kItems.push({i:'briefcase', l:'Kas',       a:'openKasKelas'});
    kItems.push({i:'chart',     l:'Keuangan',  a:'openKeuangan'});
  }
  if (['koor_perlengkapan','anggota_perlengkapan'].indexOf(role) >= 0)
    kItems.push({i:'briefcase', l:'Peminjaman', a:'openPeminjamanBarang'});
  if (['pimpinan_produksi','sutradara','koor_musik','koor_perlengkapan'].indexOf(role) >= 0)
    kItems.push({i:'briefcase', l:'Booking',    a:'openBookingAlat'});
  if (['pimpinan_produksi','sutradara','asisten_sutradara'].indexOf(role) >= 0)
    kItems.push({i:'send',      l:'Beri Tugas', a:'openBeriTugasCepat'});
  if (['pimpinan_produksi','sekretaris','sutradara'].indexOf(role) >= 0)
    kItems.push({i:'layers',    l:'Tahapan',    a:'openSistemTahapan'});
  if (role.indexOf('koor_') === 0 && kItems.length === 0)
    kItems.push({i:'send', l:'Beri Tugas', a:'openBeriTugasCepat'});
  if (kItems.length){
    h += sectionHeader('star','Khusus '+esc(roleLabel(role)));
    h += tileGrid(kItems);
  }

  /* PRIORITAS 3 — Tim & Jadwal */
  h += sectionHeader('users','Tim & Jadwal');
  h += tileGrid([
    {i:'award',    l:'Kerabat Kerja', a:'openStrukturKerabatKerja'},
    {i:'chart',    l:'Progres Divisi',a:'openDivisionProgressSelf'},
    {i:'calendar', l:'Absensi',       a:'openMeetingList'},
    {i:'clock',    l:'Jadwal Latihan',a:'openJadwalLatihan'},
    {i:'image',    l:'Kalender Konten',a:'openKalenderKonten'},
    {i:'activity', l:'Aktivitas',     a:'openActivityFeedModal'}
  ]);

  /* PRIORITAS 4 — Dokumen */
  h += sectionHeader('folder','Dokumen');
  h += tileGrid([
    {i:'fileText', l:'Dokumen Saya', a:'openDokumenSaya'},
    {i:'book',     l:'Arsip Naskah', a:'openNaskahList'}
  ]);

  /* PRIORITAS 5 — Sistem */
  h += sectionHeader('gear','Sistem');
  h += tileGrid([
    {i:'warning',       l:'Aduan',  a:'openAduanSiswa'},
    {i:'messageCircle', l:'Koordinasi', a:'openKoordinasiAntarKelas'},
    {i:'key',           l:'Password', a:'openChangePassword'},
    {i:'out',           l:'Keluar', a:'logout'}
  ]);

  h += '</div>';
  openModal('Menu', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openGuruMenu = function(){
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">'+
    ic('user','lg')+'<div style="flex:1;min-width:0;"><b>'+esc(u().name||'')+'</b><br>'+
    '<small style="color:var(--text-muted);">Guru Pengampu</small></div></div>';

  h += sectionHeader('clipboard','Aksi Utama');
  h += tileGrid([
    {i:'send',     l:'Beri Tugas', a:'openBeriTugasCepat'},
    {i:'edit',     l:'Penilaian',  a:'openPenilaianGuruDashboard'},
    {i:'chart',    l:'Rekap',      a:'openRekapNilai'},
    {i:'chart',    l:'Analitik',   a:'openAnalitikGuru'},
    {i:'fileText', l:'Print Rapor',a:'openPrintRapor'},
    {i:'folder',   l:'Dokumen',    a:'openDokumenSiswa'}
  ]);

  h += sectionHeader('messageCircle','Komunikasi');
  h += tileGrid([
    {i:'warning',       l:'Aduan',    a:'openAduanGuru'},
    {i:'messageCircle', l:'Log WA',   a:'openLogWA'},
    {i:'messageCircle', l:'Pesan',    a:'openDashboardPesan'},
    {i:'activity',      l:'Aktivitas',a:'openActivityLog'}
  ]);

  h += sectionHeader('gear','Sistem');
  h += tileGrid([
    {i:'fileText', l:'Template', a:'openKelolaTemplate'},
    {i:'user',     l:'Profil',   a:'openGuruProfile'},
    {i:'download', l:'Backup',   a:'openBackupRestore'},
    {i:'key',      l:'Password', a:'openChangePassword'},
    {i:'out',      l:'Keluar',   a:'logout'}
  ]);

  h += '</div>';
  openModal('Menu Guru', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openAdminMenu = function(){
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">'+
    ic('shield','lg')+'<div style="flex:1;min-width:0;"><b>'+esc(u().name||'')+'</b><br>'+
    '<small style="color:var(--text-muted);">Administrator</small></div></div>';

  h += sectionHeader('users','Manajemen');
  h += tileGrid([
    {i:'personPlus', l:'Tambah Guru', a:'openTambahGuruDariAdmin'},
    {i:'users',      l:'Daftar Guru', a:'openDaftarGuruAdmin'},
    {i:'school',     l:'Semua Kelas', a:'openDaftarKelasAdmin'}
  ]);

  h += sectionHeader('chart','Data');
  h += tileGrid([
    {i:'chart',    l:'Statistik', a:'openStatistikGlobal'},
    {i:'activity', l:'Log',       a:'openActivityLog'},
    {i:'download', l:'Backup',    a:'openBackupRestore'}
  ]);

  h += sectionHeader('gear','Akun');
  h += tileGrid([
    {i:'key', l:'Password', a:'openChangePassword'},
    {i:'out', l:'Keluar',   a:'logout'}
  ]);

  h += '</div>';
  openModal('Menu Admin', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openMainMenu = function(){
  var t = uType();
  if (t === 'admin') return window.openAdminMenu();
  if (t === 'guru')  return window.openGuruMenu();
  return window.openSiswaMenu();
};

/* ============================================================
   10. FUNGSI TAMBAHAN (Dari v8)
   ============================================================ */
window.openAbsensiHariIni = function(){
  var cid = uCid(); if (!cid) return;
  var today = new Date().toISOString().split('T')[0];
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){
    return m.classId === cid && m.date === today;
  });
  var h = '<div class="alert alert-info">'+ic('calendar')+'<div>Absensi Hari Ini — '+meetings.length+' sesi</div></div>';
  if (!meetings.length) h += '<div class="empty-state">'+ic('calendar',40)+'<p>Tidak ada sesi hari ini</p></div>';
  else meetings.forEach(function(m){
    h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">'+
      '<div style="font-weight:700;">'+esc(m.title)+'</div>'+
      '<button class="btn btn-primary btn-sm" style="margin-top:8px;" data-fx="fxOpenAbsen" data-arg="'+m.id+'">'+ic('edit','sm')+' Isi</button></div>';
  });
  openModal('Absensi Hari Ini', h);
};
window.fxOpenAbsen = function(mid){
  closeModal();
  setTimeout(function(){ if (typeof window.openIsiAbsensi === 'function') window.openIsiAbsensi(mid); }, 150);
};

window.openRubrikPenilaian = function(){
  var rubric = window.getRubricFor ? window.getRubricFor(uRole()) : [];
  var h = '<div class="alert alert-info">'+ic('target')+'<div><b>Rubrik</b> — '+esc(roleLabel(uRole()))+'</div></div>';
  if (!rubric.length) h += '<div class="empty-state"><p>Tidak ada rubrik</p></div>';
  else rubric.forEach(function(r){
    h += '<div class="rubric-item"><h4>'+esc(r.name)+' <span class="weight-info">'+r.weight+'%</span></h4>'+
      '<div class="desc">'+esc(r.desc||'')+'</div></div>';
  });
  openModal('Rubrik Penilaian', h);
};

window.openLogWA = function(){
  var logs = Object.values(window.DB.waLogs||{}).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,100);
  var h = '<div class="alert alert-info">'+ic('messageCircle')+'<div><b>Log WhatsApp</b> — '+logs.length+'</div></div>';
  if (!logs.length) h += '<div class="empty-state">'+ic('messageCircle',40)+'<p>Belum ada log</p></div>';
  else logs.forEach(function(l){
    h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--success);">'+
      '<div style="font-weight:700;font-size:13px;">'+esc(l.title||'-')+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);">Ke: '+esc(l.toName||'-')+' — '+fmtDate(l.createdAt)+'</div></div>';
  });
  openModal('Log WhatsApp', h);
};

window.openDashboardPesan = function(){
  var notifs = (window.DB.notifications||[]).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,100);
  var h = '<div class="alert alert-info">'+ic('messageCircle')+'<div><b>Pesan</b> — '+notifs.length+'</div></div>';
  if (!notifs.length) h += '<div class="empty-state"><p>Belum ada pesan</p></div>';
  else notifs.forEach(function(n){
    h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;font-size:13px;">'+esc(n.title||'-')+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);">Dari: '+esc(n.fromName||'-')+' — '+fmtDate(n.createdAt)+'</div>'+
      (n.message?'<div style="font-size:12.5px;margin-top:6px;">'+esc(n.message)+'</div>':'')+'</div>';
  });
  openModal('Dashboard Pesan', h);
};

window.openActivityFeedModal = function(){
  var logs = (window.DB.activityLogs||[]).slice(0,60);
  var h = '<div class="alert alert-info">'+ic('activity')+'<div><b>Aktivitas</b> — '+logs.length+'</div></div>';
  if (!logs.length) h += '<div class="empty-state"><p>Belum ada aktivitas</p></div>';
  else {
    h += '<div class="activity-feed">';
    logs.forEach(function(l){
      h += '<div class="activity-item"><div class="activity-icon">'+ic('activity','sm')+'</div>'+
        '<div class="activity-content"><div class="activity-msg">'+esc(l.message||'')+'</div>'+
        '<div class="activity-meta"><b>'+esc(l.userName||'-')+'</b> — '+fmtDate(l.createdAt)+'</div></div></div>';
    });
    h += '</div>';
  }
  openModal('Aktivitas', h);
};

window.openAnalitikGuru = function(){
  var cid = uCid();
  var c = findClass(cid); if (!c) return;
  var students = c.students||[];
  var h = '<div class="alert alert-info">'+ic('chart')+'<div><b>Analitik</b> — '+esc(c.name)+'</div></div>';
  var valid = students.map(function(s){ return {s:s, score:window.calcFinalScore ? window.calcFinalScore(cid, s.id) : 0}; }).filter(function(x){ return x.score>0; });
  if (!valid.length){ h += '<div class="empty-state"><p>Belum ada penilaian</p></div>'; openModal('Analitik', h); return; }
  var avg = valid.reduce(function(a,x){ return a+x.score; },0)/valid.length;
  h += '<div class="grid" style="margin-bottom:16px;">'+
    '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;">Rata-rata</div><div style="font-size:22px;font-weight:800;color:var(--primary);">'+avg.toFixed(2)+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--info);"><div style="font-size:11.5px;">Dinilai</div><div style="font-size:22px;font-weight:800;color:var(--info);">'+valid.length+'/'+students.length+'</div></div>'+
    '</div>';
  var sorted = valid.slice().sort(function(a,b){ return b.score-a.score; });
  h += '<div class="card"><h3>Top 5</h3>';
  sorted.slice(0,5).forEach(function(x, i){
    h += '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);">'+
      '<div style="width:26px;height:26px;border-radius:50%;background:var(--warning);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;">'+(i+1)+'</div>'+
      '<div style="flex:1;"><b>'+esc(x.s.name)+'</b></div>'+
      '<div style="font-weight:800;color:var(--primary);">'+x.score.toFixed(2)+'</div></div>';
  });
  h += '</div>';
  openModal('Analitik', h);
};

window.openPrintRapor = function(){
  var cid = uCid();
  var c = findClass(cid); if (!c) return;
  var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor '+esc(c.name)+'</title>'+
    '<style>body{font-family:Arial,sans-serif;padding:20px;}h1{text-align:center;color:#1e40af;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #ccc;padding:6px;}th{background:#dbeafe;color:#1e40af;}@media print{@page{size:A4 landscape;}}</style></head><body>'+
    '<h1>Rapor '+esc(c.name)+'</h1><table><thead><tr><th>No</th><th>Nama</th>';
  stages.forEach(function(s){ html += '<th>'+esc(s.name)+'</th>'; });
  html += '<th>Nilai</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(st, i){
    html += '<tr><td>'+(i+1)+'</td><td>'+esc(st.name)+'</td>';
    stages.forEach(function(s){
      var sc = window.calcStageScore ? window.calcStageScore(cid, st.id, s.id) : 0;
      html += '<td>'+sc.toFixed(2)+'</td>';
    });
    var final = window.calcFinalScore ? window.calcFinalScore(cid, st.id) : 0;
    html += '<td><b>'+final.toFixed(2)+'</b></td></tr>';
  });
  html += '</tbody></table></body></html>';
  var w = window.open('', '_blank');
  w.document.write(html); w.document.close();
  setTimeout(function(){ w.print(); }, 500);
};

window.openBackupRestore = function(){
  if (!isGuru()){ alert('Hanya guru/admin'); return; }
  var h = '<div class="alert alert-info">'+ic('download')+'<div><b>Backup & Restore</b></div></div>';
  h += '<div class="card"><h3>Backup</h3><button class="btn btn-primary btn-block" data-fx="fxDownloadBackup">'+ic('download')+' Download JSON</button></div>';
  h += '<div class="card"><h3>Restore</h3><input type="file" id="fx-backup-file" accept=".json" style="width:100%;padding:8px;margin-bottom:10px;"><button class="btn btn-warning btn-block" data-fx="fxRestoreBackup">'+ic('upload')+' Restore</button></div>';
  openModal('Backup & Restore', h);
};
window.fxDownloadBackup = function(){
  var backup = {
    version:'9.0', exportedAt: Date.now(), exportedBy: u().name,
    classes: window.DB.classes, teachers: window.DB.teachers,
    checklists: window.DB.checklists, meetings: window.DB.meetings,
    evaluations: window.DB.evaluations, deadlines: window.DB.deadlines,
    activeStages: window.DB.activeStages, stages: window.DB.stages,
    notifications: window.DB.notifications, bookings: window.DB.bookings
  };
  var blob = new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href = url;
  a.download = 'SPPPT_Backup_'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  alert('Backup terunduh!');
};
window.fxRestoreBackup = function(){
  var el = document.getElementById('fx-backup-file');
  if (!el || !el.files || !el.files[0]){ alert('Pilih file'); return; }
  if (!confirm('Timpa data sekarang?')) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try {
      var data = JSON.parse(e.target.result);
      if (!data.classes){ alert('File tidak valid'); return; }
      var promises = [];
      (data.classes||[]).forEach(function(c){ promises.push(window.fbSet('classes', c.id, c)); });
      if (data.stages) promises.push(window.fbSet('config','stages',{stages:data.stages}));
      Promise.all(promises).then(function(){ alert('Restore OK!'); location.reload(); });
    } catch(err){ alert('Error: '+err.message); }
  };
  reader.readAsText(el.files[0]);
};

window.openTambahGuruDariAdmin = function(){
  openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="fx-tg-name"></div>'+
    '<div class="form-group"><label>Email</label><input type="email" id="fx-tg-email"></div>'+
    '<div class="form-group"><label>No. WA</label><input type="tel" id="fx-tg-phone"></div>'+
    '<div class="form-group"><label>Password</label><input type="text" id="fx-tg-pw" value="#Smpn10smd"></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxSimpanGuruBaru">'+ic('save')+' Simpan</button>');
};
window.fxSimpanGuruBaru = function(){
  var n = (document.getElementById('fx-tg-name').value||'').trim();
  var e = (document.getElementById('fx-tg-email').value||'').trim().toLowerCase();
  var ph = (document.getElementById('fx-tg-phone').value||'').replace(/\D/g,'');
  var pw = (document.getElementById('fx-tg-pw').value||'').trim();
  if (!n || !e || !pw){ alert('Lengkapi'); return; }
  window.fbSet('teachers', e, {name:n, email:e, phone:ph, password:pw}).then(function(){
    alert('Guru ditambahkan!'); closeModal();
  });
};
window.openDaftarGuruAdmin = function(){
  var list = window.DB.teachers || [];
  var h = '<div class="alert alert-info">'+ic('users')+'<div><b>Daftar Guru</b> — '+list.length+'</div></div>';
  list.forEach(function(t){
    h += '<div class="teacher-list-item">'+
      '<div class="info">'+ic('user','lg')+'<div><strong>'+esc(t.name||'-')+'</strong><small>'+esc(t.email||'-')+'</small></div></div>'+
      '<button class="btn btn-sm btn-danger" data-fx="fxHapusGuru" data-arg="'+esc(t.email)+'">'+ic('trash','sm')+'</button></div>';
  });
  openModal('Daftar Guru', h);
};
window.fxHapusGuru = function(email){
  if (!confirm('Hapus guru '+email+'?')) return;
  window.fbDel('teachers', email).then(function(){ alert('Dihapus'); closeModal(); });
};
window.openDaftarKelasAdmin = function(){
  var list = window.DB.classes || [];
  var h = '<div class="alert alert-info">'+ic('school')+'<div><b>Semua Kelas</b> — '+list.length+'</div></div>';
  list.forEach(function(c){
    h += '<div class="card" style="margin-bottom:6px;"><b>'+esc(c.name)+'</b> — Kode: <code>'+esc(c.code||'-')+'</code> — '+((c.students||[]).length)+' siswa</div>';
  });
  openModal('Daftar Kelas', h);
};
window.openStatistikGlobal = function(){
  var classes = window.DB.classes || [];
  var totalS = 0; classes.forEach(function(c){ totalS += (c.students||[]).length; });
  var h = '<div class="grid">'+
    '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;">Kelas</div><div style="font-size:22px;font-weight:800;">'+classes.length+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Siswa</div><div style="font-size:22px;font-weight:800;">'+totalS+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--info);"><div style="font-size:11.5px;">Guru</div><div style="font-size:22px;font-weight:800;">'+(window.DB.teachers||[]).length+'</div></div>'+
    '</div>';
  openModal('Statistik', h);
};

window.openKoorChecklistModal = function(){
  if (typeof window.openChecklistManage === 'function') return window.openChecklistManage(uCid());
};
window.openKoorDeadlineModal = function(){
  if (typeof window.openBeriTugasCepat === 'function') return window.openBeriTugasCepat();
};

/* ============================================================
   11. HOOK RENDER
   ============================================================ */
function doInjects(){
  try { window.injectToolbar(); }catch(e){}
  try { injectQuickActions(); }catch(e){}
  try { renderHeaderAvatar(); }catch(e){}
}

var _origRenderSiswa = window.renderSiswaDash;
if (typeof _origRenderSiswa === 'function'){
  window.renderSiswaDash = function(){
    var ret = _origRenderSiswa.apply(this, arguments);
    setTimeout(doInjects, 150);
    setTimeout(doInjects, 500);
    setTimeout(doInjects, 1200);
    return ret;
  };
}
var _origRenderGuru = window.renderGuruDash;
if (typeof _origRenderGuru === 'function'){
  window.renderGuruDash = function(){
    var ret = _origRenderGuru.apply(this, arguments);
    setTimeout(doInjects, 150);
    setTimeout(doInjects, 500);
    return ret;
  };
}
var _origRenderAdmin = window.renderAdminDash;
if (typeof _origRenderAdmin === 'function'){
  window.renderAdminDash = function(){
    var ret = _origRenderAdmin.apply(this, arguments);
    setTimeout(doInjects, 150);
    setTimeout(doInjects, 500);
    return ret;
  };
}
var _origShowApp = window.showApp;
if (typeof _origShowApp === 'function'){
  window.showApp = function(){
    var ret = _origShowApp.apply(this, arguments);
    setTimeout(doInjects, 300);
    setTimeout(doInjects, 900);
    setTimeout(doInjects, 1800);
    return ret;
  };
}

/* MutationObserver — jaga toolbar tetap muncul */
if (typeof MutationObserver !== 'undefined'){
  var moTimer = null;
  var mo = new MutationObserver(function(){
    if (moTimer) clearTimeout(moTimer);
    moTimer = setTimeout(doInjects, 250);
  });
  var startMO = function(){
    var mc = document.getElementById('main-content');
    if (mc) mo.observe(mc, {childList:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(startMO, 1000); });
  else setTimeout(startMO, 1000);
}

/* Trigger saat load */
setTimeout(doInjects, 2000);
setTimeout(doInjects, 4000);

/* ============================================================
   12. EVENT HANDLER
   ============================================================ */
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-fx]');
  if (!el) return;
  e.preventDefault();
  var fn = el.getAttribute('data-fx');
  var arg = el.getAttribute('data-arg');
  if (typeof window[fn] !== 'function'){ console.warn('[fix] Missing:', fn); return; }
  try { if (arg) window[fn](arg); else window[fn](); }
  catch(err){ console.error('[fix]', fn, err); alert('Error: '+err.message); }
}, true);

document.addEventListener('click', function(e){
  var el = e.target.closest('[data-fx-menu]');
  if (!el) return;
  e.preventDefault(); e.stopPropagation();
  var fn = el.getAttribute('data-fx-menu');
  closeModal();
  setTimeout(function(){
    if (typeof window[fn] === 'function'){
      try { window[fn](); }
      catch(err){ console.error(fn, err); alert('Error: '+err.message); }
    } else alert('Fitur "'+fn+'" belum tersedia.');
  }, 150);
}, true);

console.log('[features-fix] v9.0 FINAL loaded');
console.log('  → Toolbar minimalis: 3-4 tombol sesuai prioritas');
console.log('  → Quick Action Cards di dashboard');
console.log('  → Menu pop-up pakai grid prioritas');
console.log('  → Foto profil tampil di header');
console.log('  → Kas SIMPLE (nama siswa)');
console.log('  → Beri Tugas CEPAT (3 kolom)');

})();
