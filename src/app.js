/* ============================================================
   SP-PPT Main Application & Real-Time Sync Initialization
   ============================================================ */
window.DB = {
  stages: [],
  activeStages: {},
  classes: []
};

function openModal(title, htmlContent) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-body').innerHTML = htmlContent;
  document.getElementById('global-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('global-modal').style.display = 'none';
}

function showApp() {
  const content = document.getElementById('main-content');
  const targetClassId = Auth.getCid() || 'kelas-contoh';
  
  content.innerHTML = `
    <div class="card">
      <h3>Dashboard Utama SP-PPT</h3>
      <p style="margin: 10px 0;">Terhubung secara langsung ke Firestore (${DBService.activeFB.toUpperCase()}). Kelas Aktif: <b>${targetClassId}</b></p>
      <button class="btn" onclick="SPPPT.Tahapan.openMaster('${targetClassId}')">Buka Modul Tahapan (Live DB)</button>
    </div>
  `;
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Firebase & Failover Service
  DBService.init();

  // 2. Hubungkan Real-Time Listener dengan Firestore
  DBService.listenCollection('stages', (data) => {
    window.DB.stages = data;
    console.log('Data Stages disinkronkan dari Firestore:', data.length);
  });

  DBService.listenCollection('classes', (data) => {
    window.DB.classes = data;
    console.log('Data Classes disinkronkan dari Firestore:', data.length);
  });

  DBService.listenCollection('activeStages', (data) => {
    window.DB.activeStages = {};
    data.forEach(item => {
      window.DB.activeStages[item.id] = item;
    });
    console.log('Data Active Stages disinkronkan dari Firestore');
  });

  // 3. Render Tampilan Antarmuka
  setTimeout(() => {
    showApp();
  }, 600);
});
