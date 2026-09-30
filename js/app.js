/* ============================================================
   SP-PPT v2.0 — FEATURES (10 fitur digabung)
   ============================================================ */
(function(){
'use strict';

/* ========== CHECKLIST ========== */
function saveChecklist(cid,items){
  window.DB.checklists[cid] = { items:items };
  return window.fsSet('checklists',cid,{classId:cid,items:items});
}
window.saveChecklist = saveChecklist;
window.getChecklist = function(cid){ return window.DB.checklists[cid]||{items:[]}; };

window.openChecklistManage = function(cid){
  cid = cid||window.myCid();
  if(!cid){ window.toast('Kelas tidak ditemukan','error'); return; }
  if(window.myType()!=='guru' && window.myType()!=='admin'){ window.toast('Hanya guru/admin','error'); return; }
  window.__clsManageCid = cid;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return;
  var items = (window.getChecklist(cid).items||[]).filter(function(it){ return !it.isPersonal; });
  var total = items.length, done = items.filter(function(x){ return x.done; }).length;
  var pct = total>0 ? Math.round(done/total*100) : 0;
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div><b>Kelola Checklist — '+window.U.esc(c.name)+'</b></div></div>';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">'+
    '<button class="btn btn-primary btn-sm" data-action="openAddChecklistItem" data-arg="'+cid+'" data-close-first>'+window.ico('plus','sm')+' Tambah Item</button>'+
    '<button class="btn btn-sm" data-action="openBroadcastChecklist" data-arg="'+cid+'" data-close-first>'+window.ico('send','sm')+' Broadcast</button>'+
    (total>0?'<button class="btn btn-sm btn-danger" data-action="clearAllChecklistItems" data-arg="'+cid+'" data-close-first>'+window.ico('trash','sm')+' Hapus Semua</button>':'')+
  '</div>';
  if(total>0) h += '<div class="progress-container"><div class="progress-bar '+(pct===100?'complete':pct>0?'partial':'')+'" style="width:'+pct+'%"></div></div>'+
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">'+done+' / '+total+' item ('+pct+'%)</div>';
  if(total===0){
    h += '<div class="empty-state">'+window.ico('clipboard',40)+'<p>Belum ada item checklist.</p></div>';
  } else {
    var byRole = {};
    items.forEach(function(it){ var r=it.assignedRole||'umum'; if(!byRole[r]) byRole[r]=[]; byRole[r].push(it); });
    Object.keys(byRole).sort().forEach(function(role){
      var arr = byRole[role];
      var lbl = (window.ROLES[role]&&window.ROLES[role].label)||(role==='umum'?'Umum':role);
      h += '<div style="background:var(--surface);padding:10px 12px;border-radius:8px;margin-bottom:10px;">'+
        '<div style="font-weight:700;font-size:12.5px;margin-bottom:8px;display:flex;justify-content:space-between;">'+
        '<span>'+window.U.esc(lbl)+'</span><span class="badge badge-gray">'+arr.length+'</span></div>';
      arr.forEach(function(it){
        h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--border);">'+
          '<input type="checkbox" disabled '+(it.done?'checked':'')+' style="flex-shrink:0;">'+
          '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+window.U.esc(it.name)+'</div>'+
          '<button class="btn btn-sm" data-action="editChecklistItem" data-arg="'+it.id+'" data-close-first>'+window.ico('edit','sm')+'</button>'+
          '<button class="btn btn-sm btn-danger" data-action="deleteChecklistItem" data-arg="'+it.id+'">'+window.ico('trash','sm')+'</button>'+
        '</div>';
      });
      h += '</div>';
    });
  }
  window.openModal('Kelola Checklist — '+c.name,h);
};

function buildRoleOptions(selected){
  var groups = {
    'Pengurus Inti':['pimpinan_produksi','sutradara','asisten_sutradara','sekretaris','bendahara'],
    'Koor Produksi':['koor_publikasi','koor_perlengkapan','koor_akomodasi'],
    'Koor Artistik':['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'],
    'Anggota Produksi':['anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'],
    'Anggota Artistik':['anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
    'Pemeran':['pemain'], 'Umum':['umum']
  };
  var out = '';
  Object.keys(groups).forEach(function(g){
    out += '<optgroup label="'+g+'">';
    groups[g].forEach(function(r){
      var lbl = (window.ROLES[r]&&window.ROLES[r].label)||(r==='umum'?'Umum (Semua Siswa)':r);
      out += '<option value="'+r+'"'+(r===selected?' selected':'')+'>'+lbl+'</option>';
    });
    out += '</optgroup>';
  });
  return out;
}
window.openAddChecklistItem = function(cid){
  cid = cid||window.__clsManageCid; if(!cid) return;
  window.openModal('Tambah Item Checklist',
    '<div class="form-group"><label>Nama Tugas</label><input id="cl-name" maxlength="150"></div>'+
    '<div class="form-group"><label>Detail</label><textarea id="cl-detail" rows="2"></textarea></div>'+
    '<div class="form-group"><label>Untuk Peran</label><select id="cl-role">'+buildRoleOptions('umum')+'</select></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveChecklistItem" data-arg="'+cid+'|new">'+window.ico('save')+' Simpan</button>');
};
window.editChecklistItem = function(itemId){
  var cid = window.__clsManageCid||window.myCid(); if(!cid) return;
  var item = (window.getChecklist(cid).items||[]).find(function(x){ return x.id===itemId; });
  if(!item){ window.toast('Item tidak ditemukan','error'); return; }
  window.openModal('Edit Item',
    '<div class="form-group"><label>Nama Tugas</label><input id="cl-name" value="'+window.U.esc(item.name)+'" maxlength="150"></div>'+
    '<div class="form-group"><label>Detail</label><textarea id="cl-detail" rows="2">'+window.U.esc(item.detail||'')+'</textarea></div>'+
    '<div class="form-group"><label>Untuk Peran</label><select id="cl-role">'+buildRoleOptions(item.assignedRole||'umum')+'</select></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveChecklistItem" data-arg="'+cid+'|edit|'+itemId+'">'+window.ico('save')+' Simpan</button>');
};
window.saveChecklistItem = function(arg){
  var p = String(arg).split('|'); var cid=p[0], mode=p[1], itemId=p[2];
  if(window.myType()!=='guru' && window.myType()!=='admin'){ window.toast('Akses ditolak','error'); return; }
  var name = window.U.trim(document.getElementById('cl-name').value);
  var detail = window.U.trim(document.getElementById('cl-detail').value);
  var role = document.getElementById('cl-role').value;
  if(!name || name.length<3){ window.toast('Nama minimal 3 karakter','warning'); return; }
  if(window.U.hasProfanity(name)||window.U.hasProfanity(detail)){ window.toast('Kata tidak sopan','error'); return; }
  var items = (window.getChecklist(cid).items||[]).slice();
  if(mode==='new'){
    items.push({ id:window.U.uid(), name:window.U.sanitize(name), detail:window.U.sanitize(detail),
      assignedRole:role, division:window.getDivisionOfRole(role), done:false, doneBy:null, doneAt:null,
      createdAt:Date.now(), createdBy:window.myName(), isPersonal:false });
  } else {
    items = items.map(function(it){ if(it.id!==itemId) return it;
      return Object.assign({},it,{name:window.U.sanitize(name),detail:window.U.sanitize(detail),assignedRole:role}); });
  }
  window.saveChecklist(cid,items).then(function(){
    window.logAct('checklist_update',window.myName()+' '+(mode==='new'?'tambah':'edit')+' item: '+name,{classId:cid});
    window.closeModal(); window.toast('Tersimpan','success');
    setTimeout(function(){ window.openChecklistManage(cid); },200);
  }).catch(function(e){ window.toast('Gagal: '+e.message,'error'); });
};
window.deleteChecklistItem = function(itemId){
  var cid = window.__clsManageCid||window.myCid(); if(!cid) return;
  if(!confirm('Hapus item ini?')) return;
  var items = (window.getChecklist(cid).items||[]).filter(function(x){ return x.id!==itemId; });
  window.saveChecklist(cid,items).then(function(){ window.toast('Item dihapus','success'); window.openChecklistManage(cid); });
};
window.clearAllChecklistItems = function(cid){
  cid = cid||window.__clsManageCid||window.myCid(); if(!cid) return;
  if(!confirm('Hapus SEMUA item checklist?')) return;
  var items = (window.getChecklist(cid).items||[]).filter(function(x){ return x.isPersonal; });
  window.saveChecklist(cid,items).then(function(){ window.toast('Semua item dihapus','success'); window.openChecklistManage(cid); });
};
window.openBroadcastChecklist = function(cid){
  var items = (window.getChecklist(cid).items||[]).filter(function(it){ return !it.isPersonal; });
  if(items.length===0){ window.toast('Belum ada item','warning'); return; }
  window.openModal('Broadcast Checklist',
    '<div class="form-group"><label>Judul</label><input id="bc-title" value="Checklist Tugas Tersedia"></div>'+
    '<div class="form-group"><label>Pesan</label><textarea id="bc-msg" rows="2"></textarea></div>'+
    '<button class="btn btn-primary btn-block" data-action="doBroadcastChecklist" data-arg="'+cid+'">'+window.ico('send')+' Kirim</button>');
};
window.doBroadcastChecklist = function(cid){
  var title = window.U.trim(document.getElementById('bc-title').value);
  var msg = window.U.trim(document.getElementById('bc-msg').value);
  if(!title){ window.toast('Judul wajib','warning'); return; }
  var items = (window.getChecklist(cid).items||[]).filter(function(it){ return !it.isPersonal; });
  var lines = items.map(function(it,i){
    var r = (window.ROLES[it.assignedRole]&&window.ROLES[it.assignedRole].label)||'Umum';
    return (i+1)+'. '+it.name+' ('+r+')';
  }).join('\n');
  var notif = { id:window.U.uid(), classId:cid, fromName:window.myName(), fromType:window.myType(),
    toId:'all', type:'tugas', title:'[CHECKLIST] '+title, message:'Checklist:\n\n'+lines+(msg?'\n\n'+msg:''),
    createdAt:Date.now(), readBy:[], doneBy:[] };
  window.fsSet('notifications',notif.id,notif).then(function(){ window.closeModal(); window.toast('Terkirim','success'); });
};
window.openStudentChecklistSelf = function(){
  var cid = window.myCid(); if(!cid) return;
  var items = (window.getChecklist(cid).items||[]).filter(function(it){ return it.isPersonal && it.ownerId===window.mySid(); });
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div>Checklist pribadi <b>'+window.U.esc(window.myName())+'</b></div></div>'+
    '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" data-action="openAddPersonalItem" data-close-first>'+window.ico('plus','sm')+' Tambah Tugas</button>';
  if(items.length===0){
    h += '<div class="empty-state">'+window.ico('book',40)+'<p>Belum ada tugas pribadi.</p></div>';
  } else {
    items.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface);border-radius:8px;margin-bottom:6px;">'+
        '<input type="checkbox" '+(it.done?'checked':'')+' onchange="window.__togglePersonalItem(\''+it.id+'\',this.checked)">'+
        '<div style="flex:1;font-size:13px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+window.U.esc(it.name)+'</div>'+
        '<button class="btn btn-sm btn-danger" data-action="delPersonalItem" data-arg="'+it.id+'">'+window.ico('x','sm')+'</button></div>';
    });
  }
  window.openModal('Checklist Saya',h);
};
window.openAddPersonalItem = function(){
  window.openModal('Tambah Tugas Pribadi',
    '<div class="form-group"><label>Nama Tugas</label><input id="pi-name"></div>'+
    '<button class="btn btn-primary btn-block" data-action="doAddPersonalItem">'+window.ico('save')+' Simpan</button>');
};
window.doAddPersonalItem = function(){
  var name = window.U.trim(document.getElementById('pi-name').value);
  if(!name){ window.toast('Nama wajib','warning'); return; }
  var cid = window.myCid();
  var items = (window.getChecklist(cid).items||[]).slice();
  items.push({ id:window.U.uid(), name:window.U.sanitize(name), assignedRole:window.myRole(),
    division:window.getDivisionOfRole(window.myRole()), done:false, isPersonal:true,
    ownerId:window.mySid(), ownerName:window.myName(), createdAt:Date.now() });
  window.saveChecklist(cid,items).then(function(){ window.closeModal(); window.openStudentChecklistSelf(); });
};
window.__togglePersonalItem = function(itemId,checked){
  var cid = window.myCid();
  var items = (window.getChecklist(cid).items||[]).map(function(it){
    if(it.id!==itemId) return it;
    return Object.assign({},it,{done:checked,doneBy:checked?window.myName():null,doneAt:checked?Date.now():null});
  });
  window.saveChecklist(cid,items);
};
window.delPersonalItem = function(itemId){
  var cid = window.myCid();
  var items = (window.getChecklist(cid).items||[]).filter(function(x){ return x.id!==itemId; });
  window.saveChecklist(cid,items).then(function(){ window.openStudentChecklistSelf(); });
};
window.openChecklistView = function(cid){
  cid = cid||window.myCid(); if(!cid) return;
  var items = (window.getChecklist(cid).items||[]).filter(function(it){ return !it.isPersonal; });
  if(items.length===0){ window.openModal('Checklist Tim','<div class="empty-state">'+window.ico('book',40)+'<p>Belum ada checklist.</p></div>'); return; }
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div>Checklist tim</div></div>';
  var byRole = {};
  items.forEach(function(it){ var r=it.assignedRole||'umum'; if(!byRole[r]) byRole[r]=[]; byRole[r].push(it); });
  Object.keys(byRole).sort().forEach(function(role){
    var arr = byRole[role];
    var lbl = (window.ROLES[role]&&window.ROLES[role].label)||(role==='umum'?'Umum':role);
    var dR = arr.filter(function(x){ return x.done; }).length;
    h += '<div style="background:var(--surface);padding:10px 12px;border-radius:8px;margin-bottom:10px;">'+
      '<div style="font-weight:700;font-size:12.5px;margin-bottom:8px;display:flex;justify-content:space-between;">'+
      '<span>'+window.U.esc(lbl)+'</span><span class="badge badge-'+(dR===arr.length?'success':dR>0?'warning':'gray')+'">'+dR+'/'+arr.length+'</span></div>';
    arr.forEach(function(it){
      h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed var(--border);">'+
        '<input type="checkbox" disabled '+(it.done?'checked':'')+'>'+
        '<div style="flex:1;font-size:12.5px;'+(it.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+window.U.esc(it.name)+'</div></div>';
    });
    h += '</div>';
  });
  window.openModal('Checklist Tim',h);
};

/* ========== PENILAIAN ========== */
var EVAL_KEY = 'sppt_eval_cache';
function getEvalCache(){ return window.U.safeJson(window.U.getLS(EVAL_KEY),{}); }
function setEvalCache(o){ window.U.setLS(EVAL_KEY,JSON.stringify(o)); }
window.saveGradeValue = function(cid,tid,sid,rid,val){
  var n = parseFloat(val); if(isNaN(n)) return;
  var cache = getEvalCache();
  cache[cid]=cache[cid]||{}; cache[cid][tid]=cache[cid][tid]||{guru:{}};
  cache[cid][tid].guru = cache[cid][tid].guru||{}; cache[cid][tid].guru[sid] = cache[cid][tid].guru[sid]||{};
  cache[cid][tid].guru[sid][rid] = n;
  setEvalCache(cache);
  if(window.fbReady){
    var doc = window.fb.collection('evaluations').doc(cid+'__'+tid);
    doc.get().then(function(snap){
      var d = snap.exists?snap.data():{classId:cid,targetId:tid};
      d.guru = d.guru||{}; d.guru[sid] = d.guru[sid]||{}; d.guru[sid][rid] = n;
      return doc.set(window.U.safeFS(d),{merge:true});
    }).catch(function(){});
  }
};
window.saveSiswaGrade = function(cid,tid,sid){
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; }); if(!c) return;
  var t = c.students.find(function(x){ return x.id===tid; }); if(!t) return;
  var me = window.mySid(); if(!me) return;
  var rubric = window.getRubricFor(t.role);
  var scores = {}, missing = [];
  rubric.forEach(function(r){
    var sel = document.querySelector('input[name="ssc_'+r.id+'"]:checked');
    if(!sel){ missing.push(r.name); return; }
    scores[r.id] = parseFloat(sel.value);
  });
  if(missing.length){ window.toast('Lengkapi: '+missing.join(', '),'warning'); return; }
  var cache = getEvalCache();
  cache[cid]=cache[cid]||{}; cache[cid][tid]=cache[cid][tid]||{};
  cache[cid][tid][me] = cache[cid][tid][me]||{}; cache[cid][tid][me][sid] = scores;
  setEvalCache(cache);
  if(window.fbReady){
    var doc = window.fb.collection('evaluations').doc(cid+'__'+tid);
    doc.get().then(function(snap){
      var d = snap.exists?snap.data():{classId:cid,targetId:tid};
      d[me] = d[me]||{}; d[me][sid] = scores;
      return doc.set(window.U.safeFS(d),{merge:true});
    }).catch(function(){});
  }
  window.toast('Penilaian tersimpan!','success'); window.closeModal();
};
window.RUBRICS = {
  pimpinan_produksi:[{id:'pp1',name:'Perencanaan & Pengelolaan',weight:25},{id:'pp2',name:'Seleksi & Pengaturan Tim',weight:20},{id:'pp3',name:'Manajemen Anggaran',weight:20},{id:'pp4',name:'Koordinasi Lintas Divisi',weight:20},{id:'pp5',name:'Evaluasi & Pelaporan',weight:15}],
  sutradara:[{id:'sr1',name:'Pengembangan Konsep',weight:25},{id:'sr2',name:'Casting Pemain',weight:20},{id:'sr3',name:'Pengarahan Pemain',weight:25},{id:'sr4',name:'Koordinasi Artistik',weight:15},{id:'sr5',name:'Rekayasa Emosi',weight:15}],
  sekretaris:[{id:'sk1',name:'Dokumentasi & Arsip',weight:30},{id:'sk2',name:'Penjadwalan',weight:25},{id:'sk3',name:'Korespondensi',weight:25},{id:'sk4',name:'Penyusunan Laporan',weight:20}],
  bendahara:[{id:'bd1',name:'Pencatatan Transaksi',weight:30},{id:'bd2',name:'Pengelolaan Keuangan',weight:30},{id:'bd3',name:'Perencanaan RAB',weight:20},{id:'bd4',name:'Pelaporan Keuangan',weight:20}],
  asisten_sutradara:[{id:'as1',name:'Koordinasi & Logistik',weight:30},{id:'as2',name:'Pencatatan',weight:25},{id:'as3',name:'Bantu Koordinasi Teknis',weight:25},{id:'as4',name:'Backup Sutradara',weight:20}],
  pemain:[{id:'pm1',name:'Penguasaan Naskah',weight:30},{id:'pm2',name:'Ekspresi & Emosi',weight:25},{id:'pm3',name:'Blocking & Posisi',weight:20},{id:'pm4',name:'Kerja Sama Pemain',weight:15},{id:'pm5',name:'Konsistensi Latihan',weight:10}],
  koor_produksi:[{id:'kp1',name:'Penyediaan Kebutuhan',weight:30},{id:'kp2',name:'Pengelolaan Anggota',weight:25},{id:'kp3',name:'Koordinasi Teknis',weight:25},{id:'kp4',name:'Pelaporan Kinerja',weight:20}],
  koor_artistik:[{id:'ka1',name:'Desain & Konsep',weight:25},{id:'ka2',name:'Eksekusi Teknis',weight:35},{id:'ka3',name:'Koordinasi Tim',weight:25},{id:'ka4',name:'Pengelolaan Anggota',weight:15}],
  anggota:[{id:'ag1',name:'Penyelesaian Tugas',weight:30},{id:'ag2',name:'Kualitas Kerja',weight:25},{id:'ag3',name:'Kerja Sama Tim',weight:25},{id:'ag4',name:'Kedisiplinan',weight:20}]
};
window.getRubricFor = function(role){
  role = String(role||'').toLowerCase();
  if(role==='pimpinan_produksi') return window.RUBRICS.pimpinan_produksi;
  if(role==='sutradara') return window.RUBRICS.sutradara;
  if(role==='sekretaris') return window.RUBRICS.sekretaris;
  if(role==='bendahara') return window.RUBRICS.bendahara;
  if(role==='asisten_sutradara') return window.RUBRICS.asisten_sutradara;
  if(role==='pemain') return window.RUBRICS.pemain;
  if(['koor_publikasi','koor_perlengkapan','koor_akomodasi'].indexOf(role)>=0) return window.RUBRICS.koor_produksi;
  if(['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'].indexOf(role)>=0) return window.RUBRICS.koor_artistik;
  return window.RUBRICS.anggota;
};
window.openRubrikPenilaian = function(){
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div>Rubrik penilaian per peran.</div></div>';
  Object.keys(window.RUBRICS).forEach(function(key){
    var roles = [];
    if(key==='pimpinan_produksi') roles=['pimpinan_produksi'];
    else if(key==='sutradara') roles=['sutradara'];
    else if(key==='sekretaris') roles=['sekretaris'];
    else if(key==='bendahara') roles=['bendahara'];
    else if(key==='asisten_sutradara') roles=['asisten_sutradara'];
    else if(key==='pemain') roles=['pemain'];
    else if(key==='koor_produksi') roles=['koor_publikasi','koor_perlengkapan','koor_akomodasi'];
    else if(key==='koor_artistik') roles=['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'];
    else roles = ['anggota_publikasi','anggota_perlengkapan','anggota_akomodasi','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'];
    var lbl = roles.map(function(r){ return (window.ROLES[r]&&window.ROLES[r].label)||r; }).join(' / ');
    h += '<details style="margin-bottom:10px;background:var(--surface);border-radius:10px;padding:12px;border-left:3px solid var(--primary);">'+
      '<summary style="font-weight:700;font-size:12.5px;cursor:pointer;">'+window.ico('user',13)+' '+window.U.esc(lbl)+'</summary>'+
      '<div style="margin-top:10px;">';
    window.RUBRICS[key].forEach(function(r){
      h += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border);font-size:12.5px;">'+
        '<span>'+window.U.esc(r.name)+'</span><span class="badge badge-primary">'+r.weight+'%</span></div>';
    });
    h += '</div></details>';
  });
  window.openModal('Rubrik Penilaian',h);
};

