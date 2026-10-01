/* ============================================================
   SP-PPT features-fix-kelas.js — v9.1 FULL (TANPA ICON)
   Load PALING AKHIR
   ============================================================ */
(function(){
'use strict';
if (!window.DB){ console.warn('[superfix] DB belum siap'); return; }

/* ============================================================
   HELPERS
   ============================================================ */
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t,b){ if (window.openModal) window.openModal(t,b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id===cid; }); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }

/* ============================================================
   BAGIAN 0 — SYNC CLASS ID
   ============================================================ */
window.uCid = function(){
  if (window.currentUser && window.currentUser.classId) return window.currentUser.classId;
  if (window.__viewClassId) return window.__viewClassId;
  if (window.__currentViewClassId) return window.__currentViewClassId;
  return null;
};
function uCid(){ return window.uCid(); }

(function(){
  var _orig = window.viewClass;
  if (typeof _orig !== 'function') return;
  window.viewClass = function(cid){
    window.__viewClassId = cid;
    window.__currentViewClassId = cid;
    return _orig.apply(this, arguments);
  };
})();

if (window.__viewClassId && !window.__currentViewClassId){
  window.__currentViewClassId = window.__viewClassId;
}

setInterval(function(){
  if (window.__viewClassId && window.__currentViewClassId !== window.__viewClassId){
    window.__currentViewClassId = window.__viewClassId;
  }
}, 500);

/* ============================================================
   BAGIAN 1 — REPAIR KELAS
   ============================================================ */
function _cacheKey(){
  var em = (window.currentUser && window.currentUser.email) || 'anon';
  return 'sppt_cache_classes_' + String(em).toLowerCase();
}
function _saveCache(c){ try { localStorage.setItem(_cacheKey(), JSON.stringify({classes:c, at:Date.now()})); } catch(e){} }
function _loadCache(){
  try {
    var raw = localStorage.getItem(_cacheKey());
    if (!raw) return null;
    var d = JSON.parse(raw);
    return (d && Array.isArray(d.classes)) ? d : null;
  } catch(e){ return null; }
}

window.myClasses = function(){
  if (!window.currentUser) return [];
  var all = window.DB.classes || [];
  if (window.currentUser.type === 'admin') return all.slice();
  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email||'').toLowerCase().trim();
    var myName  = String(window.currentUser.name ||'').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    return all.filter(function(c){
      var te = String(c.teacherEmail||'').toLowerCase().trim();
      var tn = String(c.teacherName ||'').toLowerCase().trim();
      if (!te) return true;
      if (te === myEmail) return true;
      if (tn && myName && tn === myName) return true;
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
      return false;
    });
  }
  if (window.currentUser.type === 'siswa') return all.filter(function(c){ return c.id === window.currentUser.classId; });
  return [];
};

window.ownsClass = function(cid){
  if (!window.currentUser) return false;
  if (window.currentUser.type === 'admin') return true;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if (!c) return false;
  if (window.currentUser.type === 'siswa') return window.currentUser.classId === cid;
  if (window.currentUser.type === 'guru'){
    var myEmail = String(window.currentUser.email||'').toLowerCase().trim();
    var myName  = String(window.currentUser.name ||'').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    var te = String(c.teacherEmail||'').toLowerCase().trim();
    var tn = String(c.teacherName ||'').toLowerCase().trim();
    if (!te) return true;
    if (te === myEmail) return true;
    if (tn && myName && tn === myName) return true;
    if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
  }
  return false;
};

function readClassesRobust(){
  return new Promise(function(resolve, reject){
    var errors = [];
    function tryP(){
      if (!window.fb || !window.firebaseReady){ errors.push('primary'); return tryB(); }
      window.fb.collection('classes').get()
        .then(function(snap){ resolve({source:'primary', snap:snap}); })
        .catch(function(e){
          errors.push('primary:'+(e.code||e.message));
          if (window.__isQuotaError && window.__isQuotaError(e)) window.__activeFB = 'backup';
          tryB();
        });
    }
    function tryB(){
      if (!window.fbBackup || !window.fbBackupReady){ errors.push('backup'); return tryC(); }
      window.fbBackup.collection('classes').get()
        .then(function(snap){ window.__activeFB = 'backup'; resolve({source:'backup', snap:snap}); })
        .catch(function(e){ errors.push('backup:'+(e.code||e.message)); tryC(); });
    }
    function tryC(){
      var cached = _loadCache();
      if (cached && cached.classes.length) resolve({source:'cache', classes:cached.classes, cachedAt:cached.at});
      else reject(new Error(errors.join('|')));
    }
    tryP();
  });
}

var __lastRepairAt = 0;
window.__repairKelas = function(callback){
  if (!window.currentUser){ if (callback) callback(false); return; }
  var uu = window.currentUser;
  if (uu.type !== 'guru' && uu.type !== 'admin'){ if (callback) callback(false); return; }
  __lastRepairAt = Date.now();

  readClassesRobust().then(function(res){
    var classes = res.snap ? res.snap.docs.map(function(d){ var o=d.data(); o.id=d.id; return o; }) : res.classes;
    window.DB.classes = classes;
    window.__kelasSource = res.source;
    if (res.source !== 'cache') _saveCache(classes);
    if (!classes.length){ if (callback) callback(false); return; }

    var myEmail = String(uu.email||'').toLowerCase().trim();
    var myName  = String(uu.name ||'').toLowerCase().trim();
    var myUser  = myEmail.split('@')[0];
    var matched = classes.filter(function(c){
      var te = String(c.teacherEmail||'').toLowerCase().trim();
      var tn = String(c.teacherName ||'').toLowerCase().trim();
      if (!te) return true;
      if (te === myEmail) return true;
      if (tn && myName && tn === myName) return true;
      if (tn && myUser && tn.indexOf(myUser) >= 0) return true;
      return false;
    });

    if (matched.length === 0 && classes.length > 0){
      if (!confirm('KELAS TIDAK COCOK\n\nAda ' + classes.length + ' kelas, tapi tidak ada yang match akun: ' + myEmail + '\n\nKaitkan SEMUA kelas ke akun Anda?')){
        if (callback) callback(false); return;
      }
      Promise.all(classes.map(function(c){
        var upd = Object.assign({}, c, {teacherEmail:uu.email, teacherName:uu.name||uu.email});
        delete upd._id;
        return window.fbSet('classes', c.id, upd);
      })).then(function(){
        classes.forEach(function(c){ c.teacherEmail=uu.email; c.teacherName=uu.name||uu.email; });
        window.DB.classes = classes;
        _saveCache(classes);
        if (window.renderGuruDash) window.renderGuruDash();
        hideStatusBar();
        alert(classes.length + ' kelas dikaitkan!');
        if (callback) callback(true);
      }).catch(function(e){ alert('Gagal: ' + e.message); if (callback) callback(false); });
      return;
    }
    hideStatusBar();
    if (window.renderGuruDash) window.renderGuruDash();
    if (callback) callback(matched.length > 0);
  }).catch(function(err){
    showStatusBar('Kelas tidak dapat dimuat.');
    if (callback) callback(false, err);
  });
};

function showStatusBar(msg){
  var bar = document.getElementById('superfix-status');
  if (bar){ var m = bar.querySelector('.sf-msg'); if (m) m.textContent = msg; return; }
  bar = document.createElement('div');
  bar.id = 'superfix-status';
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;padding:10px 16px;text-align:center;font-size:13px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-family:inherit;';
  bar.innerHTML = '<span class="sf-msg">' + esc(msg||'Kelas tidak dapat dimuat.') + '</span>' +
    '<button id="sf-retry" style="background:#fff;color:#dc2626;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px;">Coba Lagi</button>';
  document.body.appendChild(bar);
  document.getElementById('sf-retry').onclick = function(){
    window.__repairKelas(function(ok, err){
      if (ok) location.reload(); else showStatusBar(err ? err.message : 'Masih gagal');
    });
  };
}
function hideStatusBar(){ var b = document.getElementById('superfix-status'); if (b) b.remove(); }

/* ============================================================
   BAGIAN 2 — TOMBOL KEMBALI
   ============================================================ */
(function(){
  var _orig = window.viewClass;
  if (typeof _orig !== 'function') return;
  window.viewClass = function(cid){
    var ret = _orig.apply(this, arguments);
    setTimeout(function(){
      var mc = document.getElementById('main-content');
      if (!mc || mc.querySelector('.sf-back-btn')) return;
      var tb = mc.querySelector('.extras-toolbar-top') || mc.querySelector('.mp-toolbar');
      if (!tb) return;
      var btn = document.createElement('button');
      btn.className = 'btn btn-primary btn-sm sf-back-btn';
      btn.style.cssText = 'background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;border:none;';
      btn.textContent = 'Kembali';
      btn.onclick = function(){
        window.__viewClassId = null;
        window.__currentViewClassId = null;
        if (window.renderGuruDash) window.renderGuruDash();
      };
      tb.insertBefore(btn, tb.firstChild);
    }, 200);
    return ret;
  };
})();

