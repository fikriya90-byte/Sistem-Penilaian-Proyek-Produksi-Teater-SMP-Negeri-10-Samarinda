/* ============================================================
   SP-PPT features-fix.js — v6.0 FINAL
   Load PALING AKHIR di index.html
   ============================================================ */
(function(){
'use strict';

if (!window.DB || typeof window.ico !== 'function'){
  console.error('[features-fix] app.js belum siap'); return;
}

/* ========== HELPERS ========== */
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
};
window.openChecklistViewSelf = window.openChecklistView;
window.openGuruPasswordView = function(cid){
  if (typeof window.lihatPassword === 'function') return window.lihatPassword(cid);
};
window.openCreateMeetingModalFull = function(type){
  type = type || 'rapat';
  var cid = uCid();
  if (typeof window.openBuatMeeting === 'function') return window.openBuatMeeting(type, cid);
  if (typeof window.openMeetingList === 'function') return window.openMeetingList(cid);
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
   B. FIX tandaiTugasSelesai
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
   C. KEUANGAN
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
    if (canEdit) h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" data-fx="fxAddRencana" data-arg="'+cid+'">'+ic('plus','sm')+' Tambah</button>';
    if (!data.plan.length) h += '<div class="empty-state">'+ic('fileText',40)+'<p>Belum ada rencana.</p></div>';
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
      h += '<div style="margin-top:12px;font-weight:700;">Total: Rp '+total.toLocaleString('id-ID')+'</div>';
    }
  } else if (tab === 'realisasi'){
    if (canEdit) h += '<div class="action-row" style="margin-bottom:12px;">'+
      '<button class="btn btn-sm btn-success" data-fx="fxAddTx" data-arg="'+cid+'|masuk">'+ic('plus','sm')+' Masuk</button>'+
      '<button class="btn btn-sm btn-danger" data-fx="fxAddTx" data-arg="'+cid+'|keluar">'+ic('plus','sm')+' Keluar</button>'+
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
      '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Pemasukan</div><div style="font-size:20px;font-weight:800;color:var(--success);">Rp '+masuk.toLocaleString('id-ID')+'</div></div>'+
      '<div class="card" style="border-left:4px solid var(--danger);"><div style="font-size:11.5px;">Pengeluaran</div><div style="font-size:20px;font-weight:800;color:var(--danger);">Rp '+keluar.toLocaleString('id-ID')+'</div></div>'+
      '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;">Saldo</div><div style="font-size:20px;font-weight:800;">Rp '+saldo.toLocaleString('id-ID')+'</div></div>'+
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
  if (!confirm('Hapus?')) return;
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
  if (!confirm('Hapus?')) return;
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
      h += '<div class="form-group"><label>Nama</label><input id="fx-kas-nama" value="'+esc(data.nama||'')+'"></div>'+
        '<div class="form-group"><label>Nominal (Rp)</label><input type="number" id="fx-kas-nominal" min="0" value="'+(data.nominal||'')+'"></div>'+
        '<div class="form-group"><label>Periode</label><select id="fx-kas-periode">'+
          '<option value="daily">Harian</option><option value="weekly" selected>Mingguan</option><option value="monthly">Bulanan</option>'+
        '</select></div>'+
        '<div class="form-group"><label>Mulai</label><input type="date" id="fx-kas-mulai" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
        '<button class="btn btn-primary btn-block" data-fx="fxSaveKas" data-arg="'+cid+'">Aktifkan</button>';
    } else h += '<div style="font-size:12.5px;color:var(--text-muted);padding:10px 0;">Kas belum aktif.</div>';
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
  if (!confirm('Nonaktifkan?')) return;
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
  if (!confirm('Batalkan?')) return;
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
    var shouldCheck = false;
    if (data.periode === 'daily') shouldCheck = last !== now.toISOString().split('T')[0];
    else if (data.periode === 'weekly'){
      var days = Math.floor((now - new Date(last)) / 86400000);
      shouldCheck = days >= 7;
    } else if (data.periode === 'monthly') shouldCheck = new Date(last).getMonth() !== now.getMonth();
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
    '<div class="card" style="border-left:4px solid var(--warning);"><div style="font-size:11.5px;">Dipinjam</div><div style="font-size:20px;font-weight:800;">'+aktif.length+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Dikembalikan</div><div style="font-size:20px;font-weight:800;">'+selesai.length+'</div></div>'+
    '</div>';
  if (canEdit) h += '<button class="btn btn-primary btn-sm" style="margin:12px 0;" data-fx="fxAddPinjam" data-arg="'+cid+'">'+ic('plus','sm')+' Catat</button>';
  if (!data.items.length) h += '<div class="empty-state">'+ic('briefcase',40)+'<p>Belum ada catatan.</p></div>';
  else {
    aktif.concat(selesai).forEach(function(it){
      var isAktif = it.status === 'dipinjam';
      h += '<div class="card" style="margin-bottom:8px;border-left:4px solid '+(isAktif?'var(--warning)':'var(--success)')+';">'+
        '<div style="font-weight:700;font-size:13.5px;margin-bottom:4px;">'+esc(it.nama)+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);">Peminjam: <b>'+esc(it.peminjam||'-')+'</b> · Jumlah: '+it.jumlah+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Pinjam: '+esc(it.tanggalPinjam||'-')+
          (isAktif?' · Rencana: '+esc(it.tanggalKembaliRencana||'-'):' · Kembali: '+esc(it.tanggalKembaliAktual||'-'))+'</div>'+
        (it.catatan?'<div style="font-size:12px;margin-top:6px;padding:6px 8px;background:var(--surface);border-radius:6px;">'+esc(it.catatan)+'</div>':'')+
        (canEdit?'<div class="action-row" style="margin-top:8px;">'+
          (isAktif?'<button class="btn btn-sm btn-success" data-fx="fxMarkKembali" data-arg="'+cid+'|'+it.id+'">'+ic('check','sm')+' Kembalikan</button>':'')+
          '<button class="btn btn-sm btn-danger" data-fx="fxDelPinjam" data-arg="'+cid+'|'+it.id+'">'+ic('trash','sm')+'</button></div>':'')+
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
    '<div class="form-group"><label>Tgl Pinjam</label><input type="date" id="fx-pj-tgl" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
    '<div class="form-group"><label>Rencana Kembali</label><input type="date" id="fx-pj-kembali"></div>'+
    '<div class="form-group"><label>Catatan</label><textarea id="fx-pj-catatan" rows="2"></textarea></div>'+
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
    kondisi:document.getElementById('fx-pj-kondisi').value,
    tanggalPinjam:document.getElementById('fx-pj-tgl').value,
    tanggalKembaliRencana:document.getElementById('fx-pj-kembali').value||null,
    catatan:(document.getElementById('fx-pj-catatan').value||'').trim(),
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
  if (!confirm('Hapus?')) return;
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
  var h = '<div class="alert alert-info">'+ic('download')+'<div><b>Backup & Restore</b></div></div>';
  h += '<div class="card" style="border-left:4px solid var(--primary);">'+
    '<h3>'+ic('download')+' Backup</h3>'+
    '<button class="btn btn-primary btn-block" data-fx="fxDownloadBackup">'+ic('download')+' Download Backup JSON</button></div>';
  h += '<div class="card" style="border-left:4px solid var(--warning);">'+
    '<h3>'+ic('upload')+' Restore</h3>'+
    '<input type="file" id="fx-backup-file" accept=".json" style="width:100%;padding:8px;margin-bottom:10px;">'+
    '<button class="btn btn-warning btn-block" data-fx="fxRestoreBackup">'+ic('upload')+' Restore</button></div>';
  openModal('Backup & Restore', h);
  if (window.hydrateIcons) window.hydrateIcons();
};
window.fxDownloadBackup = function(){
  var backup = {
    version: '6.0', exportedAt: Date.now(), exportedBy: u().name,
    classes: window.DB.classes, teachers: window.DB.teachers,
    checklists: window.DB.checklists, meetings: window.DB.meetings,
    evaluations: window.DB.evaluations, deadlines: window.DB.deadlines,
    activeStages: window.DB.activeStages, stages: window.DB.stages,
    notifications: window.DB.notifications, bookings: window.DB.bookings,
    coordination: window.DB.coordination
  };
  var blob = new Blob([JSON.stringify(backup, null, 2)], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'SPPPT_Backup_'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  alert('Backup didownload!');
};
window.fxRestoreBackup = function(){
  var el = document.getElementById('fx-backup-file');
  if (!el || !el.files || !el.files[0]){ alert('Pilih file'); return; }
  if (!confirm('Yakin restore?')) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try {
      var data = JSON.parse(e.target.result);
      if (!data.classes){ alert('File tidak valid'); return; }
      var promises = [];
      (data.classes||[]).forEach(function(c){ promises.push(window.fbSet('classes', c.id, c)); });
      if (data.stages) promises.push(window.fbSet('config', 'stages', {stages:data.stages}));
      Object.keys(data.checklists||{}).forEach(function(cid){
        promises.push(window.fbSet('checklists', cid, Object.assign({}, data.checklists[cid], {classId:cid})));
      });
      Object.keys(data.meetings||{}).forEach(function(mid){
        promises.push(window.fbSet('meetings', mid, data.meetings[mid]));
      });
      Object.keys(data.evaluations||{}).forEach(function(cid){
        var byTarget = data.evaluations[cid]||{};
        Object.keys(byTarget).forEach(function(tid){
          promises.push(window.fbSet('evaluations', cid+'__'+tid, Object.assign({}, byTarget[tid], {classId:cid, targetId:tid})));
        });
      });
      Promise.all(promises).then(function(){
        alert('Restore berhasil!'); location.reload();
      }).catch(function(err){ alert('Gagal: '+err.message); });
    } catch(err){ alert('Error: '+err.message); }
  };
  reader.readAsText(el.files[0]);
};

/* ============================================================
   G. ANALITIK
   ============================================================ */
window.openAnalitikGuru = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];
  var h = '<div class="alert alert-info">'+ic('chart')+'<div><b>Analitik Kelas</b> — '+esc(c.name)+'</div></div>';
  var scored = students.map(function(s){
    return { s:s, score: window.calcFinalScore ? window.calcFinalScore(cid, s.id) : 0 };
  });
  var valid = scored.filter(function(x){ return x.score > 0; });
  if (!valid.length){
    h += '<div class="empty-state">'+ic('chart',40)+'<p>Belum ada penilaian.</p></div>';
    openModal('Analitik', h); return;
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
  h += '<div class="grid" style="margin-bottom:16px;">'+
    '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;">Rata-rata</div><div style="font-size:22px;font-weight:800;color:var(--primary);">'+avg.toFixed(2)+'</div></div>'+
    '<div class="card" style="border-left:4px solid var(--info);"><div style="font-size:11.5px;">Dinilai</div><div style="font-size:22px;font-weight:800;color:var(--info);">'+valid.length+'/'+students.length+'</div></div>'+
    '</div>';
  h += '<div class="card"><h3>'+ic('chart')+' Distribusi</h3>';
  var colors = { '4.0-3.5':'var(--success)', '3.5-3.0':'var(--info)', '3.0-2.5':'var(--primary)', '2.5-2.0':'var(--warning)', '2.0-0':'var(--danger)' };
  Object.keys(buckets).forEach(function(range){
    var cnt = buckets[range].length;
    var pct = valid.length ? Math.round(cnt/valid.length*100) : 0;
    h += '<div style="margin-bottom:10px;">'+
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span><b>'+range+'</b></span><span>'+cnt+' ('+pct+'%)</span></div>'+
      '<div class="progress-container" style="height:8px;"><div class="progress-bar" style="background:'+colors[range]+';width:'+pct+'%"></div></div></div>';
  });
  h += '</div>';
  var low = valid.filter(function(x){ return x.score < 2.5; });
  if (low.length){
    h += '<div class="card" style="border-left:4px solid var(--danger);"><h3>'+ic('warning')+' Perlu Perhatian</h3>';
    low.sort(function(a,b){ return a.score-b.score; }).forEach(function(x){
      h += '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">'+
        '<div style="flex:1;"><b>'+esc(x.s.name)+'</b></div>'+
        '<div style="font-weight:800;color:var(--danger);">'+x.score.toFixed(2)+'</div></div>';
    });
    h += '</div>';
  }
  openModal('Analitik Kelas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   H. PRINT RAPOR
   ============================================================ */
window.openPrintRapor = function(cid){
  cid = cid || uCid();
  if (!cid || !isGuru()){ alert('Hanya guru'); return; }
  var h = '<div class="alert alert-info">'+ic('fileText')+'<div><b>Print Rapor</b></div></div>';
  h += '<button class="btn btn-primary btn-block" style="margin-bottom:8px;" data-fx="fxPrintRaporKelas" data-arg="'+cid+'">'+ic('chart')+' Rapor Kelas</button>';
  h += '<button class="btn btn-block" data-fx="fxPrintRaporSiswa" data-arg="'+cid+'">'+ic('user')+' Rapor per Siswa</button>';
  openModal('Print Rapor', h);
};
window.fxPrintRaporKelas = function(cid){
  var c = findClass(cid); if (!c) return;
  var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor '+esc(c.name)+'</title>'+
    '<style>body{font-family:"Segoe UI",sans-serif;padding:20px;}h1{color:#1e40af;text-align:center;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #ccc;padding:6px 8px;}th{background:#dbeafe;color:#1e40af;}@media print{@page{size:A4 landscape;margin:1.5cm;}}</style></head><body>'+
    '<h1>Rapor Penilaian Proyek Teater</h1><h2 style="text-align:center;color:#666;font-weight:400;">'+esc(c.name)+' — SMP Negeri 10 Samarinda</h2>'+
    '<table><thead><tr><th>No</th><th>Nama</th><th>Peran</th>';
  stages.forEach(function(s){ html += '<th>'+esc(s.name)+'</th>'; });
  html += '<th>Nilai Akhir</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(st, i){
    var meta = window.getStrukturMeta ? window.getStrukturMeta(st.role) : {jabatan:st.role};
    html += '<tr><td>'+(i+1)+'</td><td><b>'+esc(st.name)+'</b></td><td>'+esc(meta.jabatan)+'</td>';
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
window.fxPrintRaporSiswa = function(cid){
  var c = findClass(cid); if (!c) return;
  var opts = (c.students||[]).map(function(s){
    return '<option value="'+s.id+'">'+esc(s.name)+'</option>';
  }).join('');
  openModal('Pilih Siswa',
    '<div class="form-group"><label>Siswa</label><select id="fx-rapor-sid">'+opts+'</select></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxPrintSingleRapor" data-arg="'+cid+'">'+ic('fileText')+' Print</button>');
};
window.fxPrintSingleRapor = function(cid){
  var sid = document.getElementById('fx-rapor-sid').value;
  var c = findClass(cid); if (!c) return;
  var s = c.students.find(function(x){ return x.id===sid; }); if (!s) return;
  var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
  var meta = window.getStrukturMeta ? window.getStrukturMeta(s.role) : {jabatan:s.role};
  var final = window.calcFinalScore ? window.calcFinalScore(cid, s.id) : 0;
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor '+esc(s.name)+'</title>'+
    '<style>body{font-family:"Segoe UI",sans-serif;padding:30px;}h1{color:#1e40af;text-align:center;}.info{background:#f8f9fa;padding:14px;border-radius:8px;margin:20px 0;}.big{text-align:center;font-size:32pt;font-weight:800;color:'+(final>=3.5?'#10b981':final>=2.5?'#0ea5e9':'#f59e0b')+';padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;}th{background:#dbeafe;}</style></head><body>'+
    '<h1>Rapor Penilaian Proyek Teater</h1>'+
    '<div class="info"><div><b>Nama:</b> '+esc(s.name)+'</div><div><b>Kelas:</b> '+esc(c.name)+'</div><div><b>Peran:</b> '+esc(meta.jabatan)+'</div></div>'+
    '<h2 style="text-align:center;color:#1e40af;">Nilai Akhir</h2><div class="big">'+final.toFixed(2)+' / 4.00</div>'+
    '<table><thead><tr><th>Tahap</th><th>Bobot</th><th>Nilai</th></tr></thead><tbody>';
  stages.forEach(function(st){
    var sc = window.calcStageScore ? window.calcStageScore(cid, s.id, st.id) : 0;
    html += '<tr><td>'+esc(st.name)+'</td><td>'+st.weight+'%</td><td><b>'+sc.toFixed(2)+'</b></td></tr>';
  });
  html += '</tbody></table></body></html>';
  var w = window.open('', '_blank');
  w.document.write(html); w.document.close();
  setTimeout(function(){ w.print(); }, 500);
};

/* ============================================================
   I. LOG WA + PESAN + AKTIVITAS
   ============================================================ */
window.openLogWA = function(){
  var logs = Object.values(window.DB.waLogs||{})
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0, 100);
  var h = '<div class="alert alert-info">'+ic('messageCircle')+'<div><b>Log WhatsApp</b> — '+logs.length+'</div></div>';
  if (!logs.length) h += '<div class="empty-state">'+ic('messageCircle',40)+'<p>Belum ada log.</p></div>';
  else logs.forEach(function(l){
    h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--success);">'+
      '<div style="display:flex;justify-content:space-between;gap:8px;">'+
      '<div style="font-weight:700;font-size:13px;">'+esc(l.title||'-')+'</div>'+
      '<div style="font-size:11px;color:var(--text-muted);">'+fmtDate(l.createdAt)+'</div></div>'+
      '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Ke: <b>'+esc(l.toName||'-')+'</b></div>'+
      '<div style="font-size:12px;margin-top:6px;padding:8px;background:var(--surface);border-radius:6px;">'+esc(l.message||'')+'</div></div>';
  });
  openModal('Log WhatsApp', h);
};
window.openDashboardPesan = function(){
  var notifs = (window.DB.notifications||[])
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0, 100);
  var h = '<div class="alert alert-info">'+ic('messageCircle')+'<div><b>Dashboard Pesan</b></div></div>';
  if (!notifs.length) h += '<div class="empty-state">'+ic('messageCircle',40)+'<p>Belum ada pesan.</p></div>';
  else notifs.forEach(function(n){
    var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type]||'Info';
    h += '<div class="card" style="margin-bottom:6px;border-left:3px solid var(--primary);">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">'+
      '<span class="badge badge-primary">'+tl+'</span>'+
      '<span style="font-size:11px;color:var(--text-muted);">'+fmtDate(n.createdAt)+'</span></div>'+
      '<div style="font-weight:700;font-size:13px;">'+esc(n.title||'-')+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Dari: <b>'+esc(n.fromName||'-')+'</b></div>'+
      (n.message?'<div style="font-size:12.5px;margin-top:6px;">'+esc(n.message)+'</div>':'')+'</div>';
  });
  openModal('Dashboard Pesan', h);
};
window.openActivityFeedModal = function(){
  var cid = uCid();
  var logs = (window.DB.activityLogs||[]).filter(function(l){
    return !l.classId || l.classId === cid;
  }).slice(0, 60);
  var h = '<div class="alert alert-info">'+ic('activity')+'<div><b>Aktivitas Tim</b></div></div>';
  if (!logs.length) h += '<div class="empty-state">'+ic('activity',40)+'<p>Belum ada aktivitas.</p></div>';
  else {
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
   J. ABSENSI + RUBRIK + DEADLINE + TUGAS
   ============================================================ */
window.openAbsensiHariIni = function(){
  var cid = uCid(); if (!cid) return;
  var today = new Date().toISOString().split('T')[0];
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){
    return m.classId === cid && m.date === today;
  });
  var h = '<div class="alert alert-info">'+ic('calendar')+'<div>Absensi Hari Ini — '+meetings.length+'</div></div>';
  if (!meetings.length) h += '<div class="empty-state">'+ic('calendar',40)+'<p>Tidak ada sesi.</p></div>';
  else meetings.forEach(function(m){
    h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">'+
      '<div style="font-weight:700;font-size:13.5px;">'+esc(m.title)+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">'+esc(m.type||'-')+' — '+(m.openTime||'?')+' - '+(m.closeTime||'?')+'</div>'+
      '<button class="btn btn-primary btn-sm" data-fx="fxOpenAbsen" data-arg="'+m.id+'">'+ic('edit','sm')+' Isi</button></div>';
  });
  openModal('Absensi Hari Ini', h);
};
window.fxOpenAbsen = function(mid){
  closeModal();
  setTimeout(function(){ if (typeof window.openIsiAbsensi === 'function') window.openIsiAbsensi(mid); }, 150);
};
window.openRubrikPenilaian = function(){
  var myRole = uRole();
  var rubric = window.getRubricFor ? window.getRubricFor(myRole) : [];
  var h = '<div class="alert alert-info">'+ic('target')+'<div><b>Rubrik</b> — '+esc(roleLabel(myRole))+'</div></div>';
  if (!rubric.length) h += '<div class="empty-state"><p>Belum ada rubrik.</p></div>';
  else {
    h += '<div class="scale-guide"><div class="scale-guide-title">'+ic('info','sm')+' Skala</div><div class="scale-guide-grid">'+
      '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>'+
      '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>'+
      '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>'+
      '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div></div></div>';
    rubric.forEach(function(r){
      h += '<div class="rubric-item"><h4>'+esc(r.name)+' <span class="weight-info">'+r.weight+'%</span></h4>'+
        '<div class="desc">'+esc(r.desc||'')+'</div>'+
        (r.scale?'<div class="scale-explain"><b>Kriteria:</b> '+esc(r.scale)+'</div>':'')+'</div>';
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
  var h = '<div class="alert alert-info">'+ic('clock')+'<div>'+arr.length+' tugas</div></div>';
  if (!arr.length) h += '<div class="empty-state">'+ic('clock',40)+'<p>Tidak ada deadline.</p></div>';
  else arr.forEach(function(n){
    h += '<div style="padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--warning);">'+
      '<div style="font-weight:700;font-size:13px;">'+esc(n.title||'-')+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">'+esc(n.fromName||'')+' — '+fmtDate(n.createdAt)+'</div>'+
      (n.message?'<div style="font-size:12.5px;margin-top:6px;">'+esc(n.message)+'</div>':'')+'</div>';
  });
  openModal('Deadline', h);
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
        '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+esc(it.name)+'</div></div>';
    });
  }
  if (notifs.length){
    h += '<h3 style="font-size:13.5px;margin:14px 0 8px;">Tugas dari Notifikasi</h3>';
    notifs.forEach(function(n){
      h += '<div class="welcome-item urgent" style="margin-bottom:6px;">'+
        '<div style="flex:1;"><b>'+esc(n.title||'-')+'</b><br>'+
        '<small style="color:var(--text-muted);">'+esc(n.fromName||'')+' — '+fmtDate(n.createdAt)+'</small></div></div>';
    });
  }
  if (!myTasks.length && !notifs.length){
    h += '<div class="empty-state">'+ic('clipboard',40)+'<p>Belum ada tugas.</p></div>';
  }
  openModal('Tugas Saya', h);
};

