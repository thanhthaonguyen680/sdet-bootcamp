/* Bài SQL (tuần 7): chạy SQL thật bằng SQLite trong trình duyệt (sql.js), hiện kết quả thành bảng và chấm bài.

   Bài khai báo:
     sql: {
       data: () => W7_DATA,        // dữ liệu: { bảng: { columns: [['tên cột', 'KIỂU'], ...], rows: [[...], ...] } }
       alt: () => W7_DATA_B,       // không bắt buộc: bộ dữ liệu thứ hai, để câu SQL "chép cứng" kết quả không qua được
       answer: 'SELECT ...',       // đáp án: so kết quả câu SELECT cuối cùng của người học với kết quả đáp án (bài có after: câu lệnh đúng)
       ordered: true,              // so cả thứ tự dòng (bài có ORDER BY)
       after: ['SELECT * FROM users ORDER BY id'],   // bài INSERT/UPDATE/DELETE: so dữ liệu sau khi chạy
     }
     tests: chuỗi các check(...) thêm, dùng được __sql (code đã bỏ comment), R (kết quả của người học), Q(sql) (chạy SQL trên dữ liệu bài) */

const SQLJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/';
let sqlPromise = null;
function loadSQL(){
  if (sqlPromise) return sqlPromise;
  sqlPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SQLJS_BASE + 'sql-wasm.js'; s.async = true;
    s.onload = () => window.initSqlJs({ locateFile: f => SQLJS_BASE + f }).then(resolve, reject);
    s.onerror = () => reject(new Error('Không tải được SQLite'));
    document.head.appendChild(s);
  }).catch(e => { sqlPromise = null; throw e; });
  return sqlPromise;
}

/* ---------- Tô màu cú pháp ---------- */
const SQL_KW = new Set(('select from where and or not in between like is null as order by asc desc limit offset group having distinct join inner left right outer on ' +
  'insert into values update set delete create table begin commit rollback transaction case when then else end union all exists primary key integer text real').split(' '));
function highlightSql(src){
  let out = '', i = 0; const n = src.length;
  const span = (cls, s) => '<span class="' + cls + '">' + esc(s) + '</span>';
  while (i < n){
    const c = src[i];
    if (c === '-' && src[i + 1] === '-'){ let j = src.indexOf('\n', i); if (j < 0) j = n; out += span('c', src.slice(i, j)); i = j; continue; }
    if (c === "'"){ let j = i + 1; while (j < n && !(src[j] === "'" && src[j + 1] !== "'")){ if (src[j] === "'") j++; j++; } out += span('s', src.slice(i, Math.min(j + 1, n))); i = j + 1; continue; }
    if (/[0-9]/.test(c)){ let j = i; while (j < n && /[0-9.]/.test(src[j])) j++; out += span('n', src.slice(i, j)); i = j; continue; }
    if (/[A-Za-z_]/.test(c)){
      let j = i; while (j < n && /\w/.test(src[j])) j++;
      const w = src.slice(i, j); let k = j; while (src[k] === ' ') k++;
      out += SQL_KW.has(w.toLowerCase()) ? span('k', w) : src[k] === '(' ? span('f', w) : esc(w); i = j; continue;
    }
    out += esc(c); i++;
  }
  return out;
}

