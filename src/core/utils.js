/* ============================================================
   SP-PPT Utilities & Security Sanitation (Mencegah XSS)
   ============================================================ */
const Utils = {
  esc: function(s) {
    return String(s == null ? '' : s).replace(/[<>&"']/g, function(c){
      return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c];
    });
  },
  sanitizeURL: function(url) {
    if (!url) return '';
    const parsed = String(url).trim();
    if (parsed.startsWith('javascript:') || parsed.startsWith('data:text/html')) return '#';
    return this.esc(parsed);
  },
  formatDate: function(ts) {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};
window.Utils = Utils;
