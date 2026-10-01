/**
 * @file dashboard.js
 * Dashboard siswa & guru.
 */

import { esc, fmtDateTime } from '../core/utils.js';
import { ROLES, DIVISIONS } from '../core/config.js';
import { getSession, getMyClass, getMyGuruClasses } from '../auth/session.js';
import { avatarHTML, emptyState, setHeaderTitle, setHeaderUser, alertBox } from '../ui/shell.js';

export async function renderSiswaDashboard(root) {
  const user = getSession();
  const cls = await getMyClass();
  const roleMeta = ROLES[user.role] || { label: user.role, divisi: 'inti' };
  const divisiMeta = DIVISIONS[roleMeta.divisi] || { label: roleMeta.divisi };

  setHeaderTitle('Dashboard Siswa');
  setHeaderUser(`$`{esc(user.name)} · `${esc(roleMeta.label)}`);
  root.innerHTML = '';

  const profileCard = document.createElement('div');
  profileCard.className = 'card';
  profileCard.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;">
      $`{avatarHTML(user, 56)}
      <div style="flex:1;min-width:0;">
        <h3 style="margin-bottom:4px;">`${esc(user.name)}</h3>
        <p style="font-size:12.5px;color:var(--text-muted);">
          <span class="badge badge-primary">$`{esc(roleMeta.label)}</span>
          <span class="badge badge-gray">`${esc(divisiMeta.label)}</span>
        </p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">
          $`{cls ? 'Kelas: <b>' + esc(cls.name || cls.id) + '</b>' : 'Kelas tidak ditemukan'}
        </p>
      </div>
    </div>`;
  root.appendChild(profileCard);

  const quickCard = document.createElement('div');
  quickCard.className = 'card';
  quickCard.innerHTML = `
    <h3>Aksi Cepat</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
      <button class="btn" data-quick="nilai">📊 Nilai Saya</button>
      <button class="btn" data-quick="beri-nilai">✏ Beri Nilai</button>
      <button class="btn" data-quick="struktur">👥 Struktur</button>
      <button class="btn" data-quick="jadwal">📅 Jadwal</button>
      <button class="btn" data-quick="booking">🎸 Booking</button>
      <button class="btn" data-quick="absensi">✓ Absensi</button>
      <button class="btn" data-quick="checklist">☑ Checklist</button>
    </div>`;
  root.appendChild(quickCard);

  quickCard.querySelectorAll('[data-quick]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.getAttribute('data-quick');
      const { openNilaiSaya, openBeriNilai } = await import('./nilai.js');
      const { openStrukturKerabat } = await import('./struktur.js');
      const { openJadwal, openBooking } = await import('./jadwal.js');
      const { openAbsensi, openChecklist } = await import('./absensi.js');
      const map = {
        'nilai': openNilaiSaya,
        'beri-nilai': openBeriNilai,
        'struktur': openStrukturKerabat,
        'jadwal': openJadwal,
        'booking': openBooking,
        'absensi': openAbsensi,
        'checklist': openChecklist,
      };
      map[key]?.();
    });
  });

  const infoCard = document.createElement('div');
  infoCard.className = 'card';
  infoCard.innerHTML = `
    <h3>Selamat Datang 👋</h3>
    <p style="font-size:13px;color:var(--text-muted);line-height:1.6;">
      Gunakan menu di atas untuk mengakses fitur. Data akan tersinkron otomatis.
    </p>`;
  root.appendChild(infoCard);
}

export async function renderGuruDashboard(root) {
  const user = getSession();
  const classes = await getMyGuruClasses();
  const isAdmin = user.type === 'admin';

  setHeaderTitle(isAdmin ? 'Dashboard Admin' : 'Dashboard Guru');
  setHeaderUser(``${esc(user.name)} · $`{isAdmin ? 'Admin' : 'Guru'}`);
  root.innerHTML = '';

  const stats = document.createElement('div');
  stats.className = 'grid';
  stats.innerHTML = `
    <div class="card">
      <p style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Kelas</p>
      <p style="font-size:28px;font-weight:800;color:var(--primary);">`${classes.length}</p>
    </div>
    <div class="card">
      <p style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Total Siswa</p>
      <p style="font-size:28px;font-weight:800;color:var(--success);">$`{classes.reduce((a, c) => a + (c.students?.length || 0), 0)}</p>
    </div>`;
  root.appendChild(stats);

  const listCard = document.createElement('div');
  listCard.className = 'card';
  if (classes.length === 0) {
    listCard.innerHTML = `<h3>Daftar Kelas</h3>`${emptyState(
      isAdmin ? 'Belum ada kelas terdaftar.' : 'Belum ada kelas untuk akun ini.',
      '📚'
    )}`;
  } else {
    listCard.innerHTML = `<h3>Daftar Kelas ($`{classes.length})</h3><div id="guru-classes"></div>`;
    const container = listCard.querySelector('#guru-classes');
    classes.forEach((c) => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;display:flex;justify-conten
