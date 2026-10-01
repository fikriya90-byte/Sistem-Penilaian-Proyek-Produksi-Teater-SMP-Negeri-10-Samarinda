/**
 * @file struktur.js
 */
import { esc, waLink } from '../core/utils.js';
import { ROLES, DIVISIONS } from '../core/config.js';
import { getSession, getAllClasses } from '../auth/session.js';
import { toast, openModal, emptyState, alertBox, avatarHTML } from '../ui/shell.js';

export async function openStrukturKerabat() {
  const user = getSession();
  const classId = user?.classId || user?.__viewClassId;
  if (!classId) { toast('Pilih kelas dulu.', 'warning'); return; }

  openModal('Struktur Kerabat Kerja', '<div class="empty">Memuat…</div>');
  try {
    const classes = await getAllClasses();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) { document.getElementById('modal-body').innerHTML = alertBox('Kelas tidak ditemukan.', 'danger'); return; }

    const students = cls.students || [];
    const kerabatNama = cls.kerabatNama || `Kerabat Kerja ${cls.name || cls.id}`;

    const byDivisi = {};
    students.forEach((s) => {
      const meta = ROLES[s.role] || { divisi: 'inti' };
      if (!byDivisi[meta.divisi]) byDivisi[meta.divisi] = [];
      byDivisi[meta.divisi].push(s);
    });

    let html = `
      <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;margin-bottom:16px;">
        <h2 style="font-size:20px;font-weight:800;color:#78350f;margin-bottom:4px;">${esc(kerabatNama)}</h2>
        <p style="font-size:12px;color:#92400e;">Kelas ${esc(cls.name || cls.id)} · ${students.length} Anggota</p>
      </div>`;

    const order = ['inti', 'perlengkapan', 'publikasi', 'rias', 'busana', 'musik', 'pemeran'];
    for (const dk of order) {
      const list = byDivisi[dk];
      if (!list || list.length === 0) continue;
      const dMeta = DIVISIONS[dk] || { label: dk };
      list.sort((a, b) => (ROLES[a.role]?.level || 99) - (ROLES[b.role]?.level || 99));

      html += `
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--primary);color:#fff;border-radius:8px 8px 0 0;">
            <b style="font-size:12.5px;letter-spacing:.05em;">${esc(dMeta.label).toUpperCase()}</b>
            <span style="font-size:11px;opacity:.9;">${list.length} orang</span>
          </div>
          <div style="border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;padding:8px;background:var(--bg-elevated);">`;
      for (const s of list) {
        const rl = ROLES[s.role]?.label || s.role;
        const isMe = s.id === user.studentId;
        const wa = s.phone ? waLink(s.phone, `Halo ${s.name}, dari Kerabat Kerja ${cls.name || ''}.`) : '';
        html += `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${isMe ? 'var(--primary-soft)' : 'var(--surface)'};border-radius:6px;margin-bottom:4px;">
            ${avatarHTML(s, 34)}
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:12.5px;">${esc(s.name)}${isMe ? ' <span class="badge badge-primary" style="font-size:9px;">Anda</span>' : ''}</div>
              <div style="font-size:11px;color:var(--text-muted);">${esc(rl)}</div>
            </div>
            ${wa ? `<a href="${esc(wa)}" target="_blank" rel="noopener" class="btn btn-sm btn-success" style="text-decoration:none;">📱</a>` : ''}
          </div>`;
      }
      html += `</div></div>`;
    }

    if (students.length === 0) html += emptyState('Belum ada siswa terdaftar.', '👥');
    document.getElementById('modal-body').innerHTML = html;
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}