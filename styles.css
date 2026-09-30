/* ============================================================
   SP-PPT — Sistem Penilaian Proyek Produksi Teater
   ============================================================ */

/* ===== VARIABLES ===== */
:root{
  --bg:#f8f9fa; --bg-gradient:linear-gradient(180deg,#f8f9fa,#eef1f5);
  --card:#fff; --surface:#f1f3f5; --surface-2:#e5e7eb;
  --text:#1f2937; --text-strong:#111827; --text-muted:#6b7280;
  --border:#e5e7eb; --border-strong:#d1d5db;
  --primary:#2563eb; --primary-dark:#1e40af; --primary-light:#3b82f6; --primary-soft:#dbeafe; --primary-glow:rgba(37,99,235,.18);
  --accent:#dc2626; --accent-soft:#fee2e2;
  --success:#10b981; --success-soft:#d1fae5; --warning:#f59e0b; --warning-soft:#fef3c7;
  --danger:#dc2626; --danger-soft:#fee2e2; --info:#0ea5e9; --info-soft:#e0f2fe;
  --shadow-sm:0 1px 2px rgba(0,0,0,.04); --shadow-md:0 4px 12px rgba(0,0,0,.06); --shadow-lg:0 10px 24px rgba(0,0,0,.08);
  --radius:10px; --radius-lg:14px;
  --motif-url:url('https://iili.io/nJ1Rcj1.png');
  --motif-overlay:rgba(248,249,250,.85);
}
[data-theme="dark"]{
  --bg:#0f172a; --bg-gradient:linear-gradient(180deg,#0f172a,#1e293b);
  --card:#1e293b; --surface:#334155; --surface-2:#475569;
  --text:#e2e8f0; --text-strong:#f1f5f9; --text-muted:#94a3b8;
  --border:#334155; --border-strong:#475569;
  --primary:#60a5fa; --primary-dark:#3b82f6; --primary-light:#93c5fd; --primary-soft:rgba(96,165,250,.15); --primary-glow:rgba(96,165,250,.25);
  --accent:#f87171; --accent-soft:rgba(248,113,113,.15);
  --success:#34d399; --success-soft:rgba(52,211,153,.15); --warning:#fbbf24; --warning-soft:rgba(251,191,36,.15);
  --danger:#f87171; --danger-soft:rgba(248,113,113,.15); --info:#38bdf8; --info-soft:rgba(56,189,248,.15);
  --shadow-sm:0 1px 2px rgba(0,0,0,.3); --shadow-md:0 4px 12px rgba(0,0,0,.4); --shadow-lg:0 10px 24px rgba(0,0,0,.5);
  --motif-overlay:rgba(15,23,42,.9);
}

