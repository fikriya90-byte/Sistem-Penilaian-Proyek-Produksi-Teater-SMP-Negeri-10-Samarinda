/* ============================================================
   SP-PPT features-fix.js — v4.0 FINAL ALL-IN-ONE
   Berisi SEMUA perbaikan + fitur baru untuk app.js v16:
   
   A. Alias fungsi hilang (semua tombol berfungsi)
   B. Fix bug tandaiTugasSelesai
   C. Keuangan Real (RAB + Realisasi + Saldo + Export)
   D. Kas Kelas (config, mark paid, reminder)
   E. Peminjaman Barang
   F. Backup & Restore JSON
   G. Analitik Guru
   H. Print Rapor (kelas + per siswa)
   I. Log WA + Dashboard Pesan + Activity Feed
   J. Absensi Hari Ini + Rubrik + Deadline + Tugas Saya
   K. Koordinasi Fallback
   L. Handler data-fx
   M. Menu Global (openSiswaMenu/openGuruMenu/openAdminMenu)
   N. Alias tambahan
   O. Handler data-action fallback
   
   Load PALING AKHIR di index.html
   ============================================================ */
(function(){
'use strict';

if (!window.DB || typeof window.ico !== 'function'){
  console.error('[features-fix] app.js belum siap'); return;
}

/* ============================================================
   HELPERS
   ============================================================ */
function ic(n,s){ return window.ico ? window.ico(n,s) : ''; }
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
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }
function fmtDate(ts){ return window.fmtDate ? window.fmtDate(ts) : (ts?new Date(ts).toLocaleString('id-ID'):'-'); }
function fmtDateShort(s){ return window.fmtDateShort ? window.fmtDateShort(s) : (s?new Date(s).toLocaleDateString('id-ID'):'-'); }
function logAct(t,m,k){ if (window.logActivity) return window.logActivity(t,m,k); }
function safeLS(k, v){
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return true; }
  catch(e){ return null; }
}
function safeJSON(s, fb){ try { var p = JSON.parse(s||'null'); return p==null?fb:p; } catch(e){ return fb; } }
function K(cid, name){ return 'sppt_'+name+'_'+cid; }

/* ============================================================
   A. ALIAS FUNGSI HILANG
   ============================================================ */
window.openArsipNaskah = function(cid){
  if (typeof window.openNaskahList === 'function') return window.openNaskahList(cid || uCid());
  alert('Fitur naskah belum siap');
};
window.openBookingAlatMusik = function(){
  if (typeof window.openBookingAlat === 'function') return window.openBookingAlat();
  alert('Fitur booking belum siap');
};
window.openChecklistView = function(cid){
  if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(cid || uCid());
  alert('Fitur checklist belum siap');
};
window.openStudentChecklistSelf = function(){
  if (typeof window.openChecklistPribadi === 'function') return window.openChecklistPribadi();
  alert('Fitur checklist pribadi belum siap');
};
window.openTimSaya = function(){
  if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(uCid());
  alert('Fitur tim belum siap');
};
window.openChecklistViewSelf = window.openChecklistView;
window.openGuruPasswordView = function(cid){
  if (typeof window.lihatPassword === 'function') return window.lihatPassword(cid);
  alert('Fitur password belum siap');
};
window.openCreateMeetingModalFull = function(type){
  type = type || 'rapat';
  var cid = uCid();
  if (typeof window.openBuatMeeting === 'function') return window.openBuatMeeting(type, cid);
  if (typeof window.openMeetingList === 'function') return window.openMeetingList(cid);
  alert('Fitur absensi belum siap');
};
window.openKoordinasiAntarKelas = function(){
  if (typeof window.openKoordinasi === 'function') return window.openKoordinasi();
  __koordFallback();
};
window.openEditTeacherModal = window.openEditTeacherModal || window.openEditGuru;
window.openAddTeacherModal = window.openAddTeacherModal || window.openAddTeacher;
window.openKelolaChecklistFromMenu = function(){
  var cid = window.__currentViewClassId || uCid();
  if (!cid){ alert('Buka kelas dulu'); return; }
  if (typeof window.openChecklistManage === 'function') return window.openChecklistManage(cid);
};

/* ============================================================
   B. FIX BUG tandaiTugasSelesai — u() undefined
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
    logAct('task_done', (me.name||'User')+' tandai tugas selesai: '+(n.title||''), {classId:n.classId});
    alert('Tugas ditandai selesai!');
    if (window.renderNotifPanel) window.renderNotifPanel();
    if (window.updateBadge) window.updateBadge();
  }).catch(function(e){ alert('Gagal: '+e.message); });
};

/* ============================================================
   C. KEUANGAN REAL
   ============================================================ */
function getKeuangan(cid){
  var d = safeJSON(safeLS(K(cid,'keuangan')), null);
  if (!d) return { plan: [], tx: [] };
  return { plan: Array.isArray(d.plan)?d.plan:[], tx: Array.isArray(d.tx)?d.tx:[] };
}
function setKeuangan(cid, data){
  safeLS(K(cid,'keuangan'), JSON.stringify(data));
  if (window.fbSet) window.fbSet('keuangan', cid, data).catch(function(){});
}

window.openKeuangan = function(){ window.openKeuanganModal(); };
window.openKeuanganModal = function(){
  var cid = uCid(); if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var canEdit = uRole()==='bendahara' || isGuru();
  var h = '<div class="alert alert-info">'+ic('chart')+
    '<div><b>Keuangan Kelas</b> — '+ (canEdit?'Anda bisa kelola':'Hanya lihat') +'</div></div>';
  h += '<div class="tabs" style="margin-bottom:14px;">'+
    '<button class="tab active" id="tab-rencana" data-fx="switchKeuangan" data-arg="rencana|'+cid+'">Rencana</button>'+
    '<button class="tab" id="tab-realisasi" data-fx="switchKeuangan" data-arg="realisasi|'+cid+'">Realisasi</button>'+
    '<button class="tab" id="tab-saldo" data-fx="switchKeuangan" data-arg="saldo|'+cid+'">Saldo</button>'+
    '</div><div id="keuangan-body"></div>';
  openModal('Keuangan & RAB', h);
  window.switchKeuangan('rencana|'+cid);
};

