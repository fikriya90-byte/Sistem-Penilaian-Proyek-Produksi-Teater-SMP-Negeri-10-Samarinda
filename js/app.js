/* ============================================================
   SP-PPT app.js — v22 FINAL CONSOLIDATED
   Semua fitur dalam 1 file. Tampilan pakai styles.css asli.
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   1. KONSTANTA
   ============================================================ */
var ADMIN = {
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar (Admin)'
};

var TEACHERS = [{
  email: 'fikri.yassaar15@guru.smp.belajar.id',
  password: '#Smpn10smd',
  name: 'Fikri Yassaar Arrazaq, S.Sn.',
  phone: ''
}];

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
  pemain:{label:'Pemeran',team:'artistik',level:3}
};

var DEFAULT_STAGES = [
  {id:'s1',name:'Perencanaan',subtitle:'Pra-Produksi',weight:20,desc:'Konsep, jadwal, RAB',longDesc:'Tahap perencanaan sebelum latihan dimulai.'},
  {id:'s2',name:'Pelaksanaan',subtitle:'Produksi & Latihan',weight:35,desc:'Latihan & eksekusi tugas.',longDesc:'Tahap terlama. Termasuk absensi 15%.'},
  {id:'s3',name:'Pertunjukan',subtitle:'Show Time',weight:35,desc:'Hari H pertunjukan.',longDesc:'Hari puncak pertunjukan.'},
  {id:'s4',name:'Evaluasi',subtitle:'Pasca-Produksi',weight:10,desc:'Laporan & refleksi.',longDesc:'Tahap akhir.'}
];

var RUBRICS = {
  pimpinan_produksi:[
    {id:'pp1',name:'Perencanaan & Pengelolaan',weight:25,desc:'Rencana detail'},
    {id:'pp2',name:'Seleksi & Pengaturan Tim',weight:20,desc:'Penempatan tepat'},
    {id:'pp3',name:'Manajemen Anggaran',weight:20,desc:'Efisien'},
    {id:'pp4',name:'Koordinasi Lintas Divisi',weight:20,desc:'Harmonis'},
    {id:'pp5',name:'Evaluasi & Pelaporan',weight:15,desc:'Lengkap'}
  ],
  sutradara:[
    {id:'sr1',name:'Pengembangan Konsep',weight:25,desc:'Unik'},
    {id:'sr2',name:'Casting',weight:20,desc:'Cocok'},
    {id:'sr3',name:'Pengarahan Pemain',weight:25,desc:'Blocking sempurna'},
    {id:'sr4',name:'Koordinasi Artistik',weight:15,desc:'Menyatu'},
    {id:'sr5',name:'Rekayasa Emosi',weight:15,desc:'Dramatis'}
  ],
  sekretaris:[
    {id:'sk1',name:'Dokumentasi & Arsip',weight:30,desc:'Rapi'},
    {id:'sk2',name:'Penjadwalan',weight:25,desc:'Jauh hari'},
    {id:'sk3',name:'Korespondensi',weight:25,desc:'Jelas'},
    {id:'sk4',name:'Penyusunan Laporan',weight:20,desc:'Lengkap'}
  ],
  bendahara:[
    {id:'bd1',name:'Pencatatan Transaksi',weight:30,desc:'Detail'},
    {id:'bd2',name:'Pengelolaan Keuangan',weight:30,desc:'Transparan'},
    {id:'bd3',name:'Perencanaan RAB',weight:20,desc:'Realistis'},
    {id:'bd4',name:'Pelaporan',weight:20,desc:'Tepat waktu'}
  ],
  asisten_sutradara:[
    {id:'as1',name:'Koordinasi & Logistik',weight:30,desc:'Siap'},
    {id:'as2',name:'Pencatatan',weight:25,desc:'Lengkap'},
    {id:'as3',name:'Bantu Koordinasi Teknis',weight:25,desc:'Proaktif'},
    {id:'as4',name:'Backup Sutradara',weight:20,desc:'Siap'}
  ],
  pemain:[
    {id:'pm1',name:'Penguasaan Naskah',weight:30,desc:'Hafal'},
    {id:'pm2',name:'Ekspresi & Emosi',weight:25,desc:'Mendalam'},
    {id:'pm3',name:'Blocking & Posisi',weight:20,desc:'Presisi'},
    {id:'pm4',name:'Kerja Sama',weight:15,desc:'Natural'},
    {id:'pm5',name:'Konsistensi Latihan',weight:10,desc:'Disiplin'}
  ],
  koor_produksi:[
    {id:'kp1',name:'Penyediaan Kebutuhan',weight:30,desc:'Lengkap'},
    {id:'kp2',name:'Pengelolaan Anggota',weight:25,desc:'Optimal'},
    {id:'kp3',name:'Koordinasi Teknis',weight:25,desc:'Lancar'},
    {id:'kp4',name:'Pelaporan',weight:20,desc:'Detail'}
  ],
  koor_artistik:[
    {id:'ka1',name:'Desain & Konsep',weight:25,desc:'Kreatif'},
    {id:'ka2',name:'Eksekusi Teknis',weight:35,desc:'Rapi'},
    {id:'ka3',name:'Koordinasi Tim',weight:25,desc:'Komunikatif'},
    {id:'ka4',name:'Pengelolaan Anggota',weight:15,desc:'Optimal'}
  ],
  anggota:[
    {id:'ag1',name:'Penyelesaian Tugas',weight:30,desc:'Tepat waktu'},
    {id:'ag2',name:'Kualitas Kerja',weight:25,desc:'Teliti'},
    {id:'ag3',name:'Kerja Sama Tim',weight:25,desc:'Proaktif'},
    {id:'ag4',name:'Kedisiplinan',weight:20,desc:'Hadir'}
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

function canEvaluate(evalRole, targetRole){
  if (evalRole === 'guru' || evalRole === 'admin') return true;
  if (targetRole === 'pimpinan_produksi') return true;
  if (targetRole === 'sutradara') return ['pimpinan_produksi','asisten_sutradara','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','pemain'].indexOf(evalRole) >= 0;
  if (targetRole.indexOf('koor_') === 0){
    var base = targetRole.substring(5);
    return evalRole === 'sutradara' || evalRole === 'pimpinan_produksi' ||
           evalRole === 'asisten_sutradara' || evalRole === 'anggota_' + base;
  }
  if (targetRole.indexOf('anggota_') === 0){
    var base2 = targetRole.substring(8);
    return evalRole === 'koor_' + base2 || evalRole === 'anggota_' + base2;
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
  evaluations: {},
  notifications: [],
  stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  activeStages: {},
  deadlines: {},
  checklists: {},
  meetings: {},
  kas: {},
  bookings: {},
  peminjaman: {},
  activityLogs: []
};
window.__viewClassId = null;

/* ============================================================
   3. UTILS
   ============================================================ */
window.$ = function(id){ return document.getElementById(id); };
var $ = window.$;

window.esc = function(s){
  return String(s == null ? '' : s).replace(/[<>&"']/g, function(c){
    return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c];
  });
};
var esc = window.esc;

window.uid = function(){
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6);
};
var uid = window.uid;

window.fmtDate = function(ts){
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
};
var fmtDate = window.fmtDate;

window.fmtDateShort = function(s){
  if (!s) return '-';
  return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
};
var fmtDateShort = window.fmtDateShort;

window.todayISO = function(){ return new Date().toISOString().split('T')[0]; };
var todayISO = window.todayISO;

window.toast = function(msg, type){
  type = type || 'info';
  var colors = {success:'#10b981', error:'#dc2626', warning:'#f59e0b', info:'#2563eb'};
  var el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);'+
    'background:'+(colors[type]||colors.info)+';color:#fff;padding:12px 22px;'+
    'border-radius:10px;font-size:13px;font-weight:600;z-index:99999;'+
    'box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center;';
  document.body.appendChild(el);
  setTimeout(function(){
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(function(){ el.remove(); }, 300);
  }, 2400);
};

/* ============================================================
   4. ICONS
   ============================================================ */
var ICONS = {
  sun:'<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  key:'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  personPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  clipboard:'<path d="M9 4h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  messageCircle:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  megaphone:'<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
  send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  checkSquare:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  refresh:'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  warning:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  chart:'<path d="M18 20V10M12 20V4M6 20v-6"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  layers:'<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  award:'<circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>',
  star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
  school:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  hash:'<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  fileText:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  chevronRight:'<polyline points="9 18 15 12 9 6"/>',
  folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
};

window.ico = function(name, size){
  var p = ICONS[name] || ICONS.info;
  var s = size === 'sm' ? 13 : size === 'lg' ? 20 : size === 'md' ? 16 : (typeof size === 'number' ? size : 16);
  return '<svg class="ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round">' + p + '</svg>';
};

window.hydrateIcons = function(root){
  var el = (root || document).querySelectorAll('[data-ico]');
  for (var i = 0; i < el.length; i++){
    if (el[i].dataset.icoDone) continue;
    el[i].dataset.icoDone = '1';
    el[i].innerHTML = window.ico(el[i].dataset.ico, el[i].dataset.size || 16);
  }
};

/* ============================================================
   5. THEME
   ============================================================ */