/* ===== RESET ===== */
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Tahoma,sans-serif;-webkit-tap-highlight-color:transparent;}
html{-webkit-text-size-adjust:100%;}
body{
  min-height:100vh;padding:20px;color:var(--text);
  background-color:var(--bg);
  background-image:linear-gradient(var(--motif-overlay),var(--motif-overlay)),var(--motif-url);
  background-size:cover,380px;
  background-position:center,top left;
  background-repeat:no-repeat,repeat;
  background-attachment:fixed,fixed;
  transition:background .3s,color .3s;
  font-size:14px;line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.hidden{display:none !important;}
svg.ico{width:16px;height:16px;display:inline-block;vertical-align:-3px;flex-shrink:0;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}

.container{max-width:1100px;margin:0 auto;background:var(--card);border-radius:var(--radius-lg);border:1px solid var(--border);box-shadow:var(--shadow-lg);overflow:visible;}

/* ===== LOADING ===== */
.loading-overlay{position:fixed;inset:0;background:var(--bg-gradient);display:flex;justify-content:center;align-items:center;z-index:9999;transition:opacity .4s;padding:20px;}
.loading-overlay.fade-out{opacity:0;pointer-events:none;}
.loading-box{text-align:center;padding:30px;background:var(--card);border-radius:var(--radius-lg);border:1px solid var(--border);box-shadow:var(--shadow-lg);min-width:240px;}
.loading-box h3{color:var(--text-strong);font-size:16px;margin-bottom:8px;font-weight:700;}
.loading-box p{color:var(--text-muted);font-size:13px;}
.spinner{width:56px;height:56px;margin:0 auto 20px;border:4px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* ===== AUTH ===== */
.auth-container{max-width:480px;margin:40px auto;}
.auth-box{padding:32px;}
.brand{text-align:center;margin-bottom:24px;}
.brand-logos{display:flex;justify-content:center;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap;}
.brand-logos img{height:64px;width:auto;}
.brand h1{color:var(--text-strong);font-size:18px;margin-bottom:4px;font-weight:700;line-height:1.35;}
.brand p{color:var(--text-muted);font-size:12.5px;}
.theme-wrap{display:flex;justify-content:center;margin-bottom:20px;}
.theme-toggle{display:inline-flex;gap:2px;background:var(--surface);padding:3px;border-radius:8px;}
.theme-toggle button{background:none;border:none;cursor:pointer;color:var(--text-muted);padding:5px 10px;border-radius:6px;font-size:12px;font-weight:600;transition:.15s;font-family:inherit;display:inline-flex;align-items:center;gap:4px;}
.theme-toggle button.active{background:var(--card);color:var(--primary);box-shadow:var(--shadow-sm);}
.tabs{display:flex;gap:2px;background:var(--surface);padding:4px;border-radius:10px;margin-bottom:22px;overflow-x:auto;}
.tab{flex:1;min-width:80px;padding:9px 12px;text-align:center;cursor:pointer;font-weight:600;color:var(--text-muted);border-radius:8px;font-size:13px;transition:.2s;white-space:nowrap;background:none;border:none;font-family:inherit;}
.tab.active{background:var(--card);color:var(--primary);box-shadow:var(--shadow-sm);}
.divider-text{text-align:center;margin:20px 0 0;padding-top:18px;border-top:1px solid var(--border);color:var(--text-muted);font-size:13px;}
.link{color:var(--primary);font-weight:600;cursor:pointer;background:none;border:none;font-size:13px;text-decoration:none;font-family:inherit;}
.link:hover{text-decoration:underline;}

/* ===== APP SHELL ===== */
.app-brand-header{
  display:flex;align-items:center;gap:16px;padding:16px 22px;
  background:linear-gradient(135deg,var(--primary),var(--primary-dark));
  color:#fff;border-radius:var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow:0 2px 12px rgba(37,99,235,.18);
}
.app-brand-header .app-brand-logos{display:flex;gap:10px;flex-shrink:0;align-items:center;}
.app-brand-header .app-brand-logos img{height:56px;width:auto;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,.15));}
.app-brand-header .app-brand-text{flex:1;min-width:0;}
.app-brand-header .app-brand-text h1{font-size:17px;font-weight:800;color:#fff;line-height:1.25;margin:0;}
.app-brand-header .app-brand-text p{font-size:13px;color:rgba(255,255,255,.88);margin-top:3px;font-weight:500;}

.header{background:var(--card);border-bottom:1px solid var(--border);padding:14px 22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
.header-info{min-width:0;flex:1;}
.header h2{font-size:15.5px;font-weight:700;color:var(--text-strong);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.header .user-info{font-size:12.5px;color:var(--text-muted);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.header .user-info b{color:var(--text-strong);}
.header .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}

.content{padding:24px;}

/* ===== BUTTONS ===== */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:13.5px;font-family:inherit;transition:.15s;text-decoration:none;background:var(--surface-2);color:var(--text);min-height:40px;line-height:1.25;}
.btn:hover{background:var(--border-strong);transform:translateY(-1px);}
.btn:active{transform:translateY(0);}
.btn-primary{background:var(--primary);color:#fff;box-shadow:0 2px 6px var(--primary-glow);}
.btn-primary:hover{background:var(--primary-dark);}
.btn-danger{background:var(--danger);color:#fff;}
.btn-success{background:var(--success);color:#fff;}
.btn-warning{background:var(--warning);color:#fff;}
.btn-ghost{background:transparent;color:var(--primary);border:1.5px solid var(--border);}
.btn-ghost:hover{background:var(--primary-soft);}
.btn-sm{padding:6px 12px;font-size:12px;border-radius:6px;min-height:32px;}
.btn-lg{padding:13px 22px;font-size:14.5px;min-height:48px;}
.btn-block{width:100%;}

/* ===== FORM ===== */
.form-group{margin-bottom:16px;}
.form-group label{display:block;margin-bottom:6px;font-weight:600;font-size:13px;color:var(--text-strong);}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:11px 14px;background:var(--card);border:1.5px solid var(--border);border-radius:8px;font-size:16px;font-family:inherit;color:var(--text);transition:.15s;}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-glow);}
.form-group textarea{resize:vertical;min-height:70px;font-size:14px;}
.pw-toggle{position:relative;}
.pw-toggle input{padding-right:42px;}
.pw-toggle .toggle-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:6px;display:flex;align-items:center;}

/* ===== CARD ===== */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:14px;box-shadow:var(--shadow-sm);}
.card h3{margin-bottom:12px;color:var(--text-strong);font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.card-accent{padding-left:22px;position:relative;}
.card-accent::before{content:"";position:absolute;left:0;top:18px;bottom:18px;width:3px;border-radius:0 3px 3px 0;}
.card-accent.blue::before{background:var(--primary);}
.card-accent.green::before{background:var(--success);}
.card-accent.amber::before{background:var(--warning);}
.card-accent.red::before{background:var(--accent);}

/* ===== GRID ===== */
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));}