window.switchKeuangan = function(arg){
  var p = String(arg).split('|'), tab = p[0], cid = p[1];
  ['rencana','realisasi','saldo'].forEach(function(t){
    var el = document.getElementById('tab-'+t);
    if (el) el.classList.toggle('active', t===tab);
  });
  var body = document.getElementById('keuangan-body'); if (!body) return;
  var data = getKeuangan(cid);
  var canEdit = uRole()==='bendahara' || isGuru();
  var h = '';

  if (tab === 'rencana'){
    if (canEdit) h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" data-fx="fxAddRencana" data-arg="'+cid+'">'+ic('plus','sm')+' Tambah Rencana</button>';
    if (!data.plan.length) h += '<div class="empty-state">'+ic('fileText',40)+'<p>Belum ada rencana anggaran.</p></div>';
    else {
      var total = 0;
      data.plan.forEach(function(it){
        total += it.estimate || 0;
        h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">'+
          '<div style="flex:1;"><div style="font-size:12.5px;font-weight:600;">'+esc(it.item)+'</div>'+
          '<div style="font-size:11px;color:var(--text-muted);">'+esc(roleLabel(it.division))+' · '+esc(it.priority||'-')+'</div></div>'+
          '<div style="text-align:right;"><div style="font-size:12.5px;">Rp '+(it.estimate||0).toLocaleString('id-ID')+'</div>'+
          (canEdit?'<button class="btn btn-sm btn-danger" data-fx="fxDelRencana" data-arg="'+cid+'|'+it.id+'">'+ic('trash','sm')+'</button>':'')+
          '</div></div>';
      });
      h += '<div style="margin-top:12px;font-weight:700;">Total Rencana: Rp '+total.toLocaleString('id-ID')+'</div>';
    }
  } else if (tab === 'realisasi'){
    if (canEdit) h += '<div class="action-row" style="margin-bottom:12px;">'+
      '<button class="btn btn-sm btn-success" data-fx="fxAddTx" data-arg="'+cid+'|masuk">'+ic('plus','sm')+' Pemasukan</button>'+
      '<button class="btn btn-sm btn-danger" data-fx="fxAddTx" data-arg="'+cid+'|keluar">'+ic('plus','sm')+' Pengeluaran</button>'+
      '</div>';
    if (!data.tx.length) h += '<div class="empty-state">'+ic('chart',40)+'<p>Belum ada transaksi.</p></div>';
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
  } else {
    var masuk = 0, keluar = 0;
    data.tx.forEach(function(t){
      if (t.type==='masuk') masuk += t.amount||0;
      else if (t.type==='keluar') keluar += t.amount||0;
    });
    var saldo = masuk - keluar;
    h += '<div class="grid">'+
      '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;color:var(--text-muted);">Pemasukan</div><div style="font-size:20px;font-weight:800;color:var(--success);">Rp '+masuk.toLocaleString('id-ID')+'</div></div>'+
      '<div class="card" style="border-left:4px solid var(--danger);"><div style="font-size:11.5px;color:var(--text-muted);">Pengeluaran</div><div style="font-size:20px;font-weight:800;color:var(--danger);">Rp '+keluar.toLocaleString('id-ID')+'</div></div>'+
      '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;color:var(--text-muted);">Saldo</div><div style="font-size:20px;font-weight:800;color:'+(saldo>=0?'var(--primary)':'var(--danger)')+';">Rp '+saldo.toLocaleString('id-ID')+'</div></div>'+
      '</div>';
    if (canEdit) h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" data-fx="fxExportKeuangan" data-arg="'+cid+'">'+ic('download')+' Export Excel</button>';
  }
  body.innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons(body);
};

window.fxAddRencana = function(cid){
  var opts = Object.keys(window.ROLES||{}).map(function(k){
    return '<option value="'+k+'">'+esc(roleLabel(k))+'</option>';
  }).join('');
  openModal('Tambah Rencana',
    '<div class="form-group"><label>Divisi/Peran</label><select id="fx-ren-div">'+opts+'</select></div>'+
    '<div class="form-group"><label>Item</label><input id="fx-ren-item"></div>'+
    '<div class="form-group"><label>Estimasi (Rp)</label><input type="number" id="fx-ren-est" min="0"></div>'+
    '<div class="form-group"><label>Prioritas</label><select id="fx-ren-prio"><option>Wajib</option><option>Penting</option><option>Opsional</option></select></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxSaveRencana" data-arg="'+cid+'">'+ic('save')+' Simpan</button>');
};
window.fxSaveRencana = function(cid){
  var div = document.getElementById('fx-ren-div').value;
  var item = (document.getElementById('fx-ren-item').value||'').trim();
  var est = parseFloat(document.getElementById('fx-ren-est').value)||0;
  var prio = document.getElementById('fx-ren-prio').value;
  if (!item || est<=0){ alert('Lengkapi'); return; }
  var data = getKeuangan(cid);
  data.plan.push({id:uid(), division:div, item:item, estimate:est, priority:prio, by:u().name, at:Date.now()});
  setKeuangan(cid, data);
  closeModal();
  setTimeout(function(){ window.switchKeuangan('rencana|'+cid); }, 150);
};
window.fxDelRencana = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Hapus item rencana?')) return;
  var data = getKeuangan(cid);
  data.plan = data.plan.filter(function(x){ return x.id!==id; });
  setKeuangan(cid, data);
  window.switchKeuangan('rencana|'+cid);
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
  setTimeout(function(){ window.switchKeuangan('realisasi|'+cid); }, 150);
};
window.fxDelTx = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Hapus transaksi?')) return;
  var data = getKeuangan(cid);
  data.tx = data.tx.filter(function(x){ return x.id!==id; });
  setKeuangan(cid, data);
  window.switchKeuangan('realisasi|'+cid);
};
window.fxExportKeuangan = function(cid){
  if (!window.XLSX){ alert('Excel belum siap'); return; }
  var data = getKeuangan(cid);
  var rows = [['Jenis','Tanggal','Kategori','Jumlah']];
  data.tx.forEach(function(t){ rows.push([t.type, t.date||'-', t.category||'-', t.amount||0]); });
  var ws = XLSX.utils.aoa_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Keuangan');
  var c = findClass(cid);
  XLSX.writeFile(wb, 'Keuangan_'+(c?c.name:'Kelas')+'.xlsx');
};

/* ============================================================
   D. KAS KELAS
   ============================================================ */
function getKas(cid){
  var d = safeJSON(safeLS(K(cid,'kas')), null);
  if (!d) return {active:false, nama:'', nominal:0, periode:'weekly', mulai:null, payments:{}};
  return { active:!!d.active, nama:d.nama||'', nominal:d.nominal||0,
    periode:d.periode||'weekly', mulai:d.mulai||null, payments:d.payments||{} };
}
function setKas(cid, data){
  safeLS(K(cid,'kas'), JSON.stringify(data));
  if (window.fbSet) window.fbSet('kas_kelas', cid, data).catch(function(){});
}
function periodeLabel(p){ return {daily:'hari',weekly:'minggu',biweekly:'2 minggu',monthly:'bulan'}[p]||p; }