/* ========== ABSENSI ========== */
window.openCreateMeetingModalFull = function(type){
  type = type||'latihan';
  var role = window.myRole();
  if(window.myType()==='siswa'){
    if(type==='rapat' && ['sekretaris','pimpinan_produksi'].indexOf(role)<0){ window.toast('Hanya Sekretaris/Pimpro','error'); return; }
    if(type==='latihan' && role!=='sutradara'){ window.toast('Hanya Sutradara','error'); return; }
  }
  var list = window.myType()==='admin'?(window.DB.classes||[]):window.myClasses();
  if(list.length===0){ window.toast('Belum ada kelas','warning'); return; }
  var opts = list.map(function(c){ return '<option value="'+c.id+'">'+window.U.esc(c.name)+'</option>'; }).join('');
  var titleMap = { rapat:'Buat Absen Rapat', latihan:'Buat Absen Latihan', gladi:'Buat Absen Gladi' };
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div><b>'+(titleMap[type]||'Buat Sesi')+'</b></div></div>'+
    '<div class="form-group"><label>Judul</label><input id="mt-title"></div>'+
    '<div class="form-group"><label>Kelas</label><select id="mt-class" onchange="window.__refreshWajibList()">'+opts+'</select></div>'+
    '<div class="form-group"><label>Tanggal</label><input type="date" id="mt-date" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
    '<div class="form-group"><label>Jam Buka</label><input type="time" id="mt-open" value="14:00"></div>'+
    '<div class="form-group"><label>Jam Tutup</label><input type="time" id="mt-close" value="15:00"></div></div>';
  if(type==='latihan'){
    h += '<div class="form-group"><label>Pemain Wajib Hadir</label>'+
      '<div style="display:flex;gap:6px;margin-bottom:6px;">'+
      '<button type="button" class="btn btn-sm" onclick="window.__selectAllWajib(true)">Semua</button>'+
      '<button type="button" class="btn btn-sm" onclick="window.__selectAllWajib(false)">Kosongkan</button></div>'+
      '<div id="mt-wajib-list" style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;"></div></div>';
  }
  h += '<button class="btn btn-primary btn-block btn-lg" data-action="doCreateMeeting" data-arg="'+type+'">'+window.ico('save')+' Buat Sesi</button>';
  window.openModal(titleMap[type]||'Buat Sesi',h);
  if(type==='latihan') setTimeout(window.__refreshWajibList,100);
};
window.__refreshWajibList = function(){
  var cid = document.getElementById('mt-class').value;
  var el = document.getElementById('mt-wajib-list'); if(!el) return;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c){ el.innerHTML = ''; return; }
  var cands = (c.students||[]).filter(function(s){
    var r = s.role||'';
    return r==='pemain'||r==='sutradara'||r==='asisten_sutradara'||r.indexOf('koor_')===0||r.indexOf('anggota_')===0;
  });
  if(cands.length===0){ el.innerHTML = '<div style="padding:10px;text-align:center;color:var(--text-muted);font-size:12px;">Belum ada calon</div>'; return; }
  var h = '';
  cands.forEach(function(s){
    var rl = (window.ROLES[s.role]&&window.ROLES[s.role].label)||s.role;
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px dashed var(--border);cursor:pointer;font-size:12.5px;">'+
      '<input type="checkbox" class="mt-wajib-cb" value="'+window.U.esc(s.id)+'" '+(s.role==='pemain'?'checked':'')+'>'+
      '<span style="flex:1;font-weight:600;">'+window.U.esc(s.name)+'</span>'+
      '<span style="font-size:11px;color:var(--text-muted);">'+window.U.esc(rl)+'</span></label>';
  });
  el.innerHTML = h;
};
window.__selectAllWajib = function(c){ document.querySelectorAll('.mt-wajib-cb').forEach(function(cb){ cb.checked = c; }); };
window.doCreateMeeting = function(type){
  var title = window.U.trim(document.getElementById('mt-title').value);
  var cid = document.getElementById('mt-class').value;
  var date = document.getElementById('mt-date').value;
  var openT = document.getElementById('mt-open').value||'14:00';
  var closeT = document.getElementById('mt-close').value||'15:00';
  if(!title||!cid||!date){ window.toast('Lengkapi','warning'); return; }
  var wajib = [];
  if(type==='latihan') document.querySelectorAll('.mt-wajib-cb:checked').forEach(function(cb){ wajib.push(cb.value); });
  var id = window.U.uid();
  var m = { id:id, title:window.U.sanitize(title), classId:cid, type:type, date:date,
    openTime:openT, closeTime:closeT, wajibIds:wajib, records:{}, createdAt:Date.now(), createdBy:window.myName() };
  window.fsSet('meetings',id,m).then(function(){
    window.logAct('meeting_create',window.myName()+' buat '+type+': '+title,{classId:cid});
    var notif = { id:window.U.uid(), classId:cid, fromName:window.myName(), fromType:window.myType(),
      toId:'all', type:'tugas', title:'[ABSENSI] '+title,
      message:'Jenis: '+type+'\nTanggal: '+date+'\nJam: '+openT+' - '+closeT,
      createdAt:Date.now(), readBy:[], doneBy:[] };
    window.fsSet('notifications',notif.id,notif);
    window.closeModal(); window.toast('Sesi dibuat!','success');
  }).catch(function(e){ window.toast('Gagal: '+e.message,'error'); });
};
window.openAbsensiHariIni = function(){
  if(window.myType()!=='siswa'){ window.toast('Hanya untuk siswa','error'); return; }
  var cid = window.myCid(), sid = window.mySid();
  var today = new Date().toISOString().split('T')[0];
  var meetings = Object.values(window.DB.meetings||{}).filter(function(m){ return m.classId===cid && m.date===today; });
  var h = '<div class="alert alert-info">'+window.ico('calendar')+'<div><b>Absensi Hari Ini</b><br>'+today+'</div></div>';
  if(meetings.length===0){
    h += '<div class="empty-state">'+window.ico('calendar',40)+'<p>Tidak ada sesi hari ini.</p></div>';
  } else {
    meetings.forEach(function(m){
      var filled = m.records && m.records[sid];
      var wajibIds = m.wajibIds||[];
      var isWajib = wajibIds.length===0 || wajibIds.indexOf(sid)>=0;
      h += '<div style="display:flex;gap:10px;align-items:center;padding:12px;background:'+
        (filled?'var(--success-soft)':isWajib?'var(--warning-soft)':'var(--surface)')+';border-radius:10px;margin-bottom:8px;">'+
        '<div style="flex:1;"><div style="font-weight:700;font-size:13px;">'+window.U.esc(m.title)+'</div>'+
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">'+window.U.esc(m.type||'')+' · '+
        window.U.esc(m.openTime||'')+' - '+window.U.esc(m.closeTime||'')+(isWajib?' · <b>Wajib</b>':'')+'</div></div>'+
        (filled?'<span class="badge badge-success">'+window.U.esc(filled)+'</span>':
          '<button class="btn btn-primary btn-sm" data-action="openSelfAttendance" data-arg="'+m.id+'" data-close-first>Isi</button>')+
      '</div>';
    });
  }
  window.openModal('Absensi Hari Ini',h);
};
window.openSelfAttendance = function(meetingId){
  var m = window.DB.meetings[meetingId]; if(!m) return;
  var cur = (m.records&&m.records[window.mySid()])||'';
  var opts = [{v:'hadir',l:'Hadir',c:'success'},{v:'izin',l:'Izin',c:'info'},{v:'sakit',l:'Sakit',c:'warning'},{v:'telat',l:'Telat',c:'warning'},{v:'alpa',l:'Tidak Hadir',c:'danger'}];
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div><b>'+window.U.esc(m.title)+'</b></div></div>'+
    '<div class="form-group"><label>Status</label><div style="display:flex;flex-direction:column;gap:8px;">';
  opts.forEach(function(o){
    h += '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid '+
      (cur===o.v?'var(--'+o.c+')':'var(--border)')+';border-radius:8px;cursor:pointer;'+
      (cur===o.v?'background:var(--'+o.c+'-soft);':'')+'">'+
      '<input type="radio" name="self-att" value="'+o.v+'" '+(cur===o.v?'checked':'')+'><b>'+o.l+'</b></label>';
  });
  h += '</div></div><button class="btn btn-primary btn-block btn-lg" data-action="saveSelfAttendance" data-arg="'+meetingId+'">'+window.ico('save')+' Simpan</button>';
  window.openModal('Isi Absensi',h);
};
window.saveSelfAttendance = function(meetingId){
  var sel = document.querySelector('input[name="self-att"]:checked');
  if(!sel){ window.toast('Pilih status','warning'); return; }
  var m = window.DB.meetings[meetingId]; if(!m) return;
  if(!m.records) m.records = {};
  m.records[window.mySid()] = sel.value;
  window.fb.collection('meetings').doc(meetingId).update({records:m.records}).then(function(){
    window.closeModal(); window.toast('Absensi tersimpan','success');
  });
};

