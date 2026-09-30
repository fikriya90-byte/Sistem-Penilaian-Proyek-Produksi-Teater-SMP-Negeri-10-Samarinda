/* ============================================================
   SP-PPT app.js — v13.0 MILESTONE 1
   Core: Auth, State, Dashboard, Navigasi, Firestore Sync
   Fix: Login siswa tidak muncul, tombol kembali error
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   1. HELPERS
   ============================================================ */
function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return String(s==null?'':s).replace(/[<>&"']/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]; }); }
function uid(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
function genCode(n){ var c = String(n||'KLS').replace(/[^A-Z0-9]/gi,'').toUpperCase().substring(0,4); return c + '-' + Math.floor(1000+Math.random()*9000); }
function safeFS(o){
  if (o === undefined || o === null) return o;
  if (typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(safeFS).filter(function(v){ return v !== undefined; });
  var c = {}; for (var k in o){ if (!Object.prototype.hasOwnProperty.call(o,k)) continue; if (o[k] === undefined) continue; c[k] = safeFS(o[k]); } return c;
}
function fmtDate(ts){ if (!ts) return '-'; return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function fmtDateShort(s){ if (!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); }
window.esc = esc; window.uid = uid; window.genCode = genCode; window.fmtDate = fmtDate; window.fmtDateShort = fmtDateShort;

/* ============================================================
   2. CONFIG
   ============================================================ */
var ADMIN = { email:'fikri.yassaar15@guru.smp.belajar.id', password:'#Smpn10smd', name:'Fikri Yassaar Arrazaq, S.Sn. (Admin)' };
var DEFAULT_TEACHERS = [{email:'fikri.yassaar15@guru.smp.belajar.id', password:'#Smpn10smd', name:'Fikri Yassaar Arrazaq, S.Sn.'}];

var DEFAULT_STAGES = [
  {id:'stage1',name:'Perencanaan',subtitle:'Pra-Produksi',description:'Konsep, jadwal, RAB.',weight:20,longDesc:'Tahap perencanaan sebelum latihan dimulai.'},
  {id:'stage2',name:'Pelaksanaan',subtitle:'Produksi & Latihan',description:'Latihan & eksekusi tugas.',weight:35,longDesc:'Tahap terlama. Termasuk absensi 15%.'},
  {id:'stage3',name:'Pertunjukan',subtitle:'Show Time',description:'Hari H pertunjukan.',weight:35,longDesc:'Hari puncak pertunjukan.'},
  {id:'stage4',name:'Evaluasi',subtitle:'Pasca-Produksi',description:'Laporan & refleksi.',weight:10,longDesc:'Tahap akhir.'}
];

var ROLES = {
  pimpinan_produksi:{label:'Pimpinan Produksi',team:'produksi',level:1},
  sutradara:{label:'Sutradara',team:'artistik',level:1},
  asisten_sutradara:{label:'Asisten Sutradara',team:'artistik',level:2},
  sekretaris:{label:'Sekretaris',team:'produksi',level:2},
  bendahara:{label:'Bendahara',team:'produksi',level:2},
  koor_publikasi:{label:'Koor. Publikasi & Dokumentasi',team:'produksi',level:3},
  koor_perlengkapan:{label:'Koor. Perlengkapan',team:'produksi',level:3},
  koor_akomodasi:{label:'Koor. Akomodasi & Transportasi',team:'produksi',level:3},
  koor_panggung:{label:'Koor. Tata Pentas & Panggung',team:'artistik',level:3},
  koor_musik:{label:'Koor. Tata Musik & Suara',team:'artistik',level:3},
  koor_busana:{label:'Koor. Tata Busana',team:'artistik',level:3},
  koor_rias:{label:'Koor. Tata Rias',team:'artistik',level:3},
  koor_cahaya:{label:'Koor. Tata Cahaya',team:'artistik',level:3},
  anggota_publikasi:{label:'Anggota Publikasi',team:'produksi',level:4},
  anggota_perlengkapan:{label:'Anggota Perlengkapan',team:'produksi',level:4},
  anggota_akomodasi:{label:'Anggota Akomodasi',team:'produksi',level:4},
  anggota_panggung:{label:'Anggota Tata Pentas',team:'artistik',level:4},
  anggota_musik:{label:'Anggota Tata Musik',team:'artistik',level:4},
  anggota_busana:{label:'Anggota Tata Busana',team:'artistik',level:4},
  anggota_rias:{label:'Anggota Tata Rias',team:'artistik',level:4},
  anggota_cahaya:{label:'Anggota Tata Cahaya',team:'artistik',level:4},
  pemain:{label:'Pemeran',team:'artistik',level:4}
};
window.ROLES = ROLES;

/* ============================================================
   3. MATRIKS EVALUATOR — FINAL (sesuai blueprint)
   ============================================================ */
var EVALUATOR_MATRIX = {
  pimpinan_produksi: ['guru','sutradara','asisten_sutradara','sekretaris','bendahara',
    'koor_publikasi','koor_perlengkapan','koor_akomodasi',
    'koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya',
    'anggota_publikasi','anggota_perlengkapan','anggota_akomodasi',
    'anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
  sutradara: ['guru','pimpinan_produksi','asisten_sutradara','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'],
  asisten_sutradara: ['sutradara','pimpinan_produksi','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'],
  sekretaris: ['pimpinan_produksi'],
  bendahara: ['pimpinan_produksi'],
  koor_publikasi: ['pimpinan_produksi','anggota_publikasi'],
  koor_perlengkapan: ['pimpinan_produksi','anggota_perlengkapan'],
  koor_akomodasi: ['pimpinan_produksi','anggota_akomodasi'],
  koor_panggung: ['sutradara','asisten_sutradara','anggota_panggung'],
  koor_musik: ['sutradara','asisten_sutradara','anggota_musik','koor_busana','koor_rias'],
  koor_busana: ['sutradara','asisten_sutradara','anggota_busana','koor_musik','koor_rias'],
  koor_rias: ['sutradara','asisten_sutradara','anggota_rias','koor_musik','koor_busana'],
  koor_cahaya: ['sutradara','asisten_sutradara','anggota_cahaya'],
  anggota_publikasi: ['koor_publikasi','pimpinan_produksi'],
  anggota_perlengkapan: ['koor_perlengkapan','pimpinan_produksi'],
  anggota_akomodasi: ['koor_akomodasi','pimpinan_produksi'],
  anggota_panggung: ['koor_panggung','asisten_sutradara'],
  anggota_musik: ['koor_musik','asisten_sutradara','koor_busana','koor_rias'],
  anggota_busana: ['koor_busana','asisten_sutradara','koor_musik','koor_rias'],
  anggota_rias: ['koor_rias','asisten_sutradara','koor_musik','koor_busana'],
  anggota_cahaya: ['koor_cahaya','asisten_sutradara'],
  pemain: ['sutradara','asisten_sutradara','pimpinan_produksi']
};
window.EVALUATOR_MATRIX = EVALUATOR_MATRIX;

window.canRoleEvaluate = function(evalRole, targetRole){
  if (evalRole === 'guru' || evalRole === 'admin') return true;
  var allowed = EVALUATOR_MATRIX[targetRole] || [];
  return allowed.indexOf(evalRole) >= 0;
};

/* ============================================================
   4. RUBRIK PENILAIAN
   ============================================================ */
var RUBRICS = {
  pimpinan_produksi:[{id:'pp1',name:'Perencanaan & Pengelolaan',weight:25,desc:'Rencana detail'},{id:'pp2',name:'Seleksi & Pengaturan Tim',weight:20,desc:'Penempatan tepat'},{id:'pp3',name:'Manajemen Anggaran',weight:20,desc:'Efisien'},{id:'pp4',name:'Koordinasi Lintas Divisi',weight:20,desc:'Harmonis'},{id:'pp5',name:'Evaluasi & Pelaporan',weight:15,desc:'Lengkap'}],
  sutradara:[{id:'sr1',name:'Pengembangan Konsep',weight:25,desc:'Unik'},{id:'sr2',name:'Casting',weight:20,desc:'Cocok'},{id:'sr3',name:'Pengarahan Pemain',weight:25,desc:'Blocking sempurna'},{id:'sr4',name:'Koordinasi Artistik',weight:15,desc:'Menyatu'},{id:'sr5',name:'Rekayasa Emosi',weight:15,desc:'Dramatis'}],
  sekretaris:[{id:'sk1',name:'Dokumentasi & Arsip',weight:30,desc:'Rapi'},{id:'sk2',name:'Penjadwalan',weight:25,desc:'Jauh hari'},{id:'sk3',name:'Korespondensi',weight:25,desc:'Jelas'},{id:'sk4',name:'Penyusunan Laporan',weight:20,desc:'Lengkap'}],
  bendahara:[{id:'bd1',name:'Pencatatan Transaksi',weight:30,desc:'Detail'},{id:'bd2',name:'Pengelolaan Keuangan',weight:30,desc:'Transparan'},{id:'bd3',name:'Perencanaan RAB',weight:20,desc:'Realistis'},{id:'bd4',name:'Pelaporan',weight:20,desc:'Tepat waktu'}],
  asisten_sutradara:[{id:'as1',name:'Koordinasi & Logistik',weight:30,desc:'Siap'},{id:'as2',name:'Pencatatan',weight:25,desc:'Lengkap'},{id:'as3',name:'Bantu Koordinasi Teknis',weight:25,desc:'Proaktif'},{id:'as4',name:'Backup Sutradara',weight:20,desc:'Siap'}],
  pemain:[{id:'pm1',name:'Penguasaan Naskah',weight:30,desc:'Hafal'},{id:'pm2',name:'Ekspresi & Emosi',weight:25,desc:'Mendalam'},{id:'pm3',name:'Blocking & Posisi',weight:20,desc:'Presisi'},{id:'pm4',name:'Kerja Sama',weight:15,desc:'Natural'},{id:'pm5',name:'Konsistensi Latihan',weight:10,desc:'Disiplin'}],
  koor_produksi:[{id:'kp1',name:'Penyediaan Kebutuhan',weight:30,desc:'Lengkap'},{id:'kp2',name:'Pengelolaan Anggota',weight:25,desc:'Optimal'},{id:'kp3',name:'Koordinasi Teknis',weight:25,desc:'Lancar'},{id:'kp4',name:'Pelaporan',weight:20,desc:'Detail'}],
  koor_artistik:[{id:'ka1',name:'Desain & Konsep',weight:25,desc:'Kreatif'},{id:'ka2',name:'Eksekusi Teknis',weight:35,desc:'Rapi'},{id:'ka3',name:'Koordinasi Tim',weight:25,desc:'Komunikatif'},{id:'ka4',name:'Pengelolaan Anggota',weight:15,desc:'Optimal'}],
  anggota:[{id:'ag1',name:'Penyelesaian Tugas',weight:30,desc:'Tepat waktu'},{id:'ag2',name:'Kualitas Kerja',weight:25,desc:'Teliti'},{id:'ag3',name:'Kerja Sama Tim',weight:25,desc:'Proaktif'},{id:'ag4',name:'Kedisiplinan',weight:20,desc:'Hadir'}]
};
window.getRubricFor = function(r){
  if (r==='pimpinan_produksi') return RUBRICS.pimpinan_produksi;
  if (r==='sutradara') return RUBRICS.sutradara;
  if (r==='sekretaris') return RUBRICS.sekretaris;
  if (r==='bendahara') return RUBRICS.bendahara;
  if (r==='asisten_sutradara') return RUBRICS.asisten_sutradara;
  if (r==='pemain') return RUBRICS.pemain;
  if (['koor_publikasi','koor_perlengkapan','koor_akomodasi'].indexOf(r)>=0) return RUBRICS.koor_produksi;
  if (['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'].indexOf(r)>=0) return RUBRICS.koor_artistik;
  return RUBRICS.anggota;
};

/* ============================================================
   5. FIREBASE INIT
   ============================================================ */
var firebaseReady = false, fb = null, firebaseError = '';
try {
  if (typeof firebase === 'undefined') throw new Error('Firebase SDK tidak termuat');
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey) throw new Error('Firebase config belum diisi');
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  fb = firebase.firestore();
  try { fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); } catch(e){}
  firebaseReady = true;
  console.log('[firebase] ready');
} catch(e){ console.error('[firebase]', e.message); firebaseError = e.message; }
window.firebaseReady = firebaseReady;
window.fb = fb;

function fbSet(col, id, data){ if (!firebaseReady) return Promise.resolve(); return fb.collection(col).doc(id).set(safeFS(data), {merge:true}); }
function fbDel(col, id){ if (!firebaseReady) return Promise.resolve(); return fb.collection(col).doc(id).delete(); }
window.fbSet = fbSet;
window.fbDel = fbDel;

/* ============================================================
   6. STATE
   ============================================================ */
var DB = {
  teachers:[], classes:[],
  evaluations:{}, deadlines:{}, activeStages:{},
  notifications:[], stages:JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  checklists:{}, meetings:{}, activityLogs:[], tasks:[], scripts:{}, bookings:{}, coordination:{}, aduan:{}
};
window.DB = DB;
window.currentUser = null;
window.__currentViewClassId = null;
window.__navStack = []; // For navigation

var SESSION_KEY = 'sppt_session';
function saveSession(){ try{ if (window.currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(window.currentUser)); }catch(e){} }
function clearSession(){ try{ localStorage.removeItem(SESSION_KEY); }catch(e){} }
function getSession(){ try{ var s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }catch(e){ return null; } }
window.saveSession = saveSession;
window.clearSession = clearSession;

/* ============================================================
   7. HELPERS CLASS (aplikasi lama kompatibel)
   ============================================================ */
function myClasses(){
  if (!window.currentUser) return [];
  if (window.currentUser.type === 'admin') return DB.classes.slice();
  if (window.currentUser.type === 'guru'){
    var e = String(window.currentUser.email||'').toLowerCase();
    return DB.classes.filter(function(c){ return c.teacherEmail && String(c.teacherEmail).toLowerCase() === e; });
  }
  if (window.currentUser.type === 'siswa') return DB.classes.filter(function(c){ return c.id === window.currentUser.classId; });
  return [];
}
function ownsClass(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  if (window.currentUser.type === 'guru'){
    var c = DB.classes.find(function(x){ return x.id === cid; });
    return !!(c && String(c.teacherEmail||'').toLowerCase() === String(window.currentUser.email||'').toLowerCase());
  }
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  return false;
}
window.myClasses = myClasses;
window.ownsClass = ownsClass;

function isStageActive(cid, sid){
  if (!DB.activeStages[cid]) return false;
  if (Array.isArray(DB.activeStages[cid].activeIds)) return DB.activeStages[cid].activeIds.indexOf(sid) >= 0;
  return DB.activeStages[cid][sid] === true;
}
function getActiveStages(cid){ return DB.stages.filter(function(s){ return isStageActive(cid, s.id); }); }
window.isStageActive = isStageActive;
window.getActiveStages = getActiveStages;

function isGuru(){ return window.currentUser && (window.currentUser.type === 'guru' || window.currentUser.type === 'admin'); }
function isSiswa(){ return window.currentUser && window.currentUser.type === 'siswa'; }
window.isGuru = isGuru;
window.isSiswa = isSiswa;

function logActivity(type, message, meta){
  var a = {
    id: uid(), type: type || 'info', message: message || '', meta: meta || {},
    classId: (meta && meta.classId) || (window.currentUser && window.currentUser.classId) || '',
    userId: (window.currentUser && (window.currentUser.studentId || window.currentUser.email)) || 'system',
    userName: window.currentUser ? window.currentUser.name : 'System',
    createdAt: Date.now()
  };
  return fbSet('activity_logs', a.id, a);
}
window.logActivity = logActivity;

/* ============================================================
   8. NOTIF HELPERS
   ============================================================ */
function getNotifKey(){
  if (!window.currentUser) return null;
  if (window.currentUser.type === 'siswa') return window.currentUser.studentId;
  if (window.currentUser.type === 'guru') return 'guru:' + String(window.currentUser.email||'').toLowerCase();
  return 'admin';
}
function getNotifs(){
  if (!window.currentUser) return [];
  var u = window.currentUser;
  if (u.type === 'siswa'){
    return DB.notifications.filter(function(n){
      if (n.classId !== u.classId) return false;
      if (n.toId === 'all') return true;
      if (n.toId === u.studentId) return true;
      if (n.recipientIds && n.recipientIds.indexOf(u.studentId) >= 0) return true;
      return false;
    });
  }
  if (u.type === 'guru'){
    var ids = myClasses().map(function(c){ return c.id; });
    return DB.notifications.filter(function(n){ return !n.classId || ids.indexOf(n.classId) >= 0; });
  }
  return DB.notifications.slice();
}
window.getNotifs = getNotifs;

function updateBadge(){
  var b = document.getElementById('notif-badge'), btn = document.getElementById('notif-btn');
  if (!b || !btn) return;
  if (!window.currentUser){ btn.classList.add('hidden'); return; }
  btn.classList.remove('hidden');
  var key = getNotifKey();
  var unread = getNotifs().filter(function(n){ return !(n.readBy && n.readBy.indexOf(key)>=0); }).length;
  if (unread > 0){ b.classList.remove('hidden'); b.textContent = unread > 99 ? '99+' : unread; }
  else b.classList.add('hidden');
}
window.updateBadge = updateBadge;

/* ============================================================
   9. THEME
   ============================================================ */
window.setTheme = function(m){
  try { localStorage.setItem('sppt_theme', m); } catch(e){}
  var a = m === 'auto' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : m;
  document.documentElement.setAttribute('data-theme', a);
  document.querySelectorAll('.theme-toggle button').forEach(function(b){ b.classList.toggle('active', b.dataset.theme === m); });
};

/* ============================================================
   10. SCREENS
   ============================================================ */
window.showLoginPage = function(){
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('btn-floating-panduan').classList.add('hidden');
  window.__currentViewClassId = null;
  window.__navStack = [];
};
window.showRegisterPage = function(){
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
  refreshRoleDropdown();
};
window.switchLoginTab = function(t){
  ['guru','siswa','admin'].forEach(function(x){
    var tb = document.getElementById('tab-login-'+x), fm = document.getElementById('form-login-'+x);
    if (tb) tb.classList.toggle('active', x===t);
    if (fm) fm.classList.toggle('hidden', x!==t);
  });
};
window.togglePw = function(id, btn){
  var i = document.getElementById(id); if (!i) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  btn.innerHTML = ic(i.type === 'password' ? 'eye' : 'eyeOff', 16);
};

function refreshClassDropdown(){
  var s = document.getElementById('siswa-kelas'); if (!s) return;
  var cur = s.value;
  s.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  DB.classes.forEach(function(c){ s.innerHTML += '<option value="' + c.id + '">' + esc(c.name) + '</option>'; });
  if (cur) s.value = cur;
}
function refreshRoleDropdown(){
  var s = document.getElementById('daftar-role'); if (!s) return;
  var o = '<option value="">-- Pilih Peran --</option><optgroup label="Produksi">';
  ['pimpinan_produksi','sekretaris','bendahara','koor_publikasi','koor_perlengkapan','koor_akomodasi','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'].forEach(function(k){ o += '<option value="'+k+'">'+ROLES[k].label+'</option>'; });
  o += '</optgroup><optgroup label="Artistik">';
  ['sutradara','asisten_sutradara','pemain','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'].forEach(function(k){ o += '<option value="'+k+'">'+ROLES[k].label+'</option>'; });
  o += '</optgroup>';
  s.innerHTML = o;
}

/* ============================================================
   11. MODAL
   ============================================================ */
window.openModal = function(t, b){
  document.getElementById('modal-title').innerHTML = t;
  document.getElementById('modal-body').innerHTML = b;
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(function(){
    if (window.hydrateIcons) window.hydrateIcons(document.getElementById('modal-body'));
  }, 20);
};
window.closeModal = function(){ document.getElementById('modal').classList.add('hidden'); };

/* ============================================================
   12. NOTIF PANEL
   ============================================================ */
window.openNotifPanel = function(){
  document.getElementById('notif-panel').classList.add('open');
  document.getElementById('notif-backdrop').classList.add('open');
  renderNotifPanel();
};
window.closeNotifPanel = function(){
  document.getElementById('notif-panel').classList.remove('open');
  document.getElementById('notif-backdrop').classList.remove('open');
};
function renderNotifPanel(){
  var b = document.getElementById('notif-panel-body');
  var list = getNotifs().sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
  if (list.length === 0){
    b.innerHTML = '<div class="notif-empty">' + ic('bell', 40) + '<p style="margin-top:10px;">Belum ada notifikasi</p></div>';
    return;
  }
  var key = getNotifKey(), h = '';
  list.forEach(function(n){
    var r = n.readBy && n.readBy.indexOf(key) >= 0;
    var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type] || 'Info';
    var tc = {tugas:'notif-type-tugas',instruksi:'notif-type-instruksi',info:'notif-type-info',urgent:'notif-type-urgent'}[n.type] || 'notif-type-info';
    h += '<div class="notif-item ' + (r?'':'unread') + '">' +
      '<div class="notif-header"><span class="notif-type '+tc+'">'+tl+'</span><span class="notif-time">'+fmtDate(n.createdAt)+'</span></div>' +
      '<div class="notif-title">'+esc(n.title||'-')+'</div>' +
      '<div class="notif-from">Dari: <b>'+esc(n.fromName||'Guru')+'</b></div>' +
      '<div class="notif-msg">'+esc(n.message||'')+'</div>' +
      '<div class="notif-actions">' +
      (!r ? '<button class="btn btn-sm btn-primary" onclick="markRead(\''+n.id+'\')">'+ic('check','sm')+' Tandai Dibaca</button>' : '<span class="badge badge-success">'+ic('check','sm')+' Dibaca</span>') +
      '<button class="btn btn-sm btn-danger" onclick="delNotif(\''+n.id+'\')">'+ic('trash','sm')+'</button>' +
      '</div></div>';
  });
  b.innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons(b);
}
window.markRead = function(id){
  var n = DB.notifications.find(function(x){ return x.id===id; }); if (!n) return;
  var key = getNotifKey(); var rb = n.readBy||[]; if (rb.indexOf(key)<0) rb.push(key);
  fbSet('notifications', id, Object.assign({}, n, {readBy:rb})).then(function(){ updateBadge(); renderNotifPanel(); });
};
window.delNotif = function(id){
  if (!confirm('Hapus notifikasi?')) return;
  fbDel('notifications', id).then(function(){ updateBadge(); renderNotifPanel(); });
};

/* ============================================================
   13. AUTH
   ============================================================ */
window.loginGuru = function(){
  var e = document.getElementById('guru-email').value.trim().toLowerCase();
  var p = document.getElementById('guru-password').value;
  if (!e || !p){ alert('Lengkapi email dan password!'); return; }
  var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase()===e && x.password===p; });
  if (!t){ alert('Email atau password salah!'); return; }
  window.currentUser = {type:'guru', email:t.email, name:t.name, phone:t.phone||''};
  saveSession(); showApp();
};

window.loginSiswa = function(){
  var cid = document.getElementById('siswa-kelas').value;
  var inp = document.getElementById('siswa-email').value.trim();
  var p = document.getElementById('siswa-password').value;
  if (!cid || !inp || !p){ alert('Lengkapi semua field!'); return; }
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c){ alert('Kelas tidak ditemukan!'); return; }
  var isEmail = inp.indexOf('@')>=0;
  var emailL = inp.toLowerCase(), phoneC = inp.replace(/\D/g,'');
  var s = (c.students||[]).find(function(x){
    if (x.password !== p) return false;
    if (isEmail) return x.email && x.email.toLowerCase()===emailL;
    return x.phone && x.phone.replace(/\D/g,'')===phoneC;
  });
  if (!s){ alert('Email/WA atau password salah!'); return; }
  window.currentUser = {type:'siswa', classId:cid, studentId:s.id, name:s.name, role:s.role, phone:s.phone||''};
  saveSession(); showApp();
};