window.openKasKelas = function(){
  var cid = uCid(); if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var canEdit = uRole()==='bendahara' || isGuru();
  var data = getKas(cid);
  var c = findClass(cid); if (!c) return;

  var h = '<div class="alert alert-info">'+ic('briefcase')+'<div><b>Kas Kelas</b></div></div>';

  if (!data.active){
    h += '<div class="card"><h3>Aktifkan Kas</h3>';
    if (canEdit){
      h += '<div class="form-group"><label>Nama Kas</label><input id="fx-kas-nama" value="'+esc(data.nama||'')+'"></div>'+
        '<div class="form-group"><label>Nominal (Rp)</label><input type="number" id="fx-kas-nominal" min="0" value="'+(data.nominal||'')+'"></div>'+
        '<div class="form-group"><label>Periode</label><select id="fx-kas-periode">'+
          '<option value="daily">Harian</option><option value="weekly" selected>Mingguan</option><option value="monthly">Bulanan</option>'+
        '</select></div>'+
        '<div class="form-group"><label>Mulai</label><input type="date" id="fx-kas-mulai" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
        '<button class="btn btn-primary btn-block" data-fx="fxSaveKas" data-arg="'+cid+'">Aktifkan</button>';
    } else {
      h += '<div style="font-size:12.5px;color:var(--text-muted);padding:10px 0;">Kas belum aktif.</div>';
    }
    h += '</div>';
  } else {
    var students = c.students || [];
    var paid = [], unpaid = [];
    students.forEach(function(s){
      var list = (data.payments[s.id]||[]);
      if (list.length > 0) paid.push(s); else unpaid.push(s);
    });
    var pct = students.length ? Math.round(paid.length/students.length*100) : 0;

    h += '<div class="progress-banner"><h3>'+esc(data.nama)+'</h3>'+
      '<div style="font-size:14px;">Rp '+data.nominal.toLocaleString('id-ID')+' / '+periodeLabel(data.periode)+'</div>'+
      '<div class="big-count" style="font-size:22px;">'+paid.length+' / '+students.length+'</div>'+
      '<div class="progress-container"><div class="progress-bar '+(pct===100?'complete':'partial')+'" style="width:'+pct+'%"></div></div></div>';

    if (canEdit) h += '<button class="btn btn-sm btn-danger" style="margin-bottom:12px;" data-fx="fxDeactivateKas" data-arg="'+cid+'">Nonaktifkan</button>';

    if (unpaid.length){
      h += '<h3 style="font-size:13px;color:var(--danger);margin:12px 0 8px;">Belum Bayar ('+unpaid.length+')</h3>';
      unpaid.forEach(function(s){
        h += '<div class="welcome-item urgent" style="margin-bottom:5px;">'+
          '<div style="flex:1;"><b>'+esc(s.name)+'</b><br><small>'+esc(roleLabel(s.role))+'</small></div>'+
          (canEdit?'<button class="btn btn-sm btn-success" data-fx="fxMarkPaid" data-arg="'+cid+'|'+s.id+'">Lunas</button>':'')+
          '</div>';
      });
    }
    if (paid.length){
      h += '<h3 style="font-size:13px;color:var(--success);margin:12px 0 8px;">Sudah Bayar ('+paid.length+')</h3>';
      paid.forEach(function(s){
        h += '<div class="welcome-item done" style="margin-bottom:5px;">'+
          '<div style="flex:1;"><b>'+esc(s.name)+'</b><br><small>'+esc(roleLabel(s.role))+'</small></div>'+
          (canEdit?'<button class="btn btn-sm btn-danger" data-fx="fxMarkUnpaid" data-arg="'+cid+'|'+s.id+'">×</button>':'')+
          '</div>';
      });
    }
  }
  openModal('Kas Kelas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxSaveKas = function(cid){
  var nama = (document.getElementById('fx-kas-nama').value||'').trim();
  var nominal = parseFloat(document.getElementById('fx-kas-nominal').value)||0;
  var periode = document.getElementById('fx-kas-periode').value;
  var mulai = document.getElementById('fx-kas-mulai').value;
  if (!nama || nominal<=0 || !mulai){ alert('Lengkapi'); return; }
  var data = getKas(cid);
  data.active = true; data.nama = nama; data.nominal = nominal;
  data.periode = periode; data.mulai = mulai;
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
window.fxMarkPaid = function(arg){
  var p = String(arg).split('|'), cid = p[0], sid = p[1];
  var data = getKas(cid);
  if (!data.payments) data.payments = {};
  if (!data.payments[sid]) data.payments[sid] = [];
  data.payments[sid].push({ tanggal: new Date().toISOString().split('T')[0], nominal: data.nominal });
  setKas(cid, data);
  window.openKasKelas();
};
window.fxMarkUnpaid = function(arg){
  var p = String(arg).split('|'), cid = p[0], sid = p[1];
  if (!confirm('Batalkan lunas?')) return;
  var data = getKas(cid);
  if (data.payments && data.payments[sid]) data.payments[sid].pop();
  setKas(cid, data);
  window.openKasKelas();
};

window.checkKasReminder = function(cid, sid){
  var data = getKas(cid);
  if (!data.active) return null;
  var pays = (data.payments||{})[sid] || [];
  if (pays.length > 0){
    var last = pays[pays.length-1].tanggal;
    var now = new Date();
    var periode = data.periode;
    var shouldCheck = false;
    if (periode === 'daily'){
      shouldCheck = last !== now.toISOString().split('T')[0];
    } else if (periode === 'weekly'){
      var days = Math.floor((now - new Date(last)) / 86400000);
      shouldCheck = days >= 7;
    } else if (periode === 'monthly'){
      shouldCheck = new Date(last).getMonth() !== now.getMonth();
    }
    if (!shouldCheck) return null;
  }
  return 'Anda belum membayar <b>'+esc(data.nama)+'</b> (Rp '+(data.nominal||0).toLocaleString('id-ID')+' / '+periodeLabel(data.periode)+')';
};

/* ============================================================
   E. PEMINJAMAN BARANG
   ============================================================ */
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
  var cid = uCid(); if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var canEdit = uRole()==='koor_perlengkapan' || uRole()==='anggota_perlengkapan' || isGuru();
  var data = getPinjam(cid);
  var aktif = data.items.filter(function(x){ return x.status==='dipinjam'; });
  var selesai = data.items.filter(function(x){ return x.status==='dikembalikan'; });

  var h = '<div class="alert alert-info">'+ic('briefcase')+'<div><b>Peminjaman Barang</b></div></div>';
  h += '<div class="grid">'+
    '<div class="card" style="border-left:4px solid var(--warning);"><div style="font-size:11.5px;">Sedang Dipinjam</div><div style="font-size:20px;font-weight:800;">'+aktif.length+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Dikembalikan</div><div style="font-size:20px;font-weight:800;">'+selesai.length+'</div></div>'+
    '</div>';

  if (canEdit) h += '<button class="btn btn-primary btn-sm" style="margin:12px 0;" data-fx="fxAddPinjam" data-arg="'+cid+'">'+ic('plus','sm')+' Catat Peminjaman</button>';

  if (!data.items.length){
    h += '<div class="empty-state">'+ic('briefcase',40)+'<p>Belum ada catatan.</p></div>';
  } else {
    var all = aktif.concat(selesai);
    all.forEach(function(it){
      var isAktif = it.status === 'dipinjam';
      h += '<div class="card" style="margin-bottom:8px;border-left:4px solid '+(isAktif?'var(--warning)':'var(--success)')+';">'+
        '<div style="font-weight:700;font-size:13.5px;margin-bottom:4px;">'+esc(it.nama)+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);">Peminjam: <b>'+esc(it.peminjam||'-')+'</b> · Jumlah: '+it.jumlah+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Pinjam: '+esc(it.tanggalPinjam||'-')+
          (isAktif?' · Rencana kembali: '+esc(it.tanggalKembaliRencana||'-'):' · Kembali: '+esc(it.tanggalKembaliAktual||'-'))+'</div>'+
        (it.catatan?'<div style="font-size:12px;margin-top:6px;padding:6px 8px;background:var(--surface);border-radius:6px;">'+esc(it.catatan)+'</div>':'')+
        (canEdit?'<div class="action-row" style="margin-top:8px;">'+
          (isAktif?'<button class="btn btn-sm btn-success" data-fx="fxMarkKembali" data-arg="'+cid+'|'+it.id+'">'+ic('check','sm')+' Kembalikan</button>':'')+
          '<button class="btn btn-sm btn-danger" data-fx="fxDelPinjam" data-arg="'+cid+'|'+it.id+'">'+ic('trash','sm')+'</button>'+
          '</div>':'')+
        '</div>';
    });
  }
  openModal('Peminjaman Barang', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxAddPinjam = function(cid){
  openModal('Catat Peminjaman',
    '<div class="form-group"><label>Nama Barang</label><input id="fx-pj-nama"></div>'+
    '<div class="form-group"><label>Jumlah</label><input type="number" id="fx-pj-jumlah" value="1" min="1"></div>'+
    '<div class="form-group"><label>Peminjam</label><input id="fx-pj-peminjam"></div>'+
    '<div class="form-group"><label>Kondisi</label><select id="fx-pj-kondisi"><option value="baik">Baik</option><option value="rusak_ringan">Rusak Ringan</option><option value="rusak_berat">Rusak Berat</option></select></div>'+
    '<div class="form-group"><label>Tanggal Pinjam</label><input type="date" id="fx-pj-tgl" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
    '<div class="form-group"><label>Rencana Kembali</label><input type="date" id="fx-pj-kembali"></div>'+
    '<div class="form-group"><label>Catatan</label><textarea id="fx-pj-catatan" rows="2"></textarea></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxSavePinjam" data-arg="'+cid+'">'+ic('save')+' Simpan</button>');
};
window.fxSavePinjam = function(cid){
  var nama = (document.getElementById('fx-pj-nama').value||'').trim();
  var jumlah = parseInt(document.getElementById('fx-pj-jumlah').value)||1;
  var peminjam = (document.getElementById('fx-pj-peminjam').value||'').trim();
  var kondisi = document.getElementById('fx-pj-kondisi').value;
  var tgl = document.getElementById('fx-pj-tgl').value;
  var kembali = document.getElementById('fx-pj-kembali').value;
  var catatan = (document.getElementById('fx-pj-catatan').value||'').trim();
  if (!nama){ alert('Nama barang wajib'); return; }
  var data = getPinjam(cid);
  data.items.push({
    id:uid(), nama:nama, jumlah:jumlah, peminjam:peminjam, kondisi:kondisi,
    tanggalPinjam:tgl, tanggalKembaliRencana:kembali||null, catatan:catatan,
    status:'dipinjam', createdAt:Date.now(), createdBy:u().name
  });
  setPinjam(cid, data);
  closeModal();
  window.openPeminjamanBarang();
};
window.fxMarkKembali = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Tandai dikembalikan?')) return;
  var data = getPinjam(cid);
  var now = new Date();
  data.items = data.items.map(function(x){
    if (x.id !== id) return x;
    return Object.assign({}, x, {
      status:'dikembalikan',
      tanggalKembaliAktual: now.toISOString().split('T')[0],
      jamKembaliAktual: now.toTimeString().substring(0,5)
    });
  });
  setPinjam(cid, data);
  window.openPeminjamanBarang();
};
window.fxDelPinjam = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if (!confirm('Hapus catatan?')) return;
  var data = getPinjam(cid);
  data.items = data.items.filter(function(x){ return x.id !== id; });
  setPinjam(cid, data);
  window.openPeminjamanBarang();
};

