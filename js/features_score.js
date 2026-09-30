/* ============================================================
   SP-PPT features_score.js — v2.0 FINAL
   Modul Terpadu:
   1. Sistem Tahapan (Stages) — CRUD + Aktivasi + Deadline
   2. Sistem Penilaian (Guru + Siswa) per Tahap
   3. Rekap Nilai per Tahap + Export
   4. Struktur Kerabat Kerja
   Load SETELAH app.js
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   HELPERS
   ============================================================ */
function ico(n, s){ try { return window.ico ? window.ico(n, s) : ''; } catch(e){ return ''; } }
function esc(s){ return String(s == null ? '' : s).replace(/[<>&"']/g, function(c){
  return { '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c];
}); }
function openModalSafe(t, h){ if (typeof window.openModal === 'function') window.openModal(t, h); }
function closeModalSafe(){ if (typeof window.closeModal === 'function') window.closeModal(); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type || '').toLowerCase(); }
function uRole(){ return String(u().role || '').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType() === 'guru' || uType() === 'admin'; }
function isSiswa(){ return uType() === 'siswa'; }
function getStages(){ return window.DB.stages || []; }
function getActiveStages(cid){
  return getStages().filter(function(s){ return window.isStageActive && window.isStageActive(cid, s.id); });
}
function findClass(cid){ return (window.DB.classes || []).find(function(x){ return x.id === cid; }); }

/* ============================================================
   STRUKTUR ORGANISASI
   ============================================================ */
var STRUKTUR_ORDER = [
  { role:'pimpinan_produksi',    jabatan:'Pimpinan Produksi',              level:1, grup:'Pengurus Inti',    divisi:'produksi' },
  { role:'sutradara',            jabatan:'Sutradara',                      level:1, grup:'Pengurus Inti',    divisi:'artistik' },
  { role:'asisten_sutradara',    jabatan:'Asisten Sutradara',              level:2, grup:'Pengurus Inti',    divisi:'artistik' },
  { role:'sekretaris',           jabatan:'Sekretaris',                     level:2, grup:'Pengurus Inti',    divisi:'produksi' },
  { role:'bendahara',            jabatan:'Bendahara',                      level:2, grup:'Pengurus Inti',    divisi:'produksi' },
  { role:'koor_publikasi',       jabatan:'Koor. Publikasi & Dokumentasi',  level:3, grup:'Koor Produksi',    divisi:'produksi' },
  { role:'koor_perlengkapan',    jabatan:'Koor. Perlengkapan',             level:3, grup:'Koor Produksi',    divisi:'produksi' },
  { role:'koor_akomodasi',       jabatan:'Koor. Akomodasi & Transportasi', level:3, grup:'Koor Produksi',    divisi:'produksi' },
  { role:'koor_panggung',        jabatan:'Koor. Tata Pentas & Panggung',   level:3, grup:'Koor Artistik',    divisi:'artistik' },
  { role:'koor_musik',           jabatan:'Koor. Tata Musik & Suara',       level:3, grup:'Koor Artistik',    divisi:'artistik' },
  { role:'koor_busana',          jabatan:'Koor. Tata Busana',              level:3, grup:'Koor Artistik',    divisi:'artistik' },
  { role:'koor_rias',            jabatan:'Koor. Tata Rias',                level:3, grup:'Koor Artistik',    divisi:'artistik' },
  { role:'koor_cahaya',          jabatan:'Koor. Tata Cahaya',              level:3, grup:'Koor Artistik',    divisi:'artistik' },
  { role:'anggota_publikasi',    jabatan:'Anggota Publikasi',              level:4, grup:'Anggota Produksi', divisi:'produksi' },
  { role:'anggota_perlengkapan', jabatan:'Anggota Perlengkapan',           level:4, grup:'Anggota Produksi', divisi:'produksi' },
  { role:'anggota_akomodasi',    jabatan:'Anggota Akomodasi',              level:4, grup:'Anggota Produksi', divisi:'produksi' },
  { role:'anggota_panggung',     jabatan:'Anggota Tata Pentas',            level:4, grup:'Anggota Artistik', divisi:'artistik' },
  { role:'anggota_musik',        jabatan:'Anggota Tata Musik',             level:4, grup:'Anggota Artistik', divisi:'artistik' },
  { role:'anggota_busana',       jabatan:'Anggota Tata Busana',            level:4, grup:'Anggota Artistik', divisi:'artistik' },
  { role:'anggota_rias',         jabatan:'Anggota Tata Rias',              level:4, grup:'Anggota Artistik', divisi:'artistik' },
  { role:'anggota_cahaya',       jabatan:'Anggota Tata Cahaya',            level:4, grup:'Anggota Artistik', divisi:'artistik' },
  { role:'pemain',               jabatan:'Pemeran',                        level:4, grup:'Pemeran',          divisi:'artistik' }
];

function getStrukturMeta(role){
  for (var i = 0; i < STRUKTUR_ORDER.length; i++){
    if (STRUKTUR_ORDER[i].role === role) return STRUKTUR_ORDER[i];
  }
  return { role:role, jabatan:role, level:99, grup:'Lainnya', divisi:'produksi' };
}
window.getStrukturMeta = getStrukturMeta;
window.STRUKTUR_ORDER = STRUKTUR_ORDER;

/* ============================================================
   MATRIKS EVALUATOR (siapa menilai siapa)
   ============================================================ */