window.loginAdmin = function(){
  var e = document.getElementById('admin-email').value.trim().toLowerCase();
  var p = document.getElementById('admin-password').value;
  if (e===ADMIN.email.toLowerCase() && p===ADMIN.password){
    window.currentUser = {type:'admin', email:ADMIN.email, name:ADMIN.name};
    saveSession(); showApp();
  } else alert('Email atau password admin salah!');
};

window.registerSiswa = function(){
  var code = document.getElementById('daftar-code').value.trim().toUpperCase();
  var name = document.getElementById('daftar-name').value.trim();
  var email = document.getElementById('daftar-email').value.trim().toLowerCase();
  var phone = document.getElementById('daftar-phone').value.replace(/\D/g,'');
  var pw = document.getElementById('daftar-password').value;
  var cf = document.getElementById('daftar-confirm').value;
  var role = document.getElementById('daftar-role').value;
  if (!code||!name||!email||!phone||!pw||!cf||!role){ alert('Lengkapi semua field!'); return; }
  if (phone.length<10||phone.length>15){ alert('No. WA tidak valid! (10-15 digit)'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length<6){ alert('Password minimal 6 karakter!'); return; }
  if (pw!==cf){ alert('Konfirmasi password tidak cocok!'); return; }
  var cls = DB.classes.find(function(c){ return c.code===code; });
  if (!cls){ alert('Kode Kelas tidak valid!'); return; }
  var dup = false;
  DB.classes.forEach(function(c){
    if ((c.students||[]).some(function(s){ return s.email && s.email.toLowerCase()===email; })) dup = true;
  });
  if (dup){ alert('Email sudah terdaftar!'); return; }
  var dupPhone = false;
  DB.classes.forEach(function(c){
    if ((c.students||[]).some(function(s){ return s.phone === phone; })) dupPhone = true;
  });
  if (dupPhone){ alert('No. WA sudah terdaftar!'); return; }
  var ns = {id:uid(), name:name, email:email, phone:phone, password:pw, role:role, registeredAt:Date.now()};
  var newStudents = (cls.students||[]).concat([ns]);
  fbSet('classes', cls.id, Object.assign({}, cls, {students:newStudents})).then(function(){
    fbSet('notifications', uid(), {
      id:uid(), classId:cls.id, fromId:ns.id, fromName:name, fromType:'siswa',
      toId:'guru', type:'info', title:'Pendaftaran Siswa Baru',
      message:name+' ('+(ROLES[role]?ROLES[role].label:role)+') mendaftar di '+cls.name,
      createdAt:Date.now(), readBy:[], doneBy:[]
    });
    logActivity('student_register', name+' mendaftar sebagai '+(ROLES[role]?ROLES[role].label:role), {classId:cls.id});
    alert('Pendaftaran berhasil!\n\nNama: '+name+'\nKelas: '+cls.name+'\n\nSilakan login.');
    showLoginPage();
    switchLoginTab('siswa');
    setTimeout(function(){
      var sel = document.getElementById('siswa-kelas');
      if (sel) sel.value = cls.id;
      var em = document.getElementById('siswa-email');
      if (em) em.value = email;
    }, 200);
  }).catch(function(err){
    alert('Gagal mendaftar: '+err.message);
  });
};

window.logout = function(){
  if (!confirm('Keluar dari aplikasi?')) return;
  window.currentUser = null; clearSession();
  window.__currentViewClassId = null;
  window.__navStack = [];
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('btn-floating-panduan').classList.add('hidden');
  closeNotifPanel();
};

window.openChangePassword = function(){
  var h = '<div class="form-group pw-toggle"><label>Password Lama</label><input type="password" id="cp-old"><button class="toggle-btn" type="button" onclick="togglePw(\'cp-old\',this)"><span data-ico="eye" data-size="16"></span></button></div>';
  h += '<div class="form-group pw-toggle"><label>Password Baru</label><input type="password" id="cp-new"><button class="toggle-btn" type="button" onclick="togglePw(\'cp-new\',this)"><span data-ico="eye" data-size="16"></span></button></div>';
  h += '<div class="form-group pw-toggle"><label>Konfirmasi</label><input type="password" id="cp-cf"><button class="toggle-btn" type="button" onclick="togglePw(\'cp-cf\',this)"><span data-ico="eye" data-size="16"></span></button></div>';
  h += '<button class="btn btn-primary btn-block" onclick="saveChangePassword()">'+ic('save')+' Simpan</button>';
  openModal('Ubah Password', h);
};
window.saveChangePassword = function(){
  var o = document.getElementById('cp-old').value;
  var n = document.getElementById('cp-new').value;
  var c = document.getElementById('cp-cf').value;
  if (!o || !n || !c){ alert('Lengkapi!'); return; }
  if (n.length < 6){ alert('Min 6 karakter!'); return; }
  if (n !== c){ alert('Konfirmasi tidak cocok!'); return; }
  if (window.currentUser.type === 'guru'){
    var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase()===window.currentUser.email.toLowerCase(); });
    if (!t || t.password !== o){ alert('Password lama salah!'); return; }
    fbSet('teachers', t.email, Object.assign({}, t, {password:n})).then(function(){ closeModal(); alert('Password diubah!'); });
  } else if (window.currentUser.type === 'siswa'){
    var cls = DB.classes.find(function(c){ return c.id === window.currentUser.classId; });
    var s = (cls.students||[]).find(function(x){ return x.id === window.currentUser.studentId; });
    if (!s || s.password !== o){ alert('Password lama salah!'); return; }
    var ns = (cls.students||[]).map(function(x){ return x.id===s.id?Object.assign({},x,{password:n}):x; });
    fbSet('classes', cls.id, Object.assign({}, cls, {students:ns})).then(function(){ closeModal(); alert('Password diubah!'); });
  } else { closeModal(); alert('Admin tidak dapat ubah password.'); }
};