/* ============================================================
   BAGIAN 3 — MARK ALL READ
   ============================================================ */
window.markAllRead = function(){
  var me = window.currentUser;
  if (!me){ alert('Tidak login'); return; }
  var key = me.type==='siswa' ? me.studentId : (me.type==='guru' ? 'guru:'+String(me.email||'').toLowerCase() : 'admin');
  var notifs = window.getNotifs ? window.getNotifs() : [];
  var unread = notifs.filter(function(n){ return !(n.readBy && n.readBy.indexOf(key) >= 0); });
  if (!unread.length){ alert('Semua sudah dibaca'); return; }
  if (!confirm('Tandai ' + unread.length + ' notifikasi sebagai sudah dibaca?')) return;
  Promise.all(unread.map(function(n){
    var rb = (n.readBy||[]).slice();
    if (rb.indexOf(key) < 0) rb.push(key);
    return window.fbSet('notifications', n.id, Object.assign({}, n, {readBy:rb}));
  })).then(function(){
    if (window.updateBadge) window.updateBadge();
    if (window.renderNotifPanel) window.renderNotifPanel();
    alert(unread.length + ' notifikasi ditandai dibaca');
  });
};
window.tandaiSemuaBaca = window.markAllRead;
window.markAllNotifRead = window.markAllRead;

(function(){
  var _orig = window.renderNotifPanel;
  if (typeof _orig !== 'function') return;
  window.renderNotifPanel = function(){
    var ret = _orig.apply(this, arguments);
    setTimeout(function(){
      var body = document.getElementById('notif-panel-body');
      if (!body || body.querySelector('.sf-mark-all-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'btn btn-primary btn-block btn-sm sf-mark-all-btn';
      btn.style.cssText = 'margin-bottom:12px;';
      btn.textContent = 'Tandai Semua Dibaca';
      btn.onclick = window.markAllRead;
      body.insertBefore(btn, body.firstChild);
    }, 150);
    return ret;
  };
})();

/* ============================================================
   BAGIAN 4 — BERI TUGAS TERINTEGRASI
   ============================================================ */
window.__btState = {
  cid: null, mode: 'manual', stageId: '', roleFilter: '',
  selectedItems: [], targets: []
};

function getMasterChecklist(){ return window.MASTER_CHECKLIST || {}; }
function getStudentTemplates(){ return window.STUDENT_TEMPLATES || {}; }
function getDocTemplates(){ return window.MASTER_TEMPLATES || []; }
function getActiveStagesList(cid){
  var stages = window.DB.stages || [];
  var activeIds = window.DB.activeStages[cid] || [];
  if (!Array.isArray(activeIds)) activeIds = [];
  if (!activeIds.length) return stages;
  return stages.filter(function(s){ return activeIds.indexOf(s.id) >= 0; });
}

window.openBeriTugas = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Pilih kelas dulu'); return; }
  var c = findClass(cid);
  if (!c){ alert('Kelas tidak ditemukan'); return; }
  window.__btState = { cid: cid, mode: 'checklist', stageId: '', roleFilter: '', selectedItems: [], targets: [] };
  renderBeriTugasStep1();
};

function renderBeriTugasStep1(){
  var cid = window.__btState.cid;
  var c = findClass(cid);

  var h = '';
  h += '<div class="alert alert-info"><div><b>Beri Tugas Terintegrasi</b><br><small>Kelas: ' + esc(c.name) + '</small></div></div>';
  h += '<div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Mode Tugas</div>';
  h += '<div style="display:grid;gap:10px;margin-bottom:16px;">';

  h += '<button onclick="window.__btPickMode(\'checklist\')" style="text-align:left;padding:14px;border:2px solid var(--border);border-radius:12px;cursor:pointer;background:var(--card);font-family:inherit;color:var(--text);display:flex;gap:12px;align-items:flex-start;">' +
    '<div style="width:44px;height:44px;border-radius:12px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;">CL</div>' +
    '<div style="flex:1;">' +
      '<div style="font-weight:700;font-size:14px;">Template Checklist</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Master Checklist Teater (12 peran x 4 fase) atau Student Template</div>' +
    '</div>' +
  '</button>';

  h += '<button onclick="window.__btPickMode(\'dokumen\')" style="text-align:left;padding:14px;border:2px solid var(--border);border-radius:12px;cursor:pointer;background:var(--card);font-family:inherit;color:var(--text);display:flex;gap:12px;align-items:flex-start;">' +
    '<div style="width:44px;height:44px;border-radius:12px;background:var(--success-soft);color:var(--success);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;">DK</div>' +
    '<div style="flex:1;">' +
      '<div style="font-weight:700;font-size:14px;">Template Dokumen</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Tugas mengerjakan dokumen (Rundown, Proposal, LPJ, Scene Breakdown, dll)</div>' +
    '</div>' +
  '</button>';

  h += '<button onclick="window.__btPickMode(\'manual\')" style="text-align:left;padding:14px;border:2px solid var(--border);border-radius:12px;cursor:pointer;background:var(--card);font-family:inherit;color:var(--text);display:flex;gap:12px;align-items:flex-start;">' +
    '<div style="width:44px;height:44px;border-radius:12px;background:var(--warning-soft);color:var(--warning);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;">MN</div>' +
    '<div style="flex:1;">' +
      '<div style="font-weight:700;font-size:14px;">Ketik Manual</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Isi judul & deskripsi tugas sendiri, tanpa template</div>' +
    '</div>' +
  '</button>';

  h += '</div>';

  openModal('Beri Tugas', h);
}

window.__btPickMode = function(mode){
  window.__btState.mode = mode;
  if (mode === 'manual') renderBeriTugasManual();
  else if (mode === 'checklist') renderBeriTugasChecklist();
  else if (mode === 'dokumen') renderBeriTugasDokumen();
};

function renderBeriTugasChecklist(){
  var st = window.__btState;
  var cid = st.cid;
  var stages = getActiveStagesList(cid);
  var mcl = getMasterChecklist();
  var stpl = getStudentTemplates();

  var h = '';
  h += '<div class="alert alert-info"><div><b>Mode: Checklist</b><br><small>Pilih dari template, filter tahapan, pilih penerima</small></div></div>';

  h += '<div class="form-group"><label>1. Pilih Tahapan</label>' +
    '<select id="bt-stage" onchange="window.__btState.stageId=this.value">' +
    '<option value="">-- Semua Tahapan --</option>';
  stages.forEach(function(s){
    h += '<option value="' + s.id + '">' + esc(s.name) + ' (bobot ' + s.weight + '%)</option>';
  });
  h += '</select></div>';

  h += '<div class="form-group"><label>2. Filter Peran (opsional)</label>' +
    '<select id="bt-role" onchange="window.__btState.roleFilter=this.value;window.__btRefreshChecklist()">' +
    '<option value="">-- Semua Peran --</option>';
  Object.keys(mcl).forEach(function(r){
    h += '<option value="' + r + '">' + esc(mcl[r].label) + ' (Master)</option>';
  });
  Object.keys(stpl).forEach(function(r){
    if (!mcl[r]) h += '<option value="' + r + '">' + esc(stpl[r].label) + ' (Student)</option>';
  });
  h += '</select></div>';

  h += '<div class="form-group"><label>3. Pilih Item Tugas</label>' +
    '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">' +
    '<button type="button" class="btn btn-sm" onclick="window.__btCheckAll(true)">Centang Semua</button>' +
    '<button type="button" class="btn btn-sm" onclick="window.__btCheckAll(false)">Kosongkan</button>' +
    '</div>' +
    '<div id="bt-checklist-body" style="max-height:280px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);"></div>' +
  '</div>';

  h += '<div class="form-group"><label>Judul Utama</label>' +
    '<input id="bt-title" maxlength="100" value="Tugas Checklist" placeholder="Contoh: Checklist Tahap Perencanaan"></div>';
  h += '<div class="form-group"><label>Pesan Tambahan (opsional)</label>' +
    '<textarea id="bt-desc" rows="2" maxlength="300" placeholder="Catatan untuk siswa..."></textarea></div>';

  h += '<div class="form-group"><label>Deadline</label>' +
    '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">' +
    '<button type="button" class="btn btn-sm" onclick="window.__btTakeStageDeadline()">Ambil dari Tahapan</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<input type="date" id="bt-date">' +
    '<input type="time" id="bt-time" value="23:59">' +
    '</div></div>';

  h += '<div id="bt-preview" style="margin:14px 0;"></div>';

  h += '<div class="action-row">' +
    '<button class="btn" style="flex:1;" onclick="window.openBeriTugas(\'' + cid + '\')">Kembali</button>' +
    '<button class="btn btn-primary" style="flex:2;" onclick="window.__btNext()">Selanjutnya</button>' +
  '</div>';

  openModal('Beri Tugas - Checklist', h);
  setTimeout(function(){ window.__btRefreshChecklist(); }, 100);
}

window.__btRefreshChecklist = function(){
  var role = document.getElementById('bt-role') ? document.getElementById('bt-role').value : '';
  var body = document.getElementById('bt-checklist-body');
  if (!body) return;

  var mcl = getMasterChecklist();
  var stpl = getStudentTemplates();
  var h = '';

  if (!role){
    Object.keys(mcl).forEach(function(r){
      var m = mcl[r];
      var phases = m.phases || {};
      h += '<div style="margin-bottom:10px;font-weight:700;font-size:12px;color:var(--primary);padding:4px 6px;background:var(--primary-soft);border-radius:4px;">' + esc(m.label) + ' (Master)</div>';
      Object.keys(phases).forEach(function(ph){
        h += '<div style="margin-left:10px;margin-bottom:6px;">' +
          '<div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;margin-bottom:4px;">' + ph + '</div>';
        phases[ph].forEach(function(name){
          h += '<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
            '<input type="checkbox" class="bt-item-cb" data-name="' + esc(name) + '" data-role="' + esc(r) + '" data-source="master" data-phase="' + esc(ph) + '">' +
            '<span style="flex:1;">' + esc(name) + '</span></label>';
        });
        h += '</div>';
      });
    });
    Object.keys(stpl).forEach(function(r){
      if (mcl[r]) return;
      var t = stpl[r];
      h += '<div style="margin-bottom:10px;font-weight:700;font-size:12px;color:var(--success);padding:4px 6px;background:var(--success-soft);border-radius:4px;">' + esc(t.label) + ' (Student)</div>';
      (t.items||[]).forEach(function(name){
        h += '<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;margin-left:10px;cursor:pointer;font-size:12.5px;">' +
          '<input type="checkbox" class="bt-item-cb" data-name="' + esc(name) + '" data-role="' + esc(r) + '" data-source="student">' +
          '<span style="flex:1;">' + esc(name) + '</span></label>';
      });
    });
  } else {
    if (mcl[role]){
      var m = mcl[role];
      var phases = m.phases || {};
      Object.keys(phases).forEach(function(ph){
        h += '<div style="margin-bottom:8px;">' +
          '<div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;margin-bottom:4px;">' + ph + '</div>';
        phases[ph].forEach(function(name){
          h += '<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
            '<input type="checkbox" class="bt-item-cb" data-name="' + esc(name) + '" data-role="' + esc(role) + '" data-source="master" data-phase="' + esc(ph) + '">' +
            '<span style="flex:1;">' + esc(name) + '</span></label>';
        });
        h += '</div>';
      });
    }
    if (stpl[role]){
      var t = stpl[role];
      h += '<div style="margin-bottom:6px;font-weight:700;font-size:12px;color:var(--success);">Student Template</div>';
      (t.items||[]).forEach(function(name){
        h += '<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
          '<input type="checkbox" class="bt-item-cb" data-name="' + esc(name) + '" data-role="' + esc(role) + '" data-source="student">' +
          '<span style="flex:1;">' + esc(name) + '</span></label>';
      });
    }
    if (!mcl[role] && !stpl[role]){
      h += '<div style="padding:14px;text-align:center;color:var(--text-muted);">Tidak ada template untuk peran ini</div>';
    }
  }

  body.innerHTML = h || '<div style="padding:14px;text-align:center;color:var(--text-muted);">(kosong)</div>';
};

window.__btCheckAll = function(c){
  document.querySelectorAll('.bt-item-cb').forEach(function(cb){ cb.checked = c; });
  window.__btRefreshPreview();
};

window.__btTakeStageDeadline = function(){
  var st = window.__btState;
  var el = document.getElementById('bt-stage');
  var stageId = el ? el.value : '';
  if (!stageId){ alert('Pilih tahapan dulu'); return; }
  var dl = (window.DB.deadlines[st.cid] && window.DB.deadlines[st.cid][stageId]) || {};
  if (!dl.date){ alert('Tahapan ini belum punya deadline.\nAtur dulu di Sistem Tahapan > Deadline.'); return; }
  document.getElementById('bt-date').value = dl.date;
  if (dl.time) document.getElementById('bt-time').value = dl.time;
};

window.__btRefreshPreview = function(){
  var sel = document.querySelectorAll('.bt-item-cb:checked');
  var prev = document.getElementById('bt-preview');
  if (!prev) return;
  if (sel.length === 0){
    prev.innerHTML = '<div class="alert alert-warning"><div>Belum ada item dipilih</div></div>';
    return;
  }
  prev.innerHTML = '<div class="alert alert-success"><div><b>' + sel.length + ' item tugas</b> akan dikirim</div></div>';
};

function renderBeriTugasDokumen(){
  var st = window.__btState;
  var cid = st.cid;
  var stages = getActiveStagesList(cid);
  var docs = getDocTemplates();

  var h = '';
  h += '<div class="alert alert-info"><div><b>Mode: Dokumen</b><br><small>Pilih template dokumen, tentukan penerima</small></div></div>';

  h += '<div class="form-group"><label>1. Pilih Tahapan (opsional)</label>' +
    '<select id="bt-stage" onchange="window.__btState.stageId=this.value">' +
    '<option value="">-- Semua Tahapan --</option>';
  stages.forEach(function(s){
    h += '<option value="' + s.id + '">' + esc(s.name) + '</option>';
  });
  h += '</select></div>';

  h += '<div class="form-group"><label>2. Pilih Template Dokumen</label>' +
    '<div id="bt-doc-list" style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  docs.forEach(function(d){
    var roles = (d.defaultRoles||[]).map(function(r){ return roleLabel(r); }).join(', ');
    h += '<label style="display:flex;align-items:flex-start;gap:10px;padding:10px;background:var(--card);border-radius:8px;margin-bottom:6px;cursor:pointer;font-size:12.5px;border-left:3px solid var(--success);">' +
      '<input type="checkbox" class="bt-doc-cb" data-key="' + esc(d.key) + '" data-title="' + esc(d.title) + '" data-roles="' + esc((d.defaultRoles||[]).join(',')) + '">' +
      '<div style="flex:1;">' +
        '<div style="font-weight:700;">' + esc(d.title) + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + esc(d.desc||'') + '</div>' +
        '<div style="font-size:10.5px;color:var(--primary);margin-top:4px;">Peran: ' + esc(roles) + '</div>' +
      '</div></label>';
  });
  h += '</div></div>';

  h += '<div class="form-group"><label>Judul Utama</label>' +
    '<input id="bt-title" maxlength="100" value="Tugas Dokumen" placeholder="Contoh: Susun Proposal"></div>';
  h += '<div class="form-group"><label>Pesan Tambahan</label>' +
    '<textarea id="bt-desc" rows="2" maxlength="300"></textarea></div>';

  h += '<div class="form-group"><label>Deadline</label>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<input type="date" id="bt-date">' +
    '<input type="time" id="bt-time" value="23:59">' +
    '</div></div>';

  h += '<div class="action-row">' +
    '<button class="btn" style="flex:1;" onclick="window.openBeriTugas(\'' + cid + '\')">Kembali</button>' +
    '<button class="btn btn-primary" style="flex:2;" onclick="window.__btNext()">Selanjutnya</button>' +
  '</div>';

  openModal('Beri Tugas - Dokumen', h);
}

