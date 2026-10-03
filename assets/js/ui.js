/**
 * ui.js
 * Rendering UI, routes, and interactions (minimal but functional)
 *
 * Exports: initUI()
 *
 * NOTE: Simple single-page router via hash (#)
 */

import { APP_INFO, KELAS_LIST, TAHAPAN, DIVISI_LIST, WHATSAPP_GURU } from './config.js';
import { getCurrentUser, loginUser, logout, registerUser, requireRole } from './auth.js';
import * as API from './api.js';

/* ---------------------------
   Helpers: DOM, toasts, format
   --------------------------- */

/**
 * Render toast notification
 * @param {string} text
 * @param {string} type - success|error|info
 */
function toast(text, type = 'info') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'card shadow-sm';
  el.style.minWidth = '240px';
  el.style.background = type === 'error' ? '#fee2e2' : (type === 'success' ? '#ecfdf5' : '#f8fafc');
  el.innerHTML = `<div class="kv"><div style="flex:1">${text}</div><button class="text-sm text-muted">Tutup</button></div>`;
  root.appendChild(el);
  const btn = el.querySelector('button');
  btn.onclick = () => el.remove();
  setTimeout(() => { try { el.remove(); } catch (e) {} }, 6000);
}

/**
 * Simple element helper
 */
function el(tag, attrs = {}, inner = '') {
  const e = document.createElement(tag);
  Object.keys(attrs).forEach(k => {
    if (k.startsWith('on') && typeof attrs[k] === 'function') {
      e.addEventListener(k.substr(2), attrs[k]);
    } else if (k === 'class') e.className = attrs[k];
    else e.setAttribute(k, attrs[k]);
  });
  if (typeof inner === 'string') e.innerHTML = inner;
  else if (inner instanceof Node) e.appendChild(inner);
  else if (Array.isArray(inner)) inner.forEach(n => e.appendChild(n));
  return e;
}

/* ---------------------------
   Header actions & renderers
   --------------------------- */

function renderHeaderActions() {
  const hdr = document.getElementById('header-actions');
  hdr.innerHTML = '';
  const user = getCurrentUser();
  if (!user) {
    const loginBtn = el('button', { class: 'px-3 py-1 rounded bg-accent text-white' }, 'Login / Daftar');
    loginBtn.addEventListener('click', () => { window.location.hash = '#login'; });
    hdr.appendChild(loginBtn);
  } else {
    const name = el('div', { class: 'text-sm' }, `<div class="font-semibold">${user.nama}</div><div class="small">${user.role} • ${user.peran || ''}</div>`);
    const menu = el('div', { class: 'flex items-center gap-2' }, [name]);
    const logoutBtn = el('button', { class: 'px-3 py-1 rounded border' }, 'Logout');
    logoutBtn.addEventListener('click', () => {
      logout();
      toast('Anda berhasil logout', 'success');
      renderHeaderActions();
      window.location.hash = '#login';
    });
    menu.appendChild(logoutBtn);
    hdr.appendChild(menu);
  }
}

/* ---------------------------
   Pages
   --------------------------- */

