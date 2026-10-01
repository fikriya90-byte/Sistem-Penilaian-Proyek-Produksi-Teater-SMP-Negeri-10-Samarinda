/**
 * @file nilai.js
 * Tahapan, rubrik, kalkulasi nilai, rekap, export CSV.
 */

import { esc, safeNum, safeRound, fmtDateShort, uid, todayISO } from '../core/utils.js';
import { RUBRIC_ASPECTS, EVALUATOR_WEIGHTS, DEFAULT_STAGES, ROLES } from '../core/config.js';
import { setSmart, getSmart, listSmart } from '../core/db.js';
import { getSession, getAllClasses } from '../auth/session.js';
import { toast, openModal, closeModal, confirmDialog, emptyState, alertBox, avatarHTML } from '../ui/shell.js';
import * as Guard from '../core/guard.js';

export async function loadStages(classId) {
  try {
    const custom = await getSmart('stages', classId);
    if (custom && Array.isArray(custom.list)) return custom.list;
  } catch { /* fallback */ }
  return DEFAULT_STAGES.map((s) => ({ ...s }));
}

export async function loadActiveStages(classId) {
  try {
    const active = await getSmart('activeStages', classId);
    return Array.isArray(active?.activeIds) ? active.activeIds : [];
  } catch { return []; }
}

export async function saveScore({ classId, targetId, stageId, values, comment = '' }) {
  const user = getSession();
  Guard.require(Guard.canEvaluate(user, null, classId), 'Anda tidak berhak menilai.');

  const scoreId = `$`{classId}__`${targetId}__$`{stageId}__`${user.studentId || user.email}`;
  const evaluatorType = Guard.isGuru(user) ? 'guru'
    : (Guard.isPimpinan(user) ? 'ketua' : 'rekan');

  await setSmart('scores', scoreId, {
    classId, targetId, stageId,
    evaluatorId: user.studentId || user.email,
    evaluatorName: user.name,
    evaluatorType,
    values,
    comment,
    updatedAt: Date.now(),
  });
  return scoreId;
}

export async function loadScores(classId) {
  try {
    return await listSmart('scores', { where: [['classId', '==', classId]] });
  } catch (err) {
    console.warn('[nilai] Gagal load scores:', err.message);
    return [];
  }
}

export function calcStageScore(scores, targetId, stageId) {
  const relevant = scores.filter((s) => s.targetId === targetId && s.stageId === stageId);
  const byType = { guru: [], ketua: [], rekan: [] };

  for (const sc of relevant) {
    const avg = avgRubric(sc.values);
    if (avg === null) continue;
    (byType[sc.evaluatorType] || byType.rekan).push(avg);
  }

  const meanOf = (arr) => arr.length === 0 ? null : safeRound(arr.reduce((a, b) => a + b, 0) / arr.length);
  const guru = meanOf(byType.guru);
  const ketua = meanOf(byType.ketua);
  const rekan = meanOf(byType.rekan);

  const weights = [];
  if (guru !== null) weights.push({ val: guru, w: EVALUATOR_WEIGHTS.guru });
  if (ketua !== null) weights.push({ val: ketua, w: EVALUATOR_WEIGHTS.ketua });
  if (rekan !== null) weights.push({ val: rekan, w: EVALUATOR_WEIGHTS.rekan });

  if (weights.length === 0) return { final: 0, breakdown: { guru, ketua, rekan }, count: 0 };

  const totalW = weights.reduce((a, p) => a + p.w, 0);
  const final = safeRound(weights.reduce((a, p) => a + p.val * (p.w / totalW), 0));
  return { final, breakdown: { guru, ketua, rekan }, count: relevant.length };
}

function avgRubric(values) {
  if (!values || typeof values !== 'object') return null;
  let sum = 0, wsum = 0;
  for (const aspect of RUBRIC_ASPECTS) {
    const v = safeNum(values[aspect.id], null);
    if (v === null) continue;
    sum += v * aspect.weight;
    wsum += aspect.weight;
  }
  return wsum > 0 ? safeRound(sum / wsum) : null;
}

export function calcFinalScore(scores, stages, targetId, activeIds) {
  const activeStages = stages.filter((s) => !activeIds || activeIds.includes(s.id));
  if (activeStages.length === 0) return 0;
  let totalWeight = 0, weighted = 0;
  for (const st of activeStages) {
    const { final } = calcStageScore(scores, targetId, st.id);
    weighted += final * st.weight;
    totalWeight += st.weight;
  }
  return totalWeight > 0 ? safeRound(weighted / totalWeight) : 0;
}

export async function openNilaiSaya() {
  const user = getSession();
  if (!user || user.type !== 'siswa') { toast('Hanya untuk siswa.', 'warning'); return; }

  openModal('Nilai Saya', '<div class="empty">Memuat…</div>');
  try {
    const stages = await loadStages(user.classId);
    const activeIds = await loadActiveStages(user.classId);
    const scores = await loadScores(user.classId);
    const activeStages = stages.filter((s) => activeIds.includes(s.id));

    if (activeStages.length === 0) {
      document.getElementById('modal-body').innerHTML = alertBox('Belum ada tahapan yang diaktifkan guru.', 'warning');
      return;
    }

    const finalScore = calcFinalScore(scores, stages, user.studentId, activeIds);

    let html = `
      <div class="card" style="text-align:center;background:linear-gradient(135deg,var(--primary-soft),var(--bg-elevated));">
        <p style="font-size:11.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Nilai Akhir</p>
        <p style="font-size:42px;font-weight:800;color:var(--primary);line-height:1;">$`{finalScore.toFixed(2)}</p>
        <p style
