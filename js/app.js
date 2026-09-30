/* ============================================================
   SP-PPT app.js — v10.0 FINAL
   Integrasi: Sistem Tahapan + Penilaian + Struktur + Dashboard
   ============================================================ */
(function(){
'use strict';

/* ===== FORCE HIDE LOADING ===== */
var hidden = false;
function forceHide(){
  if (hidden) return; hidden = true;
  var l = document.getElementById('loading-screen');
  if (l){ l.style.transition='opacity .3s'; l.style.opacity='0'; setTimeout(function(){ l.style.display='none'; }, 350); }
}
setTimeout(forceHide, 3000);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(forceHide, 800); });
else setTimeout(forceHide, 800);
window.__forceHideLoading = forceHide;

window.addEventListener('error', function(e){
  console.error('Global error:', e.message);
  if (window.__forceHideLoading) window.__forceHideLoading();
});

/* ===== ICON SYSTEM ===== */
function ico(n, s){
  var POOL = window.ICONS || {};
  var path = POOL[n] || POOL.info || '<circle cx="12" cy="12" r="10"/>';
  var size = s;
  if (size === 'sm') size = 13;
  else if (size === 'lg') size = 20;
  else if (size === 'md') size = 16;
  else if (typeof size !== 'number') size = 16;
  return '<svg xmlns="http://www.w3.org/2000/svg" class="ico" width="' + size + '" height="' + size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;' +
    'flex-shrink:0;width:' + size + 'px;height:' + size + 'px;">' + path + '</svg>';
}

/* ===== THEME ===== */
var THEME_KEY = 'sppt_theme';
function setTheme(m){
  localStorage.setItem(THEME_KEY, m);
  applyTheme(m);
  document.querySelectorAll('.theme-toggle button').forEach(function(b){
    b.classList.toggle('active', b.dataset.theme === m);
  });
}
function applyTheme(m){
  var a = m;
  if (m === 'auto') a = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', a);
}
function initTheme(){
  var s = localStorage.getItem(THEME_KEY) || 'auto';
  applyTheme(s);
  document.querySelectorAll('.theme-toggle button').forEach(function(b){
    b.classList.toggle('active', b.dataset.theme === s);
  });
}

/* ===== NAV ===== */
function showLoginPage(){
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.add('hidden');
  if (window.__forceHideLoading) window.__forceHideLoading();
}
function showRegisterPage(){
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
  refreshDaftarRoles();
}
function switchLoginTab(t){
  ['guru','siswa','admin'].forEach(function(x){
    var tb = document.getElementById('tab-login-' + x);
    var fm = document.getElementById('form-login-' + x);
    if (tb) tb.classList.toggle('active', x === t);
    if (fm) fm.classList.toggle('hidden', x !== t);
  });
}
function togglePw(id, b){
  var i = document.getElementById(id);
  if (!i) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  b.innerHTML = ico(i.type === 'password' ? 'eye' : 'x', 16);
}

/* ===== CONFIG ===== */
var ADMIN_ACCOUNT = {
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar Arrazaq, S.Sn. (Admin)'
};
var DEFAULT_TEACHERS = [{
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar Arrazaq, S.Sn.'
}];
var DEFAULT_STUDENT_PASSWORD = '#Smpn10smd';

var DEFAULT_STAGES = [
  {id:'stage1',name:'Perencanaan',subtitle:'Pra-Produksi',description:'Penyusunan konsep, jadwal, RAB, dan pembagian tugas.',weight:20,longDesc:'Tahap perencanaan sebelum latihan dimulai.'},
  {id:'stage2',name:'Pelaksanaan',subtitle:'Produksi & Latihan',description:'Latihan rutin, eksekusi tugas, dan koordinasi tim.',weight:35,longDesc:'Tahap terlama dalam proyek. Termasuk absensi 15%.'},
  {id:'stage3',name:'Pertunjukan',subtitle:'Show Time',description:'Penampilan panggung pada hari-H pertunjukan.',weight:35,longDesc:'Hari puncak pertunjukan teater.'},
  {id:'stage4',name:'Evaluasi',subtitle:'Pasca-Produksi',description:'Laporan, dokumentasi, dan refleksi akhir.',weight:10,longDesc:'Tahap akhir setelah pertunjukan.'}
];

var ROLES = {
  pimpinan_produksi:{label:'Pimpinan Produksi',team:'produksi'},
  sekretaris:{label:'Sekretaris',team:'produksi'},
  bendahara:{label:'Bendahara',team:'produksi'},
  koor_publikasi:{label:'Divisi Publikasi dan Dokumentasi',team:'produksi'},
  koor_perlengkapan:{label:'Divisi Perlengkapan',team:'produksi'},
  koor_akomodasi:{label:'Divisi Akomodasi dan Transportasi',team:'produksi'},
  anggota_publikasi:{label:'Anggota Divisi Publikasi dan Dokumentasi',team:'produksi'},
  anggota_perlengkapan:{label:'Anggota Divisi Perlengkapan',team:'produksi'},
  anggota_akomodasi:{label:'Anggota Divisi Akomodasi dan Transportasi',team:'produksi'},
  sutradara:{label:'Sutradara',team:'artistik'},
  asisten_sutradara:{label:'Asisten Sutradara',team:'artistik'},
  pemain:{label:'Pemeran',team:'artistik'},
  koor_panggung:{label:'Divisi Tata Pentas dan Panggung',team:'artistik'},
  koor_musik:{label:'Divisi Tata Musik dan Suara',team:'artistik'},
  koor_busana:{label:'Divisi Tata Busana',team:'artistik'},
  koor_rias:{label:'Divisi Tata Rias',team:'artistik'},
  koor_cahaya:{label:'Divisi Tata Cahaya',team:'artistik'},
  anggota_panggung:{label:'Anggota Divisi Tata Pentas',team:'artistik'},
  anggota_musik:{label:'Anggota Divisi Tata Musik dan Suara',team:'artistik'},
  anggota_busana:{label:'Anggota Divisi Tata Busana',team:'artistik'},
  anggota_rias:{label:'Anggota Divisi Tata Rias',team:'artistik'},
  anggota_cahaya:{label:'Anggota Divisi Tata Cahaya',team:'artistik'}
};

var RUBRICS = {
  pimpinan_produksi:[{id:'pp1',name:'Perencanaan & Pengelolaan Produksi',desc:'Rencana sangat detail',weight:20,scale:'4=Sebelum deadline · 3=Tepat · 2=Mundur · 1=Gagal'},{id:'pp2',name:'Seleksi & Pengaturan Tim',desc:'Penempatan sesuai kemampuan',weight:15,scale:'4=100% pas · 3=Sesuai · 2=Salah tempat · 1=Asal'},{id:'pp3',name:'Manajemen Anggaran',desc:'Efisien, transparan',weight:15,scale:'4=Efisien · 3=Sesuai · 2=Kurang rapi · 1=Tidak jelas'},{id:'pp4',name:'Koordinasi Lintas Divisi',desc:'Produksi & Artistik harmonis',weight:20,scale:'4=Harmonis · 3=Baik · 2=Kaku · 1=Tidak ada'},{id:'pp5',name:'Penyelesaian Masalah',desc:'Solusi cepat & tepat',weight:15,scale:'4=Cepat · 3=Cepat · 2=Lambat · 1=Tidak mampu'},{id:'pp6',name:'Evaluasi & Pelaporan',desc:'Laporan lengkap',weight:15,scale:'4=Lengkap · 3=Lengkap · 2=Kurang · 1=Tidak ada'}],
  sekretaris:[{id:'sk1',name:'Dokumentasi & Arsip',desc:'Arsip rapi & lengkap',weight:20,scale:'4=Rapi & lengkap · 3=Rapi · 2=Berantakan · 1=Hilang'},{id:'sk2',name:'Penjadwalan',desc:'Jadwal jauh hari',weight:20,scale:'4=Jauh hari · 3=Tepat · 2=Mendadak · 1=Tidak ada'},{id:'sk3',name:'Korespondensi & Komunikasi',desc:'Informasi jelas',weight:20,scale:'4=Jelas · 3=Tepat · 2=Terlambat · 1=Salah'},{id:'sk4',name:'Administrasi Anggaran',desc:'Sangat teliti',weight:15,scale:'4=Sangat teliti · 3=Sesuai · 2=Kurang · 1=Tidak'},{id:'sk5',name:'Penyusunan Laporan',desc:'Laporan sangat rapi',weight:25,scale:'4=H+1 rapi · 3=H+3 · 2=H+7 · 1=Tidak ada'}],
  bendahara:[{id:'bd1',name:'Pencatatan Transaksi',desc:'Detail & real-time',weight:25,scale:'4=Detail · 3=Ada nota · 2=Kurang · 1=Tidak ada'},{id:'bd2',name:'Pengelolaan Keuangan',desc:'Transparan & efisien',weight:25,scale:'4=Transparan · 3=Sesuai · 2=Kurang · 1=Tidak jelas'},{id:'bd3',name:'Perencanaan Anggaran (RAB)',desc:'Realistis & detail',weight:20,scale:'4=Realistis · 3=Realistis · 2=Revisi · 1=Tidak ada'},{id:'bd4',name:'Pelaporan Keuangan',desc:'Akurat & tepat waktu',weight:30,scale:'4=Mingguan · 3=Akhir · 2=Terlambat · 1=Tidak ada'}],
  koor_produksi:[{id:'kp1',name:'Penyediaan Kebutuhan Divisi',desc:'Lengkap sebelum deadline',weight:30,scale:'4=Sebelum · 3=Tepat · 2=Telat · 1=Tidak ada'},{id:'kp2',name:'Pengelolaan Anggota',desc:'Anggota maksimal',weight:25,scale:'4=Maksimal · 3=Sesuai · 2=Diperintah · 1=Tidak terkontrol'},{id:'kp3',name:'Koordinasi Teknis',desc:'Sangat lancar',weight:25,scale:'4=Lancar · 3=Baik · 2=Kaku · 1=Tidak ada'},{id:'kp4',name:'Pelaporan Kinerja',desc:'Detail & tepat waktu',weight:20,scale:'4=Detail · 3=Tepat · 2=Terlambat · 1=Tidak ada'}],
  sutradara:[{id:'sr1',name:'Pengembangan Konsep',desc:'Sangat unik & mendalam',weight:20,scale:'4=Unik · 3=Jelas · 2=Biasa · 1=Tidak ada'},{id:'sr2',name:'Casting / Pemilihan Pemain',desc:'100% pas',weight:15,scale:'4=100% pas · 3=Sesuai · 2=Kurang pas · 1=Asal'},{id:'sr3',name:'Pengarahan Pemain',desc:'Blocking sempurna',weight:25,scale:'4=Sempurna · 3=Baik · 2=Lupa · 1=Tidak mampu'},{id:'sr4',name:'Koordinasi Artistik',desc:'Semua elemen menyatu',weight:20,scale:'4=Menyatu · 3=Selaras · 2=Kurang · 1=Berantakan'},{id:'sr5',name:'Rekayasa Emosi & Atmosfer',desc:'Sangat dramatis',weight:20,scale:'4=Dramatis · 3=Baik · 2=Datar · 1=Tidak ada'}],
  asisten_sutradara:[{id:'as1',name:'Koordinasi & Logistik',desc:'Logistik siap',weight:20,scale:'4=Siap · 3=Tepat · 2=Telat · 1=Tidak siap'},{id:'as2',name:'Pencatatan',desc:'Catatan lengkap',weight:15,scale:'4=Lengkap · 3=Baik · 2=Kurang · 1=Tidak ada'},{id:'as3',name:'Koordinasi dengan Pemain',desc:'Komunikasi efektif',weight:20,scale:'4=Efektif · 3=Baik · 2=Kurang · 1=Tidak ada'},{id:'as4',name:'Bantu Koordinasi Teknis',desc:'Proaktif membantu',weight:20,scale:'4=Proaktif · 3=Diminta · 2=Kurang · 1=Tidak'},{id:'as5',name:'Mengatur Latihan Kelompok',desc:'Mampu memimpin',weight:15,scale:'4=Mampu · 3=Mampu · 2=Ragu · 1=Tidak bisa'},{id:'as6',name:'Backup Sutradara',desc:'Siap menggantikan',weight:10,scale:'4=Siap · 3=Siap · 2=Kurang · 1=Tidak bisa'}],
  pemain:[{id:'pm1',name:'Penguasaan Naskah',desc:'Hafal 100%',weight:25,scale:'4=Hafal · 3=Hafal · 2=Lupa · 1=Tidak hafal'},{id:'pm2',name:'Ekspresi & Emosi',desc:'Mendalam',weight:25,scale:'4=Mendalam · 3=Sesuai · 2=Datar · 1=Tidak ada'},{id:'pm3',name:'Blocking & Posisi',desc:'Sangat presisi',weight:20,scale:'4=Presisi · 3=Sesuai · 2=Sering salah · 1=Tidak ikut'},{id:'pm4',name:'Kerja Sama Antar Pemain',desc:'Natural',weight:15,scale:'4=Natural · 3=Baik · 2=Kurang · 1=Tidak peduli'},{id:'pm5',name:'Konsistensi Latihan',desc:'100% hadir',weight:15,scale:'4=100% · 3=Disiplin · 2=Telat · 1=Absen'}],
  koor_artistik:[{id:'ka1',name:'Desain & Konsep',desc:'Sangat kreatif',weight:25,scale:'4=Kreatif · 3=Baik · 2=Biasa · 1=Tidak ada'},{id:'ka2',name:'Eksekusi Teknis',desc:'Rapi & sebelum deadline',weight:30,scale:'4=Rapi · 3=Tepat · 2=Terlambat · 1=Berantakan'},{id:'ka3',name:'Koordinasi dengan Tim',desc:'Komunikatif',weight:25,scale:'4=Proaktif · 3=Baik · 2=Kurang · 1=Tidak ada'},{id:'ka4',name:'Pengelolaan Anggota',desc:'Anggota maksimal',weight:20,scale:'4=Maksimal · 3=Sesuai · 2=Diperintah · 1=Tidak terkontrol'}],
  anggota:[{id:'ag1',name:'Penyelesaian Tugas',desc:'Selesai sebelum deadline',weight:30,scale:'4=Sebelum · 3=Tepat · 2=Terlambat · 1=Tidak selesai'},{id:'ag2',name:'Kualitas Kerja',desc:'Teliti & rapi',weight:25,scale:'4=Melebihi · 3=Baik · 2=Kurang · 1=Berantakan'},{id:'ag3',name:'Kerja Sama Tim',desc:'Proaktif membantu',weight:25,scale:'4=Proaktif · 3=Baik · 2=Disuruh · 1=Tidak mau'},{id:'ag4',name:'Inisiatif',desc:'Aktif membantu',weight:10,scale:'4=Aktif · 3=Sesekali · 2=Pasif · 1=Tidak ada'},{id:'ag5',name:'Kedisiplinan',desc:'100% hadir',weight:10,scale:'4=100% · 3=Jarang absen · 2=Telat · 1=Sering absen'}]
};