function renderBeriTugasManual(){
  var st = window.__btState;
  var cid = st.cid;
  var stages = getActiveStagesList(cid);

  var h = '';
  h += '<div class="alert alert-info"><div><b>Mode: Manual</b><br><small>Isi judul, deskripsi, deadline</small></div></div>';

  h += '<div class="form-group"><label>Judul Tugas *</label>' +
    '<input id="bt-title" maxlength="100" placeholder="Contoh: Latihan adegan 1"></div>';
  h += '<div class="form-group"><label>Deskripsi</label>' +
    '<textarea id="bt-desc" rows="3" maxlength="500"></textarea></div>';

  h += '<div class="form-group"><label>Tahapan (opsional)</label>' +
    '<select id="bt-stage" onchange="window.__btState.stageId=this.value">' +
    '<option value="">-- Tidak terkait tahapan --</option>';
  stages.forEach(function(s){
    h += '<option value="' + s.id + '">' + esc(s.name) + '</option>';
  });
  h += '</select></div>';

  h += '<div class="form-group"><label>Deadline</label>' +
    '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
    '<button type="button" class="btn btn-sm" onclick="window.__btTakeStageDeadline()">Ambil dari Tahapan</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<input type="date" id="bt-date">' +
    '<input type="time" id="bt-time" value="23:59">' +
    '</div></div>';

  h += '<div class="action-row">' +
    '<button class="btn" style="flex:1;" onclick="window.openBeriTugas(\'' + cid + '\')">Kembali</button>' +
    '<button class="btn btn-primary" style="flex:2;" onclick="window.__btNext()">Selanjutnya</button>' +
  '</div>';

  openModal('Beri Tugas - Manual', h);
}

