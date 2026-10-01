/**
 * @file nilai.js
 */
import { esc, safeNum, safeRound } from '../core/utils.js';
import { RUBRIC_ASPECTS, EVALUATOR_WEIGHTS, DEFAULT_STAGES } from '../core/config.js';
import { setSmart, getSmart, listSmart } from '../core/db.js';
import { getSession, getAllClasses } from '../auth/session.js';
import { toast, openModal, closeModal, alertBox } from '../ui/shell.js';
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
  const scoreId = `${classId}__${targetId}__${stageId}__${user.studentId || user.email}`;
  const evaluatorType = Guard.isGuru(user) ? 'guru'
    : (Guard.isPimpinan(user) ? 'ketua' : 'rekan');
  await setSmart('scores', scoreId, {
    classId, targetId, stageId,
    evaluatorId: user.studentId || user.email,
    evaluatorName: user.name,
    evaluatorType,
    values, comment,
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
      <div class="card" style="text-align:center;">
        <p style="font-size:11.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Nilai Akhir</p>
        <p style="font-size:42px;font-weight:800;color:var(--primary);line-height:1;">${finalScore.toFixed(2)}</p>
      </div>`;

    for (const st of activeStages) {
      const { final, breakdown } = calcStageScore(scores, user.studentId, st.id);
      html += `
        <div class="card">
          <h3 style="display:flex;justify-content:space-between;">
            <span>${esc(st.name)}</span>
            <span style="color:var(--primary);">${final.toFixed(2)}</span>
          </h3>
          <div style="font-size:11.5px;color:var(--text-muted);">
            Guru: ${breakdown.guru ?? '-'} · Ketua: ${breakdown.ketua ?? '-'} · Rekan: ${breakdown.rekan ?? '-'}
          </div>
        </div>`;
    }
    document.getElementById('modal-body').innerHTML = html;
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}

export async function openBeriNilai() {
  const user = getSession();
  const classId = user?.classId || user?.__viewClassId;
  if (!classId) { toast('Pilih kelas dulu.', 'warning'); return; }
  openModal('Beri Nilai', '<div class="empty">Memuat…</div>');
  try {
    const classes = await getAllClasses();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) { document.getElementById('modal-body').innerHTML = alertBox('Kelas tidak ditemukan.', 'danger'); return; }
    const stages = await loadStages(classId);
    const activeIds = await loadActiveStages(classId);
    const activeStages = stages.filter((s) => activeIds.includes(s.id));
    const students = (cls.students || []).filter((s) => s.id !== user.studentId);

    if (activeStages.length === 0 || students.length === 0) {
      document.getElementById('modal-body').innerHTML = alertBox('Belum ada tahapan aktif atau siswa.', 'warning');
      return;
    }

    document.getElementById('modal-body').innerHTML = `
      <div class="field"><label>Tahapan</label>
        <select id="bn-stage">${activeStages.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Yang Dinilai</label>
        <select id="bn-target">${students.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
      </div>
      ${RUBRIC_ASPECTS.map((a) => `
        <div class="field">
          <label>${esc(a.name)} (0-100)</label>
          <input type="number" min="0" max="100" data-aspect="${a.id}" value="80">
        </div>`).join('')}
      <button class="btn btn-primary btn-block" id="bn-save">Simpan Nilai</button>`;

    document.getElementById('bn-save').addEventListener('click', async () => {
      const stageId = document.getElementById('bn-stage').value;
      const targetId = document.getElementById('bn-target').value;
      const values = {};
      document.querySelectorAll('[data-aspect]').forEach((inp) => {
        values[inp.getAttribute('data-aspect')] = safeNum(inp.value, 0);
      });
      try {
        await saveScore({ classId, targetId, stageId, values });
        toast('Nilai tersimpan.', 'success');
        closeModal();
      } catch (err) { toast('Gagal: ' + err.message, 'error'); }
    });
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}

export async function openRekapNilai() {
  const user = getSession();
  const classId = user?.__viewClassId || user?.classId;
  if (!classId) { toast('Pilih kelas dulu.', 'warning'); return; }
  openModal('Rekap Nilai', '<div class="empty">Memuat…</div>');
  try {
    const classes = await getAllClasses();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) { document.getElementById('modal-body').innerHTML = alertBox('Kelas tidak ditemukan.', 'danger'); return; }
    const stages = await loadStages(classId);
    const activeIds = await loadActiveStages(classId);
    const scores = await loadScores(classId);
    const students = cls.students || [];
    const shownStages = stages.filter((s) => activeIds.includes(s.id));

    if (shownStages.length === 0) {
      document.getElementById('modal-body').innerHTML = alertBox('Belum ada tahapan aktif.', 'warning');
      return;
    }

    let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12.5px;">';
    html += '<thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border);">Nama</th>';
    for (const st of shownStages) {
      html += `<th style="padding:6px;border-bottom:2px solid var(--border);">${esc(st.name)}</th>`;
    }
    html += '<th style="padding:6px;border-bottom:2px solid var(--border);">Akhir</th></tr></thead><tbody>';
    for (const s of students) {
      html += `<tr><td style="padding:6px;border-bottom:1px solid var(--border);">${esc(s.name)}</td>`;
      for (const st of shownStages) {
        const { final } = calcStageScore(scores, s.id, st.id);
        html += `<td style="padding:6px;border-bottom:1px solid var(--border);text-align:center;">${final.toFixed(1)}</td>`;
      }
      const finalScore = calcFinalScore(scores, stages, s.id, activeIds);
      html += `<td style="padding:6px;border-bottom:1px solid var(--border);text-align:center;font-weight:700;color:var(--primary);">${finalScore.toFixed(2)}</td></tr>`;
    }
    html += '</tbody></table></div>';
    document.getElementById('modal-body').innerHTML = html;
  } catch (err) {
    document.getElementById('modal-body').innerHTML = alertBox('Gagal: ' + err.message, 'danger');
  }
}