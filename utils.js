/* ============================================================
   CORE / UTILS — Helper, Escape, Log
   ============================================================ */
(function(){
'use strict';

window.U = {
  /* Escape HTML */
  esc: function(v){
    return String(v == null ? '' : v).replace(/[<>&"']/g, function(c){
      return { '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c];
    });
  },

  /* Trim + normalize */
  trim: function(v){ return String(v == null ? '' : v).trim(); },
  normEmail: function(v){ return String(v || '').trim().toLowerCase(); },
  normPhone: function(v){ return String(v || '').trim().replace(/\D/g, ''); },

  /* Unique ID */
  uid: function(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6); },

  /* Format date */
  fmtDate: function(ts){
    if (!ts) return '-';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '-';
    var bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return d.getDate() + ' ' + bln[d.getMonth()] + ' ' + d.getFullYear() + ', ' + hh + ':' + mm;
  },

  fmtDateShort: function(s){
    if (!s) return '-';
    var d = new Date(s);
    if (isNaN(d.getTime())) return '-';
    var bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return d.getDate() + ' ' + bln[d.getMonth()] + ' ' + d.getFullYear();
  },

  /* Format time HH:MM */
  fmtTime: function(d){
    d = d instanceof Date ? d : new Date(d);
    if (isNaN(d.getTime())) return '--:--';
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  },

  /* Safe parse JSON */
  safeJson: function(str, fb){
    if (!str) return fb;
    try { var p = JSON.parse(str); return p == null ? fb : p; } catch(e){ return fb; }
  },

  /* Storage */
  getLS: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  setLS: function(k, v){ try { localStorage.setItem(k, v); return true; } catch(e){ return false; } },
  delLS: function(k){ try { localStorage.removeItem(k); } catch(e){} },

  /* Safe firestore sanitize */
  safeFS: function(obj){
    if (obj instanceof Date) return obj.toISOString();
    if (obj === undefined || obj === null) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(window.U.safeFS).filter(function(v){ return v !== undefined; });
    var clean = {};
    for (var k in obj){
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var v = obj[k];
      if (v === undefined) continue;
      clean[k] = window.U.safeFS(v);
    }
    return clean;
  },

  /* Validate URL */
  isUrl: function(u){
    return /^https?:\/\/[^\s]+/i.test(String(u || '').trim());
  },

  /* Profanity filter (basic) */
  BAD: ['anjing','bangsat','kontol','memek','ngentot','jancok','bacot','bego','goblok','idiot','tolol','setan','babi','monyet'],
  hasProfanity: function(t){
    if (!t) return false;
    var s = ' ' + String(t).toLowerCase().replace(/[^a-z0-9 ]/g, ' ') + ' ';
    return window.U.BAD.some(function(w){ return s.indexOf(' ' + w + ' ') >= 0; });
  },
  sanitize: function(t){
    if (!t) return '';
    var s = String(t);
    window.U.BAD.forEach(function(w){
      s = s.replace(new RegExp('\\b' + w + '\\b', 'gi'), '***');
    });
    return s;
  },

  /* WA Format phone */
  waPhone: function(p){
    p = String(p || '').replace(/\D/g, '');
    if (!p) return '';
    if (p.charAt(0) === '0') p = '62' + p.substring(1);
    if (p.substring(0, 2) !== '62') p = '62' + p;
    return p;
  },

  /* WA Link generator */
  waLink: function(phone, msg){
    var p = window.U.waPhone(phone);
    if (!p) return '';
    return 'https://wa.me/' + p + '?text=' + encodeURIComponent(msg || '');
  }
};

console.log('[utils] loaded');
})();
