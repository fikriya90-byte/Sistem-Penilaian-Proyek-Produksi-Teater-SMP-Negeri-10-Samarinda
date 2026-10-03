/**
 * api.js
 * Wrapper helper untuk operasi Realtime Database
 *
 * Exports: users, kelas, grades, attendance, schedules, broadcast, info, logs helpers
 */

import { getRef } from './firebase-init.js';
import { GRADING_WEIGHTS } from './config.js';

/** Helper read once */
async function dbGet(path) {
  const ref = getRef(path);
  const snap = await ref.get();
  return snap.exists() ? snap.val() : null;
}

/** Helper set */
async function dbSet(path, data) {
  const ref = getRef(path);
  await ref.set(data);
  return true;
}

/** Helper update */
async function dbUpdate(path, data) {
  const ref = getRef(path);
  await ref.update(data);
  return true;
}

/** Helper push */
async function dbPush(path, data) {
  const ref = getRef(path);
  const newRef = ref.push();
  await newRef.set(data);
  return newRef.key;
}

/** Helper remove */
async function dbRemove(path) {
  const ref = getRef(path);
  await ref.remove();
  return true;
}

/* ===========================
   Users
   =========================== */

/**
 * Ambil user by uid
 * @param {string} uid
 */
async function getUserByUid(uid) {
  return await dbGet(`users/${uid}`);
}

/**
 * Ambil semua user di kelas tertentu (optional)
 * @param {string|null} kelasId
 */
async function listUsers(kelasId = null) {
  const all = await dbGet('users') || {};
  if (!kelasId) return all;
  const filtered = {};
  Object.keys(all).forEach(k => {
    if (all[k].kelasId === kelasId) filtered[k] = all[k];
  });
  return filtered;
}

/* ===========================
   Kelas & Struktur
   =========================== */

async function getKelas(kelasId) {
  return await dbGet(`kelas/${kelasId}`);
}

async function listKelas() {
  return await dbGet('kelas') || {};
}

/* ===========================
   Penilaian (grades)
   Structure: /penilaian/{kelasId}/{siswaId}/{tahapan}/{penilaiRole}
   =========================== */

/**
 * Save grade for a specific penilai role (guru/ketua/rekan)
 * @param {string} kelasId
 * @param {string} siswaId
 * @param {string} tahapan
 * @param {string} penilaiRole 'guru'|'ketua'|'rekan'
 * @param {Object} aspek { pengetahuan, keterampilan, kolaborasi, inisiatif, konsistensi, komentar }
 */
async function saveGrade(kelasId, siswaId, tahapan, penilaiRole, aspek) {
  if (!['guru','ketua','rekan'].includes(penilaiRole)) throw new Error('Role penilai tidak valid');
  const path = `penilaian/${kelasId}/${siswaId}/${tahapan}/${penilaiRole}`;
  const payload = {
    ...aspek,
    tanggalInput: Date.now(),
    status: 'submitted'
  };
  await dbSet(path, payload);

  // recalc nilai akhir per tahapan
  await recalcFinal(kelasId, siswaId, tahapan);
  return true;
}

/**
 * Kalkulasi nilai akhir per aspek, per tahapan:
 * final = guru*0.6 + ketua*0.25 + rekan*0.15 per aspek -> rata-rata
 */
async function recalcFinal(kelasId, siswaId, tahapan) {
  const basePath = `penilaian/${kelasId}/${siswaId}/${tahapan}`;
  const data = await dbGet(basePath) || {};
  const guru = data.guru || {};
  const ketua = data.ketua || {};
  const rekan = data.rekan || {};

  const aspekList = ['pengetahuan','keterampilan','kolaborasi','inisiatif','konsistensi'];

  const nilaiAkhir = {};
  let total = 0;
  let count = 0;
  for (const aspek of aspekList) {
    const g = Number(guru[aspek]) || 0;
    const k = Number(ketua[aspek]) || 0;
    const r = Number(rekan[aspek]) || 0;
    const v = +(g * GRADING_WEIGHTS.guru + k * GRADING_WEIGHTS.ketua + r * GRADING_WEIGHTS.rekan).toFixed(2);
    nilaiAkhir[aspek] = v;
    total += v;
    count++;
  }
  const rataRata = count ? +(total / count).toFixed(2) : 0;
  await dbUpdate(basePath, { nilaiAkhir: { ...nilaiAkhir, rataRata }, lastUpdated: Date.now() });
  return { nilaiAkhir, rataRata };
}

async function getGradesForClass(kelasId, tahapan = null) {
  const path = `penilaian/${kelasId}`;
  const data = await dbGet(path) || {};
  if (!tahapan) return data;
  const filtered = {};
  Object.keys(data).forEach(sId => {
    if (data[sId][tahapan]) filtered[sId] = data[sId][tahapan];
  });
  return filtered;
}

/* ===========================
   Absensi
   =========================== */

/**
 * Create attendance
 * types: 'umum' | 'latihan' | 'divisi'
 * If latihan: auto-include pemain + tata_musik roles
 * If divisi: data.divisiId must be present, include members
 */