/* ============================================================
   14. SHOW APP (FIX BUG: siswa baru langsung muncul)
   ============================================================ */
function showApp(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  document.getElementById('btn-floating-panduan').classList.remove('hidden');
  var btnPw = document.getElementById('btn-change-pw');
  if (btnPw) btnPw.style.display = window.currentUser.type === 'admin' ? 'none' : 'inline-flex';

  var l = '';
  if (window.currentUser.type==='guru'){
    l = ic('user','sm')+' <span>'+esc(window.currentUser.name)+' &mdash; <b>Guru Pengampu</b></span>';
  } else if (window.currentUser.type==='admin'){
    l = ic('shield','sm')+' <span>'+esc(window.currentUser.name)+' &mdash; <b>Administrator</b></span>';
  } else {
    var c = DB.classes.find(function(x){ return x.id===window.currentUser.classId; });
    l = ic('user','sm')+' <span>'+esc(window.currentUser.name)+' &mdash; <b>'+((ROLES[window.currentUser.role]||{}).label||window.currentUser.role)+'</b> &mdash; <b>Kelas '+(c?esc(c.name):'-')+'</b></span>';
  }
  document.getElementById('user-info').innerHTML = l;
  updateBadge();

  if (window.currentUser.type==='guru') navigate('guru-dash');
  else if (window.currentUser.type==='admin') navigate('admin-dash');
  else navigate('siswa-dash');

  if (window.__forceHideLoading) window.__forceHideLoading();
  setTimeout(showWelcomeModal, 900);
}
window.showApp = showApp;

