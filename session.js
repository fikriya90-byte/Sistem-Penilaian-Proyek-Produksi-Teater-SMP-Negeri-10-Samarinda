/**
 * @file session.js
 * Autentikasi + session management.
 */

import { getSmart, setSmart, listSmart } from '../core/db.js';
import { ADMIN } from '../core/config.js';
import { esc, normEmail, normPhone, uid } from '../core/utils.js';

const SESSION_KEY = 'sppt_session_v3';
const CACHE_KEY = 'sppt_classes_cache';
const CACHE_TTL = 5 * 60 * 1000;

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(user) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* ignore */ }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { classes, at } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL) return null;
    return classes;
  } catch { return null; }
}

function writeCache(classes) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ classes, at: Date.now() }));
  } catch { /* ignore */ }
}

export async function getAllClasses(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) return cached;
  }
  try {
    const classes = await listSmart('classes');
    writeCache(classes);
    return classes;
  } catch (err) {
    console.warn('[session] Gagal load classes:', err.message);
    return readCache() || [];
  }
}

export async function login(identifier, password) {
  const id = String(identifier || '').trim();
  const pw = String(password || '').trim();
  if (!id || !pw) throw new Error('Email dan password wajib diisi.');

  const emailLower = normEmail(id);
  const phoneNorm = normPhone(id);

  if (emailLower === ADMIN.email.toLowerCase() && pw === '#Smpn10smd') {
    const user = { type: 'admin', email: ADMIN.email, name: ADMIN.name };
    setSession(user);
    return { user };
  }

  try {
    const teacher = await getSmart('teachers', emailLower);
    if (teacher && String(teacher.password || '').trim() === pw) {
      const user = {
        type: 'guru',
        email: teacher.email || emailLower,
        name: teacher.name || emailLower,
      };
      setSession(user);
      return { user };
    }
  } catch (err) {
    console.warn('[login] Cek guru gagal:', err.message);
  }

  const classes = await getAllClasses();
  for (const cls of classes) {
    const students = Array.isArray(cls.students) ? cls.students : [];
    for (const s of students) {
      if (!s || !s.password) continue;
      if (String(s.password).trim() !== pw) continue;
      const sEmail = normEmail(s.email);
      const sPhone = normPhone(s.phone);
      const match = (emailLower && sEmail === emailLower) ||
                    (phoneNorm && sPhone === phoneNorm);
      if (!match) continue;
      const user = {
        type: 'siswa',
        classId: cls.id,
        studentId: s.id,
        name: s.name,
        role: s.role || 'pemain',
        email: s.email || '',
        phone: s.phone || '',
      };
      setSession(user);
      return { user };
    }
  }

  throw new Error('Email/WA atau password salah.');
}

export async function register(data) {
  const code = String(data.code || '').trim().toUpperCase();
  const name = String(data.name || '').trim();
  const email = normEmail(data.email);
  const phone = String(data.phone || '').replace(/\D/g, '');
  const password = String(data.password || '').trim();

  if (!code || !name || !email || !phone || !password) {
    throw new Error('Lengkapi semua field.');
  }
  if (phone.length < 10 || phone.length > 15) {
    throw new Error('No. WhatsApp tidak valid (10–15 digit).');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+`$/.test(email)) {
    throw new Error('Format email tidak valid.');
  }
  if (password.length < 6) {
    throw new Error('Password minimal 6 karakter.');
  }

  const classes = await getAllClasses(true);
  const cls = classes.find((c) => String(c.code || '').toUpperCase() === code);
  if (!cls) throw new Error('Kode kelas tidak ditemukan.');

  const students = Array.isArray(cls.students) ? cls.students.slice() : [];
  if (students.some((s) => normEmail(s.email) === email)) {
    throw new Error('Email sudah terdaftar.');
  }
  if (students.some((s) => normPhone(s.phone) === normPhone(phone))) {
    throw new Error('No. WhatsApp sudah terdaftar.');
  }

  const newStudent = {
    id: uid('std'),
    name, email, phone, password,
    role: 'pemain',
    registeredAt: Date.now(),
  };
  students.push(newStudent);

  await setSmart('classes', cls.id, { students });

  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }

  const user = {
    type: 'siswa',
    classId: cls.id,
    studentId: newStudent.id,
    name,
    role: 'pemain',
    email,
    phone,
  };
  setSession(user);

  const notifId = uid('notif');
  setSmart('notifications', notifId, {
    id: notifId,
    c
