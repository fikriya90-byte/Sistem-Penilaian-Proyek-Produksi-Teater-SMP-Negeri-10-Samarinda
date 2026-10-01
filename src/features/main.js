/* ============================================================
   SP-PPT Core Features (Tahapan & Struktur Avatar)
   ============================================================ */
(function(global){
  'use strict';

  const Tahapan = {
    openMaster: function(cid) {
      cid = cid || global.Auth.getCid();
      if (!cid) return alert('Kelas tidak valid atau belum dipilih.');
      const cls = global.Auth.getClass(cid);
      if (!cls) return alert('Data kelas tidak ditemukan.');

      const stages = global.DB?.stages || [];
      const activeIds = (global.DB?.activeStages && global.DB.activeStages[cid]?.activeIds) || [];
      const canEdit = global.Auth.hasAccess(['pimpinan_produksi', 'sutradara']);

      let html = `<div class="alert alert-info"><b>Sistem Tahapan Proyek</b> - ${global.Utils.esc(cls.name)}</div>`;
      
      stages.forEach((stg, i) => {
        const isActive = activeIds.includes(stg.id);
        html += `<div class="card" style="margin-bottom:8px; border-left: 4px solid ${isActive ? 'var(--success)' : 'var(--border)'}">
                  <div style="font-weight:700;">${i+1}. ${global.Utils.esc(stg.name)} (${stg.weight}%)</div>
                  <div style="font-size:0.85rem; color:#64748b;">Status: ${isActive ? 'Aktif' : 'Nonaktif'}</div>
                 </div>`;
      });

      global.openModal('Kelola Tahapan', html);
    }
  };

  const Struktur = {
    renderAvatarHTML: function(student, borderColor, size = 36) {
      const initials = global.Utils.esc((student.name || '?').charAt(0).toUpperCase());
      const photo = global.Utils.sanitizeURL(student.foto);
      if (photo && photo !== '#') {
        return `<img src="${photo}" alt="Avatar" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid ${borderColor};">`;
      }
      return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${borderColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.85rem;">${initials}</div>`;
    }
  };

  global.SPPPT = { Tahapan, Struktur };

})(window);