function getRubricFor(r){
  if (r==='pimpinan_produksi') return RUBRICS.pimpinan_produksi;
  if (r==='sekretaris') return RUBRICS.sekretaris;
  if (r==='bendahara') return RUBRICS.bendahara;
  if (r==='sutradara') return RUBRICS.sutradara;
  if (r==='asisten_sutradara') return RUBRICS.asisten_sutradara;
  if (r==='pemain') return RUBRICS.pemain;
  if (['koor_publikasi','koor_perlengkapan','koor_akomodasi'].indexOf(r)>=0) return RUBRICS.koor_produksi;
  if (['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'].indexOf(r)>=0) return RUBRICS.koor_artistik;
  return RUBRICS.anggota;
}

var DIVISIONS = {
  produksi:{label:'Tim Produksi',roles:['pimpinan_produksi','sekretaris','bendahara','koor_publikasi','koor_perlengkapan','koor_akomodasi','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi']},
  artistik:{label:'Tim Artistik',roles:['sutradara','asisten_sutradara','pemain','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya']}
};
function getDivisionOfRole(role){ for (var d in DIVISIONS){ if (DIVISIONS[d].roles.indexOf(role) >= 0) return d; } return 'produksi'; }

/* ===== FIREBASE ===== */
var firebaseReady = false, fb = null, firebaseError = '';
try {
  if (typeof firebase === 'undefined') throw new Error('Firebase SDK tidak termuat');
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.indexOf('GANTI') >= 0) throw new Error('Firebase config belum diisi');
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  fb = firebase.firestore();
  try { fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); } catch(e){}
  firebaseReady = true;
  console.log('Firebase ready');
} catch(e){
  console.error('Firebase init:', e.message);
  firebaseError = e.message || 'Firebase gagal inisialisasi';
}

function uid(){ return 'id_' + Math.random().toString(36).substr(2,9) + Date.now().toString(36); }
function genClassCode(n){ var c = (n||'KLS').replace(/[^A-Z0-9]/gi,'').toUpperCase().substring(0,4); return c + '-' + Math.floor(1000 + Math.random()*9000); }

function sanitizeFirestore(obj){
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeFirestore).filter(function(v){ return v !== undefined; });
  var clean = {};
  for (var k in obj){
    if (!Object.prototype.hasOwnProperty.call(obj,k)) continue;
    var v = obj[k];
    if (v === undefined) continue;
    var cv = sanitizeFirestore(v);
    if (cv !== undefined) clean[k] = cv;
  }
  return clean;
}

/* ===== STATE ===== */
var DB = {
  teachers:[], classes:[], evaluations:{}, deadlines:{}, activeStages:{},
  notifications:[], stages:JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  checklists:{}, waLogs:[], meetings:{}, activityLogs:[]
};

var unsubs = [];
var resetCodes = {};

/* ===== FIREBASE HELPERS ===== */
function fbSetTeacher(t){ if (!firebaseReady) return Promise.resolve(); return fb.collection('teachers').doc(t.email.toLowerCase()).set(sanitizeFirestore(t), {merge:true}); }
function fbDelTeacher(email){ if (!firebaseReady) return Promise.resolve(); return fb.collection('teachers').doc(email.toLowerCase()).delete(); }
function fbSetClass(c){ if (!firebaseReady) return Promise.resolve(); var o = Object.assign({},c); delete o._id; return fb.collection('classes').doc(c.id).set(sanitizeFirestore(o), {merge:false}); }
function fbSetEval(cid,tid,data){ if (!firebaseReady) return Promise.resolve(); var o = {classId:cid,targetId:tid}; for (var k in data) o[k] = data[k]; return fb.collection('evaluations').doc(cid+'__'+tid).set(sanitizeFirestore(o), {merge:false}); }
function fbSetDeadlines(cid,data){ if (!firebaseReady) return Promise.resolve(); var o = {classId:cid}; for (var k in data) o[k] = data[k]; return fb.collection('deadlines').doc(cid).set(sanitizeFirestore(o), {merge:false}); }
function fbSetActiveStages(cid,data){
  if (!firebaseReady) return Promise.resolve();
  var o = {classId:cid};
  for (var k in data) o[k] = data[k];
  // Support both format: {activeIds:[...]} atau {stageId: true, ...}
  return fb.collection('activeStages').doc(cid).set(sanitizeFirestore(o), {merge:false});
}
function fbAddNotif(n){ if (!firebaseReady) return Promise.resolve(); return fb.collection('notifications').doc(n.id).set(sanitizeFirestore(n)); }
function fbDelNotif(id){ if (!firebaseReady) return Promise.resolve(); return fb.collection('notifications').doc(id).delete(); }
function fbSetStages(stages){ if (!firebaseReady) return Promise.resolve(); return fb.collection('config').doc('stages').set(sanitizeFirestore({stages:stages})); }
function fbAddActivity(a){ if (!firebaseReady) return Promise.resolve(); return fb.collection('activity_logs').doc(a.id).set(sanitizeFirestore(a)); }

/* ===== SESSION ===== */
var SESSION_KEY = 'sppt_session';
function saveSession(){
  if (!window.currentUser) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      type: window.currentUser.type,
      email: window.currentUser.email || '',
      name: window.currentUser.name || '',
      classId: window.currentUser.classId || '',
      studentId: window.currentUser.studentId || '',
      role: window.currentUser.role || '',
      phone: window.currentUser.phone || ''
    }));
  } catch(e){}
}
function clearSession(){ try { localStorage.removeItem(SESSION_KEY); } catch(e){} }
function getSession(){
  try { var s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch(e){ return null; }
}
function setCurrentUser(u){ window.currentUser = u; saveSession(); }

/* ===== CLASS HELPERS ===== */
function myClasses(){
  if (!window.currentUser) return [];
  if (window.currentUser.type === 'admin') return DB.classes.slice();
  if (window.currentUser.type === 'guru'){
    var email = String(window.currentUser.email || '').toLowerCase();
    return DB.classes.filter(function(c){ return c.teacherEmail && String(c.teacherEmail).toLowerCase() === email; });
  }
  if (window.currentUser.type === 'siswa') return DB.classes.filter(function(c){ return c.id === window.currentUser.classId; });
  return [];
}
function ownsClass(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  if (window.currentUser.type === 'guru'){
    var c = DB.classes.find(function(x){ return x.id === cid; });
    return !!(c && c.teacherEmail && String(c.teacherEmail).toLowerCase() === String(window.currentUser.email || '').toLowerCase());
  }
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  return false;
}

/* ===== RENDER SCHEDULER ===== */
function debouncedRender(){
  if (window._renderTimer) clearTimeout(window._renderTimer);
  window._renderTimer = setTimeout(function(){
    window._renderTimer = null;
    if (!window.currentUser) return;
    try {
      if (window.currentUser.type === 'guru') renderGuruDashboard();
      else if (window.currentUser.type === 'siswa') renderSiswaDashboard();
      else if (window.currentUser.type === 'admin') renderAdminDashboard();
    } catch(e){ console.error('Render:', e); }
  }, 350);
}

function logActivity(type, message, meta){
  var safeMeta = sanitizeFirestore(meta || {});
  var a = {
    id: uid(), type: type || 'info', message: message || '', meta: safeMeta,
    classId: (window.currentUser && window.currentUser.classId) || (safeMeta && safeMeta.classId) || '',
    userId: (window.currentUser && (window.currentUser.studentId || window.currentUser.email)) || 'system',
    userName: window.currentUser ? window.currentUser.name : 'System',
    createdAt: Date.now()
  };
  fbAddActivity(a);
}

/* ===== FIRESTORE LISTENERS ===== */
function subscribeAll(){
  if (!firebaseReady) return;

  unsubs.push(fb.collection('teachers').onSnapshot(function(snap){
    DB.teachers = snap.docs.map(function(d){ return d.data(); });
    if (DB.teachers.length === 0){ DEFAULT_TEACHERS.forEach(function(t){ fbSetTeacher(t); }); }
    if (window.currentUser && window.currentUser.type === 'admin') debouncedRender();
  }, function(e){ console.error('teachers:', e.message); }));

  unsubs.push(fb.collection('classes').onSnapshot(function(snap){
    DB.classes = snap.docs.map(function(d){ var o = d.data(); o.id = d.id; return o; });
    refreshClassDropdown();
    if (window.currentUser && window.currentUser.type === 'siswa'){
      var c = DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
      if (c){
        var s = c.students.find(function(x){ return x.id === window.currentUser.studentId; });
        if (s){ window.currentUser.name = s.name; window.currentUser.role = s.role; }
      }
    }
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('classes:', e.message); }));

  unsubs.push(fb.collection('evaluations').onSnapshot(function(snap){
    var ev = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId, tid = dt.targetId;
      if (!cid || !tid) return;
      ev[cid] = ev[cid] || {};
      ev[cid][tid] = ev[cid][tid] || {};
      for (var k in dt){
        if (k === 'classId' || k === 'targetId') continue;
        ev[cid][tid][k] = dt[k];
      }
    });
    DB.evaluations = ev;
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('evaluations:', e.message); }));

  unsubs.push(fb.collection('deadlines').onSnapshot(function(snap){
    var dl = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId || d.id, obj = {};
      for (var k in dt){ if (k !== 'classId') obj[k] = dt[k]; }
      dl[cid] = obj;
    });
    DB.deadlines = dl;
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('deadlines:', e.message); }));

  unsubs.push(fb.collection('activeStages').onSnapshot(function(snap){
    var a = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId || d.id, obj = {};
      // Support both format
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
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('activeStages:', e.message); }));

  unsubs.push(fb.collection('notifications').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.notifications = snap.docs.map(function(d){ return d.data(); });
    if (window.currentUser){
      updateNotifBadge();
      var np = document.getElementById('notif-panel');
      if (np && np.classList.contains('open')) renderNotifPanel();
      debouncedRender();
    }
  }, function(e){ console.error('notifications:', e.message); }));

  unsubs.push(fb.collection('config').doc('stages').onSnapshot(function(doc){
    if (doc.exists && doc.data().stages){ DB.stages = doc.data().stages; }
    else { fbSetStages(DB.stages); }
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('config:', e.message); }));

  unsubs.push(fb.collection('checklists').onSnapshot(function(snap){
    var ch = {};
    snap.docs.forEach(function(d){
      var dt = d.data();
      ch[dt.classId || d.id] = { items: dt.items || [] };
    });
    DB.checklists = ch;
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('checklists:', e.message); }));

  unsubs.push(fb.collection('wa_logs').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.waLogs = snap.docs.map(function(d){ return d.data(); });
    if (window.currentUser && window.currentUser.type === 'guru' && document.getElementById('wa-logs-body')){
      if (typeof window.renderWaLogsBody === 'function') window.renderWaLogsBody();
    }
  }, function(e){ console.error('wa_logs:', e.message); }));

  unsubs.push(fb.collection('meetings').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    var m = {};
    snap.docs.forEach(function(d){ m[d.id] = Object.assign({id:d.id}, d.data()); });
    DB.meetings = m;
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('meetings:', e.message); }));

  unsubs.push(fb.collection('activity_logs').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.activityLogs = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    if (window.currentUser) debouncedRender();
  }, function(e){ console.error('activity_logs:', e.message); }));
}