/* ========== NASKAH ========== */
var NK_KEY = 'sppt_naskah';
function getNaskah(cid){ return window.U.safeJson(window.U.getLS(NK_KEY+'_'+cid),[]); }
function setNaskah(cid,arr){ window.U.setLS(NK_KEY+'_'+cid,JSON.stringify(arr)); window.fsSet('naskah_teater',cid,{items:arr}); }
window.openArsipNaskah = function(){
  var cid = window.myCid(); if(!cid) return;
  var canEdit = window.myType()==='guru' || window.myRole()==='sutradara';
  var data = getNaskah(cid);
  var h = '<div class="alert alert-info">'+window.ico('book')+'<div><b>Arsip Naskah Teater</b></div></div>';
  if(canEdit) h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" data-action="openAddNaskah" data-close-first>'+window.ico('upload','sm')+' Tambah Naskah</button>';
  if(data.length===0){
    h += '<div class="empty-state">'+window.ico('book',40)+'<p>Belum ada naskah.</p></div>';
  } else {
    data.slice().reverse().forEach(function(n){
      h += '<div class="card card-accent-blue" style="margin-bottom:10px;">'+
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">'+
        '<div style="font-weight:700;font-size:14px;">'+window.ico('book',15)+' '+window.U.esc(n.title)+'</div>'+
        '<span class="badge badge-gray">'+(n.type==='file'?'File':'Link')+'</span></div>'+
        (n.desc?'<div style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">'+window.U.esc(n.desc)+'</div>':'')+
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">Oleh: <b>'+window.U.esc(n.uploadedBy||'-')+'</b> · '+window.U.fmtDate(n.uploadedAt)+'</div>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
      if(n.type==='link') h += '<a href="'+window.U.esc(n.url)+'" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="text-decoration:none;">'+window.ico('upload','sm')+' Buka</a>';
      else h += '<button class="btn btn-sm btn-primary" data-action="downloadNaskah" data-arg="'+cid+'|'+n.id+'">'+window.ico('download','sm')+' Download</button>';
      if(canEdit) h += '<button class="btn btn-sm btn-danger" data-action="delNaskah" data-arg="'+cid+'|'+n.id+'">'+window.ico('trash','sm')+'</button>';
      h += '</div></div>';
    });
  }
  window.openModal('Arsip Naskah',h);
};
window.openAddNaskah = function(){
  if(window.myType()!=='guru' && window.myRole()!=='sutradara'){ window.toast('Hanya Sutradara/Guru','error'); return; }
  window.openModal('Tambah Naskah',
    '<div class="form-group"><label>Judul</label><input id="nk-title" maxlength="120"></div>'+
    '<div class="form-group"><label>Deskripsi</label><textarea id="nk-desc" rows="2"></textarea></div>'+
    '<div class="form-group"><label>Tipe</label><select id="nk-type" onchange="window.__toggleNaskahInput()">'+
    '<option value="link">Link URL</option><option value="file">File (maks 500 KB)</option></select></div>'+
    '<div id="nk-input-link" class="form-group"><label>URL</label><input type="url" id="nk-url"></div>'+
    '<div id="nk-input-file" class="form-group" style="display:none;"><label>File</label>'+
    '<input type="file" id="nk-file" accept=".pdf,.docx,.doc,.txt" style="padding:8px;width:100%;"></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveNaskah">'+window.ico('save')+' Simpan</button>');
  setTimeout(window.__toggleNaskahInput,100);
};
window.__toggleNaskahInput = function(){
  var t = document.getElementById('nk-type').value;
  document.getElementById('nk-input-link').style.display = t==='link'?'block':'none';
  document.getElementById('nk-input-file').style.display = t==='file'?'block':'none';
};
window.saveNaskah = function(){
  var title = window.U.trim(document.getElementById('nk-title').value);
  var desc = window.U.trim(document.getElementById('nk-desc').value);
  var tipe = document.getElementById('nk-type').value;
  var cid = window.myCid();
  if(!title){ window.toast('Judul wajib','warning'); return; }
  if(window.U.hasProfanity(title)){ window.toast('Kata tidak sopan','error'); return; }
  var items = getNaskah(cid);
  if(tipe==='link'){
    var url = window.U.trim(document.getElementById('nk-url').value);
    if(!url||!window.U.isUrl(url)){ window.toast('URL tidak valid','error'); return; }
    items.push({id:window.U.uid(),title:window.U.sanitize(title),desc:window.U.sanitize(desc),type:'link',url:url,uploadedBy:window.myName(),uploadedAt:Date.now()});
    setNaskah(cid,items); window.closeModal(); window.toast('Naskah ditambahkan','success'); window.openArsipNaskah();
  } else {
    var f = document.getElementById('nk-file').files[0];
    if(!f){ window.toast('Pilih file','warning'); return; }
    if(f.size>500*1024){ window.toast('File terlalu besar','error'); return; }
    var reader = new FileReader();
    reader.onload = function(e){
      items.push({id:window.U.uid(),title:window.U.sanitize(title),desc:window.U.sanitize(desc),
        type:'file',fileName:f.name,dataUrl:e.target.result,uploadedBy:window.myName(),uploadedAt:Date.now()});
      setNaskah(cid,items); window.closeModal(); window.toast('Naskah diunggah','success'); window.openArsipNaskah();
    };
    reader.readAsDataURL(f);
  }
};
window.downloadNaskah = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  var item = getNaskah(cid).find(function(x){ return x.id===id; });
  if(!item||!item.dataUrl) return;
  var a = document.createElement('a'); a.href = item.dataUrl; a.download = item.fileName||'naskah';
  document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); },500);
};
window.delNaskah = function(arg){
  var p = String(arg).split('|'), cid = p[0], id = p[1];
  if(!confirm('Hapus naskah ini?')) return;
  var items = getNaskah(cid).filter(function(x){ return x.id!==id; });
  setNaskah(cid,items); window.openArsipNaskah();
};

