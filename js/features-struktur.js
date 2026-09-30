/* ============================================================
   features-struktur.js — Placeholder (M8)
   Akan diisi setelah M1-M7 stabil
   ============================================================ */
(function(){
'use strict';

console.log('[features-struktur] placeholder loaded');

// Fungsi sementara
window.openStrukturKerabatKerja = function(cid){
  cid = cid || window.currentUser && window.currentUser.classId || window.__currentViewClassId;
  if (!cid){ alert('Pilih kelas terlebih dahulu'); return; }
  var c = (window.DB.classes || []).find(function(x){ return x.id === cid; });
  if (!c) return;
  var students = c.students || [];
  var h = '<div class="alert alert-info">' + window.ico('award') + '<div><b>Struktur Kerabat Kerja</b><br><small>' + students.length + ' anggota</small></div></div>';
  if (students.length === 0){
    h += '<div class="empty-state">' + window.ico('users',40) + '<p>Belum ada anggota</p></div>';
  } else {
    students.forEach(function(s){
      var rl = (window.ROLES[s.role] && window.ROLES[s.role].label) || s.role;
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;">' +
        '<div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">' +
        (s.name||'?').charAt(0).toUpperCase() + '</div>' +
        '<div style="flex:1;"><div style="font-weight:700;font-size:13px;">' + (s.name||'-') + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">' + rl + '</div></div></div>';
    });
  }
  window.openModal('Struktur Kerabat Kerja', h);
};

window.openImportSiswa = function(cid){
  alert('Fitur Import Excel sedang dalam pengembangan.\n\nAkan tersedia di update berikutnya.');
};

})();