/* ===== STAGE HELPERS ===== */
function getStage(id){ return DB.stages.find(function(s){ return s.id === id; }); }
function isStageActive(c,s){
  if (!DB.activeStages[c]) return false;
  if (Array.isArray(DB.activeStages[c].activeIds)){
    return DB.activeStages[c].activeIds.indexOf(s) >= 0;
  }
  return DB.activeStages[c][s] === true;
}
function fmtDate(ts){ return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function fmtDateShort(s){ if (!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); }
function isOverdue(s){ if (!s) return false; var d = new Date(s); d.setHours(23,59,59,999); return Date.now() > d.getTime(); }
function getDeadline(c,s){ return DB.deadlines[c] && DB.deadlines[c][s] ? DB.deadlines[c][s] : null; }
function canGuruEvaluate(t){ return ['pimpinan_produksi','sutradara'].indexOf(t) >= 0; }
function getActiveStages(cid){ return DB.stages.filter(function(s){ return isStageActive(cid, s.id); }); }

/* ===== NOTIF HELPERS ===== */
function getNotifsFor(u){
  if (!u) return [];
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
    var myIds = myClasses().map(function(c){ return c.id; });
    return DB.notifications.filter(function(n){ if (!n.classId) return false; return myIds.indexOf(n.classId) >= 0; });
  }
  if (u.type === 'admin') return DB.notifications.slice();
  return [];
}
function getUserKey(){
  if (!window.currentUser) return null;
  if (window.currentUser.type === 'siswa') return window.currentUser.studentId;
  if (window.currentUser.type === 'guru') return 'guru:' + String(window.currentUser.email || '').toLowerCase();
  return 'admin';
}
function getUnreadCount(){ return getNotifsFor(window.currentUser).filter(function(n){ return !(n.readBy && n.readBy.indexOf(getUserKey()) >= 0); }).length; }
function updateNotifBadge(){
  var b = document.getElementById('notif-btn'), bd = document.getElementById('notif-badge');
  if (!b || !bd) return;
  if (!window.currentUser){ b.classList.add('hidden'); return; }
  b.classList.remove('hidden');
  var u = getUnreadCount();
  if (u > 0){ bd.classList.remove('hidden'); bd.textContent = u; }
  else bd.classList.add('hidden');
}
function openNotifPanel(){
  document.getElementById('notif-panel').classList.add('open');
  document.getElementById('notif-backdrop').classList.add('open');
  renderNotifPanel();
}
function closeNotifPanel(){
  document.getElementById('notif-panel').classList.remove('open');
  document.getElementById('notif-backdrop').classList.remove('open');
}
function renderNotifPanel(){
  var b = document.getElementById('notif-panel-body');
  var m = getNotifsFor(window.currentUser).sort(function(a,b){ return b.createdAt - a.createdAt; });
  if (m.length === 0){
    b.innerHTML = '<div class="notif-empty">' + ico('bell','lg') + '<p style="margin-top:10px">Belum ada notifikasi</p></div>';
    return;
  }
  var uk = getUserKey(), h = '';
  m.forEach(function(n){
    var r = n.readBy && n.readBy.indexOf(uk) >= 0, t = n.type || 'info';
    var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[t] || 'Info';
    var tc = {tugas:'notif-type-tugas',instruksi:'notif-type-instruksi',info:'notif-type-info',urgent:'notif-type-urgent'}[t] || 'notif-type-info';
    h += '<div class="notif-item ' + (r ? '' : 'unread') + '">' +
      '<div class="notif-header"><span class="notif-type ' + tc + '">' + tl + '</span>' +
      '<span class="notif-time">' + fmtDate(n.createdAt) + '</span></div>' +
      '<div class="notif-title">' + (n.title || 'Notifikasi') + '</div>' +
      '<div class="notif-from">Dari: <b>' + (n.fromName || 'Guru') + '</b></div>' +
      '<div class="notif-msg">' + n.message + '</div>' +
      '<div class="notif-actions">' +
      (!r ? '<button class="btn btn-sm btn-ghost" onclick="markNotifRead(\'' + n.id + '\')">' + ico('check') + ' Dibaca</button>' : '<span class="badge badge-success">' + ico('check') + ' Dibaca</span>') +
      (window.currentUser.type === 'siswa' && t === 'tugas' ? '<button class="btn btn-sm btn-ghost" onclick="markTaskDone(\'' + n.id + '\')">' + ico('checkSquare') + ' ' + (n.doneBy && n.doneBy.indexOf(uk) >= 0 ? 'Selesai' : 'Tandai') + '</button>' : '') +
      '<button class="btn btn-sm btn-ghost" onclick="deleteNotif(\'' + n.id + '\')">' + ico('trash') + '</button>' +
      '</div></div>';
  });
  b.innerHTML = h;
}
function markNotifRead(id){
  var n = DB.notifications.find(function(x){ return x.id === id; });
  if (!n) return;
  var uk = getUserKey(), rb = n.readBy || [];
  if (rb.indexOf(uk) < 0) rb.push(uk);
  fbAddNotif(Object.assign({}, n, {readBy: rb}));
}
function markTaskDone(id){
  var n = DB.notifications.find(function(x){ return x.id === id; });
  if (!n) return;
  var uk = getUserKey(), db = n.doneBy || [];
  if (db.indexOf(uk) < 0){
    db.push(uk);
    fbAddNotif(Object.assign({}, n, {doneBy: db}));
    logActivity('task_done', window.currentUser.name + ' menandai tugas selesai: ' + n.title, {classId: window.currentUser.classId});
    alert('Ditandai selesai!');
  }
}
function deleteNotif(id){ if (!confirm('Hapus?')) return; fbDelNotif(id); }