/* ========== WA-NOTIF ========== */
window.openBeriTugas = function(){
  var cid = window.myCid(); if(!cid) return;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return;
  var students = (c.students||[]).filter(function(s){ return s.id!==window.mySid(); });
  if(students.length===0){ window.toast('Tidak ada siswa lain','warning'); return; }
  var h = '<div class="alert alert-info">'+window.ico('send')+'<div><b>Beri Tugas + WA</b></div></div>'+
    '<div class="form-group"><label>Judul</label><input id="bt-title" maxlength="120"></div>'+
    '<div class="form-group"><label>Detail</label><textarea id="bt-desc" rows="3"></textarea></div>'+
    '<div class="form-group"><label>Deadline</label><input type="date" id="bt-deadline"></div>'+
    '<div class="form-group"><label>Penerima</label>'+
    '<div style="margin-bottom:6px;display:flex;gap:6px;">'+
    '<button type="button" class="btn btn-sm" onclick="window.__btSelectAll(true)">Semua</button>'+
    '<button type="button" class="btn btn-sm" onclick="window.__btSelectAll(false)">Kosong</button></div>'+
    '<div style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px;">';
  students.forEach(function(s){
    var rl = (window.ROLES[s.role]&&window.ROLES[s.role].label)||s.role;
    var hw = !!(s.phone && window.U.normPhone(s.phone));
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px dashed var(--border);cursor:pointer;font-size:12.5px;">'+
      '<input type="checkbox" class="bt-cb" value="'+window.U.esc(s.id)+'" data-name="'+window.U.esc(s.name)+'" data-phone="'+window.U.esc(s.phone||'')+'" data-role="'+window.U.esc(s.role)+'" checked>'+
      '<span style="flex:1;font-weight:600;">'+window.U.esc(s.name)+'</span>'+
      '<span style="font-size:11px;color:var(--text-muted);">'+window.U.esc(rl)+'</span>'+
      (hw?'<span class="badge badge-success" style="font-size:10px;">WA</span>':'<span class="badge badge-danger" style="font-size:10px;">-</span>')+'</label>';
  });
  h += '</div></div><button class="btn btn-primary btn-block btn-lg" data-action="doBeriTugas">'+window.ico('send')+' Kirim</button>';
  window.openModal('Beri Tugas + WA',h);
};
window.__btSelectAll = function(c){ document.querySelectorAll('.bt-cb').forEach(function(cb){ cb.checked = c; }); };
window.doBeriTugas = function(){
  var title = window.U.trim(document.getElementById('bt-title').value);
  var desc = window.U.trim(document.getElementById('bt-desc').value);
  var deadline = document.getElementById('bt-deadline').value;
  if(!title){ window.toast('Judul wajib','warning'); return; }
  if(window.U.hasProfanity(title)||window.U.hasProfanity(desc)){ window.toast('Kata tidak sopan','error'); return; }
  var targets = [];
  document.querySelectorAll('.bt-cb:checked').forEach(function(cb){
    targets.push({id:cb.value,name:cb.getAttribute('data-name'),phone:cb.getAttribute('data-phone'),role:cb.getAttribute('data-role')});
  });
  if(targets.length===0){ window.toast('Pilih minimal 1','warning'); return; }
  var cid = window.myCid();
  var msg = desc||'-'; if(deadline) msg += '\n\nDeadline: '+deadline;
  targets.forEach(function(t){
    var notif = { id:window.U.uid(), classId:cid, fromName:window.myName(), fromType:window.myType(),
      toId:t.id, type:'tugas', title:'[TUGAS] '+window.U.sanitize(title), message:msg,
      createdAt:Date.now(), readBy:[], doneBy:[] };
    window.fsSet('notifications',notif.id,notif);
  });
  var withWa = targets.filter(function(t){ return window.U.normPhone(t.phone); });
  if(withWa.length===0){ window.closeModal(); window.toast('Tugas terkirim','success'); return; }
  window.__showWAPanel(withWa,title,msg);
};
window.__showWAPanel = function(targets,title,message){
  window.__waTargets = targets; window.__waTitle = title; window.__waMessage = message;
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div><b>Kirim via WhatsApp</b></div></div>'+
    '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">'+
    '<button class="btn btn-sm btn-primary" onclick="window.__openAllWA()">'+window.ico('send','sm')+' Semua Berurutan</button>'+
    '<button class="btn btn-sm" onclick="window.__copyWAMessages()">'+window.ico('copy','sm')+' Copy Semua</button>'+
    '<span class="badge badge-warning" style="align-self:center;">'+targets.length+' penerima</span></div>'+
    '<div style="max-height:400px;overflow-y:auto;">';
  targets.forEach(function(t,i){
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:6px;gap:8px;flex-wrap:wrap;">'+
      '<div style="flex:1;min-width:150px;"><div style="font-weight:700;font-size:13px;">'+window.U.esc(t.name)+'</div>'+
      '<div style="font-size:11.5px;color:var(--success);">'+window.ico('phone','sm')+' '+window.U.esc(t.phone)+'</div></div>'+
      '<button class="btn btn-sm btn-success" onclick="window.__openWA('+i+')">'+window.ico('send','sm')+' Buka WA</button></div>';
  });
  h += '</div><button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="window.closeModal()">Selesai</button>';
  window.openModal('Kirim via WhatsApp',h);
};
window.__openWA = function(i){
  var t = window.__waTargets[i]; if(!t) return;
  var phone = window.U.waPhone(t.phone); if(!phone) return;
  var rl = (window.ROLES[t.role]&&window.ROLES[t.role].label)||t.role;
  var body = '*SP-PPT — SMP Negeri 10 Samarinda*\n_'+window.__waTitle+'_\n\nYth. *'+t.name+'*\n('+rl+')\n\n'+window.__waMessage+'\n\n—\nDari: '+window.myName()+'\nWaktu: '+new Date().toLocaleString('id-ID');
  window.open(window.U.waLink(phone,body),'_blank');
};
window.__openAllWA = function(){
  var t = window.__waTargets||[]; if(t.length===0) return;
  if(!confirm('Buka '+t.length+' tab WhatsApp?')) return;
  var i = 0;
  function next(){ if(i>=t.length){ window.toast('Selesai','success'); return; } window.__openWA(i); i++; setTimeout(next,1200); }
  next();
};
window.__copyWAMessages = function(){
  var t = window.__waTargets||[];
  var txt = '=== PENERIMA & PESAN ===\n\n';
  t.forEach(function(x,i){ txt += (i+1)+'. '+x.name+'\n   WA: '+x.phone+'\n\n   *'+window.__waTitle+'*\n\n   Yth. '+x.name+',\n\n   '+window.__waMessage+'\n\n   — '+window.myName()+'\n\n---\n\n'; });
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ window.toast('Disalin','success'); });
  else prompt('Copy:',txt);
};