window.__btNext = function(){
  var st = window.__btState;
  var cid = st.cid;
  var items = [];

  if (st.mode === 'checklist'){
    document.querySelectorAll('.bt-item-cb:checked').forEach(function(cb){
      items.push({
        name: cb.getAttribute('data-name'),
        role: cb.getAttribute('data-role'),
        source: cb.getAttribute('data-source'),
        phase: cb.getAttribute('data-phase') || ''
      });
    });
  } else if (st.mode === 'dokumen'){
    document.querySelectorAll('.bt-doc-cb:checked').forEach(function(cb){
      items.push({
        key: cb.getAttribute('data-key'),
        name: cb.getAttribute('data-title'),
        roles: (cb.getAttribute('data-roles')||'').split(',').filter(Boolean),
        source: 'dokumen'
      });
    });
  }

  var title = (document.getElementById('bt-title')||{}).value || '';
  var desc = (document.getElementById('bt-desc')||{}).value || '';
  var date = (document.getElementById('bt-date')||{}).value || '';
  var time = (document.getElementById('bt-time')||{}).value || '23:59';
  var stageEl = document.getElementById('bt-stage');
  var stageId = stageEl ? stageEl.value : '';

  if (st.mode === 'manual'){
    if (!title.trim()){ alert('Judul wajib'); return; }
  } else {
    if (!items.length){ alert('Pilih minimal 1 item'); return; }
    if (!title.trim()){ alert('Judul wajib'); return; }
  }

  st.selectedItems = items;
  st.title = title.trim();
  st.desc = desc.trim();
  st.date = date;
  st.time = time;
  st.stageId = stageId;

  renderBeriTugasPenerima();
};

function renderBeriTugasPenerima(){
  var st = window.__btState;
  var cid = st.cid;
  var c = findClass(cid);
  var students = (c.students||[]).filter(function(s){ return s.id !== uSid(); });

  var h = '';
  h += '<div class="alert alert-info"><div><b>Langkah Terakhir</b><br><small>Pilih penerima lalu kirim</small></div></div>';
  h += '<div class="alert alert-success"><div><b>' + st.selectedItems.length + ' item</b> tugas akan dikirim<br>' +
    'Judul: <b>' + esc(st.title) + '</b>' +
    (st.date ? '<br>Deadline: <b>' + esc(st.date + ' ' + st.time) + '</b>' : '') + '</div></div>';

  var allRoles = {};
  students.forEach(function(s){ allRoles[s.role] = (allRoles[s.role]||0) + 1; });

  h += '<div class="form-group"><label>Filter Cepat Berdasarkan Peran</label>' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">';
  h += '<button type="button" class="btn btn-sm" onclick="window.__btTargetAll(true)">Semua</button>';
  h += '<button type="button" class="btn btn-sm" onclick="window.__btTargetAll(false)">Kosongkan</button>';
  Object.keys(allRoles).sort().forEach(function(r){
    h += '<button type="button" class="btn btn-sm" onclick="window.__btTargetRole(\'' + r + '\')">' + esc(roleLabel(r)) + ' (' + allRoles[r] + ')</button>';
  });
  h += '</div></div>';

  h += '<div class="form-group"><label>Penerima (' + students.length + ' siswa)</label>' +
    '<div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--surface);">';
  students.forEach(function(s){
    var shouldCheck = false;
    st.selectedItems.forEach(function(it){
      if (it.role && it.role === s.role) shouldCheck = true;
      if (it.roles && it.roles.indexOf(s.role) >= 0) shouldCheck = true;
    });
    if (st.mode === 'manual') shouldCheck = true;

    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:6px;margin-bottom:3px;cursor:pointer;font-size:12.5px;">' +
      '<input type="checkbox" class="bt-target-cb" value="' + s.id + '" data-name="' + esc(s.name) + '" data-role="' + esc(s.role) + '" data-phone="' + esc(s.phone||'') + '" ' + (shouldCheck?'checked':'') + '>' +
      '<span style="flex:1;font-weight:600;">' + esc(s.name) + '</span>' +
      '<span style="font-size:10.5px;color:var(--text-muted);">' + esc(roleLabel(s.role)) + '</span>' +
      (s.phone ? '<span class="badge badge-success" style="font-size:9px;">WA</span>' : '<span class="badge badge-gray" style="font-size:9px;">-</span>') +
    '</label>';
  });
  h += '</div></div>';

  h += '<div class="form-group"><label>Kirim Via</label>' +
    '<select id="bt-channel">' +
    '<option value="both">Notifikasi + WhatsApp</option>' +
    '<option value="app">Hanya Notifikasi</option>' +
    '<option value="wa">Hanya WhatsApp</option>' +
    '</select></div>';

  if (st.mode === 'checklist'){
    h += '<div class="form-group"><label style="display:flex;align-items:center;gap:8px;">' +
      '<input type="checkbox" id="bt-add-check" checked>' +
      '<span>Tambahkan ke Checklist Tim siswa (mereka bisa centang progress)</span>' +
    '</label></div>';
  }

  h += '<div class="action-row">' +
    '<button class="btn" style="flex:1;" onclick="window.__btBack()">Kembali</button>' +
    '<button class="btn btn-primary" style="flex:2;" onclick="window.__btSend()">Kirim Tugas</button>' +
  '</div>';

  openModal('Pilih Penerima', h);
}

window.__btBack = function(){
  var st = window.__btState;
  if (st.mode === 'checklist') renderBeriTugasChecklist();
  else if (st.mode === 'dokumen') renderBeriTugasDokumen();
  else renderBeriTugasManual();
};

window.__btTargetAll = function(c){
  document.querySelectorAll('.bt-target-cb').forEach(function(cb){ cb.checked = c; });
};
window.__btTargetRole = function(role){
  document.querySelectorAll('.bt-target-cb').forEach(function(cb){
    cb.checked = cb.getAttribute('data-role') === role;
  });
};

window.__btSend = function(){
  var st = window.__btState;
  var cid = st.cid;
  var channel = (document.getElementById('bt-channel')||{}).value || 'both';
  var addCheck = document.getElementById('bt-add-check');
  var addToChecklist = addCheck ? addCheck.checked : false;

  var targets = [];
  document.querySelectorAll('.bt-target-cb:checked').forEach(function(cb){
    targets.push({
      id: cb.value,
      name: cb.getAttribute('data-name'),
      role: cb.getAttribute('data-role'),
      phone: cb.getAttribute('data-phone') || ''
    });
  });

  if (!targets.length){ alert('Pilih minimal 1 penerima'); return; }

  var lines = [];
  if (st.mode === 'manual'){
    lines.push(st.desc || '');
  } else {
    if (st.desc) lines.push(st.desc + '\n');
    lines.push('Daftar Tugas:');
    st.selectedItems.forEach(function(it, i){
      var suffix = '';
      if (it.role) suffix = ' (' + roleLabel(it.role) + ')';
      lines.push((i+1) + '. ' + it.name + suffix);
    });
  }
  var fullMsg = lines.join('\n');
  if (st.date){
    fullMsg += '\n\nDeadline: ' + (window.fmtDateShort ? window.fmtDateShort(st.date) : st.date) + ' ' + (st.time || '23:59');
  }

  var me = window.currentUser || {};
  var senderName = me.name || 'Guru';

  var promises = [];
  if (channel === 'app' || channel === 'both'){
    targets.forEach(function(t){
      var nid = uid();
      promises.push(window.fbSet('notifications', nid, {
        id: nid, classId: cid,
        fromId: me.studentId || me.email || 'guru',
        fromName: senderName, fromType: uType(), fromRole: uRole(),
        toId: t.id, type: 'tugas',
        title: '[TUGAS] ' + st.title,
        message: fullMsg,
        stageId: st.stageId || null,
        deadline: st.date || null,
        createdAt: Date.now(), readBy: [], doneBy: []
      }));
    });
  }

  if (addToChecklist && st.mode === 'checklist'){
    var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
    var newItems = [];
    st.selectedItems.forEach(function(it){
      var targetRoles = it.role ? [it.role] : (it.roles || []);
      targetRoles.forEach(function(r){
        newItems.push({
          id: uid(),
          name: it.name,
          detail: st.desc || '',
          assignedRole: r,
          division: window.getDivisionOfRole ? window.getDivisionOfRole(r) : 'produksi',
          phase: it.phase || '',
          stageId: st.stageId || '',
          deadline: st.date || '',
          done: false,
          isPersonal: false,
          createdAt: Date.now(),
          createdBy: senderName
        });
      });
    });
    ch = ch.concat(newItems);
    promises.push(window.fbSet('checklists', cid, {classId: cid, items: ch}));
  }

  Promise.all(promises).then(function(){
    if (window.logActivity){
      window.logActivity('task_create', senderName + ' beri tugas "' + st.title + '" ke ' + targets.length + ' siswa', {classId: cid});
    }
    closeModal();

    var withWA = targets.filter(function(t){ return t.phone && t.phone.replace(/\D/g,'').length >= 10; });
    if ((channel === 'wa' || channel === 'both') && withWA.length > 0){
      window.__waTargets = withWA;
      window.__waTitle = st.title;
      window.__waMessage = fullMsg;
      window.__waSender = senderName;
      window.__waCid = cid;
      showWAPanel(withWA, st.title, fullMsg, senderName, cid);
    } else {
      alert('Tugas terkirim ke ' + targets.length + ' siswa!');
    }
  }).catch(function(e){ alert('Gagal: ' + e.message); });
};

