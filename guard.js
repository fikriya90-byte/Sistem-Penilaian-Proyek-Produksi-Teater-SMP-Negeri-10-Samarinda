/**
 * @file guard.js
 * Lapis otorisasi client-side — mirror dari Firestore Rules.
 */

import { ROLES } from './config.js';

export function userType(user) { return user?.type || null; }
export function isAdmin(user) { return userType(user) === 'admin'; }
export function isGuru(user)  { return userType(user) === 'guru' || isAdmin(user); }
export function isSiswa(user) { return userType(user) === 'siswa'; }

export function hasRole(user, ...roles) {
  if (!user?.role) return false;
  const all = Array.isArray(user.role) ? user.role : [user.role];
  return roles.some((r) => all.includes(r));
}

export function isKoordinator(user) {
  if (!user?.role) return false;
  const all = Array.isArray(user.role) ? user.role : [user.role];
  return all.some((r) => ROLES[r]?.koordinator === true);
}

export function isPimpinan(user) {
  return hasRole(user, 'pimpinan_produksi', 'sutradara');
}

export function ownsClass(user, classId) {
  if (isAdmin(user)) return true;
  return user?.classId === classId;
}

export function teachesClass(user, classData) {
  if (isAdmin(user)) return true;
  if (!isGuru(user) || !classData) return false;
  return classData.teacherId === user.email || classData.teacherEmail === user.email;
}

export function canEvaluate(user, targetRole, targetClassId) {
  if (isAdmin(user)) return true;
  if (isGuru(user)) return true;
  if (!ownsClass(user, targetClassId)) return false;
  if (isPimpinan(user)) return true;

  const myRoles = Array.isArray(user.role) ? user.role : [user.role].filter(Boolean);
  for (const r of myRoles) {
    const meta = ROLES[r];
    if (!meta) continue;
    if (meta.koordinator) {
      const targetMeta = ROLES[targetRole];
      if (targetMeta && targetMeta.divisi === meta.divisi && targetMeta.level > meta.level) return true;
    }
  }
  return false;
}

export function canActivateStage(user, classId) {
  if (isGuru(user)) return true;
  if (!ownsClass(user, classId)) return false;
  return isPimpinan(user);
}

export function canManageStructure(user, classId) {
  if (isGuru(user)) return true;
  if (!ownsClass(user, classId)) return false;
  return isPimpinan(user);
}

export function canDeleteScore(user) { return isGuru(user); }

export function canUploadOthersPhoto(user) { return isGuru(user); }

export function canManageMasterSchedule(user, classId) {
  if (isGuru(user)) return true;
  if (!ownsClass(user, classId)) return false;
  return isPimpinan(user);
}

export function canApproveBooking(user) { return isGuru(user); }

export function canMarkAttendance(user, classId) {
  if (isGuru(user)) return true;
  if (!ownsClass(user, classId)) return false;
  return isKoordinator(user) || isPimpinan(user);
}

export function require(condition, message = 'Tidak diizinkan') {
  if (!condition) throw new Error(message);
}