/* ========== BOOKING ========== */
var BK_KEY = 'sppt_booking_alat';
var BK_ROLES = ['pimpinan_produksi','koor_musik','sutradara','koor_perlengkapan'];
function getBookings(){ return window.U.safeJson(window.U.getLS(BK_KEY),[]); }
function setBookings(arr){ window.U.setLS(BK_KEY,JSON.stringify(arr)); window.fsSet('booking_alat','global',{items:arr}); }
window.openBookingAlatMusik = function(){
  if(window.myType()!=='guru' && window.myType()!=='admin' && BK_ROLES.indexOf(window.myRole())<0){
    window.toast('Akses terbatas','error'); return;
  }
  var bk = getBookings().sort(function(a,b){ return (a.date+a.startTime).localeCompare(b.date+b.startTime); });
  var h = '<div class="alert alert-info">'+window.ico('music')+'<div><b>Booking Alat Musik</b></div></div>'+
    '<button class="btn btn-primary btn-sm" style="margin-bottom:14px;" data-action="openAddBooking" data-close-first>'+window.ico('plus','sm')+' Booking Baru</button>';
  var myCid = window.myCid();
  var mine = bk.filter(function(b){ return b.classId===myCid; });
  var other = bk.filter(function(b){ return b.classId!==myCid; });
  if(bk.length===0){ h += '<div class="empty-state">'+window.ico('calendar',40)+'<p>Belum ada booking.</p></div>'; }
  else {
    function render(b,isM){
      var c = (window.DB.classes||[]).find(function(x){ return x.id===b.classId; });
      return '<div class="card" style="border-left:4px solid '+(isM?'var(--primary)':'var(--warning)')+';margin-bottom:10px;">'+
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">'+
        '<div style="font-weight:700;font-size:13.5px;">'+window.U.esc(b.alat)+'</div>'+
        '<span class="badge badge-'+(isM?'primary':'warning')+'">'+window.U.esc(c?c.name:'Kelas')+'</span></div>'+
        '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">'+window.ico('calendar',12)+' '+window.U.esc(b.date)+' · '+window.ico('clock',12)+' '+window.U.esc(b.startTime)+' - '+window.U.esc(b.endTime)+'</div>'+
        (b.notes?'<div style="font-size:12px;margin-bottom:8px;">'+window.U.esc(b.notes)+'</div>':'')+
        (isM||window.myType()==='guru'?'<button class="btn btn-sm btn-danger" data-action="delBooking" data-arg="'+b.id+'">'+window.ico('trash','sm')+'</button>':'')+'</div>';
    }
    if(mine.length>0){ h += '<h4 style="font-size:13.5px;font-weight:700;margin-bottom:10px;">Kelas Anda</h4>'; mine.forEach(function(b){ h += render(b,true); }); }
    if(other.length>0){ h += '<h4 style="font-size:13.5px;font-weight:700;margin:16px 0 10px;">Kelas Lain</h4>'; other.forEach(function(b){ h += render(b,false); }); }
  }
  window.openModal('Booking Alat Musik',h);
};
window.openAddBooking = function(){
  var opts = (window.DB.classes||[]).map(function(c){
    return '<option value="'+c.id+'"'+(c.id===window.myCid()?' selected':'')+'>'+window.U.esc(c.name)+'</option>';
  }).join('');
  window.openModal('Booking Alat Musik',
    '<div class="form-group"><label>Nama Alat</label><input id="bk-alat"></div>'+
    '<div class="form-group"><label>Kelas</label><select id="bk-class">'+opts+'</select></div>'+
    '<div class="form-group"><label>Tanggal</label><input type="date" id="bk-date" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
    '<div class="form-group"><label>Mulai</label><input type="time" id="bk-start" value="15:00"></div>'+
    '<div class="form-group"><label>Selesai</label><input type="time" id="bk-end" value="16:00"></div></div>'+
    '<div class="form-group"><label>Catatan</label><textarea id="bk-notes" rows="2"></textarea></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveBooking">'+window.ico('save')+' Booking</button>');
};
window.saveBooking = function(){
  var alat = window.U.trim(document.getElementById('bk-alat').value);
  var cid = document.getElementById('bk-class').value;
  var date = document.getElementById('bk-date').value;
  var start = document.getElementById('bk-start').value;
  var end = document.getElementById('bk-end').value;
  var notes = window.U.trim(document.getElementById('bk-notes').value);
  if(!alat||!cid||!date||!start||!end){ window.toast('Lengkapi','warning'); return; }
  if(start>=end){ window.toast('Jam tidak valid','error'); return; }
  var bk = getBookings();
  var conflict = bk.find(function(b){
    return b.date===date && b.alat.toLowerCase()===alat.toLowerCase() && !(end<=b.startTime||start>=b.endTime);
  });
  if(conflict){ window.toast('BENTROK! '+alat+' sudah dibooking','error'); return; }
  bk.push({id:window.U.uid(),alat:window.U.sanitize(alat),classId:cid,date:date,startTime:start,endTime:end,notes:window.U.sanitize(notes),createdBy:window.myName(),createdAt:Date.now()});
  setBookings(bk); window.closeModal(); window.toast('Booking berhasil','success'); window.openBookingAlatMusik();
};
window.delBooking = function(id){
  if(!confirm('Hapus booking ini?')) return;
  setBookings(getBookings().filter(function(b){ return b.id!==id; }));
  window.openBookingAlatMusik();
};

