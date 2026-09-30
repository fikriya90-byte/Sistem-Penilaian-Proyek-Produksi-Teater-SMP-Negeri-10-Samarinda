/* ============================================================
   SP-PPT features-docs.js — v2.0 FINAL
   Fitur:
   1. Templates Shared (pusat — guru edit, siswa pakai)
   2. Dokumen Saya (siswa)
   3. Kelola Template (guru — assign per peran)
   4. Upload/Download hasil kerja
   5. Naskah
   6. GDrive Links
   7. Dokumen per Siswa (guru)
   ============================================================ */
(function(){
'use strict';

if (!window.DB || !window.ico){ console.warn('[features-docs] app.js belum di-load.'); return; }

/* ============================================================
   HELPERS
   ============================================================ */
function ic(n, s){ return window.ico ? window.ico(n, s) : ''; }
function esc(s){ return window.esc ? window.esc(s) : String(s==null?'':s); }
function uid(){ return window.uid ? window.uid() : ('id_'+Date.now().toString(36)); }
function u(){ return window.currentUser || {}; }
function uType(){ return String(u().type||'').toLowerCase(); }
function uRole(){ return String(u().role||'').toLowerCase(); }
function uCid(){ return u().classId || window.__currentViewClassId || null; }
function uSid(){ return u().studentId || null; }
function isGuru(){ return uType()==='guru' || uType()==='admin'; }
function isSiswa(){ return uType()==='siswa'; }
function openModal(t, b){ if (window.openModal) window.openModal(t, b); }
function closeModal(){ if (window.closeModal) window.closeModal(); }
function findClass(cid){ return (window.DB.classes||[]).find(function(x){ return x.id === cid; }); }
function logAct(t, m, k){ if (window.logActivity) window.logActivity(t, m, k); }
function roleLabel(r){ return (window.ROLES && window.ROLES[r] && window.ROLES[r].label) || r; }
function fmtDateShort(s){ if (!s) return '-'; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); }
function fmtDateTime(ts){ if (!ts) return '-'; return new Date(ts).toLocaleString('id-ID'); }

/* ============================================================
   MASTER TEMPLATE — 11 TEMPLATE PROFESIONAL
   ============================================================ */
var MASTER_TEMPLATES = [
  {
    key:'rundown', title:'Rundown Acara Pertunjukan',
    defaultRoles:['pimpinan_produksi','sekretaris'],
    desc:'Susunan acara hari-H dengan timeline lengkap.',
    content:
      'RUNDOWN ACARA PERTUNJUKAN TEATER\n' +
      '=========================================\n\n' +
      'ALOKASI TOTAL: 45 MENIT\n' +
      '(10 menit pembukaan + 30 menit pertunjukan + 5 menit penutup)\n\n' +
      '---------------------------------------------------------\n' +
      'SESI PRA-ACARA (15 menit sebelum mulai)\n' +
      '---------------------------------------------------------\n' +
      'Kegiatan: Persiapan panitia, sound check, penataan panggung\n' +
      'PIC     : Koor Tata Musik, Koor Tata Pentas\n\n' +
      '---------------------------------------------------------\n' +
      'SESI PEMBUKAAN (10 MENIT)\n' +
      '---------------------------------------------------------\n' +
      '1. Pembukaan MC                              (1 menit)\n' +
      '2. Menyanyikan Lagu Kebudayaan               (3 menit)\n' +
      '3. Sambutan Kepala Sekolah / Pembina         (3 menit)\n' +
      '4. Sambutan Pimpinan Produksi                (2 menit)\n' +
      '5. Doa Bersama                               (1 menit)\n\n' +
      '---------------------------------------------------------\n' +
      'SESI INTI PERTUNJUKAN TEATER (30 MENIT)\n' +
      '---------------------------------------------------------\n' +
      'Adegan 1 : [Judul Adegan]    (5 menit)\n' +
      'Adegan 2 : [Judul Adegan]    (5 menit)\n' +
      'Adegan 3 : [Judul Adegan]    (7 menit)\n' +
      'Adegan 4 : [Judul Adegan]    (5 menit)\n' +
      'Adegan 5 : [Klimaks/Resolusi](8 menit)\n\n' +
      '---------------------------------------------------------\n' +
      'SESI PENUTUPAN & APRESIASI (5 MENIT)\n' +
      '---------------------------------------------------------\n' +
      '1. Curtain Call / Hormat Pemain             (2 menit)\n' +
      '2. Apresiasi & Foto Bersama                 (2 menit)\n' +
      '3. Penutupan MC                             (1 menit)\n\n' +
      '---------------------------------------------------------\n' +
      'KETERANGAN PIC (Penanggung Jawab):\n' +
      '---------------------------------------------------------\n' +
      'MC          : _________________________\n' +
      'Sound       : _________________________\n' +
      'Lighting    : _________________________\n' +
      'Stage Manager: _______________________\n' +
      'Dokumentasi : _________________________\n\n' +
      'Disusun oleh : ___________________\n' +
      'Tanggal      : ___________________'
  },
  {
    key:'proposal', title:'Proposal Kegiatan Produksi',
    defaultRoles:['sekretaris'],
    desc:'Proposal lengkap untuk izin & sponsorship.',
    content:
      'PROPOSAL KEGIATAN PRODUKSI TEATER\n' +
      '=========================================\n\n' +
      'I. LATAR BELAKANG\n' +
      '---------------------------------------------------------\n' +
      'Teater merupakan salah satu bentuk seni pertunjukan yang\n' +
      'menggabungkan seni peran, sastra, musik, tari, dan seni rupa\n' +
      'dalam satu kesatuan pertunjukan yang utuh.\n\n' +
      '[Tuliskan konteks budaya/kesenian yang diangkat]\n\n' +
      'Melalui kegiatan ini, diharapkan siswa dapat:\n' +
      '- Mempelajari dan melestarikan seni budaya\n' +
      '- Mengembangkan kreativitas dan kerja sama tim\n' +
      '- Memperkuat rasa cinta terhadap kesenian tradisional\n\n' +
      'II. TUJUAN & SASARAN\n' +
      '---------------------------------------------------------\n' +
      'TUJUAN:\n' +
      '1. Menyelenggarakan pertunjukan teater berkualitas\n' +
      '2. Memperkenalkan seni budaya kepada generasi muda\n' +
      '3. Melatih kerja sama tim dan manajemen produksi\n\n' +
      'SASARAN:\n' +
      'Seluruh siswa/i SMP Negeri 10 Samarinda, guru, tenaga\n' +
      'kependidikan, orang tua/wali murid, dan masyarakat umum.\n\n' +
      'III. TEMA & KONSEP PEMENTASAN\n' +
      '---------------------------------------------------------\n' +
      'JUDUL      : _______________________________\n' +
      'TEMA       : _______________________________\n' +
      'PESAN MORAL: _______________________________\n' +
      'DURASI     : 30 menit (5 adegan)\n' +
      'GAYA       : Tradisional / Kontemporer / Modern\n' +
      'PENDEKATAN : Realis / Non-Realis\n\n' +
      'IV. SUSUNAN KEPANITIAAN (KERABAT KERJA)\n' +
      '---------------------------------------------------------\n' +
      'Pembina          : ___________________________\n' +
      'Pimpinan Produksi: ___________________________\n' +
      'Sutradara        : ___________________________\n' +
      'Asisten Sutradara: ___________________________\n' +
      'Sekretaris       : ___________________________\n' +
      'Bendahara        : ___________________________\n' +
      'Koor Publikasi   : ___________________________\n' +
      'Koor Perlengkapan: ___________________________\n' +
      'Koor Tata Pentas : ___________________________\n' +
      'Koor Tata Musik  : ___________________________\n' +
      'Koor Tata Busana : ___________________________\n' +
      'Koor Tata Rias   : ___________________________\n' +
      'Pemeran          : ___________________________\n\n' +
      'V. RENCANA ANGGARAN BIAYA (RAB)\n' +
      '---------------------------------------------------------\n' +
      'PEMASUKAN:\n' +
      '1. Kas Kelas               : Rp _________________\n' +
      '2. Sponsor/Donatur         : Rp _________________\n' +
      '3. Dana Sekolah            : Rp _________________\n' +
      '   TOTAL PEMASUKAN         : Rp _________________\n\n' +
      'PENGELUARAN:\n' +
      '1. Dekorasi & Panggung     : Rp _________________\n' +
      '2. Kostum & Aksesoris      : Rp _________________\n' +
      '3. Tata Rias               : Rp _________________\n' +
      '4. Properti & Alat         : Rp _________________\n' +
      '5. Publikasi & Dokumentasi : Rp _________________\n' +
      '6. Konsumsi                : Rp _________________\n' +
      '   TOTAL PENGELUARAN       : Rp _________________\n\n' +
      'SALDO AKHIR : Rp _________________\n\n' +
      'VI. PENUTUP & LEMBAR PENGESAHAN\n' +
      '---------------------------------------------------------\n' +
      'Demikian proposal ini kami susun. Besar harapan kami\n' +
      'atas dukungan semua pihak demi suksesnya kegiatan ini.\n\n\n' +
      'Samarinda, ______________\n\n\n' +
      'Pimpinan Produksi     Sutradara     Pembina/Guru\n\n\n' +
      '_________________  ___________  _______________'
  },
  {
    key:'lpj_keuangan', title:'LPJ Keuangan Pertunjukan',
    defaultRoles:['bendahara'],
    desc:'Laporan pertanggungjawaban keuangan lengkap.',
    content:
      'LAPORAN PERTANGGUNGJAWABAN KEUANGAN\n' +
      'PERTUNJUKAN TEATER\n' +
      '=========================================\n\n' +
      'I. PENDAHULUAN\n' +
      '---------------------------------------------------------\n' +
      'Laporan ini dibuat sebagai bentuk pertanggungjawaban\n' +
      'keuangan atas kegiatan pertunjukan teater yang telah\n' +
      'dilaksanakan pada:\n\n' +
      'Tanggal : ______________________\n' +
      'Lokasi  : ______________________\n' +
      'Judul   : ______________________\n\n' +
      'II. REKAPITULASI PEMASUKAN\n' +
      '---------------------------------------------------------\n' +
      'No | Sumber Dana       | Jumlah\n' +
      '---|-------------------|----------------\n' +
      '1  | Kas Kelas         | Rp ____________\n' +
      '2  | Iuran Siswa       | Rp ____________\n' +
      '3  | Sponsor           | Rp ____________\n' +
      '4  | Donatur           | Rp ____________\n' +
      '5  | Dana Sekolah      | Rp ____________\n' +
      '   | TOTAL PEMASUKAN   | Rp ____________\n\n' +
      'III. REKAPITULASI PENGELUARAN\n' +
      '---------------------------------------------------------\n' +
      'DIVISI PRODUKSI:\n' +
      '- Publikasi & Dokumentasi  : Rp ____________\n' +
      '- Perlengkapan             : Rp ____________\n' +
      '- Akomodasi & Transportasi : Rp ____________\n' +
      '   Subtotal                : Rp ____________\n\n' +
      'DIVISI ARTISTIK:\n' +
      '- Tata Panggung            : Rp ____________\n' +
      '- Tata Musik               : Rp ____________\n' +
      '- Tata Busana              : Rp ____________\n' +
      '- Tata Rias                : Rp ____________\n' +
      '- Properti                 : Rp ____________\n' +
      '   Subtotal                : Rp ____________\n\n' +
      'KONSUMSI & LAIN-LAIN:\n' +
      '- Konsumsi panitia         : Rp ____________\n' +
      '- Lain-lain                : Rp ____________\n' +
      '   Subtotal                : Rp ____________\n\n' +
      'TOTAL PENGELUARAN           : Rp ____________\n\n' +
      'IV. SALDO AKHIR\n' +
      '---------------------------------------------------------\n' +
      'Total Pemasukan   : Rp ____________\n' +
      'Total Pengeluaran : Rp ____________\n' +
      'SALDO AKHIR       : Rp ____________\n\n' +
      'V. LAMPIRAN\n' +
      '---------------------------------------------------------\n' +
      '[   ] Foto / Scan semua nota pembelian\n' +
      '[   ] Foto fisik barang yang dibeli\n' +
      '[   ] Rekap kas mingguan\n' +
      '[   ] Bukti transfer (jika ada)\n\n\n' +
      'Disusun oleh,\n\n' +
      'Bendahara\n\n' +
      '___________________'
  },
  {
    key:'scene_breakdown', title:'Scene Breakdown (Bedah Adegan)',
    defaultRoles:['sutradara'],
    desc:'Analisis mendalam setiap adegan.',
    content:
      'SCENE BREAKDOWN (BEDAH ADEGAN)\n' +
      '=========================================\n\n' +
      'ANALISIS ADEGAN\n\n' +
      '----------------------------------------------------------------\n' +
      'No | Adegan     | Lokasi/Setting | Tokoh Terlibat | Durasi\n' +
      '----------------------------------------------------------------\n' +
      '1  |            |                |                |\n' +
      '2  |            |                |                |\n' +
      '3  |            |                |                |\n' +
      '4  |            |                |                |\n' +
      '5  |            |                |                |\n' +
      '----------------------------------------------------------------\n\n' +
      'PROPERTI & KEBUTUHAN ARTISTIK\n' +
      '----------------------------------------------------------------\n' +
      'Adegan | Properti | Tata Panggung | Tata Musik | Cahaya\n' +
      '----------------------------------------------------------------\n' +
      '1      |          |               |            |\n' +
      '2      |          |               |            |\n' +
      '3      |          |               |            |\n' +
      '4      |          |               |            |\n' +
      '5      |          |               |            |\n' +
      '----------------------------------------------------------------\n\n' +
      'CATATAN EMOSI / BLOCKING SUTRADARA PER ADEGAN:\n\n' +
      'Adegan 1:\n' +
      '- Emosi dominan   : ____________________\n' +
      '- Blocking utama  : ____________________\n' +
      '- Catatan khusus  : ____________________\n\n' +
      'Adegan 2:\n' +
      '- Emosi dominan   : ____________________\n' +
      '- Blocking utama  : ____________________\n' +
      '- Catatan khusus  : ____________________\n\n' +
      '(Lampirkan sketsa blocking di halaman berikutnya)\n\n\n' +
      'Disusun oleh,\n\n' +
      'Sutradara\n\n' +
      '___________________'
  },
  {
    key:'call_sheet', title:'Call Sheet Latihan/Show',
    defaultRoles:['asisten_sutradara'],
    desc:'Jadwal harian & daftar hadir untuk sesi latihan/pertunjukan.',
    content:
      'CALL SHEET LATIHAN / PERTUNJUKAN\n' +
      '=========================================\n\n' +
      'HARI / TANGGAL : ____________________\n' +
      'WAKTU MULAI    : ____________________\n' +
      'WAKTU SELESAI  : ____________________\n' +
      'LOKASI         : ____________________\n' +
      'JENIS SESI     : Latihan / Gladi / Show\n\n' +
      '---------------------------------------------------------\n' +
      'DAFTAR HADIR WAJIB\n' +
      '---------------------------------------------------------\n' +
      'PEMAIN:\n' +
      '1. _______________________________\n' +
      '2. _______________________________\n' +
      '3. _______________________________\n' +
      '4. _______________________________\n' +
      '(lampirkan daftar lengkap)\n\n' +
      'KRU TEKNIS:\n' +
      '1. Koor Tata Musik    : _________________\n' +
      '2. Koor Tata Panggung : _________________\n' +
      '3. Koor Tata Cahaya   : _________________\n' +
      '4. Koor Tata Busana   : _________________\n' +
      '5. Koor Tata Rias     : _________________\n' +
      '6. Koor Perlengkapan  : _________________\n\n' +
      '---------------------------------------------------------\n' +
      'AGENDA SESI\n' +
      '---------------------------------------------------------\n' +
      '1. Pemanasan (Olah Tubuh/Suara/Rasa) : 10 menit\n' +
      '2. Reading / Review Hafalan          : 15 menit\n' +
      '3. Latihan Adegan 1-2                : 20 menit\n' +
      '4. Latihan Adegan 3-4                : 20 menit\n' +
      '5. Evaluasi & Catatan                : 10 menit\n\n' +
      '---------------------------------------------------------\n' +
      'KONTAK DARURAT (PIC)\n' +
      '---------------------------------------------------------\n' +
      'Pimpinan Produksi : _________________\n' +
      'Sutradara         : _________________\n' +
      'Asisten Sutradara : _________________\n' +
      'No. HP PIC        : _________________\n\n' +
      'CATATAN KHUSUS:\n' +
      '_____________________________________________\n' +
      '_____________________________________________\n\n\n' +
      'Dibuat oleh,\n\n' +
      'Asisten Sutradara\n\n' +
      '___________________'
  },
  {
    key:'matriks_busana', title:'Matriks Busana & Kostum',
    defaultRoles:['koor_busana','anggota_busana'],
    desc:'Tabel lengkap kostum tiap tokoh.',
    content:
      'MATRIKS BUSANA & KOSTUM\n' +
      '=========================================\n\n' +
      'TABEL KOSTUM:\n\n' +
      '----------------------------------------------------------------\n' +
      'No | Tokoh | Pemeran | Atasan | Bawahan | Aksesoris | Status\n' +
      '----------------------------------------------------------------\n' +
      '1  |       |         |        |         |           |\n' +
      '2  |       |         |        |         |           |\n' +
      '3  |       |         |        |         |           |\n' +
      '4  |       |         |        |         |           |\n' +
      '5  |       |         |        |         |           |\n' +
      '----------------------------------------------------------------\n\n' +
      'Status: Belum / Siap / Perlu Dicuci / Rusak\n\n' +
      'DETAIL DESAIN:\n\n' +
      'Tokoh 1: _______________________\n' +
      '- Warna dominan   : ___________________\n' +
      '- Kesan visual    : ___________________\n' +
      '- Referensi gambar : ___________________\n' +
      '- Catatan perawatan : __________________\n\n' +
      'Tokoh 2: _______________________\n' +
      '- Warna dominan   : ___________________\n' +
      '- Kesan visual    : ___________________\n' +
      '- Referensi gambar : ___________________\n' +
      '- Catatan perawatan : __________________\n\n' +
      '(Lampirkan moodboard/referensi)\n\n' +
      'CHECKLIST PERAWATAN:\n' +
      '[   ] Cuci bersih sebelum show\n' +
      '[   ] Setrika & gantung rapi\n' +
      '[   ] Pasang label nama tokoh\n' +
      '[   ] Susun di rak berdasarkan urutan adegan\n' +
      '[   ] Siapkan cadangan (backup) untuk adegan cepat\n\n\n' +
      'Disusun oleh,\n\n' +
      'Koor Tata Busana\n\n' +
      '___________________'
  },
  {
    key:'face_chart', title:'Face Chart Rias & Make-up',
    defaultRoles:['koor_rias','anggota_rias'],
    desc:'Panduan tata rias per tokoh.',
    content:
      'FACE CHART RIAS & MAKE-UP\n' +
      '=========================================\n\n' +
      'PANDUAN TATA RIAS PER TOKOH:\n\n' +
      '----------------------------------------------------------------\n' +
      'No | Tokoh | Karakter | Kesan Visual | Palette Warna\n' +
      '----------------------------------------------------------------\n' +
      '1  |       |          |              |\n' +
      '2  |       |          |              |\n' +
      '3  |       |          |              |\n' +
      '4  |       |          |              |\n' +
      '----------------------------------------------------------------\n\n' +
      'Kesan Visual: Tua / Muda / Antagonis / Protagonis / Netral\n\n' +
      'DETAIL PER TOKOH:\n\n' +
      'Tokoh 1: _______________________\n' +
      '- Karakter      : ___________________\n' +
      '- Warna dasar   : ___________________\n' +
      '- Shading       : ___________________\n' +
      '- Detail unik   : ___________________\n' +
      '  (garis wajah/luka/aksesoris muka)\n\n' +
      'Tokoh 2: _______________________\n' +
      '- Karakter      : ___________________\n' +
      '- Warna dasar   : ___________________\n' +
      '- Shading       : ___________________\n' +
      '- Detail unik   : ___________________\n\n' +
      'LANGKAH APLIKASI:\n' +
      '1. Bersihkan wajah pemain\n' +
      '2. Aplikasi foundation\n' +
      '3. Kontur & shading\n' +
      '4. Rias mata & alis\n' +
      '5. Rias bibir\n' +
      '6. Setting spray / bedak\n\n' +
      'CHECKLIST KIT RIAS:\n' +
      '[   ] Foundation & concealer\n' +
      '[   ] Bedak tabur & padat\n' +
      '[   ] Eyeshadow palette\n' +
      '[   ] Eyeliner & mascara\n' +
      '[   ] Lipstik beberapa warna\n' +
      '[   ] Blush on\n' +
      '[   ] Spons, kuas, aplikator\n' +
      '[   ] Tissue & kapas\n' +
      '[   ] Make-up remover\n\n\n' +
      'Disusun oleh,\n\n' +
      'Koor Tata Rias\n\n' +
      '___________________'
  },
  {
    key:'master_properti', title:'Daftar Master Properti & Alat',
    defaultRoles:['koor_perlengkapan','anggota_perlengkapan'],
    desc:'Inventaris properti per adegan.',
    content:
      'DAFTAR MASTER PROPERTI & ALAT\n' +
      '=========================================\n\n' +
      'TABEL INVENTARIS:\n\n' +
      '----------------------------------------------------------------\n' +
      'No | Nama Properti/Alat | Asal Barang | Adegan | PIC | Status\n' +
      '----------------------------------------------------------------\n' +
      '1  |                    |             |        |     |\n' +
      '2  |                    |             |        |     |\n' +
      '3  |                    |             |        |     |\n' +
      '4  |                    |             |        |     |\n' +
      '5  |                    |             |        |     |\n' +
      '----------------------------------------------------------------\n\n' +
      'Asal Barang: Pinjam / Buat / Milik Sendiri\n' +
      'Status     : Baik / Rusak Ringan / Rusak Berat\n\n' +
      'PENATAAN DI PANGGUNG:\n\n' +
      'Adegan 1:\n' +
      '- Properti A : Posisi ____________________\n' +
      '- Properti B : Posisi ____________________\n\n' +
      'Adegan 2:\n' +
      '- Properti C : Posisi ____________________\n' +
      '- Properti D : Posisi ____________________\n\n' +
      'TRANSISI PROPERTI ANTAR ADEGAN:\n\n' +
      'Dari Adegan | Ke Adegan | Item | PIC | Durasi\n' +
      '-----------------------------------------------\n' +
      '            |           |      |     |\n' +
      '            |           |      |     |\n\n' +
      'CHECKLIST HARI-H:\n' +
      '[   ] Semua properti sudah di lokasi\n' +
      '[   ] Cek kondisi fisik\n' +
      '[   ] Susun di prop table backstage\n' +
      '[   ] Briefing PIC properti\n' +
      '[   ] Siapkan plan B untuk properti vital\n\n\n' +
      'Disusun oleh,\n\n' +
      'Koor Perlengkapan\n\n' +
      '___________________'
  },
  {
    key:'denah_panggung', title:'Denah Tata Letak Panggung',
    defaultRoles:['koor_panggung','anggota_panggung'],
    desc:'Sketsa tata letak panggung.',
    content:
      'DENAH TATA LETAK PANGGUNG\n' +
      '=========================================\n\n' +
      'UKURAN PANGGUNG:\n' +
      'Panjang : ______ meter\n' +
      'Lebar   : ______ meter\n' +
      'Tinggi  : ______ meter\n\n' +
      'AREA PANGGUNG (ZONASI):\n\n' +
      '     +-------------------------------------+\n' +
      '     |              UPSTAGE                |\n' +
      '     |          (Area Belakang)            |\n' +
      '     +-------------------------------------+\n' +
      '     |              CENTER                 |\n' +
      '     |          (Area Tengah)              |\n' +
      '     +-------------------------------------+\n' +
      '     |            DOWNSTAGE                |\n' +
      '     |          (Area Depan)               |\n' +
      '     +=====================================+\n' +
      '                  ↓↓ AUDIENCE ↓↓\n\n' +
      'PENEMPATAN ELEMEN UTAMA:\n\n' +
      'Properti Utama:\n' +
      '- [Nama Properti] : ______________ (posisi)\n' +
      '- [Nama Properti] : ______________ (posisi)\n' +
      '- [Nama Properti] : ______________ (posisi)\n\n' +
      'Alat Musik / Gamelan:\n' +
      '- Posisi      : _____________________\n' +
      '- Jumlah item : _____________________\n\n' +
      'JALUR MASUK/KELUAR PEMAIN (ENTRANCE/EXIT):\n\n' +
      'Wing Kanan : _____________________\n' +
      'Wing Kiri  : _____________________\n' +
      'Backstage  : _____________________\n\n' +
      'TIMING TRANSISI PANGGUNG:\n\n' +
      'Adegan | Waktu Pasang | Waktu Bongkar\n' +
      '----------------------------------------\n' +
      '1      |              |\n' +
      '2      |              |\n' +
      '3      |              |\n\n\n' +
      'Disusun oleh,\n\n' +
      'Koor Tata Pentas\n\n' +
      '___________________'
  },
  {
    key:'kalender_konten', title:'Kalender Konten Publikasi',
    defaultRoles:['koor_publikasi','anggota_publikasi'],
    desc:'Jadwal konten media sosial.',
    content:
      'KALENDER KONTEN PUBLIKASI\n' +
      '=========================================\n\n' +
      'TABEL PUBLIKASI:\n\n' +
      '----------------------------------------------------------------\n' +
      'No | Tanggal | Platform | Jenis Konten | Judul/Caption | PIC\n' +
      '----------------------------------------------------------------\n' +
      '1  |         | IG       | Teaser       |               |\n' +
      '2  |         | TikTok   | Poster       |               |\n' +
      '3  |         | YouTube  | BTS          |               |\n' +
      '4  |         | WA Story | Countdown    |               |\n' +
      '5  |         | IG       | After Movie  |               |\n' +
      '----------------------------------------------------------------\n\n' +
      'PLATFORM : IG / TikTok / YouTube / WhatsApp / Lainnya\n' +
      'JENIS    : Teaser / Poster / BTS / Hitung Mundur / After Movie\n\n' +
      'STRATEGI PUBLIKASI:\n\n' +
      '1. Fase Pre-Launch (H-14 s.d H-7)\n' +
      '   Konten    : Teaser, Poster misterius\n' +
      '   Frekuensi : 3x per minggu\n\n' +
      '2. Fase Launching (H-7 s.d H-1)\n' +
      '   Konten    : BTS, Foto pemain, Countdown\n' +
      '   Frekuensi : Setiap hari\n\n' +
      '3. Fase Show Day (H-H)\n' +
      '   Konten    : Live update, Story\n' +
      '   Frekuensi : Setiap adegan\n\n' +
      '4. Fase Pasca (H+1 s.d H+7)\n' +
      '   Konten    : After Movie, Apresiasi, Testimoni\n' +
      '   Frekuensi : 2x per minggu\n\n' +
      'CAPTION TEMPLATE:\n\n' +
      '[Judul Pertunjukan]\n\n' +
      '[Deskripsi singkat]\n\n' +
      'Tanggal: ___\n' +
      'Lokasi: ___\n\n' +
      '#teater #senbudaya #smpn10samarinda\n\n\n' +
      'Disusun oleh,\n\n' +
      'Koor Publikasi & Dokumentasi\n\n' +
      '___________________'
  },
  {
    key:'laporan_divisi', title:'Laporan Akhir Divisi',
    defaultRoles:['koor_publikasi','koor_perlengkapan','koor_akomodasi','koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya'],
    desc:'Laporan akhir setiap divisi pasca produksi.',
    content:
      'LAPORAN AKHIR DIVISI\n' +
      '=========================================\n\n' +
      'Nama Divisi : ___________________________\n' +
      'Koor        : ___________________________\n' +
      'Anggota     : ___________________________\n' +
      'Periode     : ___________________________\n\n' +
      'I. CAPAIAN PROGRAM KERJA DIVISI\n' +
      '---------------------------------------------------------\n' +
      'Program Kerja | Target | Realisasi | Status | Catatan\n' +
      '-------------------------------------------------------\n' +
      '1.            |        |           |        |\n' +
      '2.            |        |           |        |\n' +
      '3.            |        |           |        |\n' +
      '4.            |        |           |        |\n' +
      '-------------------------------------------------------\n\n' +
      'Status: Tercapai / Sebagian / Tidak Tercapai\n\n' +
      'II. KENDALA UTAMA & SOLUSI\n' +
      '---------------------------------------------------------\n' +
      'KENDALA 1:\n' +
      '- Deskripsi    : _______________________\n' +
      '- Dampak       : _______________________\n' +
      '- Solusi       : _______________________\n' +
      '- Pembelajaran : _______________________\n\n' +
      'KENDALA 2:\n' +
      '- Deskripsi    : _______________________\n' +
      '- Dampak       : _______________________\n' +
      '- Solusi       : _______________________\n' +
      '- Pembelajaran : _______________________\n\n' +
      'III. EVALUASI KINERJA ANGGOTA\n' +
      '---------------------------------------------------------\n' +
      'Nama Anggota | Peran | Kontribusi | Nilai (1-4)\n' +
      '-------------------------------------------------------\n' +
      '1.           |       |            |\n' +
      '2.           |       |            |\n' +
      '3.           |       |            |\n' +
      '4.           |       |            |\n' +
      '-------------------------------------------------------\n\n' +
      'IV. RENCANA TINDAK LANJUT\n' +
      '---------------------------------------------------------\n' +
      '1. Untuk Pertunjukan Berikutnya:\n' +
      '   ______________________________________________\n' +
      '2. Rekomendasi ke Pengurus Baru:\n' +
      '   ______________________________________________\n' +
      '3. Pelatihan yang Dibutuhkan:\n' +
      '   ______________________________________________\n\n' +
      'V. DOKUMENTASI PENDUKUNG\n' +
      '---------------------------------------------------------\n' +
      '[   ] Foto kegiatan (link Drive)\n' +
      '[   ] Video behind the scene\n' +
      '[   ] Dokumen-dokumen kerja\n' +
      '[   ] Nota/Invoice (jika ada pembelian)\n\n\n' +
      'Disusun oleh,\n\n' +
      'Koor Divisi\n\n' +
      '___________________\n\n' +
      'Mengetahui,\n\n' +
      'Pimpinan Produksi\n\n' +
      '___________________'
  }
];

var MASTER_TEMPLATE_KEYS = MASTER_TEMPLATES.map(function(t){ return t.key; });
window.MASTER_TEMPLATES = MASTER_TEMPLATES;

/* ============================================================
   TEMPLATE SHARED — Baca dari Firestore / fallback local
   ============================================================ */
function getSharedTemplates(){
  // 1. Dari Firestore (via DB yang sudah di-subscribe app.js)
  if (window.DB && window.DB.templatesShared && Array.isArray(window.DB.templatesShared.templates)){
    return window.DB.templatesShared.templates;
  }
  // 2. Fallback: semua master aktif dengan default roles
  return MASTER_TEMPLATES.map(function(t){
    return {
      key: t.key,
      title: t.title,
      desc: t.desc,
      content: t.content,
      active: true,
      roles: t.defaultRoles.slice()
    };
  });
}
window.getSharedTemplates = getSharedTemplates;

function saveSharedTemplates(templates){
  // Simpan ke Firestore
  if (window.fbSet){
    return window.fbSet('templates_shared', 'global', {
      templates: templates,
      updatedAt: Date.now(),
      updatedBy: u().name || 'Guru'
    });
  }
  return Promise.resolve();
}

/* ============================================================
   1. DOKUMEN SAYA (SISWA)
   ============================================================ */
function docUploadKey(cid, sid, key){ return 'sppt_doc_' + cid + '_' + sid + '_' + key; }
function getUploadedDoc(cid, sid, key){
  try {
    var raw = localStorage.getItem(docUploadKey(cid, sid, key));
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}
function setUploadedDoc(cid, sid, key, data){
  try {
    localStorage.setItem(docUploadKey(cid, sid, key), JSON.stringify(data));
    var docId = cid + '_' + sid + '_' + key;
    if (window.fbSet){
      window.fbSet('template_uploads', docId, Object.assign({}, data, {
        classId: cid, studentId: sid, templateKey: key
      }));
    }
    return true;
  } catch(e){ console.error('[setUploadedDoc]', e); return false; }
}

window.openDokumenSaya = function(){
  var cid = uCid();
  var sid = uSid();
  if (!cid){ alert('Kelas tidak ditemukan'); return; }
  if (!sid){ alert('Data siswa tidak ditemukan'); return; }

  var myRole = uRole();
  var allTemplates = getSharedTemplates();
  var templates = allTemplates.filter(function(t){
    if (!t.active) return false;
    var roles = t.roles || [];
    return roles.indexOf(myRole) >= 0;
  });

  var h = '';
  h += '<div class="alert alert-info">' + ic('info') + '<div><b>Dokumen Saya</b><br><small>Download &rarr; Kerjakan &rarr; Upload hasil</small></div></div>';

  if (templates.length === 0){
    h += '<div class="empty-state">' + ic('fileText', 40) + '<p>Belum ada template untuk peran <b>' + esc(roleLabel(myRole)) + '</b>.</p>' +
      '<p style="font-size:11.5px;color:var(--text-muted);">Hubungi guru pengampu untuk membagikan template.</p></div>';
    openModal('Dokumen Saya', h);
    if (window.hydrateIcons) window.hydrateIcons();
    return;
  }

  var doneCount = 0;
  templates.forEach(function(t){
    var uploaded = getUploadedDoc(cid, sid, t.key);
    if (uploaded) doneCount++;

    h += '<div class="card" style="margin-bottom:10px;border-left:4px solid ' + (uploaded ? 'var(--success)' : 'var(--warning)') + ';">' +
      '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;">' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="font-weight:700;font-size:13.5px;">' + ic('fileText','sm') + ' ' + esc(t.title) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' + esc(t.desc || '') + '</div>' +
        '</div>' +
        '<span class="badge ' + (uploaded ? 'badge-success' : 'badge-warning') + '">' + (uploaded ? 'Sudah Upload' : 'Belum') + '</span>' +
      '</div>' +
      (uploaded ? '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:8px;padding:6px 8px;background:var(--success-soft);border-radius:6px;">' +
        ic('check','sm') + ' File: <b>' + esc(uploaded.fileName) + '</b> &middot; ' + esc(uploaded.uploadedAtStr || '-') + '</div>' : '') +
      '<div class="action-row">' +
        '<button class="btn btn-sm" onclick="downloadTemplate(\'' + t.key + '\')">' + ic('download','sm') + ' Download</button>' +
        '<button class="btn btn-sm ' + (uploaded ? '' : 'btn-primary') + '" onclick="openUploadDoc(\'' + t.key + '\')">' + ic('upload','sm') + ' ' + (uploaded ? 'Ganti' : 'Upload') + '</button>' +
        (uploaded ? '<button class="btn btn-sm" onclick="lihatUploadedDoc(\'' + t.key + '\')">' + ic('eye','sm') + ' Lihat</button>' : '') +
      '</div>' +
    '</div>';
  });

  var pct = Math.round(doneCount / templates.length * 100);
  h += '<div class="progress-banner" style="padding:14px;">' +
    '<h3 style="margin-bottom:6px;">' + ic('chart') + ' Progres Dokumen</h3>' +
    '<div style="font-size:22px;font-weight:800;">' + doneCount + ' / ' + templates.length + '</div>' +
    '<div class="progress-container"><div class="progress-bar ' + (pct === 100 ? 'complete' : pct > 0 ? 'partial' : '') + '" style="width:' + pct + '%"></div></div>' +
  '</div>';

  openModal('Dokumen Saya', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   2. DOWNLOAD TEMPLATE
   ============================================================ */
function buildCoverHtml(cid, title, subtitle){
  var c = findClass(cid);
  var kerabatNama = (c && c.kerabatNama) ? c.kerabatNama : ('Kerabat Kerja ' + (c ? c.name : ''));
  var className = c ? c.name : '-';

  return '<div style="text-align:center;padding:40pt 0 20pt 0;page-break-after:always;">' +
    '<table style="width:100%;margin-bottom:30pt;border-collapse:collapse;"><tr>' +
      '<td style="text-align:center;width:33%;font-size:10pt;color:#666;padding:20pt 8pt;border:1pt dashed #ccc;">' +
        '[LOGO<br>MAPEL SENI BUDAYA]' +
      '</td>' +
      '<td style="text-align:center;width:33%;font-size:10pt;color:#666;padding:20pt 8pt;border:1pt dashed #ccc;">' +
        '[LOGO<br>SMP NEGERI 10 SAMARINDA]' +
      '</td>' +
      '<td style="text-align:center;width:33%;font-size:10pt;color:#666;padding:20pt 8pt;border:1pt dashed #ccc;">' +
        '[LOGO<br>' + esc(kerabatNama).toUpperCase() + ']' +
      '</td>' +
    '</tr></table>' +
    '<h1 style="font-size:24pt;color:#1e40af;margin:20pt 0 10pt 0;font-family:Calibri;">' + esc(title) + '</h1>' +
    (subtitle ? '<h2 style="font-size:16pt;color:#2563eb;margin:10pt 0 30pt 0;font-family:Calibri;">' + esc(subtitle) + '</h2>' : '<div style="margin:30pt 0;"></div>') +
    '<hr style="border:none;border-top:2pt solid #2563eb;width:60%;margin:20pt auto;">' +
    '<p style="font-size:14pt;font-weight:bold;margin:30pt 0 10pt 0;">' + esc(kerabatNama) + '</p>' +
    '<p style="font-size:12pt;margin:10pt 0;">Kelas ' + esc(className) + '</p>' +
    '<p style="font-size:12pt;margin:10pt 0;">SMP Negeri 10 Samarinda</p>' +
    '<p style="font-size:12pt;margin:30pt 0;">Tahun Ajaran 2025/2026</p>' +
    '<p style="font-size:9pt;color:#999;margin-top:40pt;font-style:italic;">' +
      '(Ganti placeholder logo di atas dengan logo asli setelah dokumen dibuka di Word)' +
    '</p>' +
  '</div>';
}

function buildDocHtml(title, content, cid){
  var me = u();
  var cover = buildCoverHtml(cid, title, '');
  var header = '<div style="text-align:center;margin-bottom:20pt;">' +
    '<h2 style="font-size:16pt;color:#1e40af;border-bottom:2pt solid #2563eb;padding-bottom:6pt;">' + esc(title) + '</h2>' +
    '</div>' +
    '<table style="width:100%;font-size:10pt;margin-bottom:16pt;">' +
      '<tr><td style="width:120pt;color:#666;">Disusun oleh:</td><td><b>' + esc(me.name||'-') + '</b></td></tr>' +
      '<tr><td style="color:#666;">Peran:</td><td>' + esc(roleLabel(uRole())) + '</td></tr>' +
      '<tr><td style="color:#666;">Tanggal:</td><td>' + esc(new Date().toLocaleDateString('id-ID')) + '</td></tr>' +
    '</table>' +
    '<hr style="border:none;border-top:1pt solid #ccc;margin-bottom:12pt;">';

  var body = String(content||'').split('\n').map(function(line){
    var s = esc(line);
    if (s.trim() === '') s = '&nbsp;';
    return '<p style="font-family:Consolas,Courier,monospace;font-size:10.5pt;margin:0 0 3pt 0;line-height:1.3;">' + s + '</p>';
  }).join('');

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
    '<style>@page{size:A4;margin:2cm;}</style></head><body>' +
    cover + header + body + '</body></html>';
}

function saveBlob(blob, filename){
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); }, 1500);
}

window.downloadTemplate = function(templateKey){
  var templates = getSharedTemplates();
  var tpl = templates.find(function(t){ return t.key === templateKey; });
  if (!tpl){
    var master = MASTER_TEMPLATES.find(function(t){ return t.key === templateKey; });
    if (!master){ alert('Template tidak ditemukan'); return; }
    tpl = master;
  }

  var cid = uCid();
  var html = buildDocHtml(tpl.title, tpl.content, cid);
  var c = findClass(cid);
  var className = c ? c.name.replace(/\s+/g, '_') : 'Kelas';
  var filename = tpl.title.replace(/[^A-Za-z0-9]+/g, '_') + '_' + className;

  if (typeof htmlDocx !== 'undefined' && htmlDocx.asBlob){
    try {
      var blob = htmlDocx.asBlob(html);
      saveBlob(blob, filename + '.docx');
      logAct('template_download', u().name + ' unduh template: ' + templateKey, {classId: cid});
      return;
    } catch(e){ console.warn('htmlDocx gagal, fallback', e); }
  }
  var blob2 = new Blob(['\ufeff' + html], {type: 'application/msword'});
  saveBlob(blob2, filename + '.doc');
  logAct('template_download', u().name + ' unduh template: ' + templateKey, {classId: cid});
};

/* ============================================================
   3. UPLOAD & LIHAT DOKUMEN
   ============================================================ */
window.openUploadDoc = function(templateKey){
  var templates = getSharedTemplates();
  var tpl = templates.find(function(t){ return t.key === templateKey; }) ||
            MASTER_TEMPLATES.find(function(t){ return t.key === templateKey; });
  if (!tpl) return;

  openModal('Upload: ' + tpl.title,
    '<div class="alert alert-info">' + ic('info') + '<div>Format: <b>PDF, DOCX, DOC</b> &mdash; maks <b>1 MB</b></div></div>' +
    '<div class="form-group"><label>Pilih File</label>' +
    '<input type="file" id="doc-file" accept=".pdf,.docx,.doc" style="padding:8px;width:100%;"></div>' +
    '<div class="form-group"><label>Catatan (opsional)</label>' +
    '<textarea id="doc-note" rows="2" maxlength="200"></textarea></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanUploadDoc(\'' + templateKey + '\')">' + ic('upload') + ' Upload</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanUploadDoc = function(templateKey){
  var fileEl = document.getElementById('doc-file');
  if (!fileEl || !fileEl.files || !fileEl.files[0]){ alert('Pilih file terlebih dahulu'); return; }
  var file = fileEl.files[0];
  if (file.size > 1024*1024){ alert('File terlalu besar (maks 1 MB)'); return; }
  var note = (document.getElementById('doc-note').value || '').trim();
  var cid = uCid();
  var sid = uSid();

  var templates = getSharedTemplates();
  var tpl = templates.find(function(t){ return t.key === templateKey; }) ||
            MASTER_TEMPLATES.find(function(t){ return t.key === templateKey; });

  var reader = new FileReader();
  reader.onload = function(e){
    var data = {
      templateKey: templateKey,
      templateTitle: tpl ? tpl.title : templateKey,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      dataUrl: e.target.result,
      note: note,
      uploadedBy: u().name,
      uploadedByRole: uRole(),
      uploadedAt: Date.now(),
      uploadedAtStr: new Date().toLocaleString('id-ID')
    };
    if (setUploadedDoc(cid, sid, templateKey, data) === false){
      alert('Gagal menyimpan. Coba file yang lebih kecil.');
      return;
    }
    logAct('doc_upload', u().name + ' upload dokumen: ' + templateKey, {classId: cid});
    closeModal();
    alert('Berhasil diunggah!');
    setTimeout(window.openDokumenSaya, 200);
  };
  reader.readAsDataURL(file);
};

window.lihatUploadedDoc = function(templateKey){
  var doc = getUploadedDoc(uCid(), uSid(), templateKey);
  if (!doc){ alert('Belum ada file'); return; }

  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>' + esc(doc.fileName) + '</b><br><small>' + esc(doc.uploadedAtStr || '') + '</small></div></div>';
  if (doc.fileType && doc.fileType.indexOf('pdf') >= 0){
    h += '<iframe src="' + doc.dataUrl + '" style="width:100%;height:500px;border:1px solid var(--border);border-radius:8px;"></iframe>';
  } else {
    h += '<div style="text-align:center;padding:20px;">' +
      '<a href="' + doc.dataUrl + '" download="' + esc(doc.fileName) + '" class="btn btn-primary">' + ic('download') + ' Download File</a>' +
    '</div>';
  }
  if (doc.note) h += '<div class="alert alert-info" style="margin-top:10px;">' + ic('info') + '<div><b>Catatan:</b> ' + esc(doc.note) + '</div></div>';
  openModal('File: ' + esc(doc.fileName), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   4. KELOLA TEMPLATE (GURU)
   ============================================================ */
window.openKelolaTemplate = function(){
  if (!isGuru()){ alert('Hanya guru/admin'); return; }
  var templates = getSharedTemplates();

  var h = '';
  h += '<div class="alert alert-info">' + ic('info') + '<div><b>Kelola Template Dokumen</b><br>' +
    '<small>Atur template mana yang aktif &amp; dibagikan ke peran apa. Berlaku untuk <b>SEMUA kelas</b>.</small></div></div>';

  h += '<div class="action-row" style="margin-bottom:14px;flex-wrap:wrap;">' +
    '<button class="btn btn-sm" onclick="resetTemplatesToDefault()">' + ic('refresh','sm') + ' Reset ke Default</button>' +
    '<button class="btn btn-sm" onclick="syncTemplatesToFirestore()">' + ic('upload','sm') + ' Simpan ke Server</button>' +
  '</div>';

  templates.forEach(function(t, i){
    var roleChips = (t.roles || []).map(function(r){
      return '<span class="badge badge-primary" style="font-size:10px;">' + esc(roleLabel(r)) + '</span>';
    }).join(' ');

    h += '<div class="card" style="margin-bottom:10px;border-left:4px solid ' + (t.active ? 'var(--success)' : 'var(--border-strong)') + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="font-weight:700;font-size:13.5px;">' + esc(t.title) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' + esc(t.desc || '') + '</div>' +
        '</div>' +
        '<label class="switch" style="flex-shrink:0;">' +
          '<input type="checkbox" ' + (t.active ? 'checked' : '') + ' onchange="toggleTemplateActive(' + i + ', this.checked)">' +
          '<span class="slider"></span>' +
        '</label>' +
      '</div>' +
      '<div style="font-size:11.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">Untuk Peran:</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;min-height:24px;">' +
        (roleChips || '<span style="font-size:11.5px;color:var(--danger);">Belum ada peran</span>') +
      '</div>' +
      '<div class="action-row">' +
        '<button class="btn btn-sm btn-primary" onclick="openEditTemplateRoles(' + i + ')">' + ic('edit','sm') + ' Atur Peran</button>' +
        '<button class="btn btn-sm" onclick="previewTemplate(' + i + ')">' + ic('eye','sm') + ' Preview</button>' +
      '</div>' +
    '</div>';
  });

  openModal('Kelola Template', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.toggleTemplateActive = function(idx, checked){
  if (!isGuru()) return;
  var templates = getSharedTemplates();
  if (!templates[idx]) return;
  templates[idx].active = checked;
  saveSharedTemplates(templates);
  // Update local DB
  if (window.DB.templatesShared) window.DB.templatesShared.templates = templates;
};

window.syncTemplatesToFirestore = function(){
  if (!isGuru()) return;
  var templates = getSharedTemplates();
  saveSharedTemplates(templates).then(function(){
    alert('Berhasil disimpan ke server!');
  }).catch(function(e){
    alert('Gagal: ' + e.message);
  });
};

window.resetTemplatesToDefault = function(){
  if (!isGuru()) return;
  if (!confirm('Reset semua template ke pengaturan default?\n\nSemua pengaturan kustom akan hilang.')) return;
  var fresh = MASTER_TEMPLATES.map(function(t){
    return {
      key: t.key, title: t.title, desc: t.desc, content: t.content,
      active: true, roles: t.defaultRoles.slice()
    };
  });
  saveSharedTemplates(fresh).then(function(){
    if (window.DB.templatesShared) window.DB.templatesShared.templates = fresh;
    alert('Template direset ke default!');
    closeModal();
    setTimeout(window.openKelolaTemplate, 200);
  });
};

window.openEditTemplateRoles = function(idx){
  if (!isGuru()) return;
  var templates = getSharedTemplates();
  var t = templates[idx];
  if (!t) return;

  var allRoles = Object.keys(window.ROLES || {});
  // Kelompokkan role
  var grupRole = {
    'PENGURUS INTI': ['pimpinan_produksi','sutradara','asisten_sutradara','sekretaris','bendahara'],
    'DIVISI PRODUKSI': ['koor_publikasi','koor_perlengkapan','koor_akomodasi','anggota_publikasi','anggota_perlengkapan','anggota_akomodasi'],
    'DIVISI ARTISTIK': ['koor_panggung','koor_musik','koor_busana','koor_rias','koor_cahaya','anggota_panggung','anggota_musik','anggota_busana','anggota_rias','anggota_cahaya'],
    'PEMERAN': ['pemain']
  };

  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>' + esc(t.title) + '</b><br><small>Pilih peran yang menerima template ini.</small></div></div>';
  h += '<div class="action-row" style="margin-bottom:10px;">' +
    '<button class="btn btn-sm" onclick="selectAllRoles(' + idx + ', true)">Pilih Semua</button>' +
    '<button class="btn btn-sm" onclick="selectAllRoles(' + idx + ', false)">Kosongkan</button>' +
  '</div>';

  Object.keys(grupRole).forEach(function(grup){
    h += '<div style="margin-bottom:12px;">' +
      '<div style="font-size:11.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">' + grup + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr;gap:4px;">';
    grupRole[grup].forEach(function(r){
      var checked = (t.roles || []).indexOf(r) >= 0;
      h += '<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:' + (checked ? 'var(--primary-soft)' : 'var(--surface)') + ';border-radius:6px;cursor:pointer;font-size:12.5px;border:1px solid ' + (checked ? 'var(--primary)' : 'transparent') + ';">' +
        '<input type="checkbox" class="tmpl-role-cb" value="' + r + '" ' + (checked ? 'checked' : '') + '>' +
        '<span style="flex:1;font-weight:600;">' + esc(roleLabel(r)) + '</span>' +
      '</label>';
    });
    h += '</div></div>';
  });

  h += '<button class="btn btn-primary btn-block btn-lg" style="margin-top:14px;" onclick="saveTemplateRoles(' + idx + ')">' + ic('save') + ' Simpan Peran</button>';
  openModal('Atur Peran — ' + esc(t.title), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.selectAllRoles = function(idx, checked){
  document.querySelectorAll('.tmpl-role-cb').forEach(function(cb){ cb.checked = checked; });
};

window.saveTemplateRoles = function(idx){
  if (!isGuru()) return;
  var templates = getSharedTemplates();
  if (!templates[idx]) return;
  var roles = [];
  document.querySelectorAll('.tmpl-role-cb:checked').forEach(function(cb){ roles.push(cb.value); });
  if (roles.length === 0){
    if (!confirm('Belum ada peran yang dipilih. Template tidak akan dibagikan ke siapa pun. Lanjutkan?')) return;
  }
  templates[idx].roles = roles;
  saveSharedTemplates(templates);
  if (window.DB.templatesShared) window.DB.templatesShared.templates = templates;
  alert('Peran diperbarui!');
  closeModal();
  setTimeout(window.openKelolaTemplate, 200);
};

window.previewTemplate = function(idx){
  var templates = getSharedTemplates();
  var t = templates[idx];
  if (!t) return;
  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>' + esc(t.title) + '</b><br><small>' + esc(t.desc || '') + '</small></div></div>';
  h += '<div style="max-height:60vh;overflow-y:auto;padding:14px;background:var(--surface);border-radius:8px;">' +
    '<pre style="font-family:Consolas,monospace;font-size:11.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;margin:0;">' +
    esc(t.content) +
    '</pre></div>';
  openModal('Preview: ' + esc(t.title), h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   5. DOKUMEN PER SISWA (GURU)
   ============================================================ */
window.openDokumenSiswa = function(cid){
  cid = cid || uCid();
  if (!cid) return;
  var c = findClass(cid);
  if (!c) return;
  var students = c.students || [];

  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>Dokumen per Siswa</b> &mdash; ' + students.length + ' siswa</div></div>';

  if (students.length === 0){
    h += '<div class="empty-state">' + ic('users', 40) + '<p>Belum ada siswa</p></div>';
    openModal('Dokumen Siswa', h);
    if (window.hydrateIcons) window.hydrateIcons();
    return;
  }

  var shared = getSharedTemplates();
  var h2 = '<div class="table-wrap"><table style="min-width:600px;"><thead><tr>' +
    '<th>No</th><th>Nama</th><th>Peran</th><th>Wajib</th><th>Uploaded</th><th>Progress</th>' +
    '</tr></thead><tbody>';

  students.forEach(function(s, i){
    var required = shared.filter(function(t){
      return t.active && (t.roles || []).indexOf(s.role) >= 0;
    });
    if (required.length === 0){
      h2 += '<tr><td>' + (i+1) + '</td><td><b>' + esc(s.name) + '</b></td>' +
        '<td><span class="badge badge-gray" style="font-size:10px;">' + esc(roleLabel(s.role)) + '</span></td>' +
        '<td colspan="3" style="color:var(--text-muted);font-size:11.5px;">Tidak ada template wajib</td></tr>';
      return;
    }
    var uploaded = 0;
    required.forEach(function(t){
      if (getUploadedDoc(cid, s.id, t.key)) uploaded++;
    });
    var pct = Math.round(uploaded / required.length * 100);
    var pctColor = pct === 100 ? 'badge-success' : pct > 0 ? 'badge-warning' : 'badge-danger';
    h2 += '<tr>' +
      '<td>' + (i+1) + '</td>' +
      '<td><b>' + esc(s.name) + '</b></td>' +
      '<td><span class="badge badge-gray" style="font-size:10px;">' + esc(roleLabel(s.role)) + '</span></td>' +
      '<td>' + required.length + '</td>' +
      '<td>' + uploaded + '</td>' +
      '<td><span class="badge ' + pctColor + '">' + pct + '%</span></td>' +
    '</tr>';
  });
  h2 += '</tbody></table></div>';
  h += h2;

  openModal('Dokumen per Siswa', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   6. NASKAH
   ============================================================ */
function canUploadNaskah(){ return uRole() === 'sutradara' || isGuru(); }

window.openNaskahList = function(cid){
  cid = cid || uCid();
  if (!cid) return;
  var c = findClass(cid);
  if (!c) return;
  var naskah = c.naskah || [];
  var canEdit = canUploadNaskah();

  var h = '<div class="alert alert-info">' + ic('book') + '<div><b>Arsip Naskah Teater</b><br><small>' + naskah.length + ' naskah</small></div></div>';
  if (canEdit){
    h += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px;" onclick="openTambahNaskah(\'' + cid + '\')">' + ic('upload','sm') + ' Tambah Naskah</button>';
  } else {
    h += '<div class="alert alert-warning">' + ic('info','sm') + '<div>Naskah hanya bisa ditambahkan oleh <b>Sutradara</b>. Anda dapat membaca semua naskah.</div></div>';
  }

  if (naskah.length === 0){
    h += '<div class="empty-state">' + ic('book', 40) + '<p>Belum ada naskah</p></div>';
  } else {
    naskah.slice().reverse().forEach(function(n){
      h += '<div class="card" style="margin-bottom:8px;border-left:3px solid var(--primary);">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
          '<div style="font-weight:700;font-size:13.5px;">' + ic('book','sm') + ' ' + esc(n.title) + '</div>' +
          '<span class="badge badge-gray">' + (n.url ? 'Link' : 'File') + '</span>' +
        '</div>' +
        (n.desc ? '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">' + esc(n.desc) + '</div>' : '') +
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Oleh: <b>' + esc(n.uploadedBy||'-') + '</b> &middot; ' + fmtDateShort(n.uploadedAt || n.createdAt) + '</div>' +
        '<div class="action-row">';
      if (n.url){
        h += '<a href="' + esc(n.url) + '" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="text-decoration:none;">' + ic('upload','sm') + ' Buka</a>';
      }
      if (n.dataUrl){
        h += '<a href="' + esc(n.dataUrl) + '" download="' + esc(n.fileName||'naskah') + '" class="btn btn-sm btn-primary" style="text-decoration:none;">' + ic('download','sm') + ' Download</a>';
      }
      if (canEdit){
        h += '<button class="btn btn-sm btn-danger" onclick="hapusNaskah(\'' + cid + '\',\'' + n.id + '\')">' + ic('trash','sm') + '</button>';
      }
      h += '</div></div>';
    });
  }
  openModal('Arsip Naskah', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.openTambahNaskah = function(cid){
  if (!canUploadNaskah()){ alert('Hanya Sutradara/Guru yang bisa upload naskah'); return; }
  openModal('Tambah Naskah',
    '<div class="form-group"><label>Judul Naskah</label><input id="nk-title" maxlength="120"></div>' +
    '<div class="form-group"><label>Deskripsi</label><textarea id="nk-desc" rows="2" maxlength="300"></textarea></div>' +
    '<div class="form-group"><label>Tipe</label><select id="nk-type" onchange="window.__toggleNaskahInput()">' +
      '<option value="link">Link Google Drive</option>' +
      '<option value="file">File (PDF/DOCX, maks 500 KB)</option>' +
    '</select></div>' +
    '<div id="nk-input-link" class="form-group"><label>URL</label><input type="url" id="nk-url" placeholder="https://drive.google.com/..."></div>' +
    '<div id="nk-input-file" class="form-group hidden"><label>File</label><input type="file" id="nk-file" accept=".pdf,.docx,.doc,.txt" style="padding:8px;width:100%;"></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanNaskah(\'' + cid + '\')">' + ic('save') + ' Simpan</button>');
  if (window.hydrateIcons) window.hydrateIcons();
};

window.__toggleNaskahInput = function(){
  var t = document.getElementById('nk-type').value;
  document.getElementById('nk-input-link').classList.toggle('hidden', t !== 'link');
  document.getElementById('nk-input-file').classList.toggle('hidden', t !== 'file');
};

window.simpanNaskah = function(cid){
  if (!canUploadNaskah()){ alert('Akses ditolak'); return; }
  var title = (document.getElementById('nk-title').value || '').trim();
  var desc = (document.getElementById('nk-desc').value || '').trim();
  var tipe = document.getElementById('nk-type').value;
  if (!title){ alert('Judul wajib diisi'); return; }
  var c = findClass(cid);
  var naskah = (c.naskah || []).slice();

  if (tipe === 'link'){
    var url = (document.getElementById('nk-url').value || '').trim();
    if (!url || !/^https?:\/\//i.test(url)){ alert('URL tidak valid'); return; }
    naskah.push({
      id: uid(), title: title, desc: desc,
      url: url, type: 'link',
      uploadedBy: u().name, uploadedAt: Date.now()
    });
    saveNaskah(cid, c, naskah);
  } else {
    var fileEl = document.getElementById('nk-file');
    if (!fileEl || !fileEl.files || !fileEl.files[0]){ alert('Pilih file'); return; }
    var f = fileEl.files[0];
    if (f.size > 500*1024){ alert('File terlalu besar (maks 500 KB)'); return; }
    var reader = new FileReader();
    reader.onload = function(e){
      naskah.push({
        id: uid(), title: title, desc: desc,
        fileName: f.name, fileSize: f.size, dataUrl: e.target.result,
        type: 'file',
        uploadedBy: u().name, uploadedAt: Date.now()
      });
      saveNaskah(cid, c, naskah);
    };
    reader.readAsDataURL(f);
  }
};

function saveNaskah(cid, c, naskah){
  window.fbSet('classes', cid, Object.assign({}, c, {naskah: naskah})).then(function(){
    logAct('naskah_add', u().name + ' tambah naskah', {classId: cid});
    closeModal();
    alert('Naskah ditambahkan!');
    setTimeout(function(){ window.openNaskahList(cid); }, 200);
  });
}

window.hapusNaskah = function(cid, naskahId){
  if (!canUploadNaskah()){ alert('Akses ditolak'); return; }
  if (!confirm('Hapus naskah ini?')) return;
  var c = findClass(cid);
  var naskah = (c.naskah || []).filter(function(x){ return x.id !== naskahId; });
  window.fbSet('classes', cid, Object.assign({}, c, {naskah: naskah})).then(function(){
    closeModal();
    setTimeout(function(){ window.openNaskahList(cid); }, 200);
  });
};

/* ============================================================
   7. GDRIVE
   ============================================================ */
function gdKey(type, cid, sid){ return 'sppt_gdrive_' + type + '_' + cid + '_' + sid; }
function getGDrive(type, cid, sid){
  try {
    var raw = localStorage.getItem(gdKey(type, cid, sid));
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}
function setGDrive(type, cid, sid, data){
  try {
    localStorage.setItem(gdKey(type, cid, sid), JSON.stringify(data));
    var docId = type + '_' + cid + '_' + sid;
    window.fbSet('gdrive_links', docId, Object.assign({}, data, {
      type: type, classId: cid, studentId: sid
    }));
    return true;
  } catch(e){ return false; }
}
function isValidGDriveUrl(url){ return /^https?:\/\/(drive|docs)\.google\.com\//i.test(String(url||'').trim()); }
function canInputGDrive(type, role){
  if (type === 'keuangan') return role === 'bendahara';
  if (type === 'dokpub') return role === 'koor_publikasi' || role === 'anggota_publikasi';
  return false;
}

window.openGDriveKeuangan = function(cid){ openGDriveModal('keuangan', cid || uCid()); };
window.openGDriveDokpub = function(cid){ openGDriveModal('dokpub', cid || uCid()); };

function openGDriveModal(type, cid){
  if (!cid) return;
  var c = findClass(cid);
  if (!c) return;
  var role = uRole();
  var sid = uSid();
  var students = (c.students || []).filter(function(s){
    if (type === 'keuangan') return s.role === 'bendahara';
    if (type === 'dokpub') return ['koor_publikasi','anggota_publikasi'].indexOf(s.role) >= 0;
    return false;
  });

  var title = type === 'keuangan' ? 'Arsip Nota & Foto Pembelian' : 'Galeri Dokumentasi';
  var canEdit = isGuru() || canInputGDrive(type, role);
  var myLink = getGDrive(type, cid, sid);

  var h = '<div class="alert alert-info">' + ic('folder') + '<div><b>' + title + '</b><br><small>' + students.length + ' siswa terkait</small></div></div>';

  if (canInputGDrive(type, role) || (myLink && isGuru())){
    h += '<div class="card" style="margin-bottom:12px;border-left:3px solid var(--primary);"><h3>' + ic('user') + ' Link Saya</h3>';
    if (myLink && myLink.url){
      h += '<div style="font-weight:700;font-size:13px;margin-bottom:6px;">' + esc(myLink.folderName || '-') + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<a href="' + esc(myLink.url) + '" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="text-decoration:none;">' + ic('folder','sm') + ' Buka Drive</a>' +
        '<button class="btn btn-sm" onclick="copyGDriveLink(\'' + type + '\',\'' + cid + '\',\'' + sid + '\')">' + ic('copy','sm') + ' Copy Link</button>' +
        '</div>';
      if (myLink.note) h += '<div style="font-size:11.5px;color:var(--text-muted);">' + esc(myLink.note) + '</div>';
    } else {
      h += '<div style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">Belum ada link</div>';
    }
    if (canEdit) h += '<button class="btn btn-sm ' + (myLink ? '' : 'btn-primary') + '" onclick="openEditGDriveForm(\'' + type + '\',\'' + cid + '\')">' + ic('edit','sm') + ' ' + (myLink ? 'Ubah Link' : 'Set Link Saya') + '</button>';
    h += '</div>';
  }

  if (students.length > 0){
    h += '<div class="card"><h3>' + ic('users') + ' Semua Anggota</h3>';
    students.forEach(function(s){
      var link = getGDrive(type, cid, s.id);
      var isMe = s.id === sid;
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:' + (isMe ? 'var(--primary-soft)' : 'var(--surface)') + ';border-radius:6px;margin-bottom:4px;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:150px;">' +
          '<div style="font-weight:700;font-size:12.5px;">' + esc(s.name) + (isMe ? ' <span class="badge badge-primary" style="font-size:9px;">Anda</span>' : '') + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + esc(roleLabel(s.role)) + '</div>' +
        '</div>';
      if (link && link.url){
        h += '<a href="' + esc(link.url) + '" target="_blank" rel="noopener" class="btn btn-sm" style="text-decoration:none;">' + ic('folder','sm') + ' Buka</a>';
        h += '<button class="btn btn-sm" onclick="copyGDriveLink(\'' + type + '\',\'' + cid + '\',\'' + s.id + '\')">' + ic('copy','sm') + '</button>';
      } else {
        h += '<span class="badge badge-gray">Belum ada</span>';
      }
      h += '</div>';
    });
    h += '</div>';
  }

  h += '<button class="btn btn-block" style="margin-top:12px;" onclick="openPanduanGDrive(\'' + type + '\')">' + ic('info') + ' Panduan Membuat Folder</button>';

  openModal(title, h);
  if (window.hydrateIcons) window.hydrateIcons();
}

window.openEditGDriveForm = function(type, cid){
  var sid = uSid();
  if (!sid) return;
  var existing = getGDrive(type, cid, sid) || {};
  var c = findClass(cid);
  var suggest = type === 'keuangan' ? 'NOTA_BARANG_' + (c?c.name:'') : 'DOKPUB_' + (c?c.name:'');

  var h = '<div class="form-group"><label>Link Google Drive</label>' +
    '<input id="gd-url" type="url" value="' + esc(existing.url||'') + '" placeholder="https://drive.google.com/drive/folders/..."></div>' +
    '<div class="form-group"><label>Nama Folder</label>' +
    '<input id="gd-name" value="' + esc(existing.folderName||'') + '" placeholder="' + esc(suggest) + '" maxlength="100"></div>' +
    '<div class="form-group"><label>Catatan</label>' +
    '<textarea id="gd-note" rows="2" maxlength="200">' + esc(existing.note||'') + '</textarea></div>' +
    '<div class="alert alert-warning">' + ic('warning','sm') + '<div>Pastikan folder diset <b>"Siapa saja yang memiliki link"</b> (Viewer).</div></div>' +
    '<button class="btn btn-primary btn-block" onclick="simpanGDrive(\'' + type + '\',\'' + cid + '\')">' + ic('save') + ' Simpan Link</button>';
  openModal('Set Link Drive', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

window.simpanGDrive = function(type, cid){
  var url = (document.getElementById('gd-url').value || '').trim();
  var name = (document.getElementById('gd-name').value || '').trim();
  var note = (document.getElementById('gd-note').value || '').trim();
  if (!url || !isValidGDriveUrl(url)){ alert('Link tidak valid'); return; }
  if (!name){ alert('Nama folder wajib'); return; }
  var sid = uSid();
  var data = {
    url: url, folderName: name, note: note,
    studentName: u().name, studentRole: uRole(),
    updatedBy: u().name, updatedAt: Date.now()
  };
  if (setGDrive(type, cid, sid, data) === false){ alert('Gagal menyimpan'); return; }
  closeModal();
  alert('Tersimpan!');
  setTimeout(function(){
    if (type === 'keuangan') window.openGDriveKeuangan(cid);
    else window.openGDriveDokpub(cid);
  }, 200);
};

window.copyGDriveLink = function(type, cid, sid){
  var link = getGDrive(type, cid, sid);
  if (!link || !link.url){ alert('Belum ada link'); return; }
  if (navigator.clipboard) navigator.clipboard.writeText(link.url).then(function(){ alert('Link disalin!'); });
  else prompt('Copy link:', link.url);
};

window.openPanduanGDrive = function(type){
  var isKeuangan = type === 'keuangan';
  var h = '<div class="alert alert-info">' + ic('info') + '<div><b>Panduan Folder ' + (isKeuangan ? 'Keuangan' : 'Dokumentasi') + '</b></div></div>';
  h += '<div style="font-size:12.5px;line-height:1.8;">';
  h += '<b>1. Buka Google Drive</b><br>Login dengan akun Google Anda.<br><br>';
  h += '<b>2. Buat Folder Utama</b><br>Nama folder: <code>' + (isKeuangan ? 'NOTA_BARANG_[KELAS]' : 'DOKPUB_[KELAS]') + '</code><br><br>';
  if (isKeuangan){
    h += '<b>3. Buat 2 Sub-Folder</b><br>' +
      '&bull; <b>NOTA</b> &mdash; foto/scan nota belanja<br>' +
      '&bull; <b>BARANG</b> &mdash; foto barang yang dibeli<br><br>' +
      '<b>4. Aturan Foto Barang</b><br>Nama file harus jelas, contoh: <code>gitar_akustik.jpg</code><br><br>';
  } else {
    h += '<b>3. Buat Sub-Folder Klasifikasi</b><br>' +
      '&bull; 01_POSTER_DAN_FLYER<br>' +
      '&bull; 02_FOTO_LATIHAN<br>' +
      '&bull; 03_VIDEO_TEASER<br>' +
      '&bull; 04_LAUNCHING_LOGO<br>' +
      '&bull; 05_LAUNCHING_PENGURUS<br>' +
      '&bull; 06_AFTER_MOVIE<br>' +
      '&bull; 07_DOKUMENTASI_PANGGUNG<br>' +
      '&bull; 08_ARSIP_LAIN<br><br>';
  }
  h += '<b>5. Bagikan Folder</b><br>Klik kanan folder &rarr; <b>Bagikan</b> &rarr; <b>"Siapa saja yang memiliki link"</b> (Viewer).<br><br>';
  h += '<b>6. Copy Link</b><br>Salin link, lalu tempel di form "Set Link Saya".';
  h += '</div>';
  h += '<button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="closeModal()">Mengerti</button>';
  openModal('Panduan GDrive', h);
  if (window.hydrateIcons) window.hydrateIcons();
};

/* ============================================================
   8. EXPORT GLOBAL
   ============================================================ */
window.getGDrive = getGDrive;
window.setGDrive = setGDrive;

/* ============================================================
   9. AUTO-INIT — kalau templates_shared kosong di Firestore,
      kirim default (hanya guru yang trigger)
   ============================================================ */
setTimeout(function(){
  if (!window.currentUser) return;
  if (!isGuru()) return;
  if (window.DB.templatesShared && Array.isArray(window.DB.templatesShared.templates) && window.DB.templatesShared.templates.length > 0) return;
  // Kirim default
  var fresh = MASTER_TEMPLATES.map(function(t){
    return {
      key: t.key, title: t.title, desc: t.desc, content: t.content,
      active: true, roles: t.defaultRoles.slice()
    };
  });
  saveSharedTemplates(fresh).then(function(){
    console.log('[features-docs] default templates uploaded to Firestore');
  }).catch(function(e){
    console.warn('[features-docs] failed to upload defaults:', e.message);
  });
}, 4000);

console.log('[features-docs] v2.0 FINAL loaded');

})();
