/* ============================================================
   SP-PPT features-struktur.js — v3.0 (dengan foto profil)
   Fitur: Struktur Kerabat Kerja berbasis jobdesk + foto profil
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico){ console.warn('[features-struktur] app.js belum di-load.'); return; }

function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function fmtDateShort(s){ return window.fmtDateShort ? window.fmtDateShort(s) : '-'; }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function openModal(t, b){ if (window.openModal) window.openModal(t, b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id === cid; }); }
function logAct(t, m, k){ if (window.logActivity) window.logActivity(t, m, k); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }

/* ============================================================
   HIERARKI JOBDESK
   ============================================================ */
var JOB_LEVELS = [
  { role:'pimpinan_produksi',  jabatan:'Pimpinan Produksi',            level:1, grup:'PENGURUS INTI',      warna:'#dc2626', icon:'star' },
  { role:'sutradara',          jabatan:'Sutradara',                    level:1, grup:'PENGURUS INTI',      warna:'#dc2626', icon:'star' },
  { role:'asisten_sutradara',  jabatan:'Asisten Sutradara',            level:2, grup:'PENGURUS INTI',      warna:'#f59e0b', icon:'award' },
  { role:'sekretaris',         jabatan:'Sekretaris',                   level:2, grup:'PENGURUS INTI',      warna:'#f59e0b', icon:'fileText' },
  { role:'bendahara',          jabatan:'Bendahara',                    level:2, grup:'PENGURUS INTI',      warna:'#f59e0b', icon:'chart' },
  { role:'koor_publikasi',     jabatan:'Koor. Publikasi & Dokumentasi',level:3, grup:'DIVISI PRODUKSI',    warna:'#2563eb', icon:'image' },
  { role:'koor_perlengkapan',  jabatan:'Koor. Perlengkapan',           level:3, grup:'DIVISI PRODUKSI',    warna:'#2563eb', icon:'briefcase' },
  { role:'koor_akomodasi',     jabatan:'Koor. Akomodasi & Transportasi',level:3,grup:'DIVISI PRODUKSI',   warna:'#2563eb', icon:'phone' },
  { role:'koor_panggung',      jabatan:'Koor. Tata Pentas & Panggung', level:3, grup:'DIVISI ARTISTIK',    warna:'#8b5cf6', icon:'layers' },
  { role:'koor_musik',         jabatan:'Koor. Tata Musik & Suara',     level:3, grup:'DIVISI ARTISTIK',    warna:'#8b5cf6', icon:'star' },
  { role:'koor_busana',        jabatan:'Koor. Tata Busana',            level:3, grup:'DIVISI ARTISTIK',    warna:'#8b5cf6', icon:'briefcase' },
  { role:'koor_rias',          jabatan:'Koor. Tata Rias',              level:3, grup:'DIVISI ARTISTIK',    warna:'#8b5cf6', icon:'user' },
  { role:'koor_cahaya',        jabatan:'Koor. Tata Cahaya',            level:3, grup:'DIVISI ARTISTIK',    warna:'#8b5cf6', icon:'sparkle' },
  { role:'anggota_publikasi',     jabatan:'Anggota Publikasi',         level:4, grup:'DIVISI PRODUKSI',    warna:'#0ea5e9', icon:'user' },
  { role:'anggota_perlengkapan',  jabatan:'Anggota Perlengkapan',      level:4, grup:'DIVISI PRODUKSI',    warna:'#0ea5e9', icon:'user' },
  { role:'anggota_akomodasi',     jabatan:'Anggota Akomodasi',         level:4, grup:'DIVISI PRODUKSI',    warna:'#0ea5e9', icon:'user' },
  { role:'anggota_panggung',      jabatan:'Anggota Tata Pentas',       level:4, grup:'DIVISI ARTISTIK',    warna:'#a855f7', icon:'user' },
  { role:'anggota_musik',         jabatan:'Anggota Tata Musik',        level:4, grup:'DIVISI ARTISTIK',    warna:'#a855f7', icon:'user' },
  { role:'anggota_busana',        jabatan:'Anggota Tata Busana',       level:4, grup:'DIVISI ARTISTIK',    warna:'#a855f7', icon:'user' },
  { role:'anggota_rias',          jabatan:'Anggota Tata Rias',         level:4, grup:'DIVISI ARTISTIK',    warna:'#a855f7', icon:'user' },
  { role:'anggota_cahaya',        jabatan:'Anggota Tata Cahaya',       level:4, grup:'DIVISI ARTISTIK',    warna:'#a855f7', icon:'user' },
  { role:'pemain',                jabatan:'Pemeran',                   level:3, grup:'PEMERAN',           warna:'#10b981', icon:'star' }
];

