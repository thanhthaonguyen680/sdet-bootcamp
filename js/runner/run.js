/* Chạy code và chấm bài (nút Chạy, Kiểm tra bài). */

let running = false;
function withLimit(promise, ms, msg){
  let timer;
  const clock = new Promise((_, reject) => { timer = setTimeout(() => { const e = new Error(msg); e.__loop = true; reject(e); }, ms); });
  return Promise.race([promise, clock]).finally(() => clearTimeout(timer));
}
window.addEventListener('unhandledrejection', ev => {
  ev.preventDefault();
  logLine('error', 'Có Promise bị reject nhưng không có .catch() hoặc try/catch nào xử lý:\n' + explain(ev.reason));
});
const LIMIT_MS = 3000;
async function run(withTests, override){
  if (current.ci) return runCI(withTests, override);
  if (current.pw) return runPW(withTests, override);
  if (running) return;
  const ex = current;
  const isExample = typeof override === 'string';
  if (isExample || (withTests && !ex.tests)) withTests = false;
  running = true; runBtn.disabled = true; checkBtn.disabled = true;
  if (!isExample) flushSave();
  const code = isExample ? override : ta.value;
  clearConsole(false);
  if (isExample){ const h = document.createElement('div'); h.className = 'line meta'; h.textContent = 'Kết quả chạy ví dụ:'; consoleEl.appendChild(h); }
  if (withTests){ testsEl.innerHTML = '<p class="empty">Đang chấm…</p>'; badgeEl.hidden = true; showTab('tests'); } else showTab('console');
  if (errLine){ errLine = 0; gutterDirty = true; renderGutter(); }

  const out = []; let sink = null;
  const emit = (kind, args) => {
    let line; try { line = args.map(a => fmt(a, 0, true)).join(' '); } catch (e){ line = String(args); }
    if (sink){ sink.push(line); return; }
    out.push(line); logLine(kind, line);
  };
  const con = { log: (...a) => emit('log', a), info: (...a) => emit('info', a), debug: (...a) => emit('log', a), warn: (...a) => emit('warn', a), error: (...a) => emit('error', a), table: d => emit('log', [d]), clear: () => {} };
  let iter = 0, t0 = 0;
  const guard = () => {
    if ((++iter & 1023) === 0 && performance.now() - t0 > LIMIT_MS){
      const e = new Error('Code chạy quá 3 giây nên đã bị dừng. Có thể vòng lặp không có điểm dừng, hoặc thuật toán quá chậm với dữ liệu lớn.'); e.__loop = true; throw e;
    }
  };
  const tests = [];
  const testFn = (name, fn) => { tests.push({ name, fn }); };
  const capture = fn => { const prev = sink; const buf = []; sink = buf; try { fn(); } finally { sink = prev; } return buf; };

  await new Promise(r => setTimeout(r, 16));
  let body = instrument(code);
  if (withTests) body += '\n;\n' + ex.tests;
  const maxLine = code.split('\n').length;
  let userErr = null;
  t0 = performance.now();
  try {
    const fn = compile(body);
    await withLimit(fn(con, testFn, expect, capture, guard, code, out), 8000,
      'Code chờ quá 8 giây mà chưa chạy xong. Có thể một Promise không bao giờ resolve hoặc reject, hoặc đang await một thứ không bao giờ xong.');
    await new Promise(r => setTimeout(r, 0));
  } catch (e){
    userErr = e;
    const ln = errorLineOf(e, maxLine);
    logLine('error', explain(e) + (ln ? '\n(tại dòng ' + ln + ')' : ''));
    if (ln && !isExample){ errLine = ln; gutterDirty = true; renderGutter(); }
  }
  const ms = Math.round(performance.now() - t0);
  if (!userErr){
    const d = document.createElement('div'); d.className = 'line meta';
    d.textContent = out.length ? 'Chạy xong trong ' + ms + ' ms' : 'Chạy xong trong ' + ms + ' ms nhưng chưa in ra gì. Dùng console.log() để xem kết quả.';
    const empty = consoleEl.querySelector('.empty'); if (empty) empty.remove();
    consoleEl.appendChild(d);
  }

  if (withTests){
    if (userErr){
      renderTestError(userErr);
      setStatus(ex.id, 'fail');
    } else {
      const results = [];
      for (const t of tests){
        iter = 0; t0 = performance.now();
        const prev = sink; sink = [];
        try {
          await withLimit(Promise.resolve().then(() => t.fn()), 8000,
            'Chờ quá 8 giây mà chưa xong. Có thể function không return Promise, hoặc Promise không bao giờ resolve/reject.');
          results.push({ name: t.name, ok: true });
        }
        catch (e){ results.push({ name: t.name, ok: false, msg: explain(e) }); }
        finally { sink = prev; }
      }
      const all = results.length > 0 && results.every(r => r.ok);
      renderResults(results, all);
      setStatus(ex.id, all ? 'pass' : 'fail');
    }
  }
  running = false; runBtn.disabled = false; checkBtn.disabled = false;
}
function renderTestError(e){
  badgeEl.hidden = false; badgeEl.className = 'badge fail'; badgeEl.textContent = 'lỗi';
  testsEl.innerHTML = '<div class="summary fail"><strong>Code đang bị lỗi nên chưa chấm được.</strong><span>Sửa lỗi dưới đây rồi kiểm tra lại.</span></div>' +
    '<ul class="results"><li class="bad"><span class="mark">!</span><div><div class="tmsg">' + esc(explain(e)) + '</div></div></li></ul>';
}
function renderResults(results, all){
  const ok = results.filter(r => r.ok).length;
  badgeEl.hidden = false; badgeEl.className = 'badge ' + (all ? 'pass' : 'fail'); badgeEl.textContent = ok + '/' + results.length;
  const idx = EX.indexOf(current);
  const nextBtn = all && idx < EX.length - 1 ? '<button class="btn small" data-go="' + (idx + 1) + '">Sang bài tiếp</button>' : '';
  let html = '<div class="summary ' + (all ? 'pass' : 'fail') + '"><strong>' + ok + '/' + results.length + ' kiểm tra đạt.</strong><span>' +
    (all ? 'Hoàn thành bài này.' : 'Xem các mục chưa đạt bên dưới.') + '</span>' + nextBtn + '</div><ul class="results">';
  for (const r of results){
    html += '<li class="' + (r.ok ? 'ok' : 'bad') + '"><span class="mark">' + (r.ok ? '✓' : '✕') + '</span><div><div>' + esc(r.name) + '</div>' +
      (r.msg ? '<div class="tmsg">' + esc(r.msg) + '</div>' : '') + '</div></li>';
  }
  testsEl.innerHTML = html + '</ul>';
}
function setStatus(id, s){ if (s) state.status[id] = s; else delete state.status[id]; saveState(); refreshStatus(); }