/* ===== DROPDOWN ===== */
function refreshClassDropdown(){
  var s = document.getElementById('siswa-kelas');
  if (!s) return;
  s.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  DB.classes.forEach(function(c){ s.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>'; });
}
function refreshDaftarRoles(){
  var s = document.getElementById('daftar-role');
  if (!s) return;
  var o = '<option value="">-- Pilih Peran --</option><optgroup label="— Tim Produksi —">';
  ['pimpinan_produksi','sekretaris','bendahara','koor_publikasi','koor_perlengkapan','koor_akomodasi','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'].forEach(function(k){ o += '<option value="' + k + '">' + ROLES[k].label + '</option>'; });
  o += '</optgroup><optgroup label="— Tim Artistik —">';
  ['sutradara','asisten_sutradara','pemain','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'].forEach(function(k){ o += '<option value="' + k + '">' + ROLES[k].label + '</option>'; });
  o += '</optgroup>';
  s.innerHTML = o;
}

/* ===== LOGIN ===== */
function loginGuru(){
  var e = document.getElementById('guru-email').value.trim().toLowerCase();
  var p = document.getElementById('guru-password').value;
  var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase() === e && x.password === p; });
  if (t){
    setCurrentUser({type:'guru', email:t.email, name:t.name, phone:t.phone || ''});
    showApp();
  } else alert('Email atau password salah!');
}
function loginSiswa(){
  var cid = document.getElementById('siswa-kelas').value;
  var idInput = document.getElementById('siswa-email').value.trim();
  var p = document.getElementById('siswa-password').value;
  if (!cid || !idInput || !p){ alert('Lengkapi!'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c){ alert('Kelas tidak ditemukan!'); return; }
  var isEmail = idInput.indexOf('@') >= 0, emailLower = idInput.toLowerCase(), phoneClean = idInput.replace(/\D/g,'');
  var s = c.students.find(function(x){
    if (x.password !== p) return false;
    if (isEmail) return x.email && x.email.toLowerCase() === emailLower;
    return x.phone && x.phone.replace(/\D/g,'') === phoneClean;
  });
  if (!s){ alert('Email/WA atau password salah!'); return; }
  setCurrentUser({type:'siswa', classId:cid, studentId:s.id, name:s.name, role:s.role, phone:s.phone || ''});
  showApp();
}
function loginAdmin(){
  var e = document.getElementById('admin-email').value.trim().toLowerCase();
  var p = document.getElementById('admin-password').value;
  if (e === ADMIN_ACCOUNT.email.toLowerCase() && p === ADMIN_ACCOUNT.password){
    setCurrentUser({type:'admin', email:ADMIN_ACCOUNT.email, name:ADMIN_ACCOUNT.name});
    showApp();
  } else alert('Email atau password admin salah!');
}

/* ===== REGISTER ===== */
function registerSiswa(){
  var code = document.getElementById('daftar-code').value.trim().toUpperCase();
  var name = document.getElementById('daftar-name').value.trim();
  var email = document.getElementById('daftar-email').value.trim().toLowerCase();
  var pw = document.getElementById('daftar-password').value;
  var cf = document.getElementById('daftar-confirm').value;
  var phoneEl = document.getElementById('daftar-phone');
  var phone = phoneEl ? phoneEl.value.replace(/\D/g,'') : '';
  var role = document.getElementById('daftar-role').value;
  if (!code || !name || !email || !pw || !cf || !role){ alert('Lengkapi!'); return; }
  if (!phone){ alert('No. WA wajib!'); return; }
  if (phone.length < 10 || phone.length > 15){ alert('Format WA tidak valid!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length < 6){ alert('Min 6!'); return; }
  if (pw !== cf){ alert('Konfirmasi tidak cocok!'); return; }
  var cls = DB.classes.find(function(c){ return c.code === code; });
  if (!cls){ alert('Kode Kelas tidak valid!'); return; }
  var dupEmail = false;
  DB.classes.forEach(function(c){ if (c.students.some(function(s){ return s.email && s.email.toLowerCase() === email; })) dupEmail = true; });
  if (dupEmail){ alert('Email terdaftar!'); return; }
  var dupPhone = false;
  DB.classes.forEach(function(c){ if (c.students.some(function(s){ return s.phone && s.phone === phone; })) dupPhone = true; });
  if (dupPhone){ alert('No. WA terdaftar!'); return; }
  var ns = {id:uid(), name:name, email:email, phone:phone, password:pw, role:role, registeredAt:Date.now()};
  var newStudents = cls.students.concat([ns]);
  fbSetClass(Object.assign({}, cls, {students: newStudents})).then(function(){
    fbAddNotif({
      id:uid(), classId:cls.id, fromId:ns.id, fromName:name, fromType:'siswa',
      toId:'guru', type:'info', title:'Siswa Baru',
      message:name + ' (' + (ROLES[role] ? ROLES[role].label : role) + ') mendaftar di ' + cls.name,
      createdAt:Date.now(), readBy:[], doneBy:[]
    });
    logActivity('student_register', name + ' mendaftar sebagai ' + (ROLES[role] ? ROLES[role].label : role), {classId:cls.id});
    alert('Berhasil!\n\nNama: ' + name + '\nKelas: ' + cls.name);
    ['daftar-code','daftar-name','daftar-email','daftar-password','daftar-confirm','daftar-role','daftar-phone'].forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('siswa-kelas').value = cls.id;
    document.getElementById('siswa-email').value = email;
    showLoginPage();
    switchLoginTab('siswa');
  });
}

/* ===== LOGOUT ===== */
function logout(){
  setCurrentUser(null);
  clearSession();
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  ['guru-email','guru-password','siswa-email','siswa-password','admin-email','admin-password'].forEach(function(id){
    var e = document.getElementById(id); if (e) e.value = '';
  });
  closeNotifPanel();
  refreshClassDropdown();
  switchLoginTab('guru');
  window.__currentViewClassId = null;
}

/* ===== SHOW APP ===== */
function showApp(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  var btnPw = document.getElementById('btn-change-pw');
  if (btnPw) btnPw.style.display = window.currentUser.type === 'admin' ? 'none' : 'inline-flex';

  var l = '';
  if (window.currentUser.type === 'guru') l = ico('user') + ' <span>' + window.currentUser.name + ' — <b>Guru Pengampu</b></span>';
  else if (window.currentUser.type === 'admin') l = ico('shield') + ' <span>' + window.currentUser.name + ' — <b>Administrator</b></span>';
  else {
    var c = DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
    l = ico('user') + ' <span>' + window.currentUser.name + ' — <b>' +
      (ROLES[window.currentUser.role] ? ROLES[window.currentUser.role].label : window.currentUser.role) +
      '</b> — <b>Kelas ' + (c ? c.name : '-') + '</b></span>';
  }
  document.getElementById('user-info').innerHTML = l;
  updateNotifBadge();

  if (window.currentUser.type === 'guru') renderGuruDashboard();
  else if (window.currentUser.type === 'admin') renderAdminDashboard();
  else renderSiswaDashboard();

  if (window.__forceHideLoading) window.__forceHideLoading();
}

/* ===== CHANGE PASSWORD ===== */
var currentResetEmail = null;
function openForgotPassword(t){
  var l = t === 'guru' ? 'Guru' : 'Siswa';
  openModal('Lupa Password ' + l,
    '<div class="alert alert-info">' + ico('info') + '<div>Masukkan email terdaftar. Kode ditampilkan (demo).</div></div>' +
    '<div id="lupa-step1"><div class="form-group"><label>Email</label><input type="email" id="lupa-email"></div>' +
    '<button class="btn btn-primary btn-block" onclick="sendResetCode()">' + ico('send') + ' Kirim Kode</button></div>' +
    '<div id="lupa-step2" class="hidden"><div class="alert alert-success">' + ico('checkCircle') + '<div>Kode terkirim!</div></div>' +
    '<div class="form-group"><label>Kode</label><input type="text" id="lupa-code" maxlength="6" style="text-align:center;font-size:20px;letter-spacing:.4em;"></div>' +
    '<div class="form-group pw-toggle"><label>Password Baru</label><input type="password" id="lupa-newpw"><button class="toggle-btn" onclick="togglePw(\'lupa-newpw\',this)" type="button"></button></div>' +
    '<div class="form-group pw-toggle"><label>Konfirmasi</label><input type="password" id="lupa-confirmpw"><button class="toggle-btn" onclick="togglePw(\'lupa-confirmpw\',this)" type="button"></button></div>' +
    '<button class="btn btn-primary btn-block" onclick="resetPassword()">' + ico('key') + ' Reset</button></div>');
}
function sendResetCode(){
  var e = document.getElementById('lupa-email').value.trim().toLowerCase();
  if (!e){ alert('Masukkan email!'); return; }
  var isG = DB.teachers.find(function(t){ return t.email && t.email.toLowerCase() === e; }), isS = false;
  DB.classes.forEach(function(c){ if (c.students.some(function(s){ return s.email && s.email.toLowerCase() === e; })) isS = true; });
  if (!isG && !isS){ alert('Email tidak terdaftar!'); return; }
  var code = Math.floor(100000 + Math.random()*900000).toString();
  currentResetEmail = e;
  resetCodes[e] = {code:code, expires:Date.now() + 15*60*1000};
  alert('DEMO\nKode: ' + code);
  document.getElementById('lupa-step1').classList.add('hidden');
  document.getElementById('lupa-step2').classList.remove('hidden');
}
function resetPassword(){
  var c = document.getElementById('lupa-code').value.trim();
  var n = document.getElementById('lupa-newpw').value;
  var cf = document.getElementById('lupa-confirmpw').value;
  if (!c || !n || !cf){ alert('Lengkapi!'); return; }
  if (n.length < 6){ alert('Min 6!'); return; }
  if (n !== cf){ alert('Konfirmasi tidak cocok!'); return; }
  var s = resetCodes[currentResetEmail];
  if (!s || Date.now() > s.expires){ alert('Kode kedaluwarsa!'); return; }
  if (s.code !== c){ alert('Kode salah!'); return; }
  var t = DB.teachers.find(function(t){ return t.email && t.email.toLowerCase() === currentResetEmail; });
  if (t){ fbSetTeacher(Object.assign({}, t, {password:n})); }
  else {
    var u = false;
    DB.classes.forEach(function(cls){
      var st = cls.students.find(function(x){ return x.email && x.email.toLowerCase() === currentResetEmail; });
      if (st){ st.password = n; fbSetClass(cls); u = true; }
    });
    if (!u){ alert('Gagal!'); return; }
  }
  delete resetCodes[currentResetEmail];
  alert('Password direset!');
  closeModal();
}
function openChangePassword(){
  openModal('Ubah Password',
    '<div class="form-group pw-toggle"><label>Password Lama</label><input type="password" id="cp-old"><button class="toggle-btn" onclick="togglePw(\'cp-old\',this)" type="button"></button></div>' +
    '<div class="form-group pw-toggle"><label>Password Baru</label><input type="password" id="cp-new"><button class="toggle-btn" onclick="togglePw(\'cp-new\',this)" type="button"></button></div>' +
    '<div class="form-group pw-toggle"><label>Konfirmasi</label><input type="password" id="cp-confirm"><button class="toggle-btn" onclick="togglePw(\'cp-confirm\',this)" type="button"></button></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveChangePassword()">' + ico('save') + ' Simpan</button>');
}
function saveChangePassword(){
  var o = document.getElementById('cp-old').value;
  var n = document.getElementById('cp-new').value;
  var c = document.getElementById('cp-confirm').value;
  if (!o || !n || !c){ alert('Lengkapi!'); return; }
  if (n.length < 6){ alert('Min 6!'); return; }
  if (n !== c){ alert('Konfirmasi tidak cocok!'); return; }
  if (window.currentUser.type === 'guru'){
    var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase() === window.currentUser.email.toLowerCase(); });
    if (!t || t.password !== o){ alert('Password lama salah!'); return; }
    fbSetTeacher(Object.assign({}, t, {password:n}));
  } else if (window.currentUser.type === 'siswa'){
    var cls = DB.classes.find(function(c){ return c.id === window.currentUser.classId; });
    var s = cls.students.find(function(x){ return x.id === window.currentUser.studentId; });
    if (!s || s.password !== o){ alert('Password lama salah!'); return; }
    s.password = n;
    fbSetClass(cls);
  }
  closeModal();
  alert('Password diubah!');
}

/* ===== MODAL ===== */
function openModal(t, b){
  document.getElementById('modal-title').innerHTML = t;
  document.getElementById('modal-body').innerHTML = b;
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(function(){
    var btns = document.querySelectorAll('#modal-body .toggle-btn');
    for (var i = 0; i < btns.length; i++){
      if (!btns[i].querySelector('svg')) btns[i].innerHTML = ico('eye', 16);
    }
  }, 10);
}
function closeModal(){ document.getElementById('modal').classList.add('hidden'); }

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function renderAdminDashboard(){
  document.getElementById('header-title-text').innerHTML = ico('settings') + ' Dashboard Administrator';
  var h = '<div class="alert alert-info">' + ico('shield') + '<div><b>Area Administrator</b><br>Kelola akun guru pengampu.</div></div>';
  h += '<div class="action-row" style="margin-bottom:16px;">';
  h += '<button class="btn btn-primary" onclick="openAddTeacherModal()">' + ico('personPlus') + ' Tambah Guru</button>';
  h += '<button class="btn" onclick="openWaLogsGlobal()">' + ico('messageCircle') + ' Log Komunikasi</button>';
  h += '<button class="btn" onclick="openActivityLog()">' + ico('activity') + ' Aktivitas</button>';
  h += '</div>';
  h += '<h3 style="color:var(--text-strong);margin-bottom:14px;font-size:15px;font-weight:700;">' + ico('users') + ' Daftar Guru (' + DB.teachers.length + ')</h3>';
  if (DB.teachers.length === 0) h += '<div class="empty-state">' + ico('users','lg') + '<p>Belum ada guru.</p></div>';
  DB.teachers.forEach(function(t){
    var isD = DEFAULT_TEACHERS.some(function(d){ return d.email.toLowerCase() === t.email.toLowerCase(); });
    h += '<div class="teacher-list-item">' +
      '<div class="info">' + ico('user','lg') + '<div><strong>' + t.name + '</strong><small>' + t.email + '</small></div></div>' +
      '<div class="action-row">' +
      (isD ? '<span class="badge badge-primary">' + ico('shield') + ' Utama</span>' :
        '<button class="btn btn-sm" onclick="openEditTeacherModal(\'' + t.email + '\')">' + ico('edit') + '</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteTeacher(\'' + t.email + '\')">' + ico('trash') + '</button>') +
      '</div></div>';
  });
  h += '<h3 style="color:var(--text-strong);margin:20px 0 12px;font-size:15px;font-weight:700;">' + ico('school') + ' Kelas Terdaftar</h3>';
  if (DB.classes.length === 0) h += '<div class="empty-state">' + ico('school','lg') + '<p>Belum ada kelas.</p></div>';
  else {
    h += '<div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Kode</th><th>Pemilik (Guru)</th><th>Siswa</th></tr></thead><tbody>';
    DB.classes.forEach(function(c){
      h += '<tr><td><b>' + c.name + '</b></td><td><code>' + c.code + '</code></td><td>' +
        (c.teacherEmail || '<span class="badge badge-warning">Belum</span>') + '</td><td>' + ((c.students||[]).length) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += renderActivityFeed('admin');
  document.getElementById('main-content').innerHTML = h;
  updateNotifBadge();
}

function openAddTeacherModal(){
  openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="t-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="t-email"></div>' +
    '<div class="form-group pw-toggle"><label>Password</label><input type="password" id="t-password"><button class="toggle-btn" onclick="togglePw(\'t-password\',this)" type="button"></button></div>' +
    '<button class="btn btn-primary btn-block" onclick="addTeacher()">' + ico('save') + ' Simpan</button>');
}
function addTeacher(){
  var n = document.getElementById('t-name').value.trim();
  var e = document.getElementById('t-email').value.trim().toLowerCase();
  var p = document.getElementById('t-password').value;
  if (!n || !e || !p){ alert('Lengkapi!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email invalid!'); return; }
  if (p.length < 6){ alert('Min 6!'); return; }
  if (DB.teachers.some(function(t){ return t.email.toLowerCase() === e; })){ alert('Email terdaftar!'); return; }
  fbSetTeacher({name:n, email:e, password:p});
  closeModal();
  alert('Ditambahkan!');
}
function openEditTeacherModal(email){
  var t = DB.teachers.find(function(x){ return x.email.toLowerCase() === email.toLowerCase(); });
  if (!t) return;
  openModal('Edit Guru',
    '<div class="form-group"><label>Nama</label><input id="t-name" value="' + t.name + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="t-email" value="' + t.email + '"></div>' +
    '<div class="form-group pw-toggle"><label>Password (kosongkan)</label><input type="password" id="t-password"><button class="toggle-btn" onclick="togglePw(\'t-password\',this)" type="button"></button></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateTeacher(\'' + email + '\')">' + ico('save') + ' Simpan</button>');
}
function updateTeacher(oldEmail){
  var n = document.getElementById('t-name').value.trim();
  var e = document.getElementById('t-email').value.trim().toLowerCase();
  var p = document.getElementById('t-password').value;
  if (!n || !e){ alert('Lengkapi!'); return; }
  if (DB.teachers.some(function(t){ return t.email.toLowerCase() === e && t.email.toLowerCase() !== oldEmail.toLowerCase(); })){ alert('Email dipakai!'); return; }
  if (p && p.length < 6){ alert('Min 6!'); return; }
  var t = DB.teachers.find(function(x){ return x.email.toLowerCase() === oldEmail.toLowerCase(); });
  var upd = Object.assign({}, t, {name:n, email:e});
  if (p) upd.password = p;
  var pr = oldEmail.toLowerCase() !== e.toLowerCase() ? fbDelTeacher(oldEmail) : Promise.resolve();
  pr.then(function(){ return fbSetTeacher(upd); }).then(function(){ closeModal(); alert('Diperbarui!'); });
}
function deleteTeacher(email){ if (!confirm('Hapus?')) return; fbDelTeacher(email); }

/* ============================================================
   GURU DASHBOARD
   ============================================================ */
function renderGuruDashboard(){
  window.__currentViewClassId = null;
  document.getElementById('header-title-text').innerHTML = ico('settings') + ' Dashboard Guru Pengampu';

  var h = '';
  // Toolbar
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openMainMenu()">' + ico('gear') + ' Menu</button>' +
    '<button class="btn" onclick="openWaLogsGlobal()">' + ico('messageCircle') + ' Log Komunikasi</button>' +
    '<button class="btn" onclick="openActivityLog()">' + ico('activity') + ' Aktivitas</button>' +
    '<button class="btn" onclick="openAddClassModal()">' + ico('plus') + ' Tambah Kelas</button>' +
    '</div>';

  h += '<div class="alert alert-info">' + ico('info') + '<div>Anda login sebagai <b>' + window.currentUser.name + '</b>. Hanya kelas yang <b>Anda buat</b> yang tampil.</div></div>';

  var mine = myClasses();
  h += '<h3 style="color:var(--text-strong);margin-bottom:14px;font-size:15px;font-weight:700;">' + ico('school') + ' Kelas Saya (' + mine.length + ')</h3>';

  if (mine.length === 0){
    h += '<div class="empty-state">' + ico('school','lg') + '<p>Belum ada kelas. Klik <b>+ Tambah Kelas</b> untuk mulai.</p></div>';
  } else {
    h += '<div class="grid">';
    mine.forEach(function(c){
      var ac = getActiveStages(c.id).length;
      h += '<div class="card card-accent blue" style="cursor:pointer" onclick="viewClass(\'' + c.id + '\')">' +
        '<h3>' + ico('school') + ' ' + c.name + '</h3>' +
        '<p style="color:var(--text-muted);font-size:13px;margin-bottom:8px;">' + ((c.students||[]).length) + ' siswa</p>' +
        '<div style="font-size:11.5px;margin-bottom:6px;">Kode: <b style="color:var(--primary);letter-spacing:.15em;font-family:monospace;">' + c.code + '</b></div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Aktivasi: <b style="color:var(--primary);">' + ac + '/' + DB.stages.length + ' tahap</b></div>' +
        '<div class="action-row" style="margin-top:12px;">' +
        '<button class="btn btn-sm" onclick="event.stopPropagation();viewClass(\'' + c.id + '\')">' + ico('edit') + ' Kelola</button>' +
        '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteClass(\'' + c.id + '\')">' + ico('trash') + '</button>' +
        '</div></div>';
    });
    h += '</div>';
  }
  h += renderActivityFeed('guru');
  document.getElementById('main-content').innerHTML = h;
  updateNotifBadge();
}

/* ============================================================
   ACTIVITY FEED
   ============================================================ */
function renderActivityFeed(role){
  var logs = DB.activityLogs || [];
  if (role === 'guru' && window.currentUser){
    var myIds = myClasses().map(function(c){ return c.id; });
    logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
  }
  if (role === 'siswa' && window.currentUser && window.currentUser.type === 'siswa'){
    var myDiv = getDivisionOfRole(window.currentUser.role);
    logs = logs.filter(function(l){
      if (l.classId && l.classId !== window.currentUser.classId) return false;
      if (!l.meta) return true;
      var lDiv = l.meta.division;
      if (!lDiv && l.meta.role) lDiv = getDivisionOfRole(l.meta.role);
      return !lDiv || lDiv === myDiv || l.userId === window.currentUser.studentId;
    });
  }
  logs = logs.slice(0, 10);
  if (logs.length === 0) return '';
  var h = '<div class="card card-accent amber" style="margin-top:20px;"><h3>' + ico('activity') + ' Aktivitas Terbaru</h3><div class="activity-feed">';
  logs.forEach(function(l){
    var iconName = 'info';
    if (l.type === 'student_register') iconName = 'user';
    else if (l.type === 'broadcast') iconName = 'megaphone';
    else if (l.type === 'task_done') iconName = 'check';
    else if (l.type === 'checklist_update') iconName = 'checkSquare';
    else if (l.type === 'meeting_create') iconName = 'calendar';
    else if (l.type === 'eval_submit' || l.type === 'eval_guru') iconName = 'star';
    h += '<div class="activity-item">' +
      '<div class="activity-icon">' + ico(iconName,'sm') + '</div>' +
      '<div class="activity-content">' +
      '<div class="activity-msg">' + l.message + '</div>' +
      '<div class="activity-meta"><b>' + l.userName + '</b> · ' + fmtDate(l.createdAt) + '</div>' +
      '</div></div>';
  });
  h += '</div></div>';
  return h;
}
function openActivityLog(){
  var logs = (DB.activityLogs || []).slice(0, 200);
  if (window.currentUser && window.currentUser.type === 'guru'){
    var myIds = myClasses().map(function(c){ return c.id; });
    logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
  }
  var h = '<div class="alert alert-info">' + ico('info') + '<div>Riwayat aktivitas sistem.</div></div>';
  if (logs.length === 0) h += '<div class="empty-state">' + ico('activity','lg') + '<p>Belum ada aktivitas.</p></div>';
  else {
    h += '<div class="activity-feed">';
    logs.forEach(function(l){
      h += '<div class="activity-item">' +
        '<div class="activity-icon">' + ico('activity','sm') + '</div>' +
        '<div class="activity-content">' +
        '<div class="activity-msg">' + l.message + '</div>' +
        '<div class="activity-meta"><b>' + l.userName + '</b> · ' + fmtDate(l.createdAt) + ' · <span class="badge badge-gray">' + l.type + '</span></div>' +
        '</div></div>';
    });
    h += '</div>';
  }
  openModal(ico('activity') + ' Log Aktivitas', h);
}

/* ============================================================
   BROADCAST
   ============================================================ */
function canSendBroadcast(){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'guru' || window.currentUser.type === 'admin') return true;
  if (window.currentUser.type === 'siswa') return ['pimpinan_produksi','sutradara'].indexOf(window.currentUser.role) >= 0;
  return false;
}

window.openBroadcastModal = function(presetClassId){
  try {
    if (!canSendBroadcast()){ alert('Tidak punya akses.'); return; }
    var classList = [];
    if (window.currentUser.type === 'siswa'){
      var tgt = DB.classes.find(function(c){ return c.id === window.currentUser.classId; });
      if (!tgt){ alert('Kelas tidak ditemukan.'); return; }
      classList = [tgt];
    } else if (window.currentUser.type === 'guru'){ classList = myClasses(); }
    else { classList = DB.classes.slice(); }
    if (classList.length === 0){ alert('Belum ada kelas.'); return; }

    var classOptions = classList.map(function(c){
      return '<option value="' + c.id + '">' + c.name + ' (' + ((c.students||[]).length) + ' siswa)</option>';
    }).join('');
    if (presetClassId) classOptions = classOptions.replace('value="' + presetClassId + '"', 'value="' + presetClassId + '" selected');

    openModal(ico('megaphone') + ' Broadcast',
      '<div class="alert alert-info">' + ico('info') + '<div>Kirim pengumuman ke <b>semua</b> atau <b>beberapa</b> siswa.</div></div>' +
      '<div class="form-group"><label>Kelas</label><select id="bc-class" onchange="updateBroadcastTargets()">' + classOptions + '</select></div>' +
      '<div class="form-group"><label>Jenis</label><select id="bc-type"><option value="tugas">Tugas</option><option value="instruksi">Instruksi</option><option value="info">Info</option><option value="urgent">Penting</option></select></div>' +
      '<div class="form-group"><label>Judul</label><input id="bc-title"></div>' +
      '<div class="form-group"><label>Pesan</label><textarea id="bc-message" rows="4"></textarea></div>' +
      '<div class="form-group"><label>Kirim via</label><select id="bc-channel"><option value="app">Hanya notifikasi</option><option value="both">Notifikasi + WhatsApp</option><option value="wa">Hanya WhatsApp</option></select></div>' +
      '<div class="form-group"><label>Penerima</label><div style="display:flex;gap:12px;margin-bottom:8px;flex-wrap:wrap;">' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer;"><input type="radio" name="bc-recipient-mode" value="all" checked onchange="updateBroadcastTargets()"> Semua siswa</label>' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer;"><input type="radio" name="bc-recipient-mode" value="some" onchange="updateBroadcastTargets()"> Pilih beberapa</label>' +
      '</div><div id="bc-target-list"></div></div>' +
      '<button class="btn btn-primary btn-block btn-lg" onclick="sendBroadcast()">' + ico('send') + ' Kirim Sekarang</button>');
    setTimeout(function(){ try { updateBroadcastTargets(); } catch(e){ console.error(e); } }, 150);
  } catch(e){ console.error('openBroadcastModal:', e); alert('Error: ' + e.message); }
};
window.updateBroadcastTargets = function(){
  try {
    var el = document.getElementById('bc-class'); if (!el) return;
    var cid = el.value;
    var r = document.querySelector('input[name="bc-recipient-mode"]:checked');
    var mode = r ? r.value : 'all';
    var box = document.getElementById('bc-target-list'); if (!box) return;
    if (!cid){ box.innerHTML = ''; return; }
    var c = DB.classes.find(function(x){ return x.id === cid; }); if (!c){ box.innerHTML = ''; return; }
    if (mode === 'all'){
      var wp = (c.students || []).filter(function(s){ return s.phone; }).length;
      box.innerHTML = '<div style="padding:12px;background:var(--primary-soft);border-radius:8px;font-size:13px;color:var(--primary-dark);"><b>' + ((c.students||[]).length) + ' siswa</b> akan menerima pesan. <br><small>' + wp + ' siswa punya no. WA</small></div>';
    } else {
      if ((c.students||[]).length === 0){ box.innerHTML = ''; return; }
      var html = '<div class="fu-target-list">';
      (c.students||[]).forEach(function(s){
        html += '<label class="fu-target-item"><input type="checkbox" class="bc-target" value="' + s.id + '" data-name="' + String(s.name).replace(/"/g,'&quot;') + '" data-phone="' + (s.phone||'') + '" data-role="' + s.role + '" checked>' +
          '<span class="fu-target-name">' + s.name + '</span>' +
          '<span class="fu-target-role">— ' + ((ROLES[s.role] && ROLES[s.role].label) || s.role) + '</span>' +
          (s.phone ? '<span class="fu-target-phone has-phone">' + ico('phone','sm') + ' ' + s.phone + '</span>' : '<span class="fu-target-phone no-phone">tanpa WA</span>') +
          '</label>';
      });
      html += '</div><div style="margin-top:6px;display:flex;gap:6px;"><button class="btn btn-sm" type="button" onclick="document.querySelectorAll(\'.bc-target\').forEach(function(c){c.checked=true;})">Pilih Semua</button><button class="btn btn-sm" type="button" onclick="document.querySelectorAll(\'.bc-target\').forEach(function(c){c.checked=false;})">Kosongkan</button></div>';
      box.innerHTML = html;
    }
  } catch(e){ console.error('updateBroadcastTargets:', e); }
};
window.sendBroadcast = function(){
  try {
    if (!canSendBroadcast()){ alert('Tidak punya akses.'); return; }
    var cid = document.getElementById('bc-class').value;
    var t = document.getElementById('bc-type').value;
    var ti = document.getElementById('bc-title').value.trim();
    var m = document.getElementById('bc-message').value.trim();
    var ch = document.getElementById('bc-channel').value;
    var mode = (document.querySelector('input[name="bc-recipient-mode"]:checked') || {}).value || 'all';
    if (!ti || !m){ alert('Lengkapi!'); return; }
    var c = DB.classes.find(function(x){ return x.id === cid; }); if (!c){ alert('Kelas tidak ada!'); return; }
    if (window.currentUser.type === 'guru' && !ownsClass(cid)){ alert('Anda tidak berhak mengirim ke kelas ini.'); return; }
    var recipients = [];
    if (mode === 'all'){ recipients = (c.students||[]).map(function(s){ return {id:s.id, name:s.name, phone:s.phone||'', role:s.role}; }); }
    else {
      var boxes = document.querySelectorAll('.bc-target:checked');
      if (boxes.length === 0){ alert('Pilih penerima!'); return; }
      boxes.forEach(function(b){ recipients.push({id:b.value, name:b.getAttribute('data-name'), phone:b.getAttribute('data-phone')||'', role:b.getAttribute('data-role')||''}); });
    }
    if (recipients.length === 0){ alert('Tidak ada penerima!'); return; }

    var senderId = window.currentUser.type === 'guru' ? 'guru' : (window.currentUser.type === 'admin' ? 'admin' : window.currentUser.studentId);
    var senderName = window.currentUser.name;
    var senderRole = window.currentUser.role || window.currentUser.type || '';

    if (ch === 'app' || ch === 'both'){
      if (mode === 'all'){
        fbAddNotif({id:uid(), classId:cid, fromId:senderId, fromName:senderName, fromType:window.currentUser.type, fromRole:senderRole, toId:'all', type:t, title:ti, message:m, createdAt:Date.now(), readBy:[], doneBy:[]});
      } else {
        fbAddNotif({id:uid(), classId:cid, fromId:senderId, fromName:senderName, fromType:window.currentUser.type, fromRole:senderRole, toId:'some', recipientIds:recipients.map(function(r){ return r.id; }), type:t, title:ti, message:m, createdAt:Date.now(), readBy:[], doneBy:[]});
      }
    }
    var waRecipients = recipients.filter(function(r){ return r.phone; });
    if (ch === 'wa' || ch === 'both'){
      if (waRecipients.length === 0){ alert('Tidak ada penerima dengan no. WA!'); return; }
      waRecipients.forEach(function(rec){
        if (firebaseReady){
          fb.collection('wa_logs').doc(uid()).set(sanitizeFirestore({
            id:uid(), classId:cid, fromId:senderId, fromName:senderName, fromType:window.currentUser.type,
            fromRole:senderRole, toId:rec.id, toName:rec.name, toRole:rec.role||'', toPhone:rec.phone,
            channel:ch, type:'broadcast', title:ti, message:m, createdAt:Date.now(), createdBy:senderName
          }));
        }
      });
      logActivity('broadcast', senderName + ' kirim broadcast "' + ti + '" ke ' + recipients.length + ' siswa', {classId:cid, role:window.currentUser.role||''});
      closeModal();
      showWaSendPanel(waRecipients, ti, m, senderName);
    } else {
      logActivity('broadcast', senderName + ' kirim broadcast "' + ti + '"', {classId:cid, role:window.currentUser.role||''});
      closeModal();
      alert('Broadcast terkirim ke ' + recipients.length + ' siswa!');
    }
  } catch(e){ console.error('sendBroadcast:', e); alert('Error: ' + e.message); }
};
function showWaSendPanel(recipients, title, message, senderName){
  var h = '<div class="alert alert-info">' + ico('info') + '<div><b>Kirim via WhatsApp</b><br>Klik tombol per penerima.</div></div>';
  h += '<div class="action-row" style="margin-bottom:12px;">' +
    '<button class="btn btn-sm btn-primary" onclick="openAllWaTabs()">' + ico('send','sm') + ' Buka Semua Berurutan</button>' +
    '<button class="btn btn-sm" onclick="copyWaAllMessages()">' + ico('copy','sm') + ' Copy Semua</button>' +
    '<span class="badge badge-warning" style="align-self:center;">' + recipients.length + ' penerima</span></div>';
  h += '<div class="wa-send-list">';
  recipients.forEach(function(r, i){
    h += '<div class="wa-send-item">' +
      '<div class="wa-send-info"><b>' + r.name + '</b> <span style="color:var(--success);font-size:11.5px;">' + ico('phone','sm') + ' ' + r.phone + '</span></div>' +
      '<button class="btn btn-sm btn-success" onclick="openSingleWa(' + i + ')">' + ico('send','sm') + ' Buka WA</button>' +
      '<span class="wa-send-status" id="wa-status-' + i + '"></span></div>';
  });
  h += '</div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="closeModal()">Selesai</button>';
  window.__waRecipients = recipients;
  window.__waTitle = title;
  window.__waMessage = message;
  window.__waSender = senderName;
  openModal(ico('send') + ' Kirim via WhatsApp', h);
}
function openSingleWa(i){
  var r = window.__waRecipients[i]; if (!r) return;
  var phone = r.phone.replace(/\D/g,'');
  if (phone.charAt(0) === '0') phone = '62' + phone.substring(1);
  if (phone.substring(0,2) !== '62') phone = '62' + phone;
  var msg = '*SP-PPT — SMP Negeri 10 Samarinda*\n_' + window.__waTitle + '_\n\nYth. *' + r.name + '*\n\n' + window.__waMessage + '\n\n—\nDari: ' + window.__waSender + '\nWaktu: ' + new Date().toLocaleString('id-ID');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
  var st = document.getElementById('wa-status-' + i);
  if (st) st.innerHTML = '<span class="badge badge-success">' + ico('check','sm') + ' Dibuka</span>';
}
function openAllWaTabs(){
  var rs = window.__waRecipients || []; if (rs.length === 0) return;
  if (!confirm('Buka ' + rs.length + ' tab WhatsApp?')) return;
  var i = 0;
  function next(){ if (i >= rs.length){ alert('Selesai.'); return; } openSingleWa(i); i++; setTimeout(next, 1000); }
  next();
}
function copyWaAllMessages(){
  var rs = window.__waRecipients || [];
  var txt = '=== PENERIMA & PESAN ===\n\n';
  rs.forEach(function(r, i){ txt += (i+1) + '. ' + r.name + '\n   WA: ' + r.phone + '\n   Pesan:\n   *' + window.__waTitle + '*\n\n   Yth. ' + r.name + ',\n\n   ' + window.__waMessage + '\n\n   — ' + window.__waSender + '\n\n---\n\n'; });
  if (navigator.clipboard){ navigator.clipboard.writeText(txt).then(function(){ alert('Disalin!'); }); }
  else prompt('Copy:', txt);
}

/* ============================================================
   TAMBAH KELAS
   ============================================================ */
function openAddClassModal(){
  openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label><input id="new-class-name" placeholder="Contoh: IX-A"><small class="hint">Kode otomatis di-generate</small></div>' +
    '<button class="btn btn-primary btn-block" onclick="addClass()">' + ico('save') + ' Simpan</button>');
}
function addClass(){
  var n = document.getElementById('new-class-name').value.trim();
  if (!n){ alert('Nama wajib!'); return; }
  if (DB.classes.some(function(c){ return c.name.toLowerCase() === n.toLowerCase(); })){ alert('Kelas ada!'); return; }
  var code = genClassCode(n), id = uid();
  var data = {
    id:id, name:n, code:code, students:[],
    teacherEmail:(window.currentUser && window.currentUser.email ? window.currentUser.email : ''),
    teacherName:(window.currentUser && window.currentUser.name ? window.currentUser.name : ''),
    createdAt:Date.now()
  };
  fbSetClass(data).then(function(){
    closeModal();
    logActivity('class_create', 'Kelas ' + n + ' dibuat', {classId:id});
    alert('Kelas ' + n + ' dibuat!\n\nKode: ' + code);
  });
}

/* ============================================================
   DELETE
   ============================================================ */
function deleteClass(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c){ alert('Kelas tidak ditemukan.'); return; }
  if (!ownsClass(cid)){ alert('Anda tidak berhak menghapus kelas ini.'); return; }
  if (!confirm('Hapus kelas ' + c.name + '?\n\nSemua data akan dihapus permanen.')) return;
  if (!firebaseReady){ alert('Firebase belum siap.'); return; }
  fb.collection('classes').doc(cid).delete().then(function(){
    return Promise.all([
      fb.collection('deadlines').doc(cid).delete().catch(function(){}),
      fb.collection('activeStages').doc(cid).delete().catch(function(){}),
      fb.collection('checklists').doc(cid).delete().catch(function(){})
    ]);
  }).then(function(){
    return fb.collection('evaluations').where('classId','==',cid).get().then(function(snap){
      if (snap.size === 0) return;
      var b = fb.batch(); snap.forEach(function(d){ b.delete(d.ref); }); return b.commit();
    }).catch(function(){});
  }).then(function(){
    return fb.collection('notifications').where('classId','==',cid).get().then(function(snap){
      if (snap.size === 0) return;
      var b = fb.batch(); snap.forEach(function(d){ b.delete(d.ref); }); return b.commit();
    }).catch(function(){});
  }).then(function(){
    alert('Kelas "' + c.name + '" berhasil dihapus!');
  }).catch(function(err){
    alert('GAGAL hapus kelas!\n\nError: ' + (err.message || err));
  });
}
function deleteStudent(cid, sid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c){ alert('Kelas tidak ditemukan.'); return; }
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  var s = c.students.find(function(x){ return x.id === sid; });
  if (!s){ alert('Siswa tidak ditemukan.'); return; }
  if (!confirm('Hapus siswa "' + s.name + '"?')) return;
  if (!firebaseReady){ alert('Firebase belum siap.'); return; }
  var newStudents = c.students.filter(function(x){ return x.id !== sid; });
  var updated = Object.assign({}, c, {students:newStudents});
  if (updated._id) delete updated._id;
  fb.collection('classes').doc(cid).set(sanitizeFirestore(updated), {merge:false}).then(function(){
    return fb.collection('evaluations').where('targetId','==',sid).get().then(function(snap){
      if (snap.size === 0) return;
      var b = fb.batch(); snap.forEach(function(d){ b.delete(d.ref); }); return b.commit();
    }).catch(function(){});
  }).then(function(){
    alert('Siswa "' + s.name + '" berhasil dihapus!');
  }).catch(function(err){
    alert('GAGAL hapus siswa!\n\nError: ' + (err.message || err));
  });
}
function regenerateClassCode(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  if (!confirm('Generate kode baru?')) return;
  var nc = genClassCode(c.name);
  fbSetClass(Object.assign({}, c, {code:nc})).then(function(){ alert('Kode baru: ' + nc); });
}
function copyClassCode(cid){
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  if (navigator.clipboard){ navigator.clipboard.writeText(c.code).then(function(){ alert('Kode disalin!'); }); }
  else prompt('Salin:', c.code);
}