var EVALUATOR_MATRIX = {
  pimpinan_produksi: ['guru','sutradara','asisten_sutradara','sekretaris','bendahara',
    'koor_publikasi','koor_perlengkapan','koor_akomodasi','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya',
    'anggota_publikasi','anggota_perlengkapan','anggota_akomodasi','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
  sutradara: ['guru','pimpinan_produksi','asisten_sutradara',
    'koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','pemain'],
  asisten_sutradara: ['sutradara','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya',
    'anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
  sekretaris: ['pimpinan_produksi'],
  bendahara: ['pimpinan_produksi'],
  koor_publikasi: ['pimpinan_produksi','anggota_publikasi'],
  koor_perlengkapan: ['pimpinan_produksi','anggota_perlengkapan'],
  koor_akomodasi: ['pimpinan_produksi','anggota_akomodasi'],
  koor_panggung: ['sutradara','asisten_sutradara','anggota_panggung'],
  koor_musik: ['sutradara','asisten_sutradara','anggota_musik'],
  koor_busana: ['sutradara','asisten_sutradara','anggota_busana'],
  koor_rias: ['sutradara','asisten_sutradara','anggota_rias'],
  koor_cahaya: ['sutradara','asisten_sutradara','anggota_cahaya'],
  anggota_publikasi: ['koor_publikasi','anggota_publikasi'],
  anggota_perlengkapan: ['koor_perlengkapan','anggota_perlengkapan'],
  anggota_akomodasi: ['koor_akomodasi','anggota_akomodasi'],
  anggota_panggung: ['koor_panggung','asisten_sutradara','anggota_panggung'],
  anggota_musik: ['koor_musik','asisten_sutradara','anggota_musik'],
  anggota_busana: ['koor_busana','asisten_sutradara','anggota_busana'],
  anggota_rias: ['koor_rias','asisten_sutradara','anggota_rias'],
  anggota_cahaya: ['koor_cahaya','asisten_sutradara','anggota_cahaya'],
  pemain: ['sutradara','asisten_sutradara','pemain']
};

function canRoleEvaluate(evalRole, targetRole){
  if (evalRole === 'guru' || evalRole === 'admin') return true;
  var allowed = EVALUATOR_MATRIX[targetRole] || [];
  return allowed.indexOf(evalRole) >= 0;
}
window.canRoleEvaluate = canRoleEvaluate;

function canGuruEvaluateTarget(targetRole){
  return targetRole === 'pimpinan_produksi' || targetRole === 'sutradara';
}
window.canGuruEvaluateTarget = canGuruEvaluateTarget;

/* ============================================================
   KALKULASI NILAI PER TAHAP
   ============================================================ */
function calcWeightedAvg(scores, rubric){
  if (!scores || !rubric) return 0;
  var total = 0, wsum = 0;
  rubric.forEach(function(r){
    var v = scores[r.id];
    if (typeof v === 'number'){ total += v * r.weight; wsum += r.weight; }
  });
  return wsum > 0 ? total / wsum : 0;
}
window.calcWeightedAvg = calcWeightedAvg;

function getStageScoreWithBreakdown(cid, targetId, stageId){
  var c = findClass(cid);
  if (!c) return {guru:null, ketua:null, rekan:null, final:0};
  var t = c.students.find(function(x){ return x.id === targetId; });
  if (!t) return {guru:null, ketua:null, rekan:null, final:0};

  var rubric = (window.getRubricFor || function(){ return []; })(t.role);
  var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId]) || {};

  var guruScore = null;
  var ketuaScores = [];
  var rekanScores = [];

  for (var eid in ev){
    var scores = ev[eid] && ev[eid][stageId];
    if (!scores || Object.keys(scores).length === 0) continue;
    var avg = calcWeightedAvg(scores, rubric);

    if (eid === 'guru'){ guruScore = avg; continue; }

    var evStudent = c.students.find(function(x){ return x.id === eid; });
    if (!evStudent) continue;

    if (evStudent.role === 'pimpinan_produksi' || evStudent.role === 'sutradara'){
      ketuaScores.push(avg);
    } else {
      rekanScores.push(avg);
    }
  }

  var ketuaAvg = ketuaScores.length > 0 ? ketuaScores.reduce(function(a,b){ return a+b; }, 0) / ketuaScores.length : null;
  var rekanAvg = rekanScores.length > 0 ? rekanScores.reduce(function(a,b){ return a+b; }, 0) / rekanScores.length : null;

  var parts = [];
  if (guruScore !== null) parts.push({val:guruScore, weight:0.4});
  if (ketuaAvg !== null) parts.push({val:ketuaAvg, weight:0.3});
  if (rekanAvg !== null) parts.push({val:rekanAvg, weight:0.3});

  var finalScore = 0;
  if (parts.length > 0){
    var totalW = parts.reduce(function(a,p){ return a + p.weight; }, 0);
    var sum = 0;
    parts.forEach(function(p){ sum += p.val * (p.weight / totalW); });
    finalScore = sum;
  }

  return {
    guru: guruScore,
    ketua: ketuaAvg,
    rekan: rekanAvg,
    final: Math.max(0, Math.min(4, finalScore))
  };
}
window.getStageScoreWithBreakdown = getStageScoreWithBreakdown;

function getFinalScore(cid, targetId){
  var stages = getActiveStages(cid);
  if (stages.length === 0) return 0;
  var totalW = 0, weighted = 0;
  stages.forEach(function(s){
    var bd = getStageScoreWithBreakdown(cid, targetId, s.id);
    weighted += bd.final * s.weight;
    totalW += s.weight;
  });
  return totalW > 0 ? weighted / totalW : 0;
}
window.getFinalScore = getFinalScore;

/* ============================================================
   SISTEM TAHAPAN — HALAMAN UTAMA
   ============================================================ */
