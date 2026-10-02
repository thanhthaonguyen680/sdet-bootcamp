/* Khung mô phỏng GitHub Actions trong giao diện và chấm điểm bài CI. */

/* ---------- Khung Pipeline ---------- */
let ciLast = null, ciSel = 0;
const CI_ICON = { success: '✓', failure: '✕', cancelled: '⊘', skipped: '↷', running: '…' };
const CI_WORD = { success: 'thành công', failure: 'thất bại', cancelled: 'bị hủy', skipped: 'bỏ qua' };
function ciPaneSetup(ex){
  const pane = document.getElementById('ciPane');
  const ev = document.getElementById('ciEvent'), sc = document.getElementById('ciScenario');
  if (!ev.options.length){
    ev.innerHTML = Object.entries(CI_EVENTS).map(([k, e]) => '<option value="' + k + '">' + esc(e.label) + '</option>').join('');
    sc.innerHTML = Object.entries(CI_SCENARIOS).map(([k, v]) => '<option value="' + k + '">' + esc(v) + '</option>').join('');
    ev.addEventListener('change', () => { ciRenderInputs(); ciRenderCron(); });
    document.getElementById('ciRun').addEventListener('click', () => run(false));
    const cmd = document.getElementById('ciCmd');
    const go = () => { const v = cmd.value.trim(); if (v) ciTerminal(v); };
    document.getElementById('ciCmdRun').addEventListener('click', go);
    cmd.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); go(); } });
    document.getElementById('ciOut').addEventListener('click', e => { const b = e.target.closest('[data-job]'); if (b){ ciSel = b.dataset.job; ciRenderResult(ciLast); } });
  }
  const term = ex.ciMode === 'terminal';
  document.getElementById('ciControls').hidden = term;
  document.getElementById('ciScenarioTerm').hidden = !term;
  if (term) document.getElementById('ciScenarioTerm').appendChild(document.getElementById('ciScenarioWrap'));
  else document.getElementById('ciControls').insertBefore(document.getElementById('ciScenarioWrap'), document.getElementById('ciRun'));
  ev.value = ex.defaultEvent || 'push-main';
  sc.value = ex.defaultScenario || 'stable';
  document.getElementById('ciCmd').placeholder = ex.cmdHint || 'npx playwright test';
  document.getElementById('ciOut').innerHTML = '<p class="muted-s">' + (term ? 'Bài này chạy trên máy của bạn (terminal), chưa có pipeline. Bấm Chạy để chạy các lệnh mẫu, hoặc tự gõ lệnh bên dưới.' : 'Chọn sự kiện và kịch bản code rồi bấm Chạy pipeline (hoặc nút Chạy trên thanh công cụ).') + '</p>';
  ciLast = null;
  ciRenderInputs(); ciRenderCron();
}
function ciFiles(){ if (proj){ projSync(); return { ...proj.files }; } return {}; }
async function ciWorkflows(files){
  let y; try { y = await loadYaml(); } catch (e){ return []; }
  const out = [];
  for (const p of Object.keys(files).filter(p => /^\.github\/workflows\//.test(p))){ try { const w = y.load(files[p]); if (w && typeof w === 'object') out.push({ p, w }); } catch (e){} }
  return out;
}
async function ciRenderInputs(){
  const box = document.getElementById('ciInputs');
  if (document.getElementById('ciEvent').value !== 'dispatch' || !current.ci){ box.hidden = true; box.innerHTML = ''; return; }
  const defs = {};
  for (const { w } of await ciWorkflows(ciFiles())){ const on = ciNormOn(w); if (on.workflow_dispatch && on.workflow_dispatch.inputs) Object.assign(defs, on.workflow_dispatch.inputs); }
  if (!Object.keys(defs).length){ box.hidden = false; box.innerHTML = '<span class="muted-s">Workflow chưa khai báo inputs cho workflow_dispatch.</span>'; return; }
  box.innerHTML = Object.entries(defs).map(([k, d]) => {
    d = d || {};
    const lab = '<label class="ci-in"><span>' + esc(k) + '</span>';
    if (d.type === 'choice' && Array.isArray(d.options)) return lab + '<select data-input="' + esc(k) + '">' + d.options.map(o => '<option' + (String(o) === String(d.default) ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select></label>';
    if (d.type === 'boolean') return lab + '<input type="checkbox" data-input="' + esc(k) + '"' + (d.default ? ' checked' : '') + '></label>';
    return lab + '<input type="text" data-input="' + esc(k) + '" value="' + esc(d.default ?? '') + '"></label>';
  }).join('');
  box.hidden = false;
}
function ciReadInputs(){ const o = {}; document.querySelectorAll('#ciInputs [data-input]').forEach(el => { o[el.dataset.input] = el.type === 'checkbox' ? el.checked : el.value; }); return o; }
async function ciRenderCron(){
  const box = document.getElementById('ciCron');
  if (!current.ci){ box.hidden = true; return; }
  const rows = [];
  for (const { p, w } of await ciWorkflows(ciFiles())){
    const on = ciNormOn(w);
    for (const s of [].concat(on.schedule || [])){
      if (!s || !s.cron) continue;
      try { const next = cronNext(s.cron, 3); rows.push('<div><code>' + esc(s.cron) + '</code> <span class="muted-s">(' + esc(p.split('/').pop()) + ')</span><ul>' + next.map(d => '<li>' + fmtCronDate(d, 0) + ' UTC · <b>' + fmtCronDate(d, 7) + ' giờ Việt Nam</b></li>').join('') + '</ul></div>'); }
      catch (e){ rows.push('<div class="bad">Cron "' + esc(s.cron) + '": ' + esc(e.message) + '</div>'); }
    }
  }
  box.hidden = !rows.length;
  box.innerHTML = rows.length ? '<div class="ci-cron-title">Lịch chạy sắp tới</div>' + rows.join('') : '';
}
function ciRenderResult(res){
  const out = document.getElementById('ciOut');
  if (!res){ return; }
  let html = '<div class="ci-meta">Sự kiện: <b>' + esc(res.eventLabel) + '</b> · Kịch bản: ' + esc(CI_SCENARIOS[res.scenario] || '') + '</div>';
  for (const e of res.errors) html += '<div class="ci-error"><b>Workflow không chạy được</b><pre>' + esc(e.message) + '</pre></div>';
  if (!res.triggered.length && !res.errors.length) html += '<div class="ci-note">Không có workflow nào được kích hoạt bởi sự kiện này. Kiểm tra phần <code>on:</code> (tên sự kiện, bộ lọc <code>branches</code>).</div>';
  res.triggered.forEach((r, ri) => {
    html += '<div class="ci-run"><div class="ci-run-head"><span class="ci-st st-' + r.conclusion + '">' + CI_ICON[r.conclusion] + '</span><div><b>' + esc(r.name) + '</b><div class="muted-s">' + esc(r.file) + ' · ' + CI_WORD[r.conclusion] + ' sau ' + fmtDur(r.dur) + '</div></div></div>';
    html += '<div class="ci-jobs">' + r.jobs.map((j, ji) => { const key = ri + ':' + ji; return '<button type="button" class="ci-job st-' + j.status + (String(ciSel) === key ? ' on' : '') + '" data-job="' + key + '"><span class="ci-ic">' + CI_ICON[j.status] + '</span><span>' + esc(j.key) + '</span><span class="ci-dur">' + (j.status === 'skipped' ? '' : fmtDur(j.dur)) + '</span></button>'; }).join('') + '</div>';
    const selJob = (() => { const [a, b] = String(ciSel).split(':').map(Number); if (a === ri && r.jobs[b]) return r.jobs[b]; return null; })();
    if (selJob){
      html += '<div class="ci-steps"><div class="ci-steps-title">' + esc(selJob.key) + '</div>' + (selJob.log.length ? '<div class="ci-joblog">' + esc(selJob.log.join('\n')) + '</div>' : '') +
        (selJob.status === 'skipped' ? '<p class="muted-s">Job bị bỏ qua (điều kiện if không thỏa, hoặc job nó phụ thuộc qua needs không thành công).</p>' : '') +
        selJob.steps.map(s => '<details class="ci-step st-' + s.status + '"' + (s.status === 'failure' ? ' open' : '') + '><summary><span class="ci-ic">' + CI_ICON[s.status] + '</span><span class="ci-sn">' + esc(s.name) + '</span><span class="ci-dur">' + (s.status === 'skipped' ? '' : fmtDur(s.dur)) + '</span></summary><pre>' + esc(s.log.join('\n') || (s.status === 'skipped' ? '(bỏ qua do điều kiện if)' : '')) + '</pre></details>').join('') + '</div>';
    }
    if (r.artifacts.length) html += '<div class="ci-arts"><b>Artifacts</b>' + r.artifacts.map(a => '<div class="ci-art">📦 ' + esc(a.name) + ' <span class="muted-s">(' + esc(a.paths.join(', ')) + ', giữ ' + a.retention + ' ngày)</span></div>').join('') + '</div>';
    if (r.notifications.length) html += '<div class="ci-arts"><b>Thông báo đã gửi</b>' + r.notifications.map(n => '<div class="ci-art">🔔 ' + esc(ciMask(n.url, Object.values(CI_REPO.secrets))) + '<br><code>' + esc(n.body || '') + '</code></div>').join('') + '</div>';
    const ann = r.jobs.flatMap(j => j.annotations || []);
    if (ann.length) html += '<div class="ci-arts"><b>Annotations</b>' + ann.slice(0, 6).map(a => '<div class="ci-art bad">✕ ' + esc(a.text) + '</div>').join('') + '</div>';
    if (r.warnings.length) html += '<div class="ci-warn">' + [...new Set(r.warnings)].map(w => '⚠ ' + esc(w)).join('<br>') + '</div>';
    html += '</div>';
  });
  if (res.notTriggered.length) html += '<div class="muted-s ci-nt">Không kích hoạt: ' + res.notTriggered.map(n => esc(n.name) + (n.reason ? ' (' + esc(n.reason) + ')' : '')).join(', ') + '</div>';
  out.innerHTML = html;
}
async function ciTerminal(cmd){
  if (running) return;
  running = true;
  try {
    showTab('console');
    logLine('info', '$ ' + cmd);
    try { await loadTS(); } catch (e){ logLine('error', 'Không tải được bộ dịch TypeScript (cần để đọc playwright.config.ts).'); return; }
    const r = await ciLocal(ciFiles(), cmd, { scenario: document.getElementById('ciScenario').value, needEnv: current.needEnv, durScale: current.durScale });
    if (r.out) logLine(r.code ? 'error' : 'log', r.out);
    const d = document.createElement('div'); d.className = 'line meta'; d.textContent = 'exit code ' + r.code; consoleEl.appendChild(d);
  } finally { running = false; }
}

async function runCI(withTests, override){
  if (running) return;
  const ex = current;
  const isExample = typeof override === 'string';
  if (isExample || (withTests && !ex.tests)) withTests = false;
  running = true; runBtn.disabled = true; checkBtn.disabled = true;
  if (!isExample) flushSave();
  let files;
  if (isExample){
    files = { ...ex.files };
    if (/^\s*\/\/\s*@file:/m.test(override)){ const add = splitMarked(override); if (Object.keys(add).some(k => k.startsWith('.github/workflows/'))) for (const k of Object.keys(files)) if (k.startsWith('.github/workflows/')) delete files[k]; Object.assign(files, add); }
    else { for (const k of Object.keys(files)) if (k.startsWith('.github/workflows/')) delete files[k]; files['.github/workflows/vi-du.yml'] = override; }
  } else files = ciFiles();
  clearConsole(false);
  const meta = t => { const d = document.createElement('div'); d.className = 'line meta'; d.textContent = t; consoleEl.appendChild(d); };
  if (isExample) meta('Kết quả chạy ví dụ:');
  if (withTests){ testsEl.innerHTML = '<p class="empty">Đang chấm…</p>'; badgeEl.hidden = true; showTab('tests'); } else showTab('console');
  if (errLine){ errLine = 0; gutterDirty = true; renderGutter(); }
  if (briefView !== 'ci'){ briefView = 'ci'; renderBrief(); }
  const finish = () => { running = false; runBtn.disabled = false; checkBtn.disabled = false; };
  try {
    try { await Promise.all([loadYaml(), loadTS()]); }
    catch (e){ logLine('error', 'Không tải được thư viện cần thiết (YAML/TypeScript). Hãy kiểm tra kết nối mạng.'); if (withTests){ renderTestError({ message: 'Không tải được thư viện.', __assert: true }); } return; }
    const scenario = document.getElementById('ciScenario').value;
    if (ex.ciMode === 'terminal'){
      for (const cmd of ex.runCommands || []){
        logLine('info', '$ ' + cmd);
        const r = await ciLocal(files, cmd, { scenario, needEnv: ex.needEnv, durScale: ex.durScale });
        if (r.out) logLine(r.code ? 'error' : 'log', r.out);
        meta('exit code ' + r.code);
      }
    } else {
      const res = await ciSimulate(files, document.getElementById('ciEvent').value, { scenario, inputs: ciReadInputs(), needEnv: ex.needEnv, durScale: ex.durScale });
      res.scenario = scenario;
      ciLast = res;
      const firstBad = res.triggered.map((r, ri) => { const ji = r.jobs.findIndex(j => j.status === 'failure' || j.status === 'cancelled'); return ji >= 0 ? ri + ':' + ji : null; }).find(Boolean);
      ciSel = firstBad || (res.triggered.length ? '0:0' : 0);
      ciRenderResult(res); ciRenderCron();
      for (const e of res.errors){ logLine('error', e.message); if (!isExample && e.line && proj && proj.files[e.file] !== undefined){ openFile(e.file); errLine = e.line; gutterDirty = true; renderGutter(); } }
      for (const r of res.triggered){
        logLine(r.conclusion === 'success' ? 'info' : 'error', (r.conclusion === 'success' ? '✓ ' : '✕ ') + r.name + ' (' + r.file + '): ' + CI_WORD[r.conclusion] + ' sau ' + fmtDur(r.dur));
        for (const j of r.jobs) meta('   ' + CI_ICON[j.status] + ' ' + j.key + (j.status === 'skipped' ? ' (bỏ qua)' : ' · ' + fmtDur(j.dur)));
      }
      if (!res.triggered.length && !res.errors.length) meta('Không có workflow nào được kích hoạt bởi sự kiện "' + res.eventLabel + '".');
      if (res.triggered.length) meta('Xem chi tiết từng job, từng bước và log trong tab Pipeline.');
    }
    if (withTests){
      const grades = [];
      const check = (name, fn) => grades.push({ name, fn });
      const H = {
        run: async (eventKey, o = {}) => { const r = await ciSimulate(files, eventKey, { scenario: o.scenario || 'stable', inputs: o.inputs, needEnv: ex.needEnv, durScale: ex.durScale }); r.scenario = o.scenario || 'stable'; return r; },
        local: (cmd, o = {}) => ciLocal(files, cmd, { env: o.env, scenario: o.scenario || 'stable', needEnv: ex.needEnv, durScale: ex.durScale }),
        config: (env) => ciConfig(files, env || {}),
        yaml: async (p) => { const y = await loadYaml(); if (files[p] === undefined) assertFail('Chưa có tệp ' + p); try { return y.load(files[p]) || {}; } catch (e){ assertFail('Lỗi cú pháp YAML trong ' + p + (e.mark ? ', dòng ' + (e.mark.line + 1) : '') + ': ' + (e.reason || e.message)); } },
        pkg: () => { try { return ciPkg(files); } catch (e){ assertFail(e.message); } },
        cronNext: (e, n) => { try { return cronNext(e, n); } catch (er){ assertFail('Cron "' + e + '" không hợp lệ: ' + er.message); } },
        on: (w) => ciNormOn(w),
      };
      try {
        const gfn = compile(ex.tests, ['check', 'expect', 'H', '__files', '__source']);
        await gfn(check, expect, H, files, joinMarked(files));
        const results = [];
        for (const g of grades){
          try { await withLimit(Promise.resolve().then(() => g.fn()), 30000, 'Chấm quá lâu.'); results.push({ name: g.name, ok: true }); }
          catch (e){ results.push({ name: g.name, ok: false, msg: e.__assert || e.__pw ? e.message : explain(e) }); }
        }
        const all = results.length > 0 && results.every(r => r.ok);
        renderResults(results, all); setStatus(ex.id, all ? 'pass' : 'fail');
      } catch (e){ renderTestError(e); setStatus(ex.id, 'fail'); }
    }
  } finally { finish(); }
}
