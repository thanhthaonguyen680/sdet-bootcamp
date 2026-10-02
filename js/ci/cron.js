/* Mô phỏng GitHub Actions: lịch chạy cron. */

/* ---------- Cron ---------- */
const CRON_DOW = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
function cronField(s, min, max, names){
  const set = new Set();
  for (const part of String(s).split(',')){
    let [rng, step] = part.split('/'); step = step ? Number(step) : 1;
    if (!(step > 0)) throw new Error('bước nhảy không hợp lệ trong "' + s + '"');
    let lo, hi;
    const val = x => { const u = x.toUpperCase(); if (names && u in names) return names[u]; const n = Number(x); if (!Number.isInteger(n)) throw new Error('giá trị "' + x + '" không hợp lệ'); return n; };
    if (rng === '*'){ lo = min; hi = max; }
    else if (rng.includes('-')){ const [a, b] = rng.split('-'); lo = val(a); hi = val(b); }
    else { lo = val(rng); hi = part.includes('/') ? max : lo; }
    if (lo < min || hi > max || lo > hi) throw new Error('giá trị ngoài khoảng ' + min + '-' + max + ' trong "' + s + '"');
    for (let v = lo; v <= hi; v += step) set.add(v === 7 && max === 7 ? 0 : v);
  }
  return set;
}
function cronParse(expr){
  if (typeof expr !== 'string' || !expr.trim()) throw new Error('thiếu biểu thức cron');
  const f = expr.trim().split(/\s+/);
  if (f.length !== 5) throw new Error('"' + expr + '" phải có đúng 5 phần: phút giờ ngày tháng thứ');
  return { min: cronField(f[0], 0, 59), hour: cronField(f[1], 0, 23), dom: cronField(f[2], 1, 31), mon: cronField(f[3], 1, 12), dow: cronField(f[4], 0, 7, CRON_DOW), domStar: f[2] === '*', dowStar: f[4] === '*' };
}
function cronNext(expr, n = 5, from = new Date()){
  const c = cronParse(expr); const out = [];
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), from.getUTCHours(), from.getUTCMinutes() + 1));
  for (let guard = 0; guard < 600000 && out.length < n; guard++){
    const dayOk = (c.domStar && c.dowStar) ? true : c.domStar ? c.dow.has(d.getUTCDay()) : c.dowStar ? c.dom.has(d.getUTCDate()) : (c.dom.has(d.getUTCDate()) || c.dow.has(d.getUTCDay()));
    if (!c.mon.has(d.getUTCMonth() + 1) || !dayOk){ d.setUTCDate(d.getUTCDate() + 1); d.setUTCHours(0, 0); continue; }
    if (!c.hour.has(d.getUTCHours())){ d.setUTCHours(d.getUTCHours() + 1, 0); continue; }
    if (c.min.has(d.getUTCMinutes())) out.push(new Date(d));
    d.setUTCMinutes(d.getUTCMinutes() + 1);
  }
  return out;
}
const VN_DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const fmtCronDate = (d, off) => { const x = new Date(d.getTime() + off * 3600000); return VN_DAYS[x.getUTCDay()] + ' ' + String(x.getUTCDate()).padStart(2, '0') + '/' + String(x.getUTCMonth() + 1).padStart(2, '0') + ' ' + String(x.getUTCHours()).padStart(2, '0') + ':' + String(x.getUTCMinutes()).padStart(2, '0'); };