/* ============================================================
   K. KOORDINASI
   ============================================================ */
function __koordFallback(){
  var cid = uCid();
  var others = (window.DB.classes||[]).filter(function(c){ return c.id !== cid; });
  var msgs = Object.values(window.DB.coordination||{})
    .sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0, 20);
  var h = '<div class="alert alert-info">'+ic('messageCircle')+'<div><b>Koordinasi Antar Kelas</b></div></div>';
  if (msgs.length){
    h += '<div style="max-height:280px;overflow-y:auto;padding:8px;background:var(--surface);border-radius:8px;margin-bottom:12px;">';
    msgs.forEach(function(m){
      h += '<div style="padding:8px;background:var(--card);border-radius:6px;margin-bottom:6px;">'+
        '<div style="font-size:11.5px;color:var(--text-muted);">'+esc(m.fromClassName||'')+' — '+esc(m.fromName||'')+' ke '+esc(m.toClassName||'Semua')+'</div>'+
        '<div style="font-size:12.5px;margin-top:4px;">'+esc(m.message||'')+'</div></div>';
    });
    h += '</div>';
  }
  h += '<div class="form-group"><label>Kirim Ke</label><select id="fx-koord-target"><option value="">Semua Kelas</option>'+
    others.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join('')+'</select></div>';
  h += '<div class="form-group"><label>Pesan</label><textarea id="fx-koord-msg" rows="3" maxlength="500"></textarea></div>';
  h += '<button class="btn btn-primary btn-block" data-fx="fxKirimKoord">'+ic('send')+' Kirim</button>';
  openModal('Koordinasi', h);
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
    toClassId:toCid||null, toClassName:toC?toC.name:'Semua Kelas', createdAt:Date.now()
  }).then(function(){
    closeModal(); alert('Terkirim!');
    setTimeout(__koordFallback, 200);
  });
};