function getJobMeta(role){
  for (var i = 0; i < JOB_LEVELS.length; i++){
    if (JOB_LEVELS[i].role === role) return JOB_LEVELS[i];
  }
  return { role: role, jabatan: role, level: 99, grup: 'LAINNYA', warna: '#6b7280', icon: 'user' };
}
window.getStrukturMeta = getJobMeta;
window.JOB_LEVELS = JOB_LEVELS;

/* ============================================================
   AVATAR HELPER — foto atau inisial
   ============================================================ */
function avatarHTML(s, warna, size){
  size = size || 36;
  var initials = esc((s.name||'?').charAt(0).toUpperCase());
  if (s.foto){
    return '<img src="' + esc(s.foto) + '" alt="' + esc(s.name||'') + '" ' +
      'style="width:'+size+'px;height:'+size+'px;border-radius:50%;' +
      'object-fit:cover;flex-shrink:0;border:2px solid ' + warna + ';">';
  }
  return '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:' + warna + ';color:#fff;' +
    'display:flex;align-items:center;justify-content:center;font-weight:800;' +
    'font-size:'+Math.round(size*0.4)+'px;flex-shrink:0;">' + initials + '</div>';
}
window.avatarHTML = avatarHTML;

/* ============================================================
   MODAL STRUKTUR KERABAT KERJA
   ============================================================ */