/* ========== KOORDINASI ========== */
var KD_KEY = 'sppt_koordinasi_v2';
var KD_ROLES = ['pimpinan_produksi','sekretaris','sutradara','asisten_sutradara','koor_musik','koor_perlengkapan'];
function getMsgs(){ return window.U.safeJson(window.U.getLS(KD_KEY),[]); }
function setMsgs(arr){ window.U.setLS(KD_KEY,JSON.stringify(arr)); window.fsSet('koordinasi_antar_kelas','global',{items:arr}); }
window.openKoordinasiAntarKelas = function(){
  if(window.myType()!=='guru' && KD_ROLES.indexOf(window.myRole())<0){ window.toast('Akses terbatas','error'); return; }
  var cid = window.myCid();
  var others = (window.DB.classes||[]).filter(function(c){ return c.id!==cid; });
  var all = getMsgs().sort(function(a,b){ return b.createdAt-a.createdAt; });
  var h = '<div class="alert alert-info">'+window.ico('messageCircle')+'<div><b>Koordinasi Antar Kelas</b></div></div>'+
    '<div class="form-group"><label>Filter</label><select id="koord-filter" onchange="window.__renderKoordList()">'+
    '<option value="all">Semua</option><option value="inbox">Untuk Kelas Saya</option><option value="sent">Dari Kelas Saya</option></select></div>'+
    '<div id="koord-list" style="max-height:300px;overflow-y:auto;margin-bottom:14px;padding:8px;background:var(--surface);border-radius:10px;"></div>'+
    '<div style="border-top:1px solid var(--border);padding-top:14px;">'+
    '<h4 style="font-size:13.5px;font-weight:700;margin-bottom:10px;">Kirim Pesan Baru</h4>'+
    '<div class="form-group"><label>Ke Kelas</label><select id="koord-target">'+
    '<option value="">📢 Semua Kelas</option>'+others.map(function(c){ return '<option value="'+c.id+'">'+window.U.esc(c.name)+'</option>'; }).join('')+'</select></div>'+
    '<div class="form-group"><label>Untuk Peran</label><select id="koord-role"><option value="">Semua Peran</option>'+
    Object.keys(window.ROLES).map(function(r){ return '<option value="'+r+'">'+window.U.esc(window.ROLES[r].label)+'</option>'; }).join('')+'</select></div>'+
    '<div class="form-group"><label>Pesan</label><textarea id="koord-msg" rows="3" maxlength="500"></textarea></div>'+
    '<button class="btn btn-primary btn-block" data-action="sendKoord">'+window.ico('send')+' Kirim</button></div>';
  window.openModal('Koordinasi Antar Kelas',h);
  setTimeout(function(){ window.__koordAll = all; window.__koordMyCid = cid; window.__renderKoordList(); },50);
};
window.__renderKoordList = function(){
  var f = document.getElementById('koord-filter').value;
  var cid = window.__koordMyCid, all = window.__koordAll||[];
  var list = all.filter(function(m){
    if(f==='inbox') return !m.toClassId || m.toClassId===cid;
    if(f==='sent') return m.fromClassId===cid;
    return true;
  }).slice(0,30);
  var el = document.getElementById('koord-list'); if(!el) return;
  if(list.length===0){ el.innerHTML = '<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:12.5px;">Belum ada pesan.</div>'; return; }
  var h = '';
  list.forEach(function(m){
    var isM = m.fromClassId===cid;
    var tL = m.toClassName||'Semua Kelas';
    h += '<div style="padding:10px 12px;margin-bottom:8px;background:'+(isM?'var(--primary-soft)':'var(--card)')+';border-radius:8px;border-left:3px solid '+(isM?'var(--primary)':'var(--border-strong)')+';">'+
      '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px;flex-wrap:wrap;">'+
      '<div style="font-size:12px;font-weight:700;">'+window.U.esc(m.fromClassName||'Kelas')+' — '+window.U.esc(m.fromName)+'</div>'+
      '<div style="font-size:11px;color:var(--text-muted);">'+window.U.fmtDate(m.createdAt)+'</div></div>'+
      '<div style="font-size:11px;margin-bottom:6px;">'+window.ico('send',11)+' → <b>'+window.U.esc(tL)+'</b>'+
      (m.toRole?' · <b>'+window.U.esc((window.ROLES[m.toRole]||{}).label||m.toRole)+'</b>':'')+'</div>'+
      '<div style="font-size:12.5px;line-height:1.5;white-space:pre-wrap;">'+window.U.esc(m.message)+'</div></div>';
  });
  el.innerHTML = h;
};
window.sendKoord = function(){
  var msg = window.U.trim(document.getElementById('koord-msg').value);
  if(!msg){ window.toast('Pesan kosong','warning'); return; }
  if(window.U.hasProfanity(msg)){ window.toast('Bahasa sopan','error'); return; }
  var cid = window.myCid();
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  var targetId = document.getElementById('koord-target').value;
  var toRole = document.getElementById('koord-role').value;
  var toClass = targetId?(window.DB.classes||[]).find(function(x){ return x.id===targetId; }):null;
  var msgs = getMsgs();
  msgs.push({id:window.U.uid(),fromClassId:cid,fromClassName:c?c.name:'Kelas',fromName:window.myName(),fromRole:window.myRole(),
    toClassId:toClass?toClass.id:null,toClassName:toClass?toClass.name:'Semua Kelas',toRole:toRole||null,
    message:window.U.sanitize(msg),createdAt:Date.now()});
  if(msgs.length>300) msgs = msgs.slice(-300);
  setMsgs(msgs);
  if(toClass){
    var notif = { id:window.U.uid(), classId:toClass.id, fromName:window.myName()+' ('+(c?c.name:'')+')',
      fromType:'siswa', toId:'all', type:'info', title:'[KOORDINASI] dari '+(c?c.name:'Kelas'),
      message:(toRole?'Untuk '+((window.ROLES[toRole]||{}).label||toRole)+':\n\n':'')+msg,
      createdAt:Date.now(), readBy:[], doneBy:[] };
    window.fsSet('notifications',notif.id,notif);
  }
  document.getElementById('koord-msg').value = '';
  window.__koordAll = msgs; window.__renderKoordList();
  window.toast('Pesan terkirim','success');
};

/* ========== KERABAT ========== */
var ROLE_ORDER = ['pimpinan_produksi','sutradara','asisten_sutradara','sekretaris','bendahara',
  'koor_publikasi','koor_perlengkapan','koor_akomodasi','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya',
  'anggota_publikasi','anggota_perlengkapan','anggota_akomodasi','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya','pemain'];