/* ============================================================
   15. NAVIGATION STACK (FIX BUG: tombol kembali)
   ============================================================ */
window.navigate = function(view, params){
  params = params || {};
  if (view === 'back'){
    window.__navStack.pop();
    var prev = window.__navStack.pop();
    if (prev){ return navigate(prev.view, prev.params); }
    return;
  }
  window.__navStack.push({view:view, params:params});
  // Cap stack
  if (window.__navStack.length > 20) window.__navStack.shift();
  renderView(view, params);
};
window.navigateBack = function(){
  if (window.__navStack.length <= 1){ return; }
  window.__navStack.pop();
  var prev = window.__navStack[window.__navStack.length - 1];
  if (prev) renderView(prev.view, prev.params);
};

function renderView(view, params){
  if (view === 'guru-dash') renderGuruDash();
  else if (view === 'admin-dash') renderAdminDash();
  else if (view === 'siswa-dash') renderSiswaDash();
  else if (view === 'view-class') viewClass(params.cid);
  else if (view === 'menu') openMainMenu();
}

/* ============================================================
   16. WELCOME MODAL
   ============================================================ */
function showWelcomeModal(){
  if (!window.currentUser) return;
  var key = 'welcome_' + (window.currentUser.email || window.currentUser.studentId) + '_' + new Date().toDateString();
  try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch(e){}
  var h = '';
  h += '<div class="alert alert-info">'+ic('bell')+'<div><b>Selamat datang, '+esc(window.currentUser.name)+'!</b></div></div>';
  var tasks = getNotifs().filter(function(n){ return n.type==='tugas' && !(n.doneBy && n.doneBy.indexOf(getNotifKey())>=0); });
  if (tasks.length > 0) h += '<div class="alert alert-warning">'+ic('warning')+'<div>Ada <b>'+tasks.length+' tugas</b> belum selesai.</div></div>';
  var deadlines = getNotifs().filter(function(n){ return n.type==='tugas'; }).slice(0,3);
  if (deadlines.length > 0){
    h += '<div class="card"><h3>'+ic('clock')+' Deadline Terdekat</h3>';
    deadlines.forEach(function(d){
      h += '<div class="welcome-item urgent"><div style="flex:1;"><b>'+esc(d.title)+'</b><br><small>'+esc(d.fromName||'')+' &mdash; '+fmtDate(d.createdAt)+'</small></div></div>';
    });
    h += '</div>';
  }
  h += '<button class="btn btn-primary btn-block" onclick="closeModal()">Mulai</button>';
  openModal('Selamat Datang', h);
}

/* ============================================================
   17. DASHBOARD GURU
   ============================================================ */
