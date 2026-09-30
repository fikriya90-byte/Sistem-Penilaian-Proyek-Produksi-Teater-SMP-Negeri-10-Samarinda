/* ============================================================
   SP-PPT app.js — v21 COMPLETE (no icons)
   Core + Sistem Tahapan + Penilaian + Rekap + Absensi
   + Checklist + Tugas + Kerabat + Kas + Naskah + Jadwal
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   1. KONSTANTA
   ============================================================ */
const ADMIN = {
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar (Admin)'
};

const TEACHERS = [{
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar Arrazaq, S.Sn.',
  phone: ''
}];

const ROLES = {
  pimpinan_produksi:    {label:'Pimpinan Produksi',    team:'produksi', level:1},
  sutradara:            {label:'Sutradara',            team:'artistik', level:1},
  asisten_sutradara:    {label:'Asisten Sutradara',    team:'artistik', level:2},
  sekretaris:           {label:'Sekretaris',           team:'produksi', level:2},
  bendahara:            {label:'Bendahara',            team:'produksi', level:2},
  koor_publikasi:       {label:'Koor. Publikasi',      team:'produksi', level:3},
  koor_perlengkapan:    {label:'Koor. Perlengkapan',   team:'produksi', level:3},
  koor_akomodasi:       {label:'Koor. Akomodasi',      team:'produksi', level:3},
  koor_panggung:        {label:'Koor. Tata Pentas',    team:'artistik', level:3},
  koor_musik:           {label:'Koor. Tata Musik',     team:'artistik', level:3},
  koor_busana:          {label:'Koor. Tata Busana',    team:'artistik', level:3},
  koor_rias:            {label:'Koor. Tata Rias',      team:'artistik', level:3},
  koor_cahaya:          {label:'Koor. Tata Cahaya',    team:'artistik', level:3},
  anggota_publikasi:    {label:'Anggota Publikasi',    team:'produksi', level:4},
  anggota_perlengkapan: {label:'Anggota Perlengkapan', team:'produksi', level:4},
  anggota_akomodasi:    {label:'Anggota Akomodasi',    team:'produksi', level:4},
  anggota_panggung:     {label:'Anggota Tata Pentas',  team:'artistik', level:4},
  anggota_musik:        {label:'Anggota Tata Musik',   team:'artistik', level:4},
  anggota_busana:       {label:'Anggota Tata Busana',  team:'artistik', level:4},
  anggota_rias:         {label:'Anggota Tata Rias',    team:'artistik', level:4},
  anggota_cahaya:       {label:'Anggota Tata Cahaya',  team:'artistik', level:4},
  pemain:               {label:'Pemeran',              team:'artistik', level:3}
};

const DEFAULT_STAGES = [
  {id:'s1', name:'Perencanaan', subtitle:'Pra-Produksi', weight:20, desc:'Konsep, jadwal, RAB'},
  {id:'s2', name:'Pelaksanaan', subtitle:'Produksi & Latihan', weight:35, desc:'Latihan & eksekusi'},
  {id:'s3', name:'Pertunjukan', subtitle:'Show Time', weight:35, desc:'Hari H'},
  {id:'s4', name:'Evaluasi', subtitle:'Pasca-Produksi', weight:10, desc:'Laporan & refleksi'}
];

const RUBRICS = {
  pimpinan_produksi: [
    {id:'pp1', name:'Perencanaan & Pengelolaan', weight:25},
    {id:'pp2', name:'Seleksi & Pengaturan Tim',  weight:20},
    {id:'pp3', name:'Manajemen Anggaran',        weight:20},
    {id:'pp4', name:'Koordinasi Lintas Divisi',  weight:20},
    {id:'pp5', name:'Evaluasi & Pelaporan',      weight:15}
  ],
  sutradara: [
    {id:'sr1', name:'Pengembangan Konsep',  weight:25},
    {id:'sr2', name:'Casting',              weight:20},
    {id:'sr3', name:'Pengarahan Pemain',    weight:25},
    {id:'sr4', name:'Koordinasi Artistik',  weight:15},
    {id:'sr5', name:'Rekayasa Emosi',       weight:15}
  ],
  sekretaris: [
    {id:'sk1', name:'Dokumentasi & Arsip',  weight:30},
    {id:'sk2', name:'Penjadwalan',          weight:25},
    {id:'sk3', name:'Korespondensi',        weight:25},
    {id:'sk4', name:'Penyusunan Laporan',   weight:20}
  ],
  bendahara: [
    {id:'bd1', name:'Pencatatan Transaksi', weight:30},
    {id:'bd2', name:'Pengelolaan Keuangan', weight:30},
    {id:'bd3', name:'Perencanaan RAB',      weight:20},
    {id:'bd4', name:'Pelaporan',            weight:20}
  ],
  asisten_sutradara: [
    {id:'as1', name:'Koordinasi & Logistik',       weight:30},
    {id:'as2', name:'Pencatatan',                  weight:25},
    {id:'as3', name:'Bantu Koordinasi Teknis',     weight:25},
    {id:'as4', name:'Backup Sutradara',            weight:20}
  ],
  pemain: [
    {id:'pm1', name:'Penguasaan Naskah',      weight:30},
    {id:'pm2', name:'Ekspresi & Emosi',       weight:25},
    {id:'pm3', name:'Blocking & Posisi',      weight:20},
    {id:'pm4', name:'Kerja Sama',             weight:15},
    {id:'pm5', name:'Konsistensi Latihan',    weight:10}
  ],
  koor_produksi: [
    {id:'kp1', name:'Penyediaan Kebutuhan',   weight:30},
    {id:'kp2', name:'Pengelolaan Anggota',    weight:25},
    {id:'kp3', name:'Koordinasi Teknis',      weight:25},
    {id:'kp4', name:'Pelaporan',              weight:20}
  ],
  koor_artistik: [
    {id:'ka1', name:'Desain & Konsep',        weight:25},
    {id:'ka2', name:'Eksekusi Teknis',        weight:35},
    {id:'ka3', name:'Koordinasi Tim',         weight:25},
    {id:'ka4', name:'Pengelolaan Anggota',    weight:15}
  ],
  anggota: [
    {id:'ag1', name:'Penyelesaian Tugas',     weight:30},
    {id:'ag2', name:'Kualitas Kerja',         weight:25},
    {id:'ag3', name:'Kerja Sama Tim',         weight:25},
    {id:'ag4', name:'Kedisiplinan',           weight:20}
  ]
};

function getRubricFor(role){
  if (role === 'pimpinan_produksi') return RUBRICS.pimpinan_produksi;
  if (role === 'sutradara') return RUBRICS.sutradara;
  if (role === 'sekretaris') return RUBRICS.sekretaris;
  if (role === 'bendahara') return RUBRICS.bendahara;
  if (role === 'asisten_sutradara') return RUBRICS.asisten_sutradara;
  if (role === 'pemain') return RUBRICS.pemain;
  if (['koor_publikasi','koor_perlengkapan','koor_akomodasi'].indexOf(role) >= 0) return RUBRICS.koor_produksi;
  if (['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'].indexOf(role) >= 0) return RUBRICS.koor_artistik;
  return RUBRICS.anggota;
}

/* Siapa yang boleh menilai siapa */
function canEvaluate(evalRole, targetRole){
  if (evalRole === 'guru' || evalRole === 'admin') return true;
  if (targetRole === 'pimpinan_produksi') return true;
  if (targetRole === 'sutradara') return ['pimpinan_produksi','asisten_sutradara','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','pemain'].indexOf(evalRole) >= 0;
  if (targetRole.indexOf('koor_') === 0){
    const base = targetRole.substring(5);
    return evalRole === 'sutradara' || evalRole === 'pimpinan_produksi' ||
           evalRole === 'asisten_sutradara' || evalRole === 'anggota_' + base;
  }
  if (targetRole.indexOf('anggota_') === 0){
    const base = targetRole.substring(8);
    return evalRole === 'koor_' + base || evalRole === 'anggota_' + base;
  }
  if (targetRole === 'pemain') return ['sutradara','asisten_sutradara','pimpinan_produksi','pemain'].indexOf(evalRole) >= 0;
  if (targetRole === 'sekretaris' || targetRole === 'bendahara') return evalRole === 'pimpinan_produksi';
  if (targetRole === 'asisten_sutradara') return evalRole === 'sutradara';
  return true;
}

/* ============================================================
   2. STATE
   ============================================================ */
window.currentUser = null;
window.DB = {
  teachers: [],
  classes: [],
  evaluations: {},      // { cid: { targetId: { evalId: { stageId: { rubricId: score } } } } }
  notifications: [],
  stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  activeStages: {},     // { cid: [stageId, ...] }
  deadlines: {},        // { cid: { stageId: { date, time, note } } }
  checklists: {},       // { cid: { items: [...] } }
  meetings: {},         // { meetingId: { ... } }
  tasks: {},            // { taskId: { ... } }
  kas: {},              // { cid: { active, nama, nominal, payments } }
  activityLogs: []
};