/* ============================================================
   L. HANDLER data-fx
   ============================================================ */
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-fx]');
  if (!el) return;
  e.preventDefault();
  var fn = el.getAttribute('data-fx');
  var arg = el.getAttribute('data-arg');
  if (typeof window[fn] !== 'function'){ console.warn('[features-fix] Missing:', fn); return; }
  try { if (arg) window[fn](arg); else window[fn](); }
  catch(err){ console.error('[features-fix]', fn, err); alert('Gagal: '+err.message); }
}, true);

/* ============================================================
   M. MENU GLOBAL
   ============================================================ */
window.openSiswaMenu = function(){
  var role = uRole();
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">'+
    ic('user','lg')+'<div style="flex:1;"><b>'+esc(u().name||'')+'</b><br>'+
    '<small style="color:var(--text-muted);">'+esc(roleLabel(role))+'</small></div></div>';

  function tile(items){
    var o = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    items.forEach(function(it){
      o += '<button class="fx-mi-tile" data-fx-menu="'+it.a+'">'+
        '<div class="fx-mi">'+ic(it.i, 20)+'</div>'+
        '<div class="fx-ml">'+esc(it.l)+'</div></button>';
    });
    return o + '</div>';
  }

  h += '<div class="fx-menu-section">'+ic('clipboard','sm')+' Tugas & Nilai</div>';
  h += tile([
    { i:'clipboard',   l:'Tugas Saya',    a:'openTugasSaya' },
    { i:'checkSquare', l:'Checklist',     a:'openChecklistPribadi' },
    { i:'edit',        l:'Beri Nilai',    a:'openPenilaianSiswaDashboard' },
    { i:'target',      l:'Rubrik',        a:'openRubrikPenilaian' },
    { i:'clock',       l:'Deadline',      a:'openDeadlineList' },
    { i:'users',       l:'Checklist Tim', a:'openChecklistTim' }
  ]);

  h += '<div class="fx-menu-section">'+ic('users','sm')+' Tim & Struktur</div>';
  h += tile([
    { i:'award',    l:'Kerabat Kerja',  a:'openStrukturKerabatKerja' },
    { i:'chart',    l:'Progres Divisi', a:'openDivisionProgressSelf' },
    { i:'activity', l:'Aktivitas',      a:'openActivityFeedModal' }
  ]);

  h += '<div class="fx-menu-section">'+ic('calendar','sm')+' Jadwal & Absensi</div>';
  var jItems = [
    { i:'calendar', l:'Absensi',          a:'openMeetingList' },
    { i:'clock',    l:'Jadwal Latihan',   a:'openJadwalLatihan' },
    { i:'image',    l:'Kalender Konten',  a:'openKalenderKonten' }
  ];
  if (['pimpinan_produksi','sekretaris','sutradara','asisten_sutradara'].indexOf(role) >= 0)
    jItems.push({ i:'calendar', l:'Master Schedule', a:'openMasterSchedule' });
  h += tile(jItems);

  h += '<div class="fx-menu-section">'+ic('folder','sm')+' Dokumen</div>';
  h += tile([
    { i:'fileText', l:'Dokumen Saya', a:'openDokumenSaya' },
    { i:'book',     l:'Arsip Naskah', a:'openNaskahList' }
  ]);

  var kItems = [];
  if (['pimpinan_produksi','sutradara','koor_musik','koor_perlengkapan'].indexOf(role) >= 0)
    kItems.push({ i:'briefcase', l:'Booking Alat', a:'openBookingAlat' });
  if (['koor_perlengkapan','anggota_perlengkapan'].indexOf(role) >= 0)
    kItems.push({ i:'briefcase', l:'Peminjaman', a:'openPeminjamanBarang' });
  if (role === 'bendahara'){
    kItems.push({ i:'chart',     l:'Keuangan',  a:'openKeuangan' });
    kItems.push({ i:'briefcase', l:'Kas Kelas', a:'openKasKelas' });
  }
  if (['pimpinan_produksi','sekretaris','sutradara'].indexOf(role) >= 0)
    kItems.push({ i:'layers', l:'Sistem Tahapan', a:'openSistemTahapan' });
  if (role.indexOf('koor_') === 0)
    kItems.push({ i:'send', l:'Beri Tugas', a:'openKoorChecklistModal' });
  if (kItems.length){
    h += '<div class="fx-menu-section">'+ic('star','sm')+' Khusus '+esc(roleLabel(role))+'</div>';
    h += tile(kItems);
  }

  h += '<div class="fx-menu-section">'+ic('gear','sm')+' Lainnya</div>';
  h += tile([
    { i:'user',          l:'Foto Profil', a:'openUploadFotoProfil' },
    { i:'warning',       l:'Aduan',       a:'openAduanSiswa' },
    { i:'messageCircle', l:'Koordinasi',  a:'openKoordinasiAntarKelas' },
    { i:'key',           l:'Password',    a:'openChangePassword' },
    { i:'out',           l:'Keluar',      a:'logout' }
  ]);

  h += '</div>';
  openModal('Menu', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openGuruMenu = function(){
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">'+
    ic('user','lg')+'<div style="flex:1;"><b>'+esc(u().name||'')+'</b><br>'+
    '<small style="color:var(--text-muted);">Guru Pengampu</small></div></div>';

  function tile(items){
    var o = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    items.forEach(function(it){
      o += '<button class="fx-mi-tile" data-fx-menu="'+it.a+'">'+
        '<div class="fx-mi">'+ic(it.i, 20)+'</div>'+
        '<div class="fx-ml">'+esc(it.l)+'</div></button>';
    });
    return o + '</div>';
  }

  h += '<div class="fx-menu-section">'+ic('chart','sm')+' Analitik & Rapor</div>';
  h += tile([
    { i:'chart',    l:'Analitik',  a:'openAnalitikGuru' },
    { i:'fileText', l:'Rapor',     a:'openPrintRapor' },
    { i:'folder',   l:'Dokumen',   a:'openDokumenSiswa' },
    { i:'fileText', l:'Template',  a:'openKelolaTemplate' }
  ]);

  h += '<div class="fx-menu-section">'+ic('messageCircle','sm')+' Komunikasi</div>';
  h += tile([
    { i:'warning',       l:'Aduan',    a:'openAduanGuru' },
    { i:'messageCircle', l:'Log WA',   a:'openLogWA' },
    { i:'messageCircle', l:'Pesan',    a:'openDashboardPesan' },
    { i:'activity',      l:'Aktivitas',a:'openActivityLog' }
  ]);

  h += '<div class="fx-menu-section">'+ic('gear','sm')+' Sistem</div>';
  h += tile([
    { i:'download', l:'Backup',   a:'openBackupRestore' },
    { i:'user',     l:'Profil',   a:'openGuruProfile' },
    { i:'key',      l:'Password', a:'openChangePassword' },
    { i:'out',      l:'Keluar',   a:'logout' }
  ]);

  h += '</div>';
  openModal('Menu Guru', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openAdminMenu = function(){
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;"><b>Menu Admin</b></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  [
    { i:'personPlus', l:'Tambah Guru', a:'openAddTeacher' },
    { i:'activity',   l:'Log',         a:'openActivityLog' },
    { i:'download',   l:'Backup',      a:'openBackupRestore' },
    { i:'key',        l:'Password',    a:'openChangePassword' },
    { i:'out',        l:'Keluar',      a:'logout' }
  ].forEach(function(it){
    h += '<button class="fx-mi-tile" data-fx-menu="'+it.a+'">'+
      '<div class="fx-mi">'+ic(it.i, 20)+'</div>'+
      '<div class="fx-ml">'+esc(it.l)+'</div></button>';
  });
  h += '</div></div>';
  openModal('Menu Admin', h);
  if (window.hydrateIcons) window.hydrateIcons();
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
    alert('Fitur "'+name+'" belum tersedia.');
    return;
  }
  try { fn(); }
  catch(e){ console.error('[menu-call]', name, e); alert('Error: '+e.message); }
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
   O. HANDLER data-action
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
   P. UI POLISH
   ============================================================ */

/* P.1 Aduan section di dashboard siswa */
function __injectAduanSection(){
  if (!isSiswa()) return;
  var mc = document.getElementById('main-content');
  if (!mc || mc.querySelector('.fx-aduan-section')) return;
  var cid = uCid(), sid = uSid();
  var list = Object.values(window.DB.aduan||{}).filter(function(a){
    return a.classId === cid && a.fromId === sid;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });

  var h = '<div class="card fx-aduan-section" style="border-left:4px solid var(--danger);">';
  h += '<h3>'+ic('warning')+' Aduan Saya ('+list.length+')</h3>';
  if (!list.length){
    h += '<div style="font-size:12.5px;color:var(--text-muted);padding:8px 0;">Belum ada aduan. Klik tombol merah di kanan bawah.</div>';
  } else {
    list.slice(0,3).forEach(function(a){
      var badge = a.status==='resolved'?'badge-success':a.status==='read'?'badge-info':'badge-warning';
      var label = a.status==='resolved'?'Selesai':a.status==='read'?'Dibaca':'Menunggu';
      h += '<div style="padding:8px 10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid '+(a.status==='resolved'?'var(--success)':'var(--warning)')+';">';
      h += '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px;">';
      h += '<div style="font-weight:700;font-size:12.5px;">'+esc(a.title)+'</div>';
      h += '<span class="badge '+badge+'" style="font-size:9px;">'+label+'</span></div>';
      h += '<div style="font-size:11px;color:var(--text-muted);">'+esc(a.category)+' · '+fmtDate(a.createdAt)+'</div>';
      if (a.feedback) h += '<div style="font-size:11.5px;margin-top:4px;padding:6px 8px;background:var(--success-soft);border-radius:5px;"><b>Balasan:</b> '+esc(a.feedback)+'</div>';
      h += '</div>';
    });
    if (list.length > 3) h += '<button class="btn btn-sm" style="margin-top:6px;" data-fx-menu="openAduanSiswa">Lihat Semua ('+list.length+')</button>';
  }
  h += '</div>';
  var w = document.createElement('div');
  w.innerHTML = h;
  mc.appendChild(w.firstElementChild);
}
(function hookAduan(){
  var orig = window.renderSiswaDash || window.renderSiswaDashboard;
  if (typeof orig !== 'function') return;
  var wrapped = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(__injectAduanSection, 300);
    setTimeout(__injectAduanSection, 800);
    return ret;
  };
  window.renderSiswaDash = wrapped;
  window.renderSiswaDashboard = wrapped;
})();

/* P.2 Handler tile menu */
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-fx-menu]');
  if (!el) return;
  e.preventDefault(); e.stopPropagation();
  var fn = el.getAttribute('data-fx-menu');
  closeModal();
  setTimeout(function(){ window.__menuCall(fn); }, 200);
}, true);