function renderGuruDash(){
  window.__currentViewClassId = null;
  document.getElementById('header-title-text').innerHTML = ic('gear') + ' Dashboard Guru Pengampu';
  var mine = myClasses();
  var h = '';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="navigate(\'menu\')">'+ic('gear','sm')+' Menu</button>' +
    '<button class="btn" onclick="openTambahKelas()">'+ic('plus','sm')+' Tambah Kelas</button>' +
    '<button class="btn" onclick="openActivityLog()">'+ic('activity','sm')+' Aktivitas</button>' +
    '<button class="btn" onclick="openLogKomunikasi()">'+ic('messageCircle','sm')+' Log Komunikasi</button>' +
    '</div>';
  h += '<div class="alert alert-info">'+ic('info')+'<div>Selamat datang, <b>'+esc(window.currentUser.name)+'</b>! Kelola kelas Anda di bawah.</div></div>';
  h += '<h3 style="margin-bottom:12px;font-size:14.5px;font-weight:700;">'+ic('school')+' Kelas Saya ('+mine.length+')</h3>';
  if (mine.length === 0){
    h += '<div class="empty-state">'+ic('school',40)+'<p>Belum ada kelas. Klik <b>Tambah Kelas</b>.</p></div>';
  } else {
    h += '<div class="grid">';
    mine.forEach(function(c){
      var ac = getActiveStages(c.id).length;
      h += '<div class="card card-accent blue" style="cursor:pointer" onclick="navigate(\'view-class\', {cid:\''+c.id+'\'})">' +
        '<h3>'+ic('school','sm')+' '+esc(c.name)+'</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;margin-bottom:6px;">'+((c.students||[]).length)+' siswa</p>' +
        '<div style="font-size:11.5px;margin-bottom:4px;">Kode: <b style="color:var(--primary);letter-spacing:.15em;font-family:monospace;">'+esc(c.code)+'</b></div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Aktivasi: <b style="color:var(--primary);">'+ac+'/'+DB.stages.length+' tahap</b></div>' +
        '<div class="action-row" style="margin-top:10px;">' +
        '<button class="btn btn-sm" onclick="event.stopPropagation();navigate(\'view-class\', {cid:\''+c.id+'\'})">'+ic('edit','sm')+' Kelola</button>' +
        '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();hapusKelas(\''+c.id+'\')">'+ic('trash','sm')+'</button>' +
        '</div></div>';
    });
    h += '</div>';
  }
  h += renderActivityFeed();
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.renderGuruDash = renderGuruDash;

function renderActivityFeed(){
  var logs = (DB.activityLogs||[]).slice(0, 10);
  if (logs.length === 0) return '';
  var h = '<div class="card card-accent amber" style="margin-top:16px;"><h3>'+ic('activity')+' Aktivitas Terbaru</h3><div class="activity-feed">';
  logs.forEach(function(l){
    h += '<div class="activity-item"><div class="activity-icon">'+ic('activity','sm')+'</div>' +
      '<div class="activity-content"><div class="activity-msg">'+esc(l.message)+'</div>' +
      '<div class="activity-meta"><b>'+esc(l.userName||'-')+'</b> &middot; '+fmtDate(l.createdAt)+'</div></div></div>';
  });
  h += '</div></div>';
  return h;
}

/* ============================================================
   18. DASHBOARD SISWA
   ============================================================ */
function renderSiswaDash(){
  document.getElementById('header-title-text').innerHTML = ic('user') + ' Dashboard Siswa';
  var c = DB.classes.find(function(x){ return x.id===window.currentUser.classId; });
  if (!c){ document.getElementById('main-content').innerHTML = '<div class="empty-state">'+ic('warning',40)+'<p>Kelas tidak ditemukan</p></div>'; return; }
  var me = (c.students||[]).find(function(s){ return s.id===window.currentUser.studentId; });
  if (!me){ document.getElementById('main-content').innerHTML = '<div class="empty-state">'+ic('warning',40)+'<p>Data siswa tidak ditemukan</p></div>'; return; }
  var activeStages = getActiveStages(c.id);
  var roleLabel = (ROLES[me.role]||{}).label || me.role;

  var h = '';
  h += '<div class="progress-banner">' +
    '<h3>'+ic('user')+' Selamat Datang</h3>' +
    '<div style="font-size:15px;font-weight:700;margin:6px 0;">'+esc(me.name)+'</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">'+esc(roleLabel)+' &middot; Kelas '+esc(c.name)+'</div>' +
  '</div>';

  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="navigate(\'menu\')">'+ic('gear','sm')+' Menu</button>' +
    '<button class="btn" onclick="openChecklistPribadi()">'+ic('checkSquare','sm')+' Checklist</button>' +
    '<button class="btn" onclick="openPenilaianSiswaDashboard()">'+ic('edit','sm')+' Beri Nilai</button>' +
    '<button class="btn" onclick="openStrukturKerabatKerja()">'+ic('award','sm')+' Kerabat Kerja</button>' +
    '</div>';

  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">'+ic('layers')+' Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">'+ic('lock')+'<div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="grid">';
    activeStages.forEach(function(s){
      h += '<div class="card card-accent blue" style="cursor:pointer;" onclick="openPenilaianTahap(\''+c.id+'\',\''+s.id+'\')">' +
        '<h3>'+ic('layers','sm')+' '+esc(s.name)+'</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;">'+esc(s.subtitle||s.description||'')+'</p>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Bobot '+s.weight+'%</div>' +
        '</div>';
    });
    h += '</div>';
  }

  var tasks = getNotifs().filter(function(n){ return n.type==='tugas'; }).slice(0,5);
  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">'+ic('clock')+' Deadline & Tugas</h3>';
  if (tasks.length === 0){
    h += '<div class="alert alert-info">'+ic('info')+'<div>Tidak ada tugas baru.</div></div>';
  } else {
    tasks.forEach(function(n){
      h += '<div class="welcome-item urgent"><div style="flex:1;"><b>'+esc(n.title)+'</b><br><small>'+esc(n.fromName||'')+' &middot; '+fmtDate(n.createdAt)+'</small></div></div>';
    });
  }
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.renderSiswaDash = renderSiswaDash;

/* ============================================================
   19. DASHBOARD ADMIN
   ============================================================ */
function renderAdminDash(){
  document.getElementById('header-title-text').innerHTML = ic('shield') + ' Dashboard Admin';
  var h = '<div class="alert alert-info">'+ic('shield')+'<div><b>Area Administrator</b></div></div>';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openTambahGuru()">'+ic('personPlus','sm')+' Tambah Guru</button>' +
    '<button class="btn" onclick="openActivityLog()">'+ic('activity','sm')+' Aktivitas</button>' +
    '</div>';
  h += '<h3 style="margin-bottom:12px;font-size:14.5px;font-weight:700;">'+ic('users')+' Daftar Guru ('+DB.teachers.length+')</h3>';
  if (DB.teachers.length === 0) h += '<div class="empty-state">'+ic('users',40)+'<p>Belum ada guru.</p></div>';
  DB.teachers.forEach(function(t){
    h += '<div class="teacher-list-item">' +
      '<div class="info">'+ic('user','lg')+'<div><strong>'+esc(t.name)+'</strong><small>'+esc(t.email)+'</small></div></div>' +
      '<div class="action-row">' +
      '<button class="btn btn-sm" onclick="openEditGuru(\''+esc(t.email)+'\')">'+ic('edit','sm')+'</button>' +
      '<button class="btn btn-sm btn-danger" onclick="hapusGuru(\''+esc(t.email)+'\')">'+ic('trash','sm')+'</button>' +
      '</div></div>';
  });
  h += '<h3 style="margin:18px 0 10px;font-size:14.5px;font-weight:700;">'+ic('school')+' Kelas Terdaftar ('+DB.classes.length+')</h3>';
  if (DB.classes.length > 0){
    h += '<div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Kode</th><th>Guru</th><th>Siswa</th></tr></thead><tbody>';
    DB.classes.forEach(function(c){
      h += '<tr><td><b>'+esc(c.name)+'</b></td><td><code>'+esc(c.code)+'</code></td><td>'+esc(c.teacherEmail||'-')+'</td><td>'+((c.students||[]).length)+'</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.renderAdminDash = renderAdminDash;

/* ============================================================
   20. VIEW CLASS (FIX BUG: kembali + search siswa)
   ============================================================ */
function viewClass(cid){
  if (!ownsClass(cid)){ alert('Anda tidak punya akses ke kelas ini'); return; }
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c){ alert('Kelas tidak ditemukan'); return; }
  window.__currentViewClassId = cid;
  window.__currentViewClass = c;
  var activeStages = getActiveStages(cid);

  var h = '';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn" onclick="navigateBack()">'+ic('back','sm')+' Kembali</button>' +
    '<button class="btn btn-primary" onclick="openSistemTahapan(\''+cid+'\')">'+ic('gear','sm')+' Kelola Tahapan</button>' +
    '<button class="btn" onclick="openTambahSiswa(\''+cid+'\')">'+ic('personPlus','sm')+' Tambah Siswa</button>' +
    '<button class="btn" onclick="openImportSiswa(\''+cid+'\')">'+ic('upload','sm')+' Import</button>' +
    '<button class="btn" onclick="openPenilaianGuruDashboard(\''+cid+'\')">'+ic('edit','sm')+' Penilaian</button>' +
    '<button class="btn" onclick="openRekapNilai(\''+cid+'\')">'+ic('chart','sm')+' Rekap</button>' +
    '<button class="btn" onclick="openBroadcast(\''+cid+'\')">'+ic('megaphone','sm')+' Broadcast</button>' +
    '<button class="btn" onclick="openStrukturKerabatKerja(\''+cid+'\')">'+ic('award','sm')+' Kerabat Kerja</button>' +
    '<button class="btn" onclick="openChecklistManage(\''+cid+'\')">'+ic('clipboard','sm')+' Checklist</button>' +
    '<button class="btn" onclick="openNaskahList(\''+cid+'\')">'+ic('book','sm')+' Naskah</button>' +
    '<button class="btn" onclick="lihatPassword(\''+cid+'\')">'+ic('lock','sm')+' Password</button>' +
    '</div>';

  h += '<div class="class-code-box">' +
    '<div class="label">'+ic('hash','sm')+' Kode Kelas</div>' +
    '<div class="code">'+esc(c.code)+'</div>' +
    '<div class="hint">Bagikan ke siswa untuk daftar mandiri</div>' +
    '<div class="action-row">' +
    '<button class="btn btn-primary" onclick="salinKode(\''+cid+'\')">'+ic('copy','sm')+' Salin</button>' +
    '<button class="btn" onclick="regenerateKode(\''+cid+'\')">'+ic('refresh','sm')+' Generate Baru</button>' +
    '</div></div>';

  h += '<div class="card card-accent blue">' +
    '<h3>'+ic('layers')+' Status Tahapan</h3>' +
    '<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">'+activeStages.length+'/'+DB.stages.length+' tahap aktif</p>' +
    '<button class="btn btn-primary btn-sm" onclick="openSistemTahapan(\''+cid+'\')">'+ic('gear','sm')+' Kelola</button>' +
    '</div>';

  h += '<h3 style="margin:18px 0 8px;font-size:14.5px;font-weight:700;">'+ic('users')+' Siswa ('+((c.students||[]).length)+')</h3>';
  h += '<input type="text" class="search-box" id="siswa-search" placeholder="Cari nama / email / WA siswa..." oninput="window.__filterSiswa(this.value)">';
  h += '<div id="siswa-table-wrap">';
  h += renderSiswaTable(cid);
  h += '</div>';

  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.viewClass = viewClass;

function renderSiswaTable(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return '';
  if ((c.students||[]).length === 0) return '<div class="empty-state">'+ic('users',40)+'<p>Belum ada siswa. Klik <b>Tambah Siswa</b> untuk memulai.</p></div>';
  var h = '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>WA</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>';
  c.students.forEach(function(s, i){
    var r = ROLES[s.role] || {label:s.role, team:'-'};
    var searchKey = esc((s.name+' '+(s.email||'')+' '+(s.phone||'')+' '+(ROLES[s.role]?ROLES[s.role].label:s.role)).toLowerCase());
    h += '<tr data-search="'+searchKey+'">' +
      '<td>'+(i+1)+'</td>' +
      '<td><b>'+esc(s.name)+'</b></td>' +
      '<td style="font-size:12px;color:var(--text-muted);">'+esc(s.email||'-')+'</td>' +
      '<td style="font-size:12px;color:'+(s.phone?'var(--success)':'var(--danger)')+';">'+esc(s.phone||'tanpa WA')+'</td>' +
      '<td><span class="badge '+(r.team==='produksi'?'badge-info':'badge-warning')+'">'+esc(r.label)+'</span></td>' +
      '<td>' +
      '<button class="btn btn-sm" onclick="openEditSiswa(\''+cid+'\',\''+s.id+'\')">'+ic('edit','sm')+'</button> ' +
      '<button class="btn btn-sm btn-danger" onclick="hapusSiswa(\''+cid+'\',\''+s.id+'\')">'+ic('trash','sm')+'</button>' +
      '</td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

window.__filterSiswa = function(q){
  q = (q||'').toLowerCase().trim();
  var rows = document.querySelectorAll('#siswa-table-wrap tr[data-search]');
  for (var i = 0; i < rows.length; i++){
    var key = rows[i].getAttribute('data-search') || '';
    rows[i].style.display = (!q || key.indexOf(q) >= 0) ? '' : 'none';
  }
};

/* ============================================================
   21. TAMBAH KELAS
   ============================================================ */
window.openTambahKelas = function(){
  openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label><input id="new-class" placeholder="Contoh: IX-A"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKelas()">'+ic('save')+' Simpan</button>');
};
window.simpanKelas = function(){
  var n = document.getElementById('new-class').value.trim();
  if (!n){ alert('Nama kelas wajib diisi!'); return; }
  if (DB.classes.some(function(c){ return c.name.toLowerCase() === n.toLowerCase(); })){
    alert('Nama kelas sudah ada!'); return;
  }
  var id = uid();
  var data = {id:id, name:n, code:genCode(n), students:[], teacherEmail:window.currentUser.email, teacherName:window.currentUser.name, createdAt:Date.now()};
  fbSet('classes', id, data).then(function(){
    closeModal();
    logActivity('class_create', 'Kelas '+n+' dibuat', {classId:id});
    alert('Kelas "'+n+'" berhasil dibuat!\n\nKode: '+data.code);
  }).catch(function(e){ alert('Gagal: '+e.message); });
};
window.hapusKelas = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  if (!confirm('Hapus kelas "'+c.name+'"?\n\nSemua data siswa di kelas ini akan hilang.')) return;
  fbDel('classes', cid).then(function(){ alert('Kelas dihapus'); });
};
window.salinKode = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  if (navigator.clipboard) navigator.clipboard.writeText(c.code).then(function(){ alert('Kode disalin: '+c.code); });
  else prompt('Copy kode:', c.code);
};
window.regenerateKode = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  if (!confirm('Generate kode baru? Kode lama tidak akan berlaku lagi.')) return;
  var nc = genCode(c.name);
  fbSet('classes', cid, Object.assign({}, c, {code:nc})).then(function(){ alert('Kode baru: '+nc); });
};

/* ============================================================
   22. TAMBAH SISWA
   ============================================================ */
window.openTambahSiswa = function(cid){
  var opts = '<option value="">-- Pilih --</option>';
  Object.keys(ROLES).forEach(function(k){ opts += '<option value="'+k+'">'+ROLES[k].label+'</option>'; });
  openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama</label><input id="ts-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ts-email"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="ts-phone" placeholder="08123456789"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="ts-pw" value="#Smpn10smd"></div>' +
    '<div class="form-group"><label>Peran</label><select id="ts-role">'+opts+'</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanSiswa(\''+cid+'\')">'+ic('save')+' Simpan</button>');
};
window.simpanSiswa = function(cid){
  var n = document.getElementById('ts-name').value.trim();
  var e = document.getElementById('ts-email').value.trim().toLowerCase();
  var ph = document.getElementById('ts-phone').value.replace(/\D/g,'');
  var pw = document.getElementById('ts-pw').value;
  var r = document.getElementById('ts-role').value;
  if (!n || !e || !r){ alert('Lengkapi semua field!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email tidak valid!'); return; }
  var dup = false;
  DB.classes.forEach(function(cc){
    if ((cc.students||[]).some(function(s){ return s.email && s.email.toLowerCase()===e; })) dup = true;
  });
  if (dup){ alert('Email sudah terdaftar!'); return; }
  var c = DB.classes.find(function(x){ return x.id===cid; });
  var ns = (c.students||[]).concat([{id:uid(), name:n, email:e, phone:ph, password:pw||'#Smpn10smd', role:r, registeredAt:Date.now()}]);
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){
    closeModal();
    logActivity('student_add', 'Siswa '+n+' ditambahkan ke '+c.name, {classId:cid});
    alert('Siswa berhasil ditambahkan!');
  });
};
window.hapusSiswa = function(cid, sid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  var s = (c.students||[]).find(function(x){ return x.id===sid; });
  if (!s) return;
  if (!confirm('Hapus siswa "'+s.name+'"?')) return;
  var ns = (c.students||[]).filter(function(x){ return x.id!==sid; });
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){ alert('Dihapus'); });
};
window.openEditSiswa = function(cid, sid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  var s = (c.students||[]).find(function(x){ return x.id===sid; });
  if (!s) return;
  var opts = '';
  Object.keys(ROLES).forEach(function(k){ opts += '<option value="'+k+'" '+(s.role===k?'selected':'')+'>'+ROLES[k].label+'</option>'; });
  openModal('Edit Siswa',
    '<div class="form-group"><label>Nama</label><input id="es-name" value="'+esc(s.name)+'"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="es-email" value="'+esc(s.email||'')+'"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="es-phone" value="'+esc(s.phone||'')+'"></div>' +
    '<div class="form-group"><label>Password (kosongkan jika tidak diubah)</label><input type="text" id="es-pw"></div>' +
    '<div class="form-group"><label>Peran</label><select id="es-role">'+opts+'</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateSiswa(\''+cid+'\',\''+sid+'\')">'+ic('save')+' Simpan</button>');
};
window.updateSiswa = function(cid, sid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  var n = document.getElementById('es-name').value.trim();
  var e = document.getElementById('es-email').value.trim().toLowerCase();
  var ph = document.getElementById('es-phone').value.replace(/\D/g,'');
  var pw = document.getElementById('es-pw').value;
  var r = document.getElementById('es-role').value;
  if (!n || !e || !r){ alert('Lengkapi!'); return; }
  var ns = (c.students||[]).map(function(s){
    if (s.id !== sid) return s;
    var u = Object.assign({}, s, {name:n, email:e, phone:ph, role:r});
    if (pw) u.password = pw;
    return u;
  });
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){ closeModal(); alert('Diperbarui'); });
};
window.lihatPassword = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var h = '<div class="alert alert-warning">'+ic('warning')+'<div><b>RAHASIA</b> &mdash; jangan sebarkan</div></div>';
  h += '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Password</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(s){
    h += '<tr><td><b>'+esc(s.name)+'</b></td><td>'+esc(s.email||'-')+'</td><td><code>'+esc(s.password||'-')+'</code></td></tr>';
  });
  h += '</tbody></table></div>';
  openModal('Password Siswa', h);
};

