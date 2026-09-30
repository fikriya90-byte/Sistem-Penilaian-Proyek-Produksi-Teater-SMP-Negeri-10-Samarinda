/* ============================================================
   SP-PPT app.js — v11.1 (NO EMOJI — ONLY SVG ICONS)
   ============================================================ */
(function(){
'use strict';

/* ===== LOADING ===== */
var _hid = false;
function forceHide(){
  if (_hid) return; _hid = true;
  var l = document.getElementById('loading-screen');
  if (l){ l.style.transition='opacity .3s'; l.style.opacity='0'; setTimeout(function(){ l.style.display='none'; }, 350); }
}
setTimeout(forceHide, 3000);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(forceHide, 800); });
else setTimeout(forceHide, 800);
window.__forceHideLoading = forceHide;

/* ===== ICON HELPER ===== */
function ic(name, size){ return window.ico ? window.ico(name, size) : ''; }

/* ===== CONFIG ===== */
var ADMIN = { email:'fikri.yassaar15@guru.smp.belajar.id', password:'#Smpn10smd', name:'Fikri Yassaar Arrazaq, S.Sn. (Admin)' };
var DEFAULT_TEACHERS = [{ email:'fikri.yassaar15@guru.smp.belajar.id', password:'#Smpn10smd', name:'Fikri Yassaar Arrazaq, S.Sn.' }];
var DEFAULT_STAGES = [
  {id:'stage1',name:'Perencanaan',subtitle:'Pra-Produksi',description:'Konsep, jadwal, RAB.',weight:20},
  {id:'stage2',name:'Pelaksanaan',subtitle:'Produksi & Latihan',description:'Latihan & eksekusi.',weight:35},
  {id:'stage3',name:'Pertunjukan',subtitle:'Show Time',description:'Hari H.',weight:35},
  {id:'stage4',name:'Evaluasi',subtitle:'Pasca-Produksi',description:'Laporan & refleksi.',weight:10}
];
var ROLES = {
  pimpinan_produksi:{label:'Pimpinan Produksi',team:'produksi'},
  sekretaris:{label:'Sekretaris',team:'produksi'},
  bendahara:{label:'Bendahara',team:'produksi'},
  koor_publikasi:{label:'Koor. Publikasi & Dokumentasi',team:'produksi'},
  koor_perlengkapan:{label:'Koor. Perlengkapan',team:'produksi'},
  koor_akomodasi:{label:'Koor. Akomodasi & Transportasi',team:'produksi'},
  anggota_publikasi:{label:'Anggota Publikasi',team:'produksi'},
  anggota_perlengkapan:{label:'Anggota Perlengkapan',team:'produksi'},
  anggota_akomodasi:{label:'Anggota Akomodasi',team:'produksi'},
  sutradara:{label:'Sutradara',team:'artistik'},
  asisten_sutradara:{label:'Asisten Sutradara',team:'artistik'},
  pemain:{label:'Pemeran',team:'artistik'},
  koor_panggung:{label:'Koor. Tata Pentas & Panggung',team:'artistik'},
  koor_musik:{label:'Koor. Tata Musik & Suara',team:'artistik'},
  koor_busana:{label:'Koor. Tata Busana',team:'artistik'},
  koor_rias:{label:'Koor. Tata Rias',team:'artistik'},
  koor_cahaya:{label:'Koor. Tata Cahaya',team:'artistik'},
  anggota_panggung:{label:'Anggota Tata Pentas',team:'artistik'},
  anggota_musik:{label:'Anggota Tata Musik',team:'artistik'},
  anggota_busana:{label:'Anggota Tata Busana',team:'artistik'},
  anggota_rias:{label:'Anggota Tata Rias',team:'artistik'},
  anggota_cahaya:{label:'Anggota Tata Cahaya',team:'artistik'}
};
var RUBRICS = {
  pimpinan_produksi:[{id:'pp1',name:'Perencanaan & Pengelolaan',weight:25,desc:'Rencana detail',scale:'4=Sebelum · 3=Tepat · 2=Mundur · 1=Gagal'},{id:'pp2',name:'Seleksi & Pengaturan Tim',weight:20,desc:'Penempatan tepat'},{id:'pp3',name:'Manajemen Anggaran',weight:20,desc:'Efisien'},{id:'pp4',name:'Koordinasi Lintas Divisi',weight:20,desc:'Harmonis'},{id:'pp5',name:'Evaluasi & Pelaporan',weight:15,desc:'Lengkap'}],
  sutradara:[{id:'sr1',name:'Pengembangan Konsep',weight:25,desc:'Unik'},{id:'sr2',name:'Casting',weight:20,desc:'Cocok'},{id:'sr3',name:'Pengarahan Pemain',weight:25,desc:'Blocking sempurna'},{id:'sr4',name:'Koordinasi Artistik',weight:15,desc:'Menyatu'},{id:'sr5',name:'Rekayasa Emosi',weight:15,desc:'Dramatis'}],
  sekretaris:[{id:'sk1',name:'Dokumentasi & Arsip',weight:30,desc:'Rapi'},{id:'sk2',name:'Penjadwalan',weight:25,desc:'Jauh hari'},{id:'sk3',name:'Korespondensi',weight:25,desc:'Jelas'},{id:'sk4',name:'Penyusunan Laporan',weight:20,desc:'Lengkap'}],
  bendahara:[{id:'bd1',name:'Pencatatan Transaksi',weight:30,desc:'Detail'},{id:'bd2',name:'Pengelolaan Keuangan',weight:30,desc:'Transparan'},{id:'bd3',name:'Perencanaan RAB',weight:20,desc:'Realistis'},{id:'bd4',name:'Pelaporan',weight:20,desc:'Tepat waktu'}],
  asisten_sutradara:[{id:'as1',name:'Koordinasi & Logistik',weight:30,desc:'Siap'},{id:'as2',name:'Pencatatan',weight:25,desc:'Lengkap'},{id:'as3',name:'Bantu Koordinasi Teknis',weight:25,desc:'Proaktif'},{id:'as4',name:'Backup Sutradara',weight:20,desc:'Siap'}],
  pemain:[{id:'pm1',name:'Penguasaan Naskah',weight:30,desc:'Hafal'},{id:'pm2',name:'Ekspresi & Emosi',weight:25,desc:'Mendalam'},{id:'pm3',name:'Blocking & Posisi',weight:20,desc:'Presisi'},{id:'pm4',name:'Kerja Sama',weight:15,desc:'Natural'},{id:'pm5',name:'Konsistensi Latihan',weight:10,desc:'Disiplin'}],
  koor_produksi:[{id:'kp1',name:'Penyediaan Kebutuhan',weight:30,desc:'Lengkap'},{id:'kp2',name:'Pengelolaan Anggota',weight:25,desc:'Optimal'},{id:'kp3',name:'Koordinasi Teknis',weight:25,desc:'Lancar'},{id:'kp4',name:'Pelaporan',weight:20,desc:'Detail'}],
  koor_artistik:[{id:'ka1',name:'Desain & Konsep',weight:25,desc:'Kreatif'},{id:'ka2',name:'Eksekusi Teknis',weight:35,desc:'Rapi'},{id:'ka3',name:'Koordinasi Tim',weight:25,desc:'Komunikatif'},{id:'ka4',name:'Pengelolaan Anggota',weight:15,desc:'Optimal'}],
  anggota:[{id:'ag1',name:'Penyelesaian Tugas',weight:30,desc:'Tepat waktu'},{id:'ag2',name:'Kualitas Kerja',weight:25,desc:'Teliti'},{id:'ag3',name:'Kerja Sama Tim',weight:25,desc:'Proaktif'},{id:'ag4',name:'Kedisiplinan',weight:20,desc:'Hadir'}]
};
function getRubricFor(r){
  if (r==='pimpinan_produksi') return RUBRICS.pimpinan_produksi;
  if (r==='sutradara') return RUBRICS.sutradara;
  if (r==='sekretaris') return RUBRICS.sekretaris;
  if (r==='bendahara') return RUBRICS.bendahara;
  if (r==='asisten_sutradara') return RUBRICS.asisten_sutradara;
  if (r==='pemain') return RUBRICS.pemain;
  if (['koor_publikasi','koor_perlengkapan','koor_akomodasi'].indexOf(r)>=0) return RUBRICS.koor_produksi;
  if (['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'].indexOf(r)>=0) return RUBRICS.koor_artistik;
  return RUBRICS.anggota;
}

