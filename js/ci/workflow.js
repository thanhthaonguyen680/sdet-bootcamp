/* Mô phỏng GitHub Actions: kiểm tra workflow, matrix, chạy job và step. */

/* ---------- Chạy workflow ---------- */
const ciGlob = g => new RegExp('^' + String(g).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');
function ciNormOn(wf){
  let on = wf.on !== undefined ? wf.on : wf[true];
  if (typeof on === 'string') on = { [on]: null };
  else if (Array.isArray(on)) on = Object.fromEntries(on.map(e => [e, null]));
  return on || {};
}
function ciTriggered(wf, ev){
  const on = ciNormOn(wf);
  if (!(ev.event_name in on)) return false;
  const f = on[ev.event_name] || {};
  const br = ev.event_name === 'pull_request' ? ev.base_ref : ev.ref_name;
  if ((ev.event_name === 'push' || ev.event_name === 'pull_request') && f.branches) return [].concat(f.branches).some(g => ciGlob(g).test(br));
  if ((ev.event_name === 'push' || ev.event_name === 'pull_request') && f['branches-ignore']) return ![].concat(f['branches-ignore']).some(g => ciGlob(g).test(br));
  return true;
}
function ciValidate(wf, path){
  const errs = [];
  if (!wf || typeof wf !== 'object' || Array.isArray(wf)){ errs.push('Tệp phải là một object YAML (các cặp key: value).'); return errs; }
  if (wf.on === undefined && wf[true] === undefined) errs.push('Thiếu "on": workflow chưa có sự kiện kích hoạt.');
  if (!wf.jobs || typeof wf.jobs !== 'object' || !Object.keys(wf.jobs).length) errs.push('Thiếu "jobs": workflow phải có ít nhất một job.');
  for (const [id, j] of Object.entries(wf.jobs || {})){
    if (!j || typeof j !== 'object'){ errs.push('Job "' + id + '" không hợp lệ.'); continue; }
    if (!j['runs-on']) errs.push('Job "' + id + '" thiếu "runs-on" (ví dụ runs-on: ubuntu-latest).');
    if (!Array.isArray(j.steps)) errs.push('Job "' + id + '" thiếu "steps" hoặc steps không phải danh sách (mỗi bước bắt đầu bằng dấu -).');
    else j.steps.forEach((s, i) => { if (!s || (s.uses === undefined && s.run === undefined)) errs.push('Job "' + id + '", bước ' + (i + 1) + ': mỗi bước phải có "uses" hoặc "run".'); if (s && s.uses !== undefined && s.run !== undefined) errs.push('Job "' + id + '", bước ' + (i + 1) + ': một bước không được có cả "uses" và "run".'); });
    for (const n of [].concat(j.needs || [])) if (!wf.jobs[n]) errs.push('Job "' + id + '" needs "' + n + '" nhưng không có job nào tên như vậy.');
  }
  const on = ciNormOn(wf);
  if (on.schedule) for (const s of [].concat(on.schedule)){ try { cronParse(s && s.cron); } catch (e){ errs.push('Lịch chạy không hợp lệ: ' + e.message); } }
  return errs;
}
function ciExpandMatrix(m, ctx){
  if (!m) return [null];
  if (typeof m === 'string') m = JSON.parse(ciInterp(m, ctx));
  const keys = Object.keys(m).filter(k => k !== 'include' && k !== 'exclude');
  let combos = [{}];
  for (const k of keys){ const vals = [].concat(m[k]); combos = combos.flatMap(c => vals.map(v => ({ ...c, [k]: v }))); }
  if (!keys.length) combos = [];
  if (m.exclude) combos = combos.filter(c => ![].concat(m.exclude).some(x => Object.entries(x).every(([k, v]) => c[k] === v)));
  if (m.include) for (const inc of [].concat(m.include)){ const hit = combos.filter(c => Object.entries(inc).every(([k, v]) => !(k in c) || c[k] === v)); if (hit.length && Object.keys(inc).some(k => keys.includes(k))) hit.forEach(c => Object.assign(c, inc)); else combos.push({ ...inc }); }
  return combos.length ? combos : [null];
}
let CI_CACHE = new Set();
async function ciRunWorkflow(path, wf, ev, opts){
  const run = { file: path, name: wf.name || path, jobs: [], artifacts: [], notifications: [], conclusion: 'success', warnings: [], dur: 0 };
  const github = { event_name: ev.event_name, ref: ev.ref, ref_name: ev.ref_name, head_ref: ev.head_ref || '', base_ref: ev.base_ref || '', sha: 'a1b2c3d4e5f6', repository: CI_REPO.name, repository_owner: 'thao', actor: 'thao', run_id: String(opts.runId), run_number: '17', workflow: wf.name || path, server_url: 'https://github.com', event: ev.event_name === 'pull_request' ? { pull_request: { number: 42 } } : {} };
  const on = ciNormOn(wf);
  const inputs = {};
  if (ev.event_name === 'workflow_dispatch'){
    const defs = (on.workflow_dispatch && on.workflow_dispatch.inputs) || {};
    for (const [k, d] of Object.entries(defs)) inputs[k] = (opts.inputs && opts.inputs[k] !== undefined) ? opts.inputs[k] : (d && d.default !== undefined ? d.default : '');
  }
  const secretVals = Object.values(CI_REPO.secrets);
  const baseCtx = { github, secrets: { ...CI_REPO.secrets, GITHUB_TOKEN: 'ghs_simulated' }, vars: { ...CI_REPO.vars }, inputs, runner: { os: 'Linux', arch: 'X64', temp: '/home/runner/work/_temp' }, env: {}, matrix: {}, strategy: {}, needs: {}, job: {}, steps: {} };
  let wfEnv = {};
  try { for (const [k, v] of Object.entries(wf.env || {})) wfEnv[k] = String(ciInterp(v, { ...baseCtx, env: wfEnv })); }
  catch (e){ run.conclusion = 'failure'; run.error = e.message; return run; }
  const jobIds = Object.keys(wf.jobs);
  const done = {};
  const pending = new Set(jobIds);
  let guard = 0;
  while (pending.size && guard++ < 50){
    for (const id of [...pending]){
      const j = wf.jobs[id]; const needs = [].concat(j.needs || []);
      if (!needs.every(n => done[n])) continue;
      pending.delete(id);
      const start = needs.length ? Math.max(...needs.map(n => done[n].end)) : 0;
      const needsCtx = Object.fromEntries(needs.map(n => [n, { result: done[n].result, outputs: {} }]));
      const needsOk = needs.every(n => done[n].result === 'success');
      const combosCtx = { ...baseCtx, needs: needsCtx, env: wfEnv };
      let combos;
      try { combos = ciExpandMatrix(j.strategy && j.strategy.matrix, combosCtx); }
      catch (e){ combos = [null]; run.warnings.push('Matrix của job ' + id + ' không hợp lệ: ' + e.message); }
      const failFast = !(j.strategy && j.strategy['fail-fast'] === false);
      const group = [];
      for (const mx of combos){
        const job = { id, key: id, matrix: mx, status: 'success', steps: [], dur: 0, start, summaries: [], installed: [], log: [] };
        const jctx = { ...baseCtx, needs: needsCtx, matrix: mx || {}, env: { ...wfEnv }, __jobOk: needsOk, __cancelled: false };
        let jname = j.name ? ciInterp(j.name, jctx) : id;
        if (mx && !j.name) jname = id + ' (' + Object.values(mx).join(', ') + ')';
        job.key = jname;
        let runIf;
        try { runIf = j.if !== undefined ? ciCond(j.if, jctx) : needsOk; }
        catch (e){ runIf = false; job.log.push(e.message); }
        if (!runIf){ job.status = 'skipped'; job.end = start; group.push(job); continue; }
        const runsOn = ciInterp(j['runs-on'], jctx);
        if (!/^(ubuntu|windows|macos)-(latest|\d)/.test(String(runsOn))){ job.status = 'failure'; job.log.push('Không tìm thấy máy chạy (runner) có nhãn "' + runsOn + '". Dùng ubuntu-latest.'); job.end = start; group.push(job); continue; }
        let jobEnv = { ...wfEnv };
        try { for (const [k, v] of Object.entries(j.env || {})) jobEnv[k] = String(ciInterp(v, { ...jctx, env: jobEnv })); }
        catch (e){ job.status = 'failure'; job.log.push(e.message); job.end = start; group.push(job); continue; }
        const sh = { files: opts.files, env: { CI: 'true', GITHUB_ACTIONS: 'true', GITHUB_REF: ev.ref, GITHUB_EVENT_NAME: ev.event_name, ...jobEnv }, ci: true, checkout: false, deps: false, browsers: new Set(), sysDeps: false, node: 18, fs: new Set(), dirs: {}, time: 0, scenario: opts.scenario, needEnv: opts.needEnv, durScale: opts.durScale, cores: CI_REPO.cores, summaries: [], annotations: [], warnings: run.warnings, notifications: run.notifications, cacheHit: false, log: null };
        const timeout = Number(j['timeout-minutes'] || 360) * 60;
        let jobOk = true, cancelledByTimeout = false;
        for (let si = 0; si < j.steps.length; si++){
          const st = j.steps[si];
          const step = { name: '', status: 'success', log: [], dur: 0, uses: st.uses, run: st.run };
          sh.log = (m) => step.log.push(ciMask(m, secretVals));
          const sctx = { ...jctx, env: { ...jobEnv }, __jobOk: jobOk };
          try {
            step.name = st.name ? ciInterp(st.name, sctx) : st.uses ? 'Run ' + st.uses : 'Run ' + String(st.run).split('\n')[0].slice(0, 60);
            if (cancelledByTimeout){ step.status = 'cancelled'; job.steps.push(step); continue; }
            if (!ciCond(st.if, sctx)){ step.status = 'skipped'; job.steps.push(step); continue; }
            const stepEnv = { ...sh.env };
            for (const [k, v] of Object.entries(st.env || {})) stepEnv[k] = String(ciInterp(v, { ...sctx, env: { ...jobEnv } }));
            const t0 = sh.time;
            const prevEnv = sh.env; sh.env = stepEnv;
            let code = 0;
            if (st.uses){
              const u = String(st.uses); const w = {};
              for (const [k, v] of Object.entries(st.with || {})) w[k] = ciInterp(v, { ...sctx, env: stepEnv });
              code = await ciAction(u, w, sh, run, job);
            } else {
              const script = ciInterp(String(st.run), { ...sctx, env: stepEnv });
              step.log.push('$ ' + ciMask(script.split('\n').join('\n$ '), secretVals));
              code = await ciShell(script, sh);
            }
            sh.env = prevEnv;
            step.dur = sh.time - t0 + 1; sh.time += 1;
            if (code !== 0){ if (st['continue-on-error']){ step.status = 'failure'; step.log.push('(continue-on-error: bỏ qua lỗi, chạy tiếp)'); } else { step.status = 'failure'; jobOk = false; } }
            if (sh.time > timeout){ step.status = 'cancelled'; step.log.push('Error: The operation was canceled.'); job.log.push('Job "' + jname + '" đã chạy quá timeout-minutes (' + (timeout / 60) + ' phút) nên bị hủy.'); jobOk = false; cancelledByTimeout = true; job.timedOut = true; }
          } catch (e){ step.status = 'failure'; step.log.push(e.message); jobOk = false; }
          job.steps.push(step);
        }
        job.dur = sh.time; job.end = start + sh.time; job.status = cancelledByTimeout ? 'cancelled' : jobOk ? 'success' : 'failure';
        job.summaries = sh.summaries; job.installed = [...sh.browsers]; job.annotations = sh.annotations; job.npm = sh.npmInstalled; job.cacheHit = sh.cacheHit; job.merged = sh.merged || 0;
        group.push(job);
      }
      if (failFast && group.length > 1){
        const firstFail = group.filter(g => g.status === 'failure').sort((a, b) => a.end - b.end)[0];
        if (firstFail) for (const g of group) if (g !== firstFail && g.status !== 'skipped' && g.end > firstFail.end){ g.status = 'cancelled'; g.cancelledByFailFast = true; g.end = firstFail.end; g.log.push('Bị hủy vì job "' + firstFail.key + '" trong cùng matrix đã thất bại (fail-fast mặc định là true).'); const cut = firstFail.end - g.start; let tt = 0; for (const s of g.steps){ tt += s.dur; if (tt > cut && s.status === 'success') s.status = 'cancelled'; } }
      }
      run.jobs.push(...group);
      const res = group.some(g => g.status === 'failure') ? 'failure' : group.some(g => g.status === 'cancelled') ? 'cancelled' : group.every(g => g.status === 'skipped') ? 'skipped' : 'success';
      done[id] = { result: res, end: Math.max(start, ...group.map(g => g.end || start)) };
    }
  }
  run.dur = Math.max(0, ...Object.values(done).map(d => d.end));
  run.conclusion = run.jobs.some(j => j.status === 'failure') ? 'failure' : run.jobs.some(j => j.status === 'cancelled') ? 'cancelled' : 'success';
  return run;
}
async function ciAction(uses, w, sh, run, job){
  const log = sh.log;
  const [name, ver] = uses.split('@');
  if (!ver){ log('Error: Unable to resolve action `' + uses + '`, unable to find version (thiếu @v4)'); return 1; }
  switch (name){
    case 'actions/checkout': sh.checkout = true; sh.time += 3; log('Syncing repository: ' + CI_REPO.name + '\nChecking out ref ' + (sh.env.GITHUB_REF || 'refs/heads/main')); return 0;
    case 'actions/setup-node': {
      const v = String(w['node-version'] || '');
      if (v){ const n = v === 'lts/*' || v === 'latest' ? 22 : parseInt(v, 10); if (!n){ log('Error: Không hiểu node-version "' + v + '"'); return 1; } sh.node = n; if (n < 18){ log('Node.js ' + n + ' đã quá cũ: Playwright cần Node.js 18 trở lên.'); return 1; } }
      log('Setup Node.js ' + (sh.node) + '.x');
      if (w.cache){
        if (!sh.checkout){ log('Error: Dependencies lock file is not found in /home/runner/work/sandemo-e2e/sandemo-e2e. Supported file patterns: package-lock.json\n(Hãy đặt actions/checkout trước bước setup-node.)'); return 1; }
        const key = 'npm-' + (sh.env.RUNNER_OS || 'Linux');
        if (CI_CACHE.has(key)){ sh.cacheHit = true; log('Cache restored from key: node-cache-Linux-npm-7f3a…'); }
        else { log('npm cache is not found (lần chạy đầu tiên, cache sẽ được lưu sau job)'); CI_CACHE.add(key); }
      }
      sh.time += 8; return 0;
    }
    case 'actions/upload-artifact': {
      const an = w.name || 'artifact'; const p = String(w.path || '').trim();
      if (!p){ log('Error: Input required and not supplied: path'); return 1; }
      const paths = p.split('\n').map(x => x.trim().replace(/^\.\//, '').replace(/\/$/, '')).filter(Boolean);
      const found = paths.filter(x => sh.fs.has(x));
      if (!found.length){
        const mode = w['if-no-files-found'] || 'warn';
        log((mode === 'error' ? 'Error: ' : 'Warning: ') + 'No files were found with the provided path: ' + p + '. No artifacts will be uploaded.');
        if (mode === 'error') return 1;
        run.warnings.push('Bước upload "' + an + '" không tìm thấy tệp ở ' + p);
        return 0;
      }
      if (ver.replace('v', '') >= '4' && run.artifacts.some(a => a.name === an)){ log('Error: Failed to CreateArtifact: Received non-retryable error: Failed request: (409) Conflict: an artifact with this name already exists on the workflow run\n(Mỗi artifact trong một lần chạy phải có tên khác nhau, ví dụ thêm ${{ matrix.xxx }} vào name.)'); return 1; }
      const kind = found.includes('blob-report') ? 'blob' : found.includes('playwright-report') ? 'html' : 'other';
      run.artifacts.push({ name: an, job: job.key, paths: found, kind, retention: Number(w['retention-days'] || 90) });
      log('Artifact ' + an + ' đã được tải lên (' + found.join(', ') + ')' + (w['retention-days'] ? ', giữ ' + w['retention-days'] + ' ngày' : ''));
      sh.time += 6; return 0;
    }
    case 'actions/download-artifact': {
      const dest = String(w.path || '.').replace(/^\.\//, '').replace(/\/$/, '');
      let list = run.artifacts;
      if (w.name) list = list.filter(a => a.name === w.name);
      else if (w.pattern) list = list.filter(a => ciGlob(w.pattern).test(a.name));
      if (!list.length){ log('Error: Unable to download artifact(s): Artifact not found for name: ' + (w.name || w.pattern || '(tất cả)') + '\n(Job tải artifact phải chạy sau job tạo ra nó: dùng needs.)'); return 1; }
      sh.dirs[dest] = (sh.dirs[dest] || []).concat(list.map(a => a.name));
      log('Đã tải ' + list.length + ' artifact vào ' + (dest || '.') + ': ' + list.map(a => a.name).join(', ')); sh.time += 4; return 0;
    }
    case 'actions/cache': log('Cache ' + (w.key ? 'key: ' + w.key : '')); sh.time += 3; return 0;
    case 'actions/github-script': log('(mô phỏng github-script)'); return 0;
    default: log('Error: Sân tập chưa hỗ trợ action "' + uses + '". Các action có sẵn: actions/checkout, actions/setup-node, actions/upload-artifact, actions/download-artifact, actions/cache.'); return 1;
  }
}
async function ciSimulate(files, eventKey, opts = {}){
  const yaml = await loadYaml();
  const ev = { ...CI_EVENTS[eventKey] };
  const wfPaths = Object.keys(files).filter(p => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p));
  const res = { event: eventKey, eventLabel: ev.label, triggered: [], notTriggered: [], errors: [] };
  if (!wfPaths.length) res.errors.push({ file: '.github/workflows/', message: 'Chưa có tệp workflow nào trong thư mục .github/workflows/' });
  let runId = 9000 + Math.floor(Math.random() * 900);
  for (const p of wfPaths){
    let wf;
    try { wf = yaml.load(files[p]); }
    catch (e){ res.errors.push({ file: p, line: e.mark ? e.mark.line + 1 : 0, message: 'Lỗi cú pháp YAML trong ' + p + (e.mark ? ', dòng ' + (e.mark.line + 1) : '') + ':\n' + (e.reason || e.message) }); continue; }
    if (!wf || (typeof wf === 'object' && !Object.keys(wf).length)){ res.notTriggered.push({ file: p, name: p, reason: 'Tệp đang trống' }); continue; }
    const errs = ciValidate(wf, p);
    if (errs.length){ res.errors.push({ file: p, message: 'Workflow ' + p + ' không hợp lệ:\n  - ' + errs.join('\n  - ') }); continue; }
    if (!ciTriggered(wf, ev)){ res.notTriggered.push({ file: p, name: wf.name || p }); continue; }
    res.triggered.push(await ciRunWorkflow(p, wf, ev, { ...opts, files, runId: runId++ }));
  }
  return res;
}
async function ciLocal(files, command, opts = {}){
  const out = [];
  const sh = { files, env: { ...(opts.env || {}) }, ci: !!(opts.env && opts.env.CI), checkout: true, deps: true, browsers: new Set(['chromium', 'firefox', 'webkit']), sysDeps: true, node: 22, fs: new Set(), dirs: {}, time: 0, scenario: opts.scenario || 'stable', needEnv: opts.needEnv, durScale: opts.durScale, cores: 8, summaries: [], annotations: [], warnings: [], notifications: [], log: m => out.push(m) };
  const code = await ciShell(command, sh);
  return { code, out: out.join('\n'), summary: sh.summaries[sh.summaries.length - 1] || null, summaries: sh.summaries };
}