/* ============================================================
   F. BACKUP & RESTORE
   ============================================================ */
window.openBackupRestore = function(){
  if (!isGuru()){ alert('Hanya guru/admin'); return; }
  var h = '<div class="alert alert-info">'+ic('download')+
    '<div><b>Backup & Restore</b><br>Simpan semua data ke file JSON, atau pulihkan dari file.</div></div>';

  h += '<div class="card" style="border-left:4px solid var(--primary);">'+
    '<h3>'+ic('download')+' Backup</h3>'+
    '<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">'+
    'Download semua data kelas (siswa, checklist, nilai, absensi, keuangan, dll.) ke file JSON.</p>'+
    '<button class="btn btn-primary btn-block" data-fx="fxDownloadBackup">'+
    ic('download')+' Download Backup JSON</button></div>';

  h += '<div class="card" style="border-left:4px solid var(--warning);">'+
    '<h3>'+ic('upload')+' Restore</h3>'+
    '<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">'+
    '<b>Peringatan:</b> Restore akan menimpa data dengan file yang diupload.</p>'+
    '<input type="file" id="fx-backup-file" accept=".json" style="width:100%;padding:8px;margin-bottom:10px;">'+
    '<button class="btn btn-warning btn-block" data-fx="fxRestoreBackup">'+
    ic('upload')+' Restore dari File</button></div>';

  openModal('Backup & Restore', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxDownloadBackup = function(){
  var backup = {
    version: '4.0',
    exportedAt: Date.now(),
    exportedBy: u().name,
    classes: window.DB.classes,
    teachers: window.DB.teachers,
    checklists: window.DB.checklists,
    meetings: window.DB.meetings,
    evaluations: window.DB.evaluations,
    deadlines: window.DB.deadlines,
    activeStages: window.DB.activeStages,
    stages: window.DB.stages,
    notifications: window.DB.notifications,
    bookings: window.DB.bookings,
    coordination: window.DB.coordination
  };
  var json = JSON.stringify(backup, null, 2);
  var blob = new Blob([json], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'SPPPT_Backup_'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  alert('Backup berhasil didownload!');
};

window.fxRestoreBackup = function(){
  var el = document.getElementById('fx-backup-file');
  if (!el || !el.files || !el.files[0]){ alert('Pilih file backup'); return; }
  if (!confirm('Yakin restore? Data saat ini akan ditimpa.')) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try {
      var data = JSON.parse(e.target.result);
      if (!data.classes){ alert('File backup tidak valid'); return; }

      var promises = [];

      (data.classes||[]).forEach(function(c){
        promises.push(window.fbSet('classes', c.id, c));
      });

      if (data.stages){
        promises.push(window.fbSet('config', 'stages', {stages:data.stages}));
      }

      Object.keys(data.checklists||{}).forEach(function(cid){
        var ch = data.checklists[cid];
        promises.push(window.fbSet('checklists', cid, Object.assign({}, ch, {classId:cid})));
      });

      Object.keys(data.meetings||{}).forEach(function(mid){
        promises.push(window.fbSet('meetings', mid, data.meetings[mid]));
      });

      Object.keys(data.evaluations||{}).forEach(function(cid){
        var byTarget = data.evaluations[cid]||{};
        Object.keys(byTarget).forEach(function(tid){
          var docId = cid+'__'+tid;
          promises.push(window.fbSet('evaluations', docId, Object.assign({}, byTarget[tid], {classId:cid, targetId:tid})));
        });
      });

      Object.keys(data.deadlines||{}).forEach(function(cid){
        promises.push(window.fbSet('deadlines', cid, Object.assign({}, data.deadlines[cid], {classId:cid})));
      });

      Object.keys(data.activeStages||{}).forEach(function(cid){
        promises.push(window.fbSet('activeStages', cid, Object.assign({}, data.activeStages[cid], {classId:cid})));
      });

      Promise.all(promises).then(function(){
        alert('Restore berhasil!\n\nHalaman akan dimuat ulang.');
        location.reload();
      }).catch(function(err){
        alert('Restore sebagian gagal: '+err.message);
      });
    } catch(err){
      alert('Error parsing file: '+err.message);
    }
  };
  reader.readAsText(el.files[0]);
};

/* ============================================================
   G. ANALITIK GURU
   ============================================================ */
window.openAnalitikGuru = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];
  if (!students.length){ alert('Belum ada siswa'); return; }

  var h = '<div class="alert alert-info">'+ic('chart')+
    '<div><b>Analitik Kelas</b> — '+esc(c.name)+'</div></div>';

  var scored = students.map(function(s){
    return { s:s, score: window.calcFinalScore ? window.calcFinalScore(cid, s.id) : 0 };
  });
  var valid = scored.filter(function(x){ return x.score > 0; });

  if (!valid.length){
    h += '<div class="empty-state">'+ic('chart',40)+'<p>Belum ada penilaian. Isi dulu sebelum melihat analitik.</p></div>';
    openModal('Analitik Kelas', h);
    return;
  }

  var buckets = { '4.0-3.5':[], '3.5-3.0':[], '3.0-2.5':[], '2.5-2.0':[], '2.0-0':[] };
  valid.forEach(function(x){
    if (x.score >= 3.5) buckets['4.0-3.5'].push(x);
    else if (x.score >= 3.0) buckets['3.5-3.0'].push(x);
    else if (x.score >= 2.5) buckets['3.0-2.5'].push(x);
    else if (x.score >= 2.0) buckets['2.5-2.0'].push(x);
    else buckets['2.0-0'].push(x);
  });

  var avg = valid.reduce(function(a,x){ return a+x.score; },0)/valid.length;
  var max = valid.reduce(function(a,x){ return x.score>a?x.score:a; },0);
  var min = valid.reduce(function(a,x){ return x.score<a?x.score:a; },4);

  h += '<div class="grid" style="margin-bottom:16px;">'+
    '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;color:var(--text-muted);">Rata-rata Kelas</div><div style="font-size:22px;font-weight:800;color:var(--primary);">'+avg.toFixed(2)+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;color:var(--text-muted);">Tertinggi</div><div style="font-size:22px;font-weight:800;color:var(--success);">'+max.toFixed(2)+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--danger);"><div style="font-size:11.5px;color:var(--text-muted);">Terendah</div><div style="font-size:22px;font-weight:800;color:var(--danger);">'+min.toFixed(2)+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--info);"><div style="font-size:11.5px;color:var(--text-muted);">Sudah Dinilai</div><div style="font-size:22px;font-weight:800;color:var(--info);">'+valid.length+'/'+students.length+'</div></div>'+
    '</div>';

  h += '<div class="card"><h3>'+ic('chart')+' Distribusi Nilai</h3>';
  var colors = { '4.0-3.5':'var(--success)', '3.5-3.0':'var(--info)', '3.0-2.5':'var(--primary)', '2.5-2.0':'var(--warning)', '2.0-0':'var(--danger)' };
  Object.keys(buckets).forEach(function(range){
    var cnt = buckets[range].length;
    var pct = valid.length ? Math.round(cnt/valid.length*100) : 0;
    h += '<div style="margin-bottom:10px;">'+
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">'+
        '<span><b>'+range+'</b></span><span>'+cnt+' siswa ('+pct+'%)</span>'+
      '</div>'+
      '<div class="progress-container" style="height:8px;"><div class="progress-bar" style="background:'+colors[range]+';width:'+pct+'%"></div></div>'+
      '</div>';
  });
  h += '</div>';

  var low = valid.filter(function(x){ return x.score < 2.5; });
  if (low.length){
    h += '<div class="card" style="border-left:4px solid var(--danger);"><h3>'+ic('warning')+' Siswa Perlu Perhatian (nilai &lt; 2.5)</h3>';
    low.sort(function(a,b){ return a.score-b.score; }).forEach(function(x){
      var meta = window.getStrukturMeta ? window.getStrukturMeta(x.s.role) : {jabatan:x.s.role};
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">'+
        '<div style="flex:1;"><b>'+esc(x.s.name)+'</b><br><small style="color:var(--text-muted);">'+esc(meta.jabatan)+'</small></div>'+
        '<div style="font-weight:800;color:var(--danger);">'+x.score.toFixed(2)+'</div>'+
        '</div>';
    });
    h += '</div>';
  }

  var top5 = valid.slice().sort(function(a,b){ return b.score-a.score; }).slice(0,5);
  h += '<div class="card" style="border-left:4px solid var(--warning);"><h3>'+ic('star')+' Top 5 Siswa</h3>';
  top5.forEach(function(x, i){
    var meta = window.getStrukturMeta ? window.getStrukturMeta(x.s.role) : {jabatan:x.s.role};
    h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">'+
      '<div style="width:30px;height:30px;border-radius:50%;background:var(--warning);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;">'+(i+1)+'</div>'+
      '<div style="flex:1;"><b>'+esc(x.s.name)+'</b><br><small style="color:var(--text-muted);">'+esc(meta.jabatan)+'</small></div>'+
      '<div style="font-weight:800;color:var(--primary);">'+x.score.toFixed(2)+'</div>'+
      '</div>';
  });
  h += '</div>';

  openModal('Analitik Kelas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   H. PRINT RAPOR
   ============================================================ */
window.openPrintRapor = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  if (!isGuru()){ alert('Hanya guru'); return; }
  var c = findClass(cid); if (!c) return;

  var h = '<div class="alert alert-info">'+ic('fileText')+
    '<div><b>Print Rapor</b><br>Pilih mode cetak:</div></div>';
  h += '<button class="btn btn-primary btn-block" style="margin-bottom:8px;" data-fx="fxPrintRaporKelas" data-arg="'+cid+'">'+
    ic('chart')+' Rapor Kelas (Rekap Semua Siswa)</button>';
  h += '<button class="btn btn-block" data-fx="fxPrintRaporSiswa" data-arg="'+cid+'">'+
    ic('user')+' Rapor per Siswa</button>';
  h += '<div class="alert alert-warning" style="margin-top:12px;font-size:12px;">'+
    '<b>Tips:</b> Setelah jendela print terbuka, pilih <b>"Save as PDF"</b> untuk menyimpan sebagai file PDF.</div>';
  openModal('Print Rapor', h);
};

window.fxPrintRaporKelas = function(cid){
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];
  var stages = window.getActiveStages ? window.getActiveStages(cid) : [];

  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor Kelas '+esc(c.name)+'</title>'+
    '<style>'+
    'body{font-family:"Segoe UI",sans-serif;padding:20px;color:#1f2937;}'+
    'h1{color:#1e40af;text-align:center;font-size:18pt;margin-bottom:4px;}'+
    'h2{text-align:center;font-size:12pt;color:#666;margin-top:0;font-weight:400;}'+
    'table{width:100%;border-collapse:collapse;margin-top:20px;font-size:10.5pt;}'+
    'th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;}'+
    'th{background:#dbeafe;color:#1e40af;font-weight:700;font-size:10pt;text-transform:uppercase;}'+
    'tr:nth-child(even) td{background:#f8f9fa;}'+
    '.footer{margin-top:20px;font-size:9pt;color:#999;text-align:right;}'+
    '@media print{@page{size:A4 landscape;margin:1.5cm;}}'+
    '</style></head><body>'+
    '<h1>Rapor Penilaian Proyek Teater</h1>'+
    '<h2>'+esc(c.name)+' — SMP Negeri 10 Samarinda</h2>'+
    '<table><thead><tr><th>No</th><th>Nama</th><th>Peran</th>';

  stages.forEach(function(s){ html += '<th>'+esc(s.name)+'<br><small>('+s.weight+'%)</small></th>'; });
  html += '<th>Nilai Akhir</th></tr></thead><tbody>';

  students.forEach(function(st, i){
    var meta = window.getStrukturMeta ? window.getStrukturMeta(st.role) : {jabatan:st.role};
    html += '<tr><td>'+(i+1)+'</td><td><b>'+esc(st.name)+'</b></td><td>'+esc(meta.jabatan)+'</td>';
    stages.forEach(function(s){
      var sc = window.calcStageScore ? window.calcStageScore(cid, st.id, s.id) : 0;
      html += '<td>'+sc.toFixed(2)+'</td>';
    });
    var final = window.calcFinalScore ? window.calcFinalScore(cid, st.id) : 0;
    html += '<td><b>'+final.toFixed(2)+'</b></td></tr>';
  });

  html += '</tbody></table>'+
    '<div class="footer">Dicetak: '+new Date().toLocaleString('id-ID')+'</div>'+
    '</body></html>';

  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(function(){ w.print(); }, 500);
};