/* ============================================================
   BAGIAN 5 — WA PANEL
   ============================================================ */
function normalizePhone(p){
  p = String(p||'').replace(/\D/g,'');
  if (!p) return '';
  if (p.charAt(0) === '0') p = '62' + p.substring(1);
  if (p.substring(0,2) !== '62') p = '62' + p;
  return p;
}

function buildWAMessage(targetName, targetRole, title, message, senderName){
  return '*SP-PPT - SMP Negeri 10 Samarinda*\n_' + title + '_\n\n' +
    'Yth. *' + targetName + '*\n(' + roleLabel(targetRole) + ')\n\n' +
    message + '\n\n-\nDari: ' + senderName + '\n' +
    'Waktu: ' + new Date().toLocaleString('id-ID');
}

function showWAPanel(targets, title, message, senderName, cid){
  window.__waTargets = targets;
  window.__waTitle = title;
  window.__waMessage = message;
  window.__waSender = senderName;
  window.__waCid = cid;

  var h = '';
  h += '<div class="alert alert-info"><div><b>Kirim via WhatsApp</b><br><small>Klik per penerima atau Buka Semua Berurutan</small></div></div>';
  h += '<div class="action-row" style="margin-bottom:12px;flex-wrap:wrap;">' +
    '<button class="btn btn-sm btn-primary" onclick="window.__btOpenAllWA()">Buka Semua Berurutan</button>' +
    '<button class="btn btn-sm" onclick="window.__btCopyAllWA()">Copy Semua</button>' +
    '<span class="badge badge-warning" style="align-self:center;">' + targets.length + ' penerima</span>' +
  '</div>';
  h += '<div style="max-height:400px;overflow-y:auto;">';
  targets.forEach(function(t, i){
    h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;flex-wrap:wrap;">' +
      '<div style="flex:1;min-width:150px;">' +
        '<div style="font-weight:700;font-size:13px;">' + esc(t.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--success);">' + esc(t.phone) + '</div>' +
      '</div>' +
      '<button class="btn btn-sm btn-success" onclick="window.__btOpenWA(' + i + ')">Buka WA</button>' +
      '<span id="bt-wa-status-' + i + '"></span>' +
    '</div>';
  });
  h += '</div>';
  h += '<div style="margin-top:14px;padding:12px;background:var(--surface);border-radius:8px;font-size:12px;color:var(--text-muted);line-height:1.6;">' +
    '<b>Catatan:</b><br>' +
    '&bull; WhatsApp Web harus sudah login<br>' +
    '&bull; Pesan otomatis terisi, klik Send di WhatsApp</div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="closeModal()">Selesai</button>';
  openModal('Kirim via WhatsApp', h);
}

window.__btOpenWA = function(i){
  var t = window.__waTargets[i];
  if (!t) return;
  var phone = normalizePhone(t.phone);
  if (!phone){ alert('WA tidak valid'); return; }
  var body = buildWAMessage(t.name, t.role, window.__waTitle, window.__waMessage, window.__waSender);
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(body), '_blank');
  var st = document.getElementById('bt-wa-status-' + i);
  if (st) st.innerHTML = '<span class="badge badge-success">Dibuka</span>';
};

window.__btOpenAllWA = function(){
  var ts = window.__waTargets || [];
  if (!ts.length) return;
  if (!confirm('Buka ' + ts.length + ' tab WA berurutan?')) return;
  var i = 0;
  function next(){
    if (i >= ts.length){ alert('Selesai! ' + ts.length + ' tab dibuka.'); return; }
    window.__btOpenWA(i); i++;
    setTimeout(next, 1200);
  }
  next();
};

window.__btCopyAllWA = function(){
  var ts = window.__waTargets || [];
  if (!ts.length) return;
  var txt = '';
  ts.forEach(function(t, i){
    txt += (i+1) + '. ' + t.name + ' (' + roleLabel(t.role) + ')\n   WA: ' + t.phone + '\n\n' + buildWAMessage(t.name, t.role, window.__waTitle, window.__waMessage, window.__waSender) + '\n\n---\n\n';
  });
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ alert('Semua pesan disalin!'); });
  else prompt('Copy:', txt);
};

/* ============================================================
   BAGIAN 6 — FUNGSI HILANG
   ============================================================ */

window.openTugasSaya = function(){
  var cid = uCid(), sid = uSid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var myRole = uRole();
  var ch = (window.DB.checklists[cid] && window.DB.checklists[cid].items) || [];
  var myTasks = ch.filter(function(it){ return !it.isPersonal && it.assignedRole === myRole; });
  var doneCnt = myTasks.filter(function(x){ return x.done; }).length;
  var notifs = (window.DB.notifications||[]).filter(function(n){
    if (n.classId !== cid || n.type !== 'tugas') return false;
    if (!sid) return true;
    if (n.toId === 'all' || n.toId === sid) return true;
    if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
    return false;
  });
  var h = '<div class="alert alert-info"><div><b>Tugas Saya</b> - ' + esc(roleLabel(myRole)) + '</div></div>';
  if (myTasks.length){
    var pct = Math.round(doneCnt/myTasks.length*100);
    h += '<div class="progress-container"><div class="progress-bar ' + (pct===100?'complete':'partial') + '" style="width:' + pct + '%"></div></div>';
    myTasks.forEach(function(it){
      h += '<div style="padding:8px;background:var(--surface);border-radius:6px;margin-bottom:5px;font-size:12.5px;">' + (it.done?'[v] ':'[ ] ') + esc(it.name) + '</div>';
    });
  }
  if (notifs.length){
    h += '<h3 style="font-size:13.5px;margin:14px 0 8px;">Notifikasi Tugas</h3>';
    notifs.slice(0,10).forEach(function(n){
      h += '<div class="welcome-item urgent" style="margin-bottom:6px;"><div style="flex:1;"><b>' + esc(n.title||'') + '</b><br><small>' + esc(n.fromName||'') + '</small></div></div>';
    });
  }
  if (!myTasks.length && !notifs.length) h += '<div class="empty-state"><p>Belum ada tugas.</p></div>';
  openModal('Tugas Saya', h);
};

window.openDeadlineList = function(){
  var cid = uCid(), sid = uSid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var arr = (window.DB.notifications||[]).filter(function(n){
    if (n.classId !== cid || n.type !== 'tugas') return false;
    if (!sid) return true;
    if (n.toId === 'all' || n.toId === sid) return true;
    if (n.recipientIds && n.recipientIds.indexOf(sid) >= 0) return true;
    return false;
  });
  var h = '<div class="alert alert-info"><div>Deadline - ' + arr.length + '</div></div>';
  if (!arr.length) h += '<div class="empty-state"><p>Tidak ada deadline.</p></div>';
  else arr.forEach(function(n){
    h += '<div style="padding:10px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--warning);">' +
      '<div style="font-weight:700;">' + esc(n.title||'Tugas') + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(n.fromName||'') + '</div>' +
      (n.message?'<div style="font-size:12.5px;margin-top:6px;white-space:pre-wrap;">' + esc(n.message) + '</div>':'') + '</div>';
  });
  openModal('Deadline', h);
};

window.openAbsensiHariIni = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var today = new Date().toISOString().split('T')[0];
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){ return m.classId===cid && m.date===today; });
  var h = '<div class="alert alert-info"><div>Absensi Hari Ini - ' + meetings.length + '</div></div>';
  if (!meetings.length) h += '<div class="empty-state"><p>Tidak ada sesi hari ini.</p></div>';
  else meetings.forEach(function(m){
    h += '<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;">' + esc(m.title) + '</div>' +
      '<button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="closeModal();setTimeout(function(){window.openIsiAbsensi(\'' + m.id + '\')},150)">Isi</button></div>';
  });
  openModal('Absensi Hari Ini', h);
};

if (typeof window.openRubrikPenilaian !== 'function'){
  window.openRubrikPenilaian = function(){
    var myRole = uRole();
    var rubric = window.getRubricFor ? window.getRubricFor(myRole) : [];
    var h = '<div class="alert alert-info"><div><b>Rubrik</b> - ' + esc(roleLabel(myRole)) + '</div></div>';
    if (!rubric.length) h += '<div class="empty-state"><p>Belum ada rubrik.</p></div>';
    else rubric.forEach(function(r){
      h += '<div class="rubric-item"><h4>' + esc(r.name) + ' <span class="weight-info">' + r.weight + '%</span></h4>' +
        '<div class="desc">' + esc(r.desc||'') + '</div></div>';
    });
    openModal('Rubrik Penilaian', h);
  };
}

