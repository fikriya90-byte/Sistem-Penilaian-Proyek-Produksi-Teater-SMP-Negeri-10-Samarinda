/* ============================================================
   SP-PPT features-tahapan.js — v3.0 FINAL
   Fitur:
   1. Sistem Tahapan CRUD lengkap
   2. Kontrol Tahapan (toggle, aktif semua, matikan semua)
   3. Deadline per tahap
   4. Validasi bobot 100%
   5. Form Penilaian Guru + Siswa
   6. Matriks Evaluator
   7. Rekap Nilai + Export Excel
   8. FAKTOR KEHADIRAN auto-multiply
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico){ console.warn('[features-tahapan] app.js belum di-load.'); return; }

/* ============================================================
   HELPERS
   ============================================================ */
function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_' + Date.now().toString(36) + Math.random().toString(36).substr(2,6)); }
function fmtDate(ts){ return window.fmtDate ? window.fmtDate(ts) : '-'; }
function fmtDateShort(s){ return window.fmtDateShort ? window.fmtDateShort(s) : '-'; }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t, b){ if (window.openModal) window.openModal(t, b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id===cid; }); }
function getStages(){ return window.DB.stages || []; }
function getActiveStages(cid){
  if (window.getActiveStages) return window.getActiveStages(cid);
  return [];
}
function getRubricFor(r){ return window.getRubricFor ? window.getRubricFor(r) : []; }
function canEval(eRole, tRole){
  if (window.canRoleEvaluate) return window.canRoleEvaluate(eRole, tRole);
  return false;
}
function logAct(t, m, k){ if (window.logActivity) window.logActivity(t, m, k); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }

/* ============================================================
   KALKULASI NILAI
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

/* ============================================================
   FAKTOR KEHADIRAN — Hitung dari Meetings
   ============================================================ */
window.getAttendanceFactorForStudent = function(cid, sid){
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
};

/* ============================================================
   HITUNG NILAI PER TAHAP DENGAN BREAKDOWN
   ============================================================ */