window.fxPrintRaporSiswa = function(cid){
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];
  var opts = students.map(function(s){
    return '<option value="'+s.id+'">'+esc(s.name)+'</option>';
  }).join('');
  openModal('Pilih Siswa',
    '<div class="form-group"><label>Siswa</label><select id="fx-rapor-sid">'+opts+'</select></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxPrintSingleRapor" data-arg="'+cid+'">'+ic('fileText')+' Print</button>');
};

window.fxPrintSingleRapor = function(cid){
  var sid = document.getElementById('fx-rapor-sid').value;
  var c = findClass(cid); if (!c) return;
  var s = c.students.find(function(x){ return x.id===sid; });
  if (!s) return;
  var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
  var meta = window.getStrukturMeta ? window.getStrukturMeta(s.role) : {jabatan:s.role};
  var final = window.calcFinalScore ? window.calcFinalScore(cid, s.id) : 0;

  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor '+esc(s.name)+'</title>'+
    '<style>'+
    'body{font-family:"Segoe UI",sans-serif;padding:30px;color:#1f2937;}'+
    'h1{color:#1e40af;text-align:center;font-size:16pt;}'+
    '.info{background:#f8f9fa;padding:14px;border-radius:8px;margin:20px 0;}'+
    '.info div{margin:4px 0;font-size:11pt;}'+
    'table{width:100%;border-collapse:collapse;margin-top:14px;font-size:11pt;}'+
    'th,td{border:1px solid #ccc;padding:8px 10px;text-align:left;}'+
    'th{background:#dbeafe;color:#1e40af;}'+
    '.big-score{text-align:center;font-size:32pt;font-weight:800;color:'+(final>=3.5?'#10b981':final>=2.5?'#0ea5e9':final>=1.5?'#f59e0b':'#dc2626')+';padding:20px;}'+
    '.footer{margin-top:40px;display:flex;justify-content:space-between;font-size:10pt;}'+
    '@media print{@page{size:A4;margin:2cm;}}'+
    '</style></head><body>'+
    '<h1>Rapor Penilaian Proyek Teater</h1>'+
    '<div class="info">'+
    '<div><b>Nama:</b> '+esc(s.name)+'</div>'+
    '<div><b>Kelas:</b> '+esc(c.name)+'</div>'+
    '<div><b>Peran:</b> '+esc(meta.jabatan)+'</div>'+
    '<div><b>Email:</b> '+esc(s.email||'-')+'</div>'+
    '</div>'+
    '<h2 style="text-align:center;color:#1e40af;">Nilai Akhir</h2>'+
    '<div class="big-score">'+final.toFixed(2)+' / 4.00</div>'+
    '<h3 style="color:#1e40af;">Rincian per Tahap</h3>'+
    '<table><thead><tr><th>Tahap</th><th>Bobot</th><th>Nilai</th></tr></thead><tbody>';

  stages.forEach(function(st){
    var sc = window.calcStageScore ? window.calcStageScore(cid, s.id, st.id) : 0;
    html += '<tr><td>'+esc(st.name)+'</td><td>'+st.weight+'%</td><td><b>'+sc.toFixed(2)+'</b></td></tr>';
  });

  html += '</tbody></table>'+
    '<div class="footer">'+
    '<div>Samarinda, '+new Date().toLocaleDateString('id-ID')+'<br><br><br>Guru Pengampu</div>'+
    '<div><br><br><br>'+esc(u().name)+'</div>'+
    '</div></body></html>';

  var w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(function(){ w.print(); }, 500);
};