async function pageLogin() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const card = el('div', { class: 'card max-w-xl mx-auto' });
  card.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">Login / Daftar SP-PPT</h2>
    <p class="small mb-4">Masuk menggunakan Email atau Nomor WhatsApp yang terdaftar.</p>
    <div id="auth-area"></div>
  `;
  main.appendChild(card);

  const authArea = card.querySelector('#auth-area');

  // Login form
  const loginForm = el('form', { class: '' });
  loginForm.innerHTML = `
    <label class="small">Email atau Nomor WhatsApp</label>
    <input id="login-identifier" class="w-full border p-2 rounded mb-2" />
    <label class="small">Password</label>
    <input id="login-password" type="password" class="w-full border p-2 rounded mb-2" />
    <div class="flex gap-2">
      <button id="btn-login" class="px-3 py-1 bg-accent text-white rounded">Login</button>
      <button id="btn-goto-register" type="button" class="px-3 py-1 border rounded">Daftar Siswa</button>
      <a id="btn-guest" class="ml-auto text-sm small">Masuk sebagai tamu</a>
    </div>
    <hr class="my-3" />
  `;
  authArea.appendChild(loginForm);

  // Register form (collapsed default)
  const regForm = el('form', { class: 'hidden mt-3', id: 'reg-form' });
  regForm.innerHTML = `
    <label class="small">Kode Kelas</label>
    <select id="reg-kelas" class="w-full border p-2 rounded mb-2">
      <option value="">Pilih Kelas</option>
      ${KELAS_LIST.map(k=>`<option value="${k.id}">${k.id} — ${k.lakon}</option>`).join('')}
    </select>
    <label class="small">Nama Lengkap</label>
    <input id="reg-nama" class="w-full border p-2 rounded mb-2" />
    <label class="small">Email</label>
    <input id="reg-email" class="w-full border p-2 rounded mb-2" />
    <label class="small">Nomor WhatsApp (08...)</label>
    <input id="reg-wa" class="w-full border p-2 rounded mb-2" />
    <label class="small">Password</label>
    <input id="reg-password" type="password" class="w-full border p-2 rounded mb-2" />
    <label class="small">Peran Awal</label>
    <select id="reg-peran" class="w-full border p-2 rounded mb-2">
      <option value="Pemain">Pemain</option>
      <option value="Anggota Divisi">Anggota Divisi</option>
    </select>
    <div class="flex gap-2">
      <button id="btn-register" class="px-3 py-1 bg-accent text-white rounded">Daftar & Masuk</button>
      <button id="btn-cancel-register" type="button" class="px-3 py-1 border rounded">Batal</button>
    </div>
  `;
  authArea.appendChild(regForm);

  // events
  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const idf = document.getElementById('login-identifier').value.trim();
    const pwd = document.getElementById('login-password').value;
    if (!idf || !pwd) return toast('Lengkapi credential', 'error');
    try {
      const user = await loginUser(idf, pwd);
      toast(`Selamat datang, ${user.nama}`, 'success');
      renderHeaderActions();
      window.location.hash = '#dashboard';
    } catch (err) {
      toast(err.message || 'Gagal login', 'error');
    }
  });

  document.getElementById('btn-goto-register').addEventListener('click', () => {
    regForm.classList.toggle('hidden');
  });
  document.getElementById('btn-cancel-register').addEventListener('click', () => {
    regForm.classList.add('hidden');
  });
  document.getElementById('btn-register').addEventListener('click', async (ev) => {
    ev.preventDefault();
    const payload = {
      kelasId: document.getElementById('reg-kelas').value,
      nama: document.getElementById('reg-nama').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      nomorWA: document.getElementById('reg-wa').value.trim(),
      password: document.getElementById('reg-password').value,
      role: 'siswa',
      peran: document.getElementById('reg-peran').value
    };
    if (!payload.kelasId || !payload.nama || !payload.email || !payload.nomorWA || !payload.password) {
      return toast('Lengkapi semua field pendaftaran', 'error');
    }
    try {
      const user = await registerUser(payload);
      toast('Registrasi berhasil — Anda masuk otomatis', 'success');
      renderHeaderActions();
      window.location.hash = '#dashboard';
    } catch (err) {
      toast(err.message || 'Gagal registrasi', 'error');
    }
  });

  document.getElementById('btn-guest').addEventListener('click', () => {
    toast('Masuk sebagai tamu (view only)', 'info');
    // Simulate guest session
    localStorage.setItem('spppt_current_user', JSON.stringify({ uid: 'guest', nama: 'Tamu', role: 'guest', peran: 'Tamu' }));
    renderHeaderActions();
    window.location.hash = '#dashboard';
  });
}

/* ---------------------------
   Dashboard (student & teacher)
   --------------------------- */

async function pageDashboard() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const user = getCurrentUser();
  if (!user) {
    window.location.hash = '#login';
    return;
  }

  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="text-lg font-semibold mb-2">Dashboard</h2><div class="small mb-3">Halo, ${user.nama} — ${user.role} / ${user.peran || ''}</div>`;
  main.appendChild(card);

  // quick actions
  const actions = el('div', { class: 'flex flex-wrap gap-2 mb-4' });
  const btnNotif = el('button', { class: 'px-3 py-1 rounded border' }, 'Notifikasi');
  const btnGrades = el('button', { class: 'px-3 py-1 rounded bg-accent text-white' }, 'Nilai & Penilaian');
  const btnAbsensi = el('button', { class: 'px-3 py-1 rounded border' }, 'Absensi');
  const btnJadwal = el('button', { class: 'px-3 py-1 rounded border' }, 'Jadwal');
  actions.append(btnNotif, btnGrades, btnAbsensi, btnJadwal);
  card.appendChild(actions);

  // content area
  const area = el('div', { id: 'dashboard-area' });
  card.appendChild(area);

  // events
  btnGrades.addEventListener('click', () => { window.location.hash = '#nilai'; });
  btnAbsensi.addEventListener('click', () => { window.location.hash = '#absensi'; });
  btnJadwal.addEventListener('click', () => { window.location.hash = '#jadwal'; });

  // teacher extra widgets
  if (user.role === 'teacher' || user.role === 'admin') {
    const teacherCard = el('div', { class: 'card mt-4' });
    teacherCard.innerHTML = `<h3 class="font-semibold mb-2">Monitoring Real-Time (Guru)</h3><div id="monitoring-area" class="small">Memuat data...</div>`;
    main.appendChild(teacherCard);
    // simple stats: number of classes, students
    const kelas = await API.listKelas();
    const kelasCount = Object.keys(kelas).length;
    const users = await API.listUsers();
    const siswaCount = Object.keys(users).filter(k => users[k].role === 'siswa').length;
    document.getElementById('monitoring-area').innerHTML = `Kelas: ${kelasCount} • Siswa total: ${siswaCount}`;
  }

  // student quick: show upcoming schedules (3)
  const upcoming = await API.dbGet ? await API.dbGet('jadwal') : null;
  // simple placeholder if no jadwal
  const schedules = await API.dbGet ? await API.dbGet('jadwal') : null;
  const scheduleCard = el('div', { class: 'card mt-4' }, '<h3 class="font-semibold">Jadwal Terdekat</h3>');
  const jadwalList = el('div', { class: 'mt-2 small' }, schedules ? 'Data jadwal tersedia' : 'Belum ada jadwal.');
  scheduleCard.appendChild(jadwalList);
  main.appendChild(scheduleCard);
}