/* ===== FIREBASE ===== */
var firebaseReady = false, fb = null, firebaseError = '';
try {
  if (typeof firebase === 'undefined') throw new Error('Firebase SDK tidak termuat');
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey) throw new Error('Firebase config belum diisi');
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  fb = firebase.firestore();
  try { fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); } catch(e){}
  firebaseReady = true;
  console.log('Firebase ready');
} catch(e){ console.error('Firebase:', e.message); firebaseError = e.message; }

function uid(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
function genCode(n){ var c = String(n||'KLS').replace(/[^A-Z0-9]/gi,'').toUpperCase().substring(0,4); return c + '-' + Math.floor(1000+Math.random()*9000); }
function safeFS(o){
  if (o===undefined || o===null) return o;
  if (typeof o!=='object') return o;
  if (Array.isArray(o)) return o.map(safeFS).filter(function(v){ return v!==undefined; });
  var c = {};
  for (var k in o){ if (!Object.prototype.hasOwnProperty.call(o,k)) continue; if (o[k]===undefined) continue; c[k] = safeFS(o[k]); }
  return c;
}
function fbSet(col, id, data){ if (!firebaseReady) return Promise.resolve(); return fb.collection(col).doc(id).set(safeFS(data), {merge:true}); }
function fbDel(col, id){ if (!firebaseReady) return Promise.resolve(); return fb.collection(col).doc(id).delete(); }

/* ===== STATE ===== */
var DB = { teachers:[], classes:[], evaluations:{}, deadlines:{}, activeStages:{}, notifications:[], stages:JSON.parse(JSON.stringify(DEFAULT_STAGES)), checklists:{}, activityLogs:[] };
window.currentUser = null;
var SESSION_KEY = 'sppt_session';
function saveSession(){ try{ if(window.currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(window.currentUser)); }catch(e){} }
function clearSession(){ try{ localStorage.removeItem(SESSION_KEY); }catch(e){} }
function getSession(){ try{ var s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }catch(e){ return null; } }

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
    var c = DB.classes.find(function(x){ return x.id===cid; });
    return !!(c && String(c.teacherEmail||'').toLowerCase() === String(window.currentUser.email||'').toLowerCase());
  }
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  return false;
}