/* ============================================================
   I. LOG WA + DASHBOARD PESAN + ACTIVITY FEED
   ============================================================ */
window.openLogWA = function(){
  var logs = Object.values(window.DB.waLogs||{})
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); })
    .slice(0, 100);

  var h = '<div class="alert alert-info">'+ic('messageCircle')+
    '<div><b>Log WhatsApp</b> — '+logs.length+' entri</div></div>';
  if (!logs.length){
    h += '<div class="empty-state">'+ic('messageCircle',40)+'<p>Belum ada log.</p></div>';
  } else {
    logs.forEach(function(l){
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--success);">'+
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">'+
        '<div style="font-weight:700;font-size:13px;">'+esc(l.title||'-')+'</div>'+
        '<div style="font-size:11px;color:var(--text-muted);">'+fmtDate(l.createdAt)+'</div>'+
        '</div>'+
        '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Ke: <b>'+esc(l.toName||'-')+'</b> ('+esc(l.toPhone||'-')+')</div>'+
        '<div style="font-size:12px;margin-top:6px;white-space:pre-wrap;padding:8px;background:var(--surface);border-radius:6px;">'+esc(l.message||'')+'</div>'+
        '</div>';
    });
  }
  openModal('Log WhatsApp', h);
};

window.openDashboardPesan = function(){
  var notifs = (window.DB.notifications||[])
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); })
    .slice(0, 100);
  var h = '<div class="alert alert-info">'+ic('messageCircle')+
    '<div><b>Dashboard Pesan</b> — '+notifs.length+' pesan</div></div>';
  if (!notifs.length){
    h += '<div class="empty-state">'+ic('messageCircle',40)+'<p>Belum ada pesan.</p></div>';
  } else {
    notifs.forEach(function(n){
      var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type]||'Info';
      h += '<div class="card" style="margin-bottom:6px;border-left:3px solid var(--primary);">'+
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px;">'+
        '<span class="badge badge-primary">'+tl+'</span>'+
        '<span style="font-size:11px;color:var(--text-muted);">'+fmtDate(n.createdAt)+'</span>'+
        '</div>'+
        '<div style="font-weight:700;font-size:13px;">'+esc(n.title||'Notifikasi')+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Dari: <b>'+esc(n.fromName||'-')+'</b></div>'+
        (n.message?'<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">'+esc(n.message)+'</div>':'')+
        '</div>';
    });
  }
  openModal('Dashboard Pesan', h);
};

window.openActivityFeedModal = function(){
  var cid = uCid();
  var logs = (window.DB.activityLogs||[]).filter(function(l){
    return !l.classId || l.classId === cid;
  }).slice(0, 60);
  var h = '<div class="alert alert-info">'+ic('activity')+
    '<div><b>Aktivitas Tim</b> — '+logs.length+' entri</div></div>';
  if (!logs.length){
    h += '<div class="empty-state">'+ic('activity',40)+'<p>Belum ada aktivitas.</p></div>';
  } else {
    h += '<div class="activity-feed">';
    logs.forEach(function(l){
      h += '<div class="activity-item"><div class="activity-icon">'+ic('activity','sm')+'</div>'+
        '<div class="activity-content"><div class="activity-msg">'+esc(l.message||'')+'</div>'+
        '<div class="activity-meta"><b>'+esc(l.userName||'-')+'</b> — '+fmtDate(l.createdAt)+'</div></div></div>';
    });
    h += '</div>';
  }
  openModal('Aktivitas Tim', h);
};

/* ============================================================
   J. ABSENSI HARI INI + RUBRIK + DEADLINE + TUGAS SAYA
   ============================================================ */
window.openAbsensiHariIni = function(){
  var cid = uCid(); if (!cid) return;
  var today = new Date().toISOString().split('T')[0];
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){
    return m.classId === cid && m.date === today;
  });
  var h = '<div class="alert alert-info">'+ic('calendar')+
    '<div>Absensi Hari Ini — '+meetings.length+' sesi</div></div>';
  if (!meetings.length){
    h += '<div class="empty-state">'+ic('calendar',40)+'<p>Tidak ada sesi hari ini.</p></div>';
  } else {
    meetings.forEach(function(m){
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">'+
        '<div style="font-weight:700;font-size:13.5px;">'+esc(m.title)+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">'+esc(m.type||'-')+' — '+(m.openTime||'?')+' - '+(m.closeTime||'?')+'</div>'+
        '<button class="btn btn-primary btn-sm" data-fx="fxOpenAbsen" data-arg="'+m.id+'">'+ic('edit','sm')+' Isi</button>'+
        '</div>';
    });
  }
  openModal('Absensi Hari Ini', h);
};
window.fxOpenAbsen = function(mid){
  closeModal();
  setTimeout(function(){
    if (typeof window.openIsiAbsensi === 'function') window.openIsiAbsensi(mid);
  }, 150);
};