function orderIdx(role){ var i = ROLE_ORDER.indexOf(String(role||'').toLowerCase()); return i>=0?i:999; }
function getKerabat(cid){
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return {nama:'',logo:'',struktur:[]};
  return {nama:c.kerabatKerja||'', logo:c.kerabatKerjaLogo||'', struktur:Array.isArray(c.kerabatStruktur)?c.kerabatStruktur:[]};
}
function setKerabat(cid,data){
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return Promise.resolve();
  var upd = Object.assign({},c,{kerabatKerja:data.nama||'',kerabatKerjaLogo:data.logo||'',kerabatStruktur:data.struktur||[]});
  delete upd._id;
  return window.fsSet('classes',cid,upd);
}
function canEditKerabat(){ return window.myRole()==='pimpinan_produksi' || window.myType()==='guru' || window.myType()==='admin'; }
window.injectKerabat = function(){
  var old = document.getElementById('kerabat-badge'); if(old) old.remove();
  if(window.myType()!=='siswa') return;
  var cid = window.myCid(); if(!cid) return;
  var k = getKerabat(cid); if(!k.nama) return;
  var ui = document.getElementById('user-info');
  if(ui && !document.getElementById('kerabat-badge')){
    var b = document.createElement('span'); b.id = 'kerabat-badge';
    b.style.cssText = 'background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;padding:3px 10px;border-radius:12px;font-size:11.5px;font-weight:700;display:inline-flex;align-items:center;gap:4px;margin-left:8px;border:1px solid #fbbf24;cursor:pointer;';
    b.onclick = function(){ window.openKerabatStrukturModal(); };
    b.innerHTML = (k.logo?'<img src="'+window.U.esc(k.logo)+'" style="width:16px;height:16px;border-radius:50%;object-fit:cover;">':window.ico('award',14))+' '+window.U.esc(k.nama);
    ui.appendChild(b);
  }
  var fab = document.getElementById('btn-kerabat');
  if(fab){
    fab.classList.remove('hidden'); fab.title = k.nama;
    fab.innerHTML = k.logo?'<img src="'+window.U.esc(k.logo)+'" alt="Kerabat">':window.ico('award',24);
  }
};
window.openKerabatStrukturModal = function(){
  var cid = window.myCid(); if(!cid) return;
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return;
  var k = getKerabat(cid);
  if(!k.nama && !canEditKerabat()){ window.toast('Belum diisi','warning'); return; }
  if(!k.nama && canEditKerabat()){ window.openEditKerabatInfo(); return; }
  var h = '<div style="text-align:center;padding:24px 16px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:14px;margin-bottom:18px;">';
  if(k.logo) h += '<img src="'+window.U.esc(k.logo)+'" style="max-width:120px;max-height:120px;border-radius:14px;border:4px solid #fff;margin-bottom:12px;">';
  else h += '<div style="width:80px;height:80px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;">'+window.ico('award',40)+'</div>';
  h += '<h2 style="font-size:20px;font-weight:800;color:#78350f;">'+window.U.esc(k.nama)+'</h2>'+
    '<p style="font-size:12px;color:#92400e;margin-top:6px;">Kerabat Kerja '+window.U.esc(c.name)+'</p></div>';
  if(k.struktur.length>0){
    h += '<div style="font-size:11.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">Struktur ('+k.struktur.length+')</div>';
    k.struktur.forEach(function(item){
      h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--surface);border-radius:10px;margin-bottom:8px;border-left:4px solid var(--primary);gap:8px;flex-wrap:wrap;">'+
        '<div style="flex:1;min-width:150px;"><div style="font-weight:700;font-size:13px;">'+window.U.esc(item.nama)+'</div>'+
        '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">'+window.U.esc(item.jabatan)+'</div>'+
        (item.kontak?'<div style="font-size:11px;color:var(--primary);margin-top:3px;">'+window.ico('phone',11)+' '+window.U.esc(item.kontak)+'</div>':'')+'</div>'+
        (canEditKerabat()?'<div style="display:flex;gap:4px;">'+
          '<button class="btn btn-sm" data-action="openEditKerabatItem" data-arg="'+item.id+'" data-close-first>'+window.ico('edit','sm')+'</button>'+
          '<button class="btn btn-sm btn-danger" data-action="delKerabatItem" data-arg="'+item.id+'">'+window.ico('trash','sm')+'</button></div>':'')+
      '</div>';
    });
  } else h += '<div class="alert alert-info">'+window.ico('info')+'<div>Struktur belum ditambahkan.</div></div>';
  if(canEditKerabat()){
    h += '<div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">'+
      '<button class="btn btn-primary btn-block" data-action="openAddKerabatItem" data-close-first>'+window.ico('plus')+' Tambah Anggota</button>'+
      '<button class="btn btn-block" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border:none;" data-action="autoFillKerabat" data-close-first>'+window.ico('sparkle')+' Auto-Isi dari Siswa</button>'+
      '<button class="btn btn-block" data-action="openEditKerabatInfo" data-close-first>'+window.ico('edit')+' Ubah Nama & Logo</button></div>';
  }
  window.openModal('Struktur Kerabat Kerja',h);
};
window.openEditKerabatInfo = function(){
  if(!canEditKerabat()){ window.toast('Akses ditolak','error'); return; }
  var cid = window.myCid(), k = getKerabat(cid);
  var h = '<div class="form-group"><label>Nama Kerabat Kerja</label><input id="kb-nama" maxlength="60" value="'+window.U.esc(k.nama)+'"></div>'+
    '<div class="form-group"><label>Logo (maks 300 KB)</label><input type="file" id="kb-logo" accept="image/*" style="padding:8px;width:100%;">'+
    (k.logo?'<div style="text-align:center;margin-top:10px;"><img src="'+window.U.esc(k.logo)+'" style="max-height:100px;border-radius:10px;border:2px solid var(--border);"><div style="margin-top:8px;"><button class="btn btn-sm btn-danger" data-action="removeKerabatLogo" data-close-first>'+window.ico('trash','sm')+' Hapus Logo</button></div></div>':'')+
    '</div><button class="btn btn-primary btn-block btn-lg" data-action="saveKerabatInfo">'+window.ico('save')+' Simpan</button>';
  window.openModal('Ubah Kerabat Kerja',h);
};
window.saveKerabatInfo = function(){
  if(!canEditKerabat()) return;
  var cid = window.myCid();
  var nama = window.U.trim(document.getElementById('kb-nama').value);
  if(!nama||nama.length<3){ window.toast('Nama minimal 3','warning'); return; }
  if(window.U.hasProfanity(nama)){ window.toast('Nama tidak sopan','error'); return; }
  var k = getKerabat(cid);
  var f = document.getElementById('kb-logo');
  function proceed(logoData){
    k.nama = window.U.sanitize(nama);
    if(logoData!==null && logoData!==undefined) k.logo = logoData;
    setKerabat(cid,k).then(function(){ window.closeModal(); window.toast('Tersimpan','success'); window.injectKerabat(); });
  }
  if(f && f.files && f.files[0]){
    var file = f.files[0];
    if(file.size>300*1024){ window.toast('Logo terlalu besar','error'); return; }
    var reader = new FileReader(); reader.onload = function(e){ proceed(e.target.result); }; reader.readAsDataURL(file);
  } else proceed(null);
};
window.removeKerabatLogo = function(){
  if(!canEditKerabat()) return;
  if(!confirm('Hapus logo?')) return;
  var cid = window.myCid(), k = getKerabat(cid); k.logo = '';
  setKerabat(cid,k).then(function(){ window.closeModal(); window.injectKerabat(); window.toast('Logo dihapus','success'); });
};
window.openAddKerabatItem = function(){
  if(!canEditKerabat()) return;
  window.openModal('Tambah Anggota',
    '<div class="form-group"><label>Nama</label><input id="kbi-nama"></div>'+
    '<div class="form-group"><label>Jabatan</label><input id="kbi-jabatan"></div>'+
    '<div class="form-group"><label>Kontak</label><input id="kbi-kontak"></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveKerabatItem" data-arg="new">'+window.ico('save')+' Simpan</button>');
};
window.openEditKerabatItem = function(id){
  if(!canEditKerabat()) return;
  var cid = window.myCid(), k = getKerabat(cid);
  var item = k.struktur.find(function(x){ return x.id===id; }); if(!item) return;
  window.openModal('Edit Anggota',
    '<div class="form-group"><label>Nama</label><input id="kbi-nama" value="'+window.U.esc(item.nama)+'"></div>'+
    '<div class="form-group"><label>Jabatan</label><input id="kbi-jabatan" value="'+window.U.esc(item.jabatan)+'"></div>'+
    '<div class="form-group"><label>Kontak</label><input id="kbi-kontak" value="'+window.U.esc(item.kontak||'')+'"></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveKerabatItem" data-arg="'+id+'">'+window.ico('save')+' Simpan</button>');
};
window.saveKerabatItem = function(arg){
  if(!canEditKerabat()) return;
  var cid = window.myCid();
  var nama = window.U.trim(document.getElementById('kbi-nama').value);
  var jabatan = window.U.trim(document.getElementById('kbi-jabatan').value);
  var kontak = window.U.trim(document.getElementById('kbi-kontak').value);
  if(!nama||!jabatan){ window.toast('Nama & jabatan wajib','warning'); return; }
  var k = getKerabat(cid); if(!k.struktur) k.struktur = [];
  if(arg==='new'){
    k.struktur.push({id:window.U.uid(),nama:window.U.sanitize(nama),jabatan:window.U.sanitize(jabatan),kontak:window.U.sanitize(kontak),createdAt:Date.now()});
  } else {
    k.struktur = k.struktur.map(function(x){ if(x.id!==arg) return x;
      return Object.assign({},x,{nama:window.U.sanitize(nama),jabatan:window.U.sanitize(jabatan),kontak:window.U.sanitize(kontak)}); });
  }
  k.struktur.sort(function(a,b){ return orderIdx(a.jabatan)-orderIdx(b.jabatan); });
  setKerabat(cid,k).then(function(){ window.closeModal(); window.toast('Tersimpan','success'); setTimeout(function(){ window.openKerabatStrukturModal(); },200); });
};
window.delKerabatItem = function(id){
  if(!canEditKerabat()) return;
  if(!confirm('Hapus?')) return;
  var cid = window.myCid(), k = getKerabat(cid);
  k.struktur = k.struktur.filter(function(x){ return x.id!==id; });
  setKerabat(cid,k).then(function(){ window.openKerabatStrukturModal(); });
};
window.autoFillKerabat = function(){
  if(!canEditKerabat()) return;
  var cid = window.myCid();
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  if(!c) return;
  var students = (c.students||[]).slice();
  if(students.length===0){ window.toast('Belum ada siswa','warning'); return; }
  if(!confirm('Auto-isi dari '+students.length+' siswa? Struktur lama akan diganti.')) return;
  var sorted = students.slice().sort(function(a,b){
    var ai = orderIdx(a.role), bi = orderIdx(b.role);
    if(ai!==bi) return ai-bi;
    return String(a.name||'').localeCompare(String(b.name||''));
  });
  var items = sorted.map(function(s){
    return {id:window.U.uid(),nama:s.name||'-',jabatan:(window.ROLES[s.role]&&window.ROLES[s.role].label)||s.role,
      kontak:s.phone||'',studentId:s.id,role:s.role,autoFilled:true,createdAt:Date.now()};
  });
  var k = getKerabat(cid); k.struktur = items;
  if(!k.nama) k.nama = 'Kerabat Kerja '+c.name;
  setKerabat(cid,k).then(function(){
    window.closeModal(); window.toast('Auto-isi: '+items.length+' anggota','success');
    setTimeout(function(){ window.openKerabatStrukturModal(); },250); window.injectKerabat();
  });
};

