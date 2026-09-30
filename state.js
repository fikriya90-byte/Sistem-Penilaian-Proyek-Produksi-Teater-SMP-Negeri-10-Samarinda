/* ============================================================
   CORE / STATE — DB, currentUser, session, konstanta
   ============================================================ */
(function(){
'use strict';

/* ROLES */
window.ROLES = {
  pimpinan_produksi: { label: 'Pimpinan Produksi', team: 'produksi' },
  sekretaris:        { label: 'Sekretaris', team: 'produksi' },
  bendahara:         { label: 'Bendahara', team: 'produksi' },
  koor_publikasi:    { label: 'Koor. Publikasi & Dokumentasi', team: 'produksi' },
  koor_perlengkapan: { label: 'Koor. Perlengkapan', team: 'produksi' },
  koor_akomodasi:    { label: 'Koor. Akomodasi & Transportasi', team: 'produksi' },
  anggota_publikasi: { label: 'Anggota Publikasi', team: 'produksi' },
  anggota_perlengkapan:{ label: 'Anggota Perlengkapan', team: 'produksi' },
  anggota_akomodasi: { label: 'Anggota Akomodasi', team: 'produksi' },
  sutradara:         { label: 'Sutradara', team: 'artistik' },
  asisten_sutradara: { label: 'Asisten Sutradara', team: 'artistik' },
  pemain:            { label: 'Pemeran', team: 'artistik' },
  koor_panggung:     { label: 'Koor. Tata Pentas & Panggung', team: 'artistik' },
  koor_musik:        { label: 'Koor. Tata Musik & Suara', team: 'artistik' },
  koor_busana:       { label: 'Koor. Tata Busana', team: 'artistik' },
  koor_rias:         { label: 'Koor. Tata Rias', team: 'artistik' },
  koor_cahaya:       { label: 'Koor. Tata Cahaya', team: 'artistik' },
  anggota_panggung:  { label: 'Anggota Tata Pentas', team: 'artistik' },
  anggota_musik:     { label: 'Anggota Tata Musik', team: 'artistik' },
  anggota_busana:    { label: 'Anggota Tata Busana', team: 'artistik' },
  anggota_rias:      { label: 'Anggota Tata Rias', team: 'artistik' },
  anggota_cahaya:    { label: 'Anggota Tata Cahaya', team: 'artistik' }
};

/* Tahapan default */
window.DEFAULT_STAGES = [
  { id: 'stage1', name: 'Perencanaan', weight: 20, desc: 'Konsep, jadwal, RAB' },
  { id: 'stage2', name: 'Pelaksanaan', weight: 35, desc: 'Latihan & produksi' },
  { id: 'stage3', name: 'Pertunjukan', weight: 35, desc: 'Hari-H' },
  { id: 'stage4', name: 'Evaluasi', weight: 10, desc: 'Laporan & refleksi' }
];

/* DB in-memory */
window.DB = {
  teachers: [],
  classes: [],
  evaluations: {},
  deadlines: {},
  activeStages: {},
  notifications: [],
  stages: JSON.parse(JSON.stringify(window.DEFAULT_STAGES)),
  checklists: {},
  meetings: {},
  activityLogs: [],
  waLogs: [],
  naskah: {},
  bookingAlat: {},
  koordinasi: []
};

/* Current User */
window.currentUser = null;

/* Session */
var SESSION_KEY = 'sppt_session_v2';
window.saveSession = function(){
  if (!window.currentUser) return;
  window.U.setLS(SESSION_KEY, JSON.stringify({
    type: window.currentUser.type,
    email: window.currentUser.email || '',
    name: window.currentUser.name || '',
    classId: window.currentUser.classId || '',
    studentId: window.currentUser.studentId || '',
    role: window.currentUser.role || '',
    phone: window.currentUser.phone || ''
  }));
};
window.clearSession = function(){ window.U.delLS(SESSION_KEY); };
window.getSession = function(){ return window.U.safeJson(window.U.getLS(SESSION_KEY), null); };

/* Helpers */
window.myType = function(){ return String((window.currentUser || {}).type || '').toLowerCase(); };
window.myRole = function(){ return String((window.currentUser || {}).role || '').toLowerCase(); };
window.myCid  = function(){ return (window.currentUser || {}).classId || window.__viewClassId || null; };
window.mySid  = function(){ return (window.currentUser || {}).studentId || null; };
window.myName = function(){ return (window.currentUser || {}).name || ''; };

window.getDivisionOfRole = function(role){
  var r = window.ROLES[role];
  return r ? r.team : 'produksi';
};

window.myClasses = function(){
  if (!window.currentUser) return [];
  if (window.currentUser.type === 'admin') return window.DB.classes.slice();
  if (window.currentUser.type === 'guru'){
    var em = String(window.currentUser.email || '').toLowerCase();
    return window.DB.classes.filter(function(c){
      return c.teacherEmail && String(c.teacherEmail).toLowerCase() === em;
    });
  }
  if (window.currentUser.type === 'siswa'){
    return window.DB.classes.filter(function(c){ return c.id === window.currentUser.classId; });
  }
  return [];
};

window.ownsClass = function(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  if (window.currentUser.type === 'guru'){
    var c = window.DB.classes.find(function(x){ return x.id === cid; });
    return !!(c && String(c.teacherEmail || '').toLowerCase() === String(window.currentUser.email || '').toLowerCase());
  }
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  return false;
};

/* Log activity */
window.logAct = function(type, msg, meta){
  var a = {
    id: window.U.uid(),
    type: type || 'info',
    message: msg || '',
    meta: meta || {},
    classId: (meta && meta.classId) || (window.currentUser && window.currentUser.classId) || '',
    userId: (window.currentUser && (window.currentUser.studentId || window.currentUser.email)) || 'system',
    userName: window.currentUser ? window.currentUser.name : 'System',
    createdAt: Date.now()
  };
  window.fsSet('activity_logs', a.id, a);
};

console.log('[state] loaded');
})();
