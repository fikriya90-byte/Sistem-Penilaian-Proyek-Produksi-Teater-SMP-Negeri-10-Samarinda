/* ============================================================
   SP-PPT v2.0 — CORE
   Sistem Penilaian Proyek Produksi Teater
   SMP Negeri 10 Samarinda
   Utils + Firebase + State + Auth + Icons + Modal + Notif
   + Toolbar + Theme + Dashboard + Boot
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   UTILS
   ============================================================ */
window.U = {
  esc: function(v){
    return String(v == null ? '' : v).replace(/[<>&"']/g, function(c){
      return { '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c];
    });
  },
  trim: function(v){ return String(v == null ? '' : v).trim(); },
  normEmail: function(v){ return String(v||'').trim().toLowerCase(); },
  normPhone: function(v){ return String(v||'').trim().replace(/\D/g,''); },
  uid: function(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6); },
  fmtDate: function(ts){
    if(!ts) return '-';
    var d = new Date(ts); if(isNaN(d.getTime())) return '-';
    var b = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return d.getDate()+' '+b[d.getMonth()]+' '+d.getFullYear()+', '+
      String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  },
  safeJson: function(str,fb){ if(!str) return fb; try{ var p=JSON.parse(str); return p==null?fb:p; }catch(e){ return fb; } },
  getLS: function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  setLS: function(k,v){ try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } },
  delLS: function(k){ try{ localStorage.removeItem(k); }catch(e){} },
  safeFS: function(obj){
    if(obj instanceof Date) return obj.toISOString();
    if(obj===undefined||obj===null) return obj;
    if(typeof obj!=='object') return obj;
    if(Array.isArray(obj)) return obj.map(window.U.safeFS).filter(function(v){ return v!==undefined; });
    var c = {};
    for(var k in obj){ if(!Object.prototype.hasOwnProperty.call(obj,k)) continue;
      var v=obj[k]; if(v===undefined) continue; c[k]=window.U.safeFS(v); }
    return c;
  },
  isUrl: function(u){ return /^https?:\/\/[^\s]+/i.test(String(u||'').trim()); },
  BAD: ['anjing','bangsat','kontol','memek','ngentot','jancok','bacot','bego','goblok','idiot','tolol','setan','babi','monyet'],
  hasProfanity: function(t){
    if(!t) return false;
    var s=' '+String(t).toLowerCase().replace(/[^a-z0-9 ]/g,' ')+' ';
    return window.U.BAD.some(function(w){ return s.indexOf(' '+w+' ')>=0; });
  },
  sanitize: function(t){
    if(!t) return '';
    var s = String(t);
    window.U.BAD.forEach(function(w){ s=s.replace(new RegExp('\\b'+w+'\\b','gi'),'***'); });
    return s;
  },
  waPhone: function(p){
    p = String(p||'').replace(/\D/g,'');
    if(!p) return '';
    if(p.charAt(0)==='0') p='62'+p.substring(1);
    if(p.substring(0,2)!=='62') p='62'+p;
    return p;
  },
  waLink: function(phone,msg){
    var p = window.U.waPhone(phone);
    if(!p) return '';
    return 'https://wa.me/'+p+'?text='+encodeURIComponent(msg||'');
  }
};

/* ============================================================
   FIREBASE
   ============================================================ */
window.fbReady = false; window.fb = null; window.fbError = '';
try {
  if(typeof firebase==='undefined') throw new Error('Firebase SDK tidak termuat');
  var cfg = window.FIREBASE_CONFIG;
  if(!cfg || !cfg.apiKey || cfg.apiKey==='') throw new Error('FIREBASE_CONFIG belum diisi');
  if(!firebase.apps.length) firebase.initializeApp(cfg);
  window.fb = firebase.firestore();
  try{ window.fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}
  window.fbReady = true;
  console.log('[firebase] ready');
} catch(e){ window.fbError = e.message; console.error('[firebase]', e.message); }

window.fsSet = function(col,id,data){
  if(!window.fbReady) return Promise.resolve();
  return window.fb.collection(col).doc(id).set(window.U.safeFS(data),{merge:true});
};
window.fsDel = function(col,id){
  if(!window.fbReady) return Promise.resolve();
  return window.fb.collection(col).doc(id).delete();
};
window.fsGet = function(col,id){
  if(!window.fbReady) return Promise.reject(new Error('Firebase belum siap'));
  return window.fb.collection(col).doc(id).get();
};

/* ============================================================
   ROLES & STATE
   ============================================================ */
