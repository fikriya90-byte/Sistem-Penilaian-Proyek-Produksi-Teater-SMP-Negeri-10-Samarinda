/**
 * auth.js
 * Custom authentication (no Firebase Auth). Data user disimpan di /users.
 *
 * NOTE: Untuk demo password hash sederhana digunakan btoa('spppt:'+password).
 * This is NOT secure for production. Replace with secure hashing on backend.
 *
 * Exports:
 *  - registerUser
 *  - loginUser
 *  - logout
 *  - getCurrentUser
 *  - requireRole (throws if not logged-in or wrong role)
 */

import { getRef } from './firebase-init.js';

/**
 * Buat hash password demo
 * @param {string} password
 * @returns {string}
 */
function hashPassword(password) {
  return btoa('spppt:' + password);
}

/**
 * Registrasi user baru (siswa)
 * @param {Object} payload { nama, email, nomorWA, password, kelasId, peran }
 * @returns {Promise<Object>} created user object
 */
async function registerUser(payload) {
  try {
    const usersRef = getRef('users');
    // sederhana: cek email/nomorwa unique
    const snapshot = await usersRef.orderByChild('email').equalTo(payload.email).get();
    if (snapshot.exists()) throw new Error('Email sudah digunakan');

    const waSnap = await usersRef.orderByChild('nomorWA').equalTo(payload.nomorWA).get();
    if (waSnap.exists()) throw new Error('Nomor WhatsApp sudah digunakan');

    const newUserRef = usersRef.push();
    const uid = newUserRef.key;
    const userObj = {
      uid,
      nama: payload.nama,
      email: payload.email,
      nomorWA: payload.nomorWA,
      passwordHash: hashPassword(payload.password),
      role: payload.role || 'siswa',
      kelasId: payload.kelasId || null,
      peran: payload.peran || 'Pemain',
      aktif: true,
      createdAt: Date.now()
    };
    await newUserRef.set(userObj);

    // store session
    localStorage.setItem('spppt_current_user', JSON.stringify({ uid: uid, nama: userObj.nama, role: userObj.role, email: userObj.email }));
    return userObj;
  } catch (err) {
    throw err;
  }
}

/**
 * Login user (by email or nomorWA + password)
 * @param {string} identifier email atau nomorWA
 * @param {string} password
 * @returns {Promise<Object>} user
 */
async function loginUser(identifier, password) {
  try {
    const usersRef = getRef('users');
    // detect format
    const isEmail = identifier.includes('@');
    let snapshot;
    if (isEmail) {
      snapshot = await usersRef.orderByChild('email').equalTo(identifier).get();
    } else {
      snapshot = await usersRef.orderByChild('nomorWA').equalTo(identifier).get();
    }

    if (!snapshot.exists()) throw new Error('Akun tidak ditemukan');

    // snapshot may contain one entry
    let user = null;
    snapshot.forEach(child => {
      user = child.val();
    });

    if (!user) throw new Error('Akun tidak ditemukan');

    if (!user.aktif) throw new Error('Akun dinonaktifkan');

    const hash = hashPassword(password);
    if (user.passwordHash !== hash) throw new Error('Password salah');

    // Save simple session
    const session = {
      uid: user.uid,
      nama: user.nama,
      email: user.email,
      role: user.role,
      kelasId: user.kelasId || null,
      peran: user.peran || 'Pemain'
    };
    localStorage.setItem('spppt_current_user', JSON.stringify(session));
    return session;
  } catch (err) {
    throw err;
  }
}

/**
 * Logout
 */
function logout() {
  localStorage.removeItem('spppt_current_user');
}

/**
 * Ambil current user dari localStorage
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('spppt_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Pastikan user punya role, jika tidak throw Error.
 * @param {string|string[]} roles
 */
function requireRole(roles) {
  const user = getCurrentUser();
  if (!user) throw new Error('Silakan login terlebih dahulu');
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) throw new Error('Anda tidak memiliki akses ke halaman ini');
  return user;
}

export { registerUser, loginUser, logout, getCurrentUser, requireRole, hashPassword };