/* ============================================================
   VIEW CLASS — V10 DENGAN SISTEM TAHAPAN
   ============================================================ */
function viewClass(cid){
  if (!ownsClass(cid)){ alert('Anda tidak punya akses ke kelas ini.'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;

  window.__currentViewClassId = cid;

  var stages = DB.stages;
  var activeStages = getActiveStages(cid);
  var ac = activeStages.length;

  // Header guru
  var h = '';
  h += '<div class="app-brand-header" style="margin:-24px -24px 16px;border-radius:0;">' +
    '<div class="app-brand-logos">' +
      '<img src="https://iili.io/nHsHgfe.png" alt="Logo" onerror="this.style.display=\'none\'">' +
      '<img src="https://iili.io/nBiviCX.png" alt="Logo" onerror="this.style.display=\'none\'">' +
    '</div>' +
    '<div class="app-brand-text">' +
      '<h1>Sistem Penilaian Proyek Produksi Teater</h1>' +
      '<p>SMP Negeri 10 Samarinda</p>' +
    '</div></div>';

  // Toolbar
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openMainMenu()">' + ico('gear') + ' Menu</button>' +
    '<button class="btn" onclick="renderGuruDashboard()">' + ico('back') + ' Kembali</button>' +
    '<button class="btn" onclick="openAddStudentModal(\'' + cid + '\')">' + ico('personPlus') + ' Siswa</button>' +
    '<button class="btn" onclick="openImportModal(\'' + cid + '\')">' + ico('upload') + ' Import</button>' +
    '<button class="btn" onclick="openRekapNilaiLengkap(\'' + cid + '\')">' + ico('chart') + ' Rekap</button>' +
    '<button class="btn" onclick="openMeetingList()">' + ico('calendar') + ' Absensi</button>' +
    '<button class="btn" onclick="openGuruPasswordView(\'' + cid + '\')" style="background:var(--warning);color:#fff;">' + ico('lock') + ' Lihat Password Siswa</button>' +
    '</div>';

  // Kode Kelas
  h += '<div class="class-code-box">' +
    '<div class="label">' + ico('key') + ' Kode Kelas</div>' +
    '<div class="code">' + c.code + '</div>' +
    '<div class="hint">Bagikan ke siswa untuk daftar mandiri</div>' +
    '<div class="action-row">' +
    '<button class="btn btn-primary" onclick="copyClassCode(\'' + cid + '\')">' + ico('copy') + ' Salin</button>' +
    '<button class="btn" onclick="regenerateClassCode(\'' + cid + '\')">' + ico('refresh') + ' Generate Baru</button>' +
    '</div></div>';

  // Sistem Tahapan
  h += '<div class="card card-accent blue">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
      '<div style="width:40px;height:40px;border-radius:10px;background:var(--primary-soft);' +
        'display:flex;align-items:center;justify-content:center;color:var(--primary);">' +
        ico('layers',20) +
      '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-weight:700;font-size:14px;color:var(--text-strong);">Sistem Tahapan</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">' + ac + '/' + stages.length + ' tahap aktif</div>' +
      '</div>' +
    '</div>' +
    '<div class="action-row" style="flex-wrap:wrap;">' +
      '<button class="btn btn-primary btn-sm" onclick="openSistemTahapan(\'' + cid + '\')">' +
        ico('settings','sm') + ' Kelola Tahapan' +
      '</button>' +
      '<button class="btn btn-sm" onclick="openPenilaianGuruDashboard(\'' + cid + '\')">' +
        ico('edit','sm') + ' Penilaian Guru' +
      '</button>' +
      '<button class="btn btn-sm" onclick="openStrukturKerabatKerja()">' +
        ico('award','sm') + ' Struktur' +
      '</button>' +
      '<button class="btn btn-sm" onclick="openBroadcastModal(\'' + cid + '\')">' +
        ico('megaphone','sm') + ' Broadcast' +
      '</button>' +
    '</div>' +
  '</div>';

  // Info ringkas tahapan
  if (activeStages.length > 0){
    h += '<div class="card" style="margin-bottom:14px;">' +
      '<h3 style="font-size:14px;">' + ico('activity',16) + ' Tahapan Aktif</h3>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">';
    activeStages.forEach(function(s){
      var dl = (DB.deadlines[cid] && DB.deadlines[cid][s.id]) || {};
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface);border-radius:8px;">' +
        '<div style="width:28px;height:28px;border-radius:8px;background:var(--success-soft);' +
          'color:var(--success);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">' +
          (stages.indexOf(s)+1) + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:600;font-size:13px;">' + s.name + '</div>' +
          (dl.date ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' +
            ico('clock',10) + ' Deadline: ' + fmtDateShort(dl.date) + '</div>' : '') +
        '</div>' +
        '<span class="badge badge-success">' + ico('check','sm') + ' Aktif</span>' +
      '</div>';
    });
    h += '</div></div>';
  }

  // Lini Massa
  h += renderLiniMassa(cid);

  // Daftar Siswa
  h += '<h3 style="color:var(--text-strong);margin:20px 0 10px;font-size:15px;font-weight:700;">' +
    ico('school') + ' Kelas ' + c.name + '</h3>';
  h += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:10px;">' + ((c.students||[]).length) + ' siswa</p>';

  if ((c.students||[]).length === 0){
    h += '<div class="empty-state">' + ico('users','lg') + '<p>Belum ada siswa.</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>No. WA</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>';
    c.students.forEach(function(s, i){
      var r = ROLES[s.role] || {label:s.role, team:'-'};
      var tc = r.team === 'produksi' ? 'badge-info' : 'badge-warning';
      h += '<tr><td>' + (i+1) + '</td>' +
        '<td><b>' + s.name + '</b></td>' +
        '<td style="font-size:12px;color:var(--text-muted);">' + (s.email||'-') + '</td>' +
        '<td style="font-size:12px;color:' + (s.phone ? 'var(--success)' : 'var(--danger)') + ';">' + (s.phone || 'tanpa WA') + '</td>' +
        '<td><span class="badge ' + tc + '">' + r.label + '</span></td>' +
        '<td>' +
        '<button class="btn btn-sm" onclick="openEditStudentModal(\'' + cid + '\',\'' + s.id + '\')">' + ico('edit') + '</button>' +
        '<button class="btn btn-sm" onclick="openResetStudentPassword(\'' + cid + '\',\'' + s.id + '\')">' + ico('key') + '</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' + cid + '\',\'' + s.id + '\')">' + ico('trash') + '</button>' +
        '</td></tr>';
    });
    h += '</tbody></table></div>';
  }

  document.getElementById('main-content').innerHTML = h;

  if (typeof window.__extrasViewClass === 'function') window.__extrasViewClass(cid);
  updateNotifBadge();
}
window.viewClass = viewClass;

/* ============================================================
   LINI MASSA
   ============================================================ */
function renderLiniMassa(cid){
  var o = localStorage.getItem('lm_open') === 'true';
  return '<details class="lini-massa" ' + (o ? 'open' : '') + ' ontoggle="localStorage.setItem(\'lm_open\',this.open)">' +
    '<summary><div class="lm-left">' +
    '<div class="lm-icon">' + ico('layers','lg') + '</div>' +
    '<div class="lm-text"><h3>Lini Massa — Alur Proses Kegiatan</h3>' +
    '<p>Klik untuk ' + (o ? 'menutup' : 'membuka') + ' timeline lengkap</p></div></div>' +
    '<div class="lm-right"><span class="lm-badge">' + (DB.stages.length + 2) + ' Tahapan</span>' +
    '<div class="lm-chevron">▼</div></div></summary>' +
    '<div class="lm-body">' + renderTimelineContent(cid) + '</div></details>';
}
function renderTimelineContent(cid){
  var h = '<div class="timeline">';
  h += '<div class="timeline-item done"><div class="box"><div class="header"><h4><span class="step-num">0</span>Persiapan Sistem</h4><span class="badge badge-success">' + ico('check','sm') + ' Setup</span></div>' +
    '<div class="sub">Guru / Admin</div>' +
    '<div class="desc">Guru menyiapkan kelas, menambah siswa, mengatur tahapan.</div></div></div>';
  DB.stages.forEach(function(s, i){
    var a = cid ? isStageActive(cid, s.id) : true;
    var d = cid ? getDeadline(cid, s.id) : null;
    var ov = d && a && isOverdue(d.date);
    var st = 'locked', bg = '<span class="badge badge-gray">' + ico('lock','sm') + ' Belum dibuka</span>';
    if (a){
      st = 'active';
      bg = ov ? '<span class="badge badge-danger">' + ico('warning','sm') + ' Lewat</span>' : '<span class="badge badge-success">' + ico('unlock','sm') + ' Aktif</span>';
    }
    h += '<div class="timeline-item ' + (st === 'active' ? 'active' : '') + '"><div class="box">' +
      '<div class="header"><h4><span class="step-num">' + (i+1) + '</span>Tahap ' + (i+1) + ': ' + s.name + '</h4>' + bg + '</div>' +
      '<div class="sub">' + (s.subtitle||'') + ' · Bobot ' + s.weight + '%' + (s.id === 'stage2' ? ' (termasuk absensi 15%)' : '') + '</div>' +
      '<div class="desc">' + (s.longDesc || s.description) + '</div>' +
      (d && d.date ? '<div class="detail-list"><b>Deadline:</b> ' + fmtDateShort(d.date) + '</div>' : '') +
      '</div></div>';
  });
  h += '<div class="timeline-item"><div class="box"><div class="header"><h4><span class="step-num">' + (DB.stages.length + 1) + '</span>Rekapitulasi Akhir</h4><span class="badge badge-primary">' + ico('settings','sm') + ' Otomatis</span></div>' +
    '<div class="sub">Guru</div>' +
    '<div class="desc">Bobot: Guru 40% + Ketua 30% + Rekan 30%.</div></div></div></div>';
  return h;
}

/* ============================================================
   ABSENSI REKAP
   ============================================================ */
function openAbsensiRekap(cid){
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var meetings = Object.values(DB.meetings || {}).filter(function(m){ return m.classId === cid; });
  var h = '<div class="alert alert-info">' + ico('info') + '<div>Rekap kehadiran ' + meetings.length + ' sesi.</div></div>';
  if (meetings.length === 0){
    h += '<div class="empty-state">' + ico('calendar','lg') + '<p>Belum ada sesi absensi.</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr><th>Nama</th>';
    meetings.forEach(function(m){ h += '<th>' + m.title + '<br><small>' + fmtDateShort(m.date || m.createdAt) + '</small></th>'; });
    h += '<th>Total Hadir</th></tr></thead><tbody>';
    c.students.forEach(function(s){
      var hadir = 0;
      h += '<tr><td><b>' + s.name + '</b></td>';
      meetings.forEach(function(m){
        var r = m.records && m.records[s.id] ? m.records[s.id] : '-';
        if (r === 'hadir') hadir++;
        var badge = r === 'hadir' ? 'badge-success' : r === 'izin' ? 'badge-info' : r === 'sakit' ? 'badge-warning' : r === 'telat' ? 'badge-warning' : r === 'alpa' ? 'badge-danger' : 'badge-gray';
        h += '<td><span class="badge ' + badge + '">' + r + '</span></td>';
      });
      h += '<td><b>' + hadir + '/' + meetings.length + '</b></td></tr>';
    });
    h += '</tbody></table></div>';
  }
  openModal('Rekap Absensi — ' + c.name, h);
}

/* ============================================================
   STUDENT MODAL
   ============================================================ */
function buildRoleOptions(sel){
  var o = '<option value="">-- Pilih --</option><optgroup label="— Tim Produksi —">';
  ['pimpinan_produksi','sekretaris','bendahara','koor_publikasi','koor_perlengkapan','koor_akomodasi','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'].forEach(function(k){ o += '<option value="' + k + '" ' + (sel === k ? 'selected' : '') + '>' + ROLES[k].label + '</option>'; });
  o += '</optgroup><optgroup label="— Tim Artistik —">';
  ['sutradara','asisten_sutradara','pemain','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'].forEach(function(k){ o += '<option value="' + k + '" ' + (sel === k ? 'selected' : '') + '>' + ROLES[k].label + '</option>'; });
  o += '</optgroup>';
  return o;
}
function openAddStudentModal(cid){
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama</label><input id="ns-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ns-email"></div>' +
    '<div class="form-group"><label>No. WhatsApp</label><input type="tel" id="ns-phone"></div>' +
    '<div class="form-group pw-toggle"><label>Password</label><input type="password" id="ns-pw"><button class="toggle-btn" onclick="togglePw(\'ns-pw\',this)" type="button"></button></div>' +
    '<div class="form-group"><label>Peran</label><select id="ns-role">' + buildRoleOptions() + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="addStudent(\'' + cid + '\')">' + ico('save') + ' Simpan</button>');
}
function addStudent(cid){
  var n = document.getElementById('ns-name').value.trim();
  var e = document.getElementById('ns-email').value.trim().toLowerCase();
  var p = document.getElementById('ns-pw').value;
  var r = document.getElementById('ns-role').value;
  var phEl = document.getElementById('ns-phone');
  var ph = phEl ? phEl.value.replace(/\D/g,'') : '';
  if (!n || !e || !p || !r){ alert('Lengkapi!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ alert('Email invalid!'); return; }
  if (p.length < 6){ alert('Min 6!'); return; }
  var d = false;
  DB.classes.forEach(function(c){ if (c.students.some(function(s){ return s.email && s.email.toLowerCase() === e; })) d = true; });
  if (d){ alert('Email terdaftar!'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var ns = c.students.concat([{id:uid(), name:n, email:e, password:p, role:r, phone:ph || ''}]);
  fbSetClass(Object.assign({}, c, {students:ns})).then(function(){ closeModal(); });
}
function openEditStudentModal(cid, sid){
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var s = c.students.find(function(x){ return x.id === sid; });
  openModal('Edit Siswa',
    '<div class="form-group"><label>Nama</label><input id="es-name" value="' + s.name + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="es-email" value="' + (s.email||'') + '"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="es-phone" value="' + (s.phone||'') + '"></div>' +
    '<div class="form-group pw-toggle"><label>Password (kosongkan)</label><input type="password" id="es-pw"><button class="toggle-btn" onclick="togglePw(\'es-pw\',this)" type="button"></button></div>' +
    '<div class="form-group"><label>Peran</label><select id="es-role">' + buildRoleOptions(s.role) + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateStudent(\'' + cid + '\',\'' + sid + '\')">' + ico('save') + ' Simpan</button>');
}
function updateStudent(cid, sid){
  var n = document.getElementById('es-name').value.trim();
  var e = document.getElementById('es-email').value.trim().toLowerCase();
  var p = document.getElementById('es-pw').value;
  var r = document.getElementById('es-role').value;
  var phEl = document.getElementById('es-phone');
  var ph = phEl ? phEl.value.replace(/\D/g,'') : '';
  if (!n || !e){ alert('Lengkapi!'); return; }
  if (p && p.length < 6){ alert('Min 6!'); return; }
  var d = false;
  DB.classes.forEach(function(c){ c.students.forEach(function(s){ if (s.id !== sid && s.email && s.email.toLowerCase() === e) d = true; }); });
  if (d){ alert('Email terdaftar!'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var ns = c.students.map(function(s){
    if (s.id !== sid) return s;
    var u = Object.assign({}, s, {name:n, email:e, role:r, phone:ph || ''});
    if (p) u.password = p;
    return u;
  });
  fbSetClass(Object.assign({}, c, {students:ns})).then(function(){ closeModal(); });
}
function openResetStudentPassword(cid, sid){
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var s = c.students.find(function(x){ return x.id === sid; });
  openModal('Reset Password',
    '<div class="alert alert-warning">' + ico('warning') + '<div>Reset <b>' + s.name + '</b>.</div></div>' +
    '<div class="form-group pw-toggle"><label>Password Baru</label><input type="password" id="rs-pw"><button class="toggle-btn" onclick="togglePw(\'rs-pw\',this)" type="button"></button></div>' +
    '<button class="btn btn-primary btn-block" onclick="resetStudentPassword(\'' + cid + '\',\'' + sid + '\')">' + ico('key') + ' Reset</button>');
}
function resetStudentPassword(cid, sid){
  var p = document.getElementById('rs-pw').value;
  if (!p || p.length < 6){ alert('Min 6!'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  var ns = c.students.map(function(s){ return s.id === sid ? Object.assign({}, s, {password:p}) : s; });
  fbSetClass(Object.assign({}, c, {students:ns})).then(function(){ closeModal(); alert('Password direset!'); });
}

/* ============================================================
   IMPORT EXCEL
   ============================================================ */
function openImportModal(cid){
  if (!ownsClass(cid)){ alert('Tidak punya akses.'); return; }
  openModal('Import Excel',
    '<div class="alert alert-info">' + ico('info') + '<div><b>Format:</b> Nama | Email | Password | Role | No. WA</div></div>' +
    '<div class="action-row" style="margin-bottom:14px;"><button class="btn btn-sm" onclick="downloadTemplate()">' + ico('download') + ' Template</button></div>' +
    '<label class="file-input"><input type="file" id="excel-file" accept=".xlsx,.xls" onchange="showFileName(this)"><p>Klik untuk pilih file Excel</p><div class="filename" id="filename-display"></div></label>' +
    '<button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="importExcel(\'' + cid + '\')">' + ico('upload') + ' Import</button>');
}
function showFileName(i){
  var n = i.files[0] ? i.files[0].name : '';
  document.getElementById('filename-display').textContent = n;
}
function downloadTemplate(){
  var d = [['Nama','Email','Password','Role','No. WA'],['Ahmad Fauzi','ahmad@siswa.smp.belajar.id','#Smpn10smd','pemain','08123456789']];
  var ws = XLSX.utils.aoa_to_sheet(d);
  ws['!cols'] = [{wch:25},{wch:35},{wch:15},{wch:25},{wch:15}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'Template_Import_Siswa.xlsx');
}
function importExcel(cid){
  var f = document.getElementById('excel-file').files[0];
  if (!f){ alert('Pilih file!'); return; }
  var r = new FileReader();
  r.onload = function(e){
    try {
      var data = new Uint8Array(e.target.result);
      var wb = XLSX.read(data, {type:'array'});
      var sh = wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(sh);
      if (rows.length === 0){ alert('Kosong!'); return; }
      var c = DB.classes.find(function(x){ return x.id === cid; });
      var ok = 0, bad = [], dup = [];
      var ex = new Set();
      DB.classes.forEach(function(cc){ cc.students.forEach(function(s){ if (s.email) ex.add(s.email.toLowerCase()); }); });
      var newStudents = c.students.slice();
      rows.forEach(function(row, i){
        var n = (row['Nama'] || row['nama'] || '').toString().trim();
        var em = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
        var p = (row['Password'] || row['password'] || '').toString().trim();
        var ro = (row['Role'] || row['role'] || '').toString().trim().toLowerCase();
        var ph = (row['No. WA'] || row['no. wa'] || '').toString().replace(/\D/g,'');
        if (!n || !em || !p || !ro){ bad.push('Baris ' + (i+2)); return; }
        if (ex.has(em)){ dup.push('Baris ' + (i+2)); return; }
        newStudents.push({id:uid(), name:n, email:em, password:p, role:ro, phone:ph || ''});
        ex.add(em);
        ok++;
      });
      fbSetClass(Object.assign({}, c, {students:newStudents})).then(function(){
        var m = 'Berhasil: ' + ok;
        if (dup.length) m += '\nDup: ' + dup.length;
        if (bad.length) m += '\nGagal: ' + bad.length;
        alert(m);
        closeModal();
      });
    } catch(err){ alert('Error: ' + err.message); }
  };
  r.readAsArrayBuffer(f);
}

/* ============================================================
   GURU PASSWORD VIEW
   ============================================================ */
function openGuruPasswordView(cid){
  cid = cid || window.__currentViewClassId;
  if (!cid){ alert('Pilih kelas dulu'); return; }
  if (!ownsClass(cid)){ alert('Akses ditolak'); return; }
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var h = '<div class="alert alert-warning">' + ico('warning') + '<div><b>RAHASIA</b> — jangan sebarkan</div></div>' +
    '<input type="text" id="pwd-search" placeholder="Cari..." style="width:100%;padding:10px;margin-bottom:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);" oninput="window.__renderPwdTable()">' +
    '<div id="pwd-table"></div>';
  openModal('Password Siswa — ' + c.name, h);
  window.__viewClassId = cid;
  window.__currentViewClassId = cid;
  setTimeout(window.__renderPwdTable, 100);
}
window.__renderPwdTable = function(){
  var cid = window.__currentViewClassId || window.__viewClassId;
  var c = DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var q = (document.getElementById('pwd-search') || {}).value || '';
  q = q.toLowerCase().trim();
  var students = (c.students || []);
  if (q) students = students.filter(function(s){
    return (s.name||'').toLowerCase().indexOf(q) >= 0 || (s.email||'').toLowerCase().indexOf(q) >= 0;
  });
  var wrap = document.getElementById('pwd-table');
  if (!wrap) return;
  if (students.length === 0){ wrap.innerHTML = '<div class="empty-state"><p>Tidak ada</p></div>'; return; }
  var h = '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>Password</th></tr></thead><tbody>';
  students.forEach(function(s, i){
    h += '<tr><td>' + (i+1) + '</td>' +
      '<td><b>' + s.name + '</b></td>' +
      '<td style="font-size:12px;color:var(--text-muted);">' + (s.email||'-') + '</td>' +
      '<td><code style="background:var(--warning-soft);padding:3px 8px;border-radius:4px;">' + (s.password||'-') + '</code></td></tr>';
  });
  h += '</tbody></table></div>';
  wrap.innerHTML = h;
};

/* ============================================================
   WA LOGS GLOBAL
   ============================================================ */
function openWaLogsGlobal(){
  var h = '<div class="alert alert-info">' + ico('info') + '<div>Riwayat komunikasi.</div></div>';
  h += '<div class="action-row" style="margin-bottom:12px;">' +
    '<input id="wa-log-search" class="wa-search" placeholder="Cari..." oninput="renderWaLogsBody()" style="flex:1;">' +
    '<button class="btn btn-sm" onclick="exportWaLogs()">' + ico('download','sm') + ' Export</button></div>';
  h += '<div id="wa-logs-body"></div>';
  openModal('Log Komunikasi Global', h);
  renderWaLogsBody();
}
function renderWaLogsBody(){
  var b = document.getElementById('wa-logs-body');
  if (!b) return;
  var q = (document.getElementById('wa-log-search') && document.getElementById('wa-log-search').value || '').toLowerCase();
  var logs = (DB.waLogs || []).slice();
  if (window.currentUser && window.currentUser.type === 'guru'){
    var myIds = myClasses().map(function(c){ return c.id; });
    logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
  }
  if (q){
    logs = logs.filter(function(l){
      return (l.toName || '').toLowerCase().indexOf(q) >= 0 ||
             (l.fromName || '').toLowerCase().indexOf(q) >= 0 ||
             (l.title || '').toLowerCase().indexOf(q) >= 0;
    });
  }
  if (logs.length === 0){ b.innerHTML = '<div class="empty-state">' + ico('send','lg') + '<p>Belum ada log.</p></div>'; return; }
  var h = '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Total: ' + logs.length + '</div>';
  logs.slice(0, 100).forEach(function(l){
    var chB = l.channel === 'both' ? '<span class="badge badge-channel-both">App + WA</span>' :
      (l.channel === 'wa' ? '<span class="badge badge-channel-wa">WA</span>' : '<span class="badge badge-channel-app">App</span>');
    var tB = ({tugas:'badge-info',instruksi:'badge-primary',info:'badge-success',urgent:'badge-danger',broadcast:'badge-primary'})[l.type] || 'badge-gray';
    h += '<div class="wa-log-item">' +
      '<div class="wa-log-header"><span class="badge ' + tB + '">' + l.type + '</span>' + chB +
      '<span class="wa-log-time">' + fmtDate(l.createdAt) + '</span></div>' +
      '<div class="wa-log-title">' + l.title + '</div>' +
      '<div class="wa-log-meta">Dari: <b>' + l.fromName + '</b> → Ke: <b>' + l.toName + '</b>' +
      (l.toPhone ? ' <span class="wa-log-phone">' + ico('phone','sm') + ' ' + l.toPhone + '</span>' : '') + '</div>' +
      '<div class="wa-log-body">' + l.message + '</div></div>';
  });
  b.innerHTML = h;
}
function exportWaLogs(){
  var logs = DB.waLogs || [];
  if (window.currentUser && window.currentUser.type === 'guru'){
    var myIds = myClasses().map(function(c){ return c.id; });
    logs = logs.filter(function(l){ return !l.classId || myIds.indexOf(l.classId) >= 0; });
  }
  if (logs.length === 0){ alert('Tidak ada log.'); return; }
  var rows = [['Waktu','Dari','Peran','Ke','No. WA','Channel','Jenis','Judul','Pesan']];
  logs.forEach(function(l){
    rows.push([new Date(l.createdAt).toLocaleString('id-ID'), l.fromName, l.fromRole || l.fromType, l.toName, l.toPhone || '-', l.channel, l.type, l.title, l.message]);
  });
  var ws = XLSX.utils.aoa_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Log');
  XLSX.writeFile(wb, 'Log_Komunikasi.xlsx');
}

/* ============================================================
   SISWA DASHBOARD — V10 dengan Tahapan & Penilaian
   ============================================================ */
function renderSiswaDashboard(){
  document.getElementById('header-title-text').innerHTML = ico('user') + ' Dashboard Siswa';
  var c = DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
  if (!c){
    document.getElementById('main-content').innerHTML = '<div class="empty-state">' + ico('warning','lg') + '<p>Kelas tidak ditemukan.</p></div>';
    return;
  }
  var me = c.students.find(function(s){ return s.id === window.currentUser.studentId; });
  if (!me){
    document.getElementById('main-content').innerHTML = '<div class="empty-state">' + ico('warning','lg') + '<p>Data siswa tidak ditemukan.</p></div>';
    return;
  }

  var activeStages = getActiveStages(c.id);
  var me_struktur = window.getStrukturMeta ? window.getStrukturMeta(me.role) : {jabatan: me.role};

  var h = '';

  // Welcome banner
  h += '<div class="progress-banner">' +
    '<h3>' + ico('user') + ' Selamat Datang</h3>' +
    '<div style="font-size:16px;font-weight:700;color:var(--text-strong);margin:6px 0;">' + me.name + '</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">' + me_struktur.jabatan + ' · Kelas ' + c.name + '</div>' +
  '</div>';

  // Aksi cepat
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openPenilaianSiswaDashboard()">' +
      ico('edit') + ' Beri Nilai Rekan' +
    '</button>' +
    '<button class="btn" onclick="openStrukturKerabatKerja()">' +
      ico('award') + ' Struktur' +
    '</button>' +
    '<button class="btn" onclick="openSistemTahapan(\'' + c.id + '\')">' +
      ico('layers') + ' Tahapan' +
    '</button>' +
    '<button class="btn" onclick="openMainMenu()">' +
      ico('gear') + ' Menu' +
    '</button>' +
  '</div>';

  // Statistik
  var targets = (c.students || []).filter(function(s){
    return s.id !== me.id && (window.canRoleEvaluate ? window.canRoleEvaluate(me.role, s.role) : true);
  });
  var totalNeeded = targets.length * activeStages.length;
  var totalDone = 0;
  targets.forEach(function(t){
    activeStages.forEach(function(s){
      var ev = (DB.evaluations[c.id] && DB.evaluations[c.id][t.id]) || {};
      var myScores = ev[me.id] && ev[me.id][s.id];
      if (myScores && Object.keys(myScores).length > 0) totalDone++;
    });
  });
  var pct = totalNeeded > 0 ? Math.round(totalDone / totalNeeded * 100) : 0;

  h += '<div class="grid" style="margin-bottom:18px;">' +
    '<div class="card" style="margin:0;"><div style="display:flex;align-items:center;gap:12px;">' +
      '<div style="width:48px;height:48px;border-radius:12px;background:var(--primary-soft);' +
        'display:flex;align-items:center;justify-content:center;color:var(--primary);">' +
        ico('target',22) + '</div>' +
      '<div><div style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Penilaian</div>' +
        '<div style="font-size:22px;font-weight:800;color:var(--text-strong);">' + totalDone + '/' + totalNeeded + '</div></div>' +
    '</div></div>' +
    '<div class="card" style="margin:0;"><div style="display:flex;align-items:center;gap:12px;">' +
      '<div style="width:48px;height:48px;border-radius:12px;background:var(--success-soft);' +
        'display:flex;align-items:center;justify-content:center;color:var(--success);">' +
        ico('layers',22) + '</div>' +
      '<div><div style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Tahap Aktif</div>' +
        '<div style="font-size:22px;font-weight:800;color:var(--text-strong);">' + activeStages.length + '</div></div>' +
    '</div></div>' +
    '<div class="card" style="margin:0;"><div style="display:flex;align-items:center;gap:12px;">' +
      '<div style="width:48px;height:48px;border-radius:12px;background:var(--info-soft);' +
        'display:flex;align-items:center;justify-content:center;color:var(--info);">' +
        ico('users',22) + '</div>' +
      '<div><div style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Rekan</div>' +
        '<div style="font-size:22px;font-weight:800;color:var(--text-strong);">' + targets.length + '</div></div>' +
    '</div></div>' +
  '</div>';

  // Progress bar penilaian
  h += '<div class="card" style="margin-bottom:14px;">' +
    '<h3>' + ico('chart',18) + ' Progress Penilaian</h3>' +
    '<div class="progress-container" style="height:12px;">' +
      '<div class="progress-bar ' + (pct === 100 ? 'complete' : pct > 0 ? 'partial' : '') + '" style="width:' + pct + '%"></div>' +
    '</div>' +
    '<div style="text-align:center;margin-top:8px;font-size:13px;font-weight:600;">' + pct + '% selesai</div>' +
  '</div>';

  // Tahapan aktif
  h += '<h3 style="color:var(--text-strong);margin:20px 0 10px;font-size:15px;font-weight:700;">' +
    ico('layers') + ' Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">' + ico('lock') + '<div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="stage-grid">';
    activeStages.forEach(function(s){
      var done = 0;
      targets.forEach(function(t){
        var ev = (DB.evaluations[c.id] && DB.evaluations[c.id][t.id]) || {};
        var myScores = ev[me.id] && ev[me.id][s.id];
        if (myScores && Object.keys(myScores).length > 0) done++;
      });
      var tot = targets.length;
      h += '<div class="stage-card' + (done === tot && tot > 0 ? ' completed' : '') + '" onclick="openPenilaianTahap(\'' + c.id + '\',\'' + s.id + '\')">' +
        '<div class="stage-num">' + (DB.stages.indexOf(s) + 1) + '</div>' +
        '<h4>' + s.name + '</h4>' +
        '<p>' + (s.subtitle || s.description || '') + '</p>' +
        '<div class="progress ' + (done === tot && tot > 0 ? 'done' : 'pending') + '">' + done + '/' + tot + ' dinilai</div>' +
        '</div>';
    });
    h += '</div>';
  }

  // Deadline tugas
  var notifs = (DB.notifications || []).filter(function(n){
    if (n.classId !== c.id) return false;
    if (n.type !== 'tugas') return false;
    return n.toId === 'all' || n.toId === me.id;
  }).sort(function(a,b){ return (b.createdAt || 0) - (a.createdAt || 0); }).slice(0, 5);

  h += '<h3 style="color:var(--text-strong);margin:20px 0 10px;font-size:15px;font-weight:700;">' +
    ico('clock') + ' Deadline & Tugas</h3>';
  if (notifs.length === 0){
    h += '<div class="alert alert-info">' + ico('info') + '<div>Tidak ada tugas baru.</div></div>';
  } else {
    notifs.forEach(function(n){
      h += '<div class="welcome-item urgent"><div style="flex:1;">' +
        '<b>' + String(n.title || 'Tugas') + '</b><br>' +
        '<small style="color:var(--text-muted);">' + String(n.fromName || '') + ' - ' + fmtDate(n.createdAt) + '</small>' +
        (n.message ? '<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">' + n.message + '</div>' : '') +
      '</div></div>';
    });
  }

  h += renderActivityFeed('siswa');
  document.getElementById('main-content').innerHTML = h;
  updateNotifBadge();
}

/* ============================================================
   BOOT
   ============================================================ */
function boot(){
  console.log('Boot SP-PPT v10.0...');
  initTheme();
  if (!firebaseReady){
    var t = document.getElementById('loading-text'), s = document.getElementById('loading-sub');
    if (t) t.textContent = 'Firebase tidak siap';
    if (s) s.textContent = firebaseError;
    setTimeout(function(){ showLoginPage(); }, 800);
    return;
  }
  subscribeAll();
  setTimeout(function(){
    var sess = getSession();
    if (sess){
      setTimeout(function(){
        if (sess.type === 'guru'){
          var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase() === String(sess.email || '').toLowerCase(); });
          if (t){
            window.currentUser = {type:'guru', email:t.email, name:t.name, phone:t.phone || ''};
            saveSession(); showApp(); return;
          }
        }
        if (sess.type === 'admin'){
          window.currentUser = {type:'admin', email:sess.email, name:sess.name};
          saveSession(); showApp(); return;
        }
        if (sess.type === 'siswa'){
          var c = DB.classes.find(function(x){ return x.id === sess.classId; });
          if (c){
            var s = c.students.find(function(x){ return x.id === sess.studentId; });
            if (s){
              window.currentUser = {type:'siswa', classId:c.id, studentId:s.id, name:s.name, role:s.role, phone:s.phone || ''};
              saveSession(); showApp(); return;
            }
          }
        }
        showLoginPage();
      }, 600);
    } else setTimeout(showLoginPage, 600);
  }, 900);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* ============================================================
   GLOBAL EXPORTS
   ============================================================ */
window.firebaseReady = firebaseReady;
window.fb = fb;
window.DB = DB;
window.ROLES = ROLES;
window.DIVISIONS = DIVISIONS;
window.RUBRICS = RUBRICS;
window.DEFAULT_STAGES = DEFAULT_STAGES;
window.uid = uid;
window.genClassCode = genClassCode;
window.getSession = getSession;
window.saveSession = saveSession;
window.clearSession = clearSession;
window.fbSetTeacher = fbSetTeacher;
window.fbDelTeacher = fbDelTeacher;
window.fbSetClass = fbSetClass;
window.fbSetEval = fbSetEval;
window.fbSetDeadlines = fbSetDeadlines;
window.fbSetActiveStages = fbSetActiveStages;
window.fbAddNotif = fbAddNotif;
window.fbDelNotif = fbDelNotif;
window.fbSetStages = fbSetStages;
window.fbAddActivity = fbAddActivity;
window.ico = ico;
window.togglePw = togglePw;
window.openModal = openModal;
window.closeModal = closeModal;
window.fmtDate = fmtDate;
window.fmtDateShort = fmtDateShort;
window.isOverdue = isOverdue;
window.getDeadline = getDeadline;
window.isStageActive = isStageActive;
window.getStage = getStage;
window.getActiveStages = getActiveStages;
window.getRubricFor = getRubricFor;
window.getDivisionOfRole = getDivisionOfRole;
window.canSendBroadcast = canSendBroadcast;
window.logActivity = logActivity;
window.debouncedRender = debouncedRender;
window.canGuruEvaluate = canGuruEvaluate;
window.sanitizeFirestore = sanitizeFirestore;
window.renderGuruDashboard = renderGuruDashboard;
window.renderSiswaDashboard = renderSiswaDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.viewClass = viewClass;
window.showLoginPage = showLoginPage;
window.showRegisterPage = showRegisterPage;
window.showApp = showApp;
window.switchLoginTab = switchLoginTab;
window.loginGuru = loginGuru;
window.loginSiswa = loginSiswa;
window.loginAdmin = loginAdmin;
window.registerSiswa = registerSiswa;
window.logout = logout;
window.setTheme = setTheme;
window.openForgotPassword = openForgotPassword;
window.sendResetCode = sendResetCode;
window.resetPassword = resetPassword;
window.openChangePassword = openChangePassword;
window.saveChangePassword = saveChangePassword;
window.openBroadcastModal = openBroadcastModal;
window.sendBroadcast = sendBroadcast;
window.updateBroadcastTargets = updateBroadcastTargets;
window.openWaLogsGlobal = openWaLogsGlobal;
window.renderWaLogsBody = renderWaLogsBody;
window.exportWaLogs = exportWaLogs;
window.openActivityLog = openActivityLog;
window.openAddClassModal = openAddClassModal;
window.addClass = addClass;
window.deleteClass = deleteClass;
window.deleteStudent = deleteStudent;
window.regenerateClassCode = regenerateClassCode;
window.copyClassCode = copyClassCode;
window.openAddStudentModal = openAddStudentModal;
window.addStudent = addStudent;
window.openEditStudentModal = openEditStudentModal;
window.updateStudent = updateStudent;
window.openResetStudentPassword = openResetStudentPassword;
window.resetStudentPassword = resetStudentPassword;
window.openImportModal = openImportModal;
window.downloadTemplate = downloadTemplate;
window.showFileName = showFileName;
window.importExcel = importExcel;
window.openGuruPasswordView = openGuruPasswordView;
window.openAbsensiRekap = openAbsensiRekap;
window.openNotifPanel = openNotifPanel;
window.closeNotifPanel = closeNotifPanel;
window.markNotifRead = markNotifRead;
window.markTaskDone = markTaskDone;
window.deleteNotif = deleteNotif;
window.updateNotifBadge = updateNotifBadge;
window.getNotifsFor = getNotifsFor;
window.getUserKey = getUserKey;
window.openSingleWa = openSingleWa;
window.openAllWaTabs = openAllWaTabs;
window.copyWaAllMessages = copyWaAllMessages;
window.buildRoleOptions = buildRoleOptions;
window.openAddTeacherModal = openAddTeacherModal;
window.addTeacher = addTeacher;
window.openEditTeacherModal = openEditTeacherModal;
window.updateTeacher = updateTeacher;
window.deleteTeacher = deleteTeacher;
window.renderActivityFeed = renderActivityFeed;

console.log('[app.js] v10.0 FINAL loaded');
})();
