/* ============================================================
   SP-PPT app.js — v20 CLEAN (tanpa icon)
   Login PASTI jalan. Fallback hardcoded.
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
  pimpinan_produksi:    {label:'Pimpinan Produksi', team:'produksi'},
  sutradara:            {label:'Sutradara', team:'artistik'},
  asisten_sutradara:    {label:'Asisten Sutradara', team:'artistik'},
  sekretaris:           {label:'Sekretaris', team:'produksi'},
  bendahara:            {label:'Bendahara', team:'produksi'},
  koor_publikasi:       {label:'Koor. Publikasi', team:'produksi'},
  koor_perlengkapan:    {label:'Koor. Perlengkapan', team:'produksi'},
  koor_akomodasi:       {label:'Koor. Akomodasi', team:'produksi'},
  koor_panggung:        {label:'Koor. Tata Pentas', team:'artistik'},
  koor_musik:           {label:'Koor. Tata Musik', team:'artistik'},
  koor_busana:          {label:'Koor. Tata Busana', team:'artistik'},
  koor_rias:            {label:'Koor. Tata Rias', team:'artistik'},
  koor_cahaya:          {label:'Koor. Tata Cahaya', team:'artistik'},
  anggota_publikasi:    {label:'Anggota Publikasi', team:'produksi'},
  anggota_perlengkapan: {label:'Anggota Perlengkapan', team:'produksi'},
  anggota_akomodasi:    {label:'Anggota Akomodasi', team:'produksi'},
  anggota_panggung:     {label:'Anggota Tata Pentas', team:'artistik'},
  anggota_musik:        {label:'Anggota Tata Musik', team:'artistik'},
  anggota_busana:       {label:'Anggota Tata Busana', team:'artistik'},
  anggota_rias:         {label:'Anggota Tata Rias', team:'artistik'},
  anggota_cahaya:       {label:'Anggota Tata Cahaya', team:'artistik'},
  pemain:               {label:'Pemeran', team:'artistik'}
};

const DEFAULT_STAGES = [
  {id:'s1', name:'Perencanaan', weight:20, desc:'Konsep, jadwal, RAB'},
  {id:'s2', name:'Pelaksanaan', weight:35, desc:'Latihan & produksi'},
  {id:'s3', name:'Pertunjukan', weight:35, desc:'Hari-H'},
  {id:'s4', name:'Evaluasi',    weight:10, desc:'Laporan & refleksi'}
];

/* ============================================================
   2. STATE
   ============================================================ */