/* ===== NOTIF HELPERS ===== */
function getNotifKey(){
  if (!window.currentUser) return null;
  if (window.currentUser.type === 'siswa') return window.currentUser.studentId;
  if (window.currentUser.type === 'guru') return 'guru:' + String(window.currentUser.email||'').toLowerCase();
  return 'admin';
}
function getNotifs(){
  if (!window.currentUser) return [];
  var u = window.currentUser;
  if (u.type === 'siswa') return DB.notifications.filter(function(n){ return n.classId===u.classId && (n.toId==='all' || n.toId===u.studentId); });
  if (u.type === 'guru'){ var ids = myClasses().map(function(c){ return c.id; }); return DB.notifications.filter(function(n){ return n.classId && ids.indexOf(n.classId)>=0; }); }
  return DB.notifications.slice();
}
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

/* ===== THEME ===== */
window.setTheme = function(m){
  localStorage.setItem('sppt_theme', m);
  var a = m === 'auto' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : m;
  document.documentElement.setAttribute('data-theme', a);
  document.querySelectorAll('.theme-toggle button').forEach(function(b){ b.classList.toggle('active', b.dataset.theme === m); });
};

/* ===== SCREENS ===== */
window.showLoginPage = function(){
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.add('hidden');
};
window.showRegisterPage = function(){
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
  refreshRoleDropdown();
  if (window.hydrateIcons) window.hydrateIcons();
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
  s.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  DB.classes.forEach(function(c){ s.innerHTML += '<option value="' + c.id + '">' + c.name + '</option>'; });
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

/* ===== MODAL ===== */
window.openModal = function(t, b){
  document.getElementById('modal-title').innerHTML = t;
  document.getElementById('modal-body').innerHTML = b;
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(function(){
    document.querySelectorAll('#modal-body .toggle-btn').forEach(function(btn){
      if (!btn.querySelector('svg')) btn.innerHTML = ic('eye', 16);
    });
    if (window.hydrateIcons){
      var modalBody = document.getElementById('modal-body');
      if (modalBody) window.hydrateIcons(modalBody);
    }
  }, 10);
};
window.closeModal = function(){ document.getElementById('modal').classList.add('hidden'); };

/* ===== NOTIF PANEL ===== */
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
    b.innerHTML = '<div class="notif-empty">' + ic('bell', 'lg') + '<p>Belum ada notifikasi</p></div>';
    return;
  }
  var key = getNotifKey(), h = '';
  list.forEach(function(n){
    var r = n.readBy && n.readBy.indexOf(key) >= 0;
    var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type] || 'Info';
    var tc = {tugas:'notif-type-tugas',instruksi:'notif-type-instruksi',info:'notif-type-info',urgent:'notif-type-urgent'}[n.type] || 'notif-type-info';
    h += '<div class="notif-item ' + (r?'':'unread') + '">' +
      '<div class="notif-header"><span class="notif-type '+tc+'">'+tl+'</span><span class="notif-time">'+fmtDate(n.createdAt)+'</span></div>' +
      '<div class="notif-title">'+window.esc(n.title||'-')+'</div>' +
      '<div class="notif-from">Dari: <b>'+window.esc(n.fromName||'Guru')+'</b></div>' +
      '<div class="notif-msg">'+window.esc(n.message||'')+'</div>' +
      '<div class="notif-actions">' +
      (!r ? '<button class="btn btn-sm" onclick="markRead(\''+n.id+'\')">'+ic('check','sm')+' Dibaca</button>' : '<span class="badge badge-success">'+ic('check','sm')+' Dibaca</span>') +
      '<button class="btn btn-sm btn-danger" onclick="delNotif(\''+n.id+'\')">'+ic('trash','sm')+'</button>' +
      '</div></div>';
  });
  b.innerHTML = h;
}
window.markRead = function(id){
  var n = DB.notifications.find(function(x){ return x.id===id; }); if (!n) return;
  var key = getNotifKey(); var rb = n.readBy||[]; if (rb.indexOf(key)<0) rb.push(key);
  fbSet('notifications', id, Object.assign({}, n, {readBy:rb})).then(function(){ updateBadge(); renderNotifPanel(); });
};
window.delNotif = function(id){ if (!confirm('Hapus?')) return; fbDel('notifications', id).then(function(){ updateBadge(); renderNotifPanel(); }); };

