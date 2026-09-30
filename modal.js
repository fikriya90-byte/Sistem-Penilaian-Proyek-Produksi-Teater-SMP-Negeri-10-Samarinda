/* ============================================================
   UI / MODAL — modal system + pw toggle + toast
   ============================================================ */
(function(){
'use strict';

window.openModal = function(title, body){
  var m = document.getElementById('modal');
  if (!m) return;
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML = body;
  m.classList.remove('hidden');
  // Fix toggle buttons
  setTimeout(function(){
    document.querySelectorAll('#modal-body .pw-toggle').forEach(function(btn){
      if (!btn.querySelector('svg')){
        btn.innerHTML = window.ico('eye', 16);
      }
    });
  }, 20);
};

window.closeModal = function(){
  document.getElementById('modal').classList.add('hidden');
};

/* Toast */
window.toast = function(msg, type){
  type = type || 'info';
  var bg = type === 'success' ? 'var(--success)' :
           type === 'error' ? 'var(--danger)' :
           type === 'warning' ? 'var(--warning)' : 'var(--primary)';
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);' +
    'background:' + bg + ';color:#fff;padding:12px 22px;border-radius:10px;' +
    'font-size:13px;font-weight:600;z-index:99999;' +
    'box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center;';
  document.body.appendChild(t);
  setTimeout(function(){
    t.style.transition = 'opacity .3s,transform .3s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(function(){ t.remove(); }, 300);
  }, 2400);
};

/* Click outside modal to close */
document.addEventListener('click', function(e){
  if (e.target && e.target.id === 'modal') window.closeModal();
});

/* Modal close button */
document.addEventListener('DOMContentLoaded', function(){
  var closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', window.closeModal);
});

/* PW toggle (delegated) */
document.addEventListener('click', function(e){
  var btn = e.target.closest('.pw-toggle');
  if (!btn) return;
  var targetId = btn.getAttribute('data-target');
  if (!targetId) return;
  var input = document.getElementById(targetId);
  if (!input) return;
  var isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  btn.innerHTML = window.ico(isPw ? 'eyeOff' : 'eye', 16);
});

/* Also handle old .toggle-btn pattern (backward compat) */
document.addEventListener('click', function(e){
  var btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  var input = btn.previousElementSibling;
  if (!input || input.tagName !== 'INPUT') return;
  var isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  btn.innerHTML = window.ico(isPw ? 'eyeOff' : 'eye', 16);
});

console.log('[modal] loaded');
})();