window.openSistemTahapan = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid);
  if (!c) return;

  var stages = getStages();
  var activeIds = (window.DB.activeStages[cid] && window.DB.activeStages[cid].activeIds) || [];
  // fallback: dulu pakai format object aktif per stage
  if (Object.keys(window.DB.activeStages[cid] || {}).length && !window.DB.activeStages[cid].activeIds){
    activeIds = Object.keys(window.DB.activeStages[cid]).filter(function(k){
      return window.DB.activeStages[cid][k] === true;
    });
  }

  var canEdit = isGuru() || uRole() === 'pimpinan_produksi' || uRole() === 'sutradara';

  var h = '';
  h += '<div class="alert alert-info">' + ico('layers') +
    '<div><b>Sistem Tahapan Proyek</b><br>' +
    '<small>Kelas: ' + esc(c.name) + ' · ' + activeIds.length + '/' + stages.length + ' tahap aktif</small></div></div>';

  if (canEdit){
    h += '<div class="action-row" style="margin-bottom:14px;">' +
      '<button class="btn btn-primary btn-sm" onclick="openTambahTahapan()">' +
        ico('plus', 'sm') + ' Tambah Tahap' +
      '</button>' +
      '<button class="btn btn-sm" onclick="aturSemuaTahapanAktif(\'' + cid + '\')">' +
        ico('checkSquare', 'sm') + ' Aktifkan Semua' +
      '</button>' +
      '<button class="btn btn-sm btn-danger" onclick="matikanSemuaTahapan(\'' + cid + '\')">' +
        ico('x', 'sm') + ' Matikan Semua' +
      '</button>' +
    '</div>';
  }

  // List tahapan
  stages.forEach(function(stage, i){
    var isActive = activeIds.indexOf(stage.id) >= 0;
    var dl = (window.DB.deadlines && window.DB.deadlines[cid] && window.DB.deadlines[cid][stage.id]) || {};

    // Progress penilaian
    var totalTargets = 0, doneTargets = 0;
    (c.students || []).forEach(function(s){
      if (s.id === uSid()) return;
      if (uRole() && !canRoleEvaluate(uRole(), s.role) && !isGuru()) return;
      totalTargets++;
      var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][s.id]) || {};
      var myId = isGuru() ? 'guru' : uSid();
      if (ev[myId] && ev[myId][stage.id] && Object.keys(ev[myId][stage.id]).length > 0) doneTargets++;
    });
    var pct = totalTargets > 0 ? Math.round(doneTargets / totalTargets * 100) : 0;

    h += '<div class="card" style="margin-bottom:12px;border-left:4px solid ' +
      (isActive ? 'var(--success)' : 'var(--border-strong)') + ';">';

    // Header
    h += '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">';
    h += '<div style="width:44px;height:44px;border-radius:12px;' +
      'background:' + (isActive ? 'var(--success-soft)' : 'var(--surface)') + ';' +
      'color:' + (isActive ? '#065f46' : 'var(--text-muted)') + ';' +
      'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0;">' +
      (i+1) + '</div>';
    h += '<div style="flex:1;min-width:0;">' +
      '<div style="font-weight:800;font-size:14.5px;color:var(--text-strong);">' +
        esc(stage.name) + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' +
        (stage.subtitle ? esc(stage.subtitle) + ' · ' : '') +
        'Bobot ' + stage.weight + '%' +
      '</div>' +
    '</div>';
    h += '<span class="badge ' + (isActive ? 'badge-success' : 'badge-gray') + '">' +
      (isActive ? 'AKTIF' : 'TERKUNCI') + '</span>';
    h += '</div>';

    // Deskripsi
    if (stage.description){
      h += '<div style="font-size:12.5px;color:var(--text);margin-bottom:10px;line-height:1.55;">' +
        esc(stage.description) + '</div>';
    }

    // Deadline
    if (dl.date){
      var overdue = window.isDeadlinePassed ? window.isDeadlinePassed(dl.date, dl.time) : false;
      h += '<div style="font-size:11.5px;margin-bottom:10px;display:flex;align-items:center;gap:5px;' +
        'color:' + (overdue ? 'var(--danger)' : 'var(--text-muted)') + ';">' +
        ico('clock', 12) + ' Deadline: <b>' + (window.fmtDateTime ? window.fmtDateTime(dl.date, dl.time) : dl.date) + '</b>' +
        (overdue ? ' <span class="badge badge-danger">Lewat</span>' : '') +
      '</div>';
    }

    // Progress
    if (isActive){
      h += '<div class="progress-container" style="margin-bottom:6px;">' +
        '<div class="progress-bar ' + (pct === 100 ? 'complete' : pct > 0 ? 'partial' : '') + '" ' +
        'style="width:' + pct + '%"></div></div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">' +
        doneTargets + '/' + totalTargets + ' penilaian (' + pct + '%)</div>';
    }

    // Aksi
    h += '<div class="action-row" style="flex-wrap:wrap;">';
    if (canEdit){
      h += '<button class="btn btn-sm ' + (isActive ? 'btn-danger' : 'btn-primary') + '" ' +
        'onclick="toggleTahapanAktif(\'' + cid + '\',\'' + stage.id + '\')">' +
        ico(isActive ? 'x' : 'check', 'sm') + ' ' + (isActive ? 'Matikan' : 'Aktifkan') +
      '</button>';
      h += '<button class="btn btn-sm" onclick="openEditTahapan(\'' + stage.id + '\')">' +
        ico('edit', 'sm') + ' Edit</button>';
      h += '<button class="btn btn-sm" onclick="openAturDeadline(\'' + cid + '\',\'' + stage.id + '\')">' +
        ico('calendar', 'sm') + ' Deadline</button>';
      if (stages.length > 1){
        h += '<button class="btn btn-sm btn-danger" onclick="hapusTahapan(\'' + stage.id + '\')">' +
          ico('trash', 'sm') + '</button>';
      }
    }
    if (isActive){
      h += '<button class="btn btn-sm btn-primary" onclick="openPenilaianTahap(\'' + cid + '\',\'' + stage.id + '\')">' +
        ico('target', 'sm') + ' Nilai Tahap Ini</button>';
      h += '<button class="btn btn-sm" onclick="openRekapTahap(\'' + cid + '\',\'' + stage.id + '\')">' +
        ico('chart', 'sm') + ' Rekap</button>';
    }
    h += '</div>';

    h += '</div>';
  });

  // Total bobot
  var totalW = stages.reduce(function(a, s){ return a + Number(s.weight || 0); }, 0);
  h += '<div class="alert ' + (totalW === 100 ? 'alert-success' : 'alert-warning') + '" style="margin-top:14px;">' +
    ico(totalW === 100 ? 'check' : 'warning') +
    '<div>Total bobot: <b>' + totalW + '%</b>' + (totalW !== 100 ? ' (ideal 100%)' : ' ✓') + '</div></div>';

  openModalSafe('Sistem Tahapan', h);
};

/* ============================================================
   CRUD TAHAPAN
   ============================================================ */
window.openTambahTahapan = function(){
  var h = '';
  h += '<div class="form-group"><label>Nama Tahapan</label>' +
    '<input id="stg-name" placeholder="Contoh: Perencanaan"></div>';
  h += '<div class="form-group"><label>Sub-Judul</label>' +
    '<input id="stg-sub" placeholder="Contoh: Pra-Produksi"></div>';
  h += '<div class="form-group"><label>Deskripsi Singkat</label>' +
    '<textarea id="stg-desc" rows="2" placeholder="Penjelasan singkat tahap ini..."></textarea></div>';
  h += '<div class="form-group"><label>Deskripsi Panjang</label>' +
    '<textarea id="stg-long" rows="3" placeholder="Detail lengkap tahap ini..."></textarea></div>';
  h += '<div class="form-group"><label>Bobot (%)</label>' +
    '<input type="number" id="stg-weight" min="1" max="100" value="20"></div>';
  h += '<button class="btn btn-primary btn-block" onclick="simpanTahapanBaru()">' +
    ico('save') + ' Simpan Tahapan</button>';
  openModalSafe('Tambah Tahapan', h);
};

window.simpanTahapanBaru = function(){
  var name = (document.getElementById('stg-name').value || '').trim();
  var sub = (document.getElementById('stg-sub').value || '').trim();
  var desc = (document.getElementById('stg-desc').value || '').trim();
  var long = (document.getElementById('stg-long').value || '').trim();
  var weight = parseFloat(document.getElementById('stg-weight').value) || 0;

  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }
  if (weight <= 0 || weight > 100){ alert('Bobot 1-100'); return; }
  if (window.containsProfanity && window.containsProfanity(name)){ alert('Kata tidak sopan'); return; }

  var stages = getStages().slice();
  stages.push({
    id: 'stage_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name: window.sanitizeText ? window.sanitizeText(name) : name,
    subtitle: sub,
    description: desc,
    longDesc: long,
    weight: weight
  });

  if (window.fbSetStages){
    window.fbSetStages(stages).then(function(){
      alert('Tahapan ditambahkan!');
      closeModalSafe();
      setTimeout(function(){ window.openSistemTahapan(); }, 300);
    });
  } else {
    alert('Firebase belum siap');
  }
};