window.openRubrikPenilaian = function(){
  var myRole = uRole();
  var rubric = window.getRubricFor ? window.getRubricFor(myRole) : [];
  var h = '<div class="alert alert-info">'+ic('target')+
    '<div><b>Rubrik Penilaian</b><br><small>Peran: '+esc(roleLabel(myRole))+'</small></div></div>';
  if (!rubric.length){
    h += '<div class="empty-state"><p>Belum ada rubrik untuk peran Anda.</p></div>';
  } else {
    h += '<div class="scale-guide"><div class="scale-guide-title">'+ic('info','sm')+' Skala</div><div class="scale-guide-grid">'+
      '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>'+
      '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>'+
      '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>'+
      '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>'+
      '</div></div>';
    rubric.forEach(function(r){
      h += '<div class="rubric-item"><h4>'+esc(r.name)+' <span class="weight-info">'+r.weight+'%</span></h4>'+
        '<div class="desc">'+esc(r.desc||'')+'</div>'+
        (r.scale?'<div class="scale-explain"><b>Kriteria:</b> '+esc(r.scale)+'</div>':'')+
        '</div>';
    });
  }
  openModal('Rubrik Penilaian', h);
};

window.openDeadlineList = function(){
  var cid = uCid(), sid = uSid();
  var arr = (window.DB.notifications||[]).filter(function(n){
    if (n.classId !== cid || n.type !== 'tugas') return false;
    if (n.toId === 'all' || n.toId === sid) return true;
    if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
    return false;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '<div class="alert alert-info">'+ic('clock')+'<div>'+arr.length+' tugas/deadline</div></div>';
  if (!arr.length){
    h += '<div class="empty-state">'+ic('clock',40)+'<p>Tidak ada deadline.</p></div>';
  } else {
    arr.forEach(function(n){
      h += '<div style="padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--warning);">'+
        '<div style="font-weight:700;font-size:13px;">'+esc(n.title||'Tugas')+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">'+esc(n.fromName||'')+' — '+fmtDate(n.createdAt)+'</div>'+
        (n.message?'<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">'+esc(n.message)+'</div>':'')+
        '</div>';
    });
  }
  openModal('Deadline Saya', h);
};

window.openTugasSaya = function(){
  var cid = uCid(), sid = uSid();
  if (!cid || !sid){ alert('Data tidak ditemukan'); return; }
  var myRole = uRole();
  var ch = (window.DB.checklists && window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var myTasks = ch.filter(function(it){ return !it.isPersonal && it.assignedRole === myRole; });
  var doneCnt = myTasks.filter(function(x){ return x.done; }).length;

  var notifs = (window.DB.notifications||[]).filter(function(n){
    if (n.classId !== cid || n.type !== 'tugas') return false;
    if (n.toId === 'all' || n.toId === sid) return true;
    if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
    return false;
  }).slice(0, 10);

  var h = '<div class="alert alert-info">'+ic('clipboard')+'<div><b>Tugas Saya</b> — '+esc(roleLabel(myRole))+'</div></div>';

  if (myTasks.length){
    var pct = Math.round(doneCnt/myTasks.length*100);
    h += '<div class="progress-container"><div class="progress-bar '+(pct===100?'complete':'partial')+'" style="width:'+pct+'%"></div></div>'+
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">'+doneCnt+' / '+myTasks.length+' selesai</div>';
    myTasks.forEach(function(it){
      h += '<div style="display:flex;gap:8px;padding:8px 10px;background:var(--surface);border-radius:6px;margin-bottom:5px;">'+
        '<span style="font-size:16px;">'+(it.done?'✓':'○')+'</span>'+
        '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(it.name)+'</div>'+
        '</div>';
    });
  }
  if (notifs.length){
    h += '<h3 style="font-size:13.5px;margin:14px 0 8px;">Tugas dari Notifikasi</h3>';
    notifs.forEach(function(n){
      h += '<div class="welcome-item urgent" style="margin-bottom:6px;">'+
        '<div style="flex:1;"><b>'+esc(n.title||'Tugas')+'</b><br>'+
        '<small style="color:var(--text-muted);">'+esc(n.fromName||'')+' — '+fmtDate(n.createdAt)+'</small></div></div>';
    });
  }
  if (!myTasks.length && !notifs.length){
    h += '<div class="empty-state">'+ic('clipboard',40)+'<p>Belum ada tugas.</p></div>';
  }
  openModal('Tugas Saya', h);
};

/* ============================================================
   K. KOORDINASI FALLBACK
   ============================================================ */
function __koordFallback(){
  var cid = uCid();
  var others = (window.DB.classes||[]).filter(function(c){ return c.id !== cid; });
  var msgs = Object.values(window.DB.coordination||{})
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); })
    .slice(0, 20);

  var h = '<div class="alert alert-info">'+ic('messageCircle')+'<div><b>Koordinasi Antar Kelas</b></div></div>';
  if (msgs.length){
    h += '<div style="max-height:280px;overflow-y:auto;padding:8px;background:var(--surface);border-radius:8px;margin-bottom:12px;">';
    msgs.forEach(function(m){
      h += '<div style="padding:8px;background:var(--card);border-radius:6px;margin-bottom:6px;">'+
        '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(m.fromClassName||'')+' — '+esc(m.fromName||'')+' ke '+esc(m.toClassName||'Semua')+'</div>'+
        '<div style="font-size:12.5px;margin-top:4px;white-space:pre-wrap;">'+esc(m.message||'')+'</div>'+
        '</div>';
    });
    h += '</div>';
  }
  h += '<div class="form-group"><label>Kirim Ke</label><select id="fx-koord-target"><option value="">Semua Kelas</option>'+
    others.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join('')+'</select></div>';
  h += '<div class="form-group"><label>Pesan</label><textarea id="fx-koord-msg" rows="3" maxlength="500"></textarea></div>';
  h += '<button class="btn btn-primary btn-block" data-fx="fxKirimKoord">'+ic('send')+' Kirim</button>';
  openModal('Koordinasi Antar Kelas', h);
}
window.fxKirimKoord = function(){
  var msg = (document.getElementById('fx-koord-msg').value||'').trim();
  var toCid = (document.getElementById('fx-koord-target').value||'');
  if (!msg){ alert('Pesan kosong'); return; }
  var cid = uCid();
  var c = findClass(cid);
  var toC = toCid ? findClass(toCid) : null;
  var id = uid();
  window.fbSet('coordination', id, {
    id:id, message:msg,
    fromClassId:cid, fromClassName:c?c.name:'-', fromName:u().name, fromRole:uRole(),
    toClassId:toCid||null, toClassName:toC?toC.name:'Semua Kelas',
    createdAt:Date.now()
  }).then(function(){
    closeModal();
    alert('Terkirim!');
    setTimeout(__koordFallback, 200);
  });
};

/* ============================================================
   L. EVENT HANDLER UNTUK data-fx
   ============================================================ */
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-fx]');
  if (!el) return;
  e.preventDefault();
  var fn = el.getAttribute('data-fx');
  var arg = el.getAttribute('data-arg');
  if (typeof window[fn] !== 'function'){ console.warn('[features-fix] Missing:', fn); return; }
  try {
    if (arg) window[fn](arg);
    else window[fn]();
  } catch(err){ console.error('[features-fix]', fn, err); alert('Gagal: '+err.message); }
}, true);

/* ============================================================
   M. MENU GLOBAL (openSiswaMenu / openGuruMenu / openAdminMenu)
   FIX: app.js v16 taruh fungsi ini di dalam IIFE → tidak bisa
        dipanggil dari onclick="openSiswaMenu()"
   ============================================================ */