window.ROLES = {
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

window.DEFAULT_STAGES = [
  {id:'stage1',name:'Perencanaan',weight:20,desc:'Konsep, jadwal, RAB'},
  {id:'stage2',name:'Pelaksanaan',weight:35,desc:'Latihan & produksi'},
  {id:'stage3',name:'Pertunjukan',weight:35,desc:'Hari-H'},
  {id:'stage4',name:'Evaluasi',weight:10,desc:'Laporan & refleksi'}
];

window.DB = {
  teachers:[], classes:[], evaluations:{}, deadlines:{}, activeStages:{},
  notifications:[], stages:JSON.parse(JSON.stringify(window.DEFAULT_STAGES)),
  checklists:{}, meetings:{}, activityLogs:[], waLogs:[],
  naskah:{}, bookingAlat:{}, koordinasi:[]
};

window.currentUser = null;
var SESSION_KEY = 'sppt_session_v2';
window.saveSession = function(){
  if(!window.currentUser) return;
  window.U.setLS(SESSION_KEY,JSON.stringify({
    type:window.currentUser.type, email:window.currentUser.email||'',
    name:window.currentUser.name||'', classId:window.currentUser.classId||'',
    studentId:window.currentUser.studentId||'', role:window.currentUser.role||'',
    phone:window.currentUser.phone||''
  }));
};
window.clearSession = function(){ window.U.delLS(SESSION_KEY); };
window.getSession = function(){ return window.U.safeJson(window.U.getLS(SESSION_KEY),null); };
window.myType = function(){ return String((window.currentUser||{}).type||'').toLowerCase(); };
window.myRole = function(){ return String((window.currentUser||{}).role||'').toLowerCase(); };
window.myCid = function(){ return (window.currentUser||{}).classId || window.__viewClassId || null; };
window.mySid = function(){ return (window.currentUser||{}).studentId || null; };
window.myName = function(){ return (window.currentUser||{}).name || ''; };
window.getDivisionOfRole = function(role){ var r=window.ROLES[role]; return r?r.team:'produksi'; };
window.myClasses = function(){
  if(!window.currentUser) return [];
  if(window.currentUser.type==='admin') return window.DB.classes.slice();
  if(window.currentUser.type==='guru'){
    var em = String(window.currentUser.email||'').toLowerCase();
    return window.DB.classes.filter(function(c){ return c.teacherEmail && String(c.teacherEmail).toLowerCase()===em; });
  }
  if(window.currentUser.type==='siswa') return window.DB.classes.filter(function(c){ return c.id===window.currentUser.classId; });
  return [];
};
window.ownsClass = function(cid){
  if(!window.currentUser) return false;
  if(window.currentUser.type==='admin') return true;
  if(window.currentUser.type==='guru'){
    var c = window.DB.classes.find(function(x){ return x.id===cid; });
    return !!(c && String(c.teacherEmail||'').toLowerCase()===String(window.currentUser.email||'').toLowerCase());
  }
  if(window.currentUser.type==='siswa') return window.currentUser.classId===cid;
  return false;
};
window.logAct = function(type,msg,meta){
  var a = { id:window.U.uid(), type:type||'info', message:msg||'', meta:meta||{},
    classId:(meta&&meta.classId)||(window.currentUser&&window.currentUser.classId)||'',
    userId:(window.currentUser&&(window.currentUser.studentId||window.currentUser.email))||'system',
    userName:window.currentUser?window.currentUser.name:'System', createdAt:Date.now() };
  window.fsSet('activity_logs',a.id,a);
};

/* ============================================================
   ICONS
   ============================================================ */
var ICONS = {
  sun:'<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  key:'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  clipboard:'<path d="M9 4h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  checkSquare:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
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
  sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
  school:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  chevronRight:'<polyline points="9 18 15 12 9 6"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  messageCircle:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'
};
function svgIco(name,size){
  var path = ICONS[name] || ICONS.info;
  size = size||16;
  if(size==='sm') size=13; else if(size==='lg') size=20;
  else if(typeof size!=='number') size=16;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" '+
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '+
    'style="display:inline-block;vertical-align:-3px;flex-shrink:0;width:'+size+'px;height:'+size+'px;">'+
    path+'</svg>';
}
window.ico = svgIco;

/* ============================================================
   MODAL + TOAST
   ============================================================ */
window.openModal = function(title,body){
  var m = document.getElementById('modal'); if(!m) return;
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML = body;
  m.classList.remove('hidden');
  setTimeout(function(){
    document.querySelectorAll('#modal-body .pw-toggle').forEach(function(b){
      if(!b.querySelector('svg')) b.innerHTML = window.ico('eye',16);
    });
  },20);
};
window.closeModal = function(){
  var m = document.getElementById('modal'); if(m) m.classList.add('hidden');
};
window.toast = function(msg,type){
  type = type||'info';
  var bg = type==='success'?'var(--success)':type==='error'?'var(--danger)':
           type==='warning'?'var(--warning)':'var(--primary)';
  var t = document.createElement('div'); t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);'+
    'background:'+bg+';color:#fff;padding:12px 22px;border-radius:10px;font-size:13px;'+
    'font-weight:600;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center;';
  document.body.appendChild(t);
  setTimeout(function(){
    t.style.transition='opacity .3s,transform .3s'; t.style.opacity='0';
    t.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(function(){ t.remove(); },300);
  },2400);
};
document.addEventListener('click',function(e){
  if(e.target && e.target.id==='modal') window.closeModal();
});
document.addEventListener('DOMContentLoaded',function(){
  var cb = document.getElementById('modal-close');
  if(cb){ cb.innerHTML = window.ico('x',18); cb.addEventListener('click',window.closeModal); }
});
document.addEventListener('click',function(e){
  var btn = e.target.closest('.pw-toggle');
  if(!btn) return;
  var id = btn.getAttribute('data-target'); if(!id) return;
  var inp = document.getElementById(id); if(!inp) return;
  var isPw = inp.type==='password';
  inp.type = isPw?'text':'password';
  btn.innerHTML = window.ico(isPw?'eyeOff':'eye',16);
});

/* ============================================================
   NOTIF PANEL
   ============================================================ */
function getMyKey(){
  if(!window.currentUser) return null;
  if(window.currentUser.type==='siswa') return window.currentUser.studentId;
  if(window.currentUser.type==='guru') return 'guru:'+window.U.normEmail(window.currentUser.email);
  return 'admin';
}
function getNotifsFor(user){
  if(!user) return [];
  if(user.type==='siswa'){
    return (window.DB.notifications||[]).filter(function(n){
      if(n.classId!==user.classId) return false;
      if(n.toId==='all') return true;
      if(n.toId===user.studentId) return true;
      if(n.recipientIds && n.recipientIds.indexOf(user.studentId)>=0) return true;
      return false;
    });
  }
  if(user.type==='guru'){
    var ids = window.myClasses().map(function(c){ return c.id; });
    return (window.DB.notifications||[]).filter(function(n){ return n.classId && ids.indexOf(n.classId)>=0; });
  }
  return (window.DB.notifications||[]).slice();
}
window.updateNotifBadge = function(){
  var b = document.querySelector('#btn-notif .notif-badge');
  if(!b) return;
  if(!window.currentUser){ b.classList.add('hidden'); return; }
  var key = getMyKey();
  var n = getNotifsFor(window.currentUser).filter(function(x){
    return !(x.readBy && x.readBy.indexOf(key)>=0);
  }).length;
  if(n>0){ b.textContent = n>99?'99+':n; b.classList.remove('hidden'); }
  else b.classList.add('hidden');
};
window.renderNotifPanel = function(){
  var body = document.getElementById('notif-body'); if(!body) return;
  var notifs = getNotifsFor(window.currentUser).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
  if(notifs.length===0){
    body.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">'+
      window.ico('bell',48)+'<p style="margin-top:12px;">Belum ada notifikasi</p></div>';
    return;
  }
  var key = getMyKey(), h = '';
  notifs.slice(0,100).forEach(function(n){
    var isRead = n.readBy && n.readBy.indexOf(key)>=0;
    var tl = {tugas:'Tugas',instruksi:'Instruksi',info:'Info',urgent:'Penting'}[n.type]||'Info';
    var tc = {tugas:'info',instruksi:'primary',info:'success',urgent:'danger'}[n.type]||'gray';
    h += '<div class="notif-item '+(isRead?'':'unread')+'">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;">'+
        '<span class="badge badge-'+tc+'">'+tl+'</span>'+
        '<span style="font-size:11px;color:var(--text-muted);">'+window.U.fmtDate(n.createdAt)+'</span>'+
      '</div>'+
      '<div style="font-weight:700;font-size:13.5px;margin-bottom:6px;">'+window.U.esc(n.title||'Notifikasi')+'</div>'+
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">Dari: <b>'+window.U.esc(n.fromName||'Guru')+'</b></div>'+
      '<div style="font-size:12.5px;line-height:1.6;margin-bottom:10px;white-space:pre-wrap;">'+window.U.esc(n.message||'')+'</div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
        (isRead?'<span class="badge badge-success">'+window.ico('check','sm')+' Dibaca</span>':
          '<button class="btn btn-sm" onclick="window.markNotifRead(\''+n.id+'\')">'+window.ico('check','sm')+' Dibaca</button>')+
        '<button class="btn btn-sm btn-danger" onclick="window.deleteNotif(\''+n.id+'\')">'+window.ico('trash','sm')+'</button>'+
      '</div></div>';
  });
  body.innerHTML = h;
};
window.openNotifPanel = function(){
  document.getElementById('notif-panel').classList.add('open');
  document.getElementById('notif-backdrop').classList.add('open');
  window.renderNotifPanel();
};
window.closeNotifPanel = function(){
  document.getElementById('notif-panel').classList.remove('open');
  document.getElementById('notif-backdrop').classList.remove('open');
};
window.markNotifRead = function(id){
  var n = (window.DB.notifications||[]).find(function(x){ return x.id===id; });
  if(!n) return;
  var key = getMyKey(), rb = (n.readBy||[]).slice();
  if(rb.indexOf(key)<0) rb.push(key);
  window.fsSet('notifications',id,Object.assign({},n,{readBy:rb})).then(function(){
    window.updateNotifBadge(); window.renderNotifPanel();
  });
};
window.deleteNotif = function(id){
  if(!confirm('Hapus notifikasi ini?')) return;
  window.fsDel('notifications',id).then(function(){
    window.updateNotifBadge(); window.renderNotifPanel();
  });
};
document.addEventListener('DOMContentLoaded',function(){
  var b = document.getElementById('btn-notif');
  if(b){ b.innerHTML = window.ico('bell',18)+b.innerHTML; b.addEventListener('click',window.openNotifPanel); }
  var cb = document.getElementById('btn-close-notif');
  if(cb){ cb.innerHTML = window.ico('x',18); cb.addEventListener('click',window.closeNotifPanel); }
  var bd = document.getElementById('notif-backdrop');
  if(bd) bd.addEventListener('click',window.closeNotifPanel);
});