window.setTheme = function(mode){
  try { localStorage.setItem('sppt_theme', mode); } catch(e){}
  var t = mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.setAttribute('data-theme', t);
  var buttons = document.querySelectorAll('.theme-toggle button');
  for (var i = 0; i < buttons.length; i++){
    buttons[i].classList.toggle('active', buttons[i].dataset.theme === mode);
  }
};

/* ============================================================
   6. FIREBASE
   ============================================================ */
var fb = null, fbReady = false;
try {
  if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey){
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    fb = firebase.firestore();
    try { fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); } catch(e){}
    fbReady = true;
    console.log('[firebase] ready');
  }
} catch(e){ console.warn('[firebase]', e.message); }

window.fb = fb;
window.firebaseReady = fbReady;

window.fbSet = function(col, id, data){
  if (!fbReady) return Promise.resolve();
  return fb.collection(col).doc(id).set(data, {merge:true});
};
window.fbDel = function(col, id){
  if (!fbReady) return Promise.resolve();
  return fb.collection(col).doc(id).delete();
};

/* ============================================================
   7. SCREEN CONTROL
   ============================================================ */
function hideAll(){
  ['loading-screen','login-screen','register-screen','app-container'].forEach(function(id){
    var el = $(id);
    if (el) el.classList.add('hidden');
  });
}
window.showLoginPage = function(){
  hideAll();
  $('login-screen').classList.remove('hidden');
  $('btn-floating-panduan').classList.add('hidden');
  window.__viewClassId = null;
};
window.showRegisterPage = function(){
  hideAll();
  $('register-screen').classList.remove('hidden');
};
window.switchLoginTab = function(t){
  ['guru','siswa','admin'].forEach(function(x){
    var tb = $('tab-login-' + x);
    var fm = $('form-login-' + x);
    if (tb) tb.classList.toggle('active', x === t);
    if (fm) fm.classList.toggle('hidden', x !== t);
  });
};
window.togglePw = function(id, btn){
  var inp = $(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerHTML = window.ico(inp.type === 'password' ? 'eye' : 'eyeOff', 16);
};

/* ============================================================
   8. LOGIN
   ============================================================ */
window.doLoginGuru = function(){
  var e = ($('guru-email').value || '').trim().toLowerCase();
  var p = ($('guru-password').value || '').trim();

  console.log('[loginGuru] mencoba:', e);
  if (!e || !p){ alert('Lengkapi email dan password!'); return; }

  // 3 lapis
  var t = TEACHERS.find(function(x){
    return x.email.toLowerCase() === e && x.password === p;
  });
  if (!t){
    t = (window.DB.teachers || []).find(function(x){
      return x.email && String(x.email).toLowerCase() === e &&
             String(x.password || '').trim() === p;
    });
  }
  if (!t && fbReady){
    fb.collection('teachers').doc(e).get().then(function(snap){
      if (snap.exists && String(snap.data().password).trim() === p){
        finishGuru(snap.data());
      } else {
        alert('Email atau password salah!');
      }
    }).catch(function(){ alert('Email atau password salah!'); });
    return;
  }
  if (!t){ alert('Email atau password salah!'); return; }
  finishGuru(t);
};

function finishGuru(t){
  window.currentUser = {
    type:'guru', email:t.email, name:t.name || t.email, phone:t.phone || ''
  };
  saveSession();
  logActivity('login', (t.name || t.email) + ' login', {});
  console.log('[loginGuru] sukses:', t.name);
  fbSet('teachers', t.email, t).catch(function(){});
  showApp();
}

window.doLoginSiswa = function(){
  var cid = $('siswa-kelas').value;
  var inp = ($('siswa-email').value || '').trim();
  var p = ($('siswa-password').value || '').trim();

  if (!cid){ alert('Pilih kelas dulu!'); return; }
  if (!inp){ alert('Email/WA wajib diisi!'); return; }
  if (!p){ alert('Password wajib diisi!'); return; }

  var isEmail = inp.indexOf('@') >= 0;
  var emL = inp.toLowerCase();
  var phC = inp.replace(/\D/g,'');

  function match(s){
    if (!s || !s.password) return false;
    if (String(s.password).trim() !== p) return false;
    if (isEmail) return s.email && String(s.email).toLowerCase() === emL;
    return s.phone && String(s.phone).replace(/\D/g,'') === phC;
  }

  function finish(s, c){
    if (!s || !c){ alert('Email/WA atau password salah!'); return; }
    window.currentUser = {
      type:'siswa', classId:c.id, studentId:s.id,
      name:s.name, role:s.role, phone:s.phone || '', email:s.email || ''
    };
    saveSession();
    logActivity('login', s.name + ' login', {classId:c.id});
    console.log('[loginSiswa] sukses:', s.name);
    showApp();
  }

  var c = (window.DB.classes || []).find(function(x){ return x.id === cid; });
  if (c){
    var s = (c.students || []).find(match);
    if (s){ finish(s, c); return; }
  }
  if (fbReady){
    fb.collection('classes').doc(cid).get().then(function(snap){
      if (!snap.exists){ finish(null, null); return; }
      var fresh = snap.data(); fresh.id = cid;
      var idx = (window.DB.classes || []).findIndex(function(x){ return x.id === cid; });
      if (idx >= 0) window.DB.classes[idx] = fresh;
      else window.DB.classes.push(fresh);
      var s2 = (fresh.students || []).find(match);
      finish(s2 || null, fresh);
    }).catch(function(){ finish(null, null); });
    return;
  }
  finish(null, null);
};

window.doLoginAdmin = function(){
  var e = ($('admin-email').value || '').trim().toLowerCase();
  var p = ($('admin-password').value || '').trim();
  if (e === ADMIN.email.toLowerCase() && p === ADMIN.password){
    window.currentUser = {type:'admin', email:ADMIN.email, name:ADMIN.name};
    saveSession();
    showApp();
  } else {
    alert('Email atau password admin salah!');
  }
};

window.doLogout = function(){
  if (!confirm('Keluar dari aplikasi?')) return;
  try { localStorage.removeItem('sppt_session'); } catch(e){}
  window.currentUser = null;
  window.DB.classes = [];
  hideAll();
  window.showLoginPage();
};

/* ============================================================
   9. REGISTER
   ============================================================ */
window.doRegister = function(){
  var code = ($('daftar-code').value || '').trim().toUpperCase();
  var name = ($('daftar-name').value || '').trim();
  var email = ($('daftar-email').value || '').trim().toLowerCase();
  var phone = ($('daftar-phone').value || '').replace(/\D/g,'');
  var pw = $('daftar-password').value;
  var cf = $('daftar-confirm').value;

  if (!code || !name || !email || !phone || !pw || !cf){ alert('Lengkapi semua field!'); return; }
  if (phone.length < 10 || phone.length > 15){ alert('No. WA tidak valid (10-15 digit)!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ alert('Email tidak valid!'); return; }
  if (pw.length < 6){ alert('Password minimal 6 karakter!'); return; }
  if (pw !== cf){ alert('Konfirmasi password tidak cocok!'); return; }

  var cls = (window.DB.classes || []).find(function(c){ return c.code === code; });
  if (!cls){ alert('Kode Kelas tidak valid!'); return; }

  var dup = (window.DB.classes || []).some(function(c){
    return (c.students || []).some(function(s){
      return s.email && s.email.toLowerCase() === email;
    });
  });
  if (dup){ alert('Email sudah terdaftar!'); return; }

  var dupPhone = (window.DB.classes || []).some(function(c){
    return (c.students || []).some(function(s){
      return String(s.phone||'').replace(/\D/g,'') === phone;
    });
  });
  if (dupPhone){ alert('No. WA sudah terdaftar!'); return; }

  var ns = {
    id: uid(), name: name, email: email, phone: phone,
    password: pw, role: 'pemain', registeredAt: Date.now()
  };
  var newStudents = (cls.students || []).concat([ns]);

  fbSet('classes', cls.id, Object.assign({}, cls, {students:newStudents})).then(function(){
    var nid = uid();
    fbSet('notifications', nid, {
      id:nid, classId:cls.id,
      fromId:ns.id, fromName:name, fromType:'siswa',
      toId:'guru', type:'info',
      title:'Pendaftaran Siswa Baru',
      message: name + ' mendaftar di ' + cls.name,
      createdAt: Date.now(), readBy: [], doneBy: []
    }).catch(function(){});
    logActivity('student_register', name + ' mendaftar di ' + cls.name, {classId: cls.id});
    alert('Pendaftaran berhasil!\n\nSilakan login.');
    window.showLoginPage();
    window.switchLoginTab('siswa');
    setTimeout(function(){
      if ($('siswa-kelas')) $('siswa-kelas').value = cls.id;
      if ($('siswa-email')) $('siswa-email').value = email;
    }, 300);
  }).catch(function(err){ alert('Gagal: ' + err.message); });
};

/* ============================================================
   10. SESSION
   ============================================================ */
var SESSION_KEY = 'sppt_session';
function saveSession(){
  try {
    if (window.currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(window.currentUser));
  } catch(e){}
}
window.saveSession = saveSession;

function getSession(){
  try {
    var s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e){ return null; }
}

/* ============================================================
   11. HELPERS - Class
   ============================================================ */
window.isGuru = function(){ return window.currentUser && (window.currentUser.type === 'guru' || window.currentUser.type === 'admin'); };
window.isSiswa = function(){ return window.currentUser && window.currentUser.type === 'siswa'; };
window.isAdmin = function(){ return window.currentUser && window.currentUser.type === 'admin'; };

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

window.getActiveStages = function(cid){
  var activeIds = window.DB.activeStages[cid] || [];
  return (window.DB.stages || []).filter(function(s){
    return activeIds.indexOf(s.id) >= 0;
  });
};

window.isStageActive = function(cid, sid){
  var activeIds = window.DB.activeStages[cid] || [];
  return activeIds.indexOf(sid) >= 0;
};

window.logActivity = function(type, msg, meta){
  var a = {
    id: uid(), type: type || 'info', message: msg || '', meta: meta || {},
    classId: (meta && meta.classId) || (window.currentUser && window.currentUser.classId) || '',
    userId: (window.currentUser && (window.currentUser.studentId || window.currentUser.email)) || 'system',
    userName: window.currentUser ? window.currentUser.name : 'System',
    createdAt: Date.now()
  };
  return fbSet('activity_logs', a.id, a);
};

/* ============================================================
   12. MODAL
   ============================================================ */
window.openModal = function(title, body){
  var mt = $('modal-title');
  var mb = $('modal-body');
  var m = $('modal');
  if (!mt || !mb || !m) return;
  mt.innerHTML = title;
  mb.innerHTML = body;
  m.classList.remove('hidden');
  setTimeout(function(){ window.hydrateIcons(mb); }, 20);
};
window.closeModal = function(){
  var m = $('modal');
  if (m) m.classList.add('hidden');
};
document.addEventListener('click', function(e){
  if (e.target && e.target.id === 'modal') window.closeModal();
});

/* ============================================================
   13. NOTIF
   ============================================================ */
function getNotifKey(){
  var u = window.currentUser;
  if (!u) return null;
  if (u.type === 'siswa') return u.studentId;
  if (u.type === 'guru') return 'guru:' + String(u.email || '').toLowerCase();
  return 'admin';
}

window.getNotifs = function(){
  var u = window.currentUser;
  if (!u) return [];
  if (u.type === 'siswa'){
    return (window.DB.notifications || []).filter(function(n){
      if (n.classId !== u.classId) return false;
      if (n.toId === 'all') return true;
      if (n.toId === u.studentId) return true;
      if (n.recipientIds && n.recipientIds.indexOf(u.studentId) >= 0) return true;
      return false;
    });
  }
  if (u.type === 'guru'){
    var cids = window.myClasses().map(function(c){ return c.id; });
    return (window.DB.notifications || []).filter(function(n){
      return !n.classId || cids.indexOf(n.classId) >= 0;
    });
  }
  return (window.DB.notifications || []).slice();
};

window.updateBadge = function(){
  var b = $('notif-badge');
  var btn = $('notif-btn');
  if (!b || !btn) return;
  if (!window.currentUser){ btn.classList.add('hidden'); return; }
  btn.classList.remove('hidden');
  var key = getNotifKey();
  var unread = window.getNotifs().filter(function(n){
    return !(n.readBy && n.readBy.indexOf(key) >= 0);
  }).length;
  if (unread > 0){
    b.classList.remove('hidden');
    b.textContent = unread > 99 ? '99+' : unread;
  } else {
    b.classList.add('hidden');
  }
};

window.openNotifPanel = function(){
  var p = $('notif-panel');
  var b = $('notif-backdrop');
  if (p) p.classList.add('open');
  if (b) b.classList.add('open');
  renderNotifPanel();
};
window.closeNotifPanel = function(){
  var p = $('notif-panel');
  var b = $('notif-backdrop');
  if (p) p.classList.remove('open');
  if (b) b.classList.remove('open');
};

function renderNotifPanel(){
  var body = $('notif-panel-body');
  if (!body) return;
  var notifs = window.getNotifs().sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
  if (notifs.length === 0){
    body.innerHTML = '<div class="notif-empty">' + window.ico('bell', 40) + '<p>Belum ada notifikasi</p></div>';
    return;
  }
  var key = getNotifKey();
  var h = '';
  notifs.slice(0, 80).forEach(function(n){
    var isRead = n.readBy && n.readBy.indexOf(key) >= 0;
    var tl = {tugas:'Tugas', instruksi:'Instruksi', info:'Info', urgent:'Penting'}[n.type] || 'Info';
    var tc = {tugas:'badge-info', instruksi:'badge-primary', info:'badge-success', urgent:'badge-danger'}[n.type] || 'badge-gray';
    h += '<div class="notif-item ' + (isRead ? '' : 'unread') + '">' +
      '<div class="notif-header">' +
        '<span class="badge ' + tc + '">' + tl + '</span>' +
        '<span class="notif-time">' + fmtDate(n.createdAt) + '</span>' +
      '</div>' +
      '<div class="notif-title">' + esc(n.title || 'Notifikasi') + '</div>' +
      '<div class="notif-from">Dari: <b>' + esc(n.fromName || 'Guru') + '</b></div>' +
      '<div class="notif-msg">' + esc(n.message || '') + '</div>' +
      '<div class="notif-actions">' +
        (isRead ? '<span class="badge badge-success">' + window.ico('check','sm') + ' Dibaca</span>' :
          '<button class="btn btn-sm btn-primary" onclick="markRead(\'' + n.id + '\')">' + window.ico('check','sm') + ' Dibaca</button>') +
        (window.currentUser.type === 'siswa' && n.type === 'tugas' ?
          '<button class="btn btn-sm btn-success" onclick="tandaiTugasSelesai(\'' + n.id + '\')">' + window.ico('checkSquare','sm') + ' Tugas Selesai</button>' : '') +
        '<button class="btn btn-sm btn-danger" onclick="delNotif(\'' + n.id + '\')">' + window.ico('trash','sm') + '</button>' +
      '</div>' +
    '</div>';
  });
  body.innerHTML = h;
}

window.markRead = function(id){
  var n = (window.DB.notifications || []).find(function(x){ return x.id === id; });
  if (!n) return;
  var key = getNotifKey();
  var rb = (n.readBy || []).slice();
  if (rb.indexOf(key) < 0) rb.push(key);
  fbSet('notifications', id, Object.assign({}, n, {readBy: rb})).then(function(){
    window.updateBadge(); renderNotifPanel();
  });
};

window.tandaiTugasSelesai = function(id){
  var n = (window.DB.notifications || []).find(function(x){ return x.id === id; });
  if (!n) return;
  var key = getNotifKey();
  var db = (n.doneBy || []).slice();
  if (db.indexOf(key) >= 0){ alert('Sudah ditandai'); return; }
  db.push(key);
  fbSet('notifications', id, Object.assign({}, n, {doneBy: db})).then(function(){
    if (window.logActivity) window.logActivity('task_done', (window.currentUser.name || 'User') + ' tandai selesai: ' + (n.title || ''), {classId: n.classId});
    alert('Tugas ditandai selesai!');
    renderNotifPanel();
  });
};

window.delNotif = function(id){
  if (!confirm('Hapus notifikasi ini?')) return;
  fbDel('notifications', id).then(function(){
    window.updateBadge(); renderNotifPanel();
  });
};

/* ============================================================
   14. SHOW APP
   ============================================================ */
function showApp(){
  hideAll();
  $('app-container').classList.remove('hidden');
  $('btn-floating-panduan').classList.remove('hidden');

  var btnPw = $('btn-change-pw');
  if (btnPw) btnPw.style.display = window.currentUser.type === 'admin' ? 'none' : 'inline-flex';

  var l = '';
  var u = window.currentUser;
  if (u.type === 'guru'){
    l = window.ico('user','sm') + ' <span>' + esc(u.name) + ' — <b>Guru Pengampu</b></span>';
  } else if (u.type === 'admin'){
    l = window.ico('shield','sm') + ' <span>' + esc(u.name) + ' — <b>Administrator</b></span>';
  } else {
    var c = window.DB.classes.find(function(x){ return x.id === u.classId; });
    var rl = (ROLES[u.role] || {}).label || u.role;
    l = window.ico('user','sm') + ' <span>' + esc(u.name) + ' — <b>' + rl + '</b> — <b>Kelas ' + (c ? esc(c.name) : '-') + '</b></span>';
  }
  $('user-info').innerHTML = l;

  if (u.type === 'guru') renderGuruDash();
  else if (u.type === 'admin') renderAdminDash();
  else renderSiswaDash();

  window.updateBadge();
}
window.showApp = showApp;

/* ============================================================
   15. DASHBOARD GURU
   ============================================================ */
function renderGuruDash(){
  window.__viewClassId = null;
  $('header-title-text').innerHTML = window.ico('gear') + ' Dashboard Guru Pengampu';
  var mine = window.myClasses();
  var h = '';
  h += '<div class="extras-toolbar-top" style="border:1px solid var(--primary-soft);background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));padding:14px;display:flex;flex-wrap:wrap;gap:8px;border-radius:10px;margin-bottom:14px;">' +
    '<button class="btn btn-primary" onclick="openMainMenu()">' + window.ico('gear','sm') + ' Menu</button>' +
    '<button class="btn" onclick="openTambahKelas()">' + window.ico('plus','sm') + ' Tambah Kelas</button>' +
    '<button class="btn" onclick="openActivityLog()">' + window.ico('activity','sm') + ' Aktivitas</button>' +
    '<button class="btn" onclick="openAduanGuru()">' + window.ico('warning','sm') + ' Aduan</button>' +
    '</div>';
  h += '<div class="alert alert-info">' + window.ico('info') + '<div>Selamat datang, <b>' + esc(window.currentUser.name) + '</b>!</div></div>';
  h += '<h3 style="margin-bottom:12px;font-size:14.5px;font-weight:700;">' + window.ico('school') + ' Kelas Saya (' + mine.length + ')</h3>';

  if (mine.length === 0){
    h += '<div class="empty-state">' + window.ico('school',40) + '<p>Belum ada kelas. Klik <b>Tambah Kelas</b>.</p></div>';
  } else {
    h += '<div class="grid">';
    mine.forEach(function(c){
      var ac = window.getActiveStages(c.id).length;
      h += '<div class="card" style="cursor:pointer;border-left:4px solid var(--primary);" onclick="viewClass(\'' + c.id + '\')">' +
        '<h3>' + window.ico('school','sm') + ' ' + esc(c.name) + '</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;margin-bottom:6px;">' + ((c.students||[]).length) + ' siswa</p>' +
        '<div style="font-size:11.5px;margin-bottom:4px;">Kode: <b style="color:var(--primary);letter-spacing:.15em;font-family:monospace;">' + esc(c.code) + '</b></div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);">Aktivasi: <b style="color:var(--primary);">' + ac + '/' + window.DB.stages.length + ' tahap</b></div>' +
        '<div class="action-row" style="margin-top:10px;">' +
        '<button class="btn btn-sm" onclick="event.stopPropagation();viewClass(\'' + c.id + '\')">' + window.ico('edit','sm') + ' Kelola</button>' +
        '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();hapusKelas(\'' + c.id + '\')">' + window.ico('trash','sm') + '</button>' +
        '</div></div>';
    });
    h += '</div>';
  }
  $('main-content').innerHTML = h;
  window.hydrateIcons();
  window.updateBadge();
}
window.renderGuruDash = renderGuruDash;

/* ============================================================
   16. DASHBOARD ADMIN
   ============================================================ */
function renderAdminDash(){
  $('header-title-text').innerHTML = window.ico('shield') + ' Dashboard Admin';
  var h = '<div class="alert alert-info">' + window.ico('shield') + '<div><b>Area Administrator</b></div></div>';
  h += '<div class="extras-toolbar-top">' +
    '<button class="btn btn-primary" onclick="openTambahGuru()">' + window.ico('personPlus','sm') + ' Tambah Guru</button>' +
    '<button class="btn" onclick="openActivityLog()">' + window.ico('activity','sm') + ' Aktivitas</button>' +
    '</div>';
  h += '<h3 style="margin-bottom:12px;font-size:14.5px;font-weight:700;">' + window.ico('users') + ' Daftar Guru (' + window.DB.teachers.length + ')</h3>';
  if (window.DB.teachers.length === 0){
    h += '<div class="empty-state">' + window.ico('users',40) + '<p>Belum ada guru.</p></div>';
  } else {
    window.DB.teachers.forEach(function(t){
      h += '<div class="teacher-list-item">' +
        '<div class="info">' + window.ico('user','lg') + '<div><strong>' + esc(t.name) + '</strong><small>' + esc(t.email) + '</small></div></div>' +
        '<button class="btn btn-sm btn-danger" onclick="hapusGuru(\'' + esc(t.email) + '\')">' + window.ico('trash','sm') + '</button>' +
        '</div>';
    });
  }
  h += '<h3 style="margin:18px 0 10px;font-size:14.5px;font-weight:700;">' + window.ico('school') + ' Kelas Terdaftar (' + window.DB.classes.length + ')</h3>';
  if (window.DB.classes.length > 0){
    h += '<div class="table-wrap"><table><thead><tr><th>Kelas</th><th>Kode</th><th>Guru</th><th>Siswa</th></tr></thead><tbody>';
    window.DB.classes.forEach(function(c){
      h += '<tr><td><b>' + esc(c.name) + '</b></td><td><code>' + esc(c.code) + '</code></td><td>' + esc(c.teacherEmail||'-') + '</td><td>' + ((c.students||[]).length) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  $('main-content').innerHTML = h;
  window.hydrateIcons();
  window.updateBadge();
}
window.renderAdminDash = renderAdminDash;

/* ============================================================
   17. DASHBOARD SISWA
   ============================================================ */
function renderSiswaDash(){
  $('header-title-text').innerHTML = window.ico('user') + ' Dashboard Siswa';
  var c = window.DB.classes.find(function(x){ return x.id === window.currentUser.classId; });
  if (!c){
    $('main-content').innerHTML = '<div class="empty-state">' + window.ico('warning',40) + '<p>Kelas tidak ditemukan</p></div>';
    return;
  }
  var me = (c.students || []).find(function(s){ return s.id === window.currentUser.studentId; });
  if (!me){
    $('main-content').innerHTML = '<div class="empty-state">' + window.ico('warning',40) + '<p>Data siswa tidak ditemukan</p></div>';
    return;
  }
  var activeStages = window.getActiveStages(c.id);
  var roleLabel = (ROLES[me.role] || {}).label || me.role;

  var h = '';

  var kas = window.DB.kas[c.id];
  if (kas && kas.active){
    var myPays = (kas.payments && kas.payments[me.id]) || [];
    if (myPays.length === 0){
      h += '<div class="alert alert-warning">' + window.ico('briefcase') + '<div>Anda belum membayar <b>' + esc(kas.nama) + '</b> (Rp ' + (kas.nominal||0).toLocaleString('id-ID') + ').</div></div>';
    }
  }

  h += '<div class="progress-banner">' +
    '<h3>' + window.ico('user') + ' Selamat Datang</h3>' +
    '<div style="font-size:15px;font-weight:700;margin:6px 0;">' + esc(me.name) + '</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">' + esc(roleLabel) + ' &middot; Kelas ' + esc(c.name) + '</div>' +
  '</div>';

  h += '<div class="extras-toolbar-top" style="border:1px solid var(--primary-soft);background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));padding:14px;display:flex;flex-wrap:wrap;gap:8px;border-radius:10px;margin-bottom:14px;">' +
    '<button class="btn btn-primary" onclick="openMainMenu()">' + window.ico('gear','sm') + ' Menu</button>' +
    '<button class="btn" onclick="openPenilaianSiswa()">' + window.ico('edit','sm') + ' Beri Nilai</button>' +
    '<button class="btn" onclick="openChecklistSaya()">' + window.ico('checkSquare','sm') + ' Checklist</button>' +
    '<button class="btn" onclick="openAbsensiList()">' + window.ico('calendar','sm') + ' Absensi</button>' +
    '<button class="btn" onclick="openStrukturKerabat()">' + window.ico('award','sm') + ' Kerabat</button>' +
    '<button class="btn" onclick="openNilaiSaya()">' + window.ico('chart','sm') + ' Nilai Saya</button>' +
    '</div>';

  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">' + window.ico('layers') + ' Tahapan Aktif</h3>';
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">' + window.ico('lock') + '<div>Belum ada tahap dibuka guru.</div></div>';
  } else {
    h += '<div class="grid">';
    activeStages.forEach(function(s){
      var dl = ((window.DB.deadlines[c.id] || {})[s.id]) || {};
      h += '<div class="card" style="border-left:4px solid var(--success);cursor:pointer;" onclick="openPenilaianTahap(\'' + c.id + '\',\'' + s.id + '\')">' +
        '<h3>' + window.ico('layers','sm') + ' ' + esc(s.name) + '</h3>' +
        '<p style="color:var(--text-muted);font-size:12.5px;">' + esc(s.subtitle || s.desc || '') + '</p>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Bobot ' + s.weight + '%</div>' +
        (dl.date ? '<div style="font-size:11px;color:var(--warning);margin-top:4px;">Deadline: ' + fmtDateShort(dl.date) + '</div>' : '') +
        '</div>';
    });
    h += '</div>';
  }

  var tasks = window.getNotifs().filter(function(n){ return n.type === 'tugas'; }).slice(0, 5);
  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">' + window.ico('clock') + ' Deadline & Tugas</h3>';
  if (tasks.length === 0){
    h += '<div class="alert alert-info">' + window.ico('info') + '<div>Tidak ada tugas baru.</div></div>';
  } else {
    tasks.forEach(function(n){
      h += '<div class="welcome-item urgent"><div style="flex:1;"><b>' + esc(n.title) + '</b><br><small>' + esc(n.fromName||'') + ' &middot; ' + fmtDate(n.createdAt) + '</small></div></div>';
    });
  }

  $('main-content').innerHTML = h;
  window.hydrateIcons();
  window.updateBadge();
}
window.renderSiswaDash = renderSiswaDash;

/* ============================================================
   18. VIEW CLASS
   ============================================================ */
window.viewClass = function(cid){
  if (window.currentUser.type === 'siswa'){ return; }
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c){ alert('Kelas tidak ditemukan'); return; }
  window.__viewClassId = cid;

  var h = '';
  h += '<div class="extras-toolbar-top" style="border:1px solid var(--primary-soft);background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));padding:14px;display:flex;flex-wrap:wrap;gap:8px;border-radius:10px;margin-bottom:14px;">' +
    '<button class="btn" onclick="renderGuruDash()">' + window.ico('back','sm') + ' Kembali</button>' +
    '<button class="btn btn-primary" onclick="openSistemTahapan(\'' + cid + '\')">' + window.ico('gear','sm') + ' Sistem Tahapan</button>' +
    '<button class="btn" onclick="openTambahSiswa(\'' + cid + '\')">' + window.ico('personPlus','sm') + ' Tambah Siswa</button>' +
    '<button class="btn" onclick="openImportExcel(\'' + cid + '\')">' + window.ico('upload','sm') + ' Import Excel</button>' +
    '<button class="btn" onclick="openPenilaianGuru(\'' + cid + '\')">' + window.ico('edit','sm') + ' Penilaian Guru</button>' +
    '<button class="btn" onclick="openRekapNilai(\'' + cid + '\')">' + window.ico('chart','sm') + ' Rekap Nilai</button>' +
    '<button class="btn" onclick="openChecklistManage(\'' + cid + '\')">' + window.ico('clipboard','sm') + ' Checklist</button>' +
    '<button class="btn" onclick="openAbsensiList(\'' + cid + '\')">' + window.ico('calendar','sm') + ' Absensi</button>' +
    '<button class="btn" onclick="openBeriTugas(\'' + cid + '\')">' + window.ico('send','sm') + ' Beri Tugas</button>' +
    '<button class="btn" onclick="openBroadcast(\'' + cid + '\')">' + window.ico('megaphone','sm') + ' Broadcast</button>' +
    '<button class="btn" onclick="openKasManage(\'' + cid + '\')">' + window.ico('briefcase','sm') + ' Kas</button>' +
    '</div>';

  h += '<div class="class-code-box">' +
    '<div class="label">' + window.ico('hash','sm') + ' Kode Kelas</div>' +
    '<div class="code">' + esc(c.code) + '</div>' +
    '<div class="hint">Bagikan ke siswa untuk daftar mandiri</div>' +
    '<div class="action-row" style="justify-content:center;margin-top:14px;">' +
    '<button class="btn btn-primary btn-sm" onclick="salinKode(\'' + cid + '\')">' + window.ico('copy','sm') + ' Salin</button>' +
    '</div></div>';

  h += '<h3 style="margin:18px 0 12px;font-size:14.5px;font-weight:700;">' + window.ico('users') + ' Siswa (' + ((c.students||[]).length) + ')</h3>';

  if ((c.students || []).length === 0){
    h += '<div class="empty-state">' + window.ico('users',40) + '<p>Belum ada siswa. Klik <b>Tambah Siswa</b>.</p></div>';
  } else {
    h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>WA</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>';
    c.students.forEach(function(s, i){
      var r = ROLES[s.role] || {label:s.role, team:'-'};
      h += '<tr>' +
        '<td>' + (i+1) + '</td>' +
        '<td><b>' + esc(s.name) + '</b></td>' +
        '<td style="font-size:12px;color:var(--text-muted);">' + esc(s.email||'-') + '</td>' +
        '<td style="font-size:12px;color:' + (s.phone ? 'var(--success)' : 'var(--danger)') + ';">' + esc(s.phone||'tanpa WA') + '</td>' +
        '<td><span class="badge ' + (r.team === 'produksi' ? 'badge-info' : 'badge-warning') + '">' + esc(r.label) + '</span></td>' +
        '<td>' +
        '<button class="btn btn-sm" onclick="openEditSiswa(\'' + cid + '\',\'' + s.id + '\')">' + window.ico('edit','sm') + '</button> ' +
        '<button class="btn btn-sm btn-danger" onclick="hapusSiswa(\'' + cid + '\',\'' + s.id + '\')">' + window.ico('trash','sm') + '</button>' +
        '</td></tr>';
    });
    h += '</tbody></table></div>';
  }

  $('main-content').innerHTML = h;
  window.hydrateIcons();
};

/* ============================================================
   19. KELAS CRUD
   ============================================================ */
window.openTambahKelas = function(){
  window.openModal('Tambah Kelas',
    '<div class="form-group"><label>Nama Kelas</label><input id="new-class" placeholder="Contoh: IX-A" maxlength="30"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanKelas()">' + window.ico('save') + ' Simpan</button>');
  window.hydrateIcons();
};

window.simpanKelas = function(){
  var n = ($('new-class').value || '').trim();
  if (!n || n.length < 2){ alert('Nama kelas minimal 2 karakter'); return; }
  var code = n.replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,4) + '-' + Math.floor(1000 + Math.random()*9000);
  var id = uid();
  var data = {
    id: id, name: n, code: code, students: [],
    teacherEmail: window.currentUser.email,
    teacherName: window.currentUser.name,
    createdAt: Date.now()
  };
  fbSet('classes', id, data).then(function(){
    window.closeModal();
    alert('Kelas dibuat! Kode: ' + code);
    if (!window.DB.classes.find(function(x){ return x.id === id; })){
      window.DB.classes.push(data);
    }
    renderGuruDash();
  }).catch(function(err){ alert('Gagal: ' + err.message); });
};

window.hapusKelas = function(cid){
  if (!confirm('Hapus kelas ini?')) return;
  fbDel('classes', cid).then(function(){
    window.DB.classes = window.DB.classes.filter(function(c){ return c.id !== cid; });
    alert('Kelas dihapus');
    renderGuruDash();
  });
};

window.salinKode = function(cid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  if (navigator.clipboard) navigator.clipboard.writeText(c.code).then(function(){ alert('Kode disalin: ' + c.code); });
  else prompt('Copy kode:', c.code);
};

/* ============================================================
   20. SISWA CRUD
   ============================================================ */
window.openTambahSiswa = function(cid){
  var opts = '';
  Object.keys(ROLES).forEach(function(k){ opts += '<option value="' + k + '">' + ROLES[k].label + '</option>'; });
  window.openModal('Tambah Siswa',
    '<div class="form-group"><label>Nama</label><input id="ts-name" maxlength="80"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="ts-email"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="ts-phone"></div>' +
    '<div class="form-group"><label>Password</label><input type="text" id="ts-pw" value="#Smpn10smd"></div>' +
    '<div class="form-group"><label>Peran</label><select id="ts-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanSiswa(\'' + cid + '\')">' + window.ico('save') + ' Simpan</button>');
  window.hydrateIcons();
};

window.simpanSiswa = function(cid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var n = ($('ts-name').value || '').trim();
  var e = ($('ts-email').value || '').trim().toLowerCase();
  var ph = ($('ts-phone').value || '').replace(/\D/g,'');
  var pw = $('ts-pw').value || '#Smpn10smd';
  var r = $('ts-role').value;
  if (!n || !e){ alert('Nama dan email wajib'); return; }
  var ns = (c.students || []).concat([{
    id: uid(), name: n, email: e, phone: ph,
    password: pw, role: r, registeredAt: Date.now()
  }]);
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){
    c.students = ns;
    window.closeModal();
    alert('Siswa ditambahkan');
    window.viewClass(cid);
  });
};

window.openEditSiswa = function(cid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var s = (c.students || []).find(function(x){ return x.id === sid; });
  if (!s) return;
  var opts = '';
  Object.keys(ROLES).forEach(function(k){
    opts += '<option value="' + k + '"' + (s.role === k ? ' selected' : '') + '>' + ROLES[k].label + '</option>';
  });
  window.openModal('Edit Siswa',
    '<div class="form-group"><label>Nama</label><input id="es-name" value="' + esc(s.name) + '"></div>' +
    '<div class="form-group"><label>Email</label><input type="email" id="es-email" value="' + esc(s.email || '') + '"></div>' +
    '<div class="form-group"><label>No. WA</label><input type="tel" id="es-phone" value="' + esc(s.phone || '') + '"></div>' +
    '<div class="form-group"><label>Password Baru (kosongkan jika tidak diubah)</label><input type="text" id="es-pw"></div>' +
    '<div class="form-group"><label>Peran</label><select id="es-role">' + opts + '</select></div>' +
    '<button class="btn btn-primary btn-block" onclick="updateSiswa(\'' + cid + '\',\'' + sid + '\')">' + window.ico('save') + ' Simpan</button>');
  window.hydrateIcons();
};

window.updateSiswa = function(cid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var n = ($('es-name').value || '').trim();
  var e = ($('es-email').value || '').trim().toLowerCase();
  var ph = ($('es-phone').value || '').replace(/\D/g,'');
  var pw = $('es-pw').value;
  var r = $('es-role').value;
  if (!n || !e){ alert('Nama dan email wajib'); return; }
  var ns = (c.students || []).map(function(x){
    if (x.id !== sid) return x;
    var upd = Object.assign({}, x, {name:n, email:e, phone:ph, role:r});
    if (pw) upd.password = pw;
    return upd;
  });
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){
    c.students = ns;
    window.closeModal();
    alert('Siswa diperbarui');
    window.viewClass(cid);
  });
};