window.openSiswaMenu = function(){
  var role = uRole();
  var h = '<div class="alert alert-info">'+ic('gear')+'<div><b>Menu Siswa</b></div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;">';

  var items = [
    { i:'clipboard',    l:'Tugas Saya',         a:'openTugasSaya' },
    { i:'users',        l:'Tim Saya',           a:'openTimSaya' },
    { i:'checkSquare',  l:'Checklist Saya',     a:'openChecklistPribadi' },
    { i:'edit',         l:'Beri Nilai Rekan',   a:'openPenilaianSiswaDashboard' },
    { i:'award',        l:'Kerabat Kerja',      a:'openStrukturKerabatKerja' },
    { i:'fileText',     l:'Dokumen Saya',       a:'openDokumenSaya' },
    { i:'book',         l:'Arsip Naskah',       a:'openNaskahList' },
    { i:'calendar',     l:'Absensi',            a:'openMeetingList' },
    { i:'calendar',     l:'Absensi Hari Ini',   a:'openAbsensiHariIni' },
    { i:'target',       l:'Rubrik Penilaian',   a:'openRubrikPenilaian' },
    { i:'clock',        l:'Deadline Saya',      a:'openDeadlineList' },
    { i:'activity',     l:'Aktivitas Tim',      a:'openActivityFeedModal' },
    { i:'chart',        l:'Progres Divisi',     a:'openDivisionProgressSelf' },
    { i:'image',        l:'Kalender Konten',    a:'openKalenderKonten' },
    { i:'clock',        l:'Jadwal Latihan',     a:'openJadwalLatihan' },
    { i:'warning',      l:'Aduan',              a:'openAduanSiswa' },
    { i:'messageCircle',l:'Koordinasi',         a:'openKoordinasiAntarKelas' }
  ];

  if (['pimpinan_produksi','sutradara','koor_musik','koor_perlengkapan'].indexOf(role)>=0)
    items.push({ i:'briefcase', l:'Booking Alat Musik', a:'openBookingAlat' });
  if (['koor_perlengkapan','anggota_perlengkapan'].indexOf(role)>=0)
    items.push({ i:'briefcase', l:'Peminjaman Barang', a:'openPeminjamanBarang' });
  if (['pimpinan_produksi','sekretaris','sutradara','asisten_sutradara'].indexOf(role)>=0)
    items.push({ i:'calendar', l:'Master Schedule', a:'openMasterSchedule' });
  if (role === 'bendahara'){
    items.push({ i:'chart',     l:'Keuangan & RAB', a:'openKeuangan' });
    items.push({ i:'briefcase', l:'Kas Kelas',      a:'openKasKelas' });
  }
  if (['pimpinan_produksi','sekretaris','sutradara'].indexOf(role)>=0)
    items.push({ i:'layers', l:'Sistem Tahapan', a:'openSistemTahapan' });
  if (role.indexOf('koor_') === 0){
    items.push({ i:'send',  l:'Beri Tugas ke Anggota', a:'openKoorChecklistModal' });
    items.push({ i:'clock', l:'Deadline ke Anggota',    a:'openKoorDeadlineModal' });
  }

  items.push({ i:'key', l:'Ubah Password', a:'openChangePassword' });
  items.push({ i:'out', l:'Keluar',        a:'logout' });

  items.forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;text-align:left;width:100%;" '+
      'onclick="closeModal();setTimeout(function(){window.__menuCall(\''+it.a+'\')},150)">'+
      ic(it.i) + ' ' + esc(it.l) + '</button>';
  });
  h += '</div>';
  openModal('Menu', h);
};

window.openGuruMenu = function(){
  var h = '<div class="alert alert-info">'+ic('gear')+'<div><b>Menu Guru</b></div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;">';
  [
    { i:'chart',         l:'Analitik Kelas',   a:'openAnalitikGuru' },
    { i:'fileText',      l:'Print Rapor',      a:'openPrintRapor' },
    { i:'download',      l:'Backup & Restore', a:'openBackupRestore' },
    { i:'user',          l:'Profil Saya',      a:'openGuruProfile' },
    { i:'fileText',      l:'Kelola Template',  a:'openKelolaTemplate' },
    { i:'folder',        l:'Dokumen Siswa',    a:'openDokumenSiswa' },
    { i:'activity',      l:'Log Aktivitas',    a:'openActivityLog' },
    { i:'messageCircle', l:'Log WhatsApp',     a:'openLogWA' },
    { i:'messageCircle', l:'Dashboard Pesan',  a:'openDashboardPesan' },
    { i:'warning',       l:'Aduan Siswa',      a:'openAduanGuru' },
    { i:'key',           l:'Ubah Password',    a:'openChangePassword' },
    { i:'out',           l:'Keluar',           a:'logout' }
  ].forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;text-align:left;width:100%;" '+
      'onclick="closeModal();setTimeout(function(){window.__menuCall(\''+it.a+'\')},150)">'+
      ic(it.i) + ' ' + esc(it.l) + '</button>';
  });
  h += '</div>';
  openModal('Menu Guru', h);
};

window.openAdminMenu = function(){
  var h = '<div class="alert alert-info">'+ic('gear')+'<div><b>Menu Admin</b></div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;">';
  [
    { i:'personPlus', l:'Tambah Guru',     a:'openAddTeacher' },
    { i:'activity',   l:'Log Aktivitas',   a:'openActivityLog' },
    { i:'download',   l:'Backup & Restore',a:'openBackupRestore' },
    { i:'key',        l:'Ubah Password',   a:'openChangePassword' },
    { i:'out',        l:'Keluar',          a:'logout' }
  ].forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;text-align:left;width:100%;" '+
      'onclick="closeModal();setTimeout(function(){window.__menuCall(\''+it.a+'\')},150)">'+
      ic(it.i) + ' ' + esc(it.l) + '</button>';
  });
  h += '</div>';
  openModal('Menu Admin', h);
};

window.openMainMenu = function(){
  var t = uType();
  if (t === 'admin') return window.openAdminMenu();
  if (t === 'guru')  return window.openGuruMenu();
  return window.openSiswaMenu();
};

window.__menuCall = function(name){
  var fn = window[name];
  if (typeof fn !== 'function'){
    console.warn('[menu-call] Missing:', name);
    alert('Fitur "' + name + '" belum tersedia.');
    return;
  }
  try { fn(); }
  catch(e){ console.error('[menu-call]', name, e); alert('Error: ' + e.message); }
};

/* ============================================================
   N. ALIAS TAMBAHAN
   ============================================================ */
if (typeof window.openMasterScheduleMingguan !== 'function')
  window.openMasterScheduleMingguan = function(cid){
    if (typeof window.openMasterSchedule === 'function') return window.openMasterSchedule(cid);
    alert('Master Schedule belum siap.');
  };

if (typeof window.openKoorChecklistModal !== 'function')
  window.openKoorChecklistModal = function(){
    var cid = uCid();
    if (!cid){ alert('Kelas tidak ditemukan'); return; }
    if (typeof window.openChecklistManage === 'function') return window.openChecklistManage(cid);
    if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(cid);
    alert('Fitur checklist belum siap.');
  };

if (typeof window.openKoorDeadlineModal !== 'function')
  window.openKoorDeadlineModal = function(){
    var cid = uCid();
    if (!cid){ alert('Kelas tidak ditemukan'); return; }
    if (typeof window.openBeriTugas === 'function') return window.openBeriTugas(cid);
    alert('Fitur deadline belum siap.');
  };

/* ============================================================
   O. HANDLER data-action FALLBACK
   ============================================================ */
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var fn = el.getAttribute('data-action');
  if (!fn) return;
  if (typeof window[fn] === 'function') return;
  var arg = el.getAttribute('data-arg');
  e.preventDefault();
  if (el.hasAttribute('data-close-first')){
    closeModal();
    setTimeout(function(){ window.__menuCall(fn); }, 150);
  } else {
    window.__menuCall(fn);
  }
}, true);

/* ============================================================
   LOG
   ============================================================ */
console.log('[features-fix] v4.0 FINAL loaded');
console.log('  → Alias fungsi: 15');
console.log('  → Fitur baru: Keuangan, Kas, Peminjaman, Backup, Analitik, Print Rapor');
console.log('  → Menu global: openSiswaMenu, openGuruMenu, openAdminMenu');
console.log('  → Handler: data-fx + data-action');

})();
