/**
 * @file app.js
 * Bootstrap SP-PPT — init Firebase, session routing, bind events.
 */
import { initFirebase } from './core/db.js';
import { login, register, logout, getSession } from './auth/session.js';
import {
  toast, openModal, closeModal, confirmDialog,
  initTheme, toggleTheme, bindPasswordToggles,
  emptyState, alertBox,
} from './ui/shell.js';
import { renderDashboard } from './features/dashboard.js';

const $ = (id) => document.getElementById(id);
const show = (el) => { if (el) el.classList.remove('hidden'); };
const hide = (el) => { if (el) el.classList.add('hidden'); };

function route() {
  const splash   = $('splash');
  const loginScr = $('login-screen');
  const appScr   = $('app');
  const user     = getSession();

  hide(splash);
  if (user) { hide(loginScr); show(appScr); mountApp(); }
  else      { show(loginScr); hide(appScr); }
}

async function mountApp() {
  const main = $('main-content');
  if (!main) return;
  main.innerHTML = '<div class="empty"><div>⏳</div><p>Memuat…</p></div>';
  try {
    await renderDashboard(main);
    renderBottomNav();
  } catch (err) {
    main.innerHTML = alertBox('Gagal memuat: ' + err.message, 'danger');
  }
}

function renderBottomNav() {
  const nav = $('bottom-nav');
  if (!nav) return;
  const user = getSession();
  const isGuru = user?.type === 'guru' || user?.type === 'admin';
  const items = isGuru
    ? [
        { key: 'dashboard', ico: '🏠', label: 'Beranda' },
        { key: 'nilai',     ico: '📊', label: 'Rekap' },
        { key: 'struktur',  ico: '👥', label: 'Struktur' },
        { key: 'jadwal',    ico: '📅', label: 'Jadwal' },
      ]
    : [
        { key: 'dashboard', ico: '🏠', label: 'Beranda' },
        { key: 'nilai',     ico: '📊', label: 'Nilai' },
        { key: 'struktur',  ico: '👥', label: 'Struktur' },
        { key: 'jadwal',    ico: '📅', label: 'Jadwal' },
      ];

  nav.innerHTML = items.map((it, i) =>
    `<button data-nav="${it.key}" class="${i === 0 ? 'active' : ''}">
       <span class="nav-ico">${it.ico}</span><span>${it.label}</span>
     </button>`
  ).join('');

  nav.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      nav.querySelectorAll('[data-nav]').forEach((b) => b.classList.toggle('active', b === btn));
      const key = btn.getAttribute('data-nav');
      try {
        if (key === 'dashboard') return mountApp();
        if (key === 'nilai') {
          const m = await import('./features/nilai.js');
          isGuru ? m.openRekapNilai() : m.openNilaiSaya();
        } else if (key === 'struktur') {
          const m = await import('./features/struktur.js'); m.openStrukturKerabat();
        } else if (key === 'jadwal') {
          const m = await import('./features/jadwal.js'); m.openJadwal();
        }
      } catch (err) {
        toast(err.message || 'Fitur belum tersedia', 'error');
      }
    });
  });
}

function bindLoginForm() {
  const form = $('form-login');
  if (!form) return;
  let submitting = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn?.textContent || 'Masuk';
    if (btn) { btn.disabled = true; btn.textContent = 'Memeriksa…'; }
    try {
      const email = $('login-email').value.trim();
      const pw = $('login-password').value;
      await login(email, pw);
      toast('Login berhasil!', 'success');
      form.reset();
      route();
    } catch (err) {
      toast(err.message || 'Login gagal.', 'error');
    } finally {
      submitting = false;
      if (btn) { btn.disabled = false; btn.textContent = orig; }
    }
  });
}

function bindRegisterForm() {
  const form = $('form-register');
  if (!form) return;
  let submitting = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn?.textContent || 'Daftar';
    if (btn) { btn.disabled = true; btn.textContent = 'Memproses…'; }
    try {
      const data = {
        code:     $('reg-code').value,
        name:     $('reg-name').value,
        email:    $('reg-email').value,
        phone:    $('reg-phone').value,
        password: $('reg-password').value,
      };
      const confirm = $('reg-confirm').value;
      if (data.password !== confirm) throw new Error('Konfirmasi password tidak cocok.');
      await register(data);
      toast('Pendaftaran berhasil! Anda otomatis masuk.', 'success');
      form.reset();
      route();
    } catch (err) {
      toast(err.message || 'Pendaftaran gagal.', 'error');
    } finally {
      submitting = false;
      if (btn) { btn.disabled = false; btn.textContent = orig; }
    }
  });
}

function bindTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const name = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-panel').forEach((p) => {
        p.classList.toggle('active', p.id === `form-${name}`);
      });
    });
  });
}

function bindHeaderActions() {
  $('btn-theme')?.addEventListener('click', toggleTheme);
  $('btn-logout')?.addEventListener('click', async () => {
    const ok = await confirmDialog('Yakin ingin keluar dari aplikasi?');
    if (!ok) return;
    logout();
    toast('Anda telah keluar.', 'info');
    route();
  });
  $('btn-notif')?.addEventListener('click', () => {
    openModal('Notifikasi', `${emptyState('Belum ada notifikasi.', '🔔')}
      <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px;">
        Fitur notifikasi lengkap akan aktif di pembaruan berikutnya.
      </p>`);
  });
  $('btn-panduan')?.addEventListener('click', () => {
    openModal('Panduan Singkat', `
      <div style="font-size:13px;line-height:1.8;">
        <p><b>1. Masuk</b> — dengan email/WA + password.</p>
        <p><b>2. Dashboard</b> — pantau progres & tugas Anda.</p>
        <p><b>3. Nilai</b> — cek nilai per tahapan.</p>
        <p><b>4. Struktur</b> — lihat kerabat kerja & kontak WA.</p>
        <p><b>5. Jadwal</b> — cek jadwal latihan & booking.</p>
        <p><b>6. Absensi</b> — isi kehadiran setiap sesi.</p>
      </div>`);
  });
  $('btn-forgot')?.addEventListener('click', () => {
    openModal('Lupa Password', `
      <div class="alert alert-info">
        <strong>ℹ</strong>
        <div>Hubungi guru pengampu atau admin untuk reset password Anda.</div>
      </div>`);
  });
}

function boot() {
  initFirebase();
  initTheme();
  bindPasswordToggles();
  bindTabs();
  bindLoginForm();
  bindRegisterForm();
  bindHeaderActions();
  setTimeout(route, 600);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}