window.openChangePassword = function(){
  openModal('Ubah Password',
    '<div class="form-group pw-toggle"><label>Password Lama</label><input type="password" id="sf-cp-old"><button class="toggle-btn" type="button" onclick="togglePw(\'sf-cp-old\',this)">Lihat</button></div>' +
    '<div class="form-group pw-toggle"><label>Password Baru</label><input type="password" id="sf-cp-new"><button class="toggle-btn" type="button" onclick="togglePw(\'sf-cp-new\',this)">Lihat</button></div>' +
    '<div class="form-group pw-toggle"><label>Konfirmasi</label><input type="password" id="sf-cp-conf"><button class="toggle-btn" type="button" onclick="togglePw(\'sf-cp-conf\',this)">Lihat</button></div>' +
    '<button class="btn btn-primary btn-block" onclick="window.__sfSavePassword()">Simpan</button>');
};

window.__sfSavePassword = function(){
  var uu = window.currentUser || {};
  var o = (document.getElementById('sf-cp-old').value||'').trim();
  var n = (document.getElementById('sf-cp-new').value||'').trim();
  var c = (document.getElementById('sf-cp-conf').value||'').trim();
  if (!o || !n || !c){ alert('Lengkapi'); return; }
  if (n.length < 6){ alert('Min 6 karakter'); return; }
  if (n !== c){ alert('Konfirmasi tidak cocok'); return; }
  if (uu.type === 'guru'){
    var t = (window.DB.teachers||[]).find(function(x){ return x.email && x.email.toLowerCase() === String(uu.email).toLowerCase(); });
    if (t && String(t.password).trim() === o){
      t.password = n;
      window.fbSet('teachers', t.email, t).then(function(){ closeModal(); alert('Password diubah'); });
      return;
    }
    if (window.fb && window.firebaseReady){
      window.fb.collection('teachers').doc(uu.email).get().then(function(snap){
        if (!snap.exists){ alert('Akun tidak ditemukan'); return; }
        var td = snap.data();
        if (String(td.password).trim() !== o){ alert('Password lama salah'); return; }
        td.password = n;
        window.fbSet('teachers', uu.email, td).then(function(){ closeModal(); alert('Password diubah'); });
      });
      return;
    }
    alert('Password lama salah'); return;
  }
  if (uu.type === 'siswa'){
    var c2 = findClass(uu.classId);
    if (!c2){ alert('Kelas tidak ditemukan'); return; }
    var s = (c2.students||[]).find(function(x){ return x.id === uu.studentId; });
    if (!s || String(s.password).trim() !== o){ alert('Password lama salah'); return; }
    var ns = (c2.students||[]).map(function(x){ return x.id===s.id ? Object.assign({}, x, {password:n}) : x; });
    window.fbSet('classes', c2.id, Object.assign({}, c2, {students:ns})).then(function(){ c2.students = ns; closeModal(); alert('Password diubah'); });
  }
};

if (typeof window.openActivityFeedModal !== 'function'){
  window.openActivityFeedModal = function(){
    var cid = uCid();
    var logs = (window.DB.activityLogs||[]).filter(function(l){ return !l.classId || l.classId === cid; }).slice(0,60);
    var h = '<div class="alert alert-info"><div>Aktivitas - ' + logs.length + '</div></div>';
    if (!logs.length) h += '<div class="empty-state"><p>Belum ada aktivitas.</p></div>';
    else {
      h += '<div class="activity-feed">';
      logs.forEach(function(l){
        h += '<div class="activity-item"><div class="activity-content"><div class="activity-msg">' + esc(l.message||'') + '</div><div class="activity-meta"><b>' + esc(l.userName||'-') + '</b></div></div></div>';
      });
      h += '</div>';
    }
    openModal('Aktivitas', h);
  };
}

if (typeof window.openLogWA !== 'function'){
  window.openLogWA = function(){
    var logs = Object.values(window.DB.waLogs||{}).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,80);
    var h = '<div class="alert alert-info"><div>Log WA - ' + logs.length + '</div></div>';
    if (!logs.length) h += '<div class="empty-state"><p>Belum ada log.</p></div>';
    else logs.forEach(function(l){
      h += '<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;">' + esc(l.title||'') + '</div><div style="font-size:11.5px;color:var(--text-muted);">Ke: ' + esc(l.toName||'') + '</div></div>';
    });
    openModal('Log WhatsApp', h);
  };
}

if (typeof window.openDashboardPesan !== 'function'){
  window.openDashboardPesan = function(){
    var notifs = (window.DB.notifications||[]).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); }).slice(0,80);
    var h = '<div class="alert alert-info"><div>Pesan - ' + notifs.length + '</div></div>';
    if (!notifs.length) h += '<div class="empty-state"><p>Belum ada pesan.</p></div>';
    else notifs.forEach(function(n){
      h += '<div class="card" style="margin-bottom:6px;"><div style="font-weight:700;">' + esc(n.title||'') + '</div><div style="font-size:11.5px;color:var(--text-muted);">Dari: ' + esc(n.fromName||'') + '</div>' + (n.message?'<div style="font-size:12.5px;margin-top:6px;">' + esc(n.message) + '</div>':'') + '</div>';
    });
    openModal('Pesan', h);
  };
}

/* Fallback penilaian */
if (typeof window.openPenilaianGuruDashboard !== 'function'){
  window.openPenilaianGuruDashboard = function(cid){
    cid = cid || uCid();
    if (!cid){ alert('Pilih kelas dulu'); return; }
    var c = findClass(cid);
    if (!c) return;
    var targets = (c.students||[]).filter(function(s){ return s.role === 'pimpinan_produksi' || s.role === 'sutradara'; });
    var h = '<div class="alert alert-info"><div><b>Penilaian Guru</b></div></div>';
    if (!targets.length) h += '<div class="empty-state"><p>Belum ada siswa Pimpro / Sutradara.</p></div>';
    else {
      var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
      targets.forEach(function(t){
        var done = 0;
        stages.forEach(function(s){
          var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][t.id]) || {};
          if (ev.guru && ev.guru[s.id] && Object.keys(ev.guru[s.id]).length > 0) done++;
        });
        h += '<div class="card" style="margin-bottom:10px;border-left:4px solid var(--primary);">' +
          '<div style="font-weight:700;">' + esc(t.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">' + esc(roleLabel(t.role)) + '</div>' +
          '<div style="font-size:12px;margin-bottom:6px;">Progress: <b>' + done + '/' + stages.length + '</b></div>' +
          '<button class="btn btn-primary btn-sm" onclick="openPilihTahapGuru(\'' + cid + '\',\'' + t.id + '\')">Nilai</button></div>';
      });
    }
    openModal('Penilaian Guru', h);
  };
  window.openPenilaianGuru = window.openPenilaianGuruDashboard;
}

if (typeof window.openPilihTahapGuru !== 'function'){
  window.openPilihTahapGuru = function(cid, tid){
    var c = findClass(cid);
    var t = (c.students||[]).find(function(x){ return x.id===tid; });
    if (!t) return;
    var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
    var h = '<div class="alert alert-info"><div>Menilai: <b>' + esc(t.name) + '</b></div></div>';
    if (!stages.length) h += '<div class="alert alert-warning">Belum ada tahap aktif.</div>';
    else stages.forEach(function(s){
      var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid]) || {};
      var done = ev.guru && ev.guru[s.id] && Object.keys(ev.guru[s.id]).length > 0;
      h += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + (done?'var(--success)':'var(--warning)') + ';">' +
        '<div style="font-weight:700;">' + esc(s.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;">Bobot ' + s.weight + '%</div>' +
        (done ? '<span class="badge badge-success" style="margin-right:6px;">Selesai</span>' : '') +
        '<button class="btn btn-primary btn-sm" onclick="openFormNilaiGuru(\'' + cid + '\',\'' + tid + '\',\'' + s.id + '\')">' + (done?'Edit':'Nilai') + '</button></div>';
    });
    openModal('Pilih Tahap', h);
  };
}

