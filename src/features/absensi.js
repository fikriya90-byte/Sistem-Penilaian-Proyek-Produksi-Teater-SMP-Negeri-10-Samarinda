/**
 * @file absensi.js
 */
import { esc, uid, todayISO } from '../core/utils.js';
import { setSmart, getSmart, listSmart } from '../core/db.js';
import { getSession, getAllClasses } from '../auth/session.js';
import { toast, openModal, closeModal, emptyState, alertBox } from '../ui/shell.js';
import * as Guard from '../core/guard.js';

export async function openAbsensi() {
  const user = getSession();
  const classId = user?.classId || user?.__viewClassId;
  if (!classId) { toast('Pilih kelas dulu.', 'warning'); return; }
  openModal('Absensi', '<div class="empty">Memuat…</div>');
  try {
    const meetings = await listSmart('meetings', { where: [['classId', '==', classId]] });
    meetings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const canCreate = Guard.canMarkAttendance(user, classId);
    let html = '';
    if (canCreate) html += `<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" id="ab-add">➕ Buat Sesi</button>`;
    if (meetings.length === 0) {
      html += emptyState('Belum ada sesi absensi.', '📋');
    } else {
      meetings.forEach((m) => {
        const recordCount = Object.keys(m.records || {}).length;
        html += `
          <div class="card" style="border-left:3px solid var(--primary);">
            <div style="font-weight:700;font-size:13.5px;">${esc(m.title || 'Sesi')}</div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
              ${esc(m.date || '-')}${m.startTime ? ' · ' + esc(m.startTime) : ''}
            </div>
            <div style="font-size:11.5px;margin-top:6px;">
              <span class="badge badge-info">${recordCount} terisi</span>
            </div>
            <button class="btn btn-sm btn-primary" style="margin-top:8px;" data-mid="${esc(m.id)}">Isi Absensi</button>
          </div>`;
      });
    }
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('ab-add')?.addEventListener('click', () => openFormMeeting(classId));
    document.querySelectorAll('[data-mid]').forEach((btn) => {
      btn.addEventListener('click', () => openIsiAbsensi(btn.getAttribute('data-mid')));
    });
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}

function openFormMeeting(classId) {
  openModal('Buat Sesi Absensi', `
    <div class="field"><label>Judul Sesi</label><input id="mt-title" placeholder="Latihan Rutin #1"></div>
    <div class="field"><label>Tanggal</label><input type="date" id="mt-date" value="${todayISO()}"></div>
    <div class="field"><label>Jam</label><input type="time" id="mt-time" value="14:00"></div>
    <button class="btn btn-primary btn-block" id="mt-save">Buat Sesi</button>
  `);
  document.getElementById('mt-save').addEventListener('click', async () => {
    const title = document.getElementById('mt-title').value.trim();
    const date = document.getElementById('mt-date').value;
    const startTime = document.getElementById('mt-time').value;
    if (!title || !date) { toast('Judul & tanggal wajib.', 'warning'); return; }
    try {
      const id = uid('mt');
      await setSmart('meetings', id, {
        id, classId, title, date, startTime,
        records: {},
        createdBy: getSession().name,
        createdAt: Date.now(),
      });
      toast('Sesi dibuat!', 'success');
      closeModal(); openAbsensi();
    } catch (err) { toast('Gagal: ' + err.message, 'error'); }
  });
}

async function openIsiAbsensi(meetingId) {
  const user = getSession();
  const meeting = await getSmart('meetings', meetingId);
  if (!meeting) { toast('Sesi tidak ditemukan.', 'error'); return; }

  const classes = await getAllClasses();
  const cls = classes.find((c) => c.id === meeting.classId);
  const students = cls?.students || [];

  if (Guard.isSiswa(user)) {
    const current = meeting.records?.[user.studentId] || '';
    const opts = [
      { v: 'hadir', l: '✅ Hadir' },
      { v: 'izin', l: '📝 Izin' },
      { v: 'sakit', l: '🤒 Sakit' },
      { v: 'alfa', l: '❌ Tidak Hadir' },
    ];
    openModal(`Absensi: ${meeting.title}`, `
      <div class="alert alert-info"><strong>ℹ</strong><div>${esc(meeting.date || '')}${meeting.startTime ? ' · ' + esc(meeting.startTime) : ''}</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${opts.map((o) => `
          <label style="padding:14px;border:2px solid ${current === o.v ? 'var(--primary)' : 'var(--border)'};border-radius:8px;cursor:pointer;background:${current === o.v ? 'var(--primary-soft)' : 'var(--bg-elevated)'};display:flex;align-items:center;gap:10px;">
            <input type="radio" name="att" value="${o.v}" ${current === o.v ? 'checked' : ''}>
            <b>${o.l}</b>
          </label>`).join('')}
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:14px;" id="att-save">Simpan</button>
    `);
    document.getElementById('att-save').addEventListener('click', async () => {
      const sel = document.querySelector('input[name="att"]:checked');
      if (!sel) { toast('Pilih status kehadiran.', 'warning'); return; }
      try {
        const records = { ...(meeting.records || {}), [user.studentId]: sel.value };
        await setSmart('meetings', meetingId, { records });
        toast('Absensi tersimpan.', 'success');
        closeModal();
      } catch (err) { toast('Gagal: ' + err.message, 'error'); }
    });
    return;
  }

  const records = meeting.records || {};
  let html = `
    <div class="alert alert-info"><strong>ℹ</strong><div>${esc(meeting.date || '')}${meeting.startTime ? ' · ' + esc(meeting.startTime) : ''}</div></div>
    <div style="display:flex;flex-direction:column;gap:8px;">`;
  for (const s of students) {
    const cur = records[s.id] || '';
    html += `
      <div style="padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-elevated);">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px;">${esc(s.name)}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
          ${['hadir','izin','sakit','alfa'].map((v) => `
            <label style="text-align:center;padding:6px;border:1px solid ${cur === v ? 'var(--primary)' : 'var(--border)'};border-radius:6px;font-size:11px;cursor:pointer;background:${cur === v ? 'var(--primary-soft)' : 'transparent'};">
              <input type="radio" name="att_${s.id}" value="${v}" ${cur === v ? 'checked' : ''} style="display:none;">
              ${v}
            </label>`).join('')}
        </div>
      </div>`;
  }
  html += `</div><button class="btn btn-primary btn-block" style="margin-top:12px;" id="att-save-all">Simpan Absensi</button>`;
  document.getElementById('modal-body').innerHTML = html;

  document.getElementById('att-save-all').addEventListener('click', async () => {
    const newRecords = { ...records };
    for (const s of students) {
      const sel = document.querySelector(`input[name="att_${s.id}"]:checked`);
      if (sel) newRecords[s.id] = sel.value;
    }
    try {
      await setSmart('meetings', meetingId, { records: newRecords });
      toast('Absensi tersimpan.', 'success');
      closeModal(); openAbsensi();
    } catch (err) { toast('Gagal: ' + err.message, 'error'); }
  });
}