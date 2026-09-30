/* ============================================================
   SP-PPT app.js — v14.0 CLEAN
   FIX: Syntax error, kompatibel dengan semua features-*.js
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   1. HELPERS
   ============================================================ */
function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return String(s == null ? '' : s).replace(/[<>&"']/g, function(c){
  return { '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c];
}); }
function uid(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
function genCode(n){
  var c = String(n || 'KLS').replace(/[^A-Z0-9]/gi,'').toUpperCase().substring(0,4);
  return c + '-' + Math.floor(1000 + Math.random()*9000);
}
function safeFS(o){
  if (o === undefined || o === null) return o;
  if (typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(safeFS).filter(function(v){ return v !== undefined; });
  var c = {};
  for (var k in o){
    if (!Object.prototype.hasOwnProperty.call(o,k)) continue;
    if (o[k] === undefined) continue;
    c[k] = safeFS(o[k]);
  }
  return c;
}
function fmtDate(ts){
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function fmtDateShort(s){
  if (!s) return '-';
  return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
}

window.esc = esc;
window.uid = uid;
window.genCode = genCode;
window.fmtDate = fmtDate;
window.fmtDateShort = fmtDateShort;

/* ============================================================
   2. CONFIG
   ============================================================ */
var ADMIN = {
  email:'fikri.yassaar15@guru.smp.belajar.id',
  password:'#Smpn10smd',
  name:'Fikri Yassaar Arrazaq, S.Sn. (Admin)'
};
var DEFAULT_TEACHERS = [{
  email:'fikri.yassaar15@guru.smp.belajar.id',
  password:'#Smpn10smd',
  name:'Fikri Yassaar Arrazaq, S.Sn.'
}];

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
   3. MATRIKS EVALUATOR
   ============================================================ */
var EVALUATOR_MATRIX = {
  pimpinan_produksi: ['guru','sutradara','asisten_sutradara','sekretaris','bendahara',
    'koor_publikasi','koor_perlengkapan','koor_akomodasi','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya',
    'anggota_publikasi','anggota_perlengkapan','anggota_akomodasi','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
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
   5. FIREBASE
   ============================================================ */
var firebaseReady = false;
var fb = null;
var firebaseError = '';

try {
  if (typeof firebase === 'undefined') throw new Error('Firebase SDK tidak termuat');
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey) throw new Error('Firebase config belum diisi');
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  fb = firebase.firestore();
  try { fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); } catch(e){}
  firebaseReady = true;
  console.log('[firebase] ready');
} catch(e){
  console.error('[firebase]', e.message);
  firebaseError = e.message;
}

window.firebaseReady = firebaseReady;
window.fb = fb;

function fbSet(col, id, data){
  if (!firebaseReady) return Promise.resolve();
  return fb.collection(col).doc(id).set(safeFS(data), {merge:true});
}
function fbDel(col, id){
  if (!firebaseReady) return Promise.resolve();
  return fb.collection(col).doc(id).delete();
}
window.fbSet = fbSet;
window.fbDel = fbDel;

/* ============================================================
   6. STATE
   ============================================================ */
var DB = {
  teachers:[],
  classes:[],
  evaluations:{},
  deadlines:{},
  activeStages:{},
  notifications:[],
  stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  checklists:{},
  meetings:{},
  activityLogs:[],
  tasks:[],
  scripts:{},
  bookings:{},
  coordination:{},
  aduan:{},
  waLogs:{}
};
window.DB = DB;

window.currentUser = null;
window.__currentViewClassId = null;
window.__navStack = [];

var SESSION_KEY = 'sppt_session';

function saveSession(){
  try {
    if (window.currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(window.currentUser));
  } catch(e){}
}
function clearSession(){
  try { localStorage.removeItem(SESSION_KEY); } catch(e){}
}
function getSession(){
  try {
    var s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e){ return null; }
}
window.saveSession = saveSession;
window.clearSession = clearSession;

/* ============================================================
   7. CLASS HELPERS
   ============================================================ */
function myClasses(){
  if (!window.currentUser) return [];
  if (window.currentUser.type === 'admin') return DB.classes.slice();
  if (window.currentUser.type === 'guru'){
    var e = String(window.currentUser.email||'').toLowerCase();
    return DB.classes.filter(function(c){
      return c.teacherEmail && String(c.teacherEmail).toLowerCase() === e;
    });
  }
  if (window.currentUser.type === 'siswa'){
    return DB.classes.filter(function(c){ return c.id === window.currentUser.classId; });
  }
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
  if (Array.isArray(DB.activeStages[cid].activeIds)){
    return DB.activeStages[cid].activeIds.indexOf(sid) >= 0;
  }
  return DB.activeStages[cid][sid] === true;
}
function getActiveStages(cid){
  return DB.stages.filter(function(s){ return isStageActive(cid, s.id); });
}
window.isStageActive = isStageActive;
window.getActiveStages = getActiveStages;

function isGuru(){
  return window.currentUser && (window.currentUser.type === 'guru' || window.currentUser.type === 'admin');
}
function isSiswa(){
  return window.currentUser && window.currentUser.type === 'siswa';
}
window.isGuru = isGuru;
window.isSiswa = isSiswa;

function logActivity(type, message, meta){
  var a = {
    id: uid(),
    type: type || 'info',
    message: message || '',
    meta: meta || {},
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
    return DB.notifications.filter(function(n){
      return !n.classId || ids.indexOf(n.classId) >= 0;
    });
  }
  return DB.notifications.slice();
}
window.getNotifs = getNotifs;

function updateBadge(){
  var b = document.getElementById('notif-badge');
  var btn = document.getElementById('notif-btn');
  if (!b || !btn) return;
  if (!window.currentUser){ btn.classList.add('hidden'); return; }
  btn.classList.remove('hidden');
  var key = getNotifKey();
  var unread = getNotifs().filter(function(n){
    return !(n.readBy && n.readBy.indexOf(key) >= 0);
  }).length;
  if (unread > 0){
    b.classList.remove('hidden');
    b.textContent = unread > 99 ? '99+' : unread;
  } else {
    b.classList.add('hidden');
  }
}
window.updateBadge = updateBadge;

/* ============================================================
   9. THEME
   ============================================================ */
window.setTheme = function(m){
  try { localStorage.setItem('sppt_theme', m); } catch(e){}
  var a = m === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : m;
  document.documentElement.setAttribute('data-theme', a);
  document.querySelectorAll('.theme-toggle button').forEach(function(b){
    b.classList.toggle('active', b.dataset.theme === m);
  });
};

/* ============================================================
   10. SCREENS
   ============================================================ */
window.showLoginPage = function(){
  var ld = document.getElementById('loading-screen'); if (ld) ld.style.display = 'none';
  var l = document.getElementById('login-screen'); if (l) l.classList.remove('hidden');
  var r = document.getElementById('register-screen'); if (r) r.classList.add('hidden');
  var a = document.getElementById('app-container'); if (a) a.classList.add('hidden');
  var f = document.getElementById('btn-floating-panduan'); if (f) f.classList.add('hidden');
  window.__currentViewClassId = null;
  window.__navStack = [];
};

window.showRegisterPage = function(){
  var ld = document.getElementById('loading-screen'); if (ld) ld.style.display = 'none';
  var l = document.getElementById('login-screen'); if (l) l.classList.add('hidden');
  var r = document.getElementById('register-screen'); if (r) r.classList.remove('hidden');
  var a = document.getElementById('app-container'); if (a) a.classList.add('hidden');
  refreshRoleDropdown();
};

window.switchLoginTab = function(t){
  ['guru','siswa','admin'].forEach(function(x){
    var tb = document.getElementById('tab-login-' + x);
    var fm = document.getElementById('form-login-' + x);
    if (tb) tb.classList.toggle('active', x === t);
    if (fm) fm.classList.toggle('hidden', x !== t);
  });
};

window.togglePw = function(id, btn){
  var i = document.getElementById(id);
  if (!i) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  btn.innerHTML = ic(i.type === 'password' ? 'eye' : 'eyeOff', 16);
};

function refreshClassDropdown(){
  var s = document.getElementById('siswa-kelas');
  if (!s) return;
  var cur = s.value;
  s.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  DB.classes.forEach(function(c){
    s.innerHTML += '<option value="' + c.id + '">' + esc(c.name) + '</option>';
  });
  if (cur) s.value = cur;
}

function refreshRoleDropdown(){
  var s = document.getElementById('daftar-role');
  if (!s) return;
  var o = '<option value="">-- Pilih Peran --</option><optgroup label="Produksi">';
  ['pimpinan_produksi','sekretaris','bendahara','koor_publikasi','koor_perlengkapan','koor_akomodasi','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'].forEach(function(k){
    o += '<option value="' + k + '">' + ROLES[k].label + '</option>';
  });
  o += '</optgroup><optgroup label="Artistik">';
  ['sutradara','asisten_sutradara','pemain','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'].forEach(function(k){
    o += '<option value="' + k + '">' + ROLES[k].label + '</option>';
  });
  o += '</optgroup>';
  s.innerHTML = o;
}

/* ============================================================
   11. MODAL
   ============================================================ */
window.openModal = function(t, b){
  var mt = document.getElementById('modal-title');
  var mb = document.getElementById('modal-body');
  var m = document.getElementById('modal');
  if (!mt || !mb || !m) return;
  mt.innerHTML = t;
  mb.innerHTML = b;
  m.classList.remove('hidden');
  setTimeout(function(){
    if (window.hydrateIcons) window.hydrateIcons(mb);
  }, 20);
};
window.closeModal = function(){
  var m = document.getElementById('modal');
  if (m) m.classList.add('hidden');
};

/* ============================================================
   12. NOTIF PANEL
   ============================================================ */
window.openNotifPanel = function(){
  var p = document.getElementById('notif-panel');
  var b = document.getElementById('notif-backdrop');
  if (p) p.classList.add('open');
  if (b) b.classList.add('open');
  renderNotifPanel();
};
window.closeNotifPanel = function(){
  var p = document.getElementById('notif-panel');
  var b = document.getElementById('notif-backdrop');
  if (p) p.classList.remove('open');
  if (b) b.classList.remove('open');
};

function renderNotifPanel(){
  var b = document.getElementById('notif-panel-body');
  if (!b) return;
  var list = getNotifs().sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
  if (list.length === 0){
    b.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--text-muted);">' + ic('bell', 40) + '<p style="margin-top:10px;">Belum ada notifikasi</p></div>';
    return;
  }
  var key = getNotifKey();
  var h = '';
  list.forEach(function(n){
    var r = n.readBy && n.readBy.indexOf(key) >= 0;
    var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type] || 'Info';
    var tc = {tugas:'badge-info',instruksi:'badge-primary',info:'badge-success',urgent:'badge-danger'}[n.type] || 'badge-gray';
    h += '<div style="padding:14px;background:' + (r ? 'var(--card)' : 'var(--primary-soft)') + ';border:1px solid var(--border);border-left:3px solid ' + (r ? 'var(--border-strong)' : 'var(--primary)') + ';border-radius:10px;margin-bottom:10px;">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap;">' +
        '<span class="badge ' + tc + '">' + tl + '</span>' +
        '<span style="font-size:11px;color:var(--text-muted);">' + fmtDate(n.createdAt) + '</span>' +
      '</div>' +
      '<div style="font-weight:700;font-size:13.5px;margin-bottom:6px;">' + esc(n.title||'Notifikasi') + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">Dari: <b>' + esc(n.fromName||'Guru') + '</b></div>' +
      '<div style="font-size:12.5px;line-height:1.6;margin-bottom:10px;white-space:pre-wrap;">' + esc(n.message||'') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
        (!r ? '<button class="btn btn-sm btn-primary" onclick="markRead(\'' + n.id + '\')">' + ic('check','sm') + ' Tandai Dibaca</button>' : '<span class="badge badge-success">' + ic('check','sm') + ' Dibaca</span>') +
        '<button class="btn btn-sm btn-danger" onclick="delNotif(\'' + n.id + '\')">' + ic('trash','sm') + '</button>' +
      '</div></div>';
  });
  b.innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons(b);
}

window.markRead = function(id){
  var n = DB.notifications.find(function(x){ return x.id === id; });
  if (!n) return;
  var key = getNotifKey();
  var rb = n.readBy || [];
  if (rb.indexOf(key) < 0) rb.push(key);
  fbSet('notifications', id, Object.assign({}, n, {readBy: rb})).then(function(){
    updateBadge();
    renderNotifPanel();
  });
};

window.delNotif = function(id){
  if (!confirm('Hapus notifikasi?')) return;
  fbDel('notifications', id).then(function(){
    updateBadge();
    renderNotifPanel();
  });
};

/* ============================================================
   13. AUTH
   ============================================================ */
window.loginGuru = function(){
  var e = (document.getElementById('guru-email').value || '').trim().toLowerCase();
  var p = document.getElementById('guru-password').value;
  if (!e || !p){ alert('Lengkapi email dan password!'); return; }
  var t = DB.teachers.find(function(x){
    return x.email && x.email.toLowerCase() === e && x.password === p;
  });
  if (!t){ alert('Email atau password salah!'); return; }
  window.currentUser = {type:'guru', email:t.email, name:t.name, phone:t.phone||''};
  saveSession();
  showApp();
};

window.loginSiswa = function(){
  var cid = document.getElementById('siswa-kelas').value;
  var inp = (document.getElementById('siswa-email').value || '').trim();
  var p = document.getElementById('siswa-password').value;
  if (!cid || !inp || !p){ alert('Lengkapi semua field!'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c){ alert('Kelas tidak ditemukan!'); return; }
  var isEmail = inp.indexOf('@') >= 0;
  var emailL = inp.toLowerCase();
  var phoneC = inp.replace(/\D/g,'');
  var s = (c.students||[]).find(function(x){
    if (x.password !== p) return false;
    if (isEmail) return x.email && x.email.toLowerCase() === emailL;
    return x.phone && x.phone.replace(/\D/g,'') === phoneC;
  });
  if (!s){ alert('Email/WA atau password salah!'); return; }
  window.currentUser = {
    type:'siswa', classId:cid, studentId:s.id,
    name:s.name, role:s.role, phone:s.phone||''
  };
  saveSession();
  showApp();
};

window.loginAdmin = function(){
  var e = (document.getElementById('admin-email').value || '').trim().toLowerCase();
  var p = document.getElementById('admin-password').value;
  if (e === ADMIN.email.toLowerCase() && p === ADMIN.password){
    window.currentUser = {type:'admin', email:ADMIN.email, name:ADMIN.name};
    saveSession();
    showApp();
  } else {
    alert('Email atau password admin salah!');
  }
};

window.registerSiswa = function(){
  var code = (document.getElementById('daftar-code').value || '').trim().toUpperCase();
  var name = (document.getElementById('daftar-name').value || '').trim();
  var email = (document.getElementById('daftar-email').value || '').trim().toLowerCase();
  var phone = (document.getElementById('daftar-phone').value || '').replace(/\D/g,'');
  var pw = document.getElementById('daftar-password').value;
  var cf = document.getElementById('daftar-confirm').value;
  var role = document.getElementById('daftar-role').value;

  if (!code || !name || !email || !phone || !pw || !cf || !role){
    alert('Lengkapi semua field!'); return;
  }
  if (phone.length < 10 || phone.length > 15){ alert('No. WA tidak valid! (10-15 digit)'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length < 6){ alert('Password minimal 6 karakter!'); return; }
  if (pw !== cf){ alert('Konfirmasi password tidak cocok!'); return; }

  var cls = DB.classes.find(function(c){ return c.code === code; });
  if (!cls){ alert('Kode Kelas tidak valid!'); return; }

  var dup = false;
  DB.classes.forEach(function(c){
    if ((c.students||[]).some(function(s){ return s.email && s.email.toLowerCase() === email; })) dup = true;
  });
  if (dup){ alert('Email sudah terdaftar!'); return; }

  var dupPhone = false;
  DB.classes.forEach(function(c){
    if ((c.students||[]).some(function(s){ return s.phone === phone; })) dupPhone = true;
  });
  if (dupPhone){ alert('No. WA sudah terdaftar!'); return; }

  var ns = {
    id: uid(), name: name, email: email, phone: phone,
    password: pw, role: role, registeredAt: Date.now()
  };
  var newStudents = (cls.students||[]).concat([ns]);

  fbSet('classes', cls.id, Object.assign({}, cls, {students: newStudents})).then(function(){
    fbSet('notifications', uid(), {
      id: uid(), classId: cls.id,
      fromId: ns.id, fromName: name, fromType: 'siswa',
      toId: 'guru', type: 'info',
      title: 'Pendaftaran Siswa Baru',
      message: name + ' (' + (ROLES[role] ? ROLES[role].label : role) + ') mendaftar di ' + cls.name,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
    logActivity('student_register', name + ' mendaftar sebagai ' + (ROLES[role] ? ROLES[role].label : role), {classId: cls.id});
    alert('Pendaftaran berhasil!\n\nNama: ' + name + '\nKelas: ' + cls.name + '\n\nSilakan login.');
    showLoginPage();
    switchLoginTab('siswa');
    setTimeout(function(){
      var sel = document.getElementById('siswa-kelas');
      if (sel) sel.value = cls.id;
      var em = document.getElementById('siswa-email');
      if (em) em.value = email;
    }, 200);
  }).catch(function(err){
    alert('Gagal mendaftar: ' + err.message);
  });
};

window.logout = function(){
  if (!confirm('Keluar dari aplikasi?')) return;
  window.currentUser = null;
  clearSession();
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
  h += '<button class="btn btn-primary btn-block" onclick="saveChangePassword()">' + ic('save') + ' Simpan</button>';
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
    var t = DB.teachers.find(function(x){
      return x.email && x.email.toLowerCase() === window.currentUser.email.toLowerCase();
    });
    if (!t || t.password !== o){ alert('Password lama salah!'); return; }
    fbSet('teachers', t.email, Object.assign({}, t, {password: n})).then(function(){
      closeModal();
      alert('Password diubah!');
    });
  } else if (window.currentUser.type === 'siswa'){
    var cls = DB.classes.find(function(c){ return c.id === window.currentUser.classId; });
    var s = (cls.students||[]).find(function(x){ return x.id === window.currentUser.studentId; });
    if (!s || s.password !== o){ alert('Password lama salah!'); return; }
    var ns = (cls.students||[]).map(function(x){
      return x.id === s.id ? Object.assign({}, x, {password: n}) : x;
    });
    fbSet('classes', cls.id, Object.assign({}, cls, {students: ns})).then(function(){
      closeModal();
      alert('Password diubah!');
    });
  } else {
    closeModal();
    alert('Admin tidak bisa ubah password.');
  }
};

/* ============================================================
   14. SHOW APP
   ============================================================ */
function showApp(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  document.getElementById('btn-floating-panduan').classList.remove('hidden');

  var btnPw = document.getElementById('btn-change-pw');
  if (btnPw) btnPw.style.display = window.currentUser.type === 'admin' ? 'none' : 'inline-flex';

  var l = '';
  if (window.currentUser.type === 'guru'){
    l = ic('user','sm') + ' <span>' + esc(window.currentUser.name) + ' &mdash; <b>Guru Pengampu</b></span>';
  } else if (window.currentUser.type === 'admin'){
    l = ic('shield','sm') + ' <span>' + esc(window.currentUser.name) + ' &mdash; <b>Administrator</b></span>';
  } else {
    var c = DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
    var rl = (ROLES[window.currentUser.role] || {}).label || window.currentUser.role;
    l = ic('user','sm') + ' <span>' + esc(window.currentUser.name) + ' &mdash; <b>' + rl + '</b> &mdash; <b>Kelas ' + (c ? esc(c.name) : '-') + '</b></span>';
  }
  document.getElementById('user-info').innerHTML = l;
  updateBadge();

  if (window.currentUser.type === 'guru') renderGuruDash();
  else if (window.currentUser.type === 'admin') renderAdminDash();
  else renderSiswaDash();

  if (window.__forceHideLoading) window.__forceHideLoading();
}
window.showApp = showApp;

/* ============================================================
   15. NAVIGATION
   ============================================================ */
window.navigate = function(view, params){
  params = params || {};
  if (view === 'back'){
    window.__navStack.pop();
    var prev = window.__navStack.pop();
    if (prev) return navigate(prev.view, prev.params);
    return;
  }
  window.__navStack.push({view: view, params: params});
  if (window.__navStack.length > 20) window.__navStack.shift();
  renderView(view, params);
};

window.navigateBack = function(){
  if (window.__navStack.length <= 1) return;
  window.__navStack.pop();
  var prev = window.__navStack[window.__navStack.length - 1];
  if (prev) renderView(prev.view, prev.params);
};

function renderView(view, params){
  if (view === 'guru-dash') renderGuruDash();
  else if (view === 'admin-dash') renderAdminDash();
  else if (view === 'siswa-dash') renderSiswaDash();
  else if (view === 'view-class') viewClass(params.cid);
}

/* ============================================================
   16. DASHBOARD GURU
   ============================================================ */
function renderGuruDash(){
  window.__currentViewClassId = null;
  document.getElementById('header-title-text').innerHTML = ic('gear') + ' Dashboard Guru Pengampu';

  var mine = myClasses();
  var h = '';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openMainMenu()">' + ic('gear','sm') + ' Menu</button>' +
    '<button class="btn" onclick="openTambahKelas()">' + ic('plus','sm') + ' Tambah Kelas</button>' +
    '<button class="btn" onclick="openActivityLog()">' + ic('activity','sm') + ' Aktivitas</button>' +
    '</div>';

  h += '<div class="alert alert-info">' + ic('info') + '<div>Selamat datang, <b>' + esc(window.currentUser.name) + '</b>! Kelola kelas Anda di bawah.</div></div>';
  h += '<h3 style="margin-bottom:12px;font-size:14.5px;font-weight:700;">' + ic('school') + ' Kelas Saya (' + mine.length + ')</h3>';

  if (mine.length === 0){
    h += '<div class="empty-state">' + ic('school',40) + '<p>Belum ada kelas. Klik <b>Tambah Kelas</b>.</p></div>';
  } else {
    h += '<div class="grid">';
    mine.forEach(function(c){
      var ac = getActiveStages(c.id).length;
      h += '<div class="card" style="cursor:pointer;border-left:4px solid var(--primary);" onclick="navigate(\'view-class\', {cid:\'' + c.id + '\'})">' +
        '<h3>' + ic('school','sm') + ' ' + esc(c.name) + '</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;margin-bottom:6px;">' + ((c.students||[]).length) + ' siswa</p>' +
        '<div style="font-size:11.5px;margin-bottom:4px;">Kode: <b style="color:var(--primary);letter-spacing:.15em;font-family:monospace;">' + esc(c.code) + '</b></div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Aktivasi: <b style="color:var(--primary);">' + ac + '/' + DB.stages.length + ' tahap</b></div>' +
        '<div class="action-row" style="margin-top:10px;">' +
        '<button class="btn btn-sm" onclick="event.stopPropagation();navigate(\'view-class\', {cid:\'' + c.id + '\'})">' + ic('edit','sm') + ' Kelola</button>' +
        '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();hapusKelas(\'' + c.id + '\')">' + ic('trash','sm') + '</button>' +
        '</div></div>';
    });
    h += '</div>';
  }
  h += '<h3 style="margin:18px 0 10px;font-size:14.5px;font-weight:700;">' + ic('calendar') + ' Master Timeline Produksi</h3>';
  h += '<div id="timeline-dash-guru"></div>';
  h += renderActivityFeed();

  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.renderGuruDash = renderGuruDash;
  setTimeout(function(){
    if (typeof window.renderMasterTimelineForDashboard === 'function'){
      var cid = window.__currentViewClassId;
      if (!cid){
        var mine = myClasses();
        if (mine.length > 0) cid = mine[0].id;
      }
      if (cid) window.renderMasterTimelineForDashboard(cid, 'timeline-dash-guru');
    }
  }, 100);
function renderActivityFeed(){
  var logs = (DB.activityLogs||[]).slice(0, 10);
  if (logs.length === 0) return '';
  var h = '<div class="card" style="margin-top:16px;border-left:4px solid var(--warning);"><h3>' + ic('activity') + ' Aktivitas Terbaru</h3><div class="activity-feed">';
  logs.forEach(function(l){
    h += '<div class="activity-item">' +
      '<div class="activity-icon">' + ic('activity','sm') + '</div>' +
      '<div class="activity-content">' +
      '<div class="activity-msg">' + esc(l.message) + '</div>' +
      '<div class="activity-meta"><b>' + esc(l.userName||'-') + '</b> &middot; ' + fmtDate(l.createdAt) + '</div>' +
      '</div></div>';
  });
  h += '</div></div>';
  return h;
}

/* ============================================================
   17. DASHBOARD SISWA
   ============================================================ */
function renderSiswaDash(){
  document.getElementById('header-title-text').innerHTML = ic('user') + ' Dashboard Siswa';
  var c = DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
  if (!c){
    document.getElementById('main-content').innerHTML = '<div class="empty-state">' + ic('warning',40) + '<p>Kelas tidak ditemukan</p></div>';
    return;
  }
  var me = (c.students||[]).find(function(s){ return s.id === window.currentUser.studentId; });
  if (!me){
    document.getElementById('main-content').innerHTML = '<div class="empty-state">' + ic('warning',40) + '<p>Data siswa tidak ditemukan</p></div>';
    return;
  }
  var activeStages = getActiveStages(c.id);
  var roleLabel = (ROLES[me.role]||{}).label || me.role;

  var h = '';
  h += '<div class="progress-banner">' +
    '<h3>' + ic('user') + ' Selamat Datang</h3>' +
    '<div style="font-size:15px;font-weight:700;margin:6px 0;">' + esc(me.name) + '</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">' + esc(roleLabel) + ' &middot; Kelas ' + esc(c.name) + '</div>' +
  '</div>';

  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openSiswaMenu()">' + ic('gear','sm') + ' Menu</button>' +
    '<button class="btn" onclick="openChecklistPribadi()">' + ic('checkSquare','sm') + ' Checklist</button>' +
    '<button class="btn" onclick="openPenilaianSiswaDashboard()">' + ic('edit','sm') + ' Beri Nilai</button>' +
    '<button class="btn" onclick="openStrukturKerabatKerja()">' + ic('award','sm') + ' Kerabat Kerja</button>' +
    '</div>';

  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">' + ic('layers') + ' Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">' + ic('lock') + '<div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="grid">';
    activeStages.forEach(function(s){
      h += '<div class="card" style="cursor:pointer;border-left:4px solid var(--primary);" onclick="openPenilaianTahap(\'' + c.id + '\',\'' + s.id + '\')">' +
        '<h3>' + ic('layers','sm') + ' ' + esc(s.name) + '</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;">' + esc(s.subtitle || s.description || '') + '</p>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Bobot ' + s.weight + '%</div>' +
        '</div>';
    });
    h += '</div>';
  }
  // ===== MASTER TIMELINE (dari Pimpro/Sekretaris) =====
  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">' + ic('calendar') + ' Master Timeline Produksi</h3>';
  h += '<div id="timeline-dash-siswa"></div>';
  var tasks = getNotifs().filter(function(n){ return n.type === 'tugas'; }).slice(0, 5);
  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">' + ic('clock') + ' Deadline & Tugas</h3>';
  if (tasks.length === 0){
    h += '<div class="alert alert-info">' + ic('info') + '<div>Tidak ada tugas baru.</div></div>';
  } else {
    tasks.forEach(function(n){
      h += '<div class="welcome-item urgent"><div style="flex:1;"><b>' + esc(n.title) + '</b><br><small>' + esc(n.fromName||'') + ' &middot; ' + fmtDate(n.createdAt) + '</small></div></div>';
    });
  }
  // Render Master Timeline
  setTimeout(function(){
    if (typeof window.renderMasterTimelineForDashboard === 'function'){
      window.renderMasterTimelineForDashboard(c.id, 'timeline-dash-siswa');
    }
  }, 100);
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.renderSiswaDash = renderSiswaDash;

/* ============================================================
   18. DASHBOARD ADMIN
   ============================================================ */
function renderAdminDash(){
  document.getElementById('header-title-text').innerHTML = ic('shield') + ' Dashboard Admin';
  var h = '<div class="alert alert-info">' + ic('shield') + '<div><b>Area Administrator</b></div></div>';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openTambahGuru()">' + ic('personPlus','sm') + ' Tambah Guru</button>' +
    '<button class="btn" onclick="openActivityLog()">' + ic('activity','sm') + ' Aktivitas</button>' +
    '</div>';
  h += '<h3 style="margin-bottom:12px;font-size:14.5px;font-weight:700;">' + ic('users') + ' Daftar Guru (' + DB.teachers.length + ')</h3>';
  if (DB.teachers.length === 0){
    h += '<div class="empty-state">' + ic('users',40) + '<p>Belum ada guru.</p></div>';
  } else {
    DB.teachers.forEach(function(t){
      h += '<div class="teacher-list-item">' +
        '<div class="info">' + ic('user','lg') + '<div><strong>' + esc(t.name) + '</strong><small>' + esc(t.email) + '</small></div></div>' +
        '<div class="action-row">' +
        '<button class="btn btn-sm" onclick="openEditGuru(\'' + esc(t.email) + '\')">' + ic('edit','sm') + '</button>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusGuru(\'' + esc(t.email) + '\')">' + ic('trash','sm') + '</button>' +
        '</div></div>';
    });
  }
  h += '<h3 style="margin:18px 0 10px;font-size:14.5px;font-weight:700;">' + ic('school') + ' Kelas Terdaftar (' + DB.classes.length + ')</h3>';
  if (DB.classes.length > 0){
    h += '<div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Kode</th><th>Guru</th><th>Siswa</th></tr></thead><tbody>';
    DB.classes.forEach(function(c){
      h += '<tr><td><b>' + esc(c.name) + '</b></td><td><code>' + esc(c.code) + '</code></td><td>' + esc(c.teacherEmail||'-') + '</td><td>' + ((c.students||[]).length) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.renderAdminDash = renderAdminDash;

/* ============================================================
   19. VIEW CLASS
   ============================================================ */
function viewClass(cid){
  if (!ownsClass(cid)){ alert('Tidak punya akses ke kelas ini'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c){ alert('Kelas tidak ditemukan'); return; }
  window.__currentViewClassId = cid;
  window.__currentViewClass = c;
  var activeStages = getActiveStages(cid);

  var h = '';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn" onclick="navigate(\'guru-dash\')">' + ic('back','sm') + ' Kembali</button>' +
    '<button class="btn btn-primary" onclick="openSistemTahapan(\'' + cid + '\')">' + ic('gear','sm') + ' Kelola Tahapan</button>' +
    '<button class="btn" onclick="openTambahSiswa(\'' + cid + '\')">' + ic('personPlus','sm') + ' Tambah Siswa</button>' +
    '<button class="btn" onclick="openImportSiswa(\'' + cid + '\')">' + ic('upload','sm') + ' Import</button>' +
    '<button class="btn" onclick="openPenilaianGuruDashboard(\'' + cid + '\')">' + ic('edit','sm') + ' Penilaian</button>' +
    '<button class="btn" onclick="openRekapNilai(\'' + cid + '\')">' + ic('chart','sm') + ' Rekap</button>' +
    '<button class="btn" onclick="openBroadcast(\'' + cid + '\')">' + ic('megaphone','sm') + ' Broadcast</button>' +
    '<button class="btn" onclick="openStrukturKerabatKerja(\'' + cid + '\')">' + ic('award','sm') + ' Kerabat</button>' +
    '<button class="btn" onclick="openChecklistManage(\'' + cid + '\')">' + ic('clipboard','sm') + ' Checklist</button>' +
    '<button class="btn" onclick="openNaskahList(\'' + cid + '\')">' + ic('book','sm') + ' Naskah</button>' +
    '<button class="btn" onclick="lihatPassword(\'' + cid + '\')">' + ic('lock','sm') + ' Password</button>' +
    '</div>';

  h += '<div class="class-code-box">' +
    '<div class="label">' + ic('hash','sm') + ' Kode Kelas</div>' +
    '<div class="code">' + esc(c.code) + '</div>' +
    '<div class="hint">Bagikan ke siswa untuk daftar mandiri</div>' +
    '<div class="action-row">' +
    '<button class="btn btn-primary" onclick="salinKode(\'' + cid + '\')">' + ic('copy','sm') + ' Salin</button>' +
    '<button class="btn" onclick="regenerateKode(\'' + cid + '\')">' + ic('refresh','sm') + ' Generate Baru</button>' +
    '</div></div>';

  h += '<div class="card" style="border-left:4px solid var(--primary);">' +
    '<h3>' + ic('layers') + ' Status Tahapan</h3>' +
    '<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">' + activeStages.length + '/' + DB.stages.length + ' tahap aktif</p>' +
    '<button class="btn btn-primary btn-sm" onclick="openSistemTahapan(\'' + cid + '\')">' + ic('gear','sm') + ' Kelola</button>' +
    '</div>';

  h += '<h3 style="margin:18px 0 8px;font-size:14.5px;font-weight:700;">' + ic('users') + ' Siswa (' + ((c.students||[]).length) + ')</h3>';
  h += '<input type="text" class="search-box" id="siswa-search" placeholder="Cari nama / email / WA siswa..." oninput="window.__filterSiswa(this.value)">';
  h += '<div id="siswa-table-wrap">' + renderSiswaTable(cid) + '</div>';

  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}
window.viewClass = viewClass;

function renderSiswaTable(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return '';
  if ((c.students||[]).length === 0){
    return '<div class="empty-state">' + ic('users',40) + '<p>Belum ada siswa. Klik <b>Tambah Siswa</b> untuk memulai.</p></div>';
  }
  var h = '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>WA</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>';
  c.students.forEach(function(s, i){
    var r = ROLES[s.role] || {label:s.role, team:'-'};
    var searchKey = esc((s.name + ' ' + (s.email||'') + ' ' + (s.phone||'') + ' ' + (ROLES[s.role] ? ROLES[s.role].label : s.role)).toLowerCase());
    h += '<tr data-search="' + searchKey + '">' +
      '<td>' + (i+1) + '</td>' +
      '<td><b>' + esc(s.name) + '</b></td>' +
      '<td style="font-size:12px;color:var(--text-muted);">' + esc(s.email||'-') + '</td>' +
      '<td style="font-size:12px;color:' + (s.phone?'var(--success)':'var(--danger)') + ';">' + esc(s.phone||'tanpa WA') + '</td>' +
      '<td><span class="badge ' + (r.team === 'produksi' ? 'badge-info' : 'badge-warning') + '">' + esc(r.label) + '</span></td>' +
      '<td>' +
      '<button class="btn btn-sm" onclick="openEditSiswa(\'' + cid + '\',\'' + s.id + '\')">' + ic('edit','sm') + '</button> ' +
      '<button class="btn btn-sm btn-danger" onclick="hapusSiswa(\'' + cid + '\',\'' + s.id + '\')">' + ic('trash','sm') + '</button>' +
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
   20. TAMBAH KELAS
   ============================================================ */
window.openTambahKelas = function(){
  openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label><input id="new-class" placeholder="Contoh: IX-A"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKelas()">' + ic('save') + ' Simpan</button>');
};

window.simpanKelas = function(){
  var n = (document.getElementById('new-class').value || '').trim();
  if (!n){ alert('Nama kelas wajib diisi!'); return; }
  if (DB.classes.some(function(c){ return c.name.toLowerCase() === n.toLowerCase(); })){
    alert('Nama kelas sudah ada!'); return;
  }
  var id = uid();
  var data = {
    id: id, name: n, code: genCode(n), students: [],
    teacherEmail: window.currentUser.email,
    teacherName: window.currentUser.name,
    createdAt: Date.now()
  };
  fbSet('classes', id, data).then(function(){
    closeModal();
    logActivity('class_create', 'Kelas ' + n + ' dibuat', {classId: id});
    alert('Kelas "' + n + '" berhasil dibuat!\n\nKode: ' + data.code);
  }).catch(function(e){ alert('Gagal: ' + e.message); });
};

window.hapusKelas = function(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  if (!confirm('Hapus kelas "' + c.name + '"?\n\nSemua data siswa di kelas ini akan hilang.')) return;
  fbDel('classes', cid).then(function(){ alert('Kelas dihapus'); });
};

window.salinKode = function(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  if (navigator.clipboard){
    navigator.clipboard.writeText(c.code).then(function(){ alert('Kode disalin: ' + c.code); });
  } else {
    prompt('Copy kode:', c.code);
  }
};

window.regenerateKode = function(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  if (!confirm('Generate kode baru? Kode lama tidak akan berlaku lagi.')) return;
  var nc = genCode(c.name);
  fbSet('classes', cid, Object.assign({}, c, {code: nc})).then(function(){ alert('Kode baru: ' + nc); });
};

/* ============================================================
   21. TAMBAH SISWA
   ============================================================ */
window.openTambahSiswa = function(cid){
  var opts = '<option value="">-- Pilih --</option>';
  Object.keys(ROLES).forEach(function(k){ opts += '<option value="' + k + '">' + ROLES[k].label + '</option>'; });
  openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama</label><input id="ts-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ts-email"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="ts-phone" placeholder="08123456789"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="ts-pw" value="#Smpn10smd"></div>' +
    '<div class="form-group"><label>Peran</label><select id="ts-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanSiswa(\'' + cid + '\')">' + ic('save') + ' Simpan</button>');
};

window.simpanSiswa = function(cid){
  var n = (document.getElementById('ts-name').value || '').trim();
  var e = (document.getElementById('ts-email').value || '').trim().toLowerCase();
  var ph = (document.getElementById('ts-phone').value || '').replace(/\D/g,'');
  var pw = document.getElementById('ts-pw').value;
  var r = document.getElementById('ts-role').value;
  if (!n || !e || !r){ alert('Lengkapi semua field!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email tidak valid!'); return; }

  var dup = false;
  DB.classes.forEach(function(cc){
    if ((cc.students||[]).some(function(s){ return s.email && s.email.toLowerCase() === e; })) dup = true;
  });
  if (dup){ alert('Email sudah terdaftar!'); return; }

  var c = DB.classes.find(function(x){ return x.id === cid; });
  var ns = (c.students||[]).concat([{
    id: uid(), name: n, email: e, phone: ph,
    password: pw || '#Smpn10smd', role: r, registeredAt: Date.now()
  }]);
  fbSet('classes', cid, Object.assign({}, c, {students: ns})).then(function(){
    closeModal();
    logActivity('student_add', 'Siswa ' + n + ' ditambahkan ke ' + c.name, {classId: cid});
    alert('Siswa berhasil ditambahkan!');
  });
};

window.hapusSiswa = function(cid, sid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var s = (c.students||[]).find(function(x){ return x.id === sid; });
  if (!s) return;
  if (!confirm('Hapus siswa "' + s.name + '"?')) return;
  var ns = (c.students||[]).filter(function(x){ return x.id !== sid; });
  fbSet('classes', cid, Object.assign({}, c, {students: ns})).then(function(){ alert('Dihapus'); });
};

window.openEditSiswa = function(cid, sid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var s = (c.students||[]).find(function(x){ return x.id === sid; });
  if (!s) return;
  var opts = '';
  Object.keys(ROLES).forEach(function(k){
    opts += '<option value="' + k + '" ' + (s.role === k ? 'selected' : '') + '>' + ROLES[k].label + '</option>';
  });
  openModal('Edit Siswa',
    '<div class="form-group"><label>Nama</label><input id="es-name" value="' + esc(s.name) + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="es-email" value="' + esc(s.email||'') + '"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="es-phone" value="' + esc(s.phone||'') + '"></div>' +
    '<div class="form-group"><label>Password (kosongkan jika tidak diubah)</label><input type="text" id="es-pw"></div>' +
    '<div class="form-group"><label>Peran</label><select id="es-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateSiswa(\'' + cid + '\',\'' + sid + '\')">' + ic('save') + ' Simpan</button>');
};

window.updateSiswa = function(cid, sid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var n = (document.getElementById('es-name').value || '').trim();
  var e = (document.getElementById('es-email').value || '').trim().toLowerCase();
  var ph = (document.getElementById('es-phone').value || '').replace(/\D/g,'');
  var pw = document.getElementById('es-pw').value;
  var r = document.getElementById('es-role').value;
  if (!n || !e || !r){ alert('Lengkapi!'); return; }
  var ns = (c.students||[]).map(function(s){
    if (s.id !== sid) return s;
    var u = Object.assign({}, s, {name:n, email:e, phone:ph, role:r});
    if (pw) u.password = pw;
    return u;
  });
  fbSet('classes', cid, Object.assign({}, c, {students: ns})).then(function(){
    closeModal();
    alert('Diperbarui');
  });
};

window.lihatPassword = function(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var h = '<div class="alert alert-warning">' + ic('warning') + '<div><b>RAHASIA</b> &mdash; jangan sebarkan</div></div>';
  h += '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Password</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(s){
    h += '<tr><td><b>' + esc(s.name) + '</b></td><td>' + esc(s.email||'-') + '</td><td><code>' + esc(s.password||'-') + '</code></td></tr>';
  });
  h += '</tbody></table></div>';
  openModal('Password Siswa', h);
};

/* ============================================================
   22. BROADCAST
   ============================================================ */
window.openBroadcast = function(cid){
  openModal('Broadcast Pesan',
    '<div class="form-group"><label>Judul</label><input id="bc-title"></div>' +
    '<div class="form-group"><label>Pesan</label><textarea id="bc-msg" rows="4"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="kirimBroadcast(\'' + cid + '\')">' + ic('send') + ' Kirim ke Semua Siswa</button>');
};

window.kirimBroadcast = function(cid){
  var t = (document.getElementById('bc-title').value || '').trim();
  var m = (document.getElementById('bc-msg').value || '').trim();
  if (!t || !m){ alert('Lengkapi!'); return; }
  fbSet('notifications', uid(), {
    id: uid(), classId: cid,
    fromName: window.currentUser.name,
    fromType: window.currentUser.type,
    toId: 'all', type: 'info',
    title: t, message: m,
    createdAt: Date.now(), readBy: [], doneBy: []
  }).then(function(){
    closeModal();
    alert('Broadcast terkirim!');
  });
};

/* ============================================================
   23. GURU MANAGEMENT
   ============================================================ */
window.openTambahGuru = function(){
  openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="tg-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="tg-email"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="tg-pw" value="#Smpn10smd"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanGuru()">' + ic('save') + ' Simpan</button>');
};

window.simpanGuru = function(){
  var n = (document.getElementById('tg-name').value || '').trim();
  var e = (document.getElementById('tg-email').value || '').trim().toLowerCase();
  var p = document.getElementById('tg-pw').value;
  if (!n || !e || !p){ alert('Lengkapi!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email tidak valid!'); return; }
  fbSet('teachers', e, {name:n, email:e, password:p}).then(function(){
    closeModal();
    alert('Guru ditambahkan');
  });
};

window.openEditGuru = function(email){
  var t = DB.teachers.find(function(x){ return x.email === email; });
  if (!t) return;
  openModal('Edit Guru',
    '<div class="form-group"><label>Nama</label><input id="eg-name" value="' + esc(t.name) + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="eg-email" value="' + esc(t.email) + '"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="eg-pw" value="' + esc(t.password||'') + '"></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateGuru(\'' + esc(email) + '\')">' + ic('save') + ' Simpan</button>');
};

window.updateGuru = function(oldEmail){
  var n = (document.getElementById('eg-name').value || '').trim();
  var e = (document.getElementById('eg-email').value || '').trim().toLowerCase();
  var p = document.getElementById('eg-pw').value;
  fbSet('teachers', e, {name:n, email:e, password:p}).then(function(){
    if (oldEmail !== e) fbDel('teachers', oldEmail);
    closeModal();
    alert('Diperbarui');
  });
};

window.hapusGuru = function(email){
  if (!confirm('Hapus guru ' + email + '?')) return;
  fbDel('teachers', email).then(function(){ alert('Guru dihapus'); });
};

/* ============================================================
   24. ACTIVITY LOG
   ============================================================ */
window.openActivityLog = function(){
  var logs = (DB.activityLogs||[]).slice(0, 100);
  var mine = myClasses().map(function(c){ return c.id; });
  if (window.currentUser.type === 'guru' && mine.length > 0){
    logs = logs.filter(function(l){ return !l.classId || mine.indexOf(l.classId) >= 0; });
  }
  var h = '<div class="alert alert-info">' + ic('info') + '<div>Riwayat aktivitas sistem</div></div>';
  if (logs.length === 0){
    h += '<div class="empty-state">' + ic('activity',40) + '<p>Belum ada aktivitas</p></div>';
  } else {
    h += '<div class="activity-feed">';
    logs.forEach(function(l){
      h += '<div class="activity-item"><div class="activity-icon">' + ic('activity','sm') + '</div>' +
        '<div class="activity-content"><div class="activity-msg">' + esc(l.message) + '</div>' +
        '<div class="activity-meta"><b>' + esc(l.userName||'-') + '</b> &middot; ' + fmtDate(l.createdAt) + '</div></div></div>';
    });
    h += '</div>';
  }
  openModal('Log Aktivitas', h);
};

/* ============================================================
   25. MENU
   ============================================================ */
window.openMainMenu = function(){
  if (window.currentUser.type === 'admin') return openAdminMenu();
  if (window.currentUser.type === 'guru') return openGuruMenu();
  return openSiswaMenu();
};

function openGuruMenu(){
  openModal('Menu Guru',
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openActivityLog()">' + ic('activity') + ' Log Aktivitas</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openImportSiswa(window.__currentViewClassId)">' + ic('upload') + ' Import Siswa</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openStrukturKerabatKerja(window.__currentViewClassId)">' + ic('award') + ' Struktur Kerabat</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openChangePassword()">' + ic('key') + ' Ubah Password</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();logout()">' + ic('out') + ' Keluar</button>' +
    '</div>');
}

function openSiswaMenu(){
  var role = window.currentUser.role;

  // Daftar menu — pakai cek keberadaan fungsi
  var items = [
    { i:'checkSquare', l:'Checklist Pribadi', f:'openChecklistPribadi' },
    { i:'users',       l:'Checklist Tim',     f:'openChecklistTim' },
    { i:'edit',        l:'Beri Nilai Rekan',  f:'openPenilaianSiswaDashboard' },
    { i:'award',       l:'Kerabat Kerja',     f:'openStrukturKerabatKerja' },
    { i:'fileText',    l:'Dokumen Saya',      f:'openDokumenSaya' },
    { i:'book',        l:'Arsip Naskah',      f:'openNaskahList' },
    { i:'calendar',    l:'Absensi',           f:'openMeetingList' },
    { i:'briefcase',   l:'Booking Alat Musik',f:'openBookingAlat' },
    { i:'calendar',    l:'Master Schedule',   f:'openMasterSchedule' },
    { i:'image',       l:'Kalender Konten',   f:'openKalenderKonten' },
    { i:'chart',       l:'Keuangan',          f:'openKeuangan' },
    { i:'key',         l:'Ubah Password',     f:'openChangePassword' },
    { i:'out',         l:'Keluar',            f:'logout' }
  ];

  var h = '<div style="display:flex;flex-direction:column;gap:8px;">';
  items.forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;text-align:left;" ' +
      'onclick="closeModal();window.__menuAction(\'' + it.f + '\')">' +
      ic(it.i) + ' ' + it.l + '</button>';
  });
  h += '</div>';
  openModal('Menu Siswa', h);
}

// Helper untuk panggil fungsi menu — cek dulu ada atau tidak
window.__menuAction = function(fnName){
  if (typeof window[fnName] === 'function'){
    try {
      window[fnName]();
    } catch(e){
      console.error('[menu]', fnName, e);
      alert('Gagal membuka fitur: ' + e.message);
    }
  } else {
    alert('Fitur "' + fnName + '" belum tersedia.\n\nSilakan update aplikasi atau hubungi guru.');
  }
};

function openAdminMenu(){
  openModal('Menu Admin',
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openTambahGuru()">' + ic('personPlus') + ' Tambah Guru</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openActivityLog()">' + ic('activity') + ' Aktivitas</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();logout()">' + ic('out') + ' Keluar</button>' +
    '</div>');
}

/* ============================================================
   26. PANDUAN
   ============================================================ */
window.openPanduan = function(){
  var h = '';

  // ===== HEADER =====
  h += '<div style="text-align:center;padding:20px 16px;background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));border-radius:14px;margin-bottom:16px;">' +
    '<div style="font-size:22px;margin-bottom:6px;">' + ic('book', 32) + '</div>' +
    '<div style="font-size:17px;font-weight:800;color:var(--text-strong);">Panduan SP-PPT</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);margin-top:4px;">Sistem Penilaian Proyek Produksi Teater</div>' +
    '<div style="font-size:11.5px;color:var(--text-muted);">SMP Negeri 10 Samarinda</div>' +
  '</div>';

  // ===== TENTANG SISTEM =====
  h += '<div class="card" style="border-left:4px solid var(--primary);">' +
    '<h3>' + ic('info') + ' Tentang Sistem</h3>' +
    '<p style="font-size:12.5px;line-height:1.7;margin-bottom:8px;">' +
    'SP-PPT adalah sistem untuk mengelola <b>proyek produksi teater kelas</b>. ' +
    'Setiap siswa punya peran (<b>jobdesk</b>) dan bertanggung jawab menyelesaikan tugas sesuai peran tersebut.' +
    '</p>' +
    '<div style="background:var(--surface);padding:10px 12px;border-radius:8px;font-size:12px;line-height:1.8;">' +
      '<b>Bobot Nilai Akhir:</b><br>' +
      '&bull; <b>Guru</b> : 40% (Pimpro &amp; Sutradara)<br>' +
      '&bull; <b>Ketua</b> : 30% (Pimpro &amp; Sutradara nilai semua)<br>' +
      '&bull; <b>Rekan</b> : 30% (atasan + peer sekawan)<br>' +
      '&bull; <b>Faktor Kehadiran</b> : 0.75 - 1.0 (auto-multiply)' +
    '</div>' +
  '</div>';

  // ===== LOGIN =====
  h += '<details class="card" style="border-left:4px solid var(--success);">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:14px;">' + ic('lock') + ' Cara Login</summary>' +
    '<div style="margin-top:12px;font-size:12.5px;line-height:1.8;">' +
      '<b style="color:var(--primary);">GURU:</b><br>' +
      '1. Buka aplikasi → tab <b>Guru</b><br>' +
      '2. Masukkan <b>email guru</b> + password<br>' +
      '3. Klik <b>Masuk sebagai Guru</b><br><br>' +
      '<b style="color:var(--primary);">SISWA:</b><br>' +
      '1. Pilih kelas → tab <b>Siswa</b><br>' +
      '2. Masukkan <b>email</b> ATAU <b>No. WA</b><br>' +
      '3. Masukkan password<br>' +
      '4. Klik <b>Masuk sebagai Siswa</b><br><br>' +
      '<b style="color:var(--danger);">Lupa Password?</b><br>' +
      'Klik <b>"Lupa Password?"</b> di bawah tombol login → masukkan email → kode 6 digit muncul → reset.' +
    '</div>' +
  '</details>';

  // ===== UNTUK SISWA =====
  h += '<div class="card" style="border-left:4px solid var(--info);margin-top:14px;">' +
    '<h3>' + ic('user') + ' Untuk Siswa</h3>';

  // 1. Dashboard
  h += '<details style="margin-top:10px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">1. Dashboard Siswa</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Setelah login, Anda melihat:<br>' +
    '&bull; Nama, kelas, peran Anda<br>' +
    '&bull; <b>Tahapan Aktif</b> — klik untuk beri nilai rekan<br>' +
    '&bull; <b>Deadline &amp; Tugas</b> dari guru<br>' +
    '&bull; <b>Master Timeline</b> — agenda produksi dari Pimpro/Sekretaris' +
    '</div></details>';

  // 2. Checklist
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">2. Checklist (Saya &amp; Tim)</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '<b>Checklist Pribadi:</b><br>' +
    'Tugas pribadi yang Anda buat sendiri.<br>' +
    '&bull; Menu → <b>Checklist Saya</b><br>' +
    '&bull; Klik <b>Ambil dari Template</b> (rekomendasi tugas per peran)<br>' +
    '&bull; Atau <b>Tambah Manual</b><br>' +
    '&bull; Centang item yang sudah selesai<br><br>' +
    '<b>Checklist Tim:</b><br>' +
    'Tugas kolaboratif seluruh tim (hanya pengurus inti &amp; koor bisa centang).<br>' +
    '&bull; Menu → <b>Checklist Tim</b><br>' +
    '&bull; Lihat tugas sesuai peran + peer<br>' +
    '&bull; Centang yang sudah dikerjakan' +
    '</div></details>';

  // 3. Beri Nilai
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">3. Beri Nilai Rekan</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Nilai rekan sesuai rubrik per peran.<br>' +
    '&bull; Menu → <b>Beri Nilai</b><br>' +
    '&bull; Pilih tahap (Perencanaan / Pelaksanaan / Pertunjukan / Evaluasi)<br>' +
    '&bull; Pilih rekan target<br>' +
    '&bull; Isi rubrik (skala 1-4)<br>' +
    '&bull; Klik <b>Simpan Penilaian</b><br><br>' +
    '<div style="padding:8px;background:var(--warning-soft);border-radius:6px;border-left:3px solid var(--warning);">' +
    ic('warning','sm') + ' <b>Ingat:</b> Nilai berdasarkan <b>BUKTI NYATA</b>, bukan suka/duka!' +
    '</div></div></details>';

  // 4. Absensi
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">4. Absensi</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Isi kehadiran sesi rapat/latihan/gladi.<br>' +
    '&bull; Menu → <b>Absensi</b><br>' +
    '&bull; Pilih sesi hari ini<br>' +
    '&bull; Pilih status: Hadir / Izin / Sakit / Telat / Tidak Hadir<br><br>' +
    '<div style="padding:8px;background:var(--info-soft);border-radius:6px;border-left:3px solid var(--info);">' +
    ic('info','sm') + ' <b>Kehadiran memengaruhi nilai akhir</b> (faktor pengali 0.75 - 1.0).' +
    '</div></div></details>';

  // 5. Kerabat Kerja
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">5. Kerabat Kerja</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Struktur organisasi teater kelas Anda.<br>' +
    '&bull; Menu → <b>Kerabat Kerja</b> (atau klik floating button)<br>' +
    '&bull; Lihat struktur per <b>jobdesk</b> (bukan per divisi)<br>' +
    '&bull; Level: Pimpinan → Wakil → Koor → Anggota<br>' +
    '&bull; Posisi Anda di-highlight biru<br>' +
    '&bull; Klik ikon telepon untuk chat WA langsung' +
    '</div></details>';

  // 6. Dokumen
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">6. Dokumen Saya</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Template dokumen profesional per peran.<br>' +
    '&bull; Menu → <b>Dokumen Saya</b><br>' +
    '&bull; <b>Download Template</b> (Word/Excel)<br>' +
    '&bull; Kerjakan di luar aplikasi<br>' +
    '&bull; <b>Upload Hasil</b> (.pdf / .docx, maks 1 MB)<br><br>' +
    '<div style="padding:8px;background:var(--warning-soft);border-radius:6px;border-left:3px solid var(--warning);">' +
    ic('info','sm') + ' <b>Catatan:</b> Logo di template muncul sebagai placeholder (kotak dashed). Ganti manual dengan logo asli setelah buka di Word.' +
    '</div></div></details>';

  // 7. Naskah
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">7. Arsip Naskah</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Naskah teater dari Sutradara.<br>' +
    '&bull; Menu → <b>Arsip Naskah</b><br>' +
    '&bull; <b>Sutradara/Guru</b>: upload naskah baru<br>' +
    '&bull; <b>Semua</b>: bisa baca &amp; download' +
    '</div></details>';

  // 8. Booking
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">8. Booking Alat Musik</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Khusus Pimpro, Koor Musik, Sutradara, Koor Perlengkapan.<br>' +
    '&bull; Menu → <b>Booking Alat Musik</b><br>' +
    '&bull; Pilih alat, tanggal, jam<br>' +
    '&bull; Sistem <b>otomatis cek bentrok</b> antar kelas<br>' +
    '&bull; Kelas lain tidak bisa pinjam alat sama di jam sama' +
    '</div></details>';

  // 9. Master Schedule
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">9. Master Schedule / Timeline</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Timeline produksi dari Pimpro/Sekretaris.<br>' +
    '&bull; Menu → <b>Master Schedule</b><br>' +
    '&bull; Agenda per bulan/minggu/hari<br>' +
    '&bull; Termasuk jadwal latihan, konten, rapat<br>' +
    '&bull; Bisa digeser untuk lihat slide berbeda' +
    '</div></details>';

  // 10. Aduan
  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">10. Aduan</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    'Lapor masalah signifikan (perundungan, kerusakan, dll).<br>' +
    '&bull; Klik tombol merah <b>Aduan</b> di kanan bawah<br>' +
    '&bull; Isi kategori + detail<br>' +
    '&bull; Otomatis terkirim ke guru via notifikasi + WA<br>' +
    '&bull; Riwayat aduan muncul di menu' +
    '</div></details>';

  h += '</div>';

  // ===== UNTUK GURU =====
  h += '<div class="card" style="border-left:4px solid var(--success);margin-top:14px;">' +
    '<h3>' + ic('shield') + ' Untuk Guru</h3>';

  h += '<details style="margin-top:10px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">1. Kelola Kelas</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '&bull; Dashboard → <b>Tambah Kelas</b> → dapat kode kelas<br>' +
    '&bull; Bagikan kode ke siswa untuk daftar mandiri<br>' +
    '&bull; Klik kelas → kelola siswa, checklist, penilaian<br>' +
    '&bull; Tombol <b>Import</b> untuk import siswa via Excel' +
    '</div></details>';

  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">2. Kelola Tahapan</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '&bull; Kelas → <b>Kelola Tahapan</b><br>' +
    '&bull; Tambah/edit/hapus tahapan<br>' +
    '&bull; Aktifkan tahap (toggle) agar siswa bisa menilai<br>' +
    '&bull; Atur deadline per tahap<br>' +
    '&bull; Total bobot idealnya 100%' +
    '</div></details>';

  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">3. Penilaian &amp; Rekap</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '&bull; Guru menilai <b>Pimpinan Produksi &amp; Sutradara</b><br>' +
    '&bull; Kelas → <b>Penilaian</b> → pilih target → isi rubrik<br>' +
    '&bull; Kelas → <b>Rekap</b> → lihat nilai lengkap semua siswa<br>' +
    '&bull; <b>Export Excel</b> untuk arsip' +
    '</div></details>';

  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">4. Kelola Checklist</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '&bull; Kelas → <b>Checklist</b><br>' +
    '&bull; <b>Tambah</b> item manual per peran<br>' +
    '&bull; <b>Ambil Master</b> — auto-generate 12 peran × 4 fase<br>' +
    '&bull; <b>Broadcast</b> ke siswa<br>' +
    '&bull; <b>Copy Kelas</b> dari kelas lain' +
    '</div></details>';

  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">5. Absensi, Broadcast, Aduan</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '&bull; <b>Absensi</b>: buat sesi rapat/latihan/gladi<br>' +
    '&bull; <b>Broadcast</b>: kirim pengumuman ke semua siswa<br>' +
    '&bull; <b>Aduan</b>: lihat &amp; balas aduan siswa<br>' +
    '&bull; <b>Log WA</b>: riwayat komunikasi WhatsApp' +
    '</div></details>';

  h += '<details style="margin-top:6px;background:var(--surface);border-radius:8px;padding:10px;">' +
    '<summary style="cursor:pointer;font-weight:700;font-size:13px;">6. Struktur Kerabat</summary>' +
    '<div style="margin-top:8px;font-size:12.5px;line-height:1.7;">' +
    '&bull; Kelas → <b>Kerabat</b> (atau Menu → Struktur)<br>' +
    '&bull; Upload <b>logo</b> kerabat<br>' +
    '&bull; Edit <b>nama</b> &amp; deskripsi<br>' +
    '&bull; <b>Auto-Fill</b> dari data siswa<br>' +
    '&bull; <b>Export Excel</b>' +
    '</div></details>';

  h += '</div>';

  // ===== ATURAN EMAS =====
  h += '<div class="card" style="border-left:4px solid var(--warning);margin-top:14px;">' +
    '<h3>' + ic('star') + ' Aturan Emas</h3>' +
    '<ol style="font-size:12.5px;line-height:1.9;padding-left:20px;">' +
    '<li>Maksimal <b>1 jam</b> per sesi latihan</li>' +
    '<li>Maksimal <b>2x latihan</b> per minggu</li>' +
    '<li><b>Tidak ada latihan</b> saat ujian</li>' +
    '<li>Iuran kas bersifat <b>sukarela</b></li>' +
    '<li>Manfaatkan <b>material bekas</b></li>' +
    '<li><b>Transparansi</b> keuangan wajib</li>' +
    '<li>Nilai berdasarkan <b>bukti nyata</b>, bukan suka/duka</li>' +
    '<li>Hormati semua peran &amp; jobdesk</li>' +
    '</ol>' +
  '</div>';

  // ===== KENDALA UMUM =====
  h += '<div class="card" style="border-left:4px solid var(--info);margin-top:14px;">' +
    '<h3>' + ic('info') + ' Kendala Umum</h3>' +
    '<table style="width:100%;font-size:12px;border-collapse:collapse;">' +
    '<tr style="background:var(--surface);"><th style="padding:8px;text-align:left;border-bottom:1px solid var(--border);">Masalah</th>' +
    '<th style="padding:8px;text-align:left;border-bottom:1px solid var(--border);">Solusi</th></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Tidak bisa login</td>' +
    '<td style="padding:8px;border-bottom:1px solid var(--border);">Hubungi Bendahara untuk reset password</td></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Lupa password</td>' +
    '<td style="padding:8px;border-bottom:1px solid var(--border);">Klik "Lupa Password?" di login → kode muncul → reset</td></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Menu tidak muncul</td>' +
    '<td style="padding:8px;border-bottom:1px solid var(--border);">Refresh aplikasi (Ctrl+Shift+R)</td></tr>' +
    '<tr><td style="padding:8px;border-bottom:1px solid var(--border);">Nilai tidak tersimpan</td>' +
    '<td style="padding:8px;border-bottom:1px solid var(--border);">Cek koneksi internet, ulangi</td></tr>' +
    '<tr><td style="padding:8px;">Upload file gagal</td>' +
    '<td style="padding:8px;">Pastikan file &lt; 1 MB, format PDF/DOCX</td></tr>' +
    '</table>' +
  '</div>';

  openModal('Panduan Sistem', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   27. FIRESTORE SUBSCRIBE
   ============================================================ */
function subscribe(){
  if (!firebaseReady) return;

  fb.collection('teachers').onSnapshot(function(snap){
    DB.teachers = snap.docs.map(function(d){ return d.data(); });
    if (DB.teachers.length === 0){
      DEFAULT_TEACHERS.forEach(function(t){ fbSet('teachers', t.email, t); });
    }
    if (window.currentUser && window.currentUser.type === 'admin') renderAdminDash();
  }, function(e){ console.warn('[teachers]', e.message); });

  fb.collection('classes').onSnapshot(function(snap){
    DB.classes = snap.docs.map(function(d){
      var o = d.data(); o.id = d.id; return o;
    });
    refreshClassDropdown();
    if (window.currentUser){
      if (window.currentUser.type === 'guru'){
        if (window.__currentViewClassId) viewClass(window.__currentViewClassId);
        else renderGuruDash();
      } else if (window.currentUser.type === 'admin'){
        renderAdminDash();
      } else if (window.currentUser.type === 'siswa'){
        var c = DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
        if (c){
          var s = (c.students||[]).find(function(x){ return x.id === window.currentUser.studentId; });
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

  fb.collection('evaluations').onSnapshot(function(snap){
    var ev = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId, tid = dt.targetId;
      if (!cid || !tid) return;
      ev[cid] = ev[cid] || {};
      ev[cid][tid] = ev[cid][tid] || {};
      for (var k in dt){
        if (k !== 'classId' && k !== 'targetId') ev[cid][tid][k] = dt[k];
      }
    });
    DB.evaluations = ev;
  }, function(e){ console.warn('[evaluations]', e.message); });

  fb.collection('deadlines').onSnapshot(function(snap){
    var dl = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId || d.id, obj = {};
      for (var k in dt){ if (k !== 'classId') obj[k] = dt[k]; }
      dl[cid] = obj;
    });
    DB.deadlines = dl;
  }, function(e){ console.warn('[deadlines]', e.message); });

  fb.collection('activeStages').onSnapshot(function(snap){
    var a = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId || d.id, obj = {};
      if (Array.isArray(dt.activeIds)){
        obj.activeIds = dt.activeIds;
        dt.activeIds.forEach(function(id){ obj[id] = true; });
      } else {
        for (var k in dt){ if (k !== 'classId') obj[k] = dt[k]; }
        obj.activeIds = Object.keys(obj).filter(function(k){ return obj[k] === true && k.indexOf('stage') === 0; });
      }
      a[cid] = obj;
    });
    DB.activeStages = a;
  }, function(e){ console.warn('[activeStages]', e.message); });

  fb.collection('notifications').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.notifications = snap.docs.map(function(d){ return d.data(); });
    updateBadge();
    var np = document.getElementById('notif-panel');
    if (np && np.classList.contains('open')) renderNotifPanel();
  }, function(e){ console.warn('[notifications]', e.message); });

  fb.collection('config').doc('stages').onSnapshot(function(doc){
    if (doc.exists && doc.data().stages) DB.stages = doc.data().stages;
    else fbSet('config', 'stages', {stages: DB.stages});
  }, function(e){ console.warn('[config]', e.message); });

  fb.collection('checklists').onSnapshot(function(snap){
    var ch = {};
    snap.docs.forEach(function(d){
      var dt = d.data();
      ch[dt.classId || d.id] = {items: dt.items || []};
    });
    DB.checklists = ch;
  }, function(e){ console.warn('[checklists]', e.message); });

  fb.collection('meetings').onSnapshot(function(snap){
    var m = {};
    snap.docs.forEach(function(d){ m[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.meetings = m;
  }, function(e){ console.warn('[meetings]', e.message); });

  fb.collection('activity_logs').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.activityLogs = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    if (window.currentUser && window.currentUser.type === 'guru' && !window.__currentViewClassId) renderGuruDash();
  }, function(e){ console.warn('[activity_logs]', e.message); });

  fb.collection('bookings').onSnapshot(function(snap){
    var b = {};
    snap.docs.forEach(function(d){ b[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.bookings = b;
  }, function(e){ console.warn('[bookings]', e.message); });

  fb.collection('coordination').onSnapshot(function(snap){
    var c = {};
    snap.docs.forEach(function(d){ c[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.coordination = c;
  }, function(e){ console.warn('[coordination]', e.message); });

  fb.collection('aduan').onSnapshot(function(snap){
    var a = {};
    snap.docs.forEach(function(d){ a[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.aduan = a;
  }, function(e){ console.warn('[aduan]', e.message); });

  fb.collection('wa_logs').onSnapshot(function(snap){
    var w = {};
    snap.docs.forEach(function(d){ w[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.waLogs = w;
  }, function(e){ console.warn('[wa_logs]', e.message); });
}

/* ============================================================
   28. BOOT
   ============================================================ */
function boot(){
  console.log('[app.js] Boot v14.0...');

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
          var tt = DB.teachers.find(function(x){
            return x.email && x.email.toLowerCase() === String(sess.email||'').toLowerCase();
          });
          if (tt){
            window.currentUser = {type:'guru', email:tt.email, name:tt.name, phone:tt.phone||''};
            showApp();
            return;
          }
        }
        if (sess.type === 'admin'){
          window.currentUser = {type:'admin', email:sess.email, name:sess.name};
          showApp();
          return;
        }
        if (sess.type === 'siswa'){
          var c = DB.classes.find(function(x){ return x.id === sess.classId; });
          if (c){
            var s = (c.students||[]).find(function(x){ return x.id === sess.studentId; });
            if (s){
              window.currentUser = {type:'siswa', classId: c.id, studentId: s.id, name: s.name, role: s.role, phone: s.phone||''};
              showApp();
              return;
            }
          }
        }
        showLoginPage();
      }, 500);
    } else {
      setTimeout(showLoginPage, 500);
    }
  }, 800);
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.__forceHideLoading = function(){
  var l = document.getElementById('loading-screen');
  if (l){
    l.style.transition = 'opacity .3s';
    l.style.opacity = '0';
    setTimeout(function(){ l.style.display = 'none'; }, 300);
  }
};
setTimeout(window.__forceHideLoading, 3500);

console.log('[app.js] v14.0 CLEAN loaded');

})();
/* ============================================================
   TIMELINE UNTUK DASHBOARD — Baca dari Master Schedule
   ============================================================ */
window.renderMasterTimelineForDashboard = function(cid, targetElementId){
  var el = document.getElementById(targetElementId);
  if (!el) return;

  var c = findClass(cid);
  if (!c){ el.innerHTML = ''; return; }

  // Ambil data dari berbagai sumber
  var ms = (window.getMasterSchedule ? window.getMasterSchedule(cid) : null) || {items: []};
  var jadwalLatihan = (window.getJadwalLatihanData ? window.getJadwalLatihanData(cid) : null) || {items: []};
  var konten = (window.getKalenderKonten ? window.getKalenderKonten(cid) : null) || {items: []};
  var meetings = Object.values(window.DB.meetings || {}).filter(function(m){ return m.classId === cid; });

  var totalItems = (ms.items||[]).length + (jadwalLatihan.items||[]).length + (konten.items||[]).length + meetings.length;

  if (totalItems === 0){
    el.innerHTML = '<div class="alert alert-info">' + ic('info') + '<div><b>Master Timeline belum tersedia</b><br><small>Timeline akan muncul setelah Pimpinan Produksi / Sekretaris mengisi agenda.</small></div></div>';
    return;
  }

  // Sort semua event
  var events = [];

  // Master Schedule (bulan/minggu/hari)
  (ms.items || []).forEach(function(it){
    var periode = { '2025-10': 'Okt 2025', '2025-11': 'Nov 2025', '2025-12': 'Des 2025', '2026-01': 'Jan 2026' }[it.monthKey] || it.monthKey;
    events.push({
      tanggal: periode + ' — Minggu ' + it.weekNumber + ', H' + it.day,
      dateKey: it.monthKey + '-' + String(it.weekNumber).padStart(2,'0') + '-' + String(it.day).padStart(2,'0'),
      title: it.title,
      pic: it.pic,
      desc: it.desc,
      type: 'Agenda',
      icon: 'calendar',
      color: '#2563eb'
    });
  });

  // Jadwal Latihan
  (jadwalLatihan.items || []).forEach(function(it){
    events.push({
      tanggal: fmtDateShort(it.date) + (it.time ? ' ' + it.time : ''),
      dateKey: it.date || '',
      title: it.title,
      pic: it.createdBy,
      desc: it.adegan ? 'Adegan: ' + it.adegan : (it.note || ''),
      type: 'Latihan',
      icon: 'target',
      color: '#10b981'
    });
  });

  // Kalender Konten
  (konten.items || []).forEach(function(it){
    events.push({
      tanggal: fmtDateShort(it.date),
      dateKey: it.date || '',
      title: it.title,
      pic: it.pic,
      desc: it.platform + ' — ' + it.type,
      type: 'Konten',
      icon: 'image',
      color: '#0ea5e9'
    });
  });

  // Meetings
  meetings.forEach(function(m){
    events.push({
      tanggal: fmtDateShort(m.date) + (m.openTime ? ' ' + m.openTime : ''),
      dateKey: m.date || '',
      title: m.title,
      pic: m.createdBy,
      desc: 'Jenis: ' + (m.type || '-'),
      type: 'Absensi',
      icon: 'clipboard',
      color: '#f59e0b'
    });
  });

  // Sort by dateKey
  events.sort(function(a, b){ return (a.dateKey||'').localeCompare(b.dateKey||''); });

  // Render
  var h = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">';
  h += '<div style="font-size:12.5px;color:var(--text-muted);">' + events.length + ' agenda terurut</div>';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
    '<span class="badge" style="background:rgba(37,99,235,.15);color:#2563eb;">' + ic('calendar','sm') + ' Agenda</span>' +
    '<span class="badge" style="background:rgba(16,185,129,.15);color:#10b981;">' + ic('target','sm') + ' Latihan</span>' +
    '<span class="badge" style="background:rgba(14,165,233,.15);color:#0ea5e9;">' + ic('image','sm') + ' Konten</span>' +
    '<span class="badge" style="background:rgba(245,158,11,.15);color:#f59e0b;">' + ic('clipboard','sm') + ' Absensi</span>' +
    '</div>';
  h += '</div>';

  // Timeline list
  h += '<div style="position:relative;padding-left:36px;">';
  h += '<div style="position:absolute;left:14px;top:8px;bottom:8px;width:2px;background:var(--border);"></div>';

  events.slice(0, 15).forEach(function(e){
    h += '<div style="position:relative;margin-bottom:16px;">' +
      '<div style="position:absolute;left:-30px;top:2px;width:32px;height:32px;border-radius:50%;background:' + e.color + ';color:#fff;display:flex;align-items:center;justify-content:center;border:3px solid var(--card);z-index:1;">' +
        ic(e.icon, 14) +
      '</div>' +
      '<div style="background:var(--surface);border-radius:8px;padding:12px;border-left:3px solid ' + e.color + ';">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px;">' +
          '<div style="font-size:11.5px;font-weight:700;color:' + e.color + ';">' + e.type.toUpperCase() + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + esc(e.tanggal) + '</div>' +
        '</div>' +
        '<div style="font-weight:700;font-size:13px;color:var(--text-strong);margin-bottom:4px;">' + esc(e.title) + '</div>' +
        (e.pic ? '<div style="font-size:11.5px;color:var(--text-muted);">PIC: ' + esc(e.pic) + '</div>' : '') +
        (e.desc ? '<div style="font-size:12px;color:var(--text);margin-top:4px;">' + esc(e.desc) + '</div>' : '') +
      '</div>' +
    '</div>';
  });

  if (events.length > 15){
    h += '<div style="text-align:center;font-size:12px;color:var(--text-muted);padding:8px;">+' + (events.length - 15) + ' agenda lainnya</div>';
  }

  h += '</div></div>';

  el.innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons(el);
};