/* ============================================================
   23. BROADCAST (untuk M1 basic)
   ============================================================ */
window.openBroadcast = function(cid){
  openModal('Broadcast Pesan',
    '<div class="form-group"><label>Judul</label><input id="bc-title"></div>' +
    '<div class="form-group"><label>Pesan</label><textarea id="bc-msg" rows="4"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="kirimBroadcast(\''+cid+'\')">'+ic('send')+' Kirim ke Semua Siswa</button>');
};
window.kirimBroadcast = function(cid){
  var t = document.getElementById('bc-title').value.trim();
  var m = document.getElementById('bc-msg').value.trim();
  if (!t || !m){ alert('Lengkapi!'); return; }
  fbSet('notifications', uid(), {
    id:uid(), classId:cid, fromName:window.currentUser.name, fromType:window.currentUser.type,
    toId:'all', type:'info', title:t, message:m, createdAt:Date.now(), readBy:[], doneBy:[]
  }).then(function(){
    closeModal(); alert('Broadcast terkirim!');
  });
};

/* ============================================================
   24. GURU MANAGEMENT (Admin)
   ============================================================ */
window.openTambahGuru = function(){
  openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="tg-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="tg-email"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="tg-pw" value="#Smpn10smd"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanGuru()">'+ic('save')+' Simpan</button>');
};
window.simpanGuru = function(){
  var n = document.getElementById('tg-name').value.trim();
  var e = document.getElementById('tg-email').value.trim().toLowerCase();
  var p = document.getElementById('tg-pw').value;
  if (!n || !e || !p){ alert('Lengkapi!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email tidak valid!'); return; }
  fbSet('teachers', e, {name:n, email:e, password:p}).then(function(){ closeModal(); alert('Guru ditambahkan'); });
};
window.openEditGuru = function(email){
  var t = DB.teachers.find(function(x){ return x.email===email; });
  if (!t) return;
  openModal('Edit Guru',
    '<div class="form-group"><label>Nama</label><input id="eg-name" value="'+esc(t.name)+'"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="eg-email" value="'+esc(t.email)+'"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="eg-pw" value="'+esc(t.password||'')+'"></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateGuru(\''+esc(email)+'\')">'+ic('save')+' Simpan</button>');
};
window.updateGuru = function(oldEmail){
  var n = document.getElementById('eg-name').value.trim();
  var e = document.getElementById('eg-email').value.trim().toLowerCase();
  var p = document.getElementById('eg-pw').value;
  fbSet('teachers', e, {name:n, email:e, password:p}).then(function(){
    if (oldEmail !== e) fbDel('teachers', oldEmail);
    closeModal(); alert('Diperbarui');
  });
};
window.hapusGuru = function(email){
  if (!confirm('Hapus guru '+email+'?')) return;
  fbDel('teachers', email).then(function(){ alert('Guru dihapus'); });
};