/* P.3 Carousel — Master Timeline & Pengumuman Produksi */
window.injectSlideTimelines = function(){
  if (!window.currentUser) return;
  var mc = document.getElementById('main-content');
  if (!mc) return;
  var cid = uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  if (mc.querySelector('.dash-carousel-wrap')) return;

  var msItems = [];
  try {
    if (typeof window.getMasterSchedule === 'function'){
      var ms = window.getMasterSchedule(cid);
      if (ms && ms.items) msItems = ms.items;
    }
  } catch(e){}

  var kontenItems = [];
  try {
    var rk = localStorage.getItem('sppt_konten_'+cid);
    if (rk) kontenItems = (JSON.parse(rk).items||[]);
  } catch(e){}

  var jadwalItems = [];
  try {
    var rj = localStorage.getItem('sppt_latihan_'+cid);
    if (rj) jadwalItems = (JSON.parse(rj).items||[]);
  } catch(e){}

  /* Pengumuman kilat: prioritas urgent > tugas > instruksi > info */
  var infoItems = (window.DB.notifications||[]).filter(function(n){
    return n.classId === cid;
  }).sort(function(a,b){
    var p = {urgent:4,tugas:3,instruksi:2,info:1};
    var pa = p[a.type]||0, pb = p[b.type]||0;
    if (pa !== pb) return pb-pa;
    return (b.createdAt||0)-(a.createdAt||0);
  }).slice(0, 15);

  var h = '';
  h += '<div class="dash-carousel-wrap" style="margin:16px 0;">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">';
  h += '<h3 style="font-size:14.5px;font-weight:800;display:flex;align-items:center;gap:8px;margin:0;">'+ic('layers')+' Master Timeline &amp; Pengumuman Produksi</h3>';
  h += '<div class="dash-carousel-tabs" style="display:flex;gap:4px;background:var(--surface);padding:4px;border-radius:10px;overflow-x:auto;">';
  h += '<button class="carousel-tab active" data-tab="0" style="background:var(--card);color:var(--primary);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('layers','sm')+' Master Timeline</button>';
  h += '<button class="carousel-tab" data-tab="1" style="background:none;color:var(--text-muted);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('bell','sm')+' Pengumuman</button>';
  h += '<button class="carousel-tab" data-tab="2" style="background:none;color:var(--text-muted);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('calendar','sm')+' Jadwal</button>';
  h += '<button class="carousel-tab" data-tab="3" style="background:none;color:var(--text-muted);border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">'+ic('image','sm')+' Konten</button>';
  h += '</div></div>';
  h += '<div class="carousel-track-schedule" id="fx-car-track" style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:0;border-radius:12px;touch-action:pan-x pan-y;">';

  /* Slide 0: MASTER TIMELINE */
  h += '<div class="carousel-slide" style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  h += '<div style="font-weight:800;font-size:13px;color:var(--primary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+ic('layers','sm')+' MASTER TIMELINE PRODUKSI</div>';
  if (!msItems.length){
    h += '<div class="empty-state">'+ic('layers',40)+'<p style="font-weight:700;">Master Timeline belum diisi</p><p style="font-size:11.5px;color:var(--text-muted);">Pimpinan Produksi / Sekretaris perlu isi Master Schedule dulu.</p></div>';
  } else {
    var bm = {};
    msItems.forEach(function(it){
      var key = it.monthKey || '2025-10';
      if (!bm[key]) bm[key] = [];
      bm[key].push(it);
    });
    var MN = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'Mei','06':'Jun','07':'Jul','08':'Agu','09':'Sep','10':'Okt','11':'Nov','12':'Des'};
    Object.keys(bm).sort().forEach(function(mk){
      var p = mk.split('-');
      var label = (MN[p[1]]||p[1]) + ' ' + p[0];
      h += '<div style="margin-bottom:12px;">';
      h += '<div style="font-weight:800;font-size:13px;color:var(--primary);margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+ic('calendar','sm')+' '+esc(label)+'</div>';
      bm[mk].sort(function(a,b){ return (a.weekNumber||0)-(b.weekNumber||0)||(a.day||0)-(b.day||0); }).forEach(function(it){
        h += '<div style="display:flex;gap:10px;padding:8px 10px;background:var(--surface);border-radius:8px;margin-bottom:5px;border-left:3px solid var(--primary);">';
        h += '<div style="flex:0 0 50px;text-align:center;font-size:11px;font-weight:700;color:var(--primary);">M'+(it.weekNumber||'?')+'/H'+(it.day||'?')+'</div>';
        h += '<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:12.5px;">'+esc(it.title)+'</div>';
        if (it.pic) h += '<div style="font-size:11px;color:var(--text-muted);">PIC: '+esc(it.pic)+'</div>';
        h += '</div></div>';
      });
      h += '</div>';
    });
  }
  h += '</div>';

  /* Slide 1: PENGUMUMAN */
  h += '<div class="carousel-slide" style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  h += '<div style="font-weight:800;font-size:13px;color:var(--primary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+ic('bell','sm')+' PENGUMUMAN KILAT</div>';
  if (!infoItems.length){
    h += '<div class="empty-state">'+ic('bell',40)+'<p>Belum ada pengumuman.</p></div>';
  } else {
    infoItems.forEach(function(n){
      var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'PENTING'}[n.type]||'Info';
      var tc = {tugas:'badge-info',instruksi:'badge-primary',info:'badge-success',urgent:'badge-danger'}[n.type]||'badge-gray';
      var bc = n.type==='urgent'?'var(--danger)':n.type==='tugas'?'var(--info)':'var(--primary)';
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid '+bc+';">';
      h += '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px;">';
      h += '<span class="badge '+tc+'" style="font-size:9.5px;">'+tl+'</span>';
      h += '<span style="font-size:10.5px;color:var(--text-muted);">'+fmtDate(n.createdAt)+'</span></div>';
      h += '<div style="font-weight:700;font-size:12.5px;">'+esc(n.title||'-')+'</div>';
      h += '<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Dari: '+esc(n.fromName||'-')+'</div>';
      if (n.message) h += '<div style="font-size:11.5px;margin-top:5px;white-space:pre-wrap;">'+esc(n.message)+'</div>';
      h += '</div>';
    });
  }
  h += '</div>';

  /* Slide 2: JADWAL */
  h += '<div class="carousel-slide" style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  h += '<div style="font-weight:800;font-size:13px;color:var(--primary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+ic('calendar','sm')+' JADWAL LATIHAN</div>';
  if (!jadwalItems.length) h += '<div class="empty-state">'+ic('calendar',40)+'<p>Belum ada jadwal latihan.</p></div>';
  else {
    jadwalItems.sort(function(a,b){ return String(a.date||'').localeCompare(String(b.date||'')); });
    jadwalItems.slice(0,6).forEach(function(it){
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--info);">';
      h += '<div style="font-weight:700;font-size:12.5px;">'+esc(it.title||'Latihan')+'</div>';
      h += '<div style="font-size:11px;color:var(--text-muted);margin-top:3px;">'+fmtDateShort(it.date)+(it.time?' · '+esc(it.time):'')+'</div></div>';
    });
  }
  h += '</div>';

  /* Slide 3: KONTEN */
  h += '<div class="carousel-slide" style="flex:0 0 100%;scroll-snap-align:start;min-width:100%;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-sizing:border-box;">';
  h += '<div style="font-weight:800;font-size:13px;color:var(--primary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+ic('image','sm')+' KALENDER KONTEN</div>';
  if (!kontenItems.length) h += '<div class="empty-state">'+ic('image',40)+'<p>Belum ada konten.</p></div>';
  else {
    kontenItems.sort(function(a,b){ return String(a.date||'').localeCompare(String(b.date||'')); });
    kontenItems.slice(0,6).forEach(function(it){
      h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--success);">';
      h += '<div style="font-weight:700;font-size:12.5px;">'+esc(it.title)+'</div>';
      h += '<div style="font-size:11px;color:var(--text-muted);">'+esc(it.platform||'-')+' · '+fmtDateShort(it.date)+'</div></div>';
    });
  }
  h += '</div>';

  h += '</div>';
  h += '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;">';
  for (var i=0;i<4;i++){
    h += '<button class="carousel-dot active" data-dot="'+i+'" style="width:8px;height:8px;border-radius:50%;background:'+(i===0?'var(--primary)':'var(--border-strong)')+';border:none;cursor:pointer;padding:0;"></button>';
  }
  h += '</div></div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = h;
  var el = wrap.firstElementChild;
  var ref = mc.querySelector('.extras-toolbar-top');
  if (ref && ref.parentNode) ref.parentNode.insertBefore(el, ref.nextSibling);
  else mc.insertBefore(el, mc.firstChild);

  setTimeout(__setupCarouselM6, 100);
  setTimeout(__setupCarouselM6, 500);
};

function __setupCarouselM6(){
  var track = document.getElementById('fx-car-track');
  if (!track) return;
  var tabs = document.querySelectorAll('.carousel-tab');
  var dots = document.querySelectorAll('.carousel-dot');
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

/* P.4 Hapus duplikat Lupa Password */
setTimeout(function(){
  ['form-login-guru','form-login-siswa'].forEach(function(fid){
    var f = document.getElementById(fid);
    if (!f) return;
    var divs = f.querySelectorAll('.divider-text');
    if (divs.length && /lupa password/i.test(divs[0].textContent)){
      divs[0].remove();
    }
  });
}, 300);

/* ============================================================
   Q. v6.0 — Foto profil, kunci peran
   ============================================================ */

/* Q.1 Foto profil siswa */
window.openUploadFotoProfil = function(){
  if (!isSiswa()){ alert('Hanya siswa'); return; }
  var me = window.currentUser || {};
  var current = me.foto || '';
  var h = '<div class="alert alert-info">'+ic('user')+
    '<div>Foto profil tampil di struktur Kerabat Kerja.<br>Maks <b>200 KB</b>, format JPG/PNG.</div></div>';
  if (current) h += '<div style="text-align:center;margin-bottom:14px;"><img src="'+esc(current)+'" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid var(--border);"></div>';
  h += '<div class="form-group"><label>Pilih Foto</label>'+
    '<input type="file" id="fx-foto-input" accept="image/*" style="padding:8px;width:100%;"></div>'+
    '<button class="btn btn-primary btn-block" data-fx="fxSaveFoto">'+ic('save')+' Simpan Foto</button>';
  if (current) h += '<button class="btn btn-sm btn-danger btn-block" style="margin-top:8px;" data-fx="fxHapusFoto">'+ic('trash')+' Hapus Foto</button>';
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
      alert('Foto profil tersimpan!');
      closeModal();
      if (typeof window.renderSiswaDash === 'function') window.renderSiswaDash();
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
    if (typeof window.renderSiswaDash === 'function') window.renderSiswaDash();
  });
};

/* Q.2 Kunci peran saat register — default pemain */
(function lockRole(){
  var orig = window.registerSiswa;
  if (typeof orig !== 'function') return;
  window.registerSiswa = function(){
    var el = document.getElementById('daftar-role');
    if (el && (!el.value || el.value.length === 0)){
      el.value = 'pemain';
    }
    return orig.apply(this, arguments);
  };
})();