window.hapusSiswa = function(cid, sid){
  if (!confirm('Hapus siswa ini?')) return;
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var ns = (c.students || []).filter(function(x){ return x.id !== sid; });
  fbSet('classes', cid, Object.assign({}, c, {students:ns})).then(function(){
    c.students = ns;
    alert('Siswa dihapus');
    window.viewClass(cid);
  });
};

/* ============================================================
   21. SISTEM TAHAPAN
   ============================================================ */
window.openSistemTahapan = function(cid){
  cid = cid || window.__viewClassId;
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var stages = window.DB.stages || [];
  var activeIds = window.DB.activeStages[cid] || [];
  var totalW = stages.reduce(function(a, s){ return a + Number(s.weight || 0); }, 0);

  var h = '<div class="alert alert-info">' + window.ico('layers') + '<div><b>Sistem Tahapan</b> — ' +
    activeIds.length + '/' + stages.length + ' aktif · Total bobot: ' + totalW + '%</div></div>';

  h += '<div class="action-row" style="margin-bottom:14px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary btn-sm" onclick="openTambahTahapan(\'' + cid + '\')">' + window.ico('plus','sm') + ' Tambah</button>' +
    '<button class="btn btn-sm" onclick="aktifkanSemua(\'' + cid + '\')">' + window.ico('checkSquare','sm') + ' Aktifkan Semua</button>' +
    '<button class="btn btn-sm btn-danger" onclick="matikanSemua(\'' + cid + '\')">' + window.ico('x','sm') + ' Matikan Semua</button>' +
    '</div>';

  stages.forEach(function(stage, i){
    var isActive = activeIds.indexOf(stage.id) >= 0;
    var dl = ((window.DB.deadlines[cid] || {})[stage.id]) || {};
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
      (dl.date ? '<div style="font-size:11.5px;color:var(--warning);margin-bottom:8px;">' + window.ico('clock','sm') + ' Deadline: <b>' +
        fmtDateShort(dl.date) + (dl.time ? ' ' + dl.time : '') + '</b></div>' : '') +
      '<div class="action-row" style="flex-wrap:wrap;">' +
        '<button class="btn btn-sm ' + (isActive ? 'btn-danger' : 'btn-primary') + '" onclick="toggleTahapan(\'' + cid + '\',\'' + stage.id + '\')">' +
          window.ico(isActive ? 'x' : 'check','sm') + ' ' + (isActive ? 'Matikan' : 'Aktifkan') + '</button>' +
        '<button class="btn btn-sm" onclick="openEditTahapan(\'' + stage.id + '\')">' + window.ico('edit','sm') + ' Edit</button>' +
        '<button class="btn btn-sm" onclick="openAturDeadline(\'' + cid + '\',\'' + stage.id + '\')">' + window.ico('calendar','sm') + ' Deadline</button>' +
        (stages.length > 1 ? '<button class="btn btn-sm btn-danger" onclick="hapusTahapan(\'' + stage.id + '\')">' + window.ico('trash','sm') + '</button>' : '') +
      '</div>' +
    '</div>';
  });

  window.openModal('Sistem Tahapan — ' + c.name, h);
  window.hydrateIcons();
};