function getStageScoreWithBreakdown(cid, targetId, stageId){
  var c = findClass(cid);
  if (!c) return {guru:null, ketua:null, rekan:null, final:0, factor:1, breakdown:{}};
  var t = (c.students||[]).find(function(x){ return x.id===targetId; });
  if (!t) return {guru:null, ketua:null, rekan:null, final:0, factor:1, breakdown:{}};

  var rubric = getRubricFor(t.role);
  var ev = (window.DB.evaluations && window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId]) || {};

  var guruScore = null;
  var ketuaScores = [];
  var rekanScores = [];

  Object.keys(ev).forEach(function(eid){
    var scores = ev[eid] && ev[eid][stageId];
    if (!scores || Object.keys(scores).length === 0) return;
    var avg = calcWeightedAvg(scores, rubric);

    if (eid === 'guru'){ guruScore = avg; return; }

    var evStudent = (c.students||[]).find(function(x){ return x.id===eid; });
    if (!evStudent) return;

    if (evStudent.role === 'pimpinan_produksi' || evStudent.role === 'sutradara'){
      ketuaScores.push({id:eid, name:evStudent.name, role:evStudent.role, score:avg});
    } else {
      rekanScores.push({id:eid, name:evStudent.name, role:evStudent.role, score:avg});
    }
  });

  var ketuaAvg = ketuaScores.length > 0
    ? ketuaScores.reduce(function(a,b){ return a+b.score; }, 0) / ketuaScores.length
    : null;
  var rekanAvg = rekanScores.length > 0
    ? rekanScores.reduce(function(a,b){ return a+b.score; }, 0) / rekanScores.length
    : null;

  // Bobot dinamis
  var parts = [];
  if (guruScore !== null) parts.push({val:guruScore, weight:0.4});
  if (ketuaAvg !== null) parts.push({val:ketuaAvg, weight:0.3});
  if (rekanAvg !== null) parts.push({val:rekanAvg, weight:0.3});

  var finalScore = 0;
  if (parts.length > 0){
    var totalW = parts.reduce(function(a,p){ return a + p.weight; }, 0);
    parts.forEach(function(p){ finalScore += p.val * (p.weight/totalW); });
  }

  // Faktor Kehadiran — auto-multiply
  var attendanceFactor = 1.0;
  if (window.getAttendanceFactorForStudent){
    attendanceFactor = window.getAttendanceFactorForStudent(cid, targetId) || 1.0;
  }
  finalScore = finalScore * attendanceFactor;

  return {
    guru: guruScore,
    ketua: ketuaAvg,
    rekan: rekanAvg,
    final: Math.max(0, Math.min(4, finalScore)),
    factor: attendanceFactor,
    breakdown: {guru: guruScore, ketua: ketuaScores, rekan: rekanScores}
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
   1. SISTEM TAHAPAN — VIEW UTAMA
   ============================================================ */
window.openSistemTahapan = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas terlebih dahulu'); return; }
  var c = findClass(cid);
  if (!c){ alert('Kelas tidak ditemukan'); return; }

  var stages = getStages();
  var activeIds = (window.DB.activeStages[cid] && window.DB.activeStages[cid].activeIds) || [];
  if (!Array.isArray(activeIds)) activeIds = [];
  var canEdit = isGuru() || uRole()==='pimpinan_produksi' || uRole()==='sutradara';

  var totalW = stages.reduce(function(a,s){ return a + Number(s.weight||0); }, 0);
  var stageProgress = {};

  stages.forEach(function(s){
    var targets = (c.students||[]).filter(function(st){
      if (st.id === uSid()) return false;
      if (isGuru()) return window.canRoleEvaluate ? window.canRoleEvaluate('guru', st.role) : true;
      return canEval(uRole(), st.role);
    });
    var done = 0;
    targets.forEach(function(t){
      var myId = isGuru() ? 'guru' : uSid();
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      if (ev[myId] && ev[myId][s.id] && Object.keys(ev[myId][s.id]).length > 0) done++;
    });
    stageProgress[s.id] = {done:done, total:targets.length};
  });

  var h = '';
  h += '<div class="alert alert-info">' + ic('info') + '<div><b>Sistem Tahapan</b> &mdash; ' + esc(c.name) +
    '<br><small>' + activeIds.length + '/' + stages.length + ' tahap aktif &middot; Total bobot: ' + totalW + '%</small></div></div>';

  if (totalW !== 100){
    h += '<div class="alert alert-' + (totalW > 100 ? 'danger' : 'warning') + '">' + ic('warning') +
      '<div>Total bobot saat ini <b>' + totalW + '%</b>. Idealnya 100%. ' +
      (totalW > 100 ? '<b>Kurangi bobot</b> agar tidak melebihi 100%.' : 'Bisa ditambah untuk mencapai 100%.') +
      '</div></div>';
  } else {
    h += '<div class="alert alert-success">' + ic('check') + '<div>Total bobot sudah <b>100%</b> &mdash; siap digunakan.</div></div>';
  }

  if (canEdit){
    h += '<div class="action-row" style="margin-bottom:14px;">' +
      '<button class="btn btn-primary btn-sm" onclick="openTambahTahapan()">' + ic('plus','sm') + ' Tambah Tahap</button>' +
      '<button class="btn btn-sm" onclick="aktifkanSemuaTahapan(\'' + cid + '\')">' + ic('checkSquare','sm') + ' Aktifkan Semua</button>' +
      '<button class="btn btn-sm btn-danger" onclick="matikanSemuaTahapan(\'' + cid + '\')">' + ic('x','sm') + ' Matikan Semua</button>' +
      '</div>';
  }

  stages.forEach(function(stage, i){
    var isActive = activeIds.indexOf(stage.id) >= 0;
    var prog = stageProgress[stage.id] || {done:0, total:0};
    var pct = prog.total > 0 ? Math.round(prog.done/prog.total*100) : 0;
    var dl = (window.DB.deadlines[cid] && window.DB.deadlines[cid][stage.id]) || {};
    var deadlineStr = dl.date ? (fmtDateShort(dl.date) + (dl.time ? ' ' + dl.time : '')) : '';
    var overdue = dl.date ? (new Date(dl.date + 'T' + (dl.time||'23:59') + ':00').getTime() < Date.now()) : false;

    h += '<div class="card" style="margin-bottom:12px;border-left:4px solid ' + (isActive?'var(--success)':'var(--border-strong)') + ';">';

    h += '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">';
    h += '<div style="width:44px;height:44px;border-radius:12px;background:' + (isActive?'var(--success-soft)':'var(--surface)') + ';color:' + (isActive?'#065f46':'var(--text-muted)') + ';display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0;">' + (i+1) + '</div>';
    h += '<div style="flex:1;min-width:0;">';
    h += '<div style="font-weight:800;font-size:14.5px;color:var(--text-strong);">' + esc(stage.name) + '</div>';
    h += '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' + (stage.subtitle ? esc(stage.subtitle)+' &middot; ' : '') + 'Bobot ' + stage.weight + '%</div>';
    h += '</div>';
    h += '<span class="badge ' + (isActive?'badge-success':'badge-gray') + '">' + (isActive?'AKTIF':'TERKUNCI') + '</span>';
    h += '</div>';

    if (stage.description){
      h += '<div style="font-size:12.5px;color:var(--text);margin-bottom:10px;line-height:1.55;">' + esc(stage.description) + '</div>';
    }

    if (deadlineStr){
      h += '<div style="font-size:11.5px;margin-bottom:10px;display:flex;align-items:center;gap:5px;color:' + (overdue?'var(--danger)':'var(--text-muted)') + ';">' +
        ic('clock','sm') + ' Deadline: <b>' + esc(deadlineStr) + '</b>' +
        (overdue ? ' <span class="badge badge-danger">Lewat</span>' : '') +
        (dl.note ? ' &middot; ' + esc(dl.note) : '') +
      '</div>';
    } else if (isActive){
      h += '<div style="font-size:11.5px;margin-bottom:10px;color:var(--text-muted);">' + ic('clock','sm') + ' Belum ada deadline</div>';
    }

    if (isActive && prog.total > 0){
      h += '<div class="progress-container" style="margin-bottom:6px;">' +
        '<div class="progress-bar ' + (pct===100?'complete':pct>0?'partial':'') + '" style="width:' + pct + '%"></div></div>';
      h += '<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">' +
        prog.done + '/' + prog.total + ' penilaian selesai (' + pct + '%)' +
      '</div>';
    } else if (isActive && prog.total === 0){
      h += '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:10px;">Belum ada target untuk dinilai</div>';
    }

    h += '<div class="action-row" style="flex-wrap:wrap;">';
    if (canEdit){
      h += '<button class="btn btn-sm ' + (isActive?'btn-danger':'btn-primary') + '" onclick="toggleTahapan(\'' + cid + '\',\'' + stage.id + '\')">' +
        ic(isActive?'x':'check','sm') + ' ' + (isActive?'Matikan':'Aktifkan') + '</button>';
      h += '<button class="btn btn-sm" onclick="openEditTahapan(\'' + stage.id + '\')">' + ic('edit','sm') + ' Edit</button>';
      h += '<button class="btn btn-sm" onclick="openAturDeadline(\'' + cid + '\',\'' + stage.id + '\')">' + ic('calendar','sm') + ' Deadline</button>';
      if (stages.length > 1){
        h += '<button class="btn btn-sm btn-danger" onclick="hapusTahapan(\'' + stage.id + '\')">' + ic('trash','sm') + ' Hapus</button>';
      }
    }
    if (isActive){
      h += '<button class="btn btn-sm btn-primary" onclick="openPenilaianTahap(\'' + cid + '\',\'' + stage.id + '\')">' + ic('edit','sm') + ' Nilai</button>';
      h += '<button class="btn btn-sm" onclick="openRekapTahap(\'' + cid + '\',\'' + stage.id + '\')">' + ic('chart','sm') + ' Rekap</button>';
    }
    h += '</div>';
    h += '</div>';
  });

  openModal('Sistem Tahapan &mdash; ' + esc(c.name), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   2. CRUD TAHAPAN
   ============================================================ */
window.openTambahTahapan = function(){
  openModal('Tambah Tahapan',
    '<div class="form-group"><label>Nama Tahapan</label>' +
    '<input id="stg-name" placeholder="Contoh: Perencanaan" maxlength="60"></div>' +
    '<div class="form-group"><label>Sub-Judul (opsional)</label>' +
    '<input id="stg-sub" placeholder="Contoh: Pra-Produksi" maxlength="60"></div>' +
    '<div class="form-group"><label>Deskripsi Singkat</label>' +
    '<textarea id="stg-desc" rows="2" maxlength="200"></textarea></div>' +
    '<div class="form-group"><label>Deskripsi Panjang (opsional)</label>' +
    '<textarea id="stg-long" rows="3" maxlength="500"></textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label>' +
    '<input type="number" id="stg-w" min="1" max="100" value="20"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanTahapanBaru()">' + ic('save') + ' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanTahapanBaru = function(){
  var name = (document.getElementById('stg-name').value || '').trim();
  var sub = (document.getElementById('stg-sub').value || '').trim();
  var desc = (document.getElementById('stg-desc').value || '').trim();
  var long = (document.getElementById('stg-long').value || '').trim();
  var weight = parseFloat(document.getElementById('stg-w').value) || 0;

  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }
  if (weight <= 0 || weight > 100){ alert('Bobot 1-100'); return; }

  var stages = getStages().slice();
  var totalW = stages.reduce(function(a,s){ return a + Number(s.weight||0); }, 0);
  if (totalW + weight > 100){
    if (!confirm('Total bobot akan menjadi ' + (totalW+weight) + '% (melebihi 100%). Lanjutkan?')) return;
  }

  stages.push({
    id: 'stage_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name: name, subtitle: sub, description: desc, longDesc: long, weight: weight
  });

  window.fbSet('config', 'stages', {stages: stages}).then(function(){
    alert('Tahapan ditambahkan!');
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(); }, 250);
  });
};