if (typeof window.openFormNilaiGuru !== 'function'){
  window.openFormNilaiGuru = function(cid, tid, sid){
    var c = findClass(cid);
    var t = (c.students||[]).find(function(x){ return x.id===tid; });
    if (!t) return;
    var stage = (window.DB.stages||[]).find(function(s){ return s.id===sid; });
    if (!stage) return;
    var rubric = window.getRubricFor ? window.getRubricFor(t.role) : [];
    var ev = (window.DB.evaluations[cid] && window.DB.evaluations[cid][tid] && window.DB.evaluations[cid][tid].guru && window.DB.evaluations[cid][tid].guru[sid]) || {};
    var h = '<div class="alert alert-info"><div><b>' + esc(t.name) + '</b> - ' + esc(stage.name) + '</div></div>';
    rubric.forEach(function(r){
      var v = ev[r.id];
      h += '<div class="rubric-item"><h4>' + esc(r.name) + ' <span class="weight-info">' + r.weight + '%</span></h4>' +
        '<div class="desc">' + esc(r.desc||'') + '</div><div class="radio-group">';
      var labels = {4:'Sangat Baik',3:'Baik',2:'Cukup',1:'Kurang'};
      [4,3,2,1].forEach(function(val){
        h += '<label class="rs-' + val + '"><input type="radio" name="sfg_' + sid + '_' + r.id + '" value="' + val + '"' + (v===val?' checked':'') + '><b>' + val + ' - ' + labels[val] + '</b></label>';
      });
      h += '</div></div>';
    });
    h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:14px;" onclick="window.__sfSaveNilaiGuru(\'' + cid + '\',\'' + tid + '\',\'' + sid + '\')">Simpan</button>';
    openModal('Nilai: ' + esc(t.name), h);
  };
}

window.__sfSaveNilaiGuru = function(cid, tid, sid){
  var c = findClass(cid);
  var t = (c.students||[]).find(function(x){ return x.id===tid; });
  if (!t) return;
  var rubric = window.getRubricFor ? window.getRubricFor(t.role) : [];
  var scores = {}, missing = [];
  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="sfg_' + sid + '_' + r.id + '"]:checked');
    if (!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });
  if (missing.length){ alert('Belum lengkap: ' + missing.slice(0,5).join(', ')); return; }
  var docId = cid + '__' + tid;
  if (!window.fb || !window.firebaseReady){ alert('Firebase belum siap'); return; }
  window.fb.collection('evaluations').doc(docId).get().then(function(snap){
    var data = snap.exists ? snap.data() : {classId:cid, targetId:tid};
    data.guru = data.guru || {};
    data.guru[sid] = scores;
    return window.fb.collection('evaluations').doc(docId).set(window.U && window.U.safeFS ? window.U.safeFS(data) : data, {merge:true});
  }).then(function(){
    if (window.logActivity) window.logActivity('eval_submit', u().name + ' nilai ' + t.name, {classId:cid});
    alert('Nilai tersimpan!');
    closeModal();
    setTimeout(function(){ window.openPilihTahapGuru(cid, tid); }, 250);
  }).catch(function(e){ alert('Gagal: ' + e.message); });
};

if (typeof window.openRekapNilai !== 'function'){
  window.openRekapNilai = function(cid){
    cid = cid || uCid();
    if (!cid){ alert('Pilih kelas dulu'); return; }
    var c = findClass(cid);
    if (!c) return;
    var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
    var h = '<div class="alert alert-info"><div><b>Rekap Nilai</b> - ' + esc(c.name) + '</div></div>';
    if (!stages.length) h += '<div class="alert alert-warning">Belum ada tahap aktif.</div>';
    else {
      h += '<div class="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Peran</th>';
      stages.forEach(function(s){ h += '<th>' + esc(s.name) + '</th>'; });
      h += '<th>Nilai Akhir</th></tr></thead><tbody>';
      (c.students||[]).forEach(function(t, i){
        h += '<tr><td>' + (i+1) + '</td><td><b>' + esc(t.name) + '</b></td><td><span class="badge badge-gray" style="font-size:10px;">' + esc(roleLabel(t.role)) + '</span></td>';
        stages.forEach(function(s){
          var bd = window.getStageScoreWithBreakdown ? window.getStageScoreWithBreakdown(cid, t.id, s.id) : {final:0};
          var color = bd.final >= 3.5 ? 'badge-success' : bd.final >= 2.5 ? 'badge-info' : bd.final >= 1.5 ? 'badge-warning' : 'badge-danger';
          h += '<td><span class="badge ' + color + '">' + bd.final.toFixed(2) + '</span></td>';
        });
        var f = window.getFinalScore ? window.getFinalScore(cid, t.id) : 0;
        h += '<td><b style="color:var(--primary);">' + f.toFixed(2) + '</b></td></tr>';
      });
      h += '</tbody></table></div>';
    }
    openModal('Rekap Nilai', h);
  };
}

if (typeof window.openNilaiSaya !== 'function'){
  window.openNilaiSaya = function(){
    var cid = uCid(), sid = uSid();
    if (!cid || !sid){ alert('Data tidak ditemukan'); return; }
    var stages = window.getActiveStages ? window.getActiveStages(cid) : [];
    var final = window.getFinalScore ? window.getFinalScore(cid, sid) : 0;
    var h = '<div class="progress-banner"><h3>Nilai Saya</h3><div style="font-size:32px;font-weight:800;color:var(--primary);">' + final.toFixed(2) + '</div></div>';
    if (!stages.length) h += '<div class="alert alert-warning">Belum ada tahap aktif.</div>';
    else {
      h += '<div class="table-wrap"><table><thead><tr><th>Tahap</th><th>Bobot</th><th>Final</th></tr></thead><tbody>';
      stages.forEach(function(s){
        var bd = window.getStageScoreWithBreakdown ? window.getStageScoreWithBreakdown(cid, sid, s.id) : {final:0};
        h += '<tr><td><b>' + esc(s.name) + '</b></td><td>' + s.weight + '%</td><td><span class="badge badge-primary">' + bd.final.toFixed(2) + '</span></td></tr>';
      });
      h += '</tbody></table></div>';
    }
    openModal('Nilai Saya', h);
  };
}

/* ============================================================
   BAGIAN 7 — AUTO-POPULATE DROPDOWN LOGIN
   ============================================================ */