/* ============================================================
   3. UTILS
   ============================================================ */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[<>&"']/g, c =>
  ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
const fmtDate = ts => !ts ? '-' : new Date(ts).toLocaleDateString('id-ID',
  {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const fmtDateShort = s => !s ? '-' : new Date(s).toLocaleDateString('id-ID',
  {day:'numeric',month:'short',year:'numeric'});
const todayISO = () => new Date().toISOString().split('T')[0];

function toast(msg, type){
  const colors = {success:'#10b981', error:'#dc2626', warning:'#f59e0b', info:'#2563eb'};
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
    background:${colors[type]||colors.info};color:#fff;padding:12px 22px;border-radius:10px;
    font-size:13px;font-weight:600;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.3);
    max-width:90vw;text-align:center;`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2400);
}
window.toast = toast;

/* ============================================================
   4. THEME
   ============================================================ */
window.setTheme = function(mode){
  localStorage.setItem('sppt_theme', mode);
  const t = mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-toggle button').forEach(b =>
    b.classList.toggle('active', b.dataset.theme === mode));
};

/* ============================================================
   5. FIREBASE
   ============================================================ */
let fb = null, fbReady = false;
try {
  if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey){
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    fb = firebase.firestore();
    fbReady = true;
    console.log('[firebase] ready');
  }
} catch(e){ console.warn('[firebase]', e.message); }

function fbSet(col, id, data){
  if (!fbReady) return Promise.resolve();
  return fb.collection(col).doc(id).set(data, {merge:true});
}
function fbDel(col, id){
  if (!fbReady) return Promise.resolve();
  return fb.collection(col).doc(id).delete();
}
function fbGet(col, id){
  if (!fbReady) return Promise.reject(new Error('Firebase belum siap'));
  return fb.collection(col).doc(id).get();
}
window.fbSet = fbSet;
window.fbDel = fbDel;
window.fbGet = fbGet;

/* ============================================================
   6. SCREEN CONTROL
   ============================================================ */
function hideAll(){
  ['loading','login-screen','register-screen','app'].forEach(id => {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });
}
window.showLogin = function(){
  hideAll();
  $('login-screen').classList.remove('hidden');
};
window.showRegister = function(){
  hideAll();
  $('register-screen').classList.remove('hidden');
};
window.switchTab = function(t){
  ['guru','siswa','admin'].forEach(x => {
    const tb = $(`tab-${x}`);
    const fm = $(`form-${x}`);
    if (tb) tb.classList.toggle('active', x === t);
    if (fm) fm.classList.toggle('hidden', x !== t);
  });
};
window.togglePw = function(id, btn){
  const inp = $(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? 'Lihat' : 'Tutup';
};

/* ============================================================
   7. LOGIN / LOGOUT
   ============================================================ */
window.doLoginGuru = function(){
  const email = ($('guru-email').value || '').trim().toLowerCase();
  const pw = ($('guru-password').value || '').trim();

  console.log('[loginGuru] mencoba:', email);
  if (!email || !pw){ toast('Lengkapi email & password', 'warning'); return; }

  let t = TEACHERS.find(x => x.email.toLowerCase() === email && x.password === pw);
  if (!t){
    t = (window.DB.teachers || []).find(x =>
      x.email && String(x.email).toLowerCase() === email &&
      String(x.password || '').trim() === pw);
  }
  if (!t && fbReady){
    fb.collection('teachers').doc(email).get().then(snap => {
      if (snap.exists && String(snap.data().password).trim() === pw){
        finishGuru(snap.data());
      } else {
        toast('Email atau password salah', 'error');
      }
    }).catch(() => toast('Email atau password salah', 'error'));
    return;
  }
  if (!t){ toast('Email atau password salah', 'error'); return; }
  finishGuru(t);
};

function finishGuru(t){
  window.currentUser = {type:'guru', email:t.email, name:t.name || t.email, phone:t.phone || ''};
  localStorage.setItem('sppt_session', JSON.stringify(window.currentUser));
  console.log('[loginGuru] sukses:', t.name);
  fbSet('teachers', t.email, t).catch(()=>{});
  showApp();
}

window.doLoginSiswa = function(){
  const cid = $('siswa-kelas').value;
  const inp = ($('siswa-login').value || '').trim();
  const pw = ($('siswa-password').value || '').trim();

  if (!cid){ toast('Pilih kelas dulu', 'warning'); return; }
  if (!inp){ toast('Email/WA wajib diisi', 'warning'); return; }
  if (!pw){ toast('Password wajib diisi', 'warning'); return; }

  const isEmail = inp.includes('@');
  const emL = inp.toLowerCase();
  const phC = inp.replace(/\D/g,'');

  function match(s){
    if (!s || !s.password) return false;
    if (String(s.password).trim() !== pw) return false;
    if (isEmail) return s.email && String(s.email).toLowerCase() === emL;
    return s.phone && String(s.phone).replace(/\D/g,'') === phC;
  }

  function finish(s, c){
    if (!s || !c){ toast('Email/WA atau password salah', 'error'); return; }
    window.currentUser = {
      type:'siswa', classId:c.id, studentId:s.id,
      name:s.name, role:s.role, phone:s.phone || '', email:s.email || ''
    };
    localStorage.setItem('sppt_session', JSON.stringify(window.currentUser));
    console.log('[loginSiswa] sukses:', s.name);
    showApp();
  }

  const c = (window.DB.classes || []).find(x => x.id === cid);
  if (c){
    const s = (c.students || []).find(match);
    if (s){ finish(s, c); return; }
  }
  if (fbReady){
    fb.collection('classes').doc(cid).get().then(snap => {
      if (!snap.exists){ finish(null, null); return; }
      const fresh = Object.assign({}, snap.data(), {id:cid});
      const idx = window.DB.classes.findIndex(x => x.id === cid);
      if (idx >= 0) window.DB.classes[idx] = fresh;
      else window.DB.classes.push(fresh);
      finish((fresh.students || []).find(match) || null, fresh);
    }).catch(() => finish(null, null));
    return;
  }
  finish(null, null);
};

window.doLoginAdmin = function(){
  const email = ($('admin-email').value || '').trim().toLowerCase();
  const pw = ($('admin-password').value || '').trim();
  if (email === ADMIN.email.toLowerCase() && pw === ADMIN.password){
    window.currentUser = {type:'admin', email:ADMIN.email, name:ADMIN.name};
    localStorage.setItem('sppt_session', JSON.stringify(window.currentUser));
    showApp();
  } else {
    toast('Email atau password admin salah', 'error');
  }
};

window.doLogout = function(){
  if (!confirm('Keluar dari aplikasi?')) return;
  localStorage.removeItem('sppt_session');
  window.currentUser = null;
  window.DB.classes = [];
  showLogin();
};

/* ============================================================
   8. REGISTER
   ============================================================ */
window.doRegister = function(){
  const code = ($('reg-code').value || '').trim().toUpperCase();
  const name = ($('reg-name').value || '').trim();
  const email = ($('reg-email').value || '').trim().toLowerCase();
  const phone = ($('reg-phone').value || '').replace(/\D/g,'');
  const pw = $('reg-password').value;
  const cf = $('reg-confirm').value;

  if (!code || !name || !email || !phone || !pw){ toast('Lengkapi semua field', 'warning'); return; }
  if (phone.length < 10 || phone.length > 15){ toast('No. WA tidak valid', 'error'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toast('Email tidak valid', 'error'); return; }
  if (pw.length < 6){ toast('Password minimal 6 karakter', 'error'); return; }
  if (pw !== cf){ toast('Konfirmasi password tidak cocok', 'error'); return; }

  const cls = (window.DB.classes || []).find(c => c.code === code);
  if (!cls){ toast('Kode kelas tidak valid', 'error'); return; }

  const dup = (window.DB.classes || []).some(c =>
    (c.students || []).some(s => s.email && s.email.toLowerCase() === email));
  if (dup){ toast('Email sudah terdaftar', 'error'); return; }

  const ns = {id:uid(), name, email, phone, password:pw, role:'pemain', registeredAt:Date.now()};
  const newStudents = (cls.students || []).concat([ns]);

  fbSet('classes', cls.id, Object.assign({}, cls, {students:newStudents})).then(() => {
    const nid = uid();
    fbSet('notifications', nid, {
      id:nid, classId:cls.id, fromId:ns.id, fromName:name, fromType:'siswa',
      toId:'guru', type:'info', title:'Pendaftaran Siswa Baru',
      message:name + ' mendaftar di ' + cls.name,
      createdAt:Date.now(), readBy:[], doneBy:[]
    }).catch(()=>{});
    toast('Pendaftaran berhasil! Silakan login.', 'success');
    setTimeout(() => {
      showLogin(); switchTab('siswa');
      setTimeout(() => {
        if ($('siswa-kelas')) $('siswa-kelas').value = cls.id;
        if ($('siswa-login')) $('siswa-login').value = email;
      }, 300);
    }, 1500);
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

/* ============================================================
   9. CHANGE PASSWORD
   ============================================================ */
window.changePw = function(){
  openModal('Ubah Password',
    '<div class="form-group"><label>Password Lama</label><input type="password" id="cp-old"></div>' +
    '<div class="form-group"><label>Password Baru</label><input type="password" id="cp-new"></div>' +
    '<div class="form-group"><label>Konfirmasi Password Baru</label><input type="password" id="cp-confirm"></div>' +
    '<button class="btn btn-primary btn-block" onclick="saveChangePw()">Simpan</button>');
};

window.saveChangePw = function(){
  const u = window.currentUser;
  const oldPw = $('cp-old').value;
  const newPw = $('cp-new').value;
  const cf = $('cp-confirm').value;

  if (!oldPw || !newPw || !cf){ toast('Lengkapi semua field', 'warning'); return; }
  if (newPw.length < 6){ toast('Password baru minimal 6 karakter', 'error'); return; }
  if (newPw !== cf){ toast('Konfirmasi tidak cocok', 'error'); return; }

  if (u.type === 'guru'){
    const t = TEACHERS.find(x => x.email.toLowerCase() === u.email.toLowerCase());
    if (!t || t.password !== oldPw){ toast('Password lama salah', 'error'); return; }
    t.password = newPw;
    fbSet('teachers', t.email, t).then(() => { toast('Password diubah', 'success'); closeModal(); });
  } else if (u.type === 'siswa'){
    const c = window.DB.classes.find(x => x.id === u.classId);
    if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }
    const s = (c.students || []).find(x => x.id === u.studentId);
    if (!s || s.password !== oldPw){ toast('Password lama salah', 'error'); return; }
    const ns = (c.students || []).map(x => x.id === s.id ? Object.assign({}, x, {password:newPw}) : x);
    fbSet('classes', c.id, Object.assign({}, c, {students:ns})).then(() => {
      c.students = ns; toast('Password diubah', 'success'); closeModal();
    });
  } else {
    toast('Admin tidak bisa ubah password', 'warning');
  }
};

/* ============================================================
   10. SHOW APP
   ============================================================ */
function showApp(){
  hideAll();
  $('app').classList.remove('hidden');
  $('btn-notif').classList.remove('hidden');

  const u = window.currentUser;
  const info = $('user-info');
  const title = $('header-title');

  if (u.type === 'guru'){
    info.innerHTML = 'Masuk sebagai <b>' + esc(u.name) + '</b> — Guru Pengampu';
    title.textContent = 'Dashboard Guru';
    renderGuruDash();
  } else if (u.type === 'admin'){
    info.innerHTML = 'Masuk sebagai <b>' + esc(u.name) + '</b> — Administrator';
    title.textContent = 'Dashboard Admin';
    renderAdminDash();
  } else {
    const c = (window.DB.classes || []).find(x => x.id === u.classId);
    const rl = (ROLES[u.role] || {}).label || u.role;
    info.innerHTML = 'Masuk sebagai <b>' + esc(u.name) + '</b> — ' + esc(rl) +
      ' — Kelas ' + esc(c ? c.name : '-');
    title.textContent = 'Dashboard Siswa';
    renderSiswaDash();
  }
  updateNotifBadge();
}
window.showApp = showApp;

/* ============================================================
   11. DASHBOARD GURU
   ============================================================ */
function renderGuruDash(){
  const u = window.currentUser;
  const classes = (window.DB.classes || []).filter(c =>
    c.teacherEmail && c.teacherEmail.toLowerCase() === u.email.toLowerCase());

  let h = '<div class="alert alert-info"><div>Selamat datang, <b>' + esc(u.name) + '</b>.</div></div>';

  h += '<div class="action-row" style="margin-bottom:16px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary" onclick="openTambahKelas()">Tambah Kelas</button>' +
    '<button class="btn" onclick="openActivityLog()">Log Aktivitas</button>' +
    '<button class="btn" onclick="openInboxTugas()">Inbox Tugas</button>' +
    '<button class="btn" onclick="openAdminAduan()">Aduan Siswa</button>' +
  '</div>';

  h += '<h3 style="margin:16px 0 12px;font-size:14.5px;font-weight:700;">Kelas Saya (' + classes.length + ')</h3>';

  if (classes.length === 0){
    h += '<div class="empty-state"><p>Belum ada kelas. Klik <b>Tambah Kelas</b>.</p></div>';
  } else {
    h += '<div class="grid">';
    classes.forEach(c => {
      const nSiswa = (c.students || []).length;
      h += '<div class="card" style="border-left:4px solid var(--primary);cursor:pointer;" onclick="viewClass(\'' + c.id + '\')">' +
        '<h3>' + esc(c.name) + '</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;margin-bottom:6px;">' + nSiswa + ' siswa</p>' +
        '<p style="font-size:11.5px;margin-bottom:8px;">Kode: <b style="color:var(--primary);font-family:monospace;letter-spacing:.15em;">' + esc(c.code || '-') + '</b></p>' +
        '<div class="action-row">' +
          '<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();viewClass(\'' + c.id + '\')">Kelola</button>' +
          '<button class="btn btn-sm" onclick="event.stopPropagation();openSistemTahapan(\'' + c.id + '\')">Tahapan</button>' +
          '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();hapusKelas(\'' + c.id + '\')">Hapus</button>' +
        '</div>' +
      '</div>';
    });
    h += '</div>';
  }

  $('main-content').innerHTML = h;
}
window.renderGuruDash = renderGuruDash;

/* ============================================================
   12. DASHBOARD ADMIN
   ============================================================ */
function renderAdminDash(){
  const teachers = window.DB.teachers || [];
  const classes = window.DB.classes || [];
  let totalSiswa = 0;
  classes.forEach(c => totalSiswa += (c.students || []).length);

  let h = '<div class="alert alert-info"><div>Anda login sebagai <b>Admin</b>.</div></div>';

  h += '<div class="grid" style="margin-bottom:18px;">';
  h += '<div class="card"><div style="font-size:11.5px;color:var(--text-muted);">Total Guru</div><div style="font-size:22px;font-weight:800;">' + teachers.length + '</div></div>';
  h += '<div class="card"><div style="font-size:11.5px;color:var(--text-muted);">Total Kelas</div><div style="font-size:22px;font-weight:800;">' + classes.length + '</div></div>';
  h += '<div class="card"><div style="font-size:11.5px;color:var(--text-muted);">Total Siswa</div><div style="font-size:22px;font-weight:800;">' + totalSiswa + '</div></div>';
  h += '</div>';

  h += '<div class="action-row" style="margin-bottom:16px;">' +
    '<button class="btn btn-primary" onclick="openTambahGuru()">Tambah Guru</button>' +
    '<button class="btn" onclick="openActivityLog()">Log Aktivitas</button>' +
  '</div>';

  h += '<h3 style="margin:16px 0 12px;font-size:14.5px;">Daftar Guru (' + teachers.length + ')</h3>';
  if (teachers.length === 0){
    h += '<div class="empty-state"><p>Belum ada guru di Firestore.</p></div>';
  } else {
    teachers.forEach(t => {
      h += '<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<div><b>' + esc(t.name) + '</b><br><small style="color:var(--text-muted);">' + esc(t.email) + '</small></div>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusGuru(\'' + esc(t.email) + '\')">Hapus</button>' +
      '</div>';
    });
  }

  $('main-content').innerHTML = h;
}
window.renderAdminDash = renderAdminDash;

/* ============================================================
   13. DASHBOARD SISWA
   ============================================================ */
function renderSiswaDash(){
  const u = window.currentUser;
  const c = (window.DB.classes || []).find(x => x.id === u.classId);
  const rl = (ROLES[u.role] || {}).label || u.role;

  let h = '<div class="progress-banner">' +
    '<h3>Selamat Datang</h3>' +
    '<div style="font-size:15px;font-weight:700;margin:6px 0;">' + esc(u.name) + '</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">' + esc(rl) + ' · Kelas ' + esc(c ? c.name : '-') + '</div>' +
  '</div>';

  // Kas reminder
  if (c){
    const kas = window.DB.kas[c.id];
    if (kas && kas.active){
      const paid = (kas.payments && kas.payments[u.studentId]) || [];
      if (paid.length === 0){
        h += '<div class="alert alert-warning"><div>Anda belum membayar <b>' + esc(kas.nama) +
          '</b> (Rp ' + (kas.nominal || 0).toLocaleString('id-ID') + ').</div></div>';
      }
    }
  }

  h += '<div class="action-row" style="margin-bottom:16px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary" onclick="openPenilaianSiswa()">Beri Nilai Rekan</button>' +
    '<button class="btn" onclick="openChecklistSaya()">Checklist Saya</button>' +
    '<button class="btn" onclick="openChecklistTim()">Checklist Tim</button>' +
    '<button class="btn" onclick="openAbsensiList()">Absensi</button>' +
    '<button class="btn" onclick="openStrukturKerabat()">Kerabat Kerja</button>' +
    '<button class="btn" onclick="openNaskahView()">Naskah</button>' +
    '<button class="btn" onclick="openJadwalLatihanView()">Jadwal Latihan</button>' +
    '<button class="btn" onclick="openKasView()">Kas Kelas</button>' +
    '<button class="btn" onclick="openAduanSiswa()">Kirim Aduan</button>' +
  '</div>';

  const activeStages = (window.DB.stages || []).filter(s =>
    ((window.DB.activeStages[c ? c.id : '']) || []).includes(s.id));

  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;">Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning"><div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="grid">';
    activeStages.forEach(s => {
      const dl = ((window.DB.deadlines[c.id] || {})[s.id]) || {};
      h += '<div class="card" style="border-left:4px solid var(--success);">' +
        '<h3>' + esc(s.name) + '</h3>' +
        '<p style="font-size:12px;color:var(--text-muted);">' + esc(s.desc || '') + '</p>' +
        '<p style="font-size:11.5px;">Bobot ' + s.weight + '%</p>' +
        (dl.date ? '<p style="font-size:11px;color:var(--warning);">Deadline: ' + fmtDateShort(dl.date) + '</p>' : '') +
      '</div>';
    });
    h += '</div>';
  }

  $('main-content').innerHTML = h;
}
window.renderSiswaDash = renderSiswaDash;

/* ============================================================
   14. KELAS CRUD (Guru)
   ============================================================ */
window.openTambahKelas = function(){
  openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label>' +
    '<input id="new-class" placeholder="Contoh: IX-A" maxlength="30"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKelas()">Simpan</button>');
};

window.simpanKelas = function(){
  const n = ($('new-class').value || '').trim();
  if (!n || n.length < 2){ toast('Nama kelas minimal 2 karakter', 'warning'); return; }

  const code = n.replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,4) + '-' +
               Math.floor(1000 + Math.random() * 9000);
  const id = uid();
  const data = {
    id, name:n, code, students:[],
    teacherEmail: window.currentUser.email,
    teacherName: window.currentUser.name,
    createdAt: Date.now()
  };

  fbSet('classes', id, data).then(() => {
    closeModal();
    toast('Kelas dibuat. Kode: ' + code, 'success');
    if (!window.DB.classes.find(x => x.id === id)) window.DB.classes.push(data);
    renderGuruDash();
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

window.hapusKelas = function(cid){
  if (!confirm('Hapus kelas ini?')) return;
  fbDel('classes', cid).then(() => {
    window.DB.classes = window.DB.classes.filter(c => c.id !== cid);
    toast('Kelas dihapus', 'success');
    renderGuruDash();
  });
};

/* ============================================================
   15. VIEW CLASS (kelola siswa)
   ============================================================ */
window.viewClass = function(cid){
  window.__viewClassId = cid;
  const c = (window.DB.classes || []).find(x => x.id === cid);
  if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }

  let h = '<div class="action-row" style="margin-bottom:14px;flex-wrap:wrap;">' +
    '<button class="btn" onclick="renderGuruDash()">Kembali</button>' +
    '<button class="btn btn-primary" onclick="openTambahSiswa(\'' + cid + '\')">Tambah Siswa</button>' +
    '<button class="btn" onclick="openSistemTahapan(\'' + cid + '\')">Sistem Tahapan</button>' +
    '<button class="btn" onclick="openRekapNilai(\'' + cid + '\')">Rekap Nilai</button>' +
    '<button class="btn" onclick="openChecklistManage(\'' + cid + '\')">Kelola Checklist</button>' +
    '<button class="btn" onclick="openBuatMeeting(\'rapat\',\'' + cid + '\')">Buat Absensi</button>' +
    '<button class="btn" onclick="openBeriTugasGuru(\'' + cid + '\')">Beri Tugas</button>' +
    '<button class="btn" onclick="openStrukturKerabat(\'' + cid + '\')">Kerabat Kerja</button>' +
    '<button class="btn" onclick="openKasManage(\'' + cid + '\')">Kas Kelas</button>' +
    '<button class="btn" onclick="openBroadcast(\'' + cid + '\')">Broadcast</button>' +
  '</div>';

  h += '<div class="class-code-box">' +
    '<div class="label">KODE KELAS</div>' +
    '<div class="code">' + esc(c.code || '-') + '</div>' +
    '<div class="hint">Bagikan ke siswa untuk daftar</div>' +
  '</div>';

  h += '<h3 style="margin:16px 0 12px;font-size:14.5px;">Siswa (' + (c.students || []).length + ')</h3>';

  if ((c.students || []).length === 0){
    h += '<div class="empty-state"><p>Belum ada siswa.</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr>' +
      '<th>No</th><th>Nama</th><th>Email</th><th>Peran</th><th>Aksi</th>' +
    '</tr></thead><tbody>';
    c.students.forEach((s, i) => {
      const r = (ROLES[s.role] || {}).label || s.role;
      h += '<tr>' +
        '<td>' + (i+1) + '</td>' +
        '<td><b>' + esc(s.name) + '</b></td>' +
        '<td style="font-size:12px;">' + esc(s.email || '-') + '</td>' +
        '<td><span class="badge badge-info">' + esc(r) + '</span></td>' +
        '<td>' +
          '<button class="btn btn-sm" onclick="openEditSiswa(\'' + cid + '\',\'' + s.id + '\')">Edit</button> ' +
          '<button class="btn btn-sm btn-danger" onclick="hapusSiswa(\'' + cid + '\',\'' + s.id + '\')">Hapus</button>' +
        '</td>' +
      '</tr>';
    });
    h += '</tbody></table></div>';
  }

  $('main-content').innerHTML = h;
};

window.openTambahSiswa = function(cid){
  let opts = '';
  Object.keys(ROLES).forEach(k => { opts += '<option value="' + k + '">' + ROLES[k].label + '</option>'; });
  openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama Lengkap</label><input id="ts-name" maxlength="80"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ts-email"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="ts-phone"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="ts-pw" value="#Smpn10smd"></div>' +
    '<div class="form-group"><label>Peran</label><select id="ts-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanSiswa(\'' + cid + '\')">Simpan</button>');
};

window.simpanSiswa = function(cid){
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }
  const n = ($('ts-name').value || '').trim();
  const e = ($('ts-email').value || '').trim().toLowerCase();
  const ph = ($('ts-phone').value || '').replace(/\D/g,'');
  const pw = $('ts-pw').value || '#Smpn10smd';
  const r = $('ts-role').value;
  if (!n || !e){ toast('Nama dan email wajib', 'warning'); return; }

  const ns = (c.students || []).concat([{
    id:uid(), name:n, email:e, phone:ph, password:pw, role:r, registeredAt:Date.now()
  }]);

  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(() => {
    c.students = ns; closeModal(); toast('Siswa ditambahkan', 'success'); viewClass(cid);
  });
};

window.openEditSiswa = function(cid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  const s = (c.students || []).find(x => x.id === sid);
  if (!s) return;
  let opts = '';
  Object.keys(ROLES).forEach(k => {
    opts += '<option value="' + k + '"' + (s.role === k ? ' selected' : '') + '>' + ROLES[k].label + '</option>';
  });
  openModal('Edit Siswa',
    '<div class="form-group"><label>Nama</label><input id="es-name" value="' + esc(s.name) + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="es-email" value="' + esc(s.email || '') + '"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="es-phone" value="' + esc(s.phone || '') + '"></div>' +
    '<div class="form-group"><label>Password Baru (kosongkan jika tidak diubah)</label><input type="text" id="es-pw"></div>' +
    '<div class="form-group"><label>Peran</label><select id="es-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateSiswa(\'' + cid + '\',\'' + sid + '\')">Simpan</button>');
};

window.updateSiswa = function(cid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  const n = ($('es-name').value || '').trim();
  const e = ($('es-email').value || '').trim().toLowerCase();
  const ph = ($('es-phone').value || '').replace(/\D/g,'');
  const pw = $('es-pw').value;
  const r = $('es-role').value;
  if (!n || !e){ toast('Nama dan email wajib', 'warning'); return; }

  const ns = (c.students || []).map(x => {
    if (x.id !== sid) return x;
    const upd = Object.assign({}, x, {name:n, email:e, phone:ph, role:r});
    if (pw) upd.password = pw;
    return upd;
  });
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(() => {
    c.students = ns; closeModal(); toast('Siswa diperbarui', 'success'); viewClass(cid);
  });
};

window.hapusSiswa = function(cid, sid){
  if (!confirm('Hapus siswa ini?')) return;
  const c = window.DB.classes.find(x => x.id === cid);
  const ns = (c.students || []).filter(x => x.id !== sid);
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(() => {
    c.students = ns; toast('Siswa dihapus', 'success'); viewClass(cid);
  });
};

/* ============================================================
   16. SISTEM TAHAPAN
   ============================================================ */
window.openSistemTahapan = function(cid){
  cid = cid || window.__viewClassId;
  if (!cid){ toast('Pilih kelas dulu', 'warning'); return; }
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;

  const stages = window.DB.stages || [];
  const activeIds = window.DB.activeStages[cid] || [];
  const totalW = stages.reduce((a, s) => a + Number(s.weight || 0), 0);

  let h = '<div class="alert alert-info"><div><b>Sistem Tahapan</b> — ' +
    activeIds.length + '/' + stages.length + ' aktif · Total bobot: ' + totalW + '%</div></div>';

  h += '<div class="action-row" style="margin-bottom:14px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary btn-sm" onclick="openTambahTahapan(\'' + cid + '\')">Tambah Tahap</button>' +
    '<button class="btn btn-sm" onclick="aktifkanSemuaTahapan(\'' + cid + '\')">Aktifkan Semua</button>' +
    '<button class="btn btn-sm btn-danger" onclick="matikanSemuaTahapan(\'' + cid + '\')">Matikan Semua</button>' +
  '</div>';

  stages.forEach((stage, i) => {
    const isActive = activeIds.indexOf(stage.id) >= 0;
    const dl = ((window.DB.deadlines[cid] || {})[stage.id]) || {};
    h += '<div class="card" style="margin-bottom:12px;border-left:4px solid ' +
      (isActive ? 'var(--success)' : 'var(--border-strong)') + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="font-weight:800;font-size:14px;">' + (i+1) + '. ' + esc(stage.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' +
            (stage.subtitle ? esc(stage.subtitle) + ' · ' : '') + 'Bobot ' + stage.weight + '%</div>' +
        '</div>' +
        '<span class="badge ' + (isActive ? 'badge-success' : 'badge-gray') + '">' +
          (isActive ? 'AKTIF' : 'TERKUNCI') + '</span>' +
      '</div>' +
      (stage.desc ? '<div style="font-size:12.5px;margin-bottom:8px;">' + esc(stage.desc) + '</div>' : '') +
      (dl.date ? '<div style="font-size:11.5px;color:var(--warning);margin-bottom:8px;">Deadline: <b>' +
        fmtDateShort(dl.date) + (dl.time ? ' ' + dl.time : '') + '</b></div>' : '') +
      '<div class="action-row" style="flex-wrap:wrap;">' +
        '<button class="btn btn-sm ' + (isActive ? 'btn-danger' : 'btn-primary') + '" onclick="toggleTahapan(\'' + cid + '\',\'' + stage.id + '\')">' +
          (isActive ? 'Matikan' : 'Aktifkan') + '</button>' +
        '<button class="btn btn-sm" onclick="openEditTahapan(\'' + stage.id + '\')">Edit</button>' +
        '<button class="btn btn-sm" onclick="openAturDeadline(\'' + cid + '\',\'' + stage.id + '\')">Deadline</button>' +
        (stages.length > 1 ? '<button class="btn btn-sm btn-danger" onclick="hapusTahapan(\'' + stage.id + '\')">Hapus</button>' : '') +
      '</div>' +
    '</div>';
  });

  openModal('Sistem Tahapan — ' + c.name, h);
};

window.toggleTahapan = function(cid, sid){
  const cur = (window.DB.activeStages[cid] || []).slice();
  const nw = cur.indexOf(sid) >= 0 ? cur.filter(x => x !== sid) : cur.concat([sid]);
  fbSet('activeStages', cid, {classId:cid, activeIds:nw, updatedAt:Date.now()}).then(() => {
    window.DB.activeStages[cid] = nw;
    closeModal();
    setTimeout(() => openSistemTahapan(cid), 200);
  });
};

window.aktifkanSemuaTahapan = function(cid){
  if (!confirm('Aktifkan semua tahapan?')) return;
  const ids = (window.DB.stages || []).map(s => s.id);
  fbSet('activeStages', cid, {classId:cid, activeIds:ids, updatedAt:Date.now()}).then(() => {
    window.DB.activeStages[cid] = ids;
    closeModal();
    setTimeout(() => openSistemTahapan(cid), 200);
  });
};

window.matikanSemuaTahapan = function(cid){
  if (!confirm('Matikan semua tahapan?')) return;
  fbSet('activeStages', cid, {classId:cid, activeIds:[], updatedAt:Date.now()}).then(() => {
    window.DB.activeStages[cid] = [];
    closeModal();
    setTimeout(() => openSistemTahapan(cid), 200);
  });
};

window.openTambahTahapan = function(cid){
  openModal('Tambah Tahapan',
    '<div class="form-group"><label>Nama Tahapan</label><input id="stg-name" maxlength="60"></div>' +
    '<div class="form-group"><label>Sub-Judul</label><input id="stg-sub" maxlength="60"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="stg-desc" rows="2" maxlength="200"></textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label><input type="number" id="stg-w" value="10" min="1" max="100"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanTahapanBaru(\'' + cid + '\')">Simpan</button>');
};

window.simpanTahapanBaru = function(cid){
  const name = ($('stg-name').value || '').trim();
  const sub = ($('stg-sub').value || '').trim();
  const desc = ($('stg-desc').value || '').trim();
  const weight = parseFloat($('stg-w').value) || 0;
  if (!name || name.length < 3){ toast('Nama minimal 3 karakter', 'warning'); return; }
  if (weight <= 0 || weight > 100){ toast('Bobot 1-100', 'warning'); return; }

  const stages = (window.DB.stages || []).slice();
  stages.push({
    id: 'stage_' + Date.now().toString(36),
    name, subtitle:sub, desc, weight
  });
  fbSet('config', 'stages', {stages}).then(() => {
    window.DB.stages = stages;
    closeModal();
    setTimeout(() => openSistemTahapan(cid), 200);
  });
};

window.openEditTahapan = function(sid){
  const s = (window.DB.stages || []).find(x => x.id === sid);
  if (!s) return;
  openModal('Edit Tahapan',
    '<div class="form-group"><label>Nama</label><input id="stg-name" value="' + esc(s.name) + '"></div>' +
    '<div class="form-group"><label>Sub-Judul</label><input id="stg-sub" value="' + esc(s.subtitle || '') + '"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="stg-desc" rows="2">' + esc(s.desc || '') + '</textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label><input type="number" id="stg-w" value="' + s.weight + '"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanEditTahapan(\'' + sid + '\')">Simpan</button>');
};

window.simpanEditTahapan = function(sid){
  const name = ($('stg-name').value || '').trim();
  const sub = ($('stg-sub').value || '').trim();
  const desc = ($('stg-desc').value || '').trim();
  const weight = parseFloat($('stg-w').value) || 0;
  if (!name || weight <= 0){ toast('Lengkapi', 'warning'); return; }

  const stages = (window.DB.stages || []).map(s => s.id === sid
    ? Object.assign({}, s, {name, subtitle:sub, desc, weight}) : s);
  fbSet('config', 'stages', {stages}).then(() => {
    window.DB.stages = stages;
    closeModal();
    toast('Tahapan diperbarui', 'success');
  });
};

window.hapusTahapan = function(sid){
  if (!confirm('Hapus tahapan ini?')) return;
  const stages = (window.DB.stages || []).filter(s => s.id !== sid);
  if (stages.length === 0){ toast('Minimal 1 tahapan', 'warning'); return; }
  fbSet('config', 'stages', {stages}).then(() => {
    window.DB.stages = stages;
    closeModal();
    toast('Tahapan dihapus', 'success');
  });
};

window.openAturDeadline = function(cid, sid){
  const s = (window.DB.stages || []).find(x => x.id === sid);
  const dl = ((window.DB.deadlines[cid] || {})[sid]) || {};
  openModal('Atur Deadline — ' + (s ? s.name : ''),
    '<div class="form-group"><label>Tanggal</label><input type="date" id="dl-date" value="' + (dl.date || '') + '"></div>' +
    '<div class="form-group"><label>Jam</label><input type="time" id="dl-time" value="' + (dl.time || '23:59') + '"></div>' +
    '<div class="form-group"><label>Catatan</label><textarea id="dl-note" rows="2">' + esc(dl.note || '') + '</textarea></div>' +
    '<div class="action-row">' +
      '<button class="btn btn-primary" onclick="simpanDeadline(\'' + cid + '\',\'' + sid + '\')">Simpan</button>' +
      (dl.date ? '<button class="btn btn-danger" onclick="hapusDeadline(\'' + cid + '\',\'' + sid + '\')">Hapus</button>' : '') +
    '</div>');
};

window.simpanDeadline = function(cid, sid){
  const date = $('dl-date').value;
  const time = $('dl-time').value || '23:59';
  const note = ($('dl-note').value || '').trim();
  if (!date){ toast('Tanggal wajib', 'warning'); return; }
  const deadlines = Object.assign({}, window.DB.deadlines[cid] || {});
  deadlines[sid] = {date, time, note, setBy: window.currentUser.name, setAt: Date.now()};
  fbSet('deadlines', cid, Object.assign({}, deadlines, {classId:cid})).then(() => {
    window.DB.deadlines[cid] = deadlines;
    closeModal();
    toast('Deadline tersimpan', 'success');
    if (window.__viewClassId) openSistemTahapan(window.__viewClassId);
  });
};

window.hapusDeadline = function(cid, sid){
  if (!confirm('Hapus deadline?')) return;
  const deadlines = Object.assign({}, window.DB.deadlines[cid] || {});
  delete deadlines[sid];
  fbSet('deadlines', cid, Object.assign({}, deadlines, {classId:cid})).then(() => {
    window.DB.deadlines[cid] = deadlines;
    closeModal();
    toast('Deadline dihapus', 'success');
  });
};

/* ============================================================
   17. KALKULASI NILAI
   ============================================================ */
function calcWeightedAvg(scores, rubric){
  if (!scores || !rubric) return 0;
  let total = 0, wsum = 0;
  rubric.forEach(r => {
    const v = scores[r.id];
    if (typeof v === 'number'){ total += v * r.weight; wsum += r.weight; }
  });
  return wsum > 0 ? total / wsum : 0;
}

function getAttendanceFactor(cid, sid){
  const meetings = Object.values(window.DB.meetings || {}).filter(m => m.classId === cid);
  if (meetings.length === 0) return 1.0;
  let present = 0, total = 0;
  meetings.forEach(m => {
    const r = m.records && m.records[sid];
    if (!r) return;
    total++;
    if (r === 'hadir') present += 1;
    else if (r === 'izin' || r === 'sakit') present += 0.75;
    else if (r === 'telat') present += 0.5;
  });
  if (total === 0) return 1.0;
  const pct = present / total;
  return 0.75 + 0.25 * Math.min(1, Math.max(0, pct));
}

function getStageScore(cid, tid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return {guru:null, ketua:null, rekan:null, final:0, factor:1};
  const t = (c.students || []).find(x => x.id === tid);
  if (!t) return {guru:null, ketua:null, rekan:null, final:0, factor:1};

  const rubric = getRubricFor(t.role);
  const ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid]) || {};

  let guru = null;
  const ketuaArr = [], rekanArr = [];

  Object.keys(ev).forEach(eid => {
    const scores = ev[eid] && ev[eid][sid];
    if (!scores || Object.keys(scores).length === 0) return;
    const avg = calcWeightedAvg(scores, rubric);
    if (eid === 'guru'){ guru = avg; return; }
    const evS = (c.students || []).find(x => x.id === eid);
    if (!evS) return;
    if (evS.role === 'pimpinan_produksi' || evS.role === 'sutradara') ketuaArr.push(avg);
    else rekanArr.push(avg);
  });

  const ketua = ketuaArr.length > 0 ? ketuaArr.reduce((a,b)=>a+b,0)/ketuaArr.length : null;
  const rekan = rekanArr.length > 0 ? rekanArr.reduce((a,b)=>a+b,0)/rekanArr.length : null;

  const parts = [];
  if (guru !== null) parts.push({val:guru, w:0.4});
  if (ketua !== null) parts.push({val:ketua, w:0.3});
  if (rekan !== null) parts.push({val:rekan, w:0.3});

  let finalScore = 0;
  if (parts.length > 0){
    const tw = parts.reduce((a,p) => a + p.w, 0);
    parts.forEach(p => { finalScore += p.val * (p.w / tw); });
  }

  const factor = getAttendanceFactor(cid, tid);
  finalScore = finalScore * factor;

  return {
    guru, ketua, rekan,
    final: Math.max(0, Math.min(4, finalScore)),
    factor
  };
}

function getFinalScore(cid, tid){
  const activeIds = window.DB.activeStages[cid] || [];
  const stages = (window.DB.stages || []).filter(s => activeIds.indexOf(s.id) >= 0);
  if (stages.length === 0) return 0;
  let tw = 0, weighted = 0;
  stages.forEach(s => {
    const bd = getStageScore(cid, tid, s.id);
    weighted += bd.final * s.weight;
    tw += s.weight;
  });
  return tw > 0 ? weighted / tw : 0;
}

/* ============================================================
   18. PENILAIAN
   ============================================================ */
window.openPenilaianSiswa = function(){
  const u = window.currentUser;
  const c = window.DB.classes.find(x => x.id === u.classId);
  if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }

  const activeIds = window.DB.activeStages[c.id] || [];
  if (activeIds.length === 0){ toast('Belum ada tahap aktif', 'warning'); return; }

  const stages = (window.DB.stages || []).filter(s => activeIds.indexOf(s.id) >= 0);
  const others = (c.students || []).filter(s =>
    s.id !== u.studentId && canEvaluate(u.role, s.role));

  if (others.length === 0){ openModal('Penilaian', '<div class="empty-state"><p>Tidak ada rekan untuk dinilai.</p></div>'); return; }

  let h = '<div class="alert alert-info"><div>Pilih tahap dan rekan untuk dinilai. Nilai berdasarkan bukti nyata.</div></div>';

  stages.forEach(s => {
    h += '<div class="card" style="border-left:4px solid var(--primary);margin-bottom:10px;">' +
      '<div style="font-weight:700;margin-bottom:8px;">' + esc(s.name) + ' (Bobot ' + s.weight + '%)</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">' + esc(s.desc || '') + '</div>' +
      '<button class="btn btn-primary btn-sm" onclick="openPenilaianTahap(\'' + c.id + '\',\'' + s.id + '\')">Nilai Tahap Ini</button>' +
    '</div>';
  });

  openModal('Beri Nilai Rekan', h);
};

window.openPenilaianTahap = function(cid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  const u = window.currentUser;
  const stage = (window.DB.stages || []).find(s => s.id === sid);
  if (!c || !stage) return;

  const targets = (c.students || []).filter(s =>
    s.id !== u.studentId && canEvaluate(u.role, s.role));

  let h = '<div class="alert alert-info"><div>Nilai: <b>' + esc(stage.name) + '</b></div></div>';

  targets.forEach(t => {
    const rl = (ROLES[t.role] || {}).label || t.role;
    const ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
    const myScores = (ev[u.studentId] && ev[u.studentId][sid]) || {};
    const done = Object.keys(myScores).length > 0;

    h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' +
      (done ? 'var(--success)' : 'var(--warning)') + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<div><div style="font-weight:700;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(rl) + '</div></div>' +
        (done ? '<span class="badge badge-success">Sudah dinilai</span>' : '') +
      '</div>' +
      '<button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="openFormNilai(\'' + cid + '\',\'' + t.id + '\',\'' + sid + '\')">' +
        (done ? 'Edit Nilai' : 'Beri Nilai') +
      '</button>' +
    '</div>';
  });

  openModal('Penilaian — ' + stage.name, h);
};

window.openFormNilai = function(cid, tid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  const t = (c.students || []).find(x => x.id === tid);
  if (!t) return;
  const rubric = getRubricFor(t.role);
  const u = window.currentUser;
  const ev = ((window.DB.evaluations[cid] || {})[tid] || {})[u.studentId] || {};
  const myScores = ev[sid] || {};

  let h = '<div class="alert alert-info"><div>Menilai <b>' + esc(t.name) + '</b></div></div>';
  h += '<div class="alert alert-warning" style="font-size:12px;"><div>Skala: 4=Sangat Baik, 3=Baik, 2=Cukup, 1=Kurang</div></div>';

  rubric.forEach(r => {
    const v = myScores[r.id];
    h += '<div class="rubric-item" style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">' +
      '<div style="font-weight:700;margin-bottom:8px;">' + esc(r.name) + ' <span class="badge badge-gray">' + r.weight + '%</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
    [4,3,2,1].forEach(val => {
      const lbl = {4:'Sangat Baik', 3:'Baik', 2:'Cukup', 1:'Kurang'}[val];
      h += '<label style="display:flex;align-items:center;gap:6px;padding:8px;border:1.5px solid ' +
        (v === val ? 'var(--primary)' : 'var(--border)') + ';border-radius:6px;cursor:pointer;' +
        (v === val ? 'background:var(--primary-soft);' : '') + 'font-size:12px;">' +
        '<input type="radio" name="sc_' + sid + '_' + r.id + '" value="' + val + '"' + (v === val ? ' checked' : '') + '>' +
        '<span><b>' + val + '</b> ' + lbl + '</span></label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" onclick="simpanNilai(\'' + cid + '\',\'' + tid + '\',\'' + sid + '\')">Simpan Nilai</button>';
  openModal('Nilai: ' + t.name, h);
};

window.simpanNilai = function(cid, tid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  const t = (c.students || []).find(x => x.id === tid);
  if (!t) return;
  const rubric = getRubricFor(t.role);
  const scores = {}, missing = [];

  rubric.forEach(r => {
    const sel = document.querySelector('input[name="sc_' + sid + '_' + r.id + '"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });

  if (missing.length > 0){
    toast('Belum lengkap: ' + missing.slice(0, 3).join(', '), 'warning'); return;
  }

  const u = window.currentUser;
  const docId = cid + '__' + tid;

  if (!fbReady){ toast('Firebase belum siap', 'warning'); return; }

  fb.collection('evaluations').doc(docId).get().then(snap => {
    const data = snap.exists ? snap.data() : {classId:cid, targetId:tid};
    data[u.studentId] = data[u.studentId] || {};
    data[u.studentId][sid] = scores;
    return fb.collection('evaluations').doc(docId).set(data, {merge:true});
  }).then(() => {
    toast('Nilai tersimpan', 'success');
    closeModal();
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

/* ============================================================
   19. REKAP NILAI + EXPORT
   ============================================================ */
window.openRekapNilai = function(cid){
  cid = cid || window.__viewClassId;
  if (!cid){ toast('Pilih kelas dulu', 'warning'); return; }
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;

  const activeIds = window.DB.activeStages[cid] || [];
  const stages = (window.DB.stages || []).filter(s => activeIds.indexOf(s.id) >= 0);

  if (stages.length === 0){
    openModal('Rekap Nilai', '<div class="alert alert-warning"><div>Belum ada tahap aktif.</div></div>');
    return;
  }

  let h = '<div class="alert alert-info"><div>Bobot: Guru 40% + Ketua 30% + Rekan 30% × Faktor Kehadiran</div></div>';
  h += '<div class="action-row" style="margin-bottom:10px;">' +
    '<button class="btn btn-primary btn-sm" onclick="exportRekap(\'' + cid + '\')">Export Excel</button>' +
  '</div>';
  h += '<div class="table-wrap"><table><thead><tr>' +
    '<th>No</th><th>Nama</th><th>Peran</th>';
  stages.forEach(s => { h += '<th>' + esc(s.name) + '</th>'; });
  h += '<th>Nilai Akhir</th></tr></thead><tbody>';

  (c.students || []).forEach((t, i) => {
    const rl = (ROLES[t.role] || {}).label || t.role;
    h += '<tr><td>' + (i+1) + '</td><td><b>' + esc(t.name) + '</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' + esc(rl) + '</span></td>';
    stages.forEach(s => {
      const bd = getStageScore(cid, t.id, s.id);
      const color = bd.final >= 3.5 ? 'badge-success' : bd.final >= 2.5 ? 'badge-info' : bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';
      h += '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>';
    });
    const final = getFinalScore(cid, t.id);
    h += '<td><b style="font-size:14px;color:var(--primary);">' + final.toFixed(2) + '</b></td></tr>';
  });

  h += '</tbody></table></div>';
  openModal('Rekap Nilai — ' + c.name, h);
};

window.exportRekap = function(cid){
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c){ toast('Kelas tidak ditemukan', 'warning'); return; }
  if (!window.XLSX){ toast('Library Excel belum siap', 'error'); return; }

  const activeIds = window.DB.activeStages[cid] || [];
  const stages = (window.DB.stages || []).filter(s => activeIds.indexOf(s.id) >= 0);

  const header = ['No','Nama','Peran'];
  stages.forEach(s => {
    header.push(s.name + ' - Guru');
    header.push(s.name + ' - Ketua');
    header.push(s.name + ' - Rekan');
    header.push(s.name + ' - Faktor');
    header.push(s.name + ' - Final');
  });
  header.push('Nilai Akhir');

  const rows = [header];
  (c.students || []).forEach((t, i) => {
    const rl = (ROLES[t.role] || {}).label || t.role;
    const row = [i+1, t.name, rl];
    stages.forEach(s => {
      const bd = getStageScore(cid, t.id, s.id);
      row.push(bd.guru !== null ? bd.guru.toFixed(2) : '-');
      row.push(bd.ketua !== null ? bd.ketua.toFixed(2) : '-');
      row.push(bd.rekan !== null ? bd.rekan.toFixed(2) : '-');
      row.push(bd.factor.toFixed(2));
      row.push(bd.final.toFixed(2));
    });
    row.push(getFinalScore(cid, t.id).toFixed(2));
    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
  XLSX.writeFile(wb, 'Rekap_' + c.name.replace(/\s+/g,'_') + '.xlsx');
  toast('Export berhasil', 'success');
};

/* ============================================================
   20. ABSENSI (MEETING)
   ============================================================ */
window.openAbsensiList = function(){
  const u = window.currentUser;
  const cid = u.classId || window.__viewClassId;
  if (!cid) return;
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;

  const meetings = Object.values(window.DB.meetings || {})
    .filter(m => m.classId === cid)
    .sort((a,b) => (b.createdAt||0) - (a.createdAt||0));

  const canCreate = u.type === 'guru' || u.role === 'sekretaris' ||
                    u.role === 'pimpinan_produksi' || u.role === 'sutradara' ||
                    u.role === 'asisten_sutradara';

  let h = '<div class="alert alert-info"><div>Daftar sesi absensi (' + meetings.length + ')</div></div>';

  if (canCreate){
    h += '<div class="action-row" style="margin-bottom:12px;flex-wrap:wrap;">' +
      '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'rapat\',\'' + cid + '\')">Buat Rapat</button>' +
      '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'latihan\',\'' + cid + '\')">Buat Latihan</button>' +
      '<button class="btn btn-primary btn-sm" onclick="openBuatMeeting(\'gladi\',\'' + cid + '\')">Buat Gladi</button>' +
    '</div>';
  }

  if (meetings.length === 0){
    h += '<div class="empty-state"><p>Belum ada sesi absensi.</p></div>';
  } else {
    meetings.forEach(m => {
      const records = m.records || {};
      const total = Object.keys(records).length;
      let hadir = 0;
      Object.values(records).forEach(v => { if (v === 'hadir') hadir++; });
      h += '<div class="card" style="margin-bottom:10px;border-left:3px solid var(--primary);">' +
        '<div style="font-weight:700;">' + esc(m.title) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">' +
          (m.type || '') + ' · ' + (m.date ? fmtDateShort(m.date) : '-') +
          (m.openTime ? ' · ' + m.openTime + '-' + (m.closeTime || '?') : '') +
        '</div>' +
        '<div style="font-size:12px;margin-bottom:8px;">Hadir: <b>' + hadir + '/' + ((c.students || []).length) + '</b></div>' +
        '<div class="action-row">' +
          '<button class="btn btn-sm btn-primary" onclick="openIsiAbsensi(\'' + m.id + '\')">Isi Absensi</button>' +
          '<button class="btn btn-sm" onclick="openRekapMeeting(\'' + m.id + '\')">Rekap</button>' +
          (u.type === 'guru' ? '<button class="btn btn-sm btn-danger" onclick="hapusMeeting(\'' + m.id + '\')">Hapus</button>' : '') +
        '</div>' +
      '</div>';
    });
  }

  openModal('Absensi', h);
};

window.openBuatMeeting = function(type, cid){
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;
  const titleMap = {rapat:'Sesi Rapat', latihan:'Sesi Latihan', gladi:'Sesi Gladi'};
  openModal('Buat ' + titleMap[type],
    '<div class="form-group"><label>Judul</label><input id="mt-title" maxlength="100" value="' + titleMap[type] + '"></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="mt-date" value="' + todayISO() + '"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
      '<div class="form-group"><label>Jam Buka</label><input type="time" id="mt-open" value="14:00"></div>' +
      '<div class="form-group"><label>Jam Tutup</label><input type="time" id="mt-close" value="15:00"></div>' +
    '</div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanMeeting(\'' + type + '\',\'' + cid + '\')">Buat Sesi</button>');
};

window.simpanMeeting = function(type, cid){
  const title = ($('mt-title').value || '').trim();
  const date = $('mt-date').value;
  const open = $('mt-open').value || '14:00';
  const close = $('mt-close').value || '15:00';
  if (!title || !date){ toast('Judul dan tanggal wajib', 'warning'); return; }

  const id = uid();
  const m = {
    id, classId:cid, title, type, date, openTime:open, closeTime:close,
    records:{}, createdAt:Date.now(), createdBy: window.currentUser.name
  };
  fbSet('meetings', id, m).then(() => {
    window.DB.meetings[id] = m;
    closeModal();
    toast('Sesi dibuat', 'success');
    setTimeout(() => openAbsensiList(), 200);
  });
};

window.openIsiAbsensi = function(mid){
  const m = window.DB.meetings[mid];
  if (!m) return;
  const c = window.DB.classes.find(x => x.id === m.classId);
  if (!c) return;
  const u = window.currentUser;

  if (u.type === 'siswa'){
    const cur = (m.records && m.records[u.studentId]) || '';
    const opts = [
      {v:'hadir', l:'Hadir'}, {v:'izin', l:'Izin'}, {v:'sakit', l:'Sakit'},
      {v:'telat', l:'Telat'}, {v:'alpa', l:'Tidak Hadir'}
    ];
    let h = '<div class="alert alert-info"><div><b>' + esc(m.title) + '</b></div></div>';
    opts.forEach(o => {
      h += '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid ' +
        (cur === o.v ? 'var(--primary)' : 'var(--border)') + ';border-radius:8px;margin-bottom:6px;cursor:pointer;' +
        (cur === o.v ? 'background:var(--primary-soft);' : '') + '">' +
        '<input type="radio" name="att" value="' + o.v + '"' + (cur === o.v ? ' checked' : '') + '>' +
        '<b>' + o.l + '</b></label>';
    });
    h += '<button class="btn btn-primary btn-block" onclick="simpanAbsensi(\'' + mid + '\')">Simpan</button>';
    openModal('Isi Absensi', h);
    return;
  }

  // Guru: input semua
  let h = '<div class="alert alert-info"><div><b>' + esc(m.title) + '</b></div></div>';
  h += '<div class="action-row" style="margin-bottom:10px;">' +
    '<button class="btn btn-sm" onclick="setAllAtt(\'' + mid + '\',\'hadir\')">Hadir Semua</button>' +
    '<button class="btn btn-sm" onclick="setAllAtt(\'' + mid + '\',\'alpa\')">Alpa Semua</button>' +
  '</div>';
  h += '<div style="max-height:400px;overflow-y:auto;">';
  (c.students || []).forEach(s => {
    const r = (m.records && m.records[s.id]) || '';
    h += '<div style="padding:10px;border-bottom:1px solid var(--border);">' +
      '<div style="font-weight:600;font-size:12.5px;margin-bottom:6px;">' + esc(s.name) + '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap;">';
    ['hadir','izin','sakit','telat','alpa'].forEach(opt => {
      const lbl = {hadir:'Hadir',izin:'Izin',sakit:'Sakit',telat:'Telat',alpa:'Alpa'}[opt];
      h += '<label style="font-size:11px;padding:5px 8px;border:1px solid ' +
        (r === opt ? 'var(--primary)' : 'var(--border)') + ';border-radius:5px;cursor:pointer;' +
        (r === opt ? 'background:var(--primary-soft);' : '') + '">' +
        '<input type="radio" name="att_' + s.id + '" value="' + opt + '"' + (r === opt ? ' checked' : '') +
        ' onchange="updateAtt(\'' + mid + '\',\'' + s.id + '\',\'' + opt + '\')" style="display:none;"> ' +
        lbl + '</label>';
    });
    h += '</div></div>';
  });
  h += '</div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="closeModal()">Selesai</button>';
  openModal('Absensi: ' + m.title, h);
};

window.simpanAbsensi = function(mid){
  const sel = document.querySelector('input[name="att"]:checked');
  if (!sel){ toast('Pilih status', 'warning'); return; }
  const m = window.DB.meetings[mid];
  if (!m) return;
  const rec = Object.assign({}, m.records || {});
  rec[window.currentUser.studentId] = sel.value;
  m.records = rec;
  fbSet('meetings', mid, {records:rec}).then(() => {
    toast('Absensi tersimpan', 'success');
    closeModal();
  });
};

window.updateAtt = function(mid, sid, status){
  const m = window.DB.meetings[mid];
  if (!m) return;
  const rec = Object.assign({}, m.records || {});
  rec[sid] = status;
  m.records = rec;
  fbSet('meetings', mid, {records:rec});
};

window.setAllAtt = function(mid, status){
  const m = window.DB.meetings[mid];
  if (!m) return;
  const c = window.DB.classes.find(x => x.id === m.classId);
  if (!c) return;
  const rec = {};
  (c.students || []).forEach(s => { rec[s.id] = status; });
  m.records = rec;
  fbSet('meetings', mid, {records:rec}).then(() => {
    closeModal();
    setTimeout(() => openIsiAbsensi(mid), 200);
  });
};

window.openRekapMeeting = function(mid){
  const m = window.DB.meetings[mid];
  if (!m) return;
  const c = window.DB.classes.find(x => x.id === m.classId);
  if (!c) return;
  let h = '<div class="alert alert-info"><div><b>' + esc(m.title) + '</b></div></div>';
  h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Status</th></tr></thead><tbody>';
  (c.students || []).forEach((s, i) => {
    const r = (m.records && m.records[s.id]) || '-';
    h += '<tr><td>' + (i+1) + '</td><td>' + esc(s.name) + '</td><td>' + esc(r) + '</td></tr>';
  });
  h += '</tbody></table></div>';
  openModal('Rekap Absensi', h);
};

window.hapusMeeting = function(mid){
  if (!confirm('Hapus sesi ini?')) return;
  fbDel('meetings', mid).then(() => {
    delete window.DB.meetings[mid];
    closeModal();
    toast('Sesi dihapus', 'success');
    setTimeout(() => openAbsensiList(), 200);
  });
};

/* ============================================================
   21. CHECKLIST
   ============================================================ */
window.openChecklistSaya = function(){
  const u = window.currentUser;
  const ch = (window.DB.checklists[u.classId] || {}).items || [];
  const mine = ch.filter(x => x.isPersonal && x.ownerId === u.studentId);

  let h = '<div class="alert alert-info"><div>Checklist pribadi Anda</div></div>';
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="tambahChecklist()">Tambah Item</button>';

  if (mine.length === 0){
    h += '<div class="empty-state"><p>Belum ada checklist.</p></div>';
  } else {
    const done = mine.filter(x => x.done).length;
    h += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">' + done + ' / ' + mine.length + ' selesai</div>';
    mine.forEach(it => {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:9px;background:var(--surface);border-radius:6px;margin-bottom:5px;">' +
        '<input type="checkbox" ' + (it.done ? 'checked' : '') + ' onchange="toggleChecklist(\'' + it.id + '\', this.checked)">' +
        '<span style="flex:1;font-size:12.5px;' + (it.done ? 'text-decoration:line-through;color:var(--text-muted);' : '') + '">' + esc(it.name) + '</span>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusChecklist(\'' + it.id + '\')">Hapus</button>' +
      '</div>';
    });
  }
  openModal('Checklist Saya', h);
};

window.tambahChecklist = function(){
  const n = prompt('Nama tugas:');
  if (!n || n.trim().length < 2) return;
  const u = window.currentUser;
  const ch = window.DB.checklists[u.classId] || {items: []};
  ch.items = ch.items || [];
  ch.items.push({
    id:uid(), name:n.trim(), done:false, isPersonal:true,
    ownerId:u.studentId, ownerName:u.name, createdAt:Date.now()
  });
  fbSet('checklists', u.classId, ch).then(() => {
    window.DB.checklists[u.classId] = ch;
    openChecklistSaya();
  });
};

window.toggleChecklist = function(id, done){
  const u = window.currentUser;
  const ch = window.DB.checklists[u.classId];
  if (!ch) return;
  ch.items = ch.items.map(x => x.id === id ? Object.assign({}, x, {done}) : x);
  fbSet('checklists', u.classId, ch);
};

window.hapusChecklist = function(id){
  if (!confirm('Hapus item ini?')) return;
  const u = window.currentUser;
  const ch = window.DB.checklists[u.classId];
  if (!ch) return;
  ch.items = ch.items.filter(x => x.id !== id);
  fbSet('checklists', u.classId, ch).then(() => openChecklistSaya());
};

window.openChecklistTim = function(){
  const u = window.currentUser;
  const cid = u.classId || window.__viewClassId;
  const ch = (window.DB.checklists[cid] || {}).items || [];
  const timItems = ch.filter(x => !x.isPersonal);

  const myRole = u.role;
  const isGuru = u.type === 'guru';
  const isPimpro = myRole === 'pimpinan_produksi';
  const isSutradara = myRole === 'sutradara';
  const isAstrada = myRole === 'asisten_sutradara';

  let visible = timItems;
  if (!isGuru && !isPimpro && !isSutradara && !isAstrada){
    visible = timItems.filter(it => {
      const r = it.assignedRole || 'umum';
      if (r === 'umum') return true;
      if (r === myRole) return true;
      // Peer koor <-> anggota
      if (myRole.indexOf('koor_') === 0 && r === 'anggota_' + myRole.substring(5)) return true;
      if (myRole.indexOf('anggota_') === 0 && r === 'koor_' + myRole.substring(8)) return true;
      return false;
    });
  }

  let h = '<div class="alert alert-info"><div>Checklist tim (' + visible.length + ' item)</div></div>';

  if (visible.length === 0){
    h += '<div class="empty-state"><p>Belum ada checklist untuk Anda.</p></div>';
  } else {
    const byRole = {};
    visible.forEach(it => {
      const r = it.assignedRole || 'umum';
      if (!byRole[r]) byRole[r] = [];
      byRole[r].push(it);
    });
    Object.keys(byRole).sort().forEach(rk => {
      const label = (ROLES[rk] && ROLES[rk].label) || (rk === 'umum' ? 'Umum' : rk);
      const arr = byRole[rk];
      const done = arr.filter(x => x.done).length;
      h += '<div class="card" style="margin-bottom:10px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
          '<b>' + esc(label) + '</b>' +
          '<span class="badge badge-info">' + done + '/' + arr.length + '</span>' +
        '</div>';
      arr.forEach(it => {
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed var(--border);">' +
          '<input type="checkbox" ' + (it.done ? 'checked' : '') + ' onchange="toggleChecklistTim(\'' + it.id + '\', this.checked)">' +
          '<span style="flex:1;font-size:12.5px;' + (it.done ? 'text-decoration:line-through;color:var(--text-muted);' : '') + '">' + esc(it.name) + '</span>' +
        '</div>';
      });
      h += '</div>';
    });
  }
  openModal('Checklist Tim', h);
};

window.toggleChecklistTim = function(id, done){
  const u = window.currentUser;
  const cid = u.classId || window.__viewClassId;
  const ch = window.DB.checklists[cid];
  if (!ch) return;
  ch.items = ch.items.map(x => x.id === id
    ? Object.assign({}, x, {done, doneBy: done ? u.name : null, doneAt: done ? Date.now() : null})
    : x);
  fbSet('checklists', cid, ch);
};

window.openChecklistManage = function(cid){
  cid = cid || window.__viewClassId;
  if (!cid) return;
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;
  const ch = (window.DB.checklists[cid] || {}).items || [];
  const timItems = ch.filter(x => !x.isPersonal);

  let h = '<div class="alert alert-info"><div>Kelola checklist tim — ' + timItems.length + ' item</div></div>';
  h += '<div class="action-row" style="margin-bottom:12px;">' +
    '<button class="btn btn-primary btn-sm" onclick="openTambahChecklistItem(\'' + cid + '\')">Tambah Item</button>' +
    (timItems.length > 0 ? '<button class="btn btn-danger btn-sm" onclick="hapusSemuaChecklist(\'' + cid + '\')">Hapus Semua</button>' : '') +
  '</div>';

  if (timItems.length === 0){
    h += '<div class="empty-state"><p>Belum ada item checklist tim.</p></div>';
  } else {
    timItems.forEach(it => {
      const rl = (ROLES[it.assignedRole] && ROLES[it.assignedRole].label) || it.assignedRole || 'umum';
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--surface);border-radius:6px;margin-bottom:5px;">' +
        '<div style="flex:1;">' +
          '<div style="font-size:12.5px;font-weight:600;">' + esc(it.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + esc(rl) + '</div>' +
        '</div>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusChecklistItem(\'' + cid + '\',\'' + it.id + '\')">Hapus</button>' +
      '</div>';
    });
  }
  openModal('Kelola Checklist', h);
};

window.openTambahChecklistItem = function(cid){
  let opts = '<option value="umum">Umum (semua siswa)</option>';
  Object.keys(ROLES).forEach(k => {
    opts += '<option value="' + k + '">' + ROLES[k].label + '</option>';
  });
  openModal('Tambah Item Checklist',
    '<div class="form-group"><label>Nama Tugas</label><input id="cli-name" maxlength="150"></div>' +
    '<div class="form-group"><label>Untuk Peran</label><select id="cli-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanChecklistItem(\'' + cid + '\')">Simpan</button>');
};

window.simpanChecklistItem = function(cid){
  const n = ($('cli-name').value || '').trim();
  const r = $('cli-role').value;
  if (!n || n.length < 3){ toast('Nama minimal 3 karakter', 'warning'); return; }
  const ch = window.DB.checklists[cid] || {items: []};
  ch.items = ch.items || [];
  ch.items.push({
    id:uid(), name:n, assignedRole:r, done:false,
    isPersonal:false, createdAt:Date.now(), createdBy: window.currentUser.name
  });
  fbSet('checklists', cid, ch).then(() => {
    window.DB.checklists[cid] = ch;
    closeModal();
    toast('Item ditambahkan', 'success');
    setTimeout(() => openChecklistManage(cid), 200);
  });
};

window.hapusChecklistItem = function(cid, id){
  if (!confirm('Hapus item ini?')) return;
  const ch = window.DB.checklists[cid];
  if (!ch) return;
  ch.items = ch.items.filter(x => x.id !== id);
  fbSet('checklists', cid, ch).then(() => {
    setTimeout(() => openChecklistManage(cid), 200);
  });
};

window.hapusSemuaChecklist = function(cid){
  if (!confirm('Hapus SEMUA item checklist tim? Item pribadi tetap aman.')) return;
  const ch = window.DB.checklists[cid] || {items: []};
  ch.items = (ch.items || []).filter(x => x.isPersonal);
  fbSet('checklists', cid, ch).then(() => {
    toast('Semua item tim dihapus', 'success');
    setTimeout(() => openChecklistManage(cid), 200);
  });
};

/* ============================================================
   22. BERI TUGAS
   ============================================================ */
window.openBeriTugasGuru = function(cid){
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;
  const students = c.students || [];

  let h = '<div class="alert alert-info"><div>Kirim tugas ke siswa terpilih.</div></div>';
  h += '<div class="form-group"><label>Judul Tugas</label><input id="bt-title" maxlength="100"></div>';
  h += '<div class="form-group"><label>Deskripsi</label><textarea id="bt-desc" rows="3" maxlength="500"></textarea></div>';
  h += '<div class="form-group"><label>Deadline</label><input type="date" id="bt-deadline" value="' + todayISO() + '"></div>';
  h += '<div class="form-group"><label>Penerima</label>' +
    '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
      '<button type="button" class="btn btn-sm" onclick="btSelAll(true)">Semua</button>' +
      '<button type="button" class="btn btn-sm" onclick="btSelAll(false)">Kosongkan</button>' +
    '</div>' +
    '<div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  students.forEach(s => {
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="bt-cb" value="' + s.id + '" checked>' +
      '<span style="flex:1;">' + esc(s.name) + '</span>' +
      '<span style="font-size:10.5px;color:var(--text-muted);">' + esc((ROLES[s.role]||{}).label||s.role) + '</span>' +
    '</label>';
  });
  h += '</div></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" onclick="kirimTugas(\'' + cid + '\')">Kirim Tugas</button>';

  openModal('Beri Tugas', h);
};

window.btSelAll = function(c){
  document.querySelectorAll('.bt-cb').forEach(cb => cb.checked = c);
};

window.kirimTugas = function(cid){
  const title = ($('bt-title').value || '').trim();
  const desc = ($('bt-desc').value || '').trim();
  const deadline = $('bt-deadline').value;
  if (!title){ toast('Judul wajib', 'warning'); return; }

  const targets = [];
  document.querySelectorAll('.bt-cb:checked').forEach(cb => targets.push(cb.value));
  if (targets.length === 0){ toast('Pilih minimal 1 penerima', 'warning'); return; }

  const u = window.currentUser;
  const msg = desc + (deadline ? '\n\nDeadline: ' + fmtDateShort(deadline) : '');

  Promise.all(targets.map(tid => {
    const nid = uid();
    return fbSet('notifications', nid, {
      id:nid, classId:cid,
      fromId: u.email, fromName: u.name, fromType:'guru',
      toId:tid, type:'tugas',
      title:'[TUGAS] ' + title,
      message: msg,
      createdAt: Date.now(), readBy: [], doneBy: []
    });
  })).then(() => {
    toast('Tugas terkirim ke ' + targets.length + ' siswa', 'success');
    closeModal();
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

window.openInboxTugas = function(){
  const u = window.currentUser;
  const myClasses = (window.DB.classes || []).filter(c =>
    c.teacherEmail && c.teacherEmail.toLowerCase() === u.email.toLowerCase()).map(c => c.id);
  const tasks = (window.DB.notifications || []).filter(n =>
    n.type === 'tugas' && myClasses.indexOf(n.classId) >= 0)
    .sort((a,b) => (b.createdAt||0)-(a.createdAt||0));

  let h = '<div class="alert alert-info"><div>Inbox tugas yang Anda kirim (' + tasks.length + ')</div></div>';
  if (tasks.length === 0){
    h += '<div class="empty-state"><p>Belum ada tugas dikirim.</p></div>';
  } else {
    tasks.forEach(t => {
      h += '<div class="card" style="margin-bottom:8px;">' +
        '<div style="font-weight:700;">' + esc(t.title) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">' + fmtDate(t.createdAt) + '</div>' +
        '<div style="font-size:12px;white-space:pre-wrap;">' + esc(t.message || '') + '</div>' +
      '</div>';
    });
  }
  openModal('Inbox Tugas', h);
};

/* ============================================================
   23. STRUKTUR KERABAT KERJA
   ============================================================ */
window.openStrukturKerabat = function(cid){
  const u = window.currentUser;
  cid = cid || u.classId || window.__viewClassId;
  if (!cid) return;
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;

  const students = (c.students || []).slice();
  students.sort((a,b) => {
    const la = ROLES[a.role]?.level || 99;
    const lb = ROLES[b.role]?.level || 99;
    if (la !== lb) return la - lb;
    return String(a.name).localeCompare(String(b.name));
  });

  let h = '<div class="alert alert-info"><div><b>' + esc(c.kerabatNama || 'Kerabat Kerja ' + c.name) + '</b></div></div>';

  students.forEach(s => {
    const rl = (ROLES[s.role] || {}).label || s.role;
    const isMe = s.id === u.studentId;
    h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:' +
      (isMe ? 'var(--primary-soft)' : 'var(--surface)') + ';border-radius:8px;margin-bottom:6px;' +
      'border-left:3px solid ' + (isMe ? 'var(--primary)' : 'var(--border)') + ';">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:' +
        (isMe ? 'var(--primary)' : 'var(--card)') + ';color:' + (isMe ? '#fff' : 'var(--text)') +
        ';display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">' +
        esc((s.name || '?').charAt(0).toUpperCase()) + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-weight:700;font-size:13px;">' + esc(s.name) +
          (isMe ? ' <span class="badge badge-primary" style="font-size:9px;">Anda</span>' : '') + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(rl) + '</div>' +
      '</div>' +
    '</div>';
  });

  openModal('Struktur Kerabat Kerja', h);
};

/* ============================================================
   24. KAS KELAS
   ============================================================ */
window.openKasManage = function(cid){
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;
  const data = window.DB.kas[cid] || {active:false, nama:'', nominal:0, payments:{}};

  let h = '<div class="alert alert-info"><div>Kas kelas</div></div>';

  if (!data.active){
    h += '<div class="form-group"><label>Nama Kas</label><input id="kas-nama" value="' + esc(data.nama || 'Kas Kelas') + '"></div>' +
      '<div class="form-group"><label>Nominal (Rp)</label><input type="number" id="kas-nominal" value="' + (data.nominal || 10000) + '"></div>' +
      '<button class="btn btn-primary btn-block" onclick="aktifkanKas(\'' + cid + '\')">Aktifkan Kas</button>';
  } else {
    let total = 0, paid = 0;
    (c.students || []).forEach(s => {
      const p = (data.payments && data.payments[s.id]) || [];
      p.forEach(x => total += x.nominal || data.nominal);
      if (p.length > 0) paid++;
    });

    h += '<div class="card">' +
      '<div style="font-weight:700;">' + esc(data.nama) + '</div>' +
      '<div style="font-size:12px;">Rp ' + data.nominal.toLocaleString('id-ID') + ' / siswa</div>' +
      '<div style="font-size:13px;margin-top:6px;">Terkumpul: <b>Rp ' + total.toLocaleString('id-ID') + '</b></div>' +
      '<div style="font-size:12px;color:var(--text-muted);">' + paid + ' / ' + ((c.students||[]).length) + ' siswa sudah bayar</div>' +
      '</div>';

    h += '<div class="action-row" style="margin-bottom:10px;">' +
      '<button class="btn btn-sm btn-danger" onclick="nonaktifkanKas(\'' + cid + '\')">Nonaktifkan</button>' +
    '</div>';

    h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
    (c.students || []).forEach((s, i) => {
      const p = (data.payments && data.payments[s.id]) || [];
      const isPaid = p.length > 0;
      h += '<tr><td>' + (i+1) + '</td><td>' + esc(s.name) + '</td>' +
        '<td>' + (isPaid ? '<span class="badge badge-success">Lunas</span>' : '<span class="badge badge-warning">Belum</span>') + '</td>' +
        '<td>' + (isPaid
          ? '<button class="btn btn-sm btn-danger" onclick="kasUnpaid(\'' + cid + '\',\'' + s.id + '\')">Batal</button>'
          : '<button class="btn btn-sm btn-success" onclick="kasPaid(\'' + cid + '\',\'' + s.id + '\')">Bayar</button>') + '</td>' +
      '</tr>';
    });
    h += '</tbody></table></div>';
  }

  openModal('Kas Kelas — ' + c.name, h);
};

window.aktifkanKas = function(cid){
  const nama = ($('kas-nama').value || '').trim();
  const nominal = parseFloat($('kas-nominal').value) || 0;
  if (!nama || nominal <= 0){ toast('Lengkapi', 'warning'); return; }
  const data = {active:true, nama, nominal, payments:{}};
  fbSet('kas_kelas', cid, data).then(() => {
    window.DB.kas[cid] = data;
    closeModal();
    toast('Kas aktif', 'success');
    setTimeout(() => openKasManage(cid), 200);
  });
};

window.nonaktifkanKas = function(cid){
  if (!confirm('Nonaktifkan kas?')) return;
  const data = window.DB.kas[cid] || {};
  data.active = false;
  fbSet('kas_kelas', cid, data).then(() => {
    closeModal();
    toast('Kas nonaktif', 'success');
  });
};

window.kasPaid = function(cid, sid){
  const data = window.DB.kas[cid] || {payments:{}};
  data.payments = data.payments || {};
  data.payments[sid] = data.payments[sid] || [];
  data.payments[sid].push({tanggal: todayISO(), nominal: data.nominal, by: window.currentUser.name, at: Date.now()});
  fbSet('kas_kelas', cid, data).then(() => {
    closeModal();
    setTimeout(() => openKasManage(cid), 200);
  });
};

window.kasUnpaid = function(cid, sid){
  if (!confirm('Hapus pembayaran terakhir?')) return;
  const data = window.DB.kas[cid];
  if (data.payments && data.payments[sid] && data.payments[sid].length) data.payments[sid].pop();
  fbSet('kas_kelas', cid, data).then(() => {
    closeModal();
    setTimeout(() => openKasManage(cid), 200);
  });
};

window.openKasView = function(){
  const u = window.currentUser;
  const cid = u.classId;
  const data = window.DB.kas[cid];
  if (!data || !data.active){
    openModal('Kas Kelas', '<div class="alert alert-info"><div>Kas belum diaktifkan bendahara.</div></div>');
    return;
  }
  const c = window.DB.classes.find(x => x.id === cid);
  const myPayment = (data.payments && data.payments[u.studentId]) || [];

  let h = '<div class="alert alert-info"><div><b>' + esc(data.nama) + '</b></div></div>';
  h += '<div style="font-size:13px;">Nominal: <b>Rp ' + data.nominal.toLocaleString('id-ID') + '</b></div>';
  h += '<div style="font-size:13px;margin-top:6px;">Status Anda: ' +
    (myPayment.length > 0 ? '<span class="badge badge-success">Lunas</span>' : '<span class="badge badge-warning">Belum bayar</span>') + '</div>';
  openModal('Kas Kelas', h);
};

/* ============================================================
   25. NASKAH
   ============================================================ */
window.openNaskahView = function(){
  const u = window.currentUser;
  const cid = u.classId || window.__viewClassId;
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;
  const naskah = c.naskah || [];
  const canEdit = u.type === 'guru' || u.role === 'sutradara';

  let h = '<div class="alert alert-info"><div>Arsip Naskah (' + naskah.length + ')</div></div>';
  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahNaskah(\'' + cid + '\')">Tambah Naskah</button>';
  }

  if (naskah.length === 0){
    h += '<div class="empty-state"><p>Belum ada naskah.</p></div>';
  } else {
    naskah.slice().reverse().forEach(n => {
      h += '<div class="card" style="margin-bottom:8px;">' +
        '<div style="font-weight:700;">' + esc(n.title) + '</div>' +
        (n.desc ? '<div style="font-size:12px;color:var(--text-muted);margin:4px 0;">' + esc(n.desc) + '</div>' : '') +
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Oleh: ' + esc(n.uploadedBy || '-') + '</div>' +
        (n.url ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="text-decoration:none;">Buka</a> ' : '') +
        (canEdit ? '<button class="btn btn-sm btn-danger" onclick="hapusNaskah(\'' + cid + '\',\'' + n.id + '\')">Hapus</button>' : '') +
      '</div>';
    });
  }
  openModal('Arsip Naskah', h);
};

window.openTambahNaskah = function(cid){
  openModal('Tambah Naskah',
    '<div class="form-group"><label>Judul</label><input id="nk-title" maxlength="120"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="nk-desc" rows="2" maxlength="300"></textarea></div>' +
    '<div class="form-group"><label>Link Google Drive</label><input id="nk-url" placeholder="https://drive.google.com/..."></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanNaskah(\'' + cid + '\')">Simpan</button>');
};

window.simpanNaskah = function(cid){
  const t = ($('nk-title').value || '').trim();
  const d = ($('nk-desc').value || '').trim();
  const url = ($('nk-url').value || '').trim();
  if (!t || !url){ toast('Judul & link wajib', 'warning'); return; }

  const c = window.DB.classes.find(x => x.id === cid);
  const ns = (c.naskah || []).concat([{
    id:uid(), title:t, desc:d, url, uploadedBy: window.currentUser.name, uploadedAt: Date.now()
  }]);
  fbSet('classes', cid, Object.assign({}, c, {naskah:ns})).then(() => {
    c.naskah = ns;
    closeModal();
    toast('Naskah tersimpan', 'success');
    setTimeout(() => openNaskahView(), 200);
  });
};

window.hapusNaskah = function(cid, id){
  if (!confirm('Hapus naskah?')) return;
  const c = window.DB.classes.find(x => x.id === cid);
  const ns = (c.naskah || []).filter(x => x.id !== id);
  fbSet('classes', cid, Object.assign({}, c, {naskah:ns})).then(() => {
    c.naskah = ns;
    closeModal();
    setTimeout(() => openNaskahView(), 200);
  });
};

/* ============================================================
   26. JADWAL LATIHAN
   ============================================================ */
window.openJadwalLatihanView = function(){
  const u = window.currentUser;
  const cid = u.classId || window.__viewClassId;
  const c = window.DB.classes.find(x => x.id === cid);
  if (!c) return;
  const jadwal = c.jadwalLatihan || [];
  const canEdit = u.type === 'guru' || u.role === 'sutradara' || u.role === 'asisten_sutradara';

  let h = '<div class="alert alert-info"><div>Jadwal Latihan (' + jadwal.length + ')</div></div>';
  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="openTambahJadwal(\'' + cid + '\')">Tambah Jadwal</button>';
  }

  if (jadwal.length === 0){
    h += '<div class="empty-state"><p>Belum ada jadwal.</p></div>';
  } else {
    jadwal.slice().reverse().forEach(j => {
      h += '<div class="card" style="margin-bottom:8px;">' +
        '<div style="font-weight:700;">' + esc(j.title) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">' +
          fmtDateShort(j.date) + (j.time ? ' · ' + j.time : '') + '</div>' +
        (j.adegan ? '<div style="font-size:12px;">Adegan: ' + esc(j.adegan) + '</div>' : '') +
        (j.catatan ? '<div style="font-size:12px;margin-top:6px;padding:8px;background:var(--surface);border-radius:6px;">' + esc(j.catatan) + '</div>' : '') +
        (canEdit ? '<button class="btn btn-sm btn-danger" style="margin-top:6px;" onclick="hapusJadwal(\'' + cid + '\',\'' + j.id + '\')">Hapus</button>' : '') +
      '</div>';
    });
  }
  openModal('Jadwal Latihan', h);
};

window.openTambahJadwal = function(cid){
  openModal('Tambah Jadwal Latihan',
    '<div class="form-group"><label>Judul Sesi</label><input id="jl-title" maxlength="120"></div>' +
    '<div class="form-group"><label>Tanggal</label><input type="date" id="jl-date" value="' + todayISO() + '"></div>' +
    '<div class="form-group"><label>Jam</label><input type="time" id="jl-time" value="15:00"></div>' +
    '<div class="form-group"><label>Adegan</label><input id="jl-adegan" maxlength="150"></div>' +
    '<div class="form-group"><label>Catatan Sutradara</label><textarea id="jl-catatan" rows="3" maxlength="500"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanJadwal(\'' + cid + '\')">Simpan</button>');
};

window.simpanJadwal = function(cid){
  const title = ($('jl-title').value || '').trim();
  const date = $('jl-date').value;
  const time = $('jl-time').value;
  const adegan = ($('jl-adegan').value || '').trim();
  const catatan = ($('jl-catatan').value || '').trim();
  if (!title || !date){ toast('Judul & tanggal wajib', 'warning'); return; }

  const c = window.DB.classes.find(x => x.id === cid);
  const jadwal = (c.jadwalLatihan || []).concat([{
    id:uid(), title, date, time, adegan, catatan,
    createdBy: window.currentUser.name, createdAt: Date.now()
  }]);
  fbSet('classes', cid, Object.assign({}, c, {jadwalLatihan:jadwal})).then(() => {
    c.jadwalLatihan = jadwal;
    closeModal();
    toast('Jadwal tersimpan', 'success');
    setTimeout(() => openJadwalLatihanView(), 200);
  });
};

window.hapusJadwal = function(cid, id){
  if (!confirm('Hapus jadwal ini?')) return;
  const c = window.DB.classes.find(x => x.id === cid);
  const jadwal = (c.jadwalLatihan || []).filter(x => x.id !== id);
  fbSet('classes', cid, Object.assign({}, c, {jadwalLatihan:jadwal})).then(() => {
    c.jadwalLatihan = jadwal;
    closeModal();
    setTimeout(() => openJadwalLatihanView(), 200);
  });
};

/* ============================================================
   27. ACTIVITY LOG
   ============================================================ */
window.openActivityLog = function(){
  const u = window.currentUser;
  let logs = (window.DB.activityLogs || []).slice(0, 100);
  if (u.type === 'guru'){
    const myCids = (window.DB.classes || [])
      .filter(c => c.teacherEmail && c.teacherEmail.toLowerCase() === u.email.toLowerCase())
      .map(c => c.id);
    logs = logs.filter(l => !l.classId || myCids.indexOf(l.classId) >= 0);
  }

  let h = '<div class="alert alert-info"><div>Log Aktivitas (' + logs.length + ')</div></div>';
  if (logs.length === 0){
    h += '<div class="empty-state"><p>Belum ada aktivitas.</p></div>';
  } else {
    logs.forEach(l => {
      h += '<div style="padding:10px;border-bottom:1px solid var(--border);">' +
        '<div style="font-size:12.5px;">' + esc(l.message || '') + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:3px;">' +
          esc(l.userName || '-') + ' · ' + fmtDate(l.createdAt) + '</div>' +
      '</div>';
    });
  }
  openModal('Log Aktivitas', h);
};

/* ============================================================
   28. BROADCAST & ADUAN
   ============================================================ */
window.openBroadcast = function(cid){
  openModal('Broadcast Pesan',
    '<div class="form-group"><label>Judul</label><input id="bc-title"></div>' +
    '<div class="form-group"><label>Pesan</label><textarea id="bc-msg" rows="4"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="kirimBroadcast(\'' + cid + '\')">Kirim ke Semua Siswa</button>');
};

window.kirimBroadcast = function(cid){
  const t = ($('bc-title').value || '').trim();
  const m = ($('bc-msg').value || '').trim();
  if (!t || !m){ toast('Lengkapi', 'warning'); return; }
  const nid = uid();
  fbSet('notifications', nid, {
    id:nid, classId:cid,
    fromName: window.currentUser.name, fromType: window.currentUser.type,
    toId:'all', type:'info', title:t, message:m,
    createdAt: Date.now(), readBy: [], doneBy: []
  }).then(() => { closeModal(); toast('Broadcast terkirim', 'success'); });
};

window.openAduanSiswa = function(){
  openModal('Kirim Aduan',
    '<div class="alert alert-warning"><div>Aduan hanya untuk masalah serius.</div></div>' +
    '<div class="form-group"><label>Kategori</label><select id="ad-cat">' +
      '<option>Perundungan</option><option>Kerusakan alat</option><option>Kendala besar</option><option>Lainnya</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Judul</label><input id="ad-title" maxlength="100"></div>' +
    '<div class="form-group"><label>Detail</label><textarea id="ad-detail" rows="5" maxlength="1000"></textarea></div>' +
    '<button class="btn btn-danger btn-block" onclick="kirimAduan()">Kirim Aduan</button>');
};

window.kirimAduan = function(){
  const cat = $('ad-cat').value;
  const title = ($('ad-title').value || '').trim();
  const detail = ($('ad-detail').value || '').trim();
  if (!title || detail.length < 20){ toast('Judul dan detail minimal 20 karakter', 'warning'); return; }

  const u = window.currentUser;
  const nid = uid();
  fbSet('notifications', nid, {
    id:nid, classId: u.classId,
    fromId: u.studentId, fromName: u.name, fromType:'siswa', fromRole: u.role,
    toId: 'guru', type: 'urgent',
    title: '[ADUAN] ' + title,
    message: 'Kategori: ' + cat + '\n\n' + detail,
    createdAt: Date.now(), readBy: [], doneBy: []
  }).then(() => {
    closeModal();
    toast('Aduan terkirim ke guru', 'success');
  });
};

window.openAdminAduan = function(){
  const adus = (window.DB.notifications || [])
    .filter(n => n.type === 'urgent' && (n.title || '').indexOf('[ADUAN]') === 0)
    .sort((a,b) => (b.createdAt||0)-(a.createdAt||0));

  let h = '<div class="alert alert-info"><div>Aduan siswa (' + adus.length + ')</div></div>';
  if (adus.length === 0){
    h += '<div class="empty-state"><p>Belum ada aduan.</p></div>';
  } else {
    adus.forEach(a => {
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--danger);">' +
        '<div style="font-weight:700;">' + esc(a.title) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin:4px 0;">' +
          esc(a.fromName || '-') + ' · ' + fmtDate(a.createdAt) + '</div>' +
        '<div style="font-size:12.5px;white-space:pre-wrap;margin-top:6px;">' + esc(a.message || '') + '</div>' +
      '</div>';
    });
  }
  openModal('Aduan Siswa', h);
};

/* ============================================================
   29. MODAL & NOTIF
   ============================================================ */
window.openModal = function(title, body){
  const mt = $('modal-title');
  const mb = $('modal-body');
  const m = $('modal');
  if (!mt || !mb || !m) return;
  mt.innerHTML = title;
  mb.innerHTML = body;
  m.classList.remove('hidden');
};

window.closeModal = function(){
  const m = $('modal');
  if (m) m.classList.add('hidden');
};

window.openNotif = function(){
  const p = $('notif-panel');
  const b = $('notif-backdrop');
  if (p) p.classList.add('open');
  if (b) b.classList.add('open');
  renderNotifPanel();
};

window.closeNotif = function(){
  const p = $('notif-panel');
  const b = $('notif-backdrop');
  if (p) p.classList.remove('open');
  if (b) b.classList.remove('open');
};

function getNotifKey(){
  const u = window.currentUser;
  if (!u) return null;
  if (u.type === 'siswa') return u.studentId;
  if (u.type === 'guru') return 'guru:' + u.email.toLowerCase();
  return 'admin';
}

function getNotifs(){
  const u = window.currentUser;
  if (!u) return [];
  if (u.type === 'siswa'){
    return (window.DB.notifications || []).filter(n => {
      if (n.classId !== u.classId) return false;
      if (n.toId === 'all') return true;
      if (n.toId === u.studentId) return true;
      if (n.recipientIds && n.recipientIds.indexOf(u.studentId) >= 0) return true;
      return false;
    });
  }
  if (u.type === 'guru'){
    const cids = (window.DB.classes || [])
      .filter(c => c.teacherEmail && c.teacherEmail.toLowerCase() === u.email.toLowerCase())
      .map(c => c.id);
    return (window.DB.notifications || []).filter(n =>
      !n.classId || cids.indexOf(n.classId) >= 0);
  }
  return (window.DB.notifications || []).slice();
}

function updateNotifBadge(){
  const badge = $('notif-badge');
  const btn = $('btn-notif');
  if (!badge || !btn) return;
  const u = window.currentUser;
  if (!u){ btn.classList.add('hidden'); return; }
  btn.classList.remove('hidden');
  const key = getNotifKey();
  const unread = getNotifs().filter(n =>
    !(n.readBy && n.readBy.indexOf(key) >= 0)).length;
  if (unread > 0){
    badge.classList.remove('hidden');
    badge.textContent = unread > 99 ? '99+' : unread;
  } else {
    badge.classList.add('hidden');
  }
}
window.updateNotifBadge = updateNotifBadge;

function renderNotifPanel(){
  const body = $('notif-body');
  if (!body) return;
  const notifs = getNotifs().sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
  if (notifs.length === 0){
    body.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--text-muted);">' +
      '<p>Belum ada notifikasi.</p></div>';
    return;
  }
  const key = getNotifKey();
  let h = '';
  notifs.slice(0, 80).forEach(n => {
    const isRead = n.readBy && n.readBy.indexOf(key) >= 0;
    const tl = {tugas:'Tugas', instruksi:'Instruksi', info:'Info', urgent:'Penting'}[n.type] || 'Info';
    h += '<div class="notif-item ' + (isRead ? '' : 'unread') + '">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;">' +
        '<span class="badge badge-primary">' + tl + '</span>' +
        '<span style="font-size:11px;color:var(--text-muted);">' + fmtDate(n.createdAt) + '</span>' +
      '</div>' +
      '<div style="font-weight:700;font-size:13.5px;margin-bottom:6px;">' + esc(n.title || 'Notifikasi') + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">Dari: <b>' + esc(n.fromName || 'Guru') + '</b></div>' +
      '<div style="font-size:12.5px;line-height:1.6;margin-bottom:10px;white-space:pre-wrap;">' + esc(n.message || '') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
        (isRead ? '<span class="badge badge-success">Sudah dibaca</span>' :
          '<button class="btn btn-sm" onclick="markNotifRead(\'' + n.id + '\')">Tandai Dibaca</button>') +
        (window.currentUser.type === 'siswa' && n.type === 'tugas' ?
          '<button class="btn btn-sm btn-success" onclick="tandaiTugasSelesai(\'' + n.id + '\')">Tandai Tugas Selesai</button>' : '') +
        '<button class="btn btn-sm btn-danger" onclick="delNotif(\'' + n.id + '\')">Hapus</button>' +
      '</div>' +
    '</div>';
  });
  body.innerHTML = h;
}
window.renderNotifPanel = renderNotifPanel;

window.markNotifRead = function(id){
  const n = (window.DB.notifications || []).find(x => x.id === id);
  if (!n) return;
  const key = getNotifKey();
  const rb = (n.readBy || []).slice();
  if (rb.indexOf(key) < 0) rb.push(key);
  fbSet('notifications', id, Object.assign({}, n, {readBy: rb})).then(() => {
    updateNotifBadge(); renderNotifPanel();
  });
};

window.tandaiTugasSelesai = function(id){
  const n = (window.DB.notifications || []).find(x => x.id === id);
  if (!n) return;
  const u = window.currentUser;
  const key = u.studentId;
  const db = (n.doneBy || []).slice();
  if (db.indexOf(key) >= 0){ toast('Sudah ditandai', 'info'); return; }
  db.push(key);
  fbSet('notifications', id, Object.assign({}, n, {doneBy: db})).then(() => {
    toast('Tugas ditandai selesai', 'success');
    renderNotifPanel();
  });
};

window.delNotif = function(id){
  if (!confirm('Hapus notifikasi ini?')) return;
  fbDel('notifications', id).then(() => {
    updateNotifBadge(); renderNotifPanel();
  });
};

document.addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

/* ============================================================
   30. GURU CRUD (Admin)
   ============================================================ */
window.openTambahGuru = function(){
  openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="tg-name"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="tg-email"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="tg-pw" value="#Smpn10smd"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanGuru()">Simpan</button>');
};

window.simpanGuru = function(){
  const n = ($('tg-name').value || '').trim();
  const e = ($('tg-email').value || '').trim().toLowerCase();
  const p = $('tg-pw').value || '#Smpn10smd';
  if (!n || !e){ toast('Lengkapi', 'warning'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ toast('Email tidak valid', 'error'); return; }
  fbSet('teachers', e, {name:n, email:e, password:p}).then(() => {
    closeModal();
    toast('Guru ditambahkan', 'success');
  });
};

window.hapusGuru = function(email){
  if (!confirm('Hapus guru ini?')) return;
  fbDel('teachers', email).then(() => {
    toast('Guru dihapus', 'success');
    renderAdminDash();
  });
};

/* ============================================================
   31. BOOT & SUBSCRIBE
   ============================================================ */
function boot(){
  console.log('[app.js] Boot v21 COMPLETE...');

  const savedTheme = localStorage.getItem('sppt_theme') || 'auto';
  setTheme(savedTheme);

  setTimeout(() => {
    const ld = $('loading');
    if (ld) ld.style.display = 'none';
  }, 400);

  if (fbReady) subscribe();

  const sess = localStorage.getItem('sppt_session');
  if (sess){
    try {
      const u = JSON.parse(sess);
      window.currentUser = u;
      if (u.type === 'siswa' && fbReady){
        fb.collection('classes').doc(u.classId).get().then(snap => {
          if (snap.exists){
            const c = Object.assign({}, snap.data(), {id: u.classId});
            const idx = window.DB.classes.findIndex(x => x.id === u.classId);
            if (idx >= 0) window.DB.classes[idx] = c;
            else window.DB.classes.push(c);
          }
          showApp();
        }).catch(() => showApp());
      } else {
        showApp();
      }
      return;
    } catch(e){}
  }
  showLogin();
}

function subscribe(){
  fb.collection('teachers').onSnapshot(snap => {
    window.DB.teachers = snap.docs.map(d => d.data());
  }, err => console.warn('[teachers]', err.message));

  fb.collection('classes').onSnapshot(snap => {
    window.DB.classes = snap.docs.map(d => Object.assign({}, d.data(), {id: d.id}));

    const sel = $('siswa-kelas');
    if (sel){
      const cur = sel.value;
      sel.innerHTML = '<option value="">-- Pilih Kelas --</option>';
      window.DB.classes.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.name;
        sel.appendChild(o);
      });
      if (cur) sel.value = cur;
    }

    if (window.currentUser){
      const app = $('app');
      if (app && !app.classList.contains('hidden')){
        if (window.currentUser.type === 'guru'){
          if (window.__viewClassId) viewClass(window.__viewClassId);
          else renderGuruDash();
        } else if (window.currentUser.type === 'siswa'){
          const c = window.DB.classes.find(x => x.id === window.currentUser.classId);
          if (c){
            const s = (c.students || []).find(x => x.id === window.currentUser.studentId);
            if (s){
              window.currentUser.name = s.name;
              window.currentUser.role = s.role;
              window.currentUser.phone = s.phone || '';
            }
          }
          renderSiswaDash();
        } else if (window.currentUser.type === 'admin'){
          renderAdminDash();
        }
      }
    }
  }, err => console.warn('[classes]', err.message));

  fb.collection('config').doc('stages').onSnapshot(doc => {
    if (doc.exists && doc.data().stages) window.DB.stages = doc.data().stages;
    else fbSet('config', 'stages', {stages: window.DB.stages});
  }, err => console.warn('[stages]', err.message));

  fb.collection('activeStages').onSnapshot(snap => {
    const a = {};
    snap.docs.forEach(d => {
      const dt = d.data();
      a[d.id] = Array.isArray(dt.activeIds) ? dt.activeIds : [];
    });
    window.DB.activeStages = a;
  }, err => console.warn('[activeStages]', err.message));

  fb.collection('deadlines').onSnapshot(snap => {
    const dl = {};
    snap.docs.forEach(d => {
      const dt = d.data();
      const cid = dt.classId || d.id;
      const obj = {};
      Object.keys(dt).forEach(k => { if (k !== 'classId') obj[k] = dt[k]; });
      dl[cid] = obj;
    });
    window.DB.deadlines = dl;
  }, err => console.warn('[deadlines]', err.message));

  fb.collection('evaluations').onSnapshot(snap => {
    const ev = {};
    snap.docs.forEach(d => {
      const dt = d.data();
      const cid = dt.classId, tid = dt.targetId;
      if (!cid || !tid) return;
      ev[cid] = ev[cid] || {};
      ev[cid][tid] = ev[cid][tid] || {};
      Object.keys(dt).forEach(k => {
        if (k !== 'classId' && k !== 'targetId') ev[cid][tid][k] = dt[k];
      });
    });
    window.DB.evaluations = ev;
  }, err => console.warn('[evaluations]', err.message));

  fb.collection('checklists').onSnapshot(snap => {
    const ch = {};
    snap.docs.forEach(d => {
      const dt = d.data();
      ch[d.id] = {items: dt.items || []};
    });
    window.DB.checklists = ch;
  }, err => console.warn('[checklists]', err.message));

  fb.collection('meetings').onSnapshot(snap => {
    const m = {};
    snap.docs.forEach(d => { m[d.id] = Object.assign({id:d.id}, d.data()); });
    window.DB.meetings = m;
  }, err => console.warn('[meetings]', err.message));

  fb.collection('kas_kelas').onSnapshot(snap => {
    const k = {};
    snap.docs.forEach(d => { k[d.id] = d.data(); });
    window.DB.kas = k;
  }, err => console.warn('[kas]', err.message));

  fb.collection('notifications').orderBy('createdAt', 'desc').limit(200)
    .onSnapshot(snap => {
      window.DB.notifications = snap.docs.map(d => Object.assign({}, d.data(), {id: d.id}));
      updateNotifBadge();
      const p = $('notif-panel');
      if (p && p.classList.contains('open')) renderNotifPanel();
    }, err => console.warn('[notifications]', err.message));

  fb.collection('activity_logs').orderBy('createdAt', 'desc').limit(100)
    .onSnapshot(snap => {
      window.DB.activityLogs = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
    }, err => console.warn('[activity]', err.message));
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

console.log('[app.js] v21 COMPLETE loaded');

})();