/* ============================================================
   25. ACTIVITY & LOG
   ============================================================ */
window.openActivityLog = function(){
  var logs = (DB.activityLogs||[]).slice(0, 100);
  var mine = myClasses().map(function(c){ return c.id; });
  if (window.currentUser.type === 'guru' && mine.length > 0){
    logs = logs.filter(function(l){ return !l.classId || mine.indexOf(l.classId) >= 0; });
  }
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Riwayat aktivitas sistem</div></div>';
  if (logs.length === 0){ h += '<div class="empty-state">'+ic('activity',40)+'<p>Belum ada aktivitas</p></div>'; }
  else {
    h += '<div class="activity-feed">';
    logs.forEach(function(l){
      h += '<div class="activity-item"><div class="activity-icon">'+ic('activity','sm')+'</div>' +
        '<div class="activity-content"><div class="activity-msg">'+esc(l.message)+'</div>' +
        '<div class="activity-meta"><b>'+esc(l.userName||'-')+'</b> &middot; '+fmtDate(l.createdAt)+'</div></div></div>';
    });
    h += '</div>';
  }
  openModal('Log Aktivitas', h);
};
window.openLogKomunikasi = function(){
  var logs = DB.notifications.slice(0, 100).filter(function(n){ return n.fromName; });
  var h = '<div class="alert alert-info">'+ic('info')+'<div>Riwayat komunikasi & broadcast</div></div>';
  if (logs.length === 0){ h += '<div class="empty-state">'+ic('messageCircle',40)+'<p>Belum ada log</p></div>'; }
  else {
    logs.forEach(function(n){
      h += '<div class="card" style="margin-bottom:8px;"><div style="font-size:12.5px;color:var(--text-muted);margin-bottom:4px;">'+fmtDate(n.createdAt)+'</div>' +
        '<div style="font-weight:600;">'+esc(n.fromName)+' &rarr; '+(n.toId==='all'?'Semua Siswa':esc(n.toId))+'</div>' +
        '<div style="font-weight:700;font-size:13px;margin:6px 0;">'+esc(n.title||'-')+'</div>' +
        '<div style="font-size:12.5px;">'+esc(n.message||'')+'</div></div>';
    });
  }
  openModal('Log Komunikasi', h);
};

/* ============================================================
   26. MENU PER ROLE (Dinamis)
   ============================================================ */
window.openMainMenu = function(){
  if (window.currentUser.type === 'admin') return openAdminMenu();
  if (window.currentUser.type === 'guru') return openGuruMenu();
  return openSiswaMenu();
};

function openGuruMenu(){
  openModal('Menu Guru',
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openLogKomunikasi()">'+ic('messageCircle')+' Log Komunikasi</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openActivityLog()">'+ic('activity')+' Aktivitas</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openChangePassword()">'+ic('key')+' Ubah Password</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();logout()">'+ic('out')+' Keluar</button>' +
    '</div>');
}

function openSiswaMenu(){
  var role = window.currentUser.role;
  var items = [
    {i:'checkSquare', l:'Checklist Saya', a:'openChecklistPribadi'},
    {i:'users',       l:'Checklist Tim', a:'openChecklistTim'},
    {i:'edit',        l:'Beri Nilai Rekan', a:'openPenilaianSiswaDashboard'},
    {i:'award',       l:'Kerabat Kerja', a:'openStrukturKerabatKerja'},
    {i:'info',        l:'Informasi Umum', a:'openInformasiUmum'},
    {i:'calendar',    l:'Absensi', a:'openMeetingListSiswa'}
  ];
  // Khusus peran
  if (role === 'sutradara' || role === 'asisten_sutradara'){
    items.push({i:'book', l:'Naskah', a:'openNaskahList'});
  }
  if (role === 'sekretaris' || role === 'pimpinan_produksi'){
    items.push({i:'calendar', l:'Buat Absen Rapat', a:'openMeetingList'});
  }
  if (['sutradara','asisten_sutradara'].indexOf(role) >= 0){
    items.push({i:'calendar', l:'Buat Absen Latihan', a:'openMeetingList'});
  }
  if (['pimpinan_produksi','koor_musik','sutradara','koor_perlengkapan'].indexOf(role) >= 0){
    items.push({i:'briefcase', l:'Booking Alat Musik', a:'openBookingAlat'});
  }
  if (['asisten_sutradara','koor_musik','koor_perlengkapan','pimpinan_produksi','sutradara','sekretaris'].indexOf(role) >= 0){
    items.push({i:'messageCircle', l:'Koordinasi Antar Kelas', a:'openKoordinasi'});
  }
  items.push({i:'key', l:'Ubah Password', a:'openChangePassword'});
  items.push({i:'out', l:'Keluar', a:'logout'});

  var h = '<div style="display:flex;flex-direction:column;gap:8px;">';
  items.forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;text-align:left;" onclick="closeModal();window.'+it.a+' && window.'+it.a+'()">'+ic(it.i)+' '+it.l+'</button>';
  });
  h += '</div>';
  openModal('Menu Siswa', h);
}
  if (role === 'sutradara' || role === 'asisten_sutradara'){
    items.push({i:'book', l:'Naskah', a:'openNaskahList'});
    items.push({i:'calendar', l:'Buat Absen Latihan', a:'openBuatMeetingLatihan'});
  }
  if (role === 'sekretaris' || role === 'pimpinan_produksi'){
    items.push({i:'calendar', l:'Buat Absen Rapat', a:'openBuatMeetingRapat'});
  }
  if (role === 'bendahara'){
    items.push({i:'chart', l:'Keuangan', a:'openKeuangan'});
  }
  if (role === 'koor_publikasi' || role === 'anggota_publikasi'){
    items.push({i:'image', l:'Kalender Konten', a:'openKalenderKonten'});
  }
  if (['pimpinan_produksi','koor_musik','sutradara','koor_perlengkapan'].indexOf(role) >= 0){
    items.push({i:'briefcase', l:'Booking Alat Musik', a:'openBookingAlat'});
  }
  // Koordinasi untuk peran inti
  if (['asisten_sutradara','koor_musik','koor_perlengkapan','pimpinan_produksi','sutradara','sekretaris'].indexOf(role) >= 0){
    items.push({i:'messageCircle', l:'Koordinasi Antar Kelas', a:'openKoordinasi'});
  }
  items.push({i:'key', l:'Ubah Password', a:'openChangePassword'});
  items.push({i:'out', l:'Keluar', a:'logout'});

  var h = '<div style="display:flex;flex-direction:column;gap:8px;">';
  items.forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;text-align:left;" onclick="closeModal();'+(it.a.indexOf('open')===0 ? it.a+'()' : it.a+'()')+'">'+ic(it.i)+' '+it.l+'</button>';
  });
  h += '</div>';
  openModal('Menu Siswa', h);
}

