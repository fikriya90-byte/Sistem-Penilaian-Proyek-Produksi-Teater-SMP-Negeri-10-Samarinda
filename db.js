/**
 * @file db.js
 * Wrapper Firestore dengan auto-failover Primary → Backup.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  deleteDoc, onSnapshot, query, orderBy, limit, where,
} from 'firebase/firestore';
import { FIREBASE_PRIMARY, FIREBASE_BACKUP } from './config.js';

let appPrimary = null;
let appBackup = null;
let dbPrimary = null;
let dbBackup = null;
let activeDb = 'primary';

function isQuotaError(err) {
  const msg = String(err?.message || err?.code || '').toLowerCase();
  return msg.includes('resource-exhausted') || msg.includes('quota') || msg.includes('429');
}

export function initFirebase() {
  if (getApps().length === 0) {
    appPrimary = initializeApp(FIREBASE_PRIMARY);
  } else {
    appPrimary = getApps()[0];
  }
  dbPrimary = getFirestore(appPrimary);

  try {
    appBackup = initializeApp(FIREBASE_BACKUP, 'backup');
    dbBackup = getFirestore(appBackup);
  } catch (e) {
    console.warn('[db] Backup Firebase gagal init:', e.message);
  }
  return dbPrimary;
}

export function getDb() {
  if (activeDb === 'backup' && dbBackup) return dbBackup;
  return dbPrimary;
}

export function getActiveDb() { return activeDb; }

export function forceSwitchToBackup() {
  if (!dbBackup) throw new Error('Backup tidak tersedia');
  activeDb = 'backup';
  console.warn('[db] Manual switch → backup');
}

export async function setSmart(col, id, data) {
  try {
    await setDoc(doc(getDb(), col, id), data, { merge: true });
    return true;
  } catch (err) {
    if (activeDb === 'primary' && isQuotaError(err) && dbBackup) {
      console.warn('[db] Primary quota → failover ke backup');
      activeDb = 'backup';
      await setDoc(doc(dbBackup, col, id), data, { merge: true });
      return true;
    }
    throw err;
  }
}

export async function getSmart(col, id) {
  try {
    const snap = await getDoc(doc(getDb(), col, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    if (activeDb === 'primary' && isQuotaError(err) && dbBackup) {
      activeDb = 'backup';
      const snap = await getDoc(doc(dbBackup, col, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }
    throw err;
  }
}

export async function listSmart(col, opts = {}) {
  const ref = collection(getDb(), col);
  const parts = [];
  if (opts.where) for (const [k, op, v] of opts.where) parts.push(where(k, op, v));
  if (opts.orderBy) parts.push(orderBy(opts.orderBy, opts.orderDir || 'asc'));
  if (opts.limit) parts.push(limit(opts.limit));
  const q = parts.length ? query(ref, ...parts) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function delSmart(col, id) {
  try {
    await deleteDoc(doc(getDb(), col, id));
    return true;
  } catch (err) {
    if (activeDb === 'primary' && isQuotaError(err) && dbBackup) {
      activeDb = 'backup';
      await deleteDoc(doc(dbBackup, col, id));
      return true;
    }
    throw err;
  }
}

export function watchSmart(col, id, callback) {
  const ref = id ? doc(getDb(), col, id) : collection(getDb(), col);
  return onSnapshot(ref, (snap) => {
    if (id) callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    else callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('[db] watch error:', err.message);
  });
}