/* ===== AUTH ===== */
window.loginGuru = function(){
  var e = document.getElementById('guru-email').value.trim().toLowerCase();
  var p = document.getElementById('guru-password').value;
  if (!e || !p){ alert('Lengkapi!'); return; }
  var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase()===e && x.password===p; });
  if (!t){ alert('Email atau password salah!'); return; }
  window.currentUser = {type:'guru', email:t.email, name:t.name, phone:t.phone||''};
  saveSession(); showApp();
};
window.loginSiswa = function(){
  var cid = document.getElementById('siswa-kelas').value;
  var inp = document.getElementById('siswa-email').value.trim();
  var p = document.getElementById('siswa-password').value;
  if (!cid || !inp || !p){ alert('Lengkapi!'); return; }
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c){ alert('Kelas tidak ditemukan!'); return; }
  var isEmail = inp.indexOf('@')>=0;
  var emailL = inp.toLowerCase(), phoneC = inp.replace(/\D/g,'');
  var s = c.students.find(function(x){
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
  if (!code||!name||!email||!phone||!pw||!cf||!role){ alert('Lengkapi!'); return; }
  if (phone.length<10||phone.length>15){ alert('No. WA tidak valid!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length<6){ alert('Min 6!'); return; }
  if (pw!==cf){ alert('Konfirmasi tidak cocok!'); return; }
  var cls = DB.classes.find(function(c){ return c.code===code; });
  if (!cls){ alert('Kode Kelas tidak valid!'); return; }
  var dup = false;
  DB.classes.forEach(function(c){ if (c.students.some(function(s){ return s.email && s.email.toLowerCase()===email; })) dup = true; });
  if (dup){ alert('Email terdaftar!'); return; }
  var ns = {id:uid(), name:name, email:email, phone:phone, password:pw, role:role, registeredAt:Date.now()};
  var newStudents = (cls.students||[]).concat([ns]);
  fbSet('classes', cls.id, Object.assign({}, cls, {students:newStudents})).then(function(){
    fbSet('notifications', uid(), {id:uid(), classId:cls.id, fromName:name, fromType:'siswa', toId:'guru', type:'info', title:'Siswa Baru', message:name+' mendaftar', createdAt:Date.now(), readBy:[]});
    alert('Berhasil!\n\nSilakan login.');
    showLoginPage(); switchLoginTab('siswa');
  });
};
window.logout = function(){
  if (!confirm('Keluar?')) return;
  window.currentUser = null; clearSession();
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  closeNotifPanel();
  window.__currentViewClassId = null;
};
window.openChangePassword = function(){ alert('Fitur ubah password — hubungi admin.'); };

/* ===== SHOW APP ===== */
function showApp(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  var btnPw = document.getElementById('btn-change-pw');
  if (btnPw) btnPw.style.display = window.currentUser.type === 'admin' ? 'none' : 'inline-flex';

  var l = '';
  if (window.currentUser.type==='guru') l = ic('user') + ' <span>' + window.currentUser.name + ' — <b>Guru Pengampu</b></span>';
  else if (window.currentUser.type==='admin') l = ic('shield') + ' <span>' + window.currentUser.name + ' — <b>Administrator</b></span>';
  else {
    var c = DB.classes.find(function(x){ return x.id===window.currentUser.classId; });
    l = ic('user') + ' <span>' + window.currentUser.name + ' — <b>' + ((ROLES[window.currentUser.role]||{}).label||window.currentUser.role) + '</b> — <b>Kelas ' + (c?c.name:'-') + '</b></span>';
  }
  document.getElementById('user-info').innerHTML = l;
  updateBadge();

  if (window.currentUser.type==='guru') renderGuruDash();
  else if (window.currentUser.type==='admin') renderAdminDash();
  else renderSiswaDash();

  if (window.__forceHideLoading) window.__forceHideLoading();
}
window.showApp = showApp;

/* ===== HELPERS ===== */
function fmtDate(ts){
  if (!ts) return '-';
  var d = new Date(ts);
  return d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function fmtDateShort(s){ if (!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); }
window.esc = function(s){ return String(s==null?'':s).replace(/[<>&"']/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]; }); };
window.fmtDate = fmtDate;

function isStageActive(cid, sid){
  if (!DB.activeStages[cid]) return false;
  if (Array.isArray(DB.activeStages[cid].activeIds)) return DB.activeStages[cid].activeIds.indexOf(sid) >= 0;
  return DB.activeStages[cid][sid] === true;
}
function getActiveStages(cid){ return DB.stages.filter(function(s){ return isStageActive(cid, s.id); }); }
window.isStageActive = isStageActive;
window.getActiveStages = getActiveStages;
window.getRubricFor = getRubricFor;
window.ROLES = ROLES;
window.DB = DB;

/* ===== DASHBOARD GURU ===== */
function renderGuruDash(){
  document.getElementById('header-title-text').innerHTML = ic('settings') + ' Dashboard Guru Pengampu';
  var mine = myClasses();
  var h = '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openGuruMenu()">' + ic('gear') + ' Menu</button>' +
    '<button class="btn" onclick="openTambahKelas()">' + ic('plus') + ' Tambah Kelas</button>' +
    '<button class="btn" onclick="openStrukturGlobal()">' + ic('award') + ' Struktur</button>' +
    '</div>';
  h += '<div class="alert alert-info">' + ic('info') + ' <div>Selamat datang, <b>' + window.esc(window.currentUser.name) + '</b>! Kelola kelas Anda di bawah.</div></div>';
  h += '<h3 style="margin-bottom:14px;font-size:15px;font-weight:700;">' + ic('school') + ' Kelas Saya (' + mine.length + ')</h3>';
  if (mine.length === 0){
    h += '<div class="empty-state">' + ic('school','lg') + '<p>Belum ada kelas. Klik <b>Tambah Kelas</b>.</p></div>';
  } else {
    h += '<div class="grid">';
    mine.forEach(function(c){
      var ac = getActiveStages(c.id).length;
      h += '<div class="card card-accent blue" style="cursor:pointer" onclick="viewClass(\''+c.id+'\')">' +
        '<h3>' + ic('school') + ' ' + window.esc(c.name) + '</h3>' +
        '<p style="color:var(--text-muted);font-size:13px;margin-bottom:8px;">' + ((c.students||[]).length) + ' siswa</p>' +
        '<div style="font-size:11.5px;margin-bottom:6px;">Kode: <b style="color:var(--primary);letter-spacing:.15em;font-family:monospace;">' + c.code + '</b></div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Aktivasi: <b style="color:var(--primary);">' + ac + '/' + DB.stages.length + ' tahap</b></div>' +
        '<div class="action-row" style="margin-top:12px;">' +
        '<button class="btn btn-sm" onclick="event.stopPropagation();viewClass(\''+c.id+'\')">' + ic('edit','sm') + ' Kelola</button>' +
        '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();hapusKelas(\''+c.id+'\')">' + ic('trash','sm') + '</button>' +
        '</div></div>';
    });
    h += '</div>';
  }
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}

/* ===== DASHBOARD SISWA ===== */
function renderSiswaDash(){
  document.getElementById('header-title-text').innerHTML = ic('user') + ' Dashboard Siswa';
  var c = DB.classes.find(function(x){ return x.id===window.currentUser.classId; });
  if (!c){
    document.getElementById('main-content').innerHTML = '<div class="empty-state">' + ic('warning','lg') + '<p>Kelas tidak ditemukan</p></div>';
    return;
  }
  var me = c.students.find(function(s){ return s.id===window.currentUser.studentId; });
  if (!me){
    document.getElementById('main-content').innerHTML = '<div class="empty-state">' + ic('warning','lg') + '<p>Data tidak ditemukan</p></div>';
    return;
  }
  var activeStages = getActiveStages(c.id);
  var roleLabel = (ROLES[me.role]||{}).label || me.role;

  var h = '';
  h += '<div class="progress-banner">' +
    '<h3>' + ic('user') + ' Selamat Datang</h3>' +
    '<div style="font-size:16px;font-weight:700;margin:6px 0;">' + window.esc(me.name) + '</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">' + window.esc(roleLabel) + ' · Kelas ' + window.esc(c.name) + '</div>' +
  '</div>';

  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openSiswaMenu()">' + ic('gear') + ' Menu</button>' +
    '<button class="btn" onclick="openPenilaianSiswaDashboard()">' + ic('edit') + ' Beri Nilai Rekan</button>' +
    '<button class="btn" onclick="openStrukturKerabatKerja()">' + ic('award') + ' Struktur</button>' +
    '</div>';

  h += '<h3 style="margin:20px 0 10px;font-size:15px;font-weight:700;">' + ic('layers') + ' Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">' + ic('lock') + ' <div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="stage-grid">';
    activeStages.forEach(function(s){
      h += '<div class="stage-card" onclick="openPenilaianTahap(\''+c.id+'\',\''+s.id+'\')">' +
        '<div class="stage-num">' + (DB.stages.indexOf(s)+1) + '</div>' +
        '<h4>' + window.esc(s.name) + '</h4>' +
        '<p>' + window.esc(s.subtitle||s.description||'') + '</p>' +
        '</div>';
    });
    h += '</div>';
  }

  // Deadline
  var notifs = getNotifs().filter(function(n){ return n.type==='tugas'; }).slice(0,5);
  h += '<h3 style="margin:20px 0 10px;font-size:15px;font-weight:700;">' + ic('clock') + ' Deadline & Tugas</h3>';
  if (notifs.length === 0){
    h += '<div class="alert alert-info">' + ic('info') + ' <div>Tidak ada tugas baru.</div></div>';
  } else {
    notifs.forEach(function(n){
      h += '<div class="welcome-item urgent"><div style="flex:1;"><b>' + window.esc(n.title) + '</b><br><small>' + window.esc(n.fromName||'') + ' · ' + fmtDate(n.createdAt) + '</small></div></div>';
    });
  }
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}

/* ===== DASHBOARD ADMIN ===== */
function renderAdminDash(){
  document.getElementById('header-title-text').innerHTML = ic('shield') + ' Dashboard Admin';
  var h = '<div class="alert alert-info">' + ic('shield') + ' <div><b>Area Administrator</b></div></div>';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openTambahGuru()">' + ic('personPlus') + ' Tambah Guru</button>' +
    '</div>';
  h += '<h3 style="margin-bottom:14px;font-size:15px;font-weight:700;">' + ic('users') + ' Daftar Guru (' + DB.teachers.length + ')</h3>';
  if (DB.teachers.length === 0) h += '<div class="empty-state">' + ic('users','lg') + '<p>Belum ada guru.</p></div>';
  DB.teachers.forEach(function(t){
    h += '<div class="teacher-list-item">' +
      '<div class="info">' + ic('user','lg') + '<div><strong>' + window.esc(t.name) + '</strong><small>' + window.esc(t.email) + '</small></div></div>' +
      '<button class="btn btn-sm btn-danger" onclick="hapusGuru(\''+t.email+'\')">' + ic('trash','sm') + '</button>' +
      '</div>';
  });
  h += '<h3 style="margin:20px 0 12px;font-size:15px;font-weight:700;">' + ic('school') + ' Kelas Terdaftar (' + DB.classes.length + ')</h3>';
  if (DB.classes.length === 0) h += '<div class="empty-state">' + ic('school','lg') + '<p>Belum ada kelas.</p></div>';
  else {
    h += '<div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Kode</th><th>Guru</th><th>Siswa</th></tr></thead><tbody>';
    DB.classes.forEach(function(c){
      h += '<tr><td><b>' + window.esc(c.name) + '</b></td><td><code>' + c.code + '</code></td><td>' + window.esc(c.teacherEmail||'-') + '</td><td>' + ((c.students||[]).length) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
}

/* ===== VIEW CLASS ===== */
window.viewClass = function(cid){
  if (!ownsClass(cid)){ alert('Tidak punya akses'); return; }
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  window.__currentViewClassId = cid;

  var activeStages = getActiveStages(cid);
  var h = '';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn" onclick="renderGuruDash()">' + ic('back') + ' Kembali</button>' +
    '<button class="btn btn-primary" onclick="openSistemTahapan(\''+cid+'\')">' + ic('settings') + ' Kelola Tahapan</button>' +
    '<button class="btn" onclick="openTambahSiswa(\''+cid+'\')">' + ic('personPlus') + ' Tambah Siswa</button>' +
    '<button class="btn" onclick="openPenilaianGuruDashboard(\''+cid+'\')">' + ic('edit') + ' Penilaian Guru</button>' +
    '<button class="btn" onclick="openRekapNilai(\''+cid+'\')">' + ic('chart') + ' Rekap</button>' +
    '<button class="btn" onclick="openBroadcast(\''+cid+'\')">' + ic('megaphone') + ' Broadcast</button>' +
    '<button class="btn" onclick="lihatPassword(\''+cid+'\')">' + ic('lock') + ' Lihat Password</button>' +
    '</div>';

  h += '<div class="class-code-box">' +
    '<div class="label">' + ic('hash') + ' Kode Kelas</div>' +
    '<div class="code">' + c.code + '</div>' +
    '<div class="hint">Bagikan ke siswa untuk daftar mandiri</div>' +
    '<div class="action-row">' +
    '<button class="btn btn-primary" onclick="salinKode(\''+cid+'\')">' + ic('copy') + ' Salin</button>' +
    '<button class="btn" onclick="regenerateKode(\''+cid+'\')">' + ic('refresh') + ' Generate Baru</button>' +
    '</div></div>';

  h += '<div class="card card-accent blue">' +
    '<h3>' + ic('layers') + ' Status Tahapan</h3>' +
    '<p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">' + activeStages.length + '/' + DB.stages.length + ' tahap aktif</p>' +
    '<div class="action-row">' +
    '<button class="btn btn-primary btn-sm" onclick="openSistemTahapan(\''+cid+'\')">' + ic('settings','sm') + ' Kelola</button>' +
    '<button class="btn btn-sm" onclick="openStrukturKerabatKerja()">' + ic('award','sm') + ' Struktur</button>' +
    '</div></div>';

  h += '<h3 style="margin:20px 0 10px;font-size:15px;font-weight:700;">' + ic('users') + ' Siswa (' + ((c.students||[]).length) + ')</h3>';
  if ((c.students||[]).length === 0){
    h += '<div class="empty-state">' + ic('users','lg') + '<p>Belum ada siswa.</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>WA</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>';
    c.students.forEach(function(s, i){
      var r = ROLES[s.role] || {label:s.role, team:'-'};
      h += '<tr><td>' + (i+1) + '</td><td><b>' + window.esc(s.name) + '</b></td>' +
        '<td style="font-size:12px;color:var(--text-muted);">' + window.esc(s.email||'-') + '</td>' +
        '<td style="font-size:12px;color:' + (s.phone?'var(--success)':'var(--danger)') + ';">' + window.esc(s.phone||'tanpa WA') + '</td>' +
        '<td><span class="badge ' + (r.team==='produksi'?'badge-info':'badge-warning') + '">' + window.esc(r.label) + '</span></td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="hapusSiswa(\''+cid+'\',\''+s.id+'\')">' + ic('trash','sm') + '</button></td></tr>';
    });
    h += '</tbody></table></div>';
  }

  document.getElementById('main-content').innerHTML = h;
  if (window.hydrateIcons) window.hydrateIcons();
  updateBadge();
};

/* ===== TAMBAH KELAS ===== */
window.openTambahKelas = function(){
  openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label><input id="new-class" placeholder="Contoh: IX-A"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKelas()">' + ic('save') + ' Simpan</button>');
};
window.simpanKelas = function(){
  var n = document.getElementById('new-class').value.trim();
  if (!n){ alert('Nama wajib!'); return; }
  var id = uid();
  var data = {id:id, name:n, code:genCode(n), students:[], teacherEmail:window.currentUser.email, teacherName:window.currentUser.name, createdAt:Date.now()};
  fbSet('classes', id, data).then(function(){
    closeModal(); alert('Kelas ' + n + ' dibuat!\nKode: ' + data.code);
  });
};
window.hapusKelas = function(cid){
  if (!confirm('Hapus kelas ini?')) return;
  fbDel('classes', cid).then(function(){ alert('Dihapus'); });
};
window.salinKode = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  if (navigator.clipboard) navigator.clipboard.writeText(c.code).then(function(){ alert('Kode disalin!'); });
  else prompt('Copy:', c.code);
};
window.regenerateKode = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  if (!confirm('Generate kode baru?')) return;
  var nc = genCode(c.name);
  fbSet('classes', cid, Object.assign({}, c, {code:nc})).then(function(){ alert('Kode baru: ' + nc); });
};

/* ===== TAMBAH SISWA ===== */
window.openTambahSiswa = function(cid){
  var opts = '<option value="">-- Pilih --</option>';
  Object.keys(ROLES).forEach(function(k){ opts += '<option value="'+k+'">'+ROLES[k].label+'</option>'; });
  openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama</label><input id="ts-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ts-email"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="ts-phone"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="ts-pw" value="#Smpn10smd"></div>' +
    '<div class="form-group"><label>Peran</label><select id="ts-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanSiswa(\''+cid+'\')">' + ic('save') + ' Simpan</button>');
};
window.simpanSiswa = function(cid){
  var n = document.getElementById('ts-name').value.trim();
  var e = document.getElementById('ts-email').value.trim().toLowerCase();
  var ph = document.getElementById('ts-phone').value.replace(/\D/g,'');
  var pw = document.getElementById('ts-pw').value;
  var r = document.getElementById('ts-role').value;
  if (!n || !e || !r){ alert('Lengkapi!'); return; }
  var c = DB.classes.find(function(x){ return x.id===cid; });
  var ns = (c.students||[]).concat([{id:uid(), name:n, email:e, phone:ph, password:pw||'#Smpn10smd', role:r}]);
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){ closeModal(); });
};
window.hapusSiswa = function(cid, sid){
  if (!confirm('Hapus siswa?')) return;
  var c = DB.classes.find(function(x){ return x.id===cid; });
  var ns = c.students.filter(function(s){ return s.id!==sid; });
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){ alert('Dihapus'); });
};
window.lihatPassword = function(cid){
  var c = DB.classes.find(function(x){ return x.id===cid; });
  if (!c) return;
  var h = '<div class="alert alert-warning">' + ic('warning') + ' <div><b>RAHASIA</b></div></div>';
  h += '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Password</th></tr></thead><tbody>';
  (c.students||[]).forEach(function(s){
    h += '<tr><td><b>' + window.esc(s.name) + '</b></td><td>' + window.esc(s.email||'-') + '</td><td><code>' + window.esc(s.password||'-') + '</code></td></tr>';
  });
  h += '</tbody></table></div>';
  openModal('Password Siswa', h);
};
window.openBroadcast = function(cid){
  openModal('Broadcast Pesan',
    '<div class="form-group"><label>Judul</label><input id="bc-title"></div>' +
    '<div class="form-group"><label>Pesan</label><textarea id="bc-msg" rows="4"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="kirimBroadcast(\''+cid+'\')">' + ic('send') + ' Kirim ke Semua</button>');
};
window.kirimBroadcast = function(cid){
  var t = document.getElementById('bc-title').value.trim();
  var m = document.getElementById('bc-msg').value.trim();
  if (!t || !m){ alert('Lengkapi!'); return; }
  fbSet('notifications', uid(), {id:uid(), classId:cid, fromName:window.currentUser.name, fromType:window.currentUser.type, toId:'all', type:'info', title:t, message:m, createdAt:Date.now(), readBy:[]}).then(function(){
    closeModal(); alert('Terkirim!');
  });
};
window.openTambahGuru = function(){
  openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="tg-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="tg-email"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="tg-pw"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanGuru()">' + ic('save') + ' Simpan</button>');
};
window.simpanGuru = function(){
  var n = document.getElementById('tg-name').value.trim();
  var e = document.getElementById('tg-email').value.trim().toLowerCase();
  var p = document.getElementById('tg-pw').value;
  if (!n || !e || !p){ alert('Lengkapi!'); return; }
  fbSet('teachers', e, {name:n, email:e, password:p}).then(function(){ closeModal(); alert('Ditambahkan'); });
};
window.hapusGuru = function(email){
  if (!confirm('Hapus guru?')) return;
  fbDel('teachers', email).then(function(){ alert('Dihapus'); });
};

/* ===== MENU ===== */
window.openGuruMenu = function(){
  openModal('Menu Guru',
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal()">' + ic('info') + ' Semua fitur tersedia di dashboard</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();logout()">' + ic('out') + ' Keluar</button>' +
    '</div>');
};
window.openSiswaMenu = function(){
  openModal('Menu Siswa',
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openPenilaianSiswaDashboard()">' + ic('edit') + ' Beri Nilai Rekan</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();openStrukturKerabatKerja()">' + ic('award') + ' Struktur</button>' +
    '<button class="btn" style="justify-content:flex-start;" onclick="closeModal();logout()">' + ic('out') + ' Keluar</button>' +
    '</div>');
};
window.openPanduan = function(){
  openModal('Panduan',
    '<div style="white-space:pre-wrap;padding:14px;background:var(--surface);border-radius:10px;font-size:12.5px;line-height:1.7;">' +
    'SISTEM PENILAIAN PROYEK TEATER\n\n' +
    '1. Guru mengelola kelas & siswa\n' +
    '2. Guru mengaktifkan tahapan\n' +
    '3. Siswa login & menilai rekan\n' +
    '4. Guru menilai Pimpro & Sutradara\n' +
    '5. Rekap nilai otomatis\n\n' +
    'Bobot: Guru 40% + Ketua 30% + Rekan 30%' +
    '</div>');
};
window.openStrukturGlobal = function(){
  if (window.openStrukturKerabatKerja) window.openStrukturKerabatKerja();
};

/* ===== SUBSCRIBE FIRESTORE ===== */
function subscribe(){
  if (!firebaseReady) return;
  fb.collection('teachers').onSnapshot(function(snap){
    DB.teachers = snap.docs.map(function(d){ return d.data(); });
    if (DB.teachers.length === 0) DEFAULT_TEACHERS.forEach(function(t){ fbSet('teachers', t.email, t); });
  });
  fb.collection('classes').onSnapshot(function(snap){
    DB.classes = snap.docs.map(function(d){ var o = d.data(); o.id = d.id; return o; });
    refreshClassDropdown();
    if (window.currentUser){
      if (window.currentUser.type === 'guru') renderGuruDash();
      else if (window.currentUser.type === 'admin') renderAdminDash();
      else if (window.currentUser.type === 'siswa') renderSiswaDash();
    }
  });
  fb.collection('evaluations').onSnapshot(function(snap){
    var ev = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId, tid = dt.targetId;
      if (!cid || !tid) return;
      ev[cid] = ev[cid] || {};
      ev[cid][tid] = ev[cid][tid] || {};
      for (var k in dt){ if (k!=='classId' && k!=='targetId') ev[cid][tid][k] = dt[k]; }
    });
    DB.evaluations = ev;
  });
  fb.collection('deadlines').onSnapshot(function(snap){
    var dl = {};
    snap.docs.forEach(function(d){ var dt = d.data(), cid = dt.classId||d.id, obj = {}; for (var k in dt){ if (k!=='classId') obj[k] = dt[k]; } dl[cid] = obj; });
    DB.deadlines = dl;
  });
  fb.collection('activeStages').onSnapshot(function(snap){
    var a = {};
    snap.docs.forEach(function(d){
      var dt = d.data(), cid = dt.classId||d.id, obj = {};
      if (Array.isArray(dt.activeIds)){ obj.activeIds = dt.activeIds; dt.activeIds.forEach(function(id){ obj[id] = true; }); }
      else { for (var k in dt){ if (k!=='classId') obj[k] = dt[k]; } obj.activeIds = Object.keys(obj).filter(function(k){ return obj[k]===true && k.indexOf('stage')===0; }); }
      a[cid] = obj;
    });
    DB.activeStages = a;
  });
  fb.collection('notifications').orderBy('createdAt','desc').limit(200).onSnapshot(function(snap){
    DB.notifications = snap.docs.map(function(d){ return d.data(); });
    updateBadge();
    if (document.getElementById('notif-panel').classList.contains('open')) renderNotifPanel();
  });
  fb.collection('config').doc('stages').onSnapshot(function(doc){
    if (doc.exists && doc.data().stages) DB.stages = doc.data().stages;
    else fbSet('config', 'stages', {stages: DB.stages});
  });
}