window.currentUser = null;
window.DB = {
  teachers: [],
  classes: [],
  evaluations: {},
  notifications: [],
  stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  activeStages: {},
  checklists: {},
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
   5. FIREBASE (opsional)
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
window.fbSet = fbSet;
window.fbDel = fbDel;

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
   7. LOGIN
   ============================================================ */
window.doLoginGuru = function(){
  const email = ($('guru-email').value || '').trim().toLowerCase();
  const pw = ($('guru-password').value || '').trim();

  console.log('[loginGuru] mencoba:', email);

  if (!email || !pw){ toast('Lengkapi email & password', 'warning'); return; }

  // LAPIS 1: hardcoded
  let t = TEACHERS.find(x => x.email.toLowerCase() === email && x.password === pw);

  // LAPIS 2: DB lokal
  if (!t){
    t = (window.DB.teachers || []).find(x =>
      x.email && String(x.email).toLowerCase() === email &&
      String(x.password || '').trim() === pw
    );
  }

  // LAPIS 3: Firestore langsung
  if (!t && fbReady){
    fb.collection('teachers').doc(email).get().then(snap => {
      if (snap.exists){
        const td = snap.data();
        if (String(td.password).trim() === pw){
          finishGuru(td);
        } else {
          toast('Email atau password salah', 'error');
        }
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
  window.currentUser = {
    type: 'guru',
    email: t.email,
    name: t.name || t.email,
    phone: t.phone || ''
  };
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
      type: 'siswa', classId: c.id, studentId: s.id,
      name: s.name, role: s.role, phone: s.phone || '', email: s.email || ''
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
      const fresh = Object.assign({}, snap.data(), {id: cid});
      const idx = window.DB.classes.findIndex(x => x.id === cid);
      if (idx >= 0) window.DB.classes[idx] = fresh;
      else window.DB.classes.push(fresh);
      const s = (fresh.students || []).find(match);
      finish(s || null, fresh);
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

  const dupPhone = (window.DB.classes || []).some(c =>
    (c.students || []).some(s => String(s.phone||'').replace(/\D/g,'') === phone));
  if (dupPhone){ toast('No. WA sudah terdaftar', 'error'); return; }

  const ns = {
    id: uid(), name: name, email: email, phone: phone,
    password: pw, role: 'pemain', registeredAt: Date.now()
  };
  const newStudents = (cls.students || []).concat([ns]);

  fbSet('classes', cls.id, Object.assign({}, cls, {students: newStudents})).then(() => {
    const notifId = uid();
    fbSet('notifications', notifId, {
      id: notifId, classId: cls.id,
      fromId: ns.id, fromName: name, fromType: 'siswa',
      toId: 'guru', type: 'info',
      title: 'Pendaftaran Siswa Baru',
      message: name + ' mendaftar di ' + cls.name,
      createdAt: Date.now(), readBy: [], doneBy: []
    }).catch(()=>{});

    toast('Pendaftaran berhasil! Silakan login.', 'success');
    setTimeout(() => {
      showLogin();
      switchTab('siswa');
      setTimeout(() => {
        const sel = $('siswa-kelas');
        if (sel) sel.value = cls.id;
        const em = $('siswa-login');
        if (em) em.value = email;
      }, 300);
    }, 1500);
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

/* ============================================================
   9. CHANGE PASSWORD
   ============================================================ */
window.changePw = function(){
  const u = window.currentUser;
  if (!u){ return; }
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
    fbSet('teachers', t.email, t).then(() => {
      toast('Password diubah', 'success');
      closeModal();
    });
  } else if (u.type === 'siswa'){
    const c = window.DB.classes.find(x => x.id === u.classId);
    if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }
    const s = (c.students || []).find(x => x.id === u.studentId);
    if (!s || s.password !== oldPw){ toast('Password lama salah', 'error'); return; }
    const ns = (c.students || []).map(x =>
      x.id === s.id ? Object.assign({}, x, {password: newPw}) : x);
    fbSet('classes', c.id, Object.assign({}, c, {students: ns})).then(() => {
      c.students = ns;
      toast('Password diubah', 'success');
      closeModal();
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
  const classes = (window.DB.classes || []).filter(c =>
    c.teacherEmail && c.teacherEmail.toLowerCase() === window.currentUser.email.toLowerCase()
  );

  let h = '';
  h += '<div class="alert alert-info"><div>Selamat datang, <b>' + esc(window.currentUser.name) +
    '</b>. Kelola kelas Anda di bawah ini.</div></div>';

  h += '<div class="action-row" style="margin-bottom:16px;">' +
    '<button class="btn btn-primary" onclick="openTambahKelas()">Tambah Kelas</button>' +
  '</div>';

  h += '<h3 style="margin:16px 0 12px;font-size:14.5px;font-weight:700;">Kelas Saya (' + classes.length + ')</h3>';

  if (classes.length === 0){
    h += '<div class="empty-state"><p>Belum ada kelas. Klik <b>Tambah Kelas</b> untuk memulai.</p></div>';
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

  let h = '<div class="alert alert-info"><div>Anda login sebagai <b>Admin</b>. Berikut ringkasan sistem.</div></div>';

  h += '<div class="grid" style="margin-bottom:18px;">';
  h += '<div class="card"><div style="font-size:11.5px;color:var(--text-muted);">Total Guru</div><div style="font-size:22px;font-weight:800;">' + teachers.length + '</div></div>';
  h += '<div class="card"><div style="font-size:11.5px;color:var(--text-muted);">Total Kelas</div><div style="font-size:22px;font-weight:800;">' + classes.length + '</div></div>';
  h += '</div>';

  h += '<h3 style="margin:16px 0 12px;font-size:14.5px;">Daftar Guru (' + teachers.length + ')</h3>';
  if (teachers.length === 0){
    h += '<div class="empty-state"><p>Belum ada guru di Firestore.</p></div>';
  } else {
    teachers.forEach(t => {
      h += '<div class="card" style="margin-bottom:8px;">' +
        '<b>' + esc(t.name) + '</b><br>' +
        '<small style="color:var(--text-muted);">' + esc(t.email) + '</small>' +
      '</div>';
    });
  }

  h += '<h3 style="margin-top:20px;font-size:14.5px;">Semua Kelas (' + classes.length + ')</h3>';
  if (classes.length === 0){
    h += '<div class="empty-state"><p>Belum ada kelas.</p></div>';
  } else {
    classes.forEach(c => {
      h += '<div class="card" style="margin-bottom:8px;">' +
        '<b>' + esc(c.name) + '</b> · Kode: <code>' + esc(c.code || '-') + '</code> · ' + (c.students || []).length + ' siswa' +
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

  h += '<div class="action-row" style="margin-bottom:16px;">' +
    '<button class="btn btn-primary" onclick="openPenilaianSiswa()">Beri Nilai Rekan</button>' +
    '<button class="btn" onclick="openChecklistSaya()">Checklist Saya</button>' +
    '<button class="btn" onclick="openAbsensi()">Absensi</button>' +
  '</div>';

  const activeStages = (window.DB.stages || []).filter(s =>
    ((window.DB.activeStages[c ? c.id : '']) || []).includes(s.id));

  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;">Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning"><div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="grid">';
    activeStages.forEach(s => {
      h += '<div class="card" style="border-left:4px solid var(--success);">' +
        '<h3>' + esc(s.name) + '</h3>' +
        '<p style="font-size:12px;color:var(--text-muted);">' + esc(s.desc || '') + '</p>' +
        '<p style="font-size:11.5px;">Bobot ' + s.weight + '%</p>' +
      '</div>';
    });
    h += '</div>';
  }

  $('main-content').innerHTML = h;
}
window.renderSiswaDash = renderSiswaDash;

/* ============================================================
   14. TAMBAH KELAS
   ============================================================ */
window.openTambahKelas = function(){
  openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label>' +
    '<input id="new-class" placeholder="Contoh: IX-A" maxlength="30"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKelas()">Simpan</button>');
};

window.simpanKelas = function(){
  const n = ($('new-class').value || '').trim();
  if (!n){ toast('Nama kelas wajib diisi', 'warning'); return; }
  if (n.length < 2){ toast('Nama minimal 2 karakter', 'warning'); return; }

  const code = n.replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,4) + '-' +
               Math.floor(1000 + Math.random() * 9000);
  const id = uid();
  const data = {
    id: id, name: n, code: code, students: [],
    teacherEmail: window.currentUser.email,
    teacherName: window.currentUser.name,
    createdAt: Date.now()
  };

  fbSet('classes', id, data).then(() => {
    closeModal();
    toast('Kelas berhasil dibuat. Kode: ' + code, 'success');
    if (!window.DB.classes.find(x => x.id === id)){
      window.DB.classes.push(data);
    }
    renderGuruDash();
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

window.hapusKelas = function(cid){
  if (!confirm('Hapus kelas ini? Semua data siswa akan hilang.')) return;
  fbDel('classes', cid).then(() => {
    window.DB.classes = window.DB.classes.filter(c => c.id !== cid);
    toast('Kelas dihapus', 'success');
    renderGuruDash();
  });
};

/* ============================================================
   15. VIEW CLASS
   ============================================================ */
window.viewClass = function(cid){
  const c = (window.DB.classes || []).find(x => x.id === cid);
  if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }

  let h = '<div class="action-row" style="margin-bottom:14px;">' +
    '<button class="btn" onclick="renderGuruDash()">Kembali</button>' +
    '<button class="btn btn-primary" onclick="openTambahSiswa(\'' + cid + '\')">Tambah Siswa</button>' +
  '</div>';

  h += '<div class="class-code-box">' +
    '<div class="label">KODE KELAS</div>' +
    '<div class="code">' + esc(c.code || '-') + '</div>' +
    '<div class="hint">Bagikan kode ini ke siswa untuk mendaftar mandiri</div>' +
  '</div>';

  h += '<h3 style="margin:16px 0 12px;font-size:14.5px;">Siswa (' + (c.students || []).length + ')</h3>';

  if ((c.students || []).length === 0){
    h += '<div class="empty-state"><p>Belum ada siswa. Klik <b>Tambah Siswa</b>.</p></div>';
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
window.viewClass = viewClass;

window.openTambahSiswa = function(cid){
  let opts = '';
  Object.keys(ROLES).forEach(k => {
    opts += '<option value="' + k + '">' + ROLES[k].label + '</option>';
  });
  openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama Lengkap</label><input id="ts-name" maxlength="80"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ts-email"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="ts-phone" placeholder="08123456789"></div>' +
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

  if (!n){ toast('Nama wajib diisi', 'warning'); return; }
  if (!e){ toast('Email wajib diisi', 'warning'); return; }

  const dup = (window.DB.classes || []).some(cc =>
    (cc.students || []).some(s => s.email && s.email.toLowerCase() === e && cc.id !== cid));
  if (dup){ toast('Email sudah terdaftar di kelas lain', 'error'); return; }

  const ns = (c.students || []).concat([{
    id: uid(), name: n, email: e, phone: ph,
    password: pw, role: r, registeredAt: Date.now()
  }]);

  fbSet('classes', cid, Object.assign({}, c, {students: ns})).then(() => {
    c.students = ns;
    closeModal();
    toast('Siswa ditambahkan', 'success');
    viewClass(cid);
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

window.openEditSiswa = function(cid, sid){
  const c = window.DB.classes.find(x => x.id === cid);
  const s = (c.students || []).find(x => x.id === sid);
  if (!s){ toast('Siswa tidak ditemukan', 'error'); return; }

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

  if (!n || !e){ toast('Nama dan email wajib diisi', 'warning'); return; }

  const ns = (c.students || []).map(x => {
    if (x.id !== sid) return x;
    const upd = Object.assign({}, x, {name: n, email: e, phone: ph, role: r});
    if (pw) upd.password = pw;
    return upd;
  });

  fbSet('classes', cid, Object.assign({}, c, {students: ns})).then(() => {
    c.students = ns;
    closeModal();
    toast('Data siswa diperbarui', 'success');
    viewClass(cid);
  });
};

window.hapusSiswa = function(cid, sid){
  if (!confirm('Hapus siswa ini?')) return;
  const c = window.DB.classes.find(x => x.id === cid);
  const ns = (c.students || []).filter(x => x.id !== sid);
  fbSet('classes', cid, Object.assign({}, c, {students: ns})).then(() => {
    c.students = ns;
    toast('Siswa dihapus', 'success');
    viewClass(cid);
  });
};

/* ============================================================
   16. PENILAIAN SISWA
   ============================================================ */
window.openPenilaianSiswa = function(){
  const u = window.currentUser;
  const c = window.DB.classes.find(x => x.id === u.classId);
  if (!c){ toast('Kelas tidak ditemukan', 'error'); return; }

  const others = (c.students || []).filter(s => s.id !== u.studentId);

  let h = '<div class="alert alert-info"><div>Pilih rekan untuk dinilai. Nilai berdasarkan bukti nyata.</div></div>';

  if (others.length === 0){
    h += '<div class="empty-state"><p>Tidak ada rekan untuk dinilai.</p></div>';
  } else {
    others.forEach(s => {
      const r = (ROLES[s.role] || {}).label || s.role;
      h += '<div class="card" style="margin-bottom:8px;">' +
        '<b>' + esc(s.name) + '</b><br>' +
        '<small style="color:var(--text-muted);">' + esc(r) + '</small><br>' +
        '<button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="openFormNilai(\'' + s.id + '\')">Beri Nilai</button>' +
      '</div>';
    });
  }
  openModal('Beri Nilai Rekan', h);
};

window.openFormNilai = function(targetId){
  const u = window.currentUser;
  const c = window.DB.classes.find(x => x.id === u.classId);
  const t = c.students.find(s => s.id === targetId);
  if (!t){ toast('Target tidak ditemukan', 'error'); return; }

  let h = '<div class="alert alert-info"><div>Menilai <b>' + esc(t.name) + '</b></div></div>';
  h += '<div class="form-group"><label>Nilai (skala 1-4)</label>' +
    '<select id="nilai-val">' +
      '<option value="4">4 — Sangat Baik</option>' +
      '<option value="3">3 — Baik</option>' +
      '<option value="2">2 — Cukup</option>' +
      '<option value="1">1 — Kurang</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Catatan (opsional)</label>' +
    '<textarea id="nilai-note" rows="3" placeholder="Contoh: Aktif dalam latihan, hafalan lengkap..."></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanNilai(\'' + targetId + '\')">Simpan Nilai</button>';

  openModal('Nilai: ' + t.name, h);
};

window.simpanNilai = function(targetId){
  const u = window.currentUser;
  const val = parseFloat($('nilai-val').value);
  const note = ($('nilai-note').value || '').trim();

  if (!val || val < 1 || val > 4){ toast('Nilai tidak valid', 'error'); return; }

  const docId = u.classId + '__' + targetId;

  if (!fbReady){
    toast('Firebase belum siap, coba lagi nanti', 'warning');
    return;
  }

  fb.collection('evaluations').doc(docId).get().then(snap => {
    const data = snap.exists ? snap.data() : {classId: u.classId, targetId: targetId};
    data[u.studentId] = data[u.studentId] || {};
    data[u.studentId].score = val;
    data[u.studentId].note = note;
    data[u.studentId].at = Date.now();
    return fb.collection('evaluations').doc(docId).set(data, {merge:true});
  }).then(() => {
    toast('Nilai tersimpan', 'success');
    closeModal();
  }).catch(err => toast('Gagal: ' + err.message, 'error'));
};

/* ============================================================
   17. CHECKLIST SISWA
   ============================================================ */
window.openChecklistSaya = function(){
  const u = window.currentUser;
  const ch = (window.DB.checklists[u.classId] || {}).items || [];
  const mine = ch.filter(x => x.ownerId === u.studentId);

  let h = '<div class="alert alert-info"><div>Checklist pribadi Anda. Bisa tambah, centang, hapus.</div></div>';
  h += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="tambahChecklist()">Tambah Item</button>';

  if (mine.length === 0){
    h += '<div class="empty-state"><p>Belum ada checklist. Klik <b>Tambah Item</b>.</p></div>';
  } else {
    const done = mine.filter(x => x.done).length;
    h += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">' +
      done + ' / ' + mine.length + ' selesai</div>';
    mine.forEach(it => {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--surface);border-radius:6px;margin-bottom:5px;">' +
        '<input type="checkbox" ' + (it.done ? 'checked' : '') + ' onchange="toggleChecklist(\'' + it.id + '\', this.checked)" style="width:18px;height:18px;">' +
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
  ch.items.push({id: uid(), name: n.trim(), done: false, ownerId: u.studentId, createdAt: Date.now()});
  fbSet('checklists', u.classId, ch).then(() => {
    window.DB.checklists[u.classId] = ch;
    openChecklistSaya();
  });
};

window.toggleChecklist = function(id, done){
  const u = window.currentUser;
  const ch = window.DB.checklists[u.classId];
  if (!ch){ return; }
  ch.items = ch.items.map(x => x.id === id ? Object.assign({}, x, {done: done}) : x);
  fbSet('checklists', u.classId, ch);
};

window.hapusChecklist = function(id){
  if (!confirm('Hapus item ini?')) return;
  const u = window.currentUser;
  const ch = window.DB.checklists[u.classId];
  if (!ch){ return; }
  ch.items = ch.items.filter(x => x.id !== id);
  fbSet('checklists', u.classId, ch).then(() => openChecklistSaya());
};

/* ============================================================
   18. ABSENSI (sederhana)
   ============================================================ */
window.openAbsensi = function(){
  openModal('Absensi',
    '<div class="alert alert-info"><div>Fitur absensi akan segera hadir. Sementara ini hubungi guru/sekretaris untuk pencatatan kehadiran.</div></div>');
};

/* ============================================================
   19. MODAL & NOTIF
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
    const myCids = (window.DB.classes || [])
      .filter(c => c.teacherEmail && c.teacherEmail.toLowerCase() === u.email.toLowerCase())
      .map(c => c.id);
    return (window.DB.notifications || []).filter(n =>
      !n.classId || myCids.indexOf(n.classId) >= 0);
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
    updateNotifBadge();
    renderNotifPanel();
  });
};

window.delNotif = function(id){
  if (!confirm('Hapus notifikasi ini?')) return;
  fbDel('notifications', id).then(() => {
    updateNotifBadge();
    renderNotifPanel();
  });
};

document.addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

/* ============================================================
   20. BOOT
   ============================================================ */
function boot(){
  console.log('[app.js] Boot v20 CLEAN...');

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
    console.log('[firestore] teachers:', window.DB.teachers.length);
  }, err => console.warn('[teachers]', err.message));

  fb.collection('classes').onSnapshot(snap => {
    window.DB.classes = snap.docs.map(d => Object.assign({}, d.data(), {id: d.id}));
    console.log('[firestore] classes:', window.DB.classes.length);

    const sel = $('siswa-kelas');
    if (sel){
      const cur = sel.value;
      sel.innerHTML = '<option value="">-- Pilih Kelas --</option>';
      window.DB.classes.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = c.name;
        sel.appendChild(o);
      });
      if (cur) sel.value = cur;
    }

    if (window.currentUser && window.currentUser.type === 'guru'){
      const app = $('app');
      if (app && !app.classList.contains('hidden')){
        const cid = window.__viewClassId;
        if (cid) viewClass(cid);
        else renderGuruDash();
      }
    } else if (window.currentUser && window.currentUser.type === 'siswa'){
      const app = $('app');
      if (app && !app.classList.contains('hidden')){
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
      }
    }
  }, err => console.warn('[classes]', err.message));

  fb.collection('checklists').onSnapshot(snap => {
    window.DB.checklists = {};
    snap.docs.forEach(d => { window.DB.checklists[d.id] = d.data(); });
  }, err => console.warn('[checklists]', err.message));

  fb.collection('notifications').orderBy('createdAt', 'desc').limit(100)
    .onSnapshot(snap => {
      window.DB.notifications = snap.docs.map(d => Object.assign({}, d.data(), {id: d.id}));
      updateNotifBadge();
      const p = $('notif-panel');
      if (p && p.classList.contains('open')) renderNotifPanel();
    }, err => console.warn('[notifications]', err.message));
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

console.log('[app.js] v20 CLEAN loaded');

})();
