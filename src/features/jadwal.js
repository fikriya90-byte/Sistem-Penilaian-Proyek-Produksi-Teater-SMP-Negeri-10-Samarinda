/**
 * @file jadwal.js
 */
import { esc, uid, todayISO } from '../core/utils.js';
import { setSmart, listSmart, delSmart } from '../core/db.js';
import { getSession } from '../auth/session.js';
import { toast, openModal, closeModal, confirmDialog, emptyState, alertBox } from '../ui/shell.js';
import * as Guard from '../core/guard.js';

export async function openJadwal() {
  const user = getSession();
  const classId = user?.classId || user?.__viewClassId;
  if (!classId) { toast('Pilih kelas dulu.', 'warning'); return; }
  openModal('Jadwal Kegiatan', '<div class="empty">Memuat…</div>');
  try {
    const schedules = await listSmart('schedules', { where: [['classId', '==', classId]] });
    schedules.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const canManage = Guard.canManageMasterSchedule(user, classId);
    let html = '';
    if (canManage) html += `<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" id="jd-add">➕ Tambah Jadwal</button>`;
    if (schedules.length === 0) {
      html += emptyState('Belum ada jadwal.', '📅');
    } else {
      schedules.forEach((s) => {
        html += `
          <div class="card" style="border-left:3px solid var(--primary);">
            <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <div style="flex:1;min-width:150px;">
                <div style="font-weight:700;font-size:13.5px;">${esc(s.title || 'Kegiatan')}</div>
                <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                  ${esc(s.type || '-')} · ${esc(s.date || '-')}${s.startTime ? ' · ' + esc(s.startTime) + '-' + esc(s.endTime || '') : ''}
                </div>
                ${s.location ? `<div style="font-size:11.5px;margin-top:3px;">📍 ${esc(s.location)}</div>` : ''}
                ${s.pic ? `<div style="font-size:11.5px;color:var(--text-muted);">PIC: ${esc(s.pic)}</div>` : ''}
              </div>
              ${canManage ? `<button class="btn btn-sm btn-danger" data-del="${esc(s.id)}">🗑</button>` : ''}
            </div>
          </div>`;
      });
    }
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('jd-add')?.addEventListener('click', () => openFormJadwal(classId));
    document.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const ok = await confirmDialog('Hapus jadwal ini?');
        if (!ok) return;
        try {
          await delSmart('schedules', btn.getAttribute('data-del'));
          toast('Jadwal dihapus.', 'success');
          closeModal(); openJadwal();
        } catch (err) { toast('Gagal: ' + err.message, 'error'); }
      });
    });
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}

function openFormJadwal(classId) {
  openModal('Tambah Jadwal', `
    <div class="field"><label>Judul</label><input id="jd-title" placeholder="Contoh: Latihan Rutin #1"></div>
    <div class="field"><label>Jenis</label>
      <select id="jd-type">
        <option value="rapat">Rapat</option>
        <option value="latihan">Latihan</option>
        <option value="gladi">Gladi Resik</option>
        <option value="pementasan">Pementasan</option>
      </select>
    </div>
    <div class="field"><label>Tanggal</label><input type="date" id="jd-date" value="${todayISO()}"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div class="field"><label>Mulai</label><input type="time" id="jd-start" value="14:00"></div>
      <div class="field"><label>Selesai</label><input type="time" id="jd-end" value="16:00"></div>
    </div>
    <div class="field"><label>Lokasi</label><input id="jd-loc" placeholder="Aula / Kelas / dll"></div>
    <div class="field"><label>Agenda</label><textarea id="jd-agenda" rows="2"></textarea></div>
    <button class="btn btn-primary btn-block" id="jd-save">Simpan</button>
  `);
  document.getElementById('jd-save').addEventListener('click', async () => {
    const data = {
      classId,
      title: document.getElementById('jd-title').value.trim(),
      type: document.getElementById('jd-type').value,
      date: document.getElementById('jd-date').value,
      startTime: document.getElementById('jd-start').value,
      endTime: document.getElementById('jd-end').value,
      location: document.getElementById('jd-loc').value.trim(),
      agenda: document.getElementById('jd-agenda').value.trim(),
      pic: getSession().name,
      createdAt: Date.now(),
    };
    if (!data.title || !data.date) { toast('Judul & tanggal wajib.', 'warning'); return; }
    if (data.startTime >= data.endTime) { toast('Jam selesai harus lebih besar.', 'warning'); return; }
    try {
      const id = uid('sch');
      await setSmart('schedules', id, { id, ...data });
      toast('Jadwal tersimpan.', 'success');
      closeModal(); openJadwal();
    } catch (err) { toast('Gagal: ' + err.message, 'error'); }
  });
}

export async function openBooking() {
  const user = getSession();
  const classId = user?.classId || user?.__viewClassId;
  if (!classId) { toast('Pilih kelas dulu.', 'warning'); return; }
  openModal('Booking Alat & Ruang', '<div class="empty">Memuat…</div>');
  try {
    const bookings = await listSmart('bookings', { where: [['classId', '==', classId]] });
    bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    let html = `<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" id="bk-add">➕ Ajukan Booking</button>`;
    if (bookings.length === 0) html += emptyState('Belum ada booking.', '🎸');
    else {
      for (const b of bookings) {
        const status = b.status || 'pending';
        const badge = status === 'approved' ? 'badge-success' : status === 'rejected' ? 'badge-danger' : 'badge-warning';
        html += `
          <div class="card">
            <div style="display:flex;justify-content:space-between;gap:8px;">
              <div>
                <div style="font-weight:700;">${esc(b.resourceName || '-')}</div>
                <div style="font-size:11.5px;color:var(--text-muted);">
                  ${esc(b.date || '-')} · ${esc(b.startTime || '')}-${esc(b.endTime || '')}
                </div>
                <div style="font-size:11.5px;margin-top:4px;">${esc(b.purpose || '')}</div>
              </div>
              <span class="badge ${badge}">${esc(status)}</span>
            </div>
          </div>`;
      }
    }
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('bk-add')?.addEventListener('click', () => openFormBooking(classId));
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}

function openFormBooking(classId) {
  openModal('Ajukan Booking', `
    <div class="field"><label>Nama Alat / Ruang</label><input id="bk-res" placeholder="Speaker / Aula"></div>
    <div class="field"><label>Tanggal</label><input type="date" id="bk-date" value="${todayISO()}"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div class="field"><label>Mulai</label><input type="time" id="bk-start" value="14:00"></div>
      <div class="field"><label>Selesai</label><input type="time" id="bk-end" value="16:00"></div>
    </div>
    <div class="field"><label>Keperluan</label><textarea id="bk-purpose" rows="2"></textarea></div>
    <button class="btn btn-primary btn-block" id="bk-save">Kirim Pengajuan</button>
  `);
  document.getElementById('bk-save').addEventListener('click', async () => {
    const data = {
      classId,
      resourceName: document.getElementById('bk-res').value.trim(),
      date: document.getElementById('bk-date').value,
      startTime: document.getElementById('bk-start').value,
      endTime: document.getElementById('bk-end').value,
      purpose: document.getElementById('bk-purpose').value.trim(),
      requestedBy: getSession().name,
      status: 'pending',
      createdAt: Date.now(),
    };
    if (!data.resourceName || !data.date) { toast('Lengkapi data booking.', 'warning'); return; }
    try {
      const id = uid('bk');
      await setSmart('bookings', id, { id, ...data });
      toast('Booking diajukan.', 'success');
      closeModal();
    } catch (err) { toast('Gagal: ' + err.message, 'error'); }
  });
}