async function createAttendance(kelasId, type, data, createdBy) {
  // pull students list
  const students = await dbGet(`kelas/${kelasId}/siswaList`) || {};
  const participants = {};

  if (type === 'latihan') {
    // include pemain & tata_musik
    Object.values(students).forEach(s => {
      const role = (s.peran || '').toLowerCase();
      const divisi = (s.divisi || '').toLowerCase();
      if (role.includes('pemain') || divisi === 'tata musik' || role.includes('musik')) {
        participants[s.siswaID] = { status: 'belum', nama: s.nama || s.siswaID };
      }
    });
  } else if (type === 'divisi') {
    const divId = data.divisiId;
    Object.values(students).forEach(s => {
      if ((s.divisi || '') === divId) {
        participants[s.siswaID] = { status: 'belum', nama: s.nama || s.siswaID };
      }
    });
  } else {
    // umum: include all, flexible
    Object.values(students).forEach(s => {
      participants[s.siswaID] = { status: 'belum', nama: s.nama || s.siswaID };
    });
  }

  const attId = 'ABS' + Date.now();
  const payload = {
    id: attId,
    namaKegiatan: data.namaKegiatan || 'Kegiatan',
    tanggal: data.tanggal || new Date().toISOString().split('T')[0],
    waktu: { mulai: data.waktuMulai || '', selesai: data.waktuSelesai || '' },
    lokasi: data.lokasi || '',
    jenisAbsensi: type,
    peserta: participants,
    pesertaOtomatis: { terkunci: type !== 'umum', totalExpected: Object.keys(participants).length },
    createdBy: createdBy || 'system',
    createdAt: Date.now(),
    status: 'open'
  };
  await dbSet(`absensi/${kelasId}/${attId}`, payload);
  return payload;
}

/**
 * Mark attendance status for student
 */
async function markAttendance(kelasId, attId, siswaId, status, keterangan = '') {
  const path = `absensi/${kelasId}/${attId}/peserta/${siswaId}`;
  await dbUpdate(path, { status, keterangan, waktuIsi: Date.now() });
  return true;
}

/* ===========================
   Schedules
   =========================== */

async function createSchedule(kelasId, data, createdBy) {
  const schId = 'SCH' + Date.now();
  const payload = {
    id: schId,
    name: data.name,
    tanggal: data.tanggal,
    waktu: { mulai: data.waktuMulai, selesai: data.waktuSelesai },
    lokasi: data.lokasi || '',
    peserta: data.peserta || [],
    confirmations: (data.peserta || []).reduce((acc, pid) => { acc[pid] = 'pending'; return acc; }, {}),
    reminder: data.reminder || [1440, 720, 60],
    createdBy,
    createdAt: Date.now()
  };
  await dbSet(`jadwal/${kelasId}/${schId}`, payload);
  return payload;
}

async function confirmSchedule(kelasId, scheduleId, siswaId, status = 'confirmed') {
  await dbSet(`jadwal/${kelasId}/${scheduleId}/confirmations/${siswaId}`, status);
  return true;
}

/* ===========================
   Broadcast / Pengumuman
   =========================== */

async function createBroadcast(kelasId, payload) {
  const id = 'BC' + Date.now();
  const obj = {
    id,
    pengirimNama: payload.pengirimNama,
    pengirimID: payload.pengirimID,
    judul: payload.judul,
    pesan: payload.pesan,
    tipeTarget: payload.tipeTarget || 'semua',
    target: payload.target || {},
    tipeKirim: payload.tipeKirim || ['in-app'],
    dibacaOleh: {},
    createdAt: Date.now()
  };
  await dbSet(`broadcast/${kelasId}/${id}`, obj);
  return obj;
}

/* ===========================
   Informasi Umum & Dokumen
   =========================== */

async function uploadInfo(kelasId, info) {
  const id = 'INFO' + Date.now();
  const obj = {
    id,
    judul: info.judul,
    kategori: info.kategori || 'lainnya',
    deskripsi: info.deskripsi || '',
    fileURL: info.fileURL || '',
    visibleUntuk: info.visibleUntuk || 'semua',
    createdBy: info.createdBy || 'system',
    createdAt: Date.now()
  };
  await dbSet(`informasi/${kelasId}/${id}`, obj);
  return obj;
}

/* ===========================
   Activity Logs
   =========================== */

async function logActivity(kelasId, action, details = {}) {
  const id = 'LOG' + Date.now();
  const obj = {
    id,
    kelasId,
    action,
    details,
    timestamp: Date.now()
  };
  await dbSet(`logs/${kelasId}/${id}`, obj);
  return obj;
}

export {
  dbGet, dbSet, dbUpdate, dbPush, dbRemove,
  getUserByUid, listUsers,
  getKelas, listKelas,
  saveGrade, getGradesForClass, recalcFinal,
  createAttendance, markAttendance,
  createSchedule, confirmSchedule,
  createBroadcast,
  uploadInfo,
  logActivity
};