/* ---------- Database ---------- */
function sqlBuild(SQL, data){
  const db = new SQL.Database();
  for (const [name, t] of Object.entries(data)){
    db.run('CREATE TABLE ' + name + ' (' + t.columns.map(([c, type]) => c + ' ' + type).join(', ') + ')');
    const ins = db.prepare('INSERT INTO ' + name + ' VALUES (' + t.columns.map(() => '?').join(', ') + ')');
    for (const r of t.rows) ins.run(r);
    ins.free();
  }
  return db;
}
// Chạy nhiều câu lệnh; trả về từng kết quả { sql, columns, rows, changed }. Lỗi ném ra kèm câu lệnh gây lỗi.
function sqlExec(db, code){
  const out = [];
  let stmt;
  try {
    for (stmt of db.iterateStatements(code)){
      const sql = stmt.getSQL().trim(), columns = stmt.getColumnNames(), rows = [];
      while (stmt.step()) rows.push(stmt.get());
      out.push({ sql, columns, rows, changed: columns.length ? 0 : db.getRowsModified() });
    }
  } catch (e){
    e.results = out;
    try { e.stmtSql = stmt ? stmt.getSQL().trim() : ''; } catch (_){}
    throw e;
  }
  return out;
}
const sqlLastSelect = res => [...res].reverse().find(r => r.columns.length) || null;
function sqlExplain(msg){
  let m;
  if ((m = msg.match(/no such column: ([\w.]+)/))) return 'Không có cột "' + m[1] + '". Xem tên cột ở tab Dữ liệu. Chuỗi phải đặt trong nháy đơn: \'Chờ khớp\', không phải "Chờ khớp".';
  if ((m = msg.match(/no such table: (\w+)/))) return 'Không có bảng "' + m[1] + '". Các bảng có ở tab Dữ liệu.';
  if ((m = msg.match(/ambiguous column name: ([\w.]+)/))) return 'Cột "' + m[1] + '" có ở nhiều bảng. Hãy ghi rõ bảng, ví dụ orders.' + m[1].split('.').pop() + '.';
  if ((m = msg.match(/near "(.*)": syntax error/))) return 'Lỗi cú pháp ở gần "' + m[1] + '". Kiểm tra thứ tự mệnh đề (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT), dấu phẩy và dấu nháy.';
  if (/incomplete input/.test(msg)) return 'Câu SQL chưa kết thúc: có thể thiếu nháy đóng \' hoặc dấu ngoặc ).';
  if (/misuse of aggregate/.test(msg)) return 'Dùng hàm tổng hợp (COUNT, SUM...) sai chỗ: điều kiện trên kết quả tổng hợp phải đặt trong HAVING, không phải WHERE.';
  return '';
}