window.openStrukturKerabatKerja = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  var c = findClass(cid);
  if (!c) return;

  var students = c.students || [];
  var myId = uSid();
  var canEdit = isGuru() || uRole() === 'pimpinan_produksi';
  var kerabatNama = c.kerabatNama || ('Kerabat Kerja ' + c.name);
  var kerabatLogo = c.kerabatLogo || '';
  var kerabatDesk = c.kerabatDesk || '';

  var byGrup = {};
  JOB_LEVELS.forEach(function(item){
    if (!byGrup[item.grup]) byGrup[item.grup] = [];
  });
  students.forEach(function(s){
    var meta = getJobMeta(s.role);
    if (!byGrup[meta.grup]) byGrup[meta.grup] = [];
    byGrup[meta.grup].push({student: s, meta: meta});
  });
  Object.keys(byGrup).forEach(function(k){
    byGrup[k].sort(function(a,b){
      if (a.meta.level !== b.meta.level) return a.meta.level - b.meta.level;
      return String(a.student.name).localeCompare(String(b.student.name));
    });
  });

  var h = '';
  h += '<div style="text-align:center;padding:24px 20px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;margin-bottom:18px;position:relative;">';
  if (kerabatLogo){
    h += '<div style="position:relative;display:inline-block;">' +
      '<img src="' + esc(kerabatLogo) + '" style="max-width:120px;max-height:120px;border-radius:16px;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.15);object-fit:cover;background:#fff;">' +
      (canEdit ? '<button onclick="event.stopPropagation();openEditKerabat(\'' + cid + '\')" style="position:absolute;bottom:-6px;right:-6px;width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;border:3px solid #fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;">' + ic('edit', 14) + '</button>' : '') +
    '</div>';
  } else {
    h += '<div style="width:110px;height:110px;background:#fbbf24;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;position:relative;cursor:' + (canEdit ? 'pointer' : 'default') + ';" ' + (canEdit ? 'onclick="openEditKerabat(\'' + cid + '\')"' : '') + '>' +
      ic('award', 48) +
      (canEdit ? '<div style="position:absolute;bottom:6px;right:6px;font-size:10px;background:rgba(0,0,0,.3);padding:2px 6px;border-radius:4px;color:#fff;font-weight:700;">Klik untuk upload</div>' : '') +
    '</div>';
  }
  h += '<h2 style="font-size:20px;font-weight:800;color:#78350f;margin:10px 0 4px 0;">' + esc(kerabatNama) + '</h2>';
  if (kerabatDesk){
    h += '<p style="font-size:12.5px;color:#92400e;margin:4px 0;font-style:italic;">' + esc(kerabatDesk) + '</p>';
  }
  h += '<p style="font-size:11.5px;color:#92400e;margin:0;">Kelas ' + esc(c.name) + ' &middot; ' + students.length + ' Anggota</p>';
  h += '</div>';

  /* Highlight posisi user */
  if (myId){
    var me = students.find(function(s){ return s.id === myId; });
    if (me){
      var m = getJobMeta(me.role);
      h += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:12px;margin-bottom:16px;border-left:4px solid var(--primary);">' +
        avatarHTML(me, 'var(--primary)', 48) +
        '<div style="flex:1;">' +
          '<div style="font-weight:800;font-size:14px;color:var(--text-strong);">' + esc(me.name) + '</div>' +
          '<div style="font-size:12px;color:var(--primary-dark);margin-top:2px;">' + esc(m.jabatan) + '</div>' +
        '</div>' +
        '<span class="badge badge-primary">Posisi Anda</span>' +
      '</div>';
    }
  }

  if (canEdit){
    h += '<div class="action-row" style="margin-bottom:16px;flex-wrap:wrap;">' +
      '<button class="btn btn-primary btn-sm" onclick="openEditKerabat(\'' + cid + '\')">' + ic('edit','sm') + ' Edit Nama / Logo</button>' +
      '<button class="btn btn-sm" onclick="autoFillKerabat(\'' + cid + '\')">' + ic('refresh','sm') + ' Auto-Fill</button>' +
      '<button class="btn btn-sm" onclick="exportStrukturExcel(\'' + cid + '\')">' + ic('download','sm') + ' Export Excel</button>' +
    '</div>';
  }

  if (students.length === 0){
    h += '<div class="empty-state">' + ic('users', 40) + '<p>Belum ada anggota terdaftar</p></div>';
    openModal('Struktur Kerabat Kerja', h);
    if (window.hydrateIcons) window.hydrateIcons();
    return;
  }

  var grupOrder = ['PENGURUS INTI', 'DIVISI PRODUKSI', 'DIVISI ARTISTIK', 'PEMERAN'];
  var grupIcon = {
    'PENGURUS INTI': 'shield',
    'DIVISI PRODUKSI': 'briefcase',
    'DIVISI ARTISTIK': 'layers',
    'PEMERAN': 'star'
  };
  var grupColor = {
    'PENGURUS INTI': '#dc2626',
    'DIVISI PRODUKSI': '#2563eb',
    'DIVISI ARTISTIK': '#8b5cf6',
    'PEMERAN': '#10b981'
  };

  grupOrder.forEach(function(grup){
    var items = byGrup[grup];
    if (!items || items.length === 0) return;

    h += '<div style="margin-bottom:20px;">';
    h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:' + grupColor[grup] + ';border-radius:10px 10px 0 0;color:#fff;">' +
      ic(grupIcon[grup] || 'users', 18) +
      '<div style="font-weight:800;font-size:13.5px;letter-spacing:.05em;">' + grup + '</div>' +
      '<div style="margin-left:auto;font-size:11px;opacity:.9;">' + items.length + ' orang</div>' +
    '</div>';
    h += '<div style="border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:12px;background:var(--card);">';

    var byLevel = {};
    items.forEach(function(item){
      if (!byLevel[item.meta.level]) byLevel[item.meta.level] = [];
      byLevel[item.meta.level].push(item);
    });
    var levelKeys = Object.keys(byLevel).map(Number).sort();

    levelKeys.forEach(function(lvl, lvlIdx){
      var levelItems = byLevel[lvl];
      var levelLabel = lvl === 1 ? 'Pimpinan Inti' : lvl === 2 ? 'Wakil & Pengurus' : lvl === 3 ? 'Koordinator Divisi' : 'Anggota';

      if (levelKeys.length > 1 || lvl > 1){
        h += '<div style="display:flex;align-items:center;gap:8px;margin:' + (lvlIdx > 0 ? '14px' : '0') + ' 0 8px 0;">' +
          '<div style="font-size:10.5px;font-weight:800;color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase;">LEVEL ' + lvl + ' &mdash; ' + levelLabel + '</div>' +
          '<div style="flex:1;height:1px;background:var(--border);"></div>' +
        '</div>';
      }

      var indent = (lvl - 1) * 16;

      levelItems.forEach(function(item){
        var s = item.student;
        var m = item.meta;
        var isMe = s.id === myId;

        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;' +
          'margin-left:' + indent + 'px;margin-bottom:6px;' +
          'background:' + (isMe ? 'var(--primary-soft)' : 'var(--surface)') + ';' +
          'border-left:4px solid ' + m.warna + ';border-radius:8px;position:relative;">';

        if (lvl > 1){
          h += '<div style="position:absolute;left:-8px;top:50%;width:8px;height:2px;background:' + m.warna + ';"></div>';
        }

        h += avatarHTML(s, m.warna, 36);

        h += '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:700;font-size:13px;color:var(--text-strong);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
            esc(s.name) +
            (isMe ? '<span class="badge badge-primary" style="font-size:9px;">Anda</span>' : '') +
          '</div>' +
          '<div style="font-size:11.5px;color:' + m.warna + ';font-weight:600;margin-top:2px;">' + esc(m.jabatan) + '</div>' +
          (s.phone ? '<div style="font-size:10.5px;color:var(--text-muted);margin-top:2px;">' + ic('phone','sm') + ' ' + esc(s.phone) + '</div>' : '') +
        '</div>';

        if (s.phone){
          var phone = window.normalizePhone ? window.normalizePhone(s.phone) : s.phone.replace(/\D/g,'');
          if (phone.charAt(0) === '0') phone = '62' + phone.substring(1);
          if (phone.substring(0,2) !== '62') phone = '62' + phone;
          var waMsg = 'Halo *' + s.name + '*,\n\nDari Kerabat Kerja ' + (c.name||'') + '.\n\n—';
          var waLink = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(waMsg);
          h += '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn btn-sm btn-success" style="text-decoration:none;padding:6px 10px;flex-shrink:0;">' +
            ic('phone','sm') + '</a>';
        }
        h += '</div>';
      });
    });
    h += '</div></div>';
  });

  openModal('Struktur Kerabat Kerja', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   EDIT KERABAT
   ============================================================ */
window.openEditKerabat = function(cid){
  if (!isGuru() && uRole() !== 'pimpinan_produksi'){ alert('Akses ditolak'); return; }
  var c = findClass(cid);
  if (!c) return;
  var nama = c.kerabatNama || ('Kerabat Kerja ' + c.name);
  var logo = c.kerabatLogo || '';
  var desk = c.kerabatDesk || '';

  var h = '';
  h += '<div class="form-group"><label>Nama Kerabat Kerja</label>' +
    '<input id="kb-nama" maxlength="80" value="' + esc(nama) + '" placeholder="Contoh: TEATER KEN AROK"></div>';
  h += '<div class="form-group"><label>Deskripsi / Tagline (opsional)</label>' +
    '<input id="kb-desk" maxlength="120" value="' + esc(desk) + '" placeholder="Contoh: Satu Rasa, Satu Panggung"></div>';
  h += '<div class="form-group"><label>Logo Kerabat Kerja (maks 300 KB)</label>' +
    '<input type="file" id="kb-logo" accept="image/*" style="padding:8px;width:100%;">';

  if (logo){
    h += '<div style="text-align:center;margin-top:14px;padding:14px;background:var(--surface);border-radius:10px;">' +
      '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;font-weight:600;">LOGO SAAT INI</div>' +
      '<img src="' + esc(logo) + '" style="max-height:140px;max-width:100%;border-radius:12px;border:3px solid var(--border);background:#fff;padding:8px;">' +
      '<div style="margin-top:10px;"><button class="btn btn-sm btn-danger" onclick="hapusKerabatLogo(\'' + cid + '\')">' + ic('trash','sm') + ' Hapus Logo</button></div>' +
    '</div>';
  }

  h += '<div class="alert alert-info" style="margin-top:14px;">' + ic('info','sm') +
    '<div>Logo sebaiknya <b>berbentuk persegi atau bulat</b> minimal 200×200px. Format PNG/JPG.</div></div>';
  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:12px;" onclick="saveKerabatInfo(\'' + cid + '\')">' + ic('save') + ' Simpan</button>';

  openModal('Edit Kerabat Kerja', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.saveKerabatInfo = function(cid){
  var nama = (document.getElementById('kb-nama').value || '').trim();
  var desk = (document.getElementById('kb-desk').value || '').trim();
  var logoEl = document.getElementById('kb-logo');
  if (!nama || nama.length < 3){ alert('Nama minimal 3 karakter'); return; }
  var c = findClass(cid);
  if (!c) return;

  var proceed = function(logoData){
    var upd = Object.assign({}, c, {
      kerabatNama: nama, kerabatDesk: desk,
      kerabatLogo: logoData !== null ? logoData : (c.kerabatLogo || '')
    });
    delete upd._id;
    window.fbSet('classes', cid, upd).then(function(){
      logAct('kerabat_update', u().name + ' update kerabat kerja: ' + nama, {classId: cid});
      closeModal();
      alert('Tersimpan!');
      setTimeout(function(){ window.openStrukturKerabatKerja(cid); }, 250);
    }).catch(function(e){ alert('Gagal: ' + e.message); });
  };

  if (logoEl && logoEl.files && logoEl.files[0]){
    var f = logoEl.files[0];
    if (f.size > 300*1024){ alert('Logo terlalu besar (maks 300 KB)'); return; }
    var reader = new FileReader();
    reader.onload = function(e){ proceed(e.target.result); };
    reader.readAsDataURL(f);
  } else {
    proceed(null);
  }
};

window.hapusKerabatLogo = function(cid){
  if (!confirm('Hapus logo kerabat kerja?')) return;
  var c = findClass(cid);
  if (!c) return;
  var upd = Object.assign({}, c, {kerabatLogo: ''});
  delete upd._id;
  window.fbSet('classes', cid, upd).then(function(){
    closeModal();
    alert('Logo dihapus');
    setTimeout(function(){ window.openStrukturKerabatKerja(cid); }, 250);
  });
};

/* ============================================================
   AUTO-FILL & EXPORT
   ============================================================ */
window.autoFillKerabat = function(cid){
  if (!isGuru() && uRole() !== 'pimpinan_produksi'){ alert('Akses ditolak'); return; }
  var c = findClass(cid);
  if (!c) return;
  var students = c.students || [];
  if (students.length === 0){ alert('Belum ada siswa'); return; }
  if (!confirm('Auto-fill struktur kerabat dari ' + students.length + ' siswa?')) return;
  var upd = Object.assign({}, c, {
    kerabatNama: c.kerabatNama || ('Kerabat Kerja ' + c.name),
    kerabatAutoFilledAt: Date.now()
  });
  delete upd._id;
  window.fbSet('classes', cid, upd).then(function(){
    alert('Auto-fill selesai!');
    closeModal();
    setTimeout(function(){ window.openStrukturKerabatKerja(cid); }, 250);
  });
};

window.exportStrukturExcel = function(cid){
  if (!window.XLSX){ alert('Library Excel belum siap'); return; }
  var c = findClass(cid);
  if (!c) return;
  var students = c.students || [];
  var rows = [['No', 'Grup', 'Level', 'Nama', 'Jabatan', 'Email', 'No. WA']];
  var sorted = students.slice().sort(function(a, b){
    var ma = getJobMeta(a.role), mb = getJobMeta(b.role);
    var groupOrder = ['PENGURUS INTI', 'DIVISI PRODUKSI', 'DIVISI ARTISTIK', 'PEMERAN'];
    var ai = groupOrder.indexOf(ma.grup), bi = groupOrder.indexOf(mb.grup);
    if (ai !== bi) return ai - bi;
    if (ma.level !== mb.level) return ma.level - mb.level;
    return String(a.name).localeCompare(String(b.name));
  });
  sorted.forEach(function(s, i){
    var m = getJobMeta(s.role);
    rows.push([i+1, m.grup, m.level, s.name, m.jabatan, s.email || '', s.phone || '']);
  });
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:5}, {wch:20}, {wch:6}, {wch:28}, {wch:32}, {wch:30}, {wch:15}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Struktur Kerabat');
  var kerabatName = (c.kerabatNama || 'Kerabat_Kerja').replace(/\s+/g, '_');
  XLSX.writeFile(wb, 'Struktur_' + kerabatName + '_' + c.name.replace(/\s+/g, '_') + '.xlsx');
};

/* ============================================================
   FLOATING BUTTON KERABAT
   ============================================================ */
function injectFloatingKerabat(){
  if (!window.currentUser) return;
  var cid = uCid();
  if (!cid) return;
  var old = document.getElementById('btn-floating-kerabat');
  if (old) old.remove();
  var c = findClass(cid);
  if (!c) return;
  if (!c.kerabatNama && !c.kerabatLogo) return;

  var btn = document.createElement('button');
  btn.id = 'btn-floating-kerabat';
  btn.type = 'button';
  btn.className = 'floating-panduan';
  btn.style.cssText = 'bottom:260px;background:linear-gradient(135deg,#fef3c7,#fbbf24);color:#92400e;box-shadow:0 6px 20px rgba(251,191,36,.4);';
  btn.title = c.kerabatNama || 'Kerabat Kerja';
  btn.onclick = function(){ window.openStrukturKerabatKerja(cid); };

  if (c.kerabatLogo){
    btn.innerHTML = '<img src="' + esc(c.kerabatLogo) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    btn.style.padding = '0';
  } else {
    btn.innerHTML = ic('award', 22) + '<span class="floating-panduan-label">Kerabat</span>';
  }
  document.body.appendChild(btn);
}

function injectKerabatBadge(){
  if (!window.currentUser || String(window.currentUser.type||'').toLowerCase() !== 'siswa') return;
  var old = document.getElementById('kerabat-highlight-badge');
  if (old) old.remove();
  var cid = uCid();
  if (!cid) return;
  var c = findClass(cid);
  if (!c || !c.kerabatNama) return;
  var ui = document.getElementById('user-info');
  if (!ui) return;
  var badge = document.createElement('span');
  badge.id = 'kerabat-highlight-badge';
  badge.style.cssText = 'background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;margin-left:8px;border:1px solid #fbbf24;cursor:pointer;';
  badge.onclick = function(){ window.openStrukturKerabatKerja(cid); };
  badge.innerHTML = (c.kerabatLogo ? '<img src="' + esc(c.kerabatLogo) + '" style="width:14px;height:14px;border-radius:50%;object-fit:cover;">' : '') + esc(c.kerabatNama);
  ui.appendChild(badge);
}

(function(){
  var orig = window.renderSiswaDash || window.renderSiswaDashboard;
  if (typeof orig !== 'function') return;
  var wrapped = function(){
    var ret = orig.apply(this, arguments);
    setTimeout(function(){ injectKerabatBadge(); injectFloatingKerabat(); }, 500);
    setTimeout(function(){ injectKerabatBadge(); injectFloatingKerabat(); }, 1500);
    return ret;
  };
  window.renderSiswaDash = wrapped;
  window.renderSiswaDashboard = wrapped;
})();

(function(){
  var orig = window.logout;
  if (typeof orig !== 'function') return;
  window.logout = function(){
    ['btn-floating-aduan','btn-floating-naskah','btn-floating-kerabat'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    var badge = document.getElementById('kerabat-highlight-badge');
    if (badge) badge.remove();
    return orig.apply(this, arguments);
  };
})();

setTimeout(function(){ injectKerabatBadge(); injectFloatingKerabat(); }, 2000);

/* ============================================================
   IMPORT SISWA (placeholder)
   ============================================================ */
window.openImportSiswa = function(cid){
  cid = cid || uCid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  if (!isGuru()){ alert('Hanya guru/admin'); return; }
  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>Import Siswa dari Excel</b><br><small>Format: Nama | Email | Password | Peran | No. WA</small></div></div>';
  h += '<button class="btn btn-sm" style="margin-bottom:14px;" onclick="downloadTemplateSiswa()">' + ic('download','sm') + ' Download Template</button>';
  h += '<div class="form-group"><label>Pilih File Excel</label><input type="file" id="import-file" accept=".xlsx,.xls" style="padding:8px;width:100%;"></div>';
  h += '<button class="btn btn-primary btn-block" onclick="doImportSiswa(\'' + cid + '\')">' + ic('upload') + ' Import</button>';
  openModal('Import Siswa', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.downloadTemplateSiswa = function(){
  if (!window.XLSX){ alert('Excel library belum siap'); return; }
  var data = [
    ['Nama','Email','Password','Peran','No. WA'],
    ['Ahmad Fauzi','ahmad.f@siswa.smp.belajar.id','#Smpn10smd','pemain','081234567890']
  ];
  var ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{wch:28},{wch:38},{wch:15},{wch:26},{wch:15}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'Template_Import_Siswa.xlsx');
};

window.doImportSiswa = function(cid){
  var fileEl = document.getElementById('import-file');
  if (!fileEl || !fileEl.files || !fileEl.files[0]){ alert('Pilih file terlebih dahulu'); return; }
  var f = fileEl.files[0];
  var c = findClass(cid);
  if (!c) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try {
      var data = new Uint8Array(e.target.result);
      var wb = XLSX.read(data, {type: 'array'});
      var sh = wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(sh);
      if (rows.length === 0){ alert('File kosong'); return; }
      var ok = 0, dup = [], bad = [];
      var existingEmails = {};
      (c.students||[]).forEach(function(s){ if (s.email) existingEmails[s.email.toLowerCase()] = true; });
      var newStudents = (c.students||[]).slice();
      rows.forEach(function(row, i){
        var n = String(row['Nama'] || row['nama'] || '').trim();
        var em = String(row['Email'] || row['email'] || '').trim().toLowerCase();
        var pw = String(row['Password'] || row['password'] || '').trim() || '#Smpn10smd';
        var ro = String(row['Peran'] || row['peran'] || row['Role'] || row['role'] || '').trim().toLowerCase();
        var ph = String(row['No. WA'] || row['no. wa'] || row['No WA'] || row['phone'] || '').replace(/\D/g,'');
        if (!n || !em || !ro){ bad.push('Baris ' + (i+2)); return; }
        if (!window.ROLES[ro]){ bad.push('Baris ' + (i+2) + ': role invalid'); return; }
        if (existingEmails[em]){ dup.push('Baris ' + (i+2)); return; }
        newStudents.push({ id: uid(), name: n, email: em, phone: ph, password: pw, role: ro, registeredAt: Date.now() });
        existingEmails[em] = true;
        ok++;
      });
      if (ok === 0){ alert('Tidak ada data valid.\n\n' + (bad.slice(0,5).join('\n'))); return; }
      window.fbSet('classes', cid, Object.assign({}, c, {students: newStudents})).then(function(){
        var msg = 'Import berhasil! ' + ok + ' siswa ditambahkan';
        if (dup.length) msg += '\n' + dup.length + ' duplikat dilewati';
        if (bad.length) msg += '\n' + bad.length + ' gagal';
        alert(msg);
        closeModal();
        setTimeout(function(){ if (window.viewClass) window.viewClass(cid); }, 300);
      });
    } catch(err){ alert('Error: ' + err.message); }
  };
  reader.readAsArrayBuffer(f);
};

window.getStrukturMeta = getJobMeta;

console.log('[features-struktur] v3.0 (foto profil) loaded');

})();