/* Q.3 Quick action Foto Profil di toolbar */
(function injectFotoBtn(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      var tb = document.querySelector('.extras-toolbar-top');
      if (!tb || tb.querySelector('[data-fx-menu="openUploadFotoProfil"]')) return;
      var btn = document.createElement('button');
      btn.className = 'btn';
      btn.setAttribute('data-fx-menu', 'openUploadFotoProfil');
      btn.innerHTML = ic('user','sm') + ' Foto Profil';
      tb.appendChild(btn);
    }, 400);
    return ret;
  };
})();
/* ============================================================
   R. Tombol Status Firebase (guru/admin)
   ============================================================ */
(function injectStatusBtn(){
  var orig = window.openGuruMenu;
  if (typeof orig !== 'function') return;
  window.openGuruMenu = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      var modal = document.getElementById('modal-body');
      if (!modal) return;
      // Tambahkan section "Server" di menu guru
      var scroll = modal.querySelector('.fx-menu-scroll');
      if (!scroll) return;
      if (scroll.querySelector('[data-fx-menu="openStatusFirebase"]')) return;

      var newSection = document.createElement('div');
      newSection.innerHTML =
        '<div class="fx-menu-section">' + ic('layers','sm') + ' Server</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">' +
          '<button class="fx-mi-tile" data-fx-menu="openStatusFirebase">' +
            '<div class="fx-mi">' + ic('activity', 20) + '</div>' +
            '<div class="fx-ml">Status Server</div></button>' +
        '</div>';
      scroll.appendChild(newSection);
      if (window.hydrateIcons) window.hydrateIcons(newSection);
    }, 100);
    return ret;
  };
})();

/* Handler fungsi fxSync... dipanggil dari panel status */
if (typeof window.fxSyncPrimToBack === 'undefined'){
  // Placeholder kalau multifirebase tidak dimuat
  window.fxSyncPrimToBack = function(){ alert('Modul multi-Firebase belum dimuat'); };
  window.fxSyncBackToPrim = function(){ alert('Modul multi-Firebase belum dimuat'); };
  window.fxForceSwitchBackup = function(){ alert('Modul multi-Firebase belum dimuat'); };
  window.fxTryRecoverPrimary = function(){ alert('Modul multi-Firebase belum dimuat'); };
}

console.log('[features-fix] v6.1 FINAL loaded');
console.log('[features-fix] v6.0 FINAL loaded');
console.log('  → Foto profil siswa (max 200KB)');
console.log('  → Peran dikunci (default pemain)');
console.log('  → Master Timeline & Pengumuman Produksi');
console.log('  → Menu grid sederhana');
/* ============================================================
   R. v7.0 AUDIT FIX — Semua Bug + Fitur Merata
   ============================================================ */

/* ============================================================
   R.1 — SEED DEFAULT TEACHERS (Guru Bawaan)
   ============================================================ */
(function seedDefaultTeachers(){
  var DEFAULT_TEACHERS = [{
    name: 'Fikri Yassaar Arrazaq, S.Sn.',
    email: 'fikri.yassaar15@guru.smp.belajar.id',
    password: '#Smpn10smd',
    phone: ''
  }, {
    name: 'Admin Sistem',
    email: 'admin@sppt.local',
    password: '#Smpn10smd',
    phone: ''
  }];

  function ensureSeeded(){
    if (!window.fbReady || !window.fb) return;
    var list = window.DB.teachers || [];
    if (list.length === 0){
      console.log('[seed] Guru bawaan belum ada, seeding...');
      DEFAULT_TEACHERS.forEach(function(t){
        window.fbSet('teachers', t.email, t);
      });
      return;
    }
    // Cek spesifik guru utama ada
    var hasMain = list.some(function(t){
      return String(t.email||'').toLowerCase() === 'fikri.yassaar15@guru.smp.belajar.id';
    });
    if (!hasMain){
      console.log('[seed] Guru utama hilang, restore...');
      window.fbSet('teachers', DEFAULT_TEACHERS[0].email, DEFAULT_TEACHERS[0]);
    }
  }

  // Cek beberapa kali setelah Firebase ready
  setTimeout(ensureSeeded, 3000);
  setTimeout(ensureSeeded, 6000);
  setTimeout(ensureSeeded, 12000);
})();

/* ============================================================
   R.2 — ALIAS TAMBAH GURU
   ============================================================ */
