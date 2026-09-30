/* ============================================================
   CORE / FIREBASE — Init + helpers
   ============================================================ */
(function(){
'use strict';

window.fbReady = false;
window.fb = null;
window.fbError = '';

try {
  if (typeof firebase === 'undefined'){ throw new Error('Firebase SDK tidak termuat'); }
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey === ''){ throw new Error('FIREBASE_CONFIG belum diisi di index.html'); }
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  window.fb = firebase.firestore();
  try { window.fb.enablePersistence({synchronizeTabs:true}).catch(function(){}); } catch(e){}
  window.fbReady = true;
  console.log('[firebase] ready');
} catch(e){
  window.fbError = e.message;
  console.error('[firebase]', e.message);
}

/* Firestore write helpers */
window.fsSet = function(collection, docId, data){
  if (!window.fbReady) return Promise.resolve();
  return window.fb.collection(collection).doc(docId).set(window.U.safeFS(data), { merge: true });
};
window.fsDel = function(collection, docId){
  if (!window.fbReady) return Promise.resolve();
  return window.fb.collection(collection).doc(docId).delete();
};
window.fsGet = function(collection, docId){
  if (!window.fbReady) return Promise.reject(new Error('Firebase belum siap'));
  return window.fb.collection(collection).doc(docId).get();
};

})();