window.openEditTahapan = function(stageId){
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage){ alert('Tahapan tidak ditemukan'); return; }

  openModal('Edit Tahapan',
    '<div class="form-group"><label>Nama Tahapan</label>' +
    '<input id="stg-name" value="' + esc(stage.name) + '" maxlength="60"></div>' +
    '<div class="form-group"><label>Sub-Judul</label>' +
    '<input id="stg-sub" value="' + esc(stage.subtitle||'') + '" maxlength="60"></div>' +
    '<div class="form-group"><label>Deskripsi Singkat</label>' +
    '<textarea id="stg-desc" rows="2" maxlength="200">' + esc(stage.description||'') + '</textarea></div>' +
    '<div class="form-group"><label>Deskripsi Panjang</label>' +
    '<textarea id="stg-long" rows="3" maxlength="500">' + esc(stage.longDesc||'') + '</textarea></div>' +
    '<div class="form-group"><label>Bobot (%)</label>' +
    '<input type="number" id="stg-w" min="1" max="100" value="' + stage.weight + '"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanEditTahapan(\'' + stageId + '\')">' + ic('save') + ' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanEditTahapan = function(stageId){
  var name = (document.getElementById('stg-name').value || '').trim();
  var sub = (document.getElementById('stg-sub').value || '').trim();
  var desc = (document.getElementById('stg-desc').value || '').trim();
  var long = (document.getElementById('stg-long').value || '').trim();
  var weight = parseFloat(document.getElementById('stg-w').value) || 0;

  if (!name || name.length < 3){ alert('Nama minimal 3 karakter'); return; }
  if (weight <= 0 || weight > 100){ alert('Bobot 1-100'); return; }

  var stages = getStages().map(function(s){
    if (s.id !== stageId) return s;
    return Object.assign({}, s, {
      name: name, subtitle: sub, description: desc, longDesc: long, weight: weight
    });
  });

  var totalW = stages.reduce(function(a,s){ return a + Number(s.weight||0); }, 0);
  if (totalW !== 100){
    if (!confirm('Total bobot akan menjadi ' + totalW + '%. Lanjutkan?')) return;
  }

  window.fbSet('config', 'stages', {stages: stages}).then(function(){
    alert('Tahapan diperbarui!');
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(); }, 250);
  });
};

window.hapusTahapan = function(stageId){
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage) return;
  var stages = getStages();
  if (stages.length <= 1){ alert('Minimal harus ada 1 tahapan'); return; }
  if (!confirm('Hapus tahapan "' + stage.name + '"?\n\nSemua penilaian pada tahap ini akan hilang.')) return;

  var newStages = stages.filter(function(s){ return s.id !== stageId; });
  window.fbSet('config', 'stages', {stages: newStages}).then(function(){
    alert('Tahapan dihapus');
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(); }, 250);
  });
};

