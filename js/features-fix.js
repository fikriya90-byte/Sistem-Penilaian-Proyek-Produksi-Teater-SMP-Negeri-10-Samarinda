/* ============================================================
   SP-PPT features-fix.js — v10.0 FINAL (TIDAK MENYEMBUNYIKAN TOOLBAR)
   - Alias fungsi hilang
   - Fix tandaiTugasSelesai
   - Foto profil di header
   - TIDAK override toolbar/menu/dashboard
   ============================================================ */
(function(){
'use strict';
if (!window.DB || typeof window.ico !== 'function'){ console.error('[fix] app.js belum siap'); return; }

function ic(n,s){ return window.ico(n,s); }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uCid(){ return u().classId || window.__viewClassId || window.__currentViewClassId || null; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t,b){ if (window.openModal) window.openModal(t,b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id===cid; }); }

/* CSS tambahan (foto profil saja, TIDAK menyembunyikan apapun) */
(function injectCSS(){
  if (document.getElementById('fix10-css')) return;
  var st = document.createElement('style');
  st.id = 'fix10-css';
  st.textContent = [
    '.avatar-header{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;cursor:pointer;transition:.15s;}',
    '.avatar-header:hover{border-color:var(--primary);transform:scale(1.05);}',
    '.avatar-initials{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff;background:linear-gradient(135deg,var(--primary),var(--primary-dark));flex-shrink:0;cursor:pointer;}',
    '.header-info.has-avatar{display:flex;align-items:center;gap:10px;}',
    '@media (max-width:480px){.avatar-header,.avatar-initials{width:36px;height:36px;}.avatar-initials{font-size:14px;}}'
  ].join('');
  document.head.appendChild(st);
})();

/* 1. ALIAS FUNGSI HILANG */
window.openArsipNaskah = window.openArsipNaskah || function(cid){
  if (typeof window.openNaskahList === 'function') return window.openNaskahList(cid || uCid());
};
window.openBookingAlatMusik = window.openBookingAlatMusik || function(){
  if (typeof window.openBookingAlat === 'function') return window.openBookingAlat();
};
window.openChecklistView = window.openChecklistView || function(cid){
  if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(cid || uCid());
};
window.openStudentChecklistSelf = window.openStudentChecklistSelf || function(){
  if (typeof window.openChecklistPribadi === 'function') return window.openChecklistPribadi();
};
window.openTimSaya = window.openTimSaya || function(){
  if (typeof window.openChecklistTim === 'function') return window.openChecklistTim(uCid());
};
window.openGuruPasswordView = window.openGuruPasswordView || function(cid){
  if (typeof window.lihatPassword === 'function') return window.lihatPassword(cid);
};
window.openCreateMeetingModalFull = window.openCreateMeetingModalFull || function(type){
  type = type || 'rapat';
  if (typeof window.openBuatMeeting === 'function') return window.openBuatMeeting(type, uCid());
};
window.openKoordinasiAntarKelas = window.openKoordinasiAntarKelas || function(){
  if (typeof window.openKoordinasi === 'function') return window.openKoordinasi();
};

/* 2. FIX tandaiTugasSelesai */
window.tandaiTugasSelesai = function(id){
  var n = (window.DB.notifications||[]).find(function(x){ return x.id===id; });
  if (!n){ alert('Notifikasi tidak ditemukan'); return; }
  var me = window.currentUser || {};
  var key = me.studentId || me.email || 'anon';
  var db = (n.doneBy||[]).slice();
  if (db.indexOf(key) >= 0){ alert('Sudah ditandai selesai'); return; }
  db.push(key);
  window.fbSet('notifications', id, Object.assign({}, n, {doneBy:db})).then(function(){
    if (window.logActivity) window.logActivity('task_done', (me.name||'User')+' tandai selesai: '+(n.title||''), {classId:n.classId});
    alert('Tugas ditandai selesai!');
    if (window.renderNotifPanel) window.renderNotifPanel();
  });
};

/* 3. FOTO PROFIL DI HEADER */
function renderHeaderAvatar(){
  if (!window.currentUser || window.currentUser.type !== 'siswa') return;
  var info = document.querySelector('.header-info');
  if (!info) return;
  if (info.querySelector('.avatar-header, .avatar-initials')) return;
  var me = window.currentUser;
  var c = findClass(me.classId);
  if (!c) return;
  var s = (c.students||[]).find(function(x){ return x.id===me.studentId; });
  if (!s) return;
  var av;
  if (s.foto){
    av = document.createElement('img');
    av.src = s.foto;
    av.className = 'avatar-header';
    av.title = 'Klik untuk ubah foto';
    av.onclick = function(){ window.openUploadFotoProfil && window.openUploadFotoProfil(); };
  } else {
    av = document.createElement('div');
    av.className = 'avatar-initials';
    av.textContent = (me.name||'?').charAt(0).toUpperCase();
    av.title = 'Klik untuk upload foto';
    av.onclick = function(){ window.openUploadFotoProfil && window.openUploadFotoProfil(); };
  }
  info.classList.add('has-avatar');
  info.insertBefore(av, info.firstChild);
}

/* 4. UPLOAD FOTO PROFIL */
window.openUploadFotoProfil = function(){
  if (!isSiswa()){ alert('Hanya siswa'); return; }
  var me = window.currentUser;
  var c = findClass(me.classId);
  if (!c) return;
  var s = (c.students||[]).find(function(x){ return x.id===me.studentId; });
  var photo = s && s.foto;
  var h = '<div class="alert alert-info">' + ic('user') + '<div>Foto maks <b>200 KB</b>.</div></div>';
  if (photo) h += '<div style="text-align:center;margin-bottom:14px;"><img src="' + esc(photo) + '" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid var(--primary);"></div>';
  h += '<div class="form-group"><label>Pilih Foto</label><input type="file" id="fx-foto" accept="image/*" style="padding:8px;width:100%;"></div>';
  h += '<button class="btn btn-primary btn-block" onclick="window.__saveFoto()">Simpan</button>';
  if (photo) h += '<button class="btn btn-danger btn-block" style="margin-top:8px;" onclick="window.__hapusFoto()">Hapus Foto</button>';
  openModal('Foto Profil', h);
};

window.__saveFoto = function(){
  var el = document.getElementById('fx-foto');
  if (!el || !el.files || !el.files[0]){ alert('Pilih foto'); return; }
  var f = el.files[0];
  if (f.size > 200*1024){ alert('Foto terlalu besar (maks 200 KB)'); return; }
  var me = window.currentUser;
  var c = findClass(me.classId);
  if (!c) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var dataUrl = e.target.result;
    var students = (c.students||[]).map(function(s){
      if (s.id !== me.studentId) return s;
      return Object.assign({}, s, {foto: dataUrl});
    });
    window.fbSet('classes', c.id, Object.assign({}, c, {students: students})).then(function(){
      me.foto = dataUrl;
      if (window.saveSession) window.saveSession();
      closeModal();
      alert('Foto tersimpan!');
      var old = document.querySelector('.header-info .avatar-header, .header-info .avatar-initials');
      if (old) old.remove();
      renderHeaderAvatar();
    });
  };
  reader.readAsDataURL(f);
};