/* ========== DOKUMEN ========== */
window.TEMPLATE_LIBRARY = {
  rundown:{title:'Rundown Acara Pertunjukan',content:'RUNDOWN ACARA PERTUNJUKAN\n=============================================\n\nPEMBUKAAN (10 menit)\nPERTUNJUKAN (30 menit)\nPENUTUP (5 menit)\n'},
  proposal:{title:'Proposal Kegiatan',content:'PROPOSAL KEGIATAN\n=============================================\n\nI. LATAR BELAKANG\n____________\nII. TUJUAN\n____________\nIII. TEMA\n____________\nIV. KEPANITIAAN\n____________\nV. ANGGARAN\n____________\n'},
  lpj_keuangan:{title:'LPJ Keuangan',content:'LPJ KEUANGAN\n=============================================\n\nPemasukan: Rp ________\nPengeluaran: Rp ________\nSaldo: Rp ________\n'},
  scene_breakdown:{title:'Scene Breakdown',content:'SCENE BREAKDOWN\n=============================================\n\nAdegan | Lokasi | Tokoh | Durasi | Props\n____________\n'},
  call_sheet:{title:'Call Sheet',content:'CALL SHEET\n=============================================\n\nTanggal: ____\nWaktu: ____\nLokasi: ____\nPemain:\n- ____\n'},
  matriks_busana:{title:'Matriks Busana',content:'MATRIKS BUSANA\n=============================================\n\nTokoh | Pemeran | Atasan | Bawahan | Aksesoris\n'},
  face_chart:{title:'Face Chart Rias',content:'FACE CHART RIAS\n=============================================\n\nTokoh: ____\nSifat: ____\nKesan: ____\n'},
  master_properti:{title:'Daftar Master Properti',content:'DAFTAR MASTER PROPERTI\n=============================================\n\nNo | Nama | Asal | Adegan | PIC\n'},
  denah_panggung:{title:'Denah Panggung',content:'DENAH TATA LETAK PANGGUNG\n=============================================\n\nUkuran: ____ x ____ m\nDepan: ____\nTengah: ____\nBelakang: ____\n'},
  kalender_konten:{title:'Kalender Konten',content:'KALENDER KONTEN\n=============================================\n\nTanggal | Platform | Jenis | Judul | PIC\n'}
};
window.TEMPLATE_PER_ROLE = {
  pimpinan_produksi:['rundown'], sekretaris:['proposal','rundown'], bendahara:['lpj_keuangan'],
  sutradara:['scene_breakdown'], asisten_sutradara:['call_sheet'],
  koor_busana:['matriks_busana'], anggota_busana:['matriks_busana'],
  koor_rias:['face_chart'], anggota_rias:['face_chart'],
  koor_perlengkapan:['master_properti'], anggota_perlengkapan:['master_properti'],
  koor_panggung:['denah_panggung'], anggota_panggung:['denah_panggung'],
  koor_publikasi:['kalender_konten'], anggota_publikasi:['kalender_konten']
};
window.getTemplateResult = function(cid,key){ return window.U.safeJson(window.U.getLS('sppt_tpl_'+cid+'_'+key),null); };
function buildDocHtml(title,content,meta){
  var me = window.currentUser||{}, tanggal = new Date().toLocaleString('id-ID');
  function escH(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  var header = '<div style="text-align:center;margin-bottom:24px;"><h1 style="font-size:18pt;color:#1e40af;border-bottom:2pt solid #2563eb;">'+escH(title)+'</h1>'+
    '<p style="font-size:10pt;color:#666;">SMP Negeri 10 Samarinda</p></div>'+
    '<table style="width:100%;font-size:10pt;margin-bottom:16px;">'+
    '<tr><td style="width:120px;color:#666;">Oleh:</td><td><b>'+escH(me.name||'-')+'</b></td></tr>'+
    '<tr><td style="color:#666;">Kelas:</td><td>'+escH(meta.className||'-')+'</td></tr>'+
    '<tr><td style="color:#666;">Tanggal:</td><td>'+escH(tanggal)+'</td></tr></table><hr>';
  var body = String(content||'').split('\n').map(function(line){
    var s = escH(line); if(s.trim()==='') s = '&nbsp;';
    return '<p style="font-family:Consolas,monospace;font-size:11pt;margin:0 0 3px;">'+s+'</p>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+escH(title)+'</title><style>@page{size:A4;margin:2cm}</style></head><body>'+header+body+'</body></html>';
}
function saveBlob(blob,filename){
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); },1000);
}
window.downloadTemplate = function(key){
  var t = window.TEMPLATE_LIBRARY[key]; if(!t) return;
  var cid = window.myCid();
  var c = (window.DB.classes||[]).find(function(x){ return x.id===cid; });
  var meta = { className: c?c.name:'-' };
  var html = buildDocHtml(t.title,t.content,meta);
  var filename = t.title.replace(/[^A-Za-z0-9]+/g,'_');
  if(typeof htmlDocx!=='undefined' && htmlDocx.asBlob){
    try{ var blob = htmlDocx.asBlob(html); saveBlob(blob,filename+'.docx'); return; }catch(e){}
  }
  saveBlob(new Blob(['\ufeff'+html],{type:'application/msword'}),filename+'.doc');
};
window.openDokumenSaya = function(){
  var role = window.myRole();
  var templates = (window.TEMPLATE_PER_ROLE[role]||[]).slice();
  var cid = window.myCid();
  var h = '<div class="alert alert-info">'+window.ico('info')+'<div><b>Cara pakai:</b> Download → Kerjakan → Upload</div></div>';
  if(templates.length===0){
    h += '<div class="empty-state">'+window.ico('doc',40)+'<p>Tidak ada template untuk peran Anda.</p></div>';
    window.openModal('Dokumen Saya',h); return;
  }
  var done = 0;
  templates.forEach(function(key){
    var t = window.TEMPLATE_LIBRARY[key]; if(!t) return;
    var result = window.getTemplateResult(cid,key); if(result) done++;
    h += '<div class="card" style="border-left:4px solid '+(result?'var(--success)':'var(--danger)')+';margin-bottom:10px;">'+
      '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">'+
      '<div style="font-weight:700;font-size:13.5px;">'+window.ico('doc',14)+' '+window.U.esc(t.title)+'</div>'+
      '<span class="badge badge-'+(result?'success':'warning')+'">'+(result?'Sudah':'Belum')+'</span></div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
      '<button class="btn btn-sm" data-action="downloadTemplate" data-arg="'+key+'">'+window.ico('download','sm')+' Download</button>'+
      '<button class="btn btn-sm '+(result?'':'btn-primary')+'" data-action="openUploadTemplate" data-arg="'+key+'" data-close-first>'+window.ico('upload','sm')+' '+(result?'Ganti':'Upload')+'</button></div></div>';
  });
  h += '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);font-size:12.5px;">Progres: <b>'+done+' / '+templates.length+'</b></div>';
  window.openModal('Dokumen Saya',h);
};
window.openUploadTemplate = function(key){
  var t = window.TEMPLATE_LIBRARY[key]; if(!t) return;
  window.openModal('Upload: '+t.title,
    '<div class="form-group"><label>File (maks 500 KB)</label><input type="file" id="tpl-file" accept=".docx,.doc,.pdf,.txt" style="padding:8px;width:100%;"></div>'+
    '<div class="form-group"><label>Catatan</label><textarea id="tpl-note" rows="2"></textarea></div>'+
    '<button class="btn btn-primary btn-block" data-action="saveTemplateUpload" data-arg="'+key+'">'+window.ico('save')+' Upload</button>');
};
window.saveTemplateUpload = function(key){
  var fEl = document.getElementById('tpl-file');
  if(!fEl || !fEl.files || !fEl.files[0]){ window.toast('Pilih file','warning'); return; }
  var f = fEl.files[0];
  if(f.size>500*1024){ window.toast('File terlalu besar','error'); return; }
  var cid = window.myCid();
  var reader = new FileReader();
  reader.onload = function(e){
    var payload = { classId:cid, templateKey:key, templateTitle:window.TEMPLATE_LIBRARY[key].title,
      fileName:f.name, fileSize:f.size, dataUrl:e.target.result,
      note:window.U.sanitize(document.getElementById('tpl-note').value||''),
      uploadedBy:window.myName(), uploadedAt:Date.now() };
    window.U.setLS('sppt_tpl_'+cid+'_'+key,JSON.stringify(payload));
    window.closeModal(); window.toast('Berhasil diunggah','success'); window.openDokumenSaya();
  };
  reader.readAsDataURL(f);
};

/* ========== TIMELINE ========== */
window.__carouselInjecting = false;
window.__carouselLastInject = 0;
function cleanupCarousel(){
  var mc = document.getElementById('main-content'); if(!mc) return;
  var w = mc.querySelectorAll('.carousel-wrap');
  if(w.length>1){ for(var i=1;i<w.length;i++) w[i].remove(); }
}
window.injectCarousel = function(){
  var now = Date.now();
  if(window.__carouselInjecting) return;
  if(now - window.__carouselLastInject < 800) return;
  window.__carouselInjecting = true; window.__carouselLastInject = now;
  try{
    cleanupCarousel();
    var mc = document.getElementById('main-content'); if(!mc) return;
    var cid = window.myCid(); if(!cid) return;
    if(mc.querySelector('.carousel-wrap')) return;
    function empty(ic,t,d){
      return '<div style="text-align:center;padding:40px 20px;"><div style="opacity:.35;margin-bottom:10px;">'+window.ico(ic,48)+'</div>'+
        '<div style="font-weight:700;font-size:14px;margin-bottom:6px;">'+window.U.esc(t)+'</div>'+
        '<div style="font-size:12px;color:var(--text-muted);">'+window.U.esc(d)+'</div></div>';
    }
    var jadwal = '<div style="text-align:center;padding:40px 20px;"><div style="opacity:.35;">'+window.ico('calendar',48)+'</div><div style="font-weight:700;margin-top:10px;">Belum ada jadwal</div></div>';
    var timeline = '<div style="text-align:center;padding:40px 20px;"><div style="opacity:.35;">'+window.ico('layers',48)+'</div><div style="font-weight:700;margin-top:10px;">Belum ada timeline</div></div>';
    var kalender = '<div style="text-align:center;padding:40px 20px;"><div style="opacity:.35;">'+window.ico('image',48)+'</div><div style="font-weight:700;margin-top:10px;">Belum ada konten</div></div>';
    var h = '<div class="carousel-wrap">'+
      '<div class="carousel-header"><h3>'+window.ico('layers',18)+' Timeline & Jadwal</h3>'+
      '<div class="carousel-tabs">'+
      '<button class="carousel-tab active" data-tab="0">'+window.ico('calendar',12)+' Jadwal</button>'+
      '<button class="carousel-tab" data-tab="1">'+window.ico('layers',12)+' Timeline</button>'+
      '<button class="carousel-tab" data-tab="2">'+window.ico('image',12)+' Kalender</button></div></div>'+
      '<div class="carousel-track" id="carousel-track">'+
      '<div class="carousel-slide">'+jadwal+'</div>'+
      '<div class="carousel-slide">'+timeline+'</div>'+
      '<div class="carousel-slide">'+kalender+'</div></div>'+
      '<div style="display:flex;justify-content:center;gap:6px;padding:0 0 14px;">'+
      '<button class="carousel-dot active" data-dot="0"></button>'+
      '<button class="carousel-dot" data-dot="1"></button>'+
      '<button class="carousel-dot" data-dot="2"></button></div></div>';
    var ref = mc.querySelector('.progress-banner') || mc.querySelector('.card');
    var wrap = document.createElement('div'); wrap.innerHTML = h;
    var el = wrap.firstElementChild;
    if(ref && ref.parentNode) ref.parentNode.insertBefore(el,ref.nextSibling);
    else mc.insertBefore(el,mc.firstChild);
    setTimeout(setupCarousel,100); setTimeout(setupCarousel,500);
  }catch(e){ console.error('[timeline]',e); }
  setTimeout(function(){ cleanupCarousel(); window.__carouselInjecting = false; },150);
};
function setupCarousel(){
  var track = document.getElementById('carousel-track'); if(!track) return;
  var tabs = document.querySelectorAll('.carousel-tab');
  var dots = document.querySelectorAll('.carousel-dot');
  function goTo(i){ track.scrollTo({left:track.clientWidth*i,behavior:'smooth'}); }
  tabs.forEach(function(t){ t.onclick = function(){ goTo(parseInt(t.getAttribute('data-tab'))); }; });
  dots.forEach(function(d){ d.onclick = function(){ goTo(parseInt(d.getAttribute('data-dot'))); }; });
  var timer = null;
  track.onscroll = function(){
    if(timer) clearTimeout(timer);
    timer = setTimeout(function(){
      var idx = Math.round(track.scrollLeft/track.clientWidth);
      tabs.forEach(function(t,i){ t.classList.toggle('active',i===idx); });
      dots.forEach(function(d,i){ d.classList.toggle('active',i===idx); });
    },80);
  };
}

console.log('[features] loaded');
})();