/* ---------------------------
   Penilaian Page (nilai)
   --------------------------- */

async function pageNilai() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const user = getCurrentUser();
  if (!user) { window.location.hash = '#login'; return; }
  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="text-lg font-semibold mb-2">Penilaian 360°</h2>
    <div class="small mb-3">Gunakan form ini untuk memasukkan penilaian. Bobot: Guru 60% | Ketua 25% | Rekan 15%</div>`;
  main.appendChild(card);

  const form = el('div', {});
  // pilih kelas (teacher dapat pilih), siswa list, tahapan, input aspek
  const kelasSelect = el('select', { class: 'border p-2 rounded mb-2 w-full' }, `<option value="">Pilih Kelas</option>${KELAS_LIST.map(k=>`<option value="${k.id}">${k.id} — ${k.lakon}</option>`).join('')}`);
  form.appendChild(el('label', { class: 'small' }, 'Kelas'));
  form.appendChild(kelasSelect);

  const siswaSelect = el('select', { class: 'border p-2 rounded mb-2 w-full' }, `<option value="">Pilih Siswa</option>`);
  form.appendChild(el('label', { class: 'small' }, 'Siswa'));
  form.appendChild(siswaSelect);

  const tahapanSel = el('select', { class: 'border p-2 rounded mb-2 w-full' }, `<option value="">Pilih Tahapan</option>${TAHAPAN.map(t=>`<option value="${t}">${t}</option>`).join('')}`);
  form.appendChild(el('label', { class: 'small' }, 'Tahapan Produksi'));
  form.appendChild(tahapanSel);

  // aspek inputs
  const aspekList = ['pengetahuan','keterampilan','kolaborasi','inisiatif','konsistensi'];
  const aspekInputs = {};
  aspekList.forEach(a => {
    form.appendChild(el('label', { class: 'small mt-2' }, `${a.charAt(0).toUpperCase()+a.slice(1)}`));
    const sel = el('select', { class: 'border p-2 rounded mb-2 w-full' }, '<option value="">Pilih (1-4)</option><option>1</option><option>2</option><option>3</option><option>4</option>');
    aspekInputs[a] = sel;
    form.appendChild(sel);
  });

  // komentar
  form.appendChild(el('label', { class: 'small' }, 'Komentar (opsional)'));
  const komentar = el('textarea', { class: 'border p-2 rounded w-full mb-2', rows: 2 });
  form.appendChild(komentar);

  // penilai role: guru/ketua/rekan
  const penilaiRoleSel = el('select', { class: 'border p-2 rounded mb-2 w-full' }, '<option value="guru">Guru (60%)</option><option value="ketua">Ketua (25%)</option><option value="rekan">Rekan (15%)</option>');
  form.appendChild(el('label', { class: 'small' }, 'Anda menilai sebagai'));
  form.appendChild(penilaiRoleSel);

  const submitBtn = el('button', { class: 'px-3 py-1 mt-3 bg-accent text-white rounded' }, 'Simpan & Submit');
  form.appendChild(submitBtn);

  card.appendChild(form);

  // load siswa saat kelas dipilih
  kelasSelect.addEventListener('change', async () => {
    const kelasId = kelasSelect.value;
    siswaSelect.innerHTML = '<option value="">Memuat...</option>';
    if (!kelasId) { siswaSelect.innerHTML = '<option value="">Pilih Siswa</option>'; return; }
    // ambil siswa dari kelas structure
    const kelasData = await API.getKelas(kelasId);
    const siswaList = (kelasData && kelasData.siswaList) ? kelasData.siswaList : {};
    // siswaList is array or object
    let options = '<option value="">Pilih Siswa</option>';
    if (Array.isArray(siswaList)) {
      siswaList.forEach(s => { options += `<option value="${s.siswaID}">${s.nama} — ${s.peran || ''}</option>`; });
    } else {
      Object.values(siswaList).forEach(s => { options += `<option value="${s.siswaID}">${s.nama} — ${s.peran || ''}</option>`; });
    }
    siswaSelect.innerHTML = options;
  });

  submitBtn.addEventListener('click', async (ev) => {
    ev.preventDefault();
    try {
      const kelasId = kelasSelect.value;
      const siswaId = siswaSelect.value;
      const tahapan = tahapanSel.value;
      const penilaiRole = penilaiRoleSel.value;
      if (!kelasId || !siswaId || !tahapan || !penilaiRole) return toast('Lengkapi Kelas, Siswa, Tahapan dan Penilai', 'error');

      const aspekPayload = {};
      aspekList.forEach(a => aspekPayload[a] = Number(aspekInputs[a].value) || 0);
      aspekPayload.komentar = komentar.value || '';

      await API.saveGrade(kelasId, siswaId, tahapan, penilaiRole, aspekPayload);
      toast('Penilaian tersimpan', 'success');
    } catch (err) {
      toast(err.message || 'Gagal simpan penilaian', 'error');
    }
  });
}

/* ---------------------------
   Absensi Page (create + view)
   --------------------------- */

async function pageAbsensi() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const user = getCurrentUser();
  if (!user) { window.location.hash = '#login'; return; }
  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="text-lg font-semibold mb-2">Absensi</h2><div class="small mb-3">Buat atau isi presensi sesuai peran Anda.</div>`;
  main.appendChild(card);

  const form = el('form', { class: '' });
  form.innerHTML = `
    <label class="small">Tipe Absensi</label>
    <select id="abs-type" class="border p-2 rounded mb-2 w-full">
      <option value="umum">Absensi Umum (Pimpinan/Sekretaris)</option>
      <option value="latihan">Absensi Latihan (Sutradara/Asisten)</option>
      <option value="divisi">Absensi Internal Divisi (Koordinator)</option>
    </select>
    <label class="small">Kelas</label>
    <select id="abs-kelas" class="border p-2 rounded mb-2 w-full">
      <option value="">Pilih Kelas</option>
      ${KELAS_LIST.map(k=>`<option value="${k.id}">${k.id} — ${k.lakon}</option>`).join('')}
    </select>
    <label class="small">Nama Kegiatan</label>
    <input id="abs-name" class="border p-2 rounded mb-2 w-full" />
    <label class="small">Tanggal</label>
    <input id="abs-date" type="date" class="border p-2 rounded mb-2 w-full" />
    <label class="small">Waktu Mulai</label>
    <input id="abs-start" type="time" class="border p-2 rounded mb-2 w-full" />
    <label class="small">Waktu Selesai</label>
    <input id="abs-end" type="time" class="border p-2 rounded mb-2 w-full" />
    <div id="abs-divisi-group" class="hidden">
      <label class="small">Pilih Divisi</label>
      <select id="abs-divisi" class="border p-2 rounded mb-2 w-full">
        <option value="">Pilih Divisi</option>
        ${DIVISI_LIST.map(d=>`<option value="${d}">${d}</option>`).join('')}
      </select>
    </div>
    <div class="flex gap-2">
      <button id="abs-create" class="px-3 py-1 bg-accent text-white rounded">Buat Absensi</button>
      <button id="abs-list" type="button" class="px-3 py-1 border rounded">Lihat Absensi Kelas</button>
    </div>
  `;
  card.appendChild(form);

  // Toggle divisi select
  const absType = form.querySelector('#abs-type');
  const absDivGroup = form.querySelector('#abs-divisi-group');
  absType.addEventListener('change', () => {
    absDivGroup.classList.toggle('hidden', absType.value !== 'divisi');
  });

  form.querySelector('#abs-create').addEventListener('click', async (ev) => {
    ev.preventDefault();
    try {
      const type = form.querySelector('#abs-type').value;
      const kelasId = form.querySelector('#abs-kelas').value;
      const nama = form.querySelector('#abs-name').value.trim();
      const tanggal = form.querySelector('#abs-date').value;
      const mulai = form.querySelector('#abs-start').value;
      const selesai = form.querySelector('#abs-end').value;
      const divisi = form.querySelector('#abs-divisi').value;

      if (!kelasId || !nama || !tanggal) return toast('Lengkapi Kelas, Nama Kegiatan, dan Tanggal', 'error');

      const data = {
        namaKegiatan: nama,
        tanggal,
        waktuMulai: mulai,
        waktuSelesai: selesai,
        lokasi: '',
        divisiId: divisi
      };
      const created = await API.createAttendance(kelasId, type, data, getCurrentUser().uid);
      toast(`Absensi dibuat: ${created.id}`, 'success');
    } catch (err) {
      toast(err.message || 'Gagal buat absensi', 'error');
    }
  });

  form.querySelector('#abs-list').addEventListener('click', async () => {
    window.location.hash = '#absensi-list';
  });
}