/* ===== BOOT ===== */
function boot(){
  console.log('Boot SP-PPT v11.1...');
  var t = localStorage.getItem('sppt_theme') || 'auto';
  window.setTheme(t);
  if (window.hydrateIcons) window.hydrateIcons();

  if (!firebaseReady){
    console.warn('Firebase:', firebaseError);
    setTimeout(showLoginPage, 800);
    return;
  }
  subscribe();
  setTimeout(function(){
    var sess = getSession();
    if (sess){
      setTimeout(function(){
        if (sess.type === 'guru'){
          var t = DB.teachers.find(function(x){ return x.email && x.email.toLowerCase() === String(sess.email||'').toLowerCase(); });
          if (t){ window.currentUser = {type:'guru', email:t.email, name:t.name, phone:t.phone||''}; showApp(); return; }
        }
        if (sess.type === 'admin'){ window.currentUser = {type:'admin', email:sess.email, name:sess.name}; showApp(); return; }
        if (sess.type === 'siswa'){
          var c = DB.classes.find(function(x){ return x.id===sess.classId; });
          if (c){
            var s = c.students.find(function(x){ return x.id===sess.studentId; });
            if (s){ window.currentUser = {type:'siswa', classId:c.id, studentId:s.id, name:s.name, role:s.role, phone:s.phone||''}; showApp(); return; }
          }
        }
        showLoginPage();
      }, 600);
    } else setTimeout(showLoginPage, 600);
  }, 900);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

console.log('[app.js] v11.1 loaded — no emoji');
})();
