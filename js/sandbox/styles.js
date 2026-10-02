/* Sàn Demo (ứng dụng mẫu để viết test): CSS và khung HTML của trang. */

const APP_CSS = `
*{box-sizing:border-box}
body{margin:0;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1d2433;background:#f4f6fa}
a{color:#1f5fd1}
.topbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:10px 14px;background:#12325e;color:#fff}
.topbar .logo{color:#fff;font-weight:700;text-decoration:none;margin-right:6px}
.topbar nav{display:flex;gap:10px;flex-wrap:wrap}
.topbar nav a{color:#c9d8f2;text-decoration:none;padding:2px 0;border-bottom:2px solid transparent}
.topbar nav a[aria-current="page"]{color:#fff;border-bottom-color:#ffb020}
.topbar .who{margin-left:auto;font-size:13px}
.topbar .who a{color:#fff}
.page{padding:16px 14px 28px;max-width:860px}
.narrow{max-width:460px}
h1{font-size:20px;margin:0 0 12px}
h2{font-size:16px;margin:0}
.muted{color:#5d6b82}
.small{font-size:12px}
.auth{padding:24px 14px;display:flex;flex-direction:column;align-items:center;gap:12px}
.card{background:#fff;border:1px solid #dde3ec;border-radius:10px;padding:20px;width:100%;max-width:360px}
label{display:block;font-weight:600;font-size:13px;margin:12px 0 4px}
label.check{display:flex;align-items:center;gap:8px;font-weight:400}
input[type=email],input[type=password],input[type=number],input[type=search],input[type=text],select{width:100%;padding:8px 10px;border:1px solid #c5cedb;border-radius:6px;font:inherit;background:#fff}
fieldset{border:1px solid #dde3ec;border-radius:6px;margin:12px 0 0;padding:4px 12px 10px}
legend{font-weight:600;font-size:13px;padding:0 4px}
.btn{display:inline-block;padding:7px 14px;border-radius:6px;border:1px solid #1f5fd1;background:#1f5fd1;color:#fff;font:inherit;font-weight:600;cursor:pointer}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.primary{width:100%;margin-top:14px}
.btn.sm{padding:3px 9px;font-size:12px}
.btn.ghost{background:#fff;color:#1f5fd1}
.btn.danger{background:#c43a31;border-color:#c43a31}
.btn.ghost.danger{background:#fff;color:#c43a31}
.link{display:inline-block;margin-top:12px}
.notice{color:#0b5c39;background:#e1f4ea;border-radius:6px;padding:6px 10px;margin:0 0 4px}
.links{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.error{color:#b42318;background:#fdecea;border-radius:6px;padding:6px 10px;margin:12px 0 0}
.demo-note{font-size:12px;color:#5d6b82;background:#fff8e6;border:1px solid #f2dca5;border-radius:8px;padding:8px 12px;max-width:360px}
.bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 12px}
.bar input{max-width:260px}
.bar label{margin:0}
.bar select{width:auto}
.loading{color:#5d6b82;font-style:italic}
.table-wrap{overflow-x:auto;background:#fff;border:1px solid #dde3ec;border-radius:8px}
table{border-collapse:collapse;width:100%;min-width:520px}
th,td{padding:7px 10px;border-bottom:1px solid #edf0f5;text-align:left;white-space:nowrap}
th{background:#f7f9fc;font-size:12px;color:#5d6b82}
.num{text-align:right;font-variant-numeric:tabular-nums}
.up{color:#0b7a4b}.down{color:#c43a31}.flat{color:#5d6b82}
.actions{text-align:right}
.badge{font-size:12px;padding:1px 8px;border-radius:999px;background:#eef1f6}
.badge.done{background:#e1f4ea;color:#0b7a4b}.badge.wait{background:#fff4dc;color:#8a5a00}.badge.cancel{background:#fdecea;color:#b42318}
.toast{margin-top:14px;padding:10px 12px;border-radius:8px;background:#e1f4ea;color:#0b5c39;font-weight:600}
.overlay{position:fixed;inset:0;background:rgba(15,25,45,.45);display:flex;align-items:center;justify-content:center;padding:16px}
.dialog{background:#fff;border-radius:10px;padding:16px;width:100%;max-width:340px}
.dlg-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.icon{border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:#5d6b82}
.dlg-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.empty-row td{color:#5d6b82;text-align:center}
.__pw-hl{outline:3px solid #e5484d !important;outline-offset:2px}
.__pw-find{outline:3px dashed #7c3aed !important;outline-offset:2px}
.__pw-hover{outline:2px dashed #1f5fd1 !important;outline-offset:1px;cursor:crosshair !important}
`;
const APP_SHELL = '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + APP_CSS + '</style></head><body></body></html>';