function openAdminMenu(){
  openModal('Menu Admin',
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openTambahGuru()">'+ic('personPlus')+' Tambah Guru</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openActivityLog()">'+ic('activity')+' Aktivitas</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();logout()">'+ic('out')+' Keluar</button>' +
    '</div>');
}

/* ============================================================
   27. PANDUAN
   ============================================================ */
window.openPanduan = function(){
  openModal('Panduan',
    '<div style="white-space:pre-wrap;padding:14px;background:var(--surface);border-radius:10px;font-size:12.5px;line-height:1.7;">' +
    'SISTEM PENILAIAN PROYEK PRODUKSI TEATER\n\n' +
    '1. Guru membuat kelas & tambah siswa\n' +
    '2. Guru aktifkan tahapan\n' +
    '3. Siswa login dengan email atau No. WA\n' +
    '4. Siswa isi checklist & beri nilai rekan\n' +
    '5. Guru nilai Pimpinan Produksi & Sutradara\n' +
    '6. Sistem hitung otomatis\n\n' +
    'Bobot: Guru 40% + Ketua 30% + Rekan 30%\n\n' +
    'Bantuan: hubungi admin atau guru pengampu' +
    '</div>');
};

/* ============================================================
   28. FIRESTORE SYNC — FIX BUG: Login siswa langsung muncul
   ============================================================ */
function subscribe(){
  if (!firebaseReady) return;

  // Teachers
  fb.collection('teachers').onSnapshot(function(snap){
    DB.teachers = snap.docs.map(function(d){ return d.data(); });
    if (DB.teachers.length === 0) DEFAULT_TEACHERS.forEach(function(t){ fbSet('teachers', t.email, t); });
    if (window.currentUser && window.currentUser.type === 'admin') renderAdminDash();
  }, function(e){ console.warn('[teachers]', e.message); });

  // Classes — ini yang penting untuk fix login
  fb.collection('classes').onSnapshot(function(snap){
    var fresh = snap.docs.map(function(d){ var o = d.data(); o.id = d.id; return o; });
    DB.classes = fresh;
    refreshClassDropdown();
    // Update info guru/siswa jika perlu
    if (window.currentUser){
      if (window.currentUser.type === 'guru'){
        if (window.__currentViewClassId) viewClass(window.__currentViewClassId);
        else renderGuruDash();
      } else if (window.currentUser.type === 'admin'){
        renderAdminDash();
      } else if (window.currentUser.type === 'siswa'){
        // Refresh data siswa jika ada perubahan
        var c = DB.classes.find(function(x){ return x.id===window.currentUser.classId; });
        if (c){
          var s = (c.students||[]).find(function(x){ return x.id===window.currentUser.studentId; });
          if (s){
            window.currentUser.name = s.name;
            window.currentUser.role = s.role;
            window.currentUser.phone = s.phone || '';
          }
        }
        renderSiswaDash();
      }
    }
  }, function(e){ console.warn('[classes]', e.message); });

  // Evaluations
  fb.collection('evaluations').onSnapshot(function(snap){
    var ev = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId, tid = dt.targetId;
      if (!cid || !tid) return;
      ev[cid] = ev[cid] || {}; ev[cid][tid] = ev[cid][tid] || {};
      for (var k in dt){ if (k!=='classId' && k!=='targetId') ev[cid][tid][k] = dt[k]; }
    });
    DB.evaluations = ev;
  }, function(e){ console.warn('[evaluations]', e.message); });

  // Deadlines
  fb.collection('deadlines').onSnapshot(function(snap){
    var dl = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId||d.id, obj = {};
      for (var k in dt){ if (k!=='classId') obj[k] = dt[k]; }
      dl[cid] = obj;
    });
    DB.deadlines = dl;
  }, function(e){ console.warn('[deadlines]', e.message); });

  // Active Stages
  fb.collection('activeStages').onSnapshot(function(snap){
    var a = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId||d.id, obj = {};
      if (Array.isArray(dt.activeIds)){
        obj.activeIds = dt.activeIds;
        dt.activeIds.forEach(function(id){ obj[id] = true; });
      } else {
        for (var k in dt){ if (k!=='classId') obj[k] = dt[k]; }
        obj.activeIds = Object.keys(obj).filter(function(k){ return obj[k]===true && k.indexOf('stage')===0; });
      }
      a[cid] = obj;
    });
    DB.activeStages = a;
  }, function(e){ console.warn('[activeStages]', e.message); });

  // Notifications
  fb.collection('notifications').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.notifications = snap.docs.map(function(d){ return d.data(); });
    updateBadge();
    if (document.getElementById('notif-panel').classList.contains('open')) renderNotifPanel();
  }, function(e){ console.warn('[notifications]', e.message); });

  // Config stages
  fb.collection('config').doc('stages').onSnapshot(function(doc){
    if (doc.exists && doc.data().stages) DB.stages = doc.data().stages;
    else fbSet('config', 'stages', {stages: DB.stages});
  }, function(e){ console.warn('[config]', e.message); });

  // Check lists
  fb.collection('checklists').onSnapshot(function(snap){
    var ch = {};
    snap.docs.forEach(function(d){ var dt = d.data(); ch[dt.classId||d.id] = {items: dt.items||[]}; });
    DB.checklists = ch;
  }, function(e){ console.warn('[checklists]', e.message); });

  // Meetings
  fb.collection('meetings').onSnapshot(function(snap){
    var m = {};
    snap.docs.forEach(function(d){ m[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.meetings = m;
  }, function(e){ console.warn('[meetings]', e.message); });

  // Activity Logs
  fb.collection('activity_logs').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.activityLogs = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    if (window.currentUser && window.currentUser.type==='guru' && !window.__currentViewClassId) renderGuruDash();
  }, function(e){ console.warn('[activity_logs]', e.message); });
}

/* ============================================================
   29. BOOT
   ============================================================ */
function boot(){
  console.log('Boot SP-PPT v13.0 M1...');
  var t = localStorage.getItem('sppt_theme') || 'auto';
  window.setTheme(t);
  if (window.hydrateIcons) window.hydrateIcons();

  if (!firebaseReady){
    console.warn('[boot] Firebase tidak siap:', firebaseError);
    setTimeout(showLoginPage, 800);
    return;
  }
  subscribe();
  setTimeout(function(){
    var sess = getSession();
    if (sess){
      setTimeout(function(){
        if (sess.type === 'guru'){
          var tt = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase() === String(sess.email||'').toLowerCase(); });
          if (tt){
            window.currentUser = {type:'guru', email:tt.email, name:tt.name, phone:tt.phone||''};
            showApp(); return;
          }
        }
        if (sess.type === 'admin'){
          window.currentUser = {type:'admin', email:sess.email, name:sess.name};
          showApp(); return;
        }
        if (sess.type === 'siswa'){
          var c = DB.classes.find(function(x){ return x.id===sess.classId; });
          if (c){
            var s = (c.students||[]).find(function(x){ return x.id===sess.studentId; });
            if (s){
              window.currentUser = {type:'siswa', classId:c.id, studentId:s.id, name:s.name, role:s.role, phone:s.phone||''};
              showApp(); return;
            }
          }
        }
        showLoginPage();
      }, 500);
    } else setTimeout(showLoginPage, 500);
  }, 800);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

window.__forceHideLoading = function(){
  var l = document.getElementById('loading-screen');
  if (l){ l.style.transition='opacity .3s'; l.style.opacity='0'; setTimeout(function(){ l.style.display='none'; }, 300); }
};
setTimeout(window.__forceHideLoading, 3500);

console.log('[app.js] v13.0 M1 loaded');
})();
window.openMeetingListSiswa = function(){
  if (window.openMeetingList) window.openMeetingList();
};