if (typeof window.openTambahGuru !== 'function'){
  window.openTambahGuru = function(){
    if (typeof window.openAddTeacher === 'function') return window.openAddTeacher();
    if (typeof window.openAddTeacherModal === 'function') return window.openAddTeacherModal();
    alert('Fitur tambah guru belum siap');
  };
}
window.openTambahGuruDariAdmin = function(){
  openModal('Tambah Guru Baru',
    '<div class="alert alert-info">' + ic('info') + '<div>Isi data guru. Email harus unik.</div></div>' +
    '<div class="form-group"><label>Nama Lengkap</label><input id="fx-tg-name" placeholder="Nama Guru, S.Pd."></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="fx-tg-email" placeholder="nama@guru.smp.belajar.id"></div>' +
    '<div class="form-group"><label>No. WhatsApp</label><input type="tel" id="fx-tg-phone" placeholder="08123456789"></div>' +
    '<div class="form-group pw-toggle"><label>Password</label>' +
      '<input type="password" id="fx-tg-pw" value="#Smpn10smd">' +
      '<button class="toggle-btn" type="button" onclick="togglePw(\'fx-tg-pw\',this)">' +
      '<span data-ico="eye" data-size="16"></span></button></div>' +
    '<button class="btn btn-primary btn-block" data-fx="fxSimpanGuruBaru">' + ic('save') + ' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};
window.fxSimpanGuruBaru = function(){
  var n = (document.getElementById('fx-tg-name').value||'').trim();
  var e = (document.getElementById('fx-tg-email').value||'').trim().toLowerCase();
  var ph = (document.getElementById('fx-tg-phone').value||'').replace(/\D/g,'');
  var pw = (document.getElementById('fx-tg-pw').value||'').trim();
  if (!n || !e || !pw){ alert('Lengkapi nama, email, password'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email tidak valid'); return; }
  if (pw.length < 6){ alert('Password minimal 6'); return; }
  if ((window.DB.teachers||[]).some(function(t){
    return String(t.email||'').toLowerCase() === e;
  })){ alert('Email sudah terdaftar'); return; }
  window.fbSet('teachers', e, {name:n, email:e, phone:ph, password:pw}).then(function(){
    alert('Guru berhasil ditambahkan!');
    closeModal();
  }).catch(function(err){ alert('Gagal: ' + err.message); });
};

/* ============================================================
   R.3 — MENU ADMIN DIPERLUAS (Backup, Analitik, Rapor, Tambah Guru)
   ============================================================ */
window.openAdminMenu = function(){
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">' +
    ic('shield','lg') + '<div style="flex:1;"><b>' + esc(u().name||'') + '</b><br>' +
    '<small style="color:var(--text-muted);">Administrator</small></div></div>';

  function tile(items){
    var o = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    items.forEach(function(it){
      o += '<button class="fx-mi-tile" data-fx-menu="' + it.a + '">' +
        '<div class="fx-mi">' + ic(it.i, 20) + '</div>' +
        '<div class="fx-ml">' + esc(it.l) + '</div></button>';
    });
    return o + '</div>';
  }

  h += '<div class="fx-menu-section">' + ic('users','sm') + ' Manajemen</div>';
  h += tile([
    { i:'personPlus', l:'Tambah Guru',   a:'openTambahGuruDariAdmin' },
    { i:'users',      l:'Daftar Guru',   a:'openDaftarGuruAdmin' },
    { i:'school',     l:'Semua Kelas',   a:'openDaftarKelasAdmin' },
    { i:'activity',   l:'Log Aktivitas', a:'openActivityLog' }
  ]);

  h += '<div class="fx-menu-section">' + ic('chart','sm') + ' Analitik Global</div>';
  h += tile([
    { i:'chart',    l:'Statistik',  a:'openStatistikGlobal' },
    { i:'target',   l:'Analitik',   a:'openAnalitikGlobal' },
    { i:'fileText', l:'Rapor Semua',a:'openPrintRaporSemua' }
  ]);

  h += '<div class="fx-menu-section">' + ic('layers','sm') + ' Server & Data</div>';
  h += tile([
    { i:'activity', l:'Status Server', a:'openStatusFirebase' },
    { i:'download', l:'Backup',         a:'openBackupRestore' },
    { i:'upload',   l:'Restore',        a:'openBackupRestore' },
    { i:'refresh',  l:'Sync Backup',    a:'fxSyncPrimToBack' }
  ]);

  h += '<div class="fx-menu-section">' + ic('messageCircle','sm') + ' Komunikasi</div>';
  h += tile([
    { i:'messageCircle', l:'Log WA',   a:'openLogWA' },
    { i:'warning',       l:'Aduan',    a:'openAduanGuru' },
    { i:'bell',          l:'Pesan',    a:'openDashboardPesan' }
  ]);

  h += '<div class="fx-menu-section">' + ic('gear','sm') + ' Akun</div>';
  h += tile([
    { i:'key', l:'Password', a:'openChangePassword' },
    { i:'out', l:'Keluar',   a:'logout' }
  ]);

  h += '</div>';
  openModal('Menu Admin', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* Daftar Guru (Admin) */
window.openDaftarGuruAdmin = function(){
  var list = window.DB.teachers || [];
  var h = '<div class="alert alert-info">' + ic('users') +
    '<div><b>Daftar Guru</b> — ' + list.length + ' akun</div></div>';
  if (!list.length){
    h += '<div class="empty-state">' + ic('users',40) + '<p>Belum ada guru</p></div>';
  } else {
    list.forEach(function(t){
      h += '<div class="teacher-list-item">' +
        '<div class="info">' + ic('user','lg') + '<div>' +
          '<strong>' + esc(t.name||'-') + '</strong>' +
          '<small>' + esc(t.email||'-') + ' · ' + esc(t.phone||'tanpa WA') + '</small>' +
        '</div></div>' +
        '<div class="action-row">' +
          '<button class="btn btn-sm" data-fx="fxEditGuru" data-arg="' + esc(t.email) + '">' + ic('edit','sm') + '</button>' +
          '<button class="btn btn-sm btn-danger" data-fx="fxHapusGuru" data-arg="' + esc(t.email) + '">' + ic('trash','sm') + '</button>' +
        '</div></div>';
    });
  }
  openModal('Daftar Guru', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxEditGuru = function(email){
  var t = (window.DB.teachers||[]).find(function(x){
    return String(x.email||'').toLowerCase() === String(email).toLowerCase();
  });
  if (!t){ alert('Guru tidak ditemukan'); return; }
  openModal('Edit Guru',
    '<div class="form-group"><label>Nama</label><input id="fx-eg-name" value="' + esc(t.name||'') + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="fx-eg-email" value="' + esc(t.email||'') + '"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="fx-eg-phone" value="' + esc(t.phone||'') + '"></div>' +
    '<div class="form-group"><label>Password (kosongkan jika tidak diubah)</label>' +
      '<input type="text" id="fx-eg-pw" placeholder="Kosongkan jika tidak diubah"></div>' +
    '<button class="btn btn-primary btn-block" data-fx="fxUpdateGuru" data-arg="' + esc(email) + '">' + ic('save') + ' Simpan</button>');
};

window.fxUpdateGuru = function(oldEmail){
  var n = (document.getElementById('fx-eg-name').value||'').trim();
  var e = (document.getElementById('fx-eg-email').value||'').trim().toLowerCase();
  var ph = (document.getElementById('fx-eg-phone').value||'').replace(/\D/g,'');
  var pw = (document.getElementById('fx-eg-pw').value||'').trim();
  if (!n || !e){ alert('Nama & email wajib'); return; }
  var t = (window.DB.teachers||[]).find(function(x){
    return String(x.email||'').toLowerCase() === String(oldEmail).toLowerCase();
  });
  if (!t) return;
  var upd = Object.assign({}, t, {name:n, email:e, phone:ph});
  delete upd.id;
  if (pw) upd.password = pw;
  var chain = Promise.resolve();
  if (oldEmail.toLowerCase() !== e.toLowerCase()){
    chain = window.fbDel('teachers', oldEmail);
  }
  chain.then(function(){ return window.fbSet('teachers', e, upd); })
    .then(function(){ alert('Diperbarui!'); closeModal(); })
    .catch(function(err){ alert('Gagal: ' + err.message); });
};

window.fxHapusGuru = function(email){
  if (!confirm('Hapus guru ' + email + '?')) return;
  window.fbDel('teachers', email).then(function(){
    alert('Guru dihapus');
    closeModal();
    setTimeout(window.openDaftarGuruAdmin, 200);
  });
};

/* Daftar Kelas (Admin) */
window.openDaftarKelasAdmin = function(){
  var list = window.DB.classes || [];
  var h = '<div class="alert alert-info">' + ic('school') +
    '<div><b>Semua Kelas</b> — ' + list.length + ' kelas</div></div>';
  if (!list.length){
    h += '<div class="empty-state">' + ic('school',40) + '<p>Belum ada kelas</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr>' +
      '<th>Kelas</th><th>Kode</th><th>Guru</th><th>Siswa</th><th></th>' +
      '</tr></thead><tbody>';
    list.forEach(function(c){
      h += '<tr>' +
        '<td><b>' + esc(c.name) + '</b></td>' +
        '<td><code>' + esc(c.code||'-') + '</code></td>' +
        '<td style="font-size:11.5px;">' + esc(c.teacherEmail||'-') + '</td>' +
        '<td>' + ((c.students||[]).length) + '</td>' +
        '<td><button class="btn btn-sm" data-fx="fxLihatKelasAdmin" data-arg="' + c.id + '">' + ic('eye','sm') + '</button></td>' +
        '</tr>';
    });
    h += '</tbody></table></div>';
  }
  openModal('Semua Kelas', h);
};

window.fxLihatKelasAdmin = function(cid){
  var c = (window.DB.classes||[]).find(function(x){ return x.id === cid; });
  if (!c) return;
  window.__currentViewClassId = cid;
  if (typeof window.viewClass === 'function') return window.viewClass(cid);
  alert('Detail kelas ' + c.name);
};

/* Statistik Global */
window.openStatistikGlobal = function(){
  var classes = window.DB.classes || [];
  var teachers = window.DB.teachers || [];
  var totalStudents = 0;
  classes.forEach(function(c){ totalStudents += (c.students||[]).length; });
  var notifs = (window.DB.notifications||[]).length;

  var h = '<div class="alert alert-info">' + ic('chart') + '<div><b>Statistik Global</b></div></div>';
  h += '<div class="grid">' +
    '<div class="card" style="border-left:4px solid var(--primary);"><div style="font-size:11.5px;">Total Kelas</div><div style="font-size:24px;font-weight:800;color:var(--primary);">' + classes.length + '</div></div>' +
    '<div class="card" style="border-left:4px solid var(--success);"><div style="font-size:11.5px;">Total Siswa</div><div style="font-size:24px;font-weight:800;color:var(--success);">' + totalStudents + '</div></div>' +
    '<div class="card" style="border-left:4px solid var(--info);"><div style="font-size:11.5px;">Total Guru</div><div style="font-size:24px;font-weight:800;color:var(--info);">' + teachers.length + '</div></div>' +
    '<div class="card" style="border-left:4px solid var(--warning);"><div style="font-size:11.5px;">Notifikasi</div><div style="font-size:24px;font-weight:800;color:var(--warning);">' + notifs + '</div></div>' +
    '</div>';
  openModal('Statistik Global', h);
};

window.openAnalitikGlobal = function(){
  alert('Pilih kelas spesifik dari "Semua Kelas" untuk melihat analitik detail.');
  closeModal();
  setTimeout(window.openDaftarKelasAdmin, 200);
};

window.openPrintRaporSemua = function(){
  alert('Pilih kelas spesifik dari "Semua Kelas" untuk print rapor.');
  closeModal();
  setTimeout(window.openDaftarKelasAdmin, 200);
};

/* ============================================================
   R.4 — FIX MATRIKS EVALUATOR (Siapa menilai siapa)
   ============================================================ */
window.canRoleEvaluate = function(evalRole, targetRole){
  if (evalRole === 'guru' || evalRole === 'admin') return true;

  // Pimpinan Produksi dinilai SEMUA kecuali dirinya sendiri
  if (targetRole === 'pimpinan_produksi') return true;

  // Sutradara dinilai oleh pimpro, astrada, koordinator artistik, pemain, guru
  if (targetRole === 'sutradara'){
    return ['pimpinan_produksi','asisten_sutradara','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','pemain'].indexOf(evalRole) >= 0;
  }

  // Asisten sutradara dinilai oleh sutradara & pimpro
  if (targetRole === 'asisten_sutradara'){
    return ['sutradara','pimpinan_produksi'].indexOf(evalRole) >= 0;
  }

  // Sekretaris & Bendahara dinilai oleh pimpro
  if (targetRole === 'sekretaris' || targetRole === 'bendahara'){
    return evalRole === 'pimpinan_produksi';
  }

  // Koor dinilai oleh pimpro, sutradara, astrada, dan anggotanya
  if (targetRole.indexOf('koor_') === 0){
    var base = targetRole.substring(5);
    return ['pimpinan_produksi','sutradara','asisten_sutradara','anggota_' + base].indexOf(evalRole) >= 0;
  }

  // Anggota dinilai oleh koor pasangannya, sesama anggota, astrada
  if (targetRole.indexOf('anggota_') === 0){
    var base2 = targetRole.substring(8);
    return ['koor_' + base2, 'anggota_' + base2, 'asisten_sutradara'].indexOf(evalRole) >= 0;
  }

  // Pemain dinilai oleh sutradara, astrada, pimpro, sesama pemain
  if (targetRole === 'pemain'){
    return ['sutradara','asisten_sutradara','pimpinan_produksi','pemain'].indexOf(evalRole) >= 0;
  }

  return false;
};

window.canGuruEvaluate = function(targetRole){
  return targetRole === 'pimpinan_produksi' || targetRole === 'sutradara';
};

/* ============================================================
   R.5 — BERI TUGAS CEPAT (Deadline Sederhana)
   ============================================================ */
window.openBeriTugasCepat = function(){
  var cid = uCid(); if (!cid) return;
  var c = findClass(cid); if (!c) return;
  var role = uRole();
  var canSend = isGuru() || ['pimpinan_produksi','sutradara','asisten_sutradara'].indexOf(role) >= 0 || role.indexOf('koor_') === 0;
  if (!canSend){ alert('Tidak punya akses'); return; }

  var students = (c.students||[]).filter(function(s){
    if (s.id === uSid()) return false;
    if (isGuru() || role === 'pimpinan_produksi' || role === 'sutradara') return true;
    var peers = window.getRolePeerRoles ? window.getRolePeerRoles(role) : [role];
    return peers.indexOf(s.role) >= 0;
  });
  if (!students.length){ alert('Tidak ada penerima'); return; }

  var h = '';
  h += '<div class="alert alert-info">' + ic('send') +
    '<div><b>Kirim Tugas</b><br>Isi 1 formulir, langsung kirim ke semua penerima.</div></div>';

  h += '<div class="form-group"><label>Judul</label>' +
    '<input id="fx-bt-title" maxlength="80" placeholder="Contoh: Setor hafalan adegan 1"></div>';
  h += '<div class="form-group"><label>Deskripsi (opsional)</label>' +
    '<textarea id="fx-bt-desc" rows="2" maxlength="300"></textarea></div>';
  h += '<div class="form-group"><label>Deadline (opsional)</label>' +
    '<input type="date" id="fx-bt-deadline" value="' + new Date(Date.now() + 7*86400000).toISOString().split('T')[0] + '"></div>';
  h += '<div class="form-group"><label>Jam Deadline</label>' +
    '<input type="time" id="fx-bt-time" value="23:59"></div>';

  h += '<div class="form-group"><label>Penerima</label>' +
    '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">' +
    '<button class="btn btn-sm" data-fx="fxBtSelectAll">Pilih Semua</button>' +
    '<button class="btn btn-sm" data-fx="fxBtSelectNone">Kosongkan</button>' +
    '</div>' +
    '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px;background:var(--surface);">';
  students.forEach(function(s){
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="fx-bt-cb" value="' + s.id + '" checked>' +
      '<span style="flex:1;font-weight:600;">' + esc(s.name) + '</span>' +
      '<span style="font-size:10.5px;color:var(--text-muted);">' + esc(roleLabel(s.role)) + '</span>' +
      '</label>';
  });
  h += '</div></div>';

  h += '<button class="btn btn-primary btn-block btn-lg" data-fx="fxKirimTugasCepat" data-arg="' + cid + '">' +
    ic('send') + ' Kirim Tugas</button>';

  openModal('Kirim Tugas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxBtSelectAll = function(){
  document.querySelectorAll('.fx-bt-cb').forEach(function(cb){ cb.checked = true; });
};
window.fxBtSelectNone = function(){
  document.querySelectorAll('.fx-bt-cb').forEach(function(cb){ cb.checked = false; });
};

window.fxKirimTugasCepat = function(cid){
  var title = (document.getElementById('fx-bt-title').value||'').trim();
  var desc = (document.getElementById('fx-bt-desc').value||'').trim();
  var dl = document.getElementById('fx-bt-deadline').value;
  var tm = document.getElementById('fx-bt-time').value || '23:59';
  if (!title){ alert('Judul wajib diisi'); return; }

  var targets = [];
  document.querySelectorAll('.fx-bt-cb:checked').forEach(function(cb){
    targets.push(cb.value);
  });
  if (!targets.length){ alert('Pilih minimal 1 penerima'); return; }

  var me = window.currentUser || {};
  var deadlineStr = dl ? (fmtDateShort(dl) + ' ' + tm) : 'tanpa deadline';
  var msg = desc + (dl ? '\n\n⏰ Deadline: ' + deadlineStr : '');

  var promises = targets.map(function(tid){
    var nid = uid();
    return window.fbSet('notifications', nid, {
      id: nid, classId: cid,
      fromId: me.studentId || me.email || 'guru',
      fromName: me.name || 'Guru',
      fromType: uType(), fromRole: uRole(),
      toId: tid, type: 'tugas',
      title: '[TUGAS] ' + title,
      message: msg,
      deadline: dl ? (dl + 'T' + tm + ':00') : null,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
  });

  Promise.all(promises).then(function(){
    logAct('task_create', me.name + ' kirim tugas "' + title + '" ke ' + targets.length + ' siswa', {classId: cid});
    alert('Tugas terkirim ke ' + targets.length + ' siswa!');
    closeModal();
  }).catch(function(err){
    alert('Gagal: ' + err.message);
  });
};

/* ============================================================
   R.6 — FIX NOTIFIKASI DEADLINE TIDAK MASUK
   Override getNotifs agar filter toId lebih permisif
   ============================================================ */
(function fixGetNotifs(){
  window.getNotifs = function(){
    if (!window.currentUser) return [];
    var u = window.currentUser;
    if (u.type === 'siswa'){
      return (window.DB.notifications||[]).filter(function(n){
        if (n.classId !== u.classId) return false;
        if (n.toId === 'all' || n.toId === 'some') return true;
        if (n.toId === u.studentId) return true;
        if (n.recipientIds && n.recipientIds.indexOf(u.studentId) >= 0) return true;
        // Fallback: kalau fromType bukan siswa & tidak ada toId spesifik → tampilkan
        if (!n.toId && n.fromType !== 'siswa') return true;
        return false;
      });
    }
    if (u.type === 'guru'){
      var ids = (window.myClasses ? window.myClasses() : []).map(function(c){ return c.id; });
      return (window.DB.notifications||[]).filter(function(n){
        if (!n.classId) return true;
        return ids.indexOf(n.classId) >= 0;
      });
    }
    return (window.DB.notifications||[]).slice();
  };
})();

/* ============================================================
   R.7 — FORCE RE-INJECT CAROUSEL (Setelah refresh/login)
   ============================================================ */
function forceInjectCarousel(){
  if (!window.currentUser) return;
  if (typeof window.injectSlideTimelines === 'function'){
    try { window.injectSlideTimelines(); } catch(e){}
  }
  // Fallback: kalau masih kosong, retry
  setTimeout(function(){
    var mc = document.getElementById('main-content');
    if (mc && !mc.querySelector('.dash-carousel-wrap') && typeof window.injectSlideTimelines === 'function'){
      try { window.injectSlideTimelines(); } catch(e){}
    }
  }, 1500);
}

// Hook ke showApp & login
(function hookCarousel(){
  var orig = window.showApp;
  if (typeof orig === 'function'){
    window.showApp = function(){
      var ret = orig.apply(this, arguments);
      setTimeout(forceInjectCarousel, 800);
      setTimeout(forceInjectCarousel, 2000);
      setTimeout(forceInjectCarousel, 4000);
      return ret;
    };
  }
  var origSiswa = window.renderSiswaDash;
  if (typeof origSiswa === 'function'){
    window.renderSiswaDash = function(){
      var ret = origSiswa.apply(this, arguments);
      setTimeout(forceInjectCarousel, 400);
      setTimeout(forceInjectCarousel, 1200);
      return ret;
    };
  }
})();

// Trigger saat page load selesai
window.addEventListener('load', function(){
  setTimeout(forceInjectCarousel, 3000);
});

/* ============================================================
   R.8 — KAS KELAS DENGAN NAMA TIM
   Format: { active, nama, nominal, periode, tim: {siswaId: namaTim} }
   ============================================================ */
window.openKasKelas = function(){
  var cid = uCid(); if (!cid) return;
  var canEdit = uRole()==='bendahara' || isGuru();
  var data = getKas(cid);
  var c = findClass(cid); if (!c) return;
  var students = c.students || [];

  var h = '<div class="alert alert-info">' + ic('briefcase') +
    '<div><b>Kas Kelas</b> — Atur kas per tim/personal</div></div>';

  if (!data.active){
    h += '<div class="card" style="border-left:4px solid var(--warning);">' +
      '<h3>' + ic('warning') + ' Kas Belum Aktif</h3>' +
      '<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:12px;">' +
      'Kas harus diaktifkan dulu sebelum bisa mencatat pembayaran.</p>';
    if (canEdit){
      h += '<div class="form-group"><label>Nama Kas</label>' +
        '<input id="fx-kas-nama" value="' + esc(data.nama||'') + '" placeholder="Contoh: Kas Produksi"></div>';
      h += '<div class="form-group"><label>Nominal per Bayar (Rp)</label>' +
        '<input type="number" id="fx-kas-nominal" min="0" value="' + (data.nominal||'') + '" placeholder="10000"></div>';
      h += '<div class="form-group"><label>Periode</label>' +
        '<select id="fx-kas-periode">' +
        '<option value="daily"' + (data.periode==='daily'?' selected':'') + '>Harian</option>' +
        '<option value="weekly"' + (!data.periode||data.periode==='weekly'?' selected':'') + '>Mingguan</option>' +
        '<option value="monthly"' + (data.periode==='monthly'?' selected':'') + '>Bulanan</option>' +
        '</select></div>';
      h += '<div class="form-group"><label>Mulai Tanggal</label>' +
        '<input type="date" id="fx-kas-mulai" value="' + (data.mulai || new Date().toISOString().split('T')[0]) + '"></div>';
      h += '<button class="btn btn-success btn-block btn-lg" data-fx="fxAktifkanKas" data-arg="' + cid + '">' +
        ic('check') + ' Aktifkan Kas</button>';
    } else {
      h += '<div style="font-size:12.5px;color:var(--text-muted);">Hanya Bendahara yang bisa mengaktifkan.</div>';
    }
    h += '</div>';
    openModal('Kas Kelas', h);
    return;
  }

  /* Kas aktif → tampilkan tabel per siswa dengan kolom Nama Tim */
  var total = 0, totalPaid = 0;
  var rows = students.map(function(s){
    var tim = (data.tim && data.tim[s.id]) || '';
    var pays = (data.payments && data.payments[s.id]) || [];
    var isPaid = pays.length > 0;
    var totalPaidUser = 0;
    pays.forEach(function(p){ totalPaidUser += p.nominal || data.nominal; });
    total++;
    if (isPaid) totalPaid++;
    return {s:s, tim:tim, isPaid:isPaid, total:totalPaidUser, pays:pays};
  });
  var pct = total ? Math.round(totalPaid/total*100) : 0;
  var totalKumpul = rows.reduce(function(a,r){ return a + r.total; }, 0);

  h += '<div class="progress-banner">' +
    '<h3>' + esc(data.nama) + '</h3>' +
    '<div style="font-size:14px;">Rp ' + data.nominal.toLocaleString('id-ID') + ' / ' + periodeLabel(data.periode) + '</div>' +
    '<div class="big-count" style="font-size:22px;">' + totalPaid + ' / ' + total + ' <span>sudah bayar</span></div>' +
    '<div class="pct">Total terkumpul: <b>Rp ' + totalKumpul.toLocaleString('id-ID') + '</b></div>' +
    '<div class="progress-container"><div class="progress-bar ' + (pct===100?'complete':'partial') + '" style="width:' + pct + '%"></div></div>' +
    '</div>';

  if (canEdit){
    h += '<div class="action-row" style="margin-bottom:12px;flex-wrap:wrap;">' +
      '<button class="btn btn-sm" data-fx="fxTambahKas" data-arg="' + cid + '">' + ic('plus','sm') + ' Catat Bayar</button>' +
      '<button class="btn btn-sm btn-danger" data-fx="fxDeactivateKas" data-arg="' + cid + '">' + ic('x','sm') + ' Nonaktifkan</button>' +
      '</div>';
  }

  /* Tabel */
  h += '<div class="table-wrap"><table><thead><tr>' +
    '<th>No</th><th>Nama</th><th>Tim</th><th>Status</th><th>Total</th>' +
    (canEdit?'<th></th>':'') +
    '</tr></thead><tbody>';
  rows.forEach(function(r, i){
    h += '<tr>' +
      '<td>' + (i+1) + '</td>' +
      '<td><b>' + esc(r.s.name) + '</b><br><small style="color:var(--text-muted);font-size:10px;">' + esc(roleLabel(r.s.role)) + '</small></td>' +
      '<td>' +
        (canEdit ? '<input class="fx-kas-tim" data-sid="' + r.s.id + '" value="' + esc(r.tim) + '" placeholder="(nama tim)" style="width:90px;padding:3px 5px;font-size:11px;border:1px solid var(--border);border-radius:4px;background:var(--card);">'
                 : (r.tim || '-')) +
      '</td>' +
      '<td>' + (r.isPaid ? '<span class="badge badge-success">Lunas</span>' : '<span class="badge badge-warning">Belum</span>') + '</td>' +
      '<td>Rp ' + r.total.toLocaleString('id-ID') + '</td>' +
      (canEdit?'<td>' +
        (r.isPaid ? '<button class="btn btn-sm btn-danger" data-fx="fxKasUnpaid" data-arg="' + cid + '|' + r.s.id + '">' + ic('x','sm') + '</button>'
                  : '<button class="btn btn-sm btn-success" data-fx="fxKasPaid" data-arg="' + cid + '|' + r.s.id + '">' + ic('check','sm') + '</button>') +
        '</td>':'') +
      '</tr>';
  });
  h += '</tbody></table></div>';

  if (canEdit){
    h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" data-fx="fxSaveKasTim" data-arg="' + cid + '">' +
      ic('save') + ' Simpan Nama Tim</button>';
  }

  openModal('Kas Kelas', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.fxAktifkanKas = function(cid){
  var nama = (document.getElementById('fx-kas-nama').value||'').trim();
  var nominal = parseFloat(document.getElementById('fx-kas-nominal').value)||0;
  var periode = document.getElementById('fx-kas-periode').value;
  var mulai = document.getElementById('fx-kas-mulai').value;
  if (!nama){ alert('Nama kas wajib'); return; }
  if (nominal <= 0){ alert('Nominal harus > 0'); return; }
  var data = getKas(cid);
  data.active = true; data.nama = nama;
  data.nominal = nominal; data.periode = periode; data.mulai = mulai;
  if (!data.payments) data.payments = {};
  if (!data.tim) data.tim = {};
  setKas(cid, data);
  alert('Kas berhasil diaktifkan!');
  window.openKasKelas();
};

window.fxSaveKasTim = function(cid){
  var data = getKas(cid);
  if (!data.tim) data.tim = {};
  document.querySelectorAll('.fx-kas-tim').forEach(function(inp){
    var sid = inp.getAttribute('data-sid');
    var val = (inp.value||'').trim();
    if (val) data.tim[sid] = val;
    else delete data.tim[sid];
  });
  setKas(cid, data);
  alert('Nama tim tersimpan!');
  window.openKasKelas();
};

window.fxKasPaid = function(arg){
  var p = String(arg).split('|'), cid = p[0], sid = p[1];
  var data = getKas(cid);
  if (!data.payments) data.payments = {};
  if (!data.payments[sid]) data.payments[sid] = [];
  data.payments[sid].push({
    tanggal: new Date().toISOString().split('T')[0],
    nominal: data.nominal,
    by: u().name
  });
  setKas(cid, data);
  window.openKasKelas();
};

window.fxKasUnpaid = function(arg){
  var p = String(arg).split('|'), cid = p[0], sid = p[1];
  if (!confirm('Hapus pembayaran terakhir?')) return;
  var data = getKas(cid);
  if (data.payments && data.payments[sid] && data.payments[sid].length){
    data.payments[sid].pop();
  }
  setKas(cid, data);
  window.openKasKelas();
};

window.fxTambahKas = function(cid){
  alert('Klik tombol ✓ hijau di kolom Aksi untuk mencatat pembayaran.');
};

/* ============================================================
   R.9 — UPLOAD NOTA & GAMBAR BENDAHARA (GDrive alias)
   ============================================================ */
(function ensureGDrive(){
  if (typeof window.openGDriveKeuangan !== 'function'){
    window.openGDriveKeuangan = function(cid){
      cid = cid || uCid();
      var h = '<div class="alert alert-info">' + ic('folder') +
        '<div><b>Arsip Nota & Foto Pembelian</b><br>Simpan link Google Drive folder Anda.</div></div>';
      h += '<div class="form-group"><label>Link Folder Google Drive</label>' +
        '<input type="url" id="fx-gd-url" placeholder="https://drive.google.com/drive/folders/..." ' +
        'value="' + esc(localStorage.getItem('sppt_gd_keuangan_' + cid) || '') + '"></div>';
      h += '<div class="form-group"><label>Nama Folder</label>' +
        '<input id="fx-gd-name" placeholder="Contoh: NOTA_BARANG_IXD"></div>';
      h += '<div class="form-group"><label>Catatan</label>' +
        '<textarea id="fx-gd-note" rows="2" placeholder="Deskripsi isi folder"></textarea></div>';
      h += '<div class="alert alert-warning" style="font-size:12px;">' +
        ic('warning','sm') + '<div>Pastikan folder diset <b>"Siapa saja yang memiliki link"</b>.</div></div>';
      h += '<button class="btn btn-primary btn-block" data-fx="fxSimpanGDriveKeuangan" data-arg="' + cid + '">' +
        ic('save') + ' Simpan Link</button>';
      if (localStorage.getItem('sppt_gd_keuangan_' + cid)){
        h += '<a href="' + esc(localStorage.getItem('sppt_gd_keuangan_' + cid)) + '" target="_blank" ' +
          'class="btn btn-success btn-block" style="margin-top:8px;text-decoration:none;">' +
          ic('folder') + ' Buka Folder Drive</a>';
      }
      openModal('Arsip Nota & Foto', h);
      if (window.hydrateIcons) window.hydrateIcons();
    };
  }
  if (typeof window.fxSimpanGDriveKeuangan !== 'function'){
    window.fxSimpanGDriveKeuangan = function(cid){
      var url = (document.getElementById('fx-gd-url').value||'').trim();
      if (!/^https?:\/\/(drive|docs)\.google\.com\//i.test(url)){
        alert('Link harus dari Google Drive');
        return;
      }
      var name = (document.getElementById('fx-gd-name').value||'').trim();
      var note = (document.getElementById('fx-gd-note').value||'').trim();
      try {
        localStorage.setItem('sppt_gd_keuangan_' + cid, url);
        localStorage.setItem('sppt_gd_keuangan_name_' + cid, name);
        localStorage.setItem('sppt_gd_keuangan_note_' + cid, note);
      } catch(e){}
      window.fbSet('gdrive_links', 'keuangan_' + cid, {
        type: 'keuangan', classId: cid,
        url: url, folderName: name, note: note,
        studentName: u().name, studentRole: uRole(),
        updatedAt: Date.now()
      });
      alert('Link tersimpan!');
      closeModal();
    };
  }
  if (typeof window.openGDriveDokpub !== 'function'){
    window.openGDriveDokpub = function(cid){
      cid = cid || uCid();
      var h = '<div class="alert alert-info">' + ic('folder') +
        '<div><b>Galeri Dokumentasi</b><br>Simpan link Google Drive folder Anda.</div></div>';
      h += '<div class="form-group"><label>Link Folder Google Drive</label>' +
        '<input type="url" id="fx-gd-url" placeholder="https://drive.google.com/drive/folders/..." ' +
        'value="' + esc(localStorage.getItem('sppt_gd_dokpub_' + cid) || '') + '"></div>';
      h += '<div class="form-group"><label>Nama Folder</label>' +
        '<input id="fx-gd-name" placeholder="Contoh: DOKPUB_IXD"></div>';
      h += '<button class="btn btn-primary btn-block" data-fx="fxSimpanGDriveDokpub" data-arg="' + cid + '">' +
        ic('save') + ' Simpan Link</button>';
      if (localStorage.getItem('sppt_gd_dokpub_' + cid)){
        h += '<a href="' + esc(localStorage.getItem('sppt_gd_dokpub_' + cid)) + '" target="_blank" ' +
          'class="btn btn-success btn-block" style="margin-top:8px;text-decoration:none;">' +
          ic('folder') + ' Buka Folder Drive</a>';
      }
      openModal('Galeri Dokumentasi', h);
      if (window.hydrateIcons) window.hydrateIcons();
    };
  }
  if (typeof window.fxSimpanGDriveDokpub !== 'function'){
    window.fxSimpanGDriveDokpub = function(cid){
      var url = (document.getElementById('fx-gd-url').value||'').trim();
      if (!/^https?:\/\/(drive|docs)\.google\.com\//i.test(url)){ alert('Link tidak valid'); return; }
      var name = (document.getElementById('fx-gd-name').value||'').trim();
      try { localStorage.setItem('sppt_gd_dokpub_' + cid, url); } catch(e){}
      window.fbSet('gdrive_links', 'dokpub_' + cid, {
        type: 'dokpub', classId: cid,
        url: url, folderName: name,
        studentName: u().name, studentRole: uRole(),
        updatedAt: Date.now()
      });
      alert('Link tersimpan!');
      closeModal();
    };
  }
})();

/* ============================================================
   R.10 — MENU SISWA (Fitur Merata)
   ============================================================ */
window.openSiswaMenu = function(){
  var role = uRole();
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">' +
    ic('user','lg') + '<div style="flex:1;"><b>' + esc(u().name||'') + '</b><br>' +
    '<small style="color:var(--text-muted);">' + esc(roleLabel(role)) + '</small></div></div>';

  function tile(items){
    var o = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    items.forEach(function(it){
      o += '<button class="fx-mi-tile" data-fx-menu="' + it.a + '">' +
        '<div class="fx-mi">' + ic(it.i, 20) + '</div>' +
        '<div class="fx-ml">' + esc(it.l) + '</div></button>';
    });
    return o + '</div>';
  }

  h += '<div class="fx-menu-section">' + ic('clipboard','sm') + ' Tugas & Nilai</div>';
  h += tile([
    { i:'clipboard',   l:'Tugas',      a:'openTugasSaya' },
    { i:'checkSquare', l:'Checklist',  a:'openChecklistPribadi' },
    { i:'edit',        l:'Beri Nilai', a:'openPenilaianSiswaDashboard' },
    { i:'target',      l:'Rubrik',     a:'openRubrikPenilaian' },
    { i:'clock',       l:'Deadline',   a:'openDeadlineList' },
    { i:'users',       l:'Tim',        a:'openChecklistTim' }
  ]);

  h += '<div class="fx-menu-section">' + ic('users','sm') + ' Struktur</div>';
  h += tile([
    { i:'award',    l:'Kerabat',  a:'openStrukturKerabatKerja' },
    { i:'chart',    l:'Progres',  a:'openDivisionProgressSelf' },
    { i:'activity', l:'Aktivitas',a:'openActivityFeedModal' }
  ]);

  h += '<div class="fx-menu-section">' + ic('calendar','sm') + ' Jadwal</div>';
  var jItems = [
    { i:'calendar', l:'Absensi',  a:'openMeetingList' },
    { i:'clock',    l:'Latihan',  a:'openJadwalLatihan' },
    { i:'image',    l:'Konten',   a:'openKalenderKonten' }
  ];
  h += tile(jItems);

  h += '<div class="fx-menu-section">' + ic('folder','sm') + ' Dokumen</div>';
  h += tile([
    { i:'fileText', l:'Dokumen', a:'openDokumenSaya' },
    { i:'book',     l:'Naskah',  a:'openNaskahList' },
    { i:'user',     l:'Foto',    a:'openUploadFotoProfil' }
  ]);

  /* Khusus peran */
  var kItems = [];
  if (['pimpinan_produksi','sutradara','koor_musik','koor_perlengkapan'].indexOf(role) >= 0)
    kItems.push({ i:'briefcase', l:'Booking', a:'openBookingAlat' });
  if (['koor_perlengkapan','anggota_perlengkapan'].indexOf(role) >= 0)
    kItems.push({ i:'briefcase', l:'Peminjaman', a:'openPeminjamanBarang' });
  if (role === 'bendahara'){
    kItems.push({ i:'chart',     l:'Keuangan',  a:'openKeuangan' });
    kItems.push({ i:'briefcase', l:'Kas',       a:'openKasKelas' });
    kItems.push({ i:'folder',    l:'Nota',      a:'openGDriveKeuangan' });
  }
  if (['pimpinan_produksi','sekretaris','sutradara'].indexOf(role) >= 0){
    kItems.push({ i:'layers', l:'Tahapan', a:'openSistemTahapan' });
    kItems.push({ i:'send',   l:'Beri Tugas', a:'openBeriTugasCepat' });
  }
  if (role === 'asisten_sutradara'){
    kItems.push({ i:'send', l:'Beri Tugas', a:'openBeriTugasCepat' });
  }
  if (role.indexOf('koor_') === 0){
    kItems.push({ i:'send', l:'Beri Tugas', a:'openBeriTugasCepat' });
  }
  if (kItems.length){
    h += '<div class="fx-menu-section">' + ic('star','sm') + ' Khusus ' + esc(roleLabel(role)) + '</div>';
    h += tile(kItems);
  }

  h += '<div class="fx-menu-section">' + ic('gear','sm') + ' Lainnya</div>';
  h += tile([
    { i:'warning',       l:'Aduan',   a:'openAduanSiswa' },
    { i:'messageCircle', l:'Koordinasi', a:'openKoordinasiAntarKelas' },
    { i:'key',           l:'Password',a:'openChangePassword' },
    { i:'out',           l:'Keluar',  a:'logout' }
  ]);

  h += '</div>';
  openModal('Menu', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   R.11 — MENU GURU (Bersih, tanpa Backup)
   ============================================================ */
window.openGuruMenu = function(){
  var h = '<div class="fx-menu-scroll">';
  h += '<div class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">' +
    ic('user','lg') + '<div style="flex:1;"><b>' + esc(u().name||'') + '</b><br>' +
    '<small style="color:var(--text-muted);">Guru Pengampu</small></div></div>';

  function tile(items){
    var o = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    items.forEach(function(it){
      o += '<button class="fx-mi-tile" data-fx-menu="' + it.a + '">' +
        '<div class="fx-mi">' + ic(it.i, 20) + '</div>' +
        '<div class="fx-ml">' + esc(it.l) + '</div></button>';
    });
    return o + '</div>';
  }

  h += '<div class="fx-menu-section">' + ic('chart','sm') + ' Kelas Saya</div>';
  h += tile([
    { i:'school',   l:'Kelola Kelas',  a:'openDaftarKelasGuru' },
    { i:'clipboard',l:'Beri Tugas',    a:'openBeriTugasCepat' },
    { i:'edit',     l:'Penilaian',     a:'openPenilaianGuruDashboard' },
    { i:'chart',    l:'Rekap Nilai',   a:'openRekapNilai' }
  ]);

  h += '<div class="fx-menu-section">' + ic('messageCircle','sm') + ' Komunikasi</div>';
  h += tile([
    { i:'warning',       l:'Aduan',     a:'openAduanGuru' },
    { i:'messageCircle', l:'Log WA',    a:'openLogWA' },
    { i:'bell',          l:'Pesan',     a:'openDashboardPesan' },
    { i:'activity',      l:'Aktivitas', a:'openActivityLog' }
  ]);

  h += '<div class="fx-menu-section">' + ic('gear','sm') + ' Akun</div>';
  h += tile([
    { i:'user', l:'Profil',   a:'openGuruProfile' },
    { i:'key',  l:'Password', a:'openChangePassword' },
    { i:'out',  l:'Keluar',   a:'logout' }
  ]);

  h += '</div>';
  openModal('Menu Guru', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openDaftarKelasGuru = function(){
  if (typeof window.renderGuruDash === 'function') window.renderGuruDash();
  closeModal();
};

console.log('[features-fix] v7.0 AUDIT loaded');
console.log('  → Seed guru bawaan');
console.log('  → Menu admin: Backup, Tambah Guru, Statistik');
console.log('  → Menu guru: bersih (tanpa Backup)');
console.log('  → Matriks penilaian diperbaiki');
console.log('  → Deadline cepat (1 form)');
console.log('  → Notif deadline fix');
console.log('  → Kas dengan nama tim');
console.log('  → GDrive nota & galeri bendahara');
console.log('  → Carousel auto-inject ulang');
})();