/* ============================================================
   3. KONTROL AKTIVASI
   ============================================================ */
window.toggleTahapan = function(cid, stageId){
  var cur = (window.DB.activeStages[cid] && window.DB.activeStages[cid].activeIds) || [];
  if (!Array.isArray(cur)) cur = [];
  var newIds;
  if (cur.indexOf(stageId) >= 0){
    newIds = cur.filter(function(id){ return id !== stageId; });
  } else {
    newIds = cur.concat([stageId]);
  }
  window.fbSet('activeStages', cid, {classId:cid, activeIds: newIds, updatedAt: Date.now()}).then(function(){
    logAct('stage_toggle', (u().name||'User') + ' ' + (cur.indexOf(stageId)>=0?'mematikan':'mengaktifkan') + ' tahapan', {classId:cid});
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.aktifkanSemuaTahapan = function(cid){
  if (!confirm('Aktifkan semua tahapan?')) return;
  var ids = getStages().map(function(s){ return s.id; });
  window.fbSet('activeStages', cid, {classId:cid, activeIds: ids, updatedAt: Date.now()}).then(function(){
    logAct('stage_toggle_all', (u().name||'User') + ' mengaktifkan semua tahapan', {classId:cid});
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.matikanSemuaTahapan = function(cid){
  if (!confirm('Matikan semua tahapan? Siswa tidak bisa menilai.')) return;
  window.fbSet('activeStages', cid, {classId:cid, activeIds: [], updatedAt: Date.now()}).then(function(){
    logAct('stage_toggle_all', (u().name||'User') + ' mematikan semua tahapan', {classId:cid});
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

/* ============================================================
   4. DEADLINE
   ============================================================ */
window.openAturDeadline = function(cid, stageId){
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage) return;
  var dl = (window.DB.deadlines[cid] && window.DB.deadlines[cid][stageId]) || {};

  openModal('Atur Deadline',
    '<div class="alert alert-info">' + ic('clock') + '<div>Atur deadline untuk: <b>' + esc(stage.name) + '</b></div></div>' +
    '<div class="form-group"><label>Tanggal</label>' +
    '<input type="date" id="dl-date" value="' + (dl.date||'') + '"></div>' +
    '<div class="form-group"><label>Jam (opsional)</label>' +
    '<input type="time" id="dl-time" value="' + (dl.time||'23:59') + '"></div>' +
    '<div class="form-group"><label>Catatan</label>' +
    '<textarea id="dl-note" rows="2" maxlength="150">' + esc(dl.note||'') + '</textarea></div>' +
    '<div class="action-row">' +
    '<button class="btn btn-primary" style="flex:1;" onclick="simpanDeadline(\'' + cid + '\',\'' + stageId + '\')">' + ic('save') + ' Simpan</button>' +
    (dl.date ? '<button class="btn btn-danger" onclick="hapusDeadline(\'' + cid + '\',\'' + stageId + '\')">' + ic('trash') + ' Hapus</button>' : '') +
    '</div>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanDeadline = function(cid, stageId){
  var date = document.getElementById('dl-date').value;
  var time = document.getElementById('dl-time').value || '23:59';
  var note = (document.getElementById('dl-note').value || '').trim();
  if (!date){ alert('Tanggal wajib diisi'); return; }

  var existing = Object.assign({}, (window.DB.deadlines[cid] || {}));
  existing[stageId] = { date: date, time: time, note: note, setBy: u().name || '', setAt: Date.now() };

  window.fbSet('deadlines', cid, Object.assign({}, existing, {classId:cid})).then(function(){
    alert('Deadline tersimpan');
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

window.hapusDeadline = function(cid, stageId){
  if (!confirm('Hapus deadline tahap ini?')) return;
  var existing = Object.assign({}, (window.DB.deadlines[cid] || {}));
  delete existing[stageId];
  existing.classId = cid;
  window.fbSet('deadlines', cid, existing).then(function(){
    alert('Deadline dihapus');
    closeModal();
    setTimeout(function(){ window.openSistemTahapan(cid); }, 200);
  });
};

/* ============================================================
   5. FORM PENILAIAN GURU
   ============================================================ */
window.openPenilaianGuruDashboard = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid);
  if (!c) return;

  var activeStages = getActiveStages(cid);
  var targets = (c.students||[]).filter(function(s){
    return s.role === 'pimpinan_produksi' || s.role === 'sutradara';
  });

  var h = '<div class="alert alert-info">' + ic('target') + '<div><b>Penilaian Guru</b><br><small>Guru menilai Pimpinan Produksi & Sutradara (bobot 40%)</small></div></div>';

  if (targets.length === 0){
    h += '<div class="empty-state">' + ic('users',40) + '<p>Belum ada siswa dengan peran <b>Pimpinan Produksi</b> atau <b>Sutradara</b>.</p></div>';
    openModal('Penilaian Guru', h);
    return;
  }
  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">' + ic('lock') + '<div>Belum ada tahap aktif. Aktifkan di Sistem Tahapan.</div></div>';
  }

  targets.forEach(function(t){
    var meta = window.getStrukturMeta ? window.getStrukturMeta(t.role) : {jabatan:t.role};
    var doneStages = 0;
    activeStages.forEach(function(s){
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var gs = ev.guru && ev.guru[s.id];
      if (gs && Object.keys(gs).length > 0) doneStages++;
    });
    var pct = activeStages.length > 0 ? Math.round(doneStages/activeStages.length*100) : 0;
    var final = getFinalScore(cid, t.id);

    h += '<div class="card" style="margin-bottom:10px;border-left:4px solid var(--primary);">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<div style="width:44px;height:44px;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">' + esc((t.name||'?').charAt(0).toUpperCase()) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:700;font-size:14px;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(meta.jabatan) + '</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          '<div style="font-size:11px;color:var(--text-muted);">Nilai Akhir</div>' +
          '<div style="font-size:18px;font-weight:800;color:var(--primary);">' + final.toFixed(2) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="target-progress">' +
        '<div class="label">Progress</div>' +
        '<div class="progress-container"><div class="progress-bar ' + (pct===100?'complete':pct>0?'partial':'') + '" style="width:' + pct + '%"></div></div>' +
        '<div class="pct-mini">' + doneStages + '/' + activeStages.length + '</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-block" style="margin-top:10px;" onclick="openPilihTahapGuru(\'' + cid + '\',\'' + t.id + '\')">' +
        ic('edit') + ' Buka Form Penilaian' +
      '</button>' +
    '</div>';
  });

  openModal('Penilaian Guru', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openPilihTahapGuru = function(cid, targetId){
  var c = findClass(cid);
  if (!c) return;
  var t = (c.students||[]).find(function(x){ return x.id===targetId; });
  if (!t) return;
  var activeStages = getActiveStages(cid);
  if (activeStages.length === 0){ alert('Tidak ada tahap aktif.'); return; }

  var h = '<div class="alert alert-info">' + ic('user') + '<div>Menilai: <b>' + esc(t.name) + '</b><br><small>' + esc(roleLabel(t.role)) + '</small></div></div>';

  activeStages.forEach(function(stage){
    var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId]) || {};
    var gs = ev.guru && ev.guru[stage.id];
    var done = gs && Object.keys(gs).length > 0;
    h += '<div class="card ' + (done?'':'') + '" style="margin-bottom:8px;cursor:pointer;border-left:4px solid ' + (done?'var(--success)':'var(--warning)') + ';" onclick="openFormNilaiGuru(\'' + cid + '\',\'' + targetId + '\',\'' + stage.id + '\')">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<div>' +
          '<div style="font-weight:700;font-size:13.5px;">' + esc(stage.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">Bobot ' + stage.weight + '%</div>' +
        '</div>' +
        (done ? '<span class="badge badge-success">' + ic('check','sm') + ' Selesai</span>' : '<span class="badge badge-warning">Belum</span>') +
      '</div>' +
    '</div>';
  });

  openModal('Pilih Tahap', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openFormNilaiGuru = function(cid, targetId, stageId){
  var c = findClass(cid);
  if (!c) return;
  var t = (c.students||[]).find(function(x){ return x.id===targetId; });
  if (!t) return;
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage) return;
  var rubric = getRubricFor(t.role);
  var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId] && window.DB.evaluations[cid][targetId].guru && window.DB.evaluations[cid][targetId].guru[stageId]) || {};

  var h = '<div class="alert alert-info">' + ic('info') + '<div>Nilai <b>' + esc(t.name) + '</b> &mdash; ' + esc(stage.name) + '<br><small>Nilai berdasarkan <b>bukti nyata</b>.</small></div></div>';
  h += '<div class="scale-guide"><div class="scale-guide-title">' + ic('info','sm') + ' Panduan Skala</div>' +
    '<div class="scale-guide-grid">' +
    '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
    '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
    '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
    '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
    '</div></div>';

  rubric.forEach(function(r){
    var val = ev[r.id];
    h += '<div class="rubric-item">' +
      '<h4>' + esc(r.name) + ' <span class="weight-info">' + r.weight + '%</span></h4>' +
      '<div class="desc">' + esc(r.desc||'') + '</div>' +
      '<div class="radio-group">';
    var labels = {4:'Sangat Baik', 3:'Baik', 2:'Cukup', 1:'Kurang'};
    [4,3,2,1].forEach(function(v){
      h += '<label class="rs-' + v + '"><input type="radio" name="gscore_' + stageId + '_' + r.id + '" value="' + v + '" ' +
        (val===v?'checked':'') + ' onchange="autoSaveNilaiGuru(\'' + cid + '\',\'' + targetId + '\',\'' + stageId + '\',\'' + r.id + '\',this.value)">' +
        '<b>' + v + ' - ' + labels[v] + '</b></label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:14px;" onclick="closeModal();openPilihTahapGuru(\'' + cid + '\',\'' + targetId + '\')">' + ic('check') + ' Selesai</button>';

  openModal('Nilai: ' + esc(t.name), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.autoSaveNilaiGuru = function(cid, targetId, stageId, rubricId, val){
  var score = parseFloat(val);
  if (isNaN(score)) return;
  var docId = cid + '__' + targetId;
  if (!window.fb || !window.fbReady){ console.warn('Firebase belum siap'); return; }

  var doc = window.fb.collection('evaluations').doc(docId);
  doc.get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:targetId};
    data.guru = data.guru || {};
    data.guru[stageId] = data.guru[stageId] || {};
    data.guru[stageId][rubricId] = score;
    return doc.set(window.sanitizeFirestore ? window.sanitizeFirestore(data) : data, {merge:true});
  }).catch(function(e){ console.error('[autoSaveNilaiGuru]', e); });
};

/* ============================================================
   6. FORM PENILAIAN SISWA
   ============================================================ */
window.openPenilaianSiswaDashboard = function(){
  var cid = uCid();
  var sid = uSid();
  if (!cid || !sid){ alert('Data siswa tidak ditemukan'); return; }
  var c = findClass(cid);
  if (!c) return;
  var me = (c.students||[]).find(function(s){ return s.id===sid; });
  if (!me) return;

  var activeStages = getActiveStages(cid);
  var targets = (c.students||[]).filter(function(s){
    return s.id !== sid && canEval(me.role, s.role);
  });

  var totalNeeded = targets.length * activeStages.length;
  var totalDone = 0;
  targets.forEach(function(t){
    activeStages.forEach(function(s){
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var my = ev[sid] && ev[sid][s.id];
      if (my && Object.keys(my).length > 0) totalDone++;
    });
  });
  var pct = totalNeeded > 0 ? Math.round(totalDone/totalNeeded*100) : 0;

  var h = '<div class="progress-banner">' +
    '<h3>' + ic('chart') + ' Progress Penilaian Anda</h3>' +
    '<div class="big-count">' + totalDone + ' / ' + totalNeeded + ' <span>selesai</span></div>' +
    '<div class="pct">' + pct + '% &mdash; Anda menilai ' + targets.length + ' rekan</div>' +
    '<div class="progress-container"><div class="progress-bar ' + (pct===100?'complete':pct>0?'partial':'') + '" style="width:' + pct + '%"></div></div>' +
  '</div>';

  if (activeStages.length === 0){
    h += '<div class="alert alert-warning">' + ic('lock') + '<div>Belum ada tahap aktif dari guru.</div></div>';
    openModal('Penilaian Rekan', h);
    return;
  }
  if (targets.length === 0){
    h += '<div class="empty-state">' + ic('users',40) + '<p>Tidak ada rekan yang bisa Anda nilai.</p></div>';
    openModal('Penilaian Rekan', h);
    return;
  }

  h += '<h3 style="margin:16px 0 10px;font-size:14.5px;font-weight:700;">' + ic('layers') + ' Pilih Tahap</h3>';
  activeStages.forEach(function(stage){
    var doneCount = 0;
    targets.forEach(function(t){
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
      var my = ev[sid] && ev[sid][stage.id];
      if (my && Object.keys(my).length > 0) doneCount++;
    });
    var sp = targets.length > 0 ? Math.round(doneCount/targets.length*100) : 0;
    h += '<div class="card" style="margin-bottom:8px;cursor:pointer;border-left:4px solid ' + (sp===100?'var(--success)':'var(--primary)') + ';" onclick="openPenilaianTahap(\'' + cid + '\',\'' + stage.id + '\')">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<div>' +
          '<div style="font-weight:700;font-size:13.5px;">' + esc(stage.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + doneCount + '/' + targets.length + ' rekan dinilai</div>' +
        '</div>' +
        '<span class="badge ' + (sp===100?'badge-success':'badge-primary') + '">' + sp + '%</span>' +
      '</div>' +
    '</div>';
  });

  openModal('Penilaian Rekan', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openPenilaianTahap = function(cid, stageId, presetTargetId){
  var c = findClass(cid);
  if (!c) return;
  var sid = uSid();
  var me = (c.students||[]).find(function(s){ return s.id===sid; });
  if (!me){ alert('Data tidak ditemukan'); return; }
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage){ alert('Tahap tidak ditemukan'); return; }
  if (!window.isStageActive(cid, stageId)){ alert('Tahap ini belum aktif'); return; }

  var targets = (c.students||[]).filter(function(s){
    return s.id !== sid && canEval(me.role, s.role);
  });

  if (targets.length === 0){
    openModal('Penilaian: ' + esc(stage.name),
      '<div class="empty-state">' + ic('users',40) + '<p>Tidak ada rekan untuk dinilai.</p></div>');
    return;
  }

  if (presetTargetId) return openFormNilaiSiswa(cid, presetTargetId, stageId);

  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>' + esc(stage.name) + '</b><br><small>Pilih rekan untuk dinilai</small></div></div>';

  targets.forEach(function(t){
    var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
    var my = ev[sid] && ev[sid][stageId];
    var done = my && Object.keys(my).length > 0;
    var meta = window.getStrukturMeta ? window.getStrukturMeta(t.role) : {jabatan:t.role};
    h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + (done?'var(--success)':'var(--warning)') + ';">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:' + (done?'var(--success-soft)':'var(--primary-soft)') + ';color:' + (done?'var(--success)':'var(--primary)') + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;">' + esc((t.name||'?').charAt(0).toUpperCase()) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:700;font-size:13.5px;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + esc(meta.jabatan) + '</div>' +
        '</div>' +
        (done ? '<span class="badge badge-success">' + ic('check','sm') + ' Sudah</span>' : '') +
      '</div>' +
      '<button class="btn btn-primary btn-sm btn-block" style="margin-top:10px;" onclick="openFormNilaiSiswa(\'' + cid + '\',\'' + t.id + '\',\'' + stageId + '\')">' +
        ic('edit','sm') + ' ' + (done?'Edit Nilai':'Beri Nilai') +
      '</button>' +
    '</div>';
  });

  openModal('Penilaian: ' + esc(stage.name), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openFormNilaiSiswa = function(cid, targetId, stageId){
  var c = findClass(cid);
  if (!c) return;
  var me = (c.students||[]).find(function(s){ return s.id===uSid(); });
  if (!me) return;
  var t = (c.students||[]).find(function(x){ return x.id===targetId; });
  if (!t) return;
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage) return;
  var rubric = getRubricFor(t.role);
  var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][targetId]) || {};
  var my = (ev[me.id] && ev[me.id][stageId]) || {};

  var h = '<div class="alert alert-info">' + ic('user') + '<div>Menilai <b>' + esc(t.name) + '</b> &mdash; ' + esc(stage.name) + '<br><small>' + esc(roleLabel(t.role)) + '</small></div></div>';
  h += '<div class="alert alert-warning">' + ic('warning','sm') + '<div>Nilai yang objektif membantu rekan berkembang.</div></div>';
  h += '<div class="scale-guide"><div class="scale-guide-title">' + ic('info','sm') + ' Skala</div>' +
    '<div class="scale-guide-grid">' +
    '<div class="scale-guide-item sg-4"><b>4</b><span>Sangat Baik</span></div>' +
    '<div class="scale-guide-item sg-3"><b>3</b><span>Baik</span></div>' +
    '<div class="scale-guide-item sg-2"><b>2</b><span>Cukup</span></div>' +
    '<div class="scale-guide-item sg-1"><b>1</b><span>Kurang</span></div>' +
    '</div></div>';

  rubric.forEach(function(r){
    var v = my[r.id];
    h += '<div class="rubric-item">' +
      '<h4>' + esc(r.name) + '</h4>' +
      '<div class="desc">' + esc(r.desc||'') + '</div>' +
      '<div class="radio-group">';
    var labels = {4:'Sangat Baik', 3:'Baik', 2:'Cukup', 1:'Kurang'};
    [4,3,2,1].forEach(function(val){
      h += '<label class="rs-' + val + '"><input type="radio" name="sscore_' + stageId + '_' + r.id + '" value="' + val + '" ' + (v===val?'checked':'') + '><b>' + val + ' - ' + labels[val] + '</b></label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:14px;" onclick="simpanNilaiSiswa(\'' + cid + '\',\'' + targetId + '\',\'' + stageId + '\')">' + ic('save') + ' Simpan Penilaian</button>';

  openModal('Nilai: ' + esc(t.name), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanNilaiSiswa = function(cid, targetId, stageId){
  var c = findClass(cid);
  if (!c) return;
  var me = (c.students||[]).find(function(s){ return s.id===uSid(); });
  if (!me) return;
  var t = (c.students||[]).find(function(x){ return x.id===targetId; });
  if (!t) return;
  var rubric = getRubricFor(t.role);
  var scores = {}, missing = [];

  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="sscore_' + stageId + '_' + r.id + '"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });

  if (missing.length > 0){
    alert('Belum lengkap. Harap isi:\n• ' + missing.slice(0,5).join('\n• ') +
      (missing.length > 5 ? '\n• ...+' + (missing.length-5) + ' lagi' : ''));
    return;
  }
  if (!window.fb || !window.fbReady){ alert('Firebase belum siap'); return; }

  var docId = cid + '__' + targetId;
  var doc = window.fb.collection('evaluations').doc(docId);
  doc.get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:targetId};
    data[me.id] = data[me.id] || {};
    data[me.id][stageId] = scores;
    return doc.set(window.sanitizeFirestore ? window.sanitizeFirestore(data) : data, {merge:true});
  }).then(function(){
    logAct('eval_submit', me.name + ' menilai ' + t.name + ' pada ' + stageId, {classId:cid, role:me.role});
    alert('Penilaian tersimpan!');
    closeModal();
    setTimeout(function(){ window.openPenilaianTahap(cid, stageId); }, 250);
  }).catch(function(e){ alert('Gagal: ' + e.message); });
};

/* ============================================================
   7. REKAP PER TAHAP
   ============================================================ */
window.openRekapTahap = function(cid, stageId){
  var c = findClass(cid);
  if (!c) return;
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage) return;

  var h = '<div class="alert alert-info">' + ic('chart') + '<div><b>Rekap: ' + esc(stage.name) + '</b><br><small>Bobot: ' + stage.weight + '% &middot; G:40% + K:30% + R:30% × Kehadiran</small></div></div>';
  h += '<div class="table-wrap"><table style="min-width:600px;"><thead><tr>' +
    '<th>No</th><th>Nama</th><th>Peran</th><th>Guru</th><th>Ketua</th><th>Rekan</th><th>Faktor</th><th>Nilai</th>' +
    '</tr></thead><tbody>';

  (c.students||[]).forEach(function(s, i){
    var bd = getStageScoreWithBreakdown(cid, s.id, stageId);
    var color = bd.final >= 3.5 ? 'badge-success' : bd.final >= 2.5 ? 'badge-info' : bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';
    var meta = window.getStrukturMeta ? window.getStrukturMeta(s.role) : {jabatan:s.role};
    h += '<tr>' +
      '<td>' + (i+1) + '</td>' +
      '<td><b>' + esc(s.name) + '</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' + esc(meta.jabatan) + '</span></td>' +
      '<td>' + (bd.guru !== null ? bd.guru.toFixed(2) : '-') + '</td>' +
      '<td>' + (bd.ketua !== null ? bd.ketua.toFixed(2) : '-') + '</td>' +
      '<td>' + (bd.rekan !== null ? bd.rekan.toFixed(2) : '-') + '</td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' + bd.factor.toFixed(2) + '</span></td>' +
      '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>' +
    '</tr>';
  });
  h += '</tbody></table></div>';
  h += '<div class="action-row" style="margin-top:14px;">' +
    '<button class="btn btn-primary" onclick="exportRekapTahap(\'' + cid + '\',\'' + stageId + '\')">' + ic('download') + ' Export Excel</button>' +
    '<button class="btn" onclick="closeModal()">Tutup</button>' +
  '</div>';

  openModal('Rekap Tahap', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.exportRekapTahap = function(cid, stageId){
  var c = findClass(cid);
  if (!c) return;
  var stage = getStages().find(function(s){ return s.id===stageId; });
  if (!stage) return;
  if (!window.XLSX){ alert('Library Excel belum siap'); return; }

  var rows = [['No','Nama','Peran','Guru','Ketua','Rekan','Faktor Kehadiran','Nilai Akhir']];
  (c.students||[]).forEach(function(s, i){
    var bd = getStageScoreWithBreakdown(cid, s.id, stageId);
    rows.push([
      i+1, s.name, roleLabel(s.role),
      bd.guru !== null ? bd.guru.toFixed(2) : '-',
      bd.ketua !== null ? bd.ketua.toFixed(2) : '-',
      bd.rekan !== null ? bd.rekan.toFixed(2) : '-',
      bd.factor.toFixed(2),
      bd.final.toFixed(2)
    ]);
  });
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:5},{wch:25},{wch:28},{wch:8},{wch:8},{wch:8},{wch:12},{wch:10}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, stage.name.substring(0,30));
  XLSX.writeFile(wb, 'Rekap_' + stage.name.replace(/\s+/g,'_') + '_' + c.name.replace(/\s+/g,'_') + '.xlsx');
};

/* ============================================================
   8. REKAP LENGKAP
   ============================================================ */
window.openRekapNilai = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid);
  if (!c) return;

  var stages = getActiveStages(cid);
  var students = c.students || [];

  var h = '<div class="alert alert-info">' + ic('chart') + '<div><b>Rekap Nilai Lengkap</b><br><small>Bobot: Guru 40% + Ketua 30% + Rekan 30% × Faktor Kehadiran</small></div></div>';

  if (students.length === 0){
    h += '<div class="empty-state">' + ic('users',40) + '<p>Belum ada siswa</p></div>';
    openModal('Rekap Nilai', h);
    return;
  }
  if (stages.length === 0){
    h += '<div class="alert alert-warning">' + ic('lock') + '<div>Belum ada tahap aktif.</div></div>';
    openModal('Rekap Nilai', h);
    return;
  }

  h += '<div class="table-wrap" style="max-height:60vh;overflow-y:auto;">';
  h += '<table style="min-width:700px;"><thead><tr>';
  h += '<th>No</th><th>Nama</th><th>Peran</th>';
  stages.forEach(function(s){ h += '<th>' + esc(s.name) + '<br><small>(' + s.weight + '%)</small></th>'; });
  h += '<th>Nilai Akhir</th></tr></thead><tbody>';

  var rows = students.map(function(t, i){
    var stageScores = stages.map(function(s){ return getStageScoreWithBreakdown(cid, t.id, s.id); });
    var totalW = 0, weighted = 0;
    stageScores.forEach(function(bd, idx){
      weighted += bd.final * stages[idx].weight;
      totalW += stages[idx].weight;
    });
    var final = totalW > 0 ? weighted / totalW : 0;
    return {student:t, scores:stageScores, final:final};
  });

  rows.sort(function(a,b){ return b.final - a.final; });

  rows.forEach(function(r, ri){
    var t = r.student;
    var meta = window.getStrukturMeta ? window.getStrukturMeta(t.role) : {jabatan:t.role};
    h += '<tr>' +
      '<td>' + (ri+1) + '</td>' +
      '<td><b>' + esc(t.name) + '</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' + esc(meta.jabatan) + '</span></td>';
    r.scores.forEach(function(bd){
      var color = bd.final >= 3.5 ? 'badge-success' : bd.final >= 2.5 ? 'badge-info' : bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';
      h += '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>';
    });
    var fc = r.final >= 3.5 ? 'var(--success)' : r.final >= 2.5 ? 'var(--info)' : r.final >= 1.5 ? 'var(--warning)' : 'var(--danger)';
    h += '<td><b style="font-size:15px;color:' + fc + ';">' + r.final.toFixed(2) + '</b></td></tr>';
  });

  h += '</tbody></table></div>';
  h += '<div class="action-row" style="margin-top:14px;">' +
    '<button class="btn btn-primary" onclick="exportRekapLengkap(\'' + cid + '\')">' + ic('download') + ' Export Excel</button>' +
    '<button class="btn" onclick="closeModal()">Tutup</button>' +
  '</div>';

  openModal('Rekap Nilai Lengkap', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.exportRekapLengkap = function(cid){
  var c = findClass(cid);
  if (!c) return;
  if (!window.XLSX){ alert('Library Excel belum siap'); return; }
  var stages = getActiveStages(cid);
  var students = c.students || [];

  var header = ['No','Nama','Peran'];
  stages.forEach(function(s){
    header.push(s.name + ' - Guru');
    header.push(s.name + ' - Ketua');
    header.push(s.name + ' - Rekan');
    header.push(s.name + ' - Final');
  });
  header.push('Nilai Akhir');

  var rows = [header];
  students.forEach(function(t, i){
    var row = [i+1, t.name, roleLabel(t.role)];
    var totalW = 0, weighted = 0;
    stages.forEach(function(s){
      var bd = getStageScoreWithBreakdown(cid, t.id, s.id);
      row.push(bd.guru !== null ? bd.guru.toFixed(2) : '-');
      row.push(bd.ketua !== null ? bd.ketua.toFixed(2) : '-');
      row.push(bd.rekan !== null ? bd.rekan.toFixed(2) : '-');
      row.push(bd.final.toFixed(2));
      weighted += bd.final * s.weight;
      totalW += s.weight;
    });
    row.push((totalW > 0 ? weighted/totalW : 0).toFixed(2));
    rows.push(row);
  });

  var ws = XLSX.utils.aoa_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Lengkap');
  XLSX.writeFile(wb, 'Rekap_Lengkap_' + c.name.replace(/\s+/g, '_') + '.xlsx');
};

/* ============================================================
   EXPORTS
   ============================================================ */
window.getStageScoreWithBreakdown = getStageScoreWithBreakdown;
window.getFinalScore = getFinalScore;

console.log('[features-tahapan] v3.0 FINAL loaded');

})();