/* ============================================================
   THEME (AUTO + MANUAL)
   ============================================================ */
window.__getPreferredTheme = function(){
  var saved = window.U.getLS('sppt_theme');
  if(saved === 'dark' || saved === 'light') return saved;
  try{
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }catch(e){}
  return 'light';
};
window.__applyTheme = function(t){
  document.documentElement.setAttribute('data-theme', t);
  var meta = document.getElementById('meta-theme-color');
  if(meta) meta.setAttribute('content', t==='dark' ? '#0f172a' : '#f8f9fa');
  var btn = document.getElementById('btn-theme');
  if(btn) btn.innerHTML = window.ico(t==='dark'?'sun':'moon', 18);
};
window.__toggleTheme = function(){
  var cur = document.documentElement.getAttribute('data-theme') || 'light';
  var next = cur === 'dark' ? 'light' : 'dark';
  window.U.setLS('sppt_theme', next);
  window.__applyTheme(next);
};

(function(){
  var t = window.__getPreferredTheme();
  document.documentElement.setAttribute('data-theme', t);
})();

try{
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var mqHandler = function(e){
    if(!window.U.getLS('sppt_theme')){
      window.__applyTheme(e.matches ? 'dark' : 'light');
    }
  };
  if(mq.addEventListener) mq.addEventListener('change', mqHandler);
  else if(mq.addListener) mq.addListener(mqHandler);
}catch(e){}

/* ============================================================
   TOOLBAR + MENU
   ============================================================ */
window.injectToolbar = function(){
  var mc = document.getElementById('main-content');
  if(!mc || !window.currentUser) return;
  var ex = mc.querySelector('.toolbar-main'); if(ex) ex.remove();
  var h = '';
  if(window.myType()==='siswa') h = toolbarSiswa();
  else if(window.myType()==='guru') h = toolbarGuru();
  else if(window.myType()==='admin') h = toolbarAdmin();
  if(!h) return;
  var w = document.createElement('div'); w.innerHTML = h;
  var tb = w.firstElementChild;
  if(mc.firstChild) mc.insertBefore(tb,mc.firstChild); else mc.appendChild(tb);
};
function toolbarSiswa(){
  var role = window.myRole();
  var isKoor = role.indexOf('koor_')===0;
  var isPimpro = role==='pimpinan_produksi';
  var isSutradara = role==='sutradara';
  var isSekretaris = role==='sekretaris';
  var h = '<div class="toolbar-main" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;'+
    'background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(59,130,246,.04));'+
    'border-left:4px solid var(--primary);border-radius:10px;margin-bottom:14px;">';
  h += '<button class="btn btn-primary" data-action="openTugasSaya">'+window.ico('clipboard')+' Tugas Saya</button>';
  h += '<button class="btn" data-action="openTimSaya">'+window.ico('users')+' Tim Saya</button>';
  h += '<button class="btn" data-action="openDokumenSaya">'+window.ico('folder')+' Dokumen</button>';
  h += '<button class="btn" data-action="openAbsensiHariIni">'+window.ico('calendar')+' Absensi</button>';
  h += '<button class="btn" data-action="openBeriTugas">'+window.ico('send')+' Beri Tugas + WA</button>';
  h += '<button class="btn" data-action="openRubrikPenilaian">'+window.ico('target')+' Rubrik</button>';
  h += '<button class="btn" data-action="openArsipNaskah">'+window.ico('book')+' Naskah</button>';
  if(isPimpro||isSekretaris) h += '<button class="btn" data-action="openCreateMeetingModalFull" data-arg="rapat">'+window.ico('calendar')+' Absen Rapat</button>';
  if(isSutradara) h += '<button class="btn" data-action="openCreateMeetingModalFull" data-arg="latihan">'+window.ico('calendar')+' Absen Latihan</button>';
  if(isPimpro||isSutradara||role==='koor_musik'||role==='koor_perlengkapan')
    h += '<button class="btn" data-action="openBookingAlatMusik">'+window.ico('music')+' Booking Alat</button>';
  if(['asisten_sutradara','koor_musik','koor_perlengkapan','pimpinan_produksi','sutradara','sekretaris'].indexOf(role)>=0)
    h += '<button class="btn" data-action="openKoordinasiAntarKelas">'+window.ico('messageCircle')+' Koordinasi</button>';
  if(isKoor||isPimpro||isSutradara)
    h += '<button class="btn" data-action="openChecklistView">'+window.ico('checkSquare')+' Checklist Tim</button>';
  h += '<button class="btn" data-action="openMainMenu">'+window.ico('gear')+' Menu</button>';
  h += '</div>';
  return h;
}
function toolbarGuru(){
  return '<div class="toolbar-main" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;'+
    'background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(59,130,246,.04));'+
    'border-left:4px solid var(--primary);border-radius:10px;margin-bottom:14px;">'+
    '<button class="btn btn-primary" data-action="openMainMenu">'+window.ico('gear')+' Menu</button>'+
    '<button class="btn" data-action="openArsipNaskah">'+window.ico('book')+' Naskah</button>'+
    '<button class="btn" data-action="openActivityLog">'+window.ico('activity')+' Log</button>'+
    '<button class="btn" data-action="refreshDashboard">'+window.ico('activity')+' Refresh</button></div>';
}
function toolbarAdmin(){
  return '<div class="toolbar-main" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;'+
    'background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(59,130,246,.04));'+
    'border-left:4px solid var(--primary);border-radius:10px;margin-bottom:14px;">'+
    '<button class="btn btn-primary" data-action="openMainMenu">'+window.ico('gear')+' Menu</button>'+
    '<button class="btn" data-action="openAddTeacher">'+window.ico('plus')+' Tambah Guru</button>'+
    '<button class="btn" data-action="openActivityLog">'+window.ico('activity')+' Log</button>'+
    '<button class="btn" data-action="refreshDashboard">'+window.ico('activity')+' Refresh</button></div>';
}

window.refreshDashboard = function(){
  try{ window.renderDashboard && window.renderDashboard(); window.toast('Dashboard diperbarui','success'); }
  catch(e){ window.toast('Gagal refresh','error'); }
};