window.__hapusFoto = function(){
  if (!confirm('Hapus foto profil?')) return;
  var me = window.currentUser;
  var c = findClass(me.classId);
  if (!c) return;
  var students = (c.students||[]).map(function(s){
    if (s.id !== me.studentId) return s;
    var x = Object.assign({}, s); delete x.foto; return x;
  });
  window.fbSet('classes', c.id, Object.assign({}, c, {students: students})).then(function(){
    delete me.foto;
    if (window.saveSession) window.saveSession();
    closeModal();
    alert('Foto dihapus');
    var old = document.querySelector('.header-info .avatar-header, .header-info .avatar-initials');
    if (old) old.remove();
    renderHeaderAvatar();
  });
};

/* 5. EVENT HANDLER */
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-fx]');
  if (!el) return;
  e.preventDefault();
  var fn = el.getAttribute('data-fx');
  var arg = el.getAttribute('data-arg');
  if (typeof window[fn] !== 'function'){ console.warn('[fix] Missing:', fn); return; }
  try { if (arg) window[fn](arg); else window[fn](); }
  catch(err){ console.error('[fix]', fn, err); alert('Error: ' + err.message); }
}, true);

/* 6. HOOKS */
(function(){
  var o = window.showApp;
  if (typeof o !== 'function') return;
  window.showApp = function(){
    var r = o.apply(this, arguments);
    setTimeout(renderHeaderAvatar, 300);
    setTimeout(renderHeaderAvatar, 900);
    return r;
  };
})();

(function(){
  var o = window.renderSiswaDash;
  if (typeof o !== 'function') return;
  window.renderSiswaDash = function(){
    var r = o.apply(this, arguments);
    setTimeout(renderHeaderAvatar, 300);
    return r;
  };
})();

setTimeout(renderHeaderAvatar, 2000);
setTimeout(renderHeaderAvatar, 4000);

console.log('[features-fix] v10.0 FINAL — toolbar asli TIDAK disembunyikan');
})();