window.openEditTahapan = function(stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;

  var h = '';
  h += '<div class="form-group"><label>Nama Tahapan</label>' +
    '<input id="stg-name" value="' + esc(stage.name) + '"></div>';
  h += '<div class="form-group"><label>Sub-Judul</label>' +
    '<input id="stg-sub" value="' + esc(stage.subtitle || '') + '"></div>';
  h += '<div class="form-group"><label>Deskripsi Singkat</label>' +
    '<textarea id="stg-desc" rows="2">' + esc(stage.description || '') + '</textarea></div>';
  h += '<div class="form-group"><label>Deskripsi Panjang</label>' +
    '<textarea id="stg-long" rows="3">' + esc(stage.longDesc || '') + '</textarea></div>';
  h += '<div class="form-group"><label>Bobot (%)</label>' +
    '<input type="number" id="stg-weight" min="1" max="100" value="' + stage.weight + '"></div>';
  h += '<button class="btn btn-primary btn-block" onclick="simpanEditTahapan(\'' + stageId + '\')">' +
    ico('save') + ' Simpan Perubahan</button>';
  openModalSafe('Edit Tahapan', h);
};

window.simpanEditTahapan = function(stageId){
  var name = (document.getElementById('stg-name').value || '').trim();
  var sub = (document.getElementById('stg-sub').value || '').trim();
  var desc = (document.getElementById('stg-desc').value || '').trim();
  var long = (document.getElementById('stg-long').value || '').trim();
  var weight = parseFloat(document.getElementById('stg-weight').value) || 0;

  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }
  if (weight <= 0 || weight > 100){ alert('Bobot 1-100'); return; }

  var stages = getStages().map(function(s){
    if (s.id !== stageId) return s;
    return Object.assign({}, s, {
      name: window.sanitizeText ? window.sanitizeText(name) : name,
      subtitle: sub, description: desc, longDesc: long, weight: weight
    });
  });

  if (window.fbSetStages){
    window.fbSetStages(stages).then(function(){
      alert('Tahapan diperbarui!');
      closeModalSafe();
      setTimeout(function(){ window.openSistemTahapan(); }, 300);
    });
  }
};

window.hapusTahapan = function(stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;
  if (!confirm('Hapus tahapan "' + stage.name + '"?\n\nSemua penilaian tahap ini akan hilang.')) return;

  var stages = getStages().filter(function(s){ return s.id !== stageId; });
  if (window.fbSetStages){
    window.fbSetStages(stages).then(function(){
      alert('Tahapan dihapus');
      closeModalSafe();
      setTimeout(function(){ window.openSistemTahapan(); }, 300);
    });
  }
};

/* ============================================================
   AKTIVASI TAHAPAN
   ============================================================ */