function populateLoginDropdown(){
  var sel = document.getElementById('siswa-kelas');
  if (!sel) return;
  var list = window.DB.classes || [];
  if (!list.length) return;
  var existing = [];
  for (var i = 0; i < sel.options.length; i++){ if (sel.options[i].value) existing.push(sel.options[i].value); }
  if (existing.length === list.length && existing[0] === list[0].id) return;
  var cur = sel.value;
  sel.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  list.forEach(function(c){
    var o = document.createElement('option');
    o.value = c.id; o.textContent = c.name || c.id;
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
}

function autoReadClassesForLogin(){
  if ((window.DB.classes||[]).length > 0){ populateLoginDropdown(); return; }
  function tryS(server){
    if (!server) return Promise.reject(new Error('no'));
    return server.collection('classes').get().then(function(snap){
      var arr = snap.docs.map(function(d){ var o=d.data(); o.id=d.id; return o; });
      if (arr.length){ window.DB.classes = arr; populateLoginDropdown(); }
      return arr.length;
    });
  }
  tryS(window.fb)
    .catch(function(){ return tryS(window.fbBackup); })
    .catch(function(){
      try {
        var raw = localStorage.getItem('sppt_cache_classes_' + String((window.currentUser||{}).email||'').toLowerCase());
        if (raw){
          var d = JSON.parse(raw);
          if (d && d.classes){ window.DB.classes = d.classes; populateLoginDropdown(); }
        }
      } catch(err){}
    });
}

/* ============================================================
   BAGIAN 8 — GDRIVE INTEGRATION
   ============================================================ */
function injectGDriveKasButton(){
  if (!window.currentUser || (uRole() !== 'bendahara' && !isGuru())) return;
  var mb = document.getElementById('modal-body'), mt = document.getElementById('modal-title');
  if (!mb || !mt) return;
  var t = (mt.textContent || '').toLowerCase();
  if (t.indexOf('kas') < 0 || mb.querySelector('.sf-gdrive-kas-card')) return;
  var cid = uCid(); if (!cid) return;
  var card = document.createElement('div');
  card.className = 'card sf-gdrive-kas-card';
  card.style.cssText = 'border-left:4px solid var(--primary);margin-bottom:14px;background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));';
  card.innerHTML = '<h3 style="font-size:13.5px;margin-bottom:6px;">Arsip Nota & Foto Barang</h3>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Link GDrive folder berisi foto nota & foto barang.</p>' +
    '<button class="btn btn-primary btn-sm btn-block" onclick="window.__sfOpenGDriveKas()">Set / Ubah Link Google Drive</button>';
  var f = mb.querySelector('.card');
  if (f && f.parentNode) f.parentNode.insertBefore(card, f);
  else mb.insertBefore(card, mb.firstChild);
}

window.__sfOpenGDriveKas = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  closeModal();
  setTimeout(function(){
    if (typeof window.openGDriveKeuangan === 'function') window.openGDriveKeuangan(cid);
    else alert('Fitur GDrive belum siap.');
  }, 200);
};

function injectGDriveKeuanganButton(){
  if (!window.currentUser || (uRole() !== 'bendahara' && !isGuru())) return;
  var mb = document.getElementById('modal-body'), mt = document.getElementById('modal-title');
  if (!mb || !mt) return;
  var t = (mt.textContent || '').toLowerCase();
  if (t.indexOf('keuangan') < 0 || mb.querySelector('.sf-gdrive-keu-card')) return;
  var cid = uCid(); if (!cid) return;
  var card = document.createElement('div');
  card.className = 'card sf-gdrive-keu-card';
  card.style.cssText = 'border-left:4px solid var(--success);margin-bottom:14px;background:linear-gradient(135deg,var(--success-soft),var(--info-soft));';
  card.innerHTML = '<h3 style="font-size:13.5px;margin-bottom:6px;">Arsip Nota & Foto Barang</h3>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Link GDrive bukti belanja.</p>' +
    '<button class="btn btn-success btn-sm btn-block" onclick="window.__sfOpenGDriveKas()">Buka Arsip GDrive</button>';
  var f = mb.querySelector('.card');
  if (f && f.parentNode) f.parentNode.insertBefore(card, f);
  else mb.insertBefore(card, mb.firstChild);
}

function injectGDriveDokpubCard(){
  if (!window.currentUser || !isSiswa()) return;
  var r = uRole();
  if (r !== 'koor_publikasi' && r !== 'anggota_publikasi') return;
  var mc = document.getElementById('main-content');
  if (!mc || mc.querySelector('.sf-gdrive-dokpub-card')) return;
  var cid = uCid(); if (!cid) return;
  var card = document.createElement('div');
  card.className = 'card sf-gdrive-dokpub-card';
  card.style.cssText = 'border-left:4px solid var(--success);margin-bottom:14px;background:linear-gradient(135deg,var(--success-soft),var(--info-soft));';
  card.innerHTML = '<h3 style="font-size:13.5px;margin-bottom:6px;">Galeri Dokumentasi GDrive</h3>' +
    '<p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Kelola link GDrive dokumentasi produksi.</p>' +
    '<button class="btn btn-success btn-sm" onclick="window.__sfOpenGDriveDokpub()">Buka Galeri</button>';
  var qa = mc.querySelector('.quick-actions-wrap'), tb = mc.querySelector('.mp-toolbar');
  if (qa && qa.parentNode) qa.parentNode.insertBefore(card, qa);
  else if (tb && tb.nextSibling) tb.parentNode.insertBefore(card, tb.nextSibling);
  else if (tb) tb.parentNode.appendChild(card);
  else mc.insertBefore(card, mc.firstChild);
}

window.__sfOpenGDriveDokpub = function(){
  var cid = uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  if (typeof window.openGDriveDokpub === 'function') window.openGDriveDokpub(cid);
  else alert('Fitur GDrive Dokpub belum siap.');
};

/* ============================================================
   BAGIAN 9 — TOMBOL EXTRA TOOLBAR
   ============================================================ */
function injectToolbarExtraButtons(){
  if (!window.currentUser || !isSiswa()) return;
  var tb = document.querySelector('.mp-toolbar');
  if (!tb) return;
  var r = uRole(); var cid = uCid();
  if (!cid) return;
  if (r === 'bendahara' && !tb.querySelector('.btn-gdrive-keuangan')){
    var b1 = document.createElement('button');
    b1.className = 'btn btn-gdrive-keuangan';
    b1.style.cssText = 'background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;border:none;';
    b1.onclick = function(){ if (window.openGDriveKeuangan) window.openGDriveKeuangan(cid); };
    b1.textContent = 'Arsip Nota';
    tb.appendChild(b1);
  }
  if ((r === 'koor_publikasi' || r === 'anggota_publikasi') && !tb.querySelector('.btn-gdrive-dokpub')){
    var b2 = document.createElement('button');
    b2.className = 'btn btn-gdrive-dokpub';
    b2.style.cssText = 'background:linear-gradient(135deg,var(--success),#059669);color:#fff;border:none;';
    b2.onclick = function(){ if (window.openGDriveDokpub) window.openGDriveDokpub(cid); };
    b2.textContent = 'Galeri Dokpub';
    tb.appendChild(b2);
  }
  if ((r === 'pimpinan_produksi' || r === 'sekretaris') && !tb.querySelector('.btn-master-schedule')){
    var b3 = document.createElement('button');
    b3.className = 'btn btn-master-schedule';
    b3.onclick = function(){ if (window.openMasterSchedule) window.openMasterSchedule(cid); };
    b3.textContent = 'Master Jadwal';
    tb.appendChild(b3);
  }
  if ((r === 'koor_publikasi' || r === 'anggota_publikasi') && !tb.querySelector('.btn-kalender-konten')){
    var b4 = document.createElement('button');
    b4.className = 'btn btn-kalender-konten';
    b4.onclick = function(){ if (window.openKalenderKonten) window.openKalenderKonten(cid); };
    b4.textContent = 'Kalender Konten';
    tb.appendChild(b4);
  }
}

/* ============================================================
   BAGIAN 10 — HOOKS
   ============================================================ */
(function(){
  var orig = window.renderGuruDash;
  if (typeof orig !== 'function') return;
  window.renderGuruDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      if (window.currentUser && window.currentUser.type === 'guru'){
        if (window.myClasses().length === 0 && Date.now() - __lastRepairAt > 5000) window.__repairKelas();
      }
    }, 600);
    return ret;
  };
})();

(function(){
  var orig = window.renderSiswaDash;
  if (typeof orig !== 'function') return;
  window.renderSiswaDash = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){ injectToolbarExtraButtons(); injectGDriveDokpubCard(); }, 300);
    setTimeout(function(){ injectToolbarExtraButtons(); injectGDriveDokpubCard(); }, 1000);
    return ret;
  };
})();

(function(){
  var orig = window.showApp;
  if (typeof orig !== 'function') return;
  window.showApp = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){
      if (!window.currentUser || window.currentUser.type !== 'guru') return;
      var cached = _loadCache();
      if (cached && cached.classes.length){ window.DB.classes = cached.classes; if (window.renderGuruDash) window.renderGuruDash(); }
      window.__repairKelas(function(ok, err){
        if (!ok && err && window.myClasses().length === 0) showStatusBar('Kelas tidak dapat dimuat.');
      });
    }, 800);
    return ret;
  };
})();

(function(){
  var orig = window.openKasKelas;
  if (typeof orig !== 'function') return;
  window.openKasKelas = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(injectGDriveKasButton, 120);
    setTimeout(injectGDriveKasButton, 400);
    return ret;
  };
})();

(function(){
  var orig = window.openKeuanganModal;
  if (typeof orig === 'function'){
    window.openKeuanganModal = function(){
      var ret = orig.apply(this, arguments);
      setTimeout(injectGDriveKeuanganButton, 120);
      setTimeout(injectGDriveKeuanganButton, 400);
      return ret;
    };
  }
})();

if (typeof MutationObserver !== 'undefined'){
  var mo = new MutationObserver(function(){
    injectGDriveKasButton();
    injectGDriveKeuanganButton();
    injectToolbarExtraButtons();
    injectGDriveDokpubCard();
  });
  var startMO = function(){
    var modal = document.getElementById('modal');
    if (modal) mo.observe(modal, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
    var mc = document.getElementById('main-content');
    if (mc) mo.observe(mc, {childList:true, subtree:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(startMO, 800); });
  else setTimeout(startMO, 800);
}

/* ============================================================
   BAGIAN 11 — RUN AWAL
   ============================================================ */
setTimeout(autoReadClassesForLogin, 800);
setTimeout(autoReadClassesForLogin, 2000);
setTimeout(populateLoginDropdown, 1500);
setTimeout(populateLoginDropdown, 3000);
setInterval(populateLoginDropdown, 2500);

setTimeout(function(){
  if (!window.currentUser || window.currentUser.type !== 'guru') return;
  var cached = _loadCache();
  if (cached && cached.classes.length){ window.DB.classes = cached.classes; if (window.renderGuruDash) window.renderGuruDash(); }
  window.__repairKelas(function(ok, err){
    if (!ok && err && window.myClasses().length === 0) showStatusBar('Kelas tidak dapat dimuat.');
  });
}, 1500);

setInterval(function(){
  if (!window.currentUser || window.currentUser.type !== 'guru') return;
  if (window.myClasses().length > 0) return;
  if (Date.now() - __lastRepairAt < 40000) return;
  window.__repairKelas();
}, 45000);

setTimeout(function(){ injectToolbarExtraButtons(); injectGDriveDokpubCard(); }, 2000);
setTimeout(function(){ injectToolbarExtraButtons(); injectGDriveDokpubCard(); }, 4000);
setInterval(function(){ injectToolbarExtraButtons(); injectGDriveDokpubCard(); }, 5000);

/* ============================================================
   BAGIAN 12 — CONSOLE COMMANDS
   ============================================================ */
window.fixKelasSekarang = function(){
  window.__repairKelas(function(ok, err){
    if (ok) alert('Kelas dimuat!');
    else if (err) alert('Error: ' + err.message);
    else alert('Tidak ada kelas.');
  });
};

window.bridgeInfo = function(){
  console.log('=== SUPERFIX v9.1 ===');
  console.log('User:', (window.currentUser||{}).name, '/', (window.currentUser||{}).role);
  console.log('uCid:', window.uCid());
  console.log('__viewClassId:', window.__viewClassId);
  console.log('__currentViewClassId:', window.__currentViewClassId);
  ['openBeriTugas','openTugasSaya','openDeadlineList','openPenilaianGuruDashboard','openRekapNilai','openNilaiSaya','openKasKelas','openSistemTahapan','markAllRead'].forEach(function(fn){
    console.log('  ' + fn + ':', typeof window[fn]);
  });
};

window.clearKelasCache = function(){
  try { localStorage.removeItem(_cacheKey()); alert('Cache dibersihkan. Refresh.'); } catch(e){}
};

console.log('[superfix] v9.1 FULL (tanpa icon) loaded');

})();