/* ---------- Hiển thị kết quả trong Console ---------- */
const SQL_MAX_ROWS = 200;
const sqlCell = v => v === null ? '<span class="sql-null">NULL</span>' : esc(String(v));
function sqlTableHtml(r){
  if (!r.columns.length) return '<div class="line info">' + (/^\s*(insert|update|delete)/i.test(r.sql) ? 'Đã chạy: ' + r.changed + ' dòng bị thay đổi.' : 'Đã chạy.') + '</div>';
  const rows = r.rows.slice(0, SQL_MAX_ROWS);
  return '<div class="sql-result"><div class="sql-meta">' + r.rows.length + ' dòng' + (r.rows.length > SQL_MAX_ROWS ? ' (hiện ' + SQL_MAX_ROWS + ' dòng đầu)' : '') + '</div>' +
    '<div class="sql-scroll"><table class="sql-table"><thead><tr>' + r.columns.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    (rows.length ? rows.map(row => '<tr>' + row.map(v => '<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + sqlCell(v) + '</td>').join('') + '</tr>').join('')
      : '<tr><td colspan="' + r.columns.length + '" class="sql-empty">Không có dòng nào</td></tr>') + '</tbody></table></div></div>';
}
function sqlShow(html){ const d = document.createElement('div'); d.innerHTML = html; consoleEl.appendChild(d); consoleEl.scrollTop = consoleEl.scrollHeight; }

/* ---------- So kết quả ---------- */
const sqlNorm = v => v === null || v === undefined ? null : typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : String(v);
function sqlRowsKey(r, ordered){
  const rows = r.rows.map(row => JSON.stringify(row.map(sqlNorm)));
  return ordered ? rows : rows.slice().sort();
}
function sqlDiff(got, want, ordered){
  if (!got) return 'Chưa có câu SELECT nào trả về kết quả.';
  if (got.columns.length !== want.columns.length) return 'Kết quả cần ' + want.columns.length + ' cột (' + want.columns.join(', ') + '), câu SQL của bạn trả về ' + got.columns.length + ' cột (' + got.columns.join(', ') + ').';
  const g = sqlRowsKey(got, ordered), w = sqlRowsKey(want, ordered);
  if (g.length !== w.length) return 'Kết quả cần ' + w.length + ' dòng, câu SQL của bạn trả về ' + g.length + ' dòng.' + sqlSample(want);
  if (g.join('\n') === w.join('\n')) return null;
  if (ordered && g.slice().sort().join('\n') === w.slice().sort().join('\n')) return 'Đúng các dòng nhưng sai thứ tự. Kiểm tra lại ORDER BY.' + sqlSample(want);
  const miss = JSON.parse(w.find(x => !g.includes(x)) || w[0]);
  return 'Số dòng đúng nhưng nội dung khác. Ví dụ dòng cần có mà chưa thấy: (' + miss.map(v => v === null ? 'NULL' : v).join(', ') + '). Kiểm tra lại điều kiện' + (ordered ? ', ORDER BY' : '') + ' và thứ tự các cột.';
}
const sqlSample = want => want.rows.length ? '\nVài dòng đúng: ' + want.rows.slice(0, 3).map(r => '(' + r.map(v => v === null ? 'NULL' : v).join(', ') + ')').join(' ') : '';

/* ---------- Chạy và chấm ---------- */
async function runSQL(withTests, override){
  if (running) return;
  const ex = current, spec = ex.sql;
  const isExample = typeof override === 'string';
  if (isExample || (withTests && !ex.tests && !spec.answer && !spec.after)) withTests = false;
  running = true; runBtn.disabled = true; checkBtn.disabled = true;
  if (!isExample) flushSave();
  const code = isExample ? override : ta.value;
  const finish = () => { running = false; runBtn.disabled = false; checkBtn.disabled = false; };
  clearConsole(false);
  if (withTests){ testsEl.innerHTML = '<p class="empty">Đang chấm…</p>'; badgeEl.hidden = true; showTab('tests'); } else showTab('console');
  if (isExample) sqlShow('<div class="line meta">Kết quả chạy ví dụ:</div>');

  let SQL;
  try {
    if (!sqlPromise) sqlShow('<div class="line meta">Đang tải SQLite (chỉ lần đầu, khoảng 0.7 MB)…</div>');
    SQL = await loadSQL();
  } catch (e){
    logLine('error', 'Không tải được SQLite. Hãy kiểm tra kết nối mạng rồi thử lại.');
    if (withTests){ renderTestError({ message: 'Không tải được SQLite.' }); setStatus(ex.id, 'fail'); }
    finish(); return;
  }

  const strip = s => s.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  let mine = null, err = null;
  const db = sqlBuild(SQL, spec.data());
  if (!strip(code).trim()) sqlShow('<div class="line meta">Chưa có câu SQL nào. Viết câu SQL rồi bấm Chạy (Ctrl + Enter).</div>');
  else {
    try { mine = sqlExec(db, code); }
    catch (e){ err = e; mine = e.results || []; }
    mine.forEach(r => sqlShow(sqlTableHtml(r)));
    if (err){ const hint = sqlExplain(err.message); logLine('error', 'Lỗi SQL: ' + err.message + (hint ? '\n' + hint : '') + (err.stmtSql ? '\nTrong câu: ' + err.stmtSql.split('\n')[0] : '')); }
  }

  if (withTests){
    const results = [];
    const check = async (name, fn) => {
      try { await fn(); results.push({ name, ok: true }); }
      catch (e){ results.push({ name, ok: false, msg: e.__assert ? e.message : explain(e) }); }
    };
    const fail = msg => { const e = new Error(msg); e.__assert = true; throw e; };
    // Chạy code trên một database mới của bộ dữ liệu; trả về kết quả SELECT cuối và trạng thái bảng (after)
    const outcome = (data, sql) => {
      const d = sqlBuild(SQL, data);
      try {
        const res = sqlExec(d, sql);
        return { last: sqlLastSelect(res), after: (spec.after || []).map(q => sqlExec(d, q)[0]) };
      } finally { d.close(); }
    };
    await check('Câu SQL chạy không lỗi', () => {
      if (!strip(code).trim()) fail('Chưa có câu SQL nào.');
      if (err) fail('Lỗi SQL: ' + err.message + (sqlExplain(err.message) ? '\n' + sqlExplain(err.message) : ''));
    });
    // SQLite tạm chấp nhận "chuỗi" trong nháy kép, nhưng MySQL, PostgreSQL thì báo lỗi: tập dùng nháy đơn ngay từ đầu.
    await check('Chuỗi đặt trong nháy đơn', () => {
      const m = strip(code).match(/(=|<>|!=|\blike|\bin\s*\(|,)\s*("[^"\n]*")/i);
      if (m) fail('Chuỗi ' + m[2] + ' đang đặt trong nháy kép. Trong SQL, chuỗi đặt trong nháy đơn: ' + m[2].replace(/"/g, "'") + '. SQLite tạm chấp nhận nháy kép, nhưng MySQL, PostgreSQL sẽ báo lỗi.');
    });
    const compare = (data, label) => check(label, () => {
      if (err) fail('Sửa lỗi SQL trước.');
      const got = outcome(data, code), want = outcome(data, spec.answer);
      if (spec.answer && !spec.after){ const d = sqlDiff(got.last, want.last, spec.ordered); if (d) fail(d); }
      (spec.after || []).forEach((q, k) => {
        const d = sqlDiff(got.after[k], want.after[k], true);
        if (d) fail('Dữ liệu sau khi chạy chưa đúng (' + q + '):\n' + d);
      });
    });
    if (spec.answer || spec.after) await compare(spec.data(), 'Kết quả đúng với yêu cầu');
    if (spec.alt) await compare(spec.alt(), 'Vẫn đúng khi dữ liệu thay đổi (không chép cứng kết quả)');
    if (ex.tests){
      const R = mine ? sqlLastSelect(mine) : null;
      const Q = sql => { const d = sqlBuild(SQL, spec.data()); try { return sqlLastSelect(sqlExec(d, sql)); } finally { d.close(); } };
      const extra = [];
      try {
        await compile(ex.tests, ['check', 'expect', '__sql', 'R', 'Q'])((name, fn) => extra.push({ name, fn }), expect, strip(code), R, Q);
        for (const g of extra) await check(g.name, g.fn);
      } catch (e){ results.push({ name: 'Bộ chấm', ok: false, msg: explain(e) }); }
    }
    const all = results.length > 0 && results.every(r => r.ok);
    renderResults(results, all);
    setStatus(ex.id, all ? 'pass' : 'fail');
  }
  db.close();
  finish();
}

/* ---------- Tab "Dữ liệu" ---------- */
function sqlDataHtml(ex){
  const data = ex.sql.data();
  return '<p class="app-hint">Các bảng trong database của bài. Câu SQL của bạn chạy trên đúng dữ liệu này; chạy bao nhiêu lần dữ liệu cũng trở lại như ban đầu.</p>' +
    Object.entries(data).map(([name, t]) => '<h3 class="sql-tname">' + esc(name) + ' <span>' + t.rows.length + ' dòng</span></h3>' +
      '<div class="sql-scroll"><table class="sql-table"><thead><tr>' + t.columns.map(([c, type]) => '<th>' + esc(c) + '<small>' + type + '</small></th>').join('') + '</tr></thead><tbody>' +
      t.rows.map(row => '<tr>' + row.map(v => '<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + sqlCell(v) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>').join('');
}