window.toggleTahapanAktif = function(cid, stageId){
  var cur = (window.DB.activeStages[cid] && window.DB.activeStages[cid].activeIds) || [];
  if (!Array.isArray(cur)){
    cur = Object.keys(window.DB.activeStages[cid] || {}).filter(function(k){
      return window.DB.activeStages[cid][k] === true;
    });
  }

  var newIds;
  if (cur.indexOf(stageId) >= 0){
    newIds = cur.filter(function(id){ return id !== stageId; });
  } else {
    newIds = cur.concat([stageId]);
  }

  if (!window.fbSetActiveStages){ alert('Firebase belum siap'); return; }
  window.fbSetActiveStages(cid, {activeIds: newIds, updatedAt: Date.now()}).then(function(){
    closeModalSafe();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.aturSemuaTahapanAktif = function(cid){
  if (!confirm('Aktifkan semua tahapan?')) return;
  var ids = getStages().map(function(s){ return s.id; });
  window.fbSetActiveStages(cid, {activeIds: ids, updatedAt: Date.now()}).then(function(){
    closeModalSafe();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.matikanSemuaTahapan = function(cid){
  if (!confirm('Matikan semua tahapan? Siswa tidak bisa menilai.')) return;
  window.fbSetActiveStages(cid, {activeIds: [], updatedAt: Date.now()}).then(function(){
    closeModalSafe();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

/* ============================================================
   DEADLINE
   ============================================================ */
window.openAturDeadline = function(cid, stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;
  var dl = (window.DB.deadlines && window.DB.deadlines[cid] && window.DB.deadlines[cid][stageId]) || {};

  var h = '';
  h += '<div class="alert alert-info">' + ico('clock') +
    '<div>Atur deadline untuk: <b>' + esc(stage.name) + '</b></div></div>';
  h += '<div class="form-group"><label>Tanggal</label>' +
    '<input type="date" id="dl-date" value="' + (dl.date || '') + '"></div>';
  h += '<div class="form-group"><label>Jam (opsional)</label>' +
    '<input type="time" id="dl-time" value="' + (dl.time || '23:59') + '"></div>';
  h += '<div class="form-group"><label>Catatan</label>' +
    '<textarea id="dl-note" rows="2" placeholder="Catatan deadline...">' + esc(dl.note || '') + '</textarea></div>';
  h += '<div class="action-row">' +
    '<button class="btn btn-primary" onclick="simpanDeadline(\'' + cid + '\',\'' + stageId + '\')">' +
      ico('save') + ' Simpan</button>' +
    '<button class="btn btn-danger" onclick="hapusDeadline(\'' + cid + '\',\'' + stageId + '\')">' +
      ico('trash') + ' Hapus</button>' +
  '</div>';
  openModalSafe('Atur Deadline', h);
};

window.simpanDeadline = function(cid, stageId){
  var date = document.getElementById('dl-date').value;
  var time = document.getElementById('dl-time').value || '23:59';
  var note = (document.getElementById('dl-note').value || '').trim();

  if (!date){ alert('Tanggal wajib diisi'); return; }

  var existing = (window.DB.deadlines && window.DB.deadlines[cid]) || {};
  existing[stageId] = {
    date: date, time: time,
    note: window.sanitizeText ? window.sanitizeText(note) : note,
    setBy: u().name || '',
    setAt: Date.now()
  };

  if (!window.fbSetDeadlines){ alert('Firebase belum siap'); return; }
  window.fbSetDeadlines(cid, existing).then(function(){
    alert('Deadline tersimpan');
    closeModalSafe();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.hapusDeadline = function(cid, stageId){
  if (!confirm('Hapus deadline tahap ini?')) return;
  var existing = Object.assign({}, (window.DB.deadlines && window.DB.deadlines[cid]) || {});
  delete existing[stageId];
  if (!window.fbSetDeadlines){ alert('Firebase belum siap'); return; }
  window.fbSetDeadlines(cid, existing).then(function(){
    alert('Deadline dihapus');
    closeModalSafe();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

/* ============================================================
   PENILAIAN PER TAHAP
   ============================================================ */
window.openPenilaianTahap = function(cid, stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;
  if (!window.isStageActive(cid, stageId)){ alert('Tahap ini belum aktif'); return; }

  var c = findClass(cid);
  if (!c) return;

  var myId = isGuru() ? 'guru' : uSid();
  var myRole = isGuru() ? 'guru' : uRole();
  var targets = [];

  (c.students || []).forEach(function(s){
    if (s.id === myId) return;
    if (!isGuru() && !canRoleEvaluate(myRole, s.role)) return;
    if (isGuru() && !canGuruEvaluateTarget(s.role)) return;
    targets.push(s);
  });

  var h = '';
  h += '<div class="alert alert-info">' + ico('target') +
    '<div><b>' + esc(stage.name) + '</b><br>' +
    '<small>' + targets.length + ' target untuk dinilai</small></div></div>';

  if (targets.length === 0){
    h += '<div class="empty-state">' + ico('users', 40) + '<p>Tidak ada target yang bisa Anda nilai di tahap ini.</p></div>';
    openModalSafe('Penilaian Tahap', h);
    return;
  }

  targets.forEach(function(t){
    var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
    var myData = (ev[myId] && ev[myId][stageId]) || {};
    var done = Object.keys(myData).length > 0;
    var meta = getStrukturMeta(t.role);

    h += '<div class="card ' + (done ? 'card-accent green' : 'card-accent amber') + '" style="margin-bottom:10px;">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="width:40px;height:40px;border-radius:50%;' +
          'background:' + (done ? 'var(--success-soft)' : 'var(--primary-soft)') + ';' +
          'color:' + (done ? 'var(--success)' : 'var(--primary)') + ';' +
          'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">' +
          esc((t.name || '?').charAt(0).toUpperCase()) + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:700;font-size:13.5px;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + esc(meta.jabatan) + '</div>' +
        '</div>' +
        (done ? '<span class="badge badge-success">' + ico('check', 'sm') + ' Selesai</span>' : '') +
      '</div>' +
      '<button class="btn btn-primary btn-sm btn-block" style="margin-top:10px;" ' +
        'onclick="openFormPenilaian(\'' + cid + '\',\'' + t.id + '\',\'' + stageId + '\')">' +
        ico('edit', 'sm') + ' ' + (done ? 'Edit Nilai' : 'Beri Nilai') +
      '</button>' +
    '</div>';
  });

  openModalSafe('Penilaian — ' + stage.name, h);
};

window.openFormPenilaian = function(cid, targetId, stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;
  var c = findClass(cid);
  if (!c) return;
  var t = c.students.find(function(x){ return x.id === targetId; });
  if (!t) return;

  var rubric = (window.getRubricFor || function(){ return []; })(t.role);
  var myId = isGuru() ? 'guru' : uSid();
  var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId]) || {};
  var myData = (ev[myId] && ev[myId][stageId]) || {};

  var h = '';
  h += '<div class="alert alert-info">' + ico('user') +
    '<div>Menilai <b>' + esc(t.name) + '</b><br>' +
    '<small>' + esc(getStrukturMeta(t.role).jabatan) + ' · ' + esc(stage.name) + '</small></div></div>';

  h += '<div class="scale-guide">' +
    '<div class="scale-guide-title">' + ico('info', 'sm') + ' Panduan Skala</div>' +
    '<div class="scale-guide-grid">' +
      '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
      '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
      '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
      '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
    '</div></div>';

  rubric.forEach(function(r){
    var val = myData[r.id];
    h += '<div class="rubric-item">' +
      '<h4>' + esc(r.name) + ' <span class="weight-info">' + r.weight + '%</span></h4>' +
      '<div class="desc">' + esc(r.desc || '') + '</div>';
    if (r.scale){
      h += '<div class="scale-explain"><b>Kriteria:</b> ' + esc(r.scale) + '</div>';
    }
    h += '<div class="radio-group">';
    var labels = {4:'Sangat Baik', 3:'Baik', 2:'Cukup', 1:'Kurang'};
    [4,3,2,1].forEach(function(v){
      h += '<label class="radio-score rs-' + v + '">' +
        '<input type="radio" name="score_' + r.id + '" value="' + v + '" ' +
          (val === v ? 'checked' : '') + '>' +
        '<div><b>' + v + ' — ' + labels[v] + '</b></div>' +
      '</label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:16px;" ' +
    'onclick="simpanPenilaian(\'' + cid + '\',\'' + targetId + '\',\'' + stageId + '\')">' +
    ico('save') + ' Simpan Penilaian</button>';

  openModalSafe('Nilai: ' + t.name, h);
};

window.simpanPenilaian = function(cid, targetId, stageId){
  var c = findClass(cid);
  if (!c) return;
  var t = c.students.find(function(x){ return x.id === targetId; });
  if (!t) return;

  var rubric = (window.getRubricFor || function(){ return []; })(t.role);
  var myId = isGuru() ? 'guru' : uSid();

  var scores = {};
  var missing = [];

  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="score_' + r.id + '"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });

  if (missing.length > 0){
    alert('Belum lengkap. Harap isi:\n• ' + missing.slice(0, 5).join('\n• ') +
      (missing.length > 5 ? '\n• +' + (missing.length - 5) + ' lagi' : ''));
    return;
  }

  if (!window.fb || !window.fbReady){
    alert('Firebase belum siap');
    return;
  }

  var docId = cid + '__' + targetId;
  var doc = window.fb.collection('evaluations').doc(docId);

  doc.get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:targetId};
    data[myId] = data[myId] || {};
    data[myId][stageId] = scores;
    return doc.set(window.sanitizeFirestore ? window.sanitizeFirestore(data) : data, {merge:true});
  }).then(function(){
    if (window.logActivity){
      window.logActivity('eval_submit',
        (u().name || 'User') + ' menilai ' + t.name + ' pada ' + stageId,
        {classId:cid, role:u().role || ''});
    }
    alert('Penilaian tersimpan!');
    closeModalSafe();
    setTimeout(function(){ window.openPenilaianTahap(cid, stageId); }, 300);
  }).catch(function(e){
    console.error('savePenilaian:', e);
    alert('Gagal: ' + e.message);
  });
};

/* ============================================================
   REKAP PER TAHAP
   ============================================================ */
window.openRekapTahap = function(cid, stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;
  var c = findClass(cid);
  if (!c) return;

  var h = '';
  h += '<div class="alert alert-info">' + ico('chart') +
    '<div><b>Rekap: ' + esc(stage.name) + '</b><br>' +
    '<small>Bobot tahap: ' + stage.weight + '%</small></div></div>';

  h += '<div class="table-wrap" style="max-height:60vh;">' +
    '<table style="min-width:600px;"><thead><tr>' +
    '<th>No</th><th>Nama</th><th>Peran</th>' +
    '<th>Guru</th><th>Ketua</th><th>Rekan</th>' +
    '<th>Nilai</th>' +
    '</tr></thead><tbody>';

  (c.students || []).forEach(function(s, i){
    var bd = getStageScoreWithBreakdown(cid, s.id, stageId);
    var color = bd.final >= 3.5 ? 'badge-success' :
                bd.final >= 2.5 ? 'badge-info' :
                bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';

    h += '<tr>' +
      '<td>' + (i+1) + '</td>' +
      '<td><b>' + esc(s.name) + '</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' +
        esc(getStrukturMeta(s.role).jabatan) + '</span></td>' +
      '<td>' + (bd.guru !== null ? bd.guru.toFixed(2) : '-') + '</td>' +
      '<td>' + (bd.ketua !== null ? bd.ketua.toFixed(2) : '-') + '</td>' +
      '<td>' + (bd.rekan !== null ? bd.rekan.toFixed(2) : '-') + '</td>' +
      '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>' +
    '</tr>';
  });

  h += '</tbody></table></div>';

  h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary" onclick="exportRekapTahap(\'' + cid + '\',\'' + stageId + '\')">' +
      ico('download') + ' Export Excel</button>' +
    '<button class="btn" onclick="closeModal()">Tutup</button>' +
  '</div>';

  openModalSafe('Rekap Tahap', h);
};

window.exportRekapTahap = function(cid, stageId){
  var stage = getStages().find(function(s){ return s.id === stageId; });
  if (!stage) return;
  var c = findClass(cid);
  if (!c) return;

  var rows = [['No', 'Nama', 'Peran', 'Guru', 'Ketua', 'Rekan', 'Nilai Akhir']];
  (c.students || []).forEach(function(s, i){
    var bd = getStageScoreWithBreakdown(cid, s.id, stageId);
    rows.push([
      i+1, s.name, getStrukturMeta(s.role).jabatan,
      bd.guru !== null ? bd.guru.toFixed(2) : '-',
      bd.ketua !== null ? bd.ketua.toFixed(2) : '-',
      bd.rekan !== null ? bd.rekan.toFixed(2) : '-',
      bd.final.toFixed(2)
    ]);
  });

  if (!window.XLSX){ alert('Library Excel belum siap'); return; }
  var ws = XLSX.utils.aoa_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, stage.name.substring(0, 30));
  XLSX.writeFile(wb, 'Rekap_' + stage.name.replace(/\s+/g, '_') + '_' + c.name.replace(/\s+/g, '_') + '.xlsx');
};

/* ============================================================
   REKAP NILAI LENGKAP (SEMUA TAHAP)
   ============================================================ */
window.openRekapNilaiLengkap = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid);
  if (!c) return;

  var stages = getActiveStages(cid);
  var students = c.students || [];

  var h = '';
  h += '<div class="alert alert-info">' + ico('chart') +
    '<div><b>Rekap Nilai Lengkap</b><br>' +
    '<small>Bobot: Guru 40% · Ketua 30% · Rekan 30%</small></div></div>';

  if (students.length === 0 || stages.length === 0){
    h += '<div class="empty-state">' + ico('chart', 40) + '<p>Belum ada data.</p></div>';
    openModalSafe('Rekap Nilai', h);
    return;
  }

  h += '<div class="table-wrap" style="max-height:60vh;">' +
    '<table style="min-width:700px;"><thead><tr>' +
    '<th>No</th><th>Nama</th><th>Peran</th>';

  stages.forEach(function(s){
    h += '<th>' + esc(s.name) + '<br><small>(' + s.weight + '%)</small></th>';
  });
  h += '<th>Nilai Akhir</th></tr></thead><tbody>';

  students.forEach(function(t, i){
    h += '<tr><td>' + (i+1) + '</td>' +
      '<td><b>' + esc(t.name) + '</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' +
        esc(getStrukturMeta(t.role).jabatan) + '</span></td>';

    stages.forEach(function(s){
      var bd = getStageScoreWithBreakdown(cid, t.id, s.id);
      var color = bd.final >= 3.5 ? 'badge-success' :
                  bd.final >= 2.5 ? 'badge-info' :
                  bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';
      h += '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>';
    });

    var final = getFinalScore(cid, t.id);
    var fc = final >= 3.5 ? 'var(--success)' :
             final >= 2.5 ? 'var(--info)' :
             final >= 1.5 ? 'var(--warning)' : 'var(--danger)';
    h += '<td><b style="font-size:15px;color:' + fc + ';">' + final.toFixed(2) + '</b></td></tr>';
  });

  h += '</tbody></table></div>';
  h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary" onclick="exportRekapNilaiLengkap(\'' + cid + '\')">' +
      ico('download') + ' Export Excel</button>' +
    '<button class="btn" onclick="closeModal()">Tutup</button></div>';

  openModalSafe('Rekap Nilai Lengkap', h);
};

window.exportRekapNilaiLengkap = function(cid){
  var c = findClass(cid);
  if (!c) return;
  var stages = getActiveStages(cid);
  var students = c.students || [];

  var header = ['No', 'Nama', 'Peran'];
  stages.forEach(function(s){
    header.push(s.name + ' - Guru');
    header.push(s.name + ' - Ketua');
    header.push(s.name + ' - Rekan');
    header.push(s.name + ' - Final');
  });
  header.push('Nilai Akhir');

  var rows = [header];
  students.forEach(function(t, i){
    var row = [i+1, t.name, getStrukturMeta(t.role).jabatan];
    stages.forEach(function(s){
      var bd = getStageScoreWithBreakdown(cid, t.id, s.id);
      row.push(bd.guru !== null ? bd.guru.toFixed(2) : '-');
      row.push(bd.ketua !== null ? bd.ketua.toFixed(2) : '-');
      row.push(bd.rekan !== null ? bd.rekan.toFixed(2) : '-');
      row.push(bd.final.toFixed(2));
    });
    row.push(getFinalScore(cid, t.id).toFixed(2));
    rows.push(row);
  });

  if (!window.XLSX){ alert('Library Excel belum siap'); return; }
  var ws = XLSX.utils.aoa_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Lengkap');
  XLSX.writeFile(wb, 'Rekap_Lengkap_' + c.name.replace(/\s+/g, '_') + '.xlsx');
};

/* ============================================================
   STRUKTUR KERABAT KERJA
   ============================================================ */
window.openStrukturKerabatKerja = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var c = findClass(cid);
  if (!c) return;

  var students = c.students || [];
  var myRole = uRole();
  var myId = uSid();
  var canEdit = isGuru() || myRole === 'pimpinan_produksi';

  var divisiGroups = {
    'Pengurus Inti': [],
    'Koor Produksi': [],
    'Anggota Produksi': [],
    'Koor Artistik': [],
    'Anggota Artistik': [],
    'Pemeran': []
  };

  students.forEach(function(s){
    var meta = getStrukturMeta(s.role);
    if (divisiGroups[meta.grup]) divisiGroups[meta.grup].push({student:s, meta:meta});
  });

  Object.keys(divisiGroups).forEach(function(k){
    divisiGroups[k].sort(function(a, b){
      if (a.meta.level !== b.meta.level) return a.meta.level - b.meta.level;
      return String(a.student.name).localeCompare(String(b.student.name));
    });
  });

  var h = '';
  h += '<div class="alert alert-info">' + ico('award') +
    '<div><b>Struktur Organisasi Teater</b><br>' +
    '<small>' + esc(c.name) + ' — ' + students.length + ' siswa</small></div></div>';

  if (myId && myRole){
    var myMeta = getStrukturMeta(myRole);
    h += '<div class="alert alert-success" style="display:flex;align-items:center;gap:10px;">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--success-soft);' +
        'color:var(--success);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">' +
        esc((u().name || '?').charAt(0).toUpperCase()) + '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-weight:700;">' + esc(u().name) + '</div>' +
        '<div style="font-size:12px;">' + esc(myMeta.jabatan) + ' · ' + esc(myMeta.grup) + '</div>' +
      '</div>' +
      '<span class="badge badge-success">' + ico('check', 'sm') + ' Posisi Anda</span>' +
    '</div>';
  }

  var grupOrder = ['Pengurus Inti', 'Koor Produksi', 'Anggota Produksi', 'Koor Artistik', 'Anggota Artistik', 'Pemeran'];
  var grupIcons = {
    'Pengurus Inti':'shield','Koor Produksi':'briefcase','Anggota Produksi':'users',
    'Koor Artistik':'layers','Anggota Artistik':'users','Pemeran':'star'
  };
  var grupColors = {
    'Pengurus Inti':'blue','Koor Produksi':'green','Anggota Produksi':'blue',
    'Koor Artistik':'amber','Anggota Artistik':'amber','Pemeran':'red'
  };

  grupOrder.forEach(function(grup){
    var items = divisiGroups[grup];
    if (!items || items.length === 0) return;

    h += '<div class="card card-accent ' + (grupColors[grup] || 'blue') + '" style="margin-bottom:14px;">' +
      '<h3 style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<span>' + ico(grupIcons[grup] || 'users', 18) + ' ' + grup + '</span>' +
        '<span class="badge badge-gray">' + items.length + ' orang</span>' +
      '</h3>';

    items.forEach(function(item){
      var s = item.student;
      var meta = item.meta;
      var isMe = s.id === myId;
      var indent = (meta.level - 1) * 12;

      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;' +
        'margin-left:' + indent + 'px;' +
        'background:' + (isMe ? 'var(--primary-soft)' : 'var(--surface)') + ';' +
        'border-left:3px solid ' + (isMe ? 'var(--primary)' : 'var(--border)') + ';' +
        'border-radius:8px;margin-bottom:6px;">';

      h += '<div style="width:32px;height:32px;border-radius:50%;' +
        'background:' + (isMe ? 'var(--primary)' : 'var(--card)') + ';' +
        'color:' + (isMe ? '#fff' : 'var(--text)') + ';' +
        'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">' +
        esc((s.name || '?').charAt(0).toUpperCase()) + '</div>';

      h += '<div style="flex:1;min-width:0;">' +
        '<div style="font-weight:700;font-size:13px;color:var(--text-strong);">' +
          esc(s.name) + (isMe ? ' <span class="badge badge-primary" style="font-size:9px;">Anda</span>' : '') +
        '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' + esc(meta.jabatan) + '</div>' +
      '</div>';

      if (s.phone){
        h += '<a href="https://wa.me/' +
          (window.WA && window.WA.formatPhone ? window.WA.formatPhone(s.phone) : s.phone) + '" ' +
          'target="_blank" rel="noopener" class="btn btn-sm" style="text-decoration:none;">' +
          ico('phone', 'sm') + '</a>';
      }

      h += '</div>';
    });

    h += '</div>';
  });

  if (canEdit){
    h += '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);' +
      'display:flex;flex-direction:column;gap:8px;">' +
      '<button class="btn btn-primary btn-block" onclick="exportStrukturToExcel()">' +
        ico('download') + ' Export ke Excel</button>' +
    '</div>';
  }

  openModalSafe('Struktur Organisasi', h);
};

window.exportStrukturToExcel = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var c = findClass(cid);
  if (!c) return;

  var rows = [['No', 'Nama', 'Peran', 'Jabatan', 'Grup', 'Level', 'Divisi', 'Email', 'No. WA']];
  var sorted = (c.students || []).slice().sort(function(a, b){
    var ma = getStrukturMeta(a.role), mb = getStrukturMeta(b.role);
    if (ma.level !== mb.level) return ma.level - mb.level;
    return String(a.name).localeCompare(String(b.name));
  });

  sorted.forEach(function(s, i){
    var meta = getStrukturMeta(s.role);
    rows.push([i+1, s.name, s.role, meta.jabatan, meta.grup, meta.level, meta.divisi, s.email || '', s.phone || '']);
  });

  if (!window.XLSX){ alert('Library Excel belum siap'); return; }
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:5},{wch:25},{wch:22},{wch:30},{wch:18},{wch:8},{wch:12},{wch:30},{wch:15}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Struktur');
  XLSX.writeFile(wb, 'Struktur_' + (c.name || 'Kelas').replace(/\s+/g, '_') + '.xlsx');
};

/* ============================================================
   DASHBOARD SISWA — Panel Penilaian
   ============================================================ */
window.openPenilaianSiswaDashboard = function(){
  var cid = uCid();
  var sid = uSid();
  if (!cid || !sid){ alert('Data siswa tidak ditemukan'); return; }
  var c = findClass(cid);
  if (!c) return;
  var me = c.students.find(function(s){ return s.id === sid; });
  if (!me) return;

  var stages = getActiveStages(cid);
  var allTargets = (c.students || []).filter(function(s){
    return s.id !== sid && canRoleEvaluate(me.role, s.role);
  });

  var totalNeeded = allTargets.length * stages.length;
  var totalDone = 0;
  allTargets.forEach(function(t){
    stages.forEach(function(s){
      var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var myScores = ev[sid] && ev[sid][s.id];
      if (myScores && Object.keys(myScores).length > 0) totalDone++;
    });
  });
  var pct = totalNeeded > 0 ? Math.round(totalDone / totalNeeded * 100) : 0;

  var h = '';
  h += '<div class="alert alert-info">' + ico('clipboard') +
    '<div><b>Penilaian Rekan</b><br>' +
    '<small>Anda menilai ' + allTargets.length + ' rekan × ' + stages.length + ' tahap</small></div></div>';

  h += '<div class="progress-banner">' +
    '<h3>' + ico('chart') + ' Progress</h3>' +
    '<div class="big-count">' + totalDone + ' / ' + totalNeeded + ' <span>selesai</span></div>' +
    '<div class="pct">' + pct + '%</div>' +
    '<div class="progress-container"><div class="progress-bar ' +
      (pct === 100 ? 'complete' : pct > 0 ? 'partial' : '') + '" style="width:' + pct + '%"></div></div>' +
  '</div>';

  if (stages.length === 0){
    h += '<div class="alert alert-warning">' + ico('lock') + '<div>Belum ada tahap aktif.</div></div>';
    openModalSafe('Penilaian Rekan', h);
    return;
  }

  stages.forEach(function(stage){
    var doneThis = 0;
    allTargets.forEach(function(t){
      var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var myScores = ev[sid] && ev[sid][stage.id];
      if (myScores && Object.keys(myScores).length > 0) doneThis++;
    });
    var sp = allTargets.length > 0 ? Math.round(doneThis / allTargets.length * 100) : 0;

    h += '<div class="card card-accent ' + (sp === 100 ? 'green' : 'blue') + '" style="margin-bottom:10px;">' +
      '<h3 style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<span>' + ico('layers', 16) + ' ' + esc(stage.name) + '</span>' +
        '<span class="badge ' + (sp === 100 ? 'badge-success' : 'badge-primary') + '">' +
          doneThis + '/' + allTargets.length +
        '</span>' +
      '</h3>' +
      '<div class="progress-container" style="margin:6px 0 10px;">' +
        '<div class="progress-bar ' + (sp === 100 ? 'complete' : sp > 0 ? 'partial' : '') + '" style="width:' + sp + '%"></div>' +
      '</div>' +
      '<button class="btn btn-primary btn-sm btn-block" ' +
        'onclick="openPenilaianTahap(\'' + cid + '\',\'' + stage.id + '\')">' +
        ico('edit', 'sm') + ' Beri Nilai Tahap Ini' +
      '</button>' +
    '</div>';
  });

  openModalSafe('Penilaian Rekan', h);
};

/* ============================================================
   HELPER: Buka Penilaian Guru
   ============================================================ */
window.openPenilaianGuruDashboard = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var c = findClass(cid);
  if (!c) return;

  var stages = getActiveStages(cid);
  var targets = (c.students || []).filter(function(s){ return canGuruEvaluateTarget(s.role); });

  var h = '';
  h += '<div class="alert alert-info">' + ico('target') +
    '<div><b>Sistem Penilaian Guru</b><br>' +
    '<small>Guru menilai Pimpinan Produksi & Sutradara (Bobot 40%)</small></div></div>';

  if (targets.length === 0){
    h += '<div class="empty-state">' + ico('users', 40) +
      '<p>Belum ada target. Pastikan sudah ada siswa dengan peran Pimpinan Produksi / Sutradara.</p></div>';
    openModalSafe('Penilaian Guru', h);
    return;
  }

  if (stages.length === 0){
    h += '<div class="alert alert-warning">' + ico('lock') +
      '<div>Belum ada tahap aktif. Aktifkan tahap dulu di menu Sistem Tahapan.</div></div>';
  }

  targets.forEach(function(t){
    var doneStages = 0;
    stages.forEach(function(s){
      var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var guruScores = ev.guru && ev.guru[s.id];
      if (guruScores && Object.keys(guruScores).length > 0) doneStages++;
    });
    var pct = stages.length > 0 ? Math.round(doneStages / stages.length * 100) : 0;
    var meta = getStrukturMeta(t.role);

    h += '<div class="card card-accent blue" style="margin-bottom:10px;">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<div style="width:44px;height:44px;border-radius:50%;background:var(--primary-soft);' +
          'color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;">' +
          esc((t.name || '?').charAt(0).toUpperCase()) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:700;font-size:14px;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' + esc(meta.jabatan) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="target-progress">' +
        '<div class="label">Progress</div>' +
        '<div class="progress-container"><div class="progress-bar ' +
          (pct === 100 ? 'complete' : pct > 0 ? 'partial' : '') + '" style="width:' + pct + '%"></div></div>' +
        '<div class="pct-mini">' + doneStages + '/' + stages.length + '</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-block" style="margin-top:10px;" ' +
        'onclick="openPenilaianTahapPilih(\'' + cid + '\',\'' + t.id + '\')">' +
        ico('edit') + ' Buka Form Penilaian' +
      '</button>' +
    '</div>';
  });

  openModalSafe('Penilaian Guru', h);
};

window.openPenilaianTahapPilih = function(cid, targetId){
  var c = findClass(cid);
  if (!c) return;
  var t = c.students.find(function(x){ return x.id === targetId; });
  if (!t) return;

  var stages = getActiveStages(cid);
  if (stages.length === 0){ alert('Tidak ada tahap aktif'); return; }

  var h = '';
  h += '<div class="alert alert-info">' + ico('user') +
    '<div>Menilai: <b>' + esc(t.name) + '</b><br>' +
    '<small>' + esc(getStrukturMeta(t.role).jabatan) + '</small></div></div>';

  stages.forEach(function(stage){
    var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId]) || {};
    var guruScores = ev.guru && ev.guru[stage.id];
    var done = guruScores && Object.keys(guruScores).length > 0;

    h += '<div class="card ' + (done ? 'card-accent green' : 'card-accent amber') + '" style="margin-bottom:10px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<div>' +
          '<div style="font-weight:700;font-size:13.5px;">' + esc(stage.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">Bobot ' + stage.weight + '%</div>' +
        '</div>' +
        (done ? '<span class="badge badge-success">' + ico('check', 'sm') + ' Selesai</span>' :
                '<span class="badge badge-warning">Belum</span>') +
      '</div>' +
      '<button class="btn btn-primary btn-sm btn-block" style="margin-top:10px;" ' +
        'onclick="openFormPenilaian(\'' + cid + '\',\'' + targetId + '\',\'' + stage.id + '\')">' +
        ico('edit', 'sm') + ' ' + (done ? 'Edit' : 'Nilai Sekarang') +
      '</button>' +
    '</div>';
  });

  openModalSafe('Pilih Tahap', h);
};

/* ============================================================
   LOG
   ============================================================ */
console.log('[features_score] v2.0 loaded — Tahapan + Penilaian + Struktur');

})();