document.addEventListener('click',function(e){
  var el = e.target.closest('[data-action]'); if(!el) return;
  var action = el.getAttribute('data-action');
  var arg = el.getAttribute('data-arg');
  var cf = el.hasAttribute('data-close-first');
  if(cf) window.closeModal();
  var fn = window[action];
  if(typeof fn!=='function'){ console.warn('[toolbar] Fungsi tidak ditemukan:',action); return; }
  e.preventDefault();
  setTimeout(function(){
    try{ if(arg!==null&&arg!==undefined) fn(arg); else fn(); }
    catch(err){ console.error('[toolbar]',action,err); window.toast('Gagal: '+err.message,'error'); }
  },cf?150:0);
});

window.openMainMenu = function(){
  if(window.myType()==='admin') return openAdminMenu();
  if(window.myType()==='guru') return openGuruMenu();
  return openSiswaMenu();
};
function openSiswaMenu(){
  var h = '<div class="alert alert-info">'+window.ico('gear')+'<div><b>Menu Siswa</b></div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;">';
  var items = [
    {i:'clipboard',l:'Checklist Pribadi',a:'openStudentChecklistSelf'},
    {i:'users',l:'Checklist Tim',a:'openChecklistView'},
    {i:'folder',l:'Dokumen Saya',a:'openDokumenSaya'},
    {i:'book',l:'Arsip Naskah',a:'openArsipNaskah'},
    {i:'target',l:'Rubrik Penilaian',a:'openRubrikPenilaian'},
    {i:'calendar',l:'Absensi Hari Ini',a:'openAbsensiHariIni'},
    {i:'send',l:'Beri Tugas + WA',a:'openBeriTugas'},
    {i:'messageCircle',l:'Koordinasi Antar Kelas',a:'openKoordinasiAntarKelas'},
    {i:'music',l:'Booking Alat Musik',a:'openBookingAlatMusik'},
    {i:'clock',l:'Deadline Saya',a:'openDeadlineList'},
    {i:'key',l:'Ubah Password',a:'openChangePassword'},
    {i:'logout',l:'Keluar',a:'logoutConfirm'}
  ];
  items.forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;" data-action="'+it.a+'" data-close-first>'+
      window.ico(it.i)+' '+it.l+'</button>';
  });
  h += '</div>';
  window.openModal('Menu',h);
}
function openGuruMenu(){
  var h = '<div class="alert alert-info">'+window.ico('gear')+'<div><b>Menu Guru</b></div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;">';
  [{i:'book',l:'Arsip Naskah',a:'openArsipNaskah'},
   {i:'activity',l:'Log Aktivitas',a:'openActivityLog'},
   {i:'key',l:'Ubah Password',a:'openChangePassword'},
   {i:'logout',l:'Keluar',a:'logoutConfirm'}]
  .forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;" data-action="'+it.a+'" data-close-first>'+
      window.ico(it.i)+' '+it.l+'</button>';
  });
  h += '</div>';
  window.openModal('Menu Guru',h);
}
function openAdminMenu(){
  var h = '<div class="alert alert-info">'+window.ico('gear')+'<div><b>Menu Admin</b></div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px;">';
  [{i:'plus',l:'Tambah Guru',a:'openAddTeacher'},{i:'activity',l:'Log Aktivitas',a:'openActivityLog'},
   {i:'key',l:'Ubah Password',a:'openChangePassword'},{i:'logout',l:'Keluar',a:'logoutConfirm'}]
  .forEach(function(it){
    h += '<button class="btn" style="justify-content:flex-start;" data-action="'+it.a+'" data-close-first>'+
      window.ico(it.i)+' '+it.l+'</button>';
  });
  h += '</div>';
  window.openModal('Menu Admin',h);
}
window.openKelolaChecklistFromMenu = function(){
  var cid = window.__viewClassId;
  if(!cid){ window.toast('Buka kelas terlebih dahulu','warning'); return; }
  window.openChecklistManage(cid);
};
window.openTugasSaya = function(){
  var cid = window.myCid(); if(!cid) return;
  var ch = window.getChecklist(cid);
  var myRole = window.myRole();
  var items = (ch.items||[]).filter(function(it){ return !it.isPersonal && it.assignedRole===myRole; });
  var done = items.filter(function(x){ return x.done; }).length;
  var pct = items.length>0 ? Math.round(done/items.length*100) : 0;
  var h = '<div class="alert alert-info">'+window.ico('clipboard')+
    '<div><b>Tugas Saya</b> — '+window.U.esc((window.ROLES[myRole]||{}).label||myRole)+'</div></div>';
  if(items.length>0){
    h += '<div class="progress-container"><div class="progress-bar '+
      (pct===100?'complete':pct>0?'partial':'')+'" style="width:'+pct+'%"></div></div>'+
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">'+done+' / '+items.length+' selesai</div>';
  }
  if(items.length===0){
    h += '<div class="empty-state">'+window.ico('clipboard',40)+'<p>Belum ada tugas untuk peran Anda.</p></div>';
  } else {
    items.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;">'+
        '<input type="checkbox" '+(it.done?'checked':'')+' disabled>'+
        '<div style="flex:1;font-size:13px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+
          window.U.esc(it.name)+'</div></div>';
    });
  }
  window.openModal('Tugas Saya',h);
};
window.openTimSaya = function(){ window.openChecklistView(); };
window.openDeadlineList = function(){
  var cid = window.myCid(), sid = window.mySid();
  var arr = (window.DB.notifications||[]).filter(function(n){
    if(n.classId!==cid || n.type!=='tugas') return false;
    return n.toId==='all' || n.toId===sid;
  }).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
  var h = '<div class="alert alert-info">'+window.ico('clock')+'<div>Tugas & deadline</div></div>';
  if(arr.length===0){
    h += '<div class="empty-state">'+window.ico('clock',40)+'<p>Tidak ada deadline aktif.</p></div>';
  } else {
    arr.forEach(function(n){
      h += '<div style="background:var(--surface);padding:10px 12px;border-radius:8px;margin-bottom:8px;border-left:3px solid var(--warning);">'+
        '<div style="font-weight:700;font-size:13px;">'+window.U.esc(n.title)+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">'+window.U.esc(n.fromName||'')+' · '+window.U.fmtDate(n.createdAt)+'</div>'+
        (n.message?'<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">'+window.U.esc(n.message)+'</div>':'')+
      '</div>';
    });
  }
  window.openModal('Deadline Saya',h);
};
window.openChangePassword = function(){
  window.openModal('Ubah Password',
    '<div class="form-group"><label>Password Lama</label><input type="password" id="cp-old"></div>'+
    '<div class="form-group"><label>Password Baru</label><input type="password" id="cp-new"></div>'+
    '<div class="form-group"><label>Konfirmasi</label><input type="password" id="cp-confirm"></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveChangePassword">'+window.ico('save')+' Simpan</button>');
};
window.saveChangePassword = function(){ window.toast('Fitur segera hadir','info'); window.closeModal(); };
window.logoutConfirm = function(){
  if(!confirm('Keluar dari aplikasi?')) return;
  window.currentUser = null; window.clearSession();
  window.closeModal(); window.showLogin();
};
window.openActivityLog = function(){
  var logs = window.DB.activityLogs||[];
  var h = '<div style="max-height:500px;overflow-y:auto;">';
  if(logs.length===0){
    h += '<div class="empty-state">'+window.ico('activity',40)+'<p>Belum ada log.</p></div>';
  } else {
    logs.slice(0,50).forEach(function(l){
      h += '<div style="padding:10px;border-bottom:1px solid var(--border);">'+
        '<div style="font-size:12.5px;">'+window.U.esc(l.message)+'</div>'+
        '<div style="font-size:11px;color:var(--text-muted);margin-top:3px;">'+window.U.esc(l.userName)+' · '+window.U.fmtDate(l.createdAt)+'</div>'+
      '</div>';
    });
  }
  h += '</div>';
  window.openModal('Log Aktivitas',h);
};
window.openAddTeacher = function(){
  window.openModal('Tambah Guru',
    '<div class="form-group"><label>Nama</label><input id="t-name"></div>'+
    '<div class="form-group"><label>Email</label><input type="email" id="t-email"></div>'+
    '<div class="form-group"><label>Password</label><input type="password" id="t-pw"></div>'+
    '<button class="btn btn-primary btn-block" data-action="doAddTeacher">'+window.ico('save')+' Simpan</button>');
};
window.doAddTeacher = function(){
  var name = window.U.trim(document.getElementById('t-name').value);
  var email = window.U.normEmail(document.getElementById('t-email').value);
  var pw = window.U.trim(document.getElementById('t-pw').value);
  if(!name||!email||!pw){ window.toast('Lengkapi','warning'); return; }
  if(pw.length<6){ window.toast('Password min 6','error'); return; }
  window.fsSet('teachers',email,{name:name,email:email,password:pw}).then(function(){
    window.toast('Guru ditambahkan','success'); window.closeModal();
  });
};
window.openGuruPasswordView = function(cid){
  cid = cid || window.__viewClassId;
  if(!cid){ window.toast('Buka kelas dulu','warning'); return; }
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return;
  var h = '<div class="alert alert-warning">'+window.ico('warning')+'<div><b>RAHASIA</b> — jangan sebarkan</div></div>'+
    '<input type="text" id="pwd-search" style="width:100%;padding:10px;margin-bottom:10px;" placeholder="Cari..." oninput="window.__renderPwdTable()">'+
    '<div id="pwd-table"></div>';
  window.openModal('Password Siswa — '+c.name,h);
  window.__viewClassId = cid;
  setTimeout(window.__renderPwdTable,100);
};
window.__renderPwdTable = function(){
  var cid = window.__viewClassId;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return;
  var q = (document.getElementById('pwd-search')||{}).value||''; q = q.toLowerCase().trim();
  var students = (c.students||[]);
  if(q) students = students.filter(function(s){
    return (s.name||'').toLowerCase().indexOf(q)>=0 || (s.email||'').toLowerCase().indexOf(q)>=0 || (s.phone||'').indexOf(q)>=0;
  });
  var wrap = document.getElementById('pwd-table'); if(!wrap) return;
  if(students.length===0){ wrap.innerHTML = '<div class="empty-state"><p>Tidak ada</p></div>'; return; }
  var h = '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Password</th><th>Aksi</th></tr></thead><tbody>';
  students.forEach(function(s,i){
    h += '<tr><td>'+(i+1)+'</td><td><b>'+window.U.esc(s.name)+'</b></td>'+
      '<td><code style="background:var(--warning-soft);padding:3px 8px;border-radius:4px;">'+window.U.esc(s.password)+'</code></td>'+
      '<td><button class="btn btn-sm" onclick="window.__copyPwd(\''+window.U.esc(s.password)+'\')">'+window.ico('copy','sm')+'</button></td></tr>';
  });
  h += '</tbody></table></div>';
  wrap.innerHTML = h;
};
window.__copyPwd = function(pwd){
  if(navigator.clipboard) navigator.clipboard.writeText(pwd).then(function(){ window.toast('Disalin','success'); });
  else prompt('Copy:',pwd);
};