/* ===== BADGE ===== */
.badge{padding:3px 9px;border-radius:12px;font-size:11px;font-weight:600;display:inline-flex;white-space:nowrap;align-items:center;gap:4px;}
.badge-primary{background:var(--primary-soft);color:var(--primary-dark);}
.badge-success{background:var(--success-soft);color:#065f46;}
.badge-warning{background:var(--warning-soft);color:#92400e;}
.badge-danger{background:var(--danger-soft);color:#991b1b;}
.badge-info{background:var(--info-soft);color:#0369a1;}
.badge-gray{background:var(--surface-2);color:var(--text-muted);}
[data-theme="dark"] .badge-success{color:#6ee7b7;}
[data-theme="dark"] .badge-warning{color:#fcd34d;}
[data-theme="dark"] .badge-danger{color:#fca5a5;}
[data-theme="dark"] .badge-info{color:#7dd3fc;}
[data-theme="dark"] .badge-primary{color:#93c5fd;}

/* ===== ALERT ===== */
.alert{padding:13px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;display:flex;gap:11px;align-items:flex-start;line-height:1.55;border-left:3px solid;}
.alert-info{background:var(--info-soft);color:#0369a1;border-color:var(--info);}
.alert-success{background:var(--success-soft);color:#065f46;border-color:var(--success);}
.alert-warning{background:var(--warning-soft);color:#92400e;border-color:var(--warning);}
.alert-danger{background:var(--danger-soft);color:#991b1b;border-color:var(--danger);}
[data-theme="dark"] .alert-info{color:#7dd3fc;}
[data-theme="dark"] .alert-success{color:#86efac;}
[data-theme="dark"] .alert-warning{color:#fcd34d;}
[data-theme="dark"] .alert-danger{color:#fca5a5;}

/* ===== TABLE ===== */
.table-wrap{overflow-x:auto;margin-top:12px;border-radius:8px;border:1px solid var(--border);-webkit-overflow-scrolling:touch;}
table{width:100%;border-collapse:collapse;font-size:13px;min-width:520px;background:var(--card);}
th,td{padding:12px 14px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap;color:var(--text);}
th{background:var(--surface);color:var(--text-muted);font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;}
tr:last-child td{border-bottom:none;}
code{background:var(--surface);padding:2px 6px;border-radius:4px;font-size:12px;}

/* ===== MODAL ===== */
.modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);display:flex;justify-content:center;align-items:center;z-index:1000;padding:20px;}
.modal-content{background:var(--card);width:100%;max-width:760px;max-height:90vh;overflow-y:auto;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);border:1px solid var(--border);}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--card);z-index:10;}
.modal-header h3{color:var(--text-strong);font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.close-btn{background:transparent;border:none;cursor:pointer;color:var(--text-muted);padding:4px;font-size:22px;line-height:1;display:flex;align-items:center;font-family:inherit;}
.close-btn:hover{color:var(--text-strong);}
#modal-body{padding:22px;}

/* ===== NOTIF PANEL ===== */
.notif-btn{position:relative;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:7px 12px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px;font-family:inherit;}
.notif-btn:hover{background:var(--surface-2);}
.notif-badge{position:absolute;top:-6px;right:-6px;background:var(--danger);color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid var(--card);}
.notif-panel{position:fixed;top:0;right:-420px;width:400px;max-width:100vw;height:100vh;background:var(--card);border-left:1px solid var(--border);z-index:1100;transition:right .3s;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;}
.notif-panel.open{right:0;}
.notif-panel-header{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px;}
.notif-panel-header h3{color:var(--text-strong);font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;margin-right:auto;}
.notif-panel-body{flex:1;overflow-y:auto;padding:16px;}
.notif-item{padding:15px;background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--text-muted);}
.notif-item.unread{border-left-color:var(--primary);background:var(--primary-soft);}
[data-theme="dark"] .notif-item.unread{background:rgba(96,165,250,.08);}
.notif-item .notif-header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;flex-wrap:wrap;}
.notif-item .notif-time{font-size:11px;color:var(--text-muted);}
.notif-item .notif-title{font-weight:700;color:var(--text-strong);font-size:13.5px;margin-bottom:6px;}
.notif-item .notif-from{font-size:11.5px;color:var(--text-muted);margin-bottom:6px;}
.notif-item .notif-msg{font-size:12.5px;color:var(--text);line-height:1.65;margin-bottom:12px;white-space:pre-wrap;}
.notif-item .notif-actions{display:flex;gap:6px;flex-wrap:wrap;}
.notif-item .notif-type{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:12px;font-size:10.5px;font-weight:700;}
.notif-type-tugas{background:var(--info-soft);color:#0369a1;}
.notif-type-instruksi{background:var(--primary-soft);color:var(--primary-dark);}
.notif-type-info{background:var(--success-soft);color:#065f46;}
.notif-type-urgent{background:var(--danger-soft);color:#991b1b;}
.notif-empty{text-align:center;padding:60px 20px;color:var(--text-muted);}
.notif-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.4);z-index:1099;opacity:0;pointer-events:none;transition:.3s;}
.notif-backdrop.open{opacity:1;pointer-events:auto;}

/* ===== PROGRESS ===== */
.progress-container{width:100%;background:var(--surface-2);border-radius:8px;height:10px;overflow:hidden;margin:8px 0;}
.progress-bar{height:100%;background:var(--primary);transition:width .4s;border-radius:8px;}
.progress-bar.complete{background:var(--success);}
.progress-bar.partial{background:linear-gradient(90deg,var(--warning),var(--accent));}
.progress-banner{background:linear-gradient(135deg,var(--primary-soft),#eff6ff);border:1px solid var(--primary-light);padding:20px;border-radius:12px;margin-bottom:16px;}
[data-theme="dark"] .progress-banner{background:linear-gradient(135deg,rgba(96,165,250,.1),rgba(96,165,250,.05));}
.progress-banner h3{color:var(--primary-dark);font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-weight:700;}
[data-theme="dark"] .progress-banner h3{color:#93c5fd;}
.progress-banner .big-count{font-size:32px;font-weight:800;line-height:1;margin:8px 0;color:var(--text-strong);}
.progress-banner .big-count span{font-size:14px;font-weight:500;color:var(--text-muted);margin-left:4px;}
.progress-banner .pct{font-size:13px;color:var(--text-muted);}
.progress-banner .progress-container{background:var(--surface-2);height:12px;}
.progress-banner .progress-bar{background:linear-gradient(90deg,var(--primary),var(--primary-light));}
.target-progress{display:flex;align-items:center;gap:10px;margin:12px 0;padding:10px 14px;background:var(--surface);border-radius:8px;}
.target-progress .label{font-size:12px;color:var(--text-muted);font-weight:600;white-space:nowrap;}
.target-progress .progress-container{flex:1;margin:0;height:7px;}
.target-progress .pct-mini{font-size:12px;font-weight:700;color:var(--primary);white-space:nowrap;}

/* ===== EMPTY STATE ===== */
.empty-state{text-align:center;padding:50px 20px;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:12px;}
.empty-state svg.ico{opacity:.5;}

/* ===== RUBRIC ===== */
.rubric-item{border:1px solid var(--border);border-radius:8px;padding:15px;margin-bottom:12px;background:var(--card);position:relative;}
.rubric-item::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:3px;background:var(--primary);border-radius:0 3px 3px 0;}
.rubric-item h4{color:var(--text-strong);font-size:13.5px;margin-bottom:5px;font-weight:600;padding-left:6px;}
.rubric-item .desc{font-size:12px;color:var(--text-muted);margin-bottom:8px;padding-left:6px;}
.rubric-item .weight-info{display:inline-flex;align-items:center;gap:4px;background:var(--primary-soft);color:var(--primary-dark);padding:3px 9px;border-radius:10px;font-size:10.5px;font-weight:700;margin-left:6px;}
.rubric-item .scale-explain{font-size:11.5px;color:var(--text-muted);margin-top:8px;padding:8px 10px;background:var(--surface);border-left:3px solid var(--info);border-radius:4px;margin-left:6px;}

/* ===== RADIO GROUP ===== */
.radio-group{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px;}
.radio-group label{display:flex;align-items:center;gap:5px;padding:10px 9px;border:1.5px solid var(--border);border-radius:7px;cursor:pointer;font-size:11.5px;background:var(--card);min-height:46px;color:var(--text);}
.radio-group label:hover{border-color:var(--primary);background:var(--primary-soft);}
.radio-group input{accent-color:var(--primary);}
.radio-group label:has(input:checked){background:var(--primary-soft);border-color:var(--primary);color:var(--primary-dark);font-weight:600;}
[data-theme="dark"] .radio-group label:has(input:checked){color:#93c5fd;}
.radio-group label.radio-score{display:flex;align-items:flex-start;gap:8px;padding:10px;font-size:11.5px;line-height:1.35;min-height:auto;text-align:left;}
.radio-group label.radio-score input{margin-top:3px;flex-shrink:0;}
.radio-group label.radio-score div{flex:1;}
.radio-group label.radio-score b{display:block;font-size:12px;margin-bottom:2px;}
.radio-group label.radio-score small{font-size:10.5px;color:var(--text-muted);display:block;}
.radio-group label.radio-score.rs-4:has(input:checked){background:var(--success-soft);border-color:var(--success);}
.radio-group label.radio-score.rs-3:has(input:checked){background:var(--info-soft);border-color:var(--info);}
.radio-group label.radio-score.rs-2:has(input:checked){background:var(--warning-soft);border-color:var(--warning);}
.radio-group label.radio-score.rs-1:has(input:checked){background:var(--danger-soft);border-color:var(--danger);}

/* ===== SCALE GUIDE ===== */
.scale-guide{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:14px;}
.scale-guide-title{font-weight:700;color:var(--text-strong);font-size:12.5px;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.scale-guide-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.scale-guide-item{padding:8px 10px;border-radius:8px;background:var(--card);border:1px solid var(--border);text-align:center;display:flex;flex-direction:column;gap:2px;}
.scale-guide-item b{font-size:18px;font-weight:800;line-height:1;}
.scale-guide-item span{font-size:11.5px;font-weight:700;}
.scale-guide-item small{font-size:10.5px;color:var(--text-muted);line-height:1.35;}
.scale-guide-item.sg-4{background:var(--success-soft);border-color:var(--success);}
.scale-guide-item.sg-4 b{color:var(--success);}
.scale-guide-item.sg-3{background:var(--info-soft);border-color:var(--info);}
.scale-guide-item.sg-3 b{color:var(--info);}
.scale-guide-item.sg-2{background:var(--warning-soft);border-color:var(--warning);}
.scale-guide-item.sg-2 b{color:var(--warning);}
.scale-guide-item.sg-1{background:var(--danger-soft);border-color:var(--danger);}
.scale-guide-item.sg-1 b{color:var(--danger);}

/* ===== SCORE DISPLAY ===== */
.score-display{margin-top:12px;padding:9px 13px;background:var(--success-soft);border-radius:8px;font-size:12px;color:#065f46;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;}
[data-theme="dark"] .score-display{color:#86efac;}
.score-display .value{font-size:16px;font-weight:800;color:var(--success);}

/* ===== STAGE CARD ===== */
.stage-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));margin-bottom:14px;}
.stage-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;position:relative;transition:.15s;box-shadow:var(--shadow-sm);overflow:hidden;}
.stage-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--text-muted);}
.stage-card:hover{border-color:var(--primary);box-shadow:var(--shadow-md);transform:translateY(-2px);}
.stage-card.completed{border-color:var(--success);}
.stage-card.completed::before{background:var(--success);}
.stage-card .stage-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--surface);color:var(--text-strong);border-radius:8px;font-weight:700;font-size:13px;margin-bottom:10px;}
.stage-card.completed .stage-num{background:var(--success-soft);color:#065f46;}
.stage-card h4{color:var(--text-strong);font-size:14px;margin-bottom:5px;font-weight:600;}
.stage-card p{color:var(--text-muted);font-size:12px;}
.stage-card .progress{margin-top:10px;font-size:11.5px;font-weight:600;}
.stage-card .progress.done{color:var(--success);}
.stage-card .progress.pending{color:var(--primary);}

/* ===== STAGE MANAGE ===== */
.stage-manage-item{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--border);border-radius:10px;margin-bottom:10px;background:var(--card);flex-wrap:wrap;}
.stage-manage-item .num{width:36px;height:36px;background:var(--primary-soft);color:var(--primary-dark);border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;}
.stage-manage-item .info{flex:1;min-width:150px;}
.stage-manage-item .info strong{display:block;font-size:14px;color:var(--text-strong);font-weight:600;}
.stage-manage-item .info small{color:var(--text-muted);font-size:12px;display:block;margin-top:2px;}
.stage-manage-item .weight-tag{background:var(--surface);color:var(--text-muted);padding:4px 11px;border-radius:20px;font-size:11px;font-weight:600;}

/* ===== SWITCH ===== */
.switch{position:relative;display:inline-block;width:46px;height:24px;flex-shrink:0;}
.switch input{opacity:0;width:0;height:0;}
.slider{position:absolute;cursor:pointer;inset:0;background:var(--border-strong);transition:.2s;border-radius:24px;}
.slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;transition:.2s;border-radius:50%;box-shadow:var(--shadow-sm);}
input:checked + .slider{background:var(--primary);}
input:checked + .slider:before{transform:translateX(22px);}

/* ===== ACTIVATION ===== */
.activation-item{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--border);border-radius:10px;margin-bottom:10px;background:var(--card);flex-wrap:wrap;}
.activation-item.active{border-left:3px solid var(--success);}
.activation-item.locked{border-left:3px solid var(--text-muted);}
.activation-item .info{flex:1;min-width:150px;}
.activation-item .info strong{display:block;font-size:14px;color:var(--text-strong);}

/* ===== TIMELINE (Lini Massa) ===== */
.lini-massa{background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:16px;overflow:hidden;box-shadow:var(--shadow-sm);}
.lini-massa summary{list-style:none;cursor:pointer;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.lini-massa summary::-webkit-details-marker{display:none;}
.lini-massa summary:hover{background:var(--surface);}
.lini-massa .lm-left{display:flex;align-items:center;gap:14px;flex:1;min-width:200px;}
.lini-massa .lm-icon{width:44px;height:44px;background:var(--primary-soft);color:var(--primary);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.lini-massa .lm-text{flex:1;min-width:150px;}
.lini-massa .lm-text h3{color:var(--text-strong);font-size:14.5px;margin-bottom:2px;font-weight:700;}
.lini-massa .lm-text p{color:var(--text-muted);font-size:12px;}
.lini-massa .lm-right{display:flex;align-items:center;gap:12px;}
.lini-massa .lm-badge{background:var(--surface);color:var(--text-muted);padding:4px 11px;border-radius:20px;font-size:11px;font-weight:600;}
.lini-massa .lm-chevron{color:var(--text-muted);transition:.3s;font-size:14px;}
.lini-massa[open] .lm-chevron{transform:rotate(180deg);}
.lini-massa .lm-body{padding:0 20px 20px;border-top:1px solid var(--border);}

.timeline{position:relative;padding-left:40px;margin:18px 0;}
.timeline::before{content:"";position:absolute;left:11px;top:10px;bottom:10px;width:2px;background:var(--border);}
.timeline-item{position:relative;margin-bottom:16px;}
.timeline-item::before{content:"";position:absolute;left:-33px;top:20px;width:20px;height:20px;border-radius:50%;background:var(--card);border:2px solid var(--border-strong);z-index:1;}
.timeline-item.done::before{background:var(--success);border-color:var(--success);}
.timeline-item.active::before{background:var(--primary);border-color:var(--primary);box-shadow:0 0 0 4px var(--primary-glow);}
.timeline-item .box{border:1px solid var(--border);border-radius:10px;padding:16px;background:var(--card);box-shadow:var(--shadow-sm);}
.timeline-item.active .box{border-left:3px solid var(--primary);}
.timeline-item.done .box{border-left:3px solid var(--success);}
.timeline-item .box .header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
.timeline-item .box h4{color:var(--text-strong);font-size:14.5px;margin-bottom:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-weight:700;}
.timeline-item .box h4 .step-num{background:var(--primary-soft);color:var(--primary-dark);width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;}
.timeline-item.done .box h4 .step-num{background:var(--success-soft);color:#065f46;}
.timeline-item .box .sub{font-size:12px;color:var(--text-muted);margin-bottom:8px;}
.timeline-item .box .desc{font-size:12.5px;color:var(--text);line-height:1.65;}
.timeline-item .box .detail-list{margin-top:10px;padding:10px 12px;background:var(--surface);border-radius:6px;font-size:12px;line-height:1.7;border-left:3px solid var(--primary);}

/* ===== CLASS CODE BOX ===== */
.class-code-box{background:var(--card);border:2px dashed var(--border-strong);border-radius:12px;padding:22px;margin:14px 0;text-align:center;}
.class-code-box .label{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:10px;}
.class-code-box .code{font-size:32px;font-weight:800;color:var(--text-strong);letter-spacing:.2em;font-family:'Courier New',monospace;padding:8px 0;word-break:break-all;}
.class-code-box .hint{font-size:11.5px;color:var(--text-muted);margin-top:10px;}
.class-code-box .action-row{justify-content:center;margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;}

/* ===== ACTION ROW ===== */
.action-row{display:flex;gap:8px;flex-wrap:wrap;}

/* ===== TOOLBAR ===== */
.extras-toolbar-top{border:1px solid var(--primary-soft);background:linear-gradient(135deg,var(--primary-soft),var(--info-soft));padding:14px;display:flex;flex-wrap:wrap;gap:8px;border-radius:10px;margin-bottom:14px;}
.extras-toolbar-top .btn{background:var(--card);border:1px solid var(--border);color:var(--text-strong);}
.extras-toolbar-top .btn:hover{background:var(--primary-soft);color:var(--primary);}
.extras-toolbar-top .btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;border:none;}
.extras-toolbar-top .btn-primary:hover{filter:brightness(1.08);}

/* ===== FLOATING PANDUAN ===== */
.floating-panduan{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:64px;min-height:64px;padding:8px 12px;background:linear-gradient(135deg,#2563eb,#1e40af);color:#fff;border:none;border-radius:50%;cursor:pointer;box-shadow:0 6px 20px rgba(37,99,235,.4);transition:transform .2s,box-shadow .2s;font-family:inherit;font-size:22px;}
.floating-panduan:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 10px 28px rgba(37,99,235,.55);}
.floating-panduan-label{font-size:9px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:#fff;}

/* ===== TEACHER LIST ===== */
.teacher-list-item{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid var(--border);border-radius:9px;margin-bottom:10px;background:var(--card);gap:10px;flex-wrap:wrap;}
.teacher-list-item .info{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}
.teacher-list-item .info strong{display:block;font-size:13.5px;color:var(--text-strong);font-weight:600;}
.teacher-list-item .info small{color:var(--text-muted);font-size:12px;display:block;margin-top:2px;word-break:break-all;}

/* ===== ACTIVITY ===== */
.activity-feed{display:flex;flex-direction:column;gap:6px;margin-top:10px;max-height:400px;overflow-y:auto;padding-right:4px;}
.activity-item{display:flex;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;border-left:3px solid var(--primary);align-items:flex-start;border-bottom:1px solid var(--border);}
.activity-item:last-child{border-bottom:none;}
.activity-icon{width:28px;height:28px;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.activity-content{flex:1;min-width:0;}
.activity-msg{font-size:12.5px;color:var(--text);line-height:1.5;}
.activity-meta{font-size:11px;color:var(--text-muted);margin-top:3px;}
.activity-meta b{color:var(--text-strong);}

/* ===== WELCOME ===== */
.welcome-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--card);border-radius:6px;border-left:3px solid var(--border);margin-bottom:6px;font-size:12.5px;}
.welcome-item.urgent{border-left-color:var(--danger);background:var(--danger-soft);}
.welcome-item.normal{border-left-color:var(--warning);background:var(--warning-soft);}
.welcome-item.done{border-left-color:var(--success);background:var(--success-soft);}

/* ===== STRUCTURE / STRUKTUR ===== */
.struktur-group{margin-bottom:14px;padding:14px;background:var(--card);border:1px solid var(--border);border-radius:10px;}
.struktur-member{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--border);}
.struktur-member.me{background:var(--primary-soft);border-left-color:var(--primary);}
.struktur-avatar{width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
.struktur-info{flex:1;min-width:0;}

/* ===== RESPONSIVE ===== */
@media (max-width:900px){
  body{padding:16px;}
  .content{padding:20px;}
  .grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));}
  .stage-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));}
  .notif-panel{width:380px;}
}
@media (max-width:768px){
  body{padding:12px;background-size:cover,300px;font-size:13.5px;}
  .content{padding:16px;}
  .header{padding:12px 16px;}
  .radio-group{grid-template-columns:repeat(2,1fr);}
  #modal-body{padding:18px;}
  .modal-overlay{padding:12px;}
  .notif-panel{width:340px;}
  .brand-logos img{height:56px;}
  .auth-container{margin:20px auto;}
  .auth-box{padding:26px;}
  .scale-guide-grid{grid-template-columns:repeat(2,1fr);}
  .timeline{padding-left:32px;}
  .app-brand-header{padding:14px 18px;gap:12px;}
  .app-brand-header .app-brand-logos img{height:48px;}
  .app-brand-header .app-brand-text h1{font-size:15px;}
  .app-brand-header .app-brand-text p{font-size:12px;}
}
@media (max-width:480px){
  body{padding:8px;background-size:cover,200px;}
  .container{border-radius:12px;}
  .auth-container{margin:0 auto;max-width:100%;}
  .auth-box{padding:20px 16px;}
  .brand h1{font-size:16px;}
  .brand-logos img{height:44px;}
  .header{padding:12px 14px;flex-direction:column;align-items:stretch;gap:10px;}
  .header .actions{width:100%;display:flex;gap:6px;flex-wrap:wrap;}
  .header .actions .btn{flex:1;font-size:11.5px;padding:7px 10px;min-height:34px;}
  .content{padding:12px;}
  .card{padding:14px;}
  .grid{grid-template-columns:1fr;}
  .stage-grid{grid-template-columns:1fr;}
  .radio-group{grid-template-columns:1fr 1fr;gap:6px;}
  .action-row .btn{flex:1;font-size:12px;min-width:0;}
  table{font-size:12px;min-width:460px;}
  th,td{padding:10px 10px;}
  .notif-panel{width:100vw;border-left:none;}
  .class-code-box{padding:16px;}
  .class-code-box .code{font-size:22px;letter-spacing:.1em;}
  .app-brand-header{padding:12px 14px;gap:10px;border-radius:12px 12px 0 0;}
  .app-brand-header .app-brand-logos{gap:6px;}
  .app-brand-header .app-brand-logos img{height:40px;}
  .app-brand-header .app-brand-text h1{font-size:13px;}
  .app-brand-header .app-brand-text p{font-size:11px;}
  .scale-guide-grid{grid-template-columns:1fr 1fr;gap:5px;}
  .timeline{padding-left:26px;}
  .timeline::before{left:7px;}
  .timeline-item::before{left:-23px;width:14px;height:14px;top:20px;}
  .timeline-item .box{padding:12px;}
  .floating-panduan{bottom:16px;right:16px;min-width:54px;min-height:54px;padding:6px 10px;font-size:18px;}
  .floating-panduan-label{font-size:8px;}
}