window.toggleTahapan = function(cid, sid){
  var cur = (window.DB.activeStages[cid] || []).slice();
  var nw = cur.indexOf(sid) >= 0 ? cur.filter(function(x){ return x !== sid; }) : cur.concat([sid]);
  fbSet('activeStages', cid, {classId:cid, activeIds:nw, updatedAt:Date.now()}).then(function(){
    window.DB.activeStages[cid] = nw;
    window.closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.aktifkanSemua = function(cid){
  if (!confirm('Aktifkan semua tahapan?')) return;
  var ids = (window.DB.stages || []).map(function(s){ return s.id; });
  fbSet('activeStages', cid, {classId:cid, activeIds:ids, updatedAt:Date.now()}).then(function(){
    window.DB.activeStages[cid] = ids;
    window.closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.matikanSemua = function(cid){
  if (!confirm('Matikan semua tahapan?')) return;
  fbSet('activeStages', cid, {classId:cid, activeIds:[], updatedAt:Date.now()}).then(function(){
    window.DB.activeStages[cid] = [];
    window.closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.openTambahTahapan = function(cid){
  window.openModal('Tambah Tahapan',
    '<div class="form-group"><label>Nama</label><input id="stg-name" maxlength="60"></div>' +
    '<div class="form-group"><label>Sub-Judul</label><input id="stg-sub" maxlength="60"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="stg-desc" rows="2" maxlength="200"></textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label><input type="number" id="stg-w" value="10" min="1" max="100"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanTahapanBaru(\'' + cid + '\')">' + window.ico('save') + ' Simpan</button>');
  window.hydrateIcons();
};

window.simpanTahapanBaru = function(cid){
  var name = ($('stg-name').value || '').trim();
  var sub = ($('stg-sub').value || '').trim();
  var desc = ($('stg-desc').value || '').trim();
  var weight = parseFloat($('stg-w').value) || 0;
  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }
  if (weight <= 0 || weight > 100){ alert('Bobot 1-100'); return; }
  var stages = (window.DB.stages || []).slice();
  stages.push({
    id: 'stage_' + Date.now().toString(36),
    name: name, subtitle: sub, desc: desc, weight: weight
  });
  fbSet('config', 'stages', {stages:stages}).then(function(){
    window.DB.stages = stages;
    window.closeModal();
    alert('Tahapan ditambahkan');
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.openEditTahapan = function(sid){
  var s = (window.DB.stages || []).find(function(x){ return x.id === sid; });
  if (!s) return;
  window.openModal('Edit Tahapan',
    '<div class="form-group"><label>Nama</label><input id="stg-name" value="' + esc(s.name) + '"></div>' +
    '<div class="form-group"><label>Sub-Judul</label><input id="stg-sub" value="' + esc(s.subtitle || '') + '"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="stg-desc" rows="2">' + esc(s.desc || '') + '</textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label><input type="number" id="stg-w" value="' + s.weight + '"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanEditTahapan(\'' + sid + '\')">' + window.ico('save') + ' Simpan</button>');
  window.hydrateIcons();
};

window.simpanEditTahapan = function(sid){
  var name = ($('stg-name').value || '').trim();
  var sub = ($('stg-sub').value || '').trim();
  var desc = ($('stg-desc').value || '').trim();
  var weight = parseFloat($('stg-w').value) || 0;
  if (!name || weight <= 0){ alert('Lengkapi'); return; }
  var stages = (window.DB.stages || []).map(function(s){
    if (s.id !== sid) return s;
    return Object.assign({}, s, {name:name, subtitle:sub, desc:desc, weight:weight});
  });
  fbSet('config', 'stages', {stages:stages}).then(function(){
    window.DB.stages = stages;
    window.closeModal();
    alert('Tahapan diperbarui');
  });
};

window.hapusTahapan = function(sid){
  if (!confirm('Hapus tahapan ini?')) return;
  var stages = (window.DB.stages || []).filter(function(s){ return s.id !== sid; });
  if (stages.length === 0){ alert('Minimal 1 tahapan'); return; }
  fbSet('config', 'stages', {stages:stages}).then(function(){
    window.DB.stages = stages;
    window.closeModal();
    alert('Tahapan dihapus');
  });
};

window.openAturDeadline = function(cid, sid){
  var s = (window.DB.stages || []).find(function(x){ return x.id === sid; });
  var dl = ((window.DB.deadlines[cid] || {})[sid]) || {};
  window.openModal('Atur Deadline — ' + (s ? s.name : ''),
    '<div class="form-group"><label>Tanggal</label><input type="date" id="dl-date" value="' + (dl.date || '') + '"></div>' +
    '<div class="form-group"><label>Jam</label><input type="time" id="dl-time" value="' + (dl.time || '23:59') + '"></div>' +
    '<div class="form-group"><label>Catatan</label><textarea id="dl-note" rows="2">' + esc(dl.note || '') + '</textarea></div>' +
    '<div class="action-row">' +
      '<button class="btn btn-primary" style="flex:1;" onclick="simpanDeadline(\'' + cid + '\',\'' + sid + '\')">' + window.ico('save') + ' Simpan</button>' +
      (dl.date ? '<button class="btn btn-danger" onclick="hapusDeadline(\'' + cid + '\',\'' + sid + '\')">' + window.ico('trash') + '</button>' : '') +
    '</div>');
  window.hydrateIcons();
};

window.simpanDeadline = function(cid, sid){
  var date = $('dl-date').value;
  var time = $('dl-time').value || '23:59';
  var note = ($('dl-note').value || '').trim();
  if (!date){ alert('Tanggal wajib'); return; }
  var deadlines = Object.assign({}, window.DB.deadlines[cid] || {});
  deadlines[sid] = {date:date, time:time, note:note, setBy: window.currentUser.name, setAt: Date.now()};
  fbSet('deadlines', cid, Object.assign({}, deadlines, {classId:cid})).then(function(){
    window.DB.deadlines[cid] = deadlines;
    window.closeModal();
    alert('Deadline tersimpan');
    if (window.__viewClassId) window.openSistemTahapan(window.__viewClassId);
  });
};

window.hapusDeadline = function(cid, sid){
  if (!confirm('Hapus deadline?')) return;
  var deadlines = Object.assign({}, window.DB.deadlines[cid] || {});
  delete deadlines[sid];
  fbSet('deadlines', cid, Object.assign({}, deadlines, {classId:cid})).then(function(){
    window.DB.deadlines[cid] = deadlines;
    window.closeModal();
    alert('Deadline dihapus');
  });
};

/* ============================================================
   22. KALKULASI NILAI
   ============================================================ */
function calcAvg(scores, rubric){
  if (!scores || !rubric) return 0;
  var total = 0, wsum = 0;
  rubric.forEach(function(r){
    var v = scores[r.id];
    if (typeof v === 'number'){ total += v * r.weight; wsum += r.weight; }
  });
  return wsum > 0 ? total / wsum : 0;
}

function getAttendanceFactor(cid, sid){
  var meetings = Object.values(window.DB.meetings || {}).filter(function(m){ return m.classId === cid; });
  if (meetings.length === 0) return 1.0;
  var present = 0, total = 0;
  meetings.forEach(function(m){
    var r = m.records && m.records[sid];
    if (!r) return;
    total++;
    if (r === 'hadir') present += 1;
    else if (r === 'izin' || r === 'sakit') present += 0.75;
    else if (r === 'telat') present += 0.5;
  });
  if (total === 0) return 1.0;
  var pct = present / total;
  return 0.75 + 0.25 * Math.min(1, Math.max(0, pct));
}

function getStageScore(cid, tid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return {guru:null, ketua:null, rekan:null, final:0, factor:1};
  var t = (c.students || []).find(function(x){ return x.id === tid; });
  if (!t) return {guru:null, ketua:null, rekan:null, final:0, factor:1};

  var rubric = getRubricFor(t.role);
  var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid]) || {};
  var guru = null;
  var ketuaArr = [], rekanArr = [];

  Object.keys(ev).forEach(function(eid){
    var scores = ev[eid] && ev[eid][sid];
    if (!scores || Object.keys(scores).length === 0) return;
    var avg = calcAvg(scores, rubric);
    if (eid === 'guru'){ guru = avg; return; }
    var evS = (c.students || []).find(function(x){ return x.id === eid; });
    if (!evS) return;
    if (evS.role === 'pimpinan_produksi' || evS.role === 'sutradara') ketuaArr.push(avg);
    else rekanArr.push(avg);
  });

  var ketua = ketuaArr.length > 0 ? ketuaArr.reduce(function(a,b){ return a+b; }, 0)/ketuaArr.length : null;
  var rekan = rekanArr.length > 0 ? rekanArr.reduce(function(a,b){ return a+b; }, 0)/rekanArr.length : null;

  var parts = [];
  if (guru !== null) parts.push({val:guru, w:0.4});
  if (ketua !== null) parts.push({val:ketua, w:0.3});
  if (rekan !== null) parts.push({val:rekan, w:0.3});

  var finalScore = 0;
  if (parts.length > 0){
    var tw = parts.reduce(function(a,p){ return a + p.w; }, 0);
    parts.forEach(function(p){ finalScore += p.val * (p.w / tw); });
  }

  var factor = getAttendanceFactor(cid, tid);
  finalScore = finalScore * factor;

  return {
    guru: guru, ketua: ketua, rekan: rekan,
    final: Math.max(0, Math.min(4, finalScore)),
    factor: factor
  };
}

function getFinalScore(cid, tid){
  var stages = window.getActiveStages(cid);
  if (stages.length === 0) return 0;
  var tw = 0, weighted = 0;
  stages.forEach(function(s){
    var bd = getStageScore(cid, tid, s.id);
    weighted += bd.final * s.weight;
    tw += s.weight;
  });
  return tw > 0 ? weighted / tw : 0;
}

/* ============================================================
   23. PENILAIAN GURU
   ============================================================ */
window.openPenilaianGuru = function(cid){
  cid = cid || window.__viewClassId;
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var stages = window.getActiveStages(cid);
  var targets = (c.students || []).filter(function(s){
    return s.role === 'pimpinan_produksi' || s.role === 'sutradara';
  });

  var h = '<div class="alert alert-info">' + window.ico('target') + '<div><b>Penilaian Guru</b> — Nilai Pimpinan Produksi & Sutradara (bobot 40%).</div></div>';

  if (targets.length === 0){
    h += '<div class="empty-state">' + window.ico('users',40) + '<p>Belum ada siswa dengan peran Pimpinan Produksi/Sutradara.</p></div>';
    window.openModal('Penilaian Guru', h);
    return;
  }

  if (stages.length === 0){
    h += '<div class="alert alert-warning">' + window.ico('lock') + '<div>Belum ada tahap aktif.</div></div>';
  }

  targets.forEach(function(t){
    var rl = (ROLES[t.role] || {}).label || t.role;
    var done = stages.filter(function(s){
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var gs = ev.guru && ev.guru[s.id];
      return gs && Object.keys(gs).length > 0;
    }).length;
    h += '<div class="card" style="margin-bottom:10px;border-left:4px solid var(--primary);">' +
      '<div style="font-weight:700;font-size:14px;">' + esc(t.name) + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">' + esc(rl) + '</div>' +
      '<div style="font-size:12px;margin-bottom:8px;">Progress: <b>' + done + '/' + stages.length + '</b> tahap</div>' +
      '<button class="btn btn-primary btn-sm" onclick="openPilihTahapGuru(\'' + cid + '\',\'' + t.id + '\')">' + window.ico('edit','sm') + ' Nilai</button>' +
    '</div>';
  });
  window.openModal('Penilaian Guru', h);
  window.hydrateIcons();
};

window.openPilihTahapGuru = function(cid, tid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var t = (c.students || []).find(function(x){ return x.id === tid; });
  if (!t) return;
  var stages = window.getActiveStages(cid);
  var h = '<div class="alert alert-info">' + window.ico('user') + '<div>Menilai: <b>' + esc(t.name) + '</b></div></div>';
  stages.forEach(function(s){
    var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid]) || {};
    var gs = ev.guru && ev.guru[s.id];
    var done = gs && Object.keys(gs).length > 0;
    h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + (done ? 'var(--success)' : 'var(--warning)') + ';">' +
      '<div style="font-weight:700;">' + esc(s.name) + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">Bobot ' + s.weight + '%</div>' +
      (done ? '<span class="badge badge-success">' + window.ico('check','sm') + ' Selesai</span> ' : '') +
      '<button class="btn btn-primary btn-sm" onclick="openFormNilaiGuru(\'' + cid + '\',\'' + tid + '\',\'' + s.id + '\')">' + window.ico('edit','sm') + ' ' + (done ? 'Edit' : 'Nilai') + '</button>' +
    '</div>';
  });
  window.openModal('Pilih Tahap', h);
  window.hydrateIcons();
};

window.openFormNilaiGuru = function(cid, tid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var t = (c.students || []).find(function(x){ return x.id === tid; });
  if (!t) return;
  var stage = (window.DB.stages || []).find(function(s){ return s.id === sid; });
  if (!stage) return;
  var rubric = getRubricFor(t.role);
  var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid]) || {};
  var myScores = (ev.guru && ev.guru[sid]) || {};

  var h = '<div class="alert alert-info">' + window.ico('info') + '<div>Nilai <b>' + esc(t.name) + '</b> — ' + esc(stage.name) + '</div></div>';
  h += '<div class="scale-guide"><div class="scale-guide-title">' + window.ico('info','sm') + ' Panduan Skala</div>' +
    '<div class="scale-guide-grid">' +
    '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
    '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
    '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
    '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
    '</div></div>';

  rubric.forEach(function(r){
    var v = myScores[r.id];
    h += '<div class="rubric-item">' +
      '<h4>' + esc(r.name) + ' <span class="weight-info">' + r.weight + '%</span></h4>' +
      '<div class="desc">' + esc(r.desc || '') + '</div>' +
      '<div class="radio-group">';
    var labels = {4:'Sangat Baik', 3:'Baik', 2:'Cukup', 1:'Kurang'};
    [4,3,2,1].forEach(function(val){
      h += '<label class="radio-score rs-' + val + '">' +
        '<input type="radio" name="gsc_' + sid + '_' + r.id + '" value="' + val + '"' + (v === val ? ' checked' : '') + '>' +
        '<div><b>' + val + ' — ' + labels[val] + '</b></div>' +
      '</label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:16px;" onclick="simpanNilaiGuru(\'' + cid + '\',\'' + tid + '\',\'' + sid + '\')">' + window.ico('save') + ' Simpan Nilai</button>';
  window.openModal('Nilai: ' + t.name, h);
  window.hydrateIcons();
};

window.simpanNilaiGuru = function(cid, tid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var t = (c.students || []).find(function(x){ return x.id === tid; });
  if (!t) return;
  var rubric = getRubricFor(t.role);
  var scores = {}, missing = [];

  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="gsc_' + sid + '_' + r.id + '"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });
  if (missing.length > 0){ alert('Belum lengkap: ' + missing.slice(0,3).join(', ')); return; }

  var docId = cid + '__' + tid;
  if (!fbReady){ alert('Firebase belum siap'); return; }
  fb.collection('evaluations').doc(docId).get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:tid};
    data.guru = data.guru || {};
    data.guru[sid] = scores;
    return fb.collection('evaluations').doc(docId).set(data, {merge:true});
  }).then(function(){
    alert('Nilai tersimpan');
    window.closeModal();
  }).catch(function(err){ alert('Gagal: ' + err.message); });
};

/* ============================================================
   24. PENILAIAN SISWA
   ============================================================ */
window.openPenilaianSiswa = function(){
  var u = window.currentUser;
  var c = window.DB.classes.find(function(x){ return x.id === u.classId; });
  if (!c) return;
  var stages = window.getActiveStages(c.id);
  if (stages.length === 0){ alert('Belum ada tahap aktif'); return; }
  var others = (c.students || []).filter(function(s){
    return s.id !== u.studentId && canEvaluate(u.role, s.role);
  });
  if (others.length === 0){
    window.openModal('Beri Nilai', '<div class="empty-state">' + window.ico('users',40) + '<p>Tidak ada rekan untuk dinilai.</p></div>');
    return;
  }
  var h = '<div class="alert alert-info">' + window.ico('info') + '<div>Pilih tahap untuk menilai rekan.</div></div>';
  stages.forEach(function(s){
    h += '<div class="card" style="margin-bottom:10px;border-left:4px solid var(--primary);">' +
      '<div style="font-weight:700;">' + esc(s.name) + '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">' + esc(s.desc || '') + '</div>' +
      '<button class="btn btn-primary btn-sm" onclick="openPenilaianTahap(\'' + c.id + '\',\'' + s.id + '\')">' + window.ico('edit','sm') + ' Nilai Tahap Ini</button>' +
    '</div>';
  });
  window.openModal('Beri Nilai', h);
  window.hydrateIcons();
};

window.openPenilaianTahap = function(cid, sid){
  var u = window.currentUser;
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return;
  var stage = (window.DB.stages || []).find(function(s){ return s.id === sid; });
  if (!stage) return;

  var targets = (c.students || []).filter(function(s){
    return s.id !== u.studentId && canEvaluate(u.role, s.role);
  });

  var h = '<div class="alert alert-info">' + window.ico('info') + '<div><b>' + esc(stage.name) + '</b></div></div>';
  targets.forEach(function(t){
    var rl = (ROLES[t.role] || {}).label || t.role;
    var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
    var myScores = (ev[u.studentId] && ev[u.studentId][sid]) || {};
    var done = Object.keys(myScores).length > 0;
    h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + (done ? 'var(--success)' : 'var(--warning)') + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<div><div style="font-weight:700;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(rl) + '</div></div>' +
        (done ? '<span class="badge badge-success">' + window.ico('check','sm') + ' Sudah</span>' : '') +
      '</div>' +
      '<button class="btn btn-primary btn-sm btn-block" style="margin-top:8px;" onclick="openFormNilai(\'' + cid + '\',\'' + t.id + '\',\'' + sid + '\')">' +
        window.ico('edit','sm') + ' ' + (done ? 'Edit Nilai' : 'Beri Nilai') + '</button>' +
    '</div>';
  });
  window.openModal('Penilaian — ' + stage.name, h);
  window.hydrateIcons();
};

window.openFormNilai = function(cid, tid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var t = (c.students || []).find(function(x){ return x.id === tid; });
  if (!t) return;
  var rubric = getRubricFor(t.role);
  var u = window.currentUser;
  var ev = ((window.DB.evaluations[cid] || {})[tid] || {})[u.studentId] || {};
  var myScores = ev[sid] || {};

  var h = '<div class="alert alert-info">' + window.ico('user') + '<div>Menilai <b>' + esc(t.name) + '</b></div></div>';
  h += '<div class="alert alert-warning">' + window.ico('warning','sm') + '<div>Nilai objektif membantu rekan berkembang.</div></div>';
  h += '<div class="scale-guide"><div class="scale-guide-title">' + window.ico('info','sm') + ' Skala</div>' +
    '<div class="scale-guide-grid">' +
    '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
    '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
    '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
    '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
    '</div></div>';

  rubric.forEach(function(r){
    var v = myScores[r.id];
    h += '<div class="rubric-item">' +
      '<h4>' + esc(r.name) + '</h4>' +
      '<div class="desc">' + esc(r.desc || '') + '</div>' +
      '<div class="radio-group">';
    var labels = {4:'Sangat Baik', 3:'Baik', 2:'Cukup', 1:'Kurang'};
    [4,3,2,1].forEach(function(val){
      h += '<label class="radio-score rs-' + val + '">' +
        '<input type="radio" name="sc_' + sid + '_' + r.id + '" value="' + val + '"' + (v === val ? ' checked' : '') + '>' +
        '<div><b>' + val + ' — ' + labels[val] + '</b></div>' +
      '</label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:16px;" onclick="simpanNilai(\'' + cid + '\',\'' + tid + '\',\'' + sid + '\')">' + window.ico('save') + ' Simpan Nilai</button>';
  window.openModal('Nilai: ' + t.name, h);
  window.hydrateIcons();
};

window.simpanNilai = function(cid, tid, sid){
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  var t = (c.students || []).find(function(x){ return x.id === tid; });
  if (!t) return;
  var rubric = getRubricFor(t.role);
  var scores = {}, missing = [];

  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="sc_' + sid + '_' + r.id + '"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });
  if (missing.length > 0){ alert('Belum lengkap: ' + missing.slice(0,3).join(', ')); return; }

  var u = window.currentUser;
  var docId = cid + '__' + tid;
  if (!fbReady){ alert('Firebase belum siap'); return; }
  fb.collection('evaluations').doc(docId).get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:tid};
    data[u.studentId] = data[u.studentId] || {};
    data[u.studentId][sid] = scores;
    return fb.collection('evaluations').doc(docId).set(data, {merge:true});
  }).then(function(){
    if (window.logActivity) window.logActivity('eval_submit', u.name + ' menilai ' + t.name, {classId:cid});
    alert('Nilai tersimpan');
    window.closeModal();
  }).catch(function(err){ alert('Gagal: ' + err.message); });
};

/* ============================================================
   25. NILAI SAYA
   ============================================================ */
window.openNilaiSaya = function(){
  var u = window.currentUser;
  if (!u || u.type !== 'siswa'){ alert('Hanya untuk siswa'); return; }
  var c = window.DB.classes.find(function(x){ return x.id === u.classId; });
  if (!c) return;
  var stages = window.getActiveStages(c.id);
  var final = getFinalScore(c.id, u.studentId);

  var h = '<div class="progress-banner">' +
    '<h3>' + window.ico('chart') + ' Nilai Saya</h3>' +
    '<div style="font-size:32px;font-weight:800;color:var(--primary);">' + final.toFixed(2) + '</div>' +
    '<div style="font-size:12.5px;color:var(--text-muted);">dari skala 4.00</div>' +
  '</div>';

  if (stages.length === 0){
    h += '<div class="alert alert-warning">' + window.ico('lock') + '<div>Belum ada tahap aktif.</div></div>';
    window.openModal('Nilai Saya', h);
    return;
  }

  h += '<div class="table-wrap"><table><thead><tr>' +
    '<th>Tahap</th><th>Bobot</th><th>Guru</th><th>Ketua</th><th>Rekan</th><th>Faktor</th><th>Final</th>' +
  '</tr></thead><tbody>';

  stages.forEach(function(s){
    var bd = getStageScore(c.id, u.studentId, s.id);
    var color = bd.final >= 3.5 ? 'badge-success' : bd.final >= 2.5 ? 'badge-info' : bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';
    h += '<tr>' +
      '<td><b>' + esc(s.name) + '</b></td>' +
      '<td>' + s.weight + '%</td>' +
      '<td>' + (bd.guru !== null ? bd.guru.toFixed(2) : '-') + '</td>' +
      '<td>' + (bd.ketua !== null ? bd.ketua.toFixed(2) : '-') + '</td>' +
      '<td>' + (bd.rekan !== null ? bd.rekan.toFixed(2) : '-') + '</td>' +
      '<td>' + bd.factor.toFixed(2) + '</td>' +
      '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>' +
    '</tr>';
  });
  h += '</tbody></table></div>';
  h += '<div class="alert alert-info" style="margin-top:12px;font-size:12px;">' + window.ico('info') + '<div>Bobot: Guru 40% + Ketua 30% + Rekan 30%, dikali Faktor Kehadiran (0.75 - 1.00).</div></div>';
  window.openModal('Nilai Saya', h);
  window.hydrateIcons();
};

/* ============================================================
   26. REKAP NILAI + EXPORT
   ============================================================ */
window.openRekapNilai = function(cid){
  cid = cid || window.__viewClassId;
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = window.DB.classes.find(function(x){ return x.id === cid; });
  if (!c) return
