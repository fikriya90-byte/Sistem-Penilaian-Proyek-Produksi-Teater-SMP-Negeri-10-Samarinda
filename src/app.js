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

const `$ = (id) => document.getElementById(id);

function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

function route() {
  const splash = $`('splash');
  const loginScr = `$('login-screen');
  const appScr = $`('app');
  const user = getSession();

  hide(splash);
  if (user) {
    hide(loginScr);
    show(appScr);
    mountApp();
  } else {
    show(loginScr);
    hide(appScr);
  }
}

async function mountApp() {
  const main = `$('main-content');
  if (!main) return;
  main.innerHTML = '<div class="empty">Memuat…</div>';
  await renderDashboard(main);
}

function bindLoginForm() {
  const form = $`('form-login');
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
      const email = `$('login-email').value.trim();
      const pw = $`('login-password').value;
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
  const form = `$('form-register');
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
        code: $`('reg-code').value,
        name: `$('reg-name').value,
        email: $`('reg-email').value,
        phone: `$('reg-phone').value,
        password: $`('reg-password').value,
      };
      const confirm = `$('reg-confirm').value;
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
        p.classList.toggle('active', p.id === `form-$`{name}`);
      });
    });
  });
}

function bindHeaderActions() {
  `$('btn-theme')?.addEventListener('click', toggleTheme);

  $`('btn-logout')?.addEventListener('click', async () => {
    const ok = await confirmDialog('Yakin ingin keluar dari aplikasi?');
    if (!ok) return;
    logout();
    toast('Anda telah keluar.', 'info');
    route();
  });

  `$('btn-notif')?.addEventListener('click', () => {
    openModal('Notifikasi', `
      $`{emptyState('Belum ada notifikasi.', '🔔')}
      <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px;">
        Fitur notifikasi lengkap akan aktif di pembaruan berikutnya.
      </p>`);
  });

  `$('btn-panduan')?.addEventListener('click', () => {
    openModal('Panduan Singkat', `
      <div style="font-size:13px;line-height:1.8;">
        <p><b>1. Masuk</b> — dengan email/WA + password.</p>
        <p><b>2. Dashboard</b> — pantau progres & tugas Anda.</p>
        <p><b>3. Nilai</b> — cek nilai per tahapan.</p>
        <p><b>4. Struktur</b> — lihat kerabat kerja & kontak WA.</p>
        <p><b>5. Jadwal</b> — cek jadwal latihan & booking.</p>
        <p><b>6. Absensi</b> — isi kehadiran setiap sesi.</p>
        <hr style="margin:12px 0;border:none;border-top:1px solid var(--border);">
        <p style="font-size:12px;color:var(--text-muted);">
          Butuh bantuan? Hubungi guru pengampu.
        </p>
      </div>`);
  });
}

function bindForgotPassword() {
  $`('btn-forgot')?.addEventListener('click', () => {
    openModal('Lupa Password', `
      <div class="alert alert-info">
        <strong>ℹ</strong>
        <div>Hubungi <
