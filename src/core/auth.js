/* ============================================================
   SP-PPT Session Management & Role Guard
   ============================================================ */
const Auth = {
  getUser: () => window.currentUser || { type: 'tamu', role: '', name: 'Tamu' },
  getType: function() { return String(Auth.getUser().type || '').toLowerCase(); },
  getRole: function() { return String(Auth.getUser().role || '').toLowerCase(); },
  getCid: function() { return Auth.getUser().classId || window.__currentViewClassId || null; },
  getSid: function() { return Auth.getUser().studentId || null; },
  isGuru: function() { return ['guru', 'admin'].includes(Auth.getType()); },
  isSiswa: function() { return Auth.getType() === 'siswa'; },
  hasAccess: function(rolesArray) {
    return Auth.isGuru() || rolesArray.includes(Auth.getRole());
  },
  getClass: function(cid) {
    if (!window.DB || !window.DB.classes) return null;
    return window.DB.classes.find(c => c.id === cid) || null;
  }
};
window.Auth = Auth;