/* ---------------------------
   Absensi list page
   --------------------------- */

async function pageAbsensiList() {
  const main = document.getElementById('main');
  main.innerHTML = '<div class="card">Memuat daftar absensi...</div>';
  const all = await API.dbGet ? await API.dbGet('absensi') : null;
  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="font-semibold">Daftar Absensi</h2>`;
  const table = el('table', { class: 'table-fixed w-full mt-2' });
  table.innerHTML = `<thead><tr><th>Id</th><th>Kelas</th><th>Kegiatan</th><th>Tanggal</th><th>Peserta</th><th>Aksi</th></tr></thead><tbody></tbody>`;
  card.appendChild(table);
  main.innerHTML = '';
  main.appendChild(card);

  const tbody = table.querySelector('tbody');
  if (!all) {
    tbody.innerHTML = '<tr><td colspan="6">Belum ada absensi.</td></tr>';
    return;
  }
  Object.keys(all).forEach(kelasId => {
    const kelasObj = all[kelasId] || {};
    Object.keys(kelasObj).forEach(attId => {
      const a = kelasObj[attId];
      const tr = el('tr', {}, [
        el('td', {}, a.id),
        el('td', {}, kelasId),
        el('td', {}, a.namaKegiatan),
        el('td', {}, a.tanggal),
        el('td', {}, String(Object.keys(a.peserta || {}).length)),
        el('td', {}, `<button class="px-2 py-1 border rounded" data-kelas="${kelasId}" data-id="${a.id}">Lihat</button>`)
      ]);
      tbody.appendChild(tr);
    });
  });

  tbody.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', (ev) => {
      const kelas = b.dataset.kelas;
      const id = b.dataset.id;
      window.location.hash = `#absensi-view:${kelas}:${id}`;
    });
  });
}

