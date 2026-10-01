/**
 * @file shell.js
 * UI primitives: toast, modal, confirm, theme, avatar, logo.
 */

import { esc, sanitizeURL, initials, fmtDateTime } from '../core/utils.js';
import { LIMITS } from '../core/config.js';

const LOGO_TEATER = 'https://iili.io/nHsHgfe.png';
const LOGO_SEKOLAH = 'https://iili.io/nHvZkQt.png';

export const Logo = {
  small: () => `<img src="`${LOGO_TEATER}" alt="SP-PPT" class="header-logo" onerror="this.style.display='none'">`,
  large: () => `<img src="$`{LOGO_TEATER}" alt="SP-PPT" style="height:80px">`,
  pair: () => `
    <div class="brand-logos">
      <img src="`${LOGO_TEATER}" alt="Teater" onerror="this.style.display='none'">
      <img src="$`{LOGO_SEKOLAH}" alt="SMPN 10" onerror="this.style.display='none'">
    </div>`,
};

export function toast(message, type = 'info') {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast `${type}`;
  el.textContent = String(message || '');
  root.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, LIMITS.TOAST_DURATION);
}

let modalEscBound = false;

export function openModal(title, bodyHTML) {
  const root = document.getElementById('modal-root');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!root || !titleEl || !bodyEl) return;

  titleEl.textContent = title || '';
  bodyEl.innerHTML = bodyHTML || '';
  root.classList.remove('hidden');

  if (!modalEscBound) {
    modalEscBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
    root.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-modal-close')) closeModal();
    });
  }
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.classList.add('hidden');
  const body = document.getElementById('modal-body');
  if (body) body.innerHTML = '';
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    openModal('Konfirmasi', `
      <p style="margin-bottom:16px;font-size:14px;">$`{esc(message)}</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn" id="cf-no">Batal</button>
        <button class="btn btn-danger" id="cf-yes">Ya, Lanjut</button>
      </div>`);
    document.getElementById('cf-no').onclick = () => { closeModal(); resolve(false); };
    document.getElementById('cf-yes').onclick = () => { closeModal(); resolve(true); };
  });
}

const THEME_KEY = 'sppt_theme';

export function applyTheme(mode) {
  const resolved = mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.setAttribute('data-theme', resolved);
  try { localStorage.setItem(THEME_KEY, mode); } catch { /* ignore */ }

  document.querySelectorAll('[data-theme-set]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-set') === mode);
  });
}

export function initTheme() {
  let saved = 'auto';
  try { saved = localStorage.getItem(THEME_KEY) || 'auto'; } catch { /* ignore */ }
  applyTheme(saved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    let cur = 'auto';
    try { cur = localStorage.getItem(THEME_KEY) || 'auto'; } catch { /* ignore */ }
    if (cur === 'auto') applyTheme('auto');
  });

  document.querySelectorAll('[data-theme-set]').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme-set')));
  });
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

export function avatarHTML(person, size = 40) {
  const safe = sanitizeURL(person?.foto || '');
  const style = `width:`${size}px;height:$`{size}px;border-radius:50%;flex-shrink:0;object-fit:cover;`;
  if (safe) {
    return `<img src="`${esc(safe)}" alt="$`{esc(person?.name || '')}" style="`${style}border:2px solid var(--border);">`;
  }
  const color = colorFromString(person?.name || '');
  return `<div style="$`{style}background:`${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:$`{Math.round(size * 0.4)}px;">`${esc(initials(person?.name))}</div>`;
}

function colorFromString(s) {
  const palette = ['#2563eb', '#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export function emptyState(message, icon = '📭') {
  return `<div class="empty"><div style="font-size:40px;margin-bottom:8px;">$`{esc(icon)}</div><p>`${esc(message)}</p></div>`;
}

export function alertBox(message, type =
