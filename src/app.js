// =================================================================
// SP-PPT Core UI Logic
// Mengatur Antarmuka: Navigasi Login, Tema, Modal, dan Notifikasi
// =================================================================

// 1. Inisialisasi Aplikasi & Hilangkan Loading Screen
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loader = document.getElementById("loading-screen");
    if (loader) loader.classList.add("hidden");

    // Tampilkan layar login secara default saat pertama kali dibuka
    const loginScreen = document.getElementById("login-screen");
    if (loginScreen) loginScreen.classList.remove("hidden");
  }, 1200); // Simulasi loading 1.2 detik

  // Terapkan tema yang tersimpan (jika ada)
  const savedTheme = localStorage.getItem("spppt_theme") || "light";
  setTheme(savedTheme);
});

// 2. Fungsi Manajemen Tema (Terang/Gelap)
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("spppt_theme", theme);

  // Update tombol tema di layar login
  document.getElementById("btn-theme-light")?.classList.toggle("active", theme === "light");
  document.getElementById("btn-theme-dark")?.classList.toggle("active", theme === "dark");
}

// 3. Fungsi Tab Switching di Layar Login (Guru/Siswa/Admin)
function switchLoginTab(role) {
  // Matikan semua tab dan form
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".auth-box form").forEach(form => form.classList.add("hidden"));

  // Nyalakan tab dan form yang dipilih
  document.getElementById(`tab-login-${role}`).classList.add("active");
  document.getElementById(`form-login-${role}`).classList.remove("hidden");
}

// 4. Navigasi antara Layar Login & Register
function toggleAuthPage(page) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.add("hidden");

  if (page === "register") {
    document.getElementById("register-screen").classList.remove("hidden");
  } else {
    document.getElementById("login-screen").classList.remove("hidden");
  }
}

// 5. Fungsi Toggle Password (Lihat/Sembunyikan)
function togglePw(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

// 6. Simulasi Fungsi Login & Masuk Aplikasi Utama
function doLogin(role) {
  // Disini nanti diletakkan logika autentikasi Firebase Anda
  console.log(`Mencoba login sebagai: ${role}`);

  // Transisi UI dari Layar Login ke Dashboard Aplikasi
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  
  // Set nama user sementara di Header
  document.getElementById("user-info").innerText = `Login berhasil sebagai: ${role.toUpperCase()}`;
}

// 7. Simulasi Fungsi Register
function doRegister() {
  alert("Pendaftaran berhasil! Silakan login menggunakan akun baru Anda.");
  toggleAuthPage("login");
}

// 8. Fungsi Logout
function doLogout() {
  const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
  if (confirmLogout) {
    document.getElementById("app-container").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    
    // Reset form fields
    document.querySelectorAll("form").forEach(form => form.reset());
  }
}

// 9. Manajemen Modal Global
function openModal(title, contentHTML) {
  document.getElementById("modal-title").innerText = title;
  document.getElementById("modal-body").innerHTML = contentHTML;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// 10. Manajemen Notifikasi Panel (Slide dari Kanan)
function openNotifPanel() {
  document.getElementById("notif-panel").classList.add("open");
  document.getElementById("notif-backdrop").classList.add("open");
}

function closeNotifPanel() {
  document.getElementById("notif-panel").classList.remove("open");
  document.getElementById("notif-backdrop").classList.remove("open");
}