/* ---------------------------
   Absensi view (detail)
   --------------------------- */

async function pageAbsensiView(kelasId, attId) {
  const main = document.getElementById('main');
  main.innerHTML = '<div class="card">Memuat detail absensi...</div>';
  const data = await API.dbGet ? await API.dbGet(`absensi/${kelasId}/${attId}`) : null;
  if (!data) return main.innerHTML = '<div class="card">Absensi tidak ditemukan.</div>';
  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="font-semibold">${data.namaKegiatan}</h2>
    <div class="small mb-2">Tanggal: ${data.tanggal} • ${data.waktu.mulai || ''} - ${data.waktu.selesai || ''}</div>`;
  const table = el('table', { class: 'table-fixed w-full' });
  table.innerHTML = `<thead><tr><th>Nama</th><th>Sub-Peran</th><th>Jam Isi</th><th>Status</th><th>Aksi</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  Object.keys(data.peserta || {}).forEach(sid => {
    const p = data.peserta[sid];
    const status = p.status || 'belum';
    const waktu = p.waktuIsi ? new Date(p.waktuIsi).toLocaleString() : '-';
    const tr = el('tr', {}, [
      el('td', {}, p.nama || sid),
      el('td', {}, p.peran || '-'),
      el('td', {}, waktu),
      el('td', {}, status),
      el('td', {}, `<button class="px-2 py-1 border rounded set-status" data-sid="${sid}" data-status="hadir">Hadir</button>
                   <button class="px-2 py-1 border rounded set-status" data-sid="${sid}" data-status="izin">Izin</button>
                   <button class="px-2 py-1 border rounded set-status" data-sid="${sid}" data-status="alpa">Alpa</button>`)
    ]);
    tbody.appendChild(tr);
  });
  card.appendChild(table);
  main.innerHTML = '';
  main.appendChild(card);

  card.querySelectorAll('.set-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sid = btn.dataset.sid;
      const st = btn.dataset.status;
      try {
        await API.markAttendance(kelasId, attId, sid, st, '');
        toast('Status updated', 'success');
        // refresh page
        pageAbsensiView(kelasId, attId);
      } catch (err) {
        toast(err.message || 'Gagal update', 'error');
      }
    });
  });
}

