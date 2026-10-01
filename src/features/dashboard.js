/**
 * @file dashboard.js
 */
import { esc } from '../core/utils.js';
import { ROLES, DIVISIONS } from '../core/config.js';
import { getSession, getMyClass, getMyGuruClasses } from '../auth/session.js';
import { avatarHTML, emptyState, setHeaderTitle, setHeaderUser, toast } from '../ui/shell.js';
import * as Guard from '../core/guard.js';

export async function renderSiswaDashboard(root) {
  const user = getSession();
  const cls = await getMyClass();
  const roleMeta = ROLES[user.role] || { label: user.role, divisi: 'inti' };
  const divisiMeta = DIVISIONS[roleMeta.divisi] || { label: roleMeta.divisi };

  setHeaderTitle('Dashboard Siswa');
  setHeaderUser(`${user.name} · ${roleMeta.label}`);
  root.innerHTML = '';

  const profileCard = document.createElement('div');
  profileCard.className = 'card';
  profileCard.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;">
      ${avatarHTML(user, 56)}
      <div style="flex:1;min-width:0;">
        <h3 style="margin-bottom:4px;">${esc(user.name)}</h3>
        <p style="font-size:12.5px;color:var(--text-muted);">
          <span class="badge badge-primary">${esc(roleMeta.label)}</span>
          <span class="badge badge-gray">${esc(divisiMeta.label)}</span>
        </p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">
          ${cls ? 'Kelas: <b>' + esc(cls.name || cls.id) + '</b>' : 'Kelas tidak ditemukan'}
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
    </div>`;
  root.appendChild(quickCard);

  quickCard.querySelectorAll('[data-quick]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.getAttribute('data-quick');
      try {
        if (key === 'nilai' || key === 'beri-nilai') {
          const m = await import('./nilai.js');
          key === 'nilai' ? m.openNilaiSaya() : m.openBeriNilai();
        } else if (key === 'struktur') {
          const m = await import('./struktur.js'); m.openStrukturKerabat();
        } else if (key === 'jadwal' || key === 'booking') {
          const m = await import('./jadwal.js');
          key === 'jadwal' ? m.openJadwal() : m.openBooking();
        } else if (key === 'absensi') {
          const m = await import('./absensi.js'); m.openAbsensi();
        }
      } catch (err) {
        toast(err.message || 'Fitur belum tersedia', 'error');
      }
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
  setHeaderUser(`${user.name} · ${isAdmin ? 'Admin' : 'Guru'}`);
  root.innerHTML = '';

  const stats = document.createElement('div');
  stats.className = 'grid';
  stats.innerHTML = `
    <div class="card">
      <p style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Kelas</p>
      <p style="font-size:28px;font-weight:800;color:var(--primary);">${classes.length}</p>
    </div>
    <div class="card">
      <p style="font-size:11.5px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Total Siswa</p>
      <p style="font-size:28px;font-weight:800;color:var(--success);">${classes.reduce((a, c) => a + (c.students?.length || 0), 0)}</p>
    </div>`;
  root.appendChild(stats);

  const listCard = document.createElement('div');
  listCard.className = 'card';
  if (classes.length === 0) {
    listCard.innerHTML = `<h3>Daftar Kelas</h3>${emptyState(
      isAdmin ? 'Belum ada kelas terdaftar.' : 'Belum ada kelas untuk akun ini.', '📚')}`;
  } else {
    listCard.innerHTML = `<h3>Daftar Kelas (${classes.length})</h3><div id="guru-classes"></div>`;
    const container = listCard.querySelector('#guru-classes');
    classes.forEach((c) => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;';
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <div style="min-width:0;">
            <div style="font-weight:700;font-size:13.5px;">${esc(c.name || c.id)}</div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">
              Kode: <b>${esc(c.code || '-')}</b> · ${(c.students?.length || 0)} siswa
            </div>
          </div>
          <button class="btn btn-sm btn-primary" data-open="${esc(c.id)}">Buka</button>
        </div>`;
      container.appendChild(item);
    });
    container.querySelectorAll('[data-open]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const classId = btn.getAttribute('data-open');
        const u = getSession();
        if (u) u.__viewClassId = classId;
        const { openRekapNilai } = await import('./nilai.js');
        openRekapNilai();
      });
    });
  }
  root.appendChild(listCard);
}

export async function renderDashboard(root) {
  const user = getSession();
  if (!user) return;
  if (Guard.isGuru(user)) return renderGuruDashboard(root);
  return renderSiswaDashboard(root);
}