/* ============================================================
   AUTH
   ============================================================ */
var ADMIN = { email:'fikri.yassaar15@guru.smp.belajar.id', password:'#Smpn10smd', name:'Fikri Yassaar (Admin)' };

document.addEventListener('click',function(e){
  var tab = e.target.closest('.tab'); if(!tab) return;
  var name = tab.getAttribute('data-tab'); if(!name) return;
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.toggle('active',t===tab); });
  ['guru','siswa','admin'].forEach(function(x){
    var f = document.getElementById('form-login-'+x);
    if(f) f.classList.toggle('hidden',x!==name);
  });
});

document.addEventListener('DOMContentLoaded',function(){
  /* ---------- LOGIN GURU ---------- */
  var fg = document.getElementById('form-login-guru');
  if(fg) fg.addEventListener('submit',function(e){
    e.preventDefault();
    var email = window.U.normEmail(document.getElementById('guru-email').value);
    var pw = String(document.getElementById('guru-password').value||'').trim();
    if(!email||!pw){ window.toast('Lengkapi email & password','warning'); return; }
    var t = (window.DB.teachers||[]).find(function(x){
      return window.U.normEmail(x.email)===email && String(x.password).trim()===pw;
    });
    if(!t){
      if(window.fbReady){
        window.fsGet('teachers',email).then(function(snap){
          if(snap.exists){
            var td = snap.data();
            if(String(td.password||'').trim() === pw){
              window.currentUser = { type:'guru', email:td.email||email, name:td.name||email };
              window.saveSession(); window.logAct('login',(td.name||email)+' login',{});
              window.showApp(); return;
            }
          }
          window.toast('Email atau password salah','error');
        }).catch(function(){ window.toast('Email atau password salah','error'); });
      } else {
        window.toast('Email atau password salah','error');
      }
      return;
    }
    window.currentUser = { type:'guru', email:t.email, name:t.name };
    window.saveSession(); window.logAct('login',t.name+' login',{});
    window.showApp();
  });

  /* ---------- LOGIN SISWA ---------- */
  var fs = document.getElementById('form-login-siswa');
  if(fs) fs.addEventListener('submit',function(e){
    e.preventDefault();
    var cid = document.getElementById('siswa-kelas').value;
    var inp = String(document.getElementById('siswa-login').value||'').trim();
    var pw = String(document.getElementById('siswa-password').value||'').trim();
    if(!cid){ window.toast('Pilih kelas dulu','warning'); return; }
    if(!inp){ window.toast('Email/WA wajib diisi','warning'); return; }
    if(!pw){ window.toast('Password wajib diisi','warning'); return; }
    var btn = fs.querySelector('button[type="submit"]');
    var orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Memeriksa...';
    function finish(s,c){
      btn.disabled = false; btn.innerHTML = orig;
      if(!s){ window.toast('Email/WA atau password salah','error'); return; }
      window.currentUser = { type:'siswa', classId:c.id, studentId:s.id,
        name:window.U.trim(s.name), role:s.role, phone:window.U.normPhone(s.phone), email:window.U.normEmail(s.email) };
      window.saveSession(); window.logAct('login',s.name+' login',{classId:c.id});
      window.showApp();
    }
    var isEmail = inp.indexOf('@')>=0;
    var emailL = inp.toLowerCase(), phoneC = window.U.normPhone(inp), pwL = pw.toLowerCase();
    function match(s){
      if(!s||!s.name||!s.password) return false;
      var sp = String(s.password).trim();
      if(sp!==pw && sp.toLowerCase()!==pwL) return false;
      if(isEmail) return window.U.normEmail(s.email)===emailL;
      return window.U.normPhone(s.phone)===phoneC;
    }
    var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
    if(c && c.students){ var f = c.students.find(match); if(f){ finish(f,c); return; } }
    if(window.fbReady){
      window.fsGet('classes',cid).then(function(snap){
        if(!snap.exists){ finish(null,null); return; }
        var fresh = snap.data(); fresh.id = cid;
        var idx = (window.DB.classes||[]).findIndex(function(x){ return x.id===cid; });
        if(idx>=0) window.DB.classes[idx] = fresh; else window.DB.classes.push(fresh);
        var s = (fresh.students||[]).find(match);
        finish(s||null,fresh);
      }).catch(function(){ finish(null,null); });
    } else finish(null,null);
  });

  /* ---------- LOGIN ADMIN ---------- */
  var fa = document.getElementById('form-login-admin');
  if(fa) fa.addEventListener('submit',function(e){
    e.preventDefault();
    var email = window.U.normEmail(document.getElementById('admin-email').value);
    var pw = String(document.getElementById('admin-password').value||'').trim();
    if(email===ADMIN.email && pw===ADMIN.password){
      window.currentUser = { type:'admin', email:ADMIN.email, name:ADMIN.name };
      window.saveSession(); window.showApp();
    } else window.toast('Email atau password admin salah','error');
  });

  /* ---------- REGISTER SISWA ---------- */
  var fr = document.getElementById('form-register');
  if(fr){
    var sel = document.getElementById('reg-role');
    if(sel){
      var groups = {
        'Pengurus Inti':['pimpinan_produksi','sutradara','asisten_sutradara','sekretaris','bendahara'],
        'Koor Produksi':['koor_publikasi','koor_perlengkapan','koor_akomodasi'],
        'Koor Artistik':['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'],
        'Anggota Produksi':['anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'],
        'Anggota Artistik':['anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
        'Pemeran':['pemain']
      };
      var opts = '';
      Object.keys(groups).forEach(function(g){
        opts += '<optgroup label="'+g+'">';
        groups[g].forEach(function(r){ opts += '<option value="'+r+'">'+window.ROLES[r].label+'</option>'; });
        opts += '</optgroup>';
      });
      sel.innerHTML = opts;
    }
    fr.addEventListener('submit',function(e){
      e.preventDefault();
      var code = window.U.trim(document.getElementById('reg-code').value).toUpperCase();
      var name = window.U.trim(document.getElementById('reg-name').value);
      var email = window.U.normEmail(document.getElementById('reg-email').value);
      var phone = window.U.normPhone(document.getElementById('reg-phone').value);
      var pw = String(document.getElementById('reg-password').value||'').trim();
      var cf = String(document.getElementById('reg-confirm').value||'').trim();
      var role = document.getElementById('reg-role').value;
      if(!code||!name||!email||!phone||!pw||!cf||!role){ window.toast('Lengkapi semua field','warning'); return; }
      if(phone.length<10||phone.length>15){ window.toast('No. WA tidak valid','error'); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ window.toast('Email tidak valid','error'); return; }
      if(pw.length<6){ window.toast('Password min 6 karakter','error'); return; }
      if(pw!==cf){ window.toast('Konfirmasi password tidak cocok','error'); return; }
      var cls = (window.DB.classes||[]).find(function(c){ return c.code===code; });
      if(!cls){ window.toast('Kode kelas tidak valid','error'); return; }
      var dupE = (window.DB.classes||[]).some(function(c){ return (c.students||[]).some(function(s){ return window.U.normEmail(s.email)===email; }); });
      if(dupE){ window.toast('Email sudah terdaftar','error'); return; }
      var dupP = (window.DB.classes||[]).some(function(c){ return (c.students||[]).some(function(s){ return window.U.normPhone(s.phone)===phone; }); });
      if(dupP){ window.toast('No. WA sudah terdaftar','error'); return; }
      var ns = { id:window.U.uid(), name:name, email:email, phone:phone, password:pw, role:role, registeredAt:Date.now() };
      var newStudents = (cls.students||[]).concat([ns]);
      window.fsSet('classes',cls.id,Object.assign({},cls,{students:newStudents})).then(function(){
        window.toast('Pendaftaran berhasil! Silakan login.','success');
        document.getElementById('siswa-kelas').value = cls.id;
        document.getElementById('siswa-login').value = email;
        window.showLogin();
        document.querySelector('.tab[data-tab="siswa"]').click();
      }).catch(function(err){ window.toast('Gagal: '+err.message,'error'); });
    });
  }
});

/* ============================================================
   SHOW / HIDE SCREENS
   ============================================================ */
window.showLogin = function(){
  var ld = document.getElementById('loading'); if(ld) ld.style.display = 'none';
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('register-screen').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
};
window.showRegister = function(){
  var ld = document.getElementById('loading'); if(ld) ld.style.display = 'none';
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
};
document.addEventListener('click',function(e){
  if(e.target.id==='link-register'){ e.preventDefault(); window.showRegister(); }
  if(e.target.id==='link-login'){ e.preventDefault(); window.showLogin(); }
});

/* ============================================================
   DATA LISTENERS (Firestore → window.DB)
   ============================================================ */
function populateClassDropdown(){
  var sel = document.getElementById('siswa-kelas');
  if(!sel) return;
  var cur = sel.value;
  sel.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  (window.DB.classes||[]).forEach(function(c){
    var o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.name || c.id;
    sel.appendChild(o);
  });
  if(cur) sel.value = cur;
}
window.__populateClassDropdown = populateClassDropdown;

function startRealtime(){
  if(!window.fbReady){
    console.warn('[realtime] Firebase belum siap:', window.fbError);
    return;
  }
  try{
    window.fb.collection('teachers').onSnapshot(function(snap){
      window.DB.teachers = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      console.log('[teachers] loaded:', window.DB.teachers.length);
    }, function(e){ console.warn('[teachers]', e.message); });

    window.fb.collection('classes').onSnapshot(function(snap){
      window.DB.classes = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      console.log('[classes] loaded:', window.DB.classes.length);
      populateClassDropdown();
      // refresh dashboard kalau user sedang login
      if(window.currentUser && typeof window.renderDashboard === 'function'){
        try{ window.renderDashboard(); }catch(e){}
      }
    }, function(e){ console.warn('[classes]', e.message); });

    window.fb.collection('notifications').onSnapshot(function(snap){
      window.DB.notifications = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      if(window.currentUser) window.updateNotifBadge();
    }, function(e){ console.warn('[notif]', e.message); });

    window.fb.collection('checklists').onSnapshot(function(snap){
      window.DB.checklists = {};
      snap.docs.forEach(function(d){ window.DB.checklists[d.id] = d.data(); });
    }, function(e){ console.warn('[checklists]', e.message); });

    window.fb.collection('meetings').onSnapshot(function(snap){
      window.DB.meetings = {};
      snap.docs.forEach(function(d){ window.DB.meetings[d.id] = Object.assign({id:d.id}, d.data()); });
    }, function(e){ console.warn('[meetings]', e.message); });

    window.fb.collection('activity_logs').orderBy('createdAt','desc').limit(100)
      .onSnapshot(function(snap){
        window.DB.activityLogs = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      }, function(e){ /* index belum siap — abaikan */ });
  } catch(e){ console.error('[realtime]', e); }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
window.renderDashboard = function(){
  var mc = document.getElementById('main-content');
  if(!mc) return;
  var old = mc.querySelector('.dashboard-wrap');
  if(old) old.remove();

  var type = window.myType();
  var h = '';
  if(type === 'guru' || type === 'admin')  h = buildGuruAdminDashboard();
  else if(type === 'siswa')                h = buildSiswaDashboard();
  else return;

  var wrap = document.createElement('div');
  wrap.className = 'dashboard-wrap';
  wrap.style.marginBottom = '16px';
  wrap.innerHTML = h;

  // Sisipkan setelah toolbar (kalau ada), atau di awal
  var toolbar = mc.querySelector('.toolbar-main');
  if(toolbar && toolbar.nextSibling){
    mc.insertBefore(wrap, toolbar.nextSibling);
  } else if(toolbar){
    mc.appendChild(wrap);
  } else {
    mc.insertBefore(wrap, mc.firstChild);
  }
};

function statCard(icon, label, value, color){
  var colorMap = {
    primary:'var(--primary)', success:'var(--success)',
    warning:'var(--warning)', info:'var(--info)', danger:'var(--danger)'
  };
  var softMap = {
    primary:'var(--primary-soft)', success:'var(--success-soft)',
    warning:'var(--warning-soft)', info:'var(--info-soft)', danger:'var(--danger-soft)'
  };
  return '<div class="card" style="margin:0;display:flex;align-items:center;gap:12px;">'+
    '<div style="width:48px;height:48px;border-radius:12px;background:'+softMap[color]+';'+
      'display:flex;align-items:center;justify-content:center;color:'+colorMap[color]+';flex-shrink:0;">'+
      window.ico(icon,22)+
    '</div>'+
    '<div style="flex:1;min-width:0;">'+
      '<div style="font-size:11.5px;color:var(--text-muted);font-weight:600;'+
        'text-transform:uppercase;letter-spacing:.04em;">'+label+'</div>'+
      '<div style="font-size:22px;font-weight:800;color:var(--text-strong);line-height:1.1;margin-top:2px;">'+
        value+'</div>'+
    '</div></div>';
}

function buildGuruAdminDashboard(){
  var type = window.myType();
  var isAdmin = type === 'admin';
  var classes = isAdmin ? (window.DB.classes||[]) : window.myClasses();
  var totalSiswa = 0;
  classes.forEach(function(c){ totalSiswa += (c.students||[]).length; });

  var h = '<div class="alert alert-info" style="margin-bottom:16px;">'+
    window.ico('info')+'<div>'+
    '<b>Selamat datang, '+window.U.esc(window.myName())+'!</b><br>'+
    (isAdmin
      ? 'Anda login sebagai <b>Admin</b>. Kelola semua kelas di sistem ini.'
      : 'Berikut ringkasan kelas yang Anda ajar. Klik kelas untuk melihat detail.')+
    '</div></div>';

  h += '<div class="grid" style="margin-bottom:18px;">';
  h += statCard('school','Total Kelas', classes.length, 'primary');
  h += statCard('users','Total Siswa', totalSiswa, 'success');
  h += statCard('clipboard','Checklist',
    Object.keys(window.DB.checklists||{}).length, 'warning');
  h += statCard('bell','Notifikasi',
    (window.DB.notifications||[]).length, 'info');
  h += '</div>';

  h += '<div class="card">'+
    '<h3>'+window.ico('school',18)+' Daftar Kelas ('+classes.length+')</h3>';
  if(classes.length === 0){
    h += '<div class="empty-state">'+window.ico('school',40)+
      '<p>Belum ada kelas untuk akun Anda.</p>'+
      '<p style="font-size:12px;color:var(--text-muted);margin-top:-8px;">'+
      'Minta admin menambahkan kelas dengan <code>teacherEmail</code> = <b>'+
      window.U.esc(window.currentUser.email||'')+'</b></p></div>';
  } else {
    h += '<div class="grid">';
    classes.forEach(function(c){
      var nSiswa = (c.students||[]).length;
      h += '<div class="card" style="margin:0;cursor:pointer;transition:transform .15s;" '+
        'onmouseover="this.style.transform=\'translateY(-2px)\'" '+
        'onmouseout="this.style.transform=\'none\'" '+
        'data-action="openClassDetail" data-arg="'+c.id+'">'+
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'+
          '<div style="width:44px;height:44px;border-radius:10px;background:var(--primary-soft);'+
            'display:flex;align-items:center;justify-content:center;color:var(--primary);flex-shrink:0;">'+
            window.ico('school',22)+
          '</div>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font-weight:700;font-size:14px;color:var(--text-strong);'+
              'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+
              window.U.esc(c.name||'Kelas')+'</div>'+
            '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">'+
              (c.code ? 'Kode: <b>'+window.U.esc(c.code)+'</b>' : 'Tanpa kode')+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
          '<span class="badge badge-primary">'+window.ico('users','sm')+' '+nSiswa+' siswa</span>'+
          (c.teacherEmail
            ? '<span class="badge badge-gray">'+window.ico('user','sm')+' '+
              window.U.esc(c.teacherEmail.split('@')[0])+'</span>'
            : '')+
        '</div>'+
      '</div>';
    });
    h += '</div>';
  }
  h += '</div>';

  return h;
}

function buildSiswaDashboard(){
  var cid = window.myCid();
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  var role = window.myRole();
  var roleLabel = (window.ROLES[role]&&window.ROLES[role].label)||role;
  var notifs = (window.DB.notifications||[]).filter(function(n){
    return n.classId===cid && (n.toId==='all' || n.toId===window.mySid());
  });
  var checklist = window.getChecklist ? window.getChecklist(cid) : {items:[]};
  var myTasks = (checklist.items||[]).filter(function(it){
    return !it.isPersonal && it.assignedRole===role;
  });
  var doneTasks = myTasks.filter(function(x){ return x.done; }).length;

  var h = '<div class="alert alert-info" style="margin-bottom:16px;">'+
    window.ico('user')+'<div>'+
    '<b>Halo, '+window.U.esc(window.myName())+'!</b><br>'+
    'Kelas: <b>'+window.U.esc(c?c.name:'-')+'</b> · '+
    'Peran: <b>'+window.U.esc(roleLabel)+'</b>'+
    '</div></div>';

  h += '<div class="grid" style="margin-bottom:18px;">';
  h += statCard('clipboard','Tugas Saya', doneTasks+'/'+myTasks.length, 'primary');
  h += statCard('bell','Notifikasi', notifs.length, 'info');
  h += statCard('users','Anggota Tim',
    c ? ((c.students||[]).length) : 0, 'success');
  h += '</div>';

  h += '<div class="card">'+
    '<h3>'+window.ico('activity',18)+' Aksi Cepat</h3>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
      '<button class="btn btn-primary" data-action="openTugasSaya">'+window.ico('clipboard')+' Tugas Saya</button>'+
      '<button class="btn" data-action="openAbsensiHariIni">'+window.ico('calendar')+' Absensi</button>'+
      '<button class="btn" data-action="openChecklistView">'+window.ico('users')+' Tim Saya</button>'+
      '<button class="btn" data-action="openRubrikPenilaian">'+window.ico('target')+' Rubrik</button>'+
    '</div>'+
  '</div>';

  return h;
}

/* ============================================================
   DETAIL KELAS (untuk guru/admin)
   ============================================================ */
window.openClassDetail = function(cid){
  if(!cid) return;
  window.__viewClassId = cid;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c){ window.toast('Kelas tidak ditemukan','error'); return; }

  var students = c.students||[];
  var h = '<div class="alert alert-info">'+window.ico('school')+'<div>'+
    '<b>'+window.U.esc(c.name)+'</b>'+
    (c.code?' · Kode: <b>'+window.U.esc(c.code)+'</b>':'')+
    '</div></div>';

  h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">'+
    '<button class="btn btn-primary btn-sm" data-action="openChecklistManage" data-arg="'+cid+'" data-close-first>'+
      window.ico('clipboard','sm')+' Kelola Checklist</button>'+
    '<button class="btn btn-sm" data-action="openGuruPasswordView" data-arg="'+cid+'" data-close-first>'+
      window.ico('key','sm')+' Password Siswa</button>'+
  '</div>';

  h += '<div class="card" style="margin-bottom:12px;">'+
    '<h3 style="font-size:14px;">'+window.ico('users',16)+' Siswa ('+students.length+')</h3>';
  if(students.length===0){
    h += '<div class="empty-state" style="padding:24px;">'+window.ico('users',32)+
      '<p>Belum ada siswa di kelas ini.</p></div>';
  } else {
    h += '<div class="table-wrap"><table style="min-width:auto;">'+
      '<thead><tr><th>No</th><th>Nama</th><th>Peran</th><th>Kontak</th></tr></thead><tbody>';
    students.forEach(function(s,i){
      var rl = (window.ROLES[s.role]&&window.ROLES[s.role].label)||s.role||'-';
      h += '<tr>'+
        '<td>'+(i+1)+'</td>'+
        '<td><b>'+window.U.esc(s.name||'-')+'</b></td>'+
        '<td><span class="badge badge-primary">'+window.U.esc(rl)+'</span></td>'+
        '<td style="font-size:11.5px;color:var(--text-muted);">'+
          window.U.esc(s.email||'')+(s.phone?'<br>'+window.U.esc(s.phone):'')+'</td>'+
      '</tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';

  window.openModal('Detail Kelas — '+c.name, h);
};

/* ============================================================
   SHOW APP setelah login
   ============================================================ */
window.showApp = function(){
  var l = document.getElementById('login-screen');    if(l) l.classList.add('hidden');
  var r = document.getElementById('register-screen'); if(r) r.classList.add('hidden');
  var a = document.getElementById('app');             if(a) a.classList.remove('hidden');
  var ld = document.getElementById('loading');        if(ld) ld.style.display = 'none';

  var ui = document.getElementById('user-info');
  if(ui){
    var role = window.myRole();
    var rl = (window.ROLES[role] && window.ROLES[role].label) || '';
    var cls = (window.DB.classes||[]).find(function(c){ return c.id === window.myCid(); });
    var parts = ['Masuk sebagai <b>' + window.U.esc(window.myName()) + '</b>'];
    if(cls) parts.push(window.U.esc(cls.name));
    if(rl)  parts.push(window.U.esc(rl));
    if(window.myType()==='admin') parts.push('Admin');
    if(window.myType()==='guru')  parts.push('Guru');
    ui.innerHTML = parts.join(' · ');
  }

  try{ window.injectToolbar  && window.injectToolbar();  }catch(e){ console.warn(e); }
  try{ window.renderDashboard && window.renderDashboard(); }catch(e){ console.warn(e); }
  try{ window.injectCarousel && window.injectCarousel(); }catch(e){ console.warn(e); }
  try{ window.injectKerabat  && window.injectKerabat();  }catch(e){ console.warn(e); }
  try{ window.updateNotifBadge && window.updateNotifBadge(); }catch(e){ console.warn(e); }

  // Tombol tema
  var bTheme = document.getElementById('btn-theme');
  if(bTheme && !bTheme.__bound){
    bTheme.__bound = true;
    window.__applyTheme(window.__getPreferredTheme());
    bTheme.addEventListener('click', function(){
      window.__toggleTheme();
      window.toast('Tema: ' + (document.documentElement.getAttribute('data-theme')==='dark'?'Gelap':'Terang'), 'info');
    });
  }

  // Tombol ubah password
  var bPw = document.getElementById('btn-password');
  if(bPw && !bPw.__bound){
    bPw.__bound = true;
    bPw.innerHTML = window.ico('key',18);
    bPw.addEventListener('click', function(){ window.openChangePassword(); });
  }

  // Tombol logout
  var bOut = document.getElementById('btn-logout');
  if(bOut && !bOut.__bound){
    bOut.__bound = true;
    bOut.innerHTML = window.ico('logout',18);
    bOut.addEventListener('click', function(){ window.logoutConfirm(); });
  }

  // FAB Panduan
  var bPanduan = document.getElementById('btn-panduan');
  if(bPanduan && !bPanduan.__bound){
    bPanduan.__bound = true;
    bPanduan.innerHTML = window.ico('book',22);
    bPanduan.addEventListener('click', function(){
      window.openModal('Panduan Singkat',
        '<div class="alert alert-info">'+window.ico('info')+'<div>'+
        '<b>Langkah cepat:</b><br>'+
        '1. Guru/Admin mengelola kelas & siswa.<br>'+
        '2. Guru memberikan kode kelas untuk pendaftaran siswa.<br>'+
        '3. Siswa login dengan email/WA + password.<br>'+
        '4. Gunakan tombol di toolbar untuk mengakses fitur.</div></div>');
    });
  }
};

/* ============================================================
   BOOT SEQUENCE
   ============================================================ */
startRealtime();

window.__boot = function(){
  var loading = document.getElementById('loading');
  var session = window.getSession();
  if(session) window.currentUser = session;

  var started = false;
  function start(){
    if(started) return; started = true;
    if(loading) loading.style.display = 'none';
    window.__applyTheme(window.__getPreferredTheme());
    if(window.currentUser) window.showApp();
    else window.showLogin();
  }

  if(window.fbReady){
    var t0 = Date.now();
    var chk = setInterval(function(){
      var hasData = (window.DB.teachers && window.DB.teachers.length) ||
                    (window.DB.classes  && window.DB.classes.length);
      if(hasData || Date.now() - t0 > 3500){
        clearInterval(chk); start();
      }
    }, 120);
  } else {
    console.warn('[boot] Firebase offline:', window.fbError);
    start();
  }
};

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', window.__boot);
} else {
  window.__boot();
}

console.log('[core] loaded');
})();