/* ---------------------------
   Simple schedule page
   --------------------------- */

async function pageJadwal() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="font-semibold">Jadwal</h2><div class="small mb-2">Buat dan kelola jadwal produksi.</div>`;
  const form = el('form', {});
  form.innerHTML = `
    <label class="small">Kelas</label>
    <select id="sch-kelas" class="border p-2 rounded mb-2 w-full">
      <option value="">Pilih Kelas</option>
      ${KELAS_LIST.map(k=>`<option value="${k.id}">${k.id}</option>`).join('')}
    </select>
    <label class="small">Nama Kegiatan</label>
    <input id="sch-name" class="border p-2 rounded mb-2 w-full" />
    <label class="small">Tanggal</label>
    <input id="sch-date" type="date" class="border p-2 rounded mb-2 w-full" />
    <label class="small">Waktu Mulai</label>
    <input id="sch-start" type="time" class="border p-2 rounded mb-2 w-full" />
    <label class="small">Waktu Selesai</label>
    <input id="sch-end" type="time" class="border p-2 rounded mb-2 w-full" />
    <div class="flex gap-2">
      <button id="sch-create" class="px-3 py-1 bg-accent text-white rounded">Buat Jadwal</button>
      <button id="sch-list" type="button" class="px-3 py-1 border rounded">Lihat Semua Jadwal</button>
    </div>
  `;
  card.appendChild(form);
  main.appendChild(card);

  document.getElementById('sch-create').addEventListener('click', async (ev) => {
    ev.preventDefault();
    try {
      const kelas = document.getElementById('sch-kelas').value;
      const name = document.getElementById('sch-name').value.trim();
      const tanggal = document.getElementById('sch-date').value;
      const mulai = document.getElementById('sch-start').value;
      const selesai = document.getElementById('sch-end').value;
      if (!kelas || !name || !tanggal) return toast('Lengkapi Kelas, Nama, dan Tanggal', 'error');
      const payload = { name, tanggal, waktuMulai: mulai, waktuSelesai: selesai, peserta: [] };
      const result = await API.createSchedule(kelas, payload, getCurrentUser().uid);
      toast('Jadwal dibuat: ' + result.id, 'success');
    } catch (err) {
      toast(err.message || 'Gagal buat jadwal', 'error');
    }
  });

  document.getElementById('sch-list').addEventListener('click', () => {
    window.location.hash = '#jadwal-list';
  });
}

/* jadwal list */
async function pageJadwalList() {
  const main = document.getElementById('main');
  main.innerHTML = '<div class="card">Memuat jadwal...</div>';
  const all = await API.dbGet ? await API.dbGet('jadwal') : null;
  const card = el('div', { class: 'card' });
  card.innerHTML = `<h2 class="font-semibold">Daftar Jadwal</h2>`;
  const table = el('table', { class: 'table-fixed w-full mt-2' });
  table.innerHTML = `<thead><tr><th>Kelas</th><th>Nama</th><th>Tanggal</th><th>Waktu</th></tr></thead><tbody></tbody>`;
  card.appendChild(table);
  main.innerHTML = '';
  main.appendChild(card);
  const tbody = table.querySelector('tbody');
  if (!all) {
    tbody.innerHTML = '<tr><td colspan="4">Belum ada jadwal</td></tr>';
    return;
  }
  Object.keys(all).forEach(kelasId => {
    const obj = all[kelasId] || {};
    Object.keys(obj).forEach(id => {
      const s = obj[id];
      tbody.appendChild(el('tr', {}, [
        el('td', {}, kelasId),
        el('td', {}, s.name),
        el('td', {}, s.tanggal),
        el('td', {}, `${s.waktu.mulai || ''} - ${s.waktu.selesai || ''}`)
      ]));
    });
  });
}

/* ---------------------------
   Simple router
   --------------------------- */

function parseHash(hash) {
  if (!hash || hash === '#dashboard' || hash === '') return { page: 'dashboard' };
  const h = hash.replace(/^#/, '');
  if (h.startsWith('absensi-view:')) {
    const parts = h.split(':');
    return { page: 'absensi-view', kelas: parts[1], id: parts[2] };
  }
  if (h.startsWith('absensi')) return { page: 'absensi' };
  if (h.startsWith('absensi-list')) return { page: 'absensi-list' };
  if (h.startsWith('nilai')) return { page: 'nilai' };
  if (h.startsWith('jadwal-list')) return { page: 'jadwal-list' };
  if (h.startsWith('jadwal')) return { page: 'jadwal' };
  if (h.startsWith('login')) return { page: 'login' };
  return { page: 'dashboard' };
}

async function route() {
  const parsed = parseHash(window.location.hash);
  try {
    switch (parsed.page) {
      case 'login': await pageLogin(); break;
      case 'nilai': await pageNilai(); break;
      case 'absensi': await pageAbsensi(); break;
      case 'absensi-list': await pageAbsensiList(); break;
      case 'absensi-view': await pageAbsensiView(parsed.kelas, parsed.id); break;
      case 'jadwal': await pageJadwal(); break;
      case 'jadwal-list': await pageJadwalList(); break;
      case 'dashboard':
      default: await pageDashboard(); break;
    }
  } catch (err) {
    console.error(err);
    document.getElementById('main').innerHTML = `<div class="card">Terjadi error: ${err.message || err}</div>`;
  }
}

/* ---------------------------
   Public init
   --------------------------- */

function initUI() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  document.getElementById('app-version').textContent = APP_INFO.versi;
  renderHeaderActions();
  window.addEventListener('hashchange', async () => { renderHeaderActions(); await route(); });
  // initial route
  if (!window.location.hash) window.location.hash = '#login';
  route();
}

export { initUI, toast };